(function () {
  'use strict';

  if (window.__atFiltrosHoteisSortPills) {
    return;
  }
  window.__atFiltrosHoteisSortPills = true;

  let isProcessing = false;
  let isApplyingSort = false;
  let debounceTimer = null;
  let sortObserver = null;
  let listWasLoading = false;

  const STYLE_ID = 'at-filtros-hoteis-sort-pills-style';
  const DATA_DONE = 'data-at-sort-pills-done';
  const DATA_LISTENER = 'data-at-sort-pill-listener';

  const MOBILE_MAX_WIDTH = 1023;
  const OPEN_DELAY_MS = 350;
  const AFTER_SELECT_MS = 450;

  const SORT_OPTIONS = [
    { label: 'Melhor avaliado', value: 'ratingdesc' },
    { label: 'Mais procurados', value: 'label' },
    { label: 'Mais barato', value: 'priceasc' },
    { label: 'Mais caro', value: 'pricedesc' },
    { label: 'Mais estrelas', value: 'stardesc' },
    { label: 'Menos estrelas', value: 'starasc' },
  ];

  const SELECTORS = {
    loadingWrapper: '[class*="LoadingWrapper-sc-oxmbkx"]',
    filterRow: '[class*="FilterRow-sc-1oit4q5"]',
    filterWrapper: '[class*="FilterWrapper-sc-1oit4q5"]',
    filterTitle: '[class*="FilterTitleText-sc-1oit4q5"]',
    nativeDropdown: '[class*="DropdownContainer-sc-1h37srh"]',
    dropdownContent: '#orderBy, [class*="DropdownContent-sc-1h37srh"]',
    nativeTrigger: '[class*="DropdownFilter-sc-1h37srh"]',
    nativeTriggerLabel: '[class*="WrapperLabelText-sc-1h37srh"]',
    sortRadio: 'button[role="radio"]',
    sortRadioLabel: 'span[class*="fSTJYd"]',
    sortInput: 'input[name="orderBy"]',
  };

  const PILL_BAR_CLASS = 'at-hotel-sort-pills';
  const PILL_BTN_CLASS = 'at-hotel-sort-pill';
  const PILL_ACTIVE_CLASS = 'at-hotel-sort-pill--active';
  const CLASS_SILENT_DROPDOWN = 'at-sort-dropdown-silent';

  function isHotelPage() {
    return window.location.pathname.indexOf('/hotel') > -1;
  }

  function normalizeText(text) {
    return (text || '')
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function getSortOptionConfig(optionLabel) {
    const target = normalizeText(optionLabel);
    let i;
    for (i = 0; i < SORT_OPTIONS.length; i++) {
      if (normalizeText(SORT_OPTIONS[i].label) === target) {
        return SORT_OPTIONS[i];
      }
    }
    return null;
  }

  function analyticsEvent(optionLabel) {
    if (!optionLabel) {
      return;
    }
    const labelEvent = 'AT_filtros_hoteis_ordenacao_clique ' + optionLabel;
    const s =
      window.s ||
      (typeof window.s_gi === 'function' && window.s_gi('azul-novo-prod'));
    if (!s || typeof s.tl !== 'function') {
      return;
    }
    s.linkTrackVars = 'events,eVar82,eVar84';
    s.linkTrackEvents = 'event90';
    s.events = 'event90';
    s.eVar82 = labelEvent;
    s.eVar84 = 'AT_hotel_listagem';
    s.tl(true, 'o', 'target_activity_action');
  }

  function getSortCss() {
    return (
      '[class*="FilterRow-sc-1oit4q5"].at-sort-pills-ready {' +
      '  display: flex;' +
      '  flex-wrap: wrap;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '}' +
      '[class*="FilterWrapper-sc-1oit4q5"].at-sort-pills-ready {' +
      '  display: flex;' +
      '  flex-wrap: wrap;' +
      '  align-items: center;' +
      '  gap: 8px;' +
      '  width: auto;' +
      '}' +
      '[class*="FilterWrapper-sc-1oit4q5"].at-sort-pills-ready [class*="FilterTitleText-sc-1oit4q5"] {' +
      '  white-space: nowrap;' +
      '}' +
      '[class*="FilterWrapper-sc-1oit4q5"].at-sort-pills-ready [class*="DropdownContainer-sc-1h37srh"],' +
      '[class*="FilterWrapper-sc-1oit4q5"].' +
      CLASS_SILENT_DROPDOWN +
      ' [class*="DropdownContainer-sc-1h37srh"] {' +
      '  position: fixed !important;' +
      '  left: -9999px !important;' +
      '  top: 0 !important;' +
      '  width: 320px !important;' +
      '  min-height: 1px !important;' +
      '  opacity: 0 !important;' +
      '  pointer-events: auto !important;' +
      '  visibility: visible !important;' +
      '  overflow: visible !important;' +
      '}' +
      '.' +
      PILL_BAR_CLASS +
      ' {' +
      '  display: inline-flex;' +
      '  flex-wrap: nowrap;' +
      '  gap: 6px;' +
      '  max-width: 100%;' +
      '  overflow-x: auto;' +
      '  -webkit-overflow-scrolling: touch;' +
      '  scrollbar-width: none;' +
      '}' +
      '.' +
      PILL_BAR_CLASS +
      '::-webkit-scrollbar { display: none; }' +
      '.' +
      PILL_BTN_CLASS +
      ' {' +
      '  align-items: center;' +
      '  background-color: #fff;' +
      '  border: 1px solid #ccc;' +
      '  border-radius: 32px;' +
      '  box-sizing: border-box;' +
      '  color: #026cb6;' +
      '  cursor: pointer;' +
      '  display: inline-flex;' +
      '  flex-shrink: 0;' +
      '  font-family: inherit;' +
      '  font-size: 12px;' +
      '  font-weight: 600;' +
      '  justify-content: center;' +
      '  min-height: 30px;' +
      '  outline: none;' +
      '  padding: 0 12px;' +
      '  white-space: nowrap;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      ':hover { border-color: #026cb6; }' +
      '.' +
      PILL_BTN_CLASS +
      '.' +
      PILL_ACTIVE_CLASS +
      ' {' +
      '  background-color: #026cb6;' +
      '  border-color: #026cb6;' +
      '  color: #fff;' +
      '}' +
      '@media (max-width: ' +
      MOBILE_MAX_WIDTH +
      'px) {' +
      '[class*="FilterRow-sc-1oit4q5"].at-sort-pills-ready {' +
      '  margin-top: 40px !important;' +
      '  gap: 6px;' +
      '}' +
      '[class*="FilterWrapper-sc-1oit4q5"].at-sort-pills-ready {' +
      '  gap: 4px;' +
      '}' +
      '.' +
      PILL_BAR_CLASS +
      ' {' +
      '  gap: 4px;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      ' {' +
      '  font-size: 11px;' +
      '  min-height: 28px;' +
      '  padding: 0 10px;' +
      '}' +
      '}'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getSortCss();
    document.head.appendChild(style);
  }

  function findSortFilterWrapper() {
    const titles = document.querySelectorAll(SELECTORS.filterTitle);
    let i;
    for (i = 0; i < titles.length; i++) {
      if (titles[i].textContent.indexOf('Ordenado por') > -1) {
        return titles[i].closest(SELECTORS.filterWrapper);
      }
    }
    return null;
  }

  function findSortFilterRow(wrapper) {
    if (!wrapper) {
      return null;
    }
    return wrapper.closest(SELECTORS.filterRow);
  }

  function getDropdownContent(wrapper) {
    const dropdown = wrapper.querySelector(SELECTORS.nativeDropdown);
    if (!dropdown) {
      return null;
    }
    return dropdown.querySelector(SELECTORS.dropdownContent);
  }

  function getNativeTrigger(wrapper) {
    const dropdown = wrapper.querySelector(SELECTORS.nativeDropdown);
    return dropdown ? dropdown.querySelector(SELECTORS.nativeTrigger) : null;
  }

  function getOptionLabelFromRadio(radioBtn) {
    if (!radioBtn) {
      return '';
    }
    const labelSpan = radioBtn.querySelector(SELECTORS.sortRadioLabel);
    if (labelSpan) {
      return labelSpan.textContent.trim();
    }
    const aria = radioBtn.getAttribute('aria-label') || '';
    if (aria) {
      return aria.split(',')[0].trim();
    }
    return (radioBtn.textContent || '').trim();
  }

  function isDropdownOpen(wrapper) {
    const trigger = getNativeTrigger(wrapper);
    const content = getDropdownContent(wrapper);
    if (trigger && (trigger.hasAttribute('open') || trigger.getAttribute('aria-expanded') === 'true')) {
      return true;
    }
    if (content && content.hasAttribute('open')) {
      return true;
    }
    return getSortRadioButtons(wrapper).length >= 2;
  }

  function getSortRadioButtons(wrapper) {
    const content = getDropdownContent(wrapper);
    if (!content) {
      return [];
    }
    return Array.prototype.slice.call(content.querySelectorAll(SELECTORS.sortRadio));
  }

  function setSilentDropdown(wrapper, enabled) {
    if (!wrapper) {
      return;
    }
    if (enabled) {
      wrapper.classList.add(CLASS_SILENT_DROPDOWN);
    } else {
      wrapper.classList.remove(CLASS_SILENT_DROPDOWN);
    }
  }

  function openDropdown(wrapper) {
    const trigger = getNativeTrigger(wrapper);
    if (!trigger || isDropdownOpen(wrapper)) {
      return;
    }
    trigger.click();
  }

  function ensureDropdownClosed(wrapper) {
    if (isApplyingSort) {
      return;
    }
    const trigger = getNativeTrigger(wrapper);
    const content = getDropdownContent(wrapper);

    if (trigger && isDropdownOpen(wrapper)) {
      trigger.click();
    }
    if (trigger) {
      trigger.removeAttribute('open');
    }
    if (content) {
      content.removeAttribute('open');
    }
  }

  function findSortRadio(wrapper, optionLabel) {
    const config = getSortOptionConfig(optionLabel);
    const content = getDropdownContent(wrapper);
    let radios;
    let i;
    let radio;
    let input;
    let label;

    if (!content) {
      return null;
    }

    if (config) {
      const inputs = content.querySelectorAll(SELECTORS.sortInput);
      for (i = 0; i < inputs.length; i++) {
        input = inputs[i];
        if (input.getAttribute('value') === config.value) {
          radio = input.closest(SELECTORS.sortRadio);
          if (radio) {
            return radio;
          }
        }
      }
    }

    radios = getSortRadioButtons(wrapper);
    const target = normalizeText(optionLabel);
    for (i = 0; i < radios.length; i++) {
      label = getOptionLabelFromRadio(radios[i]);
      if (normalizeText(label) === target) {
        return radios[i];
      }
    }

    return null;
  }

  function getCurrentSortLabel(wrapper) {
    const trigger = getNativeTrigger(wrapper);
    if (trigger) {
      const dataText = trigger.getAttribute('data-text');
      if (dataText) {
        return dataText.trim();
      }
      const labelEl = trigger.querySelector(SELECTORS.nativeTriggerLabel);
      if (labelEl) {
        return labelEl.textContent.trim();
      }
    }

    const content = getDropdownContent(wrapper);
    let i;
    let radios;
    let aria;
    let checkedInput;

    if (content) {
      radios = content.querySelectorAll(SELECTORS.sortRadio);
      for (i = 0; i < radios.length; i++) {
        aria = radios[i].getAttribute('aria-label') || '';
        if (aria.indexOf('está selecionado') > -1 || aria.indexOf('esta selecionado') > -1) {
          return getOptionLabelFromRadio(radios[i]);
        }
      }
      checkedInput = content.querySelector('input[type="radio"][checked]');
      if (checkedInput) {
        return getOptionLabelFromRadio(checkedInput.closest(SELECTORS.sortRadio));
      }
    }

    return '';
  }

  function applySort(optionLabel, skipAnalytics) {
    const wrapper = findSortFilterWrapper();
    if (!wrapper || isApplyingSort) {
      return;
    }

    const current = getCurrentSortLabel(wrapper);
    if (normalizeText(current) === normalizeText(optionLabel)) {
      syncActivePill(wrapper, optionLabel);
      return;
    }

    const trigger = getNativeTrigger(wrapper);
    if (!trigger) {
      return;
    }

    isApplyingSort = true;
    setSilentDropdown(wrapper, true);
    openDropdown(wrapper);

    setTimeout(function () {
      const liveWrapper = findSortFilterWrapper();
      if (!liveWrapper) {
        isApplyingSort = false;
        setSilentDropdown(wrapper, false);
        return;
      }

      const radio = findSortRadio(liveWrapper, optionLabel);

      if (!radio) {
        console.log('[AT Filtros Hoteis] Opcao nao encontrada:', optionLabel);
        ensureDropdownClosed(liveWrapper);
        isApplyingSort = false;
        setSilentDropdown(liveWrapper, false);
        return;
      }

      radio.click();

      setTimeout(function () {
        const applied = normalizeText(getCurrentSortLabel(liveWrapper));
        const wanted = normalizeText(optionLabel);

        if (applied !== wanted) {
          radio.click();
        }

        setTimeout(function () {
          ensureDropdownClosed(liveWrapper);
          syncActivePill(liveWrapper, getCurrentSortLabel(liveWrapper));
          if (!skipAnalytics) {
            analyticsEvent(optionLabel);
          }
          isApplyingSort = false;
          setSilentDropdown(liveWrapper, false);
        }, AFTER_SELECT_MS);
      }, AFTER_SELECT_MS);
    }, OPEN_DELAY_MS);
  }

  function syncActivePill(wrapper, activeLabel) {
    const bar = wrapper.querySelector('.' + PILL_BAR_CLASS);
    if (!bar) {
      return;
    }

    const activeNorm = normalizeText(activeLabel);
    const pills = bar.querySelectorAll('.' + PILL_BTN_CLASS);
    let i;
    let btn;

    for (i = 0; i < pills.length; i++) {
      btn = pills[i];
      if (normalizeText(btn.getAttribute('data-sort-value')) === activeNorm) {
        btn.classList.add(PILL_ACTIVE_CLASS);
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove(PILL_ACTIVE_CLASS);
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  function bindGlobalPillClick() {
    if (window.__atHotelPillClickBound) {
      return;
    }
    window.__atHotelPillClickBound = true;

    document.addEventListener('click', function (event) {
      const pill = event.target.closest('.' + PILL_BTN_CLASS);
      if (!pill) {
        return;
      }
      const wrapper = pill.closest(SELECTORS.filterWrapper);
      if (!wrapper) {
        return;
      }
      const optionLabel = pill.getAttribute('data-sort-value');
      if (!optionLabel) {
        return;
      }
      applySort(optionLabel);
    });
  }

  function bindNativeObservers(wrapper) {
    if (wrapper.getAttribute(DATA_LISTENER) === '1') {
      return;
    }
    wrapper.setAttribute(DATA_LISTENER, '1');

    const trigger = getNativeTrigger(wrapper);
    if (!trigger) {
      return;
    }

    const observer = new MutationObserver(function () {
      if (isApplyingSort) {
        return;
      }
      const liveWrapper = findSortFilterWrapper();
      if (!liveWrapper) {
        return;
      }
      syncActivePill(liveWrapper, getCurrentSortLabel(liveWrapper));
    });

    observer.observe(trigger, {
      attributes: true,
      attributeFilter: ['data-text'],
      childList: true,
      subtree: true,
    });
  }

  function isMountHealthy(wrapper) {
    const bar = wrapper.querySelector('.' + PILL_BAR_CLASS);
    const trigger = getNativeTrigger(wrapper);

    if (!bar || !wrapper.contains(bar) || !trigger) {
      return false;
    }

    return bar.querySelectorAll('.' + PILL_BTN_CLASS).length === SORT_OPTIONS.length;
  }

  function getSortLabels() {
    const labels = [];
    let i;
    for (i = 0; i < SORT_OPTIONS.length; i++) {
      labels.push(SORT_OPTIONS[i].label);
    }
    return labels;
  }

  function mountSortPills(wrapper) {
    const filterRow = findSortFilterRow(wrapper);
    const nativeDropdown = wrapper.querySelector(SELECTORS.nativeDropdown);
    const sortOptions = getSortLabels();
    let bar = wrapper.querySelector('.' + PILL_BAR_CLASS);

    if (bar) {
      bar.remove();
    }

    bar = document.createElement('div');
    bar.className = PILL_BAR_CLASS;
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Ordenar resultados de hoteis');

    if (nativeDropdown && nativeDropdown.nextSibling) {
      wrapper.insertBefore(bar, nativeDropdown.nextSibling);
    } else {
      wrapper.appendChild(bar);
    }

    let i;
    let optionLabel;
    let btn;

    for (i = 0; i < sortOptions.length; i++) {
      optionLabel = sortOptions[i];
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = PILL_BTN_CLASS;
      btn.setAttribute('data-sort-value', optionLabel);
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = optionLabel;
      bar.appendChild(btn);
    }

    wrapper.classList.add('at-sort-pills-ready');
    if (filterRow) {
      filterRow.classList.add('at-sort-pills-ready');
    }

    bindGlobalPillClick();
    bindNativeObservers(wrapper);
    syncActivePill(wrapper, getCurrentSortLabel(wrapper));

    console.log(
      '[AT Filtros Hoteis] Pills injetadas (' +
        sortOptions.length +
        '): ' +
        sortOptions.join(', '),
    );
  }

  function injectSortPills(forceRemount) {
    const wrapper = findSortFilterWrapper();
    if (!wrapper || !getNativeTrigger(wrapper)) {
      return;
    }

    if (!forceRemount && wrapper.getAttribute(DATA_DONE) === '1' && isMountHealthy(wrapper)) {
      syncActivePill(wrapper, getCurrentSortLabel(wrapper));
      return;
    }

    wrapper.removeAttribute(DATA_DONE);
    wrapper.removeAttribute(DATA_LISTENER);

    const oldBar = wrapper.querySelector('.' + PILL_BAR_CLASS);
    if (oldBar) {
      oldBar.remove();
    }

    wrapper.setAttribute(DATA_DONE, '1');
    mountSortPills(wrapper);
  }

  function isLoading() {
    return !!document.querySelector(SELECTORS.loadingWrapper);
  }

  function run(forceRemount) {
    if (!isHotelPage() || isLoading() || isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      injectStyles();
      bindGlobalPillClick();
      injectSortPills(!!forceRemount);
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun(forceRemount) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
      run(forceRemount);
    }, 250);
  }

  function waitForContentReady(callback) {
    if (!isLoading()) {
      callback();
      return;
    }
    requestAnimationFrame(function () {
      waitForContentReady(callback);
    });
  }

  function startObserver() {
    if (sortObserver) {
      return;
    }

    sortObserver = new MutationObserver(function () {
      if (isApplyingSort) {
        return;
      }

      const loading = isLoading();

      if (loading) {
        listWasLoading = true;
        return;
      }

      if (listWasLoading) {
        listWasLoading = false;
        scheduleRun(true);
        return;
      }

      const wrapper = findSortFilterWrapper();
      if (!wrapper) {
        return;
      }

      if (!isMountHealthy(wrapper) || wrapper.getAttribute(DATA_DONE) !== '1') {
        scheduleRun(true);
      }
    });

    sortObserver.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (!isHotelPage()) {
      return;
    }
    waitForContentReady(function () {
      run();
      startObserver();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
