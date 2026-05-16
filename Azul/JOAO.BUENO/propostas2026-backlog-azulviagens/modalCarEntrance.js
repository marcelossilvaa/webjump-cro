(function () {
  'use strict';

  // Variaveis de controle
  var STYLE_ID = 'inject-modal-car-entrance-style';
  var MODAL_ID = 'inject-modal-car-entrance';
  var DATA_ATTR_SHOWN = 'data-modal-car-entrance-shown';
  var MAX_RETRIES = 50;
  var retryCount = 0;

  // Seletores
  var CATEGORY_BOX_SELECTOR = '.styles__BoxCategory-sc-14z5tmb-0';
  var CATEGORY_IMAGE_SELECTOR = '.styles__CategoryImage-sc-14z5tmb-1';
  var CATEGORY_LABEL_SELECTOR = '.styles__CategoryLabel-sc-14z5tmb-2';
  var CATEGORY_PRICE_SELECTOR = '.styles__CategoryPrice-sc-14z5tmb-3';
  var RESULTS_WRAPPER_SELECTOR = '.styles__ContentWrapper-sc-fdgbpv-2';
  var LOADING_WRAPPER_SELECTOR = '.styles__LoadingWrapper-sc-fdgbpv-4';

  // Funcao para injetar estilos
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Overlay
      '.inject-modal-car__overlay {',
      '  position: fixed;',
      '  top: 0;',
      '  left: 0;',
      '  width: 100%;',
      '  height: 100%;',
      '  background: rgba(0, 0, 0, 0.6);',
      '  z-index: 99999;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  opacity: 0;',
      '  transition: opacity 0.3s ease;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',

      '.inject-modal-car__overlay--visible {',
      '  opacity: 1;',
      '}',

      // Modal container
      '.inject-modal-car__container {',
      '  background: #fff;',
      '  border-radius: 12px;',
      '  width: 90%;',
      '  max-width: 680px;',
      '  max-height: 90vh;',
      '  overflow: hidden;',
      '  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);',
      '  transform: translateY(20px);',
      '  transition: transform 0.3s ease;',
      '  display: flex;',
      '  flex-direction: column;',
      '}',

      '.inject-modal-car__overlay--visible .inject-modal-car__container {',
      '  transform: translateY(0);',
      '}',

      // Header com gradiente azul
      '.inject-modal-car__header {',
      '  background: linear-gradient(63deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%);',
      '  padding: 24px 28px;',
      '  position: relative;',
      '}',

      '.inject-modal-car__header-title {',
      '  color: #fff;',
      '  font-size: 20px;',
      '  font-weight: 700;',
      '  margin: 0 0 6px 0;',
      '  line-height: 1.3;',
      '}',

      '.inject-modal-car__header-subtitle {',
      '  color: rgba(255, 255, 255, 0.85);',
      '  font-size: 14px;',
      '  font-weight: 400;',
      '  margin: 0;',
      '  line-height: 1.4;',
      '}',

      '.inject-modal-car__close-btn {',
      '  position: absolute;',
      '  top: 16px;',
      '  right: 16px;',
      '  background: none;',
      '  border: none;',
      '  color: #fff;',
      '  font-size: 24px;',
      '  cursor: pointer;',
      '  width: 32px;',
      '  height: 32px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  border-radius: 50%;',
      '  transition: background 0.2s ease;',
      '}',

      '.inject-modal-car__close-btn:hover {',
      '  background: rgba(255, 255, 255, 0.15);',
      '}',

      // Corpo do modal
      '.inject-modal-car__body {',
      '  padding: 24px 28px 28px;',
      '  overflow-y: auto;',
      '}',

      '.inject-modal-car__body-label {',
      '  color: rgb(1, 78, 132);',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  margin: 0 0 16px 0;',
      '}',

      // Grid de categorias
      '.inject-modal-car__categories-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 1fr);',
      '  gap: 12px;',
      '}',

      // Card de categoria
      '.inject-modal-car__category-card {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  padding: 16px 12px;',
      '  border: 1px solid #e0e0e0;',
      '  border-radius: 8px;',
      '  cursor: pointer;',
      '  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;',
      '  background: #fff;',
      '}',

      '.inject-modal-car__category-card:hover {',
      '  border-color: rgb(2, 108, 182);',
      '  background: rgba(2, 108, 182, 0.04);',
      '  box-shadow: 0 2px 8px rgba(2, 108, 182, 0.12);',
      '}',

      '.inject-modal-car__category-card--selected {',
      '  border-color: rgb(2, 108, 182);',
      '  background: rgba(2, 108, 182, 0.08);',
      '  box-shadow: 0 2px 12px rgba(2, 108, 182, 0.18);',
      '}',

      '.inject-modal-car__category-img {',
      '  width: 100px;',
      '  height: 60px;',
      '  object-fit: contain;',
      '  margin-bottom: 8px;',
      '}',

      '.inject-modal-car__category-name {',
      '  color: rgb(1, 78, 132);',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  text-align: center;',
      '  margin: 0 0 4px 0;',
      '  line-height: 1.3;',
      '}',

      '.inject-modal-car__category-price {',
      '  color: #666;',
      '  font-size: 11px;',
      '  text-align: center;',
      '  margin: 0;',
      '}',

      '.inject-modal-car__category-price strong {',
      '  color: rgb(1, 78, 132);',
      '  font-weight: 700;',
      '}',

      // Botao confirmar (outline Azul)
      '.inject-modal-car__confirm-btn {',
      '  display: flex;',
      '  width: 100%;',
      '  height: 48px;',
      '  align-items: center;',
      '  gap: 8px;',
      '  justify-content: center;',
      '  border-radius: 8px;',
      '  border: 1px solid rgb(2, 108, 182);',
      '  background: rgb(255, 255, 255);',
      '  cursor: pointer;',
      '  color: rgb(2, 108, 182);',
      '  font-size: 15px;',
      '  font-weight: 600;',
      '  margin-top: 20px;',
      '  transition: background 0.2s ease;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',

      '.inject-modal-car__confirm-btn:hover {',
      '  background: rgba(2, 108, 182, 0.08);',
      '}',

      '.inject-modal-car__confirm-btn:disabled {',
      '  opacity: 0.5;',
      '  cursor: not-allowed;',
      '}',

      // Link para pular
      '.inject-modal-car__skip-link {',
      '  display: block;',
      '  text-align: center;',
      '  margin-top: 12px;',
      '  color: #888;',
      '  font-size: 13px;',
      '  cursor: pointer;',
      '  text-decoration: underline;',
      '  border: none;',
      '  background: none;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',

      '.inject-modal-car__skip-link:hover {',
      '  color: #555;',
      '}',

      // Responsivo - 2 colunas em mobile
      '@media (max-width: 600px) {',
      '  .inject-modal-car__categories-grid {',
      '    grid-template-columns: repeat(2, 1fr);',
      '  }',
      '  .inject-modal-car__container {',
      '    width: 95%;',
      '  }',
      '  .inject-modal-car__header {',
      '    padding: 20px;',
      '  }',
      '  .inject-modal-car__body {',
      '    padding: 20px;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    console.log('[AT Modal Car Entrance] Estilos injetados');
  }

  // Extrai categorias do carrossel existente na pagina
  function extractCategories() {
    var categories = [];
    var boxes = document.querySelectorAll(CATEGORY_BOX_SELECTOR);

    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var imgEl = box.querySelector(CATEGORY_IMAGE_SELECTOR);
      var labelEl = box.querySelector(CATEGORY_LABEL_SELECTOR);
      var priceEl = box.querySelector(CATEGORY_PRICE_SELECTOR);

      categories.push({
        element: box,
        imageSrc: imgEl ? imgEl.getAttribute('src') : '',
        imageAlt: imgEl ? imgEl.getAttribute('alt') : '',
        label: labelEl ? labelEl.textContent.trim() : '',
        priceHtml: priceEl ? priceEl.innerHTML : ''
      });
    }

    return categories;
  }

  // Cria e exibe o modal
  function createModal(categories) {
    if (document.getElementById(MODAL_ID)) return;

    var overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'inject-modal-car__overlay';

    // Montar cards de categoria
    var cardsHtml = '';
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      cardsHtml += '<div class="inject-modal-car__category-card" data-category-index="' + i + '">' +
        '<img class="inject-modal-car__category-img" src="' + cat.imageSrc + '" alt="' + cat.imageAlt + '">' +
        '<p class="inject-modal-car__category-name">' + cat.label + '</p>' +
        '<p class="inject-modal-car__category-price">' + cat.priceHtml + '</p>' +
        '</div>';
    }

    overlay.innerHTML = '<div class="inject-modal-car__container">' +
      '<div class="inject-modal-car__header">' +
        '<button class="inject-modal-car__close-btn" aria-label="Fechar">&times;</button>' +
        '<h2 class="inject-modal-car__header-title">Qual tipo de carro voce prefere?</h2>' +
        '<p class="inject-modal-car__header-subtitle">Selecione a categoria ideal para sua viagem e veja apenas os carros que combinam com voce.</p>' +
      '</div>' +
      '<div class="inject-modal-car__body">' +
        '<p class="inject-modal-car__body-label">Escolha uma categoria:</p>' +
        '<div class="inject-modal-car__categories-grid">' + cardsHtml + '</div>' +
        '<button class="inject-modal-car__confirm-btn" disabled>Filtrar carros</button>' +
        '<button class="inject-modal-car__skip-link">Ver todos os carros sem filtro</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    // Animar entrada
    requestAnimationFrame(function () {
      overlay.classList.add('inject-modal-car__overlay--visible');
    });

    // Estado de selecao
    var selectedIndex = null;
    var cards = overlay.querySelectorAll('.inject-modal-car__category-card');
    var confirmBtn = overlay.querySelector('.inject-modal-car__confirm-btn');

    // Listener para selecao de categoria
    for (var j = 0; j < cards.length; j++) {
      (function (card, index) {
        card.addEventListener('click', function () {
          // Remover selecao anterior
          for (var k = 0; k < cards.length; k++) {
            cards[k].classList.remove('inject-modal-car__category-card--selected');
          }
          // Selecionar atual
          card.classList.add('inject-modal-car__category-card--selected');
          selectedIndex = index;
          confirmBtn.disabled = false;
        });
      })(cards[j], j);
    }

    // Confirmar filtro
    confirmBtn.addEventListener('click', function () {
      if (selectedIndex === null) return;
      applyFilter(categories[selectedIndex]);
      closeModal(overlay);
    });

    // Pular
    var skipLink = overlay.querySelector('.inject-modal-car__skip-link');
    skipLink.addEventListener('click', function () {
      closeModal(overlay);
    });

    // Fechar no botao X
    var closeBtn = overlay.querySelector('.inject-modal-car__close-btn');
    closeBtn.addEventListener('click', function () {
      closeModal(overlay);
    });

    // Fechar ao clicar no overlay (fora do modal)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function handleEsc(e) {
      if (e.key === 'Escape') {
        closeModal(overlay);
        document.removeEventListener('keydown', handleEsc);
      }
    });

    console.log('[AT Modal Car Entrance] Modal exibido com ' + categories.length + ' categorias');
  }

  // Fecha o modal com animacao
  function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('inject-modal-car__overlay--visible');
    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }

  // Aplica o filtro clicando no elemento de categoria correspondente na pagina
  function applyFilter(category) {
    if (!category || !category.element) return;

    var clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    category.element.dispatchEvent(clickEvent);

    console.log('[AT Modal Car Entrance] Filtro aplicado: ' + category.label);
  }

  // Verifica se conteudo esta pronto e exibe o modal
  function checkContentReady() {
    var loadingWrapper = document.querySelector(LOADING_WRAPPER_SELECTOR);

    if (loadingWrapper) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT Modal Car Entrance] Limite de tentativas atingido aguardando loading');
        return;
      }
      setTimeout(checkContentReady, 200);
      return;
    }

    var categoryBoxes = document.querySelectorAll(CATEGORY_BOX_SELECTOR);
    if (!categoryBoxes || categoryBoxes.length === 0) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT Modal Car Entrance] Limite de tentativas atingido aguardando categorias');
        return;
      }
      setTimeout(checkContentReady, 200);
      return;
    }

    // Verificar se modal ja foi exibido nesta sessao de pagina
    if (document.body.getAttribute(DATA_ATTR_SHOWN)) return;
    document.body.setAttribute(DATA_ATTR_SHOWN, 'true');

    // Conteudo pronto - inicializar modal
    injectStyles();
    var categories = extractCategories();
    if (categories.length > 0) {
      createModal(categories);
    }
  }

  // Inicializacao
  function init() {
    var isCarPage = window.location.pathname.indexOf('/cars') !== -1;
    if (!isCarPage) {
      console.log('[AT Modal Car Entrance] Pagina nao e de carros, script ignorado');
      return;
    }

    checkContentReady();
  }

  // Bootstrap
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
