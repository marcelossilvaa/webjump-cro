(function() {
    const experienceName = "AT_EXPERIENCE_PERSONALIZATION_COMPLETE_TRIP";
    const experienceTargetUrl = "ofertas/viagem-completa";
    const experienceAlreadyExecuted = window[experienceName] || false;

    const onExperienceTargetPage = () => {
        const currentUrl = window.location.pathname;
        const testUrl = experienceTargetUrl;

        return currentUrl.includes(testUrl);
    }

    const initExperienceWhenReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";

        if (isReady) {
            experienceSetup();
        } else {
            document.addEventListener("DOMContentLoaded", experienceSetup);
        }
    }
    
    if(experienceAlreadyExecuted || !onExperienceTargetPage()) {
        console.log("[AT] Page is not a correct page OR script already executed.");
        return;
    }

    window[experienceName] = true;
    initExperienceWhenReady();

    function experienceSetup() {
        const SELECTORS = {
            fifteenSectionImage: "img[src='/content/dam/voe-azul/lp-de-ofertas/03-02/bloco-pacotes-15off-desktop.png']",
            tenSectionImage: "img[src='/content/dam/voe-azul/lp-de-ofertas/03-02/bloco-pacotes-10off-desktop.png']",
        };

        const isReadyToInject = document.querySelector(SELECTORS.fifteenSectionImage) || document.querySelector(SELECTORS.tenSectionImage);

        if(!isReadyToInject) {
            console.log("[AT] Target elements not found, retrying...");
            requestAnimationFrame(experienceSetup);
            return;
        }

        analyticsEvent("loaded");
        injectCustomStyles();
        injectCustomHTML();

        function injectCustomHTML() {
            const fifteenSectionImage = document.querySelector(SELECTORS.fifteenSectionImage);
            const tenSectionImage = document.querySelector(SELECTORS.tenSectionImage);

            if(fifteenSectionImage) {
                const sectionFifteen = getSectionFifteen();
                const buttonParent = fifteenSectionImage.parentElement;
                buttonParent.insertAdjacentElement("afterend", sectionFifteen);
                buttonParent.style.setProperty("display", "none");
            }

            if(tenSectionImage) {
                const sectionTen = getSectionTen();
                const buttonParent = tenSectionImage.parentElement;
                buttonParent.insertAdjacentElement("afterend", sectionTen);
                buttonParent.style.setProperty("display", "none");
            }


            initializeFilters();
        }

        function getSectionFifteen() {
            const html = document.createElement("section");
            html.classList.add("injectedPackageSection");

            html.innerHTML = `
                <div class="injectedPackage__header">
            <div class="injectedPackage__header__info">
                <svg width="124" height="58" viewBox="0 0 124 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M39.698 35.0533L29.8461 55.1153L24.7283 56.3948L28.4131 32.1106" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M9.34985 37.6121L13.3674 44.2909L15.3889 42.3206V36.9724" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M39.0346 14.5812L30.4878 18.394C29.5666 18.8034 28.4407 18.5219 27.8777 17.6519C27.2124 16.6539 26.8541 15.6815 26.6238 14.8883C26.3679 13.9159 26.8797 12.8923 27.8009 12.4573L36.3733 8.6189C36.3733 8.6189 38.8811 10.0775 39.009 14.53L39.0346 14.5812Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M45.25 32.6733L36.4985 36.0255C35.5517 36.3838 34.4513 36.0255 33.9395 35.1555C33.3254 34.1319 33.0183 33.1339 32.8392 32.3407C32.6345 31.3427 33.1974 30.3447 34.1698 29.9865L42.9469 26.6343C42.9469 26.6343 45.3523 28.2464 45.25 32.6989V32.6733Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M36.1914 15.861L39.6971 18.0361L49.9328 13.9418C51.5961 13.2765 53.4129 13.2253 55.1274 13.7627L58.326 14.7862C60.2708 15.4004 60.7314 17.9337 59.1449 19.2132C57.1745 20.7741 54.9738 22.028 52.6196 22.9236L13.6985 37.7142L4.00014 37.6374L6.68701 34.9505L1.33887 26.9155L4.00014 25.5849L12.0352 30.933L25.4183 24.2542L7.68499 2.68254L12.8028 1.40308L29.5382 11.7411" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M75.6912 44.6369V42.979C75.6912 41.1289 77.1809 39.6392 79.031 39.6392L108.417 39.3509L116.442 31.3257C117.595 30.1724 119.445 30.1724 120.575 31.3257C121.704 32.455 121.728 34.3051 120.575 35.4584L110.627 45.6701" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M113.966 12.1516C107.935 5.25568 98.3239 1.98794 88.9051 4.51083C79.4623 7.03372 72.7827 14.6745 71.0046 23.6608L113.966 12.1516Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M88.9045 4.51099C88.9045 4.51099 99.6929 4.79931 104.186 14.7707" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M88.978 4.51099C88.978 4.51099 79.7754 10.1334 80.8326 21.0179" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M88.832 4.31876L88.0391 1.33936" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10" stroke-linecap="round"/>
                    <path d="M98.2991 39.5673L92.4604 17.7983" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M103.563 55.9775L102.265 51.0759" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M122.664 45.646H72.2065V51.6529H122.664V45.646Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M77.0112 51.6528V56.4583" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M117.883 51.6528V56.4583" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                </svg>
                <div class="injectedPackage__header__info__wrapper">
                    <h3 class="injectedPackage__header__info__wrapper__title">Pacotes</h3>
                    <h4 class="injectedPackage__header__info__wrapper__subtitle">(aéreo + hotel) para viajar entre fevereiro e março com</h4>
                </div>
            </div>
            <div class="injectedPackage__header__cupom">
                <span class="injectedPackage__header__cupom__percent"><b>15%</b> OFF*</span>
                <div class="injectedPackage__header__cupom__wrapper">
                    <span class="injectedPackage__header__cupom__code">USE O CUPOM:</span>
                    <span class="injectedPackage__header__cupom__info">ULTIMA15</span>
                </div>
                <small class="injectedPackage__header__cupom__disclaimer">*Consulte condições</small>
            </div>
        </div>
        <div class="injectedPackage__filter">
            <button class="injectedPackage__filter__button active" target="#15nacionais">Pacotes nacionais</button>
            <button class="injectedPackage__filter__button" target="#15internacionais">Pacotes internacionais</button>
        </div>
        <div class="injectedPackage__filter__results">
            <div class="injectedPackage__cards active" id="15nacionais">
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=exclusive&searchType=hotels&packageID=1&hotelDestinationID=743&paxs=20&master=true&destinationID=40253&startDate=2026-03-22&originID=38417&accion=searchmasters&endDate=2026-03-26&cabinType=3&packageType=D3N&appendHashParams=name%3Dexclusive">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/mqdUFxN.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Gramado</span>
                            <span class="injectedPackage__card__badges__badge --days">5 dias / 4 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Exclusive Gramado by Gramado Parks</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">164</span>
                                <span class="injectedPackage__card__info__pricing__cents">,61</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 1.646,10</b> à vista ou <b>109.746 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=hotel%20areia%20de%20ouro&searchType=hotels&packageID=1&hotelDestinationID=1293&paxs=20&master=true&destinationID=39932&startDate=2026-03-25&originID=38417&accion=searchmasters&endDate=2026-03-29&cabinType=3&packageType=D3N&appendHashParams=name%3Dhotel%2Bareia%2Bde%2Bouro">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/dBBXmfa.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Natal</span>
                            <span class="injectedPackage__card__badges__badge --days">5 dias / 4 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Hotel Areia de Ouro</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">173</span>
                                <span class="injectedPackage__card__info__pricing__cents">,66</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 1.736,60</b> à vista ou <b>111.736 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=Transamerica&searchType=hotels&packageID=1&hotelDestinationID=1293&paxs=20&master=true&destinationID=39932&startDate=2026-03-09&originID=1601&accion=searchmasters&endDate=2026-03-13&cabinType=3&packageType=D3N&appendHashParams=name%3DTransamerica">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/S939ths.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Natal</span>
                            <span class="injectedPackage__card__badges__badge --days">5 dias / 4 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Transamérica Executive</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">258</span>
                                <span class="injectedPackage__card__info__pricing__cents">,87</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 2.588,70</b> à vista ou <b>157.884 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=Coliseum%20Beach%20Hotel&searchType=hotels&packageID=1&hotelDestinationID=694&paxs=20&master=true&destinationID=38810&startDate=2026-03-21&originID=38417&accion=searchmasters&endDate=2026-03-26&cabinType=3&packageType=D3N&appendHashParams=name%3DColiseum%2BBeach%2BHotel">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/7TkdQYV.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Fortaleza</span>
                            <span class="injectedPackage__card__badges__badge --days">6 dias / 5 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Coliseum Beach Hotel</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item inclusive">All inclusive</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">486</span>
                                <span class="injectedPackage__card__info__pricing__cents">,99</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 4.869,90</b> à vista ou <b>299.456 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
            </div>
            <div class="injectedPackage__cards" id="15internacionais">
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=zurique&searchType=hotels&packageID=1&hotelDestinationID=7920&paxs=20&master=true&destinationID=41527&startDate=2026-03-19&originID=38443&accion=searchmasters&endDate=2026-03-25&cabinType=3&packageType=D3N&appendHashParams=name%3Dzurique">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/vy3fY0B.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Lisboa</span>
                            <span class="injectedPackage__card__badges__badge --days">7 dias / 6 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">VIP Executive Zurique Hotel</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">595</span>
                                <span class="injectedPackage__card__info__pricing__cents">,54</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 5.955,40</b> à vista ou <b>398.931 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=turim&searchType=hotels&packageID=1&hotelDestinationID=8651&paxs=20&master=true&destinationID=40080&startDate=2026-03-19&originID=38443&accion=searchmasters&endDate=2026-03-25&cabinType=3&packageType=D3N&appendHashParams=name%3Dturim">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/2NSjsQA.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Porto</span>
                            <span class="injectedPackage__card__badges__badge --days">7 dias / 6 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Turim Oporto Hotel</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">813</span>
                                <span class="injectedPackage__card__info__pricing__cents">,52</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 8.135,20</b> à vista ou <b>542.375 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=Ars&searchType=hotels&packageID=1&hotelDestinationID=14525&paxs=20&master=true&destinationID=37794&startDate=2026-03-10&originID=38942&accion=searchmasters&endDate=2026-03-17&cabinType=3&packageType=D3N&appendHashParams=name%3DArs">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/xxR5NtF.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Roma</span>
                            <span class="injectedPackage__card__badges__badge --days">8 dias / 7 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Best Western Ars Hotel</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">842</span>
                                <span class="injectedPackage__card__info__pricing__cents">,08</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 8.420,80</b> à vista ou <b>350.545 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=Congres&searchType=hotels&packageID=1&hotelDestinationID=5399&paxs=20&master=true&destinationID=37786&startDate=2026-03-10&originID=38443&accion=searchmasters&endDate=2026-03-17&cabinType=3&packageType=D3N&appendHashParams=name%3DCongres">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/8PxgPs2.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Madri</span>
                            <span class="injectedPackage__card__badges__badge --days">8 dias / 7 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Eurostars Madrid Congress</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">844</span>
                                <span class="injectedPackage__card__info__pricing__cents">,45</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 8.444,50</b> à vista ou <b>563.000 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
            </div>
            <a href="https://www.azulviagens.com.br/" class="injectedPackage__cta" target="_blank">Mais ofertas</a>     
            <small class="injectedPackage__disclaimer">*Os valores dos pacotes são por pessoa, em apartamento duplo. Consulte condições.</small>
        </div>
            `;

            const cards = html.querySelectorAll(".injectedPackage__card");
            cards.forEach((card) => {
                card.addEventListener("click", () => {
                    analyticsEvent("card_click");
                });
            });

            return html;
        }

        function getSectionTen() {
            const html = document.createElement("section");
            html.classList.add("injectedPackageSection");
            html.classList.add("--secondary");

            html.innerHTML = `
                <div class="injectedPackage__header">
            <div class="injectedPackage__header__info">
                <svg width="187" height="58" viewBox="0 0 187 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M39.698 35.0536L29.8461 55.1155L24.7283 56.395L28.4131 32.1108" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M9.34985 37.6121L13.3674 44.2909L15.3889 42.3206V36.9724" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M39.0346 14.5813L30.4878 18.3941C29.5666 18.8035 28.4407 18.522 27.8777 17.652C27.2124 16.654 26.8541 15.6816 26.6238 14.8884C26.3679 13.916 26.8797 12.8924 27.8009 12.4574L36.3733 8.61902C36.3733 8.61902 38.8811 10.0776 39.009 14.5301L39.0346 14.5813Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M45.25 32.6736L36.4985 36.0258C35.5517 36.384 34.4513 36.0258 33.9395 35.1557C33.3254 34.1322 33.0183 33.1342 32.8392 32.3409C32.6345 31.3429 33.1974 30.345 34.1698 29.9867L42.9469 26.6345C42.9469 26.6345 45.3523 28.2466 45.25 32.6992V32.6736Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M36.1914 15.8611L39.6971 18.0362L49.9328 13.9419C51.5961 13.2766 53.4129 13.2254 55.1274 13.7628L58.326 14.7864C60.2708 15.4005 60.7314 17.9338 59.1449 19.2133C57.1745 20.7742 54.9738 22.0281 52.6196 22.9237L13.6985 37.7143L4.00014 37.6375L6.68701 34.9506L1.33887 26.9156L4.00014 25.585L12.0352 30.9331L25.4183 24.2544L7.68499 2.68266L12.8028 1.4032L29.5382 11.7412" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M75.6912 44.6369V42.979C75.6912 41.1289 77.1809 39.6392 79.031 39.6392L108.417 39.3509L116.442 31.3257C117.595 30.1724 119.445 30.1724 120.575 31.3257C121.704 32.455 121.728 34.3051 120.575 35.4584L110.627 45.6701" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M113.966 12.1515C107.935 5.25556 98.3239 1.98782 88.9051 4.51071C79.4623 7.0336 72.7827 14.6744 71.0046 23.6606L113.966 12.1515Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M88.9045 4.51099C88.9045 4.51099 99.6929 4.79931 104.186 14.7707" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M88.978 4.51099C88.978 4.51099 79.7754 10.1334 80.8326 21.0179" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M88.832 4.31864L88.0391 1.33923" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10" stroke-linecap="round"/>
                    <path d="M98.2991 39.5673L92.4604 17.7983" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M103.563 55.9777L102.265 51.076" stroke="#C4D600" stroke-width="2.67782" stroke-miterlimit="10"/>
                    <path d="M122.664 45.646H72.2065V51.6529H122.664V45.646Z" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M77.0112 51.6527V56.4582" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M117.883 51.6527V56.4582" stroke="#C4D600" stroke-width="2.67782" stroke-linejoin="round"/>
                    <path d="M138.267 47.7245H146.492V51.2025C146.492 52.4951 145.434 53.5526 144.142 53.5526H140.617C139.324 53.5526 138.267 52.4951 138.267 51.2025V47.7245Z" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M172.342 47.7245H180.567V51.2025C180.567 52.4951 179.51 53.5526 178.217 53.5526H174.692C173.4 53.5526 172.342 52.4951 172.342 51.2025V47.7245Z" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M175.867 9.48953C159.417 8.26751 142.966 9.48953 142.966 9.48953V30.1464C142.966 30.1464 159.417 28.9244 175.867 30.1464V9.48953Z" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M180.568 24.1774V47.7248H138.267V25.8929" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M138.267 14.8006V8.26752C138.267 6.38749 139.724 4.85996 141.58 4.74246C147.879 4.38995 162.284 3.82594 177.231 4.74246C179.111 4.85996 180.568 6.38749 180.568 8.26752V14.8241" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M148.841 38.3245H145.316C144.018 38.3245 142.966 39.3766 142.966 40.6745C142.966 41.9724 144.018 43.0245 145.316 43.0245H148.841C150.139 43.0245 151.191 41.9724 151.191 40.6745C151.191 39.3766 150.139 38.3245 148.841 38.3245Z" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M173.517 38.3245H169.992C168.694 38.3245 167.642 39.3766 167.642 40.6745C167.642 41.9724 168.694 43.0245 169.992 43.0245H173.517C174.815 43.0245 175.867 41.9724 175.867 40.6745C175.867 39.3766 174.815 38.3245 173.517 38.3245Z" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M139.442 19.5008H138.266V25.9164H133.566V17.1743C133.566 15.8817 134.624 14.8242 135.916 14.8242H139.442" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M179.392 19.5008H180.567V25.9164H185.267V17.1743C185.267 15.8817 184.21 14.8242 182.917 14.8242H180.332H179.392" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                    <path d="M147.667 43.0245H171.167" stroke="#C4D600" stroke-width="2.35004" stroke-linejoin="round"/>
                </svg>
                <div class="injectedPackage__header__info__wrapper">
                    <h3 class="injectedPackage__header__info__wrapper__title">Pacotes</h3>
                    <h4 class="injectedPackage__header__info__wrapper__subtitle">(aéreo + hotel + serviços) com</h4>
                </div>
            </div>
            <div class="injectedPackage__header__cupom">
                <span class="injectedPackage__header__cupom__percent"><b>10%</b> OFF*</span>
                <div class="injectedPackage__header__cupom__wrapper">
                    <span class="injectedPackage__header__cupom__code">USE O CUPOM:</span>
                    <span class="injectedPackage__header__cupom__info">VIAGEM10</span>
                </div>
                <small class="injectedPackage__header__cupom__disclaimer">*Consulte condições</small>
            </div>
        </div>
        <div class="injectedPackage__filter">
            <button class="injectedPackage__filter__button active" target="#10nacionais">Pacotes nacionais</button>
            <button class="injectedPackage__filter__button" target="#10internacionais">Pacotes internacionais</button>
        </div>
        <div class="injectedPackage__filter__results">
            <div class="injectedPackage__cards active" id="10nacionais">
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=ibis%20styles&searchType=hotels&packageID=1&hotelDestinationID=15015&paxs=20&master=true&destinationID=62621&startDate=2026-04-02&originID=38443&accion=searchmasters&endDate=2026-04-05&cabinType=3&packageType=D3N&appendHashParams=name%3Dibis%2Bstyles">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/6DlBcCg.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Bonito</span>
                            <span class="injectedPackage__card__badges__badge --days">5 dias / 4 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Ibis Styles Bonito</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">188</span>
                                <span class="injectedPackage__card__info__pricing__cents">,41</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 1.844,10</b> à vista ou <b>125.615 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=solar&searchType=hotels&packageID=1&hotelDestinationID=9969&paxs=20&master=true&destinationID=40383&startDate=2026-06-06&originID=38346&accion=searchmasters&endDate=2026-06-13&cabinType=3&packageType=D3N&appendHashParams=name%3Dsolar">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/ztXn7Y0.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Porto de Galinhas</span>
                            <span class="injectedPackage__card__badges__badge --days">8 dias / 7 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Hotel Solar Porto de Galinhas</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">403</span>
                                <span class="injectedPackage__card__info__pricing__cents">,76</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 4.037,60</b> à vista ou <b>251.740 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=maragogi%20brisa&searchType=hotels&packageID=1&hotelDestinationID=9974&paxs=20&master=true&destinationID=39688&startDate=2026-05-23&originID=38417&accion=searchmasters&endDate=2026-05-30&cabinType=3&packageType=D3N&appendHashParams=name%3Dmaragogi%2Bbrisa">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/EX4I7MY.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Maragogi</span>
                            <span class="injectedPackage__card__badges__badge --days">8 dias / 7 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Maragogi Brisa Exclusive Hotel</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item pensao">Meia pensão</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">520</span>
                                <span class="injectedPackage__card__info__pricing__cents">,95</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 5.209,50</b> à vista ou <b>319.134 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=coroa%20vermelha&searchType=hotels&packageID=1&hotelDestinationID=1455&paxs=20&master=true&destinationID=38185&startDate=2026-03-29&originID=40981&accion=searchmasters&endDate=2026-04-05&cabinType=3&packageType=D3N&appendHashParams=name%3Dcoroa%2Bvermelha">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/w33PGcW.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Porto Seguro</span>
                            <span class="injectedPackage__card__badges__badge --days">8 dias / 7 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Coroa Vermelha Beach</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item inclusive">All inclusive</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">650</span>
                                <span class="injectedPackage__card__info__pricing__cents">,72</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 6.507,20</b> à vista ou <b>404.011 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
            </div>
            <div class="injectedPackage__cards" id="10internacionais">
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?originID=347&searchType=hotels&packageID=1&paxs=20&master=true&destinationID=39885&startDate=2026-04-08&accion=searchmasters&endDate=2026-04-12&cabinType=3&packageType=D3N&hotelDestinationID=43370">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/ZDJU4Oe.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Montevidéu</span>
                            <span class="injectedPackage__card__badges__badge --days">5 dias / 4 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Hotel Europa</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">274</span>
                                <span class="injectedPackage__card__info__pricing__cents">,18</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 2.741,80</b> à vista ou <b>182.796 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=Hotel%20Mendoza&searchType=hotels&packageID=1&hotelDestinationID=36868&paxs=20&master=true&destinationID=39700&startDate=2026-07-07&originID=38443&accion=searchmasters&endDate=2026-07-10&cabinType=3&packageType=D3N&appendHashParams=name%3DHotel%2BMendoza">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/0SboAEb.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Mendoza</span>
                            <span class="injectedPackage__card__badges__badge --days">4 dias / 3 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Hotel Mendoza</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item cafe">Café da manhã</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">304</span>
                                <span class="injectedPackage__card__info__pricing__cents">,82</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 3.048,20</b> à vista ou <b>203.228 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?hotelName=caesar&searchType=hotels&packageID=1&hotelDestinationID=14525&paxs=20&master=true&destinationID=37794&startDate=2026-04-15&originID=38942&accion=searchmasters&endDate=2026-04-22&cabinType=3&packageType=D3N&appendHashParams=name%3Dcaesar">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/3avcRu1.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Roma</span>
                            <span class="injectedPackage__card__badges__badge --days">8 dias / 7 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">The Caesar Roma Hotel</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">433</span>
                                <span class="injectedPackage__card__info__pricing__cents">,15</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 4.331,50</b> à vista ou <b>288.786 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
                <a class="injectedPackage__card" target="_blank" href="https://www.azulviagens.com.br/packages/results.aspx?baggageIncluded=false&hotelName=IBERO&searchType=hotels&packageID=1&hotelDestinationID=1480&paxs=20&master=true&destinationID=40320&startDate=2026-06-01&originID=38942&accion=searchmasters&endDate=2026-06-08&cabinType=3&packageType=D3N&appendHashParams=name%3DIBERO">
                    <div class="injectedPackage__card__image" style="background-image: url('https://imgur.com/PYJYEtX.png')"></div>
                    <div class="injectedPackage__card__info">
                        <div class="injectedPackage__card__badges">
                            <span class="injectedPackage__card__badges__badge --place">Punta Cana</span>
                            <span class="injectedPackage__card__badges__badge --days">6 dias / 5 noites</span>
                        </div>
                        <h3 class="injectedPackage__card__info__title">Iberostar Waves Dominicana</h3>
                        <ul class="injectedPackage__benefits">
                            <li class="injectedPackage__benefits__item aereo">Aéreo</li>
                            <li class="injectedPackage__benefits__item hospedagem">Hospedagem</li>
                            <li class="injectedPackage__benefits__item inclusive">All inclusive</li>
                        </ul>
                        <div class="injected__divider"></div>
                        <div class="injectedPackage__card__info__pricing">
                            <span class="injectedPackage__card__info__pricing__from">A partir de</span>
                            <div class="injectedPackage__card__info__pricing__wrapper">
                                <span class="injectedPackage__card__info__pricing__installments">10x R$</span>
                                <span class="injectedPackage__card__info__pricing__price">854</span>
                                <span class="injectedPackage__card__info__pricing__cents">,93</span>
                            </div>
                            <span class="injectedPackage__card__info__pricing__disclaimer"><b>R$ 8.549,30</b> à vista ou <b>561.460 pontos*</b></span>
                        </div>
                        <button class="injectedPackage__card__info__button">Eu quero</button>
                        <small class="injectedPackage__card__info__disclaimer">*Consulte condições.</small>
                    </div>
                </a>
            </div>
            <a href="https://www.azulviagens.com.br/" class="injectedPackage__cta" target="_blank">Mais ofertas</a>     
            <small class="injectedPackage__disclaimer">*Os valores dos pacotes são por pessoa, em apartamento duplo. Consulte condições.</small>
        </div>
            `;

            const cards = html.querySelectorAll(".injectedPackage__card");
            cards.forEach((card) => {
                card.addEventListener("click", () => {
                    analyticsEvent("card_click");
                });
            });

            return html;
        }

        function handleFilterClick(event) {
            analyticsEvent("filter_click");

            const targetId = event.target.getAttribute('target');
            const parent = event.target.closest('.injectedPackage__filter');
            const resultsContainer = parent.nextElementSibling;
            const cards = resultsContainer.querySelectorAll('.injectedPackage__cards');

            parent.querySelectorAll('.injectedPackage__filter__button').forEach(button => {
                button.classList.remove('active');
            });

            event.target.classList.add('active');

            cards.forEach(cardSet => {
                if (cardSet.id === targetId.substring(1)) {
                    cardSet.classList.add('active');
                } else {
                    cardSet.classList.remove('active');
                }
            });
        }

        function initializeFilters() {
            const filterButtons = document.querySelectorAll('.injectedPackage__filter__button');
            filterButtons?.forEach(button => {
                button.addEventListener('click', handleFilterClick);
            });
        }

        function injectCustomStyles() {
            const style = document.createElement("style");

            style.innerHTML = `
                .injectedPackageSection {
            background-color: #008BC4;
            padding: 30px 100px;
            border-radius: 100px 100px 0px 0px;
            display: flex;
            flex-direction: column;
            gap: 50px;
        }

        .injectedPackageSection * {
            font-family: "Helvetica Neue", Arial, sans-serif;
            line-height: normal !important;
        }

        .injectedPackageSection h1,
        .injectedPackageSection h2,
        .injectedPackageSection h3, 
        .injectedPackageSection h4,
        .injectedPackageSection p {
            margin: 0;
            padding: 0;
        }

        .injectedPackageSection.--secondary {
            background-color: #0061A0;
        }

        .injectedPackage__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            width: 100%;
            margin: 0 auto;
            max-width: 1212px;
        }

        .injectedPackage__header__info > svg {
            width: 120px;
            flex-shrink: 0;
        }

        .injectedPackage__header__info__wrapper__title {
            color: #C4D600;
            font-size: 50px;
            font-weight: 700;
        }

        .injectedPackage__header__info__wrapper__subtitle {
            font-weight: 300;
            font-size: 30px;
            color: #FFFFFF;
        }

        .injectedPackage__header__info {
            display: flex;
            gap: 40px;
            align-items: center;
        }

        .injectedPackage__header__cupom {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            flex-shrink: 0;
        }

        .injectedPackage__header__cupom__percent {
            color: #FFFFFF;
            font-weight: 700;
            font-size: 40px;
            display: flex;
            align-items: baseline;
        }

        .injectedPackage__header__cupom__percent b {
            color: #C4D600;
            font-size: 100px;
        }

        .injectedPackage__header__cupom__wrapper {
            display: flex;
            gap: 16px;
            align-items: center;
            border: solid 1px #FFFFFF;
            border-radius: 94px;
        }

        .injectedPackage__header__cupom__code {
            background-color: #C4D600;
            color: #0061A0;
            font-size: 14px;
            padding: 13px 16px;
            border-radius: 94px;
            max-width: 90px;
            font-weight: 700;
            text-align: center;
        }

        .injectedPackage__header__cupom__info {
            color: #FFFFFF;
            font-size: 27px;
            font-weight: 700;
            padding-right: 40px;
        }

        .injectedPackage__header__cupom__disclaimer {
            color: #FFFFFF;
            font-size: 12px;
            margin-top: 13px;
            font-weight: 300;
        }

        .injectedPackage__filter {
            display: flex;
            max-width: 690px;
            margin: 0 auto;
            width: 100%;
        }

        .injectedPackage__filter__button {
            background: #003D70;
            font-weight: 400;
            color: #FFFFFF80;
            font-size: 23px;
            padding: 18px 0px;
            border: none;
            border-radius: 60px;
            cursor: pointer;
        }

        .injectedPackage__filter__button:first-child {
            flex-shrink: 0;
            padding-right: 30px;
            padding-left: 30px;
        }

        .injectedPackage__filter__button:last-child {
            width: 100%;
            margin-left: -70px;
        }

        .injectedPackage__filter__button.active {
            background: #C4D600;
            font-weight: 700;
            color: #0061A0;
            cursor: default;
            z-index: 1;
            transition: background .3s linear 0s;
        }

        .injectedPackage__filter__button:not(.active) {
            transition: background ease-in-out 0.3s;
        }

        .injectedPackage__filter__button:not(.active):hover {
            background: #041E42;
            color: #FFFFFF;
        }

        .injectedPackage__cards {
            display: none;
        }

        .injectedPackage__cards.active {
            display: flex;
            justify-content: center;
            gap: 14px;
            flex-wrap: wrap;
        }

        .injectedPackage__card {
            border: solid 2px #041E42;
            border-radius: 30px;
            width: 294px;
            box-sizing: border-box;
            text-decoration: none;
            transition: margin-top .3s ease-in-out;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }

        .injectedPackage__card__image {
            width: 100%;
            height: 140px;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 30px 30px 0px 0px;
            flex-shrink: 0;
        }

        .injectedPackage__card__info {
            padding: 30px 20px 7px 20px;
            position: relative;
            background-color: #FFFFFF;
            border-radius: 0px 0px 30px 30px;
            flex-grow: 1;
        }

        .injectedPackage__card__badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            position: absolute;
            top: -13px;
        }

        .injectedPackage__card__badges__badge {
            border: solid 2px #0061A0;
            border-radius: 20px;
            padding: 4px 9px;
            font-size: 12px;
        }

        .injectedPackage__card__badges__badge.--place {
            background: #0061A0;
            color: #FFFFFF;
            font-weight: 700;
            display: flex;
            gap: 8px;
        }

        .injectedPackage__card__badges__badge.--place::before {
            content: url('data:image/svg+xml,<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 6.60653C6.25625 6.60653 6.875 6.01194 6.875 5.28522C6.875 4.55851 6.25625 3.96392 5.5 3.96392C4.74375 3.96392 4.125 4.55851 4.125 5.28522C4.125 6.01194 4.74375 6.60653 5.5 6.60653ZM5.5 0C8.3875 0 11 2.1273 11 5.41736C11 7.51823 9.31563 9.98907 5.95375 12.8365C5.6925 13.0545 5.30062 13.0545 5.03937 12.8365C1.68437 9.98907 0 7.51823 0 5.41736C0 2.1273 2.6125 0 5.5 0Z" fill="%23C4D600"/></svg>');
            font-size: 0;
        }

        .injectedPackage__card__badges__badge.--days {
            background-color: #FFFFFF;
            color: #0061A0;
            font-weight: 300;
        }

        .injectedPackage__card__info__title {
            color: #0061A0;
            font-weight: 700;
            text-decoration: none;
            font-size: 24px;
            min-height: 56px;
        }

        .injected__divider {
            display: block;
            height: 1.5px;
            width: 100%;
            background-color: #0061A0;
        }

        .injectedPackage__benefits {
            margin: 0;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 30px;
            list-style: none;
            min-height: 55px;
        }

        .injectedPackage__benefits__item {
            color: #0061A0;
            font-weight: 300;
            font-size: 13px;
            display: flex;
            gap: 3px;
        }

        .injectedPackage__benefits__item.aereo::before {
            font-size: 0;
        }

        .injectedPackage__benefits__item.aereo::before {
            content: url('data:image/svg+xml,<svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.6289 11.1283L9.49015 17.52L7.85962 17.9277L9.0336 10.1908" stroke="%230061A0" stroke-width="0.815265" stroke-linejoin="round"/><path d="M2.95996 11.9436L4.23993 14.0714L4.88399 13.4437V11.7397" stroke="%230061A0" stroke-width="0.815265" stroke-linejoin="round"/><path d="M12.4171 4.60611L9.69413 5.82086C9.40064 5.9513 9.04192 5.86162 8.86256 5.58443C8.65059 5.26647 8.53646 4.95668 8.46308 4.70394C8.38156 4.39414 8.54461 4.06804 8.8381 3.92944L11.5692 2.70654C11.5692 2.70654 12.3682 3.17124 12.409 4.5898L12.4171 4.60611Z" stroke="%230061A0" stroke-width="0.815265" stroke-linejoin="round"/><path d="M14.3978 10.3702L11.6096 11.4382C11.3079 11.5523 10.9574 11.4382 10.7943 11.161C10.5986 10.8349 10.5008 10.5169 10.4437 10.2642C10.3785 9.94626 10.5579 9.6283 10.8677 9.51417L13.664 8.44617C13.664 8.44617 14.4304 8.95979 14.3978 10.3783V10.3702Z" stroke="%230061A0" stroke-width="0.815265" stroke-linejoin="round"/><path d="M11.5116 5.01384L12.6285 5.70682L15.8896 4.40239C16.4195 4.19042 16.9984 4.17412 17.5446 4.34532L18.5637 4.67143C19.1833 4.86709 19.33 5.67421 18.8246 6.08184C18.1968 6.57915 17.4957 6.97863 16.7456 7.26397L4.34545 11.9762L1.25559 11.9517L2.11162 11.0957L0.407715 8.53579L1.25559 8.11185L3.81552 9.81575L8.07936 7.68791L2.42957 0.815225L4.0601 0.407593L9.39194 3.70126" stroke="%230061A0" stroke-width="0.815265" stroke-linejoin="round"/></svg>');
        }

        .injectedPackage__benefits__item.hospedagem::before {
            content: url('data:image/svg+xml,<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.48242 7.44919V1.14941C1.48242 1.14941 4.43221 -0.488535 8.76794 0.986354C12.4663 2.24631 15.5643 0.778833 15.5643 0.778833V7.44919" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/><path d="M1.48242 12.6371V14.49H2.22357L3.03145 12.6371H1.48242Z" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/><path d="M14.8228 12.6371V14.49H14.0816L13.2664 12.6371H14.8228Z" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/><path d="M15.1862 7.4491H1.86032C1.03758 7.4491 0.370605 8.11606 0.370605 8.93881V11.1474C0.370605 11.9702 1.03758 12.6371 1.86032 12.6371H15.1862C16.009 12.6371 16.6759 11.9702 16.6759 11.1474V8.93881C16.6759 8.11606 16.009 7.4491 15.1862 7.4491Z" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/><path d="M7.68564 6.04829C7.15942 5.70736 6.32934 5.59619 5.2102 5.59619C4.09106 5.59619 3.26096 5.70736 2.73474 6.04829C2.37158 6.27805 2.16406 6.78944 2.16406 7.30084V7.44907H8.25632V7.30084C8.25632 6.78203 8.05622 6.27805 7.68564 6.04829Z" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/><path d="M14.2813 6.04829C13.7551 5.70736 12.925 5.59619 11.8059 5.59619C10.6868 5.59619 9.85668 5.70736 9.33047 6.04829C8.9673 6.27805 8.75977 6.78944 8.75977 7.30084V7.44907H14.852V7.30084C14.852 6.78203 14.6519 6.27805 14.2813 6.04829Z" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/><path d="M0.370605 10.4137H16.6759" stroke="%230061A0" stroke-width="0.74115" stroke-linejoin="round"/></svg>');
        }

        .injectedPackage__benefits__item.pensao::before,
        .injectedPackage__benefits__item.cafe::before,
        .injectedPackage__benefits__item.inclusive::before {
            content: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.8551 6.29444L12.1382 8.01135L12.6346 8.50779L14.3515 6.79087L13.8551 6.29444Z" fill="%230061A0"/><path d="M14.7134 7.19426L12.9944 8.90906L13.4902 9.40612L15.2092 7.69133L14.7134 7.19426Z" fill="%230061A0"/><path d="M7.26672 15.7389C6.94492 15.7389 6.61142 15.5692 6.27208 15.2299C5.64019 14.598 5.59339 13.9837 6.13166 13.4454L10.2272 9.89396C9.765 8.97538 10.0692 8.36688 10.4261 8.00413L13.0005 5.42981L13.4978 5.92711L10.9235 8.50147C10.6017 8.82326 10.6192 9.21526 10.9702 9.78279C11.0638 9.92906 11.0346 10.1221 10.9 10.2333L6.60558 13.9544C6.47101 14.089 6.30132 14.2645 6.76938 14.7267C7.23744 15.1889 7.40713 15.0251 7.55925 14.873L11.2628 10.5961C11.3739 10.4673 11.567 10.4381 11.7133 10.5258C12.2808 10.8827 12.6787 10.8944 12.9946 10.5726L15.569 7.99831L16.0663 8.49561L13.4919 11.07C13.135 11.4269 12.5265 11.7311 11.6021 11.2689L8.06827 15.3469C7.81084 15.6043 7.5417 15.733 7.26086 15.733L7.26672 15.7389Z" fill="%230061A0"/><path d="M4.43483 12.9259C4.14229 12.9259 3.84392 12.803 3.60403 12.5573C3.37 12.3233 3.24712 12.019 3.25882 11.7031C3.27052 11.4105 3.39341 11.1297 3.60403 10.9191L6.0789 8.44418V7.44372C6.0789 7.33841 6.12573 7.23893 6.20764 7.17458C6.3071 7.09266 8.61229 5.20288 9.37289 4.6646C10.2973 4.00932 11.602 3.67583 12.1871 4.26676C12.544 4.62365 12.5206 4.97468 12.4738 5.15605C12.4153 5.38423 12.2807 5.52464 12.2573 5.5539L5.20714 12.6041C4.98481 12.8264 4.71567 12.9376 4.43483 12.9376V12.9259ZM6.77514 7.61338V8.59045C6.77514 8.68407 6.74004 8.77185 6.66983 8.83621L4.09548 11.4105C4.00772 11.4983 3.95507 11.6095 3.95507 11.7265C3.95507 11.8494 4.00187 11.9605 4.09548 12.06C4.2944 12.2589 4.52846 12.2765 4.70984 12.0951L11.76 5.05074C11.8536 4.94543 11.76 4.83426 11.6898 4.7582C11.4558 4.52417 10.5255 4.69384 9.7766 5.23211C9.13301 5.68847 7.28416 7.19798 6.77514 7.61338Z" fill="%230061A0"/><path d="M9.71231 19.4247C4.35885 19.4247 0 15.0659 0 9.71243C0 4.35897 4.35885 0.00012207 9.71231 0.00012207C15.0658 0.00012207 19.4246 4.35897 19.4246 9.71243C19.4246 15.0659 15.0658 19.4247 9.71231 19.4247ZM9.71231 0.702223C4.745 0.702223 0.7021 4.74512 0.7021 9.71243C0.7021 14.6797 4.745 18.7226 9.71231 18.7226C14.6796 18.7226 18.7225 14.6797 18.7225 9.71243C18.7225 4.74512 14.6796 0.702223 9.71231 0.702223Z" fill="%230061A0"/></svg>');
        }

        .injected__divider {
            margin-top: 22px;
            margin-bottom: 12px;
        }

        .injectedPackage__card__info__pricing__from {
            color: #0061A0;
            font-weight: 300;
            font-size: 17px;
            margin-left: 10px;
            margin-right: 10px;
        }

        .injectedPackage__card__info__pricing__wrapper {
            margin-left: 10px;
            margin-right: 10px;
            display: flex;
            align-items: anchor-center;
            color: #041E42;
            font-weight: 700;
        }

        .injectedPackage__card__info__pricing__installments {
            font-size: 26px;
            text-align: center;
        }

        .injectedPackage__card__info__pricing__price {
            font-size: 68px;
        }

        .injectedPackage__card__info__pricing__cents {
            font-size: 36px;
        }

        .injectedPackage__card__info__pricing__disclaimer {
            color: #0061A0;
            font-size: 13px;
            font-weight: 300;
            text-align: center;
            margin: 0 auto;
            display: block;
        }

        .injectedPackage__card__info__pricing__disclaimer b {
            font-weight: 700;
        }

        .injectedPackage__card__info__button {
            width: 100%;
            margin-top: 15px;
            background-color: #C4D600;
            border-radius: 90px;
            padding: 4px;
            display: flex;
            align-items: center;
            text-decoration: none;
            cursor: pointer;
            font-weight: 700;
            border: none;
            color: #0061A0;
            font-size: 16px;
            text-align: center;
            justify-content: center;
            position: relative;
            height: 46px;
        }

        .injectedPackage__card__info__button::before {
            content: url('data:image/svg+xml,<svg width="22" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.08447 6.90087C0.485597 6.90087 0.000113077 7.38635 0.00011313 7.98523C0.000113182 8.5841 0.485598 9.06959 1.08447 9.06959L1.08447 7.98523L1.08447 6.90087ZM23.5384 8.75199C23.9619 8.32852 23.9619 7.64194 23.5384 7.21847L16.6376 0.317648C16.2141 -0.10582 15.5276 -0.10582 15.1041 0.317649C14.6806 0.741117 14.6806 1.4277 15.1041 1.85116L21.2381 7.98523L15.1041 14.1193C14.6806 14.5428 14.6806 15.2293 15.1041 15.6528C15.5276 16.0763 16.2141 16.0763 16.6376 15.6528L23.5384 8.75199ZM1.08447 7.98523L1.08447 9.06959L22.7717 9.06959L22.7717 7.98523L22.7717 6.90087L1.08447 6.90087L1.08447 7.98523Z" fill="%23C4D600"/></svg>');
            background-color: #0061A0;
            border-radius: 840px;
            width: 52px;
            height: 38px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            left: 4px;
            font-size: 0;
        }

        .injectedPackage__cta {
            max-width: 100%;
            margin-top: 15px;
            background-color: #C4D600;
            border-radius: 90px;
            padding: 4px;
            display: flex;
            align-items: center;
            text-decoration: none;
            cursor: pointer;
            font-weight: 700;
            border: none;
            color: #0061A0;
            font-size: 25px;
            text-align: center;
            justify-content: center;
            position: relative;
            height: 58px;
            width: 406px;
            padding-left: 40px;
            margin-top: 40px;
            margin-left: auto;
            margin-right: auto;
        }

        .injectedPackage__cta::before {
            content: url('data:image/svg+xml,<svg width="26" height="32" viewBox="0 0 26 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 16.25C14.7875 16.25 16.25 14.7875 16.25 13C16.25 11.2125 14.7875 9.75 13 9.75C11.2125 9.75 9.75 11.2125 9.75 13C9.75 14.7875 11.2125 16.25 13 16.25ZM13 0C19.825 0 26 5.2325 26 13.325C26 18.4925 22.0187 24.57 14.0725 31.5737C13.455 32.11 12.5287 32.11 11.9113 31.5737C3.98125 24.57 0 18.4925 0 13.325C0 5.2325 6.175 0 13 0Z" fill="%23C4D600"/></svg>');
            background-color: #0061A0;
            border-radius: 840px;
            width: 78px;
            height: 52px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            left: 4px;
            font-size: 0;
        }

        .injectedPackage__card__info__disclaimer {
            color: #0061A0;
            font-size: 10px;
            display: block;
            margin-top: 10px; 
            text-align: center;
        }

        a.injectedPackage__card:hover {
            margin-top: -5px;
        }

        .injectedPackage__disclaimer {
            color: #FFFFFF;
            font-size: 16px;
            text-align: center;
            margin-top: 25px;
            font-weight: 300;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .injectedPackage__filter__button:first-child {
            max-width: 100%;
            min-width: 336px;
        }

        .css-1hzffd0 {
            background: rgb(0 139 196);
        }

        @media screen and (max-width: 1024px) {
            .injectedPackageSection {
                padding: 30px !important;
                gap: 30px !important;
            }

            .injectedPackage__header__info__wrapper__title {
                font-size: 30px !important;
            }

            .injectedPackage__header__info__wrapper__subtitle {
                font-size: 18px !important;
            }

            .injectedPackage__header__cupom__percent {
                font-size: 30px !important;
            }

            .injectedPackage__header__cupom__percent b {
                font-size: 60px !important;
            }

            .injectedPackage__header {
                flex-direction: column !important;
            }

            .injectedPackage__header__info {
                flex-direction: column !important;
                gap: 10px !important;
                text-align: center !important;
            }
            
            .injectedPackage__header__cupom {
                align-items: center !important;
            }

            .injectedPackage__filter {
                flex-direction: column !important;
                justify-content: center !important;
                gap: 10px !important;
            }

            .injectedPackage__filter__button:last-child {
                margin-left: 0 !important;
            }

            .injectedPackage__filter__button {
                font-size: 20px !important;
            }

            .injectedPackage__cta {
                padding-left: 4px !important;
            }

            .injectedPackage__cta::before {
                display: none !important;
            }

            .injectedPackage__filter__button:first-child {
                max-width: 100%;
                min-width: 100% !important;
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