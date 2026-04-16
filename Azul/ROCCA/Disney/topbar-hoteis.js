// ============================================
// TOP BAR FIXA - PAGINA DE HOTEIS
// ============================================
// Barra fixa no topo exibida apenas em /br/pt/home/hotel
//
(function () {
  'use strict';

  const STYLE_ID = 'topbar-hoteis-styles';
  const TOPBAR_ID = 'topbar-hoteis';
  const TARGET_PATH = '/br/pt/home/hotel';
  const COUPON_CODE = 'HOTEENCANTADO20';
  const BODY_ACTIVE_CLASS = 'topbar-hoteis-active';
  const SHOW_SUCCESS_CLASS = 'topbar-show-success';
  const MAX_INIT_ATTEMPTS = 10;
  const MAX_MOBILE_SYNC_ATTEMPTS = 12;
  const MOBILE_REFERENCE_SELECTOR = '.styles__ContentWrapper-sc-itp8cy-3.dvnfst';
  let successTimeoutId = null;

  // Verifica se esta na pagina correta
  function isTargetPage() {
    const path = window.location.pathname;
    return path.indexOf(TARGET_PATH) !== -1;
  }

  function trackInteraction(eventType, eventLabel) {
    if (!eventType || !eventLabel) {
      return;
    }

    const labelEvent = 'AT_TopbarHoteis_' + eventType + ' ' + eventLabel;
    console.log('[TopBarHoteis] Tracking disparado: ' + labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_home_hotel_topbar';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Funcao para adicionar estilos
  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' + TOPBAR_ID + ' {' +
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 64px;' +
      'background: url(\'https://i.imgur.com/IThy7pv.png\') no-repeat;' +
      'background-size: 100% 100%;' +
      'display: flex;' +
      'align-items: stretch;' +
      'justify-content: center;' +
      'z-index: 99999;' +
      'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);' +
      'overflow: hidden;' +
      'box-sizing: border-box;' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-frame {' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: space-between;' +
      'width: 100%;' +
      'max-width: 1440px;' +
      'padding: 16px 80px;' +
      'box-sizing: border-box;' +
      'position: relative;' +
      'z-index: 2;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-content {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 16px;' +
      'min-width: 0;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-text {' +
      'display: flex;' +
      'align-items: center;' +
      'font-size: 16px;' +
      'font-weight: 700;' +
      'line-height: 24px;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      'white-space: nowrap;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-copy-btn {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'gap: 10px;' +
      'background: #026CB6;' +
      'border: 1px solid rgba(255, 255, 255, 0.32);' +
      'border-radius: 6px;' +
      'padding: 10px 16px;' +
      'cursor: pointer;' +
      'transition: background 0.2s ease;' +
      'color: #FFFFFF;' +
      'font-size: 16px;' +
      'font-weight: 700;' +
      'line-height: 16px;' +
      'white-space: nowrap;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-copy-btn:hover {' +
      'background: #015B9B;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-code {' +
      'display: inline-block;' +
      'padding: 0 8px;' +
      'border-left: 1px solid rgba(255, 255, 255, 0.35);' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'font-size: 14px;' +
      'font-weight: 700;' +
      'letter-spacing: 0.4px;' +
      'color: #FFFFFF;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-copy-icon {' +
      'width: 18px;' +
      'height: 18px;' +
      'fill: #FFFFFF;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-close {' +
      'background: rgba(255, 255, 255, 0.12);' +
      'border: none;' +
      'border-radius: 30px;' +
      'cursor: pointer;' +
      'padding: 2px;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'width: 24px;' +
      'height: 24px;' +
      'transition: background 0.2s ease;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-close:hover {' +
      'background: rgba(255, 255, 255, 0.2);' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-success-overlay {' +
      'position: absolute;' +
      'left: 0;' +
      'top: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'background: rgba(3, 18, 46, 0.88);' +
      'backdrop-filter: blur(4px);' +
      'opacity: 0;' +
      'pointer-events: none;' +
      'transition: opacity 0.25s ease;' +
      'z-index: 5;' +
      '}' +
      '#' + TOPBAR_ID + '.topbar-show-success .topbar-success-overlay {' +
      'opacity: 1;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-success-message {' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      'font-weight: 700;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-bg-stars {' +
      'position: absolute;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'pointer-events: none;' +
      'z-index: 1;' +
      'overflow: hidden;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star {' +
      'position: absolute;' +
      'fill: #FFFFFF;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-1 {' +
      'width: 28px;' +
      'height: 28px;' +
      'opacity: 0.28;' +
      'left: 24px;' +
      'top: 50%;' +
      'transform: translateY(-50%);' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-2 {' +
      'width: 14px;' +
      'height: 14px;' +
      'opacity: 0.18;' +
      'left: 66px;' +
      'top: 6px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-3 {' +
      'width: 20px;' +
      'height: 20px;' +
      'opacity: 0.15;' +
      'right: 196px;' +
      'top: 50%;' +
      'transform: translateY(-50%);' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-4 {' +
      'width: 10px;' +
      'height: 10px;' +
      'opacity: 0.20;' +
      'right: 258px;' +
      'top: 10px;' +
      '}' +
      'body.' + BODY_ACTIVE_CLASS + ' {' +
      'padding-top: 64px !important;' +
      '}' +
      '@media (max-width: 768px) {' +
      '#' + TOPBAR_ID + ' {' +
      'height: auto;' +
      'background: url(\'https://i.imgur.com/fJP2ex4.png\') no-repeat;' +
      'background-size: 100% 100%;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-frame {' +
      'flex-direction: row;' +
      'padding: 16px;' +
      'gap: 16px;' +
      'justify-content: space-between;' +
      'align-items: center;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-content {' +
      'flex-direction: column;' +
      'justify-content: flex-start;' +
      'align-items: flex-start;' +
      'gap: 16px;' +
      'max-width: calc(100% - 40px);' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-text {' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      'font-weight: 400;' +
      'white-space: normal;' +
      'text-align: left;' +
      'width: 255px;' +
      'flex: none;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-copy-btn {' +
      'display: inline-flex;' +
      'padding: 10px 16px;' +
      'font-size: 16px;' +
      'line-height: 16px;' +
      'width: fit-content;' +
      'flex-shrink: 0;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-copy-btn span:first-child {' +
      'display: inline;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-copy-icon {' +
      'width: 18px;' +
      'height: 18px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-close {' +
      'width: 24px;' +
      'height: 24px;' +
      'padding: 2px;' +
      'background: rgba(255, 255, 255, 0.12);' +
      'border-radius: 30px;' +
      'flex-shrink: 0;' +
      'position: static;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-success-message {' +
      'font-size: 16px;' +
      'line-height: 24px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-3,' +
      '#' + TOPBAR_ID + ' .topbar-star-4 {' +
      'display: none;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-1 {' +
      'left: 8px;' +
      'width: 20px;' +
      'height: 20px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-star-2 {' +
      'left: 36px;' +
      'width: 10px;' +
      'height: 10px;' +
      '}' +
      'body.' + BODY_ACTIVE_CLASS + ' {' +
      'padding-top: 300px !important;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  // Funcao para copiar texto para clipboard
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopiedFeedback();
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  // Fallback para copiar em navegadores antigos
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      showCopiedFeedback();
    } catch (e) {
      console.log('[TopBarHoteis] Erro ao copiar');
    }

    document.body.removeChild(textarea);
  }

  // Feedback visual de copiado
  function showCopiedFeedback() {
    const topbar = document.getElementById(TOPBAR_ID);
    if (!topbar) {
      return;
    }

    if (successTimeoutId) {
      clearTimeout(successTimeoutId);
    }

    topbar.classList.add(SHOW_SUCCESS_CLASS);
    successTimeoutId = setTimeout(function () {
      topbar.classList.remove(SHOW_SUCCESS_CLASS);
    }, 1800);

    trackInteraction('copy', COUPON_CODE);
    console.log('[TopBarHoteis] Cupom copiado: ' + COUPON_CODE);
  }

  function addCopyListener(copyButton) {
    if (!copyButton || copyButton.dataset.copyListenerAdded === 'true') {
      return;
    }

    copyButton.dataset.copyListenerAdded = 'true';
    copyButton.addEventListener('click', function () {
      copyToClipboard(COUPON_CODE);
    });
  }

  // Funcao para criar a top bar
  function createTopBar() {
    if (document.getElementById(TOPBAR_ID)) {
      console.log('[TopBarHoteis] Top bar ja existe');
      return;
    }

    const topbar = document.createElement('div');
    topbar.id = TOPBAR_ID;

    const starsContainer = document.createElement('div');
    starsContainer.className = 'topbar-bg-stars';
    starsContainer.setAttribute('aria-hidden', 'true');
    const starPath = '<path d="M12 0L15.5 8.5L24 12L15.5 15.5L12 24L8.5 15.5L0 12L8.5 8.5Z"/>';
    starsContainer.innerHTML =
      '<svg class="topbar-star topbar-star-1" viewBox="0 0 24 24">' + starPath + '</svg>' +
      '<svg class="topbar-star topbar-star-2" viewBox="0 0 24 24">' + starPath + '</svg>' +
      '<svg class="topbar-star topbar-star-3" viewBox="0 0 24 24">' + starPath + '</svg>' +
      '<svg class="topbar-star topbar-star-4" viewBox="0 0 24 24">' + starPath + '</svg>';
    topbar.appendChild(starsContainer);

    const frame = document.createElement('div');
    frame.className = 'topbar-frame';

    const content = document.createElement('div');
    content.className = 'topbar-content';

    const text = document.createElement('p');
    text.className = 'topbar-text';
    text.textContent = 'Somente na Azul, seu sonho Disney se torna realizade com 20% de desconto em hoteis.';
    content.appendChild(text);

    const copyButton = document.createElement('button');
    copyButton.className = 'topbar-copy-btn';
    copyButton.type = 'button';
    copyButton.setAttribute('title', 'Clique e copie');
    copyButton.setAttribute('aria-label', 'Copiar codigo promocional ' + COUPON_CODE);
    copyButton.innerHTML =
      '<span>Clique e copie</span>' +
      '<svg class="topbar-copy-icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>' +
      '</svg>' +
      '<span class="topbar-code">' + COUPON_CODE + '</span>';
    addCopyListener(copyButton);
    content.appendChild(copyButton);

    if (content.dataset.mobileCopyListenerAdded !== 'true') {
      content.dataset.mobileCopyListenerAdded = 'true';
      content.addEventListener('click', function (e) {
        if (window.innerWidth <= 768 && e.target === content || e.target === text) {
          copyToClipboard(COUPON_CODE);
        }
      });
    }

    frame.appendChild(content);

    // Botao fechar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'topbar-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar barra');
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M5 5L15 15M15 5L5 15" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';

    if (closeBtn.dataset.closeListenerAdded !== 'true') {
      closeBtn.dataset.closeListenerAdded = 'true';
      closeBtn.addEventListener('click', function () {
        trackInteraction('close', 'topbar_hoteis');
        closeTopBar();
      });
    }

    frame.appendChild(closeBtn);
    topbar.appendChild(frame);

    const successOverlay = document.createElement('div');
    successOverlay.className = 'topbar-success-overlay';
    successOverlay.innerHTML = '<p class="topbar-success-message">Código copiado com sucesso!</p>';
    topbar.appendChild(successOverlay);

    document.body.insertBefore(topbar, document.body.firstChild);
    document.body.classList.add(BODY_ACTIVE_CLASS);

    if (!window._topbarHoteisResizeListenerAdded) {
      window._topbarHoteisResizeListenerAdded = true;
      window.addEventListener('resize', function () {
        scheduleMobileHeightSync(0);
      });
    }

    scheduleMobileHeightSync(0);

    console.log('[TopBarHoteis] Top bar criada com sucesso');
  }

  // Funcao para fechar a top bar
  function closeTopBar() {
    const topbar = document.getElementById(TOPBAR_ID);
    if (topbar) {
      topbar.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      topbar.style.transform = 'translateY(-100%)';
      topbar.style.opacity = '0';

      setTimeout(function () {
        topbar.remove();
        document.body.classList.remove(BODY_ACTIVE_CLASS);
      }, 300);

      console.log('[TopBarHoteis] Top bar fechada');
    }
  }

  function syncMobileTopbarHeight() {
    const topbar = document.getElementById(TOPBAR_ID);
    if (!topbar) {
      return true;
    }

    if (window.innerWidth > 768) {
      topbar.style.height = '64px';
      document.body.style.setProperty('padding-top', '64px', 'important');
      return true;
    }

    const reference = document.querySelector(MOBILE_REFERENCE_SELECTOR);
    if (!reference) {
      return false;
    }

    const referenceHeight = Math.ceil(reference.getBoundingClientRect().height);
    if (!referenceHeight) {
      return false;
    }

    topbar.style.height = referenceHeight + 'px';
    document.body.style.setProperty('padding-top', referenceHeight + 'px', 'important');
    return true;
  }

  function scheduleMobileHeightSync(attempt) {
    if (attempt >= MAX_MOBILE_SYNC_ATTEMPTS) {
      return;
    }

    if (syncMobileTopbarHeight()) {
      return;
    }

    setTimeout(function () {
      scheduleMobileHeightSync(attempt + 1);
    }, 250);
  }

  function runInit(attempt) {
    if (!document.body) {
      if (attempt >= MAX_INIT_ATTEMPTS) {
        console.log('[TopBarHoteis] Falha ao iniciar: body indisponivel');
        return;
      }

      setTimeout(function () {
        runInit(attempt + 1);
      }, 250);
      return;
    }

    addStyles();
    createTopBar();
  }

  // Funcao de inicializacao
  function init() {
    if (!isTargetPage()) {
      console.log('[TopBarHoteis] Pagina nao e de hoteis, ignorando');
      return;
    }

    console.log('[TopBarHoteis] Inicializando top bar...');
    runInit(0);
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
