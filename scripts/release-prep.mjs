#!/usr/bin/env node

/**
 * Prepares a release in one command: stamps every mirrored version source for
 * the given package(s), scaffolds a CHANGELOG entry, inserts a new
 * compatibility-matrix row.
 *
 * NOTE for starter releases: the root composer.json version stamped here is what
 * the maintenance reporter reads to report a project's starter release. Bumping
 * it is load-bearing, not bookkeeping.
 *
 * Usage:
 *   pnpm release:prep core=0.16.0
 *   pnpm release:prep starter=2.2.0 theme=2.2.0 core=0.16.0
 *
 * Bump several packages in ONE invocation when they release together so the
 * compatibility matrix gains a single tested-together row. The result is a
 * plain working-tree diff: review it, replace the TODO changelog lines with
 * curated entries, then commit. `pnpm check:versions` (and CI) verifies the
 * outcome.
 */

import { readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';

const root = join(import.meta.dirname, '..');
const themeDir = 'packages/webentor-starter/web/app/themes/webentor-theme-v2';

const PACKAGES = {
  core: {
    manifests: [
      'packages/webentor-core/package.json',
      'packages/webentor-core/composer.json',
    ],
    changelog: 'packages/webentor-core/CHANGELOG.md',
    heading: (v) => `## ${v}`,
  },
  configs: {
    manifests: ['packages/webentor-configs/package.json'],
    changelog: 'packages/webentor-configs/CHANGELOG.md',
    heading: (v) => `## ${v}`,
  },
  setup: {
    manifests: ['packages/webentor-setup/composer.json'],
    changelog: 'packages/webentor-setup/CHANGELOG.md',
    heading: (v) => `## ${v}`,
  },
  codemods: {
    manifests: ['packages/webentor-codemods/package.json'],
    changelog: 'packages/webentor-codemods/CHANGELOG.md',
    heading: (v) => `## ${v}`,
  },
  starter: {
    manifests: ['packages/webentor-starter/composer.json'],
    changelog: 'packages/webentor-starter/CHANGELOG.md',
    heading: (v) => `### ${v}`,
  },
  theme: {
    manifests: [
      join(themeDir, 'package.json'),
      join(themeDir, 'composer.json'),
    ],
    changelog: join(themeDir, 'CHANGELOG.md'),
    heading: (v) => `### Version ${v}`,
    styleCss: join(themeDir, 'style.css'),
  },
};

// --- Parse arguments ---------------------------------------------------------

const bumps = {};
for (const arg of process.argv.slice(2)) {
  const match = arg.match(/^([a-z]+)=(\d+\.\d+\.\d+)$/);
  if (!match || !PACKAGES[match[1]]) {
    console.error(`Invalid argument "${arg}".`);
    console.error(
      'Usage: pnpm release:prep <pkg>=<x.y.z> [...] with pkg one of: ' +
        Object.keys(PACKAGES).join(', '),
    );
    process.exit(1);
  }
  bumps[match[1]] = match[2];
}

if (Object.keys(bumps).length === 0) {
  console.error('No bumps given. Usage: pnpm release:prep core=0.16.0 [...]');
  process.exit(1);
}

// --- Stamp version sources ---------------------------------------------------

// Regex-based replacement keeps each file's existing formatting intact.
function replaceOnce(path, pattern, replacement, label) {
  const abs = join(root, path);
  const content = readFileSync(abs, 'utf8');
  if (!pattern.test(content)) {
    console.error(`Could not find ${label} in ${path}.`);
    process.exit(1);
  }
  writeFileSync(abs, content.replace(pattern, replacement));
}

for (const [name, version] of Object.entries(bumps)) {
  const spec = PACKAGES[name];

  for (const manifest of spec.manifests) {
    replaceOnce(
      manifest,
      /("version":\s*")[^"]+(")/,
      `$1${version}$2`,
      'a "version" field',
    );
  }

  if (spec.styleCss) {
    replaceOnce(
      spec.styleCss,
      /^(Version:\s*)\S+/m,
      `$1${version}`,
      'a "Version:" header',
    );
  }

  // Scaffold the changelog entry right under the H1 title.
  replaceOnce(
    spec.changelog,
    /^(# .+\n)/,
    `$1\n${spec.heading(version)}\n\n- TODO: describe the changes in this release.\n`,
    'the changelog title',
  );

  console.log(`Stamped ${name} -> ${version}`);
}

// --- Starter composer.lock content-hash --------------------------------------

// Composer hashes `version` into composer.lock's content-hash, so stamping the
// starter manifest invalidates the lock and CI's `composer validate` exits 2.
// `--lock` rewrites the hash only: no dependency resolution, no install.
if (bumps.starter) {
  const starterDir = join(root, 'packages/webentor-starter');
  const composer = spawnSync(
    'composer',
    ['update', '--lock', '--no-install', '--no-interaction'],
    { cwd: starterDir, stdio: 'inherit' },
  );
  if (composer.error?.code === 'ENOENT') {
    console.warn(
      '\n! composer not found — packages/webentor-starter/composer.lock still\n' +
        "  carries the pre-bump content-hash, and CI's `composer validate` will\n" +
        '  fail. Run `composer update --lock --no-install` there before pushing.',
    );
  } else if (composer.status !== 0) {
    console.error('composer update --lock failed in packages/webentor-starter.');
    process.exit(1);
  } else {
    console.log('Refreshed packages/webentor-starter/composer.lock content-hash.');
  }
}

// --- Current version set (post-stamp) ----------------------------------------

function manifestVersion(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8')).version;
}

const versions = {
  core: manifestVersion('packages/webentor-core/package.json'),
  configs: manifestVersion('packages/webentor-configs/package.json'),
  setup: manifestVersion('packages/webentor-setup/composer.json'),
  starter: manifestVersion('packages/webentor-starter/composer.json'),
  theme: manifestVersion(join(themeDir, 'package.json')),
};

// --- Compatibility matrix: insert the new tested-together row ----------------

const matrixPath = join(root, 'docs/src/compatibility-matrix.md');
const matrix = readFileSync(matrixPath, 'utf8');
const lines = matrix.split('\n');
const separatorIndex = lines.findIndex((line) => /^\| *--- *\|/.test(line));
const topRow = lines[separatorIndex + 1] ?? '';
const topCells = topRow.split('|').map((cell) => cell.trim());
const [php, node] = topCells.slice(6, 8);
const newRow = `| ${versions.starter} | ${versions.theme} | ${versions.core} | ${versions.configs} | ${versions.setup} | ${php} | ${node} |`;

if (topRow.trim() === newRow.trim()) {
  console.log('Compatibility matrix top row already current.');
} else {
  lines.splice(separatorIndex + 1, 0, newRow);
  writeFileSync(matrixPath, lines.join('\n'));
  console.log('Added compatibility matrix row.');
}

// The starter's .webikon/project.json needs no release-time stamping: it
// declares slug/stack/theme_path only, and every version the reporter shows is
// derived from the manifests stamped above. check-versions.mjs guards its shape.

// --- Verify the result --------------------------------------------------------

const check = spawnSync('node', [join(root, 'scripts/check-versions.mjs')], {
  stdio: 'inherit',
});
if (check.status !== 0) {
  console.error('release-prep left version sources inconsistent - inspect the diff.');
  process.exit(1);
}

console.log(
  '\nRelease prep complete. Replace the TODO changelog line(s) with curated entries, review the diff, and commit.',
);
