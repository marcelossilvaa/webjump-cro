(function () {
  // 0) Encontrar o bloco de destino
  const targetDiv = document
    .querySelector("#passagens")
    ?.closest(".css-caxvdr");
  if (!targetDiv) {
    console.error("Bloco de destino não encontrado.");
    return;
  }

  // 1) Inserir o H1
  const heading = document.createElement("div");
  heading.className = "css-putdhw";
  heading.innerHTML = `
    <h1 style="text-align: center;">
      <b><span class="deepcerulean">
        Viaje pelo Brasil de norte a sul com essas ofertas saindo de São Paulo
      </span></b>
    </h1>
  `;
  targetDiv.parentNode.insertBefore(heading, targetDiv.nextSibling);

  // 2) Injetar CSS com carrossel horizontal
  const style = document.createElement("style");
  style.textContent = `
    
  .azul-cards-container {
      display: flex;
      flex-wrap: nowrap;
      overflow: hidden;
      width: 100%;
      max-width: calc(4 * 234px + 3 * 24px);
      scroll-behavior: smooth;
      gap: 24px;
      padding: 24px;
      background-color: #FFFFFF;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .azul-card {
      flex: 0 0 auto;
      width: 224px;
      height: 470px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  `;
  document.head.appendChild(style);

  // 3) Criar container de cards
  const container = document.createElement("div");
  container.className = "azul-cards-container";
  heading.parentNode.insertBefore(container, heading.nextSibling);

  // 4) Função para criar cada card
  function addCard({ title, airport, priceLabel, price, imgSrc, buttonUrl }) {
    const card = document.createElement("div");
    card.className = "azul-card";
    card.innerHTML = `
      <img src="${imgSrc}" alt="${title} view" />
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
      airport: "VCP",
      priceLabel: "A partir de:",
      price: "10x de R$XX",
      imgSrc: "URL_IMG_LISBOA",
      buttonUrl: "#",
    },
    {
      title: "Recife",
      airport: "SAO / VCP / GRU",
      priceLabel: "A partir de:",
      price: "10x de R$XX",
      imgSrc: "URL_IMG_RECIFE",
      buttonUrl: "#",
    },
    {
      title: "Orlando",
      airport: "VCP",
      priceLabel: "A partir de:",
      price: "10x de R$XX",
      imgSrc: "URL_IMG_ORLANDO",
      buttonUrl: "#",
    },
    {
      title: "Salvador",
      airport: "VCP / SAO",
      priceLabel: "A partir de:",
      price: "10x de R$XX",
      imgSrc: "URL_IMG_SALVADOR",
      buttonUrl: "#",
    },
    {
      title: "Madri",
      airport: "VCP",
      priceLabel: "A partir de:",
      price: "10x de R$XX",
      imgSrc: "URL_IMG_MADRI",
      buttonUrl: "#",
    },
    {
      title: "Maceió",
      airport: "VCP",
      priceLabel: "A partir de:",
      price: "10x de R$XX",
      imgSrc: "URL_IMG_MACEIO",
      buttonUrl: "#",
    },
  ].forEach(addCard);

  // 6) Adicionar controles do carrossel (com SVG completo)
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
  container.parentNode.insertBefore(nav, container.nextSibling);

  // 7) Lógica de navegação e indicadores dinâmicos
  const prevBtn = nav.querySelector("button.css-nej6nr:first-of-type");
  const nextBtn = nav.querySelector("button.css-nej6nr:last-of-type");
  const dots = nav.querySelectorAll('div[role="button"]');
  const card = container.querySelector(".azul-card");
  const gap = 24;
  const stepCards = 2;
  const scrollStep = stepCards * (card.offsetWidth + gap);
  const totalCards = container.querySelectorAll(".azul-card").length;
  const visibleCards = 4;
  const maxIndex = Math.ceil((totalCards - visibleCards) / stepCards);
  let currentIndex = 0;

  function updateDots() {
    if (currentIndex === 0) {
      dots[0].classList.add("css-17gycxc");
      dots[0].classList.remove("css-y9uoad");
      dots[1].classList.add("css-y9uoad");
      dots[1].classList.remove("css-17gycxc");
    } else {
      dots[0].classList.add("css-y9uoad");
      dots[0].classList.remove("css-17gycxc");
      dots[1].classList.add("css-17gycxc");
      dots[1].classList.remove("css-y9uoad");
    }
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      container.scrollTo({
        left: currentIndex * scrollStep,
        behavior: "smooth",
      });
      updateDots();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
      container.scrollTo({
        left: currentIndex * scrollStep,
        behavior: "smooth",
      });
      updateDots();
    }
  });

  // Inicializa o indicador
  updateDots();
})();
