  (() => {
  'use strict';

  const DESKTOP_ROOT_SELECTOR = '.css-615bn6';
  const MOBILE_HERO_SELECTOR = '.css-fqrmh2';
  const MOBILE_PAIR_SELECTOR = '.css-1391tka';
  const STYLE_ID = 'mini-banners-component-style';
  const MINI_BANNERS_CONFIG = [
    {
      id: 'mini-banner-passagens',
      title: 'Passagens',
      supportText: 'Encontre as tarifas mais baixas do ano para sua viagem.',
      ctaLabel: 'Ver ofertas de passagens',
      ariaLabel: 'Ver ofertas de passagens da Azul Friday',
      altText: 'Encontre as tarifas mais baixas do ano para sua viagem.',
      href: 'https://www.voeazul.com.br/br/pt/azul-friday/passagens'
    },
    {
      id: 'mini-banner-pacotes',
      title: 'Pacotes (Aéreo + Hotel)',
      supportText: 'Garanta férias completas com ofertas especiais em pacotes de viagem.',
      ctaLabel: 'Ver pacotes em promoção',
      ariaLabel: 'Ver pacotes em promoção da Azul Friday',
      altText: 'Garanta férias completas com ofertas especiais em pacotes de viagem.',
      href: 'https://www.voeazul.com.br/br/pt/azul-friday/viagem-completa'
    },
    {
      id: 'mini-banner-pontos',
      title: 'Pontos Azul Fidelidade',
      supportText: 'Seu saldo vale mais. Aproveite bônus e ofertas exclusivas.',
      ctaLabel: 'Ver ofertas de pontos',
      ariaLabel: 'Ver ofertas de pontos do Azul Fidelidade',
      altText: 'Oferta de Black Friday: Multiplique seus pontos com diversas ofertas do Azul Fidelidade.',
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
        const error = new Error('Mini banners root not found for selector ' + selector);
        if (silent) {
          resolve(null);
        } else {
          reject(error);
        }
      }, timeout);
    });

  /**
   * Função para detectar a largura do card baseada no viewport
   * Retorna a largura apropriada conforme o breakpoint
   */
  const getCardWidthForViewport = () => {
    const viewportWidth = window.innerWidth;
    return (viewportWidth >= 1068) ? 372.67 : 314.67;
  };

  /**
   * Função para calcular largura dinâmica dos cards mobile
   * Calcula baseado no viewport menos padding (32px total) e reduz 5% para evitar corte
   */
  const getMobileCardWidth = () => {
    return (window.innerWidth - 32) * 0.95;
  };

  /**
   * Função para aplicar largura dinâmica nos cards mobile
   */
  const applyMobileCardWidths = () => {
    if (window.innerWidth >= 768) return;
    
    const mobileCardWidth = getMobileCardWidth();
    const widthStr = mobileCardWidth + 'px';
    const cards = document.querySelectorAll('.mini-banner-card-wrapper--mobile-hero, .mini-banner-card-wrapper--mobile-half, .mini-banners-grid .mini-banner-card-wrapper:not(.mini-banner-card-wrapper--mobile)');
    
    cards.forEach(card => {
      card.style.width = widthStr;
      card.style.maxWidth = widthStr;
    });
  };

  /**
   * Função helper para buscar a imagem do botão
   * Prioriza css-bq6zc0, depois segunda imagem, depois primeira
   */
  const findButtonImage = (button) => {
    let img = button.querySelector('img.css-bq6zc0');
    if (img) return img;
    
    const allImages = Array.from(button.querySelectorAll('img'));
    if (allImages.length >= 2) return allImages[1];
    if (allImages.length === 1) return allImages[0];
    
    return button.querySelector('img.css-cw25l4') || button.querySelector('img:first-of-type');
  };

  /**
   * Função helper para calcular largura do card baseado no contexto
   */
  const getCardWidth = (variant, cardWrapper, button) => {
    if (variant === 'mobile' || window.innerWidth < 768) {
      return getMobileCardWidth();
    }
    const defaultCardWidth = getCardWidthForViewport();
    return cardWrapper.offsetWidth || button.offsetWidth || defaultCardWidth;
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
    
    // Se estamos usando a segunda imagem, também ocultar a primeira (se existir)
    if (img.classList && img.classList.contains('css-bq6zc0')) {
      const firstImg = button.querySelector('img.css-cw25l4');
      if (firstImg && firstImg !== img) {
        firstImg.style.display = 'none';
      }
    }
  };

  /**
   * Função para disparar tracking Adobe Analytics
   */
  const trackMiniBannerClick = (bannerId, bannerTitle) => {
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
      s.eVar82 = 'AT_BF_minibanner: ' + bannerTitle || 'Mini Banner Click'; // Ação do usuário
      
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
      '      .mini-banners-grid {' +
      '        display: grid;' +
      '        grid-template-columns: repeat(3, 1fr);' +
      '        gap: 16px;' +
      '        width: 100%;' +
      '        justify-items: center;' +
      '      }' +
      '' +
      '      .mini-banners-grid .mini-banner-card-wrapper {' +
      '        width: 314.67px;' +
      '        max-width: 314.67px;' +
      '      }' +
      '' +
      '      .mini-banners-grid .mini-banner-card-wrapper:not(.mini-banner-card-wrapper--mobile) {' +
      '        width: 314.67px;' +
      '        max-width: 314.67px;' +
      '      }' +
      '' +
      '      .mini-banners-mobile-container {' +
      '        display: flex;' +
      '        flex-direction: column;' +
      '        gap: 16px;' +
      '        width: 100%;' +
      '        max-width: 100%;' +
      '        margin: 0 auto;' +
      '        box-sizing: border-box;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper {' +
      '        font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;' +
      '        position: relative;' +
      '        display: flex;' +
      '        flex-direction: column;' +
      '        width: 314.67px;' +
      '        max-width: 314.67px;' +
      '        border-radius: 20px;' +
      '        overflow: hidden;' +
      '        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);' +
      '        box-sizing: border-box;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper:not(.mini-banner-card-wrapper--mobile) {' +
      '        width: 314.67px;' +
      '        max-width: 314.67px;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper button.css-3uz0rz {' +
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
      '      /* Background-image com 65% da altura - mostra apenas parte superior */' +
      '      /* background-size é calculado dinamicamente via JS para manter proporção */' +
      '      .mini-banner-card-wrapper button.css-3uz0rz[style*="background-image"] {' +
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
      '      .mini-banner-card-wrapper button.css-3uz0rz img.css-cw25l4 {' +
      '        display: block;' +
      '        width: 100%;' +
      '        height: auto;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper button.css-3uz0rz img.css-bq6zc0 {' +
      '        display: none;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper button.css-3uz0rz img:not(.css-cw25l4):not(.css-bq6zc0) {' +
      '        display: block;' +
      '        width: 100%;' +
      '        height: auto;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper button.css-3uz0rz .css-fsvtbs {' +
      '        display: none;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile {' +
      '        width: 100%;' +
      '        max-width: 100%;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-hero {' +
      '        width: 100%;' +
      '        max-width: 100%;' +
      '        flex-shrink: 0;' +
      '        box-sizing: border-box;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-hero button.css-3uz0rz {' +
      '        height: auto;' +
      '        flex: 1;' +
      '        display: flex;' +
      '        flex-direction: column;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-hero button.css-3uz0rz[style*="background-image"] {' +
      '        width: 100% !important;' +
      '        max-width: 100% !important;' +
      '        min-width: 0 !important;' +
      '        flex-shrink: 0 !important;' +
      '        flex-grow: 0 !important;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-hero button.css-3uz0rz img.css-cw25l4 {' +
      '        width: 100%;' +
      '        height: auto;' +
      '        object-fit: cover;' +
      '        flex-shrink: 0;' +
      '        display: block;' +
      '        max-width: 100%;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-hero .mini-banner-card__info {' +
      '        padding: 24px 24px 32px;' +
      '        margin-top: 0;' +
      '        min-height: auto;' +
      '        width: 100%;' +
      '        box-sizing: border-box;' +
      '        flex-shrink: 0;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-half {' +
      '        width: 100%;' +
      '        max-width: 100%;' +
      '        margin-top: 16px;' +
      '        flex-shrink: 0;' +
      '        flex-grow: 0;' +
      '        box-sizing: border-box;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-half button.css-3uz0rz {' +
      '        height: auto;' +
      '        flex: 1;' +
      '        display: flex;' +
      '        flex-direction: column;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-half button.css-3uz0rz[style*="background-image"] {' +
      '        width: 100% !important;' +
      '        max-width: 100% !important;' +
      '        min-width: 0 !important;' +
      '        flex-shrink: 0 !important;' +
      '        flex-grow: 0 !important;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-half button.css-3uz0rz img.css-cw25l4 {' +
      '        width: 100%;' +
      '        height: auto;' +
      '        object-fit: cover;' +
      '        flex-shrink: 0;' +
      '        display: block;' +
      '        max-width: 100%;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile-half .mini-banner-card__info {' +
      '        padding: 24px 24px 32px;' +
      '        margin-top: 0;' +
      '        min-height: auto;' +
      '        width: 100%;' +
      '        box-sizing: border-box;' +
      '        flex-shrink: 0;' +
      '      }' +
      '' +
      '      .mini-banner-card-wrapper--mobile button.css-3uz0rz img.css-bq6zc0 {' +
      '        display: none;' +
      '      }' +
      '' +
      '      .mini-banners-mobile-container,' +
      '      .mini-banners-mobile-pair {' +
      '        padding: 0 16px;' +
      '        box-sizing: border-box;' +
      '        width: 100%;' +
      '        max-width: 100%;' +
      '      }' +
      '' +
      '      /* Mobile: abaixo de 768px - todos os cards verticais com mesma largura */' +
      '      @media (max-width: 767px) {' +
      '        .mini-banners-grid {' +
      '          display: flex !important;' +
      '          flex-direction: column !important;' +
      '          gap: 16px;' +
      '          padding: 0 11px;' +
      '          box-sizing: border-box;' +
      '          width: 100%;' +
      '        }' +
      '' +
      '        .mini-banners-grid .mini-banner-card-wrapper:not(.mini-banner-card-wrapper--mobile) {' +
      '          margin: 0 auto;' +
      '        }' +
      '' +
      '        .mini-banner-card-wrapper--mobile-hero,' +
      '        .mini-banner-card-wrapper--mobile-half {' +
      '          margin: 0 auto;' +
      '        }' +
      '' +
      '        .mini-banner-card-wrapper--mobile-half {' +
      '          margin-top: 0 !important;' +
      '        }' +
      '' +
      '        .mini-banner-card-wrapper--mobile-hero .mini-banner-card__info,' +
      '        .mini-banner-card-wrapper--mobile-half .mini-banner-card__info {' +
      '          margin-top: 0;' +
      '        }' +
      '' +
      '        .mini-banners-mobile-container,' +
      '        .mini-banners-mobile-pair {' +
      '          display: flex !important;' +
      '          flex-direction: column !important;' +
      '          gap: 16px;' +
      '          padding: 0;' +
      '          width: 100%;' +
      '          max-width: 100%;' +
      '          box-sizing: border-box;' +
      '        }' +
      '' +
      '        .mini-banners-mobile-pair .mini-banner-card-wrapper--mobile-half {' +
      '          margin: 0 auto;' +
      '        }' +
      '' +
      '        .mini-banner-card-container {' +
      '          width: 100%;' +
      '          box-sizing: border-box;' +
      '        }' +
      '' +
      '        /* Ocultar divs vazias no mobile */' +
      '        .css-1391tka > div:empty,' +
      '        .css-1391tka > div > div:empty {' +
      '          display: none !important;' +
      '        }' +
      '' +
      '        .css-1391tka > div:not(:first-child) {' +
      '          display: none !important;' +
      '        }' +
      '' +
      '        .css-1391tka > div:first-child:empty {' +
      '          display: none !important;' +
      '        }' +
      '' +
      '        .css-1391tka {' +
      '          grid-template-columns: none !important;' +
      '          display: block !important;' +
      '        }' +
      '' +
      '        /* Adicionar margin-bottom na div pai do primeiro card */' +
      '        .css-fqrmh2 {' +
      '          margin-bottom: 16px !important;' +
      '        }' +
      '      }' +
      '' +
      '      /* Tablet: 768px a 1023px - grid com 3 colunas como desktop */' +
      '      @media (min-width: 768px) and (max-width: 1023px) {' +
      '        .mini-banners-grid {' +
      '          display: grid;' +
      '          grid-template-columns: repeat(3, 1fr);' +
      '          gap: 16px;' +
      '          width: 100%;' +
      '          max-width: 960px;' +
      '        }' +
      '' +
      '        .mini-banners-grid .mini-banner-card-wrapper:not(.mini-banner-card-wrapper--mobile) {' +
      '          width: 314.67px;' +
      '          max-width: 314.67px;' +
      '        }' +
      '' +
      '        .mini-banners-mobile-container,' +
      '        .mini-banners-mobile-pair {' +
      '          padding: 0;' +
      '          box-sizing: border-box;' +
      '          width: 100%;' +
      '          max-width: 960px;' +
      '          margin: 0 auto;' +
      '        }' +
      '' +
      '        .mini-banners-mobile-pair {' +
      '          display: grid !important;' +
      '          grid-template-columns: repeat(3, 1fr) !important;' +
      '          gap: 16px !important;' +
      '          width: 100% !important;' +
      '          max-width: 960px !important;' +
      '          margin: 0 auto !important;' +
      '        }' +
      '' +
      '        .mini-banner-card-container {' +
      '          width: 100%;' +
      '          box-sizing: border-box;' +
      '        }' +
      '' +
      '        .mini-banners-mobile-pair .mini-banner-card-container {' +
      '          width: 100%;' +
      '          max-width: 100%;' +
      '        }' +
      '' +
      '        .mini-banners-mobile-pair .mini-banner-card-wrapper--mobile-half {' +
      '          width: 100% !important;' +
      '          max-width: 100% !important;' +
      '          margin-top: 0 !important;' +
      '        }' +
      '' +
      '        .mini-banner-card-wrapper--mobile-hero .mini-banner-card__info,' +
      '        .mini-banner-card-wrapper--mobile-half .mini-banner-card__info {' +
      '          margin-top: 0;' +
      '        }' +
      '' +
      '        /* Remover limitações de divs parentes que estão limitando o espaço */' +
      '        .css-1391tka > div:nth-child(2),' +
      '        .css-1391tka > div:nth-child(3),' +
      '        .container-capsule.containerDefault.hide-on-desktop.css-oo7lgl > div > div.container-capsule.containerDefault.css-oo7lgl > div:nth-child(2) > div.css-1391tka > div:nth-child(2),' +
      '        .container-capsule.containerDefault.hide-on-desktop.css-oo7lgl > div > div.container-capsule.containerDefault.css-oo7lgl > div:nth-child(2) > div.css-1391tka > div:nth-child(3) {' +
      '          width: 100% !important;' +
      '          max-width: 100% !important;' +
      '          padding: 0 !important;' +
      '          margin: 0 !important;' +
      '          box-sizing: border-box !important;' +
      '        }' +
      '' +
      '        .css-1391tka {' +
      '          width: 100% !important;' +
      '          max-width: 100% !important;' +
      '          display: block !important;' +
      '          grid-template-columns: none !important;' +
      '        }' +
      '' +
      '        /* Garantir que containers pais não limitem o espaço */' +
      '        .container-capsule.containerDefault.hide-on-desktop.css-oo7lgl > div > div.container-capsule.containerDefault.css-oo7lgl > div:nth-child(2),' +
      '        .container-capsule.containerDefault.hide-on-desktop.css-oo7lgl > div > div.container-capsule.containerDefault.css-oo7lgl {' +
      '          width: 100% !important;' +
      '          max-width: 100% !important;' +
      '          padding: 0 !important;' +
      '          box-sizing: border-box !important;' +
      '        }' +
      '' +
      '        /* Ocultar divs vazias no tablet e mobile */' +
      '        .css-1391tka > div:empty,' +
      '        .css-1391tka > div > div:empty {' +
      '          display: none !important;' +
      '        }' +
      '' +
      '        /* Ocultar divs que não contêm nossos componentes */' +
      '        .css-1391tka > div:not(:first-child) {' +
      '          display: none !important;' +
      '        }' +
      '' +
      '        .css-1391tka > div:first-child:empty {' +
      '          display: none !important;' +
      '        }' +
      '' +
      '        /* Adicionar margin-bottom na div pai do primeiro card */' +
      '        .css-fqrmh2 {' +
      '          margin-bottom: 16px !important;' +
      '        }' +
      '      }' +
      '' +
      '      /* Desktop: > 1024px - flex com 3 colunas */' +
      '      @media (min-width: 1024px) {' +
      '        .mini-banners-grid {' +
      '          display: flex !important;' +
      '          flex-direction: row !important;' +
      '          gap: 16px !important;' +
      '          grid-template-columns: none !important;' +
      '        }' +
      '' +
      '        .css-615bn6 {' +
      '          display: flex !important;' +
      '        }' +
      '' +
      '        .mini-banners-grid .mini-banner-card-wrapper:not(.mini-banner-card-wrapper--mobile) {' +
      '          width: 100% !important;' +
      '          max-width: 100% !important;' +
      '          flex: 1 1 0 !important;' +
      '        }' +
      '      }' +
      '' +
      '      .mini-banner-card__info {' +
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
      '      .mini-banner-card__title {' +
      '        font-size: 18px;' +
      '        font-weight: 700;' +
      '        color: #0a1f44;' +
      '      }' +
      '' +
      '      .mini-banner-card__support {' +
      '        font-size: 14px;' +
      '        color: #44506b;' +
      '        line-height: 1.4;' +
      '      }' +
      '' +
      '      .mini-banner-card__cta {' +
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
      '      .mini-banner-card__cta:hover,' +
      '      .mini-banner-card__cta:focus-visible {' +
      '        transform: translateY(-2px);' +
      '        box-shadow: 0 6px 16px rgba(255, 79, 154, 0.35);' +
      '      }' +
      '' +
      '    ';

    document.head.appendChild(style);
  };

  const addInfoToButton = (button, banner, variant = 'desktop', cardIndex = 0) => {
    if (!button) return;

    if (button.closest('.mini-banner-card-wrapper')) {
      return;
    }

    const wrapper = button.parentElement;
    if (!wrapper) return;

    // Pegar a imagem nativa e converter para background-image
    const img = findButtonImage(button);
    
    // Criar cardWrapper antes de definir setBackground para evitar erro de inicialização
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'mini-banner-card-wrapper';
    if (variant === 'mobile') {
      cardWrapper.classList.add('mini-banner-card-wrapper--mobile');
      if (cardIndex === 0) {
        cardWrapper.classList.add('mini-banner-card-wrapper--mobile-hero');
      } else {
        cardWrapper.classList.add('mini-banner-card-wrapper--mobile-half');
      }
    }
    
    if (img && img.src) {
      // Aguardar o carregamento da imagem para calcular altura
      const setBackground = () => {
        const cardWidth = getCardWidth(variant, cardWrapper, button);
        applyButtonHeight(button, img, cardWidth);
      };
      
      if (img.complete) {
        setBackground();
      } else {
        img.addEventListener('load', setBackground);
        img.addEventListener('error', setBackground);
      }
    }

    const info = document.createElement('div');
    info.className = 'mini-banner-card__info';
    info.innerHTML = '<span class="mini-banner-card__title">' + banner.title + '</span>' +
      '<p class="mini-banner-card__support">' + banner.supportText + '</p>';

    const cta = document.createElement('a');
    cta.className = 'mini-banner-card__cta';
    cta.href = banner.href;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.setAttribute('aria-label', banner.ariaLabel);
    cta.textContent = banner.ctaLabel;
    
    // Adicionar tracking Adobe Analytics no clique
    cta.addEventListener('click', function(e) {
      trackMiniBannerClick(banner.id, banner.title);
    });

    info.appendChild(cta);

    wrapper.insertBefore(cardWrapper, button);
    cardWrapper.appendChild(button);
    cardWrapper.appendChild(info);
    
    // Função para recalcular altura do botão baseada na largura atual
    const recalculateButtonHeight = () => {
      const currentImg = img && img.src ? img : findButtonImage(button);
      if (!currentImg || !currentImg.src) return;
      
      const cardWidth = getCardWidth(variant, cardWrapper, button);
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

  const mountDesktopBanners = (root) => {
    ensureStyles();
    
    const buttons = Array.from(root.querySelectorAll('button.css-3uz0rz'));
    if (buttons.length < MINI_BANNERS_CONFIG.length) {
      console.warn('Not enough buttons found for desktop banners');
      return;
    }

    MINI_BANNERS_CONFIG.forEach((banner, index) => {
      if (buttons[index]) {
        addInfoToButton(buttons[index], banner, 'desktop');
      }
    });

    const wrappers = Array.from(root.querySelectorAll('.mini-banner-card-wrapper'));
    if (wrappers.length > 0) {
      const grid = document.createElement('div');
      grid.className = 'mini-banners-grid';
      
      const fragment = document.createDocumentFragment();
      wrappers.forEach(wrapper => fragment.appendChild(wrapper));
      grid.appendChild(fragment);
      
      root.innerHTML = '';
      root.appendChild(grid);
    }
    
    // Aplicar largura dinâmica para mobile se necessário
    setTimeout(() => {
      applyMobileCardWidths();
    }, 100);
  };

  const mountMobileHero = (root) => {
    if (!root) return;
    ensureStyles();
    
    const buttons = Array.from(root.querySelectorAll('button.css-3uz0rz'));
    if (buttons.length === 0) return;

    addInfoToButton(buttons[0], MINI_BANNERS_CONFIG[0], 'mobile', 0);

    // Adicionar margin-bottom na div pai do primeiro card para tablet e mobile
    const parentDiv = root.parentElement;
    if (parentDiv && parentDiv.tagName === 'DIV') {
      parentDiv.style.marginBottom = '16px';
    }
    
    // Aplicar largura dinâmica para mobile
    setTimeout(() => {
      applyMobileCardWidths();
    }, 100);
  };

  const mountMobilePair = (root) => {
    if (!root) return;
    ensureStyles();
    
    const buttons = Array.from(root.querySelectorAll('button.css-3uz0rz'));
    if (buttons.length < 2) return;

    const pairWrapper = document.createElement('div');
    pairWrapper.className = 'mini-banners-mobile-pair';
    pairWrapper.style.display = 'flex';
    pairWrapper.style.flexDirection = 'column';
    pairWrapper.style.gap = '16px';
    pairWrapper.style.width = '100%';
    pairWrapper.style.maxWidth = '100%';
    pairWrapper.style.margin = '0 auto';
    pairWrapper.style.alignItems = 'stretch';

    buttons.forEach((button, index) => {
      if (index < 2 && MINI_BANNERS_CONFIG[index + 1]) {
        addInfoToButton(button, MINI_BANNERS_CONFIG[index + 1], 'mobile', index + 1);
        const wrapper = button.closest('.mini-banner-card-wrapper');
        if (wrapper) {
          // Criar uma div separada para cada card para melhor manutenção
          const cardContainer = document.createElement('div');
          cardContainer.className = 'mini-banner-card-container mini-banner-card-container--' + (index + 1);
          cardContainer.style.width = '100%';
          cardContainer.style.boxSizing = 'border-box';
          cardContainer.appendChild(wrapper);
          pairWrapper.appendChild(cardContainer);
        }
      }
    });

    // Limpar todo o conteúdo do root
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    
    // Adicionar apenas o pairWrapper diretamente no root
    root.appendChild(pairWrapper);
    
    // Remover qualquer div vazia que possa ter sido criada pela estrutura original
    const removeEmptyDivs = (element) => {
      const children = Array.from(element.children);
      children.forEach(child => {
        if (child.tagName === 'DIV') {
          const hasContent = child.textContent.trim() || 
                           child.querySelector('button, img, a, span, p, .mini-banner-card-wrapper, .mini-banner-card-container, .mini-banners-mobile-pair');
          if (!hasContent) {
            child.remove();
          } else {
            removeEmptyDivs(child);
          }
        }
      });
    };
    
    // Remover divs vazias após um pequeno delay para garantir que o DOM foi atualizado
    setTimeout(() => {
      removeEmptyDivs(root);
      // Aplicar largura dinâmica para mobile
      applyMobileCardWidths();
    }, 10);
  };

  waitForRoot(DESKTOP_ROOT_SELECTOR)
    .then((root) => root && mountDesktopBanners(root))
    .catch((error) => console.warn(error.message));

  waitForRoot(MOBILE_HERO_SELECTOR, { silent: true })
    .then((root) => root && mountMobileHero(root))
    .catch(() => {});

  waitForRoot(MOBILE_PAIR_SELECTOR, { silent: true })
    .then((root) => root && mountMobilePair(root))
    .catch(() => {});

  // Listener global de resize para recalcular larguras mobile e alturas dos botões
  let globalResizeTimeout;
  const handleGlobalResize = () => {
    clearTimeout(globalResizeTimeout);
    globalResizeTimeout = setTimeout(() => {
      // Recalcular larguras mobile
      applyMobileCardWidths();
      
      // Recalcular alturas de todos os botões
      const buttons = document.querySelectorAll('button.css-3uz0rz');
      buttons.forEach(button => {
        if (button._recalculateHeight && typeof button._recalculateHeight === 'function') {
          button._recalculateHeight();
        }
      });
    }, 100);
  };
  
  window.addEventListener('resize', handleGlobalResize);
  
  // Aplicar largura inicial após um pequeno delay para garantir que os elementos foram criados
  setTimeout(() => {
    applyMobileCardWidths();
  }, 500);
})();