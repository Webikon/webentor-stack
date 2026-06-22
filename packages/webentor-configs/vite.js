import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { wp_scripts } from '@kucrut/vite-for-wp/plugins';
import { wordpressPlugin } from '@roots/vite-plugin';
import react from '@vitejs/plugin-react';

// Shared WordPress externals interop for the Webentor Vite 8 / Rolldown toolchain.
//
// WordPress provides React and the @wordpress/* packages as browser globals (window.React,
// window.wp.*), so the build externalizes them rather than bundling. Two toolchains handle this
// differently, and each is correct only in one mode — so wordpressExternals() picks per command:
//
//   build  → @roots/vite-plugin's wordpressPlugin() (native Rolldown externals; sheds the
//            rollup-plugin-external-globals tax that kucrut's wp_scripts() carries) plus the two
//            shims below for Rolldown's CJS/React interop quirks.
//   serve  → @kucrut/vite-for-wp's wp_scripts() (vite-plugin-external), which provides real dev
//            stash modules for @wordpress/* so CJS deps that `require('@wordpress/editor')` (e.g.
//            @10up/block-components) resolve, and serves react lazily. roots externalizes
//            uniformly with no dev-server story for those requires, and the build-only require
//            shim can't run in dev.
//
// Usage (in a theme/core vite.config.js):
//   import { wordpressExternals } from '@webikon/webentor-configs/vite';
//   export default defineConfig(({ command }) => ({
//     plugins: [tailwindcss(), v4wp({ ... }), ...wordpressExternals(command) /*, wordpressThemeJson() */],
//   }));

const DEFAULT_EXTERNAL_MAPPINGS = {
  lodash: { global: ['lodash'], handle: 'lodash' },
  moment: { global: ['moment'], handle: 'moment' },
  jquery: { global: ['jQuery'], handle: 'jquery' },
  backbone: { global: ['Backbone'], handle: 'backbone' },
};

const IDENT = /^[A-Za-z_$][\w$]*$/;

// react / react-dom / react/jsx-runtime — served as virtual modules that re-export the
// WP-provided window globals (window.React etc.). They must NOT be externalized: under Rolldown
// that breaks `import * as React` (React$NN = React$NN → undefined → `useInsertionEffect` of
// undefined). The module emits explicit ESM named re-exports — enumerated from the installed
// package (same major WP ships) — so `import { useState }` resolves in both the Rolldown build
// AND Vite's dev server. (A CJS `module.exports = window.React` works in the build via Rolldown
// interop, but Vite dev can't synthesize named bindings from it — only a default — which broke
// `import { useState } from 'react'` in the editor dev server.) Only used on the build path; in
// dev wp_scripts() externalizes react via vite-plugin-external.
function reactGlobalsShim() {
  const shims = {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    'react/jsx-runtime': 'window.ReactJSXRuntime',
  };
  const PREFIX = '\0wp-react-shim:';
  return {
    name: 'wp-react-globals-shim',
    enforce: 'pre',
    resolveId(id) {
      if (Object.prototype.hasOwnProperty.call(shims, id)) {
        return PREFIX + id;
      }
      return null;
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const pkg = id.slice(PREFIX.length);
      // Resolve the package from the consumer's working dir (the theme/core running Vite), so
      // the enumerated export names match the React version WordPress actually ships there.
      const require = createRequire(path.join(process.cwd(), 'vite.config.js'));
      const names = Object.keys(require(pkg)).filter(
        (n) => n !== 'default' && IDENT.test(n),
      );
      return [
        `const m = ${shims[pkg]};`,
        `export default m;`,
        ...names.map((n) => `export const ${n} = m[${JSON.stringify(n)}];`),
      ].join('\n');
    },
  };
}

// Rolldown preserves CJS `require()` of *externalized* modules (e.g. @wordpress/icons does
// require('react/jsx-runtime'); @10up/block-components does require('@wordpress/element')). The
// browser has no `require`, so Rolldown's interop shim throws. We prepend a module-scoped
// `require` that resolves the externalized modules from WP globals.
//
// This must happen in generateBundle (after Oxc minify) so the literal `require` identifier isn't
// mangled — Vite 8/Rolldown drops build.rolldownOptions and offers no post-minify hook, so
// banner/inject/renderChunk all either get stripped or minified. Because that's after the content
// hash is computed, we recompute the hash and rename the chunk ourselves; Vite's manifest plugin
// (enforce:'post') then emits the corrected filename. The shim is prepended without a trailing
// newline so source-map line mapping is preserved.
function wpExternalRequireShim() {
  const shim =
    'var require=function(id){' +
    'if(id.indexOf("@wordpress/")===0){var n=id.slice(11).replace(/-([a-z])/g,function(m,c){return c.toUpperCase()});return window.wp[n];}' +
    'switch(id){' +
    'case"lodash":return window.lodash;' +
    'case"moment":return window.moment;' +
    'case"jquery":return window.jQuery;' +
    'case"backbone":return window.Backbone;' +
    '}throw new Error("Unmapped external require: "+id);};';
  const NEEDLE = "doesn't expose the `require`";
  return {
    name: 'wp-external-require-shim',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'chunk' || !file.code.includes(NEEDLE)) continue;
        file.code = shim + file.code;
        if (file.isEntry) {
          const hash = createHash('sha256')
            .update(file.code)
            .digest('base64url')
            .slice(0, 8);
          file.fileName = file.fileName.replace(/-[\w-]{8}\.js$/, `-${hash}.js`);
        }
      }
    },
  };
}

/**
 * WordPress externals plugin set for a Webentor Vite config, chosen per build command.
 *
 * @param {'build' | 'serve'} command  Vite's resolved command (from `defineConfig(({command}) => …)`).
 * @param {object} [options]
 * @param {Record<string, {global: string[], handle: string}>} [options.externalMappings]
 *        Extra non-@wordpress browser globals to externalize on the build path (defaults to
 *        lodash/moment/jquery/backbone, matching kucrut's wp_scripts()).
 * @param {object} [options.react]  Extra options merged into @vitejs/plugin-react (classic runtime).
 * @returns {import('vite').PluginOption[]}
 */
export function wordpressExternals(command, options = {}) {
  const { externalMappings = DEFAULT_EXTERNAL_MAPPINGS, react: reactOptions } = options;
  const reactPlugin = react({ jsxRuntime: 'classic', ...reactOptions });

  if (command !== 'build') {
    // Dev server: kucrut handles @wordpress/* + react via vite-plugin-external dev stash modules.
    return [wp_scripts(), reactPlugin];
  }

  return [
    reactGlobalsShim(),
    wordpressPlugin({ jsx: false, externalMappings }),
    reactPlugin,
    wpExternalRequireShim(),
  ];
}
