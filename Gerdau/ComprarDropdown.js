// Script para adicionar dropdown ao menu "Comprar"
// Cole este código no console quando estiver na página desejada

(function() {
  // Verifica se o dropdown já existe para evitar duplicação
  if (document.getElementById('gerdau-comprar-dropdown')) {
    const existingDropdown = document.getElementById('gerdau-comprar-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
  }

  // Variáveis de controle
  let pollCount = 0;
  const maxPolls = 60; // Tenta por 3 segundos (60 * 50ms)
  let isInitialized = false;
  let observer = null;
  let pollInterval = null;

  // Função para enviar eventos de analytics
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking Gerdau Dropdown] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_Gerdau_Dropdown_' + eventType + ' ' + eventLabel;

    console.log('[Tracking Gerdau Dropdown] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('gerdau-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_Gerdau_menu_comprar';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Função para encontrar o elemento do menu "Comprar"
  function findComprarMenuItem() {
    const menuItems = document.querySelectorAll('.hefesto-menu-item');
    
    if (menuItems.length === 0) {
      return null;
    }
    
    for (let i = 0; i < menuItems.length; i++) {
      const titleElement = menuItems[i].querySelector('.hefesto-menu-item__content__title');
      if (titleElement && titleElement.textContent.trim() === 'Comprar') {
        return menuItems[i];
      }
    }
    
    return null;
  }

  // Função principal de inicialização
  function initDropdown() {
    if (isInitialized) {
      console.log('[Gerdau Dropdown] Já inicializado, ignorando...');
      return;
    }

    const comprarMenuItem = findComprarMenuItem();

    if (!comprarMenuItem) {
      return;
    }

    // Parar polling quando encontrar
    if (pollInterval) {
      clearInterval(pollInterval);
      console.log('[Gerdau Dropdown] Polling interrompido - elemento encontrado');
    }

    isInitialized = true;
    console.log('[Gerdau Dropdown] Item de menu "Comprar" encontrado! Inicializando...');

    // Cria o container do dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'gerdau-comprar-dropdown';
    dropdown.innerHTML = '<style>' +
      '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");' +
      '' +
      '#gerdau-comprar-dropdown {' +
      '  position: absolute;' +
      '  display: none;' +
      '  flex-direction: column;' +
      '  align-items: flex-start;' +
      '  padding: 16px 8px;' +
      '  gap: 8px;' +
      '  width: 282px;' +
      '  background: #FFFFFF;' +
      '  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.25), 0px 1px 3px rgba(0, 0, 0, 0.25);' +
      '  border-radius: 16px;' +
      '  z-index: 10000;' +
      '  font-family: "Inter", sans-serif;' +
      '}' +
      '' +
      '#gerdau-comprar-dropdown.show {' +
      '  display: flex;' +
      '}' +
      '' +
      '.gerdau-dropdown-section-title {' +
      '  width: 100%;' +
      '  height: 24px;' +
      '  font-weight: 600;' +
      '  font-size: 14px;' +
      '  line-height: 24px;' +
      '  letter-spacing: -0.3125px;' +
      '  color: #2C2C2C;' +
      '  margin: 0;' +
      '  padding: 0;' +
      '}' +
      '' +
      '.gerdau-dropdown-button {' +
      '  display: flex;' +
      '  flex-direction: row;' +
      '  align-items: center;' +
      '  padding: 0;' +
      '  gap: 12px;' +
      '  width: 253px;' +
      '  height: 40px;' +
      '  background: rgba(255, 255, 255, 0.1);' +
      '  border-radius: 10px;' +
      '  border: none;' +
      '  cursor: pointer;' +
      '  transition: background 0.2s;' +
      '  text-decoration: none;' +
      '}' +
      '' +
      '.gerdau-dropdown-button:hover {' +
      '  background: rgba(0, 51, 102, 0.05);' +
      '}' +
      '' +
      '.gerdau-dropdown-icon-container {' +
      '  display: flex;' +
      '  flex-direction: row;' +
      '  justify-content: center;' +
      '  align-items: center;' +
      '  width: 40px;' +
      '  height: 40px;' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  border-radius: 10px;' +
      '}' +
      '' +
      '.gerdau-dropdown-icon {' +
      '  width: 20px;' +
      '  height: 20px;' +
      '  stroke: #2C2C2C;' +
      '  stroke-width: 1.67;' +
      '  fill: none;' +
      '}' +
      '' +
      '.gerdau-dropdown-text {' +
      '  font-weight: 400;' +
      '  font-size: 14px;' +
      '  line-height: 20px;' +
      '  letter-spacing: -0.150391px;' +
      '  color: #2C2C2C;' +
      '  text-align: left;' +
      '}' +
      '</style>' +
      '' +
      '<h3 class="gerdau-dropdown-section-title">Aços longos</h3>' +
      '' +
      '<a href="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/catalog" class="gerdau-dropdown-button" data-option="vitrine">' +
      '  <div class="gerdau-dropdown-icon-container">' +
      '    <svg class="gerdau-dropdown-icon" viewBox="0 0 20 20">' +
      '      <path d="M7.5 12.5V15M7.5 5V10M12.5 10H17.5M2.5 10H7.5M7.5 5H12.5V10H7.5V5Z" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="gerdau-dropdown-text">Comprar por vitrine</span>' +
      '</a>' +
      '' +
      '<a href="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/search-items" class="gerdau-dropdown-button" data-option="itens">' +
      '  <div class="gerdau-dropdown-icon-container">' +
      '    <svg class="gerdau-dropdown-icon" viewBox="0 0 20 20">' +
      '      <path d="M11 4H17M11 10H17M11 16H17M5 16V12M5 8V4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="gerdau-dropdown-text">Comprar selecionando itens</span>' +
      '</a>' +
      '' +
      '<a href="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/spreadsheet-upload" class="gerdau-dropdown-button" data-option="planilha">' +
      '  <div class="gerdau-dropdown-icon-container">' +
      '    <svg class="gerdau-dropdown-icon" viewBox="0 0 20 20">' +
      '      <path d="M3.33 3.33H16.67V16.67H3.33V3.33ZM12 3.33V7M6.67 11H8.33M11.67 11H13.33M6.67 14H8.33M11.67 14H13.33" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="gerdau-dropdown-text">Comprar por planilha</span>' +
      '</a>' +
      '' +
      '<a href="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/repeat-order" class="gerdau-dropdown-button" data-option="historico">' +
      '  <div class="gerdau-dropdown-icon-container">' +
      '    <svg class="gerdau-dropdown-icon" viewBox="0 0 20 20">' +
      '      <path d="M2.5 2.5H17.5V17.5H2.5V2.5ZM2.5 2.5V6.67M10 6V12" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="gerdau-dropdown-text">Comprar por histórico</span>' +
      '</a>' +
      '' +
      '<h3 class="gerdau-dropdown-section-title">Corte e dobra</h3>' +
      '' +
      '<a href="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/shopping-cart" class="gerdau-dropdown-button" data-option="novo-pedido">' +
      '  <div class="gerdau-dropdown-icon-container">' +
      '    <svg class="gerdau-dropdown-icon" viewBox="0 0 20 20">' +
      '      <path d="M2.5 2.5V7.5H7.5M7 7L12.5 12.5M2.5 12.5V17.5H7.5M12.5 12.5L17.5 17.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="gerdau-dropdown-text">Solicitar novo pedido</span>' +
      '</a>' +
      '' +
      '<a href="https://qa.gab.egerdau.com.br/orders/long-steel" class="gerdau-dropdown-button" data-option="revisar-pedido">' +
      '  <div class="gerdau-dropdown-icon-container">' +
      '    <svg class="gerdau-dropdown-icon" viewBox="0 0 20 20">' +
      '      <path d="M6.67 2H13.33V5M3.33 5H16.67V17.5H3.33V5ZM10 9H13.33M10 13H13.33M6.67 9H6.67V9M6.67 13H6.67V13" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    </svg>' +
      '  </div>' +
      '  <span class="gerdau-dropdown-text">Revisar pedido por histórico</span>' +
      '</a>';

    // Adiciona o dropdown ao body
    document.body.appendChild(dropdown);

    // Adiciona listeners de click para tracking
    function addClickListeners() {
      const buttons = dropdown.querySelectorAll('.gerdau-dropdown-button');
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        if (button.hasAttribute('data-analytics-added')) {
          continue;
        }
        
        button.setAttribute('data-analytics-added', 'true');
        
        const optionName = button.getAttribute('data-option') || 'desconhecido';
        const optionText = button.querySelector('.gerdau-dropdown-text');
        const buttonLabel = optionText ? optionText.textContent.trim() : optionName;
        
        button.addEventListener('click', function() {
          analyticsEvent(buttonLabel, 'click');
        });
        
        console.log('[Tracking Gerdau Dropdown] Listener adicionado:', buttonLabel);
      }
    }

    addClickListeners();

    // Função para posicionar o dropdown
    const positionDropdown = function() {
      const rect = comprarMenuItem.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 5) + 'px';
      dropdown.style.left = rect.left + 'px';
    };

    // Evento para mostrar dropdown ao passar o mouse
    comprarMenuItem.addEventListener('mouseenter', function() {
      positionDropdown();
      dropdown.classList.add('show');
      analyticsEvent('dropdown_visualizado', 'view');
    });

    dropdown.addEventListener('mouseenter', function() {
      dropdown.classList.add('show');
    });

    const hideDropdown = function() {
      dropdown.classList.remove('show');
    };

    comprarMenuItem.addEventListener('mouseleave', function() {
      setTimeout(function() {
        if (!dropdown.matches(':hover')) {
          hideDropdown();
        }
      }, 100);
    });

    dropdown.addEventListener('mouseleave', hideDropdown);

    console.log('[Gerdau Dropdown] Dropdown "Comprar" carregado com sucesso!');
  }

  // MutationObserver para capturar elementos carregados dinamicamente
  function setupObserver() {
    if (observer) {
      return;
    }

    observer = new MutationObserver(function(mutations) {
      if (!isInitialized) {
        initDropdown();
      }
    });

    // Observa o HTML inteiro, não apenas o body
    const targetNode = document.documentElement || document.body;
    
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });

    console.log('[Gerdau Dropdown] MutationObserver configurado em:', targetNode.tagName);
  }

  // Polling com limite de tentativas
  function startPolling() {
    pollInterval = setInterval(function() {
      pollCount++;
      
      console.log('[Gerdau Dropdown] Tentativa ' + pollCount + ' de ' + maxPolls);
      
      initDropdown();
      
      if (isInitialized || pollCount >= maxPolls) {
        clearInterval(pollInterval);
        
        if (!isInitialized) {
          console.log('[Gerdau Dropdown] Limite de tentativas atingido. Menu "Comprar" não encontrado.');
        }
      }
    }, 50);
  }

  // Função de inicialização global
  function init() {
    console.log('[Gerdau Dropdown] Iniciando script...');
    console.log('[Gerdau Dropdown] document.readyState:', document.readyState);
    
    // Tenta inicializar imediatamente
    initDropdown();
    
    // Configura o observer
    setupObserver();
    
    // Inicia polling
    startPolling();
  }

  // Verifica o estado do DOM e inicializa
  if (document.readyState === 'loading') {
    console.log('[Gerdau Dropdown] DOM ainda carregando, aguardando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('[Gerdau Dropdown] DOM já carregado, inicializando imediatamente...');
    init();
  }

})();