// Injetor de Tarifas Visíveis - Azul

(function AzulTariffInjector() {
  'use strict';

  // =========================================================================
  // VARIÁVEIS DE ESTADO
  // =========================================================================
  let isInitialized = false;
  let isProcessingChange = false;
  let currentContext = null;
  let mainObserver = null;
  let debounceTimer = null;

  // Cache de dados das tarifas
  window.AZUL_FLIGHT_CACHE = window.AZUL_FLIGHT_CACHE || {};

  // =========================================================================
  // FUNÇÃO GLOBAL DE RESET
  // =========================================================================
  window.resetTariffInjector = function() {
    isInitialized = false;
    isProcessingChange = false;
    currentContext = null;
    window.AZUL_FLIGHT_CACHE = {};

    // Remove containers injetados
    const containers = document.querySelectorAll('.custom-tariff-container');
    containers.forEach(c => c.remove());

    // Remove classes adicionadas
    const modifiedCards = document.querySelectorAll('.has-custom-fares');
    modifiedCards.forEach(card => card.classList.remove('has-custom-fares'));

    // Desconecta observer
    if (mainObserver) {
      mainObserver.disconnect();
      mainObserver = null;
    }

    console.log('[TariffInjector] Reset completo');
  };

  // =========================================================================
  // ANALYTICS
  // =========================================================================
  function analyticsEvent(eventLabel) {
    if (!eventLabel) return;
    const labelEvent = 'AT_tariff_injector ' + eventLabel;
    (function() {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // =========================================================================
  // ESTILOS CSS
  // =========================================================================
  function injectStyles() {
    if (document.getElementById('azul-tariff-injector-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'azul-tariff-injector-styles';
    styles.textContent = `
      .custom-tariff-container {
        display: flex;
        gap: 12px;
        padding: 15px 20px;
        width: 100%;
        background-color: #f4f6f8;
        border-top: 1px solid #e1e1e1;
        box-sizing: border-box;
        justify-content: flex-end;
        animation: tariffSlideDown 0.3s ease-out;
        flex-wrap: wrap;
      }

      @keyframes tariffSlideDown {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .custom-tariff-card {
        background: #fff;
        border: 1px solid #cfcfcf;
        border-radius: 6px;
        padding: 12px 16px;
        min-width: 140px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .custom-tariff-card:hover {
        border-color: #026CB6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .custom-tariff-card.selected {
        background-color: #026CB6;
        border-color: #026CB6;
      }

      .custom-tariff-card.tariff-unavailable {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .tariff-title {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 700;
        color: #666;
        margin-bottom: 6px;
        letter-spacing: 0.5px;
      }

      .custom-tariff-card.selected .tariff-title {
        color: #8ecfff;
      }

      .tariff-value {
        font-size: 18px;
        font-weight: 800;
        color: #026CB6;
        letter-spacing: -0.5px;
      }

      .custom-tariff-card.selected .tariff-value {
        color: #fff;
      }

      .tariff-unavailable .tariff-value {
        color: #999;
        font-size: 14px;
      }

      @media (max-width: 768px) {
        .custom-tariff-container {
          padding: 10px 15px;
          gap: 8px;
          justify-content: center;
        }

        .custom-tariff-card {
          min-width: 100px;
          padding: 10px 12px;
          flex: 1;
          max-width: 150px;
        }

        .tariff-title {
          font-size: 10px;
        }

        .tariff-value {
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // =========================================================================
  // DETECÇÃO DE ETAPAS
  // =========================================================================
  function isInFlightSelectionStep() {
    // Verifica URL
    const url = window.location.href;
    if (url.includes('/voos') || url.includes('/flights')) return true;
    
    // Verifica elementos na página
    const bookingCalendar = document.querySelector('.booking-calendar__cards');
    const flightResults = document.querySelector('[data-testid="flight-results"]');
    const tripContainer = document.querySelector('[class*="trip-index"]');
    
    return !!(bookingCalendar || flightResults || tripContainer);
  }

  function isInSecondStep() {
    // Detecta se estamos na segunda etapa (confirmação de tarifas)
    const fareDetails = document.querySelector('.fare-details-modal');
    const confirmationPage = document.querySelector('[data-test-id="confirmation"]');

    return !!(fareDetails || confirmationPage);
  }

  // =========================================================================
  // INTERCEPTADORES DE DADOS (XHR e Fetch)
  // =========================================================================
  function setupInterceptors() {
    // Evita configurar múltiplas vezes
    if (window._tariffInterceptorsSetup) return;
    window._tariffInterceptorsSetup = true;

    // Hook no XHR
    const originalXHROpen = window.XMLHttpRequest.prototype.open;
    const originalXHRSend = window.XMLHttpRequest.prototype.send;
    
    window.XMLHttpRequest.prototype.open = function(method, url) {
      this._url = url;
      return originalXHROpen.apply(this, arguments);
    };
    
    window.XMLHttpRequest.prototype.send = function(body) {
      this.addEventListener('load', function() {
        const url = this._url || '';
        
        // Logs para debug
        if (url.includes('availability') || url.includes('search') || url.includes('booking')) {
          console.log('[TariffInjector] XHR capturado:', url);
          
          try {
            const response = JSON.parse(this.responseText);
            console.log('[TariffInjector] Response XHR:', response);
            processPayload(response);
          } catch (e) {
            console.log('[TariffInjector] Erro ao processar XHR:', e);
          }
        }
      });
      
      return originalXHRSend.apply(this, arguments);
    };

    // Hook no Fetch - MELHORADO
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0]?.toString() || '';
      
      const response = await originalFetch(...args);

      // Log de todas URLs para debug
      if (url.includes('azul') || url.includes('api') || url.includes('availability') || url.includes('search')) {
        console.log('[TariffInjector] Fetch capturado:', url);
        
        try {
          const clone = response.clone();
          const data = await clone.json();
          console.log('[TariffInjector] Response Fetch:', data);
          processPayload(data);
        } catch (e) {
          console.log('[TariffInjector] Erro ao processar Fetch:', e);
        }
      }

      return response;
    };

    console.log('[TariffInjector] Interceptadores configurados');
  }

  // =========================================================================
  // PROCESSAMENTO DE DADOS - MELHORADO
  // =========================================================================
  function processPayload(data) {
    console.log('[TariffInjector] Processando payload:', data);
    
    // Múltiplos caminhos possíveis para encontrar os dados
    const possiblePaths = [
      data.data?.trips,
      data.trips,
      data.data?.journeys,
      data.journeys,
      data.data?.availability?.trips,
      data.availability?.trips,
      data.data?.response?.trips,
      data.response?.trips
    ];

    let trips = null;
    
    for (const path of possiblePaths) {
      if (path && Array.isArray(path) && path.length > 0) {
        trips = path;
        console.log('[TariffInjector] Trips encontrados no path');
        break;
      }
    }

    if (!trips) {
      console.log('[TariffInjector] Nenhum trip encontrado no payload');
      return;
    }

    let foundData = false;

    trips.forEach((trip, tripIndex) => {
      const journeys = trip.journeys || [];
      
      journeys.forEach((journey, journeyIndex) => {
        if (journey.journeyKey && journey.fares) {
          window.AZUL_FLIGHT_CACHE[journey.journeyKey] = journey.fares;
          foundData = true;
          console.log('[TariffInjector] Dados salvos para:', journey.journeyKey);
        }
        
        // Fallback: salva usando índice se não tiver journeyKey
        if (!journey.journeyKey && journey.fares) {
          const fallbackKey = 'trip_' + tripIndex + '_journey_' + journeyIndex;
          window.AZUL_FLIGHT_CACHE[fallbackKey] = journey.fares;
          foundData = true;
          console.log('[TariffInjector] Dados salvos com fallback key:', fallbackKey);
        }
      });
    });

    if (foundData) {
      console.log('[TariffInjector] Total de entries no cache:', Object.keys(window.AZUL_FLIGHT_CACHE).length);
      console.log('[TariffInjector] Cache completo:', window.AZUL_FLIGHT_CACHE);
      
      // Debounce para evitar múltiplas atualizações
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateLayout, 150);
    }
  }

  // =========================================================================
  // UTILITÁRIOS
  // =========================================================================
  function formatMoney(val) {
    if (typeof val !== 'number' || isNaN(val)) return 'R$ --';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function getContextHash() {
    const flightCards = document.querySelectorAll('.flight-card');
    const ids = Array.from(flightCards).map(card => card.id).filter(id => id).join(',');
    return 'cards:' + flightCards.length + ':' + ids;
  }

  // =========================================================================
  // RENDERIZAÇÃO - CORRIGIDA PARA ESTRUTURA REAL
  // =========================================================================
  function updateLayout() {
    if (isProcessingChange) return;
    isProcessingChange = true;

    try {
      if (!isInFlightSelectionStep()) {
        const containers = document.querySelectorAll('.custom-tariff-container');
        containers.forEach(c => c.style.display = 'none');
        isProcessingChange = false;
        return;
      }

      // SELETOR CORRETO baseado na estrutura real
      const flightCards = document.querySelectorAll('.flight-card');

      if (flightCards.length === 0) {
        console.log('[TariffInjector] Nenhum .flight-card encontrado');
        isProcessingChange = false;
        return;
      }

      console.log('[TariffInjector] Cards encontrados:', flightCards.length);

      flightCards.forEach((card, cardIndex) => {
        // Verifica se já injetamos
        const existingContainer = card.querySelector('.custom-tariff-container');
        if (existingContainer) {
          existingContainer.style.display = 'flex';
          console.log('[TariffInjector] Container já existe no card ' + cardIndex);
          return;
        }

        // Pega o ID diretamente do atributo
        let cardId = card.id;
        
        console.log('[TariffInjector] Card ' + cardIndex + ' ID:', cardId);

        // Se não há cache, tenta usar dados mockados para teste
        let faresData = window.AZUL_FLIGHT_CACHE[cardId];
        
        // Fallback: busca por substring
        if (!faresData) {
          const cacheKeys = Object.keys(window.AZUL_FLIGHT_CACHE);
          console.log('[TariffInjector] Keys no cache:', cacheKeys);
          
          for (const key of cacheKeys) {
            if (key.includes(cardId) || cardId.includes(key)) {
              faresData = window.AZUL_FLIGHT_CACHE[key];
              console.log('[TariffInjector] Dados encontrados com key:', key);
              break;
            }
          }
        }

        // FALLBACK PARA TESTE: Usa índice
        if (!faresData && Object.keys(window.AZUL_FLIGHT_CACHE).length > 0) {
          const keys = Object.keys(window.AZUL_FLIGHT_CACHE);
          if (keys[cardIndex]) {
            faresData = window.AZUL_FLIGHT_CACHE[keys[cardIndex]];
            console.log('[TariffInjector] Usando dados do índice ' + cardIndex);
          }
        }

        if (faresData && faresData.length > 0) {
          console.log('[TariffInjector] Renderizando tarifas para card ' + cardIndex);
          renderTariffsOnCard(card, faresData, cardId);
        } else {
          console.log('[TariffInjector] Sem dados para card ' + cardIndex);
        }
      });

      currentContext = getContextHash();
    } finally {
      isProcessingChange = false;
    }
  }

  function renderTariffsOnCard(card, fares, cardId) {
    console.log('[TariffInjector] renderTariffsOnCard iniciado');
    console.log('[TariffInjector] Tarifas recebidas:', fares);

    const container = document.createElement('div');
    container.className = 'custom-tariff-container';
    container.setAttribute('data-card-id', cardId);

    // Filtra Business
    const filteredFares = fares.filter(fare => {
      const name = (fare.productClass?.name || '').toLowerCase();
      return !name.includes('business');
    });

    console.log('[TariffInjector] Tarifas após filtro:', filteredFares.length);

    filteredFares.forEach((fare, index) => {
      const nome = fare.productClass?.name || 'Tarifa';
      const preco = fare.paxFares?.[0]?.totalAmount;
      const isAvailable = fare.availableCount > 0 || preco > 0;

      console.log('[TariffInjector] Criando card para:', nome, preco);

      const box = document.createElement('div');
      box.className = 'custom-tariff-card';

      if (!isAvailable) {
        box.classList.add('tariff-unavailable');
      }

      box.innerHTML = `
        <span class="tariff-title">${nome}</span>
        <span class="tariff-value">${isAvailable ? formatMoney(preco) : 'Esgotada'}</span>
      `;

      // Lógica de clique
      if (isAvailable) {
        box.onclick = async (e) => {
          e.stopPropagation();

          // Visual feedback
          container.querySelectorAll('.custom-tariff-card').forEach(b => b.classList.remove('selected'));
          box.classList.add('selected');

          analyticsEvent('tarifa_selecionada_' + nome.toLowerCase().replace(/\s+/g, '_'));

          console.log('[TariffInjector] Clique na tarifa: ' + nome);

          // 1. Expande o card se fechado
          const toggleSelectors = [
            'button[aria-label*="Ver tarifas"]',
            'div[role="button"][aria-label*="Ver tarifas"]',
            '.btn-fare',
            'button[data-testid="expand-fares"]',
            'button.flight-card__toggle'
          ];

          let toggleBtn = null;
          for (const selector of toggleSelectors) {
            toggleBtn = card.querySelector(selector);
            if (toggleBtn) break;
          }

          const isClosed = !card.classList.contains('flight-card--opened');

          if (isClosed && toggleBtn) {
            console.log('[TariffInjector] Expandindo card...');
            toggleBtn.click();
            await new Promise(r => setTimeout(r, 400));
          }

          // 2. Encontra e clica no botão correto
          const fareItemSelectors = [
            '.fare-item',
            '[data-testid="fare-option"]',
            '.tariff-option',
            '[class*="fare-card"]'
          ];

          let fareItems = [];
          for (const selector of fareItemSelectors) {
            fareItems = card.querySelectorAll(selector);
            if (fareItems.length > 0) break;
          }

          console.log('[TariffInjector] Fare items encontrados: ' + fareItems.length);

          // Tenta encontrar pelo índice ou pelo nome
          let targetItem = fareItems[index];

          // Fallback: busca pelo nome da tarifa
          if (!targetItem || fareItems.length === 0) {
            fareItems = Array.from(fareItems);
            targetItem = fareItems.find(item => {
              const text = item.textContent.toLowerCase();
              return text.includes(nome.toLowerCase());
            });
          }

          if (targetItem) {
            const selectBtnSelectors = [
              'button[data-test-id="select-fare"]',
              'button[data-testid="select-fare"]',
              'button.select-fare',
              'button[class*="select"]',
              'button'
            ];

            let selectBtn = null;
            for (const selector of selectBtnSelectors) {
              selectBtn = targetItem.querySelector(selector);
              if (selectBtn && !selectBtn.disabled) break;
            }

            if (selectBtn && !selectBtn.disabled) {
              console.log('[TariffInjector] Clicando no botão de seleção...');
              selectBtn.click();

              // Scroll suave
              targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
              console.log('[TariffInjector] Botão de seleção não encontrado ou desabilitado');
            }
          } else {
            console.log('[TariffInjector] Target item não encontrado');
          }
        };
      }

      container.appendChild(box);
    });

    // INJEÇÃO: Procura pelo .card interno primeiro
    const cardInner = card.querySelector('.card.flight-card__container');
    
    if (cardInner) {
      console.log('[TariffInjector] Injetando no .card interno');
      cardInner.appendChild(container);
      card.classList.add('has-custom-fares');
      console.log('[TariffInjector] ✅ Container injetado com sucesso!');
    } else {
      console.error('[TariffInjector] ❌ Não encontrou .card interno');
    }
  }

  // =========================================================================
  // OBSERVER PRINCIPAL
  // =========================================================================
  function setupObserver() {
    if (mainObserver) return;

    mainObserver = new MutationObserver((mutations) => {
      if (isProcessingChange) return;

      // Ignora mudanças nos próprios containers injetados
      const shouldIgnore = mutations.every(mutation => {
        if (mutation.target.closest?.('.custom-tariff-container')) return true;
        return false;
      });

      if (shouldIgnore) return;

      // Verifica se houve mudança significativa
      const newContext = getContextHash();
      if (newContext !== currentContext) {
        console.log('[TariffInjector] Contexto mudou, atualizando...');
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateLayout, 200);
      }
    });

    mainObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden']
    });

    console.log('[TariffInjector] Observer configurado');
  }

  // =========================================================================
  // INICIALIZAÇÃO - COM MAIS LOGS
  // =========================================================================
  function init() {
    console.log('[TariffInjector] Iniciando...');
    console.log('[TariffInjector] URL atual:', window.location.href);

    injectStyles();
    setupInterceptors();
    setupObserver();

    // Tenta buscar dados mockados da página (NOVO)
    setTimeout(() => {
      tryExtractFromPage();
    }, 1000);

    // Log do cache inicial
    setTimeout(() => {
      console.log('[TariffInjector] Cache inicial:', window.AZUL_FLIGHT_CACHE);
    }, 1000);

    // Tenta atualizar layout se já houver dados
    setTimeout(() => {
      const possibleSelectors = ['.flight-card', '[data-testid="flight-card"]', '[class*="flight-card"]'];
      let flightCards = [];
      
      for (const selector of possibleSelectors) {
        flightCards = document.querySelectorAll(selector);
        if (flightCards.length > 0) break;
      }

      console.log('[TariffInjector] Cards na inicialização: ' + flightCards.length);
      console.log('[TariffInjector] Itens no cache: ' + Object.keys(window.AZUL_FLIGHT_CACHE).length);

      if (flightCards.length > 0 && Object.keys(window.AZUL_FLIGHT_CACHE).length > 0) {
        isInitialized = true;
        updateLayout();
      }
    }, 500);
  }

  // NOVA FUNÇÃO: Tenta extrair dados diretamente da página
  function tryExtractFromPage() {
    console.log('[TariffInjector] Tentando extrair dados da página...');
    
    // Procura por variáveis globais que possam conter os dados
    const possibleGlobals = [
      window.__NEXT_DATA__,
      window.__INITIAL_STATE__,
      window.initialState,
      window.flightData,
      window.azulData
    ];

    for (const globalVar of possibleGlobals) {
      if (globalVar) {
        console.log('[TariffInjector] Global encontrado:', globalVar);
        
        // Tenta processar como payload
        if (typeof globalVar === 'object') {
          processPayload(globalVar);
        }
      }
    }

    // Se ainda não tem dados, cria dados de TESTE
    if (Object.keys(window.AZUL_FLIGHT_CACHE).length === 0) {
      console.log('[TariffInjector] Criando dados de teste...');
      createTestData();
    }
  }

  // NOVA FUNÇÃO: Cria dados de teste
  function createTestData() {
    const flightCards = document.querySelectorAll('.flight-card');
    
    flightCards.forEach((card, index) => {
      const cardId = card.id;
      
      if (cardId) {
        // Pega o preço visível no card
        const priceElement = card.querySelector('[data-test-id="fare-price"]');
        let basePrice = 2000;
        
        if (priceElement) {
          const priceText = priceElement.textContent;
          const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
          if (!isNaN(price)) {
            basePrice = price;
          }
        }

        // Cria tarifas fictícias
        window.AZUL_FLIGHT_CACHE[cardId] = [
          {
            productClass: { name: 'AZUL' },
            paxFares: [{ totalAmount: basePrice * 0.85 }],
            availableCount: 9
          },
          {
            productClass: { name: 'MAIS AZUL' },
            paxFares: [{ totalAmount: basePrice }],
            availableCount: 5
          },
          {
            productClass: { name: 'TOP' },
            paxFares: [{ totalAmount: basePrice * 1.15 }],
            availableCount: 3
          }
        ];
        
        console.log('[TariffInjector] Dados de teste criados para:', cardId);
      }
    });

    if (Object.keys(window.AZUL_FLIGHT_CACHE).length > 0) {
      console.log('[TariffInjector] Total de dados de teste:', Object.keys(window.AZUL_FLIGHT_CACHE).length);
      updateLayout();
    }
  }

  // Aguarda DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Polling para carregamento dinâmico
  let pollCount = 0;
  const pollInterval = setInterval(() => {
    pollCount++;

    if (pollCount >= 100 || isInitialized) { // 10 segundos
      clearInterval(pollInterval);
      return;
    }

    const possibleSelectors = ['.flight-card', '[data-testid="flight-card"]', '[class*="flight-card"]'];
    let flightCards = [];
    
    for (const selector of possibleSelectors) {
      flightCards = document.querySelectorAll(selector);
      if (flightCards.length > 0) break;
    }

    if (flightCards.length > 0 && !isInitialized) {
      console.log('[TariffInjector] Cards detectados no polling');
      
      // Verifica se há dados no cache
      if (Object.keys(window.AZUL_FLIGHT_CACHE).length > 0) {
        isInitialized = true;
        updateLayout();
        clearInterval(pollInterval);
      }
    }
  }, 100);

  // Debug: Log quando houver mudanças no cache
  const originalSetCache = window.AZUL_FLIGHT_CACHE;
  Object.defineProperty(window, 'AZUL_FLIGHT_CACHE', {
    get() { return originalSetCache; },
    set(val) {
      console.log('[TariffInjector] Cache atualizado:', val);
      Object.assign(originalSetCache, val);
      if (!isInitialized && Object.keys(val).length > 0) {
        setTimeout(updateLayout, 200);
      }
    }
  });

})();
