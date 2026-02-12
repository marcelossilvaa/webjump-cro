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
        /* IMPORTANTE: Estilos aplicados APENAS em cards com a classe .tariff-injector-active */
        .tariff-injector-active .flight-card__info{
            max-width: 312px!important;
            padding: 0px!important;
        }
        .tariff-injector-active .css-7ip4ly .details > svg{
            min-width: 20px;
        }

        .tariff-injector-active .flight-card__info .info{
            max-width: 370px!important;
        }

        .tariff-injector-active .flight-card__container{
            justify-content: space-between !important;
            padding: 10px;
            gap: 4px!important;
        }

        .tariff-injector-active .css-gtajxx{
            max-width: 312px!important;
        }

        /* Esconde os fare cards APENAS em cards com tariff-injector-active */
        .tariff-injector-active .flight-card__fare,
        .tariff-injector-active .fareIndex-0,
        .tariff-injector-active .fareIndex-1,
        .tariff-injector-active .fareIndex-2,
        .tariff-injector-active .fareIndex-3,
        .tariff-injector-active .fareIndex-4 {
            display: none !important;
        }

        .tariff-injector-active .css-7ip4ly{
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
            padding: 8px 12px 12px 12px;
            min-width: 140px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .custom-tariff-card::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #026CB6;
            border-radius: 0 0 6px 6px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .custom-tariff-card:hover {
            border-color: #026CB6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .custom-tariff-card:hover::after {
            opacity: 1;
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

        .custom-tariff-card.business::after {
            background: rgba(255, 255, 255, 0.8);
        }

        .custom-tariff-card.business .tariff-title {
            color: #fff;
            background: rgba(255, 255, 255, 0.10)!important;
        }

        .custom-tariff-card.business .tariff-subtitle,
        .custom-tariff-card.business .tariff-value {
            color: #fff;
        }

        .custom-tariff-card.business:hover {
            border-color: rgb(31, 81, 141);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(4, 30, 66, 0.4);
        }

        .custom-tariff-card.business:hover::after {
            opacity: 1;
        }

        .custom-tariff-card.business.selected {
            background: linear-gradient(91.12deg, rgb(255, 255, 255) 0%, rgb(230, 240, 250) 53.65%, rgb(200, 220, 240) 100%);
            border-color: #026CB6;
            box-shadow: 0 0 0 2px #026CB6;
        }

        .custom-tariff-card.business.selected .tariff-title {
            color: rgb(4, 30, 66);
            background: rgba(4, 30, 66, 0.1)!important;
        }

        .custom-tariff-card.business.selected .tariff-subtitle,
        .custom-tariff-card.business.selected .tariff-value,
        .custom-tariff-card.business.selected .tariff-value .currency,
        .custom-tariff-card.business.selected .tariff-value .integer,
        .custom-tariff-card.business.selected .tariff-value .cents {
            color: rgb(4, 30, 66);
        }

        .custom-tariff-card.sold-out {
            background-color: rgb(235, 235, 235);
            color: rgb(96, 96, 96);
            cursor: not-allowed;
            outline: none;
            border-color: #d0d0d0;
        }

        .custom-tariff-card.sold-out::after {
            display: none;
        }

        .custom-tariff-card.sold-out:hover {
            transform: none;
            box-shadow: none;
            border-color: #d0d0d0;
        }

        /* Business esgotado deve sobrescrever os estilos de Business */
        .custom-tariff-card.business.sold-out {
            background: rgb(235, 235, 235)!important;
            color: rgb(96, 96, 96)!important;
            border-color: #d0d0d0!important;
        }

        .custom-tariff-card.business.sold-out .tariff-title {
            color: rgb(96, 96, 96)!important;
            background: transparent!important;
        }

        .custom-tariff-card.business.sold-out .tariff-subtitle,
        .custom-tariff-card.business.sold-out .tariff-value {
            color: rgb(96, 96, 96)!important;
        }

        .custom-tariff-card.business.sold-out:hover {
            transform: none;
            box-shadow: none;
            border-color: #d0d0d0!important;
        }

        .tariff-title {
            font-size: 14px;
            text-transform: capitalize;
            font-weight: 700;
            color: rgb(2, 108, 182);
            margin-bottom: 0;
            letter-spacing: 0px;
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(1, 78, 132, 0.08);
            width: max-content;
            padding: 2px 4px;
            border-radius: 4px;
        }
        
        .tariff-title svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .tariff-subtitle {
            font-size: 12px;
            font-weight: 400;
            color: #6A7282;
            margin-bottom: -6px;
        }

        .tariff-value {
            color: #026CB6;
            letter-spacing: -0.5px;
            line-height: 1;
            display: flex;
            align-items: baseline;
            gap: 2px;
        }

        .tariff-value .currency {
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 20px;
        }

        .tariff-value .integer {
            font-size: 20px;
            font-style: normal;
            font-weight: 700;
            line-height: 28px;
        }

        .tariff-value .cents {
            font-size: 12px;
            font-style: normal;
            font-weight: 700;
            line-height: 16px;
        }
        
        .custom-tariff-card.selected .tariff-value,
        .custom-tariff-card.selected .tariff-value .currency,
        .custom-tariff-card.selected .tariff-value .integer,
        .custom-tariff-card.selected .tariff-value .cents,
        .custom-tariff-card.selected .tariff-subtitle { 
            color: #fff; 
        }
        .custom-tariff-card.selected .tariff-title { 
            color: #fff; 
        }
        .custom-tariff-card.sold-out .tariff-title { 
            color: rgb(96, 96, 96); 
        }
        .custom-tariff-card.sold-out .tariff-subtitle {
            color: rgb(96, 96, 96);
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
        const formatted = val.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        // Separa R$, parte inteira e centavos
        const parts = formatted.replace('R$', '').trim().split(',');
        const integerPart = parts[0];
        const centsPart = parts[1] || '00';
        
        return `<span class="currency">R$</span><span class="integer">${integerPart}</span><span class="cents">,${centsPart}</span>`;
    }

    function atualizarLayout() {
        const flightCards = document.querySelectorAll('.flight-card');
        debugLog("Cards na Página", { total: flightCards.length });

        flightCards.forEach((card, cardIndex) => {
            // NOVO: Verifica se o card está exibindo pontos ao invés de dinheiro
            const fareContainer = card.querySelector('.flight-card__fare');
            if (fareContainer) {
                const fareText = fareContainer.textContent || '';
                // Se contém "pontos" no texto, ignora este card COMPLETAMENTE
                if (fareText.toLowerCase().includes('pontos')) {
                    debugLog('Card ' + cardIndex, 'Ignorado - exibindo pontos ao inves de dinheiro');
                    // Remove a classe de ativação caso exista
                    card.classList.remove('tariff-injector-active');
                    // Remove o container customizado caso exista
                    const existingContainer = card.querySelector('.custom-tariff-container');
                    if (existingContainer) {
                        existingContainer.remove();
                    }
                    return;
                }
            }

            // ADICIONA a classe que ativa os estilos CSS
            card.classList.add('tariff-injector-active');

            if (card.querySelector('.custom-tariff-container')) {
                debugLog('Card ' + cardIndex, "Já possui tarifas customizadas");
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
            const isAzulTariff = ['azul', 'mais azul', 'super azul'].some(t => 
                nome.toLowerCase().includes(t.toLowerCase())
            );

            debugLog(`Tarifa ${index} - ${nome}`, {
                esgotada: isSoldOut,
                isBusiness,
                isAzulTariff,
                paxFares,
                preco
            });

            // SVG para tarifas Azul
            const azulIconeSVG = isAzulTariff && !isBusiness ? `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 17 20">
                    <g filter="url(#filter0_d_${card.id}_${index})">
                        <rect width="6" height="6" x="8.5" y="4.5" fill="url(#paint0_linear_${card.id}_${index})" rx="1.5" transform="rotate(45 8.5 4.5)"></rect>
                    </g>
                    <defs>
                        <filter id="filter0_d_${card.id}_${index}" width="15.243" height="15.243" x="0.879" y="5.121" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                            <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>
                            <feOffset dy="4"></feOffset>
                            <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                            <feColorMatrix values="0 0 0 0 0.286275 0 0 0 0 0.501961 0 0 0 0 0.909804 0 0 0 0.2 0"></feColorMatrix>
                            <feBlend in2="BackgroundImageFix" result="effect1_dropShadow"></feBlend>
                            <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"></feBlend>
                        </filter>
                        <linearGradient id="paint0_linear_${card.id}_${index}" x1="11.5" x2="11.5" y1="4.5" y2="10.5" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#026CB6"></stop>
                            <stop offset="1" stop-color="#6087F8"></stop>
                        </linearGradient>
                    </defs>
                </svg>
            ` : '';

            // Ícone diamante para Business
            const businessIconeSVG = isBusiness ? `
                <svg width="14" height="14" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#dia${card.id}_${index})">
                        <rect x="8.5" y="4.5" width="6" height="6" rx="1.5" transform="rotate(45 8.5 4.5)" fill="url(#grad${card.id}_${index})"/>
                    </g>
                    <defs>
                        <filter id="dia${card.id}_${index}" x="0.878662" y="5.12109" width="15.2427" height="15.2432" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dy="4"/>
                            <feGaussianBlur stdDeviation="2"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0.0156863 0 0 0 0 0.117647 0 0 0 0 0.258824 0 0 0 0.12 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                        </filter>
                        <linearGradient id="grad${card.id}_${index}" x1="11.5" y1="4.5" x2="11.5" y2="10.5" gradientUnits="userSpaceOnUse">
                            <stop stop-color="white"/>
                            <stop offset="1" stop-color="#8D8D8D"/>
                        </linearGradient>
                    </defs>
                </svg>
            ` : '';

            const iconeSVG = isBusiness ? businessIconeSVG : azulIconeSVG;

            const box = document.createElement('div');
            box.className = `custom-tariff-card ${isSoldOut ? 'sold-out' : ''} ${isBusiness ? 'business' : ''}`;
            box.dataset.fareIndex = index;
            box.innerHTML = `
                <span class="tariff-title">${nome}${iconeSVG}</span>
                ${!isSoldOut ? '<span class="tariff-subtitle">a partir de</span>' : ''}
                <span class="tariff-value">${isSoldOut ? 'Esgotada' : formatMoney(preco)}</span>
            `;

            // --- Lógica de Clique (Proxy) ---
            if (!isSoldOut) {
                box.onclick = async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const fareIndex = parseInt(box.dataset.fareIndex);
                    console.log(`🎯 Clicando na tarifa ${nome} (índice: ${fareIndex})`);

                    // Visual Selection - marca apenas este card
                    container.querySelectorAll('.custom-tariff-card').forEach(b => b.classList.remove('selected'));
                    box.classList.add('selected');

                    // 1. Verifica se o card está fechado
                    const isCardClosed = !card.classList.contains('flight-card--opened');
                    debugLog("Estado do Card", { isCardClosed, cardClasses: card.className });

                    if (isCardClosed) {
                        // Clica na área do card para expandir
                        const cardClickArea = card.querySelector('.flight-card__info[role="button"]');
                        if (cardClickArea) {
                            console.log("📂 Expandindo card...");
                            cardClickArea.click();
                            // Espera mais tempo para o React renderizar
                            await new Promise(r => setTimeout(r, 500));
                        }
                    }

                    // 2. Aguarda e procura os fare-items
                    await new Promise(r => setTimeout(r, 200));
                    
                    // Procura os botões de seleção de tarifa
                    const fareItems = card.querySelectorAll('.fare-item');
                    debugLog("Fare Items Encontrados", { 
                        total: fareItems.length, 
                        fareIndex,
                        items: Array.from(fareItems).map((item, i) => ({
                            index: i,
                            text: item.textContent?.substring(0, 50)
                        }))
                    });

                    const targetItem = fareItems[fareIndex];
                    
                    if (targetItem) {
                        // Procura o botão "Selecionar" dentro do fare-item
                        const selectBtn = targetItem.querySelector('button[class*="select"], button[class*="btn"]') || 
                                         targetItem.querySelector('button');
                        
                        if (selectBtn) {
                            console.log(`✅ Clicando no botão de seleção da tarifa ${nome}`);
                            selectBtn.click();
                            
                            // Scroll suave para feedback
                            targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        } else {
                            console.warn(`⚠️ Botão de seleção não encontrado para ${nome}`);
                            // Tenta clicar no próprio fare-item
                            targetItem.click();
                        }
                    } else {
                        console.error(`❌ Fare item não encontrado para índice ${fareIndex}`);
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
            
            // Adiciona observador para sincronizar seleção interna
            observarSelecaoInterna(card, container);
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

            console.log("🔽 Tentando fechar card...");

            // Pequeno delay para garantir que não vai conflitar
            setTimeout(() => {
                // Tenta múltiplas estratégias para fechar
                
                // Estratégia 1: Procura botão "Recolher" ou "Fechar"
                const botoesFechar = flightCard.querySelectorAll('button');
                let botaoEncontrado = false;
                
                for (let btn of botoesFechar) {
                    const ariaLabel = btn.getAttribute('aria-label') || '';
                    const texto = btn.textContent || '';
                    
                    if (ariaLabel.toLowerCase().includes('fechar') || 
                        ariaLabel.toLowerCase().includes('recolher') ||
                        texto.toLowerCase().includes('recolher')) {
                        console.log("🔼 Fechando via botão encontrado:", ariaLabel || texto);
                        btn.click();
                        botaoEncontrado = true;
                        break;
                    }
                }
                
                // Estratégia 2: Se não encontrou botão, remove a classe de aberto
                if (!botaoEncontrado) {
                    console.log("🔼 Fechando via remoção de classe...");
                    flightCard.classList.remove('flight-card--opened');
                    
                    // Remove também o conteúdo expandido se existir
                    const cardContent = flightCard.querySelector('.card-content');
                    if (cardContent) {
                        cardContent.style.display = 'none';
                    }
                }

                // Libera após delay
                setTimeout(() => {
                    isProcessing = false;
                }, 300);
            }, 50);
        };

        // Usa capture phase para pegar o evento antes
        cardContainer._closeHandler = closeHandler;
        cardContainer.addEventListener('click', closeHandler, true);
        
        debugLog("Funcionalidade Fechar Adicionada", { cardId: flightCard.id });
    }

    // =========================================================================
    // 4.1 OBSERVADOR DE SELEÇÃO INTERNA
    // =========================================================================
    function observarSelecaoInterna(flightCard, customContainer) {
        let isSyncing = false;
        let lastSyncedIndex = -1;
        
        // Função para sincronizar a seleção
        const sincronizarSelecao = () => {
            if (isSyncing) return;
            
            // Procura os fare-items dentro do card
            const fareItems = flightCard.querySelectorAll('.fare-item');
            const customCards = customContainer.querySelectorAll('.custom-tariff-card');
            
            let indexSelecionado = -1;
            
            fareItems.forEach((fareItem, index) => {
                // Verifica se o fare-item está selecionado pelo texto "Tarifa selecionada"
                const textoTarifaSelecionada = fareItem.textContent.includes('Tarifa selecionada');
                
                if (textoTarifaSelecionada) {
                    indexSelecionado = index;
                }
            });
            
            // Só sincroniza se encontrou uma seleção diferente da atual
            if (indexSelecionado >= 0 && indexSelecionado !== lastSyncedIndex) {
                isSyncing = true;
                lastSyncedIndex = indexSelecionado;
                
                // Remove seleção de todos e marca apenas este
                customCards.forEach(c => c.classList.remove('selected'));
                if (customCards[indexSelecionado]) {
                    customCards[indexSelecionado].classList.add('selected');
                    console.log(`✅ Seleção sincronizada: índice ${indexSelecionado}`);
                }
                
                // Libera após um delay
                setTimeout(() => {
                    isSyncing = false;
                }, 100);
            }
        };

        // Adiciona listeners de clique nos botões "Selecionar tarifa" internos
        const adicionarListenersBotoes = () => {
            const botoesSelecionar = flightCard.querySelectorAll('button[aria-label*="Selecionar tarifa"], button[data-test-id="select-fare"]');
            
            botoesSelecionar.forEach((botao) => {
                if (!botao._syncListenerAdded) {
                    botao._syncListenerAdded = true;
                    
                    botao.addEventListener('click', () => {
                        // Encontra o fare-item pai deste botão
                        const fareItemPai = botao.closest('.fare-item');
                        if (fareItemPai) {
                            const fareItems = flightCard.querySelectorAll('.fare-item');
                            const customCards = customContainer.querySelectorAll('.custom-tariff-card');
                            let fareIndex = -1;
                            
                            fareItems.forEach((item, i) => {
                                if (item === fareItemPai) {
                                    fareIndex = i;
                                }
                            });
                            
                            if (fareIndex >= 0 && customCards[fareIndex]) {
                                isSyncing = true;
                                lastSyncedIndex = fareIndex;
                                
                                customCards.forEach(c => c.classList.remove('selected'));
                                customCards[fareIndex].classList.add('selected');
                                console.log(`✅ Card customizado ${fareIndex} marcado como selecionado (via botão interno)`);
                                
                                setTimeout(() => {
                                    isSyncing = false;
                                }, 100);
                            }
                        }
                    });
                }
            });
        };

        // Observa quando o card é expandido para adicionar listeners nos botões
        const observer = new MutationObserver((mutations) => {
            if (isSyncing) return;
            
            let shouldAddListeners = false;
            let shouldSync = false;
            
            mutations.forEach((mutation) => {
                // Verifica se foram adicionados novos nós (card expandido)
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // Verifica se é um fare-item ou contém fare-items
                            if (node.classList?.contains('fare-item') || 
                                node.querySelector?.('.fare-item') ||
                                node.querySelector?.('button[data-test-id="select-fare"]')) {
                                shouldAddListeners = true;
                            }
                            // Verifica se contém "Tarifa selecionada"
                            if (node.textContent?.includes('Tarifa selecionada')) {
                                shouldSync = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldAddListeners) {
                setTimeout(adicionarListenersBotoes, 100);
            }
            
            if (shouldSync) {
                setTimeout(sincronizarSelecao, 150);
            }
        });

        // Observa apenas childList (não attributes para evitar loops)
        observer.observe(flightCard, {
            childList: true,
            subtree: true
        });

        // Adiciona listeners iniciais após um delay (para quando o card já está expandido)
        setTimeout(() => {
            adicionarListenersBotoes();
            sincronizarSelecao();
        }, 500);

        debugLog("Observador de Seleção Interna Adicionado", { cardId: flightCard.id });
    }

    // =========================================================================
    // 5. OBSERVADOR DE NOVOS VOOS (Para botão "Ver mais voos")
    // =========================================================================
    function iniciarObservadorDeVoos() {
        // Procura o container onde os voos são renderizados
        const flightListContainer = document.querySelector('.flight-list, [class*="flight"], main, #root');
        
        if (!flightListContainer) {
            console.warn('Container de voos nao encontrado. Tentando novamente em 1s...');
            setTimeout(iniciarObservadorDeVoos, 1000);
            return;
        }

        const observer = new MutationObserver(function(mutations) {
            let novosVoosDetectados = false;
            let cardsRemovidosNestaBatch = 0;

            mutations.forEach(function(mutation) {
                // Verifica se novos nós foram adicionados
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.classList?.contains('flight-card') || 
                                node.querySelector?.('.flight-card')) {
                                novosVoosDetectados = true;
                            }
                        }
                    });
                }

                // Verifica se cards foram removidos (conta quantos nesta batch)
                if (mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            // Só conta se for um flight-card REAL (com id de journey)
                            if (node.classList?.contains('flight-card') && node.id && node.id.length > 20) {
                                cardsRemovidosNestaBatch++;
                            } else if (node.querySelector?.('.flight-card')) {
                                const removedCards = node.querySelectorAll('.flight-card');
                                removedCards.forEach(function(rc) {
                                    if (rc.id && rc.id.length > 20) {
                                        cardsRemovidosNestaBatch++;
                                    }
                                });
                            }
                        }
                    });
                }
            });

            // CRÍTICO: Só limpa se houve remoção MASSIVA (5+ cards = troca de voo completa)
            if (cardsRemovidosNestaBatch >= 5) {
                console.log('Mudanca significativa detectada (' + cardsRemovidosNestaBatch + ' cards removidos). Limpando selecoes...');
                limparTodasSelecoes();
            }

            if (novosVoosDetectados) {
                console.log('Novos voos detectados! Atualizando layout...');
                setTimeout(function() {
                    atualizarLayout();
                }, 300);
            }
        });

        // Observa mudanças no container
        observer.observe(flightListContainer, {
            childList: true,
            subtree: true
        });

        console.log('Observador de novos voos iniciado');
        debugLog('Container observado', flightListContainer);
    }

    // =========================================================================
    // 6. OBSERVADOR DO BOTÃO "VER MAIS VOOS"
    // =========================================================================
    function observarBotaoVerMais() {
        // Adiciona listener ao botão "Ver mais voos"
        const addListenerToBotao = function() {
            const botaoVerMais = document.querySelector('#load-more-button, button[id*="load-more"]');
            
            if (botaoVerMais && !botaoVerMais._listenerAdded) {
                botaoVerMais._listenerAdded = true;
                
                botaoVerMais.addEventListener('click', function() {
                    console.log("🔄 Botão 'Ver mais voos' clicado. Aguardando novos voos...");
                    // O MutationObserver vai detectar os novos cards automaticamente
                });
                
                debugLog("Listener adicionado ao botão Ver mais", botaoVerMais);
            }
        };

        // Tenta adicionar o listener imediatamente
        addListenerToBotao();

        // Observa se o botão aparece depois (caso não exista no início)
        const buttonObserver = new MutationObserver(function() {
            addListenerToBotao();
        });

        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // =========================================================================
    // 7. FUNÇÃO PARA LIMPAR SELEÇÕES - ATUALIZADA POR TRECHO
    // =========================================================================
    
    // Limpa apenas visual para um trecho específico
    function limparSelecoesVisuaisPorTrecho(tripIndex) {
        const tripContainer = document.querySelector('.trip-index-' + tripIndex);
        
        if (tripContainer) {
            const selecoes = tripContainer.querySelectorAll('.custom-tariff-card.selected');
            
            selecoes.forEach(function(card) {
                card.classList.remove('selected');
            });
            
            console.log('[SELECAO] Selecoes visuais limpas no trecho ' + tripIndex + ': ' + selecoes.length);
        }
    }
    
    // Limpa tudo de um trecho específico
    function limparSelecoesPorTrecho(tripIndex) {
        limparSelecoesVisuaisPorTrecho(tripIndex);
        console.log('[SELECAO] Selecoes do trecho ' + tripIndex + ' limpas');
    }
    
    // Limpa tudo (todos os trechos)
    function limparTodasSelecoes() {
        const todasAsSelecoes = document.querySelectorAll('.custom-tariff-card.selected');
        
        todasAsSelecoes.forEach(function(card) {
            card.classList.remove('selected');
        });

        console.log('[SELECAO] Todas as selecoes limpas');
    }

    // =========================================================================
    // 8. OBSERVADOR DO BOTÃO "TROCAR VOO" - ATUALIZADO POR TRECHO
    // =========================================================================
    function observarBotaoTrocarVoo() {
        const addListenerToBotao = function() {
            const botoesTrocar = document.querySelectorAll('button[aria-label*="TBD"], button[aria-label*="trocar"], button[aria-label*="Trocar"]');
            
            botoesTrocar.forEach(function(botao) {
                if (botao._trocarVooListenerAdded) return;
                
                botao._trocarVooListenerAdded = true;
                
                botao.addEventListener('click', function() {
                    const tripContainer = botao.closest('.trip-index-0, .trip-index-1, [class*="trip-index"]');
                    
                    let tripIndex = null;
                    
                    if (tripContainer) {
                        const classes = tripContainer.className.split(' ');
                        for (let i = 0; i < classes.length; i++) {
                            const match = classes[i].match(/trip-index-(\d+)/);
                            if (match) {
                                tripIndex = match[1];
                                break;
                            }
                        }
                    }
                    
                    if (tripIndex !== null) {
                        console.log('[SELECAO] Botao Trocar voo clicado no trecho ' + tripIndex);
                        limparSelecoesPorTrecho(tripIndex);
                        
                        setTimeout(function() {
                            limparSelecoesPorTrecho(tripIndex);
                        }, 500);
                    } else {
                        console.log('[SELECAO] Botao Trocar voo clicado - trecho nao identificado, limpando tudo');
                        limparTodasSelecoes();
                    }
                });
                
                console.log('[Observador] Listener adicionado ao botao Trocar voo');
            });
        };

        addListenerToBotao();

        const buttonObserver = new MutationObserver(addListenerToBotao);
        buttonObserver.observe(document.body, { childList: true, subtree: true });
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
    observarBotaoTrocarVoo();

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
