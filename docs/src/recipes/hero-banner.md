# Recipe: Hero banner `<picture>`

Blade example using image helpers for responsive hero.

```php
@php
  $img_id = $attributes['img']['id'] ?? null;
  $img_id_mobile = $attributes['mobileImg']['id'] ?? $img_id;
@endphp
@if (!empty($img_id))
  <picture>
    <source media="(max-width: 480px)" srcset="{!! \Webentor\Core\get_resized_image_url($img_id_mobile, [480, 700]) !!}">
    <source media="(max-width: 992px)" srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [992, 1200]) !!}">
    <source media="(max-width: 1200px)" srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [1200, 600]) !!}">
    <img src="{!! \Webentor\Core\get_resized_image_url($img_id, [1920, 1080]) !!}"
         alt="{!! \Webentor\Core\get_image_alt($img_id) !!}"
         class="absolute inset-0 h-full w-full object-cover">
  </picture>
@endif
```

See also: [Images guide](../guides/images.md).

