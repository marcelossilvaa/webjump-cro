(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let buttonDebounceTimer = null;
  let priceDebounceTimer = null;

  const STYLE_ID = 'at-cta-preco-pdp-style-v2';
  const DATA_ATTR = 'data-at-cta-preco-pdp-added-v2';
  const ACTIVE_ATTR = 'data-at-cta-preco-pdp-active-v2';
  const POST_ADD_ATTR = 'data-at-cta-preco-post-add-v2';

  const INFO_CLASS = 'at-cta-preco-info-v2';
  const ROW_CLASS = 'at-cta-preco-row-v2';
  const OLD_PRICE_CLASS = 'at-cta-preco-old-v2';
  const DISCOUNT_CLASS = 'at-cta-preco-discount-v2';
  const PRICE_CLASS = 'at-cta-preco-current-v2';

  const MOBILE_BREAKPOINT = 768;
  const BUTTON_AREA_WIDTH = '210px';
  const BAR_HEIGHT = '90px';

  const PRICE_CONTAINER_SELECTOR = '.productDetails__prices';
  const OLD_PRICE_SELECTOR = '.productPrice__lineThrough';
  const DISCOUNT_SELECTOR = '.productPrice__discount';
  const CURRENT_PRICE_SELECTOR = '.productPrice__price';
  const QUANTITY_SELECTOR = '.productDetails__quantity';
  const BUY_BUTTON_CONTAINER_SELECTOR = '.productDetails__buyButton';
  const PRIMARY_BUTTON_SELECTOR = '.primaryButton';
  const PRODUCT_QUANTITY_SELECTOR = '.productQuantity';

  function repeatSelector(selector, times) {
    let result = '';
    for (let i = 0; i < times; i++) {
      result += selector;
    }
    return result;
  }

  const BUY_BUTTON_MARKED_SELECTOR = BUY_BUTTON_CONTAINER_SELECTOR + repeatSelector('[' + DATA_ATTR + ']', 4);
  const PRIMARY_BUTTON_BOOSTED_SELECTOR = repeatSelector(PRIMARY_BUTTON_SELECTOR, 4);
  const PRODUCT_QUANTITY_BOOSTED_SELECTOR = repeatSelector(PRODUCT_QUANTITY_SELECTOR, 4);

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function sendGAEvent(eventName, label) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      cta_preco_label: label,
    });
  }

  function getStyles() {
    return [
      '.' + INFO_CLASS + ' {',
      '  position: fixed;',
      '  left: 0;',
      '  right: ' + BUTTON_AREA_WIDTH + ';',
      '  bottom: 0;',
      '  z-index: 999;',
      '  display: flex;',
      '  flex-direction: column;',
      '  justify-content: center;',
      '  gap: 2px;',
      '  min-width: 0;',
      '  min-height: ' + BAR_HEIGHT + ';',
      '  box-sizing: border-box;',
      '  padding: 18px 16px;',
      '  background-color: #FFFFFF;',
      '  border-top: 1px solid #E0E0E0;',
      '  box-shadow: 0 -4px 6px -4px rgba(0, 0, 0, 0.15);',
      '}',
      '.' + ROW_CLASS + ' {',
      '  display: flex;',
      '  align-items: baseline;',
      '  gap: 6px;',
      '}',
      '.' + OLD_PRICE_CLASS + ' {',
      '  font-size: 12px;',
      '  color: #757575;',
      '  text-decoration: line-through;',
      '  white-space: nowrap;',
      '}',
      '.' + DISCOUNT_CLASS + ' {',
      '  font-size: 12px;',
      '  color: #008A00;',
      '  font-weight: 700;',
      '  white-space: nowrap;',
      '}',
      '.' + PRICE_CLASS + ' {',
      '  font-size: 18px;',
      '  font-weight: 700;',
      '  color: #212529;',
      '  white-space: nowrap;',
      '}',
      BUY_BUTTON_CONTAINER_SELECTOR + repeatSelector(':has(.primaryButton.pbm)', 2) + ',',
      BUY_BUTTON_MARKED_SELECTOR + ' {',
      '  position: fixed !important;',
      '  right: 0 !important;',
      '  bottom: 0 !important;',
      '  left: auto !important;',
      '  width: ' + BUTTON_AREA_WIDTH + ' !important;',
      '  min-height: ' + BAR_HEIGHT + ' !important;',
      '  z-index: 999 !important;',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  align-items: stretch !important;',
      '  justify-content: center !important;',
      '  gap: 6px !important;',
      '  padding: 18px 16px !important;',
      '  background-color: #FFFFFF !important;',
      '  border-top: 1px solid #E0E0E0 !important;',
      '  box-shadow: 0 -4px 6px -4px rgba(0, 0, 0, 0.15) !important;',
      '  box-sizing: border-box !important;',
      '}',
      BUY_BUTTON_MARKED_SELECTOR + '[' + POST_ADD_ATTR + '] {',
      '  width: 100% !important;',
      '  left: 0 !important;',
      '}',
      BUY_BUTTON_MARKED_SELECTOR + ' ' + PRIMARY_BUTTON_BOOSTED_SELECTOR + ' {',
      '  position: static !important;',
      '  display: block !important;',
      '  width: auto !important;',
      '  min-width: 170px !important;',
      '  box-sizing: border-box !important;',
      '  text-align: center !important;',
      '  text-decoration: none !important;',
      '  padding-top: 12px !important;',
      '  padding-bottom: 12px !important;',
      '  padding-left: 24px !important;',
      '  padding-right: 24px !important;',
      '  font-size: 17px !important;',
      '  background-color: #008A00 !important;',
      '  border-color: #008A00 !important;',
      '}',
      BUY_BUTTON_MARKED_SELECTOR + ' ' + PRODUCT_QUANTITY_BOOSTED_SELECTOR + ' {',
      '  position: relative !important;',
      '  width: 100% !important;',
      '  box-sizing: border-box !important;',
      '}',
      repeatSelector('.primaryButton.pbm', 4) + ' {',
      '  display: block !important;',
      '  width: auto !important;',
      '  max-width: ' + BUTTON_AREA_WIDTH + ' !important;',
      '  min-width: 170px !important;',
      '  box-sizing: border-box !important;',
      '  text-align: center !important;',
      '  padding-top: 12px !important;',
      '  padding-bottom: 12px !important;',
      '  padding-left: 24px !important;',
      '  padding-right: 24px !important;',
      '  font-size: 17px !important;',
      '}',
      '@media screen and (min-width: ' + MOBILE_BREAKPOINT + 'px) {',
      '  .' + INFO_CLASS + ' {',
      '    display: none !important;',
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

  function extractText(container, selector) {
    const el = container.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  function buildInfoBlock(priceContainer) {
    const info = document.createElement('div');
    info.className = INFO_CLASS;

    const oldPriceText = extractText(priceContainer, OLD_PRICE_SELECTOR);
    const discountText = extractText(priceContainer, DISCOUNT_SELECTOR);
    const currentPriceText = extractText(priceContainer, CURRENT_PRICE_SELECTOR);

    if (oldPriceText || discountText) {
      const row = document.createElement('div');
      row.className = ROW_CLASS;

      if (oldPriceText) {
        const oldPriceEl = document.createElement('span');
        oldPriceEl.className = OLD_PRICE_CLASS;
        oldPriceEl.textContent = oldPriceText;
        row.appendChild(oldPriceEl);
      }

      if (discountText) {
        const discountEl = document.createElement('span');
        discountEl.className = DISCOUNT_CLASS;
        discountEl.textContent = discountText;
        row.appendChild(discountEl);
      }

      info.appendChild(row);
    }

    if (currentPriceText) {
      const currentPriceEl = document.createElement('span');
      currentPriceEl.className = PRICE_CLASS;
      currentPriceEl.textContent = currentPriceText;
      info.appendChild(currentPriceEl);
    }

    return info;
  }

  function applyQuantityContainerLayout(quantityContainer) {
    const style = quantityContainer.style;
    style.setProperty('padding', '0', 'important');
    style.setProperty('margin', '0', 'important');
    style.setProperty('min-height', '0', 'important');
  }

  function refreshBuyButtonContent(buyButtonContainer) {
    const productQuantity = buyButtonContainer.querySelector(PRODUCT_QUANTITY_SELECTOR);
    const info = document.querySelector('.' + INFO_CLASS);

    if (productQuantity) {
      buyButtonContainer.setAttribute(POST_ADD_ATTR, 'true');
      if (info) info.style.setProperty('display', 'none', 'important');
    } else {
      buyButtonContainer.removeAttribute(POST_ADD_ATTR);
      if (info) info.style.removeProperty('display');
    }
  }

  function watchBuyButtonContent(buyButtonContainer) {
    const observer = new MutationObserver(function () {
      clearTimeout(buttonDebounceTimer);
      buttonDebounceTimer = setTimeout(function () {
        refreshBuyButtonContent(buyButtonContainer);
      }, 100);
    });

    observer.observe(buyButtonContainer, {
      childList: true,
      subtree: true,
    });
  }

  function refreshPriceInfo(priceContainer) {
    const info = document.querySelector('.' + INFO_CLASS);
    if (!info) return;

    const freshInfo = buildInfoBlock(priceContainer);
    info.innerHTML = '';
    while (freshInfo.firstChild) {
      info.appendChild(freshInfo.firstChild);
    }
  }

  function watchPriceContainer(priceContainer) {
    const observer = new MutationObserver(function () {
      clearTimeout(priceDebounceTimer);
      priceDebounceTimer = setTimeout(function () {
        refreshPriceInfo(priceContainer);
      }, 100);
    });

    observer.observe(priceContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function syncBodyPadding(buyButtonContainer) {
    const height = buyButtonContainer.getBoundingClientRect().height;
    document.body.style.setProperty('padding-bottom', (height + 12) + 'px', 'important');
  }

  function watchContainerHeight(buyButtonContainer) {
    if (typeof ResizeObserver === 'undefined') return;
    const resizeObserver = new ResizeObserver(function () {
      syncBodyPadding(buyButtonContainer);
    });
    resizeObserver.observe(buyButtonContainer);
  }

  function addCtaBar() {
    const quantityContainer = document.querySelector(QUANTITY_SELECTOR);
    if (!quantityContainer) return false;

    const priceContainer = document.querySelector(PRICE_CONTAINER_SELECTOR);
    if (!priceContainer) return false;

    const buyButtonContainer = quantityContainer.querySelector(BUY_BUTTON_CONTAINER_SELECTOR);
    if (!buyButtonContainer) return false;

    if (buyButtonContainer.hasAttribute(DATA_ATTR)) return true;

    const currentPriceText = extractText(priceContainer, CURRENT_PRICE_SELECTOR);
    if (!currentPriceText) return false;

    const existingInfo = document.querySelector('.' + INFO_CLASS);
    if (existingInfo) existingInfo.remove();

    buyButtonContainer.setAttribute(DATA_ATTR, 'true');
    applyQuantityContainerLayout(quantityContainer);

    const info = buildInfoBlock(priceContainer);
    document.body.appendChild(info);
    watchPriceContainer(priceContainer);

    refreshBuyButtonContent(buyButtonContainer);
    watchBuyButtonContent(buyButtonContainer);

    document.body.setAttribute(ACTIVE_ATTR, 'true');

    buyButtonContainer.addEventListener('click', function (event) {
      if (event.target.closest(PRIMARY_BUTTON_SELECTOR)) {
        sendGAEvent('cta_preco_fixo_click', 'comprar');
      }
    });

    sendGAEvent('cta_preco_fixo_view', 'cta_preco_fixo');

    syncBodyPadding(buyButtonContainer);
    watchContainerHeight(buyButtonContainer);

    return true;
  }

  function run() {
    if (isProcessing) return;
    if (!isMobile()) return;
    isProcessing = true;
    try {
      addCtaBar();
    } finally {
      isProcessing = false;
    }
  }

  function setupObserver() {
    if (window._ctaPrecoPdpObserverV2) return;

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

    window._ctaPrecoPdpObserverV2 = observer;
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
