// import { addFilter } from '@wordpress/hooks';

// Unregister unneccessary core blocks
// addFilter(
//   'blocks.registerBlockType',
//   'webentor/hideBlocks',
//   (blockSettings, blockName) => {
//     const hiddenBlocks = [
//       'core/image',
//       'core/gallery',
//       'core/media-text',
//       'core/buttons',
//       'core/columns',
//       'core/group',
//       'core/row',
//       'core/more',
//       'core/nextpage',
//       'core/details',
//       'core/quote',
//       'core/pullquote',
//       'core/verse',
//       'core/table',

//     if (hiddenBlocks.includes(blockName)) {
//       return Object.assign({}, blockSettings, {
//         // Otherwise hide the block from the inserter
//         supports: Object.assign({}, blockSettings.supports, {
//           inserter: false,
//         }),
//       });
//     }

//     return blockSettings;
//   },
// );
