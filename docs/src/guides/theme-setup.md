# Theme setup

Wire Core into your theme and project conventions.

## Add/override blocks

- Structure: `resources/blocks/<slug>/` with `block.json`, `<slug>.block.tsx`, `view.blade.php`, optional `style.css`, `script.ts`.
- Core auto-registers theme blocks and FE assets.
- Override a core block view: add `resources/views/blocks/<slug>/view.blade.php` in your theme.

## Responsive settings

Enable under `supports.webentor` in `block.json`.

```json
{
  "supports": { "webentor": { "display": true, "spacing": true, "grid": true } }
}
```

Provide theme tokens/breakpoints via JS filters (see [Editor integration](editor-integration.md)).

## Build integration

Use `@kucrut/vite-for-wp` in theme too; output `public/build/manifest.json`. Match aliases with Core for painless imports. See [Assets & build](assets-and-build.md).

## Theme bootstrapping (assets)

Enqueue editor and frontend assets from your theme build:

```php
add_action('enqueue_block_editor_assets', function (): void {
    $deps = \Illuminate\Support\Facades\File::exists(get_template_directory() . '/public/build/editor.deps.json')
        ? \Illuminate\Support\Facades\File::json(get_template_directory() . '/public/build/editor.deps.json')
        : [];

    \Kucrut\Vite\enqueue_asset(get_template_directory() . '/public/build', 'resources/scripts/editor.ts', [
        'handle' => 'theme-blocks-editor',
        'dependencies' => $deps,
        'in-footer' => true,
    ]);

    \Kucrut\Vite\enqueue_asset(get_template_directory() . '/public/build', 'resources/styles/editor.css', [
        'handle' => 'theme-blocks-editor-styles',
        'css-only' => true,
    ]);
});

add_action('wp_enqueue_scripts', function () {
    \Kucrut\Vite\enqueue_asset(get_template_directory() . '/public/build', 'resources/scripts/app.ts', [
        'handle' => 'theme-app-scripts',
        'in-footer' => true,
    ]);
    \Kucrut\Vite\enqueue_asset(get_template_directory() . '/public/build', 'resources/styles/app.css', [
        'handle' => 'theme-app-styles',
        'css-only' => true,
    ]);
});
```

Use the generated theme.json from your build output:

```php
add_filter('theme_file_path', function ($path, $file) {
    return $file === 'theme.json' ? public_path('build/assets/theme.json') : $path;
}, 10, 2);
```

## Per-block data files

Colocate PHP for a block under `resources/blocks/<slug>/data.php` and load it from your service provider:

```php
foreach (glob(get_template_directory() . '/resources/blocks/**/data.php') as $file) {
    require_once $file;
}
```

Inside `data.php` use filters to augment render data/HTML:

```php
add_filter('webentor/block_additional_data', function ($data, $block) {
    if ($block->name === 'webentor/b-hero') {
        $data['heroVariant'] = 'default';
    }
    return $data;
}, 10, 2);
```

## Control allowed blocks

```php
add_filter('allowed_block_types_all', function ($allowed, $context) {
    $allow = [ 'core/heading', 'core/paragraph', 'core/table', 'gravityforms/form' ];
    return is_array($allowed) ? array_merge($allowed, $allow) : $allow;
}, 99, 2);
```

## Next steps

- [Editor integration](editor-integration.md)
- [Images](images.md)


