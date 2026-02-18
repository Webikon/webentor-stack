---
layout: home
title: Webentor Stack
hero:
  name: "Webentor Stack"
  text: "Modern WordPress Development Stack"
  tagline: "Build Gutenberg experiences faster with React in the editor, Blade on the frontend, and a production-ready Bedrock + Sage foundation."
  actions:
    - theme: brand
      text: Setup & Init
      link: /onboarding/setup-init
    - theme: alt
      text: Architecture
      link: /architecture/theme-architecture
    - theme: alt
      text: API Reference
      link: /reference/php-api
features:
  - title: "Gutenberg + React + Blade"
    details: "Create blocks with React editor UIs and render frontend output with Blade SSR for cleaner templates and reusable view components."
    link: /guides/block-authoring
    linkText: Block Authoring
  - title: "Built on Bedrock + Sage 10"
    details: "Run on a modern WordPress foundation with predictable structure, dependency management, and theme workflow."
    # Route users to the canonical guide now that Getting Started page is removed.
    link: /guides/theme-setup
    linkText: Theme Setup
  - title: "Tooling Already Wired"
    details: "PHPCS, ESLint, Stylelint, Prettier, and EditorConfig are standardized through shared configs for consistent quality."
    link: /guides/assets-and-build
    linkText: Assets & Build
---


## In the box

- `webentor-core`: shared PHP + JS runtime and block system.
- `webentor-setup`: setup runtime and CLI workflows.
- `webentor-configs`: shared lint/format/tooling presets.
- `webentor-starter`: Bedrock + Sage 10 starter composition.

## Start now

- Setup project: [Setup & Init](/onboarding/setup-init)
- Understand architecture: [Theme Architecture](/architecture/theme-architecture)
- Integrate APIs: [PHP API](/reference/php-api) / [JS API](/reference/js-api)
