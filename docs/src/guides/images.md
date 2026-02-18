# Images

Utilities in `app/images.php` for responsive images.
Default flow should work with WordPress/BIS; Cloudinary helpers are advanced and optional.

## Prerequisites

- Optional Cloudinary support: define `CLOUDINARY_CLOUD_NAME`.
- Optional local URL rewrite for Cloudinary fetch: `WP_IMAGES_REWRITE_HOME` + `WP_HOME`.
- Retina is ON by default for Cloudinary HTML helpers; pass `['retina' => false]` to disable.

## WordPress/BIS fallbacks

- `get_resized_image_url(attachmentId, size, crop = false)`
- `get_resized_image_object(attachmentId, size, crop = false, attr = {})`
- `get_resized_image(attachmentId, size, crop = false, attr = {})`
- `get_resized_picture(attachmentId, defaultSize, sizes = [], attr = {})`

## Helpers & SVG

- `get_image_object(attachmentId, size)` -> `{ src, width, height, alt }`
- `get_image_alt(attachmentId)` -> `string`
- `modify_svg_attributes(attachmentId, width?, height?, class?)` -> modified SVG markup

## Recipes

- See [Hero banner](../recipes/hero-banner.md)
- BIS fallback `<picture>` (no Cloudinary)
- Simple avatar

## Tips

- Prefer `<picture>` helpers for responsive layouts; `<img>` for simple cases.
- Disable retina for very large images if bandwidth matters: `['retina' => false]`.

## Cloudinary helpers (advanced)

For full setup, env variables, and integration notes, see the dedicated
[Cloudinary guide](./cloudinary.md).

Supported crop modes:
`fill, lfill, crop, thumb, auto, scale, fit, limit, mfit, pad, lpad, mpad`.

### Cloudinary URL helpers

- `get_resized_cloud_image_url_by_url(url, size, crop = 'fill', options = {})`
- `get_resized_cloud_image_url(attachmentId, size, crop = 'fill', options = {})`

### Cloudinary HTML helpers

- `get_resized_cloud_image_by_url(url, size, crop = 'fill', attr = {}, options = {})`
- `get_resized_cloud_image(attachmentId, size, crop = 'fill', attr = {}, options = {})`
- `get_resized_cloud_picture_by_url(url, defaultSize, sizes = [], attr = {}, options = {})`
- `get_resized_cloud_picture(attachmentId, defaultSize, sizes = [], attr = {}, options = {})`
