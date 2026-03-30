#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Thin CLI for local Webentor setup operations.
 *
 * This command is intentionally dependency-free so it can run before Composer/npm
 * are installed in freshly cloned starter projects.
 */

const PROJECT_OWNED_PATH_PREFIXES = [
    'scripts/.env.setup',
    'scripts/hooks/',
    'scripts/project-specific/',
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
    $runtimeRoot = dirname(__DIR__);

    switch ($command) {
        case 'init':
            commandInit($options, $runtimeRoot);
            return;

        case 'upgrade-starter':
            commandUpgradeStarter($options, $runtimeRoot);
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

  webentor-setup init [--project <slug>] [--starter-version <semver|latest>]
    [--with-1password <true|false>] [--with-db-sync <true|false>]
    [--with-typesense <true|false>] [--cwd <path>]
    Options not provided via flags are prompted interactively.

  webentor-setup upgrade-starter --from <x.y.z> --to <x.y.z> [--cwd <path>] [--dry-run <true|false>]
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

function commandInit(array $options, string $runtimeRoot): void
{
    $cwd = realpath($options['cwd'] ?? getcwd()) ?: getcwd();
    $starterVersion = $options['starter-version'] ?? 'latest';

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
    $created['.webentor/']              = ensureDir("{$cwd}/.webentor");

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

    // --- Generate .webentor/project.json (always written with latest metadata) ---
    $projectJsonExisted = file_exists("{$cwd}/.webentor/project.json");

    $metadata = [
        'starterVersion' => $starterVersion,
        'coreVersion' => detectCoreVersion($cwd) ?? 'unknown',
        'configsVersion' => detectConfigsVersion($cwd) ?? 'unknown',
        'phpVersion' => detectPhpConstraint($cwd) ?? PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION,
        'nodeVersion' => detectNodeConstraint($cwd) ?? 'unknown',
        'setupCliVersion' => detectSetupCliVersion($runtimeRoot),
        'createdAt' => gmdate(DATE_ATOM),
        'projectSlug' => $project,
        'withDbSync' => $withDbSync,
        'withTypesense' => $withTypesense,
        'with1Password' => $with1Password,
    ];

    file_put_contents(
        "{$cwd}/.webentor/project.json",
        json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    );

    $created['.webentor/project.json'] = !$projectJsonExisted;

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
    $items['.webentor/project.json'] = 'project metadata';

    echo "\nInitialized Webentor project in {$cwd}\n";
    foreach ($items as $path => $description) {
        if ($created[$path] ?? false) {
            echo sprintf("  %-34s — %s\n", $path, $description);
        } elseif ($path === '.webentor/project.json' && $projectJsonExisted) {
            echo sprintf("  %-34s — updated (already existed)\n", $path);
        } else {
            echo sprintf("  %-34s — skipped, already exists\n", $path);
        }
    }
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
        ['file', "{$cwd}/.webentor/project.json", true],
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

    if ($hasError) {
        exit(1);
    }
}

function commandUpgradeStarter(array $options, string $runtimeRoot): void
{
    $from = $options['from'] ?? null;
    $to = $options['to'] ?? null;

    if ($from === null || $to === null) {
        fwrite(STDERR, "Missing required options: --from and --to\n");
        exit(1);
    }

    $cwd = realpath($options['cwd'] ?? getcwd()) ?: getcwd();
    $dryRun = toBool($options['dry-run'] ?? 'true');

    $manifestPath = "{$runtimeRoot}/upgrades/{$to}/manifest.json";
    if (!file_exists($manifestPath)) {
        fwrite(STDERR, "Upgrade manifest not found: {$manifestPath}\n");
        exit(1);
    }

    $manifest = json_decode((string) file_get_contents($manifestPath), true, flags: JSON_THROW_ON_ERROR);
    $transforms = $manifest['transforms'] ?? [];

    $lines = [];
    $lines[] = "# Webentor Upgrade Report";
    $lines[] = "";
    $lines[] = "- From: `{$from}`";
    $lines[] = "- To: `{$to}`";
    $lines[] = "- Dry run: `" . ($dryRun ? 'true' : 'false') . "`";
    $lines[] = "- Generated: `" . gmdate(DATE_ATOM) . "`";
    $lines[] = "";
    $lines[] = "## Transform Results";

    foreach ($transforms as $index => $transform) {
        $result = applyTransform($cwd, $transform, $dryRun);
        $lines[] = sprintf(
            '%d. `%s` on `%s` -> %s',
            $index + 1,
            $transform['type'] ?? 'unknown',
            $transform['path'] ?? '(n/a)',
            $result,
        );
    }

    $metadataPath = "{$cwd}/.webentor/project.json";
    if (!isProjectOwnedPath('.webentor/project.json')) {
        $lines[] = '';
        if ($dryRun) {
            $lines[] = '- Planned update for `.webentor/project.json` starterVersion.';
        } else {
            updateMetadataVersion($metadataPath, $to);
            $lines[] = '- Updated `.webentor/project.json` starterVersion.';
        }
    }

    $report = implode(PHP_EOL, $lines) . PHP_EOL;
    $reportPath = "{$cwd}/upgrade-report-{$from}-to-{$to}.md";
    file_put_contents($reportPath, $report);

    echo $report;
    echo "Report written to {$reportPath}\n";
}

function applyTransform(string $cwd, array $transform, bool $dryRun): string
{
    $type = $transform['type'] ?? '';
    $path = $transform['path'] ?? '';

    if ($path !== '') {
        // Canonicalize the path before ownership check to prevent traversal bypasses
        // (e.g. "scripts/../../../etc/passwd" must not pass the prefix check).
        $absolutePathCandidate = realpath("{$cwd}/{$path}") ?: "{$cwd}/{$path}";
        $cwdReal = realpath($cwd) ?: $cwd;
        if (!str_starts_with($absolutePathCandidate, $cwdReal . DIRECTORY_SEPARATOR)) {
            return 'SKIPPED (path outside project root)';
        }
        // Check against relative path as stored in manifest
        if (isProjectOwnedPath($path)) {
            return 'SKIPPED (project-owned path)';
        }
    }

    $absolutePath = $path === '' ? '' : "{$cwd}/{$path}";

    return match ($type) {
        'remove_path' => transformRemovePath($absolutePath, $dryRun),
        'replace_text' => transformReplaceText($absolutePath, $transform, $dryRun),
        'ensure_directory' => transformEnsureDirectory($absolutePath, $dryRun),
        default => 'SKIPPED (unknown transform type)',
    };
}

function transformRemovePath(string $path, bool $dryRun): string
{
    if (!file_exists($path)) {
        return 'NOOP (path missing)';
    }

    if ($dryRun) {
        return 'PLANNED (remove path)';
    }

    if (is_dir($path)) {
        rrmdir($path);
    } else {
        unlink($path);
    }

    return 'APPLIED';
}

function transformReplaceText(string $path, array $transform, bool $dryRun): string
{
    if (!file_exists($path)) {
        return 'NOOP (file missing)';
    }

    $search = (string) ($transform['search'] ?? '');
    $replace = (string) ($transform['replace'] ?? '');

    $content = (string) file_get_contents($path);
    if ($search === '' || !str_contains($content, $search)) {
        return 'NOOP (search text not found)';
    }

    if ($dryRun) {
        return 'PLANNED (text replacement)';
    }

    file_put_contents($path, str_replace($search, $replace, $content));
    return 'APPLIED';
}

function transformEnsureDirectory(string $path, bool $dryRun): string
{
    if (is_dir($path)) {
        return 'NOOP (directory exists)';
    }

    if ($dryRun) {
        return 'PLANNED (create directory)';
    }

    mkdir($path, 0777, true);
    return 'APPLIED';
}

function updateMetadataVersion(string $metadataPath, string $starterVersion): void
{
    $metadata = [];
    if (file_exists($metadataPath)) {
        $metadata = json_decode((string) file_get_contents($metadataPath), true) ?: [];
    }

    $metadata['starterVersion'] = $starterVersion;
    $metadata['setupCliVersion'] = detectSetupCliVersion(dirname(dirname($metadataPath)) . '/scripts/setup-core');
    $metadata['updatedAt'] = gmdate(DATE_ATOM);

    if (!is_dir(dirname($metadataPath))) {
        mkdir(dirname($metadataPath), 0777, true);
    }

    file_put_contents(
        $metadataPath,
        json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    );
}

function isProjectOwnedPath(string $path): bool
{
    foreach (PROJECT_OWNED_PATH_PREFIXES as $prefix) {
        if ($path === $prefix || str_starts_with($path, $prefix)) {
            return true;
        }
    }

    return false;
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

function rrmdir(string $path): void
{
    $items = scandir($path);
    if ($items === false) {
        return;
    }

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $itemPath = $path . DIRECTORY_SEPARATOR . $item;
        if (is_dir($itemPath)) {
            rrmdir($itemPath);
            continue;
        }

        unlink($itemPath);
    }

    rmdir($path);
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

function detectSetupCliVersion(string $runtimeRoot): string
{
    $composerJson = "{$runtimeRoot}/composer.json";
    if (!file_exists($composerJson)) {
        return 'unknown';
    }
    $data = json_decode((string) file_get_contents($composerJson), true);
    return (string) ($data['version'] ?? 'unknown');
}

function detectPhpConstraint(string $cwd): ?string
{
    $composer = "{$cwd}/composer.json";
    if (!file_exists($composer)) {
        return null;
    }

    $data = json_decode((string) file_get_contents($composer), true);
    return $data['require']['php'] ?? null;
}

function detectNodeConstraint(string $cwd): ?string
{
    return scanThemeFiles($cwd, 'package.json', function (array $data): ?string {
        return isset($data['engines']['node']) ? (string) $data['engines']['node'] : null;
    });
}

/**
 * Detect webentor-core version constraint from theme composer.json.
 */
function detectCoreVersion(string $cwd): ?string
{
    return scanThemeFiles($cwd, 'composer.json', function (array $data): ?string {
        return $data['require']['webikon/webentor-core'] ?? null;
    });
}

/**
 * Detect webentor-configs version constraint from theme package.json.
 */
function detectConfigsVersion(string $cwd): ?string
{
    return scanThemeFiles($cwd, 'package.json', function (array $data): ?string {
        return $data['devDependencies']['@webikon/webentor-configs']
            ?? $data['dependencies']['@webikon/webentor-configs']
            ?? null;
    });
}

/**
 * Read WP_THEMES_DIR from scripts/.env.setup with fallback to web/app/themes.
 */
function resolveThemesDir(string $cwd): string
{
    $envSetupPath = "{$cwd}/scripts/.env.setup";
    if (file_exists($envSetupPath)) {
        $lines = file($envSetupPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines !== false) {
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                if (str_starts_with($line, 'WP_THEMES_DIR=')) {
                    $value = substr($line, strlen('WP_THEMES_DIR='));
                    $value = trim($value, "\"' \t");
                    if ($value !== '') {
                        return $value;
                    }
                }
            }
        }
    }

    return 'web/app/themes';
}

/**
 * Iterate theme directories and apply $extractor to parsed JSON.
 * Returns the first non-null result.
 */
function scanThemeFiles(string $cwd, string $filename, callable $extractor): ?string
{
    $themesPath = "{$cwd}/" . resolveThemesDir($cwd);
    if (!is_dir($themesPath)) {
        return null;
    }

    $entries = scandir($themesPath);
    if ($entries === false) {
        return null;
    }

    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }

        $filePath = "{$themesPath}/{$entry}/{$filename}";
        if (!file_exists($filePath)) {
            continue;
        }

        $data = json_decode((string) file_get_contents($filePath), true);
        if (!is_array($data)) {
            continue;
        }

        $result = $extractor($data);
        if ($result !== null) {
            return $result;
        }
    }

    return null;
}
