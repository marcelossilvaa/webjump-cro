(function () {
  "use strict";

  const novaImagemMobile =
    "https://www.nespresso.com/ecom/medias/sys_master/public/46588624535582/Main-Banner-Mobile-v2.jpg?attachment=true&cimgnr=oMuaJ";

  //Banner Desktop é inserido via CSS
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
    @media (min-width: 769px) {
      nb-hero-banner .cb-bg-img {
        background-image: url("https://www.nespresso.com/ecom/medias/sys_master/public/46588624699422/Main-Banner-Desk-v2-1-.jpg?attachment=true&cimgnr=HYGiy") !important;
      }
    }
  </style>`
  );

  // Banner Mobile: setInterval para buscar o elemento e modificar o src
  function isMobile() {
    return window.innerWidth < 769;
  }

  if (isMobile()) {
    const startTime = Date.now();
    const duration = 15000; // 15 segundos

    const intervalId = setInterval(function () {
      const bannerMobile = document.querySelector(
        "nb-hero-banner img.nb-hero-banner__image"
      );

      // Se encontrar o elemento e o src não estiver correto, atualiza
      if (bannerMobile && bannerMobile.src !== novaImagemMobile) {
        bannerMobile.src = novaImagemMobile;
      }

      // Verifica se já passaram 10 segundos
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(intervalId);
      }
    }, 100); // Verifica a cada 100ms
  }
})();
