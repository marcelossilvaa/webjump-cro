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

  function determineSKUs(mappedResponses) {
    const novaVitrine = { title: "", SKUs: [] };

    if (mappedResponses.technology === "original") {
      if (
        mappedResponses.intensity === "intense" &&
        mappedResponses.milk_coffee === "no" &&
        mappedResponses.coffee_types.includes("decaffeinated")
      ) {
        novaVitrine.title = "Clássico Descafeinado";
        novaVitrine.SKUs = ["7857.90", "7862.90", "7587.10"];
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
    }

    return novaVitrine;
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

    if (recommendedSKUs.title && recommendedSKUs.SKUs.length > 0) {
      console.log("Vitrines personalizadas criadas com sucesso!");
      alert(
        `Título Vitrine: ${recommendedSKUs.title}\n SKUs: ${recommendedSKUs.SKUs}`
      );
    }

    let blocoPagina = document.querySelector("#block-8833222727157");

    let sectionVitrine = `<div class="containerRecomendacoes" id="recomendationForYou"><h1 class="recomendacaoTitulo">${recommendedSKUs.title}</h1><div class="recomendacoesPersonalizadas"></div></div>`;
    blocoPagina.insertAdjacentHTML("afterend", sectionVitrine);
    recommendedSKUs.SKUs.forEach(function (SKU) {
      window.napi
        .catalog()
        .getProduct(SKU)
        .then(function (value) {
          let productName = value.name;
          let productImage = value.responsiveImages.plp;
          let productDescription = value.headline;
          let productPrice = (value.price * value.salesMultiple)
            .toFixed(2)
            .replace(".", ",");

          let newCard = `<div class="card">
  <div class="ml-label">40 ml</div>
  <div class="product-image">
    <img src="${productImage}?impolicy=small&imwidth=112&imdensity=1" alt="${productName}" />
  </div>

  <div class="info-row">
    <div class="info-box">
      <div class="intensity-circle">11</div>
      <span class="info-label">Intensidade</span>
    </div>
    <div class="info-box">
      <div style="font-size: 16px; margin-bottom: 5px">Icone</div>
      <span class="info-label">Espresso 40ml</span>
    </div>
  </div>

  <div class="product-info">
    <h3 class="product-name">${productName}</h3>
    <p class="product-description">
      ${productDescription}
    </p>

    <div class="price">R$ ${productPrice}</div>
    <div class="capsule-info">${value.salesMultiple} cápsulas</div>
    <div class="capsule-info">R$ ${value.price.toFixed(2)}/cápsula</div>
    <div class="add-to-bag" data-product-id="erp.br.b2c/prod/${SKU}" data-button-size="small"></div>
  </div>
</div>
`;

          document
            .querySelector(".recomendacoesPersonalizadas")
            .insertAdjacentHTML("beforeend", newCard);
        });
    });

    document.head.insertAdjacentHTML(
      "beforeend",
      `<style>
      .containerRecomendacoes{
        margin:auto;
        max-width:72.5rem;
        margin-top:1rem;
      }
      
      .containerRecomendacoes .recomendacaoTitulo{
        font-size:1.2rem;
        font-weight:700;
        margin-bottom:1rem;
      }
      .recomendacoesPersonalizadas{
        display:flex;
        gap:12px;
      }
      
      .recomendacoesPersonalizadas, .recomendacoesPersonalizadas *{
        font-family:NespressoLucas, Helvetica, Arial, sans-serif
      }
      .recomendacoesPersonalizadas .card {
            width: 220px;
            background-color: var(--background-color);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .recomendacoesPersonalizadas .ml-label {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: #222;
            color: white;
            font-size: 12px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .recomendacoesPersonalizadas .product-image {
            display: flex;
            justify-content: center;
            padding: 20px 0;
            background-color:#F3EEE6;
        }
        
        .recomendacoesPersonalizadas .product-image img {
            height: auto;
            max-width:120px;
        }
        
        .recomendacoesPersonalizadas .info-row {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .recomendacoesPersonalizadas .info-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;
            border-right: 1px solid #e0e0e0;
        }
        
        .recomendacoesPersonalizadas .info-box:last-child {
            border-right: none;
        }
        
        .recomendacoesPersonalizadas .intensity-circle {
            width: 28px;
            height: 28px;
            border: 1px dashed var(--accent-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent-color);
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .recomendacoesPersonalizadas .info-label {
            font-size: 12px;
            color: var(--accent-color);
        }
        
        .recomendacoesPersonalizadas .product-info {
            padding: 15px;
        }
        
        .recomendacoesPersonalizadas .product-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .recomendacoesPersonalizadas .product-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        
        .recomendacoesPersonalizadas .price {
            font-size: 18px;
            font-weight: bold;
            color: #257a57;
        }
        
        .recomendacoesPersonalizadas .capsule-info {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }
        
        .recomendacoesPersonalizadas .subscription-price {
            display: block;
            background-color: var(--discount-color);
            color: white;
            padding: 6px 10px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
            border-radius: 4px;
        }
        
        .recomendacoesPersonalizadas .add-to-bag{
            position:absolute;
            right:10px;
            bottom:10px;
        }
        
        </style>    
        `
    );

    setTimeout(function () {
      mosaic.initializeAllFreeHTMLModules(
        document.getElementById("recomendationForYou")
      );
    }, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePersonalizedShowcases
    );
  } else {
    initializePersonalizedShowcases();
  }
})();
