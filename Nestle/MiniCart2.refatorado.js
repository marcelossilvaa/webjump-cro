(function () {
  'use strict';

  let progressInitialized = false;
  let cartSubscriptionAdded = false;
  let listenersAdded = false;
  let pollingTimer = null;
  let pollingCount = 0;
  let hiddenUpsellSkus = {};
  let upsellProductIdCache = {};
  let upsellProductUrlCache = {};
  let upsellAddInFlight = {};

  const FREE_SHIPPING_THRESHOLD = 399.0;
  const MAX_POLLS = 30;
  const POLL_INTERVAL_MS = 1000;
  const STYLE_ID = 'custom-minicart2-style';
  const UPSELL_PRODUCT_URL_QUERY = 'query MiniCartUpsellProductUrl($sku: String!) { products(filter: { sku: { eq: $sku } }) { items { url_key url_suffix } } }';
  const UPSELL_PRODUCTS = [
    {
      sku: '124543555',
      name: 'Formula Infantil NAN Comfor de 6 a 12 meses 800g',
      url: '/catalogsearch/result/?q=124543555',
      image: 'https://www.lojafamilynes.com.br/media/catalog/product/cache/c73387348bbf4231a5df3de9bda9e89c/n/a/nan_comfor_2_800g.png',
      oldPrice: null,
      currentPrice: 68.57
    },
    {
      sku: '12519484',
      name: 'Materna Vitaminas & Minerais 30 cápsulas',
      url: '/catalogsearch/result/?q=12519484',
      image: 'https://www.lojafamilynes.com.br/media/catalog/product/cache/c73387348bbf4231a5df3de9bda9e89c/m/a/materna_vit_1.png',
      oldPrice: null,
      currentPrice: 48.70
    },
    {
      sku: '12568337',
      name: 'Fórmula Infantil NAN S.L. 400g',
      url: '/catalogsearch/result/?q=12568337',
      image: 'https://www.lojafamilynes.com.br/media/catalog/product/cache/c73387348bbf4231a5df3de9bda9e89c/n/a/nan_sl_2.png',
      oldPrice: null,
      currentPrice: 89.57
    }
  ];

  function getMiniCartCss() {
    return [
      ".page-header .minicart-wrapper .block-minicart { position: fixed; right: 0px; top: 0px; width: 100%; max-width: 472px; min-width: auto; height: 100%; margin: 0px; border-radius: 20px 0px 0px 20px; box-shadow: 0px 0px 16px 0px #0000008C; border: none; padding: 0px; background-color: #fff; box-sizing: border-box; z-index: 9999; }",
      ".page-header .minicart-wrapper .block-minicart:before, .page-header .minicart-wrapper .block-minicart:after { display: none; }",
      ".page-header .minicart-wrapper .block-minicart .block-title { display: block; padding: 40px; background-color: #F5F7F9; border-radius: 20px 0px 0px 0px; }",
      ".page-header .minicart-wrapper .block-minicart .block-title strong { font-size: 20px; }",
      ".page-header .minicart-wrapper .block-minicart .block-title strong span.text:after { content: 'Seu carrinho'; font-size: 20px; }",
      ".page-header .minicart-wrapper .block-minicart .block-title strong span.text { font-size: 0px; }",
      ".page-header .minicart-wrapper .block-minicart .block-title .qty { font-size: 20px; }",
      ".page-header .minicart-wrapper .block-minicart .block-title .qty:before { content: '('; }",
      ".page-header .minicart-wrapper .block-minicart .block-title .qty:after { content: ')'; }",
      ".page-header .minicart-wrapper .action.close { top: 24px; right: 24px; margin: 0px; height: 16px; width: 16px; }",
      ".page-header .minicart-wrapper .block-minicart .block-content { padding: 32px 0px 260px; background-color: #fff; border-radius: 0px 0px 0px 20px; position: relative; }",
      ".page-header .minicart-wrapper .block-minicart .items-total { display: none; }",
      ".page-header .minicart-wrapper .block-minicart .block-content .subtotal { position: absolute; bottom: 230px; font-size: 24px; width: 100%; text-align: left; left: 0px; display: flex; align-items: center; justify-content: space-between; padding: 0px 40px; box-sizing: border-box; z-index: 2; }",
      ".page-header .minicart-wrapper .block-minicart .block-content .subtotal span.label { margin: 0px; }",
      ".page-header .minicart-wrapper .block-minicart .amount .price-wrapper:first-child .price { font-size: 24px; }",
      ".page-header .minicart-items-wrapper { border: none; margin: 0px; padding: 0px; max-height: calc(100dvh - 340px) !important; height: calc(100dvh - 340px) !important; }",
      ".page-header .minicart-items .product-item { padding: 32px 0px !important; }",
      ".page-header .minicart-items .product-item:not(:first-child) { border-top: 1px solid #94A5B1; }",
      ".page-header .minicart-items .product-item:first-child { padding-top: 0px !important; }",
      ".page-header .minicart-items .product-item .product-item-photo { border: 1px solid #E9EBF8; border-radius: 8px; box-sizing: border-box; padding: 8px; margin: 0px 16px 0px 0px; }",
      ".page-header .minicart-items .product-item-details { padding-left: 109px; position: relative; }",
      ".page-header .minicart-items .product-item-name { margin: 0px 0px 12px; max-width: 223px; }",
      ".page-header .minicart-items .product-item-details .price { font-size: 18px; }",
      ".page-header .minicart-items .product-item-details .details-qty { margin: 16px 0px 0px; display: flex; align-items: center; }",
      ".page-header .minicart-wrapper .block-minicart .qty label { display: none; }",
      ".page-header .minicart-wrapper .block-minicart .qty input { max-width: 96px; min-width: 96px; }",
      ".page-header .minicart-items .product-item-details .price-including-tax, .page-header .minicart-items .product-item-details .price-excluding-tax { margin: 0px; }",
      ".page-header .minicart-wrapper .product .actions { margin: 0px; position: absolute; top: 0px; right: 0px; }",
      ".page-header .minicart-wrapper .block-minicart .message.notice { margin: 16px 0px 0px; }",
      ".page-header .block-minicart .block-content>.actions:last-child { bottom: 0px; background-color: #fff; position: absolute; min-height: 197px; display: table; width: 100%; left: 0px; max-width: 472px; padding: 24px 40px 40px; box-sizing: border-box; z-index: 3; border-radius: 20px 0px 0px; }",
      ".page-header .minicart-wrapper .block-minicart .block-content>.actions>.primary .action.primary.checkout { display: none; }",
      ".page-header .block-minicart .block-content>.actions { position: relative; z-index: 3; }",
      ".page-header .minicart-wrapper .action.viewcart { margin: 0px auto; border: none; font-size: 18px; line-height: 20px; width: auto; padding: 0px; display: block; }",
      ".page-header .minicart-wrapper .action.viewcart:focus, .page-header .minicart-wrapper .action.viewcart:active, .page-header .minicart-wrapper .action.viewcart:hover { background: none; border: none; text-decoration: underline; }",
      ".page-header .block-minicart .block-content>.actions:last-child .primary { margin: 52px 0px 0px; }",
      ".page-header .minicart-wrapper .block-minicart:before { content: ''; display: table; width: 100%; height: 100%; background-color: #000; opacity: 0.3; z-index: 1; position: fixed; border: unset; top: 0px !important; right: 473px !important; }",
      ".page-header .minicart-wrapper.active .block-minicart div#minicart-content-wrapper { position: relative; z-index: 9; }",
      "[data-content-type=\"html\"] .container-chat-tag { z-index: 9 !important; }",
      ".page-header .minicart-items { height: 56dvh; overflow: hidden; overflow-y: scroll; padding: 0px 40px; }",
      ".page-header .minicart-items::-webkit-scrollbar { width: 5px; }",
      ".page-header .minicart-items::-webkit-scrollbar-track { background: #ffffff; border-radius: 10px; }",
      ".page-header .minicart-items::-webkit-scrollbar-thumb { background-color: var(--uni-color-tertiary-blue-700); border-radius: 10px; }",
      ".page-header .minicart-items .product-item-details .product .options.list dd span.price:before { content: '- '; }",
      ".free-shipping-progress { margin-top: 24px; width: 100%; }",
      ".free-shipping-progress .progress-message { font-size: 16px; font-weight: 400; color: #173C56; text-align: left; margin-bottom: 16px; }",
      ".free-shipping-progress .progress-message.completed { font-weight: 700; font-size: 18px; color: #00855D; }",
      ".free-shipping-progress .progress-message strong { font-weight: 700; }",
      ".free-shipping-progress .progress-bar-container { width: 100%; height: 12px; margin: 0px 0px 16px; background-color: #E9EBF8; border-radius: 88px; overflow: visible; position: relative; }",
      ".free-shipping-progress .progress-bar-fill { height: 100%; background-color: #00855D; border-radius: 88px; transition: width 0.3s ease; width: 0%; }",
      ".free-shipping-progress .progress-checkmark { box-sizing: border-box; display: flex; justify-content: center; align-items: center; position: absolute; width: 25px; height: 25px; right: -5px; top: -7px; background: #00855D; border: 1px solid #F5F7F9; border-radius: 99px; opacity: 0; visibility: hidden; transition: opacity 0.3s ease; }",
      ".free-shipping-progress .progress-bar-container.completed .progress-checkmark { opacity: 1; visibility: visible; }",
      ".free-shipping-progress .progress-checkmark svg { width: 16px; height: 16px; }",
      ".free-shipping-progress .progress-additional-message { font-family: 'Lato', sans-serif; font-weight: 400; font-size: 16px; line-height: 19px; color: #173C56; display: none; margin-top: 8px; }",
      ".free-shipping-progress .progress-additional-message.show { display: block; }",
      ".custom-view-cart-btn { display: block; width: 100%; padding: 11px 20px; margin: 0px 0px 16px; background-color: #173C56; color: #ffffff; font-size: 18px; font-weight: 700; text-align: center; text-decoration: none; border-radius: 100px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box; }",
      ".custom-view-cart-btn:visited { color: #fff; }",
      ".custom-view-cart-btn:hover { background-color: var(--uni-color-primary-main-hover); color: #fff; text-decoration: none; }",
      ".custom-continue-shopping-btn { display: block; padding: 0px; margin: 0px auto; background: none; border: none; color: var(--uni-color-primary-main); font-size: 18px; line-height: 20px; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.3s ease; }",
      ".custom-continue-shopping-btn:hover { text-decoration: underline; border: none; background-color: unset; }",
      ".page-header .minicart-wrapper .actions .secondary { text-align: center; display: block; visibility: visible; opacity: 1; }",
      ".page-header .block-minicart .block-content>.actions:last-child .custom-cart-buttons { display: flex; flex-direction: column; gap: 0px; }",
      ".page-header .block-minicart .block-content>.actions:last-child .custom-continue-shopping-btn { display: block; margin: 0px auto; }",
      ".page-header .minicart-items .minicart-upsell { list-style: none; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin: 24px -40px 0px; padding: 24px 40px; width: calc(100% + 80px); box-sizing: border-box; background: #F5F7F9; border-top: none; }",
      ".page-header .minicart-items .minicart-upsell-title { width: 100%; font-family: 'Lato', sans-serif; font-style: normal; font-weight: 400; font-size: 16px; line-height: 18px; display: flex; align-items: center; color: #173C56; }",
      ".page-header .minicart-items .minicart-upsell-list { width: 100%; display: flex; align-items: center; gap: 8px; }",
      ".page-header .minicart-items .minicart-upsell-card { box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 12px; gap: 8px; width: 125.33px; min-height: 269px; background: #FFFFFF; border: 1px solid #E9EBF8; border-radius: 8px; flex: 1; overflow: hidden; }",
      ".page-header .minicart-items .minicart-upsell-image-wrap { width: 100%; height: 97px; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; overflow: hidden; }",
      ".page-header .minicart-items .minicart-upsell-image { width: 100%; height: 100%; object-fit: contain; }",
      ".page-header .minicart-items .minicart-upsell-content { width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }",
      ".page-header .minicart-items .minicart-upsell-name { min-height: 39px; font-family: 'Lato', sans-serif; font-style: normal; font-weight: 400; font-size: 11px; line-height: 13px; color: #173C56; margin: 0px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }",
      ".page-header .minicart-items .minicart-upsell-prices { width: 100%; display: flex; flex-direction: row; align-items: center; gap: 4px; min-height: 13px; }",
      ".page-header .minicart-items .minicart-upsell-price-old { font-family: 'Lato', sans-serif; font-style: normal; font-weight: 400; font-size: 10px; line-height: 12px; color: #173C56; text-decoration: line-through; }",
      ".page-header .minicart-items .minicart-upsell-price-current { font-family: 'Lato', sans-serif; font-style: normal; font-weight: 700; font-size: 11px; line-height: 13px; color: #173C56; }",
      ".page-header .minicart-items .minicart-upsell-card-cta { width: 100%; height: 32px; box-sizing: border-box; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 6px; border-radius: 100px; background: #173C56; color: #FFFFFF; border: 1px solid #173C56; font-family: 'Lato', sans-serif; font-style: normal; font-weight: 700; font-size: 11px; line-height: 20px; text-decoration: none; cursor: pointer; }",
      ".page-header .minicart-items .minicart-upsell-card-cta:visited { color: #FFFFFF; }",
      ".page-header .minicart-items .minicart-upsell-card-cta:hover { background: #0f2b3e; color: #FFFFFF; text-decoration: none; }",
      ".page-header .minicart-items .minicart-upsell-card-cta svg { width: 12px; height: 12px; fill: #FFFFFF; }",
      ".page-header .minicart-items .minicart-upsell-card-cta:disabled { opacity: 0.6; pointer-events: none; }",
      "@media screen and (max-width: 580px) { .page-header .minicart-wrapper .block-minicart { max-width: 100%; height: 100%; top: unset; bottom: 0px; border-radius: 0px; } .page-header .minicart-wrapper .block-minicart .block-title { padding: 24px; border-radius: 0px; } .page-header .minicart-items { height: 59dvh; padding: 0px 24px; } .page-header .minicart-items .product-item { padding: 24px 0px !important; } .page-header .minicart-items .product-item-name { max-width: 192px; } .page-header .block-minicart .block-content { padding-bottom: 320px; } .page-header .block-minicart .block-content>.actions:last-child { max-width: 100%; bottom: 0px; padding: 24px 24px 40px; border-radius: 0px; } .page-header .minicart-wrapper .block-minicart .block-content .subtotal { bottom: 310px; font-size: 20px; } .page-header .minicart-wrapper .block-minicart .amount .price-wrapper:first-child .price { font-size: 20px; } .page-header .minicart-wrapper .block-minicart:before { right: 0px !important; } .page-header .minicart-items-wrapper { height: calc(100dvh - 390px) !important; max-height: calc(100dvh - 390px) !important; } }",
      "@media screen and (max-width: 580px) { .page-header .minicart-items .minicart-upsell { padding: 24px 0px 24px 24px; margin: 24px -24px 0px; width: calc(100% + 48px); } .page-header .minicart-items .minicart-upsell-title { font-size: 14px; } .page-header .minicart-items .minicart-upsell-list { width: 370px; align-items: flex-start; } .page-header .minicart-items .minicart-upsell-card { width: 118px; min-height: 266px; } .page-header .minicart-items .minicart-upsell-image-wrap { height: 80px; } .page-header .minicart-items .minicart-upsell-content { min-height: 154px; } .page-header .minicart-items .minicart-upsell-prices { flex-direction: column; align-items: flex-start; gap: 2px; min-height: 27px; } }"
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(getMiniCartCss()));
    document.head.appendChild(styleElement);
  }

  function createProgressBar($) {
    const blockTitle = $('.minicart-wrapper .block-minicart .block-title');

    if (blockTitle.length && !blockTitle.find('.free-shipping-progress').length) {
      const progressHtml =
        '<div class="free-shipping-progress">' +
        '<div class="progress-message"></div>' +
        '<div class="progress-bar-container">' +
        '<div class="progress-bar-fill"></div>' +
        '<div class="progress-checkmark">' +
        '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="white"/>' +
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
    const cart = customerData.get('cart');
    const cartData = cart();

    if (cartData && cartData.subtotalAmount) {
      return parseFloat(cartData.subtotalAmount);
    }

    const subtotalElement = $('.minicart-wrapper .block-minicart .subtotal .price, .minicart-wrapper .subtotal .price');
    if (subtotalElement.length) {
      const subtotalText = subtotalElement.first().text().replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(subtotalText) || 0;
    }

    return 0;
  }

  function updateProgressBar($, customerData) {
    if (!progressInitialized && !createProgressBar($)) {
      return;
    }

    const currentTotal = getCartSubtotal($, customerData);
    const remaining = FREE_SHIPPING_THRESHOLD - currentTotal;
    const percentage = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

    const progressBar = $('.free-shipping-progress .progress-bar-fill');
    const progressBarContainer = $('.free-shipping-progress .progress-bar-container');
    const progressMessage = $('.free-shipping-progress .progress-message');
    const additionalMessage = $('.free-shipping-progress .progress-additional-message');

    if (!progressBar.length || !progressMessage.length) {
      return;
    }

    progressBar.css('width', percentage + '%');

    if (remaining <= 0) {
      progressMessage.text('Você ganhou frete grátis!');
      progressMessage.addClass('completed');
      progressBarContainer.addClass('completed');
      additionalMessage.addClass('show');
      return;
    }

    const remainingFormatted = 'R$ ' + remaining.toFixed(2).replace('.', ',');
    progressMessage.html('Faltam <strong>' + remainingFormatted + '</strong> para Frete Grátis');
    progressMessage.removeClass('completed');
    progressBarContainer.removeClass('completed');
    additionalMessage.removeClass('show');
  }

  function createViewCartButton($) {
    const actionsContainer = $('.block-minicart .block-content > .actions:last-child .primary');

    if (actionsContainer.length && !actionsContainer.find('.custom-view-cart-btn').length) {
      const viewCartBtn = '<a href="/checkout/cart/" class="custom-view-cart-btn">Finalizar compra</a>';
      actionsContainer.prepend(viewCartBtn);
    }
  }

  function createContinueShoppingButton($) {
    const actionsContainer = $('.block-minicart .block-content > .actions:last-child');

    if (actionsContainer.length && !actionsContainer.find('.custom-continue-shopping-btn').length) {
      const primaryContainer = actionsContainer.find('.primary').first();
      const continueBtn = '<button class="custom-continue-shopping-btn" type="button">Continuar comprando</button>';

      if (primaryContainer.length) {
        primaryContainer.after(continueBtn);
      } else {
        actionsContainer.append(continueBtn);
      }
    }

    $('.custom-continue-shopping-btn').each(function () {
      const buttonElement = this;
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

  function escapeHtml(value) {
    if (!value && value !== 0) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatBRL(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return '';
    }

    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function getCookieValue(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function getFormKey() {
    if (window.FORM_KEY) {
      return window.FORM_KEY;
    }

    return getCookieValue('form_key');
  }

  function getVisibleUpsellProducts() {
    return UPSELL_PRODUCTS.filter(function (product) {
      return !hiddenUpsellSkus[product.sku];
    });
  }

  function fetchProductIdFromEndpoint($, endpointUrl, onSuccess, onError) {
    $.ajax({
      url: endpointUrl,
      method: 'GET',
      dataType: 'json'
    })
      .done(function (response) {
        if (response && response.id) {
          onSuccess(response.id);
          return;
        }

        onError();
      })
      .fail(function () {
        onError();
      });
  }

  function resolveUpsellProductId($, sku, onSuccess, onError) {
    if (upsellProductIdCache[sku]) {
      onSuccess(upsellProductIdCache[sku]);
      return;
    }

    const encodedSku = encodeURIComponent(sku);
    const defaultEndpoint = '/rest/default/V1/products/' + encodedSku;
    const genericEndpoint = '/rest/V1/products/' + encodedSku;

    fetchProductIdFromEndpoint(
      $,
      defaultEndpoint,
      function (productId) {
        upsellProductIdCache[sku] = productId;
        onSuccess(productId);
      },
      function () {
        fetchProductIdFromEndpoint(
          $,
          genericEndpoint,
          function (productId) {
            upsellProductIdCache[sku] = productId;
            onSuccess(productId);
          },
          onError
        );
      }
    );
  }

  function resolveProductUrlBySku($, sku, onSuccess, onError) {
    if (upsellProductUrlCache[sku]) {
      onSuccess(upsellProductUrlCache[sku]);
      return;
    }

    $.ajax({
      url: '/graphql',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        query: UPSELL_PRODUCT_URL_QUERY,
        variables: { sku: sku }
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

        if (!items.length || !items[0].url_key) {
          if (typeof onError === 'function') {
            onError();
          }
          return;
        }

        const suffix = items[0].url_suffix || '';
        const productUrl = '/' + items[0].url_key + suffix;
        upsellProductUrlCache[sku] = productUrl;
        onSuccess(productUrl);
      })
      .fail(function () {
        if (typeof onError === 'function') {
          onError();
        }
      });
  }

  function addViaProductPage($, sku, onSuccess, onError) {
    resolveProductUrlBySku(
      $,
      sku,
      function (productUrl) {
        $.ajax({
          url: productUrl,
          method: 'GET',
          dataType: 'html'
        })
          .done(function (html) {
            const parsed = $.parseHTML(html);
            const temp = $('<div></div>').append(parsed);
            const addForm = temp.find('form#product_addtocart_form, form[action*="/checkout/cart/add"]').first();

            if (!addForm.length) {
              if (typeof onError === 'function') {
                onError();
              }
              return;
            }

            const formAction = addForm.attr('action') || '/checkout/cart/add';
            const formProduct = addForm.find('input[name="product"]').val();
            const formKeyFromPage = addForm.find('input[name="form_key"]').val();
            const formQty = addForm.find('input[name="qty"]').val() || 1;
            const finalFormKey = formKeyFromPage || getFormKey();

            if (!formProduct || !finalFormKey) {
              if (typeof onError === 'function') {
                onError();
              }
              return;
            }

            $.ajax({
              url: formAction,
              method: 'POST',
              dataType: 'html',
              data: {
                product: formProduct,
                qty: formQty,
                form_key: finalFormKey
              }
            })
              .done(function () {
                if (typeof onSuccess === 'function') {
                  onSuccess();
                }
              })
              .fail(function () {
                if (typeof onError === 'function') {
                  onError();
                }
              });
          })
          .fail(function () {
            if (typeof onError === 'function') {
              onError();
            }
          });
      },
      onError
    );
  }

  function refreshCartData(customerData) {
    if (!customerData || typeof customerData.invalidate !== 'function' || typeof customerData.reload !== 'function') {
      return;
    }

    customerData.invalidate(['cart']);
    customerData.reload(['cart'], true);
  }

  function addUpsellProductToCart($, customerData, sku, onSuccess, onError) {
    const formKey = getFormKey();
    if (!formKey) {
      if (typeof onError === 'function') {
        onError();
      }
      return;
    }

    resolveUpsellProductId(
      $,
      sku,
      function (productId) {
        $.ajax({
          url: '/checkout/cart/add',
          method: 'POST',
          dataType: 'html',
          data: {
            product: productId,
            qty: 1,
            form_key: formKey
          }
        })
          .done(function () {
            refreshCartData(customerData);
            $(document).trigger('ajax:addToCart');
            if (typeof onSuccess === 'function') {
              onSuccess();
            }
          })
          .fail(function () {
            addViaProductPage(
              $,
              sku,
              function () {
                refreshCartData(customerData);
                $(document).trigger('ajax:addToCart');
                if (typeof onSuccess === 'function') {
                  onSuccess();
                }
              },
              onError
            );
          });
      },
      function () {
        addViaProductPage(
          $,
          sku,
          function () {
            refreshCartData(customerData);
            $(document).trigger('ajax:addToCart');
            if (typeof onSuccess === 'function') {
              onSuccess();
            }
          },
          onError
        );
      }
    );
  }

  function buildUpsellCardsHtml(products) {
    const cartIcon =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.17 14h9.92c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.55 5H6.21L5.27 3H2v2h2l3.6 7.59-1.35 2.45C5.52 16.37 6.48 18 8 18h12v-2H8l1.1-2z" />' +
      '</svg>';

    return products
      .map(function (product) {
        const imageHtml = product.image
          ? '<img class="minicart-upsell-image" src="' +
            escapeHtml(product.image) +
            '" alt="' +
            escapeHtml(product.name) +
            '">' 
          : '';

        const oldPriceHtml = product.oldPrice
          ? '<span class="minicart-upsell-price-old">' +
            escapeHtml(formatBRL(product.oldPrice)) +
            '</span>'
          : '';
        const currentPriceHtml = product.currentPrice
          ? '<span class="minicart-upsell-price-current">' +
            escapeHtml(formatBRL(product.currentPrice)) +
            '</span>'
          : '<span class="minicart-upsell-price-current">Ver produto</span>';

        return (
          '<article class="minicart-upsell-card" data-upsell-sku="' +
          escapeHtml(product.sku) +
          '">' +
          '<div class="minicart-upsell-image-wrap">' +
          imageHtml +
          '</div>' +
          '<div class="minicart-upsell-content">' +
          '<p class="minicart-upsell-name">' +
          escapeHtml(product.name) +
          '</p>' +
          '<div class="minicart-upsell-prices">' +
          oldPriceHtml +
          currentPriceHtml +
          '</div>' +
          '<button type="button" class="minicart-upsell-card-cta" data-upsell-url="' +
          escapeHtml(product.url) +
          '" data-upsell-sku="' +
          escapeHtml(product.sku) +
          '" data-upsell-name="' +
          escapeHtml(product.name) +
          '">' +
          cartIcon +
          '<span>Adicionar</span>' +
          '</button>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderUpsellSection($, products) {
    const minicartItems = $('.minicart-wrapper .block-minicart .minicart-items').first();
    if (!minicartItems.length) {
      return;
    }

    if (!products.length) {
      minicartItems.find('.minicart-upsell').remove();
      return;
    }

    let upsellElement = minicartItems.find('.minicart-upsell').first();
    if (!upsellElement.length) {
      minicartItems.append('<li class="minicart-upsell" data-minicart-upsell="true"></li>');
      upsellElement = minicartItems.find('.minicart-upsell').first();
    }

    const contentHtml =
      '<span class="minicart-upsell-title">Complete seu Pedido:</span>' +
      '<div class="minicart-upsell-list">' +
      buildUpsellCardsHtml(products) +
      '</div>';

    upsellElement.html(contentHtml);
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      return;
    }

    const labelEvent = 'AT_MiniCart_Upsell_' + eventType + ' ' + eventLabel;
    console.log('[Tracking MiniCart Upsell] Analytics event triggered:', labelEvent);

    (function () {
      const s = window.s;
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_minicart_upsell';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function addUpsellTrackingListeners($, customerData) {
    $('.minicart-upsell-card-cta').each(function () {
      const linkElement = this;

      if (linkElement.getAttribute('data-upsell-tracking-added')) {
        return;
      }

      linkElement.setAttribute('data-upsell-tracking-added', 'true');
      $(linkElement).on('click', function (event) {
        event.preventDefault();

        const sku = linkElement.getAttribute('data-upsell-sku') || '';
        const name = linkElement.getAttribute('data-upsell-name') || '';
        if (!sku || upsellAddInFlight[sku]) {
          return;
        }

        const button = $(linkElement);
        const originalHtml = button.html();
        upsellAddInFlight[sku] = true;
        button.prop('disabled', true);
        button.html('<span>Adicionando...</span>');

        analyticsEvent('sku_' + sku + '_' + name, 'clique');

        addUpsellProductToCart(
          $,
          customerData,
          sku,
          function () {
            hiddenUpsellSkus[sku] = true;
            upsellAddInFlight[sku] = false;
            analyticsEvent('sku_' + sku + '_' + name, 'adicionado');
            applyMiniCartCustomizations($, customerData);
          },
          function () {
            upsellAddInFlight[sku] = false;
            button.prop('disabled', false);
            button.html(originalHtml);
            analyticsEvent('sku_' + sku + '_' + name, 'erro_add');
          }
        );
      });
    });
  }

  function createUpsellSection($, customerData) {
    renderUpsellSection($, getVisibleUpsellProducts());
    addUpsellTrackingListeners($, customerData);
  }

  function applyMiniCartCustomizations($, customerData) {
    createProgressBar($);
    updateProgressBar($, customerData);
    createUpsellSection($, customerData);
    createViewCartButton($);
    createContinueShoppingButton($);
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

    const cart = customerData.get('cart');
    cart.subscribe(function () {
      setTimeout(function () {
        applyMiniCartCustomizations($, customerData);
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

      const minicart = $('.minicart-wrapper .block-minicart');
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
