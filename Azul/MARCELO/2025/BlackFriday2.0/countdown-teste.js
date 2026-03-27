// ============================================
// CONFIGURAÇÃO DA DATA FINAL DO COUNTDOWN
// ============================================
// Formato: 'YYYY-MM-DD HH:MM:SS' (horário de Brasília)
//
// LÓGICA DE RENOVAÇÃO:
// - FASE 1: Conta até 27/11 às 23:59:59
// - Renovação 1: 28/11 às 00:00:00 (automaticamente muda para FASE 2)
// - FASE 2: Conta até 30/11 às 23:59:59
// - Renovação 2: 01/12 às 00:00:00 (automaticamente muda para FASE 3)
// - FASE 3: Conta até 04/12 às 23:59:59
//
(function () {
  // Constantes de configuração (dentro da IIFE para evitar conflitos)
  const COUNTDOWN_END_DATE_PHASE_1 = '2025-11-27 23:59:59'; // FASE 1 termina em 27/11 às 23:59:59
  const RENEWAL_DATE_PHASE_1 = '2025-11-28 00:00:00'; // Renovação 1 em 28/11 à meia-noite
  const COUNTDOWN_END_DATE_PHASE_2 = '2025-11-30 23:59:59'; // FASE 2 termina em 30/11 às 23:59:59
  const RENEWAL_DATE_PHASE_2 = '2025-12-01 00:00:00'; // Renovação 2 em 01/12 à meia-noite
  const COUNTDOWN_END_DATE_PHASE_3 = '2025-12-04 23:59:59'; // FASE 3 termina em 04/12 às 23:59:59
  // Função para obter data atual em Brasília
  function getBrasiliaTime() {
    const now = new Date();
    // Converter para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60; // -3 horas em minutos
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 60000);
    return brasiliaTime;
  }

  // Função para criar data em Brasília a partir de string
  function createBrasiliaDate(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    // Criar data em UTC e ajustar para Brasília
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60;
    const utc = date.getTime() - brasiliaOffset * 60000;
    return new Date(utc);
  }

  // Função para criar data final em Brasília (com renovação)
  function getEndDate() {
    const now = getBrasiliaTime();
    const renewalDate1 = createBrasiliaDate(RENEWAL_DATE_PHASE_1);
    const renewalDate2 = createBrasiliaDate(RENEWAL_DATE_PHASE_2);
    const phase1EndDate = createBrasiliaDate(COUNTDOWN_END_DATE_PHASE_1);
    const phase2EndDate = createBrasiliaDate(COUNTDOWN_END_DATE_PHASE_2);
    const phase3EndDate = createBrasiliaDate(COUNTDOWN_END_DATE_PHASE_3);

    // Se já passou ou chegou na segunda renovação, usar a FASE 3
    if (now >= renewalDate2) {
      return phase3EndDate;
    }
    // Se já passou ou chegou na primeira renovação, usar a FASE 2
    else if (now >= renewalDate1) {
      return phase2EndDate;
    }
    // Antes da primeira renovação, usar a FASE 1
    else {
      return phase1EndDate;
    }
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

  // Função para criar o SVG do selo "OFERTAS ANTECIPADAS"
  function createSeloSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '114');
    svg.setAttribute('height', '66');
    svg.setAttribute('viewBox', '0 0 114 66');
    svg.setAttribute('fill', 'none');

    // Paths do SVG
    const paths = [
      {
        d: 'M101.139 11.1875H91.385V27.1391C91.385 32.4173 88.1704 33.7959 86.0491 33.7959C82.9513 33.7959 81.2295 32.4174 81.2295 28.457V11.1875H71.478V29.0901C71.478 36.8919 73.9428 41.8266 82.4933 41.8266C85.9346 41.8266 89.7216 39.9318 91.5556 36.8919H91.6746V40.9668H101.139V11.1897V11.1875Z',
        fill: '#00043E',
      },
      {
        d: 'M103.434 40.9667H113.186V0H103.434V40.9667ZM42.1643 40.9667H70.5028V33.5107H54.5579L69.4163 18.5896V11.1897H43.372V18.6502H57.0249L42.1665 33.3962V40.9689L42.1643 40.9667ZM0 40.9667H10.9569L13.5407 33.6229H27.8244L30.3476 40.9667H41.4751L26.1588 0.00224046H15.3163L0 40.9667ZM20.6523 11.3603H20.769L25.299 25.7044H16.0055L20.6523 11.3603Z',
        fill: '#00043E',
      },
      {
        d: 'M0.171387 47.1312H16.9199V50.7009H5.26486V54.796H16.1859V58.3657H5.26486V65.8757H0.171387V47.1289V47.1312Z',
        fill: 'white',
      },
      {
        d: 'M19.6523 47.1309H33.2761C38.4728 47.1309 39.3393 50.3077 39.3393 52.225C39.3393 54.5083 38.4212 55.9789 36.2931 56.74V56.7916C38.5245 57.1329 38.8657 59.9685 38.8657 61.8072C38.8657 62.7255 38.9442 64.9324 39.8377 65.8776H34.2728C33.7991 65.011 33.7744 64.2499 33.7744 62.2809C33.7744 59.6564 32.6453 58.9986 31.0717 58.9986H24.7458V65.8776H19.6523V47.1309ZM24.7458 55.4266H31.4915C32.6206 55.4266 33.9338 54.7957 33.9338 53.0378C33.9338 51.1743 32.4635 50.7006 31.2288 50.7006H24.7458V55.4266Z',
        fill: 'white',
      },
      {
        d: 'M42.5439 47.1309H47.6381V65.8776H42.5439V47.1309Z',
        fill: 'white',
      },
      {
        d: 'M51.7329 47.1309H63.4149C69.8463 47.1309 72.6298 50.86 72.6298 56.5042C72.6298 62.1485 69.743 65.8776 63.8616 65.8776H51.7329V47.1309ZM56.8264 62.3056H62.4968C65.8573 62.3056 67.3792 60.285 67.3792 56.3201C67.3792 52.8537 65.9089 50.7006 62.0231 50.7006H56.8241V62.3056H56.8264Z',
        fill: 'white',
      },
      {
        d: 'M88.4861 62.0182H79.875L78.353 65.8776H72.8667L81.1096 47.1309H87.2514L95.4944 65.8776H90.0081L88.4861 62.0182ZM84.1805 51.1743L81.2399 58.6034H87.1212L84.1805 51.1743Z',
        fill: 'white',
      },
      {
        d: 'M99.7763 59.3398L91.4795 47.1309H97.4641L102.32 55.2964L107.175 47.1309H113.16L104.863 59.3398V65.8776H99.7696V59.3398H99.7763Z',
        fill: 'white',
      },
    ];

    paths.forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData.d);
      path.setAttribute('fill', pathData.fill);
      svg.appendChild(path);
    });

    return svg;
  }

  // Função para encontrar o container dos mini-banners
  function findBannerButton() {
    // Buscar o container que contém os mini-banners
    const containers = document.querySelectorAll('.container-capsule.containerDefault.css-oo7lgl');

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      // Verificar se contém a grid de mini-banners
      const miniBannersGrid = container.querySelector('.mini-banners-grid');
      if (miniBannersGrid) {
        // Retornar o container principal
        return container;
      }
    }
    return null;
  }

  // Função para criar o banner do countdown
  function createCountdownBanner() {
    // Verificar se o banner já existe
    if (document.getElementById('azul-friday-countdown-fullwidth')) {
      return;
    }

    // Encontrar o button do banner
    const bannerButton = findBannerButton();
    if (!bannerButton) {
      setTimeout(createCountdownBanner, 500);
      return;
    }

    // Container principal que ocupa toda a largura
    const banner = document.createElement('div');
    banner.id = 'azul-friday-countdown-fullwidth';
    banner.style.cssText =
      'width: 100%;' +
      'height: 148px;' +
      'background: linear-gradient(0deg, #D8F9FF -63%, #6BD1E3 -19.01%, #56C3E5 24.97%, #008BC4 68.96%, #0061A0 112.95%);' +
      'border-radius: 0px;' +
      'margin: 0;' +
      'padding: 0;' +
      'position: relative;' +
      'overflow: hidden;';

    // Container interno com o conteúdo centralizado
    const innerContainer = document.createElement('div');
    innerContainer.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'justify-content: center;' +
      'align-items: center;' +
      'padding: 29px 30px;' +
      'gap: 172px;' +
      'width: 100%;' +
      'max-width: 1440px;' +
      'height: 148px;' +
      'margin: 0 auto;' +
      'position: relative;' +
      'isolation: isolate;';

    // Container do conteúdo (selo + texto/countdown)
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'align-items: center;' +
      'padding: 0px;' +
      'gap: 80px;' +
      'height: 84px;' +
      'z-index: 1;' +
      'width: 100%;' +
      'max-width: 825px;';

    // Selo "OFERTAS ANTECIPADAS"
    const seloContainer = document.createElement('div');
    seloContainer.style.cssText = 'width: 114px;' + 'height: 66px;' + 'flex: none;';
    const seloSvg = createSeloSvg();
    seloContainer.appendChild(seloSvg);

    // Container do texto "Termina em:" + countdown
    const textCountdownContainer = document.createElement('div');
    textCountdownContainer.setAttribute('data-text-countdown-container', 'true');
    textCountdownContainer.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'align-items: center;' +
      'padding: 0px;' +
      'gap: 24px;' +
      'height: 84px;';

    // Grupo "Termina em:" com ícone
    const terminaEmGroup = document.createElement('div');
    terminaEmGroup.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'align-items: center;' +
      'gap: 10px;' +
      'width: 275px;' +
      'height: 44px;';

    // Ícone de relógio
    const clockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    clockIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clockIcon.setAttribute('width', '44');
    clockIcon.setAttribute('height', '44');
    clockIcon.setAttribute('viewBox', '0 0 44 44');
    clockIcon.setAttribute('fill', 'none');

    const clockPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    clockPath1.setAttribute('d', 'M22 11V22L29.3333 25.6667');
    clockPath1.setAttribute('stroke', 'white');
    clockPath1.setAttribute('stroke-width', '2.66667');
    clockPath1.setAttribute('stroke-linecap', 'round');
    clockPath1.setAttribute('stroke-linejoin', 'round');

    const clockPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    clockPath2.setAttribute(
      'd',
      'M22.0003 40.3333C32.1255 40.3333 40.3337 32.1252 40.3337 22C40.3337 11.8747 32.1255 3.66663 22.0003 3.66663C11.8751 3.66663 3.66699 11.8747 3.66699 22C3.66699 32.1252 11.8751 40.3333 22.0003 40.3333Z'
    );
    clockPath2.setAttribute('stroke', 'white');
    clockPath2.setAttribute('stroke-width', '2.66667');
    clockPath2.setAttribute('stroke-linecap', 'round');
    clockPath2.setAttribute('stroke-linejoin', 'round');

    clockIcon.appendChild(clockPath1);
    clockIcon.appendChild(clockPath2);

    // Texto "Termina em:"
    const terminaEmText = document.createElement('span');
    terminaEmText.textContent = 'Termina em:';
    terminaEmText.style.cssText =
      'font-family: Arial, sans-serif;' +
      'font-style: normal;' +
      'font-weight: 700;' +
      'font-size: 36px;' +
      'line-height: 41px;' +
      'color: #FFFFFF;';

    terminaEmGroup.appendChild(clockIcon);
    terminaEmGroup.appendChild(terminaEmText);

    // Container do countdown
    const countdownContainer = document.createElement('div');
    countdownContainer.id = 'countdown-display-fullwidth';
    countdownContainer.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'align-items: center;' +
      'padding: 0px 2px;' +
      'gap: 16px;' +
      'width: 332px;' +
      'height: 84px;' +
      'border-radius: 0px;';

    // Montar a estrutura
    textCountdownContainer.appendChild(terminaEmGroup);
    textCountdownContainer.appendChild(countdownContainer);

    contentContainer.appendChild(seloContainer);
    contentContainer.appendChild(textCountdownContainer);

    innerContainer.appendChild(contentContainer);
    banner.appendChild(innerContainer);

    // Inserir o banner após o container dos mini-banners
    if (bannerButton && bannerButton.parentElement) {
      bannerButton.parentElement.insertBefore(banner, bannerButton.nextSibling);
    }

    // Atualizar countdown
    updateCountdown();
  }

  // Função para atualizar o countdown
  function updateCountdown() {
    const countdownContainer = document.getElementById('countdown-display-fullwidth');
    if (!countdownContainer) {
      return;
    }

    const time = calculateTimeRemaining();
    const isMobile = window.innerWidth < 768;

    if (time.expired) {
      countdownContainer.innerHTML =
        '<div style="color: white; font-size: 20px; font-weight: 700;">' +
        'Oferta encerrada' +
        '</div>';
      return;
    }

    // Criar boxes para cada unidade de tempo
    const timeUnits = [
      { value: time.days, label: 'Dias' },
      { value: time.hours, label: 'Horas' },
      { value: time.minutes, label: 'Min' },
      { value: time.seconds, label: 'Seg' },
    ];

    countdownContainer.innerHTML = '';

    // Tamanhos baseados no dispositivo
    const boxWidth = isMobile ? '60px' : '70px';
    const boxHeight = isMobile ? '60px' : '60px';
    const wrapperHeight = isMobile ? '84px' : '84px';
    const labelTop = isMobile ? '68px' : '68px';

    timeUnits.forEach((unit) => {
      // Container wrapper para cada unidade de tempo
      const unitWrapper = document.createElement('div');
      unitWrapper.style.cssText =
        'width: ' +
        boxWidth +
        ';' +
        'height: ' +
        wrapperHeight +
        ';' +
        'border-radius: 0px;' +
        'display: flex;' +
        'flex-direction: column;' +
        'align-items: center;' +
        'position: relative;';

      // Box do número
      const numberBox = document.createElement('div');
      numberBox.style.cssText =
        'position: absolute;' +
        'width: ' +
        boxWidth +
        ';' +
        'height: ' +
        boxHeight +
        ';' +
        'left: 0px;' +
        'top: 0px;' +
        'background: rgba(0, 122, 174, 0.25);' +
        'box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1);' +
        'border-radius: 14px;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;';

      const value = document.createElement('div');
      value.textContent = String(unit.value).padStart(2, '0');
      value.style.cssText =
        'font-family: Arial, sans-serif;' +
        'font-style: normal;' +
        'font-weight: 700;' +
        'font-size: 30px;' +
        'line-height: 36px;' +
        'text-align: center;' +
        'letter-spacing: 0.395508px;' +
        'color: #FFFFFF;';

      // Label em div separada (abaixo do box)
      const label = document.createElement('div');
      label.textContent = unit.label;
      label.style.cssText =
        'position: absolute;' +
        'top: ' +
        labelTop +
        ';' +
        'font-family: Arial, sans-serif;' +
        'font-style: normal;' +
        'font-weight: 400;' +
        'font-size: 12px;' +
        'line-height: 16px;' +
        'text-align: center;' +
        'text-transform: capitalize;' +
        'color: #FFFFFF;';

      numberBox.appendChild(value);
      unitWrapper.appendChild(numberBox);
      unitWrapper.appendChild(label);
      countdownContainer.appendChild(unitWrapper);
    });

    // Aplicar estilos responsivos após criar os elementos
    applyResponsiveStyles();
  }

  // Função para aplicar estilos responsivos
  function applyResponsiveStyles() {
    const banner = document.getElementById('azul-friday-countdown-fullwidth');
    if (!banner) return;

    const isMobile = window.innerWidth < 768;
    const innerContainer = banner.querySelector('div');
    const contentContainer = innerContainer ? innerContainer.querySelector('div') : null;
    const seloContainer = contentContainer
      ? contentContainer.querySelector('div:first-child')
      : null;
    const textCountdownContainer = banner.querySelector('[data-text-countdown-container="true"]');
    const terminaEmGroup = textCountdownContainer
      ? textCountdownContainer.querySelector('div:first-child')
      : null;
    const countdownContainer = document.getElementById('countdown-display-fullwidth');

    if (isMobile) {
      // Banner mobile - sem max-width
      banner.style.setProperty('width', '100%', 'important');
      banner.style.removeProperty('max-width');
      banner.style.setProperty('height', 'auto', 'important');
      banner.style.setProperty('min-height', '294px', 'important');
      banner.style.setProperty('margin', '0', 'important');
      banner.style.setProperty('top', '-6px', 'important');

      // Container interno mobile - tudo em coluna
      if (innerContainer) {
        innerContainer.style.setProperty('flex-direction', 'column', 'important');
        innerContainer.style.setProperty('align-items', 'center', 'important');
        innerContainer.style.setProperty('justify-content', 'center', 'important');
        innerContainer.style.setProperty('padding', '32px 0px', 'important');
        innerContainer.style.setProperty('gap', '24px', 'important');
        innerContainer.style.setProperty('width', '100%', 'important');
        innerContainer.style.removeProperty('max-width');
        innerContainer.style.setProperty('height', 'auto', 'important');
        innerContainer.style.setProperty('min-height', '294px', 'important');
      }

      // Container de conteúdo mobile - tudo em coluna
      if (contentContainer) {
        contentContainer.style.setProperty('flex-direction', 'column', 'important');
        contentContainer.style.setProperty('align-items', 'center', 'important');
        contentContainer.style.setProperty('gap', '24px', 'important');
        contentContainer.style.setProperty('width', '100%', 'important');
        contentContainer.style.setProperty('height', 'auto', 'important');
      }

      // Container texto + countdown - em coluna
      if (textCountdownContainer) {
        textCountdownContainer.style.setProperty('flex-direction', 'column', 'important');
        textCountdownContainer.style.setProperty('align-items', 'center', 'important');
        textCountdownContainer.style.setProperty('gap', '24px', 'important');
        textCountdownContainer.style.setProperty('width', '100%', 'important');
        textCountdownContainer.style.setProperty('height', 'auto', 'important');
      }

      // Selo mobile
      if (seloContainer) {
        seloContainer.style.setProperty('width', '113.19px', 'important');
        seloContainer.style.setProperty('height', '65.88px', 'important');
      }

      // Grupo "Termina em:" mobile
      if (terminaEmGroup) {
        terminaEmGroup.style.setProperty('display', 'flex', 'important');
        terminaEmGroup.style.setProperty('align-items', 'center', 'important');
        terminaEmGroup.style.setProperty('flex-direction', 'row', 'important');
        terminaEmGroup.style.setProperty('gap', '16px', 'important');
        terminaEmGroup.style.setProperty('height', '32px', 'important');
        terminaEmGroup.style.setProperty('justify-content', 'center', 'important');
        terminaEmGroup.style.setProperty('width', '200px', 'important');

        const clockIcon = terminaEmGroup.querySelector('svg');
        if (clockIcon) {
          clockIcon.setAttribute('width', '32');
          clockIcon.setAttribute('height', '32');
        }

        const terminaEmText = terminaEmGroup.querySelector('span');
        if (terminaEmText) {
          terminaEmText.style.setProperty('font-size', '24px', 'important');
          terminaEmText.style.setProperty('line-height', '28px', 'important');
        }
      }

      // Countdown container mobile
      if (countdownContainer) {
        countdownContainer.style.setProperty('width', '288px', 'important');
        countdownContainer.style.setProperty('height', '84px', 'important');
        countdownContainer.style.setProperty('gap', '16px', 'important');
        countdownContainer.style.setProperty('justify-content', 'center', 'important');
        countdownContainer.style.setProperty('flex-direction', 'row', 'important');
      }
    } else {
      // Desktop - resetar estilos
      banner.style.setProperty('width', '100%', 'important');
      banner.style.setProperty('max-width', 'none', 'important');
      banner.style.setProperty('height', '148px', 'important');
      banner.style.setProperty('min-height', '148px', 'important');
      banner.style.setProperty('margin', '0', 'important');
      banner.style.setProperty('top', '-8px', 'important');

      if (innerContainer) {
        innerContainer.style.setProperty('flex-direction', 'row', 'important');
        innerContainer.style.setProperty('gap', '172px', 'important');
        innerContainer.style.setProperty('padding', '29px 30px', 'important');
        innerContainer.style.setProperty('max-width', '1440px', 'important');
        innerContainer.style.setProperty('height', '148px', 'important');
        innerContainer.style.setProperty('min-height', '148px', 'important');
      }

      if (contentContainer) {
        contentContainer.style.setProperty('display', 'flex', 'important');
        contentContainer.style.setProperty('flex-direction', 'row', 'important');
        contentContainer.style.setProperty('align-items', 'center', 'important');
        contentContainer.style.setProperty('padding', '0px', 'important');
        contentContainer.style.setProperty('gap', '80px', 'important');
        contentContainer.style.setProperty('height', '84px', 'important');
        contentContainer.style.setProperty('z-index', '1', 'important');
        contentContainer.style.setProperty('width', '100%', 'important');
        contentContainer.style.setProperty('max-width', '825px', 'important');
      }

      // Container texto + countdown - em linha no desktop
      if (textCountdownContainer) {
        textCountdownContainer.style.setProperty('flex-direction', 'row', 'important');
        textCountdownContainer.style.setProperty('align-items', 'center', 'important');
        textCountdownContainer.style.setProperty('gap', '24px', 'important');
        textCountdownContainer.style.setProperty('height', '84px', 'important');
      }

      if (seloContainer) {
        seloContainer.style.setProperty('width', '114px', 'important');
        seloContainer.style.setProperty('height', '66px', 'important');
      }

      if (terminaEmGroup) {
        terminaEmGroup.style.setProperty('width', '275px', 'important');
        terminaEmGroup.style.setProperty('height', '44px', 'important');
        terminaEmGroup.style.setProperty('gap', '10px', 'important');

        const clockIcon = terminaEmGroup.querySelector('svg');
        if (clockIcon) {
          clockIcon.setAttribute('width', '44');
          clockIcon.setAttribute('height', '44');
        }

        const terminaEmText = terminaEmGroup.querySelector('span');
        if (terminaEmText) {
          terminaEmText.style.setProperty('font-size', '36px', 'important');
          terminaEmText.style.setProperty('line-height', '41px', 'important');
        }
      }

      if (countdownContainer) {
        countdownContainer.style.setProperty('width', '332px', 'important');
        countdownContainer.style.setProperty('height', '84px', 'important');
        countdownContainer.style.setProperty('gap', '16px', 'important');
      }
    }
  }

  // Função para inicializar
  function init() {
    createCountdownBanner();

    // Atualizar a cada segundo
    setInterval(() => {
      updateCountdown();
    }, 1000);

    // Adicionar listener para resize da janela (responsividade)
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const wasMobile = lastWidth < 768;
        const isMobile = currentWidth < 768;

        // Se mudou de mobile para desktop ou vice-versa, recriar o countdown
        if (wasMobile !== isMobile) {
          updateCountdown();
        } else {
          applyResponsiveStyles();
        }

        lastWidth = currentWidth;
      }, 100);
    });

    // Aplicar estilos responsivos inicialmente
    applyResponsiveStyles();
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
