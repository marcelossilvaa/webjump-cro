(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'at-tag-desconto-style';
  const DATA_ATTR = 'data-at-tag-desconto-added';
  const BADGE_CLASS = 'at-tag-desconto-badge';

  const IMAGE_SELECTOR = '.productDetails__images__principal__img';
  const IMAGE_WRAPPER_SELECTOR = '.productDetails__images__principal';
  const PRICES_CONTAINER_SELECTOR = '.productDetails__prices';
  const DISCOUNT_SELECTOR = '.productPrice__discount';

  function getStyles() {
    return [
      '.' + BADGE_CLASS + ' {',
      '  position: absolute;',
      '  top: 8px;',
      '  left: 8px;',
      '  z-index: 2;',
      '  background-color: #008A00;',
      '  color: #FFFFFF;',
      '  font-size: 15px;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '  padding: 6px 10px;',
      '  border-radius: 4px;',
      '  pointer-events: none;',
      '}',
      '@media screen and (min-width: 992px) {',
      '  .' + BADGE_CLASS + ' {',
      '    top: 12px;',
      '    left: 12px;',
      '    font-size: 18px;',
      '    padding: 8px 14px;',
      '  }',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function sendGAEvent(eventName, percentText) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      tag_desconto_percentual: percentText,
    });
  }

  function getDiscountBadgeText() {
    const pricesContainer = document.querySelector(PRICES_CONTAINER_SELECTOR);
    if (!pricesContainer) return null;

    const discountEl = pricesContainer.querySelector(DISCOUNT_SELECTOR);
    if (!discountEl) return null;

    const match = discountEl.textContent.match(/(\d+)\s*%/);
    if (!match) return null;

    return match[1] + '% OFF';
  }

  function ensureRelativePosition(wrapper) {
    const computedPosition = window.getComputedStyle(wrapper).position;
    if (computedPosition === 'static') {
      wrapper.style.setProperty('position', 'relative');
    }
  }

  function addOrUpdateBadge() {
    const image = document.querySelector(IMAGE_SELECTOR);
    if (!image) return false;

    const wrapper = image.closest(IMAGE_WRAPPER_SELECTOR) || image.parentElement;
    if (!wrapper) return false;

    const badgeText = getDiscountBadgeText();
    const existingBadge = wrapper.querySelector('[' + DATA_ATTR + ']');

    if (!badgeText) {
      if (existingBadge) existingBadge.remove();
      return true;
    }

    if (existingBadge) {
      if (existingBadge.textContent !== badgeText) {
        existingBadge.textContent = badgeText;
      }
      return true;
    }

    ensureRelativePosition(wrapper);

    const badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.setAttribute(DATA_ATTR, 'true');
    badge.textContent = badgeText;
    wrapper.appendChild(badge);

    sendGAEvent('tag_desconto_view', badgeText);

    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      addOrUpdateBadge();
    } finally {
      isProcessing = false;
    }
  }

  function setupObserver() {
    if (window._tagDescontoObserver) return;

    const observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._tagDescontoObserver = observer;
  }

  function init() {
    injectStyles();
    run();
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
