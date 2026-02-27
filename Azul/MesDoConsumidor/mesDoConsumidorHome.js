// POPUP MES DO CONSUMIDOR - HOME (GERAL + UNIQUE)
(function () {
  var POPUP_ID = 'mdc-home-popup';
  var BUTTON_ID = 'mdc-home-floating-btn';
  var WRAPPER_ID = 'mdc-home-popup-wrapper';
  var STYLE_ID = 'mdc-home-popup-styles';

  var STORAGE_KEYS = {
    INTERACTED: 'mdc_home_popup_interacted_date',
    SESSION_SHOWN: 'mdc_home_popup_session_shown',
  };

  var CTA_LINK = 'https://www.voeazul.com.br/br/pt/programa-fidelidade/comunicado-novo-nivel';

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = 'AT_MesDoConsumidorHome_' + eventType + ' ' + eventLabel;

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_MesDoConsumidorHome';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getStorage(key) {
    try {
      var item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
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
    } catch (e) {}
  }

  function readTudoAzulCookie() {
    try {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf('TudoAzul=') === 0) {
          var encodedValue = cookie.substring('TudoAzul='.length);
          return JSON.parse(decodeURIComponent(encodedValue));
        }
      }
    } catch (error) {
      console.log('[MesDoConsumidor Home] Erro ao ler cookie:', error);
    }
    return null;
  }

  function normalizeText(value) {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function resolveTierProfile(cookieData) {
    var levelCode = (cookieData && cookieData.program && cookieData.program.levelCode) || '';
    var levelName = (cookieData && cookieData.program && cookieData.program.name) || '';
    var normalized = (String(levelCode) + ' ' + String(levelName)).toUpperCase();
    var normalizedNoAccent = normalizeText(levelCode + ' ' + levelName);

    var tier = 'azul';
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

    var esimVolume = '250MB';
    if (tier === 'diamante') esimVolume = '1GB';
    if (tier === 'unique') esimVolume = '2GB';

    return { tier: tier, esimVolume: esimVolume, isUnique: tier === 'unique' };
  }

  function getFirstName(cookieData) {
    if (!cookieData) return 'Cliente Azul';
    if (cookieData.name && typeof cookieData.name === 'object' && cookieData.name.first)
      return cookieData.name.first;
    if (cookieData.name && typeof cookieData.name === 'string')
      return cookieData.name.split(' ')[0];
    if (cookieData.Name) return String(cookieData.Name).split(' ')[0];
    return 'Cliente Azul';
  }

  function floatingIconSVG() {
    return (
      '' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 80 80" fill="none" aria-hidden="true">' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M38.23 25.9351C38.9597 24.5248 41.0351 24.5251 41.7651 25.9351L41.8994 26.2598L44.5557 34.4287H53.1445C55.0816 34.4287 55.8875 36.9078 54.3213 38.0469L47.3706 43.0957L50.0244 51.2646C50.6225 53.107 48.5155 54.6395 46.9482 53.501L39.9976 48.4521L33.0493 53.501C31.4822 54.6385 29.373 53.1066 29.9707 51.2646L32.6221 43.0957L25.6763 38.0469C24.1095 36.9084 24.9144 34.4302 26.8506 34.4287H35.4419L38.0957 26.2598L38.23 25.9351ZM37.2583 36.9287H28.3887L35.564 42.1411L32.8223 50.5737L39.9976 45.3613L47.1704 50.5713L44.4312 42.1411L51.6064 36.9287H42.7393L39.9976 28.4961L37.2583 36.9287Z" fill="#041E42"/>' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M40 18.125C52.0812 18.125 61.875 27.9188 61.875 40C61.875 52.0812 52.0812 61.875 40 61.875C27.9188 61.875 18.125 52.0812 18.125 40C18.125 27.9188 27.9188 18.125 40 18.125ZM40 21.1255C29.5756 21.1255 21.1255 29.5756 21.1255 40C21.1255 50.4244 29.5756 58.8745 40 58.8745C50.4244 58.8745 58.8745 50.4244 58.8745 40C58.8745 29.5756 50.4244 21.1255 40 21.1255Z" fill="#041E42"/>' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M40 10C56.5685 10 70 23.4315 70 40C70 56.5685 56.5685 70 40 70C23.4315 70 10 56.5685 10 40C10 23.4315 23.4315 10 40 10ZM40 13.0005C25.0883 13.0005 13.0005 25.0883 13.0005 40C13.0005 54.9117 25.0883 66.9995 40 66.9995C54.9117 66.9995 66.9995 54.9117 66.9995 40C66.9995 25.0883 54.9117 13.0005 40 13.0005Z" fill="#041E42"/>' +
      '</svg>'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var styles = document.createElement('style');
    styles.id = STYLE_ID;
    styles.textContent =
      '@keyframes mdcFloatPulse{0%{transform:scale(1)}50%{transform:scale(1.04)}100%{transform:scale(1)}}' +
      '#' +
      BUTTON_ID +
      '{position:fixed;right:22px;bottom:39px;width:60px;height:60px;border-radius:50%;display:none;' +
      'align-items:center;justify-content:center;border:none;cursor:pointer;background:#DFF2FE;z-index:999998;' +
      'filter:drop-shadow(0 4px 4px rgba(0,0,0,.25));transition:transform .24s ease, filter .24s ease;animation:mdcFloatPulse 2.2s infinite;}' +
      '#' +
      BUTTON_ID +
      '.visible{display:flex;}' +
      '#' +
      BUTTON_ID +
      ':hover{transform:translateY(-2px) scale(1.08) rotate(-3deg);filter:drop-shadow(0 8px 14px rgba(0,0,0,.3));animation:none;}' +
      '.mdc-home-popup{position:fixed;right:100px;bottom:24px;width:303px;background:#DFF2FE;border-radius:16px;color:#041E42;' +
      'padding:24px;box-sizing:border-box;z-index:999999;opacity:0;visibility:hidden;pointer-events:none;' +
      "transform:translateY(12px) scale(.96);transition:all .28s ease;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:flex;flex-direction:column;gap:16px;}" +
      '.mdc-home-popup.is-unique{height:725px;}' +
      '.mdc-home-popup.active{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1);}' +
      '.mdc-home-arrow{position:absolute;right:0px;bottom:14px;width:62px;height:62px;background:#DFF2FE;transform:rotate(45deg);z-index:-1;border-radius:4px;}' +
      '.mdc-home-header{display:flex;justify-content:space-between;align-items:center;height:50px;}' +
      '.mdc-home-badge{background:#CF527A;border-radius:999px;padding:6px 12px;font-weight:700;font-size:14px;line-height:16px;letter-spacing:.3px;color:#fff;}' +
      '.mdc-home-close{border:none;background:transparent;color:#041E42;font-size:24px;line-height:1;cursor:pointer;}' +
      '.mdc-home-title{font-size:28px;line-height:28px;font-weight:700;text-transform:capitalize;text-align:center;margin:0;}' +
      '.mdc-home-divider{height:1px;background:rgba(4,30,66,.32);}' +
      '.mdc-home-tier-strip{display:flex;justify-content:center;gap:8px;align-items:center;width:100%;padding:8px 0;border-top:1px solid rgba(4,30,66,.32);border-bottom:1px solid rgba(4,30,66,.32);}' +
      '.mdc-home-tier-item{width:32px;height:32px;display:flex;align-items:center;justify-content:center;}' +
      '.mdc-home-tier-item svg{width:32px;height:32px;display:block;}' +
      '.mdc-home-copy{margin:0;text-align:center;font-size:14px;line-height:16px;font-weight:300;color:#041E42;}' +
      '.mdc-home-main-card{background:rgba(4,30,66,.05);border:1px solid rgba(4,30,66,.1);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:24px;}' +
      '.mdc-home-main-title{margin:0;font-size:16px;line-height:18px;font-weight:700;}' +
      '.mdc-home-feature{display:flex;gap:8px;}' +
      '.mdc-home-ico{width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '.mdc-home-ico img{width:32px;height:32px;display:block;}' +
      '.mdc-home-ft-title{margin:0 0 6px 0;font-size:16px;line-height:20px;font-weight:700;}' +
      '.mdc-home-ft-desc{margin:0;font-size:12px;line-height:14px;}' +
      '.mdc-home-whats{background:#030734;border-radius:14px;padding:24px 16px;color:#fff;display:flex;flex-direction:column;gap:16px;}' +
      '.mdc-home-whats-row{display:flex;gap:16px;}' +
      '.mdc-home-whats-ico{width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '.mdc-home-whats-ico img{width:32px;height:32px;display:block;}' +
      '.mdc-home-whats-title{margin:0 0 10px 0;font-size:14px;line-height:20px;font-weight:700;}' +
      '.mdc-home-whats-desc{margin:0;font-size:12px;line-height:12px;}' +
      '.mdc-home-cta{margin-top:auto;height:45px;background:#008058;border-radius:8px;color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;font-size:16px;}' +
      '@media (max-width:768px){' +
      '#' +
      BUTTON_ID +
      '{right:16px;bottom:16px;width:82px;height:82px;}' +
      '.mdc-home-popup{left:16px;right:16px;bottom:104px;width:auto;height:auto;max-height:78vh;overflow:auto;}' +
      '.mdc-home-arrow{right:30px;bottom:-8px;width:24px;height:24px;}' +
      '}';

    document.head.appendChild(styles);
  }

  function createTierIconsHTML() {
    var icons = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M26.5 16C26.5 21.799 21.799 26.5 16 26.5C10.201 26.5 5.5 21.799 5.5 16C5.5 10.201 10.201 5.5 16 5.5V4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4V5.5C21.799 5.5 26.5 10.201 26.5 16Z" fill="#595959"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 23L4 9H28L22 16L16 23ZM16 20.6943L24.7383 10.5H7.26172L16 20.6943Z" fill="#595959"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M25 16L16 28L7 16L16 4L25 16ZM8.875 16L16 25.499L23.124 16L16 6.5L8.875 16Z" fill="#595959"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 12.3096L16 26.5L4 12.3096L9.71387 5.5H22.2861L28 12.3096ZM5.96094 12.3057L16 24.1758L26.0381 12.3057L21.5869 7H10.4131L5.96094 12.3057Z" fill="#595959"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M19.6064 7.37598H10.5488L5.93945 12.9062L15.9463 25.2959L25.9941 12.8555L25.2549 11.7461L26.5029 10.9141L27.5479 12.4824L27.8545 12.9414L15.9473 27.6836L4 12.8916L9.8457 5.87598H19.6064V7.37598Z" fill="#595959"/><path d="M22.7422 4C22.7422 6.88722 25.0825 9.22754 27.9697 9.22754C25.0827 9.22754 22.7424 11.5671 22.7422 14.4541C22.7419 11.5672 20.4025 9.22779 17.5156 9.22754C20.4026 9.22729 22.7422 6.88706 22.7422 4Z" fill="#595959"/></svg>',
    ];
    return icons
      .map(function (icon) {
        return '<span class="mdc-home-tier-item">' + icon + '</span>';
      })
      .join('');
  }

  function createImgurIconHTML(imageId, altText) {
    return (
      '<img src="https://i.imgur.com/' +
      imageId +
      '.png" alt="' +
      altText +
      '" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/' +
      imageId +
      ".jpg';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src='https://i.imgur.com/" +
      imageId +
      '.jpeg\';}">'
    );
  }

  function createTierStripHTML() {
    return '' + '<div class="mdc-home-tier-strip">' + createTierIconsHTML() + '</div>';
  }

  function createGeneralCardHTML(esimVolume) {
    return (
      '' +
      '<div class="mdc-home-main-card">' +
      '  <h3 class="mdc-home-main-title">Pode comemorar!</h3>' +
      '  <div class="mdc-home-feature">' +
      '    <div class="mdc-home-ico">' +
      createImgurIconHTML('MR6da88', 'Icone eSIM') +
      '</div>' +
      '    <div><h4 class="mdc-home-ft-title">E-sim Internacional</h4>' +
      '    <p class="mdc-home-ft-desc">Agora voce pode ganhar ate <strong>' +
      esimVolume +
      '</strong> gratuitos de internet nos destinos internacionais da Azul no programa de fidelidade.</p></div>' +
      '  </div>' +
      '  <div class="mdc-home-feature">' +
      '    <div class="mdc-home-ico">' +
      createImgurIconHTML('qMWDHn9', 'Icone passagem cortesia') +
      '</div>' +
      '    <div><h4 class="mdc-home-ft-title">Passagem cortesia em Pontos e Pontos + Reais</h4>' +
      '    <p class="mdc-home-ft-desc">As formas de pagamento mais aguardada estao de volta!</p></div>' +
      '  </div>' +
      '</div>'
    );
  }

  function createUniqueWhatsHTML() {
    return (
      '' +
      '<div class="mdc-home-whats">' +
      '  <div class="mdc-home-whats-row">' +
      '    <div class="mdc-home-whats-ico">' +
      createImgurIconHTML('o5Sf6GM', 'Icone WhatsApp') +
      '</div>' +
      '    <div>' +
      '      <h4 class="mdc-home-whats-title">Novo canal de atendimento para o nivel Diamante Unique</h4>' +
      '      <p class="mdc-home-whats-desc">Atendimento via WhatsApp, 24 horas por dia, 7 dias por semana, para receber um suporte completo.</p>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  function createPopupHTML(profile) {
    var isUnique = profile.isUnique;
    var className = isUnique ? 'is-unique' : 'is-general';
    var features = createGeneralCardHTML(profile.esimVolume);
    var uniqueExtra = isUnique ? createUniqueWhatsHTML() : '';

    return (
      '<button id="' +
      BUTTON_ID +
      '" aria-label="Abrir popup Mes do Consumidor">' +
      floatingIconSVG() +
      '</button>' +
      '<div class="mdc-home-popup ' +
      className +
      '" id="' +
      POPUP_ID +
      '">' +
      '  <div class="mdc-home-arrow"></div>' +
      '  <div class="mdc-home-header">' +
      '    <span class="mdc-home-badge">NOVIDADE</span>' +
      '    <button class="mdc-home-close" aria-label="Fechar popup">&times;</button>' +
      '  </div>' +
      '  <h2 class="mdc-home-title">novos beneficios</h2>' +
      createTierStripHTML() +
      features +
      uniqueExtra +
      '  <a class="mdc-home-cta" href="' +
      CTA_LINK +
      '">Saiba mais</a>' +
      '</div>'
    );
  }

  function showPopup() {
    var popup = document.getElementById(POPUP_ID);
    if (!popup) return;
    popup.classList.add('active');
    analyticsEvent('Popup', 'visualizacao');
    markShownThisSession();
  }

  function hidePopup() {
    var popup = document.getElementById(POPUP_ID);
    if (popup) popup.classList.remove('active');
  }

  function injectPopup() {
    if (document.getElementById(WRAPPER_ID)) return;

    var cookieData = readTudoAzulCookie();
    var profile = resolveTierProfile(cookieData || {});
    injectStyles();

    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.innerHTML = createPopupHTML(profile);
    document.body.appendChild(wrapper);

    var btn = document.getElementById(BUTTON_ID);
    var popup = document.getElementById(POPUP_ID);
    var closeBtn = popup ? popup.querySelector('.mdc-home-close') : null;
    var cta = popup ? popup.querySelector('.mdc-home-cta') : null;

    if (btn) {
      btn.classList.add('visible');
      btn.onclick = function () {
        if (!popup) return;
        if (popup.classList.contains('active')) {
          hidePopup();
          analyticsEvent('Floating Button Fechar', 'clique');
          markInteraction();
        } else {
          showPopup();
          analyticsEvent('Floating Button Abrir', 'clique');
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = function (e) {
        e.stopPropagation();
        hidePopup();
        analyticsEvent('Fechar', 'clique');
        markInteraction();
      };
    }

    if (cta) {
      cta.addEventListener('click', function () {
        analyticsEvent('Saiba Mais', 'clique');
        markInteraction();
      });
    }

    document.addEventListener('click', function (e) {
      if (!popup || !btn) return;
      if (
        !popup.contains(e.target) &&
        !btn.contains(e.target) &&
        popup.classList.contains('active')
      ) {
        hidePopup();
        analyticsEvent('Fechar Outside', 'clique');
        markInteraction();
      }
    });
  }

  function init() {
    injectPopup();
    if (!hasInteractedToday() && !wasShownThisSession()) {
      setTimeout(function () {
        showPopup();
        markInteraction();
      }, 2000);
    }
  }

  window.MesDoConsumidorHomePopup = { show: showPopup, hide: hidePopup, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
