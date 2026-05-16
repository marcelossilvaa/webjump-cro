(function () {
  'use strict';

  // Variaveis de controle
  var STYLE_ID = 'inject-relayout-tickets-style';
  var DATA_ATTR_PROCESSED = 'data-relayout-tickets-processed';
  var MAX_RETRIES = 50;
  var retryCount = 0;
  var isProcessing = false;
  var debounceTimer = null;

  // Seletores do componente de ingressos
  var TICKET_LIST_WRAPPER = '.styles__TicketListWrapper-sc-3d0oj4-1';
  var TICKETS_GROUP_WRAPPER = '.styles__TicketsGroupWrapper-sc-1b94ugj-0';
  var TICKET_GROUP_TITLE = '.styles__TitleGroup-sc-1b94ugj-4';
  var CONTAINER_CARD = '.styles__ContainerCard-sc-1b94ugj-2';
  var TICKET_WRAPPER = '.styles__TicketWrapper-sc-rusdyw-1';
  var TICKET_IMAGE = '.styles__ImageTicketList-sc-rusdyw-2';
  var TICKET_NAME = '.styles__TicketName-sc-rusdyw-7';
  var TICKET_PRICE = '.styles__Price-sc-rusdyw-11';
  var TICKET_INSTALLMENTS = '.styles__InstallmentsText-sc-rusdyw-12';
  var TICKET_POINTS = '.styles__Points-sc-1biltpa-1';
  var BTN_SHOW_MORE = '.styles__ButtonShowMoreOptionsContainer-sc-1b94ugj-3';
  var FIND_TICKETS_WRAPPER = '.styles__FindTicketsWrapper-sc-3d0oj4-4';

  // Funcao para injetar estilos
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Ocultar lista original ao processar
      '.inject-tickets-original--hidden {',
      '  position: absolute !important;',
      '  width: 1px !important;',
      '  height: 1px !important;',
      '  overflow: hidden !important;',
      '  clip: rect(0, 0, 0, 0) !important;',
      '  white-space: nowrap !important;',
      '  border: 0 !important;',
      '  padding: 0 !important;',
      '  margin: -1px !important;',
      '}',

      // Wrapper geral do relayout
      '.inject-tickets-relayout {',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '  max-width: 1200px;',
      '  margin: 0 auto;',
      '  padding: 0 16px;',
      '}',

      // Grupo de ingressos
      '.inject-tickets-group {',
      '  margin-bottom: 40px;',
      '}',

      '.inject-tickets-group__header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 16px;',
      '}',

      '.inject-tickets-group__title {',
      '  font-size: 22px;',
      '  font-weight: 700;',
      '  color: #222;',
      '  margin: 0;',
      '}',

      '.inject-tickets-group__see-more {',
      '  font-size: 14px;',
      '  color: #014E84;',
      '  text-decoration: none;',
      '  cursor: pointer;',
      '  background: none;',
      '  border: none;',
      '  font-weight: 500;',
      '  padding: 0;',
      '}',

      '.inject-tickets-group__see-more:hover {',
      '  text-decoration: underline;',
      '}',

      // Carousel horizontal
      '.inject-tickets-carousel {',
      '  display: flex;',
      '  gap: 16px;',
      '  overflow-x: auto;',
      '  scroll-behavior: smooth;',
      '  -webkit-overflow-scrolling: touch;',
      '  scrollbar-width: none;',
      '  padding-bottom: 8px;',
      '}',

      '.inject-tickets-carousel::-webkit-scrollbar {',
      '  display: none;',
      '}',

      // Card individual - estilo Airbnb
      '.inject-ticket-card {',
      '  flex: 0 0 220px;',
      '  cursor: pointer;',
      '  text-decoration: none;',
      '  color: inherit;',
      '  transition: transform 0.2s ease;',
      '}',

      '.inject-ticket-card:hover {',
      '  transform: translateY(-2px);',
      '}',

      // Imagem do card - formato quadrado/retangular com bordas arredondadas
      '.inject-ticket-card__image-wrap {',
      '  position: relative;',
      '  width: 100%;',
      '  aspect-ratio: 1 / 1;',
      '  border-radius: 12px;',
      '  overflow: hidden;',
      '  margin-bottom: 10px;',
      '}',

      '.inject-ticket-card__image {',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: cover;',
      '  display: block;',
      '}',

      // Badge de pontos sobre a imagem
      '.inject-ticket-card__badge {',
      '  position: absolute;',
      '  top: 8px;',
      '  left: 8px;',
      '  background: #006450;',
      '  color: #fff;',
      '  font-size: 10px;',
      '  font-weight: 600;',
      '  padding: 4px 8px;',
      '  border-radius: 4px;',
      '  line-height: 1;',
      '}',

      // Nome do ingresso
      '.inject-ticket-card__name {',
      '  font-size: 14px;',
      '  font-weight: 500;',
      '  color: #222;',
      '  line-height: 1.35;',
      '  margin: 0 0 4px 0;',
      '  display: -webkit-box;',
      '  -webkit-line-clamp: 2;',
      '  -webkit-box-orient: vertical;',
      '  overflow: hidden;',
      '}',

      // Preco sutil
      '.inject-ticket-card__price {',
      '  font-size: 13px;',
      '  color: #555;',
      '  margin: 0;',
      '}',

      '.inject-ticket-card__price strong {',
      '  font-weight: 600;',
      '  color: #222;',
      '}',

      // Pontos abaixo do preco
      '.inject-ticket-card__points {',
      '  font-size: 11px;',
      '  color: #006450;',
      '  margin-top: 2px;',
      '}',

      // Navegacao do carousel
      '.inject-tickets-carousel-nav {',
      '  position: relative;',
      '}',

      '.inject-tickets-carousel-btn {',
      '  position: absolute;',
      '  top: 50%;',
      '  transform: translateY(-100%);',
      '  width: 32px;',
      '  height: 32px;',
      '  border-radius: 50%;',
      '  background: #fff;',
      '  border: 1px solid #ddd;',
      '  box-shadow: 0 2px 6px rgba(0,0,0,0.1);',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  z-index: 2;',
      '  font-size: 16px;',
      '  color: #333;',
      '  transition: box-shadow 0.2s ease;',
      '}',

      '.inject-tickets-carousel-btn:hover {',
      '  box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      '}',

      '.inject-tickets-carousel-btn--prev {',
      '  left: -12px;',
      '}',

      '.inject-tickets-carousel-btn--next {',
      '  right: -12px;',
      '}',

      '.inject-tickets-carousel-btn--hidden {',
      '  display: none;',
      '}',

      // Contador de resultados
      '.inject-tickets-counter {',
      '  font-size: 14px;',
      '  color: #555;',
      '  margin-bottom: 24px;',
      '}',

      // Responsivo
      '@media (max-width: 768px) {',
      '  .inject-ticket-card {',
      '    flex: 0 0 170px;',
      '  }',
      '  .inject-tickets-group__title {',
      '    font-size: 18px;',
      '  }',
      '  .inject-tickets-carousel-btn {',
      '    display: none;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    console.log('[AT Relayout Ingressos] Estilos injetados');
  }

  // Extrai dados de um ticket card original
  function extractTicketData(ticketEl) {
    var data = {};

    var imgEl = ticketEl.querySelector(TICKET_IMAGE);
    data.imageSrc = imgEl ? imgEl.getAttribute('src') : '';

    var nameEl = ticketEl.querySelector(TICKET_NAME);
    data.name = nameEl ? nameEl.textContent.trim() : '';

    var priceEl = ticketEl.querySelector(TICKET_PRICE);
    data.priceHtml = priceEl ? priceEl.innerHTML : '';

    var installEl = ticketEl.querySelector(TICKET_INSTALLMENTS);
    data.installments = installEl ? installEl.textContent.trim() : '';

    var pointsEl = ticketEl.querySelector(TICKET_POINTS);
    if (pointsEl) {
      var pointsSpan = pointsEl.querySelector('span');
      data.pointsHtml = pointsSpan ? pointsSpan.innerHTML : '';
    } else {
      data.pointsHtml = '';
    }

    // Extrair ID para manter o click navegavel
    data.ticketId = ticketEl.getAttribute('id') || '';

    // Guardar referencia ao elemento original para click
    data.originalElement = ticketEl;

    return data;
  }

  // Cria um card no formato Airbnb
  function createTicketCard(data) {
    var card = document.createElement('div');
    card.className = 'inject-ticket-card';

    // Extrair pontos para badge
    var badgeHtml = '';
    if (data.pointsHtml) {
      badgeHtml = '<div class="inject-ticket-card__badge">' + data.pointsHtml + '</div>';
    }

    card.innerHTML = '<div class="inject-ticket-card__image-wrap">' +
      '<img class="inject-ticket-card__image" src="' + data.imageSrc + '" alt="" loading="lazy">' +
      badgeHtml +
      '</div>' +
      '<p class="inject-ticket-card__name">' + data.name + '</p>' +
      '<p class="inject-ticket-card__price">A partir de <strong>' + data.priceHtml + '</strong></p>' +
      '<p class="inject-ticket-card__points">' + data.installments + '</p>';

    // Click no card aciona o original
    card.addEventListener('click', function () {
      if (data.originalElement) {
        var clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        data.originalElement.dispatchEvent(clickEvent);
      }
    });

    return card;
  }

  // Cria os botoes de navegacao do carousel
  function createCarouselNav(carouselEl) {
    var navWrapper = document.createElement('div');
    navWrapper.className = 'inject-tickets-carousel-nav';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'inject-tickets-carousel-btn inject-tickets-carousel-btn--prev inject-tickets-carousel-btn--hidden';
    prevBtn.innerHTML = '&#8249;';
    prevBtn.setAttribute('aria-label', 'Anterior');

    var nextBtn = document.createElement('button');
    nextBtn.className = 'inject-tickets-carousel-btn inject-tickets-carousel-btn--next';
    nextBtn.innerHTML = '&#8250;';
    nextBtn.setAttribute('aria-label', 'Proximo');

    var scrollAmount = 240;

    prevBtn.addEventListener('click', function () {
      carouselEl.scrollLeft -= scrollAmount;
    });

    nextBtn.addEventListener('click', function () {
      carouselEl.scrollLeft += scrollAmount;
    });

    // Atualizar visibilidade dos botoes ao scroll
    carouselEl.addEventListener('scroll', function () {
      var maxScroll = carouselEl.scrollWidth - carouselEl.clientWidth;
      if (carouselEl.scrollLeft <= 10) {
        prevBtn.classList.add('inject-tickets-carousel-btn--hidden');
      } else {
        prevBtn.classList.remove('inject-tickets-carousel-btn--hidden');
      }
      if (carouselEl.scrollLeft >= maxScroll - 10) {
        nextBtn.classList.add('inject-tickets-carousel-btn--hidden');
      } else {
        nextBtn.classList.remove('inject-tickets-carousel-btn--hidden');
      }
    });

    navWrapper.appendChild(prevBtn);
    navWrapper.appendChild(carouselEl);
    navWrapper.appendChild(nextBtn);

    return navWrapper;
  }

  // Processa um grupo de ingressos
  function processGroup(groupEl) {
    var data = {
      title: '',
      tickets: [],
      showMoreBtn: null
    };

    var titleEl = groupEl.querySelector(TICKET_GROUP_TITLE);
    data.title = titleEl ? titleEl.textContent.trim() : '';

    var ticketEls = groupEl.querySelectorAll(TICKET_WRAPPER);
    for (var i = 0; i < ticketEls.length; i++) {
      data.tickets.push(extractTicketData(ticketEls[i]));
    }

    var showMoreEl = groupEl.querySelector(BTN_SHOW_MORE + ' button');
    data.showMoreBtn = showMoreEl;

    return data;
  }

  // Cria o grupo reestruturado
  function createNewGroup(groupData) {
    var group = document.createElement('div');
    group.className = 'inject-tickets-group';

    // Header com titulo e link "ver mais"
    var header = document.createElement('div');
    header.className = 'inject-tickets-group__header';

    var title = document.createElement('h2');
    title.className = 'inject-tickets-group__title';
    title.textContent = groupData.title;
    header.appendChild(title);

    if (groupData.showMoreBtn) {
      var seeMore = document.createElement('button');
      seeMore.className = 'inject-tickets-group__see-more';
      seeMore.textContent = 'Ver mais opcoes';
      seeMore.addEventListener('click', function () {
        var clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        groupData.showMoreBtn.dispatchEvent(clickEvent);
      });
      header.appendChild(seeMore);
    }

    group.appendChild(header);

    // Carousel de cards
    var carousel = document.createElement('div');
    carousel.className = 'inject-tickets-carousel';

    for (var i = 0; i < groupData.tickets.length; i++) {
      var card = createTicketCard(groupData.tickets[i]);
      carousel.appendChild(card);
    }

    // Envolver carousel com navegacao
    var navWrapper = createCarouselNav(carousel);
    group.appendChild(navWrapper);

    return group;
  }

  // Funcao principal de relayout
  function applyRelayout() {
    if (isProcessing) return;
    isProcessing = true;

    var ticketList = document.querySelector(TICKET_LIST_WRAPPER);
    if (!ticketList || ticketList.getAttribute(DATA_ATTR_PROCESSED)) {
      isProcessing = false;
      return;
    }

    var groups = ticketList.querySelectorAll(TICKETS_GROUP_WRAPPER);
    if (!groups || groups.length === 0) {
      isProcessing = false;
      return;
    }

    // Criar container do relayout
    var relayoutContainer = document.createElement('div');
    relayoutContainer.className = 'inject-tickets-relayout';

    // Contador de resultados
    var findWrapper = ticketList.querySelector(FIND_TICKETS_WRAPPER);
    if (findWrapper) {
      var counter = document.createElement('p');
      counter.className = 'inject-tickets-counter';
      counter.textContent = findWrapper.textContent.trim();
      relayoutContainer.appendChild(counter);
    }

    // Processar cada grupo
    for (var i = 0; i < groups.length; i++) {
      var groupData = processGroup(groups[i]);
      if (groupData.tickets.length > 0) {
        var newGroup = createNewGroup(groupData);
        relayoutContainer.appendChild(newGroup);
      }
    }

    // Ocultar lista original e inserir novo layout
    ticketList.classList.add('inject-tickets-original--hidden');
    ticketList.parentNode.insertBefore(relayoutContainer, ticketList.nextSibling);
    ticketList.setAttribute(DATA_ATTR_PROCESSED, 'true');

    console.log('[AT Relayout Ingressos] Relayout aplicado com ' + groups.length + ' grupos');
    isProcessing = false;
  }

  // Observer para carregamento dinamico
  function initObserver() {
    var ticketList = document.querySelector(TICKET_LIST_WRAPPER);
    if (!ticketList) return;

    var parentEl = ticketList.parentNode;
    if (!parentEl) return;

    var observer = new MutationObserver(function () {
      if (isProcessing) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        // Se o relayout ainda nao foi aplicado, tentar novamente
        if (!ticketList.getAttribute(DATA_ATTR_PROCESSED)) {
          applyRelayout();
        }
      }, 300);
    });

    observer.observe(parentEl, {
      childList: true,
      subtree: true
    });
  }

  // Verifica se conteudo esta pronto
  function checkIfContentIsRendered() {
    var ticketList = document.querySelector(TICKET_LIST_WRAPPER);
    if (!ticketList) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT Relayout Ingressos] Limite de tentativas atingido');
        return;
      }
      requestAnimationFrame(checkIfContentIsRendered);
      return;
    }

    var tickets = ticketList.querySelectorAll(TICKET_WRAPPER);
    if (!tickets || tickets.length === 0) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT Relayout Ingressos] Nenhum ingresso encontrado');
        return;
      }
      requestAnimationFrame(checkIfContentIsRendered);
      return;
    }

    injectStyles();
    applyRelayout();
    initObserver();
    console.log('[AT Relayout Ingressos] Inicializado com sucesso');
  }

  // Inicializacao
  function init() {
    var isTicketsPage = window.location.pathname.indexOf('/tickets') !== -1 ||
                        window.location.pathname.indexOf('/ingressos') !== -1 ||
                        window.location.pathname.indexOf('/attractions') !== -1;
    if (!isTicketsPage) {
      console.log('[AT Relayout Ingressos] Pagina nao e de ingressos, script ignorado');
      return;
    }

    checkIfContentIsRendered();
  }

  // Bootstrap
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
