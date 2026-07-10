(function () {
  'use strict';

  let retryCount = 0;
  let isDone = false;

  const STYLE_ID = 'at-333-new-trust-section-style-v2';
  const SECTION_SELECTOR = '.sites-features-container';
  const FLAG_ATTR = 'data-at-new-trust-applied';
  const CAROUSEL_FLAG = 'data-at-trust-carousel-init';
  const ROOT_CLASS = 'at-trust-section';
  const MOBILE_MEDIA = '(max-width: 768px)';
  const AUTOPLAY_DELAY = 4000;
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;

  const ICON_AVALIACAO =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693226/Icon_2_avwwk1.png';
  const ICON_LOJAS =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693226/Icon_2_avwwk1.png';
  const ICON_ENTREGA =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693226/Icon_2_avwwk1.png';
  const ICON_GARANTIDA =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693225/Icon_3_hfkdh0.png';

  const TRUST_ITEMS = [
    {
      icon: ICON_AVALIACAO,
      title: '9.5/10 de avaliação',
      subtitle: 'no Reclame Aqui'
    },
    {
      icon: ICON_LOJAS,
      title: '+200 lojas parceiras',
      subtitle: 'de confiança'
    },
    {
      icon: ICON_ENTREGA,
      title: 'Entrega rápida',
      subtitle: 'ou retirada gratuita'
    },
    {
      icon: ICON_GARANTIDA,
      title: 'Compra 100% garantida',
      subtitle: 'pagamento seguro'
    }
  ];

  function isMobileView() {
    return window.matchMedia(MOBILE_MEDIA).matches;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      SECTION_SELECTOR + ' {',
      '  background: #fff !important;',
      '}',
      SECTION_SELECTOR + '[' + FLAG_ATTR + '="true"] [data-content-type="row"] {',
      '  display: none !important;',
      '}',
      SECTION_SELECTOR + '[' + FLAG_ATTR + '="true"] {',
      '  height: 105px !important;',
      '  min-height: 105px !important;',
      '  padding: 0 16px !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  box-sizing: border-box !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + ' {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  align-items: stretch !important;',
      '  justify-content: center !important;',
      '  gap: 8px !important;',
      '  width: 100% !important;',
      '  max-width: 1200px !important;',
      '  margin: 0 auto !important;',
      '  box-sizing: border-box !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__slider {',
      '  width: 100% !important;',
      '  overflow: hidden !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__track {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  width: 100% !important;',
      '  transition: transform 0.35s ease !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__item {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 12px !important;',
      '  flex: 1 1 0 !important;',
      '  min-width: 0 !important;',
      '  box-sizing: border-box !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__icon {',
      '  flex: 0 0 36px !important;',
      '  width: 36px !important;',
      '  height: 36px !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__icon img {',
      '  display: block !important;',
      '  width: 36px !important;',
      '  height: 36px !important;',
      '  object-fit: contain !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__text {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 2px !important;',
      '  min-width: 0 !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__title {',
      '  margin: 0 !important;',
      '  color: #1f2a44 !important;',
      '  font-family: Ubuntu, Arial, sans-serif !important;',
      '  font-size: 16px !important;',
      '  font-weight: 700 !important;',
      '  line-height: 1.2 !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__subtitle {',
      '  margin: 0 !important;',
      '  color: #6b7c93 !important;',
      '  font-family: Ubuntu, Arial, sans-serif !important;',
      '  font-size: 16px !important;',
      '  font-weight: 400 !important;',
      '  line-height: 1.2 !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__dots {',
      '  display: none !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 6px !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  list-style: none !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__dot {',
      '  width: 8px !important;',
      '  height: 8px !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  border-radius: 50% !important;',
      '  background: #d1d9e6 !important;',
      '  cursor: pointer !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__dot.is-active {',
      '  background: #e8612a !important;',
      '}',
      '@media only screen and (min-width: 769px) {',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '__track {',
      '    justify-content: space-between !important;',
      '    gap: 16px !important;',
      '    transform: none !important;',
      '  }',
      '}',
      '@media only screen and (max-width: 768px) {',
      '  ' + SECTION_SELECTOR + '[' + FLAG_ATTR + '="true"] {',
      '    padding: 0 !important;',
      '  }',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '--mobile {',
      '    gap: 6px !important;',
      '    height: 100% !important;',
      '  }',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '--mobile .' + ROOT_CLASS + '__track {',
      '    gap: 0 !important;',
      '  }',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '--mobile .' + ROOT_CLASS + '__item {',
      '  flex: 0 0 100% !important;',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  padding: 0 16px !important;',
      '}',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function createTrustItem(item) {
    const itemEl = document.createElement('div');
    itemEl.className = ROOT_CLASS + '__item';

    const iconEl = document.createElement('div');
    iconEl.className = ROOT_CLASS + '__icon';

    const imgEl = document.createElement('img');
    imgEl.setAttribute('src', item.icon);
    imgEl.setAttribute('alt', item.title);
    imgEl.setAttribute('loading', 'lazy');
    imgEl.setAttribute('width', '36');
    imgEl.setAttribute('height', '36');
    iconEl.appendChild(imgEl);

    const textEl = document.createElement('div');
    textEl.className = ROOT_CLASS + '__text';

    const titleEl = document.createElement('p');
    titleEl.className = ROOT_CLASS + '__title';
    titleEl.textContent = item.title;

    const subtitleEl = document.createElement('p');
    subtitleEl.className = ROOT_CLASS + '__subtitle';
    subtitleEl.textContent = item.subtitle;

    textEl.appendChild(titleEl);
    textEl.appendChild(subtitleEl);
    itemEl.appendChild(iconEl);
    itemEl.appendChild(textEl);

    return itemEl;
  }

  function buildTrustSection() {
    const root = document.createElement('div');
    root.className = ROOT_CLASS;
    root.setAttribute(FLAG_ATTR + '-root', 'true');

    const slider = document.createElement('div');
    slider.className = ROOT_CLASS + '__slider';

    const track = document.createElement('div');
    track.className = ROOT_CLASS + '__track';

    for (let i = 0; i < TRUST_ITEMS.length; i += 1) {
      track.appendChild(createTrustItem(TRUST_ITEMS[i]));
    }

    slider.appendChild(track);
    root.appendChild(slider);

    const dots = document.createElement('div');
    dots.className = ROOT_CLASS + '__dots';
    root.appendChild(dots);

    return root;
  }

  function updateDots(dots, activeIndex) {
    const buttons = dots.querySelectorAll('.' + ROOT_CLASS + '__dot');

    for (let i = 0; i < buttons.length; i += 1) {
      if (i === activeIndex) {
        buttons[i].classList.add('is-active');
        buttons[i].setAttribute('aria-selected', 'true');
      } else {
        buttons[i].classList.remove('is-active');
        buttons[i].setAttribute('aria-selected', 'false');
      }
    }
  }

  function initMobileCarousel(root) {
    if (root.getAttribute(CAROUSEL_FLAG) === 'true') {
      return;
    }

    const track = root.querySelector('.' + ROOT_CLASS + '__track');
    const slides = root.querySelectorAll('.' + ROOT_CLASS + '__item');
    const dots = root.querySelector('.' + ROOT_CLASS + '__dots');
    let currentIndex = 0;
    let autoplayTimer = null;
    let touchStartX = 0;
    let touchDeltaX = 0;

    if (!track || !slides.length || !dots) {
      return;
    }

    for (let i = 0; i < slides.length; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = ROOT_CLASS + '__dot';
      dot.setAttribute('aria-label', 'Ir para item ' + (i + 1));
      dot.setAttribute('role', 'tab');

      (function (index) {
        dot.addEventListener('click', function () {
          goToSlide(index);
          restartAutoplay();
        });
      })(i);

      dots.appendChild(dot);
    }

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      if (isMobileView()) {
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        updateDots(dots, currentIndex);
      } else {
        track.style.transform = '';
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();

      if (!isMobileView()) {
        return;
      }

      autoplayTimer = window.setInterval(function () {
        goToSlide(currentIndex + 1);
      }, AUTOPLAY_DELAY);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    function handleResize() {
      if (isMobileView()) {
        root.classList.add(ROOT_CLASS + '--mobile');
        goToSlide(currentIndex);
        startAutoplay();
      } else {
        root.classList.remove(ROOT_CLASS + '--mobile');
        track.style.transform = '';
        stopAutoplay();
        updateDots(dots, currentIndex);
      }
    }

    track.addEventListener('touchstart', function (event) {
      if (!isMobileView()) {
        return;
      }

      touchStartX = event.changedTouches[0].screenX;
      touchDeltaX = 0;
      stopAutoplay();
    });

    track.addEventListener('touchmove', function (event) {
      if (!isMobileView()) {
        return;
      }

      touchDeltaX = event.changedTouches[0].screenX - touchStartX;
    });

    track.addEventListener('touchend', function () {
      if (!isMobileView()) {
        return;
      }

      if (touchDeltaX > 40) {
        goToSlide(currentIndex - 1);
      } else if (touchDeltaX < -40) {
        goToSlide(currentIndex + 1);
      }

      restartAutoplay();
    });

    window.addEventListener('resize', handleResize);
    handleResize();
    root.setAttribute(CAROUSEL_FLAG, 'true');
  }

  function applyTrustSection() {
    const section = document.querySelector(SECTION_SELECTOR);

    if (!section) {
      return false;
    }

    let root = section.querySelector('.' + ROOT_CLASS);

    if (!root || !root.querySelector('.' + ROOT_CLASS + '__track')) {
      if (root) {
        root.parentNode.removeChild(root);
      }

      root = buildTrustSection();
      section.appendChild(root);
    }

    initMobileCarousel(root);
    section.setAttribute(FLAG_ATTR, 'true');
    return true;
  }

  function run() {
    if (isDone) {
      return;
    }

    injectStyles();

    if (applyTrustSection()) {
      isDone = true;
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
