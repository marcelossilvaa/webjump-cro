(function () {
  "use strict";
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "streamshop-widget-home", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  const htmlLiveShop = `<liveshop-ads-carousel-v2 height="500px" slugs-video="xY8keFRp,Zo9rRmlI,rm6CD92T,WKNQ7AWB,htHHwdvl,zhEqaz9W,bYvgxDWY,b4R6UD6y,lG3lqDB5"></liveshop-ads-carousel-v2>`;

  let tentativas = 0;
  const maxTentativas = 30; // Número máximo de tentativas

  const intervalo = setInterval(() => {
    tentativas++;

    const seletorUSP = document.querySelector("#nespresso-benefits-bar-mobile");

    if (seletorUSP) {
      clearInterval(intervalo);
      seletorUSP.insertAdjacentHTML("afterend", htmlLiveShop);

      // Aguarda o carouselElement estar disponível
      const aguardarCarousel = setInterval(() => {
        const carouselElement = document.querySelector(
          "liveshop-ads-carousel-v2"
        );

        if (carouselElement && carouselElement.shadowRoot) {
          clearInterval(aguardarCarousel);

          // Função para adicionar event listeners nos vídeos
          function adicionarEventListeners() {
            let seletorVitrinesVideoCommerce =
              carouselElement.shadowRoot.querySelectorAll(
                "#swiper-wrapper liveshop-ads-video"
              );

            if (
              seletorVitrinesVideoCommerce &&
              seletorVitrinesVideoCommerce.length > 0
            ) {
              observer.disconnect(); // Para de observar

              // Adiciona event listener para cada vídeo
              seletorVitrinesVideoCommerce.forEach((video) => {
                video.addEventListener("click", function () {
                  // Acessa o shadowRoot do componente liveshop-ads-video
                  const shadowRoot = video.shadowRoot;

                  if (!shadowRoot) {
                    console.warn("shadowRoot não encontrado no vídeo");
                    return;
                  }

                  // Busca o nome do produto dentro do shadowRoot
                  const productNameElement =
                    shadowRoot.querySelector(".lav-product-name");

                  if (productNameElement) {
                    const productName = productNameElement.textContent
                      .trim()
                      .toLowerCase()
                      .replaceAll(" ", "_");
                    sendGAEvent(productName);
                  }
                });
              });
            }
          }

          // MutationObserver para detectar quando os vídeos são carregados
          const observer = new MutationObserver(() => {
            adicionarEventListeners();
          });

          // Observa mudanças no shadowRoot do carousel
          observer.observe(carouselElement.shadowRoot, {
            childList: true,
            subtree: true,
          });

          // Tentativa imediata caso os vídeos já estejam carregados
          adicionarEventListeners();
        }
      }, 200);
    } else if (tentativas >= maxTentativas) {
      clearInterval(intervalo);
    }
  }, 200);
})();
