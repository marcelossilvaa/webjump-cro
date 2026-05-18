// Script para remover a opção "A cada 3 meses" do select e rastrear cliques
(function(window, document) {
    'use strict';

    // Guard contra dupla inicialização
    if (window.__remocaoTrimestralInit) return;
    window.__remocaoTrimestralInit = true;

    // Evento Adobe Target GA4
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
        event: 'adobe_target',
        event_raised_by: 'adobe target',
        experiment_id: '${campaign.id}',
        experiment_type: 'AB',
        experiment_name: '${campaign.name}',
        experiment_variant_id: '${campaign.recipe.id}',
        experiment_variant: '${campaign.recipe.name}'
    });

    // Função para enviar evento ao GA
    function sendGAEvent(label) {
        window.gtmDataObject = window.gtmDataObject || [];
        window.gtmDataObject.push({
            event: 'local_event',
            event_raised_by: 'br',
            local_event_category: 'user engagement plan selection',
            local_event_action: 'click',
            local_event_label: label
        });
    }

    // Seletores do dropdown de frequência (desktop e mobile)
    var SELETOR_SELECTS = '#Select_2, [class*="_select_"], select[id^="Select_"]';

    // Função para adicionar listener de change nos selects
    function adicionarListenerSelects() {
        var selects = document.querySelectorAll(SELETOR_SELECTS);

        Array.prototype.slice.call(selects).forEach(function(select) {
            if (!select.dataset.gaListenerAdded) {
                select.dataset.gaListenerAdded = 'true';

                select.addEventListener('change', function() {
                    var opcaoSelecionada = this.options[this.selectedIndex];
                    if (opcaoSelecionada && opcaoSelecionada.textContent.trim()) {
                        var label = opcaoSelecionada.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                        sendGAEvent('frequencia-assinatura-' + label);
                    }
                });
            }
        });
    }

    // Função para remover a opção "A cada 3 meses"
    // IMPORTANTE: usa .remove() em vez de display:none porque
    // mobile browsers ignoram CSS em <option> dentro do picker nativo
    function removerOpcao3Meses() {
        var selects = document.querySelectorAll(SELETOR_SELECTS);

        Array.prototype.slice.call(selects).forEach(function(select) {
            var opcoes = select.querySelectorAll('option');

            Array.prototype.slice.call(opcoes).forEach(function(opcao) {
                if (opcao.textContent.trim() === 'A cada 3 meses') {
                    opcao.remove();
                }
            });
        });

        adicionarListenerSelects();
    }

    // Executa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removerOpcao3Meses);
    } else {
        removerOpcao3Meses();
    }

    // Observer para caso o select seja carregado dinamicamente
    var observer = new MutationObserver(function(mutations) {
        var i, mutation;
        for (i = 0; i < mutations.length; i++) {
            mutation = mutations[i];
            if (mutation.addedNodes.length) {
                removerOpcao3Meses();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})(window, document);
 