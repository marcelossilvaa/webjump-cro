(function () {
  'use strict';

  // Configuracoes do experimento
  var FN_CONFIG = {
    EXP_ID: 'FN_AT_MINICART_LAYOUT_V1',
    STYLE_ID: 'FN_STYLE',
    ROOT_ID: 'FN_CART_ROOT',
    OBSERVER_ID: '__FN_CART_OBSERVER__',
    STORAGE_KEY: 'FN_CART_DATA',
    RETRY_MS: 400,
    MAX_RETRIES: 25,
    FETCH_DEBOUNCE_MS: 50,
    CURRENCY: 'BRL',
    // Endpoint da API Magento para dados do carrinho
    API_URL: '/customer/section/load/?sections=cart&force_new_section_timestamp=true',
    // Valor para frete gratis (em reais)
    FREE_SHIPPING_THRESHOLD: 120,
    LABELS: {
      title: 'Seu carrinho',
      freeShippingText: 'Faltam R$ {value} para Frete Grátis',
      freeShippingComplete: 'Parabéns! Você tem Frete Grátis!',
      subtotal: 'Subtotal',
      checkout: 'Finalizar compra',
      continueShopping: 'Continuar comprando',
      emptyCart: 'Seu carrinho está vazio',
    },
    SELECTORS: {
      body: 'body',
      cartOpenTriggers: [
        '[data-testid="mini-cart-button"]',
        '[aria-label*="carrinho" i]',
        'a[href*="carrinho"]',
        'button[title*="carrinho" i]',
        '.minicart-wrapper',
        '[data-block="minicart"]',
      ],
      cartRows: [
        '[data-testid="minicart-item"]',
        '[data-cart-item]',
        '[class*="mini"][class*="item"]',
      ],
      itemName: ['[data-testid="product-name"]', 'a[href*="/produto"]', 'h3', 'h4'],
      itemPrice: ['[data-testid="product-price"]', '[class*="price"]'],
      itemQty: ['input[type="number"]', '[data-testid="quantity"]', '[class*="quantity"]'],
      itemImage: ['img'],
      subtotal: ['[data-testid="subtotal"]', '[class*="subtotal"]', '[class*="total"]'],
      checkoutBtn: ['a[href*="checkout"]', 'button[data-testid="checkout"]'],
      viewCartBtn: ['a[href*="carrinho"]', 'a[href*="/cart"]'],
      freeShippingValue: ['[data-testid="free-shipping-missing"]', '[class*="frete"]'],
    },
  };

  // Estado global do carrinho
  var FN_state = {
    mounted: false,
    routeKey: '',
    observer: null,
    retries: 0,
    handlersBound: false,
    cartData: null,
    isFetching: false,
    fetchDebounceTimer: null,
    lastFetchTime: 0,
    pendingRecurringAdd: false,
    recurringItems: {},
  };

  // Funcoes utilitarias
  var FN_utils = {
    q: function (sel, root) {
      try {
        return (root || document).querySelector(sel);
      } catch (e) {
        return null;
      }
    },
    qa: function (sel, root) {
      try {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
      } catch (e) {
        return [];
      }
    },
    firstMatch: function (selectors, root) {
      var i, el;
      for (i = 0; i < selectors.length; i++) {
        el = FN_utils.q(selectors[i], root);
        if (el) return el;
      }
      return null;
    },
    text: function (el) {
      return el && typeof el.textContent === 'string' ? el.textContent.trim() : '';
    },
    toPrice: function (value) {
      var n = parseFloat(
        String(value || '')
          .replace(/[^\d,.-]/g, '')
          .replace(/\./g, '')
          .replace(',', '.'),
      );
      return isNaN(n) ? 0 : n;
    },
    formatBRL: function (n) {
      try {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: FN_CONFIG.CURRENCY,
        }).format(n || 0);
      } catch (e) {
        return 'R$ ' + (n || 0).toFixed(2).replace('.', ',');
      }
    },
    routeKey: function () {
      return location.pathname + '|' + location.search;
    },

    // Funcoes de persistencia com localStorage
    saveToStorage: function (data) {
      try {
        var payload = {
          data: data,
          timestamp: Date.now(),
        };
        localStorage.setItem(FN_CONFIG.STORAGE_KEY, JSON.stringify(payload));
        console.log('[FN MiniCart] Dados salvos no localStorage');
      } catch (e) {
        console.log('[FN MiniCart] Erro ao salvar no localStorage: ' + e.message);
      }
    },

    loadFromStorage: function () {
      try {
        var stored = localStorage.getItem(FN_CONFIG.STORAGE_KEY);
        if (!stored) return null;

        var payload = JSON.parse(stored);
        // Verificar se os dados tem menos de 30 minutos
        var maxAge = 30 * 60 * 1000;
        if (Date.now() - payload.timestamp > maxAge) {
          console.log('[FN MiniCart] Dados do localStorage expirados, removendo...');
          localStorage.removeItem(FN_CONFIG.STORAGE_KEY);
          return null;
        }

        console.log('[FN MiniCart] Dados carregados do localStorage');
        return payload.data;
      } catch (e) {
        console.log('[FN MiniCart] Erro ao carregar do localStorage: ' + e.message);
        return null;
      }
    },

    clearStorage: function () {
      try {
        localStorage.removeItem(FN_CONFIG.STORAGE_KEY);
        console.log('[FN MiniCart] localStorage limpo');
      } catch (e) {
        console.log('[FN MiniCart] Erro ao limpar localStorage');
      }
    },

    loadRecurringItems: function () {
      try {
        var stored = localStorage.getItem(FN_CONFIG.STORAGE_KEY + '_recurring');
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    },

    saveRecurringItems: function (items) {
      try {
        localStorage.setItem(FN_CONFIG.STORAGE_KEY + '_recurring', JSON.stringify(items));
      } catch (e) {
        console.log('[FN MiniCart] Erro ao salvar itens recorrentes');
      }
    },

    ensureStyle: function () {
      if (document.getElementById(FN_CONFIG.STYLE_ID)) return;
      var css =
        '' +
        '.block-minicart{display:none !important;visibility:hidden !important;opacity:0 !important;pointer-events:none !important;}' +
        '.block.block-minicart{display:none !important;visibility:hidden !important;}' +
        '.ui-dialog-content.block-minicart{display:none !important;}' +
        '[data-role="dropdownDialog"]{display:none !important;}' +
        '.minicart-wrapper .block-minicart{display:none !important;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        '{position:fixed;inset:0;z-index:99999;display:none;font-family:"NestleTextTF",Arial,sans-serif;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ',#' +
        FN_CONFIG.ROOT_ID +
        ' *{font-family:"NestleTextTF",Arial,sans-serif;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        '.FN-open{display:block;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-panel{position:absolute;top:0;right:0;width:25vw;min-width:320px;max-width:480px;height:100%;background:#fff;display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.2);}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-head{padding:16px;border-bottom:1px solid #00a0df;display:flex;justify-content:space-between;align-items:center;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-title{font-size:24px;font-weight:700;color:#1f2b3a;margin:0;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-close{border:0;background:transparent;font-size:24px;line-height:1;cursor:pointer;color:#00a0df;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-free{padding:12px 16px 8px;color:#23354d;font-size:14px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-bar{height:6px;background:#ebeff5;border-radius:999px;overflow:hidden;margin-top:8px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-bar > i{display:block;height:100%;width:0;background:#0065a1;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-list{padding:8px 16px;overflow:auto;flex:1;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-item{display:grid;grid-template-columns:72px 1fr auto;gap:6px;padding:12px 0;border-bottom:1px solid #00a0df;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-item img{width:72px;height:72px;object-fit:contain;border:1px solid #00a0df;border-radius:8px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-name{font-size:16px;font-weight:400;color:#24374d;line-height:1.3;margin:0 0 6px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-price{font-size:18px;font-weight:400;color:#113f67;margin:0 0 8px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-qty{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #00a0df;border-radius:100px;padding:4px 10px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-qty button{width:20px;height:20px;border:0;background:transparent;cursor:pointer;font-size:18px;line-height:20px;color:#00a0df;display:flex;align-items:center;justify-content:center;padding:0;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-qty input{width:40px;text-align:center;font-size:14px;color:#27425e;line-height:20px;border:none;background:transparent;outline:none;-moz-appearance:textfield;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-qty input::-webkit-outer-spin-button,#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-qty input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-trash{align-self:start;border:0;background:transparent;cursor:pointer;font-size:16px;color:#00a0df;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-recurring-alert{font-size:13px;color:#92400e;background:#fef3c7;padding:10px 12px;border-radius:6px;margin-top:10px;line-height:1.5;border-left:3px solid #f59e0b;display:block;width:100%;box-sizing:border-box;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-foot{padding:12px 16px;border-top:1px solid #00a0df;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-subtotal{display:flex;justify-content:space-between;align-items:center;font-size:24px;font-weight:400;color:#133d66;margin-bottom:12px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-cta{display:block;width:100%;text-align:center;text-decoration:none;border-radius:999px;padding:13px 16px;font-weight:700;box-sizing:border-box;border:1px solid #00a0df;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-cta-primary{background:#00a0df;border-color:#00a0df;color:#fff;margin-bottom:8px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-cta-secondary{background:transparent;color:#00a0df;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-empty{padding:40px 16px;text-align:center;color:#6b7c93;font-size:16px;}' +
        '#' +
        FN_CONFIG.ROOT_ID +
        ' .FN-loading{padding:40px 16px;text-align:center;color:#6b7c93;font-size:14px;}';

      var style = document.createElement('style');
      style.id = FN_CONFIG.STYLE_ID;
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      (document.head || document.documentElement).appendChild(style);
    },
    dispatchMetric: function (name, payload) {
      var data = payload || {};
      data.event = name;
      data.experience_id = FN_CONFIG.EXP_ID;
      data.timestamp = Date.now();

      if (window.adobeDataLayer && typeof window.adobeDataLayer.push === 'function') {
        window.adobeDataLayer.push(data);
      }
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(data);
      }
      if (window.gtmDataObject && typeof window.gtmDataObject.push === 'function') {
        window.gtmDataObject.push(data);
      }
      if (window._satellite && typeof window._satellite.track === 'function') {
        window._satellite.track(name, data);
      }
    },
    reactSelectByKeyboard: function (inputSelector) {
      var input = FN_utils.q(inputSelector);
      if (!input) return false;
      input.focus();
      var evDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        which: 40,
        keyCode: 40,
        bubbles: true,
      });
      var evEnter = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        which: 13,
        keyCode: 13,
        bubbles: true,
      });
      input.dispatchEvent(evDown);
      input.dispatchEvent(evEnter);
      return true;
    },
  };

  // Funcao para buscar dados do carrinho via API
  function FN_fetchCartData(callback) {
    // Evitar multiplas requisicoes simultaneas
    if (FN_state.isFetching) {
      console.log('[FN MiniCart] Requisicao ja em andamento, ignorando...');
      return;
    }

    // Debounce para evitar muitas requisicoes
    if (FN_state.fetchDebounceTimer) {
      clearTimeout(FN_state.fetchDebounceTimer);
    }

    FN_state.fetchDebounceTimer = setTimeout(function () {
      FN_state.isFetching = true;
      var timestamp = Date.now();
      var url = FN_CONFIG.API_URL + '&_=' + timestamp;

      console.log('[FN MiniCart] Buscando dados do carrinho via API...');

      fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Erro na requisicao: ' + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          FN_state.isFetching = false;
          FN_state.lastFetchTime = Date.now();

          if (data && data.cart) {
            var cartData = FN_parseApiResponse(data.cart);
            FN_state.cartData = cartData;

            // Salvar no localStorage para persistencia
            FN_utils.saveToStorage(cartData);

            console.log(
              '[FN MiniCart] Dados do carrinho carregados: ' + cartData.items.length + ' item(s)',
            );

            if (typeof callback === 'function') {
              callback(cartData);
            }
          } else {
            console.log('[FN MiniCart] Resposta da API sem dados de carrinho');
            if (typeof callback === 'function') {
              callback(null);
            }
          }
        })
        .catch(function (error) {
          FN_state.isFetching = false;
          console.log('[FN MiniCart] Erro ao buscar dados do carrinho: ' + error.message);

          // Tentar usar dados do localStorage como fallback
          var storedData = FN_utils.loadFromStorage();
          if (storedData && typeof callback === 'function') {
            console.log('[FN MiniCart] Usando dados do localStorage como fallback');
            FN_state.cartData = storedData;
            callback(storedData);
          } else if (typeof callback === 'function') {
            callback(null);
          }
        });
    }, FN_CONFIG.FETCH_DEBOUNCE_MS);
  }

  // Funcao para parsear a resposta da API do Magento
  function FN_parseApiResponse(cartResponse) {
    var items = [];
    var subtotal = 0;

    if (cartResponse.items && cartResponse.items.length > 0) {
      for (var i = 0; i < cartResponse.items.length; i++) {
        var apiItem = cartResponse.items[i];

        var item = {
          id: apiItem.item_id || apiItem.product_id || 'item_' + i,
          productId: apiItem.product_id || '',
          sku: apiItem.product_sku || '',
          name: apiItem.product_name || 'Produto',
          price: parseFloat(apiItem.product_price_value) || 0,
          qty: parseInt(apiItem.qty, 10) || 1,
          image: '',
          productUrl: apiItem.product_url || '',
          configureUrl: apiItem.configure_url || '',
        };

        // Extrair imagem do produto
        if (apiItem.product_image && apiItem.product_image.src) {
          item.image = apiItem.product_image.src;
        }

        items.push(item);
      }
    }

    // Carregar informacoes de itens recorrentes do localStorage
    var recurringItems = FN_utils.loadRecurringItems();
    for (var k = 0; k < items.length; k++) {
      if (recurringItems[items[k].id] || recurringItems[items[k].sku]) {
        items[k].isRecurring = true;
      }
    }

    // Calcular subtotal a partir da resposta
    if (cartResponse.subtotalAmount) {
      subtotal = parseFloat(cartResponse.subtotalAmount) || 0;
    } else {
      // Fallback: somar precos dos items
      for (var j = 0; j < items.length; j++) {
        subtotal += items[j].price * items[j].qty;
      }
    }

    // Calcular valor faltante para frete gratis
    var missingForFreeShipping = Math.max(0, FN_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal);

    return {
      items: items,
      subtotal: subtotal,
      summaryCount: parseInt(cartResponse.summary_count, 10) || items.length,
      missingForFreeShipping: missingForFreeShipping,
      websiteId: cartResponse.website_id || '',
      storeId: cartResponse.storeId || '',
      dataId: cartResponse.data_id || Date.now(),
    };
  }

  // Funcao para obter dados do carrinho (API ou cache)
  function FN_getCartData(forceRefresh, callback) {
    // Se forceRefresh, buscar da API
    if (forceRefresh) {
      FN_fetchCartData(callback);
      return;
    }

    // Tentar usar dados em memoria
    if (FN_state.cartData) {
      console.log('[FN MiniCart] Usando dados em memoria');
      if (typeof callback === 'function') {
        callback(FN_state.cartData);
      }
      return;
    }

    // Tentar carregar do localStorage
    var storedData = FN_utils.loadFromStorage();
    if (storedData) {
      FN_state.cartData = storedData;
      if (typeof callback === 'function') {
        callback(storedData);
      }

      // Buscar dados atualizados em background
      FN_fetchCartData(function (freshData) {
        if (freshData) {
          FN_render(); // Re-renderizar com dados atualizados
        }
      });
      return;
    }

    // Sem dados, buscar da API
    FN_fetchCartData(callback);
  }

  // Interceptar requisicoes para detectar mudancas no carrinho
  function FN_interceptCartChanges() {
    // Verificar se ja foi interceptado
    if (window.__FN_CART_INTERCEPTED__) return;
    window.__FN_CART_INTERCEPTED__ = true;

    // Interceptar fetch
    var originalFetch = window.fetch;
    window.fetch = function (url, options) {
      var urlString = typeof url === 'string' ? url : url && url.url ? url.url : '';
      var method = options && options.method ? options.method.toUpperCase() : 'GET';

      // Detectar se e uma adicao ao carrinho (POST para /checkout/cart/add)
      var isAddToCart =
        urlString.indexOf('/checkout/cart/add') !== -1 ||
        (urlString.indexOf('/rest/') !== -1 &&
          urlString.indexOf('cart') !== -1 &&
          method === 'POST');

      return originalFetch.apply(this, arguments).then(function (response) {
        // Detectar acoes que modificam o carrinho
        if (
          urlString.indexOf('/checkout/cart/') !== -1 ||
          urlString.indexOf('/checkout/sidebar/') !== -1 ||
          (urlString.indexOf('/rest/') !== -1 && urlString.indexOf('cart') !== -1)
        ) {
          // Verificar se a requisicao foi bem sucedida
          if (response.ok || response.status === 200) {
            console.log('[FN MiniCart] Mudanca no carrinho detectada, atualizando...');

            // Invalidar cache e buscar dados atualizados
            FN_state.cartData = null;
            setTimeout(function () {
              FN_fetchCartData(function (data) {
                if (data) {
                  // Se foi adicao ao carrinho, abrir o mini cart automaticamente
                  if (isAddToCart && data.items && data.items.length > 0) {
                    console.log(
                      '[FN MiniCart] Produto adicionado ao carrinho, abrindo mini cart...',
                    );
                    FN_open('auto_add_to_cart');
                  } else {
                    // Apenas atualizar se o mini cart ja estiver aberto
                    var root = document.getElementById(FN_CONFIG.ROOT_ID);
                    if (root && root.classList.contains('FN-open')) {
                      FN_render(data);
                    }
                  }
                }
              });
            }, 100);
          }
        }
        return response;
      });
    };

    // Interceptar XMLHttpRequest
    var originalXHROpen = XMLHttpRequest.prototype.open;
    var originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
      this._fnMethod = method;
      this._fnUrl = String(url || '');
      return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
      var xhr = this;
      var urlString = xhr._fnUrl || '';
      var method = (xhr._fnMethod || 'GET').toUpperCase();

      // Detectar se e uma adicao ao carrinho
      var isAddToCart =
        urlString.indexOf('/checkout/cart/add') !== -1 ||
        (urlString.indexOf('form_key') !== -1 && urlString.indexOf('product') !== -1);

      xhr.addEventListener('load', function () {
        // Verificar se e uma resposta do carrinho
        if (
          urlString.indexOf('/checkout/cart/') !== -1 ||
          urlString.indexOf('/checkout/sidebar/') !== -1 ||
          urlString.indexOf('sections=cart') !== -1
        ) {
          // Verificar se a requisicao foi bem sucedida
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[FN MiniCart] Mudanca no carrinho detectada via XHR, atualizando...');
            FN_state.cartData = null;
            setTimeout(function () {
              FN_fetchCartData(function (data) {
                if (data) {
                  // Se foi adicao ao carrinho, abrir o mini cart automaticamente
                  if (isAddToCart && data.items && data.items.length > 0) {
                    console.log(
                      '[FN MiniCart] Produto adicionado ao carrinho via XHR, abrindo mini cart...',
                    );
                    FN_open('auto_add_to_cart');
                  } else {
                    // Apenas atualizar se o mini cart ja estiver aberto
                    var root = document.getElementById(FN_CONFIG.ROOT_ID);
                    if (root && root.classList.contains('FN-open')) {
                      FN_render(data);
                    }
                  }
                }
              });
            }, 100);
          }
        }
      });

      return originalXHRSend.apply(this, arguments);
    };

    // Observar cliques em botoes de adicionar ao carrinho como fallback
    document.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        var isAddButton = false;
        var isRecurringAdd = false;

        // Verificar se e um botao de adicionar ao carrinho
        if (target.closest) {
          var addBtn =
            target.closest('[data-action="add-to-cart"]') ||
            target.closest('button[type="submit"][title*="Comprar" i]') ||
            target.closest('button[type="submit"][title*="carrinho" i]') ||
            target.closest('.tocart') ||
            target.closest('#product-addtocart-button');

          // Verificar se e adicao recorrente
          var recurringBtn = target.closest('.recuring-cart-form');
          if (recurringBtn) {
            isRecurringAdd = true;
            isAddButton = true;
          } else if (addBtn) {
            isAddButton = true;
          }
        }

        // Se clicou em botao de adicionar, aguardar e verificar carrinho
        if (isAddButton) {
          console.log(
            '[FN MiniCart] Clique em botao de adicionar ao carrinho detectado' +
              (isRecurringAdd ? ' (recorrente)' : ''),
          );

          // Marcar que proximo item adicionado e recorrente
          if (isRecurringAdd) {
            FN_state.pendingRecurringAdd = true;
          }

          setTimeout(function () {
            FN_state.cartData = null;
            FN_fetchCartData(function (data) {
              if (data && data.items && data.items.length > 0) {
                // Se foi adicao recorrente, marcar ultimo item como recorrente
                if (FN_state.pendingRecurringAdd && data.items.length > 0) {
                  var lastItem = data.items[data.items.length - 1];
                  lastItem.isRecurring = true;
                  FN_saveRecurringItems(data.items);
                  FN_state.pendingRecurringAdd = false;
                }
                console.log('[FN MiniCart] Abrindo mini cart apos adicao...');
                FN_open('auto_add_to_cart');
              }
            });
          }, 300);
        }
      },
      true,
    );

    console.log('[FN MiniCart] Interceptadores de carrinho configurados');
  }

  function FN_buildDOM() {
    if (document.getElementById(FN_CONFIG.ROOT_ID))
      return document.getElementById(FN_CONFIG.ROOT_ID);

    var root = document.createElement('div');
    root.id = FN_CONFIG.ROOT_ID;
    root.setAttribute('data-fn-exp', FN_CONFIG.EXP_ID);

    var overlay = document.createElement('button');
    overlay.className = 'FN-overlay';
    overlay.type = 'button';
    overlay.setAttribute('aria-label', 'Fechar carrinho');

    var panel = document.createElement('aside');
    panel.className = 'FN-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    var head = document.createElement('div');
    head.className = 'FN-head';

    var title = document.createElement('h3');
    title.className = 'FN-title';
    title.textContent = FN_CONFIG.LABELS.title;

    var close = document.createElement('button');
    close.className = 'FN-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar');
    close.textContent = '×';

    var free = document.createElement('div');
    free.className = 'FN-free';
    free.setAttribute('data-fn-free', '1');
    free.textContent = FN_CONFIG.LABELS.freeShippingText.replace('{value}', FN_utils.formatBRL(0));

    var bar = document.createElement('div');
    bar.className = 'FN-bar';
    var barFill = document.createElement('i');
    bar.appendChild(barFill);
    free.appendChild(bar);

    var list = document.createElement('div');
    list.className = 'FN-list';
    list.setAttribute('data-fn-list', '1');

    var foot = document.createElement('div');
    foot.className = 'FN-foot';

    var subtotal = document.createElement('div');
    subtotal.className = 'FN-subtotal';
    subtotal.innerHTML =
      '<span>' + FN_CONFIG.LABELS.subtotal + '</span><span data-fn-subtotal>R$ 0,00</span>';

    var checkout = document.createElement('a');
    checkout.className = 'FN-cta FN-cta-primary';
    checkout.href = '/checkout';
    checkout.textContent = FN_CONFIG.LABELS.checkout;

    var continueShopping = document.createElement('button');
    continueShopping.type = 'button';
    continueShopping.className = 'FN-cta FN-cta-secondary FN-continue';
    continueShopping.textContent = FN_CONFIG.LABELS.continueShopping;

    // Adicionar elementos ao footer
    foot.appendChild(subtotal);
    foot.appendChild(checkout);
    foot.appendChild(continueShopping);

    head.appendChild(title);
    head.appendChild(close);
    panel.appendChild(head);
    panel.appendChild(free);
    panel.appendChild(list);
    panel.appendChild(foot);

    root.appendChild(overlay);
    root.appendChild(panel);
    document.body.appendChild(root);

    return root;
  }

  // Funcao principal de renderizacao usando dados da API
  function FN_render(data) {
    var root = FN_buildDOM();
    var list = FN_utils.q('[data-fn-list]', root);
    var subtotalEl = FN_utils.q('[data-fn-subtotal]', root);
    var freeText = FN_utils.q('[data-fn-free]', root);
    var barFill = FN_utils.q('.FN-bar > i', root);
    var footEl = FN_utils.q('.FN-foot', root);

    // Se nao recebeu dados, usar dados em cache
    if (!data) {
      data = FN_state.cartData;
    }

    // Limpar lista
    list.textContent = '';

    // Se ainda nao tem dados, mostrar loading
    if (!data) {
      var loading = document.createElement('div');
      loading.className = 'FN-loading';
      loading.textContent = 'Carregando carrinho...';
      list.appendChild(loading);
      return;
    }

    // Se carrinho vazio, mostrar mensagem
    if (!data.items || data.items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'FN-empty';
      empty.textContent = FN_CONFIG.LABELS.emptyCart;
      list.appendChild(empty);

      // Atualizar subtotal para zero
      subtotalEl.textContent = FN_utils.formatBRL(0);
      freeText.childNodes[0].nodeValue =
        FN_CONFIG.LABELS.freeShippingText.replace(
          '{value}',
          FN_utils.formatBRL(FN_CONFIG.FREE_SHIPPING_THRESHOLD),
        ) + ' ';
      barFill.style.width = '0%';

      // Esconder footer se carrinho vazio
      if (footEl) {
        footEl.style.setProperty('display', 'none', 'important');
      }
      return;
    }

    // Mostrar footer se carrinho tem itens
    if (footEl) {
      footEl.style.removeProperty('display');
    }

    // Renderizar itens do carrinho
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];

      var row = document.createElement('div');
      row.className = 'FN-item';
      row.setAttribute('data-id', item.id);
      row.setAttribute('data-sku', item.sku || '');

      var img = document.createElement('img');
      img.src = item.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      img.alt = item.name;

      // Link para produto na imagem
      if (item.productUrl) {
        var imgLink = document.createElement('a');
        imgLink.href = item.productUrl;
        imgLink.appendChild(img);
        row.appendChild(imgLink);
      } else {
        row.appendChild(img);
      }

      var mid = document.createElement('div');

      // Nome do produto com link
      var name = document.createElement('p');
      name.className = 'FN-name';
      if (item.productUrl) {
        var nameLink = document.createElement('a');
        nameLink.href = item.productUrl;
        nameLink.textContent = item.name;
        nameLink.style.setProperty('color', 'inherit', 'important');
        nameLink.style.setProperty('text-decoration', 'none', 'important');
        name.appendChild(nameLink);
      } else {
        name.textContent = item.name;
      }

      var price = document.createElement('p');
      price.className = 'FN-price';
      price.textContent = FN_utils.formatBRL(item.price);

      var qty = document.createElement('div');
      qty.className = 'FN-qty';
      var minus = document.createElement('button');
      minus.type = 'button';
      minus.textContent = '-';
      minus.setAttribute('data-action', 'decrease');
      minus.setAttribute('data-item-id', item.id);

      var qtyN = document.createElement('input');
      qtyN.type = 'number';
      qtyN.min = '1';
      qtyN.value = String(item.qty);
      qtyN.setAttribute('data-item-id', item.id);
      qtyN.setAttribute('data-action', 'qty-input');

      var plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
      plus.setAttribute('data-action', 'increase');
      plus.setAttribute('data-item-id', item.id);

      qty.appendChild(minus);
      qty.appendChild(qtyN);
      qty.appendChild(plus);

      mid.appendChild(name);
      mid.appendChild(price);
      mid.appendChild(qty);

      // Verificar se e produto recorrente e adicionar alerta
      if (item.isRecurring) {
        var recurringAlert = document.createElement('div');
        recurringAlert.className = 'FN-recurring-alert';
        recurringAlert.textContent =
          'O envio de ' + item.qty + ' unidade(s) será realizada mensalmente.';
        mid.appendChild(recurringAlert);
      }

      var trash = document.createElement('button');
      trash.type = 'button';
      trash.className = 'FN-trash';
      trash.setAttribute('aria-label', 'Remover item');
      trash.setAttribute('data-action', 'remove');
      trash.setAttribute('data-item-id', item.id);
      trash.textContent = 'Remover';

      row.appendChild(mid);
      row.appendChild(trash);
      list.appendChild(row);
    }

    // Atualizar subtotal
    subtotalEl.textContent = FN_utils.formatBRL(data.subtotal);

    // Atualizar barra de frete gratis
    var missing = data.missingForFreeShipping;
    if (missing <= 0) {
      freeText.childNodes[0].nodeValue = FN_CONFIG.LABELS.freeShippingComplete + ' ';
      barFill.style.width = '100%';
    } else {
      freeText.childNodes[0].nodeValue =
        FN_CONFIG.LABELS.freeShippingText.replace('{value}', FN_utils.formatBRL(missing)) + ' ';
      var progress = Math.max(
        8,
        Math.min(95, (data.subtotal / FN_CONFIG.FREE_SHIPPING_THRESHOLD) * 100),
      );
      barFill.style.width = progress + '%';
    }

    console.log('[FN MiniCart] Carrinho renderizado com ' + data.items.length + ' item(s)');
  }

  // Funcao para abrir o mini cart
  function FN_open(origin) {
    var root = FN_buildDOM();
    if (!root) return;

    // Mostrar o carrinho imediatamente
    root.classList.add('FN-open');

    // Renderizar com dados em cache primeiro
    if (FN_state.cartData) {
      FN_render(FN_state.cartData);
    } else {
      FN_render(null); // Mostra loading
    }

    // Buscar dados atualizados da API
    FN_getCartData(true, function (data) {
      if (data) {
        FN_render(data);
      }
    });

    FN_utils.dispatchMetric('fn_minicart_enable', { origin: origin || 'auto_enable' });
  }

  function FN_close() {
    var root = document.getElementById(FN_CONFIG.ROOT_ID);
    if (root) root.classList.remove('FN-open');
  }

  function FN_bindEvents() {
    if (FN_state.handlersBound) return;
    FN_state.handlersBound = true;

    document.addEventListener(
      'click',
      function (e) {
        var root = document.getElementById(FN_CONFIG.ROOT_ID);
        var t = e.target;

        if (
          root &&
          (t.classList.contains('FN-overlay') ||
            t.classList.contains('FN-close') ||
            t.classList.contains('FN-continue'))
        ) {
          FN_close();
          return;
        }

        // Verificar se clicou em botao de quantidade ou remover
        var action = t.getAttribute('data-action');
        var itemId = t.getAttribute('data-item-id');

        // Permitir que o input de quantidade receba cliques normalmente
        if (action === 'qty-input') {
          return;
        }

        if (action && itemId) {
          e.preventDefault();
          e.stopPropagation();

          if (action === 'increase') {
            FN_updateQuantity(itemId, 1);
          } else if (action === 'decrease') {
            FN_updateQuantity(itemId, -1);
          } else if (action === 'remove') {
            FN_removeItem(itemId);
          }
          return;
        }

        var triggerMatch = FN_CONFIG.SELECTORS.cartOpenTriggers.some(function (sel) {
          try {
            return t.closest && t.closest(sel);
          } catch (err) {
            return false;
          }
        });

        if (triggerMatch) {
          FN_open('user_enable');
        }
      },
      true,
    );

    // Event handler para input de quantidade (blur e enter)
    document.addEventListener(
      'change',
      function (e) {
        var t = e.target;
        if (t.getAttribute('data-action') === 'qty-input') {
          var itemId = t.getAttribute('data-item-id');
          var newQty = parseInt(t.value, 10);
          if (isNaN(newQty) || newQty < 1) {
            newQty = 1;
            t.value = '1';
          }
          FN_setQuantity(itemId, newQty);
        }
      },
      true,
    );

    document.addEventListener(
      'keypress',
      function (e) {
        var t = e.target;
        if (t.getAttribute('data-action') === 'qty-input' && e.key === 'Enter') {
          e.preventDefault();
          t.blur();
        }
      },
      true,
    );
  }

  // Funcao para salvar itens recorrentes no localStorage
  function FN_saveRecurringItems(items) {
    var recurringMap = {};
    for (var i = 0; i < items.length; i++) {
      if (items[i].isRecurring) {
        recurringMap[items[i].id] = true;
        if (items[i].sku) {
          recurringMap[items[i].sku] = true;
        }
      }
    }
    FN_utils.saveRecurringItems(recurringMap);
  }

  // Tenta atualizar quantidade usando os controles nativos do Magento
  function FN_tryNativeQuantityUpdate(itemId, newQty, delta) {
    var nativeInput =
      document.querySelector('#cart-' + itemId + '-qty') ||
      document.querySelector('input[name="cart[' + itemId + '][qty]"]') ||
      document.querySelector(
        '.qty-wrapper[data-role="' + itemId + '"] input[data-role="cart-item-qty"]',
      );

    if (!nativeInput) {
      console.log('[FN MiniCart] Controle nativo de qty nao encontrado para item ' + itemId);
      return false;
    }

    // Em +/- tentamos clicar no mesmo controle nativo do site
    if (delta === 1 || delta === -1) {
      var wrapper =
        nativeInput.closest('.qty-wrapper') ||
        document.querySelector('.qty-wrapper[data-role="' + itemId + '"]');
      if (wrapper) {
        var actionSelector = delta > 0 ? '.qty-action.plus' : '.qty-action.minus';
        var actionButton = wrapper.querySelector(actionSelector);
        if (actionButton) {
          console.log('[FN MiniCart] Atualizando qty via clique nativo (' + actionSelector + ')');
          actionButton.click();
          return true;
        }
      }
    }

    // Fallback nativo: ajustar valor e disparar eventos esperados pelo Magento
    nativeInput.value = String(newQty);
    nativeInput.setAttribute('value', String(newQty));
    nativeInput.setAttribute('data-item-qty', String(newQty));
    nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
    nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
    nativeInput.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[FN MiniCart] Atualizando qty via eventos no input nativo');
    return true;
  }

  // Sincroniza quantidade no backend usando fluxo de minicart do Magento
  function FN_syncQuantityWithServer(itemId, newQty) {
    var formKey = FN_getFormKey();
    var sidebarData = new FormData();
    sidebarData.append('item_id', itemId);
    sidebarData.append('item_qty', newQty);
    if (formKey) {
      sidebarData.append('form_key', formKey);
    }

    // Priorizar endpoint do sidebar (mesmo dominio do minicart nativo)
    fetch('/checkout/sidebar/updateItemQty/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: sidebarData,
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Sidebar qty falhou: ' + response.status);
        }
        console.log('[FN MiniCart] Quantidade atualizada via /checkout/sidebar/updateItemQty/');
      })
      .catch(function () {
        console.log('[FN MiniCart] Sidebar falhou, tentando /checkout/cart/updateItemQty/');
        // Fallback para endpoint legado já usado no experimento
        var formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('item_qty', newQty);

        fetch('/checkout/cart/updateItemQty/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: formData,
        }).catch(function (error) {
          console.log('[FN MiniCart] Erro ao atualizar quantidade: ' + error.message);
          FN_updateQuantityAlternative(itemId, newQty);
        });
      });
  }

  // Funcao para definir quantidade especifica de um item
  function FN_setQuantity(itemId, newQty) {
    if (!FN_state.cartData || !FN_state.cartData.items) return;

    // Encontrar o item
    var item = null;
    var itemIndex = -1;
    for (var i = 0; i < FN_state.cartData.items.length; i++) {
      if (String(FN_state.cartData.items[i].id) === String(itemId)) {
        item = FN_state.cartData.items[i];
        itemIndex = i;
        break;
      }
    }

    if (!item) {
      console.log('[FN MiniCart] Item nao encontrado: ' + itemId);
      return;
    }

    // Se quantidade for 0 ou menos, remover item
    if (newQty <= 0) {
      FN_removeItem(itemId);
      return;
    }

    // Se quantidade nao mudou, nao fazer nada
    if (newQty === item.qty) {
      return;
    }

    var oldQty = item.qty;
    console.log(
      '[FN MiniCart] Definindo quantidade do item ' + itemId + ' de ' + oldQty + ' para ' + newQty,
    );

    // ATUALIZAÇÃO OTIMISTA: Atualizar estado local imediatamente
    FN_state.cartData.items[itemIndex].qty = newQty;

    // Recalcular subtotal
    var newSubtotal = 0;
    for (var j = 0; j < FN_state.cartData.items.length; j++) {
      newSubtotal += FN_state.cartData.items[j].price * FN_state.cartData.items[j].qty;
    }
    FN_state.cartData.subtotal = newSubtotal;
    FN_state.cartData.missingForFreeShipping = Math.max(
      0,
      FN_CONFIG.FREE_SHIPPING_THRESHOLD - newSubtotal,
    );

    // Salvar no localStorage para persistência
    FN_utils.saveToStorage(FN_state.cartData);

    // Re-renderizar com os dados atualizados localmente
    FN_render(FN_state.cartData);

    // Tentar primeiro o mecanismo nativo do Magento para manter fluxo oficial
    if (FN_tryNativeQuantityUpdate(itemId, newQty, null)) {
      return;
    }

    // Fallback: sincronizar diretamente via endpoints de update
    FN_syncQuantityWithServer(itemId, newQty);
  }

  // Funcao para atualizar quantidade de um item
  function FN_updateQuantity(itemId, delta) {
    if (!FN_state.cartData || !FN_state.cartData.items) return;

    // Encontrar o item
    var item = null;
    var itemIndex = -1;
    for (var i = 0; i < FN_state.cartData.items.length; i++) {
      if (String(FN_state.cartData.items[i].id) === String(itemId)) {
        item = FN_state.cartData.items[i];
        itemIndex = i;
        break;
      }
    }

    if (!item) {
      console.log('[FN MiniCart] Item nao encontrado: ' + itemId);
      return;
    }

    var newQty = item.qty + delta;

    // Se quantidade for 0 ou menos, remover item
    if (newQty <= 0) {
      FN_removeItem(itemId);
      return;
    }

    console.log(
      '[FN MiniCart] Atualizando quantidade do item ' +
        itemId +
        ' de ' +
        item.qty +
        ' para ' +
        newQty,
    );

    // ATUALIZAÇÃO OTIMISTA: Atualizar estado local imediatamente
    FN_state.cartData.items[itemIndex].qty = newQty;

    // Recalcular subtotal
    var newSubtotal = 0;
    for (var j = 0; j < FN_state.cartData.items.length; j++) {
      newSubtotal += FN_state.cartData.items[j].price * FN_state.cartData.items[j].qty;
    }
    FN_state.cartData.subtotal = newSubtotal;
    FN_state.cartData.missingForFreeShipping = Math.max(
      0,
      FN_CONFIG.FREE_SHIPPING_THRESHOLD - newSubtotal,
    );

    // Salvar no localStorage para persistência
    FN_utils.saveToStorage(FN_state.cartData);

    // Atualizar visualmente (feedback imediato)
    var qtyInput = document.querySelector(
      '[data-item-id="' + itemId + '"][data-action="qty-input"]',
    );
    if (qtyInput) {
      qtyInput.value = String(newQty);
    }

    // Atualizar subtotal e barra de frete na UI
    var subtotalEl = document.querySelector('[data-fn-subtotal]');
    if (subtotalEl) {
      subtotalEl.textContent = FN_utils.formatBRL(newSubtotal);
    }

    var freeText = document.querySelector('[data-fn-free]');
    var barFill = document.querySelector('.FN-bar > i');
    if (freeText && barFill) {
      var missing = FN_state.cartData.missingForFreeShipping;
      if (missing <= 0) {
        freeText.childNodes[0].nodeValue = FN_CONFIG.LABELS.freeShippingComplete + ' ';
        barFill.style.width = '100%';
      } else {
        freeText.childNodes[0].nodeValue =
          FN_CONFIG.LABELS.freeShippingText.replace('{value}', FN_utils.formatBRL(missing)) + ' ';
        var progress = Math.max(
          8,
          Math.min(95, (newSubtotal / FN_CONFIG.FREE_SHIPPING_THRESHOLD) * 100),
        );
        barFill.style.width = progress + '%';
      }
    }

    // Tentar primeiro o mecanismo nativo do Magento para manter fluxo oficial
    if (FN_tryNativeQuantityUpdate(itemId, newQty, delta)) {
      return;
    }

    // Fallback: sincronizar diretamente via endpoints de update
    FN_syncQuantityWithServer(itemId, newQty);
  }

  // Metodo alternativo para atualizar quantidade (via form post)
  function FN_updateQuantityAlternative(itemId, newQty) {
    // Buscar form_key da pagina
    var formKeyInput = document.querySelector('input[name="form_key"]');
    var formKey = formKeyInput ? formKeyInput.value : '';

    var url = '/checkout/cart/updatePost/';
    var formData = new FormData();
    formData.append('form_key', formKey);
    formData.append('cart[' + itemId + '][qty]', newQty);
    formData.append('update_cart_action', 'update_qty');

    fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
      .then(function () {
        // Buscar dados atualizados após delay
        setTimeout(function () {
          FN_fetchCartData(function (data) {
            var root = document.getElementById(FN_CONFIG.ROOT_ID);
            if (data && root && root.classList.contains('FN-open')) {
              FN_render(data);
            }
          });
        }, 500);
      })
      .catch(function (error) {
        console.log('[FN MiniCart] Erro no metodo alternativo: ' + error.message);
      });
  }

  // Funcao auxiliar para obter form_key do Magento
  function FN_getFormKey() {
    // Tentar input hidden
    var formKeyInput = document.querySelector('input[name="form_key"]');
    if (formKeyInput && formKeyInput.value) {
      return formKeyInput.value;
    }

    // Tentar meta tag
    var metaFormKey = document.querySelector('meta[name="form_key"]');
    if (metaFormKey && metaFormKey.getAttribute('content')) {
      return metaFormKey.getAttribute('content');
    }

    // Tentar cookie
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf('form_key=') === 0) {
        return cookie.substring(9);
      }
    }

    // Tentar variavel global do Magento
    if (window.FORM_KEY) {
      return window.FORM_KEY;
    }

    // Tentar no requirejs/Magento
    if (window.require && typeof window.require === 'function') {
      try {
        var mageConfig = window.require.s.contexts._.config;
        if (
          mageConfig &&
          mageConfig.config &&
          mageConfig.config['Magento_Customer/js/customer-data']
        ) {
          // Pode ter form_key aqui
        }
      } catch (e) {}
    }

    return '';
  }

  // Funcao para remover item do carrinho
  function FN_removeItem(itemId) {
    console.log('[FN MiniCart] Removendo item: ' + itemId);

    // Feedback visual imediato - esconder o item
    var itemRow = document.querySelector('[data-id="' + itemId + '"]');
    if (itemRow) {
      itemRow.style.setProperty('opacity', '0.5', 'important');
      itemRow.style.setProperty('pointer-events', 'none', 'important');
    }

    var formKey = FN_getFormKey();
    console.log('[FN MiniCart] Form key encontrado: ' + (formKey ? 'sim' : 'nao'));

    // Metodo 1: Usar endpoint do sidebar (mais comum em Magento 2 moderno)
    FN_removeViaSidebar(itemId, formKey, itemRow);
  }

  // Metodo via sidebar/removeItem (Magento 2 AJAX)
  function FN_removeViaSidebar(itemId, formKey, itemRow) {
    console.log('[FN MiniCart] Tentando remover via sidebar...');

    var payload = {
      item_id: itemId,
    };

    fetch('/checkout/sidebar/removeItem/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body:
        'item_id=' +
        encodeURIComponent(itemId) +
        (formKey ? '&form_key=' + encodeURIComponent(formKey) : ''),
    })
      .then(function (response) {
        return response.json().catch(function () {
          return {};
        });
      })
      .then(function (data) {
        if (data.success || !data.error_message) {
          console.log('[FN MiniCart] Item removido com sucesso via sidebar');
          FN_state.cartData = null;
          FN_fetchCartData(function (cartData) {
            FN_render(cartData);
          });
        } else {
          console.log('[FN MiniCart] Sidebar falhou, tentando cart/delete...');
          FN_removeViaCartDelete(itemId, formKey, itemRow);
        }
      })
      .catch(function (error) {
        console.log('[FN MiniCart] Erro no sidebar: ' + error.message);
        FN_removeViaCartDelete(itemId, formKey, itemRow);
      });
  }

  // Metodo via cart/delete POST
  function FN_removeViaCartDelete(itemId, formKey, itemRow) {
    console.log('[FN MiniCart] Tentando remover via cart/delete POST...');

    var bodyData = 'id=' + encodeURIComponent(itemId);
    if (formKey) {
      bodyData += '&form_key=' + encodeURIComponent(formKey);
    }

    fetch('/checkout/cart/delete/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: bodyData,
    })
      .then(function (response) {
        // Qualquer resposta (incluindo redirect) indica tentativa
        console.log('[FN MiniCart] Resposta cart/delete: ' + response.status);
        FN_state.cartData = null;
        FN_fetchCartData(function (data) {
          if (data) {
            // Verificar se item foi realmente removido
            var itemStillExists = false;
            if (data.items) {
              for (var i = 0; i < data.items.length; i++) {
                if (String(data.items[i].id) === String(itemId)) {
                  itemStillExists = true;
                  break;
                }
              }
            }

            if (itemStillExists) {
              console.log('[FN MiniCart] Item ainda existe, tentando GET...');
              FN_removeViaCartDeleteGet(itemId, formKey, itemRow);
            } else {
              FN_render(data);
            }
          }
        });
      })
      .catch(function (error) {
        console.log('[FN MiniCart] Erro no cart/delete POST: ' + error.message);
        FN_removeViaCartDeleteGet(itemId, formKey, itemRow);
      });
  }

  // Metodo via cart/delete GET (URL padrao Magento)
  function FN_removeViaCartDeleteGet(itemId, formKey, itemRow) {
    console.log('[FN MiniCart] Tentando remover via cart/delete GET...');

    var url = '/checkout/cart/delete/id/' + itemId + '/';
    if (formKey) {
      url += 'form_key/' + formKey + '/';
    }

    // Criar uenc (encoded URL para redirect)
    var currentUrl = window.location.href;
    var uenc = '';
    try {
      uenc = btoa(currentUrl).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
    } catch (e) {}

    if (uenc) {
      url += 'uenc/' + uenc + '/';
    }

    fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then(function (response) {
        console.log('[FN MiniCart] Resposta cart/delete GET: ' + response.status);
        FN_state.cartData = null;
        setTimeout(function () {
          FN_fetchCartData(function (data) {
            if (data) {
              var itemStillExists = false;
              if (data.items) {
                for (var i = 0; i < data.items.length; i++) {
                  if (String(data.items[i].id) === String(itemId)) {
                    itemStillExists = true;
                    break;
                  }
                }
              }

              if (itemStillExists) {
                console.log('[FN MiniCart] Item ainda existe, tentando updatePost...');
                FN_removeViaUpdatePost(itemId, formKey, itemRow);
              } else {
                FN_render(data);
              }
            }
          });
        }, 200);
      })
      .catch(function (error) {
        console.log('[FN MiniCart] Erro no GET: ' + error.message);
        FN_removeViaUpdatePost(itemId, formKey, itemRow);
      });
  }

  // Metodo via updatePost com quantidade 0
  function FN_removeViaUpdatePost(itemId, formKey, itemRow) {
    console.log('[FN MiniCart] Tentando remover via updatePost (qty=0)...');

    var bodyData = 'cart[' + itemId + '][qty]=0&update_cart_action=update_qty';
    if (formKey) {
      bodyData += '&form_key=' + encodeURIComponent(formKey);
    }

    fetch('/checkout/cart/updatePost/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: bodyData,
    })
      .then(function () {
        FN_state.cartData = null;
        FN_fetchCartData(function (data) {
          if (data) {
            var itemStillExists = false;
            if (data.items) {
              for (var i = 0; i < data.items.length; i++) {
                if (String(data.items[i].id) === String(itemId)) {
                  itemStillExists = true;
                  break;
                }
              }
            }

            if (itemStillExists) {
              console.log('[FN MiniCart] Todos os metodos falharam. Removendo visualmente...');
              // Remover item visualmente do cache local
              FN_removeItemFromLocalCache(itemId);
            } else {
              FN_render(data);
            }
          }
        });
      })
      .catch(function (error) {
        console.log('[FN MiniCart] Erro no updatePost: ' + error.message);
        // Restaurar visual
        if (itemRow) {
          itemRow.style.removeProperty('opacity');
          itemRow.style.removeProperty('pointer-events');
        }
        alert('Nao foi possivel remover o item. Por favor, tente na pagina do carrinho.');
      });
  }

  // Funcao para remover item do cache local (ultimo recurso)
  function FN_removeItemFromLocalCache(itemId) {
    if (!FN_state.cartData || !FN_state.cartData.items) return;

    var newItems = [];
    var removedPrice = 0;

    for (var i = 0; i < FN_state.cartData.items.length; i++) {
      var item = FN_state.cartData.items[i];
      if (String(item.id) !== String(itemId)) {
        newItems.push(item);
      } else {
        removedPrice = item.price * item.qty;
      }
    }

    FN_state.cartData.items = newItems;
    FN_state.cartData.subtotal -= removedPrice;
    FN_state.cartData.missingForFreeShipping = Math.max(
      0,
      FN_CONFIG.FREE_SHIPPING_THRESHOLD - FN_state.cartData.subtotal,
    );
    FN_state.cartData.summaryCount = newItems.length;

    FN_utils.saveToStorage(FN_state.cartData);
    FN_render(FN_state.cartData);

    console.log('[FN MiniCart] Item removido do cache local');
  }

  function FN_syncRouteAndRender() {
    var current = FN_utils.routeKey();
    if (current !== FN_state.routeKey) {
      FN_state.routeKey = current;
      FN_close(); // teardown visual em troca de rota
    }

    if (!FN_state.mounted) {
      FN_utils.ensureStyle();
      FN_buildDOM();
      FN_bindEvents();
      FN_state.mounted = true;
      FN_utils.dispatchMetric('fn_minicart_ready', { origin: 'auto_enable' });
    }
  }

  function FN_startObserver() {
    if (window[FN_CONFIG.OBSERVER_ID]) return;
    var body = document.body;
    if (!body) return;

    FN_state.observer = new MutationObserver(function () {
      FN_syncRouteAndRender();
    });

    FN_state.observer.observe(body, { childList: true, subtree: true });
    window[FN_CONFIG.OBSERVER_ID] = FN_state.observer;
  }

  // Funcao para esconder o mini cart original do Magento
  function FN_hideOriginalMiniCart() {
    // Seletores do mini cart original do Magento
    var selectors = [
      '.block-minicart',
      '.block.block-minicart',
      '.ui-dialog-content.block-minicart',
      '[data-role="dropdownDialog"]',
      '.minicart-wrapper .block-minicart',
      '#ui-id-1',
    ];

    function hideElements() {
      selectors.forEach(function (sel) {
        var elements = document.querySelectorAll(sel);
        elements.forEach(function (el) {
          if (!el.hasAttribute('data-fn-hidden')) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            el.setAttribute('data-fn-hidden', 'true');
            console.log('[FN MiniCart] Mini cart original ocultado: ' + sel);
          }
        });
      });
    }

    // Esconder imediatamente
    hideElements();

    // Observar DOM para esconder elementos criados dinamicamente
    var hideObserver = new MutationObserver(function () {
      hideElements();
    });

    hideObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Re-verificar periodicamente nos primeiros segundos
    var hideInterval = setInterval(function () {
      hideElements();
    }, 500);

    // Parar de verificar apos 10 segundos
    setTimeout(function () {
      clearInterval(hideInterval);
    }, 10000);
  }

  // Funcao principal de inicializacao
  function FN_bootstrap() {
    console.log('[FN MiniCart] Inicializando mini cart dinamico...');

    FN_utils.ensureStyle();
    FN_syncRouteAndRender();
    FN_startObserver();

    // Esconder mini cart original do Magento
    FN_hideOriginalMiniCart();

    // Interceptar mudancas no carrinho via API
    FN_interceptCartChanges();

    // Carregar dados do localStorage ou API na inicializacao
    var storedData = FN_utils.loadFromStorage();
    if (storedData) {
      FN_state.cartData = storedData;
      console.log('[FN MiniCart] Dados carregados do cache local');
    }

    // Buscar dados atualizados da API em background
    FN_fetchCartData(function (data) {
      if (data) {
        console.log('[FN MiniCart] Dados da API carregados com sucesso');
      }
    });

    var retryTimer = setInterval(function () {
      FN_syncRouteAndRender();
      FN_state.retries += 1;
      if (FN_state.retries >= FN_CONFIG.MAX_RETRIES) clearInterval(retryTimer);
    }, FN_CONFIG.RETRY_MS);

    // Funcao global para forcar atualizacao do carrinho
    window.FN_refreshCart = function () {
      console.log('[FN MiniCart] Atualizacao manual do carrinho solicitada');
      FN_state.cartData = null;
      FN_fetchCartData(function (data) {
        if (data) {
          var root = document.getElementById(FN_CONFIG.ROOT_ID);
          if (root && root.classList.contains('FN-open')) {
            FN_render(data);
          }
        }
      });
    };

    // Funcao global para limpar cache
    window.FN_clearCartCache = function () {
      FN_utils.clearStorage();
      FN_state.cartData = null;
      console.log('[FN MiniCart] Cache do carrinho limpo');
    };

    window.FN_teardown = function () {
      if (FN_state.observer) FN_state.observer.disconnect();
      var root = document.getElementById(FN_CONFIG.ROOT_ID);
      var style = document.getElementById(FN_CONFIG.STYLE_ID);
      if (root && root.parentNode) root.parentNode.removeChild(root);
      if (style && style.parentNode) style.parentNode.removeChild(style);
      delete window[FN_CONFIG.OBSERVER_ID];
      delete window.FN_refreshCart;
      delete window.FN_clearCartCache;
      FN_state.mounted = false;
      FN_state.cartData = null;
      FN_utils.dispatchMetric('fn_minicart_teardown', { origin: 'auto_enable' });
    };

    window.FN_utils = window.FN_utils || {};
    window.FN_utils.reactSelectByKeyboard = FN_utils.reactSelectByKeyboard;

    console.log('[FN MiniCart] Mini cart inicializado com sucesso');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FN_bootstrap);
  } else {
    FN_bootstrap();
  }
})();
