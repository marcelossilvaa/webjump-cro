(function () {
  'use strict';

  // =========================================================
  // Nespresso — ABC Benefícios Checkout Assinatura — Variant B
  // Banner no topo: 10% OFF + Frete grátis + Flexibilidade
  // =========================================================

  if (window.atNespressoBeneficiosCheckoutBInitialized) {
    return;
  }
  window.atNespressoBeneficiosCheckoutBInitialized = true;

  let isProcessing = false;
  let debounceTimer = null;
  let viewTracked = false;

  const STYLE_ID = 'at-beneficios-checkout-b-style';
  const BANNER_ID = 'at-beneficios-checkout-b';
  const DISMISS_KEY = 'at-beneficios-checkout-b-flex-dismissed';
  const TRACKING_PREFIX = 'beneficios_checkout_assinatura_b';

  function sendGAEvent(action, label) {
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: 'local_event',
        event_raised_by: 'br',
        local_event_category: 'user engagement',
        local_event_action: action || 'click',
        local_event_label: label,
      });
    } catch (e) {
      // Silencioso
    }
  }

  function debounce(fn, waitMs) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(fn, waitMs);
  }

  function isStandingOrdersPage() {
    return window.location.pathname.indexOf('/myaccount/standing-orders') !== -1;
  }

  function isCreateCheckoutFlow() {
    const hash = window.location.hash || '';
    return (
      hash.indexOf('#/orders/create') !== -1 ||
      hash.indexOf('#/orders/new') !== -1
    );
  }

  function isProductsStep() {
    if (document.querySelector('[data-testid="StandingOrdersProductsList"]')) {
      return true;
    }
    if (document.querySelector('[data-testid="cfh_products"]')) {
      return true;
    }
    return !!findProductsTitleNode();
  }

  function findProductsTitleNode() {
    const nodes = document.querySelectorAll(
      'h1, h2, h3, [data-testid="TitleElement"]'
    );
    let i = 0;
    while (i < nodes.length) {
      const text = nodes[i].textContent ? nodes[i].textContent.trim() : '';
      if (text.indexOf('Selecione seus produtos') !== -1) {
        return nodes[i];
      }
      i++;
    }
    return null;
  }

  function getInsertAnchor() {
    const productsList = document.querySelector(
      '[data-testid="StandingOrdersProductsList"]'
    );
    if (productsList) {
      return productsList;
    }

    const title = findProductsTitleNode();
    if (!title) {
      return null;
    }

    const section = title.closest('section');
    if (section) {
      return section;
    }

    const parent = title.parentElement;
    if (parent && parent.parentElement) {
      return parent;
    }

    return title;
  }

  function isFlexDismissed() {
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setFlexDismissed() {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (e) {
      // Silencioso
    }
  }

  function getCss() {
    const F =
      "font-family: NespressoLucas, Helvetica, Arial, sans-serif !important;";

    return (
      '#' +
      BANNER_ID +
      ' {' +
      '  box-sizing: border-box !important;' +
      '  width: 100% !important;' +
      '  margin: 0 0 20px 0 !important;' +
      '  border: 1px solid #E5E5E5 !important;' +
      '  border-radius: 4px !important;' +
      '  background: #FFFFFF !important;' +
      '  overflow: hidden !important;' +
      '  ' +
      F +
      '}' +
      '#' +
      BANNER_ID +
      ' * { box-sizing: border-box !important; ' +
      F +
      ' }' +
      '#' +
      BANNER_ID +
      ' .at-bcb__top {' +
      '  display: flex !important;' +
      '  align-items: stretch !important;' +
      '  gap: 0 !important;' +
      '  padding: 16px 20px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item {' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  gap: 12px !important;' +
      '  flex: 1 1 0 !important;' +
      '  min-width: 0 !important;' +
      '  padding: 0 12px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item + .at-bcb__item {' +
      '  border-left: 1px solid #E8E8E8 !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon {' +
      '  flex: 0 0 28px !important;' +
      '  width: 28px !important;' +
      '  height: 28px !important;' +
      '  color: #257A57 !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon svg {' +
      '  width: 28px !important;' +
      '  height: 28px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__text {' +
      '  margin: 0 !important;' +
      '  font-size: 14px !important;' +
      '  line-height: 1.35 !important;' +
      '  color: #17171A !important;' +
      '  font-weight: 400 !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__text strong {' +
      '  font-weight: 700 !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex {' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  gap: 10px !important;' +
      '  width: 100% !important;' +
      '  padding: 10px 16px !important;' +
      '  background: #F5E6C8 !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-icon {' +
      '  flex: 0 0 22px !important;' +
      '  width: 22px !important;' +
      '  height: 22px !important;' +
      '  color: #C4A035 !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-icon svg {' +
      '  width: 22px !important;' +
      '  height: 22px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-text {' +
      '  margin: 0 !important;' +
      '  flex: 1 1 auto !important;' +
      '  font-size: 13px !important;' +
      '  line-height: 1.35 !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__close {' +
      '  flex: 0 0 28px !important;' +
      '  width: 28px !important;' +
      '  height: 28px !important;' +
      '  border: 0 !important;' +
      '  background: transparent !important;' +
      '  padding: 0 !important;' +
      '  cursor: pointer !important;' +
      '  color: #17171A !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__close svg {' +
      '  width: 16px !important;' +
      '  height: 16px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex[hidden] { display: none !important; }' +
      '@media (max-width: 900px) {' +
      '#' +
      BANNER_ID +
      ' .at-bcb__top {' +
      '  flex-direction: column !important;' +
      '  gap: 12px !important;' +
      '  padding: 14px 16px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item {' +
      '  padding: 0 !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item + .at-bcb__item {' +
      '  border-left: 0 !important;' +
      '  border-top: 1px solid #E8E8E8 !important;' +
      '  padding-top: 12px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__text { font-size: 13px !important; }' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-text { font-size: 12px !important; }' +
      '}'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);
  }

  function iconTagSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M3.5 8.5l6.2-6.2a2 2 0 0 1 2.8 0l7.2 7.2a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.5 11.3a2 2 0 0 1 0-2.8z" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="8.2" cy="8.2" r="1.2" fill="currentColor"/>' +
      '</svg>'
    );
  }

  function iconTruckSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M3 7.5h10.5v9H7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M13.5 10.5H18l2.5 3v3h-2.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="7.5" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="17.5" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.6"/>' +
      '</svg>'
    );
  }

  function iconGiftSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="4" y="10" width="16" height="10" rx="1.2" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M4 14h16M12 10v10" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M12 10c-2.2-3.5-6-2.2-6 0 0 1.5 2.4 2.4 6 2.4S18 11.5 18 10c0-2.2-3.8-3.5-6 0z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function iconCloseSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  function buildBannerHtml() {
    const flexHidden = isFlexDismissed() ? ' hidden' : '';

    return (
      '<div class="at-bcb__top">' +
      '<div class="at-bcb__item">' +
      '<span class="at-bcb__icon">' +
      iconTagSvg() +
      '</span>' +
      '<p class="at-bcb__text"><strong>10% OFF</strong> na assinatura em pedidos a partir de 30 cafés ou mais.</p>' +
      '</div>' +
      '<div class="at-bcb__item">' +
      '<span class="at-bcb__icon">' +
      iconTruckSvg() +
      '</span>' +
      '<p class="at-bcb__text"><strong>Frete grátis</strong> na assinatura em pedidos a partir de 30 cafés ou mais.</p>' +
      '</div>' +
      '</div>' +
      '<div class="at-bcb__flex" data-at-bcb-flex' +
      flexHidden +
      '>' +
      '<span class="at-bcb__flex-icon">' +
      iconGiftSvg() +
      '</span>' +
      '<p class="at-bcb__flex-text">Assinantes têm flexibilidade para alterar cafés, frequência e endereço a qualquer momento.</p>' +
      '<button type="button" class="at-bcb__close" aria-label="Fechar" data-at-bcb-close>' +
      iconCloseSvg() +
      '</button>' +
      '</div>'
    );
  }

  function bindBannerEvents(banner) {
    if (!banner || banner.hasAttribute('data-at-bcb-bound')) {
      return;
    }
    banner.setAttribute('data-at-bcb-bound', '1');

    const closeBtn = banner.querySelector('[data-at-bcb-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        setFlexDismissed();
        const flex = banner.querySelector('[data-at-bcb-flex]');
        if (flex) {
          flex.setAttribute('hidden', '');
        }
        sendGAEvent('click', TRACKING_PREFIX + '_fechar_flexibilidade');
      });
    }
  }

  function removeBanner() {
    const existing = document.getElementById(BANNER_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  function applyVariantB() {
    if (!isStandingOrdersPage() || !isCreateCheckoutFlow()) {
      removeBanner();
      return;
    }

    if (!isProductsStep()) {
      removeBanner();
      return;
    }

    injectStyles();

    const existing = document.getElementById(BANNER_ID);
    if (existing) {
      bindBannerEvents(existing);
      trackViewOnce();
      return;
    }

    const anchor = getInsertAnchor();
    if (!anchor || !anchor.parentNode) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('data-at-beneficios-checkout', 'B');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Benefícios da assinatura');
    banner.innerHTML = buildBannerHtml();

    anchor.parentNode.insertBefore(banner, anchor);
    bindBannerEvents(banner);
    trackViewOnce();
  }

  function trackViewOnce() {
    if (viewTracked) {
      return;
    }
    if (!document.getElementById(BANNER_ID)) {
      return;
    }
    viewTracked = true;
    sendGAEvent('view', TRACKING_PREFIX + '_view');
  }

  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      applyVariantB();
    } finally {
      isProcessing = false;
    }
  }

  function onHashChange() {
    viewTracked = false;
    debounce(run, 50);
  }

  function init() {
    debounce(run, 0);

    if (!window._atBeneficiosCheckoutObserverB) {
      let localTimer = null;
      const observer = new MutationObserver(function (mutations) {
        let i = 0;
        let ignoreAll = true;
        while (i < mutations.length) {
          const target = mutations[i] && mutations[i].target;
          if (
            !(
              target &&
              target.nodeType === 1 &&
              (target.id === BANNER_ID ||
                target.id === STYLE_ID ||
                (target.closest && target.closest('#' + BANNER_ID)))
            )
          ) {
            ignoreAll = false;
            break;
          }
          i++;
        }
        if (ignoreAll) {
          return;
        }

        if (localTimer) {
          clearTimeout(localTimer);
        }
        localTimer = setTimeout(function () {
          debounce(run, 0);
        }, 150);
      });

      observer.observe(document.body, { childList: true, subtree: true });
      window._atBeneficiosCheckoutObserverB = observer;
    }

    window.addEventListener('hashchange', onHashChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
