(function () {
  "use strict";
  if (window.botaoPesquisaFinalizacaoAssinatura) return;
  window.botaoPesquisaFinalizacaoAssinatura = true;

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
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "pesquisa_qualtrics", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  var SURVEY_URL =
    "https://nestleglobalmktg.qualtrics.com/jfe/form/SV_3Eh4P5icsXekthA";
  var LINK_ID = "pesquisa-finalizacao-assinatura";

  function insertSurveyLink(modal) {
    if (modal.querySelector("#" + LINK_ID)) return;

    var footer = modal.querySelector("._footer_adovu_134");
    if (!footer) return;

    var link = document.createElement("a");
    link.id = LINK_ID;
    link.href = SURVEY_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Como foi sua experiência?";
    var isMobile = window.innerWidth < 768;

    link.style.cssText =
      "display: block;width: 100%;text-align: " +
      (isMobile ? "center" : "left") +
      ";color: rgb(23 23 26);font-size: 14px;text-decoration: underline;align-self: center;justify-self: flex-start;";

    link.addEventListener("click", function () {
      sendGAEvent("pesquisa_assinatura_clique_no_botao");
    });

    footer.insertBefore(link, footer.firstChild);
    sendGAEvent("pesquisa_assinatura_botao_visivel");
  }

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeType !== 1) continue;

        var modal =
          node.matches && node.matches('[data-testid="ThankYouModal"]')
            ? node
            : node.querySelector &&
              node.querySelector('[data-testid="ThankYouModal"]');

        if (modal) {
          insertSurveyLink(modal);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  var existing = document.querySelector('[data-testid="ThankYouModal"]');
  if (existing) insertSurveyLink(existing);
})();
