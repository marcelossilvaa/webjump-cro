(function () {
  'use strict';

  // =========================================================================
  // Araujo - Novo Layout Carrinho Desktop
  // Objetivo: Resumo do pedido + CTA fixo no lado direito, produtos com scroll no lado esquerdo
  // Resolucao: Desktop (>= 1200px)
  // =========================================================================

  var STYLE_ID = 'at-araujo-novo-layout-carrinho-desk';
  var WRAPPER_ID = 'at-araujo-two-columns-wrapper';
  var DATA_PROCESSED = 'data-novo-layout-applied';
  var isProcessing = false;
  var debounceTimer = null;
  var DEBOUNCE_DELAY = 150;

  // =========================================================================
  // CSS
  // =========================================================================
  function getStyles() {
    return [
      '/* Wrapper de duas colunas (produtos + resumo) */',
      '#' + WRAPPER_ID + ' {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  flex-wrap: nowrap !important;',
      '  align-items: stretch !important;',
      '  justify-content: space-between !important;',
      '  gap: 16px !important;',
      '  width: 100% !important;',
      '}',
      '',
      '/* Container principal */',
      '.container.cart[' + DATA_PROCESSED + '] {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  max-width: 1280px !important;',
      '  margin: 0 auto !important;',
      '  padding: 0 15px !important;',
      '}',
      '',
      '/* Coluna esquerda - produtos com scroll */',
      '#' + WRAPPER_ID + ' .cart__content {',
      '  flex: 1 1 auto !important;',
      '  min-width: 0 !important;',
      '  max-height: calc(100vh - 200px) !important;',
      '  overflow-y: auto !important;',
      '  overflow-x: hidden !important;',
      '  padding-right: 8px !important;',
      '  box-sizing: border-box !important;',
      '}',
      '',
      '/* Scrollbar customizada para produtos */',
      '#' + WRAPPER_ID + ' .cart__content::-webkit-scrollbar {',
      '  width: 6px !important;',
      '}',
      '#' + WRAPPER_ID + ' .cart__content::-webkit-scrollbar-track {',
      '  background: #f1f1f1 !important;',
      '  border-radius: 3px !important;',
      '}',
      '#' + WRAPPER_ID + ' .cart__content::-webkit-scrollbar-thumb {',
      '  background: #c1c1c1 !important;',
      '  border-radius: 3px !important;',
      '}',
      '#' + WRAPPER_ID + ' .cart__content::-webkit-scrollbar-thumb:hover {',
      '  background: #a1a1a1 !important;',
      '}',
      '',
      '/* Coluna direita - resumo fixo (sticky) */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop {',
      '  position: sticky !important;',
      '  top: 100px !important;',
      '  flex: 0 0 380px !important;',
      '  width: 380px !important;',
      '  min-width: 380px !important;',
      '  max-width: 380px !important;',
      '  height: fit-content !important;',
      '  max-height: calc(100vh - 120px) !important;',
      '  background: #FFFFFF !important;',
      '  border: 1px solid #D6DADA !important;',
      '  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.12) !important;',
      '  border-radius: 16px !important;',
      '  padding: 24px !important;',
      '  box-sizing: border-box !important;',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 16px !important;',
      '  align-self: flex-start !important;',
      '}',
      '',
      '/* Esconde o resumo mobile */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.mobile {',
      '  display: none !important;',
      '}',
      '',
      '/* Titulo do resumo */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summary--text,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summary--text {',
      '  text-align: left !important;',
      '  width: 100% !important;',
      '}',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summary--text h3,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summary--text h3,',
      '#' + WRAPPER_ID + ' .cart__summary.desktop h3,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop h3 {',
      '  font-family: "Inter", sans-serif !important;',
      '  font-weight: 700 !important;',
      '  font-size: 16px !important;',
      '  line-height: 24px !important;',
      '  color: #212529 !important;',
      '  margin: 0 0 16px 0 !important;',
      '  text-align: left !important;',
      '  text-transform: uppercase !important;',
      '  letter-spacing: 0.5px !important;',
      '}',
      '',
      '/* Esconder texto centralizado do resumo original */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summaryInfo > *:not(.cart__summary--details):not(.cart__summary--details-enhanced):not(.cart__summary--title-enhanced):not(.cart__summary--total-wrapper):not(h3),',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summaryInfo > *:not(.cart__summary--details):not(.cart__summary--details-enhanced):not(.cart__summary--title-enhanced):not(.cart__summary--total-wrapper):not(h3) {',
      '  display: none !important;',
      '}',
      '',
      '/* Titulo sobre o pedido */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summaryInfo .cart__summary--title-enhanced,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summaryInfo .cart__summary--title-enhanced {',
      '  display: block !important;',
      '}',
      '',
      '/* Total wrapper */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summaryInfo .cart__summary--total-wrapper,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summaryInfo .cart__summary--total-wrapper {',
      '  display: block !important;',
      '}',
      '',
      '/* Label e valor do total separados */',
      '.cart__summary--total-wrapper .cart__summary--row {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  justify-content: space-between !important;',
      '  width: 100% !important;',
      '}',
      '.cart__summary--total-wrapper .cart__summary--label {',
      '  flex: 0 0 auto !important;',
      '  text-align: left !important;',
      '}',
      '.cart__summary--total-wrapper .cart__summary--value {',
      '  flex: 0 0 auto !important;',
      '  text-align: right !important;',
      '}',
      '',
      '/* Linhas de informacao - labels e valores nas extremidades */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summary--row,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summary--row {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  justify-content: space-between !important;',
      '  align-items: center !important;',
      '  width: 100% !important;',
      '  padding: 4px 0 !important;',
      '}',
      '',
      '/* Labels a esquerda */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summary--row span:first-child,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summary--row span:first-child {',
      '  text-align: left !important;',
      '}',
      '',
      '/* Valores a direita */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summary--row span:last-child,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summary--row span:last-child {',
      '  text-align: right !important;',
      '}',
      '',
      '/* Info do resumo */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summaryInfo,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summaryInfo {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 0 !important;',
      '  width: 100% !important;',
      '  background: #F5F5F5 !important;',
      '  border-radius: 8px !important;',
      '  padding: 16px !important;',
      '  box-sizing: border-box !important;',
      '}',
      '',
      '/* Detalhes do resumo (subtotal, frete, desconto) */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summary--details,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--details {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 10px !important;',
      '  padding: 0 0 12px 0 !important;',
      '  border-bottom: 1px solid #E0E0E0 !important;',
      '  margin-bottom: 12px !important;',
      '}',
      '',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--details__discount {',
      '  font-family: "Inter", sans-serif !important;',
      '  font-weight: 600 !important;',
      '  font-size: 14px !important;',
      '  color: #008A00 !important;',
      '}',
      '',
      '/* Wrapper do botao */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--shippingBtn {',
      '  width: 100% !important;',
      '  margin-top: auto !important;',
      '}',
      '',
      '/* Botao CTA principal */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--shippingBtn .primaryButton {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  justify-content: space-between !important;',
      '  align-items: center !important;',
      '  padding: 12px 16px !important;',
      '  width: 100% !important;',
      '  min-height: 52px !important;',
      '  background: #008A00 !important;',
      '  border-radius: 8px !important;',
      '  text-decoration: none !important;',
      '  box-sizing: border-box !important;',
      '  transition: background 0.2s ease !important;',
      '}',
      '',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--shippingBtn .primaryButton:hover {',
      '  background: #006d00 !important;',
      '}',
      '',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--shippingBtn .primaryButton span {',
      '  font-family: "Inter", sans-serif !important;',
      '  font-weight: 600 !important;',
      '  font-size: 18px !important;',
      '  line-height: 22px !important;',
      '  color: #FFFFFF !important;',
      '}',
      '',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--shippingBtn .primaryButton .cart-totals {',
      '  background: rgba(3, 94, 3, 0.5) !important;',
      '  border-radius: 4px !important;',
      '  padding: 6px 12px !important;',
      '}',
      '',
      '/* Botoes auxiliares (esvaziar cesta) - manter visivel abaixo */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__buttons.clear-container {',
      '  display: flex !important;',
      '  justify-content: center !important;',
      '  padding: 16px 0 !important;',
      '  width: 100% !important;',
      '}',
      '',
      '/* Recomendacoes - manter visivel abaixo do layout */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__recommendations {',
      '  width: 100% !important;',
      '  margin-top: 24px !important;',
      '}',
      '',
      '/* Progress bar - manter visivel acima */',
      '.container.cart[' + DATA_PROCESSED + '] .checkout__progressWrapper {',
      '  margin-bottom: 16px !important;',
      '}',
      '',
      '/* Warning de medicamentos */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__warning {',
      '  margin-bottom: 16px !important;',
      '}',
      '',
      '/* Titulo do carrinho */',
      '.container.cart[' + DATA_PROCESSED + '] .titleLeftWrapper {',
      '  margin-bottom: 16px !important;',
      '}',
      '',
      '/* Esconde versao mobile dos produtos */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content--marketplace.mobile {',
      '  display: none !important;',
      '}',
      '',
      '/* Mostra versao desktop dos produtos */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content--marketplace.desktop {',
      '  display: block !important;',
      '}',
      '',
      '/* Estilo do card de produtos */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content--marketplace.desktop {',
      '  background: #FFFFFF !important;',
      '  border: 1px solid #D6DADA !important;',
      '  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1) !important;',
      '  border-radius: 16px !important;',
      '  padding: 20px !important;',
      '}',
      '',
      '/* Limitar tamanho das imagens dos produtos */',
      '#' + WRAPPER_ID + ' .cart__content img,',
      '#' + WRAPPER_ID + ' .cart__content .cartProducts__item img,',
      '#' + WRAPPER_ID + ' .cart__content .cartProducts__item--image img,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content img {',
      '  max-width: 80px !important;',
      '  max-height: 80px !important;',
      '  width: 80px !important;',
      '  height: 80px !important;',
      '  object-fit: contain !important;',
      '  flex-shrink: 0 !important;',
      '}',
      '',
      '/* Container da imagem do produto */',
      '#' + WRAPPER_ID + ' .cartProducts__item--image,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--image {',
      '  width: 80px !important;',
      '  min-width: 80px !important;',
      '  max-width: 80px !important;',
      '  height: 80px !important;',
      '  flex-shrink: 0 !important;',
      '  position: relative !important;',
      '}',
      '',
      '/* Tabela de produtos - layout automatico */',
      '#' + WRAPPER_ID + ' .cart__content table,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content table {',
      '  table-layout: auto !important;',
      '  width: 100% !important;',
      '}',
      '',
      '/* Celulas da tabela */',
      '#' + WRAPPER_ID + ' .cart__content td,',
      '#' + WRAPPER_ID + ' .cart__content th,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content td,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content th {',
      '  vertical-align: middle !important;',
      '  padding: 16px 12px !important;',
      '}',
      '',
      '/* Coluna PRODUTO - mais espaco */',
      '#' + WRAPPER_ID + ' .cart__content td:first-child,',
      '#' + WRAPPER_ID + ' .cart__content th:first-child,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content td:first-child,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content th:first-child {',
      '  width: auto !important;',
      '  min-width: 300px !important;',
      '}',
      '',
      '/* Coluna QUANTIDADE - centralizada */',
      '#' + WRAPPER_ID + ' .cart__content td:nth-child(2),',
      '#' + WRAPPER_ID + ' .cart__content th:nth-child(2),',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content td:nth-child(2),',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content th:nth-child(2) {',
      '  text-align: center !important;',
      '  vertical-align: middle !important;',
      '}',
      '',
      '/* Coluna TOTAL - alinhada a direita */',
      '#' + WRAPPER_ID + ' .cart__content td:last-child,',
      '#' + WRAPPER_ID + ' .cart__content th:last-child,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content td:last-child,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content th:last-child {',
      '  text-align: right !important;',
      '  white-space: nowrap !important;',
      '}',
      '',
      '/* Layout do item do produto - flexbox horizontal */',
      '#' + WRAPPER_ID + ' .cartProducts__item,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  flex-wrap: nowrap !important;',
      '  align-items: flex-start !important;',
      '  gap: 16px !important;',
      '  padding: 16px 0 !important;',
      '  border-bottom: 1px solid #E6E6E6 !important;',
      '}',
      '',
      '/* Info do produto - area flexivel */',
      '#' + WRAPPER_ID + ' .cartProducts__item--info,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--info {',
      '  flex: 1 1 auto !important;',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 8px !important;',
      '  min-width: 150px !important;',
      '}',
      '',
      '/* Nome do produto - ate 2 linhas */',
      '#' + WRAPPER_ID + ' .cartProducts__item--info a,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--info a {',
      '  font-size: 14px !important;',
      '  line-height: 1.4 !important;',
      '  color: #333 !important;',
      '  text-decoration: none !important;',
      '  display: -webkit-box !important;',
      '  -webkit-line-clamp: 2 !important;',
      '  -webkit-box-orient: vertical !important;',
      '  overflow: hidden !important;',
      '  max-width: 250px !important;',
      '}',
      '',
      '/* Preco do produto */',
      '#' + WRAPPER_ID + ' .cartProducts__item--price,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--price {',
      '  font-weight: 600 !important;',
      '  font-size: 15px !important;',
      '  color: #212529 !important;',
      '}',
      '',
      '/* Badge Leve X por R$ - area propria */',
      '#' + WRAPPER_ID + ' .cartProducts__item .cartProduct__leveXPorY,',
      '#' + WRAPPER_ID + ' .cartProducts__item .badge-promo,',
      '#' + WRAPPER_ID + ' .cartProducts__item [class*="leveXPorY"],',
      '#' + WRAPPER_ID + ' .cartProducts__item [class*="badge"],',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item .cartProduct__leveXPorY,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item .badge-promo,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item [class*="leveXPorY"],',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item [class*="badge"] {',
      '  display: inline-flex !important;',
      '  flex-direction: column !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  padding: 6px 10px !important;',
      '  font-size: 12px !important;',
      '  line-height: 1.3 !important;',
      '  text-align: center !important;',
      '  min-width: 60px !important;',
      '  flex-shrink: 0 !important;',
      '}',
      '',
      '/* Wrapper de acoes (remover + quantidade) */',
      '#' + WRAPPER_ID + ' .cartProducts__item--actions,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--actions {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 12px !important;',
      '}',
      '',
      '/* Coluna de quantidade - centralizada */',
      '#' + WRAPPER_ID + ' .cartProducts__item--quantity,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--quantity {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  gap: 4px !important;',
      '}',
      '',
      '/* Total do item */',
      '#' + WRAPPER_ID + ' .cartProducts__item--total,',
      '.container.cart[' + DATA_PROCESSED + '] .cartProducts__item--total {',
      '  min-width: 70px !important;',
      '  text-align: right !important;',
      '  font-weight: 600 !important;',
      '  font-size: 14px !important;',
      '}',
      '',
      '/* Linha de produtos (tr) */',
      '#' + WRAPPER_ID + ' .cart__content tr,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content tr {',
      '  border-bottom: 1px solid #E6E6E6 !important;',
      '}',
      '',
      '/* Totais dentro do card de produtos (esconder pois vai no resumo) */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content .cart__totals {',
      '  display: none !important;',
      '}',
      '',
      '/* Botoes dentro do card de produtos */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content .cart__buttons {',
      '  margin-top: 16px !important;',
      '  padding-top: 16px !important;',
      '  border-top: 1px dashed rgba(21, 21, 21, 0.15) !important;',
      '}'
    ].join('\n');
  }

  // =========================================================================
  // Injecao de estilos
  // =========================================================================
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
    console.log('[Araujo Novo Layout Carrinho] Estilos injetados');
  }

  // =========================================================================
  // Verificacao de pagina
  // =========================================================================
  function isCartPage() {
    var path = window.location.pathname;
    return path.indexOf('/my-cart') !== -1 || path.indexOf('/cart') !== -1;
  }

  function isDesktop() {
    return window.innerWidth >= 1200;
  }

  // =========================================================================
  // Aplicar layout
  // =========================================================================
  function applyLayout() {
    var cartContainer = document.querySelector('.container.cart');
    if (!cartContainer) {
      console.log('[Araujo Novo Layout Carrinho] Container do carrinho nao encontrado');
      return false;
    }

    if (cartContainer.hasAttribute(DATA_PROCESSED)) {
      return true;
    }

    var cartContent = cartContainer.querySelector('.cart__content');
    var cartSummary = cartContainer.querySelector('.cart__summary.desktop');

    if (!cartContent || !cartSummary) {
      console.log('[Araujo Novo Layout Carrinho] Elementos necessarios nao encontrados');
      return false;
    }

    // Verifica se ja existe o wrapper
    if (document.getElementById(WRAPPER_ID)) {
      cartContainer.setAttribute(DATA_PROCESSED, 'true');
      return true;
    }

    // Cria wrapper de duas colunas
    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.className = 'at-two-columns-wrapper';

    // Move os elementos para o wrapper
    // Insere o wrapper antes do cartContent
    cartContent.parentNode.insertBefore(wrapper, cartContent);

    // Move cartContent e cartSummary para dentro do wrapper
    wrapper.appendChild(cartContent);
    wrapper.appendChild(cartSummary);

    // Marca como processado
    cartContainer.setAttribute(DATA_PROCESSED, 'true');

    // Adiciona informacoes extras ao resumo se necessario
    enhanceSummary(cartSummary, cartContainer);

    console.log('[Araujo Novo Layout Carrinho] Layout aplicado com sucesso - wrapper criado');
    return true;
  }

  // =========================================================================
  // Melhorar o resumo com informacoes adicionais
  // =========================================================================
  function enhanceSummary(summary, container) {
    var summaryInfo = summary.querySelector('.cart__summaryInfo');
    if (!summaryInfo) {
      return;
    }

    // Busca os totais do carrinho - procura em todo o documento
    var subtotalEl = document.querySelector('.js-subtotal, .cart-subtotal, [data-subtotal]');
    var discountEl = document.querySelector('.js-discount, .cart-discount, [data-discount]');
    var totalEl = document.querySelector('.js-cart-totals, .cart-total, [data-total]');
    
    // Tenta buscar do botao CTA se nao encontrou
    if (!totalEl) {
      var ctaBtn = document.querySelector('.cart__summary--shippingBtn .primaryButton .cart-totals');
      if (ctaBtn) {
        totalEl = ctaBtn;
      }
    }

    // Soma quantidade total de itens baseado nos inputs de quantidade
    // Busca apenas na versao desktop para evitar duplicidade
    var desktopContent = container.querySelector('.cart__content--marketplace.desktop');
    var searchArea = desktopContent || container.querySelector('.cart__content') || container;
    var quantityInputs = searchArea.querySelectorAll('.productQuantity__value');
    var productCount = 0;
    
    for (var i = 0; i < quantityInputs.length; i++) {
      var inputVal = parseInt(quantityInputs[i].value, 10);
      if (!isNaN(inputVal) && inputVal > 0) {
        productCount += inputVal;
      }
    }
    
    // Fallback: tenta pegar do atributo data-realquantity (apenas desktop)
    if (productCount === 0) {
      var realQtyEls = searchArea.querySelectorAll('[data-realquantity]');
      for (var j = 0; j < realQtyEls.length; j++) {
        var qty = parseInt(realQtyEls[j].getAttribute('data-realquantity'), 10);
        if (!isNaN(qty) && qty > 0) {
          productCount += qty;
        }
      }
    }
    
    if (productCount < 1) {
      productCount = 1;
    }

    // Pega valores
    var subtotalValue = subtotalEl ? subtotalEl.textContent.trim() : 'R$ 0,00';
    var discountValue = discountEl ? discountEl.textContent.trim() : '';
    
    // Pega o valor do total diretamente do botao CTA
    var ctaTotalEl = document.querySelector('.cart__summary--shippingBtn .primaryButton .cart-totals');
    var totalValue = 'R$ 0,00';
    
    if (ctaTotalEl) {
      totalValue = ctaTotalEl.textContent.trim();
    } else if (totalEl) {
      totalValue = totalEl.textContent.trim();
    }
    
    // Limpa qualquer texto que nao seja o valor monetario
    var matches = totalValue.match(/R\$\s*[\d.,]+/g);
    if (matches && matches.length > 0) {
      totalValue = matches[matches.length - 1]; // Pega o ultimo match (geralmente o valor)
    }
    
    // Garante espaco apos R$
    totalValue = totalValue.replace(/R\$(\d)/, 'R$ $1');

    // Limpa conteudo antigo
    summaryInfo.innerHTML = '';

    // Cria novo HTML estruturado
    var infoHTML = '';
    
    // Titulo do modal (com classe especifica para nao ser escondido)
    infoHTML += '<h3 class="cart__summary--title-enhanced" style="font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; line-height: 24px; color: #212529; margin: 0 0 16px 0; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; display: block !important;">SOBRE O PEDIDO</h3>';
    
    infoHTML += '<div class="cart__summary--details cart__summary--details-enhanced" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">';
    
    // Linha: X Produtos | Valor
    infoHTML += '<div class="cart__summary--row" style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #525252;">';
    infoHTML += '<span style="font-weight: 400;">' + productCount + ' Produto' + (productCount > 1 ? 's' : '') + '</span>';
    infoHTML += '<span style="font-weight: 500; color: #212529;">' + subtotalValue + '</span>';
    infoHTML += '</div>';
    
    // Linha: Frete | A definir
    infoHTML += '<div class="cart__summary--row" style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #525252;">';
    infoHTML += '<span style="font-weight: 400;">Frete</span>';
    infoHTML += '<span style="font-weight: 400; color: #757575;">A definir</span>';
    infoHTML += '</div>';
    
    // Linha: Desconto | Valor (se houver)
    if (discountValue && discountValue !== '' && discountValue !== 'R$ 0,00' && discountValue !== '-R$ 0,00') {
      infoHTML += '<div class="cart__summary--row" style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">';
      infoHTML += '<span style="font-weight: 400; color: #525252;">Desconto</span>';
      infoHTML += '<span style="font-weight: 600; color: #008A00;">' + discountValue + '</span>';
      infoHTML += '</div>';
    }
    
    infoHTML += '</div>';
    
    // Separador e Total (com classe para garantir visibilidade)
    infoHTML += '<div class="cart__summary--total-wrapper cart__summary--details-enhanced" style="border-top: 1px solid #E0E0E0; margin-top: 4px; padding-top: 12px; display: block !important;">';
    infoHTML += '<div class="cart__summary--row" style="display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; width: 100% !important; font-size: 16px; color: #212529;">';
    infoHTML += '<span class="cart__summary--label" style="font-weight: 700; text-align: left;">Total</span>';
    infoHTML += '<span class="cart__summary--value" style="font-weight: 700; text-align: right;">' + totalValue + '</span>';
    infoHTML += '</div>';
    infoHTML += '</div>';

    summaryInfo.innerHTML = infoHTML;
  }

  // =========================================================================
  // Atualizar resumo (chamado pelo observer)
  // =========================================================================
  function updateSummary() {
    var cartContainer = document.querySelector('.container.cart');
    var cartSummary = document.querySelector('.cart__summary.desktop');
    
    if (cartContainer && cartSummary) {
      enhanceSummary(cartSummary, cartContainer);
    }
  }

  // =========================================================================
  // Remover layout (para quando sair do desktop)
  // =========================================================================
  function removeLayout() {
    var cartContainer = document.querySelector('.container.cart[' + DATA_PROCESSED + ']');
    if (cartContainer) {
      cartContainer.removeAttribute(DATA_PROCESSED);
      console.log('[Araujo Novo Layout Carrinho] Layout removido (viewport mobile)');
    }
  }

  // =========================================================================
  // Funcao principal
  // =========================================================================
  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    try {
      if (!isCartPage()) {
        console.log('[Araujo Novo Layout Carrinho] Nao e pagina do carrinho');
        return;
      }

      if (!isDesktop()) {
        removeLayout();
        return;
      }

      injectStyles();
      applyLayout();
    } finally {
      isProcessing = false;
    }
  }

  // =========================================================================
  // Debounce para o observer
  // =========================================================================
  function debouncedRun() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
      run();
    }, DEBOUNCE_DELAY);
  }

  // =========================================================================
  // Observer para mudancas no DOM (ex: carrinho dinamico)
  // =========================================================================
  var summaryUpdateTimer = null;

  function setupObserver() {
    if (window._araujoNovoLayoutCarrinhoObserver) {
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      var shouldRun = false;
      var shouldUpdateSummary = false;

      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        
        // Ignora mudancas no proprio style injetado
        if (mutation.target && mutation.target.id === STYLE_ID) {
          continue;
        }

        // Ignora mudancas no nosso wrapper
        if (mutation.target && mutation.target.id === WRAPPER_ID) {
          continue;
        }

        // Verifica se a mudanca foi em elementos de valor (subtotal, total, etc)
        var targetEl = mutation.target;
        if (targetEl && targetEl.classList) {
          var classList = targetEl.className || '';
          if (classList.indexOf('js-subtotal') !== -1 ||
              classList.indexOf('js-discount') !== -1 ||
              classList.indexOf('js-cart-totals') !== -1 ||
              classList.indexOf('cart-totals') !== -1 ||
              classList.indexOf('cartProducts') !== -1) {
            shouldUpdateSummary = true;
          }
        }

        // Verifica se foram adicionados/removidos produtos
        if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
          shouldUpdateSummary = true;
        }

        // Ignora mudancas em elementos ja processados
        if (mutation.target && mutation.target.hasAttribute && mutation.target.hasAttribute(DATA_PROCESSED)) {
          continue;
        }

        shouldRun = true;
      }

      if (shouldRun) {
        debouncedRun();
      }

      // Atualiza o resumo com debounce separado
      if (shouldUpdateSummary) {
        if (summaryUpdateTimer) {
          clearTimeout(summaryUpdateTimer);
        }
        summaryUpdateTimer = setTimeout(function () {
          updateSummary();
        }, 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false
    });

    window._araujoNovoLayoutCarrinhoObserver = observer;
    console.log('[Araujo Novo Layout Carrinho] Observer configurado');
  }

  // =========================================================================
  // Listener de resize para alternar entre layouts
  // =========================================================================
  function setupResizeListener() {
    if (window._araujoNovoLayoutCarrinhoResizeListener) {
      return;
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(function () {
        run();
      }, 200);
    });

    window._araujoNovoLayoutCarrinhoResizeListener = true;
    console.log('[Araujo Novo Layout Carrinho] Listener de resize configurado');
  }

  // =========================================================================
  // Inicializacao
  // =========================================================================
  function init() {
    console.log('[Araujo Novo Layout Carrinho] Inicializando...');
    run();
    setupObserver();
    setupResizeListener();
    
    // Polling para atualizar valores (fallback caso o observer nao capture)
    setInterval(function () {
      if (isCartPage() && isDesktop()) {
        updateSummary();
      }
    }, 2000);
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
