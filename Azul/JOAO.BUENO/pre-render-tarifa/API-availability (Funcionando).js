(function AzulTariffInjector() {
    'use strict';
    console.clear();
    console.log("🚀 Iniciando Injetor de Tarifas (API -> Layout)...");

    // =========================================================================
    // 1. CSS (O visual "Clean" que definimos)
    // =========================================================================
    const styles = `
        .custom-tariff-container {
            display: flex;
            gap: 12px;
            padding: 15px 20px;
            width: 100%;
            background-color: #f4f6f8; /* Fundo cinza suave */
            border-top: 1px solid #e1e1e1;
            box-sizing: border-box;
            justify-content: flex-end; /* Alinha à direita */
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
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

        .tariff-title {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #666;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .custom-tariff-card.selected .tariff-title { color: #8ecfff; }

        .tariff-value {
            font-size: 18px;
            font-weight: 800;
            color: #026CB6;
            letter-spacing: -0.5px;
        }
        .custom-tariff-card.selected .tariff-value { color: #fff; }

        /* Ajuste para esconder o preço resumido original se quiser limpar a tela */
        /* .flight-card__fare .fare { display: none; } */
    `;

    if (!document.getElementById('azul-injector-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'azul-injector-styles';
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    // =========================================================================
    // 2. INTERCEPTADOR DE DADOS (O "Sniffer")
    // =========================================================================
    // Armazena os dados aqui: { "JOURNEY_KEY": [Array de Tarifas] }
    window.AZUL_FLIGHT_CACHE = {};

    function processarPayload(data) {
        const trips = data.data?.trips || data.trips || [];
        let foundData = false;

        trips.forEach(trip => {
            const journeys = trip.journeys || [];
            journeys.forEach(journey => {
                if (journey.journeyKey && journey.fares) {
                    // Armazena no cache global usando a chave do voo
                    window.AZUL_FLIGHT_CACHE[journey.journeyKey] = journey.fares;
                    foundData = true;
                }
            });
        });

        if (foundData) {
            console.log("✅ Dados de tarifas capturados. Atualizando layout...");
            atualizarLayout();
        }
    }

    // Hook no XHR (método mais comum nessa página)
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            if (url.includes('availability') || url.includes('bookings')) {
                try {
                    const response = JSON.parse(this.responseText);
                    processarPayload(response);
                } catch (e) {}
            }
        });
        originalXHR.apply(this, arguments);
    };

    // Hook no Fetch (para garantir)
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        const url = args[0].toString();
        if (url.includes('availability') || url.includes('bookings')) {
            const clone = response.clone();
            clone.json().then(processarPayload).catch(()=>{});
        }
        return response;
    };

    // =========================================================================
    // 3. RENDERIZADOR (O "Painter")
    // =========================================================================
    function formatMoney(val) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function atualizarLayout() {
        // Encontra todos os cards na tela
        const flightCards = document.querySelectorAll('.flight-card');

        flightCards.forEach(card => {
            // Verifica se já injetamos neste card
            if (card.querySelector('.custom-tariff-container')) return;

            // Pega o ID do HTML (que é a Journey Key)
            const cardId = card.id; 
            
            // Busca os dados no nosso Cache
            const faresData = window.AZUL_FLIGHT_CACHE[cardId];

            if (faresData && faresData.length > 0) {
                renderizarTarifasNoCard(card, faresData);
            }
        });
    }

    function renderizarTarifasNoCard(card, fares) {
        // Cria o container
        const container = document.createElement('div');
        container.className = 'custom-tariff-container';

        fares.forEach((fare, index) => {
            const nome = fare.productClass?.name || "Tarifa";
            const preco = fare.paxFares?.[0]?.totalAmount || 0;

            const box = document.createElement('div');
            box.className = 'custom-tariff-card';
            box.innerHTML = `
                <span class="tariff-title">${nome}</span>
                <span class="tariff-value">${formatMoney(preco)}</span>
            `;

            // --- Lógica de Clique (Proxy) ---
            // Quando clica no card customizado, ele seleciona a tarifa real
            box.onclick = async (e) => {
                e.stopPropagation();
                
                // Visual Selection
                container.querySelectorAll('.custom-tariff-card').forEach(b => b.classList.remove('selected'));
                box.classList.add('selected');

                // 1. Expande o card original (se fechado)
                const toggleBtn = card.querySelector('button[aria-label*="Ver tarifas"], div[role="button"][aria-label*="Ver tarifas"]');
                const isClosed = !card.classList.contains('flight-card--opened');
                
                if (isClosed && toggleBtn) {
                    toggleBtn.click();
                    // Espera renderizar o DOM original do React
                    await new Promise(r => setTimeout(r, 300));
                }

                // 2. Clica no botão "Selecionar" correspondente
                const fareItems = card.querySelectorAll('.fare-item');
                const targetItem = fareItems[index]; // Assume que a ordem da API é a mesma do DOM
                
                if (targetItem) {
                    const selectBtn = targetItem.querySelector('button');
                    if (selectBtn) {
                        selectBtn.click();
                        console.log(`✅ Tarifa ${nome} selecionada!`);
                        
                        // Scroll suave para feedback
                        targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            };

            container.appendChild(box);
        });

        // INJEÇÃO: Adiciona dentro do card principal
        // Estamos adicionando ao final do .card (container interno)
        const cardInner = card.querySelector('.card');
        if (cardInner) {
            cardInner.appendChild(container);
            // Opcional: Adicionar classe ao pai para ajustes de CSS se necessário
            card.classList.add('has-custom-fares');
        }
    }

    // Tenta rodar uma vez no início caso o cache já tenha algo (se recarregou script)
    atualizarLayout();

})();