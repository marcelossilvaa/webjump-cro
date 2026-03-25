(function () {
  if (window.popInTheWeeknd) {
    return;
  }
  window.popInTheWeeknd = "true";

  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });

  const CAFE_POP_IN_URL = "https://www.nespresso.com/br/pt/samra-by-the-weeknd";

  function sendEventGA(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "oferta_the_weeknd",
      local_event_action: "click",
      local_event_label: label,
    });
  }

  function iniciarContainer() {
    var config = {
      imagemUrl:
        "https://www.nespresso.com/ecom/medias/sys_master/public/49221319720990/Pop-In-1-1-.gif?",
      imagemAlt:
        "Concorra a 1 Par de Ingressos a Tournê do The Weeknd - Saiba Mais",
      linkUrl: CAFE_POP_IN_URL,
      abrirNovaAba: false,
    };
    var estilos = document.createElement("style");
    estilos.innerHTML = `
          .target-container-fixo {
            position: fixed;
            right: 20px;
            top: 80%;
            transform: translateY(-50%);
            width: 150px;
            z-index: 999;
            border-radius: 8px;
            overflow: hidden;
          }
        
          .target-container-fixo a {
            display: block;
            text-decoration: none;
          }
         
          .target-container-fixo img {
            display: block;
            width: 100%;
            height: auto;
            background-color: #FFF;
            border-radius: 90px;
            border:1px solid #cbc6c6;
          }
         
          .target-fechar-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            line-height: 1;
            padding: 0;
            transition: background-color 0.2s;
          }
         
          .target-fechar-btn:hover {
            background-color: rgba(0, 0, 0, 0.7);
          }
        #root-nespresso-conversational-window section#nespresso-conversational-window{
            display:none !important;
             }
          @media only screen and (max-width: 540px){
          .target-container-fixo {
            width:110px;
            top:80%;
          }
            .target-fechar-btn{
              left:0px;
              right:unset;
            }
          }
        `;
    document.head.appendChild(estilos);

    var container = document.createElement("div");
    container.className = "target-container-fixo";
    container.setAttribute("role", "complementary");
    container.setAttribute("aria-label", "Conteúdo promocional");
    container.style.opacity = "0";
    container.style.transition = "opacity 0.3s ease";

    var link = document.createElement("a");
    link.href = config.linkUrl;
    if (config.abrirNovaAba) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.style.cursor = "pointer";
    link.style.display = "block";

    var imagem = document.createElement("img");
    imagem.src = config.imagemUrl;
    imagem.alt = config.imagemAlt;
    imagem.setAttribute("loading", "lazy");

    link.appendChild(imagem);
    container.appendChild(link);

    var botaoFechar = document.createElement("button");
    botaoFechar.className = "target-fechar-btn";
    botaoFechar.setAttribute("aria-label", "Fechar promoção");
    botaoFechar.innerHTML = "&#10005;";
    container.appendChild(botaoFechar);

    link.addEventListener("click", function () {
      sendEventGA("clicou_comunicacao_pop_in_the_weeknd");
    });
    botaoFechar.addEventListener("click", function (e) {
      sendEventGA("fechou_comunicacao_pop_in_the_weeknd");
      e.preventDefault();
      e.stopPropagation();

      container.style.opacity = "0";

      setTimeout(function () {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }

        // Opcional: session Storage
        try {
          sessionStorage.setItem("targetContainerFechadoPeloUsuario", "true");
        } catch (err) {}
      }, 300);
    });

    var jaFechado = false;
    try {
      jaFechado =
        sessionStorage.getItem("targetContainerFechadoPeloUsuario") === "true";
    } catch (err) {}

    if (!jaFechado) {
      document.body.appendChild(container);
      sendEventGA("visualizou_comunicacao_pop_in_the_weeknd");

      setTimeout(function () {
        container.style.opacity = "1";
      }, 10);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarContainer);
  } else {
    iniciarContainer();
  }
})();
