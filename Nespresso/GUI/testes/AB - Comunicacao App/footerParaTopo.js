(function () {
  if (window.ABOcultacaoMensagem) {
    return;
  }
  window.ABOcultacaoMensagem = "true";
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

  function init() {
    let sectionTermosECondicoes = document.querySelector(
      "#block-8830310864373"
    );
    let sectionAppFooter = document.querySelector("#block-8824503883253");

    if (sectionAppFooter && sectionTermosECondicoes) {
      sectionTermosECondicoes.insertAdjacentElement(
        "afterend",
        sectionAppFooter
      );
    }
    document.head.insertAdjacentHTML(
      "beforeend",
      "<style>#block-8824503883253{margin-bottom:20px}</style>"
    );
  }
  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
