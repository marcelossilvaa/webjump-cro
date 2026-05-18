(function () {
  'use strict';

  const STYLE_ID = 'at-minibasket-bg-style';
  const BG_COLOR = '#257a57';
  const HOVER_BG = '#000';

  function getCss() {
    const rules = [
      '.MiniBasketButton--not-empty {',
      '  background-color: ' + BG_COLOR + ' !important;',
      '  border-color: ' + BG_COLOR + ' !important;',
      '}',
      '.MiniBasketButton--not-empty:hover {',
      '  background-color: ' + HOVER_BG + ' !important;',
      '  border-color: ' + HOVER_BG + ' !important;',
      '}',
    ];
    return rules.join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
