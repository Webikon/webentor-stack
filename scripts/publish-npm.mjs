#!/usr/bin/env node

/**
 * Publishes every npm-released workspace package whose committed version is
 * not on the registry yet. This is the whole release trigger: merge a manual
 * version bump to main and this script publishes it (versioning itself is
 * manual - see AGENTS.md "Release Workflow").
 *
 * Auth comes from .npmrc (NPM_TOKEN). Pass --dry-run to only report what
 * would be published.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const NPM_PACKAGES = [
  'packages/webentor-core',
  'packages/webentor-configs',
  'packages/webentor-codemods',
];

async function isOnRegistry(name, version) {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}`,
  );
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Registry lookup for ${name} failed: ${response.status}`);
  }
  const data = await response.json();
  return Boolean(data.versions && data.versions[version]);
}

let published = 0;

for (const dir of NPM_PACKAGES) {
  const { name, version } = JSON.parse(
    readFileSync(join(root, dir, 'package.json'), 'utf8'),
  );

  if (await isOnRegistry(name, version)) {
    console.log(`${name}@${version} already published, skipping.`);
    continue;
  }

  if (dryRun) {
    console.log(`[dry-run] Would publish ${name}@${version}.`);
    continue;
  }

  console.log(`Publishing ${name}@${version}...`);
  execSync('pnpm publish --access public --no-git-checks', {
    cwd: join(root, dir),
    stdio: 'inherit',
  });
  published += 1;
}

console.log(
  dryRun ? 'Dry-run complete.' : `Done. Published ${published} package(s).`,
);
