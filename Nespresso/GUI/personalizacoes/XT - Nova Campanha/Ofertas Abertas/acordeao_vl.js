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
        quantidadeCafes: 120,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45977930629150/Acorde-o-VL-N3.png?attachment=true&cimgnr=a4L8T",
        titulo: "Ganhe 1 Porta-Cápsulas Bonbonnière",
        alt: "1 Porta Cápsula Bonbonnière",
      },
      {
        quantidadeCafes: 180,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45977930760222/Acorde-o-VL-N4.png?attachment=true&cimgnr=UOyTC",
        titulo: "Ganhe 1 Par de Xícaras Vertuo Double Espresso",
        alt: "1 Par de Xícaras Vertuo Double Espresso",
      },
    ],

    // Configurações do modal de termos
    modal: {
      titulo: "Termos e Condições",
      conteudo: `
        <strong>TERMOS E CONDIÇÕES</strong><br>
        <strong>DIA DO CLIENTE – 09/09/2025 a 15/09/2025</strong><br>
        <br>
      Oferta exclusiva e válida por tempo limitado de 09/09/2025 às 09h até 15/09/2025, sujeita a alterações sem aviso prévio. 
<br><br><strong>Para pedidos que contenham exclusivamente cápsulas da linha Vertuo: </strong>
<br><br>c. Compre a partir de 120 cápsulas Vertuo Line Nespresso e ganhe um Porta-Cápsulas Bonbonnière Nespresso.<br>d. Compre a partir de 180 cápsulas Vertuo Line Nespresso e ganhe um par de Xícaras Vertuo Double Espresso Nespresso.<br><br>
O pedido deve conter apenas cápsulas da linha Vertuo. Essa oferta é intransferível e não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitada a um uso por CPF de registro na Nespresso.

Os brindes oferecidos nesta ação poderão, a critério da Promotora, ser substituídos por outros de valor equivalente ou superior, caso haja indisponibilidade de estoque de algum item. A alteração será informada nas peças de comunicação da promoção, sem prejuízo aos participantes que atenderem aos requisitos da promoção até a data da substituição.

Ao finalizar seu pedido, confirme se o presente está disponível em seu carrinho. Faça seu pedido através do site https://www.nespresso.com/br, aplicativo Nespresso, telefone 0800 7777 737 (ligações gratuitas – segunda a sábado, das 6h às 22h), WhatsApp (11) 95578-4670 ou nas Boutiques Nespresso. Confira os termos e condições referentes a esta oferta em www.nespresso.com/br/pt/termos-condicoes.
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
        ` +
          (oferta.flag ? "<div class='flagOferta'>Oferta Surpresa</div>" : "") +
          `
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
        background-color: #C7B27E;
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
        background-color: #F3EEE6;
      }
      
      .nespresso-accordion .accordion-body {
        padding: 0;
      }
      
      .nespresso-accordion .offer-item {
        display: flex;
        padding: 15px;
        border-top: 1px solid #8d8d8d;
        align-items: center;
        position:relative;
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
      .nespresso-accordion .flagOferta{
        position: absolute;
        right: 30px;
        background-color: #B4935A;
        color: #FFF;
        font-size: 13px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: 5px;
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
