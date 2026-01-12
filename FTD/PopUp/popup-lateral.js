//Pop UP lateral - FTD

(function () {
    'use strict';

    const PRODUCT_IDS = {
        MINIDICIONARIO: 56551,
        DICIONARIO_INGLES: 53959,
        ENQUANTO_MAMAE_DORMIA: 697535,
        E_HORA: 697547,
        TIJOLO_POR_TIJOLO: 697682,
    };

    // Mapeamento de nível escolar para produtos recomendados em ordem de prioridade
    // O primeiro produto do array é o mais importante, depois o segundo
    // Baseado na nova tabela fornecida (máximo 2 produtos por nível)
    const GRADE_RECOMMENDATIONS = {
        // Educação Infantil - 1 ano
        1: [
            PRODUCT_IDS.ENQUANTO_MAMAE_DORMIA,
            PRODUCT_IDS.E_HORA,
        ],
        // Educação Infantil - 2 anos
        2: [
            PRODUCT_IDS.ENQUANTO_MAMAE_DORMIA,
            PRODUCT_IDS.E_HORA,
        ],
        // Educação Infantil - 3 anos
        3: [
            PRODUCT_IDS.ENQUANTO_MAMAE_DORMIA,
            PRODUCT_IDS.E_HORA,
        ],
        // Pré Escola - 4 anos
        4: [
            PRODUCT_IDS.ENQUANTO_MAMAE_DORMIA,
            PRODUCT_IDS.E_HORA,
        ],
        // Pré Escola - 5 anos
        5: [
            PRODUCT_IDS.ENQUANTO_MAMAE_DORMIA,
            PRODUCT_IDS.E_HORA,
        ],
        // 1º Série / 1º ano - Anos iniciais (6 anos)
        6: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.TIJOLO_POR_TIJOLO,
        ],
        // 2º Série / 2º ano - Anos iniciais (7 anos)
        7: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.TIJOLO_POR_TIJOLO,
        ],
        // 3º Série / 3º ano - Anos iniciais (8 anos)
        8: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.TIJOLO_POR_TIJOLO,
        ],
        // 4º Série / 4º ano - Anos iniciais (9 anos)
        9: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.TIJOLO_POR_TIJOLO,
        ],
        // 5º Série / 5º ano - Anos iniciais (10 anos)
        10: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.TIJOLO_POR_TIJOLO,
        ],
        // 6º Série / 6º ano - Anos finais (11 anos)
        11: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.TIJOLO_POR_TIJOLO,
        ],
        // 7º Série / 7º ano - Anos finais (12 anos)
        12: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.DICIONARIO_INGLES,
        ],
        // 8º Série / 8º ano - Anos finais (13 anos)
        13: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.DICIONARIO_INGLES,
        ],
        // 9º Série / 9º ano - Anos finais (14 anos)
        14: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.DICIONARIO_INGLES,
        ],
        // Ensino Médio 1 / 1º Colegial (15 anos)
        15: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.DICIONARIO_INGLES,
        ],
        // Ensino Médio 2 / 2º Colegial (16 anos)
        16: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.DICIONARIO_INGLES,
        ],
        // Ensino Médio 3 / 3º Colegial (17 anos)
        17: [
            PRODUCT_IDS.MINIDICIONARIO,
            PRODUCT_IDS.DICIONARIO_INGLES,
        ],
    };

    // Mapeamento de opções de bundle por produto (removido - não há mais bundles na nova tabela)
    const BUNDLE_OPTIONS_MAP = {
    };

    const POPUP_ID = 'recommendation-popup';
    const STYLE_ID = 'recommendation-popup-style';

    // Configurações de controle do popup
    const POPUP_RULES = {
        MAX_DISPLAYS_PER_DAY: 2,           // Máximo 2 vezes por dia
        COOLDOWN_MINUTES: 30,              // 30 minutos entre exibições
        MAX_DISPLAYS_PER_SESSION: 1,       // Máximo 1 vez por sessão
        INITIAL_DELAY_MS: 3000,            // 3 segundos antes de poder exibir
        STORAGE_KEY_PREFIX: 'ftd_popup_'   // Prefixo para localStorage
    };

    // Mapeamento de estudante/adoption (Portado do miniCart.js)
    let STUDENT_GRADE_MAP = {};
    let ADOPTION_LIST_GRADE_MAP = {};
    let STUDENTS_DATA_LOADED = false;

    // Controle de sessão
    let SESSION_POPUP_SHOWN = false;
    let PAGE_LOAD_TIME = Date.now();
    // Flag para evitar múltiplos agendamentos enquanto aguardamos o INITIAL_DELAY_MS
    let initialDelayScheduled = false;

    // Retorna milissegundos restantes até o delay inicial completar (>= 0)
    function msUntilInitialReady() {
        try {
            var elapsed = Date.now() - PAGE_LOAD_TIME;
            var remaining = POPUP_RULES.INITIAL_DELAY_MS - elapsed;
            return remaining > 0 ? remaining : 0;
        } catch (e) {
            // Em caso de erro, considera pronto (0)
            return 0;
        }
    }

    // Funções Auxiliares Comuns
    function fmtBRL(n) {
        try {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
        } catch (e) {
            return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
        }
    }

    function getCookie(name) {
        return document.cookie.split('; ').reduce(function (acc, cur) {
            let i = cur.indexOf('='),
                k = cur.substring(0, i),
                v = cur.substring(i + 1);
            if (k === name) acc = decodeURIComponent(v);
            return acc;
        }, '');
    }

    function getFormKey() {
        const inputs = document.querySelectorAll('input[name="form_key"]');
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value && inputs[i].value.trim()) return inputs[i].value.trim();
        }
        const forms = document.querySelectorAll('form');
        for (let j = 0; j < forms.length; j++) {
            const formInput = forms[j].querySelector('input[name="form_key"]');
            if (formInput && formInput.value && formInput.value.trim()) return formInput.value.trim();
        }
        const ck = getCookie('form_key');
        if (ck && ck.trim()) return ck.trim();
        return '';
    }

    function addToCartViaAjax(productId, qty, uenc, formKey) {
        if (!formKey) formKey = getFormKey();
        if (!formKey) return Promise.reject(new Error('form_key não encontrado'));

        const url = '/checkout/cart/add/uenc/' + encodeURIComponent(uenc) + '/product/' + String(productId) + '/';
        const params = new URLSearchParams();
        params.set('form_key', formKey);
        params.set('product', String(productId));
        params.set('qty', String(qty || 1));
        params.set('uenc', uenc);

        // Adiciona opções de bundle se o produto estiver no mapeamento
        const bundleOptions = BUNDLE_OPTIONS_MAP[productId];
        if (bundleOptions) {
            for (const optionName in bundleOptions) {
                if (bundleOptions.hasOwnProperty(optionName)) {
                    params.set(optionName, bundleOptions[optionName]);
                }
            }
        }

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: params.toString(),
            redirect: 'manual',
        }).then(function (res) {
            if (res.status >= 300 && res.status < 400) return { success: true, redirected: true };
            return res.text().then(function (text) {
                try {
                    const json = JSON.parse(text);
                    return { success: true, data: json };
                } catch (e) {
                    if (res.ok || text.includes('success') || text.includes('carrinho')) return { success: true, data: text };
                    return { success: false, error: 'Erro ao adicionar' };
                }
            });
        });
    }

    function magentoCustomerData(cb) {
        if (!window.require) return cb(null);
        try {
            window.require(['Magento_Customer/js/customer-data'], function (cd) { cb(cd); });
        } catch (e) { cb(null); }
    }

    function reloadCartSection() {
        magentoCustomerData(function (cd) {
            if (cd) { try { cd.reload(['cart'], true); } catch (e) { } }
            fetch('/customer/section/load/?sections=cart').catch(function () { });
        });
    }

    // Função para tracking de eventos do popup
    function analyticsPopupEvent(eventLabel, productId, productName, priceNumber, quantity, category) {
        if (eventLabel === undefined || !eventLabel) {
            return;
        }

        var productNameFormatted = productName || 'Produto';
        var quantityValue = quantity || 1;
        var priceValue = priceNumber || 0;

        // Formato: :productName;quantity;price;;
        var productsString =
            ':' + productNameFormatted.replace(/,/g, '') + ';' + quantityValue + ';' + priceValue.toFixed(2) + ';;';

        var eVar25Value = 'AT_popup_lateral_' + eventLabel;

        console.log('[Tracking PopupLateral] Analytics event:', eVar25Value);

        (function () {
            var s = window.s || (typeof s_gi === 'function' && s_gi('lumisfera'));
            if (!s || typeof s.tl !== 'function') return;

            s.linkTrackVars = 'products,events,eVar25';
            s.linkTrackEvents = 'scAdd';
            s.products = productsString;
            s.events = 'scAdd';
            s.eVar25 = eVar25Value;

            s.tl(true, 'o', 'target_activity_action');
        })();
    }

    // Função para tracking simplificado (sem produto)
    function analyticsSimpleEvent(eventLabel) {
        if (!eventLabel) {
            return;
        }

        var eVar25Value = 'AT_popup_lateral_' + eventLabel;

        console.log('[Tracking PopupLateral] Analytics event:', eVar25Value);

        (function () {
            var s = window.s || (typeof s_gi === 'function' && s_gi('lumisfera'));
            if (!s || typeof s.tl !== 'function') return;

            s.linkTrackVars = 'events,eVar25';
            s.linkTrackEvents = 'scAdd';
            s.events = 'scAdd';
            s.eVar25 = eVar25Value;

            s.tl(true, 'o', 'target_activity_action');
        })();
    }

    // --- Lógica de Detecção de Grau (Portada do miniCart.js) ---

    function fetchStudentsData() {
        // Simplificado para retornar promise se já carregado ou buscar se novo
        if (STUDENTS_DATA_LOADED) return Promise.resolve(STUDENT_GRADE_MAP);

        return fetch('/rest/V1/students/mine?searchCriteria[pageSize]=100', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Students error');
                return res.json();
            })
            .then(function (data) {
                if (data.items) {
                    data.items.forEach(function (student) {
                        var studentId = student.entity_id;
                        var adoptionLists = student.extension_attributes ? student.extension_attributes.adoption_lists : null;
                        if (adoptionLists && Array.isArray(adoptionLists)) {
                            var firstGrade = null;
                            adoptionLists.forEach(function (al, idx) {
                                var alId = al.entity_id;
                                // Lógica para pegar grade title
                                var schoolGrade = al.extension_attributes ? al.extension_attributes.school_grade : null;
                                if (!schoolGrade && al.extension_attributes && al.extension_attributes.contract) {
                                    schoolGrade = al.extension_attributes.contract.extension_attributes ? al.extension_attributes.contract.extension_attributes.school_grade : null;
                                }
                                var title = schoolGrade && schoolGrade.title ? schoolGrade.title :
                                    (al.extension_attributes && al.extension_attributes.contract_school_grade_title ? al.extension_attributes.contract_school_grade_title : null);

                                if (title) {
                                    ADOPTION_LIST_GRADE_MAP[alId] = title;
                                    if (idx === 0) firstGrade = title;
                                }
                            });
                            if (firstGrade) STUDENT_GRADE_MAP[studentId] = firstGrade;
                        }
                    });
                }
                STUDENTS_DATA_LOADED = true;
                return STUDENT_GRADE_MAP;
            })
            .catch(function () {
                return STUDENT_GRADE_MAP;
            });
    }

    function extractGradeLevel(productName) {
        if (!productName) return null;
        var lowerName = productName.toLowerCase();

        if (/educação\s+infantil|infantil|\bEI\b/i.test(lowerName)) {
            if (/\b1\s*anos?\b|level\s*1/i.test(lowerName)) return '1 ano - Educação Infantil';
            if (/\b2\s*anos?\b|level\s*2/i.test(lowerName)) return '2 anos - Educação Infantil';
            if (/\b3\s*anos?\b|level\s*3/i.test(lowerName)) return '3 anos - Educação Infantil';
            if (/\b4\s*anos?\b|level\s*4/i.test(lowerName) || /pré.*escola.*4/i.test(lowerName)) return '4 anos - Pré Escola';
            if (/\b5\s*anos?\b|level\s*5/i.test(lowerName) || /pré.*escola.*5/i.test(lowerName)) return '5 anos - Pré Escola';
        }

        if (/ensino\s+médio|colegial/i.test(lowerName)) {
            if (/1[º°]\s*(série|ano|colegial)/i.test(lowerName)) return '1º Colegial';
            if (/2[º°]\s*(série|ano|colegial)/i.test(lowerName)) return '2º Colegial';
            if (/3[º°]\s*(série|ano|colegial)/i.test(lowerName)) return '3º Colegial';
        }

        // Patterns
        var patterns = [
            { p: /(\d+)[º°]\s*ano\s*-\s*Aluno/i, fn: function (m) { var a = parseInt(m[1]); return (a >= 1 && a <= 5 ? a + 'º ano - Anos iniciais' : (a >= 6 && a <= 9 ? a + 'º ano - Anos finais' : null)); } },
            { p: /(\d+)[º°]\s*ano/i, fn: function (m) { var a = parseInt(m[1]); return (a >= 1 && a <= 5 ? a + 'º ano - Anos iniciais' : (a >= 6 && a <= 9 ? a + 'º ano - Anos finais' : null)); } },
            { p: /(\d+)[º°]\s*(série)/i, fn: function (m) { var s = parseInt(m[1]); return (s >= 1 && s <= 5 ? s + 'º ano - Anos iniciais' : (s >= 6 && s <= 9 ? s + 'º ano - Anos finais' : null)); } }
        ];

        for (var i = 0; i < patterns.length; i++) {
            var m = productName.match(patterns[i].p);
            if (m) {
                var g = patterns[i].fn(m);
                if (g) return g;
            }
        }
        return null;
    }

    function detectGradeFromCart(cartData) {
        if (!cartData || !cartData.items) return null;
        var grade = null;

        // 1. Adoption Lists
        if (cartData.ftd && cartData.ftd.data && cartData.ftd.data.miniCart && cartData.ftd.data.miniCart.miniCartAdoptionLists) {
            var lists = cartData.ftd.data.miniCart.miniCartAdoptionLists;
            var keys = Object.keys(lists);
            if (keys.length > 0) {
                var lid = keys[0];
                if (ADOPTION_LIST_GRADE_MAP[lid]) return ADOPTION_LIST_GRADE_MAP[lid];
                var sid = lists[lid].studentId;
                if (STUDENT_GRADE_MAP[sid]) return STUDENT_GRADE_MAP[sid];
            }
        }

        // 2. Items Regex
        for (var i = 0; i < cartData.items.length; i++) {
            var item = cartData.items[i];
            var g = extractGradeLevel(item.product_name);
            if (g) return g;
        }

        return null;
    }

    // --- Fim da Lógica de Detecção ---


    // Fetch Logic (Scraping PDP)
    function fetchPdpHtml(id) {
        return fetch('/catalog/product/view/id/' + id, { credentials: 'same-origin' })
            .then(function (res) {
                if (!res.ok) throw new Error('Erro ao carregar página do produto');
                return res.text();
            });
    }

    function parsePdp(html, id) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const data = { id: id, name: 'Produto', img: '', price: 0, url: '', description: '' };

        // JSON-LD
        const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (let i = 0; i < scripts.length; i++) {
            try {
                const json = JSON.parse(scripts[i].textContent);
                const items = Array.isArray(json) ? json : [json];
                for (let j = 0; j < items.length; j++) {
                    const item = items[j];
                    let product = null;
                    if (item['@type'] === 'Product') product = item;
                    else if (item['@graph']) product = item['@graph'].find(function (g) { return g['@type'] === 'Product'; });

                    if (product) {
                        if (product.name) data.name = product.name;
                        if (product.image) data.img = Array.isArray(product.image) ? product.image[0] : product.image;
                        if (product.offers) {
                            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                            if (offer && offer.price) data.price = parseFloat(offer.price);
                        }
                        if (product.url) data.url = product.url;
                        if (product.description) data.description = product.description;
                    }
                }
            } catch (e) { }
        }

        // Fallbacks
        if (!data.img) {
            const ogImg = doc.querySelector('meta[property="og:image"]');
            if (ogImg) data.img = ogImg.content;
        }
        if (!data.name || data.name === 'Produto') {
            const ogTitle = doc.querySelector('meta[property="og:title"]');
            if (ogTitle) data.name = ogTitle.content;
        }
        if (!data.description) {
            const descMeta = doc.querySelector('meta[name="description"]');
            if (descMeta) data.description = descMeta.content;
        }

        if (data.description) {
            const div = document.createElement('div');
            div.innerHTML = data.description;
            data.description = div.textContent || div.innerText || '';
            if (data.description.length > 80) {
                data.description = data.description.substring(0, 80) + '...';
            }
        } else {
            data.description = 'Confira este produto incrível.';
        }

        return data;
    }

    function fetchProductData(productId) {
        return fetchPdpHtml(productId).then(function (html) {
            return parsePdp(html, productId);
        });
    }

    // Sistema de controle de exibição do popup
    function getStorageKey(suffix) {
        return POPUP_RULES.STORAGE_KEY_PREFIX + suffix;
    }

    function getTodayKey() {
        return new Date().toDateString(); // Ex: "Mon Dec 16 2024"
    }

    function canShowPopup(productId, gradeLevel) {
        var now = Date.now();
        var today = getTodayKey();
        
        // Regra 1: Verificar se ainda não passou o delay inicial
        if (now - PAGE_LOAD_TIME < POPUP_RULES.INITIAL_DELAY_MS) {
            console.log('[Popup Rules] Aguardando delay inicial de 3s');
            return false;
        }

        // Regra 2: Verificar limite por sessão
        if (SESSION_POPUP_SHOWN) {
            console.log('[Popup Rules] Já exibido nesta sessão');
            return false;
        }

        try {
            // Regra 3: Verificar limite diário
            var dailyData = JSON.parse(localStorage.getItem(getStorageKey('daily_' + today)) || '{}');
            if (dailyData.count >= POPUP_RULES.MAX_DISPLAYS_PER_DAY) {
                console.log('[Popup Rules] Limite diário atingido (' + dailyData.count + '/' + POPUP_RULES.MAX_DISPLAYS_PER_DAY + ')');
                return false;
            }

            // Regra 4: Verificar cooldown
            var lastShown = localStorage.getItem(getStorageKey('last_shown'));
            if (lastShown) {
                var timeSinceLastShown = now - parseInt(lastShown);
                var cooldownMs = POPUP_RULES.COOLDOWN_MINUTES * 60 * 1000;
                if (timeSinceLastShown < cooldownMs) {
                    var remainingMinutes = Math.ceil((cooldownMs - timeSinceLastShown) / 60000);
                    console.log('[Popup Rules] Em cooldown. Restam ' + remainingMinutes + ' minutos');
                    return false;
                }
            }

            // Regra 5: Verificar se não foi fechado/rejeitado recentemente para este produto
            var rejectedData = JSON.parse(localStorage.getItem(getStorageKey('rejected_' + today)) || '{}');
            if (rejectedData[productId]) {
                console.log('[Popup Rules] Produto ' + productId + ' foi rejeitado hoje');
                return false;
            }

        } catch (e) {
            console.warn('[Popup Rules] Erro ao verificar localStorage:', e);
            // Em caso de erro, permite exibir (fallback seguro)
        }

        console.log('[Popup Rules] Popup pode ser exibido');
        return true;
    }

    function recordPopupShown(productId, gradeLevel) {
        var now = Date.now();
        var today = getTodayKey();
        
        // Marca como exibido na sessão
        SESSION_POPUP_SHOWN = true;
        // reset agendamento caso exista
        initialDelayScheduled = false;

        try {
            // Atualizar contador diário
            var dailyData = JSON.parse(localStorage.getItem(getStorageKey('daily_' + today)) || '{}');
            dailyData.count = (dailyData.count || 0) + 1;
            dailyData.lastProduct = productId;
            dailyData.lastGrade = gradeLevel;
            localStorage.setItem(getStorageKey('daily_' + today), JSON.stringify(dailyData));

            // Atualizar timestamp da última exibição
            localStorage.setItem(getStorageKey('last_shown'), now.toString());

            console.log('[Popup Rules] Popup registrado como exibido (' + dailyData.count + '/' + POPUP_RULES.MAX_DISPLAYS_PER_DAY + ')');

        } catch (e) {
            console.warn('[Popup Rules] Erro ao salvar no localStorage:', e);
        }
    }

    function recordPopupRejected(productId, action) {
        var today = getTodayKey();
        
        try {
            // Registrar rejeição específica do produto para hoje
            var rejectedData = JSON.parse(localStorage.getItem(getStorageKey('rejected_' + today)) || '{}');
            rejectedData[productId] = {
                action: action, // 'close_x_click' ou 'close_depois_click'
                timestamp: Date.now()
            };
            localStorage.setItem(getStorageKey('rejected_' + today), JSON.stringify(rejectedData));

            console.log('[Popup Rules] Produto ' + productId + ' marcado como rejeitado (' + action + ')');

        } catch (e) {
            console.warn('[Popup Rules] Erro ao registrar rejeição:', e);
        }
    }

    function recordPopupSuccess(productId) {
        try {
            // Limpar rejeições do produto quando ele é adicionado com sucesso
            var today = getTodayKey();
            var rejectedData = JSON.parse(localStorage.getItem(getStorageKey('rejected_' + today)) || '{}');
            if (rejectedData[productId]) {
                delete rejectedData[productId];
                localStorage.setItem(getStorageKey('rejected_' + today), JSON.stringify(rejectedData));
                console.log('[Popup Rules] Rejeição do produto ' + productId + ' removida após sucesso');
            }
        } catch (e) {
            console.warn('[Popup Rules] Erro ao limpar rejeições:', e);
        }
    }

    // Função para limpar dados antigos (executar na inicialização)
    function cleanupOldData() {
        try {
            var today = getTodayKey();
            var keysToRemove = [];
            
            // Percorrer todas as chaves do localStorage
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.startsWith(POPUP_RULES.STORAGE_KEY_PREFIX)) {
                    // Se é uma chave de daily ou rejected, verificar se é de hoje
                    if (key.includes('daily_') || key.includes('rejected_')) {
                        var dateInKey = key.split('_').slice(-3).join(' '); // "Mon Dec 16 2024"
                        if (dateInKey !== today) {
                            keysToRemove.push(key);
                        }
                    }
                }
            }
            
            // Remover chaves antigas
            keysToRemove.forEach(function(key) {
                localStorage.removeItem(key);
            });
            
            if (keysToRemove.length > 0) {
                console.log('[Popup Rules] Limpeza: ' + keysToRemove.length + ' entradas antigas removidas');
            }
            
        } catch (e) {
            console.warn('[Popup Rules] Erro na limpeza de dados antigos:', e);
        }
    }

    // Função para verificar se um produto está no carrinho
    function isProductInCart(cartData, productId) {
        if (!cartData || !cartData.items || !Array.isArray(cartData.items)) {
            return false;
        }

        var found = cartData.items.some(function (item) {
            var itemProductId = Number(item.product_id);
            var searchProductId = Number(productId);
            return itemProductId === searchProductId;
        });

        return found;
    }

    // Função para determinar qual produto recomendar baseado no nível escolar
    function getRecommendedProductId(gradeNumber, cartData) {
        if (!gradeNumber || !GRADE_RECOMMENDATIONS[gradeNumber]) {
            return null;
        }

        var recommendations = GRADE_RECOMMENDATIONS[gradeNumber];

        // Valida se é um array
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            return null;
        }

        // Percorre o array de recomendações em ordem de prioridade
        // Retorna o primeiro produto que NÃO está no carrinho
        for (var i = 0; i < recommendations.length; i++) {
            var productId = recommendations[i];

            // Pula produtos com ID null (ex: REFORCA_ANUAL)
            if (productId === null || productId === undefined) {
                continue;
            }

            var inCart = isProductInCart(cartData, productId);

            if (!inCart) {
                return productId;
            }
        }

        // Se todos os produtos recomendados já estão no carrinho
        return null;
    }

    // Construção do Popup
    function createSidePopup(product, gradeLevel) {
        const buttonText = 'ADICIONAR';
        const productName = product.name;
        const productImage = product.img;
        const productDescription = product.description;

        // Define título dinâmico
        let titleHTML = '';
        if (gradeLevel) {
            titleHTML = 'LIVRO ESSENCIAL PARA <span style="font-weight: 600;">' + gradeLevel.toUpperCase() + '</span>';
        } else {
            titleHTML = 'RECOMENDAÇÃO ESPECIAL PARA VOCÊ';
        }

        const popupCSS =
            '<style>' +
            '#recommendation-popup .AddToBagButtonSmall {' +
            'width: 100% !important;' +
            'border-radius: 8px !important;' +
            '}' +
            '#recommendation-popup .add-to-bag {' +
            'width: 100% !important;' +
            '}' +
            '#recommendation-popup #MiniBasketPushAddProductCTA {' +
            'width: 70% !important;' +
            'padding: 0 !important;' +
            '}' +
            '#recommendation-popup .AddToBagButton__button-Custom {' +
            'border-radius: 8px !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall__quantity {' +
            'position: unset !important;' +
            'width: unset !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall__icon-sign {' +
            'display: none !important;' +
            '}' +
            '#recommendation-popup .add-to-cart-text {' +
            'display: inline-block !important;' +
            'font-size: 14px;' +
            'font-weight: bold !important;' +
            'color: white !important;' +
            'visibility: visible !important;' +
            'opacity: 1 !important;' +
            'position: relative !important;' +
            'z-index: 10 !important;' +
            'background: transparent !important;' +
            'border: none !important;' +
            'padding: 0 !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall {' +
            'display: flex !important;' +
            'align-items: center !important;' +
            'justify-content: center !important;' +
            'gap: 3px !important;' +
            'flex-wrap: nowrap !important;' +
            'position: relative !important;' +
            'background-color: var(--color-brand-primary-500)!important;' +
            'transition: all .3s;' +
            'height: 40px !important;' +
            'cursor: pointer !important;' +
            'border: none !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall:hover {' +
            'background-color: var(--color-brand-primary-600); !important;' +
            '}' +
            '@keyframes slideInLeft {' +
            'from {' +
            'transform: translateX(-100%);' +
            'opacity: 0;' +
            '}' +
            'to {' +
            'transform: translateX(0);' +
            'opacity: 1;' +
            '}' +
            '}' +
            '@keyframes slideOutLeft {' +
            '0% {' +
            'transform: translateX(0);' +
            'opacity: 1;' +
            '}' +
            '100% {' +
            'transform: translateX(-100%);' +
            'opacity: 0;' +
            '}' +
            '}' +
            '#recommendation-popup {' +
            'transition: all 0.3s ease-out;' +
            'font-family: "Poppins", Helvetica, Arial, sans-serif !important;' +
            '}' +
            '#recommendation-popup * {' +
            'font-family: "Poppins", Helvetica, Arial, sans-serif !important;' +
            '}' +
            '#recommendation-popup.closing {' +
            'animation: slideOutLeft 0.3s ease-in forwards !important;' +
            'pointer-events: none;' +
            '}' +
            '#recommendation-popup button:hover {' +
            'opacity: 0.8;' +
            '}' +
            '@media (max-width: 768px) {' +
            '#recommendation-popup {' +
            'max-width: 90% !important;' +
            'left: 5% !important;' +
            'right: 5% !important;' +
            'bottom: 25px !important;' +
            '}' +
            '#recommendation-popup > div {' +
            'padding: 16px !important;' +
            'border-radius: 6px !important;' +
            '}' +
            '#recommendation-popup h3 {' +
            'font-size: 14px!important;' +
            'margin-bottom: 0px !important;' +
            'line-height: 1.3 !important;' +
            '}' +
            '#recommendation-popup h4 {' +
            'font-size: 14px;' +
            'margin-bottom: 4px !important;' +
            '}' +
            '#recommendation-popup p {' +
            'font-size: 14px;' +
            'margin-bottom: 8px !important;' +
            'line-height: 1.3 !important;' +
            '}' +
            '#recommendation-popup img {' +
            'width: 80px !important;' +
            'height: 80px !important;' +
            '}' +
            '#recommendation-popup div[style*="margin-bottom: 16px"] {' +
            'margin-bottom: 4px !important;' +
            '}' +
            '#recommendation-popup div[style*="margin-bottom: 20px"] {' +
            'margin-bottom: 10px !important;' +
            '}' +
            '#recommendation-popup .add-to-cart-text {' +
            'font-size: 12px !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall .add-to-cart-text {' +
            'font-size: 12px !important;' +
            '}' +
            '#recommendation-popup button .add-to-cart-text {' +
            'font-size: 12px !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall span.add-to-cart-text {' +
            'font-size: 12px !important;' +
            '}' +
            '#recommendation-popup span.add-to-cart-text {' +
            'font-size: 12px !important;' +
            '}' +
            '#recommendation-popup button:not([class*="AddToBagButton"]) {' +
            'font-size: 12px !important;' +
            'padding: 4px !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall__quantity {' +
            'font-size: 12px !important;' +
            '}' +
            '#recommendation-popup span[style*="font-size: 30px"] {' +
            'font-size: 20px !important;' +
            '}' +
            '}' +
            '</style>';

        const popupHTML =
            '<div id="recommendation-popup" style="position: fixed; bottom: 20px; left: 20px; z-index: 999; max-width: 450px; animation: slideInLeft 0.3s ease-out;">' +
            '<div style="background: white; border-radius: 8px; padding: 16px 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); ">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
            '<h3 style="margin: 0; color: #999; font-size: 16px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2 margin-bottom: 10px;">' +
            titleHTML +
            '</h3>' +
            '<button id="close-rec-popup" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; tranisition: all .3s;">&times;</button>' +
            '</div>' +
            '<div style="display: flex; gap: 16px; margin-bottom: 10px;">' +
            '<img src="' +
            productImage +
            '" alt="' +
            productName +
            '" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">' +
            '<div style="display: flex; flex-direction: column; justify-content: center;">' +
            '<h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 700; line-height: 1.1;">' +
            productName +
            '</h4>' +
            '<p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.4;">' +
            productDescription +
            '</p>' +
            '</div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<div id="MiniBasketPushAddProductCTA">' +
            '<div class="add-to-bag" data-product-id="' +
            product.id +
            '" data-button-size="small">' +
            '<div class="AddToBagButton__container">' +
            '<div id="AddToBagButton__button-Custom">' +
            '<button id="btn-add-rec-popup" class="AddToBagButton AddToBagButtonSmall" type="button" data-qa="' +
            productName +
            '">' +
            '<span class="add-to-cart-text">' +
            buttonText +
            '</span>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<button id="close-rec-popup-text" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #999; padding: 8px 0; padding-right: 10px; tranisition: all .3s;">Depois</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        const container = document.createElement('div');
        container.innerHTML = popupCSS + popupHTML;
        document.body.appendChild(container);

        // Event Listeners
        const closeBtn = document.getElementById('close-rec-popup');
        const closeText = document.getElementById('close-rec-popup-text');
        const addBtn = document.getElementById('btn-add-rec-popup');
        const popup = document.getElementById('recommendation-popup');

        // Registrar que o popup foi exibido
        recordPopupShown(product.id, gradeLevel);

        // Tracking: popup exibido
        analyticsPopupEvent('popup_view', product.id, productName, product.price, 1, product.category);

        function close() {
            if (popup) popup.classList.add('closing');
            setTimeout(function () {
                container.remove();
            }, 300);
        }

        if (closeBtn) {
            closeBtn.onclick = function() {
                // Registrar rejeição
                recordPopupRejected(product.id, 'close_x_click');
                
                // Tracking: clique no botão X
                analyticsSimpleEvent('close_x_click');
                close();
            };
        }

        if (closeText) {
            closeText.onclick = function() {
                // Registrar rejeição
                recordPopupRejected(product.id, 'close_depois_click');
                
                // Tracking: clique no botão "Depois"
                analyticsSimpleEvent('close_depois_click');
                close();
            };
        }

        if (addBtn) {
            addBtn.onclick = function () {
                // Tracking: clique no botão adicionar
                analyticsPopupEvent('add_to_cart_click', product.id, productName, product.price, 1, product.category);

                addBtn.querySelector('.add-to-cart-text').textContent = 'ADICIONANDO...';
                addBtn.disabled = true;

                const redirectUrl = window.location.origin + '/checkout/cart/';
                let uenc;
                try {
                    uenc = btoa(unescape(encodeURIComponent(redirectUrl)));
                } catch (e) {
                    uenc = btoa(redirectUrl);
                }

                addToCartViaAjax(product.id, 1, uenc, getFormKey())
                    .then(function (res) {
                        if (res.success) {
                            addBtn.querySelector('.add-to-cart-text').textContent = 'ADICIONADO!';
                            reloadCartSection();

                            // Registrar sucesso (remove rejeições)
                            recordPopupSuccess(product.id);

                            // Tracking: produto adicionado com sucesso
                            analyticsPopupEvent('add_to_cart_success', product.id, productName, product.price, 1, product.category);

                            setTimeout(close, 1500);
                        } else {
                            addBtn.querySelector('.add-to-cart-text').textContent = 'TENTE NOVAMENTE';
                            addBtn.disabled = false;

                            // Tracking: erro ao adicionar produto
                            analyticsPopupEvent('add_to_cart_error', product.id, productName, product.price, 1, product.category);
                        }
                    })
                    .catch(function () {
                        addBtn.querySelector('.add-to-cart-text').textContent = 'ERRO';
                        addBtn.disabled = false;

                        // Tracking: erro ao adicionar produto
                        analyticsPopupEvent('add_to_cart_error', product.id, productName, product.price, 1, product.category);
                    });
            };
        }
    }


    // Função para buscar dados do carrinho (Fix 400 Error)
    function fetchCartData() {
        var timestamp = Date.now();
        // Parâmetros essenciais para o Magento aceitar a requisição
        var url = '/customer/section/load/?sections=cart&force_new_section_timestamp=true&_=' + timestamp;

        return fetch(url, { credentials: 'same-origin' })
            .then(function (res) {
                if (!res.ok) throw new Error('Cart fetch ' + res.status);
                return res.json();
            })
            .then(function (data) {
                return data && data.cart ? data.cart : null;
            })
            .catch(function (err) {
                console.error('Erro ao buscar carrinho:', err);
                return null;
            });
    }

    function init() {
        // Limpar dados antigos primeiro
        cleanupOldData();

        // Prioridade 1: Tenta obter dados do Customer Data local (cache do Magento)
        magentoCustomerData(function (cd) {
            var cartData = cd && cd.get ? cd.get('cart')() : null;

            if (cartData && cartData.items && cartData.items.length > 0) {
                // Temos dados locais, não precisa de fetch
                fetchStudentsData().then(function () {
                    processCartAndShowPopup(cartData);
                });
                return;
            }

            // Se não tiver dados locais, tenta fetch
            fetchStudentsData()
                .then(function () {
                    return fetchCartData();
                })
                .then(function (fetchedData) {
                    // Se fetch falhar ou retornar null, fetchedData será null
                    // Mas se o usuário não tiver carrinho, está tudo bem.
                    processCartAndShowPopup(fetchedData);
                });
        });
    }

    // Função para converter nível escolar detectado para número do nível
    // Exemplo: "5º ano - Anos iniciais" -> 10 (5º Série)
    // Versão robusta: normaliza strings e usa regex flexíveis
    function convertGradeLevelToNumber(gradeLevel) {
        if (!gradeLevel) return null;

        // Normaliza a string: lowercase, remove espaços extras, remove hífens/traços, remove acentos
        var normalized = gradeLevel
            .toLowerCase()
            .replace(/\s+/g, ' ') // Múltiplos espaços -> 1 espaço
            .replace(/\s*-\s*/g, ' ') // Remove hífens e espaços ao redor
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .trim();

        // 1. EDUCAÇÃO INFANTIL (1-5 anos)
        // Padrões: "1 ano educacao infantil", "2 anos ensino infantil", "3 anos pre escola"
        if (
            /educacao\s*infantil|ensino\s*infantil|pre\s*escola/i.test(normalized) ||
            /\d+\s*anos?\s*(educacao|ensino|infantil|pre)/i.test(normalized)
        ) {
            // Extrai o número (1, 2, 3, 4, ou 5)
            var infantilMatch = normalized.match(/(\d+)\s*anos?/);
            if (infantilMatch) {
                var anos = parseInt(infantilMatch[1]);
                if (anos >= 1 && anos <= 5) {
                    return anos; // 1 ano -> 1, 2 anos -> 2, ..., 5 anos -> 5
                }
            }
        }

        // 2. ENSINO MÉDIO / COLEGIAL (15, 16, 17)
        // Padrões: "1º ano ensino medio", "2ª serie ensino medio", "3º colegial"
        if (/ensino\s*medio|colegial/i.test(normalized)) {
            // Extrai o número (1, 2, ou 3)
            var medioMatch = normalized.match(/(\d+)[º°ª]?\s*(ano|serie|colegial)/);
            if (medioMatch) {
                var serie = parseInt(medioMatch[1]);
                if (serie >= 1 && serie <= 3) {
                    var nivel = 14 + serie; // 1 -> 15, 2 -> 16, 3 -> 17
                    return nivel;
                }
            }
        }

        // 3. ENSINO FUNDAMENTAL - ANOS INICIAIS (1º ao 5º ano -> 6 a 10)
        if (/anos?\s*iniciais|ef\s*1|efai/i.test(normalized)) {
            var iniciaisMatch = normalized.match(/(\d+)[º°ª]?\s*ano/);
            if (iniciaisMatch) {
                var ano = parseInt(iniciaisMatch[1]);
                if (ano >= 1 && ano <= 5) {
                    var nivel = ano + 5; // 1º -> 6, 2º -> 7, ..., 5º -> 10
                    return nivel;
                }
            }
        }

        // 4. ENSINO FUNDAMENTAL - ANOS FINAIS (6º ao 9º ano -> 11 a 14)
        if (/anos?\s*finais|ef\s*2/i.test(normalized)) {
            var finaisMatch = normalized.match(/(\d+)[º°ª]?\s*ano/);
            if (finaisMatch) {
                var ano = parseInt(finaisMatch[1]);
                if (ano >= 6 && ano <= 9) {
                    var nivel = ano + 5; // 6º -> 11, 7º -> 12, 8º -> 13, 9º -> 14
                    return nivel;
                }
            }
        }

        // 5. FALLBACK: Tenta extrair apenas o número e adivinhar pelo contexto
        // Se tem "ano" ou "série" e um número de 1-9, assume ensino fundamental
        var fallbackMatch = normalized.match(/(\d+)[º°ª]?\s*(ano|serie)/);
        if (fallbackMatch) {
            var num = parseInt(fallbackMatch[1]);
            // Anos 1-5: provavelmente anos iniciais
            if (num >= 1 && num <= 5) {
                return num + 5;
            }
            // Anos 6-9: provavelmente anos finais
            if (num >= 6 && num <= 9) {
                return num + 5;
            }
        }

        return null;
    }

    function processCartAndShowPopup(cartData) {
        // 1. Detecta Grade
        let gradeLevel = null;
        let recommendedProductId = null;
        let hasAdoptionList = false;

        // Se ainda estamos no delay inicial, agendamos uma nova tentativa (uma vez)
        var remainingMs = msUntilInitialReady();
        if (remainingMs > 0) {
            console.log('[Popup Rules] Aguardando delay inicial de 3s (restam ' + remainingMs + 'ms)');
            if (!initialDelayScheduled) {
                initialDelayScheduled = true;
                setTimeout(function () {
                    // limpar flag caso a tentativa ocorra
                    initialDelayScheduled = false;
                    try {
                        processCartAndShowPopup(cartData);
                    } catch (e) {
                        console.warn('[Popup Rules] Erro ao re-tentar exibir popup:', e);
                    }
                }, remainingMs + 50); // pequeno buffer
            }
            return;
        }

        if (cartData) {
            // Normaliza formato se necessário
            if (cartData.cart && cartData.cart.items) cartData = cartData.cart;

            // REGRA OBRIGATÓRIA: Verificar se há lista de adoção no carrinho
            if (cartData.ftd && cartData.ftd.data && cartData.ftd.data.miniCart && cartData.ftd.data.miniCart.miniCartAdoptionLists) {
                var adoptionLists = cartData.ftd.data.miniCart.miniCartAdoptionLists;
                var adoptionListKeys = Object.keys(adoptionLists);
                hasAdoptionList = adoptionListKeys.length > 0;
            }

            // Se não há lista de adoção, não exibir popup
            if (!hasAdoptionList) {
                console.log('[Popup Rules] Não há lista escolar no carrinho - popup não será exibido');
                return;
            }

            gradeLevel = detectGradeFromCart(cartData);

            // 2. Se detectou grade, usa as regras inteligentes do GRADE_RECOMMENDATIONS
            if (gradeLevel) {
                const gradeNumber = convertGradeLevelToNumber(gradeLevel);
                if (gradeNumber) {
                    recommendedProductId = getRecommendedProductId(gradeNumber, cartData);
                }
            }
        }

        // Se não há lista escolar, não continuar
        if (!hasAdoptionList) {
            return;
        }

        // 3. Se não encontrou produto recomendado via regras, usa o padrão
        if (!recommendedProductId) {
            recommendedProductId = PRODUCT_IDS.DICIONARIO_INGLES; // Produto padrão (ID 53959)
        }

        // REGRA IMPORTANTE: Verificar se o produto recomendado já está no carrinho
        if (cartData && isProductInCart(cartData, recommendedProductId)) {
            console.log('[Popup Rules] Produto recomendado (' + recommendedProductId + ') já está no carrinho');
            return;
        }

        // 4. Verificar se pode exibir o popup (todas as regras)
        if (!canShowPopup(recommendedProductId, gradeLevel)) {
            return;
        }

        // 5. Busca dados do produto recomendado
        fetchProductData(recommendedProductId).then(function (product) {
            if (product) {
                console.log('[Popup Rules] Exibindo popup para produto:', product.name, 'série:', gradeLevel);
                setTimeout(function () {
                    createSidePopup(product, gradeLevel);
                }, 100); // Pequeno delay para garantir que a página está estável
            }
        }).catch(function (e) { 
            console.error('Erro ao buscar produto:', e); 
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
