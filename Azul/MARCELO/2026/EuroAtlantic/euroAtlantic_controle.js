(function () {
  'use strict';

  // =========================================================
  // EuroAtlantic (CONTROLE) v2 - Evento de presença (operatedby/YU)
  // =========================================================
  let isProcessing = false;
  let debounceTimer = null;
  let hasSentEuroAtlanticPresenceEvent = false;

  const PAGE_PATH_TARGET = '/selecao-voo';
  const QUERY_PARAM_MONEY_PAYMENT = 'cc=BRL';

  const SELECTORS = {
    operatedByYUImg: 'img[src*="/operatedby/YU"], img[src*="operatedby/YU"]',
  };

  // =========================================================
  // Cache de journeys operados por YU (EuroAtlantic) via API
  // =========================================================
  window.AT_EA_YU_JOURNEYS = window.AT_EA_YU_JOURNEYS || {};

  function processAvailabilityPayload(payload) {
    try {
      const trips = (payload && payload.data && payload.data.trips) || payload.trips || [];
      for (let t = 0; t < trips.length; t += 1) {
        const journeys = trips[t].journeys || [];
        for (let j = 0; j < journeys.length; j += 1) {
          const journey = journeys[j];
          if (!journey || !journey.journeyKey) continue;

          let isYU = false;
          if (journey.identifier && journey.identifier.operatedBy === 'YU') {
            isYU = true;
          }

          if (!isYU && journey.segments) {
            for (let s = 0; s < journey.segments.length; s += 1) {
              const seg = journey.segments[s];
              if (seg && seg.identifier && seg.identifier.operatedBy === 'YU') {
                isYU = true;
                break;
              }
              if (seg && seg.equipment && seg.equipment.suffix === 'YU') {
                isYU = true;
                break;
              }
            }
          }

          if (isYU) {
            window.AT_EA_YU_JOURNEYS[journey.journeyKey] = true;
          }
        }
      }
    } catch (e) {
      // Silencioso
    }
  }

  function installAvailabilityInterceptors() {
    if (window._atEaAvailabilityInterceptedControle) return;
    window._atEaAvailabilityInterceptedControle = true;

    // Hook no XHR
    const origOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
    if (typeof origOpen === 'function') {
      window.XMLHttpRequest.prototype.open = function (method, url) {
        this.addEventListener('load', function () {
          try {
            if (typeof url === 'string' && url.indexOf('availability') !== -1) {
              const resp = JSON.parse(this.responseText);
              processAvailabilityPayload(resp);
              debounce(run, 0);
            }
          } catch (e) {
            // Silencioso
          }
        });
        return origOpen.apply(this, arguments);
      };
    }

    // Hook no Fetch
    const origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = async function (...args) {
        const response = await origFetch(...args);
        try {
          const req = args && args.length ? args[0] : null;
          const url =
            req && typeof req === 'string'
              ? req
              : req && typeof req.url === 'string'
                ? req.url
                : req
                  ? String(req)
                  : '';
          if (url.indexOf('availability') !== -1) {
            const clone = response.clone();
            clone
              .json()
              .then(function (data) {
                processAvailabilityPayload(data);
                debounce(run, 0);
              })
              .catch(function () {});
          }
        } catch (e) {
          // Silencioso
        }
        return response;
      };
    }
  }

  function onTargetPage() {
    const path = window.location && window.location.pathname ? window.location.pathname : '';
    const search = window.location && window.location.search ? window.location.search : '';
    return (
      path.indexOf(PAGE_PATH_TARGET) !== -1 && search.indexOf(QUERY_PARAM_MONEY_PAYMENT) !== -1
    );
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
      console.log(
        (consolePrefix || '[AT] EuroAtlantic Controle:') + ' Analytics event:',
        labelEvent,
      );
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
    try {
      if (window.AT_EA_YU_JOURNEYS && Object.keys(window.AT_EA_YU_JOURNEYS).length > 0) {
        return true;
      }
    } catch (e) {
      // Silencioso
    }
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
    installAvailabilityInterceptors();
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
