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
        background: #FFFFFF;
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
      .pre-select-floating-cta .floating-continue-btn:hover:not(:disabled) {
        background: rgb(1, 78, 132);
      }
      .pre-select-floating-cta .floating-continue-btn:disabled,
      .pre-select-floating-cta .floating-continue-btn.disabled {
        background: #E8E8E8 !important;
        color: #999999 !important;
        cursor: not-allowed !important;
        opacity: 0.7;
      }
      .fare-selected-disabled {
        background: #E8E8E8 !important;
        color: #666666 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
        opacity: 0.8 !important;
        border: solid 2px rgb(0, 128, 88) !important;
      }
      .fare-selected-disabled .button__text,
      .fare-selected-disabled .button__text--mobile {
        color: #666666 !important;
      }
      .fare-item-highlighted {
        position: relative;
        border: 1px solid #026CB6 !important;
        margin-top: 3px;
        background: rgba(2, 108, 182, 0.04);
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

  // FUNÇÃO INTELIGENTE: Detecta se estamos na PRIMEIRA etapa
  function isInFirstStep() {
    const priceCalendarElement = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
    const fareItems = document.querySelectorAll('.fare-item');
    const hasBookingCalendar = document.querySelector('.booking-calendar__cards');
    return !!(priceCalendarElement || (fareItems.length > 0 && hasBookingCalendar));
  }

  function checkIfFareAlreadySelected(tripContainer = null) {
    const searchScope = tripContainer || document;
    
    const alterarTarifaButton = searchScope.querySelector('[aria-label*="Alterar esta tarifa"]');
    const tarifaSelecionadaText = searchScope.querySelector('.css-ou6pmp');
    if (alterarTarifaButton || tarifaSelecionadaText) {
      return true;
    }

    const selectedIndicators = [
      '.fare-item.selected',
      '.fare-item.active', 
      '.fare-item [aria-selected="true"]',
      '.fare-item.is-selected',
      '.fare-item .selected'
    ];

    for (const selector of selectedIndicators) {
      const selected = searchScope.querySelector(selector);
      if (selected && !selected.hasAttribute('data-pre-select-modified')) {
        return true;
      }
    }

    const elementsInScope = searchScope.querySelectorAll('*');
    for (const element of elementsInScope) {
      if (element.textContent && element.textContent.trim() === 'Tarifa selecionada') {
        return true;
      }
    }

    const disabledButtons = searchScope.querySelectorAll('[data-test-id="select-fare"][disabled]');
    for (const btn of disabledButtons) {
      if (btn.hasAttribute('data-pre-select-modified')) continue;
      const buttonText = btn.textContent.toLowerCase();
      if (buttonText.includes('esgotada')) continue;
      return true;
    }

    return false;
  }

  function findMostExpensiveFare(tripContainer = null) {
    const searchScope = tripContainer || document;
    const fareItems = searchScope.querySelectorAll('.fare-item');
    
    if (!fareItems.length) return null;
    
    const existingModifiedFare = searchScope.querySelector('.fare-item-highlighted');
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

  function checkForUserSelectedFares() {
    const userSelectedFares = [];
    
    const alterarTarifaButtons = document.querySelectorAll('[aria-label*="Alterar esta tarifa"]');
    alterarTarifaButtons.forEach(button => {
      const tripContainer = button.closest('[class*="trip-index"]');
      if (!tripContainer) {
        userSelectedFares.push({
          type: 'alterar_tarifa',
          element: button
        });
      }
    });

    const mainContinueButtons = document.querySelectorAll('button, [role="button"]');
    let hasMainContinueButton = false;
    
    for (const btn of mainContinueButtons) {
      const text = btn.textContent.toLowerCase().trim();
      if ((text === 'continuar' || text === 'próximo' || text === 'prosseguir') && 
          !btn.closest('[class*="trip-index"]') &&
          !btn.closest('.pre-select-floating-cta')) {
        const rect = btn.getBoundingClientRect();
        if (rect.height > 0 && window.getComputedStyle(btn).display !== 'none') {
          hasMainContinueButton = true;
          break;
        }
      }
    }
    
    if (hasMainContinueButton) {
      userSelectedFares.push({
        type: 'main_continue_button',
        element: null
      });
    }

    return userSelectedFares;
  }

  // NOVA FUNÇÃO: Detecta quantas tarifas estão selecionadas
  function countSelectedFares() {
    let selectedCount = 0;
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    
    if (tripContainers.length > 0) {
      // Verifica cada trecho separadamente
      tripContainers.forEach((container) => {
        if (checkIfFareAlreadySelected(container) || 
            container.querySelector('[data-pre-select-modified]')) {
          selectedCount++;
        }
      });
    } else {
      // Fallback para voo simples
      if (checkIfFareAlreadySelected() || 
          document.querySelector('[data-pre-select-modified]')) {
        selectedCount = 1;
      }
    }
    
    return selectedCount;
  }

  // NOVA FUNÇÃO: Verifica se há detalhes expandidos que podem ser recolhidos
  function hasExpandedDetails() {
    // Verifica se há seções de detalhes abertas/expandidas
    const expandedSections = document.querySelectorAll('[aria-expanded="true"]');
    const detailsOpen = document.querySelectorAll('.details-open, .expanded, .show-details');
    
    return expandedSections.length > 0 || detailsOpen.length > 0;
  }

  // NOVA FUNÇÃO: Recolhe detalhes expandidos
  function collapseDetails() {
    // Procura por botões que fecham detalhes
    const collapseButtons = document.querySelectorAll('[aria-expanded="true"], button[aria-label*="Recolher"], button[aria-label*="Fechar"]');
    
    collapseButtons.forEach(button => {
      if (button.getAttribute('aria-expanded') === 'true') {
        button.click();
        console.log('[PreSelectFare] Recolheu seção expandida');
      }
    });

    // Procura por elementos que podem ter detalhes abertos
    const detailsElements = document.querySelectorAll('.fare-details.open, .booking-details.expanded');
    detailsElements.forEach(element => {
      const closeButton = element.querySelector('button, [role="button"]');
      if (closeButton) {
        closeButton.click();
        console.log('[PreSelectFare] Fechou detalhes');
      }
    });
  }

  function updateFloatingCTAState(floatingCTA, originalButton) {
    if (!floatingCTA) return;
    
    const continueButton = floatingCTA.querySelector('.floating-continue-btn');
    if (!continueButton) return;

    const newContinueButton = continueButton.cloneNode(true);
    continueButton.parentNode.replaceChild(newContinueButton, continueButton);
    
    floatingCTA.style.display = 'flex';
    document.body.classList.add('pre-select-fare-active');

    // NOVA LÓGICA: Conta tarifas selecionadas
    const selectedFaresCount = countSelectedFares();
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    const totalTrips = tripContainers.length || 1;
    const hasExpanded = hasExpandedDetails();
    
    console.log('[PreSelectFare] Tarifas selecionadas: ' + selectedFaresCount + '/' + totalTrips);
    
    // CASO 1: Todas as tarifas selecionadas - botão ativo "Continuar"
    if (selectedFaresCount >= totalTrips) {
      newContinueButton.disabled = false;
      newContinueButton.classList.remove('disabled');
      newContinueButton.textContent = 'Continuar';
      
      let isProcessing = false;
      newContinueButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        isProcessing = true;
        
        analyticsEvent('Continuar - Todas tarifas selecionadas');
        
        // Procura pelo botão principal "Continuar" da página
        const mainContinueButtons = document.querySelectorAll('button, [role="button"]');
        let foundMainContinue = null;
        
        for (const btn of mainContinueButtons) {
          const text = btn.textContent.toLowerCase().trim();
          if ((text === 'continuar' || text === 'prosseguir' || text.includes('próxim')) && 
              !btn.closest('.pre-select-floating-cta') &&
              !btn.hasAttribute('disabled')) {
            const rect = btn.getBoundingClientRect();
            if (rect.height > 0 && window.getComputedStyle(btn).display !== 'none') {
              foundMainContinue = btn;
              break;
            }
          }
        }
        
        if (foundMainContinue) {
          console.log('[PreSelectFare] Clicando no botão principal "Continuar"');
          foundMainContinue.click();
        } else {
          console.log('[PreSelectFare] Botão principal "Continuar" não encontrado');
        }
        
        setTimeout(() => {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
        }, 100);
      });
      return;
    }
    
    // CASO 2: NOVA LÓGICA - Seleção parcial (ex: 1/2 tarifas) - "Continuar" para recolher detalhes
    if (selectedFaresCount > 0 && selectedFaresCount < totalTrips && totalTrips > 1) {
      newContinueButton.disabled = false;
      newContinueButton.classList.remove('disabled');
      newContinueButton.textContent = 'Continuar';
      
      let isProcessing = false;
      newContinueButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        isProcessing = true;
        
        analyticsEvent('Continuar - Recolher detalhes para focar próxima tarifa');
        
        // ESTRATÉGIA: Clica em "Alterar tarifa" para recolher os detalhes
        const alterarTarifaButtons = document.querySelectorAll('[aria-label*="Alterar esta tarifa"]');
        let foundAlterarButton = null;
        
        // Primeiro, tenta encontrar "Alterar tarifa" da IDA (trip-index-0)
        for (const btn of alterarTarifaButtons) {
          const tripContainer = btn.closest('[class*="trip-index-0"]');
          if (tripContainer) {
            foundAlterarButton = btn;
            console.log('[PreSelectFare] Encontrou "Alterar tarifa" na IDA');
            break;
          }
        }
        
        // Se não achou na ida, procura em qualquer lugar
        if (!foundAlterarButton && alterarTarifaButtons.length > 0) {
          foundAlterarButton = alterarTarifaButtons[0];
          console.log('[PreSelectFare] Encontrou "Alterar tarifa" geral');
        }
        
        if (foundAlterarButton) {
          console.log('[PreSelectFare] Clicando em "Alterar tarifa" para recolher detalhes e focar na próxima seleção');
          foundAlterarButton.click();
        } else {
          // Fallback: tenta recolher detalhes expandidos
          console.log('[PreSelectFare] "Alterar tarifa" não encontrado, tentando recolher detalhes');
          collapseDetails();
        }
        
        // Aguarda um momento e verifica novamente o estado
        setTimeout(() => {
          isProcessing = false;
          checkFaresVisibility(); // Revalida o estado
        }, 500);
      });
      return;
    }
    
    // CASO 3: Pelo menos uma tarifa selecionada + detalhes expandidos - "Recolher detalhes"
    if (selectedFaresCount > 0 && hasExpanded) {
      newContinueButton.disabled = false;
      newContinueButton.classList.remove('disabled');
      newContinueButton.textContent = 'Recolher detalhes';
      
      let isProcessing = false;
      newContinueButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        isProcessing = true;
        
        analyticsEvent('Recolher detalhes');
        
        collapseDetails();
        
        // Aguarda um momento e verifica novamente o estado
        setTimeout(() => {
          isProcessing = false;
          checkFaresVisibility(); // Revalida o estado
        }, 500);
      });
      return;
    }
    
    // CASO 4: Tarifa selecionada pelo usuário (sem pré-seleção do script)
    if (originalButton && originalButton.userSelected) {
      newContinueButton.disabled = false;
      newContinueButton.classList.remove('disabled');
      newContinueButton.textContent = 'Continuar';
      
      let isProcessing = false;
      newContinueButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        isProcessing = true;
        
        analyticsEvent('Continuar - Com tarifa do usuário');
        
        const alterarTarifaButtons = document.querySelectorAll('[aria-label*="Alterar esta tarifa"]');
        let foundAlterarButton = null;
        
        for (const btn of alterarTarifaButtons) {
          const tripContainer = btn.closest('[class*="trip-index-0"]');
          if (tripContainer) {
            foundAlterarButton = btn;
            break;
          }
        }
        
        if (!foundAlterarButton && alterarTarifaButtons.length > 0) {
          foundAlterarButton = alterarTarifaButtons[0];
        }
        
        if (foundAlterarButton) {
          console.log('[PreSelectFare] Clicando em "Alterar tarifa" para mostrar mais opções');
          foundAlterarButton.click();
        } else {
          const continueButtons = document.querySelectorAll('button, [role="button"]');
          let foundContinueButton = null;
          
          for (const btn of continueButtons) {
            const text = btn.textContent.toLowerCase();
            if (text.includes('continuar') || text.includes('próximo') || text.includes('prosseguir')) {
              foundContinueButton = btn;
              break;
            }
          }
          
          if (foundContinueButton) {
            foundContinueButton.click();
          } else {
            console.log('[PreSelectFare] Não encontrou botão para continuar');
          }
        }
        
        setTimeout(() => {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
        }, 50);
      });
      return;
    }
    
    // CASO 5: Pré-seleção do script ativa
    if (originalButton && !originalButton.userSelected) {
      newContinueButton.disabled = false;
      newContinueButton.classList.remove('disabled');
      newContinueButton.textContent = 'Continuar';
      
      let isProcessing = false;
      newContinueButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        isProcessing = true;
        
        analyticsEvent('Continuar - Floating CTA');
        
        originalButton.classList.remove('fare-selected-disabled');
        originalButton.removeAttribute('disabled');
        originalButton.style.pointerEvents = 'auto';
        
        originalButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        originalButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        originalButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        
        setTimeout(() => {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
        }, 50);
      });
    } else {
      // CASO 6: Nenhuma tarifa selecionada - botão inativo
      newContinueButton.disabled = true;
      newContinueButton.classList.add('disabled');
      newContinueButton.textContent = 'Selecione uma tarifa';
    }
  }

  function applySelectionForTrip(tripContainer, tripIndex) {
    if (checkIfFareAlreadySelected(tripContainer)) {
      console.log('[PreSelectFare] Trecho ' + tripIndex + ' já possui tarifa selecionada');
      return false;
    }
    
    const mostExpensiveFare = findMostExpensiveFare(tripContainer);
    if (!mostExpensiveFare) {
      console.log('[PreSelectFare] Nenhuma tarifa encontrada no trecho ' + tripIndex);
      return false;
    }
    
    const originalButton = modifyExpensiveFareButton(mostExpensiveFare);
    if (!originalButton) {
      console.log('[PreSelectFare] Falha ao modificar botão no trecho ' + tripIndex);
      return false;
    }
    
    console.log('[PreSelectFare] Pré-seleção aplicada no trecho ' + tripIndex + ' (tarifa mais cara)');
    return originalButton;
  }

  function applySelection() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    
    if (tripContainers.length === 0) {
      console.log('[PreSelectFare] Não encontrou trip-index, aplicando método padrão');
      if (checkIfFareAlreadySelected()) return false;
      
      const mostExpensiveFare = findMostExpensiveFare();
      if (!mostExpensiveFare) return false;
      
      const originalButton = modifyExpensiveFareButton(mostExpensiveFare);
      if (!originalButton) return false;
      
      const cta = createFloatingCTA(originalButton);
      return !!cta;
    }
    
    let appliedSelections = [];
    let tripProcessedCount = 0;
    
    tripContainers.forEach((container, index) => {
      const tripIndex = container.className.includes('trip-index-0') ? 'ida' : 
                       container.className.includes('trip-index-1') ? 'volta' : 
                       'trecho-' + index;
      
      tripProcessedCount++;
      const selectedButton = applySelectionForTrip(container, tripIndex);
      if (selectedButton) {
        appliedSelections.push(selectedButton);
      }
    });
    
    console.log('[PreSelectFare] Processados ' + tripProcessedCount + ' trechos, aplicadas ' + appliedSelections.length + ' pré-seleções');
    
    if (appliedSelections.length > 0) {
      const cta = createFloatingCTA(appliedSelections[0]);
      return !!cta;
    }
    
    return false;
  }

  function getFareContextHash() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    
    let contextParts = [];
    
    if (tripContainers.length > 0) {
      tripContainers.forEach((container) => {
        const fareItems = container.querySelectorAll('.fare-item');
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
        
        const tripClass = container.className;
        contextParts.push(tripClass + ':' + visiblePrices.join(','));
      });
    } else {
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
      
      contextParts.push('single:' + visiblePrices.join(','));
    }
    
    return contextParts.join('|');
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
    
    lastApplyAttempt = null;
  }

  let lastVisibilityState = null;
  let isInitialized = false;
  let currentFareContext = null;
  let isProcessingChange = false;
  let isSecondStep = false;
  let stepCheckDebounceTimer = null;
  let calendarObserver = null;
  let lastApplyAttempt = null;

  function checkFaresVisibility() {
    if (isProcessingChange) return;
    
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    const hasVisibleFares = visibleFareItems.length > 0;
    const modifiedButton = document.querySelector('[data-pre-select-modified]');

    let floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (!floatingCTA) {
      floatingCTA = createFloatingCTA(null);
    }

    if (!hasVisibleFares) {
      if (lastVisibilityState !== false) {
        lastVisibilityState = false;
        currentFareContext = null;
        lastApplyAttempt = null;
        updateFloatingCTAState(floatingCTA, null);
      }
      return;
    }

    // Verifica o número de tarifas selecionadas
    const selectedCount = countSelectedFares();
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    const totalTrips = tripContainers.length || 1;

    // PRIORIDADE 1: Se todas as tarifas estão selecionadas, mostra CTA ativo
    if (selectedCount >= totalTrips) {
      console.log('[PreSelectFare] Todas as ' + totalTrips + ' tarifas selecionadas - CTA ativo');
      updateFloatingCTAState(floatingCTA, { allSelected: true });
      return;
    }

    const userSelectedFares = checkForUserSelectedFares();
    
    // PRIORIDADE 2: Verifica seleções globais do usuário
    if (userSelectedFares.length > 0 && !modifiedButton) {
      console.log('[PreSelectFare] Detectou ' + userSelectedFares.length + ' indicador(es) de seleção global pelo usuário');
      updateFloatingCTAState(floatingCTA, { userSelected: true });
      return;
    }

    const newFareContext = getFareContextHash();
    const contextChanged = currentFareContext !== null &&
      currentFareContext !== newFareContext &&
      modifiedButton !== null;

    if (contextChanged) {
      console.log('[PreSelectFare] Contexto de tarifas mudou, reaplicando seleções');
      isProcessingChange = true;
      resetCurrentSelection();
      currentFareContext = newFareContext;
      lastApplyAttempt = null;

      setTimeout(() => {
        const selectionApplied = applySelection();
        currentFareContext = getFareContextHash();
        lastVisibilityState = true;
        lastApplyAttempt = currentFareContext;

        setTimeout(() => {
          isProcessingChange = false;
        }, 150);

        const button = selectionApplied ? document.querySelector('[data-pre-select-modified]') : null;
        updateFloatingCTAState(floatingCTA, button);
      }, 100);
      return;
    }

    if (!modifiedButton) {
      if (lastApplyAttempt === newFareContext) {
        console.log('[PreSelectFare] Já tentou aplicar neste contexto - evitando loop');
        
        if (userSelectedFares.length > 0) {
          updateFloatingCTAState(floatingCTA, { userSelected: true });
        } else {
          updateFloatingCTAState(floatingCTA, null);
        }
        return;
      }

      console.log('[PreSelectFare] Aplicando pré-seleção inicial');
      const selectionApplied = applySelection();
      currentFareContext = getFareContextHash();
      lastVisibilityState = true;
      lastApplyAttempt = currentFareContext;

      const button = selectionApplied ? document.querySelector('[data-pre-select-modified]') : null;
      updateFloatingCTAState(floatingCTA, button);
      return;
    }

    currentFareContext = newFareContext;
    if (lastVisibilityState !== true) {
      lastVisibilityState = true;
      updateFloatingCTAState(floatingCTA, modifiedButton);
    }
  }

  function setupObserver() {
    if (window._preSelectFareObserver) return;
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      if (isProcessingChange) return;

      if (!isInitialized) {
        const fareItems = document.querySelectorAll('.fare-item');
        if (fareItems.length > 0) {
          isInitialized = true;
          checkFaresVisibility();
        }
        return;
      }

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

  function setupCalendarObserver() {
    if (calendarObserver) return;
    
    calendarObserver = new MutationObserver((mutations) => {
      const priceCalendar = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
      
      if (priceCalendar && isSecondStep) {
        if (stepCheckDebounceTimer) {
          clearTimeout(stepCheckDebounceTimer);
          stepCheckDebounceTimer = null;
        }
        
        isSecondStep = false;
        isInitialized = false;
        isProcessingChange = false;
        currentFareContext = null;
        lastVisibilityState = null;
        
        resetCurrentSelection();
        
        if (!window._preSelectFareObserver) {
          setupObserver();
        }
        
        setTimeout(() => {
          const fareItems = document.querySelectorAll('.fare-item');
          if (fareItems.length > 0) {
            isInitialized = true;
            checkFaresVisibility();
          } else {
            setTimeout(() => {
              const fareItemsRetry = document.querySelectorAll('.fare-item');
              if (fareItemsRetry.length > 0) {
                isInitialized = true;
                checkFaresVisibility();
              }
            }, 200);
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

  function init() {
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

  let pollCount = 0;
  const maxPolls = 40;
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