(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let retryCount = 0;

  const STYLE_ID = 'wj-333-resumo-compra-style';
  const ROOT_SELECTOR = '.complete-order-summary';
  const ROOT_ATTR = 'data-wj-resumo-compra';
  const DATE_ENHANCED_ATTR = 'data-wj-date-enhanced';
  const BADGE_ENHANCED_ATTR = 'data-wj-badge-enhanced';
  const TOTAL_PRICE_ENHANCED_ATTR = 'data-wj-total-price-enhanced';
  const ROW_HIDDEN_CLASS = 'wj-summary-row-hidden';
  const ROW_SUBTOTAL_CLASS = 'wj-summary-row-subtotal';
  const ROW_SHIPPING_CLASS = 'wj-summary-row-shipping';
  const ROW_QUANTITY_CLASS = 'wj-summary-row-quantity';
  const ORDER_DONE_ATTR = 'data-wj-order-summary-done';
  const OBSERVER_KEY = '_wj333ResumoCompraObserver';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;
  const OBSERVER_DELAY = 200;

  const COLOR_ORANGE = '#ff5a14';
  const COLOR_ORANGE_LINE = '#e8a070';
  const COLOR_BADGE_BG = '#f2f2f2';
  const COLOR_BADGE_TEXT = '#697386';
  const COLOR_GREEN = '#13a538';
  const COLOR_TEXT = '#202938';
  const COLOR_MUTED = '#8b8f98';
  const COLOR_BORDER = '#e1e5ea';
  const COLOR_PEACH = '#fcf8f6';
  const FONT_FAMILY = 'Ubuntu, Arial, Helvetica, sans-serif';

  function scoped(selector) {
    return ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] ' + selector;
  }

  function getStyles() {
    return [
      scoped('') + ' {',
      '  box-sizing: border-box !important;',
      '  width: 100% !important;',
      '  margin: 0 !important;',
      '  padding: 20px !important;',
      '  border: 1px solid ' + COLOR_BORDER + ' !important;',
      '  border-radius: 8px !important;',
      '  background: #ffffff !important;',
      '  box-shadow: none !important;',
      '  font-family: ' + FONT_FAMILY + ' !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '}',
      scoped('*, ') + scoped('*::before, ') + scoped('*::after') + ' {',
      '  box-sizing: border-box !important;',
      '}',
      scoped('> h3') + ' {',
      '  margin: 0 !important;',
      '  padding: 0 0 12px !important;',
      '  border: 0 !important;',
      '  border-bottom: 2px solid ' + COLOR_ORANGE_LINE + ' !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 18px !important;',
      '  font-weight: 700 !important;',
      '  line-height: 1.2 !important;',
      '  text-transform: none !important;',
      '}',
      scoped('.seller-summary') + ' {',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  border-radius: 0 !important;',
      '  background: transparent !important;',
      '  box-shadow: none !important;',
      '  overflow: visible !important;',
      '}',
      scoped('.seller-summary + .seller-summary') + ' {',
      '  margin-top: 16px !important;',
      '}',
      scoped('.seller-header') + ' {',
      '  display: flex !important;',
      '  align-items: flex-start !important;',
      '  justify-content: space-between !important;',
      '  gap: 12px !important;',
      '  padding: 12px 14px !important;',
      '  border: 0 !important;',
      '  border-top: 0 !important;',
      '  border-radius: 0 !important;',
      '  background: ' + COLOR_PEACH + ' !important;',
      '  box-shadow: none !important;',
      '}',

      scoped('.seller-info-container') + ' {',
      '  flex: 1 1 auto !important;',
      '  min-width: 0 !important;',
      '  margin-bottom: 0 !important;',
      '}',
      scoped('.seller-info') + ' {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 10px !important;',
      '  cursor: pointer !important;',
      '}',
      scoped('.seller-logo') + ' {',
      '  flex: 0 0 auto !important;',
      '  width: 36px !important;',
      '  height: 36px !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  border-radius: 4px !important;',
      '  object-fit: contain !important;',
      '  background: transparent !important;',
      '}',
      scoped('.seller-name') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 14px !important;',
      '  font-weight: 700 !important;',
      '  line-height: 1.25 !important;',
      '}',
      scoped('.seller-address') + ' {',
      '  display: block !important;',
      '  margin: 4px 0 0 46px !important;',
      '  padding: 0 !important;',
      '  color: ' + COLOR_MUTED + ' !important;',
      '  font-size: 11px !important;',
      '  font-weight: 400 !important;',
      '  line-height: 1.35 !important;',
      '}',
      scoped('.seller-address.wj-empty-address') + ' {',
      '  display: none !important;',
      '}',
      scoped('.toggle-icon') + ' {',
      '  flex: 0 0 auto !important;',
      '  position: relative !important;',
      '  width: 18px !important;',
      '  height: 18px !important;',
      '  margin-top: 2px !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  background: transparent !important;',
      '  background-image: none !important;',
      '  box-shadow: none !important;',
      '  cursor: pointer !important;',
      '}',
      scoped('.toggle-icon::before') + ' {',
      '  content: "" !important;',
      '  position: absolute !important;',
      '  top: 50% !important;',
      '  left: 50% !important;',
      '  width: 8px !important;',
      '  height: 8px !important;',
      '  margin: -6px 0 0 -4px !important;',
      '  border-right: 2px solid ' + COLOR_MUTED + ' !important;',
      '  border-bottom: 2px solid ' + COLOR_MUTED + ' !important;',
      '  transform: rotate(45deg) !important;',
      '  transition: transform 160ms ease !important;',
      '}',
      scoped('.toggle-icon.expanded::before') + ' {',
      '  margin-top: -2px !important;',
      '  transform: rotate(-135deg) !important;',
      '}',
      scoped('.seller-items') + ' {',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  background: transparent !important;',
      '}',
      scoped('.seller-items .item') + ' {',
      '  display: flex !important;',
      '  align-items: flex-start !important;',
      '  justify-content: space-between !important;',
      '  gap: 12px !important;',
      '  margin: 0 !important;',
      '  padding: 5px 0 !important;',
      '  border: 0 !important;',
      '}',
      scoped('.seller-items .item-info') + ' {',
      '  flex: 1 1 auto !important;',
      '  min-width: 0 !important;',
      '  display: block !important;',
      '}',
      scoped('.seller-items .item-quantity') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.seller-items .item-name') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '  line-height: 1.35 !important;',
      '}',
      scoped('.seller-items .item-price') + ' {',
      '  flex: 0 0 auto !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 700 !important;',
      '  white-space: nowrap !important;',
      '}',
      scoped('.delivery-cost') + ' {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: space-between !important;',
      '  gap: 12px !important;',
      '  padding: 10px 0 0 !important;',
      '  border: 0 !important;',
      '  border-top: 1px solid ' + COLOR_BORDER + ' !important;',
      '  background: transparent !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  margin-top: 0px !important;',
      '}',
      scoped('.delivery-cost > div') + ' {',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  gap: 4px !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.delivery-cost .delivery-price') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.delivery-cost > div > span:not(.delivery-price)') + ' {',
      '  font-size: 13px !important;',
      '  font-weight: 700 !important;',
      '}',
      scoped('.delivery-cost .total-price') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.delivery-cost .total-price .wj-total-price-label') + ' {',
      '  font-size: 11px !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.delivery-cost .total-price .wj-total-price-value') + ' {',
      '  font-size: 13px !important;',
      '  font-weight: 700 !important;',
      '}',
      scoped('.seller-delivery-information') + ' {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: space-between !important;',
      '  gap: 12px !important;',
      '  margin: 8px 0 0 !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  border-radius: 0 !important;',
      '  background: transparent !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '  line-height: 1.3 !important;',
      '}',
      scoped('.seller-delivery-information .delivery-date') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.seller-delivery-information .delivery-date.wj-delivery-date-ko') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '}',
      scoped(
        '.seller-delivery-information .delivery-date.wj-delivery-date-ko .wj-delivery-date-value',
      ) + ' {',
      '  color: ' + COLOR_ORANGE + ' !important;',
      '  font-weight: 700 !important;',
      '}',
      scoped('.seller-delivery-information .wj-delivery-date-value') + ' {',
      '  color: ' + COLOR_ORANGE + ' !important;',
      '  font-size: 13px !important;',
      '  font-weight: 700 !important;',
      '}',
      scoped('.seller-delivery-information .wj-item-count-badge') + ' {',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  min-width: 56px !important;',
      '  margin: 0 !important;',
      '  padding: 4px 10px !important;',
      '  border: 0 !important;',
      '  border-radius: 8px !important;',
      '  background: ' + COLOR_BADGE_BG + ' !important;',
      '  color:' + COLOR_ORANGE + ' !important;',
      '  font-size: 12px !important;',
      '  font-weight: 600 !important;',
      '  white-space: nowrap !important;',
      '}',
      scoped('.order-summary') + ' {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 6px !important;',
      '  margin: 16px 0 0 !important;',
      '  padding: 16px 0 0 !important;',
      '  border: 0 !important;',
      '  border-top: 2px solid ' + COLOR_ORANGE_LINE + ' !important;',
      '  border-bottom: 0 !important;',
      '  background: transparent !important;',
      '  box-shadow: none !important;',
      '}',
      scoped('.order-summary > div') + ' {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: space-between !important;',
      '  gap: 12px !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 14px !important;',
      '  line-height: 1.35 !important;',
      '}',
      scoped('.order-summary > div > span:first-child') + ' {',
      '  flex: 1 1 auto !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-weight: 400 !important;',
      '}',
      scoped('.order-summary > div > span:last-child:not(.selected-quotation):not(.free)') + ' {',
      '  flex: 0 0 auto !important;',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-weight: 700 !important;',
      '  text-align: right !important;',
      '}',
      scoped('.order-summary > div > span.free, ') + scoped('.delivery-cost span.free') + ' {',
      '  color: ' + COLOR_GREEN + ' !important;',
      '  font-weight: 700 !important;',
      '}',
      scoped('.order-summary > div.' + ROW_QUANTITY_CLASS + ' > span:last-child') + ' {',
      '  font-weight: 400 !important;',
      '}',
      scoped('.order-summary > div.' + ROW_HIDDEN_CLASS) + ' {',
      '  display: none !important;',
      '}',
      scoped('.order-total') + ' {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: space-between !important;',
      '  gap: 12px !important;',
      '  margin: 14px 0 0 !important;',
      '  padding: 14px 0 0 !important;',
      '  border: 0 !important;',
      '  border-top: 1px solid ' + COLOR_BORDER + ' !important;',
      '  background: transparent !important;',
      '}',
      scoped('.order-total > span:first-child') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 16px !important;',
      '  font-weight: 700 !important;',
      '  line-height: 1.2 !important;',
      '}',
      scoped('.order-total > span:last-child') + ' {',
      '  color: ' + COLOR_TEXT + ' !important;',
      '  font-size: 22px !important;',
      '  font-weight: 800 !important;',
      '  line-height: 1.1 !important;',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = getStyles();
  }

  function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function setTextIfChanged(el, nextText) {
    if (!el) return;
    if (normalizeText(el.textContent) === nextText) return;
    el.textContent = nextText;
  }

  function normalizeFreeLabels(root) {
    const freeEls = root.querySelectorAll('.free');
    for (let i = 0; i < freeEls.length; i++) {
      const text = normalizeText(freeEls[i].textContent).toLowerCase();
      if (text === 'grátis' || text === 'gratis') {
        setTextIfChanged(freeEls[i], 'GRÁTIS');
      }
    }
  }

  function getSummaryRowType(row) {
    if (!row) return 'unknown';

    if (row.querySelector('.selected-quotation')) return 'quotation';

    const label = row.querySelector('span:first-child');
    if (!label) return 'unknown';

    const text = normalizeText(label.textContent).toLowerCase();
    const bind = label.getAttribute('data-bind') || '';

    if (
      bind.indexOf('Quotation') !== -1 ||
      text.indexOf('cotação') !== -1 ||
      text.indexOf('cotacao') !== -1
    ) {
      return 'quotation';
    }
    if (
      bind.indexOf('Product value') !== -1 ||
      text.indexOf('valor dos produto') !== -1 ||
      text === 'subtotal'
    ) {
      return 'subtotal';
    }
    if (bind.indexOf('Shipping total') !== -1 || text.indexOf('total do frete') !== -1) {
      return 'shipping';
    }
    if (
      bind.indexOf('Number of deliveries') !== -1 ||
      bind.indexOf('Number of pickups') !== -1 ||
      bind.indexOf('pickup') !== -1 ||
      text.indexOf('quantidade de') !== -1
    ) {
      return 'quantity';
    }
    if (
      bind.indexOf('Final delivery deadline') !== -1 ||
      bind.indexOf('Final pickup deadline') !== -1 ||
      text.indexOf('prazo final') !== -1
    ) {
      return 'deadline';
    }

    return 'other';
  }

  function getSummaryRowOrderKey(rows) {
    let key = '';
    for (let i = 0; i < rows.length; i++) {
      key += getSummaryRowType(rows[i]) + '|';
    }
    return key;
  }

  function isSummaryOrderCorrect(container, orderedRows) {
    const visibleRows = [];
    for (let i = 0; i < orderedRows.length; i++) {
      if (orderedRows[i]) visibleRows.push(orderedRows[i]);
    }

    const children = container.children;
    let childIndex = 0;

    for (let j = 0; j < visibleRows.length; j++) {
      while (
        childIndex < children.length &&
        children[childIndex].classList.contains(ROW_HIDDEN_CLASS)
      ) {
        childIndex += 1;
      }
      if (childIndex >= children.length || children[childIndex] !== visibleRows[j]) {
        return false;
      }
      childIndex += 1;
    }

    return true;
  }

  function cleanupOrphanSellerNodes(summary) {
    const orphanItems = summary.querySelectorAll(':scope > .seller-items, :scope > .item');
    for (let i = 0; i < orphanItems.length; i++) {
      orphanItems[i].parentNode.removeChild(orphanItems[i]);
    }

    const sellers = summary.querySelectorAll('.seller-summary');
    for (let s = 0; s < sellers.length; s++) {
      const seller = sellers[s];
      const itemBlocks = seller.querySelectorAll(':scope > .seller-items');
      for (let b = 1; b < itemBlocks.length; b++) {
        itemBlocks[b].parentNode.removeChild(itemBlocks[b]);
      }
    }
  }

  function restructureOrderSummary(summary) {
    const container = summary.querySelector('.order-summary');
    if (!container) return;

    const rows = Array.prototype.slice.call(container.children).filter(function (node) {
      return node.tagName === 'DIV';
    });

    const grouped = {
      subtotal: null,
      quantity: null,
      shipping: null,
      quotation: null,
      deadline: null,
      other: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const type = getSummaryRowType(row);

      row.classList.remove(
        ROW_HIDDEN_CLASS,
        ROW_SUBTOTAL_CLASS,
        ROW_SHIPPING_CLASS,
        ROW_QUANTITY_CLASS,
      );

      if (type === 'quotation') {
        grouped.quotation = row;
        row.classList.add(ROW_HIDDEN_CLASS);
        continue;
      }

      if (type === 'deadline') {
        grouped.deadline = row;
        row.classList.add(ROW_HIDDEN_CLASS);
        continue;
      }

      if (type === 'subtotal') {
        grouped.subtotal = row;
        row.classList.add(ROW_SUBTOTAL_CLASS);
        const label = row.querySelector('span:first-child');
        setTextIfChanged(label, 'Subtotal');
        continue;
      }

      if (type === 'quantity') {
        grouped.quantity = row;
        row.classList.add(ROW_QUANTITY_CLASS);
        continue;
      }

      if (type === 'shipping') {
        grouped.shipping = row;
        row.classList.add(ROW_SHIPPING_CLASS);
        continue;
      }

      grouped.other.push(row);
    }

    const orderedRows = [grouped.subtotal, grouped.quantity, grouped.shipping].concat(
      grouped.other,
    );
    const orderKey = getSummaryRowOrderKey(rows);

    if (
      container.getAttribute(ORDER_DONE_ATTR) === orderKey &&
      isSummaryOrderCorrect(container, orderedRows)
    ) {
      return;
    }

    for (let j = 0; j < orderedRows.length; j++) {
      if (orderedRows[j]) container.appendChild(orderedRows[j]);
    }

    container.setAttribute(ORDER_DONE_ATTR, orderKey);
  }

  function updateSummaryTitle(summary) {
    setTextIfChanged(summary.querySelector('h3'), 'Resumo da compra');
  }

  function getAddressText(addressEl) {
    if (!addressEl) return '';

    const boundSpan = addressEl.querySelector('span[data-bind]');
    if (boundSpan) {
      return normalizeText(boundSpan.textContent);
    }

    return normalizeText(addressEl.textContent);
  }

  function enhanceDeliveryDate(dateEl) {
    if (!dateEl) return;

    const rawText = normalizeText(dateEl.textContent);
    if (!rawText) return;

    const colonIndex = rawText.indexOf(':');
    if (colonIndex === -1) return;

    const label = rawText.slice(0, colonIndex + 1);
    const value = rawText.slice(colonIndex + 1).trim();
    const nextText = label + ' ' + value;
    const existingValue = dateEl.querySelector('.wj-delivery-date-value');

    if (dateEl.getAttribute(DATE_ENHANCED_ATTR) === nextText && existingValue) {
      return;
    }

    dateEl.classList.add('wj-delivery-date-ko');
    if (dateEl.getAttribute('data-bind')) {
      dateEl.removeAttribute('data-bind');
    }

    dateEl.textContent = '';
    dateEl.appendChild(document.createTextNode(label + ' '));

    const strong = document.createElement('strong');
    strong.className = 'wj-delivery-date-value';
    strong.textContent = value;
    dateEl.appendChild(strong);
    dateEl.setAttribute(DATE_ENHANCED_ATTR, nextText);
  }

  function enhanceTotalPrice(totalEl) {
    if (!totalEl) return;

    const rawText = normalizeText(totalEl.textContent);
    if (!rawText) return;

    const match = rawText.match(/^Total:\s*(.+)$/i);
    if (!match) return;

    const value = match[1].trim();
    const nextText = 'Total: ' + value;

    if (
      totalEl.getAttribute(TOTAL_PRICE_ENHANCED_ATTR) === nextText &&
      totalEl.querySelector('.wj-total-price-value')
    ) {
      return;
    }

    if (totalEl.getAttribute('data-bind')) {
      totalEl.removeAttribute('data-bind');
    }

    totalEl.textContent = '';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'wj-total-price-label';
    labelSpan.textContent = 'Total: ';

    const valueSpan = document.createElement('span');
    valueSpan.className = 'wj-total-price-value';
    valueSpan.textContent = value;

    totalEl.appendChild(labelSpan);
    totalEl.appendChild(valueSpan);
    totalEl.setAttribute(TOTAL_PRICE_ENHANCED_ATTR, nextText);
  }

  function enhanceItemCountBadge(infoBar) {
    if (!infoBar) return;

    const badge = infoBar.querySelector('span:not(.delivery-date)');
    if (!badge) return;

    badge.classList.add('wj-item-count-badge');
    badge.setAttribute(BADGE_ENHANCED_ATTR, 'true');
  }

  function enhanceOrderSummaryRows(summary) {
    restructureOrderSummary(summary);
  }

  function toggleEmptyAddress(addressEl) {
    if (!addressEl) return;

    const text = getAddressText(addressEl);
    if (text) {
      addressEl.classList.remove('wj-empty-address');
      return;
    }

    addressEl.classList.add('wj-empty-address');
  }

  function enhanceSummary(summary) {
    if (!summary) return false;

    let changed = false;

    if (summary.getAttribute(ROOT_ATTR) !== 'true') {
      summary.setAttribute(ROOT_ATTR, 'true');
      changed = true;
    }

    updateSummaryTitle(summary);
    normalizeFreeLabels(summary);
    cleanupOrphanSellerNodes(summary);

    const addresses = summary.querySelectorAll('.seller-address');
    for (let i = 0; i < addresses.length; i++) {
      toggleEmptyAddress(addresses[i]);
    }

    const deliveryDates = summary.querySelectorAll('.delivery-date');
    for (let j = 0; j < deliveryDates.length; j++) {
      enhanceDeliveryDate(deliveryDates[j]);
    }

    const infoBars = summary.querySelectorAll('.seller-delivery-information');
    for (let k = 0; k < infoBars.length; k++) {
      enhanceItemCountBadge(infoBars[k]);
    }

    const totalPrices = summary.querySelectorAll('.delivery-cost .total-price');
    for (let t = 0; t < totalPrices.length; t++) {
      enhanceTotalPrice(totalPrices[t]);
    }

    enhanceOrderSummaryRows(summary);

    return changed || summary.getAttribute(ROOT_ATTR) === 'true';
  }

  function run() {
    if (isProcessing) return false;
    isProcessing = true;

    let applied = false;

    try {
      const summaries = document.querySelectorAll(ROOT_SELECTOR);
      for (let i = 0; i < summaries.length; i++) {
        if (enhanceSummary(summaries[i])) {
          applied = true;
        }
      }
    } finally {
      isProcessing = false;
    }

    return applied || document.querySelector(ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"]') !== null;
  }

  function checkSellerItemNodes(nodeList) {
    for (let n = 0; n < nodeList.length; n++) {
      const node = nodeList[n];
      if (node.nodeType !== 1) continue;
      if (
        node.classList &&
        (node.classList.contains('seller-items') || node.classList.contains('item'))
      ) {
        return true;
      }
    }
    return false;
  }

  function isRelevantMutation(target) {
    if (!target || target.nodeType !== 1) return false;
    if (target.id === STYLE_ID) return false;
    if (target.closest && target.closest('#' + STYLE_ID)) return false;
    return true;
  }

  function startObserver() {
    if (window[OBSERVER_KEY]) return;

    const observer = new MutationObserver(function (mutations) {
      let hasRelevant = false;

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        const target = mutation.target;

        if (mutation.type === 'childList') {
          if (
            checkSellerItemNodes(mutation.addedNodes) ||
            checkSellerItemNodes(mutation.removedNodes)
          ) {
            hasRelevant = true;
            break;
          }

          if (
            target.classList &&
            (target.classList.contains('seller-summary') ||
              target.classList.contains('complete-order-summary'))
          ) {
            hasRelevant = true;
            break;
          }
        }

        if (mutation.type === 'characterData') {
          const parent = target.parentElement;
          if (parent && parent.closest('.seller-items')) {
            continue;
          }
          if (
            parent &&
            (parent.classList.contains('delivery-date') || parent.closest('.seller-address'))
          ) {
            hasRelevant = true;
            break;
          }
        }

        if (!isRelevantMutation(target)) continue;
        if (target.classList && target.classList.contains('item')) continue;
        if (target.closest && target.closest('.seller-items .item')) continue;

        hasRelevant = true;
        break;
      }

      if (!hasRelevant) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, OBSERVER_DELAY);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window[OBSERVER_KEY] = observer;
  }

  function initWithRetry() {
    injectStyles();
    const applied = run();

    if (applied) {
      startObserver();
      return;
    }

    retryCount += 1;
    if (retryCount < MAX_RETRIES) {
      setTimeout(initWithRetry, RETRY_DELAY);
      return;
    }

    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithRetry);
  } else {
    initWithRetry();
  }
})();
