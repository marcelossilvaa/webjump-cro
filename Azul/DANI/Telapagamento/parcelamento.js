(function () {
  'use strict';

  const STYLE_ID = 'at-pagamento-cc-style';
  const ATTR_MOD = 'data-pagamento-cc-mod';
  let debounceTimer = null;
  let isProcessing = false;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.at-cc-info {',
      '  display: flex;',
      '  flex-direction: row;',
      '  align-items: center;',
      '  gap: 12px;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',
      '.at-cc-item {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 5px;',
      '}',
      '.at-cc-item p {',
      '  margin: 0;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',
      '.at-cc-item svg {',
      '  flex-shrink: 0;',
      '}',
      '.at-cc-sep {',
      '  display: inline-block;',
      '  width: 1px;',
      '  height: 16px;',
      '  background: #ccc;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function createTagIcon() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.41l9 9c.36.36.86.59 1.41.59.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z');
    svg.appendChild(path);
    return svg;
  }

  function createCardIcon() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z');
    svg.appendChild(path);
    return svg;
  }

  function modifyContent() {
    const container = document.querySelector('[data-test-id="fop-cc-card-list-content"]');
    if (!container) return;

    const innerDiv = container.querySelector('div');
    if (!innerDiv) return;
    if (innerDiv.getAttribute(ATTR_MOD)) return;

    const p = innerDiv.querySelector('p');
    if (!p) return;

    innerDiv.setAttribute(ATTR_MOD, 'true');

    const wrapper = document.createElement('div');
    wrapper.className = 'at-cc-info';
    wrapper.setAttribute(ATTR_MOD, 'true');

    const item1 = document.createElement('div');
    item1.className = 'at-cc-item';
    item1.appendChild(createTagIcon());
    const p1 = document.createElement('p');
    p1.textContent = 'At\u00e9 12x sem juros';
    item1.appendChild(p1);

    const sep = document.createElement('span');
    sep.className = 'at-cc-sep';

    const item2 = document.createElement('div');
    item2.className = 'at-cc-item';
    item2.appendChild(createCardIcon());
    const p2 = document.createElement('p');
    p2.textContent = 'Use at\u00e9 2 Cart\u00f5es';
    item2.appendChild(p2);

    wrapper.appendChild(item1);
    wrapper.appendChild(sep);
    wrapper.appendChild(item2);

    innerDiv.replaceChild(wrapper, p);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      modifyContent();
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    injectStyles();
    run();

    if (window._pagamentoCCObserver) return;
    const observer = new MutationObserver(function (mutations) {
      const hasRelevant = mutations.some(function (m) {
        return m.addedNodes.length > 0;
      });
      if (!hasRelevant) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, 150);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window._pagamentoCCObserver = observer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
