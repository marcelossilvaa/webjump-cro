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

  // Função para determinar a categoria do café
  function getCoffeeCategory(product) {
    // Função para determinar a categoria do café baseada nos atributos do produto
    // Isso é apenas um exemplo - ajuste conforme sua lógica de negócio
    if (product.attributes && product.attributes.isPureOrigin) {
      return "Single Origin";
    } else if (product.attributes && product.attributes.isCereal) {
      return "Cereal";
    } else if (product.attributes && product.attributes.isRoasted) {
      return "Roasted";
    }
    return null;
  }

  // Função modificada para criar vitrines com verificação de estoque e título ao lado
  async function criarVitrines(
    products,
    location,
    tituloVitrine,
    subtituloVitrine
  ) {
    // Verifica se o objeto products tem a estrutura correta
    if (!products || !Array.isArray(products.SKUs)) {
      console.error("Estrutura de produtos inválida:", products);
      return;
    }

    const container = document.querySelector(location);
    if (!container) {
      console.error(`Container não encontrado: ${location}`);
      return;
    }

    // Filtrar SKUs com base no estoque antes de adicionar à vitrine
    const skusComEstoque = await filterSKUsByStock(products.SKUs);

    // Se não houver SKUs com estoque, não cria a vitrine
    if (skusComEstoque.length === 0) {
      console.log(
        `Nenhum produto com estoque disponível para a vitrine "${tituloVitrine}"`
      );
      return;
    }

    // Cria a estrutura da vitrine com o título ao lado
    const vitrineWrapper = document.createElement("div");
    vitrineWrapper.className = "vitrine-wrapper";

    // Cria o elemento do título com a imagem de fundo
    const titleElement = document.createElement("div");
    titleElement.className = "vitrine-title-container";
    titleElement.innerHTML = `
      <div class="vitrine-title-content">
        <h2 class="recomendacaoTitulo">${tituloVitrine}</h2>
        <p class="vitrine-subtitle">${subtituloVitrine}</p>
      </div>
    `;

    // Adiciona a wrapper antes do container
    container.parentNode.insertBefore(vitrineWrapper, container);

    // Move o container para dentro da wrapper
    vitrineWrapper.appendChild(titleElement);
    vitrineWrapper.appendChild(container);

    // Para cada SKU com estoque, busca os detalhes do produto e cria o card
    skusComEstoque.forEach(function (SKU) {
      if (!SKU) return; // Ignora SKUs vazios ou nulos

      window.napi
        .catalog()
        .getProduct(SKU)
        .then(function (value) {
          try {
            // Verificar se o valor retornado é válido
            if (!value) {
              console.error(`Produto com SKU ${SKU} não encontrado`);
              return;
            }

            // Extrair dados do produto com verificações de segurança
            const pdpURL = value.pdpURLs?.desktop || "";
            const productName = value.name || "Nome indisponível";
            const productImage = value.slides[0]?.url || "";
            const productDescription =
              value.headline || "Descrição indisponível";
            const salesMultiple = value.salesMultiple || 1;
            const productPrice = ((value.price || 0) * salesMultiple)
              .toFixed(2)
              .replace(".", ",");
            const pricePerCapsule = (value.price || 0)
              .toFixed(2)
              .replace(".", ",");

            // Verificar a intensidade com segurança para evitar erros
            const intensity = value.capsuleProperties?.intensity || 0;

            // Verificar se é para café gelado
            const isIced = value.attributes?.isIced;

            // Determinar categoria do café
            const coffeeCategory = getCoffeeCategory(value) || "";

            // Definir o rótulo para café gelado
            const icedLabel = isIced
              ? '<div class="for-cold">FOR COLD</div>'
              : "";

            // Criar o novo card no estilo da imagem de referência
            let newCard = `
            <div class="coffee-card">
              <a href="${pdpURL}" class="card-link">
                ${icedLabel}
                <div class="product-image" style="background-image: url('https://www.nespresso.com/${productImage}?impolicy=medium&imwidth=800')">
                </div>
                </a>
                <div class="product-info">
                  <h3 class="product-name">${productName}</h3>
                  <p class="product-description">${productDescription}</p>
                  
                  ${
                    coffeeCategory
                      ? `
                  <div class="coffee-category">
                    <span class="category-icon"></span>
                    <span class="category-text">${coffeeCategory}</span>
                  </div>
                  `
                      : ""
                  }
                  
                  <div class="price-container">
                    <div class="price">R$ ${productPrice}</div>
                    <div class="price-details">10 Cápsulas<br>R$ ${pricePerCapsule}/capsula</div>
                  </div>
                  
                  <div class="add-to-bag" data-product-id="erp.br.b2c/prod/${SKU}" data-button-size="small"></div>
                </div>
              
            </div>
            `;

            // Verificar novamente se o container ainda existe
            if (container) {
              container.insertAdjacentHTML("beforeend", newCard);
            }
          } catch (productError) {
            console.error(`Erro ao processar produto ${SKU}:`, productError);
          }
        })
        .catch(function (error) {
          console.error(`Erro ao buscar produto ${SKU}:`, error);
        });
    });
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
      const sectionVitrine = `<div class="containerRecomendacoes" id="recomendationForYou"><div class="recomendacoesPersonalizadas"></div></div>`;
      blocoPagina.insertAdjacentHTML("afterend", sectionVitrine);

      // Cria vitrine baseada no quiz
      await criarVitrines(
        recommendedQuizSKUs,
        ".recomendacoesPersonalizadas",
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

          // Remover duplicatas e limitar a 10 SKUs
          const uniqueSKUs = [...new Set(allSKUs)].slice(0, 10);

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

            // Criar uma nova div para esta vitrine
            const lastOrdersContainer = document.createElement("div");
            lastOrdersContainer.className = "recomendacoesPedidosAnteriores";
            document
              .querySelector("#recomendationForYou")
              .appendChild(lastOrdersContainer);

            await criarVitrines(
              lastOrdersVitrine,
              ".recomendacoesPedidosAnteriores",
              lastOrdersVitrine.title,
              "Seus favoritos estão aqui"
            );
          }
        }
      } catch (orderError) {
        console.error("Erro ao buscar pedidos anteriores:", orderError);
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
          margin-top:12px;
        }
        
        /* Nova estrutura de vitrine com título ao lado */
        .vitrine-wrapper {
          display: flex;
          margin-bottom: 2rem;
          align-items: stretch;
        }
        
        .vitrine-title-container {
          flex: 0 0 360px;
          background-image: url('https://www.nespresso.com/static/us/solutions/homepage/assets/dsnes/RECOMMENDED%20FLAVOR_COLD/best-brews/Coffee-Swirl_Desktop_360x597.jpg?impolicy=medium&imwidth=360');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border-radius: 16px;
          margin-right: 1rem;
          position: relative;
          overflow: hidden;
        }
        
        .vitrine-title-content {
          text-align: center;
          color: #fff;
          z-index: 1;
        }
        
        .recomendacaoTitulo {
         font-weight: 500;
         text-align: left;
         font-size: 3.2rem;
         letter-spacing: 0.0625rem;
         line-height: 1.2;
         text-transform: none;
         color: rgb(255, 255, 255);
        }
        
        .vitrine-subtitle {
          font-weight: 500;
          text-align: left;
          font-size: 1.25rem;
          letter-spacing: 0.015625rem;
          line-height: 1.2;
          text-transform: none;
          color: rgb(255, 255, 255);
        }
        
        .recomendacoesPersonalizadas, 
        .recomendacoesPedidosAnteriores {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.5rem 0;
          scroll-snap-type: x mandatory;
          -ms-overflow-style: none;
          scrollbar-width: none;
          flex: 1;
        }
        
        .recomendacoesPersonalizadas::-webkit-scrollbar, 
        .recomendacoesPedidosAnteriores::-webkit-scrollbar {
          display: none;
        }
        
        .recomendacoesPersonalizadas *, 
        .recomendacoesPedidosAnteriores * {
          font-family: NespressoLucas, Helvetica, Arial, sans-serif;
        }
        
        .coffee-card {
          flex: 0 0 auto;
          width: 22.5rem;
          border-radius: 16px;
          border: 1px solid rgb(231, 231, 231);
          overflow: hidden;
          position: relative;
          background-color: #fff;
          scroll-snap-align: start;
          transition: transform 0.3s ease;
        }
        
        .coffee-card:hover {
          transform: translateY(-5px);
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
              margin-top:8px;
        }
        
        .coffee-category {
          display: flex;
          align-items: center;
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
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .vitrine-wrapper {
            flex-direction: column;
          }
          
          .vitrine-title-container {
            flex: 0 0 auto;
            width: 100%;
            height: 200px;
            margin-right: 0;
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .coffee-card {
            width: 15rem;
          }
          
          .product-image {
            height: 12rem;
          }
          
          .recomendacaoTitulo {
            font-size: 1.8rem;
          }
          
          .vitrine-subtitle {
            font-size: 1rem;
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
