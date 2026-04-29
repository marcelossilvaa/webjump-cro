(function () {
  'use strict';

  // =========================
  // Variáveis (escopo do script)
  // =========================
  let isProcessing = false;
  let debounceTimer = null;

  // PreSelectFare (estado)
  let psfLastVisibilityState = null;
  let psfIsInitialized = false;
  let psfCurrentFareContext = null;
  let psfIsProcessingChange = false;
  let psfIsSecondStep = false;
  let psfCalendarObserver = null;
  let psfLastApplyAttempt = null;
  let psfLastCTAState = null;
  let psfConsecutiveFailedAttempts = 0;

  // OrdenacaoFiltros (estado)
  let ofFlightItemsListObserver = null;
  let ofInjectedCss = false;
  let ofComponentObserver = null;

  // RecomendacaoDeTarifas (estado)
  let trObserver = null;
  let trCssInjected = false;

  // AlteracaoIcones (estado)
  let tiObserver = null;

  // =========================
  // Constantes
  // =========================
  const PAGE_PATH_TARGET = '/selecao-voo';
  const QUERY_PARAM_MONEY_PAYMENT = 'cc=BRL';

  const COMMON_SELECTORS = {
    flightsWrapper: '.AzulPage .availability',
    flightsTrips: '.AzulPage .availability .trips',
    flightCard: '.card-list .flight-card',
    flightTypeLabel: '.fare-price .promotional',
    flightTariffs: '.fare-item',
    soldOutTariffButton: "button[aria-label='Tarifa esgotada']",
    selectTariffButton: "button[aria-label='Selecionar tarifa']",
    tierLabelOnHeader: '.css-surmsm',
  };

  // Recomendação de tarifas
  const TR_BODY_CLASS = 'at-tariff-recommendation-active';
  const TR_STYLE_ID = 'at-tariff-recommendation-style';
  const TR_TAG_CLASS = 'injected-recommendation-tag';
  const TR_TARIFF_RECOMMENDATION_FOR_NATIONAL = 'Mais Azul';
  const TR_TARIFF_RECOMMENDATION_FOR_INTERNATIONAL = {
    diamante_user: 'Business',
    safira_user: 'Azul Super',
    other_user: 'Mais Azul',
    unspecified_user: 'Azul Super',
  };

  // Ícones de benefícios
  const TI_BODY_CLASS = 'at-tariff-icons';
  const TI_TARIFF_CLASS = 'tariff-icons-injected';

  const TI_TARIFF_BENEFITS = {
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

  const TI_HAVE_ICON =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M0.600098 9.0001C0.600098 4.3591 4.3591 0.600098 9.0001 0.600098C13.6369 0.600098 17.4001 4.3591 17.4001 9.0001C17.4001 13.6376 13.6369 17.4001 9.0001 17.4001C4.3591 17.4001 0.600098 13.6376 0.600098 9.0001ZM5.3587 8.38223L4.8001 8.95508L7.81887 12.0547L13.5819 6.13663L13.024 5.56378L7.81887 10.9083L5.3587 8.38223Z" fill="currentColor"></path>' +
    '</svg>';

  const TI_DONT_HAVE_ICON =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0ZM9 8.29297L6.35352 5.64648L5.64648 6.35352L8.29297 9L5.64648 11.6465L6.35352 12.3535L9 9.70703L11.6465 12.3535L12.3535 11.6465L9.70703 9L12.3535 6.35352L11.6465 5.64648L9 8.29297Z" fill="currentColor" />' +
    '</svg>';

  const TI_DONT_HAVE_BAGS_ICON =
    '<path d="M9.7793 20.1455C9.86915 20.1456 9.94434 20.2057 9.94434 20.2881V20.8574C9.94434 20.9323 9.86915 20.9999 9.7793 21H9.29199C9.20203 21 9.12695 20.9399 9.12695 20.8574V20.2881C9.12695 20.2131 9.20203 20.1455 9.29199 20.1455H9.7793ZM14.6895 20.1455C14.7794 20.1455 14.8545 20.2056 14.8545 20.2881V20.8574C14.8545 20.9324 14.7794 21 14.6895 21H14.2021C14.1122 21 14.0371 20.9399 14.0371 20.8574V20.2881C14.0371 20.2131 14.1122 20.1455 14.2021 20.1455H14.6895ZM9.13477 10.9883V16.3291H9.95117V11.9189L11.5859 13.7812V16.7793H12.4033V14.7129L16.041 18.8574C15.7706 19.1203 15.4017 19.2832 14.9971 19.2832H8.99902C8.17462 19.283 7.50014 18.6086 7.5 17.7842V9.12598L9.13477 10.9883ZM10.6035 4.7168C10.6935 4.7168 10.7686 4.79219 10.7686 4.88965V7.28809H13.2197V4.88965C13.2197 4.79229 13.2949 4.71695 13.3848 4.7168H13.8721C13.962 4.7168 14.0371 4.79219 14.0371 4.88965V7.28809H14.9971C15.8215 7.2882 16.4958 7.96274 16.4961 8.78711V17.4404L17.25 18.2998L16.6377 18.876L6.75 7.6084L7.3623 7.03223L7.95996 7.71191C8.23005 7.4508 8.59601 7.28818 8.99902 7.28809H9.95117V4.88965C9.95117 4.79226 10.0263 4.7169 10.1162 4.7168H10.6035ZM14.0371 14.6377L14.8545 15.5693V10.7139H14.0371V14.6377ZM11.5859 11.8447L12.4033 12.7764V9.85938H11.5859V11.8447ZM14.6895 3C14.7794 3 14.8467 3.07539 14.8467 3.17285V3.68945C14.8467 3.78691 14.7794 3.8623 14.6895 3.8623H9.28418C9.19425 3.86227 9.12695 3.78689 9.12695 3.68945V3.17285C9.12695 3.07541 9.19425 3.00004 9.28418 3H14.6895Z" fill="currentColor" />';

  // Ordenação / filtros
  const OF_STYLE_ID = 'azul-ordenacao-filtros-style';
  const OF_ALL_OPTIONS = [
    'Mais cedo',
    'Menor preço',
    'Maior preço',
    'Mais rápido',
    'Mais tarde',
    'Voo direto',
    'Duração',
  ];
  const OF_KEY_STEPS = {
    'Mais cedo': 0,
    'Menor preço': 1,
    'Maior preço': 2,
    'Mais rápido': 3,
    'Mais tarde': 4,
    'Voo direto': 5,
    Duração: 6,
  };
  const OF_PRIMARY = ['Menor preço', 'Mais cedo', 'Mais tarde', 'Maior preço'];
  const OF_SECONDARY = OF_ALL_OPTIONS.filter((o) => !OF_PRIMARY.includes(o));
  const OF_SELECTORS = {
    wrapper: '.sort-filter',
    label: '.filter-label',
    nativeDropdown: '.css-2b097c-container',
    nativeInput: '#sort-filter',
    contentWrapper: '.availability .trips section.card-list',
    flightItem: '.flight-card',
    bookingDateButtons: '.booking-calendar__cards .styles__Carousel-sc-3qprdy-1 > div button',
    flightSelectButton: "button[aria-label='Selecionar tarifa']",
  };
  const OF_SVG_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">' +
    '<path d="M12 15l-3.464-4.5h6.928L12 15z"/>' +
    '</svg>';

  // PreSelectFare
  const PSF_STYLE_ID = 'pre-select-fare-styles';

  // =========================
  // Utilitários
  // =========================
  function onTargetPage() {
    const currentUrl = window.location.pathname || '';
    const queryParams = window.location.search || '';
    return currentUrl.includes(PAGE_PATH_TARGET) && queryParams.includes(QUERY_PARAM_MONEY_PAYMENT);
  }

  function isDesktop() {
    return window.innerWidth >= 1024;
  }

  function safeTrimLower(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function debounce(fn, waitMs) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(fn, waitMs);
  }

  function analyticsSend(labelEvent, consolePrefix) {
    if (!labelEvent) {
      console.log(consolePrefix + ' Missing parameters for analytics event.');
      return;
    }

    console.log(consolePrefix + ' Analytics event triggered:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // =========================
  // 1) Recomendação de tarifas (tag)
  // =========================
  function trGetTierOfUser() {
    const tierText = document.querySelector(COMMON_SELECTORS.tierLabelOnHeader)?.textContent || '';
    return tierText.trim().toLowerCase();
  }

  function trGetTariffToPromoteForInternational() {
    const userTier = trGetTierOfUser();

    if (!userTier) {
      return TR_TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.unspecified_user;
    }

    if (userTier === 'azul diamante') {
      return TR_TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.diamante_user;
    }

    if (userTier === 'azul safira') {
      return TR_TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.safira_user;
    }

    return TR_TARIFF_RECOMMENDATION_FOR_INTERNATIONAL.other_user;
  }

  function trCheckIfStillMoneyPaymentFlight() {
    const queryParams = window.location.search || '';
    return queryParams.includes(QUERY_PARAM_MONEY_PAYMENT);
  }

  function trGetFlightType(flightCards) {
    if (!flightCards || flightCards.length === 0) {
      console.log('[AT] Tariff Recommendation: Unable to determine flight type.');
      return null;
    }

    const hasBusinessClass = Array.from(flightCards).some((card) => {
      const flightsTypes = card.querySelectorAll(COMMON_SELECTORS.flightTypeLabel);
      const fareLabel = Array.from(flightsTypes).find((label) => {
        return (label.textContent || '').includes('Business');
      });
      return fareLabel !== undefined;
    });

    return hasBusinessClass ? 'Internacional' : 'Nacional';
  }

  function trGetOnlyNotSoldOutTariffs(flightCards) {
    if (!flightCards || flightCards.length === 0) {
      console.log('[AT] Tariff Recommendation: function does not receive flight cards.');
      return [];
    }

    const tariffs = Array.from(flightCards).flatMap((card) => {
      return Array.from(card.querySelectorAll(COMMON_SELECTORS.flightTariffs));
    });

    return tariffs.filter((card) => {
      const isSoldOut = card.querySelector(COMMON_SELECTORS.soldOutTariffButton) ? true : false;
      return isSoldOut === false;
    });
  }

  function trFilterTariffsByName(tariffs, tariffName) {
    if (!tariffs || tariffs.length === 0) {
      console.log('[AT] Tariff Recommendation: function does not receive tariffs.');
      return [];
    }

    return tariffs.filter((card) => {
      const fareLabel = card.querySelector(COMMON_SELECTORS.flightTypeLabel);
      return fareLabel && (fareLabel.textContent || '').includes(tariffName);
    });
  }

  function trCreateRecommendationTag(isNational, isBusiness) {
    const tag = document.createElement('div');
    tag.classList.add(TR_TAG_CLASS);

    const svg =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M14.8333 6.53385C14.9744 6.53385 15.105 6.60793 15.1771 6.72917C15.249 6.85053 15.2518 7.00113 15.1842 7.125L13.5065 10.2005H16.5C16.652 10.2005 16.7912 10.2863 16.8587 10.4225C16.926 10.5587 16.9103 10.7216 16.8184 10.8424L11.485 17.8424C11.3708 17.9922 11.1673 18.0422 10.9967 17.9622C10.8263 17.8822 10.7345 17.6939 10.7767 17.5104L11.6634 13.6667H8.5C8.35714 13.6667 8.22511 13.5905 8.15365 13.4668C8.08226 13.343 8.08211 13.1901 8.15365 13.0664L11.8203 6.73307L11.8503 6.68945C11.9254 6.59208 12.0417 6.53385 12.1667 6.53385H14.8333ZM9.19401 12.8672H12.1667C12.2886 12.8672 12.4039 12.9228 12.4798 13.0182C12.5554 13.1135 12.584 13.2382 12.5566 13.3568L11.974 15.8796L15.6927 11H12.8333C12.6923 11 12.5617 10.9258 12.4896 10.8047C12.4176 10.6834 12.4149 10.5328 12.4824 10.4089L14.1602 7.33333H12.3978L9.19401 12.8672Z" fill="white"/>' +
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 4C16.9183 4 20.5 7.58172 20.5 12C20.5 16.4183 16.9183 20 12.5 20C8.08172 20 4.5 16.4183 4.5 12C4.5 7.58172 8.08172 4 12.5 4ZM12.5 4.80013C8.52355 4.80013 5.30013 8.02355 5.30013 12C5.30013 15.9765 8.52355 19.1999 12.5 19.1999C16.4765 19.1999 19.6999 15.9765 19.6999 12C19.6999 8.02355 16.4765 4.80013 12.5 4.80013Z" fill="white"/>' +
      '</svg>';

    tag.innerHTML = svg + '<span>Recomendado para você</span>';

    if (isBusiness) {
      tag.classList.add(TR_TAG_CLASS + '--business');
    }
    if (!isNational) {
      tag.classList.add(TR_TAG_CLASS + '--international');
    }

    return tag;
  }

  function trMarkFlightCardType(flightCards) {
    if (!flightCards || flightCards.length === 0) {
      return;
    }

    Array.from(flightCards).forEach(function (card) {
      let flightsTypes = card.querySelectorAll(COMMON_SELECTORS.flightTypeLabel);
      let hasBusiness = Array.from(flightsTypes).some(function (label) {
        return (label.textContent || '').indexOf('Business') !== -1;
      });

      if (hasBusiness) {
        card.classList.add('at-international-card');
      } else {
        card.classList.remove('at-international-card');
      }
    });
  }

  function trMarkCabineMista(flightCards) {
    if (!flightCards || flightCards.length === 0) {
      return;
    }

    Array.from(flightCards).forEach(function (card) {
      let farePrices = card.querySelectorAll('.fare-price.css-13gs6uq');
      Array.from(farePrices).forEach(function (fp) {
        let cabineMistaSpan = fp.querySelector('.css-18wb4my span');
        if (cabineMistaSpan && (cabineMistaSpan.textContent || '').indexOf('Voo em Cabine Mista') !== -1) {
          fp.classList.add('at-cabine-mista');
        } else {
          fp.classList.remove('at-cabine-mista');
        }
      });
    });
  }

  function trInjectCss() {
    if (trCssInjected || document.getElementById(TR_STYLE_ID)) {
      trCssInjected = true;
      return;
    }

    const styles = document.createElement('style');
    styles.id = TR_STYLE_ID;

    styles.textContent =
      '.' +
      TR_BODY_CLASS +
      ' .flight-card .fares-container > ul > li > ul > li:first-child { position: relative; height: 175px; padding-top: 50px; }' +
      '.' +
      TR_BODY_CLASS +
      ' .flight-card.at-international-card .fares-container > ul > li > ul > li:first-child { height: 204px; padding-top: 38px; }' +
      '.' +
      TR_BODY_CLASS +
      ' .' +
      TR_TAG_CLASS +
      ' { font-size: 14px; color: #FFFFFF; font-weight: 700; font-family: "Helvetica Neue", Arial; background: #022E63; padding: 8px 32px; border-radius: 0px 0px 0px 32px; display: flex; justify-content: center; align-items: center; gap: 4px; box-sizing: border-box; top: 0; position: absolute; right: 0; }' +
      '.' +
      TR_BODY_CLASS +
      ' .' +
      TR_TAG_CLASS +
      '.' +
      TR_TAG_CLASS +
      '--business { background: #EAF0F4; color: #022E63; }' +
      '.' +
      TR_BODY_CLASS +
      ' .' +
      TR_TAG_CLASS +
      '.' +
      TR_TAG_CLASS +
      '--international { font-size: 12px; padding: 8px 20px; }' +
      '.' +
      TR_BODY_CLASS +
      ' .' +
      TR_TAG_CLASS +
      '.' +
      TR_TAG_CLASS +
      '--international svg { display: none; }' +
      '.' +
      TR_BODY_CLASS +
      ' .flight-card .fares-container .fare-price.css-13gs6uq { margin-top: -45px; padding-top: 53px; }' +
      '.' +
      TR_BODY_CLASS +
      ' .flight-card .fares-container .fare-price.css-13gs6uq.at-cabine-mista { margin-top: -76px; }';

    document.head.appendChild(styles);
    trCssInjected = true;
  }

  function trAnalytics(eventLabel) {
    if (!eventLabel) {
      return;
    }
    analyticsSend('AT_tariff_recommendation ' + eventLabel, '[AT] Tariff Recommendation:');
  }

  function trAddRecommendationTags(tariffs, isNational, isBusiness) {
    tariffs.forEach((tariffCard) => {
      const wrapperToInject = tariffCard.querySelector('li');
      if (!wrapperToInject) {
        return;
      }

      if (wrapperToInject.querySelector('.' + TR_TAG_CLASS)) {
        return;
      }

      const recommendationTag = trCreateRecommendationTag(isNational, isBusiness);
      wrapperToInject.prepend(recommendationTag);

      const selectButton = tariffCard.querySelector(COMMON_SELECTORS.selectTariffButton);
      if (selectButton && !selectButton.hasAttribute('data-tr-analytics-added')) {
        selectButton.setAttribute('data-tr-analytics-added', 'true');
        selectButton.addEventListener('click', function () {
          trAnalytics('Tarifa Recomendada Selecionada');
        });
      }
    });
  }

  function initTariffRecommendation() {
    if (!isDesktop()) {
      console.log('[AT] Tariff Recommendation: Not a desktop device. Exiting.');
      return;
    }

    document.body.classList.add(TR_BODY_CLASS);
    trInjectCss();

    const domChecker = document.querySelector(COMMON_SELECTORS.flightsWrapper);
    if (!domChecker) {
      requestAnimationFrame(initTariffRecommendation);
      return;
    }

    trAnalytics('Recomendações Exibidas');

    if (trObserver) {
      return;
    }

    trObserver = new MutationObserver((mutations) => {
      if (!trCheckIfStillMoneyPaymentFlight()) {
        document.body.classList.remove(TR_BODY_CLASS);
        return;
      }

      document.body.classList.add(TR_BODY_CLASS);

      const hasRelevant = mutations.some(
        (m) => m.addedNodes.length > 0 || m.removedNodes.length > 0,
      );
      if (!hasRelevant) {
        return;
      }

      const elementTrips = document.querySelector(COMMON_SELECTORS.flightsTrips);
      if (!elementTrips) {
        return;
      }

      const flightCards = elementTrips.querySelectorAll(COMMON_SELECTORS.flightCard);
      if (!flightCards || flightCards.length === 0) {
        return;
      }

      trMarkFlightCardType(flightCards);
      trMarkCabineMista(flightCards);

      const flightType = trGetFlightType(flightCards);
      const availableTariffs = trGetOnlyNotSoldOutTariffs(flightCards);

      if (flightType === 'Nacional') {
        const filtered = trFilterTariffsByName(
          availableTariffs,
          TR_TARIFF_RECOMMENDATION_FOR_NATIONAL,
        );
        trAddRecommendationTags(filtered, true, false);
      } else if (flightType === 'Internacional') {
        const tariffToPromote = trGetTariffToPromoteForInternational();
        const filtered = trFilterTariffsByName(availableTariffs, tariffToPromote);
        const isBusiness = tariffToPromote === 'Business';
        trAddRecommendationTags(filtered, false, isBusiness);
      }
    });

    trObserver.observe(domChecker, { childList: true, subtree: true });

    const initialTrips = document.querySelector(COMMON_SELECTORS.flightsTrips);
    if (initialTrips) {
      const initialCards = initialTrips.querySelectorAll(COMMON_SELECTORS.flightCard);
      if (initialCards && initialCards.length > 0) {
        trMarkFlightCardType(initialCards);
        trMarkCabineMista(initialCards);
      }
    }
  }

  // =========================
  // 2) Alteração de ícones (benefícios)
  // =========================
  function tiAnalytics(eventLabel) {
    if (!eventLabel) {
      return;
    }
    analyticsSend('AT_tariff_icons ' + eventLabel, '[AT] Tariff Icons:');
  }

  function tiFlightIsInternacional(fareItems) {
    if (!fareItems || fareItems.length === 0) {
      return null;
    }

    const hasBusinessClass = Array.from(fareItems).some((card) => {
      const flightsTypes = card.querySelectorAll(COMMON_SELECTORS.flightTypeLabel);
      const fareLabel = Array.from(flightsTypes).find((label) => {
        return (label.textContent || '').includes('Business');
      });
      return fareLabel !== undefined;
    });

    return hasBusinessClass ? true : false;
  }

  function tiAppendIconsForInternationalFlights(benefits, tariffBenefits) {
    const benefitMarcacaoAntecipadaAssentos = benefits[3];
    const hasMarcacaoAntecipadaAssentos = tariffBenefits.marcacaoAntecipadaAssentos;

    const booleanText =
      benefitMarcacaoAntecipadaAssentos &&
      (benefitMarcacaoAntecipadaAssentos.textContent === 'Sim' ||
        benefitMarcacaoAntecipadaAssentos.textContent === 'Não');

    if (!booleanText) {
      return;
    }

    benefitMarcacaoAntecipadaAssentos.innerHTML = hasMarcacaoAntecipadaAssentos
      ? TI_HAVE_ICON
      : TI_DONT_HAVE_ICON;

    const benefitCheckedBags = benefits[1];
    const checkedBagsConfig = tariffBenefits.checkedBags;
    if (checkedBagsConfig === undefined || !benefitCheckedBags) {
      return;
    }

    const textForCheckedBags = benefitCheckedBags.querySelector('div > div > p');
    if (!textForCheckedBags) {
      return;
    }

    if ((textForCheckedBags.textContent || '').includes('Não incluída')) {
      const svgBag = benefitCheckedBags.querySelector('svg');
      if (svgBag) {
        svgBag.innerHTML = TI_DONT_HAVE_BAGS_ICON;
      }
    }
  }

  function tiAppendIconsForNationalFlights(benefits, tariffBenefits) {
    const benefitMarcacaoAntecipadaAssentos = benefits[4];
    const hasMarcacaoAntecipadaAssentos = tariffBenefits.marcacaoAntecipadaAssentos;

    const booleanText =
      benefitMarcacaoAntecipadaAssentos &&
      (benefitMarcacaoAntecipadaAssentos.textContent === 'Sim' ||
        benefitMarcacaoAntecipadaAssentos.textContent === 'Não');

    if (!booleanText) {
      return;
    }

    benefitMarcacaoAntecipadaAssentos.innerHTML = hasMarcacaoAntecipadaAssentos
      ? TI_HAVE_ICON
      : TI_DONT_HAVE_ICON;

    const benefitAntecipacaoVoo = benefits[5];
    const hasAntecipacaoVoo = tariffBenefits.antecipacaoVoo;

    const antecipacaoIsBoolean =
      benefitAntecipacaoVoo &&
      (benefitAntecipacaoVoo.textContent === 'Sim' || benefitAntecipacaoVoo.textContent === 'Não');

    if (antecipacaoIsBoolean) {
      benefitAntecipacaoVoo.innerHTML = hasAntecipacaoVoo ? TI_HAVE_ICON : TI_DONT_HAVE_ICON;
    }

    const benefitCheckedBags = benefits[1];
    const checkedBagsConfig = tariffBenefits.checkedBags;
    if (checkedBagsConfig === undefined || !benefitCheckedBags) {
      return;
    }

    const textForCheckedBags = benefitCheckedBags.querySelector('div > div > p');
    if (!textForCheckedBags) {
      return;
    }

    if ((textForCheckedBags.textContent || '').includes('Não incluída')) {
      const svgBag = benefitCheckedBags.querySelector('svg');
      if (svgBag) {
        svgBag.innerHTML = TI_DONT_HAVE_BAGS_ICON;
      }
    }
  }

  function tiInjectIconsIntoTariff(tariff, isFlightInternacional) {
    const benefits = tariff.querySelectorAll('ul > li');
    if (!benefits || benefits.length === 0) {
      return;
    }

    const labelEl = tariff.querySelector(COMMON_SELECTORS.flightTypeLabel);
    const tariffType = labelEl ? (labelEl.textContent || '').trim() : '';
    if (!tariffType) {
      return;
    }

    const benefitKey = Object.keys(TI_TARIFF_BENEFITS).find(
      (key) => TI_TARIFF_BENEFITS[key].tariff === tariffType,
    );
    const tariffBenefits = benefitKey ? TI_TARIFF_BENEFITS[benefitKey] : null;
    if (!tariffBenefits) {
      return;
    }

    if (isFlightInternacional) {
      tiAppendIconsForInternationalFlights(benefits, tariffBenefits);
      return;
    }

    tiAppendIconsForNationalFlights(benefits, tariffBenefits);
  }

  function initTariffIcons() {
    if (!isDesktop()) {
      console.log('[AT] Tariff Icons: Not a desktop device. Exiting.');
      return;
    }

    document.body.classList.add(TI_BODY_CLASS);

    const domChecker = document.querySelector(COMMON_SELECTORS.flightsWrapper);
    if (!domChecker) {
      requestAnimationFrame(initTariffIcons);
      return;
    }

    if (tiObserver) {
      return;
    }

    tiAnalytics('active');

    tiObserver = new MutationObserver((mutations) => {
      if (!trCheckIfStillMoneyPaymentFlight()) {
        document.body.classList.remove(TI_BODY_CLASS);
        return;
      }

      document.body.classList.add(TI_BODY_CLASS);

      const hasRelevant = mutations.some(
        (m) => m.addedNodes.length > 0 || m.removedNodes.length > 0,
      );
      if (!hasRelevant) {
        return;
      }

      const elementTrips = document.querySelector(COMMON_SELECTORS.flightsTrips);
      if (!elementTrips) {
        return;
      }

      const flightCards = elementTrips.querySelectorAll(COMMON_SELECTORS.flightCard);
      Array.from(flightCards).forEach((card) => {
        const flightTariffs = card.querySelectorAll(COMMON_SELECTORS.flightTariffs);
        if (!flightTariffs || flightTariffs.length === 0) {
          return;
        }

        const isInternacional = tiFlightIsInternacional(flightTariffs);
        Array.from(flightTariffs).forEach((tariff) => {
          if (tariff.classList.contains(TI_TARIFF_CLASS)) {
            return;
          }
          tariff.classList.add(TI_TARIFF_CLASS);
          tiInjectIconsIntoTariff(tariff, isInternacional);
        });
      });
    });

    tiObserver.observe(domChecker, { childList: true, subtree: true });
  }

  // =========================
  // 3) Ordenação / filtros (barra de botões + "Menor preço" default)
  // =========================
  function ofSimulateKey(el, key) {
    const code = key === 'Enter' ? 13 : 40;
    el.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: key,
        code: key,
        keyCode: code,
        which: code,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  function ofApplyFilter(wrapper, label, useSteps) {
    const input = wrapper.querySelector(OF_SELECTORS.nativeInput);
    if (!input) {
      return;
    }

    input.focus();
    ofSimulateKey(input, 'ArrowDown');

    setTimeout(function () {
      if (useSteps) {
        const steps = OF_KEY_STEPS[label] || 0;
        for (let i = 0; i < steps; i++) {
          ofSimulateKey(input, 'ArrowDown');
        }
      } else {
        const currentText = wrapper.querySelector('.css-pdoeiw-singleValue')?.textContent || '';
        const current = currentText.trim();
        const curIdx = OF_ALL_OPTIONS.indexOf(current);
        const tgtIdx = OF_ALL_OPTIONS.indexOf(label);
        const delta = tgtIdx - (curIdx >= 0 ? curIdx : -1);
        const dir = delta > 0 ? 'ArrowDown' : 'ArrowUp';
        for (let i = 0; i < Math.abs(delta); i++) {
          ofSimulateKey(input, dir);
        }
      }

      ofSimulateKey(input, 'Enter');

      const bar = wrapper.querySelector('.azul-sort-button-bar');
      if (bar) {
        bar.querySelectorAll('.azul-sort-btn').forEach((b) => b.classList.remove('active'));
        const btn = Array.from(bar.children).find((b) => b.textContent === label);
        if (btn) {
          btn.classList.add('active');
        }
      }

      setTimeout(ofOrderSoldOutFlightsToEnd, 300);
      setTimeout(ofOrderSoldOutFlightsToEnd, 800);
    }, 150);
  }

  function ofInjectCss() {
    if (ofInjectedCss || document.getElementById(OF_STYLE_ID)) {
      ofInjectedCss = true;
      return;
    }

    const style = document.createElement('style');
    style.id = OF_STYLE_ID;

    let css =
      OF_SELECTORS.wrapper +
      ' { display:inline-flex!important; align-items:center; flex-wrap:nowrap; }' +
      OF_SELECTORS.label +
      ' { margin-right:8px; white-space:nowrap; }';

    css +=
      '.azul-sort-button-bar { display: inline-flex; flex-wrap: nowrap; gap: 6px; vertical-align: middle; width: max-content; }' +
      '.azul-sort-btn { -webkit-box-align: center; align-items: center; background-color: #fff; border-color: rgb(204, 204, 204); border-radius: 32px; border-style: solid; border-width: 1px; font-weight: bolder; box-shadow: rgba(31, 41, 61, 0.16) -1px 2px 4px; cursor: pointer; display: inline-flex; justify-content: center; min-height: 32px; outline: none; transition: 100ms; box-sizing: border-box; padding: 0 16px; white-space: nowrap; font-size: 13px; color: rgb(2, 108, 182); }' +
      '.azul-sort-btn.active { background-color: rgb(2, 108, 182); color: #fff; }' +
      '.ver-mais-btn { padding-right: 12px; border-color: rgb(204, 204, 204); }' +
      '.ver-mais-btn svg { margin-left: 4px; transition: transform 0.2s ease; }' +
      '.ver-mais-btn.active svg { transform: rotate(180deg); }' +
      '.azul-sort-custom-dropdown { position: absolute; top: 100%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border-radius: 4px; z-index: 1000; }' +
      '.azul-sort-custom-dropdown ul { list-style: none; margin: 0; padding: 4px 0; }' +
      '.azul-sort-custom-dropdown li { padding: 8px 12px; cursor: pointer; white-space: nowrap; color: #606060; }' +
      '.azul-sort-custom-dropdown li:hover { background: rgba(17, 41, 76, 0.05); }' +
      'section.card-list .flight-card .flight-card__container { border-bottom: 1px solid rgb(192, 192, 192); border-left-color: transparent; border-top-color: transparent; border-right-color: transparent; }' +
      'section.card-list .flight-card:not([aria-label="Voo esgotado"]) .flight-card__container:hover { border: 1px solid rgb(192, 192, 192); margin-top: -1px; }';

    style.textContent = css;
    document.head.appendChild(style);
    ofInjectedCss = true;
  }

  function ofInjectComponent() {
    document.querySelectorAll(OF_SELECTORS.wrapper).forEach((wrapper) => {
      if (wrapper.getAttribute('data-azul-done') === '1') {
        return;
      }
      wrapper.setAttribute('data-azul-done', '1');
      wrapper.style.position = 'relative';

      const ddNative = wrapper.querySelector(OF_SELECTORS.nativeDropdown);
      if (ddNative) {
        ddNative.style.setProperty('display', 'none', 'important');
      }

      const bar = document.createElement('div');
      bar.className = 'azul-sort-button-bar';

      OF_PRIMARY.forEach((txt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'azul-sort-btn';
        btn.textContent = txt;
        btn.addEventListener('click', function () {
          ofApplyFilter(wrapper, txt, false);
        });
        bar.appendChild(btn);
      });

      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'azul-sort-btn ver-mais-btn';
      more.innerHTML = 'Ver mais ' + OF_SVG_ICON;
      bar.appendChild(more);

      const dd = document.createElement('div');
      dd.className = 'azul-sort-custom-dropdown';
      dd.style.display = 'none';
      const ul = document.createElement('ul');

      for (let i = 0; i < OF_SECONDARY.length; i++) {
        const opt = OF_SECONDARY[i];
        const li = document.createElement('li');
        li.setAttribute('data-value', opt);
        li.textContent = opt;
        ul.appendChild(li);
      }

      dd.appendChild(ul);
      wrapper.appendChild(dd);

      if (!more.hasAttribute('data-of-more-listener-added')) {
        more.setAttribute('data-of-more-listener-added', 'true');
        more.addEventListener('click', function (e) {
          e.stopPropagation();
          const isOpen = dd.style.display === 'block';
          if (isOpen) {
            dd.style.display = 'none';
            more.classList.remove('active');
          } else {
            dd.style.left = more.offsetLeft + 'px';
            dd.style.display = 'block';
            bar.querySelectorAll('.azul-sort-btn').forEach((b) => b.classList.remove('active'));
            more.classList.add('active');
          }
        });
      }

      if (!ul.hasAttribute('data-of-ul-listener-added')) {
        ul.setAttribute('data-of-ul-listener-added', 'true');
        ul.addEventListener('click', function (e) {
          const target = e.target;
          if (target && target.tagName === 'LI') {
            const val = target.getAttribute('data-value') || '';
            ofApplyFilter(wrapper, val, false);
            dd.style.display = 'none';
            bar.querySelectorAll('.azul-sort-btn').forEach((b) => b.classList.remove('active'));
            more.classList.add('active');
          }
        });
      }

      if (!wrapper.hasAttribute('data-of-doc-click-added')) {
        wrapper.setAttribute('data-of-doc-click-added', 'true');
        document.addEventListener('click', function (e) {
          if (!wrapper.contains(e.target)) {
            dd.style.display = 'none';
            more.classList.remove('active');
          }
        });
      }

      const labelEl = wrapper.querySelector(OF_SELECTORS.label);
      if (labelEl && labelEl.parentNode) {
        labelEl.parentNode.insertBefore(bar, labelEl.nextSibling);
      }

      ofApplyFilter(wrapper, 'Menor preço', true);
    });
  }

  function ofOrderSoldOutFlightsToEnd() {
    const sectionWrappers = document.querySelectorAll(OF_SELECTORS.contentWrapper);
    const flightItems = document.querySelectorAll(OF_SELECTORS.flightItem);

    if (!sectionWrappers || !flightItems) {
      return;
    }

    sectionWrappers.forEach((item) => {
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
    });

    Array.from(flightItems).forEach((card) => {
      const fareElement = card.querySelector('.flight-card__fare');
      const isSoldOut = fareElement && fareElement.getAttribute('aria-label') === 'Voo esgotado';
      card.style.order = isSoldOut ? '2' : '0';
    });
  }

  function ofCheckWrapperOfFlights() {
    return document.querySelector(OF_SELECTORS.contentWrapper) ? true : false;
  }

  function ofSetupForInitOrderSoldOutFlightsToEnd() {
    ofHandleFlightSelect();
    ofOrderSoldOutFlightsToEnd();
    ofAddingFlightsObserver();
    ofHandleClickBookingDate();
  }

  function ofAddingFlightsObserver() {
    if (!ofFlightItemsListObserver) {
      ofFlightItemsListObserver = new MutationObserver((mutations) => {
        const changed = mutations.some((m) => m.addedNodes.length > 0 || m.removedNodes.length > 0);
        if (changed) {
          ofOrderSoldOutFlightsToEnd();
        }
      });
    }

    document.querySelectorAll(OF_SELECTORS.contentWrapper).forEach((item) => {
      ofFlightItemsListObserver.observe(item, { childList: true });
    });
  }

  function ofSetupForHandleClickBookingDate() {
    const intervalReconstructionWrapper = setInterval(function () {
      const wrapperRemoved = !ofCheckWrapperOfFlights();

      if (wrapperRemoved) {
        clearInterval(intervalReconstructionWrapper);
        const intervalCheckFinished = setInterval(function () {
          const wrapperIsFinished = ofCheckWrapperOfFlights();
          if (wrapperIsFinished) {
            ofSetupForInitOrderSoldOutFlightsToEnd();
            clearInterval(intervalCheckFinished);
          }
        }, 150);
      }
    }, 100);
  }

  function ofHandleClickBookingDate() {
    const buttonsBookingDate = document.querySelectorAll(OF_SELECTORS.bookingDateButtons);
    buttonsBookingDate.forEach((button) => {
      if (button.hasAttribute('data-of-booking-listener-added')) {
        return;
      }
      button.setAttribute('data-of-booking-listener-added', 'true');
      button.addEventListener('click', ofSetupForHandleClickBookingDate);
    });
  }

  function ofHandleFlightSelect() {
    const buttonsFlightSelect = document.querySelectorAll(OF_SELECTORS.flightSelectButton);
    buttonsFlightSelect.forEach((button) => {
      if (button.hasAttribute('data-of-flight-select-listener-added')) {
        return;
      }
      button.setAttribute('data-of-flight-select-listener-added', 'true');
      button.addEventListener('click', function () {
        setTimeout(ofHandleClickBookingDate, 300);
      });
    });
  }

  function initOrdenacaoFiltros() {
    ofInjectCss();

    if (!ofComponentObserver) {
      ofComponentObserver = new MutationObserver(function () {
        ofInjectComponent();
      });
      ofComponentObserver.observe(document.body, { childList: true, subtree: true });
    }

    ofInjectComponent();
    ofSetupForInitOrderSoldOutFlightsToEnd();
  }

  // =========================
  // 4) PreSelectFare (pré-seleção + CTA flutuante)
  // =========================
  function psfAnalyticsEvent(eventLabel) {
    if (!eventLabel) {
      return;
    }
    analyticsSend('AT_pre_select_fare ' + eventLabel, '[PreSelectFare]');
  }

  function psfInjectStyles() {
    if (document.getElementById(PSF_STYLE_ID)) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = PSF_STYLE_ID;
    styles.textContent =
      '.pre-select-floating-cta { position: fixed; bottom: 0; left: 0; right: 0; background: #FFFFFF; padding: 20px; z-index: 9999; display: flex; justify-content: center; align-items: center; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1); }' +
      '.pre-select-floating-cta .floating-continue-btn { background: #008058; color: #FFFFFF; border: none; border-radius: 4px; padding: 14px 48px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; min-width: 280px; letter-spacing: 0.5px; font-family: "Helvetica Neue Medium", Arial; }' +
      '.pre-select-floating-cta .floating-continue-btn:hover:not(:disabled) { opacity: 0.9; }' +
      '.pre-select-floating-cta .floating-continue-btn:disabled, .pre-select-floating-cta .floating-continue-btn.disabled { background: #FFF !important; color: #999999 !important; cursor: not-allowed !important; opacity: 0.7; }' +
      'body .fare-selected-disabled { background: #FFF !important; color: #026CB6 !important; border: 1px solid #026CB6 !important; cursor: not-allowed !important; pointer-events: none !important; opacity: 1 !important; }' +
      'body .fare-selected-disabled .button__text, body .fare-selected-disabled .button__text--mobile { color: #026CB6 !important; }' +
      'button[aria-label="Tarifa esgotada"], button[aria-label="Tarifa esgotada"]:hover, button[aria-label="Tarifa esgotada"]:active, button[aria-label="Tarifa esgotada"]:focus { background: #F5F7F9 !important; border: 1px solid #D0D7DE !important; color: #94A5B1 !important; cursor: not-allowed !important; opacity: 1 !important; pointer-events: none !important; }' +
      'button[aria-label="Tarifa esgotada"] .button__text, button[aria-label="Tarifa esgotada"] .button__text--mobile { color: #94A5B1 !important; }' +
      '.fare-item-highlighted { position: relative; border: 1px solid #026CB6 !important; background-color: #EBF4FA !important; }' +
      'footer.pre-select-footer-adjusted { position: unset !important; }' +
      '.css-guj3i2 { background-color: #026AB6 !important; color: #FFF !important; border: 1px solid #026AB6 !important; }' +
      '.css-guj3i2:hover { background-color: #01589a !important; }' +
      '.css-ist1h5 { background-color: #EBF4FA !important; }' +
      '.css-ou6pmp { background: #FFF !important; color: #026CB6 !important; border: 1px solid #026CB6 !important; cursor: not-allowed !important; pointer-events: none !important; opacity: 1 !important; border-radius: 4px !important; }' +
      '@media (max-width: 768px) { .pre-select-floating-cta { padding: 15px; padding-top: 30px; } .pre-select-floating-cta .floating-continue-btn { width: 100%; padding: 14px 24px; font-size: 14px; } }';

    document.head.appendChild(styles);
  }

  function psfIsInFirstStep() {
    const priceCalendar = document.querySelector(
      '[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]',
    );
    const fareItems = document.querySelectorAll('.fare-item');
    const bookingCalendar = document.querySelector('.booking-calendar__cards');
    return !!(priceCalendar || (fareItems.length > 0 && bookingCalendar));
  }

  function psfIdentifyFareItemTrip(fareItem) {
    let current = fareItem;
    let depth = 0;

    while (current && current !== document.body && depth < 50) {
      depth = depth + 1;
      const className = current.className || '';
      const classStr = typeof className === 'string' ? className : className.baseVal || '';

      if (classStr.indexOf('trip-index-0') !== -1) {
        return 'ida';
      }
      if (classStr.indexOf('trip-index-1') !== -1) {
        return 'volta';
      }

      current = current.parentElement;
    }

    return 'desconhecido';
  }

  function psfGetVisibleFareItemsByTrip(enableLog) {
    const allFareItems = document.querySelectorAll('.fare-item');
    const result = { ida: [], volta: [], desconhecido: [] };

    allFareItems.forEach((fareItem) => {
      const rect = fareItem.getBoundingClientRect();
      const style = window.getComputedStyle(fareItem);
      const isVisible =
        rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';

      if (!isVisible) {
        return;
      }

      const trip = psfIdentifyFareItemTrip(fareItem);
      result[trip].push(fareItem);
    });

    if (enableLog) {
      console.log(
        '[PreSelectFare] Fare-items: IDA=' + result.ida.length + ' VOLTA=' + result.volta.length,
      );
    }

    return result;
  }

  function psfFindMostExpensiveFromList(fareItems, tripName) {
    if (!fareItems || fareItems.length === 0) {
      return null;
    }

    let maxPrice = -1;
    let mostExpensiveFare = null;

    fareItems.forEach((fareItem) => {
      if (fareItem.classList.contains('fare-item-highlighted')) {
        return;
      }

      const fareName = fareItem.querySelector('.promotional, .fare-price p');
      if (fareName && safeTrimLower(fareName.textContent).includes('business')) {
        return;
      }

      const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
      if (!selectButton) {
        return;
      }

      if (safeTrimLower(selectButton.textContent).includes('esgotada')) {
        return;
      }

      const priceElement = fareItem.querySelector('[data-test-id="fare-price"]');
      if (!priceElement) {
        return;
      }

      const rawText = priceElement.textContent || '';
      const priceText = rawText
        .replace(/[^\d.,]/g, '')
        .replace(/\.(?=\d{3})/g, '')
        .replace(',', '.');
      const price = parseFloat(priceText);

      if (!isNaN(price) && price > maxPrice) {
        maxPrice = price;
        mostExpensiveFare = fareItem;
      }
    });

    if (mostExpensiveFare) {
      console.log('[PreSelectFare] Tarifa mais cara ' + tripName + ': R$' + maxPrice.toFixed(2));
    }

    return mostExpensiveFare;
  }

  function psfCheckIfFareAlreadySelected(tripContainer) {
    const searchScope = tripContainer || document;

    if (searchScope.querySelector('[aria-label*="Alterar esta tarifa"]')) {
      return true;
    }
    if (searchScope.querySelector('.css-ou6pmp')) {
      return true;
    }

    const selectedIndicators = [
      '.fare-item.selected',
      '.fare-item.active',
      '.fare-item [aria-selected="true"]',
    ];
    for (let i = 0; i < selectedIndicators.length; i++) {
      const selector = selectedIndicators[i];
      const selected = searchScope.querySelector(selector);
      if (selected && !selected.hasAttribute('data-pre-select-modified')) {
        return true;
      }
    }

    const disabledButtons = searchScope.querySelectorAll('[data-test-id="select-fare"][disabled]');
    for (let i = 0; i < disabledButtons.length; i++) {
      const btn = disabledButtons[i];
      if (btn.hasAttribute('data-pre-select-modified')) {
        continue;
      }
      if (!safeTrimLower(btn.textContent).includes('esgotada')) {
        return true;
      }
    }

    return false;
  }

  function psfModifyExpensiveFareButton(fareItem) {
    if (!fareItem) {
      return null;
    }
    const selectButton = fareItem.querySelector('[data-test-id="select-fare"]');
    if (!selectButton) {
      return null;
    }
    if (selectButton.hasAttribute('data-pre-select-modified')) {
      return selectButton;
    }

    selectButton.setAttribute('data-pre-select-modified', 'true');
    if (!selectButton.hasAttribute('data-original-text')) {
      const buttonTexts = selectButton.querySelectorAll('.button__text, .button__text--mobile');
      if (buttonTexts.length > 0) {
        selectButton.setAttribute('data-original-text', buttonTexts[0].textContent || '');
      }
    }

    const buttonTexts = selectButton.querySelectorAll('.button__text, .button__text--mobile');
    buttonTexts.forEach((textEl) => {
      textEl.textContent = 'Tarifa selecionada';
    });

    selectButton.classList.add('fare-selected-disabled');
    selectButton.setAttribute('disabled', 'true');
    fareItem.classList.add('fare-item-highlighted');

    return selectButton;
  }

  function psfCountSelectedFares() {
    let count = 0;
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');

    if (tripContainers.length > 0) {
      tripContainers.forEach((container) => {
        if (psfCheckIfFareAlreadySelected(container)) {
          count = count + 1;
        }
      });
    } else {
      if (psfCheckIfFareAlreadySelected()) {
        count = 1;
      }
    }

    return count;
  }

  function psfHasVisiblePreSelectedButton() {
    const btn = document.querySelector('[data-pre-select-modified]');
    if (!btn) {
      return false;
    }
    const rect = btn.getBoundingClientRect();
    return rect.height > 0;
  }

  function psfGetMissingTripSelection() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    if (tripContainers.length === 0) {
      return { missing: 'tarifa', idaSelected: false, voltaSelected: false };
    }

    let idaSelected = false;
    let voltaSelected = false;

    tripContainers.forEach((container) => {
      const isIda = (container.className || '').indexOf('trip-index-0') !== -1;
      const isVolta = (container.className || '').indexOf('trip-index-1') !== -1;
      const hasSelection = psfCheckIfFareAlreadySelected(container);

      if (isIda && hasSelection) {
        idaSelected = true;
      }
      if (isVolta && hasSelection) {
        voltaSelected = true;
      }
    });

    let missing = null;
    if (!idaSelected && !voltaSelected) {
      missing = 'ambas';
    } else if (!idaSelected) {
      missing = 'ida';
    } else if (!voltaSelected) {
      missing = 'volta';
    }

    return { missing: missing, idaSelected: idaSelected, voltaSelected: voltaSelected };
  }

  function psfGetFareContextHash() {
    const fareItems = psfGetVisibleFareItemsByTrip(false);

    const idaPrices = fareItems.ida
      .map((item) => {
        const el = item.querySelector('[data-test-id="fare-price"]');
        return el ? (el.textContent || '').trim() : '';
      })
      .filter((p) => p)
      .sort()
      .join(',');

    const voltaPrices = fareItems.volta
      .map((item) => {
        const el = item.querySelector('[data-test-id="fare-price"]');
        return el ? (el.textContent || '').trim() : '';
      })
      .filter((p) => p)
      .sort()
      .join(',');

    return (
      'ida:' +
      fareItems.ida.length +
      ':' +
      idaPrices +
      '|volta:' +
      fareItems.volta.length +
      ':' +
      voltaPrices
    );
  }

  function psfUpdateFooterStyle(isBarVisible) {
    const footer = document.querySelector('footer');
    if (!footer) {
      return;
    }

    if (isBarVisible) {
      footer.classList.add('pre-select-footer-adjusted');
    } else {
      footer.classList.remove('pre-select-footer-adjusted');
    }
  }

  function psfCloseExpandedDetails() {
    const recolherButtons = document.querySelectorAll('button');
    recolherButtons.forEach((btn) => {
      const text = safeTrimLower(btn.textContent);
      if (text === 'recolher') {
        const flightCard = btn.closest('.flight-card');
        if (flightCard && flightCard.classList.contains('flight-card--opened')) {
          btn.click();
        }
      }
    });

    const expandedButtons = document.querySelectorAll('.btn-fare[aria-pressed="true"]');
    expandedButtons.forEach((btn) => {
      const text = safeTrimLower(btn.textContent);
      if (text === 'recolher') {
        btn.click();
      }
    });
  }

  function psfUpdateFloatingCTAState(floatingCTA, originalButton) {
    if (!floatingCTA) {
      return;
    }

    const continueButton = floatingCTA.querySelector('.floating-continue-btn');
    if (!continueButton) {
      return;
    }

    const newBtn = continueButton.cloneNode(true);
    continueButton.parentNode.replaceChild(newBtn, continueButton);

    floatingCTA.style.display = 'flex';
    document.body.classList.add('pre-select-fare-active');
    psfUpdateFooterStyle(true);

    const selectedCount = psfCountSelectedFares();
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    const totalTrips = tripContainers.length || 1;
    const hasPreSelectedVisible = psfHasVisiblePreSelectedButton();
    const tripStatus = psfGetMissingTripSelection();

    if (selectedCount >= totalTrips) {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.textContent = 'Continuar';
      newBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        psfAnalyticsEvent('Continuar - Todas tarifas selecionadas');

        const modifiedBtn = document.querySelector('[data-pre-select-modified]');
        if (modifiedBtn) {
          modifiedBtn.classList.remove('fare-selected-disabled');
          modifiedBtn.removeAttribute('disabled');
          modifiedBtn.style.pointerEvents = 'auto';
          modifiedBtn.click();

          setTimeout(function () {
            psfCloseExpandedDetails();
          }, 150);
        }

        setTimeout(function () {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
          psfUpdateFooterStyle(false);
        }, 100);
      });
      return;
    }

    if (
      selectedCount > 0 &&
      selectedCount < totalTrips &&
      totalTrips > 1 &&
      hasPreSelectedVisible
    ) {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.textContent = 'Continuar';
      newBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        psfAnalyticsEvent('Continuar - Confirmar tarifa');

        const preSelectedBtn = document.querySelector('[data-pre-select-modified]');
        if (preSelectedBtn) {
          preSelectedBtn.classList.remove('fare-selected-disabled');
          preSelectedBtn.removeAttribute('disabled');
          preSelectedBtn.style.pointerEvents = 'auto';
          preSelectedBtn.click();

          setTimeout(function () {
            psfCloseExpandedDetails();
          }, 150);
        }
      });
      return;
    }

    if (selectedCount > 0 && selectedCount < totalTrips && totalTrips > 1) {
      newBtn.disabled = true;
      newBtn.classList.add('disabled');

      if (tripStatus.missing === 'ida') {
        newBtn.textContent = 'Selecione a tarifa de ida';
      } else if (tripStatus.missing === 'volta') {
        newBtn.textContent = 'Selecione a tarifa da volta';
      } else {
        newBtn.textContent = 'Selecione uma tarifa';
      }
      return;
    }

    if (originalButton && !originalButton.userSelected) {
      newBtn.disabled = false;
      newBtn.classList.remove('disabled');
      newBtn.textContent = 'Continuar';
      newBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        psfAnalyticsEvent('Continuar - Floating CTA');

        originalButton.classList.remove('fare-selected-disabled');
        originalButton.removeAttribute('disabled');
        originalButton.style.pointerEvents = 'auto';
        originalButton.click();

        setTimeout(function () {
          psfCloseExpandedDetails();
        }, 150);

        setTimeout(function () {
          floatingCTA.style.display = 'none';
          document.body.classList.remove('pre-select-fare-active');
          psfUpdateFooterStyle(false);
        }, 50);
      });
      return;
    }

    newBtn.disabled = true;
    newBtn.classList.add('disabled');
    newBtn.textContent = 'Selecione uma tarifa';
  }

  function psfCreateFloatingCTA(originalButton) {
    let existingCTA = document.querySelector('.pre-select-floating-cta');

    if (existingCTA) {
      psfUpdateFloatingCTAState(existingCTA, originalButton);
      return existingCTA;
    }

    const floatingDiv = document.createElement('div');
    floatingDiv.className = 'pre-select-floating-cta';

    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.cssText =
      'max-width: 920px; width: 100%; display: flex; justify-content: end;';

    const continueButton = document.createElement('button');
    continueButton.className = 'floating-continue-btn';
    continueButton.textContent = 'Continuar';
    continueButton.setAttribute('data-test-id', 'pre-select-continue-btn');

    wrapperDiv.appendChild(continueButton);
    floatingDiv.appendChild(wrapperDiv);
    document.body.appendChild(floatingDiv);

    psfUpdateFloatingCTAState(floatingDiv, originalButton);
    return floatingDiv;
  }

  function psfApplySelection() {
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');

    if (tripContainers.length === 0) {
      if (psfCheckIfFareAlreadySelected()) {
        return false;
      }

      const fareItems = psfGetVisibleFareItemsByTrip(true);
      const allFares = fareItems.ida.concat(fareItems.volta).concat(fareItems.desconhecido);
      const mostExpensive = psfFindMostExpensiveFromList(allFares, 'SIMPLES');
      if (!mostExpensive) {
        return false;
      }

      const btn = psfModifyExpensiveFareButton(mostExpensive);
      if (!btn) {
        return false;
      }

      psfCreateFloatingCTA(btn);
      return true;
    }

    const fareItems = psfGetVisibleFareItemsByTrip(true);

    let idaSelected = false;
    let voltaSelected = false;

    tripContainers.forEach((container) => {
      const isIda = (container.className || '').indexOf('trip-index-0') !== -1;
      const isVolta = (container.className || '').indexOf('trip-index-1') !== -1;

      if (isIda && psfCheckIfFareAlreadySelected(container)) {
        idaSelected = true;
      }
      if (isVolta && psfCheckIfFareAlreadySelected(container)) {
        voltaSelected = true;
      }
    });

    const appliedSelections = [];

    if (!idaSelected && fareItems.ida.length > 0) {
      const existing = fareItems.ida.find((item) =>
        item.classList.contains('fare-item-highlighted'),
      );
      if (existing) {
        const btn = existing.querySelector('[data-pre-select-modified]');
        if (btn) {
          appliedSelections.push(btn);
        }
      } else {
        const mostExpensive = psfFindMostExpensiveFromList(fareItems.ida, 'IDA');
        if (mostExpensive) {
          const btn = psfModifyExpensiveFareButton(mostExpensive);
          if (btn) {
            appliedSelections.push(btn);
          }
        }
      }
    }

    if (!voltaSelected && fareItems.volta.length > 0) {
      const existing = fareItems.volta.find((item) =>
        item.classList.contains('fare-item-highlighted'),
      );
      if (existing) {
        const btn = existing.querySelector('[data-pre-select-modified]');
        if (btn) {
          appliedSelections.push(btn);
        }
      } else {
        const mostExpensive = psfFindMostExpensiveFromList(fareItems.volta, 'VOLTA');
        if (mostExpensive) {
          const btn = psfModifyExpensiveFareButton(mostExpensive);
          if (btn) {
            appliedSelections.push(btn);
          }
        }
      }
    }

    if (appliedSelections.length > 0) {
      psfCreateFloatingCTA(appliedSelections[0]);
      return true;
    }

    return false;
  }

  function psfResetCurrentSelection() {
    const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
    modifiedButtons.forEach((btn) => {
      btn.removeAttribute('data-pre-select-modified');
      btn.classList.remove('fare-selected-disabled');
      btn.removeAttribute('disabled');
      btn.style.pointerEvents = '';
      const originalText = btn.getAttribute('data-original-text');
      const texts = btn.querySelectorAll('.button__text, .button__text--mobile');
      texts.forEach((t) => {
        t.textContent = originalText || 'Selecionar tarifa';
      });
      btn.removeAttribute('data-original-text');
    });

    document
      .querySelectorAll('.fare-item-highlighted')
      .forEach((item) => item.classList.remove('fare-item-highlighted'));

    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (floatingCTA) {
      floatingCTA.style.display = 'none';
    }

    document.body.classList.remove('pre-select-fare-active');
    psfUpdateFooterStyle(false);
    psfLastApplyAttempt = null;
    psfLastCTAState = null;
    psfConsecutiveFailedAttempts = 0;
  }

  function psfCheckFaresVisibility() {
    if (psfIsProcessingChange) {
      return;
    }

    if (!psfIsInFirstStep()) {
      const floatingCTA = document.querySelector('.pre-select-floating-cta');
      if (floatingCTA) {
        floatingCTA.style.display = 'none';
        document.body.classList.remove('pre-select-fare-active');
        psfUpdateFooterStyle(false);
      }
      return;
    }

    const fareItems = psfGetVisibleFareItemsByTrip(false);
    const totalVisible =
      fareItems.ida.length + fareItems.volta.length + fareItems.desconhecido.length;

    if (totalVisible === 0) {
      if (psfLastVisibilityState !== false) {
        psfLastVisibilityState = false;
        psfCurrentFareContext = null;
        psfLastApplyAttempt = null;
        psfLastCTAState = null;
        psfConsecutiveFailedAttempts = 0;
        const floatingCTA = document.querySelector('.pre-select-floating-cta');
        if (floatingCTA) {
          psfUpdateFloatingCTAState(floatingCTA, null);
        }
      }
      return;
    }

    const modifiedButton = document.querySelector('[data-pre-select-modified]');
    const isModifiedVisible = modifiedButton
      ? modifiedButton.getBoundingClientRect().height > 0
      : false;

    let floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (!floatingCTA) {
      floatingCTA = psfCreateFloatingCTA(null);
    }

    const selectedCount = psfCountSelectedFares();
    const tripContainers = document.querySelectorAll('[class*="trip-index"]');
    const totalTrips = tripContainers.length || 1;

    if (selectedCount >= totalTrips && selectedCount > 0) {
      const currentState = 'all_selected_' + selectedCount;
      if (psfLastCTAState !== currentState) {
        psfLastCTAState = currentState;
        psfConsecutiveFailedAttempts = 0;
        psfUpdateFloatingCTAState(floatingCTA, { allSelected: true });
      }
      return;
    }

    const newContext = psfGetFareContextHash();

    if (modifiedButton && !isModifiedVisible) {
      modifiedButton.removeAttribute('data-pre-select-modified');
      modifiedButton.classList.remove('fare-selected-disabled');
      modifiedButton.removeAttribute('disabled');
      modifiedButton.style.pointerEvents = '';

      const fareItem = modifiedButton.closest('.fare-item');
      if (fareItem) {
        fareItem.classList.remove('fare-item-highlighted');
      }

      psfLastApplyAttempt = null;
      psfLastCTAState = null;
      psfConsecutiveFailedAttempts = 0;
    }

    if (
      psfCurrentFareContext &&
      psfCurrentFareContext !== newContext &&
      modifiedButton &&
      isModifiedVisible
    ) {
      psfIsProcessingChange = true;
      psfResetCurrentSelection();
      psfCurrentFareContext = newContext;

      setTimeout(function () {
        psfApplySelection();
        psfCurrentFareContext = psfGetFareContextHash();
        psfLastVisibilityState = true;
        psfLastApplyAttempt = psfCurrentFareContext;
        psfIsProcessingChange = false;

        const btn = document.querySelector('[data-pre-select-modified]');
        psfUpdateFloatingCTAState(floatingCTA, btn);
      }, 100);
      return;
    }

    let idaSelected = false;
    let voltaSelected = false;

    tripContainers.forEach((container) => {
      const isIda = (container.className || '').indexOf('trip-index-0') !== -1;
      const isVolta = (container.className || '').indexOf('trip-index-1') !== -1;

      if (isIda && psfCheckIfFareAlreadySelected(container)) {
        idaSelected = true;
      }
      if (isVolta && psfCheckIfFareAlreadySelected(container)) {
        voltaSelected = true;
      }
    });

    const idaNeedsSelection = !idaSelected && fareItems.ida.length > 0;
    const voltaNeedsSelection = !voltaSelected && fareItems.volta.length > 0;
    const hasUnselected = idaNeedsSelection || voltaNeedsSelection;

    if (!(modifiedButton && isModifiedVisible) && hasUnselected) {
      if (psfConsecutiveFailedAttempts >= 5) {
        if (newContext !== psfLastApplyAttempt) {
          psfConsecutiveFailedAttempts = 0;
          psfLastApplyAttempt = null;
        } else {
          psfUpdateFloatingCTAState(floatingCTA, null);
          return;
        }
      }

      const applied = psfApplySelection();
      if (!applied) {
        psfConsecutiveFailedAttempts = psfConsecutiveFailedAttempts + 1;
      } else {
        psfConsecutiveFailedAttempts = 0;
      }

      psfCurrentFareContext = psfGetFareContextHash();
      psfLastVisibilityState = true;
      psfLastApplyAttempt = psfCurrentFareContext;
      psfLastCTAState = null;

      const btn = applied ? document.querySelector('[data-pre-select-modified]') : null;
      psfUpdateFloatingCTAState(floatingCTA, btn);
      return;
    }

    psfCurrentFareContext = newContext;
    if (psfLastVisibilityState !== true || (modifiedButton && isModifiedVisible)) {
      psfLastVisibilityState = true;
      psfLastCTAState = null;
      psfConsecutiveFailedAttempts = 0;
      psfUpdateFloatingCTAState(floatingCTA, modifiedButton);
    }
  }

  function psfSetupObserver() {
    if (window._preSelectFareObserver) {
      return;
    }

    let localDebounceTimer = null;
    const observer = new MutationObserver((mutations) => {
      if (psfIsProcessingChange) {
        return;
      }

      const shouldIgnore = mutations.some((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target && target.nodeType === 1) {
            if (
              target.classList?.contains('pre-select-floating-cta') ||
              target.classList?.contains('floating-continue-btn') ||
              target.closest?.('.pre-select-floating-cta')
            ) {
              return true;
            }
          }
        }

        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);

          const hasFloatingCTA = addedNodes.some((node) => {
            return (
              node.nodeType === 1 &&
              (node.classList?.contains('pre-select-floating-cta') ||
                node.querySelector?.('.pre-select-floating-cta'))
            );
          });

          const removedFloatingCTA = removedNodes.some((node) => {
            return (
              node.nodeType === 1 &&
              (node.classList?.contains('pre-select-floating-cta') ||
                node.querySelector?.('.pre-select-floating-cta'))
            );
          });

          return hasFloatingCTA || removedFloatingCTA;
        }

        return false;
      });

      if (shouldIgnore) {
        return;
      }

      if (!psfIsInitialized) {
        const fareItems = document.querySelectorAll('.fare-item');
        if (fareItems.length > 0) {
          psfIsInitialized = true;
          psfCheckFaresVisibility();
        }
        return;
      }

      if (localDebounceTimer) {
        clearTimeout(localDebounceTimer);
      }
      localDebounceTimer = setTimeout(psfCheckFaresVisibility, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    window._preSelectFareObserver = observer;
  }

  function psfSetupCalendarObserver() {
    if (psfCalendarObserver) {
      return;
    }

    psfCalendarObserver = new MutationObserver(() => {
      const priceCalendar = document.querySelector(
        '[aria-label="Calendário de preços. Veja os preços próximos aos dias de sua busca. Selecionar"]',
      );

      if (priceCalendar && psfIsSecondStep) {
        psfIsSecondStep = false;
        psfIsInitialized = false;
        psfIsProcessingChange = false;
        psfCurrentFareContext = null;
        psfLastVisibilityState = null;
        psfConsecutiveFailedAttempts = 0;

        psfResetCurrentSelection();

        setTimeout(() => {
          const fareItems = document.querySelectorAll('.fare-item');
          if (fareItems.length > 0) {
            psfIsInitialized = true;
            psfCheckFaresVisibility();
          }
        }, 150);
      }
    });

    psfCalendarObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label'],
    });
  }

  function psfSetupFallbackChecker() {
    let fallbackAttempts = 0;
    const maxFallbackAttempts = 3;

    const fallbackInterval = setInterval(() => {
      fallbackAttempts = fallbackAttempts + 1;

      if (fallbackAttempts >= maxFallbackAttempts) {
        clearInterval(fallbackInterval);
        return;
      }

      if (!psfIsInFirstStep()) {
        clearInterval(fallbackInterval);
        return;
      }

      const fareItems = psfGetVisibleFareItemsByTrip(false);
      const totalVisible =
        fareItems.ida.length + fareItems.volta.length + fareItems.desconhecido.length;

      if (totalVisible === 0) {
        return;
      }

      const hasPreSelection = document.querySelector('[data-pre-select-modified]');
      if (hasPreSelection) {
        clearInterval(fallbackInterval);
        return;
      }

      const selectedCount = psfCountSelectedFares();
      if (selectedCount > 0) {
        clearInterval(fallbackInterval);
        return;
      }

      const applied = psfApplySelection();
      if (applied) {
        clearInterval(fallbackInterval);
      }
    }, 1000);
  }

  function initPreSelectFare() {
    psfInjectStyles();
    psfSetupObserver();
    psfSetupCalendarObserver();

    const fareItems = document.querySelectorAll('.fare-item');
    if (fareItems.length > 0) {
      psfIsInitialized = true;
      psfCheckFaresVisibility();
    }

    psfSetupFallbackChecker();

    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount = pollCount + 1;
      if (pollCount >= 60 || psfIsInitialized) {
        clearInterval(pollInterval);
        return;
      }
      const items = document.querySelectorAll('.fare-item');
      if (items.length > 0) {
        psfIsInitialized = true;
        psfCheckFaresVisibility();
        clearInterval(pollInterval);
      }
    }, 50);
  }

  // Mantém a função de reset para debug/teste
  window.resetPreSelectFare = function () {
    psfCurrentFareContext = null;
    psfLastVisibilityState = null;
    psfIsInitialized = false;
    psfIsProcessingChange = false;
    psfIsSecondStep = false;
    psfConsecutiveFailedAttempts = 0;
    psfLastApplyAttempt = null;
    psfLastCTAState = null;

    const floatingCTA = document.querySelector('.pre-select-floating-cta');
    if (floatingCTA) {
      floatingCTA.remove();
    }

    const modifiedButtons = document.querySelectorAll('[data-pre-select-modified]');
    modifiedButtons.forEach((btn) => {
      btn.removeAttribute('data-pre-select-modified');
      btn.classList.remove('fare-selected-disabled');
      btn.removeAttribute('disabled');
      btn.style.pointerEvents = '';
      const texts = btn.querySelectorAll('.button__text, .button__text--mobile');
      texts.forEach((t) => {
        t.textContent = 'Selecionar tarifa';
      });
      btn.removeAttribute('data-original-text');
    });

    const highlightedItems = document.querySelectorAll('.fare-item-highlighted');
    highlightedItems.forEach((item) => item.classList.remove('fare-item-highlighted'));

    document.body.classList.remove('pre-select-fare-active');

    if (window._preSelectFareObserver) {
      window._preSelectFareObserver.disconnect();
      window._preSelectFareObserver = null;
    }
  };

  // =========================
  // Start
  // =========================
  function initAll() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    if (!onTargetPage()) {
      isProcessing = false;
      return;
    }

    if (!isDesktop()) {
      isProcessing = false;
      return;
    }

    initTariffRecommendation();
    initTariffIcons();
    initOrdenacaoFiltros();
    initPreSelectFare();

    isProcessing = false;
  }

  if (window.compiladoSelectInitialized) {
    return;
  }
  window.compiladoSelectInitialized = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      debounce(initAll, 0);
    });
  } else {
    debounce(initAll, 0);
  }
})();
