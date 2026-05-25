(function () {
  'use strict';

  if (window.__atFiltrosVooMobileSortPills) {
    if (typeof window.__atFiltrosVooMobileRefresh === 'function') {
      window.__atFiltrosVooMobileRefresh();
    }
    return;
  }
  window.__atFiltrosVooMobileSortPills = true;

  let isProcessing = false;
  let isApplyingSort = false;
  let isMounting = false;
  let debounceTimer = null;
  let sortObserver = null;
  let headerObserver = null;
  let observedHeaderEl = null;
  let tripsLifecycleTimer = null;
  let observedTripsRootEl = null;
  let lastHeaderSignature = '';
  let headerWaitFrames = 0;
  let lastAppliedSortLabel = '';
  let forceDefaultOnNextMount = false;

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

  const DEFAULT_SORT_OPTION = 'Menor preço';

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
    bookingDateBtn:
      '.booking-calendar__cards button, [class*="booking-calendar"] button, [class*="BookingCalendar"] button',
  };

  const DATA_HEADER_OBS = 'data-at-voo-header-observed';

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
    const s = window.s || (typeof window.s_gi === 'function' && window.s_gi('azul-novo-prod'));
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
      '  color: rgb(96, 96, 96);' +
      '  cursor: pointer;' +
      '  display: inline-flex;' +
      '  flex-shrink: 0;' +
      '  font-family: inherit;' +
      '  font-size: 14px;' +
      '  justify-content: center;' +
      '  min-height: 28px;' +
      '  outline: none;' +
      '  padding: 0 8px;' +
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

  function ensureStylesInjected() {
    let style = document.getElementById(STYLE_ID);
    const css = getSortCss();

    if (
      style &&
      style.isConnected &&
      style.parentNode === document.head &&
      style.textContent === css
    ) {
      return;
    }

    if (style) {
      style.remove();
    }

    style = document.createElement('style');
    style.id = STYLE_ID;
    style.setAttribute('data-at-voo-sort-style', '1');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function findTripsHeader() {
    const headers = document.querySelectorAll(SELECTORS.tripsHeader);
    let i;
    let header;
    let fallback = null;

    for (i = 0; i < headers.length; i++) {
      header = headers[i];
      if (!header.isConnected) {
        continue;
      }
      if (!fallback) {
        fallback = header;
      }
      if (header.offsetParent !== null) {
        return header;
      }
    }

    return fallback;
  }

  function isMountHealthy() {
    const header = findTripsHeader();
    let bar;

    if (!header || !header.isConnected) {
      return false;
    }

    bar = header.querySelector('.' + PILL_BAR_CLASS);
    if (!bar || !header.contains(bar)) {
      return false;
    }

    return bar.querySelectorAll('.' + PILL_BTN_CLASS).length === SORT_OPTIONS.length;
  }

  function disconnectHeaderObserver() {
    if (headerObserver) {
      headerObserver.disconnect();
      headerObserver = null;
    }
    if (observedHeaderEl) {
      observedHeaderEl.removeAttribute(DATA_HEADER_OBS);
      observedHeaderEl = null;
    }
  }

  function bindHeaderObserver(header) {
    if (!header) {
      return;
    }

    if (
      observedHeaderEl === header &&
      header.getAttribute(DATA_HEADER_OBS) === '1' &&
      header.querySelector('.' + PILL_WRAP_CLASS)
    ) {
      return;
    }

    disconnectHeaderObserver();
    observedHeaderEl = header;
    header.setAttribute(DATA_HEADER_OBS, '1');

    headerObserver = new MutationObserver(function () {
      if (isApplyingSort || isMounting || isProcessing) {
        return;
      }
      if (!header.isConnected) {
        disconnectHeaderObserver();
        lastHeaderSignature = '';
        ensurePillsPresent();
        return;
      }
      if (!header.querySelector('.' + PILL_WRAP_CLASS) || shouldRemountPills()) {
        ensurePillsPresent();
      } else {
        hideNativeFilterButton();
      }
    });

    headerObserver.observe(header, { childList: true, subtree: true });
  }

  function bindBookingDateListeners() {
    if (window.__atVooBookingDateBound) {
      return;
    }
    window.__atVooBookingDateBound = true;

    document.addEventListener(
      'click',
      function (event) {
        if (!isTargetPage() || !isMobileViewport()) {
          return;
        }
        const btn = event.target.closest(SELECTORS.bookingDateBtn);
        if (!btn) {
          return;
        }
        ensurePillsPresent();
        setTimeout(ensurePillsPresent, 400);
        setTimeout(ensurePillsPresent, 900);
      },
      true,
    );
  }

  function getHeaderSignature(header) {
    const tripInfo = header.querySelector(SELECTORS.tripInfo);
    if (!tripInfo) {
      return '';
    }
    return (tripInfo.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function ensurePillsPresent() {
    if (!isTargetPage() || !isMobileViewport() || isApplyingSort || isMounting || isProcessing) {
      return;
    }

    ensureStylesInjected();

    const header = findTripsHeader();
    if (!header) {
      return;
    }

    const signature = getHeaderSignature(header);
    const headerReplaced = signature !== lastHeaderSignature;

    if (headerReplaced) {
      lastAppliedSortLabel = '';
      lastHeaderSignature = signature;
      disconnectHeaderObserver();
    }

    hideNativeFilterButton();

    if (!isMountHealthy() || headerReplaced) {
      forceDefaultOnNextMount = true;
      lastAppliedSortLabel = '';
      document.body.setAttribute(DATA_DONE, '1');
      mountSortPills();
      return;
    }

    bindHeaderObserver(header);
    syncActivePill(getDisplaySortLabel());
  }

  function ensureSortObserverConnected() {
    const tripsRoot = document.querySelector(SELECTORS.tripsRoot);
    const target = tripsRoot && tripsRoot.isConnected ? tripsRoot : document.body;

    if (sortObserver && observedTripsRootEl === target) {
      return;
    }

    if (sortObserver) {
      sortObserver.disconnect();
      sortObserver = null;
    }

    observedTripsRootEl = target;

    sortObserver = new MutationObserver(function () {
      if (isApplyingSort || isMounting || isProcessing || !isMobileViewport() || !isTargetPage()) {
        return;
      }
      ensurePillsPresent();
    });

    sortObserver.observe(target, { childList: true, subtree: true });
  }

  function startTripsLifecycleWatch() {
    if (tripsLifecycleTimer) {
      return;
    }

    tripsLifecycleTimer = setInterval(function () {
      if (!isTargetPage() || !isMobileViewport()) {
        return;
      }
      ensureSortObserverConnected();
      ensurePillsPresent();
    }, 250);
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

  function getDisplaySortLabel() {
    if (forceDefaultOnNextMount) {
      return DEFAULT_SORT_OPTION;
    }
    if (lastAppliedSortLabel) {
      return lastAppliedSortLabel;
    }
    const fromDom = getCurrentSortLabel();
    if (fromDom) {
      return fromDom;
    }
    return DEFAULT_SORT_OPTION;
  }

  function isSortAppliedInDom(optionLabel) {
    const fromDom = getCurrentSortLabel();
    if (!fromDom) {
      return false;
    }
    return normalizeText(fromDom) === normalizeText(optionLabel);
  }

  function scheduleDefaultSortApply() {
    let attempts = 0;
    const maxAttempts = 20;

    function attempt() {
      attempts += 1;
      if (attempts > maxAttempts) {
        return;
      }
      if (!isTargetPage() || !isMobileViewport() || isApplyingSort || isMounting) {
        setTimeout(attempt, 300);
        return;
      }
      const header = findTripsHeader();
      if (!header) {
        setTimeout(attempt, 300);
        return;
      }
      if (!document.querySelectorAll('.flight-card').length) {
        setTimeout(attempt, 300);
        return;
      }
      applySort(DEFAULT_SORT_OPTION, true, null, true);
    }

    setTimeout(attempt, 700);
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
        lastAppliedSortLabel = optionLabel;
        syncActivePill(optionLabel);
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

  function applySort(optionLabel, skipAnalytics, loadingPill, forceApply) {
    if (isApplyingSort) {
      return;
    }

    if (!forceApply && isSortAppliedInDom(optionLabel)) {
      lastAppliedSortLabel = optionLabel;
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

  function moveActivePillToFirst(bar, activeBtn) {
    if (!bar || !activeBtn || bar.firstChild === activeBtn) {
      if (bar) {
        bar.scrollLeft = 0;
      }
      return;
    }
    bar.insertBefore(activeBtn, bar.firstChild);
    bar.scrollLeft = 0;
  }

  function syncActivePill(activeLabel) {
    const header = findTripsHeader();
    if (!header) {
      return;
    }
    const bar = header.querySelector('.' + PILL_BAR_CLASS);
    if (!bar) {
      return;
    }
    const pills = bar.querySelectorAll('.' + PILL_BTN_CLASS);
    const activeNorm = normalizeText(activeLabel || getDisplaySortLabel());
    let i;
    let btn;
    let activeBtn = null;

    for (i = 0; i < pills.length; i++) {
      btn = pills[i];
      if (normalizeText(btn.getAttribute('data-sort-value')) === activeNorm) {
        btn.classList.add(PILL_ACTIVE_CLASS);
        btn.setAttribute('aria-pressed', 'true');
        activeBtn = btn;
      } else {
        btn.classList.remove(PILL_ACTIVE_CLASS);
        btn.setAttribute('aria-pressed', 'false');
      }
    }

    if (activeBtn) {
      moveActivePillToFirst(bar, activeBtn);
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
    return !isMountHealthy();
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

    ensureStylesInjected();
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
    bindHeaderObserver(header);

    const applyDefaultAfterMount = forceDefaultOnNextMount;
    const labelToShow = applyDefaultAfterMount ? DEFAULT_SORT_OPTION : getDisplaySortLabel();
    forceDefaultOnNextMount = false;
    syncActivePill(labelToShow);

    if (applyDefaultAfterMount) {
      scheduleDefaultSortApply();
    }

    isMounting = false;

    console.log('[AT Filtros Voo Mobile] Pills injetadas (' + SORT_OPTIONS.length + ' opcoes).');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ensurePillsPresent();
      });
    });
  }

  function injectSortPills(forceRemount) {
    const header = findTripsHeader();

    if (!header) {
      return;
    }

    if (!forceRemount && document.body.getAttribute(DATA_DONE) === '1' && isMountHealthy()) {
      hideNativeFilterButton();
      bindHeaderObserver(header);
      syncActivePill(getDisplaySortLabel());
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
      ensureStylesInjected();
      hideNativeFilterButton();
      bindGlobalPillClick();
      bindBookingDateListeners();
      startTripsLifecycleWatch();
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

  function init() {
    if (!isTargetPage() || !isMobileViewport()) {
      return;
    }
    startTripsLifecycleWatch();
    waitForHeader(function () {
      run();
      ensureSortObserverConnected();
      ensurePillsPresent();
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
    ensureStylesInjected();
    scheduleRun(false);
  });

  window.__atFiltrosVooMobileRefresh = function () {
    if (!isTargetPage() || !isMobileViewport()) {
      return;
    }
    ensureStylesInjected();
    ensureSortObserverConnected();
    ensurePillsPresent();
  };

  const headStyleGuard = new MutationObserver(function () {
    if (!isTargetPage() || !isMobileViewport()) {
      return;
    }
    if (!document.getElementById(STYLE_ID)) {
      ensureStylesInjected();
    }
  });

  if (document.head) {
    headStyleGuard.observe(document.head, { childList: true });
  }
})();
