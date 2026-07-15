(function () {
  'use strict';

  let retryCount = 0;
  let imagesDone = false;
  let sectionMoved = false;
  let arrowsDone = false;

  const FLAG_ATTR = 'data-at-new-category-image';
  const MOVE_FLAG = 'data-at-categories-moved';
  const STYLE_ID = 'at-333-categories-layout-style-v10';
  const ARROW_DISPLAY_SIZE = 70;
  const ARROW_PREV_FLAG = 'data-at-category-arrow-updated';
  const ARROW_NEXT_FLAG = 'data-at-category-arrow-updated';
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
    if (isAllDone()) {
      return;
    }

    injectStyles();

    replaceCategoryImages();
    moveCategoriesBelowTrust();
    replaceCategoryArrows();

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
