(function () {
  "use strict";
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "recomendacoes_cafes_plp", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  // Mapeamento de recomendações
  const RECOMMENDATION_MAP = {
    // OL
    "7885.90": "7990.90", // Ristretto → Florian
    "7857.90": "7990.90", // Ristretto Decaf → Florian
    "7888.90": "7990.90", // Arpeggio → Florian
    "7862.90": "7990.90", // Arpeggio Decaf → Florian
    "7865.90": "7886.90", // Volluto → Ethiopia
    "7864.90": "7886.90", // Volluto Decaf → Ethiopia
    "7866.90": "7856.90", // Capriccio → Nicaragua
    "7863.90": "7856.90", // Cosi → Nicaragua
    "7855.90": "7889.90", // Livanto → Colombia
    "7890.90": "7990.90", // Venezia → Florian
    "7895.90": "7990.90", // Napoli → Florian
    // VL
    "7011.80": "7026.80", // Ristretto Intenso → Mexico
    "7010.80": "7026.80", // Ristretto Clássico → Mexico
    "7047.80": "7017.80", // Voltesso → Ethiopia
    "7048.80": "7026.80", // Altissio → Mexico
    "7058.80": "7026.80", // Scuro → Mexico
    "7060.80": "7026.80", // Il Caffè → Mexico
    "7085.80": "7043.80", // Dolce → Costa Rica
    "7049.80": "7026.80", // Diavolito → Mexico
    "7279.80": "7043.80", // Chiaro Decaffeinato → Costa Rica
  };

  let popupShown = false;
  let lastQuantity = 0;
  let currentProductData = null;
  let lastAddedProductName = "";
  let previousCartState = new Map();
  let popupTimer = null;
  let cartObserver = null;
  let productAddedTimer = null;
  let productAddedToCart = false;

  // Função para verificar se produto recomendado já está no carrinho
  async function isRecommendedProductInCart(recommendedSku) {
    try {
      // Aguardar API estar disponível
      const apiReady = await waitForAPI();
      if (!apiReady) {
        return false;
      }

      const cartItems = await window.napi.cart().read();
      const isInCart = cartItems.some((item) => {
        const sku = item.productId.split("/").pop();
        return sku === recommendedSku && !item.nonRemovable;
      });
      return isInCart;
    } catch (error) {
      return false;
    }
  }

  // Função para obter quantidade do produto no carrinho
  async function getProductQuantityInCart(recommendedSku) {
    try {
      // Aguardar API estar disponível
      const apiReady = await waitForAPI();
      if (!apiReady) {
        return 0;
      }

      const cartItems = await window.napi.cart().read();
      const item = cartItems.find((item) => {
        const sku = item.productId.split("/").pop();
        return sku === recommendedSku && !item.nonRemovable;
      });

      const quantity = item ? item.quantity : 0;
      return quantity;
    } catch (error) {
      return 0;
    }
  }

  // Função para atualizar texto do botão baseado no estado do carrinho
  async function updateButtonText(recommendedSku) {
    try {
      const quantityInCart = await getProductQuantityInCart(recommendedSku);
      const textElement = document.querySelector(
        "#recommendation-popup .add-to-cart-text",
      );

      if (textElement) {
        textElement.textContent =
          quantityInCart > 0 ? "CAFÉS ADICIONADOS" : "ADICIONAR AO CARRINHO";
      }
    } catch (error) {
      console.error("Erro ao atualizar texto do botão:", error);
    }
  }

  // Função para resetar timers do popup
  function resetPopupTimers() {
    // Se produto já foi adicionado, não resetar timers
    if (productAddedToCart) {
      return;
    }

    // Limpar timer de produto adicionado se existir
    if (productAddedTimer) {
      clearTimeout(productAddedTimer);
      productAddedTimer = null;
    }

    // Resetar timer principal para 20 segundos
    if (popupTimer) {
      clearTimeout(popupTimer);
    }
    popupTimer = setTimeout(() => {
      window.closeRecommendationPopup();
    }, 20000); // 20 segundos
  }

  // Função para iniciar timer de 5 segundos após produto ser adicionado
  function startProductAddedTimer() {
    productAddedToCart = true;

    // Limpar timer principal
    if (popupTimer) {
      clearTimeout(popupTimer);
      popupTimer = null;
    }

    // Limpar timer anterior se existir
    if (productAddedTimer) {
      clearTimeout(productAddedTimer);
    }

    productAddedTimer = setTimeout(() => {
      window.closeRecommendationPopup();
    }, 5000);
  }

  // Função para aguardar API estar disponível
  async function waitForAPI(maxAttempts = 10, delay = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      if (
        window.napi &&
        window.napi.catalog &&
        typeof window.napi.catalog().getProduct === "function"
      ) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    return false;
  }

  // Função para buscar dados do produto recomendado
  async function getRecommendedProductData(sku) {
    try {
      // Aguardar API estar disponível
      const apiReady = await waitForAPI();
      if (!apiReady) {
        return null;
      }

      const productData = await window.napi.catalog().getProduct(sku);
      return productData;
    } catch (error) {
      return null;
    }
  }

  // Função para mostrar popup de recomendação
  async function showPopup(sku = "") {
    if (popupShown) {
      return;
    }
    if (document.getElementById("recommendation-popup")) {
      return;
    }

    popupShown = true;

    // Exibir apenas com dados reais do produto recomendado
    if (!currentProductData) {
      return;
    }

    // Fallback para teste quando API não está disponível
    if (!currentProductData.name && !currentProductData.headline) {
      currentProductData.name =
        currentProductData.name || "Produto Recomendado";
      currentProductData.headline =
        currentProductData.headline || "Descrição do produto recomendado";
      currentProductData.responsiveImages =
        currentProductData.responsiveImages || {
          plp: "https://via.placeholder.com/100x100",
        };
    }
    const productData = currentProductData;

    const productName = productData.name || "";
    const productDescription = productData.headline || "";
    const productIntensity = productData.capsuleProperties?.intensity || "";
    const productPrice = productData.unitPrice || "";
    const productImage =
      productData.responsiveImages?.plp || productData.images?.main || "";

    // Obter quantidade no carrinho para o copy do botão
    const recommendedSku = RECOMMENDATION_MAP[sku];
    const quantityInCart = recommendedSku
      ? await getProductQuantityInCart(recommendedSku)
      : 0;
    const buttonText =
      quantityInCart > 0
        ? "JÁ ADICIONADO AO CARRINHO"
        : "ADICIONAR AO CARRINHO";

    const popupHTML =
      "<style>" +
      "#streamshop-widget {" +
      "bottom: 280px!important;" +
      "}" +
      "@media (max-width: 768px) {" +
      "body #streamshop-widget {" +
      "bottom: 280px!important;" +
      "}" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall {" +
      "width: 100% !important;" +
      "border-radius: 20px !important;" +
      "}" +
      "#recommendation-popup .add-to-bag {" +
      "width: 100% !important;" +
      "}" +
      "#recommendation-popup #MiniBasketPushAddProductCTA {" +
      "width: 70% !important;" +
      "padding: 0 !important;" +
      "}" +
      "#recommendation-popup .AddToBagButton__button-CremaComponentId-" +
      Date.now() +
      " {" +
      "border-radius: 20px !important;" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall__quantity {" +
      "position: unset !important;" +
      "width: unset !important;" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall__icon-sign {" +
      "display: none !important;" +
      "}" +
      "#recommendation-popup .add-to-cart-text {" +
      "display: inline-block !important;" +
      "margin-right: 8px !important;" +
      "font-size: 14px;" +
      "font-weight: bold !important;" +
      "color: white !important;" +
      "visibility: visible !important;" +
      "opacity: 1 !important;" +
      "position: relative !important;" +
      "z-index: 10 !important;" +
      "background: transparent !important;" +
      "border: none !important;" +
      "padding: 0 !important;" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall {" +
      "display: flex !important;" +
      "align-items: center !important;" +
      "justify-content: center !important;" +
      "gap: 3px !important;" +
      "flex-wrap: nowrap !important;" +
      "position: relative !important;" +
      "}" +
      "</style>" +
      '<div id="recommendation-popup" style="position: fixed; bottom: 20px; left: 20px; z-index: 999; max-width: 450px; animation: slideInLeft 0.3s ease-out;">' +
      '<div style="background: white; border-radius: 8px; padding: 24px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">' +
      '<h3 style="margin: 0; color: #999; font-size: 16px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px;">QUEM COMPRA <span style="font-weight: 600;">' +
      lastAddedProductName +
      "</span> TAMBÉM COMPRA</h3>" +
      '<button onclick="closeRecommendationPopup()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</button>' +
      "</div>" +
      '<div style="display: flex; gap: 16px; margin-bottom: 20px;">' +
      '<img src="' +
      productImage +
      '" alt="' +
      productName +
      '" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">' +
      '<div style="display: flex; flex-direction: column; justify-content: center;">' +
      '<h4 style="margin: 0 0 8px 0; color: #333; font-size: 18px; font-weight: 700;">' +
      productName +
      "</h4>" +
      '<p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.4;">' +
      productDescription +
      "</p>" +
      (productIntensity > 0
        ? '<div style="margin-bottom: 0;">' +
          '<span style="display: block; color: #666; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">' +
          "Intensidade: " +
          '<span style="color: #876c43; font-weight: 600; letter-spacing: 1px; font-size: 30px;">' +
          "-".repeat(productIntensity) +
          "</span>" +
          '<span style="color: #876c43; font-weight: 700; margin-left: 4px;">' +
          productIntensity +
          "</span>" +
          "</span>" +
          "</div>"
        : "") +
      "</div>" +
      "</div>" +
      '<div style="display: flex; justify-content: space-between; align-items: center;">' +
      '<div id="MiniBasketPushAddProductCTA">' +
      '<div class="add-to-bag" data-product-id="' +
      (currentProductData?.id || "erp.br.b2c/prod/7895.90") +
      '" data-button-size="small">' +
      '<div class="AddToBagButton__container">' +
      '<div id="AddToBagButton__button-CremaComponentId-' +
      Date.now() +
      '">' +
      '<button class="AddToBagButton AddToBagButtonSmall" data-focus-id="AddToBagButton__button-CremaComponentId-' +
      Date.now() +
      '" type="button" data-qa="' +
      productName +
      '">' +
      '<span class="VisuallyHidden">Você não possui nenhum ' +
      productName +
      " em seu carrinho. Ative para adicioná-lo.</span>" +
      '<span class="add-to-cart-text">' +
      buttonText +
      "</span>" +
      "</button>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<button onclick="closeRecommendationPopup()" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #999; padding: 8px 0; padding-right: 10px;">Depois</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "<style>" +
      "@keyframes slideInLeft {" +
      "from {" +
      "transform: translateX(-100%);" +
      "opacity: 0;" +
      "}" +
      "to {" +
      "transform: translateX(0);" +
      "opacity: 1;" +
      "}" +
      "}" +
      "@keyframes slideOutLeft {" +
      "0% {" +
      "transform: translateX(0);" +
      "opacity: 1;" +
      "}" +
      "100% {" +
      "transform: translateX(-100%);" +
      "opacity: 0;" +
      "}" +
      "}" +
      "#recommendation-popup {" +
      "transition: all 0.3s ease-out;" +
      "font-family: NespressoLucas, Helvetica, Arial, sans-serif !important;" +
      "}" +
      "#recommendation-popup * {" +
      "font-family: NespressoLucas, Helvetica, Arial, sans-serif !important;" +
      "}" +
      "#recommendation-popup.closing {" +
      "animation: slideOutLeft 0.3s ease-in forwards !important;" +
      "pointer-events: none;" +
      "}" +
      "#recommendation-popup button:hover {" +
      "opacity: 0.8;" +
      "}" +
      "@media (max-width: 768px) {" +
      "#recommendation-popup {" +
      "max-width: 90% !important;" +
      "left: 5% !important;" +
      "right: 5% !important;" +
      "bottom: 25px !important;" +
      "}" +
      "#recommendation-popup > div {" +
      "padding: 16px !important;" +
      "border-radius: 6px !important;" +
      "}" +
      "#recommendation-popup h3 {" +
      "font-size: 14px!important;" +
      "margin-bottom: 0px !important;" +
      "line-height: 1.3 !important;" +
      "}" +
      "#recommendation-popup h4 {" +
      "font-size: 14px;" +
      "margin-bottom: 4px !important;" +
      "}" +
      "#recommendation-popup p {" +
      "font-size: 14px;" +
      "margin-bottom: 8px !important;" +
      "line-height: 1.3 !important;" +
      "}" +
      "#recommendation-popup img {" +
      "width: 80px !important;" +
      "height: 80px !important;" +
      "}" +
      '#recommendation-popup div[style*="margin-bottom: 16px"] {' +
      "margin-bottom: 4px !important;" +
      "}" +
      '#recommendation-popup div[style*="margin-bottom: 20px"] {' +
      "margin-bottom: 10px !important;" +
      "}" +
      "#recommendation-popup .add-to-cart-text {" +
      "font-size: 12px !important;" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall .add-to-cart-text {" +
      "font-size: 12px !important;" +
      "}" +
      "#recommendation-popup button .add-to-cart-text {" +
      "font-size: 12px !important;" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall span.add-to-cart-text {" +
      "font-size: 12px !important;" +
      "}" +
      "#recommendation-popup span.add-to-cart-text {" +
      "font-size: 12px !important;" +
      "}" +
      '#recommendation-popup button:not([onclick="closeRecommendationPopup()"]) {' +
      "font-size: 12px !important;" +
      "padding: 4px !important;" +
      "}" +
      "#recommendation-popup .AddToBagButtonSmall__quantity {" +
      "font-size: 12px !important;" +
      "}" +
      '#recommendation-popup span[style*="font-size: 30px"] {' +
      "font-size: 20px !important;" +
      "}" +
      "}" +
      "</style>";

    document.body.insertAdjacentHTML("beforeend", popupHTML);

    // Evento GA4: recomendação apareceu
    sendGAEvent(
      "recomendacao_apareceu_" + productName.toLowerCase().replace(/\s+/g, "_"),
    );

    // Evento GA4 delegado: clicou no botão de adição ao carrinho
    document
      .getElementById("recommendation-popup")
      .addEventListener("click", function (e) {
        if (e.target.closest(".AddToBagButtonSmall")) {
          sendGAEvent(
            "clicou_adicionar_carrinho_" + (recommendedSku || "").toLowerCase(),
          );
        }
      });

    // Configurar timer para fechar pop-up automaticamente após 20 segundos
    popupTimer = setTimeout(() => {
      window.closeRecommendationPopup();
    }, 20000);

    // Inicializa módulos Mosaic na área do CTA, se disponível
    try {
      const ctaContainer = document.getElementById(
        "MiniBasketPushAddProductCTA",
      );
      if (typeof window.mosaic !== "undefined" && ctaContainer) {
        setTimeout(function () {
          window.mosaic.initializeAllFreeHTMLModules(ctaContainer);
        }, 200);
      }
    } catch (e) {}

    // Configurar observador para atualizar texto do botão quando carrinho mudar
    cartObserver = new MutationObserver(async () => {
      if (recommendedSku) {
        await updateButtonText(recommendedSku);
      }
    });

    // Observar mudanças no span da quantidade do carrinho
    const cartSpan = document.querySelector(
      "#ta-mini-basket__open .notranslate",
    );
    if (cartSpan) {
      cartObserver.observe(cartSpan, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    // Observador específico para detectar mudanças na quantidade do botão do popup
    const buttonQuantityObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          const quantityElement = document.querySelector(
            "#recommendation-popup .AddToBagButtonSmall__quantity",
          );
          if (quantityElement) {
            const currentQuantity = parseInt(quantityElement.textContent) || 0;
            // Se quantidade mudou de 0 para > 0, produto foi adicionado
            if (currentQuantity > 0 && !productAddedToCart) {
              startProductAddedTimer();
            }
          }
        }
      });
    });

    // Observar mudanças no botão do popup
    setTimeout(() => {
      const popupButton = document.querySelector(
        "#recommendation-popup .AddToBagButtonSmall",
      );
      if (popupButton) {
        buttonQuantityObserver.observe(popupButton, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    }, 1000);

    // Adicionar eventos de interação para resetar timer
    const popupElement = document.getElementById("recommendation-popup");
    if (popupElement) {
      // Eventos de mouse
      popupElement.addEventListener("mouseenter", resetPopupTimers);
      popupElement.addEventListener("mousemove", resetPopupTimers);

      // Eventos de clique (exceto nos botões de fechar)
      popupElement.addEventListener("click", (e) => {
        // Não resetar se clicar nos botões de fechar
        if (!e.target.closest('button[onclick="closeRecommendationPopup()"]')) {
          resetPopupTimers();
        }
      });

      // Eventos de teclado
      popupElement.addEventListener("keydown", resetPopupTimers);
      popupElement.addEventListener("keyup", resetPopupTimers);
    }

    // Inicializar o componente AddToBag após inserir no DOM
    setTimeout(() => {
      const addToBagElement = document.querySelector(
        "#recommendation-popup #MiniBasketPushAddProductCTA .add-to-bag",
      );

      // Reforça inicialização Mosaic no container do CTA
      try {
        const ctaContainer = document.getElementById(
          "MiniBasketPushAddProductCTA",
        );
        if (typeof window.mosaic !== "undefined" && ctaContainer) {
          window.mosaic.initializeAllFreeHTMLModules(ctaContainer);
          // Se possível, também inicializa diretamente o módulo do próprio elemento
          if (addToBagElement) {
            window.mosaic.initializeAllFreeHTMLModules(addToBagElement);
          }
        }
      } catch (e) {}

      // Forçar inserção do texto após inicialização do Mosaic
      setTimeout(() => {
        const button = document.querySelector(
          "#recommendation-popup .AddToBagButtonSmall",
        );
        if (button) {
          // Verificar se o texto já existe
          let textElement = button.querySelector(".add-to-cart-text");
          if (!textElement) {
            // Criar e inserir o texto
            textElement = document.createElement("span");
            textElement.className = "add-to-cart-text";
            textElement.textContent = buttonText;
            textElement.style.cssText =
              "display: inline-block !important;" +
              "margin-right: 8px !important;" +
              "font-size: 14px !important;" +
              "font-weight: 600 !important;" +
              "color: white !important;" +
              "visibility: visible !important;" +
              "opacity: 1 !important;" +
              "position: relative !important;" +
              "z-index: 10 !important;";

            // Inserir no final do botão
            button.appendChild(textElement);
          }
        }
      }, 1500);

      // Observer para detectar mudanças no botão e reinserir texto se necessário
      const buttonObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const button = document.querySelector(
              "#recommendation-popup .AddToBagButtonSmall",
            );
            if (button) {
              const textElement = button.querySelector(".add-to-cart-text");
              if (!textElement) {
                // Reinserir o texto se foi removido
                const newTextElement = document.createElement("span");
                newTextElement.className = "add-to-cart-text";
                newTextElement.textContent = buttonText;
                newTextElement.style.cssText =
                  "display: inline-block !important;" +
                  "margin-right: 8px !important;" +
                  "font-size: 14px;" +
                  "font-weight: 600 !important;" +
                  "color: white !important;" +
                  "visibility: visible !important;" +
                  "opacity: 1 !important;" +
                  "position: relative !important;" +
                  "z-index: 10 !important;";

                // Inserir no final do botão
                button.appendChild(newTextElement);
              }
            }
          }
        });
      });

      // Observar mudanças no container do botão
      const buttonContainer = document.querySelector(
        "#recommendation-popup #MiniBasketPushAddProductCTA",
      );
      if (buttonContainer) {
        buttonObserver.observe(buttonContainer, {
          childList: true,
          subtree: true,
        });
      }

      if (addToBagElement && window.napi) {
        const button = addToBagElement.querySelector("button");
        if (button) {
          button.addEventListener(
            "click",
            async function (e) {
              e.preventDefault();
              const productId = addToBagElement.getAttribute("data-product-id");
              if (productId && window.napi && window.napi.cart) {
                const cartApi = window.napi.cart();
                let added = false;
                // Tentativa 1: addProducts
                try {
                  if (typeof cartApi.addProducts === "function") {
                    await cartApi.addProducts([
                      {
                        productId: productId,
                        quantity: 1,
                      },
                    ]);
                    added = true;
                  }
                } catch (_) {}
                // Tentativa 2: addOrUpdateProducts
                if (!added) {
                  try {
                    if (typeof cartApi.addOrUpdateProducts === "function") {
                      await cartApi.addOrUpdateProducts([
                        {
                          productId: productId,
                          quantity: 1,
                        },
                      ]);
                      added = true;
                    }
                  } catch (_) {}
                }
                // Tentativa 3: updateProducts
                if (!added) {
                  try {
                    if (typeof cartApi.updateProducts === "function") {
                      await cartApi.updateProducts([
                        {
                          productId: productId,
                          quantity: 1,
                        },
                      ]);
                      added = true;
                    }
                  } catch (_) {}
                }

                // Validação lendo o carrinho em seguida
                try {
                  const cartData = await cartApi.read();
                  // sucesso mínimo: cartData truthy
                  if (cartData) {
                    // Atualizar texto do botão para "JÁ ADICIONADO AO CARRINHO"
                    const textElement = document.querySelector(
                      "#recommendation-popup .add-to-cart-text",
                    );
                    if (textElement) {
                      textElement.textContent = "JÁ ADICIONADOS AO CARRINHO";
                    }
                    // O timer de 5 segundos será iniciado pelo observador da quantidade
                  }
                } catch (error) {
                  console.error("Erro ao ler carrinho:", error);
                }
              }
            },
            true,
          );
        }
      }
    }, 100);
  }

  // Função para fechar popup de recomendação
  window.closeRecommendationPopup = function () {
    const popup = document.getElementById("recommendation-popup");
    if (popup) {
      // Prevenir múltiplas chamadas durante a animação
      if (popup.classList.contains("closing")) {
        return;
      }

      // Evento GA4: clicou em fechar recomendação
      const activeCoffeeName = currentProductData?.name || "";
      sendGAEvent(
        "clicou_fechar_" + activeCoffeeName.toLowerCase().replace(/\s+/g, "_"),
      );

      // Adicionar classe de fechamento para iniciar animação
      popup.classList.add("closing");

      // Usar requestAnimationFrame para garantir que a animação inicie
      requestAnimationFrame(() => {
        // Remover elemento após a animação terminar
        setTimeout(() => {
          if (popup && popup.parentNode) {
            popup.remove();
          }
        }, 300); // 300ms = duração da animação
      });
    }
    // Limpar timers se existirem
    if (popupTimer) {
      clearTimeout(popupTimer);
      popupTimer = null;
    }
    if (productAddedTimer) {
      clearTimeout(productAddedTimer);
      productAddedTimer = null;
    }
    // Limpar observador do carrinho se existir
    if (cartObserver) {
      cartObserver.disconnect();
      cartObserver = null;
    }
    // Resetar flags para permitir novo pop-up
    popupShown = false;
    productAddedToCart = false;
  };

  // Função para forçar a abertura do popup (para testes)
  window.forceRecommendationPopup = async function (sku = "7885.90") {
    popupShown = false; // Resetar flag para permitir forçar abertura
    const recommendedSku = RECOMMENDATION_MAP[sku];
    lastAddedProductName = "Produto Teste";

    if (recommendedSku) {
      currentProductData = await getRecommendedProductData(recommendedSku);
    }

    // Fallback para teste visual se API falhar ou não existir
    if (!currentProductData) {
      currentProductData = {
        name: "Produto Recomendado Teste",
        headline: "Descrição simulada do produto para visualização do popup.",
        unitPrice: 3.5,
        responsiveImages: {
          plp: "https://via.placeholder.com/150",
        },
        capsuleProperties: {
          intensity: 9,
        },
        id: "erp.br.b2c/prod/" + (recommendedSku || "0000"),
      };
    }

    await showPopup(sku);
  };

  // Função para detectar produto adicionado/modificado no carrinho
  async function detectAddedProduct() {
    try {
      // Aguardar API estar disponível
      const apiReady = await waitForAPI();
      if (!apiReady) {
        return null;
      }

      const cartItems = await window.napi.cart().read();
      const currentCartState = new Map();

      // Mapear estado atual do carrinho
      cartItems.forEach((item) => {
        if (!item.nonRemovable) {
          const sku = item.productId.split("/").pop();
          currentCartState.set(sku, item.quantity);
        }
      });

      // Comparar com estado anterior para detectar mudanças
      const addedProducts = [];

      for (const [sku, quantity] of currentCartState) {
        const previousQuantity = previousCartState.get(sku) || 0;

        if (quantity > previousQuantity) {
          addedProducts.push({
            sku: sku,
            addedQuantity: quantity - previousQuantity,
            totalQuantity: quantity,
            wasNewProduct: previousQuantity === 0, // Verifica se era um produto novo
          });
        }
      }

      // Atualizar estado anterior
      previousCartState = currentCartState;

      // Retornar o produto mais recentemente adicionado
      return addedProducts.length > 0
        ? addedProducts[addedProducts.length - 1]
        : null;
    } catch (error) {
      return null;
    }
  }
  async function getLastAddedProductSKU() {
    try {
      const cartItems = await window.napi.cart().read();

      // Filtrar apenas produtos com nonRemovable: false
      const removableItems = cartItems.filter(
        (item) => item.nonRemovable === false,
      );

      if (removableItems.length > 0) {
        // Pegar o último item (mais recente)
        const lastItem = removableItems[removableItems.length - 1];

        // Extrair apenas a parte final do productId (ex: 7884.90)
        const productId = lastItem.productId;
        const sku = productId.split("/").pop(); // Pega a última parte após a última barra

        return sku;
      }

      return null;
    } catch (error) {
      console.error("Erro ao obter SKU do último produto:", error);
      return null;
    }
  }

  // Inicializar estado anterior do carrinho
  async function initializePreviousCartState() {
    try {
      // Aguardar API estar disponível
      const apiReady = await waitForAPI();
      if (!apiReady) {
        return;
      }

      const cartItems = await window.napi.cart().read();
      cartItems.forEach((item) => {
        if (!item.nonRemovable) {
          const sku = item.productId.split("/").pop();
          previousCartState.set(sku, item.quantity);
        }
      });
    } catch (error) {}
  }

  // Aguardar span aparecer e configurar observador
  function setupObserver() {
    const span = document.querySelector("#ta-mini-basket__open .notranslate");

    if (span) {
      lastQuantity = parseInt(span.textContent) || 0;

      // Inicializar estado anterior do carrinho
      initializePreviousCartState();

      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.type === "characterData" ||
            mutation.type === "childList"
          ) {
            const currentQuantity = parseInt(span.textContent) || 0;

            // Só mostrar pop-up se a quantidade AUMENTAR (não diminuir)
            if (
              currentQuantity !== lastQuantity &&
              currentQuantity > lastQuantity
            ) {
              lastQuantity = currentQuantity;

              // Detectar produto adicionado usando comparação de estados
              detectAddedProduct().then(async (addedProduct) => {
                if (addedProduct) {
                  const sku = addedProduct.sku;

                  // Verificar se há recomendação para este SKU
                  const recommendedSku = RECOMMENDATION_MAP[sku];

                  if (recommendedSku) {
                    // Buscar dados do produto recomendado (sempre dinâmico)
                    currentProductData =
                      await getRecommendedProductData(recommendedSku);
                  }
                  try {
                    const productData = await window.napi
                      .catalog()
                      .getProduct(sku);
                    if (productData && productData.name) {
                      lastAddedProductName = productData.name;
                    }
                  } catch (e) {}
                }
                // Mostrar pop-up apenas se há produto recomendado E se era um produto novo E se produto recomendado não está no carrinho
                if (currentProductData && addedProduct?.wasNewProduct) {
                  const sku = addedProduct?.sku || "";
                  const recommendedSku = RECOMMENDATION_MAP[sku];

                  if (recommendedSku) {
                    // Verificar se produto recomendado já está no carrinho
                    const isRecommendedInCart =
                      await isRecommendedProductInCart(recommendedSku);

                    if (!isRecommendedInCart) {
                      setTimeout(async () => await showPopup(sku), 1000);
                    } else {
                    }
                  }
                }
              });
            } else if (currentQuantity !== lastQuantity) {
              // Atualizar quantidade mesmo se não aumentar (para manter sincronizado)
              lastQuantity = currentQuantity;
            }
          }
        });
      });

      observer.observe(span, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    } else {
      setTimeout(setupObserver, 100);
    }
  }

  // Inicializar com delay para aguardar API carregar
  function initializeScript() {
    setTimeout(() => {
      setupObserver();
    }, 2000); // 2 segundos de delay
  }

  // Inicializar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeScript);
  } else {
    initializeScript();
  }
})();
