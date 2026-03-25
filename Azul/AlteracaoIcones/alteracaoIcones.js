(function () {
  console.log('[AT] Tariff Icons: Script initialized.');

  const SELECTORS = {
    flightsWrapper: '.AzulPage .availability',
    flightsTrips: '.AzulPage .availability .trips',
    flightCard: '.card-list .flight-card',
    flightTypeLabel: '.fare-price .promotional',
    flightTariffs: '.fare-item',
    soldOutTariffButton: "button[aria-label='Tarifa esgotada']",
    selectTariffButton: "button[aria-label='Selecionar tarifa']",
    tierLabelOnHeader: '.css-surmsm',
  };

  const domIsReadyValidator = SELECTORS.flightsWrapper;

  const BODY_CLASS = 'at-tariff-icons';
  const TARIFF_CLASS = 'tariff-icons-injected';

  const TARIFF_BENEFITS = {
    azul: {
      checkedBags: false,
      tariff: 'Azul',
      marcacaoAntecipadaAssentos: false,
      antecipacaoVoo: false,
    },
    maisAzul: {
      tariff: 'Mais Azul',
      marcacaoAntecipadaAssentos: true,
      antecipacaoVoo: true,
    },
    azulSuper: {
      tariff: 'Azul Super',
      marcacaoAntecipadaAssentos: true,
    },
  };

  const HAVE_ICON = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.600098 9.0001C0.600098 4.3591 4.3591 0.600098 9.0001 0.600098C13.6369 0.600098 17.4001 4.3591 17.4001 9.0001C17.4001 13.6376 13.6369 17.4001 9.0001 17.4001C4.3591 17.4001 0.600098 13.6376 0.600098 9.0001ZM5.3587 8.38223L4.8001 8.95508L7.81887 12.0547L13.5819 6.13663L13.024 5.56378L7.81887 10.9083L5.3587 8.38223Z" fill="#008058"></path>
</svg>
`;

  const DONT_HAVE_ICON = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0ZM9 8.29297L6.35352 5.64648L5.64648 6.35352L8.29297 9L5.64648 11.6465L6.35352 12.3535L9 9.70703L11.6465 12.3535L12.3535 11.6465L9.70703 9L12.3535 6.35352L11.6465 5.64648L9 8.29297Z" fill="#EB001B" />
</svg>
`;

  const DONT_HAVE_BAGS_ICON = `
<path d="M9.7793 20.1455C9.86915 20.1456 9.94434 20.2057 9.94434 20.2881V20.8574C9.94434 20.9323 9.86915 20.9999 9.7793 21H9.29199C9.20203 21 9.12695 20.9399 9.12695 20.8574V20.2881C9.12695 20.2131 9.20203 20.1455 9.29199 20.1455H9.7793ZM14.6895 20.1455C14.7794 20.1455 14.8545 20.2056 14.8545 20.2881V20.8574C14.8545 20.9324 14.7794 21 14.6895 21H14.2021C14.1122 21 14.0371 20.9399 14.0371 20.8574V20.2881C14.0371 20.2131 14.1122 20.1455 14.2021 20.1455H14.6895ZM9.13477 10.9883V16.3291H9.95117V11.9189L11.5859 13.7812V16.7793H12.4033V14.7129L16.041 18.8574C15.7706 19.1203 15.4017 19.2832 14.9971 19.2832H8.99902C8.17462 19.283 7.50014 18.6086 7.5 17.7842V9.12598L9.13477 10.9883ZM10.6035 4.7168C10.6935 4.7168 10.7686 4.79219 10.7686 4.88965V7.28809H13.2197V4.88965C13.2197 4.79229 13.2949 4.71695 13.3848 4.7168H13.8721C13.962 4.7168 14.0371 4.79219 14.0371 4.88965V7.28809H14.9971C15.8215 7.2882 16.4958 7.96274 16.4961 8.78711V17.4404L17.25 18.2998L16.6377 18.876L6.75 7.6084L7.3623 7.03223L7.95996 7.71191C8.23005 7.4508 8.59601 7.28818 8.99902 7.28809H9.95117V4.88965C9.95117 4.79226 10.0263 4.7169 10.1162 4.7168H10.6035ZM14.0371 14.6377L14.8545 15.5693V10.7139H14.0371V14.6377ZM11.5859 11.8447L12.4033 12.7764V9.85938H11.5859V11.8447ZM14.6895 3C14.7794 3 14.8467 3.07539 14.8467 3.17285V3.68945C14.8467 3.78691 14.7794 3.8623 14.6895 3.8623H9.28418C9.19425 3.86227 9.12695 3.78689 9.12695 3.68945V3.17285C9.12695 3.07541 9.19425 3.00004 9.28418 3H14.6895Z" fill="#EB001B" />
`;

  function initActivityWhenReady() {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const isDesktop = window.innerWidth >= 1024;

    if (!isDesktop) {
      console.log('[AT] Tariff Icons: Not a desktop device. Exiting.');
      return;
    }

    if (isReady) {
      initTariffRecommendation();
    } else {
      document.addEventListener('DOMContentLoaded', initTariffRecommendation);
    }
  }

  function initTariffRecommendation() {
    document.body.classList.add(BODY_CLASS);

    const domChecker = document.querySelector(domIsReadyValidator);

    if (!domChecker) {
      console.log('[AT] Tariff Icons: DOM Checker not found. Waiting...');
      requestAnimationFrame(initTariffRecommendation);
      return;
    }

    console.log('[AT] Tariff Icons: DOM Checker found. Initializing activity...');
    analyticsEvent('active');
    observerFlights();

    function observerFlights() {
      const observerFlightsWrapper = new MutationObserver((mutations) => {
        const stillMoneyPaymentFlight = checkIfStillMoneyPaymentFlight();

        if (!stillMoneyPaymentFlight) {
          console.log('[AT] Tariff Icons: Flight selection changed to non Money Payment flight.');
          document.body.classList.remove(BODY_CLASS);
          return;
        }

        document.body.classList.toggle(BODY_CLASS, true);
        console.log('[AT] Tariff Icons: Flight for money payment detected.');

        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
            const elementTrips = document.querySelector(SELECTORS.flightsTrips);

            if (elementTrips) {
              const flightCards = elementTrips.querySelectorAll(SELECTORS.flightCard);

              [...flightCards].forEach((card) => {
                const flightTariffs = card.querySelectorAll(SELECTORS.flightTariffs);

                if (!flightTariffs || flightTariffs.length === 0) {
                  return;
                }

                const isFlightInternacional = flightIsInternacional(flightTariffs);

                [...flightTariffs].forEach((tariff) => {
                  const alreadyHasIcons = tariff.classList.contains(TARIFF_CLASS);

                  if (alreadyHasIcons) {
                    return;
                  }

                  tariff.classList.add(TARIFF_CLASS);
                  injectIcons(tariff, card, isFlightInternacional);
                });
              });
            }
          }
        }
      });

      observerFlightsWrapper.observe(domChecker, {
        childList: true,
        subtree: true,
      });
    }

    function injectIcons(tariff, flightCard, isFlightInternacional) {
      const benefits = tariff.querySelectorAll('ul > li');

      const tariffType = tariff.querySelector(SELECTORS.flightTypeLabel).textContent.trim();
      const tariffBenefits =
        TARIFF_BENEFITS[
          Object.keys(TARIFF_BENEFITS).find((key) => TARIFF_BENEFITS[key].tariff === tariffType)
        ];

      if (!tariffBenefits) {
        console.log('[AT] Tariff Icons: Tariff not found. Exiting.', tariffType);
        return;
      }

      console.log('TARIFA: ', tariffType);

      if (isFlightInternacional) {
        console.log('--------------- INTERNACIONAL');
        appendIconsForInternationalFlights(benefits, tariffBenefits);

        return;
      }

      appendIconsForNationalFlights(benefits, tariffBenefits);
      console.log('--------------- NACIONAL');
    }

    function appendIconsForInternationalFlights(benefits, tariffBenefits) {
      const benefitMarcacaoAntecipadaAssentos = benefits[3];
      const hasMarcacaoAntecipadaAssentos = tariffBenefits.marcacaoAntecipadaAssentos;

      const isBooleanText =
        benefitMarcacaoAntecipadaAssentos.textContent == 'Sim' ||
        benefitMarcacaoAntecipadaAssentos.textContent == 'Não';

      console.log('isBooleanText', isBooleanText);

      if (!isBooleanText) {
        console.log(
          '[AT] Tariff Icons: Benefit text is not boolean. Exiting.',
          benefitMarcacaoAntecipadaAssentos.textContent,
        );
        return;
      }

      benefitMarcacaoAntecipadaAssentos.innerHTML = hasMarcacaoAntecipadaAssentos
        ? HAVE_ICON
        : DONT_HAVE_ICON;

      // Bagagem despachada
      const benefitCheckedBags = benefits[1];
      const doesntHaveCheckedBags = tariffBenefits.checkedBags;

      if (doesntHaveCheckedBags !== undefined) {
        const textForCheckedBags = benefitCheckedBags.querySelector('div > div > p');
        console.log(textForCheckedBags.textContent);

        if (textForCheckedBags.textContent.includes('Não incluída')) {
          textForCheckedBags.style.color = '#EB001B';

          const svgBag = benefitCheckedBags.querySelector('svg');
          if (svgBag) {
            svgBag.innerHTML = DONT_HAVE_BAGS_ICON;
          }
        }
      }
    }

    function appendIconsForNationalFlights(benefits, tariffBenefits) {
      const benefitMarcacaoAntecipadaAssentos = benefits[4];
      const hasMarcacaoAntecipadaAssentos = tariffBenefits.marcacaoAntecipadaAssentos;

      const isBooleanText =
        benefitMarcacaoAntecipadaAssentos.textContent == 'Sim' ||
        benefitMarcacaoAntecipadaAssentos.textContent == 'Não';

      console.log('isBooleanText', isBooleanText);

      if (!isBooleanText) {
        console.log(
          '[AT] Tariff Icons: Benefit text is not boolean. Exiting.',
          benefitMarcacaoAntecipadaAssentos.textContent,
        );
        return;
      }

      benefitMarcacaoAntecipadaAssentos.innerHTML = hasMarcacaoAntecipadaAssentos
        ? HAVE_ICON
        : DONT_HAVE_ICON;

      const benefitAntecipacaoVoo = benefits[5];
      const hasAntecipacaoVoo = tariffBenefits.antecipacaoVoo;

      const antecipacaoIsBooleanText =
        benefitAntecipacaoVoo.textContent == 'Sim' || benefitAntecipacaoVoo.textContent == 'Não';

      console.log('antecipacaoIsBooleanText', antecipacaoIsBooleanText);

      if (!antecipacaoIsBooleanText) {
        console.log(
          '[AT] Tariff Icons: Benefit text is not boolean. Exiting.',
          benefitAntecipacaoVoo.textContent,
        );
        return;
      }

      benefitAntecipacaoVoo.innerHTML = hasAntecipacaoVoo ? HAVE_ICON : DONT_HAVE_ICON;

      // Bagagem despachada
      const benefitCheckedBags = benefits[1];
      const doesntHaveCheckedBags = tariffBenefits.checkedBags;

      if (doesntHaveCheckedBags !== undefined) {
        const textForCheckedBags = benefitCheckedBags.querySelector('div > div > p');
        console.log(textForCheckedBags.textContent);

        if (textForCheckedBags.textContent.includes('Não incluída')) {
          textForCheckedBags.style.color = '#EB001B';

          const svgBag = benefitCheckedBags.querySelector('svg');
          if (svgBag) {
            svgBag.innerHTML = DONT_HAVE_BAGS_ICON;
          }
        }
      }
    }

    function flightIsInternacional(flightCards = []) {
      if (!flightCards || flightCards.length === 0) {
        console.log('[AT] Tariff Icons: Unable to determine flight type.');
        return null;
      }

      // Business tariff exists only on international flights
      const hasBusinessClass = Array.from(flightCards).some((card) => {
        const flightsTypes = card.querySelectorAll(SELECTORS.flightTypeLabel);

        const fareLabel = Array.from(flightsTypes).find((fareLabel) => {
          return fareLabel.textContent.includes('Business');
        });

        return fareLabel !== undefined;
      });

      return hasBusinessClass ? true : false;
    }

    function checkIfStillMoneyPaymentFlight() {
      const queryParams = window.location.search;
      const paramFlightMoneyPayment = 'cc=BRL';

      return queryParams.includes(paramFlightMoneyPayment);
    }

    function analyticsEvent(eventLabel) {
      if (eventLabel === undefined || !eventLabel) {
        console.log('[AT] Missing parameters for analytics event.');
        return;
      }

      const labelEvent = 'AT_tariff_icons ' + eventLabel;

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
  }

  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/selecao-voo';
    const queryParams = window.location.search;
    const paramFlightMoneyPayment = 'cc=BRL';

    return currentUrl.includes(targetTestUrl) && queryParams.includes(paramFlightMoneyPayment);
  }

  if (window.tariffInfoInitialized || !onTargetPage()) {
    console.log('[AT] Tariff Icons: Script already executed or not on target page.');
    return;
  }

  window.tariffInfoInitialized = true;
  initActivityWhenReady();
})();
