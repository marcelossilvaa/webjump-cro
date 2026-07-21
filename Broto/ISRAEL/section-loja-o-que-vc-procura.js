(function () {
  "use strict";

  const STYLE_ID = "at-o-que-procura-blue-style";
  const CLICK_ATTR = "data-oqp-click-added";
  const ICON_ATTR = "data-oqp-icon-swapped";
  const PAGE_BODY_CLASS = "category-loja";
  const CONTAINER_SELECTOR =
    ".categories-most-accessed .slider-wrapper-categories";
  const MAX_RETRIES = 40;
  const RETRY_INTERVAL = 250;

  const ICON_MAP = {
    Tratores: "https://broto.com.br/media/wysiwyg/tratores_2.svg",
    Máquinas: "https://broto.com.br/media/wysiwyg/maquinas_2.svg",
    Implementos: "https://broto.com.br/media/wysiwyg/implementos_2.svg",
    Irrigação: "https://broto.com.br/media/wysiwyg/irrigacao.svg",
    Insumos: "https://broto.com.br/media/wysiwyg/insumos_2.svg",
    Energia: "https://broto.com.br/media/wysiwyg/energia_2.svg",
    "Produtos usados": "https://broto.com.br/media/wysiwyg/produtos-usados.svg",
    "Agricultura de precisão":
      "https://broto.com.br/media/wysiwyg/agricultura-precisao.svg",
  };

  const LONG_TITLE_ATTR = "data-oqp-long-title";
  const LONG_TITLES = ["Armazenagem e Infraestrutura"];

  let viewLogged = false;
  let retryCount = 0;
  let pollTimer = null;

  function getCss() {
    return [
      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item {",
      "  background-color: #465EFF !important;",
      "  border: none !important;",
      "  border-radius: 0.25rem !important;",
      "  box-sizing: border-box !important;",
      "  overflow: hidden !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item a {",
      "  box-sizing: border-box !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image::before {",
      "  display: none !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image {",
      "  background-color: transparent !important;",
      "  border: none !important;",
      "  border-radius: 0 !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title {",
      "  position: static !important;",
      "  top: auto !important;",
      "  bottom: auto !important;",
      "  left: auto !important;",
      "  right: auto !important;",
      "  opacity: 1 !important;",
      "  overflow: visible !important;",
      "  width: auto !important;",
      "  display: block !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title p {",
      "  color: #FFFFFF !important;",
      '  font-family: "Inter Variable", "Helvetica Neue", Helvetica, Arial, sans-serif !important;',
      "  font-weight: 400 !important;",
      "  margin: 0 !important;",
      "  overflow-wrap: normal !important;",
      "  word-break: keep-all !important;",
      "  hyphens: none !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .slider-footer {",
      "  display: none !important;",
      "}",

      "@media (max-width: 767px) {",
      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group {",
      "    padding-right: 16px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item {",
      "    width: 158px !important;",
      "    height: 58px !important;",
      "    margin-right: 8px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item a {",
      "    flex-direction: row !important;",
      "    align-items: center !important;",
      "    gap: 8px !important;",
      "    padding: 0px 11px !important;",
      "    width: 100% !important;",
      "    height: 100% !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image {",
      "    width: 20px !important;",
      "    height: 20px !important;",
      "    min-height: 20px !important;",
      "    max-height: none !important;",
      "    margin: 0 !important;",
      "    flex-shrink: 0 !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image img {",
      "    width: 20px !important;",
      "    height: 20px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title {",
      "    padding: 0 !important;",
      "    min-height: auto !important;",
      "    height: auto !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title p {",
      "    font-size: 14px !important;",
      "    line-height: 16px !important;",
      "    text-align: left !important;",
      "    white-space: normal !important;",
      "  }",
      "}",

      "@media (min-width: 768px) {",
      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item {",
      "    width: 118.06px !important;",
      "    height: 120px !important;",
      "    margin-right: 16px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item a {",
      "    flex-direction: column !important;",
      "    align-items: flex-start !important;",
      "    justify-content: space-between !important;",
      "    gap: 8px !important;",
      "    padding: 16px !important;",
      "    width: 100% !important;",
      "    height: 100% !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image {",
      "    width: 32px !important;",
      "    height: 32px !important;",
      "    min-height: 32px !important;",
      "    max-height: none !important;",
      "    margin: 0 !important;",
      "    flex-shrink: 0 !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image img {",
      "    width: 32px !important;",
      "    height: 32px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title {",
      "    padding: 0 !important;",
      "    min-height: auto !important;",
      "    height: auto !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title p {",
      "    font-size: 14px !important;",
      "    line-height: 1.25rem !important;",
      "    text-align: left !important;",
      "    white-space: normal !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item[" +
        LONG_TITLE_ATTR +
        "] .slider-item-title p {",
      "    font-size: 12px !important;",
      "    line-height: 1rem !important;",
      "  }",
      "}",
    ].join("\n");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);

    console.log(
      "[AT O que voce procura] Estilo azul aplicado aos cards do carrossel",
    );
  }

  function trackView() {
    if (viewLogged) return;
    viewLogged = true;
    console.log(
      "[AT O que voce procura] Secao com novo layout azul visualizada",
    );
  }

  function handleCardClick(event) {
    const titleEl = event.currentTarget.querySelector(".slider-item-title p");
    const label = titleEl ? titleEl.textContent : "desconhecido";
    console.log("[AT O que voce procura] Clique no card: " + label);
  }

  function addClickTracking(container) {
    const links = container.querySelectorAll(".slider-item a");

    links.forEach(function (link) {
      if (link.getAttribute(CLICK_ATTR)) return;
      link.setAttribute(CLICK_ATTR, "true");
      link.addEventListener("click", handleCardClick);
    });
  }

  function replaceIcons(container) {
    const links = container.querySelectorAll(".slider-item a");

    links.forEach(function (link) {
      const img = link.querySelector(".slider-item-image img");
      if (!img || img.getAttribute(ICON_ATTR)) return;

      const title = link.getAttribute("title") || "";
      const newSrc = ICON_MAP[title];

      img.setAttribute(ICON_ATTR, "true");

      if (newSrc) {
        img.src = newSrc;
      } else {
        console.warn(
          '[AT O que voce procura] Sem icone novo mapeado para "' +
            title +
            '", mantendo o icone original',
        );
      }
    });
  }

  function markLongTitles(container) {
    const links = container.querySelectorAll(".slider-item a");

    links.forEach(function (link) {
      const item = link.closest(".slider-item");
      if (!item) return;

      const title = link.getAttribute("title") || "";
      if (LONG_TITLES.indexOf(title) !== -1) {
        item.setAttribute(LONG_TITLE_ATTR, "true");
      }
    });
  }

  function triggerCarouselReflow() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 150);
  }

  function run() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return false;

    injectStyles();
    trackView();
    addClickTracking(container);
    replaceIcons(container);
    markLongTitles(container);
    triggerCarouselReflow();
    return true;
  }

  function init() {
    if (!document.body.classList.contains(PAGE_BODY_CLASS)) {
      console.log(
        "[AT O que voce procura] Pagina nao e /loja.html (sem classe " +
          PAGE_BODY_CLASS +
          "), script ignorado",
      );
      return;
    }

    if (run()) return;

    pollTimer = setInterval(function () {
      retryCount++;
      const found = run();
      if (found || retryCount >= MAX_RETRIES) {
        clearInterval(pollTimer);
        if (!found) {
          console.warn(
            "[AT O que voce procura] Container " +
              CONTAINER_SELECTOR +
              " nao encontrado apos " +
              MAX_RETRIES +
              " tentativas",
          );
        }
      }
    }, RETRY_INTERVAL);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
