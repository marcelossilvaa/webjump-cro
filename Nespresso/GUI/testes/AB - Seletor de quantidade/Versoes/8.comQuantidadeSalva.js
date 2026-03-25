(function () {
  "use strict";

  // Adicionar estilos CSS
  const styles = `
        <style>
        .primeContainer, article button.AddToBagButton{
          display:none !important;
        }
            article div[class*="purchaseSection"] > div[class*="container"]{
              position:relative;
              padding-bottom:16px;
            }

        .assinaturaInfoPLP{
              background:none !important;
              color:#876C43 !important;
              font-size:14px !important;
              font-weight:bold !important;
              display:flex;
              align-items:center;
              gap:4px;margin:5px 0 8px;
            }
        .assinaturaInfoPLP svg{
            flex-shrink:0;
            margin-bottom:-2px;
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
            
            .custom-add-to-cart-btn {
                width: 100%;
                margin-top: 10px;
                padding: 12px 24px;
                background-color: #257A57;
                color: white;
                border: none;
                border-radius: 0px 0px 12px 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position:absolute;
                bottom:0;
                left:0;
                font-size:13px;
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            
            .custom-add-to-cart-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .custom-add-to-cart-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            /* Animações para o botão de adicionar */
            .custom-add-to-cart-btn.morphing-out {
                transform: translateY(5px) scale(0.9);
                opacity: 0.7;
                background-color: #347259;
                transition: all 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19);
            }
            
            .custom-add-to-cart-btn.disappearing {
                transform: translateY(15px) scaleY(0.2) scaleX(1.1);
                opacity: 0;
                background-color: #E8F1EE;
                transition: all 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19);
                pointer-events: none;
            }
            
            .custom-add-to-cart-btn.success-feedback {
                background-color: #28a745;
                transform: scale(1.05);
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            .custom-add-to-cart-btn.success-feedback::after {
                content: "✓";
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
                opacity: 0;
                animation: checkmarkAppear 0.5s ease forwards;
            }
            
            @keyframes checkmarkAppear {
                0% {
                    opacity: 0;
                    transform: translateY(-50%) scale(0);
                }
                100% {
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                }
            }
            
            .original-add-button-hidden {
                opacity: 0 !important;
                transform: scale(0.8) !important;
                pointer-events: none !important;
                transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19) !important;
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

  function extrairNumeros(texto) {
    if (!texto || typeof texto !== "string") return "";

    // Regex mais específica para capturar preços brasileiros
    const match = texto.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
    return match ? match[1] : "";
  }

  // Função para obter a quantidade atual do carrinho
  function getCurrentCartQuantity(productElement) {
    const quantityElement = productElement.querySelector(
      ".AddToBagButtonSmall__quantity"
    );

    if (!quantityElement || !quantityElement.textContent.trim()) {
      return 0; // Não há quantidade no carrinho
    }

    const quantityText = quantityElement.textContent.trim();
    const quantity = parseInt(quantityText, 10);

    if (isNaN(quantity)) {
      return 0;
    }

    // Converter cápsulas para caixas (10 cápsulas = 1 caixa)
    return Math.floor(quantity / 10);
  }

  // Função para criar a comunicação de assinatura
  function createSignatureCopy(productElement) {
    const ariaLabel = productElement.getAttribute("aria-label");
    if (ariaLabel && (ariaLabel.includes("Kit") || ariaLabel.includes("KIT"))) {
      return; // Ignorar kits
    }

    const priceDiv = productElement.querySelector(
      'div[class*="purchaseSection"] div[class*="priceLabelWrapper"]'
    );

    if (!priceDiv || productElement.querySelector(".assinaturaInfoPLP")) {
      return; // Já existe um seletor ou não encontrou a seção
    }

    let priceElement = priceDiv.querySelector('span[class*="formattedPrice"]');
    if (priceElement) {
      let priceText = extrairNumeros(priceElement.textContent);
      let price = parseFloat(priceText.replace(",", "."));
      if (isNaN(price) || price <= 0) {
        return; // Não processar se o preço for inválido
      }
      price = parseFloat(extrairNumeros(priceElement.textContent));
      let priceSignature = (price * 0.9).toFixed(2).replace(".", ",");
      let signatureNewHTML =
        `<div class="_capsuleSleeveLabel_10cre_45 assinaturaInfoPLP"><div><span>R$ ` +
        priceSignature +
        `</span> na Assinatura</div><span class="info-icon" style="cursor:pointer;"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1C3.6168 1 1 3.6168 1 8C1 12.3832 3.6168 15 8 15C12.3832 15 15 12.3832 15 8C15 3.6168 12.3832 1 8 1ZM8 14.3C3.99619 14.3 1.7 12.0038 1.7 8C1.7 3.99619 3.99619 1.7 8 1.7C12.0038 1.7 14.3 3.99619 14.3 8C14.3 12.0038 12.0038 14.3 8 14.3Z" fill="#17171A"></path><path d="M8.35 5.375C8.63995 5.375 8.875 5.13995 8.875 4.85C8.875 4.56005 8.63995 4.325 8.35 4.325C8.06005 4.325 7.825 4.56005 7.825 4.85C7.825 5.13995 8.06005 5.375 8.35 5.375Z" fill="#17171A"></path><path d="M8.7 5.9H6.6V6.6H8V10.1H6.6V10.8H10.1V10.1H8.7V5.9Z" fill="#17171A"></path></svg></span></div>`;
      priceDiv.insertAdjacentHTML("afterend", signatureNewHTML);
    }
  }

  // Função para criar o seletor de quantidade
  function createQuantitySelector(productElement) {
    createSignatureCopy(productElement);
    const purchaseSection = productElement.querySelector(
      'div[class*="purchaseSection"] div[class*="capsuleAndSleeveLabelWrapper"]'
    );

    if (
      !purchaseSection ||
      purchaseSection.querySelector(".custom-quantity-selector")
    ) {
      return; // Já existe um seletor ou não encontrou a seção
    }

    // Obter SKU do produto
    const productSku = productElement.getAttribute("data-product-short-sku");
    const productName = productElement.getAttribute("aria-label");

    // Verificar quantidade atual no carrinho
    const currentBoxesInCart = getCurrentCartQuantity(productElement);
    const shouldShowSelector = currentBoxesInCart > 0;

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
                  currentBoxesInCart === 0 ? "zero" : ""
                }">${shouldShowSelector ? currentBoxesInCart : 1}</span>
                <button class="custom-quantity-btn custom-increase-btn" aria-label="Aumentar quantidade"><svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.51667 7.57578H0V5.88411H6.51667L6.5 0H8.38333V5.88411H14.5V7.57578H8.38333V14H6.51667V7.57578Z" fill="#347259"/>
