(function () {
  'use strict';

  const STYLE_ID = 'at-segunda-secao-beneficios-pdp-style';
  const BAR_ID = 'nespresso-benefits-bar-pdp-second-section';
  const ANCHOR_SELECTOR = 'nb-sku-main-info';

  const BENEFITS_BAR_HTML =
    '<div class="nespresso-benefits-bar nespresso-benefits-bar-mobile" id="' + BAR_ID + '">' +
      '<div class="nespresso-benefits-container">' +
        '<div class="nespresso-benefit-item">' +
          '<span class="nespresso-benefit-icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>' +
          '</span>' +
          '<div class="nespresso-benefit-content">' +
            '<span class="nespresso-benefit-title">Frete grátis</span>' +
            '<span class="nespresso-benefit-subtitle">a partir de 70 cápsulas</span>' +
          '</div>' +
        '</div>' +
        '<div class="nespresso-benefit-item">' +
          '<span class="nespresso-benefit-icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>' +
          '</span>' +
          '<div class="nespresso-benefit-content">' +
            '<span class="nespresso-benefit-title">Parcelamento em até 10x</span>' +
            '<span class="nespresso-benefit-subtitle">parcela mínima de R$50</span>' +
          '</div>' +
        '</div>' +
        '<div class="nespresso-benefit-item">' +
          '<span class="nespresso-benefit-icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>' +
          '</span>' +
          '<div class="nespresso-benefit-content">' +
            '<span class="nespresso-benefit-title">Baixe o APP e ganhe 10% OFF*</span>' +
            '<span class="nespresso-benefit-subtitle">*válido na primeira compra</span>' +
          '</div>' +
        '</div>' +
        '<div class="nespresso-benefit-item">' +
          '<span class="nespresso-benefit-icon">' +
            '<svg class="nespresso-delivery-minicart-message-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M18.5 1.94 6 8.2V13h1V9.3l11 5.5v13.9L7 23.2V22H6v1.8l12.5 6.26L31 23.8V8.19zM29.38 8.5l-4.88 2.44L13.62 5.5l4.88-2.44zM18.5 13.94 7.62 8.5l4.88-2.44 10.88 5.44zM19 28.7V14.81l5-2.5v3.44l1-.5v-3.44l5-2.5v13.88z"></path><path d="M8 17H1v1h7zM11 20H4v1h7zM10 14H3v1h7z"></path></svg>' +
          '</span>' +
          '<div class="nespresso-benefit-content">' +
            '<span class="nespresso-benefit-title">Entrega rápida*</span>' +
            '<a class="nespresso-benefit-subtitle-link" href="https://www.nespresso.com/br/pt/servicos#/entrega/prazos-padrao" target="_blank" rel="noopener noreferrer">Consulte prazos por região</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function getStyles() {
    return [
      '#' + BAR_ID + ' {',
      '  padding: 16px;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefits-container {',
      '  display: grid;',
      '  grid-template-columns: 1fr 1fr;',
      '  row-gap: 16px;',
      '  column-gap: 12px;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-item {',
      '  display: flex;',
      '  align-items: flex-start;',
      '  gap: 10px;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-icon {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex: 0 0 auto;',
      '  width: 20px;',
      '  height: 20px;',
      '  margin-top: 2px;',
      '  color: #000000;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-icon svg {',
      '  width: 20px;',
      '  height: 20px;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-content {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 2px;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-title {',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  color: #000000;',
      '  line-height: 1.3;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-subtitle,',
      '#' + BAR_ID + ' .nespresso-benefit-subtitle-link {',
      '  font-size: 12px;',
      '  font-weight: 400;',
      '  color: #666666;',
      '  line-height: 1.3;',
      '}',
      '#' + BAR_ID + ' .nespresso-benefit-subtitle-link {',
      '  text-decoration: underline;',
      '}',
      '@media (min-width: 992px) {',
      '  #' + BAR_ID + ' .nespresso-benefits-container {',
      '    display: flex;',
      '    flex-direction: row;',
      '    justify-content: center;',
      '    row-gap: 0;',
      '    column-gap: 0;',
      '  }',
      '  #' + BAR_ID + ' .nespresso-benefit-item {',
      '    flex: 0 0 auto;',
      '    align-items: center;',
      '    padding: 0 24px;',
      '    border-right: 1px solid #d6d6d6;',
      '  }',
      '  #' + BAR_ID + ' .nespresso-benefit-item:first-child {',
      '    padding-left: 0;',
      '  }',
      '  #' + BAR_ID + ' .nespresso-benefit-item:last-child {',
      '    border-right: none;',
      '    padding-right: 0;',
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

  function addBenefitsBar() {
    if (document.getElementById(BAR_ID)) return true;

    const anchor = document.querySelector(ANCHOR_SELECTOR);
    if (!anchor) return false;

    anchor.insertAdjacentHTML('afterend', BENEFITS_BAR_HTML);
    return true;
  }

  function setupObserver() {
    if (window._benefitsBarSegundaSecaoObserver) return;

    let debounceTimer = null;
    const observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(addBenefitsBar, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._benefitsBarSegundaSecaoObserver = observer;
  }

  function init() {
    injectStyles();
    addBenefitsBar();
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
