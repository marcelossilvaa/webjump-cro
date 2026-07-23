(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const STYLE_ID = 'at-baixar-app-menu-style';
  const DATA_ATTR = 'data-baixar-app-added';
  const APP_LINK = 'https://nespresso.go.link/?adj_t=1nca0syu';
  const MENU_LIST_SELECTOR = '#mobile-nav-panel .cb-header-navigation__nav-list';
  const ANCHOR_SELECTOR = '[data-qa="menu_profissional"]';
  const MOBILE_BREAKPOINT = 1024;

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'menu-baixar-app',
      local_event_action: action,
      local_event_label: label,
    });
  }

  function getStyles() {
    return [
      '[data-baixar-app-added] .baixar-app-card {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  background: linear-gradient(135deg, #ECD9BC 0%, #C7A06B 100%);',
      '  border: 1px solid #B79768;',
      '  border-radius: 14px;',
      '  padding: 10px;',
      '  margin: 8px 0;',
      '  box-shadow: 0 2px 4px rgba(59, 42, 26, 0.15);',
      '  text-decoration: none;',
      '  font-family: NespressoLucas, Helvetica, sans-serif;',
      '}',
      '[data-baixar-app-added] .baixar-app-icon-wrapper {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 40px;',
      '  height: 40px;',
      '  background-color: #F7EFE2;',
      '  border-radius: 10px;',
      '  flex-shrink: 0;',
      '}',
      '[data-baixar-app-added] .baixar-app-icon {',
      '  width: 22px;',
      '  height: 22px;',
      '}',
      '[data-baixar-app-added] .baixar-app-text {',
      '  display: flex;',
      '  flex-direction: column;',
      '  flex: 1;',
      '  min-width: 0;',
      '}',
      '[data-baixar-app-added] .baixar-app-title {',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  color: #3B2A1A;',
      '  line-height: 1.3;',
      '  text-align: left;',
      '  white-space: nowrap;',
      '}',
      '[data-baixar-app-added] .baixar-app-subtitle {',
      '  display: flex;',
      '  align-items: center;',
      '  flex-wrap: nowrap;',
      '  gap: 4px;',
      '  font-size: 11.5px;',
      '  font-weight: 400;',
      '  color: #4A3A28;',
      '  margin-top: 4px;',
      '  text-align: left;',
      '  white-space: nowrap;',
      '}',
      '[data-baixar-app-added] .baixar-app-coupon {',
      '  background-color: #3B2A1A;',
      '  color: #FFFFFF;',
      '  font-weight: 700;',
      '  font-size: 11px;',
      '  padding: 2px 8px;',
      '  border-radius: 6px;',
      '  display: inline-block;',
      '}',
      '[data-baixar-app-added] .baixar-app-chevron {',
      '  width: 18px;',
      '  height: 18px;',
      '  flex-shrink: 0;',
      '  margin-left: auto;',
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

  function createAppMenuItem() {
    const li = document.createElement('li');
    li.className = 'cb-header-navigation__nav-item cb-header-navigation__nav-item--is-utility';
    li.setAttribute('role', 'none');
    li.setAttribute(DATA_ATTR, 'true');

    const anchor = document.createElement('a');
    anchor.href = APP_LINK;
    anchor.className = 'baixar-app-card';
    anchor.setAttribute('role', 'menuitem');
    anchor.setAttribute('data-qa', 'menu_baixar_app');
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';

    // Icone de celular/app dentro de um cartao arredondado, como na referencia
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'baixar-app-icon-wrapper';
    iconWrapper.innerHTML =
      '<svg class="baixar-app-icon" viewBox="0 0 24 24" fill="#3B2A1A" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M16.5 1h-9C6.88 1 5 1 5 3v18c0 2 1.88 2 2.5 2h9c.62 0 2.5 0 2.5-2V3c0-2-1.88-2-2.5-2M18 21c0 .47 0 1-1.5 1h-9C6 22 6 21.47 6 21V3c0-.47 0-1 1.5-1h9C18 2 18 2.53 18 3z"/>'
      + '<path d="M14 3h-4v1h4zM12.5 20h-1v1h1z"/>'
      + '</svg>';

    // Container do titulo e do cupom
    const textContainer = document.createElement('span');
    textContainer.className = 'baixar-app-text';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'baixar-app-title';
    titleSpan.textContent = 'Baixe o nosso app e ganhe 10% OFF';

    const subtitleSpan = document.createElement('span');
    subtitleSpan.className = 'baixar-app-subtitle';
    subtitleSpan.innerHTML = 'Use o cupom <span class="baixar-app-coupon">NOVOAPP10</span> na primeira compra';

    textContainer.appendChild(titleSpan);
    textContainer.appendChild(subtitleSpan);

    const chevronWrapper = document.createElement('span');
    chevronWrapper.innerHTML =
      '<svg class="baixar-app-chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M9 6l6 6-6 6" stroke="#3B2A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';
    const chevron = chevronWrapper.firstChild;

    anchor.appendChild(iconWrapper);
    anchor.appendChild(textContainer);
    anchor.appendChild(chevron);
    li.appendChild(anchor);

    // Tracking de clique
    anchor.addEventListener('click', function () {
      sendGAEvent('click', 'menu_baixar_app');
    });

    return li;
  }

  function addAppMenuItem() {
    const menuList = document.querySelector(MENU_LIST_SELECTOR);
    if (!menuList) return false;

    // Verifica se ja foi adicionado
    if (menuList.querySelector('[' + DATA_ATTR + ']')) return true;

    const menuItem = createAppMenuItem();
    const anchorLink = menuList.querySelector(ANCHOR_SELECTOR);
    const anchorItem = anchorLink ? anchorLink.closest('li') : null;

    if (anchorItem && anchorItem.parentNode) {
      anchorItem.parentNode.insertBefore(menuItem, anchorItem.nextSibling);
    } else {
      menuList.appendChild(menuItem);
    }

    // Tracking de visualizacao
    sendGAEvent('view', 'menu_baixar_app');

    return true;
  }

  function run() {
    if (isProcessing) return;
    if (!isMobile()) return;
    isProcessing = true;
    try {
      addAppMenuItem();
    } finally {
      isProcessing = false;
    }
  }

  function setupObserver() {
    if (window._baixarAppMenuObserver) return;

    const observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._baixarAppMenuObserver = observer;
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
