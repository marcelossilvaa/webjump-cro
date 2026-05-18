(async function TariffPreRenderV6() {
    'use strict';
    console.clear();
    console.log("🚀 Iniciando Layout de Tarifas V6 (Baseado no V2 + UX melhorada)...");

    // =========================================================================
    // 1. ESTILOS 
    // =========================================================================
    const styles = `
        /* Container das tarifas */
        .custom-tariff-preview-container {
            display: flex;
            gap: 8px;
            padding: 15px 20px;
            justify-content: flex-end;
            width: 100%;
            background-color: #f9f9f9;
            border-top: 1px dashed #ccc;
        }

        .custom-tariff-box {
            border: 1px solid #dcdcdc;
            border-radius: 4px;
            padding: 8px 12px;
            min-width: 110px;
            cursor: pointer;
            transition: all 0.2s;
            background: #fff;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .custom-tariff-box:hover {
            border-color: #026CB6;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }

        .custom-tariff-box.selected {
            background-color: #026CB6;
            border-color: #026CB6;
        }

        .tariff-name {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #555;
            margin-bottom: 2px;
        }
        .custom-tariff-box.selected .tariff-name { color: #8ecfff; }

        .tariff-price {
            font-size: 16px;
            font-weight: 800;
            color: #026CB6;
        }
        .custom-tariff-box.selected .tariff-price { color: #fff; }

        /* SKELETON LOADING */
        .custom-tariff-box.skeleton {
            pointer-events: none;
            border-color: #eee;
        }
        .custom-tariff-box.skeleton .tariff-name,
        .custom-tariff-box.skeleton .tariff-price {
            background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
            background-size: 200% 100%;
            color: transparent !important;
            border-radius: 3px;
            animation: shimmer 1.5s infinite;
        }
        .custom-tariff-box.skeleton .tariff-name { width: 50px; height: 11px; margin-bottom: 4px; display: block; }
        .custom-tariff-box.skeleton .tariff-price { width: 75px; height: 16px; display: block; }

        @keyframes shimmer { 
            0% { background-position: 200% 0; } 
            100% { background-position: -200% 0; } 
        }

        /* ESCONDE CONTEÚDO DURANTE EXTRAÇÃO SILENCIOSA */
        .silent-extraction .fare-item,
        .silent-extraction .flight-card__fare,
        .silent-extraction .fare-section,
        .silent-extraction [class*="fare-content"],
        .silent-extraction [class*="accordion-content"] {
            opacity: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            transition: none !important;
        }
    `;

    // Remove estilos anteriores para não duplicar
    const oldStyle = document.getElementById('custom-tariff-styles');
    if (oldStyle) oldStyle.remove();

    const styleSheet = document.createElement("style");
    styleSheet.id = 'custom-tariff-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // =========================================================================
    // 2. FUNÇÕES AUXILIARES
    // =========================================================================
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    const cleanPrice = (text) => {
        if (!text) return null;
        return text.replace(/[\n\r]/g, '').trim();
    };

    // Debounce para MutationObserver
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // =========================================================================
    // 3. LÓGICA PRINCIPAL (Baseada no V2 que funciona)
    // =========================================================================
    
    async function processCard(card, index) {
        // Se já tiver injetado, pula
        if (card.dataset.tariffProcessed === 'true') return;
        if (card.querySelector('.custom-tariff-preview-container:not(.skeleton-container)')) {
            card.dataset.tariffProcessed = 'true';
            return;
        }

        const cardInnerContainer = card.querySelector('.card');

        // Injeta skeleton enquanto processa
        if (cardInnerContainer && !card.querySelector('.skeleton-container')) {
            const skeletonContainer = document.createElement('div');
            skeletonContainer.className = 'custom-tariff-preview-container skeleton-container';
            skeletonContainer.innerHTML = `
                <div class="custom-tariff-box skeleton"><span class="tariff-name">&nbsp;</span><span class="tariff-price">&nbsp;</span></div>
                <div class="custom-tariff-box skeleton"><span class="tariff-name">&nbsp;</span><span class="tariff-price">&nbsp;</span></div>
                <div class="custom-tariff-box skeleton"><span class="tariff-name">&nbsp;</span><span class="tariff-price">&nbsp;</span></div>
            `;
            cardInnerContainer.appendChild(skeletonContainer);
        }

        // --- PASSO A: ABRIR E AGUARDAR ---
        const toggleButton = card.querySelector('button[aria-label*="Ver tarifas"], div[role="button"][aria-label*="Ver tarifas"]');
        const isClosed = !card.classList.contains('flight-card--opened');
        
        if (isClosed && toggleButton) {
            // Aplica classe para esconder conteúdo visualmente durante extração
            card.classList.add('silent-extraction');
            
            toggleButton.click();
            // Tempo para React renderizar
            await wait(400); 
        }

        // --- PASSO B: EXTRAÇÃO ROBUSTA ---
        const realFareItems = card.querySelectorAll('.fare-item'); 
        const faresData = [];

        realFareItems.forEach((item, idx) => {
            // Tenta pegar o nome
            let nameEl = item.querySelector('.promotional');
            if (!nameEl) nameEl = item.querySelector('.fare-price p:first-child'); 
            
            // Tenta pegar o preço
            let priceEl = item.querySelector('.current');
            if (!priceEl) priceEl = item.querySelector('[data-test-id="fare-price"]');
            
            const rawName = nameEl ? nameEl.innerText : 'Tarifa';
            const rawPrice = priceEl ? priceEl.innerText : '---';

            if (priceEl) {
                faresData.push({
                    index: idx, 
                    name: rawName.replace(/[\n\r]/g, '').trim(),
                    price: cleanPrice(rawPrice)
                });
            }
        });

        console.log("✈️ Voo " + index + ": Encontradas " + faresData.length + " tarifas.", faresData);

        // --- PASSO C: FECHAR O CARD ---
        if (isClosed && toggleButton) {
            toggleButton.click();
            // Remove classe de extração silenciosa após fechar
            await wait(50);
            card.classList.remove('silent-extraction');
        }

        // --- PASSO D: RENDERIZAR O HTML NOVO ---
        // Remove skeleton
        const skeleton = card.querySelector('.skeleton-container');
        if (skeleton) skeleton.remove();

        if (faresData.length > 0) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'custom-tariff-preview-container';

            faresData.forEach(fare => {
                const fareBox = document.createElement('div');
                fareBox.className = 'custom-tariff-box';
                fareBox.innerHTML = '<span class="tariff-name">' + fare.name + '</span><span class="tariff-price">' + fare.price + '</span>';

                // Evento de Clique (Proxy)
                fareBox.onclick = async function(e) {
                    e.stopPropagation();
                    
                    // Feedback visual imediato
                    previewContainer.querySelectorAll('.custom-tariff-box').forEach(b => b.classList.remove('selected'));
                    fareBox.classList.add('selected');

                    // Lógica de Abertura
                    const currentToggle = card.querySelector('button[aria-label*="Ver tarifas"], div[role="button"][aria-label*="Ver tarifas"], button[aria-label*="Recolher"]');
                    const isCurrentlyClosed = !card.classList.contains('flight-card--opened');
                    
                    if (isCurrentlyClosed && currentToggle) {
                        currentToggle.click();
                        await wait(300);
                    }

                    // Lógica de Seleção
                    const currentRealItems = card.querySelectorAll('.fare-item');
                    if (currentRealItems[fare.index]) {
                        const selectBtn = currentRealItems[fare.index].querySelector('button');
                        if (selectBtn) {
                            selectBtn.click();
                            selectBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                };

                previewContainer.appendChild(fareBox);
            });

            if (cardInnerContainer) {
                cardInnerContainer.appendChild(previewContainer);
            }
            
            card.dataset.tariffProcessed = 'true';
        }
    }

    // =========================================================================
    // 4. ORQUESTRAÇÃO COM MUTATION OBSERVER
    // =========================================================================
    
    async function processAllCards() {
        const flightCards = document.querySelectorAll('.flight-card');
        console.log("🔎 Processando " + flightCards.length + " cartões...");

        for (let index = 0; index < flightCards.length; index++) {
            await processCard(flightCards[index], index);
        }
        
        console.log("✅ Processamento concluído.");
    }

    // MutationObserver para detectar novos voos
    function setupObserver() {
        const targetNode = document.querySelector('.flight-list, [class*="flight-results"], main') || document.body;
        
        const debouncedProcess = debounce(() => {
            console.log('[V6] Novos cards detectados, reprocessando...');
            processAllCards();
        }, 300);

        const observer = new MutationObserver((mutations) => {
            const hasNewCards = mutations.some(m => 
                Array.from(m.addedNodes).some(n => 
                    n.nodeType === 1 && (n.classList?.contains('flight-card') || n.querySelector?.('.flight-card'))
                )
            );
            if (hasNewCards) debouncedProcess();
        });

        observer.observe(targetNode, { childList: true, subtree: true });
        console.log('👁️ MutationObserver configurado.');
    }

    // Executa
    await processAllCards();
    setupObserver();

    // API para reprocessamento manual
    window.TariffV6 = { reprocess: processAllCards };

})();
