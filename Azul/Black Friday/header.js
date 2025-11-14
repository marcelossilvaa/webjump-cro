(function () {
  // Função para aplicar personalizações no header
  function customizeHeader() {
    // Buscar o header
    const header = document.querySelector('header');
    if (!header) {
      return;
    }

    // 1. Mudar background do div com elevation="9999" para #000
    const elevatedDiv = header.querySelector('div[elevation="9999"]');
    if (elevatedDiv && !elevatedDiv.hasAttribute('data-header-customized')) {
      elevatedDiv.style.setProperty('background', '#000', 'important');
      elevatedDiv.setAttribute('data-header-customized', 'true');
      console.log('✅ Background do header alterado para #000');
    }

    // 2. Substituir o SVG do logo
    // Buscar o SVG dentro do header que está dentro de um link com href contendo "home"
    const headerLink = header.querySelector('a[href*="home"]');
    if (headerLink) {
      const logoContainer = headerLink.querySelector('div[title="Logo Azul"]');
      if (logoContainer) {
        // Verificar se já foi substituído (verificar se tem viewBox="0 0 505 294")
        const existingSvg = logoContainer.querySelector('svg[viewBox="0 0 505 294"]');
        if (existingSvg) {
          // Já foi substituído, não fazer nada
        } else {
          const oldSvg = logoContainer.querySelector('svg');
          if (oldSvg && !oldSvg.hasAttribute('data-logo-replaced')) {
            // Criar o novo SVG
            const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            newSvg.setAttribute('width', '505');
            newSvg.setAttribute('height', '294');
            newSvg.setAttribute('viewBox', '0 0 505 294');
            newSvg.setAttribute('fill', 'none');

            // Adicionar os paths do novo SVG
            const paths = [
              {
                d: 'M450.55 49.8301H407.1V120.88C407.1 144.39 392.78 150.53 383.33 150.53C369.53 150.53 361.86 144.39 361.86 126.75V49.8301H318.42V129.57C318.42 164.32 329.4 186.3 367.49 186.3C382.82 186.3 399.69 177.86 407.86 164.32H408.39V182.47H450.55V49.8401V49.8301Z',
                fill: '#00B4E2',
              },
              {
                d: 'M460.77 182.47H504.21V0H460.77V182.47ZM187.83 182.47H314.07V149.26H243.04L309.23 82.8V49.84H193.21V83.07H254.03L187.84 148.75V182.48L187.83 182.47ZM0 182.47H48.81L60.32 149.76H123.95L135.19 182.47H184.76L116.53 0.00997925H68.23L0 182.47ZM92 50.6H92.52L112.7 114.49H71.3L92 50.6Z',
                fill: '#00B4E2',
              },
              {
                d: 'M0.770508 209.93H75.3805V225.83H23.4605V244.07H72.1105V259.97H23.4605V293.42H0.770508V209.92V209.93Z',
                fill: 'white',
              },
              {
                d: 'M87.5508 209.93H148.241C171.391 209.93 175.251 224.08 175.251 232.62C175.251 242.79 171.161 249.34 161.681 252.73V252.96C171.621 254.48 173.141 267.11 173.141 275.3C173.141 279.39 173.491 289.22 177.471 293.43H152.681C150.571 289.57 150.461 286.18 150.461 277.41C150.461 265.72 145.431 262.79 138.421 262.79H110.241V293.43H87.5508V209.93ZM110.241 246.88H140.291C145.321 246.88 151.171 244.07 151.171 236.24C151.171 227.94 144.621 225.83 139.121 225.83H110.241V246.88Z',
                fill: 'white',
              },
              {
                d: 'M189.53 209.93H212.22V293.43H189.53V209.93Z',
                fill: 'white',
              },
              {
                d: 'M230.461 209.93H282.501C311.151 209.93 323.551 226.54 323.551 251.68C323.551 276.82 310.691 293.43 284.491 293.43H230.461V209.93ZM253.151 277.52H278.411C293.381 277.52 300.161 268.52 300.161 250.86C300.161 235.42 293.611 225.83 276.301 225.83H253.141V277.52H253.151Z',
                fill: 'white',
              },
              {
                d: 'M394.19 276.24H355.83L349.05 293.43H324.61L361.33 209.93H388.69L425.41 293.43H400.97L394.19 276.24ZM375.01 227.94L361.91 261.03H388.11L375.01 227.94Z',
                fill: 'white',
              },
              {
                d: 'M444.48 264.31L407.521 209.93H434.18L455.81 246.3L477.44 209.93H504.101L467.141 264.31V293.43H444.451V264.31H444.48Z',
                fill: 'white',
              },
            ];

            paths.forEach((pathData) => {
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('d', pathData.d);
              path.setAttribute('fill', pathData.fill);
              newSvg.appendChild(path);
            });

            // Marcar o SVG antigo antes de substituir para evitar loop
            oldSvg.setAttribute('data-logo-replaced', 'true');

            // Substituir o SVG antigo pelo novo
            oldSvg.replaceWith(newSvg);

            // Marcar o novo SVG também
            newSvg.setAttribute('data-logo-replaced', 'true');
            console.log('✅ SVG do logo substituído');
          }
        }
      }
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
