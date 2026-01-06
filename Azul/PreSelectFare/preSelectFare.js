// Pre Seleção de Tarifa

(function () {
  // Função global para resetar e testar novamente
  window.resetPreSelectFare = function() {
    window.campaignPreSelectFare = false;
    currentFareContext = null;
    lastVisibilityState = null;
    isInitialized = false;
    isProcessingChange = false;
    isSecondStep = false;

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

      btn.removeAttribute('data-original-text');
    });

    const highlightedItems = document.querySelectorAll('.fare-item-highlighted');
    highlightedItems.forEach(item => item.classList.remove('fare-item-highlighted'));

    document.body.classList.remove('pre-select-fare-active');
    
    if (window._preSelectFareObserver) {
      window._preSelectFareObserver.disconnect();
      window._preSelectFareObserver = null;
    }
  };

  function onTargetPage() {
    return true;
  }

  function analyticsEvent(eventLabel) {
    if (!eventLabel) return;
    const labelEvent = 'AT_pre_select_fare ' + eventLabel;
    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
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
        border-radius: 4px;
        padding: 14px 48px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 280px;
        letter-spacing: 0.5px;
        font-family: "Helvetica Neue Medium", Arial;
      }
      .pre-select-floating-cta .floating-continue-btn:hover {
        background:rgb(1, 78, 132);
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

  injectStyles();

  // FUNÇÃO INTELIGENTE: Detecta se estamos na PRIMEIRA etapa com debounce
  function isInFirstStep() {
    // Indicador DEFINITIVO da primeira etapa:
    // aria-label fixo do calendário de preços
    const priceCalendarElement = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
    
    // Indicadores secundários (caso o calendário esteja sendo recriado)
    const fareItems = document.querySelectorAll('.fare-item');
    const hasBookingCalendar = document.querySelector('.booking-calendar__cards');
    
    // Se o calendário existe OU (tem tarifas + container do calendário), está na primeira etapa
    return !!(priceCalendarElement || (fareItems.length > 0 && hasBookingCalendar));
  }

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
        return true;
      }
    }
    
    // Verifica botões disabled que NÃO são "Tarifa esgotada" e NÃO foram modificados por nós
    const disabledButtons = document.querySelectorAll('[data-test-id="select-fare"][disabled]');
    for (const btn of disabledButtons) {
      if (btn.hasAttribute('data-pre-select-modified')) continue;
      const buttonText = btn.textContent.toLowerCase();
      if (buttonText.includes('esgotada')) continue;
      return true;
    }
    
    return false;
  }

  function findMostExpensiveFare() {
    const fareItems = document.querySelectorAll('.fare-item');
    if (!fareItems.length) return null;
    const existingModifiedFare = document.querySelector('.fare-item-highlighted');
    if (existingModifiedFare) return existingModifiedFare;
    let maxPrice = -1;
    let mostExpensiveFare = null;
    fareItems.forEach((fareItem) => {
      const fareName = fareItem.querySelector('.promotional, .fare-price p');
      if (fareName) {
        const fareNameText = fareName.textContent.toLowerCase();
        if (fareNameText.includes('business')) return;
      }
      const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
      if (selectButton) {
        const buttonText = selectButton.textContent.toLowerCase();
        if (buttonText.includes('esgotada')) return;
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
    if (!selectButton.hasAttribute('data-original-text')) {
      const buttonTexts = selectButton.querySelectorAll('.button__text, .button__text--mobile');
      if (buttonTexts.length > 0) selectButton.setAttribute('data-original-text', buttonTexts[0].textContent);
    }
    const buttonTexts = selectButton.querySelectorAll('.button__text, .button__text--mobile');
    buttonTexts.forEach((textEl) => textEl.textContent = 'Tarifa selecionada');
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
    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.cssText = 'max-width: 920px; width: 100%; display: flex; justify-content: end;';
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
    wrapperDiv.appendChild(continueButton);
    floatingDiv.appendChild(wrapperDiv);
    document.body.appendChild(floatingDiv);
    document.body.classList.add('pre-select-fare-active');
    return floatingDiv;
  }

  function applySelection() {
    if (checkIfFareAlreadySelected()) return false;
    const mostExpensiveFare = findMostExpensiveFare();
    if (!mostExpensiveFare) return false;
    const originalButton = modifyExpensiveFareButton(mostExpensiveFare);
    if (!originalButton) return false;
    const cta = createFloatingCTA(originalButton);
    if (!cta) return false;
    return true;
  }

  let lastVisibilityState = null;
  let isInitialized = false;
  let currentFareContext = null;
  let isProcessingChange = false;
  let isSecondStep = false;
  let stepCheckDebounceTimer = null;
  let calendarObserver = null; // NOVO: Observer dedicado para o calendário

  function getFareContextHash() {
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
    const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
    modifiedButtons.forEach(btn => {
      btn.removeAttribute('data-pre-select-modified');
      btn.classList.remove('fare-selected-disabled');
      btn.removeAttribute('disabled');
      btn.style.pointerEvents = '';
      const originalText = btn.getAttribute('data-original-text');
      const texts = btn.querySelectorAll('.button__text, .button__text--mobile');
      texts.forEach(t => {
        t.textContent = originalText && originalText.trim() ? originalText.trim() : 'Selecionar tarifa';
      });
      btn.removeAttribute('data-original-text');
    });
    const highlightedItems = document.querySelectorAll('.fare-item-highlighted');
    highlightedItems.forEach(item => item.classList.remove('fare-item-highlighted'));
    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (floatingCTA) {
      floatingCTA.style.display = 'none';
    }
    document.body.classList.remove('pre-select-fare-active');
  }

  function checkFaresVisibility() {
    // **PROTEÇÃO INTELIGENTE: Verifica etapa com debounce para evitar falsos positivos**
    const currentlyInFirstStep = isInFirstStep();
    
    if (!currentlyInFirstStep) {
      // Aguarda 300ms antes de confirmar que realmente saiu da primeira etapa
      // (evita falsos positivos quando a div é recriada)
      if (stepCheckDebounceTimer) clearTimeout(stepCheckDebounceTimer);
      
      stepCheckDebounceTimer = setTimeout(() => {
        // Verifica novamente após 300ms
        if (!isInFirstStep()) {
          if (!isSecondStep) {
            // console.log('[PreSelectFare] Confirmado: NÃO está na primeira etapa - desativando script');
            isSecondStep = true;
            resetCurrentSelection();
            if (window._preSelectFareObserver) {
              window._preSelectFareObserver.disconnect();
              window._preSelectFareObserver = null;
            }
            // IMPORTANTE: Calendar observer permanece ativo para detectar retorno
            // console.log('[PreSelectFare] Calendar observer permanece ativo');
          }
        } else {
          // console.log('[PreSelectFare] Falso positivo detectado - continua na primeira etapa');
        }
      }, 300);
      
      return;
    }
    
    // **REATIVAÇÃO COMPLETA: Se voltou para primeira etapa, reconstrói tudo**
    if (isSecondStep && currentlyInFirstStep) {
      // console.log('[PreSelectFare] Voltou para primeira etapa - REATIVANDO COMPLETAMENTE');
      
      // Reseta TODOS os estados
      isSecondStep = false;
      isInitialized = false;
      isProcessingChange = false;
      currentFareContext = null;
      lastVisibilityState = null;
      
      // Limpa qualquer timer pendente
      if (stepCheckDebounceTimer) {
        clearTimeout(stepCheckDebounceTimer);
        stepCheckDebounceTimer = null;
      }
      
      // Limpa modificações anteriores (se houver)
      resetCurrentSelection();
      
      // Reconecta observer
      if (!window._preSelectFareObserver) {
        setupObserver();
      }
      
      // Força nova aplicação após um pequeno delay para garantir DOM estável
      setTimeout(() => {
        const fareItems = document.querySelectorAll('.fare-item');
        if (fareItems.length > 0) {
          // console.log('[PreSelectFare] Aplicando seleção após retorno');
          isInitialized = true;
          checkFaresVisibility();
        }
      }, 100);
      
      return;
    }

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

    if (!hasVisibleFares) {
      if (lastVisibilityState !== false) {
        lastVisibilityState = false;
        currentFareContext = null;
        if (floatingCTA) {
          floatingCTA.style.display = 'none';
        }
        document.body.classList.remove('pre-select-fare-active');
      }
      return;
    }

    const newFareContext = getFareContextHash();
    const contextChanged = currentFareContext !== null && 
                          currentFareContext !== newFareContext &&
                          modifiedButton !== null;
    
    if (contextChanged) {
      isProcessingChange = true;
      resetCurrentSelection();
      currentFareContext = newFareContext;
      setTimeout(() => {
        const selectionApplied = applySelection();
        currentFareContext = getFareContextHash();
        lastVisibilityState = true;
        setTimeout(() => {
          isProcessingChange = false;
        }, 150);
        if (!selectionApplied) {
          const cta = document.querySelector('.pre-select-floating-cta');
          if (cta) cta.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
        }
      }, 100);
      return;
    }
    
    if (!modifiedButton) {
      const selectionApplied = applySelection();
      currentFareContext = getFareContextHash();
      lastVisibilityState = true;
      if (!selectionApplied) {
        if (floatingCTA) floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
      }
      return;
    }
    
    currentFareContext = newFareContext;
    if (lastVisibilityState !== true) {
      lastVisibilityState = true;
      if (floatingCTA) {
        floatingCTA.style.display = 'flex';
        document.body.classList.add('pre-select-fare-active');
      }
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

      // Debounce de 200ms para mudanças subsequentes
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkFaresVisibility, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });

    window._preSelectFareObserver = observer;
  }

  // NOVO: Observer dedicado para detectar retorno do calendário de preços
  function setupCalendarObserver() {
    if (calendarObserver) return;
    
    // console.log('[PreSelectFare] Configurando observer do calendário');
    
    calendarObserver = new MutationObserver((mutations) => {
      // Verifica se o calendário de preços apareceu no DOM
      const priceCalendar = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
      
      if (priceCalendar && isSecondStep) {
        // console.log('[PreSelectFare] CALENDÁRIO DETECTADO - Reativando script!');
        
        // Limpa timer de debounce se existir
        if (stepCheckDebounceTimer) {
          clearTimeout(stepCheckDebounceTimer);
          stepCheckDebounceTimer = null;
        }
        
        // Reseta TODOS os estados
        isSecondStep = false;
        isInitialized = false;
        isProcessingChange = false;
        currentFareContext = null;
        lastVisibilityState = null;
        
        // Limpa modificações anteriores
        resetCurrentSelection();
        
        // Reconecta observer principal se necessário
        if (!window._preSelectFareObserver) {
          setupObserver();
        }
        
        // Aguarda DOM estabilizar e aplica seleção
        setTimeout(() => {
          const fareItems = document.querySelectorAll('.fare-item');
          if (fareItems.length > 0) {
            // console.log('[PreSelectFare] Aplicando seleção após detectar calendário');
            isInitialized = true;
            checkFaresVisibility();
          } else {
            // Se ainda não tem tarifas, aguarda mais um pouco
            setTimeout(() => {
              const fareItemsRetry = document.querySelectorAll('.fare-item');
              if (fareItemsRetry.length > 0) {
                // console.log('[PreSelectFare] Aplicando seleção (retry)');
                isInitialized = true;
                checkFaresVisibility();
              }
            }, 200);
          }
        }, 150);
      }
    });
    
    // Observa todo o body em busca do calendário
    calendarObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label']
    });
  }

  function init() {
    // Configura o observer principal imediatamente
    setupObserver();
    setupCalendarObserver(); // SEMPRE configura o calendar observer

    // Verifica se já existem tarifas na tela
    const fareItems = document.querySelectorAll('.fare-item');
    if (fareItems.length > 0) {
      isInitialized = true;
      checkFaresVisibility();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Polling para garantir inicialização mesmo com carregamento dinâmico
  let pollCount = 0;
  const maxPolls = 40; // Aumentado para 40 tentativas (~2 segundos)
  const pollInterval = setInterval(() => {
    pollCount++;
    if (pollCount >= maxPolls || isInitialized) {
      clearInterval(pollInterval);
      return;
    }
    const fareItems = document.querySelectorAll('.fare-item');
    if (fareItems.length > 0) {
      isInitialized = true;
      checkFaresVisibility();
      clearInterval(pollInterval);
    }
  }, 50);
})();
