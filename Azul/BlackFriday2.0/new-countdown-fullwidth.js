// ============================================
// CONFIGURAÇÃO DA DATA FINAL DO COUNTDOWN
// ============================================
// Formato: 'YYYY-MM-DD HH:MM:SS' (horário de Brasília)
//
// Data final: 28/11/2025 às 23:59:59
//
(function () {
  // Configuração das fases do countdown (dentro da IIFE para evitar conflitos)
  // Fase 1: até 12/12/2025 23:59:59
  // Fase 2: de 13/12/2025 00:00:00 até 14/12/2025 23:59:59
  const PHASES = {
    phase1End: '2025-12-12 23:59:59',
    phase2Start: '2025-12-13 00:00:00',
    phase2End: '2025-12-14 23:59:59',
  };
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

  // Retorna informações da fase ativa (se houver)
  function getActivePhase() {
    const now = getBrasiliaTime();
    const phase1End = createBrasiliaDate(PHASES.phase1End);
    const phase2Start = createBrasiliaDate(PHASES.phase2Start);
    const phase2End = createBrasiliaDate(PHASES.phase2End);

    // Se ainda não passou da fase 1, usar fase 1
    if (now <= phase1End) {
      return { index: 1, endDate: phase1End };
    }

    // Se estiver dentro do intervalo da fase 2
    if (now >= phase2Start && now <= phase2End) {
      return { index: 2, endDate: phase2End };
    }

    // Nenhuma fase ativa (todas encerradas ou em intervalo entre fases)
    return null;
  }

  // Função para calcular diferença para a fase ativa
  function calculateTimeRemaining() {
    const now = getBrasiliaTime();
    const active = getActivePhase();

    if (!active || !active.endDate) {
      // Não há fase ativa
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const difference = active.endDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }

  // Função para criar o container da imagem do selo
  function createSeloImageContainer() {
    // Container interno para centralizar o selo
    const seloContainer = document.createElement('div');
    seloContainer.style.cssText =
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'width: auto;' +
      'height: auto;' +
      'z-index: 10;' +
      'margin-bottom: -68px;';

    // Imagem do selo rosa
    const seloImage = document.createElement('img');
    seloImage.src = 'https://i.imgur.com/hHa83vz.png';
    seloImage.alt = 'É POR POUCO TEMPO!';
    seloImage.style.cssText =
      'display: block;' +
      'width: auto;' +
      'height: auto;' +
      'max-width: 280px;' +
      'max-height: 120px;' +
      'object-fit: contain;';

    seloContainer.appendChild(seloImage);

    return seloContainer;
  }

  // createSeloSvg removed — SVG logo creation removed per request

  // Função para encontrar o button do banner (container específico css-pbbmh8)
  function findBannerButton() {
    const container = document.querySelector(
      '.container-capsule.containerDefaultNoPadding.css-pbbmh8'
    );
    if (!container) return null;
    return container.querySelector('button');
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
      'height: 200px;' +
      'background: linear-gradient(0deg, #D8F9FF -63%, #6BD1E3 -19.01%, #56C3E5 24.97%, #008BC4 68.96%, #0061A0 112.95%);' +
      'border-radius: 0px;' +
      'margin: 0;' +
      'padding: 0;' +
      'position: relative;' +
      'overflow: visible;';

    // Container interno com o conteúdo centralizado
    const innerContainer = document.createElement('div');
    innerContainer.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'justify-content: start;' +
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

  // Selo removido: o selo SVG não será inserido aqui (removido conforme solicitado)

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

  // Inserir apenas o grupo de texto + countdown (removida a logo)
  contentContainer.appendChild(textCountdownContainer);

    innerContainer.appendChild(contentContainer);
    banner.appendChild(innerContainer);

    // Criar wrapper que contém o selo rosa acima do banner
    const wrapperContainer = document.createElement('div');
    wrapperContainer.setAttribute('data-countdown-wrapper', 'true');
    wrapperContainer.style.cssText =
      'position: relative;' +
      'width: 100%;' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: center;' +
      'gap: 0px;';

    // Container da faixa rosa 100% width
    const faixaRosa = document.createElement('div');
    faixaRosa.setAttribute('data-pouco-tempo-selo', 'true');
    faixaRosa.style.cssText =
      'position: relative;' +
      'width: 100%;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'background: #cf527a;' +
      'padding: 5px 0px;' +
      'z-index: 10;' +
      'margin-bottom: -77px;';

    // Container da imagem do selo - irmão da faixa rosa
    const seloImageContainer = createSeloImageContainer();

    wrapperContainer.appendChild(faixaRosa);
    wrapperContainer.appendChild(seloImageContainer);
    wrapperContainer.appendChild(banner);

    // Encontrar a div vazia após o button ou criar uma nova
    let emptyDiv = bannerButton.nextElementSibling;

    // Se não houver uma div vazia, criar uma nova
    if (!emptyDiv || emptyDiv.tagName !== 'DIV') {
      emptyDiv = document.createElement('div');
      // Inserir a div vazia após o button
      if (bannerButton.parentElement) {
        bannerButton.parentElement.insertBefore(emptyDiv, bannerButton.nextSibling);
      } else {
        bannerButton.insertAdjacentElement('afterend', emptyDiv);
      }
    }

    // Inserir o wrapper dentro da div vazia
    emptyDiv.appendChild(wrapperContainer);

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
    const wrapperContainer = document.querySelector('[data-countdown-wrapper="true"]');
    if (!wrapperContainer) return;

    const banner = document.getElementById('azul-friday-countdown-fullwidth');
    if (!banner) return;

    const isMobile = window.innerWidth < 768;
    const poucoTempoSelo = wrapperContainer.querySelector('[data-pouco-tempo-selo="true"]');
    const seloImageContainer = poucoTempoSelo ? poucoTempoSelo.nextElementSibling : null;
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
      banner.style.setProperty('overflow', 'visible', 'important');

      // Container interno mobile - tudo em coluna (ajustado conforme solicitação)
      if (innerContainer) {
        innerContainer.style.setProperty('display', 'flex', 'important');
        innerContainer.style.setProperty('flex-direction', 'column', 'important');
        innerContainer.style.setProperty('justify-content', 'center', 'important');
        innerContainer.style.setProperty('align-items', 'center', 'important');
        innerContainer.style.setProperty('padding', '32px 0px', 'important');
        innerContainer.style.setProperty('gap', '24px', 'important');
        innerContainer.style.setProperty('width', '100%', 'important');
        innerContainer.style.removeProperty('max-width');
        innerContainer.style.setProperty('height', 'auto', 'important');
        innerContainer.style.setProperty('margin', '0px auto', 'important');
        innerContainer.style.setProperty('position', 'relative', 'important');
        innerContainer.style.setProperty('isolation', 'isolate', 'important');
        innerContainer.style.setProperty('min-height', '250px', 'important');
      }

      // Container de conteúdo mobile - tudo em coluna
      if (contentContainer) {
        contentContainer.style.setProperty('flex-direction', 'column', 'important');
        contentContainer.style.setProperty('align-items', 'center', 'important');
        contentContainer.style.setProperty('gap', '24px', 'important');
        contentContainer.style.setProperty('width', '100%', 'important');
        contentContainer.style.setProperty('height', 'auto', 'important');
      }

      // Container texto + countdown - em coluna no mobile
      if (textCountdownContainer) {
        textCountdownContainer.style.setProperty('flex-direction', 'column', 'important');
        textCountdownContainer.style.setProperty('align-items', 'center', 'important');
        textCountdownContainer.style.setProperty('gap', '16px', 'important');
        textCountdownContainer.style.setProperty('width', '100%', 'important');
        textCountdownContainer.style.setProperty('height', 'auto', 'important');
      }

      // Selo rosa mobile - faixa 100% width acima do banner (ajustado)
      if (poucoTempoSelo) {
        poucoTempoSelo.style.setProperty('margin-bottom', '-76px', 'important');
        poucoTempoSelo.style.setProperty('padding', '2px 0px', 'important');
        poucoTempoSelo.style.setProperty('width', '100%', 'important');
      }

      // Container da imagem mobile
      if (seloImageContainer) {
        const seloImage = seloImageContainer.querySelector('img');
        if (seloImage) {
            seloImage.style.setProperty('max-width', '280px', 'important');
            seloImage.style.setProperty('max-height', '150px', 'important');
          }
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
      banner.style.setProperty('min-height', '200px', 'important');
      banner.style.setProperty('margin', '0', 'important');
      banner.style.setProperty('top', '-20px', 'important');
      banner.style.setProperty('overflow', 'visible', 'important');

      if (innerContainer) {
        innerContainer.style.setProperty('flex-direction', 'row', 'important');
        innerContainer.style.setProperty('gap', '172px', 'important');
        innerContainer.style.setProperty('padding', '29px 30px', 'important');
        innerContainer.style.setProperty('max-width', '1440px', 'important');
        innerContainer.style.setProperty('height', '148px', 'important');
        innerContainer.style.setProperty('min-height', '200px', 'important');
      }

      if (contentContainer) {
        contentContainer.style.setProperty('display', 'flex', 'important');
        contentContainer.style.setProperty('flex-direction', 'row', 'important');
        contentContainer.style.setProperty('align-items', 'center', 'important');
        contentContainer.style.setProperty('padding', '0px', 'important');
        contentContainer.style.setProperty('gap', '80px', 'important');
        contentContainer.style.setProperty('height', '84px', 'important');
        contentContainer.style.setProperty('z-index', '1', 'important');
        contentContainer.style.setProperty('width', '200px', 'important');
        contentContainer.style.setProperty('max-width', '825px', 'important');
      }

      // Container texto + countdown - em linha no desktop
      if (textCountdownContainer) {
        textCountdownContainer.style.setProperty('flex-direction', 'row', 'important');
        textCountdownContainer.style.setProperty('align-items', 'center', 'important');
        textCountdownContainer.style.setProperty('gap', '24px', 'important');
        textCountdownContainer.style.setProperty('height', '84px', 'important');
      }

      // Selo rosa desktop - faixa 100% width acima do banner
      if (poucoTempoSelo) {
        poucoTempoSelo.style.setProperty('margin-bottom', '-87px', 'important');
        poucoTempoSelo.style.setProperty('padding', '5px 0px', 'important');
        poucoTempoSelo.style.setProperty('width', '100%', 'important');
      }

      // Container da imagem desktop
      if (seloImageContainer) {
        // ajustar margem do container da imagem no desktop
        seloImageContainer.style.setProperty('margin-bottom', '-38px', 'important');
        const seloImage = seloImageContainer.querySelector('img');
        if (seloImage) {
          seloImage.style.setProperty('display', 'block', 'important');
          seloImage.style.setProperty('width', 'auto', 'important');
          seloImage.style.setProperty('height', 'auto', 'important');
          seloImage.style.setProperty('max-width', '300px', 'important');
          seloImage.style.setProperty('max-height', '145px', 'important');
          seloImage.style.setProperty('object-fit', 'contain', 'important');
        }
      }

      // if (seloContainer) {
      //   seloContainer.style.setProperty('width', '114px', 'important');
      //   seloContainer.style.setProperty('height', '66px', 'important');
      // }

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
