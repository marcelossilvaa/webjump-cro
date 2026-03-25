(function () {
  // Evita múltiplas execuções
  if (window.comunicacaoMaesPLP) {
    return;
  }
  window.comunicacaoMaesPLP = "true";

  // Adiciona dados ao GTM se disponível
  if (window.gtmDataObject) {
    window.gtmDataObject.push({
      event: "adobe_target",
      event_raised_by: "adobe target",
      experiment_id: "${campaign.id}",
      experiment_type: "AB",
      experiment_name: "${campaign.name}",
      experiment_variant_id: "${campaign.recipe.id}",
      experiment_variant: "${campaign.recipe.name}",
    });
  }

  // Constantes
  let COMUNICACAO_MAES_CLASS = "mothers-day-flag";
  let PRODUCTS_CONTAINER_SELECTOR = "plp-cards-grid";

  // Estilos CSS para a comunicação do Dia das Mães com tooltip
  let styles = document.createElement("style");
  styles.innerHTML = `
      .mothers-day-flag .mothers-day-banner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background-color: #B21807;
        color: white;
        font-size: 12px;
        font-weight: 500;
        padding: 6px 8px;
        text-align: center;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .mothers-day-banner span {
        margin-right: 4px;
      }
      
      .mothers-day-info-button {
        background-color: white;
        color: #B21807;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 11px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-left: 4px;
        border: none;
      }
      
      .mothers-day-tooltip {
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border: 1px solid #DDD;
        color: #333;
        padding: 8px;
        border-radius: 4px;
        font-size: 11px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 100;
        min-width: 180px;
        display: none;
      }
      
      .mothers-day-info-button:hover + .mothers-day-tooltip {
        display: block;
      }
      
      .mothers-day-tooltip-options {
        display: flex;
        justify-content: center;
        gap: 4px;
        margin-top: 4px;
      }
      
      .mothers-day-tooltip-option {
        background-color: #F8E8E8;
        color: #B21807;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 10px;
      }
  
      /* Adiciona espaço extra no topo do card para acomodar a bandeira */
      .mothers-day-flag header img,
      .mothers-day-flag div[data-test='product-image'] {
        padding-top: 36px;
      }
    `;

  // Verifica se o elemento precisa da flag
  function needsFlag(header) {
    return header && !header.classList.contains(COMUNICACAO_MAES_CLASS);
  }

  // Aplica a comunicação do Dia das Mães aos produtos
  function applyMothersDayFlags() {
    // Seletor para todos os produtos na página
    let productElements = document.querySelectorAll(
      "article[data-product-short-sku]"
    );

    productElements.forEach(function (productElement) {
      let header = productElement.querySelector("header");
      if (needsFlag(header)) {
        // Adiciona a classe para estilização
        header.classList.add(COMUNICACAO_MAES_CLASS);

        // Cria a bandeira com o tooltip
        let mothersDayBanner = document.createElement("div");
        mothersDayBanner.className = "mothers-day-banner";

        // Mensagem principal
        let messageSpan = document.createElement("span");
        messageSpan.textContent = "🎁 Compre hoje e receba até o Dia das Mães";
        mothersDayBanner.appendChild(messageSpan);

        // Botão de informação
        let infoButton = document.createElement("button");
        infoButton.className = "mothers-day-info-button";
        infoButton.textContent = "i";
        mothersDayBanner.appendChild(infoButton);

        // Tooltip com as condições
        let tooltip = document.createElement("div");
        tooltip.className = "mothers-day-tooltip";
        tooltip.textContent = "Válido para opções:";

        // Opções de entrega no tooltip
        let optionsDiv = document.createElement("div");
        optionsDiv.className = "mothers-day-tooltip-options";

        let option1 = document.createElement("span");
        option1.className = "mothers-day-tooltip-option";
        option1.textContent = "⏱️ Entrega em 2hrs";

        let orSpan = document.createElement("span");
        orSpan.textContent = "ou";

        let option2 = document.createElement("span");
        option2.className = "mothers-day-tooltip-option";
        option2.textContent = "🚚 Entrega hoje";

        optionsDiv.appendChild(option1);
        optionsDiv.appendChild(orSpan);
        optionsDiv.appendChild(option2);
        tooltip.appendChild(optionsDiv);

        // Adiciona o tooltip ao banner
        mothersDayBanner.appendChild(tooltip);

        // Adiciona o banner ao header do produto
        header.appendChild(mothersDayBanner);
      }
    });
  }

  // Inicializa a funcionalidade
  function init() {
    // Adiciona os estilos se ainda não existirem
    if (!document.getElementById("mothers-day-styles")) {
      styles.id = "mothers-day-styles";
      document.head.appendChild(styles);
    }

    // Aplica as flags inicialmente
    applyMothersDayFlags();

    // Configura o observador para mudanças na lista de produtos
    let productsContainer = document.querySelector(PRODUCTS_CONTAINER_SELECTOR);
    if (productsContainer) {
      let observer = new MutationObserver(function (mutations) {
        let hasRelevantChanges = mutations.some(function (mutation) {
          let hasNewProducts = Array.from(mutation.addedNodes).some(function (
            node
          ) {
            return (
              node.nodeType === 1 &&
              (node.matches("article[data-product-short-sku]") ||
                node.querySelector("article[data-product-short-sku]"))
            );
          });
          if (
            mutation.type === "attributes" &&
            mutation.target.matches("article[data-product-short-sku]")
          ) {
            return true;
          }
          return hasNewProducts;
        });

        if (hasRelevantChanges) {
          requestAnimationFrame(applyMothersDayFlags);
        }
      });

      observer.observe(productsContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-product-short-sku"],
      });
    } else {
      // Se o container de produtos ainda não existir, observa o body
      let bodyObserver = new MutationObserver(function (mutations) {
        let productsContainer = document.querySelector(
          PRODUCTS_CONTAINER_SELECTOR
        );
        if (productsContainer) {
          init();
          bodyObserver.disconnect();
        }
      });

      bodyObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
