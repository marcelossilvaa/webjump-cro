(function () {
  const MODAL_ID = 'mdc-esfera-modal';
  const STYLE_ID = 'mdc-esfera-modal-styles';
  const DAILY_KEY = 'mdc_esfera_modal_daily_count';
  const SESSION_KEY = 'mdc_esfera_modal_shown_session';
  const REDIRECT_URL = 'https://www.voeazul.com.br/br/pt/ofertas/bancos';
  const TOP_POPUP_ICON_URL = 'https://i.imgur.com/r3EtuVr.png';
  const AZUL_LOGO_URL = 'https://i.imgur.com/333lag3.png';
  const PARTNER_LOGO_URL = 'https://i.imgur.com/fSy8Jg3.png';
  const DAILY_MAX = 1;
  const INACTIVITY_MS = 50000;
  const CLOSE_ANIMATION_MS = 260;
  const campaignStartMs = new Date(2026, 2, 23, 9, 0, 0).getTime();
  const campaignEndMs = new Date(2026, 2, 27, 23, 59, 0).getTime();

  let tickTimeoutId = null;
  let escHandler = null;
  let exitIntentHandler = null;
  let inactivityTimer = null;
  let inactivityResetHandler = null;
  let modalWasTriggered = false;
  let currentModalType = null;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel || !eventType) return;
    var labelEvent = 'AT_MesDoConsumidorLP_ModalEsfera_' + eventType + ' ' + eventLabel;

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_MesDoConsumidorLP_ModalEsfera';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function isDesktop() {
    return window.innerWidth >= 768;
  }

  function isDomReady() {
    return document.readyState === 'interactive' || document.readyState === 'complete';
  }

  function getSessionShown() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setSessionShown() {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {}
  }

  function canShowByDate() {
    var now = Date.now();
    if (now < campaignStartMs) return true;
    return now < campaignEndMs;
  }

  function canShowByDailyLimit() {
    var today = new Date().toISOString().slice(0, 10);
    var dailyData = null;
    try {
      dailyData = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch (e) {
      dailyData = null;
    }

    if (!dailyData || dailyData.date !== today) return true;
    return dailyData.count < DAILY_MAX;
  }

  function registerImpression() {
    var today = new Date().toISOString().slice(0, 10);
    var dailyData = null;
    try {
      dailyData = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch (e) {
      dailyData = null;
    }

    if (!dailyData || dailyData.date !== today) {
      dailyData = { date: today, count: 0 };
    }

    dailyData.count += 1;
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(dailyData));
    } catch (e) {}
    setSessionShown();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '@keyframes mdcEsferaFadeIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes mdcEsferaFadeOut{from{opacity:1}to{opacity:0}}' +
      '@keyframes mdcEsferaScaleIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}' +
      '@keyframes mdcEsferaScaleOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(10px) scale(.96)}}' +
      '.mdc-esfera-overlay{position:fixed;inset:0;display:flex;justify-content:center;align-items:center;padding:12px;background:rgba(0,0,0,.55);z-index:999999;animation:mdcEsferaFadeIn .26s ease-out;}' +
      '.mdc-esfera-overlay.closing{animation:mdcEsferaFadeOut .26s ease-in forwards;}' +
      '.mdc-esfera-modal{position:relative;width:520px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;background:linear-gradient(212.67deg,#0061A0 0.38%,#008BC4 98.78%);box-shadow:0 25px 50px -12px rgba(0,0,0,.25);border-radius:10px;color:#fff;font-family:"Helvetica Neue",Arial,sans-serif;animation:mdcEsferaScaleIn .26s ease-out;}' +
      '.mdc-esfera-modal.closing{animation:mdcEsferaScaleOut .26s ease-in forwards;}' +
      '.mdc-esfera-modal *{box-sizing:border-box;}' +
      '.mdc-esfera-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 24px 0;}' +
      '.mdc-esfera-brand{display:flex;align-items:center;gap:10px;}' +
      '.mdc-esfera-brand img{height:67px;width:auto;display:block;}' +
      '.mdc-esfera-close{width:24px;height:24px;border:none;background:transparent;color:rgba(255,255,255,.85);font-size:24px;line-height:24px;cursor:pointer;padding:0;margin-top:2px;}' +
      '.mdc-esfera-title-wrap{padding:10px 24px 0;}' +
      '.mdc-esfera-title{margin:0;font-weight:700;font-size:32px;line-height:40px;color:#fff;}' +
      '.mdc-esfera-subtitle{margin:8px 0 0;font-weight:700;font-size:24px;line-height:32px;color:#fff;}' +
      '.mdc-esfera-body{display:flex;flex-direction:column;align-items:flex-start;padding:24px 24px 0;gap:20px;}' +
      '.mdc-esfera-logos{width:100%;height:73px;background:#fff;border-radius:16px;display:flex;justify-content:center;align-items:center;gap:24px;color:#041E42;}' +
      '.mdc-esfera-azul-logo{height:53px;width:auto;max-width:140px;display:block;}' +
      '.mdc-esfera-plus{font-size:36px;line-height:44px;color:#041E42;}' +
      '.mdc-esfera-partner-logo{height:40px;width:auto;max-width:180px;display:block;}' +
      '.mdc-esfera-countdown{width:100%;background:#0061A0;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:12px;}' +
      '.mdc-esfera-countdown-title{display:flex;justify-content:center;align-items:center;gap:8px;font-size:14px;line-height:21px;color:#fff;}' +
      '.mdc-esfera-clock{font-size:16px;line-height:16px;}' +
      '.mdc-esfera-time{display:flex;justify-content:center;align-items:flex-start;gap:8px;}' +
      '.mdc-esfera-time-box{width:70px;height:75px;background:#041E42;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:12px;}' +
      '.mdc-esfera-time-number{font-weight:700;font-size:24px;line-height:36px;color:#fff;}' +
      '.mdc-esfera-time-label{font-family:Arial,sans-serif;font-weight:400;font-size:10px;line-height:15px;color:rgba(255,255,255,.7);text-transform:uppercase;}' +
      '.mdc-esfera-benefits{width:100%;display:flex;flex-direction:column;gap:12px;margin:0;padding:0;list-style:none;}' +
      '.mdc-esfera-benefits li{display:flex;gap:12px;align-items:flex-start;}' +
      '.mdc-esfera-ico{width:24px;height:24px;display:flex;justify-content:center;align-items:center;flex-shrink:0;}' +
      '.mdc-esfera-ico svg{width:24px;height:24px;display:block;}' +
      '.mdc-esfera-ico img{width:24px;height:24px;display:block;object-fit:contain;}' +
      '.mdc-esfera-benefits p{margin:0;font-size:15px;line-height:22px;font-weight:400;color:#fff;}' +
      '.mdc-esfera-benefits b{font-weight:700;}' +
      '.mdc-esfera-benefits a{color:#fff;text-decoration:underline;}' +
      '.mdc-esfera-actions{width:100%;display:flex;flex-direction:column;gap:8px;padding-bottom:24px;}' +
      '.mdc-esfera-cta{width:100%;height:56px;border:none;border-radius:24px;background:#041E42;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);color:#fff;font-weight:700;font-size:16px;line-height:24px;text-transform:uppercase;cursor:pointer;}' +
      '.mdc-esfera-dismiss{width:100%;height:37px;border:none;background:transparent;color:#fff;font-weight:400;font-size:14px;line-height:21px;cursor:pointer;}' +
      '@media (max-width:540px){' +
      '.mdc-esfera-title{font-size:26px;line-height:34px;}' +
      '.mdc-esfera-subtitle{font-size:24px;line-height:32px;}' +
      '.mdc-esfera-azul-logo{height:42px;max-width:120px;}' +
      '.mdc-esfera-plus{font-size:30px;line-height:34px;}' +
      '.mdc-esfera-partner-logo{height:30px;max-width:140px;}' +
      '.mdc-esfera-time-box{width:62px;}' +
      '.mdc-esfera-benefits p{font-size:14px;line-height:20px;}' +
      '}';
    document.head.appendChild(style);
  }

  function getModalTexts(type) {
    if (type === 'exit') {
      return {
        title: 'Não saia ainda :(',
        subtitle: 'Seus pontos podem render mais',
        dismiss: 'Sair',
      };
    }
    return {
      title: 'Última chance de multiplicar seus pontos',
      subtitle: '',
      dismiss: 'Continuar navegando',
    };
  }

  function getBenefitIconHTML(type) {
    if (type === 'growth') {
      return '<img src="https://i.imgur.com/JOHjW9f.png" alt="" aria-hidden="true" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/JOHjW9f.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/JOHjW9f.jpeg\';}">';
    }
    if (type === 'travel') {
      return '<img src="https://i.imgur.com/ogZPKXd.png" alt="" aria-hidden="true" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/ogZPKXd.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/ogZPKXd.jpeg\';}">';
    }
    if (type === 'bonus') {
      return '<img src="https://i.imgur.com/WCt4F0A.png" alt="" aria-hidden="true" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/WCt4F0A.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/WCt4F0A.jpeg\';}">';
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z" fill="#F50955"/>' +
      '<path d="M12.0002 18.6673C15.6821 18.6673 18.6668 15.6825 18.6668 12.0007C18.6668 8.31875 15.6821 5.33398 12.0002 5.33398C8.31826 5.33398 5.3335 8.31875 5.3335 12.0007C5.3335 15.6825 8.31826 18.6673 12.0002 18.6673Z" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M12 8V12L14.6667 13.3333" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function buildModal(type) {
    var texts = getModalTexts(type);
    var overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'mdc-esfera-overlay';
    overlay.innerHTML =
      '<div class="mdc-esfera-modal" role="dialog" aria-modal="true" aria-label="Popup Mês do Consumidor Esfera">' +
      '  <div class="mdc-esfera-header">' +
      '    <div class="mdc-esfera-brand">' +
      '      <img src="' +
      TOP_POPUP_ICON_URL +
      '" alt="Mês do Consumidor Azul e Esfera" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/r3EtuVr.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/r3EtuVr.jpeg\';}">' +
      '    </div>' +
      '    <button type="button" class="mdc-esfera-close" aria-label="Fechar popup">&times;</button>' +
      '  </div>' +
      '  <div class="mdc-esfera-title-wrap">' +
      '    <h2 class="mdc-esfera-title">' +
      texts.title +
      '</h2>' +
      (texts.subtitle ? '    <p class="mdc-esfera-subtitle">' + texts.subtitle + '</p>' : '') +
      '  </div>' +
      '  <div class="mdc-esfera-body">' +
      '    <div class="mdc-esfera-logos">' +
      '      <img class="mdc-esfera-azul-logo" src="' +
      AZUL_LOGO_URL +
      '" alt="Azul" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/333lag3.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/333lag3.jpeg\';}">' +
      '      <span class="mdc-esfera-plus">+</span>' +
      '      <img class="mdc-esfera-partner-logo" src="' +
      PARTNER_LOGO_URL +
      '" alt="Logo parceiro" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/fSy8Jg3.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/fSy8Jg3.jpeg\';}">' +
      '    </div>' +
      '    <div class="mdc-esfera-countdown">' +
      '      <div class="mdc-esfera-countdown-title"><span class="mdc-esfera-clock">&#9716;</span>Promoção encerra em:</div>' +
      '      <div class="mdc-esfera-time">' +
      '        <div class="mdc-esfera-time-box"><span class="mdc-esfera-time-number" data-time="days">00</span><span class="mdc-esfera-time-label">DIAS</span></div>' +
      '        <div class="mdc-esfera-time-box"><span class="mdc-esfera-time-number" data-time="hours">00</span><span class="mdc-esfera-time-label">HORAS</span></div>' +
      '        <div class="mdc-esfera-time-box"><span class="mdc-esfera-time-number" data-time="minutes">00</span><span class="mdc-esfera-time-label">MIN</span></div>' +
      '        <div class="mdc-esfera-time-box"><span class="mdc-esfera-time-number" data-time="seconds">00</span><span class="mdc-esfera-time-label">SEG</span></div>' +
      '      </div>' +
      '    </div>' +
      '    <ul class="mdc-esfera-benefits">' +
      '      <li><span class="mdc-esfera-ico">' +
      getBenefitIconHTML('growth') +
      '</span><p>Transfira <b>1.000 pontos</b> e <b>receba até 2.330 pontos</b> na sua conta Azul!</p></li>' +
      '      <li><span class="mdc-esfera-ico">' +
      getBenefitIconHTML('travel') +
      '</span><p>Aproveite trechos a partir de <b>4.000 pontos</b> e voe cada vez mais!</p></li>' +
      '      <li><span class="mdc-esfera-ico">' +
      getBenefitIconHTML('bonus') +
      '</span><p>Até <b>130% de bônus</b> exclusivo para assinantes <b>Clube Azul</b> - <a href="https://www.voeazul.com.br/br/pt/programa-fidelidade/clube-azul" target="_blank" rel="noopener">Faça parte</a> e aproveite benefícios exclusivos.</p></li>' +
      '    </ul>' +
      '    <div class="mdc-esfera-actions">' +
      '      <button type="button" class="mdc-esfera-cta">APROVEITAR OFERTAS AGORA</button>' +
      '      <button type="button" class="mdc-esfera-dismiss">' +
      texts.dismiss +
      '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    return overlay;
  }

  function removeEscHandler() {
    if (!escHandler) return;
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }

  function stopTick() {
    if (!tickTimeoutId) return;
    clearTimeout(tickTimeoutId);
    tickTimeoutId = null;
  }

  function detachTriggerListeners() {
    if (exitIntentHandler) {
      document.removeEventListener('mouseleave', exitIntentHandler);
      exitIntentHandler = null;
    }
    if (inactivityResetHandler) {
      document.removeEventListener('mousemove', inactivityResetHandler);
      document.removeEventListener('keydown', inactivityResetHandler);
      document.removeEventListener('scroll', inactivityResetHandler);
      document.removeEventListener('click', inactivityResetHandler);
      inactivityResetHandler = null;
    }
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }

  function closeModal(closeReason) {
    var overlay = document.getElementById(MODAL_ID);
    if (!overlay || overlay.classList.contains('closing')) return;

    if (closeReason) {
      analyticsEvent(closeReason + '_' + (currentModalType || 'unknown'), 'ModalClose');
    }

    var card = overlay.querySelector('.mdc-esfera-modal');
    overlay.classList.add('closing');
    if (card) card.classList.add('closing');

    removeEscHandler();
    stopTick();

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, CLOSE_ANIMATION_MS);
  }

  function bindCountdown() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    var daysEl = modal.querySelector('[data-time="days"]');
    var hoursEl = modal.querySelector('[data-time="hours"]');
    var minutesEl = modal.querySelector('[data-time="minutes"]');
    var secondsEl = modal.querySelector('[data-time="seconds"]');

    function pad(v) {
      return String(v).padStart(2, '0');
    }

    function render(diffMs) {
      if (diffMs <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        analyticsEvent('campaign_end_' + (currentModalType || 'unknown'), 'ModalAutoClose');
        closeModal();
        return false;
      }
      var totalSec = Math.floor(diffMs / 1000);
      var days = Math.floor(totalSec / 86400);
      var hours = Math.floor((totalSec % 86400) / 3600);
      var minutes = Math.floor((totalSec % 3600) / 60);
      var seconds = totalSec % 60;
      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
      return true;
    }

    function getCountdownTargetMs(nowMs) {
      if (nowMs < campaignStartMs) return campaignStartMs;
      return campaignEndMs;
    }

    function tick() {
      var nowMs = Date.now();
      var targetMs = getCountdownTargetMs(nowMs);
      var running = render(targetMs - nowMs);
      if (!running) return;
      var delay = 1000 - (Date.now() % 1000);
      tickTimeoutId = setTimeout(tick, delay);
    }

    stopTick();
    tick();
  }

  function bindModalEvents(overlay) {
    var closeBtn = overlay.querySelector('.mdc-esfera-close');
    var dismissBtn = overlay.querySelector('.mdc-esfera-dismiss');
    var ctaBtn = overlay.querySelector('.mdc-esfera-cta');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal('close_x');
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        closeModal('dismiss');
      });
    }

    if (ctaBtn) {
      ctaBtn.addEventListener('click', function () {
        analyticsEvent('cta_' + (currentModalType || 'unknown'), 'ModalCTA');
        closeModal();
        window.location.href = REDIRECT_URL;
      });
    }

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeModal('dismiss_overlay');
      }
    });

    removeEscHandler();
    escHandler = function (event) {
      if (event.key === 'Escape') {
        closeModal('dismiss_esc');
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function canShowModal() {
    if (!isDesktop()) return false;
    if (modalWasTriggered || getSessionShown()) return false;
    if (!canShowByDate()) return false;
    if (!canShowByDailyLimit()) return false;
    return true;
  }

  function showModal(type, triggerSource) {
    if (!canShowModal()) return;
    var existing = document.getElementById(MODAL_ID);
    if (existing) existing.remove();

    currentModalType = type;
    modalWasTriggered = true;
    registerImpression();
    detachTriggerListeners();

    var modal = buildModal(type);
    document.body.appendChild(modal);
    bindModalEvents(modal);
    bindCountdown();
    analyticsEvent((triggerSource || 'unknown') + '_' + type, 'ModalOpen');
  }

  function setupInactivityTrigger() {
    if (inactivityResetHandler) return;

    inactivityResetHandler = function () {
      if (modalWasTriggered || getSessionShown()) return;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(function () {
        showModal('inactivity', 'inactivity');
      }, INACTIVITY_MS);
    };

    document.addEventListener('mousemove', inactivityResetHandler);
    document.addEventListener('keydown', inactivityResetHandler);
    document.addEventListener('scroll', inactivityResetHandler);
    document.addEventListener('click', inactivityResetHandler);
    inactivityResetHandler();
  }

  function setupExitIntentTrigger() {
    if (exitIntentHandler) return;
    exitIntentHandler = function (event) {
      if (event.clientY <= 0) {
        showModal('exit', 'exit_intent');
      }
    };
    document.addEventListener('mouseleave', exitIntentHandler);
  }

  function init() {
    if (window.popupMesConsumidorEsferaInitialized) return;
    window.popupMesConsumidorEsferaInitialized = true;

    if (!isDesktop()) return;
    injectStyles();
    setupInactivityTrigger();
    setupExitIntentTrigger();
  }

  if (isDomReady()) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
