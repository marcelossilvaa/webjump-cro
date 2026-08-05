  (function () {
    const experienceName = "AT_EXPERIENCE_FARE_RADIO_SELECTION_MOBILE";
    const experienceAlreadyExecuted = window[experienceName] || false;

    function onExperienceTargetPage() {
        const currentUrl = window.location.pathname;
        const targetTestUrl = "/selecao-voo";
        const queryParams = window.location.search;
        const paramFlightMoneyPayment = "cc=BRL";

        return currentUrl.indexOf(targetTestUrl) !== -1 && queryParams.indexOf(paramFlightMoneyPayment) !== -1;
    }

    function initExperienceWhenReady() {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const isMobile = window.innerWidth < 1024;

        if (!isMobile) {
            console.log("[AT] Experience not executed. Not a mobile device.");
            return;
        }

        if (isReady) {
            experienceSetup();
        } else {
            document.addEventListener("DOMContentLoaded", experienceSetup);
        }
    }

    if (experienceAlreadyExecuted || !onExperienceTargetPage()) {
        console.log("[AT] Page is not a correct page OR script already executed.");
        return;
    }

    window[experienceName] = true;
    initExperienceWhenReady();

    function experienceSetup() {
        console.log("[AT] Experience started:", experienceName);

        const SELECTORS = {
            flightsWrapper: ".AzulPage .availability",
            flightCard: ".card-list .flight-card",
            fareItem: ".fare-item",
            selectedFareButton: "[data-test-id=\"select-fare-selected\"]",
            unselectedFareButton: "[data-test-id=\"select-fare\"]",
            fareTypeLabel: "p.promotional",
            recommendedFlag: "span[aria-label=\"Recomendado\"]",
            priceElement: "h4.current",
            farePrice: ".fare-price"
        };

        const RADIO_CLASS = "at-fare-radio-selection__radio";
        const RADIO_BUSINESS_CLASS = "at-fare-radio-selection__radio--business";
        const RADIO_WRAPPER_CLASS = "at-fare-radio-selection__radio-wrapper";
        const RADIO_WRAPPER_SELECTED_CLASS = "at-fare-radio-selection__radio-wrapper--selected";
        const RADIO_LABEL_CLASS = "at-fare-radio-selection__radio-label";
        const RADIO_ACTIVE_BODY_CLASS = "at-fare-radio-selection--active";
        const CARD_BUSINESS_CLASS = "at-fare-radio-selection__card--business";
        const TYPE_CONTAINER_CLASS = "at-fare-radio-selection__type-container";
        const FARE_CELL_CLASS = "at-fare-radio-selection__fare-cell";
        const FARE_PRICE_BUSINESS_CLASS = "at-fare-radio-selection__fare-price--business";
        const PRICE_WRAPPER_CLASS = "at-fare-radio-selection__price-wrapper";
        const PRICE_END_CLASS = "at-fare-radio-selection__price--end";
        const SOLD_OUT_CLASS = "at-fare-radio-selection__sold-out";
        const FARE_PRICE_SOLD_OUT_CLASS = "at-fare-radio-selection__fare-price--sold-out";
        const RECOMMENDED_BADGE_CLASS = "at-fare-radio-selection__recommended-badge";
        const BADGE_ROW_CLASS = "at-fare-radio-selection__badge-row";
        const FARE_VISUALLY_SELECTED_CLASS = "at-fare-radio-selection__fare--visually-selected";
        const SELECTED_FARE_BACKGROUND_HINT = "rgba(2, 108, 182";
        const PROCESSED_ATTR = "data-at-radio-injected";
        const RECOMMENDED_PROCESSED_ATTR = "data-at-recommended-processed";
        const SOLD_OUT_ARIA_LABEL = "Tarifa esgotada";
        const BUSINESS_FARE_TEXT = "Business";
        const RECOMMENDED_BADGE_TEXT = "Recomendado";
        const SELECTED_RADIO_LABEL = "Tarifa selecionada";
        const UNSELECTED_RADIO_LABEL = "Selecionar tarifa";
        const HIT_AREA_CLASS = "at-fare-radio-selection__hit-area";
        const RADIO_ID_PREFIX = "at-fare-radio-selection__radio-";
        let groupCounter = 0;
        let radioIdCounter = 0;

        // Tarifa que o usuario escolheu explicitamente no modal. Enquanto estiver
        // definida ela e a fonte da verdade para o estado visual, porque o site
        // demora a refletir a troca no proprio DOM e syncModalVisualSelection
        // acabaria reescrevendo a escolha do usuario com o valor antigo.
        // Guardamos tambem uma chave estavel (tipo + preco): ao fechar e reabrir o
        // modal o React remonta os nos e a referencia do DOM deixa de servir.
        let userSelectedModalFare = null;
        let userSelectedModalFareKey = null;
        let lastModalFaresFingerprint = null;
        let lastModalActivation = { fareItem: null, at: 0 };

        const OBSERVER_OPTIONS = {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["data-test-id"]
        };

        let observer = null;
        let observedRoot = null;

        injectCustomCSS();
        waitForDomAndObserve();

        function waitForDomAndObserve() {
            const wrapper = document.querySelector(SELECTORS.flightsWrapper);

            if (!wrapper) {
                requestAnimationFrame(waitForDomAndObserve);
                return;
            }

            console.log("[AT] Flights wrapper found. Observing fare buttons.");
            // Observa um no persistente (document.body) em vez do wrapper .availability.
            // Em navegacoes SPA (ex.: "Informar viajantes" e voltar) o React desmonta e
            // remonta o wrapper; observar o body mantem o observer valido apos o retorno,
            // permitindo reaplicar o layout no DOM recriado.
            observedRoot = document.body;
            observeFareButtons(observedRoot);
            processFareButtons();
        }

        function setupForWhenUserChangeTheCurrencyOrLeavesPage() {
            console.log("[AT] Page no longer matchs all the requirements");
            document.body.classList.toggle(RADIO_ACTIVE_BODY_CLASS, false);
            userSelectedModalFare = null;
            userSelectedModalFareKey = null;
            lastModalFaresFingerprint = null;
        }

        function observeFareButtons(root) {
            let scheduled = false;

            observer = new MutationObserver(function () {
                const yetOnExperienceTarget = onExperienceTargetPage();

                if(!yetOnExperienceTarget) {
                    setupForWhenUserChangeTheCurrencyOrLeavesPage();
                    return;
                }

                if (scheduled) {
                    return;
                }

                scheduled = true;

                requestAnimationFrame(function () {
                    scheduled = false;
                    processFareButtons();
                });
            });

            observer.observe(root, OBSERVER_OPTIONS);
        }

        function processFareButtons() {
            const yetOnExperienceTarget = onExperienceTargetPage();

            if(!yetOnExperienceTarget) {
                setupForWhenUserChangeTheCurrencyOrLeavesPage();
                return;
            }

            if (observer) {
                observer.disconnect();
            }

            const flightCards = document.querySelectorAll(SELECTORS.flightCard);
            let hasImplementedRadio = false;

            [...flightCards].forEach(function (card) {
                const groupName = getOrCreateGroupId(card);
                const fareItems = card.querySelectorAll(SELECTORS.fareItem);
                const cardHasBusiness = [...fareItems].some(isBusinessFare);

                card.classList.toggle(CARD_BUSINESS_CLASS, cardHasBusiness);

                [...fareItems].forEach(function (fareItem) {
                    setupRecommendedFlag(fareItem);
                    setupCardLayoutHooks(fareItem);

                    const button = fareItem.querySelector(SELECTORS.selectedFareButton + "," + SELECTORS.unselectedFareButton);

                    if (!button) {
                        return;
                    }

                    if (isFareSoldOut(button)) {
                        setupSoldOutIndicator(button, fareItem);
                        return;
                    }

                    const radioImplemented = setupRadioForButton(button, groupName, fareItem);

                    if (radioImplemented) {
                        setupFareItemHitArea(fareItem, fareItem.querySelector("." + RADIO_CLASS));
                        hasImplementedRadio = true;
                    }
                });
            });

            // Modal/tablet path: below 1024px the site renders fares inside a
            // full-screen modal carousel instead of the inline grid. Those fares
            // live outside any .flight-card and have no per-card select button.
            const modalFareItems = [...document.querySelectorAll(SELECTORS.fareItem)].filter(function (fareItem) {
                return !fareItem.closest(SELECTORS.flightCard);
            });

            if (modalFareItems.length > 0) {
                const modalContainer = modalFareItems[0].parentElement;
                const modalGroupName = getOrCreateGroupId(modalContainer);
                const modalHasBusiness = modalFareItems.some(isBusinessFare);

                modalFareItems.forEach(function (fareItem) {
                    fareItem.classList.toggle(CARD_BUSINESS_CLASS, modalHasBusiness);

                    setupRecommendedFlag(fareItem);
                    setupCardLayoutHooks(fareItem);

                    const button = fareItem.querySelector(SELECTORS.selectedFareButton + "," + SELECTORS.unselectedFareButton + ",[aria-label=\"" + SOLD_OUT_ARIA_LABEL + "\"]");

                    if (button && isFareSoldOut(button)) {
                        setupSoldOutIndicator(button, fareItem);
                        return;
                    }

                    if (isModalFareSoldOut(fareItem)) {
                        removeModalFareRadio(fareItem);
                        return;
                    }

                    const radioImplemented = setupModalFareRadio(fareItem, modalGroupName);

                    if (radioImplemented) {
                        setupFareItemHitArea(fareItem, fareItem.querySelector("." + RADIO_CLASS));
                        hasImplementedRadio = true;
                    }

                    groupRecommendedBadgeWithPromotional(fareItem);
                });

                syncModalVisualSelection(modalFareItems);
            }

            document.body.classList.toggle(RADIO_ACTIVE_BODY_CLASS, hasImplementedRadio);

            if (observer && observedRoot) {
                observer.observe(observedRoot, OBSERVER_OPTIONS);
            }
        }

        function isBusinessFare(fareItem) {
            const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

            return Boolean(fareTypeLabel) && fareTypeLabel.textContent.includes(BUSINESS_FARE_TEXT);
        }

        function setupCardLayoutHooks(fareItem) {
            // Verifica se o item card é do tipo business
            const isBusiness = isBusinessFare(fareItem);
            const isInBusinessCard = Boolean(fareItem.closest("." + CARD_BUSINESS_CLASS));
            // Verifica se o item card tem badge de recomendado
            const hasRecommendedBadge = Boolean(fareItem.querySelector(SELECTORS.recommendedFlag));
            const farePrice = fareItem.querySelector(SELECTORS.farePrice);

            if (isBusiness) {
                farePrice?.classList.add(FARE_PRICE_BUSINESS_CLASS);
            } else {
                farePrice?.parentElement?.classList.add(FARE_CELL_CLASS);
            }

            const priceElement = fareItem.querySelector(SELECTORS.priceElement);

            priceElement?.parentElement?.classList.add(PRICE_WRAPPER_CLASS);

            if (!isInBusinessCard && !hasRecommendedBadge) {
                priceElement?.classList.add(PRICE_END_CLASS);
            }
        }

        function getOrCreateGroupId(card) {
            if (!card.dataset.atFareGroupId) {
                card.dataset.atFareGroupId = "at-fare-group-" + groupCounter;
                groupCounter = groupCounter + 1;
            }

            return card.dataset.atFareGroupId;
        }

        function isFareSoldOut(button) {
            return button.getAttribute("aria-label") === SOLD_OUT_ARIA_LABEL;
        }

        function isModalFareSoldOut(fareItem) {
            return [...fareItem.querySelectorAll("p")].some(function (element) {
                return element.textContent.trim() === SOLD_OUT_ARIA_LABEL;
            });
        }

        function removeModalFareRadio(fareItem) {
            [...fareItem.querySelectorAll("." + RADIO_WRAPPER_CLASS)].forEach(function (radioWrapper) {
                if (radioWrapper.parentNode) {
                    radioWrapper.parentNode.removeChild(radioWrapper);
                }
            });
        }

        function setupSoldOutIndicator(button, fareItem) {
            if (button.getAttribute(PROCESSED_ATTR) === "true") {
                return;
            }

            button.style.display = "none";
            button.setAttribute(PROCESSED_ATTR, "true");

            const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

            if (!fareTypeLabel) {
                return;
            }

            const soldOutLabel = document.createElement("span");
            soldOutLabel.className = SOLD_OUT_CLASS;
            soldOutLabel.textContent = SOLD_OUT_ARIA_LABEL;

            const badgeWrapper = fareTypeLabel.parentElement;

            badgeWrapper.insertAdjacentElement("beforebegin", soldOutLabel);

            const farePrice = fareItem.querySelector(SELECTORS.farePrice);

            farePrice?.classList.add(FARE_PRICE_SOLD_OUT_CLASS);
        }

        function setupRecommendedFlag(fareItem) {
            if (fareItem.getAttribute(RECOMMENDED_PROCESSED_ATTR) === "true") {
                return;
            }

            const recommendedFlag = fareItem.querySelector(SELECTORS.recommendedFlag);

            if (!recommendedFlag) {
                return;
            }

            fareItem.setAttribute(RECOMMENDED_PROCESSED_ATTR, "true");
            recommendedFlag.style.display = "none";

            const badge = document.createElement("span");
            badge.className = RECOMMENDED_BADGE_CLASS;
            badge.innerHTML = `<svg size="20" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ kcgzzS"><path d="M404.1 405.7L128 428.3 337.6 603.5 274.7 864 512 725.8 749.3 864 686.7 603.5 896 428.3 619.9 405.3 512 160 404.1 405.7Z" fill="#ffffff" fill-rule="evenodd" clip-rule="evenodd"></path></svg>` + " " + RECOMMENDED_BADGE_TEXT;

            const priceElement = fareItem.querySelector(SELECTORS.priceElement);

            if (priceElement) {
                const priceElementFather = priceElement.parentNode;
                priceElementFather?.classList.add("at-father-price-element");
                priceElement.insertAdjacentElement("beforebegin", badge);
                return;
            }
        }

        // Agrupa o promotional e a badge de recomendado numa linha unica dentro do
        // type-container, para que fiquem lado a lado no modal (< 1024px).
        function groupRecommendedBadgeWithPromotional(fareItem) {
            const typeContainer = fareItem.querySelector("." + TYPE_CONTAINER_CLASS);
            const promotional = fareItem.querySelector(SELECTORS.fareTypeLabel);
            const badge = fareItem.querySelector("." + RECOMMENDED_BADGE_CLASS);

            if (!typeContainer || !promotional || !badge) {
                return;
            }

            let badgeRow = typeContainer.querySelector("." + BADGE_ROW_CLASS);

            if (!badgeRow) {
                badgeRow = document.createElement("div");
                badgeRow.className = BADGE_ROW_CLASS;
                promotional.insertAdjacentElement("beforebegin", badgeRow);
            }

            badgeRow.appendChild(promotional);
            badgeRow.appendChild(badge);
        }

        function updateRadioLabel(radio, isSelected) {
            const labelText = isSelected ? SELECTED_RADIO_LABEL : UNSELECTED_RADIO_LABEL;

            radio.setAttribute("aria-label", labelText);

            const wrapper = radio.parentElement;

            if (!wrapper) {
                return;
            }

            wrapper.classList.toggle(RADIO_WRAPPER_SELECTED_CLASS, isSelected);

            let labelElement = wrapper.querySelector("." + RADIO_LABEL_CLASS);

            if (!labelElement) {
                labelElement = document.createElement("div");
                labelElement.className = RADIO_LABEL_CLASS;
                wrapper.appendChild(labelElement);
            }

            labelElement.textContent = labelText;
        }

        function setupRadioForButton(button, groupName, fareItem) {
            const isSelected = button.matches(SELECTORS.selectedFareButton);
            const isBusiness = isBusinessFare(fareItem);
            const alreadyProcessed = button.getAttribute(PROCESSED_ATTR) === "true";

            if (alreadyProcessed) {
                const existingRadio = fareItem.querySelector("." + RADIO_CLASS);

                if (existingRadio) {
                    existingRadio.checked = isSelected;
                    existingRadio.classList.toggle(RADIO_BUSINESS_CLASS, isBusiness);
                    updateRadioLabel(existingRadio, isSelected);
                }

                return Boolean(existingRadio);
            }

            const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

            if (!fareTypeLabel) {
                return false;
            }

            button.style.display = "none";
            button.setAttribute(PROCESSED_ATTR, "true");

            const built = createRadioElements(groupName, isSelected, isBusiness, function () {
                console.log("[AT] Radio selected. Triggering underlying fare button click.");
                setTimeout(function () {
                    button.click();
                    analyticsEvent("fare_selected_via_radio");
                }, 5);
            });

            fareTypeLabel.parentElement?.classList.add(TYPE_CONTAINER_CLASS);
            fareTypeLabel.insertAdjacentElement("afterend", built.wrapper);

            return true;
        }

        function createRadioElements(groupName, isSelected, isBusiness, onSelect) {
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = groupName;
            radio.className = RADIO_CLASS;
            radio.checked = isSelected;
            radio.classList.toggle(RADIO_BUSINESS_CLASS, isBusiness);

            radioIdCounter = radioIdCounter + 1;
            radio.id = RADIO_ID_PREFIX + radioIdCounter;

            radio.addEventListener("change", onSelect);

            const wrapper = document.createElement("div");
            wrapper.className = RADIO_WRAPPER_CLASS;
            wrapper.appendChild(radio);

            updateRadioLabel(radio, isSelected);

            return { radio: radio, wrapper: wrapper };
        }

        // Modal/tablet variant of the radio setup. The modal carousel has no
        function setupModalFareRadio(fareItem, groupName) {
            if (fareItem.querySelector("." + RADIO_CLASS)) {
                return true;
            }

            const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

            if (!fareTypeLabel) {
                return false;
            }

            const isBusiness = isBusinessFare(fareItem);
            const built = createRadioElements(groupName, false, isBusiness, function () {
                updateModalVisualSelection(fareItem);
            });

            // Usamos "click" e nao "change" como ponto de entrada porque "change"
            // nao dispara quando o usuario toca na tarifa que ja esta selecionada,
            // e nesse caso ele ainda espera que o modal avance. O "click" cobre a
            // troca e a reafirmacao. Ele chega aqui tanto pelo toque direto no
            // radio quanto pelo <label for> que cobre o card.
            built.radio.addEventListener("click", function () {
                activateModalFare(fareItem);
            });

            fareTypeLabel.parentElement?.classList.add(TYPE_CONTAINER_CLASS);
            fareTypeLabel.insertAdjacentElement("afterend", built.wrapper);

            return true;
        }

        // Resolve a selecao de tarifa no modal. Chamado pelo click do radio
        // nativo, que e o unico caminho de ativacao que o iOS entrega de forma
        // confiavel nesta pagina.
        function activateModalFare(fareItem) {
            if (isDuplicateModalActivation(fareItem)) {
                return;
            }

            const wasAlreadySelected = fareItem === userSelectedModalFare || fareItem.classList.contains(FARE_VISUALLY_SELECTED_CLASS);

            userSelectedModalFare = fareItem;
            userSelectedModalFareKey = getModalFareKey(fareItem);
            updateModalVisualSelection(fareItem);

            if (wasAlreadySelected) {
                analyticsEvent("user_clicked_radio_pre_selected_tariff");
            } else {
                analyticsEvent("fare_selected_via_radio");
            }

            triggerModalSelection(fareItem);
        }

        // O label sobreposto e o radio nativo podem, em alguns motores, resultar
        // em mais de um click para o mesmo toque. Sem essa guarda o CTA do rodape
        // seria acionado duas vezes e o fluxo avancaria dois passos.
        function isDuplicateModalActivation(fareItem) {
            const now = Date.now();
            const isRepeat = lastModalActivation.fareItem === fareItem && now - lastModalActivation.at < 400;

            lastModalActivation = { fareItem: fareItem, at: now };

            return isRepeat;
        }

        function getModalFareKey(fareItem) {
            const typeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);
            const priceElement = fareItem.querySelector(SELECTORS.priceElement);
            const typeText = typeLabel ? typeLabel.textContent.trim() : "";
            const priceText = priceElement ? priceElement.textContent.trim() : "";

            return typeText + "|" + priceText;
        }

        function getModalFaresFingerprint(modalFareItems) {
            return modalFareItems.map(getModalFareKey).join(";");
        }

        function findModalFareByKey(modalFareItems, fareKey) {
            if (!fareKey) {
                return null;
            }

            return modalFareItems.filter(function (fareItem) {
                return getModalFareKey(fareItem) === fareKey;
            })[0] || null;
        }

        function findSiteSelectedModalFare(modalFareItems) {
            // Nosso CSS zera o background-image das tarifas para controlar o visual
            // de selecionada/nao selecionada. Para ler o sinal original do site,
            // suspendemos temporariamente esses overrides uma unica vez.
            document.body.classList.add("at-fare-radio-selection--detecting");

            const selectedFareItem = modalFareItems.filter(function (fareItem) {
                const background = window.getComputedStyle(fareItem).backgroundImage || "";

                return background.indexOf(SELECTED_FARE_BACKGROUND_HINT) !== -1;
            })[0];

            document.body.classList.remove("at-fare-radio-selection--detecting");

            return selectedFareItem || null;
        }

        // Keeps visual selection (radio pill + label) in sync with the fare
        function syncModalVisualSelection(modalFareItems) {
            const fingerprint = getModalFaresFingerprint(modalFareItems);

            // Conteudo diferente = outro voo/modal. Descarta a escolha anterior.
            if (lastModalFaresFingerprint && lastModalFaresFingerprint !== fingerprint) {
                userSelectedModalFare = null;
                userSelectedModalFareKey = null;
            }

            lastModalFaresFingerprint = fingerprint;

            // Se o modal foi refeito pelo React, a escolha anterior aponta para um
            // no que nao esta mais em tela. Tentamos remarcar pela chave estavel.
            if (userSelectedModalFare && modalFareItems.indexOf(userSelectedModalFare) === -1) {
                userSelectedModalFare = null;
            }

            if (!userSelectedModalFare && userSelectedModalFareKey) {
                userSelectedModalFare = findModalFareByKey(modalFareItems, userSelectedModalFareKey);
            }

            // A escolha explicita do usuario vence a leitura do DOM do site. O site
            // leva alguns frames para refletir a troca no proprio estilo, e sem essa
            // precedencia a selecao era reescrita com o valor antigo poucos
            // milissegundos depois do toque.
            if (userSelectedModalFare) {
                applyModalVisualSelection(modalFareItems, userSelectedModalFare);
                return;
            }

            let selectedFareItem = findSiteSelectedModalFare(modalFareItems);

            if (!selectedFareItem) {
                selectedFareItem = modalFareItems.filter(function (fareItem) {
                    return fareItem.classList.contains("fare-item--recommended");
                })[0];
            }

            if (selectedFareItem) {
                userSelectedModalFareKey = getModalFareKey(selectedFareItem);
            }

            applyModalVisualSelection(modalFareItems, selectedFareItem);
        }

        function applyModalVisualSelection(modalFareItems, selectedFareItem) {
            modalFareItems.forEach(function (fareItem) {
                const isSelected = fareItem === selectedFareItem;
                const radio = fareItem.querySelector("." + RADIO_CLASS);

                fareItem.classList.toggle(FARE_VISUALLY_SELECTED_CLASS, isSelected);

                if (radio) {
                    radio.checked = isSelected;
                    updateRadioLabel(radio, isSelected);
                }
            });
        }

        function updateModalVisualSelection(selectedFareItem) {
            const selectedRadio = selectedFareItem.querySelector("." + RADIO_CLASS);

            if (!selectedRadio) {
                return;
            }

            const groupRadios = document.getElementsByName(selectedRadio.name);

            [...groupRadios].forEach(function (radio) {
                const fareItem = radio.closest(SELECTORS.fareItem);
                const isSelected = fareItem === selectedFareItem;

                fareItem?.classList.toggle(FARE_VISUALLY_SELECTED_CLASS, isSelected);
                updateRadioLabel(radio, isSelected);
            });
        }

        function triggerModalSelection(fareItem) {
            const cta = findModalSelectButton(fareItem);

            if (!cta) {
                console.log("[AT] Modal select CTA not found.");
                return;
            }

            // Clique sincrono, ainda dentro do dispatch do click do radio. Medido
            // em WebKit e Blink: um click aninhado em outro dispatch chega
            // normalmente ao listener delegado na raiz que o React usa.
            console.log("[AT] Triggering footer CTA (sync).");
            cta.click();
        }

        function findModalSelectButton(fareItem) {
            let container = fareItem.parentElement;

            while (container && container !== document.body) {
                const buttons = container.querySelectorAll("button");

                for (let i = 0; i < buttons.length; i = i + 1) {
                    const candidate = buttons[i];
                    const label = (candidate.textContent || "").trim().toLowerCase();

                    if (!candidate.closest(SELECTORS.fareItem) && label.indexOf("selecionar tarifa") !== -1) {
                        return candidate;
                    }
                }

                container = container.parentElement;
            }

            return null;
        }

        // O card inteiro precisa ser tocavel. O iOS Safari nao entrega "click" nem
        // "touchend" de forma confiavel para o <li> nao interativo dentro do
        // carrossel slick do modal, entao detectar o tap em JS falha no iPhone
        // (no Android funciona). Em vez de adivinhar o gesto, sobrepomos um
        // <label for> nativo cobrindo o card: a associacao label/radio e resolvida
        // pelo proprio motor, funciona em WebKit e Blink, e o swipe do carrossel
        // continua intacto porque arrastar nao gera ativacao de label.
        function setupFareItemHitArea(fareItem, radio) {
            if (!radio || !radio.id) {
                return;
            }

            // A guarda e por presenca, e nao por atributo de processado, porque o
            // React pode reescrever os filhos do card e levar o label embora. Com
            // guarda por atributo o label nunca seria recriado.
            const existing = fareItem.querySelector(":scope > ." + HIT_AREA_CLASS);

            if (existing) {
                if (existing.getAttribute("for") !== radio.id) {
                    existing.setAttribute("for", radio.id);
                }

                return;
            }

            const hitArea = document.createElement("label");
            hitArea.className = HIT_AREA_CLASS;
            hitArea.setAttribute("for", radio.id);
            hitArea.setAttribute("aria-hidden", "true");

            fareItem.insertBefore(hitArea, fareItem.firstChild);
        }

        function injectCustomCSS() {
            const style = document.createElement("style");

            style.innerHTML = `
                .at-fare-radio-selection__radio-wrapper {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background-color 0.15s ease;
                }

                .at-fare-radio-selection__radio {
                    -webkit-appearance: none;
                    appearance: none;
                    display: inline-block;
                    vertical-align: middle;
                    width: 20px;
                    height: 20px;
                    margin: 0;
                    border-radius: 50%;
                    border: 1px solid #142c4e;
                    background-color: transparent;
                    position: relative;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .at-fare-radio-selection__radio::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: transparent;
                    transform: translate(-50%, -50%);
                }

                .at-fare-radio-selection__radio-label {
                    font-size: 14px;
                    color: #041e42;
                }

                .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) {
                    background-color: transparent;
                }

                .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio {
                    border-color: #106199;
                }

                .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio-label {
                    color: #106199;
                }

                .at-fare-radio-selection__radio-wrapper--selected {
                    background-color: #3e6dd3;
                }

                .at-fare-radio-selection__radio-wrapper--selected .at-fare-radio-selection__radio {
                    border-color: #ffffff;
                }

                .at-fare-radio-selection__radio-wrapper--selected .at-fare-radio-selection__radio::before {
                    background-color: #ffffff;
                }

                .at-fare-radio-selection__radio-wrapper--selected .at-fare-radio-selection__radio-label {
                    color: #ffffff;
                }

                .fare-item:hover .at-fare-radio-selection__radio-wrapper--selected {
                    background-color: #315ebe;
                }

                .at-fare-radio-selection__radio--business {
                    border-color: #ffffff;
                }

                .at-fare-radio-selection__radio--business ~ .at-fare-radio-selection__radio-label {
                    color: #ffffff;
                }

                .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio--business {
                    border-color: rgba(255, 255, 255, 0.7);
                }

                .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio--business ~ .at-fare-radio-selection__radio-label {
                    color: rgba(255, 255, 255, 0.7);
                }

                .fare-item {
                    cursor: pointer;
                    position: relative;
                }

                /* Area de toque nativa cobrindo o card inteiro. Um <label for>
                   associado ao radio e ativado pelo proprio motor, sem depender de
                   o WebKit do iOS entregar click/touchend num <li> comum. */
                .at-fare-radio-selection__hit-area {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1;
                    margin: 0;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                }

                /* Qualquer elemento interativo dentro do card precisa ficar acima
                   da area de toque para nao perder o proprio clique. */
                .fare-item a,
                .fare-item button,
                .fare-item input,
                .fare-item select,
                .fare-item textarea,
                .fare-item [role="button"],
                .fare-item .at-fare-radio-selection__radio-wrapper {
                    position: relative;
                    z-index: 2;
                }

                .at-fare-radio-selection__sold-out {
                    display: block;
                    margin: 0 auto;
                    text-align: center;
                    font-size: 12px;
                    color: #6B6B6B;
                    font-weight: 500;
                }

                .at-fare-radio-selection__card--business .at-fare-radio-selection__fare-price--sold-out:not(.at-fare-radio-selection__fare-price--business) {
                    margin-top: 8px;
                }

                .at-fare-radio-selection__recommended-badge {
                    display: inline-flex;
                    -webkit-box-align: center;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 8px;
                    border-radius: 4px;
                    background: linear-gradient(22.87deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%);
                    color: rgb(255, 255, 255);
                    font-family: "Helvetica Neue", sans-serif;
                    font-size: 14px;
                    line-height: 1;
                    white-space: nowrap;
                }
                    
                body.at-fare-radio-selection--active .fare-item > ul > li::after {
                    display: none;
                }

                .fare-item .fare-price {
                    gap: 8px;
                }

                /* ===== Modal carousel layout (site renders a modal < 1024px) ===== */
                @media (max-width: 1023px) {
                    .fare-price {
                        flex-direction: column;
                        align-items: flex-start !important;
                    }

                    .at-fare-radio-selection__badge-row {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex-wrap: wrap;
                    }

                    .at-fare-radio-selection__type-container {
                        flex-direction: column-reverse !important;
                    }

                    .at-fare-radio-selection__radio-wrapper {
                        padding: 0 0 8px 0;
                    }

                    .modal-content__footer .button__text {
                        font-size: 0;
                    }

                    .modal-content__footer .button__text::after {
                        content: "Continuar";
                        font-size: 16px;
                    }

                    /* O site pinta o slide atual (slick-current) com fundo/borda azul.
                       Aqui o visual de selecionada fica so na tarifa com a classe
                       --visually-selected; as demais voltam ao fundo branco sem stroke.
                       A classe --detecting suspende esses overrides para
                       isModalFareSelectedBySite conseguir ler o background do site. */
                    body.at-fare-radio-selection--active:not(.at-fare-radio-selection--detecting) .slick-slide li.fare-item:not(.at-fare-radio-selection__fare--visually-selected) {
                        background-color: #ffffff !important;
                        background-image: none !important;
                        border: 1px solid transparent !important;
                        box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 10px;
                    }

                    body.at-fare-radio-selection--active:not(.at-fare-radio-selection--detecting) .slick-slide li.fare-item.at-fare-radio-selection__fare--visually-selected {
                        background-color: #e3f1fc !important;
                        background-image: none !important;
                        border: 1px solid #026cb6 !important;
                        box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 10px;
                    }

                    .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio-wrapper {
                        background-color: #026AB5;
                        padding: 8px;
                    }

                    .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio {
                        border-color: #ffffff;
                    }

                    .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio::before {
                        background-color: #ffffff;
                    }

                    .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio-label {
                        color: #ffffff;
                        font-size: 0;
                    }

                    .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio-label::after {
                        content: "Tarifa selecionada";
                        font-size: 14px;
                    }

                    .at-fare-radio-selection__card--business .at-fare-radio-selection__type-container {
                        flex-direction: column-reverse;
                        align-items: flex-start;
                    }

                    .at-fare-radio-selection__card--business .at-fare-radio-selection__price-wrapper {
                        align-items: center;
                    }

                    body.at-fare-radio-selection--active .at-fare-radio-selection__card--business h4.current {
                        margin-left: 0;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        /**
         * Function to trigger an Adobe Analytics event.
         * Uses to track user interactions within the experience.
         * @param {string} eventLabel - Label of the event to be triggered.
         *
         * Example usage:
         * analyticsEvent("user_clicked_button");
         */
        function analyticsEvent(eventLabel) {
            if (eventLabel === undefined || !eventLabel) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = experienceName + " " + eventLabel;
            console.log("[AT] ANALYTICS_TRIGGERED:", labelEvent);

            // === Disparo Adobe Analytics ===
            (function () {
                const s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
                if (!s || typeof s.tl !== "function") return;

                s.linkTrackVars = "events,eVar82";
                s.linkTrackEvents = "event90";
                s.events = "event90";
                s.eVar82 = labelEvent;

                // dispara o link (o = custom link, d = download, e = exit)
                s.tl(true, "o", "target_activity_action");
            })();
        }
    }
})();
