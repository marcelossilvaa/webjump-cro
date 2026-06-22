(function () {
  'use strict';

  var STYLE_ID = 'at-333-whats-ghost-style';
  var FLAG_BTN = 'data-whats-ghost-done';
  var FLAG_ADD = 'data-add-products-added';
  var FLAG_CHECKOUT = 'data-checkout-txt-changed';
  var FLAG_SHARE = 'data-share-ghost-done';
  var FLAG_DELIVERY = 'data-delivery-styled';
  var MAX_TRIES = 20;
  var tryCount = 0;
  var observer = null;
  var debounceTimer = null;
  var isProcessing = false;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      /* Botao checkout: aparencia ativa mesmo desabilitado */
      '[data-role="proceed-to-checkout"] {',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '}',
      '[data-role="proceed-to-checkout"].disabled,',
      '[data-role="proceed-to-checkout"][disabled] {',
      '  opacity: 1 !important;',
      '  cursor: pointer !important;',
      '  background: #e8612a !important;',
      '  border-color: #e8612a !important;',
      '  color: #fff !important;',
      '  border-radius: 50px !important;',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '}',
      '[data-role="proceed-to-checkout"]::before,',
      '[data-role="proceed-to-checkout"]::after {',
      '  display: none !important;',
      '  content: none !important;',
      '}',
      '[data-role="proceed-to-checkout"] span {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '}',
      '[data-role="proceed-to-checkout"] .checkout-arrow {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 18px;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '  margin-top: -1px;',
      '}',
      /* separador visual entre checkout e adicionar produtos */
      '[data-checkout-txt-changed] {',
      '  margin-bottom: 0 !important;',
      '}',
      /* linha divisoria suave abaixo do bloco de cupom */
      '#block-discount {',
      '  border-bottom: 1px solid #e1e5ea !important;',
      '  padding-bottom: 16px !important;',
      '  margin-bottom: 16px !important;',
      '}',
      /* WhatsApp: ghost verde escuro, pill, icone a esquerda */
      '#buy-via-whatsapp {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 8px !important;',
      '  background: #fff !important;',
      '  color: #128C7E !important;',
      '  border: 1.5px solid #128C7E !important;',
      '  border-radius: 50px !important;',
      '  box-shadow: none !important;',
      '  font-weight: 600 !important;',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '}',
      '#buy-via-whatsapp:hover {',
      '  background: #f0faf9 !important;',
      '}',
      '#buy-via-whatsapp .buy-via-whatsapp-icon {',
      '  order: -1;',
      '  flex-shrink: 0;',
      '  filter: invert(42%) sepia(55%) saturate(500%) hue-rotate(140deg) brightness(75%) contrast(95%);',
      '}',
      /* Compartilhar carrinho: ghost neutro */
      '#share-cart-btn-cart {',
      '  background: #fff !important;',
      '  color: #444 !important;',
      '  border: 1px solid #ccc !important;',
      '  box-shadow: none !important;',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '}',
      '#share-cart-btn-cart:hover {',
      '  background: #f5f5f5 !important;',
      '}',
      /* Metodo de entrega: reset completo + estilo PDP */
      '.delivery-method-switch, .delivery-method-switch * {',
      '  box-sizing: border-box !important;',
      '  box-shadow: none !important;',
      '  outline: none !important;',
      '}',
      '.delivery-method-switch::before, .delivery-method-switch::after,',
      '.delivery-method-switch *::before, .delivery-method-switch *::after {',
      '  display: none !important;',
      '  content: "" !important;',
      '  width: 0 !important;',
      '  height: 0 !important;',
      '  background: none !important;',
      '  border: none !important;',
      '}',
      '.delivery-method-switch {',
      '  border: none !important;',
      '  background: transparent !important;',
      '  padding: 0 !important;',
      '  margin: 0 !important;',
      '}',
      '.delivery-method-switch__title {',
      '  margin: 0 0 8px !important;',
      '  color: #394150 !important;',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '  font-weight: 500 !important;',
      '  line-height: 1.3 !important;',
      '}',
      '.delivery-method-switch__options {',
      '  display: flex !important;',
      '  gap: 8px !important;',
      '  border: none !important;',
      '  background: transparent !important;',
      '  padding: 0 !important;',
      '  margin: 0 !important;',
      '}',
      'label.delivery-option {',
      '  position: relative !important;',
      '  float: none !important;',
      '  flex: 1 1 0 !important;',
      '  width: auto !important;',
      '  height: 40px !important;',
      '  min-height: 40px !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  margin: 0 !important;',
      '  padding: 0 14px !important;',
      '  border: 1px solid #e1e5ea !important;',
      '  border-bottom: 1px solid #e1e5ea !important;',
      '  border-radius: 4px !important;',
      '  background: #ffffff !important;',
      '  color: #394150 !important;',
      '  cursor: pointer !important;',
      '  overflow: hidden !important;',
      '  text-indent: 0 !important;',
      '  outline: none !important;',
      '  box-shadow: none !important;',
      '}',
      'label.delivery-option.active {',

      '  background: #0054bd !important;',
      '  border-color: #0054bd !important;',
      '  color: #ffffff !important;',
      '}',
      'label.delivery-option:focus,',
      'label.delivery-option:focus-visible,',
      'label.delivery-option:focus-within,',
      'label.delivery-option:active,',
      'label.delivery-option:hover {',
      '  outline: none !important;',
      '  box-shadow: none !important;',
      '  border-color: #e1e5ea !important;',
      '}',
      'label.delivery-option.active:focus,',
      'label.delivery-option.active:focus-visible,',
      'label.delivery-option.active:focus-within,',
      'label.delivery-option.active:active,',
      'label.delivery-option.active:hover {',

      '  outline: none !important;',
      '  box-shadow: none !important;',
      '  border-color: #0054bd !important;',
      '}',
      'input.delivery-radio:focus,',
      'input.delivery-radio:focus-visible {',
      '  outline: none !important;',
      '  box-shadow: none !important;',
      '}',
      'label.delivery-option.active * {',
      '  background: transparent !important;',
      '  color: #ffffff !important;',
      '}',
      '.delivery-radio {',
      '  position: absolute !important;',
      '  width: 1px !important;',
      '  height: 1px !important;',
      '  opacity: 0 !important;',
      '  pointer-events: none !important;',
      '  overflow: hidden !important;',
      '  clip: rect(0, 0, 0, 0) !important;',
      '  white-space: nowrap !important;',
      '  -webkit-appearance: none !important;',
      '  appearance: none !important;',
      '  outline: none !important;',
      '  outline-width: 0 !important;',
      '  border: none !important;',
      '}',

      '.delivery-label {',
      '  font-size: 16px !important;',
      '  font-family: Ubuntu, sans-serif !important;',
      '  font-weight: 800 !important;',
      '  line-height: 1 !important;',
      '  color: inherit !important;',
      '  pointer-events: none !important;',
      '  background: transparent !important;',
      '  border: none !important;',
      '  outline: none !important;',
      '  box-shadow: none !important;',
      '}',
      /* Adicionar mais produtos: outline laranja, pill */
      '.action-add-more-products {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 100%;',
      '  padding: 12px 16px;',
      '  background: #fff;',
      '  color: #000 !important;',
      '  border: 1.5px solid #e8612a;',
      '  border-radius: 50px;',
      '  font-size: 16px;',
      '  font-family: Ubuntu, sans-serif;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  margin-top: 16px;',
      '  margin-bottom: 8px;',
      '  box-sizing: border-box;',
      '  text-decoration: none;',
      '}',
      '.action-add-more-products:hover {',
      '  background: #fff5f0;',
      '}',
      /* separador abaixo do botao adicionar produtos */
      '.wj-add-products-item {',
      '  border-bottom: 1px solid #e1e5ea !important;',
      '  padding-bottom: 16px !important;',
      '  margin-bottom: 8px !important;',
      '}',
      '.wj-floating-whatsapp {',
      '  position: fixed !important;',
      '  right: 22px !important;',
      '  bottom: 75px !important;',
      '  z-index: 2147483000 !important;',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  width: 52px !important;',
      '  height: 52px !important;',
      '  min-width: 52px !important;',
      '  min-height: 52px !important;',
      '  padding: 0 !important;',
      '  border: 1px solid #24a944 !important;',
      '  border-radius: 50% !important;',
      '  background: #24a944 !important;',
      '  color: #ffffff !important;',
      '  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.22) !important;',
      '  line-height: 1 !important;',
      '  text-decoration: none !important;',
      '  cursor: pointer !important;',
      '  transform: scale(1);',
      '  transition: transform 160ms ease, box-shadow 160ms ease;',
      '  animation: wj-whatsapp-pulse 1.8s ease-in-out infinite;',
      '}',
      '.wj-floating-whatsapp:hover {',
      '  transform: scale(1.08) !important;',
      '  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.28) !important;',
      '}',
      '.wj-floating-whatsapp img,',
      '.wj-floating-whatsapp .buy-via-whatsapp-icon {',
      '  width: 24px !important;',
      '  height: 24px !important;',
      '  min-width: 24px !important;',
      '  margin: 0 !important;',
      '  object-fit: contain !important;',
      '  filter: brightness(0) invert(1) !important;',
      '}',
      '@keyframes wj-whatsapp-pulse {',
      '  0%   { box-shadow: 0 0 0 0 rgba(36,169,68,0.42), 0 8px 20px rgba(15,23,42,0.22); }',
      '  70%  { box-shadow: 0 0 0 12px rgba(36,169,68,0), 0 8px 20px rgba(15,23,42,0.22); }',
      '  100% { box-shadow: 0 0 0 0 rgba(36,169,68,0), 0 8px 20px rgba(15,23,42,0.22); }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function changeCheckoutButtonText() {
    var btn = document.querySelector('[data-role="proceed-to-checkout"]');
    if (!btn || btn.getAttribute(FLAG_CHECKOUT)) return;
    var span = btn.querySelector('span');
    if (span) {
      span.textContent = 'Continuar para pagamento';
      var arrow = document.createElement('span');
      arrow.className = 'checkout-arrow';
      arrow.textContent = '›';
      span.appendChild(arrow);
    }
    btn.setAttribute(FLAG_CHECKOUT, '1');
  }

  function makeWhatsGhost() {
    var btn = document.getElementById('buy-via-whatsapp');
    if (!btn || btn.getAttribute(FLAG_BTN)) return;
    btn.style.setProperty('font-size', '16px', 'important');
    btn.setAttribute(FLAG_BTN, '1');
  }

  function makeShareGhost() {
    var btn = document.getElementById('share-cart-btn-cart');
    if (!btn || btn.getAttribute(FLAG_SHARE)) return;
    btn.setAttribute(FLAG_SHARE, '1');
  }

  function styleDeliverySwitch() {
    var options = document.querySelectorAll('.delivery-option');
    if (!options.length || options[0].getAttribute(FLAG_DELIVERY)) return;

    /* remove foco dos radios para nao gerar outline via :focus-within no label */
    for (var i = 0; i < options.length; i++) {
      var r0 = options[i].querySelector('.delivery-radio');
      if (r0) r0.setAttribute('tabindex', '-1');
      options[i].setAttribute(FLAG_DELIVERY, '1');
    }

    function activate(idx) {
      for (var j = 0; j < options.length; j++) {
        options[j].classList.remove('active');
      }
      options[idx].classList.add('active');
    }

    /* estado inicial: le radio.checked (KO ja aplicou o binding) */
    var initialIdx = 0;
    for (var k = 0; k < options.length; k++) {
      var r = options[k].querySelector('.delivery-radio');
      if (r && r.checked) { initialIdx = k; break; }
    }
    activate(initialIdx);

    /* ao clicar na opcao: troca visual imediatamente e aciona o KO via change event */
    function bindClick(opt, idx) {
      opt.addEventListener('click', function () {
        activate(idx);
        var radio = opt.querySelector('.delivery-radio');
        if (radio) {
          radio.checked = true;
          radio.blur();
          var evt = document.createEvent('Event');
          evt.initEvent('change', true, true);
          radio.dispatchEvent(evt);
        }
      });
    }
    for (var m = 0; m < options.length; m++) {
      bindClick(options[m], m);
    }
  }

  function addMoreProductsButton() {
    var whatsBtn = document.getElementById('buy-via-whatsapp');
    if (!whatsBtn || !whatsBtn.parentElement) return;
    var li = whatsBtn.parentElement;
    if (li.getAttribute(FLAG_ADD)) return;

    var novoLi = document.createElement('li');
    novoLi.className = 'item wj-add-products-item';
    var novoBtn = document.createElement('a');
    novoBtn.className = 'action-add-more-products';
    novoBtn.href = 'https://www.333obra.com.br/todos-os-produtos.html';
    novoBtn.textContent = '+ Adicionar mais produtos';
    novoLi.appendChild(novoBtn);
    li.parentElement.insertBefore(novoLi, li);
    li.setAttribute(FLAG_ADD, '1');
  }

  function addFloatingWhatsApp() {
    if (document.querySelector('.wj-floating-whatsapp')) return;
    var nativeBtn = document.getElementById('buy-via-whatsapp');
    if (!nativeBtn) return;

    var floatBtn = document.createElement('button');
    floatBtn.className = 'wj-floating-whatsapp';
    floatBtn.setAttribute('type', 'button');
    floatBtn.setAttribute('aria-label', 'Comprar pelo WhatsApp');

    var nativeIcon = nativeBtn.querySelector('img, .buy-via-whatsapp-icon');
    if (nativeIcon) {
      floatBtn.appendChild(nativeIcon.cloneNode(true));
    }

    floatBtn.addEventListener('click', function () {
      var btn = document.getElementById('buy-via-whatsapp');
      if (btn) btn.click();
    });

    document.body.appendChild(floatBtn);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      changeCheckoutButtonText();
      makeWhatsGhost();
      makeShareGhost();
      styleDeliverySwitch();
      addMoreProductsButton();
      addFloatingWhatsApp();
    } finally {
      isProcessing = false;
    }
  }

  function isDone() {
    var checkout = document.querySelector('[data-role="proceed-to-checkout"]');
    var whats = document.getElementById('buy-via-whatsapp');
    var share = document.getElementById('share-cart-btn-cart');
    return checkout && checkout.getAttribute(FLAG_CHECKOUT) &&
           whats && whats.getAttribute(FLAG_BTN) &&
           share && share.getAttribute(FLAG_SHARE) &&
           whats.parentElement && whats.parentElement.getAttribute(FLAG_ADD);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(function (mutations) {
      var hasRelevant = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].target &&
            mutations[i].target.id !== STYLE_ID) {
          hasRelevant = true;
          break;
        }
      }
      if (!hasRelevant) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (!isDone()) run();
      }, 150);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function pollUntilReady() {
    run();
    if (isDone()) {
      startObserver();
      return;
    }
    tryCount++;
    if (tryCount < MAX_TRIES) {
      setTimeout(pollUntilReady, 300);
    }
  }

  function init() {
    injectStyles();
    pollUntilReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
