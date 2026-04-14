(function () {
  'use strict';

  const STYLE_ID = 'at-drogasil-modal-recomendacao-style';
  const MODAL_ID = 'at-drogasil-modal-recomendacao';
  const OVERLAY_ID = 'at-drogasil-modal-overlay';
  const PRODUCT_SKU = '28300';
  const PRODUCT_NAME = 'Sensor de Glicose FreeStyle Libre - 1 unidade';
  const PRODUCT_IMAGE = 'https://product-data.raiadrogasil.io/images/3451699.webp';
  const PRODUCT_URL = '/freestyle-libre-sensor-kit-sensor-aplicador-lenco-de-alcool';
  const API_HOME = 'https://www.drogasil.com.br/api/next/home/graphql';
  const API_BUSCA = 'https://www.drogasil.com.br/api/next/busca/graphql';

  let isProcessing = false;
  let debounceTimer = null;

  // -- CSS --
  function getModalCss() {
    return [
      '#' + OVERLAY_ID + ' {',
      '  position: fixed;',
      '  top: 0;',
      '  left: 0;',
      '  width: 100%;',
      '  height: 100%;',
      '  background: rgba(0, 0, 0, 0.55);',
      '  z-index: 99998;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  opacity: 0;',
      '  transition: opacity 0.3s ease;',
      '}',
      '#' + OVERLAY_ID + '.at-modal-visible {',
      '  opacity: 1;',
      '}',
      '#' + MODAL_ID + ' {',
      '  position: relative;',
      '  background: #fff;',
      '  border-radius: 12px;',
      '  max-width: 420px;',
      '  width: 90%;',
      '  padding: 28px 24px 24px;',
      '  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);',
      '  z-index: 99999;',
      '  text-align: center;',
      '  font-family: Arial, Helvetica, sans-serif;',
      '  transform: translateY(20px);',
      '  transition: transform 0.3s ease;',
      '}',
      '#' + OVERLAY_ID + '.at-modal-visible #' + MODAL_ID + ' {',
      '  transform: translateY(0);',
      '}',
      '#' + MODAL_ID + ' .at-modal-close {',
      '  position: absolute;',
      '  top: 10px;',
      '  right: 14px;',
      '  background: none;',
      '  border: none;',
      '  font-size: 22px;',
      '  color: #666;',
      '  cursor: pointer;',
      '  line-height: 1;',
      '  padding: 4px;',
      '}',
      '#' + MODAL_ID + ' .at-modal-close:hover {',
      '  color: #222;',
      '}',
      '#' + MODAL_ID + ' .at-modal-badge {',
      '  display: inline-block;',
      '  background: #e8f5e9;',
      '  color: #2e7d32;',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  padding: 4px 12px;',
      '  border-radius: 20px;',
      '  margin-bottom: 16px;',
      '  letter-spacing: 0.3px;',
      '}',
      '#' + MODAL_ID + ' .at-modal-img {',
      '  width: 160px;',
      '  height: 160px;',
      '  object-fit: contain;',
      '  margin: 0 auto 16px;',
      '  display: block;',
      '}',
      '#' + MODAL_ID + ' .at-modal-product-name {',
      '  font-size: 16px;',
      '  font-weight: 600;',
      '  color: #333;',
      '  margin: 0 0 8px;',
      '  line-height: 1.3;',
      '}',
      '#' + MODAL_ID + ' .at-modal-brand {',
      '  font-size: 13px;',
      '  color: #888;',
      '  margin: 0 0 18px;',
      '}',
      '#' + MODAL_ID + ' .at-modal-btn-add {',
      '  display: inline-block;',
      '  width: 100%;',
      '  padding: 14px 20px;',
      '  background: #e30613;',
      '  color: #fff;',
      '  font-size: 15px;',
      '  font-weight: 700;',
      '  border: none;',
      '  border-radius: 8px;',
      '  cursor: pointer;',
      '  transition: background 0.2s ease;',
      '  letter-spacing: 0.3px;',
      '}',
      '#' + MODAL_ID + ' .at-modal-btn-add:hover {',
      '  background: #c00510;',
      '}',
      '#' + MODAL_ID + ' .at-modal-btn-add:disabled {',
      '  background: #ccc;',
      '  cursor: not-allowed;',
      '}',
      '#' + MODAL_ID + ' .at-modal-btn-add.at-added {',
      '  background: #2e7d32;',
      '}',
      '#' + MODAL_ID + ' .at-modal-link {',
      '  display: inline-block;',
      '  margin-top: 12px;',
      '  font-size: 13px;',
      '  color: #e30613;',
      '  text-decoration: underline;',
      '  cursor: pointer;',
      '}',
      '#' + MODAL_ID + ' .at-modal-link:hover {',
      '  color: #c00510;',
      '}',
      '#' + MODAL_ID + ' .at-modal-error {',
      '  color: #c00;',
      '  font-size: 13px;',
      '  margin-top: 8px;',
      '  display: none;',
      '}'
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getModalCss();
    document.head.appendChild(style);
  }

  // -- Tracking Adobe --
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking ModalRecomendacao] Parametros ausentes para analytics.');
      return;
    }

    const labelEvent = 'AT_ModalRecomendacaoDrogasil_' + eventType + ' ' + eventLabel;
    console.log('[Tracking ModalRecomendacao] Analytics event triggered:', labelEvent);

    (function () {
      const s = window.s;
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_drogasil_modal_recomendacao';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // -- API: Requisicao GraphQL generica --
  function graphqlRequest(url, payload, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.errors && response.errors.length > 0) {
            callback(response.errors[0].message, null);
          } else {
            callback(null, response.data);
          }
        } catch (e) {
          callback('Erro ao processar resposta.', null);
        }
      } else {
        callback('Erro HTTP: ' + xhr.status, null);
      }
    };

    xhr.send(JSON.stringify(payload));
  }

  // -- API: Adicionar ao carrinho (replica fluxo nativo: addCartItem + cart + cartTotal) --
  function addToCart(sku, callback) {
    // 1. Mutation addCartItem -> /api/next/home/graphql
    const addPayload = {
      operationName: 'addCartItem',
      query: 'mutation addCartItem($input: AddCartItemInput!) { addCartItem(input: $input) { cartId cartItem { product { sku name } } } }',
      variables: {
        input: {
          cartItem: {
            sku: sku,
            qty: 1
          }
        }
      }
    };

    console.log('[ModalRecomendacao] Enviando addCartItem para SKU:', sku);

    graphqlRequest(API_HOME, addPayload, function (err, data) {
      if (err) {
        console.log('[ModalRecomendacao] Erro addCartItem:', err);
        callback(err, null);
        return;
      }

      console.log('[ModalRecomendacao] addCartItem sucesso. Atualizando carrinho...');

      // 2. Query cart -> /api/next/busca/graphql
      const cartPayload = {
        operationName: 'cart',
        query: 'query cart { cart { pbm item_id sku qty name price accessAvailability product_option product { sku name isSubscribable seller price_aux { lmpm_qty lmpm_value_to value_from value_to } liveComposition { livePrice { pixPrice } } custom_attributes { attribute_code value_string value { label id } } weight breadcrumb { name position } variant kitComposition } } }',
        variables: {}
      };

      graphqlRequest(API_BUSCA, cartPayload, function (errCart, dataCart) {
        if (errCart) {
          console.log('[ModalRecomendacao] Erro ao buscar cart:', errCart);
        } else {
          console.log('[ModalRecomendacao] Cart atualizado. Itens:', dataCart && dataCart.cart ? dataCart.cart.length : 0);
        }

        // 3. Query cartTotal -> /api/next/busca/graphql
        const cartTotalPayload = {
          operationName: 'cartTotal',
          query: 'query cartTotal { cartTotal { subtotal items_qty grand_total subtotal_with_discount base_currency_code savedValue weight installments { installment value } total_segments { code title value } pix_values { subtotal discount } universDebit { limitUsed surplus limitAvailable subtotalValue } univers { totalAvailableLimit beneficiaryId contractName } } }',
          variables: {}
        };

        graphqlRequest(API_BUSCA, cartTotalPayload, function (errTotal, dataTotal) {
          if (errTotal) {
            console.log('[ModalRecomendacao] Erro ao buscar cartTotal:', errTotal);
          } else {
            console.log('[ModalRecomendacao] CartTotal atualizado. Itens no carrinho:', dataTotal && dataTotal.cartTotal ? dataTotal.cartTotal.items_qty : 0);
          }

          // Retorna sucesso do addCartItem independente das queries de refresh
          callback(null, data.addCartItem);
        });
      });
    });
  }

  // -- Modal HTML --
  function buildModal() {
    if (document.getElementById(OVERLAY_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    const modal = document.createElement('div');
    modal.id = MODAL_ID;

    // Botao fechar
    const btnClose = document.createElement('button');
    btnClose.className = 'at-modal-close';
    btnClose.setAttribute('aria-label', 'Fechar');
    btnClose.textContent = '\u2715';

    // Badge
    const badge = document.createElement('span');
    badge.className = 'at-modal-badge';
    badge.textContent = 'Recomendado para voce';

    // Imagem
    const img = document.createElement('img');
    img.className = 'at-modal-img';
    img.src = PRODUCT_IMAGE;
    img.alt = PRODUCT_NAME;
    img.loading = 'lazy';

    // Nome do produto
    const productName = document.createElement('p');
    productName.className = 'at-modal-product-name';
    productName.textContent = PRODUCT_NAME;

    // Marca
    const brand = document.createElement('p');
    brand.className = 'at-modal-brand';
    brand.textContent = 'Freestyle Libre';

    // Botao adicionar
    const btnAdd = document.createElement('button');
    btnAdd.className = 'at-modal-btn-add';
    btnAdd.textContent = 'Adicionar ao carrinho';

    // Mensagem de erro
    const errorMsg = document.createElement('p');
    errorMsg.className = 'at-modal-error';

    // Link para PDP
    const link = document.createElement('a');
    link.className = 'at-modal-link';
    link.href = PRODUCT_URL;
    link.textContent = 'Ver detalhes do produto';

    // Montar modal
    modal.appendChild(btnClose);
    modal.appendChild(badge);
    modal.appendChild(img);
    modal.appendChild(productName);
    modal.appendChild(brand);
    modal.appendChild(btnAdd);
    modal.appendChild(errorMsg);
    modal.appendChild(link);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Forcar reflow para animacao
    void overlay.offsetHeight;
    overlay.classList.add('at-modal-visible');

    // Tracking de visualizacao
    analyticsEvent('modal_exibido', 'view');

    // -- Eventos --
    btnClose.addEventListener('click', function () {
      analyticsEvent('fechar_modal', 'click');
      closeModal();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        analyticsEvent('fechar_overlay', 'click');
        closeModal();
      }
    });

    document.addEventListener('keydown', handleEsc);

    link.addEventListener('click', function () {
      analyticsEvent('ver_detalhes', 'click');
    });

    btnAdd.addEventListener('click', function () {
      if (btnAdd.disabled) return;
      btnAdd.disabled = true;
      btnAdd.textContent = 'Adicionando...';
      errorMsg.style.display = 'none';

      analyticsEvent('adicionar_carrinho_' + PRODUCT_SKU, 'click');

      addToCart(PRODUCT_SKU, function (err, result) {
        if (err) {
          btnAdd.disabled = false;
          btnAdd.textContent = 'Adicionar ao carrinho';
          errorMsg.textContent = err;
          errorMsg.style.display = 'block';
          return;
        }

        btnAdd.textContent = 'Adicionado!';
        btnAdd.classList.add('at-added');

        analyticsEvent('produto_adicionado_' + PRODUCT_SKU, 'sucesso');

        setTimeout(function () {
          closeModal();
        }, 1500);
      });
    });
  }

  function handleEsc(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      analyticsEvent('fechar_esc', 'click');
      closeModal();
    }
  }

  function closeModal() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    overlay.classList.remove('at-modal-visible');
    document.removeEventListener('keydown', handleEsc);

    setTimeout(function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 350);
  }

  // -- Init --
  function init() {
    injectStyles();
    buildModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
