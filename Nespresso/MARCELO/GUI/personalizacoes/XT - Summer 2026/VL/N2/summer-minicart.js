(function () {
  if (window.minicartSummerRecommendations) {
    return;
  }
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
  window.minicartSummerRecommendations = "true";

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

  // SKUs que excluem a exibição da comunicação
  const excludedSkus = [
    "7906.90", //Pistachio Vanilla OL
    "7908.90", //Coconut Vanilla OL
    "7883.90", //Freddo Intenso OL
    "7870.90", //Freddo Delicato OL
    "7070.80", //Coconut Vanilla VL
    "7068.80", //Pistachio Vanilla Flavour Over Ice VL
    "7018.80", //Ice Leggero VL
    "7278.10", //Cold Brew Style VL
  ];

  // SKUs para recomendações de produtos
  const recommendationSkus = ["7070.80", "7068.80", "7018.80"];

  // Níveis de presentes para Campanha
  const giftTiersCampaign = [
    { threshold: 70, gift: "1 Kit para Drinks" },
    { threshold: 120, gift: "1 Copo para Drinks + 1 Forma de Gelo" },
    { threshold: 180, gift: "1 Bolsa Térmica" },
  ];

  // Função para obter o próximo presente baseado na quantidade de cápsulas
  const getNextGift = (totalCapsules) => {
    // Sempre usa os níveis de presentes de OL
    const giftTiers = giftTiersCampaign;
    const firstTierThreshold = giftTiers[0].threshold;

    // Verifica se o cliente está a 10 ou menos cápsulas do 1° nível
    const capsulesTo1stTier = firstTierThreshold - totalCapsules;
    const isCloseToFirstTier = capsulesTo1stTier <= 10 && capsulesTo1stTier > 0;

    // Verifica se o cliente já está em algum nível (já tem cápsulas suficientes para ganhar)
    const isInAnyTier = totalCapsules >= firstTierThreshold;

    // Encontra o nível atual do cliente
    let currentTier = null;
    for (let i = giftTiers.length - 1; i >= 0; i--) {
      if (totalCapsules >= giftTiers[i].threshold) {
        currentTier = giftTiers[i];
        break;
      }
    }

    // Encontra o próximo tier que o cliente ainda pode alcançar
    for (const tier of giftTiers) {
      if (totalCapsules < tier.threshold) {
        const capsulesNeeded = tier.threshold - totalCapsules;
        return {
          gift: tier.gift,
          capsulesNeeded: capsulesNeeded,
          threshold: tier.threshold,
          currentTier: currentTier,
          isInAnyTier: isInAnyTier,
          isCloseToFirstTier: isCloseToFirstTier,
          shouldShow: isInAnyTier || isCloseToFirstTier,
        };
      }
    }

    // Se já atingiu todos os níveis, retorna o último presente
    const lastTier = giftTiers[giftTiers.length - 1];
    return {
      gift: lastTier.gift,
      capsulesNeeded: 0,
      threshold: lastTier.threshold,
      currentTier: lastTier,
      isInAnyTier: true,
      isCloseToFirstTier: false,
      shouldShow: true,
      reachedMax: true,
    };
  };

  // Função para gerar a comunicação dinâmica
  const generateDynamicCommunication = (
    nextGiftInfo,
    totalCapsules,
    technology
  ) => {
    let message;

    if (nextGiftInfo.reachedMax) {
      message =
        '<span style="font-size: 12px;">Você já garantiu o presente máximo: <strong>' +
        nextGiftInfo.gift +
        "</strong></span>";
    } else {
      // Calcula qual será o total de cápsulas após adicionar 10 das recomendações
      const totalWithRecommendations = totalCapsules + 10;

      // Determina qual presente será desbloqueado com as 10 cápsulas adicionadas
      // Sempre usa os níveis de presentes de OL
      const giftTiers = giftTiersCampaign;
      let giftToUnlock = null;

      // Verifica qual nível será alcançado com as 10 cápsulas adicionadas
      for (let i = 0; i < giftTiers.length; i++) {
        if (
          totalCapsules < giftTiers[i].threshold &&
          totalWithRecommendations >= giftTiers[i].threshold
        ) {
          giftToUnlock = giftTiers[i].gift;
          break;
        }
      }

      // Se não desbloquear um novo nível, mas já está em um nível, mostra o nível atual
      if (!giftToUnlock && nextGiftInfo.currentTier) {
        giftToUnlock = nextGiftInfo.currentTier.gift;
      }

      // Se ainda não há presente a desbloquear (está abaixo do primeiro nível), mostra o próximo
      if (!giftToUnlock) {
        giftToUnlock = nextGiftInfo.gift;
      }

      message =
        '<span style="font-size: 12px;">Adicione <strong>10 cafés da linha Summer</strong> e ganhe <strong>' +
        giftToUnlock +
        "</strong></span>";
    }

    return {
      html:
        '<div style="padding:8px 0;text-align:left">\
        <div style="display:inline-block;width: 100%;padding:8px 12px 14px; font-size: 14px;background-color: #BBD996;border-radius: 8px; color:#002354;">\
        <strong style="font-size: 14px; font-style: italic; font-weight: 800;">ATIVE SEU PRESENTE</strong>\
        <br>\
        ' +
        message +
        '\
        <div class="minicart-recommendations" id="minicart-recommendations-container"></div>\
        </div>\
      </div>',
    };
  };

  // Função para detectar a tecnologia e contar cápsulas no carrinho
  const detectCartTechnologyAndCount = async (cartItems) => {
    let hasOL = false;
    let hasVL = false;
    let totalCapsules = 0;
    try {
      // Filtrar apenas produtos adicionados pelo usuário (excluir presentes)
      const userAddedItems = cartItems.filter(
        (item) => item.nonRemovable === false
      );

      // Buscar informações de cada produto no carrinho
      const productPromises = userAddedItems.map((item) => {
        const sku = item.productId.split("/").pop();
        return window.napi
          .catalog()
          .getProduct(sku)
          .then((product) => ({
            product,
            quantity: item.quantity,
          }));
      });

      const productsWithQuantity = await Promise.all(productPromises);

      productsWithQuantity.forEach(({ product, quantity }) => {
        const technology = product.technologies?.[0] || "";

        // Conta apenas cápsulas
        if (product.type === "capsule") {
          totalCapsules += quantity;
        }

        if (technology.includes("original")) {
          hasOL = true;
        } else if (technology.includes("vertuo")) {
          hasVL = true;
        }
      });
    } catch (error) {
      console.error("Erro ao detectar tecnologia do carrinho:", error);
      // Em caso de erro, assume OL como padrão
      hasOL = true;
    }

    // Regra: Só recomenda VL se tiver APENAS produtos VL no carrinho
    // OL + VL = OL | Só OL = OL | Só VL = VL
    let technology = "OL";
    if (hasVL && !hasOL) {
      technology = "VL";
    }

    return { technology, totalCapsules };
  };

  // Função para renderizar as recomendações de produtos
  const renderRecommendations = async (skusToRecommend) => {
    const container = document.getElementById(
      "minicart-recommendations-container"
    );
    if (!container) return;

    // Criar estrutura HTML para as recomendações
    let recommendationsHTML =
      '<div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 12px;">';

    try {
      // Buscar informações de cada produto
      const productPromises = skusToRecommend.map((sku) =>
        window.napi.catalog().getProduct(sku)
      );

      const products = await Promise.all(productPromises);

      products.forEach((product, index) => {
        const sku = skusToRecommend[index];
        const imageUrl = product.responsiveImages?.plp || "";
        const productName = product.name || "";

        recommendationsHTML +=
          `
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1; background-color: #D6E8C0; border-radius: 8px; padding:0px 8px; position: relative;">
            <img src="` +
          imageUrl +
          `?impolicy=product&imwidth=60" alt="` +
          productName +
          `" style="width: 40px; height: auto; margin-bottom: 4px;" />
            <span style="font-size: 10px; text-align: center; color: #002354;font-weight: 700; line-height: 1.2; margin-bottom: 6px;">` +
          productName +
          `</span>
            <div class="add-to-bag" data-product-id="erp.br.b2c/prod/` +
          sku +
          `" data-button-size="small" style="position:absolute; bottom: -15px; right: -5px;"></div>
          </div>
        `;
      });

      recommendationsHTML += "</div>";
      container.innerHTML = recommendationsHTML;

      // Inicializar os botões de add_to_cart
      mosaic.initializeAllFreeHTMLModules(
        document.getElementById("minicart-recommendations-container")
      );

      // Adicionar evento de GA para cliques nos botões
      container.querySelectorAll(".add-to-bag").forEach((btn, index) => {
        btn.addEventListener("click", () => {
          sendGAEvent("recomendacao_add_" + skusToRecommend[index]);
        });
      });
    } catch (error) {
      console.error("Erro ao carregar recomendações:", error);
      container.innerHTML = "";
    }
  };

  // Função para verificar se algum SKU excluído está no carrinho
  const hasExcludedSku = (cartItems) => {
    return cartItems.some((item) => {
      // Extrai o SKU do productId (formato: "erp.br.b2c/prod/7895.90")
      if (item.nonRemovable === false) {
        const productId = item.productId || "";
        const sku = productId.split("/").pop();
        return excludedSkus.includes(sku);
      }
    });
  };

  const isMobileDevice = () => {
    return window.innerWidth <= 767;
  };

  const addAnimationStyles = () => {
    if (document.getElementById("nespresso-offers-styles-recommendations"))
      return;

    const styleEl = document.createElement("style");
    styleEl.id = "nespresso-offers-styles-recommendations";
    styleEl.textContent = `
               .MiniBasketDropdown__wrapper #minicart-freight-component, .MiniBasketDropdown__dropdown .BenefitMessage{
                      display:none !important;
                    }
                #minicart-recommendations-container .add-to-bag button.AddToBagButton {
                      border-radius:23px;
                      width: 30px;
                      height: 30px;
                    }
                #minicart-recommendations-container .add-to-bag button.AddToBagButton .AddToBagButtonSmall__quantity{
                      top:6px !important;
                }
                 #minicart-recommendations-container .add-to-bag button.AddToBagButton .AddToBagButtonSmall__quantity i{
                      font-size:16px !important;
                 }
                 
                 @media (max-width: 540px){
                 #minicart-recommendations-container .add-to-bag button.AddToBagButton {
                      border-radius:23px;
                      width: 20px;
                      height: 20px;
                    }
                 #minicart-recommendations-container .add-to-bag button.AddToBagButton .AddToBagButtonSmall__quantity{
                      top:2px !important;
                }
                 #minicart-recommendations-container .add-to-bag button.AddToBagButton .AddToBagButtonSmall__quantity i{
                      font-size:14px !important;
                 }

                 }
                    @keyframes fadeInScale {
                      0% { opacity: 0; transform: scale(0.8); }
                      100% { opacity: 1; transform: scale(1); }
                    }
                    
                    .nespresso-component-enter {
                      animation: fadeInScale 0.5s ease-out forwards;
                    }
                  `;
    document.head.appendChild(styleEl);
  };

  const createOffersComponent = () => {
    const existingComponent = document.getElementById(
      "nespresso-recomendacoes-cafes-summer"
    );
    if (existingComponent) {
      existingComponent.remove();
    }

    const container = document.createElement("div");
    container.id = "nespresso-recomendacoes-cafes-summer";
    container.style.cssText =
      "padding: 0px 8px 8px; font-family: NespressoLucas, sans-serif; opacity: 0;";
    container.classList.add("nespresso-component-enter");
    container.innerHTML =
      '<div class="loading" style="text-align: center; padding: 8px;">Carregando ofertas...</div>';

    const targetElement = document.querySelector(
      ".MiniBasketDropdown__content-wrapper"
    );

    if (targetElement) {
      targetElement.insertAdjacentElement("afterend", container);
      setTimeout(() => {
        container.style.opacity = "1";
      }, 50);
    } else {
      console.warn("Target element for Nespresso offers component not found");
    }

    return container;
  };

  // Renderiza a comunicação dinâmica no container
  const renderOffersComponent = async (container, cartItems) => {
    // Detecta a tecnologia e conta as cápsulas no carrinho
    const { technology, totalCapsules } = await detectCartTechnologyAndCount(
      cartItems
    );

    // Calcula o próximo presente disponível
    const nextGiftInfo = getNextGift(totalCapsules, technology);

    // Verifica se deve mostrar a comunicação
    // Só mostra se: já está em algum nível OU faltam 10 ou menos cápsulas para o 1° nível
    if (!nextGiftInfo.shouldShow) {
      container.style.display = "none";
      return;
    }

    // Gera a comunicação dinâmica baseada no próximo presente (passando totalCapsules e technology)
    const dynamicCommunication = generateDynamicCommunication(
      nextGiftInfo,
      totalCapsules,
      technology
    );

    container.innerHTML = dynamicCommunication.html;
    container.style.display = "block";
    container.style.opacity = "1";

    // Evento GA: componente ativo e visível para o usuário
    sendGAEvent("ativou_recomendacoes_summer_minicart");

    // Sempre usa os SKUs de OL para recomendação
    const skusToRecommend = recommendationSkus;

    // Renderiza as recomendações de produtos
    renderRecommendations(skusToRecommend);
  };

  const handleCartUpdate = () => {
    const container = createOffersComponent();

    window.napi
      .cart()
      .read()
      .then((data) => {
        // Se o carrinho estiver vazio, esconde a comunicação
        if (data.length === 0) {
          container.style.display = "none";
          return;
        }

        // Verifica se algum SKU excluído está no carrinho
        if (hasExcludedSku(data)) {
          container.style.display = "none";
          return;
        }

        // Exibe a comunicação padrão passando os dados do carrinho
        renderOffersComponent(container, data);
      })
      .catch((err) => {
        console.error("Error reading cart:", err);
        container.innerHTML = ``;
        container.style.display = "none";
      });
  };

  const watchForMinicartOpen = () => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const addedNodes = Array.from(mutation.addedNodes);

          for (const node of addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const isMiniCart =
                node.classList &&
                node.classList.contains("MiniBasketDropdown__wrapper");
              const containsMiniCart =
                node.querySelector &&
                node.querySelector(".MiniBasketDropdown__wrapper");

              if (isMiniCart || containsMiniCart) {
                setTimeout(() => {
                  handleCartUpdate();
                }, 100);
                break;
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  };

  const handleResize = () => {
    const existingComponent = document.getElementById(
      "nespresso-recomendacoes-cafes-summer"
    );
    if (existingComponent) {
      handleCartUpdate();
    }
  };

  const initOffersComponent = () => {
    addAnimationStyles();

    const observer = watchForMinicartOpen();

    if (window.napi && window.napi.data) {
      window.napi.data().on("cart.update", handleCartUpdate);
    }

    window.addEventListener("resize", handleResize);

    window.nespressoOffersObserver = observer;
  };

  const waitForNapi = setInterval(() => {
    if (window.napi) {
      clearInterval(waitForNapi);
      initOffersComponent();
    }
  }, 500);

  setTimeout(() => {
    clearInterval(waitForNapi);
    if (!window.napi) {
      console.error("Nespresso API not available after 10 seconds");
    }
  }, 10000);
})();
