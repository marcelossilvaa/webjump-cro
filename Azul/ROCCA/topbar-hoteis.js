// ============================================
// TOP BAR FIXA - PAGINA DE HOTEIS
// ============================================
// Barra fixa no topo exibida apenas em /br/pt/home/hotel
//
(function () {
  'use strict';

  var STYLE_ID = 'topbar-hoteis-styles';
  var TOPBAR_ID = 'topbar-hoteis';
  var TARGET_PATH = '/br/pt/home/hotel';

  // Verifica se esta na pagina correta
  function isTargetPage() {
    var path = window.location.pathname;
    return path.indexOf(TARGET_PATH) !== -1;
  }

  // Funcao para adicionar estilos
  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' + TOPBAR_ID + ' {' +
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 48px;' +
      'background: linear-gradient(90deg, #0150B5 0%, #00B4E2 100%);' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'z-index: 99999;' +
      'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);' +
      'overflow: hidden;' +
      'box-sizing: border-box;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-marquee-wrapper {' +
      'display: flex;' +
      'align-items: center;' +
      'width: 100%;' +
      'overflow: hidden;' +
      'padding: 0 50px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-marquee {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 60px;' +
      'animation: topbar-scroll 15s linear infinite;' +
      'white-space: nowrap;' +
      '}' +
      '#' + TOPBAR_ID + ':hover .topbar-marquee {' +
      'animation-play-state: paused;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-item {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 12px;' +
      'flex-shrink: 0;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-text {' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'font-size: 14px;' +
      'font-weight: 500;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-text strong {' +
      'font-weight: 700;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'gap: 6px;' +
      'background: rgba(255, 255, 255, 0.2);' +
      'border: 1px dashed #FFFFFF;' +
      'border-radius: 6px;' +
      'padding: 4px 12px;' +
      'cursor: pointer;' +
      'transition: background 0.2s ease, transform 0.2s ease;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom:hover {' +
      'background: rgba(255, 255, 255, 0.35);' +
      'transform: scale(1.05);' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom-code {' +
      'font-family: "Courier New", monospace;' +
      'font-size: 14px;' +
      'font-weight: 700;' +
      'color: #FFFFFF;' +
      'letter-spacing: 1px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom-icon {' +
      'width: 14px;' +
      'height: 14px;' +
      'fill: #FFFFFF;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom.copied {' +
      'background: rgba(76, 175, 80, 0.5);' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-close {' +
      'position: absolute;' +
      'right: 16px;' +
      'top: 50%;' +
      'transform: translateY(-50%);' +
      'background: transparent;' +
      'border: none;' +
      'cursor: pointer;' +
      'padding: 4px;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'opacity: 0.8;' +
      'transition: opacity 0.2s ease;' +
      'z-index: 2;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-close:hover {' +
      'opacity: 1;' +
      '}' +
      'body.topbar-hoteis-active {' +
      'padding-top: 48px !important;' +
      '}' +
      '@keyframes topbar-scroll {' +
      '0% { transform: translateX(0); }' +
      '100% { transform: translateX(-50%); }' +
      '}' +
      '@media (max-width: 768px) {' +
      '#' + TOPBAR_ID + ' {' +
      'height: 44px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-text {' +
      'font-size: 12px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom {' +
      'padding: 3px 10px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-cupom-code {' +
      'font-size: 12px;' +
      '}' +
      '#' + TOPBAR_ID + ' .topbar-close {' +
      'right: 10px;' +
      '}' +
      'body.topbar-hoteis-active {' +
      'padding-top: 44px !important;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  // Funcao para copiar texto para clipboard
  function copyToClipboard(text, element) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopiedFeedback(element);
      }).catch(function () {
        fallbackCopy(text, element);
      });
    } else {
      fallbackCopy(text, element);
    }
  }

  // Fallback para copiar em navegadores antigos
  function fallbackCopy(text, element) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopiedFeedback(element);
    } catch (e) {
      console.log('[TopBarHoteis] Erro ao copiar');
    }
    document.body.removeChild(textarea);
  }

  // Feedback visual de copiado
  function showCopiedFeedback(element) {
    var originalText = element.querySelector('.topbar-cupom-code').textContent;
    element.classList.add('copied');
    element.querySelector('.topbar-cupom-code').textContent = 'Copiado!';
    
    setTimeout(function () {
      element.classList.remove('copied');
      element.querySelector('.topbar-cupom-code').textContent = originalText;
    }, 1500);
    
    console.log('[TopBarHoteis] Cupom copiado: ' + originalText);
  }

  // Funcao para criar um item do marquee
  function createMarqueeItem() {
    var item = document.createElement('div');
    item.className = 'topbar-item';

    // Texto promocional
    var text = document.createElement('p');
    text.className = 'topbar-text';
    text.innerHTML = 'Aproveite <strong>20% de desconto</strong>. Use o cupom:';
    item.appendChild(text);

    // Cupom clicavel
    var cupom = document.createElement('button');
    cupom.className = 'topbar-cupom';
    cupom.type = 'button';
    cupom.setAttribute('title', 'Clique para copiar');

    var cupomCode = document.createElement('span');
    cupomCode.className = 'topbar-cupom-code';
    cupomCode.textContent = 'CONSUMIDOR20';
    cupom.appendChild(cupomCode);

    // Icone de copiar
    var copyIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    copyIcon.setAttribute('class', 'topbar-cupom-icon');
    copyIcon.setAttribute('viewBox', '0 0 24 24');
    copyIcon.innerHTML = '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>';
    cupom.appendChild(copyIcon);

    cupom.addEventListener('click', function (e) {
      e.stopPropagation();
      copyToClipboard('CONSUMIDOR20', cupom);
    });

    item.appendChild(cupom);

    return item;
  }

  // Funcao para criar a top bar
  function createTopBar() {
    if (document.getElementById(TOPBAR_ID)) {
      console.log('[TopBarHoteis] Top bar ja existe');
      return;
    }

    var topbar = document.createElement('div');
    topbar.id = TOPBAR_ID;

    // Wrapper do marquee
    var marqueeWrapper = document.createElement('div');
    marqueeWrapper.className = 'topbar-marquee-wrapper';

    // Container do marquee animado
    var marquee = document.createElement('div');
    marquee.className = 'topbar-marquee';

    // Duplicar itens para criar loop infinito suave
    for (var i = 0; i < 6; i++) {
      marquee.appendChild(createMarqueeItem());
    }

    marqueeWrapper.appendChild(marquee);
    topbar.appendChild(marqueeWrapper);

    // Botao fechar
    var closeBtn = document.createElement('button');
    closeBtn.className = 'topbar-close';
    closeBtn.setAttribute('aria-label', 'Fechar barra');
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M4 4L12 12M12 4L4 12" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
    closeBtn.addEventListener('click', function () {
      closeTopBar();
    });
    topbar.appendChild(closeBtn);

    document.body.insertBefore(topbar, document.body.firstChild);
    document.body.classList.add('topbar-hoteis-active');

    console.log('[TopBarHoteis] Top bar criada com sucesso');
  }

  // Funcao para fechar a top bar
  function closeTopBar() {
    var topbar = document.getElementById(TOPBAR_ID);
    if (topbar) {
      topbar.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      topbar.style.transform = 'translateY(-100%)';
      topbar.style.opacity = '0';
      setTimeout(function () {
        topbar.remove();
        document.body.classList.remove('topbar-hoteis-active');
      }, 300);
      console.log('[TopBarHoteis] Top bar fechada');
    }
  }

  // Funcao de inicializacao
  function init() {
    if (!isTargetPage()) {
      console.log('[TopBarHoteis] Pagina nao e de hoteis, ignorando');
      return;
    }

    console.log('[TopBarHoteis] Inicializando top bar...');
    addStyles();
    createTopBar();
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
