(function () {
  const SELECTORS = {
    searchWrapper: '.styles__SearchListWrapper-sc-oxmbkx-8',
    contentWrapper: '.styles__DynamicBannerWrapper-sc-1u6m6gj-0',
    loadingWrapper: '.styles__LoadingWrapper-sc-oxmbkx-2',
    listWrapper: '.styles__ListWrapper-sc-1oit4q5-6',
    destiny: '.styles__ItemTitle-sc-1uec0uv-3 b',
    destinyMoba: '.styles__ItemTitle-sc-1uec0uv-3.kULzzP',
  };

  const HOTELS = [
    {
      name: 'Rosen Inn At Pointe Orlando',
      locale: 'Orlando.',
      image:
        'http://images.azulviagens.com.br/images/upload//hotels/Rosen_Inn_at_Pointe_Orlando/001.jpg',
      price: 'Diárias a partir de R$ 540,08.',
      stars: 3,
      link: 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JP152342&hdid=JP152342&hdt=Rosen%20Inn%20At%20Pointe%20Orlando&stdi=12/09/2025&stdo=19/09/2025&r[0].adt=2&r[0].chd=0&r[0].ag=#hotelDetail',
    },
    {
      name: 'Best Western Orlando Gateway Hotel',
      locale: 'Southwest Orlando, Orlando City.',
      image:
        'https://www.azulviagens.com.br/handlers/imageRequest.ashx?path=https%3A%2F%2Fwww.dotwconnect.com%2Fpoze_hotel%2F21%2F211736%2FSs6Fv6SA_c6bce763f38d7a57d0c7e42e482f6cc4.jpg',
      price: 'Diárias a partir de R$ 515,43.',
      stars: 3,
      link: 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JP819403&hdid=JP819403&hdt=Best%20Western%20Orlando%20Gateway%20Hotel&stdi=12/09/2025&stdo=19/09/2025&r[0].adt=2&r[0].chd=0&r[0].ag=#hotelDetail',
    },
    {
      name: 'Celebration Suites',
      locale: 'Kissimmee.',
      image:
        'http://images.azulviagens.com.br/images/upload//hotels/Celebration_Suites/WhatsApp_Image_2021-12-06_at_15.25.40.jpeg',
      price: 'Diárias a partir de R$ 686,33.',
      stars: 3,
      link: 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JP140858&hdid=JP140858&hdt=Celebration%20Suites&stdi=12/09/2025&stdo=19/09/2025&r[0].adt=2&r[0].chd=0&r[0].ag=#hotelDetail',
    },
    {
      name: 'Rosen Inn Lake Buena Vista',
      locale: 'Orlando.',
      image:
        'http://images.azulviagens.com.br/images/upload/hotels/Clarion_Inn_Lake_Buena_Vista/1.JPG',
      price: 'Diárias a partir de R$ 491,93.',
      stars: 3,
      link: 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JP899616&hdid=JP899616&hdt=Rosen%20Inn%20Lake%20Buena%20Vista&stdi=12/09/2025&stdo=19/09/2025&r[0].adt=2&r[0].chd=0&r[0].ag=#hotelDetail',
    },
    {
      name: 'Ramada Plaza by Wyndham Orlando Resort & Suites Intl Drive',
      locale: 'Southwest Orlando, Orlando City.',
      image: 'https://i.t4w.mobi/h/US/1010106/15467/15467_897604_202_z.jpg',
      price: 'Diárias a partir de R$ 1.046,41.',
      stars: 3,
      link: 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JP064786&hdid=JP064786&hdt=Ramada%20Plaza%20by%20Wyndham%20Orlando%20Resort%20%26%20Suites%20Intl%20Drive&stdi=12/09/2025&stdo=19/09/2025&r[0].adt=2&r[0].chd=0&r[0].ag=#hotelDetail',
    },
  ];

  const checkIfDomReady = () => {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

    if (isReady) {
      checkIfContentIsRendered();
    } else {
      document.addEventListener('DOMContentLoaded', checkIfContentIsRendered);
    }
  };

  const getLoadingWrapper = () => {
    return document.querySelector(SELECTORS.loadingWrapper);
  };

  const checkIfContentIsRendered = () => {
    const loadingWrapper = getLoadingWrapper();

    if (loadingWrapper) {
      console.log('[AT] Loading wrapper found, waiting for content to render.');
      requestAnimationFrame(checkIfContentIsRendered);
      return;
    }

    initializeShowcase();
  };

  const initializeShowcase = () => {
    const originalContentWrapper = document.querySelector(SELECTORS.searchWrapper);
    let CAROUSEL_SCROLL = 0;

    if (!originalContentWrapper) {
      console.log('[AT] Content wrapper not found: ' + SELECTORS.searchWrapper);
      return;
    }

    const isOrlandoDestiny = destinyIsOrlando();

    if (isOrlandoDestiny) {
      injectShowcase();
    }

    injectCustomStyles();
    observerDomChanges();

    function injectShowcase() {
      CAROUSEL_SCROLL = 0;

      const showcaseContainerElement = document.querySelector('.inject-hotel-showcase-container');

      if (showcaseContainerElement) {
        showcaseContainerElement.remove();
      }

      const bannerWrapper = document.querySelector(SELECTORS.contentWrapper);
      const searchWrapper = document.querySelector(SELECTORS.searchWrapper);

      if (!searchWrapper) {
        console.log('[AT] searchWrapper not found: ' + SELECTORS.searchWrapper);
        return;
      }

      const showcaseContainer = document.createElement('div');
      showcaseContainer.className = 'inject-hotel-showcase-container';

      const showcaseTitle = document.createElement('h2');
      showcaseTitle.className = 'inject-hotel-showcase-title';
      showcaseTitle.textContent = 'Hotéis Recomendados';
      showcaseContainer.appendChild(showcaseTitle);

      const showcaseList = document.createElement('ul');
      showcaseList.className = 'inject-hotel-showcase-list-carousel';

      HOTELS.forEach((hotel) => {
        const hotelElement = createHotelElement(hotel);
        showcaseList.appendChild(hotelElement);
      });

      showcaseContainer.appendChild(showcaseList);

      const leftArrow = document.createElement('button');
      leftArrow.setAttribute('disabled', true);
      leftArrow.className = 'inject-hotel-showcase-arrow inject-hotel-showcase-arrow-left';
      leftArrow.innerHTML = `
            <svg viewBox="0 0 1024 1024" fill="none">
                <path d="M133.9 527.8C126 518.8 126 505.2 133.9 496.2L364.9 232.2C373.7 222.2 388.8 221.2 398.8 229.9 408.8 238.7 409.8 253.8 401.1 263.8L204.9 488 872 488C885.3 488 896 498.7 896 512 896 525.3 885.3 536 872 536L204.9 536 401.1 760.2C409.8 770.2 408.8 785.3 398.8 794.1 388.8 802.8 373.7 801.8 364.9 791.8L133.9 527.8Z" fill="#041E42" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
        `;

      leftArrow.addEventListener('click', () => {
        handleCarouselScroll('prev');
      });

      const rightArrow = document.createElement('button');
      rightArrow.className = 'inject-hotel-showcase-arrow inject-hotel-showcase-arrow-right';
      rightArrow.innerHTML = `
            <svg viewBox="0 0 1024 1024" fill="none">
                <path d="M890.1 496.2C898 505.2 898 518.8 890.1 527.8L659.1 791.8C650.3 801.8 635.2 802.8 625.2 794.1 615.2 785.3 614.2 770.2 622.9 760.2L819.1 536 152 536C138.7 536 128 525.3 128 512 128 498.7 138.7 488 152 488L819.1 488 622.9 263.8C614.2 253.8 615.2 238.7 625.2 229.9 635.2 221.2 650.3 222.2 659.1 232.2L890.1 496.2Z" fill="#041E42" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
        `;

      rightArrow.addEventListener('click', () => {
        handleCarouselScroll('next');
      });

      showcaseContainer.appendChild(leftArrow);
      showcaseContainer.appendChild(rightArrow);

      searchWrapper.prepend(showcaseContainer);
      if (bannerWrapper) bannerWrapper.style.display = 'none';
    }

    function handleCarouselScroll(direction = 'next') {
      const showcaseList = document.querySelector('.inject-hotel-showcase-list-carousel');
      const carouselGap = 20; // Gap between items in pixels
      const scrollWidth =
        showcaseList.querySelector('.inject-hotel-showcase-item').clientWidth + carouselGap;
      const scrollTo = direction === 'next' ? scrollWidth : -scrollWidth;

      CAROUSEL_SCROLL += scrollTo;

      showcaseList.scrollLeft = CAROUSEL_SCROLL;

      const leftArrow = document.querySelector('.inject-hotel-showcase-arrow-left');
      const rightArrow = document.querySelector('.inject-hotel-showcase-arrow-right');

      // Check if the end of the list is reached
      if (CAROUSEL_SCROLL + showcaseList.clientWidth >= showcaseList.scrollWidth) {
        rightArrow.setAttribute('disabled', true);
      } else {
        rightArrow.removeAttribute('disabled');
      }

      // Check if the start of the list is reached
      if (CAROUSEL_SCROLL <= 0) {
        leftArrow.setAttribute('disabled', true);
      } else {
        leftArrow.removeAttribute('disabled');
      }
    }

    function createHotelElement(hotel) {
      const starsContainer = document.createElement('div');
      starsContainer.className = 'inject-hotel-showcase-item__stars';

      for (i = 0; i < hotel.stars; i++) {
        const star = document.createElement('span');
        star.className = 'inject-hotel-showcase-item__star';
        star.innerHTML = `<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="StarIcon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>`;
        starsContainer.appendChild(star);
      }

      const showcaseItem = document.createElement('li');
      showcaseItem.className = 'inject-hotel-showcase-item';
      showcaseItem.innerHTML = `
            <a class="inject-hotel-showcase-item__wrapper" href="[INSERT_LINK]" target="_blank" rel="noopener noreferrer">
                <div class="inject-hotel-showcase-item__image">
                    <img src="[INSERT_IMAGE]" alt=""/>
                </div>
                <div class="inject-hotel-showcase-item__content">
                    <div class="inject-hotel-showcase-item__header">
                        <h3 class="inject-hotel-showcase-item__title">[INSERT_NAME]</h3>
                    </div>
                    <p class="inject-hotel-showcase-item__locale">[INSERT_LOCALE]</p>
                    <p class="inject-hotel-showcase-item__price">[INSERT_PRICE]</p>
                </div>
            </a>
        `;

      showcaseItem.innerHTML = showcaseItem.innerHTML.replace('[INSERT_IMAGE]', hotel.image);
      showcaseItem.innerHTML = showcaseItem.innerHTML.replace('[INSERT_NAME]', hotel.name);
      showcaseItem.innerHTML = showcaseItem.innerHTML.replace('[INSERT_LOCALE]', hotel.locale);
      showcaseItem.innerHTML = showcaseItem.innerHTML.replace('[INSERT_PRICE]', hotel.price);
      showcaseItem.innerHTML = showcaseItem.innerHTML.replace('[INSERT_LINK]', hotel.link);

      showcaseItem
        .querySelector('.inject-hotel-showcase-item__wrapper')
        .addEventListener('click', () => {
          analyticsEvent(hotel.name);
        });

      showcaseItem.querySelector('.inject-hotel-showcase-item__header').appendChild(starsContainer);

      return showcaseItem;
    }

    /**
     * Observes DOM changes to re-inject the showcase if necessary.
     * Normally, this is used to ensure the showcase is injected after content changes, such as during loading or when results are empty, or when user search for diferent hotels.
     */
    function observerDomChanges() {
      const loadingObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.removedNodes.length > 0 || mutation.addedNodes.length > 0) {
            const loadingWrapper = getLoadingWrapper();
            const showcaseContainer = document.querySelector('.inject-hotel-showcase-container');

            if (loadingWrapper) {
              showcaseContainer?.remove();
              return;
            }

            const emptyResultsElement = document.querySelector(
              '.styles__EmptyContainer-sc-12qcli5-0',
            );

            if (emptyResultsElement) {
              showcaseContainer?.remove();
              console.log('[AT] Empty results element found, removing showcase.');
              return;
            }

            const listWrapper = document.querySelector(SELECTORS.listWrapper);

            if (listWrapper && listWrapper.hasAttribute('hidden')) {
              showcaseContainer?.remove();
              console.log('[AT] List wrapper is hidden, showcase will not be injected.');
              return;
            }

            const isOrlandoDestiny = destinyIsOrlando();

            if (showcaseContainer) {
              if (!isOrlandoDestiny) {
                showcaseContainer?.remove();
                console.log('[AT] Destiny is not Orlando, removing showcase.');
              }

              console.log('[AT] Showcase already injected, skipping re-injection.');
              return;
            }

            if (listWrapper && !listWrapper.hasAttribute('hidden')) {
              console.log(
                '[AT] List wrapper is visible, re-injecting showcase if destiny is Orlando...',
              );

              if (isOrlandoDestiny) {
                injectShowcase();
              }
            }
          }
        });
      });

      loadingObserver.observe(originalContentWrapper, {
        childList: true,
        subtree: true,
      });
    }

    function injectCustomStyles() {
      const style = document.createElement('style');

      style.textContent = `
            @media screen and (max-width: 575px) {
                .inject-hotel-showcase-container {
                    padding: 20px;
                }

                button.inject-hotel-showcase-arrow-left {
                    left: 4px;
                }

                button.inject-hotel-showcase-arrow-right {
                    right: 4px;
                }
            }

            @media screen and (min-width: 576px) {
                .inject-hotel-showcase-container {
                    padding: 30px;
                }

                button.inject-hotel-showcase-arrow-left {
                    left: 12px;
                }

                button.inject-hotel-showcase-arrow-right {
                    right: 12px;
                }
            }

            @media screen and (max-width: 767px) {
                .inject-hotel-showcase-item {
                    width: 100%;
                }
            }

            @media screen and (min-width: 768px) {
                .inject-hotel-showcase-item {
                    width: calc(50% - 10px);
                }
            }

            @media screen and (min-width: 1024px) {
                .inject-hotel-showcase-item {
                    width: calc(33.33% - 13.33px);
                }
            }

            @media screen and (max-width: 1199px) {
                .inject-hotel-showcase-container {
                    margin-top: 40px;
                }
            }

            .inject-hotel-showcase-container, .inject-hotel-showcase-list-carousel {
                width: 100%;
            }

            .inject-hotel-showcase-container {
                background: rgb(228 239 245);
                border-radius: 16px;
                margin-bottom: 40px;
                position: relative;
            }

            .inject-hotel-showcase-list-carousel {
                display: flex;
                gap: 20px;
                list-style: none;
                padding: 0;
                margin: 0;
                scroll-behavior: smooth;
                overflow-x: hidden;
            }

            .inject-hotel-showcase-item {
                flex-shrink: 0;
            }

            .inject-hotel-showcase-item__image img {
                object-fit: cover;
                width: 100%;
                height: 220px;
                border-radius: 16px 16px 0 0;
            }

            .inject-hotel-showcase-item__content {
                padding: 16px;
                font-family: "Helvetica Neue", Arial, Sans-Serif;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .inject-hotel-showcase-item__content .inject-hotel-showcase-item__title {
                font-size: 16px;
                font-weight: bold;
                margin: 0;
                color: rgb(4, 30, 66);
            }

            .inject-hotel-showcase-item__locale, .inject-hotel-showcase-item__price {
                font-size: 16px;
                margin: 0;
                color: rgb(89, 89, 89);
            }

            .inject-hotel-showcase-item__wrapper {
                border-radius: 16px;
                height: 100%;
                background: white;
                display: block;
            }

            .inject-hotel-showcase-title {
                font-size: 20px;
                line-height: normal;
                font-weight: bold;
                font-family: "Helvetica Neue", Helvetica, Arial;
                margin-bottom: 30px;
            }

            .inject-hotel-showcase-item__stars {
                display: flex;
                height: 20px;
            }

            .inject-hotel-showcase-item__header {
                display: flex;
                align-items: flex-start;
                flex-direction: column;
            }

            .inject-hotel-showcase-item__stars .inject-hotel-showcase-item__star {
                height: 20px;
                width: 20px;
            }

            .inject-hotel-showcase-item__stars .inject-hotel-showcase-item__star svg {
                height: 16px;
                width: 16px;
                fill: rgb(250, 175, 0);
            }

            button.inject-hotel-showcase-arrow {
                border: unset;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgb(255, 255, 255);
                border-radius: 100%;
                height: 40px;
                width: 40px;
                margin: 0;
                position: absolute;
                transform: translateY(-50%);
                top: 50%;
            }

            button.inject-hotel-showcase-arrow[disabled] {
                cursor: not-allowed;
            }

            button.inject-hotel-showcase-arrow:not([disabled]):hover svg path {
                fill: #026cb6;
            }

            button.inject-hotel-showcase-arrow svg {
                width: 32px;
                height: 32px;
            }

            button.inject-hotel-showcase-arrow svg path {
                fill: #041E42;
            }

            button.inject-hotel-showcase-arrow[disabled] svg path {
                fill: #949494;
            }
        `;

      document.head.appendChild(style);
    }

    function destinyIsOrlando() {
      const destiny =
        document.querySelector(SELECTORS.destiny)?.textContent ||
        document.querySelector(SELECTORS.destinyMoba)?.textContent ||
        '';
      console.log('[AT] Current destiny:', destiny);

      return destiny == 'Orlando';
    }

    function analyticsEvent(hotelName = '') {
      if (hotelName == '') {
        console.log('[AT] Missing parameters for analytics event.');
        return;
      }

      const labelEvent = 'AT_vitrine_hoteis_v1 ' + hotelName;

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
  };

  if (window.showcaseInjectedV1) {
    return;
  }

  window.showcaseInjectedV1 = true;
  checkIfDomReady();
})();
