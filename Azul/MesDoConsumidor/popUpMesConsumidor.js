(function () {
  const REDIRECT_URL = 'https://passagens.voeazul.com.br/pt/mes-do-consumidor';
  const MODAL_ID = 'popupMesConsumidor';
  const STYLE_ID = 'popupMesConsumidorStyles';
  const DAILY_KEY = 'popup-mes-consumidor-daily-count';
  const DAILY_MAX = 1;
  const campaignStartMs = new Date(2026, 2, 6, 0, 0, 0).getTime();
  const campaignEndMs = new Date(2026, 2, 15, 23, 59, 0).getTime();
  const CLOSE_ANIMATION_MS = 260;
  const TRACKING_CONTEXT = 'AT_popup_mes_consumidor';
  let escHandler = null;

  function isDomReady() {
    return document.readyState === 'interactive' || document.readyState === 'complete';
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel || !eventType) return;

    const contextEvent = TRACKING_CONTEXT;

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar84 = contextEvent;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML =
      '@keyframes popupMesConsumidorFadeIn {' +
      'from { opacity: 0; }' +
      'to { opacity: 1; }' +
      '}' +
      '@keyframes popupMesConsumidorFadeOut {' +
      'from { opacity: 1; }' +
      'to { opacity: 0; }' +
      '}' +
      '@keyframes popupMesConsumidorScaleIn {' +
      'from { opacity: 0; transform: translateY(10px) scale(0.98); }' +
      'to { opacity: 1; transform: translateY(0) scale(1); }' +
      '}' +
      '@keyframes popupMesConsumidorScaleOut {' +
      'from { opacity: 1; transform: translateY(0) scale(1); }' +
      'to { opacity: 0; transform: translateY(10px) scale(0.98); }' +
      '}' +
      '.popupMesConsumidorOverlay {' +
      'position: fixed;' +
      'inset: 0;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'padding: 16px;' +
      'background: rgba(0, 0, 0, 0.55);' +
      'z-index: 99999;' +
      'animation: popupMesConsumidorFadeIn 0.26s ease-out;' +
      '}' +
      '.popupMesConsumidorOverlay.closing {' +
      'animation: popupMesConsumidorFadeOut 0.26s ease-in forwards;' +
      '}' +
      '.popupMesConsumidor {' +
      'position: relative;' +
      'width: 520px;' +
      'max-width: calc(100vw - 32px);' +
      'max-height: calc(100vh - 32px);' +
      'overflow-y: auto;' +
      'border-radius: 10px;' +
      'background: linear-gradient(175deg, #0061a0 3.67%, #004a7c 96.33%);' +
      'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'color: #fff;' +
      'animation: popupMesConsumidorScaleIn 0.26s ease-out;' +
      '}' +
      '.popupMesConsumidor.closing {' +
      'animation: popupMesConsumidorScaleOut 0.26s ease-in forwards;' +
      '}' +
      '.popupMesConsumidor * { box-sizing: border-box; }' +
      '.popupMesConsumidorHeader {' +
      'position: relative;' +
      'padding: 24px 24px 0;' +
      '}' +
      '.popupMesConsumidorTag {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'padding: 0 12px;' +
      'height: 25px;' +
      'background: #041e42;' +
      'border-radius: 999px;' +
      'font-size: 11px;' +
      'line-height: 16px;' +
      '}' +
      '.popupMesConsumidorTitle {' +
      'margin: 16px 0 12px;' +
      'font-size: 36px;' +
      'line-height: 31px;' +
      'font-weight: 700;' +
      '}' +
      '.popupMesConsumidorDescription {' +
      'margin: 0;' +
      'font-size: 20px;' +
      'line-height: 32px;' +
      'color: rgba(255, 255, 255, 0.7);' +
      '}' +
      '.popupMesConsumidorClose {' +
      'position: absolute;' +
      'top: 24px;' +
      'right: 24px;' +
      'width: 32px;' +
      'height: 32px;' +
      'border: none;' +
      'border-radius: 999px;' +
      'background: rgba(255, 255, 255, 0.15);' +
      'cursor: pointer;' +
      '}' +
      '.popupMesConsumidorClose::before, .popupMesConsumidorClose::after {' +
      'content: "";' +
      'position: absolute;' +
      'top: 15px;' +
      'left: 8px;' +
      'width: 16px;' +
      'height: 2px;' +
      'background: rgba(255, 255, 255, 0.9);' +
      'border-radius: 2px;' +
      '}' +
      '.popupMesConsumidorClose::before { transform: rotate(45deg); }' +
      '.popupMesConsumidorClose::after { transform: rotate(-45deg); }' +
      '.popupMesConsumidorOffers {' +
      'margin: 16px 24px 0;' +
      'padding: 16px;' +
      'border: 1px solid rgba(255, 255, 255, 0.1);' +
      'border-radius: 12px;' +
      'background: linear-gradient(160deg, #004f87 8.49%, #003660 91.51%);' +
      '}' +
      '.popupMesConsumidorBadge {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'padding: 0 20px;' +
      'height: 38px;' +
      'border-radius: 999px;' +
      'background: #3db2e2;' +
      'color: #041e42;' +
      'font-size: 16px;' +
      'font-weight: 700;' +
      'line-height: 30px;' +
      '}' +
      '.popupMesConsumidorList {' +
      'margin: 16px 0 0;' +
      'padding: 0;' +
      'list-style: none;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      '}' +
      '.popupMesConsumidorItem {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 12px;' +
      'padding: 12px 14px 12px 12px;' +
      'border-radius: 14px;' +
      'background: #0061a0;' +
      'border-left: 4px solid #3db2e2;' +
      '}' +
      '.popupMesConsumidorNumber {' +
      'width: 32px;' +
      'height: 32px;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'background: #3db2e2;' +
      'border-radius: 999px;' +
      'font-family: Inter, Arial, sans-serif;' +
      'font-weight: 700;' +
      'font-size: 14px;' +
      'line-height: 20px;' +
      'color: #fff;' +
      'flex-shrink: 0;' +
      '}' +
      '.popupMesConsumidorText {' +
      'font-family: Inter, Arial, sans-serif;' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      'font-weight: 600;' +
      'color: #ffffff;' +
      '}' +
      '.popupMesConsumidorAccent {' +
      'font-size: 20px;' +
      'line-height: 28px;' +
      'font-weight: 700;' +
      'color: #3db2e2;' +
      '}' +
      '.popupMesConsumidorFooter {' +
      'padding: 16px 24px 24px;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      '}' +
      '.popupMesConsumidorCta {' +
      'width: 100%;' +
      'height: 56px;' +
      'border: none;' +
      'border-radius: 24px;' +
      'background: #fff;' +
      'color: #041e42;' +
      'font-size: 20px;' +
      'font-weight: 700;' +
      'line-height: 24px;' +
      'letter-spacing: 0.8px;' +
      'text-transform: uppercase;' +
      'cursor: pointer;' +
      '}' +
      '.popupMesConsumidorDisclaimer {' +
      'margin: 0;' +
      'text-align: center;' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      'color: rgba(255, 255, 255, 0.8);' +
      '}' +
      '@media (max-width: 560px) {' +
      '.popupMesConsumidorOverlay { padding: 8px; }' +
      '.popupMesConsumidorHeader { padding: 16px 16px 0; }' +
      '.popupMesConsumidorClose { top: 16px; right: 16px; }' +
      '.popupMesConsumidorTitle { font-size: 30px; line-height: 32px; }' +
      '.popupMesConsumidorDescription { font-size: 18px; line-height: 28px; }' +
      '.popupMesConsumidorOffers { margin: 12px 16px 0; padding: 12px; }' +
      '.popupMesConsumidorFooter { padding: 16px; }' +
      '.popupMesConsumidorText { font-size: 15px; line-height: 22px; }' +
      '.popupMesConsumidorAccent { font-size: 18px; line-height: 26px; }' +
      '.popupMesConsumidorCta { font-size: 18px; }' +
      '}';

    document.head.appendChild(style);
  }

  function canShowPopup() {
    const now = Date.now();
    if (now < campaignStartMs || now > campaignEndMs) return false;

    const today = new Date().toISOString().slice(0, 10);
    let dailyData = null;
    try {
      dailyData = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch (e) {
      dailyData = null;
    }

    if (!dailyData || dailyData.date !== today) return true;
    return dailyData.count < DAILY_MAX;
  }

  function registerImpression() {
    const today = new Date().toISOString().slice(0, 10);
    let dailyData = null;

    try {
      dailyData = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch (e) {
      dailyData = null;
    }

    if (!dailyData || dailyData.date !== today) {
      dailyData = { date: today, count: 0 };
    }

    dailyData.count += 1;
    localStorage.setItem(DAILY_KEY, JSON.stringify(dailyData));
  }

  function removeEscHandler() {
    if (escHandler) {
      document.removeEventListener('keydown', escHandler);
      escHandler = null;
    }
  }

  function closeModal(closeReason) {
    const overlay = document.getElementById(MODAL_ID);
    if (!overlay) {
      return;
    }

    if (overlay.classList.contains('closing')) return;
    if (closeReason) {
      analyticsEvent(closeReason, 'popup_close');
    }

    const card = overlay.querySelector('.popupMesConsumidor');
    overlay.classList.add('closing');
    if (card) card.classList.add('closing');

    removeEscHandler();

    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, CLOSE_ANIMATION_MS);
  }

  function bindEscToClose() {
    removeEscHandler();
    escHandler = function (event) {
      if (event.key === 'Escape') {
        closeModal('dismiss_esc');
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function bindOverlayClickToClose(overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeModal('dismiss_overlay');
      }
    });
  }

  function buildModal() {
    const existing = document.getElementById(MODAL_ID);
    if (existing) {
      return existing;
    }
    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'popupMesConsumidorOverlay';
    overlay.innerHTML =
      '<div class="popupMesConsumidor" role="dialog" aria-modal="true" aria-label="Popup Mês do Consumidor">' +
      '  <div class="popupMesConsumidorHeader">' +
      '    <span class="popupMesConsumidorTag">DIA DO CONSUMIDOR</span>' +
      '    <h2 class="popupMesConsumidorTitle">Hoje o <span style="color: #3db2e2;">dia</span> é seu!</h2>' +
      '    <p class="popupMesConsumidorDescription">As melhores ofertas do Mês do Consumidor chegaram.</p>' +
      '    <button type="button" class="popupMesConsumidorClose" aria-label="Fechar popup"></button>' +
      '  </div>' +
      '  <div class="popupMesConsumidorOffers">' +
      '    <span class="popupMesConsumidorBadge">Aproveite</span>' +
      '    <ul class="popupMesConsumidorList">' +
      '      <li class="popupMesConsumidorItem">' +
      '        <span class="popupMesConsumidorNumber">1</span>' +
      '        <span class="popupMesConsumidorText"><span class="popupMesConsumidorAccent">Até 25% OFF</span> em voos nacionais</span>' +
      '      </li>' +
      '      <li class="popupMesConsumidorItem">' +
      '        <span class="popupMesConsumidorNumber">2</span>' +
      '        <span class="popupMesConsumidorText"><span class="popupMesConsumidorAccent">Até 15% OFF</span> em voos internacionais</span>' +
      '      </li>' +
      '      <li class="popupMesConsumidorItem">' +
      '        <span class="popupMesConsumidorNumber">3</span>' +
      '        <span class="popupMesConsumidorText"><span class="popupMesConsumidorAccent">+10% OFF</span> com Cartão Azul Itaú</span>' +
      '      </li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="popupMesConsumidorFooter">' +
      '    <button type="button" class="popupMesConsumidorCta">QUERO MINHA OFERTA</button>' +
      '    <p class="popupMesConsumidorDisclaimer">Válido apenas para 15/03/2026</p>' +
      '  </div>' +
      '</div>';

    const closeButton = overlay.querySelector('.popupMesConsumidorClose');
    const ctaButton = overlay.querySelector('.popupMesConsumidorCta');

    if (closeButton) {
      closeButton.addEventListener('click', function () {
        closeModal('close_x');
      });
    }

    if (ctaButton) {
      ctaButton.addEventListener('click', function () {
        analyticsEvent('cta_popup_mes_consumidor', 'popup_cta');
        window.open(REDIRECT_URL, '_blank', 'noopener,noreferrer');
        closeModal();
      });
    }

    bindEscToClose();
    bindOverlayClickToClose(overlay);

    return overlay;
  }

  function init() {
    if (window.popupMesConsumidorInitialized) return;
    window.popupMesConsumidorInitialized = true;

    injectStyles();
    if (!canShowPopup()) return;
    registerImpression();
    document.body.appendChild(buildModal());
    analyticsEvent('open_popup_mes_consumidor', 'popup_open');
  }

  if (isDomReady()) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
