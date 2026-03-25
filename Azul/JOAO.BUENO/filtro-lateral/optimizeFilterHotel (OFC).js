(function () {
  const checkIfDomReady = () => {
    const isHotelPage = window.location.pathname.includes("/hotel");

    if (!isHotelPage) {
      console.log(
        "[AT] Page is not a hotel page, skipping filters optimization."
      );
      return;
    }

    const deviceWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;

    if (deviceWidth < 1024) {
      console.log(
        "[AT] Device width is less than 1024px, skipping filters optimization."
      );
      return;
    }

    const isReady =
      document.readyState === "complete" ||
      document.readyState === "interactive";

    if (isReady) {
      checkIfContentIsRendered();
    } else {
      document.addEventListener("DOMContentLoaded", checkIfContentIsRendered);
    }
  };

  const getLoadingWrapper = () => {
    return document.querySelector(".styles__LoadingWrapper-sc-oxmbkx-2");
  };

  const checkIfContentIsRendered = () => {
    const loadingWrapper = getLoadingWrapper();

    if (loadingWrapper) {
      console.log("[AT] Loading wrapper found, waiting for content to render.");
      requestAnimationFrame(checkIfContentIsRendered);
      return;
    }

    initilizeFiltersOptimization();
  };

  const initilizeFiltersOptimization = () => {
    const originalContentWrapper = document.querySelector(
      ".styles__SearchListWrapper-sc-oxmbkx-8"
    );

    if (!originalContentWrapper) {
      console.log(
        "[AT] Original content wrapper not found: .styles__SearchListWrapper-sc-oxmbkx-8"
      );
      return;
    }

    const emptyResultsElement = document.querySelector(
      ".styles__EmptyContainer-sc-12qcli5-0"
    );

    if (emptyResultsElement) {
      reorganizeEmptyClasses();
    } else {
      reorganizeClasses();
    }

    changeLayoutToLoadingGrid();
    injectCustomStyles();

    function reorganizeClasses() {
      originalContentWrapper.classList.add("inject-main-grid-wrapper");
      originalContentWrapper.classList.remove(
        "inject-main-grid-wrapper--on-loading"
      );

      const filtersElement = originalContentWrapper.querySelector(
        ".styles__StyledFilterWrapper-sc-ulubtd-0"
      );
      filtersElement?.classList.add("inject-filters-element");

      const bannerElement = originalContentWrapper.querySelector(
        ".styles__DynamicBannerWrapper-sc-1u6m6gj-0"
      );
      bannerElement?.classList.add("inject-banner-element");

      if (!bannerElement) {
        originalContentWrapper.classList.add(
          "inject-main-grid-wrapper--no-banner"
        );
      }

      const resultsElement = originalContentWrapper.querySelector(
        ".styles__ListWrapper-sc-1oit4q5-6"
      );
      resultsElement?.classList.add("inject-results-element");

      const paginationElement = originalContentWrapper.querySelector(
        ".styles__PaginationWrapper-sc-oxmbkx-7"
      );
      paginationElement?.classList.add("inject-pagination-element");
    }

    function reorganizeLoadingClasses() {
      originalContentWrapper.classList.add(
        "inject-main-grid-wrapper--on-loading"
      );

      const loadingElement = originalContentWrapper.querySelector(
        ".styles__LoadingWrapper-sc-oxmbkx-2"
      );
      loadingElement?.classList.add("inject-loading-element");
    }

    function reorganizeEmptyClasses() {
      originalContentWrapper.classList.remove(
        "inject-main-grid-wrapper--on-loading"
      );
      originalContentWrapper.classList.remove("inject-main-grid-wrapper");
    }

    function changeLayoutToLoadingGrid() {
      const loadingObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.removedNodes.length > 0 ||
            mutation.addedNodes.length > 0
          ) {
            const loadingWrapper = getLoadingWrapper();

            if (loadingWrapper) {
              reorganizeLoadingClasses();
              return;
            }

            const emptyResultsElement = document.querySelector(
              ".styles__EmptyContainer-sc-12qcli5-0"
            );

            if (emptyResultsElement) {
              reorganizeEmptyClasses();
              return;
            }

            // Reorganize classes again after content changes
            reorganizeClasses();
          }
        });
      });

      loadingObserver.observe(originalContentWrapper, {
        childList: true,
        subtree: true,
      });
    }

    function injectCustomStyles() {
      const style = document.createElement("style");
      style.textContent = `
                @media screen and (min-width: 1440px) {
                    header .css-n5cxq4,
                    .styles__ContentWrapper-sc-itp8cy-3.dvnfst,
                    .styles__HotelSearchLayoutContainer-sc-oxmbkx-1.icdScl {
                        width: 1294px;
                    }
                }

                @media screen and (max-width: 1439px) {
                    .inject-results-element .styles__InfosWrapper-sc-1ft5opc-4 {
                        width: 345px;
                    }

                    .inject-results-element .styles__TagWrapper-sc-1ft5opc-9,
                    .inject-results-element .styles__AmenitiesWrapper-sc-sd58gz-0 {
                        flex-wrap: wrap;
                    }

                    .inject-results-element .styles__ContentPrice-sc-10ygdxz-1 {
                        width: 225px;
                    }

                    .inject-results-element .styles__WrapperSlidesDesktop-sc-1ft5opc-0 {
                        min-height: 276px;
                        height: auto;
                        max-height: unset;
                    }
                }

                .inject-main-grid-wrapper {
                    align-items: flex-start;
                    display: grid;
                    grid-template-columns: 230px calc(100% - 270px);
                    grid-template-areas:
                        "filter banner"
                        "filter results"
                        "filter pagination";
                    gap: 40px;
                }

                .inject-main-grid-wrapper.inject-main-grid-wrapper--on-loading {
                    grid-template-areas:
                        ". banner"
                        ". loading"
                        ". results"
                        ". pagination";
                }

                .inject-main-grid-wrapper.inject-main-grid-wrapper--no-banner {
                    grid-template-areas:
                        "filter results"
                        "filter pagination";
                }

                .inject-filters-element {
                    grid-area: filter;
                    grid-row: 1 / 4;
                }

                .inject-banner-element {
                    grid-area: banner;
                    margin-bottom: 0px;
                }

                .inject-results-element {
                    grid-area: results;
                }

                .inject-pagination-element {
                    grid-area: pagination;
                }

                .inject-loading-element {
                    grid-area: loading;
                }

                .inject-filters-element .styles__VisibleRow-sc-ulubtd-1 {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: flex-start;
                }

                .inject-filters-element .styles__VisibleRow-sc-ulubtd-1 > span {
                    font-size: 16px;
                }

                .inject-filters-element .styles__DropdownContainer-sc-1h37srh-13 {
                    width: 100%;
                }

                .inject-filters-element .styles__DropdownContainer-sc-1h37srh-13 > button {
                    width: 100%;
                    margin: 0px;
                }
            `;

      document.head.appendChild(style);
    }
  };

  checkIfDomReady();
})();
