#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Thin CLI for local Webentor setup operations.
 *
 * This command is intentionally dependency-free so it can run before Composer/npm
 * are installed in freshly cloned starter projects.
 */

/**
 * Closed set of `stack` values for .webikon/project.json.
 *
 * Layout (bedrock vs classic) is deliberately NOT encoded here — the reporter
 * derives it at runtime, so a project cannot declare one thing and be another.
 */
const PROJECT_STACKS = [
    'webentor-v2',         // full v2 stack, starter lineage
    'webentor-v2-hybrid',  // consumes core v2, no starter lineage
    'webentor-v1',         // legacy v1 theme
    'sage',                // Sage/Acorn, no webentor-core
    'classic',             // plain WP
];

const ENV_SETUP_DEFAULTS = [
    'SETUP_INTERACTIVE' => 'true',
    'SETUP_ENV_CHECK'   => 'true',
    'SETUP_1PASSWORD'   => 'true',
    'SETUP_COMPOSER'    => 'true',
    'SETUP_THEME_DEPS'  => 'true',
    'SETUP_WORDPRESS'   => 'true',
    'SETUP_DB_SYNC'     => 'true',
    'SETUP_SUBMODULES'  => 'false',
    'SETUP_TYPESENSE'   => 'false',
];

main($argv);

function main(array $argv): void
{
    $command = $argv[1] ?? '';
    $args = array_slice($argv, 2);

    if ($command === '' || in_array($command, ['-h', '--help'], true)) {
        printHelp();
        return;
    }

    $options = parseOptions($args);

    switch ($command) {
        case 'init':
            commandInit($options);
            return;

        case 'doctor':
            commandDoctor($options);
            return;

        default:
            fwrite(STDERR, "Unknown command: {$command}\n\n");
            printHelp();
            exit(1);
    }
}

function printHelp(): void
{
    echo <<<TXT
webentor-setup commands:

  webentor-setup init [--project <slug>] [--stack <webentor-v2|webentor-v2-hybrid|webentor-v1|sage|classic>]
    [--with-1password <true|false>] [--with-db-sync <true|false>]
    [--with-typesense <true|false>] [--cwd <path>]
    Options not provided via flags are prompted interactively.

  webentor-setup doctor [--cwd <path>]

TXT;
}

/**
 * Parse GNU-style --key value args.
 */
function parseOptions(array $args): array
{
    $options = [];

    for ($i = 0, $count = count($args); $i < $count; $i++) {
        $token = $args[$i];
        if (!str_starts_with($token, '--')) {
            continue;
        }

        $key = substr($token, 2);
        $next = $args[$i + 1] ?? null;
        if ($next !== null && !str_starts_with($next, '--')) {
            $options[$key] = $next;
            $i++;
            continue;
        }

        $options[$key] = 'true';
    }

    return $options;
}

