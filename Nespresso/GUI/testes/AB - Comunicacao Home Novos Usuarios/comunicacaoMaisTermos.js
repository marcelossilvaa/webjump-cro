(function () {
  if (window.novaComunicacaoParaNovosUsuarios) {
    return;
  }
  window.novaComunicacaoParaNovosUsuarios = "true";
  gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });

  // ========== CONFIGURAÇÕES ==========
  const CONFIG = {
    titulo: "OFERTA DE BOAS-VINDAS",
    subtitulo:
      "Comece sua jornada no mundo dos cafés com uma Oferta especial <span class='strongOfferNewUsers'>Nespresso</span>. Na compra de 70 cápsulas, ganhe <span class='strongOfferNewUsers'>+10 cafés de presente e Frete Grátis</span> por nossa conta!",
    elementoAlvo: "#block-8830310864373", // Elemento após o qual inserir o componente
    imagemCafes:
      "https://www.nespresso.com/ecom/medias/sys_master/public/44611284041758/Bloco-quiz-nespresso-1150x500.jpg",
    altImagem: "Diferentes tipos de café da Nespresso",
    // Configuração dos CTAs
    ctas: [
      {
        texto: "FAÇA LOGIN E COMPRE AGORA",
        link: "https://www.nespresso.com/br/pt/secure/login?destination-redirect=%2Fbr%2Fpt%2Forder%2Fcapsules%2Foriginal&status=bruteForce",
        estiloPrimario: true, // CTA principal
        tracking: "cta_faca_login_e_compre_agora",
      },
      {
        texto: "CONHEÇA NOSSOS CAFÉS",
        link: "https://www.nespresso.com/br/pt/order/capsules/original",
        estiloPrimario: false, // CTA secundário
        tracking: "cta_conheca_nossos_cafes",
      },
    ],
  };

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "user engagement", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  function criarModal() {
    // Verifica se o modal já existe
    if (
      document.getElementById("nespresso-welcome-offer-modal-termos-condicoes")
    ) {
      return;
    }

    const modalElement = document.createElement("div");
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.id = "nespresso-welcome-offer-modal-termos-condicoes";
    modalElement.style.display = "none";

    // Estrutura HTML do modal
    modalElement.innerHTML = `
        <div class="nespresso-welcome-offer-modal-overlay"></div>
        <div class="nespresso-welcome-offer-modal-container">
          <div class="nespresso-welcome-offer-modal-header">
            <h3>Termos e Condições</h3>
            <button class="nespresso-welcome-offer-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="nespresso-welcome-offer-modal-content">
            <div class="nespresso-welcome-offer-modal-termos">
              <strong>TERMOS E CONDIÇÕES</strong><br>
              <strong>OFERTA DE BOAS-VINDAS NESPRESSO</strong><br>
              <br>
              Oferta válida para novos membros Nespresso. Na compra de 70 cápsulas, ganhe +10 cafés de presente e Frete Grátis. Oferta sujeita a alterações sem aviso prévio. A oferta é única, intransferível e não cumulativa com outras ofertas em andamento, válida para pessoas físicas e limitada a um uso por CPF de registro na Nespresso. Imagens meramente ilustrativas. Para mais informações sobre a oferta, entre em contato com nosso atendimento.
            </div>
          </div>
        </div>
      `;

    document.body.appendChild(modalElement);
    return modalElement;
  }

  function configurarEventosModal() {
    const modal = document.getElementById(
      "nespresso-welcome-offer-modal-termos-condicoes"
    );
    const verCondicoesLink = document.getElementById(
      "nespresso-welcome-offer-ver-condicoes-link"
    );

    if (!modal || !verCondicoesLink) {
      console.warn(
        "Modal ou link de condições da oferta de boas-vindas não encontrado"
      );
      return;
    }

    const closeModalBtn = modal.querySelector(
      ".nespresso-welcome-offer-modal-close"
    );
    const modalOverlay = modal.querySelector(
      ".nespresso-welcome-offer-modal-overlay"
    );

    function openModal(e) {
      e.preventDefault();
      modal.style.display = "block";
      document.body.style.overflow = "hidden";

      // Enviar evento de tracking
      sendGAEvent("ver_condicoes_oferta_boas_vindas");
    }

    function closeModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    // Remove event listeners existentes para evitar duplicação
    const newVerCondicoesLink = verCondicoesLink.cloneNode(true);
    verCondicoesLink.parentNode.replaceChild(
      newVerCondicoesLink,
      verCondicoesLink
    );

    // Adiciona os event listeners
    newVerCondicoesLink.addEventListener("click", openModal);

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", closeModal);
    }

    // Fechar modal com ESC - usando namespace específico
    document.addEventListener(
      "keydown",
      function nespressoWelcomeOfferModalKeyHandler(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
          closeModal();
        }
      }
    );
  }

  function criarComunicacao() {
    // Verifica se o elemento alvo existe
    const targetElement = document.querySelector(CONFIG.elementoAlvo);
    if (!targetElement) {
      setTimeout(criarComunicacao, 2000);
      return;
    }

    // Verifica se o componente já foi criado
    if (document.getElementById("nespresso-welcome-offer")) {
      return;
    }

    // Cria o HTML dos CTAs
    let ctasHTML = "";
    for (let i = 0; i < CONFIG.ctas.length; i++) {
      const cta = CONFIG.ctas[i];
      const classeEstilo = cta.estiloPrimario ? "cta-primary" : "cta-secondary";
      ctasHTML +=
        `<a href="` +
        cta.link +
        `" class="cta-btn ` +
        classeEstilo +
        `" id="` +
        cta.tracking +
        `">
                  ` +
        cta.texto +
        `
                  <span class="cta-arrow">→</span>
                </a>`;
    }

    // Cria o HTML do componente
    const componenteHTML =
      `
      <section id="nespresso-welcome-offer">
        <div class="offer-container">
          
          <!-- Imagem dos cafés -->
          <div class="offer-image">
            <img 
              src="` +
      CONFIG.imagemCafes +
      `" 
              alt="` +
      CONFIG.altImagem +
      `"
            />
          </div>

          <!-- Conteúdo de texto -->
          <div class="offer-content">
            
            <h2 class="offer-title">` +
      CONFIG.titulo +
      `</h2>
            
            <p class="offer-text">` +
      CONFIG.subtitulo +
      `<br><span class="condicoesOferta">*Oferta válida apenas para novos membros. <a href="#" class="linkCondicoesOfertaMaes" id="nespresso-welcome-offer-ver-condicoes-link">Consulte condições.</a></span></p>
            
            <!-- Container dos CTAs -->
            <div class="cta-container">
              ` +
      ctasHTML +
      `
            </div>
          </div>
        </div>
      </section>
    `;

    // Adiciona o CSS
    const cssStyles = `
      <style>
      
        #nespresso-welcome-offer {
          width: 100%;
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
          box-sizing: border-box;
        }

        #nespresso-welcome-offer .offer-container {
          display: flex;
          align-items: center;
          border-radius: 16px;
          gap:32px;
          overflow: hidden;
          border: 1px solid #e7e7e7;
          background-color:#fff;
        }

        #nespresso-welcome-offer .offer-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        #nespresso-welcome-offer .offer-image img {
          max-width: 100%;
          height: auto;
          border-radius: 8px 0px 0px 8px;
        }

        #nespresso-welcome-offer .offer-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        #nespresso-welcome-offer .offer-title {
          font-family: "NespressoLucas",Helvetica,Arial,sans-serif;
          font-size: 28px;
          font-weight: bold;
          color: #17171A;
          margin: 0 0 16px 0;
          line-height: 1.2;
          letter-spacing: 1px;
        }

        #nespresso-welcome-offer .offer-text {
          font-family: "NespressoLucas",Helvetica,Arial,sans-serif;
          font-size: 16px;
          color: #17171A;
          margin: 0 0 10px 0;
          line-height: 1.5;
          max-width: 400px;
        }

        #nespresso-welcome-offer .cta-container {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom:8px;
        }

        #nespresso-welcome-offer .cta-btn {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          padding: 16px;
          border-radius: 50px;
          font-family: "NespressoLucas",Helvetica,Arial,sans-serif;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          justify-content: center;
          min-width: 180px;
        }

        #nespresso-welcome-offer .cta-primary {
          background: #17171A;
          color: white;
        }

        #nespresso-welcome-offer .cta-secondary {
          background: #fff;
          color: #17171A;
          border: 1px solid #17171A;
        }

        #nespresso-welcome-offer .cta-arrow {
          margin-left: 8px;
          font-size: 16px;
        }
        
        #nespresso-welcome-offer .condicoesOferta{
          font-size:13px;
        }

        #nespresso-welcome-offer .linkCondicoesOfertaMaes {
          color: #17171A;
          text-decoration: underline;
          cursor: pointer;
        }

        #nespresso-welcome-offer .linkCondicoesOfertaMaes:hover {
          text-decoration: none;
        }

        /* Responsividade para tablets */
        @media (max-width: 768px) {
          #nespresso-welcome-offer {
            margin: 30px auto;
            padding: 0 16px;
          }
          
          #nespresso-welcome-offer .offer-container {
            flex-direction: column;
            min-height: auto;
          }
          
          
          #nespresso-welcome-offer .offer-content {
            text-align: center;
          }
          
          #nespresso-welcome-offer .offer-title {
            font-size: 24px;
          }
          
          #nespresso-welcome-offer .offer-text {
            max-width: none;
          }
          #nespresso-welcome-offer .offer-image img {
            border-radius: 8px 8px 0px 0px;
          }
          #nespresso-welcome-offer .cta-container {
            justify-content: center;
          }
          
          #nespresso-welcome-offer .cta-btn {
            min-width: 160px;
          }
        }
        #nespresso-welcome-offer .strongOfferNewUsers{
            font-weight: 700;
        }
        /* Responsividade para mobile */
        @media (max-width: 480px) {
          #nespresso-welcome-offer {
            margin: 20px auto;
            padding: 0 12px;
          }
          
          #nespresso-welcome-offer .offer-container {
            border-radius: 12px;
          }
          
          #nespresso-welcome-offer .offer-content {
            padding: 24px 16px 20px 16px;
          }
          
          #nespresso-welcome-offer .offer-title {
            font-size: 20px;
            margin-bottom: 12px;
          }
          
          #nespresso-welcome-offer .offer-text {
            font-size: 14px;
            margin-bottom: 24px;
          }
          
          #nespresso-welcome-offer .cta-btn {
            padding: 14px 28px;
            min-width: 140px;
          }
          
          #nespresso-welcome-offer .cta-container {
            flex-direction: column;
            align-items: center;
          }
        }
      
        #block-8831360456181,#block-8833590121973{
          display:none;
        }
        @media (min-width: 820px) and (max-width: 1129px) {
            #nespresso-welcome-offer {
              display: none !important;
            }
            #block-8831360456181{
            display:block;
        }
          }
      
          /* Estilos do Modal - Oferta de Boas-vindas */
              .nespresso-welcome-offer-modal *{
                  font-family: NespressoLucas,Helvetica,Arial,sans-serif;
              }
              .nespresso-welcome-offer-modal {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  z-index: 2000;
                  display: none;
              }
              
              .nespresso-welcome-offer-modal-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.5);
                  cursor: pointer;
              }
              
              .nespresso-welcome-offer-modal-container {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background-color: #fff;
                  border-radius: 8px;
                  max-width: 90%;
                  width: 550px;
                  max-height: 90vh;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                  display: flex;
                  flex-direction: column;
                  overflow: hidden;
              }
              
              .nespresso-welcome-offer-modal-header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 15px 20px;
                  border-bottom: 1px solid #e5e5e5;
                  background-color: #f8f8f8;
              }
              
              .nespresso-welcome-offer-modal-header h3 {
                  font-size: 18px;
                  margin: 0;
                  color: #17171A;
                  font-weight: bold;
              }
              
              .nespresso-welcome-offer-modal-close {
                  border: none;
                  background: none;
                  cursor: pointer;
                  width: 24px;
                  height: 24px;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: opacity 0.2s ease;
              }

              .nespresso-welcome-offer-modal-close:hover {
                  opacity: 0.7;
              }
              
              .nespresso-welcome-offer-modal-close svg {
                  width: 18px;
                  height: 18px;
                  color: #666;
              }
              
              .nespresso-welcome-offer-modal-content {
                  padding: 20px;
                  overflow-y: auto;
                  max-height: calc(90vh - 60px);
                  line-height: 1.5;
              }
              
              .nespresso-welcome-offer-modal-termos {
                  font-size: 14px;
                  color: #333;
              }
              
              @media (max-width: 480px) {
                  .nespresso-welcome-offer-modal-container {
                      width: 95%;
                  }
                  
                  .nespresso-welcome-offer-modal-content {
                      padding: 15px;
                  }
                  
                  .nespresso-welcome-offer-modal-header {
                      padding: 12px 15px;
                  }
              }       
      </style>
    `;

    // Insere o CSS e o componente após o elemento alvo
    targetElement.insertAdjacentHTML("afterend", cssStyles + componenteHTML);

    // Cria o modal após inserir o componente
    criarModal();

    // Configura os eventos do modal após um pequeno delay para garantir que os elementos estejam no DOM
    setTimeout(configurarEventosModal, 100);

    // Configura eventos dos CTAs
    document
      .querySelectorAll("#nespresso-welcome-offer .cta-btn")
      .forEach(function (e) {
        e.addEventListener("click", function () {
          sendGAEvent(e.getAttribute("id"));
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", criarComunicacao);
  } else {
    criarComunicacao();
  }
})();
