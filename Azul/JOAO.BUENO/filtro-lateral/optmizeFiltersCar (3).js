(function() {
    const checkIfDomReady = () => {
        const isCarPage = window.location.pathname.includes("/cars");

        if(!isCarPage) {
            console.log("[AT] Page is not a car page, skipping filters optimization.");
            return;
        }

        const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        if(deviceWidth < 1024) {
            console.log("[AT] Device width is less than 1024px, skipping filters optimization.");
            return;
        }

        const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

        if (isReady) {
            checkIfContentIsRendered();
        } else {
            document.addEventListener('DOMContentLoaded', checkIfContentIsRendered);
        }
    }

    const getLoadingWrapper = () => {
        return document.querySelector(".styles__LoadingWrapper-sc-fdgbpv-4");
    }

    const checkIfContentIsRendered = () => {
        const loadingWrapper = getLoadingWrapper();

        if(loadingWrapper) {
            console.log("[AT] Loading wrapper found, waiting for content to render.");
            requestAnimationFrame(checkIfContentIsRendered);
            return;
        }

        initilizeFiltersOptimization();
    }

    const initilizeFiltersOptimization = () => {
        const originalContentWrapper = document.querySelector(".styles__CarsSearchLayoutWrapper-sc-fdgbpv-0");

        if (!originalContentWrapper) {
            console.log("[AT] Original content wrapper not found: .styles__CarsSearchLayoutWrapper-sc-fdgbpv-0");
            return;
        }

        const emptyResultsElement = document.querySelector(".styles__EmptyContainer-sc-12qcli5-0");

        if(!emptyResultsElement) {
            reorganizeClasses();
        }
        
        changeLayoutToLoadingOrError();
        changeLayoutToLoadingWrapper();
        injectCustomStyles();

        function reorganizeClasses() {
            originalContentWrapper.classList.add("inject-main-wrapper");
            originalContentWrapper.classList.remove("inject-main-wrapper--on-error");

            const filtersElement = originalContentWrapper.querySelector(".styles__FormWrapper-sc-1tdz22p-0");
            filtersElement?.classList.add("inject-filters-element");

            const resultsElement = originalContentWrapper.querySelector(".styles__ContentWrapper-sc-fdgbpv-2");
            resultsElement?.classList.add("inject-results-element");

            const infoElement = originalContentWrapper.querySelector("div");
            infoElement?.classList.add("inject-info-element");

            changeHandlersForFilterCarousel();
        }

        function reorganizeErrorClasses() {
            originalContentWrapper.classList.add("inject-main-wrapper--on-error");
        }

        function changeLayoutToLoadingOrError() {
            const resultsLoadingWrapper = document.querySelector(".styles__Container-sc-kv8lfe-0");

            if(!resultsLoadingWrapper) {
                requestAnimationFrame(changeLayoutToLoadingOrError);
                console.log("[AT] Results loading wrapper not found, waiting for it to appear.");
                return;
            }

            const loadingObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if(mutation.removedNodes.length > 0 || mutation.addedNodes.length > 0) {
                        const hasError = resultsLoadingWrapper.querySelector(".styles__ContainerError-sc-kv8lfe-1");

                        if(hasError) {
                            console.log("[AT] Error detected in results loading wrapper, skipping filters optimization.");
                            originalContentWrapper.classList.remove("inject-main-wrapper");
                            reorganizeErrorClasses();
                            return;
                        }

                        const loadingWrapper = getLoadingWrapper();
                        
                        if (loadingWrapper) {
                            console.log("[AT] Loading wrapper detected, after content changes applying loading classes.");
                            return;
                        }

                        reorganizeClasses();
                        console.log("[AT] New content rendered, filters optimization applied.");
                    }
                });
            });

            loadingObserver.observe(resultsLoadingWrapper, {
                childList: true,
                subtree: true
            });
        }

        function changeLayoutToLoadingWrapper() {
            const loadingObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if(mutation.removedNodes.length > 0 || mutation.addedNodes.length > 0) {
                        const loadingWrapper = getLoadingWrapper();
                        
                        if (loadingWrapper) {
                            console.log("[AT] Loading wrapper detected, after content changes applying loading classes.");
                            return;
                        }

                        const emptyResultsElement = document.querySelector(".styles__EmptyContainer-sc-12qcli5-0");

                        if (emptyResultsElement) {
                            originalContentWrapper.classList.remove("inject-main-wrapper");
                            return;
                        }

                        const hasError = originalContentWrapper.querySelector(".styles__ContainerError-sc-kv8lfe-1");

                        if(hasError) {
                            console.log("[AT] Error detected in results loading wrapper, skipping filters optimization.");
                            originalContentWrapper.classList.remove("inject-main-wrapper");
                            reorganizeErrorClasses();
                            return;
                        }

                        // Reorganize classes again after content changes
                        reorganizeClasses();
                    }
                });
            });

            loadingObserver.observe(originalContentWrapper, {
                childList: true,
                subtree: true
            });
        }

        function changeHandlersForFilterCarousel() {
            const nextArrow = document.querySelector(".styles__Arrow-sc-3qprdy-2.ekfkGu.arrow-button");
            const prevArrow = document.querySelector(".styles__Arrow-sc-3qprdy-2.duXrFA.arrow-button");

            prevArrow?.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                handleScrollCarousel(event, "prev");
            });

            nextArrow?.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                handleScrollCarousel(event, "next");
            });
        }

        function handleScrollCarousel(event, direction) {
            const gap = 12;
            const carouselWrapper = document.querySelector(".styles__Carousel-sc-3qprdy-1");
            const carouselItems = carouselWrapper?.childNodes;

            if (!carouselWrapper || !carouselItems) {
                console.log("[AT] Carousel wrapper or items not found.");
                return;
            }

            const itemWidth = carouselItems[0].offsetWidth + gap;
            const currentScrollLeft = carouselWrapper.scrollLeft;
            const scrollAmount = direction === "next" ? itemWidth : -itemWidth;
            const newScrollLeft = currentScrollLeft + scrollAmount;

            carouselWrapper.scrollTo({
                left: newScrollLeft,
                behavior: "smooth"
            });
        }

        function injectCustomStyles() {
            const style = document.createElement("style");
            style.textContent = `
                .inject-main-wrapper {
                    display: grid;
                    grid-template-areas:
                        "infos infos"
                        "filter banner"
                        "filter results";
                    flex-wrap: wrap;
                    gap: 40px;
                    justify-content: center;
                }

                .inject-main-wrapper.inject-main-wrapper--on-error .inject-results-element {
                    padding: 0px 24px;
                }

                .inject-info-element {
                    grid-area: infos;
                    width: 100vw;
                }

                .inject-filters-element {
                    width: 300px;
                    grid-area: filter;
                    justify-self: flex-end;
                }

                .inject-main-wrapper .inject-results-element {
                    margin: unset;
                    padding: 0;
                }

                .inject-main-wrapper .styles__DynamicBannerWrapper-sc-fdgbpv-6 {
                    grid-area: banner;
                    margin: unset;
                    padding-left: 0;
                    padding-right: 0;
                }

                .inject-main-wrapper .inject-results-element .styles__CarsGroupWrapper-sc-fdgbpv-3 .styles__CarsGroupWrapper-sc-nnv2sb-0:first-child .drvwcB { 
                    padding: 0;
                }

                .inject-filters-element .styles__FormContent-sc-1tdz22p-1  {
                    width: 100%;
                    padding: 0;
                }

                .inject-filters-element .styles__DropdownFiltersWrapper-sc-s2m4a9-0 {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .inject-filters-element .styles__DropdownFiltersWrapper-sc-s2m4a9-0 > label {
                    font-size: 16px;
                }

                .inject-filters-element .styles__DropdownFiltersWrapper-sc-s2m4a9-0 .styles__DropdownContainer-sc-1jfkjjc-5 {
                    width: 100%;
                }

                .inject-filters-element .styles__DropdownFiltersWrapper-sc-s2m4a9-0 .styles__FilterNameWrapper-sc-1jfkjjc-3 {
                    flex: 1 1 0%;
                }

                .inject-filters-element .styles__OrderCancelationWrapper-sc-llht23-5 {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }

                .inject-filters-element .styles__OrderCancelationWrapper-sc-llht23-5 .styles__WrapperHelpersFilters-sc-hikw2z-0 {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .inject-filters-element .styles__OrderCancelationWrapper-sc-llht23-5 .styles__WrapperHelpersFilters-sc-hikw2z-0 .styles__Divider-sc-1ke4nno-5 {
                    display: none;
                }

                @media screen and (min-width: 1440px) {
                    .css-n5cxq4,
                    .styles__ContentWrapper-sc-itp8cy-3 {
                        width: 1324px;
                        padding-left: 0;
                        padding-right: 0;    
                    }

                    .inject-main-wrapper .inject-results-element {
                        width: 984px;
                    }
                }


                @media screen and (max-width: 1439px) {
                    .inject-main-wrapper .styles__DynamicBannerWrapper-sc-fdgbpv-6,
                    .inject-main-wrapper .inject-results-element {
                        width: 624px;
                    }

                    .inject-main-wrapper .inject-results-element .styles__ContentWrapper-sc-nnv2sb-1 {
                        width: 100%;
                    }

                    .inject-main-wrapper .inject-results-element  .styles__Container-sc-ccr6q9-0 {
                        width: 100%;
                        height: auto;
                        min-height: 320px;
                        align-items: center;
                    }

                    .inject-main-wrapper .inject-results-element .styles__ContainerImage-sc-ccr6q9-1 {
                        height: auto;
                    }

                    .inject-main-wrapper .inject-results-element .styles__ContainerDetails-sc-ccr6q9-3 {
                        width: 300px;
                        padding-left: 0;
                    }

                    .inject-main-wrapper .inject-results-element .styles__ContainerSubtitle-sc-ccr6q9-6 {
                        flex-wrap: wrap;
                    }

                    .inject-main-wrapper .inject-results-element .styles__SubtitleWrapper-sc-ccr6q9-7 {
                        margin-left: 0;
                    }

                    .inject-main-wrapper .inject-results-element .styles__AmenitiesWrapper-sc-ccr6q9-11 {
                        flex-wrap: wrap;
                        display: flex;
                    }

                    .inject-main-wrapper .inject-results-element .styles__PriceWrapper-sc-10ygdxz-0 {
                        align-self: flex-start;
                    }

                    .inject-main-wrapper .inject-results-element .styles__AccrualInfo-sc-10ygdxz-6  {
                        align-items: flex-start;
                        gap: 1px;
                    }

                    .inject-main-wrapper .inject-results-element .styles__BackgroundAccrual-sc-10ygdxz-2  {
                       height: 108px;
                    }

                    .inject-main-wrapper .inject-results-element .styles__PriceContentWrapper-sc-10ygdxz-9 {
                        margin-top: 25px;
                        margin-bottom: 15px;
                    }
                }
            `;

            document.head.appendChild(style);
        }
    }

    checkIfDomReady();
})();