(function () {
  // Função global para resetar e testar novamente
  window.resetPreSelectFare = function() {
    window.campaignPreSelectFare = false;
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
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 20%);
        padding: 20px;
        padding-top: 40px;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      }

      .pre-select-floating-cta .floating-continue-btn {
        background: linear-gradient(135deg, #026CB6 0%, #6087F8 100%);
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        padding: 16px 48px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 280px;
        text-transform: uppercase;
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
    const selectedIndicators = [
      '.fare-item.selected',
      '.fare-item.active',
      '.fare-item [aria-selected="true"]',
      '.fare-item.is-selected',
      '.fare-item .selected',
      '[data-test-id="select-fare"][disabled]',
      '[data-test-id="select-fare"].selected'
    ];
    
    for (const selector of selectedIndicators) {
      const selected = document.querySelector(selector);
      if (selected && !selected.hasAttribute('data-pre-select-modified')) {
        console.log('[PreSelectFare] Tarifa já selecionada encontrada:', selector);
        return true;
      }
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
    if (checkIfFareAlreadySelected()) return false;
    
    const mostExpensiveFare = findMostExpensiveFare();
    if (!mostExpensiveFare) return false;

    const originalButton = modifyExpensiveFareButton(mostExpensiveFare);
    if (!originalButton) return false;

    createFloatingCTA(originalButton);
    return true;
  }

  // Estado para controle de visibilidade
  let lastVisibilityState = null;
  let isInitialized = false;

  function checkFaresVisibility() {
    const fareItems = document.querySelectorAll('.fare-item');
    const visibleFareItems = Array.from(fareItems).filter(item => {
      const rect = item.getBoundingClientRect();
      const style = window.getComputedStyle(item);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    const hasVisibleFares = visibleFareItems.length > 0;
    
    if (lastVisibilityState === hasVisibleFares) return;
    lastVisibilityState = hasVisibleFares;
    
    if (!hasVisibleFares) {
      if (floatingCTA) {
        floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
      }
      console.log('[PreSelectFare] Tarifas recolhidas - CTA escondido.');
    } else {
      // Tarifas visíveis - aplica seleção imediatamente
      const modifiedButton = document.querySelector('[data-pre-select-modified]');
      
      if (!modifiedButton) {
        // Aplica seleção na tarifa mais cara
        applySelection();
        console.log('[PreSelectFare] Seleção aplicada.');
      } else if (floatingCTA) {
        floatingCTA.style.display = 'flex';
        document.body.classList.add('pre-select-fare-active');
        console.log('[PreSelectFare] Tarifas visíveis - CTA mostrado.');
      }
    }
  }

  function setupObserver() {
    if (window._preSelectFareObserver) return;
    
    const observer = new MutationObserver(() => {
      // Executa IMEDIATAMENTE sem debounce para primeira detecção
      if (!isInitialized) {
        const fareItems = document.querySelectorAll('.fare-item');
        if (fareItems.length > 0) {
          isInitialized = true;
          checkFaresVisibility();
        }
        return;
      }
      
      // Debounce apenas para mudanças subsequentes
      if (observer.timer) clearTimeout(observer.timer);
      observer.timer = setTimeout(checkFaresVisibility, 16); // ~1 frame (60fps)
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
