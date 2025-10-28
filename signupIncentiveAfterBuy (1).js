(function() {
    console.log("[AT] Signup After Buy: Script initialized.");

    const SELECTORS = {
        reservationContainer: ".reservation-container",
        reservationCode: ".container__reservation__text__code"
    };

    const domIsReadyValidator = SELECTORS.reservationCode;

    const possibleLoginsButtons = [
        "button[aria-label='Fazer Login']",
        "button[aria-label='Login']"
    ];

    const possibleTextsToIdentifyUserWithoutAccount = [
        "insira seu cpf ou número azul fidelidade",
        "insira seu cpf ou numero azul fidelidade"
    ];

    function initActivityWhenReady() {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const isDesktop = window.innerWidth >= 1024;

        if (!isDesktop) {
            console.log("[AT] Signup After Buy: Not a desktop device. Exiting.");
            return;
        }

        if (isReady) {
            initIncentive();
        } else {
            document.addEventListener("DOMContentLoaded", initIncentive);
        }
    }

    function initIncentive() {
        const domChecker = document.querySelector(domIsReadyValidator);

        if (!domChecker) {
            console.log("[AT] Signup After Buy: DOM Checker not found. Waiting...");
            requestAnimationFrame(initIncentive);
            return;
        }

        injectCSS();
        appendDialog();

        const userShouldSeeIncentive = checkUserEligibility();

        if (!userShouldSeeIncentive) {
            console.log("[AT] Signup After Buy: User not eligible for incentive. Exiting.");
            return;
        }
        
        addEventListeners();

        setTimeout(() => {
            toggleIncentiveDisplay(true)
            analyticsEvent("Modal Exibido");
        }, 10000);

        function checkUserEligibility() {
            const reservationContainer = document.querySelector(SELECTORS.reservationContainer);

            if (!reservationContainer) {
                return false;
            }

            const userIsNotLoggedIn = document.querySelector(possibleLoginsButtons[0]) || document.querySelector(possibleLoginsButtons[1]);

            if (!userIsNotLoggedIn) {
                console.log("[AT] Signup After Buy: User already logged in. Exiting.");
                return false;
            }

            const possibleCtasToSignupUsersWithoutAccount = reservationContainer.querySelectorAll("button");

            const hasOneUserWithoutAccount = [...possibleCtasToSignupUsersWithoutAccount].some((cta) => {
                const ctaText = cta.textContent.toLowerCase();

                return possibleTextsToIdentifyUserWithoutAccount.includes(ctaText);
            });

            return hasOneUserWithoutAccount;
        }

        function toggleIncentiveDisplay(show) {
            const wrapper = document.querySelector(".wrapperSignupIncentive");
            wrapper.classList.toggle("wrapperSignupIncentive--show", show);
        }

        function appendDialog() {
            const dialog = document.createElement("div");
            dialog.className = "wrapperSignupIncentive";

            dialog.innerHTML = `
                <div class="signupIncentive">
                    <button class="signupIncentive__close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.02564 20L10 11.0256L18.9744 20L20 18.9744L11.0256 10L20 1.02564L18.9744 0L10 8.97436L1.02564 0L0 1.02564L8.97436 10L0 18.9744L1.02564 20Z" fill="white"/>
                        </svg>
                    </button>
                    <img src="https://imgur.com/bUaEDfP.png" alt="" class="signupIncentive__logo"/>
                    <div class="signupIncentive__header">
                        <h2 class="signupIncentive__title">Ainda não é cadastrado?</h2>
                        <p class="signupIncentive__subtitle">Faça parte do Azul Fidelidade, torne sua experiência ainda mais completa e tenha benefícios como:</p>
                    </div>
                    <ul class="signupIncentive__list">
                        <li class="signupIncentive__item">
                            <h3 class="signupIncentive__item__title">Check-in e embarque prioritários</h3>
                            <p class="signupIncentive__item__subtitle">Seja um dos primeiros a embarcar em seu voo.</p>
                        </li>
                        <li class="signupIncentive__item">
                            <h3 class="signupIncentive__item__title">Despacho de bagagem gratuita</h3>
                            <p class="signupIncentive__item__subtitle">Em voos nacionais e internacionais.</p>
                        </li>
                        <li class="signupIncentive__item">
                            <h3 class="signupIncentive__item__title">Espaço Azul ilimitado para voos nacionais</h3>
                            <p class="signupIncentive__item__subtitle">Mais espaço para suas pernas.</p>
                        </li>
                    </ul>
                    <ul class="signupIncentive__list">
                        <li class="signupIncentive__item">
                            <h3 class="signupIncentive__item__title">Azul Wifi gratuito</h3>
                            <p class="signupIncentive__item__subtitle">Fique conectado durante todo o voo.</p>
                        </li>
                        <li class="signupIncentive__item">
                            <h3 class="signupIncentive__item__title">Acesso ao Lounge Azul em Viracopos (VCP)</h3>
                            <p class="signupIncentive__item__subtitle">Espere o horário do seu voo com mais conforto.</p>
                        </li>
                        <li class="signupIncentive__item">
                            <h3 class="signupIncentive__item__title">Marcação de assento antecipada</h3>
                            <p class="signupIncentive__item__subtitle">Marque seu assento antecipadamente e de forma gratuita em voos nacionais.</p>
                        </li>
                    </ul>
                    <button class="signupIncentive__buttonCta">Se cadastrar gratuitamente</button>
                    <h6 class="signupIncentive__terms">*Confira os termos e condições de todos benefícios Azul Fidelidade</h6>
                </div>
            `;

            document.body.appendChild(dialog);
        }

        function addEventListeners() {
            const closeButton = document.querySelector("button.signupIncentive__close");
            const ctaButton = document.querySelector("button.signupIncentive__buttonCta");

            closeButton?.addEventListener("click", () => {
                analyticsEvent("CTA - Fechar");
                toggleIncentiveDisplay(false);
            });

            ctaButton?.addEventListener("click", () => {
                analyticsEvent("CTA - Cadastro");

                window.open(
                    "https://www.voeazul.com.br/br/pt/cadastro-minhas-viagens",
                    "_blank"
                );

                toggleIncentiveDisplay(false);
            });
        }

        function analyticsEvent(eventLabel) {
            if(eventLabel === undefined || !eventLabel) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = "AT_signup_incentive " + eventLabel;

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

        function injectCSS() {
            const styles = document.createElement("style");

            styles.innerHTML = `
                .wrapperSignupIncentive {
                    height: 100dvh;
                    width: 100dvw;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }

                .wrapperSignupIncentive.wrapperSignupIncentive--show {
                    display: flex;
                } 

                .wrapperSignupIncentive p,
                .wrapperSignupIncentive h2,
                .wrapperSignupIncentive h3,
                .wrapperSignupIncentive h6,
                .wrapperSignupIncentive ul,
                .wrapperSignupIncentive li {
                    margin: 0;
                    padding: 0;
                    color: #FFFFFF;
                }

                .wrapperSignupIncentive button {
                    border: none;
                    background: none;
                    cursor: pointer;
                }

                .wrapperSignupIncentive .signupIncentive {
                    background-color: #03182b;
                    background-image: url("https://i.imgur.com/Nt5u9Jc.png");
                    background-repeat: no-repeat;
                    background-position: right;
                    border-radius: 16px;
                    padding: 32px 40px;
                    color: #FFFFFF;
                    font-family: "Helvetica Neue", Arial;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                    position: relative;
                }

                @media screen and (min-width: 1024px) {
                    .wrapperSignupIncentive .signupIncentive {
                        width: 900px;
                        background-size: cover;
                    }
                }

                @media screen and (min-width: 1400px) {
                    .wrapperSignupIncentive .signupIncentive {
                        width: 1200px;
                        background-size: contain;
                    }
                }

                .wrapperSignupIncentive .signupIncentive__logo {
                    height: 49px;
                    width: 219px;
                    object-fit: contain;
                }

                .wrapperSignupIncentive .signupIncentive__close {
                    position: absolute;
                    right: 24px;
                    top: 24px;
                    padding: 0;
                    margin: 0;
                    line-height: 0;
                }

                .wrapperSignupIncentive .signupIncentive__header {
                    margin-bottom: 0px;
                }

                .wrapperSignupIncentive .signupIncentive__title {
                    font-weight: 300;
                    font-size: 32px;
                    line-height: 100%;
                }

                .wrapperSignupIncentive .signupIncentive__subtitle {
                    font-size: 20px;
                    font-weight: 300;
                    margin-top: 16px;
                    line-height: 100%;
                }

                .wrapperSignupIncentive .signupIncentive__list {
                    list-style: none;
                    display: flex;
                    gap: 24px;
                }

                .wrapperSignupIncentive .signupIncentive__item {
                    padding-right: 18px;
                    position: relative;
                    box-sizing: content-box;
                }

                .wrapperSignupIncentive .signupIncentive__item:nth-child(2) {
                    width: 30%;
                }

                .wrapperSignupIncentive .signupIncentive__item:nth-child(odd) {
                    width: 27%;
                }

                .wrapperSignupIncentive .signupIncentive__item:not(:last-child)::after {
                    content: "";
                    height: 80px;
                    background: #FFFFFF;
                    width: 1px;
                    position: absolute;
                    right: 0;
                    top: 0;
                }

                .wrapperSignupIncentive .signupIncentive__item__title {
                    font-weight: 700;
                    font-size: 20px;
                    line-height: 100%;
                    margin-bottom: 16px;
                }

                .wrapperSignupIncentive .signupIncentive__item__subtitle {
                    font-weight: 300;
                    font-size: 18px;
                    line-height: 100%;
                }

                .wrapperSignupIncentive .signupIncentive__buttonCta {
                    font-weight: 400;
                    font-size: 16px;
                    padding: 13px 17px;
                    border-radius: 8px;
                    border: solid 1px #FFFFFF;
                    color: #FFFFFF;
                    margin: 0 auto;
                    transition: cubic-bezier(0.215, 0.610, 0.355, 1) .8s;
                }

                .wrapperSignupIncentive .signupIncentive__buttonCta:hover {
                    background: #03182b;
                    border-color: #03182b;
                    transition: cubic-bezier(0.075, 0.82, 0.165, 1) .5s;
                }

                .wrapperSignupIncentive .signupIncentive__terms {
                    text-align: center;
                    font-weight: 300;
                    font-size: 16px;
                    line-height: 100%;
                }
            `;

            document.head.appendChild(styles);
        }
    }

    function onTargetPage() {
        const currentUrl = window.location.pathname;
        const targetTestUrl = "/minhas-viagens";

        return currentUrl.includes(targetTestUrl);
    }

    if(window.signupIncentiveAfterBuyInitialized || !onTargetPage()) {
        console.log("[AT] Signup After Buy: Script already executed or not on target page.");
        return;
    }

    window.signupIncentiveAfterBuyInitialized = true;
    initActivityWhenReady();
})();