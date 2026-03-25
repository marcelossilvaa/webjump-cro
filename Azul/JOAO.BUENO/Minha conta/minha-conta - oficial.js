(function () {
  // ───── CONFIGURAÇÃO ─────
  var SETTINGS = {
    reservationSelector: ".css-1pw8dxs",
    cardSelector: ".reservation-card",
    componentId: "azul-cta-fidelidade",
    titleText: "Ainda não é cadastrado no nosso programa de fidelidade?",
    descriptionText:
      "Junte-se agora ao nosso programa <span style='font-weight: bold;'> Azul Fidelidade</span>, acumule pontos e aproveite benefícios exclusivos em suas viagens.",
    buttonText: "Cadastre-se",
    buttonUrl: "/br/pt/cadastro.html",
    desktopImageUrl: "https://i.imgur.com/XsCSQtd.png",
    mobileBreakpoint: 768,
    maxAttempts: 20,
    attemptInterval: 500,
    registerPromptSelector:
      "div.sc-eqhNQH.bYCANP .richTextContainer[data-rte-editelement] .rte-small",
  };

  // ───── INJETAR CSS ─────
  function injectStyles() {
    if (document.getElementById("style-" + SETTINGS.componentId)) return;
    var style = document.createElement("style");
    style.id = "style-" + SETTINGS.componentId;

    var rules = [
      /* Container principal */
      "#" + SETTINGS.componentId + " {",
      "position: relative;",
      "display: flex;",
      "align-items: center;",
      "z-index: 1000;",
      "background-color: #026CB6;",
      "border-radius: 8px;",
      "margin-top: 16px;",
      "font-family: 'Helvetica Neue', Arial !important;",
      "box-shadow: rgba(4, 30, 66, 0.16) 0px 4px 16px;",
      "box-sizing: border-box;",
      "height: 200px;",
      "}",

      "#" + SETTINGS.componentId + " .cta-inner {",
      "display: flex;",
      "flex-direction: row;",
      "align-items: center;",
      "justify-content: space-between;",
      "gap: 16px;",
      "padding: 20px 22px 20px 22px;",
      "width: 100%;",
      "}",

      "#" + SETTINGS.componentId + " .cta-header {",
      "display: flex;",
      "align-items: center;",
      "gap: 8px;",
      "}",

      /* Texto principal */
      "#" + SETTINGS.componentId + " .cta-text {",
      "flex: 1 1 auto;",
      "margin-right: 112px;",
      "}",

      /* Título */
      "#" + SETTINGS.componentId + " .cta-title {",
      "margin: 8px 0 6px;",
      "font-size: 20px;",
      "font-weight: 600;",
      "color: #ffffff;",
      "margin-bottom: 19px",
      "}",

      /* Descrição */
      "#" + SETTINGS.componentId + " .cta-desc {",
      "margin: 0 0 12px;",
      "font-size: 14px;",
      "color: #ffffff !important;",
      "color: #333;",
      "margin-bottom: 19px",
      "}",

      // Componentes nativos de incentivo cadastro
      ".sc-gyKfoT.gRSdXt, .sc-iNezeW.bHNviI {",
      "display: none;",
      "}",

      ".sc-yTtWT.chYpQP {",
      "border-bottom: 1px solid rgba(0, 0, 0, 0.15) !important;",
      "}",

      /* Botão */
      "#" + SETTINGS.componentId + " .cta-button {",
      "display: inline-block;",
      "background-color: #ffffff;",
      "color: #026CB6;",
      "border: none;",
      "border-radius: 4px;",
      "padding: 14px 16px 14px 16px;",
      "font-size: 16px;",
      "cursor: pointer;",
      "text-decoration: none;",
      "line-height: 9px;",
      "text-align: center;",
      "height: 36px;",
      "width: 171px;",
      "}",

      "#" + SETTINGS.componentId + " .cta-button:hover {",
      "background-color: #f8f8f8;",
      "}",

      "#" + SETTINGS.componentId + " .cta-img-desktop {",
      "width: 139px;",
      "height: auto;",
      "flex-shrink: 0;",
      "display: block;",
      "}",

      "#" + SETTINGS.componentId + " .cta-mobile-icon {",
      "display: none;",
      "vertical-align: middle;",
      "}",

      /* MEDIA QUERY: mobile */
      "@media (max-width:" + SETTINGS.mobileBreakpoint + "px) {",

      "#" + SETTINGS.componentId + " .cta-inner {",
      "display: flex;",
      "flex-direction: column;",
      "align-items: flex-start;",
      "gap: 12px;",
      "padding: 20px 16px 20px 20px;",
      "}",

      "#" + SETTINGS.componentId + " {",
      "display: flex;",
      "flex-direction: column;",
      "align-items: stretch;",
      "margin-bottom: 16px;",
      "box-sizing: border-box;",
      "border-radius: 8px;",
      "height: auto;",
      "}",

      "#" + SETTINGS.componentId + " .cta-header {",
      "display: flex;",
      "align-items: center;",
      "justify-content: flex-start;",
      "width: 100%;",
      "gap: 0px;",
      "}",

      "#" + SETTINGS.componentId + " .cta-mobile-icon {",
      "display: none;",
      "width: 24px;",
      "height: 24px;",
      "margin-right: 8px;",
      "overflow: visible;",
      "flex-shrink: 0;",
      "}",

      "#" + SETTINGS.componentId + " .cta-text {",
      "text-align: left;",
      "margin: 0;",
      "max-width: none;",
      "width: 100%;",
      "}",

      "#" + SETTINGS.componentId + " .cta-title {",
      "margin: 0;",
      "font-size: 16px;",
      "font-weight: 600;",
      "line-height: 24px;",
      "color: #ffffffff;",
      "}",

      "#" + SETTINGS.componentId + " .cta-desc {",
      "display: block;",
      "margin: 0;",
      "width: 100%;",
      "text-align: left;",
      "padding-bottom: 20px;",
      "}",

      "#" + SETTINGS.componentId + " .cta-button {",
      "display: block;",
      "width: 136px;",
      "height: 36px;",
      "margin: 0;",
      "align-self: center;",
      "font-size: 16px;",
      "align-self: flex-start;",
      "}",

      "#" + SETTINGS.componentId + " .cta-img-desktop {",
      "display: none;",
      "}",

      "}",
    ];

    style.innerHTML = rules.join("");
    document.head.appendChild(style);
  }

  // ───── CRIAR O COMPONENTE ─────
  function createComponent() {
    var comp = document.createElement("div");
    comp.id = SETTINGS.componentId;
    comp.className = "fidelidade-cta";

    var html = "";

    // desktop
    if (window.innerWidth > SETTINGS.mobileBreakpoint) {
      html += '<div class="cta-inner">';

      // texto
      html += '<div class="cta-text">';
      html += '<p class="cta-title">' + SETTINGS.titleText + "</p>";
      html += '<p class="cta-desc">' + SETTINGS.descriptionText + "</p>";
      html +=
        '<a href="' +
        SETTINGS.buttonUrl +
        '" class="cta-button">' +
        SETTINGS.buttonText +
        "</a>";
      html += "</div>";

      html +=
        '<img class="cta-img-desktop" src="' +
        SETTINGS.desktopImageUrl +
        '" alt="" aria-hidden="true">';

      html += "</div>";
    } else {
      // mobile
      html += '<div class="cta-inner">';

      // ícone mobile ao lado do título
      html += '<div class="cta-header">';
      // html += '<span class="cta-mobile-icon" aria-hidden="true">';
      // html +=
      //   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">';
      // html +=
      //   '<path d="M20.2 12C20.2 16.5287 16.5287 20.2 12 20.2C7.47121 20.2 3.79995 16.5287 3.79995 12C3.79995 7.47126 7.47121 3.8 12 3.8C16.5287 3.8 20.2 7.47126 20.2 12ZM12 21.05C16.9982 21.05 21.0499 16.9982 21.0499 12C21.0499 7.00182 16.9982 2.95 12 2.95C7.00177 2.95 2.94995 7.00182 2.94995 12C2.94995 16.9982 7.00177 21.05 12 21.05Z" fill="#ffffffff" stroke="#ffffffff" stroke-width="0.1"/>';
      // html +=
      //   '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 14.25C12.4142 14.25 12.75 13.9142 12.75 13.5V8.25C12.75 7.83579 12.4142 7.5 12 7.5C11.5858 7.5 11.25 7.83579 11.25 8.25V13.5C11.25 13.9142 11.5858 14.25 12 14.25Z" fill="#ffffffff" stroke="#ffffffff" stroke-width="0.1"/>';
      // html +=
      //   '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5C12.75 16.0858 12.4142 15.75 12 15.75C11.5858 15.75 11.25 16.0858 11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25Z" fill="#ffffffff" stroke="#ffffffff" stroke-width="0.1"/>';
      // html += "</svg>";
      // html += "</span>";
      html += '<p class="cta-title">' + SETTINGS.titleText + "</p>";
      html += "</div>";

      html += '<p class="cta-desc">' + SETTINGS.descriptionText + "</p>";

      html +=
        '<a href="' +
        SETTINGS.buttonUrl +
        '" class="cta-button">' +
        SETTINGS.buttonText +
        "</a>";

      html +=
        '<img class="cta-img-desktop" src="' +
        SETTINGS.desktopImageUrl +
        '" aria-hidden="true">';

      html += "</div>";
    }

    comp.innerHTML = html;
    return comp;
  }

  // retorna true se existir botão com texto exato "Realizar cadastro"
  function hasRegisterButtonText() {
    return Array.from(document.body.querySelectorAll("button")).some(
      (btn) => btn.textContent.trim() === "Realizar cadastro"
    );
  }

  function userNeedsRegistration() {
    var promptExists = !!document.querySelector(
      SETTINGS.registerPromptSelector
    );
    // nova garantia:
    var buttonExists = hasRegisterButtonText();
    return promptExists || buttonExists;
  }
  function tryInsert() {
    if (!userNeedsRegistration()) return false;

    var parent = document.querySelector(SETTINGS.reservationSelector);
    if (!parent) return false;
    if (!document.getElementById(SETTINGS.componentId)) {
      var cmp = createComponent();
      parent.parentNode.insertBefore(cmp, parent);
    }
    return true;
  }

  // ───── MANTÉM LARGURA NAS ALTERAÇÕES ─────
  function syncCTAWidth() {
    var card = document.querySelector(SETTINGS.cardSelector);
    if (!card) return;
    var w = card.getBoundingClientRect().width;
    var cmp = document.getElementById(SETTINGS.componentId);
    if (cmp) cmp.style.width = w + "px";
  }

  var resizeObserver = null;

  function observeResize() {
    var container = document.querySelector(SETTINGS.reservationSelector);
    if (!container || !window.ResizeObserver) return;
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(syncCTAWidth);
    }
    resizeObserver.observe(container);
  }

  function initWidthSync() {
    syncCTAWidth();

    // observa mudanças no próprio container
    observeResize();

    // fallback para resize da janela
    window.addEventListener("resize", syncCTAWidth);

    setInterval(syncCTAWidth, SETTINGS.attemptInterval);
  }

  // ───── EXECUÇÃO ─────
  injectStyles();
  if (tryInsert()) {
    initWidthSync();
  } else {
    var tries = 0,
      t;
    t = setInterval(function () {
      if (tryInsert() || tries++ >= SETTINGS.maxAttempts) {
        clearInterval(t);
        initWidthSync();
      }
    }, SETTINGS.attemptInterval);
  }
})();
