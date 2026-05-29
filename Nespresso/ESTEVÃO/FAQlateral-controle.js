(function () {
  'use strict';

  const TRACKING_LABEL = 'clicou_link_perguntas_frequentes_faq_assinatura_controle';

  function sendGAEvent(action, label) {
    var eventAction = action;
    var eventLabel = label;

    if (typeof eventLabel === 'undefined') {
      eventLabel = eventAction;
      eventAction = 'click';
    }

    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'user engagement',
      local_event_action: eventAction,
      local_event_label: eventLabel,
    });
  }

  function buttonMatchesFaqLabel(btn) {
    var label;

    if (!btn) {
      return false;
    }

    label = btn.textContent ? btn.textContent.replace(/\s+/g, ' ').trim() : '';
    return (
      label.indexOf('perguntas frequentes') !== -1 || label.indexOf('Alguma pergunta') !== -1
    );
  }

  function isVariantFaqButton(btn) {
    if (!btn) {
      return false;
    }

    return !!(
      btn.closest('#wj-nespresso-faq-lateral') ||
      btn.closest('#wj-nespresso-faq-mobile') ||
      btn.closest('[data-wj-faq-proxy-target="true"]') ||
      btn.getAttribute('data-wj-faq-native-trigger-hidden') === 'true'
    );
  }

  function isNativeFaqLinkButton(btn) {
    if (!btn || btn.tagName !== 'BUTTON') {
      return false;
    }

    if (!btn.className || btn.className.indexOf('_link_') === -1) {
      return false;
    }

    if (!btn.closest('[class*="_Modal__textLink"]')) {
      return false;
    }

    return buttonMatchesFaqLabel(btn);
  }

  function handleDocumentClick(event) {
    var btn = event.target && event.target.closest('button[class*="_link_"]');

    if (!isNativeFaqLinkButton(btn) || isVariantFaqButton(btn)) {
      return;
    }

    sendGAEvent(TRACKING_LABEL);
  }

  function bindTracking() {
    if (window._wjFaqControleTrackingBound) {
      return;
    }

    document.addEventListener('click', handleDocumentClick, true);
    window._wjFaqControleTrackingBound = true;
  }

  function init() {
    bindTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
