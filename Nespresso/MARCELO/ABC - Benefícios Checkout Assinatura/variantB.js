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
    return hash.indexOf('#/orders/create') !== -1 || hash.indexOf('#/orders/new') !== -1;
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
    const nodes = document.querySelectorAll('h1, h2, h3, [data-testid="TitleElement"]');
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
    const title = findProductsTitleNode();
    if (title) {
      const section = title.closest('section');
      if (section) {
        return section;
      }

      const titleBlock = title.closest('[class*="SectionTitleBlock"]');
      if (titleBlock && titleBlock.parentElement) {
        return titleBlock.parentElement;
      }

      const parent = title.parentElement;
      if (parent) {
        return parent;
      }
    }

    const productsList = document.querySelector('[data-testid="StandingOrdersProductsList"]');
    if (productsList) {
      return productsList;
    }

    return null;
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
    const F = 'font-family: NespressoLucas, Helvetica, Arial, sans-serif !important;';

    return (
      '#' +
      BANNER_ID +
      ' {' +
      '  box-sizing: border-box !important;' +
      '  width: 100% !important;' +
      '  margin: 0 0 24px 0 !important;' +
      '  border: 0 !important;' +
      '  border-radius: 0 !important;' +
      '  background: transparent !important;' +
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
      '  justify-content: center !important;' +
      '  gap: 0 !important;' +
      '  padding: 24px 16px !important;' +
      '  background: #f8f9f4 !important;' +
      '  border: 0 !important;' +
      '  border-radius: 4px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item {' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '  gap: 16px !important;' +
      '  flex: 1 1 0 !important;' +
      '  min-width: 0 !important;' +
      '  padding: 0 24px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item + .at-bcb__item {' +
      '  border-left: 1px solid #DEDEDE !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon {' +
      '  flex: 0 0 32px !important;' +
      '  width: 32px !important;' +
      '  height: 32px !important;' +
      '  color: #257A57 !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon--tag svg {' +
      '  width: 24px !important;' +
      '  height: 24px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon--delivery svg {' +
      '  width: 32px !important;' +
      '  height: 32px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__text {' +
      '  margin: 0 !important;' +
      '  max-width: 240px !important;' +
      '  font-size: 15px !important;' +
      '  line-height: 1.45 !important;' +
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
      '  gap: 14px !important;' +
      '  width: 100% !important;' +
      '  margin-top: 12px !important;' +
      '  padding: 12px 18px !important;' +
      '  background: #FBEED2 !important;' +
      '  border: 0 !important;' +
      '  border-radius: 8px !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-icon {' +
      '  flex: 0 0 26px !important;' +
      '  width: 26px !important;' +
      '  height: 26px !important;' +
      '  color: #E2A33E !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-icon svg {' +
      '  width: 26px !important;' +
      '  height: 26px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-text {' +
      '  margin: 0 !important;' +
      '  flex: 1 1 auto !important;' +
      '  font-size: 13px !important;' +
      '  line-height: 1.4 !important;' +
      '  font-weight: 700 !important;' +
      '  text-align: center !important;' +
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
      '[data-testid="StepHeader"] div[class*="SectionTitleBlock_"]:has([title="Selecione seus produtos"]) {' +
      '  padding-top: 0 !important;' +
      '}' +
      '@media (max-width: 900px) {' +
      '#' +
      BANNER_ID +
      ' .at-bcb__top {' +
      '  flex-direction: row !important;' +
      '  gap: 0 !important;' +
      '  padding: 0 !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item {' +
      '  justify-content: flex-start !important;' +
      '  gap: 8px !important;' +
      '  padding: 12px 8px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__item + .at-bcb__item {' +
      '  border-left: 1px solid #DEDEDE !important;' +
      '  border-top: 0 !important;' +
      '  padding-top: 12px !important;' +
      '}' +
      '#' +
      BANNER_ID +
      ' .at-bcb__text { max-width: none !important; font-size: 11px !important; line-height: 1.35 !important; }' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon { flex: 0 0 24px !important; width: 24px !important; height: 24px !important; }' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon--tag svg { width: 20px !important; height: 20px !important; }' +
      '#' +
      BANNER_ID +
      ' .at-bcb__icon--delivery svg { width: 24px !important; height: 24px !important; }' +
      '#' +
      BANNER_ID +
      ' .at-bcb__flex-text { font-size: 12px !important; text-align: left !important; }' +
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
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M11.7 2H2v9.7l11 11.01L22.7 13zM3 11.3V3h8.3l10 10-8.3 8.3z"/>' +
      '<path d="M5.5 6.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"/>' +
      '</svg>'
    );
  }

  function iconFreeDeliverySvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' +
      '<path d="M16 2.45 4 8.19v15.63l12 5.73 12-5.73V8.19zm0 1.1L26.34 8.5l-4.2 2.01L11.8 5.57zm-5.36 2.57 10.34 4.95L16 13.45 5.66 8.5zM27 23.18l-10.5 5.03V25h-1v3.2L5 23.19V9.3l10.5 5.03V17h1v-2.68l5-2.4v3.33l1-.5v-3.3L27 9.29z"/>' +
      '<path d="M8.81 18.46V23h.96v-1.82h1.34v-.79H9.77v-1.14h1.87v-.79zM15.84 19.95c0-1.28-.99-1.49-1.9-1.49h-1.39V23h.96v-1.55h.47l.97 1.55h1.16l-1.15-1.7c.46-.17.88-.59.88-1.35m-2.02.72h-.3v-1.44h.3c.49 0 1.03.08 1.03.72 0 .62-.48.72-1.03.72M17.92 21.08h1.3v-.8h-1.3v-1.03h1.84v-.79h-2.8V23h2.89v-.8H17.9zM21.77 19.25h1.85v-.79h-2.8V23h2.89v-.8h-1.94v-1.12h1.3v-.8h-1.3z"/>' +
      '</svg>'
    );
  }

  function iconFlexibilidadeSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' +
      '<path d="M26.5 9h-.98l.55-4H8.43l1.25 9h1l-.55-4h14.24l-1.69 12.14a1 1 0 0 1-.99.86H19v1h2.7a2 2 0 0 0 1.97-1.73l.88-6.27h1.95c2.58 0 3.5-1.8 3.5-3.5S29.08 9 26.5 9m-2 0H10l-.43-3h15.36zm2 6h-1.81l.69-5h1.12c2.17 0 2.5 1.57 2.5 2.5s-.33 2.5-2.5 2.5"/>' +
      '<path d="m15.66 20.17 1.56-1.56-2.83-2.83-1.57 1.57-.32-.1V15h-4v2.25l-.32.1-1.57-1.57-2.83 2.83 1.57 1.56-.1.33H3v4h2.25l.1.33-1.57 1.56 2.83 2.83 1.57-1.57.32.1V30h4v-2.25l.32-.1 1.57 1.57 2.83-2.83-1.57-1.56.1-.33H18v-4h-2.25zM17 23.5h-2.05l-.08.4q-.1.5-.26.86l-.12.31 1.31 1.32-1.41 1.41-1.32-1.32-.31.13q-.4.16-.86.26l-.4.08V29h-2v-2.05l-.4-.08q-.46-.1-.86-.26l-.3-.13L6.6 27.8 5.2 26.4l1.31-1.32-.12-.3q-.16-.37-.26-.87l-.08-.4H4v-2h2.05l.08-.4q.1-.5.26-.86l.12-.31L5.2 18.6 6.6 17.2l1.32 1.32.31-.13q.4-.16.86-.26l.4-.08V16h2v2.05l.4.08q.46.1.86.26l.3.13 1.33-1.32 1.41 1.41-1.31 1.32.12.3q.16.38.26.87l.08.4H17z"/>' +
      '<path d="M10.5 20c-1.59 0-2.5.91-2.5 2.5s.91 2.5 2.5 2.5 2.5-.91 2.5-2.5-.91-2.5-2.5-2.5m1.5 2.5c0 1.04-.46 1.5-1.5 1.5S9 23.54 9 22.5s.46-1.5 1.5-1.5 1.5.46 1.5 1.5"/>' +
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
      '<span class="at-bcb__icon at-bcb__icon--tag">' +
      iconTagSvg() +
      '</span>' +
      '<p class="at-bcb__text"><strong>10% OFF</strong> na assinatura em pedidos a partir de 30 cafés ou mais.</p>' +
      '</div>' +
      '<div class="at-bcb__item">' +
      '<span class="at-bcb__icon at-bcb__icon--delivery">' +
      iconFreeDeliverySvg() +
      '</span>' +
      '<p class="at-bcb__text"><strong>Frete grátis</strong> na assinatura em pedidos a partir de 30 cafés ou mais.</p>' +
      '</div>' +
      '</div>' +
      '<div class="at-bcb__flex" data-at-bcb-flex' +
      flexHidden +
      '>' +
      '<span class="at-bcb__flex-icon">' +
      iconFlexibilidadeSvg() +
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
        banner.classList.add('at-bcb--flex-hidden');
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
    banner.className = isFlexDismissed() ? 'at-bcb--flex-hidden' : '';
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
