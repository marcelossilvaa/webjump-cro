(function () {
  if (window.campaignProgressBar) {
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
  window.campaignProgressBar = "true";

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
  // Configurações para cápsulas (comunicação 1) - agora apenas HTML da comunicação
  const capsuleGiftTiers = [
    {
      html: '<div style="padding:8px 0;text-align:center">\
          <div style="display:inline-block;padding:8px 12px; font-size: 14px;background-color: #c17a81;border-radius: 6px; color:#fff;">\
          <strong style="font-size: 18px;">GANHE ATÉ R$ 250 OFF</strong>\
          <br>\
          <span>a partir de 100 cafés + </span>\
            <strong>45% OFF </strong>\
            <span>em acessórios selecionados</span>\
          </div>\
        </div>',
    },
  ];

  // Configurações para máquinas (comunicação 2) - agora apenas HTML da comunicação
  const machineGiftTiers = [
    {
      html: '<div style="padding:8px 0;text-align:center">\
          <div style="display:inline-block;padding:8px 12px; font-size: 16px;background-color: #c17a81;border-radius: 6px; color:#fff;">\
          <span>Máquinas com até </span>\
            <strong> 60% OFF + R$ 150 em cafés*</strong>\
          </div>\
          <br>\
          <p style="font-size: 12px; color: #666; margin-top: 8px;">*Oferta válida para novos membros, consulte condições.</p>\
        </div>',
    },
  ];

  // Configurações para acessórios (comunicação 3) - agora apenas HTML da comunicação
  const accessoryGiftTiers = [
    {
      html: '<div style="padding:8px 0;text-align:center">\
          <div style="display:inline-block;padding:8px 12px; font-size: 14px;background-color: #c17a81;border-radius: 6px; color:#fff;">\
          <strong style="font-size: 16px;">GANHE ATÉ 45% OFF</strong>\
          <br>\
          <span>na compra a partir de 60 cafés</span>\
            <span>em acessórios selecionados</span>\
          </div>\
        </div>',
    },
  ];

  let previousCapsuleCount = 0;
  let previousMachineCount = 0;
  let previousAccessoryCount = 0;

  const storeCapsuleCount = (count) => {
    localStorage.setItem("nespresso-offers-capsule-count", count.toString());
  };

  const getStoredCapsuleCount = () => {
    const stored = localStorage.getItem("nespresso-offers-capsule-count");
    return stored ? parseInt(stored, 10) : 0;
  };

  const storeMachineCount = (count) => {
    localStorage.setItem("nespresso-offers-machine-count", count.toString());
  };

  const getStoredMachineCount = () => {
    const stored = localStorage.getItem("nespresso-offers-machine-count");
    return stored ? parseInt(stored, 10) : 0;
  };

  const storeAccessoryCount = (count) => {
    localStorage.setItem("nespresso-offers-accessory-count", count.toString());
  };

  const getStoredAccessoryCount = () => {
    const stored = localStorage.getItem("nespresso-offers-accessory-count");
    return stored ? parseInt(stored, 10) : 0;
  };

  const isMobileDevice = () => {
    return window.innerWidth <= 767;
  };

  const addAnimationStyles = () => {
    if (document.getElementById("nespresso-offers-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "nespresso-offers-styles";
    styleEl.textContent = `
              .MiniBasketDropdown__wrapper .BenefitMessage, .MiniBasketDropdown__wrapper #minicart-freight-component{
                      display:none !important;
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
      "nespresso-mothers-day-offers"
    );
    if (existingComponent) {
      existingComponent.remove();
    }

    const container = document.createElement("div");
    container.id = "nespresso-mothers-day-offers";
    container.style.cssText =
      "padding: 0px 8px 8px; border-radius: 8px; border-bottom:1px solid #efefef; font-family: NespressoLucas, sans-serif; opacity: 0;";
    container.classList.add("nespresso-component-enter");
    container.innerHTML =
      '<div class="loading" style="text-align: center; padding: 8px;">Carregando ofertas...</div>';

    const targetElement = document.querySelector(".MiniBasketDropdown__header");

    if (targetElement) {
      targetElement.insertAdjacentElement("afterend", container);
      sendGAEvent("ativou_regua_ofertas");
      setTimeout(() => {
        container.style.opacity = "1";
      }, 50);
    } else {
      console.warn("Target element for Nespresso offers component not found");
    }

    return container;
  };

  const isCapsule = (product) => {
    return product && product.type === "capsule";
  };

  const isMachine = (product) => {
    return product && product.type === "machine";
  };

  const isAccessory = (product) => {
    return product && product.type === "accessory";
  };

  // Removido: lógica de tiers/nextTier (não é mais utilizada)

  const renderOffersComponent = (
    container,
    totalCapsules,
    totalMachines,
    totalAccessories
  ) => {
    // Determinar qual tipo de produto tem no carrinho
    let productType = null;
    let totalCount = 0;

    if (totalCapsules > 0) {
      productType = "capsule";
      totalCount = totalCapsules;
    } else if (totalMachines > 0) {
      productType = "machine";
      totalCount = totalMachines;
    } else if (totalAccessories > 0) {
      productType = "accessory";
      totalCount = totalAccessories;
    }

    if (totalCount === 0) {
      container.style.display = "none";
      previousCapsuleCount = 0;
      previousMachineCount = 0;
      previousAccessoryCount = 0;
      storeCapsuleCount(0);
      storeMachineCount(0);
      storeAccessoryCount(0);
      return;
    } else {
      container.style.display = "block";
    }
    // Atualizar contadores baseado no tipo de produto
    if (productType === "capsule") {
      previousCapsuleCount = totalCount;
      storeCapsuleCount(totalCount);
    } else if (productType === "machine") {
      previousMachineCount = totalCount;
      storeMachineCount(totalCount);
    } else if (productType === "accessory") {
      previousAccessoryCount = totalCount;
      storeAccessoryCount(totalCount);
    }

    // Inserir HTML simplificado da comunicação
    let htmlContent = "";
    if (productType === "capsule") {
      htmlContent = (capsuleGiftTiers[0] && capsuleGiftTiers[0].html) || "";
    } else if (productType === "machine") {
      htmlContent = (machineGiftTiers[0] && machineGiftTiers[0].html) || "";
    } else if (productType === "accessory") {
      htmlContent = (accessoryGiftTiers[0] && accessoryGiftTiers[0].html) || "";
    }

    container.innerHTML = htmlContent;
    container.style.opacity = "1";
  };

  const countProducts = async (cartItems, container) => {
    let capsuleCount = 0;
    let machineCount = 0;
    let accessoryCount = 0;

    try {
      for (const item of cartItems) {
        try {
          const product = await window.napi
            .catalog()
            .getProduct(item.productId);

          if (isCapsule(product)) {
            if (product.bundled) {
              capsuleCount += product.unitQuantity * item.quantity;
            } else {
              capsuleCount += item.quantity;
            }
          } else if (isMachine(product)) {
            machineCount += item.quantity;
          } else if (isAccessory(product)) {
            accessoryCount += item.quantity;
          }
        } catch (productError) {
          console.error("Error fetching product details:", productError);
        }
      }

      renderOffersComponent(
        container,
        capsuleCount,
        machineCount,
        accessoryCount
      );
    } catch (error) {
      console.error("Error counting products:", error);
      container.innerHTML = ``;
    }
  };

  const handleCartUpdate = () => {
    const container = createOffersComponent();

    window.napi
      .cart()
      .read()
      .then((data) => {
        if (data.length === 0) {
          container.style.display = "none";
          const storedCapsuleCount = getStoredCapsuleCount();
          const storedMachineCount = getStoredMachineCount();
          const storedAccessoryCount = getStoredAccessoryCount();

          if (storedCapsuleCount > 0) {
            previousCapsuleCount = storedCapsuleCount;
          } else {
            previousCapsuleCount = 0;
            storeCapsuleCount(0);
          }

          if (storedMachineCount > 0) {
            previousMachineCount = storedMachineCount;
          } else {
            previousMachineCount = 0;
            storeMachineCount(0);
          }

          if (storedAccessoryCount > 0) {
            previousAccessoryCount = storedAccessoryCount;
          } else {
            previousAccessoryCount = 0;
            storeAccessoryCount(0);
          }
        } else {
          countProducts(data, container);
        }
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
      "nespresso-mothers-day-offers"
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
