(function () {
  // Função para criar o novo SVG do logo
  function createNewLogoSvg() {
    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    newSvg.setAttribute('width', '1164');
    newSvg.setAttribute('height', '294');
    newSvg.setAttribute('viewBox', '0 0 1164 294');
    newSvg.setAttribute('fill', 'none');

    const paths = [
      {
        d: 'M735.24 92.2998C739.29 97.0098 741.75 103.11 741.75 109.79V202.53C741.75 209.7 738.91 216.21 734.31 221.04H1139.88L1163.65 92.2998H735.24Z',
        fill: 'white',
      },
      {
        d: 'M784.449 106.4C796.419 106.4 799.129 112.95 795.539 129.77C791.949 146.59 786.469 153.14 774.499 153.14C762.529 153.14 759.819 146.59 763.409 129.77C766.999 112.95 772.479 106.4 784.449 106.4ZM776.199 145.2C779.789 145.2 780.859 141.92 783.439 129.77C786.019 117.61 786.339 114.34 782.749 114.34C779.159 114.34 778.089 117.62 775.509 129.77C772.929 141.93 772.609 145.2 776.199 145.2Z',
        fill: '#00043E',
      },
      {
        d: 'M805.81 107.28H832.449L830.37 116.85H815.439L813.87 124.53H827.849L825.829 133.73H811.849L807.939 152.25H796.229L805.799 107.28H805.81Z',
        fill: '#00043E',
      },
      {
        d: 'M837.369 107.28H864.009L861.929 116.85H846.999L845.429 124.53H859.409L857.389 133.73H843.409L841.519 142.67H857.009L854.989 152.24H827.779L837.349 107.27L837.369 107.28Z',
        fill: '#00043E',
      },
      {
        d: 'M870.12 107.28H888.45C897.39 107.28 899.73 112.32 898.21 119.25C896.95 125.23 893.8 129.14 888.26 129.96V130.09C893.8 130.59 894.75 134.18 893.49 140.17L892.67 144.01C892.17 146.34 891.54 149.36 891.91 150.25C892.1 150.75 892.23 151.26 892.92 151.64L892.8 152.27H880.33C879.7 149.88 880.65 145.59 881.02 143.7L881.65 140.68C882.72 135.58 882.03 134.26 879.19 134.26H876.1L872.26 152.27H860.55L870.12 107.3V107.28ZM877.81 126.31H880.14C883.48 126.31 885.49 124.17 886.19 120.96C886.95 117.31 885.81 115.73 882.28 115.73H880.01L877.8 126.31H877.81Z',
        fill: '#00043E',
      },
      {
        d: 'M910.189 117.24H901.369L903.509 107.29H932.859L930.719 117.24H921.899L914.469 152.26H902.759L910.189 117.24Z',
        fill: '#00043E',
      },
      {
        d: 'M940.68 107.28H955.42L956.8 152.25H944.33L944.83 144.38H935.51L932.61 152.25H920.14L940.67 107.28H940.68ZM946.16 116.48H946.04L938.73 135.57H945.28L946.16 116.48Z',
        fill: '#00043E',
      },
      {
        d: 'M984.33 120.26L984.58 119.19C985.15 116.54 984.52 114.34 982.25 114.34C979.73 114.34 978.16 116.29 977.78 118.31C975.89 127.19 995.92 122.85 992.46 139.29C990.38 148.86 983.89 153.15 973.56 153.15C963.86 153.15 959.14 149.81 961.15 140.49L961.46 138.92H972.8L972.55 139.99C971.73 143.83 973.05 145.22 975.32 145.22C977.71 145.22 979.48 143.33 979.98 140.87C981.87 131.99 962.6 136.4 965.93 120.46C967.88 111.39 973.81 106.41 983.69 106.41C993.57 106.41 997.3 110.63 995.28 120.27H984.32L984.33 120.26Z',
        fill: '#00043E',
      },
      {
        d: 'M776.89 162.66H791.63L793.01 207.63H780.54L781.04 199.76H771.72L768.82 207.63H756.35L776.88 162.66H776.89ZM782.37 171.86H782.24L774.94 190.95H781.49L782.37 171.86Z',
        fill: '#00043E',
      },
      {
        d: 'M805.809 162.66H818.909L820.549 190.37H820.679L826.599 162.66H837.559L827.989 207.63H815.139L813.249 179.85H813.119L807.199 207.63H796.239L805.809 162.66Z',
        fill: '#00043E',
      },
      {
        d: 'M848.139 172.62H839.319L841.459 162.67H870.809L868.669 172.62H859.849L852.419 207.64H840.699L848.129 172.62H848.139Z',
        fill: '#00043E',
      },
      {
        d: 'M874.72 162.66H901.36L899.28 172.23H884.35L882.78 179.91H896.76L894.74 189.11H880.76L878.87 198.05H894.36L892.34 207.62H865.13L874.7 162.65L874.72 162.66Z',
        fill: '#00043E',
      },
      {
        d: 'M922.539 176.33C923.609 171.23 922.979 169.72 920.709 169.72C917.119 169.72 916.049 173 913.469 185.15C910.889 197.31 910.569 200.58 914.159 200.58C917.059 200.58 918.189 198.06 920.019 189.56H931.359L930.669 192.9C927.959 205.5 919.959 208.52 912.469 208.52C899.299 208.52 897.789 201.91 901.379 185.15C905.029 167.95 910.259 161.78 922.419 161.78C932.999 161.78 935.769 167.32 933.949 176.02L933.319 178.85H921.979L922.549 176.33H922.539Z',
        fill: '#00043E',
      },
      { d: 'M942.13 162.66H953.85L944.28 207.63H932.56L942.13 162.66Z', fill: '#00043E' },
      {
        d: 'M959.76 162.66H977.33C986.28 162.66 989.04 168.64 987.35 176.52C985.4 185.72 979.16 190.5 969.65 190.5H965.55L961.9 207.63H950.18L959.75 162.66H959.76ZM967.32 182.07H969.53C972.49 182.07 974.44 180.37 975.26 176.59C976.02 172.87 974.82 171.11 971.86 171.11H969.66L967.33 182.07H967.32Z',
        fill: '#00043E',
      },
      {
        d: 'M1000.33 162.66H1015.07L1016.45 207.63H1003.98L1004.48 199.76H995.16L992.26 207.63H979.79L1000.32 162.66H1000.33ZM1005.81 171.86H1005.68L998.38 190.95H1004.93L1005.81 171.86Z',
        fill: '#00043E',
      },
      {
        d: 'M1029.25 162.66H1046.26C1059.8 162.66 1058.23 173.37 1055.71 185.15C1053.19 196.93 1050.23 207.64 1036.69 207.64H1019.68L1029.25 162.67V162.66ZM1033.15 199.2H1035.48C1040.02 199.2 1041.02 197.31 1043.6 185.15C1046.18 172.99 1045.99 171.1 1041.46 171.1H1039.13L1033.15 199.19V199.2Z',
        fill: '#00043E',
      },
      {
        d: 'M1072.9 162.66H1087.64L1089.02 207.63H1076.55L1077.05 199.76H1067.73L1064.83 207.63H1052.36L1072.89 162.66H1072.9ZM1078.38 171.86H1078.25L1070.95 190.95H1077.5L1078.38 171.86Z',
        fill: '#00043E',
      },
      {
        d: 'M1116.56 175.64L1116.81 174.57C1117.38 171.92 1116.75 169.72 1114.48 169.72C1111.96 169.72 1110.39 171.67 1110.01 173.69C1108.12 182.57 1128.15 178.23 1124.69 194.66C1122.61 204.23 1116.12 208.52 1105.79 208.52C1096.09 208.52 1091.36 205.18 1093.38 195.86L1093.7 194.28H1105.04L1104.79 195.35C1103.97 199.19 1105.29 200.58 1107.56 200.58C1109.95 200.58 1111.72 198.69 1112.22 196.23C1114.11 187.35 1094.84 191.76 1098.18 175.82C1100.13 166.75 1106.05 161.77 1115.94 161.77C1125.83 161.77 1129.55 165.99 1127.53 175.63H1116.57L1116.56 175.64Z',
        fill: '#00043E',
      },
      {
        d: 'M714.88 89.9199H710.91V95.8799C710.91 100.27 707.35 103.83 702.96 103.83C698.57 103.83 695.01 100.27 695.01 95.8799V89.9199H628.77V95.8799C628.77 100.27 625.21 103.83 620.82 103.83C616.43 103.83 612.87 100.27 612.87 95.8799V89.9199H608.9C597.92 89.9199 589.03 98.8199 589.03 109.79V202.53C589.03 213.51 597.93 222.4 608.9 222.4H714.89C725.86 222.4 734.76 213.5 734.76 202.53V109.79C734.76 98.8099 725.86 89.9199 714.89 89.9199H714.88Z',
        fill: '#CF527A',
      },
      {
        d: 'M589.01 126.35V202.53C589.01 213.51 597.91 222.4 608.88 222.4H714.87C725.85 222.4 734.74 213.5 734.74 202.53V126.35H589H589.01Z',
        fill: 'white',
      },
      {
        d: 'M714.88 89.9199H710.91V95.8799C710.91 100.27 707.35 103.83 702.96 103.83C698.57 103.83 695.01 100.27 695.01 95.8799V89.9199H628.76V95.8799C628.76 100.27 625.2 103.83 620.81 103.83C616.42 103.83 612.86 100.27 612.86 95.8799V89.9199H608.89C597.91 89.9199 589.02 98.8199 589.02 109.79V126.35H734.76V109.79C734.76 98.8099 725.86 89.9199 714.89 89.9199H714.88Z',
        fill: '#CF527A',
      },
      {
        d: 'M620.81 76C616.42 76 612.86 79.56 612.86 83.95V95.87C612.86 100.26 616.42 103.82 620.81 103.82C625.2 103.82 628.76 100.26 628.76 95.87V83.95C628.76 79.56 625.2 76 620.81 76Z',
        fill: '#00B4E2',
      },
      {
        d: 'M702.95 76C698.56 76 695 79.56 695 83.95V95.87C695 100.26 698.56 103.82 702.95 103.82C707.34 103.82 710.9 100.26 710.9 95.87V83.95C710.9 79.56 707.34 76 702.95 76Z',
        fill: '#00B4E2',
      },
      {
        d: 'M648.549 160.45C643.259 160.45 638.949 156.15 638.949 150.85C638.949 145.55 643.249 141.25 648.549 141.25C653.849 141.25 658.149 145.55 658.149 150.85C658.149 156.15 653.849 160.45 648.549 160.45ZM648.549 147.26C646.569 147.26 644.949 148.87 644.949 150.86C644.949 152.85 646.559 154.46 648.549 154.46C650.539 154.46 652.149 152.85 652.149 150.86C652.149 148.87 650.539 147.26 648.549 147.26Z',
        fill: '#CF527A',
      },
      {
        d: 'M675.13 155.85C677.703 155.85 679.79 153.764 679.79 151.19C679.79 148.617 677.703 146.53 675.13 146.53C672.556 146.53 670.47 148.617 670.47 151.19C670.47 153.764 672.556 155.85 675.13 155.85Z',
        fill: '#CF527A',
      },
      {
        d: 'M701.63 155.85C704.203 155.85 706.29 153.764 706.29 151.19C706.29 148.617 704.203 146.53 701.63 146.53C699.056 146.53 696.97 148.617 696.97 151.19C696.97 153.764 699.056 155.85 701.63 155.85Z',
        fill: '#CF527A',
      },
      {
        d: 'M622.13 179.04C624.703 179.04 626.79 176.954 626.79 174.38C626.79 171.807 624.703 169.72 622.13 169.72C619.556 169.72 617.47 171.807 617.47 174.38C617.47 176.954 619.556 179.04 622.13 179.04Z',
        fill: '#CF527A',
      },
      {
        d: 'M648.63 179.04C651.203 179.04 653.29 176.954 653.29 174.38C653.29 171.807 651.203 169.72 648.63 169.72C646.056 169.72 643.97 171.807 643.97 174.38C643.97 176.954 646.056 179.04 648.63 179.04Z',
        fill: '#CF527A',
      },
      {
        d: 'M675.13 179.04C677.703 179.04 679.79 176.954 679.79 174.38C679.79 171.807 677.703 169.72 675.13 169.72C672.556 169.72 670.47 171.807 670.47 174.38C670.47 176.954 672.556 179.04 675.13 179.04Z',
        fill: '#CF527A',
      },
      {
        d: 'M701.63 179.04C704.203 179.04 706.29 176.954 706.29 174.38C706.29 171.807 704.203 169.72 701.63 169.72C699.056 169.72 696.97 171.807 696.97 174.38C696.97 176.954 699.056 179.04 701.63 179.04Z',
        fill: '#CF527A',
      },
      {
        d: 'M622.13 202.22C624.703 202.22 626.79 200.134 626.79 197.56C626.79 194.987 624.703 192.9 622.13 192.9C619.556 192.9 617.47 194.987 617.47 197.56C617.47 200.134 619.556 202.22 622.13 202.22Z',
        fill: '#CF527A',
      },
      {
        d: 'M648.63 202.22C651.203 202.22 653.29 200.134 653.29 197.56C653.29 194.987 651.203 192.9 648.63 192.9C646.056 192.9 643.97 194.987 643.97 197.56C643.97 200.134 646.056 202.22 648.63 202.22Z',
        fill: '#CF527A',
      },
      {
        d: 'M675.13 202.22C677.703 202.22 679.79 200.134 679.79 197.56C679.79 194.987 677.703 192.9 675.13 192.9C672.556 192.9 670.47 194.987 670.47 197.56C670.47 200.134 672.556 202.22 675.13 202.22Z',
        fill: '#CF527A',
      },
      {
        d: 'M450.55 49.8301H407.1V120.88C407.1 144.39 392.78 150.53 383.33 150.53C369.53 150.53 361.86 144.39 361.86 126.75V49.8301H318.42V129.57C318.42 164.32 329.4 186.3 367.49 186.3C382.82 186.3 399.69 177.86 407.86 164.32H408.39V182.47H450.55V49.8401V49.8301Z',
        fill: '#00B4E2',
      },
      {
        d: 'M460.77 182.47H504.21V0H460.77V182.47ZM187.83 182.47H314.07V149.26H243.04L309.23 82.8V49.84H193.21V83.07H254.03L187.84 148.75V182.48L187.83 182.47ZM0 182.47H48.81L60.32 149.76H123.95L135.19 182.47H184.76L116.53 0.00997925H68.23L0 182.47ZM92 50.6H92.52L112.7 114.49H71.3L92 50.6Z',
        fill: '#00B4E2',
      },
      {
        d: 'M0.769531 209.93H75.3795V225.83H23.4595V244.07H72.1095V259.97H23.4595V293.42H0.769531V209.92V209.93Z',
        fill: 'white',
      },
      {
        d: 'M87.5498 209.93H148.24C171.39 209.93 175.25 224.08 175.25 232.62C175.25 242.79 171.16 249.34 161.68 252.73V252.96C171.62 254.48 173.14 267.11 173.14 275.3C173.14 279.39 173.49 289.22 177.47 293.43H152.68C150.57 289.57 150.46 286.18 150.46 277.41C150.46 265.72 145.43 262.79 138.42 262.79H110.24V293.43H87.5498V209.93ZM110.24 246.88H140.29C145.32 246.88 151.17 244.07 151.17 236.24C151.17 227.94 144.62 225.83 139.12 225.83H110.24V246.88Z',
        fill: 'white',
      },
      { d: 'M189.529 209.93H212.219V293.43H189.529V209.93Z', fill: 'white' },
      {
        d: 'M230.46 209.93H282.5C311.15 209.93 323.55 226.54 323.55 251.68C323.55 276.82 310.69 293.43 284.49 293.43H230.46V209.93ZM253.15 277.52H278.41C293.38 277.52 300.16 268.52 300.16 250.86C300.16 235.42 293.61 225.83 276.3 225.83H253.14V277.52H253.15Z',
        fill: 'white',
      },
      {
        d: 'M394.189 276.24H355.829L349.049 293.43H324.609L361.329 209.93H388.689L425.409 293.43H400.969L394.189 276.24ZM375.009 227.94L361.909 261.03H388.109L375.009 227.94Z',
        fill: 'white',
      },
      {
        d: 'M444.479 264.31L407.52 209.93H434.18L455.81 246.3L477.44 209.93H504.1L467.14 264.31V293.43H444.45V264.31H444.479Z',
        fill: 'white',
      },
    ];

    paths.forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData.d);
      path.setAttribute('fill', pathData.fill);
      newSvg.appendChild(path);
    });

    return newSvg;
  }

  // Função para personalizar header antigo (com elevation="9999")
  function customizeOldHeader(header) {
    // 1. Mudar background do div com elevation="9999" para #000
    const elevatedDiv = header.querySelector('div[elevation="9999"]');
    if (elevatedDiv && !elevatedDiv.hasAttribute('data-header-customized')) {
      elevatedDiv.style.setProperty('background', '#000', 'important');
      elevatedDiv.setAttribute('data-header-customized', 'true');
      console.log('✅ Background do header alterado para #000');
    }

    // 2. Substituir o SVG do logo
    const headerLink = header.querySelector('a[href*="home"]');
    if (headerLink) {
      const logoContainer = headerLink.querySelector('div[title="Logo Azul"]');
      if (logoContainer) {
        // Verificar se já foi substituído (verificar se tem viewBox="0 0 1164 294")
        const existingSvg = logoContainer.querySelector('svg[viewBox="0 0 1164 294"]');
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
          console.log('✅ SVG do logo substituído (header antigo)');
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
      console.log('✅ Background do header alterado para #000');
    }

    // 2. Substituir a imagem do logo por SVG
    // Buscar todos os links com classe azul-logo (pode haver múltiplos)
    const logoLinks = header.querySelectorAll('a.azul-logo');

    logoLinks.forEach((logoLink) => {
      // Verificar se já foi substituído neste link
      const existingSvg = logoLink.querySelector('svg[viewBox="0 0 1164 294"]');
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
      if (containerImage.querySelector('svg[viewBox="0 0 1164 294"]')) {
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

      // Remover picture/img e substituir pelo SVG
      if (picture) {
        // Substituir o picture inteiro pelo SVG
        picture.replaceWith(newSvg);
        console.log('✅ SVG do logo substituído (header novo - picture)');
      } else if (img) {
        // Substituir apenas a img pelo SVG
        img.replaceWith(newSvg);
        console.log('✅ SVG do logo substituído (header novo - img)');
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
