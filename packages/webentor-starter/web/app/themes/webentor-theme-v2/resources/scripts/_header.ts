import { debounce } from '@webentorCore/_utils';

document.addEventListener('DOMContentLoaded', function () {
  let prevScrollpos = window.scrollY;

  const stickyScrollHeader: HTMLElement = document.querySelector(
    '.header.is-sticky-hide-scroll',
  );
  const stickyHeader = document.querySelector('.header.is-sticky');

  if (stickyHeader) {
    // Add padding to body to prevent jump
    document.body.style.paddingTop = `${stickyScrollHeader.offsetHeight}px`;
  }

  if (stickyScrollHeader) {
    const headerBottom =
      stickyScrollHeader.offsetTop + stickyScrollHeader.offsetHeight;

    window.onscroll = debounce(function () {
      const currentScrollPos = window.scrollY;

      if (prevScrollpos > currentScrollPos || currentScrollPos < headerBottom) {
        stickyScrollHeader.style.transform = 'translateY(0)';
      } else {
        stickyScrollHeader.style.transform = 'translateY(-100%)';
      }

      prevScrollpos = currentScrollPos;
    });
  }
});
