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

  const cssAB = `<style>@media only screen and (max-width: 768px){
    nb-app-banner[style="display: block;"]{
        display: none !important;
    }
    body:has(nb-app-banner[style="display: block;"]) #header.clearfix{
        min-height: 0px !important;
    }
    html:has(nb-app-banner[style="display: block;"]){
        margin-top:50px !important;
    }
}</style>
`;
  document.head.insertAdjacentHTML("beforeend", cssAB);
})();
