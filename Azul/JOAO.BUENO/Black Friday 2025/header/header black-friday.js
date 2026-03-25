(function () {
  // Função para verificar se estamos na home page
  function isHomePage() {
    const currentUrl = window.location.href;
    return currentUrl.includes('/home/br/pt/home') || currentUrl.includes('/home');
  }

  // Função para criar o novo SVG do logo
  function createNewLogoSvg() {
    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    newSvg.setAttribute('width', '623');
    newSvg.setAttribute('height', '363');
    newSvg.setAttribute('viewBox', '0 0 623 363');
    newSvg.setAttribute('fill', 'none');

    const paths = [
      {
        d: 'M556.11 61.5098H502.48V149.2C502.48 178.22 484.81 185.8 473.14 185.8C456.1 185.8 446.64 178.22 446.64 156.45V61.5098H393.02V159.93C393.02 202.83 406.58 229.95 453.58 229.95C472.5 229.95 493.32 219.54 503.41 202.82H504.06V225.22H556.1V61.5098H556.11Z',
        fill: '#00B4E2',
      },
      {
        d: 'M568.72 225.22H622.34V0H568.72V225.22ZM231.84 225.22H387.66V184.23H299.98L381.67 102.2V61.51H238.47V102.52H313.53L231.83 183.59V225.22H231.84ZM0 225.22H60.25L74.45 184.85H152.99L166.87 225.22H228.05L143.84 0.0100098H84.22L0 225.22ZM113.56 62.47H114.2L139.11 141.33H88.01L113.56 62.47Z',
        fill: '#00B4E2',
      },
      {
        d: 'M0.950195 259.12H93.0402V278.75H28.9502V301.27H89.0002V320.9H28.9502V362.18H0.950195V259.12Z',
        fill: 'white',
      },
      {
        d: 'M108.061 259.12H182.971C211.551 259.12 216.311 276.58 216.311 287.12C216.311 299.68 211.261 307.76 199.571 311.95V312.24C211.841 314.12 213.721 329.7 213.721 339.81C213.721 344.86 214.151 356.99 219.061 362.18H188.461C185.861 357.42 185.721 353.23 185.721 342.4C185.721 327.97 179.511 324.36 170.851 324.36H136.061V362.18H108.061V259.12ZM136.061 304.73H173.161C179.371 304.73 186.591 301.27 186.591 291.6C186.591 281.35 178.501 278.75 171.721 278.75H136.071V304.73H136.061Z',
        fill: 'white',
      },
      {
        d: 'M233.931 259.12H261.931V362.18H233.931V259.12Z',
        fill: 'white',
      },
      {
        d: 'M284.45 259.12H348.68C384.04 259.12 399.34 279.62 399.34 310.65C399.34 341.68 383.46 362.18 351.13 362.18H284.44V259.12H284.45ZM312.45 342.55H343.63C362.11 342.55 370.48 331.44 370.48 309.64C370.48 290.59 362.4 278.75 341.04 278.75H312.46V342.55H312.45Z',
        fill: 'white',
      },
      {
        d: 'M486.54 340.96H439.2L430.83 362.18H400.66L445.98 259.12H479.75L525.07 362.18H494.9L486.53 340.96H486.54ZM462.86 281.35L446.69 322.2H479.02L462.85 281.35H462.86Z',
        fill: 'white',
      },
      {
        d: 'M548.61 326.24L503 259.12H535.91L562.61 304.01L589.31 259.12H622.22L576.61 326.24V362.18H548.61V326.24Z',
        fill: 'white',
      },
    ];

    paths.forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData.d);
      path.setAttribute('fill', pathData.fill);
      newSvg.appendChild(path);
    });

    // Aplicar scale 0.75 se estiver na home page
    if (isHomePage()) {
      newSvg.style.setProperty('scale', '0.75', 'important');
    }

    return newSvg;
  }

  // Função para personalizar header antigo (com elevation="9999")
  function customizeOldHeader(header) {
    // 1. Mudar background do div com elevation="9999" para #000
    const elevatedDiv = header.querySelector('div[elevation="9999"]');
    if (elevatedDiv && !elevatedDiv.hasAttribute('data-header-customized')) {
      elevatedDiv.style.setProperty('background', '#000', 'important');
      elevatedDiv.setAttribute('data-header-customized', 'true');
      console.log(' Background do header alterado para #000');
    }

    // 2. Substituir o SVG do logo e ajustar o link
    const headerLink = header.querySelector('a[href*="home"]');
    if (headerLink) {
      // 2.1. Ajustar o href do link se estiver na home page
      if (isHomePage() && !headerLink.hasAttribute('data-link-customized')) {
        headerLink.setAttribute('href', 'https://www.voeazul.com.br/br/pt/azul-friday');
        headerLink.setAttribute('data-link-customized', 'true');
        console.log(' Link do logo alterado para Azul Friday (home page)');
      }

      const logoContainer = headerLink.querySelector('div[title="Logo Azul"]');
      if (logoContainer) {
        // Verificar se já foi substituído (verificar se tem viewBox="0 0 623 363")
        const existingSvg = logoContainer.querySelector('svg[viewBox="0 0 623 363"]');
        if (existingSvg) {
          // Já foi substituído, não fazer nada
          return;
        }

        const oldSvg = logoContainer.querySelector('svg');
        if (oldSvg && !oldSvg.hasAttribute('data-logo-replaced')) {
          const newSvg = createNewLogoSvg();
          // Marcar o SVG antigo antes de substituir para evitar loop
          oldSvg.setAttribute('data-logo-replaced', 'true');
          // Substituir o SVG antigo pelo novo
          oldSvg.replaceWith(newSvg);
          // Marcar o novo SVG também
          newSvg.setAttribute('data-logo-replaced', 'true');
          // Aplicar scale 0.75 se estiver na home page (garantir que seja aplicado)
          if (isHomePage()) {
            newSvg.style.setProperty('scale', '0.75', 'important');
          }
          console.log(' SVG do logo substituído (header antigo)');
        }
      }
    }
  }

  // Função para personalizar header novo (com main-header)
  function customizeNewHeader(header) {
    // 1. Mudar background do header para #000
    if (!header.hasAttribute('data-header-customized')) {
      header.style.setProperty('background', '#000', 'important');
      header.setAttribute('data-header-customized', 'true');
      console.log(' Background do header alterado para #000');
    }

    // 2. Substituir a imagem do logo por SVG
    // Buscar todos os links com classe azul-logo (pode haver múltiplos)
    const logoLinks = header.querySelectorAll('a.azul-logo');

    logoLinks.forEach((logoLink) => {
      // 2.1. Ajustar o href do link se estiver na home page
      if (isHomePage() && !logoLink.hasAttribute('data-link-customized')) {
        logoLink.setAttribute('href', 'https://www.voeazul.com.br/br/pt/azul-friday');
        logoLink.setAttribute('data-link-customized', 'true');
        console.log(' Link do logo alterado para Azul Friday (home page)');
      }

      // Verificar se já foi substituído neste link
      const existingSvg = logoLink.querySelector('svg[viewBox="0 0 623 363"]');
      if (existingSvg) {
        // Já foi substituído, pular este link
        return;
      }

      // Buscar o container-image que contém o picture/img
      const containerImage = logoLink.querySelector('.container-image');
      if (!containerImage) {
        return;
      }

      // Verificar se já tem um SVG customizado no container
      if (containerImage.querySelector('svg[viewBox="0 0 623 363"]')) {
        return;
      }

      // Buscar o picture primeiro (tem prioridade)
      const picture = containerImage.querySelector('picture');
      const img = containerImage.querySelector('img');

      // Se não encontrou picture nem img, pular
      if (!picture && !img) {
        return;
      }

      // Criar o novo SVG
      const newSvg = createNewLogoSvg();

      // Aplicar altura de 40px para o header novo (mais baixo)
      newSvg.style.setProperty('height', '40px', 'important');
      newSvg.style.setProperty('width', 'auto', 'important');

      // Aplicar scale 0.75 se estiver na home page (garantir que seja aplicado)
      if (isHomePage()) {
        newSvg.style.setProperty('scale', '0.75', 'important');
      }

      // Remover picture/img e substituir pelo SVG
      if (picture) {
        // Substituir o picture inteiro pelo SVG
        picture.replaceWith(newSvg);
        console.log(' SVG do logo substituído (header novo - picture)');
      } else if (img) {
        // Substituir apenas a img pelo SVG
        img.replaceWith(newSvg);
        console.log(' SVG do logo substituído (header novo - img)');
      }

      // Marcar o container e o SVG para evitar substituições futuras
      containerImage.setAttribute('data-logo-replaced', 'true');
      newSvg.setAttribute('data-logo-replaced', 'true');
    });
  }

  // Função para aplicar personalizações no header
  function customizeHeader() {
    // Buscar o header
    const header = document.querySelector('header');
    if (!header) {
      return;
    }

    // Detectar qual tipo de header é
    const isOldHeader = header.querySelector('div[elevation="9999"]');
    const isNewHeader = header.classList.contains('main-header');

    if (isOldHeader) {
      customizeOldHeader(header);
    } else if (isNewHeader) {
      customizeNewHeader(header);
    }
  }

  // Função para inicializar
  function init() {
    // Executar imediatamente
    customizeHeader();

    // Usar MutationObserver para detectar quando o header é adicionado/modificado
    const observer = new MutationObserver(() => {
      customizeHeader();
    });

    // Observar mudanças no body para quando o header for adicionado
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Também observar mudanças no header diretamente se já existir
    const header = document.querySelector('header');
    if (header) {
      observer.observe(header, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
