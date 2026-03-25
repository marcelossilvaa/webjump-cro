(function () {
  "use strict";
  let carrouselMaquinas = document.querySelector("#vertuo-landing-page-pt");
  let sectionBannerAcessorios = document.querySelector(
    "section#bf-mainbannerAcessorios"
  );
  let buscaElementosHierarquia = setInterval(function () {
    if (carrouselMaquinas && sectionBannerAcessorios) {
      let css = `
    <style>
    #bf-mainbanner_container{
        background-image: url("https://www.nespresso.com/ecom/medias/sys_master/public/33805482655774/MAIN-BANNER-Azul-02-3840x720-V2.png?") !important;
    }
     @media screen and (max-width:767px){
      #bf-mainbanner_container{
       background-image:url("https://www.nespresso.com/ecom/medias/sys_master/public/33805482885150/MAIN-BANNER-BLACK-FRIDAY-GENERICO-Azul-02-750x848-V2.png?") !important;
      }
     }
    #container-ofertasCompreGanhe{
        display:none;
    }
    </style>
  `;
      document.head.insertAdjacentHTML("beforeend", css);

      clearInterval(buscaElementosHierarquia);
      sectionBannerAcessorios.insertAdjacentElement(
        "beforebegin",
        carrouselMaquinas
      );
    }
  }, 500);
})();
