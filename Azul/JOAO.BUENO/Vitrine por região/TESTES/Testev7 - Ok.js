(function () {
  // 0) Encontrar o bloco de destino
  const targetDiv = document
    .querySelector("#passagens")
    ?.closest(".css-caxvdr");
  if (!targetDiv) {
    console.error("Bloco de destino não encontrado.");
    return;
  }

  // 0.1) Criar o wrapper centralizado
  const wrapper = document.createElement("div");
  wrapper.style.maxWidth = "1024px";
  wrapper.style.margin = "0 auto";
  wrapper.style.padding = "0 16px";
  targetDiv.parentNode.insertBefore(wrapper, targetDiv.nextSibling);

  // 1) Inserir o H1
  const heading = document.createElement("div");
  heading.className = "css-putdhw";
  heading.innerHTML = `
    <h1 style="text-align: center;">
      <b><span class="deepcerulean">
        Viaje para os principais destinos <br> saindo de São Paulo
      </span></b>
    </h1>
  `;
  wrapper.appendChild(heading);

  // 2) Injetar CSS com carrossel horizontal
  const style = document.createElement("style");
  style.textContent = `
    
    .css-putdhw h1 {
      padding: 24px 0;
    }

    .azul-cards-container {
      display: flex;
      flex-wrap: nowrap;
      overflow: hidden;
      width: 100%;
      max-width: 968px;
      scroll-behavior: smooth;
      gap: 24px;
      padding: 24px 0;
      background-color: #ffffff;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      margin: 0 auto; /* centraliza quando maior que 968px */
    }

    .azul-card {
      flex: 0 0 auto;
      width: 224px;
      height: 100%;
      background-color: #fff;
      border-radius: 8px;
      border: 1px solid rgb(212, 212, 212);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .azul-card img {
      width: 100%;
      height: 167px;
      object-fit: cover;
    }
    .azul-card-content {
      padding: 16px 16px 0;
      flex: 1;
    }
    .azul-card h2 {
      font-size: 24px;
      font-weight: 700;
      color: #041E42;
      margin: 0;
      line-height: 36px;
    }
    .azul-airport {
      font-size: 18px;
      font-weight: 400;
      color: #041E42;
      margin: 0;
      line-height: 24px;
    }
    .azul-price-block {
      margin: 24px 0 28px;
    }
    .azul-price-label {
      font-size: 16px;
      color: #606060;
      margin: 0;
      line-height: 24px;
      font-weight: 400;
    }
    .azul-price {
      font-size: 24px;
      font-weight: 700;
      color: #007AD8;
      margin: 0;
      line-height: 36px;
    }
    .azul-btn {
      display: block;
      text-align: center;
      background-color:rgb(2, 108, 182);
      color: #fff;
      text-decoration: none;
      padding: 10px 0;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      border-radius: 4px;
      margin: 0 16px 16px;
      transition: background-color 0.3s ease;
    }
    .azul-btn:hover {
      background-color: #0066C1;
    }
    .azul-dots {
      display: flex;
      gap: 8px;
}
    .css-17gycxc {
      width: 36px;
      height: 8px;
      border-radius: 10px;
      background: #026CB6;
    }
    .css-y9uoad {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #606060;
      opacity: 0.5;
    }


  `;
  document.head.appendChild(style);

  // 3) Criar container de cards
  const container = document.createElement("div");
  container.className = "azul-cards-container";
  wrapper.appendChild(container);

  // 4) Função para criar cada card
  function addCard({ title, airport, priceLabel, price, imgSrc, buttonUrl }) {
  const card = document.createElement("div");
  card.className = "azul-card";
  card.innerHTML = `
    <img src="${imgSrc}" alt="${title} view">
    <div class="azul-card-content">
      <h2>${title}</h2>
      <p class="azul-airport">Saindo de ${airport}</p>
      <div class="azul-price-block">
        <p class="azul-price-label">${priceLabel}</p>
        <p class="azul-price">${price}</p>
      </div>
    </div>
    <a href="${buttonUrl}" class="azul-btn" target="_blank" rel="noopener noreferrer">
      Compre agora
    </a>
  `;
  container.appendChild(card);
}


  // 5) Adicionar 6 cards
  [
    {
      title: "Lisboa",
      airport: "Viracopos",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/Fbk4is2.jpeg",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-campinas-para-lisboa",
    },
    {
      title: "Recife",
      airport: "Guarulhos",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/OW3clMZ.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-são-paulo-para-recife",
    },
    {
      title: "Orlando",
      airport: "Viracopos",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/IakgjKu.jpeg",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-campinas-para-orlando",
    },
    {
      title: "Salvador",
      airport: "Viracopos",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/B5L3xqj.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-campinas-para-salvador",
    },
    {
      title: "Madrid",
      airport: "Viracopos",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/ynsAhTI.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-campinas-para-madri",
    },
    {
      title: "Maceió",
      airport: "Viracopos",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/xaSmjvO.jpeg",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-campinas-para-maceió",
    },
  ].forEach(addCard);

  // 6) Adicionar controles do carrossel
  const nav = document.createElement("div");
  nav.className = "css-19x9zec";
  nav.innerHTML = `
    <button type="button" class="css-nej6nr">
      <svg aria-label="Ícone de seta para esquerda" size="32" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ GFrTF">
        <path d="M133.9 527.8C126 518.8 126 505.2 133.9 496.2L364.9 232.2C373.7 222.2 388.8 221.2 398.8 229.9 408.8 238.7 409.8 253.8 401.1 263.8L204.9 488 872 488C885.3 488 896 498.7 896 512 896 525.3 885.3 536 872 536L204.9 536 401.1 760.2C409.8 770.2 408.8 785.3 398.8 794.1 388.8 802.8 373.7 801.8 364.9 791.8L133.9 527.8Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path>
      </svg>
    </button>
    <div role="button" tabindex="0" class="css-17gycxc"></div>
    <div role="button" tabindex="0" class="css-y9uoad"></div>
    <button type="button" class="css-nej6nr">
      <svg aria-label="Ícone de seta para direita" size="32" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ GFrTF">
        <path d="M890.1 496.2C898 505.2 898 518.8 890.1 527.8L659.1 791.8C650.3 801.8 635.2 802.8 625.2 794.1 615.2 785.3 614.2 770.2 622.9 760.2L819.1 536 152 536C138.7 536 128 525.3 128 512 128 498.7 138.7 488 152 488L819.1 488 622.9 263.8C614.2 253.8 615.2 238.7 625.2 229.9 635.2 221.2 650.3 222.2 659.1 232.2L890.1 496.2Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path>
      </svg>
    </button>
  `;
  wrapper.appendChild(nav);

  // 7) Dots responsivos + snap via cálculo exato
  let currentIndex = 0;
  const totalCards = container.children.length;
  const gapSize = 24;
  const cardEl = container.querySelector(".azul-card");
  const cardWidth = cardEl.offsetWidth;
  const prevBtn = nav.querySelector("button:first-of-type");
  const nextBtn = nav.querySelector("button:last-of-type");

  nav.querySelectorAll('div[role="button"]').forEach((d) => d.remove());
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "azul-dots";
  nav.insertBefore(dotsContainer, nextBtn);

  function getStepCount() {
    const cw = container.clientWidth;
    return Math.max(1, Math.floor(cw / (cardWidth + gapSize)));
  }

  function rebuildCarousel() {
    const stepCount = getStepCount();
    const pagesCount = Math.ceil(totalCards / stepCount);

    dotsContainer.innerHTML = "";
    for (let i = 0; i < pagesCount; i++) {
      const dot = document.createElement("div");
      dot.setAttribute("role", "button");
      dot.tabIndex = 0;
      dot.className = i === currentIndex ? "css-17gycxc" : "css-y9uoad";
      dot.addEventListener("click", () => {
        currentIndex = i;
        const cardIndex = Math.min(i * stepCount, totalCards - stepCount);
        const offset = cardIndex * (cardWidth + gapSize);
        container.scrollTo({ left: offset, behavior: "smooth" });
        updateDots();
      });
      dotsContainer.appendChild(dot);
    }

    prevBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
      }
      const cardIndex = Math.max(
        0,
        Math.min(currentIndex * stepCount, totalCards - stepCount)
      );
      const offset = cardIndex * (cardWidth + gapSize);
      container.scrollTo({ left: offset, behavior: "smooth" });
      updateDots();
    };

    nextBtn.onclick = () => {
      const pagesCount = Math.ceil(totalCards / stepCount);
      if (currentIndex < pagesCount - 1) {
        currentIndex++;
        const cardIndex = Math.min(
          currentIndex * stepCount,
          totalCards - stepCount
        );
        const offset = cardIndex * (cardWidth + gapSize);
        container.scrollTo({ left: offset, behavior: "smooth" });
        updateDots();
      }
    };

    updateDots();
  }

  function updateDots() {
    Array.from(dotsContainer.children).forEach((d, j) => {
      d.className = j === currentIndex ? "css-17gycxc" : "css-y9uoad";
    });
  }

  rebuildCarousel();
  window.addEventListener("resize", () => {
    currentIndex = 0;
    rebuildCarousel();
  });
})();
