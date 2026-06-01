(function () {
  // ───── CONFIGURAÇÃO ─────
  var SETTINGS = {
    reservationSelector: ".css-1pw8dxs",
    cardSelector: ".reservation-card",
    componentId: "azul-cta-fidelidade",
    titleText: "Ainda não é cadastrado?",
    descriptionText:
      "Junte-se agora ao nosso programa de fidelidade Azul, acumule pontos e aproveite benefícios exclusivos em suas viagens.",
    buttonText: "Cadastre-se",
    buttonUrl: "https://www.voeazul.com.br/minha-conta",
    desktopImageUrl: "https://i.imgur.com/XsCSQtd.png",
    mobileBreakpoint: 768,
    maxAttempts: 20,
    attemptInterval: 500,
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
      "background-color: #fef8ed;",
      "border-radius: 8px;",
      "margin-top: 16px;",
      "font-family: 'Helvetica Neue', Arial !important;",
      "box-shadow: rgba(4, 30, 66, 0.16) 0px 4px 16px;",
      "box-sizing: border-box;",
      "height: 200px;",
      "}",

      /* Flex interno */
      "#" + SETTINGS.componentId + " .cta-inner {",
      "display: flex;",
      "align-items: center;",
      "justify-content: space-between;",
      "gap: 16px;",
      "padding: 20px 22px 20px 22px;",
      "width: 100%;",
      "}",

      /* Texto principal */
      "#" + SETTINGS.componentId + " .cta-text {",
      "flex: 1 1 auto;",
      /* desktop: deixa espaço para SVG de 96px + gap 16px */
      "margin-right: 112px;",
      "}",

      /* Título */
      "#" + SETTINGS.componentId + " .cta-title {",
      "margin: 8px 0 6px;" /* espaçamento extra em cima */,
      "font-size: 20px;",
      "font-weight: 400;",
      "color: #041E42;",
      "margin-bottom: 19px",
      "}",

      /* Descrição */
      "#" + SETTINGS.componentId + " .cta-desc {",
      "margin: 0 0 12px;",
      "font-size: 14px;",
      "color: #606060 !important;",
      "color: #333;",
      "margin-bottom: 19px",
      "}",

      /* Botão */
      "#" + SETTINGS.componentId + " .cta-button {",
      "display: inline-block;",
      "background-color: #026CB6;",
      "color: #fff;",
      "border: none;",
      "border-radius: 4px;",
      "padding: 14px 16px 14px 16px;",
      "font-size: 14px;",
      "cursor: pointer;",
      "text-decoration: none;",
      "line-height: 16px;",
      "text-align: center;",
      "height: 48px;",
      "width: 174px;",
      "}",

      /* Ilustração desktop (direita) */
      "#" + SETTINGS.componentId + " .cta-img-desktop {",
      "width: 139px;",
      "height: auto;",
      "flex-shrink: 0;",
      "display: block;",
      "}",

      /* Ícone ao lado do título (mobile only) */
      "#" + SETTINGS.componentId + " .cta-mobile-icon {",
      "display: none;",
      "margin-right: 8px;",
      "vertical-align: middle;",
      "}",

      /* MEDIA QUERY: mobile */
      "@media (max-width:" + SETTINGS.mobileBreakpoint + "px) {",

      /* container empilhado */
      "#" + SETTINGS.componentId + " {",
      "flex-direction: column;",
      "align-items: flex-start;",
      "}",

      /* flex interno vertical */
      "#" + SETTINGS.componentId + " .cta-inner {",
      "flex-direction: column;",
      "align-items: stretch;",
      "}",

      /* libera toda largura para texto */
      "#" + SETTINGS.componentId + " .cta-text {",
      "margin-right: 0;",
      "max-width: none;",
      "}",

      /* mostra o ícone antes do título */
      "#" + SETTINGS.componentId + " .cta-mobile-icon {",
      "display: inline-block;",
      "}",

      /* esconde ilustração desktop */
      "#" + SETTINGS.componentId + " .cta-img-desktop {",
      "display: none;",
      "}",

      /* botão full width */
      "#" + SETTINGS.componentId + " .cta-button {",
      "width: 100%;",
      "text-align: center;",
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
    html += '<div class="cta-inner">';

    // ícone mobile ao lado do título
    html += '<span class="cta-mobile-icon" aria-hidden="true">';
    html +=
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">';
    html +=
      '<path d="M20.2 12C20.2 16.5287 16.5287 20.2 12 20.2C7.47121 20.2 3.79995 16.5287 3.79995 12C3.79995 7.47126 7.47121 3.8 12 3.8C16.5287 3.8 20.2 7.47126 20.2 12ZM12 21.05C16.9982 21.05 21.0499 16.9982 21.0499 12C21.0499 7.00182 16.9982 2.95 12 2.95C7.00177 2.95 2.94995 7.00182 2.94995 12C2.94995 16.9982 7.00177 21.05 12 21.05Z" fill="#041E42" stroke="#041E42" stroke-width="0.1"/>';
    html +=
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 14.25C12.4142 14.25 12.75 13.9142 12.75 13.5V8.25C12.75 7.83579 12.4142 7.5 12 7.5C11.5858 7.5 11.25 7.83579 11.25 8.25V13.5C11.25 13.9142 11.5858 14.25 12 14.25Z" fill="#041E42" stroke="#041E42" stroke-width="0.1"/>';
    html +=
      '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5C12.75 16.0858 12.4142 15.75 12 15.75C11.5858 15.75 11.25 16.0858 11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25Z" fill="#041E42" stroke="#041E42" stroke-width="0.1"/>';
    html += "</svg>";
    html += "</span>";

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

    // ilustração desktop
    html +=
      '<img class="cta-img-desktop" src="' +
      SETTINGS.desktopImageUrl +
      '" alt="" aria-hidden="true">';

    html += "</div>";

    comp.innerHTML = html;
    return comp;
  }

  // ───── TENTA INSERIR ACIMA ─────
  function tryInsert() {
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
    // ajuste imediato
    syncCTAWidth();

    // observa mudanças no próprio container
    observeResize();

    // fallback para resize da janela
    window.addEventListener("resize", syncCTAWidth);

    // polling contínuo (sem clearInterval) para garantir chamadas pós-toggle
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
