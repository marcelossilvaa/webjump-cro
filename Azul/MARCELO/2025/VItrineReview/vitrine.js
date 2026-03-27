(function () {
  const SELECTORS = {
    confirmTravellerButton: "button[aria-label='Ir para escolha de assentos']",
    responsibleForm: '#responsibleForm',
    invalidResponsibleFormLabel: '.css-fq66gi',
    invalidFormGroupResponsibleForm: '.css-1enaijg',
    loaderSeatStep: '.ReactModal__Overlay .loading',
    buttonSeatsClose: 'button.modal-title__close',
    priceFlight: '.css-1bpbsig .css-whun9p',
    bodyWithModalOpen: 'ReactModal__Body--open',
    servicesOptionsOnReviewStep: '.passenger-card__content button',
    addInsuranceButton: '.styles__InsuranceButtonContainer-sc-12knqgp-0.WGuua',
    goToPaymentButtonOnReviewStep: "button[aria-label='Ir para pagamento']",
    wrapperShowcaseProducts: '.showcaseProductsWrapper_injected',
  };

  const CLASS_WRAPPER_SHOWCASE_PRODUCTS = 'showcaseProductsWrapper_injected';

  const BAGAGEM_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.9733 5.35362C10.8402 5.35362 10.7322 5.46162 10.7322 5.59469V6.47862H9.92865V5.59469C9.92865 5.01869 10.3973 4.55005 10.9733 4.55005H14.0269C14.6029 4.55005 15.0715 5.01869 15.0715 5.59469V6.47862H14.2679V5.59469C14.2679 5.46162 14.1599 5.35362 14.0269 5.35362H10.9733Z" fill="#169BD6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.0221 7.12177C20.8372 7.12177 21.5 7.78519 21.5 8.60162V17.2127C21.5 18.0291 20.8372 18.6932 20.0221 18.6932H4.97729C4.16214 18.6932 3.5 18.0291 3.5 17.2127V8.60162C3.5 7.78519 4.16214 7.12177 4.97729 7.12177H20.0221ZM18.0447 17.8896H17.2411V7.92531H18.0447V17.8896ZM7.75897 17.8896H6.9554V7.92531H7.75897V17.8896Z" fill="#169BD6"/>
            <path d="M7.1161 20.3003C7.02738 20.3003 6.95538 20.2283 6.95538 20.1396V19.4967C6.95538 19.408 7.02738 19.336 7.1161 19.336H7.59824C7.68695 19.336 7.75895 19.408 7.75895 19.4967V20.1396C7.75895 20.2283 7.68695 20.3003 7.59824 20.3003H7.1161Z" fill="#169BD6"/>
            <path d="M17.2411 20.1396C17.2411 20.2283 17.3132 20.3003 17.4019 20.3003H17.884C17.9727 20.3003 18.0447 20.2283 18.0447 20.1396V19.4967C18.0447 19.408 17.9727 19.336 17.884 19.336H17.4019C17.3132 19.336 17.2411 19.408 17.2411 19.4967V20.1396Z" fill="#169BD6"/>
        </svg>
    `;

  const ASSENTO_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.49978 16.3498H3C3 18.8351 4.49978 21.6 12 21.6C19.4996 21.6 21 18.8351 21 16.3498H19.4996C19.4996 17.6509 15.8828 18.5998 12 18.5998C8.1165 18.5998 4.49978 17.6529 4.49978 16.3498ZM5.99945 6.59967V15.5997C5.99945 16.4277 8.27131 17.1001 11.9999 17.1001C15.7278 17.1001 17.9997 16.4277 17.9997 15.5997V6.59967C17.9997 5.7736 18.6721 5.09988 19.4994 5.09988H20.2497C20.2497 4.27124 19.5785 3.6001 18.7499 3.6001H5.24988C4.4206 3.6001 3.74945 4.27124 3.74945 5.09988H4.49967C5.32702 5.09988 5.99945 5.77231 5.99945 6.59967ZM3 14.8495H4.49978V6.59971H3V14.8495ZM19.5002 14.8499H21V6.60011H19.5002V14.8499Z" fill="#169BD6"/>
        </svg>
    `;

  const SEGURO_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.51242 11.6362V9.55892C4.51242 8.69366 4.50937 7.82841 4.50329 6.96315C4.49333 6.90014 4.50617 6.83568 4.53955 6.78106C4.57294 6.72643 4.62475 6.68511 4.68593 6.66433C7.06514 5.62747 9.44252 4.5864 11.8181 3.54114C11.8718 3.51425 11.9313 3.50024 11.9916 3.50024C12.0519 3.50024 12.1113 3.51425 12.1651 3.54114C14.548 4.5936 16.9314 5.63827 19.3155 6.67514C19.3734 6.69034 19.4239 6.72568 19.4574 6.77465C19.491 6.82362 19.5055 6.8829 19.4981 6.94155C19.4981 8.54545 19.4981 10.1476 19.489 11.7515C19.4863 12.2765 19.4436 12.8006 19.3612 13.3194C19.0937 14.9696 18.4237 16.5313 17.4087 17.87C16.112 19.5928 14.4536 20.824 12.3532 21.4469C12.1263 21.518 11.8825 21.518 11.6555 21.4469C9.71787 20.8735 8.01568 19.7071 6.79544 18.1167C5.30786 16.2758 4.50245 13.9896 4.51242 11.6362ZM5.79091 7.89921V10.0593H5.78178V11.7803C5.77294 13.734 6.44112 15.6322 7.67577 17.1608C8.69031 18.4832 10.1061 19.4523 11.7176 19.9276C11.906 19.9866 12.1083 19.9866 12.2966 19.9276C13.9914 19.4222 15.4685 18.3777 16.4973 16.9574C17.3406 15.8453 17.8971 14.5481 18.1192 13.1771C18.1881 12.7466 18.2241 12.3115 18.227 11.8757C18.2355 10.9887 18.2326 10.101 18.2298 9.21356C18.2284 8.76993 18.227 8.32637 18.227 7.88301C18.2332 7.83477 18.2218 7.78591 18.1946 7.74529C18.1675 7.70467 18.1265 7.67498 18.079 7.6616C16.0968 6.79754 14.1175 5.93049 12.1414 5.06043C12.0969 5.03829 12.0478 5.02675 11.998 5.02675C11.9482 5.02675 11.8991 5.03829 11.8546 5.06043C9.88208 5.92809 7.9132 6.79154 5.94798 7.6508C5.89604 7.66693 5.85166 7.70084 5.82286 7.74639C5.79406 7.79195 5.78273 7.84615 5.79091 7.89921ZM12.0001 12.5715V6.16681C11.9595 6.16693 11.9194 6.1764 11.8823 6.19462L7.33975 8.41977C7.30344 8.43386 7.27261 8.46123 7.25241 8.49734C7.2322 8.53345 7.22384 8.5761 7.22871 8.61818V11.9559C7.22871 12.1172 7.23376 12.2786 7.24554 12.438C7.25744 12.6319 7.27822 12.825 7.30779 13.0166C7.47901 14.1903 7.90625 15.3007 8.55278 16.2523C9.34011 17.4673 10.4699 18.3611 11.7662 18.7945C11.8389 18.8186 11.9141 18.8317 11.99 18.8335V12.5715H12.0001Z" fill="#169BD6"/>
        </svg>
    `;

  const FIXED_SECONDARY_PRODUCTS = [
    {
      name: 'Bagagem despachada',
      icon: BAGAGEM_ICON,
      identifier: 'Bagagem despachada',
      description: 'Adquira já e viaje sem preocupações.',
      selectorTriggerClick:
        "button[aria-label='Para gerenciar as bagagens dos viajantes, selecionar']",
      image: 'https://i.imgur.com/8iLCao8.png',
      analyticsLabel: 'Vitrine - Bagagens',
      isLuggage: true,
    },
    {
      name: 'Assento antecipado',
      icon: ASSENTO_ICON,
      identifier: 'Assento antecipado',
      description: 'Assentos a partir de R$49,90',
      selectorTriggerClick:
        "button[aria-label='Para gerenciar os assentos dos viajantes, selecionar']",
      image: 'https://i.imgur.com/oejCRcw.png',
      analyticsLabel: 'Vitrine - Assentos',
      isLuggage: false,
    },
  ];

  const OPTIONAL_SECONDARY_PRODUCTS = [
    {
      name: 'Seguro viagem',
      icon: SEGURO_ICON,
      identifier: 'Seguro viagem',
      description: 'Coberturas para você evitar contratempos!',
      image: 'https://i.imgur.com/Y1cwxpb.jpeg',
      analyticsLabel: 'Vitrine - Seguro',
      isInsurance: true,
    },
  ];

  const checkIfDomReady = () => {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

    if (isReady) {
      initShowcasePreBuy();
    } else {
      document.addEventListener('DOMContentLoaded', initShowcasePreBuy);
    }
  };

  function initShowcasePreBuy() {
    console.log('[AT] Showcase Pre-Buy: init');

    observerFormStepsToSkipToReview();
    injectCustomStyles();

    function observerFormStepsToSkipToReview() {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
            const travellerButon = document.querySelector(SELECTORS.confirmTravellerButton);

            if (travellerButon) {
              // Traveller step, next is the review step
              travellerButon.textContent = 'Ir para revisão';

              const formTravellerResponsible = document.querySelector(SELECTORS.responsibleForm);

              formTravellerResponsible.addEventListener('submit', () => {
                const hasInvalidInputs =
                  document.querySelector(SELECTORS.invalidResponsibleFormLabel) ||
                  document.querySelector(SELECTORS.invalidFormGroupResponsibleForm);

                if (hasInvalidInputs) {
                  console.log('FORMULÁRIO INVALIDO');
                  return;
                }

                console.log('FORMULÁRIO ENVIADO');

                createLoader();
                waitForSeatsModalOpen();
              });
            } else {
              console.log('[AT] Not in traveller step.');
              console.log('travellerButon', travellerButon);
            }
          }
        }
      });

      const mainElement = document.querySelector('main');

      if (!mainElement) {
        console.log('[AT] Main element not found.');
        return;
      }

      observer.observe(mainElement, { childList: true });
    }

    function waitForSeatsModalOpen() {
      console.log('[AT] Waiting for seats modal to open.');
      const modalSeatsIsLoading = document.querySelector(SELECTORS.loaderSeatStep);

      if (modalSeatsIsLoading && isReviewStep() && isStepForAirplaneSeats()) {
        skipSteps();
        return;
      }

      requestAnimationFrame(waitForSeatsModalOpen);
    }

    function skipSteps() {
      console.log('SKIP STEPS');

      const intervalToCloseSeatsModal = setInterval(() => {
        const modalSeatsIsLoading = document.querySelector(SELECTORS.loaderSeatStep);
        const buttonSeatsClose = document.querySelector(SELECTORS.buttonSeatsClose);

        if (!modalSeatsIsLoading && buttonSeatsClose) {
          clearInterval(intervalToCloseSeatsModal);
          analyticsEvent('Redirecionamento para central de revisão');
          buttonSeatsClose.click();
        }
      }, 100);

      const intervalToWaitForReviewPageIsReady = setInterval(() => {
        if (!isStepForAirplaneSeats()) {
          clearInterval(intervalToWaitForReviewPageIsReady);
          addTrackingToNativeProducts();
          // appendFixedShowcaseProducts();
          removeLoader();
        }
      }, 100);

      // Error treatment, remove loader in case of luggage info error
      setTimeout(() => {
        removeLoader();
      }, 60000);

      console.log('[AT] Steps skipped.');
    }

    function appendInsuranceOnShowcase() {
      const targetElementToInjectShowcase = document.querySelector(
        SELECTORS.goToPaymentButtonOnReviewStep
      );

      if (!targetElementToInjectShowcase) {
        console.log('[AT] Target element to inject showcase not found.');
        return;
      }

      const wrapperShowcaseProducts = document.createElement('div');
      wrapperShowcaseProducts.className = CLASS_WRAPPER_SHOWCASE_PRODUCTS;
      targetElementToInjectShowcase.insertAdjacentElement('beforebegin', wrapperShowcaseProducts);

      const product = OPTIONAL_SECONDARY_PRODUCTS[0];
      const addInsuranceButton = document.querySelector(SELECTORS.addInsuranceButton);

      if (addInsuranceButton) {
        product.buttonTarget = addInsuranceButton;
        const productItem = createProductItem(product);
        wrapperShowcaseProducts.appendChild(productItem);
      } else {
        console.log('[AT] Add insurance button not found.');
      }
    }

    // function appendFixedShowcaseProducts() {
    //     const targetElementToInjectShowcase = document.querySelector(SELECTORS.goToPaymentButtonOnReviewStep);

    //     if(!targetElementToInjectShowcase) {
    //         console.log("[AT] Target element to inject showcase not found.");
    //         return;
    //     }

    //     const wrapperShowcaseProducts = document.createElement("div");
    //     wrapperShowcaseProducts.className = CLASS_WRAPPER_SHOWCASE_PRODUCTS;
    //     targetElementToInjectShowcase.insertAdjacentElement("beforebegin", wrapperShowcaseProducts);

    //     FIXED_SECONDARY_PRODUCTS.forEach(product => {
    //         const [seatsButton, luggageButton] = getSeatsAndLuggageButtons();

    //         if(product.isLuggage) {
    //             product.buttonTarget = luggageButton;
    //         } else {
    //             product.buttonTarget = seatsButton;
    //         }

    //         if(product.buttonTarget) {
    //             const productItem = createProductItem(product);
    //             const wrapperShowcaseProducts = document.querySelector(SELECTORS.wrapperShowcaseProducts);

    //             if(!wrapperShowcaseProducts.contains(productItem)) {
    //                 wrapperShowcaseProducts.appendChild(productItem);
    //             } else {
    //                 console.log("[AT] Showcase products wrapper not found or product already appended.", product.name);
    //             }
    //         } else {
    //             console.log("[AT] Button target not found for product: ", product.name);
    //             return;
    //         }
    //     });
    // }

    function createProductItem(product) {
      const itemElement = document.createElement('div');
      itemElement.className = 'injectShowcaseSecondaryProductsWrapper__wrapper_item';

      itemElement.innerHTML = `
                <div class="injectShowcaseSecondaryProductsWrapper__item__image" style="background-image: url('[REPLACE_IMAGE]');"></div>
                <div class="injectShowcaseSecondaryProductsWrapper__item__infos">
                    <div class="injectShowcaseSecondaryProductsWrapper__item__header">
                        [REPLACE_ICON]
                        <h4 class="injectShowcaseSecondaryProductsWrapper__item__header__title">[REPLACE_NAME]</h4>
                    </div>
                    <p class="injectShowcaseSecondaryProductsWrapper__item__description">[REPLACE_DESCRIPTION]</p>
                    <button class="injectShowcaseSecondaryProductsWrapper__item__button">Adicionar serviço</button>
                </div>
            `;

      itemElement.innerHTML = itemElement.innerHTML.replace('[REPLACE_IMAGE]', product.image);
      itemElement.innerHTML = itemElement.innerHTML.replace('[REPLACE_ICON]', product.icon);
      itemElement.innerHTML = itemElement.innerHTML.replace('[REPLACE_NAME]', product.name);
      itemElement.innerHTML = itemElement.innerHTML.replace(
        '[REPLACE_DESCRIPTION]',
        product.description
      );

      itemElement
        .querySelector('.injectShowcaseSecondaryProductsWrapper__item__button')
        .addEventListener('click', () => {
          analyticsEvent(product.analyticsLabel);

          const isTouchDevice =
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0;
          const eventTriggerShowcaseProducts = isTouchDevice
            ? new TouchEvent('touchstart', { bubbles: true })
            : new MouseEvent('click', { bubbles: true });

          eventTriggerShowcaseProducts.simulatedInjected = true;
          product.buttonTarget.dispatchEvent(eventTriggerShowcaseProducts);
        });

      return itemElement;
    }

    function addTrackingToNativeProducts() {
      const [seatsButton, luggageButton] = getSeatsAndLuggageButtons();

      seatsButton?.addEventListener('click', () => {
        analyticsEvent('Gerenciamento de assentos');
      });

      luggageButton?.addEventListener('click', () => {
        analyticsEvent('Gerenciamento de bagagens');
      });

      const addInsuranceButton = document.querySelector(SELECTORS.addInsuranceButton);

      if (addInsuranceButton) {
        addInsuranceButton?.addEventListener('click', (event) => {
          if (event?.simulatedInjected) {
            return;
          }

          analyticsEvent('Nativo - Adicionar seguro');
        });

        appendInsuranceOnShowcase();
      } else {
        const maximumTries = 50;
        let tries = 0;

        const intervalToShowAddInsuranceButton = setInterval(() => {
          tries++;

          const addInsuranceButton = document.querySelector(SELECTORS.addInsuranceButton);

          console.log('PROCURANDO BOTÃO DO SEGURO');

          if (addInsuranceButton) {
            clearInterval(intervalToShowAddInsuranceButton);

            console.log('BOTÃO DO SEGURO ENCONTRADO');

            addInsuranceButton?.addEventListener('click', (event) => {
              if (event?.simulatedInjected) {
                return;
              }

              analyticsEvent('Nativo - Adicionar seguro');
            });

            appendInsuranceOnShowcase();

            return;
          }

          if (tries >= maximumTries) {
            clearInterval(intervalToShowAddInsuranceButton);
          }
        }, 100);
      }
    }

    function getSeatsAndLuggageButtons() {
      const buttonsServices = document.querySelectorAll(SELECTORS.servicesOptionsOnReviewStep);

      const seatsButton = buttonsServices[0];
      const luggageButton = buttonsServices[1];

      return [seatsButton, luggageButton];
    }

    function removeLoader() {
      const loader = document.querySelector('.skipStepsInject__loader');

      if (loader) {
        loader.remove();
        document.body.style.overflow = 'auto';
      }
    }

    function createLoader() {
      const loader = document.createElement('div');
      loader.classList.add('skipStepsInject__loader');

      const loaderLoading = document.createElement('div');
      loaderLoading.classList.add('skipStepsInject__loader-loading');

      loader.appendChild(loaderLoading);
      loader.innerHTML += `<h3>Você será redirecionado para a página de revisão...</h3>`;

      document.body.style.overflow = 'hidden';
      document.body.appendChild(loader);
    }

    function isReviewStep() {
      const currentUrl = window.location.pathname;
      const targetUrl = '/review';

      return currentUrl.includes(targetUrl);
    }

    function isStepForAirplaneSeats() {
      return document.body.classList.contains(SELECTORS.bodyWithModalOpen) && isReviewStep();
    }

    function analyticsEvent(eventLabel) {
      if (eventLabel === undefined || !eventLabel) {
        console.log('[AT] Missing parameters for analytics event.');
        return;
      }

      const labelEvent = 'AT_vitrine_pre_compra ' + eventLabel;

      console.log('[AT] Analytics event triggered:', labelEvent);

      // === Disparo Adobe Analytics (cópia/cole e ajuste as strings) ===
      (function () {
        var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
        if (!s || typeof s.tl !== 'function') return;

        // informe aqui seu evento e as eVars/props que quiser
        s.linkTrackVars = 'events,eVar82'; // listar todas as variáveis que serão enviadas
        s.linkTrackEvents = 'event90'; // código do event
        s.events = 'event90'; // mesmo código do event
        s.eVar82 = labelEvent; // valor da eVar82 (ex: "native" ou "floating")

        // dispara o link (o = custom link, d = download, e = exit)
        s.tl(true, 'o', 'target_activity_action');
      })();
    }

    function injectCustomStyles() {
      const style = document.createElement('style');

      style.innerHTML = `
                .skipStepsInject__loader {
                    align-items: center;
                    background: #041e42;
                    background-image: url('https://www.voeazul.com.br/content/dam/azul-airlines/wallet/payment/splash.svg');
                    background-size: cover;
                    background-position: center center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 16px;
                    position: fixed;
                    top: 64px;
                    width: 100%;
                    z-index: 2001;
                }
                
                .skipStepsInject__loader h3 {
                    font-family: "Helvetica Neue", Arial;
                    font-weight: 300;
                    font-size: 24px;
                    line-height: 29px;
                    text-align: center;
                    margin: 16px 0px 0px;
                    color: #FFFFFF;
                }

                .skipStepsInject__loader-loading {
                    position: relative;
                    border-radius: 50%;
                    mask: radial-gradient(farthest-side, rgba(0, 0, 0, 0) calc(100% - 1px), rgb(0, 0, 0) 0px);
                    animation: 0.8s linear 0s infinite normal none running injectRotate;
                    width: 48px;
                    height: 48px;
                    background: conic-gradient(rgba(255, 255, 255, 0) 10%, rgb(255, 255, 255));
                }

                @media screen and (max-width: 1023px) {
                    .skipStepsInject__loader {
                        height: 100dvh;
                        top: 0px;
                    }
                }

                @media screen and (min-width: 1024px) {
                    .skipStepsInject__loader {
                        height: calc(-64px + 100dvh);
                    }
                }

                @keyframes injectRotate {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                .injectShowcaseSecondaryProductsWrapper__wrapper_item {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: 150px;
                    border: solid 1px #C0C0C0;
                    border-radius: 8px;
                    flex-shrink: 0;
                    box-sizing: border-box;
                    min-height: unset;
                }

                .injectShowcaseSecondaryProductsWrapper__item__image {
                    width: 200px;
                    height: 150px;
                    border-radius: 8px 0px 0px 8px;
                    background-position: top;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-image: url('https://www.voeazul.com.br/content/dam/azul/voe-azul/todas-as-lp/lp-promo%C3%A7%C3%A3o-azv/Resort%20-%20Caldas%20Novas.png');
                    flex-shrink: 0;
                }

                .injectShowcaseSecondaryProductsWrapper__item__header__icon {
                    height: 24px;
                    width: 24px;
                }

                .injectShowcaseSecondaryProductsWrapper__item__infos {
                    background-color: #041E42;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex-grow: 1;
                    border-radius: 0px 8px 8px 0px;
                    height: 150px;
                    color: #FFFFFF;
                    text-align: left;
                }

                .injectShowcaseSecondaryProductsWrapper__item__description {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 15px;
                    line-height: 20px;
                    color: #FFFFFF;
                    text-align: left;
                }

                .injectShowcaseSecondaryProductsWrapper__item__button {
                    background-color: transparent;
                    border: solid 1px #FFFFFF;
                    border-radius: 4px;
                    color: #FFFFFF;
                    cursor: pointer;
                    width: 100%;
                    min-height: 32px;
                    padding: 8px;
                    margin-top: auto;
                    font-size: 15px;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                }

                .injectShowcaseSecondaryProductsWrapper__item__header {
                    align-items: center;
                    display: flex;
                    gap: 8px;
                }

                .injectShowcaseSecondaryProductsWrapper__item__header__title {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 600;
                    font-size: 17px;
                    line-height: 17px;
                    text-align: left;
                }

                .showcaseProductsWrapper_injected {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 80px;
                }

                @media screen and (min-width: 1024px) {
                    .showcaseProductsWrapper_injected {
                        margin-bottom: 0px;
                    }
                }

                @media screen and (max-width: 575px) {
                    .injectShowcaseSecondaryProductsWrapper__wrapper_item {
                        flex-direction: column;
                        height: auto;
                    }

                    .injectShowcaseSecondaryProductsWrapper__item__image {
                        width: 100%;
                        height: 100px;
                        border-radius: 8px 8px 0px 0px;
                    }

                    .injectShowcaseSecondaryProductsWrapper__item__infos {
                        height: auto;
                        border-radius: 0px 0px 8px 8px;
                    }
                }
            `;

      document.head.appendChild(style);
    }
  }

  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/selecao-voo';

    return currentUrl.includes(targetTestUrl);
  }

  if (window.showcasePreBuy || !onTargetPage()) {
    console.log('[AT] Page is not a pre-buy page OR script already executed.');
    return;
  }

  window.showcasePreBuy = true;
  checkIfDomReady();
})();
