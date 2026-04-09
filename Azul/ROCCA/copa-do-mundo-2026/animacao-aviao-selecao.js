(function () {
  'use strict';

  // ============================================
  // Animacao Aviao Azul - Copa do Mundo 2026
  // Versao sutil - canto esquerdo da tela
  // Globo terrestre + aviao animado na rota
  // ============================================

  var CONFIG = {
    styleId: 'azul-copa-2026-animation-styles',
    containerId: 'azul-copa-2026-container',
    dataApplied: 'data-azul-copa-animation-applied'
  };

  // Verifica se ja foi aplicado
  if (document.getElementById(CONFIG.styleId)) {
    console.log('[Azul Copa 2026] Animacao ja aplicada, ignorando.');
    return;
  }

  // Injeta os estilos CSS
  function injectStyles() {
    var style = document.createElement('style');
    style.id = CONFIG.styleId;
    style.textContent = [
      '/* Container principal - canto esquerdo */',
      '#' + CONFIG.containerId + ' {',
      '  position: fixed;',
      '  bottom: 20px;',
      '  left: 20px;',
      '  width: 320px;',
      '  background: #fff;',
      '  border-radius: 16px;',
      '  z-index: 9999;',
      '  overflow: hidden;',
      '  font-family: Arial, Helvetica, sans-serif;',
      '  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);',
      '  animation: slideIn 0.4s ease-out;',
      '}',
      '',
      '/* Area do globo */',
      '.azul-copa-globo-area {',
      '  position: relative;',
      '  width: 100%;',
      '  height: 180px;',
      '  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  overflow: hidden;',
      '}',
      '',
      '/* Estrelas de fundo */',
      '.azul-copa-stars {',
      '  position: absolute;',
      '  width: 100%;',
      '  height: 100%;',
      '  background-image: radial-gradient(2px 2px at 20px 30px, white, transparent),',
      '                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),',
      '                    radial-gradient(1px 1px at 90px 40px, white, transparent),',
      '                    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),',
      '                    radial-gradient(1px 1px at 160px 20px, white, transparent),',
      '                    radial-gradient(2px 2px at 200px 60px, rgba(255,255,255,0.7), transparent),',
      '                    radial-gradient(1px 1px at 250px 90px, white, transparent),',
      '                    radial-gradient(2px 2px at 280px 30px, rgba(255,255,255,0.5), transparent),',
      '                    radial-gradient(1px 1px at 300px 70px, white, transparent);',
      '  background-size: 320px 180px;',
      '}',
      '',
      '/* Globo SVG container */',
      '.azul-copa-globo-svg {',
      '  width: 150px;',
      '  height: 150px;',
      '  position: relative;',
      '}',
      '',
      '/* Aviao voando */',
      '.azul-copa-aviao {',
      '  position: absolute;',
      '  width: 28px;',
      '  height: 28px;',
      '  left: 85px;',
      '  top: 15px;',
      '  offset-path: path("M 65 100 Q 45 60 70 45 Q 95 30 85 42");',
      '  offset-rotate: auto -90deg;',
      '  animation: voo-globo 4s ease-in-out infinite;',
      '  z-index: 10;',
      '  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));',
      '}',
      '',
      '/* Area inferior - texto e CTA */',
      '.azul-copa-info {',
      '  padding: 15px;',
      '  background: #fff;',
      '}',
      '',
      '.azul-copa-faixa {',
      '  background: linear-gradient(135deg, #0066cc 0%, #004494 100%);',
      '  padding: 10px 12px;',
      '  border-radius: 8px;',
      '  margin-bottom: 12px;',
      '}',
      '',
      '.azul-copa-faixa-texto {',
      '  color: #fff;',
      '  font-size: 12px;',
      '  font-weight: bold;',
      '  text-align: center;',
      '  line-height: 1.4;',
      '}',
      '',
      '.azul-copa-cta {',
      '  display: block;',
      '  width: 100%;',
      '  padding: 12px;',
      '  background: linear-gradient(135deg, #009c3b 0%, #007a2e 100%);',
      '  color: #fff;',
      '  font-size: 13px;',
      '  font-weight: bold;',
      '  text-align: center;',
      '  text-decoration: none;',
      '  border: none;',
      '  border-radius: 8px;',
      '  cursor: pointer;',
      '  transition: transform 0.2s, box-shadow 0.2s;',
      '}',
      '',
      '.azul-copa-cta:hover {',
      '  transform: scale(1.02);',
      '  box-shadow: 0 4px 15px rgba(0, 156, 59, 0.3);',
      '}',
      '',
      '/* Botao fechar */',
      '.azul-copa-fechar {',
      '  position: absolute;',
      '  top: 8px;',
      '  right: 8px;',
      '  width: 26px;',
      '  height: 26px;',
      '  background: rgba(255, 255, 255, 0.15);',
      '  border: none;',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  transition: background 0.2s;',
      '  z-index: 20;',
      '}',
      '',
      '.azul-copa-fechar:hover {',
      '  background: rgba(255, 255, 255, 0.25);',
      '}',
      '',
      '.azul-copa-fechar::before,',
      '.azul-copa-fechar::after {',
      '  content: "";',
      '  position: absolute;',
      '  width: 12px;',
      '  height: 2px;',
      '  background: #fff;',
      '}',
      '',
      '.azul-copa-fechar::before { transform: rotate(45deg); }',
      '.azul-copa-fechar::after { transform: rotate(-45deg); }',
      '',
      '/* Logo Azul */',
      '.azul-copa-logo {',
      '  position: absolute;',
      '  top: 10px;',
      '  left: 12px;',
      '  color: #fff;',
      '  font-size: 16px;',
      '  font-weight: bold;',
      '  letter-spacing: 1px;',
      '  z-index: 15;',
      '}',
      '',
      '/* Labels dos paises */',
      '.azul-copa-label-bra {',
      '  position: absolute;',
      '  bottom: 20px;',
      '  left: 70px;',
      '  color: #4ade80;',
      '  font-size: 10px;',
      '  font-weight: bold;',
      '}',
      '',
      '.azul-copa-label-eua {',
      '  position: absolute;',
      '  top: 35px;',
      '  right: 55px;',
      '  color: #93c5fd;',
      '  font-size: 10px;',
      '  font-weight: bold;',
      '}',
      '',
      '/* Animacao do voo no globo */',
      '@keyframes voo-globo {',
      '  0% {',
      '    offset-distance: 0%;',
      '    opacity: 1;',
      '  }',
      '  85% {',
      '    offset-distance: 100%;',
      '    opacity: 1;',
      '  }',
      '  92% {',
      '    offset-distance: 100%;',
      '    opacity: 0;',
      '  }',
      '  93% {',
      '    offset-distance: 0%;',
      '    opacity: 0;',
      '  }',
      '  100% {',
      '    offset-distance: 0%;',
      '    opacity: 1;',
      '  }',
      '}',
      '',
      '/* Animacao de entrada */',
      '@keyframes slideIn {',
      '  from {',
      '    transform: translateX(-100%);',
      '    opacity: 0;',
      '  }',
      '  to {',
      '    transform: translateX(0);',
      '    opacity: 1;',
      '  }',
      '}',
      '',
      '/* Responsivo */',
      '@media (max-width: 400px) {',
      '  #' + CONFIG.containerId + ' {',
      '    width: 290px;',
      '    left: 10px;',
      '    bottom: 10px;',
      '  }',
      '  .azul-copa-globo-area {',
      '    height: 160px;',
      '  }',
      '  .azul-copa-globo-svg {',
      '    width: 130px;',
      '    height: 130px;',
      '  }',
      '  .azul-copa-faixa-texto {',
      '    font-size: 11px;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
    console.log('[Azul Copa 2026] Estilos injetados.');
  }

  // SVG do Globo Terrestre
  function getGloboSVG() {
    return [
      '<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">',
      '  <!-- Oceano (fundo do globo) -->',
      '  <defs>',
      '    <radialGradient id="oceanGrad" cx="30%" cy="30%">',
      '      <stop offset="0%" style="stop-color:#4fc3f7"/>',
      '      <stop offset="100%" style="stop-color:#0277bd"/>',
      '    </radialGradient>',
      '    <clipPath id="globeClip">',
      '      <circle cx="75" cy="75" r="70"/>',
      '    </clipPath>',
      '  </defs>',
      '  ',
      '  <!-- Globo base -->',
      '  <circle cx="75" cy="75" r="70" fill="url(#oceanGrad)"/>',
      '  ',
      '  <!-- Continentes (simplificados) -->',
      '  <g clip-path="url(#globeClip)">',
      '    <!-- America do Norte -->',
      '    <path d="M 55 25 Q 75 20 95 30 Q 105 40 100 55 Q 90 60 80 55 Q 70 50 60 55 Q 50 50 55 35 Z" fill="#4caf50"/>',
      '    <!-- America Central -->',
      '    <path d="M 60 58 Q 65 62 62 70 Q 58 75 55 72 Q 52 68 55 62 Z" fill="#4caf50"/>',
      '    <!-- America do Sul (Brasil destacado) -->',
      '    <path d="M 55 75 Q 70 72 80 80 Q 85 95 75 115 Q 60 125 50 110 Q 45 95 50 80 Z" fill="#4caf50"/>',
      '    <!-- Brasil (verde mais claro) -->',
      '    <path d="M 58 82 Q 72 78 78 88 Q 80 100 70 108 Q 58 112 55 100 Q 52 90 58 82 Z" fill="#66bb6a"/>',
      '    <!-- EUA (destacado) -->',
      '    <path d="M 60 32 Q 75 28 90 35 Q 95 42 90 50 Q 80 52 70 48 Q 62 45 60 38 Z" fill="#81c784"/>',
      '  </g>',
      '  ',
      '  <!-- Linhas do globo (latitude/longitude) -->',
      '  <ellipse cx="75" cy="75" rx="70" ry="25" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>',
      '  <ellipse cx="75" cy="75" rx="70" ry="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>',
      '  <line x1="75" y1="5" x2="75" y2="145" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>',
      '  <ellipse cx="75" cy="75" rx="25" ry="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>',
      '  ',
      '  <!-- Rota do voo (arco) -->',
      '  <path d="M 65 100 Q 45 60 70 45 Q 95 30 85 42" fill="none" stroke="#ffd700" stroke-width="2" stroke-dasharray="4 3" opacity="0.8"/>',
      '  ',
      '  <!-- Ponto Brasil -->',
      '  <circle cx="65" cy="98" r="4" fill="#009c3b" stroke="#fff" stroke-width="1.5"/>',
      '  ',
      '  <!-- Ponto EUA -->',
      '  <circle cx="82" cy="42" r="4" fill="#3c3b6e" stroke="#fff" stroke-width="1.5"/>',
      '  ',
      '  <!-- Brilho do globo -->',
      '  <ellipse cx="50" cy="45" rx="25" ry="20" fill="rgba(255,255,255,0.1)"/>',
      '</svg>'
    ].join('');
  }

  // SVG do Aviao (icone de aviao comercial)
  function getAviaoSVG() {
    return [
      '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">',
      '  <!-- Aviao comercial - vista de cima -->',
      '  <g fill="#0066cc">',
      '    <!-- Fuselagem -->',
      '    <ellipse cx="16" cy="16" rx="3" ry="12" fill="#0066cc"/>',
      '    <!-- Nariz -->',
      '    <path d="M 14 4 Q 16 1 18 4 L 18 8 L 14 8 Z" fill="#004494"/>',
      '    <!-- Asas -->',
      '    <path d="M 4 14 L 13 15 L 13 17 L 4 20 Z" fill="#0077e6"/>',
      '    <path d="M 28 14 L 19 15 L 19 17 L 28 20 Z" fill="#0077e6"/>',
      '    <!-- Cauda -->',
      '    <path d="M 10 26 L 14 24 L 14 28 L 16 30 L 18 28 L 18 24 L 22 26 L 22 28 L 16 32 L 10 28 Z" fill="#004494"/>',
      '    <!-- Janelas -->',
      '    <circle cx="16" cy="10" r="1" fill="#fff"/>',
      '    <circle cx="16" cy="13" r="0.8" fill="#b3e5fc"/>',
      '    <circle cx="16" cy="15.5" r="0.8" fill="#b3e5fc"/>',
      '    <circle cx="16" cy="18" r="0.8" fill="#b3e5fc"/>',
      '    <!-- Motores -->',
      '    <ellipse cx="7" cy="17" rx="1.5" ry="2" fill="#333"/>',
      '    <ellipse cx="25" cy="17" rx="1.5" ry="2" fill="#333"/>',
      '  </g>',
      '</svg>'
    ].join('');
  }

  // Cria o HTML da animacao
  function criarAnimacao() {
    var container = document.createElement('div');
    container.id = CONFIG.containerId;
    container.setAttribute(CONFIG.dataApplied, 'true');

    // Area do globo
    var globoArea = document.createElement('div');
    globoArea.className = 'azul-copa-globo-area';

    // Estrelas de fundo
    var stars = document.createElement('div');
    stars.className = 'azul-copa-stars';
    globoArea.appendChild(stars);

    // Logo Azul
    var logo = document.createElement('div');
    logo.className = 'azul-copa-logo';
    logo.textContent = 'AZUL';
    globoArea.appendChild(logo);

    // Botao fechar
    var btnFechar = document.createElement('button');
    btnFechar.className = 'azul-copa-fechar';
    btnFechar.setAttribute('aria-label', 'Fechar');
    btnFechar.addEventListener('click', function () {
      fecharAnimacao();
    });
    globoArea.appendChild(btnFechar);

    // Globo SVG
    var globoSvg = document.createElement('div');
    globoSvg.className = 'azul-copa-globo-svg';
    globoSvg.innerHTML = getGloboSVG();
    globoArea.appendChild(globoSvg);

    // Labels
    var labelBra = document.createElement('div');
    labelBra.className = 'azul-copa-label-bra';
    labelBra.textContent = 'Brasil';
    globoArea.appendChild(labelBra);

    var labelEua = document.createElement('div');
    labelEua.className = 'azul-copa-label-eua';
    labelEua.textContent = 'EUA';
    globoArea.appendChild(labelEua);

    // Aviao animado
    var aviao = document.createElement('div');
    aviao.className = 'azul-copa-aviao';
    aviao.innerHTML = getAviaoSVG();
    globoArea.appendChild(aviao);

    container.appendChild(globoArea);

    // Area de informacoes
    var info = document.createElement('div');
    info.className = 'azul-copa-info';

    // Faixa com mensagem
    var faixa = document.createElement('div');
    faixa.className = 'azul-copa-faixa';
    var faixaTexto = document.createElement('div');
    faixaTexto.className = 'azul-copa-faixa-texto';
    faixaTexto.textContent = 'Azul te leva para assistir a Selecao na Copa do Mundo 2026!';
    faixa.appendChild(faixaTexto);
    info.appendChild(faixa);

    // CTA
    var cta = document.createElement('button');
    cta.className = 'azul-copa-cta';
    cta.textContent = 'GARANTA SUA PASSAGEM';
    cta.addEventListener('click', function () {
      trackClick('CTA_GarantaPassagem');
      console.log('[Azul Copa 2026] CTA clicado');
    });
    info.appendChild(cta);

    container.appendChild(info);
    document.body.appendChild(container);
    console.log('[Azul Copa 2026] Animacao criada com sucesso.');
  }

  // Fecha a animacao
  function fecharAnimacao() {
    var container = document.getElementById(CONFIG.containerId);
    if (container) {
      container.style.transform = 'translateX(-100%)';
      container.style.opacity = '0';
      container.style.transition = 'all 0.3s ease';
      setTimeout(function () {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        console.log('[Azul Copa 2026] Animacao fechada.');
      }, 300);
    }
    trackClick('Fechar_Animacao');
  }

  // Tracking Adobe Analytics
  function trackClick(eventLabel) {
    if (!eventLabel) return;
    var labelEvent = 'AT_CopaDoMundo2026_click ' + eventLabel;
    console.log('[Azul Copa 2026] Analytics event:', labelEvent);
    
    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_copa_do_mundo_2026';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Inicializacao
  function init() {
    injectStyles();
    criarAnimacao();
    console.log('[Azul Copa 2026] Inicializacao completa.');
  }

  // Aguarda o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
