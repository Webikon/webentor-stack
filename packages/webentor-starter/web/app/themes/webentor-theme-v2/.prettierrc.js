import { createPrettierConfig } from '@webikon/webentor-configs/prettier';

// Preserve project import grouping while inheriting shared formatting defaults.
export default createPrettierConfig({
  tailwindStylesheet: './resources/styles/app.css',
});
