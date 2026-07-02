(function () {
  'use strict';

  if (window.wjHideDelistedOrderProducts && window.wjHideDelistedOrderProducts.booted) {
    return;
  }
  window.wjHideDelistedOrderProducts = { booted: true };

  const STYLE_ID = 'wj-hide-delisted-order-products-style';
  const ROW_ATTR = 'data-wj-delisted-hidden';
  const TABLE_ATTR = 'data-wj-delisted-table-hidden';
  const TRACKING_CATEGORY = 'cafes_descontinuados_assinatura_v2';

  const DELISTED_SKUS = [
    '7886.90', // Ethiopia (Original)
    '7892.90', // Chiaro (Original)
    '7880.90', // Rio de Janeiro (Original)
    '7894.90', // Brazil Organic (Original)
    '7871.90', // Corto (Original)
    '7877.90', // Istanbul Espresso (Original)
    '7002.80', // Bianco Piccolo (Vertuo)
    '7017.80', // Ethiopia (Vertuo)
  ];

  const DELISTED_STATIC_NAMES = [
    { sku: '7886.90', names: ['Ethiopia'] },
    { sku: '7892.90', names: ['Chiaro'] },
    { sku: '7880.90', names: ['Rio de Janeiro Espresso', 'Rio de Janeiro'] },
    { sku: '7894.90', names: ['Brazil Organic'] },
    { sku: '7871.90', names: ['Corto'] },
    { sku: '7877.90', names: ['Istanbul Espresso', 'Istanbul'] },
    { sku: '7002.80', names: ['Bianco Piccolo'] },
    { sku: '7017.80', names: ['Ethiopia'] },
  ];

  const SELECTORS = {
    productsScopeRoot: '[data-testid="StandingOrdersProductsList"]',
    productsTabList: '[data-testid="TabList"][aria-label="products"]',
    groupedProductList: '[data-testid="GroupedProductList"]',
    productRow: 'tbody tr[role="row"]',
    productWithImage: '[data-testid="ProductWithImage"]',
    quantityButton: '[data-testid="ButtonQuantity"]',
    productTitle: '[class*="_ProductWithImageCellRenderer__productTitle"]',
    productImage: '[class*="_ProductWithImageCellRenderer__image"]',
    productList: '[class*="_ProductList_"]',
  };

  const OBSERVER_ATTR = 'data-wj-delisted-order-observing';
  const MOUNT_OBSERVER_ATTR = 'data-wj-delisted-order-mount-observing';

  let isProcessing = false;
  let debounceTimer = null;
  let catalogPromise = null;
  let delistedLookup = null;
  let hideTrackingSent = false;

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

  function isStandingOrdersPage() {
    return window.location.href.indexOf('/myaccount/standing-orders') !== -1;
  }

  function isProductsSelectionRoute() {
    const hash = window.location.hash || '';
    return (
      hash.indexOf('#/orders/create') !== -1 ||
      hash.indexOf('#/orders/edit') !== -1 ||
      hash.indexOf('#/orders/new') !== -1 ||
      hash.indexOf('#/orders/') !== -1
    );
  }

  function getProductsScopeRoot() {
    return document.querySelector(SELECTORS.productsScopeRoot);
  }

  function hasProductsListScope() {
    const scopeRoot = getProductsScopeRoot();
    if (!scopeRoot) {
      return false;
    }

    return !!scopeRoot.querySelector(SELECTORS.groupedProductList);
  }

  function isProductsSelectionContext() {
    if (isProductsSelectionRoute()) {
      return true;
    }

    return !!document.querySelector('[data-testid="cfh_products"]');
  }

  function hasProductRowsInScope() {
    const scopeRoot = getProductsScopeRoot();
    if (!scopeRoot) {
      return false;
    }

    const rows = scopeRoot.querySelectorAll(SELECTORS.productRow);
    let i = 0;

    while (i < rows.length) {
      if (isScopedProductRow(rows[i])) {
        return true;
      }
      i++;
    }

    return false;
  }

  function shouldProcessProducts() {
    if (!isStandingOrdersPage() || !isProductsSelectionContext()) {
      return false;
    }

    return hasProductsListScope() && hasProductRowsInScope();
  }

  function isProductMountNode(node) {
    if (!node || node.nodeType !== 1) {
      return false;
    }

    if (
      node.matches &&
      (node.matches(SELECTORS.productsScopeRoot) ||
        node.matches(SELECTORS.groupedProductList) ||
        node.matches(SELECTORS.productRow))
    ) {
      return true;
    }

    if (!node.querySelector) {
      return false;
    }

    return !!(
      node.querySelector(SELECTORS.productsScopeRoot) ||
      node.querySelector(SELECTORS.groupedProductList) ||
      node.querySelector(
        SELECTORS.groupedProductList + ' ' + SELECTORS.productRow
      )
    );
  }

  function mutationAddsProductList(mutation) {
    if (!mutation || mutation.type !== 'childList') {
      return false;
    }

    let i = 0;
    while (i < mutation.addedNodes.length) {
      if (isProductMountNode(mutation.addedNodes[i])) {
        return true;
      }
      i++;
    }

    return false;
  }

  function mutationTouchesProductList(mutation) {
    if (!mutation) {
      return false;
    }

    if (mutationAddsProductList(mutation)) {
      return true;
    }

    const scopeRoot = getProductsScopeRoot();
    if (!scopeRoot || !mutation.target) {
      return false;
    }

    if (!scopeRoot.contains(mutation.target)) {
      return false;
    }

    return (
      mutation.target.matches &&
      (mutation.target.matches(SELECTORS.productRow) ||
        mutation.target.matches(SELECTORS.groupedProductList) ||
        !!mutation.target.closest(SELECTORS.groupedProductList))
    );
  }

  function getScopedGroupedProductLists() {
    const scopeRoot = getProductsScopeRoot();
    if (!scopeRoot) {
      return [];
    }

    return Array.prototype.slice.call(
      scopeRoot.querySelectorAll(SELECTORS.groupedProductList)
    );
  }

  function isScopedProductRow(row) {
    const scopeRoot = getProductsScopeRoot();
    if (!scopeRoot || !row || !scopeRoot.contains(row)) {
      return false;
    }

    const groupedList = row.closest(SELECTORS.groupedProductList);
    if (!groupedList || !scopeRoot.contains(groupedList)) {
      return false;
    }

    if (!row.matches(SELECTORS.productRow)) {
      return false;
    }

    if (!row.querySelector(SELECTORS.productWithImage)) {
      return false;
    }

    if (!row.querySelector(SELECTORS.quantityButton)) {
      return false;
    }

    return true;
  }

  function mutationTouchesScopedList(mutation) {
    return mutationTouchesProductList(mutation);
  }

  function setupScopedObserver() {
    const scopeRoot = getProductsScopeRoot();
    if (!scopeRoot) {
      return false;
    }

    if (scopeRoot.getAttribute(OBSERVER_ATTR) === '1') {
      return true;
    }

    scopeRoot.setAttribute(OBSERVER_ATTR, '1');

    window.wjHideDelistedOrderProductsScopedObserver = new MutationObserver(
      function (mutations) {
        let shouldRun = false;
        let i = 0;

        while (i < mutations.length) {
          if (mutationTouchesScopedList(mutations[i])) {
            shouldRun = true;
            break;
          }
          i++;
        }

        if (shouldRun) {
          debouncedRun();
        }
      }
    );

    window.wjHideDelistedOrderProductsScopedObserver.observe(scopeRoot, {
      childList: true,
      subtree: true,
    });

    return true;
  }

  function setupMountObserver() {
    if (document.documentElement.getAttribute(MOUNT_OBSERVER_ATTR) === '1') {
      return;
    }

    document.documentElement.setAttribute(MOUNT_OBSERVER_ATTR, '1');

    window.wjHideDelistedOrderProductsMountObserver = new MutationObserver(
      function (mutations) {
        if (!isStandingOrdersPage()) {
          return;
        }

        let shouldRun = false;
        let i = 0;

        while (i < mutations.length) {
          if (mutationAddsProductList(mutations[i])) {
            shouldRun = true;
            break;
          }
          i++;
        }

        if (shouldRun) {
          debouncedRun();
        }
      }
    );

    window.wjHideDelistedOrderProductsMountObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
      }
    );
  }

  function normalizeText(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function addLookupName(lookup, sku, value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return;
    }
    lookup.byName[normalized] = sku;
    lookup.names.push(normalized);
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

  async function fetchProductData(sku) {
    try {
      return await window.napi.catalog().getProduct(sku);
    } catch (error) {
      return null;
    }
  }

  function addStaticFallbacks(lookup) {
    let i = 0;
    while (i < DELISTED_STATIC_NAMES.length) {
      const entry = DELISTED_STATIC_NAMES[i];
      let j = 0;
      while (j < entry.names.length) {
        addLookupName(lookup, entry.sku, entry.names[j]);
        j++;
      }
      i++;
    }
  }

  function createEmptyLookup() {
    return {
      byName: {},
      names: [],
    };
  }

  function finalizeLookup(lookup) {
    const uniqueNames = {};
    const names = [];
    let i = 0;

    while (i < lookup.names.length) {
      const name = lookup.names[i];
      if (!uniqueNames[name]) {
        uniqueNames[name] = true;
        names.push(name);
      }
      i++;
    }

    names.sort(function (a, b) {
      return b.length - a.length;
    });

    lookup.names = names;
    return lookup;
  }

  function ensureStaticLookup() {
    if (delistedLookup) {
      return delistedLookup;
    }

    const lookup = createEmptyLookup();
    addStaticFallbacks(lookup);
    delistedLookup = finalizeLookup(lookup);
    return delistedLookup;
  }

  async function enrichDelistedLookupFromCatalog() {
    ensureStaticLookup();

    if (!catalogPromise) {
      catalogPromise = (async function () {
        const apiReady = await waitForAPI(15, 400);
        if (!apiReady) {
          return delistedLookup;
        }

        let i = 0;
        while (i < DELISTED_SKUS.length) {
          const sku = DELISTED_SKUS[i];
          const product = await fetchProductData(sku);
          if (product) {
            addLookupName(delistedLookup, sku, product.name);
            addLookupName(delistedLookup, sku, product.internationalName);
          }
          i++;
        }

        delistedLookup = finalizeLookup(delistedLookup);
        return delistedLookup;
      })();
    }

    return catalogPromise;
  }

  async function buildDelistedLookup() {
    ensureStaticLookup();
    await enrichDelistedLookupFromCatalog();
    return delistedLookup;
  }

  function getRowTitle(row) {
    const titleEl = row.querySelector(SELECTORS.productTitle);
    if (titleEl) {
      return normalizeText(titleEl.textContent);
    }

    const imageEl = row.querySelector(SELECTORS.productImage);
    if (imageEl && imageEl.alt) {
      const alt = imageEl.alt;
      const separatorIndex = alt.lastIndexOf(') ');
      if (separatorIndex !== -1) {
        return normalizeText(alt.slice(separatorIndex + 2));
      }
      return normalizeText(alt);
    }

    return '';
  }

  function isKitTitle(title) {
    return title.indexOf('kit ') === 0 || title.indexOf('kit ') !== -1;
  }

  function isKitRow(row) {
    const title = getRowTitle(row);
    if (isKitTitle(title)) {
      return true;
    }

    const table = row.closest('table[role="table"]');
    if (!table) {
      return false;
    }

    const headerCell = table.querySelector('thead th[role="columnheader"]');
    if (!headerCell) {
      return false;
    }

    return (
      normalizeText(headerCell.textContent).indexOf('kits para assinatura') !==
      -1
    );
  }

  function matchDelistedSku(title, lookup) {
    if (!title || !lookup.names.length || isKitTitle(title)) {
      return '';
    }

    if (lookup.byName[title]) {
      return lookup.byName[title];
    }

    let j = 0;
    while (j < lookup.names.length) {
      const candidate = lookup.names[j];
      if (title === candidate) {
        return lookup.byName[candidate];
      }
      j++;
    }

    return '';
  }

  function hideRow(row, sku) {
    if (!isScopedProductRow(row) || row.getAttribute(ROW_ATTR) === '1') {
      return;
    }

    row.setAttribute(ROW_ATTR, '1');
    row.setAttribute('data-wj-delisted-sku', sku);
    row.style.setProperty('display', 'none', 'important');
  }

  function hideEmptyTables(root) {
    const tables = root.querySelectorAll('table[role="table"]');
    let i = 0;

    while (i < tables.length) {
      const table = tables[i];
      const bodyRows = table.querySelectorAll('tbody tr[role="row"]');
      let visibleCount = 0;
      let j = 0;

      while (j < bodyRows.length) {
        if (bodyRows[j].getAttribute(ROW_ATTR) !== '1') {
          visibleCount++;
        }
        j++;
      }

      const productList = table.closest(SELECTORS.productList);
      if (visibleCount === 0 && bodyRows.length > 0 && productList) {
        productList.setAttribute(TABLE_ATTR, '1');
        productList.style.setProperty('display', 'none', 'important');
      } else if (productList && visibleCount > 0) {
        productList.removeAttribute(TABLE_ATTR);
        productList.style.removeProperty('display');
      }

      i++;
    }
  }

  async function hideDelistedProducts() {
    const lookup = ensureStaticLookup();
    enrichDelistedLookupFromCatalog();

    const listRoots = getScopedGroupedProductLists();
    if (!listRoots.length) {
      return 0;
    }

    let hiddenCount = 0;
    let listIndex = 0;

    while (listIndex < listRoots.length) {
      const listRoot = listRoots[listIndex];
      const rows = listRoot.querySelectorAll(SELECTORS.productRow);
      let i = 0;

      while (i < rows.length) {
        const row = rows[i];

        if (!isScopedProductRow(row)) {
          i++;
          continue;
        }

        if (isKitRow(row)) {
          i++;
          continue;
        }

        const title = getRowTitle(row);
        const sku = matchDelistedSku(title, lookup);

        if (sku) {
          hideRow(row, sku);
          hiddenCount++;
        }

        i++;
      }

      hideEmptyTables(listRoot);
      listIndex++;
    }

    return hiddenCount;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const scope = SELECTORS.productsScopeRoot;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      scope +
      ' tr[' +
      ROW_ATTR +
      '="1"] { display: none !important; }' +
      scope +
      ' [class*="_ProductList_"][' +
      TABLE_ATTR +
      '="1"] { display: none !important; }';
    document.head.appendChild(style);
  }

  function onRouteChange() {
    const scopeRoot = getProductsScopeRoot();
    if (scopeRoot) {
      scopeRoot.removeAttribute(OBSERVER_ATTR);
    }
    debouncedRun();
  }

  function setupRouteObserver() {
    if (window.wjHideDelistedOrderProductsRouteBound) {
      return;
    }

    window.wjHideDelistedOrderProductsRouteBound = true;
    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
  }

  async function run() {
    if (!isStandingOrdersPage() || !isProductsSelectionContext() || isProcessing) {
      return;
    }

    injectStyles();
    setupMountObserver();
    setupScopedObserver();

    if (!shouldProcessProducts()) {
      return;
    }

    isProcessing = true;
    try {
      const hiddenCount = await hideDelistedProducts();
      if (hiddenCount > 0 && !hideTrackingSent) {
        hideTrackingSent = true;
        sendGAEvent('view', 'cafes_descontinuados_ocultos_pedido');
      }
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

  function boot() {
    ensureStaticLookup();
    injectStyles();
    setupMountObserver();
    setupRouteObserver();
    run();

    if (window.wjHideDelistedOrderProductsPollTimer) {
      return;
    }

    window.wjHideDelistedOrderProductsPollTimer = setInterval(function () {
      if (isStandingOrdersPage()) {
        run();
      }
    }, 400);

    buildDelistedLookup().then(function () {
      debouncedRun();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
