(function () {
  'use strict';

  var MC_CONFIG = {
    EXP_ID: 'MC_MINICART_V2',
    STYLE_ID: 'MC_STYLE',
    ROOT_ID: 'MC_CART_ROOT',
    OBSERVER_ID: '__MC_CART_OBSERVER__',
    STORAGE_KEY: 'MC_CART_DATA',
    RETRY_MS: 400,
    MAX_RETRIES: 25,
    FETCH_DEBOUNCE_MS: 50,
    CURRENCY: 'BRL',
    API_URL: '/customer/section/load/?sections=cart&force_new_section_timestamp=true',
    FREE_SHIPPING_THRESHOLD: 120,
    LABELS: {
      title: 'Seu carrinho',
      freeShippingText: 'Faltam {value} para Frete Grátis',
      freeShippingComplete: 'Parabéns! Você tem Frete Grátis!',
      subtotal: 'Subtotal',
      checkout: 'Finalizar compra',
      continueShopping: 'Continuar comprando',
      emptyCart: 'Seu carrinho está vazio',
      crossSellTitle: 'Aproveite e leve também',
      addToCart: 'Comprar',
    },
    SELECTORS: {
      trigger: '.minicart-link',
      triggerAlternatives: [
        '.minicart-link',
        '.minicart-link .action.showcart',
        '[data-block="minicart"]',
        '.minicart-wrapper',
      ],
    },
  };

  var MC_state = {
    mounted: false,
    routeKey: '',
    observer: null,
    retries: 0,
    handlersBound: false,
    cartData: null,
    isFetching: false,
    fetchDebounceTimer: null,
    lastFetchTime: 0,
    pendingRecurringAdd: false,
    recurringItems: {},
  };

  var MC_utils = {
    q: function (sel, root) {
      try { return (root || document).querySelector(sel); } catch (e) { return null; }
    },
    qa: function (sel, root) {
      try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; }
    },
    text: function (el) {
      return el && typeof el.textContent === 'string' ? el.textContent.trim() : '';
    },
    formatBRL: function (n) {
      try {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: MC_CONFIG.CURRENCY }).format(n || 0);
      } catch (e) {
        return 'R$ ' + (n || 0).toFixed(2).replace('.', ',');
      }
    },
    routeKey: function () {
      return location.pathname + '|' + location.search;
    },
    saveToStorage: function (data) {
      try {
        localStorage.setItem(MC_CONFIG.STORAGE_KEY, JSON.stringify({ data: data, timestamp: Date.now() }));
      } catch (e) {}
    },
    loadFromStorage: function () {
      try {
        var stored = localStorage.getItem(MC_CONFIG.STORAGE_KEY);
        if (!stored) return null;
        var payload = JSON.parse(stored);
        if (Date.now() - payload.timestamp > 30 * 60 * 1000) {
          localStorage.removeItem(MC_CONFIG.STORAGE_KEY);
          return null;
        }
        return payload.data;
      } catch (e) { return null; }
    },
    clearStorage: function () {
      try { localStorage.removeItem(MC_CONFIG.STORAGE_KEY); } catch (e) {}
    },
    loadRecurringItems: function () {
      try {
        var stored = localStorage.getItem(MC_CONFIG.STORAGE_KEY + '_recurring');
        return stored ? JSON.parse(stored) : {};
      } catch (e) { return {}; }
    },
    saveRecurringItems: function (items) {
      try { localStorage.setItem(MC_CONFIG.STORAGE_KEY + '_recurring', JSON.stringify(items)); } catch (e) {}
    },
  };

  // ── CSS ──────────────────────────────────────────────────────────────────────
  function MC_injectStyles() {
    if (document.getElementById(MC_CONFIG.STYLE_ID)) return;

    var P = '#' + MC_CONFIG.ROOT_ID;
    var css = [
      '.block-minicart{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      '.block.block-minicart{display:none!important;visibility:hidden!important}',
      '.ui-dialog-content.block-minicart{display:none!important}',
      '[data-role="dropdownDialog"]{display:none!important}',
      '.minicart-wrapper .block-minicart{display:none!important}',

      P + '{position:fixed;inset:0;z-index:99999;display:none;font-family:"Lato",Arial,sans-serif}',
      P + '.mc-open{display:block}',
      P + ' *{box-sizing:border-box;font-family:"Lato",Arial,sans-serif}',

      // overlay
      P + ' .mc-overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);border:0;cursor:default}',

      // panel
      P + ' .mc-panel{position:absolute;top:0;right:0;width:472px;max-width:100vw;height:100%;background:#fff;display:flex;flex-direction:column;box-shadow:0 0 16px rgba(0,0,0,.55);border-radius:20px 0 0 20px;overflow:hidden}',

      // header
      P + ' .mc-header{background:#F5F7F9;padding:40px 40px 32px;border-radius:20px 0 0 0;flex-shrink:0;position:relative}',
      P + ' .mc-header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}',
      P + ' .mc-title{font-weight:700;font-size:20px;line-height:24px;color:#173C56;margin:0}',
      P + ' .mc-close{border:0;background:transparent;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;position:absolute;top:24px;right:24px}',
      P + ' .mc-close svg{width:14px;height:14px;fill:#173C56}',

      // progress bar
      P + ' .mc-progress-track{width:100%;height:12px;background:#E9EBF8;border-radius:88px;overflow:hidden;margin-bottom:16px}',
      P + ' .mc-progress-fill{height:100%;background:#004E99;border-radius:88px;transition:width .4s ease}',
      P + ' .mc-free-text{font-weight:400;font-size:16px;line-height:19px;color:#173C56;margin:0}',

      // cart items area
      P + ' .mc-items{flex:1;overflow-y:auto;padding:0 40px}',

      // single item row
      P + ' .mc-item{display:flex;gap:16px;padding:24px 0;border-bottom:1px solid rgba(148,165,177,.5)}',
      P + ' .mc-item:last-child{border-bottom:none}',

      // product image
      P + ' .mc-item-img{width:97px;height:97px;border-radius:8px;border:1px solid #E9EBF8;object-fit:contain;background:#fff;flex-shrink:0}',

      // item details
      P + ' .mc-item-details{display:flex;flex-direction:column;gap:16px;flex:1;min-width:0}',

      // name + trash row
      P + ' .mc-item-top{display:flex;gap:32px;align-items:flex-start}',
      P + ' .mc-item-info{display:flex;flex-direction:column;gap:12px;flex:1;min-width:0}',
      P + ' .mc-item-name{font-weight:400;font-size:16px;line-height:18px;color:#173C56;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      P + ' .mc-item-name a{color:inherit;text-decoration:none}',
      P + ' .mc-item-price{font-weight:700;font-size:18px;line-height:18px;color:#173C56;margin:0}',

      // trash button
      P + ' .mc-item-trash{flex-shrink:0;width:24px;height:24px;border:0;background:transparent;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}',
      P + ' .mc-item-trash svg{width:14px;height:18px;fill:#173C56}',

      // quantity controls
      P + ' .mc-qty-row{display:flex;align-items:center;gap:10px}',
      P + ' .mc-qty-btn{width:24px;height:24px;border-radius:50%;background:#E9EBF8;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
      P + ' .mc-qty-btn svg{width:13px;height:13px;fill:#173C56}',
      P + ' .mc-qty-input-wrap{width:96px;height:32px;background:#fff;border:1px solid #173C56;border-radius:8px;display:flex;align-items:center;justify-content:center}',
      P + ' .mc-qty-input{width:100%;height:100%;border:0;background:transparent;text-align:center;font-family:"Lato",Arial,sans-serif;font-weight:400;font-size:16px;line-height:20px;color:#173C56;outline:none;-moz-appearance:textfield}',
      P + ' .mc-qty-input::-webkit-outer-spin-button,' + P + ' .mc-qty-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',

      // recurring dropdown
      P + ' .mc-recurring-select{width:100%;height:30px;background:#F5F7F9;border:1px solid #004E99;border-radius:8px;padding:0 32px 0 16px;font-family:"Lato",Arial,sans-serif;font-weight:400;font-size:13px;line-height:16px;color:#004E99;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg width=\'8\' height=\'5\' viewBox=\'0 0 8 5\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L4 4L7 1\' stroke=\'%23004E99\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}',

      // cross-sell section
      P + ' .mc-crosssell{background:#F5F7F9;padding:22px 40px 24px;flex-shrink:0}',
      P + ' .mc-crosssell-title{font-weight:400;font-size:16px;line-height:18px;color:#173C56;margin:0 0 16px}',
      P + ' .mc-crosssell-list{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}',
      P + ' .mc-crosssell-list::-webkit-scrollbar{height:4px}',
      P + ' .mc-crosssell-list::-webkit-scrollbar-thumb{background:#94A5B1;border-radius:4px}',

      // cross-sell card
      P + ' .mc-cs-card{width:140px;min-width:140px;background:#fff;border:1px solid #E9EBF8;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:0;flex-shrink:0}',
      P + ' .mc-cs-img-wrap{width:111px;height:97px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center}',
      P + ' .mc-cs-img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}',
      P + ' .mc-cs-name{font-weight:400;font-size:11px;line-height:13px;color:#173C56;margin:0 0 8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:26px}',
      P + ' .mc-cs-prices{display:flex;align-items:center;gap:8px;margin-bottom:12px;min-height:16px}',
      P + ' .mc-cs-old-price{font-weight:400;font-size:10px;line-height:12px;color:#173C56;text-decoration:line-through}',
      P + ' .mc-cs-price{font-weight:700;font-size:13px;line-height:16px;color:#173C56}',
      P + ' .mc-cs-cta{width:116px;height:32px;background:#173C56;border-radius:100px;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin:0 auto;padding:0}',
      P + ' .mc-cs-cta svg{width:14px;height:14px;fill:#fff}',
      P + ' .mc-cs-cta span{font-weight:700;font-size:13px;line-height:20px;color:#fff}',

      // footer
      P + ' .mc-footer{background:#fff;box-shadow:0 -4px 22.9px rgba(0,0,0,.15);border-radius:0 0 0 20px;padding:24px 40px 24px;flex-shrink:0}',
      P + ' .mc-subtotal-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
      P + ' .mc-subtotal-label{font-weight:400;font-size:24px;line-height:29px;color:#173C56}',
      P + ' .mc-subtotal-value{font-weight:700;font-size:24px;line-height:29px;color:#173C56}',
      P + ' .mc-btn-checkout{display:flex;align-items:center;justify-content:center;width:100%;height:48px;background:#173C56;border-radius:100px;border:0;cursor:pointer;text-decoration:none;margin-bottom:16px}',
      P + ' .mc-btn-checkout span{font-weight:700;font-size:18px;line-height:20px;color:#fff}',
      P + ' .mc-btn-continue{display:flex;align-items:center;justify-content:center;width:100%;background:transparent;border:0;cursor:pointer;padding:0}',
      P + ' .mc-btn-continue span{font-weight:700;font-size:18px;line-height:20px;color:#173C56}',

      // empty & loading
      P + ' .mc-empty{padding:48px 16px;text-align:center;color:#94A5B1;font-size:16px}',
      P + ' .mc-loading{padding:48px 16px;text-align:center;color:#94A5B1;font-size:14px}',

      // recurring alert
      P + ' .mc-recurring-alert{font-size:13px;color:#92400e;background:#fef3c7;padding:10px 12px;border-radius:6px;margin-top:4px;line-height:1.5;border-left:3px solid #f59e0b;width:100%}',
    ].join('\n');

    var style = document.createElement('style');
    style.id = MC_CONFIG.STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  // ── SVG helpers ──────────────────────────────────────────────────────────────
  function MC_svgClose() {
    return '<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M1 1l12 12" stroke="#173C56" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  }

  function MC_svgTrash() {
    return '<svg viewBox="0 0 14 18" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 4h12M5 4V2.5A1.5 1.5 0 016.5 1h1A1.5 1.5 0 019 2.5V4m1.5 0v11a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 15V4h7z" stroke="#173C56" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '</svg>';
  }

  function MC_svgMinus() {
    return '<svg viewBox="0 0 13 2" xmlns="http://www.w3.org/2000/svg"><rect width="13" height="1.5" rx=".75" fill="#173C56"/></svg>';
  }

  function MC_svgPlus() {
    return '<svg viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg"><rect x="5.75" width="1.5" height="13" rx=".75" fill="#173C56"/><rect y="5.75" width="13" height="1.5" rx=".75" fill="#173C56"/></svg>';
  }

  function MC_svgCart() {
    return '<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 1h2l1.68 8.39a1 1 0 001 .81h5.72a1 1 0 00.98-.78L13.5 4H3.5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '<circle cx="5.5" cy="12.5" r="1" fill="#fff"/><circle cx="11" cy="12.5" r="1" fill="#fff"/>' +
      '</svg>';
  }

  // ── API / Data ───────────────────────────────────────────────────────────────
  function MC_fetchCartData(callback) {
    if (MC_state.isFetching) return;

    if (MC_state.fetchDebounceTimer) clearTimeout(MC_state.fetchDebounceTimer);

    MC_state.fetchDebounceTimer = setTimeout(function () {
      MC_state.isFetching = true;
      var url = MC_CONFIG.API_URL + '&_=' + Date.now();

      fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      })
        .then(function (r) {
          if (!r.ok) throw new Error('status ' + r.status);
          return r.json();
        })
        .then(function (data) {
          MC_state.isFetching = false;
          MC_state.lastFetchTime = Date.now();
          if (data && data.cart) {
            var parsed = MC_parseApiResponse(data.cart);
            MC_state.cartData = parsed;
            MC_utils.saveToStorage(parsed);
            if (typeof callback === 'function') callback(parsed);
          } else if (typeof callback === 'function') {
            callback(null);
          }
        })
        .catch(function () {
          MC_state.isFetching = false;
          var stored = MC_utils.loadFromStorage();
          if (stored) MC_state.cartData = stored;
          if (typeof callback === 'function') callback(stored || null);
        });
    }, MC_CONFIG.FETCH_DEBOUNCE_MS);
  }

  function MC_parseApiResponse(cart) {
    var items = [];
    var subtotal = 0;

    if (cart.items && cart.items.length > 0) {
      for (var i = 0; i < cart.items.length; i++) {
        var a = cart.items[i];
        var item = {
          id: a.item_id || a.product_id || 'item_' + i,
          productId: a.product_id || '',
          sku: a.product_sku || '',
          name: a.product_name || 'Produto',
          price: parseFloat(a.product_price_value) || 0,
          qty: parseInt(a.qty, 10) || 1,
          image: '',
          productUrl: a.product_url || '',
          configureUrl: a.configure_url || '',
        };
        if (a.product_image && a.product_image.src) item.image = a.product_image.src;
        items.push(item);
      }
    }

    var recurring = MC_utils.loadRecurringItems();
    for (var k = 0; k < items.length; k++) {
      if (recurring[items[k].id] || recurring[items[k].sku]) items[k].isRecurring = true;
    }

    if (cart.subtotalAmount) {
      subtotal = parseFloat(cart.subtotalAmount) || 0;
    } else {
      for (var j = 0; j < items.length; j++) subtotal += items[j].price * items[j].qty;
    }

    return {
      items: items,
      subtotal: subtotal,
      summaryCount: parseInt(cart.summary_count, 10) || items.length,
      missingForFreeShipping: Math.max(0, MC_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal),
      crossSellProducts: cart.crossSellProducts || [],
    };
  }

  function MC_getCartData(forceRefresh, callback) {
    if (forceRefresh) { MC_fetchCartData(callback); return; }
    if (MC_state.cartData) { if (typeof callback === 'function') callback(MC_state.cartData); return; }
    var stored = MC_utils.loadFromStorage();
    if (stored) {
      MC_state.cartData = stored;
      if (typeof callback === 'function') callback(stored);
      MC_fetchCartData(function (fresh) { if (fresh) MC_render(); });
      return;
    }
    MC_fetchCartData(callback);
  }

  // ── DOM Builder ──────────────────────────────────────────────────────────────
  function MC_buildDOM() {
    if (document.getElementById(MC_CONFIG.ROOT_ID)) return document.getElementById(MC_CONFIG.ROOT_ID);

    var root = document.createElement('div');
    root.id = MC_CONFIG.ROOT_ID;

    // overlay
    var overlay = document.createElement('button');
    overlay.className = 'mc-overlay';
    overlay.type = 'button';
    overlay.setAttribute('aria-label', 'Fechar carrinho');

    // panel
    var panel = document.createElement('aside');
    panel.className = 'mc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    // header
    var header = document.createElement('div');
    header.className = 'mc-header';

    var headerTop = document.createElement('div');
    headerTop.className = 'mc-header-top';

    var title = document.createElement('h3');
    title.className = 'mc-title';
    title.setAttribute('data-mc-title', '1');

    var closeBtn = document.createElement('button');
    closeBtn.className = 'mc-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = MC_svgClose();

    headerTop.appendChild(title);
    header.appendChild(headerTop);
    header.appendChild(closeBtn);

    var progressTrack = document.createElement('div');
    progressTrack.className = 'mc-progress-track';
    var progressFill = document.createElement('div');
    progressFill.className = 'mc-progress-fill';
    progressFill.setAttribute('data-mc-bar', '1');
    progressTrack.appendChild(progressFill);

    var freeText = document.createElement('p');
    freeText.className = 'mc-free-text';
    freeText.setAttribute('data-mc-free', '1');

    header.appendChild(progressTrack);
    header.appendChild(freeText);

    // items area
    var itemsArea = document.createElement('div');
    itemsArea.className = 'mc-items';
    itemsArea.setAttribute('data-mc-list', '1');

    // cross-sell section
    var crossSell = document.createElement('div');
    crossSell.className = 'mc-crosssell';
    crossSell.setAttribute('data-mc-crosssell', '1');
    crossSell.style.display = 'none';

    var csTitle = document.createElement('p');
    csTitle.className = 'mc-crosssell-title';
    csTitle.textContent = MC_CONFIG.LABELS.crossSellTitle;

    var csList = document.createElement('div');
    csList.className = 'mc-crosssell-list';
    csList.setAttribute('data-mc-cs-list', '1');

    crossSell.appendChild(csTitle);
    crossSell.appendChild(csList);

    // footer
    var footer = document.createElement('div');
    footer.className = 'mc-footer';
    footer.setAttribute('data-mc-footer', '1');

    var subRow = document.createElement('div');
    subRow.className = 'mc-subtotal-row';

    var subLabel = document.createElement('span');
    subLabel.className = 'mc-subtotal-label';
    subLabel.textContent = MC_CONFIG.LABELS.subtotal;

    var subValue = document.createElement('span');
    subValue.className = 'mc-subtotal-value';
    subValue.setAttribute('data-mc-subtotal', '1');
    subValue.textContent = 'R$ 0,00';

    subRow.appendChild(subLabel);
    subRow.appendChild(subValue);

    var checkoutBtn = document.createElement('a');
    checkoutBtn.className = 'mc-btn-checkout';
    checkoutBtn.href = '/checkout';
    checkoutBtn.innerHTML = '<span>' + MC_CONFIG.LABELS.checkout + '</span>';

    var continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'mc-btn-continue mc-close-trigger';
    continueBtn.innerHTML = '<span>' + MC_CONFIG.LABELS.continueShopping + '</span>';

    footer.appendChild(subRow);
    footer.appendChild(checkoutBtn);
    footer.appendChild(continueBtn);

    // assemble panel
    panel.appendChild(header);
    panel.appendChild(itemsArea);
    panel.appendChild(crossSell);
    panel.appendChild(footer);

    root.appendChild(overlay);
    root.appendChild(panel);
    document.body.appendChild(root);

    return root;
  }

  // ── Build a single item row ──────────────────────────────────────────────────
  function MC_buildItemRow(item) {
    var row = document.createElement('div');
    row.className = 'mc-item';
    row.setAttribute('data-id', item.id);
    row.setAttribute('data-sku', item.sku || '');

    // image
    var img = document.createElement('img');
    img.className = 'mc-item-img';
    img.src = item.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    img.alt = item.name;
    img.loading = 'lazy';

    if (item.productUrl) {
      var imgLink = document.createElement('a');
      imgLink.href = item.productUrl;
      imgLink.appendChild(img);
      row.appendChild(imgLink);
    } else {
      row.appendChild(img);
    }

    // details column
    var details = document.createElement('div');
    details.className = 'mc-item-details';

    // top: name/price + trash
    var top = document.createElement('div');
    top.className = 'mc-item-top';

    var info = document.createElement('div');
    info.className = 'mc-item-info';

    var name = document.createElement('p');
    name.className = 'mc-item-name';
    if (item.productUrl) {
      var nameLink = document.createElement('a');
      nameLink.href = item.productUrl;
      nameLink.textContent = item.name;
      name.appendChild(nameLink);
    } else {
      name.textContent = item.name;
    }

    var price = document.createElement('p');
    price.className = 'mc-item-price';
    price.textContent = MC_utils.formatBRL(item.price);

    info.appendChild(name);
    info.appendChild(price);

    var trash = document.createElement('button');
    trash.type = 'button';
    trash.className = 'mc-item-trash';
    trash.setAttribute('aria-label', 'Remover');
    trash.setAttribute('data-action', 'remove');
    trash.setAttribute('data-item-id', item.id);
    trash.innerHTML = MC_svgTrash();

    top.appendChild(info);
    top.appendChild(trash);
    details.appendChild(top);

    // qty controls
    var qtyRow = document.createElement('div');
    qtyRow.className = 'mc-qty-row';

    var minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'mc-qty-btn';
    minusBtn.setAttribute('data-action', 'decrease');
    minusBtn.setAttribute('data-item-id', item.id);
    minusBtn.innerHTML = MC_svgMinus();

    var inputWrap = document.createElement('div');
    inputWrap.className = 'mc-qty-input-wrap';
    var qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'mc-qty-input';
    qtyInput.min = '1';
    qtyInput.value = String(item.qty);
    qtyInput.setAttribute('data-item-id', item.id);
    qtyInput.setAttribute('data-action', 'qty-input');
    inputWrap.appendChild(qtyInput);

    var plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'mc-qty-btn';
    plusBtn.setAttribute('data-action', 'increase');
    plusBtn.setAttribute('data-item-id', item.id);
    plusBtn.innerHTML = MC_svgPlus();

    qtyRow.appendChild(minusBtn);
    qtyRow.appendChild(inputWrap);
    qtyRow.appendChild(plusBtn);
    details.appendChild(qtyRow);

    // recurring alert
    if (item.isRecurring) {
      var alert = document.createElement('div');
      alert.className = 'mc-recurring-alert';
      alert.textContent = 'O envio de ' + item.qty + ' unidade(s) será realizada mensalmente.';
      details.appendChild(alert);
    }

    row.appendChild(details);
    return row;
  }

  // ── Build a cross-sell card ──────────────────────────────────────────────────
  function MC_buildCrossSellCard(product) {
    var card = document.createElement('div');
    card.className = 'mc-cs-card';

    var imgWrap = document.createElement('div');
    imgWrap.className = 'mc-cs-img-wrap';
    var img = document.createElement('img');
    img.className = 'mc-cs-img';
    img.src = product.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    img.alt = product.name || '';
    img.loading = 'lazy';
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var name = document.createElement('p');
    name.className = 'mc-cs-name';
    name.textContent = product.name || '';
    card.appendChild(name);

    var prices = document.createElement('div');
    prices.className = 'mc-cs-prices';

    if (product.oldPrice && product.oldPrice > product.price) {
      var oldP = document.createElement('span');
      oldP.className = 'mc-cs-old-price';
      oldP.textContent = MC_utils.formatBRL(product.oldPrice);
      prices.appendChild(oldP);
    }

    var priceEl = document.createElement('span');
    priceEl.className = 'mc-cs-price';
    priceEl.textContent = MC_utils.formatBRL(product.price);
    prices.appendChild(priceEl);
    card.appendChild(prices);

    var cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'mc-cs-cta';
    cta.setAttribute('data-action', 'add-crosssell');
    cta.setAttribute('data-product-id', product.id || '');
    cta.innerHTML = MC_svgCart() + '<span>' + MC_CONFIG.LABELS.addToCart + '</span>';
    card.appendChild(cta);

    return card;
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function MC_render(data) {
    var root = MC_buildDOM();
    var list = MC_utils.q('[data-mc-list]', root);
    var subtotalEl = MC_utils.q('[data-mc-subtotal]', root);
    var freeText = MC_utils.q('[data-mc-free]', root);
    var barFill = MC_utils.q('[data-mc-bar]', root);
    var footer = MC_utils.q('[data-mc-footer]', root);
    var titleEl = MC_utils.q('[data-mc-title]', root);
    var crossSellWrap = MC_utils.q('[data-mc-crosssell]', root);

    if (!data) data = MC_state.cartData;

    list.textContent = '';

    if (!data) {
      var loading = document.createElement('div');
      loading.className = 'mc-loading';
      loading.textContent = 'Carregando carrinho...';
      list.appendChild(loading);
      return;
    }

    // title with item count
    var count = data.summaryCount || data.items.length;
    titleEl.textContent = MC_CONFIG.LABELS.title + ' (' + count + ')';

    if (!data.items || data.items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'mc-empty';
      empty.textContent = MC_CONFIG.LABELS.emptyCart;
      list.appendChild(empty);
      subtotalEl.textContent = MC_utils.formatBRL(0);
      freeText.textContent = MC_CONFIG.LABELS.freeShippingText.replace('{value}', MC_utils.formatBRL(MC_CONFIG.FREE_SHIPPING_THRESHOLD));
      barFill.style.width = '0%';
      if (footer) footer.style.display = 'none';
      if (crossSellWrap) crossSellWrap.style.display = 'none';
      return;
    }

    if (footer) footer.style.removeProperty('display');

    // render items
    for (var i = 0; i < data.items.length; i++) {
      list.appendChild(MC_buildItemRow(data.items[i]));
    }

    // subtotal
    subtotalEl.textContent = MC_utils.formatBRL(data.subtotal);

    // free shipping bar
    var missing = data.missingForFreeShipping;
    if (missing <= 0) {
      freeText.textContent = MC_CONFIG.LABELS.freeShippingComplete;
      barFill.style.width = '100%';
    } else {
      freeText.textContent = MC_CONFIG.LABELS.freeShippingText.replace('{value}', MC_utils.formatBRL(missing));
      var pct = Math.max(8, Math.min(95, (data.subtotal / MC_CONFIG.FREE_SHIPPING_THRESHOLD) * 100));
      barFill.style.width = pct + '%';
    }

    // cross-sell
    if (data.crossSellProducts && data.crossSellProducts.length > 0) {
      var csList = MC_utils.q('[data-mc-cs-list]', root);
      csList.textContent = '';
      for (var c = 0; c < data.crossSellProducts.length; c++) {
        csList.appendChild(MC_buildCrossSellCard(data.crossSellProducts[c]));
      }
      if (crossSellWrap) crossSellWrap.style.display = '';
    } else {
      if (crossSellWrap) crossSellWrap.style.display = 'none';
    }
  }

  // ── Open / Close ─────────────────────────────────────────────────────────────
  function MC_open(origin) {
    var root = MC_buildDOM();
    if (!root) return;
    root.classList.add('mc-open');
    document.body.style.overflow = 'hidden';

    if (MC_state.cartData) {
      MC_render(MC_state.cartData);
    } else {
      MC_render(null);
    }

    MC_getCartData(true, function (data) {
      if (data) MC_render(data);
    });
  }

  function MC_close() {
    var root = document.getElementById(MC_CONFIG.ROOT_ID);
    if (root) root.classList.remove('mc-open');
    document.body.style.overflow = '';
  }

  // ── Quantity / Remove ────────────────────────────────────────────────────────
  function MC_getFormKey() {
    var el = document.querySelector('input[name="form_key"]');
    if (el && el.value) return el.value;
    var meta = document.querySelector('meta[name="form_key"]');
    if (meta && meta.getAttribute('content')) return meta.getAttribute('content');
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf('form_key=') === 0) return c.substring(9);
    }
    if (window.FORM_KEY) return window.FORM_KEY;
    return '';
  }

  function MC_syncQtyWithServer(itemId, newQty) {
    var formKey = MC_getFormKey();
    var body = new FormData();
    body.append('item_id', itemId);
    body.append('item_qty', newQty);
    if (formKey) body.append('form_key', formKey);

    fetch('/checkout/sidebar/updateItemQty/', {
      method: 'POST', credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: body,
    }).catch(function () {
      var fd = new FormData();
      fd.append('item_id', itemId);
      fd.append('item_qty', newQty);
      fetch('/checkout/cart/updateItemQty/', {
        method: 'POST', credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: fd,
      }).catch(function () {});
    });
  }

  function MC_recalcSubtotal() {
    var s = 0;
    for (var j = 0; j < MC_state.cartData.items.length; j++) {
      s += MC_state.cartData.items[j].price * MC_state.cartData.items[j].qty;
    }
    MC_state.cartData.subtotal = s;
    MC_state.cartData.missingForFreeShipping = Math.max(0, MC_CONFIG.FREE_SHIPPING_THRESHOLD - s);
  }

  function MC_updateQuantity(itemId, delta) {
    if (!MC_state.cartData || !MC_state.cartData.items) return;
    var item = null, idx = -1;
    for (var i = 0; i < MC_state.cartData.items.length; i++) {
      if (String(MC_state.cartData.items[i].id) === String(itemId)) { item = MC_state.cartData.items[i]; idx = i; break; }
    }
    if (!item) return;
    var newQty = item.qty + delta;
    if (newQty <= 0) { MC_removeItem(itemId); return; }

    MC_state.cartData.items[idx].qty = newQty;
    MC_recalcSubtotal();
    MC_utils.saveToStorage(MC_state.cartData);
    MC_render(MC_state.cartData);
    MC_syncQtyWithServer(itemId, newQty);
  }

  function MC_setQuantity(itemId, newQty) {
    if (!MC_state.cartData || !MC_state.cartData.items) return;
    var item = null, idx = -1;
    for (var i = 0; i < MC_state.cartData.items.length; i++) {
      if (String(MC_state.cartData.items[i].id) === String(itemId)) { item = MC_state.cartData.items[i]; idx = i; break; }
    }
    if (!item) return;
    if (newQty <= 0) { MC_removeItem(itemId); return; }
    if (newQty === item.qty) return;

    MC_state.cartData.items[idx].qty = newQty;
    MC_recalcSubtotal();
    MC_utils.saveToStorage(MC_state.cartData);
    MC_render(MC_state.cartData);
    MC_syncQtyWithServer(itemId, newQty);
  }

  function MC_removeItem(itemId) {
    var itemRow = document.querySelector('[data-id="' + itemId + '"]');
    if (itemRow) {
      itemRow.style.opacity = '0.5';
      itemRow.style.pointerEvents = 'none';
    }

    var formKey = MC_getFormKey();
    fetch('/checkout/sidebar/removeItem/', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body: 'item_id=' + encodeURIComponent(itemId) + (formKey ? '&form_key=' + encodeURIComponent(formKey) : ''),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data.success || !data.error_message) {
          MC_state.cartData = null;
          MC_fetchCartData(function (d) { MC_render(d); });
        } else {
          MC_removeItemFallback(itemId, formKey, itemRow);
        }
      })
      .catch(function () {
        MC_removeItemFallback(itemId, formKey, itemRow);
      });
  }

  function MC_removeItemFallback(itemId, formKey, itemRow) {
    fetch('/checkout/cart/delete/', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body: 'id=' + encodeURIComponent(itemId) + (formKey ? '&form_key=' + encodeURIComponent(formKey) : ''),
    })
      .then(function () {
        MC_state.cartData = null;
        MC_fetchCartData(function (d) { MC_render(d); });
      })
      .catch(function () {
        MC_removeItemFromLocalCache(itemId);
      });
  }

  function MC_removeItemFromLocalCache(itemId) {
    if (!MC_state.cartData || !MC_state.cartData.items) return;
    var newItems = [];
    for (var i = 0; i < MC_state.cartData.items.length; i++) {
      if (String(MC_state.cartData.items[i].id) !== String(itemId)) newItems.push(MC_state.cartData.items[i]);
    }
    MC_state.cartData.items = newItems;
    MC_recalcSubtotal();
    MC_state.cartData.summaryCount = newItems.length;
    MC_utils.saveToStorage(MC_state.cartData);
    MC_render(MC_state.cartData);
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  function MC_bindEvents() {
    if (MC_state.handlersBound) return;
    MC_state.handlersBound = true;

    document.addEventListener('click', function (e) {
      var t = e.target;
      var root = document.getElementById(MC_CONFIG.ROOT_ID);

      // close triggers
      if (root && (t.classList.contains('mc-overlay') || t.closest('.mc-close') || t.closest('.mc-close-trigger'))) {
        MC_close();
        return;
      }

      var action = t.getAttribute('data-action') || (t.closest('[data-action]') ? t.closest('[data-action]').getAttribute('data-action') : null);
      var itemId = t.getAttribute('data-item-id') || (t.closest('[data-item-id]') ? t.closest('[data-item-id]').getAttribute('data-item-id') : null);

      if (action === 'qty-input') return;

      if (action && itemId) {
        e.preventDefault();
        e.stopPropagation();
        if (action === 'increase') MC_updateQuantity(itemId, 1);
        else if (action === 'decrease') MC_updateQuantity(itemId, -1);
        else if (action === 'remove') MC_removeItem(itemId);
        return;
      }

      // open trigger
      var triggerMatch = MC_CONFIG.SELECTORS.triggerAlternatives.some(function (sel) {
        try { return t.closest && t.closest(sel); } catch (err) { return false; }
      });

      if (triggerMatch) {
        e.preventDefault();
        e.stopPropagation();
        MC_open('user_click');
      }
    }, true);

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.getAttribute('data-action') === 'qty-input') {
        var itemId = t.getAttribute('data-item-id');
        var newQty = parseInt(t.value, 10);
        if (isNaN(newQty) || newQty < 1) { newQty = 1; t.value = '1'; }
        MC_setQuantity(itemId, newQty);
      }
    }, true);

    document.addEventListener('keypress', function (e) {
      if (e.target.getAttribute('data-action') === 'qty-input' && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      }
    }, true);
  }

  // ── Intercept cart changes ───────────────────────────────────────────────────
  function MC_interceptCartChanges() {
    if (window.__MC_CART_INTERCEPTED__) return;
    window.__MC_CART_INTERCEPTED__ = true;

    var origFetch = window.fetch;
    window.fetch = function (url, opts) {
      var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
      var method = opts && opts.method ? opts.method.toUpperCase() : 'GET';
      var isAddToCart = urlStr.indexOf('/checkout/cart/add') !== -1 ||
        (urlStr.indexOf('/rest/') !== -1 && urlStr.indexOf('cart') !== -1 && method === 'POST');

      return origFetch.apply(this, arguments).then(function (response) {
        if (urlStr.indexOf('/checkout/cart/') !== -1 || urlStr.indexOf('/checkout/sidebar/') !== -1 ||
          (urlStr.indexOf('/rest/') !== -1 && urlStr.indexOf('cart') !== -1)) {
          if (response.ok) {
            MC_state.cartData = null;
            setTimeout(function () {
              MC_fetchCartData(function (data) {
                if (data && isAddToCart && data.items && data.items.length > 0) {
                  MC_open('auto_add');
                } else if (data) {
                  var root = document.getElementById(MC_CONFIG.ROOT_ID);
                  if (root && root.classList.contains('mc-open')) MC_render(data);
                }
              });
            }, 100);
          }
        }
        return response;
      });
    };

    var origXHROpen = XMLHttpRequest.prototype.open;
    var origXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
      this._mcMethod = method;
      this._mcUrl = String(url || '');
      return origXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
      var xhr = this;
      var urlStr = xhr._mcUrl || '';
      var isAddToCart = urlStr.indexOf('/checkout/cart/add') !== -1;

      xhr.addEventListener('load', function () {
        if (urlStr.indexOf('/checkout/cart/') !== -1 || urlStr.indexOf('/checkout/sidebar/') !== -1 || urlStr.indexOf('sections=cart') !== -1) {
          if (xhr.status >= 200 && xhr.status < 300) {
            MC_state.cartData = null;
            setTimeout(function () {
              MC_fetchCartData(function (data) {
                if (data && isAddToCart && data.items && data.items.length > 0) {
                  MC_open('auto_add');
                } else if (data) {
                  var root = document.getElementById(MC_CONFIG.ROOT_ID);
                  if (root && root.classList.contains('mc-open')) MC_render(data);
                }
              });
            }, 100);
          }
        }
      });

      return origXHRSend.apply(this, arguments);
    };

    document.addEventListener('click', function (e) {
      var target = e.target;
      var addBtn = target.closest && (
        target.closest('[data-action="add-to-cart"]') ||
        target.closest('button[type="submit"][title*="Comprar" i]') ||
        target.closest('button[type="submit"][title*="carrinho" i]') ||
        target.closest('.tocart') ||
        target.closest('#product-addtocart-button')
      );

      if (addBtn) {
        setTimeout(function () {
          MC_state.cartData = null;
          MC_fetchCartData(function (data) {
            if (data && data.items && data.items.length > 0) MC_open('auto_add');
          });
        }, 300);
      }
    }, true);
  }

  // ── Hide original minicart ───────────────────────────────────────────────────
  function MC_hideOriginalMiniCart() {
    var sels = [
      '.block-minicart', '.block.block-minicart',
      '.ui-dialog-content.block-minicart', '[data-role="dropdownDialog"]',
      '.minicart-wrapper .block-minicart', '#ui-id-1',
    ];

    function hide() {
      sels.forEach(function (sel) {
        MC_utils.qa(sel).forEach(function (el) {
          if (!el.hasAttribute('data-mc-hidden')) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.setAttribute('data-mc-hidden', 'true');
          }
        });
      });
    }

    hide();
    var obs = new MutationObserver(hide);
    obs.observe(document.body, { childList: true, subtree: true });
    var iv = setInterval(hide, 500);
    setTimeout(function () { clearInterval(iv); }, 10000);
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  function MC_bootstrap() {
    MC_injectStyles();
    MC_buildDOM();
    MC_bindEvents();
    MC_state.mounted = true;
    MC_hideOriginalMiniCart();
    MC_interceptCartChanges();

    var stored = MC_utils.loadFromStorage();
    if (stored) MC_state.cartData = stored;

    MC_fetchCartData(function () {});

    var retryTimer = setInterval(function () {
      MC_state.retries += 1;
      if (MC_state.retries >= MC_CONFIG.MAX_RETRIES) clearInterval(retryTimer);
    }, MC_CONFIG.RETRY_MS);

    window.MC_refreshCart = function () {
      MC_state.cartData = null;
      MC_fetchCartData(function (data) {
        if (data) {
          var root = document.getElementById(MC_CONFIG.ROOT_ID);
          if (root && root.classList.contains('mc-open')) MC_render(data);
        }
      });
    };

    window.MC_clearCartCache = function () {
      MC_utils.clearStorage();
      MC_state.cartData = null;
    };

    window.MC_teardown = function () {
      var root = document.getElementById(MC_CONFIG.ROOT_ID);
      var style = document.getElementById(MC_CONFIG.STYLE_ID);
      if (root && root.parentNode) root.parentNode.removeChild(root);
      if (style && style.parentNode) style.parentNode.removeChild(style);
      MC_state.mounted = false;
      MC_state.cartData = null;
      document.body.style.overflow = '';
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MC_bootstrap);
  } else {
    MC_bootstrap();
  }
})();
