(function () {
  'use strict';

  let retryCount = 0;
  let desktopDone = false;
  let mobileDone = false;
  let autoplayResumed = false;
  let sliderTouchDone = false;
  let customCarouselTouchDone = false;

  const STYLE_ID = 'at-333-new-banner-style-v9';
  const BANNER_RADIUS = '25px';
  const BANNER_RADIUS_MOBILE = '8px';
  const FLAG_DESKTOP = 'data-at-new-banner-desktop';
  const FLAG_MOBILE = 'data-at-new-banner-mobile';
  const MOBILE_TOUCH_FLAG = 'data-at-banner-touch-init';
  const MOBILE_MEDIA = '(max-width: 768px)';
  const SLIDER_SELECTOR = '.pagebuilder-lazyload-slider.slick-initialized';
  const DESKTOP_IMG_SELECTOR = 'img[data-element="desktop_image"]';
  const MOBILE_CAROUSEL_SELECTOR = '.custom-carousel';
  const MOBILE_ITEM_SELECTOR =
    MOBILE_CAROUSEL_SELECTOR + ' .carousel-item[data-banner-title="Sem tempo ruim para começar"]';
  const MOBILE_IMG_SELECTOR = 'img.carousel-image-mobile';
  const DESKTOP_IMG_SRC =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783687665/Banner1-home-desktop_f4qvid.webp';
  const MOBILE_IMG_SRC =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783687674/banner1_home_mobile_2x_a2zwyo.webp';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;

  function isMobileViewport() {
    return window.matchMedia(MOBILE_MEDIA).matches;
  }

  function ensureSliderTouch(slider) {
    if (sliderTouchDone || !slider) {
      return;
    }

    const jQuery = window.jQuery;

    if (!jQuery) {
      return;
    }

    const $slider = jQuery(slider);

    if (!$slider.hasClass('slick-initialized')) {
      return;
    }

    $slider.slick('slickSetOption', 'swipe', true, true);
    $slider.slick('slickSetOption', 'touchMove', true, true);
    $slider.slick('slickSetOption', 'draggable', true, true);
    $slider.slick('setPosition');
    sliderTouchDone = true;
  }

  function resumeSliderAutoplay(slider) {
    if (autoplayResumed || !slider || isMobileViewport()) {
      return;
    }

    const jQuery = window.jQuery;

    if (!jQuery) {
      return;
    }

    const $slider = jQuery(slider);

    if (!$slider.hasClass('slick-initialized')) {
      return;
    }

    function resume() {
      $slider.slick('setPosition');

      if (slider.getAttribute('data-autoplay') === 'true') {
        $slider.slick('slickPlay');
      }
    }

    resume();
    window.setTimeout(resume, 300);
    autoplayResumed = true;
  }

  function scheduleSliderAutoplayResume(slider, img) {
    if (!slider || !img) {
      return;
    }

    if (isMobileViewport()) {
      ensureSliderTouch(slider);
      return;
    }

    function onReady() {
      resumeSliderAutoplay(slider);
    }

    if (img.complete && img.naturalWidth > 0) {
      onReady();
      return;
    }

    img.addEventListener('load', onReady, { once: true });
    img.addEventListener('error', onReady, { once: true });
  }

  function initCustomCarouselTouch() {
    if (customCarouselTouchDone) {
      return;
    }

    const carousel = document.querySelector('.banner.home ' + MOBILE_CAROUSEL_SELECTOR);

    if (!carousel || carousel.getAttribute(MOBILE_TOUCH_FLAG) === 'true') {
      if (carousel) {
        customCarouselTouchDone = true;
      }
      return;
    }

    const track =
      carousel.querySelector('.carousel-items') ||
      carousel.querySelector('#carousel-content');

    if (!track) {
      return;
    }

    const items = track.querySelectorAll('.carousel-item');

    if (!items.length) {
      return;
    }

    let currentIndex = 0;
    let touchStartX = 0;
    let touchDeltaX = 0;
    let isDragging = false;

    function goTo(index) {
      if (index < 0) {
        currentIndex = items.length - 1;
      } else if (index >= items.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
    }

    function onTouchStart(event) {
      if (!event.changedTouches || !event.changedTouches.length) {
        return;
      }

      isDragging = true;
      touchStartX = event.changedTouches[0].screenX;
      touchDeltaX = 0;
    }

    function onTouchMove(event) {
      if (!isDragging || !event.changedTouches || !event.changedTouches.length) {
        return;
      }

      touchDeltaX = event.changedTouches[0].screenX - touchStartX;
    }

    function onTouchEnd() {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      if (touchDeltaX > 40) {
        goTo(currentIndex - 1);
      } else if (touchDeltaX < -40) {
        goTo(currentIndex + 1);
      }

      touchDeltaX = 0;
    }

    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });
    carousel.setAttribute(MOBILE_TOUCH_FLAG, 'true');
    customCarouselTouchDone = true;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.page-header {',
      '  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15) !important;',
      '}',
      'input.amsearch-input,',
      '.amsearch-input {',
      '  border-radius: 20px !important;',
      '}',
      'input.amsearch-input::placeholder,',
      '.amsearch-input::placeholder {',
      '  color: #707070 !important;',
      '  opacity: 1 !important;',
      '}',
      '.banner.home {',
      '  margin-top: 40px !important;',
      '}',
      '.banner.home .pagebuilder-lazyload-slider.slick-initialized .slick-list {',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '  overflow: hidden !important;',
      '}',
      '.banner.home .custom-carousel .carousel-wrapper {',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '  overflow: hidden !important;',
      '}',
      '.banner.home .pagebuilder-lazyload-slider img[data-element="desktop_image"],',
      '.banner.home .pagebuilder-lazyload-slider img[data-element="mobile_image"],',
      '.banner.home .custom-carousel img.carousel-image-mobile {',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '}',
      '@media only screen and (max-width: 768px) {',
      '  .banner.home {',
      '    margin-top: 20px !important;',
      '    min-height: 0 !important;',
      '  }',
      '  .banner.home .custom-carousel {',
      '    background: transparent !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-items {',
      '    height: auto !important;',
      '    max-height: none !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-item {',
      '    align-items: flex-start !important;',
      '    justify-content: flex-start !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-item a {',
      '    width: 100% !important;',
      '    height: auto !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-item img.carousel-image-mobile {',
      '    width: 100% !important;',
      '    height: auto !important;',
      '    object-fit: cover !important;',
      '    display: block !important;',
      '  }',
      '  .banner.home .pagebuilder-lazyload-slider.slick-initialized .slick-list {',
      '    touch-action: pan-y !important;',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-wrapper {',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .banner.home .pagebuilder-lazyload-slider img[data-element="desktop_image"],',
      '  .banner.home .pagebuilder-lazyload-slider img[data-element="mobile_image"],',
      '  .banner.home .custom-carousel img.carousel-image-mobile {',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .pagebuilder-lazyload-slider .slick-slide[' + FLAG_DESKTOP + '="true"] img[data-element="desktop_image"],',
      '  ' + MOBILE_CAROUSEL_SELECTOR + ' .carousel-item[' + FLAG_MOBILE + '="true"] img.carousel-image-mobile {',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .banner.home ' + MOBILE_CAROUSEL_SELECTOR + ' .carousel-wrapper,',
      '  .banner.home ' + MOBILE_CAROUSEL_SELECTOR + ' .carousel-items {',
      '    touch-action: pan-y !important;',
      '  }',
      '}',
      '.pagebuilder-lazyload-slider figure[data-content-type="image"] {',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '}',
      '.pagebuilder-lazyload-slider figure[data-content-type="image"] a {',
      '  display: block !important;',
      '}',
      MOBILE_CAROUSEL_SELECTOR + ' .carousel-item a {',
      '  display: block !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' + FLAG_DESKTOP + '="true"] figure[data-content-type="image"] {',
      '  width: 100% !important;',
      '  display: block !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' + FLAG_DESKTOP + '="true"] figure[data-content-type="image"] a {',
      '  display: block !important;',
      '  width: 100% !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' + FLAG_DESKTOP + '="true"] img[data-element="desktop_image"] {',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  height: auto !important;',
      '  display: block !important;',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '}',
      MOBILE_CAROUSEL_SELECTOR + ' .carousel-item[' + FLAG_MOBILE + '="true"] img.carousel-image-mobile {',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  height: auto !important;',
      '  object-fit: cover !important;',
      '  display: block !important;',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function replaceDesktopBanner() {
    if (desktopDone) {
      return true;
    }

    const slider = document.querySelector(SLIDER_SELECTOR);

    if (!slider) {
      return false;
    }

    const slide = slider.querySelector(
      '.slick-slide[data-banner-position="1"]:not(.slick-cloned)'
    );

    if (!slide) {
      return false;
    }

    const desktopImg = slide.querySelector(DESKTOP_IMG_SELECTOR);

    if (!desktopImg) {
      return false;
    }

    if (slide.getAttribute(FLAG_DESKTOP) === 'true') {
      scheduleSliderAutoplayResume(slider, desktopImg);
      desktopDone = true;
      return true;
    }

    desktopImg.removeAttribute('srcset');
    desktopImg.setAttribute('src', DESKTOP_IMG_SRC);
    slide.setAttribute(FLAG_DESKTOP, 'true');
    scheduleSliderAutoplayResume(slider, desktopImg);
    desktopDone = true;

    return true;
  }

  function replaceMobileBanner() {
    if (mobileDone) {
      return true;
    }

    const carousel = document.querySelector(MOBILE_CAROUSEL_SELECTOR);

    if (!carousel) {
      return false;
    }

    const item =
      carousel.querySelector('.carousel-item[data-banner-title="Sem tempo ruim para começar"]') ||
      carousel.querySelector('.carousel-item');

    if (!item) {
      return false;
    }

    const mobileImg = item.querySelector(MOBILE_IMG_SELECTOR);

    if (!mobileImg) {
      return false;
    }

    if (item.getAttribute(FLAG_MOBILE) === 'true') {
      mobileDone = true;
      return true;
    }

    mobileImg.removeAttribute('srcset');
    mobileImg.setAttribute('src', MOBILE_IMG_SRC);
    mobileImg.setAttribute('width', '368');
    mobileImg.setAttribute('height', '300');
    item.setAttribute(FLAG_MOBILE, 'true');
    mobileDone = true;

    return true;
  }

  function isAllDone() {
    const desktopAbsent = !document.querySelector('.pagebuilder-lazyload-slider');
    const mobileAbsent = !document.querySelector(MOBILE_CAROUSEL_SELECTOR);

    return (
      (desktopDone || desktopAbsent) &&
      (mobileDone || mobileAbsent)
    );
  }

  function run() {
    injectStyles();

    replaceDesktopBanner();
    replaceMobileBanner();
    initCustomCarouselTouch();

    const slider = document.querySelector(SLIDER_SELECTOR);

    if (slider) {
      if (isMobileViewport()) {
        ensureSliderTouch(slider);
      } else if (desktopDone) {
        resumeSliderAutoplay(slider);
      }
    }

    const mobileCarouselReady =
      customCarouselTouchDone || !document.querySelector('.banner.home ' + MOBILE_CAROUSEL_SELECTOR);
    const sliderReady = !isMobileViewport() || sliderTouchDone || !slider;

    if (isAllDone() && mobileCarouselReady && sliderReady && (retryCount >= 5 || !slider)) {
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
