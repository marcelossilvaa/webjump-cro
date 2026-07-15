(function () {
  "use strict";

  if (window.wjSubscribedCoffees) {
    return;
  }

  const RECURRING_ORDERS_URL =
    "/ecapi/checkout/v8/br/ecommerce/b2c/me/recurring-orders?language=pt&frontend=Responsive";

  let fetchPromise = null;
  let cachedResult = null;

  function extractSku(productId) {
    if (!productId) {
      return "";
    }
    return productId.replace("erp.br.b2c/prod/", "");
  }

  async function waitForNapi(maxAttempts, delay) {
    const attempts = maxAttempts || 15;
    const waitMs = delay || 400;

    for (let i = 0; i < attempts; i++) {
      if (window.napi) {
        return true;
      }
      await new Promise(function (resolve) {
        setTimeout(resolve, waitMs);
      });
    }
    return false;
  }

  async function fetchRecurringOrdersRaw() {
    if (window.napi && window.napi.checkout) {
      const checkout = window.napi.checkout();
      if (typeof checkout.getMyRecurringOrders === "function") {
        return checkout.getMyRecurringOrders();
      }
    }

    const response = await fetch(RECURRING_ORDERS_URL, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "Falha ao buscar assinaturas: HTTP " + response.status
      );
    }

    return response.json();
  }

  function mapSubscriptionLines(subscriptions) {
    const lines = [];
    let i = 0;

    while (i < subscriptions.length) {
      const subscription = subscriptions[i];
      const cartLines = (subscription.cart && subscription.cart.lines) || [];
      let j = 0;

      while (j < cartLines.length) {
        const line = cartLines[j];
        lines.push({
          recurringOrderId: subscription.recurringOrderId,
          nickname: subscription.nickname || "",
          productId: line.item,
          sku: extractSku(line.item),
          quantity: line.quantity || 0,
          unitPrice: line.unitPrice,
          totalPrice: line.totalPrice,
        });
        j++;
      }

      i++;
    }

    return lines;
  }

  async function fetchProductData(sku) {
    if (!sku || !window.napi || !window.napi.catalog) {
      return null;
    }

    try {
      return await window.napi.catalog().getProduct(sku);
    } catch (error) {
      return null;
    }
  }

  function enrichLineWithProduct(line, product) {
    if (!product) {
      return line;
    }

    let image =
      (product.responsiveImages && product.responsiveImages.plp) ||
      (product.images && product.images.main) ||
      "";

    if (image && image.indexOf("http") !== 0) {
      image = "https://www.nespresso.com" + image;
    }

    return {
      recurringOrderId: line.recurringOrderId,
      nickname: line.nickname,
      productId: line.productId,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      totalPrice: line.totalPrice,
      name: product.name || line.sku,
      intensity:
        (product.capsuleProperties && product.capsuleProperties.intensity) ||
        null,
      image: image,
      modelType: product.modelType || "",
    };
  }

  async function enrichLinesWithCatalog(lines) {
    const uniqueSkus = [];
    const skuMap = {};
    let i = 0;

    while (i < lines.length) {
      const sku = lines[i].sku;
      if (sku && !skuMap[sku]) {
        skuMap[sku] = true;
        uniqueSkus.push(sku);
      }
      i++;
    }

    const productsBySku = {};
    const productPromises = uniqueSkus.map(function (sku) {
      return fetchProductData(sku).then(function (product) {
        if (product) {
          productsBySku[sku] = product;
        }
      });
    });

    await Promise.all(productPromises);

    const enriched = [];
    i = 0;
    while (i < lines.length) {
      enriched.push(
        enrichLineWithProduct(lines[i], productsBySku[lines[i].sku])
      );
      i++;
    }

    return enriched;
  }

  function getUniqueSkus(lines) {
    const seen = {};
    const skus = [];
    let i = 0;

    while (i < lines.length) {
      const sku = lines[i].sku;
      if (sku && !seen[sku]) {
        seen[sku] = true;
        skus.push(sku);
      }
      i++;
    }

    return skus;
  }

  async function loadSubscribedCoffees(options) {
    const settings = options || {};
    const withCatalog = settings.withCatalog !== false;
    const forceRefresh = settings.forceRefresh === true;

    if (!forceRefresh && cachedResult) {
      return cachedResult;
    }

    if (!forceRefresh && fetchPromise) {
      return fetchPromise;
    }

    fetchPromise = (async function () {
      await waitForNapi();

      const raw = await fetchRecurringOrdersRaw();
      const subscriptions = (raw && raw.value) || [];
      const lines = mapSubscriptionLines(subscriptions);
      const coffees = withCatalog
        ? await enrichLinesWithCatalog(lines)
        : lines;

      cachedResult = {
        subscriptions: subscriptions,
        coffees: coffees,
        skus: getUniqueSkus(lines),
        fetchedAt: new Date().toISOString(),
      };

      return cachedResult;
    })();

    try {
      return await fetchPromise;
    } finally {
      fetchPromise = null;
    }
  }

  window.wjSubscribedCoffees = {
    getAll: function (options) {
      return loadSubscribedCoffees(options);
    },
    getSkus: function (options) {
      return loadSubscribedCoffees(options).then(function (result) {
        return result.skus;
      });
    },
    getBySubscription: function (recurringOrderId, options) {
      return loadSubscribedCoffees(options).then(function (result) {
        return result.coffees.filter(function (coffee) {
          return coffee.recurringOrderId === recurringOrderId;
        });
      });
    },
    getRawSubscriptions: function (options) {
      return loadSubscribedCoffees(
        Object.assign({}, options || {}, { withCatalog: false })
      ).then(function (result) {
        return result.subscriptions;
      });
    },
    refresh: function (options) {
      const settings = Object.assign({}, options || {}, {
        forceRefresh: true,
      });
      return loadSubscribedCoffees(settings);
    },
    clearCache: function () {
      cachedResult = null;
      fetchPromise = null;
    },
  };

  loadSubscribedCoffees()
    .then(function (result) {
      console.log("[wjSubscribedCoffees] Cafes assinados carregados:", result);
      console.log(
        "[wjSubscribedCoffees] SKUs unicos:",
        result.skus.join(", ") || "(nenhum)"
      );
    })
    .catch(function (error) {
      console.warn("[wjSubscribedCoffees] Erro ao carregar cafes:", error);
    });
})();
