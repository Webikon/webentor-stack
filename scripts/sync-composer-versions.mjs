#!/usr/bin/env node

/**
 * Syncs "version" from package.json into sibling composer.json for every
 * package in packages/*. Intended to run right after `changeset version`
 * so the Composer manifest stays in lockstep with npm.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const packagesDir = join(import.meta.dirname, '..', 'packages');

for (const name of readdirSync(packagesDir)) {
  const pkgPath = join(packagesDir, name, 'package.json');
  const composerPath = join(packagesDir, name, 'composer.json');

  if (!existsSync(pkgPath) || !existsSync(composerPath)) continue;

  const pkgVersion = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  const composer = JSON.parse(readFileSync(composerPath, 'utf8'));

  if (!pkgVersion || composer.version === pkgVersion) continue;

  composer.version = pkgVersion;
  writeFileSync(composerPath, JSON.stringify(composer, null, 2) + '\n');
  console.log(`Synced ${name}/composer.json → ${pkgVersion}`);
}
