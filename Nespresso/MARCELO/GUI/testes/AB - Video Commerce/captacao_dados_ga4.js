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

  // Verifica se o elemento principal existe
  const carouselElement = document.querySelector("liveshop-ads-carousel-v2");

  if (!carouselElement || !carouselElement.shadowRoot) {
    console.warn(
      "Elemento liveshop-ads-carousel-v2 ou shadowRoot não encontrado"
    );
    return;
  }

  let seletorVitrinesVideoCommerce =
    carouselElement.shadowRoot.querySelectorAll(
      "#swiper-wrapper liveshop-ads-video"
    );

  // Verifica se há vídeos disponíveis
  if (
    !seletorVitrinesVideoCommerce ||
    seletorVitrinesVideoCommerce.length === 0
  ) {
    return;
  }

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
      const productNameElement = shadowRoot.querySelector(".lav-product-name");

      if (productNameElement) {
        const productName = productNameElement.textContent
          .trim()
          .toLowerCase()
          .replaceAll(" ", "_");
        sendGAEvent(productName);
      }
    });
  });
})();
