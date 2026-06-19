/**
 * Golden tests for every registered migration.
 *
 * Each migration has a fixture *directory* trio under `__fixtures__/<id>/`:
 *   before/      the pre-migration project subtree (e.g. app/setup.php, package.json, composer.json)
 *   after/       the expected post-migration subtree (byte-exact target)
 *   customized/  (optional) a subtree that must be left untouched (no-op guard)
 *
 * For each migration we copy `before/` to a temp dir, run its rules (via the
 * bundled ast-grep, which dispatches each rule to the files its `language`
 * matches), and assert the whole tree byte-matches `after/`. Then idempotency
 * (re-applying to `after/` is a no-op) and conservatism (`customized/` is
 * untouched). Polyglot migrations (PHP + JSON) are covered automatically.
 *
 * Adding a new migration with a `before/`+`after/` fixture pair needs no test
 * changes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  cpSync,
  readFileSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS_DIR = join(PKG_ROOT, 'migrations');
const FIXTURES_DIR = join(MIGRATIONS_DIR, '__fixtures__');

function astGrepBin() {
  const pkgJson = require.resolve('@ast-grep/cli/package.json');
  return join(dirname(pkgJson), 'ast-grep');
}

/** Recursively list files under `dir`, as paths relative to it (sorted). */
function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      out.push(relative(dir, join(entry.parentPath ?? entry.path, entry.name)));
    }
  }
  return out.sort();
}

/** Copy a fixture tree to a temp dir, apply all the migration's rules, return the temp dir. */
function applyRulesToTree(migration, srcDir) {
  const tmp = mkdtempSync(join(tmpdir(), 'webentor-codemod-'));
  cpSync(srcDir, tmp, { recursive: true });
  const bin = astGrepBin();
  for (const rel of migration.rules) {
    const rulePath = join(MIGRATIONS_DIR, migration.id, rel);
    const res = spawnSync(
      bin,
      ['scan', '--rule', rulePath, '--update-all', tmp],
      { encoding: 'utf8' },
    );
    assert.equal(res.status, 0, `ast-grep failed for ${rulePath}: ${res.stderr}`);
  }
  return tmp;
}

/** Assert `gotDir` and `expectedDir` hold the same files with byte-identical contents. */
function assertTreeEqual(gotDir, expectedDir) {
  assert.deepEqual(
    listFiles(gotDir),
    listFiles(expectedDir),
    'resulting file set differs from expected',
  );
  for (const rel of listFiles(expectedDir)) {
    assert.equal(
      readFileSync(join(gotDir, rel), 'utf8'),
      readFileSync(join(expectedDir, rel), 'utf8'),
      `content mismatch in ${rel}`,
    );
  }
}

const registry = JSON.parse(
  readFileSync(join(MIGRATIONS_DIR, 'index.json'), 'utf8'),
);

for (const migration of registry.migrations) {
  const fxDir = join(FIXTURES_DIR, migration.id);
  const before = join(fxDir, 'before');
  const after = join(fxDir, 'after');

  test(`${migration.id}: before → after is byte-exact`, () => {
    assert.ok(existsSync(before), `missing fixture dir: ${before}`);
    assert.ok(existsSync(after), `missing fixture dir: ${after}`);
    const got = applyRulesToTree(migration, before);
    assertTreeEqual(got, after);
  });

  test(`${migration.id}: idempotent (re-apply to after/ is a no-op)`, () => {
    const got = applyRulesToTree(migration, after);
    assertTreeEqual(got, after);
  });

  const customized = join(fxDir, 'customized');
  if (existsSync(customized)) {
    test(`${migration.id}: customized tree is left untouched`, () => {
      const got = applyRulesToTree(migration, customized);
      assertTreeEqual(got, customized);
    });
  }
}
