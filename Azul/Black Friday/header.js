(function () {
  // Função para criar o novo SVG do logo
  function createNewLogoSvg() {
    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    newSvg.setAttribute('width', '237');
    newSvg.setAttribute('height', '61');
    newSvg.setAttribute('viewBox', '0 0 237 61');
    newSvg.setAttribute('fill', 'none');

    // Adicionar os paths do novo SVG
    const paths = [
      {
        d: 'M93.5141 10.3506H84.4948V25.1056C84.4948 29.9859 81.5249 31.264 79.5599 31.264C76.6959 31.264 75.1052 29.99 75.1052 26.3267V10.3506H66.0898V26.9088C66.0898 34.1255 68.3681 38.6883 76.2728 38.6883C79.4542 38.6883 82.9569 36.9381 84.6534 34.1255H84.7633V37.8946H93.5141V10.3506Z',
        fill: '#13B5EA',
      },
      {
        d: 'M95.6331 37.8909H104.648V0H95.6331V37.8909ZM38.9864 37.8909H65.1861V30.9957H50.4426L64.1812 17.1931V10.3468H40.1011V17.2461H52.7249L38.9864 30.8858V37.8909ZM0 37.8909H10.13L12.5181 31.0975H25.7238L28.0589 37.8909H38.3476L24.1859 0H14.1617L0 37.8909ZM19.0965 10.5096H19.2023L23.3926 23.779H14.8004L19.0965 10.5096Z',
        fill: '#13B5EA',
      },
      {
        d: 'M0.158203 43.5929H15.6421V46.894H4.86927V50.6835H14.9668V53.9845H4.86927V60.9285H0.158203V43.5889V43.5929Z',
        fill: 'white',
      },
      {
        d: 'M18.168 43.5938H30.7634C35.568 43.5938 36.3695 46.5325 36.3695 48.3031C36.3695 50.4156 35.5192 51.7751 33.5542 52.4793V52.5282C35.6168 52.8456 35.9342 55.4669 35.9342 57.1684C35.9342 58.0191 36.0074 60.0583 36.8332 60.9334H31.6869C31.2516 60.1316 31.2272 59.4274 31.2272 57.608C31.2272 55.178 30.1857 54.5715 28.7292 54.5715H22.879V60.9334H18.172V43.5938H18.168ZM22.879 51.2664H29.1157C30.1613 51.2664 31.3736 50.6843 31.3736 49.0562C31.3736 47.3303 30.0148 46.8948 28.8716 46.8948H22.875V51.2664H22.879Z',
        fill: 'white',
      },
      { d: 'M39.3359 43.5938H44.0429V60.9334H39.3359V43.5938Z', fill: 'white' },
      {
        d: 'M47.832 43.5938H58.6333C64.5811 43.5938 67.1523 47.0413 67.1523 52.2636C67.1523 57.4858 64.4835 60.9334 59.0442 60.9334H47.832V43.5938ZM52.5431 57.6324H57.7871C60.8953 57.6324 62.3029 55.7641 62.3029 52.0967C62.3029 48.8893 60.9441 46.8989 57.3518 46.8989H52.5472V57.6324H52.5431Z',
        fill: 'white',
      },
      {
        d: 'M81.8135 57.3637H73.8519L72.4442 60.9334H67.3711L74.991 43.5938H80.6703L88.2902 60.9334H83.2171L81.8094 57.3637H81.8135ZM77.8347 47.3344L75.1171 54.2051H80.5523L77.8347 47.3344Z',
        fill: 'white',
      },
      {
        d: 'M92.2527 54.8849L84.584 43.5938H90.1168L94.6082 51.1442L99.0996 43.5938H104.632L96.9638 54.8849V60.9334H92.2568V54.8849H92.2527Z',
        fill: 'white',
      },
      {
        d: 'M149.574 14.5684C155.685 17.7122 159.881 24.0846 159.881 31.4218C159.881 38.759 155.854 44.8772 149.946 48.0823H230.482L236.668 14.5684H149.574Z',
        fill: 'white',
      },
      {
        d: 'M168.215 18.9928L166.413 27.4359C166.183 28.5655 166.461 28.862 167.034 28.862C167.608 28.862 168.018 28.5655 168.248 27.4359L170.05 18.9928H173.098L171.461 26.6688C170.774 29.9491 169.151 30.9328 166.592 30.9328C164.033 30.9328 162.838 29.9491 163.525 26.6688L165.162 18.9928H168.21H168.215ZM169.231 15.7783H171.983L169.899 18.1738H167.999L169.226 15.7783H169.231Z',
        fill: '#00043E',
      },
      {
        d: 'M174.74 18.9932H177.789L175.822 28.2082H179.576L179.054 30.7026H172.252L174.745 18.9932H174.74Z',
        fill: '#00043E',
      },
      {
        d: 'M182.426 21.5815H180.131L180.686 18.9883H188.325L187.77 21.5815H185.475L183.541 30.6977H180.493L182.426 21.5815Z',
        fill: '#00043E',
      },
      { d: 'M189.227 18.9932H192.276L189.783 30.7026H186.734L189.227 18.9932Z', fill: '#00043E' },
      {
        d: 'M193.818 18.9932H198.179L197.934 25.9303H197.967L200.672 18.9932H205.033L202.54 30.7026H199.689L201.542 21.977H201.509L198.033 30.7026H195.836L196.067 21.977H196.034L194.181 30.7026H191.33L193.823 18.9932H193.818Z',
        fill: '#00043E',
      },
      {
        d: 'M208.603 18.9932H212.437L212.799 30.7026H209.554L209.685 28.6506H207.258L206.506 30.7026H203.26L208.603 18.9932ZM210.029 21.384H209.996L208.095 26.3539H209.798L210.029 21.384Z',
        fill: '#00043E',
      },
      {
        d: 'M219.964 22.367L220.03 22.0893C220.176 21.4022 220.016 20.828 219.423 20.828C218.77 20.828 218.36 21.3363 218.262 21.8634C217.768 24.1742 222.98 23.0447 222.081 27.3227C221.54 29.8171 219.851 30.9325 217.166 30.9325C214.639 30.9325 213.412 30.0618 213.939 27.6381L214.019 27.2286H216.968L216.902 27.5063C216.69 28.5087 217.034 28.8664 217.622 28.8664C218.243 28.8664 218.704 28.3723 218.835 27.7369C219.329 25.4261 214.31 26.5744 215.18 22.4234C215.688 20.0608 217.231 18.7666 219.804 18.7666C222.378 18.7666 223.347 19.8632 222.82 22.3764H219.969L219.964 22.367Z',
        fill: '#00043E',
      },
      {
        d: 'M169.18 33.1777C172.294 33.1777 172.999 34.8814 172.063 39.263C171.127 43.6399 169.702 45.3483 166.588 45.3483C163.474 45.3483 162.768 43.6447 163.704 39.263C164.641 34.8861 166.066 33.1777 169.18 33.1777ZM167.035 43.2776C167.971 43.2776 168.248 42.4257 168.921 39.2583C169.594 36.0957 169.674 35.2391 168.742 35.2391C167.811 35.2391 167.529 36.091 166.856 39.2583C166.183 42.421 166.103 43.2776 167.035 43.2776Z',
        fill: '#00043E',
      },
      {
        d: 'M174.74 33.4082H181.674L181.133 35.9026H177.248L176.838 37.9028H180.479L179.957 40.2983H176.316L175.3 45.1176H172.252L174.745 33.4082H174.74Z',
        fill: '#00043E',
      },
      {
        d: 'M182.953 33.4082H189.887L189.346 35.9026H185.46L185.051 37.9028H188.692L188.17 40.2983H184.529L184.035 42.6279H188.066L187.544 45.1223H180.465L182.958 33.4129L182.953 33.4082Z',
        fill: '#00043E',
      },
      {
        d: 'M191.476 33.4082H196.246C198.575 33.4082 199.181 34.7213 198.786 36.5238C198.457 38.0816 197.639 39.0982 196.194 39.31V39.3429C197.639 39.4747 197.883 40.4065 197.554 41.9643L197.342 42.9668C197.21 43.5739 197.046 44.3599 197.145 44.5905C197.192 44.7223 197.225 44.854 197.408 44.9529L197.375 45.1176H194.129C193.965 44.4964 194.209 43.381 194.308 42.8868L194.473 42.1008C194.75 40.7736 194.572 40.4301 193.833 40.4301H193.029L192.027 45.1223H188.979L191.472 33.4129L191.476 33.4082ZM193.476 38.3593H194.082C194.953 38.3593 195.475 37.8039 195.653 36.9662C195.851 36.0155 195.555 35.6061 194.637 35.6061H194.049L193.476 38.3593Z',
        fill: '#00043E',
      },
      {
        d: 'M201.901 35.9965H199.605L200.161 33.4033H207.8L207.245 35.9965H204.949L203.016 45.1127H199.968L201.901 35.9965Z',
        fill: '#00043E',
      },
      {
        d: 'M209.832 33.4082H213.666L214.028 45.1176H210.782L210.914 43.0656H208.487L207.734 45.1176H204.488L209.832 33.4082ZM211.257 35.8037H211.224L209.324 40.7736H211.027L211.257 35.8037Z',
        fill: '#00043E',
      },
      {
        d: 'M221.191 36.7879L221.257 36.5102C221.403 35.8231 221.243 35.2489 220.65 35.2489C219.996 35.2489 219.587 35.7572 219.488 36.2843C218.994 38.5951 224.206 37.4656 223.308 41.7436C222.767 44.238 221.078 45.3534 218.392 45.3534C215.866 45.3534 214.638 44.4827 215.165 42.059L215.245 41.6495H218.195L218.129 41.9272C217.917 42.9296 218.26 43.2873 218.848 43.2873C219.469 43.2873 219.93 42.7932 220.062 42.1578C220.556 39.847 215.537 40.9953 216.407 36.8443C216.915 34.4817 218.458 33.1875 221.031 33.1875C223.604 33.1875 224.573 34.2841 224.046 36.7973H221.196L221.191 36.7879Z',
        fill: '#00043E',
      },
      {
        d: 'M140.947 48.4396C150.341 48.4396 157.957 40.8203 157.957 31.4215C157.957 22.0226 150.341 14.4033 140.947 14.4033C131.553 14.4033 123.938 22.0226 123.938 31.4215C123.938 40.8203 131.553 48.4396 140.947 48.4396Z',
        fill: 'white',
      },
      {
        d: 'M140.947 48.4396C150.341 48.4396 157.957 40.8203 157.957 31.4215C157.957 22.0226 150.341 14.4033 140.947 14.4033C131.553 14.4033 123.938 22.0226 123.938 31.4215C123.938 40.8203 131.553 48.4396 140.947 48.4396Z',
        fill: 'white',
      },
      {
        d: 'M140.947 31.421L127.225 25.011C126.289 27.0159 125.805 29.2043 125.805 31.421C125.805 39.7324 132.64 46.5755 140.951 46.5755C149.259 46.5755 156.098 39.7372 156.098 31.421C156.098 23.1096 149.263 16.2666 140.951 16.2666V31.421H140.947Z',
        fill: '#CF527A',
      },
      { d: 'M140.947 16.2666L141.738 31.421H140.152L140.947 16.2666Z', fill: '#00043E' },
      { d: 'M131.732 27.1152L141.451 30.3438L140.444 32.4993L131.732 27.1152Z', fill: '#00043E' },
      {
        d: 'M151.372 20.4238L148.379 23.4189L148.938 23.978L151.931 20.9829L151.372 20.4238Z',
        fill: 'white',
      },
      { d: 'M156.089 31.0215H151.855V31.8122H156.089V31.0215Z', fill: 'white' },
      {
        d: 'M148.94 38.8569L148.381 39.416L151.374 42.4111L151.933 41.852L148.94 38.8569Z',
        fill: 'white',
      },
      { d: 'M141.343 42.3359H140.553V46.5717H141.343V42.3359Z', fill: 'white' },
      {
        d: 'M132.951 38.8604L129.957 41.8555L130.516 42.4146L133.509 39.4195L132.951 38.8604Z',
        fill: 'white',
      },
      { d: 'M130.034 31.0215H125.801V31.8122H130.034V31.0215Z', fill: 'white' },
      {
        d: 'M140.948 33.0588C141.852 33.0588 142.585 32.3255 142.585 31.421C142.585 30.5165 141.852 29.7832 140.948 29.7832C140.043 29.7832 139.311 30.5165 139.311 31.421C139.311 32.3255 140.043 33.0588 140.948 33.0588Z',
        fill: '#00043E',
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
        // Verificar se já foi substituído (verificar se tem viewBox="0 0 237 61")
        const existingSvg = logoContainer.querySelector('svg[viewBox="0 0 237 61"]');
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
      const existingSvg = logoLink.querySelector('svg[viewBox="0 0 237 61"]');
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
      if (containerImage.querySelector('svg[viewBox="0 0 237 61"]')) {
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
