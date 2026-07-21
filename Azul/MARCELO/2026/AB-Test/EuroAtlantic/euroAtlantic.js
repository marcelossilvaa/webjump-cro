(function () {
  'use strict';

  // =========================================================
  // EuroAtlantic v4 - Modal ao selecionar tarifa (operatedby/YU)
  // =========================================================
  let isProcessing = false;
  let debounceTimer = null;

  const PAGE_PATH_TARGET = '/selecao-voo';
  const PAGE_PATH_MY_TRIPS = '/minhas-viagens';
  const QUERY_PARAM_MONEY_PAYMENT = 'cc=BRL';

  const STYLE_ID = 'at-euroatlantic-modal-style';
  const OVERLAY_ID = 'at-euroatlantic-modal-overlay';
  const BG_PRELOAD_ID = 'at-euroatlantic-modal-bg-preload';
  const MODAL_BG_URL = 'https://i.imgur.com/lqJsA3T.png';

  const SELECTORS = {
    selectFareButton: '[data-test-id="select-fare"]',
    flightCard: '.flight-card',
    operatedByYUImg: 'img[src*="/operatedby/YU"], img[src*="operatedby/YU"]',
  };

  let pendingOriginalButton = null;
  let hasSentEuroAtlanticPresenceEvent = false;
  const MODAL_SESSION_KEY = 'at_euroatlantic_modal_shown';
  const MODAL_MY_TRIPS_SESSION_KEY = 'at_euroatlantic_modal_my_trips_shown';
  let isBgReady = false;
  let currentModalContext = 'selecao-voo';
  let currentModalMode = 'selection';

  // =========================================================
  // Cache de journeys operados por YU (EuroAtlantic) via API
  // =========================================================
  window.AT_EA_YU_JOURNEYS = window.AT_EA_YU_JOURNEYS || {};
  // Modo produção (Target): sem logs extras e sem heurísticas pesadas.
  const DEBUG_MODE = false;

  function addYuJourneyKey(journeyKey) {
    if (!journeyKey) return;
    if (!window.AT_EA_YU_JOURNEYS[journeyKey]) {
      window.AT_EA_YU_JOURNEYS[journeyKey] = true;
    }
  }

  function safeStringIncludes(haystack, needle) {
    try {
      return String(haystack).indexOf(needle) !== -1;
    } catch (e) {
      return false;
    }
  }

  // Heurística leve (fallback) para o caso do Target entrar tarde e não interceptar availability.
  // Procura por objetos que contenham { journeyKey, operatedBy: 'YU' } em estados globais comuns.
  function ensureYuCacheFromPageState() {
    try {
      const cacheCount = Object.keys(window.AT_EA_YU_JOURNEYS || {}).length;
      if (cacheCount > 0) return;

      const now = Date.now();
      if (window._atEaYuPageStateLastRun && now - window._atEaYuPageStateLastRun < 1200) return;
      window._atEaYuPageStateLastRun = now;

      const roots = [];
      try {
        if (window.__APOLLO_STATE__) roots.push(window.__APOLLO_STATE__);
      } catch (e) {}
      try {
        if (window.__PRELOADED_STATE__) roots.push(window.__PRELOADED_STATE__);
      } catch (e) {}
      try {
        if (window.__INITIAL_STATE__) roots.push(window.__INITIAL_STATE__);
      } catch (e) {}
      try {
        if (window.__NEXT_DATA__) roots.push(window.__NEXT_DATA__);
      } catch (e) {}

      if (!roots.length) return;

      const seen = new Set();
      const queue = [];
      for (let i = 0; i < roots.length; i += 1) {
        queue.push({ v: roots[i], d: 0 });
      }

      const MAX_NODES = 5000;
      const MAX_DEPTH = 8;
      let nodes = 0;

      while (queue.length && nodes < MAX_NODES) {
        const item = queue.shift();
        nodes += 1;
        if (!item || !item.v) continue;
        const v = item.v;
        const d = item.d;
        if (typeof v !== 'object') continue;
        if (seen.has(v)) continue;
        seen.add(v);

        try {
          const jk = v.journeyKey;
          const op = v.operatedBy || (v.identifier && v.identifier.operatedBy);
          if (jk && op === 'YU') {
            addYuJourneyKey(jk);
          }
        } catch (e) {
          // ignora
        }

        if (d >= MAX_DEPTH) continue;

        if (Array.isArray(v)) {
          for (let i = 0; i < v.length; i += 1) {
            const child = v[i];
            if (child && typeof child === 'object' && !seen.has(child)) {
              queue.push({ v: child, d: d + 1 });
            }
          }
          continue;
        }

        for (const k in v) {
          if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
          const child = v[k];
          if (!child || typeof child !== 'object') continue;
          if (seen.has(child)) continue;
          queue.push({ v: child, d: d + 1 });
        }
      }
    } catch (e) {
      // silencioso
    }
  }

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
    if (window._atEaAvailabilityIntercepted) return;
    window._atEaAvailabilityIntercepted = true;

    // Guarda a última requisição (url + body) para replay se o Target entrar tarde.
    window.AT_EA_LAST_AVAILABILITY_REQUEST = window.AT_EA_LAST_AVAILABILITY_REQUEST || null;
    window.AT_EA_AVAILABILITY_REPLAY_IN_FLIGHT =
      window.AT_EA_AVAILABILITY_REPLAY_IN_FLIGHT || false;

    // Hook no XHR
    const origOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
    const origSend = window.XMLHttpRequest && window.XMLHttpRequest.prototype.send;
    const origSetHeader = window.XMLHttpRequest && window.XMLHttpRequest.prototype.setRequestHeader;
    if (typeof origOpen === 'function') {
      window.XMLHttpRequest.prototype.open = function (method, url) {
        try {
          this.__atEaMethod = method;
          this.__atEaUrl = url;
          this.__atEaHeaders = {};
        } catch (e) {
          // Silencioso
        }
        this.addEventListener('load', function () {
          try {
            if (typeof url === 'string' && url.indexOf('availability') !== -1) {
              const resp = JSON.parse(this.responseText);
              processAvailabilityPayload(resp);
              if (DEBUG_MODE && window.AT_EA_YU_JOURNEYS) {
                console.log(
                  '[AT] EuroAtlantic: availability XHR interceptado. cache=' +
                    Object.keys(window.AT_EA_YU_JOURNEYS).length,
                );
              }
            }
          } catch (e) {
            // Silencioso
          }
        });
        return origOpen.apply(this, arguments);
      };
    }

    if (typeof origSetHeader === 'function') {
      window.XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        try {
          if (this.__atEaHeaders && name) {
            this.__atEaHeaders[String(name).toLowerCase()] = String(value);
          }
        } catch (e) {
          // Silencioso
        }
        return origSetHeader.apply(this, arguments);
      };
    }

    if (typeof origSend === 'function') {
      window.XMLHttpRequest.prototype.send = function (body) {
        try {
          const url = this.__atEaUrl;
          const method = this.__atEaMethod;
          if (typeof url === 'string' && url.indexOf('availability') !== -1) {
            // body costuma ser JSON.stringify(...)
            window.AT_EA_LAST_AVAILABILITY_REQUEST = {
              method: method || 'POST',
              url,
              body: typeof body === 'string' ? body : null,
              headers: this.__atEaHeaders || null,
              ts: Date.now(),
              source: 'xhr',
            };
            if (DEBUG_MODE) {
              try {
                console.log(
                  '[AT] EuroAtlantic: availability request capturado (xhr). bodyLen=' +
                    (typeof body === 'string' ? body.length : 0),
                );
              } catch (e) {
                // Silencioso
              }
            }
          }
        } catch (e) {
          // Silencioso
        }
        return origSend.apply(this, arguments);
      };
    }

    // Hook no Fetch
    const origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = async function (...args) {
        // Captura request para replay (quando possível)
        try {
          const req = args && args.length ? args[0] : null;
          const init = args && args.length > 1 ? args[1] : null;
          const url =
            req && typeof req === 'string'
              ? req
              : req && typeof req.url === 'string'
                ? req.url
                : req
                  ? String(req)
                  : '';

          const method = (init && init.method) || (req && req.method) || 'GET';
          const headers = (init && init.headers) || (req && req.headers) || null;

          // body pode estar em init.body (string) ou dentro de Request (stream). Vamos tentar capturar.
          let body = init && typeof init.body === 'string' ? init.body : null;
          if (!body && req && typeof req.clone === 'function') {
            try {
              const cloneReq = req.clone();
              if (cloneReq && typeof cloneReq.text === 'function') {
                cloneReq
                  .text()
                  .then(function (txt) {
                    if (!txt) return;
                    if (
                      window.AT_EA_LAST_AVAILABILITY_REQUEST &&
                      window.AT_EA_LAST_AVAILABILITY_REQUEST.url === url &&
                      !window.AT_EA_LAST_AVAILABILITY_REQUEST.body
                    ) {
                      window.AT_EA_LAST_AVAILABILITY_REQUEST.body = txt;
                    }
                  })
                  .catch(function () {});
              }
            } catch (e) {
              // Silencioso
            }
          }

          if (typeof url === 'string' && url.indexOf('availability') !== -1) {
            window.AT_EA_LAST_AVAILABILITY_REQUEST = {
              method,
              url,
              body,
              headers,
              ts: Date.now(),
              source: 'fetch',
            };
            if (DEBUG_MODE) {
              try {
                console.log(
                  '[AT] EuroAtlantic: availability request capturado (fetch). bodyLen=' +
                    (body ? body.length : 0),
                );
              } catch (e) {
                // Silencioso
              }
            }
          }
        } catch (e) {
          // Silencioso
        }

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
                if (DEBUG_MODE && window.AT_EA_YU_JOURNEYS) {
                  console.log(
                    '[AT] EuroAtlantic: availability fetch interceptado. cache=' +
                      Object.keys(window.AT_EA_YU_JOURNEYS).length,
                  );
                }
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

  function replayAvailabilityOnce(onDone) {
    try {
      if (window.AT_EA_AVAILABILITY_REPLAY_IN_FLIGHT) {
        if (typeof onDone === 'function') onDone(false);
        return;
      }

      const req = window.AT_EA_LAST_AVAILABILITY_REQUEST;
      if (!req || !req.url) {
        if (typeof onDone === 'function') onDone(false);
        return;
      }

      // Se não temos body (Request stream), não tentamos replay pra evitar request inválido.
      if (!req.body) {
        console.log(
          '[AT] EuroAtlantic: replay indisponível (body não capturado). source=' +
            (req.source || 'N/A'),
        );
        if (typeof onDone === 'function') onDone(false);
        return;
      }

      console.log(
        '[AT] EuroAtlantic: replay availability iniciado. source=' +
          (req.source || 'N/A') +
          ' bodyLen=' +
          (req.body ? req.body.length : 0),
      );
      window.AT_EA_AVAILABILITY_REPLAY_IN_FLIGHT = true;

      const headers = {};
      try {
        // Copia headers capturados (se houver) para aumentar chance de resposta igual ao app.
        if (req.headers) {
          if (typeof req.headers.forEach === 'function') {
            req.headers.forEach(function (v, k) {
              headers[String(k).toLowerCase()] = String(v);
            });
          } else {
            for (const k in req.headers) {
              if (!Object.prototype.hasOwnProperty.call(req.headers, k)) continue;
              headers[String(k).toLowerCase()] = String(req.headers[k]);
            }
          }
        }
      } catch (e) {
        // Silencioso
      }
      if (!headers['content-type']) {
        headers['content-type'] = 'application/json';
      }

      fetch(req.url, {
        method: req.method || 'POST',
        headers,
        body: req.body,
        credentials: 'include',
      })
        .then(function (r) {
          console.log('[AT] EuroAtlantic: replay availability status=' + r.status);
          return r.json();
        })
        .then(function (data) {
          processAvailabilityPayload(data);
          console.log(
            '[AT] EuroAtlantic: replay availability concluído. cache=' +
              Object.keys(window.AT_EA_YU_JOURNEYS || {}).length,
          );
          if (typeof onDone === 'function') onDone(true);
        })
        .catch(function () {
          if (typeof onDone === 'function') onDone(false);
        })
        .finally(function () {
          window.AT_EA_AVAILABILITY_REPLAY_IN_FLIGHT = false;
        });
    } catch (e) {
      if (typeof onDone === 'function') onDone(false);
      window.AT_EA_AVAILABILITY_REPLAY_IN_FLIGHT = false;
    }
  }

  function ensureAvailabilityCacheReady(cb) {
    const cacheCount = window.AT_EA_YU_JOURNEYS ? Object.keys(window.AT_EA_YU_JOURNEYS).length : 0;
    if (cacheCount > 0) {
      cb();
      return;
    }

    const req = window.AT_EA_LAST_AVAILABILITY_REQUEST;
    if (!req) {
      console.log('[AT] EuroAtlantic: cache=0 e nenhum request availability capturado ainda.');
      setTimeout(cb, 0);
      return;
    }

    // Faz um replay (se tivermos url+body capturados). Se falhar, tenta via URL params.
    replayAvailabilityOnce(function (ok) {
      if (!ok) {
        setTimeout(cb, 0);
        return;
      }
      setTimeout(cb, 0);
    });
  }

  function getQueryValue(params, key) {
    try {
      return params.get(key) || '';
    } catch (e) {
      return '';
    }
  }

  function buildAvailabilityPayloadFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const trips = [];

      for (let i = 0; i < 6; i += 1) {
        const ds = getQueryValue(params, 'c[' + i + '].ds');
        const as = getQueryValue(params, 'c[' + i + '].as');
        const std = getQueryValue(params, 'c[' + i + '].std');
        if (!ds || !as || !std) break;

        // std vem como MM/DD/YYYY no deeplink; API costuma aceitar ISO, mas vamos enviar como string original.
        trips.push({
          departureStation: ds,
          arrivalStation: as,
          std,
        });
      }

      const passengers = [];
      for (let i = 0; i < 6; i += 1) {
        const t = getQueryValue(params, 'p[' + i + '].t');
        const c = getQueryValue(params, 'p[' + i + '].c');
        if (!t || !c) break;
        passengers.push({ type: t, count: Number(c) || 0 });
      }

      const cc = getQueryValue(params, 'cc') || 'BRL';
      const dl = Number(getQueryValue(params, 'f.dl') || '0') || 0;
      const dr = Number(getQueryValue(params, 'f.dr') || '0') || 0;

      return {
        currencyCode: cc,
        flexibleDays: { dl, dr },
        passengers,
        trips,
      };
    } catch (e) {
      return null;
    }
  }

  function fetchAvailabilityFromUrlParams(done) {
    try {
      if (window._atEaUrlAvailabilityInFlight) {
        if (typeof done === 'function') done(false);
        return;
      }
      window._atEaUrlAvailabilityInFlight = true;

      const payload = buildAvailabilityPayloadFromUrl();
      if (!payload || !payload.trips || !payload.trips.length) {
        console.log('[AT] EuroAtlantic: não foi possível montar payload da availability pela URL.');
        window._atEaUrlAvailabilityInFlight = false;
        if (typeof done === 'function') done(false);
        return;
      }

      const url =
        'https://b2c-api.voeazul.com.br/reservationavailability/api/reservation/availability/v5/availability';

      console.log('[AT] EuroAtlantic: fetch availability via URL params iniciado.');

      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          console.log('[AT] EuroAtlantic: fetch availability via URL params status=' + r.status);
          if (r.status === 401 || r.status === 403) {
            throw new Error('unauthorized');
          }
          return r.json();
        })
        .then(function (data) {
          processAvailabilityPayload(data);
          console.log(
            '[AT] EuroAtlantic: fetch availability via URL params concluído. cache=' +
              Object.keys(window.AT_EA_YU_JOURNEYS || {}).length,
          );
          if (typeof done === 'function') done(true);
        })
        .catch(function () {
          if (typeof done === 'function') done(false);
        })
        .finally(function () {
          window._atEaUrlAvailabilityInFlight = false;
        });
    } catch (e) {
      window._atEaUrlAvailabilityInFlight = false;
      if (typeof done === 'function') done(false);
    }
  }

  function forceLazyOperatedByLoad(cardEl, done) {
    try {
      if (!cardEl) {
        if (typeof done === 'function') done(false);
        return;
      }

      if (cardEl.querySelector(SELECTORS.operatedByYUImg)) {
        if (typeof done === 'function') done(true);
        return;
      }

      const originalY = window.scrollY || 0;
      const itinerary =
        cardEl.querySelector('.itinerary') ||
        cardEl.querySelector('[class*="itinerary"]') ||
        cardEl.querySelector('h3, h2');

      if (!itinerary || typeof itinerary.scrollIntoView !== 'function') {
        if (typeof done === 'function') done(false);
        return;
      }

      itinerary.scrollIntoView({ block: 'center', behavior: 'auto' });
      setTimeout(function () {
        const has = !!cardEl.querySelector(SELECTORS.operatedByYUImg);
        try {
          window.scrollTo(0, originalY);
        } catch (e) {
          // Silencioso
        }
        if (typeof done === 'function') done(has);
      }, 250);
    } catch (e) {
      if (typeof done === 'function') done(false);
    }
  }

  function onTargetPage() {
    var path = window.location && window.location.pathname ? window.location.pathname : '';
    var search = window.location && window.location.search ? window.location.search : '';
    return (
      path.indexOf(PAGE_PATH_TARGET) !== -1 && search.indexOf(QUERY_PARAM_MONEY_PAYMENT) !== -1
    );
  }

  function onMyTripsPage() {
    var path = window.location && window.location.pathname ? window.location.pathname : '';
    return path.indexOf(PAGE_PATH_MY_TRIPS) !== -1;
  }

  function getContextLabelSuffix() {
    return currentModalContext === 'minhas-viagens' ? ' minhas-viagens' : '';
  }

  function buildModalEventLabel(action) {
    return 'AT_euroatlantic_modal ' + action + getContextLabelSuffix();
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
      console.log((consolePrefix || '[AT] EuroAtlantic:') + ' Analytics event:', labelEvent);
      (function () {
        var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
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
      // Silencioso
    }
  }

  function getSessionValue(key) {
    try {
      return window.sessionStorage ? window.sessionStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function setSessionValue(key, value) {
    try {
      if (!window.sessionStorage) return;
      window.sessionStorage.setItem(key, value);
    } catch (e) {
      // Ignora
    }
  }

  function hasShownModalThisSession() {
    return getSessionValue(MODAL_SESSION_KEY) === '1';
  }

  function hasShownMyTripsModalThisSession() {
    return getSessionValue(MODAL_MY_TRIPS_SESSION_KEY) === '1';
  }

  function normalizeText(s) {
    try {
      return String(s || '')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (e) {
      return '';
    }
  }

  function hasEuroAtlanticMyTripsOnScreen() {
    const nodes = document.querySelectorAll('p');
    if (!nodes || !nodes.length) return false;
    for (let i = 0; i < nodes.length; i += 1) {
      const txt = normalizeText(nodes[i].textContent);
      if (!txt) continue;
      if (txt.indexOf('EuroAtlantic') !== -1 && txt.indexOf('Direto') !== -1) {
        return true;
      }
    }
    return false;
  }

  // -------------------------------------------------------
  // Marcacao proativa de cards (operatedby/YU)
  // -------------------------------------------------------
  function scanAndMarkAllCards() {
    var cards = document.querySelectorAll(SELECTORS.flightCard);
    if (!cards || !cards.length) {
      return;
    }

    for (var i = 0; i < cards.length; i += 1) {
      var card = cards[i];
      var yuLogo = card.querySelector(SELECTORS.operatedByYUImg);
      if (yuLogo) {
        card.setAttribute('data-at-ea-yu', '1');
      }
    }
  }

  function isCardMarkedAsYU(cardEl) {
    return cardEl && cardEl.getAttribute('data-at-ea-yu') === '1';
  }

  function hasEuroAtlanticFlightsOnScreen() {
    // Presença: considera cache (availability) + fallback DOM
    try {
      if (window.AT_EA_YU_JOURNEYS && Object.keys(window.AT_EA_YU_JOURNEYS).length > 0) {
        return true;
      }
    } catch (e) {
      // Silencioso
    }
    return !!document.querySelector(SELECTORS.operatedByYUImg);
  }

  function maybeSendEuroAtlanticPresenceEvent() {
    if (hasSentEuroAtlanticPresenceEvent) {
      return;
    }
    if (!hasEuroAtlanticFlightsOnScreen()) {
      return;
    }
    hasSentEuroAtlanticPresenceEvent = true;
    analyticsSend('AT_euroatlantic_presence Exibido', '[AT] EuroAtlantic:');
  }

  // -------------------------------------------------------
  // Deteccao de YU para um botao
  // -------------------------------------------------------
  function isEuroAtlanticForButton(buttonEl) {
    if (!buttonEl || !buttonEl.closest) {
      return false;
    }

    var card = buttonEl.closest(SELECTORS.flightCard);
    if (!card) {
      return false;
    }

    var cardId = card.id || '';
    if (cardId && window.AT_EA_YU_JOURNEYS && window.AT_EA_YU_JOURNEYS[cardId]) {
      return true;
    }

    // 1) flag pre-setada pelo scan (mais rapido e confiavel)
    if (isCardMarkedAsYU(card)) {
      return true;
    }

    // 2) busca direta no DOM do card (caso scan nao pegou ainda)
    var yuLogo = card.querySelector(SELECTORS.operatedByYUImg);
    if (yuLogo) {
      card.setAttribute('data-at-ea-yu', '1');
      return true;
    }

    return false;
  }

  // -------------------------------------------------------
  // Imagem de fundo do modal
  // -------------------------------------------------------
  function ensureBgPreloadLink() {
    if (document.getElementById(BG_PRELOAD_ID)) {
      return;
    }

    try {
      var link = document.createElement('link');
      link.id = BG_PRELOAD_ID;
      link.rel = 'preload';
      link.as = 'image';
      link.href = MODAL_BG_URL;
      document.head.appendChild(link);
    } catch (e) {
      // Ignora
    }
  }

  function preloadModalBg() {
    if (isBgReady) {
      return;
    }

    ensureBgPreloadLink();

    try {
      var img = new Image();
      img.src = MODAL_BG_URL;

      var markReady = function () {
        isBgReady = true;
        applyBgToModal();
      };

      if (img.complete) {
        markReady();
        return;
      }

      img.onload = markReady;
    } catch (e) {
      // Ignora
    }
  }

  function applyBgToModal() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }

    var imageEl = overlay.querySelector('.at-ea-image');
    if (!imageEl) {
      return;
    }

    if (imageEl.getAttribute('data-at-ea-bg-applied') === '1') {
      return;
    }

    imageEl.setAttribute('data-at-ea-bg-applied', '1');
    imageEl.style.backgroundImage = 'url("' + MODAL_BG_URL + '")';
  }

  // -------------------------------------------------------
  // CSS
  // -------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      'body.at-euroatlantic-modal-open { overflow: hidden !important; }' +
      '#' +
      OVERLAY_ID +
      ' { position: fixed; inset: 0; z-index: 999999; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(4, 30, 66, 0.88); box-sizing: border-box; opacity: 0; transition: opacity 220ms ease; }' +
      '#' +
      OVERLAY_ID +
      '.is-open { display: flex; }' +
      '#' +
      OVERLAY_ID +
      '.is-open.is-animating-in { opacity: 1; }' +
      '#' +
      OVERLAY_ID +
      '.is-open.is-animating-out { opacity: 0; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-modal { width: 936px; max-width: 100%; border-radius: 16px; overflow: hidden; background: #FFFFFF; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25); transform: translateY(14px) scale(0.98); opacity: 0; transition: transform 260ms ease, opacity 220ms ease; }' +
      '#' +
      OVERLAY_ID +
      '.is-open.is-animating-in .at-ea-modal { transform: translateY(0) scale(1); opacity: 1; }' +
      '#' +
      OVERLAY_ID +
      '.is-open.is-animating-out .at-ea-modal { transform: translateY(10px) scale(0.985); opacity: 0; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-header { box-sizing: border-box; display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 12px 16px; gap: 4px; height: 56px; background: #FFFFFF; border-bottom: 1px solid rgba(0, 0, 0, 0.15); }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-title { margin: 0; width: 100%; font-family: "Helvetica Neue", Arial, sans-serif; font-style: normal; font-weight: 300; font-size: 22px; line-height: 27px; text-align: center; color: #041E42; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-close { width: 32px; height: 32px; border: 0; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; flex: 0 0 32px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-close svg { width: 20px; height: 20px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-close path { fill: #595959; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-body { display: flex; flex-direction: row; width: 100%; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-image { width: 652px; height: 437px; background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #E9EEF5; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-content { width: 284px; min-height: 437px; background: #F8F8F8; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 24px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-content h4 { margin: 0; font-family: "Helvetica Neue", Arial, sans-serif; font-style: normal; font-weight: 400; font-size: 20px; line-height: 24px; color: #041E42; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-content h4 strong { color: #026CB6; font-weight: 700; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-item { display: flex; flex-direction: row; gap: 8px; align-items: flex-start; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-item p { margin: 0; font-family: "Helvetica Neue", Arial, sans-serif; font-style: normal; font-weight: 400; font-size: 14px; line-height: 17px; color: #041E42; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-check { width: 20px; height: 20px; flex: 0 0 20px; margin-top: 1px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-check circle { fill: #008055; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-footer { box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 16px 32px; gap: 16px; height: 80px; background: #FFFFFF; border-top: 1px solid rgba(0, 0, 0, 0.15); }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta { width: 232px; height: 48px; border: 0; cursor: pointer; border-radius: 8px; background: #026CB6; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; box-sizing: border-box; transition: background-color 160ms ease, opacity 160ms ease; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta:hover { background: #01589a; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta:active { opacity: 0.92; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta:focus-visible { outline: 2px solid rgba(2, 108, 182, 0.45); outline-offset: 3px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta span { font-family: "Helvetica Neue", Arial, sans-serif; font-style: normal; font-weight: 400; font-size: 16px; line-height: 19px; color: #FFFFFF; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta svg { width: 24px; height: 24px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta path { fill: #FFFFFF; }' +
      '@media (prefers-reduced-motion: reduce) {' +
      '#' +
      OVERLAY_ID +
      ' { transition: none !important; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-modal { transition: none !important; transform: none !important; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-cta { transition: none !important; }' +
      '}' +
      '@media (max-width: 1023px) {' +
      '#' +
      OVERLAY_ID +
      ' { padding: 12px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-modal { width: 100%; border-radius: 16px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-body { flex-direction: column; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-image { width: 100%; height: 220px; }' +
      '#' +
      OVERLAY_ID +
      ' .at-ea-content { width: 100%; min-height: auto; }' +
      '}';

    document.head.appendChild(style);
  }

  // -------------------------------------------------------
  // Modal HTML
  // -------------------------------------------------------
  function ensureModal() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');

    var modal = document.createElement('div');
    modal.className = 'at-ea-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Voo operado pela EuroAtlantic');

    var header = document.createElement('div');
    header.className = 'at-ea-header';

    var title = document.createElement('h3');
    title.className = 'at-ea-title';
    title.textContent = 'Voo operado pela EuroAtlantic';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'at-ea-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12l-4.9 4.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.9c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.39-.39.39-1.02 0-1.4z"/>' +
      '</svg>';

    header.appendChild(title);
    header.appendChild(closeBtn);

    var body = document.createElement('div');
    body.className = 'at-ea-body';

    var image = document.createElement('div');
    image.className = 'at-ea-image';
    // Aplica imagem imediatamente (preload ja comecou no run())
    image.setAttribute('data-at-ea-bg-applied', '1');
    image.style.backgroundImage = 'url("' + MODAL_BG_URL + '")';

    var content = document.createElement('div');
    content.className = 'at-ea-content';

    var contentTitle = document.createElement('h4');
    contentTitle.innerHTML = '<strong>Atenção</strong> para uma dica importante!';

    var list = document.createElement('ul');
    list.className = 'at-ea-list';

    function makeItem(text) {
      var li = document.createElement('li');
      li.className = 'at-ea-item';

      var icon =
        '<svg class="at-ea-check" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<circle cx="10" cy="10" r="10"></circle>' +
        '<path d="M8.4 13.7L5.7 11l1.1-1.1 1.6 1.6 4-4 1.1 1.1-5.1 5.1z" fill="#FFFFFF"></path>' +
        '</svg>';

      var p = document.createElement('p');
      p.textContent = text;

      var iconWrap = document.createElement('div');
      iconWrap.innerHTML = icon;

      li.appendChild(iconWrap.firstChild);
      li.appendChild(p);
      return li;
    }

    list.appendChild(
      makeItem(
        'Seu voo é operado pela nossa parceira Euroatlantic e a aeronave não dispõe de sistema de entretenimento (tela e Wi-Fi)',
      ),
    );
    list.appendChild(
      makeItem('Ainda dá tempo de baixar seu conteúdo favorito! Tenha um excelente voo'),
    );

    content.appendChild(contentTitle);
    content.appendChild(list);

    body.appendChild(image);
    body.appendChild(content);

    var footer = document.createElement('div');
    footer.className = 'at-ea-footer';

    var cta = document.createElement('button');
    cta.className = 'at-ea-cta';
    cta.type = 'button';
    cta.setAttribute('data-at-ea-continue', '1');
    cta.innerHTML =
      '<span>Prosseguir</span>' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"></path>' +
      '</svg>';

    footer.appendChild(cta);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fechar ao clicar fora
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Botao fechar
    closeBtn.addEventListener('click', function () {
      analyticsSend(buildModalEventLabel('Fechar'), '[AT] EuroAtlantic:');
      closeModal();
    });

    // CTA continuar
    cta.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      analyticsSend(buildModalEventLabel('Continuar'), '[AT] EuroAtlantic:');
      if (currentModalMode === 'info') {
        closeModal();
        return;
      }
      continueOriginalFlow();
    });

    // ESC
    if (!document.documentElement.hasAttribute('data-at-ea-esc-listener')) {
      document.documentElement.setAttribute('data-at-ea-esc-listener', '1');
      document.addEventListener('keydown', function (e) {
        var key = e && (e.key || e.code);
        if (key === 'Escape') {
          var isOpen = document.body.classList.contains('at-euroatlantic-modal-open');
          if (isOpen) {
            analyticsSend(buildModalEventLabel('ESC'), '[AT] EuroAtlantic:');
            closeModal();
          }
        }
      });
    }

    return overlay;
  }

  function openModal() {
    var overlay = ensureModal();
    overlay.classList.add('is-open');
    overlay.classList.remove('is-animating-out');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('at-euroatlantic-modal-open');

    overlay.offsetHeight;
    overlay.classList.add('is-animating-in');

    if (currentModalContext === 'minhas-viagens') {
      setSessionValue(MODAL_MY_TRIPS_SESSION_KEY, '1');
    } else {
      setSessionValue(MODAL_SESSION_KEY, '1');
    }
  }

  function closeModal() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.classList.remove('is-animating-in');
    overlay.classList.add('is-animating-out');

    var finalizeClose = function () {
      overlay.classList.remove('is-open');
      overlay.classList.remove('is-animating-out');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('at-euroatlantic-modal-open');
      pendingOriginalButton = null;
    };

    var done = false;
    var safetyTimer = setTimeout(function () {
      if (done) return;
      done = true;
      finalizeClose();
    }, 340);

    var modal = overlay.querySelector('.at-ea-modal');
    if (!modal) {
      clearTimeout(safetyTimer);
      finalizeClose();
      return;
    }

    var onEnd = function (e) {
      if (done) return;
      if (!e || e.target !== modal) return;
      done = true;
      clearTimeout(safetyTimer);
      modal.removeEventListener('transitionend', onEnd);
      finalizeClose();
    };
    modal.addEventListener('transitionend', onEnd);
  }

  function continueOriginalFlow() {
    var btn = pendingOriginalButton;
    closeModal();

    if (!btn) {
      return;
    }

    btn.setAttribute('data-at-ea-bypass', '1');
    setTimeout(function () {
      btn.removeAttribute('data-at-ea-bypass');
    }, 1200);

    try {
      btn.click();
    } catch (e) {
      var evt = document.createEvent('MouseEvents');
      evt.initEvent('click', true, true);
      btn.dispatchEvent(evt);
    }
  }

  // -------------------------------------------------------
  // Interceptor de clique
  // -------------------------------------------------------
  function addGlobalClickInterceptor() {
    if (document.documentElement.hasAttribute('data-at-ea-click-interceptor')) {
      return;
    }
    document.documentElement.setAttribute('data-at-ea-click-interceptor', '1');

    document.addEventListener(
      'click',
      function (e) {
        var target = e && e.target ? e.target : null;
        if (!target || !target.closest) {
          return;
        }

        // Encontra o botao select-fare mais proximo
        var button = target.closest(SELECTORS.selectFareButton);
        if (!button) {
          return;
        }

        // Ignora botoes desabilitados (Tarifa esgotada)
        if (button.disabled || button.hasAttribute('disabled')) {
          return;
        }

        // Anti-loop
        if (button.hasAttribute('data-at-ea-bypass')) {
          return;
        }

        if (!onTargetPage()) {
          return;
        }

        if (hasShownModalThisSession()) {
          return;
        }

        var card = button.closest(SELECTORS.flightCard);
        var cardId = card && card.id ? card.id : 'N/A';
        var cacheCount = window.AT_EA_YU_JOURNEYS
          ? Object.keys(window.AT_EA_YU_JOURNEYS).length
          : 0;
        var hasDomYu = card ? !!card.querySelector(SELECTORS.operatedByYUImg) : false;

        // Tenta enriquecer o cache sem depender de API/scroll
        ensureYuCacheFromPageState();
        cacheCount = window.AT_EA_YU_JOURNEYS ? Object.keys(window.AT_EA_YU_JOURNEYS).length : 0;

        // Verifica se e YU (API cache -> flag -> DOM)
        var isYU = isEuroAtlanticForButton(button);
        if (DEBUG_MODE) {
          console.log(
            '[AT] EuroAtlantic: click interceptado, isYU=' +
              isYU +
              ' cardId=' +
              cardId +
              ' cache=' +
              cacheCount +
              ' domYu=' +
              hasDomYu,
          );
        }

        if (!isYU) {
          // Se o cache da API ainda não existe (Target entrou tarde), tenta replay 1x e reavalia.
          if (cacheCount === 0) {
            ensureAvailabilityCacheReady(function () {
              // Tenta forçar o lazy-load do DOM (Operado por) sem depender da API (que retorna 401 aqui)
              forceLazyOperatedByLoad(card, function () {
                var isAfter = isEuroAtlanticForButton(button);
                if (DEBUG_MODE) {
                  console.log('[AT] EuroAtlantic: recheck após replay. isYU=' + isAfter);
                }
                if (isAfter) {
                  currentModalContext = 'selecao-voo';
                  currentModalMode = 'selection';
                  analyticsSend(buildModalEventLabel('Exibido'), '[AT] EuroAtlantic:');
                  openModal();
                } else {
                  continueOriginalFlow();
                }
              });
            });
            return;
          }
          return;
        }

        // Bloqueia o fluxo original
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }

        pendingOriginalButton = button;
        currentModalContext = 'selecao-voo';
        currentModalMode = 'selection';
        analyticsSend(buildModalEventLabel('Exibido'), '[AT] EuroAtlantic:');
        openModal();
      },
      true,
    );
  }

  // -------------------------------------------------------
  // Run / Init
  // -------------------------------------------------------
  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      var isSelection = onTargetPage();
      var isMyTrips = onMyTripsPage();

      if (!isSelection && !isMyTrips) {
        hasSentEuroAtlanticPresenceEvent = false;
        return;
      }

      injectStyles();
      preloadModalBg();

      if (isSelection) {
        addGlobalClickInterceptor();
        scanAndMarkAllCards();
        ensureYuCacheFromPageState();
        maybeSendEuroAtlanticPresenceEvent();
      }

      if (isMyTrips) {
        // Modal informativo: abre ao detectar texto "Direto • EuroAtlantic"
        if (!hasShownMyTripsModalThisSession() && hasEuroAtlanticMyTripsOnScreen()) {
          currentModalContext = 'minhas-viagens';
          currentModalMode = 'info';
          pendingOriginalButton = null;
          analyticsSend(buildModalEventLabel('Exibido'), '[AT] EuroAtlantic:');
          openModal();
        }
      }
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    // Importante: interceptar o quanto antes (em SPA, a chamada pode ocorrer antes do DOMContentLoaded)
    installAvailabilityInterceptors();
    debounce(run, 0);

    if (!window._euroAtlanticObserver) {
      var localTimer = null;
      var observer = new MutationObserver(function () {
        if (localTimer) {
          clearTimeout(localTimer);
        }
        localTimer = setTimeout(function () {
          debounce(run, 0);
        }, 150);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window._euroAtlanticObserver = observer;
    }
  }

  if (window.euroAtlanticInitialized) {
    return;
  }
  window.euroAtlanticInitialized = true;

  // Instala interceptores o mais cedo possível, mesmo antes do init().
  installAvailabilityInterceptors();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
