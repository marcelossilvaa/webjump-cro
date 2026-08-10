(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'at-personalizacao-fora-mg-style';
  const DATA_ATTR = 'data-at-tag-entrega-brasil-added';
  const PRODUCT_TITLE_ROW_SELECTOR = '.productDetails__info__containerCard .product-info-name';
  const SHIPPING_WARNING_SELECTOR = '.productShippingMethods__warning';
  const SHIPPING_WARNING_TEXT = 'Enviamos para o endereço informado no seu CEP. Confira abaixo o prazo de entrega para a sua região.';
  const EXCLUSIVE_PICKUP_SELECTOR = '.controlledAdditionalImage-content';
  const BREADCRUMB_SELECTOR = '.breadCrumb';
  const BLOCKED_BREADCRUMB_TERMS = ['Vacinas', 'Serviços'];
  const BODY_BLOCKED_ATTR = 'data-at-fora-mg-bloqueado';

  function getStyles() {
    return [
      'body:not(:has(' + EXCLUSIVE_PICKUP_SELECTOR + ')):not([' + BODY_BLOCKED_ATTR + ']) .productShippingMethods__item.pickup {',
      '  display: none !important;',
      '}',
      'body:not(:has(' + EXCLUSIVE_PICKUP_SELECTOR + ')):not([' + BODY_BLOCKED_ATTR + ']) .productShippingMethods__item:not(.pickup) {',
      '  border: 1px solid #003A74;',
      '  border-radius: 8px;',
      '  padding: 12px;',
      '}',
      '.at-tag-entrega-brasil {',
      '  align-items: center;',
      '  background-color: #EAF1F7;',
      '  border-radius: 6px;',
      '  color: #003A74;',
      '  display: inline-flex;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  gap: 8px;',
      '  margin-bottom: 10px;',
      '  padding: 6px 12px;',
      '}',
      '.at-tag-entrega-brasil i {',
      '  font-size: 18px;',
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

  function isVendaExclusivaRetirada() {
    return !!document.querySelector(EXCLUSIVE_PICKUP_SELECTOR);
  }

  function isBreadcrumbBloqueado() {
    const breadcrumb = document.querySelector(BREADCRUMB_SELECTOR);
    if (!breadcrumb) return false;

    const texto = breadcrumb.textContent;
    return BLOCKED_BREADCRUMB_TERMS.some(function (termo) {
      return texto.indexOf(termo) !== -1;
    });
  }

  function removeTagEntregaBrasil() {
    const tag = document.querySelector('.at-tag-entrega-brasil');
    if (tag) tag.remove();
  }

  function addTagEntregaBrasil() {
    const titleRow = document.querySelector(PRODUCT_TITLE_ROW_SELECTOR);
    if (!titleRow) return false;
    if (titleRow.parentElement.querySelector('.at-tag-entrega-brasil')) return true;

    const tag = document.createElement('div');
    tag.className = 'at-tag-entrega-brasil';
    tag.setAttribute(DATA_ATTR, 'true');
    tag.innerHTML = '<i class="newicon-truck-araujo"></i><span>Entrega para todo o Brasil</span>';

    titleRow.insertAdjacentElement('beforebegin', tag);

    return true;
  }

  function updateShippingWarningText() {
    const warning = document.querySelector(SHIPPING_WARNING_SELECTOR);
    if (!warning) return false;
    if (warning.textContent.trim() !== SHIPPING_WARNING_TEXT) {
      warning.textContent = SHIPPING_WARNING_TEXT;
    }
    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      if (isVendaExclusivaRetirada() || isBreadcrumbBloqueado()) {
        document.body.setAttribute(BODY_BLOCKED_ATTR, 'true');
        removeTagEntregaBrasil();
        return;
      }

      document.body.removeAttribute(BODY_BLOCKED_ATTR);
      addTagEntregaBrasil();
      updateShippingWarningText();
    } finally {
      isProcessing = false;
    }
  }

  function setupObserver() {
    if (window._tagEntregaBrasilObserver) return;

    const observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._tagEntregaBrasilObserver = observer;
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
