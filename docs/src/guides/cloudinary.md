# Cloudinary Integration

`webentor-core` includes a built-in Cloudinary integration for responsive,
optimized image delivery. When enabled, it proxies WordPress attachment URLs
through Cloudinary's Fetch API so transformations happen on the CDN.

## Prerequisites

- A Cloudinary account with a cloud name
- The `CLOUDINARY_CLOUD_NAME` constant defined in your WordPress config

## Enable Cloudinary

Add to your `config/application.php` (Bedrock):

```php
Config::define('CLOUDINARY_CLOUD_NAME', env('CLOUDINARY_CLOUD_NAME'));
```

And in your `.env`:

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Cloudinary is enabled automatically when `CLOUDINARY_CLOUD_NAME` is defined.
You can check the status with:

```php
\Webentor\Core\CloudinaryClient::isCloudinaryEnabled(); // true|false
```

## Localhost image rewrite

Cloudinary's Fetch API requires a publicly accessible URL. For local development,
define `WP_IMAGES_REWRITE_HOME` to rewrite the localhost URL to a public URL:

```php
// config/application.php
Config::define('WP_IMAGES_REWRITE_HOME', env('WP_IMAGES_REWRITE_HOME'));
```

```dotenv
# .env (local)
WP_IMAGES_REWRITE_HOME=https://staging.example.com
```

When this constant is set, all image URLs starting with `WP_HOME` are rewritten
before being sent to Cloudinary.

## Functions

### `get_resized_cloud_picture()`

Generates a responsive `<picture>` element with Cloudinary-transformed sources.

```php
echo \Webentor\Core\get_resized_cloud_picture(
    attachment_id: $image_id,
    default_size:  [1200, 600, 'fill'],   // [width, height, crop]
    sizes: [
        480 => [480, 300, 'fill'],
        768 => [768, 400, 'fill'],
    ],
    attr: ['class' => 'hero-image', 'alt' => 'Hero'],
    options: ['g' => 'auto'],             // Cloudinary gravity: auto
);
```

### `get_resized_cloud_picture_by_url()`

Same as above but accepts a URL string instead of an attachment ID.

```php
echo \Webentor\Core\get_resized_cloud_picture_by_url(
    url: 'https://example.com/wp-content/uploads/image.jpg',
    default_size: [1200, 600, 'fill'],
    sizes: [480 => [480, 300, 'fill']],
);
```

### `get_resized_cloud_image_url_by_url()`

Returns just the transformed Cloudinary URL without any HTML wrapper.

```php
$url = \Webentor\Core\get_resized_cloud_image_url_by_url(
    url: $attachment_url,
    size: [800, 400],
    crop: 'fill',
);
```

## Crop modes

| Mode | Description |
|---|---|
| `fill` | Crop to exact dimensions, best fitting crop |
| `lfill` | Fill without upscaling |
| `crop` | Exact crop at specified coordinates |
| `thumb` | Thumbnail-oriented smart crop |
| `auto` | Automatic crop using AI |
| `scale` | Scale to fit, may change aspect ratio |
| `fit` | Scale to fit within bounds, no crop |
| `limit` | Like fit but only downscales |
| `pad` | Pad with background color |

## Retina support

Retina (`2x`) srcset is enabled by default. To disable:

```php
echo \Webentor\Core\get_resized_cloud_picture(
    attachment_id: $image_id,
    default_size: [800, 400],
    attr: ['retina' => false],
);
```

## Cloudinary options

Pass additional Cloudinary transformation parameters via the `$options` array:

```php
// Face gravity
$options = ['g' => 'face'];

// Custom quality
$options = ['q' => '80'];

// Named transformation
$options = ['t' => 'my_preset'];
```
