// ============================================
// MODAL DE PASSAGENS AÉREAS - AZUL FRIDAY
// ============================================
// Modal promocional para passagens aéreas a partir de R$ 99,90
// Similar ao modal-facilidades.js, mas sem countdown e com foco em promoção de passagens
//
(function () {
  let observer = null;
  let isProcessing = false;
  let modalCreated = false;

  // Função para tracking de analytics
  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[ModalPassagens] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_azul_friday_modal_passagens ' + eventLabel;

    console.log('[ModalPassagens] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Função para criar ícone Nupay
  function createNupayIcon() {
    const container = document.createElement('div');
    container.style.cssText =
      'width: 24px; height: 24px; background: #F50955; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; position: relative;';

    const img = document.createElement('img');
    img.src = 'https://i.imgur.com/TfVyrxB.png';
    img.alt = 'Nupay';
    img.style.cssText = 'width: 20px; height: 20px; object-fit: contain;';

    container.appendChild(img);

    return container;
  }

  // Função para criar ícone Pix
  function createPixIcon() {
    const container = document.createElement('div');
    container.style.cssText =
      'width: 24px; height: 24px; background: #F50955; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; position: relative;';

    const img = document.createElement('img');
    img.src = 'https://i.imgur.com/wdNH6Po.png';
    img.alt = 'Pix';
    img.style.cssText = 'width: 20px; height: 20px; object-fit: contain;';

    container.appendChild(img);

    return container;
  }

  // Função para criar ícone Cartão Azul
  function createCartaoAzulIcon() {
    const container = document.createElement('div');
    container.style.cssText =
      'width: 24px; height: 24px; background: #F50955; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; position: relative;';

    const img = document.createElement('img');
    img.src = 'https://i.imgur.com/ZvKHzcU.png';
    img.alt = 'Cartão Azul';
    img.style.cssText = 'width: 20px; height: 20px; object-fit: contain;';

    container.appendChild(img);

    return container;
  }

  // Função para criar o botão de fechar (X)
  function createCloseButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Fechar modal');
    button.style.cssText =
      'position: absolute; width: 24px; height: 24px; left: 480px; top: 16px; border: none; background: transparent; cursor: pointer; padding: 0; z-index: 100;';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '6');
    line1.setAttribute('y1', '6');
    line1.setAttribute('x2', '18');
    line1.setAttribute('y2', '18');
    line1.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
    line1.setAttribute('stroke-width', '2');
    line1.setAttribute('stroke-linecap', 'round');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '18');
    line2.setAttribute('y1', '6');
    line2.setAttribute('x2', '6');
    line2.setAttribute('y2', '18');
    line2.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
    line2.setAttribute('stroke-width', '2');
    line2.setAttribute('stroke-linecap', 'round');

    svg.appendChild(line1);
    svg.appendChild(line2);
    button.appendChild(svg);

    button.addEventListener('click', function () {
      closeModal();
    });

    return button;
  }

  // Função para criar o logo Azul Friday
  function createAzulFridayLogo() {
    const container = document.createElement('div');
    container.style.cssText =
      'position: absolute; width: 123px; height: 72px; left: 299px; top: 9px;';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '123');
    svg.setAttribute('height', '72');
    svg.setAttribute('viewBox', '0 0 123 72');
    svg.setAttribute('fill', 'none');

    const paths = [
      {
        d: 'M109.338 12.0957H98.7941V29.3367C98.7941 35.0425 95.3199 36.5328 93.0254 36.5328C89.6751 36.5328 87.8151 35.0425 87.8151 30.7622V12.0957H77.2727V31.4464C77.2727 39.8811 79.9388 45.2133 89.1796 45.2133C92.8996 45.2133 96.9931 43.1665 98.9769 39.8792H99.1047V44.2833H109.336V12.0957H109.338Z',
        fill: '#00B4E2',
      },
      {
        d: 'M111.818 44.2813H122.361V0H111.818V44.2813ZM45.583 44.2813H76.2193V36.2221H58.9802L75.0416 20.0939V12.0937H46.8865V20.1568H61.6443L45.581 36.0963V44.2813H45.583ZM0 44.2813H11.846L14.6379 36.344H30.08L32.809 44.2813H44.8378L28.2809 0.00196806H16.5588L0 44.2813ZM22.3275 12.2825H22.4533L27.351 27.7874H17.304L22.3275 12.2825Z',
        fill: '#00B4E2',
      },
      {
        d: 'M0.186768 50.9473H18.2929V54.8068H5.69196V59.2345H17.4986V63.094H5.69196V71.2103H0.186768V50.9473Z',
        fill: 'white',
      },
      {
        d: 'M21.2458 50.9473H35.9742C41.5934 50.9473 42.5293 54.3801 42.5293 56.4524C42.5293 58.9219 41.5364 60.5105 39.238 61.3344V61.3914C41.6504 61.761 42.0201 64.8242 42.0201 66.812C42.0201 67.8049 42.1046 70.1898 43.07 71.2103H37.0536C36.5424 70.2744 36.5149 69.4506 36.5149 67.3212C36.5149 64.4841 35.2939 63.7743 33.5912 63.7743H26.751V71.2103H21.2458V50.9473ZM26.751 59.9148H34.0454C35.2664 59.9148 36.6859 59.2345 36.6859 57.3333C36.6859 55.318 35.0953 54.8068 33.7623 54.8068H26.753V59.9148H26.751Z',
        fill: 'white',
      },
      {
        d: 'M45.9934 50.9473H51.4986V71.2103H45.9934V50.9473Z',
        fill: 'white',
      },
      {
        d: 'M55.9268 50.9473H68.5553C75.5075 50.9473 78.5157 54.9778 78.5157 61.0788C78.5157 67.1797 75.3935 71.2103 69.037 71.2103H55.9248V50.9473H55.9268ZM61.432 67.3507H67.5624C71.1958 67.3507 72.8415 65.1664 72.8415 60.8802C72.8415 57.1347 71.2528 54.8068 67.0531 54.8068H61.4339V67.3507H61.432Z',
        fill: 'white',
      },
      {
        d: 'M95.6603 67.0381H86.3527L84.707 71.2103H78.7751L87.6857 50.9473H94.3253L103.236 71.2103H97.304L95.6584 67.0381H95.6603ZM91.0045 55.318L87.8253 63.3496H94.1818L91.0026 55.318H91.0045Z',
        fill: 'white',
      },
      {
        d: 'M107.864 64.144L98.8965 50.9473H105.367L110.617 59.7732L115.866 50.9473H122.337L113.369 64.144V71.2103H107.864V64.144Z',
        fill: 'white',
      },
    ];

    paths.forEach(function (pathData) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData.d);
      path.setAttribute('fill', pathData.fill);
      svg.appendChild(path);
    });

    container.appendChild(svg);

    return container;
  }

  // Função para adicionar estilos de animação
  function addAnimationStyles() {
    if (document.getElementById('azul-friday-modal-passagens-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'azul-friday-modal-passagens-styles';
    style.textContent =
      '@keyframes azul-friday-fade-in {' +
      'from {' +
      'opacity: 0;' +
      '}' +
      'to {' +
      'opacity: 1;' +
      '}' +
      '}' +
      '@keyframes azul-friday-fade-out {' +
      'from {' +
      'opacity: 1;' +
      '}' +
      'to {' +
      'opacity: 0;' +
      '}' +
      '}' +
      '@keyframes azul-friday-scale-in {' +
      'from {' +
      'transform: scale(0.8);' +
      'opacity: 0;' +
      '}' +
      'to {' +
      'transform: scale(1);' +
      'opacity: 1;' +
      '}' +
      '}' +
      '@keyframes azul-friday-scale-out {' +
      'from {' +
      'transform: scale(1);' +
      'opacity: 1;' +
      '}' +
      'to {' +
      'transform: scale(0.8);' +
      'opacity: 0;' +
      '}' +
      '}' +
      '.azul-friday-modal-passagens-overlay {' +
      'animation: azul-friday-fade-in 0.3s ease-out;' +
      '}' +
      '.azul-friday-modal-passagens-overlay.closing {' +
      'animation: azul-friday-fade-out 0.3s ease-in forwards;' +
      '}' +
      '.azul-friday-modal-passagens {' +
      'animation: azul-friday-scale-in 0.3s ease-out;' +
      '}' +
      '.azul-friday-modal-passagens.closing {' +
      'animation: azul-friday-scale-out 0.3s ease-in forwards;' +
      '}';

    document.head.appendChild(style);
  }

  // Função para adicionar estilos responsivos mobile
  function addMobileStyles() {
    if (document.getElementById('azul-friday-modal-passagens-mobile-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'azul-friday-modal-passagens-mobile-styles';
    style.textContent =
      '@media (max-width: 768px) {' +
      '.azul-friday-modal-passagens {' +
      'width: 90vw !important;' +
      'max-width: 328px !important;' +
      'max-height: 90vh !important;' +
      'background: linear-gradient(270deg, #00043E 0%, #0E0E0F 100%) !important;' +
      'height: auto !important;' +
      '}' +
      '.azul-friday-modal-passagens-header {' +
      'width: 100% !important;' +
      'max-height: 170px !important;' +
      'background: linear-gradient(90deg, #0E0E0F 0%, #00043E 100%) !important;' +
      '}' +
      '.azul-friday-modal-passagens-title-container {' +
      'width: calc(100% - 32px) !important;' +
      'max-width: 296px !important;' +
      'left: 16px !important;' +
      'top: 16px !important;' +
      '}' +
      '.azul-friday-modal-passagens-title {' +
      'font-size: 18px !important;' +
      'line-height: 24px !important;' +
      'max-width: 200px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price {' +
      'font-size: 18px !important;' +
      'line-height: 18px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price span:first-child {' +
      'font-size: 18px !important;' +
      'line-height: 18px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price span:nth-child(2) {' +
      'font-size: 50px !important;' +
      'line-height: 42px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price span:nth-child(3) {' +
      'font-size: 18px !important;' +
      'line-height: 18px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price-decimal {' +
      'font-size: 19px !important;' +
      'line-height: 58px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price-points {' +
      'font-size: 12px !important;' +
      'line-height: 19px !important;' +
      '}' +
      '.azul-friday-modal-passagens-price-label {' +
      'font-size: 10px !important;' +
      'line-height: 14px !important;' +
      'top: 134px !important;' +
      '}' +
      '.azul-friday-modal-passagens-logo {' +
      'width: 72px !important;' +
      'height: 42px !important;' +
      'right: 16px !important;' +
      'top: 19px !important;' +
      'left: 207px !important;' +
      '}' +
      '.azul-friday-modal-passagens-logo svg {' +
      'width: 100% !important;' +
      'height: 100% !important;' +
      '}' +
      '.azul-friday-modal-passagens-close-btn {' +
      'right: 16px !important;' +
      'top: 16px !important;' +
      'left: auto !important;' +
      'width: 24px !important;' +
      'height: 24px !important;' +
      '}' +
      '.azul-friday-modal-passagens-content {' +
      'width: 100% !important;' +
      'padding: 20px 16px !important;' +
      'gap: 20px !important;' +
      'max-height: calc(90vh - 207px) !important;' +
      'box-sizing: border-box !important;' +
      '}' +
      '.azul-friday-modal-passagens-offers-list {' +
      'width: 100% !important;' +
      'max-width: 296px !important;' +
      'gap: 12px !important;' +
      '}' +
      '.azul-friday-modal-passagens-offer-item {' +
      'width: 100% !important;' +
      'gap: 12px !important;' +
      'margin-bottom: 12px !important;' +
      'height: auto !important;' +
      '}' +
      '.azul-friday-modal-passagens-offer-item:last-child {' +
      'margin-bottom: 0 !important;' +
      '}' +
      '.azul-friday-modal-passagens-offer-icon {' +
      'width: 20px !important;' +
      'height: 20px !important;' +
      'flex-shrink: 0 !important;' +
      '}' +
      '.azul-friday-modal-passagens-offer-icon svg {' +
      'width: 100% !important;' +
      'height: 100% !important;' +
      '}' +
      '.azul-friday-modal-passagens-offer-icon > div {' +
      'width: 20px !important;' +
      'height: 20px !important;' +
      '}' +
      '.azul-friday-modal-passagens-offer-text {' +
      'font-size: 14px !important;' +
      'line-height: 20px !important;' +
      'flex: 1 !important;' +
      '}' +
      '.azul-friday-modal-passagens-disclaimer {' +
      'width: 100% !important;' +
      'max-width: 296px !important;' +
      'min-height: 16px !important;' +
      'font-size: 9px !important;' +
      'line-height: 16px !important;' +
      '}' +
      '.azul-friday-modal-passagens-cta-button {' +
      'width: 100% !important;' +
      'max-width: 296px !important;' +
      'min-height: 48px !important;' +
      'font-size: 14px !important;' +
      'line-height: 20px !important;' +
      '}' +
      '.azul-friday-modal-passagens-continue-link {' +
      'width: 100% !important;' +
      'max-width: 296px !important;' +
      'min-height: 26px !important;' +
      'font-size: 13px !important;' +
      'line-height: 18px !important;' +
      'padding: 4px 0 0 !important;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  // Função para criar o modal
  function createModal() {
    if (modalCreated) {
      return;
    }

    // Adicionar estilos de animação
    addAnimationStyles();
    // Adicionar estilos mobile
    addMobileStyles();

    // Criar overlay de fundo
    const overlay = document.createElement('div');
    overlay.className = 'azul-friday-modal-passagens-overlay';
    overlay.setAttribute('data-modal-passagens-overlay', 'true');
    overlay.style.cssText =
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 9998; display: flex; justify-content: center; align-items: center;';

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Criar container principal do modal
    const modal = document.createElement('div');
    modal.className = 'azul-friday-modal-passagens';
    modal.setAttribute('data-modal-passagens', 'true');
    modal.style.cssText =
      'position: relative; width: 520px; height: 564px; background: linear-gradient(270deg, #00043E 0%, #0E0E0F 100%); box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25); border-radius: 10px; display: flex; flex-direction: column; z-index: 9999; overflow: hidden;';

    // Criar header
    const header = document.createElement('div');
    header.className = 'azul-friday-modal-passagens-header';
    header.style.cssText =
      'width: 520px; height: 207px; background: linear-gradient(90deg, #0E0E0F 0%, #00043E 100%); border-radius: 10px 10px 0 0; position: relative; flex-shrink: 0;';

    // Container do título e preço
    const titleContainer = document.createElement('div');
    titleContainer.className = 'azul-friday-modal-passagens-title-container';
    titleContainer.style.cssText =
      'position: absolute; width: 472px; height: 94px; left: 24px; top: 16px;';

    // Título principal
    const title = document.createElement('div');
    title.className = 'azul-friday-modal-passagens-title';
    title.textContent = 'Passagens aéreas imperdíveis!';
    title.style.cssText =
      'position: absolute; width: 241px; height: 60px; left: 0; top: -2px; font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 24px; line-height: 30px; color: #FFFFFF;';

    // Preço "R$ 85,99"
    const priceMain = document.createElement('div');
    priceMain.className = 'azul-friday-modal-passagens-price';
    priceMain.style.cssText =
      'position: absolute; width: auto; height: 75px; left: 85px; top: 70px; font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 20px; line-height: 20px; color: #FDC700; display: flex; align-items: flex-end;';

    // "R$"
    const priceSymbol = document.createElement('span');
    priceSymbol.textContent = 'R$';
    priceSymbol.style.cssText = 'font-size: 20px; line-height: 20px;';

    // "85"
    const priceInteger = document.createElement('span');
    priceInteger.textContent = ' 85';
    priceInteger.style.cssText = 'font-size: 71px; line-height: 60px;';

    // Span vazio
    const priceEmpty = document.createElement('span');
    priceEmpty.style.cssText = 'font-size: 20px; line-height: 20px;';

    // ",90" (com vírgula junto)
    const priceDecimal = document.createElement('span');
    priceDecimal.className = 'azul-friday-modal-passagens-price-decimal';
    priceDecimal.textContent = ',99';
    priceDecimal.style.cssText =
      'font-size: 27px; line-height: 83px; vertical-align: super; margin-left: 2px;';

    // "ou 3.000 pontos"
    const pricePoints = document.createElement('span');
    pricePoints.className = 'azul-friday-modal-passagens-price-points';
    pricePoints.textContent = 'ou 3.000 pontos';
    pricePoints.style.cssText = 'font-size: 20px; line-height: 19px; color: #FFFFFF;';

    // Montar o preço
    priceMain.appendChild(priceSymbol);
    priceMain.appendChild(priceInteger);
    priceMain.appendChild(priceEmpty);
    priceMain.appendChild(priceDecimal);
    priceMain.appendChild(pricePoints);

    // Label "a partir de"
    const priceLabel = document.createElement('div');
    priceLabel.className = 'azul-friday-modal-passagens-price-label';
    priceLabel.textContent = 'a partir de';
    priceLabel.style.cssText =
      'position: absolute; width: 62px; height: 30px; left: 24px; top: 125px; font-family: "Helvetica Neue", Arial; font-weight: 400; font-size: 12px; line-height: 30px; color: #FFFFFF;';

    titleContainer.appendChild(title);
    titleContainer.appendChild(priceMain);
    titleContainer.appendChild(priceLabel);

    // Adicionar logo Azul Friday
    const logo = createAzulFridayLogo();
    logo.className = 'azul-friday-modal-passagens-logo';
    header.appendChild(logo);

    // Adicionar botão de fechar
    const closeBtn = createCloseButton();
    closeBtn.className = 'azul-friday-modal-passagens-close-btn';
    header.appendChild(closeBtn);

    header.appendChild(titleContainer);

    // Criar conteúdo principal
    const content = document.createElement('div');
    content.className = 'azul-friday-modal-passagens-content';
    content.style.cssText =
      'display: flex; flex-direction: column; align-items: flex-start; padding: 24px 24px 0px; gap: 24px; width: 520px; height: 357px; flex: 1; overflow-y: auto; box-sizing: border-box;';

    // Container de ofertas
    const offersList = document.createElement('div');
    offersList.className = 'azul-friday-modal-passagens-offers-list';
    offersList.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 472px;';

    // Oferta 1 - Nupay
    const offer1 = document.createElement('div');
    offer1.className = 'azul-friday-modal-passagens-offer-item';
    offer1.style.cssText =
      'display: flex; flex-direction: row; align-items: flex-start; gap: 12px; width: 472px; height: 46px;';

    const icon1 = createNupayIcon();
    icon1.className = 'azul-friday-modal-passagens-offer-icon';

    const offer1Text = document.createElement('div');
    offer1Text.className = 'azul-friday-modal-passagens-offer-text';
    offer1Text.textContent = 'Até 24x pagando com Nupay';
    offer1Text.style.cssText =
      'font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 20px; line-height: 22px; color: #FFFFFF; flex: 1;';

    offer1.appendChild(icon1);
    offer1.appendChild(offer1Text);

    // Oferta 2 - Pix
    const offer2 = document.createElement('div');
    offer2.className = 'azul-friday-modal-passagens-offer-item';
    offer2.style.cssText =
      'display: flex; flex-direction: row; align-items: flex-start; gap: 12px; width: 472px; height: 44px;';

    const icon2 = createPixIcon();
    icon2.className = 'azul-friday-modal-passagens-offer-icon';

    const offer2Text = document.createElement('div');
    offer2Text.className = 'azul-friday-modal-passagens-offer-text';
    offer2Text.textContent = 'Até 35% OFF pagando no pix';
    offer2Text.style.cssText =
      'font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 20px; line-height: 22px; color: #FFFFFF; flex: 1;';

    offer2.appendChild(icon2);
    offer2.appendChild(offer2Text);

    // Oferta 3 - Cartão Azul
    const offer3 = document.createElement('div');
    offer3.className = 'azul-friday-modal-passagens-offer-item';
    offer3.style.cssText =
      'display: flex; flex-direction: row; align-items: flex-start; gap: 12px; width: 472px; height: 26px;';

    const icon3 = createCartaoAzulIcon();
    icon3.className = 'azul-friday-modal-passagens-offer-icon';

    const offer3Text = document.createElement('div');
    offer3Text.className = 'azul-friday-modal-passagens-offer-text';
    offer3Text.textContent = 'Até 10% OFF pagando com cartão Azul Itaú';
    offer3Text.style.cssText =
      'font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 20px; line-height: 22px; color: #FFFFFF; flex: 1;';

    offer3.appendChild(icon3);
    offer3.appendChild(offer3Text);

    offersList.appendChild(offer1);
    offersList.appendChild(offer2);
    offersList.appendChild(offer3);

    // Disclaimer
    const disclaimer = document.createElement('div');
    disclaimer.className = 'azul-friday-modal-passagens-disclaimer';
    disclaimer.style.cssText =
      'display: flex; flex-direction: row; align-items: center; gap: 8px; width: 415px; height: 20px;';

    const disclaimerText = document.createElement('div');
    disclaimerText.textContent = '*Oferta válida enquanto durarem as condições promocionais.';
    disclaimerText.style.cssText =
      'width: 401.36px; height: 20.5px; font-family: Arial; font-weight: 400; font-size: 10px; line-height: 20px; color: #FFFFFF;';

    disclaimer.appendChild(disclaimerText);

    // Botão CTA
    const ctaButton = document.createElement('button');
    ctaButton.className = 'azul-friday-modal-passagens-cta-button';
    ctaButton.type = 'button';
    ctaButton.textContent = 'APROVEITAR OFERTA AGORA';
    ctaButton.style.cssText =
      'width: 472px; height: 56px; background: #F50955; box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1); border-radius: 24px; border: none; font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 16px; line-height: 24px; text-align: center; color: #FFFFFF; cursor: pointer;';

    ctaButton.addEventListener('click', function () {
      analyticsEvent('cta_aproveitar_oferta');
      window.open('https://passagens.voeazul.com.br/pt/melhores-ofertas', '_blank');
      closeModal();
    });

    // Link continuar navegando
    const continueLink = document.createElement('button');
    continueLink.className = 'azul-friday-modal-passagens-continue-link';
    continueLink.type = 'button';
    continueLink.textContent = 'Continuar navegando';
    continueLink.style.cssText =
      'width: 472px; height: 21px; background: transparent; border: none; font-family: Arial; font-weight: 400; font-size: 14px; line-height: 21px; text-align: center; color: #FFFFFF; cursor: pointer; text-decoration: underline;';

    continueLink.addEventListener('click', function () {
      closeModal();
    });

    // Montar conteúdo
    content.appendChild(offersList);
    content.appendChild(disclaimer);
    content.appendChild(ctaButton);
    content.appendChild(continueLink);

    // Montar modal
    modal.appendChild(header);
    modal.appendChild(content);

    // Adicionar ao overlay
    overlay.appendChild(modal);

    // Adicionar ao body
    document.body.appendChild(overlay);

    modalCreated = true;
    console.log('Modal Azul Friday Passagens criado com sucesso');
  }

  // Função para fechar o modal
  function closeModal() {
    const overlay = document.querySelector('[data-modal-passagens-overlay]');
    const modal = document.querySelector('[data-modal-passagens]');

    if (overlay) {
      // Adicionar classe de animação de fechamento
      overlay.classList.add('closing');
      if (modal) {
        modal.classList.add('closing');
      }

      // Aguardar animação terminar antes de remover
      setTimeout(function () {
        overlay.remove();
        modalCreated = false;

        console.log('Modal fechado');
      }, 300);
    }
  }

  // ============================================
  // REGRAS DE EXIBIÇÃO DO MODAL
  // ============================================
  // 1. Apenas 1 exibição por sessão (usa sessionStorage)
  // 2. Máximo de 3 sessões por dia com exibição (usa localStorage)
  // 3. Gatilhos: exit intent (sair da página) OU scroll 50%
  // 4. Uma vez exibido na sessão, não exibe mais

  // Função para verificar se pode exibir o modal
  function canShowModal() {
    // Regra 1: Verificar se já foi exibido nesta sessão
    const shownThisSession = sessionStorage.getItem('azul-friday-modal-passagens-shown');
    if (shownThisSession === 'true') {
      console.log('Modal passagens já foi exibido nesta sessão');
      return false;
    }

    // Regra 2: Verificar limite diário (máximo 3 sessões por dia)
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('azul-friday-modal-passagens-last-date');
    let dailyCount = parseInt(
      localStorage.getItem('azul-friday-modal-passagens-daily-count') || '0',
      10
    );

    // Se é um novo dia, resetar contador
    if (lastShownDate !== today) {
      dailyCount = 0;
      localStorage.setItem('azul-friday-modal-passagens-daily-count', '0');
      localStorage.setItem('azul-friday-modal-passagens-last-date', today);
    }

    // Verificar se atingiu limite diário
    if (dailyCount >= 3) {
      console.log('Modal passagens já foi exibido 3 vezes hoje');
      return false;
    }

    return true;
  }

  // Função para registrar que o modal foi exibido
  function registerModalShown() {
    // Marcar como exibido nesta sessão
    sessionStorage.setItem('azul-friday-modal-passagens-shown', 'true');

    // Incrementar contador diário
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('azul-friday-modal-passagens-last-date');
    let dailyCount = parseInt(
      localStorage.getItem('azul-friday-modal-passagens-daily-count') || '0',
      10
    );

    // Se é um novo dia, resetar contador
    if (lastShownDate !== today) {
      dailyCount = 0;
    }

    dailyCount = dailyCount + 1;
    localStorage.setItem('azul-friday-modal-passagens-daily-count', String(dailyCount));
    localStorage.setItem('azul-friday-modal-passagens-last-date', today);

    console.log('Modal passagens registrado. Exibições hoje: ' + dailyCount + ' | Sessão marcada');
  }

  // Função para tentar exibir o modal
  function tryShowModal(trigger) {
    // Verificar se o modal já existe no DOM
    const existingModal = document.querySelector('[data-modal-passagens-overlay]');
    if (existingModal || modalCreated) {
      console.log('Modal passagens já está aberto');
      return;
    }

    // Verificar se pode exibir
    if (!canShowModal()) {
      return;
    }

    console.log('Exibindo modal passagens via: ' + trigger);
    createModal();
    registerModalShown();
  }

  // Função de debug para limpar dados (pode ser chamada no console)
  window.clearAzulFridayModalPassagensData = function () {
    sessionStorage.removeItem('azul-friday-modal-passagens-shown');
    localStorage.removeItem('azul-friday-modal-passagens-last-date');
    localStorage.removeItem('azul-friday-modal-passagens-daily-count');
    console.log('Dados do modal passagens limpos. Recarregue a página para testar.');
  };

  // Função para detectar saída da tela (exit intent)
  function setupExitIntent() {
    document.addEventListener('mouseleave', function (e) {
      // Verificar se o mouse está saindo pela parte superior
      if (e.clientY <= 0) {
        tryShowModal('exit-intent');
      }
    });
  }

  // Função para detectar scroll
  function setupScrollTrigger() {
    let scrollTriggered = false;

    window.addEventListener(
      'scroll',
      function () {
        if (scrollTriggered) {
          return;
        }

        // Calcular porcentagem de scroll
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollableHeight = documentHeight - windowHeight;

        // Evitar divisão por zero
        if (scrollableHeight <= 0) {
          return;
        }

        const currentPercentage = Math.round((scrollTop / scrollableHeight) * 100);

        // Exibir quando o usuário scrollar 50% da página
        if (currentPercentage >= 50) {
          scrollTriggered = true;
          tryShowModal('scroll-50');
        }
      },
      { passive: true }
    );
  }

  // Função para inicializar
  function init() {
    console.log('Inicializando modal Azul Friday Passagens...');

    // Aguardar um pouco para garantir que o DOM está totalmente carregado
    setTimeout(function () {
      // Configurar eventos de exibição
      setupExitIntent();
      setupScrollTrigger();
      console.log('Eventos de exibição configurados');
    }, 500);
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
