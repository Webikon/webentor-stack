#!/usr/bin/env node

/**
 * Verifies that every mirrored version source in the repository is in sync:
 *
 * - package.json vs composer.json for packages that ship both manifests
 * - the top CHANGELOG.md entry for every released package
 * - the theme's style.css "Version:" header
 * - the top data row of docs/src/compatibility-matrix.md
 * - version baselines in packages/webentor-starter/.webentor/project.json
 *
 * Exits non-zero with a per-check message when any source drifts. Run via
 * `pnpm check:versions`; CI runs it on every push/PR.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');
const themeDir = join(
  root,
  'packages/webentor-starter/web/app/themes/webentor-theme-v2',
);

const errors = [];

function fail(message) {
  errors.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// First markdown heading that carries a semver, e.g. "## 0.15.3",
// "### 2.1.1" or "### Version 2.1.1".
function changelogVersion(path) {
  const content = readFileSync(path, 'utf8');
  const match = content.match(/^#{2,3} +(?:Version +)?v?(\d+\.\d+\.\d+)/m);
  return match ? match[1] : null;
}

function styleCssVersion(path) {
  const match = readFileSync(path, 'utf8').match(/^Version:\s*(\S+)/m);
  return match ? match[1] : null;
}

// Minimal range check covering the forms used in project.json:
// exact "1.1.0", caret "^1.1.0" / "^0.15" (npm caret semantics).
function satisfies(range, version) {
  if (range === 'latest' || range === '*') return true;
  const ver = version.split('.').map(Number);
  if (!range.startsWith('^')) {
    return range === version;
  }
  const base = range
    .slice(1)
    .split('.')
    .map((n) => Number(n));
  while (base.length < 3) base.push(0);
  // Lower bound: version >= base.
  for (let i = 0; i < 3; i++) {
    if (ver[i] > base[i]) break;
    if (ver[i] < base[i]) return false;
  }
  // Upper bound: first non-zero component of base must match.
  const pivot = base[0] > 0 ? 0 : base[1] > 0 ? 1 : 2;
  for (let i = 0; i <= pivot; i++) {
    if (ver[i] !== base[i]) return false;
  }
  return true;
}

function expectEqual(label, expected, actual, source) {
  if (actual !== expected) {
    fail(`${label}: ${source} has "${actual}", expected "${expected}"`);
  }
}

// --- Per-package version sources -------------------------------------------

function packageVersion(dir, { npm = false, composer = false, changelog = true }) {
  const versions = {};
  if (npm) {
    versions.npm = readJson(join(dir, 'package.json')).version;
  }
  if (composer) {
    versions.composer = readJson(join(dir, 'composer.json')).version;
  }
  const canonical = versions.npm ?? versions.composer;

  if (versions.npm && versions.composer) {
    expectEqual(dir, versions.npm, versions.composer, 'composer.json');
  }
  if (changelog) {
    const entry = changelogVersion(join(dir, 'CHANGELOG.md'));
    expectEqual(dir, canonical, entry, 'top CHANGELOG.md entry');
  }
  return canonical;
}

const core = packageVersion(join(root, 'packages/webentor-core'), {
  npm: true,
  composer: true,
});
const configs = packageVersion(join(root, 'packages/webentor-configs'), {
  npm: true,
});
const setup = packageVersion(join(root, 'packages/webentor-setup'), {
  composer: true,
});
packageVersion(join(root, 'packages/webentor-codemods'), { npm: true });
const starter = packageVersion(join(root, 'packages/webentor-starter'), {
  composer: true,
});
const theme = packageVersion(themeDir, { npm: true, composer: true });

const styleVersion = styleCssVersion(join(themeDir, 'style.css'));
expectEqual(themeDir, theme, styleVersion, 'style.css Version header');

// --- Compatibility matrix ---------------------------------------------------

const matrixPath = join(root, 'docs/src/compatibility-matrix.md');
const matrixRows = readFileSync(matrixPath, 'utf8')
  .split('\n')
  .filter((line) => /^\| *\d/.test(line));

if (matrixRows.length === 0) {
  fail(`${matrixPath}: no data rows found`);
} else {
  const cells = matrixRows[0]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);
  const [mStarter, mTheme, mCore, mConfigs, mSetup] = cells;
  expectEqual(matrixPath, starter, mStarter, 'top row starterVersion');
  expectEqual(matrixPath, theme, mTheme, 'top row themeVersion');
  expectEqual(matrixPath, core, mCore, 'top row coreVersion');
  expectEqual(matrixPath, configs, mConfigs, 'top row configsVersion');
  expectEqual(matrixPath, setup, mSetup, 'top row setupCliVersion');
}

// --- Starter project.json baselines ----------------------------------------

const projectJsonPath = join(
  root,
  'packages/webentor-starter/.webentor/project.json',
);
if (existsSync(projectJsonPath)) {
  const project = readJson(projectJsonPath);
  const baselines = [
    ['coreVersion', core],
    ['configsVersion', configs],
    ['setupCliVersion', setup],
  ];
  for (const [field, actual] of baselines) {
    if (project[field] && !satisfies(project[field], actual)) {
      fail(
        `${projectJsonPath}: ${field} "${project[field]}" does not cover released version ${actual}`,
      );
    }
  }
  if (
    project.starterVersion &&
    project.starterVersion !== 'latest' &&
    !satisfies(project.starterVersion, starter)
  ) {
    fail(
      `${projectJsonPath}: starterVersion "${project.starterVersion}" does not cover released version ${starter}`,
    );
  }
}

// --- Shared tooling devDependencies (core vs theme) --------------------------
//
// The theme must stay standalone-installable in consumer projects, so it
// duplicates core's tooling devDependencies instead of sharing them via the
// workspace. Keep the duplicated ranges identical so the toolchains do not
// silently drift apart.

const coreDevDeps =
  readJson(join(root, 'packages/webentor-core/package.json')).devDependencies ??
  {};
const themeDevDeps =
  readJson(join(themeDir, 'package.json')).devDependencies ?? {};

for (const [dep, coreRange] of Object.entries(coreDevDeps)) {
  // workspace:* vs published range is expected for the configs package.
  if (dep === '@webikon/webentor-configs') continue;
  const themeRange = themeDevDeps[dep];
  if (themeRange !== undefined && themeRange !== coreRange) {
    fail(
      `shared devDependency "${dep}": core has "${coreRange}", theme has "${themeRange}" - bump both together`,
    );
  }
}

// --- Report -----------------------------------------------------------------

if (errors.length > 0) {
  console.error('Version drift detected:\n');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error('\nKeep every mirrored version source in sync (see AGENTS.md "Version Source Map").');
  process.exit(1);
}

console.log(
  `Versions in sync: core ${core}, configs ${configs}, setup ${setup}, starter ${starter}, theme ${theme}`,
);
