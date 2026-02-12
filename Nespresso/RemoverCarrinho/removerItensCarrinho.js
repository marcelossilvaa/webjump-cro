//CODIGO REMOVER MINICART - REFATORADO
(function () {
  // Guard: executa apenas uma vez
  if (window.RemoverMiniCartProduct === true) return;
  window.RemoverMiniCartProduct = true;

  // CSS (injetado uma unica vez)
  var STYLE_ID = 'wj-remove-minicart-style';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.remove-all-products-btn, ' +
      '.remove-product-btn { ' +
      '  font-weight: 300; ' +
      '  font-size: 10px; ' +
      '  line-height: 120%; ' +
      '  text-decoration-line: underline; ' +
      '  color: #17171a; ' +
      '  cursor: pointer !important; ' +
      '  background: none; ' +
      '  border: none; ' +
      '  padding: 0; ' +
      '  width: 100%; ' +
      '  text-align: start; ' +
      '} ' +
      '.remove-btn-wrapper { ' +
      '  display: flex; ' +
      '  flex-direction: row-reverse; ' +
      '} ' +
      '.remove-btn-wrapper .remove-all-products-btn { ' +
      '  margin: 15px 8px; ' +
      '  display: flex; ' +
      '  align-items: center; ' +
      '  justify-content: end; ' +
      '} ';
    document.head.appendChild(style);
  }

  // Traducoes
  var translations = {
    removeTitle: 'Remover',
    removeAllTitle: 'Remover todos os itens',
  };

  // Tracking (GA + Adobe Target)
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'minicart-remove-items',
      local_event_action: 'click',
      local_event_label: label,
    });
  }

  window.gtmDataObject = window.gtmDataObject || [];
  window.gtmDataObject.push({
    event: 'adobe_target',
    event_raised_by: 'adobe target',
    experiment_id: '${campaign.id}',
    experiment_type: 'AB',
    experiment_name: '${campaign.name}',
    experiment_variant_id: '${campaign.recipe.id}',
    experiment_variant: '${campaign.recipe.name}',
  });

  function pushRemoveSingleEvent() {
    window.gtmDataObject.push({
      event: 'customEvent',
      eventCategory: 'Mini-Cart',
      eventAction: 'Product Remove',
      eventLabel: 'Remove Single',
    });
  }

  // API helpers
  async function readCart() {
    try {
      return await window.napi.cart().read();
    } catch (err) {
      console.error('Error fetching mini cart products:', err);
      throw err;
    }
  }

  async function getProduct(productId) {
    try {
      return await window.napi.catalog().getProduct(productId);
    } catch (err) {
      console.error('Error fetching product data for SKU ' + productId + ':', err);
      throw err;
    }
  }

  async function removeItemFromCart(productId, isSubscription) {
    try {
      if (isSubscription) {
        await window.CartManager.removeSubscription();
      } else {
        await window.CartManager.updateItem(productId, 0);
      }
    } catch (err) {
      console.error('Error updating item in the cart:', err);
    }
  }

  async function removeAllItemsFromCart() {
    try {
      var cartItems = await readCart();
      var itemsToRemove = cartItems
        .filter(function (item) {
          return !item.nonRemovable;
        })
        .map(function (item) {
          return {
            productId: item.productId,
            quantity: 0,
            subscriptionId: item.subscriptionId,
          };
        });

      // Remove assinaturas primeiro
      for (var i = 0; i < itemsToRemove.length; i++) {
        var item = itemsToRemove[i];
        if (item.subscriptionId) {
          await window.CartManager.removeSubscription();
        }
      }

      // Zera quantidades no carrinho
      await window.napi.cart().addOrUpdateProducts(itemsToRemove);
      window.triggerCremaUIStateChange.refreshMiniBasket();
    } catch (err) {
      console.error('Error removing all items:', err);
    }
  }

  // Helpers de DOM
  function decodeHtmlEntities(text) {
    var el = document.createElement('div');
    el.textContent = text;
    return el.innerHTML;
  }

  // Remove TODOS os botoes "Remover" individuais ja inseridos
  function clearRemoveButtons() {
    document
      .querySelectorAll('.remove-product-btn[data-wj-remove-btn]')
      .forEach(function (btn) {
        btn.remove();
      });
  }

  // Cria/recria o wrapper do botao "Remover todos"
  function createRemoveAllButton(hasRemovableItems) {
    var contentFilled = document.querySelector(
      '.MiniBasketDropdown__content-filled'
    );

    // Remove wrapper existente para evitar duplicacao ou se nao houver itens
    var existing = document.querySelector('.remove-btn-wrapper');
    if (existing) existing.remove();

    if (!contentFilled || !hasRemovableItems) return;

    var wrapper = document.createElement('div');
    wrapper.classList.add('remove-btn-wrapper');

    var btn = document.createElement('button');
    btn.classList.add('remove-all-products-btn');
    
    // Cria conteudo do botao via DOM para evitar problemas de innerHTML
    var img = document.createElement('img');
    img.src = 'https://www.nespresso.com/shared_res/mos/free_html/abtest/delete_icon.svg';
    img.alt = translations.removeAllTitle;
    
    var textNode = document.createTextNode(' ' + translations.removeAllTitle);
    
    btn.appendChild(img);
    btn.appendChild(textNode);
    
    btn.addEventListener('click', handleRemoveAll);

    wrapper.appendChild(btn);
    contentFilled.insertAdjacentElement('afterend', wrapper);
  }

  function handleRemoveAll() {
    sendGAEvent('remove-all-items');
    removeAllItemsFromCart();
    setTimeout(function () {
      var wrapper = document.querySelector('.remove-btn-wrapper');
      if (wrapper) wrapper.style.display = 'none';
    }, 500);
  }

  // Logica principal: inserir botoes "Remover"
  async function insertRemoveButtons(cartItems) {
    for (var i = 0; i < cartItems.length; i++) {
      var item = cartItems[i];
      // Pula itens gratuitos e nao-removiveis
      if (item.unitPrice === 0 || item.nonRemovable) continue;

      var productInfo;
      try {
        productInfo = await getProduct(item.productId);
      } catch (e) {
        continue; // Se nao conseguir info do produto, pula
      }

      var productName = decodeHtmlEntities(productInfo.name.trim());

      // Encontra o span de titulo correspondente
      var titleDivs = document.querySelectorAll('.MiniBasketItem__title');

      for (var j = 0; j < titleDivs.length; j++) {
        var titleDiv = titleDivs[j];
        var titleSpan = titleDiv.querySelector(
          "span[aria-hidden='true']:first-child"
        );
        if (!titleSpan) continue;

        var spanText = titleSpan.textContent.trim();
        if (spanText !== productName) continue;

        // VERIFICACAO ANTI-DUPLICACAO: checa se ja existe um botao para este produto
        var existingBtn = titleDiv.querySelector(
          'button.remove-product-btn[data-wj-remove-btn]'
        );
        if (existingBtn) continue; // Ja existe, nao insere de novo

        // Cria o botao
        var btn = document.createElement('button');
        btn.classList.add('remove-product-btn');
        btn.textContent = translations.removeTitle;
        btn.setAttribute('data-cart-product-id', item.productId);
        btn.setAttribute('data-wj-remove-btn', 'true'); // Marcador para identificacao

        // Closure para capturar o item correto
        (function (pid, hasSubscription) {
          btn.addEventListener('click', function () {
            pushRemoveSingleEvent();
            sendGAEvent('remove-single-item');
            removeItemFromCart(pid, hasSubscription).then(function () {
              // Apos remocao, limpa e reconstroi
              setTimeout(function () {
                clearRemoveButtons();
                handleMiniCartOpen();
              }, 500);
            });
          });
        })(item.productId, !!item.subscriptionId);

        // Insere como ultimo filho do .MiniBasketItem__title
        titleDiv.appendChild(btn);
        break; // Encontrou o title certo, nao precisa continuar o loop interno
      }
    }

    // Verifica se existe pelo menos um item removivel
    var hasRemovableItems = cartItems.some(function(item) {
        return item.unitPrice > 0 && !item.nonRemovable;
    });

    // Cria/recria (ou remove) o botao "Remover todos"
    createRemoveAllButton(hasRemovableItems);
  }

  // Handler para quando o minicart abre
  async function handleMiniCartOpen() {
    try {
      clearRemoveButtons();
      var cartItems = await readCart();
      
      if (cartItems && cartItems.length > 0) {
        await insertRemoveButtons(cartItems);
      } else {
        // Se nao houver itens, garante que o botao "Remover todos" seja removido
        createRemoveAllButton(false);
      }
    } catch (err) {
      console.error('Error handling mini cart open:', err);
    }
  }

  // MutationObserver com protecao contra loop
  var isProcessing = false;
  var debounceTimer = null;

  var observer = new MutationObserver(function (mutations) {
    // Ignora mutacoes que nos mesmos causamos
    if (isProcessing) return;

    var miniCartOpened = false;
    for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'childList' && 
            m.target.getElementsByClassName('MiniBasketDropdown__dropdown--is-open').length > 0) {
            miniCartOpened = true;
            break;
        }
    }

    if (!miniCartOpened) return;

    // Debounce: espera 200ms de "silencio" antes de processar
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async function () {
      isProcessing = true;
      try {
        await handleMiniCartOpen();
      } finally {
        // Pequeno delay antes de liberar o flag para evitar race conditions
        setTimeout(function () {
          isProcessing = false;
        }, 200);
      }
    }, 200);
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  // Tracking: clique no seletor de quantidade "0"
  document.addEventListener('click', function (e) {
    var targetId = 'ta-quantity-selector__predefined-0';
    if (
      e.target.id === targetId ||
      (e.target.parentElement && e.target.parentElement.id === targetId)
    ) {
      window.gtmDataObject.push({
        event: 'customEvent',
        eventCategory: 'Mini-Cart',
        eventAction: 'Product Remove',
        eventLabel: 'Remove From Quantity Selector',
      });
    }
  });

  // Inicializacao
  // Verifica se o carrinho JA esta aberto ao carregar o script
  if (
    document.getElementsByClassName('MiniBasketDropdown__dropdown--is-open')
      .length > 0
  ) {
    handleMiniCartOpen();
  }
})();
