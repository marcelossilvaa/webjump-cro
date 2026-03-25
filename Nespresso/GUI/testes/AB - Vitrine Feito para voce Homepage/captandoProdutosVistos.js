(function () {
  "use strict";
  if (window.captacaoPDPVitrineTarget) {
    return;
  }
  window.captacaoPDPVitrineTarget = "true";
  // Configurações
  const CONFIG = {
    localStorageKey: "nespresso_viewed_products",
    maxStoredProducts: 20, // Limita quantidade de produtos armazenados
    targetPageName: "capsules pdp",
    skuSelector: "nb-sku-coffee",
  };

  function isCapsulesProductPage() {
    try {
      if (!window.padl) {
        return false;
      }
      return (
        window.padl.page &&
        window.padl.page.pageInfo &&
        window.padl.page.pageInfo.pageName === CONFIG.targetPageName
      );
    } catch (error) {
      return false;
    }
  }

  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  // Função para extrair o SKU do produto atual
  function getCurrentProductSku() {
    try {
      const skuElement = document.querySelector(CONFIG.skuSelector);
      if (!skuElement) {
        return null;
      }

      if (skuElement.hasAttribute("data")) {
        const skuData = skuElement.getAttribute("data");
        // Parse do JSON se necessário
        if (skuData.startsWith("{")) {
          const parsedData = JSON.parse(skuData);
          return parsedData.id || null;
        }
        return skuData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Função para obter produtos visualizados do localStorage
  function getViewedProducts() {
    try {
      const stored = localStorage.getItem(CONFIG.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Função para salvar produtos visualizados no localStorage
  function saveViewedProducts(products) {
    try {
      localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(products));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Função para adicionar produto à lista de visualizados
  function addViewedProduct(sku) {
    if (!sku) return false;

    let viewedProducts = getViewedProducts();

    // Remove o produto se já existir (para reordenar)
    viewedProducts = viewedProducts.filter((item) => item.sku !== sku);

    // Adiciona o produto no início da lista com timestamp
    const productData = {
      sku: sku,
      timestamp: Date.now(),
      url: window.location.href,
      viewedAt: new Date().toISOString(),
    };

    viewedProducts.unshift(productData);

    // Limita o número de produtos armazenados
    if (viewedProducts.length > CONFIG.maxStoredProducts) {
      viewedProducts = viewedProducts.slice(0, CONFIG.maxStoredProducts);
    }

    return saveViewedProducts(viewedProducts);
  }

  // Função principal para capturar e salvar SKU
  async function trackProductView() {
    // Verifica se estamos numa PDP de cápsulas
    if (!isCapsulesProductPage()) {
      return;
    }

    // Aguarda o elemento SKU estar disponível
    const skuElement = await waitForElement(CONFIG.skuSelector);

    if (!skuElement) {
      return;
    }

    const sku = getCurrentProductSku();

    if (sku) {
      addViewedProduct(sku);
    }
  }

  // Função para limpar dados antigos (opcional)
  function cleanOldEntries(maxAge = 30 * 24 * 60 * 60 * 1000) {
    // 30 dias
    const viewedProducts = getViewedProducts();
    const now = Date.now();

    const filteredProducts = viewedProducts.filter((product) => {
      return now - product.timestamp < maxAge;
    });

    if (filteredProducts.length !== viewedProducts.length) {
      saveViewedProducts(filteredProducts);
    }
  }

  // Função utilitária para obter produtos visualizados (para usar na página "Feito para você")
  window.getNespressoViewedProducts = function () {
    return getViewedProducts();
  };

  // Função utilitária para limpar histórico
  window.clearNespressoViewedProducts = function () {
    localStorage.removeItem(CONFIG.localStorageKey);
  };

  // Inicialização
  function init() {
    // Para Adobe Target, aguarda um pouco mais
    setTimeout(() => {
      trackProductView();
      cleanOldEntries();
    }, 1000); // Aumenta o delay para Adobe Target
  }

  // Aguarda o DOM estar pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
