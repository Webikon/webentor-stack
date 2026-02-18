import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import { initCustomTypographyFilter } from '@webentorCore/blocks-filters/_filter-core-typography';
import { initSliderSettings } from '@webentorCore/blocks-filters/_slider-settings';
import { initResponsiveSettings } from '@webentorCore/blocks-filters/responsive-settings';

import webentorConfig, { customTypographyKeys } from '../../../webentor-config';

// Init our core Gutenberg features
initCustomTypographyFilter();
initResponsiveSettings();
initSliderSettings();

// Add typography keys from TW
addFilter('webentor.core.customTypographyKeys', 'webentor', () => {
  const options = customTypographyKeys.map((item) => {
    return {
      key: item.key,
      name: item.key,
      value: item.key,
      __experimentalHint: item.size,
    };
  });

  options.unshift({
    key: 'none',
    name: 'None',
    value: '',
    __experimentalHint: 'Inherit default',
  });

  return options;
});

// Add breakpoints from TW
addFilter('webentor.core.twBreakpoints', 'webentor', (breakpoints) => {
  for (const key in webentorConfig.theme.screens) {
    if (!breakpoints.includes(key)) {
      breakpoints.push(key);
    }
  }
  return breakpoints;
});

// Add theme from TW
addFilter('webentor.core.twTheme', 'webentor', () => {
  return webentorConfig.theme;
});

// Add button variants
addFilter('webentor.core.button.variants', 'webentor', () => {
  return [
    {
      slug: 'primary',
      label: __('Primary', 'webentor'),
    },
    {
      slug: 'secondary',
      label: __('Secondary', 'webentor'),
    },
    {
      slug: 'subtle',
      label: __('Subtle', 'webentor'),
    },
    {
      slug: 'link',
      label: __('Link', 'webentor'),
    },
  ];
});

addFilter('webentor.core.button.sizes', 'webentor', () => {
  return [
    {
      slug: 'small',
      label: __('Small', 'webentor'),
    },
    {
      slug: 'medium',
      label: __('Medium', 'webentor'),
    },
    {
      slug: 'large',
      label: __('Large', 'webentor'),
    },
  ];
});
