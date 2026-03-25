(function () {
  if (window.accordionPais || window.innerWidth > 600) {
    return;
  }
  window.accordionPais = "true";

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
          "https://www.nespresso.com/ecom/medias/sys_master/public/45491193413662/Acorde-o-N1-OL.png?attachment=true&cimgnr=X9SFK",
        titulo: "Ganhe 10 cafés Cape Town Lungo",
        alt: "10 cafés Cape Town Lungo",
      },
      {
        quantidadeCafes: 100,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45491193544734/Acorde-o-N2-OL.png?attachment=true&cimgnr=NSPh3",
        titulo: "Ganhe 1 Caneca Vertuo Pequena",
        alt: "Caneca Vertuo Pequena",
      },
      {
        quantidadeCafes: 150,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45655406608414/Acorde-o-N3-OL-1.png?attachment=true&cimgnr=adQ4i",
        titulo: "Ganhe 1 Par de Canecas Vertuo Pequenas",
        alt: "1 Par de Canecas Vertuo Pequenas",
        flag: "ESGOTADO",
      },
      {
        quantidadeCafes: 200,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45491192823838/Acorde-o-N4.png?attachment=true&cimgnr=C0fw8",
        titulo: "Ganhe 1 Caneca Térmica Média",
        alt: "1 Caneca Térmica Média",
      },
      {
        quantidadeCafes: 250,
        imagem:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45491192987678/Acorde-o-N5.png?attachment=true&cimgnr=RLCY5",
        titulo: "Ganhe 1 Caneca Térmica Grande",
        alt: "1 Caneca Térmica Grande",
      },
    ],

    // Configurações do modal de termos
    modal: {
      titulo: "Termos e Condições",
      conteudo: `
        <strong>TERMOS E CONDIÇÕES</strong><br>
        <strong>OFERTA DIA DOS PAIS – 28.07.2025 à 11.08.2025</strong><br>
        <br>
        *Oferta exclusiva e válida por tempo limitado de 28/07/2025 a 11/08/2025, sujeita a alterações sem aviso prévio. Compre a partir de 150 cápsulas (i) da linha Original Nespresso, ou (ii) de uma combinação das linhas Original e Vertuo Nespresso em um mesmo pedido, e ganhe uma Caneca Térmica Pequena Sage Green Nespresso ou, compre a partir de 200 cápsulas (i) da linha Original Nespresso, ou (ii) de uma combinação das linhas Original e Vertuo Nespresso em um mesmo pedido, e ganhe uma Caneca Térmica Média Vanilla Ice Nespresso ou, compre a partir de 250 cápsulas (i) da linha Original Nespresso, ou (ii) de uma combinação das linhas Original e Vertuo Nespresso em um mesmo pedido, e ganhe uma Caneca Térmica Grande Grey Smokey Blue Nespresso.
Essa oferta é intransferível e não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitada a um uso por CPF de registro na Nespresso.
Ao finalizar seu pedido, confirme se o presente está disponível em seu carrinho. Imagens meramente ilustrativas.
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
      <div class="offer-item ` +
          (oferta.flag ? "hasFlagEsgotado" : "") +
          `">
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
          (oferta.flag
            ? `<div class="flagEsgotadoAcordeao">` + oferta.flag + `</div>`
            : "") +
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
        background-color: #6F737F;
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
        background-color: #f6f6f6;
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
      .hasFlagEsgotado{
        background-color:#DFDFDF;
      }
      .hasFlagEsgotado .offer-text, .hasFlagEsgotado .offer-image{
        opacity:0.8;
        }
      .flagEsgotadoAcordeao{
        padding:4px;
        background-color:#D13737;
        border-radius: 0px 20px 20px;
        font-weight: 600;
        position:absolute;
        top:30px;
        right:20px;
        color:#FFF;
      }
      @media (max-width: 480px) {
        .modal-container {
          width: 95%;
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
