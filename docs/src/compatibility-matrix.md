# Compatibility Matrix

## Package versions

| starterVersion | themeVersion | coreVersion | configsVersion | setupCliVersion | php | node |
| --- | --- | --- | --- | --- | --- | --- |
| 2.0.2 | 2.0.3 | 0.9.14 | 1.0.0 | 1.0.0 | >=8.3 | >=20 |

## Runtime dependencies

| Dependency | Minimum | Recommended | Notes |
|---|---|---|---|
| PHP | 8.3 | 8.3 | Required for all PHP 8.3 syntax used in webentor-core |
| Composer | 2.x | latest 2.x | Composer 1.x is not supported |
| Node.js | 20 LTS | 20 LTS | Node 22 LTS is also supported |
| pnpm | 10.15.1 | latest 10.x | Specified in root `package.json` `packageManager` field |
| WordPress | 6.4 | latest 6.x | Full site editing / block themes require WP 6.0+ |
| Bedrock | 1.24+ | latest | Required for PHP 8.3 compatibility |
| Sage | 10 | 10 | Sage 9 is not supported |
| ACF | 6.x | latest 6.x | Required for ACF Composer integration |
| 1Password CLI | 2.x | latest 2.x | Optional; required when `SETUP_1PASSWORD=true` |

## Browser support

Frontend assets (Alpine.js, Tailwind CSS v4, Swiper) target modern browsers:

| Browser | Minimum version |
|---|---|
| Chrome / Edge | 100+ |
| Firefox | 100+ |
| Safari | 15+ |
| iOS Safari | 15+ |

CSS Grid, Flexbox, CSS custom properties, and `@layer` are used extensively.
IE11 is not supported.

## Notes

- Package versions in this table must reflect the latest released set that is
  validated together.
- `setupCliVersion` is currently tracked from `packages/webentor-setup/CHANGELOG.md`
  because `packages/webentor-setup/composer.json` does not yet include a `version` field.
- PHP 8.2 may work in some configurations but is no longer the tested minimum.
- The compatibility matrix is updated with each release. Consult the
  `CHANGELOG.md` in each package for version-specific changes.
- Monorepo mirror triggers use namespaced tags (`core-v*`, `setup-v*`, `starter-v*`),
  while mirror repositories receive normalized `vX.Y.Z` tags.
