(function () {
  "use strict";
  if (window.hierarquiaLPBF) return;
  window.hierarquiaLPBF = true;
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
  let carrouselMaquinas = document.querySelector("#vertuo-landing-page-pt");
  let bannerMaquinas = document.querySelector("#bf-mainbannerMaquinas");
  let mainBanner = document.querySelector("#bf-mainbanner");
  let sectionBannerOfertasProgressivas = document.querySelector(
    "#container-ofertasCompreGanhe"
  );
  let tentativas = 0;
  let buscaElementosHierarquia = setInterval(function () {
    if (
      carrouselMaquinas &&
      sectionBannerOfertasProgressivas &&
      bannerMaquinas &&
      mainBanner
    ) {
      let css = `
      <style>
      .container-voucher{
          display:block !important;
      }
      #bf-mainbannerMaquinas_container{
        background-image:url("https://www.nespresso.com/ecom/medias/sys_master/public/46559912001566/Main-Banner-Desk-Novos-membros.jpg?attachment=true&cimgnr=pLBuQ") !important;
      }
      @media (max-width: 768px) {
        #bf-mainbannerMaquinas_container{
        background-image:url("https://www.nespresso.com/ecom/medias/sys_master/public/46559912558622/Main-Banner-Mobile-Novos-membros.jpg?attachment=true&cimgnr=B5c6t") !important;
      }
      }
      </style>
    `;
      document.head.insertAdjacentHTML("beforeend", css);

      clearInterval(buscaElementosHierarquia);

      mainBanner.insertAdjacentElement("beforebegin", carrouselMaquinas);
      carrouselMaquinas.insertAdjacentElement("beforebegin", bannerMaquinas);
    } else {
      tentativas++;
      if (tentativas >= 20) {
        clearInterval(buscaElementosHierarquia);
        return;
      }
    }
    carrouselMaquinas = document.querySelector("#vertuo-landing-page-pt");
    bannerMaquinas = document.querySelector("#bf-mainbannerMaquinas");
    sectionBannerOfertasProgressivas = document.querySelector(
      "#container-ofertasCompreGanhe"
    );
    mainBanner = document.querySelector("#bf-mainbanner");
  }, 500);
})();
