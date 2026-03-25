(function () {
  "use strict";
  if (window.banner15OFFAssinatura) return;
  window.banner15OFFAssinatura = true;

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

  let attempts = 0;
  const maxAttempts = 20;

  const intervalId = setInterval(() => {
    attempts++;

    let bannerSection = document.querySelector(".dp-OAC-header");

    if (bannerSection) {
      // Encontra o elemento picture dentro do banner
      let pictureElement = bannerSection.querySelector(
        ".dp-OAC-header__visual"
      );

      if (pictureElement) {
        // Encontra todos os elementos source dentro do picture
        let sources = pictureElement.querySelectorAll("source");

        if (sources.length > 0) {
          // URLs para cada breakpoint (modifique conforme necessário)
          const imageUrls = {
            desktop:
              "https://www.nespresso.com/ecom/medias/sys_master/public/46587463434270/Main-Banner-Desk-Reten-o.jpg?attachment=true&cimgnr=mPKmg",
            tablet:
              "https://www.nespresso.com/ecom/medias/sys_master/public/46587463565342/Main-Banner-Mobile-Reten-o.jpg?attachment=true&cimgnr=nx8mM",
            mobile:
              "https://www.nespresso.com/ecom/medias/sys_master/public/46587463565342/Main-Banner-Mobile-Reten-o.jpg?attachment=true&cimgnr=nx8mM",
          };

          // Itera sobre cada source e modifica o srcset baseado na media query
          sources.forEach((source) => {
            const media = source.getAttribute("media");

            if (media) {
              if (media.includes("(min-width:1024px)")) {
                // Desktop
                source.setAttribute("srcset", imageUrls.desktop);
              } else if (
                media.includes("(max-width:1023px) and (min-width:762px)")
              ) {
                // Tablet
                source.setAttribute("srcset", imageUrls.tablet);
              } else if (media.includes("(max-width:761px)")) {
                // Mobile
                source.setAttribute("srcset", imageUrls.mobile);
              }
            }
          });

          // Elementos encontrados, para o interval
          clearInterval(intervalId);
        }
      }
    }

    // Se atingiu o número máximo de tentativas, para o interval
    if (attempts >= maxAttempts) {
      clearInterval(intervalId);
    }
  }, 100);
})();
