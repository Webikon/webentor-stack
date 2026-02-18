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
