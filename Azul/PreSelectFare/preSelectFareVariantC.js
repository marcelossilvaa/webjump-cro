(function () {
  // ============================================
  // VARIANTE C - Auto-select + Botão Continuar na 2ª etapa
  // ============================================
  // Fluxo:
  // 1ª ETAPA: Quando user clica "Ver tarifas" → auto-clica na tarifa mais cara (exceto Business)
  // 2ª ETAPA: Na tela de resumo, quando clica "Alterar tarifa" → mostra botão "Continuar" na mais cara
  // ============================================

  const VARIANT_NAME = 'PreSelectFare_VariantC';
  
  // Função global para resetar e testar novamente
  window.resetPreSelectFareVariantC = function() {
    window.campaignPreSelectFareVariantC = false;
    hasAutoSelectedFirstStep = false;
    hasModifiedSecondStep = false;
    lastProcessedFlightCard = null;
    isProcessing = false;
    isSecondStep = false;
    
    // Remove botões modificados
    const modifiedButtons = document.querySelectorAll('[data-variant-c-btn]');
    modifiedButtons.forEach(btn => btn.remove());
    
    console.log(`[${VARIANT_NAME}] Reset completo. Recarregue a página para testar novamente.`);
  };

  function onTargetPage() {
    return true;
  }

  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log(`[${VARIANT_NAME}] Missing parameters for analytics event.`);
      return;
    }

    const labelEvent = 'AT_pre_select_fare_variantC ' + eventLabel;

    console.log(`[${VARIANT_NAME}] Analytics event triggered:`, labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Estado do experimento
  let hasAutoSelectedFirstStep = false;  // 1ª etapa: auto-selecionou tarifa
  let hasModifiedSecondStep = false;     // 2ª etapa: modificou botão para "Continuar"
  let lastProcessedFlightCard = null;
  let isProcessing = false;
  let isSecondStep = false;              // Flag para identificar se estamos na 2ª etapa

  /**
   * Injeta estilos do botão Continuar
   */
  function injectStyles() {
    if (document.getElementById('variant-c-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'variant-c-styles';
    styles.textContent = `
      .variant-c-continue-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
      }
      
      .variant-c-continue-btn {
        height: 48px;
        border-radius: 4px;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        border: none;
        margin: 0;
        padding: 0 16px;
      }
      
      .variant-c-continue-btn:hover {
        background: rgb(2, 108, 182) ;
        opacity: 0.9;
      }
      
      .variant-c-selected-label {
        font-size: 12px;
        color: #666666;
        line-height: 14px;
        margin: 0;
        text-align: center;
      }
    `;
    
    document.head.appendChild(styles);
  }

  // Injeta estilos imediatamente
  injectStyles();

  /**
   * Encontra a tarifa mais cara dentro de .fare-item (exceto Business e esgotadas)
   */
  function findMostExpensiveFareItem() {
    const fareItems = document.querySelectorAll('.fare-item');
    
    if (!fareItems.length) return null;

    let maxPrice = -1;
    let mostExpensiveFareItem = null;

    fareItems.forEach((fareItem) => {
      // Ignora tarifa Business
      const fareName = fareItem.querySelector('.promotional, .fare-price p');
      if (fareName) {
        const fareNameText = fareName.textContent.toLowerCase();
        if (fareNameText.includes('business')) {
          return;
        }
      }
      
      // Ignora tarifas esgotadas
      const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
      if (selectButton) {
        const buttonText = selectButton.textContent.toLowerCase();
        if (buttonText.includes('esgotada')) {
          return;
        }
        // Ignora botões disabled (exceto se já foi modificado por nós)
        if (selectButton.hasAttribute('disabled') && !selectButton.hasAttribute('data-variant-c-modified')) {
          return;
        }
      }
      
      const priceElement = fareItem.querySelector('[data-test-id="fare-price"]');
      
      if (priceElement) {
        const rawText = priceElement.textContent;
        const priceText = rawText
          .replace(/[^\d.,]/g, '')
          .replace(/\.(?=\d{3})/g, '')
          .replace(',', '.');
        const price = parseFloat(priceText);

        if (!isNaN(price) && price > maxPrice) {
          maxPrice = price;
          mostExpensiveFareItem = fareItem;
        }
      }
    });

    return mostExpensiveFareItem;
  }

  /**
   * Simula clique React-compatible
   */
  function simulateReactClick(element) {
    if (!element) return false;
    
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    
    return true;
  }

  /**
   * Verifica se estamos na tela de resumo (2ª etapa)
   * A 2ª etapa é identificada pela presença de .flight-card--selected COM botão "Alterar tarifa"
   */
  function checkIfSecondStep() {
    const flightCardSelected = document.querySelector('.flight-card--selected');
    if (!flightCardSelected) return false;
    
    const alterarButton = flightCardSelected.querySelector('.btn-fare');
    if (!alterarButton) return false;
    
    const buttonText = alterarButton.textContent.toLowerCase();
    return buttonText.includes('alterar tarifa');
  }

  /**
   * 1ª ETAPA: Auto-clica na tarifa mais cara (sem modificar o botão)
   */
  function autoSelectMostExpensiveFare() {
    if (isProcessing) return;
    if (isSecondStep) return; // Não executa na 2ª etapa
    
    // Verifica se há tarifas visíveis (.fare-item)
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    if (visibleFareItems.length === 0) {
      hasAutoSelectedFirstStep = false;
      return;
    }
    
    // Se já tiver um card selecionado com "Alterar tarifa", estamos na 2ª etapa
    if (checkIfSecondStep()) {
      return;
    }
    
    // Verifica se já foi processado
    if (hasAutoSelectedFirstStep) {
      return;
    }
    
    // Encontra a tarifa mais cara
    const mostExpensiveFare = findMostExpensiveFareItem();
    if (!mostExpensiveFare) {
      console.log(`[${VARIANT_NAME}] 1ª Etapa: Nenhuma tarifa válida encontrada.`);
      return;
    }
    
    // Encontra o botão "Selecionar tarifa"
    const selectButton = mostExpensiveFare.querySelector('[data-test-id="select-fare"]');
    if (!selectButton) {
      console.log(`[${VARIANT_NAME}] 1ª Etapa: Botão não encontrado.`);
      return;
    }
    
    // Verifica se já está selecionado ou modificado
    const buttonText = selectButton.textContent.toLowerCase();
    if (buttonText.includes('selecionada') || buttonText.includes('continuar')) {
      hasAutoSelectedFirstStep = true;
      return;
    }
    
    // Auto-clica na tarifa mais cara
    isProcessing = true;
    console.log(`[${VARIANT_NAME}] 1ª Etapa: Auto-selecionando tarifa mais cara...`);
    
    setTimeout(() => {
      const success = simulateReactClick(selectButton);
      
      if (success) {
        hasAutoSelectedFirstStep = true;
        analyticsEvent('1a Etapa - Auto-select tarifa mais cara');
        console.log(`[${VARIANT_NAME}] 1ª Etapa: Tarifa mais cara selecionada!`);
        
        // Após selecionar, inicia a 2ª etapa automaticamente
        // Aguarda a tela de resumo aparecer e clica em "Alterar tarifa"
        setTimeout(() => {
          autoClickAlterarTarifa();
        }, 800);
      }
      
      isProcessing = false;
    }, 100);
  }

  /**
   * 2ª ETAPA (automática): Clica em "Alterar tarifa" para abrir os detalhes
   */
  function autoClickAlterarTarifa() {
    const flightCardSelected = document.querySelector('.flight-card--selected');
    if (!flightCardSelected) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Aguardando card selecionado...`);
      // Tenta novamente
      setTimeout(() => autoClickAlterarTarifa(), 500);
      return;
    }
    
    const alterarTarifaButton = flightCardSelected.querySelector('.btn-fare');
    if (!alterarTarifaButton) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Botão "Alterar tarifa" não encontrado.`);
      return;
    }
    
    const buttonText = alterarTarifaButton.textContent.toLowerCase();
    if (!buttonText.includes('alterar tarifa')) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Botão não é "Alterar tarifa".`);
      return;
    }
    
    console.log(`[${VARIANT_NAME}] 2ª Etapa: Auto-clicando em "Alterar tarifa"...`);
    
    // Marca que estamos na 2ª etapa ANTES de clicar
    isSecondStep = true;
    hasModifiedSecondStep = false;
    
    // Clica para abrir as tarifas
    simulateReactClick(alterarTarifaButton);
    
    analyticsEvent('2a Etapa - Auto-click Alterar tarifa');
    
    // Aguarda as tarifas abrirem e modifica o botão
    setTimeout(() => {
      console.log(`[${VARIANT_NAME}] Tentativa 1 de modificação do botão...`);
      modifyButtonForSecondStep();
    }, 500);
    
    setTimeout(() => { 
      if (!hasModifiedSecondStep) {
        console.log(`[${VARIANT_NAME}] Tentativa 2 de modificação do botão...`);
        modifyButtonForSecondStep();
      }
    }, 1000);
    
    setTimeout(() => { 
      if (!hasModifiedSecondStep) {
        console.log(`[${VARIANT_NAME}] Tentativa 3 de modificação do botão...`);
        modifyButtonForSecondStep();
      }
    }, 1500);
  }

  /**
   * 2ª ETAPA: Substitui "Tarifa selecionada" por botão "Continuar" + label
   * IMPORTANTE: Na 2ª etapa, o botão deve aparecer na tarifa ATUALMENTE SELECIONADA, não na mais cara
   */
  function modifyButtonForSecondStep() {
    if (isProcessing) return;
    if (!isSecondStep) return; // Só executa na 2ª etapa
    
    // Verifica se há tarifas visíveis
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    if (visibleFareItems.length === 0) {
      hasModifiedSecondStep = false;
      return;
    }
    
    if (hasModifiedSecondStep) {
      return;
    }
    
    // Na 2ª etapa: Encontra a tarifa ATUALMENTE SELECIONADA (que contém "Tarifa selecionada")
    let selectedFareItem = null;
    
    for (const fareItem of visibleFareItems) {
      const tarifaSelecionadaText = fareItem.querySelector('.css-1pjaxxl p, p.css-ou6pmp');
      if (tarifaSelecionadaText && tarifaSelecionadaText.textContent.toLowerCase().includes('tarifa selecionada')) {
        selectedFareItem = fareItem;
        break;
      }
    }
    
    if (!selectedFareItem) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Nenhuma tarifa selecionada encontrada.`);
      return;
    }
    
    // Procura pelo container que tem "Tarifa selecionada"
    const tarifaContainer = selectedFareItem.querySelector('.css-1pjaxxl');
    
    if (!tarifaContainer) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Container "Tarifa selecionada" não encontrado.`);
      return;
    }
    
    // Verifica se já foi modificado
    if (tarifaContainer.hasAttribute('data-variant-c-modified')) {
      hasModifiedSecondStep = true;
      return;
    }
    
    // Modifica o container
    isProcessing = true;
    
    tarifaContainer.setAttribute('data-variant-c-modified', 'true');
    tarifaContainer.innerHTML = `
      <p class="css-ou6pmp variant-c-continue-btn" data-variant-c-btn="true" style="
        margin: 0px;
        height: 48px;
        border: none;
        background-color: rgb(2, 108, 182);
        border-radius: 4px;
        color: rgb(255, 255, 255);
        font-family: 'Helvetica Neue', Arial;
        font-size: 16px;
        line-height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: background-color 500ms;
        position: relative;
        cursor: pointer;
        margin-top: 8px;
      ">Continuar</p>
      <p class="css-ou6pmp" style="
        line-height: 10px;
        margin: 5px 0 0 0;
        text-align: center;
      ">Tarifa selecionada</p>
    `;
    
    // Adiciona evento de clique no botão "Continuar"
    const continueBtn = tarifaContainer.querySelector('.variant-c-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', handleContinueClick);
    }
    
    hasModifiedSecondStep = true;
    analyticsEvent('2a Etapa - Botao Continuar exibido');
    console.log(`[${VARIANT_NAME}] 2ª Etapa: Botão "Continuar" criado na tarifa selecionada!`);
    
    isProcessing = false;
  }

  /**
   * Handler do clique em "Continuar" (2ª etapa)
   * Quando clica em "Continuar", simula clique no botão "Alterar tarifa" para fechar
   */
  function handleContinueClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`[${VARIANT_NAME}] 2ª Etapa: Clicou em Continuar...`);
    analyticsEvent('2a Etapa - Click Continuar');
    
    // Procura pelo botão "Alterar tarifa" no card selecionado
    const flightCardSelected = document.querySelector('.flight-card--selected');
    if (!flightCardSelected) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Card selecionado não encontrado.`);
      return;
    }
    
    const alterarTarifaButton = flightCardSelected.querySelector('.btn-fare');
    if (!alterarTarifaButton) {
      console.log(`[${VARIANT_NAME}] 2ª Etapa: Botão "Alterar tarifa" não encontrado.`);
      return;
    }
    
    // Clica no botão "Alterar tarifa" para fechar/colapsar as tarifas
    console.log(`[${VARIANT_NAME}] 2ª Etapa: Fechando tarifas...`);
    simulateReactClick(alterarTarifaButton);
    
    // Reseta flags da 2ª etapa
    isSecondStep = false;
    hasModifiedSecondStep = false;
  }

  /**
   * Observador de cliques em "Ver tarifas" (1ª etapa) e "Alterar tarifa" (manual)
   * A 2ª etapa automática acontece após a seleção, mas também funciona se o usuário clicar manualmente
   */
  function setupClickObserver() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Captura cliques em qualquer elemento que possa ser "Ver tarifas" ou "Alterar tarifa"
      const clickedElement = target.closest('button') || 
                            target.closest('.btn-fare') || 
                            target.closest('.flight-card__fare') ||
                            target.closest('[data-test-id="no-id"]');
      
      if (!clickedElement) return;
      
      const elementText = clickedElement.textContent?.toLowerCase() || '';
      const ariaLabel = clickedElement.getAttribute('aria-label')?.toLowerCase() || '';
      const combinedText = elementText + ' ' + ariaLabel;
      
      // ========== CLIQUE EM "VER TARIFAS" (1ª ETAPA) ==========
      if (combinedText.includes('ver tarifa')) {
        console.log(`[${VARIANT_NAME}] ✓ Usuário clicou em "Ver tarifas" - 1ª Etapa iniciando...`);
        
        // Reseta estados para 1ª etapa
        isSecondStep = false;
        hasAutoSelectedFirstStep = false;
        hasModifiedSecondStep = false;
        
        // Aguarda as tarifas aparecerem e auto-seleciona (múltiplas tentativas)
        setTimeout(() => {
          console.log(`[${VARIANT_NAME}] Tentativa 1 de auto-seleção...`);
          autoSelectMostExpensiveFare();
        }, 500);
        
        setTimeout(() => { 
          if (!hasAutoSelectedFirstStep) {
            console.log(`[${VARIANT_NAME}] Tentativa 2 de auto-seleção...`);
            autoSelectMostExpensiveFare();
          }
        }, 1000);
        
        setTimeout(() => { 
          if (!hasAutoSelectedFirstStep) {
            console.log(`[${VARIANT_NAME}] Tentativa 3 de auto-seleção...`);
            autoSelectMostExpensiveFare();
          }
        }, 1500);
        
        setTimeout(() => { 
          if (!hasAutoSelectedFirstStep) {
            console.log(`[${VARIANT_NAME}] Tentativa 4 de auto-seleção (final)...`);
            autoSelectMostExpensiveFare();
          }
        }, 2000);
      }
      
      // ========== CLIQUE MANUAL EM "ALTERAR TARIFA" ==========
      if (combinedText.includes('alterar tarifa')) {
        console.log(`[${VARIANT_NAME}] ✓ Usuário clicou manualmente em "Alterar tarifa"...`);
        
        // Marca que estamos na 2ª etapa
        isSecondStep = true;
        hasModifiedSecondStep = false;
        
        // Aguarda as tarifas abrirem e modifica o botão
        setTimeout(() => {
          console.log(`[${VARIANT_NAME}] Tentativa 1 de modificação do botão (manual)...`);
          modifyButtonForSecondStep();
        }, 500);
        
        setTimeout(() => { 
          if (!hasModifiedSecondStep) {
            console.log(`[${VARIANT_NAME}] Tentativa 2 de modificação do botão (manual)...`);
            modifyButtonForSecondStep();
          }
        }, 1000);
        
        setTimeout(() => { 
          if (!hasModifiedSecondStep) {
            console.log(`[${VARIANT_NAME}] Tentativa 3 de modificação do botão (manual)...`);
            modifyButtonForSecondStep();
          }
        }, 1500);
      }
    }, true);
    
    console.log(`[${VARIANT_NAME}] Observer de cliques configurado.`);
  }

  /**
   * Configura MutationObserver para detectar mudanças no DOM
   */
  function setupMutationObserver() {
    if (window._preSelectFareVariantCObserver) return;
    
    let debounceTimer = null;
    
    const observer = new MutationObserver(() => {
      if (isProcessing) return;
      
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Verifica qual etapa estamos e executa a ação correta
        if (isSecondStep) {
          modifyButtonForSecondStep();
        } else {
          // Não auto-seleciona automaticamente, só quando clica em "Ver tarifas"
        }
      }, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
    
    window._preSelectFareVariantCObserver = observer;
    console.log(`[${VARIANT_NAME}] MutationObserver configurado.`);
  }

  /**
   * Inicialização
   */
  function init() {
    console.log(`[${VARIANT_NAME}] Iniciando...`);
    
    // Configura observers
    setupClickObserver();
    setupMutationObserver();
    
    console.log(`[${VARIANT_NAME}] Inicializado com sucesso!`);
  }

  // Executa o mais cedo possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Também tenta via requestAnimationFrame
  requestAnimationFrame(() => {
    if (!window._preSelectFareVariantCObserver) {
      init();
    }
  });
})();
