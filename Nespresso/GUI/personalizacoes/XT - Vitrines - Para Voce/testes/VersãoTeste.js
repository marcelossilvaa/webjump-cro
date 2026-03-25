(function () {
  // Função para garantir que o container principal existe
  function ensureMainContainer() {
    let container = document.querySelector("#recomendationForYou");

    if (!container) {
      const blocoPagina = document.querySelector("#block-8833222759925");
      if (blocoPagina) {
        const sectionVitrines = `<div class="containerRecomendacoes" id="recomendationForYou"></div>`;
        blocoPagina.insertAdjacentHTML("afterend", sectionVitrines);
        container = document.querySelector("#recomendationForYou");
      }
    }

    return container;
  }

  // VITRINE 1: Baseada no Quiz
  async function initializeQuizShowcase() {
    try {
      function getQuizDataFromLocalStorage() {
        try {
          const quizData = localStorage.getItem("coffee_quiz_session");
          if (!quizData) {
            console.log("Nenhum dado de quiz encontrado no localStorage");
            return null;
          }
          return JSON.parse(quizData);
        } catch (error) {
          console.error("Erro ao recuperar dados do quiz:", error);
          return null;
        }
      }

      function mapResponsesByQuestionId(quizData) {
        if (
          !quizData ||
          !quizData.response ||
          !Array.isArray(quizData.response)
        ) {
          return {};
        }

        const mappedResponses = {};

        quizData.response.forEach((response) => {
          if (Array.isArray(response)) {
            const questionId = response[0]?.question_id;
            if (questionId) {
              mappedResponses[questionId] = response.map((item) => item.value);
            }
          } else {
            const questionId = response.question_id;
            if (questionId) {
              mappedResponses[questionId] = response.value;
            }
          }
        });

        return mappedResponses;
      }

      function determineSKUsQuiz(mappedResponses) {
        const novaVitrine = { title: "", SKUs: [] };

        if (!mappedResponses || typeof mappedResponses !== "object") {
          console.error("Respostas inválidas");
          return novaVitrine;
        }

        if (mappedResponses.technology === "original") {
          if (
            mappedResponses.intensity === "intense" &&
            mappedResponses.milk_coffee === "no" &&
            Array.isArray(mappedResponses.coffee_types) &&
            mappedResponses.coffee_types.includes("decaffeinated")
          ) {
            novaVitrine.title = "Clássico Descafeinado";
            novaVitrine.SKUs = ["7857.90", "7862.90", "7864.90"];
          } else if (
            mappedResponses.intensity === "intense" &&
            mappedResponses.milk_coffee === "no"
          ) {
            novaVitrine.title = "Poderoso Clássico";
            novaVitrine.SKUs = [
              "7895.90",
              "7885.90",
              "7888.90",
              "7861.90",
              "7749.10",
              "7855.90",
              "7756.10",
              "7755.10",
              "7607.10",
              "7733.10",
              "7874.90",
            ];
          }
        } else if (mappedResponses.technology === "vertuo") {
          console.log("Tecnologia Vertuo: implementação pendente");
        }

        return novaVitrine;
      }

      const quizData = getQuizDataFromLocalStorage();
      if (!quizData) {
        console.log("Quiz Showcase: Nenhum dado disponível");
        return;
      }

      const mappedResponses = mapResponsesByQuestionId(quizData);
      const recommendedQuizSKUs = determineSKUsQuiz(mappedResponses);

      if (!recommendedQuizSKUs.title || recommendedQuizSKUs.SKUs.length === 0) {
        console.log("Quiz Showcase: Nenhuma recomendação disponível");
        return;
      }

      const container = ensureMainContainer();
      if (!container) {
        console.error("Quiz Showcase: Container não encontrado");
        return;
      }

      await criarVitrines(
        recommendedQuizSKUs,
        "#recomendationForYou",
        "SELECIONAMOS ESPECIALMENTE PARA VOCÊ",
        "Com base no seu perfil de café"
      );

      console.log("✅ Quiz Showcase criada com sucesso");
    } catch (error) {
      console.error("Erro na Quiz Showcase:", error);
    }
  }

  // VITRINE 2: Baseada em Pedidos Anteriores
  async function initializePreviousOrdersShowcase() {
    try {
      const ordersData = await window.napi.checkout().getMyOrders();

      if (!ordersData || !ordersData.orders || ordersData.orders.length === 0) {
        console.log("Previous Orders Showcase: Nenhum pedido encontrado");
        return;
      }

      const lastOrders = ordersData.orders;
      let allSKUs = [];

      lastOrders.forEach(function (order) {
        if (order.quotation && order.quotation.cartLines) {
          const orderSKUs = order.quotation.cartLines.map(function (product) {
            return product.item.replace("erp.br.b2c/prod/", "");
          });
          allSKUs = allSKUs.concat(orderSKUs);
        }
      });

      const uniqueSKUs = [...new Set(allSKUs)].slice(0, 20);

      if (uniqueSKUs.length === 0) {
        console.log("Previous Orders Showcase: Nenhum SKU encontrado");
        return;
      }

      const container = ensureMainContainer();
      if (!container) {
        console.error("Previous Orders Showcase: Container não encontrado");
        return;
      }

      const lastOrdersVitrine = {
        title: "SEUS CAFÉS FAVORITOS ESTÃO ACABANDO?",
        SKUs: uniqueSKUs,
      };

      await criarVitrines(
        lastOrdersVitrine,
        "#recomendationForYou",
        lastOrdersVitrine.title,
        "Reponha os cafés que você comprou recentemente e continue aproveitando cada momento especial"
      );

      console.log("✅ Previous Orders Showcase criada com sucesso");
    } catch (error) {
      console.error("Erro na Previous Orders Showcase:", error);
    }
  }

  // VITRINE 3: Produto Mais Comprado
  async function initializeMostPurchasedShowcase() {
    try {
      function isCapsulaProduct(sku) {
        if (!sku || typeof sku !== "string") {
          return false;
        }

        sku = sku.trim();
        const capsulaPattern = /^\d{4}\.\d{2}$/;
        const machinePattern = /.*-BR-.*/;
        const accessoryPattern = /^\d{4,6}$/;

        if (capsulaPattern.test(sku)) {
          return true;
        }

        if (machinePattern.test(sku) || accessoryPattern.test(sku)) {
          return false;
        }

        console.warn(`SKU com padrão desconhecido encontrado: ${sku}`);
        return false;
      }

      async function getMostPurchasedProduct() {
        try {
          const ordersData = await window.napi.checkout().getMyOrders();

          if (
            !ordersData ||
            !ordersData.orders ||
            ordersData.orders.length === 0
          ) {
            console.log(
              "Nenhum pedido encontrado para análise do produto mais comprado"
            );
            return null;
          }

          const skuQuantityMap = {};
          let totalProducts = 0;
          let capsulaProducts = 0;

          ordersData.orders.forEach(function (order) {
            if (order.quotation && order.quotation.cartLines) {
              order.quotation.cartLines.forEach(function (cartLine) {
                const sku = cartLine.item.replace("erp.br.b2c/prod/", "");
                const quantity = cartLine.quantity || 1;
                totalProducts++;

                if (isCapsulaProduct(sku)) {
                  capsulaProducts++;
                  if (skuQuantityMap[sku]) {
                    skuQuantityMap[sku] += quantity;
                  } else {
                    skuQuantityMap[sku] = quantity;
                  }
                }
              });
            }
          });

          let mostPurchasedSKU = null;
          let highestQuantity = 0;

          Object.keys(skuQuantityMap).forEach((sku) => {
            if (skuQuantityMap[sku] > highestQuantity) {
              highestQuantity = skuQuantityMap[sku];
              mostPurchasedSKU = sku;
            }
          });

          if (!mostPurchasedSKU || highestQuantity < 2) {
            console.log(
              "Não foi possível identificar um produto claramente mais comprado"
            );
            return null;
          }

          return {
            sku: mostPurchasedSKU,
            quantity: highestQuantity,
          };
        } catch (error) {
          console.error("Erro ao analisar produto mais comprado:", error);
          return null;
        }
      }

      function createMostPurchasedShowcase(mostPurchasedData) {
        if (!mostPurchasedData || !mostPurchasedData.sku) {
          return null;
        }

        return {
          title: "Seu Café Favorito",
          SKUs: [mostPurchasedData.sku],
        };
      }

      const mostPurchasedData = await getMostPurchasedProduct();
      if (!mostPurchasedData) {
        console.log("Most Purchased Showcase: Nenhum dado disponível");
        return;
      }

      const mostPurchasedShowcase =
        createMostPurchasedShowcase(mostPurchasedData);
      if (!mostPurchasedShowcase || mostPurchasedShowcase.SKUs.length === 0) {
        console.log("Most Purchased Showcase: Nenhum produto encontrado");
        return;
      }

      const container = ensureMainContainer();
      if (!container) {
        console.error("Most Purchased Showcase: Container não encontrado");
        return;
      }

      await criarVitrines(
        mostPurchasedShowcase,
        "#recomendationForYou",
        "SEU CAFÉ DO CORAÇÃO",
        "Aquele que sempre está na sua lista"
      );

      console.log("✅ Most Purchased Showcase criada com sucesso");
    } catch (error) {
      console.error("Erro na Most Purchased Showcase:", error);
    }
  }

  // VITRINE 4: Produtos Visualizados Recentemente
  async function initializeRecentlyViewedShowcase() {
    try {
      function getRecentlyViewedProducts() {
        try {
          const recentViewsData = localStorage.getItem(
            "nespresso_viewed_products"
          );

          if (!recentViewsData) {
            console.log(
              "Nenhum produto visualizado recentemente encontrado no localStorage"
            );
            return null;
          }

          const parsedData = JSON.parse(recentViewsData);

          if (!Array.isArray(parsedData) || parsedData.length === 0) {
            console.log(
              "Dados de produtos visualizados estão vazios ou inválidos"
            );
            return null;
          }

          return parsedData;
        } catch (error) {
          console.error(
            "Erro ao recuperar produtos visualizados recentemente:",
            error
          );
          return null;
        }
      }

      function createRecentlyViewedShowcase(recentlyViewedData) {
        if (!recentlyViewedData || !Array.isArray(recentlyViewedData)) {
          return null;
        }

        const sortedProducts = recentlyViewedData.sort(
          (a, b) => b.timestamp - a.timestamp
        );

        const skuList = sortedProducts
          .map((product) => {
            if (product.sku && product.sku.includes("erp.br.b2c/prod/")) {
              return product.sku.replace("erp.br.b2c/prod/", "");
            }
            return product.sku;
          })
          .filter((sku) => sku)
          .slice(0, 12);

        const uniqueSKUs = [...new Set(skuList)];

        if (uniqueSKUs.length === 0) {
          console.log("Nenhum SKU válido encontrado nos produtos visualizados");
          return null;
        }

        return {
          title: "Você Visualizou Recentemente",
          SKUs: uniqueSKUs,
        };
      }

      const recentlyViewedData = getRecentlyViewedProducts();
      if (!recentlyViewedData) {
        console.log("Recently Viewed Showcase: Nenhum dado disponível");
        return;
      }

      const recentlyViewedShowcase =
        createRecentlyViewedShowcase(recentlyViewedData);
      if (!recentlyViewedShowcase || recentlyViewedShowcase.SKUs.length === 0) {
        console.log("Recently Viewed Showcase: Nenhum produto encontrado");
        return;
      }

      const container = ensureMainContainer();
      if (!container) {
        console.error("Recently Viewed Showcase: Container não encontrado");
        return;
      }

      await criarVitrines(
        recentlyViewedShowcase,
        "#recomendationForYou",
        "VOCÊ ESTAVA OLHANDO ESTES",
        "Continue de onde parou e encontre seu café favorito"
      );

      console.log("✅ Recently Viewed Showcase criada com sucesso");
    } catch (error) {
      console.error("Erro na Recently Viewed Showcase:", error);
    }
  }

  // FUNÇÕES AUXILIARES COMPARTILHADAS
  async function filterSKUsByStock(skuList) {
    try {
      const stockData = await window.napi.catalog().getStocks();

      if (!stockData) {
        console.error("Não foi possível obter informações de estoque");
        return skuList;
      }

      const filteredSKUs = skuList.filter((sku) => {
        const stockKey = `erp.br.b2c/prod/${sku}`;
        return stockData[stockKey] === true;
      });

      console.log(
        `Filtrado ${skuList.length} SKUs para ${filteredSKUs.length} com estoque disponível`
      );
      return filteredSKUs;
    } catch (error) {
      console.error("Erro ao verificar estoque:", error);
      return skuList;
    }
  }

  async function createShowcaseSection(products, title, subtitle) {
    if (
      !products ||
      !Array.isArray(products.SKUs) ||
      products.SKUs.length === 0
    ) {
      console.log(`Nenhum produto para a vitrine "${title}"`);
      return null;
    }

    const skusComEstoque = await filterSKUsByStock(products.SKUs);

    if (skusComEstoque.length === 0) {
      console.log(
        `Nenhum produto com estoque disponível para a seção "${title}"`
      );
      return null;
    }

    const showcaseSection = document.createElement("div");
    showcaseSection.className = "showcase-section";

    const showcaseHeader = document.createElement("div");
    showcaseHeader.className = "showcase-header";
    showcaseHeader.innerHTML = `
      <h2 class="showcase-title">${title}</h2>
      <p class="showcase-subtitle">${subtitle}</p>
    `;
    showcaseSection.appendChild(showcaseHeader);

    // Container com setas de navegação
    const showcaseWrapper = document.createElement("div");
    showcaseWrapper.className = "showcase-wrapper";

    // Seta esquerda
    const leftArrow = document.createElement("button");
    leftArrow.className = "showcase-arrow showcase-arrow-left";
    leftArrow.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    leftArrow.setAttribute("aria-label", "Navegar para a esquerda");

    // Seta direita
    const rightArrow = document.createElement("button");
    rightArrow.className = "showcase-arrow showcase-arrow-right";
    rightArrow.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    rightArrow.setAttribute("aria-label", "Navegar para a direita");

    const productsContainer = document.createElement("div");
    productsContainer.className = "products-container";

    for (const SKU of skusComEstoque) {
      if (!SKU) continue;

      try {
        const product = await window.napi.catalog().getProduct(SKU);

        if (!product) {
          console.error(`Produto com SKU ${SKU} não encontrado`);
          continue;
        }

        const pdpURL = product.pdpURLs?.desktop || "";
        const productName = product.name || "Nome indisponível";
        const productImage = product.slides[0]?.url || "";
        const productDescription = product.headline || "Descrição indisponível";
        const salesMultiple = product.salesMultiple || 1;
        const productPrice = ((product.price || 0) * salesMultiple)
          .toFixed(2)
          .replace(".", ",");
        const pricePerCapsule = (product.price || 0)
          .toFixed(2)
          .replace(".", ",");

        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `
          <div class="coffee-card">
            <a href="${pdpURL}" class="card-link">
              <div class="product-image" style="background-image: url('https://www.nespresso.com/${productImage}?impolicy=medium&imwidth=800')">
              </div>
            </a>
            <div class="product-info">
              <h3 class="product-name">${productName}</h3>
              <p class="product-description">${productDescription}</p>
              
              <div class="price-container">
                <div class="price">R$ ${productPrice}</div>
                ${
                  product.name.toLowerCase().includes("kit")
                    ? ""
                    : `<div class="price-details">10 Cápsulas<br>R$ ${pricePerCapsule}/capsula</div>`
                }
                
              </div>
              
              <div class="add-to-bag" data-product-id="erp.br.b2c/prod/${SKU}" data-button-size="small"></div>
            </div>
          </div>
        `;

        productsContainer.appendChild(productItem);
      } catch (error) {
        console.error(`Erro ao processar produto ${SKU}:`, error);
      }
    }

    // Montar a estrutura com setas
    showcaseWrapper.appendChild(leftArrow);
    showcaseWrapper.appendChild(productsContainer);
    showcaseWrapper.appendChild(rightArrow);
    showcaseSection.appendChild(showcaseWrapper);

    // Adicionar funcionalidade das setas
    setupNavigationArrows(productsContainer, leftArrow, rightArrow);

    return showcaseSection;
  }

  // Nova função para configurar a navegação das setas
  function setupNavigationArrows(container, leftArrow, rightArrow) {
    const scrollAmount = 320; // Aproximadamente o tamanho de um card + gap

    // Função para atualizar estado das setas
    function updateArrowStates() {
      const isAtStart = container.scrollLeft <= 0;
      const isAtEnd =
        container.scrollLeft >= container.scrollWidth - container.clientWidth;

      leftArrow.style.opacity = isAtStart ? "0.3" : "1";
      leftArrow.style.pointerEvents = isAtStart ? "none" : "auto";

      rightArrow.style.opacity = isAtEnd ? "0.3" : "1";
      rightArrow.style.pointerEvents = isAtEnd ? "none" : "auto";
    }

    // Função para verificar se precisa das setas
    function checkIfNeedsArrows() {
      const needsArrows = container.scrollWidth > container.clientWidth;
      leftArrow.style.display = needsArrows ? "flex" : "none";
      rightArrow.style.display = needsArrows ? "flex" : "none";

      if (needsArrows) {
        updateArrowStates();
      }
    }

    // Event listeners para as setas
    leftArrow.addEventListener("click", () => {
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    });

    rightArrow.addEventListener("click", () => {
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    });

    // Listener para atualizar setas durante scroll
    container.addEventListener("scroll", updateArrowStates);

    // Verificar inicialmente e quando a janela redimensiona
    setTimeout(() => {
      checkIfNeedsArrows();
    }, 100);

    window.addEventListener("resize", () => {
      setTimeout(checkIfNeedsArrows, 100);
    });
  }

  async function criarVitrines(
    products,
    containerId,
    tituloVitrine,
    subtituloVitrine
  ) {
    if (!products || !Array.isArray(products.SKUs)) {
      console.error("Estrutura de produtos inválida:", products);
      return;
    }

    const showcaseSection = await createShowcaseSection(
      products,
      tituloVitrine,
      subtituloVitrine
    );

    if (showcaseSection) {
      const container = document.querySelector(containerId);
      if (container) {
        container.appendChild(showcaseSection);
      } else {
        console.error(`Container ${containerId} não encontrado`);
      }
    }
  }

  function addStyles() {
    if (!document.getElementById("recomendacoes-style")) {
      const styleElement = document.createElement("style");
      styleElement.id = "recomendacoes-style";
      styleElement.textContent = `
        .containerRecomendacoes {
          margin: auto;
          max-width: 72.5rem;
          padding: 0 1rem;
          margin-top: 3rem;
          margin-bottom: 3rem;
        }
        
        .showcase-section {
          margin-bottom: 3rem;
        }
        
        .showcase-header {
          margin-bottom: 1.5rem;
        }
        
        .showcase-title {
          font-weight: 700;
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          letter-spacing: 0.0625rem;
          line-height: 1.2;
          color: rgb(23, 23, 26);
          text-transform: uppercase;
        }
        
        .showcase-subtitle {
          font-weight: 400;
          font-size: 1.1rem;
          margin: 0;
          letter-spacing: 0.015625rem;
          line-height: 1.4;
          color: rgb(133, 136, 135);
        }
        
        /* Wrapper para as setas e container */
        .showcase-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        /* Estilos das setas de navegação */
        .showcase-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .showcase-arrow:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          transform: translateY(-50%) scale(1.05);
        }
        
        .showcase-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }
        
        .showcase-arrow-left {
          left: -24px;
        }
        
        .showcase-arrow-right {
          right: -24px;
        }
        
        /* Ajustes para mobile */
        @media (max-width: 768px) {
          .showcase-arrow {
            width: 40px;
            height: 40px;
          }
          
          .showcase-arrow-left {
            left: -20px;
          }
          
          .showcase-arrow-right {
            right: -20px;
          }
        }
        
        @media (max-width: 480px) {
          .showcase-arrow {
            width: 36px;
            height: 36px;
          }
          
          .showcase-arrow-left {
            left: -18px;
          }
          
          .showcase-arrow-right {
            right: -18px;
          }
        }
        
        .products-container {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 1rem;
          padding-bottom: 1rem;
          scrollbar-width: thin;
        }
        
        .products-container::-webkit-scrollbar {
          height: 6px;
        }
        
        .products-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .products-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .products-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .product-item {
          flex: 0 0 auto;
          width: 16rem;
        }
        
        .coffee-card {
          width: 100%;
          border-radius: 8px;
          border: 1px solid rgb(231, 231, 231);
          overflow: hidden;
          position: relative;
          background-color: #fff;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow:visible;
        }
        
        .coffee-card:hover {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          overflow: visible !important;
        }
        
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .product-image {
          background-blend-mode: multiply;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: 85% center;
          background-color: rgb(243, 238, 230);
          height: 15rem;
          width: 100%;
        }
        
        .product-info {
          padding: 1.2rem 1rem;
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .product-name {
          font-weight: 700;
          text-align: left;
          font-size: 1.2rem;
          letter-spacing: 0.0625rem;
          line-height: 1.2;
          text-transform: none;
          color: rgb(23, 23, 26);
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .product-description {
          font-weight: 500;
          text-align: left;
          font-size: 0.875rem;
          letter-spacing: 0.015625rem;
          line-height: 1.2;
          text-transform: none;
          color: rgb(133, 136, 135);
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .price-container {
          margin-top: auto;
          margin-bottom: 1rem;
        }
        
        .price {
          font-weight: 700;
          text-align: left;
          font-size: 1.25rem;
          letter-spacing: 0.015625rem;
          line-height: 1.2;
          text-transform: none;
          color: rgb(37, 122, 87);
        }
        
        .price-details {
          font-weight: 500;
          text-align: start;
          font-size: 0.875rem;
          letter-spacing: 0.015625rem;
          line-height: 1.2;
          text-transform: none;
          color: rgb(133, 136, 135);
        }
        
        .add-to-bag {
          position: absolute;
          right: 1rem;
          bottom: 1rem;
        }
        
        .add-to-bag button {
          border-radius: 30px;
        }
        
        .for-cold {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background-color: #c8e8ff;
          color: #0077cc;
          font-size: 0.75rem;
          font-weight: bold;
          padding: 0.3rem 0.6rem;
          border-radius: 100px;
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .product-item {
            width: 14rem;
          }
          
          .product-image {
            height: 12rem;
          }
          
          .showcase-title {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .product-item {
            width: 12rem;
          }
          
          .product-image {
            height: 10rem;
          }
          
          .showcase-title {
            font-size: 1.2rem;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }

  function initializeMosaicModules() {
    if (
      typeof mosaic !== "undefined" &&
      document.getElementById("recomendationForYou")
    ) {
      setTimeout(function () {
        mosaic.initializeAllFreeHTMLModules(
          document.getElementById("recomendationForYou")
        );
      }, 2000);
    }
  }

  // FUNÇÃO PRINCIPAL MODIFICADA - AGORA INDEPENDENTE
  async function initializeAllShowcases() {
    try {
      // Adicionar estilos uma vez
      addStyles();

      console.log("🚀 Iniciando todas as vitrines independentemente...");

      await Promise.allSettled([
        initializeMostPurchasedShowcase(),
        initializeQuizShowcase(),
        initializeRecentlyViewedShowcase(),
        initializePreviousOrdersShowcase(),
      ]);

      // Inicializar módulos do Mosaic no final
      initializeMosaicModules();

      console.log("✅ Processo de inicialização das vitrines concluído");
    } catch (error) {
      console.error("Erro geral na inicialização das vitrines:", error);
    }
  }

  // Inicialização baseada no estado do documento
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAllShowcases);
  } else {
    initializeAllShowcases();
  }
})();
