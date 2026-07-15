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
      '}' +
      '#' +
      COLUMN_ID +
      ' {' +
      '  box-sizing: border-box !important;' +
      '  flex: 0 0 280px !important;' +
      '  width: 280px !important;' +
      '  max-width: 280px !important;' +
      '  margin: 0 0 24px 0 !important;' +
      '  padding: 20px 16px !important;' +
      '  background: #F5F5F5 !important;' +
      '  border-radius: 8px !important;' +
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
      '  margin: 0 0 16px 0 !important;' +
      '  font-size: 16px !important;' +
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
      '  gap: 16px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__item {' +
      '  display: flex !important;' +
      '  align-items: flex-start !important;' +
      '  gap: 12px !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__icon {' +
      '  flex: 0 0 36px !important;' +
      '  width: 36px !important;' +
      '  height: 36px !important;' +
      '  border-radius: 50% !important;' +
      '  background: #257A57 !important;' +
      '  color: #FFFFFF !important;' +
      '  display: inline-flex !important;' +
      '  align-items: center !important;' +
      '  justify-content: center !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' .at-bcc__icon svg {' +
      '  width: 18px !important;' +
      '  height: 18px !important;' +
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
      '  margin: 0 0 2px 0 !important;' +
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
      '  line-height: 1.35 !important;' +
      '  font-weight: 400 !important;' +
      '  color: #414144 !important;' +
      '}' +
      '@media screen and (max-width: 993px) {' +
      accountSel +
      ' {' +
      '  flex-wrap: wrap !important;' +
      '}' +
      accountSel +
      ' > .main {' +
      '  flex: 1 1 100% !important;' +
      '}' +
      '#' +
      COLUMN_ID +
      ' {' +
      '  flex: 1 1 100% !important;' +
      '  width: 100% !important;' +
      '  max-width: none !important;' +
      '  position: relative !important;' +
      '  top: auto !important;' +
      '  order: 3 !important;' +
      '  margin: 0 0 20px 0 !important;' +
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

  function iconDeliverySvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M3 8h10.5v8H7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M13.5 10.5H18l2.2 2.8v2.7h-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="7.5" cy="17.2" r="1.6" stroke="currentColor" stroke-width="1.7"/>' +
      '<circle cx="17.2" cy="17.2" r="1.6" stroke="currentColor" stroke-width="1.7"/>' +
      '</svg>'
    );
  }

  function iconFlexSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M7 7h7.5M14.5 7l-2.2-2.2M14.5 7l-2.2 2.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M17 17H9.5M9.5 17l2.2 2.2M9.5 17l2.2-2.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function iconPauseSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.7"/>' +
      '<path d="M10 9.2v5.6M14 9.2v5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  function iconExclusiveSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M4.5 10.2l2.2-5.4h10.6l2.2 5.4-5.3 8.2h-4.4L4.5 10.2z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>' +
      '<path d="M9.2 12.2l1.7 1.7 3.9-3.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function buildPanelHtml() {
    const items = [
      {
        name: 'Entrega automática',
        desc: 'Receba seus cafés favoritos sempre que precisar.',
        icon: iconDeliverySvg(),
      },
      {
        name: 'Flexibilidade',
        desc: 'Altere cafés, frequência ou endereço quando quiser.',
        icon: iconFlexSvg(),
      },
      {
        name: 'Pausar quando quiser',
        desc: 'Pausa fácil e sem burocracia da sua assinatura.',
        icon: iconPauseSvg(),
      },
      {
        name: 'Benefícios exclusivos',
        desc: 'Acesso a ofertas e experiências exclusivas para assinantes.',
        icon: iconExclusiveSvg(),
      },
    ];

    let html =
      '<h3 class="at-bcc__title">Benefícios da Assinatura</h3>' +
      '<ul class="at-bcc__list">';

    let i = 0;
    while (i < items.length) {
      html +=
        '<li class="at-bcc__item">' +
        '<span class="at-bcc__icon">' +
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

  function insertThirdColumn(account) {
    if (!account) {
      return null;
    }

    const existing = document.getElementById(COLUMN_ID);
    if (existing) {
      if (existing.parentNode !== account) {
        account.appendChild(existing);
      }
      account.setAttribute(ACCOUNT_ATTR, '1');
      return existing;
    }

    const column = document.createElement('aside');
    column.id = COLUMN_ID;
    column.className = 'at-bcc-column';
    column.setAttribute('data-at-beneficios-checkout', 'C');
    column.setAttribute('aria-label', 'Benefícios da Assinatura');
    column.innerHTML = buildPanelHtml();

    const main = account.querySelector(':scope > .main') || account.querySelector('.main');
    if (main && main.parentNode === account) {
      if (main.nextSibling) {
        account.insertBefore(column, main.nextSibling);
      } else {
        account.appendChild(column);
      }
    } else {
      account.appendChild(column);
    }

    account.setAttribute(ACCOUNT_ATTR, '1');
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
