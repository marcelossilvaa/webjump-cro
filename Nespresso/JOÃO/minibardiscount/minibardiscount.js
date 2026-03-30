(function(window, document) {
    'use strict';

    // Previne dupla inicialização
    if (window.__wjDiscountConsolidateInit) return;
    window.__wjDiscountConsolidateInit = true;

    var SELETORES = {
        raizMinicart: '.MiniBasketDropdown__dropdown',
        classeAberto: 'MiniBasketDropdown__dropdown--is-open',
        tabelaTotal: '.MiniBasketTotalTable',
        linhaDesconto: '.MiniBasketTotalTable__rebate',
        linhaTotal: '.MiniBasketTotalTable__totalPrice',
        valorSubtotal: '.MiniBasketTotalTable__subTotal-value',
        valorTotal: '.MiniBasketTotalTable__totalPrice-value',
        botaoAbrir: '#ta-mini-basket__open'
    };

    var CSS_ID = 'wj-discount-consolidate-css';
    var COMPONENTE_ID = 'wj-discount-total';
    
    var obsInterno = null;
    var obsAbrirFechar = null;
    var obsBootstrap = null;
    var isRendering = false;

    function selecionar(sel, ctx) {
        return (ctx || document).querySelector(sel);
    }

    function selecionarTodos(sel, ctx) {
        return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    }

    function obterRaiz() {
        return selecionar(SELETORES.raizMinicart);
    }

    function obterRaizAberta() {
        var r = obterRaiz();
        if (r && r.classList && r.classList.contains(SELETORES.classeAberto)) return r;
        return null;
    }

    function injetarCSS() {
        if (document.getElementById(CSS_ID)) return;

        var css = 
            '.MiniBasketTotalTable__rebate:not(#' + COMPONENTE_ID + ') { display: none !important; }' +
            '#' + COMPONENTE_ID + ' {' +
            '  display: table-row !important;' +
            '}' +
            '#' + COMPONENTE_ID + ' th,' +
            '#' + COMPONENTE_ID + ' td {' +
            '  font-family: "NespressoLucas", sans-serif;' +
            '  font-size: 1.1rem;' +
            '  font-weight: 900;' +
            '  padding: 4px 0;' +
            '  color: #3d8705;' +
            '  text-decoration: underline;' +
            '  text-transform: uppercase;' +
            '}' +
            '#' + COMPONENTE_ID + ' th {' +
            '  text-align: left;' +
            '}' +
            '#' + COMPONENTE_ID + ' td {' +
            '  text-align: right;' +
            '}';

        var style = document.createElement('style');
        style.id = CSS_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    function formatCurrency(value) {
        var absValue = Math.abs(value);
        var formatted = absValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return 'R$ -' + formatted;
    }

    function extrairValor(texto) {
        if (!texto) return 0;
        var cleanText = texto
            .replace('R$', '')
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        var num = parseFloat(cleanText);
        return isNaN(num) ? 0 : num;
    }

    function calcularDescontoViaSubtracao(raiz) {
        // Pega o Subtotal
        var subtotalEl = selecionar(SELETORES.valorSubtotal, raiz);
        // Pega o Total
        var totalEl = selecionar(SELETORES.valorTotal, raiz);
        
        if (!subtotalEl || !totalEl) {
            return null;
        }
        
        var subtotal = extrairValor(subtotalEl.textContent);
        var total = extrairValor(totalEl.textContent);
        
        // Desconto = Subtotal - Total
        var desconto = subtotal - total;
        
        // Se não houver desconto (valores iguais), retorna null
        if (desconto <= 0) {
            return null;
        }
        
        return desconto;
    }

    function verificaSeTemDescontosOriginais(raiz) {
        var descontos = selecionarTodos(SELETORES.linhaDesconto, raiz);
        // Filtra para não contar nosso componente
        var originais = 0;
        for (var i = 0; i < descontos.length; i++) {
            if (descontos[i].id !== COMPONENTE_ID) {
                originais++;
            }
        }
        return originais > 0;
    }

    function processarDescontos(raiz) {
        if (isRendering) return;
        isRendering = true;

        try {
            // Verifica se existem descontos originais para ocultar
            if (!verificaSeTemDescontosOriginais(raiz)) {
                // Se não tem descontos, remove nosso componente se existir
                var componenteExistente = document.getElementById(COMPONENTE_ID);
                if (componenteExistente && componenteExistente.parentNode) {
                    componenteExistente.parentNode.removeChild(componenteExistente);
                }
                return;
            }

            // Calcula desconto via subtração (Subtotal - Total)
            var desconto = calcularDescontoViaSubtracao(raiz);
            
            if (desconto === null || desconto <= 0) {
                return;
            }

            // Cria/atualiza o componente consolidado
            var linhaTotal = selecionar(SELETORES.linhaTotal, raiz);
            if (!linhaTotal) return;

            var componente = document.getElementById(COMPONENTE_ID);
            
            if (!componente) {
                componente = document.createElement('tr');
                componente.id = COMPONENTE_ID;
                linhaTotal.parentNode.insertBefore(componente, linhaTotal);
            }

            var formattedDiscount = formatCurrency(desconto);
            
            componente.innerHTML = 
                '<th scope="row" class="MiniBasketTotalTable__rebate-label">Desconto Total</th>' +
                '<td class="MiniBasketTotalTable__rebate-value">' + formattedDiscount + '</td>';

            // Aplica CSS para ocultar originais
            injetarCSS();

        } finally {
            setTimeout(function() {
                isRendering = false;
            }, 100);
        }
    }

    function removerObservadoresInternos() {
        if (obsInterno) {
            obsInterno.disconnect();
            obsInterno = null;
        }
    }

    function anexarObservadoresInternos(raiz) {
        removerObservadoresInternos();

        var tabela = selecionar(SELETORES.tabelaTotal, raiz);
        if (tabela) {
            var timeoutId = null;
            obsInterno = new MutationObserver(function(mutations) {
                // Ignora mutações no nosso próprio componente
                var dominated = false;
                for (var i = 0; i < mutations.length; i++) {
                    var target = mutations[i].target;
                    if (target && target.id === COMPONENTE_ID) {
                        dominated = true;
                        break;
                    }
                    if (target && target.parentNode && target.parentNode.id === COMPONENTE_ID) {
                        dominated = true;
                        break;
                    }
                }
                if (dominated) return;
                
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function() {
                    processarDescontos(raiz);
                }, 100);
            });
            obsInterno.observe(tabela, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        setTimeout(function() {
            processarDescontos(raiz);
        }, 150);
    }

    function aoAbrir() {
        var raiz = obterRaizAberta() || obterRaiz();
        if (raiz) anexarObservadoresInternos(raiz);
    }

    function aoFechar() {
        removerObservadoresInternos();
    }

    function observarAbrirFechar(raiz) {
        if (!raiz) return;
        if (obsAbrirFechar) obsAbrirFechar.disconnect();
        
        obsAbrirFechar = new MutationObserver(function(mutacoes) {
            for (var i = 0; i < mutacoes.length; i++) {
                var m = mutacoes[i];
                if (m.attributeName === 'class') {
                    if (raiz.classList.contains(SELETORES.classeAberto)) {
                        aoAbrir();
                    } else {
                        aoFechar();
                    }
                }
            }
        });
        
        obsAbrirFechar.observe(raiz, {
            attributes: true,
            attributeFilter: ['class']
        });

        if (raiz.classList.contains(SELETORES.classeAberto)) {
            aoAbrir();
        }
    }

    function observarBotaoAbrir() {
        var btn = selecionar(SELETORES.botaoAbrir);
        if (!btn) return;
        
        btn.addEventListener('click', function() {
            setTimeout(aoAbrir, 100);
        }, false);
    }

    var napiConectado = false;
    function vincularAPIAtualizacoes() {
        if (napiConectado) return;
        try {
            if (window.napi && typeof window.napi.data === 'function') {
                var api = window.napi.data();
                if (api && typeof api.on === 'function') {
                    api.on('cart.update', function() {
                        var raiz = obterRaizAberta();
                        if (raiz) {
                            setTimeout(function() {
                                processarDescontos(raiz);
                            }, 300);
                        }
                    });
                    napiConectado = true;
                }
            }
        } catch (e) {}
    }

    function iniciarObservacaoRaiz() {
        var raiz = obterRaiz();
        if (raiz) {
            observarAbrirFechar(raiz);
            observarBotaoAbrir();
            vincularAPIAtualizacoes();
            return;
        }

        if (obsBootstrap) obsBootstrap.disconnect();
        obsBootstrap = new MutationObserver(function() {
            var r = obterRaiz();
            if (r) {
                obsBootstrap.disconnect();
                observarAbrirFechar(r);
                observarBotaoAbrir();
                vincularAPIAtualizacoes();
            }
        });
        obsBootstrap.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function registrarEventoExperimento() {
        window.gtmDataObject = window.gtmDataObject || [];
        window.gtmDataObject.push({
            event: 'adobe_target',
            event_raised_by: 'adobe target',
            experiment_id: '${campaign.id}',
            experiment_type: 'XT',
            experiment_name: '${campaign.name}',
            experiment_variant_id: '${campaign.recipe.id}',
            experiment_variant: '${campaign.recipe.name}'
        });
    }

    function iniciar() {
        registrarEventoExperimento();
        iniciarObservacaoRaiz();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

})(window, document);
