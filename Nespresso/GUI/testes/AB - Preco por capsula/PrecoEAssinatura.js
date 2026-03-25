(function () {
  "use strict";

  // Proteção contra múltiplas execuções
  if (window.precoPorCapsulaAB) {
    return;
  }
  window.precoPorCapsulaAB = true;

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
  // Configurações
  const CONFIG = {
    PRODUCTS_CONTAINER_SELECTOR: "plp-cards-grid", // Corrigido para seletor de classe
    SELECTORS: {
      PRODUCT_CARDS:
        'article[data-product-short-sku][aria-label]:not([aria-label*="Kit"],[aria-label*="KIT"],.pricePerCapsule)',
      FULL_PRICE: 'span[class*="formattedPrice"]',
      CAPSULE_QUANTITY: 'div[class*="defaultCapsuleLabel"]',
      PER_CAPSULE_PRICE: 'div[class*="capsuleSleeveLabel"]',
      PRICE_CONTAINER:
        'div[class*="priceBox"] div[class*="capsuleAndSleeveLabelWrapper"]',
    },
    CURRENCY: "R$",
    PROCESSED_CLASS: "pricePerCapsule",
  };
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
  // Utilitários
  const Utils = {
    extrairNumeros(texto) {
      if (!texto || typeof texto !== "string") return "";

      // Regex mais específica para capturar preços brasileiros
      const match = texto.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
      return match ? match[1] : "";
    },

    parsePreco(precoString) {
      if (!precoString) return null;

      try {
        // Remove pontos (separadores de milhares) e substitui vírgula por ponto
        const numeroLimpo = precoString.replace(/\./g, "").replace(",", ".");
        const numero = parseFloat(numeroLimpo);
        return isNaN(numero) ? null : numero;
      } catch (error) {
        console.warn("Erro ao fazer parse do preço:", precoString, error);
        return null;
      }
    },

    formatarPreco(numero) {
      return numero.toFixed(2).replace(".", ",");
    },

    debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },
  };

  // Função principal para processar os preços
  function processarPrecosPorCapsula() {
    try {
      const produtoCards = document.querySelectorAll(
        CONFIG.SELECTORS.PRODUCT_CARDS
      );

      if (!produtoCards.length) return;

      let processados = 0;

      produtoCards.forEach((card) => {
        try {
          const elementos = {
            precoTotal: card.querySelector(CONFIG.SELECTORS.FULL_PRICE),
            quantidade: card.querySelector(CONFIG.SELECTORS.CAPSULE_QUANTITY),
            precoCapsula: card.querySelector(
              CONFIG.SELECTORS.PER_CAPSULE_PRICE
            ),
            containerPreco: card.querySelector(
              CONFIG.SELECTORS.PRICE_CONTAINER
            ),
          };

          // Valida se todos os elementos existem
          if (
            !elementos.precoTotal ||
            !elementos.quantidade ||
            !elementos.precoCapsula ||
            !elementos.containerPreco
          ) {
            return;
          }

          // Extrai e valida dados
          const dados = {
            precoTotalTexto: Utils.extrairNumeros(
              elementos.precoTotal.textContent || ""
            ),
            quantidadeTexto: Utils.extrairNumeros(
              elementos.quantidade.textContent || ""
            ),
            precoCapsuleTexto: Utils.extrairNumeros(
              elementos.precoCapsula.textContent || ""
            ),
          };

          if (
            !dados.precoTotalTexto ||
            !dados.quantidadeTexto ||
            !dados.precoCapsuleTexto
          ) {
            return;
          }

          // Converte para números
          const precoTotal = Utils.parsePreco(dados.precoTotalTexto);
          const quantidade = parseInt(dados.quantidadeTexto);
          const precoCapsula = Utils.parsePreco(dados.precoCapsuleTexto);

          // Valida números
          if (!precoTotal || !quantidade || !precoCapsula || quantidade <= 0) {
            return;
          }

          // Calcula preço por cápsula
          const precoUnitario = precoTotal / quantidade;

          // Atualiza interface (inverte a apresentação)
          elementos.precoTotal.textContent =
            CONFIG.CURRENCY + Utils.formatarPreco(precoUnitario);
          elementos.precoCapsula.textContent =
            CONFIG.CURRENCY + Utils.formatarPreco(precoTotal) + "/Caixa";

          //Codigo para ajustar Cards de capsulas que possuem preco com desconto
          if (
            elementos.precoTotal.classList.contains("original-price-kor-dev")
          ) {
            let divPrecoDesconto = card.querySelector(".discounted-price-plp");
            if (divPrecoDesconto) {
              let valorDesconto = Utils.extrairNumeros(
                divPrecoDesconto.textContent
              );
              if (valorDesconto) {
                valorDesconto = Utils.parsePreco(valorDesconto);
                valorDesconto = valorDesconto / quantidade;
                divPrecoDesconto.textContent =
                  CONFIG.CURRENCY + Utils.formatarPreco(valorDesconto);
              }
            }
          }
          //Implementa preço de assinatura
          let tagsCard = card.querySelectorAll("header[class*='tags'] span");
          let isAbleToImplementSignature = true;
          tagsCard.forEach(function (tag) {
            if (tag.innerText.toLowerCase() == "edição limitada") {
              isAbleToImplementSignature = false;
            }
          });
          if (isAbleToImplementSignature) {
            let descontoAssinatura = (precoTotal * 0.9) / quantidade;
            let signatureComponentHTML =
              `<div class="_capsuleSleeveLabel_10cre_45 assinaturaPLP"><span style='font-size: 14px;'>` +
              CONFIG.CURRENCY +
              Utils.formatarPreco(descontoAssinatura) +
              `</span> na Assinatura</div>`;
            elementos.containerPreco.insertAdjacentHTML(
              "beforeend",
              signatureComponentHTML
            );
            card
              .querySelector(".assinaturaPLP")
              .addEventListener("click", function (e) {
                e.stopPropagation();
                sendGAEvent("click_economize_assinatura_plp");
                window.location.href =
                  "https://www.nespresso.com/br/pt/pedido-automatico";
              });
          }
          // Marca como processado
          card.classList.add(CONFIG.PROCESSED_CLASS);
          processados++;
        } catch (error) {
          console.warn("Erro ao processar card individual:", error, card);
        }
      });
    } catch (error) {
      console.error("Erro na função processarPrecosPorCapsula:", error);
    }
  }

  // Observer otimizado com debounce
  const processarComDebounce = Utils.debounce(processarPrecosPorCapsula, 100);

  // Configuração do observer de mutações
  function criarObserver(container) {
    return new MutationObserver(function (mutations) {
      let deveProcesar = false;

      // Verifica se há mudanças relevantes
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Verifica se há novos produtos adicionados
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.matches?.("article[data-product-short-sku]") ||
                node.querySelector?.("article[data-product-short-sku]")
              ) {
                deveProcesar = true;
                break;
              }
            }
          }
        } else if (
          mutation.type === "attributes" &&
          mutation.target.matches?.("article[data-product-short-sku]")
        ) {
          deveProcesar = true;
        }

        if (deveProcesar) break;
      }

      if (deveProcesar) {
        processarComDebounce();
      }
    });
  }

  // Inicialização
  function inicializar() {
    try {
      document.head.insertAdjacentHTML(
        "beforeend",
        `<style>
        .primeContainer{display:none;}
        .assinaturaPLP{
            font-weight: bold;
            font-size: 12px;
            background-color: rgb(153, 34, 26);
            color: #fff;
            padding: 4px;
            margin-top: 8px;
            margin-bottom: 4px;
            border-radius: 4px;
          }</style>`
      );
      // Processa produtos já existentes
      processarPrecosPorCapsula();

      // Configura observer para novos produtos
      const container = document.querySelector(
        CONFIG.PRODUCTS_CONTAINER_SELECTOR
      );

      if (container) {
        const observer = criarObserver(container);
        observer.observe(container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-product-short-sku"],
        });

        // Cleanup quando a página é descarregada
        window.addEventListener("beforeunload", () => {
          observer.disconnect();
        });
      } else {
        // Se o container não existe ainda, observa o body até encontrá-lo
        const bodyObserver = new MutationObserver(function () {
          const container = document.querySelector(
            CONFIG.PRODUCTS_CONTAINER_SELECTOR
          );
          if (container) {
            bodyObserver.disconnect();
            inicializar(); // Reinicializa com o container encontrado
          }
        });

        bodyObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Timeout de segurança para evitar observer infinito
        setTimeout(() => {
          bodyObserver.disconnect();
        }, 10000);
      }
    } catch (error) {
      console.error("Erro na inicialização do teste A/B Nespresso:", error);
    }
  }
  setTimeout(inicializar, 0);
})();
