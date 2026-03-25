(function () {
  function iniciar() {
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

    const cssAB = `<style>section.main-banner-container:has(a[href="https://www.nespresso.com/br/pt/baixar-app"]){display:none;}</style>`;
    document.head.insertAdjacentHTML("beforeend", cssAB);
    window.nwc.projects.push(
      JSON.parse(
        document.getElementById(
          "page-builder-data-fa2efb73-80d2-e449-904c-6d8319bdbe77"
        ).innerHTML
      )
    );
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
