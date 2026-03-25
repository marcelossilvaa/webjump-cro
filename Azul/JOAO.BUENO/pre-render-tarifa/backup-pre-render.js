(async function implementTariffLayoutV2() {
    console.clear();
    console.log("🚀 Iniciando Layout de Tarifas V2 (Com correção de leitura de preço)...");

    // =========================================================================
    // 1. ESTILOS (Mantivemos iguais, apenas reforçando visual)
    // =========================================================================
    const styles = `
        .custom-tariff-preview-container {
            display: flex;
            gap: 8px;
            padding: 15px 20px;
            justify-content: flex-end; /* Alinha à direita, próximo ao botão original */
            width: 100%;
            background-color: #f9f9f9; /* Fundo leve para destacar a área */
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
        
        .tariff-loading { font-size: 10px; color: #999; }
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
    
    // Função para limpar o texto de preço (remove quebras de linha e espaços extras)
    const cleanPrice = (text) => {
        if (!text) return null;
        // Remove 'R$' duplicado se houver e limpa espaços
        return text.replace(/[\n\r]/g, '').trim();
    };

    // =========================================================================
    // 3. LÓGICA PRINCIPAL
    // =========================================================================
    
    const flightCards = document.querySelectorAll('.flight-card');

    for (let index = 0; index < flightCards.length; index++) {
        const card = flightCards[index];
        
        // Se já tiver injetado, pula
        if(card.querySelector('.custom-tariff-preview-container')) continue;

        // --- PASSO A: ABRIR E AGUARDAR (O segredo está aqui) ---
        const toggleButton = card.querySelector('button[aria-label*="Ver tarifas"], div[role="button"][aria-label*="Ver tarifas"]');
        const isClosed = !card.classList.contains('flight-card--opened');
        
        if (isClosed && toggleButton) {
            toggleButton.click();
            // AUMENTAMOS O TEMPO: 400ms para garantir que o React renderize o DOM
            await wait(400); 
        }

        // --- PASSO B: EXTRAÇÃO ROBUSTA ---
        const realFareItems = card.querySelectorAll('.fare-item'); 
        const faresData = [];

        realFareItems.forEach((item, idx) => {
            // Tenta pegar o nome
            let nameEl = item.querySelector('.promotional'); // Ex: "Azul"
            if (!nameEl) nameEl = item.querySelector('.fare-price p:first-child'); 
            
            // Tenta pegar o preço (Vários seletores de fallback)
            let priceEl = item.querySelector('.current'); // Tenta o container H4
            if (!priceEl) priceEl = item.querySelector('[data-test-id="fare-price"]'); // Tenta pelo data-id
            
            // Validação
            const rawName = nameEl ? nameEl.innerText : 'Tarifa';
            const rawPrice = priceEl ? priceEl.innerText : '---';

            // Só adiciona se tivermos pelo menos um preço ou nome válido
            if (priceEl) {
                faresData.push({
                    index: idx, 
                    name: rawName.replace(/[\n\r]/g, '').trim(),
                    price: cleanPrice(rawPrice)
                });
            }
        });

        // Debug no console para confirmar o que ele leu
        console.log(`✈️ Voo ${index}: Encontradas ${faresData.length} tarifas.`, faresData);

        // --- PASSO C: FECHAR O CARD (Restaura estado inicial) ---
        if (isClosed && toggleButton) {
            toggleButton.click(); 
        }

        // --- PASSO D: RENDERIZAR O HTML NOVO ---
        if (faresData.length > 0) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'custom-tariff-preview-container';

            faresData.forEach(fare => {
                const fareBox = document.createElement('div');
                fareBox.className = 'custom-tariff-box';
                fareBox.innerHTML = `
                    <span class="tariff-name">${fare.name}</span>
                    <span class="tariff-price">${fare.price}</span>
                `;

                // Evento de Clique (Proxy)
                fareBox.onclick = async function(e) {
                    e.stopPropagation();
                    
                    // 1. Feedback visual imediato
                    previewContainer.querySelectorAll('.custom-tariff-box').forEach(b => b.classList.remove('selected'));
                    fareBox.classList.add('selected');

                    // 2. Lógica de Abertura
                    const currentToggle = card.querySelector('button[aria-label*="Ver tarifas"], div[role="button"][aria-label*="Ver tarifas"], button[aria-label*="Recolher"]');
                    const isCurrentlyClosed = !card.classList.contains('flight-card--opened');
                    
                    if (isCurrentlyClosed && currentToggle) {
                        currentToggle.click();
                        await wait(300); // Espera animação de slide-down
                    }

                    // 3. Lógica de Seleção
                    const currentRealItems = card.querySelectorAll('.fare-item');
                    if(currentRealItems[fare.index]) {
                        const selectBtn = currentRealItems[fare.index].querySelector('button');
                        if(selectBtn) {
                            selectBtn.click();
                            selectBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                };

                previewContainer.appendChild(fareBox);
            });

            // Inserir abaixo do conteúdo do card
            const cardInnerContainer = card.querySelector('.card');
            if(cardInnerContainer) {
                cardInnerContainer.appendChild(previewContainer);
            }
        }
    }

    console.log("✅ V2 Concluído: Preços devem estar visíveis agora.");

})();