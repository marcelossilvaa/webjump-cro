(function () {
  'use strict';

  if (window.__atFiltrosVooMobileSortPills) {
    return;
  }
  window.__atFiltrosVooMobileSortPills = true;

  let isProcessing = false;
  let isApplyingSort = false;
  let isMounting = false;
  let debounceTimer = null;
  let sortObserver = null;
  let listWasLoading = false;
  let headerWaitFrames = 0;

  const STYLE_ID = 'at-filtros-voo-mobile-sort-style';
  const DATA_DONE = 'data-at-voo-sort-pills-done';

  const PAGE_PATH_TARGET = '/selecao-voo';
  const MOBILE_MAX_WIDTH = 1023;
  const HEADER_WAIT_MAX_FRAMES = 300;

  const POLL_INTERVAL_MS = 35;
  const WAIT_MODAL_MS = 550;
  const WAIT_MENU_MS = 320;
  const AFTER_APPLY_MS = 160;
  const AFTER_CLOSE_MS = 120;

  const DEFAULT_SORT_OPTION = 'Mais cedo';

  const SORT_OPTIONS = [
    'Mais cedo',
    'Menor preço',
    'Maior preço',
    'Mais rápido',
    'Mais tarde',
    'Voo direto',
    'Duração',
  ];

  const KEY_STEPS = {
    'Mais cedo': 0,
    'Menor preço': 1,
    'Maior preço': 2,
    'Mais rápido': 3,
    'Mais tarde': 4,
    'Voo direto': 5,
    Duração: 6,
  };

  const SELECTORS = {
    tripsHeader: '.trips_header',
    tripInfo: '.trip-info',
    tripFilter: '.trip-filter',
    tripFilterBtn: '.trip-filter button',
    modalFilters: '#modal-filters',
    sortInput: '#sort-filter',
    sortControl: '.css-6yzkx4-control',
    sortDropdown: '.css-2b097c-container',
    sortSingleValue: '[class*="singleValue"]',
    sortMenu: '[class*="menu"]',
    sortMenuOption: '[class*="1ox2bcj-option"]',
    applyFiltersBtn: '#modal-filters .modal-content__footer button',
    tripsRoot: '.AzulPage .availability .trips',
  };

  const PILL_WRAP_CLASS = 'at-voo-sort-wrap';
  const PILL_BAR_CLASS = 'at-voo-sort-pills';
  const PILL_BTN_CLASS = 'at-voo-sort-pill';
  const PILL_ACTIVE_CLASS = 'at-voo-sort-pill--active';
  const PILL_LOADING_CLASS = 'at-voo-sort-pill--loading';
  const PILL_BAR_BUSY_CLASS = 'at-voo-sort-pills--busy';
  const CLASS_SILENT_MODAL = 'at-voo-sort-modal-silent';

  function isTargetPage() {
    return (window.location.pathname || '').indexOf(PAGE_PATH_TARGET) > -1;
  }

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_MAX_WIDTH;
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

  function analyticsEvent(optionLabel) {
    if (!optionLabel) {
      return;
    }
    const labelEvent = 'AT_filtros_voo_mobile_ordenacao_clique ' + optionLabel;
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
    s.eVar84 = 'AT_selecao_voo_mobile';
    s.tl(true, 'o', 'target_activity_action');
  }

  function getSortCss() {
    return (
      '.trips_header .' +
      SELECTORS.tripFilter.replace('.', '') +
      ' {' +
      '  display: none !important;' +
      '}' +
      '.trips_header.' +
      PILL_WRAP_CLASS +
      '-ready {' +
      '  flex-wrap: wrap;' +
      '  align-items: flex-start;' +
      '  margin-bottom: 0px;' +
      '}' +
      '.' +
      PILL_WRAP_CLASS +
      ' {' +
      '  width: 100%;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  gap: 6px;' +
      '  margin-top: 4px;' +
      '}' +
      '.' +
      PILL_WRAP_CLASS +
      '__label {' +
      '  font-size: 12px;' +
      '  font-weight: 600;' +
      '  color: #fff;' +
      '  margin: 0;' +
      '}' +
      '.' +
      PILL_BAR_CLASS +
      ' {' +
      '  display: flex;' +
      '  flex-wrap: nowrap;' +
      '  gap: 6px;' +
      '  width: 100%;' +
      '  overflow-x: auto;' +
      '  -webkit-overflow-scrolling: touch;' +
      '  scrollbar-width: none;' +
      '  padding-bottom: 2px;' +
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
      '  font-size: 11px;' +
      '  font-weight: 600;' +
      '  justify-content: center;' +
      '  min-height: 28px;' +
      '  outline: none;' +
      '  padding: 0 10px;' +
      '  white-space: nowrap;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      '.' +
      PILL_ACTIVE_CLASS +
      ' {' +
      '  background-color: #026cb6;' +
      '  border-color: #026cb6;' +
      '  color: #fff;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      ':disabled {' +
      '  opacity: 0.55;' +
      '  cursor: default;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      '.' +
      PILL_LOADING_CLASS +
      ' {' +
      '  position: relative;' +
      '  color: transparent !important;' +
      '  font-size: 0;' +
      '  line-height: 0;' +
      '  min-width: 72px;' +
      '  cursor: wait;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      '.' +
      PILL_LOADING_CLASS +
      '::after {' +
      '  content: "";' +
      '  position: absolute;' +
      '  left: 50%;' +
      '  top: 50%;' +
      '  width: 14px;' +
      '  height: 14px;' +
      '  margin: 0;' +
      '  border: 2px solid #026cb6;' +
      '  border-top-color: transparent;' +
      '  border-radius: 50%;' +
      '  box-sizing: border-box;' +
      '  transform: translate(-50%, -50%);' +
      '  animation: at-voo-sort-spin 0.65s linear infinite;' +
      '}' +
      '.' +
      PILL_BTN_CLASS +
      '.' +
      PILL_ACTIVE_CLASS +
      '.' +
      PILL_LOADING_CLASS +
      '::after {' +
      '  border-color: #fff;' +
      '  border-top-color: transparent;' +
      '}' +
      '@keyframes at-voo-sort-spin {' +
      '  to { transform: translate(-50%, -50%) rotate(360deg); }' +
      '}' +
      'body.' +
      CLASS_SILENT_MODAL +
      ' #modal-filters,' +
      'body.' +
      CLASS_SILENT_MODAL +
      ' .ReactModal__Overlay--after-open {' +
      '  visibility: hidden !important;' +
      '  opacity: 0 !important;' +
      '}' +
      'body.' +
      CLASS_SILENT_MODAL +
      ' #modal-filters {' +
      '  position: fixed !important;' +
      '  left: 0 !important;' +
      '  top: 0 !important;' +
      '  pointer-events: auto !important;' +
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

  function findTripsHeader() {
    return document.querySelector(SELECTORS.tripsHeader);
  }

  function getModal() {
    return document.getElementById('modal-filters');
  }

  function getSortInput() {
    const modal = getModal();
    if (modal) {
      return modal.querySelector(SELECTORS.sortInput);
    }
    return document.querySelector(SELECTORS.sortInput);
  }

  function getSortDropdownRoot() {
    const input = getSortInput();
    if (!input) {
      return null;
    }
    return input.closest(SELECTORS.sortDropdown) || input.parentElement;
  }

  function getCurrentSortLabel() {
    const root = getSortDropdownRoot();
    if (root) {
      const single = root.querySelector(SELECTORS.sortSingleValue);
      if (single && single.textContent) {
        return single.textContent.trim();
      }
    }
    return '';
  }

  function resolveActiveSortLabel() {
    const current = getCurrentSortLabel();
    if (current) {
      return current;
    }
    return DEFAULT_SORT_OPTION;
  }

  function hideNativeFilterButton() {
    const tripFilter = document.querySelector(SELECTORS.tripFilter);
    if (tripFilter) {
      tripFilter.setAttribute('data-at-voo-filter-hidden', '1');
      tripFilter.style.setProperty('display', 'none', 'important');
    }
  }

  function waitUntil(getValue, maxMs, done) {
    const start = Date.now();

    function tick() {
      let value = null;
      try {
        value = getValue();
      } catch (e) {
        value = null;
      }
      if (value) {
        done(value);
        return;
      }
      if (Date.now() - start >= maxMs) {
        done(null);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    }

    tick();
  }

  function setPillLoading(pill, loading) {
    const header = findTripsHeader();
    const bar = header ? header.querySelector('.' + PILL_BAR_CLASS) : null;
    if (!bar) {
      return;
    }

    const pills = bar.querySelectorAll('.' + PILL_BTN_CLASS);
    let i;

    for (i = 0; i < pills.length; i++) {
      pills[i].classList.remove(PILL_LOADING_CLASS);
      pills[i].disabled = false;
      pills[i].removeAttribute('aria-busy');
    }
    bar.classList.remove(PILL_BAR_BUSY_CLASS);

    if (!loading || !pill) {
      return;
    }

    bar.classList.add(PILL_BAR_BUSY_CLASS);
    pill.classList.add(PILL_LOADING_CLASS);
    pill.setAttribute('aria-busy', 'true');

    for (i = 0; i < pills.length; i++) {
      if (pills[i] !== pill) {
        pills[i].disabled = true;
      }
    }
  }

  function clearPillLoading() {
    setPillLoading(null, false);
  }

  function simulateKey(el, key) {
    const code = key === 'Enter' ? 13 : 40;
    el.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: key,
        code: key,
        keyCode: code,
        which: code,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  function setSilentModal(enabled) {
    if (enabled) {
      document.body.classList.add(CLASS_SILENT_MODAL);
    } else {
      document.body.classList.remove(CLASS_SILENT_MODAL);
    }
  }

  function isModalOpen() {
    const modal = getModal();
    return !!(modal && modal.classList.contains('ReactModal__Content--after-open'));
  }

  function openFiltersModal() {
    if (isModalOpen()) {
      return;
    }
    const btn = document.querySelector(SELECTORS.tripFilterBtn);
    if (btn) {
      btn.click();
    }
  }

  function closeFiltersModal() {
    if (!isModalOpen()) {
      return;
    }
    const modal = getModal();
    if (!modal) {
      return;
    }
    const closeBtn = modal.querySelector('.modal-content__header button');
    if (closeBtn) {
      closeBtn.click();
    }
  }

  function clickApplyFiltersButton() {
    const modal = getModal();
    if (!modal) {
      return;
    }
    const buttons = modal.querySelectorAll(SELECTORS.applyFiltersBtn);
    let i;
    let btn;
    let text;
    for (i = 0; i < buttons.length; i++) {
      btn = buttons[i];
      text = (btn.textContent || '').trim();
      if (text.indexOf('Aplicar filtros') > -1) {
        btn.click();
        return;
      }
    }
  }

  function findModalSortOption(optionLabel) {
    const modal = getModal();
    if (!modal) {
      return null;
    }
    const target = normalizeText(optionLabel);
    const menu = modal.querySelector(SELECTORS.sortMenu);
    const scope = menu || modal;
    const options = scope.querySelectorAll(SELECTORS.sortMenuOption);
    let i;
    let opt;
    let text;
    for (i = 0; i < options.length; i++) {
      opt = options[i];
      text = normalizeText(opt.textContent);
      if (text === target) {
        return opt;
      }
    }
    return null;
  }

  function openSortMenu(input) {
    const root = input.closest(SELECTORS.sortDropdown);
    if (root) {
      const control = root.querySelector(SELECTORS.sortControl);
      if (control) {
        control.click();
      }
    }
    input.focus();
    simulateKey(input, 'ArrowDown');
  }

  function applySortWithKeyboard(input, optionLabel, onDone) {
    const curIdx = SORT_OPTIONS.indexOf(getCurrentSortLabel());
    const tgtIdx = SORT_OPTIONS.indexOf(optionLabel);
    let i;
    let dir;

    if (tgtIdx >= 0 && curIdx >= 0) {
      const delta = tgtIdx - curIdx;
      dir = delta > 0 ? 'ArrowDown' : 'ArrowUp';
      for (i = 0; i < Math.abs(delta); i++) {
        simulateKey(input, dir);
      }
    } else if (tgtIdx >= 0 && KEY_STEPS[optionLabel] !== undefined) {
      const steps = KEY_STEPS[optionLabel];
      for (i = 0; i < steps; i++) {
        simulateKey(input, 'ArrowDown');
      }
    }
    simulateKey(input, 'Enter');

    if (typeof onDone === 'function') {
      setTimeout(onDone, AFTER_APPLY_MS);
    }
  }

  function selectSortOption(input, optionLabel, onDone) {
    openSortMenu(input);

    waitUntil(
      function () {
        return findModalSortOption(optionLabel);
      },
      WAIT_MENU_MS,
      function (menuOpt) {
        if (menuOpt) {
          menuOpt.click();
          if (typeof onDone === 'function') {
            onDone();
          }
          return;
        }
        applySortWithKeyboard(input, optionLabel, onDone);
      },
    );
  }

  function finishApplySort(optionLabel, skipAnalytics) {
    setTimeout(function () {
      clickApplyFiltersButton();
      setTimeout(function () {
        closeFiltersModal();
        syncActivePill(optionLabel || resolveActiveSortLabel());
        clearPillLoading();
        if (!skipAnalytics) {
          analyticsEvent(optionLabel);
        }
        isApplyingSort = false;
        setSilentModal(false);
      }, AFTER_CLOSE_MS);
    }, AFTER_APPLY_MS);
  }

  function abortApplySort() {
    clearPillLoading();
    closeFiltersModal();
    isApplyingSort = false;
    setSilentModal(false);
  }

  function applySort(optionLabel, skipAnalytics, loadingPill) {
    if (isApplyingSort) {
      return;
    }

    const current = resolveActiveSortLabel();
    if (normalizeText(current) === normalizeText(optionLabel)) {
      syncActivePill(optionLabel);
      return;
    }

    isApplyingSort = true;
    setPillLoading(loadingPill, true);
    setSilentModal(true);
    openFiltersModal();

    waitUntil(
      function () {
        if (!getSortInput()) {
          return null;
        }
        return getSortInput();
      },
      WAIT_MODAL_MS,
      function (input) {
        if (!input) {
          console.log('[AT Filtros Voo Mobile] #sort-filter indisponivel no modal.');
          abortApplySort();
          return;
        }

        selectSortOption(input, optionLabel, function () {
          finishApplySort(optionLabel, skipAnalytics);
        });
      },
    );
  }

  function syncActivePill(activeLabel) {
    const header = findTripsHeader();
    if (!header) {
      return;
    }
    const pills = header.querySelectorAll('.' + PILL_BTN_CLASS);
    const activeNorm = normalizeText(activeLabel || resolveActiveSortLabel());
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
    if (window.__atVooMobilePillClickBound) {
      return;
    }
    window.__atVooMobilePillClickBound = true;

    document.addEventListener(
      'click',
      function (event) {
        const pill = event.target.closest('.' + PILL_BTN_CLASS);
        if (!pill) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const optionLabel = pill.getAttribute('data-sort-value');
        if (!optionLabel) {
          return;
        }
        applySort(optionLabel, false, pill);
      },
      true,
    );
  }

  function shouldRemountPills() {
    const header = findTripsHeader();
    if (!header) {
      return false;
    }
    const bar = header.querySelector('.' + PILL_BAR_CLASS);
    if (!bar) {
      return true;
    }
    return bar.querySelectorAll('.' + PILL_BTN_CLASS).length !== SORT_OPTIONS.length;
  }

  function mountSortPills() {
    const header = findTripsHeader();
    const tripInfo = header ? header.querySelector(SELECTORS.tripInfo) : null;
    let wrap = header ? header.querySelector('.' + PILL_WRAP_CLASS) : null;
    let bar;
    let i;
    let optionLabel;
    let btn;

    if (!header) {
      return;
    }

    isMounting = true;

    if (wrap) {
      wrap.remove();
    }

    wrap = document.createElement('div');
    wrap.className = PILL_WRAP_CLASS;

    const labelEl = document.createElement('p');
    labelEl.className = PILL_WRAP_CLASS + '__label';
    labelEl.textContent = 'Ordenado por:';
    wrap.appendChild(labelEl);

    bar = document.createElement('div');
    bar.className = PILL_BAR_CLASS;
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Ordenar resultados de voos');

    for (i = 0; i < SORT_OPTIONS.length; i++) {
      optionLabel = SORT_OPTIONS[i];
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = PILL_BTN_CLASS;
      btn.setAttribute('data-sort-value', optionLabel);
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = optionLabel;
      bar.appendChild(btn);
    }

    wrap.appendChild(bar);

    if (tripInfo && tripInfo.nextSibling) {
      header.insertBefore(wrap, tripInfo.nextSibling);
    } else {
      header.appendChild(wrap);
    }

    header.classList.add(PILL_WRAP_CLASS + '-ready');
    hideNativeFilterButton();
    syncActivePill(resolveActiveSortLabel());

    isMounting = false;

    console.log(
      '[AT Filtros Voo Mobile] Pills injetadas (' + SORT_OPTIONS.length + ' opcoes).',
    );
  }

  function injectSortPills(forceRemount) {
    if (!findTripsHeader()) {
      return;
    }

    if (!forceRemount && document.body.getAttribute(DATA_DONE) === '1' && !shouldRemountPills()) {
      hideNativeFilterButton();
      syncActivePill(resolveActiveSortLabel());
      return;
    }

    document.body.setAttribute(DATA_DONE, '1');
    mountSortPills();
  }

  function isListLoading() {
    const header = findTripsHeader();
    if (!header) {
      return true;
    }
    return !header.offsetParent;
  }

  function run(forceRemount) {
    if (!isTargetPage() || !isMobileViewport() || isProcessing || isApplyingSort) {
      return;
    }
    if (isListLoading() && !forceRemount) {
      return;
    }
    isProcessing = true;
    try {
      injectStyles();
      hideNativeFilterButton();
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
    }, 300);
  }

  function waitForHeader(callback) {
    headerWaitFrames += 1;
    if (headerWaitFrames > HEADER_WAIT_MAX_FRAMES) {
      return;
    }
    if (findTripsHeader() && !isListLoading()) {
      callback();
      return;
    }
    requestAnimationFrame(function () {
      waitForHeader(callback);
    });
  }

  function startObserver() {
    if (sortObserver) {
      return;
    }

    const root = document.querySelector(SELECTORS.tripsRoot) || document.body;

    sortObserver = new MutationObserver(function (mutations) {
      if (isApplyingSort || isMounting || isProcessing || !isMobileViewport() || !isTargetPage()) {
        return;
      }

      let headerChanged = false;
      let i;
      let m;
      for (i = 0; i < mutations.length; i++) {
        m = mutations[i];
        if (m.type === 'childList') {
          headerChanged = true;
          break;
        }
      }

      if (!headerChanged) {
        return;
      }

      const loading = isListLoading();

      if (loading) {
        listWasLoading = true;
        return;
      }

      if (listWasLoading) {
        listWasLoading = false;
        scheduleRun(true);
        return;
      }

      if (shouldRemountPills()) {
        scheduleRun(true);
      } else {
        hideNativeFilterButton();
      }
    });

    sortObserver.observe(root, { childList: true, subtree: true });
  }

  function init() {
    if (!isTargetPage() || !isMobileViewport()) {
      return;
    }
    waitForHeader(function () {
      run();
      startObserver();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function () {
    if (!isMobileViewport()) {
      return;
    }
    scheduleRun(false);
  });
})();
