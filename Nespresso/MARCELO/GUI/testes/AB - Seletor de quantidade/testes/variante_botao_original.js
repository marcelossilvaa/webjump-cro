(function () {
  "use strict";

  // Adicionar estilos CSS
  const styles = `
        <style>
            article div[class*="purchaseSection"] > div[class*="container"]{
              position:relative;
              padding-bottom:16px;
            }

       
            .custom-quantity-selector {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin-top: 10px;
                padding: 10px;
                border-radius: 25px;
                width: fit-content;
                margin-left: auto;
                margin-right: auto;
                opacity: 0;
                transform: translateY(-20px) scale(0.8);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                pointer-events: none;
                max-height: 0;
                overflow: hidden;
            }
            
            .custom-quantity-selector.active {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
                max-height: 60px;
            }
            
            .custom-quantity-selector.hiding {
                opacity: 0;
                transform: translateY(20px) scale(0.8);
                transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
            }
            
            /* Nova animação para surgir do botão */
            .custom-quantity-selector.morphing-in {
                opacity: 0;
                transform: translateY(10px) scaleY(0.3) scaleX(1.2);
                border-radius: 12px;
                transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            }
            
            .custom-quantity-selector.morphing-in.active {
                opacity: 1;
                transform: translateY(0) scaleY(1) scaleX(1);
                border-radius: 25px;
                transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            }
            
            /* Estado inicial quando já tem produto no carrinho */
            .custom-quantity-selector.pre-loaded {
                display: flex !important;
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
                max-height: 60px;
            }
            
            .custom-quantity-btn {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                border: none;
                background-color: #E8F1EE;
                color: #347259;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                padding: 0;
                line-height: 1;
            }
            
            .custom-quantity-btn:hover {
                background-color: #347259;
                color: white;
            }
            .custom-quantity-btn:hover svg, .custom-quantity-btn:hover * {
                fill:#FFF;
                stroke:#FFF;
            }
            
            .custom-quantity-btn:active {
                transform: scale(0.95);
            }
            
            .custom-quantity-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .custom-quantity-btn:disabled:hover {
                background-color: #E8F1EE;
                color: #347259;
            }
            
            .custom-quantity-display {
                font-size: 20px;
                font-weight: 600;
                color: #257A57;
                min-width: 30px;
                text-align: center;
                position: relative;
                display: inline-block;
                transition: color 0.3s ease;
            }
            
            .custom-quantity-display.animating {
                animation: popEffect 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            @keyframes popEffect {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                40% {
                    transform: scale(0.7);
                    opacity: 0.6;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            .custom-quantity-display.zero {
                color: #999;
            }
            
            button.AddToBagButton {
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .custom-quantity-btn.pulse {
                animation: pulse 0.3s ease-in-out;
            }

            /* Animação orgânica de transição */
            @keyframes organicMorph {
                0% {
                    transform: scale(1) rotateX(0deg);
                    border-radius: 12px;
                }
                25% {
                    transform: scale(1.02) rotateX(5deg);
                    border-radius: 8px;
                }
                50% {
                    transform: scale(0.95) rotateX(0deg);
                    border-radius: 20px;
                }
                75% {
                    transform: scale(1.01) rotateX(-2deg);
                    border-radius: 25px;
                }
                100% {
                    transform: scale(1) rotateX(0deg);
                    border-radius: 25px;
                }
            }
            
            .organic-morph {
                animation: organicMorph 0.8s cubic-bezier(0.23, 1, 0.32, 1);
            }
        </style>
    `;

  // Adicionar estilos ao head
  document.head.insertAdjacentHTML("beforeend", styles);

  // Mapa global para rastrear os seletores por SKU com cache DOM expandido
  const selectorsMap = new Map();

  // Cache global de elementos DOM para evitar consultas repetitivas
  const domCache = new Map();

  /**
   * Sistema de cache DOM otimizado
   */
  class DOMCache {
    constructor() {
      this.cache = new Map();
      this.observers = new Map();
    }

    /**
     * Obter elemento do cache ou consultar e cachear
     */
    get(key, selector, context = document) {
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        // Verificar se o elemento ainda está no DOM
        if (cached.element && cached.element.isConnected) {
          return cached.element;
        } else {
          // Element foi removido do DOM, limpar cache
          this.cache.delete(key);
        }
      }

      // Consultar elemento e cachear
      const element = context.querySelector(selector);
      if (element) {
        this.cache.set(key, {
          element,
          selector,
          context,
          timestamp: Date.now(),
        });
      }

      return element;
    }

    /**
     * Cache múltiplos elementos
     */
    getAll(key, selector, context = document) {
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        // Verificar se elementos ainda estão no DOM
        if (
          cached.elements &&
          cached.elements.length > 0 &&
          cached.elements[0].isConnected
        ) {
          return cached.elements;
        } else {
          this.cache.delete(key);
        }
      }

      const elements = Array.from(context.querySelectorAll(selector));
      if (elements.length > 0) {
        this.cache.set(key, {
          elements,
          selector,
          context,
          timestamp: Date.now(),
        });
      }

      return elements;
    }

    /**
     * Cachear elemento específico com chave customizada
     */
    set(key, element) {
      if (element && element.isConnected) {
        this.cache.set(key, {
          element,
          timestamp: Date.now(),
        });
      }
    }

    /**
     * Remover item do cache
     */
    delete(key) {
      this.cache.delete(key);
    }

    /**
     * Limpar cache antigo (elementos com mais de 30 segundos)
     */
    cleanup() {
      const now = Date.now();
      const maxAge = 30000; // 30 segundos

      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > maxAge) {
          // Verificar se elemento ainda está conectado
          const element =
            cached.element || (cached.elements && cached.elements[0]);
          if (!element || !element.isConnected) {
            this.cache.delete(key);
          }
        }
      }
    }

    /**
     * Limpar cache específico de um produto
     */
    clearProduct(sku) {
      const keysToDelete = [];
      for (const [key] of this.cache.entries()) {
        if (key.includes(sku)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this.cache.delete(key));
    }
  }

  // Instância global do cache DOM
  const domCacheInstance = new DOMCache();

  // Limpeza periódica do cache
  setInterval(() => {
    domCacheInstance.cleanup();
  }, 30000);

  function extrairNumeros(texto) {
    if (!texto || typeof texto !== "string") return "";
    const match = texto.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
    return match ? match[1] : "";
  }

  // Função para detectar configuração dinâmica do produto
  function getProductConfig(productElement) {
    const cacheKey = `config_${productElement.getAttribute(
      "data-product-short-sku"
    )}`;

    // Verificar cache primeiro
    if (domCacheInstance.cache.has(cacheKey)) {
      return domCacheInstance.cache.get(cacheKey).config;
    }

    const ariaLabel = productElement.getAttribute("aria-label");

    // Verificar se é Kit primeiro
    if (ariaLabel && ariaLabel.toLowerCase().includes("kit")) {
      const config = {
        isKit: true,
        capsulesPerBox: 1,
        displayUnit: "kit",
        conversionNeeded: false,
      };

      // Cachear configuração
      domCacheInstance.cache.set(cacheKey, { config, timestamp: Date.now() });
      return config;
    }

    // Para cafés, buscar a quantidade na label de cápsulas usando cache
    const capsuleLabelKey = `capsule_label_${productElement.getAttribute(
      "data-product-short-sku"
    )}`;
    const capsuleLabel = domCacheInstance.get(
      capsuleLabelKey,
      'div[class*="defaultCapsuleLabel"]',
      productElement
    );

    let capsulesPerBox = 10; // default fallback

    if (capsuleLabel) {
      const labelText = capsuleLabel.textContent.trim();
      const match = labelText.match(/(\d+)\s*cápsulas?/i);
      if (match) {
        capsulesPerBox = parseInt(match[1]);
      }
    }

    const config = {
      isKit: false,
      capsulesPerBox: capsulesPerBox,
      displayUnit: "caixa",
      conversionNeeded: true,
    };

    // Cachear configuração
    domCacheInstance.cache.set(cacheKey, { config, timestamp: Date.now() });
    return config;
  }

  // Função para obter a quantidade de um produto específico no carrinho usando a API
  async function getCartQuantityFromAPI(productSku, productConfig) {
    try {
      if (!window.napi || !window.napi.cart) {
        console.warn("API do carrinho não disponível");
        return 0;
      }

      const cartData = await window.napi.cart().read();

      if (!cartData || !Array.isArray(cartData)) {
        return 0;
      }

      // Procurar o produto no carrinho
      const cartItem = cartData.find((item) => {
        // Verificar apenas produtos removíveis (não são presentes)
        if (item.nonRemovable) return false;

        // Extrair o SKU do productId (formato: "erp.br.b2c/prod/7043.80")
        const match =
          item.productId && item.productId.match(/\/prod\/(\d+\.\d+)/);
        if (match) {
          const itemSku = match[1];
          return itemSku === productSku;
        }
        return false;
      });

      if (cartItem) {
        // Converter usando a configuração específica do produto
        return productConfig.conversionNeeded
          ? Math.floor(cartItem.quantity / productConfig.capsulesPerBox)
          : cartItem.quantity;
      }

      return 0;
    } catch (error) {
      console.error("Erro ao obter quantidade do carrinho via API:", error);
      return 0;
    }
  }

  // Função para obter a quantidade atual do carrinho (fallback para o DOM) - OTIMIZADA
  function getCurrentCartQuantity(productElement, productConfig) {
    const sku = productElement.getAttribute("data-product-short-sku");
    const quantityElementKey = `quantity_${sku}`;

    // Usar cache para elemento de quantidade
    const quantityElement = domCacheInstance.get(
      quantityElementKey,
      ".AddToBagButtonSmall__quantity",
      productElement
    );

    if (!quantityElement || !quantityElement.textContent.trim()) {
      return 0;
    }

    const quantityText = quantityElement.textContent.trim();
    const quantity = parseInt(quantityText, 10);

    if (isNaN(quantity)) {
      return 0;
    }

    // Converter usando a configuração específica do produto
    return productConfig.conversionNeeded
      ? Math.floor(quantity / productConfig.capsulesPerBox)
      : quantity;
  }

  // Função global para atualizar todos os seletores quando o carrinho mudar - OTIMIZADA
  async function handleCartUpdate() {
    console.log("📦 Atualização do carrinho detectada");

    try {
      const cartData = await window.napi.cart().read();

      // Criar um mapa de SKUs no carrinho para acesso rápido
      const cartSkuMap = new Map();

      if (cartData && Array.isArray(cartData)) {
        cartData.forEach((item) => {
          if (!item.nonRemovable && item.productId) {
            const match = item.productId.match(/\/prod\/(\d+(?:\.\d+)?)/);
            if (match) {
              const sku = match[1];
              cartSkuMap.set(sku, item.quantity); // Manter quantidade em cápsulas
            }
          }
        });
      }

      // Atualizar todos os seletores registrados
      selectorsMap.forEach((selectorData, sku) => {
        const {
          // Elementos já cacheados no selectorData
          elements: { selector, quantityDisplay, decreaseBtn, addToCartBtn },
          updateQuantityInternal,
          productConfig,
        } = selectorData;

        const cartCapsules = cartSkuMap.get(sku) || 0;

        // Converter para unidades de exibição usando a configuração do produto
        const currentDisplayUnits = productConfig.conversionNeeded
          ? Math.floor(cartCapsules / productConfig.capsulesPerBox)
          : cartCapsules;

        console.log(
          `Atualizando SKU ${sku}: ${cartCapsules} cápsulas = ${currentDisplayUnits} ${productConfig.displayUnit}s`
        );

        // Atualizar a interface
        if (currentDisplayUnits > 0) {
          // Produto está no carrinho
          if (!selector.classList.contains("active")) {
            // Mostrar o seletor se estava oculto
            selector.classList.add("pre-loaded", "active");
            selector.style.display = "flex";
            addToCartBtn.style.display = "none";
          }

          // Atualizar a quantidade exibida
          quantityDisplay.textContent = currentDisplayUnits;
          quantityDisplay.classList.remove("zero");
          decreaseBtn.disabled = false;

          // IMPORTANTE: Atualizar a quantidade interna através da função
          updateQuantityInternal(currentDisplayUnits);
        } else {
          // Produto foi removido do carrinho
          if (selector.classList.contains("active")) {
            // Ocultar o seletor e mostrar o botão de adicionar
            selector.classList.add("hiding");
            selector.classList.remove("pre-loaded");

            setTimeout(function () {
              selector.classList.remove(
                "active",
                "hiding",
                "morphing-in",
                "organic-morph"
              );
              selector.style.display = "";

              // Mostrar novamente o botão de adicionar
              addToCartBtn.classList.remove(
                "disappearing",
                "morphing-out",
                "success-feedback",
                "original-add-button-hidden"
              );
              addToCartBtn.style.display = "inline-block";
              // Resetar para quantidade 1 (para próxima adição)
              quantityDisplay.textContent = "1";
              quantityDisplay.classList.remove("zero");

              // IMPORTANTE: Atualizar a quantidade interna através da função
              updateQuantityInternal(1);
            }, 300);
          }
        }
      });
    } catch (error) {
      console.error("Erro ao processar atualização do carrinho:", error);
    }
  }

  // Registrar o listener global de atualização do carrinho
  if (window.napi && window.napi.data) {
    window.napi.data().on("cart.update", handleCartUpdate);
    console.log("✅ Listener de atualização do carrinho registrado");
  } else {
    console.warn("⚠️ API napi.data não disponível");
  }

  // Função para criar o seletor de quantidade - OTIMIZADA
  async function createQuantitySelector(productElement) {

    const sku = productElement.getAttribute("data-product-short-sku");

    // Verificar se produto está disponível usando cache DOM
    const outOfStockKey = `out_of_stock_${sku}`;
    const outOfStockElement = domCacheInstance.get(
      outOfStockKey,
      "div[class*='outOfStock']",
      productElement
    );

    if (outOfStockElement) {
      console.log(
        `❌ Produto ${sku} fora de estoque - seletor não será criado`
      );
      return;
    }

    const purchaseSectionKey = `purchase_section_${sku}`;

    // Usar cache para seção de compra
    const purchaseSection = domCacheInstance.get(
      purchaseSectionKey,
      'div[class*="purchaseSection"] div[class*="capsuleAndSleeveLabelWrapper"]',
      productElement
    );

    if (
      !purchaseSection ||
      domCacheInstance.get(
        `selector_${sku}`,
        ".custom-quantity-selector",
        purchaseSection
      )
    ) {
      return;
    }

    // Obter SKU do produto e configuração dinâmica
    const productSku = productElement.getAttribute("data-product-short-sku");
    const productName = productElement.getAttribute("aria-label");
    const productConfig = getProductConfig(productElement);

    console.log(
      `📝 Produto ${productSku}: ${productConfig.capsulesPerBox} ${
        productConfig.conversionNeeded ? "cápsulas por caixa" : "unidade(s)"
      }`
    );

    // Verificar quantidade atual no carrinho via API primeiro, com fallback para DOM
    let currentUnitsInCart = await getCartQuantityFromAPI(
      productSku,
      productConfig
    );

    // Se a API não retornou resultado, usar o método DOM como fallback
    if (currentUnitsInCart === 0) {
      currentUnitsInCart = getCurrentCartQuantity(
        productElement,
        productConfig
      );
    }

    const shouldShowSelector = currentUnitsInCart > 0;

    // Criar o HTML do seletor
    const selectorHTML =
      `
            <div class="custom-quantity-selector ${
              shouldShowSelector ? "pre-loaded active" : ""
            }" data-sku="` +
      productSku +
      `">
                <button class="custom-quantity-btn custom-decrease-btn" aria-label="Diminuir quantidade"><svg width="15" height="2" viewBox="0 0 15 2" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.32353 2H0V-3.57284e-08H6.32353H8.67647H15V2H8.67647H6.32353Z" fill="#347259"/>
</svg>
</button>
                <span class="custom-quantity-display ${
                  currentUnitsInCart === 0 ? "zero" : ""
                }">${shouldShowSelector ? currentUnitsInCart : 1}</span>
                <button class="custom-quantity-btn custom-increase-btn" aria-label="Aumentar quantidade"><svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.51667 7.57578H0V5.88411H6.51667L6.5 0H8.38333V5.88411H14.5V7.57578H8.38333V14H6.51667V7.57578Z" fill="#347259"/>
</svg>

</button>
            </div>
        `;

    // Inserir o seletor na seção de compra
    purchaseSection.insertAdjacentHTML("beforeend", selectorHTML);

    // Cachear elementos criados imediatamente
    const selector = purchaseSection.querySelector(".custom-quantity-selector");
    const decreaseBtn = selector.querySelector(".custom-decrease-btn");
    const increaseBtn = selector.querySelector(".custom-increase-btn");
    const quantityDisplay = selector.querySelector(".custom-quantity-display");
    let addToCartBtn = productElement.querySelector(
      "button.AddToBagButton"
    );
    if (addToCartBtn) {
      const newButton = addToCartBtn.cloneNode(true);
      addToCartBtn.parentNode.replaceChild(newButton, addToCartBtn);
      addToCartBtn = newButton; // Atualiza a referência
    }

    // Cache de elementos DOM específicos do produto
    const elementCache = {
      selector,
      decreaseBtn,
      increaseBtn,
      quantityDisplay,
      addToCartBtn,
      purchaseSection,
      productElement,
    };

    // Cachear elementos individuais
    domCacheInstance.set(`selector_${sku}`, selector);
    domCacheInstance.set(`decrease_btn_${sku}`, decreaseBtn);
    domCacheInstance.set(`increase_btn_${sku}`, increaseBtn);
    domCacheInstance.set(`quantity_display_${sku}`, quantityDisplay);
    domCacheInstance.set(`add_cart_btn_${sku}`, addToCartBtn);

    let quantity = shouldShowSelector ? currentUnitsInCart : 1;
    let addToCartTimeout = null;

    // Função para animar a mudança de número
    function animateNumberChange(newValue) {
      const displayElement = quantityDisplay;

      displayElement.classList.remove("animating");
      void displayElement.offsetWidth;

      displayElement.classList.add("animating");

      setTimeout(() => {
        displayElement.textContent = newValue;
      }, 160);

      setTimeout(() => {
        displayElement.classList.remove("animating");
      }, 400);
    }

    // Função para atualizar a quantidade INTERNA (sem animações)
    function updateQuantityInternal(newQuantity) {
      quantity = newQuantity;
      // Não faz animações, apenas atualiza o valor interno
    }

    // Função para atualizar a quantidade
    function updateQuantity(newQuantity) {
      quantity = newQuantity;

      animateNumberChange(quantity);

      if (quantity === 0) {
        selector.classList.add("hiding");
        selector.classList.remove("pre-loaded");
        setTimeout(function () {
          selector.classList.remove(
            "active",
            "hiding",
            "morphing-in",
            "organic-morph"
          );
          addToCartBtn.classList.remove(
            "disappearing",
            "morphing-out",
            "success-feedback",
            "original-add-button-hidden" 
          );
          addToCartBtn.style.display = "inline-block";
        }, 300);
        quantityDisplay.classList.add("zero");
      } else {
        quantityDisplay.classList.remove("zero");
      }

      decreaseBtn.disabled = quantity <= 0;
    }

    // Registrar o seletor no mapa global com cache de elementos DOM
    const selectorData = {
      elements: elementCache, // Cache de elementos DOM
      updateQuantity,
      updateQuantityInternal,
      productConfig, // Adicionar configuração do produto
      quantity,
    };

    selectorsMap.set(productSku, selectorData);

    // Função para criar transição orgânica do botão para o seletor
    function createOrganicTransition() {
      addToCartBtn.classList.add("morphing-out");

      setTimeout(() => {
        addToCartBtn.classList.add("disappearing");

        setTimeout(() => {
          selector.style.display = "flex";
          selector.classList.add("morphing-in");
          selector.classList.remove("pre-loaded");

          quantity = 1;
          quantityDisplay.textContent = "1";
          quantityDisplay.classList.remove("zero");
          decreaseBtn.disabled = false;

          setTimeout(() => {
            selector.classList.add("active", "organic-morph");

            setTimeout(() => {
              selector.classList.remove("morphing-in", "organic-morph");
            }, 800);
          }, 50);
        }, 200);
      }, 150);
    }

    // Event listener para diminuir quantidade
    decreaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (quantity > 0) {
        decreaseBtn.classList.add("pulse");
        setTimeout(() => decreaseBtn.classList.remove("pulse"), 300);
        updateQuantity(quantity - 1);

        if (quantity > 0) {
          addToCart();
        } else {
          executeAddToCart(0);
        }
      }
    });

    // Event listener para aumentar quantidade
    increaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      increaseBtn.classList.add("pulse");
      setTimeout(() => increaseBtn.classList.remove("pulse"), 300);
      updateQuantity(quantity + 1);

      addToCart();
    });

    // Função para adicionar ao carrinho com debouncing
    function addToCart(isDirectAdd = false) {
      if (addToCartTimeout) {
        clearTimeout(addToCartTimeout);
      }

      if (isDirectAdd) {
        executeAddToCart(1);
        return;
      }

      addToCartTimeout = setTimeout(() => {
        executeAddToCart(quantity);
      }, 500);
    }

    // Função que executa a adição real ao carrinho
    function executeAddToCart(displayQuantity) {
      // Converter para quantidade de cápsulas baseado na configuração do produto
      const capsulesQuantity = productConfig.conversionNeeded
        ? displayQuantity * productConfig.capsulesPerBox
        : displayQuantity;

      console.log("Adicionando ao carrinho:", {
        sku: productSku,
        name: productName,
        displayUnits: displayQuantity,
        capsules: capsulesQuantity,
        config: productConfig,
      });

      // Atualizar a quantidade no objeto do seletor
      selectorData.quantity = displayQuantity;

      try {
        if (window.CartManager && window.CartManager.updateItem) {
          window.CartManager.updateItem(
            productSku,
            capsulesQuantity,
            null,
            null,
            false
          );
          console.log(
            `✅ Produto ${productSku} adicionado: ${displayQuantity} ${productConfig.displayUnit}(s) = ${capsulesQuantity} cápsulas`
          );
        } else {
          console.warn("⚠️ CartManager não encontrado. Executando fallback...");
          executeOriginalButtonFallback(displayQuantity);
        }
      } catch (error) {
        console.error("❌ Erro ao adicionar produto ao carrinho:", error);
        executeOriginalButtonFallback(displayQuantity);
      }
    }

    // Função de fallback usando o botão original
    function executeOriginalButtonFallback(displayQuantity) {
      const originalButtonKey = `original_btn_${sku}`;
      const originalButton = domCacheInstance.get(
        originalButtonKey,
        "button.AddToBagButton",
        productElement
      );

      if (
        originalButton &&
        !originalButton.classList.contains("original-add-button-hidden")
      ) {
        const wasHidden = originalButton.style.display === "none";
        if (wasHidden) {
          originalButton.style.display = "";
        }

        for (let i = 0; i < displayQuantity; i++) {
          originalButton.click();
        }

        if (wasHidden) {
          originalButton.style.display = "none";
        }

        console.log(
          `🔄 Fallback executado: ${displayQuantity} clique(s) no botão original`
        );
      }
    }

    // Event listener para adicionar ao carrinho
    addToCartBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();

      createOrganicTransition();

      setTimeout(() => {
        addToCart(true);
      }, 100);
    });

    // Encontrar e configurar o botão original de adicionar ao carrinho - OTIMIZADO
    const originalAddButtonKey = `original_add_btn_${sku}`;
    const originalAddButton = domCacheInstance.get(
      originalAddButtonKey,
      "button.AddToBagButton",
      productElement
    );

    if (originalAddButton) {
      const newButton = addToCartBtn;
      newButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        newButton.classList.add("original-add-button-hidden");

        setTimeout(function () {
          createOrganicTransition();
        }, 150);

        setTimeout(function () {
          updateQuantity(1);
          addToCart(true);
        }, 200);
      });
    }

    // Função para observar mudanças na quantidade do carrinho (fallback) - OTIMIZADA
    function observeCartChanges() {
      const quantityObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.type === "characterData" ||
            mutation.type === "childList"
          ) {
            const newQuantity = getCurrentCartQuantity(
              productElement,
              productConfig
            );

            if (newQuantity !== quantity && newQuantity > 0) {
              quantity = newQuantity;
              quantityDisplay.textContent = newQuantity;
              decreaseBtn.disabled = quantity <= 1;

              if (!selector.classList.contains("active")) {
                selector.classList.add("pre-loaded", "active");
                selector.style.display = "flex";
                addToCartBtn.style.display = "none";
              }
            } else if (newQuantity === 0 && quantity > 0) {
              updateQuantity(0);
            }
          }
        });
      });

      // Usar cache para elemento de quantidade
      const quantityElementKey = `cart_quantity_${sku}`;
      const quantityElement = domCacheInstance.get(
        quantityElementKey,
        ".AddToBagButtonSmall__quantity",
        productElement
      );

      if (quantityElement) {
        quantityObserver.observe(quantityElement, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    }

    observeCartChanges();
  }

  // Função para processar todos os produtos - OTIMIZADA
  async function processProducts() {
    const products = domCacheInstance.getAll(
      "all_products",
      "article[data-product-short-sku][aria-label]"
    );

    // Processar produtos em paralelo para melhor performance
    const promises = Array.from(products).map((product) =>
      createQuantitySelector(product)
    );
    await Promise.all(promises);

    // Fazer uma verificação inicial do carrinho após processar todos os produtos
    setTimeout(handleCartUpdate, 500);
  }

  // Função para aguardar o carregamento do grid - OTIMIZADA
  function waitForGrid() {
    const grid = domCacheInstance.get("main_grid", "plp-cards-grid");

    if (grid) {
      // Grid encontrado, processar produtos iniciais
      processProducts();

      // Configurar MutationObserver para observar mudanças
      const observer = new MutationObserver(function (mutations) {
        let shouldProcess = false;

        mutations.forEach(function (mutation) {
          if (mutation.type === "childList") {
            // Verificar se há novos elementos relevantes
            mutation.addedNodes.forEach(function (node) {
              if (node.nodeType === 1) {
                // É um elemento
                if (
                  node.matches("article[data-product-short-sku][aria-label]")
                ) {
                  createQuantitySelector(node);
                  shouldProcess = true;
                } else {
                  // Verificar se há produtos dentro do nó adicionado
                  const products = node.querySelectorAll(
                    "article[data-product-short-sku][aria-label]"
                  );
                  if (products.length > 0) {
                    products.forEach((product) => {
                      createQuantitySelector(product);
                    });
                    shouldProcess = true;
                  }
                }
              }
            });
          } else if (mutation.type === "attributes") {
            // Verificar mudanças de atributos em elementos relevantes
            const target = mutation.target;
            if (
              target.matches &&
              target.matches("article[data-product-short-sku][aria-label]")
            ) {
              createQuantitySelector(target);
              shouldProcess = true;
            }
          }
        });

        // Executar processamento geral se necessário (com throttling)
        if (shouldProcess) {
          clearTimeout(window.gridProcessTimeout);
          window.gridProcessTimeout = setTimeout(() => {
            processProducts();
          }, 300); // Aguarda 300ms após a última mudança
        }
      });

      // Configurar o observer com opções mais específicas
      observer.observe(grid, {
        attributes: true,
        attributeFilter: ["data-product-short-sku", "aria-label", "class"], // Observar apenas atributos relevantes
        childList: true,
        subtree: true,
        characterData: false, // Não observar mudanças de texto
      });

      // Observar mudanças de visibilidade do grid (para SPAs)
      if ("IntersectionObserver" in window) {
        const visibilityObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
              // Grid ficou visível, verificar se precisa reprocessar
              setTimeout(() => {
                processProducts();
              }, 100);
            }
          });
        });

        visibilityObserver.observe(grid);
      }

      // Adicionar listener para eventos customizados (caso a aplicação dispare)
      grid.addEventListener("gridUpdated", function () {
        processProducts();
      });

      // Verificação periódica como fallback (apenas se necessário)
      const periodicCheck = setInterval(() => {
        const currentProducts = domCacheInstance.getAll(
          "current_products_check",
          "article[data-product-short-sku][aria-label]",
          grid
        );
        const currentProductCount = currentProducts.length;

        if (currentProductCount !== window.lastProductCount) {
          window.lastProductCount = currentProductCount;
          processProducts();
        }
      }, 2000);

      // Limpar intervalo quando a página for descarregada
      window.addEventListener("beforeunload", () => {
        clearInterval(periodicCheck);
        // Limpar cache DOM ao sair da página
        domCacheInstance.cache.clear();
      });
    } else {
      // Grid ainda não carregou, tentar novamente com backoff exponencial
      const retryDelay = window.gridRetryDelay || 100;
      window.gridRetryDelay = Math.min(retryDelay * 1.2, 2000); // Aumenta o delay até 2s

      setTimeout(waitForGrid, retryDelay);
    }
  }

  // Função para fazer uma verificação inicial do carrinho quando a página carregar
  async function initialCartCheck() {
    try {
      // Aguardar um pouco para garantir que tudo esteja carregado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fazer a verificação inicial
      await handleCartUpdate();

      console.log("✅ Verificação inicial do carrinho concluída");
    } catch (error) {
      console.error("Erro na verificação inicial do carrinho:", error);
    }
  }

  // Iniciar quando o DOM estiver carregado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      waitForGrid();
      initialCartCheck();
    });
  } else {
    waitForGrid();
    initialCartCheck();
  }
})();
