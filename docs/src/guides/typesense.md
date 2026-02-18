# Typesense Integration

The starter includes optional [Typesense](https://typesense.org/) search support
via a Docker Compose configuration.

## Enable Typesense

In `scripts/.env.setup`:

```dotenv
SETUP_TYPESENSE=true
```

When enabled, the setup runtime will start the Typesense Docker container
during the setup process.

## Docker Compose configuration

The Typesense container is defined in `typesense-config/docker-compose.yml`.

### API key

The API key is configured via the `WTC_TS_API_KEY` environment variable:

```dotenv
# .env
WTC_TS_API_KEY=your-secure-api-key-here
```

> **Security note:** If `WTC_TS_API_KEY` is not set, it falls back to `"local"`.
> This default is **not secure** and should only be used for temporary local
> testing. Always set a strong API key before connecting to any external service.

### Starting Typesense manually

```bash
cd typesense-config
WTC_TS_API_KEY=your-key docker compose up -d
```

### Checking status

```bash
curl http://localhost:8108/health
# Expected: {"ok":true}
```

## WordPress integration

The Typesense WordPress plugin or custom integration code reads the API key and
host from environment variables. Add to your `.env`:

```dotenv
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=your-secure-api-key-here
```

## Production notes

For production:

- Use HTTPS with a reverse proxy (nginx/Caddy) in front of Typesense
- Use a randomly generated, cryptographically strong API key (e.g. `openssl rand -hex 32`)
- Consider Typesense Cloud instead of self-hosting for managed deployments
- Store the API key in 1Password and fetch it via the setup runtime (see [1Password setup](./1password-setup.md))
