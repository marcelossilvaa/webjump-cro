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
    { name: 'country', label: 'País de residência', isSelect: true },
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
      /* Remove o card branco nativo para os paineis ficarem como no Figma */
      '.at-resp-shell {',
      '  background: transparent !important;',
      '  box-shadow: none !important;',
      '  border: 0 !important;',
      '  padding: 0 !important;',
      '  margin: 0 !important;',
      '}',
      '.at-resp-shell .styles__Wrapper-sc-b3wwec-0,',
      '.at-resp-shell [class*="Wrapper-sc-"] {',
      '  background: transparent !important;',
      '  box-shadow: none !important;',
      '  border: 0 !important;',
      '  padding: 0 !important;',
      '}',
      '.at-resp-shell .styles__FormContainer-sc-b3wwec-1,',
      '.at-resp-shell [class*="FormContainer"] {',
      '  background: transparent !important;',
      '  box-shadow: none !important;',
      '  border: 0 !important;',
      '  padding: 0 !important;',
      '  margin: 0 !important;',
      '  gap: 0 !important;',
      '}',
      '[' + ROOT_ATTR + '] {',
      '  display: block !important;',
      '  width: 100%;',
      '  background: transparent !important;',
      '  padding: 0 !important;',
      '  margin: 0 !important;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-accordion {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 12px;',
      '  width: 100%;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel {',
      '  background: #fff;',
      '  border: 1px solid #cfd8e3;',
      '  border-radius: 8px;',
      '  overflow: visible;',
      '  box-shadow: none;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  width: 100%;',
      '  min-height: 56px;',
      '  padding: 14px 20px;',
      '  margin: 0;',
      '  border: 0;',
      '  background: #fff;',
      '  cursor: pointer;',
      '  text-align: left;',
      '  color: #041e42;',
      '  font-family: inherit;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__header:hover {',
      '  background: #f8fbfe;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__badge {',
      '  flex: 0 0 24px;',
      '  width: 24px;',
      '  height: 24px;',
      '  border-radius: 50%;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '  color: #026cb6;',
      '  background: #d7eef9;',
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
      '  padding: 4px 20px 20px;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel.is-open .at-resp-panel__body {',
      '  display: block;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-panel__body .styles__FormPart-sc-b3wwec-7,',
      '[' + ROOT_ATTR + '] .at-resp-panel__body [class*="FormPart"] {',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 16px;',
      '  margin-top: 24px;',
      '  flex-wrap: wrap;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-btn {',
      '  min-width: 168px;',
      '  height: 44px;',
      '  padding: 0 20px;',
      '  border-radius: 4px;',
      '  border: 1px solid #026cb6;',
      '  background: #fff;',
      '  color: #026cb6;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  font-family: inherit;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-confirm-btn:hover {',
      '  background: #e8f4fb;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-missing {',
      '  font-size: 14px;',
      '  color: #4b5563;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-missing strong {',
      '  color: #041e42;',
      '  font-weight: 700;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-missing.is-hidden {',
      '  display: none;',
      '}',
      /* Erros no padrao nativo Azul */
      '[' + ROOT_ATTR + '] .at-resp-field-invalid .form-group-container,',
      '[' + ROOT_ATTR + '] .at-resp-field-invalid [class*="form-group-container"] {',
      '  border-color: #d32f2f !important;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-field-invalid input,',
      '[' + ROOT_ATTR + '] .at-resp-field-invalid .react-select__control,',
      '[' + ROOT_ATTR + '] .at-resp-field-invalid [class*="react-select__control"] {',
      '  border-color: #d32f2f !important;',
      '  box-shadow: none !important;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-field-error {',
      '  display: block;',
      '  margin-top: 4px;',
      '  color: #d32f2f;',
      '  font-size: 12px;',
      '  line-height: 1.3;',
      '}',
      '[' + ROOT_ATTR + '] .at-resp-native-header,',
      '.at-resp-shell .at-resp-native-header,',
      '[' + ROOT_ATTR + '] .at-resp-native-separator,',
      '[' + ROOT_ATTR + '] .at-resp-native-address-title {',
      '  display: none !important;',
      '}',
      /* CTA principal sempre habilitado (comportamento nativo) */
      '.at-resp-shell button[form="responsibleForm"],',
      '.at-resp-shell button[aria-label="Ir para escolha de assentos"] {',
      '  width: 100% !important;',
      '  margin-top: 16px !important;',
      '  min-height: 48px !important;',
      '  border-radius: 4px !important;',
      '  border: 0 !important;',
      '  box-shadow: none !important;',
      '  pointer-events: auto !important;',
      '  cursor: pointer !important;',
      '  opacity: 1 !important;',
      '  background: #26a65b !important;',
      '  color: #fff !important;',
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
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = getCss();
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isBlankValue(raw) {
    if (raw == null) return true;
    const value = String(raw).replace(/\s+/g, ' ').trim();
    if (!value) return true;
    if (value === '[object Object]') return true;
    if (normalizeText(value) === 'selecione') return true;
    return false;
  }

  function getReactSelectText(root) {
    if (!root || !root.querySelector) return '';

    const single = root.querySelector(
      '.react-select__single-value, [class*="single-value"], [class*="singleValue"]'
    );
    if (single) {
      const text = String(single.textContent || '').replace(/\s+/g, ' ').trim();
      if (!isBlankValue(text)) return text;
    }

    if (root.querySelector('.react-select__value-container--has-value')) {
      return 'selected';
    }

    return '';
  }

  function getSelectValueByName(form, fieldName) {
    const inputs = form.querySelectorAll('input[name="' + fieldName + '"]');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const raw = input.value;
      if (!isBlankValue(raw)) return String(raw).trim();

      let node = input;
      for (let depth = 0; depth < 7 && node; depth++) {
        const visible = getReactSelectText(node);
        if (visible) return visible;
        node = node.parentElement;
      }
    }

    return '';
  }

  function getSelectValueByLabel(form, labelText) {
    if (!labelText) return '';
    const labelNeedle = normalizeText(labelText);
    const candidates = form.querySelectorAll('label, span');

    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      const text = normalizeText(el.textContent || '');
      if (!text || text.indexOf(labelNeedle) === -1) continue;
      if (el.closest('.at-resp-panel__header')) continue;

      let node = el.parentElement;
      for (let depth = 0; depth < 6 && node; depth++) {
        const visible = getReactSelectText(node);
        if (visible) return visible;
        node = node.parentElement;
      }
    }

    return '';
  }

  function getInputValueByName(form, fieldName) {
    const nodes = form.querySelectorAll('[name="' + fieldName + '"], #' + fieldName);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node || node.type === 'checkbox' || node.type === 'radio') continue;

      const propValue = node.value != null ? String(node.value) : '';
      if (!isBlankValue(propValue) && propValue !== '[object Object]') {
        return propValue.trim();
      }

      const attrValue = node.getAttribute('value');
      if (!isBlankValue(attrValue) && attrValue !== '[object Object]') {
        return String(attrValue).trim();
      }
    }
    return '';
  }

  function getFieldValue(form, field) {
    if (field.isSelect) {
      const byName = getSelectValueByName(form, field.name);
      if (byName) return byName;

      const byLabel = getSelectValueByLabel(form, field.label);
      if (byLabel) return byLabel;

      return '';
    }

    return getInputValueByName(form, field.name);
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

  function getFieldGroup(form, field) {
    if (field.isSelect) {
      const input = form.querySelector('input[name="' + field.name + '"]');
      if (input) {
        return (
          input.closest('.form-group-select') ||
          input.closest('[class*="form-group"]') ||
          input.parentElement
        );
      }

      const labelNeedle = normalizeText(field.label);
      const labels = form.querySelectorAll('label, span');
      for (let i = 0; i < labels.length; i++) {
        const text = normalizeText(labels[i].textContent || '');
        if (text.indexOf(labelNeedle) === -1) continue;
        if (labels[i].closest('.at-resp-panel__header')) continue;
        return (
          labels[i].closest('.form-group-select') ||
          labels[i].closest('[class*="form-group"]') ||
          labels[i].parentElement
        );
      }
      return null;
    }

    const input = form.querySelector('[name="' + field.name + '"], #' + field.name);
    if (!input) return null;
    return (
      input.closest('.form-group') ||
      input.closest('[class*="form-group"]') ||
      input.parentElement
    );
  }

  function getFocusableInGroup(group, field) {
    if (!group) return null;
    if (field && field.isSelect) {
      const selectInput = group.querySelector('.react-select__input input, input[type="text"]');
      if (selectInput) return selectInput;
      const control = group.querySelector('.react-select__control, [class*="react-select__control"]');
      if (control) return control;
    }
    return group.querySelector('input:not([type="hidden"]), select, textarea');
  }

  function clearFieldError(group) {
    if (!group) return;
    group.classList.remove('at-resp-field-invalid');
    const error = group.querySelector('.at-resp-field-error');
    if (error && error.parentNode) error.parentNode.removeChild(error);
  }

  function clearAllFieldErrors(form) {
    const invalids = form.querySelectorAll('.at-resp-field-invalid');
    for (let i = 0; i < invalids.length; i++) {
      clearFieldError(invalids[i]);
    }
  }

  function setFieldError(group, message) {
    if (!group) return;
    group.classList.add('at-resp-field-invalid');
    let error = group.querySelector('.at-resp-field-error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'at-resp-field-error';
      group.appendChild(error);
    }
    error.textContent = message;
  }

  function showFieldsValidation(form, fields) {
    const missing = getMissingFields(form, fields);
    let firstFocus = null;

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const group = getFieldGroup(form, field);
      if (!group) continue;

      const isMissing = missing.some(function (item) {
        return item.name === field.name;
      });

      if (isMissing) {
        setFieldError(group, field.label + ' obrigatório');
        if (!firstFocus) firstFocus = getFocusableInGroup(group, field) || group;
      } else {
        clearFieldError(group);
      }
    }

    if (firstFocus) {
      try {
        if (typeof firstFocus.focus === 'function') firstFocus.focus();
        if (typeof firstFocus.scrollIntoView === 'function') {
          firstFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        // ignore focus errors em elementos nao focaveis
      }
    }

    return missing;
  }

  function syncFieldErrorsAfterChange(form) {
    const marked = form.querySelectorAll('.at-resp-field-invalid');
    for (let i = 0; i < marked.length; i++) {
      const group = marked[i];
      const allFields = STEP1_FIELDS.concat(STEP2_FIELDS);
      for (let j = 0; j < allFields.length; j++) {
        const field = allFields[j];
        const fieldGroup = getFieldGroup(form, field);
        if (fieldGroup !== group) continue;
        if (getFieldValue(form, field)) {
          clearFieldError(group);
        } else if (group.querySelector('.at-resp-field-error')) {
          // mantem erro se ainda vazio apos tentativa de validacao
        }
        break;
      }
    }
  }

  function formatMissingCounter(count) {
    if (count <= 0) return '';
    if (count === 1) return '<strong>1 campo</strong> não preenchido';
    return '<strong>' + count + ' campos</strong> não preenchidos';
  }

  function ensureSubmitEnabled() {
    const submitBtn = getSubmitButton();
    if (!submitBtn) return;
    submitBtn.classList.remove('at-resp-submit-disabled');
    submitBtn.removeAttribute('disabled');
    submitBtn.setAttribute('aria-disabled', 'false');
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
    if (step2Complete && step1Confirmed) step2Confirmed = true;

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
      confirmBtn.disabled = false;
      confirmBtn.removeAttribute('disabled');
      confirmBtn.setAttribute('aria-disabled', 'false');
    }
    if (missingText) {
      if (missing1.length > 0) {
        missingText.classList.remove('is-hidden');
        missingText.innerHTML = formatMissingCounter(missing1.length);
      } else {
        missingText.classList.add('is-hidden');
        missingText.textContent = '';
      }
    }

    ensureSubmitEnabled();
    syncFieldErrorsAfterChange(form);
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
    const missing = showFieldsValidation(form, STEP1_FIELDS);
    refreshStatusUi();

    if (missing.length) {
      analyticsEvent('confirmar_validacao_faltam_' + missing.length, 'click');
      return;
    }

    clearAllFieldErrors(form);
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
    confirmBtn.disabled = false;
    confirmBtn.setAttribute('aria-disabled', 'false');
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

  function markNativeShell(form) {
    const container =
      form.closest('.styles__FormContainer-sc-b3wwec-1') ||
      form.closest('[class*="FormContainer"]') ||
      form.parentElement;
    if (container) container.classList.add('at-resp-shell');

    const wrapper =
      (container && (container.closest('.styles__Wrapper-sc-b3wwec-0') || container.closest('[class*="Wrapper-sc-"]'))) ||
      form.closest('.styles__Wrapper-sc-b3wwec-0') ||
      form.closest('[class*="Wrapper-sc-"]');
    if (wrapper) wrapper.classList.add('at-resp-shell');

    const headers = document.querySelectorAll(SELECTORS.headerTitle);
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header.closest('.at-resp-panel')) continue;
      if ((header.textContent || '').indexOf('Informações do responsável') !== -1) {
        header.classList.add('at-resp-native-header');
      }
    }

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
    ensureSubmitEnabled();

    submitBtn.addEventListener(
      'click',
      function (event) {
        const form = document.querySelector(SELECTORS.form);
        if (!form) return;

        ensureSubmitEnabled();

        const missing1 = getMissingFields(form, STEP1_FIELDS);
        if (missing1.length) {
          event.preventDefault();
          event.stopPropagation();
          setActiveStep(1, true);
          showFieldsValidation(form, STEP1_FIELDS);
          refreshStatusUi();
          analyticsEvent('submit_validacao_step1_faltam_' + missing1.length, 'click');
          return;
        }

        step1Confirmed = true;

        const missing2 = getMissingFields(form, STEP2_FIELDS);
        if (missing2.length) {
          event.preventDefault();
          event.stopPropagation();
          setActiveStep(2, true);
          showFieldsValidation(form, STEP2_FIELDS);
          refreshStatusUi();
          analyticsEvent('submit_validacao_step2_faltam_' + missing2.length, 'click');
          return;
        }

        clearAllFieldErrors(form);
        step2Confirmed = true;
        refreshStatusUi();
        analyticsEvent('ir_escolha_assentos', 'click');
      },
      true
    );
  }

  function transformForm(form) {
    if (form.getAttribute(ROOT_ATTR) === 'true') return true;

    const parts = findFormParts(form);
    if (!parts) return false;

    form.setAttribute(ROOT_ATTR, 'true');
    buildAccordion(form, parts);
    markNativeShell(form);
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
