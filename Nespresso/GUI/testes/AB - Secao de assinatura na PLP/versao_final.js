(function () {
  "use strict";
  if (window.sectionAssinaturaAB) return;
  window.sectionAssinaturaAB = true;

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
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "bloco_assinatura_plp", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  var CSS = `
    .nespresso-assinatura-plp-section {
      max-width: 1200px;
      margin: 0px auto 40px;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .nespresso-assinatura-plp-block {
      display: flex;
      align-items: stretch;
      background: #F5F0EB;
      border-radius: 16px;
      padding: 48px 70px;
      position: relative;
      overflow: hidden;
      gap: 80px;
    }
    .nespresso-assinatura-plp-block::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 220px;
      background: url('https://www.nespresso.com/ecom/medias/sys_master/public/31794307399710/Desktop-Original-.png') no-repeat top right;
      background-size: contain;
      pointer-events: none;
      z-index: 3;
    }
    .nespresso-assinatura-plp-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      z-index: 1;
    }
    .nespresso-assinatura-plp-left h2 {
      font-family: 'NespressoLucas', Arial, sans-serif;
      font-size: 28px;
      font-weight: 400;
      line-height: 1.25;
      color: #212121;
      margin: 0 0 12px 0;
      max-width: 390px;
    }
    .nespresso-assinatura-plp-left p {
      font-family: 'NespressoLucas', Arial, sans-serif;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.5;
      color: #555;
      margin: 0 0 28px 0;
      max-width: 380px;
    }
    .nespresso-assinatura-plp-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #247A57;
      color: #fff;
      font-family: 'NespressoLucas', Arial, sans-serif;
      font-size: 20px;
      font-weight: 400;
      padding: 14px 36px;
      border-radius: 30px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      width: fit-content;
    }
    .nespresso-assinatura-plp-cta:hover {
      background: #1a5e42;
    }
    .nespresso-assinatura-plp-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
      z-index: 1;
      max-width: 480px;
    }
    .nespresso-assinatura-plp-benefit {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(4px);
    }
    .nespresso-assinatura-plp-benefit:first-child {
      border-radius: 12px 12px 0 0;
    }
    .nespresso-assinatura-plp-benefit:last-child {
      border-radius: 0 0 12px 12px;
    }
    .nespresso-assinatura-plp-benefit:not(:last-child) {
      border-bottom: 1px solid #e5d5bb;
    }
    .nespresso-assinatura-plp-benefit-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nespresso-assinatura-plp-benefit-icon svg {
      width: 40px;
      height: 40px;
    }
    .nespresso-assinatura-plp-benefit-text {
      font-family: 'NespressoLucas', Arial, sans-serif;
      font-size: 16px;
      color: #17171a;
      line-height: 1.45;
    }
    .nespresso-assinatura-plp-benefit-text strong {
      font-weight: 700;
    }

    .nespresso-assinatura-plp-disclaimer {
      display: block;
      font-family: 'NespressoLucas', Arial, sans-serif;
      font-size: 14px;
      text-align: center;
      color: #636363;
      margin-top: 12px;
    }

    /* Mobile */
    @media (max-width: 767px) {
      .nespresso-assinatura-plp-section {
        margin: 24px auto;
        padding: 0 12px;
      }
      .nespresso-assinatura-plp-block {
        flex-direction: column;
        padding: 32px 24px 28px;
        gap: 24px;
      }
      .nespresso-assinatura-plp-block::after {
        width: 160px;
        height: 120px;
      }
      .nespresso-assinatura-plp-left h2 {
        font-size: 22px;
        max-width: 260px;
      }
      .nespresso-assinatura-plp-left p {
        font-size: 14px;
        max-width: 300px;
        margin-bottom: 0;
      }
      .nespresso-assinatura-plp-right {
        max-width: 100%;
      }
      .nespresso-assinatura-plp-benefit {
        padding: 16px 18px;
      }
      .nespresso-assinatura-plp-cta-mobile {
        display: flex !important;
        margin-top: 0px;
      }
      .nespresso-assinatura-plp-cta-desktop {
        display: none !important;
      }
      .nespresso-assinatura-plp-cta {
        width: 100%;
        text-align: center;
        justify-content: center;
      }
      .nespresso-assinatura-plp-disclaimer {
        margin-top: 16px;
      }
    }
    @media (min-width: 768px) {
      .nespresso-assinatura-plp-cta-mobile {
        display: none !important;
      }
      .nespresso-assinatura-plp-cta-desktop {
        display: inline-flex !important;
      }
    }
  `;

  var HTML = `
    <div class="nespresso-assinatura-plp-section">
      <div class="nespresso-assinatura-plp-block">
        <div class="nespresso-assinatura-plp-left">
          <h2>Eleve sua experiência Nespresso com a nossa <strong>Assinatura de Café</strong></h2>
          <p>Configure um pedido automático do seu jeito e aproveite  benefícios exclusivos</p>
          <a href="https://www.nespresso.com/br/pt/myaccount/standing-orders" class="nespresso-assinatura-plp-cta nespresso-assinatura-plp-cta-desktop">Faça sua Assinatura</a>
        </div>
        <div class="nespresso-assinatura-plp-right">
          <div class="nespresso-assinatura-plp-benefit">
            <div class="nespresso-assinatura-plp-benefit-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#986f38"><path d="M15.7 3H3v12.7l15.5 15.5 12.7-12.7L15.7 3ZM4 15.3V4h11.3l14.5 14.5-11.3 11.3L4 15.3Z"></path><path d="m17.98 11-3 12h1.04l3-12h-1.04ZM12.5 12c-.93 0-2.5.39-2.5 3s1.57 3 2.5 3c.93 0 2.5-.39 2.5-3s-1.57-3-2.5-3Zm0 5c-.64 0-1.5-.2-1.5-2s.86-2 1.5-2 1.5.2 1.5 2-.86 2-1.5 2ZM21.5 16c-.93 0-2.5.39-2.5 3s1.57 3 2.5 3c.93 0 2.5-.39 2.5-3s-1.57-3-2.5-3Zm0 5c-.64 0-1.5-.2-1.5-2s.86-2 1.5-2 1.5.2 1.5 2-.86 2-1.5 2ZM6.5 7.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"></path></svg>            </div>
            <div class="nespresso-assinatura-plp-benefit-text">
              <strong>15% OFF*</strong> nos 3 primeiros pedidos acima de 30 cápsulas
            </div>
          </div>
          <div class="nespresso-assinatura-plp-benefit">
            <div class="nespresso-assinatura-plp-benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#986f38"><path d="M16 2.45 4 8.19v15.63l12 5.73 12-5.73V8.19L16 2.45Zm0 1.1L26.34 8.5l-4.2 2.01L11.8 5.57 16 3.55Zm-5.36 2.57 10.34 4.95L16 13.45 5.66 8.5l4.98-2.38ZM27 23.18l-10.5 5.03V25h-1v3.2L5 23.19V9.3l10.5 5.03V17h1v-2.68l5-2.4v3.33l1-.5v-3.3L27 9.29v13.9Z"></path><path d="M8.81 18.46V23h.96v-1.82h1.34v-.79H9.77v-1.14h1.87v-.79H8.81ZM15.84 19.95c0-1.28-.99-1.49-1.9-1.49h-1.39V23h.96v-1.55h.47l.97 1.55h1.16l-1.15-1.7c.46-.17.88-.59.88-1.35Zm-2.02.72h-.3v-1.44h.3c.49 0 1.03.08 1.03.72 0 .62-.48.72-1.03.72ZM17.91 21.08h1.3v-.8h-1.3v-1.03h1.85v-.79h-2.8V23h2.89v-.8H17.9v-1.12ZM21.77 19.25h1.85v-.79h-2.8V23h2.89v-.8h-1.94v-1.12h1.3v-.8h-1.3v-1.03Z"></path></svg>
            </div>
            <div class="nespresso-assinatura-plp-benefit-text">
              Frete Grátis
            </div>
          </div>
          <div class="nespresso-assinatura-plp-benefit">
            <div class="nespresso-assinatura-plp-benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="#986f38"><path d="M16.77 14H8v1h7.42c.41-.38.86-.72 1.35-1ZM8 17v1h5.44c.12-.34.26-.68.43-1H8ZM8 20v1h5.03c-.02-.17-.03-.33-.03-.5 0-.17.01-.33.03-.5H8ZM8 24h5.87a7.46 7.46 0 0 1-.43-1H8v1Z"></path><path d="M23 28.57c0 .24-.2.43-.43.43H5.43a.43.43 0 0 1-.43-.43V3.43c0-.24.2-.43.43-.43H10v1.5c0 .83.67 1.5 1.5 1.5h5c.83 0 1.5-.67 1.5-1.5V3h4.57c.24 0 .43.2.43.43v10c.34.13.68.27 1 .44V3.43C24 2.64 23.36 2 22.57 2H5.43C4.64 2 4 2.64 4 3.43v25.14c0 .79.64 1.43 1.43 1.43h17.14c.79 0 1.43-.64 1.43-1.43v-1.44c-.32.17-.66.31-1 .43v1ZM11 3h6v1.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5V3Z"></path><path d="M25.43 24.72a6.5 6.5 0 1 0-.7.7l4.92 4.93.7-.7-4.92-4.93ZM20.5 26a5.5 5.5 0 1 1 .01-11.01A5.5 5.5 0 0 1 20.5 26Z"></path><path d="M17 18.4v4.2l3.5 1.59 3.5-1.6v-4.18l-3.5-1.6-3.5 1.6Zm3 4.46-2-.91V19.5l2 .91v2.45Zm3-.91-2 .91v-2.45l2-.9v2.44Zm-2.5-2.4-1.8-.82 1.8-.82 1.8.82-1.8.81ZM20 8H8v1h12V8ZM20 11H8v1h12v-1Z"></path></svg>
            </div>
            <div class="nespresso-assinatura-plp-benefit-text">
              Flexibilidade para alterar quando quiser
            </div>
          </div>
          <div class="nespresso-assinatura-plp-benefit">
            <div class="nespresso-assinatura-plp-benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#986f38"><path d="M17.61 13.6A7.37 7.37 0 0 0 19 9c0-4.38-2.62-7-7-7S5 4.62 5 9c0 1.89.49 3.44 1.39 4.6l-3.46 6.93.76.43 2.5-.83.92 2.8.57.32 3.64-7.28a10.25 10.25 0 0 0 1.36 0l3.64 7.28.57-.33.93-2.79 2.5.83.75-.43-3.46-6.92ZM7.6 21.2l-.77-2.33-2.33.77 2.63-5.26a6.45 6.45 0 0 0 3.15 1.46L7.59 21.2ZM12 15c-3.87 0-6-2.13-6-6s2.13-6 6-6 6 2.13 6 6-2.13 6-6 6Zm5.18 3.87-.77 2.33-2.68-5.36a6.45 6.45 0 0 0 3.15-1.46l2.63 5.26-2.33-.77Z"></path><path d="m11.46 10.75-2.1-2.1-.71.7 2.9 2.9 4.34-5.44-.78-.62-3.65 4.56Z"></path></svg>
            </div>
            <div class="nespresso-assinatura-plp-benefit-text">
            Status Ambassador no Nespresso Club
            </div>
          </div>
          <span class="nespresso-assinatura-plp-disclaimer">*Após o 3° mês sua assinatura terá 10% OFF em todos os pedidos acima de 30 cápsulas. Oferta válida para Novos Assinantes</span>
        </div>
        <a href="https://www.nespresso.com/br/pt/myaccount/standing-orders" class="nespresso-assinatura-plp-cta nespresso-assinatura-plp-cta-mobile">Faça sua Assinatura</a>
      </div>
    </div>
  `;

  // ——————————————————————————————————————————————————————————————————————————————
  // CONFIGURAÇÃO — SEÇÃO ALVO POR VARIANTE (OL / VL)
  // ——————————————————————————————————————————————————————————————————————————————

  var TARGET_SECTIONS = {
    // Original
    ol: "nesclub2.br.b2c/cat/capsule-range-limited-edition",
    // Vertuo
    vl: "nesclub2.br.b2c/cat/capsule-range-MasterOrigin-vertuo",
  };

  var BLOCK_SELECTOR = ".nespresso-assinatura-plp-section";

  // ——————————————————————————————————————————————————————————————————————————————
  // ESTADO (ESPELHA O PADRÃO DO CARDS_PLP)
  // ——————————————————————————————————————————————————————————————————————————————

  var state = {
    initialized: false,
    currentFilterCount: null,
    productVariantKey: null,
  };

  var mutationObserver = null;
  var updateTimeout = null;

  // ——————————————————————————————————————————————————————————————————————————————
  // VARIANTE (Original / Vertuo) — DETECÇÃO
  // ——————————————————————————————————————————————————————————————————————————————

  function computeVariantKey() {
    var href = location.href.toLowerCase();
    if (href.indexOf("original") !== -1) return "ol";
    if (href.indexOf("vertuo") !== -1) return "vl";

    var grid = document.querySelector("plp-cards-grid");
    var sys = grid && grid.getAttribute("data-coffee-system");
    if (sys) {
      sys = sys.toLowerCase();
      if (sys.indexOf("original") !== -1) return "ol";
      if (sys.indexOf("vertuo") !== -1) return "vl";
    }

    return state.productVariantKey || "ol";
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // INJEÇÃO DE ESTILOS (ÚNICA)
  // ——————————————————————————————————————————————————————————————————————————————

  function injectStyles() {
    if (document.getElementById("nespresso-assinatura-plp-styles")) return;
    var style = document.createElement("style");
    style.id = "nespresso-assinatura-plp-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // INSERÇÃO E REMOÇÃO DO BLOCO
  // ——————————————————————————————————————————————————————————————————————————————

  function removeBlock() {
    var block = document.querySelector(BLOCK_SELECTOR);
    if (block) block.remove();
  }

  function insertBlock() {
    // Se já existe no DOM, não duplica
    if (document.querySelector(BLOCK_SELECTOR)) return;

    var targetId = TARGET_SECTIONS[state.productVariantKey];
    if (!targetId) return;

    var target = document.querySelector('section[data-id="' + targetId + '"]');
    if (!target) return;

    var wrapper = document.createElement("div");
    wrapper.innerHTML = HTML.trim();
    var section = wrapper.firstElementChild;
    target.parentNode.insertBefore(section, target.nextSibling);

    section
      .querySelectorAll(".nespresso-assinatura-plp-cta")
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          sendGAEvent("plp_faca_sua_assinatura");
        });
      });
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // ATUALIZAÇÃO PRINCIPAL (MESMA LÓGICA DO updateCards DO CARDS_PLP)
  // ——————————————————————————————————————————————————————————————————————————————

  function updateBlock() {
    var currentFilterCount =
      (document.querySelector("plp-explicit-filter") &&
        document
          .querySelector("plp-explicit-filter")
          .getAttribute("data-filter-counter")) ||
      "0";

    var filterChanged = currentFilterCount !== state.currentFilterCount;

    var newVariantKey = computeVariantKey();
    var variantChanged = newVariantKey !== state.productVariantKey;

    // Se mudou filtro ou variante, limpa e reconstrói
    if (filterChanged || variantChanged) {
      state.currentFilterCount = currentFilterCount;
      state.productVariantKey = newVariantKey;
      removeBlock();
    }

    // Só insere se não houver filtros ativos
    if (currentFilterCount === "0") {
      insertBlock();
    } else {
      removeBlock();
    }
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // OBSERVER OTIMIZADO (ESTRUTURA IDÊNTICA AO CARDS_PLP)
  // ——————————————————————————————————————————————————————————————————————————————

  function createOptimizedObserver() {
    if (mutationObserver) mutationObserver.disconnect();

    var plpCardsGridElement = document.querySelector("plp-cards-grid");
    if (!plpCardsGridElement) return false;

    mutationObserver = new MutationObserver(function (mutations) {
      var shouldUpdate = false;

      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];

        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-filter-counter"
        ) {
          shouldUpdate = true;
          break;
        }

        if (mutation.type === "childList") {
          var addedNodes = mutation.addedNodes;
          var removedNodes = mutation.removedNodes;
          var hasCollectionGridChanges = false;

          for (var j = 0; j < addedNodes.length; j++) {
            var node = addedNodes[j];
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node.classList.contains("collection-grid") ||
                (node.querySelector && node.querySelector(".collection-grid")))
            ) {
              hasCollectionGridChanges = true;
              break;
            }
          }

          if (!hasCollectionGridChanges) {
            for (var k = 0; k < removedNodes.length; k++) {
              var rNode = removedNodes[k];
              if (
                rNode.nodeType === Node.ELEMENT_NODE &&
                (rNode.classList.contains("collection-grid") ||
                  (rNode.querySelector &&
                    rNode.querySelector(".collection-grid")))
              ) {
                hasCollectionGridChanges = true;
                break;
              }
            }
          }

          if (hasCollectionGridChanges) {
            shouldUpdate = true;
            break;
          }
        }
      }

      if (shouldUpdate) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateBlock, 150);
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
    if (state.initialized) return;

    state.productVariantKey = computeVariantKey();

    injectStyles();
    updateBlock();
    createOptimizedObserver();

    state.initialized = true;
  }

  function waitForElementAndInitialize() {
    var checkForPlpElement = function () {
      var plpCardsGridElement = document.querySelector("plp-cards-grid");
      if (plpCardsGridElement) {
        initialize();
      } else {
        setTimeout(checkForPlpElement, 100);
      }
    };
    checkForPlpElement();
  }

  // Cleanup ao sair da página
  window.addEventListener("beforeunload", function () {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    clearTimeout(updateTimeout);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElementAndInitialize);
  } else {
    waitForElementAndInitialize();
  }
})();
