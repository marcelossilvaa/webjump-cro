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
            }
            
            .custom-add-to-cart-btn:hover {
                background-color: #6B5439;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .custom-add-to-cart-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
        </style>
    `;

  // Adicionar estilos ao head
  document.head.insertAdjacentHTML("beforeend", styles);

  // Função para criar o seletor de quantidade
  function createQuantitySelector(productElement) {
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

    // Criar o HTML do seletor
    const selectorHTML =
      `
            <div class="custom-quantity-selector" data-sku="` +
      productSku +
      `">
                <button class="custom-quantity-btn custom-decrease-btn" aria-label="Diminuir quantidade"><svg width="15" height="2" viewBox="0 0 15 2" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.32353 2H0V-3.57284e-08H6.32353H8.67647H15V2H8.67647H6.32353Z" fill="#347259"/>
</svg>
</button>
                <span class="custom-quantity-display">1</span>
                <button class="custom-quantity-btn custom-increase-btn" aria-label="Aumentar quantidade"><svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.51667 7.57578H0V5.88411H6.51667L6.5 0H8.38333V5.88411H14.5V7.57578H8.38333V14H6.51667V7.57578Z" fill="#347259"/>
</svg>

</button>
            </div>
            <button class="custom-add-to-cart-btn" data-sku="` +
      productSku +
      `" data-name="` +
      productName +
      `">
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

    let quantity = 1;

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
        setTimeout(function () {
          selector.classList.remove("active", "hiding");
          const originalButton = productElement.querySelector(
            "button.AddToBagButton"
          );
          if (originalButton) {
            originalButton.classList.remove("original-add-button-hidden");
          }
        }, 300);
        quantityDisplay.classList.add("zero");
      } else {
        quantityDisplay.classList.remove("zero");
      }

      // Desabilitar botão de diminuir se quantidade for 0
      decreaseBtn.disabled = quantity <= 0;
    }

    // Event listener para diminuir quantidade
    decreaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (quantity > 0) {
        decreaseBtn.classList.add("pulse");
        setTimeout(() => decreaseBtn.classList.remove("pulse"), 300);
        updateQuantity(quantity - 1);
      }
    });

    // Event listener para aumentar quantidade
    increaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      increaseBtn.classList.add("pulse");
      setTimeout(() => increaseBtn.classList.remove("pulse"), 300);
      updateQuantity(quantity + 1);

      // Adicionar ao carrinho automaticamente quando aumentar a quantidade
      addToCart();
    });

    // Função para adicionar ao carrinho
    function addToCart() {
      console.log("Adicionando ao carrinho:", {
        sku: productSku,
        name: productName,
        quantity: quantity,
      });

      // Aqui você pode adicionar a lógica real de adicionar ao carrinho
      // Por exemplo, chamar uma API ou disparar um evento customizado

      // Simular clique no botão original para manter a funcionalidade existente
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

        // Clicar no botão original para cada unidade
        for (let i = 0; i < quantity; i++) {
          originalButton.click();
        }

        // Restaurar o estado oculto se necessário
        if (wasHidden) {
          originalButton.style.display = "none";
        }
      }
    }

    // Event listener para adicionar ao carrinho
    addToCartBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      addToCart();

      // Feedback visual temporário
      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = "Adicionado!";
      addToCartBtn.style.backgroundColor = "#28a745";

      setTimeout(function () {
        addToCartBtn.textContent = originalText;
        addToCartBtn.style.backgroundColor = "#876B4A";
        updateQuantity(1); // Resetar quantidade
      }, 2000);
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

        // Pequeno delay para criar sequência visual suave
        setTimeout(function () {
          // Mostrar o seletor de quantidade
          selector.style.display = "flex";
          setTimeout(function () {
            selector.classList.add("active");
          }, 10);
        }, 150);

        // Adicionar 1 item ao carrinho após a animação
        setTimeout(function () {
          updateQuantity(1);
          addToCart();
        }, 400);
      });
    }
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
