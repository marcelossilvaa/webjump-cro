(function () {
  if (window.plpCardsOfertas) return;
  window.plpCardsOfertas = true;

  // ——————————————————————————————————————————————————————————————————————————————
  // CONFIGURAÇÃO PRINCIPAL - ADICIONE SEUS CARDS AQUI
  // ——————————————————————————————————————————————————————————————————————————————

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "comunicacao-cards-plp-target", //free to fill field, please use lower case
      local_event_action: action, //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  const CARDS_CONFIG = [
    {
      id: "boost-origins",
      enabled: true,
      position: 5,
      targetCollections: [
        //Original
        "nesclub2.br.b2c/cat/capsule-range-ispirazione-italiana",
        "nesclub2.br.b2c/cat/capsule-range-espressos",
        "nesclub2.br.b2c/cat/capsule-range-world-explorations",
        //Vertuo
        "nesclub2.br.b2c/cat/capsule-range-MasterOrigin-vertuo",
        "nesclub2.br.b2c/cat/capsule-range-espresso-vertuo",
        "nesclub2.br.b2c/cat/capsule-range-double-espresso-vertuo",
        "nesclub2.br.b2c/cat/capsule-range-gran-lungo-vertuo",
        "nesclub2.br.b2c/cat/capsule-range-craft-brew-vertuo",
      ],
      filterCondition: "0",
      hasBackground: true,
      variants: {
        ol: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45777693769758/Card-PLP-432x692-Brazil-Organic-V2.jpg?attachment=true&cimgnr=FR3NB",
          paragrafo: "Compre Brazil Organic e garanta ofertas exclusivas",
          ctaText: "ADICIONAR AO CARRINHO",
          ctaAction: "addToCart",
          ctaSKU: "7894.90",
          ctaQuantity: 10,
        },
        vl: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45777692950558/Card-PLP-432x692-Colombia-VL-V2.jpg?attachment=true&cimgnr=TF8DQ",
          paragrafo: "Compre Colombia e garanta ofertas exclusivas",
          ctaText: "ADICIONAR AO CARRINHO",
          ctaAction: "addToCart",
          ctaSKU: "7028.80",
          ctaQuantity: 10,
        },
      },
    },
    {
      id: "incentivo_assinatura_simplifique",
      enabled: true,
      position: 5,
      targetCollections: [
        //Original
        "nesclub2.br.b2c/cat/capsule-range-MasterOrigin",
        //Vertuo
        "nesclub2.br.b2c/cat/capsule-range-limited-edition-vertuo",
      ],
      filterCondition: "0",
      hasBackground: false,
      variants: {
        ol: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45906413518878/Card-PLP-Assinatura-432x692.jpg?attachment=true&cimgnr=SGucV",
        },
        vl: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45906413518878/Card-PLP-Assinatura-432x692.jpg?attachment=true&cimgnr=SGucV",
        },
      },
    },

    {
      id: "incentivo_beneficios_nespresso_club",
      enabled: true,
      position: 5,
      targetCollections: [
        //Original
        "nesclub2.br.b2c/cat/capsules-range-barista-creations",
        //Vertuo
        "nesclub2.br.b2c/cat/capsule-range-espressos-vertuo-ristretto-sub",
      ],
      filterCondition: "0",
      hasBackground: false,
      variants: {
        ol: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45906413649950/Card-PLP-Nespresso-Club-432x692-2.jpg?attachment=true&cimgnr=xrJma",
          ctaText: "CONHEÇA O CLUB",
          ctaLink: "https://www.nespresso.com/br/pt/beneficios",
        },
        vl: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45906413649950/Card-PLP-Nespresso-Club-432x692-2.jpg?attachment=true&cimgnr=xrJma",
          ctaText: "CONHEÇA O CLUB",
          ctaLink: "https://www.nespresso.com/br/pt/beneficios",
        },
      },
    },
    {
      id: "incentivo_reciclagem_capsulas",
      enabled: true,
      position: 5,
      targetCollections: [
        //Original
        "nesclub2.br.b2c/cat/capsule-suggestions",
        //Vertuo
        "nesclub2.br.b2c/cat/capsule-range-Mug-vertuo",
      ],
      filterCondition: "0",
      hasBackground: false,
      variants: {
        ol: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45906413813790/Card-PLP-Reciclagem-432x692-1.jpg?attachment=true&cimgnr=5e6dC",
        },
        vl: {
          banner:
            "https://www.nespresso.com/ecom/medias/sys_master/public/45906413813790/Card-PLP-Reciclagem-432x692-1.jpg?attachment=true&cimgnr=5e6dC",
        },
      },
    },
  ];

  // ——————————————————————————————————————————————————————————————————————————————
  // SISTEMA DE CACHE E ESTADO
  // ——————————————————————————————————————————————————————————————————————————————

  const cardState = {
    initialized: false,
    currentFilterCount: null,
    productVariantKey: null,
    activeCards: new Map(), // cardId -> { gridElements, config }
    cachedSelectors: new Map(), // collection -> elements
    templateCache: null,
    lastObservedElement: null,
    sentLoadEvents: new Set(), // Para evitar eventos duplicados de carregamento
  };

  // Novo: estado para sincronização de CTA com carrinho
  const cartSync = {
    buttonsBySKU: new Map(), // sku -> Set<HTMLButtonElement>
    listenerBound: false,
    napiCheckTimer: null,
  };

  // ——————————————————————————————————————————————————————————————————————————————
  // VARIANTE (Original/Vertuo) — DETECÇÃO
  // ——————————————————————————————————————————————————————————————————————————————
  function computeVariantKey() {
    const href = location.href.toLowerCase();
    if (href.includes("original")) return "ol";
    if (href.includes("vertuo")) return "vl";

    const grid = document.querySelector("plp-cards-grid");
    const sys = grid?.getAttribute?.("data-coffee-system")?.toLowerCase();
    if (sys?.includes("original")) return "ol";
    if (sys?.includes("vertuo")) return "vl";

    return cardState.productVariantKey || "ol";
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // CSS BASE (INJEÇÃO ÚNICA)
  // ——————————————————————————————————————————————————————————————————————————————

  function injectCSSOnce() {
    if (document.getElementById("nespresso-flexibleCardsStyles")) return;

    const styleElement = document.createElement("style");
    styleElement.id = "nespresso-flexibleCardsStyles";
    styleElement.innerHTML = `
      article.banner-custom-inserido div[class*='collectionDetails']{
        height:100% !important;
        text-align:center;
        padding-bottom:0px;
      }
      
      .tituloCardCrossSell, .paragrafoCardCrossSell{
        color: #FFF;
        font-family: 'NespressoLucas', Arial;
        font-size: 16px;
        letter-spacing:1.1px;
        padding: 0px 4px;
      }
      .tituloCardCrossSell{
        margin-bottom:14px;
        font-weight:600;
      }
      .paragrafoCardCrossSell{
        margin-bottom:24px;
      }
      .boldCrossSellCards{
        font-weight: 600;
      }
      .termsCrossSell{
        font-size:10px;
        letter-spacing:1.1px;
        color:#000;
        margin-top: 16px;
      }
      a.linkCardCrossSell, button.btnCardCrossSell{
        background: #fff;
        color: #000;
        align-items: center;
        display: inline-flex;
        padding: 0.5em 1.5em;
        text-decoration: none;
        border-radius: 30px;
        font-weight: 300;
        justify-content: center;
        border: 1px solid #fff;
        font-size:14px;
        gap: 6px;
        margin-bottom:16px;
        margin-top: 8px;
        z-index: 10;
        cursor: pointer;
      }
      
      button.btnCardCrossSell{
        font-family: 'NespressoLucas', Arial;
      }

      article.banner-custom-inserido:not(:has(a.linkCardCrossSell)):not(:has(button.btnCardCrossSell)) .termsCrossSell{
        margin-bottom:40px;
      }
      a.linkCardCrossSell:hover{
        background: #000;
        color: #FFF;
        cursor:pointer !important; 
      }
      a.linkCardCrossSell:hover svg path{
        fill:#FFF;
      }
      .btnCardCrossSell.addCart{
        font-size:11px;
        font-weight:600;
        background:#257a57;
        color:#fff;
        border:none;
        padding: 0.8em 1.5em;
      }
      button.btnCardCrossSell.addCart:hover{
        background:#4e9173;
      }
      /* Estado de loading para botão de adicionar ao carrinho */
      button.btnCardCrossSell.loading{
        opacity: 0.7;
        pointer-events: none;
      }
      button.btnCardCrossSell.loading::after{
        content: '...';
        animation: dots 1.5s steps(4, end) infinite;
      }

      /* NOVO: aparência do botão quando já adicionado/disabled */
      button.btnCardCrossSell.addCart.added,
      button.btnCardCrossSell.addCart[disabled]{
        opacity: 0.85;
        cursor: default;
      }

      @keyframes dots{
        0%, 20%{ content: ''; }
        40%{ content: '.'; }
        60%{ content: '..'; }
        80%, 100%{ content: '...'; }
      }
      
      @media screen and (max-width: 480px){
        .tituloCardCrossSell, .paragrafoCardCrossSell{
          font-size:15px;
        }
      }

      /* Modal */
      .nespresso-welcome-offer-modal *{font-family:NespressoLucas,Helvetica,Arial,sans-serif}
      .nespresso-welcome-offer-modal{position:fixed;top:0;left:0;width:100%;height:100%;display:none;z-index:2000}
      .nespresso-welcome-offer-modal-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);cursor:pointer}
      .nespresso-welcome-offer-modal-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:8px;max-width:90%;width:550px;max-height:90vh;box-shadow:0 5px 15px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;z-index:2001}
      .nespresso-welcome-offer-modal-header{display:flex;justify-content:flex-end;padding:10px;background:#f8f8f8;border-bottom:1px solid #e5e5e5}
      .nespresso-welcome-offer-modal-close{background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s ease}
      .nespresso-welcome-offer-modal-close:hover{opacity:.7}
      .nespresso-welcome-offer-modal-close svg{width:18px;height:18px;color:#666}
      .nespresso-welcome-offer-modal-content{padding:20px;overflow-y:auto;max-height:calc(70vh - 60px);line-height:1.5;color:#333;font-size:14px}
      .nespresso-welcome-offer-modal-termos{/* ajuste de texto se necessário */}
      @media(max-width:480px){
        .nespresso-welcome-offer-modal-container{width:95%}
        .nespresso-welcome-offer-modal-content{padding:15px}
        .nespresso-welcome-offer-modal-header{padding:8px 12px}
      }

      /* Garantir clicabilidade */
      .banner-custom-inserido div[class*="collectionDetails"]{position:relative;z-index:1}
      .termsCrossSell{position:relative;z-index:2;pointer-events:auto}
      .linkTermsCustomCard{position:relative;z-index:3;pointer-events:auto;color:#17171A;text-decoration:underline;cursor:pointer}
      .linkTermsCustomCard:hover{text-decoration:none}
    `;
    document.head.appendChild(styleElement);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // SISTEMA DE MODAIS (OTIMIZADO)
  // ——————————————————————————————————————————————————————————————————————————————

  const modalsCreated = new Set();

  function createModal(cardId, modalContent) {
    const modalId = `nespresso-modal-` + cardId;
    if (modalsCreated.has(modalId)) return modalId;

    const modalElement = document.createElement("div");
    modalElement.id = modalId;
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.innerHTML =
      `
      <div class="nespresso-welcome-offer-modal-overlay"></div>
      <div class="nespresso-welcome-offer-modal-container">
        <div class="nespresso-welcome-offer-modal-header">
          <button class="nespresso-welcome-offer-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="nespresso-welcome-offer-modal-content">
          <div class="nespresso-welcome-offer-modal-termos">
            ` +
      modalContent +
      `
          </div>
        </div>
      </div>
    `;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(modalElement);
    document.body.appendChild(fragment);

    modalElement.addEventListener("click", (event) => {
      if (
        event.target.closest(".nespresso-welcome-offer-modal-overlay") ||
        event.target.closest(".nespresso-welcome-offer-modal-close")
      ) {
        modalElement.style.display = "none";
        document.body.style.overflow = "";
      }
    });

    modalsCreated.add(modalId);
    return modalId;
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // CACHE DE SELETORES E ELEMENTOS
  // ——————————————————————————————————————————————————————————————————————————————

  function getCachedGridElements(collections) {
    const cacheKey = collections.join(",");

    if (cardState.cachedSelectors.has(cacheKey)) {
      const cached = cardState.cachedSelectors.get(cacheKey);
      if (cached.every((el) => document.contains(el))) {
        return cached;
      }
      cardState.cachedSelectors.delete(cacheKey);
    }

    const selectors = collections
      .map((collection) => `.collection-grid[data-id="` + collection + `"]`)
      .join(", ");

    const elements = Array.from(document.querySelectorAll(selectors));
    cardState.cachedSelectors.set(cacheKey, elements);

    return elements;
  }

  function getTemplateCache() {
    if (cardState.templateCache && document.contains(cardState.templateCache)) {
      return cardState.templateCache;
    }
    cardState.templateCache = document.querySelector(
      ".collection-grid article"
    );
    return cardState.templateCache;
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

  function deregisterCTAsWithin(rootEl) {
    if (!rootEl) return;
    const btns = rootEl.querySelectorAll(".btnCardCrossSell.addCart[data-sku]");
    btns.forEach((btn) => {
      const sku = btn.getAttribute("data-sku");
      const set = cartSync.buttonsBySKU.get(sku);
      if (set) {
        set.delete(btn);
        if (set.size === 0) cartSync.buttonsBySKU.delete(sku);
      }
    });
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
  // ADICIONAR AO CARRINHO
  // ——————————————————————————————————————————————————————————————————————————————

  function addToCart(sku, quantity, button, cardId) {
    // NOVO: se já está adicionado, não faz nada
    if (!button || button.disabled || button.dataset.added === "true") return;

    button.classList.add("loading");

    try {
      if (
        window.CartManager &&
        typeof window.CartManager.updateItem === "function"
      ) {
        window.CartManager.updateItem(sku, quantity, null, null, false);
        sendGAEvent("add-to-cart", cardId + "-sku:" + sku + "-qty:" + quantity);
        button.classList.remove("loading");
        setButtonAddedState(button, true);
      } else {
        console.error(
          "CartManager não encontrado ou updateItem não disponível"
        );
        button.classList.remove("loading");
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      button.classList.remove("loading");
      const originalText =
        button.dataset.originalText || "ADICIONAR AO CARRINHO";
      button.textContent = "Erro ao adicionar";
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // RENDERIZAÇÃO OTIMIZADA DE CARDS
  // ——————————————————————————————————————————————————————————————————————————————

  function createCardElement(cardConfig, templateArticle) {
    const cardClass = `banner-custom-` + cardConfig.id;
    const clonedCard = templateArticle.cloneNode(true);
    clonedCard.classList.add("banner-custom-inserido", cardClass);
    clonedCard.setAttribute("data-variant", cardState.productVariantKey);

    const cardDetails = clonedCard.querySelector(
      "div[class*='collectionDetails']"
    );
    const variantConfig = cardConfig.variants[cardState.productVariantKey];

    const htmlParts = [];

    if (variantConfig.titulo) {
      htmlParts.push(
        `<h3 class="tituloCardCrossSell">` + variantConfig.titulo + `</h3>`
      );
    }

    if (variantConfig.paragrafo) {
      htmlParts.push(
        `<p class="paragrafoCardCrossSell` +
          ((variantConfig.ctaLink && variantConfig.ctaText) ||
          (variantConfig.ctaAction === "addToCart" && variantConfig.ctaText)
            ? '" style="margin-bottom:0px;'
            : "") +
          `">` +
          variantConfig.paragrafo +
          `</p>`
      );
    }

    if (variantConfig.termsText && variantConfig.modalContent) {
      const modalId = createModal(cardConfig.id, variantConfig.modalContent);
      htmlParts.push(
        `<p class="termsCrossSell"><a href="#" class="linkTermsCustomCard" data-modal-id="` +
          modalId +
          `">` +
          variantConfig.termsText +
          `</a></p>`
      );
    }

    if (
      variantConfig.ctaAction === "addToCart" &&
      variantConfig.ctaSKU &&
      variantConfig.ctaQuantity &&
      variantConfig.ctaText
    ) {
      htmlParts.push(
        `
        <button type="button" class="btnCardCrossSell addCart" 
          data-card-id="` +
          cardConfig.id +
          `"
          data-sku="` +
          variantConfig.ctaSKU +
          `"
          data-quantity="` +
          variantConfig.ctaQuantity +
          `"
          data-cta-text="` +
          variantConfig.ctaText +
          `">
          ` +
          variantConfig.ctaText +
          `
        </button>`
      );
    } else if (variantConfig.ctaLink && variantConfig.ctaText) {
      htmlParts.push(
        `
        <a href="` +
          variantConfig.ctaLink +
          `" class="linkCardCrossSell" 
          data-card-id="` +
          cardConfig.id +
          `"
          data-cta-text="` +
          variantConfig.ctaText +
          `">
          ` +
          variantConfig.ctaText +
          `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none">
            <path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"/>
          </svg>
        </a>`
      );
    }

    cardDetails.innerHTML = htmlParts.join("");

    const termsLink = cardDetails.querySelector(".linkTermsCustomCard");
    if (termsLink) {
      termsLink.addEventListener("click", (event) => {
        event.preventDefault();
        const modalId = termsLink.getAttribute("data-modal-id");
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = "block";
          document.body.style.overflow = "hidden";
        }
      });
    }

    const ctaLink = cardDetails.querySelector(".linkCardCrossSell");
    if (ctaLink) {
      ctaLink.addEventListener("click", (event) => {
        const cardId = ctaLink.getAttribute("data-card-id");
        const ctaText = ctaLink.getAttribute("data-cta-text");
        sendGAEvent("click-cta", cardId + "-" + ctaText);
      });
    }

    const ctaButton = cardDetails.querySelector(".btnCardCrossSell.addCart");
    if (ctaButton) {
      registerCTAButton(ctaButton);

      ctaButton.addEventListener("click", (event) => {
        event.preventDefault();
        // NOVO: se já está marcado como adicionado, não faz nada
        if (ctaButton.disabled || ctaButton.dataset.added === "true") return;

        const cardId = ctaButton.getAttribute("data-card-id");
        const sku = ctaButton.getAttribute("data-sku");
        const quantity = parseInt(ctaButton.getAttribute("data-quantity"), 10);
        addToCart(sku, quantity, ctaButton, cardId);
      });
    }

    const cardSection = clonedCard.querySelector("section");
    if (cardSection && variantConfig.banner) {
      const backgroundValue = cardConfig.hasBackground
        ? `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.7) 100%), url("` +
          variantConfig.banner +
          `")`
        : `url("` + variantConfig.banner + `")`;

      cardSection.style.setProperty(
        "background-image",
        backgroundValue,
        "important"
      );
    }

    return clonedCard;
  }

  function insertCardInGrid(grid, cardElement, position) {
    const existingArticles = grid.querySelectorAll(
      "article:not(.banner-custom-inserido)"
    );
    const insertPosition = position - 1;

    if (existingArticles.length >= insertPosition) {
      grid.insertBefore(cardElement, existingArticles[insertPosition]);
    } else {
      grid.appendChild(cardElement);
    }
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // TRACKING DE CARREGAMENTO DE CARDS
  // ——————————————————————————————————————————————————————————————————————————————

  function trackCardLoad(cardId) {
    if (cardState.sentLoadEvents.has(cardId)) return;
    cardState.sentLoadEvents.add(cardId);
    sendGAEvent("card-loaded", cardId);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // LÓGICA PRINCIPAL OTIMIZADA
  // ——————————————————————————————————————————————————————————————————————————————

  function shouldProcessCard(cardConfig, currentFilterCount) {
    if (!cardConfig.enabled) return false;
    if (
      cardConfig.filterCondition !== null &&
      currentFilterCount !== cardConfig.filterCondition
    ) {
      return false;
    }
    return true;
  }

  function processCard(cardConfig) {
    const cardId = cardConfig.id;
    const targetGrids = getCachedGridElements(cardConfig.targetCollections);

    if (!targetGrids.length) {
      if (cardState.activeCards.has(cardId)) {
        removeCard(cardId);
      }
      return;
    }

    const templateArticle = getTemplateCache();
    if (!templateArticle) return;

    const existingCards = targetGrids.map((grid) =>
      grid.querySelector(`.banner-custom-` + cardId)
    );

    const hasAllCards = existingCards.every((card) => card !== null);
    const variantMismatch = existingCards.some(
      (card) =>
        card &&
        card.getAttribute("data-variant") !== cardState.productVariantKey
    );

    if (hasAllCards && !variantMismatch) {
      cardState.activeCards.set(cardId, {
        gridElements: existingCards.filter(Boolean),
        config: cardConfig,
      });
      return;
    }

    removeCard(cardId);

    const newCardElements = [];
    targetGrids.forEach((grid) => {
      const cardElement = createCardElement(cardConfig, templateArticle);
      insertCardInGrid(grid, cardElement, cardConfig.position);
      newCardElements.push(cardElement);
    });

    cardState.activeCards.set(cardId, {
      gridElements: newCardElements,
      config: cardConfig,
    });

    trackCardLoad(cardId);
  }

  function removeCard(cardId) {
    const cardData = cardState.activeCards.get(cardId);
    if (cardData) {
      cardData.gridElements.forEach((element) => {
        if (element) {
          deregisterCTAsWithin(element);
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }
      });
    }
    cardState.activeCards.delete(cardId);

    document.querySelectorAll(`.banner-custom-` + cardId).forEach((element) => {
      deregisterCTAsWithin(element);
      element.remove();
    });

    cardState.sentLoadEvents.delete(cardId);
  }

  function updateCards() {
    if (window.padl?.page?.pageInfo?.pageName !== "capsules pdp_plp") return;

    const currentFilterCount =
      document
        .querySelector("plp-explicit-filter")
        ?.getAttribute("data-filter-counter") || "0";

    const filterChanged = currentFilterCount !== cardState.currentFilterCount;

    const newVariantKey = computeVariantKey();
    const variantChanged = newVariantKey !== cardState.productVariantKey;

    if (filterChanged || variantChanged) {
      cardState.currentFilterCount = currentFilterCount;
      cardState.productVariantKey = newVariantKey;

      cardState.cachedSelectors.clear();
      Array.from(cardState.activeCards.keys()).forEach(removeCard);
      cardState.sentLoadEvents.clear();
    }

    CARDS_CONFIG.forEach((cardConfig) => {
      if (shouldProcessCard(cardConfig, currentFilterCount)) {
        processCard(cardConfig);
      } else {
        removeCard(cardConfig.id);
      }
    });

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
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-filter-counter"
        ) {
          shouldUpdate = true;
          break;
        }

        if (mutation.type === "childList") {
          const hasCollectionGridChanges = Array.from(mutation.addedNodes)
            .concat(Array.from(mutation.removedNodes))
            .some((node) => {
              return (
                node.nodeType === Node.ELEMENT_NODE &&
                (node.classList?.contains("collection-grid") ||
                  node.querySelector?.(".collection-grid"))
              );
            });

          if (hasCollectionGridChanges) {
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
      attributeFilter: ["data-filter-counter"],
    });

    return true;
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // INICIALIZAÇÃO
  // ——————————————————————————————————————————————————————————————————————————————

  function initialize() {
    if (cardState.initialized) return;

    cardState.productVariantKey = computeVariantKey();

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
    cardState.cachedSelectors.clear();
    cardState.activeCards.clear();
    cardState.sentLoadEvents.clear();
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
