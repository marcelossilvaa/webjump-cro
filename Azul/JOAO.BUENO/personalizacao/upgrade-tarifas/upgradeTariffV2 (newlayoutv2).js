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
            description: "Com toda a comodidade, gastronomia e entretenimento de primeira, a Azul Business e sua Tripulação vão fazer você se sentir mais do que especial.",
            buttonText: "Eu quero",
            benefits: [
                "Poltronas 100% Reclináveis",
                "Acesso a Lounges VIP",
                "Cardápio Gourmet"
            ],
            carousel: [
                {
                    image: "https://i.imgur.com/mtTfylh.jpeg",
                    title: "Poltronas que viram cama",
                },
                {
                    image: "https://i.imgur.com/ZQQ2R06.jpeg",
                    title: "Refeições especiais e saborosas",
                },
                {
                    image: "https://www.voeazul.com.br/content/dam/azul/folder/lounges/loungeazul400x250cima.png",
                    title: "Lounge VIP",
                }
            ]
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
                        <h2 class="inject-upgrade-tariff__title">Que tal um upgrade?</h2>
                        <div class="inject-upgrade-tariff__content">
                            <div class="inject-upgrade-tariff__carousel">
                                <div class="inject-upgrade-tariff__carousel__items">
                                </div>
                                <div class="inject-upgrade-tariff__carousel__arrows">
                                    <button title="Anterior" class="inject-upgrade-tariff__carousel__arrows__prev" data-direction="left">
                                        <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4.375 7.5C5.94243 9.24559 7.50078 10.9993 9.0625 12.75L9.625 12.26L5.38281 7.5L9.625 2.75169L9.0625 2.25C7.49144 3.99233 5.95289 5.76379 4.375 7.5Z" fill="white"/>
                                        </svg>    
                                    </button>
                                    <button title="Próximo" class="inject-upgrade-tariff__carousel__arrows__next" data-direction="right">
                                        <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.625 7.5C8.05757 5.75441 6.49922 4.00065 4.9375 2.25L4.375 2.73999L8.61719 7.5L4.375 12.2483L4.9375 12.75C6.50856 11.0077 8.04711 9.23621 9.625 7.5Z" fill="white"/>
                                        </svg>    
                                    </button>
                                </div>
                            </div>
                            <div class="inject-upgrade-tariff__informations">
                                <h3 class="inject-upgrade-tariff__name">
                                    Faça um upgrade para <span class="inject-upgrade-tariff__name__highlight">[tariff_name]</span>
                                </h3>
                                <p class="inject-upgrade-tariff__subtitle">[tariff_description]</p>
                                <div class="inject-upgrade-tariff__divider"></div>
                                <ul class="inject-upgrade-tariff__benefits__list">
                                    <li class="inject-upgrade-tariff__benefits__item">
                                        <div>Bagagem despachada (23kg)*</div>
                                        <p>*Por passageiro</p>
                                    </li>
                                </ul>
                                <div class="inject-upgrade-tariff__divider"></div>
                                <button class="inject-upgrade-tariff__button">[tariff_button]</button>
                                <button class="inject-upgrade-tariff__close">Manter tarifa atual</button>
                            </div>
                        </div>
                    </div>
                `;

                modal.innerHTML = modal.innerHTML.replace(/\[tariff_class\]/g, tariff.class);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_name\]/g, tariff.name);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_button\]/g, tariff.buttonText);
                modal.innerHTML = modal.innerHTML.replace(/\[tariff_description\]/g, tariff.description);

                tariff.benefits.forEach((benefit) => {
                    modal.querySelector(".inject-upgrade-tariff__benefits__list").appendChild(
                        document.createElement("li")
                    ).classList.add("inject-upgrade-tariff__benefits__item");
                    modal.querySelector(".inject-upgrade-tariff__benefits__list").lastChild.textContent = benefit;
                });

                tariff.carousel.forEach((carouselItem) => {
                    const carouselItemHtml = `
                        <div class="inject-upgrade-tariff__carousel__item__image" style="background-image: url(`+ carouselItem.image +`)"></div>
                        <div class="inject-upgrade-tariff__carousel__item__description">`+ carouselItem.title +`</div>`;

                    modal.querySelector(".inject-upgrade-tariff__carousel__items").appendChild(
                        document.createElement("li")
                    ).classList.add("inject-upgrade-tariff__carousel__item");
                    modal.querySelector(".inject-upgrade-tariff__carousel__items").lastChild.innerHTML = carouselItemHtml;
                });

                let current_scroll_inject = 0;
                modal.querySelectorAll(".inject-upgrade-tariff__carousel__arrows button").forEach((button) => {
                    button.addEventListener("click", (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const direction = button.dataset.direction;
                        const itemWidth = modal.querySelector(".inject-upgrade-tariff__carousel__item").offsetWidth;
                        const maxScrollLeft = ((modal.querySelector(".inject-upgrade-tariff__carousel__items").children.length) - 1) * itemWidth;
                        const targetScrollLeft = direction === "left" ? current_scroll_inject - itemWidth : current_scroll_inject + itemWidth;
                        current_scroll_inject = targetScrollLeft;

                        if (current_scroll_inject > maxScrollLeft) {
                            current_scroll_inject = 0;
                        } else if (current_scroll_inject < 0) {
                            current_scroll_inject = maxScrollLeft;
                        }

                        modal.querySelector(".inject-upgrade-tariff__carousel__items").scrollLeft = current_scroll_inject;
                    });
                });
                
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

                document.body.appendChild(modal);
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

                .inject-upgrade-tariffContainer p {
                    margin: 0;
                }
                    
                .inject-upgrade-tariff {
                    width: 761px;
                    background-color: #FFFFFF;
                    margin: auto;
                    border-radius: 16px;
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
                    font-family: Arial, Sans-Serif;
                    font-weight: 400;
                }

                .inject-upgrade-tariff__benefits__title {
                    font-size: 16px;
                }

                .inject-upgrade-tariff__benefits__description {
                    font-size: 12px;
                }

                .inject-upgrade-tariff__benefits__item,
                .inject-upgrade-tariff__name {
                    font-size: 14px;
                }

                .inject-upgrade-tariff__benefits__note {
                    font-size: 10px;
                    align-self: flex-start;
                }

                .inject-upgrade-tariff__benefits__list {
                    margin: 0px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
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

                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item::before {
                    content: url('data:image/svg+xml,<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(%23clip0_889_2985)"><path d="M8.15061 0.412964C12.2722 0.412964 15.6176 3.73007 15.6176 7.82507C15.6176 11.917 12.2722 15.2372 8.15061 15.2372C4.02527 15.2372 0.683595 11.917 0.683594 7.82507C0.683594 3.73007 4.02527 0.412964 8.15061 0.412964ZM7.10026 9.50878L4.91363 7.27964L4.4171 7.78544L7.10026 10.5204L12.2235 5.29865L11.727 4.79285L7.10026 9.50878Z" fill="white"/></g><defs><clipPath id="clip0_889_2985"><rect width="16" height="15" fill="white" transform="translate(0.150391 0.325073)"/></clipPath></defs></svg>');
                }

                .inject-upgrade-tariff__benefits__item:first-child {
                    flex-direction: column;
                    margin-left: 0;
                    align-items: baseline;
                    gap: 0;
                }

                .inject-upgrade-tariff__benefits__item:first-child div {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    color: #041E42;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item:first-child div {
                    color: #FFFFFF;
                }

                .inject-upgrade-tariff__benefits__item:first-child p {
                    font-family: Arial;
                    font-weight: 400;
                    font-size: 11px;
                    line-height: 16px;
                    text-align: center;
                    vertical-align: middle;
                    color: #606060;
                }
                
                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item:first-child p  {
                    color: #C0C0C0;
                }

                .inject-upgrade-tariff__benefits__item:first-child::before {
                    content: "";
                    display: none;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item:first-child div:before {
                    content: url('data:image/svg+xml,<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.77905 20.6454H9.29175C9.20179 20.6454 9.12682 20.7128 9.12682 20.7878V21.3576C9.12682 21.44 9.20179 21.5 9.29175 21.5H9.77905C9.86901 21.5 9.94398 21.4325 9.94398 21.3576V20.7878C9.94398 20.7053 9.86901 20.6454 9.77905 20.6454Z" fill="%23FAFAFA"/><path d="M14.6895 20.6454H14.2022C14.1122 20.6454 14.0373 20.7128 14.0373 20.7878V21.3576C14.0373 21.44 14.1122 21.5 14.2022 21.5H14.6895C14.7795 21.5 14.8544 21.4325 14.8544 21.3576V20.7878C14.8544 20.7053 14.7795 20.6454 14.6895 20.6454Z" fill="%23FAFAFA"/><path d="M9.28426 4.36214H14.6895C14.7795 4.36214 14.8469 4.28717 14.8469 4.18971V3.67243C14.8469 3.57497 14.7795 3.5 14.6895 3.5H9.28426C9.19429 3.5 9.12682 3.57497 9.12682 3.67243V4.18971C9.12682 4.28717 9.19429 4.36214 9.28426 4.36214Z" fill="%23FAFAFA"/><path d="M14.0373 7.78821V5.38921C14.0373 5.29175 13.9623 5.21678 13.8723 5.21678H13.385C13.2951 5.21678 13.2201 5.29175 13.2201 5.38921V7.78821H10.7686V5.38921C10.7686 5.29175 10.6937 5.21678 10.6037 5.21678H10.1164C10.0264 5.21678 9.95148 5.29175 9.95148 5.38921V7.78821H8.99938C8.17472 7.78821 7.5 8.46293 7.5 9.28759V18.2838C7.5 19.1085 8.17472 19.7832 8.99938 19.7832H14.9969C15.8215 19.7832 16.4963 19.1085 16.4963 18.2838V9.28759C16.4963 8.46293 15.8215 7.78821 14.9969 7.78821H14.0373ZM14.8544 11.2143V16.8294H14.0373V11.2143H14.8544ZM12.403 10.3596V17.2793H11.5858V10.3596H12.403ZM9.95148 11.2143V16.8294H9.13432V11.2143H9.95148Z" fill="%23FAFAFA"/></svg>');
                    padding-top: 0px;
                }

                .inject-upgrade-tariff__benefits__item:first-child div:before {
                    content: url('data:image/svg+xml,<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(%23clip0_895_9323)"><path d="M10.7179 20.4424H10.2501C10.1638 20.4424 10.0918 20.5071 10.0918 20.5791V21.1261C10.0918 21.2052 10.1638 21.2628 10.2501 21.2628H10.7179C10.8043 21.2628 10.8763 21.198 10.8763 21.1261V20.5791C10.8763 20.4999 10.8043 20.4424 10.7179 20.4424Z" fill="%23041E42"/><path d="M15.4318 20.4424H14.964C14.8776 20.4424 14.8057 20.5071 14.8057 20.5791V21.1261C14.8057 21.2052 14.8776 21.2628 14.964 21.2628H15.4318C15.5182 21.2628 15.5901 21.198 15.5901 21.1261V20.5791C15.5901 20.4999 15.5182 20.4424 15.4318 20.4424Z" fill="%23041E42"/><path d="M10.2429 4.81056H15.432C15.5184 4.81056 15.5831 4.73859 15.5831 4.64503V4.14844C15.5831 4.05488 15.5184 3.98291 15.432 3.98291H10.2429C10.1566 3.98291 10.0918 4.05488 10.0918 4.14844V4.64503C10.0918 4.73859 10.1566 4.81056 10.2429 4.81056Z" fill="%23041E42"/><path d="M14.8061 8.09943V5.79639C14.8061 5.70283 14.7341 5.63086 14.6477 5.63086H14.1799C14.0936 5.63086 14.0216 5.70283 14.0216 5.79639V8.09943H11.6681V5.79639C11.6681 5.70283 11.5962 5.63086 11.5098 5.63086H11.042C10.9556 5.63086 10.8837 5.70283 10.8837 5.79639V8.09943H9.96968C9.178 8.09943 8.53027 8.74716 8.53027 9.53884V18.1752C8.53027 18.9669 9.178 19.6146 9.96968 19.6146H15.7273C16.5189 19.6146 17.1667 18.9669 17.1667 18.1752V9.53884C17.1667 8.74716 16.5189 8.09943 15.7273 8.09943H14.8061ZM15.5905 11.3885V16.779H14.8061V11.3885H15.5905ZM13.2372 10.568V17.2109H12.4526V10.568H13.2372ZM10.8837 11.3885V16.779H10.0992V11.3885H10.8837Z" fill="%23041E42"/></g><defs><clipPath id="clip0_895_9323"><rect width="24" height="24" fill="white" transform="translate(0.849609 0.622803)"/></clipPath></defs></svg>')
                }

                .inject-upgrade-tariff__benefits__item:first-child div:after {
                    color: #041E42;
                }
                
                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item:first-child div:after {
                    color: #FFF;
                }

                .inject-upgrade-tariff--maisAzul .inject-upgrade-tariff__benefits__item:first-child div:after {
                    content: "1x";
                }

                .inject-upgrade-tariff--azulSuper .inject-upgrade-tariff__benefits__item:first-child div:after {
                    content: "2x";
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item:first-child div:after {
                    content: "3x";
                }

                .inject-upgrade-tariff__benefits__item:first-child div:after {
                    order: -1;
                    font-weight: 700;
                    font-size: 14px;
                    width: 18px;
                    margin-right: -5px;
                }

                .inject-upgrade-tariff__divider {
                    width: 240px;
                    display: none;
                    border-top: solid 1px #FFFFFF;
                    opacity: .15;
                    align-self: center;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__divider {
                    display: block;
                }

                .inject-upgrade-tariff__button {
                    background-color: #008058;
                    border: none;
                    border-radius: 4px;
                    color: #FFFFFF;
                    cursor: pointer;
                    min-height: 40px;
                    padding: 12px 16px;
                    font-weight: 400;
                    font-size: 14px;
                    min-width: 186px;
                    font-family: Arial, sans-serif;
                    align-self: center;
                }

                .inject-upgrade-tariff__button:hover{
                    background-color: rgb(0, 100, 80)
                }

                .inject-upgrade-tariff__close {
                    cursor: pointer;
                    background-color: transparent;
                    border: none;
                    font-size: 14px;
                    font-weight: 400;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    color: #026CB6;
                    align-self: center;
                }
                
                .inject-upgrade-tariff--business .inject-upgrade-tariff__close{
                    color: #FFFFFF;
                }

                .inject-upgrade-tariff__name {
                    color: #FFFFFF;
                    font-size: 14px;
                    align-items: baseline;
                    gap: 4px;
                    display: inline-flex;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                }

                .inject-upgrade-tariff__name__highlight {
                    border-radius: 2px;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 5px 6.5px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__name__highlight {
                    background: linear-gradient(163.07deg, #041E42 2.18%, #014E84 99.38%), linear-gradient(0deg, rgba(28, 54, 147, 0.12), rgba(28, 54, 147, 0.12));
                    color: #FFFFFF;
                }

                .inject-upgrade-tariff--maisAzul .inject-upgrade-tariff__name__highlight,
                .inject-upgrade-tariff--azulSuper .inject-upgrade-tariff__name__highlight {
                    background: rgba(1, 78, 132, 0.08);
                    color: rgb(2, 108, 182);
                }

                .inject-upgrade-tariff--maisAzul .inject-upgrade-tariff__name__highlight::after,
                .inject-upgrade-tariff--azulSuper .inject-upgrade-tariff__name__highlight::after {
                    content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" fill="none" viewBox="0 0 17 20"><g filter="url(%23filter0_d)"><rect width="6" height="6" x="10" y="6" fill="url(%23paint0_linear)" rx="1.5" transform="rotate(45 8 4)"></rect></g><defs><filter id="filter0_d" width="15.243" height="15.243" x="0.379" y="4.621" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="4"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.286275 0 0 0 0 0.501961 0 0 0 0 0.909804 0 0 0 0.2 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"></feBlend></filter><linearGradient id="paint0_linear" x1="11" x2="11" y1="4" y2="10" gradientUnits="userSpaceOnUse"><stop stop-color="%23026CB6"></stop><stop offset="1" stop-color="%236087F8"></stop></linearGradient></defs></svg>');
                    height: 16px;
                    width: 16px;
                    margin-top: -5.5px;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__name__highlight::after{
                    content: url('data:image/svg+xml,<svg width="17" height="20" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(%23filter0_d_812_8752)"><rect x="8.5" y="4.5" width="6" height="6" rx="1.5" transform="rotate(45 8.5 4.5)" fill="url(%23paint0_linear_812_8752)"></rect></g><defs><filter id="filter0_d_812_8752" x="0.878662" y="5.12109" width="15.2427" height="15.2432" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="4"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feColorMatrix type="matrix" values="0 0 0 0 0.0156863 0 0 0 0 0.117647 0 0 0 0 0.258824 0 0 0 0.12 0"></feColorMatrix><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_812_8752"></feBlend><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_812_8752" result="shape"></feBlend></filter><linearGradient id="paint0_linear_812_8752" x1="11.5" y1="4.5" x2="11.5" y2="10.5" gradientUnits="userSpaceOnUse"><stop stop-color="white"></stop><stop offset="1" stop-color="%238D8D8D"></stop></linearGradient></defs></svg>');
                    height: 16px;
                    width: 16px;
                    margin-top: -4.5px;
                }

                .inject-upgrade-tariff__price {
                    font-size: 24px;
                    line-height: 100%;
                }

                .inject-upgrade-tariff__price__currency {
                    margin-right: 2px;
                }

                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__price__currency,
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__price__cents,
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__price,
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__description
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__note,
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__name,
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__subtitle,
                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__benefits__item {
                    color: #FFFFFF;
                }
                
                .inject-upgrade-tariff .inject-upgrade-tariff__price__currency,
                .inject-upgrade-tariff .inject-upgrade-tariff__price__cents,
                .inject-upgrade-tariff .inject-upgrade-tariff__price,
                .inject-upgrade-tariff .inject-upgrade-tariff__benefits__description
                .inject-upgrade-tariff .inject-upgrade-tariff__benefits__note,
                .inject-upgrade-tariff .inject-upgrade-tariff__name,
                .inject-upgrade-tariff .inject-upgrade-tariff__subtitle,
                .inject-upgrade-tariff .inject-upgrade-tariff__benefits__item {
                    color: #606060;
                    font-family: Arial, sans-serif;
                }

                .inject-upgrade-tariff__subtitle {
                    font-weight: 400;
                    font-size: 12px;
                    text-align: left;
                }

                .inject-upgrade-tariff__price,
                .inject-upgrade-tariff__price__cents,
                .inject-upgrade-tariff__price__currency {
                    font-weight: 700;
                }

                .inject-upgrade-tariff__price__cents,
                .inject-upgrade-tariff__price__currency {
                    font-size: 12px;
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

                .inject-upgrade-tariff__title {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-style: normal;
                    font-weight: 300;
                    font-size: 20px;
                    color: #041E42;
                    margin: 11px 0px;
                    text-align: center;
                }

                .inject-upgrade-tariff__content {
                    display: flex;
                }

                .inject-upgrade-tariff__carousel {
                    width: 450px;
                    flex-shrink: 0;
                    border-radius: 0px 0px 0px 16px;
                }

                .inject-upgrade-tariff__informations {
                    padding: 24px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-items: flex-start;
                    flex-grow: 1;
                    border-radius: 0px 0px 16px 0px;
                    border-top: #0047B0 solid 1px;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__informations {
                    border: none;
                }

                .inject-upgrade-tariff.inject-upgrade-tariff--business .inject-upgrade-tariff__informations {
                    background-color: #041E42;
                }

                .inject-upgrade-tariff__carousel {
                    position: relative;
                }

                .inject-upgrade-tariff__carousel .inject-upgrade-tariff__carousel__items {
                    display: flex;
                    height: 100%;
                    scroll-behavior: smooth;
                    overflow-x: hidden;
                    overflow-y: hidden;
                }
                
                .inject-upgrade-tariff__carousel .inject-upgrade-tariff__carousel__item {
                    display: block;
                    height: 100%;
                    width: 450px;
                    flex-shrink: 0;
                    position: relative;
                }

                .inject-upgrade-tariff__carousel__item__image {
                    background: url("https://i.imgur.com/rMNSs7K.jpeg") no-repeat;
                    background-size: cover;
                    background-position: center;
                    border-radius: 0px 0px 0px 16px;
                    width: 100%;
                    height: 100%;
                }

                .inject-upgrade-tariff__carousel__item__description {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 32px;
                    border-radius: 4px;
                    padding: 8px 12px;
                    position: absolute;
                    bottom: 24px;
                    left: 24px;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-style: Regular;
                    font-size: 12PX;
                    line-height: 13px;
                    letter-spacing: 0px;
                    vertical-align: middle;
                    color: #041E42;
                    background: #cfcfcfe8;
                }
                    
                .inject-upgrade-tariff--business .inject-upgrade-tariff__carousel__item__description {
                background: #FFFFFF29;
                    color: #FFFFFF;
                }

                .inject-upgrade-tariff--business .inject-upgrade-tariff__carousel__arrows {
                    display: flex;
                }

                .inject-upgrade-tariff__carousel__arrows {
                    position: absolute;
                    bottom: 24px;
                    right: 24px;
                    display: none;
                    justify-content: space-between;
                    align-items: center;
                    background: #FFFFFF33;
                    border-radius: 49px;
                    padding: 4.5px 10px;
                    min-height: 23px;
                    min-width: 56px;
                    box-sizing: border-box;
                    box-shadow: 0px 0px 6px 0px #00000073;
                }

                .inject-upgrade-tariff__carousel__arrows button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #FFFFFF;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    margin: 0;
                    padding: 0;
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