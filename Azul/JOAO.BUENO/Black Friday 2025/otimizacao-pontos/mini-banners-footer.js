(() => {
  'use strict';

  const FOOTER_ROOT_SELECTOR = '.css-1ngnp0i';
  const STYLE_ID = 'mini-banners-footer-component-style';
  const FOOTER_BANNERS_CONFIG = [
    {
      id: 'footer-banner-destaques',
      title: 'Principais ofertas',
      ctaLabel: 'Ver destaques',
      ariaLabel: 'Ver principais ofertas da Azul Friday',
      href: 'https://www.voeazul.com.br/br/pt/azul-friday'
    },
    {
      id: 'footer-banner-pacotes',
      title: 'Pacotes, hotéis e ingressos',
      ctaLabel: 'Ver pacotes',
      ariaLabel: 'Ver pacotes da Azul Friday',
      href: 'https://www.voeazul.com.br/br/pt/azul-friday/viagem-completa'
    },
    {
      id: 'footer-banner-pontos',
      title: 'Pontos',
      ctaLabel: 'Ver ofertas',
      ariaLabel: 'Ver ofertas de pontos do Azul Fidelidade',
      href: 'https://www.voeazul.com.br/br/pt/azul-friday/pontos'
    }
  ];

  const waitForRoot = (selector, { timeout = 5000, silent = false } = {}) =>
    new Promise((resolve, reject) => {
      const root = document.querySelector(selector);
      if (root) {
        resolve(root);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        const error = new Error('Footer banners root not found for selector ' + selector);
        if (silent) {
          resolve(null);
        } else {
          reject(error);
        }
      }, timeout);
    });

  /**
   * Função helper para buscar a imagem do botão
   * Prioriza css-bq6zc0, depois css-cw25l4, depois primeira imagem
   */
  const findButtonImage = (button) => {
    let img = button.querySelector('img.css-bq6zc0');
    if (img) return img;

    img = button.querySelector('img.css-cw25l4');
    if (img) return img;

    return button.querySelector('img:first-of-type');
  };

  /**
   * Função helper para calcular largura do card baseado no contexto
   */
  const getCardWidth = (cardWrapper, button) => {
    // Priorizar a largura real do elemento se disponível
    if (cardWrapper && cardWrapper.offsetWidth > 0) {
      return cardWrapper.offsetWidth;
    }
    if (button && button.offsetWidth > 0) {
      return button.offsetWidth;
    }

    // Fallback baseado no viewport
    if (window.innerWidth < 768) {
      return (window.innerWidth - 32); // Full width com padding
    }

    // Estimativa para desktop (1/3 do container ou largura fixa aproximada)
    const containerWidth = document.querySelector(FOOTER_ROOT_SELECTOR)?.offsetWidth || window.innerWidth;
    if (window.innerWidth >= 1024) {
      return (containerWidth - 32) / 3; // 3 colunas com gap
    }

    return containerWidth - 32;
  };

  /**
   * Função helper para calcular e aplicar altura do botão
   */
  const applyButtonHeight = (button, img, cardWidth) => {
    if (!img || !img.src) return;

    const imgHeight = img.naturalHeight || img.offsetHeight;
    const imgWidth = img.naturalWidth || img.offsetWidth;

    if (!imgHeight || !imgWidth || cardWidth <= 0) return;

    const fullHeight = (imgHeight * cardWidth) / imgWidth;
    const buttonHeight = fullHeight * 0.65;
    const heightStr = buttonHeight + 'px';

    button.style.backgroundImage = 'url(' + img.src + ')';
    button.style.backgroundPosition = 'center top';
    button.style.backgroundSize = '100% auto';
    button.style.backgroundRepeat = 'no-repeat';
    button.style.width = '100%';
    button.style.maxWidth = '100%';
    button.style.height = heightStr;
    button.style.minHeight = heightStr;

    // Ocultar a imagem que está sendo usada como background
    img.style.display = 'none';

    // Ocultar outras imagens também
    const allImages = button.querySelectorAll('img');
    allImages.forEach(image => {
      if (image !== img) {
        image.style.display = 'none';
      }
    });
  };

  /**
   * Função para disparar tracking Adobe Analytics
   */
  const trackFooterBannerClick = (bannerId, bannerTitle) => {
    try {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));

      if (!s || typeof s.tl !== 'function') {
        console.warn('Adobe Analytics não disponível');
        return;
      }

      // Pegar path da página atual
      var currentPath = window.location.pathname || '';

      // Configurar variáveis de tracking
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar84 = 'AT_BF ' + currentPath; // Página do usuário
      s.eVar82 = 'AT_BF_footerbanner: ' + bannerTitle || 'Footer Banner Click'; // Ação do usuário

      // Disparar o link (o = custom link)
      s.tl(true, 'o', 'target_activity_action');
    } catch (error) {
      console.warn('Erro ao disparar tracking:', error);
    }
  };

  const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '      .css-1ngnp0i.footer-banners-grid,' +
      '      .footer-banners-grid {' +
      '        display: flex !important;' +
      '        flex-direction: row !important;' +
      '        gap: 16px !important;' +
      '        width: 100% !important;' +
      '        justify-content: space-between !important;' +
      '        align-items: stretch !important;' +
      '      }' +
      '' +
      '      .footer-banner-card-wrapper {' +
      '        font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;' +
      '        position: relative;' +
      '        display: flex;' +
      '        flex-direction: column;' +
      '        flex: 1 !important;' +
      '        width: 100% !important;' +
      '        max-width: none !important;' +
      '        border-radius: 20px;' +
      '        overflow: hidden;' +
      '        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);' +
      '        box-sizing: border-box;' +
      '      }' +
      '' +
      '      .footer-banner-card-wrapper button.css-3uz0rz {' +
      '        width: 100%;' +
      '        padding: 0;' +
      '        margin: 0;' +
      '        border: none;' +
      '        background: transparent;' +
      '        position: relative;' +
      '        box-sizing: border-box;' +
      '        max-width: 100%;' +
      '        overflow: hidden;' +
      '        min-height: 0;' +
      '      }' +
      '' +
      '      .footer-banner-card-wrapper button.css-3uz0rz[style*="background-image"] {' +
      '        background-position: center top !important;' +
      '        background-repeat: no-repeat !important;' +
      '        border-radius: 0px !important;' +
      '        display: block;' +
      '        overflow: hidden !important;' +
      '        width: 100% !important;' +
      '        max-width: 100% !important;' +
      '        min-width: 0 !important;' +
      '        flex-shrink: 0 !important;' +
      '        flex-grow: 0 !important;' +
      '      }' +
      '' +
      '      .footer-banner-card-wrapper button.css-3uz0rz img {' +
      '        display: none;' +
      '      }' +
      '' +
      '      .footer-banner-card-wrapper button.css-3uz0rz .css-fsvtbs {' +
      '        display: none;' +
      '      }' +
      '' +
      '      /* Remover overlay existente se houver */' +
      '      .footer-banner-card-wrapper .azul-friday-card-overlay {' +
      '        display: none !important;' +
      '      }' +
      '' +
      '      .footer-banner-card__info {' +
      '        background: #fff;' +
      '        padding: 24px 24px 32px;' +
      '        display: flex;' +
      '        flex-direction: column;' +
      '        gap: 10px;' +
      '        min-height: 150px;' +
      '        margin-top: 0;' +
      '        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);' +
      '        position: relative;' +
      '        z-index: 1;' +
      '        width: 100%;' +
      '        box-sizing: border-box;' +
      '      }' +
      '' +
      '      .footer-banner-card__title {' +
      '        font-size: 18px;' +
      '        font-weight: 700;' +
      '        color: #0a1f44;' +
      '      }' +
      '' +
      '      .footer-banner-card__cta {' +
      '        display: inline-flex;' +
      '        align-items: center;' +
      '        justify-content: center;' +
      '        padding: 10px 28px;' +
      '        border-radius: 999px;' +
      '        background: #cf527a;' +
      '        color: #fff;' +
      '        font-weight: 600;' +
      '        font-size: 14px;' +
      '        text-decoration: none;' +
      '        margin-top: 5px;' +
      '        width: fit-content;' +
      '        align-self: center;' +
      '        transition: transform 0.2s ease, box-shadow 0.2s ease;' +
      '      }' +
      '' +
      '      .footer-banner-card__cta:hover,' +
      '      .footer-banner-card__cta:focus-visible {' +
      '        transform: translateY(-2px);' +
      '        box-shadow: 0 6px 16px rgba(255, 79, 154, 0.35);' +
      '      }' +
      '' +
      '      /* Mobile: abaixo de 768px - todos os cards verticais */' +
      '      @media (max-width: 767px) {' +
      '        .css-1ngnp0i.footer-banners-grid,' +
      '        .footer-banners-grid {' +
      '          display: flex !important;' +
      '          flex-direction: column !important;' +
      '          gap: 16px !important;' +
      '          padding: 0 16px;' +
      '          box-sizing: border-box;' +
      '          width: 100% !important;' +
      '        }' +
      '' +
      '        .footer-banner-card-wrapper {' +
      '          width: 100% !important;' +
      '          max-width: 100% !important;' +
      '          margin: 0 auto;' +
      '        }' +
      '      }' +
      '' +
      '      /* Tablet: 768px a 1023px */' +
      '      @media (min-width: 768px) and (max-width: 1023px) {' +
      '        .css-1ngnp0i.footer-banners-grid,' +
      '        .footer-banners-grid {' +
      '          display: flex !important;' +
      '          flex-direction: row !important;' +
      '          gap: 16px !important;' +
      '          width: 100% !important;' +
      '          max-width: 960px;' +
      '        }' +
      '' +
      '        .footer-banner-card-wrapper {' +
      '          width: 100% !important;' +
      '          flex: 1 !important;' +
      '        }' +
      '      }' +
      '' +
      '      /* Desktop: > 1024px */' +
      '      @media (min-width: 1024px) {' +
      '        .css-1ngnp0i.footer-banners-grid,' +
      '        .footer-banners-grid {' +
      '          display: flex !important;' +
      '          flex-direction: row !important;' +
      '          gap: 16px !important;' +
      '          width: 100% !important;' +
      '          max-width: 1200px; /* Limite máximo para não esticar demais */' +
      '        }' +
      '' +
      '        .css-1ngnp0i.footer-banners-grid .footer-banner-card-wrapper,' +
      '        .footer-banners-grid .footer-banner-card-wrapper {' +
      '          width: 100% !important;' +
      '          flex: 1 !important;' +
      '          max-width: none !important;' +
      '        }' +
      '' +
      '        @media (min-width: 1068px) {' +
      '          .footer-banner-card-wrapper {' +
      '            /* Remover largura fixa para manter flexibilidade */' +
      '            width: 100% !important;' +
      '            max-width: none !important;' +
      '          }' +
      '        }' +
      '      }' +
      '    ';

    document.head.appendChild(style);
  };

  const addInfoToButton = (button, banner) => {
    if (!button) return;

    // Verificar se já foi processado
    if (button.closest('.footer-banner-card-wrapper')) {
      return;
    }

    // O botão está dentro de uma div (wrapper original)
    const originalDivWrapper = button.parentElement;
    if (!originalDivWrapper) return;

    // Pegar a imagem nativa e converter para background-image
    const img = findButtonImage(button);

    // Criar cardWrapper
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'footer-banner-card-wrapper';

    if (img && img.src) {
      // Aguardar o carregamento da imagem para calcular altura
      const setBackground = () => {
        const cardWidth = getCardWidth(cardWrapper, button);
        applyButtonHeight(button, img, cardWidth);
      };

      if (img.complete) {
        setBackground();
      } else {
        img.addEventListener('load', setBackground);
        img.addEventListener('error', setBackground);
      }
    }

    // Remover overlay existente se houver
    const existingOverlay = button.querySelector('.azul-friday-card-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Remover a div vazia que vem após o botão (se existir)
    const emptyDiv = originalDivWrapper.querySelector('div:empty');
    if (emptyDiv && emptyDiv !== cardWrapper) {
      emptyDiv.remove();
    }

    const info = document.createElement('div');
    info.className = 'footer-banner-card__info';
    info.innerHTML = '<span class="footer-banner-card__title">' + banner.title + '</span>';

    const cta = document.createElement('a');
    cta.className = 'footer-banner-card__cta';
    cta.href = banner.href;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.setAttribute('aria-label', banner.ariaLabel);
    cta.textContent = banner.ctaLabel;

    // Adicionar tracking Adobe Analytics no clique
    cta.addEventListener('click', function (e) {
      trackFooterBannerClick(banner.id, banner.title);
    });

    info.appendChild(cta);

    // Envolver o botão no cardWrapper e substituir o conteúdo da div original
    // Manter a estrutura: div original > cardWrapper > button + info
    originalDivWrapper.innerHTML = '';
    originalDivWrapper.appendChild(cardWrapper);
    cardWrapper.appendChild(button);
    cardWrapper.appendChild(info);

    // Função para recalcular altura do botão baseada na largura atual
    const recalculateButtonHeight = () => {
      const currentImg = img && img.src ? img : findButtonImage(button);
      if (!currentImg || !currentImg.src) return;

      const cardWidth = getCardWidth(cardWrapper, button);
      if (button.style.backgroundImage) {
        applyButtonHeight(button, currentImg, cardWidth);
      }
    };

    // Recalcular altura do botão após inserção no DOM
    if (img && img.src) {
      setTimeout(() => {
        recalculateButtonHeight();
      }, 10);

      // Armazenar referência para recalcular no resize global
      button._recalculateHeight = recalculateButtonHeight;
    }
  };

  const mountFooterBanners = (root) => {
    ensureStyles();

    // Buscar botões diretamente no root (.css-1ngnp0i)
    const buttons = Array.from(root.querySelectorAll('button.css-3uz0rz'));

    if (buttons.length < FOOTER_BANNERS_CONFIG.length) {
      console.warn('Not enough buttons found for footer banners. Found:', buttons.length, 'Expected:', FOOTER_BANNERS_CONFIG.length);
      // Tentar novamente após um delay
      setTimeout(() => {
        mountFooterBanners(root);
      }, 500);
      return;
    }

    // Filtrar apenas botões que ainda não foram processados
    const unprocessedButtons = buttons.filter(btn => !btn.closest('.footer-banner-card-wrapper'));

    if (unprocessedButtons.length < FOOTER_BANNERS_CONFIG.length) {
      console.warn('Not enough unprocessed buttons found. Some may have been already processed.');
      return;
    }

    // Processar cada botão
    FOOTER_BANNERS_CONFIG.forEach((banner, index) => {
      if (unprocessedButtons[index]) {
        addInfoToButton(unprocessedButtons[index], banner);
      }
    });

    // Aplicar classe de grid no container root (.css-1ngnp0i)
    // Isso fará com que os cards fiquem organizados em grid
    if (!root.classList.contains('footer-banners-grid')) {
      root.classList.add('footer-banners-grid');
    }
  };

  waitForRoot(FOOTER_ROOT_SELECTOR)
    .then((root) => {
      if (!root) return;

      // Executar imediatamente
      mountFooterBanners(root);

      // Observar mudanças no root para detectar quando botões são adicionados
      const observer = new MutationObserver(() => {
        const buttons = root.querySelectorAll('button.css-3uz0rz');
        const processedButtons = root.querySelectorAll('.footer-banner-card-wrapper button.css-3uz0rz');

        // Se há botões não processados, tentar processar novamente
        if (buttons.length >= FOOTER_BANNERS_CONFIG.length &&
          processedButtons.length < FOOTER_BANNERS_CONFIG.length) {
          mountFooterBanners(root);
        }
      });

      observer.observe(root, {
        childList: true,
        subtree: true
      });
    })
    .catch((error) => console.warn(error.message));

  // Listener global de resize para recalcular larguras e alturas dos botões
  let globalResizeTimeout;
  const handleGlobalResize = () => {
    clearTimeout(globalResizeTimeout);
    globalResizeTimeout = setTimeout(() => {
      // Recalcular alturas de todos os botões
      const buttons = document.querySelectorAll('.footer-banner-card-wrapper button.css-3uz0rz');
      buttons.forEach(button => {
        if (button._recalculateHeight && typeof button._recalculateHeight === 'function') {
          button._recalculateHeight();
        }
      });
    }, 100);
  };

  window.addEventListener('resize', handleGlobalResize);
})();

