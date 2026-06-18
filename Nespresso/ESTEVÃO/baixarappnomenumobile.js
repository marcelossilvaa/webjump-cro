(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const STYLE_ID = 'at-baixar-app-menu-style';
  const DATA_ATTR = 'data-baixar-app-added';
  const APP_LINK = 'https://nespresso.go.link/?adj_t=1nca0syu';

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
      '[data-baixar-app-added] .HeaderNavigationBarItem__anchor,',
      '[data-baixar-app-added] .HeaderNavigationBarItem__element {',
      '  height: auto;',
      '  min-height: 49px;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__element {',
      '  display: flex;',
      '  align-items: center;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-icon {',
      '  display: block;',
      '  width: 25px;',
      '  margin: 0 13px;',
      '  flex-shrink: 0;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-icon svg {',
      '  width: 25px;',
      '  height: 25px;',
      '  fill: #000;',
      '  vertical-align: middle;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-text {',
      '  display: flex;',
      '  flex-direction: column;',
      '  justify-content: center;',
      '  flex: 1;',
      '  min-width: 0;',
      '  align-items: flex-start;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-title,',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-incentive {',
      '  font-size: 11.7px;',
      '  font-family: NespressoLucas, Helvetica, sans-serif;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-title {',
      '  color: #000;',
      '  flex: none;',
      '  font-weight: 700;',
      '  line-height: 1em;',
      '  text-align: left;',
      '  margin: 0;',
      '  padding: 0;',
      '}',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-incentive {',
      '  color: #A18A68;',
      '  display: block;',
      '  font-weight: 600;',
      '  margin: 2px 0 0 0;',
      '  padding: 0;',
      '  line-height: 1.2;',
      '  text-align: left;',
      '  width: 100%;',
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
    li.className = 'HeaderNavigationBarItem';
    li.setAttribute(DATA_ATTR, 'true');

    const anchor = document.createElement('a');
    anchor.href = APP_LINK;
    anchor.className = 'AccessibleLink HeaderNavigationBarItem__anchor';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';

    const elementDiv = document.createElement('div');
    elementDiv.className = 'HeaderNavigationBarItem__element';

    // Icone de celular/app
    const iconSpan = document.createElement('span');
    iconSpan.className = 'HeaderNavigationBarItem__app-icon';
    iconSpan.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 1h-9C6.88 1 5 1 5 3v18c0 2 1.88 2 2.5 2h9c.62 0 2.5 0 2.5-2V3c0-2-1.88-2-2.5-2M18 21c0 .47 0 1-1.5 1h-9C6 22 6 21.47 6 21V3c0-.47 0-1 1.5-1h9C18 2 18 2.53 18 3z"/><path d="M14 3h-4v1h4zM12.5 20h-1v1h1z"/></svg>';

    // Container do titulo e incentivo
    const titleContainer = document.createElement('div');
    titleContainer.className = 'HeaderNavigationBarItem__app-text';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'HeaderNavigationBarItem__app-title';
    titleDiv.textContent = 'Baixe nosso app';

    const incentiveDiv = document.createElement('div');
    incentiveDiv.className = 'HeaderNavigationBarItem__app-incentive';
    incentiveDiv.textContent = '10% OFF na primeira compra no app';

    titleContainer.appendChild(titleDiv);
    titleContainer.appendChild(incentiveDiv);

    elementDiv.appendChild(iconSpan);
    elementDiv.appendChild(titleContainer);
    anchor.appendChild(elementDiv);
    li.appendChild(anchor);

    // Tracking de clique
    anchor.addEventListener('click', function () {
      sendGAEvent('click', 'menu_baixar_app');
    });

    return li;
  }

  function addAppMenuItem() {
    const menu = document.querySelector('.HeaderNavigationBar__menu');
    if (!menu) return false;

    // Verifica se ja foi adicionado
    if (menu.querySelector('[' + DATA_ATTR + ']')) return true;

    const menuItem = createAppMenuItem();
    menu.appendChild(menuItem);

    // Tracking de visualizacao
    sendGAEvent('view', 'menu_baixar_app');

    return true;
  }

  function run() {
    if (isProcessing) return;
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
