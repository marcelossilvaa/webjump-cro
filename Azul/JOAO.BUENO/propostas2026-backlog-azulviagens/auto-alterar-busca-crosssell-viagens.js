// =============================================================
// AUTO CLICK - "Alterar busca" (hotéis e carros - Azul Viagens)
// Regra: só clicar se usuário veio do CTA do cross-sell Minhas Viagens
// Flag: localStorage gravado em crossSell-minhasViagens.js (CTA hotel/carro)
// =============================================================
(function () {
  'use strict';

  var AUTOCLICK_FLAG_KEY = 'at_cross_sell_minhas_viagens_autoclick_alterar_busca';
  var SESSION_DONE_PREFIX = 'at_cross_sell_minhas_viagens_autoclick_done_session_';
  var EVAR84 = 'AT_cross_sell_minhas_viagens';
  var FLAG_TTL_MS = 30 * 60 * 1000;
  var MAX_WAIT_MS = 15000;
  var POLL_MS = 250;
  var BUTTON_TESTID = 'search-box-hotel-date-picker-primary-button';

  function analyticsEvent(eventLabel, eventType, vertical) {
    if (!eventLabel) {
      return;
    }

    var prefix = 'AT_CrossSell_MinhasViagens_';
    if (vertical === 'hotel') {
      prefix = 'AT_CrossSell_MinhasViagens_Hotel_';
    } else if (vertical === 'carro') {
      prefix = 'AT_CrossSell_MinhasViagens_Carro_';
    }

    var labelEvent = prefix + eventType + ' ' + eventLabel;

    try {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = EVAR84;
      s.tl(true, 'o', 'target_activity_action');
    } catch (e) {}
  }

  function getPageType() {
    try {
      var path = ((window.location && window.location.pathname) || '').toLowerCase();
      var href = ((window.location && window.location.href) || '').toLowerCase();

      if (
        path.indexOf('/home/cars') !== -1 ||
        href.indexOf('/home/cars') !== -1 ||
        path.indexOf('/carros') !== -1 ||
        href.indexOf('/carros') !== -1
      ) {
        return 'carro';
      }

      if (
        path.indexOf('/home/hotel') !== -1 ||
        href.indexOf('/home/hotel') !== -1 ||
        path.indexOf('/hoteis') !== -1 ||
        href.indexOf('/hoteis') !== -1
      ) {
        return 'hotel';
      }
    } catch (e) {}

    return null;
  }

  function parseFlag() {
    try {
      var raw = localStorage.getItem(AUTOCLICK_FLAG_KEY);
      if (!raw) {
        return null;
      }

      var sep = raw.indexOf(':');
      if (sep === -1) {
        var legacyTs = parseInt(raw, 10);
        if (isNaN(legacyTs)) {
          return null;
        }
        return { type: null, ts: legacyTs };
      }

      var type = raw.substring(0, sep);
      var ts = parseInt(raw.substring(sep + 1), 10);

      if (isNaN(ts)) {
        return null;
      }

      return { type: type, ts: ts };
    } catch (e) {
      return null;
    }
  }

  function clearFlag() {
    try {
      localStorage.removeItem(AUTOCLICK_FLAG_KEY);
    } catch (e) {}
  }

  function wasDoneThisSession(pageType) {
    try {
      return sessionStorage.getItem(SESSION_DONE_PREFIX + pageType) === '1';
    } catch (e) {
      return false;
    }
  }

  function markDoneThisSession(pageType) {
    try {
      sessionStorage.setItem(SESSION_DONE_PREFIX + pageType, '1');
    } catch (e) {}
  }

  function flagMatchesPage(flag, pageType) {
    if (!flag || !pageType) {
      return false;
    }

    if (!flag.type) {
      return true;
    }

    return flag.type === pageType;
  }

  function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isAlterarBuscaButton(btn) {
    if (!btn || btn.tagName !== 'BUTTON') {
      return false;
    }

    var text = normalizeText(btn.textContent);
    if (text.indexOf('alterar busca') !== -1) {
      return true;
    }

    var aria = normalizeText(btn.getAttribute('aria-label'));
    return aria.indexOf('alterar busca') === 0;
  }

  function findAlterarBuscaButton() {
    try {
      var byAria = document.querySelector('button[aria-label^="Alterar busca"]');
      if (byAria && isAlterarBuscaButton(byAria)) {
        return byAria;
      }

      var buttons = document.querySelectorAll(
        'button[data-testid="' + BUTTON_TESTID + '"]',
      );
      for (var i = 0; i < buttons.length; i++) {
        if (isAlterarBuscaButton(buttons[i])) {
          return buttons[i];
        }
      }
    } catch (e) {}

    return null;
  }

  function clickButton(btn) {
    if (!btn) {
      return false;
    }

    try {
      btn.click();
      return true;
    } catch (e) {
      return false;
    }
  }

  function finishAutoclick(timer, pageType) {
    clearInterval(timer);
    clearFlag();
    markDoneThisSession(pageType);
    analyticsEvent('alterar_busca_autoclick', 'click', pageType);
  }

  function run() {
    var pageType = getPageType();
    if (!pageType) {
      return;
    }

    if (wasDoneThisSession(pageType)) {
      return;
    }

    var flag = parseFlag();
    if (!flag || !flag.ts) {
      return;
    }

    if (!flagMatchesPage(flag, pageType)) {
      return;
    }

    if (Date.now() - flag.ts > FLAG_TTL_MS) {
      clearFlag();
      return;
    }

    var start = Date.now();
    var timer = setInterval(function () {
      if (Date.now() - start > MAX_WAIT_MS) {
        clearInterval(timer);
        clearFlag();
        markDoneThisSession(pageType);
        return;
      }

      var btn = findAlterarBuscaButton();
      if (!btn) {
        return;
      }

      clearInterval(timer);

      if (!clickButton(btn)) {
        clearFlag();
        markDoneThisSession(pageType);
        return;
      }

      finishAutoclick(timer, pageType);
    }, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
