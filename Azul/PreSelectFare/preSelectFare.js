(function () {
  // Função global para resetar e testar novamente
  window.resetPreSelectFare = function() {
    window.campaignPreSelectFare = false;
    currentFareContext = null;
    lastVisibilityState = null;
    isInitialized = false;
    isProcessingChange = false;
    
    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (floatingCTA) floatingCTA.remove();
    
    const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
    modifiedButtons.forEach(btn => {
      btn.removeAttribute('data-pre-select-modified');
      btn.classList.remove('fare-selected-disabled');
      btn.removeAttribute('disabled');
      btn.style.pointerEvents = '';
      const texts = btn.querySelectorAll('.button__text, .button__text--mobile');
      texts.forEach(t => t.textContent = 'Selecionar tarifa');
    });
    
    const highlightedItems = document.querySelectorAll('.fare-item-highlighted');
    highlightedItems.forEach(item => item.classList.remove('fare-item-highlighted'));
    
    document.body.classList.remove('pre-select-fare-active');
    
    console.log('[PreSelectFare] Reset completo. Execute init() para reaplicar.');
  };

  function onTargetPage() {
    return true;
  }

  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[PreSelectFare] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_pre_select_fare ' + eventLabel;

    console.log('[PreSelectFare] Analytics event triggered:', labelEvent);

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

  function injectStyles() {
    if (document.getElementById('pre-select-fare-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'pre-select-fare-styles';
    styles.textContent = `
      .pre-select-floating-cta {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #FFFFFF;;
        padding: 20px;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      }

      .pre-select-floating-cta .floating-continue-btn {
        background: rgb(2, 108, 182);
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        padding: 14px 48px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 280px;
        letter-spacing: 0.5px;
      }

      .pre-select-floating-cta .floating-continue-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(2, 108, 182, 0.4);
      }

      .pre-select-floating-cta .floating-continue-btn:active {
        transform: translateY(0);
      }

      .fare-selected-disabled {
        background: #E8E8E8 !important;
        color: #666666 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
        opacity: 0.8 !important;
      }

      .fare-selected-disabled .button__text,
      .fare-selected-disabled .button__text--mobile {
        color: #666666 !important;
      }

      .fare-item-highlighted {
        position: relative;
        border: 2px solid #026CB6 !important;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(2, 108, 182, 0.2);
        margin-top: 4px;
      }

      body.pre-select-fare-active {
        padding-bottom: 100px;
      }

      @media (max-width: 768px) {
        .pre-select-floating-cta {
          padding: 15px;
          padding-top: 30px;
        }

        .pre-select-floating-cta .floating-continue-btn {
          width: 100%;
          padding: 14px 24px;
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // Injeta estilos IMEDIATAMENTE para evitar flash
  injectStyles();

  function checkIfFareAlreadySelected() {
    // Verifica se alguma tarifa foi REALMENTE selecionada pelo usuário
    // Ignora botões disabled que são "Tarifa esgotada"
    const selectedIndicators = [
      '.fare-item.selected',
      '.fare-item.active',
      '.fare-item [aria-selected="true"]',
      '.fare-item.is-selected',
      '.fare-item .selected'
    ];
    
    for (const selector of selectedIndicators) {
      const selected = document.querySelector(selector);
      if (selected && !selected.hasAttribute('data-pre-select-modified')) {
        console.log('[PreSelectFare] Tarifa já selecionada encontrada:', selector);
        return true;
      }
    }
    
    // Verifica botões disabled que NÃO são "Tarifa esgotada" e NÃO foram modificados por nós
    const disabledButtons = document.querySelectorAll('[data-test-id="select-fare"][disabled]');
    for (const btn of disabledButtons) {
      // Ignora se foi modificado por nós
      if (btn.hasAttribute('data-pre-select-modified')) continue;
      
      // Ignora se é "Tarifa esgotada"
      const buttonText = btn.textContent.toLowerCase();
      if (buttonText.includes('esgotada')) continue;
      
      // Se chegou aqui, é uma tarifa selecionada pelo usuário
      console.log('[PreSelectFare] Tarifa já selecionada pelo usuário (botão disabled).');
      return true;
    }
    
    return false;
  }

  function findMostExpensiveFare() {
    const fareItems = document.querySelectorAll('.fare-item');
    
    if (!fareItems.length) return null;

    const existingModifiedFare = document.querySelector('.fare-item-highlighted');
    if (existingModifiedFare) {
      return existingModifiedFare;
    }

    let maxPrice = -1;
    let mostExpensiveFare = null;

    fareItems.forEach((fareItem) => {
      // Ignora tarifa Business
      const fareName = fareItem.querySelector('.promotional, .fare-price p');
      if (fareName) {
        const fareNameText = fareName.textContent.toLowerCase();
        if (fareNameText.includes('business')) {
          return; // Pula esta tarifa
        }
      }
      
      // Ignora tarifas esgotadas
      const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
      if (selectButton) {
        const buttonText = selectButton.textContent.toLowerCase();
        if (buttonText.includes('esgotada')) {
          return; // Pula esta tarifa
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
          mostExpensiveFare = fareItem;
        }
      }
    });

    return mostExpensiveFare;
  }

  function modifyExpensiveFareButton(fareItem) {
    if (!fareItem) return null;

    const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
    if (!selectButton) return null;

    if (selectButton.hasAttribute('data-pre-select-modified')) return selectButton;

    selectButton.setAttribute('data-pre-select-modified', 'true');
    selectButton.setAttribute('data-original-text', selectButton.textContent);

    const buttonTexts = selectButton.querySelectorAll('.button__text, .button__text--mobile');
    buttonTexts.forEach((textEl) => {
      textEl.textContent = 'Tarifa selecionada';
    });

    selectButton.classList.add('fare-selected-disabled');
    selectButton.setAttribute('disabled', 'true');

    fareItem.classList.add('fare-item-highlighted');

    return selectButton;
  }

  function createFloatingCTA(originalButton) {
    const existingCTA = document.querySelector('.pre-select-floating-cta');
    if (existingCTA) {
      existingCTA.style.display = 'flex';
      document.body.classList.add('pre-select-fare-active');
      
      const continueButton = existingCTA.querySelector('.floating-continue-btn');
      if (continueButton) {
        const newContinueButton = continueButton.cloneNode(true);
        continueButton.parentNode.replaceChild(newContinueButton, continueButton);
        
        let isProcessing = false;
        newContinueButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (isProcessing) return;
          isProcessing = true;

          analyticsEvent('Continuar - Floating CTA');

          if (originalButton) {
            originalButton.classList.remove('fare-selected-disabled');
            originalButton.removeAttribute('disabled');
            originalButton.style.pointerEvents = 'auto';

            originalButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            originalButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            originalButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

            setTimeout(() => {
              existingCTA.style.display = 'none';
              document.body.classList.remove('pre-select-fare-active');
            }, 50);
          } else {
            isProcessing = false;
          }
        });
      }
      
      return existingCTA;
    }

    const floatingDiv = document.createElement('div');
    floatingDiv.className = 'pre-select-floating-cta';

    const continueButton = document.createElement('button');
    continueButton.className = 'floating-continue-btn';
    continueButton.textContent = 'Continuar';
    continueButton.setAttribute('data-test-id', 'pre-select-continue-btn');

    let isProcessing = false;

    continueButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isProcessing) return;
      isProcessing = true;

      analyticsEvent('Continuar - Floating CTA');

      if (originalButton) {
        originalButton.classList.remove('fare-selected-disabled');
        originalButton.removeAttribute('disabled');
        originalButton.style.pointerEvents = 'auto';

        originalButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        originalButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        originalButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        setTimeout(() => {
          floatingDiv.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
        }, 50);
      } else {
        isProcessing = false;
      }
    });

    floatingDiv.appendChild(continueButton);
    document.body.appendChild(floatingDiv);
    document.body.classList.add('pre-select-fare-active');

    return floatingDiv;
  }

  // Função rápida para aplicar seleção
  function applySelection() {
    if (checkIfFareAlreadySelected()) {
      console.log('[PreSelectFare] Já existe tarifa selecionada pelo usuário.');
      return false;
    }
    
    const mostExpensiveFare = findMostExpensiveFare();
    if (!mostExpensiveFare) {
      console.log('[PreSelectFare] Nenhuma tarifa encontrada para seleção.');
      return false;
    }

    const originalButton = modifyExpensiveFareButton(mostExpensiveFare);
    if (!originalButton) {
      console.log('[PreSelectFare] Botão de seleção não encontrado.');
      return false;
    }

    const cta = createFloatingCTA(originalButton);
    if (!cta) {
      console.log('[PreSelectFare] Falha ao criar CTA flutuante.');
      return false;
    }

    return true;
  }

  // Estado para controle de visibilidade e contexto
  let lastVisibilityState = null;
  let isInitialized = false;
  let currentFareContext = null; // Hash para identificar o contexto atual das tarifas
  let isProcessingChange = false; // Flag para evitar reprocessamento

  function getFareContextHash() {
    // Cria um hash único baseado nos preços das tarifas VISÍVEIS
    const fareItems = document.querySelectorAll('.fare-item');
    const visiblePrices = Array.from(fareItems)
      .filter(item => {
        const rect = item.getBoundingClientRect();
        const style = window.getComputedStyle(item);
        return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map(item => {
        const priceEl = item.querySelector('[data-test-id="fare-price"]');
        return priceEl ? priceEl.textContent.trim().replace(/\s+/g, '') : '';
      })
      .filter(price => price)
      .sort();
    
    return visiblePrices.join('|');
  }

  function resetCurrentSelection() {
    // Remove todas as modificações anteriores
    const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
    modifiedButtons.forEach(btn => {
      btn.removeAttribute('data-pre-select-modified');
      btn.classList.remove('fare-selected-disabled');
      btn.removeAttribute('disabled');
      btn.style.pointerEvents = '';
      const texts = btn.querySelectorAll('.button__text, .button__text--mobile');
      texts.forEach(t => t.textContent = btn.getAttribute('data-original-text') || 'Selecionar tarifa');
    });
    
    const highlightedItems = document.querySelectorAll('.fare-item-highlighted');
    highlightedItems.forEach(item => item.classList.remove('fare-item-highlighted'));
    
    // Esconde o CTA
    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (floatingCTA) {
      floatingCTA.style.display = 'none';
    }
    document.body.classList.remove('pre-select-fare-active');
    
    console.log('[PreSelectFare] Seleção anterior resetada.');
  }

  function checkFaresVisibility() {
    // Evita reprocessamento durante mudanças
    if (isProcessingChange) return;
    
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    const hasVisibleFares = visibleFareItems.length > 0;
    const modifiedButton = document.querySelector('[data-pre-select-modified]');
    
    // CASO 1: Não tem tarifas visíveis - esconde CTA e reseta contexto
    if (!hasVisibleFares) {
      if (lastVisibilityState !== false) {
        lastVisibilityState = false;
        currentFareContext = null; // Reseta contexto quando recolhe
        if (floatingCTA) {
          floatingCTA.style.display = 'none';
        }
        document.body.classList.remove('pre-select-fare-active');
        console.log('[PreSelectFare] Tarifas recolhidas - CTA escondido.');
      }
      return;
    }
    
    // CASO 2: Tem tarifas visíveis
    const newFareContext = getFareContextHash();
    
    // Verifica se mudou o contexto (novo conjunto de tarifas diferente do anterior)
    // Só considera mudança se JÁ tinha um contexto E é diferente
    const contextChanged = currentFareContext !== null && 
                          currentFareContext !== newFareContext &&
                          modifiedButton !== null;
    
    if (contextChanged) {
      // Contexto mudou E tinha seleção anterior - precisa resetar
      console.log('[PreSelectFare] Contexto mudou - resetando seleção.');
      isProcessingChange = true;
      resetCurrentSelection();
      
      // Aplica nova seleção após reset
      setTimeout(() => {
        const selectionApplied = applySelection();
        // Atualiza contexto APÓS aplicar seleção (usando novo hash)
        currentFareContext = getFareContextHash();
        lastVisibilityState = true;
        isProcessingChange = false;
        
        if (selectionApplied) {
          console.log('[PreSelectFare] Nova seleção aplicada.');
        } else {
          const cta = document.querySelector('.pre-select-floating-cta');
          if (cta) cta.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
        }
      }, 50);
      return;
    }
    
    // CASO 3: Não tem seleção modificada - precisa aplicar
    if (!modifiedButton) {
      const selectionApplied = applySelection();
      // Atualiza contexto APÓS aplicar seleção
      currentFareContext = getFareContextHash();
      lastVisibilityState = true;
      
      if (selectionApplied) {
        console.log('[PreSelectFare] Seleção aplicada.');
      } else {
        if (floatingCTA) floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
      }
      return;
    }
    
    // CASO 4: Já tem seleção válida - apenas mostrar CTA se necessário
    // Atualiza contexto para o atual (caso tenha mudado sem reset)
    currentFareContext = newFareContext;
    
    if (lastVisibilityState !== true) {
      lastVisibilityState = true;
      if (floatingCTA) {
        floatingCTA.style.display = 'flex';
        document.body.classList.add('pre-select-fare-active');
      }
      console.log('[PreSelectFare] Tarifas visíveis - CTA mostrado.');
    }
  }

  function setupObserver() {
    if (window._preSelectFareObserver) return;
    
    let debounceTimer = null;
    
    const observer = new MutationObserver(() => {
      // Ignora se está processando mudança
      if (isProcessingChange) return;
      
      // Executa IMEDIATAMENTE sem debounce para primeira detecção
      if (!isInitialized) {
        const fareItems = document.querySelectorAll('.fare-item');
        if (fareItems.length > 0) {
          isInitialized = true;
          checkFaresVisibility();
        }
        return;
      }
      
      // Debounce maior para mudanças subsequentes (evita múltiplas execuções)
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkFaresVisibility, 250);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
    
    window._preSelectFareObserver = observer;
    console.log('[PreSelectFare] Observer configurado.');
  }

  function init() {
    console.log('[PreSelectFare] Iniciando...');
    
    // Configura observer PRIMEIRO
    setupObserver();
    
    // Tenta aplicar imediatamente
    const fareItems = document.querySelectorAll('.fare-item');
    if (fareItems.length > 0) {
      isInitialized = true;
      checkFaresVisibility();
      console.log('[PreSelectFare] Aplicado imediatamente.');
    }
  }

  // Executa o mais cedo possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Executa IMEDIATAMENTE
    init();
  }

  // Também tenta via requestAnimationFrame para máxima velocidade
  requestAnimationFrame(() => {
    if (!isInitialized) {
      const fareItems = document.querySelectorAll('.fare-item');
      if (fareItems.length > 0) {
        isInitialized = true;
        checkFaresVisibility();
      }
    }
  });
})();
