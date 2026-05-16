(function () {
  if (window.minicartRecomendationAB) return;
  window.minicartRecomendationAB = true;

  gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "nova_recomendacao_minicart",
      local_event_action: "click",
      local_event_label: label,
    });
  }

  // ========== SKUs RECOMENDADOS ==========
  const OL_SKUS = ["7990.90", "7884.90", "7874.90"];
  const VL_SKUS = ["7077.80", "7017.80", "7028.80"];
  // =======================================

  const COMPONENT_ID = "minicart-reco-panel";
  let productsCache = null;
  let lastDetectedTech = null;

  const isMobile = () => window.innerWidth < 768;

  const STYLES =
    `
    .MiniBasketDropdown__wrapper {
      position: relative !important;
    }
    #` +
    COMPONENT_ID +
    ` .QuantitySelector__popin--bottom, #` +
    COMPONENT_ID +
    ` .QuantitySelector__popin--top {
      right: 246% !important;
    }
    #` +
    COMPONENT_ID +
    ` {
      position: absolute;
      right: 100%;
      top: 0;
      width: 250px;
      height: 100%;
      background: #F3F0EB;
      font-family: NespressoLucas, sans-serif;
      overflow-y: auto;
      z-index: 10;
      transition: width 0.35s ease, opacity 0.5s ease-in-out, max-height 0.6s ease-in-out, transform 0.5s ease-in-out;
    }

    #` +
    COMPONENT_ID +
    `.reco-panel--hiding {
      opacity: 0;
      max-height: 0 !important;
      transform: scale(0.97);
      overflow: hidden;
      pointer-events: none;
    }

    #` +
    COMPONENT_ID +
    `.reco-panel--collapsed {
      width: 36px;
      overflow: hidden;
    }

    #` +
    COMPONENT_ID +
    `::-webkit-scrollbar {
      width: 4px;
    }
    #` +
    COMPONENT_ID +
    `::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }

    #` +
    COMPONENT_ID +
    ` .reco-header {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      cursor: pointer;
      border-bottom: 1px solid #ededed;
      user-select: none;
      gap: 8px;
      background-color:#BA9C89;
    }

    #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header {
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 0;
      height: 100%;
      width: 36px;
      box-sizing: border-box;
      border-bottom: none;
      gap: 0;
    }

    #` +
    COMPONENT_ID +
    ` .reco-header__arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }
    #` +
    COMPONENT_ID +
    ` .reco-header__arrow svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #` +
    COMPONENT_ID +
    ` .reco-header__arrow--open {
      transform: rotate(180deg);
    }

    #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__arrow {
      transform: rotate(0deg);
    }

    @keyframes recoPulseLeft {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-4px); }
    }

    #` +
    COMPONENT_ID +
    ` .reco-header__title {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__title {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }

    #` +
    COMPONENT_ID +
    ` .reco-list {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 50px;
      margin-top:25px;
    }
    #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-list {
      display: none;
    }

    @media (max-width: 767px) {
      #` +
    COMPONENT_ID +
    ` .reco-list {
        max-height: 500px;
        opacity: 1;
        transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.4s ease;
      }
      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-list {
        display: flex !important;
        max-height: 0;
        opacity: 0;
        padding-top: 0;
        padding-bottom: 0;
        overflow: hidden;
      }
    }

    #` +
    COMPONENT_ID +
    ` .reco-card {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      padding: 14px 12px 12px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: box-shadow 0.2s;
    }
    #` +
    COMPONENT_ID +
    ` .reco-card:hover {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__image {
      width: 60px;
      height: auto;
      object-fit: contain;
      margin-bottom: 8px;
      align-self: center;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__name {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
      line-height: 1.3;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__headline {
      font-size: 11px;
      color: #666;
      line-height: 1.3;
      margin-bottom: 2px;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__capsules {
      font-size: 11px;
      color: #888;
      margin-bottom: 8px;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      width: 100%;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__price {
      font-size: 14px;
      font-weight: 700;
      color: #986F38;
      line-height: 1.2;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__unit-price {
      font-size: 11px;
      color: #986F38;
      display: block;
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__footer .add-to-bag {
      flex-shrink: 0;
    }
    @media screen and (min-width: 768px){
      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header{
        gap: 25px !important;
        background-color: #f3f0eb;
      }
      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__arrow{
        background-color: #ba9c89;
        width: 100%;
        padding: 10px 0;
        justify-content: center;
      }
      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__arrow svg{
        animation: recoPulseLeft 1.4s ease-in-out infinite;
      }
      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__title{
        font-size:16px !important;
        letter-spacing: 1.1px !important;
        color: #796a5e;
        padding-top: 12px;
      }
    }
    @media screen and (min-width: 768px) and (max-height: 820px) {
      #` +
    COMPONENT_ID +
    ` .reco-list{
        gap: 10px;
        margin-top: 0px;
      }
    #` +
    COMPONENT_ID +
    ` .reco-card{
        padding:0px 12px 2px;
    }
     #` +
    COMPONENT_ID +
    ` .reco-card__name{
        font-size: 12px;
    }
    #` +
    COMPONENT_ID +
    ` .reco-card__image{
        width: 50px;
        margin-bottom: 0px;
        margin-top:8px;
    }
      
    }

    /* ===== MOBILE ===== */
    @media (max-width: 767px) {
      .MiniBasketDropdown__wrapper {
        position: static !important;
      }
    #` +
    COMPONENT_ID +
    `{
      background-color: #FFF;
    }
      #` +
    COMPONENT_ID +
    ` .QuantitySelector__popin--bottom,
      #` +
    COMPONENT_ID +
    ` .QuantitySelector__popin--top {
        right: auto !important;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card .reco-card__image {
        width:30px;
        height:auto;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card .reco-card__headline{
        display:none;
      }
      #` +
    COMPONENT_ID +
    ` {
        position: static !important;
        width: 100% !important;
        height: auto !important;
        right: auto;
        top: auto;
        overflow-y: visible;
        box-sizing: border-box;
        margin-bottom:4px;
      }

      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed {
        width: 100% !important;
        overflow: hidden;
      }

      #` +
    COMPONENT_ID +
    ` .reco-header {
        flex-direction: row-reverse;
        justify-content: center;
        transition: background 0.35s ease, border-radius 0.35s ease, margin 0.35s ease, width 0.35s ease;
      }

      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header {
        flex-direction: row-reverse;
        align-items: center;
        justify-content: center;
        height: auto;
        width: 100%;
        padding: 6px 16px;
        border-bottom: none;
        gap: 8px;
        background: #f5f1e6;
        width: fit-content;
        margin: 8px auto;
        border-radius: 20px;
      }

      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__title {
        writing-mode: horizontal-tb !important;
        transform: none !important;
      }

      #` +
    COMPONENT_ID +
    ` .reco-header__arrow--open {
        transform: rotate(-90deg);
      }

      #` +
    COMPONENT_ID +
    `.reco-panel--collapsed .reco-header__arrow {
        transform: rotate(90deg) !important;
        transition: transform 0.35s ease;
        animation: none !important;
      }

      #` +
    COMPONENT_ID +
    ` .reco-list {
        flex-direction: row;
        overflow-x: auto;
        overflow-y: visible;
        gap: 10px;
        margin-top: 0;
        padding: 10px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        justify-content: center;
      }

      #` +
    COMPONENT_ID +
    ` .reco-list::-webkit-scrollbar {
        display: none;
      }

      #` +
    COMPONENT_ID +
    ` .reco-card {
        min-width: 100px;
        max-width: 110px;
        flex-shrink: 0;
        background-color:#F9F9F9;
        align-items: center;
        text-align: center;
        padding: 0px 12px 2px;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__capsules {
        display: none;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__unit-price {
        display: none;
      }
      #` +
    COMPONENT_ID +
    ` .add-to-bag .AddToBagButton {
        border-radius:4px;
        width:23px;
        height:18px;
      }
          #` +
    COMPONENT_ID +
    ` .add-to-bag {
      position: static;
      display: flex;
      justify-content: center;
    }
      #` +
    COMPONENT_ID +
    ` .add-to-bag .AddToBagButtonSmall__quantity{
        top: 0px !important;
      }
      #` +
    COMPONENT_ID +
    ` .add-to-bag .AddToBagButtonSmall__quantity i.AddToBagButtonSmall__icon-sign{
        font-size: 18px !important;
      }
        #` +
    COMPONENT_ID +
    ` .add-to-bag .AddToBagButtonSmall__quantity{
        font-size:10px !important;
    }
      #` +
    COMPONENT_ID +
    ` .reco-card__footer{
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__name{
        font-size: 12px;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__capsules{
        font-size: 11px;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__price{
        font-size: 12px;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__unit-price{
        font-size: 8px;
      }
      #` +
    COMPONENT_ID +
    ` .reco-header{
        padding: 6px 16px;
        background: #f5f1e6;
        justify-content: center;
        width: fit-content;
        margin: 8px auto;
        border-radius: 20px;
        border-bottom: none;
      }
      #` +
    COMPONENT_ID +
    ` .reco-header__title{
        color: #746b61;
      }
      #` +
    COMPONENT_ID +
    ` .reco-header__arrow svg{
        stroke: #746b61;
      }
    }
    @media screen and (max-width: 375px) {
      #` +
    COMPONENT_ID +
    ` .reco-list .reco-card:nth-child(n+3) {
        display: none;
      }
    }

    #` +
    COMPONENT_ID +
    ` .reco-card__check-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      background: #E8E8E8;
      border: none;
      cursor: default;
      pointer-events: none;
      flex-shrink: 0;
    }
    #` +
    COMPONENT_ID +
    ` .reco-card__check-btn svg {
      width: 18px;
      height: 18px;
      stroke: #888;
      stroke-width: 2.5;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #` +
    COMPONENT_ID +
    ` .reco-card__check-btn--hidden {
      display: none;
    }
    #` +
    COMPONENT_ID +
    ` .add-to-bag--hidden {
      display: none !important;
    }

    @media (max-width: 767px) {
      #` +
    COMPONENT_ID +
    ` .reco-card__check-btn {
        width: 23px;
        height: 18px;
        border-radius: 4px;
      }
      #` +
    COMPONENT_ID +
    ` .reco-card__check-btn svg {
        width: 13px;
        height: 13px;
      }
    }
  `;

  const addStyles = () => {
    if (document.getElementById("minicart-reco-styles")) return;
    const el = document.createElement("style");
    el.id = "minicart-reco-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
  };

  const formatBRL = (value) => "R$ " + value.toFixed(2).replace(".", ",");

  async function getCartItems() {
    try {
      const cartApi = window.napi?.cart?.();
      if (!cartApi || typeof cartApi.read !== "function") return [];
      const ret = cartApi.read();
      if (ret && typeof ret.then === "function") return await ret;
      return Array.isArray(ret) ? ret : [];
    } catch (e) {
      return [];
    }
  }

  function extractSkuFromProductId(productId) {
    if (!productId || typeof productId !== "string") return null;
    const parts = productId.split("/");
    return parts[parts.length - 1] || null;
  }

  async function getInCartSkus() {
    const items = await getCartItems();
    return new Set(
      items
        .map(function (i) {
          return extractSkuFromProductId(i?.productId);
        })
        .filter(Boolean),
    );
  }

  async function syncAllCards() {
    const panel = document.getElementById(COMPONENT_ID);
    if (!panel) return;
    const inCartSkus = await getInCartSkus();
    var cards = panel.querySelectorAll(".reco-card");
    var allInCart = cards.length > 0;
    cards.forEach(function (card) {
      var sku = card.getAttribute("data-sku");
      var addBag = card.querySelector(".add-to-bag");
      var checkBtn = card.querySelector(".reco-card__check-btn");
      if (!addBag || !checkBtn) return;
      if (inCartSkus.has(sku)) {
        if (checkBtn.classList.contains("reco-card__check-btn--hidden")) {
          sendGAEvent("cafe_ja_adicionado_reco_minicart_" + sku);
        }
        addBag.classList.add("add-to-bag--hidden");
        checkBtn.classList.remove("reco-card__check-btn--hidden");
      } else {
        allInCart = false;
        addBag.classList.remove("add-to-bag--hidden");
        checkBtn.classList.add("reco-card__check-btn--hidden");
      }
    });
    if (allInCart) {
      if (!panel.classList.contains("reco-panel--hiding")) {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.offsetHeight; // force reflow
        panel.classList.add("reco-panel--hiding");
        panel.addEventListener("transitionend", function handleHide(e) {
          if (e.propertyName === "opacity") {
            panel.style.display = "none";
            panel.removeEventListener("transitionend", handleHide);
          }
        });
        // fallback if transitionend doesn't fire
        setTimeout(function () {
          if (panel.classList.contains("reco-panel--hiding")) {
            panel.style.display = "none";
          }
        }, 700);
      }
    } else {
      panel.classList.remove("reco-panel--hiding");
      panel.style.display = "";
      panel.style.maxHeight = "";
    }
  }

  async function detectCartTechnology() {
    const cartItems = await getCartItems();
    const userItems = cartItems.filter(function (item) {
      return !item.nonRemovable;
    });
    if (!userItems.length) return null;

    var hasOL = false;
    var hasVL = false;
    var hasCapsule = false;
    for (var i = 0; i < userItems.length; i++) {
      try {
        var sku = extractSkuFromProductId(userItems[i].productId);
        if (!sku) continue;
        var product = await window.napi.catalog().getProduct(sku);
        if (!product || product.type !== "capsule") continue;
        hasCapsule = true;
        var tech = (product.technologies && product.technologies[0]) || "";
        if (tech.includes("original")) hasOL = true;
        else if (tech.includes("vertuo")) hasVL = true;
      } catch (e) {
        /* skip */
      }
    }

    if (!hasCapsule) return null;
    // Só VL no carrinho → VL, qualquer outro caso → OL
    if (hasVL && !hasOL) return "VL";
    return "OL";
  }

  function getRecommendedSkus(tech) {
    return tech === "VL" ? VL_SKUS : OL_SKUS;
  }

  const fetchProducts = async (tech) => {
    var skus = getRecommendedSkus(tech);
    if (productsCache && lastDetectedTech === tech) return productsCache;

    const results = [];
    for (const sku of skus) {
      try {
        const product = await window.napi.catalog().getProduct(sku);
        if (product && product.inStock) results.push(product);
      } catch (e) {
        console.warn("[MinicartReco] Falha ao buscar SKU " + sku, e);
      }
    }
    productsCache = results;
    lastDetectedTech = tech;
    return results;
  };

  const buildCard = (product) => {
    const qty = product.salesMultiple || 10;
    const totalPrice = product.price * qty;
    const imgPath = product.responsiveImages?.plp || product.images?.icon || "";
    const imgSrc = imgPath.startsWith("http")
      ? imgPath
      : "https://www.nespresso.com" + imgPath;

    const sku = product.id?.split("/").pop() || product.id;

    const card = document.createElement("div");
    card.className = "reco-card";
    card.setAttribute("data-sku", sku);
    card.innerHTML =
      '<img class="reco-card__image" src="' +
      imgSrc +
      '" alt="' +
      product.name +
      '" loading="lazy" />' +
      '<div class="reco-card__name">' +
      product.name +
      "</div>" +
      '<div class="reco-card__headline">' +
      (product.headline || "") +
      "</div>" +
      '<div class="reco-card__capsules">' +
      qty +
      " cápsulas</div>" +
      '<div class="reco-card__footer">' +
      "<div>" +
      '<span class="reco-card__price">' +
      formatBRL(totalPrice) +
      "</span>" +
      '<span class="reco-card__unit-price">(' +
      qty +
      " × " +
      formatBRL(product.price) +
      ")</span>" +
      "</div>" +
      '<div class="add-to-bag" data-product-id="' +
      product.id +
      '" data-button-size="small"></div>' +
      '<button class="reco-card__check-btn reco-card__check-btn--hidden" aria-label="Já no carrinho">' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      "</button>" +
      "</div>";

    return card;
  };

  const buildPanel = async () => {
    const tech = await detectCartTechnology();

    // Se não há cápsulas no carrinho, remove painel se existir e sai
    const existing = document.getElementById(COMPONENT_ID);
    if (tech === null) {
      if (existing) existing.remove();
      return;
    }

    // Se a tecnologia mudou, remove painel antigo para reconstruir
    if (existing) {
      if (lastDetectedTech === tech) return;
      existing.remove();
      productsCache = null;
    }

    const products = await fetchProducts(tech);
    if (!products.length) return;

    // Se todos os SKUs recomendados já estão no carrinho, não renderiza o painel
    const inCartSkus = await getInCartSkus();
    const allAlreadyInCart = products.every(function (p) {
      var sku = p.id?.split("/").pop() || p.id;
      return inCartSkus.has(sku);
    });
    if (allAlreadyInCart) return;

    const panel = document.createElement("div");
    panel.id = COMPONENT_ID;

    // Header
    const header = document.createElement("div");
    header.className = "reco-header";
    const svgArrow =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    header.innerHTML =
      '<span class="reco-header__arrow reco-header__arrow--open">' +
      svgArrow +
      "</span>" +
      '<span class="reco-header__title">Complete sua experiência</span>';

    // List
    const list = document.createElement("div");
    list.className = "reco-list";

    products.forEach((p) => list.appendChild(buildCard(p)));

    // Toggle
    header.addEventListener("click", () => {
      const isOpen = !panel.classList.contains("reco-panel--collapsed");
      panel.classList.toggle("reco-panel--collapsed", isOpen);
      const arrow = header.querySelector(".reco-header__arrow");
      arrow.classList.toggle("reco-header__arrow--open", !isOpen);
      sendGAEvent(isOpen ? "fechou_reco_minicart" : "abriu_reco_minicart");
    });

    panel.appendChild(header);
    panel.appendChild(list);

    // Inject based on device
    if (isMobile()) {
      const footer = document.querySelector(".MiniBasketFooter");
      if (!footer || !footer.parentNode) return;
      footer.parentNode.insertBefore(panel, footer);
    } else {
      const wrapper = document.querySelector(".MiniBasketDropdown__wrapper");
      if (!wrapper) return;
      wrapper.appendChild(panel);
    }

    // Activate add-to-bag buttons
    setTimeout(() => {
      if (window.mosaic && window.mosaic.initializeAllFreeHTMLModules) {
        mosaic.initializeAllFreeHTMLModules(panel);
      }
      panel.querySelectorAll(".add-to-bag").forEach(function (bag) {
        bag.addEventListener("click", function () {
          var card = bag.closest(".reco-card");
          var sku = card ? card.getAttribute("data-sku") : "";
          sendGAEvent("add_to_cart_reco_minicart_" + sku);
        });
      });
      syncAllCards();
    }, 150);

    sendGAEvent("ativou_reco_lateral_minicart");
  };

  const watchForMinicartOpen = () => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          const isMiniCart = node.classList?.contains(
            "MiniBasketDropdown__wrapper",
          );
          const containsMiniCart = node.querySelector?.(
            ".MiniBasketDropdown__wrapper",
          );

          if (isMiniCart || containsMiniCart) {
            setTimeout(() => buildPanel(), 200);
            break;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  };

  const init = () => {
    addStyles();
    watchForMinicartOpen();

    if (window.napi?.data) {
      window.napi.data().on("cart.update", () => {
        const wrapper = document.querySelector(".MiniBasketDropdown__wrapper");
        if (wrapper) setTimeout(() => buildPanel(), 200);
        setTimeout(() => syncAllCards(), 400);
      });
    }
  };

  const waitForNapi = setInterval(() => {
    if (window.napi) {
      clearInterval(waitForNapi);
      init();
    }
  }, 500);

  setTimeout(() => {
    clearInterval(waitForNapi);
    if (!window.napi) {
      console.error("[MinicartReco] Nespresso API indisponível após 10s");
    }
  }, 10000);
})();
