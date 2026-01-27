/**
 * Azul - Destaque de Feriados
 * Adiciona botão FERIADOS no header e destaca datas no calendário
 */

(function () {
  'use strict';

  // Configuração de feriados 2025 (formato: 'YYYY-MM-DD')
  const FERIADOS_2025 = [
    '2025-01-01', // Ano Novo
    '2025-02-28', // Carnaval (sexta)
    '2025-03-01', // Carnaval (sábado)
    '2025-03-02', // Carnaval (domingo)
    '2025-03-03', // Carnaval (segunda)
    '2025-03-04', // Carnaval (terça)
    '2025-04-18', // Paixão de Cristo
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalho
    '2025-06-19', // Corpus Christi
    '2025-09-07', // Independência
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15', // Proclamação da República
    '2025-11-20', // Consciência Negra
    '2025-12-25', // Natal
    '2025-12-31', // Réveillon
  ];

  // Configuração
  const CONFIG = {
    feriados: FERIADOS_2025,
    buttonLabel: 'FERIADOS',
    badgeLabel: 'Feriado',
    highlightColor: '#FFD700', // Dourado
    badgeColor: '#FF6B6B', // Vermelho claro
  };

  let observer = null;
  let headerButtonAdded = false;

  // Função para adicionar botão no header
  function addFeriadosButton() {
    if (headerButtonAdded) return;

    const headerContainer = document.querySelector('.sc-1670f297-0.bLXhqb');
    if (!headerContainer) {
      console.log('[Feriados] Header container não encontrado ainda');
      return;
    }

    // Verifica se botão já existe
    if (document.getElementById('feriados-button-azul')) {
      headerButtonAdded = true;
      return;
    }

    // Cria container para o botão
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'sc-1670f297-0 dorVXL';
    buttonContainer.id = 'feriados-button-container';
    
    // HTML do botão (estrutura similar aos outros botões do header)
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

    // Insere antes do último botão (Menu)
    const menuButton = headerContainer.querySelector('.sc-1670f297-0.dorVXL');
    if (menuButton) {
      headerContainer.insertBefore(buttonContainer, menuButton);
    } else {
      headerContainer.appendChild(buttonContainer);
    }

    // Adiciona evento de clique
    const button = document.getElementById('feriados-button-azul');
    if (button) {
      button.addEventListener('click', scrollToCalendar);
      headerButtonAdded = true;
      console.log('[Feriados] Botão adicionado ao header com sucesso');
    }
  }

  // Função para rolar até o calendário
  function scrollToCalendar() {
    // Procura pelo calendário na página
    const calendar = document.querySelector('[data-testid="calendar"]') || 
                     document.querySelector('.react-calendar') ||
                     document.querySelector('[class*="calendar"]');
    
    if (calendar) {
      calendar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      console.log('[Feriados] Scrolled para calendário');
    } else {
      console.log('[Feriados] Calendário não encontrado na página');
    }
  }

  // Função para destacar feriados no calendário
  function highlightFeriados() {
    // Procura por elementos de data no calendário
    const dateElements = document.querySelectorAll(
      '[class*="calendar"] button[aria-label*="202"], ' +
      '[class*="react-calendar"] button, ' +
      '[data-testid="calendar"] button'
    );

    if (dateElements.length === 0) return;

    let highlightedCount = 0;

    dateElements.forEach((dateEl) => {
      // Verifica se já foi processado
      if (dateEl.hasAttribute('data-feriado-processed')) return;

      // Tenta extrair a data do aria-label ou data-date
      const ariaLabel = dateEl.getAttribute('aria-label') || '';
      const dataDate = dateEl.getAttribute('data-date') || '';
      
      let dateStr = '';
      
      // Tenta extrair data do aria-label (ex: "15 de janeiro de 2025")
      const dateMatch = ariaLabel.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const monthName = dateMatch[2];
        const year = dateMatch[3];
        
        const months = {
          'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
          'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
          'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
        };
        
        const month = months[monthName.toLowerCase()];
        if (month) {
          dateStr = year + '-' + month + '-' + day;
        }
      } else if (dataDate) {
        dateStr = dataDate;
      }

      // Verifica se é feriado
      if (dateStr && CONFIG.feriados.includes(dateStr)) {
        // Aplica estilo de destaque
        dateEl.style.setProperty('background-color', CONFIG.highlightColor, 'important');
        dateEl.style.setProperty('border', '2px solid ' + CONFIG.badgeColor, 'important');
        dateEl.style.setProperty('font-weight', '700', 'important');
        dateEl.style.setProperty('position', 'relative', 'important');

        // Adiciona badge "Feriado" se não existir
        if (!dateEl.querySelector('.feriado-badge')) {
          const badge = document.createElement('span');
          badge.className = 'feriado-badge';
          badge.textContent = CONFIG.badgeLabel;
          badge.style.setProperty('position', 'absolute', 'important');
          badge.style.setProperty('bottom', '2px', 'important');
          badge.style.setProperty('left', '50%', 'important');
          badge.style.setProperty('transform', 'translateX(-50%)', 'important');
          badge.style.setProperty('background-color', CONFIG.badgeColor, 'important');
          badge.style.setProperty('color', '#FFFFFF', 'important');
          badge.style.setProperty('font-size', '9px', 'important');
          badge.style.setProperty('padding', '2px 4px', 'important');
          badge.style.setProperty('border-radius', '4px', 'important');
          badge.style.setProperty('font-weight', '600', 'important');
          badge.style.setProperty('z-index', '10', 'important');
          
          dateEl.appendChild(badge);
        }

        dateEl.setAttribute('data-feriado-processed', 'true');
        highlightedCount++;
      }
    });

    if (highlightedCount > 0) {
      console.log('[Feriados] Destacados ' + highlightedCount + ' feriados no calendário');
    }
  }

  // Função de inicialização
  function init() {
    console.log('[Feriados] Iniciando script de destaque de feriados');

    // Adiciona botão no header
    addFeriadosButton();

    // Observa mudanças no DOM para detectar calendários
    observer = new MutationObserver(() => {
      // Tenta adicionar botão se ainda não foi adicionado
      if (!headerButtonAdded) {
        addFeriadosButton();
      }

      // Destaca feriados no calendário
      highlightFeriados();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Execução inicial
    setTimeout(() => {
      addFeriadosButton();
      highlightFeriados();
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