function commandInit(array $options): void
{
    $cwd = realpath($options['cwd'] ?? getcwd()) ?: getcwd();

    // --- Collect options: use flag value when provided, prompt otherwise ---
    $project = $options['project']
        ?? promptStdin('Project slug:', basename($cwd));
    if ($project === '') {
        fwrite(STDERR, "Project slug cannot be empty.\n");
        exit(1);
    }

    $with1Password = isset($options['with-1password'])
        ? toBool($options['with-1password'])
        : promptYesNo('Use 1Password for .env?', true);

    $opVaultId = 'YOUR_OP_VAULT_ID';
    $opItemId  = 'YOUR_OP_ITEM_ID';

    if ($with1Password) {
        $opVaultId = promptStdin('1Password Vault ID (op vault list to find):', 'YOUR_OP_VAULT_ID');
        $opItemId  = promptStdin('1Password Item ID (op item get "..." to find):', 'YOUR_OP_ITEM_ID');
    }

    $withDbSync = isset($options['with-db-sync'])
        ? toBool($options['with-db-sync'])
        : promptYesNo('Enable DB sync?', true);

    $withTypesense = isset($options['with-typesense'])
        ? toBool($options['with-typesense'])
        : promptYesNo('Enable Typesense?', false);

    // --- Create directory structure (track created vs already-present) ---
    $created = [];

    $created['scripts/']                = ensureDir("{$cwd}/scripts");
    $created['scripts/hooks/']          = ensureDir("{$cwd}/scripts/hooks");
    $created['scripts/project-specific/'] = ensureDir("{$cwd}/scripts/project-specific");
    $created['.webikon/']               = ensureDir("{$cwd}/.webikon");

    writeIfMissing("{$cwd}/scripts/hooks/.gitkeep", '');
    writeIfMissing("{$cwd}/scripts/project-specific/.gitkeep", '');

    // --- Generate scripts/.env.setup ---
    $envValues = ENV_SETUP_DEFAULTS;
    $envValues['SETUP_1PASSWORD'] = $with1Password ? 'true' : 'false';
    $envValues['SETUP_DB_SYNC']   = $withDbSync ? 'true' : 'false';
    $envValues['SETUP_TYPESENSE'] = $withTypesense ? 'true' : 'false';

    $envContent = generateEnvSetup($opVaultId, $opItemId, $envValues);
    $created['scripts/.env.setup'] = writeIfMissing("{$cwd}/scripts/.env.setup", $envContent);

    // --- Generate scripts/.gitignore ---
    $created['scripts/.gitignore'] = writeIfMissing("{$cwd}/scripts/.gitignore", "!.env.setup\n");

    // --- Generate scripts/setup.sh (thin wrapper) ---
    $created['scripts/setup.sh'] = writeIfMissing("{$cwd}/scripts/setup.sh", generateSetupSh());

    // --- Conditionally generate Typesense files ---
    if ($withTypesense) {
        $created['scripts/ts-up.sh'] = writeIfMissing("{$cwd}/scripts/ts-up.sh", generateTsUpSh());
        $created['scripts/docker-compose.typesense.yml'] = writeIfMissing(
            "{$cwd}/scripts/docker-compose.typesense.yml",
            generateDockerComposeTypesense(),
        );
    }

    // --- Generate .webikon/project.json (merge-aware) ---
    // Four declared fields only. Versions and feature flags used to live here
    // and drifted constantly; they are now derived by the maintenance reporter
    // from the artefact that owns each one, so re-running init cannot stale them.
    $metadataPath       = "{$cwd}/.webikon/project.json";
    $projectJsonExisted = file_exists($metadataPath);
    $existing           = $projectJsonExisted
        ? (json_decode((string) file_get_contents($metadataPath), true) ?: [])
        : [];

    // `stack` is the one field a human may legitimately have corrected — a
    // hybrid is indistinguishable from a full stack at this point. Never clobber it.
    $stack = $options['stack'] ?? $existing['stack'] ?? 'webentor-v2';
    if (!in_array($stack, PROJECT_STACKS, true)) {
        fwrite(STDERR, sprintf(
            "Unknown stack '%s'. Expected one of: %s\n",
            $stack,
            implode(', ', PROJECT_STACKS),
        ));
        exit(1);
    }

    $metadata = [
        'schema_version' => 2,
        'slug'           => $project,
        'stack'          => $stack,
    ];

    $themePath = detectThemePath($cwd);
    if ($themePath !== null) {
        $metadata['theme_path'] = $themePath;
    }

    // Declared, not derived, because `scripts/` is deploy-excluded and the reporter
    // must still see this from production. Mirrors the project's own setup-core and
    // nothing else: the running CLI's version is NOT a fallback, because a project
    // without setup-core has no setup CLI version to declare. Each fact follows the
    // presence of its own artefact.
    $setupCliVersion = detectSetupCliVersion($cwd);
    if ($setupCliVersion !== null) {
        $metadata['setup_cli_version'] = $setupCliVersion;
    }

    file_put_contents(
        $metadataPath,
        json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    );

    $created['.webikon/project.json'] = !$projectJsonExisted;

    // --- Retire .webentor/project.json (schema v1) ---
    // Clean cut, not a deprecation: no field survived into v2, and a reader
    // tolerating both would only ever recover the slug.
    $legacyRemoved = false;
    if (file_exists("{$cwd}/.webentor/project.json")) {
        unlink("{$cwd}/.webentor/project.json");
        @rmdir("{$cwd}/.webentor");
        $legacyRemoved = true;
    }

    // --- Summary: show created vs already-present per item ---
    $items = [
        'scripts/.env.setup'        => 'runtime config',
        'scripts/.gitignore'        => 'gitignore',
        'scripts/setup.sh'          => 'thin wrapper',
        'scripts/hooks/'            => 'lifecycle hook directory',
        'scripts/project-specific/' => 'project helpers',
    ];
    if ($withTypesense) {
        $items['scripts/ts-up.sh'] = 'Typesense launcher';
        $items['scripts/docker-compose.typesense.yml'] = 'Typesense Docker Compose';
    }
    $items['.webikon/project.json'] = "project metadata (stack: {$stack})";

    echo "\nInitialized Webentor project in {$cwd}\n";
    foreach ($items as $path => $description) {
        if ($created[$path] ?? false) {
            echo sprintf("  %-34s — %s\n", $path, $description);
        } elseif ($path === '.webikon/project.json' && $projectJsonExisted) {
            echo sprintf("  %-34s — updated, %s\n", $path, $description);
        } else {
            echo sprintf("  %-34s — skipped, already exists\n", $path);
        }
    }

    if ($legacyRemoved) {
        echo sprintf("  %-34s — removed (retired schema v1)\n", '.webentor/project.json');
    }

    if ($themePath === null) {
        fwrite(STDERR, "\nWARNING: no theme declaring webentor-core was found, so theme_path was\n"
            . "omitted. The reporter will fall back to the active theme, which is wrong on\n"
            . "multi-theme projects. Set it by hand once the theme exists.\n");
    }
}

