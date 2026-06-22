/**
 * Changelog sync - the one codemod step that isn't an ast-grep rewrite.
 *
 * A consumer project inherits its root `changelog.md` and theme `changelog.md`
 * from the starter, so they are meant to mirror the Webentor baseline changelogs.
 * This prepends a release's version block to those files (under the H1 heading) so
 * a consumer's changelog stays up to date, same as the stack.
 *
 * Markdown is a poor fit for ast-grep (headings split the marker from inline text),
 * so this is plain, deterministic string work: insert-if-missing, idempotent,
 * additive (never clobbers existing entries).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Return `existing` with `entryBlock` inserted after the first H1, or `null` if
 * `marker` (the entry's version heading) is already present (no change).
 */
export function syncChangelog(existing, entryBlock, marker) {
  const wanted = marker.trim();
  const alreadyThere = existing.split('\n').some((l) => l.trim() === wanted);
  if (alreadyThere) return null;

  const block = entryBlock.replace(/\n+$/, '');
  const lines = existing.split('\n');
  const h1 = lines.findIndex((l) => /^#\s+/.test(l));

  if (h1 === -1) {
    // No H1: prepend the block at the very top.
    return block + '\n\n' + existing.replace(/^\n+/, '');
  }
  const head = lines.slice(0, h1 + 1).join('\n');
  const rest = lines.slice(h1 + 1).join('\n').replace(/^\n+/, '');
  return head + '\n\n' + block + '\n\n' + rest;
}

/**
 * Minimal path resolver supporting a whole-segment `*` wildcard (no partial or
 * recursive globs). Enough for `changelog.md` and `web/app/themes/*\/changelog.md`.
 * Returns existing paths only.
 */
export function resolveTargets(root, pattern) {
  let dirs = [root];
  const segs = pattern.split('/').filter(Boolean);
  segs.forEach((seg, i) => {
    const last = i === segs.length - 1;
    const next = [];
    for (const d of dirs) {
      if (!existsSync(d)) continue;
      if (seg === '*') {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          if (last ? e.isFile() : e.isDirectory()) next.push(join(d, e.name));
        }
      } else {
        const p = join(d, seg);
        if (existsSync(p)) next.push(p);
      }
    }
    dirs = next;
  });
  return dirs;
}

/**
 * Apply one changelog step against `root`. Returns a per-file result list:
 *   { file, status: 'updated' | 'unchanged' | 'missing', preview? }
 * Writes only when `apply` is true.
 */
export function applyChangelogStep(migrationDir, step, { root, apply }) {
  const entryPath = join(migrationDir, step.entry);
  if (!existsSync(entryPath)) {
    return [{ file: step.target, status: 'missing', reason: 'entry not found: ' + entryPath }];
  }
  const entryBlock = readFileSync(entryPath, 'utf8');
  const targets = resolveTargets(root, step.target);
  if (!targets.length) {
    return [{ file: step.target, status: 'missing', reason: 'no matching file in project' }];
  }
  return targets.map((file) => {
    const existing = readFileSync(file, 'utf8');
    const updated = syncChangelog(existing, entryBlock, step.marker);
    if (updated === null) return { file, status: 'unchanged' };
    if (apply) writeFileSync(file, updated);
    return { file, status: 'updated', preview: entryBlock.replace(/\n+$/, '') };
  });
}
