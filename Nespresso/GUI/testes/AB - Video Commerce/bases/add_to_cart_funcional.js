let cafes = {
  "Café Active - 80ml": {
    sku: "7192.70",
    quantity: 10,
  },
  "Café Vivida - 230ml": {
    sku: "7063.60",
    quantity: 10,
  },
  "Sweet Vanilla Decaffeinato": {
    sku: "7057.80",
    quantity: 10,
  },
  "Arpeggio Decaffeinato": {
    sku: "7862.90",
    quantity: 10,
  },
  "Taça Barista Mixologist": {
    sku: "145747",
    quantity: 1,
  },
  "Bolsa Reversível Lifestyle": {
    sku: "146925",
    quantity: 1,
  },
  "Cafeteira Essenza Mini Preta 110v": {
    sku: "C30-BR-BK-NE3",
    quantity: 1,
  },
};

// Função para adicionar botão ao produto
function addButtonToProduct(product) {
  // Tenta acessar o shadowRoot, se não estiver disponível, retorna
  if (!product || !product.shadowRoot) {
    return false;
  }

  const productName = product.shadowRoot.querySelector(".lav-product-name");
  const productInfo = product.shadowRoot.querySelector(".liveshop-ads-video");

  if (!productInfo) {
    return false;
  }

  // Verifica se já existe um botão neste produto
  const existingButton = productInfo.querySelector(".add-to-cart-button");
  if (existingButton) {
    return true; // Já tem botão
  }

  productInfo.style.position = "relative";
  const productData = productName
    ? cafes[productName.textContent.trim()]
    : null;
  const sku = productData ? productData.sku : null;
  const quantity = productData ? productData.quantity : null;

  if (sku && productInfo) {
    // Adiciona CSS dentro do shadowRoot se ainda não existir
    let styleElement = product.shadowRoot.querySelector(
      "style#add_cart_button_video_commerce_personalized"
    );
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "add_cart_button_video_commerce_personalized";
      styleElement.textContent = `
        .add-to-cart-button {
          background-color: #257a57;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: "NespressoLucas", sans-serif;
          transition: background-color 0.3s ease;
          width: fit-content;
          height: fit-content;
          padding: 0px 8px;
          font-size: 28px;
          font-weight: 400;

          position: absolute;
          bottom: 20px;
          right: 35px;
        }
      `;
      product.shadowRoot.appendChild(styleElement);
    }
    const button = document.createElement("button");
    button.className = "add-to-cart-button";
    button.textContent = "+";
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      window.CartManager.updateItem(sku, quantity, null, null, false);
      alert("clicou");
    });
    productInfo.appendChild(button);
    return true; // Botão adicionado com sucesso
  }

  return false;
}

// Função para processar todos os produtos visíveis
function processAllProducts() {
  try {
    const carousel = document.querySelector("liveshop-ads-carousel-v2");
    if (!carousel || !carousel.shadowRoot) {
      return;
    }

    const swiperWrapper = carousel.shadowRoot.querySelector(
      ".swiper-horizontal .swiper-wrapper"
    );
    if (!swiperWrapper) {
      return;
    }

    // Busca todos os produtos, incluindo os que podem estar fora da viewport
    const allProducts = swiperWrapper.querySelectorAll("liveshop-ads-video");

    allProducts.forEach((product) => {
      // Tenta adicionar o botão, se o shadowRoot não estiver pronto, tenta novamente depois
      if (!addButtonToProduct(product)) {
        // Se falhou, pode ser que o shadowRoot ainda não esteja pronto
        // Vamos tentar novamente após um pequeno delay
        setTimeout(() => {
          addButtonToProduct(product);
        }, 100);
      }
    });
  } catch (error) {
    console.error("Erro ao processar produtos:", error);
  }
}

// Função com debounce para evitar muitas chamadas
let processTimeout;
function debouncedProcessAllProducts() {
  clearTimeout(processTimeout);
  processTimeout = setTimeout(() => {
    processAllProducts();
  }, 50);
}

// Processa produtos iniciais
processAllProducts();

// Observa mudanças no DOM para detectar novos produtos
let carousel = document.querySelector("liveshop-ads-carousel-v2");
if (carousel && carousel.shadowRoot) {
  const swiperWrapper = carousel.shadowRoot.querySelector(
    ".swiper-horizontal .swiper-wrapper"
  );

  if (swiperWrapper) {
    // MutationObserver para detectar quando novos produtos são adicionados
    const observer = new MutationObserver(() => {
      debouncedProcessAllProducts();
    });

    observer.observe(swiperWrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"], // Observa mudanças de classe que podem indicar slides ativos
    });
  }
}

// Observa eventos de scroll e swipe no carousel
if (carousel && carousel.shadowRoot) {
  const swiperContainer =
    carousel.shadowRoot.querySelector(".swiper-horizontal");
  if (swiperContainer) {
    // Observa eventos de scroll
    swiperContainer.addEventListener("scroll", debouncedProcessAllProducts, {
      passive: true,
    });

    // Observa eventos de touch (swipe)
    swiperContainer.addEventListener("touchmove", debouncedProcessAllProducts, {
      passive: true,
    });
    swiperContainer.addEventListener("touchend", debouncedProcessAllProducts, {
      passive: true,
    });
  }
}

// Observa mudanças no carousel principal (caso seja recriado)
const carouselObserver = new MutationObserver(() => {
  const newCarousel = document.querySelector("liveshop-ads-carousel-v2");
  if (newCarousel && newCarousel !== carousel) {
    carousel = newCarousel;
    processAllProducts();
  }
});

if (document.body) {
  carouselObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Verificação periódica mais frequente para garantir que todos os produtos tenham botão
setInterval(() => {
  processAllProducts();
}, 300); // Verifica a cada 300ms (mais frequente)
