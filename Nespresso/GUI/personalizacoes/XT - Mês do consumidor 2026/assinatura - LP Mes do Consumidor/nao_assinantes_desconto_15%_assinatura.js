(function () {
  "use strict";
  if (window.comunicacaoAssinaturaMesConsumidor) return;
  window.comunicacaoAssinaturaMesConsumidor = true;
  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "comunicacao-assinatura-mc", //free to fill field, please use lower case
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
    const elementoCPD = document.querySelector("footer");

    if (elementoCPD && !bannerCriado) {
      // Cria a div do banner
      const bannerDiv = document.createElement("div");
      bannerDiv.className = "mc-banner-container";
      bannerDiv.id = "mc-banner-cpd";

      // Cria o elemento picture para responsividade
      const picture = document.createElement("picture");

      // Source para mobile
      const sourceMobile = document.createElement("source");
      sourceMobile.media = "(max-width: 768px)";
      sourceMobile.srcset =
        "https://www.nespresso.com/ecom/medias/sys_master/public/47638940844062/Img-750x848.jpg?attachment=true&cimgnr=fx3kX";

      // Source para desktop (padrão)
      const sourceDesktop = document.createElement("source");
      sourceDesktop.media = "(min-width: 769px)";
      sourceDesktop.srcset =
        "https://www.nespresso.com/ecom/medias/sys_master/public/47689673768990/Hero-Banner-v3.jpg?attachment=true&cimgnr=yrfJ7";

      // Elemento img
      const img = document.createElement("img");
      img.src =
        "https://www.nespresso.com/ecom/medias/sys_master/public/47689673768990/Hero-Banner-v3.jpg?attachment=true&cimgnr=yrfJ7";
      img.alt = "Assine e Ganhe 15% OFF nas 3 primeiras entregas";
      img.loading = "lazy";
      img.className = "mc-banner-img";

      // Monta a estrutura
      picture.appendChild(sourceMobile);
      picture.appendChild(sourceDesktop);
      picture.appendChild(img);
      bannerDiv.appendChild(picture);

      // Cria o botão CTA
      const ctaButton = document.createElement("a");
      ctaButton.href =
        "https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list";
      ctaButton.className = "mc-banner-assinatura-cta";

      // Texto para desktop
      const textoDesktop = document.createElement("span");
      textoDesktop.className = "mc-cta-desktop";
      textoDesktop.textContent = "Aproveite essa oferta e assine agora";

      // Texto para mobile
      const textoMobile = document.createElement("span");
      textoMobile.className = "mc-cta-mobile";
      textoMobile.textContent = "ASSINE AGORA";

      ctaButton.appendChild(textoDesktop);
      ctaButton.appendChild(textoMobile);

      // Adiciona evento de clique para tracking GA4
      ctaButton.addEventListener("click", function () {
        sendGAEvent("click", "cta-assinatura-15off");
      });

      bannerDiv.appendChild(ctaButton);

      // Insere a div antes do elemento footer
      elementoCPD.insertAdjacentElement("beforebegin", bannerDiv);

      // Insere o CSS no head
      const css = `
        <style>
          #mc-banner-cpd {
            width: 100%;
            display: block;
            position: relative;
          }

          #mc-banner-cpd picture {
            width: 100%;
            display: block;
          }

          #mc-banner-cpd .mc-banner-img {
            display: block;
            max-width: 1560px;
            width: 95%;
            margin: auto;
            border-radius: 15px;
            height: auto;
          }

          #mc-banner-cpd .mc-banner-assinatura-cta {
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
            font-family:"NespressoLucas", sans-serif;
          }

          #mc-banner-cpd .mc-cta-desktop {
            display: inline;
          }

          #mc-banner-cpd .mc-cta-mobile {
            display: none;
          }

          .mc-banner-assinatura-cta:hover {
            scale: 1.05;
          }

          @media (max-width: 768px) {
            #mc-banner-cpd .mc-banner-assinatura-cta {
              right: auto;
              left: 50%;
              top: auto;
              bottom: 60px;
              transform: translateX(-50%);
              font-size: 18px;
              padding: 12px 24px;
            }

            #mc-banner-cpd .mc-cta-desktop {
              display: none;
            }

            #mc-banner-cpd .mc-cta-mobile {
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
