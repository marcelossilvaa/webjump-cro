// POPUP DIAMANTE TUDO AZUL - UNIQUE COOKIE

(function () {
  console.log('[Popup Unique] Script carregado v4');

  var POPUP_ID = 'diamante-unique-popup';
  var BUTTON_ID = 'diamante-unique-floating-btn';
  var MIN_QUALIFYING_POINTS = 0;
  var MIN_FLIGHTS = 0;

  // Funcao de Analytics
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    
    // Padrao: AT_DiamanteUnique_[tipo] [label]
    var labelEvent = 'AT_DiamanteUnique_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Popup] ' + labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_DiamanteUnique';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function injectPopupStyles() {
    if (document.getElementById('diamante-unique-popup-styles')) return;

    var styles = document.createElement('style');
    styles.id = 'diamante-unique-popup-styles';
    styles.textContent = '' +
      '#' + BUTTON_ID + ' {' +
      '  position: fixed;' +
      '  bottom: 24px;' +
      '  right: 24px;' +
      '  width: 80px;' +
      '  height: 80px;' +
      '  background: #041E42;' +
      '  border-radius: 50%;' +
      '  cursor: pointer;' +
      '  display: none;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));' +
      '  z-index: 999998;' +
      '  transition: transform 0.3s ease;' +
      '}' +
      '#' + BUTTON_ID + '.visible {' +
      '  display: flex;' +
      '}' +
      '#' + BUTTON_ID + ':hover {' +
      '  transform: scale(1.05);' +
      '}' +
      '#' + BUTTON_ID + ' svg {' +
      '  width: 50px;' +
      '  height: 50px;' +
      '}' +
      '.diamante-popup-container {' +
      '  position: fixed;' +
      '  bottom: 24px;' +
      '  right: 128px;' +
      '  width: 325px;' +
      '  max-height: calc(100vh - 48px);' +
      '  display: flex;' +
      '  visibility: hidden;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  box-sizing: border-box;' +
      '  z-index: 999999;' +
      '  opacity: 0;' +
      '  transform: translateX(-10px) scale(0.95);' +
      '  pointer-events: none;' +
      '  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);' +
      '  overflow: visible;' +
      '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;' +
      '}' +
      '.diamante-popup-container.active {' +
      '  visibility: visible !important;' +
      '  opacity: 1 !important;' +
      '  transform: translateX(0) scale(1) !important;' +
      '  pointer-events: auto !important;' +
      '}' +
      '.diamante-popup-content-wrapper {' +
      '  width: 100%;' +
      '  height: 100%;' +
      '  background: linear-gradient(0deg, #041E42, #041E42);' +
      '  border-radius: 16px;' +
      '  padding: 24px 24px;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  gap: 16px;' +
      '  color: #FFFFFF;' +
      '  box-sizing: border-box;' +
      '  overflow-y: auto;' +
      '  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.5);' +
      '}' +
      /* Scrollbar customizada */
      '.diamante-popup-content-wrapper::-webkit-scrollbar {' +
      '  width: 4px;' +
      '}' +
      '.diamante-popup-content-wrapper::-webkit-scrollbar-track {' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '}' +
      '.diamante-popup-content-wrapper::-webkit-scrollbar-thumb {' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  border-radius: 4px;' +
      '}' +
      /* Header do Popup */
      '.diamante-popup-header {' +
      '  display: flex;' +
      '  justify-content: space-between;' +
      '  align-items: center;' +
      '  width: 100%;' +
      '}' +
      '.diamante-popup-header-left {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '}' +
      '.diamante-popup-badge {' +
      '  background: #CF527A;' +
      '  border-radius: 20px;' +
      '  padding: 6px 12px;' +
      '  font-size: 14px;' +
      '  font-weight: 700;' +
      '  letter-spacing: 0.3px;' +
      '}' +
      '.diamante-popup-close {' +
      '  background: transparent;' +
      '  border: none;' +
      '  color: #FFFFFF;' +
      '  font-size: 24px;' +
      '  cursor: pointer;' +
      '  padding: 4px;' +
      '  opacity: 0.7;' +
      '  transition: opacity 0.3s ease;' +
      '}' +
      '.diamante-popup-close:hover {' +
      '  opacity: 1;' +
      '}' +
      /* Títulos */
      '.diamante-popup-level {' +
      '  font-size: 16px;' +
      '  font-weight: 300;' +
      '  text-align: center;' +
      '}' +
      '.diamante-popup-title {' +
      '  font-size: 24px;' +
      '  font-weight: 300;' +
      '  text-transform: uppercase;' +
      '  text-align: center;' +
      '}' +
      '.diamante-popup-divider {' +
      '  width: 100%;' +
      '  height: 1px;' +
      '  background: rgba(255, 255, 255, 0.32);' +
      '}' +
      /* Intro */
      '.diamante-popup-intro {' +
      '  text-align: center;' +
      '}' +
      '.diamante-popup-intro h2 {' +
      '  font-size: 20px;' +
      '  font-weight: 300;' +
      '  margin: 0 0 8px 0;' +
      '}' +
      '.diamante-popup-intro p {' +
      '  font-size: 14px;' +
      '  font-weight: 300;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '  line-height: 1.4;' +
      '  margin: 0;' +
      '}' +
      /* Benefícios */
      '.diamante-popup-benefits-box {' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '  border: 1px solid rgba(255, 255, 255, 0.1);' +
      '  border-radius: 14px;' +
      '  padding: 14px 18px;' +
      '  width: 100%;' +
      '  box-sizing: border-box;' +
      '}' +
      '.diamante-popup-benefits-title {' +
      '  font-size: 14px;' +
      '  font-weight: 700;' +
      '  margin-bottom: 16px;' +
      '}' +
      '.diamante-popup-benefit-item {' +
      '  display: flex;' +
      '  gap: 12px;' +
      '  margin-bottom: 12px;' +
      '}' +
      '.diamante-popup-benefit-icon {' +
      '  width: 32px;' +
      '  height: 32px;' +
      '  min-width: 32px;' +
      '  border-radius: 50%;' +
      '  border: 0.75px solid #FFFFFF;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  background: #041E42;' +
      '}' +
      '.diamante-popup-benefit-content {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  gap: 4px;' +
      '}' +
      '.diamante-popup-benefit-name {' +
      '  font-size: 14px;' +
      '  font-weight: 500;' +
      '  line-height: 1.2;' +
      '}' +
      '.diamante-popup-benefit-desc {' +
      '  font-size: 12px;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '}' +
      /* Footer do Benefício */
      '.diamante-popup-benefits-footer {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '  margin-top: 8px;' +
      '}' +
      '.diamante-popup-line {' +
      '  flex: 1;' +
      '  height: 1px;' +
      '  background: rgba(255, 255, 255, 0.1);' +
      '}' +
      '.diamante-popup-badge-small {' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  border-radius: 20px;' +
      '  padding: 2px 10px;' +
      '  font-size: 10px;' +
      '  text-transform: uppercase;' +
      '}' +
      /* Botão Final */
      '.diamante-popup-btn {' +
      '  background: #008058;' +
      '  color: #FFFFFF;' +
      '  border-radius: 8px;' +
      '  padding: 13px 17px;' +
      '  text-decoration: none;' +
      '  font-size: 16px;' +
      '  text-align: center;' +
      '  width: 100%;' +
      '  box-sizing: border-box;' +
      '  margin-top: 8px;' +
      '  display: block;' +
      '  transition: background-color 0.3s ease, transform 0.2s ease;' +
      '}' +
      '.diamante-popup-btn:hover {' +
      '  background: #006646;' +
      '  transform: scale(1.02);' +
      '}' +
      /* Seta do Popup */
      '.diamante-popup-arrow {' +
      '  position: absolute;' +
      '  bottom: 30px;' +
      '  right: -6px;' +
      '  width: 20px;' +
      '  height: 20px;' +
      '  background: #041E42;' +
      '  transform: rotate(45deg);' +
      '  z-index: -1;' +
      '}' +
      '@media (max-width: 768px) {' +
      '  .diamante-popup-container {' +
      '    width: calc(100% - 32px);' +
      '    height: auto;' +
      '    max-height: 80vh;' +
      '    bottom: 100px;' +
      '    right: 16px;' +
      '    transform: translateY(20px) scale(0.95);' +
      '  }' +
      '  .diamante-popup-container.active {' +
      '    transform: translateY(0) scale(1) !important;' +
      '  }' +
      '  #' + BUTTON_ID + ' {' +
      '    width: 70px;' +
      '    height: 70px;' +
      '    bottom: 16px;' +
      '    right: 16px;' +
      '  }' +
      '  #' + BUTTON_ID + ' svg {' +
      '    width: 40px;' +
      '    height: 40px;' +
      '  }' +
      '  .diamante-popup-arrow {' +
      '    bottom: -6px;' +
      '    right: 26px;' +
      '    z-index: -1;' +
      '  }' +
      '}';
    document.head.appendChild(styles);
  }

  // --- HTML ---
  function createPopupHTML() {
    var diamondIcon = '<svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.0034 45.5032C35.4298 45.5032 45.5034 35.4296 45.5034 23.0032C45.5034 10.5768 35.4298 0.503174 23.0034 0.503174C10.577 0.503174 0.503418 10.5768 0.503418 23.0032C0.503418 35.4296 10.577 45.5032 23.0034 45.5032Z" stroke="white" stroke-width="1.00645"/><path d="M29.4346 5.00305C29.4346 9.97568 25.4043 14.006 20.4316 14.006C25.4043 14.006 29.4346 18.0363 29.4346 23.009C29.4346 18.0363 33.4649 14.006 38.4376 14.006C33.4649 14.006 29.4346 9.97568 29.4346 5.00305Z" fill="white"/><path d="M19.147 14.0032H16.2694L10.147 21.2889L23.0041 35.8603L35.8613 21.2889L34.5755 19.8317" stroke="white" stroke-width="2.0129" stroke-miterlimit="10"/></svg>';
    
    var seatIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M7 13v-3a5 5 0 0 1 10 0v3"/><rect x="4" y="13" width="16" height="8" rx="2"/></svg>';
    var userIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>';
    var fastIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
    var calendarIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

    return '' +
      '<div id="' + BUTTON_ID + '">' +
      '  ' + diamondIcon +
      '</div>' +
      '<div class="diamante-popup-container" id="' + POPUP_ID + '">' +
      '  <div class="diamante-popup-content-wrapper">' +
      '      <div class="diamante-popup-header">' +
      '      <div class="diamante-popup-header-left">' +
      '          <div style="width: 40px; height: 40px;">' + diamondIcon + '</div>' +
      '          <span class="diamante-popup-badge">Novo</span>' +
      '      </div>' +
      '      <button class="diamante-popup-close">&times;</button>' +
      '      </div>' +
      '      <div>' +
      '        <div class="diamante-popup-level">Nível 5</div>' +
      '        <div class="diamante-popup-title">DIAMANTE UNIQUE</div>' +
      '      </div>' +
      '      <div class="diamante-popup-divider"></div>' +

      '      <div class="diamante-popup-intro">' +
      '      <h2>Novo nível Azul Fidelidade!</h2>' +
      '      <p>Conheça as novidades que chegam a partir de 13 de janeiro de 2026.</p>' +
      '      </div>' +

      '      <div class="diamante-popup-divider"></div>' +

      '      <div class="diamante-popup-benefits-box">' +
      '      <div class="diamante-popup-benefits-title">Conheça alguns benefícios:</div>' +
      '      ' +
      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + seatIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Cortesias ilimitadas no Economy Xtra e Espaço Azul.</span>' +
      '          <span class="diamante-popup-benefit-desc">Mais conforto nas suas viagens nacionais e internacionais.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + userIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Passagem Cortesia para acompanhante.</span>' +
      '          <span class="diamante-popup-benefit-desc">4 trechos disponíveis.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + fastIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Check-in e embarques prioritários.</span>' +
      '          <span class="diamante-popup-benefit-desc">Seja um dos primeiros a embarcar em seu voo.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + calendarIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Pontos com validade de 10 anos.</span>' +
      '          <span class="diamante-popup-benefit-desc">Sem pressa para usar os seus pontos.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefits-footer">' +
      '          <div class="diamante-popup-line"></div>' +
      '          <span class="diamante-popup-badge-small">e muitos outros</span>' +
      '          <div class="diamante-popup-line"></div>' +
      '      </div>' +
      '      </div>' +

      '      <a href="https://www.voeazul.com.br/content/azul/voe-azul/br/pt/programa-fidelidade/acumulo-de-pontos/aereo.html" class="diamante-popup-btn">Ver todos os benefícios</a>' +
      '  </div>' +
      '  <div class="diamante-popup-arrow"></div>' +
      '</div>';
  }

  // --- Funcoes Auxiliares ---

  function isHomepage() {
    return window.location.href.indexOf('voeazul.com.br/home/br/pt/home') !== -1 || 
           window.location.href.indexOf('debug-modal.html') !== -1;
  }

  function isMobile() {
    return window.innerWidth <= 768;
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
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // --- Controle de Estado (Regras de Exibicao) ---

  const STORAGE_KEYS = {
    INTERACTED: 'diamante_unique_popup_interacted_date',
    VIEWS: 'diamante_unique_popup_views_count',
    LAST_VIEW_DATE: 'diamante_unique_popup_last_view_date',
    SESSION_SHOWN: 'diamante_unique_popup_session_shown'
  };

  function hasInteractedToday() {
    const interactedDate = getStorage(STORAGE_KEYS.INTERACTED);
    return interactedDate === getTodayDateString();
  }

  function getViewsToday() {
    const lastViewDate = getStorage(STORAGE_KEYS.LAST_VIEW_DATE);
    const today = getTodayDateString();
    
    if (lastViewDate !== today) {
      return 0;
    }
    
    return getStorage(STORAGE_KEYS.VIEWS) || 0;
  }

  function incrementViews() {
    const views = getViewsToday();
    const today = getTodayDateString();
    
    setStorage(STORAGE_KEYS.VIEWS, views + 1);
    setStorage(STORAGE_KEYS.LAST_VIEW_DATE, today);
  }

  function markInteraction() {
    console.log('[Popup Unique] Interacao registrada.');
    setStorage(STORAGE_KEYS.INTERACTED, getTodayDateString());
  }

  function wasPopupShownInSession() {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_SHOWN) === 'true';
  }

  function markPopupShownInSession() {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_SHOWN, 'true');
  }

  // --- Triggers ---

  let inactivityTimer;
  let triggersInitialized = false;

  function getRandomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    const minTime = isMobile() ? 30 : 45;
    const maxTime = isMobile() ? 60 : 90;
    const time = getRandomTime(minTime, maxTime);

    inactivityTimer = setTimeout(() => {
      console.log('[Popup Unique] Trigger: Inatividade (' + (time/1000) + 's)');
      triggerPopup();
    }, time);
  }

  function setupTriggers() {
    if (triggersInitialized) return;
    triggersInitialized = true;

    // 1. Inatividade
    const activityEvents = ['mousemove', 'scroll', 'click', 'keydown', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    // 2. Exit Intent (Desktop apenas)
    if (!isMobile()) {
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0) {
          triggerPopup();
        }
      });
    }

    // 3. Scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 100) { 
           triggerPopup();
        }
        scrollTimeout = null;
      }, 500);
    }, { passive: true });
  }

  function triggerPopup() {
    // Verifica se esta na home
    if (!isHomepage()) return;

    console.log('[Popup Unique] Disparando popup via trigger...');
    window.UniquePopup.show();
  }

  // --- Lógica ---
  function injectPopup() {
    if (document.getElementById(POPUP_ID)) return;

    injectPopupStyles();
    
    var container = document.createElement('div');
    container.id = 'diamante-unique-popup-wrapper';
    container.innerHTML = createPopupHTML();
    document.body.appendChild(container);

    var btn = document.getElementById(BUTTON_ID);
    var popup = document.getElementById(POPUP_ID);
    var closeBtn = popup.querySelector('.diamante-popup-close');
    var ctaBtn = popup.querySelector('.diamante-popup-btn');

    if (ctaBtn) {
      ctaBtn.addEventListener('click', function() {
        analyticsEvent('Ver Beneficios', 'clique');
      });
    }

    btn.onclick = function() {
      if (popup.classList.contains('active')) {
        popup.classList.remove('active');
        analyticsEvent('Floating Button Fechar', 'clique');
      } else {
        popup.classList.add('active');
        analyticsEvent('Floating Button Abrir', 'clique');
        analyticsEvent('Popup', 'visualizacao');
      }
    };

    closeBtn.onclick = function(e) {
      e.stopPropagation();
      popup.classList.remove('active');
      analyticsEvent('Fechar', 'clique');
      markInteraction(); // Marcar interacao ao fechar
    };

    document.addEventListener('click', function(e) {
      if (!popup.contains(e.target) && !btn.contains(e.target)) {
        if (popup.classList.contains('active')) {
            popup.classList.remove('active');
            analyticsEvent('Fechar Outside', 'clique');
            markInteraction(); // Marcar interacao ao clicar fora (fechar)
        }
      }
    });
  }

  function init(retries) {
    retries = retries || 0;
    injectPopup();

    var isEligible = false;
    if (window.TudoAzulCookie && typeof window.TudoAzulCookie.getTudoAzulData === 'function') {
      var data = window.TudoAzulCookie.getTudoAzulData();
      if (data) {
        // Regras de elegibilidade: Pontos ou Trechos
        isEligible = (data.qualifyingPoints >= MIN_QUALIFYING_POINTS || data.flights >= MIN_FLIGHTS);
      }
    } else if (retries < 10) {
      setTimeout(function() { init(retries + 1); }, 500);
      return;
    }

    if (isEligible && isHomepage()) {
      var btn = document.getElementById(BUTTON_ID);
      if (btn) btn.classList.add('visible');
      setupTriggers();
    }
  }

  // Expor métodos globais para debug
  window.UniquePopup = {
    show: function() {
      injectPopup(); // Garante que está no DOM
      var popup = document.getElementById(POPUP_ID);
      if (popup) {
        popup.classList.add('active');
        analyticsEvent('Popup', 'visualizacao');
      }
    },
    hide: function() {
      var popup = document.getElementById(POPUP_ID);
      if (popup) {
        popup.classList.remove('active');
      }
    },
    showButton: function() {
        injectPopup();
        var btn = document.getElementById(BUTTON_ID);
        if (btn) btn.classList.add('visible');
    },
    init: init
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', function() { init(); });
  }
})();
