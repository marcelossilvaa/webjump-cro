/* ============================================================
   333OBRA — PreSelect Pagamento (CONTROLE)
   Somente tagueamento do checkout nativo, com os mesmos eventos
   comparaveis da Variant B (sem redesign / preselect / tooltips).
   Colar no Insider: controle.min.js
   ============================================================ */
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'insider_ab_test',
  event_raised_by: 'insider',
  experiment_id: 'XXXX', // ← id real
  experiment_type: 'AB',
  experiment_name: 'PreSelect Pagamento + Resumo Compra | Checkout | 333',
  experiment_variant_id: 'XX', // ← id real do Control
  experiment_variant: 'Control',
  experiment_is_control: 'yes'
});

(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let retryCount = 0;
  let viewTracked = false;

  const ROOT_SELECTOR = '.items.payment-methods';
  const TRACKING_ATTR = 'data-wj-pay-controle-tracking';
  const PLACE_ORDER_TRACKING_ATTR = 'data-wj-pay-controle-place-order-tracking';
  const OBSERVER_KEY = '_wj333PreSelectPagamentoControleObserver';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;
  const OBSERVER_DELAY = 200;
  const TRACKING_CATEGORY = 'preselect_pagamento_333';

  function isCheckoutPage() {
    const path = (window.location.pathname || '').toLowerCase();
    return path.indexOf('/checkout') !== -1;
  }

  function sendGAEvent(label, action) {
    if (!label) return;

    const payload = {
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action || 'click',
      local_event_label: label
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function getSelectedPaymentCode(root) {
    const scope = root || document;
    const checked = scope.querySelector('input[name="payment[method]"]:checked');
    if (!checked) return '';
    return checked.id || checked.value || '';
  }

  function trackPlaceOrderClick() {
    const code = getSelectedPaymentCode(document.querySelector(ROOT_SELECTOR));
    sendGAEvent(
      code ? 'finalizar_pedido_' + code : 'finalizar_pedido',
      'click'
    );
  }

  function onPaymentMethodChange(event) {
    const target = event.target;
    const code = target && (target.id || target.value);
    if (!code) return;
    sendGAEvent('select_' + code, 'click');
  }

  function bindPaymentSelectTracking(root) {
    if (root.getAttribute(TRACKING_ATTR) === 'true') return;

    const radios = root.querySelectorAll('input[name="payment[method]"]');
    for (let i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', onPaymentMethodChange);
    }

    root.setAttribute(TRACKING_ATTR, 'true');
  }

  function bindPlaceOrderTracking(root) {
    const buttons = [];
    const nativeBtns = root.querySelectorAll(
      '.payment-method-content > .actions-toolbar .action.primary.checkout'
    );
    for (let i = 0; i < nativeBtns.length; i++) {
      buttons.push(nativeBtns[i]);
    }

    const summaryBtn = document.querySelector('.summary-action-button');
    if (summaryBtn) {
      buttons.push(summaryBtn);
    }

    for (let j = 0; j < buttons.length; j++) {
      const btn = buttons[j];
      if (btn.getAttribute(PLACE_ORDER_TRACKING_ATTR) === 'true') continue;
      btn.setAttribute(PLACE_ORDER_TRACKING_ATTR, 'true');
      btn.addEventListener('click', trackPlaceOrderClick);
    }
  }

  function enhanceRoot(root) {
    if (!root) return false;

    bindPaymentSelectTracking(root);
    bindPlaceOrderTracking(root);

    if (!viewTracked && root.querySelector('.payment-method')) {
      viewTracked = true;
      sendGAEvent('payment_methods_view', 'view');
    }

    return true;
  }

  function run() {
    if (!isCheckoutPage()) return false;
    if (isProcessing) return false;

    isProcessing = true;
    let applied = false;

    try {
      const root = document.querySelector(ROOT_SELECTOR);
      if (root && root.querySelector('.payment-method')) {
        applied = enhanceRoot(root);
      }
    } finally {
      isProcessing = false;
    }

    return applied;
  }

  function scheduleRun() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      run();
    }, OBSERVER_DELAY);
  }

  function startObserver() {
    if (window[OBSERVER_KEY]) return;

    const observer = new MutationObserver(function () {
      scheduleRun();
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    window[OBSERVER_KEY] = observer;
  }

  function init() {
    if (!isCheckoutPage()) return;

    if (run()) {
      startObserver();
      return;
    }

    if (retryCount >= MAX_RETRIES) {
      startObserver();
      return;
    }

    retryCount += 1;
    setTimeout(init, RETRY_DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
