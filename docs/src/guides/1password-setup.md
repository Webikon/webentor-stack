# 1Password Integration

The setup runtime can fetch your `.env` file directly from a 1Password vault,
removing the need to share secrets via files or chat.

## Prerequisites

- [1Password CLI](https://developer.1password.com/docs/cli/) (`op`) installed
- A 1Password service account or user account with access to the vault
- A secure note or login item in 1Password containing your `.env` contents

## How it works

When `SETUP_1PASSWORD=true` is set in `scripts/.env.setup`, the setup runtime:

1. Reads `OP_VAULT_ID` and `OP_ITEM_ID` from `scripts/.env.setup`
2. Runs `op item get <OP_ITEM_ID> --vault <OP_VAULT_ID>` to fetch the item
3. Writes the `.env` file to the project root

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

For CI/CD environments use a service account token:

```bash
export OP_SERVICE_ACCOUNT_TOKEN=ops_...
```

For local development, sign in interactively:

```bash
eval $(op signin)
```

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
| `[ERROR] 401 Unauthorized` | Invalid or expired service account token | Re-generate `OP_SERVICE_ACCOUNT_TOKEN` |
| `[ERROR] Item not found` | Wrong `OP_ITEM_ID` | Run `op item get "name" --format json \| jq -r '.id'` |
| `[ERROR] Vault not found` | Wrong `OP_VAULT_ID` | Run `op vault list` to get the correct ID |
| `op: command not found` | 1Password CLI not installed | Install from [1password.com/downloads/command-line](https://1password.com/downloads/command-line/) |
| `op: not signed in` | CLI session expired | Run `eval $(op signin)` |
| `OP_SERVICE_ACCOUNT_TOKEN not set` | Missing env var in CI | Set the token as a CI secret variable |

## Dev Container notes

In Dev Containers, 1Password CLI must be installed in the container image or
as a feature. If you are not using 1Password in containers, set
`SETUP_1PASSWORD=false` in `scripts/.env.setup` and provide `.env` via
another mechanism (e.g., a mounted secret or CI variable).
