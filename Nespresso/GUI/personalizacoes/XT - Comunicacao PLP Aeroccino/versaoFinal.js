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
    ol: {
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
      titulo: "",
      paragrafo: "",
      ctaText: "COMPRE AGORA",
      ctaLink:
        "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
    },
    vl: {
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
      titulo: "",
      paragrafo: "",
      ctaText: "COMPRE AGORA",
      ctaLink:
        "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
    },
  };

  // Função para verificar se o usuário está logado
  function usuarioEstaLogado() {
    try {
      const isLoginTracked = sessionStorage.getItem("isLoginTracked");
      return isLoginTracked !== null;
    } catch (error) {
      console.warn("Erro ao acessar sessionStorage:", error);
      return false;
    }
  }

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
    </style>`;

    document.head.insertAdjacentHTML("beforeend", STYLE);
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

      // Verifica se o usuário está logado para decidir se mostra o CTA
      const userLogado = usuarioEstaLogado();

      let ctaHtml = "";
      if (!userLogado) {
        ctaHtml =
          `<a href="` +
          CONFIG[currentPLP].ctaLink +
          `" class="linkCardCrossSell">` +
          CONFIG[currentPLP].ctaText +
          `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none"><path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"></path></svg></a>`;
      }

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
        sendGAEvent("clicou_cta_banner_boas_vindas_plp");
      }
      if (!userLogado) {
        const ctaLink = conteudo.querySelector("a.linkCardCrossSell");
        if (ctaLink) {
          // Remove listener anterior se existir (prevenção de duplicatas)
          ctaLink.removeEventListener("click", handleCTAClick);
          // Adiciona novo listener
          ctaLink.addEventListener("click", handleCTAClick);
        }
      }
    }

    const imageContainer = novoClone.querySelector("section");
    if (imageContainer) {
      imageContainer.style.setProperty(
        "background-image",
        `url(` + CONFIG[currentPLP].banner + `)`,
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

    // Busca apenas as categorias específicas
    const categoriasEspecificas = document.querySelectorAll(
      '.collection-grid[data-id*="barista-creation"], .collection-grid[data-id*="capsule-range-limited-edition-vertuo"]'
    );

    if (categoriasEspecificas.length === 0) return;

    // Busca uma referência para clonar o card (pode ser de qualquer categoria)
    const todasCategorias = document.querySelectorAll(".collection-grid");
    let reference = null;

    for (let categoria of todasCategorias) {
      const articleRef = categoria.querySelector("article");
      if (articleRef) {
        reference = articleRef;
        break;
      }
    }

    if (!reference) return;

    // Insere CSS apenas uma vez
    inserirCSS();

    // Cria banners apenas nas categorias específicas
    categoriasEspecificas.forEach((categoria) => {
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

    const targetNode = document.querySelector("plp-cards-grid");

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
