// VERSÃO SIMPLIFICADA - Pop-up Napoli
(function () {
  'use strict';

  // Mapeamento de recomendações
  const RECOMMENDATION_MAP = {
    '7885.90': '7871.90', // Ristretto → Corto
    '7857.90': '7871.90', // Ristretto Decaf → Corto
    '7888.90': '7874.90', // Arpeggio → Indonesia
    '7862.90': '7874.90', // Arpeggio Decaf → Indonesia
    '7865.90': '7892.90', // Volluto → Chiaro
    '7864.90': '7892.90', // Volluto Decaf → Chiaro
    '7011.80': '7042.80', // Ristretto Intenso → Intenso
    '7010.80': '7026.80', // Ristretto Clássico → Mexico
  };

  let popupShown = false;
  let lastQuantity = 0;
  let currentProductData = null;
  let lastAddedProductName = '';
  let previousCartState = new Map(); // Armazena estado anterior do carrinho

  // Função para buscar dados do produto recomendado
  async function getRecommendedProductData(sku) {
    try {
      const productData = await window.napi.catalog().getProduct(sku);
      return productData;
    } catch (error) {
      window.alert('Erro ao buscar dados do produto:', error);
      return null;
    }
  }

  // Função para mostrar pop-up
  function showPopup(sku = '') {
    if (popupShown) {
      window.alert('O pop-up já está sendo exibido');
      return;
    }
    if (document.getElementById('napoli-popup')) {
      window.alert('O pop-up já está sendo exibido');
      return;
    }

    popupShown = true;

    // Exibir apenas com dados reais do produto recomendado
    if (!currentProductData) {
      window.alert('Não foi possível encontrar dados do produto recomendado');
      return;
    }
    const productData = currentProductData;

    const productName = productData.name || '';
    const productDescription = productData.headline || '';
    const productIntensity = productData.capsuleProperties?.intensity || '';
    const productPrice = productData.unitPrice || '';
    const productImage = productData.responsiveImages?.plp || productData.images?.main || '';

    const popupHTML = `
            <style>
              #napoli-popup .AddToBagButtonSmall {
                width: 100% !important;
                border-radius: 20px !important;
              }
              #napoli-popup .add-to-bag {
                width: 100% !important;
              }
              #napoli-popup #MiniBasketPushAddProductCTA {
                width: 65% !important;
              }
              #napoli-popup .AddToBagButton__button-CremaComponentId-${Date.now()} {
                border-radius: 20px !important;
              }
              #napoli-popup .AddToBagButtonSmall__quantity {
                display: flex !important;
                justify-content: center !important;
                gap: 6px !important;
                align-items: center !important;
              }
              #napoli-popup .add-to-cart-text {
                display: inline-block !important;
                margin-right: 8px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                color: #333 !important;
              }
            </style>
            <div id="napoli-popup" style="position: fixed; bottom: 20px; left: 20px; z-index: 9999; max-width: 450px; animation: slideInLeft 0.3s ease-out;">
                <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #999; font-size: 16px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px;">QUEM COMPRA "${
                          lastAddedProductName || sku
                        }" TAMBÉM COMPRA</h3>
                        <button onclick="closeNapoliPopup()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</button>
                    </div>
                    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
                        <img src="${productImage}" alt="${productName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 18px; font-weight: 700;">${productName}</h4>
                            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.4;">${productDescription}</p>
                            ${
                              productIntensity > 0
                                ? `
                            <div style="margin-bottom: 0;">
                                <span style="display: block; color: #666; font-size: 14px; margin-bottom: 4px;">Intensidade: ${'-'.repeat(
                                  productIntensity
                                )}${productIntensity}</span>
                            </div>
                            `
                                : ''
                            }
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                         <div id="MiniBasketPushAddProductCTA">
                             <div class="add-to-bag" data-product-id="${
                               currentProductData?.id || 'erp.br.b2c/prod/7895.90'
                             }" data-button-size="small">
                                 <div class="AddToBagButton__container">
                                     <div id="AddToBagButton__button-CremaComponentId-${Date.now()}">
                                         <button class="AddToBagButton AddToBagButtonSmall" data-focus-id="AddToBagButton__button-CremaComponentId-${Date.now()}" type="button" data-qa="${productName}">
                                             <span class="VisuallyHidden">Você não possui nenhum ${productName} em seu carrinho. Ative para adicioná-lo.</span>
                                             <span class="add-to-cart-text">Adicionar ao carrinho</span>
                                             <div aria-hidden="true" class="AddToBagButtonSmall__quantity">
                                                 <i aria-hidden="true" class="Glyph Glyph--plus AddToBagButtonSmall__icon-sign"></i>
                                             </div>
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <button onclick="closeNapoliPopup()" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #999; padding: 8px 0;">Depois</button>
                     </div>
                </div>
            </div>
            <style>
                @keyframes slideInLeft {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                #napoli-popup button:hover {
                    opacity: 0.8;
                }
            </style>
        `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Inicializa módulos Mosaic na área do CTA, se disponível
    try {
      const ctaContainer = document.getElementById('MiniBasketPushAddProductCTA');
      if (typeof window.mosaic !== 'undefined' && ctaContainer) {
        setTimeout(function () {
          window.mosaic.initializeAllFreeHTMLModules(ctaContainer);
        }, 200);
      }
    } catch (e) {}

    // Inicializar o componente AddToBag após inserir no DOM
    setTimeout(() => {
      const addToBagElement = document.querySelector(
        '#napoli-popup #MiniBasketPushAddProductCTA .add-to-bag'
      );

      // Reforça inicialização Mosaic no container do CTA
      try {
        const ctaContainer = document.getElementById('MiniBasketPushAddProductCTA');
        if (typeof window.mosaic !== 'undefined' && ctaContainer) {
          window.mosaic.initializeAllFreeHTMLModules(ctaContainer);
          // Se possível, também inicializa diretamente o módulo do próprio elemento
          if (addToBagElement) {
            window.mosaic.initializeAllFreeHTMLModules(addToBagElement);
          }
        }
      } catch (e) {}

      if (addToBagElement && window.napi) {
        const button = addToBagElement.querySelector('button');
        if (button) {
          button.addEventListener(
            'click',
            async function (e) {
              e.preventDefault();
              const productId = addToBagElement.getAttribute('data-product-id');
              if (productId && window.napi && window.napi.cart) {
                const cartApi = window.napi.cart();
                let added = false;
                // Tentativa 1: addProducts
                try {
                  if (typeof cartApi.addProducts === 'function') {
                    await cartApi.addProducts([{ productId: productId, quantity: 1 }]);
                    added = true;
                  }
                } catch (_) {}
                // Tentativa 2: addOrUpdateProducts
                if (!added) {
                  try {
                    if (typeof cartApi.addOrUpdateProducts === 'function') {
                      await cartApi.addOrUpdateProducts([{ productId: productId, quantity: 1 }]);
                      added = true;
                    }
                  } catch (_) {}
                }
                // Tentativa 3: updateProducts
                if (!added) {
                  try {
                    if (typeof cartApi.updateProducts === 'function') {
                      await cartApi.updateProducts([{ productId: productId, quantity: 1 }]);
                      added = true;
                    }
                  } catch (_) {}
                }

                // Validação lendo o carrinho em seguida
                try {
                  const cartData = await cartApi.read();
                  // sucesso mínimo: cartData truthy
                  if (cartData) {
                    // fechar popup após pequena pausa
                    setTimeout(() => {
                      const popup = document.getElementById('napoli-popup');
                      if (popup) popup.remove();
                    }, 800);
                  }
                } catch (_) {}
              }
            },
            true
          );
        }
      }
    }, 100);
  }

  // Função para fechar pop-up
  window.closeNapoliPopup = function () {
    const popup = document.getElementById('napoli-popup');
    if (popup) {
      popup.remove();
    }
    // Resetar flag para permitir novo pop-up
    popupShown = false;
  };

  // Função para detectar produto adicionado/modificado no carrinho
  async function detectAddedProduct() {
    try {
      const cartItems = await window.napi.cart().read();
      const currentCartState = new Map();

      // Mapear estado atual do carrinho
      cartItems.forEach((item) => {
        if (!item.nonRemovable) {
          const sku = item.productId.split('/').pop();
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
          });
        }
      }

      // Atualizar estado anterior
      previousCartState = currentCartState;

      // Retornar o produto mais recentemente adicionado
      return addedProducts.length > 0 ? addedProducts[addedProducts.length - 1] : null;
    } catch (error) {
      window.alert('Erro ao detectar produto adicionado: ' + error.message);
      return null;
    }
  }
  async function getLastAddedProductSKU() {
    try {
      const cartItems = await window.napi.cart().read();

      // Filtrar apenas produtos com nonRemovable: false
      const removableItems = cartItems.filter((item) => item.nonRemovable === false);

      if (removableItems.length > 0) {
        // Pegar o último item (mais recente)
        const lastItem = removableItems[removableItems.length - 1];

        // Extrair apenas a parte final do productId (ex: 7884.90)
        const productId = lastItem.productId;
        const sku = productId.split('/').pop(); // Pega a última parte após a última barra

        return sku;
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter SKU do último produto:', error);
      return null;
    }
  }

  // Inicializar estado anterior do carrinho
  async function initializePreviousCartState() {
    try {
      const cartItems = await window.napi.cart().read();
      cartItems.forEach((item) => {
        if (!item.nonRemovable) {
          const sku = item.productId.split('/').pop();
          previousCartState.set(sku, item.quantity);
        }
      });
      window.alert('Estado inicial do carrinho carregado');
    } catch (error) {
      window.alert('Erro ao carregar estado inicial: ' + error.message);
    }
  }

  // Aguardar span aparecer e configurar observador
  function setupObserver() {
    const span = document.querySelector('#ta-mini-basket__open .notranslate');

    if (span) {
      lastQuantity = parseInt(span.textContent) || 0;

      // Inicializar estado anterior do carrinho
      initializePreviousCartState();

      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'characterData' || mutation.type === 'childList') {
            const currentQuantity = parseInt(span.textContent) || 0;

            // Só mostrar pop-up se a quantidade AUMENTAR (não diminuir)
            if (currentQuantity !== lastQuantity && currentQuantity > lastQuantity) {
              lastQuantity = currentQuantity;

              // Detectar produto adicionado usando comparação de estados
              detectAddedProduct().then(async (addedProduct) => {
                if (addedProduct) {
                  const sku = addedProduct.sku;
                  window.alert(
                    `SKU detectado: ${sku} (quantidade adicionada: ${addedProduct.addedQuantity})`
                  );

                  // Verificar se há recomendação para este SKU
                  const recommendedSku = RECOMMENDATION_MAP[sku];
                  window.alert(`SKU recomendado: ${recommendedSku || 'NENHUM'}`);

                  if (recommendedSku) {
                    // Buscar dados do produto recomendado (sempre dinâmico)
                    window.alert('Buscando dados do produto recomendado...');
                    currentProductData = await getRecommendedProductData(recommendedSku);
                    window.alert(`Dados encontrados: ${currentProductData ? 'SIM' : 'NÃO'}`);
                  }
                  try {
                    const productData = await window.napi.catalog().getProduct(sku);
                    if (productData && productData.name) {
                      lastAddedProductName = productData.name;
                      window.alert(`Nome do produto: ${lastAddedProductName}`);
                    }
                  } catch (e) {}
                }
                // Mostrar pop-up apenas se há produto recomendado
                if (currentProductData) {
                  setTimeout(() => showPopup(addedProduct?.sku || ''), 1000);
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

  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
    setupObserver();
  }
})();
