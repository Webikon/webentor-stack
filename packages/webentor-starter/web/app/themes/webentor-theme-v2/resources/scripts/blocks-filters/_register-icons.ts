import { registerIcons } from '@10up/block-components';

// Get all svg files in the images/svg folder
const svgFiles = import.meta.glob('../../images/svg/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// Get contents of the svg files
const svgContentsList = Object.keys(svgFiles).map((path) => {
  // Transform file name from its path, e.g. `../images/svg/calendar.svg`
  const fileName = path.split('/').pop();

  // Transform file name, e.g. from `calendar.svg` to `calendar`
  const iconName = fileName.replace('.svg', '');

  return {
    source: svgFiles[path],
    name: iconName,
    label: iconName,
  };
});

// Specify icons to exclude
const excludeSvgs = [];

// Filter out excluded icons
const filteredIcons = svgContentsList.filter(
  (icon) => !excludeSvgs.includes(icon.name),
);

registerIcons({
  name: 'webentor',
  label: 'Webentor',
  icons: [...filteredIcons],
});
