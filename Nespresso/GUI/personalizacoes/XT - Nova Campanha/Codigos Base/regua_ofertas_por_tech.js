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
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: label,
    });
  }

  const giftTiers = [
    {
      threshold: 70,
      gift: "10 cafés Colombia",
      shortName: "Ganhe cafés Colombia",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977916178462/Acorde-o-OL-N1.png?attachment=true&cimgnr=41wuF",
    },
    {
      threshold: 100,
      gift: "1 Porta-Cápsulas Mini Display",
      shortName: "Ganhe 1 Porta-Cápsulas Mini Display",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977916243998/Acorde-o-OL-N2.png?attachment=true&cimgnr=nZkf1",
    },
    {
      threshold: 150,
      gift: "1 Porta-Cápsulas Bonbonnière",
      shortName: "Ganhe 1 Porta-Cápsulas Bonbonnière",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977917095966/Acorde-o-OL-N3.png?attachment=true&cimgnr=EO5Kw",
    },
    {
      threshold: 200,
      gift: "1 Par de Xícaras Vertuo Espresso",
      shortName: "Ganhe 1 Par de Xícaras Vertuo Espresso",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977917521950/Acorde-o-OL-N4.png?attachment=true&cimgnr=1QQ4I",
    },
    {
      threshold: 250,
      gift: "1 Par de Xícaras Vertuo Double Espresso",
      shortName: "Ganhe 1 Par de Xícaras Vertuo Double Espresso",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977918177310/Acorde-o-OL-N5.png?attachment=true&cimgnr=ooLPY",
    },
  ];

  const giftTiersVertuo = [
    {
      threshold: 50,
      gift: "10 cafés Colombia",
      shortName: "Ganhe 10 cafés Colombia",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977930334238/Acorde-o-VL-N1.png?attachment=true&cimgnr=E3ulv",
    },
    {
      threshold: 70,
      gift: "1 Xícara Vertuo Espresso",
      shortName: "Ganhe 1 Xícara Vertuo Espresso",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977930498078/Acorde-o-VL-N2.png?attachment=true&cimgnr=68Csw",
    },
    {
      threshold: 120,
      gift: "1 Porta-Cápsulas Bonbonnière",
      shortName: "Ganhe 1 Porta-Cápsulas Bonbonnière",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977930629150/Acorde-o-VL-N3.png?attachment=true&cimgnr=a4L8T",
    },
    {
      threshold: 180,
      gift: "1 Par de Xícaras Vertuo Double Espresso",
      shortName: "Ganhe 1 Par de Xícaras Vertuo Double Espresso",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45977930760222/Acorde-o-VL-N4.png?attachment=true&cimgnr=UOyTC",
    },
  ];

  let previousCapsuleCount = 0;
  let currentTechnology = null; // Armazena a tecnologia atual do carrinho

  const storeCapsuleCount = (count) => {
    localStorage.setItem("nespresso-offers-capsule-count", count.toString());
  };

  const getStoredCapsuleCount = () => {
    const stored = localStorage.getItem("nespresso-offers-capsule-count");
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
                  @keyframes celebrationPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                  }
                  
                  @keyframes fadeInScale {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                  }
                  
                  @keyframes giftAchieved {
                    0% { transform: scale(1); box-shadow: 0 0 0 rgba(184, 134, 11, 0); }
                    25% { transform: scale(1.2); box-shadow: 0 0 15px rgba(184, 134, 11, 0.5); }
                    50% { transform: scale(1); box-shadow: 0 0 5px rgba(184, 134, 11, 0.3); }
                    75% { transform: scale(1.1); box-shadow: 0 0 10px rgba(184, 134, 11, 0.4); }
                    100% { transform: scale(1); box-shadow: 0 0 0 rgba(184, 134, 11, 0); }
                  }
                  
                  @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                  }
                  
                  .nespresso-gift-achieved {
                    animation: giftAchieved 1.5s ease-in-out;
                  }
                  
                  .nespresso-component-enter {
                    animation: fadeInScale 0.5s ease-out forwards;
                  }
                  
                  .nespresso-celebration-message {
                    animation: celebrationPulse 0.5s ease-in-out 3;
                    color: #8d3577;
                    font-weight: bold;
                  }
                  
                  .nespresso-shimmer-effect {
                    background: linear-gradient(90deg, rgba(255,255,255,1) 25%, rgba(255,215,0,0.2) 50%, rgba(255,255,255,1) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite linear;
                  }
          
                  .nespresso-tooltip {
                    position: relative;
                    display: inline-block;
                  }
          
                  .nespresso-tooltip .nespresso-tooltip-text {
                    visibility: hidden;
                    width: 160px;
                    background-color: #555;
                    color: #fff;
                    text-align: center;
                    border-radius: 6px;
                    padding: 5px;
                    position: absolute;
                    z-index: 5;
                    bottom: 125%;
                    left: 50%;
                    margin-left: -80px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    font-size: 11px;
                    pointer-events: none;
                  }
          
                  .nespresso-tooltip .nespresso-tooltip-text::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: #555 transparent transparent transparent;
                  }
          
                  .nespresso-tooltip:hover .nespresso-tooltip-text {
                    visibility: visible;
                    opacity: 1;
                  }
          
                  .nespresso-current-gift {
                    background-color: #f9f3e6;
                    border-radius: 6px;
                    padding: 8px 12px;
                    margin: 8px 0;
                    border-left: 3px solid #8d3577;
                  }
                  
                  @media (max-width: 767px) {
                    .nespresso-progress-indicators {
                      display: none !important;
                    }
                    .credito_span_regua_oferta{
                      margin-top:0px !important;
                    }
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
      "padding: 4px 0px 4px; font-family: NespressoLucas, sans-serif; opacity: 0;";
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

  const getProductTechnology = (product) => {
    if (
      !product ||
      !product.technologies ||
      !Array.isArray(product.technologies)
    ) {
      return null;
    }

    for (const tech of product.technologies) {
      if (tech.includes("nesclub2.br.b2c/machineTechno/original")) {
        return "original";
      }
      if (tech.includes("nesclub2.br.b2c/machineTechno/vertuo")) {
        return "vertuo";
      }
    }

    return null;
  };

  const getTierInfo = (totalCapsules, technology = "original") => {
    // Seleciona o conjunto de ofertas baseado na tecnologia
    const currentGiftTiers =
      technology === "vertuo" ? giftTiersVertuo : giftTiers;

    if (totalCapsules === 0) {
      return {
        currentTier: null,
        nextTier: currentGiftTiers[0],
        progress: 0,
        capsulesToNextTier: currentGiftTiers[0].threshold,
      };
    }

    let currentTierIndex = -1;
    for (let i = currentGiftTiers.length - 1; i >= 0; i--) {
      if (totalCapsules >= currentGiftTiers[i].threshold) {
        currentTierIndex = i;
        break;
      }
    }

    if (currentTierIndex >= 0) {
      if (currentTierIndex < currentGiftTiers.length - 1) {
        const nextTier = currentGiftTiers[currentTierIndex + 1];
        return {
          currentTier: currentGiftTiers[currentTierIndex],
          nextTier: nextTier,
          progress: (totalCapsules / nextTier.threshold) * 100,
          capsulesToNextTier: nextTier.threshold - totalCapsules,
          thresholdAchieved: false,
        };
      } else {
        return {
          currentTier: currentGiftTiers[currentTierIndex],
          nextTier: null,
          progress: 100,
          capsulesToNextTier: 0,
          thresholdAchieved: false,
        };
      }
    } else {
      return {
        currentTier: null,
        nextTier: currentGiftTiers[0],
        progress: (totalCapsules / currentGiftTiers[0].threshold) * 100,
        capsulesToNextTier: currentGiftTiers[0].threshold - totalCapsules,
        thresholdAchieved: false,
      };
    }
  };

  const checkThresholdCrossed = (
    currentCount,
    previousCount,
    technology = "original"
  ) => {
    const currentGiftTiers =
      technology === "vertuo" ? giftTiersVertuo : giftTiers;

    for (const tier of currentGiftTiers) {
      if (previousCount < tier.threshold && currentCount >= tier.threshold) {
        return tier;
      }
    }
    return null;
  };

  const renderOffersComponent = (
    container,
    totalCapsules,
    technology = "original"
  ) => {
    // Se não tem cápsulas no total, oculta
    if (totalCapsules === 0) {
      container.style.display = "none";
      previousCapsuleCount = 0;
      storeCapsuleCount(0);
      return;
    } else {
      container.style.display = "block";
    }

    const tierInfo = getTierInfo(totalCapsules, technology);
    const crossedTier = checkThresholdCrossed(
      totalCapsules,
      previousCapsuleCount,
      technology
    );

    previousCapsuleCount = totalCapsules;
    storeCapsuleCount(totalCapsules);

    const isMobile = isMobileDevice();

    let nextTierInfoHtml = "";

    if (tierInfo.nextTier) {
      nextTierInfoHtml =
        `
              <div style="margin-top: ` +
        (isMobile ? "4px" : "4px") +
        `;">
                <div style="display: flex; align-items: center; justify-content: space-between; background-color: #ECDFB8; padding: ` +
        (isMobile ? "8px" : "6px 8px") +
        `;">
                  <div style="flex: 1; display:flex; align-items:center;justify-content:space-evenly;">
                    <p style="font-size: 16px; color: #181818; margin: 0 0 2px 0; line-height:22px;">
                      <strong>Adicione mais ` +
        tierInfo.capsulesToNextTier +
        ` cápsulas</strong> para ganhar:<br>
        <span style="font-size:` +
        (isMobile ? "13px" : "16px") +
        ` ;letter-spacing: 1.1px;color: #181818;font-weight: 600;margin: 0;background-color: #C7B27E;padding: 2px 6px;border-radius: 12px;">` +
        tierInfo.nextTier.gift +
        `</span>
                    </p>
                   
        <img src="` +
        tierInfo.nextTier.image +
        `" alt="` +
        tierInfo.nextTier.gift +
        `" style="width:70px; height:70px; border-radius:50%;">` +
        `
                  </div>
                </div>
              </div>
            `;
    } else {
      nextTierInfoHtml =
        `
              <div style="flex: 1;display:flex;align-items:center;justify-content:space-evenly;background-color: #f0ece7;padding: 5px 0px;">
              <p style="font-size: 16px; color: #666; margin: 0 0 2px 0; line-height:22px;">
                <strong style="font-size: 16px; color: #078d55; font-weight: 500;">
                  Você alcançou a oferta máxima!
                </strong><br>
                <span style="font-size: 16px; color: #181818; font-weight: 600; margin: 0;">` +
        tierInfo.currentTier.gift +
        `</span>
              </p>
                <img src="` +
        tierInfo.currentTier.image +
        `" alt="` +
        tierInfo.currentTier.gift +
        `" style="width:70px; height:70px; border-radius:50%;">
              </div>
            `;
    }

    let html = nextTierInfoHtml;

    container.innerHTML = html;

    container.style.opacity = "1";
  };

  const countCapsules = async (cartItems, container) => {
    let capsuleCount = 0;
    let hasOriginal = false;
    let hasVertuo = false;
    let originalCount = 0;
    let vertuoCount = 0;

    try {
      for (const item of cartItems) {
        if (item.nonRemovable === true) {
          continue;
        }
        try {
          const product = await window.napi
            .catalog()
            .getProduct(item.productId);

          if (isCapsule(product)) {
            const technology = getProductTechnology(product);

            if (technology === "original") {
              hasOriginal = true;
              originalCount += item.quantity;
            } else if (technology === "vertuo") {
              hasVertuo = true;
              vertuoCount += item.quantity;
            }

            capsuleCount += item.quantity;
          }
        } catch (productError) {
          console.error("Error fetching product details:", productError);
        }
      }

      // Determina qual tecnologia usar para as ofertas
      let technologyToUse = "original"; // Default para original

      if (hasVertuo && !hasOriginal) {
        // Apenas Vertuo no carrinho - usa ofertas Vertuo
        technologyToUse = "vertuo";
      } else {
        // Tem Original sozinho ou Original + Vertuo - usa ofertas Original
        technologyToUse = "original";
      }

      // Sempre usa o total de TODAS as cápsulas (Original + Vertuo)
      currentTechnology = technologyToUse;
      renderOffersComponent(container, capsuleCount, technologyToUse);
    } catch (error) {
      console.error("Error counting capsules:", error);
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
          const storedCount = getStoredCapsuleCount();
          if (storedCount > 0) {
            previousCapsuleCount = storedCount;
          } else {
            previousCapsuleCount = 0;
            storeCapsuleCount(0);
          }
        } else {
          countCapsules(data, container);
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
