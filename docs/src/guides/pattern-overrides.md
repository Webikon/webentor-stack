# Pattern Overrides

WordPress 7.0 opened Pattern Overrides to custom blocks. A synced pattern can now
be reused across pages while individual instances override selected content —
without detaching the pattern, so design changes still propagate from the
original.

Requires WordPress 7.0 or later. On older versions the controls simply don't
appear; nothing breaks.

## Which blocks support it

| Block | Overridable attributes |
| --- | --- |
| `e-button` | `button` |
| `e-accordion` | `title` |
| `e-tab-container` | `title` |
| `e-image` | `imgId`, `link` |
| `e-svg` | `imgId` |
| `e-icon-picker` | `icon` |
| `e-gallery` | `images` |

Everything else — spacing, layout, responsive settings, query configuration — is
deliberately excluded. Those are design decisions that belong to the pattern, not
to the instance.

Container blocks are absent from this table on purpose. Their content lives in
inner blocks, which are overridden individually — see
[Container blocks](#container-blocks-overriding-inner-content).

## Using it

1. Create a **synced** pattern containing one of the blocks above.
2. Select the block, open **Advanced** in the block sidebar, and click
   **Enable overrides**. Give the block a name — this name is how each instance
   identifies which block it is overriding, and it shows up in the pattern's
   **Overrides** panel.
3. Insert the pattern into a page. Blocks with overrides enabled are editable;
   every other block in the instance is locked.
4. The block toolbar gains a **Reset** action to drop an instance's override and
   fall back to the pattern value.

Override values are stored on the pattern instance (the `core/block` block's
`content` attribute), never on the pattern itself.

## Container blocks: overriding inner content

Blocks whose content lives in inner blocks — `e-accordion`, `e-tab-container`,
`e-accordion-group`, `e-tabs`, `l-section`, `l-flexible-container`,
`e-table-cell` — work differently, and this is the most common source of
confusion.

**You do not enable overrides on the container.** You enable it on each block
*inside* it. The container needs no support of its own; only the leaf blocks that
actually hold content do. This mirrors core, where you override the paragraph
inside a `core/group`, never the group.

So for an accordion panel containing a heading, a paragraph and a CTA:

```html
<!-- wp:webentor/e-accordion {"title":"FAQ","metadata":{"name":"faq-1-title",
     "bindings":{"__default":{"source":"core/pattern-overrides"}}}} -->

  <!-- wp:heading {"metadata":{"name":"faq-1-heading",
       "bindings":{"__default":{"source":"core/pattern-overrides"}}}} -->
  <h2>Heading</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"metadata":{"name":"faq-1-body",
       "bindings":{"__default":{"source":"core/pattern-overrides"}}}} -->
  <p>Body copy</p>
  <!-- /wp:paragraph -->

  <!-- wp:webentor/e-button {"metadata":{"name":"faq-1-cta",
       "bindings":{"__default":{"source":"core/pattern-overrides"}}}} /-->

  <!-- A block with no override stays identical in every instance. -->
  <!-- wp:paragraph --><p>Fine print</p><!-- /wp:paragraph -->

<!-- /wp:webentor/e-accordion -->
```

In practice you do this through the UI: expand the pattern in the List View,
select each inner block, and enable overrides on it. Every named block then shows
up in the pattern's **Overrides** panel and in the instance's **Content** panel.

The accordion's own `title` is a separate override from its inner blocks — enable
both if editors should be able to change the panel label *and* its content.

### What cannot be overridden: structure

Per-instance **structure** is not possible, and this is a WordPress
architectural limit rather than something Webentor can add:

- `core/block` has only two attributes, `ref` and `content` (a map of attribute
  overrides). There is nowhere to store a per-instance block tree.
- A pattern instance serializes as a self-closing block with no inner markup:
  `<!-- wp:block {"ref":123,"content":{…}} /-->`. The inner blocks are always read
  from the pattern post.
- Accordingly, the editor blocks insertion inside an instance and discards any
  structural change.

Concretely: one synced pattern **cannot** show five accordion items on one page
and two on another. Content varies per instance; the number, order and type of
blocks do not.

If you need that, pick the option that matches the real requirement:

| Need | Approach |
| --- | --- |
| Same items, different copy per page | Pattern overrides on inner blocks (above) |
| A fixed maximum, with some items hidden per page | Over-provision the pattern and expose a bindable hide flag on the item block. `e-button` already supports this via `button.showButton`, since the whole object is bound |
| Genuinely different structure per page | An **unsynced** pattern — full freedom, but design changes no longer propagate |
| Fixed structure, freely editable content, no central sync | A container with `templateLock: 'contentOnly'` in the page itself |
| A repeating list of records | Model it as content: a CPT with ACF fields plus `e-query-loop`. If the "pattern" is really data, this is the correct architecture and everything above is a workaround |

## Caveat: object attributes are overridden as a whole

WordPress keys bindings by top-level attribute name — there is no support for
sub-paths like `button.title`. Since `e-button` keeps all of its settings in a
single `button` object attribute, an override stores **the entire object**,
including the design props (`variant`, `size`, `icon`, `htmlElement`).

The practical consequence: once an instance has overridden a button, later design
changes to that button in the pattern original no longer reach that instance. Its
title and URL are its own, and so is its variant.

If a pattern's button styling needs to stay centrally controlled, keep overrides
off for that button and let editors change copy in the pattern instead — or use
separate patterns per variant. `e-accordion` and `e-tab-container` use flat string
attributes and are not affected.

## Extending the supported attributes

The list is a filter, so a project can expose more attributes on core blocks or
opt its own blocks in:

```php
add_filter('webentor/block_bindings_supported_attributes', function (array $map): array {
    // Let editors override the Section background image per instance.
    $map['webentor/l-section'] = ['img'];

    // Opt a theme block in.
    $map['webentor/my-testimonial'] = ['quote', 'author'];

    return $map;
});
```

Only list content attributes, and prefer flat scalar attributes over objects for
anything new — see the caveat above.

Because Pattern Overrides and Block Bindings share this list, every attribute
here also becomes connectable to other sources such as post meta via the block's
**Attributes** panel. That is usually a bonus, but it is a reason not to expose
object attributes that no other source could sensibly produce.

## Notes for block authors

Webentor blocks are dynamic (`save: () => null` plus a Blade `view.blade.php`),
which is the easy case for bindings: WordPress resolves bound values before
calling the render callback, so `$attributes` in your Blade view already holds
the override. No `WP_HTML_Tag_Processor` work and no selectors are needed.

Do not add container blocks to the map. A block whose content is inner blocks has
no attribute worth binding — its children are overridden individually instead, and
adding it would only put a misleading entry in the **Attributes** panel. See
[Container blocks](#container-blocks-overriding-inner-content).
