// ============================================
// BOTAO FLUTUANTE WHATSAPP - AZUL
// ============================================
// Botao 56x56. Balao abre no inicio da sessao e tambem no hover.
// Mobile/tablet (<1024px): bottom 70px para nao cobrir a navegacao.
//
(function () {
  'use strict';

  const STYLE_ID = 'azul-whatsapp-float-style';
  const WRAPPER_ID = 'azul-whatsapp-float-wrapper';
  const BUTTON_ID = 'azul-whatsapp-float-btn';
  const TOOLTIP_ID = 'azul-whatsapp-float-tooltip';
  const TOOLTIP_CLOSE_ID = 'azul-whatsapp-float-tooltip-close';
  const TOOLTIP_VISIBLE_CLASS = 'azul-whatsapp-tooltip-visible';
  const WHATSAPP_URL = 'https://wa.me/551146221033?text=Ol%C3%A1%2C%20vim%20do%20site%20da%20Azul%20e%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20Clube!';
  const TOOLTIP_TEXT = 'Tire todas as dúvidas e escolha o Clube Azul ideal para você!';
  const REF_ICON_ID = 'bot_icon_right';
  const REF_ICON_GAP = 12;
  const DESKTOP_BOTTOM = '39px';
  const MOBILE_BOTTOM = '70px';
  const MOBILE_QUERY = '(max-width: 768px)';
  const TABLET_QUERY = '(max-width: 1024px)';
  const TOOLTIP_HIDE_DELAY = 180;
  const SESSION_KEY = 'azul_whatsapp_tooltip_shown';
  const WHATSAPP_ICON_PATH = 'M380.9 97.1C339 55.1 283.2 32 224.1 32c-122.5 0-222 99.5-222 222 0 40.2 10.6 79.7 30.7 114.3L1 480l114.2-30c33.3 18.2 70.7 27.7 108.9 27.7h.1c122.5 0 222-99.5 222-222 0-59.1-23-114.9-65-156.9zM224.1 438.1h-.1c-32.6 0-64.5-8.8-92.4-25.4l-6.6-3.9-68.5 18 18.3-66.8-4.3-6.9c-18.4-29.2-28.1-63-28.1-97.7 0-102.2 83.1-185.3 185.4-185.3 49.5 0 96 19.3 130.9 54.2 35 35 54.1 81.5 54.1 130.9 0 102.3-83.1 185.4-185.3 185.4zm101.9-138.9c-5.6-2.8-33-16.3-38.1-18.1-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.4 18.1-17.7 21.8-3.3 3.7-6.5 4.2-12.1 1.4-32.8-16.4-54.3-29.3-75.9-66.5-5.7-9.9 5.7-9.2 16.3-30.6 1.8-3.7.9-6.9-.6-9.7-1.5-2.8-13.4-32.3-18.4-44.2-4.9-11.7-9.9-10.1-13.6-10.3-3.5-.2-7.5-.2-11.5-.2-4 0-10.5 1.5-16.1 7.4-5.6 5.9-21.5 21-21.5 51.3 0 30.3 21.9 59.5 24.9 63.6 3 4.1 41.2 62.9 100.1 85.7 49.9 19.5 60.1 15.6 70.9 14.6 10.8-.9 33-13.4 37.6-26.4 4.6-13 4.6-24.1 3.2-26.4-1.4-2.3-5.1-3.7-10.7-6.4z';

  let tooltipTimer = null;
  let tooltipHideTimer = null;
  let positionAttempts = 0;
  let hoverTracked = false;
  let keepOpenUntilDismiss = false;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking BotaoWhatsapp] Parametros ausentes para evento de analytics.');
      return;
    }

    const labelEvent = 'AT_BotaoFlutuanteWhatsapp_' + eventType + ' ' + eventLabel;
    console.log('[Tracking BotaoWhatsapp] Evento de analytics disparado: ' + labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_botao_flutuante_whatsapp';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function isMobileViewport() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function isTabletOrMobileViewport() {
    return window.matchMedia(TABLET_QUERY).matches;
  }

  function wasSessionIntroShown() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markSessionIntroShown() {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {}
  }

  function getStyles() {
    return [
      '@keyframes azulWhatsappBtnPulse {',
      '  0% { transform: scale(1); }',
      '  50% { transform: scale(1.06); }',
      '  100% { transform: scale(1); }',
      '}',
      '@keyframes azulWhatsappBalloonIn {',
      '  0% { opacity: 0; visibility: visible; transform: translateX(16px) scale(0.82); }',
      '  62% { opacity: 1; transform: translateX(-4px) scale(1.05); }',
      '  100% { opacity: 1; visibility: visible; transform: translateX(0) scale(1); }',
      '}',
      '@keyframes azulWhatsappBalloonOut {',
      '  0% { opacity: 1; visibility: visible; transform: translateX(0) scale(1); }',
      '  100% { opacity: 0; visibility: hidden; transform: translateX(12px) scale(0.9); }',
      '}',
      '@keyframes azulWhatsappBalloonInMobile {',
      '  0% { opacity: 0; visibility: visible; transform: translateY(14px) scale(0.82); }',
      '  62% { opacity: 1; transform: translateY(-4px) scale(1.05); }',
      '  100% { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }',
      '}',
      '@keyframes azulWhatsappBalloonOutMobile {',
      '  0% { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }',
      '  100% { opacity: 0; visibility: hidden; transform: translateY(10px) scale(0.9); }',
      '}',

      '#' + WRAPPER_ID + ' {',
      '  position: fixed;',
      '  right: 22px;',
      '  bottom: ' + DESKTOP_BOTTOM + ';',
      '  display: flex;',
      '  flex-direction: row;',
      '  justify-content: flex-end;',
      '  align-items: center;',
      '  gap: 8px;',
      '  width: auto;',
      '  max-width: calc(100vw - 32px);',
      '  z-index: 9999;',
      '  pointer-events: none;',
      '}',
      '#' + WRAPPER_ID + ' * { box-sizing: border-box; }',

      '#' + TOOLTIP_ID + ' {',
      '  position: relative;',
      '  display: flex;',
      '  align-items: flex-start;',
      '  gap: 8px;',
      '  width: max-content;',
      '  max-width: 220px;',
      '  padding: 8px 10px 8px 12px;',
      '  background: #DFF2FE;',
      '  box-shadow: 0px 6px 16px rgba(0, 29, 70, 0.2);',
      '  border-radius: 10px;',
      '  opacity: 0;',
      '  visibility: hidden;',
      '  transform: translateX(16px) scale(0.82);',
      '  transform-origin: right center;',
      '  pointer-events: none;',
      '}',
      '#' + TOOLTIP_ID + '.' + TOOLTIP_VISIBLE_CLASS + ' {',
      '  pointer-events: auto;',
      '  animation: azulWhatsappBalloonIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;',
      '}',
      '#' + TOOLTIP_ID + '.azul-whatsapp-tooltip-hiding {',
      '  pointer-events: none;',
      '  animation: azulWhatsappBalloonOut 0.28s ease forwards;',
      '}',
      '#' + TOOLTIP_ID + ' .azul-whatsapp-tooltip-message {',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '  font-style: normal;',
      '  font-weight: 500;',
      '  font-size: 12px;',
      '  line-height: 130%;',
      '  color: #041E42;',
      '  margin: 0;',
      '}',
      '#' + TOOLTIP_CLOSE_ID + ' {',
      '  flex: none;',
      '  width: 20px;',
      '  height: 20px;',
      '  margin: 0;',
      '  padding: 0;',
      '  border: none;',
      '  background: transparent;',
      '  color: #041E42;',
      '  font-size: 16px;',
      '  line-height: 20px;',
      '  cursor: pointer;',
      '}',
      '#' + TOOLTIP_ID + ' .azul-whatsapp-tooltip-caret {',
      '  position: absolute;',
      '  right: -6px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 0;',
      '  height: 0;',
      '  border-top: 6px solid transparent;',
      '  border-bottom: 6px solid transparent;',
      '  border-left: 6px solid #DFF2FE;',
      '}',

      '#' + BUTTON_ID + ' {',
      '  flex: none;',
      '  width: 56px;',
      '  height: 56px;',
      '  min-width: 56px;',
      '  min-height: 56px;',
      '  border: none;',
      '  padding: 0;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: linear-gradient(180deg, #0099D9 0%, #5EBCFE 100%);',
      '  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);',
      '  cursor: pointer;',
      '  pointer-events: auto;',
      '  animation: azulWhatsappBtnPulse 2.2s ease-in-out infinite;',
      '  transition: transform 0.24s ease, box-shadow 0.24s ease;',
      '}',
      '#' + BUTTON_ID + ':hover {',
      '  animation: none;',
      '  transform: translateY(-2px) scale(1.08);',
      '  box-shadow: 0px 8px 14px rgba(0, 153, 217, 0.35);',
      '}',
      '#' + BUTTON_ID + ' svg {',
      '  width: 28px;',
      '  height: 28px;',
      '  pointer-events: none;',
      '}',

      '@media (max-width: 1024px) {',
      '  #' + WRAPPER_ID + ' {',
      '    bottom: ' + MOBILE_BOTTOM + ';',
      '  }',
      '}',

      '@media (max-width: 768px) {',
      '  #' + WRAPPER_ID + ' {',
      '    right: 16px;',
      '    flex-direction: column;',
      '    align-items: flex-end;',
      '  }',
      '  #' + TOOLTIP_ID + ' {',
      '    max-width: min(220px, calc(100vw - 88px));',
      '    transform: translateY(14px) scale(0.82);',
      '    transform-origin: bottom right;',
      '  }',
      '  #' + TOOLTIP_ID + '.' + TOOLTIP_VISIBLE_CLASS + ' {',
      '    animation-name: azulWhatsappBalloonInMobile;',
      '  }',
      '  #' + TOOLTIP_ID + '.azul-whatsapp-tooltip-hiding {',
      '    animation-name: azulWhatsappBalloonOutMobile;',
      '  }',
      '  #' + TOOLTIP_ID + ' .azul-whatsapp-tooltip-caret {',
      '    right: 18px;',
      '    top: auto;',
      '    bottom: -6px;',
      '    transform: none;',
      '    border-left: 6px solid transparent;',
      '    border-right: 6px solid transparent;',
      '    border-top: 6px solid #DFF2FE;',
      '    border-bottom: none;',
      '  }',
      '}',

      '@media (prefers-reduced-motion: reduce) {',
      '  #' + BUTTON_ID + ' { animation: none; }',
      '  #' + TOOLTIP_ID + ', #' + TOOLTIP_ID + '.' + TOOLTIP_VISIBLE_CLASS + ', #' + TOOLTIP_ID + '.azul-whatsapp-tooltip-hiding {',
      '    animation: none;',
      '    transition: opacity 0.2s ease, visibility 0.2s ease;',
      '  }',
      '  #' + TOOLTIP_ID + '.' + TOOLTIP_VISIBLE_CLASS + ' { opacity: 1; visibility: visible; transform: none; }',
      '}'
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function createWhatsappIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 448 512');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', WHATSAPP_ICON_PATH);
    path.setAttribute('fill', '#FFFFFF');

    svg.appendChild(path);
    return svg;
  }

  function clearTooltipTimers() {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    if (tooltipHideTimer) {
      clearTimeout(tooltipHideTimer);
      tooltipHideTimer = null;
    }
  }

  function hideTooltip(permanent) {
    const tooltip = document.getElementById(TOOLTIP_ID);
    if (!tooltip) return;

    clearTooltipTimers();
    tooltip.classList.remove(TOOLTIP_VISIBLE_CLASS);
    tooltip.classList.add('azul-whatsapp-tooltip-hiding');

    if (permanent) {
      keepOpenUntilDismiss = false;
      markSessionIntroShown();
    }
  }

  function showTooltip() {
    const tooltip = document.getElementById(TOOLTIP_ID);
    if (!tooltip) return;

    clearTooltipTimers();
    tooltip.classList.remove('azul-whatsapp-tooltip-hiding');

    if (!tooltip.classList.contains(TOOLTIP_VISIBLE_CLASS)) {
      tooltip.classList.add(TOOLTIP_VISIBLE_CLASS);
    }
  }

  function scheduleHideTooltip() {
    if (keepOpenUntilDismiss) return;

    clearTooltipTimers();
    tooltipHideTimer = setTimeout(function () {
      hideTooltip(false);
    }, TOOLTIP_HIDE_DELAY);
  }

  function goToWhatsapp() {
    analyticsEvent('clique', 'click');
    hideTooltip(true);
    window.open(WHATSAPP_URL, '_blank', 'noopener');
  }

  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;

    const message = document.createElement('p');
    message.className = 'azul-whatsapp-tooltip-message';
    message.textContent = TOOLTIP_TEXT;

    const closeBtn = document.createElement('button');
    closeBtn.id = TOOLTIP_CLOSE_ID;
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar mensagem');
    closeBtn.textContent = '\u00D7';

    const caret = document.createElement('span');
    caret.className = 'azul-whatsapp-tooltip-caret';

    tooltip.appendChild(message);
    tooltip.appendChild(closeBtn);
    tooltip.appendChild(caret);

    return tooltip;
  }

  function createButton() {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Abrir conversa no WhatsApp');
    btn.appendChild(createWhatsappIcon());
    return btn;
  }

  function bindListeners(wrapper) {
    if (wrapper.getAttribute('data-azul-whatsapp-added') === 'true') return;
    wrapper.setAttribute('data-azul-whatsapp-added', 'true');

    const btn = document.getElementById(BUTTON_ID);
    const tooltip = document.getElementById(TOOLTIP_ID);
    const closeBtn = document.getElementById(TOOLTIP_CLOSE_ID);

    if (btn) {
      btn.addEventListener('click', goToWhatsapp);
      btn.addEventListener('mouseenter', function () {
        if (isMobileViewport()) return;
        showTooltip();
        if (!hoverTracked) {
          hoverTracked = true;
          analyticsEvent('hover', 'view');
        }
      });
      btn.addEventListener('mouseleave', function () {
        if (isMobileViewport()) return;
        scheduleHideTooltip();
      });
    }

    if (tooltip) {
      tooltip.addEventListener('mouseenter', function () {
        if (isMobileViewport()) return;
        clearTooltipTimers();
        showTooltip();
      });
      tooltip.addEventListener('mouseleave', function () {
        if (isMobileViewport()) return;
        scheduleHideTooltip();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        analyticsEvent('fechar', 'click');
        hideTooltip(true);
      });
    }
  }

  function createWidget() {
    if (document.getElementById(WRAPPER_ID)) return;

    const wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;

    wrapper.appendChild(createTooltip());
    wrapper.appendChild(createButton());

    document.body.appendChild(wrapper);
    bindListeners(wrapper);
    analyticsEvent('exibicao', 'view');

    if (!wasSessionIntroShown()) {
      keepOpenUntilDismiss = true;
      markSessionIntroShown();
      showTooltip();
    }
  }

  function positionWrapper() {
    const wrapper = document.getElementById(WRAPPER_ID);
    if (!wrapper) return false;

    if (isTabletOrMobileViewport()) {
      wrapper.style.setProperty('bottom', MOBILE_BOTTOM, 'important');
      return true;
    }

    const ref = document.getElementById(REF_ICON_ID);
    if (!ref) {
      wrapper.style.setProperty('bottom', DESKTOP_BOTTOM, 'important');
      return false;
    }

    const rect = ref.getBoundingClientRect();
    if (!rect.height) {
      wrapper.style.setProperty('bottom', DESKTOP_BOTTOM, 'important');
      return false;
    }

    wrapper.style.setProperty('bottom', (window.innerHeight - rect.top + REF_ICON_GAP) + 'px', 'important');
    return true;
  }

  function tryPositionWrapper() {
    positionAttempts = 0;
    const max = 20;
    const interval = setInterval(function () {
      positionAttempts += 1;
      if (positionWrapper() || positionAttempts >= max) {
        clearInterval(interval);
      }
    }, 300);
  }

  function init() {
    injectStyles();
    createWidget();
    if (!positionWrapper()) {
      tryPositionWrapper();
    }
    window.addEventListener('resize', positionWrapper);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
