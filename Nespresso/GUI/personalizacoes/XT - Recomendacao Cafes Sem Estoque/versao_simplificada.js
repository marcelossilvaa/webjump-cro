(function () {
  if (window.comunicacaoCafesSemEstoque) return;
  window.comunicacaoCafesSemEstoque = true;

  // ——————————————————————————————————————————————————————————————————————————————
  // CONFIGURAÇÃO PRINCIPAL - SKUs E COMUNICAÇÕES
  // ——————————————————————————————————————————————————————————————————————————————

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "comunicacao-cafes-sem-estoque", //free to fill field, please use lower case
      local_event_action: action, //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  // Configuração de SKUs e suas comunicações específicas
  const SKU_COMMUNICATIONS = {
    // Exemplo: "SKU123": { html: "<div>Comunicação para SKU123</div>" }
    // Adicione seus SKUs e comunicações aqui

    //Cosi
    "7863.90": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/original/capsulas-cafe-black-honey-nicaragua"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/16654090272798/nicaragua-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Nicaragua" loading="lazy"><strong>Nicaragua</strong></div></div></a>`,
    },
    //Tokyo Lungo
    "7881.90": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/original/capsulas-cafe-secagem-natural-ethiopia"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/16653733724190/ethiopia-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Ethiopia" loading="lazy"><strong>Ethiopia</strong></div></div></a>`,
    },
    //Linizio Lungo - Viena
    "7879.90": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/original/capsulas-cafe-black-honey-nicaragua"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/16654090272798/nicaragua-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Nicaragua" loading="lazy"><strong>Nicaragua</strong></div></div></a>`,
    },
    //Rich Chocolate
    "7296.80": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/vertuo/capsulas-de-cafe-hazelino-muffin-vertuo"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/17452241649694/roasted-hazelnut-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Roasted Hazelnut" loading="lazy"><strong>Roasted Hazelnut</strong></div></div></a>`,
    },
    //Mexico
    "7026.80": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/vertuo/capsulas-de-cafe-master-origin-colombia-vertuo"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/17200621879326/colombia-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Colombia" loading="lazy"><strong>Colombia</strong></div></div></a>`,
    },
    //Ristretto Intenso
    "7011.80": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/vertuo/capsulas-de-cafe-intenso-vertuo"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/17299413729310/intenso-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Intenso" loading="lazy"><strong>Intenso</strong></div></div></a>`,
    },
    //Ristretto Clássico
    "7010.80": {
      html: `<a href="https://www.nespresso.com/br/pt/order/capsules/vertuo/capsulas-de-cafe-master-origin-mexico-vertuo"><div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><div class='comunicacao-sku-texto-img'><img src="/ecom/medias/sys_master/public/17299416907806/mexico-2x.png?impolicy=small&amp;imwidth=112&amp;imdensity=1" alt="Mexico" loading="lazy"><strong>Mexico</strong></div></div></a>`,
    },
  };

  // ——————————————————————————————————————————————————————————————————————————————
  // SISTEMA DE CACHE E ESTADO
  // ——————————————————————————————————————————————————————————————————————————————

  const cardState = {
    initialized: false,
    processedArticles: new Set(), // Para rastrear articles já processados
  };

  // ——————————————————————————————————————————————————————————————————————————————
  // BUSCAR ARTICLES POR SKU
  // ——————————————————————————————————————————————————————————————————————————————

  function findArticlesBySKU(sku) {
    return Array.from(
      document.querySelectorAll(`article[data-product-short-sku="` + sku + `"]`)
    );
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // CSS BASE (INJEÇÃO ÚNICA)
  // ——————————————————————————————————————————————————————————————————————————————

  function injectCSSOnce() {
    if (document.getElementById("nespresso-comunicacao-cafes-sem-estoque"))
      return;

    const styleElement = document.createElement("style");
    styleElement.id = "nespresso-comunicacao-cafes-sem-estoque";
    styleElement.innerHTML = `
        /* Estilos para comunicações inseridas por SKU */
        .comunicacao-sku-inserida {
          z-index: 1;
          position: absolute;
          top: 5px;
          left: 0px;
        }
      ._container_51dd9_200{
        position: relative;
      }
      .comunicacao-sku {
          font-family: 'NespressoLucas';
          border-radius: 6px;
          padding: 4px 8px;
          margin: 0px 8px 12px;
          text-align: center;
          background-color: #f3eee6;
          color: #000;
          font-size: 13px;
          }
        .comunicacao-sku-texto-img{
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .comunicacao-sku-texto-img img{
          width: 30px;
          height: 30px;
        }
        .comunicacao-sku-texto-img strong{
          font-size: 16px;
          align-self: flex-end;
        }
      @media screen and (max-width:540px){
        .comunicacao-sku{
          font-size: 10px;
          margin: 0px 6px 0px;
        }
      }
      `;
    document.head.appendChild(styleElement);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // INSERIR COMUNICAÇÃO NO ARTICLE
  // ——————————————————————————————————————————————————————————————————————————————

  function hidePurchaseSection(article) {
    const footer = article.querySelector("footer");
    if (!footer) return;

    // Busca a div dentro do footer que contém a classe "purchaseSection"
    const purchaseSectionDiv = footer.querySelector(
      "div[class*='purchaseSection']"
    );
    if (purchaseSectionDiv) {
      purchaseSectionDiv.style.opacity = "0";
    }
  }

  function insertCommunicationInArticle(article, communicationHTML) {
    // Verifica se já foi inserida uma comunicação neste article
    if (article.querySelector(".comunicacao-sku-inserida")) {
      // Se já tem comunicação, garante que a purchaseSection está oculta
      hidePurchaseSection(article);
      return;
    }

    // Busca o elemento footer dentro do article
    const footer = article.querySelector("._container_51dd9_200");

    if (!footer) {
      // Se não encontrar footer, insere no final do article
      const communicationDiv = document.createElement("div");
      communicationDiv.className = "comunicacao-sku-inserida";
      communicationDiv.innerHTML = communicationHTML;
      article.appendChild(communicationDiv);
    } else {
      // Insere antes do footer
      const communicationDiv = document.createElement("div");
      communicationDiv.className = "comunicacao-sku-inserida";
      communicationDiv.innerHTML = communicationHTML;
      footer.insertAdjacentElement("afterbegin", communicationDiv);
    }

    // Oculta a div purchaseSection dentro do footer
    hidePurchaseSection(article);

    // Adiciona event listeners nos links da recomendação para impedir propagação
    const communicationDiv = article.querySelector(".comunicacao-sku-inserida");
    if (communicationDiv) {
      const links = communicationDiv.querySelectorAll("a");
      links.forEach((link) => {
        link.addEventListener("click", (event) => {
          // Impede que o evento se propague para os elementos pais (card)
          event.stopPropagation();
          // Permite que o comportamento padrão do link aconteça (navegação)
          // Não precisa de preventDefault() aqui, queremos que o link funcione normalmente
        });
      });
    }

    // Marca o article como processado
    cardState.processedArticles.add(article);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // LÓGICA PRINCIPAL - PROCESSAR SKUs E INSERIR COMUNICAÇÕES
  // ——————————————————————————————————————————————————————————————————————————————

  function processSKUCommunications() {
    // Limpa articles que não existem mais no DOM
    cardState.processedArticles.forEach((article) => {
      if (!document.contains(article)) {
        cardState.processedArticles.delete(article);
      }
    });

    // Itera sobre cada SKU na configuração
    Object.keys(SKU_COMMUNICATIONS).forEach((sku) => {
      const communication = SKU_COMMUNICATIONS[sku];

      if (!communication || !communication.html) {
        return;
      }

      // Busca todos os articles com este SKU
      const articles = findArticlesBySKU(sku);

      // Insere a comunicação em cada article encontrado
      articles.forEach((article) => {
        // Verifica se já foi processado
        if (!cardState.processedArticles.has(article)) {
          insertCommunicationInArticle(article, communication.html);
        } else {
          // Se já foi processado, garante que a purchaseSection está oculta
          // (caso o article tenha sido recriado no DOM)
          hidePurchaseSection(article);
        }
      });
    });
  }

  function updateCards() {
    if (window.padl?.page?.pageInfo?.pageName !== "capsules pdp_plp") return;

    processSKUCommunications();
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // OBSERVER OTIMIZADO
  // ——————————————————————————————————————————————————————————————————————————————

  let mutationObserver;
  let updateTimeout;

  function createOptimizedObserver() {
    if (mutationObserver) mutationObserver.disconnect();

    const plpCardsGridElement = document.querySelector("plp-cards-grid");
    if (!plpCardsGridElement) return false;

    mutationObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      for (const mutation of mutations) {
        // Observa mudanças em atributos data-product-short-sku
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-product-short-sku"
        ) {
          shouldUpdate = true;
          break;
        }

        // Observa adição/remoção de articles
        if (mutation.type === "childList") {
          const hasArticleChanges = Array.from(mutation.addedNodes)
            .concat(Array.from(mutation.removedNodes))
            .some((node) => {
              return (
                node.nodeType === Node.ELEMENT_NODE &&
                (node.tagName === "ARTICLE" || node.querySelector?.("article"))
              );
            });

          if (hasArticleChanges) {
            shouldUpdate = true;
            break;
          }
        }
      }

      if (shouldUpdate) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateCards, 150);
      }
    });

    mutationObserver.observe(plpCardsGridElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-product-short-sku"],
    });

    return true;
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // INICIALIZAÇÃO
  // ——————————————————————————————————————————————————————————————————————————————

  function initialize() {
    if (cardState.initialized) return;

    injectCSSOnce();
    updateCards();
    createOptimizedObserver();

    cardState.initialized = true;
  }

  function waitForElementAndInitialize() {
    const checkForPlpElement = () => {
      const plpCardsGridElement = document.querySelector("plp-cards-grid");
      if (plpCardsGridElement) {
        initialize();
      } else {
        setTimeout(checkForPlpElement, 100);
      }
    };

    checkForPlpElement();
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // GTM E EVENTOS
  // ——————————————————————————————————————————————————————————————————————————————

  if (!window.flexibleCardsPLPInitialized) {
    window.flexibleCardsPLPInitialized = true;
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "adobe_target",
      event_raised_by: "adobe target",
      experiment_id: "${campaign.id}",
      experiment_type: "AB",
      experiment_variant_id: "${campaign.recipe.id}",
      experiment_variant: "${campaign.recipe.name}",
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document
        .querySelectorAll(".nespresso-welcome-offer-modal[style*='block']")
        .forEach((modal) => {
          modal.style.display = "none";
          document.body.style.overflow = "";
        });
    }
  });

  window.addEventListener("beforeunload", () => {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    clearTimeout(updateTimeout);
    cardState.processedArticles.clear();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElementAndInitialize);
  } else {
    waitForElementAndInitialize();
  }
})();
