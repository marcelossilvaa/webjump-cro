(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'at-busca-fake-bar-style';
  const DATA_ATTR = 'data-at-busca-fake-bar-added';
  const ACTIVE_ATTR = 'data-at-busca-fake-bar-active';
  const MOBILE_BREAKPOINT = 1024;

  const SEARCH_BTN_SELECTOR = '[data-ref="searchBtn"], [data-action="search"]';
  const HEADER_CONTAINER_SELECTOR = '.cb-header-navigation__container';

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'busca-fake-bar',
      local_event_action: action,
      local_event_label: label,
    });
  }

  function getStyles() {
    return [
      '@media (max-width: ' + (MOBILE_BREAKPOINT - 1) + 'px) {',
      '  [' + ACTIVE_ATTR + '] ' + SEARCH_BTN_SELECTOR + ' {',
      '    display: none !important;',
      '  }',
      '}',
      '.at-busca-fake-bar {',
      '  display: block;',
      '  width: 100%;',
      '  text-align: left;',
      '  padding: 10px 16px;',
      '  margin: 0 0 3px;',
      '  border: none;',
      '  border-top: 1px solid #E5E0DB;',
      '  border-bottom: 1px solid #E5E0DB;',
      '  background-color: #FFFFFF;',
      '  color: #8A8A8A;',
      '  font-size: 14px;',
      '  font-family: NespressoLucas, Helvetica, sans-serif;',
      '  line-height: 1.4;',
      '  cursor: pointer;',
      '  -webkit-appearance: none;',
      '  appearance: none;',
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

  function openRealSearch() {
    const btn = document.querySelector(SEARCH_BTN_SELECTOR);
    if (btn) {
      btn.click();
    }
    sendGAEvent('click', 'busca_fake_bar');
  }

  function createFakeBar() {
    const bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'at-busca-fake-bar';
    bar.textContent = 'Buscar';
    bar.setAttribute('aria-label', 'Buscar');
    bar.addEventListener('click', openRealSearch);
    return bar;
  }

  function addFakeBar() {
    const headerContainer = document.querySelector(HEADER_CONTAINER_SELECTOR);
    if (!headerContainer || !headerContainer.parentNode) return false;

    if (headerContainer.parentNode.querySelector('[' + DATA_ATTR + ']')) return true;

    const bar = createFakeBar();
    bar.setAttribute(DATA_ATTR, 'true');
    headerContainer.parentNode.insertBefore(bar, headerContainer.nextSibling);
    document.documentElement.setAttribute(ACTIVE_ATTR, 'true');

    sendGAEvent('view', 'busca_fake_bar');

    return true;
  }

  function run() {
    if (isProcessing) return;
    if (!isMobile()) return;
    isProcessing = true;
    try {
      addFakeBar();
    } finally {
      isProcessing = false;
    }
  }

  function setupObserver() {
    if (window._buscaFakeBarObserver) return;

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

    window._buscaFakeBarObserver = observer;
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
