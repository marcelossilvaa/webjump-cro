      (function() {
          const experienceName = "AT_INS_NO_DEFAULT";
          const experienceAlreadyExecuted = window[experienceName] || false;

          const onExperienceTargetPage = () => {
              const isStageEnv = window.location.href.includes("stage");
              const currentUrl = window.location.pathname;
              const queryParams = window.location.search;
              const isReviewPage = currentUrl.includes("/review");
              const isLegacyCheckoutFlow = currentUrl.includes("/selecao-voo") && queryParams.includes("cc=BRL");

              return isStageEnv && (isReviewPage || isLegacyCheckoutFlow);
          }

          const initExperienceWhenReady = () => {
              const isReady = document.readyState === "complete" || document.readyState === "interactive";
              const isDesktopDevice = window.innerWidth >= 1024;

              if (!isDesktopDevice) {
                  console.log("[AT] Not a desktop device, experience will not run.");
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

              const CHECKOUT_URL_STEPS = ["selecao-voo", "passageiros", "responsavel", "review"];
              const SELECTORS = {
                  azulPageFragment: ".azul-page-fragment",
                  luggageContainer: ".LuggageAdderContainer",
                  insuranceBanner: ".LuggageAdderContainer .styles__InsuranceBannerContainer-sc-1kgy9y2-0, .css-1kdmo88 .styles__InsuranceBannerContainer-sc-1kgy9y2-0",
                  tripsList: ".LuggageAdderContainer .react-tabs__tab-list li, .react-tabs__tab-list li",
                  buttonAdderInsurance: ".styles__InsuranceBannerContainer-sc-1kgy9y2-0 .styles__InsuranceBannerFooterArea-sc-1kgy9y2-6 button[type='button']",
                  buttonSubmitCheckout: ".LuggageAdderContainer button[type='submit']",
                  insurancePrice: ".styles__InsuranceBannerContainer-sc-1kgy9y2-0 .styles__InsurancePrice-sc-1kgy9y2-11",
              };

              const NATIVE_BENEFIT_ICON = `<svg width="20" height="20" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M512 128C724.1 128 896 299.9 896 512 896 724.1 724.1 896 512 896 299.9 896 128 724.1 128 512 128 299.9 299.9 128 512 128ZM439.8 584.4L330.9 475.4 288 518.4 439.8 672 714.7 396.5V396.4L671.8 352H671.7L439.8 584.4Z" fill="#31A2D0"></path></svg>`;

              const BENEFITS_BY_TRIP = {
                  goAndBack: [
                      "Proteção para Celular e Notebook (roubo/furto)",
                      "Despesas Médicas, Hospitalares e Farmacêuticas",
                      "Cobertura Pet e muito mais!",
                  ],
                  oneWay: [
                      "Despesas Médicas, Hospitalares e Odontológicas em Viagem",
                      "Cancelamento de Viagem e muito mais!",
                  ],
              };

              const mainCheckoutObserver = new MutationObserver(mainElementObserverCallback);
              const reviewCheckoutObserver = new MutationObserver(reviewCheckoutObserverCallback);

              const maximumAttempts = 100;
              let attempts = 0;

              init();

              function init() {
                  const mainElement = document.querySelector("main");

                  if (!mainElement && attempts < maximumAttempts) {
                      attempts++;
                      console.log("[AT] Main element not found. Waiting until it appears for maximum 100 attempts...", attempts);
                      requestAnimationFrame(init);
                      return;
                  }

                  injectCustomCSS();
                  mainCheckoutObserver.observe(document.querySelector("main"), {
                      childList: true,
                      subtree: false
                  });

                  // Já em /review (ex: /home/review?baggage) — não depende só da navegação SPA
                  if (isReviewStep()) {
                      toggleMainElementExperienceClass(true);
                      tryInjectInsurance();
                      initReviewObserver();
                  }
              }

              function mainElementObserverCallback(mutations) {
                  for (const mutation of mutations) {
                      if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                          if (!isOneCheckoutStep()) {
                              disconnectObservers();
                              console.log("[AT] User left the checkout page, observers disconnected.");
                              return;
                          }

                          if (!isReviewStep()) {
                              return;
                          }

                          toggleMainElementExperienceClass(true);
                          tryInjectInsurance();
                          initReviewObserver();
                      }
                  }
              }

              function initReviewObserver() {
                  const azulPageFragment = document.querySelectorAll(SELECTORS.azulPageFragment);
                  const luggageFragment = azulPageFragment[1]
                      || document.querySelector(SELECTORS.luggageContainer)
                      || document.querySelector("main");

                  if (luggageFragment) {
                      reviewCheckoutObserver.disconnect();
                      reviewCheckoutObserver.observe(luggageFragment, {
                          childList: true,
                          subtree: true
                      });
                  }
              }

              function tryInjectInsurance() {
                  const insuranceBanner = document.querySelector(SELECTORS.insuranceBanner);

                  if (!insuranceBanner) {
                      return;
                  }

                  injectInsuranceContainer(insuranceBanner);
              }

              function reviewCheckoutObserverCallback(mutations) {
                  for (const mutation of mutations) {
                      if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                          tryInjectInsurance();
                          return;
                      }
                  }
              }

              function toggleMainElementExperienceClass(addClass = true) {
                  const mainElement = document.querySelector("main");
                  mainElement?.classList.toggle("injectedInsuranceExperience", addClass);
              }

              function injectInsuranceContainer(insuranceBanner) {
                  if (!insuranceBanner) {
                      console.log("[AT] Insurance banner not found.");
                      return;
                  }

                  listenerToSubmitButton();

                  const insuranceInjectedAlreadyExists = document.querySelector(".injectedInsuranceWrapper");

                  if (insuranceInjectedAlreadyExists) {
                      console.log("[AT] Insurance injected already exists.");
                      return;
                  }

                  analyticsEvent("insurance_injected");

                  // Disconnect observers to avoid double injection or infinite loop
                  reviewCheckoutObserver.disconnect();

                  const insuranceElement = createInsuranceElement(insuranceBanner);
                  insuranceBanner.insertAdjacentElement("afterend", insuranceElement);
                  insuranceBanner.style.display = "none";

                  createAndAppendInsuranceModal();
                  addListenersToInjections();

                  // Reconnect observers
                  initReviewObserver();
              }

              function hasGoAndBackTrip() {
                  return document.querySelectorAll(SELECTORS.tripsList).length > 1;
              }

              function getBenefitsByTrip() {
                  return hasGoAndBackTrip()
                      ? BENEFITS_BY_TRIP.goAndBack
                      : BENEFITS_BY_TRIP.oneWay;
              }

              function appendBenefitsToList(listElement) {
                  if (!listElement) {
                      return;
                  }

                  const benefits = getBenefitsByTrip();

                  benefits.forEach((text) => {
                      const li = document.createElement("li");
                      li.className = "injectedInsuranceWrapper__benefits__item";
                      li.innerHTML = NATIVE_BENEFIT_ICON;

                      const span = document.createElement("span");
                      span.textContent = text;
                      li.appendChild(span);

                      listElement.appendChild(li);
                  });
              }

              function listenerToSubmitButton() {
                  const submitButton = document.querySelector(SELECTORS.buttonSubmitCheckout);
                  submitButton?.removeEventListener("click", handleSubmitButton);
                  submitButton?.addEventListener("click", handleSubmitButton);
              }

              function handleSubmitButton(event) {
                  if (event.isInsuranceChecked) {
                      console.log("[AT] Submit button already clicked.");
                      return;
                  }

                  const typeEvent = event.target.textContent;
                  if (typeEvent == "Próximo voo" || typeEvent == "Próximo vooPróximo voo") {
                      return;
                  }

                  console.log("[AT] Submit button clicked.", typeEvent);

                  const userWantsInsurance = document.querySelector("input#insurance_yes")?.checked;

                  if (!userWantsInsurance) {
                      return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();

                  const addedInsurance = document.querySelector(SELECTORS.buttonAdderInsurance);
                  addedInsurance.click();

                  waitUntilSubmitButtonRefresh();
              }

              function waitUntilSubmitButtonRefresh() {
                  const submitButton = document.querySelector(SELECTORS.buttonSubmitCheckout);

                  if (!submitButton) {
                      console.log("[AT] Submit button not found yet, wait...");
                      requestAnimationFrame(waitUntilSubmitButtonRefresh);
                      return;
                  }

                  const newEvent = new MouseEvent("click", {
                      bubbles: true,
                      cancelable: true,
                      view: window
                  });

                  newEvent.isInsuranceChecked = true;
                  submitButton.dispatchEvent(newEvent);
              }

              function createInsuranceElement(insuranceBanner) {
                  const div = document.createElement("div");
                  div.classList.add("injectedInsuranceWrapper");

                  div.innerHTML = `
                <div class="injectedInsuranceWrapper__header">
                    <h3 class="injectedInsuranceWrapper__header__title">
                        <svg fill=none height=36 viewBox="0 0 30 36"width=30 xmlns=http://www.w3.org/2000/svg><g clip-path=url(#clip0_3119_440)><path d="M15.5195 0.164664C15.2083 -0.054888 14.7927 -0.054888 14.4816 0.164664C10.1933 3.19091 5.96358 4.66364 1.78126 4.66364C1.3639 4.66364 1.0013 4.95057 0.905358 5.35675C-0.124216 9.71561 -0.278162 14.0895 0.456304 18.1599C1.87434 26.0185 6.60921 32.738 14.668 35.9365C14.8812 36.0212 15.1188 36.0212 15.332 35.9365C23.3908 32.738 28.1257 26.0185 29.5437 18.1599C30.2782 14.0895 30.1242 9.71561 29.0946 5.35675C28.9987 4.95057 28.6361 4.66364 28.2188 4.66364C24.0365 4.66364 19.8078 3.19094 15.5195 0.164664Z"fill=#BAEAF2 /></g><g clip-path=url(#clip1_3119_440)><path d="M29.5517 18.1602C28.133 26.0187 23.3951 32.738 15.3322 35.9366C15.1188 36.0212 14.8812 36.0212 14.6678 35.9366C6.60473 32.738 1.86705 26.0188 0.448256 18.1602C0.438648 18.107 0.431179 18.0534 0.421875 18H29.5781C29.5688 18.0534 29.5613 18.107 29.5517 18.1602Z"fill=#88DAE9 /></g><g clip-path=url(#clip2_3119_440)><path d="M14.4816 0.164664C14.7927 -0.054888 15.2083 -0.054888 15.5195 0.164664C19.8078 3.19094 24.0365 4.66364 28.2188 4.66364C28.6361 4.66364 28.9987 4.95057 29.0946 5.35675C30.1242 9.71561 30.2782 14.0895 29.5437 18.1599C28.1257 26.0185 23.3908 32.738 15.332 35.9365C15.1188 36.0212 14.8812 36.0212 14.668 35.9365C6.60921 32.738 1.87434 26.0185 0.456304 18.1599C-0.278162 14.0895 -0.124216 9.71561 0.905358 5.35675C1.0013 4.95057 1.3639 4.66364 1.78126 4.66364C5.96358 4.66364 10.1933 3.19091 14.4816 0.164664ZM2.50408 6.45034C1.66685 10.36 1.57832 14.2414 2.2277 17.8402C3.52905 25.0522 7.78873 31.136 15 34.1287C22.2113 31.136 26.4709 25.0522 27.7723 17.8402C28.4217 14.2414 28.3332 10.36 27.4959 6.45034C23.2882 6.29553 19.1194 4.78996 15.0005 1.99452C10.8815 4.78999 6.71189 6.29553 2.50408 6.45034Z"fill=#60BECF clip-rule=evenodd fill-rule=evenodd /></g><defs><clipPath id=clip0_3119_440><rect fill=white height=36 width=30 /></clipPath><clipPath id=clip1_3119_440><rect fill=white height=18 width=29.1562 transform="translate(0.421875 18)"/></clipPath><clipPath id=clip2_3119_440><rect fill=white height=36 width=30 /></clipPath></defs></svg>Deseja obter o Seguro Viagem?
                    </h3>
                    <button class="injectedInsuranceWrapper__header__detailsCta">Ver detalhes</button>
                </div>
                <form class="injectedInsuranceWrapper__form">
                    <div class="injectedInsuranceWrapper__form__wrapper">
                        <input type="radio" name="insurances" id="insurance_yes">
                        <label for="insurance_yes" class="injectedInsuranceWrapper__label">
                            <span class="injectedInsuranceWrapper__label__badge">Recomendado</span>
                            <div class="injectedInsuranceWrapper__label__header">
                                <div class="injectedInsuranceWrapper__label__price">
                                    <span>A partir de:</span>
                                    <h4 class="injectedInsuranceWrapper__label__price__value">Preço N/D <span>/viajante</span></h4>
                                </div>
                                <div class="injectedInsuranceWrapper__label__fakedRadio">
                                    <div class="injectedInsuranceWrapper__label__fakedRadio__radio"></div> Sim, quero o seguro!
                                </div>
                            </div>
                            <div class="injectedInsuranceWrapper__label__content">
                                <ul class="injectedInsuranceWrapper__benefits"></ul>
                            </div>
                        </label>
                    </div>
                    <div class="injectedInsuranceWrapper__form__wrapper">
                        <input type="radio" name="insurances" id="insurance_no" checked>
                        <label for="insurance_no" class="injectedInsuranceWrapper__label">
                            <div class="injectedInsuranceWrapper__label__header">
                                <h4 class="injectedInsuranceWrapper__label__title">Sem Seguro Viagem</h4>
                                <div class="injectedInsuranceWrapper__label__fakedRadio">
                                    <div class="injectedInsuranceWrapper__label__fakedRadio__radio"></div> Não, viajarei desprotegido
                                </div>
                            </div>
                            <div class="injectedInsuranceWrapper__label__content">
                                <h5 class="injectedInsuranceWrapper__label__subtitle">Prefere viajar sem seguro?</h5>
                                <p class="injectedInsuranceWrapper__label__description">Proteção nunca é demais! Garanta o seguro viagem para uma experiência mais tranquila.</p>
                            </div>
                        </label>
                    </div>
                </form>
            `;

                  appendBenefitsToList(div.querySelector(".injectedInsuranceWrapper__benefits"));

                  const insurancePrice = document.querySelector(SELECTORS.insurancePrice);

                  if (insurancePrice) {
                      const priceElementDiv = div.querySelector(".injectedInsuranceWrapper__label__price__value");

                      if (priceElementDiv) {
                          priceElementDiv.innerHTML = insurancePrice.textContent + " <span>/viajante</span>";
                      }
                  }

                  return div;
              }

              function createAndAppendInsuranceModal() {
                  const div = document.createElement("div");
                  div.classList.add("injectedInsuranceModal");

                  div.innerHTML = `
                <div class="injectedInsuranceModal__wrapper">
                    <div class="injectedInsuranceModal__header">
                        <button class="injectedInsuranceModal__close" title="Fechar">
                            <svg fill=none height=24 viewBox="0 0 24 24"width=24 xmlns=http://www.w3.org/2000/svg><g clip-path=url(#clip0_3095_34380)><g clip-path=url(#clip1_3095_34380)><path d="M20.2454 5.56379L13.6603 12.0002L20.2455 18.4364L18.5853 20.0591L12 13.6227L5.41473 20.0591L3.75439 18.4363L10.3398 12.0002L3.75454 5.56379L5.41473 3.94116L12 10.3775L18.5852 3.94116L20.2454 5.56379Z"fill=#606060 /></g></g><defs><clipPath id=clip0_3095_34380><rect fill=white height=24 width=24 /></clipPath><clipPath id=clip1_3095_34380><rect fill=white height=24 width=24 /></clipPath></defs></svg>
                        </button>
                        <h3 class="injectedInsuranceModal__title">Sobre o Seguro Viagem</h3>
                    </div>
                    <div class="injectedInsuranceModal__content">
                        <div class="injectedInsuranceModal__info">
                            <p>Mesmo viajando pelo Brasil, emergências podem acontecer e o seguro viagem traz mais tranquilidade para você.</p>
                            <p>Além de despesas médicas, que podem não estar cobertas pelo seu plano de saúde fora da sua região de residência, o seguro viagem engloba coberturas para perda de bagagem, cancelamento de viagem e até mesmo morte acidental!</p>
                        </div>
                        <div class="injectedInsuranceModal__benefitsWrapper">
                            <h4 class="injectedInsuranceModal__benefits_title">Itens inclusos na sua contratação</h4>
                            <ul class="injectedInsuranceModal__benefits">
                                <li class="injectedInsuranceModal__benefits__item injectedInsuranceModal__benefits__item--highlight">Cobertura Covid-19</li>
                                <li class="injectedInsuranceModal__benefits__item">Bagagem extraviada</li>
                                <li class="injectedInsuranceModal__benefits__item">Hospital e odontológico</li>
                                <li class="injectedInsuranceModal__benefits__item">Perda de documentos</li>
                                <li class="injectedInsuranceModal__benefits__item">Mensagens Urgentes</li>
                                <li class="injectedInsuranceModal__benefits__item">Repatriação Funerária</li>
                            </ul>
                            <a href="https://www.voeazul.com.br/br/pt/sua-viagem/seguro-viagem" target="_blank" class="injectedInsuranceModal__benefits__cta">Confira os tipos de cobertura</a>
                        </div>
                    </div>
                </div>
            `;

                  document.body.appendChild(div);
              }

              function addListenersToInjections() {
                  const insuranceInput = document.querySelectorAll("input[name=insurances]");

                  insuranceInput.forEach(input => {
                      input.addEventListener("click", () => {
                          const checkedInput = document.querySelector("input[name=insurances]:checked");
                          const isYesInput = checkedInput.id === "insurance_yes";

                          analyticsEvent(isYesInput ? "insurance_yes_selected" : "insurance_no_selected");
                      });
                  });

                  const detailsButton = document.querySelector(".injectedInsuranceWrapper__header__detailsCta");
                  detailsButton?.addEventListener("click", () => {
                      analyticsEvent("details_button_click");
                      const modalInsuranceDetails = document.querySelector(".injectedInsuranceModal");
                      modalInsuranceDetails.classList.add("show");
                  });

                  const closeButton = document.querySelector(".injectedInsuranceModal__close");
                  closeButton?.addEventListener("click", () => {
                      const modalInsuranceDetails = document.querySelector(".injectedInsuranceModal");
                      modalInsuranceDetails.classList.remove("show");
                  });
              }

              function disconnectObservers() {
                  mainCheckoutObserver.disconnect();
                  reviewCheckoutObserver.disconnect();
                  toggleMainElementExperienceClass(false);
              }

              function isOneCheckoutStep() {
                  const urlPath = getURLPath();
                  return CHECKOUT_URL_STEPS.some(step => urlPath.includes(step));
              }

              function isReviewStep() {
                  const urlPath = getURLPath();
                  return urlPath.includes("review");
              }

              function getURLPath() {
                  return window.location.pathname;
              }

              function injectCustomCSS() {
                  const style = document.createElement("style");

                  style.innerHTML = `
                .injectedInsuranceExperience .azul-page-fragment .modal-title__close {
                    display: none;
                }

                .injectedInsuranceWrapper {
                    border: solid 1px #C0C0C0;
                    padding: 24px 16px;
                    display: flex;
                    gap: 24px;
                    flex-direction: column;
                    border-radius: 10px;
                    max-width: 622px;
                    width: 100%;
                }

                .injectedInsuranceWrapper * {
                    font-family: "Arial", "Helvetica Neue", sans-serif;
                    line-height: normal;
                    box-sizing: border-box;
                }

                .injectedInsuranceWrapper h2,
                .injectedInsuranceWrapper h3,
                .injectedInsuranceWrapper h4,
                .injectedInsuranceWrapper h5,
                .injectedInsuranceWrapper h6,
                .injectedInsuranceWrapper p {
                    margin: 0;
                }

                .injectedInsuranceWrapper__header__title {
                    display: flex;
                    align-items: center;
                    color: #041E42;
                    font-size: 24px;
                    font-weight: 400;
                    gap: 16px;
                }

                .injectedInsuranceWrapper__header {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }

                .injectedInsuranceWrapper__header__detailsCta {
                    border: none;
                    background: transparent;
                    outline: none;
                    color: #026CB6;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 400;
                }

                .injectedInsuranceWrapper__form {
                    display: flex;
                    gap: 14px;
                    flex-wrap: wrap;
                }

                .injectedInsuranceWrapper__form__wrapper {
                    width: calc(50% - 7px);
                }
                
                .injectedInsuranceWrapper__label {
                    border-radius: 16px;
                    display: flex;
                    position: relative;
                    flex-direction: column;
                    height: 382px;
                    width: 100%;
                    cursor: pointer;
                }

                .injectedInsuranceWrapper__label__badge {
                    background-color: #041E42;
                    border-radius: 330px;
                    padding: 4px 12px;
                    position: absolute;
                    top: -11px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 12px;
                    text-align: center;
                    height: 22px;
                }

                .injectedInsuranceWrapper__label__price {
                    text-align: center;
                }

                .injectedInsuranceWrapper__label__header,
                .injectedInsuranceWrapper__label__content {
                    padding: 20px 10px;
                }

                .injectedInsuranceWrapper__label__header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    flex-grow: 1;
                    gap: 24px;
                }

                .injectedInsuranceWrapper__label[for="insurance_yes"] .injectedInsuranceWrapper__label__header {
                    border: solid 2px #BAEAF2;
                    background-color: #F0F9FF;
                    border-radius: 10px 10px 0px 0px;
                }

                .injectedInsuranceWrapper__label[for="insurance_yes"] .injectedInsuranceWrapper__label__content {
                    border: solid 2px #BAEAF2;
                    border-top: none;
                    border-radius: 0px 0px 10px 10px;
                }

                .injectedInsuranceWrapper__label[for="insurance_no"] .injectedInsuranceWrapper__label__header {
                    border: solid 2px #C0C0C0;
                    border-radius: 10px 10px 0px 0px;
                    padding: 21px 15px;
                    justify-content: flex-start;
                }

                .injectedInsuranceWrapper__label[for="insurance_no"] .injectedInsuranceWrapper__label__content {
                    background-color: #F5F5F5;
                    border: solid 2px #C0C0C0;
                    border-top: none;
                    border-radius: 0px 0px 10px 10px;
                    padding: 16px 15px;
                }

                .injectedInsuranceWrapper__label__price > span {
                    color: #041E42;
                    font-size: 11px;
                    font-weight: 400;
                    margin-bottom: 12px;
                    display: block;
                }

                .injectedInsuranceWrapper__label__price__value {
                    color: #041E42;
                    font-size: 32px;
                    font-weight: 700;
                }

                .injectedInsuranceWrapper__label__price__value span {
                    color: #606060;
                    font-size: 11px;
                    font-weight: 400;
                }

                .injectedInsuranceWrapper__label__fakedRadio {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #444444;
                    font-size: 15px;
                }

                .injectedInsuranceWrapper__label[for="insurance_yes"] .injectedInsuranceWrapper__label__fakedRadio {
                    color: #041E42;
                    font-size: 16px;
                }

                .injectedInsuranceWrapper__label__fakedRadio__radio {
                    height: 18px;
                    width: 18px;
                    border-radius: 100%;
                    border: solid 1px #606060;
                    position: relative;
                }

                input[name="insurances"] {
                    display: none;
                }

                input[name="insurances"]:checked + label .injectedInsuranceWrapper__label__fakedRadio__radio {
                    border-color: #026CB6;
                }

                input[name="insurances"]:checked + label .injectedInsuranceWrapper__label__fakedRadio__radio::before {
                    content: "";
                    height: 11px;
                    width: 11px;
                    background-color: #026CB6;
                    border-radius: 100%;
                    margin: auto;
                    display: block;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .injectedInsuranceWrapper__benefits {
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    list-style: none;
                }

                .injectedInsuranceWrapper__benefits__item {
                    font-size: 12px;
                    font-weight: 400;
                    display: flex;
                    gap: 7.5px;
                    align-items: center;
                    color: #212121;
                }

                .injectedInsuranceWrapper__benefits__item svg {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                }

                .injectedInsuranceWrapper__label__title {
                    color: #303030;
                    font-weight: 700;
                    font-size: 20px;
                    margin-bottom: 60px !important;
                }

                .injectedInsuranceWrapper__label__subtitle {
                    color: #212121;
                    font-weight: 700;
                    font-size: 16px;
                    margin-bottom: 16px !important;
                }

                .injectedInsuranceWrapper__label__description {
                    font-size: 14px;
                    color: #4B4B4B;
                    font-weight: 400;
                }

                /* ============ MODAL ============ */

                .injectedInsuranceModal__benefits__item::before {
                    content: url('data:image/svg+xml,<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(%23clip0_3095_34436)"><g clip-path="url(%23clip1_3095_34436)"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0544 8.98408H14.2783V8.27517C14.2783 7.69753 13.8114 7.22491 13.2406 7.22491H12.592H10.1791V4.36296H11.8136C11.9693 4.36296 12.073 4.46799 12.073 4.62553V7.19866H12.592V4.62553C12.592 4.17917 12.2547 3.83783 11.8136 3.83783H10.1791H9.66016H9.55641V3.60153C9.55641 3.02389 9.08936 2.55127 8.51856 2.55127H6.57273C6.00195 2.55127 5.53493 3.02389 5.53493 3.60153V3.83783H3.32961C2.88855 3.83783 2.55127 4.17917 2.55127 4.62553V17.0711C2.55127 17.5174 2.88855 17.8588 3.32961 17.8588H6.00195H11.8395H17.0804C17.5215 17.8588 17.8588 17.5174 17.8588 17.0711V9.77182C17.8328 9.32543 17.4956 8.98408 17.0544 8.98408ZM13.2406 7.75004C13.526 7.75004 13.7595 7.98635 13.7595 8.27517V8.85277H9.29695V8.27517C9.29695 7.98635 9.53047 7.75004 9.81587 7.75004H13.2406ZM6.10572 3.60153C6.10572 3.31271 6.33923 3.0764 6.62462 3.0764H8.57052C8.85592 3.0764 9.08936 3.31271 9.08936 3.60153V3.81158H6.10572V3.60153ZM9.6861 4.36296V7.19866C9.16726 7.25117 8.75208 7.69753 8.75208 8.22266V8.93161H6.00195C5.79438 8.93161 5.61277 9.01035 5.48305 9.14166V4.36296H9.6861ZM4.96415 17.3336H3.32961C3.17394 17.3336 3.07017 17.2286 3.07017 17.0711V4.62553C3.07017 4.46799 3.17394 4.36296 3.32961 4.36296H4.96415V17.3336ZM6.00195 17.3336C5.84628 17.3336 5.74249 17.2286 5.74249 17.0711V9.77182C5.74249 9.61423 5.84628 9.50921 6.00195 9.50921H7.63647V17.3599H6.00195V17.3336ZM14.927 17.3336H12.2028C12.0212 17.3336 11.8395 17.3336 11.8136 17.3336H10.1791H10.1272H9.66016H9.60828H8.10348V9.50921H14.8751V17.3336H14.927ZM17.3139 17.0711C17.3139 17.2286 17.2102 17.3336 17.0544 17.3336H15.4199V9.50921H17.0544C17.2102 9.50921 17.3139 9.61423 17.3139 9.77182V17.0711Z" fill="%23041E42"/></g></g><defs><clipPath id="clip0_3095_34436"><rect width="20.41" height="20.41" fill="white"/></clipPath><clipPath id="clip1_3095_34436"><rect width="20.41" height="20.41" fill="white"/></clipPath></defs></svg>');
                    font-size: 0px;
                }

                .injectedInsuranceModal__benefits__item.injectedInsuranceModal__benefits__item--highlight::before {
                    content: url('data:image/svg+xml,<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(%23clip0_3095_34408)"><g clip-path="url(%23clip1_3095_34408)"><path d="M14.6544 10.2025C13.7269 10.2025 12.8921 9.92427 12.2429 9.73877C11.9646 9.64602 11.5936 9.55327 11.4081 9.55327C11.2226 9.55327 10.7589 9.73877 10.5734 9.73877C9.92412 9.92427 9.08938 10.2025 8.16188 10.2025C7.97637 10.2025 7.79087 10.2025 7.60537 10.2025C7.51262 10.2025 7.41987 10.1098 7.32712 10.017C7.23437 9.92427 7.23438 9.83152 7.23438 9.64602C7.23438 9.46052 7.41987 9.27502 7.69813 9.27502C7.88363 9.27502 8.06912 9.27502 8.25462 9.27502C8.99662 9.27502 9.83137 8.99677 10.3879 8.81127C10.8516 8.62577 11.2226 8.53302 11.4081 8.53302C11.7791 8.53302 12.0574 8.62577 12.5211 8.71852C13.1704 8.99677 13.9124 9.27502 14.6544 9.27502C14.8399 9.27502 14.9326 9.27502 15.1181 9.27502C15.3964 9.27502 15.5819 9.46052 15.6746 9.64602C15.6746 9.73877 15.6746 9.92427 15.5819 10.017C15.4891 10.1098 15.3964 10.2025 15.3036 10.2025C15.1181 10.2025 14.8399 10.2025 14.6544 10.2025Z" fill="white"/><path d="M11.4081 12.7995C11.1298 12.7995 10.7588 12.7068 10.2951 12.5213C9.64583 12.3358 8.90383 12.0575 8.06908 12.0575C7.88358 12.0575 7.79083 12.0575 7.60533 12.0575C7.32708 12.0575 7.14158 11.872 7.04883 11.6865C7.04883 11.5938 7.04883 11.4083 7.14158 11.3155C7.23433 11.2228 7.32708 11.13 7.41983 11.13C7.60533 11.13 7.79083 11.13 7.97633 11.13C8.90383 11.13 9.73858 11.4083 10.3878 11.5938C10.6661 11.6865 11.0371 11.7793 11.2226 11.7793C11.4081 11.7793 11.7791 11.6865 12.0573 11.5938C12.7066 11.4083 13.6341 11.13 14.5616 11.13C14.7471 11.13 14.9326 11.13 15.1181 11.13C15.3963 11.13 15.5818 11.4083 15.4891 11.6865C15.4891 11.872 15.3036 12.0575 15.0253 12.0575C14.8398 12.0575 14.6543 12.0575 14.4688 12.0575C13.7268 12.0575 12.5211 12.5213 12.3356 12.614C12.0573 12.7068 11.6863 12.7995 11.4081 12.7995Z" fill="white"/><path d="M11.3156 17.437C9.27514 17.1587 5.65789 14.0052 5.19414 11.501C2.87539 9.18225 2.31889 6.95625 2.78264 5.65775C2.96814 5.10125 3.43189 4.823 3.89564 4.823C4.63764 4.823 5.37964 5.47225 5.93614 6.58525C6.02889 6.58525 6.12164 6.58525 6.21439 6.58525C7.51289 6.58525 8.44039 6.21425 9.55339 5.65775C10.2954 5.28675 10.8519 5.194 11.4084 5.194C11.9649 5.194 12.6141 5.3795 13.2634 5.65775C14.2836 6.1215 15.2111 6.58525 16.6024 6.58525C16.6951 6.58525 16.7879 6.58525 16.8806 6.58525C17.4371 5.3795 18.1791 4.823 18.8284 4.823C19.3849 4.823 19.9414 5.10125 20.1269 5.65775C20.5906 6.8635 19.8486 9.18225 17.5299 11.501C17.0661 14.0052 13.4489 17.1587 11.3156 17.437ZM6.02889 11.0372C6.02889 12.985 9.55339 16.2312 11.4084 16.5095C13.2634 16.2312 16.6951 12.985 16.6951 11.0372V7.6055H16.6024C15.0256 7.6055 13.9126 7.14175 12.8924 6.58525C12.3359 6.307 11.8721 6.21425 11.4084 6.21425C10.9446 6.21425 10.4809 6.307 9.92439 6.58525C8.81139 7.14175 7.69839 7.6055 6.21439 7.6055H6.12164L6.02889 11.0372ZM18.9211 5.7505C16.9734 5.7505 17.7154 10.1097 17.7154 10.1097C19.2921 8.25475 20.1269 5.7505 18.9211 5.7505ZM3.89564 5.7505C3.71014 5.7505 3.71014 5.936 3.61739 6.02875C3.33914 6.678 3.61739 8.25475 5.10139 10.1097V7.14175C4.63764 6.02875 4.08114 5.7505 3.89564 5.7505Z" fill="white"/></g></g><defs><clipPath id="clip0_3095_34408"><rect width="22.26" height="22.26" fill="white"/></clipPath><clipPath id="clip1_3095_34408"><rect width="22.26" height="22.26" fill="white"/></clipPath></defs></svg>')
                }
                
                .injectedInsuranceModal * {
                    font-family: "Helvetica Neue", "Arial", sans-serif;
                    line-height: normal;
                    box-sizing: border-box;
                }

                .injectedInsuranceModal.show {
                    display: flex;
                }

                .injectedInsuranceModal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                }

                .injectedInsuranceModal__wrapper {
                    background-color: #FFFFFF;
                    border: solid 1px #C0C0C0;
                    width: 523px;
                }

                .injectedInsuranceModal__header {
                    border-bottom: solid 1px #C0C0C0;
                    padding: 20px 16px;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .injectedInsuranceModal__close {
                    background: transparent;
                    padding: 0;
                    margin: 0;
                    border: none;
                    cursor: pointer;
                }

                .injectedInsuranceModal__title {
                    margin: 0;
                    color: #041E42;
                    font-weight: 300;
                    font-size: 16px;
                }

                .injectedInsuranceModal__content {
                    padding: 16px;
                }

                .injectedInsuranceModal__info {
                    border: 1px solid #EBEBEB;
                    box-shadow: 0px 1px 4px 0px #041E4229;
                    border-radius: 4px;
                    padding: 16px 24px;
                    margin-bottom: 30px;
                }

                .injectedInsuranceModal__info p {
                    font-size: 13px;
                    color: #041E42;
                    margin: 0;
                }

                .injectedInsuranceModal__info p:last-child {
                    margin-top: 14px;
                }

                .injectedInsuranceModal__benefits_title {
                    color: #606060;
                    font-size: 14px;
                    margin-bottom: 16px;
                }

                .injectedInsuranceModal__benefits {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 30px;
                }

                .injectedInsuranceModal__benefits__item {
                    border: 1px solid #C0C0C0;
                    border-radius: 4px;
                    width: calc(50% - 5px);
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    font-size: 14px;
                    color: #041E42;
                }

                .injectedInsuranceModal__benefits__item.injectedInsuranceModal__benefits__item--highlight {
                    background-color: #014E84;
                    color: #FFFFFF;
                }

                .injectedInsuranceModal__benefits__cta {
                    color: #026CB6;
                    font-weight: 400;
                    text-decoration: none;
                    cursor: pointer;
                    font-size: 14px;
                }
            `;

                  document.head.appendChild(style);
              }

              /**
               * Function to trigger an Adobe Analytics event.
               * @param {string} eventLabel - Label of the event to be triggered.
               */
              function analyticsEvent(eventLabel) {
                  if (eventLabel === undefined || !eventLabel) {
                      console.log("[AT] Missing parameters for analytics event.");
                      return;
                  }

                  const labelEvent = eventLabel + " " + experienceName;
                  console.log("[AT] ANALYTICS_TRIGGERED:", labelEvent);

                  // === Disparo Adobe Analytics ===
                  (function() {
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
