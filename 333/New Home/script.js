/* ============================================================
   333OBRA — TESTE A/B HOME
   Script unificado: seção de confiança + categorias/setas + banner + produtos
   Cada bloco roda em seu próprio IIFE, isolado dos demais.
   ============================================================ */

/* ------------------------------------------------------------
   1) SEÇÃO DE CONFIANÇA (4 itens) — com fix do warning W083
   ------------------------------------------------------------ */
(function () {
  'use strict';

  let retryCount = 0;
  let isDone = false;
  let viewTracked = false;

  const STYLE_ID = 'at-333-new-trust-section-style-v2';
  const SECTION_SELECTOR = '.sites-features-container';
  const FLAG_ATTR = 'data-at-new-trust-applied';
  const CAROUSEL_FLAG = 'data-at-trust-carousel-init';
  const ROOT_CLASS = 'at-trust-section';
  const MOBILE_MEDIA = '(max-width: 768px)';
  const AUTOPLAY_DELAY = 4000;
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;
  const TRACKING_CATEGORY = 'new_home_333';

  const ICON_AVALIACAO =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693226/Icon_2_avwwk1.png';
  const ICON_LOJAS =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693226/Icon_2_avwwk1.png';
  const ICON_ENTREGA =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693226/Icon_2_avwwk1.png';
  const ICON_GARANTIDA =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783693225/Icon_3_hfkdh0.png';

  const TRUST_ITEMS = [
    {
      icon: ICON_AVALIACAO,
      title: '9.5/10 de avaliação',
      subtitle: 'no Reclame Aqui',
    },
    {
      icon: ICON_LOJAS,
      title: '+200 lojas parceiras',
      subtitle: 'de confiança',
    },
    {
      icon: ICON_ENTREGA,
      title: 'Entrega rápida',
      subtitle: 'ou retirada gratuita',
    },
    {
      icon: ICON_GARANTIDA,
      title: 'Compra 100% garantida',
      subtitle: 'pagamento seguro',
    },
  ];

  function isMobileView() {
    return window.matchMedia(MOBILE_MEDIA).matches;
  }

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

  function trackViewOnce() {
    if (viewTracked) {
      return;
    }

    viewTracked = true;
    sendTrackingEvent('visualizou_secao_confianca', 'view');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      SECTION_SELECTOR + ' {',
      '  background: #fff !important;',
      '}',
      SECTION_SELECTOR + '[' + FLAG_ATTR + '="true"] [data-content-type="row"] {',
      '  display: none !important;',
      '}',
      SECTION_SELECTOR + '[' + FLAG_ATTR + '="true"] {',
      '  height: 105px !important;',
      '  min-height: 105px !important;',
      '  padding: 0 16px !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  box-sizing: border-box !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + ' {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  align-items: stretch !important;',
      '  justify-content: center !important;',
      '  gap: 8px !important;',
      '  width: 100% !important;',
      '  max-width: 1200px !important;',
      '  margin: 0 auto !important;',
      '  box-sizing: border-box !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__slider {',
      '  width: 100% !important;',
      '  overflow: hidden !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__track {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  width: 100% !important;',
      '  transition: transform 0.35s ease !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__item {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 12px !important;',
      '  flex: 1 1 0 !important;',
      '  min-width: 0 !important;',
      '  box-sizing: border-box !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__icon {',
      '  flex: 0 0 36px !important;',
      '  width: 36px !important;',
      '  height: 36px !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__icon img {',
      '  display: block !important;',
      '  width: 36px !important;',
      '  height: 36px !important;',
      '  object-fit: contain !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__text {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 2px !important;',
      '  min-width: 0 !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__title {',
      '  margin: 0 !important;',
      '  color: #1f2a44 !important;',
      '  font-family: Ubuntu, Arial, sans-serif !important;',
      '  font-size: 16px !important;',
      '  font-weight: 700 !important;',
      '  line-height: 1.2 !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__subtitle {',
      '  margin: 0 !important;',
      '  color: #6b7c93 !important;',
      '  font-family: Ubuntu, Arial, sans-serif !important;',
      '  font-size: 16px !important;',
      '  font-weight: 400 !important;',
      '  line-height: 1.2 !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__dots {',
      '  display: none !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 6px !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  list-style: none !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__dot {',
      '  width: 8px !important;',
      '  height: 8px !important;',
      '  padding: 0 !important;',
      '  border: 0 !important;',
      '  border-radius: 50% !important;',
      '  background: #d1d9e6 !important;',
      '  cursor: pointer !important;',
      '}',
      SECTION_SELECTOR + ' .' + ROOT_CLASS + '__dot.is-active {',
      '  background: #e8612a !important;',
      '}',
      '@media only screen and (min-width: 769px) {',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '__track {',
      '    justify-content: space-between !important;',
      '    gap: 16px !important;',
      '    transform: none !important;',
      '  }',
      '}',
      '@media only screen and (max-width: 768px) {',
      '  ' + SECTION_SELECTOR + '[' + FLAG_ATTR + '="true"] {',
      '    padding: 0 !important;',
      '  }',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '--mobile {',
      '    gap: 6px !important;',
      '    height: 100% !important;',
      '  }',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '--mobile .' + ROOT_CLASS + '__track {',
      '    gap: 0 !important;',
      '  }',
      '  ' + SECTION_SELECTOR + ' .' + ROOT_CLASS + '--mobile .' + ROOT_CLASS + '__item {',
      '  flex: 0 0 100% !important;',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  padding: 0 16px !important;',
      '}',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function createTrustItem(item) {
    const itemEl = document.createElement('div');
    itemEl.className = ROOT_CLASS + '__item';

    const iconEl = document.createElement('div');
    iconEl.className = ROOT_CLASS + '__icon';

    const imgEl = document.createElement('img');
    imgEl.setAttribute('src', item.icon);
    imgEl.setAttribute('alt', item.title);
    imgEl.setAttribute('loading', 'lazy');
    imgEl.setAttribute('width', '36');
    imgEl.setAttribute('height', '36');
    iconEl.appendChild(imgEl);

    const textEl = document.createElement('div');
    textEl.className = ROOT_CLASS + '__text';

    const titleEl = document.createElement('p');
    titleEl.className = ROOT_CLASS + '__title';
    titleEl.textContent = item.title;

    const subtitleEl = document.createElement('p');
    subtitleEl.className = ROOT_CLASS + '__subtitle';
    subtitleEl.textContent = item.subtitle;

    textEl.appendChild(titleEl);
    textEl.appendChild(subtitleEl);
    itemEl.appendChild(iconEl);
    itemEl.appendChild(textEl);

    return itemEl;
  }

  function buildTrustSection() {
    const root = document.createElement('div');
    root.className = ROOT_CLASS;
    root.setAttribute(FLAG_ATTR + '-root', 'true');

    const slider = document.createElement('div');
    slider.className = ROOT_CLASS + '__slider';

    const track = document.createElement('div');
    track.className = ROOT_CLASS + '__track';

    for (let i = 0; i < TRUST_ITEMS.length; i += 1) {
      track.appendChild(createTrustItem(TRUST_ITEMS[i]));
    }

    slider.appendChild(track);
    root.appendChild(slider);

    const dots = document.createElement('div');
    dots.className = ROOT_CLASS + '__dots';
    root.appendChild(dots);

    return root;
  }

  function updateDots(dots, activeIndex) {
    const buttons = dots.querySelectorAll('.' + ROOT_CLASS + '__dot');

    for (let i = 0; i < buttons.length; i += 1) {
      if (i === activeIndex) {
        buttons[i].classList.add('is-active');
        buttons[i].setAttribute('aria-selected', 'true');
      } else {
        buttons[i].classList.remove('is-active');
        buttons[i].setAttribute('aria-selected', 'false');
      }
    }
  }

  function initMobileCarousel(root) {
    if (root.getAttribute(CAROUSEL_FLAG) === 'true') {
      return;
    }

    const track = root.querySelector('.' + ROOT_CLASS + '__track');
    const slides = root.querySelectorAll('.' + ROOT_CLASS + '__item');
    const dots = root.querySelector('.' + ROOT_CLASS + '__dots');
    let currentIndex = 0;
    let autoplayTimer = null;
    let touchStartX = 0;
    let touchDeltaX = 0;

    if (!track || !slides.length || !dots) {
      return;
    }

    // FIX (W083): a função de clique agora é criada por uma factory
    // nomeada e declarada FORA do loop, em vez de uma function/IIFE
    // criada a cada iteração dentro do for.
    function createDotClickHandler(index) {
      return function handleDotClick() {
        sendTrackingEvent('clicou_dot_confianca_' + (index + 1), 'click');
        goToSlide(index);
        restartAutoplay();
      };
    }

    for (let i = 0; i < slides.length; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = ROOT_CLASS + '__dot';
      dot.setAttribute('aria-label', 'Ir para item ' + (i + 1));
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', createDotClickHandler(i));
      dots.appendChild(dot);
    }

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      if (isMobileView()) {
        track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
        updateDots(dots, currentIndex);
      } else {
        track.style.transform = '';
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();

      if (!isMobileView()) {
        return;
      }

      autoplayTimer = window.setInterval(function () {
        goToSlide(currentIndex + 1);
      }, AUTOPLAY_DELAY);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    function handleResize() {
      if (isMobileView()) {
        root.classList.add(ROOT_CLASS + '--mobile');
        goToSlide(currentIndex);
        startAutoplay();
      } else {
        root.classList.remove(ROOT_CLASS + '--mobile');
        track.style.transform = '';
        stopAutoplay();
        updateDots(dots, currentIndex);
      }
    }

    track.addEventListener('touchstart', function (event) {
      if (!isMobileView()) {
        return;
      }

      touchStartX = event.changedTouches[0].screenX;
      touchDeltaX = 0;
      stopAutoplay();
    });

    track.addEventListener('touchmove', function (event) {
      if (!isMobileView()) {
        return;
      }

      touchDeltaX = event.changedTouches[0].screenX - touchStartX;
    });

    track.addEventListener('touchend', function () {
      if (!isMobileView()) {
        return;
      }

      if (touchDeltaX > 40) {
        goToSlide(currentIndex - 1);
      } else if (touchDeltaX < -40) {
        goToSlide(currentIndex + 1);
      }

      restartAutoplay();
    });

    window.addEventListener('resize', handleResize);
    handleResize();
    root.setAttribute(CAROUSEL_FLAG, 'true');
  }

  function applyTrustSection() {
    const section = document.querySelector(SECTION_SELECTOR);

    if (!section) {
      return false;
    }

    let root = section.querySelector('.' + ROOT_CLASS);

    if (!root || !root.querySelector('.' + ROOT_CLASS + '__track')) {
      if (root) {
        root.parentNode.removeChild(root);
      }

      root = buildTrustSection();
      section.appendChild(root);
    }

    initMobileCarousel(root);
    section.setAttribute(FLAG_ATTR, 'true');
    trackViewOnce();
    return true;
  }

  function run() {
    if (isDone) {
      return;
    }

    injectStyles();

    if (applyTrustSection()) {
      isDone = true;
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

/* ------------------------------------------------------------
     2) CATEGORIAS — imagens novas + setas + reposicionamento
     ------------------------------------------------------------ */
(function () {
  'use strict';

  let retryCount = 0;
  let imagesDone = false;
  let sectionMoved = false;
  let arrowsDone = false;
  let viewTracked = false;
  let categoriesTrackingDone = false;

  const FLAG_ATTR = 'data-at-new-category-image';
  const MOVE_FLAG = 'data-at-categories-moved';
  const STYLE_ID = 'at-333-categories-layout-style-v10';
  const ARROW_DISPLAY_SIZE = 70;
  const ARROW_PREV_FLAG = 'data-at-category-arrow-updated';
  const ARROW_NEXT_FLAG = 'data-at-category-arrow-updated';
  const TRACKING_ATTR = 'data-at-new-home-tracking';
  const WRAPPER_SELECTOR = '.categories-wrapper';
  const ITEM_SELECTOR = WRAPPER_SELECTOR + ' .category-item';
  const CATEGORIES_BLOCK_SELECTOR = '.categories-block';
  const TRUST_SELECTOR = '.sites-features-container';
  const ARROW_PREV_SELECTOR = '#category-arrow-prev';
  const ARROW_NEXT_SELECTOR = '#category-arrow-next';
  const ARROW_PREV_SRC =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783704917/Button_1_s7obcp.png';
  const ARROW_NEXT_SRC =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783704919/Button_ogvthv.png';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;
  const TRACKING_CATEGORY = 'new_home_333';

  const CATEGORY_IMAGES = [
    {
      match: 'whatsapp-ofertas',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688487/whatsapp_de_ofertas_2x_gbw4kl.webp',
    },
    {
      match: 'promocoes.html',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688484/promocao_2x_oavk7l.webp',
    },
    {
      match: 'cimentos',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688490/cimento_2x_kqcjxy.webp',
    },
    {
      match: 'argamassas',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688488/argamassas_2x_dgz1s0.webp',
    },
    {
      match: 'rejuntes',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688485/rejuntes_2x_drkc53.webp',
    },
    {
      match: 'areia-e-pedra-cal',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688488/areia_pedra_cal_e_gesso_2x_ch6vt5.webp',
    },
    {
      match: 'aco-para-construc-o',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688491/Co_para_constru_o_2x_unnbnv.webp',
    },
    {
      match: 'tijolos-e-blocos',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688487/tijolos_e_blocos_2x_uyf1cz.webp',
    },
    {
      match: 'impermeabilizantes',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688494/impermeabilizantes_2x_bjtqrg.webp',
    },
    {
      match: 'telhas',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688485/telhas_2x_qktuhc.webp',
    },
    {
      match: 'lajes',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688495/lajes_2x_aj0vto.webp',
    },
    {
      match: 'materiais-hidraulicos',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688499/materiais_hidraulicos_2x_a4xevn.webp',
    },
    {
      match: 'materiais-eletricos',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688498/materiais_el_tricos_2x_xrtm1h.webp',
    },
    {
      match: 'lonas',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688496/lonas_2x_t8rn1y.webp',
    },
    {
      match: 'madeira-para-construc-o',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688498/madeira_para_constru_o_2x_ybtmfo.webp',
    },
    {
      match: 'ferragens',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688493/ferragens_2x_jfwwcu.webp',
    },
    {
      match: 'ferramentas',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688494/ferramentas_2x_nga4qg.webp',
    },
    {
      match: 'lou-as-e-metais',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688496/lou_as_e_metais_2x_rcamlo.webp',
    },
    {
      match: 'moveis-cozinha-e-banheiro',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688497/m_veis_cozinha_e_banheiro_2x_m9lhxs.webp',
    },
    {
      match: 'pisos-revestimentos-e-porcelanatos',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688485/revestimentos_e_porcelanatos_2x_gom3g7.webp',
    },
    {
      match: 'pintura',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688500/pintura_2x_fkegrr.webp',
    },
    {
      match: 'concreto',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688492/concreto_usinado_2x_vbzfth.webp',
    },
    {
      match: 'porta-e-janela',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688484/portas_e_janelas_2x_pshyhg.webp',
    },
    {
      match: 'equipamentos-para-locac-o',
      src: 'https://res.cloudinary.com/gqsvm1om/image/upload/v1783688493/equipamentos_para_loca_o_2x_r1n8vr.webp',
    },
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

  function trackViewOnce() {
    if (viewTracked) {
      return;
    }

    viewTracked = true;
    sendTrackingEvent('visualizou_categorias_home', 'view');
  }

  function slugifyLabel(value) {
    if (!value) {
      return 'categoria';
    }

    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function getCategoryLabel(item) {
    const href = item.getAttribute('href') || '';
    const config = getCategoryConfig(href);

    if (config && config.match) {
      return 'clicou_categoria_' + slugifyLabel(config.match);
    }

    const textEl = item.querySelector('p');
    const text = textEl ? textEl.textContent : '';

    return 'clicou_categoria_' + slugifyLabel(text || href);
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

  function bindCategoriesTracking() {
    if (categoriesTrackingDone) {
      return true;
    }

    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    const prevArrow = document.querySelector(ARROW_PREV_SELECTOR);
    const nextArrow = document.querySelector(ARROW_NEXT_SELECTOR);

    if (!wrapper) {
      return false;
    }

    const items = wrapper.querySelectorAll(ITEM_SELECTOR);

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

    trackViewOnce();

    if ((prevArrow && nextArrow) || arrowsDone) {
      categoriesTrackingDone = true;
      return true;
    }

    return false;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.new-menu-active .categories-block {',
      '  overflow: visible !important;',
      '}',
      '.new-menu-active .categories-block .categories-block-inner-container {',
      '  overflow: visible !important;',
      '  align-items: flex-start !important;',
      '  gap: 0px !important;',
      '  padding-left: 15px !important;',
      '  padding-right: 20px !important;',
      '}',
      '.new-menu-active .categories-block .categories-container {',
      '  overflow-x: auto !important;',
      '  overflow-y: visible !important;',
      '}',
      '.new-menu-active .categories-block .categories-container .categories-wrapper {',
      '  height: auto !important;',
      '  min-height: 0 !important;',
      '  overflow: visible !important;',
      '  align-items: flex-start !important;',
      '  padding-top: 8px !important;',
      '}',
      '.new-menu-active .categories-block .categories-container .categories-wrapper .category-item {',
      '  overflow: visible !important;',
      '}',
      '.new-menu-active .categories-block .categories-container .categories-wrapper .category-image-container {',
      '  display: inline-block !important;',
      '  overflow: visible !important;',
      '  padding-bottom: 12px !important;',
      '  line-height: 0 !important;',
      '}',
      '.new-menu-active .categories-block .categories-container .categories-wrapper .category-item p {',
      '  margin-top: 8px !important;',
      '}',
      '.new-menu-active .categories-block .category-arrow {',
      '  width: ' + ARROW_DISPLAY_SIZE + 'px !important;',
      '  height: ' + ARROW_DISPLAY_SIZE + 'px !important;',
      '  min-width: ' + ARROW_DISPLAY_SIZE + 'px !important;',
      '  min-height: ' + ARROW_DISPLAY_SIZE + 'px !important;',
      '  margin: 40px 0 0 0 !important;',
      '  padding: 0 !important;',
      '  object-fit: contain !important;',
      '  display: block !important;',
      '  flex-shrink: 0 !important;',
      '  align-self: flex-start !important;',
      '}',
      '.new-menu-active .categories-block .category-arrow.disabled {',
      '  opacity: 0.5 !important;',
      '  pointer-events: none !important;',
      '}',
      '.new-menu-active .categories-block .category-arrow.before,',
      '.new-menu-active .categories-block .category-arrow.next {',
      '  padding: 0 !important;',
      '}',
      '@media only screen and (max-width: 1300px) {',
      '  .new-menu-active .categories-block .category-arrow {',
      '    margin-top: 40px !important;',
      '  }',
      '}',
      '@media only screen and (max-width: 768px) {',
      '  .new-menu-active .categories-block .categories-container .categories-wrapper .category-item {',
      '    margin-top: 0 !important;',
      '  }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function isAllDone() {
    return imagesDone && sectionMoved && arrowsDone;
  }

  function getCategoryConfig(href) {
    if (!href) {
      return null;
    }

    for (let i = 0; i < CATEGORY_IMAGES.length; i += 1) {
      if (href.indexOf(CATEGORY_IMAGES[i].match) !== -1) {
        return CATEGORY_IMAGES[i];
      }
    }

    return null;
  }

  function replaceCategoryImages() {
    if (imagesDone) {
      return true;
    }

    const wrapper = document.querySelector(WRAPPER_SELECTOR);

    if (!wrapper) {
      return false;
    }

    const items = wrapper.querySelectorAll(ITEM_SELECTOR);

    if (!items.length) {
      return false;
    }

    let replacedCount = 0;

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const href = item.getAttribute('href') || '';
      const config = getCategoryConfig(href);

      if (!config) {
        continue;
      }

      const img = item.querySelector('.category-image-container img');

      if (!img) {
        continue;
      }

      if (item.getAttribute(FLAG_ATTR) === 'true' && img.getAttribute('src') === config.src) {
        replacedCount += 1;
        continue;
      }

      img.removeAttribute('srcset');
      img.setAttribute('src', config.src);
      item.setAttribute(FLAG_ATTR, 'true');
      replacedCount += 1;
    }

    if (replacedCount === CATEGORY_IMAGES.length) {
      imagesDone = true;
      return true;
    }

    return false;
  }

  function moveCategoriesBelowTrust() {
    const categoriesBlock = document.querySelector(CATEGORIES_BLOCK_SELECTOR);
    const trustSection = document.querySelector(TRUST_SELECTOR);

    if (!categoriesBlock || !trustSection || !trustSection.parentNode) {
      return sectionMoved;
    }

    if (trustSection.nextElementSibling === categoriesBlock) {
      categoriesBlock.setAttribute(MOVE_FLAG, 'true');
      sectionMoved = true;
      return true;
    }

    if (trustSection.nextElementSibling) {
      trustSection.parentNode.insertBefore(categoriesBlock, trustSection.nextElementSibling);
    } else {
      trustSection.parentNode.appendChild(categoriesBlock);
    }

    categoriesBlock.setAttribute(MOVE_FLAG, 'true');
    sectionMoved = true;
    return true;
  }

  function unwrapCategoryArrow(arrow) {
    if (!arrow) {
      return;
    }

    const wrap = arrow.parentElement;

    if (!wrap || !wrap.classList.contains('at-category-arrow-wrap')) {
      return;
    }

    wrap.parentNode.insertBefore(arrow, wrap);
    wrap.parentNode.removeChild(wrap);
    arrow.style.removeProperty('background-image');
    arrow.style.removeProperty('opacity');
  }

  function replaceCategoryArrows() {
    const prevArrow = document.querySelector(ARROW_PREV_SELECTOR);
    const nextArrow = document.querySelector(ARROW_NEXT_SELECTOR);

    if (!prevArrow || !nextArrow) {
      return arrowsDone;
    }

    unwrapCategoryArrow(prevArrow);
    unwrapCategoryArrow(nextArrow);

    const prevReady =
      prevArrow.getAttribute(ARROW_PREV_FLAG) === 'true' &&
      prevArrow.getAttribute('src') === ARROW_PREV_SRC;
    const nextReady =
      nextArrow.getAttribute(ARROW_NEXT_FLAG) === 'true' &&
      nextArrow.getAttribute('src') === ARROW_NEXT_SRC;

    if (prevReady && nextReady) {
      arrowsDone = true;
      return true;
    }

    prevArrow.removeAttribute('srcset');
    prevArrow.setAttribute('src', ARROW_PREV_SRC);
    prevArrow.setAttribute('width', String(ARROW_DISPLAY_SIZE));
    prevArrow.setAttribute('height', String(ARROW_DISPLAY_SIZE));
    prevArrow.style.removeProperty('width');
    prevArrow.style.removeProperty('height');
    prevArrow.setAttribute(ARROW_PREV_FLAG, 'true');

    nextArrow.removeAttribute('srcset');
    nextArrow.setAttribute('src', ARROW_NEXT_SRC);
    nextArrow.setAttribute('width', String(ARROW_DISPLAY_SIZE));
    nextArrow.setAttribute('height', String(ARROW_DISPLAY_SIZE));
    nextArrow.style.removeProperty('width');
    nextArrow.style.removeProperty('height');
    nextArrow.setAttribute(ARROW_NEXT_FLAG, 'true');

    arrowsDone = true;
    return true;
  }

  function run() {
    if (isAllDone() && categoriesTrackingDone) {
      return;
    }

    injectStyles();

    replaceCategoryImages();
    moveCategoriesBelowTrust();
    replaceCategoryArrows();
    bindCategoriesTracking();

    if (isAllDone() && categoriesTrackingDone) {
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

/* ------------------------------------------------------------
     3) TROCA DE BANNER DA HOME (desktop + mobile)
     ------------------------------------------------------------ */
(function () {
  'use strict';

  let retryCount = 0;
  let desktopDone = false;
  let mobileDone = false;
  let autoplayResumed = false;
  let sliderTouchDone = false;
  let customCarouselTouchDone = false;
  let viewTracked = false;
  let bannerTrackingDone = false;

  const STYLE_ID = 'at-333-new-banner-style-v9';
  const BANNER_RADIUS = '25px';
  const BANNER_RADIUS_MOBILE = '8px';
  const FLAG_DESKTOP = 'data-at-new-banner-desktop';
  const FLAG_MOBILE = 'data-at-new-banner-mobile';
  const MOBILE_TOUCH_FLAG = 'data-at-banner-touch-init';
  const TRACKING_ATTR = 'data-at-new-home-tracking';
  const MOBILE_MEDIA = '(max-width: 768px)';
  const SLIDER_SELECTOR = '.pagebuilder-lazyload-slider.slick-initialized';
  const DESKTOP_IMG_SELECTOR = 'img[data-element="desktop_image"]';
  const MOBILE_CAROUSEL_SELECTOR = '.custom-carousel';
  const MOBILE_ITEM_SELECTOR =
    MOBILE_CAROUSEL_SELECTOR + ' .carousel-item[data-banner-title="Sem tempo ruim para começar"]';
  const MOBILE_IMG_SELECTOR = 'img.carousel-image-mobile';
  const DESKTOP_IMG_SRC =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783687665/Banner1-home-desktop_f4qvid.webp';
  const MOBILE_IMG_SRC =
    'https://res.cloudinary.com/gqsvm1om/image/upload/v1783687674/banner1_home_mobile_2x_a2zwyo.webp';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;
  const TRACKING_CATEGORY = 'new_home_333';

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

  function trackViewOnce() {
    if (viewTracked) {
      return;
    }

    viewTracked = true;
    sendTrackingEvent('visualizou_banner_home', 'view');
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

  function bindBannerTracking() {
    if (bannerTrackingDone) {
      return true;
    }

    let bound = false;

    const desktopSlide = document.querySelector(
      '.pagebuilder-lazyload-slider .slick-slide[data-banner-position="1"]:not(.slick-cloned)[' +
        FLAG_DESKTOP +
        '="true"]'
    );

    if (desktopSlide) {
      const desktopLink =
        desktopSlide.querySelector('a') ||
        desktopSlide.querySelector('figure[data-content-type="image"]') ||
        desktopSlide;
      addTrackedClick(desktopLink, 'clicou_banner_home_desktop');
      bound = true;
    }

    const mobileItem =
      document.querySelector(MOBILE_ITEM_SELECTOR + '[' + FLAG_MOBILE + '="true"]') ||
      document.querySelector(
        MOBILE_CAROUSEL_SELECTOR + ' .carousel-item[' + FLAG_MOBILE + '="true"]'
      );

    if (mobileItem) {
      const mobileLink = mobileItem.querySelector('a') || mobileItem;
      addTrackedClick(mobileLink, 'clicou_banner_home_mobile');
      bound = true;
    }

    if (!bound) {
      return false;
    }

    trackViewOnce();
    bannerTrackingDone = true;
    return true;
  }

  function isMobileViewport() {
    return window.matchMedia(MOBILE_MEDIA).matches;
  }

  function ensureSliderTouch(slider) {
    if (sliderTouchDone || !slider) {
      return;
    }

    const jQuery = window.jQuery;

    if (!jQuery) {
      return;
    }

    const $slider = jQuery(slider);

    if (!$slider.hasClass('slick-initialized')) {
      return;
    }

    $slider.slick('slickSetOption', 'swipe', true, true);
    $slider.slick('slickSetOption', 'touchMove', true, true);
    $slider.slick('slickSetOption', 'draggable', true, true);
    $slider.slick('setPosition');
    sliderTouchDone = true;
  }

  function resumeSliderAutoplay(slider) {
    if (autoplayResumed || !slider || isMobileViewport()) {
      return;
    }

    const jQuery = window.jQuery;

    if (!jQuery) {
      return;
    }

    const $slider = jQuery(slider);

    if (!$slider.hasClass('slick-initialized')) {
      return;
    }

    function resume() {
      $slider.slick('setPosition');

      if (slider.getAttribute('data-autoplay') === 'true') {
        $slider.slick('slickPlay');
      }
    }

    resume();
    window.setTimeout(resume, 300);
    autoplayResumed = true;
  }

  function scheduleSliderAutoplayResume(slider, img) {
    if (!slider || !img) {
      return;
    }

    if (isMobileViewport()) {
      ensureSliderTouch(slider);
      return;
    }

    function onReady() {
      resumeSliderAutoplay(slider);
    }

    if (img.complete && img.naturalWidth > 0) {
      onReady();
      return;
    }

    img.addEventListener('load', onReady, { once: true });
    img.addEventListener('error', onReady, { once: true });
  }

  function initCustomCarouselTouch() {
    if (customCarouselTouchDone) {
      return;
    }

    const carousel = document.querySelector('.banner.home ' + MOBILE_CAROUSEL_SELECTOR);

    if (!carousel || carousel.getAttribute(MOBILE_TOUCH_FLAG) === 'true') {
      if (carousel) {
        customCarouselTouchDone = true;
      }
      return;
    }

    const track =
      carousel.querySelector('.carousel-items') || carousel.querySelector('#carousel-content');

    if (!track) {
      return;
    }

    const items = track.querySelectorAll('.carousel-item');

    if (!items.length) {
      return;
    }

    let currentIndex = 0;
    let touchStartX = 0;
    let touchDeltaX = 0;
    let isDragging = false;

    function goTo(index) {
      if (index < 0) {
        currentIndex = items.length - 1;
      } else if (index >= items.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
    }

    function onTouchStart(event) {
      if (!event.changedTouches || !event.changedTouches.length) {
        return;
      }

      isDragging = true;
      touchStartX = event.changedTouches[0].screenX;
      touchDeltaX = 0;
    }

    function onTouchMove(event) {
      if (!isDragging || !event.changedTouches || !event.changedTouches.length) {
        return;
      }

      touchDeltaX = event.changedTouches[0].screenX - touchStartX;
    }

    function onTouchEnd() {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      if (touchDeltaX > 40) {
        goTo(currentIndex - 1);
      } else if (touchDeltaX < -40) {
        goTo(currentIndex + 1);
      }

      touchDeltaX = 0;
    }

    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });
    carousel.setAttribute(MOBILE_TOUCH_FLAG, 'true');
    customCarouselTouchDone = true;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.page-header {',
      '  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15) !important;',
      '}',
      'input.amsearch-input,',
      '.amsearch-input {',
      '  border-radius: 20px !important;',
      '}',
      'input.amsearch-input::placeholder,',
      '.amsearch-input::placeholder {',
      '  color: #707070 !important;',
      '  opacity: 1 !important;',
      '}',
      '.banner.home {',
      '  margin-top: 40px !important;',
      '}',
      '.banner.home .pagebuilder-lazyload-slider.slick-initialized .slick-list {',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '  overflow: hidden !important;',
      '}',
      '.banner.home .custom-carousel .carousel-wrapper {',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '  overflow: hidden !important;',
      '}',
      '.banner.home .pagebuilder-lazyload-slider img[data-element="desktop_image"],',
      '.banner.home .pagebuilder-lazyload-slider img[data-element="mobile_image"],',
      '.banner.home .custom-carousel img.carousel-image-mobile {',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '}',
      '@media only screen and (max-width: 768px) {',
      '  .banner.home {',
      '    margin-top: 20px !important;',
      '    min-height: 0 !important;',
      '  }',
      '  .banner.home .custom-carousel {',
      '    background: transparent !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-items {',
      '    height: auto !important;',
      '    max-height: none !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-item {',
      '    align-items: flex-start !important;',
      '    justify-content: flex-start !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-item a {',
      '    width: 100% !important;',
      '    height: auto !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-item img.carousel-image-mobile {',
      '    width: 100% !important;',
      '    height: auto !important;',
      '    object-fit: cover !important;',
      '    display: block !important;',
      '  }',
      '  .banner.home .pagebuilder-lazyload-slider.slick-initialized .slick-list {',
      '    touch-action: pan-y !important;',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .banner.home .custom-carousel .carousel-wrapper {',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .banner.home .pagebuilder-lazyload-slider img[data-element="desktop_image"],',
      '  .banner.home .pagebuilder-lazyload-slider img[data-element="mobile_image"],',
      '  .banner.home .custom-carousel img.carousel-image-mobile {',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_DESKTOP +
        '="true"] img[data-element="desktop_image"],',
      '  ' +
        MOBILE_CAROUSEL_SELECTOR +
        ' .carousel-item[' +
        FLAG_MOBILE +
        '="true"] img.carousel-image-mobile {',
      '    border-radius: ' + BANNER_RADIUS_MOBILE + ' !important;',
      '  }',
      '  .banner.home ' + MOBILE_CAROUSEL_SELECTOR + ' .carousel-wrapper,',
      '  .banner.home ' + MOBILE_CAROUSEL_SELECTOR + ' .carousel-items {',
      '    touch-action: pan-y !important;',
      '  }',
      '}',
      '.pagebuilder-lazyload-slider figure[data-content-type="image"] {',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '}',
      '.pagebuilder-lazyload-slider figure[data-content-type="image"] a {',
      '  display: block !important;',
      '}',
      MOBILE_CAROUSEL_SELECTOR + ' .carousel-item a {',
      '  display: block !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_DESKTOP +
        '="true"] figure[data-content-type="image"] {',
      '  width: 100% !important;',
      '  display: block !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_DESKTOP +
        '="true"] figure[data-content-type="image"] a {',
      '  display: block !important;',
      '  width: 100% !important;',
      '}',
      '.pagebuilder-lazyload-slider .slick-slide[' +
        FLAG_DESKTOP +
        '="true"] img[data-element="desktop_image"] {',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  height: auto !important;',
      '  display: block !important;',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '}',
      MOBILE_CAROUSEL_SELECTOR +
        ' .carousel-item[' +
        FLAG_MOBILE +
        '="true"] img.carousel-image-mobile {',
      '  width: 100% !important;',
      '  max-width: 100% !important;',
      '  height: auto !important;',
      '  object-fit: cover !important;',
      '  display: block !important;',
      '  border-radius: ' + BANNER_RADIUS + ' !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function replaceDesktopBanner() {
    if (desktopDone) {
      return true;
    }

    const slider = document.querySelector(SLIDER_SELECTOR);

    if (!slider) {
      return false;
    }

    const slide = slider.querySelector('.slick-slide[data-banner-position="1"]:not(.slick-cloned)');

    if (!slide) {
      return false;
    }

    const desktopImg = slide.querySelector(DESKTOP_IMG_SELECTOR);

    if (!desktopImg) {
      return false;
    }

    if (slide.getAttribute(FLAG_DESKTOP) === 'true') {
      scheduleSliderAutoplayResume(slider, desktopImg);
      desktopDone = true;
      return true;
    }

    desktopImg.removeAttribute('srcset');
    desktopImg.setAttribute('src', DESKTOP_IMG_SRC);
    slide.setAttribute(FLAG_DESKTOP, 'true');
    scheduleSliderAutoplayResume(slider, desktopImg);
    desktopDone = true;

    return true;
  }

  function replaceMobileBanner() {
    if (mobileDone) {
      return true;
    }

    const carousel = document.querySelector(MOBILE_CAROUSEL_SELECTOR);

    if (!carousel) {
      return false;
    }

    const item =
      carousel.querySelector('.carousel-item[data-banner-title="Sem tempo ruim para começar"]') ||
      carousel.querySelector('.carousel-item');

    if (!item) {
      return false;
    }

    const mobileImg = item.querySelector(MOBILE_IMG_SELECTOR);

    if (!mobileImg) {
      return false;
    }

    if (item.getAttribute(FLAG_MOBILE) === 'true') {
      mobileDone = true;
      return true;
    }

    mobileImg.removeAttribute('srcset');
    mobileImg.setAttribute('src', MOBILE_IMG_SRC);
    mobileImg.setAttribute('width', '368');
    mobileImg.setAttribute('height', '300');
    item.setAttribute(FLAG_MOBILE, 'true');
    mobileDone = true;

    return true;
  }

  function isAllDone() {
    const desktopAbsent = !document.querySelector('.pagebuilder-lazyload-slider');
    const mobileAbsent = !document.querySelector(MOBILE_CAROUSEL_SELECTOR);

    return (desktopDone || desktopAbsent) && (mobileDone || mobileAbsent);
  }

  function run() {
    injectStyles();

    replaceDesktopBanner();
    replaceMobileBanner();
    initCustomCarouselTouch();
    bindBannerTracking();

    const slider = document.querySelector(SLIDER_SELECTOR);

    if (slider) {
      if (isMobileViewport()) {
        ensureSliderTouch(slider);
      } else if (desktopDone) {
        resumeSliderAutoplay(slider);
      }
    }

    const mobileCarouselReady =
      customCarouselTouchDone ||
      !document.querySelector('.banner.home ' + MOBILE_CAROUSEL_SELECTOR);
    const sliderReady = !isMobileViewport() || sliderTouchDone || !slider;

    if (
      isAllDone() &&
      mobileCarouselReady &&
      sliderReady &&
      bannerTrackingDone &&
      (retryCount >= 5 || !slider)
    ) {
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

/* ------------------------------------------------------------
   4) PRODUTOS — background da seção ativa
   ------------------------------------------------------------ */
(function () {
  'use strict';

  let viewTracked = false;

  const STYLE_ID = 'at-333-products-active-bg-style-v2';
  const TRACKING_CATEGORY = 'new_home_333';
  const PRODUCTS_ACTIVE_GRADIENT =
    'linear-gradient(180deg, #FFF3F0 0%, #FFF5F2 14.29%, #FFF6F4 28.57%, #FFF8F6 42.86%, ' +
    '#FFFAF9 57.14%, #FFFCFB 71.43%, #FFFDFD 85.71%, #FFFFFF 100%)';

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

  function trackViewOnce() {
    if (viewTracked) {
      return;
    }

    viewTracked = true;
    sendTrackingEvent('visualizou_produtos_home', 'view');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.block-products.active,',
      '#carousel-container.active {',
      '  background: ' + PRODUCTS_ACTIVE_GRADIENT + ' !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
    trackViewOnce();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
