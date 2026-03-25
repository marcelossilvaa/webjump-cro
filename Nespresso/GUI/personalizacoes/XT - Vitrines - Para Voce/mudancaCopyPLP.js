(function () {
  "use strict";

  function ajusteCopy() {
    try {
      const componentePLP = document.querySelector(
        "nb-container[campaign_id='br-b2c-informationstripe-coffeeselector-plpcafe']"
      );

      if (!componentePLP) {
        return;
      }
      const divComponente = componentePLP.querySelector(
        ".nb-informative-stripe__inner"
      );

      if (!divComponente) {
        return;
      }

      const spanElement = divComponente.querySelector("span");
      if (spanElement) {
        const iconElement = spanElement.querySelector("nb-icon");
        if (iconElement) {
          iconElement.remove();
        }

        spanElement.insertAdjacentHTML(
          "afterbegin",
          `<nb-icon icon="24/service/for-you"></nb-icon>`
        );

        const existingBadge = spanElement.querySelector(
          'p[style*="background-color:#7F7038"]'
        );
        if (!existingBadge) {
          spanElement.insertAdjacentHTML(
            "beforeend",
            `<p style="padding:6px 12px; border-radius:20px; color:#fff; background-color:#7F7038; font-size:14px; font-weight:600; margin-right:12px;">Novo!</p>`
          );
        }
      }

      const linkElement = componentePLP.querySelector("a");
      const textoComponente = componentePLP.querySelector("a span");

      if (linkElement && textoComponente) {
        linkElement.href = "https://www.nespresso.com/br/pt/feito-para-voce";
        linkElement.title =
          "Confira nossas recomendações pensadas especialmente para você!";
        linkElement.setAttribute(
          "aria-label",
          "Confira nossas recomendações pensadas especialmente para você!"
        );

        textoComponente.textContent =
          "Um universo de cafés e possibilidades FEITO PARA VOCÊ. Confira!";

        linkElement.addEventListener("click", function () {
          window.gtmDataObject = window.gtmDataObject || [];
          gtmDataObject.push({
            event: "local_event", //as is, do not change!!
            event_raised_by: "br", //please put the country code ex: us, ch, it
            local_event_category: "user engagement", //free to fill field, please use lower case
            local_event_action: "click", //free to fill field, please use lower case
            local_event_label: "clicou_banner_feito_para_voce_plp_capsula", //free to fill field, please use lower case
          });
        });
      } else {
      }
    } catch (error) {}
  }

  function executarComRetry(maxTentativas = 3, intervalo = 1000) {
    let tentativas = 0;

    function tentar() {
      const componente = document.querySelector(
        "nb-container[campaign_id='br-b2c-informationstripe-coffeeselector-plpcafe']"
      );

      if (componente) {
        ajusteCopy();
      } else if (tentativas < maxTentativas) {
        tentativas++;
        setTimeout(tentar, intervalo);
      }
    }

    tentar();
  }

  // Execução baseada no estado do documento
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", executarComRetry);
  } else {
    executarComRetry();
  }
})();