/**
 * The core-consuming theme, as a path relative to the project root.
 *
 * WP_THEMES is a space-separated list of EVERY theme the setup builds deps for,
 * so it is a superset — on a multi-theme project only one member consumes core.
 * Intersect the two and never propagate WP_THEMES verbatim.
 */
function detectThemePath(string $cwd): ?string
{
    $themesDir  = resolveThemesDir($cwd);
    $themesPath = "{$cwd}/{$themesDir}";

    if (!is_dir($themesPath)) {
        return null;
    }

    $declared = readEnvSetupValue($cwd, 'WP_THEMES');
    $allowed  = $declared === null ? null : preg_split('/\s+/', trim($declared), -1, PREG_SPLIT_NO_EMPTY);

    $candidates = [];
    foreach (scandir($themesPath) ?: [] as $entry) {
        if ($entry === '.' || $entry === '..' || !is_dir("{$themesPath}/{$entry}")) {
            continue;
        }
        if ($allowed !== null && !in_array($entry, $allowed, true)) {
            continue;
        }
        if (themeDeclaresCore("{$themesPath}/{$entry}")) {
            $candidates[] = $entry;
        }
    }

    if ($candidates === []) {
        return null;
    }

    if (count($candidates) > 1) {
        echo "\nMultiple themes declare webentor-core: " . implode(', ', $candidates) . "\n";
        $choice = promptStdin('Which one is the project theme?', $candidates[0]);
        if (in_array($choice, $candidates, true)) {
            return "{$themesDir}/{$choice}";
        }
    }

    return "{$themesDir}/{$candidates[0]}";
}

/**
 * Whether a theme directory depends on webentor-core, on either side.
 */
function themeDeclaresCore(string $themeDir): bool
{
    $composer = json_decode((string) @file_get_contents("{$themeDir}/composer.json"), true) ?: [];
    if (isset($composer['require']['webikon/webentor-core'])) {
        return true;
    }

    $package = json_decode((string) @file_get_contents("{$themeDir}/package.json"), true) ?: [];

    return isset($package['devDependencies']['@webikon/webentor-core'])
        || isset($package['dependencies']['@webikon/webentor-core']);
}

// ---------------------------------------------------------------------------
// Scaffolding generators
// ---------------------------------------------------------------------------

function promptStdin(string $prompt, string $default = ''): string
{
    $display = $default !== '' ? "{$prompt} [{$default}]: " : $prompt;
    fwrite(STDOUT, $display);
    $line = fgets(STDIN);
    $value = $line === false ? '' : trim($line);
    return $value !== '' ? $value : $default;
}

/**
 * Interactive yes/no prompt with input validation.
 * Shows default in square brackets. Empty input returns the default.
 * Re-prompts on invalid input.
 */
