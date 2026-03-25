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
      `<br><span class="condicoesOferta">*Oferta válida apenas para novos membros. Consulte condições.</span></p>
            
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
        
      </style>
    `;

    // Insere o CSS e o componente após o elemento alvo
    targetElement.insertAdjacentHTML("afterend", cssStyles + componenteHTML);

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
