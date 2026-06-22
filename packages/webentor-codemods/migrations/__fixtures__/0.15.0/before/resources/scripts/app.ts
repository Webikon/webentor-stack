// Load default Webentor JS features
import './_header';

import Lightbox from './_lightbox';

// Register Alpine last to ensure all extensions are registered
import './_alpine';

// Register static assets
import.meta.glob(['../images/**', '../fonts/**']);

new Lightbox();
new Lightbox('.lightgallery-gallery', {
  selector: undefined,
});
