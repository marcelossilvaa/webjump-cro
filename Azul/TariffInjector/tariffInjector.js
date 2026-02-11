(function AzulTariffInjector() {
    'use strict';

    console.clear();
    console.log("🚀 Iniciando Injetor de Tarifas (API -> Layout)...");

    // Flag de controle
    let dadosCapturados = false;

    // =========================================================================
    // 🐛 DEBUG MODE - Ative/Desative aqui
    // =========================================================================
    const DEBUG_MODE = true;

    function debugLog(titulo, dados) {
        if (!DEBUG_MODE) return;
        console.group(`🐛 DEBUG: ${titulo}`);
        console.log(dados);
        console.groupEnd();
    }

    // =========================================================================
    // 1. CSS (O visual "Clean" que definimos)
    // =========================================================================
    const styles = `
        .flight-card__info{
            max-width: 312px!important;
            padding: 0px!important;
        }
        .css-7ip4ly .details > svg{
                    min-width: 20px;
        }

        .flight-card__info .info{
            max-width: 370px!important;
        }

        .flight-card__container{
            justify-content: space-between !important;
            padding: 10px;
        }

        .css-gtajxx{
            max-width: 312px!important;
        }

        .flight-card__fare, .fareIndex-0, .fareIndex-1, .fareIndex-2, .fareIndex-3, .fareIndex-4 {
            display: none !important;
        }

        .css-7ip4ly{
            max-width: calc(80% - 136px)!important;
        }

        .custom-tariff-container {
            display: flex;
            gap: 8px;
            background-color: #f4f6f8;
            box-sizing: border-box;
            justify-content: flex-end;
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

        /* Estilo especial para Business */
        .custom-tariff-card.business {
            background: linear-gradient(91.12deg, rgb(31, 81, 141) 0%, rgb(18, 56, 105) 53.65%, rgb(4, 30, 66) 100%);
            border-color: rgb(4, 30, 66);
            border-radius: 6px;
        }

        .custom-tariff-card.business .tariff-title {
            color: #fff;
            background: transparent;
        }

        .custom-tariff-card.business .tariff-value {
            color: #fff;
        }

        .custom-tariff-card.business:hover {
            border-color: rgb(31, 81, 141);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(4, 30, 66, 0.4);
        }

        .custom-tariff-card.business.selected {
            background: linear-gradient(91.12deg, rgb(31, 81, 141) 0%, rgb(18, 56, 105) 53.65%, rgb(4, 30, 66) 100%);
            border-color: rgb(31, 81, 141);
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }

        .custom-tariff-card.sold-out {
            background-color: rgb(235, 235, 235);
            color: rgb(96, 96, 96);
            cursor: not-allowed;
            outline: none;
            border-color: #d0d0d0;
        }

        .custom-tariff-card.sold-out:hover {
            transform: none;
            box-shadow: none;
            border-color: #d0d0d0;
        }

        /* Título das tarifas normais (não Business) */
        .tariff-title {
            font-size: 11px;
            text-transform: capitalize;
            font-weight: 700;
            color: rgb(2, 108, 182);
            background: rgba(1, 78, 132, 0.08);
            border-radius: 2px;
            padding: 4px 8px;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 4px;
            width: fit-content;
        }
        
        .tariff-title svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .tariff-value {
            font-size: 18px;
            font-weight: 800;
            color: #026CB6;
            letter-spacing: -0.5px;
        }
        
        .custom-tariff-card.selected .tariff-value { color: #fff; }
        .custom-tariff-card.selected .tariff-title { 
            color: #fff; 
            background: rgba(255, 255, 255, 0.2);
        }
        .custom-tariff-card.sold-out .tariff-title { 
            color: rgb(96, 96, 96); 
            background: transparent;
        }
        .custom-tariff-card.sold-out .tariff-value { 
            color: rgb(96, 96, 96); 
            font-size: 14px;
            font-weight: 600;
        }
    `;

    function aplicarEstilos() {
        if (!document.getElementById('azul-injector-styles')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'azul-injector-styles';
            styleSheet.innerText = styles;
            document.head.appendChild(styleSheet);
            console.log("✅ CSS aplicado com sucesso");
        }
    }

    // =========================================================================
    // 2. INTERCEPTADOR DE DADOS (O "Sniffer")
    // =========================================================================
    // Armazena os dados aqui: { "JOURNEY_KEY": [Array de Tarifas] }
    window.AZUL_FLIGHT_CACHE = {};

    function processarPayload(data) {
        try {
            debugLog("Payload Completo Recebido", data);

            const trips = data.data?.trips || data.trips || [];
            debugLog("Trips Encontradas", { total: trips.length, trips });

            let foundData = false;

            trips.forEach((trip, tripIndex) => {
                const journeys = trip.journeys || [];
                debugLog(`Trip ${tripIndex} - Journeys`, { total: journeys.length, journeys });

                journeys.forEach((journey, journeyIndex) => {
                    debugLog(`Journey ${journeyIndex} - Dados Completos`, {
                        journeyKey: journey.journeyKey,
                        fares: journey.fares,
                        designator: journey.designator,
                        segments: journey.segments
                    });

                    if (journey.journeyKey && journey.fares) {
                        window.AZUL_FLIGHT_CACHE[journey.journeyKey] = journey.fares;
                        foundData = true;

                        // Debug detalhado de cada tarifa
                        journey.fares.forEach((fare, fareIndex) => {
                            debugLog(`Tarifa ${fareIndex} - ${journey.journeyKey}`, {
                                nome: fare.productClass?.name,
                                code: fare.productClass?.code,
                                preco: fare.paxFares?.[0]?.totalAmount,
                                fareKey: fare.fareKey,
                                available: fare.isAvailable,
                                dadosCompletos: fare
                            });
                        });
                    }
                });
            });

            if (foundData) {
                console.log("📦 Cache Atualizado:", window.AZUL_FLIGHT_CACHE);
                
                if (!dadosCapturados) {
                    aplicarEstilos();
                    dadosCapturados = true;
                }
                console.log("✅ Dados de tarifas capturados. Atualizando layout...");
                atualizarLayout();
            } else {
                console.warn("⚠️ Nenhum dado válido encontrado no payload");
            }
        } catch (error) {
            console.error("❌ Erro ao processar payload:", error);
            debugLog("Erro Detalhado", { error, stack: error.stack });
        }
    }

    // Hook no XHR (método mais comum nessa página)
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            if (url.includes('availability') || url.includes('bookings')) {
                debugLog("XHR Interceptado", { method, url, status: this.status });
                try {
                    const response = JSON.parse(this.responseText);
                    processarPayload(response);
                } catch (e) {
                    console.error("❌ Erro ao parsear resposta XHR:", e);
                    debugLog("Resposta XHR Raw", this.responseText.substring(0, 500));
                }
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
            debugLog("Fetch Interceptado", { url, status: response.status });
            const clone = response.clone();
            clone.json().then(processarPayload).catch((e) => {
                console.error("❌ Erro ao processar fetch:", e);
                debugLog("Erro no Fetch", e);
            });
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
        const flightCards = document.querySelectorAll('.flight-card');
        debugLog("Cards na Página", { total: flightCards.length });

        flightCards.forEach((card, cardIndex) => {
            if (card.querySelector('.custom-tariff-container')) {
                debugLog(`Card ${cardIndex}`, "Já possui tarifas customizadas");
                return;
            }

            const cardId = card.id;
            debugLog(`Card ${cardIndex} - Análise`, {
                id: cardId,
                classes: card.className,
                possuiDados: !!window.AZUL_FLIGHT_CACHE[cardId]
            });
            
            const faresData = window.AZUL_FLIGHT_CACHE[cardId];

            if (faresData && faresData.length > 0) {
                debugLog(`Card ${cardIndex} - Renderizando`, {
                    cardId,
                    quantidadeTarifas: faresData.length,
                    tarifas: faresData.map(f => ({
                        nome: f.productClass?.name,
                        preco: f.paxFares?.[0]?.totalAmount
                    }))
                });
                renderizarTarifasNoCard(card, faresData);
            } else {
                debugLog(`Card ${cardIndex} - Sem Dados`, { cardId });
            }
        });
    }

    function renderizarTarifasNoCard(card, fares) {
        debugLog("Renderizando Tarifas", { cardId: card.id, fares });

        const container = document.createElement('div');
        container.className = 'custom-tariff-container';

        fares.forEach((fare, index) => {
            const nome = fare.productClass?.name || "Tarifa";
            const paxFares = fare.paxFares;
            const isSoldOut = !paxFares || paxFares.length === 0;
            const preco = isSoldOut ? 0 : (paxFares[0]?.totalAmount || 0);

            const isBusiness = nome.toLowerCase().includes('business');

            debugLog(`Tarifa ${index} - ${nome}`, {
                esgotada: isSoldOut,
                isBusiness,
                paxFares,
                preco
            });

            // Ícone diamante para Business
            const iconeSVG = isBusiness ? `
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#dia${index})">
                        <rect x="8.5" y="4.5" width="6" height="6" rx="1.5" transform="rotate(45 8.5 4.5)" fill="url(#grad${index})"/>
                    </g>
                    <defs>
                        <filter id="dia${index}" x="0.878662" y="5.12109" width="15.2427" height="15.2432" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="4"/>
                            <feGaussianBlur stdDeviation="2"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0.0156863 0 0 0 0 0.117647 0 0 0 0 0.258824 0 0 0 0.12 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                        </filter>
                        <linearGradient id="grad${index}" x1="11.5" y1="4.5" x2="11.5" y2="10.5" gradientUnits="userSpaceOnUse">
                            <stop stop-color="white"/>
                            <stop offset="1" stop-color="#8D8D8D"/>
                        </linearGradient>
                    </defs>
                </svg>
            ` : '';

            const box = document.createElement('div');
            box.className = `custom-tariff-card ${isSoldOut ? 'sold-out' : ''} ${isBusiness ? 'business' : ''}`;
            box.innerHTML = `
                <span class="tariff-title">${nome}${iconeSVG}</span>
                <span class="tariff-value">${isSoldOut ? 'Esgotada' : formatMoney(preco)}</span>
            `;

            // --- Lógica de Clique (Proxy) ---
            if (!isSoldOut) {
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
                    const targetItem = fareItems[index];
                    
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
            } else {
                // Para tarifas esgotadas, apenas mostra mensagem
                box.onclick = (e) => {
                    e.stopPropagation();
                    console.log(`⚠️ Tarifa ${nome} está esgotada`);
                };
            }

            container.appendChild(box);
        });

        // INJEÇÃO: Adiciona dentro do card principal
        const cardInner = card.querySelector('.card');
        if (cardInner) {
            cardInner.appendChild(container);
            card.classList.add('has-custom-fares');
            
            // Adiciona funcionalidade de fechar
            adicionarFuncaoFechar(card, cardInner);
        }
    }

    // =========================================================================
    // 4. FUNCIONALIDADE DE FECHAR/RECOLHER
    // =========================================================================
    function adicionarFuncaoFechar(flightCard, cardContainer) {
        // Remove listener anterior se existir
        if (cardContainer._closeHandler) {
            cardContainer.removeEventListener('click', cardContainer._closeHandler);
        }

        let isProcessing = false;
        let lastClickTime = 0;

        const closeHandler = (e) => {
            // Previne processamento múltiplo
            if (isProcessing) return;
            
            // Debounce de 300ms
            const now = Date.now();
            if (now - lastClickTime < 300) return;
            lastClickTime = now;
            
            // Verifica se o card está aberto
            const isOpen = flightCard.classList.contains('flight-card--opened');
            if (!isOpen) return;

            // Ignora cliques nas tarifas customizadas
            if (e.target.closest('.custom-tariff-card')) return;

            // Ignora cliques no container de tarifas
            if (e.target.closest('.custom-tariff-container')) return;

            // Ignora cliques em elementos interativos (exceto áreas informativas)
            if (e.target.closest('button:not(.btn-fare):not(.duration):not(.flight-select-see-details)') || 
                e.target.closest('a') || 
                e.target.closest('.fare-item')) return;

            // Verifica se clicou em uma área válida para fechar
            const clickedOnValidArea = 
                e.target === cardContainer ||
                e.target.classList.contains('flight-card__info') ||
                e.target.classList.contains('info') ||
                e.target.classList.contains('info-container') ||
                e.target.closest('.info') ||
                e.target.closest('.flight-card__info') ||
                e.target.closest('.info-details') ||
                e.target.closest('.details') ||
                e.target.closest('.flight-leg-info');

            if (!clickedOnValidArea) return;

            // Para a propagação imediatamente
            e.stopPropagation();
            e.preventDefault();

            // Ativa flag de processamento
            isProcessing = true;

            // Pequeno delay para garantir que não vai conflitar
            setTimeout(() => {
                // Procura o botão Recolher
                const recolherBtn = flightCard.querySelector('button.btn-fare[aria-label*="Fechar detalhes"]');
                
                if (recolherBtn) {
                    console.log("🔼 Fechando detalhes do voo...");
                    recolherBtn.click();
                } else {
                    console.warn("⚠️ Botão Recolher não encontrado");
                }

                // Libera após delay
                setTimeout(() => {
                    isProcessing = false;
                }, 500);
            }, 50);
        };

        // Usa capture phase para pegar o evento antes
        cardContainer._closeHandler = closeHandler;
        cardContainer.addEventListener('click', closeHandler, true); // true = capture phase
        
        debugLog("Funcionalidade Fechar Adicionada", { cardId: flightCard.id });
    }

    // =========================================================================
    // 5. OBSERVADOR DE NOVOS VOOS (Para botão "Ver mais voos")
    // =========================================================================
    function iniciarObservadorDeVoos() {
        // Procura o container onde os voos são renderizados
        const flightListContainer = document.querySelector('.flight-list, [class*="flight"], main, #root');
        
        if (!flightListContainer) {
            console.warn("⚠️ Container de voos não encontrado. Tentando novamente em 1s...");
            setTimeout(iniciarObservadorDeVoos, 1000);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            let novosVoosDetectados = false;

            mutations.forEach((mutation) => {
                // Verifica se novos nós foram adicionados
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Verifica se é um elemento HTML e se contém ou é um flight-card
                        if (node.nodeType === 1) { // Element node
                            if (node.classList?.contains('flight-card') || 
                                node.querySelector?.('.flight-card')) {
                                novosVoosDetectados = true;
                            }
                        }
                    });
                }
            });

            if (novosVoosDetectados) {
                console.log("🆕 Novos voos detectados! Atualizando layout...");
                // Pequeno delay para garantir que o DOM foi completamente renderizado
                setTimeout(() => {
                    atualizarLayout();
                }, 300);
            }
        });

        // Observa mudanças no container
        observer.observe(flightListContainer, {
            childList: true,
            subtree: true
        });

        console.log("👀 Observador de novos voos iniciado");
        debugLog("Container observado", flightListContainer);
    }

    // =========================================================================
    // 6. OBSERVADOR DO BOTÃO "VER MAIS VOOS"
    // =========================================================================
    function observarBotaoVerMais() {
        // Adiciona listener ao botão "Ver mais voos"
        const addListenerToBotao = () => {
            const botaoVerMais = document.querySelector('#load-more-button, button[id*="load-more"]');
            
            if (botaoVerMais && !botaoVerMais._listenerAdded) {
                botaoVerMais._listenerAdded = true;
                
                botaoVerMais.addEventListener('click', () => {
                    console.log("🔄 Botão 'Ver mais voos' clicado. Aguardando novos voos...");
                    // O MutationObserver vai detectar os novos cards automaticamente
                });
                
                debugLog("Listener adicionado ao botão Ver mais", botaoVerMais);
            }
        };

        // Tenta adicionar o listener imediatamente
        addListenerToBotao();

        // Observa se o botão aparece depois (caso não exista no início)
        const buttonObserver = new MutationObserver(() => {
            addListenerToBotao();
        });

        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Tenta rodar uma vez no início caso o cache já tenha algo (se recarregou script)
    if (Object.keys(window.AZUL_FLIGHT_CACHE).length > 0) {
        console.log("🔄 Cache existente detectado");
        debugLog("Cache Inicial", window.AZUL_FLIGHT_CACHE);
        aplicarEstilos();
        dadosCapturados = true;
        atualizarLayout();
    }

    // Inicia os observadores
    iniciarObservadorDeVoos();
    observarBotaoVerMais();

    // =========================================================================
    // 🛠️ UTILITÁRIOS DE DEBUG (Comandos no Console)
    // =========================================================================
    window.AZUL_DEBUG = {
        verCache: () => {
            console.table(Object.entries(window.AZUL_FLIGHT_CACHE).map(([key, fares]) => ({
                journeyKey: key,
                tarifas: fares.length,
                nomes: fares.map(f => f.productClass?.name).join(', ')
            })));
        },
        verCards: () => {
            const cards = document.querySelectorAll('.flight-card');
            console.table(Array.from(cards).map((card, i) => ({
                index: i,
                id: card.id,
                temTarifas: !!card.querySelector('.custom-tariff-container'),
                classes: card.className
            })));
        },
        forcarAtualizacao: () => {
            console.log("🔄 Forçando atualização...");
            atualizarLayout();
        },
        limparCache: () => {
            window.AZUL_FLIGHT_CACHE = {};
            console.log("🗑️ Cache limpo");
        }
    };

    console.log("💡 Comandos disponíveis no console:");
    console.log("   AZUL_DEBUG.verCache() - Ver dados em cache");
    console.log("   AZUL_DEBUG.verCards() - Ver cards na página");
    console.log("   AZUL_DEBUG.forcarAtualizacao() - Forçar renderização");
    console.log("   AZUL_DEBUG.limparCache() - Limpar cache");

})();
