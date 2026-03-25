(function () {
  "use strict";

  if (window.ofertaTheWeeknd) {
    return;
  }
  window.ofertaTheWeeknd = true;

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: label,
    });
  }
  gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "XT",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });

  // Configuração principal do componente
  const NespressoBanner = {
    // Configurações padrão
    defaultConfig: {
      targetSelector: "div[id*='Shopping-Bag-Top-Banner']",
      insertPosition: "after",
      autoInit: true,
      maxRetries: 10,
      retryInterval: 500,
      imageUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/48350234542110/Samra-machine-desktop.jpg",
      ctaUrl: "https://euqueronestle.com.br/promo/promocaonespresso",
      texts: {
        title:
          "Os produtos desse pedido dão a você a chance de concorrer a<br> UM <strong>PAR DE INGRESSOS PARA A TOUR THE WEEKND*</strong>",
        description: "Após concluir a compra, cadastre-se e participe.",
        ctaLabel: "CADASTRE-SE AQUI",
      },
    },

    // Função para aguardar elemento aparecer com tentativas
    waitForElement: function (selector, maxRetries, interval) {
      maxRetries = maxRetries || 10;
      interval = interval || 500;
      return new Promise((resolve, reject) => {
        var attempts = 0;

        var checkElement = function () {
          var element = document.querySelector(selector);

          if (element) {
            resolve(element);
            return;
          }

          attempts++;

          if (attempts >= maxRetries) {
            reject(new Error("Elemento nao encontrado"));
            return;
          }

          setTimeout(checkElement, interval);
        };

        checkElement();
      });
    },

    // CSS do componente
    getStyles: function () {
      return (
        '<style id="nespresso-weeknd-styles">' +
        ".nespresso-weeknd-banner {" +
        "  font-family: 'NespressoLucas', Helvetica, Arial, sans-serif;" +
        "  background-color: #1a1a1a;" +
        "  color: #fff;" +
        "  padding: 0px;" +
        "  position: relative;" +
        "  overflow: hidden;" +
        "  border-radius: 0px;" +
        "  margin: 0px 0;" +
        "  animation: weekndSlideDown 0.5s ease-out;" +
        "}" +
        ".nespresso-weeknd-container {" +
        "  max-width: 1200px;" +
        "  margin: 0 auto;" +
        "  display: flex;" +
        "  align-items: center;" +
        "}" +
        ".nespresso-weeknd-image {" +
        "  flex-shrink: 0;" +
        "  width: 160px;" +
        "  height: 100%;" +
        "  overflow: hidden;" +
        "}" +
        ".nespresso-weeknd-image img {" +
        "  width: 100%;" +
        "  height: 100%;" +
        "  object-fit: cover;" +
        "  display: block;" +
        "}" +
        ".nespresso-weeknd-content {" +
        "  flex: 1;" +
        "  display: flex;" +
        "  flex-direction: column;" +
        "  justify-content: center;" +
        "  padding: 24px 30px;" +
        "  gap: 6px;" +
        "}" +
        ".nespresso-weeknd-terms{" +
        "    align-self: end;" +
        "    justify-self:end;" +
        "    color: #ccc;" +
        "}" +
        ".nespresso-weeknd-title {" +
        "  font-size: 20px;" +
        "  font-weight: 400;" +
        "  line-height: 1.3;" +
        "  margin: 0;" +
        "  color: #fff;" +
        "  letter-spacing: 0.5px;" +
        "}" +
        ".nespresso-weeknd-description {" +
        "  font-size: 14px;" +
        "  font-weight: 400;" +
        "  line-height: 1.5;" +
        "  margin: 0;" +
        "  color: #ccc;" +
        "}" +
        ".nespresso-weeknd-cta {" +
        "  display: inline-block;" +
        "  background-color: #fff;" +
        "  color: #1a1a1a;" +
        "  padding: 12px 28px;" +
        "  border-radius: 30px;" +
        "  font-size: 14px;" +
        "  font-weight: 700;" +
        "  text-decoration: none;" +
        "  text-transform: uppercase;" +
        "  letter-spacing: 1px;" +
        "  transition: all 0.3s ease;" +
        "  align-self: flex-start;" +
        "  cursor: pointer;" +
        "  border: 2px solid #fff;" +
        "}" +
        ".nespresso-weeknd-cta:hover {" +
        "  background-color: transparent;" +
        "  color: #fff;" +
        "  transform: translateY(-2px);" +
        "  box-shadow: 0 4px 12px rgba(255,255,255,0.2);" +
        "}" +
        ".nespresso-weeknd-cta:active {" +
        "  transform: translateY(0);" +
        "}" +
        "@media (max-width: 768px) {" +
        ".nespresso-weeknd-banner {" +
        "    padding-left:5px;" +
        "  }" +
        ".nespresso-weeknd-description {" +
        "    font-size: 12px;" +
        "  }" +
        "  .nespresso-weeknd-image {" +
        "    width: 115px;" +
        "    height: auto;" +
        "  }" +
        ".nespresso-weeknd-image img{" +
        "    border-radius: 6px;" +
        "  }" +
        "  .nespresso-weeknd-content {" +
        "    padding: 20px 16px;" +
        "    align-items: center;" +
        "    text-align: center;" +
        "  }" +
        "  .nespresso-weeknd-title {" +
        "    font-size: 15px;" +
        "  }" +
        "  .nespresso-weeknd-cta {" +
        "    align-self: center;" +
        "    width: 100%;" +
        "    text-align: center;" +
        "    padding: 0px;" +
        "    background-color: #FFF;" +
        "    color: #000;" +
        "  }" +
        ".nespresso-weeknd-terms{" +
        "    display:none;" +
        "}" +
        "}" +
        "@keyframes weekndSlideDown {" +
        "  from { transform: translateY(-100%); opacity: 0; }" +
        "  to { transform: translateY(0); opacity: 1; }" +
        "}" +
        "</style>"
      );
    },

    // Gerar HTML do componente
    generateHTML: function (config) {
      return (
        '<div class="nespresso-weeknd-banner">' +
        '  <div class="nespresso-weeknd-container">' +
        '    <div class="nespresso-weeknd-image">' +
        '      <img src="' +
        config.imageUrl +
        '" alt="Promoção The Weeknd Nespresso">' +
        "    </div>" +
        '    <div class="nespresso-weeknd-content">' +
        '      <h3 class="nespresso-weeknd-title">' +
        config.texts.title +
        "</h3>" +
        '      <p class="nespresso-weeknd-description">' +
        config.texts.description +
        "</p>" +
        '      <a class="nespresso-weeknd-cta" href="' +
        config.ctaUrl +
        '" target="_blank" rel="noopener noreferrer">' +
        config.texts.ctaLabel +
        "</a>" +
        "    </div>" +
        '    <p class="nespresso-weeknd-terms">*Consulte T&C</p>' +
        "  </div>" +
        "</div>"
      );
    },

    // Adicionar eventos
    addEventListeners: function () {
      var ctaElement = document.querySelector(".nespresso-weeknd-cta");
      if (ctaElement) {
        ctaElement.addEventListener("click", function () {
          sendGAEvent("clicou_cta_oferta_the_weeknd");
        });
      }
    },

    // Inserir componente no DOM
    insertComponent: async function (config) {
      try {
        var targetElement = await this.waitForElement(
          config.targetSelector,
          config.maxRetries,
          config.retryInterval,
        );

        // Remover banner existente se houver
        this.remove();

        // Criar container
        var container = document.createElement("div");
        container.innerHTML = this.getStyles() + this.generateHTML(config);

        var styleElement = container.querySelector("style");
        var bannerElement = container.querySelector(".nespresso-weeknd-banner");

        // Inserir estilos no head
        if (!document.getElementById("nespresso-weeknd-styles")) {
          document.head.appendChild(styleElement);
        }

        // Inserir banner conforme posição especificada
        switch (config.insertPosition) {
          case "replace":
            targetElement.innerHTML = "";
            targetElement.appendChild(bannerElement);
            break;
          case "prepend":
            targetElement.insertBefore(bannerElement, targetElement.firstChild);
            break;
          case "append":
            targetElement.appendChild(bannerElement);
            break;
          case "before":
            targetElement.parentNode.insertBefore(bannerElement, targetElement);
            break;
          case "after":
            targetElement.parentNode.insertBefore(
              bannerElement,
              targetElement.nextSibling,
            );
            break;
          default:
            targetElement.appendChild(bannerElement);
        }

        this.addEventListeners();
        console.log("Banner The Weeknd inserido com sucesso!");
        return true;
      } catch (error) {
        console.error("Falha ao inserir banner The Weeknd:", error.message);
        return false;
      }
    },

    // Remover componente
    remove: function () {
      var existingBanner = document.querySelector(".nespresso-weeknd-banner");
      var existingStyles = document.getElementById("nespresso-weeknd-styles");

      if (existingBanner) {
        existingBanner.remove();
      }
      if (existingStyles) {
        existingStyles.remove();
      }
    },

    // Função principal de inicialização
    init: function (userConfig) {
      userConfig = userConfig || {};
      var config = Object.assign({}, this.defaultConfig, userConfig);

      if (document.readyState === "loading") {
        document.addEventListener(
          "DOMContentLoaded",
          this.insertComponent.bind(this, config),
        );
      } else {
        this.insertComponent(config);
      }
    },
  };

  // Auto-inicializar
  if (NespressoBanner.defaultConfig.autoInit) {
    NespressoBanner.init();
  }
})();
