import { defineConfig } from 'vitepress';

export default defineConfig({
  // Required for GitHub Pages deployment at <org>.github.io/webentor-stack/
  base: '/webentor-stack/',
  title: 'Webentor Stack',
  description: 'Monorepo architecture, onboarding, and upgrade guides',
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local'
    },
    footer: {
      // message: 'Released under the GPL-2.0 License.',
      copyright: '© 2026 by <a href="https://webikon.sk" target="_blank">Webikon</a>'
    },
    nav: [
      { text: 'Project Setup', link: '/onboarding/setup-init' },
      // Keep Guides pointed to an existing first practical guide.
      { text: 'Guides', link: '/guides/theme-setup' },
      { text: 'Concepts', link: '/concepts/responsive-settings' },
      { text: 'Reference', link: '/reference/php-api' },
    ],
    sidebar: [
      {
        text: 'Project Setup',
        items: [
          { text: 'Setup & Init', link: '/onboarding/setup-init' },
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Responsive Settings', link: '/concepts/responsive-settings' },
          { text: 'Webentor Config', link: '/concepts/webentor-config' },
        ]
      },
      {
        text: 'Guides',
        items: [
          // Keep this sequence stable: first-time setup to advanced operational topics.
          { text: 'Theme Setup', link: '/guides/theme-setup' },
          { text: 'Assets & Build', link: '/guides/assets-and-build' },
          { text: 'Editor Integration', link: '/guides/editor-integration' },
          { text: 'Block Authoring', link: '/guides/block-authoring' },
          { text: 'Editor Components', link: '/guides/editor-components' },
          { text: 'Core Frontend Components', link: '/guides/core-frontend-components' },
          { text: 'Images', link: '/guides/images' },
          { text: '1Password Setup', link: '/guides/1password-setup' },
          { text: 'Overriding Setup Scripts', link: '/guides/overriding-setup' },
          { text: 'Cloudinary Images', link: '/guides/cloudinary' },
          { text: 'Database Sync', link: '/guides/db-sync' },
          { text: 'Typesense Search', link: '/guides/typesense' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'PHP API', link: '/reference/php-api' },
          { text: 'JS / TypeScript API', link: '/reference/js-api' },
          { text: 'Blocks Catalog', link: '/reference/blocks-catalog' },
        ]
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Allowed Blocks', link: '/recipes/allowed-blocks' },
          { text: 'Breadcrumbs', link: '/recipes/breadcrumbs' },
          { text: 'Hero Banner', link: '/recipes/hero-banner' },
          { text: 'Query Loop Customizations', link: '/recipes/query-loop-customizations' },
        ]
      },
      {
        text: 'Upgrading',
        items: [
          { text: 'Starter Upgrades', link: '/upgrading/starter-upgrades' },
        ]
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Repo Boundaries', link: '/architecture/repo-boundaries' },
          { text: 'Theme Architecture', link: '/architecture/theme-architecture' },
        ]
      },
      {
        text: 'Troubleshooting',
        items: [{ text: 'Common Issues', link: '/troubleshooting/common-issues' }]
      },
      {
        text: 'Contributing',
        items: [{ text: 'Monorepo Workflow', link: '/contributing/developer-playbook' }]
      },
      {
        text: 'Meta',
        items: [
          { text: 'Compatibility Matrix', link: '/compatibility-matrix' },
          { text: 'Glossary', link: '/glossary' },
          { text: 'FAQ', link: '/faq' },
        ]
      }
    ]
  }
});
