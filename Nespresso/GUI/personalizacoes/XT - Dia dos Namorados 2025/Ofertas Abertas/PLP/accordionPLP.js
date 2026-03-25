(function () {
  if (window.accordionDiaDosNamorados || window.innerWidth > 600) {
    return;
  }
  window.accordionDiaDosNamorados = "true";
  function sendGAEvent(local_event_label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "user engagement", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: local_event_label, //free to fill field, please use lower case
    });
  }
  function createComponent() {
    const accordionContainer = document.createElement("div");
    accordionContainer.className = "nespresso-accordion";

    accordionContainer.innerHTML = `
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
                              <h2>SURPRESA PARA VOCÊ <span class="new-badge">EXCLUSIVO</span></h2>
                              <p class="subtitle">Clique aqui e descubra nossas ofertas exclusivas para você</p>
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
                          <div class="offer-item">
                              <div class="offer-image">
                                  <img src="https://www.nespresso.com/ecom/medias/sys_master/public/45000261697566/Arte-LP-400x400-N3.jpg?attachment=true&cimgnr=a3Qj2" alt="1 Chocolate ao Leite + 1 Pixie Stockholm">
                              </div>
                              <div class="offer-text">
                                  <h3>Ganhe 1 Chocolate ao Leite + 1 Pixie Stockholm</h3>
                                  <p>Na compra de <span class="boldCoffesTexts">150 cafés</span></p>
                              </div>
                          </div>
                          <div class="offer-item">
                              <div class="offer-image">
                                  <img src="https://www.nespresso.com/ecom/medias/sys_master/public/45000262156318/Arte-LP-400x400-N4.jpg?attachment=true&cimgnr=Okm3F" alt="1 Pixie Espresso Paris + 1 Pixie Espresso Istanbul">
                              </div>
                              <div class="offer-text">
                                  <h3>Ganhe 1 Pixie Espresso Paris + 1 Pixie Espresso Istanbul</h3>
                                  <p>Na compra de <span class="boldCoffesTexts">200 cafés</span></p>
                              </div>
                          </div>
                          <div class="offer-item">
                              <div class="offer-image">
                                  <img src="https://www.nespresso.com/ecom/medias/sys_master/public/45000262549534/Arte-LP-400x400-N5.jpg?attachment=true&cimgnr=8yCB2" alt="1 Par de Taças para Drinks">
                              </div>
                              <div class="offer-text">
                                  <h3>Ganhe 1 Par de Taças para Drinks</h3>
                                  <p>Na compra de <span class="boldCoffesTexts">250 cafés</span></p>
                              </div>
                          </div>
                          <div class="offer-item" style="position:relative;">
                              <div class="offer-image">
                                  <img src="https://www.nespresso.com/ecom/medias/sys_master/public/45071273132062/Arte-LP-400x400-N6-sem-selo.jpg" alt="2 Xícaras Pixie Lungo">
                              </div>
                              <div class="offer-text">
                                  <span style="color: #c46859;">OFERTA SURPRESA</span>
                                  <h3>Ganhe 1 Pixie Lungo Xangai <br>+ 1 Pixie Lungo Vienna</h3>
                                  <p>Na compra de <span class="boldCoffesTexts">270 cafés</span></p>
                              </div>
                              <img src="https://www.nespresso.com/ecom/medias/sys_master/public/45071274016798/Somente-Selo.png" style="width: 200px;position: absolute;top: -40px;right: 30px;" class="offer-image-only-site">
                          </div>
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

    // Estrutura HTML do modal
    modalElement.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-container">
          <div class="modal-header">
            <h3>Termos e Condições</h3>
            <button class="close-modal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <div class="modalTermosECondicoesCampanhaMaes">
              <strong>TERMOS E CONDIÇÕES</strong><br>
              <strong>OFERTA DIA DOS NAMORADOS – 03.06.2025 à 16.06.2025</strong><br>
              <br>
              Oferta válida de 03/06/2025 a 16/06/2025, sujeita a alterações sem aviso prévio. Compre a partir de 150 cápsulas Original Line ou Vertuo Line Nespresso e ganhe 1 xícara Pixie Lungo Stockholm Nespresso e 1 caixa de Chocolate ao Leite Nespresso; Na compra a partir de 200 cápsulas Original Line ou Vertuo Line Nespresso ganhe 1 xícara Pixie Espresso Paris Nespresso + 1 xícara Pixie Espresso Istanbul Nespresso; Na compra a partir de 250 cápsulas Original Line ou Vertuo Line Nespresso ganhe 1 Par de Taças para Drinks Nespresso. A oferta é única, intransferível e não cumulativa com outras ofertas em andamento, válida para pessoas físicas e limitada a um uso por CPF de registro na Nespresso. Imagens meramente ilustrativas.
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
                  background-color: #D4B5AD;
                  position: relative;
                  transition: all 0.3s ease;
                  overflow: hidden; /* Importante para o efeito de brilho */
              }
              
              /* Badge com animação */
              .nespresso-accordion .new-badge {
                  display: inline-block;
                  background-color: #b67261;
                  color: white;
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
              
              /* Animação do ícone do presente */
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
              }
              
              /* Animação sutil de "clique aqui" na subtitle */
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
              
              /* Remover animações quando o accordion estiver aberto */
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
                  background-color: #faf2f0;
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
              
              /* Estilos do Modal */
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

    const targetElement = document.querySelector("nb-plp-coffee-xf-cards");
    if (targetElement) {
      targetElement.insertAdjacentElement("beforebegin", accordionContainer);
    } else {
      document.body.appendChild(accordionContainer);
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
