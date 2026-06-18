(function () {
    'use strict';

    // Identificadores e seletores
    const STYLE_ID = 'ctam-restruct-style';
    const SUMMARY_SELECTOR = '.cart__summary.fixed-bottom.d-xl-none.mobile';
    const TOTALS_SELECTOR = '.cart__totals';
    const ROOT_FLAG = 'data-ctam-restruct';
    const CHECKOUT_HREF = '/checkout';
    const VALOR_MINIMO_2X = 120;
    const VALOR_MINIMO_3X = 180;
    const MAX_TENTATIVAS = 30;
    const INTERVALO_RETRY = 500;
    const DEBOUNCE_MS = 150;

    let tentativas = 0;
    let debounceTimer = null;
    let isProcessing = false;

    // Injeta o CSS uma unica vez
    function injetarEstilos() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"]{',
            '  box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;',
            '  padding:17px 24px;gap:12px;width:100%;min-height:123px;left:0;bottom:0;',
            '  background:#FFFFFF;border:1px solid #D6DADA;z-index:3;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-info{',
            '  display:flex;flex-direction:column;align-items:flex-start;padding:0;gap:4px;',
            '  width:100%;align-self:stretch;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-row{',
            '  display:flex;flex-direction:row;justify-content:space-between;align-items:center;',
            '  padding:0;gap:4px;width:100%;align-self:stretch;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-label,',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-value{',
            '  font-family:"Inter",Arial,sans-serif;font-style:normal;font-weight:400;',
            '  font-size:12px;line-height:15px;color:#757575;margin:0;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-discount-group{',
            '  display:flex;flex-direction:row;justify-content:flex-end;align-items:center;',
            '  padding:0;gap:8px;height:20px;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-discount-pill{',
            '  display:flex;flex-direction:column;align-items:flex-start;padding:0 5px;',
            '  height:20px;background:#3A8600;border-radius:4px;',
            '  font-family:"Inter",Arial,sans-serif;font-weight:400;font-size:8px;line-height:20px;',
            '  color:#FFFFFF;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-discount-value{',
            '  font-family:"Inter",Arial,sans-serif;font-weight:400;font-size:12px;line-height:15px;',
            '  color:#3A8600;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-checkout{',
            '  display:flex;flex-direction:row;justify-content:space-between;align-items:center;',
            '  padding:0;width:100%;align-self:stretch;min-height:38px;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-total{',
            '  display:flex;flex-direction:column;justify-content:center;align-items:flex-start;',
            '  padding:0;gap:4px;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-total-value{',
            '  font-family:"Inter",Arial,sans-serif;font-weight:700;font-size:16px;line-height:19px;',
            '  color:#424242;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-installments{',
            '  font-family:"Inter",Arial,sans-serif;font-weight:300;font-size:12px;line-height:15px;',
            '  color:#424242;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-button{',
            '  display:flex;flex-direction:row;align-items:center;justify-content:center;',
            '  padding:8px 16px;min-width:152px;max-width:356px;height:38px;',
            '  background:#008A00;border-radius:8px;text-decoration:none;',
            '  font-family:"Inter",Arial,sans-serif;font-weight:600;font-size:18px;line-height:22px;',
            '  color:#FFFFFF;',
            '}',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-button:hover,',
            '.cart__summary.fixed-bottom.d-xl-none.mobile[' + ROOT_FLAG + '="true"] .ctam-button:focus{',
            '  color:#FFFFFF;text-decoration:none;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // Converte "R$ 189,39" / "R$184,95" / "- R$ 4,44" em numero (189.39, 184.95, 4.44)
    function parseValor(texto) {
        if (!texto) return 0;
        const limpo = String(texto)
            .replace(/[^0-9,.-]/g, '')
            .replace(/\.(?=\d{3}(\D|$))/g, '')
            .replace(',', '.');
        const num = parseFloat(limpo);
        if (isNaN(num)) return 0;
        return Math.abs(num);
    }

    // Formata numero para "R$ 180,00"
    function formatarReal(valor) {
        const fixo = (Math.round(valor * 100) / 100).toFixed(2);
        const partes = fixo.split('.');
        const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return 'R$ ' + inteiro + ',' + partes[1];
    }

    // Coleta valores do bloco .cart__totals
    function coletarTotais() {
        const totals = document.querySelector(TOTALS_SELECTOR);
        if (!totals) return null;
        const subtotalEl = totals.querySelector('.js-subtotal');
        const totalEl = totals.querySelector('.js-cart-totals');
        const percentualEl = totals.querySelector('.js-porcentagem');
        const discountEl = totals.querySelector('.js-discount');
        if (!totalEl) return null;
        return {
            subtotalTexto: subtotalEl ? subtotalEl.textContent.trim() : '',
            subtotalValor: subtotalEl ? parseValor(subtotalEl.textContent) : 0,
            totalTexto: totalEl.textContent.trim(),
            totalValor: parseValor(totalEl.textContent),
            percentualTexto: percentualEl ? percentualEl.textContent.trim() : '',
            descontoTexto: discountEl ? discountEl.textContent.trim() : '',
            temDesconto: !!(percentualEl || discountEl)
        };
    }

    // Cria a nova estrutura interna do summary
    function montarConteudo(dados) {
        const frag = document.createDocumentFragment();

        const info = document.createElement('div');
        info.className = 'ctam-info';

        // Linha "Valor inicial"
        if (dados.subtotalTexto) {
            const rowSub = document.createElement('div');
            rowSub.className = 'ctam-row ctam-row--subtotal';
            const subLabel = document.createElement('span');
            subLabel.className = 'ctam-label';
            subLabel.textContent = 'Valor inicial';
            const subValue = document.createElement('span');
            subValue.className = 'ctam-value';
            subValue.textContent = dados.subtotalTexto;
            rowSub.appendChild(subLabel);
            rowSub.appendChild(subValue);
            info.appendChild(rowSub);
        }

        // Linha "Desconto"
        if (dados.temDesconto) {
            const rowDesc = document.createElement('div');
            rowDesc.className = 'ctam-row ctam-row--discount';
            const descLabel = document.createElement('span');
            descLabel.className = 'ctam-label';
            descLabel.textContent = 'Desconto';
            const descGroup = document.createElement('div');
            descGroup.className = 'ctam-discount-group';
            if (dados.percentualTexto) {
                const pill = document.createElement('span');
                pill.className = 'ctam-discount-pill';
                pill.textContent = dados.percentualTexto;
                descGroup.appendChild(pill);
            }
            if (dados.descontoTexto) {
                const descVal = document.createElement('span');
                descVal.className = 'ctam-discount-value';
                descVal.textContent = dados.descontoTexto;
                descGroup.appendChild(descVal);
            }
            rowDesc.appendChild(descLabel);
            rowDesc.appendChild(descGroup);
            info.appendChild(rowDesc);
        }

        frag.appendChild(info);

        // Bloco de checkout (total + parcelamento + botao)
        const checkout = document.createElement('div');
        checkout.className = 'ctam-checkout';

        const totalWrap = document.createElement('div');
        totalWrap.className = 'ctam-total';

        const totalValue = document.createElement('span');
        totalValue.className = 'ctam-total-value';
        totalValue.textContent = dados.totalTexto;
        totalWrap.appendChild(totalValue);

        // Parcelamento: 3x a partir de R$ 180,00; 2x a partir de R$ 120,00
        let numeroParcelas = 0;
        if (dados.totalValor >= VALOR_MINIMO_3X) {
            numeroParcelas = 3;
        } else if (dados.totalValor >= VALOR_MINIMO_2X) {
            numeroParcelas = 2;
        }
        if (numeroParcelas > 0) {
            const parcela = dados.totalValor / numeroParcelas;
            const installments = document.createElement('span');
            installments.className = 'ctam-installments';
            installments.textContent = numeroParcelas + 'x s/ juros de ' + formatarReal(parcela);
            totalWrap.appendChild(installments);
        }

        checkout.appendChild(totalWrap);

        const button = document.createElement('a');
        button.className = 'ctam-button';
        button.setAttribute('role', 'button');
        button.href = CHECKOUT_HREF;
        const buttonLabel = document.createElement('span');
        buttonLabel.textContent = 'Ir para entrega';
        button.appendChild(buttonLabel);
        checkout.appendChild(button);

        frag.appendChild(checkout);
        return frag;
    }

    // Aplica/atualiza a nova estrutura
    function aplicar() {
        if (isProcessing) return;
        const summary = document.querySelector(SUMMARY_SELECTOR);
        if (!summary) return false;
        const dados = coletarTotais();
        if (!dados) return false;

        isProcessing = true;
        try {
            injetarEstilos();
            // Limpa conteudo anterior (CTA original ou versao previa)
            while (summary.firstChild) {
                summary.removeChild(summary.firstChild);
            }
            summary.appendChild(montarConteudo(dados));
            summary.setAttribute(ROOT_FLAG, 'true');
        } finally {
            // Libera no proximo tick para o observer ignorar a mutation propria
            setTimeout(function () {
                isProcessing = false;
            }, 0);
        }
        return true;
    }

    // Debounce para o observer
    function agendarAplicar() {
        if (isProcessing) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            debounceTimer = null;
            aplicar();
        }, DEBOUNCE_MS);
    }

    // Polling com teto ate o summary aparecer
    function aguardarSummary() {
        if (aplicar()) {
            iniciarObserver();
            return;
        }
        tentativas++;
        if (tentativas >= MAX_TENTATIVAS) {
            iniciarObserver();
            return;
        }
        setTimeout(aguardarSummary, INTERVALO_RETRY);
    }

    // Observer global unico
    function iniciarObserver() {
        if (window._ctamObserver) return;
        const observer = new MutationObserver(function () {
            if (isProcessing) return;
            agendarAplicar();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        window._ctamObserver = observer;
    }

    function init() {
        aguardarSummary();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
