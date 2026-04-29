(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let observer = null;
  let scrollListenerAdded = false;

  const STYLE_ID = 'wj-inspirali-momento-carreira-radio-v1-style';
  const PROCESSED_ATTR = 'data-wj-inspirali-momento-carreira-radio-v1';
  const FLOATING_CTA_ATTR = 'data-wj-inspirali-floating-cta-scroll-v1';
  const FLOATING_CTA_SHOWN_CLASS = 'wj-floating-cta--shown';
  const FLOATING_CTA_THRESHOLD_PX = 160;
  const SUBMIT_COPY_ATTR = 'data-wj-inspirali-submit-copy-v1';
  const SUBMIT_COPY_TEXT = 'Quero falar com um especialista';
  const SUBMIT_HELPER_ATTR = 'data-wj-inspirali-submit-helper-v1';
  const SUBMIT_HELPER_TEXT = 'Responderemos em até 1 dia útil - Seus dados estão seguros.';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.wj-career-moment{margin-top:14px;}' +
      '.wj-career-moment__title{display:block;margin:0 0 10px 0;color:#fff;font-size:14px;line-height:1.2;}' +
      '.wj-career-moment__options{display:flex;gap:10px;}' +
      '.wj-career-moment__option{display:inline-flex;align-items:center;gap:10px;color:#fff;font-size:14px;line-height:1.2;cursor:pointer;user-select:none;}' +
      // Reset forte: o CSS global do form aplica width:100%/display:flex/padding em inputs.
      '.wj-career-moment__option .wj-career-moment__radio{width:auto !important;height:auto !important;display:inline-block !important;padding:0 !important;gap:0 !important;align-self:auto !important;justify-content:initial !important;align-items:initial !important;accent-color:#d7d7d7;}' +
      '.wj-career-moment__option-text{display:inline-block;}' +
      // Mobile: ajustes finos de espaçamento.
      '@media (max-width: 767px){' +
      '.wj-career-moment__options{gap:4px !important;}' +
      '.wj-career-moment__option{gap:6px !important;}' +
      '.wj-career-moment__option .wj-career-moment__radio{margin:0 !important;}' +
      '}' +
      // Checkbox de termos: remove margin do texto para aproximar do layout.
      '.banner-lead-form form.cmp-form fieldset.cmp-form-options--checkbox #user-agreement.cmp-text{margin:0 !important;}' +
      '.banner-lead-form form.cmp-form fieldset.cmp-form-options--checkbox .cmp-text#user-agreement p{margin:0 !important;}' +
      // Texto abaixo do botão.
      '.wj-submit-helper{margin:-10px 0 !important;font-size:12px !important;line-height:1.3 !important;color:rgba(255,255,255,.8) !important;text-align:center !important;}' +
      // Floating CTA: só aparece depois de scroll.
      '.cmp-floating-cta[' +
      FLOATING_CTA_ATTR +
      '="1"]{opacity:0 !important;transform:translateY(10px) !important;pointer-events:none !important;will-change:opacity, transform !important;transition:opacity .55s cubic-bezier(.2,.8,.2,1), transform .55s cubic-bezier(.2,.8,.2,1) !important;}' +
      '.cmp-floating-cta.' +
      FLOATING_CTA_SHOWN_CLASS +
      '[' +
      FLOATING_CTA_ATTR +
      '="1"]{opacity:1 !important;transform:translateY(0) !important;pointer-events:auto !important;}';

    document.head.appendChild(style);
  }

  function getText(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function buildCareerMomentUi(selectEl) {
    if (!selectEl || selectEl.nodeName !== 'SELECT') return false;

    const fieldset = selectEl.closest('fieldset');
    if (!fieldset) return false;
    if (fieldset.getAttribute(PROCESSED_ATTR) === '1') return false;

    const options = Array.prototype.slice
      .call(selectEl.querySelectorAll('option'))
      .filter(function (opt) {
        const v = (opt && opt.value ? String(opt.value) : '').trim();
        if (!v || v === 'select') return false;
        return true;
      });

    if (!options.length) return false;

    const labelEl = fieldset.querySelector('.cmp-form-options__label');
    const placeholderOpt = selectEl.querySelector('option[value="select"]');
    const titleText =
      getText(placeholderOpt) ||
      (labelEl ? getText(labelEl) : '') ||
      'Em qual momento está sua carreira?';

    const wrapper = document.createElement('div');
    wrapper.className = 'wj-career-moment';

    const title = document.createElement('span');
    title.className = 'wj-career-moment__title';
    title.textContent = titleText;

    const optsWrap = document.createElement('div');
    optsWrap.className = 'wj-career-moment__options';

    const radioName = 'wj-career-moment-' + (selectEl.id || 'hour');

    function getSelectedValue() {
      return (selectEl.value ? String(selectEl.value) : '').trim();
    }

    function setSelectedValue(nextValue) {
      if (!nextValue) return;
      if (String(selectEl.value) === String(nextValue)) return;
      selectEl.value = String(nextValue);
      try {
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (e) {
        // Mantém compatibilidade sem quebrar.
      }
    }

    function syncRadiosFromSelect() {
      const current = getSelectedValue();
      const radios = optsWrap.querySelectorAll('input[type="radio"]');
      for (let i = 0; i < radios.length; i++) {
        const r = radios[i];
        r.checked = String(r.value) === String(current);
      }
    }

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const optValue = String(opt.value);
      const optText = getText(opt) || optValue;

      const optionLabel = document.createElement('label');
      optionLabel.className = 'wj-career-moment__option';

      const radio = document.createElement('input');
      radio.className = 'wj-career-moment__radio';
      radio.type = 'radio';
      radio.name = radioName;
      radio.value = optValue;

      const txt = document.createElement('span');
      txt.className = 'wj-career-moment__option-text';
      txt.textContent = optText;
      if (optValue === 'sou-medico') {
        txt.style.setProperty('min-width', '80px');
      }

      radio.addEventListener('change', function () {
        if (!radio.checked) return;
        setSelectedValue(optValue);
      });

      optionLabel.appendChild(radio);
      optionLabel.appendChild(txt);
      optsWrap.appendChild(optionLabel);
    }

    wrapper.appendChild(title);
    wrapper.appendChild(optsWrap);

    // Esconde o select/label originais, mas mantém no DOM para submit/validação.
    if (labelEl) labelEl.style.setProperty('display', 'none', 'important');
    selectEl.style.setProperty('display', 'none', 'important');

    syncRadiosFromSelect();
    selectEl.addEventListener('change', syncRadiosFromSelect);

    fieldset.insertBefore(wrapper, selectEl);
    fieldset.setAttribute(PROCESSED_ATTR, '1');
    return true;
  }

  function updateSubmitCopy() {
    const btn = document.querySelector(
      '.banner-lead-form form.cmp-form button.cmp-form-button[type="submit"], form.cmp-form button.cmp-form-button[type="submit"]',
    );
    if (!btn) return false;
    if (btn.getAttribute(SUBMIT_COPY_ATTR) === '1') return false;

    btn.textContent = SUBMIT_COPY_TEXT;
    btn.setAttribute(SUBMIT_COPY_ATTR, '1');
    return true;
  }

  function ensureSubmitHelperText() {
    const btn = document.querySelector(
      '.banner-lead-form form.cmp-form button.cmp-form-button[type="submit"], form.cmp-form button.cmp-form-button[type="submit"]',
    );
    if (!btn) return false;

    const parent = btn.parentElement;
    if (!parent) return false;

    if (parent.getAttribute(SUBMIT_HELPER_ATTR) === '1') return false;

    const helper = document.createElement('p');
    helper.className = 'wj-submit-helper';
    helper.textContent = SUBMIT_HELPER_TEXT;

    if (btn.nextSibling) {
      parent.insertBefore(helper, btn.nextSibling);
    } else {
      parent.appendChild(helper);
    }

    parent.setAttribute(SUBMIT_HELPER_ATTR, '1');
    return true;
  }

  function initFloatingCtaScroll() {
    const cta = document.querySelector('.cmp-floating-cta');
    if (!cta) return false;

    if (cta.getAttribute(FLOATING_CTA_ATTR) !== '1') {
      cta.setAttribute(FLOATING_CTA_ATTR, '1');
    }

    function update() {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      const shouldShow = y > FLOATING_CTA_THRESHOLD_PX;
      if (shouldShow) {
        if (!cta.classList.contains(FLOATING_CTA_SHOWN_CLASS)) {
          cta.classList.add(FLOATING_CTA_SHOWN_CLASS);
        }
      } else {
        cta.classList.remove(FLOATING_CTA_SHOWN_CLASS);
      }
    }

    update();

    if (!scrollListenerAdded) {
      scrollListenerAdded = true;
      window.addEventListener(
        'scroll',
        function () {
          scheduleRun();
        },
        { passive: true },
      );
      window.addEventListener(
        'resize',
        function () {
          scheduleRun();
        },
        { passive: true },
      );
    }

    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      injectStyles();

      const careerSelect = document.querySelector(
        '.ibcmed-lead-form__wrapper select[name="hour"], form.cmp-form select[name="hour"]',
      );
      if (!careerSelect) return;

      buildCareerMomentUi(careerSelect);
      updateSubmitCopy();
      ensureSubmitHelperText();
      initFloatingCtaScroll();
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      run();
    }, 150);
  }

  function initObserver() {
    if (observer) return;

    observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const target = mutations[i] && mutations[i].target;
        if (target && target.nodeType === 1) {
          const el = target;
          if (el && (el.id === STYLE_ID || (el.closest && el.closest('#' + STYLE_ID)))) {
            return;
          }
        }
      }
      scheduleRun();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    run();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
