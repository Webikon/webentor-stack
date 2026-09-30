# 1Password Integration

The setup runtime can fetch your `.env` file directly from a 1Password vault,
removing the need to share secrets via files or chat.

## Prerequisites

- [1Password CLI](https://developer.1password.com/docs/cli/) (`op`) installed
- Your own 1Password account with access to the vault, and the 1Password app's
  CLI integration turned on (Settings → Developer → Integrate with 1Password CLI)
- An item in that vault whose `env-valet` field holds the project's `.env`

## How it works

When `SETUP_1PASSWORD=true` is set in `scripts/.env.setup`, the setup runtime:

1. Reads `OP_VAULT_ID` and `OP_ITEM_ID` from `scripts/.env.setup`
2. Runs `op read op://<OP_VAULT_ID>/<OP_ITEM_ID>/env-valet`; the 1Password app asks you to approve
3. Writes the `.env` file to the project root (mode 600). If the read fails, an existing `.env`
   is left untouched

## Configuration

### 1. Find your vault ID

```bash
op vault list
```

Copy the ID column value for your target vault.

### 2. Find your item ID

```bash
op item get "Your .env item name" --format json | jq -r '.id'
```

### 3. Set the IDs in scripts/.env.setup

```dotenv
OP_VAULT_ID=your_vault_id_here
OP_ITEM_ID=your_item_id_here
SETUP_1PASSWORD=true
```

### 4. Authenticate the CLI

On your machine, use your own account through the 1Password app integration. There is nothing
to export: `op` asks the app, and the app asks you.

**Do not export `OP_SERVICE_ACCOUNT_TOKEN` in your shell profile.** A service-account token is
one long-lived credential for the whole vault, shared by everyone who has it. A single paste
into a chat, a screenshot or shell history leaks every project's `.env`, and revoking it breaks
everyone at once. Setup ignores the token outside CI: it warns and uses your account instead.

In CI (`CI=true`, which GitHub Actions and GitLab CI set), setup honours
`OP_SERVICE_ACCOUNT_TOKEN`. Store it as a masked CI secret, never in the repository.

## Fallback: manual mode

Set `SETUP_1PASSWORD=false` and `SETUP_ENV_CHECK=false` to skip 1Password
and manage `.env` manually:

```dotenv
SETUP_1PASSWORD=false
SETUP_ENV_CHECK=false
```

Then copy `.env.example` to `.env` and fill in the values yourself.

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `authorization timeout` | The 1Password app prompt went unanswered | Unlock the app, re-run, and approve the prompt |
| `OP_SERVICE_ACCOUNT_TOKEN is set outside CI` | The token is exported in your shell profile | Remove the `export` line; setup already used your own account |
| `[ERROR] 401 Unauthorized` (CI) | Invalid or expired service account token | Re-generate the CI secret |
| `[ERROR] Item not found` | Wrong `OP_ITEM_ID` | Run `op item get "name" --format json \| jq -r '.id'` |
| `[ERROR] Vault not found` | Wrong `OP_VAULT_ID` | Run `op vault list` to get the correct ID |
| `op: command not found` | 1Password CLI not installed | Install from [1password.com/downloads/command-line](https://1password.com/downloads/command-line/) |
| `op: not signed in` | App integration off, or the app is locked | Turn on the CLI integration in the app, or run `op signin` |
| `OP_SERVICE_ACCOUNT_TOKEN not set` | Missing env var in CI | Set the token as a CI secret variable |

## Dev Container notes

In Dev Containers, 1Password CLI must be installed in the container image or
as a feature. If you are not using 1Password in containers, set
`SETUP_1PASSWORD=false` in `scripts/.env.setup` and provide `.env` via
another mechanism (e.g., a mounted secret or CI variable).
