#!/usr/bin/env node

/**
 * Verifies that every mirrored version source in the repository is in sync:
 *
 * - package.json vs composer.json for packages that ship both manifests
 * - the top CHANGELOG.md entry for every released package
 * - the theme's style.css "Version:" header
 * - the top data row of docs/src/compatibility-matrix.md
 * - the shape of packages/webentor-starter/.webikon/project.json, and the
 *   starter's root composer.json name/version (the reporter derives the starter
 *   release from that version, so an unversioned manifest blanks it fleet-wide)
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

// --- Starter .webikon/project.json schema (v2) -------------------------------
//
// No version baselines to check any more: the file declares four facts and the
// maintenance reporter derives every version from the artefact that owns it.
// What CAN rot is the schema itself, so guard that instead — a starter shipping
// a malformed or stale-shaped metadata file propagates it to every new project.

const PROJECT_STACKS = [
  'webentor-v2',
  'webentor-v2-hybrid',
  'webentor-v1',
  'sage',
  'classic',
];

const starterDir = join(root, 'packages/webentor-starter');
const projectJsonPath = join(starterDir, '.webikon/project.json');

if (!existsSync(projectJsonPath)) {
  fail(`${projectJsonPath}: missing — the starter must ship its own metadata`);
} else {
  const project = readJson(projectJsonPath);

  if (project.schema_version !== 2) {
    fail(
      `${projectJsonPath}: schema_version is ${JSON.stringify(project.schema_version)}, expected 2`,
    );
  }

  // setup_cli_version is optional: the starter ships no scripts/setup-core (it is
  // added per-project by `git subtree add`), so the starter must NOT declare one.
  const extra = Object.keys(project).filter(
    (key) =>
      !['schema_version', 'slug', 'stack', 'theme_path', 'setup_cli_version'].includes(
        key,
      ),
  );
  if ('setup_cli_version' in project && !existsSync(join(starterDir, 'scripts/setup-core'))) {
    fail(
      `${projectJsonPath}: declares setup_cli_version but the starter ships no scripts/setup-core`,
    );
  }
  if (extra.length > 0) {
    fail(
      `${projectJsonPath}: unexpected keys [${extra.join(', ')}] — versions and flags are derived, not declared`,
    );
  }

  if (project.slug !== 'webentor-starter') {
    fail(
      `${projectJsonPath}: slug is "${project.slug}", expected "webentor-starter"`,
    );
  }

  if (!PROJECT_STACKS.includes(project.stack)) {
    fail(
      `${projectJsonPath}: stack "${project.stack}" is not one of ${PROJECT_STACKS.join(', ')}`,
    );
  }

  // theme_path is what the reporter uses to find the core-consuming theme, so a
  // path that does not resolve means every consumer reports the wrong versions.
  if (!project.theme_path) {
    fail(`${projectJsonPath}: theme_path is missing`);
  } else if (!existsSync(join(starterDir, project.theme_path))) {
    fail(
      `${projectJsonPath}: theme_path "${project.theme_path}" does not exist in the starter`,
    );
  }
}

// The reporter derives the starter release from the root composer.json version,
// so an unversioned or misnamed manifest silently blanks it fleet-wide.
const starterComposer = readJson(join(starterDir, 'composer.json'));
if (starterComposer.name !== 'webikon/webentor-starter') {
  fail(
    `packages/webentor-starter/composer.json: name is "${starterComposer.name}", expected "webikon/webentor-starter"`,
  );
}
if (!/^\d+\.\d+\.\d+$/.test(starterComposer.version ?? '')) {
  fail(
    `packages/webentor-starter/composer.json: version is ${JSON.stringify(starterComposer.version)}, expected a semver string`,
  );
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
