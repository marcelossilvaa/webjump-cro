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

  // Função para criar o SVG do logo Azul FRIDAY
  function createLogoSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '114');
    svg.setAttribute('height', '66');
    svg.setAttribute('viewBox', '0 0 114 66');
    svg.setAttribute('fill', 'none');

    const paths = [
      {
        d: 'M101.139 11.1875H91.3855V27.1391C91.3855 32.4173 88.1709 33.7959 86.0496 33.7959C82.9517 33.7959 81.23 32.4174 81.23 28.457V11.1875H71.4785V29.0901C71.4785 36.8919 73.9433 41.8266 82.4938 41.8266C85.9351 41.8266 89.7221 39.9318 91.5561 36.8919H91.6751V40.9668H101.139V11.1897V11.1875Z',
        fill: '#00043E',
      },
      {
        d: 'M103.434 40.9667H113.186V0H103.434V40.9667ZM42.1643 40.9667H70.5028V33.5107H54.5579L69.4163 18.5896V11.1897H43.372V18.6502H57.0249L42.1665 33.3962V40.9689L42.1643 40.9667ZM0 40.9667H10.9569L13.5407 33.6229H27.8244L30.3476 40.9667H41.4751L26.1588 0.00224046H15.3163L0 40.9667ZM20.6523 11.3603H20.769L25.299 25.7044H16.0055L20.6523 11.3603Z',
        fill: '#00043E',
      },
      {
        d: 'M0.170898 47.1312H16.9194V50.7009H5.26437V54.796H16.1854V58.3657H5.26437V65.8757H0.170898V47.1289V47.1312Z',
        fill: 'white',
      },
      {
        d: 'M19.6523 47.1309H33.2761C38.4728 47.1309 39.3393 50.3077 39.3393 52.225C39.3393 54.5083 38.4212 55.9789 36.2931 56.74V56.7916C38.5245 57.1329 38.8657 59.9685 38.8657 61.8072C38.8657 62.7255 38.9442 64.9324 39.8377 65.8776H34.2728C33.7991 65.011 33.7744 64.2499 33.7744 62.2809C33.7744 59.6564 32.6453 58.9986 31.0717 58.9986H24.7458V65.8776H19.6523V47.1309ZM24.7458 55.4266H31.4915C32.6206 55.4266 33.9338 54.7957 33.9338 53.0378C33.9338 51.1743 32.4635 50.7006 31.2288 50.7006H24.7458V55.4266Z',
        fill: 'white',
      },
      {
        d: 'M42.543 47.1309H47.6371V65.8776H42.543V47.1309Z',
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
        d: 'M99.7753 59.3398L91.4785 47.1309H97.4632L102.319 55.2964L107.174 47.1309H113.159L104.862 59.3398V65.8776H99.7686V59.3398H99.7753Z',
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

  // Função para detectar qual LP está sendo usada
  function detectLandingPage() {
    const pathname = window.location.pathname;

    if (pathname.includes('/azul-friday/pontos')) {
      return 'pontos';
    } else if (pathname.includes('/azul-friday/viagem-completa')) {
      return 'viagem-completa';
    } else if (pathname.includes('/azul-friday/passagens')) {
      return 'passagens';
    } else if (pathname.includes('/azul-friday')) {
      return 'default'; // LP principal
    }

    return 'default';
  }

  // Função para obter os padrões de imagens baseado na LP
  function getImagePatterns(lpType) {
    const patterns = {
      default: ['header-geral-mobile.png', 'header-geral-desktop.png'],
      pontos: ['header-esfera-mob.png', 'header-esfera-desk.png'],
      'viagem-completa': ['header-azv-35-mobile.png', 'header-azv-35-desktop.png'],
      passagens: ['header-nordeste-mobile.png', 'header-nordeste-desktop.png'],
    };

    return patterns[lpType] || patterns['default'];
  }

  // Função para encontrar o container do header
  function findHeaderContainer() {
    const lpType = detectLandingPage();
    const imagePatterns = getImagePatterns(lpType);

    // Buscar todos os containers
    const containers = document.querySelectorAll('.container-capsule.containerDefault');

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      // Verificar se contém um botão com as imagens específicas da LP
      const button = container.querySelector('button');
      if (button) {
        const images = button.querySelectorAll('img');
        const hasHeaderImages = Array.from(images).some((img) =>
          imagePatterns.some((pattern) => img.src.includes(pattern))
        );
        if (hasHeaderImages) {
          return container;
        }
      }
    }
    return null;
  }

  // Função para aplicar estilos responsivos no mobile
  function applyResponsiveStyles() {
    const banner = document.getElementById('azul-friday-countdown');
    const textContainer = banner
      ? banner.querySelector('[data-countdown-text-container="true"]')
      : null;

    if (!banner) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Estilos para mobile no banner
      banner.style.setProperty('flex-direction', 'column', 'important');
      banner.style.setProperty('gap', '10px', 'important');
      banner.style.setProperty('margin', '15px auto 20px auto', 'important');
      banner.style.setProperty('align-items', 'center', 'important');
      banner.style.setProperty('justify-content', 'center', 'important');

      // Estilos para mobile no textContainer
      if (textContainer) {
        textContainer.style.setProperty('max-width', '240px', 'important');
      }
    } else {
      // Estilos para desktop no banner
      banner.style.setProperty('flex-direction', 'row', 'important');
      banner.style.setProperty('gap', '0', 'important');
      banner.style.setProperty('margin', '0px auto 20px auto', 'important');
      banner.style.setProperty('justify-content', 'space-between', 'important');

      // Estilos para desktop no textContainer
      if (textContainer) {
        textContainer.style.removeProperty('max-width');
      }
    }
  }

  // Função para criar o banner do countdown
  function createCountdownBanner() {
    // Verificar se o banner já existe
    if (document.getElementById('azul-friday-countdown')) {
      return;
    }

    // Encontrar o container do header
    const headerContainer = findHeaderContainer();
    if (!headerContainer) {
      setTimeout(createCountdownBanner, 500);
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'azul-friday-countdown';
    banner.style.cssText =
      'width: 100%;' +
      'border: 0px;' +
      'margin: 0px auto 20px auto;' +
      'padding: 20px 24px;' +
      'border-radius: 16px;' +
      'background: linear-gradient(0deg, #D8F9FF -63%, #6BD1E3 -19.01%, #56C3E5 24.97%, #008BC4 68.96%, #0061A0 112.95%);' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: space-between;' +
      'box-shadow: 0 4px 8px rgba(0,0,0,0.3);';

    // Lado esquerdo: Logo
    const leftSection = document.createElement('div');
    leftSection.style.cssText = 'display: flex;' + 'align-items: center;' + 'gap: 20px;';

    // Container do logo
    const logoContainer = document.createElement('div');
    logoContainer.style.cssText = 'display: flex;' + 'align-items: center;';
    const logoSvg = createLogoSvg();
    logoSvg.style.cssText = 'height: 66px; width: auto;';
    logoContainer.appendChild(logoSvg);

    leftSection.appendChild(logoContainer);

    // Texto "Ofertas por tempo limitado!" (agora diretamente no banner)
    const textContainer = document.createElement('div');
    textContainer.setAttribute('data-countdown-text-container', 'true');
    textContainer.style.cssText = 'display: flex;' + 'align-items: center;' + 'gap: 12px;';

    // Ícone de relógio (SVG)
    const clockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    clockIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clockIcon.setAttribute('width', '44');
    clockIcon.setAttribute('height', '44');
    clockIcon.setAttribute('viewBox', '0 0 44 44');
    clockIcon.setAttribute('fill', 'none');
    clockIcon.style.setProperty('min-width', '44px', 'important');

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

    const text = document.createElement('span');
    text.textContent = 'Ofertas por tempo limitado!';
    text.style.cssText =
      'color: white;' + 'font-size: 24px;' + 'font-weight: 700;' + 'font-family: sans-serif;';

    textContainer.appendChild(clockIcon);
    textContainer.appendChild(text);

    // Lado direito: Countdown
    const countdownContainer = document.createElement('div');
    countdownContainer.id = 'countdown-display';
    countdownContainer.style.cssText = 'display: flex;' + 'gap: 12px;';

    banner.appendChild(leftSection);
    banner.appendChild(textContainer);
    banner.appendChild(countdownContainer);

    // Encontrar a div vazia dentro do container do header para inserir o countdown
    // A estrutura varia por LP:
    // - default/pontos/passagens: container > div > button + div vazia
    // - viagem-completa: container > div > div + button (dentro de div) + div vazia
    const lpType = detectLandingPage();

    // Para viagem-completa, precisamos encontrar a div que CONTÉM o button
    // não a primeira div do container
    let containerInnerDiv;
    const button = headerContainer.querySelector('button');

    if (button) {
      // Para viagem-completa, o button está dentro de uma div
      // Precisamos inserir o countdown DENTRO da div do button, no FINAL (abaixo do button)
      if (lpType === 'viagem-completa') {
        const buttonParent = button.parentElement;
        if (buttonParent) {
          // Remover qualquer countdown existente (pode estar na posição errada)
          const existingCountdown = document.getElementById('azul-friday-countdown');
          if (existingCountdown) {
            existingCountdown.remove();
          }

          // Inserir o banner no FINAL da div do button (abaixo de tudo)
          // Isso garante que fique abaixo do button e de qualquer div vazia
          buttonParent.appendChild(banner);
        } else {
          // Fallback: inserir após o button
          const newDiv = document.createElement('div');
          newDiv.appendChild(banner);
          headerContainer.appendChild(newDiv);
        }
      } else {
        // Para outras LPs, usar a lógica original
        containerInnerDiv = headerContainer.querySelector('div');
        if (containerInnerDiv) {
          // Para outras LPs, encontrar a div vazia que vem após o button
          let nextDiv = button.nextElementSibling;
          while (nextDiv && nextDiv.tagName !== 'DIV') {
            nextDiv = nextDiv.nextElementSibling;
          }
          if (nextDiv) {
            // Inserir o banner dentro da div vazia
            nextDiv.appendChild(banner);
          } else {
            // Se não encontrar, criar uma nova div e inserir após o button
            const newDiv = document.createElement('div');
            newDiv.appendChild(banner);
            containerInnerDiv.appendChild(newDiv);
          }
        } else {
          // Fallback: inserir após o container do header
          if (headerContainer.parentElement) {
            headerContainer.parentElement.insertBefore(banner, headerContainer.nextSibling);
          } else {
            headerContainer.appendChild(banner);
          }
        }
      }
    } else {
      // Fallback: inserir após o container do header se não encontrar button
      if (headerContainer.parentElement) {
        headerContainer.parentElement.insertBefore(banner, headerContainer.nextSibling);
      } else {
        headerContainer.appendChild(banner);
      }
    }

    // Atualizar countdown
    updateCountdown();

    // Aplicar estilos responsivos
    applyResponsiveStyles();
  }

  // Função para atualizar o countdown
  function updateCountdown() {
    const countdownContainer = document.getElementById('countdown-display');
    if (!countdownContainer) {
      return;
    }

    const time = calculateTimeRemaining();

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

    timeUnits.forEach((unit) => {
      // Container wrapper para cada unidade de tempo
      const unitWrapper = document.createElement('div');
      unitWrapper.style.cssText =
        'display: flex;' + 'flex-direction: column;' + 'align-items: center;' + 'gap: 8px;';

      // Box do número
      const numberBox = document.createElement('div');
      numberBox.style.cssText =
        'width: 70px;' +
        'height: 60px;' +
        'padding: 12px 16px;' +
        'border-radius: 14px;' +
        'background: rgba(0, 122, 174, 0.25);' +
        'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;';

      const value = document.createElement('div');
      value.textContent = String(unit.value).padStart(2, '0');
      value.style.cssText =
        'color: white;' +
        'font-size: 30px;' +
        'font-weight: 700;' +
        'font-family: sans-serif;' +
        'line-height: 1;';

      // Label em div separada (fora do box)
      const label = document.createElement('div');
      label.textContent = unit.label;
      label.style.cssText =
        'color: white;' +
        'font-size: 14px;' +
        'font-weight: 500;' +
        'font-family: sans-serif;' +
        'text-align: center;';

      numberBox.appendChild(value);
      unitWrapper.appendChild(numberBox);
      unitWrapper.appendChild(label);
      countdownContainer.appendChild(unitWrapper);
    });
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
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        applyResponsiveStyles();
      }, 100);
    });
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
