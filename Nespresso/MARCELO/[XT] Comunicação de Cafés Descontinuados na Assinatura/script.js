(function () {
  "use strict";

  if (window.wjDelistedSubsModal) {
    return;
  }
  window.wjDelistedSubsModal = true;

  const STYLE_ID = "wj-delisted-subs-modal-style";
  const MODAL_ID = "wj-delisted-subs-modal";
  const OVERLAY_ID = "wj-delisted-subs-overlay";
  const BTN_ID = "wj-my-subscriptions-btn";
  const LISTENER_ATTR = "data-wj-delisted-subs-listener";

  const STANDING_ORDERS_URL =
    "https://www.nespresso.com/br/pt/myaccount/standing-orders";
  const STANDING_ORDERS_EDIT_URL =
    "https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list";
  const TRACKING_CATEGORY = "cafes_descontinuados_assinatura";

  const DELISTED_SKUS = [
    "7886.90",
    "7892.90",
    "7880.90",
    "7894.90",
    "7871.90",
    "7877.90",
    "7002.80",
    "7017.80",
  ];

  let isProcessing = false;
  let debounceTimer = null;
  let modalOpen = false;
  let cachedFirstName = "";
  let cachedProductsHtml = "";
  let preloadPromise = null;

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action,
      local_event_label: label,
    });
  }

  function getSessionStorageItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  async function waitForAPI(maxAttempts, delay) {
    const attempts = maxAttempts || 10;
    const waitMs = delay || 500;

    for (let i = 0; i < attempts; i++) {
      if (
        window.napi &&
        window.napi.catalog &&
        typeof window.napi.catalog().getProduct === "function"
      ) {
        return true;
      }
      await new Promise(function (resolve) {
        setTimeout(resolve, waitMs);
      });
    }
    return false;
  }

  async function fetchProductData(sku) {
    try {
      return await window.napi.catalog().getProduct(sku);
    } catch (error) {
      return null;
    }
  }

  async function getUserFirstName() {
    const cached = getSessionStorageItem("customerInfo-br");
    if (cached && cached.firstName) {
      return cached.firstName;
    }

    try {
      const apiReady = await waitForAPI();
      if (apiReady && window.napi.customer) {
        const customerInfo = await window.napi.customer().read();
        if (customerInfo && customerInfo.firstName) {
          return customerInfo.firstName;
        }
      }
    } catch (error) {}

    return "";
  }

  const cachedProductsBySku = {};

  function buildProductsListHtml() {
    const productsHtml = [];
    let i = 0;

    while (i < DELISTED_SKUS.length) {
      const sku = DELISTED_SKUS[i];
      const productData = cachedProductsBySku[sku];
      if (productData) {
        productsHtml.push(buildProductItemHtml(productData));
      }
      i++;
    }

    if (productsHtml.length > 0) {
      return productsHtml.join("");
    }

    return (
      '<li class="wj-delisted-subs-loading">Não foi possível carregar os produtos.</li>'
    );
  }

  async function preloadModalData() {
    const apiReady = await waitForAPI();
    const userPromise = getUserFirstName();

    if (apiReady) {
      const fetchPromises = DELISTED_SKUS.map(function (sku) {
        return fetchProductData(sku).then(function (productData) {
          if (productData) {
            cachedProductsBySku[sku] = productData;
          }
        });
      });
      await Promise.all(fetchPromises);
    }

    cachedFirstName = await userPromise;
    cachedProductsHtml = buildProductsListHtml();
  }

  function ensurePreload() {
    if (!preloadPromise) {
      preloadPromise = preloadModalData();
    }
    return preloadPromise;
  }

  function getGreeting() {
    const attentionLine = cachedFirstName
      ? "Atenção, " + cachedFirstName + "!"
      : "Atenção!";
    return attentionLine + "<br>Atualize sua Assinatura";
  }

  function getProductImageUrl(productData) {
    let image =
      (productData.responsiveImages && productData.responsiveImages.plp) ||
      (productData.images && productData.images.main) ||
      "";

    if (image && image.indexOf("http") !== 0) {
      image = "https://www.nespresso.com" + image;
    }

    return image;
  }

  function buildProductItemHtml(productData) {
    const name = productData.name || "";
    const intensity =
      (productData.capsuleProperties &&
        productData.capsuleProperties.intensity) ||
      "";
    const image = getProductImageUrl(productData);

    let detailsHtml = "";
    if (intensity) {
      detailsHtml +=
        '<span class="wj-delisted-subs-product-intensity">Intensidade ' +
        intensity +
        "</span>";
    }

    return (
      '<li class="wj-delisted-subs-product">' +
      '<img class="wj-delisted-subs-product-img" src="' +
      image +
      '" alt="' +
      name +
      '">' +
      '<div class="wj-delisted-subs-product-info">' +
      '<span class="wj-delisted-subs-product-name">' +
      name +
      "</span>" +
      detailsHtml +
      "</div>" +
      "</li>"
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#" +
      OVERLAY_ID +
      " {" +
      "position: fixed;" +
      "inset: 0;" +
      "z-index: 10000;" +
      "background: rgba(23, 23, 26, 0.45);" +
      "backdrop-filter: blur(4px);" +
      "display: flex;" +
      "align-items: center;" +
      "justify-content: center;" +
      "padding: 16px;" +
      "box-sizing: border-box;" +
      "}" +
      "#" +
      MODAL_ID +
      " {" +
      "position: relative;" +
      "background: #fff;" +
      "border-radius: 8px;" +
      "max-width: 920px;" +
      "width: 100%;" +
      "max-height: 90vh;" +
      "overflow: hidden;" +
      "display: flex;" +
      "flex-direction: column;" +
      "font-family: NespressoLucas, Helvetica, Arial, sans-serif;" +
      "box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);" +
      "}" +
      "#" +
      MODAL_ID +
      " * {" +
      "box-sizing: border-box;" +
      "font-family: NespressoLucas, Helvetica, Arial, sans-serif;" +
      "}" +
      ".wj-delisted-subs-close {" +
      "position: absolute;" +
      "top: 16px;" +
      "right: 16px;" +
      "background: none;" +
      "border: none;" +
      "font-size: 28px;" +
      "line-height: 1;" +
      "color: #666;" +
      "cursor: pointer;" +
      "padding: 0;" +
      "width: 32px;" +
      "height: 32px;" +
      "z-index: 2;" +
      "}" +
      ".wj-delisted-subs-body {" +
      "display: flex;" +
      "flex: 1;" +
      "overflow: auto;" +
      "}" +
      ".wj-delisted-subs-left {" +
      "flex: 1;" +
      "padding: 40px 32px 24px;" +
      "display: flex;" +
      "flex-direction: column;" +
      "align-items: center;" +
      "text-align: center;" +
      "}" +
      ".wj-delisted-subs-right {" +
      "flex: 1;" +
      "padding: 32px 28px 20px;" +
      "border-left: 1px solid #E8E8E8;" +
      "overflow-y: auto;" +
      "}" +
      ".wj-delisted-subs-icon {" +
      "width: 48px;" +
      "height: 48px;" +
      "border-radius: 50%;" +
      "background: #C0392B;" +
      "color: #fff;" +
      "display: flex;" +
      "align-items: center;" +
      "justify-content: center;" +
      "font-size: 24px;" +
      "font-weight: 700;" +
      "margin-bottom: 16px;" +
      "}" +
      ".wj-delisted-subs-title {" +
      "margin: 0 0 12px;" +
      "font-size: 24px;" +
      "font-weight: 700;" +
      "color: #17171A;" +
      "}" +
      ".wj-delisted-subs-text {" +
      "margin: 0 0 20px;" +
      "font-size: 14px;" +
      "line-height: 1.5;" +
      "color: #3D3D41;" +
      "max-width: 340px;" +
      "}" +
      ".wj-delisted-subs-info-box {" +
      "background: #EEF5F0;" +
      "border-radius: 8px;" +
      "padding: 16px;" +
      "text-align: left;" +
      "width: 100%;" +
      "max-width: 340px;" +
      "margin-bottom: 24px;" +
      "}" +
      ".wj-delisted-subs-info-title {" +
      "display: flex;" +
      "align-items: center;" +
      "gap: 8px;" +
      "font-size: 14px;" +
      "font-weight: 700;" +
      "color: #17171A;" +
      "margin: 0 0 8px;" +
      "}" +
      ".wj-delisted-subs-info-text {" +
      "margin: 0;" +
      "font-size: 13px;" +
      "line-height: 1.45;" +
      "color: #3D3D41;" +
      "}" +
      ".wj-delisted-subs-actions {" +
      "display: flex;" +
      "flex-direction: column;" +
      "gap: 12px;" +
      "width: 100%;" +
      "max-width: 340px;" +
      "}" +
      ".wj-delisted-subs-btn-primary," +
      ".wj-delisted-subs-btn-secondary {" +
      "display: block;" +
      "width: 100%;" +
      "padding: 14px 20px;" +
      "border-radius: 50px;" +
      "font-size: 13px;" +
      "font-weight: 600;" +
      "letter-spacing: 0.5px;" +
      "text-transform: uppercase;" +
      "text-align: center;" +
      "text-decoration: none;" +
      "cursor: pointer;" +
      "border: 2px solid #257A57;" +
      "}" +
      ".wj-delisted-subs-btn-primary {" +
      "background: #257A57;" +
      "color: #fff;" +
      "}" +
      ".wj-delisted-subs-btn-secondary {" +
      "background: #fff;" +
      "color: #257A57;" +
      "}" +
      ".wj-delisted-subs-list-title {" +
      "margin: 0 0 10px;" +
      "font-size: 16px;" +
      "font-weight: 700;" +
      "color: #17171A;" +
      "}" +
      ".wj-delisted-subs-product-list {" +
      "list-style: none;" +
      "margin: 0;" +
      "padding: 0;" +
      "display: flex;" +
      "flex-direction: column;" +
      "gap: 10px;" +
      "}" +
      ".wj-delisted-subs-product {" +
      "display: flex;" +
      "gap: 8px;" +
      "align-items: center;" +
      "}" +
      ".wj-delisted-subs-product-img {" +
      "width: 56px;" +
      "height: 56px;" +
      "object-fit: contain;" +
      "border-radius: 4px;" +
      "flex-shrink: 0;" +
      "}" +
      ".wj-delisted-subs-product-info {" +
      "display: flex;" +
      "flex-direction: column;" +
      "gap: 2px;" +
      "}" +
      ".wj-delisted-subs-product-name {" +
      "font-size: 14px;" +
      "font-weight: 700;" +
      "color: #17171A;" +
      "}" +
      ".wj-delisted-subs-product-intensity {" +
      "font-size: 12px;" +
      "color: #666;" +
      "}" +
      ".wj-delisted-subs-footer {" +
      "display: flex;" +
      "align-items: center;" +
      "gap: 12px;" +
      "background: #EEF5F0;" +
      "padding: 16px 24px;" +
      "border-top: 1px solid #D9E4DB;" +
      "}" +
      ".wj-delisted-subs-footer-text {" +
      "margin: 0;" +
      "font-size: 13px;" +
      "line-height: 1.45;" +
      "color: #17171A;" +
      "}" +
      ".wj-delisted-subs-loading {" +
      "padding: 48px;" +
      "text-align: center;" +
      "color: #666;" +
      "font-size: 14px;" +
      "}" +
      "@media (max-width: 768px) {" +
      ".wj-delisted-subs-body {" +
      "flex-direction: column;" +
      "}" +
      ".wj-delisted-subs-right {" +
      "border-left: none;" +
      "border-top: 1px solid #E8E8E8;" +
      "padding-top: 24px;" +
      "}" +
      ".wj-delisted-subs-left {" +
      "padding-bottom: 0;" +
      "}" +
      "#" +
      MODAL_ID +
      " {" +
      "max-height: 95vh;" +
      "}" +
      "}";

    document.head.appendChild(style);
  }

  function closeModal() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.remove();
    }
    modalOpen = false;
    document.body.style.overflow = "";
  }

  async function showModal() {
    if (modalOpen || document.getElementById(MODAL_ID)) {
      return;
    }

    await ensurePreload();

    modalOpen = true;
    injectStyles();

    const greeting = getGreeting();

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "wj-delisted-subs-heading");

    overlay.innerHTML =
      '<div id="' +
      MODAL_ID +
      '">' +
      '<button type="button" class="wj-delisted-subs-close" aria-label="Fechar">&times;</button>' +
      '<div class="wj-delisted-subs-body">' +
      '<div class="wj-delisted-subs-left">' +
      '<div class="wj-delisted-subs-icon" aria-hidden="true">!</div>' +
      '<h2 id="wj-delisted-subs-heading" class="wj-delisted-subs-title">' +
      greeting +
      "</h2>" +
      '<p class="wj-delisted-subs-text">Alguns cafés da sua Assinatura serão descontinuados. Confira ao lado os cafés que precisam ser substituídos. Revise sua seleção e escolha novos cafés antes do seu próximo envio.</p>' +
      '<div class="wj-delisted-subs-info-box">' +
      '<p class="wj-delisted-subs-info-title">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C8.5 2 6 4.5 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.5-2.5-6-6-6z" fill="#257A57"/><circle cx="12" cy="8" r="2" fill="#EEF5F0"/></svg>' +
      "Por que devo atualizar minha Assinatura?" +
      "</p>" +
      '<p class="wj-delisted-subs-info-text">Caso cafés descontinuados não sejam substituídos e/ou sua seleção fique abaixo de 30 cápsulas, seus próximos pedidos serão enviados automaticamente, sem os benefícios da Assinatura, como: 10% OFF em cafés, frete grátis e status Ambassador.</p>' +
      "</div>" +
      '<div class="wj-delisted-subs-actions">' +
      '<a href="' +
      STANDING_ORDERS_EDIT_URL +
      '" class="wj-delisted-subs-btn-primary" data-wj-action="atualizar">Atualizar Assinatura</a>' +
      '<a href="' +
      STANDING_ORDERS_URL +
      '" class="wj-delisted-subs-btn-secondary" data-wj-action="ver">Ver minha assinatura</a>' +
      "</div>" +
      "</div>" +
      '<div class="wj-delisted-subs-right">' +
      '<h3 class="wj-delisted-subs-list-title">Cafés descontinuados do portfólio:</h3>' +
      '<ul class="wj-delisted-subs-product-list" id="wj-delisted-subs-products">' +
      cachedProductsHtml +
      "</ul>" +
      "</div>" +
      "</div>" +
      '<div class="wj-delisted-subs-footer">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="#257A57" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="#257A57" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<p class="wj-delisted-subs-footer-text">Evite perder seus benefícios de Assinante! Atualize sua Assinatura antes do processamento do seu próximo pedido.</p>' +
      "</div>" +
      "</div>";

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    sendGAEvent("view", "modal_descontinuados_exibido");

    const closeBtn = overlay.querySelector(".wj-delisted-subs-close");
    closeBtn.addEventListener("click", function () {
      sendGAEvent("click", "fechou_modal_descontinuados");
      closeModal();
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        sendGAEvent("click", "fechou_modal_overlay");
        closeModal();
      }
    });

    const editBtn = overlay.querySelector('[data-wj-action="atualizar"]');
    const viewBtn = overlay.querySelector('[data-wj-action="ver"]');

    editBtn.addEventListener("click", function () {
      sendGAEvent("click", "clicou_atualizar_assinatura");
    });

    viewBtn.addEventListener("click", function () {
      sendGAEvent("click", "clicou_ver_assinatura");
    });
  }

  async function handleSubscriptionClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (modalOpen) {
      return;
    }

    sendGAEvent("click", "minhas_assinaturas_btn");
    await showModal();
  }

  function bindSubscriptionButton() {
    const btn = document.getElementById(BTN_ID);
    if (!btn || btn.getAttribute(LISTENER_ATTR)) {
      return false;
    }

    btn.setAttribute(LISTENER_ATTR, "1");
    btn.setAttribute("href", "#");
    btn.addEventListener("click", handleSubscriptionClick);
    return true;
  }

  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      injectStyles();
      bindSubscriptionButton();
    } finally {
      isProcessing = false;
    }
  }

  function debouncedRun() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(run, 200);
  }

  function init() {
    ensurePreload();
    run();

    if (!window.wjDelistedSubsObserver) {
      window.wjDelistedSubsObserver = new MutationObserver(function (
        mutations,
      ) {
        let shouldRun = false;
        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i];
          if (mutation.type !== "childList") {
            continue;
          }
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j];
            if (node.nodeType !== 1) {
              continue;
            }
            if (
              node.id === BTN_ID ||
              (node.querySelector && node.querySelector("#" + BTN_ID))
            ) {
              shouldRun = true;
              break;
            }
          }
          if (shouldRun) {
            break;
          }
        }
        if (shouldRun) {
          debouncedRun();
        }
      });

      window.wjDelistedSubsObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    let attempts = 0;
    const pollTimer = setInterval(function () {
      attempts++;
      if (bindSubscriptionButton() || attempts > 40) {
        clearInterval(pollTimer);
      }
    }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
