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
    "7919.90": {
      html: "<div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><strong>Arpeggio</strong></div>",
    },
    "7895.90": {
      html: "<div class='comunicacao-sku'>Aguardando retorno ao estoque? Que tal experimentar:<br><strong>Roma</strong></div>",
    },
  };

  // ——————————————————————————————————————————————————————————————————————————————
  // SISTEMA DE CACHE E ESTADO
  // ——————————————————————————————————————————————————————————————————————————————

  const cardState = {
    initialized: false,
    processedArticles: new Set(), // Para rastrear articles já processados
  };

  // Novo: estado para sincronização de CTA com carrinho
  const cartSync = {
    buttonsBySKU: new Map(), // sku -> Set<HTMLButtonElement>
    listenerBound: false,
    napiCheckTimer: null,
  };

  // ——————————————————————————————————————————————————————————————————————————————
  // BUSCAR ARTICLES POR SKU
  // ——————————————————————————————————————————————————————————————————————————————

  function findArticlesBySKU(sku) {
    return Array.from(
      document.querySelectorAll(`article[data-product-short-sku="${sku}"]`)
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
          position: relative;
          z-index: 1;
        }
      .comunicacao-sku {
          font-family: 'NespressoLucas';
          border-radius: 6px;
          padding: 4px 8px;
          margin: 0px 8px 12px;
          text-align: center;
          background-color: #f3eee6;
          font-size: 13px;
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
      purchaseSectionDiv.style.display = "none";
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
    const footer = article.querySelector("footer");

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
      footer.parentNode.insertBefore(communicationDiv, footer);
    }

    // Oculta a div purchaseSection dentro do footer
    hidePurchaseSection(article);

    // Marca o article como processado
    cardState.processedArticles.add(article);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // CARRINHO — SINCRONIZAÇÃO DE CTA
  // ——————————————————————————————————————————————————————————————————————————————

  function extractSkuFromProductId(productId) {
    if (!productId || typeof productId !== "string") return null;
    const parts = productId.split("/");
    return parts[parts.length - 1] || null;
  }

  function registerCTAButton(button) {
    const sku = button?.getAttribute("data-sku");
    if (!sku) return;
    if (!cartSync.buttonsBySKU.has(sku)) {
      cartSync.buttonsBySKU.set(sku, new Set());
    }
    button.dataset.originalText =
      button.getAttribute("data-cta-text") || button.textContent.trim();
    cartSync.buttonsBySKU.get(sku).add(button);
  }

  function setButtonAddedState(button, added) {
    if (!button) return;
    button.classList.remove("loading");
    if (added) {
      button.textContent = "ADICIONADO";
      button.setAttribute("aria-pressed", "true");
      button.dataset.added = "true";
      button.classList.add("added");
      button.disabled = true; // ← NOVO: impede clique nativamente
    } else {
      const original = button.dataset.originalText || "ADICIONAR AO CARRINHO";
      button.textContent = original;
      button.removeAttribute("aria-pressed");
      delete button.dataset.added;
      button.classList.remove("added");
      button.disabled = false; // ← NOVO: reabilita quando sai do carrinho
    }
  }

  async function getCartItems() {
    try {
      const cartApi = window.napi?.cart?.();
      if (!cartApi || typeof cartApi.read !== "function") return [];
      const ret = cartApi.read();
      if (ret && typeof ret.then === "function") {
        return await ret;
      }
      return Array.isArray(ret) ? ret : [];
    } catch (e) {
      return [];
    }
  }

  async function syncCTAsWithCart() {
    const items = await getCartItems();
    const inCartSkus = new Set(
      items.map((i) => extractSkuFromProductId(i?.productId)).filter(Boolean)
    );

    cartSync.buttonsBySKU.forEach((btnSet, sku) => {
      const added = inCartSkus.has(sku);
      btnSet.forEach((btn) => setButtonAddedState(btn, added));
    });
  }

  function bindCartListenerIfPossible() {
    if (cartSync.listenerBound) return true;
    const dataApi = window.napi?.data?.();
    if (!dataApi || typeof dataApi.on !== "function") return false;

    dataApi.on("cart.update", function () {
      syncCTAsWithCart();
    });
    cartSync.listenerBound = true;
    return true;
  }

  function setupCartSync() {
    const bound = bindCartListenerIfPossible();
    if (bound) {
      syncCTAsWithCart();
      return;
    }
    if (cartSync.napiCheckTimer) return;
    let tries = 0;
    cartSync.napiCheckTimer = setInterval(() => {
      tries++;
      if (bindCartListenerIfPossible()) {
        clearInterval(cartSync.napiCheckTimer);
        cartSync.napiCheckTimer = null;
        syncCTAsWithCart();
      } else if (tries > 33) {
        clearInterval(cartSync.napiCheckTimer);
        cartSync.napiCheckTimer = null;
      }
    }, 300);
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
    setupCartSync();
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

    setupCartSync();

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
    if (cartSync.napiCheckTimer) {
      clearInterval(cartSync.napiCheckTimer);
      cartSync.napiCheckTimer = null;
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElementAndInitialize);
  } else {
    waitForElementAndInitialize();
  }
})();
