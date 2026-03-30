    (function(window, document) {
        "use strict";

        // evita dupla inicialização (ex.: injeções repetidas em A/B)
        if (window.__wjSubInit) return;
        window.__wjSubInit = true;

        // Nomes (contém) que NÃO devem exibir o preço na assinatura
        var NOMES_BLOQUEADOS = [
        "White Chocolate & Strawberry",
        "Cold Brew Style Intense",
        "Ice Leggero",
        "Kit Cafés",
        "Kit Variedades",
        "Kit Intensos",
        "Kit de Presente",
        "Kit Favoritos",
        "Pistachio Vanilla",
        "Coconut Vanilla",
        "Sweet Almond & Hibiscus",
        "Festive Espresso",
        "Festive Double Espresso",
        "Cinnamon & Candied Tamarind"
    ];
        var NOMES_BLOQUEADOS_NORM = null;

        // cache da NAPI para elegíveis (contagem e subtotal)
        var cacheElegiveis = {
            qtdCaps: null,
            subtotal: 0
        };

        var ModuloAssinatura = (function() {
            /* ===================== CONFIGURAÇÕES ===================== */
            var CONFIGURACAO = {
                descontoPercentual: 0.1, // 10% de desconto
                depuracao: false, // logs no console quando true
                limiteQtdCapsulas: 30, // exibe quando qtdCaps >= 30
                precoMaxCapsulaParaContagem: 20, // cápsula se unitPrice <= 20 e > 0
            };

            var SELETORES = {
                raizMinicart: ".MiniBasketDropdown__dropdown",
                classeAberto: "MiniBasketDropdown__dropdown--is-open",
                tituloCarrinho: "#basket",
                botaoAbrir: "#ta-mini-basket__open",
                blocoConteudo: ".MiniBasketDropdown__content-categories",
                cabecalhoCategoria: ".MiniBasketItemCategory",
                itemProduto: ".MiniBasketItem",
                precoItemNegrito: ".MiniBasketItemPriceAndName__price > strong",
                blocoPrecoItem: ".MiniBasketItemPriceAndName__price",
                tituloItemSpan: ".MiniBasketItem__title > span[aria-hidden='true']",
                rodape: ".MiniBasketFooter",
                totalCarrinhoValor: ".MiniBasketTotalTable__totalPrice-value",
                botaoCheckout: "#ta-mini-basket__checkout",
                quantidadeItem: ".AddToBagButtonSmall__quantity",
            };

            var CLASSES = {
                dicaAssinatura: "wj-sub-hint",
                barraTotal: "wj-sub-totalbar",
            };

            var TEXTOS = {
                etiquetaAssinatura: " na Assinatura",
                rotuloTotalAssinatura: "Com Assinatura de cafés, essa compra sai por:",
                prefixoEconomia: "Você economiza ",
            };

            var CORES = {
                brancoTexto: "#ffffff",
                pretoFundoClaro: "#000000",
                pretoBordaClaro: "#000000",
                pretoTagFundo: "#000000",
                verdeFlag: "#2f6d2f",
            };

            // caches da NAPI (somente para totais/contagem)
            var cacheItensNapi = null;

            // controle de estado
            var ultimoQtdCapsulas = null;
            var renderizando = false;
            var lendoNapi = false;

            /* ===================== ESTILO ===================== */
            function garantirCSS() {
                if (document.getElementById("wj-sub-css")) return;

                var css =
                    "" +
                    "." +
                    CLASSES.dicaAssinatura +
                    "{margin-top:4px;line-height:1.25;color:" +
                    CORES.brancoTexto +
                    " !important;" +
                    "display:inline-flex;gap:6px;align-items:center;padding:1px 6px;border-radius:999px;" +
                    "background:" +
                    CORES.pretoTagFundo +
                    ";border:1px solid " +
                    CORES.pretoTagFundo +
                    ";font-size:11px}" +
                    "." +
                    CLASSES.dicaAssinatura +
                    " b{font-size:12px;font-weight:700;color:" +
                    CORES.brancoTexto +
                    ";}" +
                    "." +
                    CLASSES.dicaAssinatura +
                    " b .tag{font-size:10px;font-weight:700;color:" +
                    CORES.brancoTexto +
                    ";}" +
                    "." +
                    CLASSES.barraTotal +
                    "{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 8px;" +
                    "padding:0 10px;height:21px;border-radius:8px;background:" +
                    CORES.pretoFundoClaro +
                    ";border:1px solid " +
                    CORES.pretoBordaClaro +
                    ";color:#fff;font-size:12px}" +
                    "." +
                    CLASSES.barraTotal +
                    " .label{font-weight:400}" +
                    "." +
                    CLASSES.barraTotal +
                    " .label b{font-weight:700;}" +
                    "." +
                    CLASSES.barraTotal +
                    " .save{font-size:12px;font-weight:700;position:relative;padding-right:8px}" +
                    "." +
                    CLASSES.barraTotal +
                    " .save .flag-desconto{position:absolute;right:-16px;top:-10px;width:20px;height:20px;border-radius:50%;background:" +
                    CORES.verdeFlag +
                    ";color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:16px;text-align:center}";
                css +=
                    "@media (max-width: 480px){" +
                    "." +
                    CLASSES.barraTotal +
                    "{font-size:10px}" +
                    "." +
                    CLASSES.barraTotal +
                    " .save{font-size:10px}" +
                    "}";
                css += ".MiniBasketDropdown__wrapper:has(.MiniBasketItemCategory[id^='machines_']) ." + CLASSES.barraTotal + "{display:none !important;}";


                var st = document.createElement("style");
                st.id = "wj-sub-css";
                st.textContent = css;
                document.head.appendChild(st);
            }

            /* ===================== UTILITÁRIOS ===================== */
            function log() {
                if (!CONFIGURACAO.depuracao) return;
                try {
                    console.log.apply(
                        console,
                        ["[WJ-Assinatura]"].concat([].slice.call(arguments))
                    );
                } catch (e) {}
            }

            function selecionar(sel, ctx) {
                return (ctx || document).querySelector(sel);
            }

            function selecionarTodos(sel, ctx) {
                return Array.prototype.slice.call(
                    (ctx || document).querySelectorAll(sel)
                );
            }

            function obterRaiz() {
                return selecionar(SELETORES.raizMinicart);
            }

            function obterRaizAberta() {
                var r = obterRaiz();
                if (r && r.classList && r.classList.contains(SELETORES.classeAberto))
                    return r;
                return null;
            }

            function moedaBRLParaNumero(str) {
                var s = String(str || "");
                s = s.replace(/[\n\r\t]/g, " ").replace(/[\s\u00A0]/g, " ");
                s = s
                    .replace(/[^\d\.,-]/g, "")
                    .replace(/\./g, "")
                    .replace(",", ".");
                var n = parseFloat(s);
                return isNaN(n) ? NaN : n;
            }

            function numeroParaBRL(num) {
                return Number(num).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                });
            }

            function normalizarNomeCafe(t) {
                try {
                    return String(t || "")
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[&/]/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();
                } catch (e) {
                    return String(t || "")
                        .toLowerCase()
                        .replace(/[&/]/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();
                }
            }

            function ehNomeBloqueadoPorNorm(nomeNorm) {
                if (!NOMES_BLOQUEADOS_NORM) {
                    NOMES_BLOQUEADOS_NORM = NOMES_BLOQUEADOS.map(function(n) {
                        return normalizarNomeCafe(n);
                    });
                }
                for (var i = 0; i < NOMES_BLOQUEADOS_NORM.length; i++) {
                    if (nomeNorm.indexOf(NOMES_BLOQUEADOS_NORM[i]) !== -1) return true; // contém
                }
                return false;
            }

            function extrairNomeDoNoDom(noItem) {
                try {
                    var tEl = selecionar(SELETORES.tituloItemSpan, noItem);
                    if (tEl && tEl.textContent) return tEl.textContent;
                    var h = noItem.querySelector(
                        ".MiniBasketItem__title,.MiniBasketItemPriceAndName__name"
                    );
                    if (h && h.textContent) return h.textContent;
                } catch (e) {}
                return "";
            }

            /* ===================== NAPI: sumarização (para gating 30+ e total) ===================== */
            function sumarizarElegiveisNapi(itens) {
                var qtd = 0,
                    subtotal = 0;
                for (var i = 0; i < itens.length; i++) {
                    var it = itens[i];
                    if (!it || it.nonRemovable) continue; // ignora brindes
                    var up = Number(it.unitPrice);
                    var q = Number(it.quantity) || 0;
                    if (!isFinite(up) || up <= 0) continue;
                    if (up <= CONFIGURACAO.precoMaxCapsulaParaContagem) {
                        var nomeRaw = it.productName || it.name || it.label || "";
                        var nameNorm = normalizarNomeCafe(nomeRaw);
                        if (ehNomeBloqueadoPorNorm(nameNorm)) continue; // remove edição especial por nome
                        qtd += q;
                        subtotal += up * q;
                    }
                }
                return {
                    qtdCaps: qtd,
                    subtotal: subtotal
                };
            }

            // Lê NAPI (array ou Promise) e atualiza caches; re-render quando resolver
            function contarElegiveisViaNapi(callbackPosAtualizacao) {
                try {
                    if (lendoNapi) return cacheElegiveis;
                    if (
                        !(
                            window.napi &&
                            window.napi.cart &&
                            typeof window.napi.cart().read === "function"
                        )
                    ) {
                        return cacheElegiveis;
                    }

                    var res = window.napi.cart().read();

                    if (res && typeof res.then === "function") {
                        lendoNapi = true;
                        res
                            .then(function(itens) {
                                cacheItensNapi = itens || [];
                                cacheElegiveis =
                                    itens && itens.length ?
                                    sumarizarElegiveisNapi(itens) : {
                                        qtdCaps: 0,
                                        subtotal: 0
                                    };
                                lendoNapi = false;

                                if (typeof callbackPosAtualizacao === "function") {
                                    callbackPosAtualizacao(cacheElegiveis);
                                } else {
                                    var r = obterRaizAberta() || obterRaiz();
                                    if (r) renderizarSeMudou(r);
                                }
                            })
                            .catch(function() {
                                lendoNapi = false;
                            });

                        return cacheElegiveis;
                    }

                    if (res && res.length) {
                        cacheItensNapi = res || [];
                        cacheElegiveis = sumarizarElegiveisNapi(res);
                        return cacheElegiveis;
                    }
                } catch (e) {}
                return cacheElegiveis;
            }

            function obterSubtotalCapsElegiveis() {
                return cacheElegiveis && typeof cacheElegiveis.subtotal === "number" ?
                    cacheElegiveis.subtotal :
                    0;
            }

            /* ===================== RENDERIZAÇÃO ITEM (baseado só no NOME) ===================== */
            function inserirOuAtualizarDicaAssinatura(noItem) {
                if (!noItem) return false;

                var textoItem = noItem.textContent || "";
                if (/gr(á|a)tis/i.test(textoItem)) return false; // ignora brindes

                // bloqueio por nome (DOM)
                var nomeDomNorm = normalizarNomeCafe(extrairNomeDoNoDom(noItem));
                if (ehNomeBloqueadoPorNorm(nomeDomNorm)) {
                    var pillEx = selecionar("." + CLASSES.dicaAssinatura, noItem);
                    if (pillEx && pillEx.parentNode) pillEx.parentNode.removeChild(pillEx);
                    return false;
                }

                // preço exibido no DOM
                var elPrecoFort = selecionar(SELETORES.precoItemNegrito, noItem);
                if (!elPrecoFort) return false;
                var textoPreco = elPrecoFort.textContent || "";
                var m = textoPreco.match(/R\$\s*[\d\.,]+/);
                var preco = moedaBRLParaNumero(m ? m[0] : "");
                if (!isFinite(preco) || preco <= 0) return false;

                var precoComAssinatura = +(
                    preco *
                    (1 - CONFIGURACAO.descontoPercentual)
                ).toFixed(2);

                var blocoPreco =
                    selecionar(SELETORES.blocoPrecoItem, noItem) || elPrecoFort;
                var dica = selecionar("." + CLASSES.dicaAssinatura, noItem);
                if (!dica) {
                    dica = document.createElement("div");
                    dica.className = CLASSES.dicaAssinatura;
                    blocoPreco.insertAdjacentElement("afterend", dica);
                }
                dica.innerHTML =
                    "<span><b>" +
                    numeroParaBRL(precoComAssinatura) +
                    '<span class="tag">' +
                    TEXTOS.etiquetaAssinatura +
                    "</span>" +
                    "</b></span>";
                return true;
            }

            function processarItens(raiz) {
                var conteudo = selecionar(SELETORES.blocoConteudo, raiz);
                if (!conteudo) return false;

                var exibiu = false;
                var emCapsulas = false;

                function removerPill(noItem) {
                    var el = selecionar("." + CLASSES.dicaAssinatura, noItem);
                    if (el && el.parentNode) el.parentNode.removeChild(el);
                }

                var filhos = conteudo.children;
                for (var i = 0; i < filhos.length; i++) {
                    var node = filhos[i];

                    if (node.matches && node.matches(SELETORES.cabecalhoCategoria)) {
                        var txt = node.textContent || "";
                        emCapsulas = /c(á|a)psulas/i.test(txt);
                        continue;
                    }

                    if (
                        !(emCapsulas && node.matches && node.matches(SELETORES.itemProduto))
                    )
                        continue;

                    // bloqueio imediato por nome via DOM
                    var nomeDomNorm = normalizarNomeCafe(extrairNomeDoNoDom(node));
                    if (ehNomeBloqueadoPorNorm(nomeDomNorm)) {
                        removerPill(node);
                        continue;
                    }

                    // elegível -> injeta/atualiza a pill
                    exibiu = inserirOuAtualizarDicaAssinatura(node) || exibiu;
                }
                return exibiu;
            }

            /* ===================== RENDERIZAÇÃO TOTAL ===================== */
            function inserirOuAtualizarBarraTotal(raiz) {
                var urlAssinatura =
                    "https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list";
                var labelNegrito = TEXTOS.rotuloTotalAssinatura.replace(
                    /Assinaturas? de cafés/i,
                    '<a href="' +
                    urlAssinatura +
                    '" target="_blank" rel="noopener noreferrer" data-wj-sub-link="1" style="color:inherit;text-decoration:underline"><b>$&</b></a>'
                );

                var rodape = selecionar(SELETORES.rodape, raiz);
                var elTotal = selecionar(SELETORES.totalCarrinhoValor, raiz);
                var botaoCTA = selecionar(SELETORES.botaoCheckout, raiz);
                if (!rodape || !elTotal || !botaoCTA) return false;

                var total = moedaBRLParaNumero(elTotal.textContent);
                if (!isFinite(total) || total <= 0) {
                    var antiga = selecionar("." + CLASSES.barraTotal, rodape);
                    if (antiga) antiga.remove();
                    return false;
                }

                var subtotalElegivel = obterSubtotalCapsElegiveis();
                var descontoElegivel = subtotalElegivel * CONFIGURACAO.descontoPercentual;
                var totalComAssinatura = +(total - descontoElegivel).toFixed(2);

                var barra = selecionar("." + CLASSES.barraTotal, rodape);
                if (!barra) {
                    barra = document.createElement("div");
                    barra.className = CLASSES.barraTotal;
                    botaoCTA.parentElement.insertBefore(barra, botaoCTA);
                }

                var html =
                    '<div class="left">' +
                    '<div class="label">' +
                    labelNegrito +
                    "</div>" +
                    "</div>" +
                    '<div class="right save">' +
                    numeroParaBRL(totalComAssinatura) +
                    '<span class="flag-desconto">-' +
                    Math.round(CONFIGURACAO.descontoPercentual * 100) +
                    "%</span>" +
                    "</div>";

                barra.innerHTML = html;
                barra.innerHTML = html;

                // 2) Bind do clique -> dispara local_event no GTM
                var linkAss = barra.querySelector('a[data-wj-sub-link="1"]');
                if (linkAss && !linkAss.getAttribute("data-wj-bound")) {
                    linkAss.setAttribute("data-wj-bound", "1");
                    linkAss.addEventListener(
                        "click",
                        function() {
                            try {
                                window.gtmDataObject = window.gtmDataObject || [];
                                window.gtmDataObject.push({
                                    event: "local_event",
                                    event_raised_by: "br",
                                    local_event_category: "user engagement",
                                    local_event_action: "assinaturas_de_cafes_link_click",
                                    local_event_label: "xt_adobe_target_assinatura_link",
                                });
                            } catch (e) {}
                        },
                        false
                    );
                }
                return true;
            }

            /* ===================== SNAPSHOT ===================== */
            var ultimoSnapshotPorRaiz = new WeakMap();

            function criarSnapshot(raiz) {
                var partes = [];
                var conteudo = selecionar(SELETORES.blocoConteudo, raiz);
                if (conteudo) {
                    var itens = selecionarTodos(SELETORES.itemProduto, conteudo);
                    for (var i = 0; i < itens.length; i++) {
                        var it = itens[i];
                        var tEl = selecionar(SELETORES.tituloItemSpan, it);
                        var pEl = selecionar(SELETORES.precoItemNegrito, it);
                        var t = tEl ? tEl.textContent : "";
                        var p = pEl ? pEl.textContent : "";
                        partes.push(
                            t.replace(/\s+/g, " ").trim() + "|" + p.replace(/\s+/g, " ").trim()
                        );
                    }
                }

                partes.push(
                    "CAPS:" + (ultimoQtdCapsulas == null ? "NA" : ultimoQtdCapsulas)
                );
                partes.push(
                    "READY:" +
                    (cacheElegiveis && typeof cacheElegiveis.qtdCaps === "number" ?
                        "1" :
                        "0")
                );
                partes.push("SUBELEG:" + numeroParaBRL(obterSubtotalCapsElegiveis()));

                var totalEl = selecionar(SELETORES.totalCarrinhoValor, raiz);
                var totalTxt = totalEl ? totalEl.textContent : "";
                partes.push("TOTAL:" + totalTxt.replace(/\s+/g, " ").trim());

                return partes.join("||");
            }

            function renderizarSeMudou(raiz) {
                if (
                    !raiz ||
                    !raiz.classList ||
                    !raiz.classList.contains(SELETORES.classeAberto)
                )
                    return;
                if (renderizando) return;
                renderizando = true;

                try {
                    // se a NAPI ainda não populou o cache, não exibe nada
                    if (!cacheElegiveis || typeof cacheElegiveis.qtdCaps !== "number") {
                        removerComponentes(raiz);
                        ultimoQtdCapsulas = null;
                        var snapWait = criarSnapshot(raiz);
                        ultimoSnapshotPorRaiz.set(raiz, snapWait);
                        return;
                    }

                    var qtdCaps = cacheElegiveis.qtdCaps;

                    // só exibe se for 30+ cápsulas elegíveis (contadas via NAPI, já excluindo nomes bloqueados)
                    if (qtdCaps < CONFIGURACAO.limiteQtdCapsulas) {
                        removerComponentes(raiz);
                        ultimoQtdCapsulas = qtdCaps;
                        var snapSilent = criarSnapshot(raiz);
                        ultimoSnapshotPorRaiz.set(raiz, snapSilent);
                        return;
                    }

                    ultimoQtdCapsulas = qtdCaps;

                    var snap = criarSnapshot(raiz);
                    var anterior = ultimoSnapshotPorRaiz.get(raiz);
                    if (snap === anterior) return;

                    ultimoSnapshotPorRaiz.set(raiz, snap);
                    garantirCSS();
                    var exibiuItens = processarItens(raiz);
                    var exibiuBarra = inserirOuAtualizarBarraTotal(raiz);
                    dispararEventoAberturaUmaVez(exibiuItens || exibiuBarra);
                } finally {
                    renderizando = false;
                }
            }

            /* ===================== EVENTOS (GTM) ===================== */
            var eventoAberturaEnviado = false;

            function dispararEventoAberturaUmaVez(exibiu) {
                if (eventoAberturaEnviado) return;
                eventoAberturaEnviado = true;
                window.gtmDataObject = window.gtmDataObject || [];
                window.gtmDataObject.push({
                    event: "local_event",
                    event_raised_by: "br",
                    local_event_category: "user engagement",
                    local_event_action: exibiu ?
                        "assinatura_incentivo_exibido" : "assinatura_incentivo_nao_exibido",
                    local_event_label: "xt_adobe_target_assinatura_" + (exibiu ? "exibido" : "nao_exibido"),
                });
            }

            function registrarEventoExperimento() {
                window.gtmDataObject = window.gtmDataObject || [];
                window.gtmDataObject.push({
                    event: "adobe_target",
                    event_raised_by: "adobe target",
                    experiment_id: "${campaign.id}",
                    experiment_type: "XT",
                    experiment_name: "${campaign.name}",
                    experiment_variant_id: "${campaign.recipe.id}",
                    experiment_variant: "${campaign.recipe.name}",
                });
            }

            /* ===================== OBSERVADORES ===================== */
            var obsInterno = null;
            var obsTextoTotal = null;
            var obsAbrirFechar = null;
            var ioTitulo = null;
            var obsBotao = null;
            var obsBootstrap = null;

            function removerComponentes(raiz) {
                var dicas = selecionarTodos("." + CLASSES.dicaAssinatura, raiz);
                for (var i = 0; i < dicas.length; i++) {
                    if (dicas[i] && dicas[i].parentNode)
                        dicas[i].parentNode.removeChild(dicas[i]);
                }
                var barra = selecionar("." + CLASSES.barraTotal, raiz);
                if (barra && barra.parentNode) barra.parentNode.removeChild(barra);
            }

            function anexarObservadoresInternos(raiz) {
                removerObservadoresInternos();
                log("anexarObservadoresInternos");

                var alvo = selecionar(SELETORES.blocoConteudo, raiz) || raiz;
                obsInterno = new MutationObserver(function() {
                    renderizarSeMudou(raiz);
                });
                // observer mais leve: só estrutura do conteúdo
                obsInterno.observe(alvo, {
                    childList: true,
                    subtree: true
                });

                var t = selecionar(SELETORES.totalCarrinhoValor, raiz);
                if (t) {
                    obsTextoTotal = new MutationObserver(function() {
                        renderizarSeMudou(raiz);
                    });
                    obsTextoTotal.observe(t, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                    });
                }

                setTimeout(function() {
                    renderizarSeMudou(raiz);
                }, 120);
            }

            function removerObservadoresInternos() {
                if (obsInterno) {
                    obsInterno.disconnect();
                    obsInterno = null;
                }
                if (obsTextoTotal) {
                    obsTextoTotal.disconnect();
                    obsTextoTotal = null;
                }
            }

            function aoAbrir() {
                var raiz = obterRaizAberta() || obterRaiz();
                eventoAberturaEnviado = false;
                if (raiz) anexarObservadoresInternos(raiz);
                contarElegiveisViaNapi(); // prime o cache (inclui itens e elegíveis por nome)
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
                        if (m.attributeName === "class") {
                            if (raiz.classList.contains(SELETORES.classeAberto)) aoAbrir();
                            else aoFechar();
                        }
                    }
                });
                obsAbrirFechar.observe(raiz, {
                    attributes: true,
                    attributeFilter: ["class"],
                });
                if (raiz.classList.contains(SELETORES.classeAberto)) aoAbrir();
                else aoFechar();
            }

            function observarTituloComIO() {
                var titulo = selecionar(SELETORES.tituloCarrinho);
                if (!titulo) return;
                if (ioTitulo) ioTitulo.disconnect();
                ioTitulo = new IntersectionObserver(
                    function(entradas) {
                        for (var i = 0; i < entradas.length; i++) {
                            var e = entradas[i];
                            if (e.isIntersecting) aoAbrir();
                            else aoFechar();
                        }
                    }, {
                        root: null,
                        rootMargin: "0px",
                        threshold: [0, 0.01]
                    }
                );
                ioTitulo.observe(titulo);
            }

            function observarBotaoAbrir() {
                var btn = selecionar(SELETORES.botaoAbrir);
                if (!btn) return;
                btn.addEventListener(
                    "click",
                    function() {
                        setTimeout(aoAbrir, 50);
                    },
                    false
                );
                if (obsBotao) obsBotao.disconnect();
                obsBotao = new MutationObserver(function(mutacoes) {
                    for (var i = 0; i < mutacoes.length; i++) {
                        var m = mutacoes[i];
                        if (m.attributeName === "aria-expanded") {
                            var aberto = btn.getAttribute("aria-expanded") === "true";
                            if (aberto) aoAbrir();
                            else aoFechar();
                        }
                    }
                });
                obsBotao.observe(btn, {
                    attributes: true,
                    attributeFilter: ["aria-expanded"],
                });
            }

            /* ===================== HOOK API NAPI ===================== */
            var napiConectado = false;

            function vincularAPIAtualizacoes() {
                if (napiConectado) return;
                try {
                    if (window.napi && typeof window.napi.data === "function") {
                        var api = window.napi.data();
                        if (api && typeof api.on === "function") {
                            var t;
                            var disparar = function() {
                                if (t) clearTimeout(t);
                                t = setTimeout(function() {
                                    var raiz = obterRaizAberta();
                                    if (raiz) renderizarSeMudou(raiz);
                                }, 60);
                            };
                            api.on("cart.update", function() {
                                log("napi cart.update");
                                contarElegiveisViaNapi(); // atualiza caches e dispara render ao concluir
                                disparar();
                            });
                            napiConectado = true;
                        }
                    }
                } catch (e) {
                    /* no-op */
                }
            }

            /* ===================== BOOTSTRAP ===================== */
            function iniciarObservacaoRaiz() {
                var raiz = obterRaiz();
                if (raiz) {
                    observarAbrirFechar(raiz);
                    observarTituloComIO();
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
                        observarTituloComIO();
                        observarBotaoAbrir();
                        vincularAPIAtualizacoes();
                    }
                });
                obsBootstrap.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }

            /* ===================== API PÚBLICA ===================== */
            function iniciar() {
                registrarEventoExperimento();
                iniciarObservacaoRaiz();
                contarElegiveisViaNapi(); // prime inicial fora do mini-cart também
            }

            return {
                iniciar: iniciar,
                _cfg: CONFIGURACAO,
                _seletores: SELETORES
            };
        })();

        // Auto-init
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", ModuloAssinatura.iniciar);
        } else {
            ModuloAssinatura.iniciar();
        }
    })(window, document);