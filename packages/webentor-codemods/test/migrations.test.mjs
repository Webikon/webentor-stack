/**
 * Golden tests for every registered migration.
 *
 * For each migration in `migrations/index.json` we run its rules (via the
 * bundled ast-grep) against the `before.php` fixture and assert the output
 * byte-matches `after.php`, then assert idempotency (re-applying to `after.php`
 * is a no-op) and conservatism (a `customized.php` fixture is left untouched).
 *
 * Adding a new migration with a `__fixtures__/<id>/{before,after}.php` pair is
 * automatically covered — no test changes required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS_DIR = join(PKG_ROOT, 'migrations');
const FIXTURES_DIR = join(MIGRATIONS_DIR, '__fixtures__');

function astGrepBin() {
  const pkgJson = require.resolve('@ast-grep/cli/package.json');
  return join(dirname(pkgJson), 'ast-grep');
}

/** Apply a migration's rules to a copy of `srcFile`, return the resulting text. */
function applyRules(migration, srcFile) {
  const dir = mkdtempSync(join(tmpdir(), 'webentor-codemod-'));
  const target = join(dir, 'setup.php');
  copyFileSync(srcFile, target);
  const bin = astGrepBin();
  for (const rel of migration.rules) {
    const rulePath = join(MIGRATIONS_DIR, migration.id, rel);
    const res = spawnSync(
      bin,
      ['scan', '--rule', rulePath, '--update-all', target],
      { encoding: 'utf8' },
    );
    assert.equal(res.status, 0, `ast-grep failed for ${rulePath}: ${res.stderr}`);
  }
  return readFileSync(target, 'utf8');
}

const registry = JSON.parse(
  readFileSync(join(MIGRATIONS_DIR, 'index.json'), 'utf8'),
);

for (const migration of registry.migrations) {
  const fxDir = join(FIXTURES_DIR, migration.id);
  const before = join(fxDir, 'before.php');
  const after = join(fxDir, 'after.php');

  test(`${migration.id}: before → after is byte-exact`, () => {
    assert.ok(existsSync(before), `missing fixture: ${before}`);
    assert.ok(existsSync(after), `missing fixture: ${after}`);
    const got = applyRules(migration, before);
    const want = readFileSync(after, 'utf8');
    assert.equal(got, want);
  });

  test(`${migration.id}: idempotent (re-apply to after.php is a no-op)`, () => {
    const got = applyRules(migration, after);
    const want = readFileSync(after, 'utf8');
    assert.equal(got, want);
  });

  const customized = join(fxDir, 'customized.php');
  if (existsSync(customized)) {
    test(`${migration.id}: customized file is left untouched`, () => {
      const got = applyRules(migration, customized);
      const want = readFileSync(customized, 'utf8');
      assert.equal(got, want);
    });
  }
}
