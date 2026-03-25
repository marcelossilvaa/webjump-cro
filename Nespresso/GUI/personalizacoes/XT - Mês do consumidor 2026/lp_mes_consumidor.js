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
  let bannerMaquinas = document.querySelector("#mc-mainbannerMaquinas");
  let mainBanner = document.querySelector("#mc-mainbanner");
  let sectionBannerOfertasProgressivas = document.querySelector(
    "#container-ofertasCompreGanhe",
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
      #mc-mainbannerMaquinas_container{
        background-image:url("https://www.nespresso.com/ecom/medias/sys_master/public/48681093496862/Main-Banner-Desk-Segmentado.jpg?attachment=true&cimgnr=J8Cgd") !important;
      }
      @media (max-width: 768px) {
        #mc-mainbannerMaquinas_container{
        background-image:url("https://www.nespresso.com/ecom/medias/sys_master/public/48681093627934/Main-Banner-Mobile-Segmentado.jpg?attachment=true&cimgnr=chLRu") !important;
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
    bannerMaquinas = document.querySelector("#mc-mainbannerMaquinas");
    sectionBannerOfertasProgressivas = document.querySelector(
      "#container-ofertasCompreGanhe",
    );
    mainBanner = document.querySelector("#mc-mainbanner");
  }, 500);
})();
