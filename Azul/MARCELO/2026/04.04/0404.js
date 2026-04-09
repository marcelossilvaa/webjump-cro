(function () {
  const REDIRECT_URL = 'https://passagens.voeazul.com.br/pt/mes-do-consumidor';
  const MODAL_ID = 'popup4.4';
  const STYLE_ID = 'popup4.4Styles';
  const DAILY_KEY = 'popup-4.4-daily-count';
  const DAILY_MAX = 1;
  const ALLOWED_HOST = 'www.voeazul.com.br';
  const ALLOWED_PATHS = new Set(['/br/pt/ofertas/datas-duplas', '/home/br/pt/home']);
  const campaignStartMs = new Date(2026, 2, 31, 0, 0, 0).getTime();
  const campaignEndMs = new Date(2026, 3, 5, 23, 59, 59).getTime();
  const CLOSE_ANIMATION_MS = 260;
  const TRACKING_CONTEXT = 'AT_popup_4.4';
  let escHandler = null;

  function isDomReady() {
    return document.readyState === 'interactive' || document.readyState === 'complete';
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel || !eventType) return;

    const contextEvent = TRACKING_CONTEXT;
    const eventDetail = String(eventType) + '|' + String(eventLabel);

    (function () {
      const s = globalThis.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = eventDetail;
      s.eVar84 = contextEvent;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML =
      '@keyframes popup4_4FadeIn {' +
      'from { opacity: 0; }' +
      'to { opacity: 1; }' +
      '}' +
      '@keyframes popup4_4FadeOut {' +
      'from { opacity: 1; }' +
      'to { opacity: 0; }' +
      '}' +
      '@keyframes popup4_4ScaleIn {' +
      'from { opacity: 0; transform: translateY(10px) scale(0.98); }' +
      'to { opacity: 1; transform: translateY(0) scale(1); }' +
      '}' +
      '@keyframes popup4_4ScaleOut {' +
      'from { opacity: 1; transform: translateY(0) scale(1); }' +
      'to { opacity: 0; transform: translateY(10px) scale(0.98); }' +
      '}' +
      '.popup4_4Overlay {' +
      'position: fixed;' +
      'inset: 0;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'padding: 16px;' +
      'background: rgba(0, 0, 0, 0.55);' +
      'z-index: 99999;' +
      'animation: popup4_4FadeIn 0.26s ease-out;' +
      '}' +
      '.popup4_4Overlay.closing {' +
      'animation: popup4_4FadeOut 0.26s ease-in forwards;' +
      '}' +
      '.popup4_4 {' +
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
      'animation: popup4_4ScaleIn 0.26s ease-out;' +
      '}' +
      '.popup4_4.closing {' +
      'animation: popup4_4ScaleOut 0.26s ease-in forwards;' +
      '}' +
      '.popup4_4 * { box-sizing: border-box; }' +
      '.popup4_4Header {' +
      'position: relative;' +
      'padding: 24px 24px 0;' +
      '}' +
      '.popup4_4Top {' +
      'position: relative;' +
      'display: inline-flex;' +
      'align-items: center;' +
      'gap: 5px;' +
      'padding: 5px;' +
      'border: 0.65px solid #FFFFFF;' +
      'border-radius: 14px;' +
      'background: transparent;' +
      '}' +
      '.popup4_4TopIcon {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'width: 47px;' +
      'height: 46px;' +
      'border: 0.65px solid transparent;' +
      'border-radius: 10px;' +
      'background: radial-gradient(circle, #9747FF 0%, #9747FF33 100%) padding-box, linear-gradient(225.51deg, #FFFFFF 6.02%, rgba(255, 255, 255, 0) 91.64%) border-box;' +
      '}' +
      '.popup4_4TopIcon svg {' +
      'display: block;' +
      'width: 27px;' +
      'height: 25px;' +
      '}' +
      '.popup4_4TagFrame {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'height: 46px;' +
      'padding: 0 10px;' +
      'border: 0.65px solid transparent;' +
      'border-radius: 10px;' +
      'background: linear-gradient(175deg, #0061a0 3.67%, #004a7c 96.33%) padding-box, linear-gradient(225.51deg, #F0DE00 6.02%, rgba(240, 222, 0, 0) 91.64%) border-box;' +
      '}' +
      '.popup4_4Tag {' +
      'display: inline-block;' +
      'padding: 0;' +
      'height: auto;' +
      'background: transparent;' +
      'color: #F0DE00;' +
      'font-family: "Helvetica Neue LT Pro", "Helvetica Neue", Arial, sans-serif;' +
      'font-size: 43.32px;' +
      'line-height: 43.32px;' +
      'font-weight: 750;' +
      '}' +
      '.popup4_4Title {' +
      'margin: 16px 0 12px;' +
      'font-size: 23.41px;' +
      'line-height: 31px;' +
      'font-weight: 400;' +
      'color: #ffffff;' +
      '}' +
      '.popup4_4TitleStrong { font-weight: 700; }' +
      '.popup4_4Description {' +
      'margin: 0;' +
      'font-size: 20px;' +
      'line-height: 32px;' +
      'color: rgba(255, 255, 255, 0.7);' +
      '}' +
      '.popup4_4Close {' +
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
      '.popup4_4Close::before, .popup4_4Close::after {' +
      'content: "";' +
      'position: absolute;' +
      'top: 15px;' +
      'left: 8px;' +
      'width: 16px;' +
      'height: 2px;' +
      'background: rgba(255, 255, 255, 0.9);' +
      'border-radius: 2px;' +
      '}' +
      '.popup4_4Close::before { transform: rotate(45deg); }' +
      '.popup4_4Close::after { transform: rotate(-45deg); }' +
      '.popup4_4Offers {' +
      'margin: 16px 24px 0;' +
      'padding: 16px;' +
      'border: 1px solid rgba(255, 255, 255, 0.1);' +
      'border-radius: 12px;' +
      'background: linear-gradient(160deg, #004f87 8.49%, #003660 91.51%);' +
      '}' +
      '.popup4_4Badge {' +
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
      '.popup4_4List {' +
      'margin: 16px 0 0;' +
      'padding: 0;' +
      'list-style: none;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      '}' +
      '.popup4_4Item {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 12px;' +
      'padding: 12px 14px 12px 12px;' +
      'border-radius: 14px;' +
      'background: #0061a0;' +
      'border-left: 4px solid #3db2e2;' +
      '}' +
      '.popup4_4Number {' +
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
      '.popup4_4Text {' +
      'font-family: Inter, Arial, sans-serif;' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      'font-weight: 600;' +
      'color: #ffffff;' +
      '}' +
      '.popup4_4Accent {' +
      'font-size: 20px;' +
      'line-height: 28px;' +
      'font-weight: 700;' +
      'color: #3db2e2;' +
      '}' +
      '.popup4_4Footer {' +
      'padding: 16px 24px 24px;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      '}' +
      '.popup4_4Cta {' +
      'width: 100%;' +
      'height: 56px;' +
      'border: none;' +
      'border-radius: 24px;' +
      'background: #F0DE00;' +
      'color: #0062A1;' +
      'font-size: 20px;' +
      'font-weight: 700;' +
      'line-height: 24px;' +
      'letter-spacing: 0.8px;' +
      'text-transform: uppercase;' +
      'cursor: pointer;' +
      '}' +
      '.popup4_4Disclaimer {' +
      'margin: 0;' +
      'text-align: center;' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      'color: rgba(255, 255, 255, 0.8);' +
      '}' +
      '@media (max-width: 560px) {' +
      '.popup4_4Overlay { padding: 8px; }' +
      '.popup4_4Header { padding: 16px 16px 0; }' +
      '.popup4_4Close { top: 16px; right: 16px; }' +
      '.popup4_4Title { font-size: 23.41px; line-height: 31px; }' +
      '.popup4_4Description { font-size: 18px; line-height: 28px; }' +
      '.popup4_4Offers { margin: 12px 16px 0; padding: 12px; }' +
      '.popup4_4Footer { padding: 16px; }' +
      '.popup4_4Text { font-size: 15px; line-height: 22px; }' +
      '.popup4_4Accent { font-size: 18px; line-height: 26px; }' +
      '.popup4_4Cta { font-size: 18px; }' +
      '}';

    document.head.appendChild(style);
  }

  function isAllowedPage() {
    if (globalThis.location.hostname !== ALLOWED_HOST) return false;

    const normalizedPath = globalThis.location.pathname.replace(/\/+$/, '') || '/';
    return ALLOWED_PATHS.has(normalizedPath);
  }

  function canShowPopup() {
    if (!isAllowedPage()) return false;

    const now = Date.now();
    if (now < campaignStartMs || now > campaignEndMs) return false;

    const today = new Date().toISOString().slice(0, 10);
    let dailyData = null;
    try {
      dailyData = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch {
      dailyData = null;
    }

    if (dailyData?.date !== today) return true;
    return dailyData.count < DAILY_MAX;
  }

  function registerImpression() {
    const today = new Date().toISOString().slice(0, 10);
    let dailyData = null;

    try {
      dailyData = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch {
      dailyData = null;
    }

    if (dailyData?.date !== today) {
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

    const card = overlay.querySelector('.popup4_4');
    overlay.classList.add('closing');
    if (card) card.classList.add('closing');

    removeEscHandler();

    setTimeout(function () {
      if (overlay.parentNode) overlay.remove();
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
    overlay.className = 'popup4_4Overlay';
    overlay.innerHTML =
      '<div class="popup4_4" role="dialog" aria-modal="true" aria-label="Popup 4.4">' +
      '  <div class="popup4_4Header">' +
      '    <div class="popup4_4Top">' +
      '      <span class="popup4_4TopIcon" aria-hidden="true">' +
      '        <svg width="27" height="25" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '          <path d="M17.199 14.7423L12.9241 23.201L10.7034 23.7405L12.3023 13.5016" stroke="white" stroke-width="1.10821" stroke-linejoin="round"/>' +
      '          <path d="M4.03076 15.8211L5.774 18.6371L6.65118 17.8063V15.5514" stroke="white" stroke-width="1.10821" stroke-linejoin="round"/>' +
      '          <path d="M16.908 6.11116L13.1994 7.71874C12.7997 7.89137 12.3111 7.77269 12.0669 7.40586C11.7782 6.98508 11.6227 6.57509 11.5228 6.24063C11.4118 5.83064 11.6338 5.39908 12.0335 5.21566L15.7532 3.59729C15.7532 3.59729 16.8413 4.21227 16.8969 6.08958L16.908 6.11116Z" stroke="white" stroke-width="1.10821" stroke-linejoin="round"/>' +
      '          <path d="M19.6066 13.7381L15.8092 15.1515C15.3984 15.3026 14.9209 15.1515 14.6988 14.7847C14.4324 14.3531 14.2991 13.9323 14.2214 13.5979C14.1326 13.1771 14.3768 12.7563 14.7988 12.6053L18.6073 11.1919C18.6073 11.1919 19.651 11.8716 19.6066 13.7489V13.7381Z" stroke="white" stroke-width="1.10821" stroke-linejoin="round"/>' +
      '          <path d="M15.677 6.64994L17.1982 7.56702L21.6396 5.84075C22.3613 5.56024 23.1497 5.53866 23.8936 5.76523L25.2815 6.1968C26.1254 6.45574 26.3253 7.52386 25.6368 8.06332C24.7819 8.72146 23.827 9.25013 22.8055 9.62775L5.91711 15.8639L1.7089 15.8315L2.87476 14.6986L0.554138 11.3108L1.7089 10.7498L5.19538 13.0047L11.0025 10.1888L3.3078 1.09353L5.52849 0.554077L12.7901 4.91289" stroke="white" stroke-width="1.10821" stroke-linejoin="round"/>' +
      '        </svg>' +
      '      </span>' +
      '      <span class="popup4_4TagFrame"><span class="popup4_4Tag">4.4</span></span>' +
      '    </div>' +
      '    <h2 class="popup4_4Title"><span class="popup4_4TitleStrong">Sua próxima viagem</span> começa agora!</h2>' +
      '    <p class="popup4_4Description">Aproveite ofertas imperdíveis para voar com os melhores preços:</p>' +
      '    <button type="button" class="popup4_4Close" aria-label="Fechar popup"></button>' +
      '  </div>' +
      '  <div class="popup4_4Offers">' +
      '    <ul class="popup4_4List">' +
      '      <li class="popup4_4Item">' +
      '        <span class="popup4_4Number">1</span>' +
      '        <span class="popup4_4Text">Passagens a partir de <span class="popup4_4Accent">R$144,00</span></span>' +
      '      </li>' +
      '      <li class="popup4_4Item">' +
      '        <span class="popup4_4Number">2</span>' +
      '        <span class="popup4_4Text">Ou a partir de <span class="popup4_4Accent">4.400 pontos</span></span>' +
      '      </li>' +
      '      <li class="popup4_4Item">' +
      '        <span class="popup4_4Number">3</span>' +
      '        <span class="popup4_4Text"><span class="popup4_4Accent">+10% OFF</span> com Cartão Azul Itaú</span>' +
      '      </li>' +
      '    </ul>' +
      '  </div>' +
      '  <div class="popup4_4Footer">' +
      '    <button type="button" class="popup4_4Cta">APROVEITE AGORA</button>' +
      '    <p class="popup4_4Disclaimer">Aproveite as melhores ofertas do dia 4.4</p>' +
      '  </div>' +
      '</div>';

    const closeButton = overlay.querySelector('.popup4_4Close');
    const ctaButton = overlay.querySelector('.popup4_4Cta');

    if (closeButton) {
      closeButton.addEventListener('click', function () {
        closeModal('close_x');
      });
    }

    if (ctaButton) {
      ctaButton.addEventListener('click', function () {
        analyticsEvent('cta_popup_4.4', 'popup_cta');
        window.open(REDIRECT_URL, '_blank', 'noopener,noreferrer');
        closeModal();
      });
    }

    bindEscToClose();
    bindOverlayClickToClose(overlay);

    return overlay;
  }

  function init() {
    if (globalThis.popup4_4Initialized) return;

    injectStyles();
    if (!canShowPopup()) return;

    globalThis.popup4_4Initialized = true;
    registerImpression();
    document.body.appendChild(buildModal());
    analyticsEvent('open_popup_4.4', 'popup_open');
  }

  if (isDomReady()) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
