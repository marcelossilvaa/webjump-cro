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

  const cssAB = `<style>section.main-banner-container:has(a[href="https://www.nespresso.com/br/pt/baixar-app"]){display:none;}
  body:not(:has(nb-app-banner.close)) #header.clearfix{
        min-height: 120px !important;
    }</style>`;
  document.head.insertAdjacentHTML("beforeend", cssAB);
})();
