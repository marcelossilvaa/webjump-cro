(function() {
    'use strict';

    // ID do container dos selos
    const SELOS_CONTAINER_ID = 'azul-checkout-selos';

    /**
     * Remove os selos da página
     */
    function removeSelos() {
        const selosContainer = document.getElementById(SELOS_CONTAINER_ID);
        
        if (selosContainer) {
            selosContainer.remove();
            console.log('Selos removidos com sucesso!');
            return true;
        } else {
            console.log('Selos não encontrados na página.');
            return false;
        }
    }

    /**
     * Remove os selos imediatamente
     */
    function init() {
        // Remove imediatamente
        removeSelos();

        // Observa mudanças no DOM para remover caso sejam reinseridos
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Verifica se o node adicionado é o container dos selos
                        if (node.id === SELOS_CONTAINER_ID) {
                            node.remove();
                            console.log('Selos removidos (detectados após inserção)!');
                        }
                        // Verifica se algum filho é o container dos selos
                        const selosContainer = node.querySelector ? node.querySelector('#' + SELOS_CONTAINER_ID) : null;
                        if (selosContainer) {
                            selosContainer.remove();
                            console.log('Selos removidos (encontrados em elemento filho)!');
                        }
                    }
                });
            });
        });

        // Inicia observação do DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Observador ativo - selos serão removidos automaticamente se inseridos.');
    }

    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Também remove quando a página carregar completamente
    window.addEventListener('load', function() {
        setTimeout(removeSelos, 100);
    });

    // Torna a função disponível globalmente para ser chamada manualmente no console
    window.removeAzulSelos = removeSelos;

})();
