import { addFilter } from '@wordpress/hooks';

import webentorConfig from '../../../webentor-config';

/**
 * Get values from Tailwind config and modify defaults for block settings like color pallete, typography, etc.
 * (which would otherwise need to be configured in theme.json)
 */
function modifyDefaultBlockSettings(settingValue, settingName) {
  if (settingName === 'spacing.spacingSizes') {
    return Object.entries(webentorConfig.theme.spacing).map(([key, value]) => ({
      name: `${key * 4}px`,
      size: value,
      slug: `${key * 4}`,
    }));
  }

  // Not working
  // if (settingName === 'typography.fontSizes') {
  //   return Object.entries(fullTwConfig.theme.fontSize).map(([key, value]) => ({
  //     name: `${key}px`,
  //     size: value,
  //     slug: key,
  //   }));
  // }

  // Not working
  // if (settingName === 'typography.fontFamilies') {
  //   console.log('tu som');
  //   return Object.entries(fullTwConfig.theme.fontFamily).map(
  //     ([key, value]) => ({
  //       fontFamily: value.join(', '),
  //       name: `${key} - ${value.join(', ')}`,
  //       slug: key,
  //     }),
  //   );
  // }

  /* if (settingName === 'color.palette.theme') {
    return Object.entries(fullTwConfig.theme.colors).map(([key, value]) => ({
      color: value,
      name: key,
      slug: key,
    }));
  } */

  return settingValue;
}
addFilter(
  'blockEditor.useSetting.before',
  'webentor/useSetting.before/modifyDefaultBlockSettings',
  modifyDefaultBlockSettings,
);
