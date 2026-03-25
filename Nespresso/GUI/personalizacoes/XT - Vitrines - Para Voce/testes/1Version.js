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

  // Função para mapear as respostas por ID da pergunta
  function mapResponsesByQuestionId(quizData) {
    if (!quizData || !quizData.response || !Array.isArray(quizData.response)) {
      return {};
    }

    const mappedResponses = {};

    quizData.response.forEach((response) => {
      // Verificar se é um array (como na pergunta de tipos de café)
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

  // Função para determinar SKUs com base nas respostas
  function determineSKUs(mappedResponses) {
    const recommendedSKUs = {
      technology: [],
      intensity: [],
      milk_coffee: [],
      milk_type: [],
      cup_size: [],
      origins: [],
      coffee_types: [],
    };

    // Verificar tecnologia (Original ou Vertuo)
    if (mappedResponses.technology === "original") {
      recommendedSKUs.technology = ["SKU001", "SKU002", "SKU003"];
    } else if (mappedResponses.technology === "vertuo") {
      recommendedSKUs.technology = ["SKU101", "SKU102", "SKU103"];
    }

    // Verificar intensidade
    if (mappedResponses.intensity === "mild") {
      recommendedSKUs.intensity = ["SKU201", "SKU202", "SKU203"];
    } else if (mappedResponses.intensity === "medium") {
      recommendedSKUs.intensity = ["SKU204", "SKU205", "SKU206"];
    } else if (mappedResponses.intensity === "intense") {
      recommendedSKUs.intensity = ["SKU207", "SKU208", "SKU209"];
    }

    // Verificar se toma café com leite
    if (mappedResponses.milk_coffee === "yes") {
      recommendedSKUs.milk_coffee = ["SKU301", "SKU302"];
    } else if (mappedResponses.milk_coffee === "no") {
      recommendedSKUs.milk_coffee = ["SKU303", "SKU304"];
    }

    // Verificar tipo de leite
    if (mappedResponses.milk_type === "plant") {
      recommendedSKUs.milk_type = ["SKU401", "SKU402"];
    } else if (mappedResponses.milk_type === "cow") {
      recommendedSKUs.milk_type = ["SKU403", "SKU404"];
    }

    // Verificar tamanho da xícara
    if (mappedResponses.cup_size === "short") {
      recommendedSKUs.cup_size = ["SKU501", "SKU502"];
    } else if (mappedResponses.cup_size === "medium") {
      recommendedSKUs.cup_size = ["SKU503", "SKU504"];
    } else if (mappedResponses.cup_size === "long") {
      recommendedSKUs.cup_size = ["SKU505", "SKU506"];
    }

    // Verificar origens
    if (mappedResponses.origins === "yes") {
      recommendedSKUs.origins = ["SKU601", "SKU602"];
    } else if (mappedResponses.origins === "no") {
      recommendedSKUs.origins = ["SKU603", "SKU604"];
    }

    // Verificar tipos de café (pode ser múltipla escolha)
    if (Array.isArray(mappedResponses.coffee_types)) {
      if (mappedResponses.coffee_types.includes("flavoured")) {
        recommendedSKUs.coffee_types.push("SKU701", "SKU702");
      }
      if (mappedResponses.coffee_types.includes("espresso")) {
        recommendedSKUs.coffee_types.push("SKU703", "SKU704");
      }
      if (mappedResponses.coffee_types.includes("lungo")) {
        recommendedSKUs.coffee_types.push("SKU705", "SKU706");
      }
      // Adicione mais condições conforme necessário
    }

    return recommendedSKUs;
  }

  // Função para criar vitrines com base nos SKUs recomendados
  function createShowcases(recommendedSKUs) {
    // Exemplo de criação de uma vitrine para cada categoria
    const showcaseContainer =
      document.getElementById("nespresso-showcases") ||
      document.createElement("div");
    if (!showcaseContainer.id) {
      showcaseContainer.id = "nespresso-showcases";
      document.body.appendChild(showcaseContainer);
    }

    // Limpar o container antes de adicionar novas vitrines
    showcaseContainer.innerHTML = "";

    // Estilo para as vitrines usando template strings
    const showcaseStyles = `
      .nespresso-showcase {
        margin-bottom: 30px;
        padding: 20px;
        border-radius: 8px;
        background-color: #f8f8f8;
      }
      .nespresso-showcase-title {
        font-size: 24px;
        margin-bottom: 15px;
        color: #3c3c3c;
        font-weight: 600;
      }
      .nespresso-products {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      .nespresso-product {
        width: calc(33.333% - 20px);
        min-width: 200px;
        padding: 15px;
        border-radius: 5px;
        background-color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }
      .nespresso-product:hover {
        transform: translateY(-5px);
      }
      .nespresso-product-image {
        width: 100%;
        height: 200px;
        object-fit: contain;
        margin-bottom: 10px;
      }
      .nespresso-product-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 5px;
      }
      .nespresso-product-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }
      .nespresso-product-price {
        font-size: 18px;
        font-weight: 600;
        color: #000;
        margin-bottom: 15px;
      }
      .nespresso-buy-button {
        display: inline-block;
        padding: 8px 16px;
        background-color: #12783f;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        text-decoration: none;
        transition: background-color 0.3s ease;
      }
      .nespresso-buy-button:hover {
        background-color: #0e5e2f;
      }
    `;

    // Adicionar estilos à página
    const styleElement = document.createElement("style");
    styleElement.textContent = showcaseStyles;
    document.head.appendChild(styleElement);

    // Mapear títulos para cada categoria
    const categoryTitles = {
      technology: "Máquinas compatíveis",
      intensity: "Cafés com a intensidade que você gosta",
      milk_coffee: "Perfeito para seu café com leite",
      milk_type: "Ideal para o seu tipo de leite",
      cup_size: "Cafés no tamanho que você prefere",
      origins: "Cafés de origem única para você experimentar",
      coffee_types: "Variedades de café que combinam com seu gosto",
    };

    // Criar uma vitrine para cada categoria com SKUs recomendados
    Object.keys(recommendedSKUs).forEach((category) => {
      const skus = recommendedSKUs[category];
      if (skus && skus.length > 0) {
        const showcase = document.createElement("div");
        showcase.className = "nespresso-showcase";
        showcase.dataset.category = category;

        const title = document.createElement("h2");
        title.className = "nespresso-showcase-title";
        title.textContent = categoryTitles[category] || "Produtos recomendados";
        showcase.appendChild(title);

        const productsContainer = document.createElement("div");
        productsContainer.className = "nespresso-products";

        // Aqui você faria uma chamada à API da Nespresso ou usaria um objeto de mapeamento
        // para obter informações detalhadas sobre cada SKU
        skus.forEach((sku) => {
          const productElement = createProductElement(sku);
          productsContainer.appendChild(productElement);
        });

        showcase.appendChild(productsContainer);
        showcaseContainer.appendChild(showcase);
      }
    });
  }

  // Função para criar elementos de produto
  function createProductElement(sku) {
    // Esta função simularia a busca de informações do produto na API
    // Aqui você substituiria por dados reais da API da Nespresso

    // Dados simulados
    const productData = {
      title: `Café Nespresso ${sku}`,
      description: "Café em cápsula com sabor excepcional e aroma intenso.",
      price: "R$ 29,90",
      imageUrl: "https://www.nespresso.com/assets/placeholders/capsule.jpg",
    };

    const productElement = document.createElement("div");
    productElement.className = "nespresso-product";
    productElement.dataset.sku = sku;

    const imageElement = document.createElement("img");
    imageElement.className = "nespresso-product-image";
    imageElement.src = productData.imageUrl;
    imageElement.alt = productData.title;
    productElement.appendChild(imageElement);

    const titleElement = document.createElement("h3");
    titleElement.className = "nespresso-product-title";
    titleElement.textContent = productData.title;
    productElement.appendChild(titleElement);

    const descriptionElement = document.createElement("p");
    descriptionElement.className = "nespresso-product-description";
    descriptionElement.textContent = productData.description;
    productElement.appendChild(descriptionElement);

    const priceElement = document.createElement("div");
    priceElement.className = "nespresso-product-price";
    priceElement.textContent = productData.price;
    productElement.appendChild(priceElement);

    const buyButton = document.createElement("a");
    buyButton.className = "nespresso-buy-button";
    buyButton.href = `https://www.nespresso.com/br/pt/order/capsules/${sku}`;
    buyButton.textContent = "Comprar";
    productElement.appendChild(buyButton);

    return productElement;
  }

  // Função principal para inicializar o processo
  function initializePersonalizedShowcases() {
    const quizData = getQuizDataFromLocalStorage();
    if (!quizData) {
      console.log(
        "Nenhum dado de quiz encontrado para criar vitrines personalizadas"
      );
      return;
    }

    const mappedResponses = mapResponsesByQuestionId(quizData);
    const recommendedSKUs = determineSKUs(mappedResponses);
    createShowcases(recommendedSKUs);

    console.log("Vitrines personalizadas criadas com sucesso!");
  }

  // Inicializar quando o DOM estiver completamente carregado
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePersonalizedShowcases
    );
  } else {
    initializePersonalizedShowcases();
  }
})();
