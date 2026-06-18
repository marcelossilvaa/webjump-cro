(function() {
    const experienceName = "AT_calc_esfera";
        const experienceTargetUrls = [
        "ofertas/esfera-meta",
        "ofertas/esfera-google",
        "ofertas/esfera-taboola",
        "ofertas/esfera-parceiro",
        "ofertas/esfera",
    ];
    const experienceAlreadyExecuted = window[experienceName] || false;

    const getActiveUrl = () => {
        const currentUrl = window.location.pathname;
        return experienceTargetUrls.find(url => currentUrl.includes(url)) || "";
    };

    const getExperienceVariantName = () => {
        const activeUrl = getActiveUrl();
        if (activeUrl.includes("esfera-meta"))     return experienceName + "_meta";
        if (activeUrl.includes("esfera-google"))   return experienceName + "_google";
        if (activeUrl.includes("esfera-taboola"))  return experienceName + "_taboola";
        if (activeUrl.includes("esfera-parceiro")) return experienceName + "_parceiro";
        return experienceName;
    };

    const onExperienceTargetPage = () => getActiveUrl().length > 0;

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

    var maximumTries = 100;
    function experienceSetup() {
        const SELECTORS = {
            targetImageToAppend: "img[src='/content/dam/voe-azul/lp-de-ofertas/10-06/bnr-esfera_transferir-desktop.png']",
            targetImageToHide: "img[src='/content/dam/voe-azul/lp-de-ofertas/10-06/bnr-esfera_transferir-mobile.png']"
        };
        
        const imageToAppendAlreadyExists = document.querySelector(SELECTORS.targetImageToAppend);
        
        if(!imageToAppendAlreadyExists) {
            maximumTries--;

            if(maximumTries === 0) {
                console.log("[AT] Maximum tries reached. Experience can't be initialized.");
                return;
            }

            console.log("[AT] Target image to append not found. Experience can't be initialized.");
            requestAnimationFrame(experienceSetup);
            return;
        }
        
        init();
        
        function init() {
            console.log("[AT] Experience started:", experienceName);

            analyticsEvent("experience_started");
            appendCalculator();
            injectCustomCSS();
        }

        function appendCalculator() {
            const htmlCalculator = getHtmlCalculator();
            const imageToAppend = document.querySelector(SELECTORS.targetImageToAppend);
            
            if(imageToAppend && imageToAppend.parentNode?.parentNode) {
                imageToAppend.parentNode.parentNode.insertAdjacentElement("beforeend", htmlCalculator);
                imageToAppend.parentNode.style.display = "none";

                treatmentForPointsInput();
                handleControllerClientType();
                handleCalculatorLogic();
                addAnalyticsToCtas();
            }

            const imageToHide = document.querySelector(SELECTORS.targetImageToHide);

            if(imageToHide && imageToHide.parentNode) {
                imageToHide.parentNode.style.display = "none";
            }
        }

        function getHtmlCalculator() {
            const calculator = document.createElement("section");
            calculator.classList.add("injectedCalculator");

            calculator.innerHTML = `
                <div class="injectedCalculator__wrapper">
                    <div class="injectedCalculator__container">
                        <div class="injectedCalculator__header">
                            <h2 class="injectedCalculator__header__title">Simule a transferência e descubra quantos pontos você pode acumular!</h2>
                            <div class="injectedCalculator__wrapperController">
                                <h3 class="injectedCalculator__wrapperController__title">É assinante <strong>Clube Azul?</strong></h3>
                                <div class="injectedCalculator__controller">
                                    <button class="injectedCalculator__controllerButton --active" data-controller="isClube">Sim</button>
                                    <button class="injectedCalculator__controllerButton" data-controller="notClube">Não</button>
                                </div>
                            </div>
                        </div>
                        <div class="injectedCalculator__content">
                            <form class="injectedCalculator__form">
                                <div class="injectedCalculator__form__time">
                                    <h4 class="injectedCalculator__form__timeTitle">Há quanto tempo?</h4>
                                    <div class="injectedCalculator__form__timeOptions">
                                        <div class="injectedCalculator__form__timeOption">
                                            <input type="radio" name="time" value="6monthsminus" id="6monthsminus" checked>
                                            <label for="6monthsminus">menos de 6 meses</label>
                                        </div>
                                        <div class="injectedCalculator__form__timeOption">
                                            <input type="radio" name="time" value="between6months11months" id="between6months11months">
                                            <label for="between6months11months">de 6 a 11 meses</label>
                                        </div>
                                        <div class="injectedCalculator__form__timeOption">
                                            <input type="radio" name="time" value="between12months35months" id="between12months35months">
                                            <label for="between12months35months">de 12 a 35 meses</label>
                                        </div>
                                        <div class="injectedCalculator__form__timeOption">
                                            <input type="radio" name="time" value="between36months59months" id="between36months59months">
                                            <label for="between36months59months">de 36 a 59 meses</label>
                                        </div>
                                        <div class="injectedCalculator__form__timeOption">
                                            <input type="radio" name="time" value="60monthsplus" id="60monthsplus">
                                            <label for="60monthsplus">mais de 60 meses</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="injectedCalculator__form__calculator">
                                    <div class="injectedCalculator__form__inputWrapper --points">
                                        <label for="injectedCalculator__form__input--points">Pontos da transferência</label>
                                        <input type="number" id="injectedCalculator__form__input--points" name="pointsToBuy" placeholder="Insira a quantidade" aria-label="Pontos que deseja comprar" step="1000" min="1000" max="400000" value="1000">
                                    </div>
                                    <div class="injectedCalculator__form__operator">
                                        <span> + </span>
                                    </div>
                                    <div class="injectedCalculator__form__inputWrapper --bonus">
                                        <label for="injectedCalculator__form__input--bonus">Pontos bônus</label>
                                        <input type="text" id="injectedCalculator__form__input--bonus" name="bonusPoints" disabled="true" title="O cálculo do bônus é feito automaticamente"/>
                                    </div>
                                    <div class="injectedCalculator__form__operator">
                                        <span> = </span>
                                    </div>
                                    <div class="injectedCalculator__form__inputWrapper --total">
                                        <label for="injectedCalculator__form__input--totalPoints">Acúmulo total de pontos</label>
                                        <input type="text" id="injectedCalculator__form__input--totalPoints" name="totalPoints" disabled="true" title="O valor total é calculado automaticamente"/>
                                        <div class="injectedCalculator__form__inputFooter">pontos Azul</div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="injectedCalculator__controlledWrapper">
                    <div data-active="notClube" class="injectedCalculator__controlledWrapper__content injectedCalculator__notClub">
                        <div class="injectedCalculator__container">
                            <div class="injectedCalculator__notClub__content">
                                <h2 class="injectedCalculator__notClub__titleElement">Clube <strong>Azul</strong></h2>
                                <p class="injectedCalculator__notClub__description">Entre agora mesmo e <strong>aproveite bônus exclusivos!</strong></p>
                                <a class="injectedCalculator__notClub__cta" href="https://www.voeazul.com.br/br/pt/programa-fidelidade/clube-azul" target="_blank">Conheça os planos</a>
                            </div>
                            <div class="injectedCalculator__notClub__image"></div>
                        </div>
                    </div>
                    <div data-active="isClube" class="injectedCalculator__controlledWrapper__content injectedCalculator__isClub active">
                        <div class="injectedCalculator__container">
                            <div class="injectedCalculator__isClub__title">
                                <svg width="153" height="153" viewBox="0 0 153 153" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.5" y="0.5" width="152" height="152" rx="75.9998" fill="url(#paint0_linear_19961_405)" fill-opacity="0.6"/>
                                    <rect x="0.5" y="0.5" width="152" height="152" rx="75.9998" stroke="url(#paint1_linear_19961_405)"/>
                                    <circle cx="76.4996" cy="76.4996" r="61.1998" fill="url(#paint2_radial_19961_405)"/>
                                    <g clip-path="url(#clip0_19961_405)">
                                    <path d="M76 44.1818C93.5318 44.1818 107.818 58.4682 107.818 76C107.818 93.5318 93.5318 107.818 76 107.818C58.4682 107.818 44.1818 93.5318 44.1818 76C44.1818 58.4682 58.4682 44.1818 76 44.1818ZM76 41C56.6545 41 41 56.6545 41 76C41 95.3455 56.6545 111 76 111C95.3455 111 111 95.3455 111 76C111 56.6545 95.3455 41 76 41Z" fill="white"/>
                                    <path d="M76 52.9318C88.7273 52.9318 99.0682 63.2727 99.0682 76C99.0682 88.7273 88.7273 99.0682 76 99.0682C63.2727 99.0682 52.9318 88.7273 52.9318 76C52.9318 63.2727 63.2727 52.9318 76 52.9318ZM76 49.75C61.5227 49.75 49.75 61.5227 49.75 76C49.75 90.4773 61.5227 102.25 76 102.25C90.4773 102.25 102.25 90.4773 102.25 76C102.25 61.5227 90.4773 49.75 76 49.75Z" fill="white"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M75.9998 60.917L79.1816 71.3215H90.318L81.568 77.6852L85.5453 88.8215L75.9998 81.9806L66.4544 88.8215L70.4316 77.6852L61.6816 71.3215H72.818L75.9998 60.917Z" stroke="white" stroke-width="3.18182" stroke-miterlimit="10"/>
                                    </g>
                                    <defs>
                                    <linearGradient id="paint0_linear_19961_405" x1="10.7835" y1="-3.38494" x2="156.903" y2="160.422" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#041E42"/>
                                    <stop offset="1" stop-color="#041E42" stop-opacity="0"/>
                                    </linearGradient>
                                    <linearGradient id="paint1_linear_19961_405" x1="37.679" y1="22.2052" x2="157.162" y2="142.937" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#C4D600"/>
                                    <stop offset="1" stop-color="#C4D600" stop-opacity="0"/>
                                    </linearGradient>
                                    <radialGradient id="paint2_radial_19961_405" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(141.743 -49.7792) rotate(116.354) scale(205.264)">
                                    <stop stop-color="#041E42" stop-opacity="0"/>
                                    <stop offset="1" stop-color="#C4D600"/>
                                    </radialGradient>
                                    <clipPath id="clip0_19961_405">
                                    <rect width="70" height="70" fill="white" transform="translate(41 41)"/>
                                    </clipPath>
                                    </defs>
                                </svg>
                                <h2 class="injectedCalculator__isClub__titleElement">Transfira já e turbine a sua conta!</h2>
                            </div>
                            <div class="injectedCalculator__isClub__content">
                                <a class="injectedCalculator__isClub__button" href="https://www.esfera.com.vc/" target="_blank">Quero transferir</a>
                                <small class="injectedCalculator__isClub__disclaimer">Válido de 11 a 14/06/2026. Consulte condições.</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            return calculator;
        }

        function addAnalyticsToCtas() {
            const ctaNotClub = document.querySelector(".injectedCalculator__notClub__cta");
            const ctaIsClub = document.querySelector(".injectedCalculator__isClub__button");

            ctaNotClub.addEventListener("click", () => {
                analyticsEvent("user_clicked_cta_not_clube");
            });

            ctaIsClub.addEventListener("click", () => {
                analyticsEvent("user_clicked_cta_is_clube");
            });
        }

        function handleControllerClientType() {
            // get click event of buttons and show the content based on data attribute
            const controllerButtons = document.querySelectorAll(".injectedCalculator__controllerButton");
            const controlledContents = document.querySelectorAll(".injectedCalculator__controlledWrapper__content");

            controllerButtons.forEach((button, index) => {
                button.addEventListener("click", () => {
                    analyticsEvent("user_clicked_controller");

                    const timeOption = document.querySelector(".injectedCalculator__form__time");

                    controlledContents.forEach((content, contentIndex) => {
                        content.classList.remove("active");
                        controllerButtons[contentIndex].classList.remove("--active");
                    });

                    controlledContents.forEach((content, contentIndex) => {
                        if (button.dataset.controller === content.dataset.active) {
                            content.classList.add("active");
                            button.classList.add("--active");

                            // if is notClube, display none time 
                            if (button.dataset.controller === "notClube") {
                                timeOption.style.display = "none";
                            } else {
                                timeOption.style.display = "flex";
                            }
                        }
                    });
                });
            });
        }

        function treatmentForPointsInput() {
            const pointsInput = document.getElementById(
                "injectedCalculator__form__input--points"
            );
            if (!pointsInput) return;
            // Remove non-digits on any input (typing, drag-drop, autocomplete)
            pointsInput.addEventListener("input", function (e) {
                analyticsEvent("user_typed_points");

                let cleaned = e.target.value.replace(/\D+/g, "");
                // Cap em 400.000 enquanto o usuário digita
                if (cleaned.length > 0) {
                    const num = parseInt(cleaned, 10);
                    if (num > 400000) cleaned = "400000";
                    if (num < 1000) cleaned = "1000";
                }
                if (e.target.value !== cleaned) {
                    e.target.value = cleaned;
                }
            });

            // Handle paste: keep only digits
            pointsInput.addEventListener("paste", function (e) {
                e.preventDefault();
                const paste =
                    (e.clipboardData || window.clipboardData).getData("text") || "";
                const cleaned = paste.replace(/\D+/g, "");

                // insert cleaned text at cursor
                if (document.execCommand) {
                    document.execCommand("insertText", false, cleaned);
                } else {
                    // Fallback for older browsers
                    const start = pointsInput.selectionStart;
                    const end = pointsInput.selectionEnd;
                    const value = pointsInput.value;
                    pointsInput.value =
                        value.slice(0, start) + cleaned + value.slice(end);
                    pointsInput.setSelectionRange(
                        start + cleaned.length,
                        start + cleaned.length
                    );
                }
            });

            // Helper to change value by multiples of 1000
            function changeBy(delta) {
                const raw = pointsInput.value.replace(/\D+/g, "");
                let value = parseInt(raw, 10) || 0;
                // if empty and increasing, set to 1000
                if (value === 0 && delta > 0) {
                    value = 1000;
                } else {
                    value = value + delta;
                }
                if (value < 1000) value = 1000;
                if (value > 400000) value = 400000;
                pointsInput.value = String(value);
                // trigger calculation update
                pointsInput.dispatchEvent(new Event("input", { bubbles: true }));
            }

            // Prevent non-digit key presses but allow navigation. Use ArrowUp/Down to adjust by 1000.
            pointsInput.addEventListener("keydown", function (e) {
                const allowed = [
                    "Backspace",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                    "Delete",
                    "Home",
                    "End"
                ];

                // handle arrow up/down to change value by 1000
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    changeBy(1000);
                    return;
                }
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    // if empty, do nothing
                    const raw = pointsInput.value.replace(/\D+/g, "");
                    const current = parseInt(raw, 10) || 0;
                    if (current === 0) return;
                    changeBy(-1000);
                    return;
                }

                if (allowed.indexOf(e.key) !== -1) return;
                // allow ctrl/cmd combos
                if (e.ctrlKey || e.metaKey) return;
                // allow digits
                if (/\d/.test(e.key)) return;
                e.preventDefault();
            });

            // On blur, snap value to the nearest 1000 and enforce a minimum of 1000
            pointsInput.addEventListener("blur", function (e) {
                const cleaned = e.target.value.replace(/\D+/g, "");
                if (!cleaned) {
                    // keep empty if user cleared intentionally
                    e.target.value = "";
                    e.target.dispatchEvent(new Event("input", { bubbles: true }));
                    return;
                }

                let value = parseInt(cleaned, 10) || 0;
                if (value < 1000) value = 1000;
                if (value > 400000) value = 400000;
                // snap to nearest 1000
                value = Math.round(value / 1000) * 1000;
                if (value < 1000) value = 1000;
                if (value > 400000) value = 400000;
                e.target.value = String(value);
                // trigger calculation update
                e.target.dispatchEvent(new Event("input", { bubbles: true }));
            });
        }

        function handleCalculatorLogic() {

            const pointsInput = document.getElementById("injectedCalculator__form__input--points");
            const bonusInput  = document.getElementById("injectedCalculator__form__input--bonus");
            const totalInput  = document.getElementById("injectedCalculator__form__input--totalPoints");

            if (!pointsInput || !bonusInput || !totalInput) return;

            // Nova lógica de multiplicadores conforme regras fornecidas
            function getMultiplier(points, isClube, clubeTimeValue) {
                // Faixas de pontos
                if (points <= 20000) {
                    if (!isClube) return 0.60;
                    if (clubeTimeValue === "6monthsminus") return 0.70;
                    if (clubeTimeValue === "between6months11months") return 0.75;
                    if (clubeTimeValue === "between12months35months") return 0.80;
                    if (clubeTimeValue === "between36months59months") return 0.90;
                    if (clubeTimeValue === "60monthsplus") return 1.00;
                    return 0.70; // fallback clube
                } else if (points > 20000 && points <= 50000) {
                    if (!isClube) return 0.70;
                    if (clubeTimeValue === "6monthsminus") return 0.80;
                    if (clubeTimeValue === "between6months11months") return 0.85;
                    if (clubeTimeValue === "between12months35months") return 0.90;
                    if (clubeTimeValue === "between36months59months") return 1.00;
                    if (clubeTimeValue === "60monthsplus") return 1.10;
                    return 0.80;
                } else {
                    if (!isClube) return 0.80;
                    if (clubeTimeValue === "6monthsminus") return 0.90;
                    if (clubeTimeValue === "between6months11months") return 0.95;
                    if (clubeTimeValue === "between12months35months") return 1.00;
                    if (clubeTimeValue === "between36months59months") return 1.10;
                    if (clubeTimeValue === "60monthsplus") return 1.20;
                    return 0.90;
                }
            }

            function updateCalculator() {
                const raw    = (pointsInput.value || "").replace(/\D+/g, "");
                let points   = parseInt(raw, 10);
                if (!points || points < 1000) points = 1000;
                if (points > 400000) points = 400000;

                // Detecta se "Não Clube" está ativo
                const notClubActive = document.querySelector('[data-active="notClube"].injectedCalculator__controlledWrapper__content.active');
                const isClube = !notClubActive;

                // Se for clube, pega faixa de tempo
                let clubeTimeValue = "6monthsminus";
                if (isClube) {
                    const checked = document.querySelector('.injectedCalculator__form__timeOption input[type="radio"]:checked');
                    if (checked) clubeTimeValue = checked.value;
                }

                const multiplier = getMultiplier(points, isClube, clubeTimeValue);
                const bonus = Math.min(Math.round(points * multiplier), 300000);
                const total = points + bonus;

                bonusInput.value = String(bonus);
                totalInput.value = String(total);
            }

            // Estado inicial: 1.000 pontos + clube < 6 meses
            pointsInput.value = "1000";
            updateCalculator();

            // Atualiza ao digitar no campo de pontos
            pointsInput.addEventListener("input", updateCalculator);

            // Atualiza ao sair do campo de pontos (após snap para múltiplo de 1000)
            pointsInput.addEventListener("blur", function () {
                let raw    = (pointsInput.value || "").replace(/\D+/g, "");
                let points = parseInt(raw, 10);
                if (!points || points < 1000) points = 1000;
                if (points > 400000) points = 400000;
                points = Math.round(points / 1000) * 1000;
                pointsInput.value = String(points);
                updateCalculator();
            });

            // Atualiza ao trocar o radio de tempo de clube
            const timeRadios = document.querySelectorAll('.injectedCalculator__form__timeOption input[type="radio"]');
            timeRadios.forEach(function (radio) {
                radio.addEventListener("change", function () {
                    analyticsEvent("user_selected_time_" + radio.value);
                    updateCalculator();
                });
            });

            // Atualiza ao alternar entre "Sim" e "Não" nos botões do clube
            const controllerButtons = document.querySelectorAll(".injectedCalculator__controllerButton");
            controllerButtons.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    setTimeout(updateCalculator, 50);
                });
            });
        }

        function injectCustomCSS() {
            const style = document.createElement("style");

            style.innerHTML = `
                .injectedCalculator * {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    box-sizing: border-box;
                    line-height: normal;
                }
                    
                .injectedCalculator__notClub__cta {
                    text-decoration: none;
                }

                .injectedCalculator__isClub__button {
                    text-decoration: none;
                    text-align: center;
                }

                .injectedCalculator {
                    background-color: #FFFFFF;
                }

                .injectedCalculator__wrapper {
                    background-color: #D8EFF9;
                    border-radius: 100px 100px 0px 0px;
                }

                .injectedCalculator__form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .injectedCalculator__form__inputWrapper label {
                    line-height: normal;
                }

                .injectedCalculator__form__inputWrapper input {
                    display: block;
                    height: 100px;
                    border-radius: 13px;
                    line-height: normal;
                    width: 100%;
                    text-align: center;
                }

                .injectedCalculator__form__inputWrapper input:disabled {
                    cursor: not-allowed;
                    line-height: normal;
                }

                .injectedCalculator__form__inputWrapper input::placeholder {
                    font-size: 18px;
                    line-height: normal;
                    color: #99A1AF;
                }

                .injectedCalculator__header {
                    padding-bottom: 30px;
                }

                .injectedCalculator__container {
                    width: 100%;
                    padding: 0px 24px;
                    max-width: 1024px;
                    margin: 0 auto;
                }

                .injectedCalculator__header__title {
                    color: #0061A0;
                    font-weight: 700;
                    width: 947px;
                    max-width: 100%;
                    margin: 0 auto;
                    text-align: center;
                }

                .injectedCalculator__wrapperController {
                    margin-top: 50px;
                    margin-left: auto;
                    margin-right: auto;
                    width: fit-content;
                }

                .injectedCalculator__wrapperController__title {
                    color: #0061A0;
                    font-weight: 300;
                    margin: 0;
                    text-align: center;
                }

                .injectedCalculator__wrapperController__title strong {
                    font-weight: 700;
                }

                .injectedCalculator__controller {
                    margin-top: 28px;
                    background-color: #0061A04D;
                    border-radius: 68px;
                    padding: 10px 12px;
                    max-width: 285px;
                    width: 100%;
                    margin-left: auto;
                    margin-right: auto;
                    display: flex;
                    gap: 4px;
                }

                .injectedCalculator__controllerButton {
                    color: #FFFFFF;
                    font-weight: 300;
                    background-color: transparent;
                    border-radius: 68px;
                    padding: 8px 4px;
                    width: 100%;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    font-size: 22px;
                }

                .injectedCalculator__controllerButton.--active {
                    font-weight: 700;
                    background-color: #008BC4;
                    cursor: default;
                    pointer-events: none;
                }

                .injectedCalculator__controllerButton:not(.--active):hover {
                    background-color: #003366;
                }

                .injectedCalculator__isClub {
                    background-color: #041E42;  
                    display: flex !important;      
                }

                .injectedCalculator__form__timeOption label {
                    cursor: pointer;
                }

                .injectedCalculator__isClub__button {
                    background-color: #C4D600;
                    color: #041E42;
                    font-weight: 700;
                    border-radius: 84px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    margin: 0 auto;
                    transition: all 0.3s ease-in-out;
                    border: none;
                }

                .injectedCalculator__isClub__button:hover {
                    background-color: #A7B500;
                }

                .injectedCalculator__controlledWrapper__content {
                    display: none;
                }

                .injectedCalculator__controlledWrapper__content.active {
                    display: flex;
                }

                @media screen and (max-width: 1023px) {
                    .injectedCalculator__form__calculator {
                        margin-top: 35px;
                    }

                    .injectedCalculator__form__inputWrapper label {
                        display: block;
                        width: 100%;
                        font-weight: 700;
                        font-size: 24px;
                        padding: 18.5px 10px;
                        border-radius: 75px;
                        text-align: center;
                        color: #FFFFFF;
                        margin-bottom: 20px;
                    }

                    .injectedCalculator__form__inputWrapper input {
                        height: 106px;
                        border-radius: 12px;
                        width: 100%;
                        padding: 16px 8px;
                        font-size: 67px;
                        color: #FFFFFF;
                        font-weight: 700;
                    }

                    .injectedCalculator__form__inputWrapper:not(:last-child){
                        margin-bottom: 18px;
                    }
                    .injectedCalculator__form__operator {
                        display: none;
                    }

                    .injectedCalculator__form__inputWrapper.--points input {
                        background-color: transparent;
                        border: solid 7.5px #0061A033;
                        color: #041E42;
                    }

                    .injectedCalculator__form__inputWrapper.--bonus input {
                        background-color: #0061A0;
                        border: solid 7.5px #0061A033;
                    }

                    .injectedCalculator__form__inputWrapper.--total input {
                        background-color: #008BC4;
                        border: solid 7.5px #0061A0;
                        border-radius: 12px 12px 0px 0px;
                    }

                    .injectedCalculator__form__inputWrapper.--points label {
                        background-color: #0061A0;
                    }

                    .injectedCalculator__form__inputWrapper.--bonus label {
                        background-color: #40B5E5;
                    }

                    .injectedCalculator__form__inputWrapper.--total label {
                        background-color: #041E42;
                    }

                    .injectedCalculator__form__inputWrapper {
                        width: 100%;
                    }

                    .injectedCalculator__wrapper {
                        padding: 45px 0px; 
                    }

                    .injectedCalculator__form__inputFooter {
                        background: #0061a0;
                        margin-top: -1px;
                        border-radius: 0px 0px 12px 12px;
                        padding: 10px 10px;
                        text-align: center;
                        width: 100%;
                        display: block;
                        font-weight: 700;
                        font-size: 20px;
                        color: #FFFFFF;
                    }

                    .injectedCalculator__header__title {
                        font-size: 32px;
                    }

                    .injectedCalculator__wrapperController__title {
                        font-size: 24px;
                    }

                    .injectedCalculator__form__time {
                        padding: 35px 30px;
                        border: solid 2px #041E42;
                        border-radius: 20px;
                        width: 100%;
                        flex-direction: column;
                    }

                    .injectedCalculator__form__timeTitle {
                        color: #041E42;
                        font-weight: 700;
                        font-size: 28px;
                        text-align: center;
                    }

                    .injectedCalculator__form__timeOptions {
                        margin-top: 40px;
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                        align-content: center;
                        flex-wrap: wrap;
                    }   

                    .injectedCalculator__form__timeOption label {
                        display: flex;
                        align-items: center;
                        gap: 22px;
                    }

                    .injectedCalculator__form__timeOption input {
                        display: none;
                    }

                    .injectedCalculator__form__timeOption label::before {
                        content: url('data:image/svg+xml,<svg width="37" height="37" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="50.8189" height="50.8189" rx="25.4095" fill="%230061A0" fill-opacity="0.2"/></svg>');
                        font-size: 0;
                    }

                    .injectedCalculator__form__timeOption input:checked + label::before {
                        content: url('data:image/svg+xml,<svg width="37" height="37" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="50.8189" height="50.8189" rx="25.4095" fill="%230061A0" fill-opacity="0.2"/><rect x="5.86328" y="5.86328" width="39.0915" height="39.0915" rx="19.5457" fill="%230061A0"/></svg>');
                    }

                    .injectedCalculator__isClub__title {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .injectedCalculator__isClub {
                        padding: 50px 40px;
                        flex-direction: column;
                    }

                    .injectedCalculator__isClub__titleElement {
                        font-weight: 700;
                        font-size: 26px;
                        text-align: center;
                        margin-top: 20px;
                        margin-bottom: 0px;
                        color: #FFFFFF;
                    }

                    .injectedCalculator__isClub__content {
                        margin-top: 34px;
                    }

                    .injectedCalculator__isClub__button {
                        background-color: #C4D600;
                        color: #041E42;
                        font-weight: 700;
                        font-size: 22px;
                        height: 70px;
                        border-radius: 84px;
                        padding: 15px 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        margin: 0 auto;
                        max-width: 250px;
                        width: 100%;
                    }

                    .injectedCalculator__isClub__disclaimer {
                        color: #FFFFFF;
                        font-size: 16px;
                        font-weight: 400;
                        display: block;
                        margin-top: 28px;
                        text-align: center;
                    }

                    .injectedCalculator__notClub {
                        background: linear-gradient(269.26deg, #00609F -5.03%, #3EB1E1 196.34%);
                        padding: 20px;
                        padding-bottom: 0px;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                    }

                    .injectedCalculator__notClub__titleElement {
                        font-weight: 200;
                        color: #FFFFFF;
                        font-size: 30px;
                        margin-bottom: 26px;
                        line-height: normal;
                    }

                    .injectedCalculator__notClub__description {
                        font-weight: 700;
                        color: #FFFFFF;
                        font-size: 26px;
                        margin-bottom: 16px;
                        line-height: normal;
                        text-align: center;
                    }

                    .injectedCalculator__notClub__image {
                        height: 250px;
                        width: 100%;
                        max-width: 300px;
                        background-size: contain;
                        background-position: bottom;
                        background-repeat: no-repeat;
                        background-image: url("https://imgur.com/Mhu772w.png");
                    }

                    .injectedCalculator__notClub__titleElement strong {
                        font-weight: 700;
                    }

                    .injectedCalculator__notClub__cta {
                        text-transform: uppercase;
                        font-weight: 300;
                        font-size: 17px;
                        line-height: normal;
                        background-color: #041E42;
                        max-width: 295px;
                        width: 100%;
                        padding: 13px 12px;
                        min-height: 53px;
                        border-radius: 30px;
                        color: #FFFFFF;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        transition: all 0.3s ease-in-out;
                    }

                    .injectedCalculator__notClub__cta:hover {
                        background-color: #003366;
                    }

                    .injectedCalculator__notClub__content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                }

                @media screen and (min-width: 1024px) {
                    .injectedCalculator__notClub__cta {
                        text-transform: uppercase;
                        font-weight: 300;
                        font-size: 20px;
                        line-height: normal;
                        background-color: #041E42;
                        max-width: 295px;
                        width: 100%;
                        padding: 15px 12px;
                        min-height: 62px;
                        border-radius: 30px;
                        color: #FFFFFF;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        transition: all 0.3s ease-in-out;
                    }

                    .injectedCalculator__notClub__cta:hover {
                        background-color: #003366;
                    }

                    .injectedCalculator__notClub__content {
                        max-width: 715px;
                    }

                    .injectedCalculator__notClub__titleElement {
                        font-weight: 200;
                        color: #FFFFFF;
                        font-size: 42px;
                        margin-bottom: 35px;
                        line-height: normal;
                    }

                    .injectedCalculator__notClub__description {
                        font-weight: 400;
                        color: #FFFFFF;
                        font-size: 36px;
                        margin-bottom: 35px;
                        line-height: normal;
                    }

                    .injectedCalculator__notClub__description strong {
                        font-weight: 700;
                        color: #041E42;
                    }

                    .injectedCalculator__notClub__titleElement strong {
                        font-weight: 700;
                    }

                    .injectedCalculator__controlledWrapper__content .injectedCalculator__container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .injectedCalculator__notClub {
                        background: linear-gradient(269.26deg, #00609F -5.03%, #3EB1E1 196.34%);
                        padding: 20px 0px;
                        padding-bottom: 0px;
                        justify-content: center;
                        align-items: center;
                        gap: 30px;
                    }

                    .injectedCalculator__notClub__image {
                        height: 450px;
                        width: 100%;
                        max-width: 384px;
                        background-size: cover;
                        background-position: bottom;
                        background-repeat: no-repeat;
                        background-image: url("https://imgur.com/xIXSWoc.png");
                    }

                    .injectedCalculator__isClub__disclaimer {
                        font-weight: 400;
                        color: #FFFFFF;
                        font-size: 16px;
                        margin-top: 18px;
                        display: block;
                        text-align: center;
                    }

                    .injectedCalculator__isClub__button {
                        padding: 16px 12px;
                        font-size: 26px;
                        min-height: 60px;
                        min-width: 280px;
                        border: none;
                    }

                    .injectedCalculator__isClub {
                        justify-content: center;
                        align-items: center;
                        padding: 66px 0px;
                        gap: 20px;
                    }

                    .injectedCalculator__isClub__title {
                        align-items: center;
                        display: flex;
                        gap: 30px;
                    }

                    .injectedCalculator__form__inputFooter {
                        display: none;
                    }
                    
                    .injectedCalculator__form {
                        margin-top: 50px;
                    }

                    .injectedCalculator__wrapper {
                        padding: 90px 0px; 
                    }

                    .injectedCalculator__header__title {
                        font-size: 40px;
                    }

                    .injectedCalculator__wrapperController__title {
                        font-size: 28px;
                    }

                    .injectedCalculator__header {
                        border-bottom: solid 2px #0061A0;
                    }

                    .injectedCalculator__form__time {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 30px;
                        margin-bottom: 60px;
                    }

                    .injectedCalculator__form__timeTitle {
                        border: solid 2px #0061A0;
                        border-radius: 200px;
                        padding: 22px 30px;
                        margin: 0;
                        font-weight: 700;
                        font-size: 24px;
                        color: #0061A0;
                        line-height: normal;
                        text-align: center;
                        flex-shrink: 0;
                        min-width: 300px;
                    }

                    .injectedCalculator__form__timeOptions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .injectedCalculator__form__timeOption {
                        font-weight: 300;
                        font-size: 22px;
                        color: #041E42;
                        width: calc(50% - 5px);
                    }

                    .injectedCalculator__form__timeOption input {
                        display: none;
                    }

                    .injectedCalculator__form__timeOption label {
                        display: flex;
                        gap: 20px;
                        align-items: center;
                    }

                    .injectedCalculator__form__timeOption label::before {
                        content: url('data:image/svg+xml,<svg width="37" height="37" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="50.8189" height="50.8189" rx="25.4095" fill="%230061A0" fill-opacity="0.2"/></svg>');
                        font-size: 0;
                    }

                    .injectedCalculator__form__timeOption input:checked + label::before {
                        content: url('data:image/svg+xml,<svg width="37" height="37" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="50.8189" height="50.8189" rx="25.4095" fill="%230061A0" fill-opacity="0.2"/><rect x="5.86328" y="5.86328" width="39.0915" height="39.0915" rx="19.5457" fill="%230061A0"/></svg>');
                    }

                    .injectedCalculator__form__calculator {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .injectedCalculator__form__calculator > div {
                        align-self: flex-end;
                    }

                    #injectedCalculator__form__input--points {
                        background-color: #F3F3F3;
                        border: solid 2px #C0C0C0;
                        border-radius: 13px;
                        color: #0061A0;
                        font-size: 40px;
                        font-weight: 400;
                        padding: 16px 40px;
                        text-align: left;
                    }

                    #injectedCalculator__form__input--points::placeholder {
                        color: #99A1AF;
                        font-size: 40px;
                        line-height: normal;
                    }

                    .injectedCalculator__form__inputWrapper.--bonus input {
                        background-color: #0061A0;
                        border: solid 2px #C0C0C0;
                        color: #FFFFFF;
                        font-weight: 700;
                        font-size: 50px;
                        padding: 16px 12px;
                    }

                    .injectedCalculator__form__inputWrapper.--total input {
                        background-color: #008BC4;
                        border: solid 2px #008BC4;
                        color: #FFFFFF;
                        font-weight: 700;
                        font-size: 70px;
                        padding: 16px 12px;
                    }

                    .injectedCalculator__form__inputWrapper label {
                        color: #0061A0;
                        display: block;
                        font-weight: 400;
                        font-size: 22px;
                        margin-bottom: 16px;
                    }

                    .injectedCalculator__form__inputWrapper.--bonus {
                        max-width: 220px;
                    }

                    .injectedCalculator__form__operator {
                        height: 40px;
                        width: 40px;
                        font-weight: 700;
                        font-size: 23px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #008BC4;
                        color: #FFFFFF;
                        border-radius: 100%;
                        cursor: default;
                        flex-shrink: 0;
                        line-height: normal;
                    }

                    .injectedCalculator__form__operator span {
                        height: 31px;
                    }

                    .injectedCalculator__form__operator {
                        margin-bottom: 30px;
                    }

                    .injectedCalculator__form__inputWrapper.--points{
                        width: 280px;
                        flex-shrink: 0;
                    }

                    .injectedCalculator__isClub__titleElement {
                        font-weight: 700;
                        font-size: 36px;
                        line-height: normal;
                        margin: 0;
                        color: #FFFFFF;
                        max-width: 550px;
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
    
                s.linkTrackVars = "events,eVar82,eVar84";
                s.linkTrackEvents = "event90";
                s.events = "event90";
                s.eVar82 = getExperienceVariantName() + " " + eventLabel;
                s.eVar84 = experienceName;
    
                // dispara o link (o = custom link, d = download, e = exit)
                s.tl(true, "o", "target_activity_action");
            })();
        }
    }
})(); 