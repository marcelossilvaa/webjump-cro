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

  // Função para buscar dados do produto recomendado
  async function getRecommendedProductData(sku) {
    try {
      const productData = await window.napi.catalog().getProduct(sku);
      return productData;
    } catch (error) {
      console.error('Erro ao buscar dados do produto:', error);
      return null;
    }
  }

  // Função para mostrar pop-up
  function showPopup(sku = '') {
    if (popupShown) return;
    if (document.getElementById('napoli-popup')) return;

    popupShown = true;

    // Usar dados do produto atual ou dados padrão
    const productData = currentProductData || {
      name: 'Napoli',
      headline: 'Café torrado e marcante com notas de cacau e madeira',
      capsuleProperties: { intensity: 13 },
      unitPrice: 3.4,
      images: { main: '/ecom/medias/sys_master/public/15819013062686/C-0471-Product-684x378.jpg' },
    };

    const productName = productData.name || 'Napoli';
    const productDescription =
      productData.headline || 'Café torrado e marcante com notas de cacau e madeira';
    const productIntensity = productData.capsuleProperties?.intensity || 13;
    const productPrice = productData.unitPrice || 3.4;
    const productImage =
      productData.images?.main ||
      '/ecom/medias/sys_master/public/15819013062686/C-0471-Product-684x378.jpg';

    const popupHTML = `
            <div id="napoli-popup" style="position: fixed; bottom: 20px; left: 20px; z-index: 9999; max-width: 450px; animation: slideInLeft 0.3s ease-out;">
                <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #999; font-size: 12px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px;">QUEM COMPRA "${sku}" TAMBÉM COMPRA</h3>
                        <button onclick="closeNapoliPopup()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</button>
                    </div>
                    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
                        <img src="${productImage}" alt="${productName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; transform: rotate(-15deg);">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 18px; font-weight: 700;">${productName}</h4>
                            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.4;">${productDescription}</p>
                            <div style="margin-bottom: 0;">
                                <span style="display: block; color: #666; font-size: 14px; margin-bottom: 4px;">Intensidade: ${'-'.repeat(
                                  productIntensity
                                )}${productIntensity}</span>
                            </div>
                        </div>
                    </div>
                     <div style="display: flex; justify-content: space-between; align-items: center;">
                         <div id="MiniBasketPushAddProductCTA">
                             <div class="add-to-bag" data-product-id="${
                               currentProductData?.id || 'erp.br.b2c/prod/7895.90'
                             }" data-button-size="small" data-initialized="true">
                                 <div class="AddToBagButton__container">
                                     <div id="AddToBagButton__button-CremaComponentId-${Date.now()}">
                                         <button class="AddToBagButton AddToBagButtonSmall" data-focus-id="AddToBagButton__button-CremaComponentId-${Date.now()}" type="button" data-qa="${productName}">
                                             <span class="VisuallyHidden">Você não possui nenhum ${productName} em seu carrinho. Ative para adicioná-lo.</span>
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

    // Inicializar o componente AddToBag após inserir no DOM
    setTimeout(() => {
      const addToBagElement = document.querySelector(
        '#napoli-popup #MiniBasketPushAddProductCTA .add-to-bag'
      );
      window.alert('Elemento encontrado: ' + (addToBagElement ? 'SIM' : 'NÃO'));
      window.alert('API disponível: ' + (!!window.napi ? 'SIM' : 'NÃO'));
      window.alert('UI disponível: ' + (!!(window.napi && window.napi.ui) ? 'SIM' : 'NÃO'));

      if (addToBagElement && window.napi) {
        // Como window.napi.ui não está disponível, vamos usar diretamente a API do carrinho
        window.alert('Usando API do carrinho diretamente (UI não disponível)');

        const button = addToBagElement.querySelector('button');
        if (button) {
          window.alert('Botão encontrado: SIM');
          window.alert('Classes do botão: ' + button.className);
          window.alert('Product ID: ' + addToBagElement.getAttribute('data-product-id'));

          // Adicionar evento de clique direto
          button.addEventListener('click', function (e) {
            window.alert('Clique no botão detectado!');
            e.preventDefault();

            const productId = addToBagElement.getAttribute('data-product-id');
            if (productId && window.napi && window.napi.cart) {
              try {
                // Focar apenas no problema do carrinho
                const cartApi = window.napi.cart();

                // Usar a abordagem correta com cart.update
                window.alert('Testando adição ao carrinho...');

                try {
                  // Tentar o método addOrUpdateProducts com formato correto
                  cartApi.addOrUpdateProducts([
                    {
                      productId: productId,
                      quantity: 1,
                    },
                  ]);

                  // Executar função após update no carrinho
                  window.napi.data().on('cart.update', function () {
                    window.alert('✅ Carrinho atualizado! Produto adicionado.');
                  });

                  // Fazer a captura de todos os produtos no carrinho
                  setTimeout(async () => {
                    try {
                      const cartData = await cartApi.read();
                      if (cartData && Object.keys(cartData).length > 0) {
                        window.alert('✅ Produto adicionado com sucesso!');
                      } else {
                        window.alert('❌ Produto não foi adicionado. Carrinho vazio.');
                      }
                    } catch (readError) {
                      window.alert('❌ Erro ao ler carrinho: ' + readError.message);
                    }
                  }, 1500);
                } catch (error) {
                  window.alert('❌ Erro ao adicionar: ' + error.message);
                }

                // Fechar o pop-up após adicionar
                setTimeout(() => {
                  const popup = document.getElementById('napoli-popup');
                  if (popup) {
                    popup.remove();
                  }
                }, 2000);
              } catch (error) {
                window.alert('Erro ao adicionar produto: ' + error.message);
              }
            } else {
              window.alert('Erro: Product ID ou API do carrinho não disponível');
            }
          });
          window.alert('Evento de clique adicionado com sucesso!');
        } else {
          window.alert('Erro: Botão não encontrado no elemento');
        }
      } else {
        window.alert('Elemento AddToBag não encontrado ou API não disponível!');
      }
    }, 100);
  }

  // Função para fechar pop-up
  window.closeNapoliPopup = function () {
    const popup = document.getElementById('napoli-popup');
    if (popup) {
      popup.remove();
    }
  };

  // Função para obter o SKU do último produto adicionado
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

  // Aguardar span aparecer e configurar observador
  function setupObserver() {
    const span = document.querySelector('#ta-mini-basket__open .notranslate');

    if (span) {
      lastQuantity = parseInt(span.textContent) || 0;

      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'characterData' || mutation.type === 'childList') {
            const currentQuantity = parseInt(span.textContent) || 0;

            // Só mostrar pop-up se a quantidade AUMENTAR (não diminuir)
            if (currentQuantity !== lastQuantity && currentQuantity > lastQuantity) {
              lastQuantity = currentQuantity;

              // Obter SKU do último produto adicionado e mostrar alert
              getLastAddedProductSKU().then(async (sku) => {
                if (sku) {
                  window.alert(`Último produto adicionado: ${sku}`);

                  // Verificar se há recomendação para este SKU
                  const recommendedSku = RECOMMENDATION_MAP[sku];
                  if (recommendedSku) {
                    // Buscar dados do produto recomendado
                    currentProductData = await getRecommendedProductData(recommendedSku);
                    console.log('Produto recomendado:', currentProductData);
                  }
                }
                // Mostrar pop-up após o alert
                setTimeout(() => showPopup(sku), 1000);
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
