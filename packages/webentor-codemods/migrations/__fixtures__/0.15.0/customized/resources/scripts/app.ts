// Load default Webentor JS features
import './_header';

import Lightbox from './_lightbox';

// Register Alpine last to ensure all extensions are registered
import './_alpine';

// Register static assets — already migrated to the Vite 8 form, must stay as-is
import.meta.glob(['../images/**', '../fonts/**'], {
  eager: true,
  query: '?url',
  import: 'default',
});

// Project-specific module glob — NOT a static-asset glob, must be left untouched
const modules = import.meta.glob(['./modules/**/*.ts']);

new Lightbox();
new Lightbox('.lightgallery-gallery', {
  selector: undefined,
});
