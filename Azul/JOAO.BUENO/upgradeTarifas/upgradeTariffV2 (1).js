(function () {
    "use strict";

    const SELECTORS = {
        "tariffsContainer": ".fares-container",
        "tariffWrapper": ".fare-item",
        "tariffName": "p.promotional",
        "tariffButton": "button[aria-label='Selecionar tarifa']",
        "tariffPrice": "[data-test-id='fare-price']", 
        "flightsContainer": ".trip-container .card-list",
        "changeFlightButton": "button[aria-label='Buscar passagens']",
        "changeFlightDayByCalendarButton": ".styles__Carousel-sc-3qprdy-1 div button",
    };

    const tariffs = {
        business: {
            name: "Business",
            class: "inject-upgrade-tariff--business",
            tariffTrigger: "Azul Super",
            title: "Que tal mais conforto?",
            description: "Uma viagem mais confortável acompanhada de gentilezas.",
            buttonText: "Eu quero",
            benefits: [
                "Bagagem despachada (23kg)*",
                "Poltronas 100% reclináveis",
                "Acesso a Lounges VIP",
                "Gastronomia de primeira"
            ],
        }
    };

    const checkIfDomReady = () => {
        const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        if(deviceWidth < 1024) {
            console.log("[AT] Device width is less than 1024px, skipping filters optimization.");
            return;
        }

        const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

        if (isReady) {
            initializeUpgradePromo();
        } else {
            document.addEventListener('DOMContentLoaded', initializeUpgradePromo);
        }
    }

    const initializeUpgradePromo = () => {
        console.log("[AT] Initializing upgrade promo...");

        let confirmedDefaultOption;

        availabilityObserver();
        checkIfFlightsContainerExists();
        injectCustomStyle();

        function availabilityObserver() {
            const availabilyElement = document.querySelector(".availability");

            const availabilityObserver = new MutationObserver((mutations) => {
                console.log("[AT] Availability observer triggered.", mutations);

                const haveNodesChanged = mutations.some(mutation => mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);

                if (haveNodesChanged) {
                    const isLoading = availabilyElement.querySelector(".availability-loading");

                    if(isLoading) {
                        console.log("[AT] Availability is loading, waiting for flights container to be available...");
                        return;
                    }

                    checkIfFlightsContainerExists();
                }
            });

            availabilityObserver.observe(availabilyElement, { childList: true });
        }

        function checkIfFlightsContainerExists() {
            const flightsContainer = document.querySelectorAll(SELECTORS.flightsContainer);
    
            if (flightsContainer.length > 0) {
                console.log("[AT] Flights container exists, proceeding with upgrade initialization.");
                observeFlightsChanges();
                checkIfDomHasBusinessTariff();
            } else {
                console.log("[AT] Waiting for flights container to be available...");    
                requestAnimationFrame(checkIfFlightsContainerExists);    
            }
        }

        function checkIfDomHasBusinessTariff() {
            const tariffNames = document.querySelectorAll(".fare-item p.promotional");
    
            if (tariffNames.length > 0) {
                const hasBusinessTariff = Array.from(tariffNames).some(tariff => tariff.textContent.includes("Business"));
                
                if (hasBusinessTariff) {
                    processTariffUpgrade();
                } else {
                    console.log("[AT] No business tariff found, skipping upgrade promo initialization.");
                }
            } else {
                console.log("[AT] No promotional tariffs found, skipping upgrade promo initialization.");
            }
        };

        function observeFlightsChanges() {
            const flightsObserver = new MutationObserver((mutations) => {
                const haveNodesChanged = mutations.some(mutation => mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);
    
                if(haveNodesChanged) {
                    console.log("[AT] Flights container changed, re-initializing upgrade promo.");
                    checkIfDomHasBusinessTariff();
                }
            });

            const flightsToObserve = document.querySelectorAll(SELECTORS.flightsContainer);

            flightsToObserve?.forEach((item) => {
                flightsObserver.observe(item, {
                    childList: true
                });
            });
        }


        function processTariffUpgrade() {
            const buttons = document.querySelectorAll(SELECTORS.tariffButton);
            
            buttons?.forEach(button => {
                confirmedDefaultOption = new WeakSet();

                button.removeEventListener("click", processToSuggestUpgrade);
                button.addEventListener("click", processToSuggestUpgrade);
            });
        };

        async function processToSuggestUpgrade(event) {
            const button = event.target;

            const tariffsContainer = button.closest(SELECTORS.tariffsContainer);
            const alreadyChoseTicket = tariffsContainer.querySelector(".css-1pjaxxl > p.css-ou6pmp");

            if (alreadyChoseTicket) {
                console.log("[AT] Ticket already chosen, skipping upgrade promo.");
                return;
            }

            if (event.isUpgradedInjected) {
                console.log("[AT] It's an upgrade injected, skipping.");
                return;
            }

            if (confirmedDefaultOption.has(button)) {
                console.log("[AT] User chose the same option twice, skipping. And reenabling button.");
                confirmedDefaultOption.delete(button);
                return;
            }
            
            const optedTariffWrapper = button.closest(SELECTORS.tariffWrapper);
            
            const optedTariffProperties = {
                tariffName: optedTariffWrapper.querySelector(SELECTORS.tariffName).textContent,
            };
            
            if(!optedTariffProperties.tariffName || optedTariffProperties.tariffName == "Business") {
                console.log("[AT] Skipping promotional, business already selected.");
                return;
            }

            const flightTariffs = optedTariffWrapper.parentElement;
            const tariffsTags = flightTariffs.querySelectorAll(SELECTORS.tariffName);

            const tariffTagBusiness = [...tariffsTags].find((tariff) => {
                return tariff.textContent == "Business";
            });

            if(!tariffTagBusiness) {
                console.log("[AT] Business tariff not found in flight tariffs, skipping upgrade promo.");
                return;
            }

            const upgradeTariffWrapper = tariffTagBusiness.closest(SELECTORS.tariffWrapper);

            if(!upgradeTariffWrapper) {
                console.log("[AT] Business tariff not found, skipping upgrade promo.");
                return;
            }

            // In this variant, we always show the Business tariff as the upgrade option
            const promotionalTariff = tariffs.business;

            const upgradeTariffProperties = {
                ...promotionalTariff,
                tariffButton: upgradeTariffWrapper.querySelector(SELECTORS.tariffButton),
            };

            if(!upgradeTariffProperties.tariffButton) {
                console.log("[AT] No tariff button found, skipping upgrade promo. Flight not available.");
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const changeTariff = await showUpgradeTariffModal(upgradeTariffProperties);

            confirmedDefaultOption.add(button);

            const newEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            });

            analyticsEvent(changeTariff, upgradeTariffProperties.name);

            if(!changeTariff) {
                console.log("[AT] User cancelled upgrade.");
                
                button.dispatchEvent(newEvent);
                console.log("[AT] Re-dispatching click event to re-enable button.");
                return;
            }

            console.log("[AT] User confirmedDefaultOption upgrade to:", upgradeTariffProperties.name);

            newEvent.isUpgradedInjected = true;
            upgradeTariffProperties.tariffButton.dispatchEvent(newEvent);
            
            return;
        }

        function showUpgradeTariffModal(tariff) {
            console.log("[AT] Showing upgrade tariff modal for:", tariff);

            return new Promise((resolve) => {
                const modal = document.createElement("div");
                modal.classList.add("inject-upgrade-tariffContainer");

                modal.innerHTML = `
                    <div class="inject-upgrade-tariff [tariff_class]" role="alert" aria-label="Oferta de melhoria de tarifa">
                        <div class="inject-upgrade-tariff__benefits">
                            <h2 class="inject-upgrade-tariff__benefits__title">[tariff_title]</h2>
                            <p class="inject-upgrade-tariff__benefits__description">[tariff_description]</p>
                            <ul class="inject-upgrade-tariff__benefits__list"></ul>
                            <p class="inject-upgrade-tariff__benefits__note">*Por passageiro</p>
                        </div>
                        <div class="inject-upgrade-tariff__cta">
                            <h3 class="inject-upgrade-tariff__name">
                                Faça um upgrade para <span class="inject-upgrade-tariff__name__highlight">[tariff_name]</span>
                            </h3>
                            <button class="inject-upgrade-tariff__button">[tariff_button]</button>
                            <button class="inject-upgrade-tariff__close">Manter tarifa atual</button>
                        </div>
                    </div>
                `;

                modal.innerHTML = modal.innerHTML.replace(/\[tariff_class\]/g, tariff.class);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_name\]/g, tariff.name);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_button\]/g, tariff.buttonText);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_title\]/g, tariff.title);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_description\]/g, tariff.description);

                tariff.benefits.forEach((benefit) => {
                    modal.querySelector(".inject-upgrade-tariff__benefits__list").appendChild(
                        document.createElement("li")
                    ).classList.add("inject-upgrade-tariff__benefits__item");
                    modal.querySelector(".inject-upgrade-tariff__benefits__list").lastChild.textContent = benefit;
                });

                document.body.appendChild(modal);

                modal.querySelector(".inject-upgrade-tariff__button").addEventListener("click", (event) => {
                    event.preventDefault();
                    modal.classList.add("injectLoader");
                    setTimeout(() => {
                        resolve(true);
                        document.body.removeChild(modal);
                    }, 100);
                });

                modal.querySelector(".inject-upgrade-tariff__close").addEventListener("click", (event) => {
                    event.preventDefault();
                    modal.classList.add("injectLoader");
                    setTimeout(() => {
                        resolve(false);
                        document.body.removeChild(modal);
                    }, 100);
                });
            });
        }

        function injectCustomStyle() {
            const style = document.createElement("style");

            style.innerHTML = `
                .inject-upgrade-tariffContainer {
                    align-items: center;
                    display: flex;
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                }
                    
                .inject-upgrade-tariff {
                    width: 767px;
                    margin: auto;
                    display: flex;
                }

                .inject-upgrade-tariffContainer:before {
                    content: "";
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: -1;
                }

                .inject-upgrade-tariff__benefits {
                    background: url("https://i.imgur.com/rMNSs7K.jpeg") no-repeat;
                    background-size: cover;
                    background-position: center;
                    border-radius: 4px 0px 0px 4px;
                    color: #FAFAFA;
                    width: 387px;
                    box-sizing: border-box;
                    gap: 16px;
                    text-align: center;
                }

                .inject-upgrade-tariff__cta {
                    gap: 24px;
                    background-color: #F9F9F9;
                    border: solid 1px #C0C0C0;
                    border-radius: 0px 4px 4px 0px;
                    flex-grow: 1;
                }

                .inject-upgrade-tariff__benefits, .inject-upgrade-tariff__cta {
                    padding: 24px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .inject-upgrade-tariff__benefits__description,
                .inject-upgrade-tariff__benefits__title, 
                .inject-upgrade-tariff__name, 
                .inject-upgrade-tariff__price,
                .inject-upgrade-tariff__benefits__item,
                .inject-upgrade-tariff__benefits__note {
                    margin: 0;
                    font-family: "Helvetica Neue", Arial, Sans-Serif;
                    font-weight: 400;
                }

                .inject-upgrade-tariff__benefits__title {
                    font-size: 16px;
                }

                .inject-upgrade-tariff__benefits__description {
                    font-size: 12px;
                    color: #FFFFFF;
                }

                .inject-upgrade-tariff__benefits__item,
                .inject-upgrade-tariff__name {
                    font-size: 14px;
                }

                .inject-upgrade-tariff__benefits__note {
                    font-size: 10px;
                    color: #C0C0C0;
                    align-self: flex-start;
                }

                .inject-upgrade-tariff__benefits__list {
                    margin: 0px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    padding: 0px;
                    align-items: flex-start;
                }

                .inject-upgrade-tariff__benefits__item {
                    list-style: none;
                    display: flex;
                    gap: 13px;
                    align-items: center;
                }
                
                .inject-upgrade-tariff__benefits__item::before {
                    content: url('data:image/svg+xml,<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0.0996094C13.6368 0.0996097 17.4004 3.859 17.4004 8.5C17.4004 13.1375 13.6368 16.9004 9 16.9004C4.359 16.9004 0.59961 13.1375 0.599609 8.5C0.599609 3.859 4.359 0.0996094 9 0.0996094ZM7.81836 10.4082L5.3584 7.88184L4.7998 8.45508L7.81836 11.5547L13.582 5.63672L13.0234 5.06348L7.81836 10.4082Z" fill="%23008058"/></svg>');
                    width: 24px;
                    height: 24px;
                    padding-top: 3px;
                    box-sizing: border-box;
                }

                .inject-upgrade-tariff__benefits__item:first-child {
                    margin-left: -20px;
                }

                .inject-upgrade-tariff__benefits__item:first-child:before {
                    content: url('data:image/svg+xml,<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.77905 20.6454H9.29175C9.20179 20.6454 9.12682 20.7128 9.12682 20.7878V21.3576C9.12682 21.44 9.20179 21.5 9.29175 21.5H9.77905C9.86901 21.5 9.94398 21.4325 9.94398 21.3576V20.7878C9.94398 20.7053 9.86901 20.6454 9.77905 20.6454Z" fill="%23FAFAFA"/><path d="M14.6895 20.6454H14.2022C14.1122 20.6454 14.0373 20.7128 14.0373 20.7878V21.3576C14.0373 21.44 14.1122 21.5 14.2022 21.5H14.6895C14.7795 21.5 14.8544 21.4325 14.8544 21.3576V20.7878C14.8544 20.7053 14.7795 20.6454 14.6895 20.6454Z" fill="%23FAFAFA"/><path d="M9.28426 4.36214H14.6895C14.7795 4.36214 14.8469 4.28717 14.8469 4.18971V3.67243C14.8469 3.57497 14.7795 3.5 14.6895 3.5H9.28426C9.19429 3.5 9.12682 3.57497 9.12682 3.67243V4.18971C9.12682 4.28717 9.19429 4.36214 9.28426 4.36214Z" fill="%23FAFAFA"/><path d="M14.0373 7.78821V5.38921C14.0373 5.29175 13.9623 5.21678 13.8723 5.21678H13.385C13.2951 5.21678 13.2201 5.29175 13.2201 5.38921V7.78821H10.7686V5.38921C10.7686 5.29175 10.6937 5.21678 10.6037 5.21678H10.1164C10.0264 5.21678 9.95148 5.29175 9.95148 5.38921V7.78821H8.99938C8.17472 7.78821 7.5 8.46293 7.5 9.28759V18.2838C7.5 19.1085 8.17472 19.7832 8.99938 19.7832H14.9969C15.8215 19.7832 16.4963 19.1085 16.4963 18.2838V9.28759C16.4963 8.46293 15.8215 7.78821 14.9969 7.78821H14.0373ZM14.8544 11.2143V16.8294H14.0373V11.2143H14.8544ZM12.403 10.3596V17.2793H11.5858V10.3596H12.403ZM9.95148 11.2143V16.8294H9.13432V11.2143H9.95148Z" fill="%23FAFAFA"/></svg>');
                    padding-top: 0px;
                    margin-left: -11px;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item:first-child:after {
                    content: "3x";
                }

                .inject-upgrade-tariff__benefits__item:first-child:after {
                    order: -1;
                    font-weight: 700;
                    font-size: 14px;
                    width: 18px;
                }

                .inject-upgrade-tariff__button {
                    background-color: rgb(0, 128, 88);
                    border: none;
                    border-radius: 4px;
                    color: #FFFFFF;
                    cursor: pointer;
                    min-height: 40px;
                    padding: 12px 16px;
                    font-weight: 400;
                    font-size: 14px;
                    width: 300px;
                }

                .inject-upgrade-tariff__button:hover{
                    background-color: rgb(0, 100, 80)
                }

                .inject-upgrade-tariff__close {
                    cursor: pointer;
                    background-color: transparent;
                    border: none;
                    color: #026CB6;
                    font-size: 16px;
                    font-weight: 400;
                    padding: 0;
                }

                .inject-upgrade-tariff__name {
                    color: #606060;
                    font-size: 14px;
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }

                .inject-upgrade-tariff__name__highlight {
                    border-radius: 2px;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__name__highlight {
                    background-color: #041E4299;
                    color: #FFFFFF;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__name__highlight::after{
                    content: url('data:image/svg+xml,<svg width="17" height="20" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(%23filter0_d_812_8752)"><rect x="8.5" y="4.5" width="6" height="6" rx="1.5" transform="rotate(45 8.5 4.5)" fill="url(%23paint0_linear_812_8752)"></rect></g><defs><filter id="filter0_d_812_8752" x="0.878662" y="5.12109" width="15.2427" height="15.2432" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="4"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feColorMatrix type="matrix" values="0 0 0 0 0.0156863 0 0 0 0 0.117647 0 0 0 0 0.258824 0 0 0 0.12 0"></feColorMatrix><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_812_8752"></feBlend><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_812_8752" result="shape"></feBlend></filter><linearGradient id="paint0_linear_812_8752" x1="11.5" y1="4.5" x2="11.5" y2="10.5" gradientUnits="userSpaceOnUse"><stop stop-color="white"></stop><stop offset="1" stop-color="%238D8D8D"></stop></linearGradient></defs></svg>');
                    height: 16px;
                    width: 16px;
                    margin-top: -4.5px;
                }

                .inject-upgrade-tariff__price {
                    color: #026CB6;
                    font-weight: 300;
                    font-size: 24px;
                    line-height: 100%;
                }

                .inject-upgrade-tariff__price__currency {
                    margin-right: 2px;
                }

                .inject-upgrade-tariff__price__cents,
                .inject-upgrade-tariff__price__currency {
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 0;
                }

                .injectLoader::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(0deg);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 5px solid transparent;
                    border-top-color: #026cb6;
                    border-bottom-color: #026cb6;
                    animation: injectRotate 1s linear infinite;
                }

                .injectLoader .inject-upgrade-tariff {
                    pointer-events: none;
                }

                @keyframes injectRotate {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(360deg);
                    }
                }
            `;

            document.head.appendChild(style);
        }

        function analyticsEvent(upgraded, offerTariff) {
            if(upgraded === undefined || !offerTariff) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = "AT_upgrade_tarifa_v2 " + offerTariff + (upgraded ? "--Aceita" : "--Recusada");

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
    };

    checkIfDomReady();
})();