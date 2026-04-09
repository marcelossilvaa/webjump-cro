(function () {
  'use strict';

  // =========================================================
  // EuroAtlantic (CONTROLE) - Evento de presença (operatedby/YU)
  // =========================================================
  let isProcessing = false;
  let debounceTimer = null;
  let hasSentEuroAtlanticPresenceEvent = false;

  const PAGE_PATH_TARGET = '/selecao-voo';
  const QUERY_PARAM_MONEY_PAYMENT = 'cc=BRL';

  const SELECTORS = {
    operatedByYUImg: 'img[src*="/operatedby/YU"], img[src*="operatedby/YU"]',
  };

  function onTargetPage() {
    const path = window.location && window.location.pathname ? window.location.pathname : '';
    const search = window.location && window.location.search ? window.location.search : '';
    return path.indexOf(PAGE_PATH_TARGET) !== -1 && search.indexOf(QUERY_PARAM_MONEY_PAYMENT) !== -1;
  }

  function debounce(fn, waitMs) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(fn, waitMs);
  }

  function analyticsSend(labelEvent, consolePrefix) {
    if (!labelEvent) {
      return;
    }

    try {
      console.log((consolePrefix || '[AT] EuroAtlantic Controle:') + ' Analytics event:', labelEvent);
      (function () {
        const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
        if (!s || typeof s.tl !== 'function') {
          return;
        }
        s.linkTrackVars = 'events,eVar82';
        s.linkTrackEvents = 'event90';
        s.events = 'event90';
        s.eVar82 = labelEvent;
        s.tl(true, 'o', 'target_activity_action');
      })();
    } catch (e) {
      // Silencioso para não quebrar o fluxo
    }
  }

  function hasEuroAtlanticFlightsOnScreen() {
    const yuLogo = document.querySelector(SELECTORS.operatedByYUImg);
    return !!yuLogo;
  }

  function maybeSendEuroAtlanticPresenceEvent() {
    if (hasSentEuroAtlanticPresenceEvent) {
      return;
    }
    if (!hasEuroAtlanticFlightsOnScreen()) {
      return;
    }
    hasSentEuroAtlanticPresenceEvent = true;
    analyticsSend('AT_euroatlantic_presence Exibido', '[AT] EuroAtlantic Controle:');
  }

  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      if (!onTargetPage()) {
        hasSentEuroAtlanticPresenceEvent = false;
        return;
      }

      maybeSendEuroAtlanticPresenceEvent();
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    debounce(run, 0);

    // Observa mudanças de rota / conteúdo (SPA)
    if (!window._euroAtlanticControleObserver) {
      let localTimer = null;
      const observer = new MutationObserver(function () {
        if (localTimer) {
          clearTimeout(localTimer);
        }
        localTimer = setTimeout(function () {
          debounce(run, 0);
        }, 150);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window._euroAtlanticControleObserver = observer;
    }
  }

  if (window.euroAtlanticControleInitialized) {
    return;
  }
  window.euroAtlanticControleInitialized = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

