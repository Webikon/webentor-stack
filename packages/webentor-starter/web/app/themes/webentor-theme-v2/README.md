# Webentor Theme

Advanced WP starter theme with modern workflow.

## Features

- Based on [Sage 11](https://github.com/roots/sage) and [Acorn](https://github.com/roots/acorn) by [Roots](https://roots.io)
- API to easily create Gutenberg blocks with React
- Tailwind v4 with boosted CSS capabilities and PostCSS
- Typescript & modern JavaScript
- Templating with [Blade](https://laravel.com/docs/11.x/blade)
- Frontend building with [Vite](https://vite.dev/)
- PHP, JS and CSS linting/formatting with **phpcs**, **eslint**, **Stylelint** & **Prettier**
- Dependency management with [Composer](https://getcomposer.org)

## Requirements

- [WordPress](https://wordpress.org/) >= 6.7
- [PHP](https://secure.php.net/manual/en/install.php) >= 8.3
- [Composer](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx)
- [Node.js](http://nodejs.org/) >= 20

## How to start

- Run `composer install` from the theme directory to install composer dependencies
- Run `pnpm` from the theme directory to install node dependencies
- ~~(temporary) Run `pnpm` and `pnpm build` in `webentor-core` folder~~

Then:

- `pnpm dev` — Run dev server, compile assets and watch for file changes
- `pnpm build` — Compile assets

### Updating stack

Check CHANGELOG in **[webentor-core](https://github.com/Webikon/webentor-core)**.

- Run `pnpm webentor:update`

### Linters

Linters used in project. Make sure your editor has proper extensions:

- `editorconfig` for basic editor defaults
- `prettier` for JS and CSS formatting
- `eslint` for JS
- `stylelint` for CSS
- `phpcs` for PHP

## How to work with this theme

### Basic setup

#### Core packages

We have core package named **[webentor-core](https://github.com/Webikon/webentor-core)**.
Contains PHP library where all core blocks and views are defined. We also enqueue some basic styles and have available a bunch of helper functions, e.g. for images (more below).
Contains JS library from which we can import JS core functionality for blocks, block components, etc. Import from `@webentorCore/**`.

#### Tailwind v4 Theme

Config for colors, typography, etc. is in `resources/styles/common/_theme.css`.
See https://tailwindcss.com/docs/theme

Colors variables are also used to generate Gutenberg color pallete in `theme.json`.

#### Typography

Typography utilities are defined in `resources/styles/common/_utilities.css`. We can then use them as classes or via `@apply`.

Custom fonts should be uploaded to `resources/fonts/` and defined as `@fontface` in `resources/styles/common/_fonts.css`.

#### Responsive images and resizing

Responsive images are provided by `webikon/webentor-core` package.
We have multiple helpers to work with images, see `webentor-core/app/images.php` namespaced with `Webentor\Core`.

Example 1: We want to output `<picture>` element where default image size would be 1024x700 with cropping, resize and crop to 600x400 until 480px screen width and resize to 700x500 without crop up until 768px screen width, also add `block` class.
We'll use `\Webentor\Core\get_resized_picture()` function.
Look at the third parameter, it is multidimensional array, keys `480` or `768` mean "screen max-width", so sizes in nested array would be applied up until that max-width.
Those keys should be the same as we use in Tailwind, `480`, `768`, `992`, `1200`

```
\Webentor\Core\get_resized_picture(
    $img_id,
    [1024, 700, true]
    [
        480 => [600, 400, true],
        768 => [700, 500],
    ],
    ['class' => 'block'],
)
```

Example 2: We don't need responsive image. We want to output `<img>` element where default image size would be 1024x700 with cropping, and also add `block` class.
We'll use `\Webentor\Core\get_resized_image()` function.

```
\Webentor\Core\get_resized_picture(
    $img_id,
    [1024, 700],
    true,
    ['class' => 'block'],
)
```

Example 3: We want to create our custom `<img>` (e.g. in blade template) and just need url of resized image which would be 1024x700 with croping.
We'll use `\Webentor\Core\get_resized_image_url()` function.

```
\Webentor\Core\get_resized_image_url(
    $img_id,
    [1024, 700],
    true
)
```

#### SVG

You can use SVG in blade with `@svg('images.svg.svg_name')`, SVGs must be uploaded to `resources/images/svg/` folder.

#### Global styles and scripts

Global styles and scripts are in `resources/` folder.

- `resources/styles/app.css` - main CSS file which would be loaded everywhere on the frontend.
- `resources/styles/editor.css` main CSS file which would be loaded only in Gutenberg editor.
- `resources/scripts/app.js` main JS file which would be loaded everywhere on the frontend.
- `resources/scripts/editor.js` main JS file which would be loaded only in Gutenberg editor.

Important, all partials which are imported to main CSS/JS files should be named with `_` prefix, e.g. `_button.css`.

#### Gutenberg

See these excellent [Gutenberg Best Practices](https://gutenberg.10up.com/) from 10up.

##### WP Full Site Editing

Use `theme.json` to customize some global settings and styles. Colors are automatically generated from Tailwind theme with Vite.

You can create `parts`, `templates` and `patterns` in their respective folders.
See more docs:

- [Template Editor](https://wordpress.org/documentation/article/template-editor/)
- [Patterns](https://wordpress.org/documentation/article/site-editor-patterns/)
- [Comparing Patterns and Template Parts](https://wordpress.org/documentation/article/comparing-patterns-template-parts-and-reusable-blocks/)
- [theme.json](https://developer.wordpress.org/themes/global-settings-and-styles/)

##### Blocks

All custom blocks are located in `resources/blocks/` folder.
**Important!** If you want to add new styles/scripts files to the block, you need to restart your building process.

- **required** Block settings are defined in `blocks/{block_name}/block.json` file. Block name must be prefixed `webentor/`. See [WP docs](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/).
- **required** Block edit (React) is defined in `blocks/{block_name}/{block_name}.block.tsx`
- **required** Block frontend output is in ``blocks/{block_name}/view.blade.php`, we can use Blade templating.
- (optional) Block related frontend **styles** can be defined in `blocks/{block_name}/style.css`
- (optional) Block related frontend **javascript** can be defined in `blocks/{block_name}/script.ts`.
- (optional) Block data which would be passed to block view can be defined in `blocks/{block_name}/data.php`.

#### Views ovewriting

You can overwrite every view used in `webentor-core` using the same path in the theme. E.g. if you want to overwrite `webentor-core/resources/views/components/accordion.blade.php`, just create use the same path in the theme `webentor-theme-v2/resources/views/components/accordion.blade.php`.

#### Custom reusable components

You can code reusable components in `resources/views/components/` folder and use Blade templating.
Then include component in block view with `@include()`, e.g. `@include('components.button, ['title' => 'My Title'])`. First param is path to component and second param is data passed to the component.
Or create class based component and use it like `<x-button title="My Title" />`.
See [Laravel Blade Templates](https://laravel.com/docs/11.x/blade#components).

#### Defining CPTs and Taxonomies

Use `app/cpts-tax.php` file. See [docs](https://github.com/johnbillion/extended-cpts/wiki) on how to do that.
For CPT/Taxonomy slug please use lowercase, underscores notation and singular, so **`faq_category`** instead of `faq-category`.

#### ACF Fields

ACF fields are defined in `app/Fields` folder. We use [acf-builder](https://github.com/StoutLogic/acf-builder) library and you can find its [cheatsheet here](https://github.com/StoutLogic/acf-builder/wiki/field-types) and [more ACF fields docs here](https://www.advancedcustomfields.com/resources/register-fields-via-php/#field-type-settings).
Please make sure to understand defaults noticed in both documentations as you can skip those when defining fields.
For fields ids use lowercase and underscores notation, so use **`btn_text`** instead of `Btn-text`.

#### Custom functionality

Add all custom PHP functionality to `app/` folder.

- Contextually split related features to separate files. Those files must then be included in the array at the bottom of `functions.php`.
- Prefer anonymous functions when adding hooks. If you use normal function don't forget to add namespace `App\` to function in second hook parameter.

```
// Hook example with anonymous function
add_action('after_setup_theme', function () {
});

// Hook example with normal function, with namespace prefix
function hook_example() {}
add_action('after_setup_theme', 'App\hook_example');
```

#### Theme translation

Use `pnpm translate:pot` to generate POT file in `resources/languages/`. Then translate this POT file using **Loco Translate** plugin.

### XDebug

TODO...

In Blade, because it is compiled to PHP, you need to add breakpoint manually with `@xdebugBreak`, or use snippet `xd` which will autocomplete it.

### Other DEV Notes

- Vite build is implemented with `@kucrut/vite-for-wp`. We also have to handle external dependency extraction via `vite-plugin-external` and `rollup-plugin-external-globals` (peer dependencies).

### Troubleshoot

- If there is some problem with blade views like they are not rendered correctly or you are gettings errors from Acorn about Providers, etc. Try to run `wp acorn optimize:clear` from terminal or manually remove `web/app/cache/acorn` folder, that would clear all blade cache.

## More documentation

- [Roots Discourse](https://discourse.roots.io/)
- [Roots Blog](https://roots.io/blog/)
- [Sage docs](https://roots.io/sage/)
- [Acorn docs](https://roots.io/acorn/)

Made with <3 by [Webikon](https://webikon.sk)
