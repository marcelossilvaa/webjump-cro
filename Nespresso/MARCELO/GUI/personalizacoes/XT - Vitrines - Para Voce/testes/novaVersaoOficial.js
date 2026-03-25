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
      // Implementação para tecnologia "vertuo" pode ser adicionada aqui
      console.log("Tecnologia Vertuo: implementação pendente");
    }

    return novaVitrine;
  }

  // Função principal para inicializar o processo
  function initializePersonalizedShowcases() {
    try {
      const quizData = getQuizDataFromLocalStorage();
      if (!quizData) {
        console.log(
          "Nenhum dado de quiz encontrado para criar vitrines personalizadas"
        );
        return;
      }

      const mappedResponses = mapResponsesByQuestionId(quizData);
      const recommendedSKUs = determineSKUs(mappedResponses);
      const iconsSizes = {
        ristretto:
          "https://www.nespresso.com/shared_res/agility/next-components/assets/icons/24/cupsize/cupsize-ristretto-ol.svg",
        espresso:
          "https://www.nespresso.com/shared_res/agility/next-components/assets/icons/24/cupsize/cupsize-espresso-ol.svg",
        lungo:
          "https://www.nespresso.com/shared_res/agility/next-components/assets/icons/24/cupsize/cupsize-lungo-ol.svg",
      };
      // Verificar se temos recomendações válidas
      if (!recommendedSKUs.title || recommendedSKUs.SKUs.length === 0) {
        console.log("Nenhuma recomendação encontrada para o perfil atual");
        return;
      }

      console.log("Vitrines personalizadas criadas com sucesso!");
      // Remova ou comente o alert para evitar interrupções na experiência do usuário
      // alert(`Título Vitrine: ${recommendedSKUs.title}\n SKUs: ${recommendedSKUs.SKUs}`);

      const blocoPagina = document.querySelector("#block-8833222727157");
      if (!blocoPagina) {
        console.error(
          "Elemento de referência #block-8833222727157 não encontrado"
        );
        return;
      }

      // Cria a seção de vitrine
      const sectionVitrine = `<div class="containerRecomendacoes" id="recomendationForYou"><h1 class="recomendacaoTitulo">${recommendedSKUs.title}</h1><div class="recomendacoesPersonalizadas"></div></div>`;
      blocoPagina.insertAdjacentHTML("afterend", sectionVitrine);

      // Verifica se o elemento foi criado antes de continuar
      const recomendacoesContainer = document.querySelector(
        ".recomendacoesPersonalizadas"
      );
      if (!recomendacoesContainer) {
        console.error(
          "Elemento .recomendacoesPersonalizadas não foi criado corretamente"
        );
        return;
      }

      // Adiciona os produtos
      recommendedSKUs.SKUs.forEach(function (SKU) {
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
              const productName = value.name || "Nome indisponível";
              const productImage = value.responsiveImages?.plp || "";
              const productDescription =
                value.headline || "Descrição indisponível";
              const salesMultiple = value.salesMultiple || 1;
              const productPrice = ((value.price || 0) * salesMultiple)
                .toFixed(2)
                .replace(".", ",");
              const pricePerCapsule = (value.price || 0)
                .toFixed(2)
                .replace(".", ",");

              const cupSizes = value.capsuleCupSizes;

              const intensity = value.capsuleProperties.intensity || 0;

              let cupSizesHTML = "";
              if (cupSizes && cupSizes.length > 0) {
                cupSizes.forEach(function (size) {
                  let newSizeInsert = "";
                  let newSizeIcon = "";
                  switch (size.toLowerCase()) {
                    case "ristretto":
                      newSizeIcon = iconsSizes.ristretto;
                      newSizeInsert = "Ristretto";
                      break;
                    case "espresso":
                      newSizeIcon = iconsSizes.espresso;
                      newSizeInsert = "Espresso";
                      break;

                    case "lungo":
                      newSizeIcon = iconsSizes.lungo;
                      newSizeInsert = "Lungo";
                      break;
                  }
                  if (newSizeInsert && newSizeIcon) {
                    const newSizeHTML = `<div class="info-box">
        <div style="font-size: 16px; margin-bottom: 5px"><img src="${newSizeIcon}"></div>
        <span class="info-label">${newSizeInsert}</span>
      </div>`;
                    cupSizesHTML += newSizeHTML;
                  }
                });
              }

              let newCard = `<div class="card">
    <div class="product-image">
      <img src="${productImage}?impolicy=small&imwidth=112&imdensity=1" alt="${productName}" />
    </div>
  
    <div class="info-row">
      <div class="info-box">
        <div class="intensity-circle">${intensity}</div>
        <span class="info-label">Intensidade</span>
      </div>
      ${cupSizesHTML}
    </div>
  
    <div class="product-info">
      <h3 class="product-name">${productName}</h3>
      <p class="product-description">
        ${productDescription}
      </p>
  
      <div class="price">R$ ${productPrice}</div>
      <div class="capsule-info">${salesMultiple} cápsulas</div>
      <div class="capsule-info">R$ ${pricePerCapsule}/cápsula</div>
      <div class="add-to-bag" data-product-id="erp.br.b2c/prod/${SKU}" data-button-size="small"></div>
    </div>
  </div>
  `;

              // Verificar novamente se o container ainda existe
              const container = document.querySelector(
                ".recomendacoesPersonalizadas"
              );
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

      // Adicionar estilos CSS
      addStyles();

      // Inicializar módulos usando MutationObserver em vez de setTimeout
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
          flex-wrap: wrap;
        }
        
        .recomendacoesPersonalizadas, .recomendacoesPersonalizadas *{
          font-family:NespressoLucas, Helvetica, Arial, sans-serif
        }
        .recomendacoesPersonalizadas .card {
              width: 220px;
              border-radius: 8px;
              overflow: hidden;
              position: relative;
              margin-bottom: 12px;
              border:1px solid #e7e7e7;
              transition: box-shadow .2s ease-in-out;
          }
        .recomendacoesPersonalizadas .card:hover{
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              cursor:pointer;
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
              background-color:#F3EEE6;
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
              border: 1px dashed #655032;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #655032;
              font-weight: bold;
              margin-bottom: 5px;
          }
          
          .recomendacoesPersonalizadas .info-label {
              font-size: 12px;
              color: #655032;
              font-weight:700;
          }
          
          .recomendacoesPersonalizadas .product-info {
              padding: 15px;
          }
          
          .recomendacoesPersonalizadas .product-name {
              font-size: 1rem;
              margin-bottom: 5px;
              color:#17171A;
              font-weight:700;
          }
          
          .recomendacoesPersonalizadas .product-description {
              font-size: 12px;
              color:#17171A;
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
              font-weight:500;
              color: #454547;
              margin-top: 2px;
          }
          
          .recomendacoesPersonalizadas .add-to-bag{
              position:absolute;
              right:10px;
              bottom:10px;
          }
          .recomendacoesPersonalizadas .add-to-bag button {
            border-radius: 30px;
          }
        `;
      document.head.appendChild(styleElement);
    }
  }

  function initializeMosaicModules() {
    // Usar MutationObserver para inicializar os módulos quando o elemento estiver pronto
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
