(function () {
  const experienceName = "AT_EXPERIENCE_FARE_RADIO_SELECTION_MOBILE";
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
      const isMobile = window.innerWidth < 1024;

      if (!isMobile) {
          console.log("[AT] Experience not executed. Not a mobile device.");
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
      const BADGE_ROW_CLASS = "at-fare-radio-selection__badge-row";
      const FARE_VISUALLY_SELECTED_CLASS = "at-fare-radio-selection__fare--visually-selected";
      const SELECTED_FARE_BACKGROUND_HINT = "rgba(2, 108, 182";
      const PROCESSED_ATTR = "data-at-radio-injected";
      const FARE_ITEM_PROCESSED_ATTR = "data-at-fare-item-click-injected";
      const RECOMMENDED_PROCESSED_ATTR = "data-at-recommended-processed";
      const HIDDEN_BUTTON_CLASS = "at-fare-radio-selection__hidden-button";
      const SOLD_OUT_ARIA_LABEL = "Tarifa esgotada";
      const BUSINESS_FARE_TEXT = "Business";
      const RECOMMENDED_BADGE_TEXT = "Recomendado";
      const SELECTED_RADIO_LABEL = "Tarifa selecionada";
      const UNSELECTED_RADIO_LABEL = "Selecionar tarifa";
      const DEBUG_PANEL_ID = "at-fare-radio-selection__debug";
      const SITE_COMMIT_DELAY_MS = 120;
      let groupCounter = 0;

      // Painel de debug on-screen: ativar com ?atDebug=1 na URL
      // (necessario porque nao ha console acessivel no iOS a partir do Windows).
      function isDebugEnabled() {
          try {
              return window.location.search.indexOf("atDebug=1") !== -1
                  || window.localStorage.getItem("atDebug") === "1";
          } catch (error) {
              return window.location.search.indexOf("atDebug=1") !== -1;
          }
      }

      const debugEnabled = isDebugEnabled();

      function debugLog(message) {
          console.log("[AT]", message);

          if (!debugEnabled) {
              return;
          }

          const panel = getDebugPanel();

          if (!panel) {
              return;
          }

          const line = document.createElement("div");
          const now = new Date();
          const stamp = now.toTimeString().slice(3, 8) + "." + String(now.getMilliseconds()).padStart(3, "0");

          line.textContent = stamp + " " + message;
          panel.appendChild(line);

          while (panel.childNodes.length > 14) {
              panel.removeChild(panel.firstChild);
          }
      }

      function getDebugPanel() {
          let panel = document.getElementById(DEBUG_PANEL_ID);

          if (panel) {
              return panel;
          }

          if (!document.body) {
              return null;
          }

          panel = document.createElement("div");
          panel.id = DEBUG_PANEL_ID;
          document.body.appendChild(panel);

          return panel;
      }

      function describeElement(element) {
          if (!element) {
              return "null";
          }

          const tag = (element.tagName || "?").toLowerCase();
          const className = typeof element.className === "string" ? element.className : "";

          return tag + (className ? "." + className.trim().split(/\s+/).slice(0, 2).join(".") : "");
      }

      // Marcadores do proprio site para saber se ELE registrou a tarifa.
      function describeSiteSelection() {
          const modalFares = [...document.querySelectorAll(SELECTORS.fareItem)].filter(function (fareItem) {
              return !fareItem.closest(SELECTORS.flightCard);
          });

          let selectedIndex = -1;

          modalFares.forEach(function (fareItem, index) {
              if (isModalFareSelectedBySite(fareItem)) {
                  selectedIndex = index;
              }
          });

          const selectedButtons = document.querySelectorAll(SELECTORS.selectedFareButton).length;

          return "bgSel=" + selectedIndex + " selBtns=" + selectedButtons + " fares=" + modalFares.length;
      }

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

          debugLog("wrapper found. w=" + window.innerWidth + " ua=" + navigator.userAgent.slice(0, 40));
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

          // Modal/tablet path: below 1024px the site renders fares inside a
          // full-screen modal carousel instead of the inline grid. Those fares
          // live outside any .flight-card and have no per-card select button.
          const modalFareItems = [...document.querySelectorAll(SELECTORS.fareItem)].filter(function (fareItem) {
              return !fareItem.closest(SELECTORS.flightCard);
          });

          if (modalFareItems.length > 0) {
              const modalContainer = modalFareItems[0].parentElement;
              const modalGroupName = getOrCreateGroupId(modalContainer);
              const modalHasBusiness = modalFareItems.some(isBusinessFare);

              modalFareItems.forEach(function (fareItem) {
                  fareItem.classList.toggle(CARD_BUSINESS_CLASS, modalHasBusiness);

                  setupRecommendedFlag(fareItem);
                  setupCardLayoutHooks(fareItem);

                  const button = fareItem.querySelector(SELECTORS.selectedFareButton + "," + SELECTORS.unselectedFareButton + ",[aria-label=\"" + SOLD_OUT_ARIA_LABEL + "\"]");

                  if (button && isFareSoldOut(button)) {
                      setupSoldOutIndicator(button, fareItem);
                      return;
                  }

                  if (isModalFareSoldOut(fareItem)) {
                      removeModalFareRadio(fareItem);
                      return;
                  }

                  const radioImplemented = setupModalFareRadio(fareItem, modalGroupName);

                  if (radioImplemented) {
                      setupFareItemClick(fareItem);
                      hasImplementedRadio = true;
                  }

                  groupRecommendedBadgeWithPromotional(fareItem);
              });

              syncModalVisualSelection(modalFareItems);
          }

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

      function isModalFareSoldOut(fareItem) {
          return [...fareItem.querySelectorAll("p")].some(function (element) {
              return element.textContent.trim() === SOLD_OUT_ARIA_LABEL;
          });
      }

      function removeModalFareRadio(fareItem) {
          [...fareItem.querySelectorAll("." + RADIO_WRAPPER_CLASS)].forEach(function (radioWrapper) {
              if (radioWrapper.parentNode) {
                  radioWrapper.parentNode.removeChild(radioWrapper);
              }
          });
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

      // Agrupa o promotional e a badge de recomendado numa linha unica dentro do
      // type-container, para que fiquem lado a lado no modal (< 1024px).
      function groupRecommendedBadgeWithPromotional(fareItem) {
          const typeContainer = fareItem.querySelector("." + TYPE_CONTAINER_CLASS);
          const promotional = fareItem.querySelector(SELECTORS.fareTypeLabel);
          const badge = fareItem.querySelector("." + RECOMMENDED_BADGE_CLASS);

          if (!typeContainer || !promotional || !badge) {
              return;
          }

          let badgeRow = typeContainer.querySelector("." + BADGE_ROW_CLASS);

          if (!badgeRow) {
              badgeRow = document.createElement("div");
              badgeRow.className = BADGE_ROW_CLASS;
              promotional.insertAdjacentElement("beforebegin", badgeRow);
          }

          badgeRow.appendChild(promotional);
          badgeRow.appendChild(badge);
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

          // Nao usar display:none — no iOS Safari, element.click() em botao
          // com display:none e ignorado. Ocultar visualmente mantendo no layout.
          button.classList.add(HIDDEN_BUTTON_CLASS);
          button.setAttribute(PROCESSED_ATTR, "true");

          const built = createRadioElements(groupName, isSelected, isBusiness, function () {
              debugLog("radio change (inline). Clicking hidden fare button.");
              triggerSiteClickAfterCommit(button, "hidden fare button");
              analyticsEvent("fare_selected_via_radio");
          });

          fareTypeLabel.parentElement?.classList.add(TYPE_CONTAINER_CLASS);
          fareTypeLabel.insertAdjacentElement("afterend", built.wrapper);

          return true;
      }

      function triggerNativeClick(element) {
          if (!element) {
              return;
          }

          element.click();
      }

      // O React do site processa o clique do usuario de forma assincrona (batching).
      // Clicar o proximo botao no mesmo tick faz o handler ler o estado antigo —
      // por isso a tarifa "anima" mas nao muda. O delay deixa o estado comitar.
      function triggerSiteClickAfterCommit(element, description) {
          if (!element) {
              return;
          }

          setTimeout(function () {
              debugLog("clicking " + description + ": " + describeElement(element));
              triggerNativeClick(element);
          }, SITE_COMMIT_DELAY_MS);
      }

      function createRadioElements(groupName, isSelected, isBusiness, onSelect) {
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = groupName;
          radio.className = RADIO_CLASS;
          radio.checked = isSelected;
          radio.classList.toggle(RADIO_BUSINESS_CLASS, isBusiness);

          radio.addEventListener("change", onSelect);

          const wrapper = document.createElement("div");
          wrapper.className = RADIO_WRAPPER_CLASS;
          wrapper.appendChild(radio);

          updateRadioLabel(radio, isSelected);

          return { radio: radio, wrapper: wrapper };
      }

      // Modal/tablet variant of the radio setup. The modal carousel has no
      function setupModalFareRadio(fareItem, groupName) {
          if (fareItem.querySelector("." + RADIO_CLASS)) {
              return true;
          }

          const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);

          if (!fareTypeLabel) {
              return false;
          }

          const isBusiness = isBusinessFare(fareItem);

          // Modal: so atualiza o visual no clique. Nao chama slick goTo
          // (brigava com o swipe) e nao auto-clica Continuar.
          const built = createRadioElements(groupName, false, isBusiness, function () {
              debugLog("radio change (modal) — click only.");
              updateModalVisualSelection(fareItem);
              analyticsEvent("fare_selected_via_radio");
          });

          fareTypeLabel.parentElement?.classList.add(TYPE_CONTAINER_CLASS);
          fareTypeLabel.insertAdjacentElement("afterend", built.wrapper);

          return true;
      }

      function isModalFareSelectedBySite(fareItem) {
          const background = window.getComputedStyle(fareItem).backgroundImage || "";

          return background.indexOf(SELECTED_FARE_BACKGROUND_HINT) !== -1;
      }

      // Tarifa escolhida pelo usuario via clique (nao via swipe do Slick).
      // Guardada por CHAVE (tipo + preco) e nao por referencia de elemento:
      // React/Slick recriam o no do card, e uma referencia velha fazia o sync
      // cair no fallback da recomendada (bug que aparecia no Android).
      let userSelectedModalFareKey = null;

      function getModalFareKey(fareItem) {
          const fareTypeLabel = fareItem.querySelector(SELECTORS.fareTypeLabel);
          const priceElement = fareItem.querySelector(SELECTORS.priceElement);
          const type = (fareTypeLabel?.textContent || "").trim();
          const price = (priceElement?.textContent || "").trim();

          return type + "|" + price;
      }

      // Keeps visual selection (radio pill + label) in sync with the fare.
      // NUNCA usa slick-current: scrollar o carrossel nao deve selecionar.
      function syncModalVisualSelection(modalFareItems) {
          let selectedFareItem = null;

          if (userSelectedModalFareKey) {
              selectedFareItem = modalFareItems.filter(function (fareItem) {
                  return getModalFareKey(fareItem) === userSelectedModalFareKey;
              })[0];
          }

          if (!selectedFareItem) {
              selectedFareItem = modalFareItems.filter(isModalFareSelectedBySite)[0];
          }

          if (!selectedFareItem) {
              selectedFareItem = modalFareItems.filter(function (fareItem) {
                  return fareItem.classList.contains("fare-item--recommended");
              })[0];
          }

          modalFareItems.forEach(function (fareItem) {
              const isSelected = fareItem === selectedFareItem;
              const radio = fareItem.querySelector("." + RADIO_CLASS);

              fareItem.classList.toggle(FARE_VISUALLY_SELECTED_CLASS, isSelected);

              if (radio) {
                  radio.checked = isSelected;
                  updateRadioLabel(radio, isSelected);
              }
          });
      }

      function updateModalVisualSelection(selectedFareItem) {
          const selectedRadio = selectedFareItem.querySelector("." + RADIO_CLASS);

          if (!selectedRadio) {
              return;
          }

          userSelectedModalFareKey = getModalFareKey(selectedFareItem);

          const groupRadios = document.getElementsByName(selectedRadio.name);

          [...groupRadios].forEach(function (radio) {
              const fareItem = radio.closest(SELECTORS.fareItem);
              const isSelected = fareItem === selectedFareItem;

              radio.checked = isSelected;
              fareItem?.classList.toggle(FARE_VISUALLY_SELECTED_CLASS, isSelected);
              updateRadioLabel(radio, isSelected);
          });

          // Auto-cura: se o site/Slick re-renderizar e desmarcar, reaplica.
          setTimeout(function () {
              reassertModalSelection();
          }, 250);
      }

      function reassertModalSelection() {
          if (!userSelectedModalFareKey) {
              return;
          }

          const modalFareItems = [...document.querySelectorAll(SELECTORS.fareItem)].filter(function (fareItem) {
              return !fareItem.closest(SELECTORS.flightCard);
          });

          if (modalFareItems.length === 0) {
              return;
          }

          const target = modalFareItems.filter(function (fareItem) {
              return getModalFareKey(fareItem) === userSelectedModalFareKey;
          })[0];

          const radio = target?.querySelector("." + RADIO_CLASS);

          if (!radio || radio.checked) {
              return;
          }

          debugLog("re-asserting selection: " + userSelectedModalFareKey.slice(0, 20));
          syncModalVisualSelection(modalFareItems);
      }

      function triggerModalSelection(fareItem) {
          clickModalSelectCta(fareItem, "fare_selected_via_radio");
      }

      function clickModalSelectCta(fareItem, analyticsLabel) {
          const cta = findModalSelectButton(fareItem);

          if (!cta) {
              debugLog("modal CTA NOT FOUND");
              return;
          }

          debugLog("modal CTA found: \"" + (cta.textContent || "").trim().slice(0, 24) + "\"");
          triggerSiteClickAfterCommit(cta, "modal CTA");

          if (analyticsLabel) {
              analyticsEvent(analyticsLabel);
          }
      }

      function findModalSelectButton(fareItem) {
          let container = fareItem.parentElement;
          let continuarCandidate = null;
          let footerCandidate = null;

          while (container && container !== document.body) {
              const buttons = container.querySelectorAll("button");

              for (let i = 0; i < buttons.length; i = i + 1) {
                  const candidate = buttons[i];

                  if (candidate.closest(SELECTORS.fareItem)) {
                      continue;
                  }

                  const label = (candidate.textContent || "").trim().toLowerCase();

                  if (label.indexOf("selecionar tarifa") !== -1) {
                      return candidate;
                  }

                  if (!continuarCandidate && label.indexOf("continuar") !== -1) {
                      continuarCandidate = candidate;
                  }
              }

              if (!footerCandidate) {
                  footerCandidate = container.querySelector(".modal-content__footer button");
              }

              container = container.parentElement;
          }

          return continuarCandidate || footerCandidate || document.querySelector(".modal-content__footer button");
      }

      function handleFareItemActivation(fareItem, event) {
          const radio = fareItem.querySelector("." + RADIO_CLASS);

          if (!radio) {
              return;
          }

          debugLog("click " + describeElement(event.target) + " | " + describeSiteSelection());

          // Toque no proprio input: o change nativo ja cuida da selecao.
          if (event.target === radio) {
              return;
          }

          const isModalFare = !fareItem.closest(SELECTORS.flightCard);

          if (isModalFare) {
              // Clique intencional: so marca o radio. Scroll NAO seleciona.
              // Nao chama slick goTo (brigava com o swipe e gerava loop).
              radio.checked = true;
              updateModalVisualSelection(fareItem);
              analyticsEvent("fare_selected_via_radio");
              debugLog("modal fare marked by click: " + (fareItem.querySelector(SELECTORS.fareTypeLabel)?.textContent || "?").trim().slice(0, 16));
              return;
          }

          // Inline: o change do radio clica o botao oculto do site.
          if (radio.checked && radio.getAttribute("aria-label") !== UNSELECTED_RADIO_LABEL) {
              return;
          }

          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
      }

      function setupFareItemClick(fareItem) {
          if (fareItem.getAttribute(FARE_ITEM_PROCESSED_ATTR) === "true") {
              return;
          }

          fareItem.setAttribute(FARE_ITEM_PROCESSED_ATTR, "true");

          // Android costuma disparar touchmove com poucos px e CANCELAR o click.
          // iOS e mais permissivo. Por isso: (1) so conta swipe horizontal claro;
          // (2) ativa no touchend quando for tap — nao depende so do click.
          let touchStartX = 0;
          let touchStartY = 0;
          let touchMoved = false;
          let handledByTouchEnd = false;
          const SWIPE_THRESHOLD_PX = 28;

          fareItem.addEventListener("touchstart", function (event) {
              const touch = event.changedTouches[0];

              if (!touch) {
                  return;
              }

              touchStartX = touch.clientX;
              touchStartY = touch.clientY;
              touchMoved = false;
              handledByTouchEnd = false;
          }, { passive: true });

          fareItem.addEventListener("touchmove", function (event) {
              const touch = event.changedTouches[0];

              if (!touch) {
                  return;
              }

              const deltaX = Math.abs(touch.clientX - touchStartX);
              const deltaY = Math.abs(touch.clientY - touchStartY);

              // Slick e horizontal: so ignora se o gesto for claramente um swipe.
              if (deltaX > SWIPE_THRESHOLD_PX && deltaX > deltaY) {
                  touchMoved = true;
              }
          }, { passive: true });

          fareItem.addEventListener("touchend", function (event) {
              if (touchMoved) {
                  return;
              }

              const radio = fareItem.querySelector("." + RADIO_CLASS);

              // Toque no input: o change nativo cuida.
              if (!radio || event.target === radio) {
                  return;
              }

              handledByTouchEnd = true;
              handleFareItemActivation(fareItem, event);

              setTimeout(function () {
                  handledByTouchEnd = false;
              }, 400);
          }, { passive: true });

          fareItem.addEventListener("click", function (event) {
              if (touchMoved) {
                  touchMoved = false;
                  debugLog("click ignored (swipe).");
                  return;
              }

              // Evita disparo duplo quando o touchend ja selecionou (Android/iOS).
              if (handledByTouchEnd) {
                  handledByTouchEnd = false;
                  return;
              }

              handleFareItemActivation(fareItem, event);
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
                  background-color: #3e6dd3;
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
                  background-color: #315ebe;
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
                  -webkit-tap-highlight-color: rgba(2, 108, 182, 0.12);
              }

              #at-fare-radio-selection__debug {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  z-index: 2147483647;
                  max-height: 42vh;
                  overflow: hidden;
                  padding: 6px 8px;
                  background: rgba(0, 0, 0, 0.82);
                  color: #7CFC9B;
                  font: 500 10px/1.35 ui-monospace, "SF Mono", Menlo, monospace;
                  white-space: pre-wrap;
                  word-break: break-all;
                  pointer-events: none;
              }

              /* Mantem o botao original clicavel via JS no iOS (display:none quebra .click()) */
              .at-fare-radio-selection__hidden-button {
                  position: absolute !important;
                  width: 1px !important;
                  height: 1px !important;
                  padding: 0 !important;
                  margin: -1px !important;
                  overflow: hidden !important;
                  clip: rect(0, 0, 0, 0) !important;
                  white-space: nowrap !important;
                  border: 0 !important;
                  opacity: 0 !important;
                  pointer-events: none !important;
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

              .fare-item .fare-price {
                  gap: 8px;
              }

              /* ===== Modal carousel layout (site renders a modal < 1024px) ===== */
              @media (max-width: 1023px) {
                  .fare-price {
                      flex-direction: column;
                      align-items: flex-start !important;
                  }

                  .at-fare-radio-selection__badge-row {
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      flex-wrap: wrap;
                  }

                  .at-fare-radio-selection__type-container {
                      flex-direction: column-reverse !important;
                  }

                  .at-fare-radio-selection__radio-wrapper {
                      padding: 0 0 8px 0;
                  }

                  .modal-content__footer .button__text {
                      font-size: 0;
                  }

                  .modal-content__footer .button__text::after {
                      content: "Continuar";
                      font-size: 16px;
                  }

                  .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio-wrapper {
                      background-color: #026AB5;
                      padding: 8px;
                  }

                  .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio {
                      border-color: #ffffff;
                  }

                  .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio::before {
                      background-color: #ffffff;
                  }

                  .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio-label {
                      color: #ffffff;
                      font-size: 0;
                  }

                  .at-fare-radio-selection__fare--visually-selected .at-fare-radio-selection__radio-label::after {
                      content: "Tarifa selecionada";
                      font-size: 14px;
                  }

                  .at-fare-radio-selection__card--business .at-fare-radio-selection__type-container {
                      flex-direction: column-reverse;
                      align-items: flex-start;
                  }

                  .at-fare-radio-selection__card--business .at-fare-radio-selection__price-wrapper {
                      align-items: center;
                  }

                  body.at-fare-radio-selection--active .at-fare-radio-selection__card--business h4.current {
                      margin-left: 0;
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