(function () {
  const REDIRECT_URL = 'https://passagens.voeazul.com.br/pt/melhores-ofertas';
  const MODAL_ID = 'popupMesConsumidor20Off';
  const STYLE_ID = 'popupMesConsumidor20OffStyles';
  const DAILY_KEY = 'popup-mes-consumidor-20off-daily-count';
  const DAILY_MAX = 1;
  const campaignStartMs = new Date(2026, 2, 13, 0, 0, 0).getTime();
  const campaignEndMs = new Date(2026, 2, 19, 23, 59, 0).getTime();
  const CLOSE_ANIMATION_MS = 260;
  const TRACKING_CONTEXT = 'AT_popup_mes_consumidor_20off';
  let escHandler = null;

  function isDomReady() {
    return document.readyState === 'interactive' || document.readyState === 'complete';
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel || !eventType) return;

    const labelEvent = 'AT_MesDoConsumidor_' + eventType + ' ' + eventLabel;

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar84 = TRACKING_CONTEXT;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML =
      '@keyframes popupMesConsumidor20FadeIn {' +
      'from { opacity: 0; }' +
      'to { opacity: 1; }' +
      '}' +
      '@keyframes popupMesConsumidor20FadeOut {' +
      'from { opacity: 1; }' +
      'to { opacity: 0; }' +
      '}' +
      '@keyframes popupMesConsumidor20ScaleIn {' +
      'from { opacity: 0; transform: translateY(10px) scale(0.98); }' +
      'to { opacity: 1; transform: translateY(0) scale(1); }' +
      '}' +
      '@keyframes popupMesConsumidor20ScaleOut {' +
      'from { opacity: 1; transform: translateY(0) scale(1); }' +
      'to { opacity: 0; transform: translateY(10px) scale(0.98); }' +
      '}' +
      '.popupMesConsumidor20Overlay {' +
      'position: fixed;' +
      'inset: 0;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'padding: 16px;' +
      'background: rgba(0, 0, 0, 0.55);' +
      'z-index: 99999;' +
      'animation: popupMesConsumidor20FadeIn 0.26s ease-out;' +
      '}' +
      '.popupMesConsumidor20Overlay.closing {' +
      'animation: popupMesConsumidor20FadeOut 0.26s ease-in forwards;' +
      '}' +
      '.popupMesConsumidor20 {' +
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
      'animation: popupMesConsumidor20ScaleIn 0.26s ease-out;' +
      '}' +
      '.popupMesConsumidor20.closing {' +
      'animation: popupMesConsumidor20ScaleOut 0.26s ease-in forwards;' +
      '}' +
      '.popupMesConsumidor20 * { box-sizing: border-box; }' +
      '.popupMesConsumidor20Header {' +
      'position: relative;' +
      'padding: 24px 24px 0;' +
      '}' +
      '.popupMesConsumidor20Tag {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'padding: 0 12px;' +
      'height: 25px;' +
      'background: #041e42;' +
      'border-radius: 999px;' +
      'font-size: 11px;' +
      'line-height: 16px;' +
      '}' +
      '.popupMesConsumidor20Title {' +
      'margin: 16px 0 12px;' +
      'font-size: 36px;' +
      'line-height: 31px;' +
      'font-weight: 700;' +
      '}' +
      '.popupMesConsumidor20Description {' +
      'margin: 0;' +
      'font-size: 20px;' +
      'line-height: 32px;' +
      'color: rgba(255, 255, 255, 0.7);' +
      '}' +
      '.popupMesConsumidor20Close {' +
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
      '.popupMesConsumidor20Close::before, .popupMesConsumidor20Close::after {' +
      'content: "";' +
      'position: absolute;' +
      'top: 15px;' +
      'left: 8px;' +
      'width: 16px;' +
      'height: 2px;' +
      'background: rgba(255, 255, 255, 0.9);' +
      'border-radius: 2px;' +
      '}' +
      '.popupMesConsumidor20Close::before { transform: rotate(45deg); }' +
      '.popupMesConsumidor20Close::after { transform: rotate(-45deg); }' +
      '.popupMesConsumidor20Offers {' +
      'margin: 16px 24px 0;' +
      'padding: 24px 16px;' +
      'border: 1px solid rgba(255, 255, 255, 0.1);' +
      'border-radius: 12px;' +
      'background: linear-gradient(160deg, #004f87 8.49%, #003660 91.51%);' +
      '}' +
      '.popupMesConsumidor20List {' +
      'margin: 0;' +
      'padding: 0;' +
      'list-style: none;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 16px;' +
      '}' +
      '.popupMesConsumidor20Item {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 12px;' +
      'padding: 12px;' +
      'border-radius: 14px;' +
      'background: #0061a0;' +
      'border-left: 4px solid #3db2e2;' +
      '}' +
      '.popupMesConsumidor20Number {' +
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
      'letter-spacing: -0.15px;' +
      'color: #fff;' +
      'flex-shrink: 0;' +
      '}' +
      '.popupMesConsumidor20Text {' +
      'font-family: Inter, Arial, sans-serif;' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      'font-weight: 600;' +
      'letter-spacing: -0.31px;' +
      'color: #ffffff;' +
      '}' +
      '.popupMesConsumidor20Accent {' +
      'font-size: 20px;' +
      'line-height: 28px;' +
      'font-weight: 700;' +
      'letter-spacing: -0.45px;' +
      'color: #3db2e2;' +
      '}' +
      '.popupMesConsumidor20Footer {' +
      'padding: 16px 24px 24px;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      '}' +
      '.popupMesConsumidor20Cta {' +
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
      '.popupMesConsumidor20Disclaimer {' +
      'margin: 0;' +
      'text-align: center;' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      'color: rgba(255, 255, 255, 0.8);' +
      '}' +
      '@media (max-width: 560px) {' +
      '.popupMesConsumidor20Overlay { padding: 8px; }' +
      '.popupMesConsumidor20Header { padding: 16px 16px 0; }' +
      '.popupMesConsumidor20Close { top: 16px; right: 16px; }' +
      '.popupMesConsumidor20Title { font-size: 30px; line-height: 32px; }' +
      '.popupMesConsumidor20Description { font-size: 18px; line-height: 28px; }' +
      '.popupMesConsumidor20Offers { margin: 12px 16px 0; padding: 12px; }' +
      '.popupMesConsumidor20Footer { padding: 16px; }' +
      '.popupMesConsumidor20Text { font-size: 15px; line-height: 22px; }' +
      '.popupMesConsumidor20Accent { font-size: 18px; line-height: 26px; }' +
      '.popupMesConsumidor20Cta { font-size: 18px; }' +
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
    if (!overlay) return;
    if (overlay.classList.contains('closing')) return;
    if (closeReason) {
      analyticsEvent(closeReason, 'popup_close');
    }

    const card = overlay.querySelector('.popupMesConsumidor20');
    overlay.classList.add('closing');
    if (card) card.classList.add('closing');

    removeEscHandler();

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
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
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'popupMesConsumidor20Overlay';
    overlay.innerHTML =
      '<div class="popupMesConsumidor20" role="dialog" aria-modal="true" aria-label="Popup Mês do Consumidor 20 OFF">' +
      '  <div class="popupMesConsumidor20Header">' +
      '    <span class="popupMesConsumidor20Tag">MÊS DO CONSUMIDOR</span>' +
      '    <h2 class="popupMesConsumidor20Title">A <span style="color:#3DB2E2;">festa</span> continua!</h2>' +
      '    <p class="popupMesConsumidor20Description">O mês do Consumidor ainda tem ofertas imperdíveis para você voar pelo Brasil:</p>' +
      '    <button type="button" class="popupMesConsumidor20Close" aria-label="Fechar popup"></button>' +
      '  </div>' +
      '  <div class="popupMesConsumidor20Offers">' +
      '    <ul class="popupMesConsumidor20List">' +
      '      <li class="popupMesConsumidor20Item">' +
      '        <span class="popupMesConsumidor20Number">1</span>' +
      '        <span class="popupMesConsumidor20Text">Até <span class="popupMesConsumidor20Accent">20% OFF</span> em voos nacionais</span>' +
      '      </li>' +
      '      <li class="popupMesConsumidor20Item">' +
      '        <span class="popupMesConsumidor20Number">2</span>' +
      '        <span class="popupMesConsumidor20Text"><span class="popupMesConsumidor20Accent">+10% OFF</span> com Cartão Azul Itaú</span>' +
      '      </li>' +
      '      <li class="popupMesConsumidor20Item">' +
      '        <span class="popupMesConsumidor20Number">3</span>' +
      '        <span class="popupMesConsumidor20Text"><span class="popupMesConsumidor20Accent">+5% OFF</span> pagando no PIX</span>' +
      '      </li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="popupMesConsumidor20Footer">' +
      '    <button type="button" class="popupMesConsumidor20Cta">APROVEITE AGORA</button>' +
      '    <p class="popupMesConsumidor20Disclaimer">Válido entre os dias 16 e 19/03/2026</p>' +
      '  </div>' +
      '</div>';

    const closeButton = overlay.querySelector('.popupMesConsumidor20Close');
    const ctaButton = overlay.querySelector('.popupMesConsumidor20Cta');

    if (closeButton) {
      closeButton.addEventListener('click', function () {
        closeModal('close_x');
      });
    }

    if (ctaButton) {
      ctaButton.addEventListener('click', function () {
        analyticsEvent('cta_popup_mes_consumidor_20off', 'popup_cta');
        window.open(REDIRECT_URL, '_blank', 'noopener,noreferrer');
        closeModal();
      });
    }

    bindEscToClose();
    bindOverlayClickToClose(overlay);

    return overlay;
  }

  function init() {
    if (window.popupMesConsumidor20OffInitialized) return;
    window.popupMesConsumidor20OffInitialized = true;

    injectStyles();
    if (!canShowPopup()) return;
    registerImpression();
    document.body.appendChild(buildModal());
    analyticsEvent('open_popup_mes_consumidor_20off', 'popup_open');
  }

  if (isDomReady()) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
