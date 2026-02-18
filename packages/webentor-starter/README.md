<h1 align="center">Webentor Starter</h1>

<p align="center">
  <strong>by Webikon</strong>
</p>

## Overview

Project structure made with [**Bedrock**](https://roots.io/docs/bedrock/master/installation/), modern WordPress stack that helps you get started with the best development tools and project structure.

Much of the philosophy behind Bedrock is inspired by the [Twelve-Factor App](http://12factor.net/) methodology including the [WordPress specific version](https://roots.io/twelve-factor-wordpress/).

Theme made with [**Sage 10**](https://github.com/roots/sage), productivity-driven WordPress starter theme with a modern development workflow.

## Project documentation

See the [Webentor Stack documentation](../../docs/src/index.md) for setup guides, architecture reference, and upgrade instructions.
For project-specific documentation, add a link to your internal wiki or project management tool here.

## Features

- Better folder structure
- Dependency management with [Composer](https://getcomposer.org)
- Easy WordPress configuration with environment specific files
- Environment variables with [Dotenv](https://github.com/vlucas/phpdotenv)
- Autoloader for mu-plugins (use regular plugins as mu-plugins)
- Enhanced security (separated web root and secure passwords with [wp-password-bcrypt](https://github.com/roots/wp-password-bcrypt))
- Automated PHP linting with **PHPCS** & **GrumPHP**
- Automated JS and CSS linting and with formatting with **eslint**, **Stylelint** & **Prettier**
- Ability to create ACF fields & Gutenberg blocks
- Tailwind v4, Vite and much more
- Localhost with Dev Containers

## Requirements

- PHP >= 8.3
- Composer - [Install](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx)
- [Node.js](http://nodejs.org/) >= 20
- [PNPM](https://pnpm.io/installation#using-corepack)

## Installation

Template expects:

- setup runtime in `scripts/setup-core/` (subtree source: `webentor-setup`)
- core package from Composer/npm (`webikon/webentor-core`, `@webikon/webentor-core`)
- lint presets from `@webikon/webentor-configs`

Initialize project metadata with:

```bash
scripts/setup-core/bin/webentor-setup init --project <slug> --starter-version latest --with-db-sync false --env-source 1password --ci-provider gitlab
```

### Setup Core script Ownership

`scripts/setup-core/` is shared git-managed runtime code from `webentor-setup`.
**! IMPORTANT !***: Do not customize files in `scripts/setup-core/` directly in project repos.

Use these project-owned paths for customization:

- `scripts/.env.setup`
- `scripts/hooks/`
- `scripts/project-specific/`

### Windows local enviroment setup

If you don’t have your local Windows development environment set up yet, including:

- GIT with SSH access to GitLab
- VS Code with the GitLab plugin
- Git Bash as your default terminal
- Herd for PHP / Laravel projects
- MySQL server ready for projects
- Antivirus configured so it does not block HTTPS connections during Composer installs

please follow the detailed setup guide here:
[Windows Local Development Environment Setup](https://coda.io/d/Internal-Wiki_dBBLgPsZHo-/Windows-Lokalne-vyvojove-prostredie_suDEuZPj#_luus2eJd)

### Set 1P Service Account TOKEN

**! IMPORTANT** If you already did this for other project, you can skip this step.

Before you need to set 1P Service Account TOKEN. This would allow us to securely download and set all necessary environment variables.
If you've already initialized container and you get error about missing token when running setup.sh script, please set it and restart VSC.

#### MacOs

If you use ZSH, run this command:

```
echo 'export OP_SERVICE_ACCOUNT_TOKEN="replace-this-with-service-token-from-1P"' >> ~/.zshrc
```

Check if variable was added by running `echo $OP_SERVICE_ACCOUNT_TOKEN`.

#### Windows

Open command line on Windows (e.g. Powerlshell) and run:

```
setx OP_SERVICE_ACCOUNT_TOKEN "replace-this-with-service-token-from-1P"
```

(or visit https://phoenixnap.com/kb/windows-set-environment-variable for more info)

### a) Installation with **Herd/Valet/other**

Run `scripts/setup.sh` and follow prompts.

### b) Installation with **Dev Containers**

#### Run containers

**With Visual Studio Code**

Start VS Code, press **Ctrl/Cmd + Shift + P** (opens Command Palette), then find and use **Dev Containers: Clone Repository in Container Volume...** command, when prompted enter repository url.


First time creating containers would last few minutes so please be patient.

When all is done, take a look for message in _Configuring..._ cmd line, this message should start with
_!!! Please read this: !!!_ , and follow instructions. Usually you need to run setup script (`sh .devcontainer/setup.sh`), so please do so and follow further prompts.

When opening website url for the first time, browser will throw error with certificate so click advanced and accept danger.

#### Database

You can access phpMyAdmin at [http://localhost:18100](http://localhost:18100)

## How to develop

Open [/web/app/themes/webentor-theme-v2/README.md](/web/app/themes/webentor-theme-v2/README.md) and check `### Build commands` section.

### Other notes

If you need to adjust `.env` just for you locally, create another one called `.env.local` and set your environment variables there.

## Linters

You can use these linters manually:

- (PHPCS) - `./vendor/bin/grumphp run` - use from the project root, lint full codebase with PHPCS
- (PHP-CS-FIXER) `./vendor/bin/php-cs-fixer fix` - use from the project root, fix PHPCS issues
- (JS) `pnpm lint:js` - use in the theme, lint with ESLint
- (SASS) `pnpm lint:css` - use in the theme, lint with Stylelint

### Pre-commit git hooks

**Important:** GrumPHP, JS and SASS linters are run automatically on pre-commit git hook (using Husky), see `.husky/pre-commit`.

**GrumPHP** also tries to automatically fix issues with **php-cs-fixer**.

## Editor setup

Please make sure your editor is able to use these tools:

- PHPCS, php-cs-fixer
- ESlint, Stylelint, EditorConfig, Prettier
- Tailwind with intellisense

## More Documentation

[Bedrock docs](https://roots.io/docs/bedrock/master/installation/)

[Sage docs](https://github.com/roots/sage), [Sage forum](https://discourse.roots.io/)

[ACF Composer](https://github.com/Log1x/acf-composer) - Composing ACF Fields, Blocks, etc. with WP-CLI

[ACF Builder](https://github.com/StoutLogic/acf-builder) - ACF field registration

[Extended CPTs](https://github.com/johnbillion/extended-cpts) - CPT & Tax registration

[Sage SVG](https://github.com/Log1x/sage-svg) - working with SVGs

.
