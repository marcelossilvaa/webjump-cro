(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let retryCount = 0;
  let viewTracked = false;

  const STYLE_ID = 'wj-remodelagem-pdp-style';
  const ROOT_SELECTOR = '.product-main-section';
  const ROOT_ATTR = 'data-wj-remodelagem-pdp';
  const TRACKING_ATTR = 'data-wj-remodelagem-tracking-added';
  const OBSERVER_KEY = '_wjRemodelagemPdpObserver';
  const MAX_RETRIES = 40;
  const RETRY_DELAY = 250;
  const OBSERVER_DELAY = 200;
  const TRACKING_CATEGORY = 'remodelagem_pdp_333';

  function getStyles() {
    return [
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] { width: 100% !important; margin: 0 auto !important; padding: 0 0 28px !important; box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; color: #141b2d; background: #ffffff; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] *, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] *::before, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] *::after { box-sizing: border-box; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .page-title { margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .page-title .base { display: block !important; color: #141b2d !important; font-size: 24px !important; font-weight: 800 !important; line-height: 1.16 !important; letter-spacing: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-pdp-meta-row { display: flex !important; align-items: center; flex-wrap: wrap; gap: 6px 20px; margin-top: 8px; color: #697386; font-size: 11px; line-height: 1.3; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-brand-container { margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-brand { color: #697386 !important; font-size: 14px !important; line-height: 1.3 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-brand a { color: #0054bd !important; font-weight: 700 !important; text-decoration: underline !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-pdp-meta-row .product.attribute.sku { display: inline-flex !important; align-items: center; gap: 4px; margin: 0 !important; color: #697386 !important; font-size: 14px !important; line-height: 1.3 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-pdp-meta-row .product.attribute.sku .type { color: #697386 !important; font-size: 14px !important; font-weight: 700 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-pdp-meta-row .product.attribute.sku .type::after { content: ":"; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-pdp-meta-row .product.attribute.sku .value { color: #697386 !important; font-size: 14px !important; font-weight: 700 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wk-ap-price-block, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-social-links, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .show-modal-product, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product.attribute.overview, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .modal-information { display: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-price-wrapper { width: 100% !important; display: flex !important; flex-direction: column !important; align-items: stretch !important; justify-content: flex-start !important; gap: 14px !important; margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller { width: 100% !important; height: auto !important; min-height: 136px !important; padding: 12px 14px !important; border: 1px solid #e1e5ea !important; border-radius: 6px !important; background: #ffffff !important; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.14) !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .winning-title { display: flex !important; align-items: flex-start; flex-wrap: nowrap; justify-content: space-between; gap: 8px; margin: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-container, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-title { display: block !important; flex: 1 1 130px; min-width: 0; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest { display: inline-flex !important; align-items: center; min-height: 17px; padding: 5px 9px !important; border-radius: 4px !important; background: #13a538 !important; color: #ffffff !important; font-size: 12px !important; font-weight: 800 !important; line-height: 1 !important; text-transform: uppercase !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .winner-store-img { display: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-store { display: block !important; width: min(190px, 100%); margin-top: 6px !important; overflow: hidden; color: #202938 !important; font-size: 14px !important; font-weight: 700 !important; line-height: 1.25 !important; text-overflow: ellipsis; white-space: normal; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .wj-winning-side { flex: 0 0 auto; display: flex !important; flex-direction: column !important; align-items: flex-end !important; justify-content: flex-start !important; max-width: 155px; margin-left: auto !important; padding-top: 2px; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .wj-region-note { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: flex-end; gap: 5px; margin-left: 0 !important; color: #3f4b5f; font-size: 10px; font-weight: 700; line-height: 1.2; text-align: right; white-space: nowrap; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        "=\"true\"] .pdp-winning-seller .wj-region-note::before { content: \"\"; width: 16px; height: 16px; display: inline-block; background: #13a538; -webkit-mask: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-1.1-6.1-3.6-3.6 1.4-1.4 2.2 2.2 4.7-4.7 1.4 1.4-6.1 6.1Z'/%3E%3C/svg%3E\") center / contain no-repeat; mask: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-1.1-6.1-3.6-3.6 1.4-1.4 2.2 2.2 4.7-4.7 1.4 1.4-6.1 6.1Z'/%3E%3C/svg%3E\") center / contain no-repeat; }",
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-review { flex: 0 0 auto; display: flex !important; align-items: center; justify-content: flex-end; gap: 5px; width: 100%; margin: 8px 0 0 !important; color: #697386 !important; font-size: 14px !important; white-space: nowrap; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-review .icon-star-full, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-review .rating-note { color: #ff5a14 !important; font-size: 14px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .cheapest-review .rating-qty a { color: #697386 !important; font-size: 14px !important; text-decoration: underline !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .winning-seller-price { margin-top: 10px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .tier-price { display: flex !important; align-items: center !important; gap: 8px !important; color: #9aa3af !important; font-size: 14px !important; line-height: 1.3 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .winning-seller-price .tier-price-info { font-size: 14px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .winning-seller-price .tier-price-info .tier-price-percent { display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 3px 7px !important; border-radius: 3px !important; background-color: #e9fff1 !important; color: #13a538 !important; font-size: 14px !important; font-weight: 800 !important; line-height: 1 !important; white-space: nowrap !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .tier-price-cut { color: #9aa3af !important; text-decoration: line-through !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .wj-discount-badge { display: inline-flex !important; align-items: center; justify-content: center; min-height: 18px; padding: 3px 7px !important; border-radius: 3px !important; background: #e9fff1 !important; color: #13a538 !important; font-size: 14px !important; font-weight: 800 !important; line-height: 1 !important; white-space: nowrap; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .price-container { display: flex !important; align-items: flex-end !important; gap: 6px !important; margin-top: 2px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .price { color: #141b2d !important; font-size: 28px !important; font-weight: 800 !important; line-height: 1 !important; letter-spacing: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .price-label { margin: 0 0 3px !important; color: #697386 !important; font-size: 14px !important; line-height: 1.2 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .wj-payment-note { display: inline-flex !important; align-items: center; justify-content: flex-start; width: max-content; max-width: 100%; min-height: 30px; background: #ffffff !important; color: #0054bd !important; font-size: 13px !important; font-weight: 700 !important; line-height: 1.1 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-compare-title, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-native-compare-title { display: block !important; width: 100% !important; margin: 0px 0 -2px !important; padding: 0 0 8px !important; border: 0 !important; border-bottom: 2px solid #ff5a14 !important; color: #202938 !important; font-size: 18px !important; font-weight: 800 !important; line-height: 1.2 !important; background: transparent !important; box-shadow: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price { width: 100% !important; margin: 0 !important; padding: 0 !important; gap: 5px; display: flex; flex-direction: column;}',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .expensive-sellers { display: flex !important; align-items: stretch !important; justify-content: flex-start !important; flex-wrap: wrap !important; gap: 8px !important; width: 100% !important; margin: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .seller-box { min-width: 0 !important; min-height: 72px !important; padding: 8px !important; border: 1px solid #e2e7ef !important; border-radius: 5px !important; background: #fcf8f6 !important; box-shadow: none !important; overflow: hidden !important; width: 31.5% !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .box-header { display: flex !important; justify-content: space-between !important; align-items: center !important; min-height: 16px !important; margin: 0 0 5px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .percent-tag { display: inline-flex !important; align-items: center; justify-content: center; min-height: 16px; padding: 2px 5px !important; border-radius: 3px !important; background: #ff1d1d !important; color: #ffffff !important; font-size: 9px !important; font-weight: 800 !important; line-height: 1 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .seller-name { display: block !important; overflow: hidden; color: #394150 !important; font-size: 12px !important; font-weight: 800 !important; line-height: 1.15 !important; text-overflow: ellipsis; white-space: nowrap; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .box-price { color: #111827 !important; font-size: 14px !important; font-weight: 800 !important; line-height: 1.2 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .custom-price-see-more { display: flex !important; align-items: center !important; justify-content: flex-start !important; width: auto !important; height: auto !important; min-height: 0 !important; padding: 0 !important; border: 0 !important; background: transparent !important; box-shadow: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .see-more-btn:not([class*="fixed-"]) { display: inline-flex !important; align-items: center !important; gap: 5px !important; width: auto !important; height: auto !important; margin: 0 !important; padding: 0 !important; border: 0 !important; background: transparent !important; color: #0054bd !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .see-more-btn:not([class*="fixed-"]) .see-more-link { color: #0054bd !important; font-size: 14px !important; font-weight: 700 !important; line-height: 1.2 !important; text-decoration: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .custom-price .see-more-btn:not([class*="fixed-"]) .icon-arrow-next { color: #0054bd !important; font-size: 10px !important; transform: rotate(90deg); }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-price-container { width: 100% !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form form, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .box-tocart { width: 100% !important; margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .fieldset { display: flex !important; flex-direction: column !important; gap: 8px !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .field.qty { order: 1; width: 100% !important; margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .field.qty .label { display: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .field.qty .control { display: flex !important; gap: 0 !important; width: 100% !important; min-height: 52px !important; align-items: center !important; padding: 6px 14px !important; border: 1px solid #d4d9e2 !important; border-radius: 8px !important; background: #ffffff !important; box-shadow: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .product-item-qty-btn { flex: 0 0 34px !important; width: 34px !important; height: 34px !important; min-width: 34px !important; border: 0 !important; border-radius: 7px !important; background: #ff5a14 !important; color: #ffffff !important; font-size: 20px !important; font-weight: 800 !important; line-height: 1 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .product-item-qty-btn[disabled] { background: #ffe4d8 !important; color: #ff8a63 !important; opacity: 1 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form input.qty { flex: 1 1 auto !important; width: auto !important; height: 34px !important; min-height: 34px !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; color: #111827 !important; font-size: 16px !important; font-weight: 800 !important; text-align: center !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .actions { order: 2; width: 100% !important; margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #product-addtocart-button:not([class*="fixed-"]), ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #product-buynow-button:not([class*="fixed-"]), ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #buy-via-whatsapp:not([class*="fixed-"]) { width: 100% !important; min-height: 40px !important; margin: 0 !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 800 !important; line-height: 1.2 !important; text-transform: none !important; letter-spacing: 0 !important; box-shadow: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #product-addtocart-button:not([class*="fixed-"]) { background: #ff5a14 !important; border: 1px solid #ff5a14 !important; color: #ffffff !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #product-buynow-button:not([class*="fixed-"]) { order: 3; background: #ffffff !important; border: 1px solid #ff5a14 !important; color: #394150 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #buy-via-whatsapp:not([class*="fixed-"]) { order: 4; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; background: #24a944 !important; border: 1px solid #24a944 !important; color: #ffffff !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] #buy-via-whatsapp:not([class*="fixed-"]) .buy-via-whatsapp-icon { width: 18px !important; height: 18px !important; margin: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-shipping-title, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-native-shipping-title { display: block !important; margin: 0 0 10px !important; padding: 0 !important; border: 0 !important; color: #202938 !important; font-size: 14px !important; font-weight: 800 !important; line-height: 1.2 !important; background: transparent !important; box-shadow: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-additional-wrapper .overlay, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-additional-wrapper .modal-trigger, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-additional-wrapper .action-close { display: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-additional-container { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; border: 0 !important; background: transparent !important; box-shadow: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-additional { width: 100% !important; margin: 0 !important; padding: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title { display: flex !important; gap: 8px !important; margin: 0 0 5px !important; padding: 0 !important; width: 100% !important; align-items: stretch !important;         height: auto !important;}',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method { position: static !important; float: none !important; transform: none !important; flex: 1 1 0 !important; width: auto !important; height: 40px !important; min-height: 40px !important; display: flex !important; align-items: center !important; justify-content: center !important; margin: 0 !important; padding: 0 14px !important; border: 1px solid #e1e5ea !important; border-radius: 4px !important; background: #ffffff !important; color: #394150 !important; box-shadow: 0 2px 9px rgba(15, 23, 42, 0.12) !important; cursor: pointer; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method[data-bind*="to_pickup"] { order: 1; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method[data-bind*="to_receive"] { order: 2; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method.active { background: #0054bd !important; border-color: #0054bd !important; color: #ffffff !important; overflow: hidden !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method.active::before, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method.active::after { display: none !important; content: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method.active * { background: transparent !important; color: #ffffff !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method input { display: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-title .shipping-method label { margin: 0 !important; border: 0 !important; background: transparent !important; box-shadow: none !important; color: inherit !important; font-size: 13px !important; font-weight: 800 !important; line-height: 1 !important; cursor: pointer; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-shipping { border: 0 !important; padding: 0 !important; margin: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .shipping-actions, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information { padding: 0 !important; margin: 0 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .shipping-actions { margin: 0 0 14px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .shipping-actions .title { margin: 0 0 8px !important; color: #394150 !important; font-size: 14px !important; font-weight: 500 !important; line-height: 1.3 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .shipping-actions .address-box { width: 100% !important; min-height: 38px !important; display: flex !important; align-items: center !important; padding: 9px 14px !important;  max-width: initial !important; border: 1px solid #d7dde8 !important; border-radius: 7px !important; background: #ffffff !important; box-shadow: 0 3px 10px rgba(15, 23, 42, 0.14) !important; color: #697386 !important; font-size: 14px !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .shipping-actions .divider { display: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .shipping-item { display: flex !important; align-items: flex-start !important; gap: 8px !important; margin: 8px 0 !important; padding: 0 !important; color: #394150 !important; line-height: 1.25 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .shipping-item[style*="display: none"] { display: flex !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .shipping-item img { width: 25px !important; height: 25px !important; min-width: 16px !important; object-fit: contain !important; filter: grayscale(1) contrast(1.2) !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .shipping-item span { font-size: 14px !important; line-height: 1.25 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .shipping-item strong, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .delivery-time { color: #18a957 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-shipping-information .flag-express strong { color: #f41818 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods { margin: 30px 0 0 !important; padding: 0 !important; background: transparent !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods h2 { margin: 0 0 14px !important; padding: 0 0 14px !important; border: 0 !important; border-bottom: 2px solid #ff5a14 !important; color: #202938 !important; font-size: 18px !important; font-weight: 800 !important; line-height: 1.2 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods h2 span, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods h2 strong { color: #202938 !important; font-size: inherit !important; font-weight: inherit !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods ul { display: flex !important; flex-direction: column !important; gap: 18px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods li { margin: 0 !important; padding: 0 !important; list-style: none !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods li > div { display: flex !important; align-items: flex-start !important; gap: 14px !important; color: #202938 !important; font-size: 14px !important; line-height: 1.25 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods li > div > div { color: #202938 !important; font-size: 14px !important; font-weight: 800 !important; line-height: 1.25 !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods img { width: 18px !important; height: 18px !important; min-width: 18px !important; margin-top: 1px !important; object-fit: contain !important; filter: grayscale(1) contrast(1.1) !important; }',
      ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods li span { display: block !important; margin-top: 4px !important; color: #8b8f98 !important; font-size: 13px !important; font-weight: 500 !important; line-height: 1.25 !important; }',
      '.wj-floating-whatsapp { position: fixed; right: 22px; bottom: 75px; z-index: 2147483000; display: inline-flex !important; align-items: center; justify-content: center; width: 52px !important; height: 52px !important; min-width: 52px !important; min-height: 52px !important; padding: 0 !important; border: 1px solid #24a944 !important; border-radius: 50% !important; background: #24a944 !important; color: #ffffff !important; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.22) !important; line-height: 1 !important; text-decoration: none !important; cursor: pointer; transform: scale(1); transition: transform 160ms ease, box-shadow 160ms ease; animation: wj-whatsapp-pulse 1.8s ease-in-out infinite; }',
      '.wj-floating-whatsapp:hover { transform: scale(1.08); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.28) !important; }',
      '.wj-floating-whatsapp img, .wj-floating-whatsapp .buy-via-whatsapp-icon { width: 24px !important; height: 24px !important; min-width: 24px !important; margin: 0 !important; object-fit: contain !important; }',
      '.catalog-product-view #buy-via-whatsapp.fixed-wspp-button { gap: 4px !important; }',
      '#text-1454703450633 { font-size: 14px !important; }',
      '@keyframes wj-whatsapp-pulse { 0% { box-shadow: 0 0 0 0 rgba(36, 169, 68, 0.42), 0 8px 20px rgba(15, 23, 42, 0.22); } 70% { box-shadow: 0 0 0 12px rgba(36, 169, 68, 0), 0 8px 20px rgba(15, 23, 42, 0.22); } 100% { box-shadow: 0 0 0 0 rgba(36, 169, 68, 0), 0 8px 20px rgba(15, 23, 42, 0.22); } }',
      '@media (max-width: 1100px) and (min-width: 900px) { ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] { padding-left: 18px !important; padding-right: 18px !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .page-title .base { font-size: 23px !important; } }',
      '@media (max-width: 899px) { ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] { padding: 0 !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .page-title .base { font-size: 22px !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-price-wrapper { margin-top: 10px !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .field.qty .control { flex-wrap: nowrap !important; overflow: hidden !important; padding: 6px 10px !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form .product-item-qty-btn { flex: 0 0 34px !important; position: static !important; top: auto !important; right: auto !important; left: auto !important; margin: 0 !important; transform: none !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-add-form input.qty { flex: 1 1 0 !important; width: 1% !important; min-width: 0 !important; max-width: none !important; padding: 0 8px !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product.media .gallery-placeholder { height: 100% !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product.media .fotorama__stage { width: 100% !important; height: 100% !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot { display: block !important; width: 100% !important; height: auto !important; max-height: none !important; max-width: initial !important; margin: 8px 0 0 !important; padding: 0 !important; position: static !important; opacity: 1 !important; visibility: visible !important; overflow: visible !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .product-info-additional-wrapper[data-wj-mobile-shipping-source="true"] { display: none !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .product-info-additional, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .product-info-shipping { display: block !important; height: auto !important; max-height: none !important; max-width: initial !important; opacity: 1 !important; visibility: visible !important; overflow: visible !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .pdp-shipping-title { display: flex !important; margin: 0 0 5px !important; height: auto !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .shipping-actions { margin: 0 !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .pdp-payment-methods { display: none !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .wj-shipping-title, ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .wj-mobile-shipping-slot .wj-native-shipping-title { display: block !important; margin: 0 0 10px !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .sellers-carousel-content { display: none !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-winning-seller .wj-winning-side { margin-left: auto !important; } ' +
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .pdp-payment-methods { margin-top: 28px !important; } .wj-floating-whatsapp { right: 16px; bottom: 75px; width: 50px !important; height: 50px !important; min-width: 50px !important; min-height: 50px !important; padding: 0 !important; } }',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function getText(element) {
    if (!element) return '';
    return (element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function getNormalizedText(element) {
    return getText(element).toLowerCase();
  }

  function isMobileViewport() {
    if (window.matchMedia) {
      return window.matchMedia('(max-width: 899px)').matches;
    }

    return window.innerWidth <= 899;
  }

  function setTextIfChanged(element, text) {
    if (element && element.textContent !== text) {
      element.textContent = text;
    }
  }

  function setFirstTextNodeIfChanged(element, text) {
    const nodes = element ? Array.prototype.slice.call(element.childNodes || []) : [];
    const textNode = nodes.filter(function (node) {
      return node.nodeType === 3;
    })[0];

    if (textNode) {
      if (textNode.nodeValue !== text) {
        textNode.nodeValue = text;
      }

      return;
    }

    if (element) {
      element.insertBefore(document.createTextNode(text), element.firstChild);
    }
  }

  function getMainElement(selector, scope) {
    const parent = scope || document;
    const elements = Array.prototype.slice.call(parent.querySelectorAll(selector));

    return (
      elements.filter(function (element) {
        return element.className.indexOf('fixed-') === -1;
      })[0] || null
    );
  }

  function getMainButton(selector, scope) {
    return getMainElement(selector, scope);
  }

  function getMainCompareLink() {
    const button = getMainElement('.custom-price .see-more-btn');

    return button ? button.querySelector('.see-more-link') : null;
  }

  function getPriceValue(text) {
    const cleanText = String(text || '')
      .replace(/[^0-9,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const value = parseFloat(cleanText);

    return Number.isFinite(value) ? value : 0;
  }

  function getDiscountPercent(originalPrice, finalPrice) {
    if (!originalPrice || !finalPrice || finalPrice >= originalPrice) return 0;

    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  }

  function removeElements(elements) {
    elements.forEach(function (element) {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }

  function removePropertyFromRules(rules, selector, propertyName) {
    Array.prototype.slice.call(rules || []).forEach(function (rule) {
      let nestedRules = null;

      try {
        nestedRules = rule.cssRules;
      } catch (error) {
        nestedRules = null;
      }

      if (nestedRules) {
        removePropertyFromRules(nestedRules, selector, propertyName);
      }

      if (rule.selectorText && rule.selectorText.indexOf(selector) > -1 && rule.style) {
        rule.style.removeProperty(propertyName);
      }
    });
  }

  function removeNativeLayoutLimits() {
    const propertyName = 'max' + '-width';
    const wrapper = document.querySelector('.product-info-additional-wrapper');
    const shipping = document.querySelector('.product-info-shipping');

    Array.prototype.slice.call(document.styleSheets || []).forEach(function (styleSheet) {
      let rules = null;

      try {
        rules = styleSheet.cssRules;
      } catch (error) {
        rules = null;
      }

      if (rules) {
        removePropertyFromRules(
          rules,
          '.product-main-section .product-info-additional-wrapper',
          propertyName,
        );
        removePropertyFromRules(
          rules,
          '.product-main-section .product-info-additional .product-info-shipping',
          propertyName,
        );
        removePropertyFromRules(
          rules,
          '.product-main-section .product-info-additional .product-info-shipping',
          'border',
        );
      }
    });

    if (wrapper && wrapper.style) {
      wrapper.style.removeProperty(propertyName);
    }

    if (shipping && shipping.style) {
      shipping.style.removeProperty(propertyName);
      shipping.style.removeProperty('border');
      shipping.style.setProperty(propertyName, 'none', 'important');
      shipping.style.setProperty('border', '0', 'important');
    }
  }

  function normalizeGallerySizing() {
    if (!isMobileViewport()) return;

    const placeholders = Array.prototype.slice.call(
      document.querySelectorAll('.product.media .gallery-placeholder'),
    );
    const stages = Array.prototype.slice.call(
      document.querySelectorAll('.product.media .fotorama__stage'),
    );

    placeholders.forEach(function (placeholder) {
      if (!placeholder || !placeholder.style) return;

      placeholder.style.setProperty('height', '100%', 'important');
    });

    stages.forEach(function (stage) {
      if (!stage || !stage.style) return;

      stage.style.setProperty('height', '100%', 'important');
      stage.style.setProperty('width', '100%', 'important');
    });
  }

  function getOfferCount() {
    const compareText = getText(document.querySelector('.custom-price-see-more'));
    const availableText = getText(document.querySelector('.wk-ap-available-sellers'));
    const compareMatch = compareText.match(/(\d+)\s+loja/i);
    const availableMatch = availableText.match(/(\d+)/);

    if (compareMatch && compareMatch[1]) return compareMatch[1];
    if (availableMatch && availableMatch[1]) return String(Number(availableMatch[1]) + 1);

    return '';
  }

  function sendTrackingEvent(label, action) {
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
    if (viewTracked) return;

    viewTracked = true;
    sendTrackingEvent('visualizou_remodelagem_pdp', 'view');
  }

  function addTrackedClick(element, label) {
    if (!element || element.getAttribute(TRACKING_ATTR) === 'true') return;

    element.addEventListener('click', function () {
      sendTrackingEvent(label, 'click');
    });

    element.setAttribute(TRACKING_ATTR, 'true');
  }

  function addTrackingListeners() {
    const shippingMethods = document.querySelectorAll('.pdp-shipping-title .shipping-method');
    const qtyButtons = document.querySelectorAll('.product-add-form .product-item-qty-btn');

    addTrackedClick(getMainButton('#product-addtocart-button'), 'clicou_adicionar_ao_carrinho');
    addTrackedClick(getMainButton('#product-buynow-button'), 'clicou_comprar_agora');
    addTrackedClick(getMainButton('#buy-via-whatsapp'), 'clicou_comprar_whatsapp');
    addTrackedClick(getMainCompareLink(), 'clicou_ver_todas_as_ofertas');

    shippingMethods.forEach(function (method) {
      const isPickupMethod = getText(method).toLowerCase().indexOf('retirar') > -1;
      const label = isPickupMethod ? 'clicou_frete_retirar' : 'clicou_frete_receber';

      addTrackedClick(method, label);
    });

    qtyButtons.forEach(function (button) {
      const isMinusButton = button.className.indexOf('minus') > -1;
      const label = isMinusButton ? 'clicou_quantidade_menos' : 'clicou_quantidade_mais';

      addTrackedClick(button, label);
    });
  }

  function normalizeTexts() {
    const cheapestBadge = document.querySelector('.pdp-winning-seller .cheapest');
    const addToCartButton = getMainButton('#product-addtocart-button');
    const buyNowButton = getMainButton('#product-buynow-button');

    setTextIfChanged(cheapestBadge, 'MELHOR PRE\u00c7O');

    if (addToCartButton) {
      addToCartButton.querySelectorAll('span').forEach(function (span) {
        setTextIfChanged(span, 'Adicionar ao Carrinho');
      });
    }

    if (buyNowButton) {
      buyNowButton.querySelectorAll('span').forEach(function (span) {
        setTextIfChanged(span, 'Comprar agora');
      });
    }
  }

  function normalizePaymentMethods() {
    const title = document.querySelector('.pdp-payment-methods h2');
    const paymentLabels = Array.prototype.slice.call(
      document.querySelectorAll('.pdp-payment-methods li > div > div'),
    );

    setTextIfChanged(title, 'Formas de pagamento');

    paymentLabels.forEach(function (labelElement) {
      const text = getNormalizedText(labelElement);
      let label = '';

      if (text.indexOf('pix copia') > -1) {
        label = 'Pix';
      } else if (text.indexOf('cart') > -1 && text.indexOf('cr') > -1) {
        label = 'Cart\u00e3o de cr\u00e9dito \u00e0 vista ou parcelado';
      } else if (text.indexOf('pix no agendamento') > -1) {
        label = 'Pix na Entrega';
      }

      if (label) {
        setFirstTextNodeIfChanged(labelElement, label + ' ');
      }
    });
  }

  function ensureWinningDiscountBadge() {
    const tierPrice = document.querySelector('.pdp-winning-seller .tier-price');
    const tierPriceCut = tierPrice ? tierPrice.querySelector('.tier-price-cut') : null;
    const finalPriceElement = document.querySelector('.pdp-winning-seller .price');
    const originalPrice = getPriceValue(getText(tierPriceCut));
    const finalPrice = getPriceValue(getText(finalPriceElement));
    const discount = getDiscountPercent(originalPrice, finalPrice);
    let badge = tierPrice ? tierPrice.querySelector('.wj-discount-badge') : null;

    if (!tierPrice || !tierPriceCut || !discount) {
      removeElements(Array.prototype.slice.call(document.querySelectorAll('.wj-discount-badge')));
      return;
    }

    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'wj-discount-badge';
      badge.setAttribute('data-wj-remodelagem-node', 'true');
      tierPrice.appendChild(badge);
    }

    setTextIfChanged(badge, discount + '% OFF');
  }

  function ensureWinningPaymentNote() {
    const sellerPrice = document.querySelector('.pdp-winning-seller .winning-seller-price');
    const priceContainer = sellerPrice ? sellerPrice.querySelector('.price-container') : null;
    let note = sellerPrice ? sellerPrice.querySelector('.wj-payment-note') : null;

    if (!sellerPrice || !priceContainer) {
      removeElements(Array.prototype.slice.call(document.querySelectorAll('.wj-payment-note')));
      return;
    }

    if (!note) {
      note = document.createElement('div');
      note.className = 'wj-payment-note';
      note.setAttribute('data-wj-remodelagem-node', 'true');
    }

    if (note.parentElement !== sellerPrice || note.previousElementSibling !== priceContainer) {
      sellerPrice.insertBefore(note, priceContainer.nextSibling);
    }

    setTextIfChanged(note, 'Pagamento no cr\u00e9dito ou Pix');
  }

  function organizeTitleMeta() {
    const titleWrapper = document.querySelector('.page-title-wrapper.product');
    let brandContainer = null;
    const sku = document.querySelector(
      '.pdp-winning-seller .product.attribute.sku, .wj-pdp-meta-row .product.attribute.sku'
    );
    let metaRow = titleWrapper ? titleWrapper.querySelector('.wj-pdp-meta-row') : null;

    if (!titleWrapper) return;

    brandContainer = titleWrapper.querySelector('.product-brand-container');

    if (!metaRow) {
      metaRow = document.createElement('div');
      metaRow.className = 'wj-pdp-meta-row';
      metaRow.setAttribute('data-wj-remodelagem-node', 'true');
      titleWrapper.appendChild(metaRow);
    }

    if (brandContainer && brandContainer.parentElement !== metaRow) {
      metaRow.appendChild(brandContainer);
    }

    if (sku && sku.parentElement !== metaRow) {
      sku.setAttribute('data-wj-sku-moved', 'true');
      metaRow.appendChild(sku);
    }
  }

  function ensureRegionNote() {
    const winningTitle = document.querySelector('.pdp-winning-seller .winning-title');
    const review = winningTitle ? winningTitle.querySelector('.cheapest-review') : null;
    const count = getOfferCount();
    let sideColumn = winningTitle ? winningTitle.querySelector('.wj-winning-side') : null;
    let regionNote = winningTitle ? winningTitle.querySelector('.wj-region-note') : null;

    if (!winningTitle) return;

    if (!sideColumn) {
      sideColumn = document.createElement('div');
      sideColumn.className = 'wj-winning-side';
      sideColumn.setAttribute('data-wj-remodelagem-node', 'true');
      winningTitle.appendChild(sideColumn);
    }

    if (!regionNote) {
      regionNote = document.createElement('span');
      regionNote.className = 'wj-region-note';
      regionNote.setAttribute('data-wj-remodelagem-node', 'true');
    }

    if (regionNote.parentElement !== sideColumn) {
      sideColumn.appendChild(regionNote);
    }

    if (review && review.parentElement !== sideColumn) {
      sideColumn.appendChild(review);
    }

    const label = count === '1' ? 'loja' : 'lojas';
    let regionText = 'Oferta da sua regi\u00e3o';

    if (count) {
      regionText = 'Entre ' + count + ' ' + label + ' da sua regi\u00e3o';
    }

    setTextIfChanged(regionNote, regionText);
  }

  function ensureCompareTitle() {
    const customPrice = document.querySelector('.custom-price');
    const previous = customPrice ? customPrice.previousElementSibling : null;
    const hasCompareInside = Boolean(
      customPrice && getNormalizedText(customPrice).indexOf('compare pre') > -1,
    );
    const hasCompareBefore = Boolean(
      previous &&
      !previous.classList.contains('wj-compare-title') &&
      getNormalizedText(previous).indexOf('compare pre') > -1,
    );
    const nativeCompareTitle = hasCompareInside || hasCompareBefore;
    const injectedTitles = Array.prototype.slice.call(
      document.querySelectorAll('.wj-compare-title'),
    );
    let title = injectedTitles[0];

    if (!customPrice) return;

    if (nativeCompareTitle) {
      if (hasCompareBefore) {
        previous.classList.add('wj-native-compare-title');
      }

      removeElements(injectedTitles);
      return;
    }

    if (injectedTitles.length > 1) {
      removeElements(injectedTitles.slice(1));
    }

    if (previous && previous.classList.contains('wj-compare-title')) return;

    if (!title) {
      title = document.createElement('div');
      title.className = 'wj-compare-title';
      title.setAttribute('data-wj-remodelagem-node', 'true');
      title.textContent = 'Compare pre\u00e7os perto de voc\u00ea';
    }

    customPrice.parentNode.insertBefore(title, customPrice);
  }

  function organizeMainOrder() {
    const customPrice = document.querySelector('.custom-price');
    const purchaseContainer = document.querySelector('.product-info-price-container');
    const shippingWrapper = document.querySelector('.product-info-additional-wrapper');
    const shippingSlot = document.querySelector('.wj-mobile-shipping-slot');
    const next = customPrice ? customPrice.nextElementSibling : null;

    if (!customPrice || !purchaseContainer || !customPrice.parentNode) return;

    if (next === purchaseContainer) return;
    if (
      isMobileViewport() &&
      shippingSlot &&
      next === shippingSlot &&
      shippingSlot.nextElementSibling === purchaseContainer
    )
      return;
    if (
      isMobileViewport() &&
      shippingWrapper &&
      next === shippingWrapper &&
      shippingWrapper.nextElementSibling === purchaseContainer
    )
      return;

    customPrice.parentNode.insertBefore(purchaseContainer, next);
  }

  function removeMobileSellersCarousel() {
    if (!isMobileViewport()) return;

    removeElements(
      Array.prototype.slice.call(document.querySelectorAll('.sellers-carousel-content')),
    );
  }

  function normalizeQuantityControls() {
    const qtyControl = document.querySelector('.product-add-form .field.qty .control');
    const qtyInput = document.querySelector('.product-add-form input.qty');
    const qtyButtons = Array.prototype.slice.call(
      document.querySelectorAll('.product-add-form .product-item-qty-btn')
    );

    if (!qtyControl) return;

    qtyControl.style.setProperty('display', 'flex', 'important');
    qtyControl.style.setProperty('align-items', 'center', 'important');
    qtyControl.style.setProperty('flex-wrap', 'nowrap', 'important');
    qtyControl.style.setProperty('overflow', 'hidden', 'important');

    if (isMobileViewport()) {
      qtyControl.style.setProperty('padding', '6px 10px', 'important');
    }

    qtyButtons.forEach(function (button) {
      if (!button || !button.style) return;

      button.style.setProperty('position', 'static', 'important');
      button.style.setProperty('top', 'auto', 'important');
      button.style.setProperty('right', 'auto', 'important');
      button.style.setProperty('left', 'auto', 'important');
      button.style.setProperty('inset', 'auto', 'important');
      button.style.setProperty('transform', 'none', 'important');
      button.style.setProperty('margin', '0', 'important');
      button.style.setProperty('flex', '0 0 34px', 'important');
      button.style.setProperty('width', '34px', 'important');
      button.style.setProperty('min-width', '34px', 'important');
      button.style.setProperty('max-width', '34px', 'important');
    });

    if (qtyInput && qtyInput.style) {
      qtyInput.style.setProperty('flex', '1 1 0', 'important');
      qtyInput.style.setProperty('width', '1%', 'important');
      qtyInput.style.setProperty('min-width', '0', 'important');
      qtyInput.style.setProperty('max-width', 'none', 'important');
      qtyInput.style.setProperty('padding-left', '8px', 'important');
      qtyInput.style.setProperty('padding-right', '8px', 'important');
    }
  }

  function organizeMobileShipping() {
    const priceWrapper = document.querySelector('.product-info-price-wrapper');
    const purchaseContainer = document.querySelector('.product-info-price-container');
    const shippingWrapper = document.querySelector('.product-info-additional-wrapper');
    let existingSlot = null;
    const shippingContent = document.querySelector(
      '.wj-mobile-shipping-slot .product-info-additional, .product-info-additional-wrapper .product-info-additional'
    );
    let shippingSlot = existingSlot;

    if (priceWrapper) {
      existingSlot = priceWrapper.querySelector('.wj-mobile-shipping-slot');
      shippingSlot = existingSlot;
    }

    if (
      !isMobileViewport() ||
      !priceWrapper ||
      !purchaseContainer ||
      !shippingWrapper ||
      !shippingContent
    )
      return;

    if (purchaseContainer.parentElement !== priceWrapper) return;

    if (!shippingSlot) {
      shippingSlot = document.createElement('div');
      shippingSlot.className = 'wj-mobile-shipping-slot';
      shippingSlot.setAttribute('data-wj-remodelagem-node', 'true');
    }

    if (
      shippingSlot.parentElement !== priceWrapper ||
      shippingSlot.nextElementSibling !== purchaseContainer
    ) {
      priceWrapper.insertBefore(shippingSlot, purchaseContainer);
    }

    if (shippingContent.parentElement !== shippingSlot) {
      shippingSlot.appendChild(shippingContent);
    }

    shippingWrapper.setAttribute('data-wj-mobile-shipping-source', 'true');
    shippingSlot.setAttribute('data-wj-mobile-shipping', 'true');

    [
      shippingSlot,
      shippingContent,
      shippingContent.querySelector('.product-info-shipping'),
    ].forEach(function (element) {
      if (!element || !element.style) return;

      element.style.setProperty('display', 'block', 'important');
      element.style.setProperty('height', 'auto', 'important');
      element.style.setProperty('max-height', 'none', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('overflow', 'visible', 'important');
      element.style.setProperty('position', 'static', 'important');
      element.style.setProperty('inset', 'auto', 'important');
      element.style.setProperty('transform', 'none', 'important');
      element.style.setProperty('width', '100%', 'important');
      element.style.setProperty('max-width', 'initial', 'important');
    });

    const shippingTitle = shippingContent.querySelector('.pdp-shipping-title');

    if (shippingTitle && shippingTitle.style) {
      shippingTitle.style.setProperty('display', 'flex', 'important');
    }
  }

  function updateCompareLink() {
    const link = getMainCompareLink();
    const count = getOfferCount();
    const label = count === '1' ? 'loja' : 'lojas';

    if (!link) return;

    setTextIfChanged(
      link,
      count ? 'Ver todas as ofertas (' + count + ' ' + label + ')' : 'Ver todas as ofertas',
    );
  }

  function organizePurchaseArea() {
    const fieldset = document.querySelector('.product-add-form .fieldset');
    const qty = fieldset ? fieldset.querySelector('.field.qty') : null;
    const actions = fieldset ? fieldset.querySelector('.actions') : null;
    const buyNowButton = fieldset ? getMainButton('#product-buynow-button', fieldset) : null;
    const whatsappButton = getMainButton('#buy-via-whatsapp');

    if (!fieldset) return;

    if (qty && fieldset.firstElementChild !== qty) {
      fieldset.insertBefore(qty, fieldset.firstElementChild);
    }

    if (actions && qty && qty.nextElementSibling !== actions) {
      fieldset.insertBefore(actions, qty.nextElementSibling);
    }

    if (buyNowButton && actions && actions.nextElementSibling !== buyNowButton) {
      fieldset.insertBefore(buyNowButton, actions.nextElementSibling);
    }

    if (whatsappButton) {
      whatsappButton.setAttribute('type', 'button');

      if (buyNowButton && buyNowButton.nextElementSibling !== whatsappButton) {
        fieldset.insertBefore(whatsappButton, buyNowButton.nextElementSibling);
      } else if (!buyNowButton && whatsappButton.parentElement !== fieldset) {
        fieldset.appendChild(whatsappButton);
      }
    }

    fieldset.setAttribute('data-wj-purchase-organized', 'true');
  }

  function ensureShippingTitle() {
    const mobileSlot = document.querySelector('.wj-mobile-shipping-slot');
    const desktopWrapper = document.querySelector('.product-info-additional-wrapper');
    let targetParent = null;
    let insertBeforeNode = null;
    let scope = null;

    if (isMobileViewport()) {
      let shippingContent = null;

      if (mobileSlot) {
        shippingContent = mobileSlot.querySelector('.product-info-additional');
      }

      if (!mobileSlot || !shippingContent) return;

      targetParent = mobileSlot;
      insertBeforeNode = shippingContent;
      scope = mobileSlot;

      if (desktopWrapper) {
        removeElements(
          Array.prototype.slice.call(desktopWrapper.querySelectorAll('.wj-shipping-title'))
        );
      }
    } else {
      let container = null;

      if (desktopWrapper) {
        container = desktopWrapper.querySelector('.product-info-additional-container');
      }

      if (!desktopWrapper || !container) return;

      targetParent = desktopWrapper;
      insertBeforeNode = container;
      scope = desktopWrapper;

      if (mobileSlot) {
        removeElements(
          Array.prototype.slice.call(mobileSlot.querySelectorAll('.wj-shipping-title')),
        );
      }
    }

    const injectedTitles = Array.prototype.slice.call(scope.querySelectorAll('.wj-shipping-title'));
    const firstChild = scope.firstElementChild;
    let scopeText = getNormalizedText(scope);

    injectedTitles.forEach(function (injectedTitle) {
      scopeText = scopeText.replace(getNormalizedText(injectedTitle), '');
    });

    if (scopeText.indexOf('frete e prazo de entrega') > -1) {
      if (
        firstChild &&
        !firstChild.classList.contains('wj-shipping-title') &&
        getNormalizedText(firstChild).indexOf('frete e prazo de entrega') > -1
      ) {
        firstChild.classList.add('wj-native-shipping-title');
      }

      removeElements(injectedTitles);
      return;
    }

    if (injectedTitles.length > 1) {
      removeElements(injectedTitles.slice(1));
    }

    if (injectedTitles[0]) return;

    const title = document.createElement('div');
    title.className = 'wj-shipping-title';
    title.setAttribute('data-wj-remodelagem-node', 'true');
    title.textContent = 'Frete e prazo de entrega';
    targetParent.insertBefore(title, insertBeforeNode);
  }

  function ensureFloatingWhatsApp() {
    const nativeButton = getMainButton('#buy-via-whatsapp');
    let nativeIcon = null;
    let button = document.querySelector('.wj-floating-whatsapp');

    if (nativeButton) {
      nativeIcon = nativeButton.querySelector('img, .buy-via-whatsapp-icon');
    }

    if (!nativeButton) {
      removeElements(
        Array.prototype.slice.call(document.querySelectorAll('.wj-floating-whatsapp')),
      );
      return;
    }

    if (!button) {
      button = document.createElement('button');
      button.className = 'wj-floating-whatsapp';
      button.setAttribute('type', 'button');
      button.setAttribute('aria-label', 'Comprar pelo WhatsApp');
      button.setAttribute('data-wj-remodelagem-node', 'true');
      document.body.appendChild(button);
    }

    if (nativeIcon && !button.querySelector('img, .buy-via-whatsapp-icon')) {
      button.appendChild(nativeIcon.cloneNode(true));
    }

    removeElements(
      Array.prototype.slice.call(button.querySelectorAll('.wj-floating-whatsapp-text')),
    );

    if (button.getAttribute(TRACKING_ATTR) === 'true') return;

    button.addEventListener('click', function () {
      const currentNativeButton = getMainButton('#buy-via-whatsapp');

      sendTrackingEvent('clicou_whatsapp_flutuante', 'click');

      if (currentNativeButton) {
        currentNativeButton.click();
      }
    });

    button.setAttribute(TRACKING_ATTR, 'true');
  }

  function applyChanges() {
    const productSection = document.querySelector(ROOT_SELECTOR);

    if (isProcessing) return false;
    if (!productSection) return false;

    isProcessing = true;

    try {
      productSection.setAttribute(ROOT_ATTR, 'true');
      removeNativeLayoutLimits();
      normalizeGallerySizing();
      normalizeTexts();
      normalizePaymentMethods();
      organizeTitleMeta();
      ensureRegionNote();
      ensureWinningDiscountBadge();
      ensureWinningPaymentNote();
      organizeMainOrder();
      removeMobileSellersCarousel();
      organizeMobileShipping();
      ensureCompareTitle();
      updateCompareLink();
      organizePurchaseArea();
      normalizeQuantityControls();
      ensureShippingTitle();
      ensureFloatingWhatsApp();
      addTrackingListeners();
      trackViewOnce();
    } finally {
      isProcessing = false;
    }

    return true;
  }

  function scheduleApplyChanges() {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function () {
      applyChanges();
    }, OBSERVER_DELAY);
  }

  function setupObserver() {
    if (window[OBSERVER_KEY] || !document.body) return;

    window[OBSERVER_KEY] = new MutationObserver(function (mutations) {
      const onlyScriptNodes = mutations.every(function (mutation) {
        const nodes = Array.prototype.slice.call(mutation.addedNodes || []);

        return (
          nodes.length > 0 &&
          nodes.every(function (node) {
            return node.nodeType === 1 && node.getAttribute('data-wj-remodelagem-node') === 'true';
          })
        );
      });

      if (onlyScriptNodes) return;
      scheduleApplyChanges();
    });

    window[OBSERVER_KEY].observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    injectStyles();
    setupObserver();

    if (applyChanges()) return;

    if (retryCount >= MAX_RETRIES) return;

    retryCount += 1;
    setTimeout(init, RETRY_DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
