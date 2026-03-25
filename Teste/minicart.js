(function () {
  'use strict';

  var CONFIG = {
    EXP_ID: 'CRO_MINICART_V2',
    STYLE_ID: 'CRO_MC_STYLE',
    ROOT_ID: 'CRO_MC_ROOT',
    OBSERVER_ID: '__CRO_MC_OBS__',
    STORAGE_KEY: 'CRO_MC_DATA',
    RETRY_MS: 400,
    MAX_RETRIES: 25,
    FETCH_DEBOUNCE_MS: 50,
    CURRENCY: 'BRL',
    API_URL: '/customer/section/load/?sections=cart&force_new_section_timestamp=true',
    FREE_SHIPPING_THRESHOLD: 200,
    CHECKOUT_URL: '/checkout',
    CART_URL: '/checkout/cart/',
    LABELS: {
      title: 'Seu carrinho',
      freeShippingText: 'Faltam {value} para Frete Grátis',
      freeShippingComplete: 'Parabéns! Você tem Frete Grátis!',
      subtotal: 'Subtotal',
      checkout: 'Finalizar compra',
      continueShopping: 'Continuar comprando',
      emptyCart: 'Seu carrinho está vazio',
      alsoTake: 'Aproveite e leve também',
      addToCart: 'Comprar',
    },
  };

  var state = {
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

  // ── Utilidades ──

  var $ = function (sel, root) {
    try { return (root || document).querySelector(sel); } catch (e) { return null; }
  };
  var $$ = function (sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; }
  };

  function formatBRL(n) {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: CONFIG.CURRENCY }).format(n || 0);
    } catch (e) {
      return 'R$ ' + (n || 0).toFixed(2).replace('.', ',');
    }
  }

  function routeKey() { return location.pathname + '|' + location.search; }

  function saveToStorage(data) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ data: data, timestamp: Date.now() }));
    } catch (e) { /* noop */ }
  }

  function loadFromStorage() {
    try {
      var stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!stored) return null;
      var payload = JSON.parse(stored);
      if (Date.now() - payload.timestamp > 30 * 60 * 1000) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        return null;
      }
      return payload.data;
    } catch (e) { return null; }
  }

  function loadRecurringItems() {
    try {
      var s = localStorage.getItem(CONFIG.STORAGE_KEY + '_recurring');
      return s ? JSON.parse(s) : {};
    } catch (e) { return {}; }
  }

  function saveRecurringItems(items) {
    var map = {};
    for (var i = 0; i < items.length; i++) {
      if (items[i].isRecurring) {
        map[items[i].id] = true;
        if (items[i].sku) map[items[i].sku] = true;
      }
    }
    try { localStorage.setItem(CONFIG.STORAGE_KEY + '_recurring', JSON.stringify(map)); } catch (e) { /* noop */ }
  }

  function getFormKey() {
    var inp = $('input[name="form_key"]');
    if (inp && inp.value) return inp.value;
    var meta = $('meta[name="form_key"]');
    if (meta && meta.getAttribute('content')) return meta.getAttribute('content');
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf('form_key=') === 0) return c.substring(9);
    }
    if (window.FORM_KEY) return window.FORM_KEY;
    return '';
  }

  function dispatchMetric(name, payload) {
    var d = payload || {};
    d.event = name;
    d.experience_id = CONFIG.EXP_ID;
    d.timestamp = Date.now();
    if (window.dataLayer) window.dataLayer.push(d);
    if (window.adobeDataLayer) window.adobeDataLayer.push(d);
  }

  // ── SVG Icons ──

  var ICONS = {
    close: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="#173C56" stroke-width="1.5" stroke-linecap="round"/></svg>',
    trash: '<svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M1 4h12M5.5 1h3c.55 0 1 .45 1 1v1h-5V2c0-.55.45-1 1-1zM3 4v12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4" stroke="#173C56" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 7.5v6M8.5 7.5v6" stroke="#173C56" stroke-width="1.2" stroke-linecap="round"/></svg>',
    minus: '<svg width="13" height="2" viewBox="0 0 13 2" fill="none"><path d="M1 1h11" stroke="#173C56" stroke-width="1.5" stroke-linecap="round"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="#173C56" stroke-width="1.5" stroke-linecap="round"/></svg>',
    cart: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h1.5l.9 4.5h7.2L12 2H4M5.5 12a1 1 0 100-2 1 1 0 000 2zM10 12a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg width="6" height="11" viewBox="0 0 6 11" fill="none"><path d="M1 1l4 4.5L1 10" stroke="#004E99" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  // ── CSS ──

  function injectStyles() {
    if (document.getElementById(CONFIG.STYLE_ID)) return;

    var R = '#' + CONFIG.ROOT_ID;
    var css = [
      '.block-minicart,.block.block-minicart,.ui-dialog-content.block-minicart,[data-role="dropdownDialog"],.minicart-wrapper .block-minicart{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}',

      R + '{position:fixed;inset:0;z-index:99999;display:none;font-family:"Lato",Arial,sans-serif}',
      R + '.mc-open{display:block}',
      R + ' *{box-sizing:border-box;font-family:"Lato",Arial,sans-serif}',

      // overlay
      R + ' .mc-overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);border:none;cursor:default}',

      // panel
      R + ' .mc-panel{position:absolute;top:0;right:0;width:472px;max-width:100vw;height:100%;background:#fff;display:flex;flex-direction:column;box-shadow:0 0 16px rgba(0,0,0,.55);border-radius:20px 0 0 20px;overflow:hidden;transform:translateX(100%);transition:transform .3s ease}',
      R + '.mc-open .mc-panel{transform:translateX(0)}',

      // header
      R + ' .mc-header{background:#F5F7F9;padding:40px 40px 24px;border-radius:20px 0 0 0;flex-shrink:0;position:relative}',
      R + ' .mc-header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}',
      R + ' .mc-title{font-weight:700;font-size:20px;line-height:24px;color:#173C56;margin:0}',
      R + ' .mc-close{border:none;background:transparent;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;position:absolute;top:24px;right:24px}',

      // free shipping bar
      R + ' .mc-shipping-bar{width:100%;height:12px;background:#E9EBF8;border-radius:88px;overflow:hidden;margin-bottom:12px}',
      R + ' .mc-shipping-fill{height:100%;background:#004E99;border-radius:88px;transition:width .4s ease}',
      R + ' .mc-shipping-text{font-weight:400;font-size:16px;line-height:19px;color:#173C56;margin:0}',
      R + ' .mc-shipping-text strong{font-weight:700}',

      // items list
      R + ' .mc-list{flex:1;overflow-y:auto;padding:0 40px}',
      R + ' .mc-item{display:flex;gap:16px;padding:24px 0;border-bottom:1px solid rgba(148,165,177,.5)}',
      R + ' .mc-item:last-child{border-bottom:none}',

      // item image
      R + ' .mc-item-img{width:97px;height:97px;flex-shrink:0;position:relative;border:1px solid #E9EBF8;border-radius:8px;overflow:hidden;background:#fff}',
      R + ' .mc-item-img img{width:100%;height:100%;object-fit:contain}',

      // item info
      R + ' .mc-item-info{flex:1;display:flex;flex-direction:column;gap:12px;min-width:0}',
      R + ' .mc-item-top{display:flex;gap:16px;align-items:flex-start}',
      R + ' .mc-item-details{flex:1;display:flex;flex-direction:column;gap:12px}',
      R + ' .mc-item-name{font-weight:400;font-size:16px;line-height:18px;color:#173C56;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      R + ' .mc-item-name a{color:inherit;text-decoration:none}',
      R + ' .mc-item-price{font-weight:700;font-size:18px;line-height:18px;color:#173C56;margin:0}',

      // trash button
      R + ' .mc-item-trash{border:none;background:transparent;cursor:pointer;padding:0;flex-shrink:0;display:flex;align-items:center;justify-content:center;width:24px;height:24px}',

      // quantity selector
      R + ' .mc-qty-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap}',
      R + ' .mc-qty{display:flex;align-items:center;gap:0}',
      R + ' .mc-qty-btn{width:24px;height:24px;border:none;border-radius:50%;background:#E9EBF8;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0}',
      R + ' .mc-qty-btn:hover{background:#d5d9ee}',
      R + ' .mc-qty-input{width:96px;height:32px;border:1px solid #173C56;border-radius:8px;text-align:center;font-family:"Lato",Arial,sans-serif;font-size:16px;line-height:20px;color:#173C56;background:#fff;outline:none;-moz-appearance:textfield;margin:0 10px}',
      R + ' .mc-qty-input::-webkit-outer-spin-button,' + R + ' .mc-qty-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',

      // recurring select
      R + ' .mc-recurring{width:100%;height:30px;background:#F5F7F9;border:1px solid #004E99;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;cursor:pointer;max-width:279px}',
      R + ' .mc-recurring span{font-size:13px;line-height:16px;color:#004E99}',

      // recurring alert
      R + ' .mc-recurring-alert{font-size:13px;color:#92400e;background:#fef3c7;padding:10px 12px;border-radius:6px;line-height:1.5;border-left:3px solid #f59e0b;width:100%}',

      // recommendations section
      R + ' .mc-recs{background:#F5F7F9;flex-shrink:0;padding:24px 40px}',
      R + ' .mc-recs-title{font-weight:400;font-size:16px;line-height:18px;color:#173C56;margin:0 0 16px}',
      R + ' .mc-recs-list{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;-ms-overflow-style:none;scrollbar-width:none}',
      R + ' .mc-recs-list::-webkit-scrollbar{display:none}',

      // recommendation card
      R + ' .mc-rec-card{width:140px;min-width:140px;background:#fff;border:1px solid #E9EBF8;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;padding:12px}',
      R + ' .mc-rec-img{width:111px;height:97px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px}',
      R + ' .mc-rec-img img{max-width:100%;max-height:100%;object-fit:contain}',
      R + ' .mc-rec-name{font-weight:400;font-size:11px;line-height:13px;color:#173C56;margin:0 0 8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:26px}',
      R + ' .mc-rec-prices{display:flex;align-items:center;gap:8px;margin-bottom:12px}',
      R + ' .mc-rec-old{font-weight:400;font-size:10px;line-height:12px;color:#173C56;text-decoration:line-through}',
      R + ' .mc-rec-price{font-weight:700;font-size:13px;line-height:16px;color:#173C56}',
      R + ' .mc-rec-btn{width:100%;height:32px;background:#173C56;border:none;border-radius:100px;color:#fff;font-family:"Lato",Arial,sans-serif;font-weight:700;font-size:13px;line-height:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;padding:0}',
      R + ' .mc-rec-btn:hover{background:#0e2a3d}',
      R + ' .mc-rec-btn svg{flex-shrink:0}',

      // footer
      R + ' .mc-footer{background:#fff;box-shadow:0 -4px 23px rgba(0,0,0,.15);border-radius:0 0 0 20px;padding:24px 40px 32px;flex-shrink:0}',
      R + ' .mc-subtotal{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
      R + ' .mc-subtotal-label{font-weight:400;font-size:24px;line-height:29px;color:#173C56}',
      R + ' .mc-subtotal-value{font-weight:700;font-size:24px;line-height:29px;color:#173C56}',

      R + ' .mc-cta-checkout{display:flex;align-items:center;justify-content:center;width:100%;height:48px;background:#173C56;border:none;border-radius:100px;color:#fff;font-family:"Lato",Arial,sans-serif;font-weight:700;font-size:18px;line-height:20px;text-decoration:none;cursor:pointer;margin-bottom:12px}',
      R + ' .mc-cta-checkout:hover{background:#0e2a3d}',
      R + ' .mc-cta-continue{display:flex;align-items:center;justify-content:center;width:100%;height:auto;background:transparent;border:none;color:#173C56;font-family:"Lato",Arial,sans-serif;font-weight:700;font-size:18px;line-height:20px;cursor:pointer;padding:8px 0}',

      // empty & loading
      R + ' .mc-empty{padding:60px 16px;text-align:center;color:#6b7c93;font-size:16px;flex:1;display:flex;align-items:center;justify-content:center}',
      R + ' .mc-loading{padding:60px 16px;text-align:center;color:#6b7c93;font-size:14px;flex:1;display:flex;align-items:center;justify-content:center}',

      // mobile
      '@media(max-width:500px){' + R + ' .mc-panel{width:100%;border-radius:0}' + R + ' .mc-header{padding:24px 20px 16px;border-radius:0}' + R + ' .mc-list{padding:0 20px}' + R + ' .mc-recs{padding:16px 20px}' + R + ' .mc-footer{padding:16px 20px 24px;border-radius:0}}',
    ].join('\n');

    var style = document.createElement('style');
    style.id = CONFIG.STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // ── API / Data ──

  function fetchCartData(callback) {
    if (state.isFetching) return;

    if (state.fetchDebounceTimer) clearTimeout(state.fetchDebounceTimer);

    state.fetchDebounceTimer = setTimeout(function () {
      state.isFetching = true;
      var url = CONFIG.API_URL + '&_=' + Date.now();

      fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          state.isFetching = false;
          state.lastFetchTime = Date.now();
          if (data && data.cart) {
            var parsed = parseApiResponse(data.cart);
            state.cartData = parsed;
            saveToStorage(parsed);
            if (typeof callback === 'function') callback(parsed);
          } else if (typeof callback === 'function') {
            callback(null);
          }
        })
        .catch(function () {
          state.isFetching = false;
          var fallback = loadFromStorage();
          if (fallback) state.cartData = fallback;
          if (typeof callback === 'function') callback(fallback || null);
        });
    }, CONFIG.FETCH_DEBOUNCE_MS);
  }

  function parseApiResponse(cart) {
    var items = [];
    var subtotal = 0;

    if (cart.items && cart.items.length > 0) {
      for (var i = 0; i < cart.items.length; i++) {
        var api = cart.items[i];
        var item = {
          id: api.item_id || api.product_id || 'item_' + i,
          productId: api.product_id || '',
          sku: api.product_sku || '',
          name: api.product_name || 'Produto',
          price: parseFloat(api.product_price_value) || 0,
          qty: parseInt(api.qty, 10) || 1,
          image: (api.product_image && api.product_image.src) ? api.product_image.src : '',
          productUrl: api.product_url || '',
          configureUrl: api.configure_url || '',
        };
        items.push(item);
      }
    }

    var recurring = loadRecurringItems();
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
      missingForFreeShipping: Math.max(0, CONFIG.FREE_SHIPPING_THRESHOLD - subtotal),
    };
  }

  function getCartData(forceRefresh, callback) {
    if (forceRefresh) { fetchCartData(callback); return; }
    if (state.cartData) { if (typeof callback === 'function') callback(state.cartData); return; }
    var stored = loadFromStorage();
    if (stored) {
      state.cartData = stored;
      if (typeof callback === 'function') callback(stored);
      fetchCartData(function (fresh) { if (fresh) render(); });
      return;
    }
    fetchCartData(callback);
  }

  // ── DOM Builder ──

  function buildDOM() {
    if (document.getElementById(CONFIG.ROOT_ID)) return document.getElementById(CONFIG.ROOT_ID);

    var root = document.createElement('div');
    root.id = CONFIG.ROOT_ID;

    var overlay = document.createElement('button');
    overlay.className = 'mc-overlay';
    overlay.type = 'button';
    overlay.setAttribute('aria-label', 'Fechar carrinho');

    var panel = document.createElement('aside');
    panel.className = 'mc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    // Header
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
    closeBtn.innerHTML = ICONS.close;

    headerTop.appendChild(title);
    headerTop.appendChild(closeBtn);

    var bar = document.createElement('div');
    bar.className = 'mc-shipping-bar';
    var barFill = document.createElement('div');
    barFill.className = 'mc-shipping-fill';
    bar.appendChild(barFill);

    var shippingText = document.createElement('p');
    shippingText.className = 'mc-shipping-text';
    shippingText.setAttribute('data-mc-shipping', '1');

    header.appendChild(headerTop);
    header.appendChild(bar);
    header.appendChild(shippingText);

    // Items list
    var list = document.createElement('div');
    list.className = 'mc-list';
    list.setAttribute('data-mc-list', '1');

    // Recommendations
    var recs = document.createElement('div');
    recs.className = 'mc-recs';
    recs.setAttribute('data-mc-recs', '1');
    recs.style.display = 'none';

    var recsTitle = document.createElement('p');
    recsTitle.className = 'mc-recs-title';
    recsTitle.textContent = CONFIG.LABELS.alsoTake;

    var recsList = document.createElement('div');
    recsList.className = 'mc-recs-list';
    recsList.setAttribute('data-mc-recs-list', '1');

    recs.appendChild(recsTitle);
    recs.appendChild(recsList);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'mc-footer';
    footer.setAttribute('data-mc-footer', '1');

    var subtotalRow = document.createElement('div');
    subtotalRow.className = 'mc-subtotal';

    var subtotalLabel = document.createElement('span');
    subtotalLabel.className = 'mc-subtotal-label';
    subtotalLabel.textContent = CONFIG.LABELS.subtotal;

    var subtotalValue = document.createElement('span');
    subtotalValue.className = 'mc-subtotal-value';
    subtotalValue.setAttribute('data-mc-subtotal', '1');
    subtotalValue.textContent = 'R$ 0,00';

    subtotalRow.appendChild(subtotalLabel);
    subtotalRow.appendChild(subtotalValue);

    var checkoutBtn = document.createElement('a');
    checkoutBtn.className = 'mc-cta-checkout';
    checkoutBtn.href = CONFIG.CHECKOUT_URL;
    checkoutBtn.textContent = CONFIG.LABELS.checkout;

    var continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'mc-cta-continue mc-continue-btn';
    continueBtn.textContent = CONFIG.LABELS.continueShopping;

    footer.appendChild(subtotalRow);
    footer.appendChild(checkoutBtn);
    footer.appendChild(continueBtn);

    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(recs);
    panel.appendChild(footer);

    root.appendChild(overlay);
    root.appendChild(panel);
    document.body.appendChild(root);

    return root;
  }

  // ── Render ──

  function render(data) {
    var root = buildDOM();
    var list = $('[data-mc-list]', root);
    var subtotalEl = $('[data-mc-subtotal]', root);
    var shippingText = $('[data-mc-shipping]', root);
    var barFill = $('.mc-shipping-fill', root);
    var footer = $('[data-mc-footer]', root);
    var titleEl = $('[data-mc-title]', root);

    if (!data) data = state.cartData;

    list.innerHTML = '';

    if (!data) {
      list.innerHTML = '<div class="mc-loading">Carregando carrinho...</div>';
      titleEl.textContent = CONFIG.LABELS.title;
      return;
    }

    var count = 0;
    if (data.items) {
      for (var c = 0; c < data.items.length; c++) count += data.items[c].qty;
    }
    titleEl.textContent = CONFIG.LABELS.title + (count > 0 ? ' (' + count + ')' : '');

    if (!data.items || data.items.length === 0) {
      list.innerHTML = '<div class="mc-empty">' + CONFIG.LABELS.emptyCart + '</div>';
      subtotalEl.textContent = formatBRL(0);
      shippingText.innerHTML = CONFIG.LABELS.freeShippingText.replace('{value}', '<strong>' + formatBRL(CONFIG.FREE_SHIPPING_THRESHOLD) + '</strong>');
      barFill.style.width = '0%';
      footer.style.display = 'none';
      return;
    }

    footer.style.removeProperty('display');

    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];

      var row = document.createElement('div');
      row.className = 'mc-item';
      row.setAttribute('data-id', item.id);

      // Image
      var imgWrap = document.createElement('div');
      imgWrap.className = 'mc-item-img';
      var img = document.createElement('img');
      img.src = item.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      img.alt = item.name;
      img.loading = 'lazy';
      if (item.productUrl) {
        var imgLink = document.createElement('a');
        imgLink.href = item.productUrl;
        imgLink.appendChild(img);
        imgWrap.appendChild(imgLink);
      } else {
        imgWrap.appendChild(img);
      }

      // Info
      var info = document.createElement('div');
      info.className = 'mc-item-info';

      var top = document.createElement('div');
      top.className = 'mc-item-top';

      var details = document.createElement('div');
      details.className = 'mc-item-details';

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
      price.textContent = formatBRL(item.price);

      details.appendChild(name);
      details.appendChild(price);

      var trashBtn = document.createElement('button');
      trashBtn.className = 'mc-item-trash';
      trashBtn.type = 'button';
      trashBtn.setAttribute('aria-label', 'Remover item');
      trashBtn.setAttribute('data-action', 'remove');
      trashBtn.setAttribute('data-item-id', item.id);
      trashBtn.innerHTML = ICONS.trash;

      top.appendChild(details);
      top.appendChild(trashBtn);

      // Qty row
      var qtyRow = document.createElement('div');
      qtyRow.className = 'mc-qty-row';

      var qtyWrap = document.createElement('div');
      qtyWrap.className = 'mc-qty';

      var minusBtn = document.createElement('button');
      minusBtn.className = 'mc-qty-btn';
      minusBtn.type = 'button';
      minusBtn.setAttribute('data-action', 'decrease');
      minusBtn.setAttribute('data-item-id', item.id);
      minusBtn.innerHTML = ICONS.minus;

      var qtyInput = document.createElement('input');
      qtyInput.className = 'mc-qty-input';
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = String(item.qty);
      qtyInput.setAttribute('data-action', 'qty-input');
      qtyInput.setAttribute('data-item-id', item.id);

      var plusBtn = document.createElement('button');
      plusBtn.className = 'mc-qty-btn';
      plusBtn.type = 'button';
      plusBtn.setAttribute('data-action', 'increase');
      plusBtn.setAttribute('data-item-id', item.id);
      plusBtn.innerHTML = ICONS.plus;

      qtyWrap.appendChild(minusBtn);
      qtyWrap.appendChild(qtyInput);
      qtyWrap.appendChild(plusBtn);
      qtyRow.appendChild(qtyWrap);

      info.appendChild(top);
      info.appendChild(qtyRow);

      if (item.isRecurring) {
        var alert = document.createElement('div');
        alert.className = 'mc-recurring-alert';
        alert.textContent = 'O envio de ' + item.qty + ' unidade(s) será realizada mensalmente.';
        info.appendChild(alert);
      }

      row.appendChild(imgWrap);
      row.appendChild(info);
      list.appendChild(row);
    }

    // Subtotal
    subtotalEl.textContent = formatBRL(data.subtotal);

    // Shipping bar
    var missing = data.missingForFreeShipping;
    if (missing <= 0) {
      shippingText.textContent = CONFIG.LABELS.freeShippingComplete;
      barFill.style.width = '100%';
    } else {
      shippingText.innerHTML = CONFIG.LABELS.freeShippingText.replace('{value}', '<strong>' + formatBRL(missing) + '</strong>');
      var pct = Math.max(8, Math.min(95, (data.subtotal / CONFIG.FREE_SHIPPING_THRESHOLD) * 100));
      barFill.style.width = pct + '%';
    }
  }

  // ── Open / Close ──

  function open(origin) {
    var root = buildDOM();
    if (!root) return;
    root.classList.add('mc-open');
    document.body.style.overflow = 'hidden';

    if (state.cartData) {
      render(state.cartData);
    } else {
      render(null);
    }

    getCartData(true, function (data) {
      if (data) render(data);
    });

    dispatchMetric('cro_minicart_open', { origin: origin || 'click' });
  }

  function close() {
    var root = document.getElementById(CONFIG.ROOT_ID);
    if (root) root.classList.remove('mc-open');
    document.body.style.overflow = '';
  }

  // ── Cart Actions ──

  function syncQtyWithServer(itemId, newQty) {
    var formKey = getFormKey();
    var body = new FormData();
    body.append('item_id', itemId);
    body.append('item_qty', newQty);
    if (formKey) body.append('form_key', formKey);

    fetch('/checkout/sidebar/updateItemQty/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: body,
    }).catch(function () {
      var fb = new FormData();
      fb.append('item_id', itemId);
      fb.append('item_qty', newQty);
      fetch('/checkout/cart/updateItemQty/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: fb,
      }).catch(function () { /* silent */ });
    });
  }

  function updateLocalState(itemIndex, newQty) {
    state.cartData.items[itemIndex].qty = newQty;
    var sub = 0;
    for (var j = 0; j < state.cartData.items.length; j++) {
      sub += state.cartData.items[j].price * state.cartData.items[j].qty;
    }
    state.cartData.subtotal = sub;
    state.cartData.missingForFreeShipping = Math.max(0, CONFIG.FREE_SHIPPING_THRESHOLD - sub);
    saveToStorage(state.cartData);
  }

  function updateQuantity(itemId, delta) {
    if (!state.cartData || !state.cartData.items) return;
    var idx = -1;
    for (var i = 0; i < state.cartData.items.length; i++) {
      if (String(state.cartData.items[i].id) === String(itemId)) { idx = i; break; }
    }
    if (idx === -1) return;

    var newQty = state.cartData.items[idx].qty + delta;
    if (newQty <= 0) { removeItem(itemId); return; }

    updateLocalState(idx, newQty);
    render(state.cartData);
    syncQtyWithServer(itemId, newQty);
  }

  function setQuantity(itemId, newQty) {
    if (!state.cartData || !state.cartData.items) return;
    var idx = -1;
    for (var i = 0; i < state.cartData.items.length; i++) {
      if (String(state.cartData.items[i].id) === String(itemId)) { idx = i; break; }
    }
    if (idx === -1) return;
    if (newQty <= 0) { removeItem(itemId); return; }
    if (newQty === state.cartData.items[idx].qty) return;

    updateLocalState(idx, newQty);
    render(state.cartData);
    syncQtyWithServer(itemId, newQty);
  }

  function removeItem(itemId) {
    var row = $('[data-id="' + itemId + '"]');
    if (row) {
      row.style.opacity = '0.4';
      row.style.pointerEvents = 'none';
    }

    var formKey = getFormKey();
    var bodyStr = 'item_id=' + encodeURIComponent(itemId) + (formKey ? '&form_key=' + encodeURIComponent(formKey) : '');

    fetch('/checkout/sidebar/removeItem/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body: bodyStr,
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (d.success || !d.error_message) {
          state.cartData = null;
          fetchCartData(function (data) { render(data); });
        } else {
          removeViaDelete(itemId, formKey);
        }
      })
      .catch(function () {
        removeViaDelete(itemId, formKey);
      });
  }

  function removeViaDelete(itemId, formKey) {
    var bodyStr = 'id=' + encodeURIComponent(itemId);
    if (formKey) bodyStr += '&form_key=' + encodeURIComponent(formKey);

    fetch('/checkout/cart/delete/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body: bodyStr,
    })
      .then(function () {
        state.cartData = null;
        fetchCartData(function (data) { render(data); });
      })
      .catch(function () {
        removeFromLocalCache(itemId);
      });
  }

  function removeFromLocalCache(itemId) {
    if (!state.cartData || !state.cartData.items) return;
    var filtered = [];
    var removed = 0;
    for (var i = 0; i < state.cartData.items.length; i++) {
      if (String(state.cartData.items[i].id) !== String(itemId)) {
        filtered.push(state.cartData.items[i]);
      } else {
        removed = state.cartData.items[i].price * state.cartData.items[i].qty;
      }
    }
    state.cartData.items = filtered;
    state.cartData.subtotal -= removed;
    state.cartData.missingForFreeShipping = Math.max(0, CONFIG.FREE_SHIPPING_THRESHOLD - state.cartData.subtotal);
    state.cartData.summaryCount = filtered.length;
    saveToStorage(state.cartData);
    render(state.cartData);
  }

  // ── Events ──

  function bindEvents() {
    if (state.handlersBound) return;
    state.handlersBound = true;

    document.addEventListener('click', function (e) {
      var t = e.target;
      var root = document.getElementById(CONFIG.ROOT_ID);

      // Close actions
      if (root && (t.classList.contains('mc-overlay') || t.closest('.mc-close') || t.closest('.mc-continue-btn'))) {
        close();
        return;
      }

      // Cart item actions
      var actionEl = t.closest('[data-action]');
      if (actionEl) {
        var action = actionEl.getAttribute('data-action');
        var itemId = actionEl.getAttribute('data-item-id');

        if (action === 'qty-input') return;

        if (action && itemId) {
          e.preventDefault();
          e.stopPropagation();
          if (action === 'increase') updateQuantity(itemId, 1);
          else if (action === 'decrease') updateQuantity(itemId, -1);
          else if (action === 'remove') removeItem(itemId);
          return;
        }
      }

      // Open trigger – .minicart-link or related selectors
      var trigger = t.closest('.minicart-link') ||
        t.closest('.minicart-wrapper') ||
        t.closest('[data-block="minicart"]') ||
        t.closest('.action.showcart');

      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        open('user_click');
      }
    }, true);

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.getAttribute('data-action') === 'qty-input') {
        var newQty = parseInt(t.value, 10);
        if (isNaN(newQty) || newQty < 1) { newQty = 1; t.value = '1'; }
        setQuantity(t.getAttribute('data-item-id'), newQty);
      }
    }, true);

    document.addEventListener('keypress', function (e) {
      if (e.target.getAttribute('data-action') === 'qty-input' && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      }
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // ── Intercept Cart Changes ──

  function interceptCartChanges() {
    if (window.__CRO_MC_INTERCEPTED__) return;
    window.__CRO_MC_INTERCEPTED__ = true;

    var origFetch = window.fetch;
    window.fetch = function (url, opts) {
      var u = typeof url === 'string' ? url : (url && url.url) || '';
      var m = (opts && opts.method || 'GET').toUpperCase();
      var isAdd = u.indexOf('/checkout/cart/add') !== -1 || (u.indexOf('/rest/') !== -1 && u.indexOf('cart') !== -1 && m === 'POST');

      return origFetch.apply(this, arguments).then(function (response) {
        if (u.indexOf('/checkout/cart/') !== -1 || u.indexOf('/checkout/sidebar/') !== -1 || (u.indexOf('/rest/') !== -1 && u.indexOf('cart') !== -1)) {
          if (response.ok) {
            state.cartData = null;
            setTimeout(function () {
              fetchCartData(function (data) {
                if (data && isAdd && data.items && data.items.length > 0) {
                  open('auto_add');
                } else if (data) {
                  var root = document.getElementById(CONFIG.ROOT_ID);
                  if (root && root.classList.contains('mc-open')) render(data);
                }
              });
            }, 100);
          }
        }
        return response;
      });
    };

    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
      this._croMethod = method;
      this._croUrl = String(url || '');
      return origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
      var xhr = this;
      var u = xhr._croUrl || '';
      var isAdd = u.indexOf('/checkout/cart/add') !== -1;

      xhr.addEventListener('load', function () {
        if (u.indexOf('/checkout/cart/') !== -1 || u.indexOf('/checkout/sidebar/') !== -1 || u.indexOf('sections=cart') !== -1) {
          if (xhr.status >= 200 && xhr.status < 300) {
            state.cartData = null;
            setTimeout(function () {
              fetchCartData(function (data) {
                if (data && isAdd && data.items && data.items.length > 0) {
                  open('auto_add');
                } else if (data) {
                  var root = document.getElementById(CONFIG.ROOT_ID);
                  if (root && root.classList.contains('mc-open')) render(data);
                }
              });
            }, 100);
          }
        }
      });

      return origSend.apply(this, arguments);
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
          state.cartData = null;
          fetchCartData(function (data) {
            if (data && data.items && data.items.length > 0) open('auto_add');
          });
        }, 300);
      }
    }, true);
  }

  // ── Hide Original Minicart ──

  function hideOriginalMinicart() {
    var sels = ['.block-minicart', '.block.block-minicart', '[data-role="dropdownDialog"]', '#ui-id-1'];

    function hide() {
      sels.forEach(function (sel) {
        $$(sel).forEach(function (el) {
          if (!el.hasAttribute('data-cro-hidden')) {
            el.style.cssText = 'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important';
            el.setAttribute('data-cro-hidden', '1');
          }
        });
      });
    }

    hide();
    new MutationObserver(hide).observe(document.body, { childList: true, subtree: true });
    var iv = setInterval(hide, 500);
    setTimeout(function () { clearInterval(iv); }, 10000);
  }

  // ── Init ──

  function syncAndRender() {
    var current = routeKey();
    if (current !== state.routeKey) { state.routeKey = current; close(); }
    if (!state.mounted) {
      injectStyles();
      buildDOM();
      bindEvents();
      state.mounted = true;
      dispatchMetric('cro_minicart_ready', {});
    }
  }

  function bootstrap() {
    injectStyles();
    syncAndRender();

    hideOriginalMinicart();
    interceptCartChanges();

    var stored = loadFromStorage();
    if (stored) state.cartData = stored;

    fetchCartData(function () {});

    var obs = new MutationObserver(function () { syncAndRender(); });
    obs.observe(document.body, { childList: true, subtree: true });
    state.observer = obs;
    window[CONFIG.OBSERVER_ID] = obs;

    var retries = 0;
    var iv = setInterval(function () {
      syncAndRender();
      if (++retries >= CONFIG.MAX_RETRIES) clearInterval(iv);
    }, CONFIG.RETRY_MS);

    window.CRO_MC_refresh = function () {
      state.cartData = null;
      fetchCartData(function (data) {
        var root = document.getElementById(CONFIG.ROOT_ID);
        if (data && root && root.classList.contains('mc-open')) render(data);
      });
    };

    window.CRO_MC_teardown = function () {
      if (state.observer) state.observer.disconnect();
      var root = document.getElementById(CONFIG.ROOT_ID);
      var style = document.getElementById(CONFIG.STYLE_ID);
      if (root) root.remove();
      if (style) style.remove();
      delete window[CONFIG.OBSERVER_ID];
      state.mounted = false;
      state.cartData = null;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
