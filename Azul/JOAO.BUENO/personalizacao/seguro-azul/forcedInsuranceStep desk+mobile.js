(function () {
  let luggageStepContainer = "";
  let insuranceObserverIsConnected = false;
  const flagForcedButton = "data-button-forced-insurance";
  const flagMobaForcedButton = "data-button-moba-forced-insurance";

  const insuranceStepObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const targetMutation = mutation.target;
      const isMutationForLuggageContainer = targetMutation.classList.contains(
        "LuggageAdderContainer"
      );
      const isMutationForTicketsTabs = targetMutation.classList.contains(
        "react-tabs__tab-panel"
      );
      const luggageAdderElement = luggageStepContainer.querySelector(
        ".LuggageAdderContainer"
      );

      if (isMutationForLuggageContainer) {
        modifyLuggageContainer(luggageAdderElement);
        injectCustomInsuranceStepButton(luggageAdderElement, true);
        injectCustomInsuranceStepButton(luggageAdderElement, false);
      }

      if (isMutationForLuggageContainer || isMutationForTicketsTabs) {
        const ticketsList = luggageStepContainer.querySelector(
          ".css-1bp6j6a > .react-tabs__tab-list"
        );

        if (ticketsList) {
          const ticketsLength = ticketsList.children?.length;
          const lastTicket = ticketsList.lastElementChild;

          if (
            ticketsLength < 1 ||
            lastTicket?.classList.contains("react-tabs__tab--selected")
          ) {
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
    if (!luggageAdderElement) {
      return;
    }

    const insuranceContainer =
      luggageAdderElement.querySelector(".css-1kdmo88");
    const isAlreadyForced = insuranceContainer?.dataset.isForcedInsuranceStep;

    if (!isAlreadyForced && insuranceContainer) {
      insuranceContainer.style.display = "none";
      insuranceContainer.dataset.isForcedInsuranceStep = true;
    }
  }

  /**
   * Injects a custom button into the luggage adder container to simulate a click
   * on the details insurance button when clicked. If the button is already present,
   * does nothing.
   * @param {Element} luggageAdderElement The luggage adder container element.
   * @param {boolean} isMobaVersion True if the button is for the mobile version,
   * false otherwise.
   */
  function injectCustomInsuranceStepButton(
    luggageAdderElement,
    isMobaVersion = false
  ) {
    if (!luggageAdderElement) {
      return;
    }

    const flag = isMobaVersion ? flagMobaForcedButton : flagForcedButton;
    const classParent = isMobaVersion ? ".css-sci7xq" : ".css-wyhw1w";

    const alreadyHasForcedButton = document.querySelector(`button[${flag}]`);
    const buttonNextStepParent = luggageAdderElement.querySelector(classParent);

    if (!alreadyHasForcedButton && buttonNextStepParent) {
      const buttonNextStepInsurance =
        creteElementForButtonForced(isMobaVersion);
      buttonNextStepParent.appendChild(buttonNextStepInsurance);

      const currentButtonNextStep = document.querySelector(`button[${flag}]`);
      currentButtonNextStep.addEventListener(
        "click",
        handleClickForcedInsuranceButton
      );
    }
  }

  /**
   * Creates a button element that simulates a click on the details insurance button,
   * which is not accessible due to the insurance container being hidden.
   *
   * @param {boolean} isMobaButton True if the button is for the mobile version, false
   * otherwise.
   * @returns {Element} The created button element.
   */
  function creteElementForButtonForced(isMobaButton = false) {
    const buttonClass = isMobaButton ? "css-1ci6xku" : "css-1vr4003";
    const dataFlag = isMobaButton ? flagMobaForcedButton : flagForcedButton;

    const buttonNextStepInsurance = document.createElement("button");
    buttonNextStepInsurance.innerHTML = `
      <div class="button__text" data-rte-editelement="true">Próxima etapa</div>
      <div class="button__text button__text--mobile" data-rte-editelement="true">Próxima etapa</div>
    `;

    buttonNextStepInsurance.classList.add("button", buttonClass);
    buttonNextStepInsurance.setAttribute(
      "data-testid",
      "search-box-hotel-date-picker-primary-button"
    );
    buttonNextStepInsurance.setAttribute("type", "submit");
    buttonNextStepInsurance.setAttribute("data-test-id", "no-id");
    buttonNextStepInsurance.setAttribute(dataFlag, true);
    buttonNextStepInsurance.style.display = "none";

    return buttonNextStepInsurance;
  }

  /**
   * Handles the click event of the custom button injected into the luggage adder
   * container. If the button is present, it simulates a click on the details
   * insurance button, which is not accessible due to the insurance container being
   * hidden. If the button is not present, it simulates a click on the default button
   * inside the luggage adder container.
   */
  function handleClickForcedInsuranceButton(event) {
    event.preventDefault();
    event.stopPropagation();

    const buttonInsuranceDetails = document.querySelector(
      ".LuggageAdderContainer .css-1kdmo88 .styles__InsuranceBannerFooterArea-sc-1kgy9y2-6 button"
    );
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;
    const eventTrigger = isTouchDevice
      ? new TouchEvent("touchstart", { bubbles: true })
      : new MouseEvent("click", { bubbles: true });

    if (buttonInsuranceDetails) {
      buttonInsuranceDetails.dispatchEvent(eventTrigger);
    } else {
      document
        .querySelector(".LuggageAdderContainer .css-wyhw1w button")
        ?.dispatchEvent(eventTrigger);
    }
  }

  function toggleButtonNextStepInsurance(exibInsurance = true) {
    const displayButtonInsurance = exibInsurance ? "block" : "none";
    const displayButtonDefault = exibInsurance ? "none" : "block";

    const forcedInsuranceButton = document.querySelector(
      `button[${flagForcedButton}]`
    );
    const forcedInsuranceButtonMoba = document.querySelector(
      `button[${flagMobaForcedButton}]`
    );
    const defaultButton = document.querySelector(
      ".LuggageAdderContainer .css-wyhw1w button"
    );
    const defaultButtonMoba = document.querySelector(
      ".LuggageAdderContainer .css-sci7xq button"
    );

    if (forcedInsuranceButton)
      forcedInsuranceButton.style.display = displayButtonInsurance;
    if (defaultButton) defaultButton.style.display = displayButtonDefault;
    if (defaultButtonMoba)
      defaultButtonMoba.style.display = displayButtonDefault;

    if (forcedInsuranceButtonMoba) {
      forcedInsuranceButtonMoba.style.display = displayButtonInsurance;

      if (exibInsurance) {
        setTimeout(() => {
          forcedInsuranceButtonMoba.removeAttribute("disabled", true);
        }, 300);
      } else {
        forcedInsuranceButtonMoba.setAttribute("disabled", true);
      }
    }
  }

  function initProcessForForcedInsuranceStep() {
    insuranceStepObserver.observe(luggageStepContainer, {
      childList: true,
      subtree: true,
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
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const body = mutation.target;
        const isAReviewStep = isReviewStep();
        const isStepForAirplaneSeats =
          body.classList.contains("ReactModal__Body--open") && isAReviewStep;

        if (isStepForAirplaneSeats && !insuranceObserverIsConnected) {
          const stepsFromReview = document.querySelectorAll(
            "main > .azul-page-fragment"
          );
          const luggageStep = stepsFromReview[1];
          luggageStepContainer = luggageStep.querySelector(".azul-container");

          if (luggageStep && luggageStepContainer) {
            initProcessForForcedInsuranceStep();
          }
        } else if (!isAReviewStep && insuranceObserverIsConnected) {
          insuranceStepObserver.disconnect();
          insuranceObserverIsConnected = false;
        }
      }
    }
  });

  observerBody.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  //LÓGICA PARA FLAG UTM CI
  const targetUrl = "/home/review";
  function appendUtmToUrl(urlString) {
    try {
      var urlObj = new URL(urlString, window.location.origin);
      if (
        urlObj.pathname.indexOf(targetUrl) !== -1 &&
        !urlObj.searchParams.has("utm_ci")
      ) {
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
