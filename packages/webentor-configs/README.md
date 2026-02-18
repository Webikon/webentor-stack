# @webikon/webentor-configs

Shared lint/format presets for Webentor repositories.

## Usage

```js
// eslint.config.js
import { createEslintConfig } from '@webikon/webentor-configs/eslint';
export default createEslintConfig();
```

```js
// .stylelintrc.js
import { createStylelintConfig } from '@webikon/webentor-configs/stylelint';
export default createStylelintConfig();
```

```js
// .prettierrc.js
import { createPrettierConfig } from '@webikon/webentor-configs/prettier';
export default createPrettierConfig({ tailwindStylesheet: './resources/styles/app.css' });
```

Static references shipped in this package:

- `phpcs.xml`
- `.bladeformatterrc`
- `.editorconfig`
