(function () {
  if (window.novaComunicacaoCardPLP) {
    return;
  }
  window.novaComunicacaoCardPLP = "true";

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

  // Marca os elementos criados para identificá-los
  const BANNER_CLASS = "banner-custom-inserido";

  // Cache de elementos para otimização
  let observer = null;
  let lastFilterCount = null;
  let currentPLP = null;

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "user engagement", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  const CONFIG = {
    data: {
      terms_name: "nespresso_aeroccino_terms--",
      tracking: {
        click_cta: "click_card_compre_agora_aeroccino",
        open_terms: "abriu_termos_card_aeroccino",
      },
    },
    ol: {
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
      titulo: "",
      paragrafo: "",
      ctaText: "APROVEITE AGORA",
      ctaLink:
        "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
      tituloOferta: "AEROCCINO VERMELHO",
      termos:
        " *Oferta válida por tempo limitado de 04/07/2025 até 31/07/2025, sujeita a alterações sem aviso prévio. Ganhe 15% de desconto na compra do acessório Aeroccino 3 na cor vermelha. A oferta não é cumulativa com as demais ofertas vigentes, é válida para pessoas físicas portadoras de CPF e clientes classificados na categoria B2C Offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha doméstica), limitadas a 1 (um) uso por CPF de registro na Nespresso. A oferta não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento. Antes de finalizar seu pedido, confirme se você inseriu o acessório Aeroccino 3 na cor vermelha e o desconto foi aplicado. ",
    },
    vl: {
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
      titulo: "",
      paragrafo: "",
      ctaText: "APROVEITE AGORA",
      ctaLink:
        "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
      tituloOferta: "AEROCCINO VERMELHO",
      termos:
        " *Oferta válida por tempo limitado de 04/07/2025 até 31/07/2025, sujeita a alterações sem aviso prévio. Ganhe 15% de desconto na compra do acessório Aeroccino 3 na cor vermelha. A oferta não é cumulativa com as demais ofertas vigentes, é válida para pessoas físicas portadoras de CPF e clientes classificados na categoria B2C Offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha doméstica), limitadas a 1 (um) uso por CPF de registro na Nespresso. A oferta não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento. Antes de finalizar seu pedido, confirme se você inseriu o acessório Aeroccino 3 na cor vermelha e o desconto foi aplicado. ",
    },
  };

  // Função para verificar se há filtros ativos
  function verificarFiltrosAtivos() {
    const filterElement = document.querySelector("plp-explicit-filter");
    if (!filterElement) return false;

    const filterCounter = filterElement.getAttribute("data-filter-counter");
    return filterCounter !== "0" && filterCounter !== null;
  }

  // Função para detectar o tipo de página atual
  function detectarTipoPagina() {
    const currentLocation = window.location.href;
    if (currentLocation.includes("original")) {
      return "ol";
    } else if (currentLocation.includes("vertuo")) {
      return "vl";
    }
    return null;
  }

  // Função para verificar se é página de cápsulas válida
  function isPaginaCapsulaValida() {
    return (
      window.padl &&
      window.padl.page &&
      window.padl.page.pageInfo &&
      window.padl.page.pageInfo.pageName == "capsules pdp_plp"
    );
  }

  // Função para detectar dispositivo
  function detectarDispositivo() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 767) return "mobile";
    if (screenWidth >= 768 && screenWidth <= 1024) return "tablet";
    return "desktop";
  }

  // Função para remover todos os banners existentes
  function removerBannersExistentes() {
    const bannersExistentes = document.querySelectorAll("." + BANNER_CLASS);
    bannersExistentes.forEach((banner) => banner.remove());
  }

  // Função para verificar se já existem banners na categoria
  function categoriaPossuiBanner(categoria) {
    return categoria.querySelector("." + BANNER_CLASS) !== null;
  }

  // Função para inserir CSS apenas uma vez
  function inserirCSS() {
    if (document.querySelector("#nespresso-banner-styles")) return;

    const STYLE = `<style id="nespresso-banner-styles">
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
        font-size:12px;
        letter-spacing:1.1px;
        color:#FFF;
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
      .nespresso-welcome-offer-modal *{font-family:NespressoLucas,Helvetica,Arial,sans-serif}
      .nespresso-welcome-offer-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:2000;display:none}
      .nespresso-welcome-offer-modal-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);cursor:pointer}
      .nespresso-welcome-offer-modal-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background-color:#fff;border-radius:8px;max-width:90%;width:550px;max-height:90vh;box-shadow:0 5px 15px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden}
      .nespresso-welcome-offer-modal-header{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid #e5e5e5;background-color:#f8f8f8}
      .nespresso-welcome-offer-modal-header h3{font-size:18px;margin:0;color:#17171A;font-weight:bold}
      .nespresso-welcome-offer-modal-close{border:none;background:none;cursor:pointer;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;transition:opacity 0.2s ease}
      .nespresso-welcome-offer-modal-close:hover{opacity:0.7}
      .nespresso-welcome-offer-modal-close svg{width:18px;height:18px;color:#666}
      .nespresso-welcome-offer-modal-content{padding:20px;overflow-y:auto;max-height:calc(70vh - 60px);line-height:1.5}
      .nespresso-welcome-offer-modal-termos{font-size:14px;color:#333}
      @media (max-width:480px){
        .nespresso-welcome-offer-modal-container{width:95%}
        .nespresso-welcome-offer-modal-content{padding:15px}
        .nespresso-welcome-offer-modal-header{padding:12px 15px}
      }
    </style>`;

    document.head.insertAdjacentHTML("beforeend", STYLE);
  }

  function criarModal(tituloOferta, termosCondicoes) {
    // Verifica se o modal já existe
    if (
      document.getElementById("nespresso-welcome-offer-modal-termos-condicoes")
    ) {
      return;
    }

    const modalElement = document.createElement("div");
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.id = "nespresso-welcome-offer-modal-termos-condicoes";
    modalElement.style.display = "none";

    // Estrutura HTML do modal
    modalElement.innerHTML =
      `
        <div class="nespresso-welcome-offer-modal-overlay"></div>
        <div class="nespresso-welcome-offer-modal-container">
          <div class="nespresso-welcome-offer-modal-header">
            <button class="nespresso-welcome-offer-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="nespresso-welcome-offer-modal-content">
            <div class="nespresso-welcome-offer-modal-termos">
              <strong>TERMOS E CONDIÇÕES</strong><br>
              <strong>OFERTA` +
      tituloOferta +
      `</strong><br>
              <br>
              ` +
      termosCondicoes +
      `
            </div>
          </div>
        </div>
      `;

    document.body.appendChild(modalElement);
    return modalElement;
  }

  function configurarEventosModal() {
    const modal = document.getElementById(
      "nespresso-welcome-offer-modal-termos-condicoes"
    );

    if (!modal) {
      return;
    }

    const closeModalBtn = modal.querySelector(
      ".nespresso-welcome-offer-modal-close"
    );
    const modalOverlay = modal.querySelector(
      ".nespresso-welcome-offer-modal-overlay"
    );

    function closeModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    // Remove event listeners existentes para evitar duplicação
    const newVerCondicoesLink = verCondicoesLink.cloneNode(true);
    verCondicoesLink.parentNode.replaceChild(
      newVerCondicoesLink,
      verCondicoesLink
    );

    // Adiciona os event listeners

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", closeModal);
    }

    // Fechar modal com ESC - usando namespace específico
    document.addEventListener(
      "keydown",
      function nespressoWelcomeOfferModalKeyHandler(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
          closeModal();
        }
      }
    );
  }
  // Função para criar um banner na categoria
  function criarBannerNaCategoria(categoria, reference) {
    // Verifica se já existe banner nesta categoria
    if (categoriaPossuiBanner(categoria)) return;

    const articles = categoria.querySelectorAll("article");
    if (articles.length < 5) return;

    // Detecta o tipo de dispositivo - pula tablets
    const dispositivo = detectarDispositivo();
    if (dispositivo === "tablet") return;

    const novoClone = reference.cloneNode(true);
    novoClone.classList.add(BANNER_CLASS);

    const conteudo = novoClone.querySelector("div[class*='collectionDetails']");
    if (conteudo) {
      // Limpa todo conteúdo
      conteudo.querySelectorAll("*").forEach((element) => element.remove());

      let ctaHtml =
        `<a href="` +
        CONFIG[currentPLP].ctaLink +
        `" class="linkCardCrossSell">` +
        CONFIG[currentPLP].ctaText +
        `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none"><path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"></path></svg></a>`;

      const novoConteudo =
        `<h3 class="tituloCardCrossSell">` +
        CONFIG[currentPLP].titulo +
        `</h3>
        <p class="paragrafoCardCrossSell">` +
        CONFIG[currentPLP].paragrafo +
        `</p>
        <p class='termsCrossSell'>*Confira condições</p>` +
        ctaHtml;

      conteudo.insertAdjacentHTML("beforeend", novoConteudo);

      function handleCTAClick() {
        sendGAEvent(CONFIG.data.tracking.click_cta);
      }
      const ctaLink = conteudo.querySelector("a.linkCardCrossSell");
      if (ctaLink) {
        // Remove listener anterior se existir (prevenção de duplicatas)
        ctaLink.removeEventListener("click", handleCTAClick);
        // Adiciona novo listener
        ctaLink.addEventListener("click", handleCTAClick);
      }
    }
    if (conteudo.querySelector(".termsCrossSell")) {
      conteudo
        .querySelector(".termsCrossSell")
        .addEventListener("click", function () {
          e.preventDefault();
          let modal = document.querySelector(
            "#nespresso-welcome-offer-modal-termos-condicoes"
          );
          if (modal) {
            alert("teste");
            modal.style.display = "block";
            document.body.style.overflow = "hidden";
            sendGAEvent(CONFIG.data.tracking.open_terms);
          }
        });
    }
    const imageContainer = novoClone.querySelector("section");
    if (imageContainer) {
      imageContainer.style.setProperty(
        "background-image",
        `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%), url(` +
          CONFIG[currentPLP].banner +
          `)`,
        "important"
      );
      imageContainer.style.setProperty(
        "background-position",
        "center center",
        "important"
      );
      imageContainer.style.setProperty(
        "background-repeat",
        "no-repeat",
        "important"
      );
      imageContainer.style.setProperty("background-size", "cover", "important");
    }

    // Posição fixa: sempre inserir na 5ª posição (índice 4)
    const posicaoFixa = 4;
    if (articles.length > posicaoFixa) {
      categoria.insertBefore(novoClone, articles[posicaoFixa]);
    } else {
      categoria.appendChild(novoClone);
    }
  }

  // Função principal para criar cards
  function criarCards() {
    // Verifica se é página válida
    if (!isPaginaCapsulaValida()) return;

    // Detecta tipo de página
    currentPLP = detectarTipoPagina();
    if (!currentPLP) return;

    // Verifica se há filtros ativos
    const filtrosAtivos = verificarFiltrosAtivos();

    if (filtrosAtivos) {
      // Remove banners se filtros estão ativos
      removerBannersExistentes();
      return;
    }

    // Busca categorias
    const categoriasPLP = document.querySelectorAll(
      '.collection-grid[data-id*="barista-creation"], .collection-grid[data-id*="capsule-range-limited-edition-vertuo"]'
    );

    const reference = categoriasPLP[0].querySelector("article");
    if (!reference) return;

    // Insere CSS apenas uma vez
    inserirCSS();

    // Cria banners em cada categoria
    categoriasPLP.forEach((categoria) => {
      criarBannerNaCategoria(categoria, reference);
    });
  }

  // Função para verificar mudanças nos filtros
  function verificarMudancasFiltros() {
    const filterElement = document.querySelector("plp-explicit-filter");
    if (!filterElement) return false;

    const currentFilterCount = filterElement.getAttribute(
      "data-filter-counter"
    );
    if (currentFilterCount !== lastFilterCount) {
      lastFilterCount = currentFilterCount;
      return true;
    }
    return false;
  }

  // Função para configurar o observer
  function configurarObserver() {
    if (observer) observer.disconnect();

    const targetNode =
      document.querySelector("plp-cards-grid") || document.body;

    observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      // Verifica se houve mudanças relevantes
      mutations.forEach((mutation) => {
        // Mudanças nos filtros
        if (
          mutation.target.matches &&
          mutation.target.matches("plp-explicit-filter")
        ) {
          shouldUpdate = true;
        }

        // Mudanças nos cards ou remoção de banners
        if (mutation.type === "childList") {
          const removedBanners = Array.from(mutation.removedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              node.classList &&
              node.classList.contains(BANNER_CLASS)
          );

          const addedCards = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              ((node.matches && node.matches("article")) ||
                (node.querySelector && node.querySelector("article")))
          );

          if (removedBanners || addedCards) {
            shouldUpdate = true;
          }
        }
      });

      // Verifica mudanças nos filtros
      if (verificarMudancasFiltros()) {
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        // Debounce para evitar múltiplas execuções
        clearTimeout(window.nespressoUpdateTimeout);
        window.nespressoUpdateTimeout = setTimeout(() => {
          criarCards();
        }, 100);
      }
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-filter-counter"],
    });
  }

  // Função de inicialização
  function inicializar() {
    // Execução inicial
    criarCards();

    // Configura observer para mudanças
    configurarObserver();
    criarModal();
    configurarEventosModal();

    // Inicializa o estado dos filtros
    const filterElement = document.querySelector("plp-explicit-filter");
    lastFilterCount = filterElement
      ? filterElement.getAttribute("data-filter-counter")
      : "0";
  }

  // Execução quando a página estiver pronta
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

  // Cleanup ao sair da página
  window.addEventListener("beforeunload", () => {
    if (observer) observer.disconnect();
    clearTimeout(window.nespressoUpdateTimeout);
  });
})();
