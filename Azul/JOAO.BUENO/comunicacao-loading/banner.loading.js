/**
 * Azul Loading Banner Modal
 * Modal promocional exibido durante o loading da página de tarifas
 * Versões: Desktop e Mobile responsivo
 */

(function () {
  "use strict";

  // Configurações do modal
  const CONFIG = {
    urlTarget: "/selecao-voo",
    showDelay: 0, // Exibir imediatamente após injeção
    hideDelay: 8000, // Tempo para esconder o modal automaticamente (8 segundos)
    loadingMessages: {
      0: "Estamos iniciando sua reserva...",
      50: "Quase lá... Estamos assegurando sua passagem.",
      75: "Pronto para decolar! Estamos finalizando a etapa com segurança.",
    },
    title: "A um passo da viagem dos sonhos.",
    description:
      "Sua experiência Azul fica ainda melhor. Ao comprar sua passagem, você ganha <strong>15% OFF</strong> em <strong>hotéis</strong> para escolher sua hospedagem com calma, quando quiser.",
    hotelImageDesktop: "https://i.imgur.com/MyN94BQ.png", // Imagem desktop
    hotelImageMobile: "https://i.imgur.com/GAoQdi9.png", // Imagem mobile
    brandColors: {
      primary: "#0066CC",
      secondary: "#F0F8FF",
      text: "#333333",
      lightGray: "#F5F5F5",
    },
  };

  class AzulLoadingBanner {
    constructor() {
      this.isVisible = false;
      this.progressInterval = null;
      this.hideTimeout = null;
      this.init();
    }

    init() {
      // Exibir banner imediatamente (removido seletor de URL temporariamente)
      this.createBannerHTML();
      this.setupEventListeners();
      this.startLoadingSequence();
    }

    shouldShowBanner() {
      // Temporariamente removido - sempre retorna true
      return true;
    }

    createBannerHTML() {
      // Remove banner existente se houver
      const existingBanner = document.getElementById("azul-loading-banner");
      if (existingBanner) {
        existingBanner.remove();
      }

      const bannerHTML =
        '<div id="azul-loading-banner" class="azul-banner-overlay">' +
        '<div class="azul-banner-modal">' +
        '<button class="azul-banner-close" aria-label="Fechar">&times;</button>' +
        "<!-- Versão Desktop -->" +
        '<div class="azul-banner-desktop">' +
        '<div class="azul-banner-image">' +
        '<img src="' +
        CONFIG.hotelImageDesktop +
        '" alt="Resort tropical com piscina" />' +
        '<div class="azul-banner-overlay-gradient"></div>' +
        "</div>" +
        '<div class="azul-banner-content">' +
        '<h2 class="azul-banner-title">' +
        CONFIG.title +
        "</h2>" +
        '<p class="azul-banner-description">' +
        CONFIG.description +
        "</p>" +
        '<div class="azul-banner-loading">' +
        '<div class="azul-progress-bar">' +
        '<div class="azul-progress-fill"></div>' +
        "</div>" +
        '<p class="azul-loading-text">' +
        CONFIG.loadingMessages[0] +
        "</p>" +
        "</div>" +
        "<!-- Ícones decorativos -->" +
        '<div class="azul-decorative-icons">' +
        '<span class="azul-icon-plane">✈</span>' +
        '<span class="azul-icon-luggage">🧳</span>' +
        '<span class="azul-icon-hotel">🏨</span>' +
        "</div>" +
        "</div>" +
        "</div>" +
        "<!-- Versão Mobile -->" +
        '<div class="azul-banner-mobile">' +
        '<div class="azul-banner-mobile-image">' +
        '<img src="' +
        CONFIG.hotelImageMobile +
        '" alt="Resort tropical com piscina" />' +
        "</div>" +
        '<div class="azul-banner-mobile-content">' +
        '<h2 class="azul-banner-title">' +
        CONFIG.title +
        "</h2>" +
        '<p class="azul-banner-description">' +
        CONFIG.description +
        "</p>" +
        '<div class="azul-banner-loading">' +
        '<div class="azul-progress-bar">' +
        '<div class="azul-progress-fill"></div>' +
        "</div>" +
        '<p class="azul-loading-text">' +
        CONFIG.loadingMessages[0] +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";

      document.body.insertAdjacentHTML("beforeend", bannerHTML);
      this.addStyles();
    }

    addStyles() {
      const styleId = "azul-banner-styles";
      if (document.getElementById(styleId)) return;

      const styles =
        '<style id="' +
        styleId +
        '">' +
        "/* Overlay principal */" +
        ".azul-banner-overlay {" +
        "position: fixed;" +
        "top: 0;" +
        "left: 0;" +
        "width: 100%;" +
        "height: 100%;" +
        "background: rgba(0, 0, 0, 0.7);" +
        "z-index: 10000;" +
        "display: flex;" +
        "align-items: center;" +
        "justify-content: center;" +
        "opacity: 0;" +
        "visibility: hidden;" +
        "transition: all 0.3s ease;" +
        "backdrop-filter: blur(2px);" +
        "}" +
        ".azul-banner-overlay.show {" +
        "opacity: 1;" +
        "visibility: visible;" +
        "}" +
        "/* Modal container */" +
        ".azul-banner-modal {" +
        "background: white;" +
        "border-radius: 16px;" +
        "box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);" +
        "max-width: 90vw;" +
        "max-height: 90vh;" +
        "position: relative;" +
        "overflow: hidden;" +
        "animation: azulSlideIn 0.4s ease-out;" +
        "}" +
        "@keyframes azulSlideIn {" +
        "from {" +
        "transform: translateY(30px) scale(0.95);" +
        "opacity: 0;" +
        "}" +
        "to {" +
        "transform: translateY(0) scale(1);" +
        "opacity: 1;" +
        "}" +
        "}" +
        "/* Botão de fechar */" +
        ".azul-banner-close {" +
        "position: absolute;" +
        "top: 15px;" +
        "right: 15px;" +
        "background: rgba(255, 255, 255, 0.9);" +
        "border: none;" +
        "border-radius: 50%;" +
        "width: 32px;" +
        "height: 32px;" +
        "font-size: 18px;" +
        "color: #666;" +
        "cursor: pointer;" +
        "z-index: 10001;" +
        "display: flex;" +
        "align-items: center;" +
        "justify-content: center;" +
        "transition: all 0.2s ease;" +
        "}" +
        ".azul-banner-close:hover {" +
        "background: white;" +
        "color: #333;" +
        "transform: scale(1.1);" +
        "}" +
        "/* Versão Desktop */" +
        ".azul-banner-desktop {" +
        "display: flex;" +
        "min-width: 600px;" +
        "min-height: 400px;" +
        "}" +
        ".azul-banner-image {" +
        "flex: 1;" +
        "position: relative;" +
        "overflow: hidden;" +
        "}" +
        ".azul-banner-image img {" +
        "width: 100%;" +
        "height: 100%;" +
        "object-fit: cover;" +
        "}" +
        ".azul-banner-overlay-gradient {" +
        "position: absolute;" +
        "top: 0;" +
        "left: 0;" +
        "right: 0;" +
        "bottom: 0;" +
        "background: linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 102, 204, 0.3) 100%);" +
        "}" +
        ".azul-banner-content {" +
        "flex: 1;" +
        "padding: 40px;" +
        "display: flex;" +
        "flex-direction: column;" +
        "justify-content: center;" +
        "background: white;" +
        "position: relative;" +
        "}" +
        "/* Versão Mobile */" +
        ".azul-banner-mobile {" +
        "display: none;" +
        "flex-direction: column;" +
        "min-width: 320px;" +
        "max-width: 400px;" +
        "}" +
        ".azul-banner-mobile-image {" +
        "height: 200px;" +
        "overflow: hidden;" +
        "}" +
        ".azul-banner-mobile-image img {" +
        "width: 100%;" +
        "height: 100%;" +
        "object-fit: cover;" +
        "}" +
        ".azul-banner-mobile-content {" +
        "padding: 30px 25px;" +
        "background: white;" +
        "}" +
        "/* Título */" +
        ".azul-banner-title {" +
        "font-size: 24px;" +
        "font-weight: 700;" +
        "color: " +
        CONFIG.brandColors.primary +
        ";" +
        "margin: 0 0 16px 0;" +
        "line-height: 1.2;" +
        'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;' +
        "}" +
        "/* Descrição */" +
        ".azul-banner-description {" +
        "font-size: 16px;" +
        "color: " +
        CONFIG.brandColors.text +
        ";" +
        "margin: 0 0 30px 0;" +
        "line-height: 1.5;" +
        'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;' +
        "}" +
        ".azul-banner-description strong {" +
        "color: " +
        CONFIG.brandColors.primary +
        ";" +
        "font-weight: 600;" +
        "}" +
        "/* Loading */" +
        ".azul-banner-loading {" +
        "margin-top: auto;" +
        "}" +
        ".azul-progress-bar {" +
        "width: 100%;" +
        "height: 4px;" +
        "background: #E0E0E0;" +
        "border-radius: 2px;" +
        "overflow: hidden;" +
        "margin-bottom: 12px;" +
        "}" +
        ".azul-progress-fill {" +
        "height: 100%;" +
        "background: linear-gradient(90deg, " +
        CONFIG.brandColors.primary +
        " 0%, #4A90E2 100%);" +
        "border-radius: 2px;" +
        "width: 0%;" +
        "transition: width 0.3s ease;" +
        "animation: azulProgressPulse 2s ease-in-out infinite;" +
        "}" +
        "@keyframes azulProgressPulse {" +
        "0%, 100% { opacity: 1; }" +
        "50% { opacity: 0.7; }" +
        "}" +
        ".azul-loading-text {" +
        "font-size: 14px;" +
        "color: " +
        CONFIG.brandColors.primary +
        ";" +
        "margin: 0;" +
        "font-weight: 500;" +
        'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;' +
        "}" +
        "/* Ícones decorativos (desktop) */" +
        ".azul-decorative-icons {" +
        "position: absolute;" +
        "bottom: 20px;" +
        "right: 20px;" +
        "display: flex;" +
        "gap: 8px;" +
        "opacity: 0.1;" +
        "}" +
        ".azul-decorative-icons span {" +
        "font-size: 20px;" +
        "color: " +
        CONFIG.brandColors.primary +
        ";" +
        "}" +
        "/* Responsividade */" +
        "@media (max-width: 768px) {" +
        ".azul-banner-desktop {" +
        "display: none;" +
        "}" +
        ".azul-banner-mobile {" +
        "display: flex;" +
        "}" +
        ".azul-banner-modal {" +
        "margin: 20px;" +
        "max-width: calc(100vw - 40px);" +
        "}" +
        ".azul-banner-title {" +
        "font-size: 20px;" +
        "}" +
        ".azul-banner-description {" +
        "font-size: 14px;" +
        "margin-bottom: 25px;" +
        "}" +
        "}" +
        "@media (max-width: 480px) {" +
        ".azul-banner-modal {" +
        "margin: 15px;" +
        "max-width: calc(100vw - 30px);" +
        "border-radius: 12px;" +
        "}" +
        ".azul-banner-mobile-content {" +
        "padding: 25px 20px;" +
        "}" +
        ".azul-banner-title {" +
        "font-size: 18px;" +
        "}" +
        "}" +
        "</style>";

      document.head.insertAdjacentHTML("beforeend", styles);
    }

    setupEventListeners() {
      const banner = document.getElementById("azul-loading-banner");
      if (!banner) return;

      // Botão de fechar
      const closeBtn = banner.querySelector(".azul-banner-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.hideBanner());
      }

      // Fechar ao clicar no overlay
      banner.addEventListener("click", (e) => {
        if (e.target === banner) {
          this.hideBanner();
        }
      });

      // Fechar com ESC
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.hideBanner();
        }
      });
    }

    startLoadingSequence() {
      // Aguarda um pouco antes de mostrar
      setTimeout(() => {
        this.showBanner();
        this.startProgressAnimation();
        this.scheduleAutoHide();
      }, CONFIG.showDelay);
    }

    showBanner() {
      const banner = document.getElementById("azul-loading-banner");
      if (banner) {
        banner.classList.add("show");
        this.isVisible = true;

        // Analytics/Tracking
        this.trackBannerEvent("show");
      }
    }

    hideBanner() {
      const banner = document.getElementById("azul-loading-banner");
      if (banner) {
        banner.classList.remove("show");
        this.isVisible = false;

        // Cleanup
        this.clearTimeouts();

        // Analytics/Tracking
        this.trackBannerEvent("hide");

        // Remove o banner após a animação
        setTimeout(() => {
          if (banner && banner.parentNode) {
            banner.parentNode.removeChild(banner);
          }
        }, 300);
      }
    }

    startProgressAnimation() {
      const progressFill = document.querySelector(".azul-progress-fill");
      const loadingText = document.querySelector(".azul-loading-text");
      if (!progressFill || !loadingText) return;

      let progress = 0;
      const duration = CONFIG.hideDelay - CONFIG.showDelay - 1000; // 1 segundo antes do hide
      const increment = 100 / (duration / 100);

      this.progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
          progress = 100;
          clearInterval(this.progressInterval);
        }

        // Atualiza a barra de progresso
        progressFill.style.width = progress + "%";

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

    scheduleAutoHide() {
      this.hideTimeout = setTimeout(() => {
        this.hideBanner();
      }, CONFIG.hideDelay);
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
    }

    trackBannerEvent(action) {
      // Implementar tracking/analytics conforme necessário
      console.log(`Azul Banner ${action}:`, {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Exemplo de integração com Google Analytics
      if (typeof gtag !== "undefined") {
        gtag("event", "azul_banner_" + action, {
          event_category: "promotional_banner",
          event_label: "loading_page",
          value: 1,
        });
      }
    }
  }

  // Inicialização
  function initAzulBanner() {
    // Aguarda o DOM estar pronto
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
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
