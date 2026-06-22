// Load default Webentor JS features
import './_header';

import Lightbox from './_lightbox';

// Register Alpine last to ensure all extensions are registered
import './_alpine';

// Register static assets so Vite versions them into the manifest (e.g. block-preview
// thumbnails resolved via asset('/images/blocks-preview/*.jpg')). On Vite 8/Rolldown a bare
// import.meta.glob no longer emits them — eager + ?url is required.
import.meta.glob(['../images/**', '../fonts/**'], {
  eager: true,
  query: '?url',
  import: 'default',
});

new Lightbox();
new Lightbox('.lightgallery-gallery', {
  selector: undefined,
});
