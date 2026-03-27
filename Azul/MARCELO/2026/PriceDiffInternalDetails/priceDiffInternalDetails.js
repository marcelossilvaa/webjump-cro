(function () {
  'use strict';

  const VARIANT_NAME = 'PriceDiffInternalDetails';
  const STYLE_ID = 'wj-price-diff-internal-details-style';
  const WRAP_ATTR = 'data-wj-price-diff-internal-details';

  let isProcessing = false;
  let debounceTimer = null;
  let hasTrackedView = false;
  let styleRetryRaf = 0;

  function analyticsEvent(eventLabel) {
    if (!eventLabel) return;

    const labelEvent = 'AT_price_diff_internal_details ' + eventLabel;

    try {
      const s = window.s || (typeof window.s_gi === 'function' && window.s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.tl(true, 'o', 'target_activity_action');
    } catch (e) {
      return;
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    if (!document.head) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.' + VARIANT_NAME + '__priceWrap{position:relative !important;}' +
      '.' + VARIANT_NAME + '__isBusiness .' + VARIANT_NAME + '__box{background-color:transparent !important;}' +
      '.' + VARIANT_NAME + '__box{' +
      'display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:0;' +
      'width:152px;max-width:100%;' +
      'font-family:\'Helvetica Neue\', Arial, sans-serif;color:#FFFFFF;' +
      'pointer-events:none;' +
      '}' +
      '.' + VARIANT_NAME + '__from{' +
      'width:148px;max-width:100%;min-height:21px;font-weight:400;font-size:14px;line-height:109.45%;' +
      'display:flex;align-items:center;text-align:right;' +
      '}' +
      '.' + VARIANT_NAME + '__diff{' +
      'display:flex;flex-direction:row;justify-content:flex-end;align-items:flex-end;padding:0;gap:2px;' +
      'width:152px;max-width:100%;min-height:24px;' +
      '}' +
      '.' + VARIANT_NAME + '__currency{' +
      'width:17px;height:21px;font-weight:400;font-size:12px;line-height:13px;display:flex;align-items:center;' +
      '}' +
      '.' + VARIANT_NAME + '__int{' +
      'height:24px;font-weight:300;font-size:24px;line-height:24px;display:flex;align-items:center;text-align:center;' +
      '}' +
      '.' + VARIANT_NAME + '__dec{' +
      'width:17px;height:21px;font-weight:400;font-size:12px;line-height:16px;display:flex;align-items:center;' +
      '}' +
      '.' + VARIANT_NAME + '__hide{display:none !important;}' +
      '.' + VARIANT_NAME + '__hideOldPrice .css-1qvpjit{display:none !important;}';

    document.head.appendChild(style);
  }

  function ensureStylesEarly() {
    if (document.getElementById(STYLE_ID)) return;
    injectStyles();
    if (document.getElementById(STYLE_ID)) return;

    if (styleRetryRaf) window.cancelAnimationFrame(styleRetryRaf);
    styleRetryRaf = window.requestAnimationFrame(function () {
      injectStyles();
    });
  }

  function parsePtBrMoney(text) {
    if (!text) return null;
    const cleaned = String(text)
      .replace(/[^\d.,]/g, '')
      .replace(/\.(?=\d{3})/g, '')
      .replace(',', '.');
    const value = parseFloat(cleaned);
    if (Number.isNaN(value)) return null;
    return value;
  }

  function formatPtBr(value) {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  function splitPtBr(valueFormatted) {
    const parts = String(valueFormatted).split(',');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '00';
    return { intPart, fracPart };
  }

  function isFareSoldOut(fareItem) {
    if (!fareItem) return true;
    const btn = fareItem.querySelector('[data-test-id="select-fare"]');
    if (!btn) return false;

    const text = (btn.textContent || '').toLowerCase();
    if (text.indexOf('esgotada') > -1) return true;

    if (btn.hasAttribute('disabled')) return true;
    return false;
  }

  function isBusinessFare(fareItem) {
    if (!fareItem) return false;
    const promo = fareItem.querySelector('.promotional');
    const name = (promo && promo.textContent ? promo.textContent : fareItem.textContent || '').toLowerCase();
    return name.indexOf('business') > -1;
  }

  function getFarePriceValue(fareItem) {
    if (!fareItem) return null;
    const priceEl = fareItem.querySelector('[data-test-id="fare-price"]');
    if (!priceEl) return null;
    return parsePtBrMoney(priceEl.textContent);
  }

  function getFlightCardsToProcess() {
    return Array.from(document.querySelectorAll('.flight-card'));
  }

  function getFareItemsForCard(flightCard) {
    if (!flightCard) return [];
    const container = flightCard.querySelector('.card-content .fares-container');
    if (!container) return [];
    return Array.from(container.querySelectorAll('.fare-item'));
  }

  function computeCheapestFare(fareItems) {
    let min = null;
    fareItems.forEach(function (item) {
      if (isFareSoldOut(item)) return;
      const v = getFarePriceValue(item);
      if (v === null) return;
      if (min === null || v < min) min = v;
    });
    return min;
  }

  function cleanupFarePrice(fareItem) {
    const farePrice = fareItem && fareItem.querySelector ? fareItem.querySelector('.fare-price') : null;
    if (!farePrice) return;
    farePrice.classList.remove(VARIANT_NAME + '__hideOldPrice');
    farePrice.classList.remove(VARIANT_NAME + '__isBusiness');
    const box = farePrice.querySelector('.' + VARIANT_NAME + '__box');
    if (box) box.remove();
    farePrice.removeAttribute('data-wj-price-diff-signature');
  }

  function ensureBox(farePriceRoot) {
    if (!farePriceRoot) return null;
    const existing = farePriceRoot.querySelector('.' + VARIANT_NAME + '__box');
    if (existing) return existing;

    const box = document.createElement('div');
    box.className = VARIANT_NAME + '__box';
    box.setAttribute(WRAP_ATTR, 'true');

    const from = document.createElement('div');
    from.className = VARIANT_NAME + '__from';

    const diff = document.createElement('div');
    diff.className = VARIANT_NAME + '__diff';

    const currency = document.createElement('span');
    currency.className = VARIANT_NAME + '__currency';
    currency.textContent = 'R$';

    const intPart = document.createElement('span');
    intPart.className = VARIANT_NAME + '__int';

    const decPart = document.createElement('span');
    decPart.className = VARIANT_NAME + '__dec';

    diff.appendChild(currency);
    diff.appendChild(intPart);
    diff.appendChild(decPart);

    box.appendChild(from);
    box.appendChild(diff);
    farePriceRoot.appendChild(box);
    return box;
  }

  function renderPriceDiff(fareItem, cheapestValue) {
    if (!fareItem) return;

    const farePrice = fareItem.querySelector('.fare-price');
    if (!farePrice) return;

    const value = getFarePriceValue(fareItem);
    if (value === null || cheapestValue === null) return;

    const diffValue = Math.max(0, value - cheapestValue);
    if (diffValue < 0.005) {
      cleanupFarePrice(fareItem);
      return;
    }

    farePrice.classList.add(VARIANT_NAME + '__priceWrap');
    farePrice.classList.add(VARIANT_NAME + '__hideOldPrice');
    if (isBusinessFare(fareItem)) {
      farePrice.classList.add(VARIANT_NAME + '__isBusiness');
    } else {
      farePrice.classList.remove(VARIANT_NAME + '__isBusiness');
    }

    const signature = String(value) + '|' + String(cheapestValue);
    if (farePrice.getAttribute('data-wj-price-diff-signature') === signature) return;

    const box = ensureBox(farePrice);
    if (!box) return;

    const fromEl = box.querySelector('.' + VARIANT_NAME + '__from');
    const intEl = box.querySelector('.' + VARIANT_NAME + '__int');
    const decEl = box.querySelector('.' + VARIANT_NAME + '__dec');
    const diffRow = box.querySelector('.' + VARIANT_NAME + '__diff');

    if (!fromEl || !intEl || !decEl || !diffRow) return;

    fromEl.textContent = 'A partir de R$ ' + formatPtBr(cheapestValue);
    diffRow.classList.remove(VARIANT_NAME + '__hide');
    const diffFormatted = formatPtBr(diffValue);
    const split = splitPtBr(diffFormatted);
    intEl.textContent = '+' + split.intPart;
    decEl.textContent = ',' + split.fracPart;

    farePrice.setAttribute('data-wj-price-diff-signature', signature);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      injectStyles();

      const cards = getFlightCardsToProcess();
      let didRenderAny = false;

      cards.forEach(function (card) {
        const fareItems = getFareItemsForCard(card);
        if (!fareItems.length) return;

        const cheapest = computeCheapestFare(fareItems);
        if (cheapest === null) return;

        fareItems.forEach(function (fareItem) {
          if (isFareSoldOut(fareItem)) return;
          renderPriceDiff(fareItem, cheapest);
          didRenderAny = true;
        });
      });

      if (didRenderAny && !hasTrackedView) {
        hasTrackedView = true;
        analyticsEvent('view');
      }
    } finally {
      isProcessing = false;
    }
  }

  function isOwnMutation(mutation) {
    if (!mutation) return false;
    const target = mutation.target;
    if (!target || !(target instanceof Element)) return false;
    if (target.closest('[' + WRAP_ATTR + ']')) return true;
    if (target.id === STYLE_ID) return true;
    return false;
  }

  function setupObserver() {
    if (window._wjPriceDiffInternalDetailsObserver) return;

    const observer = new MutationObserver(function (mutations) {
      if (isProcessing) return;
      if (mutations && mutations.some(isOwnMutation)) return;

      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function () {
        run();
      }, 80);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'disabled', 'aria-hidden']
    });

    window._wjPriceDiffInternalDetailsObserver = observer;
  }

  function setupClickHints() {
    if (window._wjPriceDiffInternalDetailsClickHints) return;
    window._wjPriceDiffInternalDetailsClickHints = true;

    document.addEventListener(
      'click',
      function (e) {
        const target = e.target;
        if (!target || !target.closest) return;

        const btn = target.closest('button');
        const text = ((btn && btn.textContent) || '').toLowerCase();
        const aria = ((btn && btn.getAttribute && btn.getAttribute('aria-label')) || '').toLowerCase();
        const combined = text + ' ' + aria;

        if (
          combined.indexOf('ver tarifas') > -1 ||
          combined.indexOf('alterar tarifa') > -1 ||
          combined.indexOf('recolher') > -1 ||
          combined.indexOf('selecionar tarifa') > -1
        ) {
          ensureStylesEarly();
          window.setTimeout(function () {
            run();
          }, 0);
        }
      },
      true
    );
  }

  function init() {
    if (window._wjPriceDiffInternalDetailsInit) return;
    window._wjPriceDiffInternalDetailsInit = true;

    ensureStylesEarly();
    run();
    setupObserver();
    setupClickHints();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
