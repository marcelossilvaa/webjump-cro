// ============================================
// CONFIGURAÇÃO DA DATA FINAL DO COUNTDOWN
// ============================================
// Formato: 'YYYY-MM-DD HH:MM:SS' (horário de Brasília)
// Exemplo: '2024-11-29 23:59:59'
const COUNTDOWN_END_DATE = '2025-11-29 23:59:59';

(function () {
  let observer = null;
  let isProcessing = false;
  let modalCreated = false;
  let countdownInterval = null;

  // Função para obter data atual em Brasília
  function getBrasiliaTime() {
    const now = new Date();
    // Converter para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60; // -3 horas em minutos
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 60000);
    return brasiliaTime;
  }

  // Função para criar data final em Brasília
  function getEndDate() {
    const [datePart, timePart] = COUNTDOWN_END_DATE.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    // Criar data em UTC e ajustar para Brasília
    const endDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60;
    const utc = endDate.getTime() - brasiliaOffset * 60000;
    return new Date(utc);
  }

  // Função para calcular diferença
  function calculateTimeRemaining() {
    const now = getBrasiliaTime();
    const end = getEndDate();
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }

  // Função para criar ícone 1 - gráfico de crescimento
  function createIcon1() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bg.setAttribute(
      'd',
      'M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z'
    );
    bg.setAttribute('fill', '#F50955');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M14.6665 8.66602H18.6665V12.666');
    path1.setAttribute('stroke', 'black');
    path1.setAttribute('stroke-width', '1.33333');
    path1.setAttribute('stroke-linecap', 'round');
    path1.setAttribute('stroke-linejoin', 'round');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M18.6668 8.66602L13.0002 14.3327L9.66683 10.9993L5.3335 15.3327');
    path2.setAttribute('stroke', 'black');
    path2.setAttribute('stroke-width', '1.33333');
    path2.setAttribute('stroke-linecap', 'round');
    path2.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(bg);
    svg.appendChild(path1);
    svg.appendChild(path2);

    return svg;
  }

  // Função para criar ícone 2 - 4x
  function createIcon2() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bg.setAttribute(
      'd',
      'M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z'
    );
    bg.setAttribute('fill', '#F50955');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    text.setAttribute(
      'd',
      'M7.96289 15.5V13.1006H3.61523V11.9727L8.18848 5.47852H9.19336V11.9727H10.5469V13.1006H9.19336V15.5H7.96289ZM7.96289 11.9727V7.4541L4.8252 11.9727H7.96289ZM12.3311 12.7041L14.4844 10.5508L12.3379 8.4043L13.1719 7.57031L15.3184 9.7168L17.458 7.57715L18.2783 8.4043L16.1455 10.5439L18.292 12.6904L17.458 13.5244L15.3115 11.3779L13.1582 13.5312L12.3311 12.7041Z'
    );
    text.setAttribute('fill', 'black');

    svg.appendChild(bg);
    svg.appendChild(text);

    return svg;
  }

  // Função para criar ícone 3 - relógio
  function createIcon3() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bg.setAttribute(
      'd',
      'M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z'
    );
    bg.setAttribute('fill', '#F50955');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    circle.setAttribute(
      'd',
      'M12.0002 18.6673C15.6821 18.6673 18.6668 15.6825 18.6668 12.0007C18.6668 8.31875 15.6821 5.33398 12.0002 5.33398C8.31826 5.33398 5.3335 8.31875 5.3335 12.0007C5.3335 15.6825 8.31826 18.6673 12.0002 18.6673Z'
    );
    circle.setAttribute('stroke', 'black');
    circle.setAttribute('stroke-width', '1.33333');
    circle.setAttribute('stroke-linecap', 'round');
    circle.setAttribute('stroke-linejoin', 'round');

    const hand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hand.setAttribute('d', 'M12 8V12L14.6667 13.3333');
    hand.setAttribute('stroke', 'black');
    hand.setAttribute('stroke-width', '1.33333');
    hand.setAttribute('stroke-linecap', 'round');
    hand.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(bg);
    svg.appendChild(circle);
    svg.appendChild(hand);

    return svg;
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

  // Função para criar a seção de countdown
  function createCountdownSection() {
    const countdownContainer = document.createElement('div');
    countdownContainer.id = 'modal-countdown-container';
    countdownContainer.style.cssText =
      'width: 472px; min-height: 94px; background: #041E42; border: 1px solid #00B4E2; border-radius: 10px; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; align-items: stretch;';

    // Linha com ícone de relógio e texto
    const countdownHeader = document.createElement('div');
    countdownHeader.style.cssText =
      'display: flex; flex-direction: row; align-items: center; gap: 8px; flex-shrink: 0; justify-content: center;';

    // Ícone de relógio
    const clockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    clockIcon.setAttribute('width', '20');
    clockIcon.setAttribute('height', '20');
    clockIcon.setAttribute('viewBox', '0 0 20 20');
    clockIcon.setAttribute('fill', 'none');

    const clockCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clockCircle.setAttribute('cx', '10');
    clockCircle.setAttribute('cy', '10');
    clockCircle.setAttribute('r', '8');
    clockCircle.setAttribute('stroke', '#00B4E2');
    clockCircle.setAttribute('stroke-width', '1.5');

    const clockHand1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    clockHand1.setAttribute('x1', '10');
    clockHand1.setAttribute('y1', '10');
    clockHand1.setAttribute('x2', '10');
    clockHand1.setAttribute('y2', '6');
    clockHand1.setAttribute('stroke', '#00B4E2');
    clockHand1.setAttribute('stroke-width', '1.5');
    clockHand1.setAttribute('stroke-linecap', 'round');

    const clockHand2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    clockHand2.setAttribute('x1', '10');
    clockHand2.setAttribute('y1', '10');
    clockHand2.setAttribute('x2', '13');
    clockHand2.setAttribute('y2', '10');
    clockHand2.setAttribute('stroke', '#00B4E2');
    clockHand2.setAttribute('stroke-width', '1.5');
    clockHand2.setAttribute('stroke-linecap', 'round');

    clockIcon.appendChild(clockCircle);
    clockIcon.appendChild(clockHand1);
    clockIcon.appendChild(clockHand2);

    const countdownText = document.createElement('span');
    countdownText.textContent = 'Promoção encerra em:';
    countdownText.style.cssText =
      'font-family: "Helvetica Neue", Arial; font-weight: 400; font-size: 14px; line-height: 20px; color: #FFFFFF;';

    countdownHeader.appendChild(clockIcon);
    countdownHeader.appendChild(countdownText);

    // Container dos números do countdown
    const countdownDisplay = document.createElement('div');
    countdownDisplay.id = 'modal-countdown-display';
    countdownDisplay.style.cssText =
      'display: flex; flex-direction: row; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap;';

    countdownContainer.appendChild(countdownHeader);
    countdownContainer.appendChild(countdownDisplay);

    return countdownContainer;
  }

  // Função para atualizar o countdown do modal
  function updateModalCountdown() {
    const countdownDisplay = document.getElementById('modal-countdown-display');
    if (!countdownDisplay) {
      return;
    }

    const time = calculateTimeRemaining();

    if (time.expired) {
      countdownDisplay.innerHTML = '';
      const expiredText = document.createElement('div');
      expiredText.textContent = 'Oferta encerrada';
      expiredText.style.cssText =
        'color: #FFFFFF; font-size: 16px; font-weight: 700; font-family: "Helvetica Neue", Arial;';
      countdownDisplay.appendChild(expiredText);
      return;
    }

    // Criar boxes para cada unidade de tempo
    const timeUnits = [
      { value: time.days, label: 'Dias' },
      { value: time.hours, label: 'Horas' },
      { value: time.minutes, label: 'Min' },
      { value: time.seconds, label: 'Seg' },
    ];

    countdownDisplay.innerHTML = '';

    timeUnits.forEach(function (unit) {
      // Box do número
      const numberBox = document.createElement('div');
      numberBox.style.cssText =
        'width: 60px; min-height: 50px; background: #00043E; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; flex-shrink: 0;';

      const value = document.createElement('div');
      value.textContent = String(unit.value).padStart(2, '0');
      value.style.cssText =
        'color: #FFFFFF; font-size: 20px; font-weight: 700; font-family: "Helvetica Neue", Arial; line-height: 1; text-align: center;';

      const label = document.createElement('div');
      label.textContent = unit.label;
      label.style.cssText =
        'color: rgba(255, 255, 255, 0.8); font-size: 10px; font-weight: 400; font-family: "Helvetica Neue", Arial; text-align: center; white-space: nowrap;';

      numberBox.appendChild(value);
      numberBox.appendChild(label);
      countdownDisplay.appendChild(numberBox);
    });
  }

  // Função para criar o logo Azul Friday
  function createAzulFridayLogo() {
    const container = document.createElement('div');
    container.style.cssText =
      'position: absolute; width: 123px; height: 72px; left: 335px; top: 20px;';

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
    if (document.getElementById('azul-friday-modal-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'azul-friday-modal-styles';
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
      '.azul-friday-modal-overlay {' +
      'animation: azul-friday-fade-in 0.3s ease-out;' +
      '}' +
      '.azul-friday-modal-overlay.closing {' +
      'animation: azul-friday-fade-out 0.3s ease-in forwards;' +
      '}' +
      '.azul-friday-modal {' +
      'animation: azul-friday-scale-in 0.3s ease-out;' +
      '}' +
      '.azul-friday-modal.closing {' +
      'animation: azul-friday-scale-out 0.3s ease-in forwards;' +
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

    // Criar overlay de fundo
    const overlay = document.createElement('div');
    overlay.className = 'azul-friday-modal-overlay';
    overlay.setAttribute('data-modal-overlay', 'true');
    overlay.style.cssText =
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 9998; display: flex; justify-content: center; align-items: center;';

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Criar container principal do modal
    const modal = document.createElement('div');
    modal.className = 'azul-friday-modal';
    modal.setAttribute('data-modal', 'true');
    modal.style.cssText =
      'position: relative; width: 520px; max-height: 90vh; background: linear-gradient(270deg, #00043E 0%, #0E0E0F 100%); box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25); border-radius: 10px; display: flex; flex-direction: column; z-index: 9999; overflow: hidden;';

    // Criar header
    const header = document.createElement('div');
    header.style.cssText =
      'width: 520px; height: 126px; background: linear-gradient(90deg, #0E0E0F 0%, #00043E 100%); border-radius: 10px 10px 0 0; position: relative; flex-shrink: 0;';

    // Container do título
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText =
      'position: absolute; width: 472px; height: 94px; left: 24px; top: 20px;';

    // Título principal
    const titleLine1 = document.createElement('div');
    titleLine1.textContent = 'Última chance de';
    titleLine1.style.cssText =
      'position: absolute; width: 200px; height: 30px; left: 0; top: -2px; font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 24px; line-height: 30px; color: #FFFFFF;';

    const titleLine2 = document.createElement('div');
    titleLine2.textContent = 'multiplicar seus pontos*';
    titleLine2.style.cssText =
      'position: absolute; width: 278px; height: 30px; left: 0; top: 28px; font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 24px; line-height: 30px; color: #FFFFFF;';

    titleContainer.appendChild(titleLine1);
    titleContainer.appendChild(titleLine2);

    // Adicionar logo Azul Friday
    const logo = createAzulFridayLogo();
    header.appendChild(logo);

    // Adicionar botão de fechar
    const closeBtn = createCloseButton();
    header.appendChild(closeBtn);

    header.appendChild(titleContainer);

    // Criar conteúdo principal
    const content = document.createElement('div');
    content.style.cssText =
      'display: flex; flex-direction: column; align-items: flex-start; padding: 24px 24px 20px 24px; gap: 16px; width: 520px; flex: 1; overflow-y: auto; max-height: calc(90vh - 126px); box-sizing: border-box;';

    // Seção de countdown
    const countdownSection = createCountdownSection();
    content.appendChild(countdownSection);

    // Container de ofertas
    const offersList = document.createElement('div');
    offersList.style.cssText = 'display: flex; flex-direction: column; gap: 16px; width: 472px;';

    // Oferta 1
    const offer1 = document.createElement('div');
    offer1.style.cssText =
      'display: flex; flex-direction: row; align-items: flex-start; gap: 12px;';

    const icon1 = createIcon1();
    icon1.style.cssText = 'flex-shrink: 0;';

    const offer1Text = document.createElement('div');
    offer1Text.innerHTML =
      'Compre <strong>5.000 pontos</strong> e receba até <strong>21.000 pontos</strong> na sua conta Azul!';
    offer1Text.style.cssText =
      'font-family: Arial; font-weight: 400; font-size: 15px; line-height: 22px; color: #FFFFFF;';

    offer1.appendChild(icon1);
    offer1.appendChild(offer1Text);

    // Oferta 2
    const offer2 = document.createElement('div');
    offer2.style.cssText =
      'display: flex; flex-direction: row; align-items: flex-start; gap: 12px;';

    const icon2 = createIcon2();
    icon2.style.cssText = 'flex-shrink: 0;';

    const offer2Text = document.createElement('div');
    offer2Text.innerHTML =
      '<strong>320% de bônus</strong> exclusivo para assinantes Clube Azul, ganhe <strong>4,2x</strong> mais pontos.';
    offer2Text.style.cssText =
      'font-family: Arial; font-weight: 400; font-size: 15px; line-height: 22px; color: #FFFFFF;';

    offer2.appendChild(icon2);
    offer2.appendChild(offer2Text);

    // Oferta 3
    const offer3 = document.createElement('div');
    offer3.style.cssText =
      'display: flex; flex-direction: row; align-items: flex-start; gap: 12px;';

    const icon3 = createIcon3();
    icon3.style.cssText = 'flex-shrink: 0;';

    const offer3Text = document.createElement('div');
    offer3Text.innerHTML =
      'Aproveite trechos a partir de <strong>3.600 pontos</strong> e voe mais!';
    offer3Text.style.cssText =
      'font-family: Arial; font-weight: 400; font-size: 15px; line-height: 22px; color: #FFFFFF;';

    offer3.appendChild(icon3);
    offer3.appendChild(offer3Text);

    offersList.appendChild(offer1);
    offersList.appendChild(offer2);
    offersList.appendChild(offer3);

    // Disclaimer
    const disclaimer = document.createElement('div');
    disclaimer.style.cssText =
      'display: flex; flex-direction: row; align-items: center; gap: 8px; width: 415px; height: 20px;';

    const disclaimerText = document.createElement('div');
    disclaimerText.textContent = '*Oferta válida enquanto durarem as condições promocionais.';
    disclaimerText.style.cssText =
      'width: 401.36px; height: 20.5px; font-family: Arial; font-weight: 400; font-size: 10px; line-height: 20px; color: #FFFFFF;';

    disclaimer.appendChild(disclaimerText);

    // Botão CTA
    const ctaButton = document.createElement('button');
    ctaButton.type = 'button';
    ctaButton.textContent = 'APROVEITAR OFERTA AGORA';
    ctaButton.style.cssText =
      'width: 472px; height: 56px; background: #F50955; box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1); border-radius: 24px; border: none; font-family: "Helvetica Neue", Arial; font-weight: 700; font-size: 16px; line-height: 24px; text-align: center; color: #FFFFFF; cursor: pointer;';

    ctaButton.addEventListener('click', function () {
      window.open('https://compradepontos.voeazul.com.br/', '_blank');
      closeModal();
    });

    // Link continuar navegando
    const continueLink = document.createElement('button');
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

    // Atualizar countdown imediatamente
    updateModalCountdown();

    // Configurar intervalo para atualizar countdown a cada segundo
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(function () {
      updateModalCountdown();
    }, 1000);

    modalCreated = true;
    console.log('Modal Azul Friday criado com sucesso');
  }

  // Função para fechar o modal
  function closeModal() {
    const overlay = document.querySelector('[data-modal-overlay]');
    const modal = document.querySelector('[data-modal]');

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

        // Limpar intervalo do countdown
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }

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
    const shownThisSession = sessionStorage.getItem('azul-friday-modal-shown');
    if (shownThisSession === 'true') {
      console.log('Modal já foi exibido nesta sessão');
      return false;
    }

    // Regra 2: Verificar limite diário (máximo 3 sessões por dia)
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('azul-friday-modal-last-date');
    let dailyCount = parseInt(localStorage.getItem('azul-friday-modal-daily-count') || '0', 10);

    // Se é um novo dia, resetar contador
    if (lastShownDate !== today) {
      dailyCount = 0;
      localStorage.setItem('azul-friday-modal-daily-count', '0');
      localStorage.setItem('azul-friday-modal-last-date', today);
    }

    // Verificar se atingiu limite diário
    if (dailyCount >= 3) {
      console.log('Modal já foi exibido 3 vezes hoje');
      return false;
    }

    return true;
  }

  // Função para registrar que o modal foi exibido
  function registerModalShown() {
    // Marcar como exibido nesta sessão
    sessionStorage.setItem('azul-friday-modal-shown', 'true');

    // Incrementar contador diário
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('azul-friday-modal-last-date');
    let dailyCount = parseInt(localStorage.getItem('azul-friday-modal-daily-count') || '0', 10);

    // Se é um novo dia, resetar contador
    if (lastShownDate !== today) {
      dailyCount = 0;
    }

    dailyCount = dailyCount + 1;
    localStorage.setItem('azul-friday-modal-daily-count', String(dailyCount));
    localStorage.setItem('azul-friday-modal-last-date', today);

    console.log('Modal registrado. Exibições hoje: ' + dailyCount + ' | Sessão marcada');
  }

  // Função para tentar exibir o modal
  function tryShowModal(trigger) {
    // Verificar se o modal já existe no DOM
    const existingModal = document.querySelector('[data-modal-overlay]');
    if (existingModal || modalCreated) {
      console.log('Modal já está aberto');
      return;
    }

    // Verificar se pode exibir
    if (!canShowModal()) {
      return;
    }

    console.log('Exibindo modal via: ' + trigger);
    createModal();
    registerModalShown();
  }

  // Função de debug para limpar dados (pode ser chamada no console)
  window.clearAzulFridayModalData = function () {
    sessionStorage.removeItem('azul-friday-modal-shown');
    localStorage.removeItem('azul-friday-modal-last-date');
    localStorage.removeItem('azul-friday-modal-daily-count');
    console.log('Dados do modal limpos. Recarregue a página para testar.');
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
    console.log('Inicializando modal Azul Friday...');

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
