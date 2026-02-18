@php
  /**
   * Webentor Blocks - Hero Banner
   *
   * @param array $attributes The block attributes.
   * @param string $innerBlocksContent The block inner HTML (empty).
   * @param string $anchor Anchor (ID attribute) HTML.
   * @param string $block_classes Block classes.
   * @param object $block WP_Block_Type instance.
   **/

  $img_id = $attributes['img']['id'] ?? null;
  $img_id_mobile = $attributes['mobileImg']['id'] ?? $img_id;
@endphp

<section
  class="b-hero-banner {{ $block_classes }} leading-100 relative flex w-full flex-col justify-start md:justify-center"
  {!! $anchor !!}
>
  @if (!empty($img_id))
    <picture>
      <source
        media="(max-width: 480px)"
        srcset="{!! \Webentor\Core\get_resized_image_url($img_id_mobile, [480, 700]) !!}"
      >
      <source
        media="(max-width: 992px)"
        srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [992, 1200]) !!}"
      >
      <source
        media="(max-width: 1200px)"
        srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [1200, 600]) !!}"
      >
      <source
        media="(max-width: 1600px)"
        srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [1600, 900]) !!}"
      >
      <source
        media="(max-width: 1920px)"
        srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [1920, 1080]) !!}"
      >
      <source
        media="(max-width: 9999px)"
        srcset="{!! \Webentor\Core\get_resized_image_url($img_id, [2560, 1440]) !!}"
      >

      <img
        src="{!! \Webentor\Core\get_resized_image_url($img_id, [1920, 1080]) !!}"
        alt="{!! \Webentor\Core\get_image_alt($img_id) !!}"
        class="absolute inset-0 h-full w-full object-cover"
      >
    </picture>
  @endif

  <div class="b-hero-banner-content container z-10 mx-auto my-auto flex w-full flex-col">
    <div class="mt-10 flex w-full flex-col items-center gap-5 md:mt-0 md:w-1/2 md:items-start xl:w-1/3">
      {!! $innerBlocksContent ?? '' !!}
    </div>
  </div>
</section>
