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

  webentor-setup init --project <slug> [--starter-version <semver|latest>] [--with-db-sync <true|false>] [--cwd <path>]
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
    $project = $options['project'] ?? null;
    if ($project === null || $project === '') {
        fwrite(STDERR, "Missing required option: --project\n");
        exit(1);
    }

    $cwd = realpath($options['cwd'] ?? getcwd()) ?: getcwd();
    $starterVersion = $options['starter-version'] ?? 'latest';
    // Default DB sync to enabled for newly initialized projects.
    $withDbSync = toBool($options['with-db-sync'] ?? 'true');

    ensureDir("{$cwd}/scripts");
    ensureDir("{$cwd}/scripts/hooks");
    ensureDir("{$cwd}/scripts/project-specific");
    ensureDir("{$cwd}/.webentor");

    $envTarget = "{$cwd}/scripts/.env.setup";
    $envExample = "{$runtimeRoot}/.env.setup.example";

    if (!file_exists($envTarget) && file_exists($envExample)) {
        copy($envExample, $envTarget);
    }

    $metadata = [
        'starterVersion' => $starterVersion,
        'coreVersion' => 'unknown',
        'configsVersion' => 'unknown',
        'phpVersion' => detectPhpConstraint($cwd) ?? PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION,
        'nodeVersion' => detectNodeConstraint($cwd) ?? 'unknown',
        'setupCliVersion' => detectSetupCliVersion($runtimeRoot),
        'createdAt' => gmdate(DATE_ATOM),
        'projectSlug' => $project,
        'withDbSync' => $withDbSync,
    ];

    file_put_contents(
        "{$cwd}/.webentor/project.json",
        json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    );

    echo "Initialized Webentor project metadata in {$cwd}/.webentor/project.json\n";
    echo "Prepared hooks directory in {$cwd}/scripts/hooks\n";
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

function ensureDir(string $path): void
{
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }
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
    $themesPath = "{$cwd}/web/app/themes";
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

        $packageJson = "{$themesPath}/{$entry}/package.json";
        if (!file_exists($packageJson)) {
            continue;
        }

        $data = json_decode((string) file_get_contents($packageJson), true);
        if (isset($data['engines']['node'])) {
            return (string) $data['engines']['node'];
        }
    }

    return null;
}
