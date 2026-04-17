# Core Frontend Components

## Slider

- Files: `resources/core-components/slider/*`
- Enqueued automatically on frontend (JS + CSS).
- Used by the `webentor/e-slider` block.

### Editor settings

- Autoplay (speed, control), arrows (inside), pagination (inside), dark mode.
- Responsive: enable/disable per breakpoint, slides per view, space between, centered slides.

### Usage

- Insert `Slider` block and place content inside (e.g., containers, query loops).
- No manual JS init required; the core script scans DOM and initializes.

Tip: Keep images consistent heights (via CSS or object-fit) for smoother slides.

## Button

- File: `resources/core-components/button/button.blade.php`
- Reusable frontend Blade component used by `webentor/e-button` and custom theme views.
- Markup-only component; no separate runtime JS init step is required.
- Block attributes do not reach this component directly. `webentor/e-button` first
  maps block data through its block `view.blade.php`, which then forwards props into
  `<x-button>`.

If you are extending `webentor/e-button` and need to carry a new property from the
editor into frontend output, see [Extend `e-button`](./extend-e-button.md).

### Usage

```blade
<x-button
  title="Learn more"
  url="/contact"
  classes="btn btn--primary btn--size-medium"
  element="a"
  :openInNewTab="false"
/>
```

### Common options

- `element`: render as `a` or `button`.
- `buttonType`: HTML button type (`button`, `submit`) when `element="button"`.
- `openInNewTab`: adds `target="_blank" rel="noopener noreferrer"` for link buttons.
- `dataAttributes`: associative array for custom data/alpine attributes.
- `classes`: utility/class composition for final component styling.

## Blade Directives

webentor-core registers the following Blade directives via `WebentorCoreServiceProvider`. They are available automatically in any consumer project — no theme-level configuration needed.

### `@sliderContent($html)`

Wraps each top-level child element of the given HTML in a `<div class="h-auto">`. Useful for preparing slider slide markup.

```blade
@sliderContent($innerBlocksContent)
```

### `@enqueueScripts('bundle-name')`

Enqueues a Vite JS bundle via `bundle()->enqueue()` in `wp_head`. Use this in Blade views to load a script only when the view is rendered.

```blade
@enqueueScripts('resources/scripts/lightbox')
```

### `@xdebugBreak`

Triggers an XDebug breakpoint if the XDebug PHP extension is available. Useful for debugging Blade templates during development.

```blade
@xdebugBreak
```

## Overriding Components

The `<x-button>` and `<x-slider>` components are provided by webentor-core (`Webentor\Core\View\Components`). They work out of the box — no registration needed in the theme.

To customize a core component, create a class in the theme that extends the core one. Acorn auto-discovers `App\View\Components\*` from the theme namespace and uses it instead of the core class for unnamespaced `<x-*>` tags.

### Example: Override Button defaults

```php
// app/View/Components/Button.php
<?php

namespace App\View\Components;

use Webentor\Core\View\Components\Button as CoreButton;

class Button extends CoreButton
{
    public function __construct(
        string $title = '',
        string $variant = 'secondary', // different default
        string $size = 'large',        // different default
        string $icon = '',
        string $iconPosition = 'right',
        string $element = 'a',
        string $classes = '',
        string $id = '',
        string $url = '',
        string $disabled = 'false',
        string $openInNewTab = 'false',
        string $fullWidth = 'false',
        string $buttonType = '',
        string $useAsToggle = 'false',
        array $dataAttributes = [],
    ) {
        parent::__construct(
            title: $title,
            variant: $variant,
            size: $size,
            icon: $icon,
            iconPosition: $iconPosition,
            element: $element,
            classes: $classes,
            id: $id,
            url: $url,
            disabled: $disabled,
            openInNewTab: $openInNewTab,
            fullWidth: $fullWidth,
            buttonType: $buttonType,
            useAsToggle: $useAsToggle,
            dataAttributes: $dataAttributes,
        );
    }
}
```

You can also override the `render()` method to use a theme-specific Blade view, or add new properties that your theme templates need.

The core components remain available via the namespaced syntax `<x-webentor::button>` if you need to use the original alongside your override.
