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
  let clickDelegationDone = false;
  let trustDone = false;
  let categoriesDone = false;
  let bannerDone = false;
  let productsDone = false;
  let lastClickKey = '';
  let lastClickAt = 0;

  const TRACKING_CATEGORY = 'new_home_333';
  const DELEGATION_ATTR = 'data-at-new-home-controle-delegation';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;

  const TRUST_SELECTOR = '.sites-features-container';
  const CATEGORIES_BLOCK_SELECTOR = '.categories-block';
  const CATEGORIES_WRAPPER_SELECTOR = '.categories-wrapper';
  const BANNER_SELECTOR = '.banner.home';
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

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    if (
      window.gtmDataObject &&
      typeof window.gtmDataObject.push === 'function' &&
      window.gtmDataObject !== window.dataLayer
    ) {
      window.gtmDataObject.push(payload);
    }
  }

  function trackClickOnce(label) {
    if (!label) {
      return;
    }

    const now = Date.now();

    if (label === lastClickKey && now - lastClickAt < 400) {
      return;
    }

    lastClickKey = label;
    lastClickAt = now;
    sendTrackingEvent(label, 'click');
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

  function getBannerClickLabel(slide, isMobile) {
    const position = slide.getAttribute('data-banner-position') || '';
    const name = slugifyLabel(
      slide.getAttribute('data-banner-name') || slide.getAttribute('data-banner-title') || ''
    );

    if (String(position) === '1') {
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

  function closest(element, selector) {
    let current = element;

    if (current && current.nodeType === 3) {
      current = current.parentElement;
    }

    if (!current) {
      return null;
    }

    if (typeof current.closest === 'function') {
      return current.closest(selector);
    }

    while (current && current.nodeType === 1) {
      if (current.matches && current.matches(selector)) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  function isTrackablePointerEvent(event) {
    if (!event) {
      return false;
    }

    const button = typeof event.button === 'number' ? event.button : 0;

    if (event.type === 'mousedown') {
      return button === 1;
    }

    return button === 0 || button === 1;
  }

  function handleDelegatedClick(event) {
    if (!isTrackablePointerEvent(event)) {
      return;
    }

    const target = event.target;

    if (!target) {
      return;
    }

    const categoryItem = closest(target, '.category-item');

    if (categoryItem && closest(categoryItem, CATEGORIES_WRAPPER_SELECTOR)) {
      trackClickOnce(getCategoryLabel(categoryItem));
      return;
    }

    if (closest(target, '#category-arrow-prev')) {
      trackClickOnce('clicou_seta_categorias_anterior');
      return;
    }

    if (closest(target, '#category-arrow-next')) {
      trackClickOnce('clicou_seta_categorias_proxima');
      return;
    }

    const orcamentoLink = closest(target, TRUST_SELECTOR + ' a.buy-fast');

    if (orcamentoLink) {
      trackClickOnce('clicou_orcamento_relampago');
      return;
    }

    const desktopSlide = closest(
      target,
      BANNER_SELECTOR + ' .pagebuilder-lazyload-slider .slick-slide:not(.slick-cloned)'
    );

    if (desktopSlide && closest(target, 'a')) {
      trackClickOnce(getBannerClickLabel(desktopSlide, false));
      return;
    }

    const mobileItem = closest(target, BANNER_SELECTOR + ' .custom-carousel .carousel-item');

    if (mobileItem) {
      trackClickOnce(getBannerClickLabel(mobileItem, true));
    }
  }

  function bindClickDelegation() {
    if (clickDelegationDone || document.documentElement.getAttribute(DELEGATION_ATTR) === 'true') {
      clickDelegationDone = true;
      return true;
    }

    document.addEventListener('click', handleDelegatedClick, true);
    document.addEventListener('auxclick', handleDelegatedClick, true);
    document.addEventListener('mousedown', handleDelegatedClick, true);
    document.documentElement.setAttribute(DELEGATION_ATTR, 'true');
    clickDelegationDone = true;
    return true;
  }

  function bindTrustTracking() {
    if (trustDone) {
      return true;
    }

    const section = document.querySelector(TRUST_SELECTOR);

    if (!section) {
      return false;
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

    const block = document.querySelector(CATEGORIES_BLOCK_SELECTOR);
    const wrapper = document.querySelector(CATEGORIES_WRAPPER_SELECTOR);

    if (!block || !wrapper) {
      return false;
    }

    const items = wrapper.querySelectorAll('.category-item');

    if (!items.length) {
      return false;
    }

    if (!categoriesViewTracked) {
      categoriesViewTracked = true;
      sendTrackingEvent('visualizou_categorias_home', 'view');
    }

    categoriesDone = true;
    return true;
  }

  function bindBannerTracking() {
    if (bannerDone) {
      return true;
    }

    const banner = document.querySelector(BANNER_SELECTOR);

    if (!banner) {
      return false;
    }

    const hasDesktop = banner.querySelector(
      '.pagebuilder-lazyload-slider .slick-slide:not(.slick-cloned) a'
    );
    const hasMobile = banner.querySelector('.custom-carousel .carousel-item');

    if (!hasDesktop && !hasMobile) {
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
    return clickDelegationDone && trustDone && categoriesDone && bannerDone && productsDone;
  }

  function run() {
    if (isAllDone()) {
      return;
    }

    bindClickDelegation();
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
