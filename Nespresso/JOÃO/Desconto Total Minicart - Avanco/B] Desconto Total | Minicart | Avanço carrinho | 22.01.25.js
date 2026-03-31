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
        var BALAO_ID = 'wj-discount-balloon';

        var obsInterno = null;
        var obsAbrirFechar = null;
        var obsBootstrap = null;
        var isRendering = false;
        var descontosCache = [];

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
                '.MiniBasketTotalTable__rebate:not(#' + COMPONENTE_ID + ') {' +
                '  display: none !important;' +
                '}' +
                '#' + COMPONENTE_ID + ' {' +
                '  display: table-row !important;' +
                '  cursor: pointer;' +
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
            var subtotalEl = selecionar(SELETORES.valorSubtotal, raiz);
            var totalEl = selecionar(SELETORES.valorTotal, raiz);

            if (!subtotalEl || !totalEl) {
                return null;
            }

            var subtotal = extrairValor(subtotalEl.textContent);
            var total = extrairValor(totalEl.textContent);
            var desconto = subtotal - total;

            if (desconto <= 0) {
                return null;
            }

            return desconto;
        }

        function coletarDescontosOriginais(raiz) {
            var descontos = selecionarTodos(SELETORES.linhaDesconto, raiz);
            var lista = [];
            for (var i = 0; i < descontos.length; i++) {
                if (descontos[i].id === COMPONENTE_ID) continue;
                var labelEl = selecionar('.MiniBasketTotalTable__rebate-label', descontos[i]);
                var valorEl = selecionar('.MiniBasketTotalTable__rebate-value', descontos[i]);
                if (!labelEl || !valorEl) continue;
                var label = labelEl.textContent.trim();
                var valor = valorEl.textContent.trim();
                if (!label || !valor) continue;
                // Valida se o valor parece um preco real (contem numero)
                if (!/\d/.test(valor)) continue;
                lista.push({ label: label, valor: valor });
            }
            if (lista.length > 0) {
                descontosCache = lista;
            }
            return lista.length > 0 ? lista : descontosCache;
        }

        function verificaSeTemDescontosOriginais(raiz) {
            var descontos = selecionarTodos(SELETORES.linhaDesconto, raiz);
            for (var i = 0; i < descontos.length; i++) {
                if (descontos[i].id !== COMPONENTE_ID) return true;
            }
            return descontosCache.length > 0;
        }

        function criarBalao(descontosIndividuais) {
            var balao = document.getElementById(BALAO_ID);
            if (balao && balao.parentNode) {
                balao.parentNode.removeChild(balao);
            }

            balao = document.createElement('div');
            balao.id = BALAO_ID;
            balao.style.cssText = 'display:none;position:absolute;bottom:100%;left:0;right:0;' +
                'background:#ffffff;border-radius:5px;padding:12px 16px;z-index:1000;' +
                'box-shadow:0 4px 20px rgba(0,0,0,0.15);font-family:NespressoLucas,sans-serif;' +
                'margin-bottom:10px;';

            // Seta do balao (elemento real em vez de pseudo-elemento)
            var seta = document.createElement('div');
            seta.style.cssText = 'position:absolute;bottom:-6px;left:20px;width:12px;height:12px;' +
                'background:#ffffff;transform:rotate(45deg);box-shadow:2px 2px 4px rgba(0,0,0,0.05);';
            balao.appendChild(seta);

            // Titulo
            var titulo = document.createElement('div');
            titulo.style.cssText = 'font-size:0.85rem;font-weight:700;color:#333333;' +
                'text-transform:uppercase;margin-bottom:8px;padding-bottom:6px;' +
                'border-bottom:1px solid #e5e5e5;text-decoration:none;';
            titulo.textContent = 'Detalhes do desconto';
            balao.appendChild(titulo);

            // Itens de desconto
            for (var d = 0; d < descontosIndividuais.length; d++) {
                var item = document.createElement('div');
                item.style.cssText = 'display:flex;justify-content:space-between;' +
                    'align-items:center;padding:4px 0;';

                var labelSpan = document.createElement('span');
                labelSpan.style.cssText = 'font-size:0.85rem;font-weight:400;color:#555555;' +
                    'text-decoration:none;text-transform:none;';
                labelSpan.textContent = descontosIndividuais[d].label;

                var valorSpan = document.createElement('span');
                valorSpan.style.cssText = 'font-size:0.85rem;font-weight:700;color:#3d8705;' +
                    'text-decoration:none;text-transform:none;';
                valorSpan.textContent = descontosIndividuais[d].valor;

                item.appendChild(labelSpan);
                item.appendChild(valorSpan);
                balao.appendChild(item);
            }

            return balao;
        }

        function mostrarBalao() {
            var balao = document.getElementById(BALAO_ID);
            if (balao) balao.style.display = 'block';
        }

        function esconderBalao() {
            var balao = document.getElementById(BALAO_ID);
            if (balao) balao.style.display = 'none';
        }

        function processarDescontos(raiz) {
            if (isRendering) return;
            isRendering = true;

            try {
                // Coleta descontos ANTES de qualquer modificacao no DOM
                var descontosIndividuais = coletarDescontosOriginais(raiz);

                if (!verificaSeTemDescontosOriginais(raiz)) {
                    var componenteExistente = document.getElementById(COMPONENTE_ID);
                    if (componenteExistente && componenteExistente.parentNode) {
                        componenteExistente.parentNode.removeChild(componenteExistente);
                    }
                    return;
                }

                var desconto = calcularDescontoViaSubtracao(raiz);

                if (desconto === null || desconto <= 0) {
                    return;
                }

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
                    '<th scope="row" class="MiniBasketTotalTable__rebate-label">' +
                    'Desconto Total</th>' +
                    '<td class="MiniBasketTotalTable__rebate-value">' + formattedDiscount + '</td>';

                // Posiciona o th como relative para ancorar o balao
                var thEl = selecionar('th', componente);
                if (thEl) {
                    thEl.style.position = 'relative';
                }

                // Cria e insere o balao dentro do th
                if (descontosIndividuais.length > 0 && thEl) {
                    var balao = criarBalao(descontosIndividuais);
                    thEl.appendChild(balao);
                }

                // Adiciona listeners de hover se ainda nao adicionados
                if (!componente.getAttribute('data-hover-listener-added')) {
                    componente.setAttribute('data-hover-listener-added', 'true');
                    componente.addEventListener('mouseenter', mostrarBalao, false);
                    componente.addEventListener('mouseleave', esconderBalao, false);
                }

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

        function pertenceAoComponente(node) {
            while (node) {
                if (node.id === COMPONENTE_ID || node.id === BALAO_ID) return true;
                node = node.parentNode;
            }
            return false;
        }

        function anexarObservadoresInternos(raiz) {
            removerObservadoresInternos();

            var tabela = selecionar(SELETORES.tabelaTotal, raiz);
            if (tabela) {
                var timeoutId = null;
                obsInterno = new MutationObserver(function(mutations) {
                    var dominated = true;
                    for (var i = 0; i < mutations.length; i++) {
                        if (!pertenceAoComponente(mutations[i].target)) {
                            dominated = false;
                            break;
                        }
                    }
                    if (dominated) return;

                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(function() {
                        processarDescontos(raiz);
                    }, 150);
                });
                obsInterno.observe(tabela, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }

            setTimeout(function() {
                processarDescontos(raiz);
            }, 200);
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