(function() {
    const experienceName = "AT_INS_NO_DEFAULT";
    const experienceAlreadyExecuted = window[experienceName] || false;

    // Target em SPA precisa iniciar o script em etapas anteriores do checkout.
    // A injeção e a coleta de dados só acontecem em /review.
    const CHECKOUT_URL_STEPS = ["selecao-voo", "passageiros", "responsavel", "review"];

    const onCheckoutFlowPage = () => {
        const currentUrl = window.location.pathname;
        return CHECKOUT_URL_STEPS.some(step => currentUrl.includes(step));
    };

    const initExperienceWhenReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const isDesktopDevice = window.innerWidth >= 1024;

        if (!isDesktopDevice) {
            console.log("[AT] Not a desktop device, experience will not run.");
            return;
        }

        if (isReady) {
            experienceSetup();
        } else {
            document.addEventListener("DOMContentLoaded", experienceSetup);
        }
    };

    if (experienceAlreadyExecuted || !onCheckoutFlowPage()) {
        console.log("[AT] Page is not a checkout step OR script already executed.");
        return;
    }

    window[experienceName] = true;
    initExperienceWhenReady();

    function experienceSetup() {
        console.log("[AT] Experience started:", experienceName);

        const SELECTORS = {
            azulPageFragment: ".azul-page-fragment",
            luggageContainer: ".LuggageAdderContainer",
            insuranceBanner: ".LuggageAdderContainer .styles__InsuranceBannerContainer-sc-1kgy9y2-0, .css-1kdmo88 .styles__InsuranceBannerContainer-sc-1kgy9y2-0",
            tripsList: ".LuggageAdderContainer .react-tabs__tab-list li, .react-tabs__tab-list li",
            buttonAdderInsurance: ".styles__InsuranceBannerContainer-sc-1kgy9y2-0 .styles__InsuranceBannerFooterArea-sc-1kgy9y2-6 button[type='button']",
            buttonSubmitCheckout: ".LuggageAdderContainer button[type='submit']",
            insurancePrice: ".styles__InsuranceBannerContainer-sc-1kgy9y2-0 .styles__InsurancePrice-sc-1kgy9y2-11",
            nativeCoverageTitle: "[class*='styles__TableTitle']",
            nativeRichText: ".richTextContainer",
        };

        const NATIVE_BENEFIT_ICON = '<svg width="20" height="20" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M512 128C724.1 128 896 299.9 896 512 896 724.1 724.1 896 512 896 299.9 896 128 724.1 128 512 128 299.9 299.9 128 512 128ZM439.8 584.4L330.9 475.4 288 518.4 439.8 672 714.7 396.5V396.4L671.8 352H671.7L439.8 584.4Z" fill="#31A2D0"></path></svg>';

        const BENEFITS_BY_TRIP = {
            goAndBack: [
                "Proteção para Celular e Notebook (roubo/furto)",
                "Despesas Médicas, Hospitalares e Farmacêuticas",
                "Cobertura Pet e muito mais!",
            ],
            oneWay: [
                "Despesas Médicas, Hospitalares e Odontológicas em Viagem",
                "Cancelamento de Viagem e muito mais!",
            ],
        };

        const ACCORDION_ICON = '<svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0.5C11.9924 3.18702 14.9989 5.85847 18 8.53572L17.16 9.5L9 2.22768L0.860033 9.5L-3.51252e-07 8.53572C2.98684 5.84247 6.02364 3.20495 9 0.5Z" fill="#026CB6"></path></svg>';

        const TERMS_URL = "https://www.voeazul.com.br/br/pt/sua-viagem/seguro-viagem/regulamento-seguros/chubb-seguros";
        const TERMS_LINK_HTML = '<a href="' + TERMS_URL + '" target="_blank" rel="noopener noreferrer">Termos e Condições do Seguro Viagem (Processo SUSEP nº. 15414.900439/2015-34)</a>';

        const TRIP_TYPES = {
            goAndBack: "goAndBack",
            oneWay: "oneWay",
        };

        const TRIP_TYPE_LABELS = {
            goAndBack: "Ida e volta",
            oneWay: "Trecho único (somente ida)",
        };

        // A ordem importa: termos mais específicos precisam ser testados antes de "nacional/brasil".
        const REGION_MATCHERS = [
            { region: "europa", keywords: ["europa"] },
            { region: "estadosUnidos", keywords: ["estados unidos", "eua", "united states"] },
            { region: "americaDoSul", keywords: ["america do sul", "sul-americ", "mercosul"] },
            { region: "brasil", keywords: ["nacional", "brasil", "domestic"] },
        ];

        const REGIONS = {
            brasil: {
                label: "Seguro Viagem Nacional",
                coverageLabel: "Coberturas Brasil",
                currencyNote: "",
                description: "Viajar pelo Brasil com segurança é essencial. O seguro viagem cobre despesas médicas fora da sua cidade, além de oferecer proteção para imprevistos como roubo ou furto de celular e notebook e reembolso de medicamentos. Tranquilidade em cada destino.",
                link: "https://www.voeazul.com.br/br/pt/sua-viagem/seguro-viagem",
                saibaMaisLink: "https://www.voeazul.com.br/assistencia-viagem/nacional/assistencias",
            },
            americaDoSul: {
                label: "Seguro Viagem América do Sul",
                coverageLabel: "Coberturas América do Sul",
                currencyNote: "Valores de cobertura expressos em dólares americanos (US$).",
                description: "Aventure-se pela América do Sul com tranquilidade e proteção. O seguro viagem oferece cobertura médica fora do seu país, reembolso de despesas com medicamentos, assistência em casos de imprevistos e proteção contra roubo ou furto de celular e notebook. Segurança essencial para aproveitar ao máximo cada destino sul-americano.",
                link: "https://www.voeazul.com.br/br/pt/sua-viagem/seguro-viagem/america-do-sul",
                saibaMaisLink: "https://www.voeazul.com.br/assistencia-viagem/internacional/assistencias",
            },
            estadosUnidos: {
                label: "Seguro Viagem Estados Unidos",
                coverageLabel: "Coberturas Estados Unidos",
                currencyNote: "Valores de cobertura expressos em dólares americanos (US$) — plano Gold 25.",
                description: "Explore os Estados Unidos com toda a segurança que sua viagem merece. O seguro viagem garante assistência médica fora do Brasil, reembolso de despesas com medicamentos, suporte em imprevistos e proteção contra roubo ou furto de celular e notebook. Tranquilidade para você viver o melhor de cada destino americano.",
                link: "https://www.voeazul.com.br/br/pt/sua-viagem/seguro-viagem/estados-unidos",
                saibaMaisLink: "https://www.voeazul.com.br/assistencia-viagem/internacional/assistencias",
            },
            europa: {
                label: "Seguro Viagem Europa",
                coverageLabel: "Coberturas Europa",
                currencyNote: "Valores de cobertura expressos em euros (€).",
                description: "Viajar pela Europa exige seguro com cobertura mínima de 30 mil euros para despesas médicas, conforme o Tratado de Schengen. O seguro viagem garante assistência médica, reembolso de medicamentos e proteção contra roubo ou furto de celular e notebook. Segurança essencial para circular com tranquilidade pelo continente europeu.",
                link: "https://www.voeazul.com.br/br/pt/sua-viagem/seguro-viagem/europa",
                saibaMaisLink: "https://www.voeazul.com.br/assistencia-viagem/internacional/assistencias",
            },
        };

        const COVERAGE_BY_REGION = {
            brasil: {
                goAndBack: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "R$ 1.250,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas", value: "R$ 3.000,00" },
                        { label: "Despesas farmacêuticas", value: "R$ 500,00" },
                        { label: "Traslado médico", value: "R$ 2.000,00" },
                        { label: "Regresso sanitário", value: "R$ 2.000,00" },
                        { label: "Traslado de corpo", value: "R$ 5.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem", value: "R$ 2.500,00" },
                        { label: "Perda, dano e roubo de documentos", value: "R$ 500,00" },
                        { label: "Roubo/furto de celular", value: "R$ 2.500,00" },
                        { label: "Roubo/furto de notebook", value: "R$ 1.000,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento Plus Reason", value: "R$ 600,00" },
                    ],
                }, {
                    title: "Assistências e Serviços",
                    items: [
                        { label: "Despesas com Pet (cães e gatos)", value: "R$ 1.500,00" },
                        { label: "Despesas com Pet (cães e gatos) por interrupção", value: "R$ 1.800,00" },
                    ],
                }],
                oneWay: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "R$ 1.250,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas", value: "R$ 3.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "R$ 500,00" },
                        { label: "Atraso de bagagem", value: "R$ 100,00" },
                        { label: "Atraso de voo", value: "R$ 150,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento de viagem", value: "R$ 1.000,00" },
                    ],
                }],
            },
            americaDoSul: {
                goAndBack: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "$ 7.000,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas em viagem", value: "$ 15.000,00" },
                        { label: "Despesas farmacêuticas", value: "$ 200,00" },
                        { label: "Traslado médico", value: "$ 15.000,00" },
                        { label: "Regresso sanitário", value: "$ 15.000,00" },
                        { label: "Traslado de corpo", value: "$ 15.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "$ 250,00" },
                        { label: "Atraso de bagagem", value: "$ 100,00" },
                        { label: "Atraso de voo", value: "$ 200,00" },
                        { label: "Perda, dano e roubo de documentos durante a viagem", value: "$ 300,00" },
                        { label: "Roubo/furto de celular", value: "$ 700,00" },
                        { label: "Roubo/furto de notebook", value: "$ 700,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento Plus Reason", value: "$ 500,00" },
                    ],
                }, {
                    title: "Assistências e Serviços",
                    items: [
                        { label: "Despesas com Pet (cães e gatos)", value: "$ 250,00" },
                        { label: "Despesas com Pet (cães e gatos) por interrupção", value: "$ 300,00" },
                        { label: "Despesas jurídicas", value: "$ 500,00" },
                        { label: "Fianças e despesas legais", value: "$ 2.000,00" },
                        { label: "Cobertura de incêndio na residência durante a viagem", value: "$ 4.000,00" },
                        { label: "Envio de executivo em caso de hospitalização do segurado", value: "Classe econômica" },
                        { label: "Acompanhante em caso de hospitalização", value: "Classe econômica" },
                        { label: "Hospedagem de acompanhante (até 10 dias)", value: "$ 80,00 / dia" },
                        { label: "Retorno de acompanhantes", value: "Classe econômica" },
                        { label: "Retorno de menores", value: "Classe econômica" },
                        { label: "Garantia de viagem de regresso", value: "$ 500,00" },
                        { label: "Prorrogação de estadia (até 10 dias)", value: "$ 80,00 / dia" },
                    ],
                }],
                oneWay: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "$ 7.000,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas em viagem", value: "$ 10.000,00" },
                        { label: "Traslado médico", value: "$ 10.000,00" },
                        { label: "Regresso sanitário", value: "$ 10.000,00" },
                        { label: "Traslado de corpo", value: "$ 10.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "$ 250,00" },
                        { label: "Atraso de bagagem", value: "$ 150,00" },
                        { label: "Atraso de voo", value: "$ 250,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento de viagem", value: "$ 250,00" },
                    ],
                }],
            },
            estadosUnidos: {
                goAndBack: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "$ 13.000,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas em viagem", value: "$ 25.000,00" },
                        { label: "Despesas farmacêuticas", value: "$ 200,00" },
                        { label: "Traslado médico", value: "$ 25.000,00" },
                        { label: "Regresso sanitário", value: "$ 2.500,00" },
                        { label: "Traslado de corpo", value: "$ 2.500,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "$ 500,00" },
                        { label: "Atraso de bagagem", value: "$ 100,00" },
                        { label: "Atraso de voo", value: "$ 200,00" },
                        { label: "Perda, dano e roubo de documentos durante a viagem", value: "$ 300,00" },
                        { label: "Roubo/furto de celular", value: "$ 700,00" },
                        { label: "Roubo/furto de notebook", value: "$ 700,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento Plus Reason", value: "$ 500,00" },
                    ],
                }, {
                    title: "Assistências e Serviços",
                    items: [
                        { label: "Despesas com Pet (cães e gatos)", value: "$ 250,00" },
                        { label: "Despesas com Pet (cães e gatos) por interrupção", value: "$ 300,00" },
                        { label: "Despesas jurídicas", value: "$ 1.000,00" },
                        { label: "Fianças e despesas legais", value: "$ 4.000,00" },
                        { label: "Cobertura de incêndio na residência durante a viagem", value: "$ 6.500,00" },
                        { label: "Envio de executivo em caso de hospitalização do segurado", value: "Classe econômica" },
                        { label: "Acompanhante em caso de hospitalização (até 10 dias)", value: "$ 80,00 / dia" },
                        { label: "Retorno de acompanhantes", value: "Classe econômica" },
                        { label: "Retorno de menores", value: "Classe econômica" },
                        { label: "Garantia de viagem de regresso", value: "$ 500,00" },
                        { label: "Prorrogação de estadia (até 10 dias)", value: "$ 80,00 / dia" },
                    ],
                }],
                oneWay: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "$ 10.000,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas em viagem", value: "$ 10.000,00" },
                        { label: "Traslado médico", value: "$ 10.000,00" },
                        { label: "Regresso sanitário", value: "$ 10.000,00" },
                        { label: "Traslado de corpo", value: "$ 10.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "$ 500,00" },
                        { label: "Atraso de bagagem", value: "$ 150,00" },
                        { label: "Atraso de voo", value: "$ 500,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento de viagem", value: "$ 500,00" },
                    ],
                }],
            },
            europa: {
                goAndBack: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "€ 15.000,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas em viagem", value: "€ 30.000,00" },
                        { label: "Despesas farmacêuticas", value: "€ 200,00" },
                        { label: "Traslado médico", value: "€ 30.000,00" },
                        { label: "Regresso sanitário", value: "€ 30.000,00" },
                        { label: "Traslado de corpo", value: "€ 30.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "€ 300,00" },
                        { label: "Atraso de bagagem", value: "€ 100,00" },
                        { label: "Atraso de voo", value: "€ 200,00" },
                        { label: "Perda, dano e roubo de documentos durante a viagem", value: "€ 300,00" },
                        { label: "Roubo/furto de celular", value: "€ 700,00" },
                        { label: "Roubo/furto de notebook", value: "€ 700,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento Plus Reason", value: "€ 500,00" },
                    ],
                }, {
                    title: "Assistências e Serviços",
                    items: [
                        { label: "Despesas com Pet (cães e gatos)", value: "€ 250,00" },
                        { label: "Despesas com Pet (cães e gatos) por interrupção", value: "€ 300,00" },
                        { label: "Despesas jurídicas", value: "€ 1.000,00" },
                        { label: "Fianças e despesas legais", value: "€ 4.000,00" },
                        { label: "Cobertura de incêndio na residência durante a viagem", value: "€ 6.000,00" },
                        { label: "Envio de executivo em caso de hospitalização do segurado", value: "Classe econômica" },
                        { label: "Acompanhante em caso de hospitalização", value: "Classe econômica" },
                        { label: "Hospedagem de acompanhante (até 10 dias)", value: "€ 80,00 / dia" },
                        { label: "Retorno de acompanhantes", value: "Classe econômica" },
                        { label: "Retorno de menores", value: "Classe econômica" },
                        { label: "Garantia de viagem de regresso", value: "€ 500,00" },
                        { label: "Prorrogação de estadia (até 10 dias)", value: "€ 80,00 / dia" },
                    ],
                }],
                oneWay: [{
                    title: "Acidentes Pessoais",
                    items: [
                        { label: "Morte em viagem", value: "€ 1.000,00" },
                    ],
                }, {
                    title: "Incidentes Médicos",
                    items: [
                        { label: "Despesas médicas, hospitalares e odontológicas em viagem", value: "€ 1.000,00" },
                        { label: "Traslado médico", value: "€ 1.000,00" },
                        { label: "Regresso sanitário", value: "€ 1.000,00" },
                        { label: "Traslado de corpo", value: "€ 1.000,00" },
                    ],
                }, {
                    title: "Inconvenientes",
                    items: [
                        { label: "Perda de bagagem em transporte aéreo", value: "€ 500,00" },
                        { label: "Atraso de bagagem", value: "€ 150,00" },
                        { label: "Atraso de voo", value: "€ 500,00" },
                    ],
                }, {
                    title: "Cancelamento de Viagem",
                    tag: "Novo",
                    items: [
                        { label: "Cancelamento de viagem", value: "€ 500,00" },
                    ],
                }],
            },
        };

        const mainCheckoutObserver = new MutationObserver(mainElementObserverCallback);
        const reviewCheckoutObserver = new MutationObserver(reviewCheckoutObserverCallback);

        const maximumAttempts = 100;
        let attempts = 0;
        let isProcessingCheckoutStep = false;
        let checkoutStepDebounceTimer = null;
        let reviewInjectDebounceTimer = null;

        // Labels estáveis para Adobe Analytics (eVar84) — facilita filtrar vendas por região.
        const REGION_ANALYTICS_LABELS = {
            brasil: "nacional",
            americaDoSul: "america_do_sul",
            estadosUnidos: "eua",
            europa: "europa",
        };

        const TRIP_ANALYTICS_LABELS = {
            goAndBack: "ida_e_volta",
            oneWay: "somente_ida",
        };

        init();

        function init() {
            const mainElement = document.querySelector("main");

            if (!mainElement && attempts < maximumAttempts) {
                attempts++;
                console.log("[AT] Main element not found. Waiting until it appears for maximum 100 attempts...", attempts);
                requestAnimationFrame(init);
                return;
            }

            injectCustomCSS();
            mainCheckoutObserver.observe(document.querySelector("main"), {
                childList: true,
                subtree: false
            });

            handleCheckoutStepChange();
        }

        function handleCheckoutStepChange() {
            if (!isOneCheckoutStep()) {
                cleanupInjectedExperience();
                disconnectObservers();
                console.log("[AT] User left the checkout page, observers disconnected.");
                return;
            }

            if (!isReviewStep()) {
                // Em etapas anteriores só observamos a SPA; não coletamos nem injetamos.
                cleanupInjectedExperience();
                console.log("[AT] Waiting for /review to inject insurance experience.");
                return;
            }

            toggleMainElementExperienceClass(true);
            tryInjectInsurance();
            initReviewObserver();
        }

        function mainElementObserverCallback(mutations) {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                    if (checkoutStepDebounceTimer) {
                        clearTimeout(checkoutStepDebounceTimer);
                    }

                    checkoutStepDebounceTimer = setTimeout(function() {
                        if (isProcessingCheckoutStep) {
                            return;
                        }

                        isProcessingCheckoutStep = true;

                        try {
                            handleCheckoutStepChange();
                        } finally {
                            isProcessingCheckoutStep = false;
                        }
                    }, 200);

                    return;
                }
            }
        }

        function cleanupInjectedExperience() {
            document.querySelector(".injectedInsuranceWrapper")?.remove();
            document.querySelector(".injectedInsuranceModal")?.remove();
            toggleMainElementExperienceClass(false);
            reviewCheckoutObserver.disconnect();
        }

        function initReviewObserver() {
            const azulPageFragment = document.querySelectorAll(SELECTORS.azulPageFragment);
            const luggageFragment = azulPageFragment[1] ||
                document.querySelector(SELECTORS.luggageContainer) ||
                document.querySelector("main");

            if (luggageFragment) {
                reviewCheckoutObserver.disconnect();
                reviewCheckoutObserver.observe(luggageFragment, {
                    childList: true,
                    subtree: true
                });
            }
        }

        function tryInjectInsurance() {
            if (!isReviewStep()) {
                return;
            }

            const insuranceBanner = document.querySelector(SELECTORS.insuranceBanner);

            if (!insuranceBanner) {
                return;
            }

            injectInsuranceContainer(insuranceBanner);
        }

        function reviewCheckoutObserverCallback(mutations) {
            if (!isReviewStep()) {
                cleanupInjectedExperience();
                return;
            }

            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                    if (reviewInjectDebounceTimer) {
                        clearTimeout(reviewInjectDebounceTimer);
                    }

                    reviewInjectDebounceTimer = setTimeout(function() {
                        tryInjectInsurance();
                    }, 200);

                    return;
                }
            }
        }

        function toggleMainElementExperienceClass(addClass = true) {
            const mainElement = document.querySelector("main");
            mainElement?.classList.toggle("injectedInsuranceExperience", addClass);
        }

        function injectInsuranceContainer(insuranceBanner) {
            if (!isReviewStep()) {
                return;
            }

            if (!insuranceBanner) {
                console.log("[AT] Insurance banner not found.");
                return;
            }

            listenerToSubmitButton();

            const insuranceInjectedAlreadyExists = document.querySelector(".injectedInsuranceWrapper");

            if (insuranceInjectedAlreadyExists) {
                console.log("[AT] Insurance injected already exists.");
                return;
            }

            analyticsEvent("insurance_injected", "view");

            // Disconnect observers to avoid double injection or infinite loop
            reviewCheckoutObserver.disconnect();

            const insuranceElement = createInsuranceElement(insuranceBanner);
            insuranceBanner.insertAdjacentElement("afterend", insuranceElement);
            insuranceBanner.style.display = "none";

            addListenersToInjections();

            // Reconnect observers
            initReviewObserver();
        }

        function hasGoAndBackTrip() {
            return document.querySelectorAll(SELECTORS.tripsList).length > 1;
        }

        function getBenefitsByTrip() {
            return hasGoAndBackTrip() ?
                BENEFITS_BY_TRIP.goAndBack :
                BENEFITS_BY_TRIP.oneWay;
        }

        /**
         * Remove acentos e normaliza para minúsculas, facilitando a comparação de textos do DOM.
         * @param {string} text
         * @returns {string}
         */
        function normalizeText(text) {
            return (text || "")
                .replace(/\u00a0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();
        }

        function findElementByText(selector, expectedText) {
            const elements = Array.from(document.querySelectorAll(selector));
            const normalizedExpected = normalizeText(expectedText);

            return elements.find(element => normalizeText(element.textContent).includes(normalizedExpected)) || null;
        }

        /**
         * Localiza o accordion nativo do seguro ("Seguro Viagem Nacional:", por exemplo).
         * A busca fica restrita ao main para não capturar links do header do site.
         * @returns {HTMLElement|null}
         */
        function getNativeInsuranceAccordionButton() {
            const scope = document.querySelector("main") || document;
            const buttons = Array.from(scope.querySelectorAll("button"));

            return buttons.find(button => normalizeText(button.textContent).startsWith("seguro viagem")) || null;
        }

        /**
         * Reúne os textos da página que podem indicar a região do seguro, em ordem de confiança.
         * @returns {string[]}
         */
        function getRegionTextSources() {
            const sources = [];

            const nativeCoverageTitle = document.querySelector(SELECTORS.nativeCoverageTitle);
            if (nativeCoverageTitle) {
                sources.push(nativeCoverageTitle.textContent);
            }

            const accordionButton = getNativeInsuranceAccordionButton();
            if (accordionButton) {
                sources.push(accordionButton.textContent);
            }

            const topicLink = document.querySelector("a[href*='topic=']");
            if (topicLink) {
                sources.push(decodeURIComponent(topicLink.getAttribute("href")));
            }

            const insuranceBanner = document.querySelector(SELECTORS.insuranceBanner);
            if (insuranceBanner) {
                sources.push(insuranceBanner.textContent);
            }

            return sources;
        }

        /**
         * Identifica se o voo é Nacional, América do Sul, Estados Unidos ou Europa.
         * Pode ser forçado via window.AT_INS_REGION_OVERRIDE para validação em QA.
         * @returns {string} chave de REGIONS
         */
        function detectFlightRegion() {
            const override = window.AT_INS_REGION_OVERRIDE;

            if (override && REGIONS[override]) {
                console.log("[AT] Região do seguro forçada via override:", override);
                return override;
            }

            const sources = getRegionTextSources();

            for (const source of sources) {
                const normalizedSource = normalizeText(source);

                const matcher = REGION_MATCHERS.find(item =>
                    item.keywords.some(keyword => normalizedSource.includes(keyword))
                );

                if (matcher) {
                    console.log("[AT] Região identificada por:", normalizedSource.slice(0, 80));
                    return matcher.region;
                }
            }

            console.log("[AT] Região do seguro não identificada, usando Nacional como padrão.");
            return "brasil";
        }

        /**
         * Identifica o tipo de trecho priorizando o título da tabela nativa e,
         * na ausência dele, a quantidade de abas de voo.
         * @returns {string} chave de TRIP_TYPES
         */
        function detectTripType() {
            const override = window.AT_INS_TRIP_OVERRIDE;

            if (override && TRIP_TYPES[override]) {
                console.log("[AT] Tipo de trecho forçado via override:", override);
                return override;
            }

            const nativeCoverageTitle = document.querySelector(SELECTORS.nativeCoverageTitle);
            const nativeTitleText = normalizeText(nativeCoverageTitle?.textContent);

            if (nativeTitleText.includes("trecho unico") || nativeTitleText.includes("somente ida")) {
                return TRIP_TYPES.oneWay;
            }

            if (nativeTitleText.includes("ida e volta")) {
                return TRIP_TYPES.goAndBack;
            }

            return hasGoAndBackTrip() ? TRIP_TYPES.goAndBack : TRIP_TYPES.oneWay;
        }

        /**
         * Lê a descrição do seguro exibida pelo componente nativo, quando disponível.
         * @returns {string}
         */
        function scrapeRegionDescription() {
            const accordionButton = getNativeInsuranceAccordionButton();
            const container = accordionButton?.parentElement;
            const richText = container?.querySelector(SELECTORS.nativeRichText);

            if (!richText) {
                return "";
            }

            const paragraphs = Array.from(richText.querySelectorAll("p"))
                .map(paragraph => paragraph.textContent.replace(/\u00a0/g, " ").trim())
                .filter(text => text.length > 40);

            return paragraphs[0] || "";
        }

        /**
         * Lê o total do seguro exibido pelo componente nativo. Quando ainda não está
         * renderizado, devolve o preço por viajante do banner como alternativa.
         * @returns {{total: string, perPerson: string, fallback: string}}
         */
        function getInsurancePriceInfo() {
            const priceInfo = { total: "", perPerson: "", fallback: "" };
            const totalHeading = findElementByText("h3", "total a pagar de seguro viagem");
            const totalValueElement = totalHeading?.nextElementSibling;

            if (totalValueElement) {
                const strongElement = totalValueElement.querySelector("strong");
                const perPersonMatch = totalValueElement.textContent.match(/\(([^)]+)\)/);

                priceInfo.total = (strongElement?.textContent || "").replace(/\u00a0/g, " ").trim();
                priceInfo.perPerson = perPersonMatch ? perPersonMatch[1].replace(/\u00a0/g, " ").trim() : "";
            }

            const bannerPrice = document.querySelector(SELECTORS.insurancePrice);
            priceInfo.fallback = (bannerPrice?.textContent || "").replace(/\u00a0/g, " ").trim();

            return priceInfo;
        }

        /**
         * Monta todo o contexto usado pelo modal de detalhes.
         */
        function getInsuranceContext() {
            const region = detectFlightRegion();
            const tripType = detectTripType();
            const regionConfig = REGIONS[region];

            const context = {
                region,
                tripType,
                regionConfig,
                tripLabel: TRIP_TYPE_LABELS[tripType],
                description: scrapeRegionDescription() || regionConfig.description,
                groups: COVERAGE_BY_REGION[region][tripType] || [],
                price: getInsurancePriceInfo(),
            };

            console.log("[AT] Contexto do seguro:", region, tripType);

            return context;
        }

        function appendBenefitsToList(listElement) {
            if (!listElement) {
                return;
            }

            const benefits = getBenefitsByTrip();

            benefits.forEach((text) => {
                const li = document.createElement("li");
                li.className = "injectedInsuranceWrapper__benefits__item";
                li.innerHTML = NATIVE_BENEFIT_ICON;

                const span = document.createElement("span");
                span.textContent = text;
                li.appendChild(span);

                listElement.appendChild(li);
            });
        }

        function listenerToSubmitButton() {
            const submitButton = document.querySelector(SELECTORS.buttonSubmitCheckout);
            submitButton?.removeEventListener("click", handleSubmitButton);
            submitButton?.addEventListener("click", handleSubmitButton);
        }

        function handleSubmitButton(event) {
            if (event.isInsuranceChecked) {
                console.log("[AT] Submit button already clicked.");
                return;
            }

            const typeEvent = event.target.textContent;
            if (typeEvent == "Próximo voo" || typeEvent == "Próximo vooPróximo voo") {
                return;
            }

            console.log("[AT] Submit button clicked.", typeEvent);

            const userWantsInsurance = document.querySelector("input#insurance_yes")?.checked;

            if (!userWantsInsurance) {
                return;
            }

            analyticsEvent("insurance_proceed_with", "click");

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const addedInsurance = document.querySelector(SELECTORS.buttonAdderInsurance);
            addedInsurance.click();

            waitUntilSubmitButtonRefresh();
        }

        function waitUntilSubmitButtonRefresh() {
            const submitButton = document.querySelector(SELECTORS.buttonSubmitCheckout);

            if (!submitButton) {
                console.log("[AT] Submit button not found yet, wait...");
                requestAnimationFrame(waitUntilSubmitButtonRefresh);
                return;
            }

            const newEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            });

            newEvent.isInsuranceChecked = true;
            submitButton.dispatchEvent(newEvent);
        }

        function createInsuranceElement(insuranceBanner) {
            const div = document.createElement("div");
            div.classList.add("injectedInsuranceWrapper");

            div.innerHTML = '\n            <div class="injectedInsuranceWrapper__header">\n                <h3 class="injectedInsuranceWrapper__header__title">\n                    <svg fill=none height=36 viewBox="0 0 30 36"width=30 xmlns=http://www.w3.org/2000/svg><g clip-path=url(#clip0_3119_440)><path d="M15.5195 0.164664C15.2083 -0.054888 14.7927 -0.054888 14.4816 0.164664C10.1933 3.19091 5.96358 4.66364 1.78126 4.66364C1.3639 4.66364 1.0013 4.95057 0.905358 5.35675C-0.124216 9.71561 -0.278162 14.0895 0.456304 18.1599C1.87434 26.0185 6.60921 32.738 14.668 35.9365C14.8812 36.0212 15.1188 36.0212 15.332 35.9365C23.3908 32.738 28.1257 26.0185 29.5437 18.1599C30.2782 14.0895 30.1242 9.71561 29.0946 5.35675C28.9987 4.95057 28.6361 4.66364 28.2188 4.66364C24.0365 4.66364 19.8078 3.19094 15.5195 0.164664Z"fill=#BAEAF2 /></g><g clip-path=url(#clip1_3119_440)><path d="M29.5517 18.1602C28.133 26.0187 23.3951 32.738 15.3322 35.9366C15.1188 36.0212 14.8812 36.0212 14.6678 35.9366C6.60473 32.738 1.86705 26.0188 0.448256 18.1602C0.438648 18.107 0.431179 18.0534 0.421875 18H29.5781C29.5688 18.0534 29.5613 18.107 29.5517 18.1602Z"fill=#88DAE9 /></g><g clip-path=url(#clip2_3119_440)><path d="M14.4816 0.164664C14.7927 -0.054888 15.2083 -0.054888 15.5195 0.164664C19.8078 3.19094 24.0365 4.66364 28.2188 4.66364C28.6361 4.66364 28.9987 4.95057 29.0946 5.35675C30.1242 9.71561 30.2782 14.0895 29.5437 18.1599C28.1257 26.0185 23.3908 32.738 15.332 35.9365C15.1188 36.0212 14.8812 36.0212 14.668 35.9365C6.60921 32.738 1.87434 26.0185 0.456304 18.1599C-0.278162 14.0895 -0.124216 9.71561 0.905358 5.35675C1.0013 4.95057 1.3639 4.66364 1.78126 4.66364C5.96358 4.66364 10.1933 3.19091 14.4816 0.164664ZM2.50408 6.45034C1.66685 10.36 1.57832 14.2414 2.2277 17.8402C3.52905 25.0522 7.78873 31.136 15 34.1287C22.2113 31.136 26.4709 25.0522 27.7723 17.8402C28.4217 14.2414 28.3332 10.36 27.4959 6.45034C23.2882 6.29553 19.1194 4.78996 15.0005 1.99452C10.8815 4.78999 6.71189 6.29553 2.50408 6.45034Z"fill=#60BECF clip-rule=evenodd fill-rule=evenodd /></g><defs><clipPath id=clip0_3119_440><rect fill=white height=36 width=30 /></clipPath><clipPath id=clip1_3119_440><rect fill=white height=18 width=29.1562 transform="translate(0.421875 18)"/></clipPath><clipPath id=clip2_3119_440><rect fill=white height=36 width=30 /></clipPath></defs></svg>Deseja obter o Seguro Viagem?\n                </h3>\n                <button class="injectedInsuranceWrapper__header__detailsCta">Ver detalhes</button>\n            </div>\n            <form class="injectedInsuranceWrapper__form">\n                <div class="injectedInsuranceWrapper__form__wrapper">\n                    <input type="radio" name="insurances" id="insurance_yes">\n                    <label for="insurance_yes" class="injectedInsuranceWrapper__label">\n                        <span class="injectedInsuranceWrapper__label__badge">Recomendado</span>\n                        <div class="injectedInsuranceWrapper__label__header">\n                            <div class="injectedInsuranceWrapper__label__price">\n                                <span>A partir de:</span>\n                                <h4 class="injectedInsuranceWrapper__label__price__value">Preço N/D <span>/viajante</span></h4>\n                            </div>\n                            <div class="injectedInsuranceWrapper__label__fakedRadio">\n                                <div class="injectedInsuranceWrapper__label__fakedRadio__radio"></div> Sim, quero o seguro!\n                            </div>\n                        </div>\n                        <div class="injectedInsuranceWrapper__label__content">\n                            <ul class="injectedInsuranceWrapper__benefits"></ul>\n                        </div>\n                    </label>\n                </div>\n                <div class="injectedInsuranceWrapper__form__wrapper">\n                    <input type="radio" name="insurances" id="insurance_no" checked>\n                    <label for="insurance_no" class="injectedInsuranceWrapper__label">\n                        <div class="injectedInsuranceWrapper__label__header">\n                            <h4 class="injectedInsuranceWrapper__label__title">Sem Seguro Viagem</h4>\n                            <div class="injectedInsuranceWrapper__label__fakedRadio">\n                                <div class="injectedInsuranceWrapper__label__fakedRadio__radio"></div> Não, viajarei desprotegido\n                            </div>\n                        </div>\n                        <div class="injectedInsuranceWrapper__label__content">\n                            <h5 class="injectedInsuranceWrapper__label__subtitle">Prefere viajar sem seguro?</h5>\n                            <p class="injectedInsuranceWrapper__label__description">Proteção nunca é demais! Garanta o seguro viagem para uma experiência mais tranquila.</p>\n                        </div>\n                    </label>\n                </div>\n            </form>';

            appendBenefitsToList(div.querySelector(".injectedInsuranceWrapper__benefits"));

            const insurancePrice = document.querySelector(SELECTORS.insurancePrice);

            if (insurancePrice) {
                const priceElementDiv = div.querySelector(".injectedInsuranceWrapper__label__price__value");

                if (priceElementDiv) {
                    priceElementDiv.innerHTML = insurancePrice.textContent + " <span>/viajante</span>";
                }
            }

            return div;
        }

        /**
         * Cria um accordion do modal de detalhes.
         * Sem template literals: Adobe Target corrompe ${...} no delivery do offer.
         */
        function createAccordion(title, content, options) {
            options = options || {};
            const tag = options.tag
                ? '<span class="injectedInsuranceModal__accordion__tag">' + options.tag + '</span>'
                : "";
            const openClass = options.isOpen ? " is-open" : "";
            const trackingId = options.trackingId || normalizeText(title).replace(/[^a-z0-9]+/g, "_");

            return ''
                + '<div class="injectedInsuranceModal__accordion' + openClass + '" data-accordion="' + trackingId + '">'
                + '<button type="button" class="injectedInsuranceModal__accordion__trigger" aria-expanded="' + Boolean(options.isOpen) + '">'
                + '<span class="injectedInsuranceModal__accordion__title">' + title + '</span>'
                + tag
                + '<span class="injectedInsuranceModal__accordion__icon">' + ACCORDION_ICON + '</span>'
                + '</button>'
                + '<div class="injectedInsuranceModal__accordion__panel">'
                + '<div class="injectedInsuranceModal__accordion__panelContent">' + content + '</div>'
                + '</div>'
                + '</div>';
        }

        function createCoverageAccordions(context) {
            if (!context.groups.length) {
                return "";
            }

            return context.groups.map(function(group, index) {
                const items = group.items.map(function(item) {
                    return ''
                        + '<li class="injectedInsuranceModal__coverage__item">'
                        + '<span class="injectedInsuranceModal__coverage__label">' + item.label + ':</span>'
                        + '<span class="injectedInsuranceModal__coverage__value">' + item.value + '</span>'
                        + '</li>';
                }).join("");

                return createAccordion(
                    group.title,
                    '<ul class="injectedInsuranceModal__coverage">' + items + '</ul>',
                    {
                        tag: group.tag,
                        isOpen: index === 0,
                    }
                );
            }).join("");
        }

        function createPriceBlock(context) {
            const total = context.price.total;
            const perPerson = context.price.perPerson;
            const fallback = context.price.fallback;

            if (total) {
                const perPersonText = perPerson
                    ? '<span class="injectedInsuranceModal__price__detail">(' + perPerson + ')</span>'
                    : "";

                return ''
                    + '<div class="injectedInsuranceModal__price">'
                    + '<h4 class="injectedInsuranceModal__price__label">Total a pagar de seguro viagem:</h4>'
                    + '<p class="injectedInsuranceModal__price__value">' + total + ' ' + perPersonText + '</p>'
                    + '</div>';
            }

            if (!fallback) {
                return "";
            }

            return ''
                + '<div class="injectedInsuranceModal__price">'
                + '<h4 class="injectedInsuranceModal__price__label">Valor do seguro viagem:</h4>'
                + '<p class="injectedInsuranceModal__price__value">' + fallback
                + ' <span class="injectedInsuranceModal__price__detail">por viajante</span></p>'
                + '</div>';
        }

        function createLegalContent(context) {
            const saibaMaisLink = (context && context.regionConfig && context.regionConfig.saibaMaisLink)
                || "https://www.voeazul.com.br/assistencia-viagem/nacional/assistencias";

            return ''
                + '<p>Após a compra você receberá o certificado/bilhete de seguro que será encaminhado via email no momento da confirmação do pagamento do seguro. <b>Atenção!</b> Seguro viagem não é seguro saúde. <a href="'
                + saibaMaisLink
                + '" target="_blank" rel="noopener noreferrer">Saiba mais</a>.</p>';
        }

        function createRegulatoryItem() {
            return ''
                + '<p class="injectedInsuranceModal__regulatory">'
                + 'Ao continuar com a contratação, você confirma que leu, compreendeu e concorda com os '
                + TERMS_LINK_HTML
                + '.'
                + '</p>';
        }

        function createAndAppendInsuranceModal() {
            if (!isReviewStep()) {
                console.log("[AT] Modal blocked: data collection only runs on /review.");
                return null;
            }

            const existingModal = document.querySelector(".injectedInsuranceModal");
            if (existingModal) {
                existingModal.remove();
            }

            const context = getInsuranceContext();

            if (!context || !context.regionConfig) {
                console.log("[AT] Insurance context unavailable.");
                return null;
            }

            const div = document.createElement("div");
            div.classList.add("injectedInsuranceModal");

            const currencyNote = context.regionConfig.currencyNote
                ? '<p class="injectedInsuranceModal__note">' + context.regionConfig.currencyNote + '</p>'
                : "";

            const aboutContent = ''
                + '<p>' + context.description + '</p>'
                + '<a href="' + context.regionConfig.link + '" target="_blank" rel="noopener noreferrer" class="injectedInsuranceModal__link">Conheça todas as coberturas e condições</a>';

            div.innerHTML = ''
                + '<div class="injectedInsuranceModal__wrapper">'
                + '<div class="injectedInsuranceModal__header">'
                + '<button class="injectedInsuranceModal__close" title="Fechar">'
                + '<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_3095_34380)"><g clip-path="url(#clip1_3095_34380)"><path d="M20.2454 5.56379L13.6603 12.0002L20.2455 18.4364L18.5853 20.0591L12 13.6227L5.41473 20.0591L3.75439 18.4363L10.3398 12.0002L3.75454 5.56379L5.41473 3.94116L12 10.3775L18.5852 3.94116L20.2454 5.56379Z" fill="#606060"></path></g></g><defs><clipPath id="clip0_3095_34380"><rect fill="white" height="24" width="24"></rect></clipPath><clipPath id="clip1_3095_34380"><rect fill="white" height="24" width="24"></rect></clipPath></defs></svg>'
                + '</button>'
                + '<h3 class="injectedInsuranceModal__title">Sobre o Seguro Viagem</h3>'
                + '</div>'
                + '<div class="injectedInsuranceModal__content">'
                + '<div class="injectedInsuranceModal__context">'
                + '<span class="injectedInsuranceModal__context__region">' + context.regionConfig.label + '</span>'
                + '<span class="injectedInsuranceModal__context__trip">' + context.tripLabel + '</span>'
                + '</div>'
                + createPriceBlock(context)
                + createAccordion(context.regionConfig.label, aboutContent, { isOpen: true, trackingId: "sobre_seguro" })
                + '<div class="injectedInsuranceModal__coverageWrapper">'
                + '<h4 class="injectedInsuranceModal__benefits_title">' + context.regionConfig.coverageLabel + ' — ' + context.tripLabel + '</h4>'
                + currencyNote
                + createCoverageAccordions(context)
                + '</div>'
                + createAccordion("Informações importantes", createLegalContent(context), { trackingId: "informacoes_importantes" })
                + createRegulatoryItem()
                + '</div>'
                + '</div>';

            document.body.appendChild(div);
            addListenersToModal(div);

            return div;
        }

        function addListenersToModal(modalElement) {
            addListenersToAccordions(modalElement);

            const closeButton = modalElement.querySelector(".injectedInsuranceModal__close");
            closeButton?.addEventListener("click", () => {
                modalElement.classList.remove("show");
            });

            modalElement.addEventListener("click", (event) => {
                if (event.target === modalElement) {
                    modalElement.classList.remove("show");
                }
            });
        }

        function addListenersToAccordions(modalElement) {
            const accordions = modalElement.querySelectorAll(".injectedInsuranceModal__accordion");

            accordions.forEach(function(accordion) {
                const trigger = accordion.querySelector(".injectedInsuranceModal__accordion__trigger");
                const panel = accordion.querySelector(".injectedInsuranceModal__accordion__panel");

                if (!trigger || !panel) {
                    return;
                }

                if (trigger.getAttribute("data-analytics-added") === "true") {
                    return;
                }

                trigger.setAttribute("data-analytics-added", "true");

                if (accordion.classList.contains("is-open")) {
                    panel.style.maxHeight = "none";
                }

                trigger.addEventListener("click", function() {
                    const willOpen = !accordion.classList.contains("is-open");

                    accordion.classList.toggle("is-open", willOpen);
                    trigger.setAttribute("aria-expanded", String(willOpen));
                    panel.style.maxHeight = willOpen ? panel.scrollHeight + "px" : "0px";

                    if (willOpen) {
                        analyticsEvent("details_accordion_" + accordion.dataset.accordion, "click");
                    }
                });
            });
        }

        function addListenersToInjections() {
            const insuranceInput = document.querySelectorAll("input[name=insurances]");

            insuranceInput.forEach(function(input) {
                if (input.getAttribute("data-analytics-added") === "true") {
                    return;
                }

                input.setAttribute("data-analytics-added", "true");

                input.addEventListener("click", function() {
                    const checkedInput = document.querySelector("input[name=insurances]:checked");
                    const isYesInput = checkedInput && checkedInput.id === "insurance_yes";

                    analyticsEvent(
                        isYesInput ? "insurance_yes_selected" : "insurance_no_selected",
                        "click"
                    );
                });
            });

            const detailsButton = document.querySelector(".injectedInsuranceWrapper__header__detailsCta");

            if (detailsButton && detailsButton.getAttribute("data-analytics-added") !== "true") {
                detailsButton.setAttribute("data-analytics-added", "true");

                detailsButton.addEventListener("click", function() {
                    analyticsEvent("details_button_click", "click");

                    // Recria o modal a cada abertura porque região, trecho e valores
                    // só ficam disponíveis conforme o componente nativo renderiza.
                    const modalInsuranceDetails = createAndAppendInsuranceModal();
                    if (modalInsuranceDetails) {
                        modalInsuranceDetails.classList.add("show");
                    }
                });
            }
        }

        function disconnectObservers() {
            mainCheckoutObserver.disconnect();
            reviewCheckoutObserver.disconnect();
            toggleMainElementExperienceClass(false);
        }

        function isOneCheckoutStep() {
            const urlPath = getURLPath();
            return CHECKOUT_URL_STEPS.some(step => urlPath.includes(step));
        }

        function isReviewStep() {
            // Coleta e injeção só em /home/review (e variantes com query).
            return getURLPath().includes("/review");
        }

        function getURLPath() {
            return window.location.pathname;
        }

        function getInsuranceExperienceCss() {
            return [
                '',
                '            .injectedInsuranceExperience .azul-page-fragment .modal-title__close {',
                '                display: none;',
                '            }',
                '',
                '            .injectedInsuranceWrapper {',
                '                border: solid 1px #C0C0C0;',
                '                padding: 24px 16px;',
                '                display: flex;',
                '                gap: 24px;',
                '                flex-direction: column;',
                '                border-radius: 10px;',
                '                max-width: 622px;',
                '                width: 100%;',
                '            }',
                '',
                '            .injectedInsuranceWrapper * {',
                '                font-family: "Arial", "Helvetica Neue", sans-serif;',
                '                line-height: normal;',
                '                box-sizing: border-box;',
                '            }',
                '',
                '            .injectedInsuranceWrapper h2,',
                '            .injectedInsuranceWrapper h3,',
                '            .injectedInsuranceWrapper h4,',
                '            .injectedInsuranceWrapper h5,',
                '            .injectedInsuranceWrapper h6,',
                '            .injectedInsuranceWrapper p {',
                '                margin: 0;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__header__title {',
                '                display: flex;',
                '                align-items: center;',
                '                color: #041E42;',
                '                font-size: 24px;',
                '                font-weight: 400;',
                '                gap: 16px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__header {',
                '                display: flex;',
                '                justify-content: space-between;',
                '                flex-wrap: wrap;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__header__detailsCta {',
                '                border: none;',
                '                background: transparent;',
                '                outline: none;',
                '                color: #026CB6;',
                '                cursor: pointer;',
                '                font-size: 14px;',
                '                font-weight: 400;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__form {',
                '                display: flex;',
                '                gap: 14px;',
                '                flex-wrap: wrap;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__form__wrapper {',
                '                width: calc(50% - 7px);',
                '            }',
                '            ',
                '            .injectedInsuranceWrapper__label {',
                '                border-radius: 16px;',
                '                display: flex;',
                '                position: relative;',
                '                flex-direction: column;',
                '                height: 382px;',
                '                width: 100%;',
                '                cursor: pointer;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__badge {',
                '                background-color: #041E42;',
                '                border-radius: 330px;',
                '                padding: 4px 12px;',
                '                position: absolute;',
                '                top: -11px;',
                '                left: 50%;',
                '                transform: translateX(-50%);',
                '                color: #FFFFFF;',
                '                font-weight: 700;',
                '                font-size: 12px;',
                '                text-align: center;',
                '                height: 22px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__price {',
                '                text-align: center;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__header,',
                '            .injectedInsuranceWrapper__label__content {',
                '                padding: 20px 10px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__header {',
                '                display: flex;',
                '                justify-content: center;',
                '                align-items: center;',
                '                flex-direction: column;',
                '                flex-grow: 1;',
                '                gap: 24px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label[for="insurance_yes"] .injectedInsuranceWrapper__label__header {',
                '                border: solid 2px #BAEAF2;',
                '                background-color: #F0F9FF;',
                '                border-radius: 10px 10px 0px 0px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label[for="insurance_yes"] .injectedInsuranceWrapper__label__content {',
                '                border: solid 2px #BAEAF2;',
                '                border-top: none;',
                '                border-radius: 0px 0px 10px 10px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label[for="insurance_no"] .injectedInsuranceWrapper__label__header {',
                '                border: solid 2px #C0C0C0;',
                '                border-radius: 10px 10px 0px 0px;',
                '                padding: 21px 15px;',
                '                justify-content: flex-start;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label[for="insurance_no"] .injectedInsuranceWrapper__label__content {',
                '                background-color: #F5F5F5;',
                '                border: solid 2px #C0C0C0;',
                '                border-top: none;',
                '                border-radius: 0px 0px 10px 10px;',
                '                padding: 16px 15px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__price > span {',
                '                color: #041E42;',
                '                font-size: 11px;',
                '                font-weight: 400;',
                '                margin-bottom: 12px;',
                '                display: block;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__price__value {',
                '                color: #041E42;',
                '                font-size: 32px;',
                '                font-weight: 700;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__price__value span {',
                '                color: #606060;',
                '                font-size: 11px;',
                '                font-weight: 400;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__fakedRadio {',
                '                display: flex;',
                '                align-items: center;',
                '                gap: 10px;',
                '                color: #444444;',
                '                font-size: 15px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label[for="insurance_yes"] .injectedInsuranceWrapper__label__fakedRadio {',
                '                color: #041E42;',
                '                font-size: 16px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__fakedRadio__radio {',
                '                height: 18px;',
                '                width: 18px;',
                '                border-radius: 100%;',
                '                border: solid 1px #606060;',
                '                position: relative;',
                '            }',
                '',
                '            input[name="insurances"] {',
                '                display: none;',
                '            }',
                '',
                '            input[name="insurances"]:checked + label .injectedInsuranceWrapper__label__fakedRadio__radio {',
                '                border-color: #026CB6;',
                '            }',
                '',
                '            input[name="insurances"]:checked + label .injectedInsuranceWrapper__label__fakedRadio__radio::before {',
                '                content: "";',
                '                height: 11px;',
                '                width: 11px;',
                '                background-color: #026CB6;',
                '                border-radius: 100%;',
                '                margin: auto;',
                '                display: block;',
                '                position: absolute;',
                '                top: 50%;',
                '                left: 50%;',
                '                transform: translate(-50%, -50%);',
                '            }',
                '',
                '            .injectedInsuranceWrapper__benefits {',
                '                padding: 0;',
                '                display: flex;',
                '                flex-direction: column;',
                '                gap: 10px;',
                '                list-style: none;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__benefits__item {',
                '                font-size: 12px;',
                '                font-weight: 400;',
                '                display: flex;',
                '                gap: 7.5px;',
                '                align-items: center;',
                '                color: #212121;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__benefits__item svg {',
                '                flex-shrink: 0;',
                '                width: 20px;',
                '                height: 20px;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__title {',
                '                color: #303030;',
                '                font-weight: 700;',
                '                font-size: 20px;',
                '                margin-bottom: 60px !important;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__subtitle {',
                '                color: #212121;',
                '                font-weight: 700;',
                '                font-size: 16px;',
                '                margin-bottom: 16px !important;',
                '            }',
                '',
                '            .injectedInsuranceWrapper__label__description {',
                '                font-size: 14px;',
                '                color: #4B4B4B;',
                '                font-weight: 400;',
                '            }',
                '',
                '            /* ============ MODAL ============ */',
                '',
                '            .injectedInsuranceModal * {',
                '                font-family: "Helvetica Neue", "Arial", sans-serif;',
                '                line-height: normal;',
                '                box-sizing: border-box;',
                '            }',
                '',
                '            .injectedInsuranceModal.show {',
                '                display: flex;',
                '            }',
                '',
                '            .injectedInsuranceModal {',
                '                position: fixed;',
                '                top: 0;',
                '                left: 0;',
                '                width: 100%;',
                '                height: 100%;',
                '                display: none;',
                '                align-items: center;',
                '                justify-content: center;',
                '                background: rgba(0, 0, 0, 0.5);',
                '                z-index: 9999;',
                '            }',
                '',
                '            .injectedInsuranceModal__wrapper {',
                '                background-color: #FFFFFF;',
                '                border: solid 1px #C0C0C0;',
                '                border-radius: 4px;',
                '                width: 523px;',
                '                max-height: 90vh;',
                '                display: flex;',
                '                flex-direction: column;',
                '            }',
                '',
                '            .injectedInsuranceModal__header {',
                '                border-bottom: solid 1px #C0C0C0;',
                '                padding: 20px 16px;',
                '                display: flex;',
                '                gap: 16px;',
                '                align-items: center;',
                '                flex-shrink: 0;',
                '            }',
                '',
                '            .injectedInsuranceModal__close {',
                '                background: transparent;',
                '                padding: 0;',
                '                margin: 0;',
                '                border: none;',
                '                cursor: pointer;',
                '            }',
                '',
                '            .injectedInsuranceModal__title {',
                '                margin: 0;',
                '                color: #041E42;',
                '                font-weight: 300;',
                '                font-size: 16px;',
                '            }',
                '',
                '            .injectedInsuranceModal__content {',
                '                padding: 16px;',
                '                overflow-y: auto;',
                '            }',
                '',
                '            .injectedInsuranceModal__benefits_title {',
                '                color: #606060;',
                '                font-size: 14px;',
                '                margin-bottom: 8px;',
                '            }',
                '',
                '            .injectedInsuranceModal__regulatory {',
                '                color: #606060;',
                '                font-size: 12px;',
                '                line-height: 1.45;',
                '                margin: 20px 0 0;',
                '            }',
                '',
                '            .injectedInsuranceModal__regulatory a {',
                '                color: #026CB6;',
                '            }',
                '',
                '            .injectedInsuranceModal__context {',
                '                display: flex;',
                '                align-items: center;',
                '                gap: 8px;',
                '                flex-wrap: wrap;',
                '                margin-bottom: 16px;',
                '            }',
                '',
                '            .injectedInsuranceModal__context__region {',
                '                background-color: #014E84;',
                '                border-radius: 4px;',
                '                color: #FFFFFF;',
                '                font-size: 13px;',
                '                font-weight: 700;',
                '                padding: 6px 12px;',
                '                display: flex;',
                '                align-items: center;',
                '                gap: 8px;',
                '            }',
                '',
                '            .injectedInsuranceModal__context__trip {',
                '                border: 1px solid #C0C0C0;',
                '                border-radius: 4px;',
                '                color: #041E42;',
                '                font-size: 13px;',
                '                padding: 6px 12px;',
                '            }',
                '',
                '            .injectedInsuranceModal__price {',
                '                border: 1px solid #EBEBEB;',
                '                box-shadow: 0px 1px 4px 0px #041E4229;',
                '                border-radius: 4px;',
                '                padding: 16px;',
                '                margin-bottom: 16px;',
                '            }',
                '',
                '            .injectedInsuranceModal__price__label {',
                '                color: #606060;',
                '                font-size: 13px;',
                '                font-weight: 400;',
                '                margin: 0 0 6px;',
                '            }',
                '',
                '            .injectedInsuranceModal__price__value {',
                '                color: #041E42;',
                '                font-size: 20px;',
                '                font-weight: 700;',
                '                margin: 0;',
                '            }',
                '',
                '            .injectedInsuranceModal__price__detail {',
                '                color: #606060;',
                '                font-size: 13px;',
                '                font-weight: 400;',
                '            }',
                '',
                '            .injectedInsuranceModal__note {',
                '                color: #606060;',
                '                font-size: 12px;',
                '                margin: 0 0 12px;',
                '            }',
                '',
                '            .injectedInsuranceModal__coverageWrapper {',
                '                margin-top: 24px;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion {',
                '                border: 1px solid #C0C0C0;',
                '                border-radius: 4px;',
                '                margin-bottom: 8px;',
                '                overflow: hidden;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__trigger {',
                '                background: transparent;',
                '                border: none;',
                '                cursor: pointer;',
                '                width: 100%;',
                '                padding: 14px 16px;',
                '                display: flex;',
                '                align-items: center;',
                '                gap: 8px;',
                '                text-align: left;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion.is-open .injectedInsuranceModal__accordion__trigger {',
                '                border-bottom: 1px solid #EBEBEB;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__title {',
                '                color: #041E42;',
                '                font-size: 14px;',
                '                font-weight: 700;',
                '                flex-grow: 1;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__tag {',
                '                background-color: #BAEAF2;',
                '                border-radius: 330px;',
                '                color: #041E42;',
                '                font-size: 11px;',
                '                font-weight: 700;',
                '                padding: 2px 10px;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__icon {',
                '                display: flex;',
                '                align-items: center;',
                '                flex-shrink: 0;',
                '                transform: rotate(180deg);',
                '                transition: transform 0.3s ease;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion.is-open .injectedInsuranceModal__accordion__icon {',
                '                transform: rotate(0deg);',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__panel {',
                '                max-height: 0;',
                '                overflow: hidden;',
                '                transition: max-height 0.3s ease;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__panelContent {',
                '                padding: 14px 16px;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__panelContent p {',
                '                color: #041E42;',
                '                font-size: 13px;',
                '                margin: 0 0 10px;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__panelContent p:last-child {',
                '                margin-bottom: 0;',
                '            }',
                '',
                '            .injectedInsuranceModal__accordion__panelContent a {',
                '                color: #026CB6;',
                '            }',
                '',
                '            .injectedInsuranceModal__link {',
                '                font-size: 13px;',
                '                color: #026CB6;',
                '            }',
                '',
                '            .injectedInsuranceModal__coverage {',
                '                list-style: none;',
                '                margin: 0;',
                '                padding: 0;',
                '                display: flex;',
                '                flex-direction: column;',
                '                gap: 10px;',
                '            }',
                '',
                '            .injectedInsuranceModal__coverage__item {',
                '                display: flex;',
                '                justify-content: space-between;',
                '                align-items: baseline;',
                '                gap: 16px;',
                '                font-size: 13px;',
                '            }',
                '',
                '            .injectedInsuranceModal__coverage__item + .injectedInsuranceModal__coverage__item {',
                '                border-top: 1px solid #EBEBEB;',
                '                padding-top: 10px;',
                '            }',
                '',
                '            .injectedInsuranceModal__coverage__label {',
                '                color: #606060;',
                '            }',
                '',
                '            .injectedInsuranceModal__coverage__value {',
                '                color: #041E42;',
                '                font-weight: 700;',
                '                white-space: nowrap;',
                '            }'
            ].join('\n');
        }

        function injectCustomCSS() {
            const styleId = "at-ins-no-default-style";

            if (document.getElementById(styleId)) {
                return;
            }

            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = getInsuranceExperienceCss();
            document.head.appendChild(style);
        }

        /**
         * Function to trigger an Adobe Analytics event.
         * @param {string} eventLabel - Label of the event to be triggered.
         */
        function getAnalyticsContext() {
            const region = detectFlightRegion();
            const tripType = detectTripType();
            const regionLabel = REGION_ANALYTICS_LABELS[region] || region;
            const tripLabel = TRIP_ANALYTICS_LABELS[tripType] || tripType;

            return {
                region: region,
                tripType: tripType,
                regionLabel: regionLabel,
                tripLabel: tripLabel,
                eVar84: regionLabel + "|" + tripLabel,
            };
        }

        /**
         * Disparo Adobe Analytics (padrao .context/rules/06-tracking.md).
         * eVar82 = acao | eVar84 = regiao|trecho (ex: europa|somente_ida)
         */
        function analyticsEvent(eventLabel, eventType) {
            if (!eventLabel) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const type = eventType || "click";
            const context = getAnalyticsContext();
            const labelEvent = experienceName + "_" + type + " " + eventLabel + " " + context.regionLabel;

            console.log("[AT] ANALYTICS_TRIGGERED:", labelEvent, "| eVar84:", context.eVar84);

            (function() {
                const s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
                if (!s || typeof s.tl !== "function") {
                    return;
                }

                s.linkTrackVars = "events,eVar82,eVar84";
                s.linkTrackEvents = "event90";
                s.events = "event90";
                s.eVar82 = labelEvent;
                s.eVar84 = context.eVar84;

                s.tl(true, "o", "target_activity_action");
            })();
        }

        window.AT_INS_DEBUG = {
            getContext: getInsuranceContext,
            getAnalyticsContext: getAnalyticsContext,
            detectRegion: detectFlightRegion,
            detectTrip: detectTripType,
            openModal: function() {
                const modal = createAndAppendInsuranceModal();
                if (modal) {
                    modal.classList.add("show");
                }
                return modal;
            },
        };
    }
})();