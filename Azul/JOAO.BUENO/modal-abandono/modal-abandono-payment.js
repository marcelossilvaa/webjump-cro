    (function() {
        const MAXIMUM_MINUTES_OF_INACTIVITY = 5;
        const MINUTES_TO_MILLISECONDS = 60 * 1000;
        const MAXIMUM_INACTIVITY_TIME = MAXIMUM_MINUTES_OF_INACTIVITY * MINUTES_TO_MILLISECONDS;
        let INACTIVITY_TIMEOUT;

        const SELECTORS = {
            header: "header.main-header",
            buttonGoHome: "a.sc-YysOf",
            activeBreadcrumb: "#hotel-recommendation .css-r1ir45",
            freezeTariffButton: ".fare-hold button.css-1uzd50e",
            labelOrderTariffsOnFlightsStep: ".css-tntsk8",
            inputOrderTariffsOnFlightsStep: "#sort-filter",
            wrapperOrderTariffsOnFlightsStep: ".sort-filter",
            checkboxFillPrincipalPassenger: "input[aria-label='Utilizar os dados do passageiro principal']",
            buttonGoToPaymentOnReview: "button[aria-label='Ir para pagamento']",
        };

        const BUTTON_GO_HOME_FLAG = "isAbandonmentModalTriggered";

        const eventForGiveupModalWhenTriggeredByRedirect = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
        });

        eventForGiveupModalWhenTriggeredByRedirect.isAbandonmentModalTriggered = true;

        const iconPayment = `
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H200V200H0V0Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M58.6623 25.3638C60.4475 22.1792 63.807 20 67.7082 20C73.4608 20 78.1248 24.68 78.1248 30.452C78.1248 30.5362 78.1133 30.6174 78.1018 30.6989C78.0916 30.7705 78.0815 30.8423 78.0791 30.9164C81.1309 31.983 83.3332 34.8665 83.3332 38.291C83.3332 42.6187 79.8338 46.1299 75.5207 46.1299H49.479C45.1659 46.1299 41.6665 42.6187 41.6665 38.291C41.6665 33.9632 45.1659 30.452 49.479 30.452C49.5729 30.452 49.6633 30.4643 49.7533 30.4765C49.8169 30.4851 49.8802 30.4937 49.9444 30.4979C51.0074 27.4358 53.8786 25.226 57.2915 25.226C57.762 25.226 58.2172 25.2847 58.6623 25.3638ZM75.3125 30.1876C75.2618 25.9253 71.7861 22.4717 67.5189 22.4717C64.7384 22.4717 62.1507 24.0129 60.7604 26.4898L59.8548 28.1047L58.0358 27.7767C57.6603 27.7105 57.3812 27.68 57.1275 27.68C54.9407 27.68 52.9821 29.0889 52.2515 31.1895L51.602 33.0588L49.6282 32.929C49.5014 32.9214 49.3745 32.9062 49.2527 32.8883C46.4266 32.9341 44.1382 35.2534 44.1382 38.0967C44.1382 40.9704 46.4697 43.305 49.3339 43.305H75.3125C78.1793 43.305 80.5082 40.9704 80.5082 38.0967C80.5082 35.9045 79.1028 33.9386 77.0123 33.2088L75.206 32.5781L75.2719 30.6657C75.277 30.5029 75.2922 30.3453 75.3125 30.1876Z" fill="#F0F0F0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M166.996 94.5308C168.781 91.3462 172.14 89.167 176.042 89.167C181.794 89.167 186.458 93.8469 186.458 99.619C186.458 99.7031 186.447 99.7844 186.435 99.8659C186.425 99.9375 186.415 100.009 186.413 100.083C189.464 101.15 191.667 104.033 191.667 107.458C191.667 111.786 188.167 115.297 183.854 115.297H157.812C153.499 115.297 150 111.786 150 107.458C150 103.13 153.499 99.619 157.812 99.619C157.906 99.619 157.997 99.6313 158.087 99.6435C158.15 99.6521 158.214 99.6607 158.278 99.6649C159.341 96.6028 162.212 94.393 165.625 94.393C166.095 94.393 166.551 94.4517 166.996 94.5308ZM183.646 99.3546C183.595 95.0923 180.12 91.6387 175.852 91.6387C173.072 91.6387 170.484 93.1799 169.094 95.6568L168.188 97.2717L166.369 96.9437C165.994 96.8775 165.715 96.847 165.461 96.847C163.274 96.847 161.316 98.2559 160.585 100.357L159.935 102.226L157.962 102.096C157.835 102.088 157.708 102.073 157.586 102.055C154.76 102.101 152.472 104.42 152.472 107.264C152.472 110.137 154.803 112.472 157.667 112.472H183.646C186.513 112.472 188.842 110.137 188.842 107.264C188.842 105.071 187.436 103.106 185.346 102.376L183.54 101.745L183.605 99.8327C183.61 99.6699 183.626 99.5123 183.646 99.3546Z" fill="#F0F0F0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M26.1623 158.697C27.9475 155.512 31.307 153.333 35.2082 153.333C40.9608 153.333 45.6248 158.013 45.6248 163.785C45.6248 163.869 45.6133 163.95 45.6018 164.032C45.5916 164.104 45.5815 164.175 45.5791 164.249C48.6309 165.316 50.8332 168.199 50.8332 171.624C50.8332 175.952 47.3338 179.463 43.0207 179.463H16.979C12.6659 179.463 9.1665 175.952 9.1665 171.624C9.1665 167.296 12.6659 163.785 16.979 163.785C17.0729 163.785 17.1633 163.797 17.2533 163.809C17.3169 163.818 17.3802 163.827 17.4444 163.831C18.5074 160.769 21.3786 158.559 24.7915 158.559C25.262 158.559 25.7172 158.618 26.1623 158.697ZM42.8125 163.521C42.7618 159.258 39.2861 155.805 35.0189 155.805C32.2384 155.805 29.6507 157.346 28.2604 159.823L27.3548 161.438L25.5358 161.11C25.1603 161.044 24.8812 161.013 24.6275 161.013C22.4407 161.013 20.4821 162.422 19.7515 164.523L19.102 166.392L17.1282 166.262C17.0014 166.254 16.8745 166.239 16.7527 166.221C13.9266 166.267 11.6382 168.586 11.6382 171.43C11.6382 174.303 13.9697 176.638 16.8339 176.638H42.8125C45.6793 176.638 48.0082 174.303 48.0082 171.43C48.0082 169.237 46.6028 167.272 44.5123 166.542L42.706 165.911L42.7719 163.999C42.777 163.836 42.7922 163.678 42.8125 163.521Z" fill="#F0F0F0"/>
            <g filter="url(#filter0_d_1227_6060)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M51.6665 105C51.6665 102.699 53.532 100.833 55.8332 100.833H136.667C138.968 100.833 140.833 102.699 140.833 105V108.333H51.6665V105Z" fill="white"/>
            </g>
            <g filter="url(#filter1_d_1227_6060)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M136.667 102.5H55.8332C54.4525 102.5 53.3332 103.619 53.3332 105V106.667H139.167V105C139.167 103.619 138.047 102.5 136.667 102.5ZM55.8332 100.833C53.532 100.833 51.6665 102.699 51.6665 105V108.333H140.833V105C140.833 102.699 138.968 100.833 136.667 100.833H55.8332Z" fill="#0093D0"/>
            </g>
            <g filter="url(#filter2_d_1227_6060)">
            <path d="M149.975 86.3047L76.0589 122.356C73.5118 123.598 70.5709 122.807 69.489 120.589L47.8346 76.1912C46.7527 73.9729 47.9401 71.1686 50.4873 69.9262L124.403 33.8751C126.95 32.6327 129.891 33.4235 130.973 35.6418L152.627 80.0398C153.709 82.258 152.522 85.0624 149.975 86.3047Z" fill="#E8F6FB"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M50.8526 70.6751C48.6185 71.7648 47.7493 74.115 48.5837 75.8257L70.238 120.224C71.0724 121.934 73.4595 122.696 75.6937 121.607L149.609 85.5556C151.844 84.4659 152.713 82.1157 151.878 80.405L130.224 36.007C129.39 34.2963 127.003 33.5343 124.768 34.6239L50.8526 70.6751ZM47.0857 76.5564C45.7562 73.8305 47.2618 70.5721 50.122 69.1771L124.038 33.126C126.898 31.7309 130.393 32.5506 131.722 35.2764L153.376 79.6743C154.706 82.4002 153.2 85.6586 150.34 87.0536L76.4243 123.105C73.564 124.5 70.0695 123.68 68.74 120.954L47.0857 76.5564Z" fill="#0093D0"/>
            <path d="M48.7983 78.167L131.937 37.6177L136.686 47.3546L53.5474 87.9039L48.7983 78.167Z" fill="#0093D0"/>
            <path d="M70.0968 110.429C69.6933 109.602 70.0369 108.604 70.8642 108.201L81.3501 103.086C82.1774 102.683 83.1752 103.026 83.5787 103.854L85.7706 108.348C86.1741 109.175 85.8305 110.173 85.0032 110.576L74.5173 115.69C73.69 116.094 72.6922 115.75 72.2887 114.923L70.0968 110.429Z" fill="#B2DEF0"/>
            <path opacity="0.3" fill-rule="evenodd" clip-rule="evenodd" d="M97.2809 74.9184C96.8774 74.0911 97.221 73.0933 98.0483 72.6898L107.036 68.3061C107.864 67.9026 108.861 68.2461 109.265 69.0735C109.668 69.9008 109.325 70.8986 108.497 71.3021L99.5095 75.6858C98.6822 76.0893 97.6844 75.7457 97.2809 74.9184Z" fill="#0093D0"/>
            <path opacity="0.3" fill-rule="evenodd" clip-rule="evenodd" d="M61.3293 92.4531C60.9257 91.6258 61.2693 90.628 62.0966 90.2245L92.0564 75.6121C92.8837 75.2086 93.8815 75.5521 94.285 76.3795C94.6885 77.2068 94.345 78.2046 93.5177 78.6081L63.5579 93.2204C62.7305 93.6239 61.7328 93.2804 61.3293 92.4531Z" fill="#0093D0"/>
            </g>
            <g filter="url(#filter3_d_1227_6060)">
            <path d="M46.6665 110.834C46.6665 108.532 48.532 106.667 50.8332 106.667H140.833C143.134 106.667 145 108.532 145 110.834V165.834C145 168.135 143.134 170 140.833 170H50.8332C48.532 170 46.6665 168.135 46.6665 165.834V110.834Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M140.833 108.334H50.8332C49.4525 108.334 48.3332 109.453 48.3332 110.834V165.834C48.3332 167.214 49.4525 168.334 50.8332 168.334H140.833C142.214 168.334 143.333 167.214 143.333 165.834V110.834C143.333 109.453 142.214 108.334 140.833 108.334ZM50.8332 106.667C48.532 106.667 46.6665 108.532 46.6665 110.834V165.834C46.6665 168.135 48.532 170 50.8332 170H140.833C143.134 170 145 168.135 145 165.834V110.834C145 108.532 143.134 106.667 140.833 106.667H50.8332Z" fill="#0093D0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M121.201 113.696C121.357 113.469 121.614 113.333 121.889 113.333H144.166C144.627 113.333 145 113.707 145 114.167V133.333C145 133.555 144.912 133.767 144.755 133.923C144.599 134.079 144.387 134.167 144.165 134.167L121.888 134.142C121.593 134.142 121.32 133.985 121.17 133.731L115.115 123.424C114.951 123.146 114.963 122.798 115.146 122.531L121.201 113.696ZM122.328 115L116.82 123.037L122.366 132.476L143.333 132.499V115H122.328Z" fill="#0093D0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M120.833 123.75C120.833 121.219 122.885 119.167 125.417 119.167C127.948 119.167 130 121.219 130 123.75C130 126.282 127.948 128.334 125.417 128.334C122.885 128.334 120.833 126.282 120.833 123.75ZM125.417 120.834C123.806 120.834 122.5 122.139 122.5 123.75C122.5 125.361 123.806 126.667 125.417 126.667C127.027 126.667 128.333 125.361 128.333 123.75C128.333 122.139 127.027 120.834 125.417 120.834Z" fill="#0093D0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M144.162 165.002H47.0833V164.168H144.162V165.002Z" fill="#0093D0"/>
            </g>
            <defs>
            <filter id="filter0_d_1227_6060" x="48.6665" y="99.8335" width="95.1667" height="13.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1.5"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1227_6060"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1227_6060" result="shape"/>
            </filter>
            <filter id="filter1_d_1227_6060" x="48.6665" y="99.8335" width="95.1667" height="13.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1.5"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1227_6060"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1227_6060" result="shape"/>
            </filter>
            <filter id="filter2_d_1227_6060" x="43.5969" y="31.457" width="113.268" height="97.3169" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1.5"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1227_6060"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1227_6060" result="shape"/>
            </filter>
            <filter id="filter3_d_1227_6060" x="43.6665" y="105.667" width="104.333" height="69.3335" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1.5"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1227_6060"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1227_6060" result="shape"/>
            </filter>
            </defs>
        </svg>
    `;

        const MODAL_CONFIG_BASED_ON_STEP = {
            identifier: "wallet",
            title: "Você está na última etapa!",
            description: "Escolha um método de pagamento e garanta sua passagem",
            continueButtonText: "Continuar e finalizar pagamento",
            giveUpButtonText: "Desistir mesmo assim",
            icon: iconPayment,
        };

        function initBookingFlowAbandonmentModal() {
            initProcess();

            function initProcess() {
                console.log("[AT] Injecting booking flow abandonment modal.");

                addListenerToGoHomeButton();
                resetInactivityTimer();
                listenersToResetInactivityTimer();
                observerHeaderChange();
                injectCustomStyle();
            }

            function addListenerToGoHomeButton() {
                const goHomeButton = document.querySelectorAll(SELECTORS.buttonGoHome);

                goHomeButton?.forEach(button => {
                    button.classList.add(BUTTON_GO_HOME_FLAG);

                    button.addEventListener("click", (event) => {
                        if (event.isAbandonmentModalTriggered) {
                            console.log("[AT] User confirmed give up of booking flow. Redirecting to home page.");
                            return;
                        }

                        event.preventDefault();
                        console.log("[AT] User clicked go home button, showing booking flow abandonment modal.");
                        showModalAbandonment(false);
                    });
                });
            }

            function resetInactivityTimer() {
                clearTimeout(INACTIVITY_TIMEOUT);

                INACTIVITY_TIMEOUT = setTimeout(() => {
                    console.log("[AT] User is inactive, showing booking flow abandonment modal.");
                    showModalAbandonment();
                }, MAXIMUM_INACTIVITY_TIME);
            }

            function listenersToResetInactivityTimer() {
                const listeners = ["keydown", "click", "scroll"];

                listeners.forEach((listener) => {
                    document.addEventListener(listener, function() {
                        console.log("[AT] Adding listener to reset inactivity timer: ", listener);
                        resetInactivityTimer();
                    });
                });
            }

            function showModalAbandonment(isTriggeredByInactivity = true) {
                if (checkIfModalIsOpen()) {
                    console.log("[AT] Modal is already open.");
                    return;
                }

                const modalConfig = MODAL_CONFIG_BASED_ON_STEP;

                if (!modalConfig) {
                    console.log("[AT] Modal config not found.");

                    return;
                }

                appendDefaultModal(isTriggeredByInactivity, modalConfig);
            }

            function observerHeaderChange() {
                const mainElement = document.querySelector("body");

                if (!mainElement) {
                    console.log("[AT] Main element not found.");
                    return;
                }

                const observerHeader = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                            const buttonGoHome = document.querySelector(SELECTORS.buttonGoHome);

                            if (buttonGoHome && !buttonGoHome.classList.contains(BUTTON_GO_HOME_FLAG)) {
                                addListenerToGoHomeButton(); // header changed, need to add the listener again
                            }
                        }
                    }
                });

                observerHeader.observe(mainElement, {
                    childList: true
                });
            }

            function appendDefaultModal(isTriggeredByInactivity, modalConfig) {
                if (!modalConfig) {
                    console.log("[AT] Modal config not found.");
                    return;
                }

                console.log("[AT] Appending default modal.");
                console.log(modalConfig);
                console.log(isTriggeredByInactivity);

                removeModal();

                const labelTypeModal = getLabelAnalyticsForDefaultModal(isTriggeredByInactivity, modalConfig);
                analyticsEvent(labelTypeModal);

                const defaultModal = document.createElement("div");
                defaultModal.classList.add("abandonmentModalInject");

                defaultModal.appendChild(getHtmlForDefaultModal(false));

                defaultModal.innerHTML = defaultModal.innerHTML.replace("[replace_icon]", modalConfig.icon);
                defaultModal.innerHTML = defaultModal.innerHTML.replace("[replace_title]", modalConfig.title);
                defaultModal.innerHTML = defaultModal.innerHTML.replace("[replace_description]", modalConfig.description);
                defaultModal.innerHTML = defaultModal.innerHTML.replace("[replace_continueButtonText]", modalConfig.continueButtonText);

                if (isTriggeredByInactivity) {
                    defaultModal.innerHTML = defaultModal.innerHTML.replace("[replace_giveUpButtonText]", "Voltar");
                } else {
                    defaultModal.innerHTML = defaultModal.innerHTML.replace("[replace_giveUpButtonText]", modalConfig.giveUpButtonText);
                }

                defaultModal.querySelector(".abandonmentModal__button--continue").addEventListener("click", () => {
                    analyticsEvent(labelTypeModal + " - Ação - Continuar");
                    removeModal();
                });

                defaultModal.querySelector(".abandonmentModal__button--giveup").addEventListener("click", () => {
                    analyticsEvent(labelTypeModal + " - Ação - Desistir");

                    if (!isTriggeredByInactivity) {
                        const buttonGoHome = document.querySelector(SELECTORS.buttonGoHome);
                        buttonGoHome?.dispatchEvent(eventForGiveupModalWhenTriggeredByRedirect);
                        return;
                    }

                    removeModal();
                });

                document.body.appendChild(defaultModal);
            }

            function getHtmlForDefaultModal(showFreezeWrapper = false) {
                const modal = document.createElement("div");
                modal.classList.add("abandonmentModal__modal");

                modal.innerHTML = `
                <div class="abandonmentModal__icon">[replace_icon]</div>
                <h3 class="abandonmentModal__title">[replace_title]</h3>
                <p class="abandonmentModal__subtitle">[replace_description]</p>
                <div class="abandonmentModal__buttons">
                    <button class="abandonmentModal__button abandonmentModal__button--continue">
                        [replace_continueButtonText]
                    </button>
                    <button class="abandonmentModal__button abandonmentModal__button--giveup">
                        [replace_giveUpButtonText]
                    </button>
                </div>
                <div class="abandonmentModal__freezeTariffWrapper">
                    <div class="abandonmentModal__freezeTariff__text">
                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M15 4.9297V3.25H10V4.9297H15ZM18.3594 8.60157C19.453 9.98176 20 11.5312 20 13.25C20 15.3073 19.2708 17.0716 17.8125 18.543C16.3542 20.0143 14.5833 20.75 12.5 20.75C10.4167 20.75 8.6458 20.0143 7.1875 18.543C5.7292 17.0715 5 15.3072 5 13.2499C5 11.1926 5.7292 9.42832 7.1875 7.95692C8.6458 6.48552 10.4167 5.75002 12.5 5.75002C14.1927 5.75002 15.7552 6.30992 17.1875 7.42972L18.3594 6.21872C18.776 6.55732 19.1667 6.94792 19.5312 7.39062L18.3594 8.60157ZM16.621 17.3906C15.4883 18.5364 14.1146 19.1093 12.5 19.1093C10.8854 19.1093 9.51166 18.5364 8.37886 17.3906C7.24606 16.2448 6.67966 14.8646 6.67966 13.2499C6.67966 11.6354 7.24596 10.2617 8.37896 9.12888C9.51166 7.99608 10.8854 7.42968 12.5 7.42968C14.1146 7.42968 15.4883 7.99608 16.6211 9.12888C17.7539 10.2617 18.3203 11.6354 18.3203 13.25C18.3203 14.8646 17.754 16.2448 16.621 17.3906ZM11.6797 14.1093V9.1093H13.3203V14.1093H11.6797Z"
                                fill="#026CB6" />
                        </svg>
                        <span>Precisa de mais tempo?</span>
                    </div>
                    <button class="abandonmentModal__freezeTariff__button">
                        Congelar Tarifa
                    </button>
                </div>
            `;

                if (!showFreezeWrapper) {
                    modal.querySelector(".abandonmentModal__freezeTariffWrapper").remove();
                }

                return modal;
            }

            function getLabelAnalyticsForDefaultModal(isTriggeredByInactivity, modalConfig) {
                let labelTypeModal = "Modal por redirecionamento - " + modalConfig.identifier;

                if (isTriggeredByInactivity) {
                    labelTypeModal = "Modal por inatividade - " + modalConfig.identifier;
                }

                return labelTypeModal;
            }

            function checkIfModalIsOpen() {
                return !!document.querySelector(".abandonmentModalInject");
            }

            function removeModal() {
                const abandonmentModal = document.querySelector(".abandonmentModalInject");

                if (abandonmentModal) {
                    abandonmentModal.remove();
                }
            }

            function injectCustomStyle() {
                const style = document.createElement("style");

                style.innerHTML = `
                .abandonmentModalInject {
                    align-items: center;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    inset: 0px;
                    position: fixed;
                    z-index: 1089;
                    gap: 20px;
                }

                .abandonmentModal__modal {
                    background-color: #FFFFFF;
                    padding: 24px;
                    border-radius: 8px;
                    width: 384px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    box-sizing: border-box;
                }

                .abandonmentModal__modal.abandonmentModal__modal--large {
                    width: 512px;
                }

                .abandonmentModal__icon {
                    height: 200px;
                    width: 200px;
                }

                .abandonmentModal__title {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 24px;
                    line-height: 100%;
                    letter-spacing: 0px;
                    text-align: center;
                    vertical-align: middle;
                    color: #026CB6;
                    margin: 0px;
                }

                .abandonmentModal__subtitle {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 100%;
                    letter-spacing: 0px;
                    text-align: center;
                    vertical-align: middle;
                    color: #606060;
                    margin: 0px;
                }

                .abandonmentModal__buttons {
                    width: 100%;
                }

                .abandonmentModal__button {
                    width: 100%;
                    min-height: 48px;
                    text-align: center;
                    padding: 12px 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 24px;
                }

                .abandonmentModal__button--continue {
                    background-color: #026CB6;
                    color: #FFFFFF;
                }
                
                .abandonmentModal__button--giveup {
                    background-color: transparent;
                    color: #026CB6;
                    margin-top: 8px;
                }

                .abandonmentModal__freezeTariffWrapper {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    align-items: center;
                }

                .abandonmentModal__freezeTariff__text {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: center;
                    vertical-align: middle;
                    color: #026CB6;
                }

                .abandonmentModal__freezeTariff__button {
                    background-color: transparent;
                    cursor: pointer;
                    border: solid 1px #026CB6;
                    padding: 6px 11px;
                    border-radius: 4px;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 20px;
                    text-align: center;
                    vertical-align: middle;
                    color: #026CB6;
                }

                .abandonmentModal__actionButtons {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 24px;
                    width: 100%;
                }

                .abandonmentModal__actionButtons__button {
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                    width: 220px;
                    padding: 24px;
                    position: relative;
                    border-width: 2px;
                    border-style: solid;
                    border-radius: 8px;
                    text-align: left;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                }

                .abandonmentModal__actionButtons__button.abandonmentModal__actionButtons__button--primary {
                    background: radial-gradient(74.06% 85.84% at 25% 14.16%, #2797E6 0%, #0A436A 100%);
                    box-shadow: 0px 1px 4px 0px #041E4229;
                    border: 2px solid var(--secundary-blue-700, #13B5EA);
                    color: #FFFFFF;
                }

                .abandonmentModal__actionButtons__button.abandonmentModal__actionButtons__button--secondary {
                    background-color: transparent;
                    border: 2px solid #909090;
                    color: #909090;
                }

                .abandonmentModal__actionButtons__button__icon {
                    position: absolute;
                    position: absolute;
                    top: -24px;
                    left: 24px;
                }

                .abandonmentModal__actionButtons__button__title {
                    font-weight: 600;
                    font-size: 24px;
                    line-height: 27px;
                    letter-spacing: -0.2px;
                    vertical-align: middle;
                }

                .abandonmentModal__actionButtons__button__description {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 130%;
                    letter-spacing: 0;
                    vertical-align: middle;
                }
            `;

                document.head.appendChild(style);
            }

            function analyticsEvent(label) {
                if (label === undefined || !label) {
                    console.log("[AT] Missing parameters for analytics event.");
                    return;
                }

                const labelEvent = "AT_modal_abandono " + label;

                console.log("[AT] Analytics event triggered:", labelEvent);

                // === Disparo Adobe Analytics (cópia/cole e ajuste as strings) ===
                (function() {
                    var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
                    if (!s || typeof s.tl !== "function") return;

                    // informe aqui seu evento e as eVars/props que quiser
                    s.linkTrackVars = "events,eVar82"; // listar todas as variáveis que serão enviadas
                    s.linkTrackEvents = "event90"; // código do event
                    s.events = "event90"; // mesmo código do event
                    s.eVar82 = labelEvent; // valor da eVar82 (ex: "native" ou "floating")

                    // dispara o link (o = custom link, d = download, e = exit)
                    s.tl(true, "o", "target_activity_action");
                })();
            }
        }

        if (window.bookingFlowAbandonmentModalInjectedWallet) {
            console.log("[AT] Booking flow abandonment modal already injected.");
            return;
        }

        const isReady = document.readyState === "complete" || document.readyState === "interactive";

        if (isReady) {
            initBookingFlowAbandonmentModal();
        } else {
            document.addEventListener("DOMContentLoaded", initBookingFlowAbandonmentModal);
        }

        window.bookingFlowAbandonmentModalInjectedWallet = true;
    })();