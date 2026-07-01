(function () {
  if (window.boostVertuoWorldProgressBar) {
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
  window.boostVertuoWorldProgressBar = "true";

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
  const giftTiers = [
    {
      threshold: 70,
      gift: "1 Tote Bag",
      shortName: "1 Tote Bag",
      displayName: "GANHE 1 TOTE BAG",
      imageUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/51473052205086/Dinamic-Banner-N1-1.jpg?attachment=true&cimgnr=iZBAO",
    },
    {
      threshold: 100,
      gift: "1 Copo de Drinks",
      shortName: "1 Copo de Drinks",
      displayName: "GANHE 1 COPO DE DRINKS",
      imageUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/51473052270622/Dinamic-Banner-N2-1.jpg?attachment=true&cimgnr=8Isrq",
    },
    {
      threshold: 150,
      gift: "1 Porta Cápsula Médio",
      shortName: "1 Porta Cápsula Médio",
      displayName: "GANHE 1 PORTA CÁPSULA MÉDIO",
      imageUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/51473052336158/Dinamic-Banner-N3-1.jpg?attachment=true&cimgnr=ofGB6",
    },
    {
      threshold: 200,
      gift: "1 Porta Cápsula Grande",
      shortName: "1 Porta Cápsula Grande",
      displayName: "GANHE 1 PORTA CÁPSULA GRANDE",
      imageUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/51473052401694/Dinamic-Banner-N4-1.jpg?attachment=true&cimgnr=KnrCC",
    },
    {
      threshold: 270,
      gift: "1 Par de Xícara Barista Grande",
      shortName: "1 Par de Xícara Barista Grande",
      displayName: "GANHE 1 PAR DE XÍCARA BARISTA GRANDE",
      imageUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/51473052467230/Dinamic-Banner-N5-1.jpg?attachment=true&cimgnr=QPXds",
    },
  ];

  let previousCapsuleCount = 0;
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
              .MiniBasketDropdown__wrapper .BenefitMessage, .MiniBasketDropdown__wrapper #minicart-freight-component, #MiniBasketPush{
                      display:none !important;
                    }
                    
                    @keyframes fadeInScale {
                      0% { opacity: 0; transform: scale(0.8); }
                      100% { opacity: 1; transform: scale(1); }
                    }
                    
                    .nespresso-component-enter {
                      animation: fadeInScale 0.5s ease-out forwards;
                    }
                    .nespresso-tooltip {
                      position: relative;
                      display: inline-block;
                    }
            
                    .nespresso-tooltip .nespresso-tooltip-text {
                      visibility: hidden;
                      width: 160px;
                      background-color: #3d441e;
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
                      border-color: #3d441e transparent transparent transparent;
                    }
            
                    .nespresso-tooltip:hover .nespresso-tooltip-text {
                      visibility: visible;
                      opacity: 1;
                    }
            
                    /* Style for the current info box */
                    .nespresso-current-gift {
                      background-color: #f8ecdf;
                      border-radius: 6px;
                      padding: 8px 12px;
                      margin: 8px 0;
                      border-left: 3px solid #3d441e;
                    }
                  `;
    document.head.appendChild(styleEl);
  };

  const createOffersComponent = () => {
    const existingComponent = document.getElementById(
      "nespresso-boost-vertuo-world-offers"
    );
    if (existingComponent) {
      existingComponent.remove();
    }

    const container = document.createElement("div");
    container.id = "nespresso-boost-vertuo-world-offers";
    container.style.cssText =
      "padding: 4px 0px 4px; border-radius: 8px; border-bottom:1px solid #efefef; font-family: NespressoLucas, sans-serif; opacity: 0;";
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

  const getTierInfo = (totalCapsules) => {
    if (totalCapsules === 0) {
      return {
        currentTier: null,
        nextTier: giftTiers[0],
        progress: 0,
        capsulesToNextTier: giftTiers[0].threshold,
      };
    }

    let currentTierIndex = -1;
    for (let i = giftTiers.length - 1; i >= 0; i--) {
      if (totalCapsules >= giftTiers[i].threshold) {
        currentTierIndex = i;
        break;
      }
    }

    if (currentTierIndex >= 0) {
      if (currentTierIndex < giftTiers.length - 1) {
        const nextTier = giftTiers[currentTierIndex + 1];
        return {
          currentTier: giftTiers[currentTierIndex],
          nextTier: nextTier,
          progress: (totalCapsules / nextTier.threshold) * 100,
          capsulesToNextTier: nextTier.threshold - totalCapsules,
          thresholdAchieved: false,
        };
      } else {
        return {
          currentTier: giftTiers[currentTierIndex],
          nextTier: null,
          progress: 100,
          capsulesToNextTier: 0,
          thresholdAchieved: false,
        };
      }
    } else {
      return {
        currentTier: null,
        nextTier: giftTiers[0],
        progress: (totalCapsules / giftTiers[0].threshold) * 100,
        capsulesToNextTier: giftTiers[0].threshold - totalCapsules,
        thresholdAchieved: false,
      };
    }
  };

  const checkThresholdCrossed = (currentCount, previousCount) => {
    for (const tier of giftTiers) {
      if (previousCount < tier.threshold && currentCount >= tier.threshold) {
        return tier;
      }
    }
    return null;
  };

  const renderOffersComponent = (container, totalCapsules) => {
    if (totalCapsules === 0) {
      container.style.display = "none";
      previousCapsuleCount = 0;
      storeCapsuleCount(0);
      return;
    } else {
      container.style.display = "block";
    }

    const tierInfo = getTierInfo(totalCapsules);
    const crossedTier = checkThresholdCrossed(
      totalCapsules,
      previousCapsuleCount
    );

    previousCapsuleCount = totalCapsules;
    storeCapsuleCount(totalCapsules);

    const isMobile = isMobileDevice();

    // Layout Mobile: mostra apenas o próximo nível
    if (isMobile) {
      let mobileHtml = "";

      if (tierInfo.nextTier) {
        mobileHtml =
          `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0px 25px; gap: 12px;">
            <div style="flex: 1; text-align: left;">
              <p style="font-size: 13px; color: #3d441e; margin: 0 0 6px 0; font-weight: 600;">
                Adicione mais <span style="background-color: #fbeaa0; padding: 2px 6px; border-radius: 4px; font-weight: 700;">` +
          tierInfo.capsulesToNextTier +
          ` cápsulas</span>
              </p>
              <p style="font-size: 12px; color: #3d441e; margin: 0; font-weight: 700;">
                e ganhe: ` +
          tierInfo.nextTier.gift +
          `
              </p>
            </div>
            <div style="flex-shrink: 0;">
              <div style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #3d441e; overflow: hidden; background-color: #fff;">
                <img src="` +
          tierInfo.nextTier.imageUrl +
          `" 
                     alt="` +
          tierInfo.nextTier.shortName +
          `"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
              </div>
            </div>
          </div>
        `;
      } else {
        // Alcançou o nível máximo
        mobileHtml =
          `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 8px; gap: 12px;">
            <div style="flex: 1; text-align: left;">
              <p style="font-size: 13px; color: #3d441e; margin: 0 0 4px 0; font-weight: 600;">
              Parabéns!
              </p>
              <p style="font-size: 12px; color: #3d441e; margin: 0; font-weight: 700;">
                Você alcançou a oferta máxima!
              </p>
            </div>
            <div style="flex-shrink: 0;">
              <div style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #3d441e; overflow: hidden; background-color: #fff;">
                <img src="` +
          tierInfo.currentTier.imageUrl +
          `" 
                     alt="` +
          tierInfo.currentTier.shortName +
          `"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
              </div>
            </div>
          </div>
        `;
      }

      container.innerHTML = mobileHtml;
      container.style.opacity = "1";
      return;
    }

    // Layout Desktop: mostra todos os níveis
    const progressIndicatorsHtml =
      `
              <!-- Main progress indicators -->
              <div class="nespresso-progress-indicators" style="display: flex; padding: 4px 0px 0px; gap: 2px; align-items: center; justify-content: space-between;">
                ` +
      giftTiers
        .map((tier, index) => {
          const justAchieved =
            crossedTier && crossedTier.threshold === tier.threshold;
          const achieved = totalCapsules >= tier.threshold;

          return (
            `
                    <div class="nespresso-tooltip" style="flex: 1; text-align: center; position: relative; min-width: 40px;">
                      <div class="` +
            (justAchieved ? "nespresso-gift-achieved" : "") +
            `"
                           style="width: 60px; height: 60px; margin: 0 auto 4px auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                           background-color: ` +
            (achieved ? "#fbeaa0" : "#f5f5f5") +
            `; 
                           border: 3px solid ` +
            (achieved ? "#3d441e" : "#cccccc") +
            `;
                           overflow: hidden;
                           transition: all 0.3s ease;
                           position: relative; z-index: 2;">
                        <img src="` +
            tier.imageUrl +
            `" 
                             alt="` +
            tier.shortName +
            ` de créditos"
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
                      </div>
                      <span class="nespresso-tooltip-text">` +
            tier.gift +
            `<br>(Na compra de ` +
            tier.threshold +
            ` cápsulas)</span>
                      <div style="height: 3px; background-color: ` +
            (achieved ? "#3d441e" : "#cccccc") +
            `; position: absolute; top: 20px; ` +
            (index === 0 ? "left: 50%;" : "left: 0;") +
            " " +
            (index === giftTiers.length - 1 ? "right: 50%;" : "right: 0;") +
            ` z-index: 1;"></div>
                      <p style="font-size: 10px; line-height: 1.1; color: ` +
            (achieved ? "#3d441e" : "#999999") +
            `; margin: 0; ` +
            (achieved ? "font-weight: 600;" : "") +
            `">
                        ` +
            tier.threshold +
            ` cafés
                       </p>
                    </div>
                  `
          );
        })
        .join("") +
      `
              </div>
            `;

    let nextTierInfoHtml = "";

    if (tierInfo.nextTier) {
      nextTierInfoHtml =
        `
                <div style="margin-top: 12px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; border-radius: 6px; padding: 2px 8px;">
                    <div style="flex: 1; display:flex; align-items:center;justify-content:space-evenly;">
                      <p style="font-size: 12px; color: #3d441e; margin: 0 0 2px 0;text-align:center">
                        <strong>Adicione mais <span style="background-color: #fbeaa0; padding: 2px 4px;border-radius: 4px;">` +
        tierInfo.capsulesToNextTier +
        ` cápsulas</span></strong> para ganhar: <span style="font-size: 13px; color: #3d441e; font-weight: 700; margin: 0;">` +
        tierInfo.nextTier.gift +
        `</span>
                      </p>
                    </div>
                  </div>
                </div>
              `;
    } else {
      nextTierInfoHtml = `
                <div style="text-align: center; padding: 8px 0; margin-top: 8px;">
                  <span style="font-size: 11px; color: #3d441e; font-weight: 500;">
                    VOCÊ ALCANÇOU A <strong>OFERTA MÁXIMA!</strong>
                  </span>
                </div>
              `;
    }

    let html = nextTierInfoHtml;
    html += progressIndicatorsHtml;
    // html += `<span class="credito_span_regua_oferta" style="display: block;text-align: center;font-size: 11px;color: #3d441e;margin-top: 6px;">*Crédito disponível em até 48h</span>`;
    container.innerHTML = html;

    container.style.opacity = "1";

    const tooltips = container.querySelectorAll(".nespresso-tooltip");
    tooltips.forEach((tooltip) => {
      tooltip.addEventListener("touchstart", function (e) {
        tooltips.forEach((t) => {
          if (t !== tooltip) {
            t.querySelector(".nespresso-tooltip-text").style.visibility =
              "hidden";
            t.querySelector(".nespresso-tooltip-text").style.opacity = "0";
          }
        });

        const tooltipText = this.querySelector(".nespresso-tooltip-text");
        if (tooltipText.style.visibility === "visible") {
          tooltipText.style.visibility = "hidden";
          tooltipText.style.opacity = "0";
        } else {
          tooltipText.style.visibility = "visible";
          tooltipText.style.opacity = "1";
        }

        e.stopPropagation();
      });
    });

    document.addEventListener("touchstart", function () {
      tooltips.forEach((tooltip) => {
        const tooltipText = tooltip.querySelector(".nespresso-tooltip-text");
        tooltipText.style.visibility = "hidden";
        tooltipText.style.opacity = "0";
      });
    });
  };

  const countCapsules = async (cartItems, container) => {
    let capsuleCount = 0;

    try {
      for (const item of cartItems) {
        try {
          if (item.nonRemovable === false) {
            const product = await window.napi
              .catalog()
              .getProduct(item.productId);

            if (isCapsule(product)) {
              if (product.bundled) {
                capsuleCount += product.unitQuantity * item.quantity;
              } else {
                capsuleCount += item.quantity;
              }
            }
          }
        } catch (productError) {
          console.error("Error fetching product details:", productError);
        }
      }

      renderOffersComponent(container, capsuleCount);
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
      "nespresso-boost-vertuo-world-offers"
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
