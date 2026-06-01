(function API_Interceptor() {
    console.clear();
    console.log("📡 Modo Interceptação de API Ativado...");
    console.log("👉 Por favor, realize uma nova busca ou atualize a lista de voos para capturar os dados.");

    // Backup dos métodos originais do navegador
    const originalXHR = window.XMLHttpRequest.prototype.open;
    const originalFetch = window.fetch;

    // 1. Intercepta requisições XHR (Modelo antigo, muito usado por empresas aéreas)
    window.XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            // Filtra apenas URLs que parecem ser de disponibilidade/busca
            if (url.includes('availability') || url.includes('search') || url.includes('bookings')) {
                try {
                    const response = JSON.parse(this.responseText);
                    console.group('🎯 API XHR Capturada: ' + url);
                    processarPayloadAzul(response);
                    console.groupEnd();
                } catch (e) {
                    console.error("Erro ao processar JSON XHR", e);
                }
            }
        });
        originalXHR.apply(this, arguments);
    };

    // 2. Intercepta requisições Fetch (Modelo moderno)
    window.fetch = async function(...args) {
        const [resource, config] = args;
        const response = await originalFetch(resource, config);
        
        const clone = response.clone(); // Clona para não travar o site
        const url = resource.toString();

        if (url.includes('availability') || url.includes('search') || url.includes('bookings')) {
            clone.json().then(data => {
                console.group('🎯 API Fetch Capturada: ' + url);
                processarPayloadAzul(data);
                console.groupEnd();
            }).catch(() => {});
        }

        return response;
    };

    // 3. Função que extrai APENAS os preços do JSON bruto
    function processarPayloadAzul(payload) {
        // A estrutura baseada no seu log anterior: data -> trips -> journeys -> fares
        const trips = payload.data?.trips || payload.trips || [];
        
        if (!trips.length) {
            console.log("⚠️ JSON capturado, mas não encontrei a lista de 'trips'. Estrutura pode ser diferente.");
            console.log("Payload bruto:", payload);
            return;
        }

        const relatorio = [];

        trips.forEach((trip, tIndex) => {
            const journeys = trip.journeys || [];
            
            journeys.forEach((journey, jIndex) => {
                const vooInfo = {
                    Index: `${tIndex}.${jIndex}`,
                    Origem: journey.identifier?.departureStation || "???",
                    Destino: journey.identifier?.arrivalStation || "???",
                    Partida: journey.identifier?.std || "???",
                    Tarifas: {}
                };

                // Aqui é o "Ouro": extração direta do array 'fares' da API
                if (journey.fares && Array.isArray(journey.fares)) {
                    journey.fares.forEach(fare => {
                        const nomeTarifa = fare.productClass?.name || fare.productClass?.code || "Desc.";
                        const preco = fare.paxFares?.[0]?.totalAmount || 0;
                        
                        // Adiciona ao objeto de tarifas do voo
                        vooInfo.Tarifas[nomeTarifa] = preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    });
                }

                relatorio.push(vooInfo);
            });
        });

        console.table(relatorio);
        console.log("✅ Dados extraídos diretamente do Backend (Sem HTML envolvido).");
    }

})();