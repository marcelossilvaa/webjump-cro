(function () {
    'use strict';

    // ID único para evitar duplicação
    const SELOS_CONTAINER_ID = 'azul-checkout-selos';

    // Configurações
    const CHECK_INTERVAL_MS = 1000; // Verifica a cada 1 segundo
    const DEBOUNCE_DELAY_MS = 500;  // Espera 500ms após mudanças no DOM

    // Estado
    let selosInseridos = false;
    let checkTimeout = null;

    // URLs das imagens dos selos
    const SELOS = [
        {
            url: 'https://i.imgur.com/Tt92SU3.png',
            alt: 'Azul Site Seguro'
        },
        {
            url: 'https://i.imgur.com/j7dvGRR.png',
            alt: 'Pagamento Seguro'
        }
    ];

    /**
     * Detecta se está em dispositivo mobile
     */
    function isMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Verifica se está na URL correta
     */
    function isCorrectPage() {
        try {
            const currentPath = window.location.pathname;
            return currentPath.includes('/wallet/') && currentPath.includes('/payment');
        } catch (e) {
            console.warn('Erro ao verificar URL:', e);
            return false;
        }
    }

    /**
     * Encontra o elemento de referência para desktop (botão "Finalizar pagamento")
     */
    function findFinalizeButton() {
        // Busca primária: pelo texto do botão em diversos elementos clicáveis
        const candidates = document.querySelectorAll('button, a, span, div[role="button"], .sc-1eceafb7-6');

        for (let i = 0; i < candidates.length; i++) {
            const btn = candidates[i];
            const text = btn.textContent ? btn.textContent.trim().toLowerCase() : '';

            // Verifica se o texto corresponde
            if (text.includes('finalizar pagamento') || text === 'finalizar') {
                // Verifica visibilidade
                if (isElementVisible(btn)) {
                    return btn;
                }
            }
        }

        return null;
    }

    /**
     * Encontra o elemento de referência para mobile
     */
    function findMobileReference() {
        const mobileRef = document.querySelector('div.sc-946aa86f-2.cuCndq');
        if (mobileRef && isElementVisible(mobileRef)) {
            return mobileRef;
        }
        return null;
    }

    /**
     * Verifica se um elemento está visível na tela
     */
    function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    }

    /**
     * Encontra o elemento de referência baseado no dispositivo
     */
    function findReferenceElement() {
        return isMobile() ? findMobileReference() : findFinalizeButton();
    }

    /**
     * Cria o HTML dos selos
     */
    function createSelosHTML() {
        var selosHTML = '';
        var maxHeight = '38px';

        for (var i = 0; i < SELOS.length; i++) {
            var selo = SELOS[i];
            selosHTML += '<img src="' + selo.url + '" alt="' + selo.alt + '" class="azul-selo-img" style="max-height: ' + maxHeight + '; margin: 0 8px; object-fit: contain; vertical-align: middle;">';
        }

        var marginTop = isMobile() ? '0px' : '35px';
        var justify = isMobile() ? 'center' : 'flex-start';

        return '<div style="text-align: left; margin-top: ' + marginTop + '; padding: 0px 0; display: block; width: 100%; clear: both;">' +
            '<div style="display: flex; justify-content: ' + justify + '; align-items: center; flex-wrap: wrap; gap: 10px;">' +
            selosHTML +
            '</div></div>';
    }

    /**
     * Insere os selos na página
     */
    function insertSelos() {
        const referenceElement = findReferenceElement();

        if (!referenceElement) {
            // Se não encontrou a referência, remove os selos se existirem (limpeza)
            const existing = document.getElementById(SELOS_CONTAINER_ID);
            if (existing) existing.remove();
            selosInseridos = false;
            return false;
        }

        // Verifica se já existe e remove para reinserir na posição correta (caso o DOM tenha mudado)
        const existingSelos = document.getElementById(SELOS_CONTAINER_ID);
        if (existingSelos) {
            // Se o elemento anterior ao selo for o mesmo que a referência, não precisa fazer nada
            if (existingSelos.previousElementSibling === referenceElement ||
                (referenceElement.parentElement && existingSelos.previousElementSibling === referenceElement.parentElement)) {
                return true;
            }
            existingSelos.remove();
        }

        const wrapper = document.createElement('div');
        wrapper.id = SELOS_CONTAINER_ID;
        wrapper.style.cssText = 'width: 100%; clear: both; display: block;';
        wrapper.innerHTML = createSelosHTML();

        try {
            if (isMobile()) {
                referenceElement.insertAdjacentElement('afterend', wrapper);
            } else {
                // Desktop: tenta inserir após o container pai
                let container = referenceElement.parentElement;

                // Lógica para subir na árvore DOM se necessário
                if (referenceElement.tagName === 'SPAN') {
                    let parent = referenceElement.parentElement;
                    let attempts = 0;
                    while (parent && attempts < 4) {
                        const style = window.getComputedStyle(parent);
                        if ((parent.tagName === 'FORM' || parent.tagName === 'DIV' || parent.tagName === 'SECTION') &&
                            style.display !== 'inline') {
                            container = parent;
                            break;
                        }
                        parent = parent.parentElement;
                        attempts++;
                    }
                }

                if (container) {
                    container.insertAdjacentElement('afterend', wrapper);
                } else {
                    // Fallback
                    referenceElement.insertAdjacentElement('afterend', wrapper);
                }
            }
            selosInseridos = true;
            return true;
        } catch (e) {
            console.error('Erro ao inserir selos:', e);
            return false;
        }
    }

    /**
     * Função principal de verificação
     */
    function checkAndInsertSelos() {
        if (!isCorrectPage()) {
            // Se saiu da página, remove os selos
            const existing = document.getElementById(SELOS_CONTAINER_ID);
            if (existing) existing.remove();
            selosInseridos = false;
            return;
        }

        insertSelos();
    }

    /**
     * Inicialização
     */
    function init() {
        // 1. Verificação imediata
        checkAndInsertSelos();

        // 2. Intervalo constante (Watchdog)
        // Mantemos isso para garantir que se o elemento aparecer depois, nós o pegamos
        setInterval(checkAndInsertSelos, CHECK_INTERVAL_MS);

        // 3. MutationObserver para reagir a mudanças no DOM
        const observerTarget = document.documentElement || document.body;
        if (observerTarget) {
            const observer = new MutationObserver(function (mutations) {
                // Debounce para não chamar excessivamente
                clearTimeout(checkTimeout);
                checkTimeout = setTimeout(checkAndInsertSelos, DEBOUNCE_DELAY_MS);
            });

            observer.observe(observerTarget, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'hidden'] // Monitora visibilidade também
            });
        }
    }

    // Garante que o script rode
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Fallback para window.onload
    window.addEventListener('load', init);

})();
