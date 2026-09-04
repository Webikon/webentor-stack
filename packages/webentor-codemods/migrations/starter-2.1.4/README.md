# `starter-2.1.4` — Gravity Forms on the official Composer repository

**Applies to:** consumer projects on the **2.1.3** baseline. Coming from an older baseline? Run the
earlier `starter-2.1.*` codemods first.

```sh
pnpm dlx @webikon/webentor-codemods run starter-2.1.4          # preview (dry-run)
pnpm dlx @webikon/webentor-codemods run starter-2.1.4 --apply  # apply
```

This migration is **changelog-only — it declares no `rules`.** The composer.json change adds and
removes `repositories` and `allow-plugins` array members, and `ast-grep` rewrites existing syntax
rather than adding or removing array members. Automating only the parts it can reach would leave the
manifest non-installable (`gravity/gravityforms` unresolvable until the repository is added), so the
whole edit is one manual pass below.

## 1. Root `composer.json`

**Remove** the inline package repository — the one whose dist URL points at
`gravitymanager/api.php` with a `{%PLUGIN_GF_KEY%}` placeholder:

```json
{
  "type": "package",
  "package": {
    "name": "gravityforms/gravityforms",
    "version": "2.10.3",
    "type": "wordpress-plugin",
    "dist": { "type": "zip", "url": "https://www.gravityhelp.com/...key={%PLUGIN_GF_KEY}" },
    "require": { "composer/installers": "^1.2", "gotoandplay/gravityforms-composer-installer": "^2.3" }
  }
}
```

**Add** in its place:

```json
{ "type": "composer", "url": "https://composer.gravity.io" }
```

**Rename the requirement** in `require`:

```diff
-    "gravityforms/gravityforms": "*",
+    "gravity/gravityforms": "^3.1",
```

**Remove** both `allow-plugins` entries — they existed only to service the inline package. Verify
with `composer why <name>` first and keep them if anything else pulls them:

```diff
     "allow-plugins": {
       "composer/installers": true,
       "roots/wordpress-core-installer": true,
-      "ffraenz/private-composer-installer": true,
       "phpro/grumphp": true,
-      "gotoandplay/gravityforms-composer-installer": true,
       "php-http/discovery": true
     }
```

While you are here: if `repositories` carries **two** `https://wpackagist.org` entries — one scoped
with `"only": ["wpackagist-plugin/*", "wpackagist-theme/*"]` and one unscoped — delete the unscoped
one. It defeats the filter on the scoped entry, and wpackagist serves only those two vendors.

Then:

```sh
composer update gravity/gravityforms -W
```

## 2. Composer auth — do this before step 1's `composer update`

`composer.gravity.io` uses http-basic auth: **username = the GF license key**, **password = a site
URL**. The URL must carry a scheme — `https://example.com` authenticates, a bare `example.com`
returns HTTP 402.

`PLUGIN_GF_KEY` already exists in most projects. `PLUGIN_GF_SITE_URL` is new and has to be added in
three places:

1. the project's `.env`
2. the project's 1Password item (setup pulls `.env` from there)
3. CI variables — GitLab projects also need this line in `.gitlab-ci.yml`'s `.build` script, beside
   the existing auth lines, or `composer install --no-dev` fails on every pipeline:

   ```yaml
   - composer config --auth http-basic.composer.gravity.io ${PLUGIN_GF_KEY} ${PLUGIN_GF_SITE_URL};
   ```

Local setup is covered upstream from **`webentor-setup` 1.3.0**: `setup_composer` writes the
`composer.gravity.io` auth entry when both vars are present. Pull the subtree
(`git subtree pull --prefix scripts/setup-core … setup-v1.3.0`) or, until then, add
`scripts/hooks/pre-composer.sh`:

```sh
if [ -n "${PLUGIN_GF_KEY:-}" ] && [ -n "${PLUGIN_GF_SITE_URL:-}" ]; then
    composer config --auth http-basic.composer.gravity.io "${PLUGIN_GF_KEY}" "${PLUGIN_GF_SITE_URL}"
fi
```

## 3. Theme: the GF 3 submit button

GF 3 ships a submit `<button>` carrying the `onclick` and `data-submission-type` its submission flow
runs on. A filter that rebuilds the tag drops them, and GF falls back to an unsupported path — it
logs `Unsupported submission flow detected for form #N` on every render. Replace whatever
`app/forms.php` does today with an append-only filter:

```php
$gf_button_classes = function (string $classes): callable {
    return function ($button) use ($classes) {
        $processor = new \WP_HTML_Tag_Processor($button);

        if (!$processor->next_tag()) {
            return $button;
        }

        // add_class() takes one name at a time; a space-separated string would
        // bypass its de-duplication.
        foreach (preg_split('/\s+/', $classes, -1, PREG_SPLIT_NO_EMPTY) as $class) {
            $processor->add_class($class);
        }

        return $processor->get_updated_html();
    };
};

add_filter('gform_submit_button', $gf_button_classes('btn btn--primary btn--size-large'), 10, 1);
add_filter('gform_next_button', $gf_button_classes('btn btn--primary btn--size-large'), 10, 1);
add_filter('gform_previous_button', $gf_button_classes('btn btn--secondary btn--size-large'), 10, 1);
```

Swap in the project's own button classes. Notes:

- `next_tag()`, not the `next_token()` in GF's own documented example — `next_token()` stops on a
  leading text node and the classes are silently dropped.
- Requires WP 6.2+ for `WP_HTML_Tag_Processor`.
- Filtering `gform_next_button` / `gform_previous_button` is new; drop those two lines if the project
  has no multi-page forms.

If the project styles the datepicker, copy `resources/styles/misc/_datepicker.css` from the 2.1.4
starter theme: GF 3 replaced the jQuery UI datepicker with a WhatSock calendar, so any
`.ui-datepicker*` rules are dead. The calendar's toggle glyph needs `dashicons` enqueued per-form —
see `app/forms.php` in the starter.

Any `input[type='submit'].gform_button` rule in `_form.css` is dead once the filter emits a
`<button>`; delete it.

## 4. Verify

```sh
composer validate --no-check-all --no-check-publish   # lock in sync
wp acorn optimize:clear
```

Then load a page with a form and submit it. The button should render as:

```html
<button type="submit" id="gform_submit_button_1" class="gform_button button <your classes>"
        onclick="gform.submission.handleButtonClick(this);" data-submission-type="submit">
```

and the browser console should carry **no** `Unsupported submission flow` warning.
