(function () {
  const experienceName = "AT_EXPERIENCE_FARE_RADIO_SELECTION";
  const experienceAlreadyExecuted = window[experienceName] || false;

  function onExperienceTargetPage() {
      const currentUrl = window.location.pathname;
      const targetTestUrl = "/selecao-voo";
      const queryParams = window.location.search;
      const paramFlightMoneyPayment = "cc=BRL";

      return currentUrl.indexOf(targetTestUrl) !== -1 && queryParams.indexOf(paramFlightMoneyPayment) !== -1;
  }

  function initExperienceWhenReady() {
      const isReady = document.readyState === "complete" || document.readyState === "interactive";
      const isDesktop = window.innerWidth >= 1024;

      if(!isDesktop) {
          console.log("Not a desktop device, exiting...");
          return;
      }

      if (isReady) {
          experienceSetup();
      } else {
          document.addEventListener("DOMContentLoaded", experienceSetup);
      }
  }

  if (experienceAlreadyExecuted || !onExperienceTargetPage()) {
      console.log("[AT] Page is not a correct page OR script already executed.");
      return;
  }

  window[experienceName] = true;
  initExperienceWhenReady();

  function experienceSetup() {
      console.log("[AT] Experience started:", experienceName);

      const SELECTORS = {
          flightsWrapper: ".AzulPage .availability",
          flightCard: ".card-list .flight-card",
          fareItem: ".fare-item",
          selectedFareButton: "[data-test-id=\"select-fare-selected\"]",
          unselectedFareButton: "[data-test-id=\"select-fare\"]",
          preSelectedFooterButton: "[data-testid='pre-selected-footer']",
          fareTypeLabel: "p.promotional",
          recommendedFlag: "span[aria-label=\"Recomendado\"]",
          priceElement: "h4.current",
          farePrice: ".fare-price"
      };

      const RADIO_CLASS = "at-fare-radio-selection__radio";
      const RADIO_BUSINESS_CLASS = "at-fare-radio-selection__radio--business";
      const RADIO_WRAPPER_CLASS = "at-fare-radio-selection__radio-wrapper";
      const RADIO_WRAPPER_SELECTED_CLASS = "at-fare-radio-selection__radio-wrapper--selected";
      const RADIO_LABEL_CLASS = "at-fare-radio-selection__radio-label";
      const RADIO_ACTIVE_BODY_CLASS = "at-fare-radio-selection--active";
      const CARD_BUSINESS_CLASS = "at-fare-radio-selection__card--business";
      const TYPE_CONTAINER_CLASS = "at-fare-radio-selection__type-container";
      const FARE_CELL_CLASS = "at-fare-radio-selection__fare-cell";
      const FARE_PRICE_BUSINESS_CLASS = "at-fare-radio-selection__fare-price--business";
      const PRICE_WRAPPER_CLASS = "at-fare-radio-selection__price-wrapper";
      const PRICE_END_CLASS = "at-fare-radio-selection__price--end";
      const SOLD_OUT_CLASS = "at-fare-radio-selection__sold-out";
      const FARE_PRICE_SOLD_OUT_CLASS = "at-fare-radio-selection__fare-price--sold-out";
      const RECOMMENDED_BADGE_CLASS = "at-fare-radio-selection__recommended-badge";
      const PROCESSED_ATTR = "data-at-radio-injected";
      const FARE_ITEM_PROCESSED_ATTR = "data-at-fare-item-click-injected";
      const RECOMMENDED_PROCESSED_ATTR = "data-at-recommended-processed";
      const SOLD_OUT_ARIA_LABEL = "Tarifa esgotada";
      const BUSINESS_FARE_TEXT = "Business";
      const RECOMMENDED_BADGE_TEXT = "Recomendado";
      const SELECTED_RADIO_LABEL = "Tarifa selecionada";
      const UNSELECTED_RADIO_LABEL = "Selecionar tarifa";
      let groupCounter = 0;

      const OBSERVER_OPTIONS = {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-test-id"]
      };

      let observer = null;
      let observedRoot = null;

      injectCustomCSS();
      waitForDomAndObserve();

      function waitForDomAndObserve() {
          const wrapper = document.querySelector(SELECTORS.flightsWrapper);

          if (!wrapper) {
              requestAnimationFrame(waitForDomAndObserve);
              return;
          }

          console.log("[AT] Flights wrapper found. Observing fare buttons.");
          // Observa um no persistente (document.body) em vez do wrapper .availability.
          // Em navegacoes SPA (ex.: "Informar viajantes" e voltar) o React desmonta e
          // remonta o wrapper; observar o body mantem o observer valido apos o retorno,
          // permitindo reaplicar o layout no DOM recriado.
          observedRoot = document.body;
          observeFareButtons(observedRoot);
          processFareButtons();
      }

      function setupForWhenUserChangeTheCurrencyOrLeavesPage() {
          console.log("[AT] Page no longer matchs all the requirements");
          document.body.classList.toggle(RADIO_ACTIVE_BODY_CLASS, false);
      }

      function observeFareButtons(root) {
          let scheduled = false;

          observer = new MutationObserver(function () {
              const yetOnExperienceTarget = onExperienceTargetPage();

              if(!yetOnExperienceTarget) {
                  setupForWhenUserChangeTheCurrencyOrLeavesPage();
                  return;
              }

              if (scheduled) {
                  return;
              }

              scheduled = true;

              requestAnimationFrame(function () {
                  scheduled = false;
                  processFareButtons();
              });
          });

          observer.observe(root, OBSERVER_OPTIONS);
      }

      function processFareButtons() {
          const yetOnExperienceTarget = onExperienceTargetPage();

          if(!yetOnExperienceTarget) {
              setupForWhenUserChangeTheCurrencyOrLeavesPage();
              return;
          }

          if (observer) {
              observer.disconnect();
          }

          const flightCards = document.querySelectorAll(SELECTORS.flightCard);
          let hasImplementedRadio = false;

          [...flightCards].forEach(function (card) {
              const groupName = getOrCreateGroupId(card);
              const fareItems = card.querySelectorAll(SELECTORS.fareItem);
              const cardHasBusiness = [...fareItems].some(isBusinessFare);

              card.classList.toggle(CARD_BUSINESS_CLASS, cardHasBusiness);

              [...fareItems].forEach(function (fareItem) {
                  setupRecommendedFlag(fareItem);
                  setupCardLayoutHooks(fareItem);

                  const button = fareItem.querySelector(SELECTORS.selectedFareButton + "," + SELECTORS.unselectedFareButton);

                  if (!button) {
                      return;
                  }

                  if (isFareSoldOut(button)) {
                      setupSoldOutIndicator(button, fareItem);
                      return;
                  }

                  const radioImplemented = setupRadioForButton(button, groupName, fareItem);

                  if (radioImplemented) {
                      setupFareItemClick(fareItem);
                      hasImplementedRadio = true;
                  }
              });
          });

          document.body.classList.toggle(RADIO_ACTIVE_BODY_CLASS, hasImplementedRadio);

          if (observer && observedRoot) {
              observer.observe(observedRoot, OBSERVER_OPTIONS);
          }
      }

      function isBusinessFare(fareItem) {
          const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

          return Boolean(fareTypeLabel) && fareTypeLabel.textContent.includes(BUSINESS_FARE_TEXT);
      }

      function setupCardLayoutHooks(fareItem) {
          // Verifica se o item card é do tipo business
          const isBusiness = isBusinessFare(fareItem);
          const isInBusinessCard = Boolean(fareItem.closest("." + CARD_BUSINESS_CLASS));
          // Verifica se o item card tem badge de recomendado
          const hasRecommendedBadge = Boolean(fareItem.querySelector(SELECTORS.recommendedFlag));
          const farePrice = fareItem.querySelector(SELECTORS.farePrice);

          if (isBusiness) {
              farePrice?.classList.add(FARE_PRICE_BUSINESS_CLASS);
          } else {
              farePrice?.parentElement?.classList.add(FARE_CELL_CLASS);
          }

          const priceElement = fareItem.querySelector(SELECTORS.priceElement);

          priceElement?.parentElement?.classList.add(PRICE_WRAPPER_CLASS);

          if (!isInBusinessCard && !hasRecommendedBadge) {
              priceElement?.classList.add(PRICE_END_CLASS);
          }
      }

      function getOrCreateGroupId(card) {
          if (!card.dataset.atFareGroupId) {
              card.dataset.atFareGroupId = "at-fare-group-" + groupCounter;
              groupCounter = groupCounter + 1;
          }

          return card.dataset.atFareGroupId;
      }

      function isFareSoldOut(button) {
          return button.getAttribute("aria-label") === SOLD_OUT_ARIA_LABEL;
      }

      function setupSoldOutIndicator(button, fareItem) {
          if (button.getAttribute(PROCESSED_ATTR) === "true") {
              return;
          }

          button.style.display = "none";
          button.setAttribute(PROCESSED_ATTR, "true");

          const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

          if (!fareTypeLabel) {
              return;
          }

          const soldOutLabel = document.createElement("span");
          soldOutLabel.className = SOLD_OUT_CLASS;
          soldOutLabel.textContent = SOLD_OUT_ARIA_LABEL;

          const badgeWrapper = fareTypeLabel.parentElement;

          badgeWrapper.insertAdjacentElement("beforebegin", soldOutLabel);

          const farePrice = fareItem.querySelector(SELECTORS.farePrice);

          farePrice?.classList.add(FARE_PRICE_SOLD_OUT_CLASS);
      }

      function setupRecommendedFlag(fareItem) {
          if (fareItem.getAttribute(RECOMMENDED_PROCESSED_ATTR) === "true") {
              return;
          }

          const recommendedFlag = fareItem.querySelector(SELECTORS.recommendedFlag);

          if (!recommendedFlag) {
              return;
          }

          fareItem.setAttribute(RECOMMENDED_PROCESSED_ATTR, "true");
          recommendedFlag.style.display = "none";

          const badge = document.createElement("span");
          badge.className = RECOMMENDED_BADGE_CLASS;
          badge.innerHTML = `<svg size="20" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ kcgzzS"><path d="M404.1 405.7L128 428.3 337.6 603.5 274.7 864 512 725.8 749.3 864 686.7 603.5 896 428.3 619.9 405.3 512 160 404.1 405.7Z" fill="#ffffff" fill-rule="evenodd" clip-rule="evenodd"></path></svg>` + " " + RECOMMENDED_BADGE_TEXT;

          const priceElement = fareItem.querySelector(SELECTORS.priceElement);

          if (priceElement) {
              const priceElementFather = priceElement.parentNode;
              priceElementFather?.classList.add("at-father-price-element");
              priceElement.insertAdjacentElement("beforebegin", badge);
              return;
          }
      }

      function updateRadioLabel(radio, isSelected) {
          const labelText = isSelected ? SELECTED_RADIO_LABEL : UNSELECTED_RADIO_LABEL;

          radio.setAttribute("aria-label", labelText);

          const wrapper = radio.parentElement;

          if (!wrapper) {
              return;
          }

          wrapper.classList.toggle(RADIO_WRAPPER_SELECTED_CLASS, isSelected);

          let labelElement = wrapper.querySelector("." + RADIO_LABEL_CLASS);

          if (!labelElement) {
              labelElement = document.createElement("div");
              labelElement.className = RADIO_LABEL_CLASS;
              wrapper.appendChild(labelElement);
          }

          labelElement.textContent = labelText;
      }

      function setupRadioForButton(button, groupName, fareItem) {
          const isSelected = button.matches(SELECTORS.selectedFareButton);
          const isBusiness = isBusinessFare(fareItem);
          const alreadyProcessed = button.getAttribute(PROCESSED_ATTR) === "true";

          if (alreadyProcessed) {
              const existingRadio = fareItem.querySelector("." + RADIO_CLASS);

              if (existingRadio) {
                  existingRadio.checked = isSelected;
                  existingRadio.classList.toggle(RADIO_BUSINESS_CLASS, isBusiness);
                  updateRadioLabel(existingRadio, isSelected);
              }

              return Boolean(existingRadio);
          }

          const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

          if (!fareTypeLabel) {
              return false;
          }

          button.style.display = "none";
          button.setAttribute(PROCESSED_ATTR, "true");

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = groupName;
          radio.className = RADIO_CLASS;
          radio.checked = isSelected;
          radio.classList.toggle(RADIO_BUSINESS_CLASS, isBusiness);

          radio.addEventListener("change", function () {
              console.log("[AT] Radio selected. Triggering underlying fare button click.");
              setTimeout(function () {
                  button.click();
                  analyticsEvent("fare_selected_via_radio");
              }, 5);
          });

          const wrapper = document.createElement("div");
          wrapper.className = RADIO_WRAPPER_CLASS;
          wrapper.appendChild(radio);

          updateRadioLabel(radio, isSelected);

          fareTypeLabel.parentElement?.classList.add(TYPE_CONTAINER_CLASS);
          fareTypeLabel.insertAdjacentElement("afterend", wrapper);

          return true;
      }

      function setupFareItemClick(fareItem) {
          if (fareItem.getAttribute(FARE_ITEM_PROCESSED_ATTR) === "true") {
              return;
          }

          fareItem.setAttribute(FARE_ITEM_PROCESSED_ATTR, "true");

          fareItem.addEventListener("click", function (event) {
              const radio = fareItem.querySelector("." + RADIO_CLASS);

              if (!radio || event.target === radio) {
                  return;
              }

              if(radio.checked && radio.ariaLabel !== "Selecionar tarifa") {
                  analyticsEvent("user_clicked_radio_pre_selected_tariff");
                  const footerButton = document.querySelector(SELECTORS.preSelectedFooterButton + " button");
                  footerButton?.click();
                  return;
              }

              radio.click();
          });
      }

      function injectCustomCSS() {
          const style = document.createElement("style");

          style.innerHTML = `
              .at-fare-radio-selection__radio-wrapper {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px;
                  border-radius: 8px;
                  transition: background-color 0.15s ease;
              }

              .at-fare-radio-selection__radio {
                  -webkit-appearance: none;
                  appearance: none;
                  display: inline-block;
                  vertical-align: middle;
                  width: 20px;
                  height: 20px;
                  margin: 0;
                  border-radius: 50%;
                  border: 1px solid #142c4e;
                  background-color: transparent;
                  position: relative;
                  cursor: pointer;
                  flex-shrink: 0;
              }

              .at-fare-radio-selection__radio::before {
                  content: "";
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background-color: transparent;
                  transform: translate(-50%, -50%);
              }

              .at-fare-radio-selection__radio-label {
                  font-size: 14px;
                  color: #041e42;
              }

              .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) {
                  background-color: transparent;
              }

              .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio {
                  border-color: #106199;
              }

              .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio-label {
                  color: #106199;
              }

              .at-fare-radio-selection__radio-wrapper--selected {
                  background-color: #046bb5;
                  transition: box-shadow 300ms;
              }

              .at-fare-radio-selection__radio-wrapper--selected:hover {
                  box-shadow: rgba(0, 0, 0, 0.02) 0px 12px 16px;
              }

              .at-fare-radio-selection__radio-wrapper--selected .at-fare-radio-selection__radio {
                  border-color: #ffffff;
              }

              .at-fare-radio-selection__radio-wrapper--selected .at-fare-radio-selection__radio::before {
                  background-color: #ffffff;
              }

              .at-fare-radio-selection__radio-wrapper--selected .at-fare-radio-selection__radio-label {
                  color: #ffffff;
              }

              .fare-item:hover .at-fare-radio-selection__radio-wrapper--selected {
                  background-color: #046bb5;
              }

              .at-fare-radio-selection__radio--business {
                  border-color: #ffffff;
              }

              .at-fare-radio-selection__radio--business ~ .at-fare-radio-selection__radio-label {
                  color: #ffffff;
              }

              .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio--business {
                  border-color: rgba(255, 255, 255, 0.7);
              }

              .fare-item:hover .at-fare-radio-selection__radio-wrapper:not(.at-fare-radio-selection__radio-wrapper--selected) .at-fare-radio-selection__radio--business ~ .at-fare-radio-selection__radio-label {
                  color: rgba(255, 255, 255, 0.7);
              }

              .fare-item {
                  cursor: pointer;
              }

              .at-fare-radio-selection__sold-out {
                  display: block;
                  margin: 0 auto;
                  text-align: center;
                  font-size: 12px;
                  color: #6B6B6B;
                  font-weight: 500;
              }

              .at-fare-radio-selection__card--business .at-fare-radio-selection__fare-price--sold-out:not(.at-fare-radio-selection__fare-price--business) {
                  margin-top: 8px;
              }

              .at-fare-radio-selection__recommended-badge {
                  display: inline-flex;
                  -webkit-box-align: center;
                  align-items: center;
                  gap: 4px;
                  height: 28px;
                  padding: 8px;
                  border-radius: 4px;
                  background: linear-gradient(22.87deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%);
                  color: rgb(255, 255, 255);
                  font-family: "Helvetica Neue", sans-serif;
                  font-size: 14px;
                  line-height: 1;
                  white-space: nowrap;
              }
                  
              body.at-fare-radio-selection--active .fare-item > ul > li::after {
                  display: none;
              }

              .at-father-price-element {
                  flex-direction: row !important;
                  justify-content: space-between !important;
              }

              .fare-item .fare-price {
                  gap: 8px;
              }

              .at-fare-radio-selection__card--business .at-fare-radio-selection__type-container {
                  flex-direction: column-reverse;
              }

              .at-fare-radio-selection__card--business .at-fare-radio-selection__fare-cell {
                  padding: 8px 8px 0;
              }

              .fare-item .at-fare-radio-selection__fare-price--business {
                  padding: 8px;
              }

              .at-fare-radio-selection__card--business .at-fare-radio-selection__price-wrapper {
                  align-items: center;
              }

              body.at-fare-radio-selection--active .at-fare-radio-selection__card--business h4.current {
                  margin-left: 0;
              }

              body.at-fare-radio-selection--active .fare-item h4.current.at-fare-radio-selection__price--end {
                  margin-left: auto;
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
              const s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
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