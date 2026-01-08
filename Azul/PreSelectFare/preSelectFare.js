// Pre Seleção de Tarifa

(function () {
  // Variáveis de estado
  let lastVisibilityState = null;
  let isInitialized = false;
  let currentFareContext = null;
  let isProcessingChange = false;
  let isSecondStep = false;
  let calendarObserver = null;
  let lastApplyAttempt = null;
  let lastCTAState = null;
  let consecutiveFailedAttempts = 0;

  // Função global para resetar e testar novamente
  window.resetPreSelectFare = function() {
    currentFareContext = null;
    lastVisibilityState = null;
    isInitialized = false;
    isProcessingChange = false;
    isSecondStep = false;
    consecutiveFailedAttempts = 0;
    lastApplyAttempt = null;
    lastCTAState = null;

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
    
    console.log('[PreSelectFare] Reset completo');
  };

  // Função de analytics
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

  // Injeção de estilos
  function injectStyles() {
    if (document.getElementById('pre-select-fare-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'pre-select-fare-styles';
    styles.textContent = '\
      .pre-select-floating-cta {\
        position: fixed;\
        bottom: 0;\
        left: 0;\
        right: 0;\
        background: #FFFFFF;\
        padding: 20px;\
        z-index: 9999;\
        display: flex;\
        justify-content: center;\
        align-items: center;\
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);\
      }\
      .pre-select-floating-cta .floating-continue-btn {\
        background: rgb(2, 108, 182);\
        color: #FFFFFF;\
        border: none;\
        border-radius: 4px;\
        padding: 14px 48px;\
        font-size: 16px;\
        font-weight: 600;\
        cursor: pointer;\
        transition: all 0.3s ease;\
        min-width: 280px;\
        letter-spacing: 0.5px;\
        font-family: "Helvetica Neue Medium", Arial;\
      }\
      .pre-select-floating-cta .floating-continue-btn:hover:not(:disabled) {\
        background: rgb(1, 78, 132);\
      }\
      .pre-select-floating-cta .floating-continue-btn:disabled,\
      .pre-select-floating-cta .floating-continue-btn.disabled {\
        background: #FFF !important;\
        color: #999999 !important;\
        cursor: not-allowed !important;\
        opacity: 0.7;\
      }\
      .fare-selected-disabled {\
        background: #FFF !important;\
        color: rgb(4, 30, 66) !important;\
        cursor: not-allowed !important;\
        pointer-events: none !important;\
        opacity: 0.8 !important;\
        border: solid 2px rgb(0, 128, 88) !important;\
      }\
      .fare-selected-disabled .button__text,\
      .fare-selected-disabled .button__text--mobile {\
        color: rgb(4, 30, 66) !important;\
      }\
      .fare-item-highlighted {\
        position: relative;\
        border: 1px solid #026CB6 !important;\
        margin-top: 3px;\
        background: rgba(2, 108, 182, 0.04);\
      }\
      footer.pre-select-footer-adjusted {\
        position: unset !important;\
      }\
      @media (max-width: 768px) {\
        .pre-select-floating-cta {\
          padding: 15px;\
          padding-top: 30px;\
        }\
        .pre-select-floating-cta .floating-continue-btn {\
          width: 100%;\
          padding: 14px 24px;\
          font-size: 14px;\
        }\
      }\
    ';
    document.head.appendChild(styles);
  }

  injectStyles();

  // FUNÇÃO: Detecta se estamos na PRIMEIRA etapa
  function isInFirstStep() {
    const priceCalendar = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
    const fareItems = document.querySelectorAll('.fare-item');
    const bookingCalendar = document.querySelector('.booking-calendar__cards');
    return !!(priceCalendar || (fareItems.length > 0 && bookingCalendar));
  }

  // FUNÇÃO: Identifica a qual trecho um fare-item pertence
  function identifyFareItemTrip(fareItem) {
    let current = fareItem;
    let depth = 0;
    
    while (current && current !== document.body && depth < 50) {
      depth++;
      const className = current.className || '';
      const classStr = typeof className === 'string' ? className : (className.baseVal || '');
      
      if (classStr.indexOf('trip-index-0') !== -1) return 'ida';
      if (classStr.indexOf('trip-index-1') !== -1) return 'volta';
      
      current = current.parentElement;
    }
    
    return 'desconhecido';
  }

  // Obtém fare-items visíveis separados por trecho (sem logs excessivos)
  function getVisibleFareItemsByTrip(enableLog) {
    const allFareItems = document.querySelectorAll('.fare-item');
    const result = { ida: [], volta: [], desconhecido: [] };
    
    allFareItems.forEach(fareItem => {
      const rect = fareItem.getBoundingClientRect();
      const style = window.getComputedStyle(fareItem);
      const isVisible = rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      
      if (!isVisible) return;
      
      const trip = identifyFareItemTrip(fareItem);
      result[trip].push(fareItem);
    });
    
    if (enableLog) {
      console.log('[PreSelectFare] Fare-items: IDA=' + result.ida.length + ' VOLTA=' + result.volta.length);
    }
    
    return result;
  }

  // Encontra a tarifa mais cara em uma lista
  function findMostExpensiveFromList(fareItems, tripName) {
    if (!fareItems || fareItems.length === 0) return null;
    
    let maxPrice = -1;
    let mostExpensiveFare = null;
    
    fareItems.forEach(fareItem => {
      if (fareItem.classList.contains('fare-item-highlighted')) return;
      
      const fareName = fareItem.querySelector('.promotional, .fare-price p');
      if (fareName && fareName.textContent.toLowerCase().includes('business')) return;
      
      const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
      if (!selectButton) return;
      if (selectButton.textContent.toLowerCase().includes('esgotada')) return;
      
      const priceElement = fareItem.querySelector('[data-test-id="fare-price"]');
      if (!priceElement) return;
      
      const rawText = priceElement.textContent;
      const priceText = rawText.replace(/[^\d.,]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
      const price = parseFloat(priceText);
      
      if (!isNaN(price) && price > maxPrice) {
        maxPrice = price;
        mostExpensiveFare = fareItem;
      }
    });
    
    if (mostExpensiveFare) {
      console.log('[PreSelectFare] Tarifa mais cara ' + tripName + ': R$' + maxPrice.toFixed(2));
    }
    
    return mostExpensiveFare;
  }

  // Verifica se já há tarifa selecionada no container
  function checkIfFareAlreadySelected(tripContainer) {
    const searchScope = tripContainer || document;
    
    if (searchScope.querySelector('[aria-label*="Alterar esta tarifa"]')) return true;
    if (searchScope.querySelector('.css-ou6pmp')) return true;
    
    const selectedIndicators = ['.fare-item.selected', '.fare-item.active', '.fare-item [aria-selected="true"]'];
    for (const selector of selectedIndicators) {
      const selected = searchScope.querySelector(selector);
      if (selected && !selected.hasAttribute('data-pre-select-modified')) return true;
    }
    
    const disabledButtons = searchScope.querySelectorAll('[data-test-id="select-fare"][disabled]');
    for (const btn of disabledButtons) {
      if (btn.hasAttribute('data-pre-select-modified')) continue;
      if (!btn.textContent.toLowerCase().includes('esgotada')) return true;
    }
    
    return false;
  }

  // Modifica o botão da tarifa mais cara
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
    
    // Ícone de check SVG
    const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" style="vertical-align: middle; margin-right: 6px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.600098 9.0001C0.600098 4.3591 4.3591 0.600098 9.0001 0.600098C13.6369 0.600098 17.4001 4.3591 17.4001 9.0001C17.4001 13.6376 13.6369 17.4001 9.0001 17.4001C4.3591 17.4001 0.600098 13.6376 0.600098 9.0001ZM5.3587 8.38223L4.8001 8.95508L7.81887 12.0547L13.5819 6.13663L13.024 5.56378L7.81887 10.9083L5.3587 8.38223Z" fill="#008058"/></svg>';
    
    const buttonTexts = selectButton.querySelectorAll('.button__text, .button__text--mobile');
    buttonTexts.forEach(textEl => {
      textEl.innerHTML = checkIcon + 'Tarifa selecionada';
    });
    selectButton.classList.add('fare-selected-disabled');
    selectButton.setAttribute('disabled', 'true');
    fareItem.classList.add('fare-item-highlighted');
    
    return selectButton;
  }

  // Conta tarifas selecionadas
  function countSelectedFares() {
    let count = 0;
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    
    if (tripContainers.length > 0) {
      tripContainers.forEach(container => {
        if (checkIfFareAlreadySelected(container)) count++;
      });
    } else {
      if (checkIfFareAlreadySelected()) count = 1;
    }
    
    return count;
  }

  // Verifica se há botão pré-selecionado visível
  function hasVisiblePreSelectedButton() {
    const btn = document.querySelector('[data-pre-select-modified]');
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.height > 0;
  }

  // Identifica qual trecho está faltando
  function getMissingTripSelection() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    if (tripContainers.length === 0) return { missing: 'tarifa', idaSelected: false, voltaSelected: false };
    
    let idaSelected = false;
    let voltaSelected = false;
    
    tripContainers.forEach(container => {
      const isIda = container.className.indexOf('trip-index-0') !== -1;
      const isVolta = container.className.indexOf('trip-index-1') !== -1;
      const hasSelection = checkIfFareAlreadySelected(container);
      
      if (isIda && hasSelection) idaSelected = true;
      if (isVolta && hasSelection) voltaSelected = true;
    });
    
    let missing = null;
    if (!idaSelected && !voltaSelected) missing = 'ambas';
    else if (!idaSelected) missing = 'ida';
    else if (!voltaSelected) missing = 'volta';
    
    return { missing, idaSelected, voltaSelected };
  }

  // Gera hash do contexto atual (simplificado, sem logs)
  function getFareContextHash() {
    const fareItems = getVisibleFareItemsByTrip(false);
    const idaPrices = fareItems.ida.map(item => {
      const el = item.querySelector('[data-test-id="fare-price"]');
      return el ? el.textContent.trim() : '';
    }).filter(p => p).sort().join(',');
    
    const voltaPrices = fareItems.volta.map(item => {
      const el = item.querySelector('[data-test-id="fare-price"]');
      return el ? el.textContent.trim() : '';
    }).filter(p => p).sort().join(',');
    
    return 'ida:' + fareItems.ida.length + ':' + idaPrices + '|volta:' + fareItems.volta.length + ':' + voltaPrices;
  }

  // Adiciona classe ao footer quando a barra está visível
  function updateFooterStyle(isBarVisible) {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    if (isBarVisible) {
      footer.classList.add('pre-select-footer-adjusted');
    } else {
      footer.classList.remove('pre-select-footer-adjusted');
    }
  }

  // Atualiza estado do CTA flutuante
  function updateFloatingCTAState(floatingCTA, originalButton) {
    if (!floatingCTA) return;
    
    const continueButton = floatingCTA.querySelector('.floating-continue-btn');
    if (!continueButton) return;

    const newBtn = continueButton.cloneNode(true);
    continueButton.parentNode.replaceChild(newBtn, continueButton);
    
    floatingCTA.style.display = 'flex';
    document.body.classList.add('pre-select-fare-active');
    updateFooterStyle(true);

    const selectedCount = countSelectedFares();
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    const totalTrips = tripContainers.length || 1;
    const hasPreSelectedVisible = hasVisiblePreSelectedButton();
    const tripStatus = getMissingTripSelection();
    
    // Todas selecionadas
    if (selectedCount >= totalTrips) {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.textContent = 'Continuar';
      
      newBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        analyticsEvent('Continuar - Todas tarifas selecionadas');
        
        const modifiedBtn = document.querySelector('[data-pre-select-modified]');
        if (modifiedBtn) {
          modifiedBtn.classList.remove('fare-selected-disabled');
          modifiedBtn.removeAttribute('disabled');
          modifiedBtn.style.pointerEvents = 'auto';
          modifiedBtn.click();
          
          setTimeout(() => {
            closeExpandedDetails();
          }, 150);
        }
        
        setTimeout(() => {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
          updateFooterStyle(false);
        }, 100);
      });
      return;
    }
    
    // Seleção parcial com botão visível
    if (selectedCount > 0 && selectedCount < totalTrips && totalTrips > 1 && hasPreSelectedVisible) {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.textContent = 'Continuar';
      
      newBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        analyticsEvent('Continuar - Confirmar tarifa');
        
        const preSelectedBtn = document.querySelector('[data-pre-select-modified]');
        if (preSelectedBtn) {
          preSelectedBtn.classList.remove('fare-selected-disabled');
          preSelectedBtn.removeAttribute('disabled');
          preSelectedBtn.style.pointerEvents = 'auto';
          preSelectedBtn.click();
          
          setTimeout(() => {
            closeExpandedDetails();
          }, 150);
        }
      });
      return;
    }
    
    // Seleção parcial sem botão visível
    if (selectedCount > 0 && selectedCount < totalTrips && totalTrips > 1) {
      newBtn.disabled = true;
      newBtn.classList.add('disabled');
      
      if (tripStatus.missing === 'ida') newBtn.textContent = 'Selecione a tarifa de ida';
      else if (tripStatus.missing === 'volta') newBtn.textContent = 'Selecione a tarifa de volta';
      else newBtn.textContent = 'Selecione uma tarifa';
      return;
    }
    
    // Pré-seleção ativa
    if (originalButton && !originalButton.userSelected) {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.textContent = 'Continuar';
      
      newBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        analyticsEvent('Continuar - Floating CTA');
        
        originalButton.classList.remove('fare-selected-disabled');
        originalButton.removeAttribute('disabled');
        originalButton.style.pointerEvents = 'auto';
        originalButton.click();
        
        setTimeout(() => {
          closeExpandedDetails();
        }, 150);
        
        setTimeout(() => {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
          updateFooterStyle(false);
        }, 50);
      });
      return;
    }
    
    // Nenhuma tarifa selecionada
    newBtn.disabled = true;
    newBtn.classList.add('disabled');
    newBtn.textContent = 'Selecione uma tarifa';
  }

  // Fecha detalhes expandidos dos voos
  function closeExpandedDetails() {
    // Procura por botões de recolher/fechar detalhes
    const recolherButtons = document.querySelectorAll('button');
    
    recolherButtons.forEach(btn => {
      const text = btn.textContent.toLowerCase().trim();
      // Botão "Recolher" dentro do flight-card
      if (text === 'recolher') {
        const flightCard = btn.closest('.flight-card');
        if (flightCard && flightCard.classList.contains('flight-card--opened')) {
          btn.click();
        }
      }
    });
    
    // Também procura por aria-pressed="true" nos botões de expandir
    const expandedButtons = document.querySelectorAll('.btn-fare[aria-pressed="true"]');
    expandedButtons.forEach(btn => {
      const text = btn.textContent.toLowerCase().trim();
      if (text === 'recolher') {
        btn.click();
      }
    });
  }

  // Cria o CTA flutuante
  function createFloatingCTA(originalButton) {
    let existingCTA = document.querySelector('.pre-select-floating-cta');
    
    if (existingCTA) {
      updateFloatingCTAState(existingCTA, originalButton);
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
    
    wrapperDiv.appendChild(continueButton);
    floatingDiv.appendChild(wrapperDiv);
    document.body.appendChild(floatingDiv);
    
    updateFloatingCTAState(floatingDiv, originalButton);
    return floatingDiv;
  }

  // Aplica pré-seleção
  function applySelection() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    
    // Voo simples
    if (tripContainers.length === 0) {
      if (checkIfFareAlreadySelected()) return false;
      
      const fareItems = getVisibleFareItemsByTrip(true);
      const allFares = fareItems.ida.concat(fareItems.volta).concat(fareItems.desconhecido);
      const mostExpensive = findMostExpensiveFromList(allFares, 'SIMPLES');
      if (!mostExpensive) return false;
      
      const btn = modifyExpensiveFareButton(mostExpensive);
      if (!btn) return false;
      
      createFloatingCTA(btn);
      return true;
    }
    
    // Ida e volta
    const fareItems = getVisibleFareItemsByTrip(true);
    
    let idaSelected = false;
    let voltaSelected = false;
    
    tripContainers.forEach(container => {
      const isIda = container.className.indexOf('trip-index-0') !== -1;
      const isVolta = container.className.indexOf('trip-index-1') !== -1;
      
      if (isIda && checkIfFareAlreadySelected(container)) idaSelected = true;
      if (isVolta && checkIfFareAlreadySelected(container)) voltaSelected = true;
    });
    
    let appliedSelections = [];
    
    // Processa IDA
    if (!idaSelected && fareItems.ida.length > 0) {
      const existing = fareItems.ida.find(item => item.classList.contains('fare-item-highlighted'));
      if (existing) {
        const btn = existing.querySelector('[data-pre-select-modified]');
        if (btn) appliedSelections.push(btn);
      } else {
        const mostExpensive = findMostExpensiveFromList(fareItems.ida, 'IDA');
        if (mostExpensive) {
          const btn = modifyExpensiveFareButton(mostExpensive);
          if (btn) {
            console.log('[PreSelectFare] Pré-seleção aplicada na IDA');
            appliedSelections.push(btn);
          }
        }
      }
    }
    
    // Processa VOLTA
    if (!voltaSelected && fareItems.volta.length > 0) {
      const existing = fareItems.volta.find(item => item.classList.contains('fare-item-highlighted'));
      if (existing) {
        const btn = existing.querySelector('[data-pre-select-modified]');
        if (btn) appliedSelections.push(btn);
      } else {
        const mostExpensive = findMostExpensiveFromList(fareItems.volta, 'VOLTA');
        if (mostExpensive) {
          const btn = modifyExpensiveFareButton(mostExpensive);
          if (btn) {
            console.log('[PreSelectFare] Pré-seleção aplicada na VOLTA');
            appliedSelections.push(btn);
          }
        }
      }
    }
    
    if (appliedSelections.length > 0) {
      createFloatingCTA(appliedSelections[0]);
      return true;
    }
    
    return false;
  }

  // Reseta seleção atual
  function resetCurrentSelection() {
    const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
    modifiedButtons.forEach(btn => {
      btn.removeAttribute('data-pre-select-modified');
      btn.classList.remove('fare-selected-disabled');
      btn.removeAttribute('disabled');
      btn.style.pointerEvents = '';
      const originalText = btn.getAttribute('data-original-text');
      const texts = btn.querySelectorAll('.button__text, .button__text--mobile');
      texts.forEach(t => t.textContent = originalText || 'Selecionar tarifa');
      btn.removeAttribute('data-original-text');
    });
    
    document.querySelectorAll('.fare-item-highlighted').forEach(item => item.classList.remove('fare-item-highlighted'));
    
    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (floatingCTA) floatingCTA.style.display = 'none';
    
    document.body.classList.remove('pre-select-fare-active');
    updateFooterStyle(false);
    lastApplyAttempt = null;
    lastCTAState = null;
    consecutiveFailedAttempts = 0;
  }

  // Verifica visibilidade das tarifas
  function checkFaresVisibility() {
    if (isProcessingChange) return;
    
    if (!isInFirstStep()) {
      const floatingCTA = document.querySelector('.pre-select-floating-cta');
      if (floatingCTA) {
        floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
        updateFooterStyle(false);
      }
      return;
    }
    
    const fareItems = getVisibleFareItemsByTrip(false);
    const totalVisible = fareItems.ida.length + fareItems.volta.length + fareItems.desconhecido.length;
    
    if (totalVisible === 0) {
      if (lastVisibilityState !== false) {
        lastVisibilityState = false;
        currentFareContext = null;
        lastApplyAttempt = null;
        lastCTAState = null;
        consecutiveFailedAttempts = 0;
        const floatingCTA = document.querySelector('.pre-select-floating-cta');
        if (floatingCTA) updateFloatingCTAState(floatingCTA, null);
      }
      return;
    }

    const modifiedButton = document.querySelector('[data-pre-select-modified]');
    const isModifiedVisible = modifiedButton ? modifiedButton.getBoundingClientRect().height > 0 : false;
    
    let floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (!floatingCTA) floatingCTA = createFloatingCTA(null);

    const selectedCount = countSelectedFares();
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    const totalTrips = tripContainers.length || 1;
    
    // Todas selecionadas
    if (selectedCount >= totalTrips && selectedCount > 0) {
      const currentState = 'all_selected_' + selectedCount;
      if (lastCTAState !== currentState) {
        console.log('[PreSelectFare] Todas tarifas selecionadas');
        lastCTAState = currentState;
        consecutiveFailedAttempts = 0;
        updateFloatingCTAState(floatingCTA, { allSelected: true });
      }
      return;
    }

    const newContext = getFareContextHash();
    
    // Reseta se botão não visível
    if (modifiedButton && !isModifiedVisible) {
      modifiedButton.removeAttribute('data-pre-select-modified');
      modifiedButton.classList.remove('fare-selected-disabled');
      modifiedButton.removeAttribute('disabled');
      modifiedButton.style.pointerEvents = '';
      
      const fareItem = modifiedButton.closest('.fare-item');
      if (fareItem) fareItem.classList.remove('fare-item-highlighted');
      
      lastApplyAttempt = null;
      lastCTAState = null;
      consecutiveFailedAttempts = 0;
    }
    
    // Detecta mudança de contexto
    if (currentFareContext && currentFareContext !== newContext && modifiedButton && isModifiedVisible) {
      console.log('[PreSelectFare] Contexto mudou - reaplicando');
      isProcessingChange = true;
      resetCurrentSelection();
      currentFareContext = newContext;
      
      setTimeout(() => {
        applySelection();
        currentFareContext = getFareContextHash();
        lastVisibilityState = true;
        lastApplyAttempt = currentFareContext;
        isProcessingChange = false;
        
        const btn = document.querySelector('[data-pre-select-modified]');
        updateFloatingCTAState(floatingCTA, btn);
      }, 100);
      return;
    }

    // Verifica necessidade de aplicar seleção
    let idaSelected = false;
    let voltaSelected = false;
    
    tripContainers.forEach(container => {
      const isIda = container.className.indexOf('trip-index-0') !== -1;
      const isVolta = container.className.indexOf('trip-index-1') !== -1;
      
      if (isIda && checkIfFareAlreadySelected(container)) idaSelected = true;
      if (isVolta && checkIfFareAlreadySelected(container)) voltaSelected = true;
    });
    
    const idaNeedsSelection = !idaSelected && fareItems.ida.length > 0;
    const voltaNeedsSelection = !voltaSelected && fareItems.volta.length > 0;
    const hasUnselected = idaNeedsSelection || voltaNeedsSelection;
    
    if (!(modifiedButton && isModifiedVisible) && hasUnselected) {
      if (consecutiveFailedAttempts >= 5) {
        if (newContext !== lastApplyAttempt) {
          consecutiveFailedAttempts = 0;
          lastApplyAttempt = null;
        } else {
          updateFloatingCTAState(floatingCTA, null);
          return;
        }
      }
      
      const applied = applySelection();
      
      if (!applied) consecutiveFailedAttempts++;
      else consecutiveFailedAttempts = 0;
      
      currentFareContext = getFareContextHash();
      lastVisibilityState = true;
      lastApplyAttempt = currentFareContext;
      lastCTAState = null;
      
      const btn = applied ? document.querySelector('[data-pre-select-modified]') : null;
      updateFloatingCTAState(floatingCTA, btn);
      return;
    }

    // Já tem seleção válida
    currentFareContext = newContext;
    if (lastVisibilityState !== true || (modifiedButton && isModifiedVisible)) {
      lastVisibilityState = true;
      lastCTAState = null;
      consecutiveFailedAttempts = 0;
      updateFloatingCTAState(floatingCTA, modifiedButton);
    }
  }

  // Configura observer principal
  function setupObserver() {
    if (window._preSelectFareObserver) return;
    
    let debounceTimer = null;
    const observer = new MutationObserver((mutations) => {
      if (isProcessingChange) return;

      // Filtra mudanças causadas pela própria barra flutuante
      const shouldIgnore = mutations.some(mutation => {
        // Ignora mudanças de atributos na barra flutuante ou dentro dela
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target.nodeType === 1) {
            if (target.classList?.contains('pre-select-floating-cta') ||
                target.classList?.contains('floating-continue-btn') ||
                target.closest('.pre-select-floating-cta')) {
              return true;
            }
          }
        }
        
        // Ignora adição/remoção da barra flutuante
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);
          
          const hasFloatingCTA = addedNodes.some(node => 
            node.nodeType === 1 && 
            (node.classList?.contains('pre-select-floating-cta') || 
             node.querySelector?.('.pre-select-floating-cta'))
          );
          
          const removedFloatingCTA = removedNodes.some(node =>
            node.nodeType === 1 &&
            (node.classList?.contains('pre-select-floating-cta') ||
             node.querySelector?.('.pre-select-floating-cta'))
          );
          
          return hasFloatingCTA || removedFloatingCTA;
        }
        
        return false;
      });

      if (shouldIgnore) {
        return; // Ignora todas mudanças da barra flutuante
      }

      if (!isInitialized) {
        const fareItems = document.querySelectorAll('.fare-item');
        if (fareItems.length > 0) {
          isInitialized = true;
          checkFaresVisibility();
        }
        return;
      }

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkFaresVisibility, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });

    window._preSelectFareObserver = observer;
  }

  // Configura observer do calendário
  function setupCalendarObserver() {
    if (calendarObserver) return;
    
    calendarObserver = new MutationObserver(() => {
      const priceCalendar = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
      
      if (priceCalendar && isSecondStep) {
        console.log('[PreSelectFare] Retornando da segunda etapa');
        
        isSecondStep = false;
        isInitialized = false;
        isProcessingChange = false;
        currentFareContext = null;
        lastVisibilityState = null;
        consecutiveFailedAttempts = 0;
        
        resetCurrentSelection();
        
        setTimeout(() => {
          const fareItems = document.querySelectorAll('.fare-item');
          if (fareItems.length > 0) {
            isInitialized = true;
            checkFaresVisibility();
          }
        }, 150);
      }
    });
    
    calendarObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label']
    });
  }

  // Inicialização
  function init() {
    injectStyles();
    setupObserver();
    setupCalendarObserver();

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

  // Polling para carregamento dinâmico
  let pollCount = 0;
  const pollInterval = setInterval(() => {
    pollCount++;
    if (pollCount >= 40 || isInitialized) {
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