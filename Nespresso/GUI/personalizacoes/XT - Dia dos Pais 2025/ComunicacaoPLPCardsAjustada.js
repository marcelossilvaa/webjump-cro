(function () {
  // ——————————————————————————————————————————————————————————————————————————————
  // 1) Injeta CSS (banner + modal) de uma só vez
  // ——————————————————————————————————————————————————————————————————————————————
  if (!document.getElementById("nespresso-aeroccinoStyles")) {
    const styleElement = document.createElement("style");
    styleElement.id = "nespresso-aeroccinoStyles";
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
      }
      .tituloCardCrossSell{
        margin-bottom:14px;
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
      a.linkCardCrossSell{
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
      }

      article.banner-custom-inserido:not(:has(a.linkCardCrossSell)) .termsCrossSell{
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
      @media screen and (max-width: 480px){
        .tituloCardCrossSell, .paragrafoCardCrossSell{
          font-size:15px;
        }
      }

      /* ==================== Modal "Termos e Condições" ==================== */
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

      /* ==================== Garantir clicabilidade do link ==================== */
      .banner-custom-inserido div[class*="collectionDetails"]{position:relative;z-index:1}
      .termsCrossSell{position:relative;z-index:2;pointer-events:auto}
      .linkTermsAeroccino{position:relative;z-index:3;pointer-events:auto;color:#17171A;text-decoration:underline;cursor:pointer}
      .linkTermsAeroccino:hover{text-decoration:none}
    `;
    document.head.appendChild(styleElement);
  }

  // ——————————————————————————————————————————————————————————————————————————————
  // 2) Modal: criação e controle de eventos
  // ——————————————————————————————————————————————————————————————————————————————
  const MODAL_TERMS_CONDITIONS_ID =
    "nespresso-welcome-offer-modal-termos-condicoes";

  function createTermsModal() {
    if (document.getElementById(MODAL_TERMS_CONDITIONS_ID)) return;

    const modalElement = document.createElement("div");
    modalElement.id = MODAL_TERMS_CONDITIONS_ID;
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.innerHTML = `
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
            <strong>TERMOS E CONDIÇÕES</strong><br>
            <strong>OFERTA AEROCCINO 3 VERMELHO</strong><br><br>
            *Oferta válida por tempo limitado de 04/07/2025 até 31/07/2025, sujeita a alterações sem aviso prévio. Ganhe 15% de desconto na compra do acessório Aeroccino 3 na cor vermelha. A oferta não é cumulativa com as demais ofertas vigentes, é válida para pessoas físicas portadoras de CPF e clientes classificados na categoria B2C Offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha doméstica), limitadas a 1 (um) uso por CPF de registro na Nespresso. A oferta não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento. Antes de finalizar seu pedido, confirme se você inseriu o acessório Aeroccino 3 na cor vermelha e o desconto foi aplicado.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalElement);
  }

  function configureModalEvents() {
    const modalElement = document.getElementById(MODAL_TERMS_CONDITIONS_ID);
    if (!modalElement) return;

    const overlayElement = modalElement.querySelector(
      ".nespresso-welcome-offer-modal-overlay"
    );
    const closeButton = modalElement.querySelector(
      ".nespresso-welcome-offer-modal-close"
    );

    function openModal(event) {
      event.preventDefault();
      modalElement.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modalElement.style.display = "none";
      document.body.style.overflow = "";
    }

    overlayElement.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modalElement.style.display === "block")
        closeModal();
    });
  }

  createTermsModal();
  configureModalEvents();

  // ——————————————————————————————————————————————————————————————————————————————
  // 3) Aeroccino Card + "Confira condições" que abre o modal
  // ——————————————————————————————————————————————————————————————————————————————
  if (!window.novaComunicacaoCardPLP) {
    window.novaComunicacaoCardPLP = true;
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "adobe_target",
      event_raised_by: "adobe target",
      experiment_id: "${campaign.id}",
      experiment_type: "AB",
      experiment_name: "${campaign.name}",
      experiment_variant_id: "${campaign.recipe.id}",
      experiment_variant: "${campaign.recipe.name}",
    });
  }

  const CUSTOM_BANNER_CLASS = "banner-custom-inserido";
  let mutationObserver,
    lastFilterCount = null,
    productVariantKey = null;

  const PRODUCT_CONFIGURATIONS = {
    ol: {
      // original line
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
      titulo: "",
      paragrafo: "",
      ctaText: "COMPRE AGORA",
      ctaLink:
        "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
    },
    vl: {
      // vertuo line
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
      titulo: "",
      paragrafo: "",
      ctaText: "COMPRE AGORA",
      ctaLink:
        "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
    },
  };

  function injectAeroccinoCard(collectionGrid, templateArticle) {
    if (collectionGrid.querySelector("." + CUSTOM_BANNER_CLASS)) return;

    const existingArticles = collectionGrid.querySelectorAll("article");
    if (existingArticles.length < 5) return;

    const clonedCard = templateArticle.cloneNode(true);
    clonedCard.classList.add(CUSTOM_BANNER_CLASS);
    const cardDetails = clonedCard.querySelector(
      "div[class*='collectionDetails']"
    );

    // Configurar o conteúdo do card
    cardDetails.innerHTML =
      `
      <h3 class="tituloCardCrossSell"></h3>
      <p class="paragrafoCardCrossSell"></p>
      <p class="termsCrossSell"><a href="#" class="linkTermsAeroccino">*Confira condições</a></p>
      <a href="` +
      PRODUCT_CONFIGURATIONS[productVariantKey].ctaLink +
      `" class="linkCardCrossSell">
        ` +
      PRODUCT_CONFIGURATIONS[productVariantKey].ctaText +
      `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none"><path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"/></svg>
      </a>`;

    const termsLink = cardDetails.querySelector(".linkTermsAeroccino");
    termsLink.addEventListener("click", (event) => {
      event.preventDefault();
      const modalElement = document.getElementById(MODAL_TERMS_CONDITIONS_ID);
      modalElement.style.display = "block";
      document.body.style.overflow = "hidden";
    });

    const cardSection = clonedCard.querySelector("section");
    cardSection &&
      cardSection.style.setProperty(
        "background-image",
        `url("` + PRODUCT_CONFIGURATIONS[productVariantKey].banner + `")`,
        "important"
      );

    if (existingArticles.length > 4) {
      collectionGrid.insertBefore(clonedCard, existingArticles[4]);
    } else {
      collectionGrid.appendChild(clonedCard);
    }
  }

  function initializeAeroccinoCard() {
    if (window.padl?.page?.pageInfo?.pageName !== "capsules pdp_plp") return;

    productVariantKey = location.href.includes("original") ? "ol" : "vl";

    const currentFilterCount =
      document
        .querySelector("plp-explicit-filter")
        ?.getAttribute("data-filter-counter") || "0";

    if (currentFilterCount !== lastFilterCount) {
      lastFilterCount = currentFilterCount;
      document
        .querySelectorAll("." + CUSTOM_BANNER_CLASS)
        .forEach((element) => element.remove());
    }

    if (currentFilterCount === "0") {
      const targetGrids = document.querySelectorAll(
        '.collection-grid[data-id*="barista-creation"], .collection-grid[data-id*="capsule-range-limited-edition-vertuo"]'
      );
      if (!targetGrids.length) return;

      const articleTemplate = document.querySelector(
        ".collection-grid article"
      );
      targetGrids.forEach((grid) => injectAeroccinoCard(grid, articleTemplate));
    }
  }

  function observeProductListPage() {
    if (mutationObserver) mutationObserver.disconnect();

    // Verifica se o elemento existe antes de tentar observar
    const plpCardsGridElement = document.querySelector("plp-cards-grid");
    if (!plpCardsGridElement) {
      console.warn(
        "Elemento plp-cards-grid não encontrado. Observer não foi iniciado."
      );
      return false; // Retorna false indicando que não conseguiu iniciar o observer
    }

    mutationObserver = new MutationObserver(() => {
      clearTimeout(window.nespressoUpdateTimeout);
      window.nespressoUpdateTimeout = setTimeout(initializeAeroccinoCard, 100);
    });
    mutationObserver.observe(plpCardsGridElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-filter-counter"],
    });

    return true; // Retorna true indicando que o observer foi iniciado com sucesso
  }

  function waitForElementAndInitialize() {
    // Função que aguarda o elemento aparecer antes de inicializar
    const checkForPlpElement = () => {
      const plpCardsGridElement = document.querySelector("plp-cards-grid");
      if (plpCardsGridElement) {
        // Elemento encontrado, pode executar as funções
        initializeAeroccinoCard();
        observeProductListPage();
      } else {
        // Elemento ainda não existe, tenta novamente em 100ms
        setTimeout(checkForPlpElement, 100);
      }
    };

    checkForPlpElement();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElementAndInitialize);
  } else {
    waitForElementAndInitialize();
  }

  window.addEventListener("beforeunload", () => {
    mutationObserver && mutationObserver.disconnect();
    clearTimeout(window.nespressoUpdateTimeout);
  });
})();
