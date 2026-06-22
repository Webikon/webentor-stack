#!/usr/bin/env node
/**
 * @webikon/webentor-codemods — reusable codemod runner for Webentor Stack
 * consumer projects.
 *
 * A thin wrapper around the bundled `ast-grep` engine (via the `@ast-grep/cli`
 * dependency). Codemods live in `migrations/<id>/rules/*.yml` and are registered
 * in `migrations/index.json`. The runner is intentionally generic: adding a new
 * migration is just a new folder + an index entry — no runner changes needed.
 *
 * Usage (run from your project root):
 *   webentor-codemods list
 *   webentor-codemods run <id> [--path <dir>] [--apply]
 *   webentor-codemods run --since <ver> [--to <ver>] [--package <name>] [--path <dir>] [--apply]
 *
 * Dry-run by default (prints the diff). Pass --apply to write changes.
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyChangelogStep } from '../lib/changelog.mjs';

const require = createRequire(import.meta.url);
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS_DIR = join(PKG_ROOT, 'migrations');

function fail(msg) {
  console.error(`webentor-codemods: ${msg}`);
  process.exit(1);
}

/** Resolve the bundled ast-grep binary shipped via @ast-grep/cli. */
function astGrepBin() {
  try {
    const pkgJson = require.resolve('@ast-grep/cli/package.json');
    const bin = join(dirname(pkgJson), 'ast-grep');
    if (existsSync(bin)) return bin;
  } catch {
    /* fall through to PATH */
  }
  return 'ast-grep'; // last resort: rely on PATH
}

function loadRegistry() {
  const indexPath = join(MIGRATIONS_DIR, 'index.json');
  if (!existsSync(indexPath)) fail(`migrations registry not found at ${indexPath}`);
  try {
    return JSON.parse(readFileSync(indexPath, 'utf8'));
  } catch (e) {
    fail(`could not parse migrations/index.json: ${e.message}`);
  }
}

/** Parse a loose "x.y.z" semver into a comparable tuple. Missing parts -> 0. */
function parseVer(v) {
  const parts = String(v ?? '0')
    .replace(/^[^\d]*/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function cmpVer(a, b) {
  const x = parseVer(a);
  const y = parseVer(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] - y[i];
  }
  return 0;
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function printList(registry) {
  const migrations = registry.migrations ?? [];
  if (!migrations.length) {
    console.log('No migrations registered.');
    return;
  }
  console.log('Available migrations:\n');
  for (const m of migrations) {
    const at = m.appliesTo
      ? ` (${m.appliesTo.package} ${m.appliesTo.from} → ${m.appliesTo.to})`
      : '';
    console.log(`  ${m.id}${at}`);
    if (m.title) console.log(`    ${m.title}`);
    if (m.description) console.log(`    ${m.description}`);
    console.log('');
  }
}

/** Run a single migration's rules (in declared order) against targetPath. */
function runMigration(migration, { targetPath, apply }) {
  const bin = astGrepBin();
  const migDir = join(MIGRATIONS_DIR, migration.id);
  const rules = migration.rules ?? [];
  const changelog = migration.changelog ?? [];
  if (!rules.length && !changelog.length) {
    fail(`migration "${migration.id}" declares no rules`);
  }

  console.log(
    `\n▶ ${migration.id}${apply ? ' (apply)' : ' (dry-run — pass --apply to write)'}`,
  );
  let anyError = false;
  for (const rel of rules) {
    const rulePath = join(migDir, rel);
    if (!existsSync(rulePath)) fail(`rule file not found: ${rulePath}`);
    const args = ['scan', '--rule', rulePath];
    if (apply) args.push('--update-all');
    args.push(targetPath);
    const res = spawnSync(bin, args, { stdio: 'inherit' });
    if (res.error) {
      console.error(`  failed to run ast-grep: ${res.error.message}`);
      anyError = true;
    } else if (res.status !== 0) {
      anyError = true;
    }
  }

  // Changelog sync (not an ast-grep rule — prepend version blocks if missing).
  for (const step of changelog) {
    const results = applyChangelogStep(migDir, step, { root: targetPath, apply });
    for (const r of results) {
      const where = r.status === 'missing' ? r.file : relative(targetPath, r.file) || r.file;
      if (r.status === 'updated') {
        console.log(`\nchangelog[${step.marker}] → ${where}${apply ? ' (written)' : ''}:`);
        console.log(
          r.preview
            .split('\n')
            .map((l) => `   + ${l}`)
            .join('\n'),
        );
      } else if (r.status === 'unchanged') {
        console.log(`changelog[${step.marker}] → ${where}: already present, skipped`);
      } else {
        console.log(`changelog[${step.marker}]: ${where} — ${r.reason} (skipped)`);
      }
    }
  }
  return !anyError;
}

function resolveMigrationsToRun(registry, flags, positional) {
  const migrations = registry.migrations ?? [];

  // `run --since <ver> [--to <ver>] [--package <name>]`
  if (flags.since) {
    const pkg = flags.package || 'webentor-core';
    const from = flags.since;
    const to = flags.to || '999.999.999';
    const selected = migrations.filter((m) => {
      if (!m.appliesTo || m.appliesTo.package !== pkg) return false;
      // Apply migrations whose target ("to") version is in (from, to].
      return cmpVer(m.appliesTo.to, from) > 0 && cmpVer(m.appliesTo.to, to) <= 0;
    });
    if (!selected.length) {
      console.log(
        `No migrations for ${pkg} in range (${from}, ${to}]. Nothing to do.`,
      );
    }
    return selected;
  }

  // `run <id>`
  const id = positional[0];
  if (!id) fail('run requires a migration <id>, or --since <ver>');
  const found = migrations.find((m) => m.id === id);
  if (!found) fail(`unknown migration "${id}". Run "webentor-codemods list".`);
  return [found];
}

function main() {
  const [, , command, ...rest] = process.argv;
  const { positional, flags } = parseArgs(rest);

  if (!command || command === 'help' || flags.help) {
    console.log(
      [
        'webentor-codemods — reusable codemods for Webentor Stack consumer projects',
        '',
        'Commands:',
        '  list                                  List available migrations',
        '  run <id> [--path <dir>] [--apply]     Run one migration (dry-run by default)',
        '  run --since <ver> [--to <ver>]        Run every migration in a version range',
        '       [--package <name>] [--path <dir>] [--apply]',
        '',
        'Run from your project root; --path defaults to the current directory.',
      ].join('\n'),
    );
    process.exit(command ? 0 : 1);
  }

  const registry = loadRegistry();

  if (command === 'list') {
    printList(registry);
    return;
  }

  if (command === 'run') {
    const targetPath = resolve(flags.path || process.cwd());
    if (!existsSync(targetPath)) fail(`--path does not exist: ${targetPath}`);
    const apply = Boolean(flags.apply);
    const toRun = resolveMigrationsToRun(registry, flags, positional);
    let ok = true;
    for (const m of toRun) {
      if (!runMigration(m, { targetPath, apply })) ok = false;
    }
    if (!apply && toRun.length) {
      console.log('\nDry-run complete. Re-run with --apply to write changes.');
    }
    process.exit(ok ? 0 : 1);
  }

  fail(`unknown command "${command}". Run "webentor-codemods help".`);
}

main();
