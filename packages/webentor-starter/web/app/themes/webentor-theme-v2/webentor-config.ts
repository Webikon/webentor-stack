// Package must be imported with full path (not with alias) to avoid issues with Vite
import config, {
  buildSafelist,
} from './node_modules/@webikon/webentor-core/core-js/config/webentor-config';

import type { WebentorConfig } from './node_modules/@webikon/webentor-core/core-js/types/_webentor-config';

const webentorConfig: WebentorConfig = {
  ...config,
  theme: {
    ...config.theme,

    // Extend colors
    colors: {
      ...config.theme.colors,

      'red-light': 'var(--color-red-light)',
      red: 'var(--color-red)',
      'red-dark': 'var(--color-red-dark)',

      'blue-light': 'var(--color-blue-light)',
      blue: 'var(--color-blue)',
      'blue-dark': 'var(--color-blue-dark)',
    },

    // Extend spacing
    // spacing: {
    //   ...config.theme.spacing,
    //   24: '6rem', // 96px
    // },
  },
};

// These will be used to generate options for Gutenberg typography select
// Should mirror typography utility classes in `./resources/styles/common/_utilities.css`
export const customTypographyKeys = [
  {
    key: 'text-display',
    size: '56/88px',
  },
  {
    key: 'text-h1',
    size: '40/56px',
  },
  {
    key: 'text-h2',
    size: '32/48px',
  },
  {
    key: 'text-h3',
    size: '28/40px',
  },
  {
    key: 'text-h4',
    size: '24/32px',
  },
  {
    key: 'text-h5',
    size: '20/24px',
  },
  {
    key: 'text-h6',
    size: '14/16px',
  },
  {
    key: 'text-body',
    size: '16px',
  },
  {
    key: 'text-body-s',
    size: '14px',
  },
  {
    key: 'text-body-l',
    size: '18/24px',
  },
];

webentorConfig.safelist = [
  // Additional classes
  // 'bg-white',
  // 'bg-black',

  // Custom typography classes
  ...customTypographyKeys.flatMap((item) => {
    return [`${item.key}`];
  }),

  // Build safelist from config
  ...buildSafelist(webentorConfig),
];

export default webentorConfig;
