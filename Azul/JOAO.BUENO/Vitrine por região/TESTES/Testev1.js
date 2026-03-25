(function () {
  const targetDiv = document
    .querySelector("#passagens")
    ?.closest(".css-caxvdr");
  if (!targetDiv) {
    console.error("Bloco de destino não encontrado.");
    return;
  }

  // 1) INSERIR O H1
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

  // 2) INJETAR CSS
  const style = document.createElement("style");
  style.textContent = `
.azul-cards-container {
  display: flex;
  flex-wrap: nowrap;           /* NUNCA cria mais de uma linha */
  overflow: hidden;            /* Esconde o que ultrapassar a largura */
  scroll-behavior: smooth;     /* Anima o scroll */
  gap: 24px;
  padding: 24px;
  background-color: #FFFFFF;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

    .azul-card {
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

    .azul-resort {
      font-size: 13px;
      color: #828282;
      margin: 0 !important;
    }

    .azul-price-block {
      margin: 24px 0 28px;
    }

    .azul-card.with-info .azul-price-block {
      margin: 16px 0;
    }

    .azul-price-label {
      font-size: 16px;
      color: #606060;
      margin: 0;
      line-height: 24px;
      font-style: normal;
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
      background-color: #007BE5;
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

    .azul-additional-info {
      padding: 0 16px 16px 16px;
      font-size: 13px;
      color: #4F4F4F;
      line-height: 1.4;
    }

    .azul-additional-info p {
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  // 3) CRIAR CONTAINER DE CARDS
  const container = document.createElement("div");
  container.className = "azul-cards-container";
  heading.parentNode.insertBefore(container, heading.nextSibling);

  // 4) FUNÇÃO PARA ADICIONAR CARDS
  function addCard({
    title,
    airport,
    resort,
    priceLabel,
    price,
    imgSrc,
    additionalInfo,
    buttonUrl,
  }) {
    const card = document.createElement("div");
    card.classList.add("azul-card");
    if (additionalInfo) card.classList.add("with-info");

    card.innerHTML = `
      <img src="${imgSrc}" alt="${title} city view" />
      <div class="azul-card-content">
        <h2>${title}</h2>
        <p class="azul-airport">Saindo de ${airport}</p>
        ${resort ? `<p class="azul-resort">${resort}</p>` : ""}
        <div class="azul-price-block">
          <p class="azul-price-label">${priceLabel}</p>
          <p class="azul-price">${price}</p>
        </div>
      </div>
      <a href="${
        buttonUrl || "#"
      }" class="azul-btn" target="_blank" rel="noopener noreferrer">
        Compre agora
      </a>
      ${
        additionalInfo
          ? `
        <div class="azul-additional-info">
          <p>${additionalInfo}</p>
        </div>`
          : ""
      }
    `;
    container.appendChild(card);
  }

  // 5) EXEMPLOS DE USO
  addCard({
    title: "Lisboa",
    airport: "São Paulo - Viracopos",
    resort: "",
    priceLabel: "",
    price: "",
    imgSrc: "https://i.imgur.com/Fbk4is2.jpeg",
    buttonUrl: "https://www.voeazul.com.br",
  });

  addCard({
    title: "Recife",
    airport: "SAO / VCP / GRU",
    resort: "",
    priceLabel: "A partir de:",
    price: "10x de R$XX",
    imgSrc: "URL_DA_IMAGEM_RECIFE", // substitua pela URL real
    buttonUrl: "https://www.voeazul.com.br",
  });

  addCard({
    title: "Orlando",
    airport: "São Paulo - Viracopos",
    resort: "",
    priceLabel: "",
    price: "",
    imgSrc: "https://i.imgur.com/IakgjKu.jpeg",
    buttonUrl: "https://www.voeazul.com.br",
  });

  addCard({
    title: "Salvador",
    airport: "VCP / SAO",
    resort: "",
    priceLabel: "A partir de:",
    price: "10x de R$XX",
    imgSrc: "URL_DA_IMAGEM_SALVADOR", // substitua pela URL real
    buttonUrl: "https://www.voeazul.com.br",
  });

  addCard({
    title: "Madri",
    airport: "VCP",
    resort: "",
    priceLabel: "A partir de:",
    price: "10x de R$XX",
    imgSrc: "URL_DA_IMAGEM_MADRI", // substitua pela URL real
    buttonUrl: "https://www.voeazul.com.br",
  });

  addCard({
    title: "Maceió",
    airport: "VCP",
    resort: "",
    priceLabel: "A partir de:",
    price: "10x de R$XX",
    imgSrc: "URL_DA_IMAGEM_MACEIO", // substitua pela URL real
    buttonUrl: "https://www.voeazul.com.br",
  });

  // 6) ADICIONAR CONTROLES DO CARROSSEL
  const nav = document.createElement("div");
  nav.className = "css-19x9zec";
  nav.innerHTML = `
    <button type="button" class="css-nej6nr">
      <svg aria-label="Ícone de seta para esquerda" size="32" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ GFrTF">
        <path d="M133.9 527.8C126 518.8 126 505.2 133.9 496.2L364.9 232.2C373.7 222.2 388.8 221.2 398.8 229.9 408.8 238.7 409.8 253.8 401.1 263.8L204.9 488 872 488C885.3 488 896 498.7 896 512 896 525.3 885.3 536 872 536L204.9 536 401.1 760.2C409.8 770.2 408.8 785.3 398.8 794.1 388.8 802.8 373.7 801.8 364.9 791.8L133.9 527.8Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path>
      </svg>
    </button>
    <div role="button" tabindex="0" aria-label="Carousel Dots" class="css-17gycxc"></div>
    <div role="button" tabindex="0" aria-label="Carousel Dots" class="css-y9uoad"></div>
    <button type="button" class="css-nej6nr">
      <svg aria-label="Ícone de seta para direita" size="32" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ GFrTF">
        <path d="M890.1 496.2C898 505.2 898 518.8 890.1 527.8L659.1 791.8C650.3 801.8 635.2 802.8 625.2 794.1 615.2 785.3 614.2 770.2 622.9 760.2L819.1 536 152 536C138.7 536 128 525.3 128 512 128 498.7 138.7 488 152 488L819.1 488 622.9 263.8C614.2 253.8 615.2 238.7 625.2 229.9 635.2 221.2 650.3 222.2 659.1 232.2L890.1 496.2Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path>
      </svg>
    </button>
  `;
  container.parentNode.insertBefore(nav, container.nextSibling);
})();
