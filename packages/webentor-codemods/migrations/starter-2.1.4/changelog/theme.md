### Version 2.1.4

- **`gform_submit_button` no longer rebuilds GF's markup.** The old filter emitted a hand-written `<button>`, dropping the `onclick` and `data-submission-type` that GF 3 submits through — GF logged "Unsupported submission flow detected for form #N" on every render. `app/forms.php` now appends classes with `WP_HTML_Tag_Processor` and leaves every other attribute alone, so the form editor's full-width setting survives too. `gform_next_button` and `gform_previous_button` are filtered as well, so multi-page forms stop mixing themed and default buttons.
- Add `resources/styles/misc/_datepicker.css`: GF 3 replaced the jQuery UI datepicker with a WhatSock calendar, so the old `.ui-datepicker*` rules were dead. `dashicons` is enqueued per-form for the toggle glyph.
- Drop the dead `input[type='submit'].gform_button` rule from `_form.css` — the theme has emitted a `<button>` for years.
- **These are hand-applied file changes** (see the migration README); no dependency range moved and `webentor-core` stays `^0.15`.
