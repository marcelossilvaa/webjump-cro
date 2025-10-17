// Pop-up de sugestão de produto Napoli quando usuário adiciona produto ao carrinho

console.log('Script Pop-up 1 ');
window.alert('Script Pop-up 1');
(function () {
  'use strict';

  // Configurações do produto sugerido
  const SUGGESTED_PRODUCT_ID = '7895.90'; // Napoli
  const SUGGESTED_PRODUCT_NAME = 'Napoli';
  const SUGGESTED_PRODUCT_PRICE = 3.4;
  const SUGGESTED_PRODUCT_DESCRIPTION = 'Café torrado e marcante com notas de cacau e madeira';
  const SUGGESTED_PRODUCT_INTENSITY = 13;
  const SUGGESTED_PRODUCT_IMAGE =
    '/ecom/medias/sys_master/public/15819013062686/C-0471-Product-684x378.jpg';

  // Variáveis de controle
  let popupShown = false;
  let cartItems = [];
  let suggestedProductData = null;
  let debugMode = true; // Ativar logs de debug
  let observerInitialized = false;

  console.log('Script Pop-up 2');

  // Função para criar o HTML do pop-up
  function createPopupHTML() {
    return `
            <div id="napoli-suggestion-popup" class="napoli-popup-overlay">
                <div class="napoli-popup-content">
                    <div class="napoli-popup-header">
                        <h3>Que tal experimentar algo novo?</h3>
                        <button class="napoli-popup-close" onclick="closeNapoliPopup()">&times;</button>
                    </div>
                    <div class="napoli-popup-body">
                        <div class="napoli-product-info">
                            <div class="napoli-product-image">
                                <img src="${SUGGESTED_PRODUCT_IMAGE}" alt="${SUGGESTED_PRODUCT_NAME}" />
                            </div>
                            <div class="napoli-product-details">
                                <h4>${SUGGESTED_PRODUCT_NAME}</h4>
                                <p class="napoli-description">${SUGGESTED_PRODUCT_DESCRIPTION}</p>
                                <div class="napoli-intensity">
                                    <span>Intensidade: ${SUGGESTED_PRODUCT_INTENSITY}/13</span>
                                    <div class="napoli-intensity-bar">
                                        ${'■'.repeat(SUGGESTED_PRODUCT_INTENSITY)}${'□'.repeat(
      13 - SUGGESTED_PRODUCT_INTENSITY
    )}
                                    </div>
                                </div>
                                <div class="napoli-price">
                                    <span class="napoli-price-value">R$ ${SUGGESTED_PRODUCT_PRICE.toFixed(
                                      2
                                    )}</span>
                                    <span class="napoli-price-unit">por cápsula</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="napoli-popup-footer">
                        <button class="napoli-btn napoli-btn-secondary" onclick="closeNapoliPopup()">
                            Talvez depois
                        </button>
                        <button class="napoli-btn napoli-btn-primary" onclick="addNapoliToCart()">
                            Adicionar ao carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  // Função para adicionar estilos CSS
  function addPopupStyles() {
    const style = document.createElement('style');
    style.textContent = `
            .napoli-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Arial', sans-serif;
            }

            .napoli-popup-content {
                background: white;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: napoli-popup-fade-in 0.3s ease-out;
            }

            @keyframes napoli-popup-fade-in {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .napoli-popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 20px 0 20px;
                border-bottom: 1px solid #eee;
            }

            .napoli-popup-header h3 {
                margin: 0;
                color: #333;
                font-size: 18px;
                font-weight: 600;
            }

            .napoli-popup-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .napoli-popup-close:hover {
                color: #333;
            }

            .napoli-popup-body {
                padding: 20px;
            }

            .napoli-product-info {
                display: flex;
                gap: 15px;
            }

            .napoli-product-image {
                flex-shrink: 0;
            }

            .napoli-product-image img {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
            }

            .napoli-product-details {
                flex: 1;
            }

            .napoli-product-details h4 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .napoli-description {
                margin: 0 0 15px 0;
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }

            .napoli-intensity {
                margin-bottom: 15px;
            }

            .napoli-intensity span {
                display: block;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 5px;
            }

            .napoli-intensity-bar {
                font-family: monospace;
                font-size: 16px;
                color: #8B4513;
            }

            .napoli-price {
                display: flex;
                align-items: baseline;
                gap: 5px;
            }

            .napoli-price-value {
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }

            .napoli-price-unit {
                font-size: 12px;
                color: #666;
            }

            .napoli-popup-footer {
                padding: 20px;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                border-top: 1px solid #eee;
            }

            .napoli-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .napoli-btn-secondary {
                background: #f5f5f5;
                color: #666;
            }

            .napoli-btn-secondary:hover {
                background: #e5e5e5;
            }

            .napoli-btn-primary {
                background: #007bff;
                color: white;
            }

            .napoli-btn-primary:hover {
                background: #0056b3;
            }

            @media (max-width: 480px) {
                .napoli-popup-content {
                    width: 95%;
                    margin: 10px;
                }

                .napoli-product-info {
                    flex-direction: column;
                    text-align: center;
                }

                .napoli-product-image img {
                    width: 100px;
                    height: 100px;
                }

                .napoli-popup-footer {
                    flex-direction: column;
                }
            }
        `;
    document.head.appendChild(style);
  }

  // Função para mostrar o pop-up
  function showNapoliPopup() {
    alwaysLog('🎯 INICIANDO: showNapoliPopup()');

    // Verificar se já existe o pop-up no DOM
    if (document.getElementById('napoli-suggestion-popup')) {
      alwaysLog('⚠️ Pop-up já existe no DOM, cancelando');
      return;
    }

    // Verificar se já foi mostrado nesta sessão
    if (popupShown) {
      alwaysLog('⚠️ Pop-up já foi mostrado nesta sessão, cancelando');
      return;
    }

    alwaysLog('✅ Criando pop-up...');

    // Adicionar estilos se ainda não foram adicionados
    if (!document.querySelector('style[data-napoli-popup]')) {
      addPopupStyles();
      alwaysLog('🎨 Estilos CSS adicionados');
    }

    // Criar e adicionar o pop-up ao DOM
    const popupHTML = createPopupHTML();
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    popupShown = true;
    alwaysLog('🎉 POP-UP MOSTRADO COM SUCESSO!');

    // Adicionar função global para fechar o pop-up
    window.closeNapoliPopup = function () {
      const popup = document.getElementById('napoli-suggestion-popup');
      if (popup) {
        popup.style.animation = 'napoli-popup-fade-out 0.3s ease-in';
        setTimeout(() => {
          popup.remove();
        }, 300);
      }
      popupShown = false;
    };

    // Adicionar função global para adicionar Napoli ao carrinho
    window.addNapoliToCart = async function () {
      try {
        // Adicionar o produto Napoli ao carrinho
        await window.napi.cart().addProduct(SUGGESTED_PRODUCT_ID, 10); // Adiciona 10 cápsulas

        // Fechar o pop-up
        window.closeNapoliPopup();

        // Mostrar mensagem de sucesso (opcional)
        console.log('Produto Napoli adicionado ao carrinho com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
      }
    };

    // Adicionar animação de fade-out
    const style = document.createElement('style');
    style.setAttribute('data-napoli-popup', 'true');
    style.textContent = `
            @keyframes napoli-popup-fade-out {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.9);
                }
            }
        `;
    document.head.appendChild(style);
  }

  // Função para debug
  function debugLog(message, data = null) {
    if (debugMode) {
      console.log(`🔥 [Napoli Popup Debug] ${message}`, data || '');
      console.log(`📊 Timestamp: ${new Date().toLocaleTimeString()}`);
      if (data) {
        console.table(data);
      }
    }
  }

  // Função para log sempre visível (mesmo com debug desabilitado)
  function alwaysLog(message, data = null) {
    console.log(`🚀 [Napoli Popup] ${message}`, data || '');
    console.log(`⏰ ${new Date().toLocaleTimeString()}`);
  }

  // Função para verificar se deve mostrar o pop-up
  function shouldShowPopup(newCartItems) {
    debugLog('Verificando se deve mostrar pop-up', {
      popupShown,
      cartItemsCount: newCartItems?.length,
      newCartItems,
    });

    // Não mostrar se já foi mostrado
    if (popupShown) {
      debugLog('Pop-up já foi mostrado, não mostrar novamente');
      return false;
    }

    // Não mostrar se o carrinho estiver vazio
    if (!newCartItems || newCartItems.length === 0) {
      debugLog('Carrinho vazio, não mostrar pop-up');
      return false;
    }

    // Não mostrar se o produto Napoli já estiver no carrinho
    const hasNapoli = newCartItems.some(
      (item) => item.productId.includes(SUGGESTED_PRODUCT_ID) || item.productId.includes('napoli')
    );

    if (hasNapoli) {
      debugLog('Napoli já está no carrinho, não mostrar pop-up');
      return false;
    }

    // Mostrar se há produtos no carrinho e não é o Napoli
    debugLog('Condições atendidas, deve mostrar pop-up');
    return newCartItems.length > 0;
  }

  // Função para lidar com atualizações do carrinho
  async function handleCartUpdate() {
    alwaysLog('🛒 CARRINHO ATUALIZADO! handleCartUpdate chamado');
    try {
      // Ler o estado atual do carrinho
      alwaysLog('📖 Lendo estado do carrinho...');
      const newCartItems = await window.napi.cart().read();
      alwaysLog('✅ Carrinho lido com sucesso', newCartItems);

      // Verificar se deve mostrar o pop-up
      if (shouldShowPopup(newCartItems)) {
        alwaysLog('🎯 DEVE MOSTRAR POP-UP! Aguardando 1 segundo...');
        // Aguardar um pouco para garantir que a UI foi atualizada
        setTimeout(() => {
          alwaysLog('🚀 Mostrando pop-up agora...');
          showNapoliPopup();
        }, 1000);
      } else {
        alwaysLog('❌ Não deve mostrar pop-up');
      }

      // Atualizar o estado dos itens do carrinho
      cartItems = newCartItems;
    } catch (error) {
      console.error('❌ Erro ao processar atualização do carrinho:', error);
      alwaysLog('❌ Erro ao processar carrinho', error);
    }
  }

  // Função para inicializar o observador
  function initializePopupObserver() {
    try {
      debugLog('Inicializando observador...');

      // Verificar se a API está disponível
      if (!window.napi || !window.napi.data || !window.napi.cart) {
        debugLog('API não disponível ainda, tentando novamente...');
        return false;
      }

      // Registrar o observador para mudanças no carrinho
      window.napi.data().on('cart.update', handleCartUpdate);
      observerInitialized = true;

      console.log('Observador de pop-up Napoli inicializado com sucesso!');
      debugLog('Observador registrado com sucesso');

      // Testar manualmente após inicialização
      setTimeout(() => {
        debugLog('Testando leitura do carrinho...');
        window.napi
          .cart()
          .read()
          .then((items) => {
            debugLog('Teste de leitura do carrinho:', items);
          })
          .catch((err) => {
            debugLog('Erro no teste de leitura:', err);
          });
      }, 2000);

      return true;
    } catch (error) {
      console.error('Erro ao inicializar observador do pop-up:', error);
      debugLog('Erro ao inicializar observador', error);
      return false;
    }
  }

  // Aguardar o DOM estar pronto e a API estar disponível
  function waitForAPI() {
    debugLog('Aguardando API estar disponível...', {
      napi: !!window.napi,
      data: !!(window.napi && window.napi.data),
      cart: !!(window.napi && window.napi.cart),
    });

    if (window.napi && window.napi.data && window.napi.cart) {
      const success = initializePopupObserver();
      if (!success) {
        // Se falhou, tentar novamente
        setTimeout(waitForAPI, 1000);
      }
    } else {
      // Tentar novamente em 100ms
      setTimeout(waitForAPI, 100);
    }
  }

  // Função para aguardar o botão do mini-carrinho aparecer
  function waitForMiniBasketButton() {
    return new Promise((resolve) => {
      const checkButton = () => {
        const button = document.querySelector('#ta-mini-basket__open, #ta-mini-basket_open');
        if (button) {
          debugLog('Botão do mini-carrinho encontrado após aguardar');
          resolve(button);
        } else {
          setTimeout(checkButton, 100);
        }
      };
      checkButton();
    });
  }

  // Função para aguardar o span de quantidade aparecer
  function waitForQuantitySpan() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 segundos máximo

      const checkSpan = () => {
        attempts++;
        alwaysLog(`🔍 Tentativa ${attempts}/${maxAttempts} - Procurando span de quantidade...`);

        // Tentar diferentes seletores
        const selectors = [
          '#ta-mini-basket__open .notranslate',
          '#ta-mini-basket_open .notranslate',
          '.MiniBasketButton .notranslate',
          '[class*="MiniBasketButton"] .notranslate',
          'button .notranslate',
        ];

        let span = null;
        for (const selector of selectors) {
          span = document.querySelector(selector);
          if (span) {
            alwaysLog(`✅ Span encontrado com seletor: ${selector}`, span);
            break;
          }
        }

        if (span) {
          alwaysLog('🎉 Span de quantidade encontrado após aguardar!', {
            textContent: span.textContent,
            className: span.className,
            parentElement: span.parentElement?.tagName,
          });
          resolve(span);
        } else if (attempts >= maxAttempts) {
          alwaysLog('❌ Timeout: Span de quantidade não encontrado após 10 segundos');
          resolve(null);
        } else {
          setTimeout(checkSpan, 100);
        }
      };
      checkSpan();
    });
  }

  // Função alternativa para detectar mudanças no carrinho via DOM
  async function setupDOMObserver() {
    alwaysLog('🔍 Configurando observador DOM específico para QUANTIDADE do carrinho...');

    try {
      // Aguardar o span de quantidade aparecer
      const quantitySpan = await waitForQuantitySpan();

      if (!quantitySpan) {
        alwaysLog('❌ Span de quantidade não encontrado, usando fallback...');
        setupFallbackObserver();
        return;
      }

      // Armazenar quantidade inicial
      let lastQuantity = parseInt(quantitySpan.textContent) || 0;
      alwaysLog('📊 Quantidade inicial detectada:', lastQuantity);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const target = mutation.target;

            // Verificar se é o span de quantidade que mudou
            if (target.classList && target.classList.contains('notranslate')) {
              const currentQuantity = parseInt(target.textContent) || 0;

              alwaysLog('🔢 Mudança detectada na quantidade:', {
                anterior: lastQuantity,
                atual: currentQuantity,
                mudou: currentQuantity !== lastQuantity,
              });

              // Só ativar se a quantidade realmente mudou E aumentou
              if (currentQuantity !== lastQuantity && currentQuantity > lastQuantity) {
                alwaysLog('🎉 QUANTIDADE AUMENTOU! Produto adicionado detectado!');
                alwaysLog('📈 Mudança:', `${lastQuantity} → ${currentQuantity}`);

                // Atualizar quantidade armazenada
                lastQuantity = currentQuantity;

                // Aguardar um pouco para garantir que o carrinho foi atualizado
                setTimeout(() => {
                  if (window.napi && window.napi.cart) {
                    window.napi
                      .cart()
                      .read()
                      .then((items) => {
                        alwaysLog('✅ Carrinho verificado após detecção de quantidade:', items);
                        if (shouldShowPopup(items)) {
                          alwaysLog('🎯 Chamando showNapoliPopup...');
                          showNapoliPopup();
                        } else {
                          alwaysLog('❌ shouldShowPopup retornou false');
                        }
                      })
                      .catch((err) => {
                        alwaysLog('❌ Erro ao verificar carrinho após detecção:', err);
                      });
                  }
                }, 1000);
              } else if (currentQuantity !== lastQuantity) {
                // Quantidade mudou mas não aumentou (pode ter diminuído)
                alwaysLog(
                  '📉 Quantidade mudou mas não aumentou:',
                  `${lastQuantity} → ${currentQuantity}`
                );
                lastQuantity = currentQuantity;
              }
            }
          }
        });
      });

      // Observar mudanças no conteúdo do span de quantidade
      observer.observe(quantitySpan, {
        childList: true,
        characterData: true,
        subtree: true,
      });

      alwaysLog('✅ Observador DOM configurado para quantidade do carrinho');
    } catch (error) {
      alwaysLog('❌ Erro ao configurar observador específico:', error);
      setupFallbackObserver();
    }
  }

  // Função de fallback para quando não consegue encontrar o span específico
  function setupFallbackObserver() {
    alwaysLog('🔄 Configurando observador de fallback...');

    // Fallback: observar mudanças gerais no DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          // Verificar se há elementos relacionados ao carrinho
          const cartElements = document.querySelectorAll(
            '[class*="MiniBasketButton"], [id*="mini-basket"], [class*="cart"], [id*="cart"], [class*="basket"], [id*="basket"]'
          );
          if (cartElements.length > 0) {
            alwaysLog('🔍 Mudança detectada no DOM relacionada ao carrinho');
            // Aguardar um pouco e verificar o carrinho
            setTimeout(() => {
              if (window.napi && window.napi.cart) {
                window.napi
                  .cart()
                  .read()
                  .then((items) => {
                    alwaysLog('✅ Carrinho verificado via DOM observer:', items);
                    if (shouldShowPopup(items)) {
                      alwaysLog('🎯 Chamando showNapoliPopup via fallback...');
                      showNapoliPopup();
                    }
                  })
                  .catch((err) => {
                    alwaysLog('❌ Erro ao verificar carrinho via DOM:', err);
                  });
              }
            }, 500);
          }
        }
      });
    });

    // Observar mudanças no body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id'],
    });

    alwaysLog('✅ Observador DOM de fallback configurado');
  }

  // Inicializar quando o script for carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      alwaysLog('🚀 DOM CARREGADO! Iniciando sistema...');
      // waitForAPI(); // DESABILITADO para evitar duplicação
      alwaysLog('🔧 Chamando setupDOMObserver...');
      setupDOMObserver().catch((err) => {
        alwaysLog('❌ Erro ao configurar observador DOM:', err);
      });
    });
  } else {
    alwaysLog('🚀 DOM JÁ CARREGADO! Iniciando sistema...');
    // waitForAPI(); // DESABILITADO para evitar duplicação
    alwaysLog('🔧 Chamando setupDOMObserver...');
    setupDOMObserver().catch((err) => {
      alwaysLog('❌ Erro ao configurar observador DOM:', err);
    });
  }

  // Expor funções para uso manual (opcional)
  window.napoliPopup = {
    show: showNapoliPopup,
    hide: () => window.closeNapoliPopup(),
    addToCart: () => window.addNapoliToCart(),
    debug: () => {
      debugLog('Estado atual:', {
        popupShown,
        observerInitialized,
        cartItems,
        napi: !!window.napi,
      });
    },
    test: () => {
      debugLog('Teste manual - mostrando pop-up');
      showNapoliPopup();
    },
    checkCart: async () => {
      if (window.napi && window.napi.cart) {
        try {
          const items = await window.napi.cart().read();
          debugLog('Estado atual do carrinho:', items);
          return items;
        } catch (err) {
          debugLog('Erro ao ler carrinho:', err);
        }
      } else {
        debugLog('API não disponível');
      }
    },
    checkMiniBasket: () => {
      const button = document.querySelector('#ta-mini-basket__open, #ta-mini-basket_open');
      const quantitySpan = document.querySelector(
        '#ta-mini-basket__open .notranslate, #ta-mini-basket_open .notranslate'
      );

      if (button && quantitySpan) {
        alwaysLog('🔍 Botão e quantidade encontrados:', {
          buttonId: button.id,
          buttonClasses: button.className,
          buttonText: button.textContent.trim(),
          quantidade: quantitySpan.textContent,
          quantidadeNumerica: parseInt(quantitySpan.textContent) || 0,
        });
        return { button, quantitySpan };
      } else {
        alwaysLog('❌ Botão ou quantidade não encontrados:', {
          button: !!button,
          quantitySpan: !!quantitySpan,
        });
        return null;
      }
    },
    simulateAddToCart: () => {
      alwaysLog('🎭 Simulando adição de produto ao carrinho...');
      const quantitySpan = document.querySelector(
        '#ta-mini-basket__open .notranslate, #ta-mini-basket_open .notranslate'
      );

      if (quantitySpan) {
        const currentQuantity = parseInt(quantitySpan.textContent) || 0;
        const newQuantity = currentQuantity + 10; // Simular adição de 10 produtos

        alwaysLog('📊 Simulando mudança de quantidade:', {
          atual: currentQuantity,
          nova: newQuantity,
        });

        // Simular mudança na quantidade
        quantitySpan.textContent = newQuantity.toString();
        alwaysLog('✅ Quantidade simulada:', quantitySpan.textContent);
      } else {
        alwaysLog('❌ Span de quantidade não encontrado para simulação');
      }
    },
    findSpan: () => {
      alwaysLog('🔍 Procurando span de quantidade manualmente...');

      const selectors = [
        '#ta-mini-basket__open .notranslate',
        '#ta-mini-basket_open .notranslate',
        '.MiniBasketButton .notranslate',
        '[class*="MiniBasketButton"] .notranslate',
        'button .notranslate',
        '.notranslate',
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          alwaysLog(`✅ Encontrado com seletor: ${selector}`, elements);
          elements.forEach((el, index) => {
            alwaysLog(`  Elemento ${index + 1}:`, {
              textContent: el.textContent,
              className: el.className,
              parentElement: el.parentElement?.tagName,
              parentClasses: el.parentElement?.className,
            });
          });
        }
      }

      // Procurar todos os elementos com classe notranslate
      const allNotranslate = document.querySelectorAll('.notranslate');
      alwaysLog(`📊 Total de elementos .notranslate encontrados: ${allNotranslate.length}`);
      allNotranslate.forEach((el, index) => {
        alwaysLog(`  Elemento ${index + 1}:`, {
          textContent: el.textContent,
          className: el.className,
          parentElement: el.parentElement?.tagName,
          parentClasses: el.parentElement?.className,
        });
      });
    },
    clearDuplicates: () => {
      alwaysLog('🧹 Limpando pop-ups duplicados...');
      const popups = document.querySelectorAll('#napoli-suggestion-popup');
      if (popups.length > 1) {
        alwaysLog(`Encontrados ${popups.length} pop-ups, removendo extras...`);
        for (let i = 1; i < popups.length; i++) {
          popups[i].remove();
        }
        alwaysLog('✅ Pop-ups duplicados removidos');
      } else {
        alwaysLog('✅ Nenhum pop-up duplicado encontrado');
      }
    },
  };

  alwaysLog('🎉 SCRIPT CARREGADO E PRONTO! Sistema Napoli Popup ativo!');
})();
