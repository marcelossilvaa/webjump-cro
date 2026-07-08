(function () {
  'use strict';

  let retryCount = 0;
  let isDone = false;

  const STYLE_ID = 'at-333-new-banner-style';
  const FLAG_ATTR = 'data-at-new-banner-desktop';
  const SLIDER_SELECTOR = '.pagebuilder-lazyload-slider.slick-initialized';
  const FIRST_SLIDE_SELECTOR =
    SLIDER_SELECTOR + ' .slick-slide[data-banner-position="1"]:not(.slick-cloned)';
  const DESKTOP_IMG_SELECTOR = 'img[data-element="desktop_image"]';
  const DESKTOP_IMG_SRC = 'https://i.imgur.com/ls5FqZo.png';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_ATTR +
        '="true"] figure[data-content-type="image"] {',
      '  width: 100% !important;',
      '  display: inline-block !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_ATTR +
        '="true"] figure[data-content-type="image"] a {',
      '  display: block !important;',
      '  width: 100% !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_ATTR +
        '="true"] img[data-element="desktop_image"] {',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  height: auto !important;',
      '  display: block !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function replaceDesktopBanner() {
    if (isDone) {
      return true;
    }

    const slider = document.querySelector(SLIDER_SELECTOR);

    if (!slider) {
      return false;
    }

    const slide = slider.querySelector('.slick-slide[data-banner-position="1"]:not(.slick-cloned)');

    if (!slide) {
      return false;
    }

    const desktopImg = slide.querySelector(DESKTOP_IMG_SELECTOR);

    if (!desktopImg) {
      return false;
    }

    if (slide.getAttribute(FLAG_ATTR) === 'true') {
      isDone = true;
      return true;
    }

    desktopImg.removeAttribute('srcset');
    desktopImg.setAttribute('src', DESKTOP_IMG_SRC);
    slide.setAttribute(FLAG_ATTR, 'true');
    isDone = true;

    return true;
  }

  function run() {
    if (isDone) {
      return;
    }

    injectStyles();

    if (replaceDesktopBanner()) {
      return;
    }

    if (retryCount < MAX_RETRIES) {
      retryCount += 1;
      window.setTimeout(run, RETRY_DELAY);
    }
  }

  function init() {
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
