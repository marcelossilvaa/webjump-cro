(function () {
  'use strict';

  let debounceTimer = null;

  const STYLE_ID = 'at-login-uma-etapa-style';
  const DATA_ATTR = 'data-at-login-uma-etapa-applied';

  const FORM_SELECTOR = '.js-login-form';
  const CONTINUE_BTN_SELECTOR = '.js-checkUserLogin';
  const ENTER_BTN_SELECTOR = '.js-userCheckedLogin';
  const PASSWORD_LABEL_SELECTOR = '.js-loginFormPasswordLabel';
  const OPTIONS_SELECTOR = '.signInForm__options';
  const VALID_EMAIL_CLASS = 'has-valid-email';

  function repeatSelector(selector, times) {
    let result = '';
    for (let i = 0; i < times; i++) {
      result += selector;
    }
    return result;
  }

  const PASSWORD_LABEL_BOOSTED = repeatSelector(PASSWORD_LABEL_SELECTOR, 4);
  const OPTIONS_BOOSTED = repeatSelector(OPTIONS_SELECTOR, 4);
  const ENTER_BTN_BOOSTED = repeatSelector(ENTER_BTN_SELECTOR, 4);
  const CONTINUE_BTN_BOOSTED = repeatSelector(CONTINUE_BTN_SELECTOR, 4);

  function getStyles() {
    return [
      FORM_SELECTOR + ' ' + PASSWORD_LABEL_BOOSTED + ' {',
      '  display: block !important;',
      '  height: auto !important;',
      '  max-height: none !important;',
      '  min-height: 0 !important;',
      '  overflow: visible !important;',
      '  opacity: 1 !important;',
      '  visibility: visible !important;',
      '  pointer-events: auto !important;',
      '}',
      FORM_SELECTOR + ' ' + PASSWORD_LABEL_BOOSTED + ' input {',
      '  display: block !important;',
      '  height: auto !important;',
      '  opacity: 1 !important;',
      '  visibility: visible !important;',
      '}',
      FORM_SELECTOR + ' ' + PASSWORD_LABEL_BOOSTED + ' label {',
      '  display: block !important;',
      '}',
      FORM_SELECTOR + ' ' + OPTIONS_BOOSTED + ' {',
      '  display: block !important;',
      '  height: auto !important;',
      '  max-height: none !important;',
      '  min-height: 0 !important;',
      '  overflow: visible !important;',
      '  opacity: 1 !important;',
      '  visibility: visible !important;',
      '  pointer-events: auto !important;',
      '}',
      FORM_SELECTOR + ' ' + CONTINUE_BTN_BOOSTED + ' {',
      '  display: none !important;',
      '}',
      FORM_SELECTOR + ' ' + ENTER_BTN_BOOSTED + ' {',
      '  display: block !important;',
      '  opacity: 1 !important;',
      '  visibility: visible !important;',
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

  function forceOneStepLogin() {
    const forms = document.querySelectorAll(FORM_SELECTOR);

    forms.forEach(function (form) {
      form.setAttribute(DATA_ATTR, 'true');

      form.classList.add(VALID_EMAIL_CLASS);

      const continueBtn = form.querySelector(CONTINUE_BTN_SELECTOR);
      if (continueBtn) continueBtn.classList.add('d-none');

      const enterBtn = form.querySelector(ENTER_BTN_SELECTOR);
      if (enterBtn) enterBtn.classList.remove('d-none');

      const passwordLabel = form.querySelector(PASSWORD_LABEL_SELECTOR);
      if (passwordLabel) {
        passwordLabel.classList.remove('d-none');
        passwordLabel.style.setProperty('display', 'block', 'important');
        passwordLabel.style.setProperty('height', 'auto', 'important');
        passwordLabel.style.setProperty('max-height', 'none', 'important');
        passwordLabel.style.setProperty('overflow', 'visible', 'important');
        passwordLabel.style.setProperty('opacity', '1', 'important');
        passwordLabel.style.setProperty('visibility', 'visible', 'important');
      }

      const optionsRow = form.querySelector(OPTIONS_SELECTOR);
      if (optionsRow) {
        optionsRow.classList.remove('d-none');
        optionsRow.style.setProperty('display', 'block', 'important');
        optionsRow.style.setProperty('height', 'auto', 'important');
        optionsRow.style.setProperty('max-height', 'none', 'important');
        optionsRow.style.setProperty('overflow', 'visible', 'important');
        optionsRow.style.setProperty('opacity', '1', 'important');
        optionsRow.style.setProperty('visibility', 'visible', 'important');
      }
    });
  }

  function run() {
    injectStyles();
    forceOneStepLogin();
  }

  function setupObserver() {
    if (window._loginUmaEtapaObserver) return;

    const observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._loginUmaEtapaObserver = observer;
  }

  function init() {
    run();
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
