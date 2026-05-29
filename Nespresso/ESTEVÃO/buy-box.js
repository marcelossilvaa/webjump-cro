(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const STYLE_ID = 'cro-buy-box-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '.cro-buy-box { font-family: NespressoLucas, sans-serif; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; margin-top: 10px; }' +
      '.cro-buy-box .subscription-option { border: 1px solid #ccc; border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.2s ease; background-color: #fff; }' +
      '.cro-buy-box .subscription-option.selected { border-color: #9d7c4f; background-color: #fcfaf8; }' +
      '.cro-buy-box .option-header { display: flex; justify-content: space-between; align-items: center; }' +
      '.cro-buy-box .option-left { display: flex; align-items: center; gap: 10px; }' +
      '.cro-buy-box .custom-radio { width: 18px; height: 18px; border: 2px solid #ccc; border-radius: 50%; display: flex; justify-content: center; align-items: center; background-color: #fff; }' +
      '.cro-buy-box .subscription-option.selected .custom-radio { border-color: #267e52; border-width: 2px; }' +
      '.cro-buy-box .subscription-option.selected .custom-radio::after { content: ""; width: 10px; height: 10px; background-color: #267e52; border-radius: 50%; display: block; }' +
      '.cro-buy-box .subscription-option[data-option="subscription"] .custom-radio { border-color: #267e52; }' + 
      '.cro-buy-box .option-label { font-weight: 500; font-size: 16px; color: #333; }' +
      '.cro-buy-box .subscription-badge { color: #fff; background-color: #333; font-weight: 700; margin-left: 5px; padding: 2px 6px; border-radius: 12px; font-size: 12px; }' +
      '.cro-buy-box .option-price { font-weight: 700; font-size: 16px; color: #267e52; }' +
      '.cro-buy-box .subscription-details { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e1e1e1; }' +
      '.cro-buy-box .frequency-select { width: 100%; padding: 10px 15px; border: 1px solid #ccc; border-radius: 20px; font-size: 14px; background-color: #fff; outline: none; margin-bottom: 15px; font-family: NespressoLucas, sans-serif; cursor: pointer; }' +
      '.cro-buy-box .subscription-benefits { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }' +
      '.cro-buy-box .subscription-benefits li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #333; }' +
      '.cro-buy-box .benefit-check { width: 16px; height: 16px; background-color: #267e52; border-radius: 50%; display: flex; justify-content: center; align-items: center; position: relative; flex-shrink: 0; }' +
      '.cro-buy-box .benefit-check::after { content: ""; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }' +
      '.cro-buy-box .subscription-benefits li strong { font-weight: 700; }' +
      '/* hide original elements */' +
      '.cb-shop > .cb-price, .primePDP { display: none !important; }' +
      '.cb-shop { border-top: none !important; padding-top: 0 !important; }' +
      '.cro-buy-box-cta-subscription { margin-top: 15px !important; width: 100% !important; cursor: pointer; transition: opacity 0.2s; }' +
      '.cro-buy-box-cta-subscription:hover { opacity: 0.9; }';
    document.head.appendChild(style);
  }

  function createWidgetHTML() {
    return '<div class="custom-subscription-widget-wrapper cro-buy-box">' +
      '<div class="subscription-option" data-option="subscription">' +
        '<div class="option-header">' +
          '<div class="option-left">' +
            '<div class="custom-radio"></div>' +
            '<div class="option-label">' +
              'Assine e economize' +
              '<span class="subscription-badge">(-10%)</span>' +
            '</div>' +
          '</div>' +
          '<div class="option-price" id="cro-subscription-price"></div>' +
        '</div>' +
        '<div class="subscription-details">' +
          '<div class="delivery-frequency">' +
            '<select class="frequency-select">' +
              '<option value="30" selected>Entregar a cada 30 dias</option>' +
              '<option value="45">Entregar a cada 45 dias</option>' +
              '<option value="60">Entregar a cada 60 dias</option>' +
              '<option value="75">Entregar a cada 75 dias</option>' +
              '<option value="90">Entregar a cada 90 dias</option>' +
              '<option value="120">Entregar a cada 120 dias</option>' +
              '<option value="180">Entregar a cada 180 dias</option>' +
            '</select>' +
          '</div>' +
          '<ul class="subscription-benefits">' +
            '<li>' +
              '<span class="benefit-check"></span>' +
              '<span><strong>10% OFF</strong> e Frete Grátis acima de 30 caps</span>' +
            '</li>' +
            '<li>' +
              '<span class="benefit-check"></span>' +
              '<span>Altere ou cancele a qualquer momento</span>' +
            '</li>' +
            '<li>' +
              '<span class="benefit-check"></span>' +
              '<span>Zero mensalidade</span>' +
            '</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="subscription-option selected" data-option="onetime">' +
        '<div class="option-header">' +
          '<div class="option-left">' +
            '<div class="custom-radio"></div>' +
            '<div class="option-label">Compra única:</div>' +
          '</div>' +
          '<div class="option-price" id="cro-onetime-price"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function initWidget() {
    const cbShop = document.querySelector('.cb-shop');
    if (!cbShop) return;

    if (document.querySelector('.cro-buy-box')) return;

    const originalPriceEl = document.querySelector('.cb-price-current span');
    const primePriceEl = document.querySelector('.precoCaixaPrime');
    const originalAddToCart = document.querySelector('nb-add-to-cart');

    if (!originalPriceEl || !originalAddToCart) {
      return; 
    }

    const onetimePrice = originalPriceEl.textContent.trim();
    const subPrice = primePriceEl ? primePriceEl.textContent.trim() : onetimePrice;

    // Create container
    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = createWidgetHTML();
    const widget = widgetContainer.firstElementChild;

    // Insert prices
    widget.querySelector('#cro-onetime-price').textContent = onetimePrice;
    widget.querySelector('#cro-subscription-price').textContent = subPrice;

    // Insert widget before the Add to Cart button
    cbShop.insertBefore(widget, originalAddToCart);

    // Create Subscription Link Button based on original CTA
    const originalBtn = originalAddToCart.querySelector('button');
    const ctaSubscription = document.createElement('button');
    ctaSubscription.onclick = function() { window.location.href = '/br/pt/myaccount/standing-orders#/orders/list'; };
    ctaSubscription.style.display = 'none'; // Hidden by default

    if (originalBtn) {
      ctaSubscription.className = originalBtn.className + ' cro-buy-box-cta-subscription';
      ctaSubscription.innerHTML = originalBtn.innerHTML;
      
      const label = ctaSubscription.querySelector('.AddToBagButtonLarge__label');
      if (label) label.textContent = 'ASSINAR AGORA';

      // Hide bag and plus icons to match reference
      const bagIcon = ctaSubscription.querySelector('.AddToBagButtonLarge__basketIcon');
      if (bagIcon) bagIcon.style.display = 'none';
      
      const plusIcon = ctaSubscription.querySelector('.AddToBagButtonLarge__plusIcon');
      if (plusIcon) plusIcon.style.display = 'none';
      
      // Ensure proper centering and border radius based on image
      ctaSubscription.style.justifyContent = 'center';
      ctaSubscription.style.borderRadius = '24px';
    } else {
      ctaSubscription.className = 'cro-buy-box-cta-subscription';
      ctaSubscription.textContent = 'ASSINAR AGORA';
      ctaSubscription.style.backgroundColor = '#267e52';
      ctaSubscription.style.color = '#fff';
      ctaSubscription.style.height = '48px';
      ctaSubscription.style.borderRadius = '24px';
      ctaSubscription.style.border = 'none';
      ctaSubscription.style.fontWeight = 'bold';
    }

    // Insert Subscription Link right after the Add to Cart component
    originalAddToCart.parentNode.insertBefore(ctaSubscription, originalAddToCart.nextSibling);

    const options = widget.querySelectorAll('.subscription-option');
    
    // Add logic to switch options
    options.forEach(function(opt) {
      opt.addEventListener('click', function() {
        // Remove selected
        options.forEach(function(o) { o.classList.remove('selected'); });

        // Add selected
        this.classList.add('selected');

        if (this.getAttribute('data-option') === 'subscription') {
          // Show subscription CTA, hide normal CTA
          originalAddToCart.setAttribute('style', 'display: none !important;');
          ctaSubscription.style.display = ''; // fallback to class default
        } else {
          // Hide subscription CTA, show normal CTA
          originalAddToCart.setAttribute('style', '');
          ctaSubscription.style.display = 'none';
        }
      });
    });
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      initWidget();
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    injectStyles();
    run();
    
    // Set up observer to handle DOM updates (e.g. price updates)
    const observer = new MutationObserver(function (mutations) {
      if (document.querySelector('.cro-buy-box')) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, 300);
    });

    const targetNode = document.querySelector('.cb-content') || document.body;
    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();