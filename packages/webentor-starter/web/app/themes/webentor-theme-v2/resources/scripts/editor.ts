import './blocks-filters/_core-init';
import './blocks-filters/_register-icons';

// import './blocks-filters/_default-block-settings';
// import './blocks-filters/_filter-blocks';

/**
 * Register blocks dynamically
 */
import.meta.glob('../blocks/**/*.block.{ts,tsx}', {
  eager: true,
});
