# PHP API Reference

All functions are in the `Webentor\Core` namespace unless otherwise noted.

## Image functions

### `get_resized_cloud_picture()`

Generates a responsive `<picture>` element using Cloudinary.

```php
get_resized_cloud_picture(
    int $attachment_id,
    array|string $default_size,
    array $sizes = [],
    array $attr = [],
    array $options = []
): string
```

**Parameters:**
- `$attachment_id` — WordPress attachment ID
- `$default_size` — `[width, height, crop]` or WP size string (`'full'`)
- `$sizes` — breakpoint map: `[max_width_px => [width, height, crop]]`
- `$attr` — additional `<img>` attributes; `retina => false` disables 2x srcset
- `$options` — Cloudinary options, e.g. `['g' => 'face']`

See [Cloudinary guide](../guides/cloudinary.md) for full usage.

---

### `get_resized_cloud_picture_by_url()`

Same as `get_resized_cloud_picture()` but accepts a URL string.

```php
get_resized_cloud_picture_by_url(
    string $url,
    array|string $default_size,
    array $sizes = [],
    array $attr = [],
    array $options = []
): string
```

---

### `get_resized_cloud_image_url_by_url()`

Returns just the Cloudinary fetch URL (no HTML).

```php
get_resized_cloud_image_url_by_url(
    string $url,
    array $size,
    string $crop = 'fill',
    array $options = []
): string
```

---

### `get_resized_picture()`

