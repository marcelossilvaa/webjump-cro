(function () {
  'use strict';

  if (window.__atFiltrosVooMobileControleTracking) {
    return;
  }
  window.__atFiltrosVooMobileControleTracking = true;

  const PAGE_PATH_TARGET = '/selecao-voo';
  const MOBILE_MAX_WIDTH = 1023;
  const DATA_TRACKING_BOUND = 'data-at-voo-mobile-controle-tracking-bound';

  const SELECTORS = {
    tripFilterButton: '.trip-filter button',
    sortOption:
      '.css-1ox2bcj-option, [role="option"], [class*="-option"], [id*="react-select"][id*="option"]',
  };

  const SORT_OPTIONS = [
    'Mais cedo',
    'Menor preco',
    'Maior preco',
    'Mais rapido',
    'Mais tarde',
    'Voo direto',
    'Duracao',
  ];

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

  function analyticsEvent(eventLabel) {
    if (!eventLabel) {
      return;
    }

    const labelEvent = 'AT_filtros_voo_mobile_controle_clique ' + eventLabel;
    const s = window.s || (typeof window.s_gi === 'function' && window.s_gi('azul-novo-prod'));

    if (!s || typeof s.tl !== 'function') {
      return;
    }

    s.linkTrackVars = 'events,eVar82,eVar84';
    s.linkTrackEvents = 'event90';
    s.events = 'event90';
    s.eVar82 = labelEvent;
    s.eVar84 = 'AT_selecao_voo_mobile_controle';
    s.tl(true, 'o', 'target_activity_action');
  }

  function getSortOptionLabel(rawText) {
    const normalized = normalizeText(rawText);
    let i;

    for (i = 0; i < SORT_OPTIONS.length; i++) {
      if (normalizeText(SORT_OPTIONS[i]) === normalized) {
        return SORT_OPTIONS[i];
      }
    }

    return '';
  }

  function isSortOptionElement(el) {
    if (!el) {
      return false;
    }

    const role = el.getAttribute('role') || '';
    const id = el.id || '';
    const className = typeof el.className === 'string' ? el.className : '';

    if (role === 'option') {
      return true;
    }

    if (id.indexOf('react-select') > -1 && id.indexOf('option') > -1) {
      return true;
    }

    if (className.indexOf('-option') > -1 || className.indexOf('css-1ox2bcj-option') > -1) {
      return true;
    }

    return false;
  }

  function bindTracking() {
    if (document.body.getAttribute(DATA_TRACKING_BOUND) === '1') {
      return;
    }

    document.body.setAttribute(DATA_TRACKING_BOUND, '1');

    document.addEventListener(
      'click',
      function (event) {
        if (!isTargetPage() || !isMobileViewport()) {
          return;
        }

        const filterButton = event.target.closest(SELECTORS.tripFilterButton);
        if (filterButton) {
          analyticsEvent('filtros');
          return;
        }

        const sortOption = event.target.closest(SELECTORS.sortOption);
        if (!sortOption || !isSortOptionElement(sortOption)) {
          return;
        }

        const optionText = getSortOptionLabel(sortOption.textContent);
        if (!optionText) {
          return;
        }

        analyticsEvent('ordenacao_' + normalizeText(optionText).replace(/\s+/g, '_'));
      },
      true,
    );
  }

  function init() {
    if (!isTargetPage()) {
      return;
    }

    if (!document.body) {
      return;
    }

    bindTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
