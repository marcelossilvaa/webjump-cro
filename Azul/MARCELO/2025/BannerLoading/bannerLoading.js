/**
 * Azul Loading Banner Modal
 * Modal promocional exibido durante o loading da página de tarifas
 * Versões: Desktop e Mobile responsivo
 */

(function () {
  'use strict';

  // Configurações do modal
  const CONFIG = {
    urlTarget: '/home/responsavel',
    showDelay: 0, // Exibir imediatamente após injeção
    hideDelay: 8000, // Tempo para esconder o modal automaticamente (8 segundos)
    loadingMessages: {
      0: 'Estamos iniciando sua reserva...',
      50: 'Quase lá... Estamos assegurando sua passagem.',
      75: 'Pronto para decolar! Estamos finalizando a etapa com segurança.',
    },
    title: 'A um passo da viagem <br> dos sonhos.',
    description:
      'Sua experiência Azul fica ainda melhor. Ao comprar sua passagem, você ganha <strong>15% OFF em hotéis</strong> para escolher sua hospedagem com calma, quando quiser.',
    hotelImage: 'https://i.imgur.com/MyN94BQ.png', // Imagem desktop
    brandColors: {
      primary: '#0066CC',
      secondary: '#F0F8FF',
      text: '#333333',
      lightGray: '#F5F5F5',
      darkBlue: '#003366',
    },
  };

  class AzulLoadingBanner {
    constructor() {
      this.isVisible = false;
      this.progressInterval = null;
      this.hideTimeout = null;
      this.hideDebounceTimeout = null;
      this.loaderMonitorInterval = null;
      this.observer = null;
      this.originalLoader = null;
      this.bannerInstance = null; // Controle de instância única
      this.shouldActivateOnLoader = false; // Flag para ativar banner após clique
      this.init();
    }

    init() {
      // Pré-carrega a imagem do banner
      this.preloadBannerImage();

      // Verifica se deve configurar o listener do botão específico
      this.setupSpecificButtonListener();

      // Inicia o observador para detectar o loader existente
      this.setupLoaderObserver();
    }

    shouldShowBanner() {
      const currentUrl = window.location.href;

      if (!currentUrl.includes('/home/responsavel')) {
        return false;
      }

      if (!this.shouldActivateOnLoader) {
        return false;
      }

      return true;
    }

    setupSpecificButtonListener() {
      const currentUrl = window.location.href;

      if (!currentUrl.includes('/home/responsavel')) {
        return;
      }

      this.findAndSetupButton();

      document.addEventListener(
        'click',
        (event) => {
          const target = event.target;
          const button = target.closest('button');

          if (!button) return;

          const ariaLabel = button.getAttribute('aria-label');
          const buttonText = button.querySelector('.button__text');
          const buttonTextContent = buttonText ? buttonText.textContent.trim() : '';

          if (
            ariaLabel === 'Ir para escolha de assentos' ||
            buttonTextContent === 'Ir para escolha de assentos'
          ) {
            this.activateBannerForTransition();
          }
        },
        true
      );
    }

    findAndSetupButton() {
      const allButtons = document.querySelectorAll('button');
      let targetButton = null;

      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const ariaLabel = button.getAttribute('aria-label');
        const buttonText = button.querySelector('.button__text');
        const buttonTextContent = buttonText ? buttonText.textContent.trim() : '';

        if (
          ariaLabel === 'Ir para escolha de assentos' ||
          buttonTextContent === 'Ir para escolha de assentos'
        ) {
          targetButton = button;
          break;
        }
      }

      if (targetButton) {
        const clickHandler = (event) => {
          this.activateBannerForTransition();
        };

        targetButton.addEventListener('click', clickHandler, true);
        targetButton.addEventListener('mousedown', clickHandler, true);
        targetButton.addEventListener('touchstart', clickHandler, true);
      } else {
        setTimeout(() => {
          this.findAndSetupButton();
        }, 2000);
      }
    }

    activateBannerForTransition() {
      this.shouldActivateOnLoader = true;
    }

    preloadBannerImage() {
      const img = new Image();
      img.src = CONFIG.hotelImage;
    }

    setupLoaderObserver() {
      this.checkForExistingLoader();

      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('loader')) {
                  this.replaceLoaderWithBanner(node);
                }
                const loaderElements = node.querySelectorAll
                  ? node.querySelectorAll('.loader')
                  : [];
                loaderElements.forEach((loader) => this.replaceLoaderWithBanner(loader));
              }
            });
          }
        });
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    checkForExistingLoader() {
      const existingLoader = document.querySelector('.loader');
      if (existingLoader) {
        this.replaceLoaderWithBanner(existingLoader);
      }
    }

    replaceLoaderWithBanner(loaderElement) {
      if (!this.shouldActivateOnLoader) {
        return;
      }

      this.shouldActivateOnLoader = false;

      if (this.isVisible || document.getElementById('azul-loading-banner')) {
        return;
      }

      if (loaderElement.dataset.azulReplaced) {
        return;
      }

      loaderElement.dataset.azulReplaced = 'true';
      this.originalLoader = loaderElement;
      loaderElement.style.display = 'none';

      this.createBannerHTML();
      this.setupEventListeners();
      this.startLoadingSequence();
      this.startLoaderMonitoring();
    }

    createBannerHTML() {
      // Remove banner existente se houver
      const existingBanner = document.getElementById('azul-loading-banner');
      if (existingBanner) {
        existingBanner.remove();
      }

      const bannerHTML =
        '<div id="azul-loading-banner" class="azul-banner-overlay">' +
        '<div class="azul-banner-modal">' +
        '<!-- Versão Desktop -->' +
        '<div class="azul-banner-desktop">' +
        '<div class="azul-banner-image">' +
        '<img src="' +
        CONFIG.hotelImage +
        '" alt="Resort tropical com piscina" />' +
        '<div class="azul-banner-overlay-gradient"></div>' +
        '</div>' +
        '<div class="azul-banner-content">' +
        '<div class="azul-banner-background-icon">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">' +
        '<g opacity="0.08">' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M83.3609 31.8799C87.8023 27.4385 93.795 25 100 25C106.205 25 112.198 27.4385 116.639 31.8799L123.375 38.6163C123.846 39.0869 124.413 39.4673 124.957 39.691C125.577 39.9464 126.252 40.0797 126.822 40.0797H136.401C142.675 40.0797 148.604 42.5227 153.04 46.9596L153.063 46.9825C157.401 51.3941 159.92 57.3661 159.92 63.5987V73.178C159.92 73.7682 160.037 74.3549 160.275 74.9591C160.634 75.7045 161.007 76.2481 161.384 76.6245L168.12 83.3609C172.561 87.8023 175 93.795 175 100C175 106.233 172.481 112.204 168.143 116.616L168.12 116.639L161.384 123.375C160.913 123.846 160.533 124.413 160.309 124.957C160.048 125.591 159.92 126.204 159.92 126.822V136.401C159.92 142.675 157.477 148.604 153.04 153.04L153.017 153.063C148.606 157.401 142.634 159.92 136.401 159.92H126.822C126.252 159.92 125.577 160.054 124.957 160.309C124.413 160.533 123.846 160.913 123.375 161.384L116.662 168.097C114.538 170.29 111.943 171.977 109.26 173.137L109.106 173.204L108.881 173.279C106.039 174.426 103.05 175 100 175C96.9505 175 93.9613 174.426 91.1191 173.279L90.8937 173.204L90.7403 173.137C88.0071 171.955 85.4987 170.258 83.3609 168.12L76.6245 161.384C76.1539 160.913 75.5866 160.533 75.0433 160.309C74.4232 160.054 73.7475 159.92 73.178 159.92H63.5987C57.3254 159.92 51.3964 157.477 46.9596 153.04L46.9366 153.017C42.5985 148.606 40.0797 142.634 40.0797 136.401V126.822C40.0797 126.204 39.9521 125.591 39.691 124.957C39.4673 124.413 39.0869 123.846 38.6163 123.375L31.8799 116.639C27.4385 112.198 25 106.205 25 100C25 93.7674 27.519 87.7956 31.857 83.384L31.8798 83.3608L38.6163 76.6245C39.0869 76.1539 39.4673 75.5866 39.691 75.0433C39.9521 74.4093 40.0797 73.7956 40.0797 73.178V63.5987C40.0797 57.3444 42.5105 51.3343 46.9826 46.9367C51.3942 42.5986 57.3661 40.0797 63.5987 40.0797H73.178C73.7475 40.0797 74.4232 39.9464 75.0433 39.691C75.5866 39.4673 76.1539 39.0869 76.6245 38.6163L83.3609 31.8799ZM100 32.732C95.8223 32.732 91.8031 34.3723 88.8282 37.3472L82.0918 44.0836C80.9555 45.2199 79.5452 46.1991 77.9872 46.8406C76.5061 47.4505 74.8333 47.8116 73.178 47.8116H63.5987C59.4485 47.8116 55.4085 49.4952 52.4038 52.4498C49.4597 55.3448 47.8116 59.3466 47.8116 63.5987V73.178C47.8116 74.9088 47.4448 76.5199 46.8406 77.9872C46.1991 79.5452 45.2199 80.9555 44.0836 82.0918L37.3594 88.8161C34.4115 91.8196 32.732 95.8549 32.732 100C32.732 104.178 34.3723 108.197 37.3472 111.172L44.0836 117.908C45.2199 119.044 46.1991 120.455 46.8406 122.013C47.4448 123.48 47.8116 125.091 47.8116 126.822V136.401C47.8116 140.546 49.4909 144.581 52.4385 147.585C55.4166 150.557 59.3711 152.188 63.5987 152.188H73.178C74.8333 152.188 76.5061 152.55 77.9872 153.159C79.5452 153.801 80.9555 154.78 82.0918 155.916L88.8282 162.653C90.2369 164.061 91.8802 165.184 93.6644 165.977L93.8067 166.025L93.9275 166.074C95.8683 166.87 97.9034 167.268 100 167.268C102.097 167.268 104.132 166.87 106.072 166.074L106.193 166.025L106.336 165.977C108.159 165.168 109.827 164.045 111.124 162.701L111.171 162.652L117.908 155.916C119.044 154.78 120.455 153.801 122.013 153.159C123.494 152.55 125.167 152.188 126.822 152.188H136.401C140.546 152.188 144.581 150.509 147.585 147.561C150.557 144.583 152.188 140.629 152.188 136.401V126.822C152.188 125.091 152.555 123.48 153.159 122.013C153.801 120.455 154.78 119.044 155.916 117.908L162.63 111.195L162.641 111.184C165.589 108.18 167.268 104.145 167.268 100C167.268 95.8223 165.628 91.8031 162.653 88.8282L155.916 82.0918C154.701 80.8764 153.852 79.4709 153.236 78.1614L153.196 78.0753L153.159 77.9872C152.555 76.5199 152.188 74.9088 152.188 73.178V63.5987C152.188 59.4538 150.509 55.4188 147.562 52.4153C144.583 49.4433 140.629 47.8116 136.401 47.8116H126.822C125.167 47.8116 123.494 47.4505 122.013 46.8406C120.455 46.1991 119.044 45.2199 117.908 44.0836L111.172 37.3472C108.197 34.3723 104.178 32.732 100 32.732Z" fill="#595959"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M127.25 119C127.25 123.5 123.625 127.125 119.125 127.125C114.625 127.125 110.938 123.5 110.938 119C110.938 114.5 114.562 110.875 119.125 110.875C123.562 110.875 127.25 114.5 127.25 119Z" fill="#595959"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M83.1875 91.25C87.6875 91.25 91.3125 87.625 91.3125 83.125C91.3125 78.625 87.6875 75 83.1875 75C78.6875 75 75 78.625 75 83.125C75 87.625 78.6875 91.25 83.1875 91.25Z" fill="#595959"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M80.75 123C81.625 123.625 82.6875 123.938 83.75 123.938C84.4375 123.938 85.1875 123.812 85.8125 123.5C86.5 123.25 87.0625 122.812 87.5625 122.312L122.25 87.625C122.75 87.125 123.188 86.5 123.5 85.875C123.812 85.1875 123.938 84.5 123.938 83.75C123.938 83 123.812 82.3125 123.5 81.625C123.25 80.9375 122.812 80.375 122.312 79.8125C121.812 79.3125 121.187 78.875 120.5 78.625C119.812 78.375 119.125 78.1875 118.375 78.25C117.625 78.25 116.937 78.375 116.25 78.6875C115.562 79 115 79.375 114.5 79.9375L79.8125 114.625C79.0625 115.375 78.5625 116.375 78.3125 117.437C78.125 118.5 78.1875 119.562 78.625 120.562C79.125 121.562 79.8125 122.375 80.75 123Z" fill="#595959"/>' +
        '</g>' +
        '</svg>' +
        '</div>' +
        '<h2 class="azul-banner-title">' +
        CONFIG.title +
        '</h2>' +
        '<p class="azul-banner-description">' +
        CONFIG.description +
        '</p>' +
        '<div class="azul-banner-loading">' +
        '<div class="azul-progress-bar">' +
        '<div class="azul-progress-fill"></div>' +
        '</div>' +
        '<p class="azul-loading-text">' +
        CONFIG.loadingMessages[0] +
        '</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<!-- Versão Mobile -->' +
        '<div class="azul-banner-mobile">' +
        '<div class="azul-banner-mobile-image">' +
        '<img src="' +
        CONFIG.hotelImage +
        '" alt="Resort tropical com piscina" />' +
        '</div>' +
        '<div class="azul-banner-mobile-content">' +
        '<div class="azul-banner-background-icon">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">' +
        '<g opacity="0.08">' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M83.3609 31.8799C87.8023 27.4385 93.795 25 100 25C106.205 25 112.198 27.4385 116.639 31.8799L123.375 38.6163C123.846 39.0869 124.413 39.4673 124.957 39.691C125.577 39.9464 126.252 40.0797 126.822 40.0797H136.401C142.675 40.0797 148.604 42.5227 153.04 46.9596L153.063 46.9825C157.401 51.3941 159.92 57.3661 159.92 63.5987V73.178C159.92 73.7682 160.037 74.3549 160.275 74.9591C160.634 75.7045 161.007 76.2481 161.384 76.6245L168.12 83.3609C172.561 87.8023 175 93.795 175 100C175 106.233 172.481 112.204 168.143 116.616L168.12 116.639L161.384 123.375C160.913 123.846 160.533 124.413 160.309 124.957C160.048 125.591 159.92 126.204 159.92 126.822V136.401C159.92 142.675 157.477 148.604 153.04 153.04L153.017 153.063C148.606 157.401 142.634 159.92 136.401 159.92H126.822C126.252 159.92 125.577 160.054 124.957 160.309C124.413 160.533 123.846 160.913 123.375 161.384L116.662 168.097C114.538 170.29 111.943 171.977 109.26 173.137L109.106 173.204L108.881 173.279C106.039 174.426 103.05 175 100 175C96.9505 175 93.9613 174.426 91.1191 173.279L90.8937 173.204L90.7403 173.137C88.0071 171.955 85.4987 170.258 83.3609 168.12L76.6245 161.384C76.1539 160.913 75.5866 160.533 75.0433 160.309C74.4232 160.054 73.7475 159.92 73.178 159.92H63.5987C57.3254 159.92 51.3964 157.477 46.9596 153.04L46.9366 153.017C42.5985 148.606 40.0797 142.634 40.0797 136.401V126.822C40.0797 126.204 39.9521 125.591 39.691 124.957C39.4673 124.413 39.0869 123.846 38.6163 123.375L31.8799 116.639C27.4385 112.198 25 106.205 25 100C25 93.7674 27.519 87.7956 31.857 83.384L31.8798 83.3608L38.6163 76.6245C39.0869 76.1539 39.4673 75.5866 39.691 75.0433C39.9521 74.4093 40.0797 73.7956 40.0797 73.178V63.5987C40.0797 57.3444 42.5105 51.3343 46.9826 46.9367C51.3942 42.5986 57.3661 40.0797 63.5987 40.0797H73.178C73.7475 40.0797 74.4232 39.9464 75.0433 39.691C75.5866 39.4673 76.1539 39.0869 76.6245 38.6163L83.3609 31.8799ZM100 32.732C95.8223 32.732 91.8031 34.3723 88.8282 37.3472L82.0918 44.0836C80.9555 45.2199 79.5452 46.1991 77.9872 46.8406C76.5061 47.4505 74.8333 47.8116 73.178 47.8116H63.5987C59.4485 47.8116 55.4085 49.4952 52.4038 52.4498C49.4597 55.3448 47.8116 59.3466 47.8116 63.5987V73.178C47.8116 74.9088 47.4448 76.5199 46.8406 77.9872C46.1991 79.5452 45.2199 80.9555 44.0836 82.0918L37.3594 88.8161C34.4115 91.8196 32.732 95.8549 32.732 100C32.732 104.178 34.3723 108.197 37.3472 111.172L44.0836 117.908C45.2199 119.044 46.1991 120.455 46.8406 122.013C47.4448 123.48 47.8116 125.091 47.8116 126.822V136.401C47.8116 140.546 49.4909 144.581 52.4385 147.585C55.4166 150.557 59.3711 152.188 63.5987 152.188H73.178C74.8333 152.188 76.5061 152.55 77.9872 153.159C79.5452 153.801 80.9555 154.78 82.0918 155.916L88.8282 162.653C90.2369 164.061 91.8802 165.184 93.6644 165.977L93.8067 166.025L93.9275 166.074C95.8683 166.87 97.9034 167.268 100 167.268C102.097 167.268 104.132 166.87 106.072 166.074L106.193 166.025L106.336 165.977C108.159 165.168 109.827 164.045 111.124 162.701L111.171 162.652L117.908 155.916C119.044 154.78 120.455 153.801 122.013 153.159C123.494 152.55 125.167 152.188 126.822 152.188H136.401C140.546 152.188 144.581 150.509 147.585 147.561C150.557 144.583 152.188 140.629 152.188 136.401V126.822C152.188 125.091 152.555 123.48 153.159 122.013C153.801 120.455 154.78 119.044 155.916 117.908L162.63 111.195L162.641 111.184C165.589 108.18 167.268 104.145 167.268 100C167.268 95.8223 165.628 91.8031 162.653 88.8282L155.916 82.0918C154.701 80.8764 153.852 79.4709 153.236 78.1614L153.196 78.0753L153.159 77.9872C152.555 76.5199 152.188 74.9088 152.188 73.178V63.5987C152.188 59.4538 150.509 55.4188 147.562 52.4153C144.583 49.4433 140.629 47.8116 136.401 47.8116H126.822C125.167 47.8116 123.494 47.4505 122.013 46.8406C120.455 46.1991 119.044 45.2199 117.908 44.0836L111.172 37.3472C108.197 34.3723 104.178 32.732 100 32.732Z" fill="#595959"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M127.25 119C127.25 123.5 123.625 127.125 119.125 127.125C114.625 127.125 110.938 123.5 110.938 119C110.938 114.5 114.562 110.875 119.125 110.875C123.562 110.875 127.25 114.5 127.25 119Z" fill="#595959"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M83.1875 91.25C87.6875 91.25 91.3125 87.625 91.3125 83.125C91.3125 78.625 87.6875 75 83.1875 75C78.6875 75 75 78.625 75 83.125C75 87.625 78.6875 91.25 83.1875 91.25Z" fill="#595959"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M80.75 123C81.625 123.625 82.6875 123.938 83.75 123.938C84.4375 123.938 85.1875 123.812 85.8125 123.5C86.5 123.25 87.0625 122.812 87.5625 122.312L122.25 87.625C122.75 87.125 123.188 86.5 123.5 85.875C123.812 85.1875 123.938 84.5 123.938 83.75C123.938 83 123.812 82.3125 123.5 81.625C123.25 80.9375 122.812 80.375 122.312 79.8125C121.812 79.3125 121.187 78.875 120.5 78.625C119.812 78.375 119.125 78.1875 118.375 78.25C117.625 78.25 116.937 78.375 116.25 78.6875C115.562 79 115 79.375 114.5 79.9375L79.8125 114.625C79.0625 115.375 78.5625 116.375 78.3125 117.437C78.125 118.5 78.1875 119.562 78.625 120.562C79.125 121.562 79.8125 122.375 80.75 123Z" fill="#595959"/>' +
        '</g>' +
        '</svg>' +
        '</div>' +
        '<h2 class="azul-banner-title">' +
        CONFIG.title +
        '</h2>' +
        '<p class="azul-banner-description">' +
        CONFIG.description +
        '</p>' +
        '<div class="azul-banner-loading">' +
        '<div class="azul-progress-bar">' +
        '<div class="azul-progress-fill"></div>' +
        '</div>' +
        '<p class="azul-loading-text">' +
        CONFIG.loadingMessages[0] +
        '</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      document.body.insertAdjacentHTML('beforeend', bannerHTML);
      this.addStyles();

      // Marca que uma instância do banner foi criada
      this.bannerInstance = true;
    }

    addStyles() {
      const styleId = 'azul-banner-styles';
      if (document.getElementById(styleId)) return;

      const styles =
        '<style id="' +
        styleId +
        '">' +
        '/* Overlay principal */' +
        '.azul-banner-overlay {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: rgba(0, 0, 0, 0.7);' +
        'z-index: 10000;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'opacity: 0;' +
        'visibility: hidden;' +
        'transition: all 0.3s ease;' +
        'backdrop-filter: blur(2px);' +
        '}' +
        '.azul-banner-overlay.show {' +
        'opacity: 1;' +
        'visibility: visible;' +
        '}' +
        '/* Modal container */' +
        '.azul-banner-modal {' +
        'background: white;' +
        'border-radius: 20px;' +
        'box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);' +
        'max-width: 850px;' +
        'width: 90vw;' +
        'max-height: 90vh;' +
        'position: relative;' +
        'overflow: hidden;' +
        'animation: azulSlideIn 0.4s ease-out;' +
        '}' +
        '@keyframes azulSlideIn {' +
        'from {' +
        'transform: translateY(30px) scale(0.95);' +
        'opacity: 0;' +
        '}' +
        'to {' +
        'transform: translateY(0) scale(1);' +
        'opacity: 1;' +
        '}' +
        '}' +
        '/* Versão Desktop */' +
        '.azul-banner-desktop {' +
        'display: flex;' +
        'height: 300px;' +
        '}' +
        '.azul-banner-image {' +
        'flex: 0 0 46%;' +
        'position: relative;' +
        'overflow: hidden;' +
        'border-radius: 20px 0 0 20px;' +
        '}' +
        '.azul-banner-image img {' +
        'width: 100%;' +
        'height: 100%;' +
        'object-fit: cover;' +
        '}' +
        '.azul-banner-overlay-gradient {' +
        'position: absolute;' +
        'top: 0;' +
        'left: 0;' +
        'right: 0;' +
        'bottom: 0;' +
        'background: linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 102, 204, 0.2) 100%);' +
        '}' +
        '.azul-banner-content {' +
        'flex: 0 0 54%;' +
        'padding: 30px 25px;' +
        'display: flex;' +
        'flex-direction: column;' +
        'justify-content: center;' +
        'background: white;' +
        'position: relative;' +
        'border-radius: 0 20px 20px 0;' +
        '}' +
        '.azul-banner-background-icon {' +
        'position: absolute;' +
        'top: 50%;' +
        'right: -15%;' +
        'transform: translateY(-50%);' +
        'z-index: 3;' +
        'pointer-events: none;' +
        '}' +
        '.azul-banner-background-icon svg {' +
        'width: 250px;' +
        'height: 250px;' +
        '}' +
        '/* Versão Mobile */' +
        '.azul-banner-mobile {' +
        'display: none;' +
        'flex-direction: column;' +
        'min-width: 320px;' +
        'max-width: 400px;' +
        'overflow: hidden;' +
        '}' +
        '.azul-banner-mobile-image {' +
        'height: 250px;' +
        'overflow: hidden;' +
        'position: relative;' +
        '}' +
        '.azul-banner-mobile-image img {' +
        'width: 100%;' +
        'height: 100%;' +
        'object-fit: cover;' +
        '}' +
        '.azul-banner-mobile-content {' +
        'padding: 35px 30px;' +
        'background: white;' +
        'position: relative;' +
        '}' +
        '.azul-banner-mobile-content .azul-banner-background-icon {' +
        'position: absolute;' +
        'top: 50%;' +
        'right: -10%;' +
        'transform: translateY(-50%);' +
        'z-index: 3;' +
        'pointer-events: none;' +
        '}' +
        '.azul-banner-mobile-content .azul-banner-background-icon svg {' +
        'width: 180px;' +
        'height: 180px;' +
        '}' +
        '/* Título */' +
        '.azul-banner-title {' +
        'font-size: 32px;' +
        'font-weight: 400;' +
        'color: ' +
        CONFIG.brandColors.primary +
        ';' +
        'margin: 0;' +
        'margin-bottom: 25px;' +
        'line-height: 1.2;' +
        'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;' +
        'letter-spacing: -0.5px;' +
        'position: relative;' +
        'z-index: 4;' +
        '}' +
        '/* Descrição */' +
        '.azul-banner-description {' +
        'font-size: 14px;' +
        'color: ' +
        CONFIG.brandColors.text +
        ';' +
        'margin: 0 0 20px 0;' +
        'line-height: 1.3;' +
        'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;' +
        'font-weight: 400;' +
        'position: relative;' +
        'z-index: 4;' +
        '}' +
        '.azul-banner-description strong {' +
        'font-weight: 700;' +
        '}' +
        '/* Loading */' +
        '.azul-banner-loading {' +
        'margin-top: auto;' +
        'position: relative;' +
        'z-index: 4;' +
        '}' +
        '.azul-progress-bar {' +
        'width: 100%;' +
        'height: 8px;' +
        'background: #F0F0F0;' +
        'border-radius: 4px;' +
        'overflow: hidden;' +
        'margin-bottom: 12px;' +
        'box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);' +
        '}' +
        '.azul-progress-fill {' +
        'height: 100%;' +
        'background: linear-gradient(90deg, ' +
        CONFIG.brandColors.primary +
        ' 0%, #4A90E2 100%);' +
        'border-radius: 3px;' +
        'width: 0%;' +
        'transition: width 0.3s ease;' +
        'animation: azulProgressPulse 2s ease-in-out infinite;' +
        'box-shadow: 0 1px 3px rgba(0, 102, 204, 0.3);' +
        '}' +
        '@keyframes azulProgressPulse {' +
        '0%, 100% { opacity: 1; }' +
        '50% { opacity: 0.8; }' +
        '}' +
        '.azul-loading-text {' +
        'font-size: 14px;' +
        'color: ' +
        CONFIG.brandColors.primary +
        ';' +
        'margin: 0;' +
        'font-weight: 400;' +
        'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;' +
        'letter-spacing: 0.2px;' +
        '}' +
        '/* Responsividade */' +
        '@media (max-width: 768px) {' +
        '.azul-banner-desktop {' +
        'display: none;' +
        '}' +
        '.azul-banner-mobile {' +
        'display: flex;' +
        '}' +
        '.azul-banner-modal {' +
        'margin: 20px;' +
        'max-width: 350px;' +
        'width: calc(100vw - 40px);' +
        '}' +
        '.azul-banner-title {' +
        'font-size: 28px;' +
        'margin-bottom: 16px;' +
        '}' +
        '.azul-banner-description {' +
        'font-size: 12px;' +
        'margin-bottom: 30px;' +
        'line-height: 1.5;' +
        '}' +
        '.azul-loading-text {' +
        'font-size: 12px;' +
        '}' +
        '}' +
        '@media (max-width: 480px) {' +
        '.azul-banner-modal {' +
        'margin: 15px;' +
        'max-width: calc(100vw - 30px);' +
        'width: calc(100vw - 30px);' +
        'border-radius: 16px;' +
        '}' +
        '.azul-banner-mobile-content {' +
        'padding: 30px 25px;' +
        '}' +
        '.azul-banner-mobile-image {' +
        'height: 220px;' +
        '}' +
        '.azul-banner-title {' +
        'font-size: 24px;' +
        '}' +
        '.azul-banner-description {' +
        'font-size: 12px;' +
        'margin-bottom: 25px;' +
        '}' +
        '}' +
        '</style>';

      document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
      const banner = document.getElementById('azul-loading-banner');
      if (!banner) return;

      // Fechar ao clicar no overlay
      banner.addEventListener('click', (e) => {
        if (e.target === banner) {
          this.hideBanner();
        }
      });

      // Fechar com ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.hideBanner();
        }
      });
    }

    startLoadingSequence() {
      // Aguarda um pouco antes de mostrar
      setTimeout(() => {
        this.showBanner();
        this.startProgressAnimation();
        // Não agenda auto-hide - será controlado pelo monitoramento do loader
      }, CONFIG.showDelay);
    }

    startLoaderMonitoring() {
      if (this.loaderMonitorInterval) {
        return;
      }

      this.loaderMonitorInterval = setInterval(() => {
        if (!this.originalLoader || !document.contains(this.originalLoader)) {
          clearInterval(this.loaderMonitorInterval);
          this.loaderMonitorInterval = null;
          this.startSmartDebounce();
        }
      }, 100);
    }

    startSmartDebounce() {
      if (this.hideDebounceTimeout) {
        clearTimeout(this.hideDebounceTimeout);
      }

      this.hideDebounceTimeout = setTimeout(() => {
        const anyLoader = document.querySelector('.loader');
        if (anyLoader) {
          this.startLoaderMonitoring();
        } else {
          this.hideBanner();
        }
      }, 200);
    }

    showBanner() {
      const banner = document.getElementById('azul-loading-banner');
      if (banner) {
        banner.classList.add('show');
        this.isVisible = true;

        // Analytics/Tracking
        this.trackBannerEvent('show');
      }
    }

    hideBanner() {
      // Evita múltiplas execuções
      if (!this.isVisible) {
        return;
      }

      const banner = document.getElementById('azul-loading-banner');
      if (banner) {
        banner.classList.remove('show');
        this.isVisible = false;

        // Cleanup
        this.clearTimeouts();
        this.clearLoaderMonitoring();

        // Analytics/Tracking
        this.trackBannerEvent('hide');

        // Remove o banner após a animação
        setTimeout(() => {
          if (banner && banner.parentNode) {
            banner.parentNode.removeChild(banner);
          }

          // Limpa referência ao loader original
          this.originalLoader = null;

          // Limpa flag de instância única
          this.bannerInstance = null;
        }, 300);
      }
    }

    restoreOriginalLoader() {
      if (this.originalLoader) {
        this.originalLoader.style.display = '';
        this.originalLoader = null;
      }
    }

    startProgressAnimation() {
      // Seleciona os elementos da versão visível (desktop ou mobile)
      const isMobile = window.innerWidth <= 768;
      const containerSelector = isMobile ? '.azul-banner-mobile' : '.azul-banner-desktop';
      const container = document.querySelector(containerSelector);

      if (!container) return;

      const progressFill = container.querySelector('.azul-progress-fill');
      const loadingText = container.querySelector('.azul-loading-text');

      if (!progressFill || !loadingText) return;

      let progress = 0;
      const startTime = Date.now();
      const minDuration = 2000; // Duração mínima de 2 segundos
      const maxDuration = 8000; // Duração máxima de 8 segundos

      // Calcula incremento baseado na duração mínima
      const increment = 100 / (minDuration / 100);

      this.progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // Se passou do tempo mínimo, verifica se deve acelerar
        if (elapsed >= minDuration) {
          // Verifica se o loader ainda existe
          const anyLoader = document.querySelector('.loader');
          if (!anyLoader) {
            // Loader foi removido - acelera para 100%
            progress = Math.min(progress + 5, 100); // Incremento maior
          } else {
            // Loader ainda existe - continua normalmente
            progress += increment;
          }
        } else {
          // Ainda no tempo mínimo - progresso normal
          progress += increment;
        }

        // Limita o progresso a 100%
        if (progress >= 100) {
          progress = 100;
          clearInterval(this.progressInterval);
        }

        // Atualiza a barra de progresso
        progressFill.style.width = progress + '%';

        // Atualiza a mensagem baseada no progresso
        this.updateLoadingMessage(progress, loadingText);
      }, 100);
    }

    updateLoadingMessage(progress, loadingTextElement) {
      let message = CONFIG.loadingMessages[0]; // Mensagem padrão

      if (progress >= 75) {
        message = CONFIG.loadingMessages[75];
      } else if (progress >= 50) {
        message = CONFIG.loadingMessages[50];
      } else {
        message = CONFIG.loadingMessages[0];
      }

      if (loadingTextElement.textContent !== message) {
        loadingTextElement.textContent = message;
      }
    }

    clearTimeouts() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }

      if (this.hideDebounceTimeout) {
        clearTimeout(this.hideDebounceTimeout);
        this.hideDebounceTimeout = null;
      }
    }

    clearLoaderMonitoring() {
      if (this.loaderMonitorInterval) {
        clearInterval(this.loaderMonitorInterval);
        this.loaderMonitorInterval = null;
      }
    }

    destroy() {
      // Limpa timeouts e monitoramento
      this.clearTimeouts();
      this.clearLoaderMonitoring();

      // Para o observador
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      // Limpa referência ao loader original
      this.originalLoader = null;

      // Remove o banner se estiver visível
      const banner = document.getElementById('azul-loading-banner');
      if (banner) {
        banner.remove();
      }

      this.isVisible = false;
    }

    trackBannerEvent(action) {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'azul_banner_' + action, {
          event_category: 'promotional_banner',
          event_label: 'loading_page',
          value: 1,
        });
      }
    }
  }

  // Inicialização
  function initAzulBanner() {
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new AzulLoadingBanner();
      });
    } else {
      new AzulLoadingBanner();
    }
  }

  // Inicializa quando o script é carregado
  initAzulBanner();

  // Exporta para uso global se necessário
  window.AzulLoadingBanner = AzulLoadingBanner;
})();
