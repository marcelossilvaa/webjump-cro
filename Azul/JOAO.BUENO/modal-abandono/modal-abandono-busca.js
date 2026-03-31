// Modal de abandono - Etapa Busca (Voos)
(function () {
    'use strict';

    var MAXIMUM_MINUTES_OF_INACTIVITY = 5;
    var MINUTES_TO_MILLISECONDS = 60 * 1000;
    var MAXIMUM_INACTIVITY_TIME = MAXIMUM_MINUTES_OF_INACTIVITY * MINUTES_TO_MILLISECONDS;
    var INACTIVITY_TIMEOUT;

    var EXPECTED_STEP = 'Voos';

    var SELECTORS = {
        header: 'header.main-header',
        buttonGoHome: 'header a.azul-logo',
        activeBreadcrumb: '#hotel-recommendation .css-r1ir45',
        freezeTariffButton: '.fare-hold button.css-1uzd50e',
        labelOrderTariffsOnFlightsStep: '.css-tntsk8',
        inputOrderTariffsOnFlightsStep: '#sort-filter',
        wrapperOrderTariffsOnFlightsStep: '.sort-filter',
    };

    var BUTTON_GO_HOME_FLAG = 'isAbandonmentModalTriggered';

    var eventForGiveupModalWhenTriggeredByRedirect = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    eventForGiveupModalWhenTriggeredByRedirect.isAbandonmentModalTriggered = true;

    // ICONS
const iconCoin = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0H200V200H0V0Z" fill="white"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M58.6625 25.3638C60.4478 22.1792 63.8072 20 67.7084 20C73.461 20 78.1251 24.68 78.1251 30.452C78.1251 30.5362 78.1136 30.6174 78.102 30.6989C78.0919 30.7705 78.0817 30.8423 78.0793 30.9164C81.1311 31.983 83.3334 34.8665 83.3334 38.291C83.3334 42.6187 79.8341 46.1299 75.5209 46.1299H49.4792C45.1661 46.1299 41.6667 42.6187 41.6667 38.291C41.6667 33.9632 45.1661 30.452 49.4792 30.452C49.5731 30.452 49.6636 30.4643 49.7535 30.4765C49.8171 30.4851 49.8804 30.4937 49.9447 30.4979C51.0076 27.4358 53.8788 25.226 57.2917 25.226C57.7622 25.226 58.2174 25.2847 58.6625 25.3638ZM75.3128 30.1877C75.2621 25.9254 71.7864 22.4718 67.5193 22.4718C64.7387 22.4718 62.151 24.0129 60.7608 26.4899L59.8551 28.1048L58.0361 27.7768C57.6606 27.7106 57.3815 27.6801 57.1278 27.6801C54.941 27.6801 52.9824 29.089 52.2518 31.1896L51.6023 33.0588L49.6285 32.9291C49.5017 32.9215 49.3748 32.9062 49.253 32.8884C46.4269 32.9342 44.1385 35.2535 44.1385 38.0968C44.1385 40.9704 46.47 43.3051 49.3342 43.3051H75.3128C78.1796 43.3051 80.5086 40.9704 80.5086 38.0968C80.5086 35.9045 79.1031 33.9387 77.0126 33.2089L75.2063 32.5782L75.2722 30.6658C75.2773 30.503 75.2925 30.3454 75.3128 30.1877Z" fill="#F0F0F0"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M166.996 94.5306C168.781 91.346 172.14 89.1667 176.042 89.1667C181.794 89.1667 186.458 93.8467 186.458 99.6187C186.458 99.7029 186.447 99.7842 186.435 99.8656C186.425 99.9373 186.415 100.009 186.413 100.083C189.464 101.15 191.667 104.033 191.667 107.458C191.667 111.785 188.167 115.297 183.854 115.297H157.812C153.499 115.297 150 111.785 150 107.458C150 103.13 153.499 99.6187 157.812 99.6187C157.906 99.6187 157.997 99.631 158.087 99.6432C158.15 99.6519 158.214 99.6605 158.278 99.6647C159.341 96.6026 162.212 94.3927 165.625 94.3927C166.095 94.3927 166.551 94.4514 166.996 94.5306ZM183.646 99.3544C183.595 95.0921 180.12 91.6385 175.853 91.6385C173.072 91.6385 170.484 93.1797 169.094 95.6566L168.188 97.2716L166.369 96.9435C165.994 96.8774 165.715 96.8468 165.461 96.8468C163.274 96.8468 161.316 98.2558 160.585 100.356L159.936 102.226L157.962 102.096C157.835 102.088 157.708 102.073 157.586 102.055C154.76 102.101 152.472 104.42 152.472 107.264C152.472 110.137 154.803 112.472 157.667 112.472H183.646C186.513 112.472 188.842 110.137 188.842 107.264C188.842 105.071 187.436 103.105 185.346 102.376L183.54 101.745L183.605 99.8325C183.611 99.6698 183.626 99.5121 183.646 99.3544Z" fill="#F0F0F0"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M26.1625 158.697C27.9478 155.512 31.3072 153.333 35.2084 153.333C40.961 153.333 45.6251 158.013 45.6251 163.785C45.6251 163.869 45.6136 163.951 45.602 164.032C45.5919 164.104 45.5817 164.176 45.5793 164.25C48.6311 165.316 50.8334 168.2 50.8334 171.624C50.8334 175.952 47.3341 179.463 43.0209 179.463H16.9792C12.6661 179.463 9.16675 175.952 9.16675 171.624C9.16675 167.296 12.6661 163.785 16.9792 163.785C17.0731 163.785 17.1636 163.798 17.2535 163.81C17.3171 163.818 17.3804 163.827 17.4447 163.831C18.5076 160.769 21.3788 158.559 24.7917 158.559C25.2622 158.559 25.7174 158.618 26.1625 158.697ZM42.8128 163.521C42.7621 159.259 39.2864 155.805 35.0193 155.805C32.2387 155.805 29.651 157.346 28.2608 159.823L27.3551 161.438L25.5361 161.11C25.1606 161.044 24.8815 161.013 24.6278 161.013C22.441 161.013 20.4824 162.422 19.7518 164.523L19.1023 166.392L17.1285 166.262C17.0017 166.255 16.8748 166.239 16.753 166.222C13.9269 166.267 11.6385 168.587 11.6385 171.43C11.6385 174.304 13.97 176.638 16.8342 176.638H42.8128C45.6796 176.638 48.0086 174.304 48.0086 171.43C48.0086 169.238 46.6031 167.272 44.5126 166.542L42.7063 165.911L42.7722 163.999C42.7773 163.836 42.7925 163.679 42.8128 163.521Z" fill="#F0F0F0"/>
        <g filter="url(#filter0_d_1222_11096)">
        <ellipse cx="100.002" cy="94" rx="48.8889" ry="48" fill="white"/>
        <path d="M100.002 46C126.897 46.0002 148.719 67.3228 148.889 93.6895V94.3096C148.719 120.677 126.897 142 100.002 142L100 141.999V46H100.002Z" fill="#CAF2FA"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M100.002 130.75C120.985 130.75 137.641 114.103 137.641 94C137.641 73.8973 120.985 57.25 100.002 57.25C79.019 57.25 62.363 73.8973 62.363 94C62.363 114.103 79.019 130.75 100.002 130.75ZM100.002 142C127.003 142 148.891 120.51 148.891 94C148.891 67.4903 127.003 46 100.002 46C73.0013 46 51.113 67.4903 51.113 94C51.113 120.51 73.0013 142 100.002 142Z" fill="#89D4E3"/>
        <path d="M100 46C72.7017 46 50.5 67.7981 50.5 94.6C50.5 95.14 50.5 109 50.5 109C50.5 133.822 72.7017 154 100 154C127.298 154 149.5 133.822 149.5 109C149.5 109 149.5 95.14 149.5 94.6C149.5 67.7981 127.298 46 100 46ZM61.5 125.2V131.428C57.7417 126.19 55.2667 120.142 54.46 113.644C56.275 117.802 58.6583 121.654 61.5183 125.128C61.5183 125.146 61.5 125.164 61.5 125.2ZM70.6667 140.788C68.6867 139.276 66.8535 137.638 65.1667 135.856V129.088C66.89 130.762 68.7235 132.31 70.6667 133.714V140.788ZM79.8333 146.17C77.8715 145.288 76.0015 144.298 74.205 143.2H74.3333V136.144C76.0933 137.188 77.945 138.124 79.8333 138.97V146.17ZM89 149.194C87.1117 148.762 85.2783 148.24 83.5 147.61V140.41C85.2967 141.04 87.13 141.562 89 141.976V149.194ZM98.1667 150.364C96.2967 150.292 94.4635 150.13 92.6667 149.86V142.66C94.4635 142.93 96.315 143.092 98.1667 143.146V150.364ZM107.333 149.86C105.537 150.13 103.703 150.292 101.833 150.364V143.146C103.685 143.092 105.537 142.93 107.333 142.66V149.86ZM116.5 147.61C114.722 148.24 112.888 148.762 111 149.194V141.976C112.87 141.562 114.703 141.04 116.5 140.41V147.61ZM120.167 146.17V138.97C122.055 138.124 123.907 137.188 125.667 136.144V143.2H125.795C123.998 144.298 122.128 145.288 120.167 146.17ZM134.833 135.856C133.147 137.638 131.313 139.276 129.333 140.788V133.714C131.277 132.31 133.11 130.762 134.833 129.088V135.856ZM138.5 131.428V125.2C138.5 125.164 138.482 125.146 138.482 125.128C141.342 121.654 143.725 117.802 145.54 113.644C144.733 120.142 142.258 126.19 138.5 131.428ZM100 139.456C74.81 139.456 54.3133 119.332 54.3133 94.6C54.3133 69.868 74.81 49.7439 100 49.7439C125.19 49.7439 145.687 69.868 145.687 94.6C145.687 119.332 125.19 139.456 100 139.456Z" fill="#0093D0"/>
        <path d="M138.501 131.421V125.193C138.501 125.157 138.483 125.139 138.483 125.121C141.343 121.647 143.726 117.795 145.541 113.637C144.734 120.135 142.259 126.183 138.501 131.421Z" fill="#89D4E3"/>
        <path d="M134.836 129.088V135.856C133.149 137.638 131.316 139.276 129.336 140.788V133.714C131.279 132.31 133.112 130.762 134.836 129.088Z" fill="#89D4E3"/>
        <path d="M125.797 143.202C124 144.3 122.13 145.29 120.169 146.172V138.972C122.057 138.126 123.909 137.19 125.669 136.146V143.202H125.797Z" fill="#89D4E3"/>
        <path d="M116.505 140.412V147.612C114.727 148.242 112.893 148.764 111.005 149.196V141.978C112.875 141.564 114.708 141.042 116.505 140.412Z" fill="#89D4E3"/>
        <path d="M107.336 142.656V149.855C105.539 150.125 103.706 150.287 101.836 150.359V143.141C103.688 143.088 105.539 142.926 107.336 142.656Z" fill="#89D4E3"/>
        <path d="M98.1689 143.142V150.36C96.2989 150.288 94.4657 150.126 92.6689 149.856V142.656C94.4655 142.926 96.3172 143.088 98.1689 143.142Z" fill="white"/>
        <path d="M89.0029 141.971V149.189C87.1147 148.757 85.2812 148.235 83.5029 147.605V140.406C85.2997 141.035 87.1329 141.557 89.0029 141.971Z" fill="white"/>
        <path d="M79.8377 138.976V146.175C77.876 145.294 76.006 144.303 74.2095 143.205H74.3377V136.149C76.0977 137.194 77.9495 138.129 79.8377 138.976Z" fill="white"/>
        <path d="M70.6667 133.714V140.788C68.6867 139.276 66.8535 137.638 65.1667 135.856V129.088C66.89 130.762 68.7233 132.31 70.6667 133.714Z" fill="white"/>
        <path d="M61.52 125.127C61.52 125.145 61.5017 125.163 61.5017 125.199V131.427C57.7434 126.189 55.2684 120.141 54.4617 113.643C56.2767 117.801 58.6599 121.653 61.52 125.127Z" fill="white"/>
        <path d="M99.9999 69.9995L107.471 83.903L123.248 86.5831L112.089 97.856L114.368 113.416L99.9999 106.48L85.6318 113.416L87.9109 97.856L76.7518 86.5831L92.5285 83.903L99.9999 69.9995Z" fill="#15B7EC"/>
        <path d="M85.6339 113.416L100.002 106.48V69.9995L92.5306 83.903L76.7539 86.5831L87.913 97.856L85.6339 113.416Z" fill="#89D4E3"/>
        </g>
        <g filter="url(#filter1_d_1222_11096)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M146 84C157.046 84 166 75.0457 166 64C166 52.9543 157.046 44 146 44C134.954 44 126 52.9543 126 64C126 75.0457 134.954 84 146 84Z" fill="#008058"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M146 82.2456C156.077 82.2456 164.246 74.0768 164.246 64C164.246 53.9232 156.077 45.7544 146 45.7544C135.923 45.7544 127.754 53.9232 127.754 64C127.754 74.0768 135.923 82.2456 146 82.2456ZM166 64C166 75.0457 157.046 84 146 84C134.954 84 126 75.0457 126 64C126 52.9543 134.954 44 146 44C157.046 44 166 52.9543 166 64Z" fill="#B3D9CD"/>
        <path d="M144.906 69.4093C145.803 70.3711 145.853 71.7543 144.891 72.6511C144.109 73.3801 143.151 73.5803 142.286 73.0154C142.088 72.8856 141.824 72.6204 141.656 72.4405L135.403 65.5139C134.506 64.5522 134.442 63.1538 135.404 62.257C136.366 61.3602 137.756 61.5211 138.653 62.4828L144.906 69.4093Z" fill="white"/>
        <path d="M145.431 72.6782C144.551 73.6554 143.177 73.8252 142.2 72.9453C141.223 72.0654 141.248 70.6815 142.128 69.7043L153.957 56.8807C154.837 55.9035 156.224 55.7184 157.201 56.5983C158.179 57.4782 158.14 58.8774 157.26 59.8547L145.431 72.6782Z" fill="white"/>
        </g>
        <defs>
        <filter id="filter0_d_1222_11096" x="47.5" y="45" width="103" height="112" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="-1" dy="1"/>
        <feGaussianBlur stdDeviation="1"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.121569 0 0 0 0 0.160784 0 0 0 0 0.239216 0 0 0 0.16 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1222_11096"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1222_11096" result="shape"/>
        </filter>
        <filter id="filter1_d_1222_11096" x="124.105" y="43.3684" width="43.7895" height="43.7895" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="1.26316"/>
        <feGaussianBlur stdDeviation="0.947368"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1222_11096"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1222_11096" result="shape"/>
        </filter>
        </defs>
        </svg>
    `;

    var MODAL_CONFIG = {
        identifier: 'voos',
        title: 'Você sabia? Comprando uma passagem você acumula Pontos Azul!',
        description: 'Cada compra rende pontos para você usar em próximas viagens. Não perca essa chance de viajar mais e ganhar mais. Reserve já!',
        continueButtonText: 'Continuar e garantir pontos',
        giveUpButtonText: 'Desistir mesmo assim',
        icon: iconCoin,
    };

    function initAbandonmentModal() {
        console.log('[AT] Injecting booking flow abandonment modal - Busca.');

        addListenerToGoHomeButton();
        resetInactivityTimer();
        listenersToResetInactivityTimer();
        observerHeaderChange();
        injectCustomStyle();
    }

    function getCurrentStep() {
        return document.querySelector(SELECTORS.activeBreadcrumb)
            ? document.querySelector(SELECTORS.activeBreadcrumb).ariaLabel || ''
            : '';
    }

    function addListenerToGoHomeButton() {
        var goHomeButton = document.querySelectorAll(SELECTORS.buttonGoHome);

        if (goHomeButton) {
            goHomeButton.forEach(function (button) {
                button.classList.add(BUTTON_GO_HOME_FLAG);

                button.addEventListener('click', function (event) {
                    if (event.isAbandonmentModalTriggered) {
                        console.log('[AT] User confirmed give up of booking flow. Redirecting to home page.');
                        return;
                    }

                    event.preventDefault();
                    console.log('[AT] User clicked go home button, showing booking flow abandonment modal.');
                    showModalAbandonment(false);
                });
            });
        }
    }

    function resetInactivityTimer() {
        clearTimeout(INACTIVITY_TIMEOUT);

        INACTIVITY_TIMEOUT = setTimeout(function () {
            console.log('[AT] User is inactive, showing booking flow abandonment modal.');
            showModalAbandonment();
        }, MAXIMUM_INACTIVITY_TIME);
    }

    function listenersToResetInactivityTimer() {
        var listeners = ['keydown', 'click', 'scroll'];

        listeners.forEach(function (listener) {
            document.addEventListener(listener, function () {
                resetInactivityTimer();
            });
        });
    }

    function showModalAbandonment(isTriggeredByInactivity) {
        if (isTriggeredByInactivity === undefined) {
            isTriggeredByInactivity = true;
        }

        if (checkIfModalIsOpen()) {
            console.log('[AT] Modal is already open.');
            return;
        }

        var currentStep = getCurrentStep();

        if (currentStep !== EXPECTED_STEP) {
            if (!isTriggeredByInactivity) {
                var buttonGoHome = document.querySelectorAll(SELECTORS.buttonGoHome);
                var targetButton = buttonGoHome[1] || buttonGoHome[0];
                if (targetButton) {
                    targetButton.dispatchEvent(eventForGiveupModalWhenTriggeredByRedirect);
                }
            }
            return;
        }

        var modalToShow = checkWichModalShowOnFlightsPage();

        if (modalToShow === 'defaultModal') {
            appendDefaultModal(isTriggeredByInactivity, MODAL_CONFIG);
        } else {
            appendLargeModal(isTriggeredByInactivity);
        }
    }

    function checkWichModalShowOnFlightsPage() {
        var orderedLabels = document.querySelectorAll(SELECTORS.labelOrderTariffsOnFlightsStep);
        var orderedLabelsArray = Array.from(orderedLabels).map(function (label) {
            return label.textContent;
        });

        if (orderedLabelsArray.indexOf('Selecione') >= 0) {
            return 'orderModal';
        }

        return 'defaultModal';
    }

    function observerHeaderChange() {
        var mainElement = document.querySelector('main');

        if (!mainElement) {
            console.log('[AT] Main element not found.');
            return;
        }

        var observerHeader = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length > 0 || mutations[i].removedNodes.length > 0) {
                    var buttonGoHome = document.querySelector(SELECTORS.buttonGoHome);

                    if (buttonGoHome && !buttonGoHome.classList.contains(BUTTON_GO_HOME_FLAG)) {
                        addListenerToGoHomeButton();
                    }
                }
            }
        });

        observerHeader.observe(mainElement, { childList: true });
    }

    function appendDefaultModal(isTriggeredByInactivity, modalConfig) {
        if (!modalConfig) {
            console.log('[AT] Modal config not found.');
            return;
        }

        console.log('[AT] Appending default modal.');

        removeModal();

        var labelTypeModal = getLabelAnalytics(isTriggeredByInactivity, modalConfig);
        analyticsEvent(labelTypeModal);

        var defaultModal = document.createElement('div');
        defaultModal.classList.add('abandonmentModalInject');

        defaultModal.appendChild(getHtmlForDefaultModal(true));

        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_icon]', modalConfig.icon);
        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_title]', modalConfig.title);
        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_description]', modalConfig.description);
        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_continueButtonText]', modalConfig.continueButtonText);

        if (isTriggeredByInactivity) {
            defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_giveUpButtonText]', 'Voltar');
        } else {
            defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_giveUpButtonText]', modalConfig.giveUpButtonText);
        }

        var freezeTariffButtonExists = checkIfFreezeTariffButtonExists();

        if (freezeTariffButtonExists) {
            defaultModal.querySelector('.abandonmentModal__freezeTariff__button').addEventListener('click', function () {
                analyticsEvent(labelTypeModal + ' - Congelar tarifa');
                var freezeTariffButton = document.querySelector(SELECTORS.freezeTariffButton);
                if (freezeTariffButton) {
                    freezeTariffButton.click();
                }
                removeModal();
            });
        } else {
            defaultModal.querySelector('.abandonmentModal__freezeTariffWrapper').remove();
        }

        defaultModal.querySelector('.abandonmentModal__button--continue').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Continuar');
            removeModal();
        });

        defaultModal.querySelector('.abandonmentModal__button--giveup').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Desistir');

            if (!isTriggeredByInactivity) {
                var buttonGoHome = document.querySelectorAll(SELECTORS.buttonGoHome);
                var targetButton = buttonGoHome[1] || buttonGoHome[0];
                if (targetButton) {
                    targetButton.dispatchEvent(eventForGiveupModalWhenTriggeredByRedirect);
                }
                return;
            }

            removeModal();
        });

        document.body.appendChild(defaultModal);
    }

    function appendLargeModal(isTriggeredByInactivity) {
        removeModal();

        var labelTypeModal = 'Modal ordenador por redirecionamento - voos';

        if (isTriggeredByInactivity) {
            labelTypeModal = 'Modal ordenador por inatividade - voos';
        }

        analyticsEvent(labelTypeModal);

        console.log('[AT] Appending large modal.');

        var largeModal = document.createElement('div');
        largeModal.classList.add('abandonmentModalInject');

        var giveUpText = isTriggeredByInactivity ? 'Voltar' : 'Desistir mesmo assim';

        var largeModalHtml = '<div class="abandonmentModal__modal abandonmentModal__modal--large">'
            + '<h3 class="abandonmentModal__title">Em dúvida sobre o voo ideal?</h3>'
            + '<p class="abandonmentModal__subtitle">Não se preocupe, criamos duas ordenações que podem te ajudar a escolher a melhor opção. Clique na que faz mais sentido para você.</p>'
            + '<div class="abandonmentModal__actionButtons">'
            + '<button class="abandonmentModal__actionButtons__button abandonmentModal__actionButtons__button--primary">'
            + '<span class="abandonmentModal__actionButtons__button__icon">'
            + '<img src="https://i.imgur.com/pyuAMS7.png" alt="Voos mais baratos" width="44" height="46" />'
            + '</span>'
            + '<span class="abandonmentModal__actionButtons__button__title">Voos mais baratos</span>'
            + '<span class="abandonmentModal__actionButtons__button__description">Lista de voo que cabem no seu bolso</span>'
            + '</button>'
            + '<button class="abandonmentModal__actionButtons__button abandonmentModal__actionButtons__button--secondary">'
            + '<span class="abandonmentModal__actionButtons__button__icon">'
            + '<img src="https://i.imgur.com/w2ZZr10.png" alt="Voos mais rapidos" width="48" height="49" />'
            + '</span>'
            + '<span class="abandonmentModal__actionButtons__button__title">Voos mais rápidos</span>'
            + '<span class="abandonmentModal__actionButtons__button__description">Lista dos voos mais rápidos de chegar ao seu destino</span>'
            + '</button>'
            + '</div>'
            + '<div class="abandonmentModal__buttons">'
            + '<button class="abandonmentModal__button abandonmentModal__button--continue">Ver sugestões</button>'
            + '<button class="abandonmentModal__button abandonmentModal__button--giveup">' + giveUpText + '</button>'
            + '</div>'
            + '</div>';

        largeModal.innerHTML = largeModalHtml;

        // ADDING LISTENERS
        largeModal.querySelector('.abandonmentModal__actionButtons__button--primary').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Mais barato');
            orderFlights();
            removeModal();
        });

        largeModal.querySelector('.abandonmentModal__actionButtons__button--secondary').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Mais rápido');
            orderFlights('Mais rápido');
            removeModal();
        });

        largeModal.querySelector('.abandonmentModal__button--continue').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Continuar - Mais barato');
            orderFlights();
            removeModal();
        });

        largeModal.querySelector('.abandonmentModal__button--giveup').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Desistir');

            if (!isTriggeredByInactivity) {
                var buttonGoHome = document.querySelectorAll(SELECTORS.buttonGoHome);
                var targetButton = buttonGoHome[1] || buttonGoHome[0];
                if (targetButton) {
                    targetButton.dispatchEvent(eventForGiveupModalWhenTriggeredByRedirect);
                }
            }

            removeModal();
        });

        document.body.appendChild(largeModal);
    }

    function orderFlights(label) {
        if (!label) {
            label = 'Menor preço';
        }

        var ALL_OPTIONS = [
            'Mais cedo',
            'Menor preço',
            'Maior preço',
            'Mais rápido',
            'Mais tarde',
            'Voo direto',
            'Duração',
        ];

        var KEY_STEPS = {
            'Mais cedo': 0,
            'Menor preço': 1,
            'Maior preço': 2,
            'Mais rápido': 3,
            'Mais tarde': 4,
            'Voo direto': 5,
            'Duração': 6,
        };

        function simulateKey(el, key) {
            var code = key === 'Enter' ? 13 : 40;
            el.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: key,
                    code: key,
                    keyCode: code,
                    which: code,
                    bubbles: true,
                    cancelable: true,
                })
            );
        }

        function applyFilter(wrapper, filterLabel, useSteps) {
            var input = wrapper.querySelector(SELECTORS.inputOrderTariffsOnFlightsStep);
            if (!input) return;
            input.focus();
            simulateKey(input, 'ArrowDown');

            setTimeout(function () {
                if (useSteps) {
                    var steps = KEY_STEPS[filterLabel] || 0;
                    for (var i = 0; i < steps; i++) simulateKey(input, 'ArrowDown');
                } else {
                    var currentEl = wrapper.querySelector('.css-pdoeiw-singleValue');
                    var current = currentEl ? currentEl.textContent.trim() : '';
                    var curIdx = ALL_OPTIONS.indexOf(current);
                    var tgtIdx = ALL_OPTIONS.indexOf(filterLabel);
                    var delta = tgtIdx - (curIdx >= 0 ? curIdx : -1);
                    var dir = delta > 0 ? 'ArrowDown' : 'ArrowUp';
                    for (var j = 0; j < Math.abs(delta); j++) simulateKey(input, dir);
                }

                simulateKey(input, 'Enter');

                var bar = wrapper.querySelector('.azul-sort-button-bar');
                if (bar) {
                    bar.querySelectorAll('.azul-sort-btn').forEach(function (b) {
                        b.classList.remove('active');
                    });
                    var btn = Array.from(bar.children).find(function (b) {
                        return b.textContent === filterLabel;
                    });
                    if (btn) btn.classList.add('active');
                }
            }, 150);
        }

        var inputsOrder = document.querySelector(SELECTORS.wrapperOrderTariffsOnFlightsStep);
        var labelEl = inputsOrder.querySelector(SELECTORS.labelOrderTariffsOnFlightsStep);
        var currentLabel = labelEl ? labelEl.textContent.trim() : '';
        var useSteps = currentLabel === 'Selecione';

        applyFilter(inputsOrder, label, useSteps);
    }

    function getHtmlForDefaultModal(showFreezeWrapper) {
        var modal = document.createElement('div');
        modal.classList.add('abandonmentModal__modal');

        modal.innerHTML = '<div class="abandonmentModal__icon">[replace_icon]</div>'
            + '<h3 class="abandonmentModal__title">[replace_title]</h3>'
            + '<p class="abandonmentModal__subtitle">[replace_description]</p>'
            + '<div class="abandonmentModal__buttons">'
            + '<button class="abandonmentModal__button abandonmentModal__button--continue">[replace_continueButtonText]</button>'
            + '<button class="abandonmentModal__button abandonmentModal__button--giveup">[replace_giveUpButtonText]</button>'
            + '</div>'
            + '<div class="abandonmentModal__freezeTariffWrapper">'
            + '<div class="abandonmentModal__freezeTariff__text">'
            + '<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 4.9297V3.25H10V4.9297H15ZM18.3594 8.60157C19.453 9.98176 20 11.5312 20 13.25C20 15.3073 19.2708 17.0716 17.8125 18.543C16.3542 20.0143 14.5833 20.75 12.5 20.75C10.4167 20.75 8.6458 20.0143 7.1875 18.543C5.7292 17.0715 5 15.3072 5 13.2499C5 11.1926 5.7292 9.42832 7.1875 7.95692C8.6458 6.48552 10.4167 5.75002 12.5 5.75002C14.1927 5.75002 15.7552 6.30992 17.1875 7.42972L18.3594 6.21872C18.776 6.55732 19.1667 6.94792 19.5312 7.39062L18.3594 8.60157ZM16.621 17.3906C15.4883 18.5364 14.1146 19.1093 12.5 19.1093C10.8854 19.1093 9.51166 18.5364 8.37886 17.3906C7.24606 16.2448 6.67966 14.8646 6.67966 13.2499C6.67966 11.6354 7.24596 10.2617 8.37896 9.12888C9.51166 7.99608 10.8854 7.42968 12.5 7.42968C14.1146 7.42968 15.4883 7.99608 16.6211 9.12888C17.7539 10.2617 18.3203 11.6354 18.3203 13.25C18.3203 14.8646 17.754 16.2448 16.621 17.3906ZM11.6797 14.1093V9.1093H13.3203V14.1093H11.6797Z" fill="#026CB6" /></svg>'
            + '<span>Precisa de mais tempo?</span>'
            + '</div>'
            + '<button class="abandonmentModal__freezeTariff__button">Congelar Tarifa</button>'
            + '</div>';

        if (!showFreezeWrapper) {
            modal.querySelector('.abandonmentModal__freezeTariffWrapper').remove();
        }

        return modal;
    }

    function getLabelAnalytics(isTriggeredByInactivity, modalConfig) {
        var labelTypeModal = 'Modal por redirecionamento - ' + modalConfig.identifier;

        if (isTriggeredByInactivity) {
            labelTypeModal = 'Modal por inatividade - ' + modalConfig.identifier;
        }

        return labelTypeModal;
    }

    function checkIfFreezeTariffButtonExists() {
        return !!document.querySelector(SELECTORS.freezeTariffButton);
    }

    function checkIfModalIsOpen() {
        return !!document.querySelector('.abandonmentModalInject');
    }

    function removeModal() {
        var abandonmentModal = document.querySelector('.abandonmentModalInject');

        if (abandonmentModal) {
            abandonmentModal.remove();
        }
    }

    function injectCustomStyle() {
        if (document.getElementById('abandonmentModalStyle-busca')) return;

        var style = document.createElement('style');
        style.id = 'abandonmentModalStyle-busca';

        style.innerHTML = '.abandonmentModalInject {'
            + 'align-items: center;'
            + 'background: rgba(0, 0, 0, 0.5);'
            + 'display: flex;'
            + 'justify-content: center;'
            + 'inset: 0px;'
            + 'position: fixed;'
            + 'z-index: 1089;'
            + 'gap: 20px;'
            + '}'
            + '.abandonmentModal__modal {'
            + 'background-color: #FFFFFF;'
            + 'padding: 24px;'
            + 'border-radius: 8px;'
            + 'width: 384px;'
            + 'display: flex;'
            + 'flex-direction: column;'
            + 'align-items: center;'
            + 'gap: 24px;'
            + 'box-sizing: border-box;'
            + '}'
            + '.abandonmentModal__modal.abandonmentModal__modal--large {'
            + 'width: 512px;'
            + '}'
            + '.abandonmentModal__icon {'
            + 'height: 200px;'
            + 'width: 200px;'
            + '}'
            + '.abandonmentModal__title {'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + 'font-weight: 400;'
            + 'font-size: 24px;'
            + 'line-height: 100%;'
            + 'letter-spacing: 0px;'
            + 'text-align: center;'
            + 'vertical-align: middle;'
            + 'color: #026CB6;'
            + 'margin: 0px;'
            + '}'
            + '.abandonmentModal__subtitle {'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + 'font-weight: 400;'
            + 'font-size: 16px;'
            + 'line-height: 100%;'
            + 'letter-spacing: 0px;'
            + 'text-align: center;'
            + 'vertical-align: middle;'
            + 'color: #606060;'
            + 'margin: 0px;'
            + '}'
            + '.abandonmentModal__buttons {'
            + 'width: 100%;'
            + '}'
            + '.abandonmentModal__button {'
            + 'width: 100%;'
            + 'min-height: 48px;'
            + 'text-align: center;'
            + 'padding: 12px 16px;'
            + 'border: none;'
            + 'border-radius: 8px;'
            + 'cursor: pointer;'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + 'font-weight: 400;'
            + 'font-size: 16px;'
            + 'line-height: 24px;'
            + '}'
            + '.abandonmentModal__button--continue {'
            + 'background-color: #026CB6;'
            + 'color: #FFFFFF;'
            + '}'
            + '.abandonmentModal__button--giveup {'
            + 'background-color: transparent;'
            + 'color: #026CB6;'
            + 'margin-top: 8px;'
            + '}'
            + '.abandonmentModal__freezeTariffWrapper {'
            + 'display: flex;'
            + 'gap: 16px;'
            + 'justify-content: center;'
            + 'align-items: center;'
            + '}'
            + '.abandonmentModal__freezeTariff__text {'
            + 'display: flex;'
            + 'align-items: center;'
            + 'gap: 4px;'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + 'font-weight: 700;'
            + 'font-size: 12px;'
            + 'line-height: 16px;'
            + 'text-align: center;'
            + 'vertical-align: middle;'
            + 'color: #026CB6;'
            + '}'
            + '.abandonmentModal__freezeTariff__button {'
            + 'background-color: transparent;'
            + 'cursor: pointer;'
            + 'border: solid 1px #026CB6;'
            + 'padding: 6px 11px;'
            + 'border-radius: 4px;'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + 'font-weight: 400;'
            + 'font-size: 12px;'
            + 'line-height: 20px;'
            + 'text-align: center;'
            + 'vertical-align: middle;'
            + 'color: #026CB6;'
            + '}'
            + '.abandonmentModal__actionButtons {'
            + 'display: flex;'
            + 'gap: 24px;'
            + 'align-items: center;'
            + 'justify-content: space-between;'
            + 'margin-top: 24px;'
            + 'width: 100%;'
            + '}'
            + '.abandonmentModal__actionButtons__button {'
            + 'cursor: pointer;'
            + 'display: flex;'
            + 'flex-direction: column;'
            + 'align-items: flex-start;'
            + 'gap: 16px;'
            + 'width: 220px;'
            + 'padding: 24px;'
            + 'position: relative;'
            + 'border-width: 2px;'
            + 'border-style: solid;'
            + 'border-radius: 8px;'
            + 'text-align: left;'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + '}'
            + '.abandonmentModal__actionButtons__button.abandonmentModal__actionButtons__button--primary {'
            + 'background: radial-gradient(74.06% 85.84% at 25% 14.16%, #2797E6 0%, #0A436A 100%);'
            + 'box-shadow: 0px 1px 4px 0px #041E4229;'
            + 'border: 2px solid var(--secundary-blue-700, #13B5EA);'
            + 'color: #FFFFFF;'
            + '}'
            + '.abandonmentModal__actionButtons__button.abandonmentModal__actionButtons__button--secondary {'
            + 'background-color: transparent;'
            + 'border: 2px solid #909090;'
            + 'color: #909090;'
            + '}'
            + '.abandonmentModal__actionButtons__button__icon {'
            + 'position: absolute;'
            + 'top: -24px;'
            + 'left: 17px;'
            + '}'
            + '.abandonmentModal__actionButtons__button__title {'
            + 'font-weight: 500;'
            + 'font-size: 24px;'
            + 'line-height: 27px;'
            + 'letter-spacing: -0.2px;'
            + 'vertical-align: middle;'
            + '}'
            + '.abandonmentModal__actionButtons__button__description {'
            + 'font-family: "Helvetica Neue", Arial, sans-serif;'
            + 'font-weight: 400;'
            + 'font-size: 12px;'
            + 'line-height: 130%;'
            + 'letter-spacing: 0;'
            + 'vertical-align: middle;'
            + '}';

        document.head.appendChild(style);
    }

    function analyticsEvent(label) {
        if (label === undefined || !label) {
            console.log('[AT] Missing parameters for analytics event.');
            return;
        }

        var labelEvent = 'AT_modal_abandono ' + label;

        console.log('[AT] Analytics event triggered:', labelEvent);

        (function () {
            var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
            if (!s || typeof s.tl !== 'function') return;

            s.linkTrackVars = 'events,eVar82';
            s.linkTrackEvents = 'event90';
            s.events = 'event90';
            s.eVar82 = labelEvent;

            s.tl(true, 'o', 'target_activity_action');
        })();
    }

    if (window.abandonmentModalBuscaInjected) {
        console.log('[AT] Abandonment modal Busca already injected.');
        return;
    }

    var isReady = document.readyState === 'complete' || document.readyState === 'interactive';

    if (isReady) {
        initAbandonmentModal();
    } else {
        document.addEventListener('DOMContentLoaded', initAbandonmentModal);
    }

    window.abandonmentModalBuscaInjected = true;
})();
