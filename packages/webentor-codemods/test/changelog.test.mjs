/**
 * Tests for the changelog-sync step (the one non-ast-grep codemod action).
 *
 * Covers the pure insertion logic (insert-after-H1, idempotency, no-H1 prepend),
 * the target globber, and a registry consistency check: every migration that
 * declares `changelog` entries must have the entry file present and its first
 * heading must equal the declared `marker`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  syncChangelog,
  resolveTargets,
  applyChangelogStep,
} from '../lib/changelog.mjs';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS_DIR = join(PKG_ROOT, 'migrations');

const H1 = '# Webentor Theme Changelog';
const ENTRY = '### Version 2.1.0\n\n- New thing\n';
const MARKER = '### Version 2.1.0';

test('inserts the block right after the H1', () => {
  const before = `${H1}\n\n### Version 2.0.7\n\n- Old thing\n`;
  const out = syncChangelog(before, ENTRY, MARKER);
  assert.equal(
    out,
    `${H1}\n\n### Version 2.1.0\n\n- New thing\n\n### Version 2.0.7\n\n- Old thing\n`,
  );
});

test('idempotent: returns null when the marker is already present', () => {
  const already = `${H1}\n\n### Version 2.1.0\n\n- New thing\n\n### Version 2.0.7\n`;
  assert.equal(syncChangelog(already, ENTRY, MARKER), null);
});

test('re-applying the produced output is a no-op', () => {
  const before = `${H1}\n\n### Version 2.0.7\n`;
  const once = syncChangelog(before, ENTRY, MARKER);
  assert.notEqual(once, null);
  assert.equal(syncChangelog(once, ENTRY, MARKER), null);
});

test('no H1: prepends the block at the top', () => {
  const before = '### Version 2.0.7\n\n- Old\n';
  const out = syncChangelog(before, ENTRY, MARKER);
  assert.equal(out, `### Version 2.1.0\n\n- New thing\n\n### Version 2.0.7\n\n- Old\n`);
});

test('marker match is whole-line (a version substring elsewhere does not count)', () => {
  const before = `${H1}\n\n- mentions 2.1.0 in prose, not a heading\n`;
  const out = syncChangelog(before, ENTRY, MARKER);
  assert.notEqual(out, null, 'should still insert — no "### Version 2.1.0" heading present');
});

test('resolveTargets handles exact paths and a single * segment', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'wcm-glob-'));
  mkdirSync(join(tmp, 'web/app/themes/alpha'), { recursive: true });
  mkdirSync(join(tmp, 'web/app/themes/beta'), { recursive: true });
  writeFileSync(join(tmp, 'changelog.md'), H1);
  writeFileSync(join(tmp, 'web/app/themes/alpha/changelog.md'), H1);
  writeFileSync(join(tmp, 'web/app/themes/beta/changelog.md'), H1);

  assert.deepEqual(resolveTargets(tmp, 'changelog.md'), [join(tmp, 'changelog.md')]);
  assert.deepEqual(
    resolveTargets(tmp, 'web/app/themes/*/changelog.md').sort(),
    [
      join(tmp, 'web/app/themes/alpha/changelog.md'),
      join(tmp, 'web/app/themes/beta/changelog.md'),
    ].sort(),
  );
  assert.deepEqual(resolveTargets(tmp, 'missing.md'), []);
});

test('applyChangelogStep reports missing target without throwing', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'wcm-miss-'));
  const res = applyChangelogStep(join(MIGRATIONS_DIR, '0.15.0'), {
    entry: 'changelog/theme.md',
    target: 'web/app/themes/*/changelog.md',
    marker: MARKER,
  }, { root: tmp, apply: false });
  assert.equal(res[0].status, 'missing');
});

// Registry consistency: declared changelog entries exist and their first heading
// matches the declared marker.
const registry = JSON.parse(readFileSync(join(MIGRATIONS_DIR, 'index.json'), 'utf8'));
for (const m of registry.migrations) {
  for (const step of m.changelog ?? []) {
    test(`${m.id}: changelog entry "${step.entry}" first heading equals marker`, () => {
      const block = readFileSync(join(MIGRATIONS_DIR, m.id, step.entry), 'utf8');
      const firstHeading = block.split('\n').find((l) => l.trim().startsWith('#'));
      assert.equal(firstHeading.trim(), step.marker.trim());
    });
  }
}
