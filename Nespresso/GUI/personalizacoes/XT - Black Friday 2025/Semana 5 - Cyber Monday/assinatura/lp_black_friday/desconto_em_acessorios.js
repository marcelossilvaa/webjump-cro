(function () {
  "use strict";
  if (window.comunicacaoAssinaturaLPBF) return;
  window.comunicacaoAssinaturaLPBF = true;
  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "comunicacao-assinatura-bf", //free to fill field, please use lower case
      local_event_action: action, //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
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
  let tentativas = 0;
  let bannerCriado = false;

  let buscaElementoCPD = setInterval(function () {
    const elementoCPD = document.querySelector(".dp-CPD");

    if (elementoCPD && !bannerCriado) {
      // Cria a div do banner
      const bannerDiv = document.createElement("div");
      bannerDiv.className = "bf-banner-container";
      bannerDiv.id = "bf-banner-cpd";

      // Cria o elemento picture para responsividade
      const picture = document.createElement("picture");

      // Source para mobile
      const sourceMobile = document.createElement("source");
      sourceMobile.media = "(max-width: 768px)";
      sourceMobile.srcset =
        "https://www.nespresso.com/ecom/medias/sys_master/public/46587463565342/Main-Banner-Mobile-Reten-o.jpg?attachment=true&cimgnr=nx8mM";

      // Source para desktop (padrão)
      const sourceDesktop = document.createElement("source");
      sourceDesktop.media = "(min-width: 769px)";
      sourceDesktop.srcset =
        "https://www.nespresso.com/ecom/medias/sys_master/public/46587463434270/Main-Banner-Desk-Reten-o.jpg?attachment=true&cimgnr=mPKmg";

      // Elemento img
      const img = document.createElement("img");
      img.src =
        "https://www.nespresso.com/ecom/medias/sys_master/public/46587463434270/Main-Banner-Desk-Reten-o.jpg?attachment=true&cimgnr=mPKmg";
      img.alt = "Assine e Ganhe 15% OFF nas 3 primeiras entregas";
      img.loading = "lazy";
      img.className = "bf-banner-img";

      // Monta a estrutura
      picture.appendChild(sourceMobile);
      picture.appendChild(sourceDesktop);
      picture.appendChild(img);
      bannerDiv.appendChild(picture);

      // Cria o botão CTA
      const ctaButton = document.createElement("a");
      ctaButton.href =
        "https://www.nespresso.com/br/pt/order/accessories/original";
      ctaButton.className = "bf-banner-assinatura-cta";

      // Texto para desktop
      const textoDesktop = document.createElement("span");
      textoDesktop.className = "bf-cta-desktop";
      textoDesktop.textContent = "Aproveite agora esse benefício";

      // Texto para mobile
      const textoMobile = document.createElement("span");
      textoMobile.className = "bf-cta-mobile";
      textoMobile.textContent = "APROVEITE AGORA";

      ctaButton.appendChild(textoDesktop);
      ctaButton.appendChild(textoMobile);

      // Adiciona evento de clique para tracking GA4
      ctaButton.addEventListener("click", function () {
        sendGAEvent("click", "cta-acessorios-desconto");
      });

      bannerDiv.appendChild(ctaButton);

      // Insere a div após o elemento .dp-CPD
      elementoCPD.insertAdjacentElement("afterend", bannerDiv);

      // Insere o CSS no head
      const css = `
        <style>
          #bf-banner-cpd {
            width: 100%;
            display: block;
            position: relative;
          }

          #bf-banner-cpd picture {
            width: 100%;
            display: block;
          }

          #bf-banner-cpd .bf-banner-img {
            display: block;
            max-width: 1560px;
            width: 95%;
            margin: auto;
            border-radius: 15px;
            height: auto;
          }

          #bf-banner-cpd .bf-banner-assinatura-cta {
            position: absolute;
            right: 15%;
            top: 50%;
            transform: translateY(-50%);
            width: fit-content;
            padding: 22px 18px;
            background-color: #257a57;
            border-radius: 56px;
            font-size: 18px;
            line-height: 22px;
            text-decoration: none;
            color: #ffffff;
            font-weight: 600;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
            transition: 0.3s ease-out;
          }

          #bf-banner-cpd .bf-cta-desktop {
            display: inline;
          }

          #bf-banner-cpd .bf-cta-mobile {
            display: none;
          }

          .bf-banner-assinatura-cta:hover {
            scale: 1.05;
          }

          @media (max-width: 768px) {
            #bf-banner-cpd .bf-banner-assinatura-cta {
              right: auto;
              left: 50%;
              top: auto;
              bottom: 60px;
              transform: translateX(-50%);
              font-size: 18px;
              padding: 12px 24px;
            }

            #bf-banner-cpd .bf-cta-desktop {
              display: none;
            }

            #bf-banner-cpd .bf-cta-mobile {
              display: inline;
            }
          }
        </style>
      `;
      document.head.insertAdjacentHTML("beforeend", css);

      bannerCriado = true;
      clearInterval(buscaElementoCPD);
    } else if (!elementoCPD) {
      tentativas++;
      if (tentativas >= 100) {
        clearInterval(buscaElementoCPD);
        return;
      }
    }
  }, 200);
})();
