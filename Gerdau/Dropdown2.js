(function () {
  let dropdown = null;
  let targetMenuItem = null;
  let isDropdownVisible = false;
  let hideTimeout = null;

  // Funcao para enviar eventos de analytics
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking Dropdown] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_Dropdown_Comprar_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Dropdown] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_dropdown_menu';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Funcao para criar o HTML do dropdown
  function createDropdown() {
    const container = document.createElement('div');
    container.setAttribute('data-dropdown-created', 'true');
    container.style.cssText = 'position: absolute; z-index: 9999; opacity: 0; transition: opacity 0.2s ease;';

    const frame = document.createElement('div');
    frame.style.cssText = 'display: flex; flex-direction: column; align-items: flex-start; padding: 16px 8px; gap: 8px; width: 282px; background: #FFFFFF; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.25), 0px 1px 3px rgba(0, 0, 0, 0.25); border-radius: 16px;';

    // Categoria: Acos longos
    const category1 = document.createElement('div');
    category1.style.cssText = 'width: 100%; font-family: Inter, sans-serif; font-weight: 600; font-size: 14px; line-height: 24px; letter-spacing: -0.3125px; color: #2C2C2C;';
    category1.textContent = 'Aços longos';

    const button1 = createButton('Comprar por vitrine', 'vitrine-icon');
    const button2 = createButton('Comprar selecionando itens', 'list-icon');
    const button3 = createButton('Comprar por planilha', 'spreadsheet-icon');
    const button4 = createButton('Comprar por histórico', 'history-icon');

    // Categoria: Corte e dobra
    const category2 = document.createElement('div');
    category2.style.cssText = 'width: 100%; font-family: Inter, sans-serif; font-weight: 600; font-size: 14px; line-height: 24px; letter-spacing: -0.3125px; color: #2C2C2C; margin-top: 8px;';
    category2.textContent = 'Corte e dobra';

    const button5 = createButton('Solicitar novo pedido', 'new-order-icon');
    const button6 = createButton('Revisar pedido por histórico', 'review-icon');

    frame.appendChild(category1);
    frame.appendChild(button1);
    frame.appendChild(button2);
    frame.appendChild(button3);
    frame.appendChild(button4);
    frame.appendChild(category2);
    frame.appendChild(button5);
    frame.appendChild(button6);

    container.appendChild(frame);

    // Event listeners para manter dropdown aberto
    container.addEventListener('mouseenter', () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });

    container.addEventListener('mouseleave', () => {
      hideDropdown();
    });

    return container;
  }

  // Funcao para criar botao
  function createButton(text, iconType) {
    const button = document.createElement('div');
    button.style.cssText = 'display: flex; flex-direction: row; align-items: center; padding: 0px; gap: 12px; width: 100%; height: 40px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; cursor: pointer; transition: background 0.2s ease;';

    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = 'display: flex; flex-direction: row; justify-content: center; align-items: center; width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 10px;';

    const icon = document.createElement('div');
    icon.style.cssText = 'width: 20px; height: 20px;';
    icon.innerHTML = getIconSVG(iconType);

    const textElement = document.createElement('span');
    textElement.style.cssText = 'font-family: Inter, sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: -0.150391px; color: #2C2C2C;';
    textElement.textContent = text;

    iconContainer.appendChild(icon);
    button.appendChild(iconContainer);
    button.appendChild(textElement);

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.setProperty('background', 'rgba(0, 0, 0, 0.05)', 'important');
    });

    button.addEventListener('mouseleave', () => {
      button.style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
    });

    // Click tracking
    if (!button.hasAttribute('data-analytics-added')) {
      button.setAttribute('data-analytics-added', 'true');
      button.addEventListener('click', () => {
        analyticsEvent(text, 'clique');
      });
    }

    return button;
  }

  // Funcao para retornar SVG dos icones
  function getIconSVG(iconType) {
    const icons = {
      'vitrine-icon': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="7.5" y="12.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/><rect x="2.5" y="2.5" width="15" height="8.33" stroke="#2C2C2C" stroke-width="1.67"/><rect x="3.33" y="9.17" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/></svg>',
      'list-icon': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10.83" y1="4.17" x2="16.67" y2="4.17" stroke="#2C2C2C" stroke-width="1.67"/><line x1="10.83" y1="10" x2="16.67" y2="10" stroke="#2C2C2C" stroke-width="1.67"/><line x1="10.83" y1="15.83" x2="16.67" y2="15.83" stroke="#2C2C2C" stroke-width="1.67"/><rect x="2.5" y="12.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/><rect x="2.5" y="4.17" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/></svg>',
      'spreadsheet-icon': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3.33" y="2.5" width="13.33" height="15" stroke="#2C2C2C" stroke-width="1.67"/><rect x="11.67" y="2.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/><line x1="6.67" y1="10.83" x2="8.33" y2="10.83" stroke="#2C2C2C" stroke-width="1.67"/><line x1="11.67" y1="10.83" x2="13.33" y2="10.83" stroke="#2C2C2C" stroke-width="1.67"/><line x1="6.67" y1="14.17" x2="8.33" y2="14.17" stroke="#2C2C2C" stroke-width="1.67"/><line x1="11.67" y1="14.17" x2="13.33" y2="14.17" stroke="#2C2C2C" stroke-width="1.67"/></svg>',
      'history-icon': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="2.5" width="15" height="15" stroke="#2C2C2C" stroke-width="1.67"/><rect x="2.5" y="2.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/><line x1="10" y1="5.83" x2="13.33" y2="5.83" stroke="#2C2C2C" stroke-width="1.67"/></svg>',
      'new-order-icon': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="2.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/><path d="M6.83 6.83L10 3.33L16.67 10" stroke="#2C2C2C" stroke-width="1.67"/><rect x="2.5" y="12.5" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/><rect x="12.33" y="12.33" width="5" height="5" stroke="#2C2C2C" stroke-width="1.67"/></svg>',
      'review-icon': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="6.67" y1="1.67" x2="6.67" y2="3.33" stroke="#2C2C2C" stroke-width="1.67"/><rect x="3.33" y="3.33" width="13.33" height="13.33" stroke="#2C2C2C" stroke-width="1.67"/><line x1="10" y1="9.17" x2="10" y2="10" stroke="#2C2C2C" stroke-width="1.67"/><line x1="10" y1="13.33" x2="10" y2="13.33" stroke="#2C2C2C" stroke-width="1.67"/><line x1="6.67" y1="9.17" x2="6.67" y2="10" stroke="#2C2C2C" stroke-width="1.67"/><line x1="6.67" y1="13.33" x2="6.67" y2="13.33" stroke="#2C2C2C" stroke-width="1.67"/></svg>'
    };

    return icons[iconType] || '';
  }

  // Funcao para posicionar dropdown
  function positionDropdown() {
    if (!dropdown || !targetMenuItem) return;

    const rect = targetMenuItem.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = rect.left + 'px';
  }

  // Funcao para mostrar dropdown
  function showDropdown() {
    if (isDropdownVisible) return;

    if (!dropdown) {
      dropdown = createDropdown();
      document.body.appendChild(dropdown);
    }

    positionDropdown();
    dropdown.style.opacity = '1';
    isDropdownVisible = true;

    // Tracking de visualizacao
    analyticsEvent('dropdown_aberto', 'visualizacao');

    console.log('[Dropdown] Dropdown exibido');
  }

  // Funcao para esconder dropdown
  function hideDropdown() {
    hideTimeout = setTimeout(() => {
      if (dropdown) {
        dropdown.style.opacity = '0';
        isDropdownVisible = false;
        console.log('[Dropdown] Dropdown ocultado');
      }
    }, 200);
  }

  // Funcao para adicionar listeners no menu item
  function addMenuListeners() {
    const menuItems = document.querySelectorAll('.hefesto-menu-item');

    menuItems.forEach((item) => {
      const title = item.querySelector('.hefesto-menu-item__content__title');

      if (title && title.textContent.trim() === 'Comprar') {
        if (item.hasAttribute('data-dropdown-listener-added')) {
          return;
        }

        targetMenuItem = item;
        item.setAttribute('data-dropdown-listener-added', 'true');

        item.addEventListener('mouseenter', () => {
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
          }
          showDropdown();
        });

        item.addEventListener('mouseleave', () => {
          hideDropdown();
        });

        console.log('[Dropdown] Listeners adicionados ao menu Comprar');
      }
    });
  }

  // Funcao de inicializacao
  function init() {
    addMenuListeners();

    // MutationObserver para elementos carregados dinamicamente
    const observer = new MutationObserver(() => {
      addMenuListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Reposicionar dropdown ao redimensionar janela
  window.addEventListener('resize', () => {
    if (isDropdownVisible) {
      positionDropdown();
    }
  });

  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
