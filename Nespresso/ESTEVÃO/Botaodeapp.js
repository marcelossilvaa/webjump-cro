(function () {
  'use strict';

  var isProcessing = false;
  var debounceTimer = null;
  var STYLE_ID = 'at-baixar-app-menu-style';
  var DATA_ATTR = 'data-baixar-app-added';
  var APP_LINK = 'https://nespresso.go.link/?adj_t=1nca0syu';
  var MOBILE_BREAKPOINT = 1024;

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
      '/* Container do item de app */',
      '[data-baixar-app-added] {',
      '  background: linear-gradient(135deg, #E8D4B8 0%, #D4B896 100%) !important;',
      '  border-radius: 8px !important;',
      '  margin: 8px 8px !important;',
      '  box-shadow: 0 3px 10px rgba(161, 138, 104, 0.25) !important;',
      '  overflow: hidden !important;',
      '}',
      '',
      '[data-baixar-app-added] .HeaderNavigationBarItem__anchor,',
      '[data-baixar-app-added] .HeaderNavigationBarItem__element {',
      '  height: auto !important;',
      '  min-height: 50px !important;',
      '}',
      '',
      '[data-baixar-app-added] .HeaderNavigationBarItem__anchor {',
      '  padding: 10px 8px !important;',
      '  display: block !important;',
      '}',
      '',
      '[data-baixar-app-added] .HeaderNavigationBarItem__element {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 8px !important;',
      '}',
      '',
      '/* Icone do app */',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-icon {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  width: 32px !important;',
      '  height: 32px !important;',
      '  background: #fff !important;',
      '  border-radius: 8px !important;',
      '  flex-shrink: 0 !important;',
      '  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;',
      '}',
      '',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-icon svg {',
      '  width: 20px !important;',
      '  height: 20px !important;',
      '  fill: #5C4A32 !important;',
      '}',
      '',
      '/* Container de texto */',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-text {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  justify-content: center !important;',
      '  flex: 1 !important;',
      '  min-width: 0 !important;',
      '  gap: 2px !important;',
      '}',
      '',
      '/* Titulo principal */',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-title {',
      '  font-size: 13px !important;',
      '  font-family: NespressoLucas, Helvetica, sans-serif !important;',
      '  color: #3D2E1F !important;',
      '  font-weight: 700 !important;',
      '  line-height: 1.2 !important;',
      '  text-align: left !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  white-space: nowrap !important;',
      '}',
      '',
      '/* Cupom em destaque */',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-coupon {',
      '  display: inline-block !important;',
      '  font-size: 11px !important;',
      '  font-family: NespressoLucas, Helvetica, sans-serif !important;',
      '  color: #5C4A32 !important;',
      '  font-weight: 600 !important;',
      '  line-height: 1.3 !important;',
      '  text-align: left !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  white-space: nowrap !important;',
      '}',
      '',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-coupon strong {',
      '  background: #5C4A32 !important;',
      '  color: #fff !important;',
      '  padding: 1px 4px !important;',
      '  border-radius: 3px !important;',
      '  font-weight: 700 !important;',
      '  font-size: 9px !important;',
      '  letter-spacing: 0.3px !important;',
      '}',
      '',
      '/* Seta indicadora */',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-arrow {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  width: 18px !important;',
      '  height: 18px !important;',
      '  flex-shrink: 0 !important;',
      '}',
      '',
      '[data-baixar-app-added] .HeaderNavigationBarItem__app-arrow svg {',
      '  width: 16px !important;',
      '  height: 16px !important;',
      '  fill: #5C4A32 !important;',
      '}',
      '',
      '/* Esconder em desktop */',
      '@media (min-width: ' + MOBILE_BREAKPOINT + 'px) {',
      '  [data-baixar-app-added] {',
      '    display: none !important;',
      '  }',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function createAppMenuItem() {
    var li = document.createElement('li');
    li.className = 'HeaderNavigationBarItem';
    li.setAttribute(DATA_ATTR, 'true');

    var anchor = document.createElement('a');
    anchor.href = APP_LINK;
    anchor.className = 'AccessibleLink HeaderNavigationBarItem__anchor';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';

    var elementDiv = document.createElement('div');
    elementDiv.className = 'HeaderNavigationBarItem__element';

    // Icone de celular/app
    var iconSpan = document.createElement('span');
    iconSpan.className = 'HeaderNavigationBarItem__app-icon';
    iconSpan.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 1h-9C6.88 1 5 1 5 3v18c0 2 1.88 2 2.5 2h9c.62 0 2.5 0 2.5-2V3c0-2-1.88-2-2.5-2M18 21c0 .47 0 1-1.5 1h-9C6 22 6 21.47 6 21V3c0-.47 0-1 1.5-1h9C18 2 18 2.53 18 3z"/><path d="M14 3h-4v1h4zM12.5 20h-1v1h1z"/></svg>';

    // Container do texto
    var textContainer = document.createElement('div');
    textContainer.className = 'HeaderNavigationBarItem__app-text';

    // Titulo principal
    var titleDiv = document.createElement('div');
    titleDiv.className = 'HeaderNavigationBarItem__app-title';
    titleDiv.textContent = 'Baixe o nosso app e ganhe 10% OFF';

    // Linha do cupom
    var couponDiv = document.createElement('div');
    couponDiv.className = 'HeaderNavigationBarItem__app-coupon';
    couponDiv.innerHTML = 'Use o cupom <strong>NOVOAPP10</strong> na primeira compra';

    textContainer.appendChild(titleDiv);
    textContainer.appendChild(couponDiv);

    // Seta indicadora
    var arrowSpan = document.createElement('span');
    arrowSpan.className = 'HeaderNavigationBarItem__app-arrow';
    arrowSpan.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>';

    elementDiv.appendChild(iconSpan);
    elementDiv.appendChild(textContainer);
    elementDiv.appendChild(arrowSpan);
    anchor.appendChild(elementDiv);
    li.appendChild(anchor);

    // Tracking de clique
    anchor.addEventListener('click', function () {
      sendGAEvent('click', 'menu_baixar_app');
    });

    return li;
  }

  function addAppMenuItem() {
    var menu = document.querySelector('.HeaderNavigationBar__menu');
    if (!menu) return false;

    // Verifica se ja foi adicionado
    if (menu.querySelector('[' + DATA_ATTR + ']')) return true;

    var menuItem = createAppMenuItem();
    menu.appendChild(menuItem);

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

    var observer = new MutationObserver(function () {
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