function promptYesNo(string $prompt, bool $default): bool
{
    $defaultHint = $default ? 'y' : 'n';

    while (true) {
        $input = strtolower(promptStdin("{$prompt} (y/n)", $defaultHint));

        if (in_array($input, ['y', 'yes'], true)) {
            return true;
        }

        if (in_array($input, ['n', 'no'], true)) {
            return false;
        }

        fwrite(STDOUT, "Please answer y or n.\n");
    }
}

/**
 * Write file only if it doesn't exist. Returns true when created, false when skipped.
 */
function writeIfMissing(string $path, string $content): bool
{
    if (file_exists($path)) {
        return false;
    }
    file_put_contents($path, $content);
    return true;
}

function generateEnvSetup(string $opVaultId, string $opItemId, array $toggles): string
{
    $lines = [];
    $lines[] = '# 1Password vault ID';
    $lines[] = '# Find it with: op vault list';
    $lines[] = "OP_VAULT_ID={$opVaultId}";
    $lines[] = '';
    $lines[] = '# 1Password item ID';
    $lines[] = '# Find it with: op item get "Your .env item name" --format json | jq -r \'.id\'';
    $lines[] = "OP_ITEM_ID={$opItemId}";
    $lines[] = '';
    $lines[] = 'WP_THEMES="webentor-theme-v2"';
    $lines[] = '';
    $lines[] = '# Relative path from project root to the themes directory.';
    $lines[] = '# Default: web/app/themes (Bedrock). Use wp-content/themes for traditional WP.';
    $lines[] = 'WP_THEMES_DIR=web/app/themes';
    $lines[] = '';
    $lines[] = '# Setup runtime feature toggles.';
    $lines[] = '# These values are project-owned and intentionally outside setup subtree updates.';

    foreach ($toggles as $key => $value) {
        $lines[] = "{$key}={$value}";
    }

    return implode("\n", $lines) . "\n";
}

/**
 * Thin project wrapper — delegates to the subtree-managed setup runtime.
 */
function generateSetupSh(): string
{
    return <<<'BASH'
#!/usr/bin/env bash
set -eE

# Thin project wrapper around subtree-managed setup runtime.
WORKSPACE_FOLDER="$(realpath "${LOCAL_WORKSPACE_FOLDER:-$(pwd)}")"
SCRIPT_DIR="${WORKSPACE_FOLDER}/scripts/setup-core"
HELPERS_DIR="${SCRIPT_DIR}/helpers"

export WORKSPACE_FOLDER
export SCRIPT_DIR
export HELPERS_DIR

source "${SCRIPT_DIR}/setup.sh"
BASH;
}

/**
 * Typesense launcher — only generated when --with-typesense true.
 */
function generateTsUpSh(): string
{
    return <<<'BASH'
#!/usr/bin/env bash
set -e

WORKSPACE_FOLDER="$(realpath "${LOCAL_WORKSPACE_FOLDER:-$(pwd)}")"
SCRIPT_DIR=${SCRIPT_DIR:-"$WORKSPACE_FOLDER/scripts/setup-core"}
HELPERS_DIR=${HELPERS_DIR:-"$SCRIPT_DIR/helpers"}

export WORKSPACE_FOLDER
export SCRIPT_DIR
export HELPERS_DIR

source "$HELPERS_DIR/shell-ui.sh"
source "$HELPERS_DIR/helpers.sh"

load_env

bash "$SCRIPT_DIR/typesense-docker.sh"
BASH;
}

/**
 * Docker Compose for Typesense — only generated when --with-typesense true.
 */
function generateDockerComposeTypesense(): string
{
    return <<<'YAML'
services:
  typesense:
    image: typesense/typesense:29.0
    container_name: ts-webentor
    restart: unless-stopped
    ports:
      - "${WTC_TS_NODE_PORT}:${WTC_TS_NODE_PORT}"
    volumes:
      - ./typesense-data:/data
    environment:
      TYPESENSE_DATA_DIR: /data
      TYPESENSE_API_KEY: "${WTC_TS_API_KEY:-local}"
      TYPESENSE_ENABLE_CORS: 'true'
YAML;
}