Generates a `<picture>` element using the Better Image Sizes (BIS) plugin.
Requires the [Better Image Sizes](https://wordpress.org/plugins/better-image-sizes/) plugin.

```php
get_resized_picture(
    int $attachment_id,
    array|string $default_size,
    array $sizes = [],
    array $attr = []
): string
```

---

### `get_resized_image()`

Returns a single `<img>` element using BIS.

```php
get_resized_image(
    int $attachment_id,
    array|string $size,
    bool $crop = false,
    array $attr = []
): string
```

---

### `get_resized_image_url()`

Returns just the image URL.

```php
get_resized_image_url(
    int $attachment_id,
    array|string $size,
    bool $crop = false
): string
```

---

## Breakpoint utilities

### `get_theme_breakpoints()`

Returns the breakpoint map from global theme settings.

```php
get_theme_breakpoints(): array
// e.g. ['basic' => 0, 'sm' => 640, 'md' => 768, 'lg' => 1024]
```

---

### `get_next_breakpoint_name()`

Returns the name of the breakpoint that comes after the given one.

```php
get_next_breakpoint_name(string $currentBreakpoint): string|false
```

Returns `false` if there is no next breakpoint or the breakpoint is not found.

---

### `get_next_breakpoint_names()`

Returns all breakpoint names after the given one.

```php
get_next_breakpoint_names(string $currentBreakpoint): array
```

---

### `get_theme_display_values()`

Returns the display utility values map used by responsive settings.

```php
get_theme_display_values(): array
```

---

## URL utilities

### `get_current_url()`

Returns the current full URL without query parameters.

```php
get_current_url(): string
```

---

### `remove_query_arg_from_current_url()`

Removes a specific query key/value pair from a URL.

```php
remove_query_arg_from_current_url(
    string $key,
    string|array $value,
    string $url = null
): string
```

---

### `remove_query_args_from_current_url()`

Removes a list of query arguments from a URL.

```php
remove_query_args_from_current_url(array $args): string
```

---

### `is_current_menu_item()`

Checks if a menu URL matches the current URL.

```php
is_current_menu_item(string $url, string $current): bool
```

---

## i18n utilities

### `get_msls_current_lang()`

Returns the current language from the Multisite Language Switcher plugin.
Returns an empty string when the plugin is not active.

```php
get_msls_current_lang(): string
```

---

### `get_msls_languages()`

Returns the list of available languages from MSLS, excluding the current one.

```php
get_msls_languages(): array
```

---

## Filters

### `webentor/skip_render_block_blade`

Allows skipping the Blade rendering pipeline for a specific block. Return `true`
to fall back to the default WordPress block rendering.

```php
add_filter('webentor/skip_render_block_blade', function (bool $skip, array $block): bool {
    if ($block['blockName'] === 'my-plugin/custom-block') {
        return true; // skip Blade rendering for this block
    }
    return $skip;
}, 10, 2);
```

---

### `webentor/block_classes_by_property`

Modify the classes-by-property map before Tailwind class generation.

```php
add_filter('webentor/block_classes_by_property', function (array $classes_by_prop, array $attributes): array {
    // Add or modify class mappings
    return $classes_by_prop;
}, 10, 2);
```

---

### `webentor/breadcrumbs/path`

Customize or extend the breadcrumb path array.

```php
add_filter('webentor/breadcrumbs/path', function (array $path): array {
    // Prepend a custom item
    array_unshift($path, ['title' => 'Home', 'url' => home_url('/')]);
    return $path;
});
```

---

### `webentor/query_loop_args`

Modify WP_Query arguments for the query loop block.

```php
add_filter('webentor/query_loop_args', function (array $args, array $block_attrs): array {
    $args['posts_per_page'] = 6;
    return $args;
}, 10, 2);
```

---

## Additional theme filters (from theme v2 docs)

### `webentor/register_block`

Skip registration of specific blocks by slug.

```php
add_filter('webentor/register_block', function ($should_register, $slug) {
    return $slug === 'l-404' ? false : $should_register;
}, 10, 2);
```

---

### `webentor/block_classes`

Modify wrapper classes before render.

```php
add_filter('webentor/block_classes', function ($classes, $block) {
    if ($block->name === 'webentor/l-section') {
        $classes .= ' container mx-auto';
    }
    return $classes;
}, 10, 2);
```

---

### `webentor/block_bg_classes`

Modify background-related classes before render.

```php
add_filter('webentor/block_bg_classes', function ($bg, $block) {
    return $block->name === 'webentor/l-section' ? $bg . ' bg-neutral-50' : $bg;
}, 10, 2);
```

---

### `webentor/block_additional_data`

Inject extra data passed to Blade views.

```php
add_filter('webentor/block_additional_data', function ($data, $block) {
    if ($block->name === 'webentor/e-tabs') {
        $data['ariaLabel'] = 'Product tabs';
    }
    return $data;
}, 10, 2);
```

---

Per-block usage:

```php
add_filter('webentor/block_additional_data', function ($data, $block) {
    if ($block->name === 'webentor/b-hero') {
        $data['heroVariant'] = 'default';
    }
    return $data;
}, 10, 2);
```

---

### `render_blade_block`

Post-process HTML of any rendered block.

```php
add_filter('render_blade_block', function ($html, $parsed, $block) {
    if (str_starts_with($block->name, 'webentor/')) {
        $html = preg_replace('/^<([a-z0-9-]+)/i', '<$1 data-webentor="1"', $html, 1);
    }
    return $html;
}, 10, 3);
```

---

### `render_blade_block_{block-name}`

Post-process HTML of a specific block.

```php
add_filter('render_blade_block_webentor/e-button', function ($html) {
    return str_replace('wp-block-webentor-e-button', 'wp-block-webentor-e-button has-shadow', $html);
}, 10, 3);
```

---

### `webentor/add_head_ajax_url`

Toggle injection of `window.wpAjaxUrl`.

```php
add_filter('webentor/add_head_ajax_url', '__return_false');
```

---

### `webentor/block_type_metadata_settings`

Modify block metadata settings/defaults before registration.

```php
add_filter('webentor/block_type_metadata_settings', function ($settings, $metadata) {
    if (($metadata['name'] ?? '') === 'webentor/e-button') {
        $settings['attributes']['button']['default']['variant'] = 'secondary';
    }
    return $settings;
}, 10, 2);
```

---

### `webentor/breadcrumbs/path` (theme variant)

Customize breadcrumbs path data.

```php
add_filter('webentor/breadcrumbs/path', function ($path) {
    array_splice($path, 1, 0, [[__('Shop', 'webentor'), '/shop']]);
    return $path;
}, 10, 1);
```

---

### `webentor/query_loop_args` (theme variant)

Adjust WP_Query args for `e-query-loop` and `e-picker-query-loop`.

```php
add_filter('webentor/query_loop_args', function ($args, $queryId) {
    if ($queryId === 'homepage-featured') {
        $args['posts_per_page'] = 3;
        $args['ignore_sticky_posts'] = true;
    }
    return $args;
}, 10, 2);
```
