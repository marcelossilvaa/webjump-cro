(function() {
    console.log("[AT] Urgency Flag: Script initialized.");

    const SELECTORS = {
        flightsWrapper: ".AzulPage .availability",
        flightsTrips: ".AzulPage .availability .trips",
        flightCard: ".card-list .flight-card",
        flightTypeLabel: ".fare-price .promotional",
        buttonSeeTariffs: "button[aria-label='Ver tarifas deste voo. Selecionar']",
        elementToAppendFlag: ".fare-container.right",
        flightCardInfo: ".flight-card__info",
        buttonFlightSoldOut: "button[aria-label='Voo esgotado']"
    };

    const domIsReadyValidator = SELECTORS.flightsWrapper;

    const FLIGHT_ATTRIBUTES = {
        capacity: "legCapacity",
        lid: "legLid",
        sold: "legSold",
        remainingSeats: "legRemainingSeats"
    };

    const FLIGHT_SOLD_PERCENTAGE = [
        {
            checkIfShowFlag: (sold, lid) => (sold / lid) >= 0.95 && (sold / lid) < 1,
            message: "Última chance",
            flagClass: "at-urgency-flag-critical"
        },
        {
            checkIfShowFlag: (sold, lid) => (sold / lid) >= 0.85 && (sold / lid) < 0.95,
            message: "Não perca, últimas vagas",
            flagClass: "at-urgency-flag-warning"
        },
        {
            checkIfShowFlag: (sold, lid) => (sold / lid) >= 0.75 && (sold / lid) < 0.85,
            message: "Alta procura",
            flagClass: "at-urgency-flag-info"
        }
    ];
    

    function initActivityWhenReady() {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const isDesktop = window.innerWidth >= 1024;

        if (!isDesktop) {
            console.log("[AT] Urgency Flag: Not a desktop device. Exiting.");
            return;
        }

        if (isReady) {
            initTariffRecommendation();
        } else {
            document.addEventListener("DOMContentLoaded", initTariffRecommendation);
        }
    }

    function initTariffRecommendation() {
        document.body.classList.add("at-urgency-flag-active");

        injectCSS();

        const domChecker = document.querySelector(domIsReadyValidator);

        if (!domChecker) {
            console.log("[AT] Urgency Flag: DOM Checker not found. Waiting...");
            requestAnimationFrame(initTariffRecommendation);
            return;
        }

        console.log("[AT] Urgency Flag: DOM Checker found. Initializing activity...");
        analyticsEvent("Recomendações Exibidas");
        observerFlights();

        function observerFlights() {
            const observerFlightsWrapper = new MutationObserver((mutations) => {
                const stillMoneyPaymentFlight = checkIfStillMoneyPaymentFlight();

                if(!stillMoneyPaymentFlight) {
                    console.log("[AT] Urgency Flag: Flight selection changed to non Money Payment flight.");
                    document.body.classList.remove("at-urgency-flag-active");
                    return;
                }

                document.body.classList.toggle("at-urgency-flag-active", true);
                console.log("[AT] Urgency Flag: Flight for money payment detected.");

                for (const mutation of mutations) {
                    if(mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                        const elementTrips = document.querySelector(SELECTORS.flightsTrips);

                        if(elementTrips) {
                            const flightCards = elementTrips.querySelectorAll(SELECTORS.flightCard);

                            if(!flightCards || flightCards.length === 0) {
                                console.log("[AT] Urgency Flag: No flight cards found.");
                                return;
                            }

                            flightCards.forEach((card) => {
                                const isSoldOut = card.querySelector(SELECTORS.buttonFlightSoldOut);

                                if(isSoldOut) {
                                    return;
                                }

                                const existingFlag = card.querySelector(".injected-urgency-flag");

                                if(existingFlag) {
                                    return;
                                }

                                const legInfoAttributes = getLegInfoAttributes(card);

                                if(!legInfoAttributes) {
                                    return;
                                }

                                const { lid, sold } = legInfoAttributes;

                                if(lid === 0 || sold === 0) {
                                    console.log("[AT] Urgency Flag: Invalid leg info data attributes.");
                                    return;
                                }

                                const hasFlagToShow = FLIGHT_SOLD_PERCENTAGE.find(flagCriteria => 
                                    flagCriteria.checkIfShowFlag(sold, lid)
                                );

                                if(!hasFlagToShow) {
                                    return;
                                }

                                const { message, flagClass } = hasFlagToShow;

                                const elementToAppendFlag = card.querySelector(SELECTORS.elementToAppendFlag);

                                if(elementToAppendFlag) {
                                    const urgencyFlag = createUrgencyFlag(message, flagClass);
                                    elementToAppendFlag.appendChild(urgencyFlag);
                                    analyticsEvent("Bandeira Exibida: " + message);
                                }
                            });
                        }
                    }
                }
            });

            observerFlightsWrapper.observe(domChecker, { childList: true, subtree: true });
        }

        function getLegInfoAttributes(flightCard) {
            const legInfoElement = flightCard.querySelector(SELECTORS.flightCardInfo);

            if(!legInfoElement) {
                console.log("[AT] Urgency Flag: Flight card info element not found.");
                return null;
            }

            const legCapacity = legInfoElement.dataset[FLIGHT_ATTRIBUTES.capacity];
            const legLid = legInfoElement.dataset[FLIGHT_ATTRIBUTES.lid];
            const legSold = legInfoElement.dataset[FLIGHT_ATTRIBUTES.sold];
            const legRemainingSeats = legInfoElement.dataset[FLIGHT_ATTRIBUTES.remainingSeats];

            return {
                capacity: isNaN(legCapacity) ? 0 : parseInt(legCapacity),
                lid: isNaN(legLid) ? 0 : parseInt(legLid),
                sold: isNaN(legSold) ? 0 : parseInt(legSold),
                remainingSeats: isNaN(legRemainingSeats) ? 0 : parseInt(legRemainingSeats)
            };
        }

        function createUrgencyFlag(message, flagClass = "") {
            if(!message || message.trim() === "") {
                console.log("[AT] Urgency Flag: function doesn't receive message as parameter.");
                return null;
            }

            const flag = document.createElement("div");
            flag.classList.add("injected-urgency-flag");
            flag.classList.add(flagClass);

            const flagMessage = document.createElement("span");
            flagMessage.textContent = message;

            flag.appendChild(flagMessage);

            return flag;
        }

        function injectCSS() {
            const styles = document.createElement("style");

            styles.innerHTML = `
                .at-urgency-flag-active .flight-card .flight-card__container {
                    align-items: flex-start;
                }

                .at-urgency-flag-active .flight-card .flight-card__fare .fare-container.right {
                    flex-wrap: wrap;
                    justify-content: flex-end;
                    display: flex;
                }

                .at-urgency-flag-active .injected-urgency-flag {
                    width: 100%;
                    text-align: right;
                    margin-top: 12px;
                }
                    
                // Estilos para a bandeira de urgência
                .at-urgency-flag-active .injected-urgency-flag.at-urgency-flag-critical span {
                    background-color: #01416D;
                }

                .at-urgency-flag-active .injected-urgency-flag.at-urgency-flag-warning span {
                    background-color: #026CB6;
                }

                .at-urgency-flag-active .injected-urgency-flag.at-urgency-flag-info span {
                    background-color: #18B4E9;
                }

                .at-urgency-flag-active .injected-urgency-flag span::before {
                    content: "";
                    display: block;
                    width: 16px;
                    height: 16px;
                    margin-right: 4px;
                    background-size: cover;
                    background-repeat: no-repeat;
                }

                .at-urgency-flag-active .injected-urgency-flag.at-urgency-flag-critical span::before {
                    content: "";
                    background-image: url('https://imgur.com/UUuH7xC.png');
                }

                .at-urgency-flag-active .injected-urgency-flag.at-urgency-flag-warning span::before {
                    content: "";
                    background-image: url('https://imgur.com/4dBuoqm.png');
                }

                .at-urgency-flag-active .injected-urgency-flag.at-urgency-flag-info span::before {
                    content: "";
                    background-image: url('https://imgur.com/cNW3xk8.png');
                }

                .at-urgency-flag-active .injected-urgency-flag span {
                    background: #041e42;
                    border-radius: 5px;
                    font-weight: 500;
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    color: #FFF;
                    text-align: center;
                    margin-left: auto;
                    display: flex;
                    width: fit-content;
                    align-items: center;
                    line-height: normal;
                }

                @media screen and (max-width: 575px) {
                    .at-urgency-flag-active .injected-urgency-flag span {
                        font-size: 12px;
                        padding: 6px 4px;
                    }
                }

                @media screen and (min-width: 576px) {
                    .at-urgency-flag-active .injected-urgency-flag span {
                        font-size: 13px;
                        padding: 8px 12px;
                    }
                }
            `;

            // em .fare-price a classe .css-13gs6uq é a classe diferencial para business

            document.head.appendChild(styles);
        }

        function checkIfStillMoneyPaymentFlight() {
            const queryParams = window.location.search;
            const paramFlightMoneyPayment = "cc=BRL";

            return queryParams.includes(paramFlightMoneyPayment);
        }

        function analyticsEvent(eventLabel) {
            if(eventLabel === undefined || !eventLabel) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = "AT_urgency_flag " + eventLabel;

            console.log("[AT] Analytics event triggered:", labelEvent);

            // === Disparo Adobe Analytics (cópia/cole e ajuste as strings) ===
            (function(){
                var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
                if (!s || typeof s.tl !== "function") return;
            
                // informe aqui seu evento e as eVars/props que quiser
                s.linkTrackVars   = "events,eVar82";        // listar todas as variáveis que serão enviadas
                s.linkTrackEvents = "event90";               // código do event
                s.events          = "event90";               // mesmo código do event
                s.eVar82          =  labelEvent;      // valor da eVar82 (ex: "native" ou "floating")
            
                // dispara o link (o = custom link, d = download, e = exit)
                s.tl(true, "o", "target_activity_action");
            })();
        }
    }

    function onTargetPage() {
        const currentUrl = window.location.pathname;
        const targetTestUrl = "/selecao-voo";
        const queryParams = window.location.search;
        const paramFlightMoneyPayment = "cc=BRL";

        return currentUrl.includes(targetTestUrl) && queryParams.includes(paramFlightMoneyPayment);
    }

    if(window.urgencyFlagFlightInitialized || !onTargetPage()) {
        console.log("[AT] Urgency Flag: Script already executed or not on target page.");
        return;
    }

    window.urgencyFlagFlightInitialized = true;
    initActivityWhenReady();
})();