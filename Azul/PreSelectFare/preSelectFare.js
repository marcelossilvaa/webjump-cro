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
    
    console.log('[PreSelectFare] findMostExpensiveFare: ' + fareItems.length + ' fare-items encontrados no escopo');
    
    if (!fareItems.length) return null;
    
    const existingModifiedFare = searchScope.querySelector('.fare-item-highlighted');
    if (existingModifiedFare) {
      console.log('[PreSelectFare] Retornando fare-item já modificado');
      return existingModifiedFare;
    }
    
    let maxPrice = -1;
    let mostExpensiveFare = null;
    let validFareCount = 0;
    
    fareItems.forEach((fareItem, index) => {
      console.log('[PreSelectFare] Analisando fare-item ' + index);
      
      // Verifica se é Business
      const fareName = fareItem.querySelector('.promotional, .fare-price p');
      if (fareName) {
        const fareNameText = fareName.textContent.toLowerCase();
        if (fareNameText.includes('business')) {
          console.log('[PreSelectFare] Fare-item ' + index + ' é Business - ignorando');
          return;
        }
      }
      
      // Verifica botão de seleção
      const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
      if (!selectButton) {
        console.log('[PreSelectFare] Fare-item ' + index + ' não tem botão select-fare');
        return;
      }
      
      const buttonText = selectButton.textContent.toLowerCase();
      if (buttonText.includes('esgotada')) {
        console.log('[PreSelectFare] Fare-item ' + index + ' está esgotada');
        return;
      }
      
      // Verifica preço
      const priceElement = fareItem.querySelector('[data-test-id="fare-price"]');
      if (!priceElement) {
        console.log('[PreSelectFare] Fare-item ' + index + ' não tem elemento de preço');
        return;
      }
      
      const rawText = priceElement.textContent;
      const priceText = rawText
        .replace(/[^\d.,]/g, '')
        .replace(/\.(?=\d{3})/g, '')
        .replace(',', '.');
      const price = parseFloat(priceText);
      
      if (isNaN(price)) {
        console.log('[PreSelectFare] Fare-item ' + index + ' tem preço inválido: "' + rawText + '"');
        return;
      }
      
      validFareCount++;
      console.log('[PreSelectFare] Fare-item ' + index + ' válido - preço: ' + price);
      
      if (price > maxPrice) {
        maxPrice = price;
        mostExpensiveFare = fareItem;
        console.log('[PreSelectFare] Nova tarifa mais cara encontrada: ' + price);
      }
    });
    
    console.log('[PreSelectFare] Resultado: ' + validFareCount + ' tarifas válidas, mais cara: ' + (mostExpensiveFare ? maxPrice : 'nenhuma'));
    
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
        // CORREÇÃO: Verifica se há fare-items VISÍVEIS neste container
        // Se não há fare-items visíveis, não podemos contar como "selecionado pelo script"
        const fareItemsInContainer = container.querySelectorAll('.fare-item');
        const hasVisibleFareItems = Array.from(fareItemsInContainer).some(item => {
          const rect = item.getBoundingClientRect();
          const style = window.getComputedStyle(item);
          return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        // Só conta pré-seleção do script se os fare-items estão visíveis
        const preSelectedInContainer = container.querySelector('[data-pre-select-modified]');
        const hasPreSelection = preSelectedInContainer && hasVisibleFareItems;
        
        if (checkIfFareAlreadySelected(container) || hasPreSelection) {
          selectedCount++;
        }
      });
    } else {
      // Fallback para voo simples (sem trip-index)
      // CORREÇÃO: Verifica se há fare-items VISÍVEIS
      const fareItems = document.querySelectorAll('.fare-item');
      const hasVisibleFareItems = Array.from(fareItems).some(item => {
        const rect = item.getBoundingClientRect();
        const style = window.getComputedStyle(item);
        return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      // Só conta pré-seleção se os fare-items estão visíveis
      const preSelected = document.querySelector('[data-pre-select-modified]');
      const hasPreSelection = preSelected && hasVisibleFareItems;
      
      if (checkIfFareAlreadySelected() || hasPreSelection) {
        selectedCount = 1;
      }
    }
    
    console.log('[PreSelectFare] countSelectedFares: ' + selectedCount + ' (trip-index containers: ' + tripContainers.length + ')');
    
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
        // console.log('[PreSelectFare] Recolheu seção expandida');
      }
    });

    // Procura por elementos que podem ter detalhes abertos
    const detailsElements = document.querySelectorAll('.fare-details.open, .booking-details.expanded');
    detailsElements.forEach(element => {
      const closeButton = element.querySelector('button, [role="button"]');
      if (closeButton) {
        closeButton.click();
        // console.log('[PreSelectFare] Fechou detalhes');
      }
    });
  }

  // NOVA FUNÇÃO: Verifica se os detalhes da tarifa estão EXPANDIDOS (mostrando fare-items)
  function hasFareDetailsExpanded() {
    // Verifica se há fare-items visíveis na tela (significa que os detalhes estão expandidos)
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    return visibleFareItems.length > 0;
  }

  // NOVA FUNÇÃO: Verifica se há um botão pré-selecionado VISÍVEL para clicar
  function hasVisiblePreSelectedButton() {
    const preSelectedButton = document.querySelector('[data-pre-select-modified]');
    if (!preSelectedButton) return false;
    
    const rect = preSelectedButton.getBoundingClientRect();
    const style = window.getComputedStyle(preSelectedButton);
    return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }

  // NOVA FUNÇÃO: Identifica qual trecho ainda precisa ser selecionado
  function getMissingTripSelection() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    
    if (tripContainers.length === 0) {
      return { missing: 'tarifa', idaSelected: false, voltaSelected: false };
    }
    
    let idaSelected = false;
    let voltaSelected = false;
    
    tripContainers.forEach((container) => {
      const isIda = container.className.includes('trip-index-0');
      const isVolta = container.className.includes('trip-index-1');
      
      const hasSelection = checkIfFareAlreadySelected(container) || 
                          container.querySelector('[data-pre-select-modified]');
      
      if (isIda && hasSelection) {
        idaSelected = true;
      }
      if (isVolta && hasSelection) {
        voltaSelected = true;
      }
    });
    
    // Determina qual está faltando
    let missing = null;
    if (!idaSelected && !voltaSelected) {
      missing = 'ambas';
    } else if (!idaSelected) {
      missing = 'ida';
    } else if (!voltaSelected) {
      missing = 'volta';
    } else {
      missing = null; // Todas selecionadas
    }
    
    return { missing, idaSelected, voltaSelected };
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
    const hasFareDetailsVisible = hasFareDetailsExpanded();
    const hasPreSelectedVisible = hasVisiblePreSelectedButton();
    
    // NOVA: Obtém informação sobre qual trecho está faltando
    const tripStatus = getMissingTripSelection();
    
    // console.log('[PreSelectFare] Tarifas selecionadas: ' + selectedFaresCount + '/' + totalTrips + ' | Ida: ' + tripStatus.idaSelected + ' | Volta: ' + tripStatus.voltaSelected);
    
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
        
        const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
        const userSelectedButtons = document.querySelectorAll('[data-test-id="select-fare"][disabled]');
        
        let buttonsToClick = [];
        
        modifiedButtons.forEach(btn => {
          if (!btn.hasAttribute('disabled') || btn.hasAttribute('data-pre-select-modified')) {
            buttonsToClick.push(btn);
          }
        });
        
        if (buttonsToClick.length === 0) {
          userSelectedButtons.forEach(btn => {
            if (!btn.hasAttribute('data-pre-select-modified')) {
              const buttonText = btn.textContent.toLowerCase();
              if (!buttonText.includes('esgotada')) {
                buttonsToClick.push(btn);
              }
            }
          });
        }
        
        if (buttonsToClick.length > 0) {
          const firstButton = buttonsToClick[0];
          console.log('[PreSelectFare] Clicando no botão de tarifa selecionada');
          
          if (firstButton.hasAttribute('data-pre-select-modified')) {
            firstButton.classList.remove('fare-selected-disabled');
            firstButton.removeAttribute('disabled');
            firstButton.style.pointerEvents = 'auto';
          }
          
          firstButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
          firstButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
          firstButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          
        } else {
          console.log('[PreSelectFare] Nenhum botão de tarifa encontrado para clicar');
        }
        
        setTimeout(() => {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
          isProcessing = false;
        }, 100);
      });
      return;
    }
    
    // CASO 2: Seleção parcial (ex: 1/2 tarifas)
    if (selectedFaresCount > 0 && selectedFaresCount < totalTrips && totalTrips > 1) {
      
      // CASO 2A: Se há botão pré-selecionado VISÍVEL, permite clicar para confirmar
      if (hasPreSelectedVisible) {
        newContinueButton.disabled = false;
        newContinueButton.classList.remove('disabled');
        newContinueButton.textContent = 'Continuar';
        
        let isProcessing = false;
        newContinueButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isProcessing) return;
          isProcessing = true;
          
          analyticsEvent('Continuar - Confirmar tarifa selecionada');
          
          const preSelectedButton = document.querySelector('[data-pre-select-modified]');
          
          if (preSelectedButton) {
            console.log('[PreSelectFare] Clicando no botão de tarifa pré-selecionada para confirmar');
            
            preSelectedButton.classList.remove('fare-selected-disabled');
            preSelectedButton.removeAttribute('disabled');
            preSelectedButton.style.pointerEvents = 'auto';
            
            preSelectedButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            preSelectedButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            preSelectedButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          }
          
          setTimeout(() => {
            isProcessing = false;
          }, 300);
        });
        return;
      }
      
      // CASO 2B: Tarifa selecionada mas detalhes recolhidos - botão DESABILITADO
      // NOVA LÓGICA: Texto dinâmico baseado em qual trecho está faltando
      newContinueButton.disabled = true;
      newContinueButton.classList.add('disabled');
      
      // Define o texto baseado em qual trecho está faltando
      if (tripStatus.missing === 'ida') {
        newContinueButton.textContent = 'Selecione a tarifa de ida';
        console.log('[PreSelectFare] Tarifa da volta selecionada, aguardando seleção da ida');
      } else if (tripStatus.missing === 'volta') {
        newContinueButton.textContent = 'Selecione a tarifa de volta';
        console.log('[PreSelectFare] Tarifa da ida selecionada, aguardando seleção da volta');
      } else {
        newContinueButton.textContent = 'Selecione uma tarifa';
        console.log('[PreSelectFare] Aguardando seleção de tarifa');
      }
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
        const visibleFareItems = Array.from(fareItems).filter(item => {
          const rect = item.getBoundingClientRect();
          const style = window.getComputedStyle(item);
          return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        // CORREÇÃO: Incluir a QUANTIDADE de fare-items visíveis no hash
        // Isso garante que quando detalhes abrem/fecham, o contexto muda
        const visibleCount = visibleFareItems.length;
        
        const visiblePrices = visibleFareItems
          .map(item => {
            const priceEl = item.querySelector('[data-test-id="fare-price"]');
            return priceEl ? priceEl.textContent.trim().replace(/\s+/g, '') : '';
          })
          .filter(price => price)
          .sort();
        
        const tripClass = container.className;
        // Adiciona contagem de itens visíveis ao hash
        contextParts.push(tripClass + ':count=' + visibleCount + ':' + visiblePrices.join(','));
      });
    } else {
      const fareItems = document.querySelectorAll('.fare-item');
      const visibleFareItems = Array.from(fareItems).filter(item => {
        const rect = item.getBoundingClientRect();
        const style = window.getComputedStyle(item);
        return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      const visibleCount = visibleFareItems.length;
      const visiblePrices = visibleFareItems
        .map(item => {
          const priceEl = item.querySelector('[data-test-id="fare-price"]');
          return priceEl ? priceEl.textContent.trim().replace(/\s+/g, '') : '';
        })
        .filter(price => price)
        .sort();
      
      contextParts.push('single:count=' + visibleCount + ':' + visiblePrices.join(','));
    }
    
    return contextParts.join('|');
  }

  let lastVisibilityState = null;
  let isInitialized = false;
  let currentFareContext = null;
  let isProcessingChange = false;
  let isSecondStep = false;
  let stepCheckDebounceTimer = null;
  let calendarObserver = null;
  let lastApplyAttempt = null;
  let lastCTAState = null;
  let consecutiveFailedAttempts = 0; // NOVA: Contador de tentativas falhadas

  function checkFaresVisibility() {
    if (isProcessingChange) return;
    
    // NOVA VERIFICAÇÃO: Se não está na primeira etapa, oculta o CTA e para a execução
    if (!isInFirstStep()) {
      const floatingCTA = document.querySelector('.pre-select-floating-cta');
      if (floatingCTA) {
        floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
      }
      return;
    }
    
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    const hasVisibleFares = visibleFareItems.length > 0;
    const modifiedButton = document.querySelector('[data-pre-select-modified]');
    
    // NOVA: Verifica se o botão modificado ainda está visível
    const isModifiedButtonVisible = modifiedButton ? (function() {
      const rect = modifiedButton.getBoundingClientRect();
      const style = window.getComputedStyle(modifiedButton);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    })() : false;

    let floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (!floatingCTA) {
      floatingCTA = createFloatingCTA(null);
    }

    if (!hasVisibleFares) {
      if (lastVisibilityState !== false) {
        lastVisibilityState = false;
        currentFareContext = null;
        lastApplyAttempt = null;
        lastCTAState = null;
        consecutiveFailedAttempts = 0; // Reset contador
        updateFloatingCTAState(floatingCTA, null);
      }
      return;
    }

    // Verifica o número de tarifas selecionadas
    const selectedCount = countSelectedFares();
    
    // CORREÇÃO: Detecta corretamente o número total de trechos
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    let totalTrips = tripContainers.length;
    
    // Se não há trip-index, verifica se é voo simples
    if (totalTrips === 0) {
      totalTrips = 1;
    }
    
    console.log('[PreSelectFare] Estado: ' + selectedCount + '/' + totalTrips + ' tarifas | visibleFares: ' + visibleFareItems.length + ' | modifiedButton: ' + !!modifiedButton + ' | modifiedVisible: ' + isModifiedButtonVisible + ' | failedAttempts: ' + consecutiveFailedAttempts);

    // PRIORIDADE 1: Se todas as tarifas estão selecionadas, mostra CTA ativo
    if (selectedCount >= totalTrips && selectedCount > 0) {
      const currentState = 'all_selected_' + selectedCount + '_' + totalTrips;
      
      // PROTEÇÃO: Só atualiza CTA se o estado mudou
      if (lastCTAState !== currentState) {
        console.log('[PreSelectFare] Todas as ' + totalTrips + ' tarifas selecionadas - CTA ativo');
        lastCTAState = currentState;
        consecutiveFailedAttempts = 0; // Reset contador
        updateFloatingCTAState(floatingCTA, { allSelected: true });
      }
      return;
    }

    const userSelectedFares = checkForUserSelectedFares();
    
    // PRIORIDADE 2: Verifica seleções globais do usuário
    if (userSelectedFares.length > 0 && !modifiedButton) {
      const currentState = 'user_selected_' + userSelectedFares.length;
      
      if (lastCTAState !== currentState) {
        console.log('[PreSelectFare] Detectou ' + userSelectedFares.length + ' indicador(es) de seleção global pelo usuário');
        lastCTAState = currentState;
        consecutiveFailedAttempts = 0; // Reset contador
        updateFloatingCTAState(floatingCTA, { userSelected: true });
      }
      return;
    }

    const newFareContext = getFareContextHash();
    
    // CORREÇÃO: Se há botão modificado MAS ele não está visível, precisamos tentar aplicar novamente
    if (modifiedButton && !isModifiedButtonVisible) {
      console.log('[PreSelectFare] Botão modificado existe mas não está visível - resetando para reaplicar');
      modifiedButton.removeAttribute('data-pre-select-modified');
      modifiedButton.classList.remove('fare-selected-disabled');
      modifiedButton.removeAttribute('disabled');
      modifiedButton.style.pointerEvents = '';
      
      const fareItem = modifiedButton.closest('.fare-item');
      if (fareItem) {
        fareItem.classList.remove('fare-item-highlighted');
      }
      
      lastApplyAttempt = null;
      lastCTAState = null;
      consecutiveFailedAttempts = 0; // Reset contador
    }
    
    const contextChanged = currentFareContext !== null &&
      currentFareContext !== newFareContext &&
      modifiedButton !== null &&
      isModifiedButtonVisible;

    if (contextChanged) {
      console.log('[PreSelectFare] Contexto de tarifas mudou, reaplicando seleções');
      isProcessingChange = true;
      resetCurrentSelection();
      currentFareContext = newFareContext;
      lastApplyAttempt = null;
      lastCTAState = null;
      consecutiveFailedAttempts = 0; // Reset contador

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

    // CORREÇÃO: Verifica se NÃO há botão modificado VISÍVEL
    const hasVisibleModifiedButton = modifiedButton && isModifiedButtonVisible;
    
    if (!hasVisibleModifiedButton) {
      // NOVA PROTEÇÃO: Se já tentou aplicar muitas vezes sem sucesso, para de tentar
      if (consecutiveFailedAttempts >= 3) {
        console.log('[PreSelectFare] Muitas tentativas falhadas (' + consecutiveFailedAttempts + ') - parando para evitar loop');
        
        const currentState = 'failed_attempts_' + consecutiveFailedAttempts + '_' + selectedCount;
        
        if (lastCTAState !== currentState) {
          lastCTAState = currentState;
          if (userSelectedFares.length > 0) {
            updateFloatingCTAState(floatingCTA, { userSelected: true });
          } else {
            updateFloatingCTAState(floatingCTA, null);
          }
        }
        return;
      }
      
      if (lastApplyAttempt === newFareContext) {
        const hasAnyPreSelected = document.querySelector('[data-pre-select-modified]');
        const visiblePreSelected = hasAnyPreSelected ? (function() {
          const rect = hasAnyPreSelected.getBoundingClientRect();
          return rect.height > 0;
        })() : false;
        
        if (!visiblePreSelected && visibleFareItems.length > 0) {
          console.log('[PreSelectFare] Há fare-items visíveis sem pré-seleção - forçando aplicação (tentativa ' + (consecutiveFailedAttempts + 1) + ')');
          lastApplyAttempt = null;
        } else {
          console.log('[PreSelectFare] Já tentou aplicar neste contexto - evitando loop');
          
          const currentState = 'loop_protection_' + selectedCount + '_' + userSelectedFares.length;
          
          if (lastCTAState !== currentState) {
            lastCTAState = currentState;
            if (userSelectedFares.length > 0) {
              updateFloatingCTAState(floatingCTA, { userSelected: true });
            } else {
              updateFloatingCTAState(floatingCTA, null);
            }
          }
          return;
        }
      }

      console.log('[PreSelectFare] Aplicando pré-seleção inicial (tentativa ' + (consecutiveFailedAttempts + 1) + ')');
      const selectionApplied = applySelection();
      
      // NOVA LÓGICA: Incrementa contador se não conseguiu aplicar nada
      if (!selectionApplied) {
        consecutiveFailedAttempts++;
        console.log('[PreSelectFare] Falha na aplicação - contador: ' + consecutiveFailedAttempts);
      } else {
        consecutiveFailedAttempts = 0; // Reset se conseguiu aplicar
        console.log('[PreSelectFare] Aplicação bem-sucedida - resetando contador');
      }
      
      currentFareContext = getFareContextHash();
      lastVisibilityState = true;
      lastApplyAttempt = currentFareContext;
      lastCTAState = null;

      const button = selectionApplied ? document.querySelector('[data-pre-select-modified]') : null;
      updateFloatingCTAState(floatingCTA, button);
      return;
    }

    // CASO: Já tem seleção válida e visível
    currentFareContext = newFareContext;
    if (lastVisibilityState !== true) {
      lastVisibilityState = true;
      lastCTAState = null;
      consecutiveFailedAttempts = 0; // Reset contador
      updateFloatingCTAState(floatingCTA, modifiedButton);
    }
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
    lastCTAState = null;
    consecutiveFailedAttempts = 0; // NOVA: Reset contador de tentativas falhadas
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

  function navigateToNextStep() {
    analyticsEvent('Navegacao automatica - Todas tarifas selecionadas');
    
    let foundMainContinue = null;
    
    const specificButtons = document.querySelectorAll('[data-test-id*="continue"], [data-test-id*="next"], [data-test-id*="prosseguir"]');
    for (const btn of specificButtons) {
      if (!btn.closest('.pre-select-floating-cta') && !btn.hasAttribute('disabled') && !btn.disabled) {
        const rect = btn.getBoundingClientRect();
        if (rect.height > 0 && window.getComputedStyle(btn).display !== 'none') {
          foundMainContinue = btn;
          console.log('[PreSelectFare] Encontrou botão específico por data-test-id para navegação automática');
          break;
        }
      }
    }
    
    if (!foundMainContinue) {
      const allButtons = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]');
      
      for (const btn of allButtons) {
        if (btn.closest('.pre-select-floating-cta')) continue;
        if (btn.hasAttribute('disabled') || btn.disabled) continue;
        
        const text = btn.textContent.toLowerCase().trim();
        const value = (btn.value || '').toLowerCase().trim();
        
        if ((text === 'continuar' || value === 'continuar' || 
             text === 'prosseguir' || value === 'prosseguir' ||
             text.includes('próxim') || value.includes('próxim')) &&
            !text.includes('alterar')) {
          
          const rect = btn.getBoundingClientRect();
          const style = window.getComputedStyle(btn);
          
          if (rect.height > 0 && rect.width > 0 && 
              style.display !== 'none' && 
              style.visibility !== 'hidden' && 
              style.opacity !== '0') {
            foundMainContinue = btn;
            console.log('[PreSelectFare] Encontrou botão principal por texto para navegação automática: "' + text + '"');
            break;
          }
        }
      }
    }
    
    if (foundMainContinue) {
      console.log('[PreSelectFare] NAVEGANDO automaticamente - clicando no botão principal');
      
      const floatingCTA = document.querySelector('.pre-select-floating-cta');
      if (floatingCTA) {
        floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
      }
      
      isSecondStep = true;
      
      foundMainContinue.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      foundMainContinue.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      foundMainContinue.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      
      setTimeout(() => {
        if (foundMainContinue && typeof foundMainContinue.click === 'function') {
          foundMainContinue.click();
        }
      }, 50);
      
    } else {
      console.log('[PreSelectFare] ERRO: Não foi possível navegar automaticamente - botão não encontrado');
      
      const allButtons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
      console.log('[PreSelectFare] Botões disponíveis para debug:');
      allButtons.forEach((btn, index) => {
        if (btn.closest('.pre-select-floating-cta')) return;
        const rect = btn.getBoundingClientRect();
        if (rect.height > 0 && window.getComputedStyle(btn).display !== 'none') {
          console.log('[PreSelectFare] Botão ' + index + ': "' + btn.textContent.trim() + '" - disabled: ' + (btn.disabled || btn.hasAttribute('disabled')));
        }
      });
      
      window._preSelectNavigating = false;
    }
  }

  function setupCalendarObserver() {
    if (calendarObserver) return;
    
    calendarObserver = new MutationObserver((mutations) => {
      const priceCalendar = document.querySelector('[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]');
      
      if (priceCalendar && isSecondStep) {
        console.log('[PreSelectFare] RETORNANDO da segunda etapa - reinicializando');
        
        if (stepCheckDebounceTimer) {
          clearTimeout(stepCheckDebounceTimer);
          stepCheckDebounceTimer = null;
        }
        
        isSecondStep = false;
        isInitialized = false;
        isProcessingChange = false;
        currentFareContext = null;
        lastVisibilityState = null;
        window._preSelectNavigating = false;
        
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