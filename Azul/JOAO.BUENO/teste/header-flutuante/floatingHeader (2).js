(function() {
    const SELECTORS = {
        header: 'header',
        offersWrapper: '.container-capsule.containerDefault',
    };

    const checkIfDomReady = () => {
        const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        if(deviceWidth > 767) {
            console.log("[AT] Device width is greater than 767px, skipping floating header.");
            return;
        }

        const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

        if (isReady) {
            checkIfWrapperExists();
        } else {
            document.addEventListener('DOMContentLoaded', checkIfWrapperExists);
        }
    }

    const checkIfWrapperExists = () => {
        const offersWrapper = document.querySelector(SELECTORS.offersWrapper);

        if (offersWrapper) {
            console.log("[AT] Offers wrapper exists, proceeding with floating header initialization.");
            initializeFloatingHeader();
        } else {
            console.warn("[AT] Waiting for offers wrapper to be available...");    
            requestAnimationFrame(checkIfWrapperExists);    
        }
    }

    const initializeFloatingHeader = () => {
        console.log("[AT] Initializing floating header...");

        removeDefaultWrapper();
        injectFloatingHeader();
        injectCustomStyles();

        function removeDefaultWrapper() {
            const offersWrapper = document.querySelector(SELECTORS.offersWrapper);
            const offersCardsWrapper = offersWrapper ? offersWrapper.children[5] : null;

            if (offersWrapper && offersCardsWrapper) {
                console.log("[AT] Removing default wrapper...");
                offersWrapper.removeChild(offersCardsWrapper);
            } else {
                console.warn("[AT] Default offers wrapper not found.");
            }
        }

        function injectFloatingHeader() {
            const svgContent = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 3.66675H3C2.72386 3.66675 2.5 3.8906 2.5 4.16675V12.8334C2.5 13.1095 2.72386 13.3334 3 13.3334H13C13.2761 13.3334 13.5 13.1095 13.5 12.8334V4.16675C13.5 3.8906 13.2761 3.66675 13 3.66675ZM3 3.16675C2.44771 3.16675 2 3.61446 2 4.16675V12.8334C2 13.3857 2.44771 13.8334 3 13.8334H13C13.5523 13.8334 14 13.3857 14 12.8334V4.16675C14 3.61446 13.5523 3.16675 13 3.16675H3ZM5.22645 11.3856L5.3806 10.8709L5.89005 9.16985H4.92573L4.64728 9.55725L4.52758 9.7238H4.32247H4.16667H3.64244L3.78086 9.21815L3.97942 8.49285L3.78086 7.76755L3.64244 7.26195H4.16667H4.32247H4.52758L4.64728 7.4285L4.92573 7.8159H5.89005L5.3806 6.11485L5.22645 5.6001H5.7638H6.04065H6.2673L6.3838 5.79455L7.5945 7.8159H8.90125C9.2848 7.8159 9.56665 8.1358 9.56665 8.49285C9.56665 8.85045 9.28455 9.16985 8.90125 9.16985H7.5945L6.3838 11.1912L6.2673 11.3856H6.04065H5.7638H5.22645ZM7.3678 8.76985H8.90125C9.04775 8.76985 9.16665 8.64575 9.16665 8.49285C9.16665 8.34025 9.04775 8.2159 8.90125 8.2159H7.3678L6.32205 6.4699L6.04065 6.0001H5.7638L5.8059 6.1407L5.8836 6.4001L5.9532 6.63255L6.3076 7.8159L6.4274 8.2159H6.0098H4.73304H4.72063L4.32247 7.66195H4.16667L4.19229 7.7555L4.27617 8.06195L4.37387 8.4188L4.39415 8.49285L4.37387 8.56695L4.27617 8.9238L4.19229 9.2302L4.16667 9.3238H4.32247L4.72063 8.76985H4.73304H6.0098H6.4274L6.3076 9.16985L5.9532 10.3531L5.8836 10.5856L5.8059 10.845L5.7638 10.9856H6.04065L6.32205 10.5158L7.3678 8.76985ZM11.3334 11.1667H10.6666V9.8334H11.3334V11.1667ZM10.6666 13.1667H11.3334V11.8334H10.6666V13.1667ZM11.3334 7.36075H10.6666V6.02745H11.3334V7.36075ZM10.6666 5.16675H11.3334V3.83341H10.6666V5.16675ZM11.3334 9.16675H10.6666V7.8334H11.3334V9.16675Z" fill="#0047B0"/>
                </svg>
            `;

            const floatingHeader = document.createElement("div");
            floatingHeader.className = "inject-floating-header";

            floatingHeader.innerHTML = `
                <ul class="floating-header__list">
                    <li class="floating-header__item">
                        <button data-anchor="#passagens" class="floating-header__link">
                            [svg_replacement]
                            <span class="floating-header__text">Passagens Aéreas</span>
                        </button>
                    </li>
                    <li class="floating-header__item">
                        <button data-anchor="#viagem" class="floating-header__link">
                            [svg_replacement]
                            <span class="floating-header__text">Viagens Completas</span>
                        </button>
                    </li>
                    <li class="floating-header__item">
                        <button data-anchor="#pontos" class="floating-header__link">
                            [svg_replacement]
                            <span class="floating-header__text">Pontos e Parceiros</span>
                        </button>
                    </li>
                </ul>
            `;

            floatingHeader.querySelectorAll(".floating-header__link").forEach(link => {
                link.innerHTML = link.innerHTML.replace("[svg_replacement]", svgContent);

                link.addEventListener("click", () => {
                    const anchor = document.querySelector(link.getAttribute("data-anchor"));

                    if (anchor) {
                        const anchorOffsetTop = anchor.offsetTop;
                        const headerHeight = 139;
                        const scrollPosition = anchorOffsetTop - headerHeight;

                        window.scrollTo({
                            top: scrollPosition,
                            behavior: "smooth"
                        });
                    }
                });
            });

            const header = document.querySelector(SELECTORS.header);

            if (header) {
                header.insertAdjacentElement("afterend", floatingHeader);
                console.log("[AT] Floating header injected successfully.");
            }
        }

        function injectCustomStyles() {
            const style = document.createElement("style");
            style.textContent = `
                body {
                    padding-top: 139px; /* Adjust padding to account for the floating header and default header height */
                }

                .inject-floating-header {
                    position: fixed;
                    left: 0;
                    top: 56px;
                    width: 100%;
                    background: rgb(4, 30, 66);
                    padding: 12px 16px;
                    display: flex;
                    height: 81px;
                    justify-content: center;
                    align-items: center;
                    align-content: center;
                    flex-shrink: 0;
                    align-self: stretch;
                    flex-wrap: wrap;
                    z-index: 1050;
                }

                .inject-floating-header .floating-header__list {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    gap: 8px;
                }

                .inject-floating-header .floating-header__icon {
                    width: 20px;
                    object-fit: scale-down;
                }

                .inject-floating-header .floating-header__link {
                    display: flex;   
                    flex-direction: column;
                    align-items: center;
                    text-decoration: none;
                    padding: 4px;
                    border-radius: 8px;
                    border: 1px solid #0047B0;
                    background: #FFF;
                    min-height: 48px;
                    justify-content: center;
                    gap: 4px;
                    width: 100%;
                }

                .inject-floating-header .floating-header__text {
                    color: #0047B0;
                    text-align: center;
                    font-family: "Helvetica Neue", Arial;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 400;
                }

                .inject-floating-header .floating-header__item {
                    flex-grow: 1;
                }
            `;

            document.head.appendChild(style);
        }
    }

    checkIfDomReady();
})();