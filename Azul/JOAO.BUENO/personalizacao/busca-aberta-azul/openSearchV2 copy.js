(() => {
      // ──────────── UTILITÁRIOS GLOBAIS ────────────

  // 1) Smooth scroll até o botão de buscar
  function scrollToSearchButton() {
    const btn = document.getElementById('injectedSearchButton');
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 2) Monkey-patch do history para zerar scroll ao voltar para a home
  ;(() => {
    const shouldScrollTop = url =>
      typeof url === 'string' && (url === '/' || url.startsWith('/home'));
    const origPush = history.pushState;
    history.pushState = function (s, t, url) {
      const ret = origPush.apply(this, arguments);
      if (shouldScrollTop(url)) window.scrollTo({ top: 0, behavior: 'instant' });
      return ret;
    };
    const origReplace = history.replaceState;
    history.replaceState = function (s, t, url) {
      const ret = origReplace.apply(this, arguments);
      if (shouldScrollTop(url)) window.scrollTo({ top: 0, behavior: 'instant' });
      return ret;
    };
    window.addEventListener('popstate', () => {
      if (location.pathname === '/' || location.pathname.startsWith('/home')) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  })();

    // —————————————
    // FUNÇÕES AUXILIARES QUE SERÃO UTILIZADAS PARA O FUNCIONAMENTO DA BUSCA ABERTA PARA CADA ABA
    // —————————————
    const getCurrentOuterWrapper = () => {
        const outerWrapper = document.querySelector(".injected-search-outer");
        return outerWrapper;
    };

    const validateFieldsOnLastSearchClick = (callbackFunction) => {
        const lastSearchs = document.querySelectorAll("[data-cy-id='last-search-item']");

        lastSearchs.forEach(button => {
            button.addEventListener("click", () => {
                requestAnimationFrame(callbackFunction);
            });
        });
    }

    const validateField = (field, errorMessage = "Campo obrigatório", insertAfter = "button") => {
        if(!field || field.tagName !== "INPUT") {
            return;
        }

        if(insertAfter === "label") {
            validateDateField(field, errorMessage);
            return;
        }

        validateDefaultField(field, errorMessage);
    }

    const validateDateField = (field, errorMessage) => {
        const label = field.closest("label");
        const parent = label.parentNode;

        if(!label || !parent) {
            return;
        }

        if(field.value === "") {
            const parentElementForCheckError = label.parentNode;
            const alreadyHasError = parentElementForCheckError.classList.contains("injected-error-validate");

            const defaultValidation = parentElementForCheckError.querySelector("span.dNPcQR");
            if(defaultValidation) defaultValidation.style.display = "none";

            if(alreadyHasError) {
                return;
            }

            const span = createErroSpanElement(errorMessage);
            label.insertAdjacentElement("afterend", span);

            parent.classList.add("injected-error-validate");
        } else {
            parent.classList.remove("injected-error-validate");
            const span = label.nextElementSibling;

            if(span && span.tagName === "SPAN" && span.classList.contains("injected-error-message")) {
                span.remove();
            }  
        }
    }

    const validateDefaultField = (field, errorMessage) => {
        const parentElement = field.parentNode;
        const button = parentElement.querySelector("button");
        const parentButton = button?.parentElement;

        if(!parentElement || !button) {
            return;
        }

        if(field.value === "") {
            const parentElementForCheckError = parentElement;
            const alreadyHasError = parentElementForCheckError?.querySelector(".injected-error-validate");

            if(alreadyHasError) {
                return;
            }

            const span = createErroSpanElement(errorMessage);
            button.insertAdjacentElement("afterend", span);

            if(parentButton) {
                parentButton.classList.add("injected-error-validate");
            }
        } else {
            if(parentButton) {
                parentButton.classList.remove("injected-error-validate");
            }

            const span = parentElement.querySelector("span.injected-error-message");
            span?.remove();
        }
    }

    const createErroSpanElement = (errorMessage) => {
        const span = document.createElement("span");
        span.classList.add("injected-error-message");
        span.textContent = errorMessage;
        return span;
    }

    // —————————————
    // FIM FUNÇÕES AUXILIARES
    // —————————————

    // —————————————
    // SCRIPT INICIAL DA BUSCA V1, É RESPONSÁVEL POR ENCONTRAR O NÓ DE BUSCA E CRIAR O WRAPPER
    // —————————————
    const onReady = (fn) => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(fn, 0);
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };
  
    onReady(() => {
        // —————————————
        // (a) Esconde o botão original "Para onde vamos viajar?"
        // —————————————
        const triggerInput = document.querySelector('input[aria-label="Para onde vamos viajar?"]');
        if (triggerInput) {
            const label = triggerInput.closest('label');
            if (label) label.style.display = 'none';
        }
    
        // —————————————
        // (b) Localiza o nó de busca do modal e seu container para esconder depois
        // —————————————
        const searchNode = document.querySelector('.sc-45c99f99-0.kOAKak');
        if (!searchNode) {
            console.warn('[AT] nó de busca não encontrado: .sc-45c99f99-0.kOAKak');
            return;
        }
        // Encontra o wrapper completo do modal (aquele que contém <header> para o "X")
        const findModalContainer = (el) => {
            let cur = el.parentElement;
            while (cur) {
            if (cur.querySelector('header')) return cur;
            cur = cur.parentElement;
            }
            return null;
        };
        const fullModalContainer = findModalContainer(searchNode);
        if (fullModalContainer) {
            fullModalContainer.style.display = 'none';
        }
    
        // Remove atributos que reabririam o modal original
        if (triggerInput) {
            triggerInput.removeAttribute('onclick');
            triggerInput.removeAttribute('data-toggle');
            triggerInput.removeAttribute('data-target');
        }
    
        // —————————————
        // (c) Cria wrappers para mover searchNode sem perder event listeners
        // —————————————
        const outerWrapper = document.createElement('div');
        outerWrapper.className = 'injected-search-outer';
        Object.assign(outerWrapper.style, {
            width: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            position: 'relative',
            marginTop: '1rem',
            paddingLeft: '0',
            paddingRight: '0',
        });
    
        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'injected-search-inner';
        Object.assign(innerWrapper.style, {
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'visible',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
        });
    
        innerWrapper.appendChild(searchNode);
        outerWrapper.appendChild(innerWrapper);
    
        // —————————————
        // (d) LOCALIZAR O "homeWrapper" USANDO XPATH NO TEXTO FIXO
        // —————————————
        // Em vez de document.querySelector('.sc-kpDqfm.qehAq.sc-13e37337-2.kQkHjY'),
        // vamos achar o <p> pelo texto "Reserve suas passagens aéreas…" e subir para o pai.
        const xpath = "//p[contains(., 'Reserve suas passagens aéreas')]";
        const titlePara = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
    
        const homeWrapper = titlePara ? titlePara.parentElement : null;
        if (!homeWrapper) {
            console.warn('[AT] não encontrou o container da home via XPath');
            return;
        }
        
        homeWrapper.insertAdjacentElement('afterend', outerWrapper);
        initOnServiceButtons();
  
      // —————————————
      // (e) Injeta o CSS para corrigir o overflow e comportamento das abas
      // —————————————
      const css = `
            .injected-search-outer { overflow-x: hidden !important; }
    
            /* garante full-width e layout flex na coluna */
            .injected-search-inner {
            width: 100% !important;
            overflow-x: visible !important;
            display: flex !important;
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            }
    
            .injected-search-inner .sc-b46dc710-5.gycHfo,
            .injected-search-inner .sc-13e37337-5.jWLomW {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            white-space: nowrap !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 0 1rem !important;
            margin-bottom: 0.5rem !important;
            gap: 0px;
            }
            .injected-search-inner .sc-b46dc710-5.gycHfo > *,
            .injected-search-inner .sc-13e37337-5.jWLomW > * {
            flex: 0 0 auto !important;
            margin-right: 0.5rem !important;
            }
    
            /* Inputs Origem/Destino/ Datas full width */
            .injected-search-inner .sc-b46dc710-6.jtdBYG {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            }
            .injected-search-inner .sc-b46dc710-6.jtdBYG .sc-b46dc710-8.cMlFVy {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            }
            .injected-search-inner input.sc-WbMKh {
            width: 100% !important;
            box-sizing: border-box !important;
            }
    
            /* Ajustes adicionais */
            .injected-search-inner .sc-hBeSQo.koiaoR {
            width: 100% !important;
            overflow-x: hidden !important;
            }
            .injected-search-inner .sc-hBeSQo.koiaoR .sc-dKaeOA.kqKWim {
            display: flex !important;
            flex-wrap: wrap !important;
            overflow-x: visible !important;
            }
            .injected-search-inner * {
            overflow: visible !important;
            max-width: none !important;
            max-height: none !important;
            box-sizing: border-box !important;
            }
            .injected-search-inner .sc-cQXCZA.dTbBzN {
            overflow: visible !important;
            }
            .eBjMoV { display: none !important; }

            /* AJUSTES PARA O SELETOR DE ADULTOS E PONTOS AZUL */

            .injected-search-inner #injectedMoreOptions {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 24px;
                opacity: .5;
                pointer-events: none;
            }

            #injectedMoreOptions.injectedMoreOptions--hoteis {
                gap: 16px;
            }

            .injected-search-inner #injectedMoreOptions [data-cy-id="travelers-button"] {
                display: flex;
                height: 40px;
                border: none;
                background: rgb(255, 255, 255);
                border-radius: 48px;
                min-width: 32px;
                padding: 8px 8px 8px 16px;
                -webkit-box-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                align-items: center;
                gap: 8px;
                color: rgb(4, 30, 66);
                font-size: 14px;
                font-style: normal;
                font-weight: 700;
                line-height: 16px;
                max-width: max-content !important;
            }

            .injected-search-inner .fRwcjV {
                max-width: max-content !important;
            }

            .injected-search-inner #injectedMoreOptions svg {
                display: flex;
                cursor: pointer;
                min-width: 24px;
            }

            .injected-search-inner #injectedTravelers {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                flex: 1 1 0%;
            }

            .injected-search-inner #injectedPoints {
                display: flex;
                flex-direction: column;
                -webkit-box-pack: center;
                justify-content: center;
                align-items: flex-start;
                gap: 16px;
            }

            .injected-search-inner #injectedPoints .YaLSh {
                background-color: rgb(255, 255, 255);
                color: rgb(2, 108, 182);
                display: inline-flex;
                -webkit-box-align: center;
                align-items: center;
                -webkit-box-pack: center;
                justify-content: center;
                cursor: default;
                vertical-align: middle;
                box-sizing: border-box;
                height: 26px;
                white-space: nowrap;
                transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
                outline: 0px;
                text-decoration: none;
                border-radius: 26px;
                padding: 0px 8px;
            }

            .injected-search-inner #injectedPoints .cQNsqM {
                display: flex;
                min-width: 32px;
                height: 40px;
                padding: 8px 16px;
                -webkit-box-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                align-items: center;
                gap: 8px;
            }

            .injected-search-inner #injectedPoints .cQNsqM > div:not(:has(input)) {
                display: none;
            }

            .injected-search-inner #injectedPoints .HCGfe {
                color: rgb(4, 30, 66);
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 16px;
            }

            .injected-search-inner #injectedSearchButtonContainer {
                width: 100%;
                margin-top: 16px;
            }

            .injected-search-inner #injectedSearchButtonContainer .evAVmJ {
                display: flex;
                height: 1px;
                width: 100%;
                margin-bottom: 24px;
                background: rgb(255, 255, 255);
                opacity: 0.1;
                -webkit-box-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                align-items: center;
                align-self: stretch;
            }

            .injected-search-inner #injectedSearchButton {
                display: inline-block;
                position: relative;
                cursor: pointer;
                color: #FFFFFF;
                font-family: "Helvetica Neue", Arial, Sans-Serif;
                font-style: normal;
                font-size: 14px;
                font-weight: 400;
                line-height: 19px;
                box-sizing: border-box;
                background: rgb(0, 128, 88);
                outline: none;
                border-radius: 4px;
                padding: 12px 16px;
                border-width: initial;
                border-style: none;
                border-color: initial;
                border-image: initial;
            }

            .injected-search-inner #injectedSearchButton:hover {
                background:rgb(0, 100, 80)
            }

            .injected-search-inner #injectedSearchButton {
                min-width: 197px;
                min-height: 56px;
                border-radius: 8px;
                font-size: 16px;
                padding: 16px 32px;
            }

            @media (max-width: 1023px) {
                .injected-search-inner #injectedSearchButton {
                    min-height: 48px;
                    padding: 8px 32px;
                    width: 100%;
                }
            }

            .injected-error-message {
                display: block;
                text-align: left;
                color: rgb(236, 162, 158);
                font-size: 12px;
                margin-top: 8px;
                padding-left: 16px;
            }

            .injected-error-validate > button,
            .injected-error-validate > label {    
                all: unset;
                line-height: 24px;
                color: rgb(4, 30, 66);
                font-size: 16px;
                position: relative;
                box-sizing: border-box;
                height: 56px;
                font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
                font-style: normal;
                width: 100%;
                display: flex;
                -webkit-box-align: center;
                align-items: center;
                cursor: pointer;
                padding: 16px;
                border-radius: 8px;
                border-width: 1px;
                border-style: solid;
                border-color: rgb(184, 44, 37);
                border-image: initial;
                background: rgb(255, 255, 255);
                transition: 0.3s ease-in;
                gap: 8px;
            }

            .injected-error-validate > button.sc-jDyTkK.jgGbOn {
                padding: 0px;
            }

            .injected-error-validate label span,
            .injected-error-validate button span {
                transition: 0.3s ease-out;
                color: rgb(184, 44, 37);
                user-select: none;
                display: flex;
                -webkit-box-align: center;
                align-items: center;
                -webkit-box-pack: justify;
                justify-content: space-between;
            }

            .injected-error-validate svg path {
                fill: rgb(184, 44, 37);
            }

            .injected-error-validate > label::after,
            .injected-error-validate > button::after {
                content: "";
                position: absolute;
                inset: 0px;
                border: 1px solid rgb(184, 44, 37);
                z-index: 1;
                border-radius: 7px;
            }

            .injected-search-inner .grouped-divisor {
                width: 100%;
                height: 1px;
                background: rgb(255, 255, 255);
                opacity: 0.1;
            }

            .injected-search-inner .lgMroG {
                min-width: 197px;
                min-height: 56px;
                border-radius: 8px;
                font-size: 16px;
                padding: 16px 32px;
            }
                
            .injected-search-inner .grouped-search-container {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .injected-search-inner .driver-age-container {
                font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
                font-style: normal;
                width: 100%;
                position: relative;
            }

            .injected-search-inner .driver-age-container .ilANvg {
                position: absolute;
                inset: 0px;
                opacity: 0;
                z-index: -1;
            }

            .injected-search-inner .driver-age-container .jgGbOn {    
                max-width: 100% !important;
                width: 100%;
                all: unset;
                display: contents;
            }

            .injected-search-inner .driver-age-container .duCBHl {
                all: unset;
                line-height: 24px;
                color: rgb(4, 30, 66);
                font-size: 16px;
                position: relative;
                box-sizing: border-box;
                width: 100%;
                height: 56px;
                cursor: pointer;
                display: flex;
                -webkit-box-align: center;
                align-items: center;
                padding: 16px;
                border-radius: 8px;
                border-width: 1px;
                border-style: solid;
                border-color: rgb(191, 191, 191);
                border-image: initial;
                background: rgb(255, 255, 255);
                transition: 0.3s ease-in;
                gap: 8px;
            }

            .injected-search-inner .driver-age-container .bDseOG {
                display: flex;
            }

            .injected-search-inner .driver-age-container .clMLBp {
                --_size: 24px;
                width: var(--_size);
                height: var(--_size);
            }

            .injected-search-inner .driver-age-container .fayyzk {
                height: 100%;
                width: 100%;
                display: flex;
                -webkit-box-pack: justify;
                justify-content: space-between;
            }

            .injected-search-inner .driver-age-container .eJzIEf {
                color: rgb(118, 118, 118);
                opacity: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                -webkit-box-align: center;
                align-items: center;
            }

            .injected-search-inner .driver-age-container .jCmJFz {
                position: absolute;
                top: 50%;
                left: 48px;
                transform: translateY(-50%);
                color: rgb(2, 86, 146);
                width: calc(100% - 90px);
                transition: 0.3s ease-out;
                background: white;
                display: flex;
                -webkit-box-align: center;
                align-items: center;
                gap: 4px;
            }

            .injected-search-inner .injectedInputsForCars {
                display: flex;
                width: 100%;
                align-self: start;
                flex-direction: column;
                gap: 16px;
            }
        `;
        const styleTag = document.createElement('style');
        styleTag.appendChild(document.createTextNode(css));
        document.head.appendChild(styleTag);

        SERVICES_SETUP[currentService].init();
    });

    // —————————————
    // FUNÇÕES E CONSTANTES QUE GARANTEM O FUNCIONAMENTO DA V2
    // PARA CADA UMA DAS ABAS, EXIBINDO O CONTEÚDO COMPLEMENTAR DE CADA UMA DELAS
    // —————————————
    
    const AVAILABLE_SERVICES = ["VOOS", "HOTEIS", "INGRESSOS", "CARROS"];
    const SERVICES_SETUP = {
        "VOOS": new Voos(),
        "HOTEIS": new Hoteis(),
        "INGRESSOS": new Ingressos(),
        "CARROS": new Carros()
    };

    let currentService = AVAILABLE_SERVICES[0];

    const initOnServiceButtons = () => {
        const buttons = document.querySelectorAll(".sc-13e37337-5.jWLomW div[role='button']");

        buttons?.forEach((button, index) => {
            const TARGET_SERVICE = Object.keys(SERVICES_SETUP)[index];

            if (AVAILABLE_SERVICES.includes(TARGET_SERVICE)) {
                button.addEventListener("click", () => {
                    if(currentService !== TARGET_SERVICE) {
                        let attempts = 0;
                        const maxAttempts = 10;

                        function checkElement() {
                            const targetElement = SERVICES_SETUP[TARGET_SERVICE].QUERY_SELECTOR_TO_CHECK_INIT;
                            const elementCheck = document.querySelector(targetElement);

                            if (elementCheck) {
                                currentService = TARGET_SERVICE;
                                SERVICES_SETUP[TARGET_SERVICE].init();
                            } else if (attempts < maxAttempts) {
                                attempts++;
                                requestAnimationFrame(checkElement);
                            } else {
                                console.error("Elemento " + targetElement + " não encontrado após " + maxAttempts + " tentativas");
                            }
                        }

                        requestAnimationFrame(checkElement);
                    }
                });
            }
        });
    };

    function Voos() {
        this.QUERY_SELECTOR_TO_CHECK_INIT = ".sc-ezyqiv.jKXdGz";

        this.ERROR_MESSAGES = {
            ORIGIN: "Selecione a origem",
            DESTINATION: "Selecione o destino",
            DATE: "Selecione a data"
        };

        this.REPLY_ADITIONAL_OPTIONS_CONTAINER = `
            <div id="injectedMoreOptions">
                <button type="button" data-cy-id="travelers-button" class="sc-jhcsUC jWayXx sc-ldASuJ fRwcjV sc-dtOhJP klxFSe">
                    <svg class="sc-ivNAKN clMLBp sc-fXCkwE" size="24" viewBox="0 0 1024 1024" fill="none">
                        <path d="M676.6 224C601.1 224 539.4 282.9 539.4 354.9 539.4 426.9 601.1 485.8 676.6 485.8 752 485.8 813.7 426.9 813.7 354.9 813.7 282.9 752 224 676.6 224ZM347.4 224C272 224 210.3 282.9 210.3 354.9 210.3 426.9 272 485.8 347.4 485.8 422.9 485.8 484.6 426.9 484.6 354.9 484.6 282.9 422.9 224 347.4 224ZM347.4 538.2C270.8 538.2 128 577.1 128 651.6V800H566.9V651.6C566.9 577.1 424 538.2 347.4 538.2Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd"></path>
                        <path d="M617.1 800V650.7C617.1 613.8 589.8 584.1 551.4 561.7 593.8 546.1 642 538.2 676.6 538.2 753.2 538.2 896 577.1 896 651.6V800H617.1Z" fill="#025692"></path>
                    </svg>
                    <div id="injectedTravelers">1 Adulto</div>
                    <svg class="sc-ivNAKN clMLBp sc-fXCkwE" size="24" viewBox="0 0 1024 1024" fill="none">
                        <path d="M522.2 626.3C517.1 633.2 506.9 633.2 501.8 626.3L335.4 404.5C329 396 335.1 384 345.6 384L678.4 384C688.9 384 695 396 688.6 404.5L522.2 626.3Z" fill="#041E42"></path>
                    </svg>
                </button>
                <div class="sc-idiuOw" id="injectedPoints">
                    <div color="#026CB6" class="sc-flEoeP YaLSh sc-irnONR cQNsqM">
                        <div class="sc-irPWCR bvkdUQ">
                            <span color="#026CB6" class="sc-jDba-dz kaXyM sc-iSYyZG KMWMY"></span>
                        </div>
                        <div class="sc-dtOhJP bTHDgW">
                            <div class="sc-lebysi bTztjJ">
                                <div size="24" class="sc-iOTImf gXbopa">
                                    <div class="sc-ePqJEo hYkdEs sc-ggKVCX jdKrIZ sc-dtOhJP cVgdgo">
                                        <input id=":r9:" type="checkbox" size="24" data-cy-id="checkbox-points" class="sc-gAjtsA longpt">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="sc-hAfTf dCwmNK sc-jHaOEC HCGfe">Usar pontos Azul</p>
                    </div>
                </div>
            </div>
            <div id="injectedSearchButtonContainer">
                <div class="sc-gfaRDd evAVmJ"></div>
                <button type="button" class="sc-jhcsUC sc-eDCQLT kJwzph sc-dtOhJP klxFSe" id="injectedSearchButton">Buscar passagens</button>
            </div>
        `;

        this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const originalOptionsElement = document.querySelector(".sc-ezyqiv.jKXdGz");
                const replyElements = document.querySelector("#injectClonedOptions");
                const originalOptionsHasOptions = document.querySelector(".sc-ezyqiv.jKXdGz")?.childElementCount > 0;

                if(originalOptionsHasOptions) {
                    originalOptionsElement.style.display = "flex";
                    replyElements.style.display = "none";
                } else {
                    originalOptionsElement.style.display = "none";
                    replyElements.style.display = "block";
                }
            } 
        });

        this.DATE_FIELD_VALIDATION_OBSERVER = new MutationObserver((mutations) => {
            const dateField = document.querySelector(".sc-sddJj.eXSfol");
            validateField(dateField, this.ERROR_MESSAGES.DATE, "label");
        });

        this.validateFieldsOnChange = () => {
            const placesField = document.querySelectorAll(".sc-eocBVw.fRxbqX input");
    
            placesField.forEach((field, index) => {
                field.addEventListener("change", () => {
                    validateField(field, this.ERROR_MESSAGES[Object.keys(this.ERROR_MESSAGES)[index]]);
                })
            });
        };

        this.validateInitialFormFieldsOnSubmit = () => {
            const placesField = document.querySelectorAll(".sc-eocBVw.fRxbqX input");

            placesField.forEach((field, index) => {
                validateField(field, this.ERROR_MESSAGES[Object.keys(this.ERROR_MESSAGES)[index]]);
            });

            const dateField = document.querySelector(".sc-sddJj.eXSfol");
            validateField(dateField, this.ERROR_MESSAGES.DATE, "label");
        }

        this.init = function() {
            const outerWrapper = getCurrentOuterWrapper();
            const containerOfFields = outerWrapper.querySelector(".sc-hlwBNc.bRuAwp");
            const originalAditionalOptionsElement = containerOfFields?.querySelector(".sc-ezyqiv.jKXdGz");

            if (originalAditionalOptionsElement) {
                originalAditionalOptionsElement.style.display = "none";
                this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER.observe(originalAditionalOptionsElement, {
                    childList: true,
                    subtree: true
                });
        
                const replyAditionalOptionsContainer = document.createElement("div");
                replyAditionalOptionsContainer.setAttribute("id", "injectClonedOptions");
                replyAditionalOptionsContainer.style.width = "100%";
                replyAditionalOptionsContainer.innerHTML = this.REPLY_ADITIONAL_OPTIONS_CONTAINER;
                
                const injectedSearchButtonElement = replyAditionalOptionsContainer.querySelector("#injectedSearchButton");
                injectedSearchButtonElement.addEventListener("click", () => {
                    this.validateInitialFormFieldsOnSubmit();
                      scrollToSearchButton();
                });

                containerOfFields.appendChild(replyAditionalOptionsContainer);
                this.validateFieldsOnChange();
                this.DATE_FIELD_VALIDATION_OBSERVER.observe(document.querySelector(".sc-sddJj.eXSfol"), { attributes: true });
                validateFieldsOnLastSearchClick(this.validateInitialFormFieldsOnSubmit);
            }
        };
    }
      
    function Hoteis() {
        this.QUERY_SELECTOR_TO_CHECK_INIT = ".sc-dqrbnO.dgCprO";

        this.ERROR_MESSAGES = {
            ORIGIN: "Selecione o destino ou hotel",
            DATE: "Selecione a data",
        };

        this.REPLY_ADITIONAL_OPTIONS_CONTAINER = `
            <div id="injectedMoreOptions" class="injectedMoreOptions--hoteis">
                <button type="button" data-cy-id="travelers-button" class="sc-jhcsUC jWayXx sc-ldASuJ fRwcjV sc-dtOhJP klxFSe">
                    <svg class="sc-ivNAKN clMLBp sc-fXCkwE sfyoW" size="24" viewBox="0 0 1024 1024" fill="none">
                        <path d="M676.6 224C601.1 224 539.4 282.9 539.4 354.9 539.4 426.9 601.1 485.8 676.6 485.8 752 485.8 813.7 426.9 813.7 354.9 813.7 282.9 752 224 676.6 224ZM347.4 224C272 224 210.3 282.9 210.3 354.9 210.3 426.9 272 485.8 347.4 485.8 422.9 485.8 484.6 426.9 484.6 354.9 484.6 282.9 422.9 224 347.4 224ZM347.4 538.2C270.8 538.2 128 577.1 128 651.6V800H566.9V651.6C566.9 577.1 424 538.2 347.4 538.2Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd">
                        </path>
                        <path d="M617.1 800V650.7C617.1 613.8 589.8 584.1 551.4 561.7 593.8 546.1 642 538.2 676.6 538.2 753.2 538.2 896 577.1 896 651.6V800H617.1Z" fill="#025692"></path>
                    </svg>
                    <div class="sc-eeGyMD fRTRf">2 Adultos, 1 Quarto</div>
                    <svg class="sc-ivNAKN clMLBp sc-fXCkwE sfyoW" size="24" viewBox="0 0 1024 1024" fill="none">
                        <path d="M522.2 626.3C517.1 633.2 506.9 633.2 501.8 626.3L335.4 404.5C329 396 335.1 384 345.6 384L678.4 384C688.9 384 695 396 688.6 404.5L522.2 626.3Z" fill="#041E42"></path>
                    </svg>
                </button>
                <div class="sc-idiuOw buqa-de" id="injectedPoints">
                    <div color="#026CB6" class="sc-flEoeP YaLSh sc-irnONR cQNsqM">
                        <div class="sc-irPWCR bvkdUQ">
                            <span color="#026CB6" class="sc-jDba-dz kaXyM sc-iSYyZG KMWMY"></span>
                        </div>
                        <div class="sc-dtOhJP bTHDgW">
                            <div class="sc-lebysi bTztjJ">
                                <div size="24" class="sc-iOTImf gXbopa">
                                    <div class="sc-ePqJEo hYkdEs sc-ggKVCX jdKrIZ sc-dtOhJP cVgdgo">
                                        <input id=":rl:" type="checkbox" size="24" data-cy-id="checkbox-points" class="sc-gAjtsA longpt">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="sc-hAfTf dCwmNK sc-jHaOEC HCGfe">Usar pontos Azul</p>
                    </div>
                </div>
            </div>
            <div id="injectedSearchButtonContainer" style="margin-top: 24px">
                <div class="grouped-search-container">
                    <span class="sc-huFpoq grouped-divisor"></span>
                    <button type="button" data-cy-id="submit-search" class="sc-jhcsUC jWayXx sc-gSNaSj lgMroG sc-dtOhJP klxFSe" id="injectedSearchButton">Buscar hotéis</button>
                </div>
            </div>
        `;

        this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const replyElements = document.querySelector("#injectClonedOptions");
                const originalIsVisible = document.querySelector(".sc-iTEXeF.bkdite");

                if(originalIsVisible) {
                    replyElements.style.display = "none";
                } else {
                    replyElements.style.display = "block";
                }
            } 
        });

        this.DATE_FIELD_VALIDATION_OBSERVER = new MutationObserver((mutations) => {
            const dateField = mutations[0].target;
            validateField(dateField, this.ERROR_MESSAGES.DATE, "label");
        });

        this.validateFieldsOnChange = () => {
            const placeField = document.querySelector(".injected-search-inner .sc-dMknzp.iXHYuL");
    
            placeField?.addEventListener("change", () => {
                validateField(placeField, this.ERROR_MESSAGES.ORIGIN);
            });
            
            const dateFields = document.querySelectorAll(".injected-search-inner .sc-sddJj.eXSfol");
            dateFields?.forEach((field, index) => {
                this.DATE_FIELD_VALIDATION_OBSERVER.observe(field, { attributes: true });
            });
        };

        this.validateInitialFormFieldsOnSubmit = () => {
            const placeField = document.querySelector(".injected-search-inner .sc-dMknzp.iXHYuL");
            validateField(placeField, this.ERROR_MESSAGES.ORIGIN);

            const dateFields = document.querySelectorAll(".injected-search-inner .sc-sddJj.eXSfol");
            dateFields?.forEach((field, index) => {
                validateField(field, this.ERROR_MESSAGES.DATE, "label");
            });
        }

        this.init = function() {
            const outerWrapper = getCurrentOuterWrapper();
            const containerOfFields = outerWrapper.querySelector(".sc-DrFfa.jDRUlA");
            const originalAditionalOptionsElement = containerOfFields?.querySelector(".sc-dqrbnO.dgCprO");

            if (originalAditionalOptionsElement) {
                this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER.observe(originalAditionalOptionsElement, {
                    childList: true,
                    subtree: true
                });
        
                const replyAditionalOptionsContainer = document.createElement("div");
                replyAditionalOptionsContainer.setAttribute("id", "injectClonedOptions");
                replyAditionalOptionsContainer.style.marginTop = "-8px";
                replyAditionalOptionsContainer.style.width = "100%";
                replyAditionalOptionsContainer.innerHTML = this.REPLY_ADITIONAL_OPTIONS_CONTAINER;
                
                const injectedSearchButtonElement = replyAditionalOptionsContainer.querySelector("#injectedSearchButton");
                injectedSearchButtonElement.addEventListener("click", () => {
                    this.validateInitialFormFieldsOnSubmit();
                      scrollToSearchButton();
                });

                containerOfFields.appendChild(replyAditionalOptionsContainer);
                this.validateFieldsOnChange();
                validateFieldsOnLastSearchClick(this.validateInitialFormFieldsOnSubmit);
            }
        };
    }
      
    function Ingressos() {
        this.QUERY_SELECTOR_TO_CHECK_INIT = ".sc-jASfTE.fYGIHt";
        
        this.ERROR_MESSAGES = {
            ORIGIN: "Selecione o destino ou ingresso",
            DATE: "Selecione a data",
        };

        this.REPLY_ADITIONAL_OPTIONS_CONTAINER = `
            <div id="injectedMoreOptions" class="injectedMoreOptions--hoteis">
                <button type="button" data-cy-id="travelers-button" class="sc-jhcsUC jWayXx sc-ldASuJ fRwcjV sc-dtOhJP klxFSe">
                    <svg class="sc-ivNAKN clMLBp sc-fXCkwE sfyoW" size="24" viewBox="0 0 1024 1024" fill="none">
                        <path d="M676.6 224C601.1 224 539.4 282.9 539.4 354.9 539.4 426.9 601.1 485.8 676.6 485.8 752 485.8 813.7 426.9 813.7 354.9 813.7 282.9 752 224 676.6 224ZM347.4 224C272 224 210.3 282.9 210.3 354.9 210.3 426.9 272 485.8 347.4 485.8 422.9 485.8 484.6 426.9 484.6 354.9 484.6 282.9 422.9 224 347.4 224ZM347.4 538.2C270.8 538.2 128 577.1 128 651.6V800H566.9V651.6C566.9 577.1 424 538.2 347.4 538.2Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd"></path>
                        <path d="M617.1 800V650.7C617.1 613.8 589.8 584.1 551.4 561.7 593.8 546.1 642 538.2 676.6 538.2 753.2 538.2 896 577.1 896 651.6V800H617.1Z" fill="#025692"></path>
                    </svg>
                    <div class="sc-eeGyMD fRTRf">2 Adultos</div>
                    <svg class="sc-ivNAKN clMLBp sc-fXCkwE sfyoW" size="24" viewBox="0 0 1024 1024" fill="none">
                        <path d="M522.2 626.3C517.1 633.2 506.9 633.2 501.8 626.3L335.4 404.5C329 396 335.1 384 345.6 384L678.4 384C688.9 384 695 396 688.6 404.5L522.2 626.3Z" fill="#041E42"></path>
                    </svg>
                </button>
                <div class="sc-idiuOw buqa-de" id="injectedPoints">
                    <div color="#026CB6" class="sc-flEoeP YaLSh sc-irnONR cQNsqM">
                        <div class="sc-irPWCR bvkdUQ">
                            <span color="#026CB6" class="sc-jDba-dz kaXyM sc-iSYyZG KMWMY"></span>
                        </div>
                        <div class="sc-dtOhJP bTHDgW">
                            <div class="sc-lebysi bTztjJ">
                                <div size="24" class="sc-iOTImf gXbopa">
                                    <div class="sc-ePqJEo hYkdEs sc-ggKVCX jdKrIZ sc-dtOhJP cVgdgo">
                                        <input id=":rl:" type="checkbox" size="24" data-cy-id="checkbox-points" class="sc-gAjtsA longpt">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="sc-hAfTf dCwmNK sc-jHaOEC HCGfe">Usar pontos Azul</p>
                    </div>
                </div>
            </div>
            <div id="injectedSearchButtonContainer" style="margin-top: 24px">
                <div class="grouped-search-container">
                    <span class="grouped-divisor"></span>
                    <button type="button" data-cy-id="submit-search" class="sc-jhcsUC jWayXx sc-fJAwkm YtAFk sc-dtOhJP klxFSe" id="injectedSearchButton">Buscar ingressos</button>
                </div>
            </div>
        `;

        this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const replyElements = document.querySelector("#injectClonedOptions");
                const originalIsVisible = document.querySelector(".sc-eeCSZA.efkWbu");

                if(originalIsVisible) {
                    replyElements.style.display = "none";
                } else {
                    replyElements.style.display = "block";
                }
            } 
        });

        this.DATE_FIELD_VALIDATION_OBSERVER = new MutationObserver((mutations) => {
            const dateField = mutations[0].target;
            validateField(dateField, this.ERROR_MESSAGES.DATE, "label");
        });

        this.validateFieldsOnChange = () => {
            const placeField = document.querySelector(".injected-search-inner .sc-dMknzp.iXHYuL");
    
            placeField?.addEventListener("change", () => {
                validateField(placeField, this.ERROR_MESSAGES.ORIGIN);
            });
            
            const dateFields = document.querySelectorAll(".injected-search-inner .sc-sddJj.eXSfol");
            dateFields?.forEach((field, index) => {
                this.DATE_FIELD_VALIDATION_OBSERVER.observe(field, { attributes: true });
            });
        };

        this.validateInitialFormFieldsOnSubmit = () => {
            const placeField = document.querySelector(".injected-search-inner .sc-dMknzp.iXHYuL");
            validateField(placeField, this.ERROR_MESSAGES.ORIGIN);

            const dateFields = document.querySelectorAll(".injected-search-inner .sc-sddJj.eXSfol");
            dateFields?.forEach((field, index) => {
                validateField(field, this.ERROR_MESSAGES.DATE, "label");
            });
        }

        this.init = function() {
            const outerWrapper = getCurrentOuterWrapper();
            const containerOfFields = outerWrapper.querySelector(".sc-cfROWZ.dcstEm");
            const originalAditionalOptionsElement = containerOfFields?.querySelector(".sc-jASfTE.fYGIHt");

            if (originalAditionalOptionsElement) {
                this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER.observe(originalAditionalOptionsElement, {
                    childList: true,
                    subtree: true
                });
        
                const replyAditionalOptionsContainer = document.createElement("div");
                replyAditionalOptionsContainer.setAttribute("id", "injectClonedOptions");
                replyAditionalOptionsContainer.style.marginTop = "-8px";
                replyAditionalOptionsContainer.style.width = "100%";
                replyAditionalOptionsContainer.innerHTML = this.REPLY_ADITIONAL_OPTIONS_CONTAINER;
                
                const injectedSearchButtonElement = replyAditionalOptionsContainer.querySelector("#injectedSearchButton");
                injectedSearchButtonElement.addEventListener("click", () => {
                    this.validateInitialFormFieldsOnSubmit();
                      scrollToSearchButton();
                });

                containerOfFields.appendChild(replyAditionalOptionsContainer);
                this.validateFieldsOnChange();
                validateFieldsOnLastSearchClick(this.validateInitialFormFieldsOnSubmit);
            }
        };
    }
      
    function Carros() {
        this.QUERY_SELECTOR_TO_CHECK_INIT = ".sc-hlwBNc.bRuAwp";
        
        this.ERROR_MESSAGES = {
            LOCALE: "Selecione o local de retirada",
            LOCACALE_BACK: "Selecione o local de devolução",
            NATIONALITY: "Selecione a nacionalidade",
            AGE: "Selecione a idade",
            DATE: "Selecione a data"
        };

        this.REPLY_ADITIONAL_OPTIONS_CONTAINER = `
            <div id="injectedMoreOptions" class="injectedMoreOptions--hoteis">
                <div class="injectedInputsForCars">
                    <div class="sc-jockhq kiYSOF"><div class="sc-eocBVw fRxbqX"><input tabindex="-1" class="sc-dMknzp iXHYuL" value=""><div class="sc-ecASvo fQeBxJ"><button type="button" class="sc-FFGcl lkSWYj"><svg class="sc-ivNAKN clMLBp sc-gfgAPC ioPMrw" size="24" viewBox="0 0 1024 1024" fill="none"><path d="M185.1 669.1L214.6 638.2 332.1 514.9C333.9 513 336 512 338.6 512 340.9 512 343.3 513 345.1 514.9L374.6 545.8C377.9 549.2 377.9 554.9 374.6 558.3L292.3 644.8H522.4C527.3 644.8 531.5 648.7 531.5 653.9V697.7C531.5 700 530.4 702.4 528.9 703.9 527.3 705.5 525 706.6 522.7 706.6H292.5L374.8 793C378.2 796.4 378.2 802.1 374.8 805.5L345.3 836.4C343.5 838.3 341.4 839.3 338.9 839.3 336.5 839.3 334.2 838.3 332.4 836.4L214.8 713.1 185.3 682.2C181.7 678 181.7 672.5 185.1 669.1Z" fill="#025692"></path><path d="M553.4 128C394.2 128 265.4 248.2 265.4 396.8 265.4 434.3 275.4 475 291.6 516.6L310.4 496.9C316 491.2 324.4 486.4 335 486.4 345.1 486.4 353.7 490.9 359.7 496.9L360 497.2 389.4 528C402.4 541.3 402.4 562.8 389.4 576.1L348.4 619.2H518.8C537.7 619.2 553.5 634.4 553.5 653.9V697.7C553.5 707 549.6 715.8 543.5 721.9 537.4 728.1 528.6 732.2 519.1 732.2H416.8C486.3 826.6 553.4 896 553.4 896 553.4 896 841.4 598.4 841.4 396.8 841.4 248.2 712.6 128 553.4 128ZM553.4 518.4C624 518.4 681.4 461 681.4 390.4 681.4 319.8 624 262.4 553.4 262.4 482.8 262.4 425.4 319.8 425.4 390.4 425.4 461 482.8 518.4 553.4 518.4Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd"></path></svg><div class="sc-EylwS gKNOFV"><span class="sc-iwYICL dxDSAW"><span class="sc-dVtIUG chsYUw">Local de devolução</span></span></div></button></div></div></div>
                    <div class="sc-jockhq kiYSOF"><div class="sc-cmdYNQ kRktBU"><label for=":rg:" class="sc-cfghqR dyPMgh"><svg class="sc-ivNAKN clMLBp sc-hOwajD eEwLiX" size="24" viewBox="0 0 1024 1024" fill="none"><path d="M282.9 703.4H405.8V581.9H282.9V703.4ZM825.6 804.5C825.6 833.9 801.6 857.6 771.8 857.6H252.2C222.4 857.6 198.4 833.6 198.4 804.5V492.3H825.6V804.5ZM321.3 188.8C321.3 176.3 331.5 166.1 344.3 166.1 357.1 166.1 367.4 176.3 367.4 188.8V249.5H321.3V188.8ZM656.6 188.8C656.6 176.3 666.9 166.1 679.7 166.1 692.5 166.1 702.7 176.3 702.7 188.8V249.5H656.6V188.8ZM771.8 249.5H741.1V188.8C741.1 155.2 713.6 128 679.7 128 645.8 128 618.2 155.2 618.2 188.8V249.5H405.8V188.8C405.8 155.2 378.2 128 344.3 128 310.4 128 282.9 155.2 282.9 188.8V249.5H252.2C201.3 249.5 160 290.2 160 340.7V804.8C160 855.1 201.3 896 252.2 896H771.8C822.7 896 864 855.1 864 804.8V340.4C864 290.2 822.7 249.2 771.8 249.2V249.5Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd"></path></svg><div class="sc-dPWsDW jYnJpK"><input color="#025692" inputmode="none" id=":rg:" aria-label="Data e hora de devolução" aria-autocomplete="none" title="" required="" class="sc-sddJj eXSfol" value=""><span class="sc-imlogL gcHJQi"><span class="sc-erPVEu clqYLU">Data e hora de devolução</span></span><button type="button" class="sc-kKhKVs bgWeRn"><svg size="24" viewBox="0 0 1024 1024" fill="none" class="sc-ivNAKN clMLBp"><path d="M688.5 371.7L652.3 335.5 512 475.8 371.7 335.5 335.5 371.7 475.8 512 335.5 652.3 371.7 688.5 512 548.2 652.3 688.5 688.5 652.3 548.2 512 688.5 371.7Z" fill="#595959"></path><path d="M512 844.8C695.8 844.8 844.8 695.8 844.8 512 844.8 328.2 695.8 179.2 512 179.2 328.2 179.2 179.2 328.2 179.2 512 179.2 695.8 328.2 844.8 512 844.8ZM512 896C724.1 896 896 724.1 896 512 896 299.9 724.1 128 512 128 299.9 128 128 299.9 128 512 128 724.1 299.9 896 512 896Z" fill="#595959" fill-rule="evenodd" clip-rule="evenodd"></path></svg></button></div></label></div></div>
                    <div class="sc-eocBVw fRxbqX"><input tabindex="-1" class="sc-dMknzp iXHYuL" value=""><div class="sc-ecASvo fQeBxJ"><button type="button" class="sc-FFGcl lkSWYj"><svg class="sc-ivNAKN clMLBp sc-gfgAPC ioPMrw" size="24" viewBox="0 0 1024 1024" fill="none"><path d="M812.3 748.5C784 731 752.7 716 719.2 703.8 738.2 649.3 749.4 588.9 751.4 525.1H898.2C894 609.6 862.4 686.9 812.3 748.5ZM615.5 876.7C652 839.7 682.4 792.5 705.5 738.8 734.8 749.2 762.2 761.9 787.1 776.7 740.3 823.8 681.4 858.6 615.5 876.7ZM533.1 706.8C581.4 708.4 627.6 715.4 670.3 727.4 639.8 797.5 595.4 854.2 542.6 889.2 539.4 889.5 536.3 890 533.1 890.1V706.8ZM485.9 889.2C433 854.2 388.7 797.5 358.2 727.4 400.9 715.4 447.1 708.4 495.4 706.8V890.1C492.2 890 489.1 889.5 485.9 889.2ZM241.2 776.7C266.1 761.9 293.5 749.2 322.8 738.8 345.9 792.5 376.3 839.7 412.7 876.7 346.9 858.6 288 823.8 241.2 776.7ZM130.2 525.1H276.9C278.9 588.9 290.1 649.3 309.2 703.8 275.7 716 244.4 731 216.1 748.5 165.9 686.9 134.3 609.6 130.2 525.1ZM216.1 263.9C244.4 281.4 275.7 296.3 309.2 308.5 290.1 363.1 278.9 423.5 276.9 487.3H130.2C134.3 402.8 165.9 325.5 216.1 263.9ZM412.8 135.6C376.4 172.6 345.9 219.8 322.8 273.6 293.5 263.1 266.1 250.4 241.2 235.7 288 188.5 346.9 153.7 412.8 135.6ZM434.5 130.4C429.4 131.5 424.2 132.5 419.2 133.8 424.2 132.5 429.3 131.5 434.5 130.4ZM495.4 305.5C447.1 304 400.9 296.9 358.2 284.9 388.7 214.8 433 158.2 485.9 123.1 489.1 122.8 492.2 122.3 495.4 122.2V305.5ZM542.6 123.1C595.4 158.2 639.8 214.8 670.3 284.9 627.6 296.9 581.4 304 533.1 305.5V122.2C536.3 122.3 539.4 122.8 542.6 123.1ZM787.1 235.7C762.2 250.4 734.8 263.1 705.5 273.6 682.4 219.8 652 172.6 615.5 135.6 681.4 153.6 740.3 188.5 787.1 235.7ZM533.1 487.3V343.2C586.2 341.6 637 333.7 684 320 701.6 370.8 711.9 427.5 713.8 487.3H533.1ZM533.1 525.1H713.8C711.9 584.9 701.6 641.5 684 692.4 637 678.7 586.2 670.8 533.1 669.1V525.1ZM314.6 487.3C316.5 427.5 326.8 370.8 344.4 320 391.4 333.7 442.2 341.6 495.3 343.2V487.3H314.6ZM495.3 525.1V669.1C442.2 670.8 391.4 678.7 344.4 692.4 326.8 641.5 316.5 584.9 314.6 525.1H495.3ZM898.2 487.3H751.4C749.4 423.5 738.2 363.1 719.2 308.6 752.7 296.3 784 281.4 812.3 263.9 862.4 325.5 894.1 402.8 898.2 487.3Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd"></path></svg><div class="sc-EylwS gKNOFV"><span class="sc-iwYICL dxDSAW"><span class="sc-dVtIUG chsYUw">Nacionalidade do motorista</span></span></div></button></div></div>
                    <div class="sc-kCcofV eyqWjW driver-age-container"><input tabindex="-1" class="sc-cKzTBM ilANvg" value=""><button role="combobox" aria-expanded="false" aria-label="Idade do motorista, Selecione" aria-autocomplete="none" type="button" class="sc-jDyTkK jgGbOn"><div class="sc-icgRgT duCBHl"><div class="sc-bhWXYN bDseOG"><svg class="sc-ivNAKN clMLBp sc-bpmnbn cHuSol" size="24" viewBox="0 0 1024 1024" fill="none"><path d="M162.3 512C162.3 319.2 319.2 162.3 512 162.3 704.8 162.3 861.7 319.2 861.7 512 861.7 601.7 827.5 683.3 771.8 745.3 717.1 653.8 618.6 597 512 597 405.4 597 306.9 653.8 252.2 745.3 196.5 683.3 162.3 601.7 162.3 512ZM584 889C594.9 886.9 605.7 884.3 616.4 881.2L617.1 881.1C778 835.3 896 687.6 896 512 896 299.9 724.1 128 512 128 299.9 128 128 299.9 128 512 128 687.6 246 835.4 407 881.1 407.1 881.1 407.3 881.2 407.4 881.2 418.1 884.2 429 886.9 440.1 889 444 889.8 448 890.2 451.9 890.8 459.6 892 467.2 893.4 475.1 894.1 487.3 895.3 499.5 896 511.9 896 511.9 896 511.9 896 512 896 524.4 896 536.7 895.3 548.9 894.1 556.7 893.4 564.3 892.1 571.9 890.9 575.9 890.2 580 889.8 584 889ZM512 575.8C589.5 575.8 652.6 512.7 652.6 435.2 652.6 357.7 589.5 294.6 512 294.6 434.5 294.6 371.4 357.7 371.4 435.2 371.4 512.7 434.5 575.8 512 575.8Z" fill="#025692" fill-rule="evenodd" clip-rule="evenodd"></path></svg></div><div class="sc-kEwCK fayyzk"><span class="sc-laPCKd eJzIEf">Selecione</span><svg role="img" class="sc-ivNAKN clMLBp sc-djnifU fSwFxi" size="24" viewBox="0 0 1024 1024" fill="none"><path d="M522.2 626.3C517.1 633.2 506.9 633.2 501.8 626.3L335.4 404.5C329 396 335.1 384 345.6 384L678.4 384C688.9 384 695 396 688.6 404.5L522.2 626.3Z" fill="#025692"></path></svg><span class="sc-eFQmTA jCmJFz">Idade do motorista</span></div></div></button></div>
                </div>
                <div class="sc-idiuOw buqa-de" id="injectedPoints">
                    <div color="#026CB6" class="sc-flEoeP YaLSh sc-irnONR cQNsqM">
                        <div class="sc-irPWCR bvkdUQ">
                            <span color="#026CB6" class="sc-jDba-dz kaXyM sc-iSYyZG KMWMY"></span>
                        </div>
                        <div class="sc-dtOhJP bTHDgW">
                            <div class="sc-lebysi bTztjJ">
                                <div size="24" class="sc-iOTImf gXbopa">
                                    <div class="sc-ePqJEo hYkdEs sc-ggKVCX jdKrIZ sc-dtOhJP cVgdgo">
                                        <input id=":rl:" type="checkbox" size="24" data-cy-id="checkbox-points" class="sc-gAjtsA longpt">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="sc-hAfTf dCwmNK sc-jHaOEC HCGfe">Usar pontos Azul</p>
                    </div>
                </div>
            </div>
            <div id="injectedSearchButtonContainer" style="margin-top: 24px">
                <div class="grouped-cars">
                    <button type="button" class="sc-jhcsUC jWayXx sc-hRzftK eLUmVk sc-dtOhJP klxFSe" id="injectedSearchButton">Buscar carros</button>
                </div>
            </div>
        `;

        this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const replyElements = document.querySelector("#injectClonedOptions");
                const originalIsVisible = document.querySelector(".sc-drBMub.fLGmKr");

                if(originalIsVisible) {
                    replyElements.style.display = "none";
                } else {
                    replyElements.style.display = "block";
                }
            } 
        });

        this.DATE_FIELD_VALIDATION_OBSERVER = new MutationObserver((mutations) => {
            const dateField = mutations[0].target;
            validateField(dateField, this.ERROR_MESSAGES.DATE, "label");
        });

        this.CONTROL_VISIBILITY_OF_CLONED_FIELDS = new MutationObserver((mutations) => {
            const containerOfFields = document.querySelector(".sc-jkBAXF.kMFpke");
            const clonedFields = document.querySelectorAll(".injectedInputsForCars > div");
            const clonedPointField = document.querySelector("#injectedPoints");
            const countInitialFields = 2;
            const countOfFields = containerOfFields?.childElementCount;
            const countOfFieldsToHide = countOfFields - countInitialFields;
            const maximumFieldsToHide = 5;
            const lastDefaultField = countOfFieldsToHide - 1;

            if(countOfFieldsToHide < maximumFieldsToHide) {
                for(let i = maximumFieldsToHide; i > countOfFieldsToHide; i--) {
                    if(i === maximumFieldsToHide) {
                        clonedPointField.style.display = "flex";
                    } else {
                        clonedFields[i - 1].style.display = "block";
                    }
                }
            }

            if(countOfFields <= countInitialFields) {
                return;
            }
            
            for(let i = 0; i < countOfFieldsToHide; i++) {
                if(i === lastDefaultField && countOfFieldsToHide === maximumFieldsToHide) {
                    clonedPointField.style.display = "none";
                } else {
                    clonedFields[i].style.display = "none";
                }
            }

            this.validateFieldsOnChange();
        });

        this.validateFieldsOnChange = () => {
            const placesField = document.querySelectorAll(".injected-search-inner .sc-jkBAXF.kMFpke .sc-dMknzp.iXHYuL");
    
            placesField?.forEach((field, index) => {
                field.addEventListener("change", () => {
                    validateField(field, this.ERROR_MESSAGES[Object.keys(this.ERROR_MESSAGES)[index]]);
                });
            });

            const ageField = document.querySelector(".injected-search-inner .sc-jkBAXF.kMFpke .sc-cKzTBM.ilANvg");
            ageField?.addEventListener("change", () => {
                validateField(ageField, this.ERROR_MESSAGES.AGE);
            });
            
            const dateFields = document.querySelectorAll(".injected-search-inner .sc-jkBAXF.kMFpke .sc-sddJj.eXSfol");
            dateFields?.forEach((field, index) => {
                this.DATE_FIELD_VALIDATION_OBSERVER.observe(field, { attributes: true });
            });
        };

        this.validateInitialFormFieldsOnSubmit = () => {
            const placesField = document.querySelectorAll(".injected-search-inner .sc-jkBAXF.kMFpke .sc-dMknzp.iXHYuL");
    
            placesField?.forEach((field, index) => {
                validateField(field, this.ERROR_MESSAGES[Object.keys(this.ERROR_MESSAGES)[index]]);
            });

            const ageField = document.querySelector(".injected-search-inner .sc-jkBAXF.kMFpke .sc-cKzTBM.ilANvg");
            validateField(ageField, this.ERROR_MESSAGES.AGE);
            
            const dateFields = document.querySelectorAll(".injected-search-inner .sc-jkBAXF.kMFpke .sc-sddJj.eXSfol");
            dateFields?.forEach((field, index) => {
                validateField(field, this.ERROR_MESSAGES.DATE, "label");
            });
        }

        this.init = function() {
            const outerWrapper = getCurrentOuterWrapper();
            const containerOfFields = outerWrapper.querySelector(".sc-hlwBNc.bRuAwp");
            const originalAditionalOptionsElement = containerOfFields?.querySelector(".sc-jkBAXF.kMFpke");

            if (originalAditionalOptionsElement) {
                this.ORIGINAL_ADITIONAL_OPTIONS_OBSERVER.observe(originalAditionalOptionsElement, {
                    childList: true,
                    subtree: true
                });
        
                const replyAditionalOptionsContainer = document.createElement("div");
                replyAditionalOptionsContainer.setAttribute("id", "injectClonedOptions");
                replyAditionalOptionsContainer.style.width = "100%";
                replyAditionalOptionsContainer.innerHTML = this.REPLY_ADITIONAL_OPTIONS_CONTAINER;
                
                const injectedSearchButtonElement = replyAditionalOptionsContainer.querySelector("#injectedSearchButton");
                injectedSearchButtonElement.addEventListener("click", () => {
                    this.validateInitialFormFieldsOnSubmit();
                      scrollToSearchButton();
                });

                containerOfFields.appendChild(replyAditionalOptionsContainer);
                this.validateFieldsOnChange();
                validateFieldsOnLastSearchClick(this.validateInitialFormFieldsOnSubmit);
                
                this.CONTROL_VISIBILITY_OF_CLONED_FIELDS.observe(originalAditionalOptionsElement, { childList: true, subtree: true });
            }
        };
    }
})();