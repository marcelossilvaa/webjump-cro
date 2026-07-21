/* ============================================================
   333OBRA — TESTE A/B HOME (CONTROLE)
   Somente tagueamento dos componentes nativos da home,
   com os mesmos eventos da variante para comparacao.
   ============================================================ */
(function () {
  'use strict';

  let retryCount = 0;
  let trustViewTracked = false;
  let categoriesViewTracked = false;
  let bannerViewTracked = false;
  let productsViewTracked = false;
  let trustDone = false;
  let categoriesDone = false;
  let bannerDone = false;
  let productsDone = false;

  const TRACKING_CATEGORY = 'new_home_333';
  const TRACKING_ATTR = 'data-at-new-home-controle-tracking';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;

  const TRUST_SELECTOR = '.sites-features-container';
  const CATEGORIES_WRAPPER_SELECTOR = '.categories-wrapper';
  const CATEGORY_ITEM_SELECTOR = CATEGORIES_WRAPPER_SELECTOR + ' .category-item';
  const ARROW_PREV_SELECTOR = '#category-arrow-prev';
  const ARROW_NEXT_SELECTOR = '#category-arrow-next';
  const BANNER_SELECTOR = '.banner.home';
  const BANNER_SLIDE_SELECTOR =
    '.banner.home .pagebuilder-lazyload-slider .slick-slide:not(.slick-cloned)';
  const MOBILE_BANNER_ITEM_SELECTOR = '.banner.home .custom-carousel .carousel-item';
  const PRODUCTS_SELECTOR = '.block-products, #carousel-container';

  const CATEGORY_MATCHES = [
    'whatsapp-ofertas',
    'promocoes.html',
    'cimentos',
    'argamassas',
    'rejuntes',
    'areia-e-pedra-cal',
    'aco-para-construc-o',
    'tijolos-e-blocos',
    'impermeabilizantes',
    'telhas',
    'lajes',
    'materiais-hidraulicos',
    'materiais-eletricos',
    'lonas',
    'madeira-para-construc-o',
    'ferragens',
    'ferramentas',
    'lou-as-e-metais',
    'moveis-cozinha-e-banheiro',
    'pisos-revestimentos-e-porcelanatos',
    'pintura',
    'concreto',
    'porta-e-janela',
    'equipamentos-para-locac-o',
  ];

  function sendTrackingEvent(label, action) {
    if (!label) {
      return;
    }

    const payload = {
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action || 'click',
      local_event_label: label,
    };

    if (window.gtmDataObject && typeof window.gtmDataObject.push === 'function') {
      window.gtmDataObject.push(payload);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function addTrackedClick(element, label) {
    if (!element || element.getAttribute(TRACKING_ATTR) === 'true') {
      return;
    }

    element.addEventListener('click', function () {
      sendTrackingEvent(label, 'click');
    });

    element.setAttribute(TRACKING_ATTR, 'true');
  }

  function slugifyLabel(value) {
    if (!value) {
      return '';
    }

    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function getCategoryMatch(href) {
    if (!href) {
      return '';
    }

    for (let i = 0; i < CATEGORY_MATCHES.length; i += 1) {
      if (href.indexOf(CATEGORY_MATCHES[i]) !== -1) {
        return CATEGORY_MATCHES[i];
      }
    }

    return '';
  }

  function getCategoryLabel(item) {
    const href = item.getAttribute('href') || '';
    const match = getCategoryMatch(href);

    if (match) {
      return 'clicou_categoria_' + slugifyLabel(match);
    }

    const textEl = item.querySelector('p');
    const text = textEl ? textEl.textContent : '';

    return 'clicou_categoria_' + slugifyLabel(text || href || 'categoria');
  }

  function bindTrustTracking() {
    if (trustDone) {
      return true;
    }

    const section = document.querySelector(TRUST_SELECTOR);

    if (!section) {
      return false;
    }

    const orcamentoLink = section.querySelector('a.buy-fast');

    if (orcamentoLink) {
      addTrackedClick(orcamentoLink, 'clicou_orcamento_relampago');
    }

    if (!trustViewTracked) {
      trustViewTracked = true;
      sendTrackingEvent('visualizou_secao_confianca', 'view');
    }

    trustDone = true;
    return true;
  }

  function bindCategoriesTracking() {
    if (categoriesDone) {
      return true;
    }

    const wrapper = document.querySelector(CATEGORIES_WRAPPER_SELECTOR);
    const prevArrow = document.querySelector(ARROW_PREV_SELECTOR);
    const nextArrow = document.querySelector(ARROW_NEXT_SELECTOR);

    if (!wrapper) {
      return false;
    }

    const items = wrapper.querySelectorAll(CATEGORY_ITEM_SELECTOR);

    if (!items.length) {
      return false;
    }

    for (let i = 0; i < items.length; i += 1) {
      addTrackedClick(items[i], getCategoryLabel(items[i]));
    }

    if (prevArrow) {
      addTrackedClick(prevArrow, 'clicou_seta_categorias_anterior');
    }

    if (nextArrow) {
      addTrackedClick(nextArrow, 'clicou_seta_categorias_proxima');
    }

    if (!categoriesViewTracked) {
      categoriesViewTracked = true;
      sendTrackingEvent('visualizou_categorias_home', 'view');
    }

    if ((prevArrow && nextArrow) || retryCount >= 10) {
      categoriesDone = true;
      return true;
    }

    return false;
  }

  function getBannerClickLabel(slide, isMobile) {
    const position = slide.getAttribute('data-banner-position') || '';
    const name = slugifyLabel(
      slide.getAttribute('data-banner-name') || slide.getAttribute('data-banner-title') || ''
    );

    if (position === '1' || position === 1) {
      return isMobile ? 'clicou_banner_home_mobile' : 'clicou_banner_home_desktop';
    }

    if (name) {
      return 'clicou_banner_home_' + name;
    }

    if (position) {
      return 'clicou_banner_home_posicao_' + position;
    }

    return isMobile ? 'clicou_banner_home_mobile' : 'clicou_banner_home_desktop';
  }

  function bindBannerTracking() {
    if (bannerDone) {
      return true;
    }

    const banner = document.querySelector(BANNER_SELECTOR);

    if (!banner) {
      return false;
    }

    let bound = false;
    const desktopSlides = document.querySelectorAll(BANNER_SLIDE_SELECTOR);

    for (let i = 0; i < desktopSlides.length; i += 1) {
      const slide = desktopSlides[i];
      const link = slide.querySelector('a[data-element="link"]') || slide.querySelector('a');

      if (!link) {
        continue;
      }

      addTrackedClick(link, getBannerClickLabel(slide, false));
      bound = true;
    }

    const mobileItems = document.querySelectorAll(MOBILE_BANNER_ITEM_SELECTOR);

    for (let j = 0; j < mobileItems.length; j += 1) {
      const item = mobileItems[j];
      const mobileLink = item.querySelector('a') || item;

      addTrackedClick(mobileLink, getBannerClickLabel(item, true));
      bound = true;
    }

    if (!bound) {
      return false;
    }

    if (!bannerViewTracked) {
      bannerViewTracked = true;
      sendTrackingEvent('visualizou_banner_home', 'view');
    }

    bannerDone = true;
    return true;
  }

  function bindProductsTracking() {
    if (productsDone) {
      return true;
    }

    const products = document.querySelector(PRODUCTS_SELECTOR);

    if (!products) {
      if (retryCount >= 10) {
        productsDone = true;
        return true;
      }

      return false;
    }

    if (!productsViewTracked) {
      productsViewTracked = true;
      sendTrackingEvent('visualizou_produtos_home', 'view');
    }

    productsDone = true;
    return true;
  }

  function isAllDone() {
    return trustDone && categoriesDone && bannerDone && productsDone;
  }

  function run() {
    if (isAllDone()) {
      return;
    }

    bindTrustTracking();
    bindCategoriesTracking();
    bindBannerTracking();
    bindProductsTracking();

    if (isAllDone()) {
      return;
    }

    if (retryCount < MAX_RETRIES) {
      retryCount += 1;
      window.setTimeout(run, RETRY_DELAY);
    }
  }

  function init() {
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
