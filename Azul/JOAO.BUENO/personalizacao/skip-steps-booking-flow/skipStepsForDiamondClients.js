(function() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    const eventTrigger = isTouchDevice ? new TouchEvent('touchstart', { bubbles: true }) : new MouseEvent('click', { bubbles: true });

    let stepsAlreadySkipped = false;

    const SELECTORS = {
        bodyWithModalOpen: "ReactModal__Body--open",
        buttonSeatsClose: "button.modal-title__close",
        loaderSeatStep: ".ReactModal__Overlay .loading",
        clientTierOnReviewStep: ".passenger-info .tier",
        clientTierOnLoggedElement: "header .css-surmsm",
        luggageCountOnReviewStep: ".luggage-items .luggages",
        servicesOptionsOnReviewStep: ".passenger-card__content button",
        confirmTravellerButton: "button[aria-label='Ir para escolha de assentos']",
        responsibleForm: "#responsibleForm",
        invalidResponsibleFormLabel: ".css-fq66gi",
        invalidFormGroupResponsibleForm: ".css-1enaijg",
        totalPassengerByDetailsLabel: ".css-x5worp strong",
        passengersCard: ".passengers-container .passenger-card",
        buttonGoToPaymentOnReview: "button[aria-label='Ir para pagamento']",
    };

    let tierClientOnTravellDataStep = "";

    const checkIfDomReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";

        if (isReady) {
            initSkipSteps();
        } else {
            document.addEventListener("DOMContentLoaded", initSkipSteps);
        }
    }

    function initSkipSteps() {
        console.log("[AT] Initializing skip steps for diamond clients.");
        injectCustomStyles();
        observerFormSteps();

        function observerFormSteps() {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if(mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                        const hasTierOnCurrentStep = document.querySelector(SELECTORS.clientTierOnReviewStep)?.textContent;

                        if(hasTierOnCurrentStep) {
                            tierClientOnTravellDataStep = hasTierOnCurrentStep;
                        }

                        const travellerButon = document.querySelector(SELECTORS.confirmTravellerButton);

                        if(travellerButon && stepsShouldBeSkipped()) { // Traveller step, next is the review step
                            travellerButon.textContent = "Ir para pagamento";

                            const formTravellerResponsible = document.querySelector(SELECTORS.responsibleForm);

                            formTravellerResponsible.addEventListener("submit", () => {
                                const hasInvalidInputs = document.querySelector(SELECTORS.invalidResponsibleFormLabel) || document.querySelector(SELECTORS.invalidFormGroupResponsibleForm);

                                if(hasInvalidInputs) {
                                    console.log("FORMULÁRIO INVALIDO");
                                    return;
                                }

                                console.log("FORMULÁRIO ENVIADO"); 

                                createLoader();
                                waitForSeatsModalOpen();
                            });
                        } else {
                            console.log("[AT] Not in traveller step or steps not should be skipped.");
                            console.log("travellerButon", travellerButon);
                            console.log("stepsShouldBeSkipped", stepsShouldBeSkipped());
                        }
                    }
                }
            });

            const mainElement = document.querySelector("main");

            if(!mainElement) {
                console.log("[AT] Main element not found.");
                return;
            }

            observer.observe(mainElement, { childList: true });
        }

        function waitForSeatsModalOpen() {
            console.log("[AT] Waiting for seats modal to open.");
            const modalSeatsIsLoading = document.querySelector(SELECTORS.loaderSeatStep);
            const alreadyHasButtonPayment = document.querySelector(SELECTORS.buttonGoToPaymentOnReview);

            if(modalSeatsIsLoading && alreadyHasButtonPayment && isReviewStep() && isStepForAirplaneSeats()) {
                skipSteps();
                return;
            }

            requestAnimationFrame(waitForSeatsModalOpen);
        }

        function skipSteps() {
            console.log("SKIP STEPS");
            
            stepsAlreadySkipped = true;
            
            const intervalToGoToPayment = setInterval(() => {
                const buttonGoToPaymentOnReview = document.querySelector(SELECTORS.buttonGoToPaymentOnReview);

                if(buttonGoToPaymentOnReview) {
                    analyticsEvent("Assentos, Bagagens e Review pulados");
                    removeLoaderWhenInPaymentStep();
                    clearInterval(intervalToGoToPayment);
                    buttonGoToPaymentOnReview.dispatchEvent(eventTrigger);
                }
            }, 100);

            // Error treatment, remove loader in case of luggage info error
            setTimeout(() => {
                document.querySelector(".skipStepsInject__loader")?.remove();
                document.body.style.overflow = "auto";
            }, 60000);

            console.log("[AT] Steps skipped.");
        }

        function removeLoaderWhenInPaymentStep() {
            if(!isReviewStep()) {
                document.querySelector(".skipStepsInject__loader")?.remove();
                document.body.style.overflow = "auto";
            }

            requestAnimationFrame(removeLoaderWhenInPaymentStep);
        }

        function stepsShouldBeSkipped() {
            console.log("[AT] Client is diamond: ", clientIsDiamond());
            console.log("[AT] Flight is for one person: ", flightIsForOnePerson());
            console.log("[AT] Steps already skipped: ", stepsAlreadySkipped);

            return clientIsDiamond() && !stepsAlreadySkipped && flightIsForOnePerson();
        }

        function isStepForAirplaneSeats() {
            return document.body.classList.contains(SELECTORS.bodyWithModalOpen) && isReviewStep();
        }

        function clientIsDiamond() {
            const userClassificationOnReviewStep = document.querySelector(SELECTORS.clientTierOnReviewStep)?.textContent;
            const userClassificationOnLoggedElement = document.querySelector(SELECTORS.clientTierOnLoggedElement)?.textContent;
            const userClassificationOnAzulObject = window.azulObject?.user?.userClassification;
            const userClassification =  userClassificationOnAzulObject || userClassificationOnLoggedElement || userClassificationOnReviewStep || tierClientOnTravellDataStep || "";

            return userClassification.toLowerCase() == "azul diamante";
        }

        function flightIsForOnePerson() {
            const azulObjectAdultPassengers = Number(window.azulObject?.passenger?.adultsQuantity) || 0;
            const azulObjectChildrenPassengers = Number(window.azulObject?.passenger?.childrensQuantity) || 0;
            const azulObjectBabyPassengers = Number(window.azulObject?.passenger?.babysQuantity) || 0;

            const totalPassengerByAzulObject = azulObjectAdultPassengers + azulObjectChildrenPassengers + azulObjectBabyPassengers;
            const totalPassengerByDetailsLabel = parseInt(document.querySelector(SELECTORS.totalPassengerByDetailsLabel)?.textContent) || 0;
            const totalPassengersByCountOfSections = document.querySelectorAll(SELECTORS.passengersCard).length;

            return (totalPassengersByCountOfSections || totalPassengerByDetailsLabel || totalPassengerByAzulObject) < 2;
        }

        function isReviewStep() {
            const currentUrl = window.location.pathname;
            const targetUrl = "/review";

            return currentUrl.includes(targetUrl);
        }

        function createLoader() {
            const loader = document.createElement("div");
            loader.classList.add("skipStepsInject__loader");

            const loaderLoading = document.createElement("div");
            loaderLoading.classList.add("skipStepsInject__loader-loading");
            
            loader.appendChild(loaderLoading);
            loader.innerHTML += `<h3>Você será redirecionado para a página de pagamento...</h3>`;

            document.body.style.overflow = "hidden";
            document.body.appendChild(loader);
        }

        function injectCustomStyles() {
            const style = document.createElement("style");
            
            style.innerHTML = `
                .skipStepsInject__loader {
                    align-items: center;
                    background: #041e42;
                    background-image: url('https://www.voeazul.com.br/content/dam/azul-airlines/wallet/payment/splash.svg');
                    background-size: cover;
                    background-position: center center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 16px;
                    position: fixed;
                    top: 64px;
                    width: 100%;
                    z-index: 2001;
                }
                
                .skipStepsInject__loader h3 {
                    font-family: "Helvetica Neue", Arial;
                    font-weight: 300;
                    font-size: 24px;
                    line-height: 29px;
                    text-align: center;
                    margin: 16px 0px 0px;
                    color: #FFFFFF;
                }

                .skipStepsInject__loader-loading {
                    position: relative;
                    border-radius: 50%;
                    mask: radial-gradient(farthest-side, rgba(0, 0, 0, 0) calc(100% - 1px), rgb(0, 0, 0) 0px);
                    animation: 0.8s linear 0s infinite normal none running injectRotate;
                    width: 48px;
                    height: 48px;
                    background: conic-gradient(rgba(255, 255, 255, 0) 10%, rgb(255, 255, 255));
                }

                @media screen and (max-width: 1023px) {
                    .skipStepsInject__loader {
                        height: 100dvh;
                        top: 0px;
                    }
                }

                @media screen and (min-width: 1024px) {
                    .skipStepsInject__loader {
                        height: calc(-64px + 100dvh);
                    }
                }

                @keyframes injectRotate {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `;
            
            document.head.appendChild(style);
        }

        function analyticsEvent(eventLabel) {
            if(eventLabel === undefined || !eventLabel) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = "AT_skip_steps_diamond " + eventLabel;

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

    if(window.skipStepForDiamondClients) {
        return;
    }

    window.skipStepForDiamondClients = true;
    checkIfDomReady();
})();