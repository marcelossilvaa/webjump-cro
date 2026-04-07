    (() => {
        // 1) Injetar CSS inline (desktop + mobile)
        const css = `
    .floating-footer {
      position: fixed;
      bottom: 0; left: 0; width: 100%;
      background-color: #ffffff;
      box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
      display: flex; align-items: center; justify-content: space-around;
      padding: 1rem; z-index: 999; font-family: Arial, sans-serif;
    }
    .floating-footer__section {
      display: flex; flex-direction: column; align-items: center;
    }
    .floating-footer__total {
      font-size: 20px; font-weight: bold; color: #333;
      margin-bottom: 0.25rem; font-family: 'NespressoLucas';
    }
    #totalPrice { color: #257a57; }
    .floating-footer__discount-btn,
    .floating-footer__continue-btn {
      border: none; border-radius: 62.4375rem; cursor: pointer;
      font-size: 1rem; font-family: 'NespressoLucas';
      padding: .625rem 1.5rem .625rem 0;
    }
    .floating-footer__discount-btn {
      color: #986f38; background-color: transparent;
      text-decoration: underline; text-align: left;
    }
    .floating-footer__continue-btn {
      background-color: #257a57; color: #fff;
      font-weight: 400; letter-spacing: .015625rem;
      line-height: 1.2; min-block-size: 3rem; padding: .625rem 1.5rem;
    }
    .floating-footer__discount-btn:hover,
    .floating-footer__continue-btn:hover { opacity: 0.9; }
    .floating-footer__frete-message {
      font-size: 1rem; text-align: right;
      font-family: 'NespressoLucas'; color: #99221A;
    }
    .floating-footer__continue-area {
      display: flex; align-items: center; gap: 0.5rem;
    }
    /* Desktop: mostrar frete antes do botão Continuar */
    .floating-footer__frete-message {
      order: -1;
    }
    @media (max-width: 600px) {
      .floating-footer {
        flex-direction: row; justify-content: space-between;
        align-items: flex-start; padding: 1rem;
      }
      .floating-footer__section,
      .floating-footer__continue-area {
        width: 48%; flex-direction: column; align-items: flex-start;
      }
      .floating-footer__total span {
        display: block; margin-top: 0.25rem;
      }
      .floating-footer__discount-btn {
       width: 100%; padding: 10% 0% 0% 0%;
      }
      .floating-footer__continue-btn {
       width: 100%; 
      }
      .floating-footer__continue-area {
        flex-direction: column;
      }
      /* Mobile: botão Continuar primeiro, depois frete */
      .floating-footer__continue-btn { order: 0; }
      .floating-footer__frete-message {
        order: 1; margin-top: 0.5rem; text-align: center; width: 100%;
      }
      .frete-break { display: none; }
    }
  `;
        const styleEl = document.createElement("style");
        styleEl.type = "text/css";
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);

        // 2) Montar HTML do floating-footer
        const footerComponent = document.createElement("div");
        footerComponent.className = "floating-footer";
        footerComponent.innerHTML = `
    <div class="floating-footer__section">
      <div class="floating-footer__total">
        Total Estimado:
        <span id="totalPrice">R$ 34,00</span>
      </div>
      <button id="discountBtn" class="floating-footer__discount-btn">
        Adicionar cupom de desconto
      </button>
    </div>
    <div class="floating-footer__continue-area">
      <div id="freteMessage" class="floating-footer__frete-message"></div>
      <button id="continueBtn" class="floating-footer__continue-btn">
        Continuar
      </button>
    </div>
  `;
        document.body.appendChild(footerComponent);

        // 3) Cache de elementos
        const messageElement = document.getElementById("freteMessage");
        const totalPriceDisplay = document.getElementById("totalPrice");

        // 4) Verifica se StepFooter está visível
        const checkStepFooterVisibility = () => {
            const stepFooter = document.querySelector("div[class*='_StepFooter']");
            if (!stepFooter) return false;
            const rect = stepFooter.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom >= 0;
        };

        // 4.1) Verifica se a URL contém a string necessária
        const checkUrlContainsTarget = () => {
            return window.location.href.includes("standing-orders#/orders/create/new");
        };

        // 5) Atualiza texto de frete grátis
        let freightEventSent = false;
        const updateFreteMessage = () => {
            let totalCafes = 0;
            document
                .querySelectorAll(
                    "div[class*='QuotationBlock'] div[class*='QuotationBlock__lineLabel'] span"
                )
                .forEach((span) => {
                    const text = span.textContent.trim();
                    if (text.includes('Cafés') || text.includes('Cápsulas') || text.includes('Capsulas')) {
                        const match = text.match(/^(\d+)/);
                        if (match) totalCafes += parseInt(match[1], 10);
                    }
                });
            let produtosSelecionados = document.querySelectorAll(
                "button[data-testid='ButtonQuantity'][class*='selected']"
            );
            if (produtosSelecionados.length > 0) {
                produtosSelecionados.forEach(function(produto) {
                    let divCompletaProduto = produto.closest("tr");
                    if (divCompletaProduto) {
                        let nomeProduto = divCompletaProduto.querySelector(
                            "div[class*='productTitle']"
                        );
                        if (nomeProduto) {
                            let isKit = nomeProduto.textContent.toUpperCase().includes("KIT");
                            if (isKit) {
                                totalCafes += 30;
                            }
                        }
                    }
                });
            }
            if (totalCafes >= 30) {
                messageElement.innerHTML = `<strong>Frete grátis</strong> incluído`;
                messageElement.style.color = "#257a57";
                if (!freightEventSent) {
                    window.gtmDataObject.push({
                        event: "local_event",
                        event_raised_by: "br",
                        local_event_category: "comp-flutuante-assinatura",
                        local_event_action: "frete-gratis-incluido",
                        local_event_label: "frete-gratis",
                    });
                    freightEventSent = true;
                }
            } else {
                messageElement.innerHTML = `Adicione mais ${
        30 - totalCafes
      } cafés<span class="frete-break"><br></span> para <strong>frete grátis</strong>`;
                freightEventSent = false;
                messageElement.style.color = "#99221A";
            }

            // Condição atualizada: verifica URL + outras condições existentes
            footerComponent.style.display =
                totalCafes > 0 && !checkStepFooterVisibility() && checkUrlContainsTarget() ?
                "flex" :
                "none";
        };

        // 6) Atualiza total estimado
        const updateTotalPrice = () => {
            const sourceTotal = document.querySelector(
                "[class*='QuotationBlock__line--finalPrice'] span[class*='Price']"
            );
            if (sourceTotal) {
                totalPriceDisplay.textContent = sourceTotal.textContent.trim();
            }
        };

        // 7) updateAll
        const updateAll = () => {
            updateFreteMessage();
            updateTotalPrice();
        };
        updateAll();

        // 8) Observer + polling
        const quotationList = document.querySelector(
            "ul[class*='QuotationBlock__list']"
        );
        if (quotationList) {
            new MutationObserver(() => setTimeout(updateAll, 150)).observe(
                quotationList, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true,
                }
            );
        }
        setInterval(updateAll, 500);

        // 9) Evento "Adicionar cupom"
        document.getElementById("discountBtn").addEventListener("click", () => {
            window.gtmDataObject.push({
                event: "local_event",
                event_raised_by: "br",
                local_event_category: "comp-flutuante-assinatura",
                local_event_action: "clique-cupom-desconto",
                local_event_label: "cupom-de-desconto-assinatura",
            });
            const promo = document.querySelector("div[class*='PromotionsSection']");
            if (promo)
                promo.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
        });

        // 10) Evento "Continuar"
        document.getElementById("continueBtn").addEventListener("click", () => {
            window.gtmDataObject.push({
                event: "local_event",
                event_raised_by: "br",
                local_event_category: "comp-flutuante-assinatura",
                local_event_action: "clique-continuar",
                local_event_label: "continuar-assinatura",
            });
            const nativeButton = document.querySelector(
                'button[data-testid="continue"]'
            );
            if (nativeButton) nativeButton.click();
        });
    })();