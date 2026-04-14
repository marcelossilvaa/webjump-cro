// ============================================
// BOTAO FLUTUANTE MICKEY - DISNEY HOTEIS
// ============================================
// Frame 15058: botao circular no lado direito (right: 21px, bottom: 80px)
// Clique leva para a pagina de hotel
//
(function () {
  'use strict';

  const STYLE_ID = 'disney-side-modal-styles';
  const ROOT_ID = 'disney-side-modal-root';
  const MICKEY_ID = 'disney-frame-15058';
  const REDIRECT_URL = 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JPD036691&stdi=01/07/2026&stdo=31/07/2026&r[0].adt=2&r[0].chd=0#hotelList';

  function goToHotel() {
    window.location.href = REDIRECT_URL;
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      // Root - overlay transparente de largura total, sem bloquear eventos do usuario
      '#' + ROOT_ID + ' {' +
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'right: 0;' +
      'bottom: 0;' +
      'pointer-events: none;' +
      'z-index: 9990;' +
      '}' +

      // Frame 15058 (CSS Figma - botao circular lado direito)
      '#' + MICKEY_ID + ' {' +
      'position: absolute;' +
      'width: 60px;' +
      'height: 60px;' +
      'right: 21px;' +
      'bottom: 100px;' +
      'padding: 0;' +
      'border: none;' +
      'background: transparent;' +
      'cursor: pointer;' +
      'pointer-events: auto;' +
      '}' +
      '#' + MICKEY_ID + ' .group-12102 {' +
      'position: absolute;' +
      'width: 60px;' +
      'height: 60px;' +
      'left: 0px;' +
      'top: 0px;' +
      '}' +
      '#' + MICKEY_ID + ' .intersect {' +
      'position: absolute;' +
      'width: 60px;' +
      'height: 60px;' +
      'left: 0px;' +
      'top: 0px;' +
      'background: linear-gradient(180deg, #001322 0%, #022C69 100%);' +
      'border-radius: 50%;' +
      '}' +
      '#' + MICKEY_ID + ' .ellipse-7 {' +
      'position: absolute;' +
      'width: 60px;' +
      'height: 60px;' +
      'left: 0px;' +
      'top: 0px;' +
      'background: linear-gradient(180deg, #001322 0%, #022C69 100%);' +
      'border-radius: 50%;' +
      '}' +
      '#' + MICKEY_ID + ' .rectangle-4 {' +
      'position: absolute;' +
      'height: 46px;' +
      'left: 3.33%;' +
      'right: 0%;' +
      'top: calc(50% - 46px/2 - 6px);' +
      'background: radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%);' +
      'mix-blend-mode: screen;' +
      'border-radius: 23px;' +
      'transform: rotate(90deg);' +
      '}' +
      '#' + MICKEY_ID + ' .mickey-symbol {' +
      'position: absolute;' +
      'width: 48px;' +
      'height: 38px;' +
      'left: 6px;' +
      'top: 11px;' +
      '}';

    document.head.appendChild(style);
  }

  function createMickeySymbol() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 48 38');
    svg.setAttribute('class', 'mickey-symbol');
    svg.setAttribute('aria-hidden', 'true');

    const earLeft = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    earLeft.setAttribute('cx', '10');
    earLeft.setAttribute('cy', '10');
    earLeft.setAttribute('r', '9');
    earLeft.setAttribute('fill', '#FFFFFF');

    const earRight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    earRight.setAttribute('cx', '38');
    earRight.setAttribute('cy', '10');
    earRight.setAttribute('r', '9');
    earRight.setAttribute('fill', '#FFFFFF');

    const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', '24');
    head.setAttribute('cy', '27');
    head.setAttribute('r', '16');
    head.setAttribute('fill', '#FFFFFF');

    svg.appendChild(earLeft);
    svg.appendChild(earRight);
    svg.appendChild(head);

    return svg;
  }

  function createWidget() {
    if (document.getElementById(ROOT_ID)) {
      return;
    }

    const root = document.createElement('div');
    root.id = ROOT_ID;

    const mickeyBtn = document.createElement('button');
    mickeyBtn.id = MICKEY_ID;
    mickeyBtn.type = 'button';
    mickeyBtn.setAttribute('aria-label', 'Abrir hoteis Disney');

    const group = document.createElement('div');
    group.className = 'group-12102';

    const intersect = document.createElement('div');
    intersect.className = 'intersect';
    group.appendChild(intersect);

    const ellipse = document.createElement('div');
    ellipse.className = 'ellipse-7';
    group.appendChild(ellipse);

    const shine = document.createElement('div');
    shine.className = 'rectangle-4';
    group.appendChild(shine);

    group.appendChild(createMickeySymbol());
    mickeyBtn.appendChild(group);

    mickeyBtn.addEventListener('click', goToHotel);

    root.appendChild(mickeyBtn);
    document.body.appendChild(root);
  }

  function positionMickeyBtn() {
    const btn = document.getElementById(MICKEY_ID);
    const ref = document.getElementById('bot_icon_right');
    if (!btn || !ref) return false;
    const rect = ref.getBoundingClientRect();
    btn.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    return true;
  }

  function tryPosition() {
    let attempts = 0;
    const max = 20;
    const interval = setInterval(function () {
      attempts++;
      if (positionMickeyBtn() || attempts >= max) {
        clearInterval(interval);
      }
    }, 300);
  }

  function init() {
    addStyles();
    createWidget();
    if (!positionMickeyBtn()) {
      tryPosition();
    }
    window.addEventListener('resize', positionMickeyBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
