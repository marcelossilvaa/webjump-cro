//Pop UP lateral - FTD

(function () {
    'use strict';

    // Configurações
    const RECOMMENDED_PRODUCT_ID = 53959;

    const POPUP_ID = 'recommendation-popup';
    const STYLE_ID = 'recommendation-popup-style';

    // Mapeamento de estudante/adoption (Portado do miniCart.js)
    let STUDENT_GRADE_MAP = {};
    let ADOPTION_LIST_GRADE_MAP = {};
    let STUDENTS_DATA_LOADED = false;

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

    // Construção do Popup
    function createSidePopup(product, gradeLevel) {
        const buttonText = 'ADICIONAR';
        const productName = product.name;
        const productImage = product.img;
        const productDescription = product.description;
        const productIntensity = 0;

        // Define título dinâmico
        let titleHTML = '';
        if (gradeLevel) {
            titleHTML = 'ESSENCIAIS PARA O <span style="font-weight: 600;">' + gradeLevel.toUpperCase() + '</span>';
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
            'margin-right: 8px !important;' +
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
            'height: 40px !important;' +
            'cursor: pointer !important;' +
            'transition: background-color 0.2s !important;' +
            'border: none !important;' +
            '}' +
            '#recommendation-popup .AddToBagButtonSmall:hover {' +
            'background-color: var(--color-brand-primary-500); !important;' +
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
            '<h3 style="margin: 0; color: #999; font-size: 16px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px;">' +
            titleHTML +
            '</h3>' +
            '<button id="close-rec-popup" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</button>' +
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
            '<button id="close-rec-popup-text" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #999; padding: 8px 0; padding-right: 10px;">Depois</button>' +
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

        function close() {
            if (popup) popup.classList.add('closing');
            setTimeout(function () {
                container.remove();
            }, 300);
        }

        if (closeBtn) closeBtn.onclick = close;
        if (closeText) closeText.onclick = close;

        if (addBtn) {
            addBtn.onclick = function () {
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
                            setTimeout(close, 1500);
                        } else {
                            addBtn.querySelector('.add-to-cart-text').textContent = 'TENTE NOVAMENTE';
                            addBtn.disabled = false;
                        }
                    })
                    .catch(function () {
                        addBtn.querySelector('.add-to-cart-text').textContent = 'ERRO';
                        addBtn.disabled = false;
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

    function processCartAndShowPopup(cartData) {
        // 3. Detecta Grade
        let gradeLevel = null;
        if (cartData) {
            // Normaliza formato se necessário
            if (cartData.cart && cartData.cart.items) cartData = cartData.cart;

            gradeLevel = detectGradeFromCart(cartData);
        }

        // 4. Busca Produto Recomendado
        fetchProductData(RECOMMENDED_PRODUCT_ID).then(function (product) {
            if (product) {
                setTimeout(function () {
                    createSidePopup(product, gradeLevel);
                }, 1000);
            }
        }).catch(function (e) { console.error(e); });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
