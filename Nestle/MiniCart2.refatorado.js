(function () {
  'use strict';

  let progressInitialized = false;
  let cartSubscriptionAdded = false;
  let listenersAdded = false;
  let pollingTimer = null;
  let pollingCount = 0;

  const FREE_SHIPPING_THRESHOLD = 399.0;
  const MAX_POLLS = 30;
  const POLL_INTERVAL_MS = 1000;
  const STYLE_ID = 'custom-minicart2-style';

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
      ".page-header .minicart-wrapper .block-minicart .block-content { padding: 32px 0px 0px; background-color: #fff; border-radius: 0px 0px 0px 20px; }",
      ".page-header .minicart-wrapper .block-minicart .items-total { display: none; }",
      ".page-header .minicart-wrapper .block-minicart .block-content .subtotal { position: absolute; bottom: 230px; font-size: 24px; width: 100%; text-align: left; left: 0px; display: flex; align-items: center; justify-content: space-between; padding: 0px 40px; box-sizing: border-box; z-index: 2; }",
      ".page-header .minicart-wrapper .block-minicart .block-content .subtotal span.label { margin: 0px; }",
      ".page-header .minicart-wrapper .block-minicart .amount .price-wrapper:first-child .price { font-size: 24px; }",
      ".page-header .minicart-items-wrapper { border: none; margin: 0px; padding: 0px; max-height: 100% !important; height: 85dvh !important; }",
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
      ".page-header .block-minicart .block-content>.actions:last-child { bottom: 80px; background-color: #fff; position: absolute; height: 197px; display: table; width: 100%; left: 0px; max-width: 472px; padding: 24px 40px 40px; box-sizing: border-box; z-index: 1; border-radius: 20px 0px 0px; }",
      ".page-header .minicart-wrapper .block-minicart .block-content>.actions>.primary .action.primary.checkout { display: none; }",
      ".page-header .block-minicart .block-content>.actions:nth-child(6) { position: absolute; bottom: 120px; right: 0px; display: table; z-index: 2; width: 100%; max-width: 100%; padding: 0px 40px; box-sizing: border-box; }",
      ".page-header .minicart-wrapper .action.viewcart { margin: 0px auto; border: none; font-size: 18px; line-height: 20px; width: auto; padding: 0px; display: none; }",
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
      ".page-header .minicart-wrapper .actions .secondary { text-align: center; }",
      ".page-header .block-minicart .block-content>.actions:last-child .custom-cart-buttons { display: flex; flex-direction: column; gap: 0px; }",
      "@media screen and (max-width: 580px) { .page-header .minicart-wrapper .block-minicart { max-width: 100%; height: 100%; top: unset; bottom: 0px; border-radius: 0px; } .page-header .minicart-wrapper .block-minicart .block-title { padding: 24px; border-radius: 0px; } .page-header .minicart-items { height: 59dvh; padding: 0px 24px; } .page-header .minicart-items .product-item { padding: 24px 0px !important; } .page-header .minicart-items .product-item-name { max-width: 192px; } .page-header .block-minicart .block-content>.actions:last-child { max-width: 100%; bottom: 160px; padding: 24px 24px 40px; border-radius: 0px; } .page-header .block-minicart .block-content>.actions:nth-child(6) { bottom: 200px; } .page-header .minicart-wrapper .block-minicart .block-content .subtotal { bottom: 310px; font-size: 20px; } .page-header .minicart-wrapper .block-minicart .amount .price-wrapper:first-child .price { font-size: 20px; } .page-header .minicart-wrapper .block-minicart:before { right: 0px !important; } .page-header .minicart-items-wrapper { height: 100dvh !important; } }"
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
    const viewCartLink = $('.minicart-wrapper .actions .secondary .action.viewcart');

    if (viewCartLink.length && !viewCartLink.next('.custom-continue-shopping-btn').length) {
      const continueBtn = '<button class="custom-continue-shopping-btn" type="button">Continuar comprando</button>';
      viewCartLink.after(continueBtn);
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

  function applyMiniCartCustomizations($, customerData) {
    createProgressBar($);
    updateProgressBar($, customerData);
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
