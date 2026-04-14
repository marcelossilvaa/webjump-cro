(function() {
    const experienceName = "AT_EXPERIENCE_CHECKOUT_BREADCRUMB";
    const experienceAlreadyExecuted = window[experienceName] || false;

    const onExperienceTargetPage = () => {
        const currentUrl = window.location.pathname;
        const targetTestUrl = "/selecao-voo";

        return currentUrl.includes(targetTestUrl);
    }

    const initExperienceWhenReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const isDesktopDevice = deviceWidth >= 1024;

        if(!isDesktopDevice) {
            console.log("[AT] Device is not desktop. Experience will not be executed.");
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

    var maximumRetries = 100;
    var retryCount = 0;
    function experienceSetup() {
        const SELECTORS = {
            currentBreadcrumbNav: "#hotel-recommendation",
        };
        
        const currentBreadcrumbAlreadyOnDom = document.querySelector(SELECTORS.currentBreadcrumbNav);

        if(!currentBreadcrumbAlreadyOnDom && retryCount < maximumRetries) {
            console.log("[AT] Current breadcrumb navigation element not found on initial load. Waiting for it to be available in the DOM if maximum retries not reached.");
            retryCount++;
            requestAnimationFrame(experienceSetup);
            return;
        }

        init();
        
        function init() {
            analyticsEvent("init");
            console.log("[AT] Experience started:", experienceName);

            injectCustomBreadcrumb();
            listenToUrlChanges();
            injectCustomCSS();
        }

        function injectCustomBreadcrumb() {
            const customBreadcrumbAlreadyExists = document.querySelector(".injectedBreadcrumb");

            if (customBreadcrumbAlreadyExists) {
                console.log("[AT] Custom breadcrumb already exists. Skipping injection.");
                updateActiveBreadcrumb();
                return;
            }

            const currentBreadcrumbNav = document.querySelector(SELECTORS.currentBreadcrumbNav);

            if (!currentBreadcrumbNav) {
                console.log("[AT] Current breadcrumb navigation element not found.");
                return;
            }

            const currentBreadcrumb = currentBreadcrumbNav.parentElement;
            const customBreadcrumb = createBreadcrumbElement();

            currentBreadcrumb.style.display = "none";
            currentBreadcrumb.insertAdjacentElement("afterend", customBreadcrumb);

            updateActiveBreadcrumb();
            addTrackingToBreadcrumbItems();
        }

        function addTrackingToBreadcrumbItems() {
            const items = document.querySelectorAll(".injectedBreadcrumb__item");

            items.forEach(item => {
                const label = item.textContent.trim();

                item.addEventListener("mouseenter", () => {
                    analyticsEvent("breadcrumb_hover " + label);
                });

                item.addEventListener("click", () => {
                    analyticsEvent("breadcrumb_click " + label);
                });
            });
        }

        function updateActiveBreadcrumb() {
            console.log("[AT] Updating active breadcrumb based on URL.");

            const currentPath = window.location.pathname;
            const items = document.querySelectorAll(".injectedBreadcrumb__item");

            items.forEach(item => {
                const urls = (item.dataset.urls || "").split(",");
                const isActive = urls.some(url => currentPath.includes(url.trim()));
                item.classList.toggle("--active", isActive);
            });
        }

        function isOnBreadcrumbFlow() {
            const currentPath = window.location.pathname;
            const allUrls = [
                "selecao-voo",
                "passageiros",
                "responsavel",
                "review",
            ];

            return allUrls.some(url => currentPath.includes(url));
        }

        function checkIfCurrentBreadcrumbOnDom() {
            const currentBreadcrumbNav = document.querySelector(SELECTORS.currentBreadcrumbNav);
            return !!currentBreadcrumbNav;
        }

        function onUrlChange() {
            if (!isOnBreadcrumbFlow()) {
                window.removeEventListener("popstate", onUrlChange);
                window.removeEventListener("at:urlchange", onUrlChange);
                console.log("[AT] User left the breadcrumb flow. Skipping update.");
                return;
            }

            requestAnimationFrame(reinjectBreadcrumbIfMissing);
        }
        
        function reinjectBreadcrumbIfMissing() {
            if(!isOnBreadcrumbFlow()) {
                console.log("[AT] User left the breadcrumb flow during reinjection check. Skipping update.");
                return;
            }

            const currentBreadcrumbOnDom = checkIfCurrentBreadcrumbOnDom();
    
            if (!currentBreadcrumbOnDom) {
                console.log("[AT] Current breadcrumb navigation element not found on URL change. Waiting for it to be available in the DOM.");
                requestAnimationFrame(onUrlChange);
                return;
            }

            injectCustomBreadcrumb();
        }

        function listenToUrlChanges() {
            // Patch history.pushState e replaceState pois SPAs não disparam popstate neles
            const patchHistoryMethod = (methodName) => {
                const original = history[methodName];
                history[methodName] = function(...args) {
                    const result = original.apply(this, args);
                    window.dispatchEvent(new Event("at:urlchange"));
                    return result;
                };
            };

            if (!history._atPatched) {
                patchHistoryMethod("pushState");
                patchHistoryMethod("replaceState");
                history._atPatched = true;
            }

            window.addEventListener("popstate", onUrlChange);
            window.addEventListener("at:urlchange", onUrlChange);
        }

        function createBreadcrumbElement() {
            const breadcrumb = document.createElement("nav");
            breadcrumb.classList.add("injectedBreadcrumb");
            
            breadcrumb.innerHTML = `
                <ul class="injectedBreadcrumb__list">
                    <li class="injectedBreadcrumb__item" data-urls="selecao-voo">Seleção de Voos</li>
                    <li class="injectedBreadcrumb__item" data-urls="passageiros,responsavel">Resumo de Viajantes e Responsável</li>
                    <li class="injectedBreadcrumb__item" data-urls="review">Resumo da Compra</li>
                    <li class="injectedBreadcrumb__item" data-urls="payment, splash">Pagamento e Confirmação</li>
                </ul>

            `;

            return breadcrumb;
        }

        function injectCustomCSS() {
            const style = document.createElement("style");

            style.innerHTML = `
                .injectedBreadcrumb {
                    position: relative;
                    height: auto;
                    margin: 0px;
                    padding: 0px;
                    width: auto;
                    color: rgb(192, 192, 192);
                    z-index: 999;
                    font-family: "Helvetica Neue", Arial;
                }

                .injectedBreadcrumb .injectedBreadcrumb__list {
                    list-style: none;
                    display: flex;
                    gap: 4px;
                    padding: 0;
                    margin: 0;
                    line-height: 0px;
                    align-items: baseline;
                }

                .injectedBreadcrumb .injectedBreadcrumb__item:not(:last-child)::after {
                    content: url("https://www.voeazul.com.br/etc.clientlibs/azul/clientlibs/clientlib-react/resources/static/media/ChevronRight.770c060e.svg");
                    width: 16px;
                    height: 16px;
                }

                .injectedBreadcrumb .injectedBreadcrumb__list .injectedBreadcrumb__item {
                    line-height: normal;
                    display: flex;
                    align-items: anchor-center;
                    font-size: 14px;
                    gap: 4px;
                    cursor: default;
                }

                .injectedBreadcrumb .injectedBreadcrumb__list .injectedBreadcrumb__item.--active {
                    color: #FFFFFF;
                    font-weight: 700;
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