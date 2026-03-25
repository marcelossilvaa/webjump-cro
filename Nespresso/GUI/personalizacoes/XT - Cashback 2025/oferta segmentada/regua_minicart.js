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
  const giftTiers = [
    {
      threshold: 70,
      gift: "R$ 50 no próximo pedido.",
      shortName: "Ganhe R$ 50",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45341066559518/landing-oferta-de-credito-julho-400x400-n1.png?attachment=true&cimgnr=rUWZv",
    },
    {
      threshold: 120,
      gift: "R$ 80 no próximo pedido.",
      shortName: "Ganhe R$ 80",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45341064724510/landing-oferta-de-credito-julho-400x400-n2.png?attachment=true&cimgnr=pqpfr",
    },
    {
      threshold: 170,
      gift: "R$ 120 no próximo pedido.",
      shortName: "Ganhe R$ 120",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45341066166302/landing-oferta-de-credito-julho-400x400-n3.png?attachment=true&cimgnr=vpq75",
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
          
                  /* Style for the current info box */
                  .nespresso-current-gift {
                    background-color: #f9f3e6;
                    border-radius: 6px;
                    padding: 8px 12px;
                    margin: 8px 0;
                    border-left: 3px solid #8d3577;
                  }
                  
                  /* Hide progress indicators on mobile */
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
      "background-color: #f9f9f9; padding: 4px 0px 4px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-family: NespressoLucas, sans-serif; opacity: 0;";
    container.classList.add("nespresso-component-enter");
    container.innerHTML =
      '<div class="loading" style="text-align: center; padding: 8px;">Loading offers...</div>';

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
          const isCurrent =
            achieved &&
            (index === giftTiers.length - 1 ||
              totalCapsules < giftTiers[index + 1].threshold);

          return (
            `
                  <div class="nespresso-tooltip" style="flex: 1; text-align: center; position: relative; min-width: 40px;">
                    <div class="` +
            (justAchieved ? "nespresso-gift-achieved" : "") +
            " " +
            (isCurrent ? "nespresso-shimmer-effect" : "") +
            `"
                         style="width: 60px; height: 60px; margin: 0 auto 4px auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                         background-color: ` +
            (achieved ? "#ffffff" : "#f5f5f5") +
            `; 
                         border: 2px solid ` +
            (achieved ? "#8d3577" : "#e2e2e2") +
            `;
                         overflow: hidden;
                         transition: all 0.3s ease;
                         position: relative; z-index: 2;">
                      <img src="` +
            tier.image +
            `" alt="` +
            tier.gift +
            `" style="width: 60px; height: 60px; object-fit: contain;" />
                    </div>
                    <span class="nespresso-tooltip-text">` +
            tier.gift +
            `<br>(Na compra de ` +
            tier.threshold +
            ` cápsulas)</span>
                    <div style="height: 3px; background-color: ` +
            (achieved ? "#8d3577" : "#e2e2e2") +
            `; position: absolute; top: 20px; ` +
            (index === 0 ? "left: 50%;" : "left: 0;") +
            " " +
            (index === giftTiers.length - 1 ? "right: 50%;" : "right: 0;") +
            ` z-index: 1;"></div>
                    <p style="font-size: 10px; line-height: 1.1; color: ` +
            (isCurrent ? "#8d3577" : "#666") +
            `; margin: 0; ` +
            (isCurrent ? "font-weight: 600;" : "") +
            `">
                      ` +
            tier.shortName +
            `<br>
                      <span style="font-weight: ` +
            (isCurrent ? "600" : "400") +
            `;"></span>
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
              <div style="margin-top: ` +
        (isMobile ? "8px" : "12px") +
        `;">
                <div style="display: flex; align-items: center; justify-content: space-between; background-color: rgb(249, 249, 249); border-radius: 6px; padding: ` +
        (isMobile ? "8px" : "2px 8px") +
        `;">
                  <div style="flex: 1; display:flex; align-items:center;justify-content:space-evenly;">
                    <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">
                      <strong>Adicione mais ` +
        tierInfo.capsulesToNextTier +
        ` cápsulas</strong> para ganhar:` +
        (isMobile ? "<br>" : "") +
        ` <span style="font-size: 13px; color: #8d3577; font-weight: 700; margin: 0;">` +
        tierInfo.nextTier.gift +
        `*</span>
                    </p>
                    ` +
        (isMobile
          ? `<img src="` +
            tierInfo.nextTier.image +
            ` alt="` +
            tierInfo.nextTier.gift +
            ` style="width:38px; height:38px; border: 2px solid #8d3577; border-radius:50%;">`
          : ``) +
        `
                  </div>
                </div>
              </div>
            `;
    } else {
      nextTierInfoHtml = `
              <div style="text-align: center; padding: 8px 0; margin-top: 8px;">
                <span style="font-size: 13px; color: #22c55e; font-weight: 500;">
                  Você alcançou a oferta máxima!
                </span>
              </div>
            `;
    }

    let html = nextTierInfoHtml;

    if (!isMobile) {
      html += progressIndicatorsHtml;
    }
    html += `<span class="credito_span_regua_oferta" style="display: block;text-align: center;font-size: 10px;color: #6d6d6d;margin-top: 6px;">*Crédito disponível em até 72h</span>`;
    container.innerHTML = html;

    container.style.opacity = "1";

    if (!isMobile) {
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
    }
  };

  const countCapsules = async (cartItems, container) => {
    let capsuleCount = 0;

    try {
      for (const item of cartItems) {
        try {
          const product = await window.napi
            .catalog()
            .getProduct(item.productId);

          if (isCapsule(product)) {
            capsuleCount += item.quantity;
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
