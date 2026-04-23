(function () {
  'use strict';

  let initAttempts = 0;
  let initTimer = null;
  let applyDebounceTimer = null;
  let isApplying = false;
  let selectedPurchaseMode = 'single';
  let selectedPackage = '800g';
  let selectedCombo = '';

  const STYLE_ID = 'fn-pdp-v2-style';
  const ROOT_ID = 'fn-pdp-v2-root';
  const STORAGE_SELECTION_KEY = 'fn-pdp-v2-selection';
  const MAX_INIT_ATTEMPTS = 30;
  const INIT_INTERVAL_MS = 700;
  const APPLY_DEBOUNCE_MS = 180;
  const PRODUCT_URL_SEARCH_QUERY = 'query FamilynessPdpUrlBySearch($search: String!) { products(search: $search, pageSize: 24) { items { sku name meta_title url_key url_suffix } } }';
  const KNOWN_URLS = {
    supremepro: {
      formula: {
        '1': '/formula-infantil-nan-supreme-pro-1-800g',
        '2': '/formula-inf-nan-supreme-pro-2-800g'
      },
      combo: '/combo-nanlac-supreme-pro-15-off'
    }
  };

  const CHIP_OPTIONS = {
    package: ['800g', '400g'],
    combo: ['Leve 2', 'Leve 3']
  };

  const TYPE_OPTIONS = [
    {
      key: 'comfor',
      label: 'NAN Comfor',
      fallbackUrl: '/formula-inf-nan-comfor-2-800g',
      searchTerm: 'Formula Infantil NAN Comfor 2 800g',
      matchTerm: 'comfor'
    },
    {
      key: 'supremepro',
      label: 'NAN SupremePro',
      fallbackUrl: '/formula-inf-nan-supreme-pro-2-800g',
      searchTerm: 'Formula Infantil NAN Supreme Pro 2 800g',
      matchTerm: 'supreme'
    }
  ];

  function getMetaTitle() {
    const metaElement = document.querySelector('meta[name="title"]');
    const metaContent = metaElement && metaElement.getAttribute('content') ? metaElement.getAttribute('content') : '';
    if (metaContent && metaContent.trim()) {
      return metaContent.trim();
    }

    if (document.title && document.title.trim()) {
      return document.title.trim();
    }

    return '';
  }

  function stripVariantTokens(value) {
    return String(value || '')
      .replace(/\b(leve\s*2|leve\s*3|kit\s*2|kit\s*3|2\s*un|3\s*un)\b/gi, ' ')
      .replace(/\b(400\s*g|800\s*g)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseStageFromText(value) {
    const normalized = normalizeText(value);

    if (
      normalized.indexOf('0 a 6 meses') !== -1 ||
      normalized.indexOf('nan supreme pro 1') !== -1 ||
      normalized.indexOf('supreme-pro-1') !== -1 ||
      normalized.indexOf('supreme pro-1') !== -1
    ) {
      return '1';
    }

    if (
      normalized.indexOf('6 a 12 meses') !== -1 ||
      normalized.indexOf('nan supreme pro 2') !== -1 ||
      normalized.indexOf('supreme-pro-2') !== -1 ||
      normalized.indexOf('supreme pro-2') !== -1
    ) {
      return '2';
    }

    return '';
  }

  function detectProductFamily(value) {
    const normalized = normalizeText(value);
    if (normalized.indexOf('combo') !== -1 || normalized.indexOf('/combo-') !== -1) {
      return 'combo';
    }
    return 'formula';
  }

  function getCurrentVariantContext() {
    const metaTitle = getMetaTitle();
    const pageTitle = getTitle();
    const pathname = window.location && window.location.pathname ? window.location.pathname : '';
    const mergedText = metaTitle + ' ' + pageTitle + ' ' + pathname;

    return {
      family: detectProductFamily(mergedText),
      stage: parseStageFromText(mergedText)
    };
  }

  function getItemVariantContext(item) {
    const mergedText =
      (item && item.name ? item.name : '') +
      ' ' +
      (item && item.meta_title ? item.meta_title : '') +
      ' ' +
      (item && item.url_key ? item.url_key : '');

    return {
      family: detectProductFamily(mergedText),
      stage: parseStageFromText(mergedText)
    };
  }

  function getKnownVariantUrl(option, packageValue) {
    const context = getCurrentVariantContext();
    const packageText = normalizeText(packageValue || '');

    if (!option || option.key !== 'supremepro') {
      return '';
    }

    console.log('[Familyness PDP v2] Checando URL conhecida - Family: ' + context.family + ', Stage: ' + context.stage + ', Package: ' + packageText);

    if (context.family === 'combo') {
      console.log('[Familyness PDP v2] Match: contexto é COMBO');
      return KNOWN_URLS.supremepro.combo;
    }

    if (context.family === 'formula' && packageText === '800g' && context.stage) {
      const knownUrl = KNOWN_URLS.supremepro.formula[context.stage];
      if (knownUrl) {
        console.log('[Familyness PDP v2] Match: contexto é FORMULA, stage ' + context.stage);
        return knownUrl;
      }
    }

    console.log('[Familyness PDP v2] Nenhuma URL conhecida matched');
    return '';
  }

  function applyTypeToSearchBase(searchBase, option) {
    let output = String(searchBase || '');

    if (option && option.key === 'comfor') {
      output = output
        .replace(/supreme\s*pro/gi, 'Comfor')
        .replace(/supremepro/gi, 'Comfor')
        .replace(/supreme/gi, 'Comfor');
    }

    if (option && option.key === 'supremepro') {
      output = output
        .replace(/comfor/gi, 'Supreme Pro');
    }

    return output;
  }

  function getCurrentPathname() {
    const pathname = window.location && window.location.pathname ? window.location.pathname : '';
    return normalizeText(pathname);
  }

  function getContextText(title) {
    return normalizeText(title + ' ' + getCurrentPathname());
  }

  function parsePackageFromContext(title) {
    const contextText = getContextText(title);
    if (contextText.indexOf('400g') !== -1 || contextText.indexOf('400 g') !== -1) {
      return '400g';
    }
    return '800g';
  }

  function parseComboFromContext(title) {
    const contextText = getContextText(title);
    if (contextText.indexOf('leve 3') !== -1 || contextText.indexOf('kit 3') !== -1 || contextText.indexOf('3un') !== -1) {
      return 'Leve 3';
    }
    if (contextText.indexOf('leve 2') !== -1 || contextText.indexOf('kit 2') !== -1 || contextText.indexOf('2un') !== -1) {
      return 'Leve 2';
    }
    return '';
  }

  function saveSelectionState(typeKey, packageValue, comboValue) {
    try {
      const payload = {
        type: typeKey || '',
        package: packageValue || '',
        combo: comboValue || '',
        timestamp: Date.now()
      };
      window.sessionStorage.setItem(STORAGE_SELECTION_KEY, JSON.stringify(payload));
    } catch (error) {
      console.log('[Familyness PDP v2] Falha ao salvar estado de selecao.', error);
    }
  }

  function readSelectionState() {
    try {
      const rawValue = window.sessionStorage.getItem(STORAGE_SELECTION_KEY);
      if (!rawValue) {
        return null;
      }

      const parsed = JSON.parse(rawValue);
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return parsed;
    } catch (error) {
      return null;
    }
  }

  function shouldUseStoredState(state) {
    if (!state || !state.timestamp) {
      return false;
    }
    return Date.now() - Number(state.timestamp) <= 1000 * 60 * 10;
  }

  function getActiveTypeOption(typeOptions) {
    const activeOption = typeOptions.find(function (item) {
      return item.active;
    });

    if (activeOption) {
      return activeOption;
    }

    return typeOptions[0] || null;
  }

  function getSearchTermForOption(option, packageValue, comboValue) {
    const metaTitle = getMetaTitle();
    let baseSearch = stripVariantTokens(metaTitle || '');

    if (!baseSearch) {
      baseSearch = option && option.searchTerm ? option.searchTerm : '';
    }

    baseSearch = applyTypeToSearchBase(baseSearch, option);
    const packageText = packageValue || '800g';
    const normalizedCombo = normalizeText(comboValue);

    let search = baseSearch.replace(/800\s?g|400\s?g/gi, packageText);
    if (!search) {
      search = option && option.label ? option.label + ' ' + packageText : packageText;
    }

    if (option && option.label && normalizeText(search).indexOf(normalizeText(option.label)) === -1) {
      search = option.label + ' ' + search;
    }

    if (normalizedCombo.indexOf('leve 2') !== -1) {
      search = search + ' Leve 2';
    }

    if (normalizedCombo.indexOf('leve 3') !== -1) {
      search = search + ' Leve 3';
    }

    return search;
  }

  function buildVariantCacheKey(typeKey, packageValue, comboValue) {
    return String(typeKey || '') + '|' + String(packageValue || '') + '|' + String(comboValue || '');
  }

  function scoreItemBySelection(item, option, packageValue, comboValue) {
    const itemName = normalizeText(item && item.name ? item.name : '');
    const itemMetaTitle = normalizeText(item && item.meta_title ? item.meta_title : '');
    const packageText = normalizeText(packageValue || '800g');
    const comboText = normalizeText(comboValue || '');
    const pageMetaTitle = normalizeText(stripVariantTokens(getMetaTitle()));
    const pageTitleText = normalizeText(stripVariantTokens(getTitle()));
    const pageVariantContext = getCurrentVariantContext();
    const itemVariantContext = getItemVariantContext(item);
    let score = 0;

    if (option && option.matchTerm && itemName.indexOf(normalizeText(option.matchTerm)) !== -1) {
      score = score + 40;
    }

    if (option && option.label && itemName.indexOf(normalizeText(option.label)) !== -1) {
      score = score + 20;
    }

    if (option && option.matchTerm && itemMetaTitle.indexOf(normalizeText(option.matchTerm)) !== -1) {
      score = score + 20;
    }

    if (option && option.label && itemMetaTitle.indexOf(normalizeText(option.label)) !== -1) {
      score = score + 20;
    }

    if (pageMetaTitle && (itemMetaTitle.indexOf(pageMetaTitle) !== -1 || itemName.indexOf(pageMetaTitle) !== -1)) {
      score = score + 30;
    }

    if (pageTitleText && (itemMetaTitle.indexOf(pageTitleText) !== -1 || itemName.indexOf(pageTitleText) !== -1)) {
      score = score + 10;
    }

    if (pageVariantContext.family === itemVariantContext.family) {
      score = score + 45;
    } else {
      score = score - 120;
    }

    if (pageVariantContext.stage && itemVariantContext.stage) {
      if (pageVariantContext.stage === itemVariantContext.stage) {
        score = score + 35;
      } else {
        score = score - 70;
      }
    }

    if (packageText && (itemName.indexOf(packageText) !== -1 || itemName.indexOf(packageText.replace('g', ' g')) !== -1)) {
      score = score + 30;
    }

    if (comboText) {
      if (comboText === 'leve 2' && (itemName.indexOf('leve 2') !== -1 || itemName.indexOf('kit 2') !== -1 || itemName.indexOf('2un') !== -1)) {
        score = score + 30;
      }
      if (comboText === 'leve 3' && (itemName.indexOf('leve 3') !== -1 || itemName.indexOf('kit 3') !== -1 || itemName.indexOf('3un') !== -1)) {
        score = score + 30;
      }
    }

    return score;
  }

  function findBestProductItemBySelection(items, option, packageValue, comboValue) {
    if (!items || !items.length) {
      return null;
    }

    let bestItem = null;
    let bestScore = -1;
    let i = 0;

    while (i < items.length) {
      const item = items[i];
      const score = scoreItemBySelection(item, option, packageValue, comboValue);
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
      i = i + 1;
    }

    if (bestScore <= 0) {
      return null;
    }

    return bestItem;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const css = [
      '#' + ROOT_ID + ' { width: 100%; max-width: 610px; display: flex; flex-direction: column; gap: 12px; margin-top: 12px; color: #173C56; }',
      '#' + ROOT_ID + ' * { box-sizing: border-box; }',
      '#' + ROOT_ID + ' .fn-row { display: flex; gap: 12px; flex-wrap: wrap; }',
      '#' + ROOT_ID + ' .fn-pill { display: inline-flex; align-items: center; justify-content: center; height: 20px; border-radius: 100px; font-family: Lato, sans-serif; font-size: 13px; line-height: 16px; font-weight: 700; padding: 2px 8px; }',
      '#' + ROOT_ID + ' .fn-pill.age { background: #DDE9C8; }',
      '#' + ROOT_ID + ' .fn-pill.size { background: #B0D2F3; }',
      '#' + ROOT_ID + ' .fn-title { margin: 0px; font-family: Fraunces, serif; font-size: 39px; line-height: 48px; font-weight: 700; color: #173C56; }',
      '#' + ROOT_ID + ' .fn-subrow { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }',
      '#' + ROOT_ID + ' .fn-rating { display: flex; align-items: center; gap: 8px; font-family: Lato, sans-serif; font-size: 13px; }',
      '#' + ROOT_ID + ' .fn-stars { letter-spacing: 1px; color: #FBC117; font-size: 16px; line-height: 16px; }',
      '#' + ROOT_ID + ' .fn-wishlist { color: #173C56; font-family: Lato, sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; }',
      '#' + ROOT_ID + ' .fn-groups { display: flex; flex-direction: column; gap: 16px; }',
      '#' + ROOT_ID + ' .fn-groups-top { display: flex; gap: 24px; flex-wrap: wrap; }',
      '#' + ROOT_ID + ' .fn-group { min-width: 160px; display: flex; flex-direction: column; gap: 8px; }',
      '#' + ROOT_ID + ' .fn-label { font-family: Lato, sans-serif; font-size: 16px; line-height: 22px; font-weight: 400; color: #173C56; }',
      '#' + ROOT_ID + ' .fn-chip-list { display: flex; gap: 8px; flex-wrap: wrap; }',
      '#' + ROOT_ID + ' .fn-chip { border: 1px solid #D1D5DB; border-radius: 9999px; height: 43px; padding: 8px 16px; display: inline-flex; align-items: center; justify-content: center; font-family: Lato, sans-serif; font-size: 16px; line-height: 24px; font-weight: 700; color: #173C56; background: #FFFFFF; cursor: pointer; }',
      '#' + ROOT_ID + ' .fn-chip.active { background: #004E99; border-color: #004E99; color: #FFFFFF; }',
      '#' + ROOT_ID + ' .fn-offers { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }',
      '#' + ROOT_ID + ' .fn-offer { border: 1px solid #D1D5DB; border-radius: 12px; background: #FFFFFF; padding: 20px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; }',
      '#' + ROOT_ID + ' .fn-offer.active { background: #E6F1FB; border-color: #173C56; }',
      '#' + ROOT_ID + ' .fn-offer-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }',
      '#' + ROOT_ID + ' .fn-offer-name { font-family: Lato, sans-serif; font-size: 18px; line-height: 22px; font-weight: 700; }',
      '#' + ROOT_ID + ' .fn-offer-price { display: flex; align-items: center; gap: 8px; }',
      '#' + ROOT_ID + ' .fn-price-old { font-family: Lato, sans-serif; font-size: 14px; line-height: 17px; font-weight: 700; text-decoration: line-through; }',
      '#' + ROOT_ID + ' .fn-price-current { font-family: Lato, sans-serif; font-size: 24px; line-height: 29px; font-weight: 700; }',
      '#' + ROOT_ID + ' .fn-benefits { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
      '#' + ROOT_ID + ' .fn-benefit { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 10px; padding: 10px 12px; font-family: Lato, sans-serif; font-size: 16px; line-height: 20px; color: #364153; }',
      '#' + ROOT_ID + ' .fn-offer-note { font-family: Lato, sans-serif; font-size: 10px; line-height: 16px; color: #99A1AF; margin: 0px; }',
      '#' + ROOT_ID + ' .fn-offer-link { font-family: Lato, sans-serif; font-size: 14px; line-height: 17px; font-weight: 700; color: #004E99; text-align: right; text-decoration: none; }',
      '#' + ROOT_ID + ' .fn-footer { display: flex; gap: 12px; align-items: center; }',
      '#' + ROOT_ID + ' .fn-qty { width: 245px; max-width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 15px; }',
      '#' + ROOT_ID + ' .fn-qty-btn { width: 24px; height: 24px; border: 0px; border-radius: 999px; background: #E9EBF8; color: #173C56; font-size: 18px; line-height: 18px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }',
      '#' + ROOT_ID + ' .fn-qty-box { height: 48px; flex: 1; border: 1px solid #173C56; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: Lato, sans-serif; color: #173C56; font-size: 16px; line-height: 20px; }',
      '#' + ROOT_ID + ' .fn-cta { height: 48px; flex: 1; border: 0px; border-radius: 100px; background: #173C56; color: #FFFFFF; font-family: Lato, sans-serif; font-size: 18px; line-height: 20px; font-weight: 700; cursor: pointer; padding: 0px 20px; }',
      '#' + ROOT_ID + ' .fn-loading { opacity: 0.65; pointer-events: none; }',
      '@media screen and (max-width: 1024px) { #' + ROOT_ID + ' { max-width: 100%; } #' + ROOT_ID + ' .fn-title { font-size: 32px; line-height: 40px; } }',
      '@media screen and (max-width: 640px) { #' + ROOT_ID + ' .fn-title { font-size: 26px; line-height: 32px; } #' + ROOT_ID + ' .fn-offer-top { flex-direction: column; align-items: flex-start; } #' + ROOT_ID + ' .fn-benefits { grid-template-columns: 1fr; } #' + ROOT_ID + ' .fn-footer { flex-direction: column; align-items: stretch; } #' + ROOT_ID + ' .fn-qty { width: 100%; } }',
      '.fn-faq-section { width: 100%; max-width: 1360px; margin: 40px auto 0; padding: 40px; background: #F5F7F9; border-radius: 20px; }',
      '.fn-faq-section * { box-sizing: border-box; }',
      '.fn-faq-inner { display: flex; flex-direction: column; align-items: center; gap: 32px; width: 100%; }',
      '.fn-faq-header { text-align: center; width: 100%; }',
      '.fn-faq-header h2 { font-family: Fraunces, serif; font-size: 31px; line-height: 38px; font-weight: 700; color: #173C56; margin: 0; }',
      '.fn-faq-list { display: flex; flex-direction: column; align-items: flex-start; gap: 17px; width: 100%; }',
      '.fn-faq-item { width: 100%; }',
      '.fn-faq-question { display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; padding: 0; background: none; border: 0; cursor: pointer; text-align: left; font-family: Lato, sans-serif; font-size: 16px; line-height: 19px; font-weight: 700; color: #173C56; }',
      '.fn-faq-question:after { content: ""; display: inline-block; width: 14px; height: 9px; flex-shrink: 0; background: #173C56; clip-path: polygon(0 0, 100% 0, 50% 100%); transition: transform 0.2s ease; transform: matrix(-1, 0, 0, 1, 0, 0); }',
      '.fn-faq-question.fn-faq-open:after { transform: rotate(180deg); }',
      '.fn-faq-separator { width: 100%; height: 0; border: 0; border-top: 1px solid #BDC2DC; margin: 0; }',
      '.fn-faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }',
      '.fn-faq-answer-inner { padding: 16px 0 0; font-family: Lato, sans-serif; font-size: 16px; line-height: 19px; font-weight: 400; color: #173C56; }',
      '.fn-faq-cta-row { text-align: center; }',
      '.fn-faq-cta { display: inline-flex; align-items: center; justify-content: center; width: 280px; height: 48px; background: #173C56; border: 0; border-radius: 99px; color: #FFFFFF !important; font-family: Lato, sans-serif; font-size: 18px; line-height: 20px; font-weight: 700; cursor: pointer; text-decoration: none; }',
      '@media screen and (max-width: 1400px) { .fn-faq-section { margin-left: 20px; margin-right: 20px; max-width: calc(100% - 40px); } }',
      '@media screen and (max-width: 640px) { .fn-faq-section { padding: 24px 16px; } .fn-faq-header h2 { font-size: 24px; line-height: 30px; } .fn-faq-cta { width: 100%; max-width: 280px; } }'
    ].join('\n');

    const styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(css));
    document.head.appendChild(styleElement);
  }

  function getTitle() {
    const titleElement =
      document.querySelector('.product-info-main .page-title-wrapper .base') ||
      document.querySelector('h1.page-title .base') ||
      document.querySelector('h1');

    if (!titleElement) {
      return 'Fórmula Infantil de primeira infância Nanlac Comfor 800g';
    }

    const text = (titleElement.textContent || '').trim();
    return text || 'Fórmula Infantil de primeira infância Nanlac Comfor 800g';
  }

  function getReviewCount() {
    const selectors = [
      '.reviews-actions .action.view',
      '.product-reviews-summary .reviews-actions a',
      '.product-reviews-summary .reviews-actions span'
    ];

    let i = 0;
    while (i < selectors.length) {
      const element = document.querySelector(selectors[i]);
      if (element) {
        const text = (element.textContent || '').trim();
        if (text) {
          return text;
        }
      }
      i = i + 1;
    }

    return '2 avaliações';
  }

  function getPriceText() {
    const element =
      document.querySelector('.product-info-main .price-box .price') ||
      document.querySelector('.price-box .price-final_price .price') ||
      document.querySelector('.price');

    if (!element) {
      return 'R$ 69,49';
    }

    const text = (element.textContent || '').trim();
    return text || 'R$ 69,49';
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking Familyness PDP v2] Parametros ausentes para analytics.');
      return;
    }

    const labelEvent = 'AT_Familyness_PDP_v2_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Familyness PDP v2] Evento:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_nestle_familyness_pdp';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function pushDataLayerEvent(eventName, detail) {
    const payload = {
      event: eventName,
      detail: detail || {},
      experience_id: 'familyness-pdp-v2',
      timestamp: Date.now()
    };

    if (window.adobeDataLayer && typeof window.adobeDataLayer.push === 'function') {
      window.adobeDataLayer.push(payload);
    }

    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push(payload);
    }

    if (window.gtmDataObject && typeof window.gtmDataObject.push === 'function') {
      window.gtmDataObject.push(payload);
    }
  }

  function createRootHtml(title, reviewText, priceText) {
    const packageLabel = selectedPackage || '800g';

    return (
      '<div class="fn-row">' +
      '<span class="fn-pill age">1 a 3 anos</span>' +
      '<span class="fn-pill size">' +
      packageLabel +
      '</span>' +
      '</div>' +
      '<h1 class="fn-title">' +
      title +
      '</h1>' +
      '<div class="fn-subrow">' +
      '<div class="fn-rating">' +
      '<span class="fn-stars" aria-hidden="true">★★★★☆</span>' +
      '<span>' +
      reviewText +
      '</span>' +
      '</div>' +
      '<a href="#" class="fn-wishlist" data-fn-action="wishlist">Adicionar à lista de desejos</a>' +
      '</div>' +
      '<div class="fn-groups">' +
      '<div class="fn-offers">' +
      '<article class="fn-offer active" data-fn-offer="single">' +
      '<div class="fn-offer-top">' +
      '<strong class="fn-offer-name">Compra Única</strong>' +
      '<div class="fn-offer-price">' +
      '<span class="fn-price-old">De R$ 72,49</span>' +
      '<span class="fn-price-current">' +
      priceText +
      '</span>' +
      '</div>' +
      '</div>' +
      '</article>' +
      '<article class="fn-offer" data-fn-offer="subscribe">' +
      '<div class="fn-offer-top">' +
      '<strong class="fn-offer-name">Assine & Economize</strong>' +
      '<div class="fn-offer-price">' +
      '<span class="fn-price-current">R$ 66,01</span>' +
      '</div>' +
      '</div>' +
      '<div class="fn-benefits">' +
      '<span class="fn-benefit">Até 10% OFF</span>' +
      '<span class="fn-benefit">Frete Grátis</span>' +
      '<span class="fn-benefit">Frequência Mensal</span>' +
      '<span class="fn-benefit">Cancele quando quiser</span>' +
      '</div>' +
      '<p class="fn-offer-note">Economize até 10% na entrega recorrente. Frete grátis sujeito a regras do programa.</p>' +
      '</article>' +
      '<a href="#" class="fn-offer-link" data-fn-action="how-subscription-works">Como funciona a assinatura?</a>' +
      '</div>' +
      '<div class="fn-footer">' +
      '<div class="fn-qty">' +
      '<button type="button" class="fn-qty-btn" data-fn-qty="minus">-</button>' +
      '<div class="fn-qty-box" data-fn-qty-value="true">1</div>' +
      '<button type="button" class="fn-qty-btn" data-fn-qty="plus">+</button>' +
      '</div>' +
      '<button type="button" class="fn-cta" data-fn-action="add-to-cart" data-fn-mode="" aria-label="Adicionar ao carrinho">Adicionar ao carrinho</button>' +
      '</div>' +
      '</div>'
    );
  }

  function getTypeConfigByCurrentTitle(title) {
    const normalizedTitle = normalizeText(title);

    return TYPE_OPTIONS.map(function (option) {
      const normalizedMatchTerm = normalizeText(option.matchTerm);
      return {
        key: option.key,
        label: option.label,
        searchTerm: option.searchTerm,
        fallbackUrl: option.fallbackUrl,
        active: normalizedTitle.indexOf(normalizedMatchTerm) !== -1,
        resolvedUrls: {}
      };
    });
  }

  function resolveProductUrlBySearch($, option, packageValue, comboValue, onDone) {
    const knownUrl = getKnownVariantUrl(option, packageValue);
    if (knownUrl) {
      console.log('[Familyness PDP v2] Usando URL conhecida:', knownUrl);
      onDone(knownUrl);
      return;
    }

    const searchTerm = getSearchTermForOption(option, packageValue, comboValue);
    console.log('[Familyness PDP v2] Buscando na API com termo:', searchTerm);

    $.ajax({
      url: '/graphql',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        query: PRODUCT_URL_SEARCH_QUERY,
        variables: { search: searchTerm }
      })
    })
      .done(function (response) {
        const items =
          response &&
          response.data &&
          response.data.products &&
          response.data.products.items
            ? response.data.products.items
            : [];

        console.log('[Familyness PDP v2] API retornou ' + items.length + ' itens');
        let i = 0;
        while (i < items.length) {
          const item = items[i];
          const score = scoreItemBySelection(item, option, packageValue, comboValue);
          console.log('[Familyness PDP v2] Item: ' + (item.name || '') + ' | Score: ' + score);
          i = i + 1;
        }

        const best = findBestProductItemBySelection(items, option, packageValue, comboValue);
        if (best && best.url_key) {
          const suffix = best.url_suffix || '';
          const finalUrl = '/' + best.url_key + suffix;
          console.log('[Familyness PDP v2] Produto selecionado: ' + best.name + ' -> ' + finalUrl);
          onDone(finalUrl);
          return;
        }

        console.log('[Familyness PDP v2] Nenhum produto encontrado, usando fallback: ' + option.fallbackUrl);
        onDone(option.fallbackUrl);
      })
      .fail(function () {
        onDone(option.fallbackUrl);
      });
  }

  function renderChips(container, values, selectedValue, groupName) {
    const html = values
      .map(function (value) {
        const isActive = value === selectedValue;
        return (
          '<button type="button" class="fn-chip' +
          (isActive ? ' active' : '') +
          '" data-fn-chip="' +
          groupName +
          '" data-fn-value="' +
          value +
          '">' +
          value +
          '</button>'
        );
      })
      .join('');

    container.innerHTML = html;
  }

  function renderTypeChips(container, typeOptions) {
    const html = typeOptions
      .map(function (option) {
        return (
          '<button type="button" class="fn-chip' +
          (option.active ? ' active' : '') +
          '" data-fn-chip="type" data-fn-key="' +
          option.key +
          '" data-fn-loading="false">' +
          option.label +
          '</button>'
        );
      })
      .join('');

    container.innerHTML = html;
  }

  function updateOfferState(root, mode) {
    const offers = root.querySelectorAll('.fn-offer[data-fn-offer]');
    let i = 0;
    while (i < offers.length) {
      const offer = offers[i];
      const isActive = offer.getAttribute('data-fn-offer') === mode;
      if (isActive) {
        offer.classList.add('active');
      } else {
        offer.classList.remove('active');
      }
      i = i + 1;
    }
    selectedPurchaseMode = mode;

    const cta = root.querySelector('[data-fn-action="add-to-cart"]');
    if (cta) {
      cta.setAttribute('data-fn-mode', mode);
    }
  }

  function addInteractionListeners(root, typeOptions, $) {
    const navigateToSelection = function (typeKey, packageValue, comboValue, analyticsLabel) {
      const option = typeOptions.find(function (item) {
        return item.key === typeKey;
      });

      if (!option) {
        return;
      }

      const activePath = normalizeText(window.location.pathname || '');
      const cacheKey = buildVariantCacheKey(typeKey, packageValue, comboValue);
      const goToUrl = function (urlValue) {
        const finalUrl = urlValue || option.fallbackUrl;
        if (!finalUrl) {
          return;
        }

        saveSelectionState(typeKey, packageValue, comboValue);
        analyticsEvent(analyticsLabel, 'clique');
        pushDataLayerEvent('familyness_pdp_v2_variant_redirect', {
          type: typeKey,
          package: packageValue,
          combo: comboValue,
          url: finalUrl
        });

        if (normalizeText(finalUrl) === activePath) {
          return;
        }

        window.location.href = finalUrl;
      };

      if (option.resolvedUrls[cacheKey]) {
        goToUrl(option.resolvedUrls[cacheKey]);
        return;
      }

      resolveProductUrlBySearch($, option, packageValue, comboValue, function (resolvedUrl) {
        option.resolvedUrls[cacheKey] = resolvedUrl;
        goToUrl(option.resolvedUrls[cacheKey]);
      });
    };

    const wishlist = root.querySelector('[data-fn-action="wishlist"]');
    if (wishlist && !wishlist.getAttribute('data-fn-listener-added')) {
      wishlist.setAttribute('data-fn-listener-added', 'true');
      wishlist.addEventListener('click', function (event) {
        event.preventDefault();
        analyticsEvent('wishlist', 'clique');
        pushDataLayerEvent('familyness_pdp_v2_wishlist_click', {});

        var nativeWishlist = document.querySelector('.product-social-links .action.towishlist[data-post]');
        if (!nativeWishlist) {
          nativeWishlist = document.querySelector('.product-addto-links .action.towishlist[data-post]');
        }
        if (nativeWishlist) {
          nativeWishlist.click();
        }
      });
    }

    const howLink = root.querySelector('[data-fn-action="how-subscription-works"]');
    if (howLink && !howLink.getAttribute('data-fn-listener-added')) {
      howLink.setAttribute('data-fn-listener-added', 'true');
      howLink.addEventListener('click', function (event) {
        event.preventDefault();
        analyticsEvent('como_funciona_assinatura', 'clique');
        pushDataLayerEvent('familyness_pdp_v2_how_subscription_click', {});

        var faqSection = document.getElementById(FAQ_ID);
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    const offerCards = root.querySelectorAll('.fn-offer[data-fn-offer]');
    let i = 0;
    while (i < offerCards.length) {
      const offer = offerCards[i];
      if (!offer.getAttribute('data-fn-listener-added')) {
        offer.setAttribute('data-fn-listener-added', 'true');
        offer.addEventListener('click', function () {
          const mode = offer.getAttribute('data-fn-offer') || 'single';
          updateOfferState(root, mode);
          analyticsEvent('modo_' + mode, 'clique');
          pushDataLayerEvent('familyness_pdp_v2_mode_change', { mode: mode });
        });
      }
      i = i + 1;
    }

    const packageContainer = root.querySelector('[data-fn-chip-group="package"]');
    if (packageContainer) {
      renderChips(packageContainer, CHIP_OPTIONS.package, selectedPackage, 'package');
    }

    const comboContainer = root.querySelector('[data-fn-chip-group="combo"]');
    if (comboContainer) {
      renderChips(comboContainer, CHIP_OPTIONS.combo, selectedCombo, 'combo');
    }

    const commonChips = root.querySelectorAll('.fn-chip[data-fn-chip="package"], .fn-chip[data-fn-chip="combo"]');
    i = 0;
    while (i < commonChips.length) {
      const chip = commonChips[i];
      if (!chip.getAttribute('data-fn-listener-added')) {
        chip.setAttribute('data-fn-listener-added', 'true');
        chip.addEventListener('click', function () {
          const group = chip.getAttribute('data-fn-chip');
          const value = chip.getAttribute('data-fn-value') || '';
          const activeType = getActiveTypeOption(typeOptions);
          const activeTypeKey = activeType ? activeType.key : '';

          if (!activeTypeKey) {
            return;
          }

          if (group === 'package') {
            selectedPackage = value;
            navigateToSelection(activeTypeKey, selectedPackage, selectedCombo, 'embalagem_' + normalizeText(value));
          }

          if (group === 'combo') {
            selectedCombo = value;
            navigateToSelection(activeTypeKey, selectedPackage, selectedCombo, 'combo_' + normalizeText(value));
          }

          pushDataLayerEvent('familyness_pdp_v2_chip_click', { group: group, value: value });
        });
      }
      i = i + 1;
    }

    const typeContainer = root.querySelector('[data-fn-chip-group="type"]');
    if (typeContainer) {
      renderTypeChips(typeContainer, typeOptions);
    }

    const typeButtons = root.querySelectorAll('.fn-chip[data-fn-chip="type"]');
    i = 0;
    while (i < typeButtons.length) {
      const button = typeButtons[i];
      if (!button.getAttribute('data-fn-listener-added')) {
        button.setAttribute('data-fn-listener-added', 'true');
        button.addEventListener('click', function () {
          const key = button.getAttribute('data-fn-key') || '';
          const option = typeOptions.find(function (item) {
            return item.key === key;
          });

          if (!option) {
            return;
          }

          if (option.active) {
            return;
          }

          const goToUrl = function (urlValue) {
            const finalUrl = urlValue || option.fallbackUrl;
            saveSelectionState(option.key, selectedPackage, selectedCombo);
            analyticsEvent('tipo_' + option.key, 'clique');
            pushDataLayerEvent('familyness_pdp_v2_type_redirect', { type: option.key, url: finalUrl });
            window.location.href = finalUrl;
          };

          const typeCacheKey = buildVariantCacheKey(option.key, selectedPackage, selectedCombo);

          if (option.resolvedUrls[typeCacheKey]) {
            goToUrl(option.resolvedUrls[typeCacheKey]);
            return;
          }

          button.classList.add('fn-loading');
          resolveProductUrlBySearch($, option, selectedPackage, selectedCombo, function (resolvedUrl) {
            option.resolvedUrls[typeCacheKey] = resolvedUrl;
            button.classList.remove('fn-loading');
            goToUrl(option.resolvedUrls[typeCacheKey]);
          });
        });
      }
      i = i + 1;
    }

    const qtyValueElement = root.querySelector('[data-fn-qty-value="true"]');
    const minusButton = root.querySelector('[data-fn-qty="minus"]');
    const plusButton = root.querySelector('[data-fn-qty="plus"]');
    let qty = 1;

    const renderQty = function () {
      if (!qtyValueElement) {
        return;
      }
      qtyValueElement.textContent = String(qty);
    };

    renderQty();

    if (minusButton && !minusButton.getAttribute('data-fn-listener-added')) {
      minusButton.setAttribute('data-fn-listener-added', 'true');
      minusButton.addEventListener('click', function () {
        qty = Math.max(1, qty - 1);
        renderQty();
      });
    }

    if (plusButton && !plusButton.getAttribute('data-fn-listener-added')) {
      plusButton.setAttribute('data-fn-listener-added', 'true');
      plusButton.addEventListener('click', function () {
        qty = qty + 1;
        renderQty();
      });
    }

    const cta = root.querySelector('[data-fn-action="add-to-cart"]');
    if (cta && !cta.getAttribute('data-fn-listener-added')) {
      cta.setAttribute('data-fn-listener-added', 'true');
      cta.setAttribute('data-fn-mode', selectedPurchaseMode);
      cta.addEventListener('click', function () {
        const currentMode = cta.getAttribute('data-fn-mode') || selectedPurchaseMode;
        console.log('[Familyness PDP v2] CTA clicado - Mode: ' + currentMode + ', Package: ' + selectedPackage + ', Combo: ' + selectedCombo);

        analyticsEvent('add_to_cart_' + currentMode, 'clique');
        pushDataLayerEvent('familyness_pdp_v2_add_to_cart_click', {
          mode: currentMode,
          package: selectedPackage,
          combo: selectedCombo,
          quantity: qty
        });

        const qtyInput = document.querySelector('input[name="qty"]');
        if (qtyInput) {
          qtyInput.value = String(qty);
          qtyInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (currentMode === 'subscribe') {
          const subscribeRadio = document.querySelector('#radio_subscribe_product');
          if (subscribeRadio) {
            subscribeRadio.checked = true;
            subscribeRadio.dispatchEvent(new Event('change', { bubbles: true }));
            subscribeRadio.dispatchEvent(new Event('click', { bubbles: true }));
          }

          const subscribeButton = document.querySelector('#product-addtocart-button-subscription');
          console.log('[Familyness PDP v2] Botao assinatura: ' + (subscribeButton ? 'encontrado' : 'NAO encontrado'));
          if (subscribeButton) {
            subscribeButton.click();
          }
        } else {
          const onetimeRadio = document.querySelector('#radio_onetime_product');
          if (onetimeRadio) {
            onetimeRadio.checked = true;
            onetimeRadio.dispatchEvent(new Event('change', { bubbles: true }));
            onetimeRadio.dispatchEvent(new Event('click', { bubbles: true }));
          }

          const subscribeRadio = document.querySelector('#radio_subscribe_product');
          if (subscribeRadio) {
            subscribeRadio.checked = false;
          }

          const originalButton = document.querySelector('#product-addtocart-button');
          console.log('[Familyness PDP v2] Botao compra unica: ' + (originalButton ? 'encontrado' : 'NAO encontrado'));
          if (originalButton) {
            originalButton.click();
          }
        }
      });
    }
  }

  var FAQ_ID = 'fn-pdp-v2-faq';

  var FAQ_ITEMS = [
    {
      question: '01. Preciso pagar alguma mensalidade para fazer a Assinatura Loja FamilyNes?',
      answer: 'Nao! A Assinatura e gratuita e conta com beneficios exclusivos. Na contratacao da assinatura, voce recebe um desconto de 5% imediatamente. A partir do segundo mes de renovacao, o desconto aumenta para 10%, oferecendo ainda mais economia com o passar do tempo (exceto para formulas infantis para lactentes e de seguimento para lactentes) e frete gratis no ato da contratacao a partir de R$ 399,00 e nas demais renovacoes a partir de R$ 249,00, valido para todo o Brasil.'
    },
    {
      question: '02. Onde posso fazer minha Assinatura?',
      answer: 'Em qualquer produto da sua escolha existe uma opcao para assinar este item, basta clicar e sua Assinatura tera inicio a partir do momento que voce concluir a compra.'
    },
    {
      question: '03. Qual a frequencia da Assinatura?',
      answer: 'A nossa Assinatura e mensal, ou seja, todos os meses (proximo a data da sua primeira compra) voce recebera os produtos escolhidos para o seu pequeno, sem burocracia e dentro do conforto da sua casa!'
    },
    {
      question: '04. Posso escolher a data de entrega da minha Assinatura?',
      answer: 'A data de entrega e calculada a partir da confirmacao e pagamento automatico do seu pedido. Ou seja, se voce fechar sua assinatura dia 10 de Dezembro, sera cobrado na fatura do seu cartao todo dia 10 do mes subsequente e entregue ate 3 dias depois do pagamento.'
    },
    {
      question: '05. Como e feito o pagamento?',
      answer: 'O pagamento e feito por cartao de credito, de forma automatica e mensal, dessa forma voce nao precisa se preocupar em lembrar de pagar. Deixa com a gente!'
    }
  ];

  function createFaqHtml() {
    var html =
      '<div class="fn-faq-inner">' +
      '<div class="fn-faq-header">' +
      '<h2>Perguntas frequentes sobre assinatura</h2>' +
      '</div>' +
      '<div class="fn-faq-list">';

    var i = 0;
    while (i < FAQ_ITEMS.length) {
      var item = FAQ_ITEMS[i];
      html = html +
        '<div class="fn-faq-item">' +
        '<button type="button" class="fn-faq-question" data-fn-faq-index="' + i + '">' +
        item.question +
        '</button>' +
        '<div class="fn-faq-answer">' +
        '<div class="fn-faq-answer-inner">' + item.answer + '</div>' +
        '</div>' +
        '</div>' +
        '<hr class="fn-faq-separator">';
      i = i + 1;
    }

    html = html + '</div>';
    html = html +
      '<div class="fn-faq-cta-row">' +
      '<a href="/perguntas-frequentes" class="fn-faq-cta">Ver todas as perguntas</a>' +
      '</div>' +
      '</div>';

    return html;
  }

  function injectFaqSection() {
    if (document.getElementById(FAQ_ID)) {
      return;
    }

    var tabsContainer = document.querySelector('.product.info.detailed');
    if (!tabsContainer) {
      console.log('[Familyness PDP v2] Container de tabs nao encontrado para FAQ');
      return;
    }

    var faqSection = document.createElement('section');
    faqSection.id = FAQ_ID;
    faqSection.className = 'fn-faq-section';
    faqSection.setAttribute('data-fn-faq', 'true');
    faqSection.innerHTML = createFaqHtml();

    tabsContainer.parentNode.insertBefore(faqSection, tabsContainer.nextSibling);
    console.log('[Familyness PDP v2] FAQ inserido no DOM');

    var questions = faqSection.querySelectorAll('.fn-faq-question');
    var q = 0;
    while (q < questions.length) {
      var btn = questions[q];
      if (!btn.getAttribute('data-fn-listener-added')) {
        btn.setAttribute('data-fn-listener-added', 'true');
        btn.addEventListener('click', function () {
          var answer = this.nextElementSibling;
          if (!answer) {
            return;
          }
          var isOpen = this.classList.contains('fn-faq-open');
          if (isOpen) {
            this.classList.remove('fn-faq-open');
            answer.style.maxHeight = '0px';
          } else {
            this.classList.add('fn-faq-open');
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
          analyticsEvent('faq_' + this.getAttribute('data-fn-faq-index'), 'clique');
        });
      }
      q = q + 1;
    }
  }

  function getTargetContainer() {
    const selectors = [
      '.product-info-main',
      '.column.main',
      'main'
    ];

    let i = 0;
    while (i < selectors.length) {
      const element = document.querySelector(selectors[i]);
      if (element) {
        console.log('[Familyness PDP v2] Target container encontrado: ' + selectors[i]);
        return element;
      }
      i = i + 1;
    }

    console.log('[Familyness PDP v2] ERRO: Nenhum target container encontrado');
    return null;
  }

  function hideNativeTopElements() {
    const selectors = [
      '.product-info-main .page-title-wrapper',
      '.product-info-main .product-reviews-summary',
      '.product-info-main .product-info-price',
      '.product-add-form',
      '.amrec-product-view.single-purchase',
      'label.amrec-label.subscribe',
      'label[for="radio_subscribe_product"]',
      '.subscription-wrapper',
      '.subscription-discount-block',
      '.amrec-product-view.subscribe',
      '.subscription-info',
      '.freeshiping-conditions',
      '.product-social-links'
    ];

    let i = 0;
    while (i < selectors.length) {
      const element = document.querySelector(selectors[i]);
      if (element && !element.getAttribute('data-fn-hidden-top')) {
        element.setAttribute('data-fn-hidden-top', 'true');
        element.style.display = 'none';
      }
      i = i + 1;
    }
  }

  function applyPdpV2($) {
    const root = document.getElementById(ROOT_ID);
    if (root && root.getAttribute('data-fn-initialized')) {
      console.log('[Familyness PDP v2] Componente já inicializado, pulando aplicação');
      return;
    }

    if (isApplying) {
      console.log('[Familyness PDP v2] Já está aplicando, abortando');
      return;
    }

    isApplying = true;

    try {
      const target = getTargetContainer();
      if (!target) {
        console.log('[Familyness PDP v2] Target container não encontrado');
        isApplying = false;
        return;
      }

      const title = getTitle();
      const reviewText = getReviewCount();
      const priceText = getPriceText();
      const storedState = readSelectionState();

      selectedPackage = parsePackageFromContext(title);
      selectedCombo = parseComboFromContext(title);

      console.log('[Familyness PDP v2] Detectado - Package: ' + selectedPackage + ', Combo: ' + selectedCombo);

      if (shouldUseStoredState(storedState)) {
        console.log('[Familyness PDP v2] Restaurando estado armazenado');
        if (storedState.package && CHIP_OPTIONS.package.indexOf(storedState.package) !== -1) {
          selectedPackage = storedState.package;
        }
        if (storedState.combo && CHIP_OPTIONS.combo.indexOf(storedState.combo) !== -1) {
          selectedCombo = storedState.combo;
        }
      }

      let root = document.getElementById(ROOT_ID);
      if (!root) {
        root = document.createElement('section');
        root.id = ROOT_ID;
        root.setAttribute('data-fn-pdp-v2', 'true');
        root.setAttribute('data-fn-initialized', 'true');

        const anchor = target.querySelector('.product-add-form') || target.querySelector('.box-tocart') || target.firstChild;
        if (anchor && anchor.parentNode) {
          anchor.parentNode.insertBefore(root, anchor);
        } else {
          target.appendChild(root);
        }

        console.log('[Familyness PDP v2] Componente inserido no DOM');
      }

      hideNativeTopElements();
      root.innerHTML = createRootHtml(title, reviewText, priceText);
      console.log('[Familyness PDP v2] HTML renderizado');

      const typeOptions = getTypeConfigByCurrentTitle(title);
      addInteractionListeners(root, typeOptions, $);
      console.log('[Familyness PDP v2] Listeners adicionados');

      injectFaqSection();

      analyticsEvent('componente', 'visualizacao');
      pushDataLayerEvent('familyness_pdp_v2_view', {
        title: title,
        review: reviewText,
        price: priceText
      });

      console.log('[Familyness PDP v2] Componente totalmente renderizado e pronto');
    } finally {
      isApplying = false;
    }
  }

  function scheduleApply($) {
    if (applyDebounceTimer) {
      clearTimeout(applyDebounceTimer);
    }

    applyDebounceTimer = setTimeout(function () {
      applyPdpV2($);
    }, APPLY_DEBOUNCE_MS);
  }

  function setupObserver($) {
    if (window._fnFamilynessPdpObserver) {
      return;
    }

    const observer = new MutationObserver(function (mutations) {
      if (isApplying) {
        return;
      }

      let shouldApply = false;
      let i = 0;
      while (i < mutations.length) {
        const mutation = mutations[i];
        if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length) {
          shouldApply = true;
          break;
        }
        i = i + 1;
      }

      if (shouldApply) {
        scheduleApply($);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window._fnFamilynessPdpObserver = observer;
  }

  function attemptInit() {
    console.log('[Familyness PDP v2] Tentativa de init #' + (initAttempts + 1));

    require(['jquery', 'domReady!'], function ($) {
      const target = getTargetContainer();
      if (!target) {
        initAttempts = initAttempts + 1;
        console.log('[Familyness PDP v2] Target ainda não disponível, tentativas: ' + initAttempts + '/' + MAX_INIT_ATTEMPTS);
        if (initAttempts >= MAX_INIT_ATTEMPTS) {
          console.log('[Familyness PDP v2] ERRO: Max tentativas atingido');
          if (initTimer) {
            clearInterval(initTimer);
            initTimer = null;
          }
        }
        return;
      }

      console.log('[Familyness PDP v2] Target encontrado, iniciando');
      injectStyles();
      applyPdpV2($);
      setupObserver($);

      if (initTimer) {
        clearInterval(initTimer);
        initTimer = null;
      }
    });
  }

  function init() {
    attemptInit();

    if (initTimer) {
      clearInterval(initTimer);
    }

    initTimer = setInterval(function () {
      if (initAttempts >= MAX_INIT_ATTEMPTS) {
        clearInterval(initTimer);
        initTimer = null;
        return;
      }

      initAttempts = initAttempts + 1;
      attemptInit();
    }, INIT_INTERVAL_MS);
  }

  console.log('[Familyness PDP v2] Script carregado, readyState: ' + document.readyState);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[Familyness PDP v2] DOMContentLoaded disparado');
      init();
    });
  } else {
    console.log('[Familyness PDP v2] DOM já ready, iniciando agora');
    init();
  }
})();

(function () {
  'use strict';
  var progressInitialized = false;
  var cartSubscriptionAdded = false;
  var listenersAdded = false;
  var pollingTimer = null;
  var pollingCount = 0;
  var FREE_SHIPPING_THRESHOLD = 399.0;
  var MAX_POLLS = 30;
  var POLL_INTERVAL_MS = 1000;
  var STYLE_ID = 'custom-minicart2-style';

  function getMiniCartCss() {
    return [
      '.page-header .minicart-wrapper .block-minicart { position: fixed; right: 0px; top: 0px; width: 100%; max-width: 472px; min-width: auto; height: 100%; margin: 0px; border-radius: 20px 0px 0px 20px; box-shadow: 0px 0px 16px 0px #0000008C; border: none; padding: 0px; background-color: #fff; box-sizing: border-box; z-index: 9999; }',
      '.minicart-wrapper #assinatura-message { margin: -50px 0px 10px; }',
      '.page-header .minicart-wrapper .block-minicart:before, .page-header .minicart-wrapper .block-minicart:after { display: none; }',
      '.page-header .minicart-wrapper .block-minicart .block-title { display: block; padding: 40px; background-color: #F5F7F9; border-radius: 20px 0px 0px 0px; }',
      '.page-header .minicart-wrapper .block-minicart .block-title strong { font-size: 20px; }',
      '.page-header .minicart-wrapper .block-minicart .block-title strong span.text:after { content: "Seu carrinho"; font-size: 20px; }',
      '.page-header .minicart-wrapper .block-minicart .block-title strong span.text { font-size: 0px; }',
      '.page-header .minicart-wrapper .block-minicart .block-title .qty { font-size: 20px; }',
      '.page-header .minicart-wrapper .block-minicart .block-title .qty:before { content: "("; }',
      '.page-header .minicart-wrapper .block-minicart .block-title .qty:after { content: ")"; }',
      '.page-header .minicart-wrapper .action.close { top: 24px; right: 24px; margin: 0px; height: 16px; width: 16px; }',
      '.page-header .minicart-wrapper .block-minicart .block-content { padding: 32px 0px 0px; background-color: #fff; border-radius: 0px 0px 0px 20px; }',
      '.page-header .minicart-wrapper .block-minicart .items-total { display: none; }',
      '.page-header .minicart-wrapper .block-minicart .block-content .subtotal { position: absolute; bottom: 230px; font-size: 22px; width: 100%; text-align: left; left: 0px; display: flex; align-items: center; justify-content: space-between; padding: 0px 40px; box-sizing: border-box; z-index: 9; }',
      '.page-header .minicart-wrapper .block-minicart .block-content .subtotal span.label { margin: 0px; }',
      '.page-header .minicart-wrapper .block-minicart .amount .price-wrapper:first-child .price { font-size: 22px; }',
      '.page-header .minicart-items-wrapper { border: none; margin: 0px; padding: 0px; max-height: 100% !important; height: 85dvh !important; }',
      '.page-header .minicart-items .product-item { padding: 32px 0px !important; }',
      '.page-header .minicart-items .product-item:not(:first-child) { border-top: 1px solid #94A5B1; }',
      '.page-header .minicart-items .product-item:first-child { padding-top: 0px !important; }',
      '.page-header .minicart-items .product-item .product-item-photo { border: 1px solid #E9EBF8; border-radius: 8px; box-sizing: border-box; padding: 8px; margin: 0px 16px 0px 0px; }',
      '.page-header .minicart-items .product-item-details { padding-left: 109px; position: relative; }',
      '.page-header .minicart-items .product-item-name { margin: 0px 0px 12px; max-width: 223px; }',
      '.page-header .minicart-items .product-item-details .price { font-size: 18px; }',
      '.page-header .minicart-items .product-item-details .details-qty { margin: 16px 0px 0px; display: flex; align-items: center; }',
      '.page-header .minicart-wrapper .block-minicart .qty label { display: none; }',
      '.page-header .minicart-wrapper .block-minicart .qty input { max-width: 96px; min-width: 96px; }',
      '.page-header .minicart-items .product-item-details .price-including-tax, .page-header .minicart-items .product-item-details .price-excluding-tax { margin: 0px; }',
      '.page-header .minicart-wrapper .product .actions { margin: 0px; position: absolute; top: 0px; right: 0px; }',
      '.page-header .minicart-wrapper .block-minicart .message.notice { margin: 16px 0px 0px; }',
      '.page-header .block-minicart .block-content>.actions:last-child { bottom: 80px; background-color: #fff; position: absolute; height: 197px; display: table; width: 100%; left: 0px; max-width: 472px; padding: 24px 40px 40px; box-sizing: border-box; z-index: 1; border-radius: 20px 0px 0px; }',
      '.page-header .minicart-wrapper .block-minicart .block-content>.actions>.primary .action.primary.checkout { display: none; }',
      '.page-header .block-minicart .block-content>.actions:nth-child(6) { position: absolute; bottom: 120px; right: 0px; display: table; z-index: 2; width: 100%; max-width: 100%; padding: 0px 40px; box-sizing: border-box; }',
      '.page-header .block-minicart .block-content>.actions:nth-child(5) { position: absolute; bottom: 175px; z-index: 9; width: 100%; max-width: 100%; }',
      '.page-header .minicart-wrapper .action.viewcart { margin: 0px auto; border: none; font-size: 18px; line-height: 20px; width: auto; padding: 0px; display: none; }',
      '.page-header .minicart-wrapper .action.viewcart:focus, .page-header .minicart-wrapper .action.viewcart:active, .page-header .minicart-wrapper .action.viewcart:hover { background: none; border: none; text-decoration: underline; }',
      '.page-header .block-minicart .block-content>.actions:last-child .primary { margin: 52px 0px 0px; }',
      '.page-header .minicart-wrapper .block-minicart:before { content: ""; display: table; width: 100%; height: 100%; background-color: #000; opacity: 0.3; z-index: 1; position: fixed; border: unset; top: 0px !important; right: 473px !important; }',
      '.page-header .minicart-wrapper.active .block-minicart div#minicart-content-wrapper { position: relative; z-index: 9; }',
      '[data-content-type="html"] .container-chat-tag { z-index: 9 !important; }',
      '.page-header .minicart-items { height: 56dvh; overflow: hidden; overflow-y: scroll; padding: 0px 40px; }',
      '.page-header .minicart-items::-webkit-scrollbar { width: 5px; }',
      '.page-header .minicart-items::-webkit-scrollbar-track { background: #ffffff; border-radius: 10px; }',
      '.page-header .minicart-items::-webkit-scrollbar-thumb { background-color: var(--uni-color-tertiary-blue-700); border-radius: 10px; }',
      '.page-header .minicart-items .product-item-details .product .options.list dd span.price:before { content: "- "; }',
      '.free-shipping-progress { margin-top: 24px; width: 100%; }',
      '.free-shipping-progress .progress-message { font-size: 16px; font-weight: 400; color: #173C56; text-align: left; margin-bottom: 16px; }',
      '.free-shipping-progress .progress-message.completed { font-weight: 700; font-size: 18px; color: #00855D; }',
      '.free-shipping-progress .progress-message strong { font-weight: 700; }',
      '.free-shipping-progress .progress-bar-container { width: 100%; height: 12px; margin: 0px 0px 16px; background-color: #E9EBF8; border-radius: 88px; overflow: visible; position: relative; }',
      '.free-shipping-progress .progress-bar-fill { height: 100%; background-color: #00855D; border-radius: 88px; transition: width 0.3s ease; width: 0%; }',
      '.free-shipping-progress .progress-checkmark { box-sizing: border-box; display: flex; justify-content: center; align-items: center; position: absolute; width: 25px; height: 25px; right: -5px; top: -7px; background: #00855D; border: 1px solid #F5F7F9; border-radius: 99px; opacity: 0; visibility: hidden; transition: opacity 0.3s ease; }',
      '.free-shipping-progress .progress-bar-container.completed .progress-checkmark { opacity: 1; visibility: visible; }',
      '.free-shipping-progress .progress-checkmark svg { width: 16px; height: 16px; }',
      '.free-shipping-progress .progress-additional-message { font-family: "Lato", sans-serif; font-weight: 400; font-size: 16px; line-height: 19px; color: #173C56; display: none; margin-top: 8px; }',
      '.free-shipping-progress .progress-additional-message.show { display: block; }',
      '.custom-view-cart-btn { display: block; width: 100%; padding: 11px 20px; margin: 0px 0px 16px; background-color: #173C56; color: #ffffff; font-size: 18px; font-weight: 700; text-align: center; text-decoration: none; border-radius: 100px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box; }',
      '.custom-view-cart-btn:visited { color: #fff; }',
      '.custom-view-cart-btn:hover { background-color: var(--uni-color-primary-main-hover); color: #fff; text-decoration: none; }',
      '.custom-continue-shopping-btn { display: block; padding: 0px; margin: 0px auto; background: none; border: none; color: var(--uni-color-primary-main); font-size: 18px; line-height: 20px; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.3s ease; }',
      '.custom-continue-shopping-btn:hover { text-decoration: underline; border: none; background-color: unset; }',
      '.page-header .minicart-wrapper .actions .secondary { text-align: center; }',
      '.page-header .block-minicart .block-content>.actions:last-child .custom-cart-buttons { display: flex; flex-direction: column; gap: 0px; }',
      '@media screen and (max-width: 580px) { .page-header .minicart-wrapper .block-minicart { max-width: 100%; height: 100%; top: unset; bottom: 0px; border-radius: 0px; } .page-header .minicart-wrapper .block-minicart .block-title { padding: 24px; border-radius: 0px; } .page-header .minicart-items { height: 59dvh; padding: 0px 24px; } .page-header .minicart-items .product-item { padding: 24px 0px !important; } .page-header .minicart-items .product-item-name { max-width: 192px; } .page-header .block-minicart .block-content>.actions:last-child { max-width: 100%; bottom: 160px; padding: 24px 24px 40px; border-radius: 0px; } .page-header .block-minicart .block-content>.actions:nth-child(5) { position: absolute; bottom: 235px; z-index: 9; width: 100%; max-width: 100%; } .page-header .block-minicart .block-content>.actions:nth-child(6) { bottom: 200px; } .page-header .minicart-wrapper .block-minicart .block-content .subtotal { bottom: 310px; font-size: 20px; } .page-header .minicart-wrapper .block-minicart .amount .price-wrapper:first-child .price { font-size: 20px; } .page-header .minicart-wrapper .block-minicart:before { right: 0px !important; } .page-header .minicart-items-wrapper { height: 100dvh !important; } .page-header #assinatura-message + .minicart-items-wrapper { height: 95dvh !important;} }'
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    var styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(getMiniCartCss()));
    document.head.appendChild(styleElement);
  }

  function createProgressBar($) {
    var blockTitle = $('.minicart-wrapper .block-minicart .block-title');
    if (blockTitle.length && !blockTitle.find('.free-shipping-progress').length) {
      var progressHtml =
        '<div class="free-shipping-progress">' +
        '<div class="progress-message"></div>' +
        '<div class="progress-bar-container">' +
        '<div class="progress-bar-fill"></div>' +
        '<div class="progress-checkmark">' +
        '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="white"></path>' +
        '</svg>' +
        '</div>' +
        '</div>' +
        '<div class="progress-additional-message">Aproveite para adicionar mais produtos!</div>' +
        '</div>';
      blockTitle.append(progressHtml);
      progressInitialized = true;
      return true;
    }
    return false;
  }

  function getCartSubtotal($, customerData) {
    var cart = customerData.get('cart');
    var cartData = cart();
    if (cartData && cartData.subtotalAmount) {
      return parseFloat(cartData.subtotalAmount);
    }
    var subtotalElement = $('.minicart-wrapper .block-minicart .subtotal .price, .minicart-wrapper .subtotal .price');
    if (subtotalElement.length) {
      var subtotalText = subtotalElement.first().text().replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(subtotalText) || 0;
    }
    return 0;
  }

  function updateProgressBar($, customerData) {
    if (!progressInitialized && !createProgressBar($)) {
      return;
    }
    var currentTotal = getCartSubtotal($, customerData);
    var remaining = FREE_SHIPPING_THRESHOLD - currentTotal;
    var percentage = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    var progressBar = $('.free-shipping-progress .progress-bar-fill');
    var progressBarContainer = $('.free-shipping-progress .progress-bar-container');
    var progressMessage = $('.free-shipping-progress .progress-message');
    var additionalMessage = $('.free-shipping-progress .progress-additional-message');
    if (!progressBar.length || !progressMessage.length) {
      return;
    }
    progressBar.css('width', percentage + '%');
    if (remaining <= 0) {
      progressMessage.text('Voce ganhou frete gratis!');
      progressMessage.addClass('completed');
      progressBarContainer.addClass('completed');
      additionalMessage.addClass('show');
      return;
    }
    var remainingFormatted = 'R$ ' + remaining.toFixed(2).replace('.', ',');
    progressMessage.html('Faltam <strong>' + remainingFormatted + '</strong> para Frete Gratis');
    progressMessage.removeClass('completed');
    progressBarContainer.removeClass('completed');
    additionalMessage.removeClass('show');
  }

  function createViewCartButton($) {
    var actionsContainer = $('.block-minicart .block-content > .actions:last-child .primary');
    if (actionsContainer.length && !actionsContainer.find('.custom-view-cart-btn').length) {
      var viewCartBtn = '<a href="/checkout/cart/" class="custom-view-cart-btn">Finalizar compra</a>';
      actionsContainer.prepend(viewCartBtn);
    }
  }

  function createContinueShoppingButton($) {
    var viewCartLink = $('.minicart-wrapper .actions .secondary .action.viewcart');
    if (viewCartLink.length && !viewCartLink.next('.custom-continue-shopping-btn').length) {
      var continueBtn = '<button class="custom-continue-shopping-btn" type="button">Continuar comprando</button>';
      viewCartLink.after(continueBtn);
    }
    $('.custom-continue-shopping-btn').each(function () {
      var buttonElement = this;
      if (buttonElement.getAttribute('data-minicart-close-listener-added')) {
        return;
      }
      buttonElement.setAttribute('data-minicart-close-listener-added', 'true');
      $(buttonElement).on('click', function (event) {
        event.preventDefault();
        $('#btn-minicart-close').trigger('click');
      });
    });
  }

  function removeSubtitle($) {
    if ($('.block-minicart #assinatura-message').length > 0) {
      $('.block-minicart .subtitle').remove();
    }
  }

  function applyMiniCartCustomizations($, customerData) {
    createProgressBar($);
    updateProgressBar($, customerData);
    createViewCartButton($);
    createContinueShoppingButton($);
    removeSubtitle($);
  }

  function setupListeners($, customerData) {
    if (listenersAdded) {
      return;
    }
    $(document).on('click', '.showcart', function () {
      setTimeout(function () {
        applyMiniCartCustomizations($, customerData);
      }, 500);
    });
    $('body').on('contentUpdated', function () {
      setTimeout(function () {
        applyMiniCartCustomizations($, customerData);
      }, 300);
    });
    $(document).on('ajax:addToCart ajax:removeFromCart', function () {
      setTimeout(function () {
        applyMiniCartCustomizations($, customerData);
      }, 500);
    });
    listenersAdded = true;
  }

  function setupCartSubscription($, customerData) {
    if (cartSubscriptionAdded) {
      return;
    }
    var cart = customerData.get('cart');
    cart.subscribe(function () {
      setTimeout(function () {
        updateProgressBar($, customerData);
      }, 300);
    });
    cartSubscriptionAdded = true;
  }

  function setupPolling($, customerData) {
    if (pollingTimer) {
      return;
    }
    pollingTimer = setInterval(function () {
      pollingCount = pollingCount + 1;
      var minicart = $('.minicart-wrapper .block-minicart');
      if (minicart.length && minicart.is(':visible')) {
        applyMiniCartCustomizations($, customerData);
      }
      if (pollingCount >= MAX_POLLS) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }, POLL_INTERVAL_MS);
  }

  function init() {
    injectStyles();
    require(['jquery', 'Magento_Customer/js/customer-data', 'domReady!'], function ($, customerData) {
      applyMiniCartCustomizations($, customerData);
      setupCartSubscription($, customerData);
      setupListeners($, customerData);
      setupPolling($, customerData);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
