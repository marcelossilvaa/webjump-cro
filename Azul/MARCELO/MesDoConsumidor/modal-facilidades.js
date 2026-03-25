(function () {
  // ===== JANELA DA CAMPANHA =====
  const campaignStartMs = new Date(2026, 2, 6, 0, 0, 0).getTime();
  const campaignEndMs = new Date(2026, 2, 15, 23, 59, 0).getTime();
  const ctaUrl = 'https://compradepontos.voeazul.com.br/';

  // ===== ESTADO =====
  let currentModalType = null;
  let modalEl = null;
  let tickTimeoutId = null;
  let stylesInjected = false;
  let triggersInitialized = false;
  let inactivityTriggerDone = false;
  let exitIntentTriggerDone = false;

  const elems = {
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  };

  const selectors = {
    days: '.modalFacInjected__countdown__data[type="days"] .modalFacInjected__countdown__data__number',
    hours:
      '.modalFacInjected__countdown__data[type="hours"] .modalFacInjected__countdown__data__number',
    minutes:
      '.modalFacInjected__countdown__data[type="minutes"] .modalFacInjected__countdown__data__number',
    seconds:
      '.modalFacInjected__countdown__data[type="seconds"] .modalFacInjected__countdown__data__number',
  };

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking ModalFacilidades] Parametros ausentes no analytics.');
      return;
    }

    const labelEvent = 'AT_MesDoConsumidor_' + eventType + ' ' + eventLabel;
    const contextEvent = 'AT_modal_facilidades_' + (currentModalType || 'unknown');

    console.log('[Tracking ModalFacilidades] Evento disparado: ' + labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = contextEvent;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function checkIfDomReady() {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';
    if (isReady) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  }

  function init() {
    if (Date.now() >= campaignEndMs) return;

    if (!stylesInjected) {
      injectCustomStyles();
      stylesInjected = true;
    }

    if (triggersInitialized) return;
    triggersInitialized = true;

    setupInactivityTrigger();
    setupExitIntentTrigger();
  }

  function createModal(type) {
    const container = document.createElement('div');
    container.className = 'modalFacInjected';
    container.innerHTML =
      '<div class="modalFacInjectedContent">' +
      '<div class="modalFacInjected__header">' +
      '  <div class="modalFacInjected__headerContent">' +
      '    <img class="modalFacInjected__logo" src="https://i.imgur.com/GwExWFs.png" alt="Mes do Consumidor" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/GwExWFs.jpg\';}else if(this.dataset.fallback===\'1\'){this.src=\'https://i.imgur.com/GwExWFs.jpeg\';}" />' +
      '    <h2 class="modalFacInjected__title">Última chance de multiplicar seus pontos</h2>' +
      '  </div>' +
      '  <button class="modalFacInjected__close" aria-label="Fechar modal">' +
      '    <span></span><span></span>' +
      '  </button>' +
      '</div>' +
      '<div class="modalFacInjected__body">' +
      '  <div class="modalFacInjected__countdown">' +
      '    <p class="modalFacInjected__countdown__title">' +
      '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8Zm.5-13h-2v6l5 3 .99-1.64-3.99-2.36Z"></path></svg>' +
      '      Promoção encerra em:' +
      '    </p>' +
      '    <div class="modalFacInjected__countdown__time">' +
      '      <div class="modalFacInjected__countdown__data" type="days"><span class="modalFacInjected__countdown__data__number">00</span><span class="modalFacInjected__countdown__data__text">DIAS</span></div>' +
      '      <div class="modalFacInjected__countdown__data" type="hours"><span class="modalFacInjected__countdown__data__number">00</span><span class="modalFacInjected__countdown__data__text">HORAS</span></div>' +
      '      <div class="modalFacInjected__countdown__data" type="minutes"><span class="modalFacInjected__countdown__data__number">00</span><span class="modalFacInjected__countdown__data__text">MIN</span></div>' +
      '      <div class="modalFacInjected__countdown__data" type="seconds"><span class="modalFacInjected__countdown__data__number">00</span><span class="modalFacInjected__countdown__data__text">SEG</span></div>' +
      '    </div>' +
      '  </div>' +
      '  <ul class="modalFacInjected__benefits">' +
      '    <li><span class="modalFacInjected__benefitIcon"><img src="https://i.imgur.com/1W9YurJ.png" alt="Ícone de benefícios" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/1W9YurJ.jpg\';}else if(this.dataset.fallback===\'1\'){this.src=\'https://i.imgur.com/1W9YurJ.jpeg\';}" /></span><span>Compre 1.000 pontos e receba até 4.100 pontos na sua conta Azul!</span></li>' +
      '    <li><span class="modalFacInjected__benefitIcon"><img src="https://i.imgur.com/2HR5XhL.png" alt="Ícone de benefícios" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/2HR5XhL.jpg\';}else if(this.dataset.fallback===\'1\'){this.src=\'https://i.imgur.com/2HR5XhL.jpeg\';}else{this.src=\'https://i.imgur.com/1W9YurJ.png\';}" /></span><span>Aproveite trechos a partir de 4.000 pontos e voe cada vez mais!</span></li>' +
      '    <li><i>%</i><span>Até 310% de bônus exclusivo para assinantes Clube Azul. Adesão com até 50% OFF.</span></li>' +
      '  </ul>' +
      '  <button class="modalFacInjected__cta">QUERO COMPRAR</button>' +
      '  <button class="modalFacInjected__dismiss">Continuar navegando</button>' +
      '</div>' +
      '</div>';

    const titleEl = container.querySelector('.modalFacInjected__title');
    const dismissButton = container.querySelector('.modalFacInjected__dismiss');

    if (type === 'exit') {
      if (titleEl) {
        titleEl.innerHTML =
          'Não saia ainda :(<br><span style="font-size:24px;font-weight:700;line-height:32px;">Seus pontos podem render mais</span>';
      }
      if (dismissButton) {
        dismissButton.textContent = 'Continuar navegando';
      }
    } else {
      if (titleEl) {
        titleEl.textContent = 'Última chance de multiplicar seus pontos';
      }
      if (dismissButton) {
        dismissButton.textContent = 'Continuar navegando';
      }
    }

    return container;
  }

  function showModal(type, triggerSource) {
    if (Date.now() >= campaignEndMs) return;

    const dailyKey = 'azul-mes-consumidor-facilidades-modal-daily-count';
    const today = new Date().toISOString().slice(0, 10);
    let dailyData = null;

    try {
      dailyData = JSON.parse(localStorage.getItem(dailyKey));
    } catch (e) {
      dailyData = null;
    }

    if (!dailyData || dailyData.date !== today) {
      dailyData = {
        date: today,
        count: 0,
      };
    }

    if (dailyData.count >= 3) {
      console.log('[AT ModalFacilidades] Limite diario de 3 exibicoes atingido.');
      return;
    }

    const existing = document.querySelector('.modalFacInjected');
    if (existing) {
      stopTick();
      existing.remove();
    }

    currentModalType = type;

    const modal = createModal(type);
    document.body.appendChild(modal);

    dailyData.count += 1;
    localStorage.setItem(dailyKey, JSON.stringify(dailyData));

    elems.days = document.querySelector(selectors.days);
    elems.hours = document.querySelector(selectors.hours);
    elems.minutes = document.querySelector(selectors.minutes);
    elems.seconds = document.querySelector(selectors.seconds);
    modalEl = document.querySelector('.modalFacInjected');

    stopTick();
    tick();

    if (modalEl) {
      modalEl.classList.add('active');
      analyticsEvent((triggerSource || 'unknown') + '_' + type, 'modal_open');
    }

    buttonsHandler();
  }

  function setupInactivityTrigger() {
    const inactiveTime = 50000;
    let inactiveTimer = null;

    function resetInactiveTimer() {
      if (inactivityTriggerDone) return;

      clearTimeout(inactiveTimer);
      inactiveTimer = setTimeout(function () {
        if (inactivityTriggerDone) return;
        inactivityTriggerDone = true;
        showModal('inactivity', 'inactivity');
        removeListeners();
      }, inactiveTime);
    }

    function removeListeners() {
      document.removeEventListener('mousemove', resetInactiveTimer);
      document.removeEventListener('keydown', resetInactiveTimer);
      document.removeEventListener('scroll', resetInactiveTimer);
      document.removeEventListener('click', resetInactiveTimer);
      document.removeEventListener('touchstart', resetInactiveTimer);
    }

    document.addEventListener('mousemove', resetInactiveTimer);
    document.addEventListener('keydown', resetInactiveTimer);
    document.addEventListener('scroll', resetInactiveTimer);
    document.addEventListener('click', resetInactiveTimer);
    document.addEventListener('touchstart', resetInactiveTimer);

    resetInactiveTimer();
  }

  function setupExitIntentTrigger() {
    function onExitIntent(event) {
      if (exitIntentTriggerDone) return;
      if (event.clientY <= 0) {
        exitIntentTriggerDone = true;
        showModal('exit', 'exit_intent');
        document.removeEventListener('mouseleave', onExitIntent);
      }
    }

    document.addEventListener('mouseleave', onExitIntent);
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function render(diffMs) {
    if (diffMs <= 0) {
      if (elems.days) elems.days.textContent = '00';
      if (elems.hours) elems.hours.textContent = '00';
      if (elems.minutes) elems.minutes.textContent = '00';
      if (elems.seconds) elems.seconds.textContent = '00';
      analyticsEvent('campaign_end_' + (currentModalType || 'unknown'), 'modal_auto_close');
      closeModal();
      stopTick();
      return false;
    }

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (elems.days) elems.days.textContent = pad(days);
    if (elems.hours) elems.hours.textContent = pad(hours);
    if (elems.minutes) elems.minutes.textContent = pad(minutes);
    if (elems.seconds) elems.seconds.textContent = pad(seconds);

    return true;
  }

  function stopTick() {
    if (tickTimeoutId) {
      clearTimeout(tickTimeoutId);
      tickTimeoutId = null;
    }
  }

  function getCountdownTargetMs(nowMs) {
    if (nowMs < campaignStartMs) return campaignStartMs;
    return campaignEndMs;
  }

  function tick() {
    const nowMs = Date.now();
    const targetMs = getCountdownTargetMs(nowMs);
    const diff = targetMs - nowMs;
    const running = render(diff);

    if (!running) return;

    const delay = 1000 - (Date.now() % 1000);
    tickTimeoutId = setTimeout(tick, delay);
  }

  function closeModal(onClosed) {
    const el = document.querySelector('.modalFacInjected');
    if (!el) {
      if (typeof onClosed === 'function') onClosed();
      return;
    }

    if (el.classList.contains('closing')) return;

    stopTick();

    const content = el.querySelector('.modalFacInjectedContent');
    el.classList.add('closing');
    if (content) content.classList.add('closing');

    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (typeof onClosed === 'function') onClosed();
    }, 300);
  }

  function buttonsHandler() {
    const dismissButton = document.querySelector('.modalFacInjected__dismiss');
    if (dismissButton && !dismissButton.hasAttribute('data-analytics-added')) {
      dismissButton.setAttribute('data-analytics-added', 'true');
      dismissButton.addEventListener('click', function () {
        analyticsEvent('dismiss_' + (currentModalType || 'unknown'), 'modal_close');
        closeModal();
      });
    }

    const closeButton = document.querySelector('.modalFacInjected__close');
    if (closeButton && !closeButton.hasAttribute('data-analytics-added')) {
      closeButton.setAttribute('data-analytics-added', 'true');
      closeButton.addEventListener('click', function () {
        analyticsEvent('close_x_' + (currentModalType || 'unknown'), 'modal_close');
        closeModal();
      });
    }

    const ctaButton = document.querySelector('.modalFacInjected__cta');
    if (ctaButton && !ctaButton.hasAttribute('data-analytics-added')) {
      ctaButton.setAttribute('data-analytics-added', 'true');
      ctaButton.addEventListener('click', function () {
        analyticsEvent('cta_' + (currentModalType || 'unknown'), 'modal_cta');
        closeModal(function () {
          window.open(ctaUrl, '_blank', 'noopener,noreferrer');
        });
      });
    }
  }

  function injectCustomStyles() {
    const styleId = 'modal-facilidades-injected-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML =
      '@keyframes modalFacInjectedFadeIn {' +
      'from { opacity: 0; }' +
      'to { opacity: 1; }' +
      '}' +
      '@keyframes modalFacInjectedFadeOut {' +
      'from { opacity: 1; }' +
      'to { opacity: 0; }' +
      '}' +
      '@keyframes modalFacInjectedScaleIn {' +
      'from { opacity: 0; transform: scale(0.96) translateY(10px); }' +
      'to { opacity: 1; transform: scale(1) translateY(0); }' +
      '}' +
      '@keyframes modalFacInjectedScaleOut {' +
      'from { opacity: 1; transform: scale(1) translateY(0); }' +
      'to { opacity: 0; transform: scale(0.96) translateY(10px); }' +
      '}' +
      '.modalFacInjected {' +
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'padding: 12px;' +
      'display: none;' +
      'justify-content: center;' +
      'align-items: center;' +
      'background: rgba(0,0,0,0.55);' +
      'overflow-y: auto;' +
      'z-index: 9999;' +
      '}' +
      '.modalFacInjected.active {' +
      'display: flex;' +
      'animation: modalFacInjectedFadeIn 0.3s ease-out;' +
      '}' +
      '.modalFacInjected.closing {' +
      'display: flex;' +
      'animation: modalFacInjectedFadeOut 0.3s ease-in forwards;' +
      '}' +
      '.modalFacInjected * {' +
      'box-sizing: border-box;' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'color: #FFFFFF;' +
      '}' +
      '.modalFacInjectedContent {' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: flex-start;' +
      'padding: 0;' +
      'position: relative;' +
      'width: 520px;' +
      'max-width: calc(100% - 24px);' +
      'max-height: calc(100vh - 24px);' +
      'background: #0061A0;' +
      'box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);' +
      'border-radius: 10px;' +
      'animation: modalFacInjectedScaleIn 0.3s ease-out;' +
      'overflow: hidden;' +
      '}' +
      '.modalFacInjectedContent.closing {' +
      'animation: modalFacInjectedScaleOut 0.3s ease-in forwards;' +
      '}' +
      '.modalFacInjected__header {' +
      'display: flex;' +
      'justify-content: space-between;' +
      'align-items: flex-start;' +
      'padding: 24px;' +
      'width: 100%;' +
      '}' +
      '.modalFacInjected__headerContent {' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: flex-start;' +
      'gap: 24px;' +
      'width: calc(100% - 44px);' +
      '}' +
      '.modalFacInjected__logo {' +
      'width: 220px;' +
      'height: 86px;' +
      'object-fit: contain;' +
      '}' +
      '.modalFacInjected__title {' +
      'margin: 0;' +
      'font-weight: 700;' +
      'font-size: 34px;' +
      'line-height: 40px;' +
      '}' +
      '.modalFacInjected__close {' +
      'position: relative;' +
      'display: flex;' +
      'justify-content: center;' +
      'align-items: center;' +
      'width: 24px;' +
      'height: 24px;' +
      'border: none;' +
      'padding: 0;' +
      'background: transparent;' +
      'cursor: pointer;' +
      '}' +
      '.modalFacInjected__close span {' +
      'position: absolute;' +
      'width: 16px;' +
      'height: 2px;' +
      'background: rgba(255, 255, 255, 0.8);' +
      'border-radius: 2px;' +
      '}' +
      '.modalFacInjected__close span:first-child { transform: rotate(45deg); }' +
      '.modalFacInjected__close span:last-child { transform: rotate(-45deg); }' +
      '.modalFacInjected__body {' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: flex-start;' +
      'padding: 24px;' +
      'gap: 24px;' +
      'width: 100%;' +
      '}' +
      '.modalFacInjected__countdown {' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: flex-start;' +
      'gap: 12px;' +
      'width: 100%;' +
      'padding: 16px 16px 0;' +
      'background: #008BC4;' +
      'border-radius: 10px;' +
      '}' +
      '.modalFacInjected__countdown__title {' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'gap: 8px;' +
      'margin: 0;' +
      'width: 100%;' +
      'font-weight: 400;' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      '}' +
      '.modalFacInjected__countdown__title svg {' +
      'width: 20px;' +
      'height: 20px;' +
      'fill: #FFFFFF;' +
      '}' +
      '.modalFacInjected__countdown__time {' +
      'display: flex;' +
      'justify-content: center;' +
      'align-items: flex-start;' +
      'gap: 8px;' +
      'width: 100%;' +
      'padding-bottom: 16px;' +
      '}' +
      '.modalFacInjected__countdown__data {' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: center;' +
      'justify-content: flex-start;' +
      'padding: 12px 16px 0;' +
      'width: 70px;' +
      'height: 75px;' +
      'background: #041E42;' +
      'border-radius: 4px;' +
      '}' +
      '.modalFacInjected__countdown__data__number {' +
      'display: block;' +
      'width: 100%;' +
      'text-align: center;' +
      'font-weight: 700;' +
      'font-size: 24px;' +
      'line-height: 36px;' +
      '}' +
      '.modalFacInjected__countdown__data__text {' +
      'display: block;' +
      'width: 100%;' +
      'text-align: center;' +
      'font-family: Arial, sans-serif;' +
      'font-weight: 400;' +
      'font-size: 10px;' +
      'line-height: 15px;' +
      'color: rgba(255, 255, 255, 0.7);' +
      '}' +
      '.modalFacInjected__benefits {' +
      'list-style: none;' +
      'padding: 0;' +
      'margin: 0;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      'width: 100%;' +
      '}' +
      '.modalFacInjected__benefits li {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 12px;' +
      '}' +
      '.modalFacInjected__benefitIcon {' +
      'display: flex;' +
      'justify-content: center;' +
      'align-items: center;' +
      'width: 24px;' +
      'height: 24px;' +
      'border-radius: 9999px;' +
      'background: #041E42;' +
      'flex-shrink: 0;' +
      'overflow: hidden;' +
      '}' +
      '.modalFacInjected__benefitIcon img {' +
      'display: block;' +
      'width: 20px;' +
      'height: 20px;' +
      'object-fit: contain;' +
      '}' +
      '.modalFacInjected__benefits li i {' +
      'display: flex;' +
      'justify-content: center;' +
      'align-items: center;' +
      'font-style: normal;' +
      'font-weight: 700;' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      'width: 24px;' +
      'height: 24px;' +
      'border-radius: 9999px;' +
      'background: #041E42;' +
      'flex-shrink: 0;' +
      '}' +
      '.modalFacInjected__benefits li span {' +
      'font-weight: 400;' +
      'font-size: 15px;' +
      'line-height: 22px;' +
      '}' +
      '.modalFacInjected__cta {' +
      'display: flex;' +
      'justify-content: center;' +
      'align-items: center;' +
      'width: 100%;' +
      'height: 56px;' +
      'border: none;' +
      'border-radius: 24px;' +
      'background: #96BE1C;' +
      'color: #FFFFFF;' +
      'cursor: pointer;' +
      'font-weight: 700;' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      'text-transform: uppercase;' +
      '}' +
      '.modalFacInjected__cta:hover { opacity: 0.92; }' +
      '.modalFacInjected__dismiss {' +
      'width: 100%;' +
      'height: 53px;' +
      'border: none;' +
      'background: transparent;' +
      'cursor: pointer;' +
      'font-weight: 400;' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      'text-align: center;' +
      '}' +
      '@media screen and (max-width: 540px) {' +
      '.modalFacInjected {' +
      'padding: 8px;' +
      'align-items: center;' +
      '}' +
      '.modalFacInjectedContent {' +
      'width: 100%;' +
      'min-height: auto;' +
      'max-height: calc(100vh - 16px);' +
      'margin: auto;' +
      '}' +
      '.modalFacInjected__header {' +
      'padding: 16px 16px 12px;' +
      '}' +
      '.modalFacInjected__headerContent {' +
      'gap: 14px;' +
      '}' +
      '.modalFacInjected__logo {' +
      'width: 180px;' +
      'height: 70px;' +
      '}' +
      '.modalFacInjected__title {' +
      'font-size: 28px;' +
      'line-height: 30px;' +
      '}' +
      '.modalFacInjected__body {' +
      'padding: 16px;' +
      'gap: 16px;' +
      '}' +
      '.modalFacInjected__countdown {' +
      'padding: 12px 12px 0;' +
      '}' +
      '.modalFacInjected__countdown__time {' +
      'gap: 4px;' +
      '}' +
      '.modalFacInjected__countdown__data {' +
      'width: calc((100% - 12px) / 4);' +
      'min-width: 0;' +
      'padding: 10px 8px 0;' +
      'height: 68px;' +
      '}' +
      '.modalFacInjected__countdown__data__number {' +
      'font-size: 20px;' +
      'line-height: 28px;' +
      '}' +
      '.modalFacInjected__benefits li span {' +
      'font-size: 14px;' +
      'line-height: 20px;' +
      '}' +
      '.modalFacInjected__cta {' +
      'height: 52px;' +
      'font-size: 15px;' +
      'line-height: 22px;' +
      '}' +
      '.modalFacInjected__dismiss {' +
      'height: 46px;' +
      'font-size: 13px;' +
      'line-height: 20px;' +
      '}' +
      '}' +
      '@media screen and (max-width: 420px) {' +
      '.modalFacInjected__title {' +
      'font-size: 24px;' +
      'line-height: 26px;' +
      '}' +
      '.modalFacInjected__logo {' +
      'width: 150px;' +
      'height: 58px;' +
      '}' +
      '.modalFacInjected__countdown__title {' +
      'font-size: 13px;' +
      'line-height: 18px;' +
      '}' +
      '.modalFacInjected__countdown__data__number {' +
      'font-size: 18px;' +
      'line-height: 24px;' +
      '}' +
      '.modalFacInjected__countdown__data__text {' +
      'font-size: 9px;' +
      'line-height: 13px;' +
      '}' +
      '.modalFacInjected__benefits {' +
      'gap: 10px;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  if (window.mesDoConsumidorModalFacilidades) {
    console.log('[AT ModalFacilidades] Script ja executado.');
    return;
  }

  window.mesDoConsumidorModalFacilidades = true;
  checkIfDomReady();
})();
