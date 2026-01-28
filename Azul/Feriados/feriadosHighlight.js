/**
 * Azul - Destaque de Feriados
 * Adiciona botão FERIADOS no header e abre calendário modal
 */

(function () {
  'use strict';

  // Configuração de feriados 2025 (formato: 'YYYY-MM-DD')
  const FERIADOS_2025 = [
    { date: '2025-01-01', name: 'Ano Novo' },
    { date: '2025-02-28', name: 'Carnaval' },
    { date: '2025-03-01', name: 'Carnaval' },
    { date: '2025-03-02', name: 'Carnaval' },
    { date: '2025-03-03', name: 'Carnaval' },
    { date: '2025-03-04', name: 'Carnaval' },
    { date: '2025-04-18', name: 'Paixão de Cristo' },
    { date: '2025-04-21', name: 'Tiradentes' },
    { date: '2025-05-01', name: 'Dia do Trabalho' },
    { date: '2025-06-19', name: 'Corpus Christi' },
    { date: '2025-09-07', name: 'Independência' },
    { date: '2025-10-12', name: 'N. Sra. Aparecida' },
    { date: '2025-11-02', name: 'Finados' },
    { date: '2025-11-15', name: 'Proc. República' },
    { date: '2025-11-20', name: 'Consciência Negra' },
    { date: '2025-12-25', name: 'Natal' },
    { date: '2025-12-31', name: 'Réveillon' },
  ];

  // Configuração
  const CONFIG = {
    feriados: FERIADOS_2025,
    buttonLabel: 'FERIADOS',
    highlightColor: '#FFD700',
    badgeColor: '#FF6B6B',
  };

  let observer = null;
  let headerButtonAdded = false;
  let modalOpen = false;

  // Função de analytics para trackeamento
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking Feriados] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_Feriados_' + eventType + ' ' + eventLabel;

    console.log('[Tracking Feriados] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_Feriados_home';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Função para adicionar estilos do modal
  function addModalStyles() {
    if (document.getElementById('feriados-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'feriados-modal-styles';
    styles.textContent =
      '.feriados-modal-overlay {' +
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'background-color: rgba(0, 0, 0, 0.5);' +
      'z-index: 9998;' +
      'opacity: 0;' +
      'visibility: hidden;' +
      'transition: opacity 0.3s ease, visibility 0.3s ease;' +
      '}' +
      '.feriados-modal-overlay.open {' +
      'opacity: 1;' +
      'visibility: visible;' +
      '}' +
      '.feriados-modal-container {' +
      'position: fixed;' +
      'top: 80px;' +
      'right: 20px;' +
      'width: 90%;' +
      'max-width: 600px;' +
      'max-height: calc(100vh - 100px);' +
      'background: linear-gradient(135deg, #041E42 0%, #0A2F5F 100%);' +
      'border-radius: 16px;' +
      'box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);' +
      'z-index: 9999;' +
      'opacity: 0;' +
      'transform: translateY(-20px);' +
      'visibility: hidden;' +
      'transition: all 0.3s ease;' +
      'overflow: hidden;' +
      '}' +
      '.feriados-modal-container.open {' +
      'opacity: 1;' +
      'transform: translateY(0);' +
      'visibility: visible;' +
      '}' +
      '.feriados-modal-header {' +
      'padding: 24px 24px 16px;' +
      'border-bottom: 1px solid rgba(255, 255, 255, 0.1);' +
      'display: flex;' +
      'justify-content: space-between;' +
      'align-items: center;' +
      '}' +
      '.feriados-modal-title {' +
      'font-family: "Inter", sans-serif;' +
      'font-size: 24px;' +
      'font-weight: 600;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 12px;' +
      '}' +
      '.feriados-modal-close {' +
      'background: none;' +
      'border: none;' +
      'color: #FFFFFF;' +
      'cursor: pointer;' +
      'padding: 8px;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'border-radius: 8px;' +
      'transition: background-color 0.2s ease;' +
      '}' +
      '.feriados-modal-close:hover {' +
      'background-color: rgba(255, 255, 255, 0.1);' +
      '}' +
      '.feriados-modal-content {' +
      'padding: 24px;' +
      'overflow-y: auto;' +
      'max-height: calc(100vh - 200px);' +
      '}' +
      '.feriados-grid {' +
      'display: grid;' +
      'grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));' +
      'gap: 16px;' +
      '}' +
      '.feriado-card {' +
      'background: rgba(255, 255, 255, 0.08);' +
      'border: 2px solid rgba(255, 215, 0, 0.3);' +
      'border-radius: 12px;' +
      'padding: 16px;' +
      'text-align: center;' +
      'transition: all 0.3s ease;' +
      'cursor: pointer;' +
      '}' +
      '.feriado-card:hover {' +
      'background: rgba(255, 215, 0, 0.15);' +
      'border-color: #FFD700;' +
      'transform: translateY(-4px);' +
      'box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);' +
      '}' +
      '.feriado-date {' +
      'font-family: "Inter", sans-serif;' +
      'font-size: 28px;' +
      'font-weight: 700;' +
      'color: #FFD700;' +
      'margin: 0 0 4px 0;' +
      '}' +
      '.feriado-month {' +
      'font-family: "Inter", sans-serif;' +
      'font-size: 14px;' +
      'font-weight: 500;' +
      'color: rgba(255, 255, 255, 0.7);' +
      'margin: 0 0 12px 0;' +
      'text-transform: uppercase;' +
      '}' +
      '.feriado-name {' +
      'font-family: "Inter", sans-serif;' +
      'font-size: 14px;' +
      'font-weight: 600;' +
      'color: #FFFFFF;' +
      'margin: 0;' +
      'line-height: 1.4;' +
      '}' +
      '.feriados-info {' +
      'margin-top: 24px;' +
      'padding: 16px;' +
      'background: rgba(255, 255, 255, 0.05);' +
      'border-radius: 12px;' +
      'border-left: 4px solid #FFD700;' +
      '}' +
      '.feriados-info-text {' +
      'font-family: "Inter", sans-serif;' +
      'font-size: 13px;' +
      'color: rgba(255, 255, 255, 0.8);' +
      'margin: 0;' +
      'line-height: 1.6;' +
      '}' +
      '@media (max-width: 768px) {' +
      '.feriados-modal-container {' +
      'top: 60px;' +
      'right: 10px;' +
      'left: 10px;' +
      'width: auto;' +
      'max-width: none;' +
      '}' +
      '.feriados-grid {' +
      'grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));' +
      'gap: 12px;' +
      '}' +
      '.feriado-card {' +
      'padding: 12px;' +
      '}' +
      '.feriado-date {' +
      'font-size: 24px;' +
      '}' +
      '}';

    document.head.appendChild(styles);
  }

  // Função para formatar data
  function formatDate(dateStr) {
    const parts = dateStr.split('-');
    const day = parts[2];
    const monthIndex = parseInt(parts[1]) - 1;
    
    const months = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
    ];
    
    return {
      day: day,
      month: months[monthIndex]
    };
  }

  // Função para criar modal de calendário
  function createCalendarModal() {
    // Remove modal existente
    const existingModal = document.getElementById('feriados-calendar-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = 'feriados-modal-overlay';
    overlay.id = 'feriados-modal-overlay';

    // Cria container do modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'feriados-modal-container';
    modalContainer.id = 'feriados-calendar-modal';

    // Header do modal
    const header = document.createElement('div');
    header.className = 'feriados-modal-header';

    const title = document.createElement('h2');
    title.className = 'feriados-modal-title';
    title.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 1024 1024" fill="none">' +
      '<path d="M736 256H800V864H224V256H288V192H224C206.3 192 192 206.3 192 224V864C192 881.7 206.3 896 224 896H800C817.7 896 832 881.7 832 864V224C832 206.3 817.7 192 800 192H736V256Z" fill="#FFD700"/>' +
      '<path d="M320 128H384V320H320V128Z" fill="#FFD700"/>' +
      '<path d="M640 128H704V320H640V128Z" fill="#FFD700"/>' +
      '<path d="M288 384H736V448H288V384Z" fill="#FFFFFF"/>' +
      '<path d="M288 512H480V576H288V512Z" fill="#FFFFFF"/>' +
      '<path d="M544 512H736V576H544V512Z" fill="#FFFFFF"/>' +
      '<path d="M288 640H480V704H288V640Z" fill="#FFFFFF"/>' +
      '<path d="M544 640H736V704H544V640Z" fill="#FFFFFF"/>' +
      '</svg>' +
      'Feriados 2025';

    const closeButton = document.createElement('button');
    closeButton.className = 'feriados-modal-close';
    closeButton.setAttribute('aria-label', 'Fechar calendário de feriados');
    closeButton.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 1024 1024" fill="none">' +
      '<path d="M224.8 832L512 544.8 799.2 832 832 799.2 544.8 512 832 224.8 799.2 192 512 479.2 224.8 192 192 224.8 479.2 512 192 799.2 224.8 832Z" fill="#FFFFFF"/>' +
      '</svg>';

    header.appendChild(title);
    header.appendChild(closeButton);

    // Conteúdo do modal
    const content = document.createElement('div');
    content.className = 'feriados-modal-content';

    // Grid de feriados
    const grid = document.createElement('div');
    grid.className = 'feriados-grid';

    CONFIG.feriados.forEach(function(feriado) {
      const formatted = formatDate(feriado.date);
      
      const card = document.createElement('div');
      card.className = 'feriado-card';
      card.setAttribute('data-feriado-date', feriado.date);
      
      card.innerHTML =
        '<p class="feriado-date">' + formatted.day + '</p>' +
        '<p class="feriado-month">' + formatted.month + '</p>' +
        '<p class="feriado-name">' + feriado.name + '</p>';
      
      // Adiciona evento de clique no card
      card.addEventListener('click', function() {
        analyticsEvent('feriado_card_clique ' + feriado.name, 'click');
        console.log('[Feriados] Card clicado: ' + feriado.name + ' (' + feriado.date + ')');
      });
      
      grid.appendChild(card);
    });

    // Informação adicional
    const info = document.createElement('div');
    info.className = 'feriados-info';
    info.innerHTML =
      '<p class="feriados-info-text">' +
      'Aproveite os feriados para viajar com a Azul! ' +
      'Clique em uma data para ver ofertas especiais.' +
      '</p>';

    content.appendChild(grid);
    content.appendChild(info);

    // Monta modal
    modalContainer.appendChild(header);
    modalContainer.appendChild(content);

    // Adiciona ao body
    document.body.appendChild(overlay);
    document.body.appendChild(modalContainer);

    // Event listeners para fechar
    closeButton.addEventListener('click', closeCalendarModal);
    overlay.addEventListener('click', closeCalendarModal);

    // Anima abertura
    setTimeout(function() {
      overlay.classList.add('open');
      modalContainer.classList.add('open');
      modalOpen = true;
      
      // Analytics de visualização
      analyticsEvent('modal_calendario_visualizacao', 'view');
    }, 10);

    console.log('[Feriados] Modal de calendário criado');
  }

  // Função para fechar modal
  function closeCalendarModal() {
    const overlay = document.getElementById('feriados-modal-overlay');
    const modal = document.getElementById('feriados-calendar-modal');

    if (overlay && modal) {
      overlay.classList.remove('open');
      modal.classList.remove('open');
      modalOpen = false;

      // Analytics de fechamento
      analyticsEvent('modal_calendario_fechamento', 'close');

      setTimeout(function() {
        if (overlay.parentNode) overlay.remove();
        if (modal.parentNode) modal.remove();
      }, 300);

      console.log('[Feriados] Modal de calendário fechado');
    }
  }

  // Função para adicionar botão no header
  function addFeriadosButton() {
    if (headerButtonAdded) return;

    const headerContainer = document.querySelector('.sc-1670f297-0.bLXhqb');
    if (!headerContainer) {
      console.log('[Feriados] Header container não encontrado ainda');
      return;
    }

    if (document.getElementById('feriados-button-azul')) {
      headerButtonAdded = true;
      return;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'sc-1670f297-0 dorVXL';
    buttonContainer.id = 'feriados-button-container';
    
    const buttonHTML = 
      '<div class="sc-lpYOg fUcwJx">' +
      '<div class="sc-bDumWk jSLXiK">' +
      '<button id="feriados-button-azul" title="Ver feriados disponíveis" aria-label="Feriados - Clique para ver datas de feriados" class="sc-hYmls bXOCIN">' +
      '<svg class="sc-fqkvVR hrYnzd" size="20" viewBox="0 0 1024 1024" fill="none" style="margin-right: 8px;">' +
      '<path d="M736 256H800V864H224V256H288V192H224C206.3 192 192 206.3 192 224V864C192 881.7 206.3 896 224 896H800C817.7 896 832 881.7 832 864V224C832 206.3 817.7 192 800 192H736V256Z" fill="#041E42"/>' +
      '<path d="M320 128H384V320H320V128Z" fill="#FFD700"/>' +
      '<path d="M640 128H704V320H640V128Z" fill="#FFD700"/>' +
      '<path d="M288 384H736V448H288V384Z" fill="#041E42"/>' +
      '<path d="M288 512H480V576H288V512Z" fill="#041E42"/>' +
      '<path d="M544 512H736V576H544V512Z" fill="#041E42"/>' +
      '<path d="M288 640H480V704H288V640Z" fill="#041E42"/>' +
      '<path d="M544 640H736V704H544V640Z" fill="#041E42"/>' +
      '</svg>' +
      '<p class="sc-dLMFU aQGqB sc-hBtRBD bKjPzh">' + CONFIG.buttonLabel + '</p>' +
      '</button>' +
      '</div>' +
      '</div>';

    buttonContainer.innerHTML = buttonHTML;

    const menuButton = headerContainer.querySelector('.sc-1670f297-0.dorVXL');
    if (menuButton) {
      headerContainer.insertBefore(buttonContainer, menuButton);
    } else {
      headerContainer.appendChild(buttonContainer);
    }

    const button = document.getElementById('feriados-button-azul');
    if (button) {
      if (!button.hasAttribute('data-analytics-added')) {
        button.addEventListener('click', function() {
          analyticsEvent('botao_header_clique', 'click');
          
          if (modalOpen) {
            closeCalendarModal();
          } else {
            createCalendarModal();
          }
        });
        button.setAttribute('data-analytics-added', 'true');
      }
      
      headerButtonAdded = true;
      console.log('[Feriados] Botão adicionado ao header com sucesso');
      
      analyticsEvent('botao_header_visualizacao', 'view');
    }
  }

  // Função de inicialização
  function init() {
    console.log('[Feriados] Iniciando script de destaque de feriados');

    // Adiciona estilos do modal
    addModalStyles();

    // Adiciona botão no header
    addFeriadosButton();

    // Observa mudanças no DOM
    observer = new MutationObserver(function() {
      if (!headerButtonAdded) {
        addFeriadosButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(function() {
      addFeriadosButton();
    }, 1000);

    console.log('[Feriados] Observador configurado');
  }

  // Inicializa quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
