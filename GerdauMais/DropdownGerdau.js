(function () {
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;

  // Função para criar o HTML do dropdown
  function createDropdownHTML() {
    const dropdown = document.createElement('div');
    dropdown.className = 'gerdau-dropdown-menu';
    dropdown.setAttribute('data-dropdown-created', 'true');

    dropdown.innerHTML = 
      '<div class="gerdau-dropdown-section">' +
        '<h4 class="gerdau-dropdown-title">Aços longos</h4>' +
        '<button class="gerdau-dropdown-button" data-url="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/catalog">' +
          '<div class="gerdau-dropdown-icon-container">' +
            '<svg class="gerdau-dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">' +
              '<path d="M7.5 12.5L7.5 2.5" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M2.5 1.67L16.67 1.67" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M3.33 9.17L11.67 9.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="gerdau-dropdown-text">Comprar por vitrine</span>' +
        '</button>' +
        '<button class="gerdau-dropdown-button" data-url="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/search-items">' +
          '<div class="gerdau-dropdown-icon-container">' +
            '<svg class="gerdau-dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">' +
              '<path d="M10.83 4.17L16.67 4.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M10.83 10L16.67 10" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M10.83 15.83L16.67 15.83" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M2.5 12.5L5 15L2.5 12.5Z" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M2.5 4.17L5 6.67L2.5 4.17Z" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="gerdau-dropdown-text">Comprar selecionando itens</span>' +
        '</button>' +
        '<button class="gerdau-dropdown-button" data-url="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/spreadsheet-upload">' +
          '<div class="gerdau-dropdown-icon-container">' +
            '<svg class="gerdau-dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">' +
              '<rect x="3.33" y="1.67" width="13.33" height="16.67" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M11.67 1.67L11.67 5" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M6.67 10.83L8.33 10.83" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M11.67 10.83L13.33 10.83" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M6.67 14.17L8.33 14.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M11.67 14.17L13.33 14.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="gerdau-dropdown-text">Comprar por planilha</span>' +
        '</button>' +
        '<button class="gerdau-dropdown-button" data-url="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/repeat-order">' +
          '<div class="gerdau-dropdown-icon-container">' +
            '<svg class="gerdau-dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">' +
              '<rect x="2.5" y="2.5" width="15" height="15" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<rect x="2.5" y="2.5" width="4.17" height="4.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M10 5.83L13.33 9.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="gerdau-dropdown-text">Comprar por histórico</span>' +
        '</button>' +
      '</div>' +
      '<div class="gerdau-dropdown-section">' +
        '<h4 class="gerdau-dropdown-title">Corte e dobra</h4>' +
        '<button class="gerdau-dropdown-button" data-url="https://qa.gab.egerdau.com.br/purchase/long-steel/commerce/shopping-cart">' +
          '<div class="gerdau-dropdown-icon-container">' +
            '<svg class="gerdau-dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">' +
              '<rect x="2.5" y="2.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M6.77 6.77L8.33 8.33" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M6.77 3.33L13.33 9.9" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<rect x="2.5" y="12.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<rect x="12.33" y="12.33" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="gerdau-dropdown-text">Solicitar novo pedido</span>' +
        '</button>' +
        '<button class="gerdau-dropdown-button" data-url="https://qa.gab.egerdau.com.br/orders/long-steel">' +
          '<div class="gerdau-dropdown-icon-container">' +
            '<svg class="gerdau-dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">' +
              '<path d="M6.67 1.67L6.67 5" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<rect x="3.33" y="3.33" width="13.33" height="15" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M10 9.17L13.33 9.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M10 13.33L13.33 13.33" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M6.67 9.17L6.67 9.17" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
              '<path d="M6.67 13.33L6.67 13.33" stroke="#2C2C2C" stroke-width="1.67" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="gerdau-dropdown-text">Revisar pedido por histórico</span>' +
        '</button>' +
      '</div>';

    return dropdown;
  }

  // Função para aplicar estilos ao dropdown
  function applyDropdownStyles(dropdown) {
    dropdown.style.setProperty('display', 'none', 'important');
    dropdown.style.setProperty('position', 'absolute', 'important');
    dropdown.style.setProperty('flex-direction', 'column', 'important');
    dropdown.style.setProperty('align-items', 'flex-start', 'important');
    dropdown.style.setProperty('padding', '16px 8px', 'important');
    dropdown.style.setProperty('gap', '8px', 'important');
    dropdown.style.setProperty('width', '282px', 'important');
    dropdown.style.setProperty('background', '#FFFFFF', 'important');
    dropdown.style.setProperty('box-shadow', '0px 1px 3px rgba(0, 0, 0, 0.25)', 'important');
    dropdown.style.setProperty('border-radius', '16px', 'important');
    dropdown.style.setProperty('z-index', '9999', 'important');
    dropdown.style.setProperty('top', '100%', 'important');
    dropdown.style.setProperty('left', '0', 'important');
    dropdown.style.setProperty('margin-top', '8px', 'important');

    // Estilos para seções
    const sections = dropdown.querySelectorAll('.gerdau-dropdown-section');
    sections.forEach(function (section) {
      section.style.setProperty('display', 'flex', 'important');
      section.style.setProperty('flex-direction', 'column', 'important');
      section.style.setProperty('gap', '8px', 'important');
      section.style.setProperty('width', '100%', 'important');
    });

    // Estilos para títulos
    const titles = dropdown.querySelectorAll('.gerdau-dropdown-title');
    titles.forEach(function (title) {
      title.style.setProperty('font-family', 'Inter, sans-serif', 'important');
      title.style.setProperty('font-weight', '600', 'important');
      title.style.setProperty('font-size', '14px', 'important');
      title.style.setProperty('line-height', '24px', 'important');
      title.style.setProperty('letter-spacing', '-0.3125px', 'important');
      title.style.setProperty('color', '#2C2C2C', 'important');
      title.style.setProperty('margin', '0', 'important');
      title.style.setProperty('padding', '0', 'important');
    });

    // Estilos para botões
    const buttons = dropdown.querySelectorAll('.gerdau-dropdown-button');
    buttons.forEach(function (button) {
      button.style.setProperty('display', 'flex', 'important');
      button.style.setProperty('flex-direction', 'row', 'important');
      button.style.setProperty('align-items', 'center', 'important');
      button.style.setProperty('padding', '0', 'important');
      button.style.setProperty('gap', '12px', 'important');
      button.style.setProperty('width', '100%', 'important');
      button.style.setProperty('height', '40px', 'important');
      button.style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
      button.style.setProperty('border-radius', '10px', 'important');
      button.style.setProperty('border', 'none', 'important');
      button.style.setProperty('cursor', 'pointer', 'important');
      button.style.setProperty('transition', 'background 0.2s', 'important');

      // Hover effect
      if (!button.hasAttribute('data-hover-added')) {
        button.addEventListener('mouseenter', function () {
          button.style.setProperty('background', 'rgba(0, 0, 0, 0.05)', 'important');
        });
        button.addEventListener('mouseleave', function () {
          button.style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
        });
        button.setAttribute('data-hover-added', 'true');
      }

      // Click listener para navegação
      if (!button.hasAttribute('data-click-listener-added')) {
        button.addEventListener('click', function () {
          const url = button.getAttribute('data-url');
          if (url) {
            console.log('[Dropdown Gerdau] Navegando para: ' + url);
            window.location.href = url;
          }
        });
        button.setAttribute('data-click-listener-added', 'true');
      }
    });

    // Estilos para containers de ícones
    const iconContainers = dropdown.querySelectorAll('.gerdau-dropdown-icon-container');
    iconContainers.forEach(function (container) {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('justify-content', 'center', 'important');
      container.style.setProperty('align-items', 'center', 'important');
      container.style.setProperty('width', '40px', 'important');
      container.style.setProperty('height', '40px', 'important');
      container.style.setProperty('background', 'rgba(255, 255, 255, 0.2)', 'important');
      container.style.setProperty('border-radius', '10px', 'important');
      container.style.setProperty('flex-shrink', '0', 'important');
    });

    // Estilos para texto
    const texts = dropdown.querySelectorAll('.gerdau-dropdown-text');
    texts.forEach(function (text) {
      text.style.setProperty('font-family', 'Inter, sans-serif', 'important');
      text.style.setProperty('font-weight', '400', 'important');
      text.style.setProperty('font-size', '14px', 'important');
      text.style.setProperty('line-height', '20px', 'important');
      text.style.setProperty('letter-spacing', '-0.150391px', 'important');
      text.style.setProperty('color', '#2C2C2C', 'important');
      text.style.setProperty('white-space', 'nowrap', 'important');
    });
  }

  // Função para encontrar o item de menu "Comprar"
  function findComprarMenuItem() {
    const menuItems = document.querySelectorAll('.hefesto-menu-item');

    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      const title = item.querySelector('.hefesto-menu-item__content__title');

      if (title && title.textContent.trim() === 'Comprar') {
        return item;
      }
    }

    return null;
  }

  // Função principal para adicionar dropdown
  function addDropdownToMenu() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    const comprarItem = findComprarMenuItem();

    if (!comprarItem) {
      isProcessing = false;
      return;
    }

    // Verificar se dropdown já foi adicionado
    if (comprarItem.hasAttribute('data-dropdown-attached')) {
      isProcessing = false;
      return;
    }

    // Criar dropdown
    const dropdown = createDropdownHTML();

    // Aplicar estilos
    applyDropdownStyles(dropdown);

    // Adicionar dropdown ao item de menu
    comprarItem.style.setProperty('position', 'relative', 'important');
    comprarItem.appendChild(dropdown);

    // Adicionar event listeners para mostrar/esconder dropdown
    if (!comprarItem.hasAttribute('data-hover-listeners-added')) {
      comprarItem.addEventListener('mouseenter', function () {
        dropdown.style.setProperty('display', 'flex', 'important');
      });

      comprarItem.addEventListener('mouseleave', function () {
        dropdown.style.setProperty('display', 'none', 'important');
      });

      comprarItem.setAttribute('data-hover-listeners-added', 'true');
    }

    comprarItem.setAttribute('data-dropdown-attached', 'true');

    console.log('[Dropdown Gerdau] Dropdown adicionado ao menu Comprar');

    isProcessing = false;
  }

  // Função de inicialização
  function init() {
    addDropdownToMenu();

    // Configurar MutationObserver
    if (!observer) {
      observer = new MutationObserver(function () {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(function () {
          addDropdownToMenu();
        }, 300);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      console.log('[Dropdown Gerdau] MutationObserver configurado');
    }
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
