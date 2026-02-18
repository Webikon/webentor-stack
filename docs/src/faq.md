# FAQ

## Setup & initialization

### Should I modify files in scripts/setup-core/?

**No.** `scripts/setup-core/` is managed via `git subtree` from the
`webentor-setup` package. Any changes you make will be lost on the next subtree
update. Instead:

- Put feature toggles in `scripts/.env.setup`
- Put lifecycle logic in `scripts/hooks/<hook>.sh`
- Put reusable helpers in `scripts/project-specific/`

See [Overriding Setup Scripts](./guides/overriding-setup.md) for examples.

---

### Where do I add custom setup logic?

- **Feature toggles** → `scripts/.env.setup`
- **Per-step logic** → `scripts/hooks/<hook-name>.sh`
- **Reusable helpers** → `scripts/project-specific/`
- **Project-wide one-off scripts** → `scripts/project-specific/`

---

### Can I use the stack without 1Password?

Yes. Set in `scripts/.env.setup`:

```dotenv
SETUP_1PASSWORD=false
SETUP_ENV_CHECK=false
```

Then manage your `.env` file manually. You can copy `.env.example` to `.env`
and fill in values yourself, or fetch them from another secrets manager.

---

### What is .webentor/project.json for?

It is CLI-facing metadata created by `webentor-setup init`. It records which
version of `webentor-starter`, `webentor-core`, and the setup CLI a project was
initialized with. The `upgrade-starter` command reads it to determine the
current version and updates `starterVersion` after a successful upgrade.

It is not read by the bash setup runtime. Do not edit it manually unless you
understand the implications for `upgrade-starter`.

---

### What does webentor-setup doctor check?

`doctor` verifies that the minimum required tools are installed and that the
project metadata file exists:

- `php` available in PATH
- `composer` available in PATH
- `pnpm` available in PATH
- `wp` (WP-CLI) available in PATH (optional)
- `scripts/.env.setup` exists
- `.webentor/project.json` exists

Run it with:

```bash
scripts/setup-core/bin/webentor-setup doctor
```

---

## Upgrading

### How do I update setup-core to a newer version?

Pull the new tag via git subtree:

```bash
git subtree pull \
  --prefix=scripts/setup-core \
  webentor-setup \
  vX.Y.Z \
  --squash
```

Then run the upgrade command:

```bash
scripts/setup-core/bin/webentor-setup upgrade-starter \
  --from X.Y.Z-old \
  --to X.Y.Z-new \
  --dry-run true
```

Review the dry-run report, then run with `--dry-run false` to apply.

See [Starter Upgrades](./upgrading/starter-upgrades.md) for the full process.

---

### What is a dry-run upgrade?

When `--dry-run true` (the default), `upgrade-starter` reports what it *would*
change without actually modifying any files. Review the report before applying.

---

## webentor-core

### How do I override a block provided by webentor-core?

Register your own block with the same name in your theme. WordPress uses the
last registered version. Alternatively, use the
`webentor/skip_render_block_blade` filter to bypass the Blade rendering
pipeline for a specific block and render it yourself.

---

### How do I use Cloudinary for images?

See the [Cloudinary Integration guide](./guides/cloudinary.md).

---

## Development

### What PHP version is required?

PHP 8.3 or newer. The `herd.yml` and Dev Container configs target PHP 8.3.

### What Node version is required?

Node 20 LTS or newer. The theme `package.json` specifies `"node": ">=20"`.

### What package manager should I use?

`pnpm` version 10.15.1 or newer (specified in root `package.json`).
