(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_BeneficiosCartaoCredito';
  const STYLE_ID = 'at-beneficios-cc-style';
  const COMPONENT_ID = 'at-beneficios-cc';
  const DATA_INJECTED = 'data-at-beneficios-cc';
  const DATA_VIEW = 'data-at-beneficios-cc-view';
  const ACTIVITY = EXPERIMENT_NAME;
  const CONTEXT = 'tela_pagamento';

  const SELECTORS = {
    creditCardContainer: '[data-test-id="fop-credit-card-container"]',
    creditCardSelect: '[data-test-id="fop-credit-card-select"]',
    hideContent: '[data-test-id="fop-cc-hide-content"]',
    showContent: '[data-test-id="fop-cc-show-content"]',
    cardListContent: '[data-test-id="fop-cc-card-list-content"]',
    addNewCard: '[data-test-id="fop-credit-card-add-new-card"]',
  };

  const ICON_TAG =
    '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M13.78 7.22L8.28 1.72A.75.75 0 007.75 1.5H2.5A1 1 0 001.5 2.5v5.25a.75.75 0 00.22.53l5.5 5.5a.75.75 0 001.06 0l5.5-5.5a.75.75 0 000-1.06z" fill="#FFFFFF"/>' +
    '<circle cx="4.25" cy="4.25" r="1" fill="rgb(4, 30, 66)"/>' +
    '</svg>';

  const ICON_CARDS =
    '<svg width="16" height="14" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect x="0.5" y="2.5" width="13" height="9" rx="1.2" fill="#FFFFFF"/>' +
    '<path d="M0.5 5h13" stroke="rgb(4, 30, 66)" stroke-width="1.2"/>' +
    '<rect x="4" y="4.5" width="13" height="9" rx="1.2" fill="#FFFFFF"/>' +
    '<path d="M4 7h13" stroke="rgb(4, 30, 66)" stroke-width="1.2"/>' +
    '</svg>';

  const BRAZIL_COUNTRY = { BR: 1, BRA: 1, BRASIL: 1, BRAZIL: 1 };

  let isProcessing = false;
  let debounceTimer = null;
  let observerStarted = false;
  let lastDetectionLogKey = '';
  let flightDetection = null;

  if (window[EXPERIMENT_NAME]) {
    return;
  }
  window[EXPERIMENT_NAME] = true;

  function isTargetPage() {
    const path = window.location.pathname || '';
    return (
      path.indexOf('/payment') !== -1 ||
      !!document.querySelector(SELECTORS.creditCardContainer)
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '[' +
      DATA_INJECTED +
      '="true"]{' +
      'display:flex !important;' +
      'align-items:center !important;' +
      '}' +
      '.at-beneficios-cc-original-hidden{' +
      'display:none !important;' +
      '}' +
      '#' +
      COMPONENT_ID +
      '{' +
      'display:inline-flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'flex-wrap:nowrap;' +
      'flex:0 0 auto;' +
      'gap:8px;' +
      'box-sizing:border-box;' +
      'margin-left:auto;' +
      'margin-right:8px;' +
      'padding:6px 12px;' +
      'background:rgb(4, 30, 66);' +
      'border-radius:4px;' +
      'line-height:1.2;' +
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-beneficios-cc__item{' +
      'display:inline-flex;' +
      'align-items:center;' +
      'gap:6px;' +
      'color:#FFFFFF;' +
      'line-height:1.2;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-beneficios-cc__divider{' +
      'flex-shrink:0;' +
      'width:1px;' +
      'height:12px;' +
      'background:rgba(255, 255, 255, 0.45);' +
      'align-self:center;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-beneficios-cc__icon{' +
      'display:inline-flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'flex-shrink:0;' +
      'width:12px;' +
      'height:12px;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-beneficios-cc__icon svg{' +
      'display:block;' +
      'width:100%;' +
      'height:100%;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-beneficios-cc__label{' +
      'font-size:12px;' +
      'font-weight:400;' +
      'letter-spacing:0;' +
      'white-space:nowrap;' +
      'color:#FFFFFF;' +
      '}';

    document.head.appendChild(style);
  }

  function normalizeKey(key) {
    return String(key || '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }

  function createSignalBag() {
    return {
      explicitInternational: false,
      explicitNational: false,
      countries: [],
      clues: [],
    };
  }

  function addClue(acc, clue) {
    if (!clue) return;
    if (acc.clues.indexOf(clue) === -1) {
      acc.clues.push(clue);
    }
  }

  function addCountry(acc, value) {
    if (value == null) return;
    const country = String(value).toUpperCase().trim();
    if (country.length < 2 || country.length > 10) return;
    if (acc.countries.indexOf(country) === -1) {
      acc.countries.push(country);
    }
  }

  function hasStationHint(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return !!(
      obj.code ||
      obj.iata ||
      obj.iataCode ||
      obj.stationCode ||
      obj.locationCode ||
      obj.airportCode ||
      obj.std ||
      obj.airport ||
      obj.station ||
      obj.latitude ||
      obj.longitude ||
      obj.lat ||
      obj.lon
    );
  }

  function inspectObject(obj, acc) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

    if (obj.isInternational === true || obj.international === true || obj.internationalFlight === true) {
      acc.explicitInternational = true;
      addClue(acc, 'flag isInternational=true');
    }
    if (obj.isDomestic === true || obj.domestic === true || obj.national === true) {
      acc.explicitNational = true;
      addClue(acc, 'flag isDomestic=true');
    }

    let country = obj.countryCode || obj.isoCountry || obj.countryIso || obj.stationCountry;
    if (!country && typeof obj.country === 'string') country = obj.country;
    if (!country && obj.country && typeof obj.country === 'object') {
      country = obj.country.code || obj.country.iso || obj.country.iso2 || obj.country.isoCode;
    }

    if (country && hasStationHint(obj)) {
      addCountry(acc, country);
      addClue(acc, 'pais de estacao: ' + String(country).toUpperCase());
    }
  }

  function applyTypeText(acc, raw) {
    if (raw == null) return;
    const text = String(raw).toLowerCase();
    if (!text) return;

    if (
      text.indexOf('internacional') !== -1 ||
      text.indexOf('international') !== -1
    ) {
      acc.explicitInternational = true;
      addClue(acc, 'texto internacional: ' + text.slice(0, 80));
    }

    if (
      text === 'nacional' ||
      text === 'domestic' ||
      text === 'national' ||
      text === 'dom'
    ) {
      acc.explicitNational = true;
      addClue(acc, 'texto nacional: ' + text);
    }
  }

  function walkFlightSignals(root, acc) {
    if (!root || typeof root !== 'object') return;

    const seen = typeof WeakSet === 'function' ? new WeakSet() : null;
    const queue = [{ v: root, d: 0 }];
    let nodes = 0;
    const maxNodes = 6000;
    const maxDepth = 12;

    while (queue.length && nodes < maxNodes) {
      const item = queue.shift();
      nodes += 1;
      if (!item || !item.v || typeof item.v !== 'object') continue;
      if (seen) {
        if (seen.has(item.v)) continue;
        seen.add(item.v);
      }

      inspectObject(item.v, acc);

      if (Array.isArray(item.v)) {
        if (item.d >= maxDepth) continue;
        for (let i = 0; i < item.v.length; i++) {
          const child = item.v[i];
          if (child && typeof child === 'object') {
            queue.push({ v: child, d: item.d + 1 });
          }
        }
        continue;
      }

      for (const key in item.v) {
        if (!Object.prototype.hasOwnProperty.call(item.v, key)) continue;
        const value = item.v[key];
        const nKey = normalizeKey(key);

        if (
          nKey.indexOf('international') !== -1 ||
          nKey.indexOf('internacional') !== -1 ||
          nKey.indexOf('domestic') !== -1 ||
          nKey.indexOf('nacional') !== -1 ||
          nKey === 'journeytype' ||
          nKey === 'flighttype' ||
          nKey === 'market' ||
          nKey === 'markettype' ||
          nKey === 'geography'
        ) {
          if (value === true || value === 'true' || value === 1) {
            if (nKey.indexOf('international') !== -1 || nKey.indexOf('internacional') !== -1) {
              acc.explicitInternational = true;
              addClue(acc, 'chave ' + key + '=true');
            }
            if (nKey.indexOf('domestic') !== -1 || nKey.indexOf('nacional') !== -1) {
              acc.explicitNational = true;
              addClue(acc, 'chave ' + key + '=true');
            }
          }
          applyTypeText(acc, value);
        }

        if (
          (nKey.indexOf('origincountry') !== -1 ||
            nKey.indexOf('destinationcountry') !== -1 ||
            nKey.indexOf('departurecountry') !== -1 ||
            nKey.indexOf('arrivalcountry') !== -1 ||
            nKey.indexOf('stationcountry') !== -1) &&
          typeof value === 'string'
        ) {
          addCountry(acc, value);
          addClue(acc, key + '=' + value);
        }

        if (item.d < maxDepth && value && typeof value === 'object') {
          queue.push({ v: value, d: item.d + 1 });
        }
      }
    }
  }

  function getAzulDataLayer() {
    const candidates = [];

    if (window.azulObject && typeof window.azulObject === 'object') {
      candidates.push({ data: window.azulObject, source: 'window.azulObject' });
    }

    try {
      const raw = sessionStorage.getItem('temp_azulObject_push');
      if (raw) {
        candidates.push({
          data: JSON.parse(raw),
          source: 'sessionStorage.temp_azulObject_push',
        });
      }
    } catch (e) {}

    for (let i = 0; i < candidates.length; i++) {
      if (readJourneyDomestic(candidates[i].data)) {
        return candidates[i];
      }
    }

    return candidates.length ? candidates[0] : null;
  }

  function readJourneyDomestic(dataLayer) {
    if (!dataLayer || !Array.isArray(dataLayer.journey) || !dataLayer.journey.length) {
      return null;
    }

    const details = [];
    let hasDomesticFalse = false;
    let hasDomesticTrue = false;
    let missingDomestic = false;

    for (let i = 0; i < dataLayer.journey.length; i++) {
      const journey = dataLayer.journey[i];
      if (!journey || typeof journey !== 'object') {
        missingDomestic = true;
        continue;
      }

      const origin = journey.origin || '?';
      const destination = journey.destination || '?';

      if (typeof journey.domestic !== 'boolean') {
        missingDomestic = true;
        details.push(origin + '-' + destination + ' domestic=ausente');
        continue;
      }

      details.push(origin + '-' + destination + ' domestic=' + journey.domestic);

      if (journey.domestic === true) {
        hasDomesticTrue = true;
      } else {
        hasDomesticFalse = true;
      }
    }

    if (!hasDomesticTrue && !hasDomesticFalse) return null;

    return {
      isDomestic: !hasDomesticFalse,
      hasDomesticFalse: hasDomesticFalse,
      hasDomesticTrue: hasDomesticTrue,
      missingDomestic: missingDomestic,
      details: details,
    };
  }

  function getNextData() {
    if (window.__NEXT_DATA__) return window.__NEXT_DATA__;

    const script = document.getElementById('__NEXT_DATA__');
    if (!script || !script.textContent) return null;

    try {
      return JSON.parse(script.textContent);
    } catch (e) {
      return null;
    }
  }

  function getSatelliteValue(name) {
    try {
      if (window._satellite && typeof window._satellite.getVar === 'function') {
        return window._satellite.getVar(name);
      }
    } catch (e) {}
    return null;
  }

  function mergeSignals(target, source) {
    if (source.explicitInternational) target.explicitInternational = true;
    if (source.explicitNational) target.explicitNational = true;

    for (let i = 0; i < source.countries.length; i++) {
      addCountry(target, source.countries[i]);
    }
    for (let i = 0; i < source.clues.length; i++) {
      addClue(target, source.clues[i]);
    }
  }

  function collectSourceSignals() {
    const sources = [];

    function addSource(name, available, bag, extra) {
      sources.push({
        name: name,
        available: !!available,
        countries: bag.countries.slice(),
        explicitInternational: bag.explicitInternational,
        explicitNational: bag.explicitNational,
        clues: bag.clues.slice(),
        extra: extra || '',
      });
    }

    const azulLayer = getAzulDataLayer();
    const journeyBag = createSignalBag();
    let journeyExtra = '';

    if (azulLayer && azulLayer.data) {
      const journeyInfo = readJourneyDomestic(azulLayer.data);
      if (journeyInfo) {
        journeyExtra = journeyInfo.details.join(' | ');
        if (journeyInfo.hasDomesticFalse) {
          journeyBag.explicitInternational = true;
          addClue(journeyBag, 'journey.domestic=false');
        } else if (journeyInfo.hasDomesticTrue && !journeyInfo.missingDomestic) {
          journeyBag.explicitNational = true;
          addClue(journeyBag, 'journey.domestic=true');
        }
      }
      addSource(azulLayer.source + ' journey[].domestic', true, journeyBag, journeyExtra);
    } else {
      addSource('temp_azulObject_push / azulObject', false, journeyBag, '');
    }

    const nextData = getNextData();
    const nextBag = createSignalBag();
    walkFlightSignals(nextData, nextBag);
    addSource('__NEXT_DATA__', nextData, nextBag);

    const digitalBag = createSignalBag();
    walkFlightSignals(window.digitalData, digitalBag);
    addSource('digitalData', window.digitalData, digitalBag);

    const satelliteBag = createSignalBag();
    const satelliteVars = [
      'JS - product_category',
      'JS - product_name',
      'JS - flight_type',
      'JS - journey_type',
    ];
    const satelliteExtra = [];
    for (let i = 0; i < satelliteVars.length; i++) {
      const value = getSatelliteValue(satelliteVars[i]);
      if (value == null || value === '') continue;
      satelliteExtra.push(satelliteVars[i] + '=' + value);
      applyTypeText(satelliteBag, value);
    }
    addSource('_satellite', satelliteExtra.length > 0, satelliteBag, satelliteExtra.join(' | '));

    return sources;
  }

  function getForeignCountry(countries) {
    for (let i = 0; i < countries.length; i++) {
      if (!BRAZIL_COUNTRY[countries[i]]) return countries[i];
    }
    return '';
  }

  function logFlightDetection(result) {
    const key = result.type + '|' + result.reason + '|' + result.countries.join(',');
    if (lastDetectionLogKey === key) return;
    lastDetectionLogKey = key;

    const linhas = [
      '[AT] Deteccao de voo',
      '- Resultado: ' + result.type,
      '- Parcelamento: ' + getInstallmentLabel(result.type),
      '- Confiante: ' + (result.confident ? 'sim' : 'nao'),
      '- Motivo: ' + result.reason,
      '- Paises de estacao: ' + (result.countries.length ? result.countries.join(', ') : 'nenhum'),
      '- Flag internacional: ' + result.explicitInternational,
      '- Flag nacional: ' + result.explicitNational,
      '- Pistas: ' + (result.clues.length ? result.clues.join(' | ') : 'nenhuma'),
      '- Fontes consultadas:',
    ];

    for (let i = 0; i < result.sources.length; i++) {
      const source = result.sources[i];
      linhas.push(
        '  ' +
          (i + 1) +
          '. ' +
          source.name +
          ' | disponivel: ' +
          (source.available ? 'sim' : 'nao') +
          ' | paises: ' +
          (source.countries.length ? source.countries.join(', ') : '-') +
          (source.extra ? ' | extra: ' + source.extra : '')
      );
    }

    console.log(linhas.join('\n'));
  }

  function detectFlightTypeDetailed() {
    if (window.AT_BENEFICIOS_CC_FLIGHT_OVERRIDE === 'internacional') {
      return {
        type: 'internacional',
        reason: 'Override manual (window.AT_BENEFICIOS_CC_FLIGHT_OVERRIDE)',
        confident: true,
        countries: [],
        clues: ['override'],
        explicitInternational: true,
        explicitNational: false,
        sources: [],
      };
    }

    if (window.AT_BENEFICIOS_CC_FLIGHT_OVERRIDE === 'nacional') {
      return {
        type: 'nacional',
        reason: 'Override manual (window.AT_BENEFICIOS_CC_FLIGHT_OVERRIDE)',
        confident: true,
        countries: [],
        clues: ['override'],
        explicitInternational: false,
        explicitNational: true,
        sources: [],
      };
    }

    const azulLayer = getAzulDataLayer();
    const journeyInfo = azulLayer && azulLayer.data ? readJourneyDomestic(azulLayer.data) : null;

    if (journeyInfo && !journeyInfo.missingDomestic) {
      const type = journeyInfo.isDomestic ? 'nacional' : 'internacional';
      const result = {
        type: type,
        reason:
          'sessionStorage/azulObject journey[].domestic → ' +
          (journeyInfo.isDomestic ? 'true (nacional/6x)' : 'false (internacional/12x)'),
        confident: true,
        countries: [],
        clues: journeyInfo.details.slice(),
        explicitInternational: !journeyInfo.isDomestic,
        explicitNational: journeyInfo.isDomestic,
        sources: [
          {
            name: (azulLayer && azulLayer.source ? azulLayer.source : 'azulObject') + ' journey[].domestic',
            available: true,
            countries: [],
            explicitInternational: !journeyInfo.isDomestic,
            explicitNational: journeyInfo.isDomestic,
            clues: journeyInfo.details.slice(),
            extra: journeyInfo.details.join(' | '),
          },
        ],
      };
      logFlightDetection(result);
      return result;
    }

    const sources = collectSourceSignals();
    const acc = createSignalBag();
    for (let i = 0; i < sources.length; i++) {
      mergeSignals(acc, sources[i]);
    }

    const foreignCountry = getForeignCountry(acc.countries);

    let type = 'nacional';
    let reason = '';
    let confident = false;

    if (acc.explicitInternational) {
      type = 'internacional';
      reason = 'Flag/texto de voo internacional nos dados da pagina (fallback)';
      confident = true;
    } else if (foreignCountry) {
      type = 'internacional';
      reason = 'Pais de estacao diferente de BR: ' + foreignCountry + ' (fallback)';
      confident = true;
    } else if (acc.explicitNational) {
      type = 'nacional';
      reason = 'Flag/texto de voo nacional nos dados da pagina (fallback)';
      confident = true;
    } else if (acc.countries.length) {
      type = 'nacional';
      reason = 'Paises de estacao apenas do Brasil: ' + acc.countries.join(', ') + ' (fallback)';
      confident = true;
    } else {
      type = 'nacional';
      reason =
        'journey[].domestic indisponivel. Padrao nacional (6x) ate nova leitura';
      confident = false;
    }

    const result = {
      type: type,
      reason: reason,
      confident: confident,
      countries: acc.countries,
      clues: acc.clues,
      explicitInternational: acc.explicitInternational,
      explicitNational: acc.explicitNational,
      sources: sources,
    };

    logFlightDetection(result);
    return result;
  }

  function getCachedFlightType() {
    if (!flightDetection || !flightDetection.confident) {
      flightDetection = detectFlightTypeDetailed();
    }
    window._atBeneficiosCcFlightType = flightDetection.type;
    return flightDetection.type;
  }

  function getInstallmentLabel(flightType) {
    if (flightType === 'internacional') return 'Até 12x sem juros';
    return 'Até 6x sem juros';
  }

  function getBenefits(flightType) {
    return [
      {
        id: 'parcelamento',
        label: getInstallmentLabel(flightType),
        icon: ICON_TAG,
      },
      {
        id: 'dois-cartoes',
        label: 'Use até 2 Cartões',
        icon: ICON_CARDS,
      },
    ];
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking BeneficiosCC] Parametro ausente para evento analytics.');
      return;
    }

    const labelEvent = ACTIVITY + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking BeneficiosCC] Analytics event disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = CONTEXT + '|' + (window._atBeneficiosCcFlightType || 'nacional');

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function trackViewOnce(el) {
    if (!el || el.getAttribute(DATA_VIEW) === 'true') return;
    el.setAttribute(DATA_VIEW, 'true');
    analyticsEvent('beneficios_visiveis', 'view');
  }

  function createBenefitsComponent(flightType) {
    const wrapper = document.createElement('div');
    wrapper.id = COMPONENT_ID;
    wrapper.setAttribute('data-at-experiment', EXPERIMENT_NAME);
    wrapper.setAttribute('data-at-flight-type', flightType);
    wrapper.setAttribute('role', 'list');
    wrapper.setAttribute('aria-label', 'Benefícios do pagamento com cartão de crédito');

    const benefits = getBenefits(flightType);

    for (let i = 0; i < benefits.length; i++) {
      if (i > 0) {
        const divider = document.createElement('span');
        divider.className = 'at-beneficios-cc__divider';
        divider.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(divider);
      }

      const benefit = benefits[i];
      const item = document.createElement('div');
      item.className = 'at-beneficios-cc__item';
      item.setAttribute('role', 'listitem');
      item.setAttribute('data-at-benefit', benefit.id);

      const icon = document.createElement('span');
      icon.className = 'at-beneficios-cc__icon';
      icon.innerHTML = benefit.icon;
      icon.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.className = 'at-beneficios-cc__label';
      label.textContent = benefit.label;

      item.appendChild(icon);
      item.appendChild(label);
      wrapper.appendChild(item);
    }

    return wrapper;
  }

  function syncInstallmentLabel(flightType) {
    const wrapper = document.getElementById(COMPONENT_ID);
    if (!wrapper) return;

    wrapper.setAttribute('data-at-flight-type', flightType);

    const label = wrapper.querySelector('[data-at-benefit="parcelamento"] .at-beneficios-cc__label');
    if (label) {
      label.textContent = getInstallmentLabel(flightType);
    }
  }

  function findHeaderSlot(container) {
    if (!container) return null;

    const chevron = container.querySelector(SELECTORS.hideContent) || container.querySelector(SELECTORS.showContent);
    if (chevron && chevron.parentElement) {
      return { parent: chevron.parentElement, before: chevron };
    }

    const select = container.querySelector(SELECTORS.creditCardSelect);
    if (select && select.parentElement) {
      return { parent: select.parentElement, before: select.nextElementSibling };
    }

    return null;
  }

  function hideOriginalCopy(container) {
    if (!container) return;

    const ourPill = document.getElementById(COMPONENT_ID);
    const wronglyHidden = container.querySelectorAll('div.at-beneficios-cc-original-hidden');
    for (let i = 0; i < wronglyHidden.length; i++) {
      wronglyHidden[i].classList.remove('at-beneficios-cc-original-hidden');
    }

    const paragraphs = container.querySelectorAll('p');
    for (let i = 0; i < paragraphs.length; i++) {
      const node = paragraphs[i];
      if (node.closest && node.closest('#' + COMPONENT_ID)) continue;
      if (ourPill && node.contains(ourPill)) continue;

      const text = (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text.indexOf('escolha') !== -1 && text.indexOf('cart') !== -1) {
        node.classList.add('at-beneficios-cc-original-hidden');
      }
    }

    const nativeBadges = container.querySelectorAll('span');
    for (let i = 0; i < nativeBadges.length; i++) {
      const node = nativeBadges[i];
      if (node.closest && node.closest('#' + COMPONENT_ID)) continue;
      if (ourPill && (node.contains(ourPill) || ourPill.contains(node))) continue;

      const text = (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (
        text.indexOf('até') !== -1 &&
        text.indexOf('sem juro') !== -1 &&
        text.indexOf('2 cart') !== -1 &&
        text.length < 80
      ) {
        node.classList.add('at-beneficios-cc-original-hidden');
      }
    }
  }

  function injectBenefits() {
    const container = document.querySelector(SELECTORS.creditCardContainer);
    if (!container) return false;

    hideOriginalCopy(container);

    const slot = findHeaderSlot(container);
    if (!slot) return false;

    const flightType = getCachedFlightType();

    if (document.getElementById(COMPONENT_ID)) {
      syncInstallmentLabel(flightType);
      trackViewOnce(document.getElementById(COMPONENT_ID));
      return true;
    }

    slot.parent.setAttribute(DATA_INJECTED, 'true');

    const component = createBenefitsComponent(flightType);
    if (slot.before) {
      slot.parent.insertBefore(component, slot.before);
    } else {
      slot.parent.appendChild(component);
    }

    trackViewOnce(component);
    console.log('[AT] Benefícios do cartão injetados no header:', flightType, getInstallmentLabel(flightType));
    return true;
  }

  function run() {
    if (isProcessing) return;
    if (!isTargetPage()) return;

    isProcessing = true;
    try {
      injectStyles();
      injectBenefits();
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      run();
    }, 300);
  }

  function startObserver() {
    if (observerStarted || window._atBeneficiosCcObserver) return;

    const observer = new MutationObserver(function () {
      if (document.getElementById(COMPONENT_ID) && flightDetection && flightDetection.confident) {
        return;
      }
      scheduleRun();
    });

    const observeRoot =
      document.querySelector(SELECTORS.creditCardContainer) ||
      document.querySelector('[data-test-id*="fop"]') ||
      document.body;

    observer.observe(observeRoot, {
      childList: true,
      subtree: true,
    });

    window._atBeneficiosCcObserver = observer;
    observerStarted = true;
  }

  function init() {
    run();
    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
