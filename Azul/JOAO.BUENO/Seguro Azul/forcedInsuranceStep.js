(function () {
  let luggageStepContainer = "";
  let insuranceObserverIsConnected = false;

  const insuranceStepObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const targetMutation = mutation.target;
      const isMutationForLuggageContainer = targetMutation.classList.contains("LuggageAdderContainer");
      const isMutationForTicketsTabs = targetMutation.classList.contains("react-tabs__tab-panel");
      const luggageAdderElement = luggageStepContainer.querySelector(".LuggageAdderContainer");
      
      if (isMutationForLuggageContainer) {
        modifyLuggageContainer(luggageAdderElement);
        injectCustomInsuranceStepButton(luggageAdderElement);
      }

      if (isMutationForLuggageContainer || isMutationForTicketsTabs) {
        const ticketsList = luggageStepContainer.querySelector(".css-1bp6j6a > .react-tabs__tab-list");

        if(ticketsList) {
          const ticketsLength = ticketsList.children?.length;
          const lastTicket = ticketsList.lastElementChild;
  
          if (ticketsLength < 1 || lastTicket?.classList.contains("react-tabs__tab--selected")) {
            toggleButtonNextStepInsurance(true);
          } else {
            toggleButtonNextStepInsurance(false);
          }
        }
      }
    } 
  });

  /**
   * Modifies the LuggageAdderContainer element to hide the insurance container,
   * and marks the container as already processed to prevent repeated modifications.
   */
  function modifyLuggageContainer(luggageAdderElement) {
    if(!luggageAdderElement) {
      return;
    }

    const insuranceContainer = luggageAdderElement.querySelector(".css-1kdmo88");
    const isAlreadyForced = insuranceContainer?.dataset.isForcedInsuranceStep;

    if(!isAlreadyForced && insuranceContainer) {
      insuranceContainer.style.display = "none";
      insuranceContainer.dataset.isForcedInsuranceStep = true;
    }
  }
  /**
   * Injects a custom button into the luggage adder container to simulate a click
   * on the details insurance button, which is not accessible due to the insurance
   * container being hidden.
   *
   * @param {Element} luggageAdderElement The luggage adder container element.
   */
  function injectCustomInsuranceStepButton(luggageAdderElement) {
    if(!luggageAdderElement) {
      return;
    }

    const alreadyHasForcedButton = document.querySelector("button[data-button-forced-insurance]");
    const buttonNextStepParent = luggageAdderElement.querySelector(".css-wyhw1w");

    if(!alreadyHasForcedButton && buttonNextStepParent) {
      const buttonNextStepInsurance = document.createElement("button");
      buttonNextStepInsurance.innerHTML = `
        <div class="button__text" data-rte-editelement="true">Próxima etapa</div>
        <div class="button__text button__text--mobile" data-rte-editelement="true">Próxima etapa</div>
      `;

      buttonNextStepInsurance.classList.add("button", "css-1vr4003");
      buttonNextStepInsurance.setAttribute("data-testid", "search-box-hotel-date-picker-primary-button");
      buttonNextStepInsurance.setAttribute("type", "submit");
      buttonNextStepInsurance.setAttribute("data-test-id", "no-id");
      buttonNextStepInsurance.setAttribute("data-button-forced-insurance", true);
      buttonNextStepInsurance.style.display = "none";

      buttonNextStepParent.appendChild(buttonNextStepInsurance);
      buttonNextStepInsurance.addEventListener("click", () => {
          const buttonInsuranceDetails = document.querySelector(".LuggageAdderContainer .css-1kdmo88 .styles__InsuranceBannerFooterArea-sc-1kgy9y2-6 button");

          if(buttonInsuranceDetails) {
            buttonInsuranceDetails.click();
          } else {
            document.querySelector(".LuggageAdderContainer .css-wyhw1w button").click();
          }
      });
    }
  }

  function toggleButtonNextStepInsurance(exibInsurance = true) {
    const displayButtonInsurance = exibInsurance ? "block" : "none";
    const displayButtonDefault = exibInsurance ? "none" : "block";
    const forcedInsuranceButton = document.querySelector("button[data-button-forced-insurance]");
    const defaultButton = document.querySelector(".LuggageAdderContainer .css-wyhw1w button");

    if (forcedInsuranceButton) forcedInsuranceButton.style.display = displayButtonInsurance;
    if (defaultButton) defaultButton.style.display = displayButtonDefault;
  }

  function initProcessForForcedInsuranceStep() {
    insuranceStepObserver.observe(luggageStepContainer, {
      childList: true,
      subtree: true
    });

    insuranceObserverIsConnected = true;
  }

  function isReviewStep() {
    const currentUrl = window.location.pathname;
    const targetUrl = "/review";
    return currentUrl.includes(targetUrl);
  }

  const observerBody = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if(mutation.type === "attributes" && mutation.attributeName === "class") {
        const body = mutation.target;
        const isAReviewStep = isReviewStep();
        const isStepForAirplaneSeats = body.classList.contains("ReactModal__Body--open") && isAReviewStep;

        if(isStepForAirplaneSeats && !insuranceObserverIsConnected) {
          const stepsFromReview = document.querySelectorAll("main > .azul-page-fragment");
          const luggageStep = stepsFromReview[1];
          luggageStepContainer = luggageStep.querySelector(".azul-container");

          if(luggageStep && luggageStepContainer) {
            initProcessForForcedInsuranceStep();
          }
        } else if(!isAReviewStep && insuranceObserverIsConnected) {
          insuranceStepObserver.disconnect();
          insuranceObserverIsConnected = false;
        }
      }
    }
  });

  observerBody.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  //LÓGICA PARA FLAG UTM CI
  const targetUrl = "/home/review";
  function appendUtmToUrl(urlString) {
    try {
      var urlObj = new URL(urlString, window.location.origin);
      if (urlObj.pathname.indexOf(targetUrl) !== -1 && !urlObj.searchParams.has("utm_ci")) {
        const flagUtm = "avancou_seguro_seguro_forcado";
        urlObj.searchParams.set("utm_ci", flagUtm);
      }
      return urlObj.pathname + urlObj.search + urlObj.hash;
    } catch (e) {
      return urlString;
    }
  }

  // Monkey patching de history.pushState e history.replaceState
  (function () {
    var origPush = history.pushState;
    history.pushState = function (state, title, url) {
      if (typeof url === "string" && url.indexOf(targetUrl) !== -1) {
        arguments[2] = appendUtmToUrl(url);
      }
      return origPush.apply(this, arguments);
    };

    var origReplace = history.replaceState;
    history.replaceState = function (state, title, url) {
      if (typeof url === "string" && url.indexOf(targetUrl) !== -1) {
        arguments[2] = appendUtmToUrl(url);
      }
      return origReplace.apply(this, arguments);
    };
  })();

  // Listener para popstate (casos em que a URL muda sem pushState/replaceState)
  window.addEventListener("popstate", function () {
    var href = window.location.href;
    if (href.indexOf(targetUrl) !== -1 && href.indexOf("utm_ci=") === -1) {
      history.replaceState(null, "", appendUtmToUrl(href));
    }
  });
})();