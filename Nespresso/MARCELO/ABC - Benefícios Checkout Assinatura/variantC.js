(function () {
  'use strict';

  // =========================================================
  // Nespresso — ABC Benefícios Checkout Assinatura — Variant C
  // Terceira coluna em .clearfix.account com benefícios
  // =========================================================

  if (window.atNespressoBeneficiosCheckoutCInitialized) {
    return;
  }
  window.atNespressoBeneficiosCheckoutCInitialized = true;

  let isProcessing = false;
  let debounceTimer = null;
  let viewTracked = false;

  const STYLE_ID = 'at-beneficios-checkout-c-style';
  const COLUMN_ID = 'at-beneficios-checkout-c';
  const ACCOUNT_ATTR = 'data-at-beneficios-checkout-c';
  const MOBILE_CLASS = 'at-bcc--mobile';
  const MOBILE_MAX_WIDTH = 993;
  const TRACKING_PREFIX = 'beneficios_checkout_assinatura_c';

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

  function getAccountContainer() {
    const withClasses = document.querySelector('div.clearfix.account');
    if (withClasses && withClasses.querySelector('.sidebar') && withClasses.querySelector('.main')) {
      return withClasses;
    }

    const accounts = document.querySelectorAll('div.account');
    let i = 0;
    while (i < accounts.length) {
      const account = accounts[i];
      if (account.querySelector(':scope > .sidebar') && account.querySelector(':scope > .main')) {
        return account;
      }
      if (account.querySelector('.sidebar') && account.querySelector('.main')) {
        return account;
      }
      i++;
    }

    return null;
  }

  function isMobileLayout() {
    return window.matchMedia('(max-width: ' + MOBILE_MAX_WIDTH + 'px)').matches;
  }

  function getMainElement(account) {
    if (!account) {
      return null;
    }
    return account.querySelector(':scope > .main') || account.querySelector('.main');
  }

  function getStepper(root) {
    if (!root) {
      return null;
    }

    const stepper = root.querySelector('div[class*="Stepper"][role="tablist"]');
    if (stepper) {
      return stepper;
    }

    return root.querySelector('.Stepper_1301[role="tablist"]');
  }

  function insertNodeAfter(referenceNode, node) {
    if (!referenceNode || !node || !referenceNode.parentNode) {
      return false;
    }

    if (node.parentNode === referenceNode.parentNode && node.previousElementSibling === referenceNode) {
      return true;
    }

    const parent = referenceNode.parentNode;
    if (referenceNode.nextSibling) {
      parent.insertBefore(node, referenceNode.nextSibling);
    } else {
      parent.appendChild(node);
    }

    return true;
  }

  function getMobileInsertAnchor(main) {
    const stepper = getStepper(main);
    if (stepper) {
      return stepper;
    }

    const flowHeader = main.querySelector('[data-testid="cfh_products"]');
    if (flowHeader) {
      const headerStepper = getStepper(flowHeader);
      if (headerStepper) {
        return headerStepper;
      }
      return flowHeader;
    }

    return null;
  }

  function getCss() {
    const F =
      "font-family: NespressoLucas, Helvetica, Arial, sans-serif !important;";
    const accountSel = '.account[' + ACCOUNT_ATTR + '="1"]';

    return (
      accountSel +
      ' {' +
      '  display: flex !important;' +
      '  align-items: flex-start !important;' +
      '  flex-wrap: nowrap !important;' +
      '}' +
      accountSel +
      ' > .main {' +
      '  flex: 2 1 0 !important;' +
      '  min-width: 0 !important;' +
      '  padding-right: 10px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' {' +
      '  box-sizing: border-box !important;' +
      '  flex: 0 0 270px !important;' +
      '  width: 270px !important;' +
      '  max-width: 270px !important;' +
      '  margin: 15px 0 24px 0 !important;' +
      '  padding: 24px 20px !important;' +
      '  background: #F3F3F0 !important;' +
      '  border-radius: 12px !important;' +
      '  position: sticky !important;' +
      '  top: 96px !important;' +
      '  align-self: flex-start !important;' +
      '  z-index: 5 !important;' +
      '  ' +
      F +
      '}' +
      '#' +
      COLUMN_ID +
      ' * { box-sizing: border-box !important; ' +
      F +
      ' }' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__title {' +
      '  margin: 0 0 20px 0 !important;' +
      '  font-size: 15px !important;' +
      '  line-height: 1.3 !important;' +
      '  font-weight: 700 !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__list {' +
      '  list-style: none !important;' +
      '  margin: 0 !important;' +
      '  padding: 0 !important;' +
      '  display: flex !important;' +
      '  flex-direction: column !important;' +
      '  gap: 20px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__item {' +
      '  display: flex !important;' +
      '  align-items: flex-start !important;' +
      '  gap: 14px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__icon {' +
      '  flex: 0 0 40px !important;' +
      '  width: 40px !important;' +
      '  height: 40px !important;' +
      '  border-radius: 50% !important;' +
      '  background: #257A57 !important;' +
      '  color: #FFFFFF !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__icon--24 svg {' +
      '  width: 20px !important;' +
      '  height: 20px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__icon--32 svg {' +
      '  width: 22px !important;' +
      '  height: 22px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__content {' +
      '  min-width: 0 !important;' +
      '  flex: 1 1 auto !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__name {' +
      '  margin: 0 0 4px 0 !important;' +
      '  font-size: 14px !important;' +
      '  line-height: 1.3 !important;' +
      '  font-weight: 700 !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__desc {' +
      '  margin: 0 !important;' +
      '  font-size: 13px !important;' +
      '  line-height: 1.4 !important;' +
      '  font-weight: 400 !important;' +
      '  color: #414144 !important;' +
      '}' +
      '@media screen and (max-width: ' +
      MOBILE_MAX_WIDTH +
      'px) {' +
      accountSel +
      ' > .main {' +
      '  padding-right: 0 !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' {' +
      '  flex: none !important;' +
      '  width: 100% !important;' +
      '  max-width: none !important;' +
      '  position: relative !important;' +
      '  top: auto !important;' +
      '  margin: 15px 0 0 0 !important;' +
      '  padding: 0 !important;' +
      '  background: #E5EFE0 !important;' +
      '  border-radius: 8px !important;' +
      '  overflow: hidden !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle {' +
      '  width: 100% !important;' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: space-between !important;' +
      '  gap: 12px !important;' +
      '  padding: 14px 16px !important;' +
      '  border: 0 !important;' +
      '  background: transparent !important;' +
      '  cursor: pointer !important;' +
      '  text-align: left !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-left {' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  gap: 10px !important;' +
      '  min-width: 0 !important;' +
      '  flex: 1 1 auto !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-subscription {' +
      '  flex: 0 0 24px !important;' +
      '  width: 24px !important;' +
      '  height: 24px !important;' +
      '  color: #257A57 !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-subscription svg {' +
      '  width: 24px !important;' +
      '  height: 24px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-label {' +
      '  margin: 0 !important;' +
      '  font-size: 14px !important;' +
      '  line-height: 1.3 !important;' +
      '  font-weight: 700 !important;' +
      '  color: #17171A !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-icon {' +
      '  flex: 0 0 20px !important;' +
      '  width: 20px !important;' +
      '  height: 20px !important;' +
      '  color: #17171A !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '  transition: transform 0.2s ease !important;' +
      '  animation: at-bcc-chevron-bounce 1.5s ease-in-out infinite !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-icon svg {' +
      '  width: 16px !important;' +
      '  height: 16px !important;' +
      '  display: block !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      '.at-bcc--open .at-bcc__toggle-icon {' +
      '  animation: none !important;' +
      '  transform: rotate(180deg) !important;' +
      '}' +
      '@keyframes at-bcc-chevron-bounce {' +
      '  0%, 100% { transform: translateY(0); }' +
      '  50% { transform: translateY(3px); }' +
      '}' +
      '@media (prefers-reduced-motion: reduce) {' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__toggle-icon {' +
      '  animation: none !important;' +
      '}' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__body {' +
      '  padding: 0 16px 16px 16px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__body[hidden] {' +
      '  display: none !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__title {' +
      '  display: none !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__list {' +
      '  display: flex !important;' +
      '  flex-direction: column !important;' +
      '  gap: 14px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__item {' +
      '  flex-direction: row !important;' +
      '  align-items: flex-start !important;' +
      '  gap: 10px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__icon {' +
      '  flex: 0 0 32px !important;' +
      '  width: 32px !important;' +
      '  height: 32px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__icon--24 svg {' +
      '  width: 16px !important;' +
      '  height: 16px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__icon--32 svg {' +
      '  width: 18px !important;' +
      '  height: 18px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__name {' +
      '  font-size: 12px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      '.' +
      MOBILE_CLASS +
      ' .at-bcc__desc {' +
      '  font-size: 11px !important;' +
      '  line-height: 1.35 !important;' +
      '}' +
      '[data-testid="StepHeader"] div[class*="_StepHeader__sectionTitle"] {' +
      '  padding-top: 0 !important;' +
      '}' +
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

  function iconEntregaAutomaticaSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="m15.36 14.2-.71-.7-1.15 1.14-.64-.65-.71.71 1.35 1.35z"/>' +
      '<path d="M10.5 7.84h-1v1H7v9h10v-9h-2.5v-1h-1v1h-3zm5.5 9H8v-4h8zm-2.5-7v1h1v-1H16v2H8v-2h1.5v1h1v-1z"/>' +
      '<path d="M14 2.98V4c3.55.51 7 2.6 7 8.86 0 7.43-4.89 9-9 9-4.1 0-9-1.57-9-9 0-5.6 2.76-7.86 5.88-8.65L7.86 6.04l1.4-.46 1.2-2.18L7.96 2l-1.3.42 1.64.91C4.21 4.5 2 7.77 2 12.85c0 6.45 3.55 10 10 10s10-3.55 10-10c0-5.75-2.82-9.19-8-9.87"/>' +
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

  function iconPauseSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M6.77 16.94 18.41 5.29c.38-.37.59-.86.59-1.35s-.2-.98-.59-1.35a1.85 1.85 0 0 0-2.7 0L4.06 14.23l-1.03 3.1.65.64zm-1.83-2.17L16.4 3.3a.87.87 0 0 1 1.3 0q.29.3.29.65t-.3.65L6.24 16.06l-1.94.65zM21 20H3v1h18z"/>' +
      '</svg>'
    );
  }

  function iconBeneficiosExclusivosSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' +
      '<path d="M12.5 18.7 10.2 17H5.8l-2.3 1.7L2.1 27H1v1h14v-1h-1.1zM3.1 27l1.4-7.7L6.2 18h3.7l1.7 1.3L13 27zM29.5 27v-4c0-3.9-3-6-6-6s-6 2.1-6 6v4H16v1h15v-1zm-1 0H27v-5h-1v5h-2v-6h-1v6h-2v-5h-1v5h-1.5v-4c0-3.4 2.6-5 5-5s5 1.6 5 5zM1.8 14.7 8 12.9v-2.3c1.7-.4 4.7-1.1 8-1.1s6.3.7 8 1.1v2.3l6.2 1.9-1.2-4.2 1.3-2.4L26 6.9V5.2l-.3-.2C25.5 5 22 3.5 16 3.5S6.4 5 6.3 5l-.3.2V7L1.7 8.2 3 10.6zM26 11.2V8l2.9.8-.9 1.6.8 2.8-3.8-1.1v-1.3c.2.1 1 .4 1 .4M7 5.8c1-.3 4.2-1.3 9-1.3s8 1 9 1.3v4c-1.4-.4-5-1.3-9-1.3s-7.6.9-9 1.3zM6 8v3.2s.8-.3 1-.3v1.3l-3.8 1.1.8-2.9-.9-1.6z"/>' +
      '</svg>'
    );
  }

  function iconChevronSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function iconSubscriptionSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' +
      '<path d="M19 4.8v1.02c5.18 1 8 4.7 8 10.72 0 7.1-3.9 11-11 11s-11-3.9-11-11c0-5.8 2.6-9.45 7.42-10.6l-1.36 2.44 1.4-.46L14 5.15l-3.05-1.69-1.3.42 2.15 1.2C6.8 6.44 4 10.44 4 16.53c0 7.63 4.37 12 12 12s12-4.37 12-12c0-6.56-3.24-10.7-9-11.74Z"/>' +
      '<path d="M19.15 16.69 17 18.83l-1.15-1.14-.7.7L17 20.25l2.85-2.86-.7-.7Z"/>' +
      '<path d="M13 10.54v1h-3v11h12v-11h-3v-1h-1v1h-4v-1h-1Zm8 11H11v-6h10v6Zm-3-9v1h1v-1h2v2H11v-2h2v1h1v-1h4Z"/>' +
      '</svg>'
    );
  }

  function getBenefitItems() {
    return [
      {
        name: 'Entrega automática',
        desc: 'Receba seus cafés favoritos sempre que precisar.',
        icon: iconEntregaAutomaticaSvg(),
        iconSize: '24',
      },
      {
        name: 'Flexibilidade',
        desc: 'Altere cafés, frequência ou endereço quando quiser.',
        icon: iconFlexibilidadeSvg(),
        iconSize: '32',
      },
      {
        name: 'Pausar quando quiser',
        desc: 'Pausa fácil e sem burocracia da sua assinatura.',
        icon: iconPauseSvg(),
        iconSize: '24',
      },
      {
        name: 'Benefícios exclusivos',
        desc: 'Acesso a ofertas e experiências exclusivas para assinantes.',
        icon: iconBeneficiosExclusivosSvg(),
        iconSize: '32',
      },
    ];
  }

  function buildBenefitsListHtml() {
    const items = getBenefitItems();
    let html = '<ul class="at-bcc__list">';
    let i = 0;

    while (i < items.length) {
      html +=
        '<li class="at-bcc__item">' +
        '<span class="at-bcc__icon at-bcc__icon--' +
        items[i].iconSize +
        '">' +
        items[i].icon +
        '</span>' +
        '<div class="at-bcc__content">' +
        '<p class="at-bcc__name">' +
        items[i].name +
        '</p>' +
        '<p class="at-bcc__desc">' +
        items[i].desc +
        '</p>' +
        '</div>' +
        '</li>';
      i++;
    }

    html += '</ul>';
    return html;
  }

  function buildDesktopPanelHtml() {
    return (
      '<h3 class="at-bcc__title">Benefícios da Assinatura</h3>' +
      buildBenefitsListHtml()
    );
  }

  function buildMobilePanelHtml() {
    return (
      '<button type="button" class="at-bcc__toggle" data-at-bcc-toggle aria-expanded="false" aria-controls="at-bcc-panel-body">' +
      '<span class="at-bcc__toggle-left">' +
      '<span class="at-bcc__toggle-subscription">' +
      iconSubscriptionSvg() +
      '</span>' +
      '<span class="at-bcc__toggle-label">Benefícios da Assinatura</span>' +
      '</span>' +
      '<span class="at-bcc__toggle-icon">' +
      iconChevronSvg() +
      '</span>' +
      '</button>' +
      '<div class="at-bcc__body" id="at-bcc-panel-body" data-at-bcc-body hidden>' +
      buildBenefitsListHtml() +
      '</div>'
    );
  }

  function bindMobileToggle(column) {
    if (!column || !column.classList.contains(MOBILE_CLASS)) {
      return;
    }

    const toggle = column.querySelector('[data-at-bcc-toggle]');
    const body = column.querySelector('[data-at-bcc-body]');
    if (!toggle || !body) {
      return;
    }

    if (toggle.hasAttribute('data-at-bcc-toggle-bound')) {
      return;
    }

    toggle.setAttribute('data-at-bcc-toggle-bound', '1');
    toggle.addEventListener('click', function () {
      const isOpen = column.classList.contains('at-bcc--open');

      if (isOpen) {
        column.classList.remove('at-bcc--open');
        toggle.setAttribute('aria-expanded', 'false');
        body.setAttribute('hidden', '');
        sendGAEvent('click', TRACKING_PREFIX + '_mobile_fechar');
        return;
      }

      column.classList.add('at-bcc--open');
      toggle.setAttribute('aria-expanded', 'true');
      body.removeAttribute('hidden');
      sendGAEvent('click', TRACKING_PREFIX + '_mobile_abrir');
    });
  }

  function syncColumnContent(column) {
    if (!column) {
      return;
    }

    if (isMobileLayout()) {
      if (!column.hasAttribute('data-at-bcc-mobile-content')) {
        column.innerHTML = buildMobilePanelHtml();
        column.setAttribute('data-at-bcc-mobile-content', '1');
        column.removeAttribute('data-at-bcc-desktop-content');
        column.classList.remove('at-bcc--open');
      }
      bindMobileToggle(column);
      return;
    }

    column.classList.remove('at-bcc--open');

    if (!column.hasAttribute('data-at-bcc-desktop-content')) {
      column.innerHTML = buildDesktopPanelHtml();
      column.setAttribute('data-at-bcc-desktop-content', '1');
      column.removeAttribute('data-at-bcc-mobile-content');
    }
  }

  function clearAccountMark(account) {
    if (!account) {
      return;
    }
    account.removeAttribute(ACCOUNT_ATTR);
  }

  function removeColumn() {
    const existing = document.getElementById(COLUMN_ID);
    const account = existing
      ? existing.closest('.account')
      : document.querySelector('.account[' + ACCOUNT_ATTR + '="1"]');

    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    clearAccountMark(account);
  }

  function insertDesktopColumn(column, account, main) {
    column.classList.remove(MOBILE_CLASS);
    column.classList.remove('at-bcc--open');
    account.setAttribute(ACCOUNT_ATTR, '1');
    syncColumnContent(column);

    if (column.parentNode !== account) {
      if (main && main.nextSibling) {
        account.insertBefore(column, main.nextSibling);
      } else {
        account.appendChild(column);
      }
      return;
    }

    if (main && main.nextSibling && column !== main.nextSibling) {
      account.insertBefore(column, main.nextSibling);
    }
  }

  function insertMobileColumn(column, account, main) {
    column.classList.add(MOBILE_CLASS);
    account.removeAttribute(ACCOUNT_ATTR);
    syncColumnContent(column);

    const anchor = getMobileInsertAnchor(main);
    if (!anchor) {
      return false;
    }

    return insertNodeAfter(anchor, column);
  }

  function repositionColumn(column, account) {
    const main = getMainElement(account);
    if (!main) {
      return;
    }

    if (isMobileLayout()) {
      insertMobileColumn(column, account, main);
      return;
    }

    insertDesktopColumn(column, account, main);
  }

  function insertThirdColumn(account) {
    if (!account) {
      return null;
    }

    const existing = document.getElementById(COLUMN_ID);
    if (existing) {
      repositionColumn(existing, account);
      return existing;
    }

    const main = getMainElement(account);
    if (isMobileLayout() && !getMobileInsertAnchor(main)) {
      return null;
    }

    const column = document.createElement('aside');
    column.id = COLUMN_ID;
    column.className = 'at-bcc-column';
    column.setAttribute('data-at-beneficios-checkout', 'C');
    column.setAttribute('aria-label', 'Benefícios da Assinatura');

    repositionColumn(column, account);
    return column;
  }

  function applyVariantC() {
    if (!isStandingOrdersPage() || !isCreateCheckoutFlow()) {
      removeColumn();
      return;
    }

    const account = getAccountContainer();
    if (!account) {
      return;
    }

    injectStyles();
    const column = insertThirdColumn(account);
    if (!column) {
      return;
    }

    trackViewOnce();
  }

  function trackViewOnce() {
    if (viewTracked) {
      return;
    }
    if (!document.getElementById(COLUMN_ID)) {
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
      applyVariantC();
    } finally {
      isProcessing = false;
    }
  }

  function onHashChange() {
    viewTracked = false;
    debounce(run, 80);
  }

  function init() {
    debounce(run, 0);

    if (!window._atBeneficiosCheckoutObserverC) {
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
              (target.id === COLUMN_ID ||
                target.id === STYLE_ID ||
                (target.closest && target.closest('#' + COLUMN_ID)))
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
      window._atBeneficiosCheckoutObserverC = observer;
    }

    window.addEventListener('hashchange', onHashChange);

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(function () {
        debounce(run, 0);
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
