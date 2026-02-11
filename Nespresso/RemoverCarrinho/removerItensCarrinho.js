//CODIGO REMOVER MINICART - REFATORADO
(function () {
  // ── Guard: executa apenas uma vez ──
  if (window.RemoverMiniCartProduct === true) return;
  window.RemoverMiniCartProduct = true;

  // ── CSS (injetado uma única vez) ──
  const STYLE_ID = "wj-remove-minicart-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .remove-all-products-btn,
      .remove-product-btn {
        font-weight: 300;
        font-size: 10px;
        line-height: 120%;
        text-decoration-line: underline;
        color: #17171a;
        cursor: pointer !important;
        background: none;
        border: none;
        padding: 0;
        width: 100%;
        text-align: start;
      }
      .remove-btn-wrapper {
        display: flex;
        flex-direction: row-reverse;
      }
      .remove-btn-wrapper .remove-all-products-btn {
        margin: 15px 8px;
        display: flex;
        align-items: center;
        justify-content: end;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Traduções ──
  const translations = {
    removeTitle: "Remover",
    removeAllTitle: "Remover todos os itens",
  };

  // ── Tracking (GA + Adobe Target) ──
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "minicart-remove-items",
      local_event_action: "click",
      local_event_label: label,
    });
  }

  window.gtmDataObject = window.gtmDataObject || [];
  window.gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });

  function pushRemoveSingleEvent() {
    window.gtmDataObject.push({
      event: "customEvent",
      eventCategory: "Mini-Cart",
      eventAction: "Product Remove",
      eventLabel: "Remove Single",
    });
  }

  // ── API helpers ──
  async function readCart() {
    try {
      return await window.napi.cart().read();
    } catch (err) {
      console.error("Error fetching mini cart products:", err);
      throw err;
    }
  }

  async function getProduct(productId) {
    try {
      return await window.napi.catalog().getProduct(productId);
    } catch (err) {
      console.error(`Error fetching product data for SKU ${productId}:`, err);
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
      console.error("Error updating item in the cart:", err);
    }
  }

  async function removeAllItemsFromCart() {
    try {
      const itemsToRemove = (await readCart())
        .filter((item) => !item.nonRemovable)
        .map((item) => ({
          productId: item.productId,
          quantity: 0,
          subscriptionId: item.subscriptionId,
        }));

      // Remove assinaturas primeiro
      for (const item of itemsToRemove) {
        if (item.subscriptionId) {
          await window.CartManager.removeSubscription();
        }
      }

      // Zera quantidades no carrinho
      await window.napi.cart().addOrUpdateProducts(itemsToRemove);
      window.triggerCremaUIStateChange.refreshMiniBasket();
    } catch (err) {
      console.error("Error removing all items:", err);
    }
  }

  // ── Helpers de DOM ──
  function decodeHtmlEntities(text) {
    const el = document.createElement("div");
    el.textContent = text;
    return el.innerHTML;
  }

  /** Remove TODOS os botões "Remover" individuais já inseridos */
  function clearRemoveButtons() {
    document
      .querySelectorAll(".remove-product-btn[data-wj-remove-btn]")
      .forEach((btn) => btn.remove());
  }

  /** Cria/recria o wrapper do botão "Remover todos" */
  function createRemoveAllButton() {
    const contentFilled = document.querySelector(
      ".MiniBasketDropdown__content-filled"
    );
    if (!contentFilled) return;

    // Remove wrapper existente para evitar duplicação
    const existing = document.querySelector(".remove-btn-wrapper");
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.classList.add("remove-btn-wrapper");

    const btn = document.createElement("button");
    btn.classList.add("remove-all-products-btn");
    btn.innerHTML = `<img src="https://www.nespresso.com/shared_res/mos/free_html/abtest/delete_icon.svg" alt="${translations.removeAllTitle}"/> ${translations.removeAllTitle}`;
    btn.addEventListener("click", handleRemoveAll);

    wrapper.appendChild(btn);
    contentFilled.insertAdjacentElement("afterend", wrapper);
  }

  function handleRemoveAll() {
    sendGAEvent("remove-all-items");
    removeAllItemsFromCart();
    setTimeout(() => {
      const wrapper = document.querySelector(".remove-btn-wrapper");
      if (wrapper) wrapper.style.display = "none";
    }, 500);
  }

  // ── Lógica principal: inserir botões "Remover" ──
  async function insertRemoveButtons(cartItems) {
    for (const item of cartItems) {
      // Pula itens gratuitos e não-removíveis
      if (item.unitPrice === 0 || item.nonRemovable) continue;

      let productInfo;
      try {
        productInfo = await getProduct(item.productId);
      } catch {
        continue; // Se não conseguir info do produto, pula
      }

      const productName = decodeHtmlEntities(productInfo.name.trim());

      // Encontra o span de título correspondente
      const titleDivs = document.querySelectorAll(".MiniBasketItem__title");

      for (const titleDiv of titleDivs) {
        const titleSpan = titleDiv.querySelector(
          "span[aria-hidden='true']:first-child"
        );
        if (!titleSpan) continue;

        const spanText = titleSpan.textContent.trim();
        if (spanText !== productName) continue;

        // ✅ VERIFICAÇÃO ANTI-DUPLICAÇÃO: checa se já existe um botão para este produto
        const existingBtn = titleDiv.querySelector(
          "button.remove-product-btn[data-wj-remove-btn]"
        );
        if (existingBtn) continue; // Já existe, não insere de novo

        // Cria o botão
        const btn = document.createElement("button");
        btn.classList.add("remove-product-btn");
        btn.textContent = translations.removeTitle;
        btn.setAttribute("data-cart-product-id", item.productId);
        btn.setAttribute("data-wj-remove-btn", "true"); // Marcador para identificação

        btn.addEventListener("click", function (e) {
          const pid = e.target.getAttribute("data-cart-product-id");
          pushRemoveSingleEvent();
          sendGAEvent("remove-single-item");
          removeItemFromCart(pid, !!item.subscriptionId).then(() => {
            // Após remoção, limpa e reconstrói
            setTimeout(() => {
              clearRemoveButtons();
              handleMiniCartOpen();
            }, 500);
          });
        });

        // Insere como último filho do .MiniBasketItem__title
        titleDiv.appendChild(btn);
        break; // Encontrou o title certo, não precisa continuar o loop interno
      }
    }

    // Cria/recria o botão "Remover todos"
    createRemoveAllButton();
  }

  // ── Handler para quando o minicart abre ──
  async function handleMiniCartOpen() {
    try {
      clearRemoveButtons();
      const cartItems = await readCart();
      if (cartItems && cartItems.length > 0) {
        await insertRemoveButtons(cartItems);
      }
    } catch (err) {
      console.error("Error handling mini cart open:", err);
    }
  }

  // ── MutationObserver com proteção contra loop ──
  let isProcessing = false;
  let debounceTimer = null;

  const observer = new MutationObserver(function (mutations) {
    // Ignora mutações que nós mesmos causamos
    if (isProcessing) return;

    const miniCartOpened = mutations.some(
      (m) =>
        m.type === "childList" &&
        m.target.getElementsByClassName(
          "MiniBasketDropdown__dropdown--is-open"
        ).length > 0
    );

    if (!miniCartOpened) return;

    // Debounce: espera 500ms de "silêncio" antes de processar
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      isProcessing = true;
      try {
        await handleMiniCartOpen();
      } finally {
        // Pequeno delay antes de liberar o flag para evitar race conditions
        setTimeout(() => {
          isProcessing = false;
        }, 200);
      }
    }, 500);
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  // ── Tracking: clique no seletor de quantidade "0" ──
  document.addEventListener("click", function (e) {
    const targetId = "ta-quantity-selector__predefined-0";
    if (
      e.target.id === targetId ||
      (e.target.parentElement && e.target.parentElement.id === targetId)
    ) {
      window.gtmDataObject.push({
        event: "customEvent",
        eventCategory: "Mini-Cart",
        eventAction: "Product Remove",
        eventLabel: "Remove From Quantity Selector",
      });
    }
  });
})();
