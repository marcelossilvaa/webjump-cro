(function () {
  const giftTiers = [
    {
      threshold: 70,
      gift: "1 Biscoito Lemon",
      shortName: "Biscoito",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44600470372382/Stick-banner-400x400-N1.png?",
    },
    {
      threshold: 100,
      gift: "1 Porta Cápsulas",
      shortName: "Porta Cáps.",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44601421660190/Stick-banner-400x400-N2.png?",
    },
    {
      threshold: 150,
      gift: "1 Biscoito Lemon + 1 Xícara Cappuccino",
      shortName: "Bis. + Xíc.",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44601421824030/Stick-banner-400x400-N3.png?",
    },
    {
      threshold: 200,
      gift: "1 Kit para servir + 1 Xícara Cappuccino",
      shortName: "Kit + Xíc.",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44601422250014/Stick-banner-400x400-N4.png?",
    },
    {
      threshold: 250,
      gift: "1 Par de Canecas Lume",
      shortName: "Canecas",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44601422413854/Stick-banner-400x400-N5.png?",
    },
  ];

  let previousCapsuleCount = 0;
  // Store the last known capsule count in localStorage to persist between minicart opens
  const storeCapsuleCount = (count) => {
    localStorage.setItem("nespresso-offers-capsule-count", count.toString());
  };

  const getStoredCapsuleCount = () => {
    const stored = localStorage.getItem("nespresso-offers-capsule-count");
    return stored ? parseInt(stored, 10) : 0;
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
              color: #b8860b;
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
              border-left: 3px solid #b8860b;
            }
          `;
    document.head.appendChild(styleEl);
  };

  const createOffersComponent = () => {
    // Remove any existing component first to avoid duplicates
    const existingComponent = document.getElementById(
      "nespresso-mothers-day-offers"
    );
    if (existingComponent) {
      existingComponent.remove();
    }

    const container = document.createElement("div");
    container.id = "nespresso-mothers-day-offers";
    container.style.cssText =
      "background-color: #f9f9f9; padding: 4px 0px 0px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-family: NespressoLucas, sans-serif; opacity: 0;";
    container.classList.add("nespresso-component-enter");
    container.innerHTML =
      '<div class="loading" style="text-align: center; padding: 8px;">Loading offers...</div>';

    const targetElement = document.querySelector(".MiniBasketDropdown__header");

    if (targetElement) {
      targetElement.insertAdjacentElement("afterend", container);
      // Set a small timeout to ensure the component is visible after insertion
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

    let html = `
              <div style="text-align: center; margin-bottom: 8px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 0 0 4px 0;">Oferta Especial Dia das Mães!</h3>
                <p style="font-size: 12px; color: #666; margin: 0;">Adicione mais cápsulas para melhorar seu presente exclusivo!</p>
              </div>
             
              
              <!-- Main progress indicators -->
              <div style="display: flex; padding: 4px 0px 0px; gap: 2px; align-items: center; justify-content: space-between;">
                ${giftTiers
                  .map((tier, index) => {
                    const justAchieved =
                      crossedTier && crossedTier.threshold === tier.threshold;
                    const achieved = totalCapsules >= tier.threshold;
                    const isCurrent =
                      achieved &&
                      (index === giftTiers.length - 1 ||
                        totalCapsules < giftTiers[index + 1].threshold);

                    return `
                    <div class="nespresso-tooltip" style="flex: 1; text-align: center; position: relative; min-width: 40px;">
                      <div class="${
                        justAchieved ? "nespresso-gift-achieved" : ""
                      } ${isCurrent ? "nespresso-shimmer-effect" : ""}"
                           style="width: 38px; height: 38px; margin: 0 auto 4px auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                           background-color: ${
                             achieved ? "#ffffff" : "#f5f5f5"
                           }; 
                           border: 2px solid ${
                             achieved ? "#b8860b" : "#e2e2e2"
                           };
                           overflow: hidden;
                           transition: all 0.3s ease;
                           position: relative; z-index: 2;">
                        <img src="${tier.image}" alt="${
                      tier.gift
                    }" style="width: 30px; height: 30px; object-fit: contain;" />
                      </div>
                      <span class="nespresso-tooltip-text">${
                        tier.gift
                      }<br>(Na compra de ${tier.threshold} cápsulas)</span>
                      <div style="height: 3px; background-color: ${
                        achieved ? "#b8860b" : "#e2e2e2"
                      }; position: absolute; top: 20px; ${
                      index === 0 ? "left: 50%;" : "left: 0;"
                    } ${
                      index === giftTiers.length - 1
                        ? "right: 50%;"
                        : "right: 0;"
                    } z-index: 1;"></div>
                      <p style="font-size: 10px; line-height: 1.1; color: ${
                        isCurrent ? "#b8860b" : "#666"
                      }; margin: 0; ${isCurrent ? "font-weight: 600;" : ""}">
                        ${tier.shortName}<br>
                        <span style="font-weight: ${
                          isCurrent ? "600" : "400"
                        };">${tier.threshold}</span>
                      </p>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
              <!-- Next tier info -->
              ${
                tierInfo.nextTier
                  ? `
                <div style="margin-top: 12px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; background-color: #f5f5f5; border-radius: 6px; padding: 2px 8px;">
                    <div style="flex: 1;">
                      <p style="font-size: 12px; color: #666; margin: 0 0 2px 0;">
                        <strong>Adicione mais ${tierInfo.capsulesToNextTier} cápsulas</strong> para ganhar: <span style="font-size: 12px; color: #b8860b; font-weight: 500; margin: 0;">${tierInfo.nextTier.gift}</span>
                      </p>
                    </div>
                  </div>
                </div>
              `
                  : `
                <div style="text-align: center; padding: 8px 0; margin-top: 8px;">
                  <span style="font-size: 13px; color: #22c55e; font-weight: 500;">
                    Você alcançou a oferta máxima!
                  </span>
                </div>
              `
              }
          `;

    container.innerHTML = html;

    // Set opacity to 1 to ensure visibility
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

  // Main function to handle cart update and refresh the component
  const handleCartUpdate = () => {
    const container = createOffersComponent();

    window.napi
      .cart()
      .read()
      .then((data) => {
        if (data.length === 0) {
          // If cart is empty, always hide the component completely
          container.style.display = "none";
          // We still store the capsule count for when items are added back
          const storedCount = getStoredCapsuleCount();
          if (storedCount > 0) {
            // Keep the stored count but don't render the component
            previousCapsuleCount = storedCount;
          } else {
            previousCapsuleCount = 0;
            storeCapsuleCount(0);
          }
        } else {
          // Cart has items, proceed with normal counting and display
          countCapsules(data, container);
        }
      })
      .catch((err) => {
        console.error("Error reading cart:", err);
        container.innerHTML = ``;
        container.style.display = "none"; // Hide on error as well
      });
  };

  // Function to watch for minicart open
  const watchForMinicartOpen = () => {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      // Check each mutation
      for (const mutation of mutations) {
        // Only care about childList mutations (element additions/removals)
        if (mutation.type === "childList") {
          // Check if any added nodes contain the minicart wrapper
          const addedNodes = Array.from(mutation.addedNodes);

          for (const node of addedNodes) {
            // Check if the node is an element node
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the node itself is the minicart or it contains the minicart
              const isMiniCart =
                node.classList &&
                node.classList.contains("MiniBasketDropdown__wrapper");
              const containsMiniCart =
                node.querySelector &&
                node.querySelector(".MiniBasketDropdown__wrapper");

              if (isMiniCart || containsMiniCart) {
                // Minicart has been added to the DOM, wait a tiny bit for it to fully render
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

    // Start observing the entire document body for changes
    observer.observe(document.body, {
      childList: true, // Watch for element additions/removals
      subtree: true, // Watch all descendants, not just direct children
    });

    return observer;
  };

  const initOffersComponent = () => {
    addAnimationStyles();

    // Start watching for minicart open events
    const observer = watchForMinicartOpen();

    // Register for cart update events
    if (window.napi && window.napi.data) {
      window.napi.data().on("cart.update", handleCartUpdate);
    }

    // Store the observer reference on window to prevent garbage collection
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
