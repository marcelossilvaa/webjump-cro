(function () {
  console.log('[AT] Tariff Recommendation: Script initialized.');

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

  const TARIFF_RECOMMENDATION_FOR_NATIONAL = 'Mais Azul';
  const TARIFF_RECOMMENDATION_FOR_INTERNATIONAL = {
    diamante_user: 'Business',
    safira_user: 'Azul Super',
    other_user: 'Mais Azul',
    unspecified_user: 'Azul Super',
  };

  const domIsReadyValidator = SELECTORS.flightsWrapper;

  function initActivityWhenReady() {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const isDesktop = window.innerWidth >= 1024;

    if (!isDesktop) {
      console.log('[AT] Tariff Recommendation: Not a desktop device. Exiting.');
      return;
    }

    if (isReady) {
      initTariffRecommendation();
    } else {
      document.addEventListener('DOMContentLoaded', initTariffRecommendation);
    }
  }

  function initTariffRecommendation() {
    document.body.classList.add('at-tariff-recommendation-active');

    injectCSS();

    const domChecker = document.querySelector(domIsReadyValidator);

    if (!domChecker) {
      console.log('[AT] Tariff Recommendation: DOM Checker not found. Waiting...');
      requestAnimationFrame(initTariffRecommendation);
      return;
    }

    console.log('[AT] Tariff Recommendation: DOM Checker found. Initializing activity...');
    analyticsEvent('Recomendações Exibidas');
    observerFlights();

    function observerFlights() {
      const observerFlightsWrapper = new MutationObserver((mutations) => {
        const stillMoneyPaymentFlight = checkIfStillMoneyPaymentFlight();

        if (!stillMoneyPaymentFlight) {
          console.log(
            '[AT] Tariff Recommendation: Flight selection changed to non Money Payment flight.',
          );
          document.body.classList.remove('at-tariff-recommendation-active');
          return;
        }

        document.body.classList.toggle('at-tariff-recommendation-active', true);
        console.log('[AT] Tariff Recommendation: Flight for money payment detected.');

        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
            const elementTrips = document.querySelector(SELECTORS.flightsTrips);

            if (elementTrips) {
              const flightCards = elementTrips.querySelectorAll(SELECTORS.flightCard);

              if (!flightCards || flightCards.length === 0) {
                console.log('[AT] Tariff Recommendation: No flight cards found.');
                return;
              }

              const flightType = getFlightType(flightCards);
              const avilableTarrifs = getOnlyNotSoldOutTariffs(flightCards);

              if (flightType == 'Nacional') {
                addRecommendationTagsForNational(avilableTarrifs);
              } else if (flightType == 'Internacional') {
                addRecommendationTagsForInternational(avilableTarrifs);
              }
            }
          }
        }
      });

      observerFlightsWrapper.observe(domChecker, {
        childList: true,
        subtree: true,
      });
    }

    function addRecommendationTagsForNational(avilableTarrifs) {
      if (!avilableTarrifs || avilableTarrifs.length === 0) {
        console.log(
          "[AT] Tariff Recommendation: function doesn't receive avilableTarrifs as parameter.",
        );
        return;
      }

      const filteredTariffs = filterTariffsByName(
        avilableTarrifs,
        TARIFF_RECOMMENDATION_FOR_NATIONAL,
      );
      injectTariffTag(filteredTariffs, true, false);
    }

    function addRecommendationTagsForInternational(avilableTarrifs) {
      if (!avilableTarrifs || avilableTarrifs.length === 0) {
        console.log(
          "[AT] Tariff Recommendation: function doesn't receive avilableTarrifs as parameter.",
        );
        return;
      }

      const tariffToPromote = getTariffToPromoteForInternational();
      const filteredTariffs = filterTariffsByName(avilableTarrifs, tariffToPromote);
      const isBusiness = tariffToPromote == 'Business';

      injectTariffTag(filteredTariffs, false, isBusiness);
    }

    function injectTariffTag(tariffs, isNational = true, isBusiness = false) {
      tariffs.forEach((tariffCard) => {
        const recommendationTag = createRecommendationTag(isNational, isBusiness);
        const wrapperToInject = tariffCard.querySelector('li');

        if (wrapperToInject && !wrapperToInject.querySelector('.injected-recommendation-tag')) {
          wrapperToInject.prepend(recommendationTag);

          const selectButton = tariffCard.querySelector(SELECTORS.selectTariffButton);

          if (selectButton) {
            selectButton.removeEventListener('click', listenerToSelectButton);
            selectButton.addEventListener('click', listenerToSelectButton);
          }
        }
      });
    }

    function getTariffToPromoteForInternational() {
      const userTier = getTierOfUser();

      if (userTier == '') {
        return TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.unspecified_user;
      }

      switch (userTier) {
        case 'azul diamante':
          return TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.diamante_user;
        case 'azul safira':
          return TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.safira_user;
        default:
          return TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.other_user;
      }
    }

    function getTierOfUser() {
      const userClassification = document
        .querySelector(SELECTORS.tierLabelOnHeader)
        ?.textContent.trim()
        .toLowerCase();

      return userClassification || '';
    }

    function listenerToSelectButton() {
      analyticsEvent('Tarifa Recomendada Selecionada');
    }

    function getFlightType(flightCards) {
      if (!flightCards || flightCards.length === 0) {
        console.log('[AT] Tariff Recommendation: Unable to determine flight type.');
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

      return hasBusinessClass ? 'Internacional' : 'Nacional';
    }

    function getOnlyNotSoldOutTariffs(flightCards) {
      if (!flightCards || flightCards.length === 0) {
        console.log(
          "[AT] Tariff Recommendation: function doesn't receive flight cards as parameter.",
        );
        return [];
      }

      const tariffs = [...flightCards].flatMap((card) => {
        return Array.from(card.querySelectorAll(SELECTORS.flightTariffs));
      });

      return tariffs.filter((card) => {
        const isSoldOut = card.querySelector(SELECTORS.soldOutTariffButton) ? true : false;
        return isSoldOut === false;
      });
    }

    function filterTariffsByName(tariffs, tariffName = 'Mais Azul') {
      if (!tariffs || tariffs.length === 0) {
        console.log("[AT] Tariff Recommendation: function doesn't receive tariffs as parameter.");
        return [];
      }

      return tariffs.filter((card) => {
        const fareLabel = card.querySelector(SELECTORS.flightTypeLabel);
        return fareLabel && fareLabel.textContent.includes(tariffName);
      });
    }

    function createRecommendationTag(isNational = true, isBusiness = false) {
      const tag = document.createElement('div');
      tag.classList.add('injected-recommendation-tag');

      tag.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.8333 6.53385C14.9744 6.53385 15.105 6.60793 15.1771 6.72917C15.249 6.85053 15.2518 7.00113 15.1842 7.125L13.5065 10.2005H16.5C16.652 10.2005 16.7912 10.2863 16.8587 10.4225C16.926 10.5587 16.9103 10.7216 16.8184 10.8424L11.485 17.8424C11.3708 17.9922 11.1673 18.0422 10.9967 17.9622C10.8263 17.8822 10.7345 17.6939 10.7767 17.5104L11.6634 13.6667H8.5C8.35714 13.6667 8.22511 13.5905 8.15365 13.4668C8.08226 13.343 8.08211 13.1901 8.15365 13.0664L11.8203 6.73307L11.8503 6.68945C11.9254 6.59208 12.0417 6.53385 12.1667 6.53385H14.8333ZM9.19401 12.8672H12.1667C12.2886 12.8672 12.4039 12.9228 12.4798 13.0182C12.5554 13.1135 12.584 13.2382 12.5566 13.3568L11.974 15.8796L15.6927 11H12.8333C12.6923 11 12.5617 10.9258 12.4896 10.8047C12.4176 10.6834 12.4149 10.5328 12.4824 10.4089L14.1602 7.33333H12.3978L9.19401 12.8672Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 4C16.9183 4 20.5 7.58172 20.5 12C20.5 16.4183 16.9183 20 12.5 20C8.08172 20 4.5 16.4183 4.5 12C4.5 7.58172 8.08172 4 12.5 4ZM12.5 4.80013C8.52355 4.80013 5.30013 8.02355 5.30013 12C5.30013 15.9765 8.52355 19.1999 12.5 19.1999C16.4765 19.1999 19.6999 15.9765 19.6999 12C19.6999 8.02355 16.4765 4.80013 12.5 4.80013Z" fill="white"/>
                </svg>
                <span>Recomendado para você</span>
            `;

      if (isBusiness) {
        tag.classList.add('injected-recommendation-tag--business');
      }

      if (!isNational) {
        tag.classList.add('injected-recommendation-tag--international');
      }

      return tag;
    }

    function injectCSS() {
      const styles = document.createElement('style');

      styles.innerHTML = `
                .at-tariff-recommendation-active .flight-card .fares-container > ul > li > ul > li:first-child {
                    position: relative;
                    height: 183px;
                    padding-top: 45px;
                }

                .at-tariff-recommendation-active .injected-recommendation-tag {
                    font-size: 14px;
                    color: #FFFFFF;
                    font-weight: 700;
                    font-family: "Helvetica Neue", Arial;
                    background: #022E63;
                    padding: 8px 32px;
                    border-radius: 0px 0px 0px 32px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 4px;
                    box-sizing: border-box;
                    top: 0;
                    position: absolute;
                    right: 0;
                }

                .at-tariff-recommendation-active .injected-recommendation-tag.injected-recommendation-tag--business {
                    background: #EAF0F4;
                    color: #022E63;
                }

                .at-tariff-recommendation-active .injected-recommendation-tag.injected-recommendation-tag--international {
                    font-size: 12px;
                    padding: 8px 20px;
                }

                .at-tariff-recommendation-active .injected-recommendation-tag.injected-recommendation-tag--international svg {
                    display: none;
                }

                .at-tariff-recommendation-active .flight-card .fares-container .fare-price.css-13gs6uq {
                    margin-top: -45px;
                    padding-top: 53px;
                }
            `;

      // em .fare-price a classe .css-13gs6uq é a classe diferencial para business

      document.head.appendChild(styles);
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

      const labelEvent = 'AT_tariff_recommendation ' + eventLabel;

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

  if (window.tariffRecommendationInitialized || !onTargetPage()) {
    console.log('[AT] Tariff Recommendation: Script already executed or not on target page.');
    return;
  }

  window.tariffRecommendationInitialized = true;
  initActivityWhenReady();
})();
