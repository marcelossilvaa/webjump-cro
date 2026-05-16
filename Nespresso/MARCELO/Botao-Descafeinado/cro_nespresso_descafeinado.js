// A/B Test - V1: Botão Descafeinados na barra de filtros
(function() {
    'use strict';

    // Evita múltiplas instâncias de observers
    if (window._croDescafeinadoInit) return;
    window._croDescafeinadoInit = true;

    function injectButton() {
        if (document.querySelector('.cro-btn-descafeinado-container')) return;

        const filterCarousel = document.querySelector('#filters-slider .nn-carousel');
        if (!filterCarousel) return;

        const li = document.createElement('li');
        li.className = 'cro-btn-descafeinado-container';
        
        li.innerHTML = `
            <button class="cro-btn-descafeinado" style="
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: left;
                padding: 8px 20px 8px 16px;
                height: 40px;
                background: #f6f6f6;
                border: 1px solid #e7e7e7;
                z-index: 5;
                border-radius: 60px;
                font-size: 16px;
                transition: box-shadow .3s;
                font-family: inherit;
                color: #333;
                cursor: pointer;
            ">
                <svg style="margin-right: 6px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.49 4.51C15.63.66 11.16 1.22 6.19 6.2c-4.97 4.97-5.53 9.44-1.68 13.3C6.18 21.16 8 22 9.91 22c.3 0 .6-.02.9-.06 2.2-.3 4.55-1.68 7-4.13s3.84-4.8 4.13-7c.3-2.25-.52-4.37-2.45-6.3ZM6.89 6.9C9.5 4.3 11.89 3 14.09 3c1.56 0 3.04.66 4.44 1.97l-2.27 4.27a4.24 4.24 0 0 1-3.75 2.26h-1a5.24 5.24 0 0 0-4.64 2.8l-2.1 3.98c-2.9-3.31-2.2-7.04 2.14-11.38Zm14.06 3.77c-.27 1.98-1.56 4.14-3.85 6.43-2.29 2.3-4.45 3.58-6.43 3.85-1.85.24-3.55-.39-5.18-1.92l2.26-4.27a4.24 4.24 0 0 1 3.75-2.26h1a5.24 5.24 0 0 0 4.64-2.8l2.1-3.98c1.38 1.57 1.94 3.2 1.7 4.95Z"></path>
                </svg>
                Descafeinado
            </button>
        `;

        // Inserir o botão logo após o seletor de Sistema (Original/Vertuo)
        const firstLi = filterCarousel.querySelector('li:first-child'); 
        if (firstLi && firstLi.nextSibling) {
            filterCarousel.insertBefore(li, firstLi.nextSibling);
        } else {
            filterCarousel.appendChild(li);
        }

        const btn = li.querySelector('.cro-btn-descafeinado');
        
        // Verifica o estado atual do checkbox nativo para atualizar o botão
        const nativeCheckbox = document.getElementById('plp-filter-chip-checkbox-flavors-nesclub2.br.b2c/cat/capsule-aromatic-decaffeinato');
        if (nativeCheckbox && nativeCheckbox.checked) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nativeLabel = document.querySelector('label[for="plp-filter-chip-checkbox-flavors-nesclub2.br.b2c/cat/capsule-aromatic-decaffeinato"]');
            const chk = document.getElementById('plp-filter-chip-checkbox-flavors-nesclub2.br.b2c/cat/capsule-aromatic-decaffeinato');
            
            // Dispara evento para o Google Tag Manager / Analytics (Taqueamento CRO)
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'cro_event',
                event_category: 'cro_ab_test',
                event_action: 'click_filtro_descafeinados',
                event_label: (chk && chk.checked) ? 'desativou_filtro' : 'ativou_filtro'
            });
            
            if (nativeLabel && chk) {
                // O clique no nativeLabel alterna o checkbox nativo (liga se desligado, desliga se ligado)
                nativeLabel.click();
                
                // Nós não atualizamos o estilo manualmente aqui porque a Nespresso vai 
                // re-renderizar a UI e a nossa função injectButton() vai ser chamada de novo
                // já lendo o novo estado do checkbox e aplicando a classe .active
            } else {
                // Fallback via URL caso a estrutura DOM não esteja disponível
                const url = new URL(window.location.href);
                // Se não tem no parâmetro, adiciona. Se tem, remove. (Lógica simplificada apenas para adicão)
                url.searchParams.set('filters', '[{"key":"flavors","value":"nesclub2.br.b2c/cat/capsule-aromatic-decaffeinato","color":null}]');
                window.location.href = url.toString();
            }
        });
    }

    function init() {
        // Injeta CSS apenas uma vez
        if (!document.querySelector('#cro-btn-style')) {
            const style = document.createElement('style');
            style.id = 'cro-btn-style';
            style.innerHTML = `
                .cro-btn-descafeinado.active {
                    background-color: #e5d5bb !important;
                    border-color: #e5d5bb !important;
                    font-weight: 700 !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Tenta injetar logo de cara
        injectButton();

        // Configura o MutationObserver para observar mudanças no DOM
        // Sempre que o SPA re-renderizar a barra de filtros, nós colocamos o botão de volta
        const observer = new MutationObserver(() => {
            // Se o nosso botão não estiver mais lá, mas o carrossel de filtros estiver, injetamos
            if (!document.querySelector('.cro-btn-descafeinado-container') && document.querySelector('#filters-slider .nn-carousel')) {
                injectButton();
            }
        });

        // Observa o corpo da página para qualquer re-render
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Inicia o script
    init();

})();
