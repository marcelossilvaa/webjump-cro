(function () {
  function getQuizDataFromLocalStorage() {
    try {
      const quizData = localStorage.getItem("coffee_quiz_session");
      if (!quizData) {
        console.error("Nenhum dado de quiz encontrado no localStorage");
        return null;
      }
      return JSON.parse(quizData);
    } catch (error) {
      console.error("Erro ao recuperar dados do quiz:", error);
      return null;
    }
  }

  function mapResponsesByQuestionId(quizData) {
    if (!quizData || !quizData.response || !Array.isArray(quizData.response)) {
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
        // Resposta regular
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

    // Verificar se todas as propriedades necessárias existem
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
          "7742.10",
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
      // Implementação para tecnologia "vertuo" pode ser adicionada aqui
      console.log("Tecnologia Vertuo: implementação pendente");
    }

    return novaVitrine;
  }
  // Função para obter produtos visualizados recentemente do localStorage
  function getRecentlyViewedProducts() {
    try {
      // Buscar os dados no localStorage - ajuste a chave conforme necessário
      const recentViewsData = localStorage.getItem("nespresso_viewed_products");

      if (!recentViewsData) {
        console.log(
          "Nenhum produto visualizado recentemente encontrado no localStorage"
        );
        return null;
      }

      const parsedData = JSON.parse(recentViewsData);

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        console.log("Dados de produtos visualizados estão vazios ou inválidos");
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

  // Função para processar e criar a vitrine de produtos visualizados recentemente
  function createRecentlyViewedShowcase(recentlyViewedData) {
    if (!recentlyViewedData || !Array.isArray(recentlyViewedData)) {
      return null;
    }

    // Ordenar por timestamp (mais recentes primeiro)
    const sortedProducts = recentlyViewedData.sort(
      (a, b) => b.timestamp - a.timestamp
    );

    // Extrair SKUs removendo o prefixo "erp.br.b2c/prod/"
    const skuList = sortedProducts
      .map((product) => {
        if (product.sku && product.sku.includes("erp.br.b2c/prod/")) {
          return product.sku.replace("erp.br.b2c/prod/", "");
        }
        return product.sku;
      })
      .filter((sku) => sku) // Remove SKUs vazios ou undefined
      .slice(0, 12); // Limita a 12 produtos para não sobrecarregar

    // Remover duplicatas mantendo a ordem (mais recente primeiro)
    const uniqueSKUs = [...new Set(skuList)];

    if (uniqueSKUs.length === 0) {
      console.log("Nenhum SKU válido encontrado nos produtos visualizados");
      return null;
    }

    // Retornar no formato esperado pela função criarVitrines
    return {
      title: "Você Visualizou Recentemente",
      SKUs: uniqueSKUs,
    };
  }
  // Nova função para verificar estoque e filtrar SKUs
  async function filterSKUsByStock(skuList) {
    try {
      // Obtém informações de estoque
      const stockData = await window.napi.catalog().getStocks();

      if (!stockData) {
        console.error("Não foi possível obter informações de estoque");
        return skuList; // Retorna a lista original em caso de erro
      }

      // Filtra SKUs com estoque
      const filteredSKUs = skuList.filter((sku) => {
        const stockKey = `erp.br.b2c/prod/${sku}`;
        return stockData[stockKey] === true; // Mantém apenas SKUs com estoque true
      });

      console.log(
        `Filtrado ${skuList.length} SKUs para ${filteredSKUs.length} com estoque disponível`
      );
      return filteredSKUs;
    } catch (error) {
      console.error("Erro ao verificar estoque:", error);
      return skuList; // Em caso de erro, retorna a lista original
    }
  }

  // Função para verificar se já existe um carousel principal
  function getMainCarousel() {
    return document.querySelector("#main-product-carousel");
  }

  // Função para criar ou obter o carousel principal
  function getOrCreateMainCarousel() {
    let mainCarousel = getMainCarousel();

    if (!mainCarousel) {
      console.log("Criando carousel principal");

      // Criar o container do carousel principal
      mainCarousel = document.createElement("div");
      mainCarousel.id = "main-product-carousel";
      mainCarousel.className = "main-product-carousel";

      // Estrutura do carousel
      mainCarousel.innerHTML = `
            <div class="carousel-container">
              <button class="carousel-nav prev" aria-label="Anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="carousel-track-container">
                <div class="carousel-track"></div>
              </div>
              <button class="carousel-nav next" aria-label="Próximo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          `;

      // Adicionar ao #recomendationForYou
      const container = document.querySelector("#recomendationForYou");
      if (container) {
        container.appendChild(mainCarousel);
      } else {
        console.error("Container #recomendationForYou não encontrado");
        return null;
      }
    }

    return mainCarousel;
  }

  // Função para adicionar uma seção ao carousel
  async function addSectionToCarousel(products, sectionTitle, sectionSubtitle) {
    // Obter o carousel principal
    const mainCarousel = getOrCreateMainCarousel();
    if (!mainCarousel) return;

    // Obter o track do carousel
    const carouselTrack = mainCarousel.querySelector(".carousel-track");
    if (!carouselTrack) return;

    // Filtrar SKUs com base no estoque
    const skusComEstoque = await filterSKUsByStock(products.SKUs);

    // Se não houver SKUs com estoque, não adiciona a seção
    if (skusComEstoque.length === 0) {
      console.log(
        `Nenhum produto com estoque disponível para a seção "${sectionTitle}"`
      );
      return;
    }

    // Adicionar cabeçalho da seção
    const sectionHeader = document.createElement("div");
    sectionHeader.className = "carousel-section-header";
    sectionHeader.innerHTML = `
          <div class="section-title">
            <h3>${sectionTitle}</h3>
            <p>${sectionSubtitle}</p>
          </div>
        `;
    carouselTrack.appendChild(sectionHeader);

    // Buscar e adicionar produtos
    for (const SKU of skusComEstoque) {
      if (!SKU) continue; // Ignorar SKUs vazios

      try {
        const product = await window.napi.catalog().getProduct(SKU);

        // Verificar se o produto existe
        if (!product) {
          console.error(`Produto com SKU ${SKU} não encontrado`);
          continue;
        }

        // Extrair dados do produto
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

        // Verificar se é para café gelado
        const isIced = product.attributes?.isIced;

        // Rótulo para café gelado
        const icedLabel = isIced ? '<div class="for-cold">FOR COLD</div>' : "";

        // Criar o card do produto
        const productItem = document.createElement("div");
        productItem.className = "carousel-item";
        productItem.innerHTML = `
              <div class="coffee-card">
                <a href="${pdpURL}" class="card-link">
                  ${icedLabel}
                  <div class="product-image" style="background-image: url('https://www.nespresso.com/${productImage}?impolicy=medium&imwidth=800')">
                  </div>
                </a>
                <div class="product-info">
                  <h3 class="product-name">${productName}</h3>
                  <p class="product-description">${productDescription}</p>
                  
                  <div class="price-container">
                    <div class="price">R$ ${productPrice}</div>
                    <div class="price-details">10 Cápsulas<br>R$ ${pricePerCapsule}/capsula</div>
                  </div>
                  
                  <div class="add-to-bag" data-product-id="erp.br.b2c/prod/${SKU}" data-button-size="small"></div>
                </div>
              </div>
            `;

        carouselTrack.appendChild(productItem);
      } catch (error) {
        console.error(`Erro ao processar produto ${SKU}:`, error);
      }
    }

    // Inicializar ou atualizar a navegação do carousel
    initOrUpdateCarouselNavigation(mainCarousel);
  }

  // Função modificada para inicializar ou atualizar a navegação do carousel
  function initOrUpdateCarouselNavigation(carouselElement) {
    const track = carouselElement.querySelector(".carousel-track");
    const prevButton = carouselElement.querySelector(".carousel-nav.prev");
    const nextButton = carouselElement.querySelector(".carousel-nav.next");
    const container = carouselElement.querySelector(
      ".carousel-track-container"
    );
    const items = track.querySelectorAll(
      ".carousel-item, .carousel-section-header"
    );

    if (items.length === 0) return;

    // Remover listeners existentes para evitar duplicação
    const newPrevButton = prevButton.cloneNode(true);
    const newNextButton = nextButton.cloneNode(true);
    prevButton.parentNode.replaceChild(newPrevButton, prevButton);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);

    // Reinicializar variáveis com os novos elementos
    const updatedPrevButton =
      carouselElement.querySelector(".carousel-nav.prev");
    const updatedNextButton =
      carouselElement.querySelector(".carousel-nav.next");

    // Estado do carousel
    let currentIndex = 0;
    let itemsPerPage = 1; // Será atualizado dinamicamente

    // Função para calcular quantos itens cabem completamente na visualização
    function calculateItemsPerPage() {
      const containerWidth = container.offsetWidth;
      const itemWidth = items[0].offsetWidth;
      // Calculamos apenas os itens que cabem COMPLETAMENTE
      return Math.floor(containerWidth / itemWidth);
    }

    // Função para atualizar a opacidade dos itens
    function updateItemsOpacity() {
      // Primeiro, definimos todos os itens com opacidade reduzida
      items.forEach((item, index) => {
        item.style.opacity = "0.5"; // Opacidade reduzida para itens fora do foco
        item.style.transition = "opacity 0.5s ease"; // Transição suave
      });

      // Em seguida, definimos opacidade total para os itens visíveis centrais
      for (let i = currentIndex; i < currentIndex + itemsPerPage; i++) {
        if (items[i]) {
          items[i].style.opacity = "1"; // Opacidade total para itens no foco
        }
      }
    }

    // Função para atualizar a posição do carousel
    function updateCarouselPosition() {
      // Recalcular itens por página para adaptação responsiva
      itemsPerPage = calculateItemsPerPage();

      // Garantir que o índice atual não ultrapasse o limite
      if (currentIndex > items.length - itemsPerPage) {
        currentIndex = Math.max(0, items.length - itemsPerPage);
      }

      // Obter a largura do item para calcular o deslocamento
      const itemWidth = items[0].offsetWidth;
      const translateX = -currentIndex * itemWidth;

      // Aplicar a transformação para mover o carrossel
      track.style.transform = `translateX(${translateX}px)`;

      // Atualizar a opacidade dos itens
      updateItemsOpacity();

      // Atualizar estado dos botões
      updatedPrevButton.disabled = currentIndex <= 0;
      updatedPrevButton.style.opacity = updatedPrevButton.disabled
        ? "0.5"
        : "1";

      updatedNextButton.disabled = currentIndex >= items.length - itemsPerPage;
      updatedNextButton.style.opacity = updatedNextButton.disabled
        ? "0.5"
        : "1";
    }

    // Adicionar event listeners para navegação
    updatedPrevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        // Mover um item de cada vez para garantir visualização completa
        currentIndex--;
        updateCarouselPosition();
      }
    });

    updatedNextButton.addEventListener("click", () => {
      if (currentIndex < items.length - itemsPerPage) {
        // Mover um item de cada vez para garantir visualização completa
        currentIndex++;
        updateCarouselPosition();
      }
    });

    // Adicionar evento de redimensionamento para ajustar o carrossel
    window.addEventListener("resize", () => {
      // Recalcular e atualizar o carrossel quando a janela for redimensionada
      updateCarouselPosition();
    });

    // Inicializar posição e opacidade
    updateCarouselPosition();
  }

  // Função modificada para criar vitrines
  async function criarVitrines(
    products,
    location,
    tituloVitrine,
    subtituloVitrine
  ) {
    // Verificar estrutura dos produtos
    if (!products || !Array.isArray(products.SKUs)) {
      console.error("Estrutura de produtos inválida:", products);
      return;
    }

    // Adicionar produtos como uma seção no carousel principal
    await addSectionToCarousel(products, tituloVitrine, subtituloVitrine);
  }

  // Função principal para inicializar o processo
  async function initializePersonalizedShowcases() {
    try {
      const quizData = getQuizDataFromLocalStorage();
      if (!quizData) {
        console.log(
          "Nenhum dado de quiz encontrado para criar vitrines personalizadas"
        );
        return;
      }

      const mappedResponses = mapResponsesByQuestionId(quizData);
      const recommendedQuizSKUs = determineSKUsQuiz(mappedResponses);

      // Verificar se temos recomendações válidas
      if (!recommendedQuizSKUs.title || recommendedQuizSKUs.SKUs.length === 0) {
        console.log("Nenhuma recomendação de quiz disponível");
        return;
      }

      const blocoPagina = document.querySelector("#block-8833222759925");
      if (!blocoPagina) {
        console.error(
          "Elemento de referência #block-8833222727157 não encontrado"
        );
        return;
      }

      // Cria a seção de vitrine Quiz
      const sectionVitrine = `<div class="containerRecomendacoes" id="recomendationForYou"></div>`;
      blocoPagina.insertAdjacentHTML("afterend", sectionVitrine);

      // Cria vitrine baseada no quiz
      await criarVitrines(
        recommendedQuizSKUs,
        "#recomendationForYou",
        recommendedQuizSKUs.title,
        "Descubra nossos cafés selecionados para você"
      );

      // Verifica se o usuário LOGADO fez algum pedido anteriormente
      try {
        const ordersData = await window.napi.checkout().getMyOrders();

        if (ordersData && ordersData.orders && ordersData.orders.length > 0) {
          const lastOrders = ordersData.orders;

          // Extrair SKUs dos últimos 10 pedidos
          let allSKUs = [];
          lastOrders.forEach(function (order) {
            if (order.quotation && order.quotation.cartLines) {
              const orderSKUs = order.quotation.cartLines.map(function (
                product
              ) {
                return product.item.replace("erp.br.b2c/prod/", "");
              });
              allSKUs = allSKUs.concat(orderSKUs);
            }
          });

          // Remover duplicatas e limitar a 20 SKUs
          const uniqueSKUs = [...new Set(allSKUs)].slice(0, 20);

          if (uniqueSKUs.length > 0) {
            console.log(
              "Criando vitrine baseada nas compras anteriores:",
              uniqueSKUs
            );

            // Criar objeto no formato correto para a função criarVitrines
            const lastOrdersVitrine = {
              title: "Reviva Seus Cafés Preferidos",
              SKUs: uniqueSKUs,
            };

            // Adicionar como uma seção ao carousel principal
            await criarVitrines(
              lastOrdersVitrine,
              "#recomendationForYou",
              lastOrdersVitrine.title,
              "Seus favoritos estão aqui"
            );
          }
        }
      } catch (orderError) {
        console.error("Erro ao buscar pedidos anteriores:", orderError);
      }
      try {
        // Buscar produtos visualizados recentemente
        const recentlyViewedData = getRecentlyViewedProducts();

        if (recentlyViewedData) {
          const recentlyViewedShowcase =
            createRecentlyViewedShowcase(recentlyViewedData);

          if (
            recentlyViewedShowcase &&
            recentlyViewedShowcase.SKUs.length > 0
          ) {
            console.log(
              "Criando vitrine de produtos visualizados recentemente:",
              recentlyViewedShowcase.SKUs
            );

            // Adicionar como uma seção ao carousel principal
            await criarVitrines(
              recentlyViewedShowcase,
              "#recomendationForYou",
              recentlyViewedShowcase.title,
              "Continue de onde parou"
            );
          }
        }
      } catch (recentViewError) {
        console.error(
          "Erro ao criar vitrine de produtos visualizados recentemente:",
          recentViewError
        );
      }
      addStyles();
      initializeMosaicModules();
    } catch (error) {
      console.error("Erro ao inicializar vitrines personalizadas:", error);
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
            
            /* Estilos do Carousel Principal */
            .main-product-carousel {
              width: 100%;
              margin-bottom: 2rem;
              position: relative;
            }
            
            .carousel-container {
              position: relative;
              width: 100%;
              overflow: hidden;
            }
            
            .carousel-track-container {
              overflow: hidden;
              width: 100%;
              padding: 1rem 0;
            }
            
            .carousel-track {
              display: flex;
              transition: transform 0.5s ease;
              will-change: transform;
            }
            
            .carousel-item {
              flex: 0 0 auto;
              width: 22.5rem;
              padding: 0 0.5rem;
              transition: opacity 0.5s ease;
            }
            
            .carousel-section-header {
              min-width: 18rem;
              padding: 1rem;
              margin: 0 0.5rem;
              background-image: url('https://www.nespresso.com/static/us/solutions/homepage/assets/dsnes/RECOMMENDED%20FLAVOR_COLD/best-brews/Coffee-Swirl_Desktop_360x597.jpg?impolicy=medium&imwidth=360');
              background-size: cover;
              background-position: center;
              border-radius: 16px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              transition: opacity 0.5s ease;
            }
            
            .section-title {
              color: white;
              text-align: left;
              padding: 1rem;
            }
            
            .section-title h3 {
              font-weight: 700;
              font-size: 2.2rem;
              margin: 0 0 0.5rem 0;
              letter-spacing: 0.0625rem;
              line-height: 1.2;
            }
            
            .section-title p {
              font-weight: 500;
              font-size: 1.25rem;
              margin: 0;
              letter-spacing: 0.015625rem;
              line-height: 1.2;
            }
            
            .carousel-nav {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: white;
              border: 1px solid #e0e0e0;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              transition: all 0.2s ease;
            }
            
            .carousel-nav:hover {
              background-color: #f8f8f8;
              box-shadow: 0 3px 7px rgba(0, 0, 0, 0.15);
            }
            
            .carousel-nav.prev {
              left: 10px;
            }
            
            .carousel-nav.next {
              right: 10px;
            }
            
            /* Estilos para os cards de café */
            .coffee-card {
              width: 100%;
              border-radius: 16px;
              border: 1px solid rgb(231, 231, 231);
              overflow: hidden;
              position: relative;
              background-color: #fff;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .coffee-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
              height: 22.5rem;
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
              font-size: 1.5rem;
              letter-spacing: 0.0625rem;
              line-height: 1.2;
              text-transform: none;
              color: rgb(23, 23, 26);
            }
            
            .product-description {
              font-weight: 500;
              text-align: left;
              font-size: 0.875rem;
              letter-spacing: 0.015625rem;
              line-height: 1.2;
              text-transform: none;
              color: rgb(133, 136, 135);
              margin-top: 8px;
            }
            
            .coffee-category {
              display: flex;
              align-items: center;
              margin-top: auto;
              margin-bottom: 1rem;
            }
            
            .category-icon {
              display: inline-block;
              width: 1.2rem;
              height: 1.2rem;
              background-color: #eee;
              border-radius: 50%;
              margin-right: 0.5rem;
            }
            
            .category-text {
              font-size: 0.9rem;
              color: #555;
            }
            
            .price-container {
              margin-top: 0.5rem;
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
            
            /* For iced coffee label */
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
            
            /* Responsive adjustments */
            @media (max-width: 1024px) {
              .carousel-section-header {
                min-width: 16rem;
              }
              
              .section-title h3 {
                font-size: 1.8rem;
              }
              
              .section-title p {
                font-size: 1rem;
              }
              
              .carousel-item {
                width: 85%;
              }
            }
            
            @media (max-width: 768px) {
              .coffee-card {
                width: 100%;
              }
              
              .product-image {
                height: 12rem;
              }
              
              .carousel-nav {
                width: 35px;
                height: 35px;
              }
              
              .carousel-section-header {
                min-width: 12rem;
              }
              
              .section-title h3 {
                font-size: 1.5rem;
              }
            }
            
            @media (max-width: 480px) {
              .carousel-item {
                width: 90%;
              }
              
              .carousel-section-header {
                min-width: 10rem;
              }
              
              .section-title h3 {
                font-size: 1.2rem;
              }
            }
          `;
      document.head.appendChild(styleElement);
    }
  }

  function initializeMosaicModules() {
    // Manter o método de inicialização com setTimeout como estava no código original
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

  // Inicialização baseada no estado do documento
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePersonalizedShowcases
    );
  } else {
    initializePersonalizedShowcases();
  }
})();
