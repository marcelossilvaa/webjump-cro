// POPUP ANTECIPACAO DE VOO - MINHAS VIAGENS
// Variacoes: topazio_safira | diamante | unificado | auto

(function () {
  'use strict';

  const SCRIPT_FLAG = 'atAntecipacaoVooMinhasViagens';
  const POPUP_ID = 'at-antecipacao-mv-popup';
  const BUTTON_ID = 'at-antecipacao-mv-floating-btn';
  const WRAPPER_ID = 'at-antecipacao-mv-wrapper';
  const STYLE_ID = 'at-antecipacao-mv-popup-styles';
  const FONT_FAMILY = '"Helvetica Neue", Arial, sans-serif';
  const PAGE_URL_PATTERN = 'br/pt/home/minhas-viagens?pnr=';
  const DOM_WAIT_MS = 300;
  const DOM_MAX_RETRIES = 40;

  const VARIANT = 'auto';

  const CTA_URL =
    'https://www.voeazul.com.br/br/pt/sobreazul/para-a-sua-viagem/antecipacao-de-voo';

  const SELECTORS = {
    reservationCode: '.container__reservation__text__code',
    tripInfo: '.container__info__text',
    flightsTitle: '.container-title h3',
  };

  const STORAGE_KEYS = {
    INTERACTED: 'at_antecipacao_mv_popup_interacted_date',
    SESSION_SHOWN: 'at_antecipacao_mv_popup_session_shown',
  };

  let activeVariant = null;
  let popupInjected = false;
  let domObserver = null;

  function analyticsEvent(eventLabel, eventType, variant) {
    if (!eventLabel) return;

    const suffix = variant ? '_' + variant : '';
    const labelEvent =
      'AT_AntecipacaoVoo_MinhasViagens' + suffix + '_' + eventType + ' ' + eventLabel;

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_AntecipacaoVoo_MinhasViagens';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function normalizeText(value) {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function getCookieValue(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName + '=') === 0) {
        return cookie.substring(cookieName.length + 1);
      }
    }
    return null;
  }

  function readTudoAzulCookie() {
    const raw = getCookieValue('TudoAzul');
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch (e) {
      return null;
    }
  }

  function resolveTierProfile(cookieData) {
    const levelCode = (cookieData && cookieData.program && cookieData.program.levelCode) || '';
    const levelName = (cookieData && cookieData.program && cookieData.program.name) || '';
    const normalized = (String(levelCode) + ' ' + String(levelName)).toUpperCase();
    const normalizedNoAccent = normalizeText(levelCode + ' ' + levelName);

    let tier = 'azul';
    if (normalized.indexOf('UNQ') !== -1 || normalizedNoAccent.indexOf('unique') !== -1) {
      tier = 'unique';
    } else if (normalized.indexOf('DIA') !== -1 || normalizedNoAccent.indexOf('diamante') !== -1) {
      tier = 'diamante';
    } else if (
      normalized.indexOf('SAF') !== -1 ||
      normalizedNoAccent.indexOf('safira') !== -1 ||
      normalized.indexOf('TA+') !== -1 ||
      normalizedNoAccent.indexOf('topazio') !== -1
    ) {
      tier = 'topazio_safira';
    }

    return { tier: tier };
  }

  function resolveVariant(profile) {
    if (VARIANT === 'topazio_safira' || VARIANT === 'diamante' || VARIANT === 'unificado') {
      return VARIANT;
    }

    if (profile.tier === 'topazio_safira') return 'topazio_safira';
    if (profile.tier === 'diamante' || profile.tier === 'unique') return 'diamante';
    return 'unificado';
  }

  function isVariantEligible(variant, profile) {
    if (VARIANT !== 'auto') return true;

    if (variant === 'topazio_safira') return profile.tier === 'topazio_safira';
    if (variant === 'diamante') return profile.tier === 'diamante' || profile.tier === 'unique';
    return profile.tier === 'azul' || !profile.hasCookie;
  }

  function isConfirmacaoUrl() {
    const href = (window.location.href || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    return href.indexOf('confirmacao') !== -1 || path.indexOf('confirmacao') !== -1;
  }

  function isMinhasViagensPage() {
    if (isConfirmacaoUrl()) return false;

    const href = (window.location.href || '').toLowerCase();
    return href.indexOf(PAGE_URL_PATTERN) !== -1;
  }

  function getPnrFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      return String(params.get('pnr') || '')
        .replace(/\s+/g, '')
        .trim()
        .toUpperCase();
    } catch (e) {
      return '';
    }
  }

  function getPnrFromPage() {
    const el = document.querySelector(SELECTORS.reservationCode);
    if (el) {
      const fromDom = String(el.textContent || '')
        .replace(/\s+/g, '')
        .trim()
        .toUpperCase();
      if (fromDom) return fromDom;
    }
    return getPnrFromUrl();
  }

  function getPageText() {
    return normalizeText(document.body ? document.body.innerText || '' : '');
  }

  function hasFlightsSection() {
    const headings = document.querySelectorAll('h2, h3, .container-title h3');
    for (let i = 0; i < headings.length; i += 1) {
      if (normalizeText(headings[i].textContent || '').indexOf('voos') !== -1) {
        return true;
      }
    }

    if (document.querySelector('time[datetime]')) return true;

    return getPageText().indexOf('voos') !== -1;
  }

  function hasTripSectionMarkers() {
    const tripInfo = document.querySelector(SELECTORS.tripInfo);
    const reservationBlock = document.querySelector('.container__reservation');
    const pageText = getPageText();

    if (tripInfo && normalizeText(tripInfo.textContent || '').indexOf('sua viagem') !== -1) {
      return true;
    }

    if (
      reservationBlock &&
      normalizeText(reservationBlock.textContent || '').indexOf('codigo da reserva') !== -1
    ) {
      return true;
    }

    return (
      pageText.indexOf('sua viagem') !== -1 || pageText.indexOf('codigo da reserva') !== -1
    );
  }

  function isPnrVisibleOnPage(pnr) {
    if (!pnr) return false;

    const codeEl = document.querySelector(SELECTORS.reservationCode);
    if (codeEl) {
      const fromDom = normalizeText(codeEl.textContent || '').replace(/\s+/g, '');
      if (fromDom.indexOf(pnr.toLowerCase()) !== -1) return true;
    }

    const pageText = getPageText().replace(/\s+/g, '');
    return pageText.indexOf(pnr.toLowerCase()) !== -1;
  }

  function hasConfirmedReservationOnPage(pnr) {
    if (!pnr || pnr.length < 5) return false;
    if (!hasTripSectionMarkers()) return false;
    if (!hasFlightsSection()) return false;

    if (isPnrVisibleOnPage(pnr)) return true;

    return getPnrFromUrl() === pnr;
  }

  function isReservationEligible() {
    if (!isMinhasViagensPage()) return false;

    const pnr = getPnrFromPage();
    return hasConfirmedReservationOnPage(pnr);
  }

  function getStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return;
    }
  }

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  function hasInteractedToday() {
    return getStorage(STORAGE_KEYS.INTERACTED) === getTodayDateString();
  }

  function markInteraction() {
    setStorage(STORAGE_KEYS.INTERACTED, getTodayDateString());
  }

  function wasShownThisSession() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.SESSION_SHOWN) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markShownThisSession() {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_SHOWN, 'true');
    } catch (e) {
      return;
    }
  }

  function floatingIconSVG() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 80 80" fill="none" aria-hidden="true">' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M38.23 25.9351C38.9597 24.5248 41.0351 24.5251 41.7651 25.9351L41.8994 26.2598L44.5557 34.4287H53.1445C55.0816 34.4287 55.8875 36.9078 54.3213 38.0469L47.3706 43.0957L50.0244 51.2646C50.6225 53.107 48.5155 54.6395 46.9482 53.501L39.9976 48.4521L33.0493 53.501C31.4822 54.6385 29.373 53.1066 29.9707 51.2646L32.6221 43.0957L25.6763 38.0469C24.1095 36.9084 24.9144 34.4302 26.8506 34.4287H35.4419L38.0957 26.2598L38.23 25.9351ZM37.2583 36.9287H28.3887L35.564 42.1411L32.8223 50.5737L39.9976 45.3613L47.1704 50.5713L44.4312 42.1411L51.6064 36.9287H42.7393L39.9976 28.4961L37.2583 36.9287Z" fill="#041E42"/>' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M40 18.125C52.0812 18.125 61.875 27.9188 61.875 40C61.875 52.0812 52.0812 61.875 40 61.875C27.9188 61.875 18.125 52.0812 18.125 40C18.125 27.9188 27.9188 18.125 40 18.125ZM40 21.1255C29.5756 21.1255 21.1255 29.5756 21.1255 40C21.1255 50.4244 29.5756 58.8745 40 58.8745C50.4244 58.8745 58.8745 50.4244 58.8745 40C58.8745 29.5756 50.4244 21.1255 40 21.1255Z" fill="#041E42"/>' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M40 10C56.5685 10 70 23.4315 70 40C70 56.5685 56.5685 70 40 70C23.4315 70 10 56.5685 10 40C10 23.4315 23.4315 10 40 10ZM40 13.0005C25.0883 13.0005 13.0005 25.0883 13.0005 40C13.0005 54.9117 25.0883 66.9995 40 66.9995C54.9117 66.9995 66.9995 54.9117 66.9995 40C66.9995 25.0883 54.9117 13.0005 40 13.0005Z" fill="#041E42"/>' +
      '</svg>'
    );
  }

  function iconTopazioSVG() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<path d="M16 23L4 9H28L22 16L16 23ZM16 20.6943L24.7383 10.5H7.26172L16 20.6943Z" fill="#041E42"/>' +
      '</svg>'
    );
  }

  function iconSafiraSVG() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<path d="M25 16L16 28L7 16L16 4L25 16ZM8.875 16L16 25.499L23.124 16L16 6.5L8.875 16Z" fill="#041E42"/>' +
      '</svg>'
    );
  }

  function iconDiamanteSVG() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M28 12.3096L16 26.5L4 12.3096L9.71387 5.5H22.2861L28 12.3096ZM5.96094 12.3057L16 24.1758L26.0381 12.3057L21.5869 7H10.4131L5.96094 12.3057Z" fill="#041E42"/>' +
      '</svg>'
    );
  }

  function iconUniqueSVG() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<path d="M19.6064 7.37598H10.5488L5.93945 12.9062L15.9463 25.2959L25.9941 12.8555L25.2549 11.7461L26.5029 10.9141L27.5479 12.4824L27.8545 12.9414L15.9473 27.6836L4 12.8916L9.8457 5.87598H19.6064V7.37598Z" fill="#041E42"/>' +
      '<path d="M22.7422 4C22.7422 6.88722 25.0825 9.22754 27.9697 9.22754C25.0827 9.22754 22.7424 11.5671 22.7422 14.4541C22.7419 11.5672 20.4025 9.22779 17.5156 9.22754C20.4026 9.22729 22.7422 6.88706 22.7422 4Z" fill="#041E42"/>' +
      '</svg>'
    );
  }

  function iconClockSVG() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<circle cx="16" cy="16" r="14" stroke="#041E42" stroke-width="1.5"/>' +
      '<path d="M16 8.5V16L20.5 18.5" stroke="#041E42" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function createTierGroupHTML(leftIcon, leftLabel, rightIcon, rightLabel, showNovo) {
    const novoBadge = showNovo
      ? '<span class="at-antecipacao-mv-novo">NOVO</span>'
      : '<span class="at-antecipacao-mv-novo at-antecipacao-mv-novo--placeholder" aria-hidden="true"></span>';

    return (
      '<div class="at-antecipacao-mv-tier-group">' +
      novoBadge +
      '<div class="at-antecipacao-mv-tier-row">' +
      '<div class="at-antecipacao-mv-tier-item">' +
      '<span class="at-antecipacao-mv-tier-ico">' +
      leftIcon +
      '</span>' +
      '<span class="at-antecipacao-mv-tier-label">' +
      leftLabel +
      '</span>' +
      '</div>' +
      '<span class="at-antecipacao-mv-tier-amp">&amp;</span>' +
      '<div class="at-antecipacao-mv-tier-item">' +
      '<span class="at-antecipacao-mv-tier-ico">' +
      rightIcon +
      '</span>' +
      '<span class="at-antecipacao-mv-tier-label">' +
      rightLabel +
      '</span>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function createInfoCardHTML(textHtml) {
    return (
      '<div class="at-antecipacao-mv-info-card">' +
      '<p class="at-antecipacao-mv-info-title">Mais facilidade para você!</p>' +
      '<div class="at-antecipacao-mv-info-row">' +
      '<span class="at-antecipacao-mv-info-ico">' +
      iconClockSVG() +
      '</span>' +
      '<p class="at-antecipacao-mv-info-text">' +
      textHtml +
      '</p>' +
      '</div>' +
      '</div>'
    );
  }

  function createTopazioSafiraSectionHTML() {
    return (
      createTierGroupHTML(iconTopazioSVG(), 'TOPÁZIO', iconSafiraSVG(), 'SAFIRA', true) +
      createInfoCardHTML(
        'Agora seu voo nacional pode ser antecipado em até <strong>6h30min</strong> antes do voo original escolhido, com antecedência mínima de <strong>1h30</strong>.'
      )
    );
  }

  function createDiamanteSectionHTML() {
    return (
      createTierGroupHTML(
        iconDiamanteSVG(),
        'DIAMANTE',
        iconUniqueSVG(),
        'DIAMANTE UNIQUE',
        false
      ) +
      createInfoCardHTML(
        'Sua janela de solicitação e antecipação foram ampliadas. Faça a solicitação um dia antes, e escolha qualquer voo no mesmo dia do voo original.'
      )
    );
  }

  function createPopupBodyHTML(variant) {
    let sections = '';
    let popupClass = 'at-antecipacao-mv-popup';

    if (variant === 'topazio_safira') {
      sections = createTopazioSafiraSectionHTML();
    } else if (variant === 'diamante') {
      sections = createDiamanteSectionHTML();
    } else {
      popupClass += ' is-unificado';
      sections =
        createTopazioSafiraSectionHTML() +
        '<div class="at-antecipacao-mv-divider"></div>' +
        createDiamanteSectionHTML();
    }

    return (
      '<div class="' +
      popupClass +
      '" id="' +
      POPUP_ID +
      '" data-variant="' +
      variant +
      '">' +
      '<div class="at-antecipacao-mv-arrow"></div>' +
      '<button class="at-antecipacao-mv-close" type="button" aria-label="Fechar popup">&times;</button>' +
      '<div class="at-antecipacao-mv-head">' +
      '<h2 class="at-antecipacao-mv-title">Seus benefícios evoluíram</h2>' +
      '<p class="at-antecipacao-mv-subtitle">Antecipação de voo gratuita</p>' +
      '</div>' +
      '<div class="at-antecipacao-mv-divider"></div>' +
      sections +
      '<a class="at-antecipacao-mv-cta" href="' +
      CTA_URL +
      '" target="_blank" rel="noopener noreferrer">Saiba mais</a>' +
      '</div>'
    );
  }

  function createPopupHTML(variant) {
    return (
      '<button id="' +
      BUTTON_ID +
      '" type="button" aria-label="Abrir popup de antecipacao de voo">' +
      floatingIconSVG() +
      '</button>' +
      createPopupBodyHTML(variant)
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const styles = document.createElement('style');
    styles.id = STYLE_ID;
    styles.textContent =
      '@keyframes atAntecipacaoMvPulse{0%{transform:scale(1)}50%{transform:scale(1.04)}100%{transform:scale(1)}}' +
      '#' +
      WRAPPER_ID +
      '{position:fixed;top:0;left:0;width:0;height:0;margin:0;padding:0;overflow:visible;pointer-events:none;z-index:999997;}' +
      '#' +
      WRAPPER_ID +
      ' *{font-family:' +
      FONT_FAMILY +
      ';box-sizing:border-box;}' +
      '#' +
      WRAPPER_ID +
      ' button,' +
      '#' +
      WRAPPER_ID +
      ' a,' +
      '#' +
      WRAPPER_ID +
      ' .at-antecipacao-mv-popup{pointer-events:auto;}' +
      '#' +
      BUTTON_ID +
      '{position:fixed;right:22px;bottom:24px;width:60px;height:60px;border-radius:50%;display:none;align-items:center;justify-content:center;border:none;cursor:pointer;background:#DFF2FE;z-index:999998;filter:drop-shadow(0 4px 4px rgba(0,0,0,.25));transition:transform .24s ease,filter .24s ease;animation:atAntecipacaoMvPulse 2.2s infinite;}' +
      '#' +
      BUTTON_ID +
      '.visible{display:flex;}' +
      '#' +
      BUTTON_ID +
      ':hover{transform:translateY(-2px) scale(1.08);filter:drop-shadow(0 8px 14px rgba(0,0,0,.3));animation:none;}' +
      '.at-antecipacao-mv-popup{position:fixed;right:100px;bottom:24px;width:303px;max-width:calc(100vw - 120px);max-height:calc(100dvh - 48px);max-height:calc(100vh - 48px);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:#DFF2FE;border-radius:16px;color:#041E42;padding:24px;box-sizing:border-box;z-index:999999;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(12px) scale(.96);transition:opacity .28s ease,visibility .28s ease,transform .28s ease;display:flex;flex-direction:column;gap:16px;min-height:0;box-shadow:0 16px 40px rgba(4,30,66,.22);}' +
      '.at-antecipacao-mv-popup:not(.active){overflow:hidden;max-height:0;min-height:0;padding-top:0;padding-bottom:0;border-width:0;box-shadow:none;gap:0;}' +
      '.at-antecipacao-mv-popup.is-unificado{max-height:calc(100dvh - 40px);max-height:calc(100vh - 40px);}' +
      '.at-antecipacao-mv-popup.is-unificado:not(.active){max-height:0;}' +
      '.at-antecipacao-mv-popup.active{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1);padding-top:40px;}' +
      '.at-antecipacao-mv-arrow{position:absolute;right:6px;bottom:14px;width:48px;height:48px;background:#DFF2FE;transform:rotate(45deg);z-index:-1;border-radius:4px;pointer-events:none;}' +
      '.at-antecipacao-mv-close{position:absolute;top:10px;right:16px;border:none;background:transparent;color:#041E42;font-size:24px;line-height:1;cursor:pointer;padding:0;}' +
      '.at-antecipacao-mv-head{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;}' +
      '.at-antecipacao-mv-title{margin:0;font-size:20px;line-height:24px;font-weight:700;color:#041E42;text-align:center;width:100%;}' +
      '.at-antecipacao-mv-subtitle{margin:0;font-size:14px;line-height:18px;font-weight:400;color:#041E42;text-align:center;width:100%;}' +
      '.at-antecipacao-mv-divider{height:1px;background:rgba(4,30,66,.32);}' +
      '.at-antecipacao-mv-tier-group{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;max-width:100%;}' +
      '.at-antecipacao-mv-novo{background:#CF527A;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:700;line-height:12px;letter-spacing:.3px;color:#fff;}' +
      '.at-antecipacao-mv-novo--placeholder{visibility:hidden;}' +
      '.at-antecipacao-mv-tier-row{display:flex;align-items:flex-end;justify-content:center;gap:8px;width:100%;max-width:100%;flex-wrap:wrap;}' +
      '.at-antecipacao-mv-tier-item{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;flex:1 1 72px;max-width:110px;}' +
      '.at-antecipacao-mv-tier-ico{width:32px;height:32px;display:flex;align-items:center;justify-content:center;}' +
      '.at-antecipacao-mv-tier-ico svg{width:32px;height:32px;display:block;}' +
      '.at-antecipacao-mv-tier-label{font-size:10px;line-height:12px;font-weight:700;letter-spacing:.2px;text-align:center;color:#041E42;word-break:break-word;max-width:100%;}' +
      '.at-antecipacao-mv-tier-amp{font-size:18px;line-height:1;color:#595959;padding-bottom:10px;flex-shrink:0;}' +
      '.at-antecipacao-mv-info-card{background:rgba(4,30,66,.05);border:1px solid rgba(4,30,66,.1);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:12px;max-width:100%;}' +
      '.at-antecipacao-mv-info-title{margin:0;font-size:14px;line-height:18px;font-weight:700;color:#041E42;}' +
      '.at-antecipacao-mv-info-row{display:flex;gap:12px;align-items:flex-start;max-width:100%;}' +
      '.at-antecipacao-mv-info-ico{width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
      '.at-antecipacao-mv-info-ico svg{width:32px;height:32px;display:block;}' +
      '.at-antecipacao-mv-info-text{margin:0;font-size:12px;line-height:16px;font-weight:400;color:#041E42;min-width:0;flex:1;overflow-wrap:break-word;word-break:break-word;}' +
      '.at-antecipacao-mv-info-text strong{font-weight:700;}' +
      '.at-antecipacao-mv-cta{margin-top:4px;height:45px;background:#008058;border-radius:8px;color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;transition:background .2s ease,transform .2s ease,box-shadow .2s ease;}' +
      '.at-antecipacao-mv-cta:hover{background:#006E4B;transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.18);}' +
      '@media (max-width:768px){' +
      '#' +
      BUTTON_ID +
      '{right:16px;bottom:max(75px,env(safe-area-inset-bottom,0px));width:60px;height:60px;}' +
      '.at-antecipacao-mv-popup{left:16px;right:16px;top:auto;bottom:calc(151px + env(safe-area-inset-bottom,0px));width:auto;max-width:none;height:auto;max-height:calc(100dvh - 167px - env(safe-area-inset-bottom,0px));}' +
      '.at-antecipacao-mv-popup.is-unificado{max-height:calc(100dvh - 167px - env(safe-area-inset-bottom,0px));}' +
      '.at-antecipacao-mv-arrow{right:30px;bottom:10px;width:24px;height:24px;}' +
      '}';

    document.head.appendChild(styles);
  }

  function showPopup() {
    const popup = document.getElementById(POPUP_ID);
    if (!popup) return;
    popup.classList.add('active');
    analyticsEvent('Popup', 'visualizacao', activeVariant);
    markShownThisSession();
  }

  function hidePopup() {
    const popup = document.getElementById(POPUP_ID);
    if (popup) popup.classList.remove('active');
  }

  function isCookieBannerClick(target) {
    if (!target || typeof target.closest !== 'function') return false;
    return !!target.closest(
      '#onetrust-consent-sdk, #onetrust-banner-sdk, #onetrust-pc-sdk, .ot-sdk-container, [id^="onetrust-"], [class*="onetrust"], [aria-label="Privacidade"]'
    );
  }

  function bindEvents() {
    const btn = document.getElementById(BUTTON_ID);
    const popup = document.getElementById(POPUP_ID);
    if (!btn || !popup || popup.getAttribute('data-events-bound') === 'true') return;

    const closeBtn = popup.querySelector('.at-antecipacao-mv-close');
    const cta = popup.querySelector('.at-antecipacao-mv-cta');

    popup.setAttribute('data-events-bound', 'true');

    btn.onclick = function () {
      if (popup.classList.contains('active')) {
        hidePopup();
        analyticsEvent('Floating Button Fechar', 'clique', activeVariant);
        markInteraction();
      } else {
        showPopup();
        analyticsEvent('Floating Button Abrir', 'clique', activeVariant);
      }
    };

    if (closeBtn) {
      closeBtn.onclick = function (e) {
        e.stopPropagation();
        hidePopup();
        analyticsEvent('Fechar', 'clique', activeVariant);
        markInteraction();
      };
    }

    if (cta) {
      cta.addEventListener('click', function () {
        analyticsEvent('Saiba Mais', 'clique', activeVariant);
        markInteraction();
      });
    }

    document.addEventListener('click', function (e) {
      if (!popup.classList.contains('active')) return;
      if (isCookieBannerClick(e.target)) return;
      if (!popup.contains(e.target) && !btn.contains(e.target)) {
        hidePopup();
        analyticsEvent('Fechar Outside', 'clique', activeVariant);
        markInteraction();
      }
    });
  }

  function injectPopup(variant) {
    if (document.getElementById(WRAPPER_ID)) return;

    popupInjected = true;
    activeVariant = variant;
    injectStyles();

    const wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.innerHTML = createPopupHTML(variant);
    document.body.appendChild(wrapper);

    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.classList.add('visible');

    bindEvents();
  }

  function tryActivatePopup() {
    if (popupInjected) return;
    if (!isReservationEligible()) return;

    const cookieData = readTudoAzulCookie();
    const profile = resolveTierProfile(cookieData || {});
    profile.hasCookie = !!cookieData;

    const variant = resolveVariant(profile);
    if (!isVariantEligible(variant, profile)) return;

    injectPopup(variant);

    if (!hasInteractedToday() && !wasShownThisSession()) {
      setTimeout(function () {
        if (!document.getElementById(POPUP_ID)) return;
        showPopup();
      }, 2000);
    }
  }

  function waitForReservationContent(retries) {
    retries = retries || 0;

    if (!isMinhasViagensPage()) return;

    if (isReservationEligible()) {
      tryActivatePopup();
      if (popupInjected && domObserver) {
        domObserver.disconnect();
        domObserver = null;
      }
      return;
    }

    if (retries >= DOM_MAX_RETRIES) return;

    setTimeout(function () {
      waitForReservationContent(retries + 1);
    }, DOM_WAIT_MS);
  }

  function setupDomObserver() {
    if (domObserver || popupInjected) return;

    domObserver = new MutationObserver(function () {
      if (popupInjected) return;
      if (isReservationEligible()) {
        tryActivatePopup();
        if (popupInjected) {
          domObserver.disconnect();
          domObserver = null;
        }
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    if (!isMinhasViagensPage()) return;

    setupDomObserver();
    waitForReservationContent(0);
  }

  window.AntecipacaoVooMinhasViagensPopup = {
    show: showPopup,
    hide: hidePopup,
    init: init,
    forceVariant: function (variantName) {
      if (document.getElementById(WRAPPER_ID)) return;
      activeVariant = variantName;
      injectPopup(variantName);
    },
    debugEligibility: function () {
      const pnr = getPnrFromPage();
      const cookieData = readTudoAzulCookie();
      const profile = resolveTierProfile(cookieData || {});
      profile.hasCookie = !!cookieData;
      const variant = resolveVariant(profile);

      return {
        isConfirmacaoUrl: isConfirmacaoUrl(),
        isMinhasViagensPage: isMinhasViagensPage(),
        matchesUrlPattern:
          (window.location.href || '').toLowerCase().indexOf(PAGE_URL_PATTERN) !== -1,
        pnr: pnr,
        pnrFromUrl: getPnrFromUrl(),
        hasTripSectionMarkers: hasTripSectionMarkers(),
        hasFlightsSection: hasFlightsSection(),
        isPnrVisibleOnPage: isPnrVisibleOnPage(pnr),
        hasConfirmedReservation: hasConfirmedReservationOnPage(pnr),
        isReservationEligible: isReservationEligible(),
        tier: profile.tier,
        variant: variant,
        isVariantEligible: isVariantEligible(variant, profile),
        popupInjected: popupInjected,
        wrapperInDom: !!document.getElementById(WRAPPER_ID),
      };
    },
    resetEligibility: function () {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_SHOWN);
      localStorage.removeItem(STORAGE_KEYS.INTERACTED);
      popupInjected = false;
      const wrapper = document.getElementById(WRAPPER_ID);
      if (wrapper) wrapper.remove();
      const styles = document.getElementById(STYLE_ID);
      if (styles) styles.remove();
      if (domObserver) {
        domObserver.disconnect();
        domObserver = null;
      }
      init();
    },
  };

  window[SCRIPT_FLAG] = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