function commandDoctor(array $options): void
{
    $cwd = realpath($options['cwd'] ?? getcwd()) ?: getcwd();

    $checks = [
        ['command', 'php', true],
        ['command', 'composer', true],
        ['command', 'pnpm', true],
        ['command', 'wp', false],
        ['file', "{$cwd}/scripts/.env.setup", true],
        ['file', "{$cwd}/.webikon/project.json", true],
    ];

    $hasError = false;

    foreach ($checks as [$type, $value, $required]) {
        if ($type === 'command') {
            $ok = commandExists($value);
            echo sprintf("%-10s %-45s %s\n", '[command]', $value, $ok ? 'OK' : 'MISSING');
        } else {
            $ok = file_exists($value);
            echo sprintf("%-10s %-45s %s\n", '[file]', $value, $ok ? 'OK' : 'MISSING');
        }

        if (!$ok && $required) {
            $hasError = true;
        }
    }

    // setup_cli_version is the one declared field that can rot: `scripts/` is
    // deploy-excluded, so the reporter reads the declaration in production and has
    // no way to notice it disagrees with the subtree. Check it here, where both are
    // visible, and fail — a warning would just be walked past.
    $declared = null;
    $metaPath = "{$cwd}/.webikon/project.json";
    if (file_exists($metaPath)) {
        $meta     = json_decode((string) file_get_contents($metaPath), true) ?: [];
        $declared = $meta['setup_cli_version'] ?? null;
    }
    $actual = detectSetupCliVersion($cwd);

    if ($actual === null && $declared === null) {
        echo sprintf("%-10s %-45s %s\n", '[version]', 'setup_cli_version', 'n/a (no setup-core)');
    } elseif ($actual === null) {
        echo sprintf("%-10s %-45s %s\n", '[version]', 'setup_cli_version', "DECLARED {$declared}, but no setup-core present");
        $hasError = true;
    } elseif ($declared !== $actual) {
        echo sprintf(
            "%-10s %-45s %s\n",
            '[version]',
            'setup_cli_version',
            sprintf('DRIFT: project.json says %s, scripts/setup-core is %s', $declared ?? 'nothing', $actual),
        );
        echo "           fix: set \"setup_cli_version\": \"{$actual}\" in .webikon/project.json\n";
        $hasError = true;
    } else {
        echo sprintf("%-10s %-45s %s\n", '[version]', 'setup_cli_version', "OK ({$actual})");
    }

    if ($hasError) {
        exit(1);
    }
}

/**
 * Create directory if missing. Returns true when created, false when already present.
 */
function ensureDir(string $path): bool
{
    if (is_dir($path)) {
        return false;
    }
    mkdir($path, 0777, true);
    return true;
}

function toBool(string $value): bool
{
    return in_array(strtolower($value), ['1', 'true', 'yes', 'y', 'on'], true);
}

function commandExists(string $command): bool
{
    $result = shell_exec('command -v ' . escapeshellarg($command) . ' 2>/dev/null');
    return is_string($result) && trim($result) !== '';
}

/**
 * Version recorded in the project's own `scripts/setup-core/composer.json`.
 *
 * This is the authority: a `git subtree pull` moves setup-core forward without
 * this CLI being re-run, so the subtree's manifest outranks whatever binary
 * happens to be executing. Null when the project has no setup-core yet.
 */
function detectSetupCliVersion(string $cwd): ?string
{
    $data = json_decode(
        (string) @file_get_contents("{$cwd}/scripts/setup-core/composer.json"),
        true,
    ) ?: [];

    $version = ltrim((string) ($data['version'] ?? ''), 'v');

    return $version !== '' ? $version : null;
}

/**
 * Read a single value from scripts/.env.setup. Null when unset or empty.
 */
function readEnvSetupValue(string $cwd, string $key): ?string
{
    $lines = @file("{$cwd}/scripts/.env.setup", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return null;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_starts_with($line, "{$key}=")) {
            continue;
        }

        $value = trim(substr($line, strlen($key) + 1), "\"' \t");
        if ($value !== '') {
            return $value;
        }
    }

    return null;
}

/**
 * Read WP_THEMES_DIR from scripts/.env.setup with fallback to web/app/themes.
 */
function resolveThemesDir(string $cwd): string
{
    return readEnvSetupValue($cwd, 'WP_THEMES_DIR') ?? 'web/app/themes';
}

