// ============================================
// CHECKLIST DA MAGIA - HOME AZUL
// ============================================
// Elemento visual de checklist animado com itens Disney
//
(function () {
  'use strict';

  var STYLE_ID = 'checklist-magia-styles';
  var CHECKLIST_ID = 'checklist-magia';
  var CTA_URL = 'https://www.voeazul.com.br/br/pt/disney/hoteis-disney';

  // Funcao para adicionar estilos
  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' + CHECKLIST_ID + ' {' +
      'position: fixed;' +
      'top: 50%;' +
      'left: 50%;' +
      'transform: translate(-50%, -50%);' +
      'width: 320px;' +
      'background: #00B4E2;' +
      'border-radius: 16px;' +
      'padding: 20px;' +
      'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);' +
      'z-index: 9990;' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'animation: checklist-scale-in 0.5s ease-out;' +
      'box-sizing: border-box;' +
      'overflow: hidden;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-stars {' +
      'position: absolute;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'pointer-events: none;' +
      'overflow: hidden;' +
      'z-index: 0;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-star {' +
      'position: absolute;' +
      'width: 4px;' +
      'height: 4px;' +
      'background: #FFFFFF;' +
      'border-radius: 50%;' +
      'opacity: 0;' +
      'box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8);' +
      'animation: checklist-star-twinkle 2s ease-in-out infinite;' +
      '}' +
      '@keyframes checklist-star-twinkle {' +
      '0%, 100% { opacity: 0; transform: scale(0.5); }' +
      '50% { opacity: 1; transform: scale(1.2); }' +
      '}' +
      '@keyframes checklist-scale-in {' +
      '0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }' +
      '100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }' +
      '}' +
      '@keyframes checklist-scale-out {' +
      '0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }' +
      '100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }' +
      '}' +
      '#' + CHECKLIST_ID + '.closing {' +
      'animation: checklist-scale-out 0.4s ease-in forwards;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-header {' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: space-between;' +
      'margin-bottom: 16px;' +
      'position: relative;' +
      'z-index: 1;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-title {' +
      'font-size: 18px;' +
      'font-weight: 700;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 8px;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-title-icon {' +
      'font-size: 20px;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-close {' +
      'background: rgba(255, 255, 255, 0.2);' +
      'border: none;' +
      'border-radius: 50%;' +
      'width: 28px;' +
      'height: 28px;' +
      'cursor: pointer;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'transition: background 0.2s ease;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-close:hover {' +
      'background: rgba(255, 255, 255, 0.35);' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-items {' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      'position: relative;' +
      'z-index: 1;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item {' +
      'display: flex;' +
      'align-items: flex-start;' +
      'gap: 12px;' +
      'padding: 12px;' +
      'background: rgba(255, 255, 255, 0.15);' +
      'border-radius: 10px;' +
      'transition: background 0.2s ease, transform 0.2s ease;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item.checked {' +
      'background: rgba(255, 255, 255, 0.25);' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item.highlight {' +
      'background: rgba(255, 255, 255, 0.2);' +
      'border: 2px solid #FFFFFF;' +
      'animation: checklist-pulse 2s ease-in-out infinite;' +
      '}' +
      '@keyframes checklist-pulse {' +
      '0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }' +
      '50% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-checkbox {' +
      'width: 24px;' +
      'height: 24px;' +
      'border-radius: 6px;' +
      'border: 2px solid #FFFFFF;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'flex-shrink: 0;' +
      'background: transparent;' +
      'transition: background 0.2s ease;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-checkbox.checked {' +
      'background: #FFFFFF;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-checkbox svg {' +
      'width: 14px;' +
      'height: 14px;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-content {' +
      'flex: 1;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 8px;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-text {' +
      'font-size: 14px;' +
      'font-weight: 500;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      'line-height: 1.4;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item.checked .checklist-text {' +
      'text-decoration: line-through;' +
      'opacity: 0.8;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-cta {' +
      'position: relative;' +
      'background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);' +
      'background-size: 200% 100%;' +
      'color: #1C1C1C;' +
      'border: none;' +
      'border-radius: 20px;' +
      'padding: 10px 20px;' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'font-size: 13px;' +
      'font-weight: 700;' +
      'cursor: pointer;' +
      'transition: transform 0.2s ease, box-shadow 0.2s ease;' +
      'align-self: flex-start;' +
      'animation: checklist-cta-shimmer 2s linear infinite, checklist-cta-glow 1.5s ease-in-out infinite;' +
      'box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);' +
      'overflow: hidden;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-cta::before {' +
      'content: "";' +
      'position: absolute;' +
      'top: 0;' +
      'left: -100%;' +
      'width: 100%;' +
      'height: 100%;' +
      'background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);' +
      'animation: checklist-cta-shine 2s ease-in-out infinite;' +
      '}' +
      '@keyframes checklist-cta-shimmer {' +
      '0% { background-position: 100% 0; }' +
      '100% { background-position: -100% 0; }' +
      '}' +
      '@keyframes checklist-cta-glow {' +
      '0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.4); }' +
      '50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4); }' +
      '}' +
      '@keyframes checklist-cta-shine {' +
      '0% { left: -100%; }' +
      '50%, 100% { left: 100%; }' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-cta:hover {' +
      'transform: scale(1.08);' +
      'box-shadow: 0 0 30px rgba(255, 215, 0, 0.9);' +
      '}' +
      '@keyframes checklist-item-appear {' +
      '0% { opacity: 0; transform: translateX(-20px); }' +
      '100% { opacity: 1; transform: translateX(0); }' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item:nth-child(1) {' +
      'animation: checklist-item-appear 0.4s ease-out 0.2s both;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item:nth-child(2) {' +
      'animation: checklist-item-appear 0.4s ease-out 0.4s both;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-item:nth-child(3) {' +
      'animation: checklist-item-appear 0.4s ease-out 0.6s both;' +
      '}' +
      '@media (max-width: 480px) {' +
      '#' + CHECKLIST_ID + ' {' +
      'width: calc(100% - 32px);' +
      'right: 16px;' +
      'bottom: 16px;' +
      'padding: 16px;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-title {' +
      'font-size: 16px;' +
      '}' +
      '#' + CHECKLIST_ID + ' .checklist-text {' +
      'font-size: 13px;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  // Funcao para criar icone de check
  function createCheckIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20 6L9 17L4 12');
    path.setAttribute('stroke', '#00B4E2');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    svg.appendChild(path);
    return svg;
  }

  // Funcao para criar item do checklist
  function createChecklistItem(text, isChecked, hasCta) {
    var item = document.createElement('div');
    item.className = 'checklist-item';
    if (isChecked) {
      item.className += ' checked';
    }
    if (hasCta) {
      item.className += ' highlight';
    }

    // Checkbox
    var checkbox = document.createElement('div');
    checkbox.className = 'checklist-checkbox';
    if (isChecked) {
      checkbox.className += ' checked';
      checkbox.appendChild(createCheckIcon());
    }
    item.appendChild(checkbox);

    // Conteudo
    var content = document.createElement('div');
    content.className = 'checklist-content';

    var textEl = document.createElement('p');
    textEl.className = 'checklist-text';
    textEl.textContent = text;
    content.appendChild(textEl);

    // CTA se necessario
    if (hasCta) {
      var cta = document.createElement('button');
      cta.className = 'checklist-cta';
      cta.type = 'button';
      cta.textContent = 'Resolver agora';
      cta.addEventListener('click', function () {
        console.log('[ChecklistMagia] CTA clicado - redirecionando');
        window.open(CTA_URL, '_blank');
      });
      content.appendChild(cta);
    }

    item.appendChild(content);
    return item;
  }

  // Funcao para criar o checklist
  function createChecklist() {
    if (document.getElementById(CHECKLIST_ID)) {
      console.log('[ChecklistMagia] Checklist ja existe');
      return;
    }

    var checklist = document.createElement('div');
    checklist.id = CHECKLIST_ID;

    // Container de estrelas
    var starsContainer = document.createElement('div');
    starsContainer.className = 'checklist-stars';
    
    // Criar estrelas aleatorias
    for (var i = 0; i < 15; i++) {
      var star = document.createElement('div');
      star.className = 'checklist-star';
      star.style.left = (Math.random() * 100) + '%';
      star.style.top = (Math.random() * 100) + '%';
      star.style.animationDelay = (Math.random() * 3) + 's';
      star.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      starsContainer.appendChild(star);
    }
    checklist.appendChild(starsContainer);

    // Header
    var header = document.createElement('div');
    header.className = 'checklist-header';

    var title = document.createElement('h3');
    title.className = 'checklist-title';
    
    var titleIcon = document.createElement('span');
    titleIcon.className = 'checklist-title-icon';
    titleIcon.textContent = String.fromCodePoint(10024); // Sparkles
    title.appendChild(titleIcon);
    
    var titleText = document.createTextNode(' Checklist da Magia');
    title.appendChild(titleText);
    header.appendChild(title);

    // Botao fechar
    var closeBtn = document.createElement('button');
    closeBtn.className = 'checklist-close';
    closeBtn.setAttribute('aria-label', 'Fechar checklist');
    closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 1L13 13M13 1L1 13" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
    closeBtn.addEventListener('click', function () {
      closeChecklist();
    });
    header.appendChild(closeBtn);

    checklist.appendChild(header);

    // Items container
    var items = document.createElement('div');
    items.className = 'checklist-items';

    // Item 1 - Passagens (checked)
    items.appendChild(createChecklistItem('Passagens garantidas', true, false));

    // Item 2 - Hospedagem (unchecked com CTA)
    items.appendChild(createChecklistItem('Hospedagem com a magia Disney', false, true));

    // Item 3 - Ingressos (unchecked)
    items.appendChild(createChecklistItem('Ingressos dos parques', false, false));

    checklist.appendChild(items);

    document.body.appendChild(checklist);
    console.log('[ChecklistMagia] Checklist criado com sucesso');
  }

  // Funcao para fechar o checklist
  function closeChecklist() {
    var checklist = document.getElementById(CHECKLIST_ID);
    if (checklist) {
      checklist.classList.add('closing');
      setTimeout(function () {
        checklist.remove();
      }, 400);
      console.log('[ChecklistMagia] Checklist fechado');
    }
  }

  // Funcao de inicializacao
  function init() {
    console.log('[ChecklistMagia] Inicializando checklist...');
    addStyles();
    createChecklist();
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
