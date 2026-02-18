import lightGallery from 'lightgallery';
import { LightGallerySettings } from 'lightgallery/lg-settings';

/**
 * Initialize LightGallery lightbox.
 *
 * Default usage:
 * new Lightbox();
 *
 * With custom container selector:
 * new Lightbox('.custom-lightbox');
 *
 * With both custom selector and options:
 * new Lightbox('.custom-lightbox', { speed: 300, download: false });
 */
class Lightbox {
  private defaultOptions: LightGallerySettings = {
    speed: 500,
    selector: 'this',
  };

  constructor(
    private containerSelector: string = '.lightgallery',
    private options: LightGallerySettings = {},
  ) {
    this.options = { ...this.defaultOptions, ...options };
    this.init();
  }

  private init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      const lightboxes = document.querySelectorAll<HTMLElement>(
        this.containerSelector,
      );
      if (lightboxes.length > 0) {
        lightboxes.forEach((element) => {
          lightGallery(element, this.options);
        });
      }
    });
  }
}

export default Lightbox;
