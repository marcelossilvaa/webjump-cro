(function() {
    const experienceName = "AT_EXPERIENCE_TICKETS_REMODELING";
    const experienceTargetUrl = "br/pt/home/tickets";
    const experienceAlreadyExecuted = window[experienceName] || false;

    const onExperienceTargetPage = () => {
        const currentUrl = window.location.pathname;
        const testUrl = experienceTargetUrl;

        return currentUrl.includes(testUrl);
    }

    const initExperienceWhenReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const isDesktop = window.innerWidth >= 1024;

        if(isDesktop) {
            console.log("[AT] Desktop detected - Experience will not be executed.");
            return;
        }

        if (isReady) {
            experienceSetup();
        } else {
            document.addEventListener("DOMContentLoaded", experienceSetup);
        }
    }
    
    if(experienceAlreadyExecuted || !onExperienceTargetPage()) {
        console.log("[AT] Page is not a correct page OR script already executed.");
        return;
    }

    window[experienceName] = true;
    initExperienceWhenReady();

    function experienceSetup() {
        console.log("[AT] Experience started:", experienceName);
        let maximumTriesToFindElements = 500;

        const SELECTORS = {
            contentWrapper: ".styles__SearchListWrapper-sc-3d0oj4-3",
            cardsContainer: ".styles__ContainerCard-sc-1b94ugj-2",
            seeMoreButton: "button[aria-label='Ver mais opções']",
            seeLessButton: "button[aria-label='Ver menos opções']",
            priceElement: ".styles__Price-sc-rusdyw-11",
            pointsElement: ".styles__Points-sc-1biltpa-1 > span",
            ticketListWrapper: ".styles__TicketListWrapper-sc-3d0oj4-1",
            sectionWrapper: ".styles__TicketsGroupWrapper-sc-3d0oj4-5",
            sectionTitle: ".styles__TitleContainerTicketsGroup-sc-1b94ugj-1"
        };

        const CLASSNAMES = {
            cardsContainer: "remodeling-cards-container",
            card: "remodeling-card",
            price: "remodeling-card-price",
            carouselDots: "remodeling-carousel-dots",
            pointsBanner: "remodeling-points-banner"
        };

        const contentWrapperObserver = new MutationObserver(contentWrapperCallback);

        init();

        function init() {
            const contentWrapper = document.querySelector(SELECTORS.contentWrapper);

            if(!contentWrapper) {
                if(maximumTriesToFindElements <= 0) return;

                maximumTriesToFindElements--;
                console.log("[AT] Waiting for content wrapper...");
                requestAnimationFrame(init);
                return;
            }

            contentWrapperObserver.observe(contentWrapper, { childList: true, subtree: false });

            // fallback para remodelar os cards caso o MutationObserver não detecte mudanças
            exibAllCards(remodelingCards);
        }

        function contentWrapperCallback(mutationsList) {
            const hasAddedNodes = mutationsList.some(mutation => mutation.addedNodes.length > 0);

            if (hasAddedNodes) {
                exibAllCards(remodelingCards);
            }
        }

        function exibAllCards(callback) {
            const seeMoreButtons = document.querySelectorAll(SELECTORS.seeMoreButton);

            [...seeMoreButtons].forEach(button => {
                button.click();
                button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                button.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
            });

            window.scrollTo({ top: 0, behavior: "auto" });
            if (callback && typeof callback === "function") callback();
        }

        function remodelingCards() {
            const cardsContainer = getCardsContainer();

            [...cardsContainer].forEach(container => {
                if(container.classList.contains(CLASSNAMES.cardsContainer)) return; // already injected, skip

                container.classList.add(CLASSNAMES.cardsContainer);

                const containerChildrens = Array.from(container.childNodes);

                containerChildrens.forEach(card => {
                    card.classList.add(CLASSNAMES.card);

                    // INJECT NEW PRICE ELEMENT
                    const priceElement = card.querySelector(SELECTORS.priceElement);
                    if (priceElement) {
                        const newPriceElement = getNewPriceElement(priceElement);

                        // replace the old price element with the new one
                        priceElement.insertAdjacentElement("afterend", newPriceElement);
                        priceElement.style.display = "none";
                    }
                });

                const carouselDots = createDots(containerChildrens.length);
                container.insertAdjacentElement("afterend", carouselDots);

                // Chama handleCarousel para cada container/dots
                handleCarousel(container, carouselDots, containerChildrens.length);
            });

            injectPointsBanner();
            injectCustomCSS();
            analyticsEvent("cards_remodeled");
        }

        /**
         * Adiciona funcionalidade de carrossel: dots navegam entre "páginas" de 2 cards,
         * e o scroll manual atualiza a dot ativa.
         * @param {HTMLElement} container - O container dos cards (overflow-x: scroll)
         * @param {HTMLElement} dotsContainer - O container das dots
         * @param {number} totalCards - Quantidade total de cards
         */
        function handleCarousel(container, dotsContainer, totalCards) {
            if (!container || !dotsContainer) return;

            const cardsPerView = 2;
            const dots = Array.from(dotsContainer.querySelectorAll("button"));
            const cards = Array.from(container.children);
            const SPACING = 12; // px, referente ao margin-right

            // Função para ativar a dot correta (idempotente)
            function setActiveDot(index) {
                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.add("active");
                    } else {
                        dot.classList.remove("active");
                    }
                });
            }

            // Ao clicar na dot, faz scroll para o grupo de cards correspondente
            dots.forEach((dot, i) => {
                dot.addEventListener("click", function() {
                    const cardIndex = i * cardsPerView;
                    if (cards[0]) {
                        const cardWidth = cards[0].getBoundingClientRect().width;
                        const left = cardIndex * (cardWidth + SPACING);
                        container.scrollTo({
                            left,
                            behavior: "smooth"
                        });
                    }
                });
            });

            // Ao scrollar manualmente, ativa a dot correspondente (considerando spacing)
            container.addEventListener("scroll", function() {
                let scrollLeft = container.scrollLeft;
                let activeIndex = 0;
                if (cards[0]) {
                    const cardWidth = cards[0].getBoundingClientRect().width;
                    for (let i = 0; i < cards.length; i += cardsPerView) {
                        // Calcula a posição esperada do início do grupo de cards
                        const expectedLeft = i * (cardWidth);
                        if (cards[i] && expectedLeft - scrollLeft <= 10) {
                            activeIndex = Math.floor(i / cardsPerView);
                        }
                    }
                }

                setActiveDot(activeIndex);
            });

            // Garante que a primeira dot está ativa no início
            setActiveDot(0);
        }

        function createDots(numberOfDots) {
            const dotsContainer = document.createElement("div");
            dotsContainer.classList.add(CLASSNAMES.carouselDots);

            // carousel should pass 2 per view, so the number of dots is the total number of cards divided by 2, rounded up
            const dotsCount = Math.ceil(numberOfDots / 2);

            for(let i = 0; i < dotsCount; i++) {
                const dot = document.createElement("button");
                dot.title = "Ir para posição do slide " + (i + 1);

                if(i === 0) dot.classList.add("active");

                dotsContainer.appendChild(dot);
            }

            return dotsContainer;
        }

        function getNewPriceElement(oldPriceElement) {
            // create the new price element based on the old one
            const newPriceElement = document.createElement("p");
            newPriceElement.classList.add(CLASSNAMES.price);

            const priceText = oldPriceElement.textContent.trim();
            const priceValue = priceText.replace(/[^0-9,]/g, ""); // remove everything except numbers and comma

            // price has two parts, the integer and the decimal, separated by a comma. I want to wrap the integer part in a strong tag and keep the decimal part outside
            const [integerPart, decimalPart] = priceValue.split(",");
            const strongElement = document.createElement("strong");
            strongElement.textContent = integerPart + (decimalPart ? "," + decimalPart : ",00");

            newPriceElement.appendChild(document.createTextNode("R$ "));
            newPriceElement.appendChild(strongElement);

            return newPriceElement;
        }

        function getCardsContainer() {
            return document.querySelectorAll(SELECTORS.cardsContainer);
        }

        function injectPointsBanner() {
            // Evita injetar o banner mais de uma vez
            if (document.querySelector("." + CLASSNAMES.pointsBanner)) return;

            const ticketListWrapper = document.querySelector(SELECTORS.ticketListWrapper);
            if (!ticketListWrapper) return;

            const pointsSpans = document.querySelectorAll(SELECTORS.pointsElement);
            if (!pointsSpans || pointsSpans.length === 0) return;

            let minPoints = Infinity;
            let maxPoints = -Infinity;

            [...pointsSpans].forEach(function(span) {
                const strongs = span.querySelectorAll("strong");
                if (strongs.length < 2) return;

                // Remove pontuação e converte para número
                const deValue = parseInt(strongs[0].textContent.replace(/\./g, "").replace(/[^0-9]/g, ""), 10);
                const ateValue = parseInt(strongs[1].textContent.replace(/\./g, "").replace(/[^0-9]/g, ""), 10);

                if (!isNaN(deValue) && deValue < minPoints) minPoints = deValue;
                if (!isNaN(ateValue) && ateValue > maxPoints) maxPoints = ateValue;
            });

            if (minPoints === Infinity || maxPoints === -Infinity) return;

            const banner = document.createElement("div");
            banner.classList.add(CLASSNAMES.pointsBanner);
            banner.innerHTML = "<span>Ganhe de <strong>" + minPoints.toLocaleString("pt-BR") + "</strong> até <strong>" + maxPoints.toLocaleString("pt-BR") + "</strong> pontos com ingressos</span>";

            // Injeta o banner como primeiro elemento dentro do ticketListWrapper
            ticketListWrapper.insertAdjacentElement("afterbegin", banner);
        }

        function injectCustomCSS() {
            const style = document.createElement("style");

            style.innerHTML = `
                [POINTS_BANNER_CLASS] {
                    width: 100dvw;
                    margin-left: -16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 48px;
                    background: linear-gradient(90deg, #0148AF 0%, #007AD8 100%);
                }

                [POINTS_BANNER_CLASS] > span {
                    color: #FFFFFF;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 13px;
                    font-weight: 400;
                    line-height: 16.25px;
                }

                [POINTS_BANNER_CLASS] > span > strong {
                    font-weight: 700;
                }

                [CARD_CONTAINER_CLASS] {
                    flex-wrap: nowrap !important;
                    gap: 0px !important;
                    justify-content: flex-start !important;
                    overflow-x: auto;
                }

                [CARD_CONTAINER_CLASS] * {
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
                }

                [CARD_CLASS] {
                    width: 160px !important;
                    height: 100% !important;
                    flex-shrink: 0 !important;
                    border-radius: 4px;
                    border: 1px solid #D5D5D5;
                    background: #FFF;
                    box-shadow: 0 4px 16px 0 rgba(4, 30, 66, 0.16);
                    padding: 0px;
                    margin-right: 12px !important;
                }

                [CARD_CLASS]:last-child {
                    margin-right: 0px !important;
                }

                [CARD_CLASS] > div > img {
                    height: 100px !important;
                    max-height: 100px !important;
                    min-height: 100px !important;
                }

                [CARD_CLASS] > div > div {
                    padding: 8px 8px 12px 8px !important;
                    gap: 4px !important;
                }
                
                [CARD_CLASS] > div > div > div {
                    height: 36px !important;
                }
                    
                [CARD_CLASS] > div > div > div > span {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    color: #041E42;
                    text-overflow: ellipsis;
                    white-space: normal;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: 13.75px;
                }

                [CARD_CLASS] > div > div > section > p {
                    font-size: 10px !important;
                    line-height: 11.25px !important;
                }

                [CARD_CLASS] > div > div > section > div {
                    flex-direction: column !important;
                    gap: 2px !important;
                }

                [CARD_CLASS] [PRICE_CLASS] {
                    color: #026CB6;
                    font-size: 9px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: 13.5px;
                }

                [CARD_CLASS] [PRICE_CLASS] > strong {
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: 14px;
                }

                [CARD_CLASS] > div > div > section > div > span {
                    color: #606060;
                    font-size: 10px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 11.25px;
                }

                [CARD_CLASS] > div:last-child {
                    padding: 6px !important;
                    max-height: unset !important;
                    justify-content: center !important;
                    align-items: center !important;
                    text-align: center !important;
                }

                [CARD_CLASS] > div:last-child > span {
                    color: #FFF;
                    text-align: center;
                    font-size: 9px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 9px;
                }

                [CARD_CLASS] > div:last-child > strong {
                    font-weight: 700;
                }

                [CARD_CLASS] > div:last-child > div {
                    display: none !important;
                }

                [SECTION_TITLE_CLASS] {
                    margin-bottom: 12px !important;
                }

                [SECTION_TITLE_CLASS] span {
                    color: #041E42;
                    font-size: 16px !important;
                    font-style: normal;
                    font-weight: 700 !important;
                    line-height: 24px !important;
                }

                [SEE_LESS_BUTTON_CLASS] {
                    display: none !important;
                }

                [SECTION_WRAPPER_CLASS] {
                    padding: 0px !important;
                    margin-bottom: 24px !important;
                    margin-top: 0px !important;
                    border: none !important;
                }

                [CAROUSEL_DOTS_CLASS] {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    margin-top: 10px;
                }

                [CAROUSEL_DOTS_CLASS] > button {
                    border-radius: 8px;
                    border: 1px solid #606060;
                    height: 8px;
                    width: 8px;
                    background: transparent;
                    cursor: pointer;
                    padding: 0;
                    display: block;
                }

                [CAROUSEL_DOTS_CLASS] > button.active {
                    height: 10px;
                    width: 10px;
                    border-radius: 10px;
                    background: #041E42;
                    border-color: #041E42;
                }
            `;

            style.innerHTML = style.innerHTML.replaceAll(/\[CARD_CLASS\]/g, "." + CLASSNAMES.card);
            style.innerHTML = style.innerHTML.replaceAll(/\[CARD_CONTAINER_CLASS\]/g, "." + CLASSNAMES.cardsContainer);
            style.innerHTML = style.innerHTML.replaceAll(/\[PRICE_CLASS\]/g, "." + CLASSNAMES.price);
            style.innerHTML = style.innerHTML.replaceAll(/\[SECTION_TITLE_CLASS\]/g, SELECTORS.sectionTitle);
            style.innerHTML = style.innerHTML.replaceAll(/\[SEE_LESS_BUTTON_CLASS\]/g, SELECTORS.seeLessButton);
            style.innerHTML = style.innerHTML.replaceAll(/\[SECTION_WRAPPER_CLASS\]/g, SELECTORS.sectionWrapper);
            style.innerHTML = style.innerHTML.replaceAll(/\[CAROUSEL_DOTS_CLASS\]/g, "." + CLASSNAMES.carouselDots);
            style.innerHTML = style.innerHTML.replaceAll(/\[POINTS_BANNER_CLASS\]/g, "." + CLASSNAMES.pointsBanner);

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
                var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
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