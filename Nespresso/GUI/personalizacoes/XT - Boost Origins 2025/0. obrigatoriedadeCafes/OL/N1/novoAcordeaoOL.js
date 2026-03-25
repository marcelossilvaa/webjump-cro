(function () {
  if (window.accordionBoostOrigins || window.innerWidth > 600) {
    return;
  }
  window.accordionBoostOrigins = "true";

  // ===== CONFIGURAÇÃO DA CAMPANHA =====
  const CAMPANHA_CONFIG = {
    // Configurações do cabeçalho
    titulo: "SURPRESA PARA VOCÊ",
    badge: "EXCLUSIVO",
    subtitulo: "Clique aqui e descubra nossas ofertas exclusivas para você",

    // Configurações dos níveis de oferta
    ofertas: [
      {
        quantidadeCafes: 70,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45728373309470/Acorde-o-OL-N1.png?attachment=true&cimgnr=fRml2",
        titulo: "Ganhe 10 cafés Brazil Organic",
        alt: "10 cafés Brazil Organic",
      },
      {
        quantidadeCafes: 100,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45728373604382/Acorde-o-OL-N2.png?attachment=true&cimgnr=pH4Yj",
        titulo: "Ganhe 1 Caixa de Biscoito Cookies",
        alt: "1 Caixa de Biscoito Cookies",
      },
      {
        quantidadeCafes: 150,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45728373833758/Acorde-o-OL-N3.png?attachment=true&cimgnr=w1e4J",
        titulo: "Ganhe 1 Par de Xícaras Origin Espresso",
        alt: "1 Par de Xícaras Origin Espresso",
      },
      {
        quantidadeCafes: 200,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45728373964830/Acorde-o-OL-N4.png?attachment=true&cimgnr=Klvah",
        titulo: "Ganhe 1 Par de Xícaras Origin Lungo",
        alt: "1 Par de Xícaras Origin Lungo",
      },
      {
        quantidadeCafes: 250,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45728374095902/Acorde-o-OL-N5.png?attachment=true&cimgnr=oP7rO",
        titulo: "Ganhe 1 Par de Xícaras Origin Gran Lungo",
        alt: "1 Par de Xícaras Origin Gran Lungo",
      },
    ],

    // Configurações do modal de termos
    modal: {
      titulo: "Termos e Condições",
      conteudo: `
        <strong>TERMOS E CONDIÇÕES</strong><br>
        <strong>BOOST PRECIOUS ORIGINS – 18/08/2025 a 08/09/2025</strong><br>
        <br>
       As ofertas referentes ao Boost Precious Origins Nespresso, especificadas nos 
       itens abaixo, são válidas de 18/08/2025 a 08/09/2025, apenas para pessoas físicas portadoras de CPF e clientes classificados na categoria B2C Offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha doméstica), não se aplicando para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitadas a um uso por CPF de registro na Nespresso. Todos os produtos estão sujeitos à disponibilidade de estoque e as ofertas estão sujeitas alterações sem aviso prévio. As ofertas estarão disponíveis no período mencionado nos canais de compra oficiais da marca: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android. Todos os pedidos realizados durante o período da Campanha de Boost Precious Origins, de 18/08/2025 a 08/09/2025, poderão ser parcelados em até 10x sem juros, desde que contenham parcelas mínimas de R$100,00 (cem reais) e terão entrega gratuita (frete grátis) para o modo de entrega padrão ou ‘standard’, para compras com no mínimo 70 cápsulas. Verifique o prazo de entrega para sua localidade ao escolher o modo de entrega antes da finalização de seu pedido. O modo de entrega Boutique Clique & Retire (retirada em loja em todas as Boutiques Nespresso), será válido na compra de cápsulas, máquinas e acessórios. O prazo para retirada é de 1 (um) dia, ou seja, no dia seguinte da compra, de acordo com a disponibilidade de estoque da Boutique Nespresso selecionada. A Nespresso se reserva o direito, a seu critério exclusivo, de desqualificar qualquer indivíduo que interferir com o funcionamento das ofertas, seja ao criar várias contas, utilizar várias identidades ou agir de qualquer outra forma que seja considerada pela Nespresso como uma violação dos Termos e Condições, ou de alguma outra forma prejudicial. Se você tiver consentido, no momento do cadastro, com o uso dos seus dados de contato e interações para receber comunicações de marketing da Nespresso, saiba que seu consentimento para este fim é voluntário e você é livre para retirá-lo a qualquer momento. Mais informações disponíveis na Política de Privacidade da Nespresso. Em caso de dúvidas ou necessidade de informações adicionais, entre em contato com um de nossos Especialistas de Café pelo telefone gratuito 0800 7777 737 (segunda a sábado, das 6h às 22h). 
<br><br><strong>Para pedidos que contenham cápsulas exclusivamente da linha Original ou que incluam, de forma combinada, cápsulas das linhas Original e Vertuo:</strong>
<br><br>a. Na compra de 70 a 99 cápsulas, durante o período supramencionado, o consumidor ganhará um sleeve Brazil Organic Nespresso, concedido apenas em pedidos que (i) contenham cápsulas exclusivamente da linha Original ou, (ii) que contenham, de forma combinada, cápsulas das linhas Original e Vertuo dentro de um mesmo pedido. Essa oferta estará disponível para todos os canais oficiais Nespresso: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android. <br>b. Na compra de 100 a 149 cápsulas, sendo no mínimo 10 cápsulas da linha Master Origins, durante o período supramencionado, o consumidor ganhará um biscoito Cookies Nespresso, concedido apenas em pedidos que (i) contenham cápsulas exclusivamente da linha Original ou, (ii) que contenham, de forma combinada, cápsulas das linhas Original e Vertuo dentro de um mesmo pedido. Essa oferta estará disponível para todos os canais oficiais Nespresso: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android. <br>c. Na compra de 150 a 199 cápsulas, sendo no mínimo 10 cápsulas da linha Master Origins, durante o período supramencionado, o consumidor ganhará um par de xícaras Origin Espresso Nespresso, concedido apenas em pedidos que (i) contenham cápsulas exclusivamente da linha Original ou, (ii) que contenham, de forma combinada, cápsulas das linhas Original e Vertuo dentro de um mesmo pedido. Essa oferta estará disponível para todos os canais oficiais Nespresso: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android. <br>d. Na compra de 200 a 249 cápsulas, 
sendo no mínimo 10 cápsulas da linha Master Origins, durante o período supramencionado, o consumidor ganhará um par de xícaras Origin Lungo Nespresso, concedido apenas em pedidos que (i) contenham cápsulas exclusivamente da linha Original ou, (ii) que contenham, de forma combinada, cápsulas das linhas Original e Vertuo dentro de um mesmo pedido. Essa oferta estará disponível para todos os canais oficiais Nespresso: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578- 4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android. <br>e. Na compra a partir de 250 cápsulas, sendo no mínimo 10 cápsulas da linha Master Origins, durante o período supramencionado, o consumidor ganhará um par de xícaras Origin Gran Lungo Nespresso, concedido apenas em pedidos que (i) contenham cápsulas exclusivamente da linha Original ou, (ii) que contenham, de forma combinada, cápsulas das linhas Original e Vertuo dentro de um mesmo pedido. Essa oferta estará disponível para todos os canais oficiais Nespresso: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578- 4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android.
      `,
    },
  };
  // ===== FIM DA CONFIGURAÇÃO =====

  function sendGAEvent(local_event_label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: local_event_label,
    });
  }

  function gerarOfertasHTML() {
    return CAMPANHA_CONFIG.ofertas
      .map(
        (oferta) =>
          `
      <div class="offer-item">
        <div class="offer-image">
          <img src="` +
          oferta.imagem +
          `" alt="` +
          oferta.alt +
          `">
        </div>
        <div class="offer-text">
          <h3>` +
          oferta.titulo +
          `</h3>
          <p>Na compra de <span class="boldCoffesTexts">` +
          oferta.quantidadeCafes +
          ` cafés</span></p>
        </div>
      </div>
    `
      )
      .join("");
  }

  function createComponent() {
    const accordionContainer = document.createElement("div");
    accordionContainer.className = "nespresso-accordion";

    accordionContainer.innerHTML =
      `
      <div class="accordion">
        <div class="accordion-header">
          <div class="accordion-title">
            <div class="gift-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 12v10H4V12"></path>
                <path d="M2 7h20v5H2z"></path>
                <path d="M12 22V7"></path>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
            </div>
            <div class="title-text">
              <h2>` +
      CAMPANHA_CONFIG.titulo +
      ` <span class="new-badge">` +
      CAMPANHA_CONFIG.badge +
      `</span></h2>
              <p class="subtitle">` +
      CAMPANHA_CONFIG.subtitulo +
      `</p>
            </div>
          </div>
          <div class="arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            ` +
      gerarOfertasHTML() +
      `
      <p class="textConditions"style="">*Obrigatório mínimo de 10 cafés Master Origins </p>
            <a class="linkCondicoesOfertaMaes" id="verCondicoesLink">*Veja condições</a>
          </div>
        </div>
      </div>
    `;

    // Criação do elemento do modal
    const modalElement = document.createElement("div");
    modalElement.className = "nespresso-modal";
    modalElement.id = "modal-promocao-popup";
    modalElement.style.display = "none";

    modalElement.innerHTML =
      `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>` +
      CAMPANHA_CONFIG.modal.titulo +
      `</h3>
          <button class="close-modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="modalTermosECondicoesCampanhaMaes">
            ` +
      CAMPANHA_CONFIG.modal.conteudo +
      `
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalElement);

    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .nespresso-accordion * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: NespressoLucas,Helvetica,Arial,sans-serif;
        color: #17171A;
      }
      
      .nespresso-accordion .accordion {
        max-width: 600px;
        margin: 0 auto;
        border-bottom: 1px solid #e5e5e5;
      }
      
      .nespresso-accordion .boldCoffesTexts{
        font-weight:700;
      }
      
      .nespresso-accordion .accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px;
        cursor: pointer;
        background-color: #6C6B3F;
        position: relative;
        transition: all 0.3s ease;
        overflow: hidden;
      }
      
      .nespresso-accordion .new-badge {
        display: inline-block;
        background-color: #fff;
        color:#17171A;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 60px;
        margin-left: 8px;
        position: relative;
        top: -2px;
        animation: bounce 1s ease infinite alternate;
      }
      
      @keyframes bounce {
        from {
          transform: scale(1);
        }
        to {
          transform: scale(1.1);
        }
      }
      
      .nespresso-accordion .gift-icon {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #3C8552;
        animation: wiggle 2.5s ease infinite;
        transform-origin: center;
      }
      
      @keyframes wiggle {
        0%, 100% {
          transform: rotate(0);
        }
        92% {
          transform: rotate(0);
        }
        94% {
          transform: rotate(5deg);
        }
        96% {
          transform: rotate(-5deg);
        }
        98% {
          transform: rotate(3deg);
        }
      }
      
      .nespresso-accordion .gift-icon svg {
        width: 20px;
        height: 20px;
        stroke:#FFF;
      }
      
      .nespresso-accordion .textConditions{
        text-align: center;
        font-weight: 600;
      }
      .nespresso-accordion .subtitle {
        font-size: 12px;
        margin-top: 3px;
        position: relative;
        color:#FFF;
      }
      
      @keyframes fadeInOut {
        0%, 100% {
          opacity: 0.7;
        }
        50% {
          opacity: 1;
        }
      }
      
      .nespresso-accordion .accordion-header.active .gift-icon,
      .nespresso-accordion .accordion-header.active .new-badge {
        animation: none;
      }
      
      .nespresso-accordion .accordion-title {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .nespresso-accordion .title-text h2 {
        font-size: 16px;
        font-weight: 700;
        color: #FFF;
      }
      
      .nespresso-accordion .arrow {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease;
      }
      
      .nespresso-accordion .arrow.active {
        transform: rotate(180deg);
      }
      
      .nespresso-accordion .accordion-content {
        height: 0;
        overflow: hidden;
        transition: height 0.3s ease;
        background-color: #f0f0ec;
      }
      
      .nespresso-accordion .accordion-body {
        padding: 0;
      }
      
      .nespresso-accordion .offer-item {
        display: flex;
        padding: 15px;
        border-top: 1px solid #8d8d8d;
        align-items: center;
      }
      
      .nespresso-accordion .offer-image {
        width: 50px;
        height: 50px;
        margin-right: 15px;
        border-radius: 5px;
        overflow: hidden;
      }
      
      .nespresso-accordion .offer-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius:600px;
      }
      
      .nespresso-accordion .offer-text h3 {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
        line-height: 1.3;
      }
      
      .nespresso-accordion .offer-text p {
        font-size: 13px;
        color: #666;
        line-height: 1.2;
      }
      
      .nespresso-accordion .linkCondicoesOfertaMaes{
        font-size:12px;
        text-align:center;
        display:block;
        text-decoration: underline;
        color:#2e2e34;
        padding-bottom: 15px;
        cursor: pointer;
      }
      
      @media (max-width: 480px) {
        .nespresso-accordion .offer-text h3 {
          font-size: 14px;
        }
        
        .nespresso-accordion .offer-text p {
          font-size: 12px;
        }
      }
      
      .nespresso-modal *{
        font-family: NespressoLucas,Helvetica,Arial,sans-serif;
      }
      
      .nespresso-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        display: none;
      }
      
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        cursor: pointer;
      }
      
      .modal-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        border-radius: 4px;
        max-width: 90%;
        width: 550px;
        max-height: 90vh;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
        border-bottom: 1px solid #e5e5e5;
      }
      
      .modal-header h3 {
        font-size: 18px;
        margin: 0;
        color: #17171A;
      }
      
      .close-modal {
        border: none;
        background: none;
        cursor: pointer;
        width: 24px;
        height: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .close-modal svg {
        width: 18px;
        height: 18px;
        color: #666;
      }
      
      .modal-content {
        padding: 20px;
        overflow-y: auto;
        max-height: calc(90vh - 60px);
        line-height: 1.5;
      }
      
      .modalTermosECondicoesCampanhaMaes {
        font-size: 14px;
        color: #333;
      }
      
      @media (max-width: 480px) {
        .modal-container {
          width: 85%;
          top:65%;
        }
      }
      @media (max-width: 599px) {
        nb-informative-stripe{
          display:none;
          }
      }
      @media screen and (min-width: 600px) {
        .nespresso-accordion{
          display:none;
        }
      }
    `;

    document.head.appendChild(styleElement);

    let targetElement = document.querySelector("nb-informative-stripe");
    if (targetElement) {
      targetElement.insertAdjacentElement("afterend", accordionContainer);
    } else {
      setTimeout(function () {
        targetElement = document.querySelector("nb-informative-stripe");
        if (targetElement) {
          targetElement.insertAdjacentElement("afterend", accordionContainer);
        }
      }, 1500);
    }

    const accordionHeader =
      accordionContainer.querySelector(".accordion-header");
    const accordionContent =
      accordionContainer.querySelector(".accordion-content");
    const arrow = accordionContainer.querySelector(".arrow");
    let isOpen = false;

    function toggleAccordion() {
      isOpen = !isOpen;

      if (isOpen) {
        const contentHeight = accordionContent.scrollHeight;
        accordionContent.style.height = contentHeight + "px";
        arrow.classList.add("active");
        accordionHeader.classList.add("active");
        accordionContainer.querySelector(".subtitle").style.display = "none";
        sendGAEvent("abriu_accordion");
      } else {
        accordionContent.style.height = "0";
        arrow.classList.remove("active");
        accordionHeader.classList.remove("active");
        accordionContainer.querySelector(".subtitle").style.display = "block";
        sendGAEvent("fechou_accordion");
      }
    }

    accordionHeader.addEventListener("click", toggleAccordion);

    const modal = document.getElementById("modal-promocao-popup");
    const verCondicoesLink = document.getElementById("verCondicoesLink");
    const closeModalBtn = modal.querySelector(".close-modal");
    const modalOverlay = modal.querySelector(".modal-overlay");

    function openModal() {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    verCondicoesLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });

    closeModalBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", closeModal);
  }

  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", createComponent);
  } else {
    createComponent();
  }
})();
