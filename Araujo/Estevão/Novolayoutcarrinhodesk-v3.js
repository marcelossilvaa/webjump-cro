(function () {
  'use strict';

  // =========================================================================
  // Araujo - Novo Layout Carrinho Desktop v3
  // Objetivo: Resumo do pedido + CTA fixo no lado direito, produtos com scroll no lado esquerdo
  // Resolucao: Desktop (>= 1200px)
  // =========================================================================

  var STYLE_ID = 'at-araujo-novo-layout-carrinho-desk';
  var WRAPPER_ID = 'at-araujo-two-columns-wrapper';
  var DATA_PROCESSED = 'data-novo-layout-applied';
  var isProcessing = false;
  var debounceTimer = null;
  var DEBOUNCE_DELAY = 50; // Reduzido para reagir mais rapido

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
      '  align-items: flex-start !important;',
      '  justify-content: space-between !important;',
      '  gap: 24px !important;',
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
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '}',
      '',
      '/* Card de produtos (dentro do cart__content) */',
      '#' + WRAPPER_ID + ' .cart__content--marketplace.desktop {',
      '  flex: 1 1 auto !important;',
      '  overflow-y: auto !important;',
      '  max-height: calc(100vh - 280px) !important;',
      '  padding-bottom: 0 !important;',
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
      '  top: 120px !important;',
      '  flex: 0 0 340px !important;',
      '  width: 340px !important;',
      '  min-width: 340px !important;',
      '  max-width: 340px !important;',
      '  height: fit-content !important;',
      '  max-height: calc(100vh - 140px) !important;',
      '  background: #FFFFFF !important;',
      '  border: 1px solid #D6DADA !important;',
      '  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.12) !important;',
      '  border-radius: 16px !important;',
      '  padding: 20px !important;',
      '  box-sizing: border-box !important;',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 16px !important;',
      '  align-self: flex-start !important;',
      '  margin-top: 0 !important;',
      '  z-index: 10 !important;',
      '}',
      '',
      '/* Esconde o resumo mobile */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.mobile {',
      '  display: none !important;',
      '}',
      '',
      '/* ESCONDER BARRA INFERIOR "Sobre o pedido" */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summaryMobile,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--mobile,',
      '.container.cart[' + DATA_PROCESSED + '] [class*="summaryMobile"],',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summaryFixed,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--fixed,',
      '.container.cart[' + DATA_PROCESSED + '] .summary-bar-mobile,',
      '.container.cart[' + DATA_PROCESSED + '] .checkout__summary--fixed {',
      '  display: none !important;',
      '}',
      '',
      '/* ESCONDER TOTAIS ORIGINAIS dentro do card de produtos */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content .cart__totals,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content .cartTotals,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content .cart-totals-wrapper,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content [class*="cartTotal"],',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content--marketplace .cart__totals {',
      '  display: none !important;',
      '}',
      '',
      '/* Info do resumo - caixa cinza */',
      '#' + WRAPPER_ID + ' .cart__summary.desktop .cart__summaryInfo,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summaryInfo {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 0 !important;',
      '  width: 100% !important;',
      '  min-width: 100% !important;',
      '  background: #F5F5F5 !important;',
      '  border-radius: 8px !important;',
      '  padding: 16px !important;',
      '  box-sizing: border-box !important;',
      '  margin: 0 !important;',
      '}',
      '',
      '/* Esconder conteudo original do summaryInfo */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summaryInfo > *:not(.at-enhanced-summary) {',
      '  display: none !important;',
      '}',
      '',
      '/* Mostrar nosso conteudo enhanced */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary.desktop .cart__summaryInfo .at-enhanced-summary {',
      '  display: block !important;',
      '  width: 100% !important;',
      '  min-width: 100% !important;',
      '  box-sizing: border-box !important;',
      '}',
      '',
      '/* Titulo SOBRE O PEDIDO */',
      '.at-enhanced-summary .at-summary-title {',
      '  font-family: "Inter", sans-serif !important;',
      '  font-weight: 700 !important;',
      '  font-size: 14px !important;',
      '  line-height: 20px !important;',
      '  color: #212529 !important;',
      '  margin: 0 0 16px 0 !important;',
      '  text-align: left !important;',
      '  text-transform: uppercase !important;',
      '  letter-spacing: 0.5px !important;',
      '}',
      '',
      '/* Container das linhas de info */',
      '.at-enhanced-summary .at-summary-details {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  gap: 8px !important;',
      '  width: 100% !important;',
      '  min-width: 100% !important;',
      '  box-sizing: border-box !important;',
      '}',
      '',
      '/* Linha de informacao */',
      '.at-enhanced-summary .at-summary-row {',
      '  display: flex !important;',
      '  flex-direction: row !important;',
      '  justify-content: space-between !important;',
      '  align-items: center !important;',
      '  width: 100% !important;',
      '  min-width: 100% !important;',
      '  padding: 4px 0 !important;',
      '  font-size: 14px !important;',
      '  color: #525252 !important;',
      '  box-sizing: border-box !important;',
      '}',
      '',
      '/* Label da linha (esquerda - extremidade) */',
      '.at-enhanced-summary .at-summary-row .at-label {',
      '  font-weight: 400 !important;',
      '  text-align: left !important;',
      '  flex: 0 0 auto !important;',
      '  margin-right: auto !important;',
      '}',
      '',
      '/* Valor da linha (direita - extremidade) */',
      '.at-enhanced-summary .at-summary-row .at-value {',
      '  font-weight: 500 !important;',
      '  text-align: right !important;',
      '  flex: 0 0 auto !important;',
      '  margin-left: auto !important;',
      '  color: #212529 !important;',
      '  white-space: nowrap !important;',
      '}',
      '',
      '/* Valor do desconto em verde */',
      '.at-enhanced-summary .at-summary-row .at-value.at-discount {',
      '  color: #008A00 !important;',
      '  font-weight: 600 !important;',
      '}',
      '',
      '/* Frete "A definir" em cinza */',
      '.at-enhanced-summary .at-summary-row .at-value.at-frete {',
      '  color: #757575 !important;',
      '  font-weight: 400 !important;',
      '}',
      '',
      '/* Separador antes do Total */',
      '.at-enhanced-summary .at-summary-separator {',
      '  border-top: 1px solid #E0E0E0 !important;',
      '  margin-top: 8px !important;',
      '  padding-top: 12px !important;',
      '  width: 100% !important;',
      '  min-width: 100% !important;',
      '  box-sizing: border-box !important;',
      '}',
      '',
      '/* Linha do Total */',
      '.at-enhanced-summary .at-summary-row.at-total-row {',
      '  font-size: 16px !important;',
      '  font-weight: 700 !important;',
      '  color: #212529 !important;',
      '}',
      '.at-enhanced-summary .at-summary-row.at-total-row .at-label,',
      '.at-enhanced-summary .at-summary-row.at-total-row .at-value {',
      '  font-weight: 700 !important;',
      '  color: #212529 !important;',
      '}',
      '',
      '/* Wrapper do botao CTA */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__summary--shippingBtn {',
      '  width: 100% !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
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
      '  font-size: 16px !important;',
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
      '/* Recomendacoes - manter visivel abaixo do layout */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__recommendations {',
      '  width: 100% !important;',
      '  margin-top: 24px !important;',
      '}',
      '',
      '/* Progress bar - manter visivel acima do resumo ao scrollar */',
      '.checkout__progressWrapper {',
      '  z-index: 20 !important;',
      '  background: #FFFFFF !important;',
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
      '  padding: 12px 8px !important;',
      '}',
      '',
      '/* Linha de produtos (tr) */',
      '#' + WRAPPER_ID + ' .cart__content tr,',
      '.container.cart[' + DATA_PROCESSED + '] .cart__content tr {',
      '  border-bottom: 1px solid #E6E6E6 !important;',
      '}',
      '',
      '/* Botao esvaziar cesta - manter visivel */',
      '.container.cart[' + DATA_PROCESSED + '] .cart__buttons.clear-container {',
      '  display: flex !important;',
      '  justify-content: center !important;',
      '  padding: 16px 0 !important;',
      '  width: 100% !important;',
      '  margin-top: 16px !important;',
      '  border-top: 1px dashed rgba(21, 21, 21, 0.15) !important;',
      '}',
      '',
      '/* Botao Adicionar mais itens - fixo fora do scroll */',
      '#' + WRAPPER_ID + ' .cart__buttons:has(.cart__buttons--continue),',
      '#' + WRAPPER_ID + ' .at-add-more-items-fixed {',
      '  position: sticky !important;',
      '  bottom: 0 !important;',
      '  background: #FFFFFF !important;',
      '  padding: 16px 20px !important;',
      '  margin: 0 -20px -20px -20px !important;',
      '  width: calc(100% + 40px) !important;',
      '  box-sizing: border-box !important;',
      '  border-top: 1px dashed rgba(21, 21, 21, 0.15) !important;',
      '  z-index: 5 !important;',
      '  display: flex !important;',
      '  justify-content: center !important;',
      '}',
      '',
      '#' + WRAPPER_ID + ' .cart__buttons--continue {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 8px !important;',
      '  color: #003A74 !important;',
      '  font-family: "Inter", sans-serif !important;',
      '  font-weight: 600 !important;',
      '  font-size: 14px !important;',
      '  text-decoration: none !important;',
      '  padding: 0 !important;',
      '  border: none !important;',
      '  background: transparent !important;',
      '  transition: opacity 0.2s ease !important;',
      '}',
      '',
      '#' + WRAPPER_ID + ' .cart__buttons--continue:hover {',
      '  opacity: 0.7 !important;',
      '  background: transparent !important;',
      '  color: #003A74 !important;',
      '}',
      '',
      '#' + WRAPPER_ID + ' .cart__buttons--continue i {',
      '  font-size: 16px !important;',
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

    // Busca elementos atuais do DOM
    var cartContent = cartContainer.querySelector('.cart__content');
    var cartSummary = cartContainer.querySelector('.cart__summary.desktop');

    if (!cartContent || !cartSummary) {
      console.log('[Araujo Novo Layout Carrinho] Elementos necessarios nao encontrados');
      return false;
    }

    var existingWrapper = document.getElementById(WRAPPER_ID);

    // Se o wrapper existe
    if (existingWrapper) {
      // Verifica se os elementos CORRETOS estao dentro do wrapper
      var wrapperContent = existingWrapper.querySelector('.cart__content');
      var wrapperSummary = existingWrapper.querySelector('.cart__summary.desktop');

      // Se os elementos no wrapper sao os mesmos que encontramos no container, esta OK
      if (wrapperContent === cartContent && wrapperSummary === cartSummary) {
        if (!cartContainer.hasAttribute(DATA_PROCESSED)) {
          cartContainer.setAttribute(DATA_PROCESSED, 'true');
        }
        enhanceSummary(cartSummary, cartContainer);
        return true;
      }

      // Se ha elementos diferentes, precisamos reorganizar
      console.log('[Araujo Novo Layout Carrinho] Elementos diferentes detectados, reorganizando...');
      
      // Limpa o wrapper
      while (existingWrapper.firstChild) {
        existingWrapper.removeChild(existingWrapper.firstChild);
      }
      
      // Move os elementos corretos para o wrapper
      existingWrapper.appendChild(cartContent);
      existingWrapper.appendChild(cartSummary);

      cartContainer.setAttribute(DATA_PROCESSED, 'true');
      enhanceSummary(cartSummary, cartContainer);
      return true;
    }

    // Se nao existe wrapper, verifica se ja existe um wrapper orfao e remove
    var orphanWrappers = document.querySelectorAll('#' + WRAPPER_ID);
    for (var k = 0; k < orphanWrappers.length; k++) {
      orphanWrappers[k].parentNode.removeChild(orphanWrappers[k]);
    }

    // Cria wrapper de duas colunas
    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.className = 'at-two-columns-wrapper';

    // Insere o wrapper antes do cartContent
    cartContent.parentNode.insertBefore(wrapper, cartContent);

    // Move cartContent e cartSummary para dentro do wrapper
    wrapper.appendChild(cartContent);
    wrapper.appendChild(cartSummary);

    // Marca como processado
    cartContainer.setAttribute(DATA_PROCESSED, 'true');

    // Adiciona informacoes extras ao resumo
    enhanceSummary(cartSummary, cartContainer);

    console.log('[Araujo Novo Layout Carrinho] Layout aplicado com sucesso');
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

    // Busca os totais do carrinho
    var subtotalEl = document.querySelector('.js-subtotal, .cart-subtotal, [data-subtotal]');
    var discountEl = document.querySelector('.js-discount, .cart-discount, [data-discount]');
    
    // Pega o valor do total diretamente do botao CTA
    var ctaTotalEl = document.querySelector('.cart__summary--shippingBtn .primaryButton .cart-totals');

    // Soma quantidade total de itens
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
    
    // Fallback
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
    var totalValue = ctaTotalEl ? ctaTotalEl.textContent.trim() : 'R$ 0,00';
    
    // Limpa valor do total
    var matches = totalValue.match(/R\$\s*[\d.,]+/g);
    if (matches && matches.length > 0) {
      totalValue = matches[matches.length - 1];
    }
    totalValue = totalValue.replace(/R\$(\d)/, 'R$ $1');

    // Remove conteudo enhanced anterior se existir
    var oldEnhanced = summaryInfo.querySelector('.at-enhanced-summary');
    if (oldEnhanced) {
      oldEnhanced.remove();
    }

    // Cria novo HTML estruturado
    var enhancedDiv = document.createElement('div');
    enhancedDiv.className = 'at-enhanced-summary';
    
    var html = '';
    
    // Titulo
    html += '<div class="at-summary-title">SOBRE O PEDIDO</div>';
    
    // Container das linhas
    html += '<div class="at-summary-details">';
    
    // Linha: X Produtos | Valor
    html += '<div class="at-summary-row">';
    html += '<span class="at-label">' + productCount + ' Produto' + (productCount > 1 ? 's' : '') + '</span>';
    html += '<span class="at-value">' + subtotalValue + '</span>';
    html += '</div>';
    
    // Linha: Frete | A definir
    html += '<div class="at-summary-row">';
    html += '<span class="at-label">Frete</span>';
    html += '<span class="at-value at-frete">A definir</span>';
    html += '</div>';
    
    // Linha: Desconto | Valor (se houver)
    html += '<div class="at-summary-row">';
    html += '<span class="at-label">Desconto</span>';
    if (discountValue && discountValue !== '' && discountValue !== 'R$ 0,00') {
      html += '<span class="at-value at-discount">' + discountValue + '</span>';
    } else {
      html += '<span class="at-value at-discount">- R$ 0,00</span>';
    }
    html += '</div>';
    
    html += '</div>'; // Fecha at-summary-details
    
    // Separador e Total
    html += '<div class="at-summary-separator">';
    html += '<div class="at-summary-row at-total-row">';
    html += '<span class="at-label">Total</span>';
    html += '<span class="at-value">' + totalValue + '</span>';
    html += '</div>';
    html += '</div>';
    
    enhancedDiv.innerHTML = html;
    
    // Adiciona no inicio do summaryInfo
    summaryInfo.insertBefore(enhancedDiv, summaryInfo.firstChild);
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
  // Observer para mudancas no DOM
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
        
        // Ignora mutacoes no nosso proprio elemento de estilo
        if (mutation.target && mutation.target.id === STYLE_ID) {
          continue;
        }

        // Ignora mutacoes no nosso wrapper (para evitar loop)
        if (mutation.target && mutation.target.id === WRAPPER_ID) {
          shouldUpdateSummary = true;
          continue;
        }

        var targetEl = mutation.target;
        if (targetEl && targetEl.classList) {
          var classList = targetEl.className || '';
          if (classList.indexOf('js-subtotal') !== -1 ||
              classList.indexOf('js-discount') !== -1 ||
              classList.indexOf('js-cart-totals') !== -1 ||
              classList.indexOf('cart-totals') !== -1 ||
              classList.indexOf('cartProducts') !== -1 ||
              classList.indexOf('productQuantity') !== -1) {
            shouldUpdateSummary = true;
          }
        }

        // Verifica se elementos importantes foram adicionados/removidos
        if (mutation.addedNodes.length > 0) {
          for (var j = 0; j < mutation.addedNodes.length; j++) {
            var addedNode = mutation.addedNodes[j];
            if (addedNode.nodeType === 1) { // Element node
              // Verifica se e um elemento principal do carrinho
              if (addedNode.classList && 
                  (addedNode.classList.contains('cart__content') || 
                   addedNode.classList.contains('cart__summary') ||
                   addedNode.classList.contains('cart__content--marketplace') ||
                   addedNode.classList.contains('cartProducts'))) {
                shouldRun = true;
                console.log('[Araujo Novo Layout Carrinho] Elemento principal adicionado:', addedNode.className);
              }
              // Verifica se contem elementos principais
              if (addedNode.querySelector && 
                  (addedNode.querySelector('.cart__content') || 
                   addedNode.querySelector('.cart__summary') ||
                   addedNode.querySelector('.cartProducts'))) {
                shouldRun = true;
              }
              // Se e um elemento do carrinho
              if (addedNode.classList && addedNode.classList.contains('cart')) {
                shouldRun = true;
              }
            }
          }
          shouldUpdateSummary = true;
        }

        // Verifica se elementos foram removidos (indica recriacao)
        if (mutation.removedNodes.length > 0) {
          for (var k = 0; k < mutation.removedNodes.length; k++) {
            var removedNode = mutation.removedNodes[k];
            if (removedNode.nodeType === 1 && removedNode.classList) {
              if (removedNode.classList.contains('cart__content') || 
                  removedNode.classList.contains('cart__summary') ||
                  removedNode.classList.contains('cartProducts')) {
                shouldRun = true;
                console.log('[Araujo Novo Layout Carrinho] Elemento principal removido:', removedNode.className);
              }
            }
          }
        }

        // Se a mutacao aconteceu diretamente no container do carrinho
        if (targetEl && targetEl.classList && 
            (targetEl.classList.contains('cart') || 
             targetEl.classList.contains('container') ||
             targetEl.classList.contains('cart__content') ||
             targetEl.classList.contains('cart__summary'))) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        debouncedRun();
        // Tambem executa com delays para garantir
        setTimeout(function() { run(); }, 200);
      }

      if (shouldUpdateSummary && !shouldRun) {
        if (summaryUpdateTimer) {
          clearTimeout(summaryUpdateTimer);
        }
        summaryUpdateTimer = setTimeout(function () {
          updateSummary();
        }, 100);
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
  // Listener de resize
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
    console.log('[Araujo Novo Layout Carrinho] Inicializando v3...');
    run();
    setupObserver();
    setupResizeListener();
    setupAjaxListener();
    
    // Polling para atualizar valores e verificar layout (mais frequente)
    setInterval(function () {
      if (isCartPage() && isDesktop()) {
        // Verifica se o layout precisa ser reaplicado
        var wrapper = document.getElementById(WRAPPER_ID);
        var cartContainer = document.querySelector('.container.cart');
        
        if (cartContainer) {
          var cartContent = cartContainer.querySelector('.cart__content');
          var cartSummary = cartContainer.querySelector('.cart__summary.desktop');
          
          if (cartContent && cartSummary) {
            // Se o wrapper nao existe ou elementos nao estao no wrapper correto
            if (!wrapper || 
                wrapper.querySelector('.cart__content') !== cartContent || 
                wrapper.querySelector('.cart__summary.desktop') !== cartSummary) {
              console.log('[Araujo Novo Layout Carrinho] Polling detectou inconsistencia');
              run();
              return;
            }
          }
        }
        
        updateSummary();
      }
    }, 500); // Verificar a cada 500ms
  }

  // =========================================================================
  // Listener para AJAX (intercepta atualizacoes do carrinho)
  // =========================================================================
  function setupAjaxListener() {
    if (window._araujoNovoLayoutAjaxListener) {
      return;
    }

    // Intercepta XMLHttpRequest
    var originalXHROpen = XMLHttpRequest.prototype.open;
    var originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._url = url;
      return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
      var xhr = this;
      var originalOnReadyStateChange = xhr.onreadystatechange;

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          // Verifica se e uma requisicao relacionada ao carrinho
          if (xhr._url && (
              xhr._url.indexOf('cart') !== -1 || 
              xhr._url.indexOf('basket') !== -1 ||
              xhr._url.indexOf('quantity') !== -1 ||
              xhr._url.indexOf('add') !== -1 ||
              xhr._url.indexOf('remove') !== -1
            )) {
            console.log('[Araujo Novo Layout Carrinho] AJAX do carrinho detectado, reagendando layout...');
            // Aguarda um pouco para o DOM ser atualizado
            setTimeout(function() {
              run();
            }, 100);
            setTimeout(function() {
              run();
            }, 300);
            setTimeout(function() {
              run();
            }, 600);
          }
        }
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(xhr, arguments);
        }
      };

      return originalXHRSend.apply(this, arguments);
    };

    // Intercepta fetch tambem
    var originalFetch = window.fetch;
    if (originalFetch) {
      window.fetch = function(url, options) {
        var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
        
        return originalFetch.apply(this, arguments).then(function(response) {
          if (urlStr && (
              urlStr.indexOf('cart') !== -1 || 
              urlStr.indexOf('basket') !== -1 ||
              urlStr.indexOf('quantity') !== -1 ||
              urlStr.indexOf('add') !== -1 ||
              urlStr.indexOf('remove') !== -1
            )) {
            console.log('[Araujo Novo Layout Carrinho] Fetch do carrinho detectado, reagendando layout...');
            setTimeout(function() {
              run();
            }, 100);
            setTimeout(function() {
              run();
            }, 300);
            setTimeout(function() {
              run();
            }, 600);
          }
          return response;
        });
      };
    }

    window._araujoNovoLayoutAjaxListener = true;
    console.log('[Araujo Novo Layout Carrinho] Listener AJAX configurado');
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
