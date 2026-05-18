(function () {
  // 0) Encontrar o bloco de destino
  const targetDiv = document
    .querySelector(
      'img[src*="Group 11433 (2).png"], img[src*="Group 11433 (7).png"], img[src*="Faixa LP - Mobile.png"]'
    )
    ?.closest(".container-capsule.containerDefaultNoPadding.css-pbbmh8");
  if (!targetDiv) {
    console.error("Bloco de destino não encontrado.");
    return;
  }

  // 0.1) Criar o wrapper centralizado e fixar um ID estático
  const wrapper = document.createElement("div");
  wrapper.id = "azul-carousel-wrapper";
  wrapper.style.maxWidth = "1024px";
  wrapper.style.margin = "0 auto";
  wrapper.style.padding = "0 16px";
  targetDiv.parentNode.insertBefore(wrapper, targetDiv.nextSibling);

  // 1) Inserir o H1
  const heading = document.createElement("div");
  heading.className = "azul-title";
  heading.innerHTML = `
    <h1 style="text-align: center;">
      <b><span class="azul-title-carousel">
        Viaje para os principais destinos <br> saindo de Rio de Janeiro
      </span></b>
    </h1>
  `;
  wrapper.appendChild(heading);

  // 2) Injetar CSS escopado pelo ID do wrapper e usando data-attributes
  const style = document.createElement("style");
  style.textContent = `
    #azul-carousel-wrapper .azul-title h1 {
      padding: 24px 0;
      color: rgb(2, 108, 182)
    }
    #azul-carousel-wrapper .azul-cards-container {
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
      margin: 0 auto;
    }
    #azul-carousel-wrapper .azul-card {
      flex: 0 0 auto;
      width: 224px;
      height: 100%;
      background-color: #fff;
      border-radius: 8px;
      border: 1px solid #d4d4d4;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    #azul-carousel-wrapper .azul-card img {
      width: 100%;
      height: 167px;
      object-fit: cover;
    }
    #azul-carousel-wrapper .azul-card-content {
      padding: 16px;
      flex: 1;
    }
    #azul-carousel-wrapper .azul-card-content h2 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700 !important;
      color: #041E42;
    }
    #azul-carousel-wrapper .azul-airport {
      margin: 0 0 16px;
      font-size: 18px;
      line-height: 25px;
      color: #041E42;
    }
    #azul-carousel-wrapper .azul-btn {
      margin: auto 16px 16px;
      padding: 10px 0;
      background-color:rgb(2, 108, 182);
      color: #fff;
      text-align: center;
      border-radius: 4px;
      text-decoration: none;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    #azul-carousel-wrapper .azul-btn:hover {
      background-color:rgb(5, 82, 138);
    }
     #azul-carousel-wrapper .azul-dots {
      display: flex;
      gap: 8px;
    }
    #azul-carousel-wrapper [data-azul="dot"].active {
      width: 36px;
      height: 8px;
      border-radius: 10px;
      background: #026CB6;
    }
    #azul-carousel-wrapper [data-azul="dot"]:not(.active) {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #606060;
      opacity: 0.5;
    }

    .azul-carrousel {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    gap: 8px;
    margin-top: 32px;
    }

    .azul-dots-prev, .azul-dots-next {
    background: none;
    border: none;
    padding: 10px;
    cursor: pointer;
    }

  /* ➜ abaixo, o reset dos botões */
  #azul-carousel-wrapper button[data-azul="prev"],
  #azul-carousel-wrapper button[data-azul="next"] {
    background: transparent;
    border: none;
    padding: 0px;
    cursor: pointer;
  }
  #azul-carousel-wrapper button[data-azul="prev"]:focus,
  #azul-carousel-wrapper button[data-azul="next"]:focus {
    outline: none;
  }
    
`;
  document.head.appendChild(style);

  // 3) Criar container de cards
  const container = document.createElement("div");
  container.className = "azul-cards-container";
  wrapper.appendChild(container);

  // array para armazenar referências aos cards
  const cards = [];

  // 4) Função para criar cada card
  function addCard({ title, airport, priceLabel, price, imgSrc, buttonUrl }) {
    const card = document.createElement("div");
    card.className = "azul-card";

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = title + " view";
    card.appendChild(img);

    const content = document.createElement("div");
    content.className = "azul-card-content";

    const h2 = document.createElement("h2");
    h2.textContent = title;
    content.appendChild(h2);

    const pAirport = document.createElement("p");
    pAirport.className = "azul-airport";
    pAirport.textContent = "Saindo de " + airport;
    content.appendChild(pAirport);

    const priceBlock = document.createElement("div");
    priceBlock.className = "azul-price-block";

    const label = document.createElement("p");
    label.className = "azul-price-label";
    label.textContent = priceLabel;
    priceBlock.appendChild(label);

    const val = document.createElement("p");
    val.className = "azul-price";
    val.textContent = price;
    priceBlock.appendChild(val);

    content.appendChild(priceBlock);
    card.appendChild(content);

    const btn = document.createElement("a");
    btn.className = "azul-btn";
    btn.href = buttonUrl;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.textContent = "Compre agora";
    card.appendChild(btn);

    container.appendChild(card);
    cards.push(card);
  }

  [
    {
      title: "Recife",
      airport: "Rio de Janeiro",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/OW3clMZ.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-rio-de-janeiro-para-recife?utm_ci=vr_RJ_GIG_REC",
    },
    {
      title: "Porto Alegre",
      airport: "Rio de Janeiro",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/7GS1jAy.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-rio-de-janeiro-para-porto-alegre?utm_ci=vr_RJ_GIG_POA",
    },
    {
      title: "Salvador",
      airport: "Rio de Janeiro",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/B5L3xqj.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-rio-de-janeiro-para-salvador?utm_ci=vr_RJ_GIG_SSA",
    },
    {
      title: "Fortaleza",
      airport: "Rio de Janeiro",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/rPg2RvB.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-rio-de-janeiro-para-fortaleza?utm_ci=vr_RJ_GIG_FOR",
    },
    {
      title: "Lisboa",
      airport: "Rio de Janeiro",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/Fbk4is2.jpeg",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-rio-de-janeiro-para-lisboa?utm_ci=vr_RJ_GIG_LIS",
    },
    {
      title: "João Pessoa",
      airport: "Rio de Janeiro",
      priceLabel: "",
      price: "",
      imgSrc: "https://i.imgur.com/vc8p5Li.png",
      buttonUrl:
        "https://passagens.voeazul.com.br/pt/voos-de-rio-de-janeiro-para-joão-pessoa?utm_ci=vr_RJ_GIG_JPA",
    },
  ].forEach(addCard);

  // 6) Adicionar controles do carrossel
  const nav = document.createElement("div");
  nav.className = "azul-carrousel";

  // criar setas com data-attributes
  const btnPrev = document.createElement("button");
  btnPrev.type = "button";
  btnPrev.dataset.azul = "prev";
  btnPrev.innerHTML = `
    <button type="button" class="azul-dots-prev">
      <svg aria-label="Ícone de seta para esquerda" size="32" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ GFrTF">
        <path d="M133.9 527.8C126 518.8 126 505.2 133.9 496.2L364.9 232.2C373.7 222.2 388.8 221.2 398.8 229.9 408.8 238.7 409.8 253.8 401.1 263.8L204.9 488 872 488C885.3 488 896 498.7 896 512 896 525.3 885.3 536 872 536L204.9 536 401.1 760.2C409.8 770.2 408.8 785.3 398.8 794.1 388.8 802.8 373.7 801.8 364.9 791.8L133.9 527.8Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path>
      </svg>
    </button>
    
  `;
  nav.appendChild(btnPrev);

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "azul-dots";
  nav.appendChild(dotsContainer);

  const btnNext = document.createElement("button");
  btnNext.type = "button";
  btnNext.dataset.azul = "next";
  btnNext.innerHTML = `
   
    <button type="button" class="azul-dots-next">
      <svg aria-label="Ícone de seta para direita" size="32" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ GFrTF">
        <path d="M890.1 496.2C898 505.2 898 518.8 890.1 527.8L659.1 791.8C650.3 801.8 635.2 802.8 625.2 794.1 615.2 785.3 614.2 770.2 622.9 760.2L819.1 536 152 536C138.7 536 128 525.3 128 512 128 498.7 138.7 488 152 488L819.1 488 622.9 263.8C614.2 253.8 615.2 238.7 625.2 229.9 635.2 221.2 650.3 222.2 659.1 232.2L890.1 496.2Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path>
      </svg>
    </button>
  `;
  nav.appendChild(btnNext);

  wrapper.appendChild(nav);

  // 7) Lógica de navegação responsiva
  let currentIndex = 0;
  const total = cards.length;
  const gapSize = 24;

  function getStepCount() {
    const cw = container.clientWidth;
    const cardW = cards[0].offsetWidth + gapSize;
    return Math.max(1, Math.floor(cw / cardW));
  }

  function updateDots() {
    Array.from(dotsContainer.children).forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });
  }

  function rebuildCarousel() {
    const step = getStepCount();
    const pages = Math.ceil(total / step);

    // recriar dots
    dotsContainer.innerHTML = "";
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement("div");
      dot.setAttribute("role", "button");
      dot.tabIndex = 0;
      dot.dataset.azul = "dot";
      dot.addEventListener("click", () => {
        currentIndex = i;
        const leftCard = Math.min(i * step, total - step);
        const offset = cards[leftCard].offsetLeft;
        container.scrollTo({ left: offset, behavior: "smooth" });
        updateDots();
      });
      dotsContainer.appendChild(dot);
    }

    // prev/next handlers
    btnPrev.onclick = () => {
      // reduz, mas nunca abaixo de zero
      currentIndex = Math.max(0, currentIndex - 1);
      const leftCard = Math.min(currentIndex * step, total - step);
      if (currentIndex === 0) {
        // força o primeiro card inteirinho
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // páginas intermediárias
        container.scrollTo({
          left: cards[leftCard].offsetLeft,
          behavior: "smooth",
        });
      }
      updateDots();
    };
    btnNext.onclick = () => {
      if (currentIndex < pages - 1) currentIndex++;
      const leftCard = Math.min(currentIndex * step, total - step);
      container.scrollTo({
        left: cards[leftCard].offsetLeft,
        behavior: "smooth",
      });
      updateDots();
    };

    updateDots();
  }

  // inicial + resize
  rebuildCarousel();
  window.addEventListener("resize", () => {
    currentIndex = 0;
    rebuildCarousel();
  });
})();
