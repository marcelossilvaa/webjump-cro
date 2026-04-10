(function () {
  'use strict';

  // =========================================================
  // EuroAtlantic v.2 - Modal ao selecionar tarifa (operatedby/YU)
  // =========================================================
  let isProcessing = false;
  let debounceTimer = null;

  const PAGE_PATH_TARGET = '/selecao-voo';
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
  let isBgReady = false;

  function onTargetPage() {
    var path = window.location && window.location.pathname ? window.location.pathname : '';
    var search = window.location && window.location.search ? window.location.search : '';
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
      analyticsSend('AT_euroatlantic_modal Fechar', '[AT] EuroAtlantic:');
      closeModal();
    });

    // CTA continuar
    cta.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      analyticsSend('AT_euroatlantic_modal Continuar', '[AT] EuroAtlantic:');
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
            analyticsSend('AT_euroatlantic_modal ESC', '[AT] EuroAtlantic:');
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

    setSessionValue(MODAL_SESSION_KEY, '1');
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

        // Verifica se e YU (pelo flag ou pelo DOM)
        var isYU = isEuroAtlanticForButton(button);
        console.log('[AT] EuroAtlantic: click interceptado, isYU=' + isYU);

        if (!isYU) {
          return;
        }

        // Bloqueia o fluxo original
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }

        pendingOriginalButton = button;
        analyticsSend('AT_euroatlantic_modal Exibido', '[AT] EuroAtlantic:');
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
      if (!onTargetPage()) {
        hasSentEuroAtlanticPresenceEvent = false;
        return;
      }
      injectStyles();
      preloadModalBg();
      addGlobalClickInterceptor();
      scanAndMarkAllCards();
      maybeSendEuroAtlanticPresenceEvent();
    } finally {
      isProcessing = false;
    }
  }

  function init() {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
