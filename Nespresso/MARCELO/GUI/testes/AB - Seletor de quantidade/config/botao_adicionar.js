(function () {
  "use strict";

  if (window.botaoAdicionarCard) return;
  window.botaoAdicionarCard = true;

  // ─── CONFIG ────────────────────────────────────────────
  var CONFIG = {
    PRODUCTS_CONTAINER_SELECTOR: "plp-cards-grid",
    SELECTORS: {
      PRODUCT_CARD: "article[data-product-short-sku]:not(.pricePerCapsuleABv2)",
      FULL_PRICE: 'span[class*="formattedPrice"]',
      QTY_LABEL: 'div[class*="defaultCapsuleLabel"]',
      PER_PRICE: 'div[class*="capsuleSleeveLabel"]',
      ADD_BTN: "[data-testid='add-to-bag'],button[class*='AddToBagButton']",
    },
    CURRENCY: "R$ ",
    PROCESSED_CLASS: "pricePerCapsuleABv2",
    MODAL_ID: "nespresso-welcome-offer-modal-gen",
  };

  // ─── UTILS ────────────────────────────────────────────
  var Utils = {
    debounce: function (fn, ms) {
      var t;
      return function () {
        clearTimeout(t);
        t = setTimeout(fn.bind(this), ms);
      };
    },
    extractNum: function (txt) {
      var m = txt && txt.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
      return m ? m[1] : "";
    },
    parsePrice: function (str) {
      var n = str.replace(/\./g, "").replace(",", "."),
        f = parseFloat(n);
      return isNaN(f) ? null : f;
    },
    formatPrice: function (num) {
      return num.toFixed(2).replace(".", ",");
    },
  };

  // ─── SVG INFO ─────────────────────────────────────────
  var INFO_SVG =
    '<span class="info-icon" style="cursor:pointer;">' +
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" ' +
    'xmlns="http://www.w3.org/2000/svg"><path d="M8 1C3.6168 1 1 3.6168 1 8C1 12.3832 3.6168 15 8 15C12.3832 15 15 12.3832 15 8C15 3.6168 12.3832 1 8 1ZM8 14.3C3.99619 14.3 1.7 12.0038 1.7 8C1.7 3.99619 3.99619 1.7 8 1.7C12.0038 1.7 14.3 3.99619 14.3 8C14.3 12.0038 12.0038 14.3 8 14.3Z" fill="#17171A"/>' +
    '<path d="M8.35 5.375C8.63995 5.375 8.875 5.13995 8.875 4.85C8.875 4.56005 8.63995 4.325 8.35 4.325C8.06005 4.325 7.825 4.56005 7.825 4.85C7.825 5.13995 8.06005 5.375 8.35 5.375Z" fill="#17171A"/>' +
    '<path d="M8.7 5.9H6.6V6.6H8V10.1H6.6V10.8H10.1V10.1H8.7V5.9Z" fill="#17171A"/>' +
    "</svg></span>";

  // ─── INJETAR CSS ─────────────────────────────────────
  function injectCss() {
    var css =
      "<style>" +
      ".Glyph--plus,.AddToBagButtonSmall__icon-sign,.primeContainer{display:none!important;}" +
      ".assinaturaPLPflag{background:none!important;color:#876C43!important;font-size:14px!important;font-weight:bold!important;display:flex;align-items:center;gap:4px;margin:5px 0 8px;}" +
      ".assinaturaPLPflag svg{flex-shrink:0;margin-bottom:-2px;}" +
      "._container_1koqr_35 .AddToBagButtonSmall__quantity{display:none!important;}" +
      ".assinaturaPLP{display:none;}" +
      "._container_1koqr_35{position:relative!important;padding-bottom:44px!important;}" +
      ".cardCustomButtonAdd{position:absolute!important;bottom:0;left:0;right:0;margin:0!important;padding:12px 0!important;width:auto!important;background:#00754a;color:#fff;font-weight:bold;border-radius:0 0 16px 16px!important;text-align:center;box-sizing:border-box;}" +
      ".cardCustomButtonAdd:hover{background:#257a57c7!important;}" +
      "plp-cards-grid article[data-product-short-sku] .QuantitySelector__popin{margin-top:90px !important;}" +
      ".dp-OAC-cta{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:16px 24px;height:48px;background:#8a582f;border-radius:48px;border:0;color:#fff!important;text-transform:uppercase;box-sizing:border-box;font-weight:500;font-size:16px;line-height:16px;letter-spacing:1px;text-decoration:none!important;margin:1em auto 0;cursor:pointer;transition:background .2s;}" +
      ".dp-OAC-cta:hover{background:#6d431f!important;}" +
      "._purchaseSection_1koqr_27{padding:0!important;}" +
      "#nespresso-welcome-offer-modal-gen-content .title-modal{font-size:16px;}" +
      "#" +
      CONFIG.MODAL_ID +
      "-close{color:black!important;}" +
      "#" +
      CONFIG.MODAL_ID +
      "-content{font-family:NespressoLucas!important;color:#17171A;line-height:1.5;}" +
      "#" +
      CONFIG.MODAL_ID +
      "-content h2{margin-top:0;font-size:20px;color:#17171A;text-align:center;}" +
      "#" +
      CONFIG.MODAL_ID +
      "-content ol{padding-left:1.2em;margin:1em 0;color:#17171A;}" +
      "#" +
      CONFIG.MODAL_ID +
      "-content li{margin-bottom:1em;color:#17171A;}" +
      "</style>";
    document.head.insertAdjacentHTML("beforeend", css);
  }

  // ─── MODAL ────────────────────────────────────────────
  function createModal() {
    if (document.getElementById(CONFIG.MODAL_ID)) return;
    var m = document.createElement("div");
    m.id = CONFIG.MODAL_ID;
    m.style =
      "position:fixed;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:3000;";
    m.innerHTML =
      '<div style="position:relative;background:#fff;padding:24px;border-radius:8px;max-width:500px;width:90%;box-sizing:border-box;">' +
      '<button id="' +
      CONFIG.MODAL_ID +
      '-close" style="position:absolute;top:12px;right:12px;border:none;background:none;font-size:24px;cursor:pointer;">&times;</button>' +
      '<div id="' +
      CONFIG.MODAL_ID +
      '-content">' +
      "<h2>Sua assinatura de cafés<br>em 3 passos simples</h2>" +
      "<ol>" +
      "<li><strong class='title-modal'>1. Selecione seus cafés</strong><br>Escolha seus sabores favoritos para receber em casa automaticamente. O <strong>DESCONTO DE 10% OFF</strong> e o <strong>FRETE GRÁTIS</strong> são disponibilizados para pedidos a partir de 30 cápsulas.</li>" +
      "<li><strong class='title-modal'>2. Defina a frequência</strong><br>Selecione a frequência que deseja receber os seus cafés: mensal, bimestral ou trimestral. Defina o endereço de entrega, escolha o método de entrega e pagamento mais adequados para você.</li>" +
      "<li><strong class='title-modal'>3. Aproveite seu Nespresso</strong><br>Seu pedido chegará no endereço e período escolhidos automaticamente. Você pode alterar os sabores e quantidade de cápsulas sempre que quiser.</li>" +
      "</ol>" +
      '<a href="/br/pt/myaccount/standing-orders#/orders/list" class="dp-OAC-cta">Comece agora</a>' +
      "</div></div>";
    document.body.appendChild(m);
    m.querySelector("#" + CONFIG.MODAL_ID + "-close").onclick = function () {
      m.style.display = "none";
    };
    m.onclick = function (e) {
      if (e.target === m) m.style.display = "none";
    };
  }
  function openModal() {
    var m = document.getElementById(CONFIG.MODAL_ID);
    if (m) m.style.display = "flex";
  }

  // ─── PROCESSA CADA CARD ───────────────────────────────
  function processCard(card) {
    if (card.classList.contains(CONFIG.PROCESSED_CLASS)) return;
    var full = card.querySelector(CONFIG.SELECTORS.FULL_PRICE),
      qty = card.querySelector(CONFIG.SELECTORS.QTY_LABEL),
      per = card.querySelector(CONFIG.SELECTORS.PER_PRICE);
    if (!full || !qty || !per) return;

    var wrapper = card.querySelector('div[class*="_priceLabelWrapper_"]');
    if (wrapper && !card.querySelector(".assinaturaPLPflag")) {
      var fv = Utils.parsePrice(Utils.extractNum(full.textContent)),
        qv = parseInt(Utils.extractNum(qty.textContent), 10);
      var cardKit =
        card.getAttribute("aria-label").includes("Kit") ||
        card.getAttribute("aria-label").includes("KIT");
      var flagsCard = card.querySelectorAll("header div[class*='tagBox']");
      var hasFlag = false;
      flagsCard.forEach((flag) => {
        if (flag.innerText.includes("EDIÇÃO LIMITADA")) {
          hasFlag = true;
        }
      });
      if (fv && qv && !cardKit && !hasFlag) {
        var selo = document.createElement("div");
        selo.className = "_capsuleSleeveLabel_10cre_45 assinaturaPLPflag";
        selo.innerHTML =
          "<span>" +
          CONFIG.CURRENCY +
          Utils.formatPrice(fv * 0.9) +
          "</span> na Assinatura " +
          INFO_SVG;
        wrapper.insertAdjacentElement("afterend", selo);
        selo
          .querySelector(".info-icon")
          .addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openModal();
          });
      }
    }

    if (!card.querySelector(".cardCustomButtonAdd")) {
      var btn = document.createElement("button");
      btn.className = "cardCustomButtonAdd";
      btn.type = "button";
      btn.textContent = "ADICIONAR";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var native = card.querySelector(CONFIG.SELECTORS.ADD_BTN);
        if (native) native.click();
      });
      per.insertAdjacentElement("afterend", btn);
    }

    card.classList.add(CONFIG.PROCESSED_CLASS);
  }

  // ─── PROCESSA TODOS QUANDO CHAMADO ────────────────────
  function processAll() {
    document
      .querySelectorAll(CONFIG.SELECTORS.PRODUCT_CARD)
      .forEach(processCard);
  }

  // ─── OBSERVER NO CONTAINER DE CARDS ─────────────────────────
  function observeContainer(container) {
    var deb = Utils.debounce(function () {
      document
        .querySelectorAll(CONFIG.SELECTORS.PRODUCT_CARD)
        .forEach(processCard);
    }, 150);

    var mo = new MutationObserver(function (mutations) {
      if (mutations.some((m) => m.addedNodes && m.addedNodes.length)) deb();
    });
    mo.observe(container, { childList: true, subtree: true });
    window.addEventListener("beforeunload", () => mo.disconnect());
  }

  // ─── INIT ─────────────────────────────────────────────
  function init(container) {
    injectCss();
    createModal();
    processAll(); // roda nos cards que já vieram de cara
    observeContainer(container); // escuta **tudo** que for inserido depois
  }

  (function waitForPLP() {
    var sel = CONFIG.PRODUCTS_CONTAINER_SELECTOR;
    var container = document.querySelector(sel);
    if (container) {
      init(container);
    } else {
      // tenta a cada 100ms até achar
      setTimeout(waitForPLP, 100);
    }
  })();
})();
