(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let observer = null;

  const STYLE_ID = 'wj-inspirali-momento-carreira-radio-v1-style';
  const PROCESSED_ATTR = 'data-wj-inspirali-momento-carreira-radio-v1';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.wj-career-moment{margin-top:14px;}' +
      '.wj-career-moment__title{display:block;margin:0 0 10px 0;color:#fff;font-size:14px;line-height:1.2;}' +
      '.wj-career-moment__options{display:flex;gap:22px;flex-wrap:wrap;}' +
      '.wj-career-moment__option{display:inline-flex;align-items:center;gap:10px;color:#fff;font-size:14px;line-height:1.2;cursor:pointer;user-select:none;}' +
      '.wj-career-moment__radio{width:14px;height:14px;accent-color:#d7d7d7;}' +
      '.wj-career-moment__option-text{display:inline-block;}';

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

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      injectStyles();

      const careerSelect = document.querySelector(
        '.ibcmed-lead-form__wrapper select[name="hour"], form.cmp-form select[name="hour"]'
      );
      if (!careerSelect) return;

      buildCareerMomentUi(careerSelect);
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
