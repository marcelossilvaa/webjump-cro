(function () {
  "use strict";

  // Adicionar estilos CSS
  const styles = `
        <style>
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
            }
            
            .custom-quantity-btn {
                width: 40px;
                height: 40px;
                border-radius: 10px;
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
            
            .custom-quantity-btn:active {
                transform: scale(0.95);
            }
            
            .custom-quantity-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .custom-quantity-btn:disabled:hover {
                background-color: transparent;
                color: #876B4A;
            }
            
            .custom-quantity-display {
                font-size: 20px;
                font-weight: 600;
                color: #257A57;
                min-width: 30px;
                text-align: center;
            }
            
            .custom-add-to-cart-btn {
                width: 100%;
                margin-top: 10px;
                padding: 12px 24px;
                background-color: #876B4A;
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
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
        </style>
    `;

  // Adicionar estilos ao head
  document.head.insertAdjacentHTML("beforeend", styles);

  // Função para criar o seletor de quantidade
  function createQuantitySelector(productElement) {
    const purchaseSection = productElement.querySelector(
      'div[class*="purchaseSection"]'
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
                <button class="custom-quantity-btn custom-decrease-btn" aria-label="Diminuir quantidade">−</button>
                <span class="custom-quantity-display">1</span>
                <button class="custom-quantity-btn custom-increase-btn" aria-label="Aumentar quantidade">+</button>
            </div>
            <button class="custom-add-to-cart-btn" style="display:none;" data-sku="` +
      productSku +
      `" data-name="` +
      productName +
      `">
                Adicionar ao carrinho
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

    // Função para atualizar a quantidade
    function updateQuantity(newQuantity) {
      quantity = newQuantity;
      quantityDisplay.textContent = quantity;

      // Desabilitar botão de diminuir se quantidade for 1
      decreaseBtn.disabled = quantity <= 1;
    }

    // Event listener para diminuir quantidade
    decreaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (quantity > 1) {
        updateQuantity(quantity - 1);
      }
    });

    // Event listener para aumentar quantidade
    increaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      updateQuantity(quantity + 1);
    });

    // Event listener para adicionar ao carrinho
    addToCartBtn.addEventListener("click", function () {
      console.log("Adicionando ao carrinho:", {
        sku: productSku,
        name: productName,
        quantity: quantity,
      });

      // Aqui você pode adicionar a lógica real de adicionar ao carrinho
      // Por exemplo, chamar uma API ou disparar um evento customizado

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
