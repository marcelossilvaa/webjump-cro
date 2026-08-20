(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_XT_FORMULARIO_RESPONSAVEL_ACORDEAO';
  const STYLE_ID = 'at-responsavel-acordeao-style';
  const ROOT_ATTR = 'data-at-responsavel-acordeao';
  const LISTENER_ATTR = 'data-at-responsavel-listener';
  const CONTEXT = 'checkout_responsavel';
  const MAX_TENTATIVAS = 40;
  const INTERVALO_TENTATIVA = 500;
  const DEBOUNCE_MS = 200;

  const SELECTORS = {
    form: '#responsibleForm',
    formWrapper: '.styles__FormContainer-sc-b3wwec-1, [class*="FormContainer"]',
    headerTitle: '.styles__Header-sc-b3wwec-2, [class*="Header-sc-"]',
    separator: 'hr',
    addressTitle: '.styles__AddressTitle-sc-b3wwec-4, [class*="AddressTitle"]',
    submitButton: 'button[form="responsibleForm"], button[aria-label="Ir para escolha de assentos"]',
  };

  const STEP1_FIELDS = [
    { name: 'firstName', label: 'Nome' },
    { name: 'lastName', label: 'Sobrenome' },
    { name: 'documentNumber', label: 'Documento' },
    { name: 'cellphoneNumber', label: 'Celular' },
    { name: 'email', label: 'E-mail' },
    { name: 'country', label: 'Pais de residência', isSelect: true },
  ];

  const STEP2_FIELDS = [
    { name: 'zipcode', label: 'CEP' },
    { name: 'address', label: 'Endereço' },
    { name: 'addressNumber', label: 'Número' },
    { name: 'neighborhood', label: 'Bairro' },
    { name: 'city', label: 'Cidade' },
    { name: 'state', label: 'Estado', isSelect: true },
  ];

  let isProcessing = false;
  let debounceTimer = null;
  let retryCount = 0;
  let retryTimer = null;
  let step1Confirmed = false;
  let step2Confirmed = false;
  let activeStep = 1;
  let viewTracked = false;

  const ICON_CHEVRON =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  const ICON_CHECK =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M4 8.2L6.8 11l5.2-6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  const ICON_ALERT =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M8 5v3.5M8 11h.01" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>';

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;

    const labelEvent = EXPERIMENT_NAME + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking ResponsavelAcordeao] Analytics event:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = CONTEXT;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getCss() {
    return [
      '[' + ROOT_ATTR + '] .at-resp-accordion {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 16px;',
      '  width: 100%;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel {',
      '  background: #fff;',
      '  border: 1px solid #d6dde5;',
      '  border-radius: 8px;',
      '  overflow: hidden;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  width: 100%;',
      '  padding: 16px 20px;',
      '  margin: 0;',
      '  border: 0;',
      '  background: #fff;',
      '  cursor: pointer;',
      '  text-align: left;',
      '  color: #041e42;',
      '  font-family: inherit;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__header:hover {',
      '  background: #f7fafc;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__badge {',
      '  flex: 0 0 28px;',
      '  width: 28px;',
      '  height: 28px;',
      '  border-radius: 50%;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '  color: #026cb6;',
      '  background: #e8f4fb;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__badge.is-complete {',
      '  color: #fff;',
      '  background: #1f9d55;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__badge.is-alert {',
      '  color: #fff;',
      '  background: #f0a202;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__title {',
      '  flex: 1 1 auto;',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  line-height: 1.3;',
      '  color: #041e42;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__hint {',
      '  flex: 0 0 auto;',
      '  margin-right: 8px;',
      '  font-size: 13px;',
      '  font-weight: 400;',
      '  color: #6b7280;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__chevron {',
      '  flex: 0 0 16px;',
      '  display: inline-flex;',
      '  color: #041e42;',
      '  transition: transform 0.2s ease;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel.is-open .at-resp-panel__chevron {',
      '  transform: rotate(180deg);',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__body {',
      '  display: none;',
      '  padding: 0 20px 20px;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel.is-open .at-resp-panel__body {',
      '  display: block;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__body .styles__FormPart-sc-b3wwec-7,',
      '[' + ROOT_ATTR + '] .at-resp-panel__body [class*="FormPart"] {',
      '  margin: 0;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 16px;',
      '  margin-top: 20px;',
      '  flex-wrap: wrap;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-btn {',
      '  min-width: 168px;',
      '  height: 44px;',
      '  padding: 0 20px;',
      '  border-radius: 4px;',
      '  border: 1px solid #c5ced8;',
      '  background: #fff;',
      '  color: #9aa5b1;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  cursor: not-allowed;',
      '  font-family: inherit;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-btn.is-enabled {',
      '  border-color: #026cb6;',
      '  color: #026cb6;',
      '  cursor: pointer;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-btn.is-enabled:hover {',
      '  background: #e8f4fb;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-missing {',
      '  font-size: 14px;',
      '  color: #4b5563;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-missing strong {',
      '  color: #041e42;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-missing.is-hidden {',
      '  display: none;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-native-header,',
      '[' + ROOT_ATTR + '] .at-resp-native-separator,',
      '[' + ROOT_ATTR + '] .at-resp-native-address-title {',
      '  display: none !important;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-submit-disabled {',
      '  pointer-events: none !important;',
      '  opacity: 0.55 !important;',
      '  cursor: not-allowed !important;',
      '}',
      '@media (max-width: 767px) {',
      '  [' + ROOT_ATTR + '] .at-resp-panel__header {',
      '    padding: 14px 16px;',
      '  }',
      '  [' + ROOT_ATTR + '] .at-resp-panel__body {',
      '    padding: 0 16px 16px;',
      '  }',
      '  [' + ROOT_ATTR + '] .at-resp-panel__hint {',
      '    display: none;',
      '  }',
      '  [' + ROOT_ATTR + '] .at-resp-confirm-row {',
      '    flex-direction: column;',
      '    align-items: stretch;',
      '  }',
      '  [' + ROOT_ATTR + '] .at-resp-confirm-btn {',
      '    width: 100%;',
      '  }',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);
  }

  function getFieldValue(form, field) {
    if (field.isSelect) {
      const hidden = form.querySelector('input[name="' + field.name + '"][type="hidden"]');
      if (hidden) {
        const raw = String(hidden.value || '').trim();
        if (raw && raw !== '[object Object]') return raw;
      }

      const namedInput = form.querySelector('input[name="' + field.name + '"]');
      if (namedInput) {
        const group = namedInput.closest('.form-group-select, [class*="form-group"]') || namedInput.parentElement;
        if (group) {
          const singleValue = group.querySelector('.react-select__single-value');
          if (singleValue && singleValue.textContent) {
            const text = singleValue.textContent.trim();
            if (text && text.toLowerCase() !== 'selecione') return text;
          }
        }

        if (namedInput.value && namedInput.value !== '[object Object]') {
          return String(namedInput.value).trim();
        }
      }

      return '';
    }

    const input = form.querySelector('[name="' + field.name + '"], #' + field.name);
    if (!input) return '';
    return String(input.value || '').trim();
  }

  function getMissingFields(form, fields) {
    const missing = [];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (!getFieldValue(form, field)) {
        missing.push(field);
      }
    }
    return missing;
  }

  function findFormParts(form) {
    const children = Array.prototype.slice.call(form.children);
    const separator = form.querySelector(SELECTORS.separator);
    const addressTitle =
      form.querySelector(SELECTORS.addressTitle) ||
      Array.prototype.find.call(form.querySelectorAll('span'), function (el) {
        return (el.textContent || '').trim() === 'Endereço de cobrança';
      });

    if (!separator || !addressTitle) return null;

    const step1Nodes = [];
    const step2Nodes = [];
    let passedSeparator = false;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === separator || child === addressTitle) {
        passedSeparator = true;
        continue;
      }
      if (!passedSeparator) {
        step1Nodes.push(child);
      } else {
        step2Nodes.push(child);
      }
    }

    if (!step1Nodes.length || !step2Nodes.length) return null;

    return {
      separator: separator,
      addressTitle: addressTitle,
      step1Nodes: step1Nodes,
      step2Nodes: step2Nodes,
    };
  }

  function createBadge(stepNumber, status) {
    const badge = document.createElement('span');
    badge.className = 'at-resp-panel__badge';
    badge.setAttribute('data-at-badge', String(stepNumber));
    badge.setAttribute('data-at-status', status || 'number');

    if (status === 'complete') {
      badge.className += ' is-complete';
      badge.innerHTML = ICON_CHECK;
    } else if (status === 'alert') {
      badge.className += ' is-alert';
      badge.innerHTML = ICON_ALERT;
    } else {
      badge.textContent = String(stepNumber);
    }

    return badge;
  }

  function createPanel(stepNumber, title) {
    const panel = document.createElement('div');
    panel.className = 'at-resp-panel';
    panel.setAttribute('data-at-step', String(stepNumber));

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'at-resp-panel__header';
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute(LISTENER_ATTR, 'true');

    const badge = createBadge(stepNumber, 'number');

    const titleEl = document.createElement('span');
    titleEl.className = 'at-resp-panel__title';
    titleEl.textContent = title;

    const hint = document.createElement('span');
    hint.className = 'at-resp-panel__hint is-hidden';
    hint.setAttribute('data-at-hint', String(stepNumber));
    hint.textContent = 'Campos a preencher';
    hint.style.display = 'none';

    const chevron = document.createElement('span');
    chevron.className = 'at-resp-panel__chevron';
    chevron.innerHTML = ICON_CHEVRON;

    header.appendChild(badge);
    header.appendChild(titleEl);
    header.appendChild(hint);
    header.appendChild(chevron);

    const body = document.createElement('div');
    body.className = 'at-resp-panel__body';

    panel.appendChild(header);
    panel.appendChild(body);

    header.addEventListener('click', function () {
      setActiveStep(stepNumber, true);
      analyticsEvent('step_' + stepNumber + '_toggle', 'click');
    });

    return { panel: panel, header: header, body: body, badge: badge, hint: hint };
  }

  function updateBadge(panelEl, stepNumber, status) {
    const badge = panelEl.querySelector('[data-at-badge]');
    if (!badge) return;

    const current = badge.getAttribute('data-at-status') || '';
    if (current === status) return;

    badge.setAttribute('data-at-status', status);
    badge.className = 'at-resp-panel__badge';

    if (status === 'complete') {
      badge.className += ' is-complete';
      badge.innerHTML = ICON_CHECK;
    } else if (status === 'alert') {
      badge.className += ' is-alert';
      badge.innerHTML = ICON_ALERT;
    } else {
      badge.textContent = String(stepNumber);
    }
  }

  function updateHint(stepNumber, show) {
    const hint = document.querySelector('[data-at-hint="' + stepNumber + '"]');
    if (!hint) return;
    hint.style.display = show ? '' : 'none';
  }

  function setActiveStep(stepNumber, fromUser) {
    activeStep = stepNumber;
    const panels = document.querySelectorAll('.at-resp-panel');
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const step = Number(panel.getAttribute('data-at-step'));
      const isOpen = step === stepNumber;
      panel.classList.toggle('is-open', isOpen);
      const header = panel.querySelector('.at-resp-panel__header');
      if (header) header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    refreshStatusUi();

    if (fromUser) {
      const openPanel = document.querySelector('.at-resp-panel[data-at-step="' + stepNumber + '"]');
      if (openPanel) {
        openPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function getSubmitButton() {
    return document.querySelector(SELECTORS.submitButton);
  }

  function refreshStatusUi() {
    const form = document.querySelector(SELECTORS.form);
    if (!form || !form.hasAttribute(ROOT_ATTR)) return;

    const missing1 = getMissingFields(form, STEP1_FIELDS);
    const missing2 = getMissingFields(form, STEP2_FIELDS);
    const step1Complete = missing1.length === 0;
    const step2Complete = missing2.length === 0;

    if (!step1Complete) step1Confirmed = false;
    if (!step2Complete) step2Confirmed = false;
    if (step2Complete) step2Confirmed = true;

    const panel1 = document.querySelector('.at-resp-panel[data-at-step="1"]');
    const panel2 = document.querySelector('.at-resp-panel[data-at-step="2"]');

    if (panel1) {
      if (step1Confirmed && step1Complete) {
        updateBadge(panel1, 1, 'complete');
        updateHint(1, false);
      } else if (!panel1.classList.contains('is-open') && !step1Complete) {
        updateBadge(panel1, 1, 'alert');
        updateHint(1, true);
      } else {
        updateBadge(panel1, 1, 'number');
        updateHint(1, false);
      }
    }

    if (panel2) {
      if (step2Confirmed && step2Complete) {
        updateBadge(panel2, 2, 'complete');
        updateHint(2, false);
      } else if (!panel2.classList.contains('is-open') && !step2Complete && step1Confirmed) {
        updateBadge(panel2, 2, 'alert');
        updateHint(2, true);
      } else {
        updateBadge(panel2, 2, 'number');
        updateHint(2, false);
      }
    }

    const confirmBtn = form.querySelector('.at-resp-confirm-btn');
    const missingText = form.querySelector('.at-resp-missing');
    if (confirmBtn) {
      const canConfirm = step1Complete;
      confirmBtn.classList.toggle('is-enabled', canConfirm);
      confirmBtn.disabled = !canConfirm;
      confirmBtn.setAttribute('aria-disabled', canConfirm ? 'false' : 'true');
    }
    if (missingText) {
      if (missing1.length > 0) {
        missingText.classList.remove('is-hidden');
        missingText.innerHTML =
          'Faltam <strong>' +
          missing1.length +
          ' campo' +
          (missing1.length > 1 ? 's' : '') +
          '</strong> obrigatório' +
          (missing1.length > 1 ? 's' : '');
      } else {
        missingText.classList.add('is-hidden');
        missingText.textContent = '';
      }
    }

    const submitBtn = getSubmitButton();
    if (submitBtn) {
      const canSubmit = step1Confirmed && step1Complete && step2Complete;
      submitBtn.classList.toggle('at-resp-submit-disabled', !canSubmit);
      submitBtn.setAttribute('aria-disabled', canSubmit ? 'false' : 'true');
      if (canSubmit) {
        submitBtn.removeAttribute('disabled');
      } else {
        submitBtn.setAttribute('disabled', 'disabled');
      }
    }
  }

  function bindFieldListeners(form) {
    if (form.getAttribute(LISTENER_ATTR) === 'fields') return;
    form.setAttribute(LISTENER_ATTR, 'fields');

    form.addEventListener('input', function () {
      refreshStatusUi();
    });
    form.addEventListener('change', function () {
      refreshStatusUi();
    });
    form.addEventListener('blur', function () {
      refreshStatusUi();
    }, true);

    // React-select e preenchimento via checkbox mudam o DOM sem input nativo.
    const observer = new MutationObserver(function () {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(refreshStatusUi, DEBOUNCE_MS);
    });
    observer.observe(form, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
      attributeFilter: ['value', 'class'],
    });
    window._atResponsavelFieldObserver = observer;
  }

  function confirmStep1(form) {
    const missing = getMissingFields(form, STEP1_FIELDS);
    if (missing.length) {
      refreshStatusUi();
      analyticsEvent('confirmar_bloqueado_faltam_' + missing.length, 'click');
      return;
    }

    step1Confirmed = true;
    setActiveStep(2, true);
    analyticsEvent('confirmar_dados_step1', 'click');
  }

  function buildAccordion(form, parts) {
    const accordion = document.createElement('div');
    accordion.className = 'at-resp-accordion';

    const panel1 = createPanel(1, 'Informações do responsável pela compra');
    const panel2 = createPanel(2, 'Endereço de cobrança');

    for (let i = 0; i < parts.step1Nodes.length; i++) {
      panel1.body.appendChild(parts.step1Nodes[i]);
    }

    const confirmRow = document.createElement('div');
    confirmRow.className = 'at-resp-confirm-row';

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'at-resp-confirm-btn';
    confirmBtn.textContent = 'Confirmar dados';
    confirmBtn.disabled = true;
    confirmBtn.setAttribute(LISTENER_ATTR, 'true');
    confirmBtn.addEventListener('click', function (event) {
      event.preventDefault();
      confirmStep1(form);
    });

    const missingText = document.createElement('span');
    missingText.className = 'at-resp-missing';
    missingText.setAttribute('aria-live', 'polite');

    confirmRow.appendChild(confirmBtn);
    confirmRow.appendChild(missingText);
    panel1.body.appendChild(confirmRow);

    for (let j = 0; j < parts.step2Nodes.length; j++) {
      panel2.body.appendChild(parts.step2Nodes[j]);
    }

    parts.separator.classList.add('at-resp-native-separator');
    parts.addressTitle.classList.add('at-resp-native-address-title');

    accordion.appendChild(panel1.panel);
    accordion.appendChild(panel2.panel);

    form.insertBefore(accordion, form.firstChild);
    form.appendChild(parts.separator);
    form.appendChild(parts.addressTitle);

    return accordion;
  }

  function markNativeHeader() {
    const wrappers = document.querySelectorAll(SELECTORS.formWrapper);
    for (let i = 0; i < wrappers.length; i++) {
      const header = wrappers[i].querySelector(SELECTORS.headerTitle);
      if (header) header.classList.add('at-resp-native-header');
    }

    // Fallback por texto
    const spans = document.querySelectorAll('span');
    for (let j = 0; j < spans.length; j++) {
      const text = (spans[j].textContent || '').trim();
      if (text === 'Informações do responsável pela compra' && !spans[j].closest('.at-resp-panel')) {
        spans[j].classList.add('at-resp-native-header');
      }
    }
  }

  function guardSubmitButton() {
    const submitBtn = getSubmitButton();
    if (!submitBtn || submitBtn.getAttribute(LISTENER_ATTR) === 'submit') return;
    submitBtn.setAttribute(LISTENER_ATTR, 'submit');

    submitBtn.addEventListener('click', function (event) {
      const form = document.querySelector(SELECTORS.form);
      if (!form) return;

      const missing1 = getMissingFields(form, STEP1_FIELDS);
      const missing2 = getMissingFields(form, STEP2_FIELDS);
      const canSubmit = step1Confirmed && missing1.length === 0 && missing2.length === 0;

      if (!canSubmit) {
        event.preventDefault();
        event.stopPropagation();

        if (missing1.length || !step1Confirmed) {
          setActiveStep(1, true);
        } else if (missing2.length) {
          setActiveStep(2, true);
        }

        refreshStatusUi();
        analyticsEvent('submit_bloqueado', 'click');
        return;
      }

      analyticsEvent('ir_escolha_assentos', 'click');
    }, true);
  }

  function transformForm(form) {
    if (form.getAttribute(ROOT_ATTR) === 'true') return true;

    const parts = findFormParts(form);
    if (!parts) return false;

    form.setAttribute(ROOT_ATTR, 'true');
    buildAccordion(form, parts);
    markNativeHeader();
    bindFieldListeners(form);
    guardSubmitButton();
    setActiveStep(1, false);
    refreshStatusUi();

    if (!viewTracked) {
      viewTracked = true;
      analyticsEvent('acordeao_view', 'view');
    }

    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      injectStyles();
      const form = document.querySelector(SELECTORS.form);
      if (!form) {
        scheduleRetry();
        return;
      }

      const ok = transformForm(form);
      if (!ok) {
        scheduleRetry();
        return;
      }

      retryCount = 0;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRetry() {
    if (retryCount >= MAX_TENTATIVAS) return;
    retryCount += 1;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(run, INTERVALO_TENTATIVA);
  }

  function observeDom() {
    if (window._atResponsavelAcordeaoObserver) return;

    const observer = new MutationObserver(function (mutations) {
      let shouldRun = false;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.target && mutation.target.closest && mutation.target.closest('[' + ROOT_ATTR + ']')) {
          continue;
        }
        shouldRun = true;
        break;
      }
      if (!shouldRun) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        const form = document.querySelector(SELECTORS.form);
        if (form && form.getAttribute(ROOT_ATTR) !== 'true') {
          run();
        } else if (form) {
          refreshStatusUi();
        }
      }, DEBOUNCE_MS);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window._atResponsavelAcordeaoObserver = observer;
  }

  function init() {
    if (window._atResponsavelAcordeaoInit) return;
    window._atResponsavelAcordeaoInit = true;
    injectStyles();
    run();
    observeDom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
