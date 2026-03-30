(function() {
    "use strict";
    if (window.blocoInformativoAssinaturas) return;
    window.blocoInformativoAssinaturas = true;

    // Função para carregar os assets do design system
    function carregarDesignSystem() {
        // Carrega o CSS do ícone
        if (!document.querySelector('link[href*="icon.vanilla.css"]')) {
            const linkCSS = document.createElement('link');
            linkCSS.rel = 'stylesheet';
            linkCSS.href = '@nespresso-design-system/assets/dist/icon.vanilla.css';
            document.head.appendChild(linkCSS);
        }

        // Carrega o JS do ícone
        if (!document.querySelector('script[src*="icon.vanilla.js"]')) {
            const scriptJS = document.createElement('script');
            scriptJS.src = '@nespresso-design-system/assets/dist/icon.vanilla.js';
            document.head.appendChild(scriptJS);
        }
    }

    // Função para adicionar estilos customizados
    function adicionarEstilos() {
        if (!document.getElementById('custom-header-box-style')) {
            const style = document.createElement('style');
            style.id = 'custom-header-box-style';
            style.textContent = `
                .dp-OAC-header__title {
                    line-height: 30px !important;
                }    
              .dp-OAC-header__item {
                    display: flex !important;
                    line-height: 30px !important;
                    align-items: flex-start !important;
                    gap: 16px !important;
                    background-image: none !important;
                    padding-left: 0 !important;
                    padding-bottom: 16px !important;
                }
                .dp-OAC-header__item nb-icon {
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                    margin-top: -2px;
                }
                .dp-OAC-header__item .dp-OAC-header__argument {
                    background-image: none !important;
                    padding-left: 0 !important;
                }
                .dp-OAC-header__list {
                    display: flex;
                    flex-direction: column;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Lista de novos itens com ícones
    const novosItens = [
        { texto: "Garanta seus cafés favoritos", icone: "32/service/assistance" },
        { texto: "Desconto em Cafés", icone: "32/symbol/promotions" },
        { texto: "Frete Grátis", icone: "32/delivery/free-delivery" },
        { texto: "Ofertas Exclusivas", icone: "32/symbol/exclusive-promotions" },
        { texto: "Status Ambassador", icone: "24/symbol/warranty" },
        { texto: "15% Em Acessórios", icone: "24/accessory/accessories" },
        { texto: "Flexibilidade para alterar", icone: "32/professional/easy-stock-management" }
    ];

    // Função para alterar o bloco
    function alterarBloco() {
        const headerBox = document.querySelector('.dp-OAC-header__box');
        if (!headerBox) return false;

        // Altera o título
        const titulo = headerBox.querySelector('.dp-OAC-header__title');
        if (titulo) {
            titulo.textContent = 'A Assinatura Nespresso Cuida de Tudo para Você';
        }

        // Altera a lista de itens
        const lista = headerBox.querySelector('.dp-OAC-header__list');
        if (lista) {
            // Limpa a lista atual
            lista.innerHTML = '';

            // Adiciona os novos itens
            novosItens.forEach(item => {
                const li = document.createElement('li');
                li.className = 'dp-OAC-header__item';
                li.innerHTML = '<nb-icon icon="' + item.icone + '"></nb-icon>' +
                    '<span class="dp-OAC-header__argument">' + item.texto + '</span>';
                lista.appendChild(li);
            });
        }

        return true;
    }

    // Função principal
    function init() {
        carregarDesignSystem();
        adicionarEstilos();

        let tentativas = 0;
        const maxTentativas = 50;

        const intervalo = setInterval(function() {
            tentativas++;

            if (tentativas >= maxTentativas) {
                clearInterval(intervalo);
                return;
            }

            if (alterarBloco()) {
                clearInterval(intervalo);
            }
        }, 100);
    }

    // Garante execução após carregamento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', init);

})();
