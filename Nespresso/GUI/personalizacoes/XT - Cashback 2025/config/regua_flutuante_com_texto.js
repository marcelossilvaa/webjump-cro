(function () {
  // Evita múltiplas execuções
  if (window.nespressoFixedBanner) {
    return;
  }
  window.nespressoFixedBanner = true;

  // Push para GTM
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

  // Função para enviar eventos GA
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

  // Configuração dos níveis de presente
  const giftTiers = [
    {
      threshold: 120,
      gift: "R$ 80 de créditos no próximo pedido.",
      shortName: "R$ 80",
      displayName: "GANHE R$80",
      image: "https://iili.io/F1qx1z7.png",
    },
    {
      threshold: 170,
      gift: "R$ 120 de créditos no próximo pedido.",
      shortName: "R$ 120",
      displayName: "GANHE R$120",
      image: "https://iili.io/F0vok6x.png",
    },
  ];

  let currentCapsuleCount = 0;
  let isMinimized = false;

  // Adiciona estilos
  const addStyles = () => {
    if (document.getElementById("nespresso-fixed-banner-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "nespresso-fixed-banner-styles";
    styleEl.textContent = `
                #nespresso-fixed-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #FFFFFF;
                    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    font-family: NespressoLucas, sans-serif;
                    transition: transform 0.3s ease-in-out;
                }

                #nespresso-fixed-banner.minimized {
                    transform: translateY(calc(100% - 50px));
                    background-color:transparent;
                    bottom:0px;
                    box-shadow: none;
                }

                .nespresso-banner-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 15px 20px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 70px;
                    
                }

                .nespresso-banner-left {
                    display: flex;
                    align-items: center;
                }

                .nespresso-banner-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    max-width: 300px;
                    text-align:end;
                }

                .nespresso-banner-title {
                    font-size: 14px;
                    color: #17171a;
                    margin: 0;
                    font-weight: 500;
                    line-height: 1.3;
                    letter-spacing:.0625rem;
                }

                .nespresso-banner-main {
                    font-size: 16px;
                    color: #17171a;
                    margin: 0;
                    font-weight: 600;
                    text-align:center;
                }

                .nespresso-banner-main strong {
                    color: #771F62;
                }

                .nespresso-banner-subtitle {
                    font-size: 11px;
                    color: #999999;
                    margin: 0;
                }

                .nespresso-banner-progress {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-direction:column;
                }

                .nespresso-progress-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                }

                .nespresso-progress-line {
                    width: 80px;
                    height: 4px;
                    background: #E5E5E5;
                    border-radius: 2px;
                    position: relative;
                    overflow: hidden;
                }

                .nespresso-progress-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    background: #771f62;
                    border-radius: 2px;
                    transition: width 0.5s ease-out;
                }

                .nespresso-progress-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    position:relative;
                }

                .nespresso-progress-dot {
                    border-radius: 10px;
                    border: 4px solid #E5E5E5;
                    background: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 600;
                    color: #666666;
                    position: relative;
                    transition: all 0.3s ease;
                }


                .nespresso-progress-dot.completed {
                    border-color: rgb(141 53 119);
                    color: #FFF;
                    background-color: rgb(141 53 119);
                }

                .nespresso-progress-dot img {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius:60px;
                }
                    .nespresso-progress-dot p{
                        text-align: center;
                        font-weight: 700;
                        font-size: 16px;
                        width: 100px;
                        height: 40px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                    }
                    .nespresso-progress-dot p span{
                        font-size: 12px;
                        font-weight: 500;
                    }
                .nespresso-progress-label {
                    font-size: 11px;
                    color: #666666;
                    font-weight: 500;
                    position: absolute;
                    bottom: -18px;
                }

                .nespresso-banner-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: #999999;
                    cursor: pointer;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s ease;
                }

                .nespresso-banner-close:hover {
                    color: #666666;
                }

                .nespresso-minimized-tab {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #D4A574;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 8px 8px 0 0;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    display: none;
                    transition: all 0.2s ease;
                    font-size: 18px;
                    color: #771f62;
                    background-color: #eea5dd;
                    text-align:center;
                }

                .nespresso-minimized-tab:hover {
                    background: rgb(141 53 119);
                    color: #FFF;
                }

                #nespresso-fixed-banner.minimized .nespresso-minimized-tab {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                #nespresso-fixed-banner.minimized .nespresso-banner-content {
                    opacity: 0;
                    pointer-events: none;
                }
                #nespresso-fixed-banner .nespresso-termos-condicoes-regua-flutuante{
                    font-size:11px;
                    color: #999999;
                    text-decoration: underline;
                    text-align: right
                }
                /* Mobile styles */
                @media (max-width: 768px) {
                    .nespresso-banner-content {
                        flex-direction: column;
                        padding: 12px 15px;
                        gap: 12px;
                    }

                    .nespresso-banner-left {
                        flex-direction: column;
                        width: 100%;
                        gap: 12px;
                    }

                    .nespresso-banner-text {
                        text-align: center;
                        width: 100%;
                    }

                    .nespresso-banner-title {
                        font-size: 12px;
                    }

                    .nespresso-banner-main {
                        font-size: 14px;
                    }

                    .nespresso-progress-container {
                        justify-content: center;
                    }

                    .nespresso-progress-line {
                        width: 60px;
                    }

                    .nespresso-progress-dot {
                        width: 40px;
                        height: 40px;
                        font-size: 9px;
                    }

                    .nespresso-progress-dot img {
                        width: 28px;
                        height: 28px;
                    }

                    .nespresso-banner-close {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                    }

                    #nespresso-fixed-banner.minimized {
                        transform: translateY(calc(100% - 40px));
                    }

                    .nespresso-minimized-tab {
                        padding: 6px 16px;
                        font-size: 11px;
                    }
                }

                /* Animation */
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                #nespresso-fixed-banner.entering {
                    animation: slideUp 0.5s ease-out;
                }

                /* Hide on checkout pages */
                body.checkout #nespresso-fixed-banner,
                body.cart #nespresso-fixed-banner {
                    display: none;
                }
            `;
    document.head.appendChild(styleEl);
  };

  // Verifica se é uma cápsula
  const isCapsule = (product) => {
    return product && product.type === "capsule";
  };

  // Obtém informações do tier atual
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
          progress:
            ((totalCapsules - giftTiers[currentTierIndex].threshold) /
              (nextTier.threshold - giftTiers[currentTierIndex].threshold)) *
            100,
          capsulesToNextTier: nextTier.threshold - totalCapsules,
        };
      } else {
        return {
          currentTier: giftTiers[currentTierIndex],
          nextTier: null,
          progress: 100,
          capsulesToNextTier: 0,
        };
      }
    } else {
      return {
        currentTier: null,
        nextTier: giftTiers[0],
        progress: (totalCapsules / giftTiers[0].threshold) * 100,
        capsulesToNextTier: giftTiers[0].threshold - totalCapsules,
      };
    }
  };

  // Cria o componente do banner
  const createBanner = () => {
    const existingBanner = document.getElementById("nespresso-fixed-banner");
    if (existingBanner) {
      return existingBanner;
    }

    const banner = document.createElement("div");
    banner.id = "nespresso-fixed-banner";
    banner.className = "entering";
    banner.innerHTML = `
                <div class="nespresso-minimized-tab">
                    <p>Ganhe créditos no seu próximo pedido</p>
                    <nb-icon icon="24/symbol/chevron-up" aria-hidden="true" class="nb-svg nb-icon lazy-loaded"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m12 7.3-8 8v1.4l8-8 8 8v-1.4l-8-8Z"></path></svg></nb-icon>
                </div>
                <div class="nespresso-banner-content">
                    <div class="nespresso-banner-left">
                        <div class="nespresso-banner-text">
                            <p class="nespresso-banner-title">
                                Compre cafés<br>
                                ganhe créditos no próximo pedido
                            </p>
                            
                            <p class="nespresso-banner-subtitle">*Crédito disponível em até 72h</p>
                            <button class="nespresso-termos-condicoes-regua-flutuante">*Confira condições</button>
                        </div>
                    </div>
                    <div class="nespresso-banner-progress">
                    <p class="nespresso-banner-main">
                                Adicione mais <strong>120 cápsulas</strong> para ganhar: <strong>R$ 80 no próximo pedido.*</strong>
                            </p>
                        <div class="nespresso-progress-container">
                            <span style="font-size: 13px; color: #666;">0</span>
                            <div class="nespresso-progress-line">
                                <div class="nespresso-progress-fill" style="width: 0%;"></div>
                            </div>
                            <div class="nespresso-progress-item">
                                <div class="nespresso-progress-dot" data-tier="0">
                                    <p>${giftTiers[0].shortName}<br><span>de créditos</span></p>
                                </div>
                                <span class="nespresso-progress-label">120 cafés</span>
                            </div>
                            <div class="nespresso-progress-line">
                                <div class="nespresso-progress-fill" style="width: 0%;"></div>
                            </div>
                            <div class="nespresso-progress-item">
                                <div class="nespresso-progress-dot" data-tier="1">
                                    <p>${giftTiers[1].shortName}<br><span>de créditos</span></p>
                                </div>
                                <span class="nespresso-progress-label">170 cafés</span>
                            </div>
                        </div>
                    </div>
                    <button class="nespresso-banner-close" aria-label="Minimizar banner">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            `;

    document.body.appendChild(banner);

    // Event listeners
    const closeBtn = banner.querySelector(".nespresso-banner-close");
    const minimizedTab = banner.querySelector(".nespresso-minimized-tab");

    closeBtn.addEventListener("click", () => {
      isMinimized = true;
      banner.classList.add("minimized");
      sendGAEvent("minimizou_banner_cashback");
    });

    minimizedTab.addEventListener("click", () => {
      isMinimized = false;
      banner.classList.remove("minimized");
      sendGAEvent("expandiu_banner_cashback");
    });

    setTimeout(() => {
      banner.classList.remove("entering");
    }, 500);

    sendGAEvent("exibiu_banner_cashback");

    return banner;
  };

  // Atualiza o banner com as informações do carrinho
  const updateBanner = (totalCapsules) => {
    const banner = document.getElementById("nespresso-fixed-banner");
    if (!banner) return;

    // Se não há cápsulas, esconde o banner
    if (totalCapsules === 0) {
      banner.style.display = "none";
      return;
    } else {
      banner.style.display = "block";
    }

    const tierInfo = getTierInfo(totalCapsules);

    // Atualiza o texto principal
    const mainText = banner.querySelector(".nespresso-banner-main");
    if (tierInfo.nextTier) {
      mainText.innerHTML = "";
      if (tierInfo.currentTier) {
        mainText.innerHTML += `Parabéns, você já garantiu <strong>${tierInfo.currentTier.shortName} de créditos</strong>.<br>`;
      }
      mainText.innerHTML += `Adicione mais <strong>${tierInfo.capsulesToNextTier} cápsulas</strong> para ganhar: <strong>${tierInfo.nextTier.gift}</strong>`;
    } else {
      mainText.innerHTML = `<strong>Parabéns!</strong> Você alcançou a oferta máxima!`;
    }

    // Atualiza as barras de progresso
    const progressLines = banner.querySelectorAll(".nespresso-progress-line");
    const progressFills = banner.querySelectorAll(".nespresso-progress-fill");

    // Primeira barra (0 -> 120)
    if (totalCapsules >= giftTiers[0].threshold) {
      progressFills[0].style.width = "100%";
    } else {
      progressFills[0].style.width = `${
        (totalCapsules / giftTiers[0].threshold) * 100
      }%`;
    }

    // Segunda barra (120 -> 170)
    if (totalCapsules >= giftTiers[1].threshold) {
      progressFills[1].style.width = "100%";
    } else if (totalCapsules > giftTiers[0].threshold) {
      const progress =
        ((totalCapsules - giftTiers[0].threshold) /
          (giftTiers[1].threshold - giftTiers[0].threshold)) *
        100;
      progressFills[1].style.width = `${progress}%`;
    } else {
      progressFills[1].style.width = "0%";
    }

    // Atualiza os dots
    const dots = banner.querySelectorAll(".nespresso-progress-dot");
    dots.forEach((dot, index) => {
      dot.classList.remove("active", "completed");
      if (totalCapsules >= giftTiers[index].threshold) {
        dot.classList.add("completed");
      } else if (index === 0 && totalCapsules < giftTiers[0].threshold) {
        dot.classList.add("active");
      } else if (
        index === 1 &&
        totalCapsules >= giftTiers[0].threshold &&
        totalCapsules < giftTiers[1].threshold
      ) {
        dot.classList.add("active");
      }
    });

    // Atualiza o tab minimizado
    const minimizedTab = banner.querySelector(".nespresso-minimized-tab p");
    minimizedTab.innerHTML = "";
    if (tierInfo.nextTier) {
      if (tierInfo.currentTier) {
        minimizedTab.innerHTML += `Parabéns, você já garantiu <strong>${tierInfo.currentTier.shortName} de créditos</strong>.<br> `;
      }
      minimizedTab.innerHTML += `Faltam ${tierInfo.capsulesToNextTier} cápsulas para ganhar ${tierInfo.nextTier.shortName} de créditos.`;
    } else {
      minimizedTab.innerHTML = "Oferta máxima alcançada!";
    }
  };

  // Conta as cápsulas no carrinho
  const countCapsules = async (cartItems) => {
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

      currentCapsuleCount = capsuleCount;
      updateBanner(capsuleCount);
    } catch (error) {
      console.error("Error counting capsules:", error);
    }
  };

  // Monitora mudanças no carrinho
  const handleCartUpdate = () => {
    window.napi
      .cart()
      .read()
      .then((data) => {
        if (data.length === 0) {
          currentCapsuleCount = 0;
          updateBanner(0);
        } else {
          countCapsules(data);
        }
      })
      .catch((err) => {
        console.error("Error reading cart:", err);
      });
  };

  // Verifica se está em página de checkout
  const isCheckoutPage = () => {
    const path = window.location.pathname;
    return (
      path.includes("/checkout") ||
      path.includes("/cart") ||
      path.includes("/carrinho")
    );
  };

  // Inicializa o componente
  const init = () => {
    // Não exibe em páginas de checkout
    if (isCheckoutPage()) {
      return;
    }

    addStyles();
    createBanner();
    handleCartUpdate();

    // Monitora mudanças no carrinho
    if (window.napi && window.napi.data) {
      window.napi.data().on("cart.update", handleCartUpdate);
    }

    // Monitora mudanças de URL (SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        if (isCheckoutPage()) {
          const banner = document.getElementById("nespresso-fixed-banner");
          if (banner) banner.style.display = "none";
        } else {
          const banner = document.getElementById("nespresso-fixed-banner");
          if (banner && currentCapsuleCount > 0) {
            banner.style.display = "block";
          }
        }
      }
    }).observe(document, { subtree: true, childList: true });
  };

  // Aguarda o carregamento da API Nespresso
  const waitForNapi = setInterval(() => {
    if (window.napi) {
      clearInterval(waitForNapi);
      init();
    }
  }, 500);

  // Timeout de segurança
  setTimeout(() => {
    clearInterval(waitForNapi);
    if (!window.napi) {
      console.error("Nespresso API not available after 10 seconds");
    }
  }, 10000);
})();
