// ============================================
// BOTAO FLUTUANTE MICKEY - DISNEY PROMOCOES
// ============================================
// Botao flutuante com icone do Mickey e efeito de brilho
// Redireciona para pagina de promocoes Disney
//
(function () {
  'use strict';

  var STYLE_ID = 'mickey-float-button-styles';
  var BUTTON_ID = 'mickey-float-button';
  var REDIRECT_URL = 'https://www.voeazul.com.br/br/pt/disney/promocoes-disney';

  // Funcao para adicionar estilos
  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' + BUTTON_ID + ' {' +
      'position: fixed;' +
      'left: 20px;' +
      'bottom: 120px;' +
      'width: 75px;' +
      'height: 75px;' +
      'background: transparent;' +
      'border: none;' +
      'cursor: pointer;' +
      'z-index: 9990;' +
      'padding: 0;' +
      'box-sizing: border-box;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'transition: transform 0.3s ease;' +
      'overflow: visible;' +
      '}' +
      '#' + BUTTON_ID + ':hover {' +
      'transform: scale(1.1);' +
      '}' +
      '#' + BUTTON_ID + ' .mickey-icon {' +
      'width: 100%;' +
      'height: 100%;' +
      'position: relative;' +
      'z-index: 1;' +
      '}' +
      '#' + BUTTON_ID + ' .mickey-glow {' +
      'position: absolute;' +
      'top: 50%;' +
      'left: 50%;' +
      'transform: translate(-50%, -50%);' +
      'width: 115%;' +
      'height: 115%;' +
      'z-index: 0;' +
      'filter: blur(6px);' +
      'opacity: 0.9;' +
      'animation: mickey-glow-pulse 2s ease-in-out infinite;' +
      '}' +
      '@keyframes mickey-glow-pulse {' +
      '0%, 100% { opacity: 0.7; filter: blur(5px); }' +
      '50% { opacity: 1; filter: blur(8px); }' +
      '}' +
      '@media (max-width: 768px) {' +
      '#' + BUTTON_ID + ' {' +
      'width: 65px;' +
      'height: 65px;' +
      'left: 15px;' +
      'bottom: 100px;' +
      '}' +
      '}' +
      '@media (max-width: 480px) {' +
      '#' + BUTTON_ID + ' {' +
      'width: 55px;' +
      'height: 55px;' +
      'left: 10px;' +
      'bottom: 80px;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  // Funcao para criar o icone do Mickey em SVG
  function createMickeyIcon(isGlow) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', isGlow ? 'mickey-glow' : 'mickey-icon');

    // Cores do Mickey ou gradiente para o glow
    var fillColor = isGlow ? 'url(#mickeyGlowGradient)' : '#1C1C1C';

    // Definicao do gradiente para o glow
    if (isGlow) {
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      var gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', 'mickeyGlowGradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');

      var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#FF6B6B');

      var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '33%');
      stop2.setAttribute('stop-color', '#FFE66D');

      var stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop3.setAttribute('offset', '66%');
      stop3.setAttribute('stop-color', '#4ECDC4');

      var stop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop4.setAttribute('offset', '100%');
      stop4.setAttribute('stop-color', '#A78BFA');

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      gradient.appendChild(stop3);
      gradient.appendChild(stop4);
      defs.appendChild(gradient);
      svg.appendChild(defs);
    }

    // Orelha esquerda
    var earLeft = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    earLeft.setAttribute('cx', '22');
    earLeft.setAttribute('cy', '22');
    earLeft.setAttribute('r', '18');
    earLeft.setAttribute('fill', fillColor);

    // Orelha direita
    var earRight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    earRight.setAttribute('cx', '78');
    earRight.setAttribute('cy', '22');
    earRight.setAttribute('r', '18');
    earRight.setAttribute('fill', fillColor);

    // Cabeca principal
    var head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', '50');
    head.setAttribute('cy', '55');
    head.setAttribute('r', '35');
    head.setAttribute('fill', fillColor);

    svg.appendChild(earLeft);
    svg.appendChild(earRight);
    svg.appendChild(head);

    return svg;
  }

  // Funcao para criar o botao
  function createButton() {
    if (document.getElementById(BUTTON_ID)) {
      console.log('[MickeyButton] Botao ja existe');
      return;
    }

    var button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.setAttribute('aria-label', 'Promocoes Disney - Clique para ver ofertas');
    button.setAttribute('title', 'Promocoes Disney');

    // Icone de glow (brilho atras com formato do Mickey)
    var glowIcon = createMickeyIcon(true);
    button.appendChild(glowIcon);

    // Icone principal do Mickey
    var mickeyIcon = createMickeyIcon(false);
    button.appendChild(mickeyIcon);

    button.addEventListener('click', function () {
      console.log('[MickeyButton] Botao clicado - redirecionando para promocoes Disney');
      window.open(REDIRECT_URL, '_blank');
    });

    document.body.appendChild(button);
    console.log('[MickeyButton] Botao flutuante Mickey criado com sucesso');
  }

  // Funcao de inicializacao
  function init() {
    console.log('[MickeyButton] Inicializando botao flutuante Mickey...');
    addStyles();
    createButton();
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
