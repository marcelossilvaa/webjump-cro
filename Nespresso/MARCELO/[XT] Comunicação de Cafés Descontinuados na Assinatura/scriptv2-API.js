(function () {
  'use strict';

  if (window.wjDelistedSubsModalV2) {
    return;
  }
  window.wjDelistedSubsModalV2 = true;

  const STYLE_ID = 'wj-delisted-subs-modal-style';
  const MODAL_ID = 'wj-delisted-subs-modal';
  const OVERLAY_ID = 'wj-delisted-subs-overlay';
  const BTN_ID = 'wj-my-subscriptions-btn';
  const LISTENER_ATTR = 'data-wj-delisted-subs-listener';

  const STANDING_ORDERS_URL =
    'https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list';
  const STANDING_ORDERS_EDIT_URL =
    'https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list';
  const TRACKING_CATEGORY = 'cafes_descontinuados_assinatura_v2';
  const DISMISS_STORAGE_KEY = 'wj-delisted-subs-modal-dismissed-at';
  const SESSION_SHOWN_KEY = 'wj-delisted-subs-modal-shown';
  const DISMISS_DAYS = 7;

  const DELISTED_CATEGORIES = [
    {
      id: 'original',
      title: 'Cafés Original',
      skus: ['7886.90', '7892.90', '7880.90', '7894.90', '7871.90', '7877.90'],
    },
    {
      id: 'vertuo',
      title: 'Cafés Vertuo',
      skus: ['7002.80', '7017.80'],
    },
  ];

  let isProcessing = false;
  let debounceTimer = null;
  let modalOpen = false;
  let isClosing = false;
  let autoShowCompleted = false;
  let cachedFirstName = '';
  let cachedProductsHtml = '';
  let cachedSubscriptionSkus = null;
  let subscriptionSkusPromise = null;

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action,
      local_event_label: label,
    });
  }

  function getSessionStorageItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  function setSessionStorageFlag(key) {
    try {
      sessionStorage.setItem(key, '1');
    } catch (error) {}
  }

  function wasShownThisSession() {
    try {
      return sessionStorage.getItem(SESSION_SHOWN_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function wasDismissedRecently() {
    try {
      const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (!dismissedAt) {
        return false;
      }

      const dismissedDate = new Date(dismissedAt);
      const diffDays = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays < DISMISS_DAYS;
    } catch (error) {
      return false;
    }
  }

  function canShowModal() {
    return !wasDismissedRecently() && !wasShownThisSession();
  }

  function markModalDismissed() {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, new Date().toISOString());
    } catch (error) {}
  }

  function markModalShownThisSession() {
    setSessionStorageFlag(SESSION_SHOWN_KEY);
  }

  async function waitForAPI(maxAttempts, delay) {
    const attempts = maxAttempts || 10;
    const waitMs = delay || 500;

    for (let i = 0; i < attempts; i++) {
      if (
        window.napi &&
        window.napi.catalog &&
        typeof window.napi.catalog().getProduct === 'function'
      ) {
        return true;
      }
      await new Promise(function (resolve) {
        setTimeout(resolve, waitMs);
      });
    }
    return false;
  }

  async function waitForStandingOrdersAPI(maxAttempts, delay) {
    const attempts = maxAttempts || 10;
    const waitMs = delay || 500;

    for (let i = 0; i < attempts; i++) {
      if (
        window.napi &&
        window.napi.standingOrders &&
        typeof window.napi.standingOrders().getOrders === 'function'
      ) {
        return true;
      }
      await new Promise(function (resolve) {
        setTimeout(resolve, waitMs);
      });
    }
    return false;
  }

  function parseSkuFromLineItem(item) {
    if (!item || typeof item !== 'string') {
      return null;
    }

    const match = item.match(/erp\.br\.b2c\/prod\/(\d{4}\.\d{2})/);
    return match ? match[1] : null;
  }

  async function getSubscriptionSkus() {
    const apiReady = await waitForStandingOrdersAPI();
    if (!apiReady) {
      return null;
    }

    try {
      const orders = await window.napi.standingOrders().getOrders('Responsive');
      if (!orders || !orders.length) {
        return [];
      }

      const skuMap = {};
      let i = 0;

      while (i < orders.length) {
        const order = orders[i];
        const lines = order.cart && order.cart.lines ? order.cart.lines : [];
        let j = 0;

        while (j < lines.length) {
          const line = lines[j];
          if (line.isActive !== false) {
            const sku = parseSkuFromLineItem(line.item);
            if (sku) {
              skuMap[sku] = true;
            }
          }
          j++;
        }
        i++;
      }

      return Object.keys(skuMap);
    } catch (error) {
      return null;
    }
  }

  function getDelistedSkusInSubscription(subscriptionSkus) {
    const allDelisted = getAllDelistedSkus();
    return subscriptionSkus.filter(function (sku) {
      return allDelisted.indexOf(sku) !== -1;
    });
  }

  async function ensureSubscriptionSkus() {
    if (cachedSubscriptionSkus !== null) {
      return cachedSubscriptionSkus;
    }

    if (!subscriptionSkusPromise) {
      subscriptionSkusPromise = getSubscriptionSkus().then(function (skus) {
        cachedSubscriptionSkus = skus;
        return skus;
      });
    }

    return subscriptionSkusPromise;
  }

  async function loadProductsForSkus(skus) {
    const apiReady = await waitForAPI();
    if (!apiReady) {
      return false;
    }

    const fetchPromises = skus.map(function (sku) {
      return fetchProductData(sku).then(function (productData) {
        if (productData) {
          cachedProductsBySku[sku] = productData;
        }
      });
    });

    await Promise.all(fetchPromises);
    return true;
  }

  async function preloadUserData() {
    cachedFirstName = await getUserFirstName();
  }

  async function fetchProductData(sku) {
    try {
      return await window.napi.catalog().getProduct(sku);
    } catch (error) {
      return null;
    }
  }

  function isUserLoggedIn() {
    const cached = getSessionStorageItem('customerInfo-br');
    if (cached && (cached.firstName || cached.memberNumber)) {
      return true;
    }

    return !!document.getElementById('ta-login-dropdown--logged');
  }

  async function isUserLoggedInAsync() {
    if (isUserLoggedIn()) {
      return true;
    }

    try {
      const apiReady = await waitForAPI();
      if (apiReady && window.napi.customer) {
        const customerInfo = await window.napi.customer().read();
        return !!(customerInfo && (customerInfo.firstName || customerInfo.memberNumber));
      }
    } catch (error) {}

    return false;
  }

  async function getUserFirstName() {
    const cached = getSessionStorageItem('customerInfo-br');
    if (cached && cached.firstName) {
      return cached.firstName;
    }

    try {
      const apiReady = await waitForAPI();
      if (apiReady && window.napi.customer) {
        const customerInfo = await window.napi.customer().read();
        if (customerInfo && customerInfo.firstName) {
          return customerInfo.firstName;
        }
      }
    } catch (error) {}

    return '';
  }

  const cachedProductsBySku = {};

  function getAllDelistedSkus() {
    const skus = [];
    let i = 0;

    while (i < DELISTED_CATEGORIES.length) {
      const category = DELISTED_CATEGORIES[i];
      let j = 0;
      while (j < category.skus.length) {
        skus.push(category.skus[j]);
        j++;
      }
      i++;
    }

    return skus;
  }

  function buildCategoryHtml(category, activeSkus) {
    const items = [];
    let i = 0;

    while (i < category.skus.length) {
      const sku = category.skus[i];
      if (activeSkus.indexOf(sku) === -1) {
        i++;
        continue;
      }

      const productData = cachedProductsBySku[sku];
      if (productData) {
        items.push(buildProductItemHtml(productData));
      }
      i++;
    }

    if (items.length === 0) {
      return '';
    }

    return (
      '<div class="wj-delisted-subs-category">' +
      '<p class="wj-delisted-subs-category-title">' +
      category.title +
      '</p>' +
      '<ul class="wj-delisted-subs-product-list">' +
      items.join('') +
      '</ul>' +
      '</div>'
    );
  }

  function buildProductsListHtml(activeSkus) {
    const sections = [];
    let i = 0;

    while (i < DELISTED_CATEGORIES.length) {
      const sectionHtml = buildCategoryHtml(DELISTED_CATEGORIES[i], activeSkus);
      if (sectionHtml) {
        sections.push(sectionHtml);
      }
      i++;
    }

    if (sections.length > 0) {
      return sections.join('');
    }

    return '<p class="wj-delisted-subs-loading">Não foi possível carregar os produtos.</p>';
  }

  function navigateToStandingOrders() {
    window.location.href = STANDING_ORDERS_URL;
  }

  function getGreeting() {
    const attentionLine = cachedFirstName
      ? 'ATENÇÃO, ' + cachedFirstName.toUpperCase() + '!'
      : 'ATENÇÃO!';
    return (
      '<span class="wj-delisted-subs-title-line1">' +
      attentionLine +
      '</span>' +
      '<span class="wj-delisted-subs-title-line2">Atualize sua Assinatura</span>'
    );
  }

  function getProductImageUrl(productData) {
    let image =
      (productData.responsiveImages && productData.responsiveImages.plp) ||
      (productData.images && productData.images.main) ||
      '';

    if (image && image.indexOf('http') !== 0) {
      image = 'https://www.nespresso.com' + image;
    }

    return image;
  }

  function buildProductItemHtml(productData) {
    const name = productData.name || '';
    const image = getProductImageUrl(productData);

    return (
      '<li class="wj-delisted-subs-product">' +
      '<img class="wj-delisted-subs-product-img" src="' +
      image +
      '" alt="' +
      name +
      '">' +
      '<div class="wj-delisted-subs-product-info">' +
      '<span class="wj-delisted-subs-product-name">' +
      name +
      '</span>' +
      '</div>' +
      '</li>'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' +
      OVERLAY_ID +
      ' {' +
      'position: fixed;' +
      'inset: 0;' +
      'z-index: 10000;' +
      'background: rgba(23, 23, 26, 0.45);' +
      'backdrop-filter: blur(4px);' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'padding: 16px;' +
      'box-sizing: border-box;' +
      'opacity: 0;' +
      '}' +
      '#' +
      OVERLAY_ID +
      '.wj-delisted-subs-overlay--entering {' +
      'animation: wj-delisted-subs-overlay-in 0.28s ease forwards;' +
      '}' +
      '#' +
      OVERLAY_ID +
      '.wj-delisted-subs-overlay--closing {' +
      'animation: wj-delisted-subs-overlay-out 0.22s ease forwards;' +
      '}' +
      '#' +
      MODAL_ID +
      ' {' +
      'position: relative;' +
      'background: #fff;' +
      'border-radius: 8px;' +
      'max-width: 920px;' +
      'width: 100%;' +
      'max-height: 90vh;' +
      'overflow: hidden;' +
      'display: flex;' +
      'flex-direction: column;' +
      'font-family: NespressoLucas, Helvetica, Arial, sans-serif;' +
      'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);' +
      'opacity: 0;' +
      'transform: scale(0.95) translateY(12px);' +
      '}' +
      '#' +
      MODAL_ID +
      '.wj-delisted-subs-modal--entering {' +
      'animation: wj-delisted-subs-modal-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;' +
      '}' +
      '#' +
      MODAL_ID +
      '.wj-delisted-subs-modal--closing {' +
      'animation: wj-delisted-subs-modal-out 0.22s ease forwards;' +
      '}' +
      '@keyframes wj-delisted-subs-overlay-in {' +
      'from { opacity: 0; }' +
      'to { opacity: 1; }' +
      '}' +
      '@keyframes wj-delisted-subs-overlay-out {' +
      'from { opacity: 1; }' +
      'to { opacity: 0; }' +
      '}' +
      '@keyframes wj-delisted-subs-modal-in {' +
      'from { opacity: 0; transform: scale(0.95) translateY(12px); }' +
      'to { opacity: 1; transform: scale(1) translateY(0); }' +
      '}' +
      '@keyframes wj-delisted-subs-modal-out {' +
      'from { opacity: 1; transform: scale(1) translateY(0); }' +
      'to { opacity: 0; transform: scale(0.95) translateY(12px); }' +
      '}' +
      '@media (prefers-reduced-motion: reduce) {' +
      '#' +
      OVERLAY_ID +
      ', #' +
      MODAL_ID +
      ' {' +
      'animation: none !important;' +
      'opacity: 1 !important;' +
      'transform: none !important;' +
      '}' +
      '}' +
      '#' +
      MODAL_ID +
      ' * {' +
      'box-sizing: border-box;' +
      'font-family: NespressoLucas, Helvetica, Arial, sans-serif;' +
      '}' +
      '.wj-delisted-subs-close {' +
      'position: absolute;' +
      'top: 16px;' +
      'right: 16px;' +
      'background: none;' +
      'border: none;' +
      'font-size: 28px;' +
      'line-height: 1;' +
      'color: #666;' +
      'cursor: pointer;' +
      'padding: 0;' +
      'width: 32px;' +
      'height: 32px;' +
      'z-index: 2;' +
      '}' +
      '.wj-delisted-subs-body {' +
      'display: flex;' +
      'flex: 1;' +
      'min-height: 0;' +
      'overflow: auto;' +
      '-webkit-overflow-scrolling: touch;' +
      '}' +
      '.wj-delisted-subs-left {' +
      'flex: 1;' +
      'padding: 40px 32px 24px;' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: center;' +
      'text-align: center;' +
      '}' +
      '.wj-delisted-subs-right {' +
      'flex: 1;' +
      'padding: 32px 28px 20px;' +
      'border-left: 1px solid #E8E8E8;' +
      'overflow-y: auto;' +
      '}' +
      '.wj-delisted-subs-icon {' +
      'width: 48px;' +
      'height: 48px;' +
      'border-radius: 50%;' +
      'background: #C0392B;' +
      'color: #fff;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'font-size: 24px;' +
      'font-weight: 700;' +
      'margin-bottom: 16px;' +
      '}' +
      '.wj-delisted-subs-title {' +
      'margin: 0 0 12px;' +
      'font-size: 24px;' +
      'font-weight: 700;' +
      'color: #17171A;' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: center;' +
      'gap: 10px;' +
      '}' +
      '.wj-delisted-subs-title-line1 {' +
      'display: block;' +
      'font-size: 24px;' +
      'font-weight: 700;' +
      'letter-spacing: 0.5px;' +
      'text-transform: uppercase;' +
      '}' +
      '.wj-delisted-subs-title-line2 {' +
      'display: block;' +
      'font-size: 24px;' +
      'font-weight: 700;' +
      '}' +
      '.wj-delisted-subs-text {' +
      'margin: 0 0 20px;' +
      'font-size: 14px;' +
      'line-height: 1.5;' +
      'color: #3D3D41;' +
      'max-width: 340px;' +
      '}' +
      '.wj-delisted-subs-info-box {' +
      'background: #EEF5F0;' +
      'border-radius: 8px;' +
      'padding: 16px;' +
      'text-align: left;' +
      'width: 100%;' +
      'max-width: 340px;' +
      'margin-bottom: 24px;' +
      '}' +
      '.wj-delisted-subs-info-title {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 8px;' +
      'font-size: 14px;' +
      'font-weight: 700;' +
      'color: #17171A;' +
      'margin: 0 0 8px;' +
      '}' +
      '.wj-delisted-subs-info-text {' +
      'margin: 0;' +
      'font-size: 13px;' +
      'line-height: 1.45;' +
      'color: #3D3D41;' +
      '}' +
      '.wj-delisted-subs-actions {' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      'width: 100%;' +
      'max-width: 340px;' +
      '}' +
      '.wj-delisted-subs-btn-primary,' +
      '.wj-delisted-subs-btn-secondary {' +
      'display: block;' +
      'width: 100%;' +
      'padding: 14px 20px;' +
      'border-radius: 50px;' +
      'font-size: 13px;' +
      'font-weight: 600;' +
      'letter-spacing: 0.5px;' +
      'text-transform: uppercase;' +
      'text-align: center;' +
      'text-decoration: none;' +
      'cursor: pointer;' +
      'border: 2px solid #257A57;' +
      '}' +
      '.wj-delisted-subs-btn-primary {' +
      'background: #257A57;' +
      'color: #fff;' +
      '}' +
      '.wj-delisted-subs-btn-secondary {' +
      'background: #fff;' +
      'color: #257A57;' +
      '}' +
      '.wj-delisted-subs-list-title {' +
      'margin: 0 0 10px;' +
      'font-size: 16px;' +
      'font-weight: 700;' +
      'color: #17171A;' +
      '}' +
      '.wj-delisted-subs-products-wrap {' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 16px;' +
      '}' +
      '.wj-delisted-subs-category {' +
      'margin: 0;' +
      '}' +
      '.wj-delisted-subs-category-title {' +
      'margin: 0 0 8px;' +
      'padding-bottom: 8px;' +
      'border-bottom: 1px solid #D9D9D9;' +
      'font-size: 14px;' +
      'font-weight: 400;' +
      'color: #17171A;' +
      '}' +
      '.wj-delisted-subs-product-list {' +
      'list-style: none;' +
      'margin: 0;' +
      'padding: 0;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 10px;' +
      '}' +
      '.wj-delisted-subs-product {' +
      'display: flex;' +
      'gap: 8px;' +
      'align-items: center;' +
      '}' +
      '.wj-delisted-subs-product-img {' +
      'width: 56px;' +
      'height: 56px;' +
      'object-fit: contain;' +
      'border-radius: 4px;' +
      'flex-shrink: 0;' +
      '}' +
      '.wj-delisted-subs-product-info {' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 2px;' +
      '}' +
      '.wj-delisted-subs-product-name {' +
      'font-size: 14px;' +
      'font-weight: 700;' +
      'color: #17171A;' +
      '}' +
      '.wj-delisted-subs-footer {' +
      'display: flex;' +
      'align-items:  center;' +
      'gap: 12px;' +
      'background: #EEF5F0;' +
      'padding: 16px 24px;' +
      'border-top: 1px solid #D9E4DB;' +
      'flex-shrink: 0;' +
      '}' +
      '.wj-delisted-subs-footer svg {' +
      'flex-shrink: 0;' +
      '}' +
      '.wj-delisted-subs-footer-text {' +
      'margin: 0;' +
      'font-size: 13px;' +
      'line-height: 1.45;' +
      'color: #17171A;' +
      '}' +
      '.wj-delisted-subs-loading {' +
      'padding: 48px;' +
      'text-align: center;' +
      'color: #666;' +
      'font-size: 14px;' +
      '}' +
      '@media (max-width: 768px) {' +
      '#' +
      OVERLAY_ID +
      ' {' +
      'padding: 12px;' +
      'align-items: center;' +
      'justify-content: center;' +
      '}' +
      '#' +
      MODAL_ID +
      ' {' +
      'width: 100%;' +
      'max-width: 100%;' +
      'max-height: calc(100dvh - 24px);' +
      'height: auto;' +
      'border-radius: 8px;' +
      'min-height: 0;' +
      '}' +
      '.wj-delisted-subs-body {' +
      'flex-direction: column;' +
      'flex: 1;' +
      'overflow-y: auto;' +
      '}' +
      '.wj-delisted-subs-left {' +
      'padding: 40px 16px 16px;' +
      'flex: none;' +
      '}' +
      '.wj-delisted-subs-right {' +
      'border-left: none;' +
      'border-top: 1px solid #E8E8E8;' +
      'padding: 16px;' +
      'overflow-y: visible;' +
      'flex: none;' +
      '}' +
      '.wj-delisted-subs-close {' +
      'top: 12px;' +
      'right: 12px;' +
      '}' +
      '.wj-delisted-subs-icon {' +
      'width: 40px;' +
      'height: 40px;' +
      'font-size: 20px;' +
      'margin-bottom: 12px;' +
      '}' +
      '.wj-delisted-subs-title {' +
      'gap: 6px;' +
      'margin-bottom: 8px;' +
      '}' +
      '.wj-delisted-subs-title-line1,' +
      '.wj-delisted-subs-title-line2 {' +
      'font-size: 18px;' +
      'line-height: 1.25;' +
      '}' +
      '.wj-delisted-subs-text {' +
      'max-width: 100%;' +
      'font-size: 13px;' +
      'margin-bottom: 16px;' +
      '}' +
      '.wj-delisted-subs-info-box {' +
      'max-width: 100%;' +
      'padding: 12px;' +
      'margin-bottom: 16px;' +
      '}' +
      '.wj-delisted-subs-info-title {' +
      'font-size: 13px;' +
      '}' +
      '.wj-delisted-subs-info-text {' +
      'font-size: 12px;' +
      '}' +
      '.wj-delisted-subs-actions {' +
      'max-width: 100%;' +
      'gap: 10px;' +
      '}' +
      '.wj-delisted-subs-btn-primary,' +
      '.wj-delisted-subs-btn-secondary {' +
      'padding: 12px 16px;' +
      'font-size: 12px;' +
      '}' +
      '.wj-delisted-subs-list-title {' +
      'font-size: 15px;' +
      'margin-bottom: 8px;' +
      '}' +
      '.wj-delisted-subs-products-wrap {' +
      'gap: 12px;' +
      '}' +
      '.wj-delisted-subs-product-list {' +
      'display: grid;' +
      'grid-template-columns: repeat(2, minmax(0, 1fr));' +
      'column-gap: 12px;' +
      'row-gap: 8px;' +
      '}' +
      '.wj-delisted-subs-product {' +
      'min-width: 0;' +
      '}' +
      '.wj-delisted-subs-product-info {' +
      'min-width: 0;' +
      'flex: 1;' +
      '}' +
      '.wj-delisted-subs-product-img {' +
      'width: 40px;' +
      'height: 40px;' +
      '}' +
      '.wj-delisted-subs-product-name {' +
      'font-size: 12px;' +
      'line-height: 1.3;' +
      'word-break: break-word;' +
      '}' +
      '.wj-delisted-subs-footer {' +
      'padding: 12px 14px;' +
      '}' +
      '.wj-delisted-subs-footer svg {' +
      'width: 20px;' +
      'height: 20px;' +
      'margin-top: 2px;' +
      '}' +
      '.wj-delisted-subs-footer-text {' +
      'font-size: 12px;' +
      'line-height: 1.4;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  function playModalEnterAnimation(overlay, modal) {
    requestAnimationFrame(function () {
      overlay.classList.add('wj-delisted-subs-overlay--entering');
      modal.classList.add('wj-delisted-subs-modal--entering');
    });
  }

  function closeModal() {
    const overlay = document.getElementById(OVERLAY_ID);
    const modal = document.getElementById(MODAL_ID);

    if (!overlay || !modal || isClosing) {
      return;
    }

    isClosing = true;
    overlay.classList.remove('wj-delisted-subs-overlay--entering');
    modal.classList.remove('wj-delisted-subs-modal--entering');
    overlay.classList.add('wj-delisted-subs-overlay--closing');
    modal.classList.add('wj-delisted-subs-modal--closing');

    let finished = false;

    function finishClose() {
      if (finished) {
        return;
      }
      finished = true;
      overlay.remove();
      modalOpen = false;
      isClosing = false;
      document.body.style.overflow = '';
      markModalDismissed();
    }

    modal.addEventListener('animationend', function onCloseAnimationEnd(event) {
      if (event.animationName !== 'wj-delisted-subs-modal-out') {
        return;
      }
      modal.removeEventListener('animationend', onCloseAnimationEnd);
      finishClose();
    });

    setTimeout(finishClose, 280);
  }

  async function showModal(viewLabel) {
    if (modalOpen || document.getElementById(MODAL_ID)) {
      return;
    }

    modalOpen = true;
    injectStyles();

    const greeting = getGreeting();

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wj-delisted-subs-heading');

    overlay.innerHTML =
      '<div id="' +
      MODAL_ID +
      '">' +
      '<button type="button" class="wj-delisted-subs-close" aria-label="Fechar">&times;</button>' +
      '<div class="wj-delisted-subs-body">' +
      '<div class="wj-delisted-subs-left">' +
      '<div class="wj-delisted-subs-icon" aria-hidden="true">!</div>' +
      '<h2 id="wj-delisted-subs-heading" class="wj-delisted-subs-title">' +
      greeting +
      '</h2>' +
      '<p class="wj-delisted-subs-text">Alguns cafés da sua Assinatura serão descontinuados. Confira os cafés que precisam ser substituídos. Revise sua seleção e escolha novos cafés antes do seu próximo envio.</p>' +
      '<div class="wj-delisted-subs-info-box">' +
      '<p class="wj-delisted-subs-info-title">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C8.5 2 6 4.5 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.5-2.5-6-6-6z" fill="#257A57"/><circle cx="12" cy="8" r="2" fill="#EEF5F0"/></svg>' +
      'Por que devo atualizar minha Assinatura?' +
      '</p>' +
      '<p class="wj-delisted-subs-info-text">Caso cafés descontinuados não sejam substituídos e/ou sua seleção fique abaixo de 30 cápsulas, seus próximos pedidos serão enviados automaticamente, sem os benefícios da Assinatura, como: 10% OFF em cafés, frete grátis e status Ambassador.</p>' +
      '</div>' +
      '<div class="wj-delisted-subs-actions">' +
      '<a href="' +
      STANDING_ORDERS_EDIT_URL +
      '" class="wj-delisted-subs-btn-primary" data-wj-action="atualizar">Atualizar Assinatura</a>' +
      '<a href="' +
      STANDING_ORDERS_URL +
      '" class="wj-delisted-subs-btn-secondary" data-wj-action="ver">Ver minha assinatura</a>' +
      '</div>' +
      '</div>' +
      '<div class="wj-delisted-subs-right">' +
      '<h3 class="wj-delisted-subs-list-title">Cafés descontinuados da sua assinatura:</h3>' +
      '<div class="wj-delisted-subs-products-wrap" id="wj-delisted-subs-products">' +
      cachedProductsHtml +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="wj-delisted-subs-footer">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="#257A57" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="#257A57" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<p class="wj-delisted-subs-footer-text">Evite perder seus benefícios de Assinante! Atualize sua Assinatura antes do processamento do seu próximo pedido.</p>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    markModalShownThisSession();

    const modal = document.getElementById(MODAL_ID);
    playModalEnterAnimation(overlay, modal);

    sendGAEvent('view', viewLabel || 'modal_descontinuados_exibido');

    const closeBtn = overlay.querySelector('.wj-delisted-subs-close');
    closeBtn.addEventListener('click', function () {
      sendGAEvent('click', 'fechou_modal_descontinuados');
      closeModal();
    });

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        sendGAEvent('click', 'fechou_modal_overlay');
        closeModal();
      }
    });

    const editBtn = overlay.querySelector('[data-wj-action="atualizar"]');
    const viewBtn = overlay.querySelector('[data-wj-action="ver"]');

    editBtn.addEventListener('click', function () {
      sendGAEvent('click', 'clicou_atualizar_assinatura');
    });

    viewBtn.addEventListener('click', function () {
      sendGAEvent('click', 'clicou_ver_assinatura');
    });
  }

  async function showModalForDelistedSubscription(options) {
    const redirectOnFailure = options && options.redirectOnFailure;
    const redirectOnNoMatch = options && options.redirectOnNoMatch;
    const redirectIfSuppressed = options && options.redirectIfSuppressed;

    if (modalOpen || document.getElementById(MODAL_ID)) {
      return true;
    }

    if (!canShowModal()) {
      if (redirectIfSuppressed) {
        navigateToStandingOrders();
      }
      return false;
    }

    const subscriptionSkus = await ensureSubscriptionSkus();

    if (subscriptionSkus === null) {
      if (redirectOnFailure) {
        navigateToStandingOrders();
      }
      return false;
    }

    if (subscriptionSkus.length === 0) {
      if (redirectOnNoMatch) {
        sendGAEvent('click', 'sem_assinatura_na_conta');
        navigateToStandingOrders();
      }
      return false;
    }

    const delistedInSubscription = getDelistedSkusInSubscription(subscriptionSkus);

    if (delistedInSubscription.length === 0) {
      if (redirectOnNoMatch) {
        sendGAEvent('click', 'sem_cafes_descontinuados_na_assinatura');
        navigateToStandingOrders();
      }
      return false;
    }

    await loadProductsForSkus(delistedInSubscription);
    cachedProductsHtml = buildProductsListHtml(delistedInSubscription);

    if (!cachedFirstName) {
      cachedFirstName = await getUserFirstName();
    }

    const viewLabel =
      options && options.viewLabel ? options.viewLabel : 'modal_descontinuados_exibido';
    await showModal(viewLabel);
    return true;
  }

  async function tryAutoShowModal() {
    if (autoShowCompleted || modalOpen || document.getElementById(MODAL_ID)) {
      return;
    }

    if (!canShowModal()) {
      autoShowCompleted = true;
      return;
    }

    const loggedIn = await isUserLoggedInAsync();
    if (!loggedIn) {
      return;
    }

    const subscriptionSkus = await ensureSubscriptionSkus();
    if (subscriptionSkus === null) {
      return;
    }

    autoShowCompleted = true;

    await showModalForDelistedSubscription({
      viewLabel: 'modal_descontinuados_auto_exibido',
    });
  }

  async function handleSubscriptionClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (modalOpen) {
      return;
    }

    sendGAEvent('click', 'minhas_assinaturas_btn');

    await showModalForDelistedSubscription({
      redirectOnFailure: true,
      redirectOnNoMatch: true,
      redirectIfSuppressed: true,
    });
  }

  function bindSubscriptionButton() {
    const btn = document.getElementById(BTN_ID);
    if (!btn || btn.getAttribute(LISTENER_ATTR)) {
      return false;
    }

    btn.setAttribute(LISTENER_ATTR, '1');
    btn.setAttribute('href', '#');
    btn.addEventListener('click', handleSubscriptionClick);
    return true;
  }

  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      injectStyles();
      bindSubscriptionButton();
    } finally {
      isProcessing = false;
    }
  }

  function debouncedRun() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(run, 200);
  }

  function init() {
    preloadUserData();
    ensureSubscriptionSkus();
    run();

    let autoShowAttempts = 0;
    const autoShowTimer = setInterval(function () {
      autoShowAttempts++;
      tryAutoShowModal();
      if (autoShowCompleted || autoShowAttempts > 40) {
        clearInterval(autoShowTimer);
      }
    }, 200);

    if (!window.wjDelistedSubsObserver) {
      window.wjDelistedSubsObserver = new MutationObserver(function (mutations) {
        let shouldRun = false;
        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i];
          if (mutation.type !== 'childList') {
            continue;
          }
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j];
            if (node.nodeType !== 1) {
              continue;
            }
            if (node.id === BTN_ID || (node.querySelector && node.querySelector('#' + BTN_ID))) {
              shouldRun = true;
              break;
            }
          }
          if (shouldRun) {
            break;
          }
        }
        if (shouldRun) {
          debouncedRun();
        }
      });

      window.wjDelistedSubsObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    let attempts = 0;
    const pollTimer = setInterval(function () {
      attempts++;
      if (bindSubscriptionButton() || attempts > 40) {
        clearInterval(pollTimer);
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
