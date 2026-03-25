(function () {
  // Criar o elemento de estilo
  const style = document.createElement("style");
  style.textContent = `
      .nespresso-offers-grid * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: NespressoLucas, Arial;
      }
      
      .nespresso-offers-grid {
        padding: 20px;
        background-color: transparent;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .nespresso-offers-header {
        text-align: center;
        margin-bottom: 20px;
        color:#17171A;
        font-size: 24px;
        letter-spacing:4px;
        line-height: 36px;
        font-weight:300;
      }
      
      .nespresso-grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 15px;
        margin: 0 auto;
      }
      
      .nespresso-offer-card {
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        transition: transform 0.2s;
      }
      
      .nespresso-offer-card:hover {
        transform: translateY(-5px);
        cursor:pointer;
      }
      
      .nespresso-offer-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
        position: relative;
      }
      
      .nespresso-gift-icon {
        position: absolute;
        top: 5px;
        left: 5px;
        width: 24px;
        height: 24px;
        background-color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .nespresso-product-image {
        width: 100%;
        height: auto;
      }
      
      .nespresso-offer-title {
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 5px;
        min-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .nespresso-offer-condition {
        font-size: 11px;
        color: #17171A;;
        text-align: center;
        padding: 5px;
        border-radius: 15px;
        width: 100%;
      }

    
        .boldCompolau{
            font-weight:700;
        }
      
      /* Responsive design */
      @media (max-width: 480px) {
        .nespresso-grid-container {
          grid-template-columns: 1fr 1fr;
        }
        
        .nespresso-offer-image {
          width: 80px;
          height: 80px;
        }
        
        .nespresso-offer-title {
          font-size: 11px;
        }
        
        .nespresso-offer-condition {
          font-size: 10px;
        }
      }
      
    `;

  // Adicionar o estilo à página
  document.head.appendChild(style);

  // Dados das ofertas
  const offers = [
    {
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44598853894174/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n3.png?", // Substitua com a URL real da imagem
      title: "1 BISCOITO LEMON + 1 XÍCARA CAPPUCCINO",
      capsules: 150,
    },
    {
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44598854385694/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n4.png?", // Substitua com a URL real da imagem
      title: "1 KIT PARA SERVIR + 1 XÍCARA CAPPUCCINO",
      capsules: 200,
    },
    {
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44598854975518/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n5.png?", // Substitua com a URL real da imagem
      title: "1 PAR DE CANECAS LUME",
      capsules: 250,
    },
    {
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44598854385694/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n4.png?", // Substitua com a URL real da imagem
      title: "1 KIT PARA SERVIR + 1 XÍCARA CAPPUCCINO",
      capsules: 200,
    },
    {
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44598854975518/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n5.png?", // Substitua com a URL real da imagem
      title: "1 PAR DE CANECAS LUME",
      capsules: 250,
    },
  ];

  // Criar o HTML da grid de ofertas
  const offersContainer = document.createElement("div");
  offersContainer.className = "nespresso-offers-grid";

  // Adicionar o título
  const header = document.createElement("div");
  header.className = "nespresso-offers-header";
  header.textContent = "PRESENTES ESPECIAIS PARA O DIA DAS MÃES";
  offersContainer.appendChild(header);

  // Criar o grid container
  const gridContainer = document.createElement("div");
  gridContainer.className = "nespresso-grid-container";

  // Adicionar os cards de ofertas
  offers.forEach((offer, index) => {
    const card = document.createElement("div");
    card.className = "nespresso-offer-card";

    // Estrutura interna do card
    card.innerHTML = `
        <div class="nespresso-offer-image">
          <img src="${offer.image}" alt="${offer.title}" class="nespresso-product-image" onerror="this.src='https://via.placeholder.com/80'"/>
        </div>
        <div class="nespresso-offer-title">GANHE ${offer.title}</div>
        <div class="nespresso-offer-condition">Na compra de <span class="boldCompolau">${offer.capsules} cápsulas</span> de café</div>
      `;

    gridContainer.appendChild(card);
  });

  offersContainer.appendChild(gridContainer);

  // Determinar onde inserir o container na página
  // Você pode modificar isso para inserir onde quiser
  const targetElement =
    document.querySelector("#block-8830310864373") || document.body;

  // Inserir o container na página
  targetElement.insertAdjacentElement("afterend", offersContainer);
})();
