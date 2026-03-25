(function () {
  "use strict";
  const selector = "#block-8831091004917";
  const maxAttempts = 50;
  const intervalTime = 100;

  let attempts = 0;

  let cafes = {
    "Café Active - 80ml": {
      sku: "7192.70",
      quantity: 10,
    },
    "Café Vivida - 230ml": {
      sku: "7063.60",
      quantity: 10,
    },
    "Sweet Vanilla Decaffeinato": {
      sku: "7057.80",
      quantity: 10,
    },
    "Arpeggio Decaffeinato": {
      sku: "7862.90",
      quantity: 10,
    },
    "Taça Barista Mixologist": {
      sku: "145747",
      quantity: 1,
    },
    "Bolsa Reversível Lifestyle": {
      sku: "146925",
      quantity: 1,
    },
    "Cafeteira Essenza Mini Preta 110v": {
      sku: "C30-BR-BK-NE3",
      quantity: 1,
    },
  };

  const intervalId = setInterval(function () {
    attempts++;

    const element = document.querySelector(selector);
    if (element) {
      clearInterval(intervalId);
      element.insertAdjacentHTML(
        "beforebegin",
        `<!-- tag 1 -->
            <liveshop-ads-carousel-v2 height="500px" use-active-videos-from="nespresso"></liveshop-ads-carousel-v2>
        <!-- tag 2 -->
        <liveshop-ads-carousel height="auto" width="100%" stories-style="true" border-radius="25px" slugs-video="TQnXTkMR,bTM4ZMgs"></liveshop-ads-carousel>`
      );

      // ——————————————————————————————————————————————————————————————————————————————
      // SISTEMA DE SINCRONIZAÇÃO COM CARRINHO
      // ——————————————————————————————————————————————————————————————————————————————

      const cartSync = {
        buttonsBySKU: new Map(), // sku -> Set<HTMLButtonElement>
        listenerBound: false,
        napiCheckTimer: null,
        pendingAdditions: new Set(), // sku -> indica que está sendo adicionado
      };

      function extractSkuFromProductId(productId) {
        if (!productId || typeof productId !== "string") return null;
        const parts = productId.split("/");
        return parts[parts.length - 1] || null;
      }

      function registerButton(button, sku) {
        if (!sku || !button) return;
        if (!cartSync.buttonsBySKU.has(sku)) {
          cartSync.buttonsBySKU.set(sku, new Set());
        }
        cartSync.buttonsBySKU.get(sku).add(button);
      }

      async function getCartItems() {
        try {
          const cartApi = window.napi?.cart?.();
          if (!cartApi || typeof cartApi.read !== "function") return [];
          const ret = cartApi.read();
          if (ret && typeof ret.then === "function") {
            return await ret;
          }
          return Array.isArray(ret) ? ret : [];
        } catch (e) {
          return [];
        }
      }

      async function syncButtonsWithCart() {
        const items = await getCartItems();
        const inCartSkus = new Set(
          items
            .map((i) => extractSkuFromProductId(i?.productId))
            .filter(Boolean)
        );

        cartSync.buttonsBySKU.forEach((btnSet, sku) => {
          const added = inCartSkus.has(sku);
          btnSet.forEach((btn) => setButtonAddedState(btn, added));
        });
      }

      function setButtonAddedState(button, added) {
        if (!button) return;
        const sku = button.getAttribute("data-sku");
        const isPending = sku && cartSync.pendingAdditions.has(sku);

        // Se está pendente (sendo adicionado), não remove o loading ainda
        if (isPending && !added) {
          return; // Mantém o loading até confirmar que foi adicionado
        }

        // Remove loading apenas se não estiver pendente ou se foi confirmado como adicionado
        if (!isPending || added) {
          button.classList.remove("loading");
        }

        if (added) {
          button.classList.add("added");
          button.setAttribute("aria-pressed", "true");
          button.dataset.added = "true";
          button.disabled = true;
          // Adiciona o ícone de checkmark
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          // Remove da lista de pendentes quando confirmado
          if (sku) {
            cartSync.pendingAdditions.delete(sku);
          }
        } else {
          // Só remove o estado "added" se não estiver em loading ou pendente
          if (!button.classList.contains("loading") && !isPending) {
            button.classList.remove("added");
            button.removeAttribute("aria-pressed");
            delete button.dataset.added;
            button.disabled = false;
            button.textContent = "+";
          }
        }
      }

      function bindCartListenerIfPossible() {
        if (cartSync.listenerBound) return true;
        const dataApi = window.napi?.data?.();
        if (!dataApi || typeof dataApi.on !== "function") return false;

        dataApi.on("cart.update", function () {
          syncButtonsWithCart();
        });
        cartSync.listenerBound = true;
        return true;
      }

      function setupCartSync() {
        const bound = bindCartListenerIfPossible();
        if (bound) {
          syncButtonsWithCart();
          return;
        }
        if (cartSync.napiCheckTimer) return;
        let tries = 0;
        cartSync.napiCheckTimer = setInterval(() => {
          tries++;
          if (bindCartListenerIfPossible()) {
            clearInterval(cartSync.napiCheckTimer);
            cartSync.napiCheckTimer = null;
            syncButtonsWithCart();
          } else if (tries > 33) {
            clearInterval(cartSync.napiCheckTimer);
            cartSync.napiCheckTimer = null;
          }
        }, 300);
      }

      // Função para adicionar botão ao produto
      function addButtonToProduct(product) {
        // Tenta acessar o shadowRoot, se não estiver disponível, retorna
        if (!product || !product.shadowRoot) {
          return false;
        }

        const productName =
          product.shadowRoot.querySelector(".lav-product-name");
        const productInfo = product.shadowRoot.querySelector(
          ".liveshop-ads-video"
        );

        if (!productInfo) {
          return false;
        }

        // Verifica se já existe um botão neste produto
        const existingButton = productInfo.querySelector(".add-to-cart-button");
        if (existingButton) {
          return true; // Já tem botão
        }

        productInfo.style.position = "relative";
        const productData = productName
          ? cafes[productName.textContent.trim()]
          : null;
        const sku = productData ? productData.sku : null;
        const quantity = productData ? productData.quantity : null;

        if (sku && productInfo) {
          // Adiciona CSS dentro do shadowRoot se ainda não existir
          let styleElement = product.shadowRoot.querySelector(
            "style#add_cart_button_video_commerce_personalized"
          );
          if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "add_cart_button_video_commerce_personalized";
            styleElement.textContent = `
              .add-to-cart-button {
                background-color: #257a57;
                color: #fff;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-family: "NespressoLucas", sans-serif;
                transition: background-color 0.3s ease;
                width: 30px;
                height: 30px;
                padding: 0;
                font-size: 28px;
                font-weight: 400;
                display: flex;
                align-items: center;
                justify-content: center;
      
                position: absolute;
                bottom: 20px;
                right: 35px;
              }
              
              .add-to-cart-button.added {
                background-color: #5C5C5C;
                cursor: default;
                pointer-events: none;
                opacity: 1;
              }
              
              .add-to-cart-button.added svg {
                width: 20px;
                height: 20px;
                stroke: #fff;
              }
              
              .add-to-cart-button:disabled {
                cursor: default;
                pointer-events: none;
              }
              
              .add-to-cart-button.loading {
                background-color: #257a57;
                pointer-events: none;
              }
              
              .add-to-cart-button.loading::before {
                content: '';
                width: 10px;
                height: 10px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: #fff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }
              
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `;
            product.shadowRoot.appendChild(styleElement);
          }
          const button = document.createElement("button");
          button.className = "add-to-cart-button";
          button.textContent = "+";
          button.setAttribute("data-sku", sku);
          button.setAttribute("data-quantity", quantity);

          // Registra o botão no sistema de sincronização
          registerButton(button, sku);

          // Verifica o estado inicial do carrinho
          syncButtonsWithCart();

          button.addEventListener("click", function (event) {
            event.stopPropagation();
            // Não permite cliques se já estiver adicionado
            if (button.disabled || button.dataset.added === "true") {
              return;
            }

            // Adiciona estado de loading
            button.classList.add("loading");
            button.textContent = "";
            button.disabled = true;

            // Marca o SKU como pendente
            cartSync.pendingAdditions.add(sku);

            try {
              window.CartManager.updateItem(sku, quantity, null, null, false);

              // Aguarda o item aparecer no carrinho antes de remover o loading
              let attempts = 0;
              const maxAttempts = 30; // 30 tentativas = 6 segundos máximo
              const checkInterval = 200; // Verifica a cada 200ms

              const checkCartInterval = setInterval(async () => {
                attempts++;
                const items = await getCartItems();
                const inCartSkus = new Set(
                  items
                    .map((i) => extractSkuFromProductId(i?.productId))
                    .filter(Boolean)
                );

                if (inCartSkus.has(sku)) {
                  // Item encontrado no carrinho, remove da lista de pendentes e sincroniza
                  clearInterval(checkCartInterval);
                  cartSync.pendingAdditions.delete(sku);
                  syncButtonsWithCart();
                } else if (attempts >= maxAttempts) {
                  // Timeout - remove da lista de pendentes e restaura botão
                  clearInterval(checkCartInterval);
                  cartSync.pendingAdditions.delete(sku);
                  button.classList.remove("loading");
                  button.textContent = "+";
                  button.disabled = false;
                  syncButtonsWithCart();
                }
              }, checkInterval);
            } catch (error) {
              console.error("Erro ao adicionar ao carrinho:", error);
              // Remove da lista de pendentes e restaura botão em caso de erro
              cartSync.pendingAdditions.delete(sku);
              button.classList.remove("loading");
              button.textContent = "+";
              button.disabled = false;
            }
          });
          productInfo.appendChild(button);
          return true; // Botão adicionado com sucesso
        }

        return false;
      }

      // Função para processar todos os produtos visíveis
      function processAllProducts() {
        try {
          const carousel = document.querySelector("liveshop-ads-carousel-v2");
          if (!carousel || !carousel.shadowRoot) {
            return;
          }

          const swiperWrapper = carousel.shadowRoot.querySelector(
            ".swiper-horizontal .swiper-wrapper"
          );
          if (!swiperWrapper) {
            return;
          }

          // Busca todos os produtos, incluindo os que podem estar fora da viewport
          const allProducts =
            swiperWrapper.querySelectorAll("liveshop-ads-video");

          allProducts.forEach((product) => {
            // Tenta adicionar o botão, se o shadowRoot não estiver pronto, tenta novamente depois
            if (!addButtonToProduct(product)) {
              // Se falhou, pode ser que o shadowRoot ainda não esteja pronto
              // Vamos tentar novamente após um pequeno delay
              setTimeout(() => {
                addButtonToProduct(product);
              }, 100);
            }
          });

          // Sincroniza os botões com o carrinho após processar todos os produtos
          syncButtonsWithCart();
        } catch (error) {
          console.error("Erro ao processar produtos:", error);
        }
      }

      // Função com debounce para evitar muitas chamadas
      let processTimeout;
      function debouncedProcessAllProducts() {
        clearTimeout(processTimeout);
        processTimeout = setTimeout(() => {
          processAllProducts();
        }, 50);
      }

      // Processa produtos iniciais
      processAllProducts();

      // Observa mudanças no DOM para detectar novos produtos
      let carousel = document.querySelector("liveshop-ads-carousel-v2");
      if (carousel && carousel.shadowRoot) {
        const swiperWrapper = carousel.shadowRoot.querySelector(
          ".swiper-horizontal .swiper-wrapper"
        );

        if (swiperWrapper) {
          // MutationObserver para detectar quando novos produtos são adicionados
          const observer = new MutationObserver(() => {
            debouncedProcessAllProducts();
          });

          observer.observe(swiperWrapper, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"], // Observa mudanças de classe que podem indicar slides ativos
          });
        }
      }

      // Observa eventos de scroll e swipe no carousel
      if (carousel && carousel.shadowRoot) {
        const swiperContainer =
          carousel.shadowRoot.querySelector(".swiper-horizontal");
        if (swiperContainer) {
          // Observa eventos de scroll
          swiperContainer.addEventListener(
            "scroll",
            debouncedProcessAllProducts,
            {
              passive: true,
            }
          );

          // Observa eventos de touch (swipe)
          swiperContainer.addEventListener(
            "touchmove",
            debouncedProcessAllProducts,
            {
              passive: true,
            }
          );
          swiperContainer.addEventListener(
            "touchend",
            debouncedProcessAllProducts,
            {
              passive: true,
            }
          );
        }
      }

      // Observa mudanças no carousel principal (caso seja recriado)
      const carouselObserver = new MutationObserver(() => {
        const newCarousel = document.querySelector("liveshop-ads-carousel-v2");
        if (newCarousel && newCarousel !== carousel) {
          carousel = newCarousel;
          processAllProducts();
        }
      });

      if (document.body) {
        carouselObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }

      // Verificação periódica mais frequente para garantir que todos os produtos tenham botão
      setInterval(() => {
        processAllProducts();
      }, 300); // Verifica a cada 300ms (mais frequente)

      // Inicializa a sincronização com o carrinho
      setupCartSync();
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId);
    }
  }, intervalTime);
})();
