import intersect from '@alpinejs/intersect';
import ajax from '@imacrayon/alpine-ajax';
import masonry from 'alpinejs-masonry';

import { Alpine } from '@webentorCore/_alpine';

// Extend Alpine with more components, plugins, etc.
document.addEventListener('alpine:init', () => {
  Alpine.data('menu', function () {
    return {
      __type: 'menu',
      open: false,
      isTouch: false,
      init() {},
      openPopover(id: string) {
        this.open = id;
      },
      closePopover() {
        this.open = false;
      },
      toggle(id: string) {
        if (this.open === id) {
          this.open = false;
        } else {
          this.open = id;
        }
      },
    };
  });

  Alpine.plugin(ajax);
  Alpine.plugin(intersect);
  Alpine.plugin(masonry);
});
