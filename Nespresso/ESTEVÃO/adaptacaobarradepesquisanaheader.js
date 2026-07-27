(function () {
  'use strict';

  const MOBILE_BREAKPOINT = 1024;

  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    return;
  }

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'at-busca-header-styles';
  const DATA_ATTR = 'data-at-busca-header-added';
  const CONTAINER_CLASS = 'at-busca-header-container';
  const INPUT_CLASS = 'at-busca-header-input';
  const ICON_CLASS = 'at-busca-header-icon';

  const TARGET_SELECTOR = '.cb-header-navigation__container';
  const INSERT_POSITION = 'afterend';
  const ORIGINAL_SEARCH_BTN_SELECTOR = '[data-ref="searchBtn"], [data-action="search"]';
  const PLACEHOLDER = 'Encontre seu café favorito';
  const MAX_SEARCH_LENGTH = 100;

  const LEFT_SEARCH_ICON =
    '<svg viewBox="0 0 16 16" stroke="white" stroke-width="1.1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="m6.4 0c3.5 0 6.4 2.9 6.4 6.4 0 1.4-.4 2.7-1.2 3.7l4 4c.4.4.4 1 .1 1.5l-.1.1c-.2.2-.5.3-.8.3s-.6-.1-.8-.3l-4-4c-1 .7-2.3 1.2-3.7 1.2-3.4-.1-6.3-3-6.3-6.5s2.9-6.4 6.4-6.4zm0 2.1c-2.3 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3z"></path>'
    + '</svg>';

  function getStyles() {
    return [
      '[data-ref="searchBtn"], [data-action="search"] {',
      '  display: none !important;',
      '}',
      '.' + CONTAINER_CLASS + ' {',
      '  display: flex;',
      '  align-items: center;',
      '  position: relative;',
      '  width: 100%;',
      '  height: 48px;',
      '  background-color: #FFFFFF;',
      '  padding: 8px 16px;',
      '  box-sizing: border-box;',
      '  font-family: NespressoLucas, Helvetica, sans-serif;',
      '  animation: at-busca-header-slide-down 0.3s ease;',
      '}',
      '@keyframes at-busca-header-slide-down {',
      '  0% { transform: translateY(-12px); opacity: 0; }',
      '  100% { transform: translateY(0); opacity: 1; }',
      '}',
      '.' + INPUT_CLASS + ' {',
      '  flex: 1;',
      '  padding: 8px 10px 8px 36px;',
      '  font-size: 16px;',
      '  border: 1px solid #cdcdcd;',
      '  border-radius: 4px;',
      '  outline: none;',
      '  background-color: #FFFFFF;',
      '  min-width: 0;',
      '  color: #333333;',
      '  cursor: pointer;',
      '}',
      '.' + INPUT_CLASS + ':focus {',
      '  border-color: #3c2a1e;',
      '  box-shadow: 0 0 3px #6e5544;',
      '}',
      '.' + ICON_CLASS + ' {',
      '  position: absolute;',
      '  left: 26px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 16px;',
      '  height: 16px;',
      '  z-index: 1;',
      '  pointer-events: none;',
      '}',
      '@media screen and (min-width: ' + MOBILE_BREAKPOINT + 'px) {',
      '  .' + CONTAINER_CLASS + ' {',
      '    display: none !important;',
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

  function findElementWithRetry(selector, maxAttempts, delay) {
    return new Promise(function (resolve, reject) {
      let attempts = 0;

      function tryFind() {
        attempts++;
        const element = document.querySelector(selector);

        if (element) {
          resolve(element);
        } else if (attempts >= maxAttempts) {
          reject(new Error('Elemento nao encontrado apos ' + maxAttempts + ' tentativas: ' + selector));
        } else {
          setTimeout(tryFind, delay);
        }
      }

      tryFind();
    });
  }

  function triggerOriginalSearch() {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'user engagement',
      local_event_action: 'busca_aberta',
      local_event_label: 'click_search',
    });

    findElementWithRetry(ORIGINAL_SEARCH_BTN_SELECTOR, 10, 300)
      .then(function (originalButton) {
        originalButton.click();
      })
      .catch(function (error) {
        console.error('Erro: botao de busca original nao encontrado apos multiplas tentativas', error);
      });
  }

  function createSearchComponent() {
    const container = document.createElement('div');
    const input = document.createElement('input');
    const leftIcon = document.createElement('div');

    container.className = CONTAINER_CLASS;
    container.setAttribute(DATA_ATTR, 'true');
    input.className = INPUT_CLASS;
    leftIcon.className = ICON_CLASS;

    input.type = 'text';
    input.placeholder = PLACEHOLDER;
    input.setAttribute('aria-label', 'Campo de pesquisa Nespresso');
    input.setAttribute('maxlength', String(MAX_SEARCH_LENGTH));
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('readonly', 'readonly');

    input.addEventListener('click', function (event) {
      event.preventDefault();
      triggerOriginalSearch();
    });

    leftIcon.innerHTML = LEFT_SEARCH_ICON;

    container.appendChild(leftIcon);
    container.appendChild(input);

    return container;
  }

  function addSearchBar() {
    if (document.querySelector('[' + DATA_ATTR + ']')) return true;

    const targetElement = document.querySelector(TARGET_SELECTOR);
    if (!targetElement) return false;

    const searchComponent = createSearchComponent();
    targetElement.insertAdjacentElement(INSERT_POSITION, searchComponent);

    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      addSearchBar();
    } finally {
      isProcessing = false;
    }
  }

  function setupObserver() {
    if (window._buscaHeaderObserver) return;

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

    window._buscaHeaderObserver = observer;
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
