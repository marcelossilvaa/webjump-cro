(function () {
  if (window.precoPorCapsulaAB) {
    return;
  }
  window.precoPorCapsulaAB = "true";

  var PRODUCTS_CONTAINER_SELECTOR = "plp-cards-grid";

  //Helper functions
  function extrairNumeros(texto) {
    // Usa regex para encontrar dígitos e vírgulas
    const numeros = texto.match(/[\d,]/g);

    // Se não encontrar números, retorna string vazia
    if (!numeros) {
      return "";
    }

    // Junta todos os caracteres encontrados em uma única string
    return numeros.join("");
  }

  //Price Adjusts
  function applyBestsellerFlags() {
    let capsulesCards = document.querySelectorAll(
      "plp-cards-grid article[data-product-short-sku][aria-label]:not(article[aria-label*='Kit'],article.pricePerCapsule)"
    );
    if (capsulesCards) {
      capsulesCards.forEach(function (card) {
        let spanFullPrice = card.querySelector("span[class*='formattedPrice']");
        let spanCapsuleQuantity = card.querySelector(
          "div[class*='defaultCapsuleLabel']"
        );
        let divPerCapsulePrice = card.querySelector(
          "div[class*='capsuleSleeveLabel']"
        );
        if (spanFullPrice && divPerCapsulePrice && spanCapsuleQuantity) {
          let fullPrice = extrairNumeros(spanFullPrice.innerText);
          let quantity = extrairNumeros(spanCapsuleQuantity.innerText);
          let priceCapsule = extrairNumeros(divPerCapsulePrice.innerText);
          if (fullPrice && quantity && priceCapsule) {
            fullPrice = parseFloat(fullPrice.replace(",", "."));
            priceCapsule = parseFloat(priceCapsule.replace(",", "."));
            quantity = parseInt(quantity);
            if (fullPrice && priceCapsule) {
              spanFullPrice.innerText =
                "R$ " +
                (fullPrice / quantity).toFixed(2).toString().replace(".", ",");
              divPerCapsulePrice.innerText =
                "R$ " +
                fullPrice.toFixed(2).toString().replace(".", ",") +
                "/Caixa";
              card.classList.add("pricePerCapsule");
            }
          }
        }
      });
    }
  }
  function init() {
    applyBestsellerFlags();
    var productsContainer = document.querySelector(PRODUCTS_CONTAINER_SELECTOR);
    if (productsContainer) {
      var observer = new MutationObserver(function (mutations) {
        var hasRelevantChanges = mutations.some(function (mutation) {
          var hasNewProducts = Array.from(mutation.addedNodes).some(function (
            node
          ) {
            return (
              node.nodeType === 1 &&
              (node.matches("article[data-product-short-sku]") ||
                node.querySelector("article[data-product-short-sku]"))
            );
          });
          if (
            mutation.type === "attributes" &&
            mutation.target.matches("article[data-product-short-sku]")
          ) {
            return true;
          }
          return hasNewProducts;
        });
        if (hasRelevantChanges) {
          requestAnimationFrame(applyBestsellerFlags);
        }
      });
      observer.observe(productsContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-product-short-sku"],
      });
    } else {
      var bodyObserver = new MutationObserver(function (mutations) {
        var productsContainer = document.querySelector(
          PRODUCTS_CONTAINER_SELECTOR
        );
        if (productsContainer) {
          init();
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
