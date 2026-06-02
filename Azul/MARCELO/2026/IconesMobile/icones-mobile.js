(function () {
  const experienceName = 'AT_icones_mobile';
  const experienceAlreadyExecuted = window[experienceName] || false;

  const onExperienceTargetPage = () => {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/br/pt/home/selecao-voo';
    const queryParams = window.location.search;
    const paramFlightMoneyPayment = 'cc=BRL';

    return currentUrl.includes(targetTestUrl) && queryParams.includes(paramFlightMoneyPayment);
  };

  const initExperienceWhenReady = () => {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      console.log('[AT] Tariff Icons: Not a mobile device. Exiting.');
      return;
    }

    if (isReady) {
      experienceSetup();
    } else {
      document.addEventListener('DOMContentLoaded', experienceSetup);
    }
  };

  if (experienceAlreadyExecuted || !onExperienceTargetPage()) {
    console.log('[AT] Page is not a correct page OR script already executed.');
    return;
  }

  window[experienceName] = true;
  initExperienceWhenReady();

  function experienceSetup() {
    console.log('[AT] Experience started:', experienceName);
    let debounceTimer = null;
    let lastTryRunAt = 0;
    const bodyObserver = new MutationObserver(bodyObserverCallback);
    const bodyObserverConfig = {
      childList: true,
      subtree: true,
    };

    const SELECTORS = {
      tariffModal: '.ReactModalPortal',
      fareItem: '.fare-item',
      benefitsList: 'ul',
      tariffType: 'p.promotional',
    };

    const CLASSNAMES = {
      fareItemInjected: 'at-fareitem-injected',
      benefitInjected: 'benefit-injected',
      luggageInjected: 'luggage-injected',
    };

    const TARIFFS_BENEFITS = {
      every: {
        bagagem: {
          position: 1,
        },
      },
      nacional: {
        marcacaoAntecipada: {
          position: 4,
          text: 'Marcação antecipada de assento padrão em voos Azul',
        },
        antecipacaoDeVoo: {
          position: 5,
          text: 'Antecipação de voo',
        },
      },
      internacional: {
        marcacaoAntecipada: {
          position: 3,
          text: 'Marcação antecipada de assento padrão em voos Azul',
        },
      },
    };

    const HAVE_ICON = `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.600098 9.0001C0.600098 4.3591 4.3591 0.600098 9.0001 0.600098C13.6369 0.600098 17.4001 4.3591 17.4001 9.0001C17.4001 13.6376 13.6369 17.4001 9.0001 17.4001C4.3591 17.4001 0.600098 13.6376 0.600098 9.0001ZM5.3587 8.38223L4.8001 8.95508L7.81887 12.0547L13.5819 6.13663L13.024 5.56378L7.81887 10.9083L5.3587 8.38223Z" fill="#008058"></path></svg>
    `;

    const DONT_HAVE_ICON = `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0ZM9 8.29297L6.35352 5.64648L5.64648 6.35352L8.29297 9L5.64648 11.6465L6.35352 12.3535L9 9.70703L11.6465 12.3535L12.3535 11.6465L9.70703 9L12.3535 6.35352L11.6465 5.64648L9 8.29297Z" fill="#EB001B"/>
        </svg>
    `;

    const DONT_HAVE_BAGS_ICON = `
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 22.8333C8.5 22.9253 8.5896 23 8.7 23H9.3C9.4104 23 9.5 22.9253 9.5 22.8333V22.1667C9.5 22.0747 9.4104 22 9.3 22H8.7C8.5896 22 8.5 22.0747 8.5 22.1667V22.8333Z" fill="#D5292A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 22.8333C14.5 22.9253 14.5896 23 14.7 23H15.3C15.4104 23 15.5 22.9253 15.5 22.8333V22.1667C15.5 22.0747 15.4104 22 15.3 22H14.7C14.5896 22 14.5 22.0747 14.5 22.1667V22.8333Z" fill="#D5292A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.5 7C9.5 7.1104 9.5896 7.2 9.7 7.2H10.3C10.4104 7.2 10.5 7.1104 10.5 7V4.2C10.5 4.0896 10.4104 4 10.3 4H9.7C9.5896 4 9.5 4.0896 9.5 4.2V7Z" fill="#D5292A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.69445 2C8.58711 2 8.5 2.0896 8.5 2.2V2.8C8.5 2.9104 8.58711 3 8.69445 3H15.3056C15.4129 3 15.5 2.9104 15.5 2.8V2.2C15.5 2.0896 15.4129 2 15.3056 2H8.69445Z" fill="#D5292A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 7C13.5 7.1104 13.5896 7.2 13.7 7.2H14.3C14.4104 7.2 14.5 7.1104 14.5 7V4.2C14.5 4.0896 14.4104 4 14.3 4H13.7C13.5896 4 13.5 4.0896 13.5 4.2V7Z" fill="#D5292A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.78685 7.96737C7.13707 7.38761 7.77327 7 8.5 7H15.5C16.6046 7 17.5 7.89543 17.5 9V19C17.5 19.2224 17.4637 19.4363 17.3967 19.6361L15.5 17.5501V11H14.5V16.4503L12.5 14.2507V10H11.5V13.1509L6.78685 7.96737ZM6.5 9.13835V19C6.5 20.1046 7.39543 21 8.5 21H15.5C16.0093 21 16.4741 20.8096 16.8272 20.4962L12.5 15.7371V18.078H11.5V14.6373L9.5 12.4377V17.5526H8.5V11.3379L6.5 9.13835Z" fill="#D5292A"/>
        <mask id="mask0_6988_7751" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="6" y="7" width="12" height="14">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.78685 7.96737C7.13707 7.38761 7.77327 7 8.5 7H15.5C16.6046 7 17.5 7.89543 17.5 9V19C17.5 19.2224 17.4637 19.4363 17.3967 19.6361L15.5 17.5501V11H14.5V16.4503L12.5 14.2507V10H11.5V13.1509L6.78685 7.96737ZM6.5 9.13835V19C6.5 20.1046 7.39543 21 8.5 21H15.5C16.0093 21 16.4741 20.8096 16.8272 20.4962L12.5 15.7371V18.078H11.5V14.6373L9.5 12.4377V17.5526H8.5V11.3379L6.5 9.13835Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_6988_7751)">
        <path d="M6.78685 7.96737L5.9309 7.45032L5.54541 8.08849L6.04698 8.64011L6.78685 7.96737ZM17.3967 19.6361L16.6568 20.3088L17.8032 21.5696L18.3449 19.9539L17.3967 19.6361ZM15.5 17.5501H14.5V17.9367L14.7601 18.2228L15.5 17.5501ZM15.5 11H16.5V10H15.5V11ZM14.5 11V10H13.5V11H14.5ZM14.5 16.4503L13.7601 17.123L15.5 19.0365V16.4503H14.5ZM12.5 14.2507H11.5V14.6373L11.7601 14.9234L12.5 14.2507ZM12.5 10H13.5V9H12.5V10ZM11.5 10V9H10.5V10H11.5ZM11.5 13.1509L10.7601 13.8236L12.5 15.7371V13.1509H11.5ZM6.5 9.13835L7.23988 8.46561L5.5 6.55209V9.13835H6.5ZM16.8272 20.4962L17.4911 21.2441L18.2479 20.5722L17.5671 19.8235L16.8272 20.4962ZM12.5 15.7371L13.2399 15.0644L11.5 13.1509V15.7371H12.5ZM12.5 18.078V19.078H13.5V18.078H12.5ZM11.5 18.078H10.5V19.078H11.5V18.078ZM11.5 14.6373H12.5V14.2507L12.2399 13.9646L11.5 14.6373ZM9.5 12.4377L10.2399 11.765L8.5 9.85149V12.4377H9.5ZM9.5 17.5526V18.5526H10.5V17.5526H9.5ZM8.5 17.5526H7.5V18.5526H8.5V17.5526ZM8.5 11.3379H9.5V10.9513L9.23988 10.6652L8.5 11.3379ZM8.5 6C7.40872 6 6.45464 6.58329 5.9309 7.45032L7.64281 8.48442C7.81949 8.19193 8.13781 8 8.5 8V6ZM15.5 6H8.5V8H15.5V6ZM18.5 9C18.5 7.34315 17.1569 6 15.5 6V8C16.0523 8 16.5 8.44772 16.5 9H18.5ZM18.5 19V9H16.5V19H18.5ZM18.3449 19.9539C18.4458 19.653 18.5 19.3318 18.5 19H16.5C16.5 19.1129 16.4817 19.2196 16.4486 19.3183L18.3449 19.9539ZM14.7601 18.2228L16.6568 20.3088L18.1366 18.9634L16.2399 16.8773L14.7601 18.2228ZM14.5 11V17.5501H16.5V11H14.5ZM14.5 12H15.5V10H14.5V12ZM15.5 16.4503V11H13.5V16.4503H15.5ZM11.7601 14.9234L13.7601 17.123L15.2399 15.7775L13.2399 13.5779L11.7601 14.9234ZM13.5 14.2507V10H11.5V14.2507H13.5ZM12.5 9H11.5V11H12.5V9ZM10.5 10V13.1509H12.5V10H10.5ZM6.04698 8.64011L10.7601 13.8236L12.2399 12.4781L7.52673 7.29463L6.04698 8.64011ZM5.5 9.13835V19H7.5V9.13835H5.5ZM5.5 19C5.5 20.6569 6.84315 22 8.5 22V20C7.94772 20 7.5 19.5523 7.5 19H5.5ZM8.5 22H15.5V20H8.5V22ZM15.5 22C16.2633 22 16.9621 21.7137 17.4911 21.2441L16.1633 19.7484C15.9862 19.9056 15.7553 20 15.5 20V22ZM17.5671 19.8235L13.2399 15.0644L11.7601 16.4099L16.0873 21.1689L17.5671 19.8235ZM13.5 18.078V15.7371H11.5V18.078H13.5ZM11.5 19.078H12.5V17.078H11.5V19.078ZM10.5 14.6373V18.078H12.5V14.6373H10.5ZM12.2399 13.9646L10.2399 11.765L8.76012 13.1105L10.7601 15.3101L12.2399 13.9646ZM10.5 17.5526V12.4377H8.5V17.5526H10.5ZM8.5 18.5526H9.5V16.5526H8.5V18.5526ZM7.5 11.3379V17.5526H9.5V11.3379H7.5ZM9.23988 10.6652L7.23988 8.46561L5.76012 9.81109L7.76012 12.0107L9.23988 10.6652Z" fill="#D5292A"/>
        </g>
        <path d="M6.63832 6.70421L5.89844 7.37695L17.8509 20.5223L18.5908 19.8496L6.63832 6.70421Z" fill="#D5292A"/>
    `;

    init();

    function init() {
      analyticsEvent('active');
      injectCustomCSS();
      tryInjectIcons();

      const body = document.querySelector('body');
      bodyObserver.observe(body, bodyObserverConfig);
    }

    function bodyObserverCallback() {
      if (!onExperienceTargetPage()) return;
      throttleTryInjectIcons();
    }

    function throttleTryInjectIcons() {
      const now = Date.now();
      const minIntervalMs = 60;

      if (now - lastTryRunAt >= minIntervalMs) {
        lastTryRunAt = now;
        tryInjectIcons();
        return;
      }

      scheduleTryInjectIcons();
    }

    function scheduleTryInjectIcons() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        lastTryRunAt = Date.now();
        tryInjectIcons();
      }, 60);
    }

    function findTariffScope() {
      const modal = document.querySelector(SELECTORS.tariffModal);

      if (modal && modal.querySelector(SELECTORS.fareItem)) {
        return modal;
      }

      if (document.querySelector(SELECTORS.fareItem)) {
        return document.body;
      }

      return null;
    }

    function tryInjectIcons() {
      const tariffScope = findTariffScope();

      if (!tariffScope) return;

      const fareItems = tariffScope.querySelectorAll(SELECTORS.fareItem);

      if (!fareItems.length) return;

      [...fareItems].forEach((fareItem) => {
        if (fareItem.classList.contains(CLASSNAMES.fareItemInjected)) return;
        injectCustomIconsOnTariff(fareItem);
      });
    }

    function getBenefitsList(fareItem) {
      if (!fareItem) return null;

      const directUl = Array.from(fareItem.children).find((child) => child.tagName === 'UL');

      return directUl || fareItem.querySelector(SELECTORS.benefitsList);
    }

    function injectCustomIconsOnTariff(fareItem) {
      if (!fareItem) return;

      const benefitsList = getBenefitsList(fareItem);
      if (!benefitsList) return;

      const benefits = benefitsList.querySelectorAll('li');
      const isInternacional = isInternacionalFlight(fareItem);
      const BENEFITS_TO_INJECT_ICONS = isInternacional
        ? TARIFFS_BENEFITS.internacional
        : TARIFFS_BENEFITS.nacional;

      Object.keys(BENEFITS_TO_INJECT_ICONS).forEach((benefitKey) => {
        const benefitData = BENEFITS_TO_INJECT_ICONS[benefitKey];
        const benefitElement = benefits[benefitData.position];
        const benefitElementMatchesText =
          benefitElement && benefitElement.textContent.includes(benefitData.text);
        const benefitAlreadyInjected =
          benefitElement && benefitElement.classList.contains(CLASSNAMES.benefitInjected);

        if (benefitElementMatchesText && !benefitAlreadyInjected) {
          const benefitValueText = getBenefitValueText(benefitElement);

          if (benefitValueText === '-') return;

          const hasBenefit = benefitValueText.includes('Sim');
          const newBenefitElement = getNewBenefitElement(hasBenefit, benefitData.text);

          if (newBenefitElement) {
            benefitElement.classList.add(CLASSNAMES.benefitInjected);
            benefitElement.appendChild(newBenefitElement);
          }
        }
      });

      const bagagemBenefitData = TARIFFS_BENEFITS.every.bagagem;
      const bagagemElement = benefits[bagagemBenefitData.position];

      if (!bagagemElement || bagagemElement.classList.contains(CLASSNAMES.luggageInjected)) {
        return;
      }

      const luggageElement = bagagemElement.querySelector('p');
      const textLuggage = luggageElement?.textContent || '';
      const hasBenefit = !textLuggage.includes('Não incluída');

      if (hasBenefit) return;

      const luggageSvg = bagagemElement.querySelector('svg');
      if (!luggageElement || !luggageSvg) return;

      luggageElement.style.setProperty('color', '#D5292A', 'important');

      const maskId = 'at-bags-mask-' + Math.random().toString(36).slice(2, 9);
      luggageSvg.innerHTML = DONT_HAVE_BAGS_ICON.replace(/mask0_6988_7751/g, maskId);
      bagagemElement.classList.add(CLASSNAMES.luggageInjected);

      markFareItemInjectedIfReady(fareItem);
    }

    function markFareItemInjectedIfReady(fareItem) {
      if (!fareItem) return;

      const hasAnyInjected =
        fareItem.querySelector('.' + CLASSNAMES.benefitInjected) ||
        fareItem.querySelector('.' + CLASSNAMES.luggageInjected);

      if (hasAnyInjected) {
        fareItem.classList.add(CLASSNAMES.fareItemInjected);
      }
    }

    function getBenefitValueText(benefitElement) {
      const textItem = benefitElement.querySelector('.text-item');

      if (!textItem) {
        return benefitElement.children[0]?.childNodes[1]?.textContent?.trim() || '';
      }

      const labelSpan = textItem.querySelector('span');

      if (!labelSpan) {
        return textItem.textContent.trim();
      }

      return textItem.textContent.replace(labelSpan.textContent, '').trim();
    }

    function getNewBenefitElement(hasBenefit, benefitText = '') {
      if (typeof hasBenefit !== 'boolean' || typeof benefitText !== 'string') return null;
      if (!benefitText || hasBenefit === undefined || benefitText == '') return null;

      const hasBenefitClass = hasBenefit ? 'has-benefit' : 'no-benefit';

      const newBenefitElement = document.createElement('div');
      newBenefitElement.classList.add('custom-benefit');
      newBenefitElement.classList.add(hasBenefitClass);

      const textNode = document.createTextNode(benefitText);

      newBenefitElement.innerHTML += hasBenefit ? HAVE_ICON : DONT_HAVE_ICON;
      newBenefitElement.appendChild(textNode);

      return newBenefitElement;
    }

    function isInternacionalFlight(tariffWrapper) {
      if (!tariffWrapper) return false;

      const tariffTypeElement = tariffWrapper.querySelector(SELECTORS.tariffType);

      return tariffTypeElement && tariffTypeElement.textContent.includes('Business');
    }

    function injectCustomCSS() {
      const STYLE_ID = 'at-tariff-icons-moba-style';

      if (document.getElementById(STYLE_ID)) return;

      const style = document.createElement('style');
      style.id = STYLE_ID;

      style.innerHTML = `
            {CLASS_BENEFIT_INJECTED} > *:not(.custom-benefit) {
                display: none;
            }

            {CLASS_BENEFIT_INJECTED} {
                border-bottom: 1px dashed rgb(192, 192, 192);
                padding: 16px 0px;
                margin: 0px !important;
                }
                
            {CLASS_BENEFIT_INJECTED} .custom-benefit {
                display: flex;
                align-items: center;
                gap: 12px;
            }
        `;

      style.innerHTML = style.innerHTML.replaceAll(
        '{CLASS_BENEFIT_INJECTED}',
        '.' + CLASSNAMES.benefitInjected,
      );

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
        console.log('[AT] Missing parameters for analytics event.');
        return;
      }

      const labelEvent = experienceName + ' ' + eventLabel;
      console.log('[AT] ANALYTICS_TRIGGERED:', labelEvent);

      // === Disparo Adobe Analytics ===
      (function () {
        var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
        if (!s || typeof s.tl !== 'function') return;

        s.linkTrackVars = 'events,eVar82';
        s.linkTrackEvents = 'event90';
        s.events = 'event90';
        s.eVar82 = labelEvent;

        // dispara o link (o = custom link, d = download, e = exit)
        s.tl(true, 'o', 'target_activity_action');
      })();
    }
  }
})();
