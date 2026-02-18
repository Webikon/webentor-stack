import fs from 'node:fs';
import { v4wp } from '@kucrut/vite-for-wp';
import { wp_scripts } from '@kucrut/vite-for-wp/plugins';
import { wordpressThemeJson } from '@roots/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { glob } from 'glob';
// import laravel from 'laravel-vite-plugin';
import { defineConfig, normalizePath } from 'vite';

import webentorConfig from './webentor-config';

// Get all styles and scripts from blocks
const blockStylesEntries = [];
const blocksStyles = glob.sync('./resources/blocks/**/style.css');
blocksStyles.forEach((style) => {
  const normalizedPath = normalizePath(style.replace(`./`, ''));
  blockStylesEntries[normalizedPath.replace('.css', '')] = normalizedPath;
});

const blockScriptsEntries = [];
const blocksScripts = glob.sync('./resources/blocks/**/script.ts');
blocksScripts.forEach((js) => {
  const normalizedPath = normalizePath(js.replace(`./`, ''));
  blockScriptsEntries[normalizedPath.replace('.ts', '')] = normalizedPath;
});

// Write all needed TW classes from responsive settings to JSON files as in TW v4 there is no safelist
fs.writeFileSync(
  'whitelisted-tw-classes.json',
  JSON.stringify(webentorConfig.safelist),
);

export default defineConfig({
  base: '/app/themes/webentor-theme-v2/public/build/',
  publicDir: 'public-assets',
  plugins: [
    tailwindcss(),

    // laravel({
    //   input: [
    //     'resources/scripts/editor.ts',
    //     'resources/scripts/app.ts',
    //     'resources/styles/app.css',
    //     'resources/styles/editor.css',
    //     ...blockStylesEntries,
    //     ...blockScriptsEntries,
    //   ],
    //   refresh: true,
    // }),

    v4wp({
      input: {
        editorJs: 'resources/scripts/editor.ts',
        appJs: 'resources/scripts/app.ts',
        editorStyles: 'resources/styles/editor.css',
        appStyles: 'resources/styles/app.css',
        buttonStyles: 'resources/core-components/button/button.style.css',
        lightboxStyles: 'resources/styles/lightgallery.css',
        ...blockStylesEntries,
        ...blockScriptsEntries,
      },
      outDir: 'public/build',
    }),

    wp_scripts(),
    react({ jsxRuntime: 'classic' }),

    // NOT USED as we use v4wp plugin
    // wordpressPlugin(),

    // Generate the theme.json file in the public/build/assets directory
    // based on the Tailwind config and the theme.json file from base theme folder
    wordpressThemeJson({
      disableTailwindColors: false,
      disableTailwindFonts: false,
      disableTailwindFontSizes: true,
    }),
  ],
  optimizeDeps: {
    // Fix imports from webpack built libraries
    include: ['@10up/block-components'],
  },
  server: {
    host: '127.0.0.1',
    cors: true,
  },
  build: {
    // Make sure all static assets are processed
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      '@scripts': '/resources/scripts',
      '@styles': '/resources/styles',
      '@fonts': '/resources/fonts',
      '@images': '/resources/images',
      '@blocks': '/resources/blocks',
      '@webentorCore': '/node_modules/@webikon/webentor-core/core-js',
    },
  },
});
