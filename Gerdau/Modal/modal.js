(function () {
  let modalContainer = null;
  let isModalOpen = false;

  // Função para criar o HTML do modal
  function createModalHTML() {
    const modalHTML = '<div id="gerdau-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9998; display: flex; justify-content: center; align-items: center;">' +
      '<div id="gerdau-modal-container" style="position: relative; width: 1153px; max-width: 95vw; max-height: 95vh; background: #FFFFFF; box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">' +
      
      // Header
      '<div style="position: relative; width: 100%; height: 128px; background: #003366; display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; box-sizing: border-box; overflow: hidden;">' +
      
      // Background decorations
      '<div style="position: absolute; width: 100%; height: 57.78px; left: 0; top: 0; background: #FFFFFF; opacity: 0.1; border-radius: 0;"></div>' +
      '<div style="position: absolute; width: 256px; height: 256px; right: -32px; top: -128px; background: #FFFFFF; border-radius: 50%;"></div>' +
      '<div style="position: absolute; width: 192px; height: 192px; left: -96px; top: -38.22px; background: #FFFFFF; border-radius: 50%;"></div>' +
      
      // Title section
      '<div style="display: flex; flex-direction: column; gap: 8px; z-index: 1;">' +
      '<h2 style="margin: 0; font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 32px; line-height: 36px; letter-spacing: 0.382812px; color: #FFFFFF;">O que você quer fazer hoje?</h2>' +
      '<p style="margin: 0; font-family: Inter, Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 26px; letter-spacing: -0.3125px; color: rgba(255, 255, 255, 0.8);">Escolha uma opção abaixo para começar</p>' +
      '</div>' +
      
      // Close button
      '<button id="gerdau-modal-close" style="width: 48px; height: 48px; border: none; background: transparent; border-radius: 50%; cursor: pointer; padding: 0; display: flex; justify-content: center; align-items: center; z-index: 1; transition: background 0.3s;">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L18 18M6 18L18 6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
      
      '</div>' +
      
      // Content area
      '<div style="flex: 1; overflow-y: auto; background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%); padding: 40px;">' +
      
      // Seção 1: Opções de Compra Rápida
      '<div style="margin-bottom: 40px;">' +
      '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">' +
      '<div style="width: 48px; height: 4px; background: linear-gradient(180deg, #7FB8E8 0%, #164573 100%); border-radius: 100px;"></div>' +
      '<h3 style="margin: 0; font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 20px; line-height: 28px; letter-spacing: -0.449219px; color: #2C2C2C;">Opções de Compra Rápida</h3>' +
      '</div>' +
      
      '<div style="display: flex; gap: 32px; flex-wrap: wrap;">' +
      
      // Card: Aços longos
      '<div style="flex: 1; min-width: 300px; max-width: 520px; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1); border-radius: 16.4px; background: #FFFFFF; padding: 20px;">' +
      '<h4 style="margin: 0 0 16px 0; font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 16px; line-height: 24px; letter-spacing: -0.3125px; color: #2C2C2C;">Aços longos</h4>' +
      '<div style="display: flex; flex-direction: column; gap: 8px;">' +
      createOptionButton('M', 'Comprar por vitrine') +
      createOptionButton('L', 'Comprar selecionando itens') +
      createOptionButton('T', 'Comprar por planilha') +
      createOptionButton('H', 'Comprar por histórico') +
      '</div>' +
      '</div>' +
      
      // Card: Corte e dobra
      '<div style="flex: 1; min-width: 300px; max-width: 520px; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1); border-radius: 16.4px; background: #FFFFFF; padding: 20px;">' +
      '<h4 style="margin: 0 0 16px 0; font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 16px; line-height: 24px; letter-spacing: -0.3125px; color: #2C2C2C;">Corte e dobra</h4>' +
      '<div style="display: flex; flex-direction: column; gap: 8px;">' +
      createOptionButton('P', 'Solicitar novo pedido') +
      createOptionButton('R', 'Revisar pedido por histórico') +
      '</div>' +
      '</div>' +
      
      '</div>' +
      '</div>' +
      
      // Seção 2: Menu Principal
      '<div>' +
      '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">' +
      '<div style="width: 48px; height: 4px; background: linear-gradient(180deg, #7FB8E8 0%, #164573 100%); border-radius: 100px;"></div>' +
      '<h3 style="margin: 0; font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 20px; line-height: 28px; letter-spacing: -0.449219px; color: #2C2C2C;">Menu Principal</h3>' +
      '</div>' +
      
      '<div style="display: flex; flex-wrap: wrap; gap: 16px;">' +
      createMainMenuCard('D', 'Painel de gestão', 'Visualize dados e métricas') +
      createMainMenuCard('O', 'Pedidos', 'Gerencie seus pedidos') +
      createMainMenuCard('F', 'Finanças', 'Consulte informações financeiras') +
      createMainMenuCard('M', 'Maquetas e Projetos', 'Acesse maquetas e projetos') +
      createMainMenuCard('C', 'Contratos e obras', 'Consulte contratos e obras') +
      createMainMenuCard('B', 'Buscar documentos', 'Encontre documentos') +
      '</div>' +
      
      '</div>' +
      
      '</div>' +
      '</div>' +
      '</div>';
    
    return modalHTML;
  }

  // Função auxiliar para criar botão de opção
  function createOptionButton(icon, text) {
    return '<button class="gerdau-option-btn" style="display: flex; align-items: center; gap: 12px; width: 100%; height: 40px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 10px; padding: 0 12px; cursor: pointer; transition: all 0.3s;">' +
      '<div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 10px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">' +
      '<span style="font-family: Inter, Arial, sans-serif; font-weight: 600; font-size: 14px; color: #2C2C2C;">' + icon + '</span>' +
      '</div>' +
      '<span style="font-family: Inter, Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; letter-spacing: -0.150391px; color: #2C2C2C; text-align: left;">' + text + '</span>' +
      '</button>';
  }

  // Função auxiliar para criar card do menu principal
  function createMainMenuCard(icon, title, description) {
    return '<button class="gerdau-menu-card" style="flex: 1; min-width: 300px; max-width: 347px; display: flex; flex-direction: column; align-items: flex-start; padding: 16px; gap: 16px; background: #FFFFFF; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1); border-radius: 16.4px; border: none; cursor: pointer; transition: all 0.3s; text-align: left;">' +
      '<div style="width: 56px; height: 40px; background: #003366; box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 16.4px; display: flex; justify-content: center; align-items: center;">' +
      '<span style="font-family: Inter, Arial, sans-serif; font-weight: 700; font-size: 18px; color: #FFFFFF;">' + icon + '</span>' +
      '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 4px;">' +
      '<span style="font-family: Inter, Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; letter-spacing: -0.3125px; color: #2C2C2C;">' + title + '</span>' +
      '<span style="font-family: Inter, Arial, sans-serif; font-weight: 400; font-size: 12px; line-height: 16px; color: #666666;">' + description + '</span>' +
      '</div>' +
      '</button>';
  }

  // Função para adicionar hover effects
  function addHoverEffects() {
    const optionButtons = document.querySelectorAll('.gerdau-option-btn');
    const menuCards = document.querySelectorAll('.gerdau-menu-card');
    const closeButton = document.getElementById('gerdau-modal-close');

    optionButtons.forEach(function (btn) {
      if (!btn.hasAttribute('data-hover-added')) {
        btn.addEventListener('mouseenter', function () {
          btn.style.setProperty('background', 'rgba(255, 255, 255, 0.3)', 'important');
          btn.style.setProperty('transform', 'translateX(4px)', 'important');
        });

        btn.addEventListener('mouseleave', function () {
          btn.style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
          btn.style.removeProperty('transform');
        });

        btn.addEventListener('click', function () {
          console.log('[Gerdau Modal] Botão clicado: ' + btn.textContent.trim());
        });

        btn.setAttribute('data-hover-added', 'true');
      }
    });

    menuCards.forEach(function (card) {
      if (!card.hasAttribute('data-hover-added')) {
        card.addEventListener('mouseenter', function () {
          card.style.setProperty('transform', 'translateY(-4px)', 'important');
          card.style.setProperty('box-shadow', '0px 10px 20px rgba(0, 0, 0, 0.15)', 'important');
        });

        card.addEventListener('mouseleave', function () {
          card.style.removeProperty('transform');
          card.style.setProperty('box-shadow', '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)', 'important');
        });

        card.addEventListener('click', function () {
          console.log('[Gerdau Modal] Card clicado: ' + card.textContent.trim());
        });

        card.setAttribute('data-hover-added', 'true');
      }
    });

    if (closeButton && !closeButton.hasAttribute('data-hover-added')) {
      closeButton.addEventListener('mouseenter', function () {
        closeButton.style.setProperty('background', 'rgba(255, 255, 255, 0.2)', 'important');
      });

      closeButton.addEventListener('mouseleave', function () {
        closeButton.style.setProperty('background', 'transparent', 'important');
      });

      closeButton.addEventListener('click', function () {
        closeModal();
      });

      closeButton.setAttribute('data-hover-added', 'true');
    }
  }

  // Função para abrir o modal
  function openModal() {
    if (isModalOpen) {
      console.log('[Gerdau Modal] Modal já está aberto');
      return;
    }

    const existingModal = document.getElementById('gerdau-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = createModalHTML();
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    modalContainer = document.getElementById('gerdau-modal-overlay');
    isModalOpen = true;

    // Adicionar event listeners
    addHoverEffects();

    // Fechar ao clicar fora do modal
    modalContainer.addEventListener('click', function (e) {
      if (e.target.id === 'gerdau-modal-overlay') {
        closeModal();
      }
    });

    // Fechar com ESC
    document.addEventListener('keydown', handleEscKey);

    console.log('[Gerdau Modal] Modal aberto com sucesso');
  }

  // Função para fechar o modal
  function closeModal() {
    if (!isModalOpen) {
      return;
    }

    if (modalContainer) {
      modalContainer.remove();
      modalContainer = null;
    }

    isModalOpen = false;
    document.removeEventListener('keydown', handleEscKey);

    console.log('[Gerdau Modal] Modal fechado');
  }

  // Handler para tecla ESC
  function handleEscKey(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  // Expor funções globalmente
  window.GerdauModal = {
    open: openModal,
    close: closeModal,
    isOpen: function () {
      return isModalOpen;
    }
  };

  console.log('[Gerdau Modal] Script carregado. Use GerdauModal.open() para abrir o modal.');
})();
