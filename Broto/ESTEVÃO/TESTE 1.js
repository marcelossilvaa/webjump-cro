(function () {
  'use strict';

  if (window.croModalConfirmacaoPagamentoInjected) {
    console.log('[CRO Modal Confirmacao Pagamento] Script ja injetado, ignorando.');
    return;
  }
  window.croModalConfirmacaoPagamentoInjected = true;

  const STYLE_ID = 'cro-mcp-style';
  const MODAL_ID = 'cro-mcp-modal';
  const SESSION_FLAG = 'cro_mcp_exibido';
  const ENABLE_DELAY_MS = 2000;
  // Ajustar conforme a URL real da etapa de pagamento do site
  const PAGE_PATH_KEYWORDS = ['pagamento', 'payment', 'checkout'];

  let modalElement = null;
  let modalVisible = false;
  let detectionEnabled = false;
  let hiddenAt = null;

  function isPaymentPage() {
    const path = (window.location.pathname + window.location.hash).toLowerCase();
    return PAGE_PATH_KEYWORDS.some((keyword) => path.indexOf(keyword) !== -1);
  }

  function alreadyShownInSession() {
    return sessionStorage.getItem(SESSION_FLAG) === 'true';
  }

  function markShownInSession() {
    sessionStorage.setItem(SESSION_FLAG, 'true');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.cro-mcp-overlay {',
      '  position: fixed;',
      '  inset: 0;',
      '  background-color: rgba(17, 17, 17, 0.6);',
      '  z-index: 999999;',
      '  display: none;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 16px;',
      '  box-sizing: border-box;',
      '  opacity: 0;',
      '  transition: opacity 0.25s ease;',
      '}',

      '.cro-mcp-overlay.cro-mcp-visible {',
      '  display: flex;',
      '  opacity: 1;',
      '}',

      '.cro-mcp-box {',
      '  position: relative;',
      '  background-color: #FFFFFF;',
      '  border-radius: 12px;',
      '  max-width: 400px;',
      '  width: 100%;',
      '  padding: 32px 24px 24px;',
      '  box-sizing: border-box;',
      '  text-align: center;',
      '  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);',
      '  transform: translateY(12px);',
      '  transition: transform 0.25s ease;',
      '  font-family: Arial, sans-serif;',
      '}',

      '.cro-mcp-overlay.cro-mcp-visible .cro-mcp-box {',
      '  transform: translateY(0);',
      '}',

      '.cro-mcp-close {',
      '  position: absolute;',
      '  top: 12px;',
      '  right: 12px;',
      '  width: 32px;',
      '  height: 32px;',
      '  border: none;',
      '  background-color: transparent;',
      '  color: #666666;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  border-radius: 50%;',
      '  padding: 0;',
      '}',

      '.cro-mcp-close:hover {',
      '  background-color: #F2F2F2;',
      '}',

      '.cro-mcp-icon {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  margin-bottom: 16px;',
      '}',

      '.cro-mcp-title {',
      '  font-size: 18px;',
      '  font-weight: 700;',
      '  color: #1A1A1A;',
      '  margin: 0 0 8px;',
      '  line-height: 1.3;',
      '}',

      '.cro-mcp-text {',
      '  font-size: 14px;',
      '  color: #555555;',
      '  margin: 0 0 24px;',
      '  line-height: 1.5;',
      '}',

      '.cro-mcp-actions {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 10px;',
      '}',

      '.cro-mcp-btn {',
      '  width: 100%;',
      '  padding: 13px 16px;',
      '  border-radius: 8px;',
      '  border: 1.5px solid transparent;',
      '  font-size: 15px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  box-sizing: border-box;',
      '  font-family: Arial, sans-serif;',
      '}',

      '.cro-mcp-btn--primary {',
      '  background-color: #4D5BF9;',
      '  color: #FFFFFF;',
      '}',

      '.cro-mcp-btn--primary:hover {',
      '  background-color: #3A47D6;',
      '}',

      '.cro-mcp-btn--secondary {',
      '  background-color: #FFFFFF;',
      '  color: #4D5BF9;',
      '  border-color: #4D5BF9;',
      '}',

      '.cro-mcp-btn--secondary:hover {',
      '  background-color: #F3F4FE;',
      '}',

      '@media (max-width: 480px) {',
      '  .cro-mcp-box {',
      '    padding: 28px 20px 20px;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'cro-mcp-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cro-mcp-title');

    overlay.innerHTML =
      '<div class="cro-mcp-box">'
      + '<button type="button" class="cro-mcp-close" aria-label="Fechar">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '</svg>'
      + '</button>'
      + '<div class="cro-mcp-icon">'
      + '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#4D5BF9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>'
      + '</div>'
      + '<h2 id="cro-mcp-title" class="cro-mcp-title">Seu pagamento ainda não foi concluído</h2>'
      + '<p class="cro-mcp-text">Se você sair agora, pode perder o progresso da sua compra e precisar recomeçar. Tem certeza que deseja sair sem finalizar o pagamento?</p>'
      + '<div class="cro-mcp-actions">'
      + '<button type="button" class="cro-mcp-btn cro-mcp-btn--primary" data-action="continuar">Continuar pagamento</button>'
      + '<button type="button" class="cro-mcp-btn cro-mcp-btn--secondary" data-action="sair">Sair sem finalizar</button>'
      + '</div>'
      + '</div>';

    modalElement = overlay;
    document.body.appendChild(modalElement);
    attachModalListeners();
  }

  function attachModalListeners() {
    const closeBtn = modalElement.querySelector('.cro-mcp-close');
    const continueBtn = modalElement.querySelector('[data-action="continuar"]');
    const exitBtn = modalElement.querySelector('[data-action="sair"]');

    closeBtn.addEventListener('click', () => {
      hideModal('fechar_x');
    });

    continueBtn.addEventListener('click', () => {
      hideModal('continuar_pagamento');
    });

    exitBtn.addEventListener('click', () => {
      hideModal('sair_sem_finalizar');
      exitPaymentFlow();
    });

    modalElement.addEventListener('click', (event) => {
      if (event.target === modalElement) {
        hideModal('fechar_overlay');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalVisible) {
        hideModal('fechar_esc');
      }
    });
  }

  function exitPaymentFlow() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }

  function showModal(trigger) {
    if (modalVisible || !detectionEnabled || alreadyShownInSession()) return;

    modalVisible = true;
    modalElement.classList.add('cro-mcp-visible');
    document.body.style.setProperty('overflow', 'hidden', 'important');
    markShownInSession();

    console.log('[CRO Modal Confirmacao Pagamento] Modal exibido, gatilho: ' + trigger);
    trackEvent('exibicao', trigger);
  }

  function hideModal(reason) {
    if (!modalVisible) return;

    modalVisible = false;
    modalElement.classList.remove('cro-mcp-visible');
    document.body.style.removeProperty('overflow');

    console.log('[CRO Modal Confirmacao Pagamento] Modal fechado, motivo: ' + reason);
    trackEvent('fechamento', reason);
  }

  function handleMouseOut(event) {
    if (event.clientY <= 0 && !event.relatedTarget) {
      showModal('mouse_saiu_pelo_topo');
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      return;
    }

    if (document.visibilityState === 'visible' && hiddenAt) {
      hiddenAt = null;
      showModal('retorno_apos_troca_de_aba');
    }
  }

  function enableDetection() {
    if (alreadyShownInSession()) return;

    detectionEnabled = true;
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    console.log('[CRO Modal Confirmacao Pagamento] Deteccao de saida habilitada.');
  }

  function trackEvent(action, label) {
    if (!label) {
      console.log('[CRO Modal Confirmacao Pagamento] Parametros ausentes para o evento de analytics.');
      return;
    }

    console.log('[CRO Modal Confirmacao Pagamento] Evento: ' + action + ' - ' + label);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cro_event',
      event_category: 'modal_confirmacao_pagamento',
      event_action: action,
      event_label: label
    });
  }

  function init() {
    if (!isPaymentPage()) {
      console.log('[CRO Modal Confirmacao Pagamento] Pagina atual nao e a de pagamento, script ignorado.');
      return;
    }

    if (alreadyShownInSession()) {
      console.log('[CRO Modal Confirmacao Pagamento] Modal ja exibido nesta sessao, script ignorado.');
      return;
    }

    injectStyles();
    buildModal();
    setTimeout(enableDetection, ENABLE_DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