</svg>

</button>
            </div>
            <button class="custom-add-to-cart-btn" data-sku="` +
      productSku +
      `" data-name="` +
      productName +
      `" style="${shouldShowSelector ? "display: none;" : ""}">
                ADICIONAR
            </button>
        `;

    // Inserir o seletor na seção de compra
    purchaseSection.insertAdjacentHTML("beforeend", selectorHTML);

    // Adicionar event listeners
    const selector = purchaseSection.querySelector(".custom-quantity-selector");
    const decreaseBtn = selector.querySelector(".custom-decrease-btn");
    const increaseBtn = selector.querySelector(".custom-increase-btn");
    const quantityDisplay = selector.querySelector(".custom-quantity-display");
    const addToCartBtn = purchaseSection.querySelector(
      ".custom-add-to-cart-btn"
    );

    let quantity = shouldShowSelector ? currentBoxesInCart : 1;
    let addToCartTimeout = null; // Para debouncing da função de adicionar ao carrinho

    // Função para animar a mudança de número
    function animateNumberChange(newValue) {
      const displayElement = quantityDisplay;

      // Remover classe de animação se existir
      displayElement.classList.remove("animating");
      void displayElement.offsetWidth; // Force reflow

      // Adicionar classe de animação
      displayElement.classList.add("animating");

      // Mudar o número no meio da animação para efeito mais suave
      setTimeout(() => {
        displayElement.textContent = newValue;
      }, 160);

      // Remover classe após animação
      setTimeout(() => {
        displayElement.classList.remove("animating");
      }, 400);
    }

    // Função para atualizar a quantidade
    function updateQuantity(newQuantity) {
      quantity = newQuantity;

      // Animar a mudança do número
      animateNumberChange(quantity);

      // Se a quantidade chegar a 0, ocultar o seletor e mostrar o botão original
      if (quantity === 0) {
        selector.classList.add("hiding");
        selector.classList.remove("pre-loaded"); // Remover pre-loaded se estava definido
        setTimeout(function () {
          selector.classList.remove(
            "active",
            "hiding",
            "morphing-in",
            "organic-morph"
          );
          // Mostrar novamente o botão de adicionar
          addToCartBtn.classList.remove(
            "disappearing",
            "morphing-out",
            "success-feedback"
          );
          addToCartBtn.style.display = "block";
        }, 300);
        quantityDisplay.classList.add("zero");
      } else {
        quantityDisplay.classList.remove("zero");
      }

      // Desabilitar botão de diminuir se quantidade for 0
      decreaseBtn.disabled = quantity <= 0;
    }

    // Função para criar transição orgânica do botão para o seletor
    function createOrganicTransition() {
      // Fase 1: Feedback inicial no botão (mais rápido)
      addToCartBtn.classList.add("morphing-out");

      setTimeout(() => {
        // Fase 2: Botão desaparece completamente
        addToCartBtn.classList.add("disappearing");

        setTimeout(() => {
          // Fase 3: Preparar o seletor para aparecer
          selector.style.display = "flex";
          selector.classList.add("morphing-in");
          selector.classList.remove("pre-loaded"); // Remover pre-loaded se estava definido

          // CORREÇÃO: Resetar quantidade para 1 quando o seletor reaparece
          quantity = 1;
          quantityDisplay.textContent = "1";
          quantityDisplay.classList.remove("zero");
          decreaseBtn.disabled = false; // Habilitar o botão de diminuir

          setTimeout(() => {
            // Fase 4: Seletor aparece com animação orgânica
            selector.classList.add("active", "organic-morph");

            setTimeout(() => {
              // Fase 5: Limpar classes de animação
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
        // Permitir diminuir até 0 para remover do carrinho
        decreaseBtn.classList.add("pulse");
        setTimeout(() => decreaseBtn.classList.remove("pulse"), 300);
        updateQuantity(quantity - 1);

        // Adicionar ao carrinho com debouncing (apenas se quantidade > 0)
        if (quantity > 0) {
          addToCart();
        } else {
          // Se chegou a 0, remover do carrinho
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

      // Adicionar ao carrinho com debouncing
      addToCart();
    });

    // Função para adicionar ao carrinho com debouncing
    function addToCart(isDirectAdd = false) {
      // Limpar timeout anterior se existir
      if (addToCartTimeout) {
        clearTimeout(addToCartTimeout);
      }

      // Se for adição direta (clique no botão ADICIONAR), executar imediatamente
      if (isDirectAdd) {
        executeAddToCart(1); // Sempre adiciona 1 caixa quando clica no botão
        return;
      }

      // Caso contrário, usar debouncing para mudanças de quantidade
      addToCartTimeout = setTimeout(() => {
        executeAddToCart(quantity);
      }, 500); // Aguarda 500ms após a última interação
    }

    // Função que executa a adição real ao carrinho
    function executeAddToCart(boxQuantity) {
      const capsulesQuantity = boxQuantity * 10; // 1 caixa = 10 cápsulas

      console.log("Adicionando ao carrinho:", {
        sku: productSku,
        name: productName,
        boxes: boxQuantity,
        capsules: capsulesQuantity,
      });

      try {
        // Usar a função da Nespresso para adicionar ao carrinho
        if (window.CartManager && window.CartManager.updateItem) {
          window.CartManager.updateItem(
            productSku,
            capsulesQuantity,
            null,
            null,
            false
          );
          console.log(
            `✅ Produto ${productSku} adicionado: ${boxQuantity} caixa(s) = ${capsulesQuantity} cápsulas`
          );
        } else {
          console.warn("⚠️ CartManager não encontrado. Executando fallback...");
          // Fallback: simular clique no botão original
          executeOriginalButtonFallback(boxQuantity);
        }
      } catch (error) {
        console.error("❌ Erro ao adicionar produto ao carrinho:", error);
        // Em caso de erro, usar o método original como fallback
        executeOriginalButtonFallback(boxQuantity);
      }
    }

    // Função de fallback usando o botão original
    function executeOriginalButtonFallback(boxQuantity) {
      const originalButton = productElement.querySelector(
        "button.AddToBagButton"
      );
      if (
        originalButton &&
        !originalButton.classList.contains("original-add-button-hidden")
      ) {
        // Temporariamente tornar o botão visível se estiver oculto
        const wasHidden = originalButton.style.display === "none";
        if (wasHidden) {
          originalButton.style.display = "";
        }

        // Clicar no botão original para cada caixa (já que o botão original adiciona 1 caixa)
        for (let i = 0; i < boxQuantity; i++) {
          originalButton.click();
        }

        // Restaurar o estado oculto se necessário
        if (wasHidden) {
          originalButton.style.display = "none";
        }

        console.log(
          `🔄 Fallback executado: ${boxQuantity} clique(s) no botão original`
        );
      }
    }

    // Event listener MELHORADO para adicionar ao carrinho
    addToCartBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();

      // Criar a transição orgânica
      createOrganicTransition();

      // Adicionar 1 caixa ao carrinho imediatamente (sem debouncing)
      setTimeout(() => {
        addToCart(true); // true = adição direta
      }, 100);
    });

    // Encontrar e configurar o botão original de adicionar ao carrinho
    const originalAddButton = productElement.querySelector(
      "button.AddToBagButton"
    );
    if (originalAddButton) {
      // Remover event listeners anteriores se existirem
      const newButton = originalAddButton.cloneNode(true);
      originalAddButton.parentNode.replaceChild(newButton, originalAddButton);

      // Adicionar event listener ao botão original
      newButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Esconder o botão original com animação
        newButton.classList.add("original-add-button-hidden");

        // Usar a nova transição orgânica
        setTimeout(function () {
          createOrganicTransition();
        }, 150);

        // Adicionar 1 caixa ao carrinho após a animação
        setTimeout(function () {
          updateQuantity(1);
          addToCart(true); // true = adição direta
        }, 200);
      });
    }

    // Função para observar mudanças na quantidade do carrinho
    function observeCartChanges() {
      const quantityObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.type === "characterData" ||
            mutation.type === "childList"
          ) {
            const newQuantity = getCurrentCartQuantity(productElement);

            // Se a quantidade mudou externamente (por exemplo, pelo mini carrinho)
            if (newQuantity !== quantity && newQuantity > 0) {
              quantity = newQuantity;
              quantityDisplay.textContent = newQuantity;
              decreaseBtn.disabled = quantity <= 1;

              // Se o seletor não estava visível, mostrá-lo
              if (!selector.classList.contains("active")) {
                selector.classList.add("pre-loaded", "active");
                selector.style.display = "flex";
                addToCartBtn.style.display = "none";
              }
            } else if (newQuantity === 0 && quantity > 0) {
              // Se o produto foi removido do carrinho
              updateQuantity(0);
            }
          }
        });
      });

      // Observar o elemento de quantidade
      const quantityElement = productElement.querySelector(
        ".AddToBagButtonSmall__quantity"
      );
      if (quantityElement) {
        quantityObserver.observe(quantityElement, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    }

    // Iniciar observação de mudanças no carrinho
    observeCartChanges();
  }

  // Função para processar todos os produtos
  function processProducts() {
    const products = document.querySelectorAll(
      "article[data-product-short-sku][aria-label]"
    );
    products.forEach((product) => {
      createQuantitySelector(product);
    });
  }

  // Função para aguardar o carregamento do grid
  function waitForGrid() {
    const grid = document.querySelector("plp-cards-grid");

    if (grid) {
      // Grid encontrado, processar produtos
      processProducts();

      // Configurar MutationObserver para observar mudanças
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === "childList") {
            // Novos elementos foram adicionados
            mutation.addedNodes.forEach(function (node) {
              if (node.nodeType === 1) {
                // É um elemento
                if (
                  node.matches("article[data-product-short-sku][aria-label]")
                ) {
                  createQuantitySelector(node);
                } else {
                  // Verificar se há produtos dentro do nó adicionado
                  const products = node.querySelectorAll(
                    "article[data-product-short-sku][aria-label]"
                  );
                  products.forEach((product) => {
                    createQuantitySelector(product);
                  });
                }
              }
            });
          }
        });
      });

      // Configurar o observer
      observer.observe(grid, {
        childList: true,
        subtree: true,
      });
    } else {
      // Grid ainda não carregou, tentar novamente
      setTimeout(waitForGrid, 100);
    }
  }

  // Iniciar quando o DOM estiver carregado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForGrid);
  } else {
    waitForGrid();
  }
})();
