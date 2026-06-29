(function() {
    const experienceName = "AT_EXPERIENCE_SUSPENDED_CLUB";
    const experienceTargetUrl = "/perfil/br/pt/home";
    const experienceAlreadyExecuted = window[experienceName] || false;

    const onExperienceTargetPage = () => {
        const currentUrl = window.location.pathname;
        const testUrl = experienceTargetUrl;

        return currentUrl.includes(testUrl);
    }

    const initExperienceWhenReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";

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

        const SELECTORS = {
            buttonsService: ".sc-400fcecd-0",
            username: ".sc-4576663e-3.fkVVmW"
        };

        init();

        function init() {
            let maxiumTriesToReachElement = 1000;
            
            function waitForElement() {
                const buttonsService = document.querySelectorAll(SELECTORS.buttonsService);
                const buttonClub = buttonsService[1];
                const hasDataLayer = window.azulObject !== undefined;
                
                if(!buttonClub || !hasDataLayer) {
                    if(maxiumTriesToReachElement > 0) {
                        maxiumTriesToReachElement--;
                        requestAnimationFrame(waitForElement);
                        console.log("[AT] Waiting for elements to appear...", window.azulObject, buttonClub, " | Tries left:", maxiumTriesToReachElement);
                    }

                    return;
                }

                console.log("[AT] Element found: ", buttonClub, " | Data layer found:", window.azulObject);
                checkIfUserHasClubSuspended(buttonClub?.textContent);
            }

            waitForElement();
        }

        function checkIfUserHasClubSuspended(serviceElementText = "") {
            const serviceElementParsed = serviceElementText?.toLowerCase().trim();
            const dataLayerUserClubStatus = window.azulObject?.user_clubeTudoAzul_status?.toLowerCase().trim() || "";
            const termsToCheck = ["suspenso", "suspensa", "suspensos", "suspensas", "suspended", "regularize", "regulariza"];

            console.log("[AT] User club status: ", dataLayerUserClubStatus, " | Service element text: ", serviceElementParsed);

            if(termsToCheck.some(term => serviceElementParsed.includes(term) || dataLayerUserClubStatus.includes(term))) {
                showModal();
                return;
            } 

            showModal(); // tirar pós teste
            console.log("[AT] User does not have club suspended. No action taken.");
            analyticsEvent("user_does_not_have_club_suspended");
        }

        function showModal() {
            injectCustomCSS();

            const modal = document.createElement("div");
            modal.classList.add("suspendedModalBackdrop");

            modal.innerHTML = `
                <div class="suspendedModal">
                    <header class="suspendedModal__header">
                        <h2 class="suspendedModal__title">Continue aproveitando todos os seus benefícios do Clube Azul</h2>
                        <button class="suspendedModal__closeButton cta-close-modal" aria-label="Fechar modal">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.02564 26L16 17.0256L24.9744 26L26 24.9744L17.0256 16L26 7.02564L24.9744 6L16 14.9744L7.02564 6L6 7.02564L14.9744 16L6 24.9744L7.02564 26Z" fill="#595959"/>
                            </svg>
                        </button>
                    </header>
                    <div class="suspendedModal__content">
                        <div class="suspendedModal__content__wrapper">
                            <p class="suspendedModal__description">Oi, <b>[REPLACE_NAME]</b> Infelizmente não conseguimos identificar o pagamento do seu plano e ele se encontra suspenso no momento. Mas a reativação é fácil e rápida: basta atualizar sua forma de pagamento.</p>
                            <div class="suspendedModal__benefits">
                                <span class="suspendedModal__benefits__subtitle">Veja o que você está deixando de aproveitar:</span>
                                <ul class="suspendedModal__benefitsList">
                                    <li>
                                        <div class="suspendedModal__benefitsList__item">
                                            <div class="suspendedModal__item__icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.292 10.374C15.5839 9.80992 16.414 9.81003 16.7061 10.374L16.7598 10.5039L17.8223 13.7715H21.2578C22.0326 13.7715 22.355 14.7631 21.7285 15.2188L18.9482 17.2383L20.0098 20.5059C20.249 21.2428 19.4062 21.8558 18.7793 21.4004L15.999 19.3809L13.2197 21.4004C12.5929 21.8554 11.7492 21.2426 11.9883 20.5059L13.0488 17.2383L10.2705 15.2188C9.64379 14.7634 9.96577 13.7721 10.7402 13.7715H14.1768L15.2383 10.5039L15.292 10.374ZM14.9033 14.7715H11.3555L14.2256 16.8564L13.1289 20.2295L15.999 18.1445L18.8682 20.2285L17.7725 16.8564L20.6426 14.7715H17.0957L15.999 11.3984L14.9033 14.7715Z" fill="#026CB6"/>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 7.25C20.8325 7.25 24.75 11.1675 24.75 16C24.75 20.8325 20.8325 24.75 16 24.75C11.1675 24.75 7.25 20.8325 7.25 16C7.25 11.1675 11.1675 7.25 16 7.25ZM16 8.4502C11.8303 8.4502 8.4502 11.8303 8.4502 16C8.4502 20.1698 11.8303 23.5498 16 23.5498C20.1698 23.5498 23.5498 20.1698 23.5498 16C23.5498 11.8303 20.1698 8.4502 16 8.4502Z" fill="#026CB6"/>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4ZM16 5.2002C10.0353 5.2002 5.2002 10.0353 5.2002 16C5.2002 21.9647 10.0353 26.7998 16 26.7998C21.9647 26.7998 26.7998 21.9647 26.7998 16C26.7998 10.0353 21.9647 5.2002 16 5.2002Z" fill="#026CB6"/>
                                                </svg>
                                            </div>
                                            <div class="suspendedModal__item__text">
                                                <strong>Pontos Azul mensais</strong>
                                                <p>Direto na conta do Azul Fidelidade</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="suspendedModal__benefitsList__item">
                                            <div class="suspendedModal__item__icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9949 12.1448L16.9534 15.004H20.1957L17.5562 16.8365L18.5077 19.6752L15.9964 17.9628L13.3645 19.6759L14.437 16.832L11.7585 14.9725L15.046 15.0887L15.9949 12.1448ZM16.0046 13.8174L15.4202 15.6305L13.5329 15.5638L15.071 16.6316L14.4185 18.3618L16.0031 17.3305L17.5167 18.3625L16.935 16.6272L18.5121 15.5323H16.5795L16.0046 13.8174Z" fill="#026CB6"/>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3728 10.4151C13.2746 10.4151 10.8572 12.9151 10.8572 15.9031C10.8572 17.2256 11.3548 18.4742 12.1968 19.4809L11.5143 20.0662C10.5494 18.9126 9.96281 17.4608 9.96281 15.9031C9.96281 12.4101 12.7855 9.50943 16.3728 9.50943V10.4151Z" fill="#026CB6"/>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1428 16.0969C21.1428 14.7743 20.6452 13.5257 19.8032 12.5191L20.4857 11.9337C21.4506 13.0873 22.0372 14.5391 22.0372 16.0969C22.0372 19.5899 19.2145 22.4905 15.6272 22.4905V21.5849C18.7254 21.5849 21.1428 19.0848 21.1428 16.0969Z" fill="#026CB6"/>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.5678 8.03951C23.7287 7.96658 23.9169 7.99621 24.0484 8.11517L27.8508 11.5555C27.9465 11.6421 28.0008 11.7661 28 11.8961C27.9992 12.026 27.9432 12.1494 27.8464 12.2347L24.0441 15.5868C23.9119 15.7033 23.7246 15.7309 23.5651 15.6574C23.4056 15.5839 23.3032 15.4228 23.3032 15.2453V14.2867H20.9851V13.381H23.7504C23.9974 13.381 24.1976 13.5838 24.1976 13.8339V14.2506L26.8767 11.8888L24.1976 9.46474V9.95247C24.1976 10.2026 23.9974 10.4053 23.7504 10.4053H15.6272V9.49964H23.3032V8.45284C23.3032 8.2743 23.4068 8.11243 23.5678 8.03951Z" fill="#026CB6"/>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.19068 16.3396C8.35373 16.4116 8.45914 16.5746 8.45914 16.7547V17.7133H10.6045V18.619H8.01193C7.76494 18.619 7.56472 18.4162 7.56472 18.1661V17.7932L5.09984 20.1111L7.56472 22.49V22.0475C7.56472 21.7974 7.76494 21.5947 8.01193 21.5947H15.6275V22.5004H8.45914V23.5472C8.45914 23.7283 8.35249 23.8921 8.18801 23.9634C8.02354 24.0347 7.8329 23.9999 7.70338 23.8749L4.13866 20.4346C4.04938 20.3485 3.99921 20.2288 4.00001 20.1039C4.00081 19.979 4.05251 19.86 4.14288 19.775L7.70761 16.4229C7.83794 16.3003 8.02763 16.2676 8.19068 16.3396Z" fill="#026CB6"/>
                                                </svg>
                                            </div>
                                            <div class="suspendedModal__item__text">
                                                <strong>Bônus na transferência</strong>
                                                <p>Bônus extra de pontos por tempo de assinatura</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="suspendedModal__benefitsList__item">
                                            <div class="suspendedModal__item__icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.422 11.612C24.8072 13.3602 25.5 15.3229 25.5 17.5C25.5 20.1059 24.5763 22.3407 22.7292 24.2045C20.882 26.0681 18.6388 27 16 27C13.3612 27 11.118 26.0681 9.27083 24.2045C7.42365 22.3406 6.5 20.1058 6.5 17.4999C6.5 14.894 7.42365 12.6592 9.27083 10.7954C11.118 8.93163 13.3612 8 16 8C18.1441 8 20.1233 8.70921 21.9375 10.1276L23.4219 8.59369C23.9496 9.02258 24.4445 9.51734 24.9062 10.0781L23.422 11.612ZM21.22 22.7446C19.7852 24.1959 18.0452 24.9216 16.0001 24.9216C13.9549 24.9216 12.2149 24.1959 10.78 22.7446C9.34513 21.2932 8.62769 19.545 8.62769 17.4997C8.62769 15.4547 9.345 13.7146 10.7801 12.2798C12.2149 10.8449 13.9549 10.1274 16.0001 10.1274C18.0452 10.1274 19.7852 10.8449 21.2201 12.2798C22.655 13.7146 23.3724 15.4547 23.3724 17.4998C23.3724 19.545 22.6551 21.2932 21.22 22.7446Z" fill="#026CB6"/>
                                                    <path d="M14.9609 18.5885V12.2551H17.039V18.5885H14.9609Z" fill="#026CB6"/>
                                                    <path d="M19.1671 5V7.07944H12.8337V5H19.1671Z" fill="#026CB6"/>
                                                </svg>
                                            </div>
                                            <div class="suspendedModal__item__text">
                                                <strong>Pontos que não expiram</strong>
                                                <p>No Clube 10.000 e Clube 20.000</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="suspendedModal__benefitsList__item">
                                            <div class="suspendedModal__item__icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 5.09924C10.0255 5.09924 5.14286 9.95831 5.14286 16C5.14286 22.0417 10.0255 26.9008 16 26.9008C21.9745 26.9008 26.8571 22.0417 26.8571 16C26.8571 9.95831 21.9745 5.09924 16 5.09924ZM4 16C4 9.39394 9.35082 4 16 4C22.6492 4 28 9.39394 28 16C28 22.6061 22.6492 28 16 28C9.35082 28 4 22.6061 4 16Z" fill="#026CB6"/>
                                                    <path d="M11.4286 20C12.6667 19.6049 14.2857 19.3086 16 19.3086C17.7143 19.3086 19.2381 19.5062 20.5714 20L22 14.3704L18.0952 16.7407L16 12L13.9048 16.7407L10 14.3704L11.4286 20Z" fill="#026CB6"/>
                                                </svg>
                                            </div>
                                            <div class="suspendedModal__item__text">
                                                <strong>Pontos qualificáveis</strong>
                                                <p>A cada 10 pontos do Clube, acumule 1 ponto qualificável para subir de nível</p>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <footer class="suspendedModal__footer">
                        <a href="https://apps.voeazul.com.br/TudoAzulClub/index.html" target="_blank" class="cta-atualizar-agora">Atualizar agora</a>
                        <button class="cta-close-modal">Agora não</button>
                    </footer>
                </div>
            `;

            const userName = document.querySelector(SELECTORS.username)?.textContent || window.azulObject.user_name || "";
            const textUserName = userName !== "" ? userName + "!" : "";
            modal.innerHTML = modal.innerHTML.replace("[REPLACE_NAME]", textUserName);

            const mainElement = document.querySelector("main");
            const elementToAppend = mainElement || document.body;

            elementToAppend.appendChild(modal);
            analyticsEvent("modal_shown");

            const closeButtons = modal.querySelectorAll(".cta-close-modal");
            closeButtons.forEach(button => {
                button.addEventListener("click", () => {
                    analyticsEvent("modal_closed");
                    modal.remove();
                });
            });

            const updateButton = modal.querySelector(".cta-atualizar-agora");
            updateButton.addEventListener("click", () => {
                analyticsEvent("user_clicked_update_now");
                modal.remove();
            });
        }

        function injectCustomCSS() {
            const style = document.createElement("style");

            style.innerHTML = `
                .suspendedModalBackdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100dvw;
                    height: 100dvh;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }

                .suspendedModal * {
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    box-sizing: border-box;
                }

                .suspendedModal {
                    display: flex;
                    width: 560px;
                    max-width: 560px;
                    flex-direction: column;
                    align-items: flex-start;
                    flex-shrink: 0;
                    border-radius: 8px;
                    border: 1px solid #E0E0E0;
                    background: #FFF;
                    padding: 32px 28px 0px 28px;
                    position: relative;
                    box-sizing: border-box;
                    overflow-y: auto;
                    overflow-x: hidden;
                    max-height: 80dvh;
                }

                .suspendedModal h2, .suspendedModal p {
                    margin: 0;
                }

                .suspendedModal__title {
                    color: #041E42;
                    font-size: 24px;
                    font-style: normal;
                    font-weight: 500;
                    line-height: 27.5px;
                }

                .suspendedModal__closeButton {
                    background-color: transparent;
                    border: none;
                    cursor: pointer;
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    padding: 0;
                }

                .suspendedModal__header {
                    margin-bottom: 20px;
                }

                .suspendedModal__content {
                    position: relative;
                }

                .suspendedModal__content__wrapper {
                    max-width: 338px;
                }

                .suspendedModal__content {
                    width: 100%;
                    position: relative;
                }

                .suspendedModal__content::after {
                    content: "";
                    display: block;
                    clear: both;
                    background-image: url("https://imgur.com/ViGUTp7.png");
                    width: 200px;
                    height: 378px;
                    position: absolute;
                    right: -29px;
                    top: -20px;
                }

                .suspendedModal__description {
                    color: #666;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 21px; 
                }

                .suspendedModal__description b {
                    color: #041E42;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 600;
                    line-height: 21px;
                }

                .suspendedModal__benefits {
                    margin-top: 20px;
                    margin-bottom: 20px;
                }

                .suspendedModal__benefits__subtitle {
                    color: #041E42;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 500;
                    line-height: 21px;
                }

                .suspendedModal__benefitsList {
                    margin: 0;
                    margin-top: 24px;
                    padding: 0;
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .suspendedModal__footer {
                    padding-top: 16px;
                    padding-bottom: 6px;
                    border-top: solid 1px #E0E0E0;
                    width: 100%;
                    display: block
                }

                .suspendedModal__footer a {
                    margin-top: 16px;
                    margin-bottom: 4px;
                    display: block;
                    text-decoration: none;
                    width: 100%;
                    border-radius: 4px;
                    background: #026CB6;
                    padding: 11.5px 4px;
                    color: #FFF;
                    text-align: center;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 500;
                    line-height: 21px;
                    min-height: 44px;
                    text-align: center;
                    transition: background 0.3s ease-in-out;
                }

                .suspendedModal__footer a:hover {
                    background: #041e42;
                    transition: background 0.3s ease-in-out;
                }
                
                .suspendedModal__footer button {
                    display: block;
                    width: 100%;
                    min-height: 40px;
                    padding: 9.5px 4px;
                    text-align: center;
                    color: #888;
                    text-align: center;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 21px; 
                    background-color: transparent;
                    border: none;
                    cursor: pointer;
                }

                .suspendedModal__benefitsList__item {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                }

                .suspendedModal__item__text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .suspendedModal__item__text strong {
                    color: #041E42;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 600;
                    line-height: 15.6px;
                }

                .suspendedModal__item__text p {
                    color: #666;
                    font-size: 11px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 15.4px; 
                }

                .suspendedModal__item__icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 33554400px;
                    background: #E8F4FB;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                @media screen and (max-width: 1023px) {
                    .suspendedModal {
                        width: 90dvw;
                        padding-top: 52px;
                        max-height: 90dvh;
                    }

                    .suspendedModal__content::after {
                        display: none;
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