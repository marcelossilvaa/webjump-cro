(function () {
  'use strict';

  // Variaveis de controle
  var STYLE_ID = 'inject-valor-unitario-carros-style';
  var DATA_ATTR_PROCESSED = 'data-unit-price-processed';
  var DATA_ATTR_DETAILS_ADDED = 'data-details-toggle-added';
  var MAX_RETRIES = 50;
  var retryCount = 0;
  var isProcessing = false;
  var debounceTimer = null;

  // Seletores do componente de carro
  var CAR_CONTAINER_SELECTOR = '.styles__Container-sc-ccr6q9-0';
  var CAR_GROUP_WRAPPER_SELECTOR = '.styles__CarsGroupWrapper-sc-nnv2sb-0';
  var CAR_TITLE_SELECTOR = '.styles__TitleCar-sc-ccr6q9-5';
  var CAR_IMAGE_SELECTOR = '.styles__CarImage-sc-ccr6q9-9';
  var CAR_DETAILS_SELECTOR = '.styles__ContainerDetails-sc-ccr6q9-3';
  var CAR_AMENITIES_SELECTOR = '.styles__AmenitiesWrapper-sc-ccr6q9-11';
  var CAR_PRICE_WRAPPER_SELECTOR = '.styles__PriceWrapper-sc-10ygdxz-0';
  var CAR_INFOS_SELECTOR = '.styles__CarInfos-sc-ccr6q9-4';
  var CAR_SUBTITLE_SELECTOR = '.styles__ContainerSubtitle-sc-ccr6q9-6';
  var PRICE_INTEGER_SELECTOR = '.styles__Integer-sc-10ygdxz-15';
  var PRICE_CENTS_SELECTOR = '.styles__Cents-sc-10ygdxz-16';
  var PRICE_CURRENCY_SELECTOR = '.styles__Currency-sc-10ygdxz-14';
  var DAILY_TEXT_SELECTOR = '.styles__DailyText-sc-10ygdxz-12';
  var DESCRIPTION_SECTION_SELECTOR = '.styles__Content-sc-mo0x01-0';
  var RESULTS_WRAPPER_SELECTOR = '.styles__ContentWrapper-sc-fdgbpv-2';
  var LOADING_WRAPPER_SELECTOR = '.styles__LoadingWrapper-sc-fdgbpv-4';

  // Funcao para injetar estilos
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Layout grid para os cards - 3 por linha
      '.inject-car-grid-wrapper {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 1fr);',
      '  gap: 16px;',
      '  padding: 16px 0;',
      '}',

      // Card flip container
      '.inject-car-card {',
      '  perspective: 1000px;',
      '  height: 540px;',
      '}',

      '.inject-car-card__inner {',
      '  position: relative;',
      '  width: 100%;',
      '  height: 100%;',
      '  transition: transform 0.6s ease;',
      '  transform-style: preserve-3d;',
      '}',

      '.inject-car-card--flipped .inject-car-card__inner {',
      '  transform: rotateY(180deg);',
      '}',

      // Frente e verso compartilham estilo base
      '.inject-car-card__front,',
      '.inject-car-card__back {',
      '  position: absolute;',
      '  top: 0;',
      '  left: 0;',
      '  width: 100%;',
      '  height: 100%;',
      '  backface-visibility: hidden;',
      '  -webkit-backface-visibility: hidden;',
      '  border: 1px solid #e0e0e0;',
      '  border-radius: 8px;',
      '  overflow: hidden;',
      '  background: #fff;',
      '  display: flex;',
      '  flex-direction: column;',
      '}',

      '.inject-car-card__front:hover,',
      '.inject-car-card__back:hover {',
      '  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);',
      '}',

      // Verso - rotacionado
      '.inject-car-card__back {',
      '  transform: rotateY(180deg);',
      '  padding: 20px 16px;',
      '  justify-content: space-between;',
      '}',

      '.inject-car-card__back-title {',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  color: #006450;',
      '  text-transform: uppercase;',
      '  text-align: center;',
      '  margin-bottom: 16px;',
      '}',

      // Imagem do carro
      '.inject-car-card__image {',
      '  width: 100%;',
      '  height: 150px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 12px;',
      '  background: #f9f9f9;',
      '}',

      '.inject-car-card__image img {',
      '  max-width: 100%;',
      '  max-height: 100%;',
      '  object-fit: contain;',
      '}',

      // Conteudo do card
      '.inject-car-card__content {',
      '  padding: 12px 16px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  flex: 1;',
      '}',

      // Titulo e subtitulo
      '.inject-car-card__title {',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  color: #006450;',
      '  text-transform: uppercase;',
      '  margin: 0 0 2px 0;',
      '  line-height: 1.3;',
      '  text-align: center;',
      '}',

      '.inject-car-card__subtitle {',
      '  font-size: 11px;',
      '  color: #666;',
      '  text-align: center;',
      '  margin-bottom: 8px;',
      '}',

      // Preco
      '.inject-car-card__price-section {',
      '  text-align: center;',
      '  margin: 8px 0;',
      '  padding: 8px 0;',
      '  border-top: 1px solid #f0f0f0;',
      '}',

      '.inject-car-card__price-label {',
      '  font-size: 12px;',
      '  color: #666;',
      '  margin-bottom: 4px;',
      '}',

      '.inject-car-card__price-value {',
      '  font-size: 24px;',
      '  font-weight: 700;',
      '  color: #333;',
      '}',

      '.inject-car-card__price-value span {',
      '  font-size: 14px;',
      '  font-weight: 400;',
      '}',

      '.inject-car-card__price-daily {',
      '  font-size: 11px;',
      '  color: #888;',
      '  margin-top: 2px;',
      '}',

      '.inject-car-card__price-installments {',
      '  font-size: 11px;',
      '  color: #888;',
      '  margin-top: 4px;',
      '}',

      // Botao Mostrar detalhes
      '.inject-car-card__details-toggle {',
      '  font-size: 13px;',
      '  color: #006450;',
      '  background: none;',
      '  border: none;',
      '  cursor: pointer;',
      '  text-decoration: underline;',
      '  padding: 8px 0;',
      '  text-align: center;',
      '  font-weight: 500;',
      '}',

      '.inject-car-card__details-toggle:hover {',
      '  color: #004d3b;',
      '}',

      // Amenities grid no verso do card
      '.inject-car-card__amenities-grid {',
      '  display: grid;',
      '  grid-template-columns: 1fr 1fr;',
      '  gap: 8px;',
      '  flex: 1;',
      '}',

      '.inject-car-card__amenity-item {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 6px 8px;',
      '  background: #f5f5f5;',
      '  border-radius: 4px;',
      '  font-size: 10px;',
      '  color: #333;',
      '}',

      '.inject-car-card__amenity-item svg {',
      '  width: 16px;',
      '  height: 16px;',
      '  flex-shrink: 0;',
      '}',

      '.inject-car-card__amenities-grid {',
      '  align-content: center;',
      '}',

      // Botao selecionar carro - COR AZUL para diferenciar dos pontos
      '.inject-car-card__select-btn {',
      '  display: block;',
      '  width: 100%;',
      '  padding: 12px;',
      '  background: #026CB6;',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 4px;',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  margin-top: auto;',
      '  transition: background 0.2s ease;',
      '}',

      '.inject-car-card__select-btn:hover {',
      '  background: #01517f;',
      '}',

      // Acumular pontos - VERDE para diferenciar do CTA azul
      '.inject-car-card__points {',
      '  background: #006450;',
      '  color: #fff;',
      '  font-size: 11px;',
      '  text-align: center;',
      '  padding: 6px 8px;',
      '  border-radius: 4px;',
      '  margin-bottom: 8px;',
      '}',

      '.inject-car-card__points strong {',
      '  font-weight: 700;',
      '}',

      // Supplier badge - logo com tamanho limitado
      '.inject-car-card__supplier {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 4px;',
      '  font-size: 11px;',
      '  color: #666;',
      '  margin-bottom: 8px;',
      '}',

      '.inject-car-card__supplier img {',
      '  height: 20px;',
      '  max-width: 60px;',
      '  object-fit: contain;',
      '}',

      // Responsivo - 2 colunas em tablet
      '@media (max-width: 1024px) {',
      '  .inject-car-grid-wrapper {',
      '    grid-template-columns: repeat(2, 1fr);',
      '  }',
      '}',

      // Responsivo - 1 coluna em mobile
      '@media (max-width: 600px) {',
      '  .inject-car-grid-wrapper {',
      '    grid-template-columns: 1fr;',
      '  }',
      '  .inject-car-card {',
      '    height: 460px;',
      '  }',
      '}',

      // Ocultar card original quando processado (sem display:none para manter botoes funcionais)
      '.inject-car-original--hidden {',
      '  position: absolute !important;',
      '  width: 1px !important;',
      '  height: 1px !important;',
      '  overflow: hidden !important;',
      '  clip: rect(0, 0, 0, 0) !important;',
      '  white-space: nowrap !important;',
      '  border: 0 !important;',
      '  padding: 0 !important;',
      '  margin: -1px !important;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    console.log('[AT Valor Unitario Carros] Estilos injetados com sucesso');
  }

  // Extrai dados de um card original
  function extractCarData(cardElement) {
    var data = {};

    // Titulo do carro
    var titleEl = cardElement.querySelector(CAR_TITLE_SELECTOR);
    data.title = titleEl ? titleEl.textContent.trim() : '';

    // Imagem
    var imgEl = cardElement.querySelector(CAR_IMAGE_SELECTOR);
    data.imageSrc = imgEl ? imgEl.getAttribute('src') : '';
    data.imageAlt = imgEl ? imgEl.getAttribute('alt') : '';

    // Subtitulo (categoria + portas)
    var subtitleEl = cardElement.querySelector(CAR_SUBTITLE_SELECTOR);
    if (subtitleEl) {
      var subtitleSpans = subtitleEl.querySelectorAll('.styles__Subtitle-sc-ccr6q9-8');
      var subtitleParts = [];
      for (var i = 0; i < subtitleSpans.length; i++) {
        var text = subtitleSpans[i].textContent.trim();
        if (text && text !== '|') {
          subtitleParts.push(text);
        }
      }
      data.subtitle = subtitleParts.join(' - ');
    } else {
      data.subtitle = '';
    }

    // Supplier (imagem)
    var supplierImg = cardElement.querySelector('.styles__SupplierImage-sc-ccr6q9-2');
    data.supplierSrc = supplierImg ? supplierImg.getAttribute('src') : '';
    data.supplierAlt = supplierImg ? supplierImg.getAttribute('alt') : '';

    // Preco
    var priceInt = cardElement.querySelector(PRICE_INTEGER_SELECTOR);
    var priceCents = cardElement.querySelector(PRICE_CENTS_SELECTOR);
    var priceCurrency = cardElement.querySelector(PRICE_CURRENCY_SELECTOR);
    data.priceInteger = priceInt ? priceInt.textContent.trim() : '';
    data.priceCents = priceCents ? priceCents.textContent.trim() : '';
    data.priceCurrency = priceCurrency ? priceCurrency.textContent.trim() : '';

    // Diarias
    var dailyEl = cardElement.querySelector(DAILY_TEXT_SELECTOR);
    data.dailyText = dailyEl ? dailyEl.textContent.trim() : '';

    // Calcular valor unitario (por diaria)
    data.unitPrice = calculateUnitPrice(data.priceInteger, data.priceCents, data.dailyText);

    // Parcelamento
    var installmentsEl = cardElement.querySelector('.styles__PriceInstallments-sc-10ygdxz-17');
    if (installmentsEl) {
      var installSpans = installmentsEl.querySelectorAll('span');
      data.installments = installSpans.length > 0 ? installSpans[0].textContent.trim() : '';
    } else {
      data.installments = '';
    }

    // Pontos (acumulo)
    var accrualText = cardElement.querySelector('.styles__AccrualText-sc-10ygdxz-9');
    data.pointsText = accrualText ? accrualText.innerHTML : '';

    // Amenities
    data.amenities = [];
    var amenitiesWrapper = cardElement.querySelector(CAR_AMENITIES_SELECTOR);
    if (amenitiesWrapper) {
      var amenityItems = amenitiesWrapper.querySelectorAll('.styles__AmenitieWrapper-sc-15jr9wu-0');
      for (var j = 0; j < amenityItems.length; j++) {
        var svgEl = amenityItems[j].querySelector('svg');
        var textEl = amenityItems[j].querySelector('.styles__AmenitieText-sc-15jr9wu-1');
        data.amenities.push({
          svg: svgEl ? svgEl.outerHTML : '',
          text: textEl ? textEl.textContent.trim() : ''
        });
      }
    }

    // Tag cancelamento gratis
    var cancelTag = cardElement.querySelector('.styles__InfoTagContainer-sc-b1bkke-0');
    data.hasCancelTag = !!cancelTag;

    // Botao original de selecionar
    var selectBtn = cardElement.querySelector('button[data-testid="search-box-hotel-date-picker-primary-button"]');
    data.selectBtnElement = selectBtn;

    return data;
  }

  // Calcula o valor por diaria
  function calculateUnitPrice(priceInteger, priceCents, dailyText) {
    if (!priceInteger || !dailyText) return null;

    var cleanInteger = priceInteger.replace(/\./g, '').replace(/,/g, '');
    var cleanCents = priceCents ? priceCents.replace(',', '') : '00';
    var totalCents = (parseInt(cleanInteger, 10) * 100) + parseInt(cleanCents, 10);

    // Extrair numero de diarias do texto (ex: "13 diarias")
    var dailyMatch = dailyText.match(/(\d+)/);
    if (!dailyMatch) return null;

    var numDays = parseInt(dailyMatch[1], 10);
    if (numDays <= 0) return null;

    var unitCents = Math.round(totalCents / numDays);
    var unitReais = Math.floor(unitCents / 100);
    var unitCentavos = unitCents % 100;

    return {
      integer: unitReais.toLocaleString('pt-BR'),
      cents: unitCentavos < 10 ? '0' + unitCentavos : '' + unitCentavos,
      days: numDays
    };
  }

  // Cria o novo card no formato grid
  function createNewCard(carData, originalCard) {
    var card = document.createElement('div');
    card.className = 'inject-car-card';

    // Pontos
    var pointsHtml = '';
    if (carData.pointsText) {
      pointsHtml = '<div class="inject-car-card__points">' + carData.pointsText + '</div>';
    }

    // Supplier
    var supplierHtml = '';
    if (carData.supplierSrc) {
      supplierHtml = '<div class="inject-car-card__supplier">' +
        '<span>Disponivel na</span>' +
        '<img src="' + carData.supplierSrc + '" alt="' + carData.supplierAlt + '">' +
        '</div>';
    }

    // Cancelamento gratis tag
    var cancelHtml = '';
    if (carData.hasCancelTag) {
      cancelHtml = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span style="background:#e8f5e9;color:#006450;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:500;">' +
        'Cancelamento gratis</span></div>';
    }

    // Preco - valor unitario (por dia)
    var priceHtml = '';
    if (carData.unitPrice) {
      priceHtml = '<div class="inject-car-card__price-section">' +
        '<div class="inject-car-card__price-label">A partir de</div>' +
        '<div class="inject-car-card__price-value">' +
          '<span>' + carData.priceCurrency + ' </span>' +
          carData.unitPrice.integer +
          '<span>,' + carData.unitPrice.cents + '</span>' +
          '<span> /Dia</span>' +
        '</div>' +
        '<div class="inject-car-card__price-daily">' +
          carData.priceCurrency + ' ' + carData.priceInteger + carData.priceCents +
          ' /Total em ate 12x' +
        '</div>' +
        '<div class="inject-car-card__price-installments">' +
          carData.installments +
        '</div>' +
        '</div>';
    } else {
      priceHtml = '<div class="inject-car-card__price-section">' +
        '<div class="inject-car-card__price-value">' +
          carData.priceCurrency + ' ' + carData.priceInteger + carData.priceCents +
        '</div>' +
        '<div class="inject-car-card__price-daily">' + carData.dailyText + '</div>' +
        '<div class="inject-car-card__price-installments">' + carData.installments + '</div>' +
        '</div>';
    }

    // Amenities para o verso do card
    var amenityItemsHtml = '';
    if (carData.amenities.length > 0) {
      for (var k = 0; k < carData.amenities.length; k++) {
        amenityItemsHtml += '<div class="inject-car-card__amenity-item">' +
          carData.amenities[k].svg +
          '<span>' + carData.amenities[k].text + '</span>' +
          '</div>';
      }
    }

    // Montar card com frente e verso (flip)
    card.innerHTML = '<div class="inject-car-card__inner">' +
      // Frente do card
      '<div class="inject-car-card__front">' +
        '<div class="inject-car-card__image">' +
          '<img src="' + carData.imageSrc + '" alt="' + carData.imageAlt + '">' +
        '</div>' +
        '<div class="inject-car-card__content">' +
          supplierHtml +
          cancelHtml +
          '<h3 class="inject-car-card__title">' + carData.title + '</h3>' +
          '<div class="inject-car-card__subtitle">' + carData.subtitle + '</div>' +
          pointsHtml +
          priceHtml +
          '<button class="inject-car-card__details-toggle">Mostrar detalhes</button>' +
          '<button class="inject-car-card__select-btn">Selecionar carro</button>' +
        '</div>' +
      '</div>' +
      // Verso do card (detalhes/amenities)
      '<div class="inject-car-card__back">' +
        '<div class="inject-car-card__back-title">' + carData.title + '</div>' +
        '<div class="inject-car-card__amenities-grid">' +
          amenityItemsHtml +
        '</div>' +
        '<button class="inject-car-card__details-toggle">Esconder detalhes</button>' +
        '<button class="inject-car-card__select-btn">Selecionar carro</button>' +
      '</div>' +
    '</div>';

    // Listeners para flip do card (frente e verso)
    var frontToggle = card.querySelector('.inject-car-card__front .inject-car-card__details-toggle');
    var backToggle = card.querySelector('.inject-car-card__back .inject-car-card__details-toggle');

    if (frontToggle) {
      frontToggle.addEventListener('click', function () {
        card.classList.add('inject-car-card--flipped');
      });
    }

    if (backToggle) {
      backToggle.addEventListener('click', function () {
        card.classList.remove('inject-car-card--flipped');
      });
    }

    // Listener para botoes de selecionar (frente e verso) - dispara evento no botao original
    var selectBtns = card.querySelectorAll('.inject-car-card__select-btn');
    var originalBtn = carData.selectBtnElement;
    for (var m = 0; m < selectBtns.length; m++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (!originalBtn) return;
          var clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          originalBtn.dispatchEvent(clickEvent);
        });
      })(selectBtns[m]);
    }

    return card;
  }

  // Processa um grupo de carros e reorganiza em grid
  function processCarGroup(groupWrapper) {
    if (groupWrapper.getAttribute(DATA_ATTR_PROCESSED)) return;

    var carCards = groupWrapper.querySelectorAll(CAR_CONTAINER_SELECTOR);
    if (!carCards || carCards.length === 0) return;

    // Criar wrapper grid
    var gridWrapper = document.createElement('div');
    gridWrapper.className = 'inject-car-grid-wrapper';

    for (var i = 0; i < carCards.length; i++) {
      var cardEl = carCards[i];
      var carData = extractCarData(cardEl);
      var newCard = createNewCard(carData, cardEl);
      gridWrapper.appendChild(newCard);

      // Esconde card original
      cardEl.classList.add('inject-car-original--hidden');
    }

    // Inserir grid apos os cards originais (no mesmo grupo)
    groupWrapper.appendChild(gridWrapper);
    groupWrapper.setAttribute(DATA_ATTR_PROCESSED, 'true');

    console.log('[AT Valor Unitario Carros] Grupo processado com ' + carCards.length + ' carros em grid');
  }

  // Processa todos os grupos de carros na pagina
  function processAllGroups() {
    if (isProcessing) return;
    isProcessing = true;

    var groups = document.querySelectorAll(CAR_GROUP_WRAPPER_SELECTOR);
    for (var i = 0; i < groups.length; i++) {
      processCarGroup(groups[i]);
    }

    isProcessing = false;
  }

  // Observa mudancas no DOM para novos carros carregados
  function initObserver() {
    var resultsWrapper = document.querySelector(RESULTS_WRAPPER_SELECTOR);
    if (!resultsWrapper) {
      console.log('[AT Valor Unitario Carros] Results wrapper nao encontrado para observer');
      return;
    }

    var observer = new MutationObserver(function () {
      if (isProcessing) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        processAllGroups();
      }, 300);
    });

    observer.observe(resultsWrapper, {
      childList: true,
      subtree: true
    });

    console.log('[AT Valor Unitario Carros] Observer inicializado');
  }

  // Verifica se o loading terminou e o conteudo esta disponivel
  function checkIfContentIsRendered() {
    var loadingWrapper = document.querySelector(LOADING_WRAPPER_SELECTOR);

    if (loadingWrapper) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT Valor Unitario Carros] Limite de tentativas atingido aguardando loading');
        return;
      }
      requestAnimationFrame(checkIfContentIsRendered);
      return;
    }

    var carCards = document.querySelectorAll(CAR_CONTAINER_SELECTOR);
    if (!carCards || carCards.length === 0) {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT Valor Unitario Carros] Limite de tentativas atingido aguardando cards');
        return;
      }
      requestAnimationFrame(checkIfContentIsRendered);
      return;
    }

    // Conteudo pronto - inicializar
    injectStyles();
    processAllGroups();
    initObserver();

    console.log('[AT Valor Unitario Carros] Inicializado com sucesso');
  }

  // Inicializacao
  function init() {
    var isCarPage = window.location.pathname.indexOf('/cars') !== -1;
    if (!isCarPage) {
      console.log('[AT Valor Unitario Carros] Pagina nao e de carros, script ignorado');
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
