// =============================================================
// AUTO CLICK - Aba "Ingressos" na LP de promoções Disney
// Página alvo: https://www.voeazul.com.br/br/pt/disney/promocoes-disney
// Regra: só clicar se usuário veio do modal (flag no localStorage)
// =============================================================
(function () {
  var PROMO_PATH = '/br/pt/disney/promocoes-disney';
  var PROMO_AUTOCLOCK_KEY = 'at_disney_promocoes_autoclick_ingressos';
  var SESSION_DONE_KEY = 'at_disney_promocoes_autoclick_done_session';
  var EVAR84 = 'AT_Disney_campaign';
  var FLAG_TTL_MS = 30 * 60 * 1000; // 30min
  var MAX_WAIT_MS = 15000;
  var POLL_MS = 250;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = 'AT_Disney_promocoes_' + eventType + ' ' + eventLabel;
    try {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = EVAR84;
      s.tl(true, 'o', 'target_activity_action');
    } catch (e) {}
  }

  function isOnPromoPage() {
    try {
      return (window.location && window.location.pathname) === PROMO_PATH;
    } catch (e) {
      return false;
    }
  }

  function getFlagTimestamp() {
    try {
      var raw = localStorage.getItem(PROMO_AUTOCLOCK_KEY);
      if (!raw) return 0;
      var ts = parseInt(raw, 10);
      return isNaN(ts) ? 0 : ts;
    } catch (e) {
      return 0;
    }
  }

  function clearFlag() {
    try {
      localStorage.removeItem(PROMO_AUTOCLOCK_KEY);
    } catch (e) {}
  }

  function wasDoneThisSession() {
    try {
      return sessionStorage.getItem(SESSION_DONE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markDoneThisSession() {
    try {
      sessionStorage.setItem(SESSION_DONE_KEY, '1');
    } catch (e) {}
  }

  function findIngressosTab() {
    try {
      // Preferência por aria-label do H3 (mais estável)
      var h3 = document.querySelector('h3.tab-title[aria-label^="Ingressos"]');
      if (h3) {
        var li = h3.closest('li.react-tabs__tab[role="tab"]');
        if (li) return li;
      }

      // Fallback: procura por texto "Ingressos"
      var tabs = document.querySelectorAll('li.react-tabs__tab[role="tab"]');
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var text = (t.textContent || '').toLowerCase();
        if (text.indexOf('ingressos') !== -1) return t;
      }
    } catch (e) {}
    return null;
  }

  function clickTab(el) {
    if (!el) return false;
    try {
      if (el.getAttribute('aria-selected') === 'true') return true;
      el.scrollIntoView({ block: 'center', inline: 'center' });
    } catch (e) {}
    try {
      el.click();
      return true;
    } catch (e) {
      return false;
    }
  }

  function run() {
    if (!isOnPromoPage()) return;
    if (wasDoneThisSession()) return;

    var ts = getFlagTimestamp();
    if (!ts) return;
    if (Date.now() - ts > FLAG_TTL_MS) {
      clearFlag();
      return;
    }

    var start = Date.now();
    var timer = setInterval(function () {
      if (Date.now() - start > MAX_WAIT_MS) {
        clearInterval(timer);
        // Evita ficar tentando sempre que navegar na página
        clearFlag();
        markDoneThisSession();
        return;
      }

      var tab = findIngressosTab();
      if (!tab) return;

      var ok = clickTab(tab);
      if (!ok) return;

      clearInterval(timer);
      clearFlag();
      markDoneThisSession();
      analyticsEvent('aba_ingressos_autoclick', 'click');
    }, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
