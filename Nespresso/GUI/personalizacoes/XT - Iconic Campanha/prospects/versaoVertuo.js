(function () {
  // Marca os elementos criados para identificá-los
  const BANNER_CLASS = "banner-custom-inserido";
  let dispositivoAtual = null;

  function detectarDispositivo() {
    let screenWidth = window.innerWidth;
    if (screenWidth <= 767) return "mobile";
    if (screenWidth >= 768 && screenWidth <= 1024) return "tablet";
    return "desktop";
  }

  function removerBannersExistentes() {
    let bannersExistentes = document.querySelectorAll(`.${BANNER_CLASS}`);
    bannersExistentes.forEach((banner) => banner.remove());
    console.log(`${bannersExistentes.length} banners removidos`);
  }

  function verificarERecriarBanners() {
    let dispositivoNovo = detectarDispositivo();

    // Se mudou de dispositivo ou não existem banners
    let bannersExistentes = document.querySelectorAll(`.${BANNER_CLASS}`);
    let precisaRecriar =
      dispositivoAtual !== dispositivoNovo || bannersExistentes.length === 0;

    if (precisaRecriar) {
      console.log(
        `Dispositivo mudou de ${dispositivoAtual} para ${dispositivoNovo} ou banners não existem`
      );
      removerBannersExistentes();
      dispositivoAtual = dispositivoNovo;
      criacaoCard();
    }
  }

  function criacaoCard() {
    let categoriasPLP = document.querySelectorAll(".collection-grid");
    try {
      if (categoriasPLP.length > 1) {
        let reference = categoriasPLP[1].querySelector("article");
        if (reference) {
          categoriasPLP.forEach(function (categoria, index) {
            // Pula as últimas duas categorias
            if (index >= categoriasPLP.length - 2) {
              return;
            }

            let articles = categoria.querySelectorAll("article");
            if (articles.length >= 6) {
              // Detecta o tipo de dispositivo
              let screenWidth = window.innerWidth;
              let isMobile = screenWidth <= 767;
              let isTablet = screenWidth >= 768 && screenWidth <= 1024;
              let isDesktop = screenWidth > 1024;

              // Só executa para mobile ou desktop, pula tablets
              if (!isTablet) {
                let novoClone = reference.cloneNode(true);

                // Marca o elemento como banner inserido
                novoClone.classList.add(BANNER_CLASS);

                let conteudoClone = novoClone.querySelector(
                  "div[class*='collectionDetails']"
                );
                if (conteudoClone) {
                  conteudoClone.remove();
                }

                let imageContainer = novoClone.querySelector("section");
                if (imageContainer) {
                  imageContainer.style.setProperty(
                    "background-image",
                    "url('https://www.nespresso.com/ecom/medias/sys_master/public/44887599743006/Banner-PLP-432x692-Proposta-02.jpg?attachment=true&cimgnr=zWFCQ')",
                    "important"
                  );
                  imageContainer.style.setProperty(
                    "background-position",
                    "center center",
                    "important"
                  );
                  imageContainer.style.setProperty(
                    "background-repeat",
                    "no-repeat",
                    "important"
                  );

                  // Define o background-size baseado no dispositivo
                  let backgroundSize = isMobile ? "224px 400px" : "247px 460px";
                  imageContainer.style.setProperty(
                    "background-size",
                    backgroundSize,
                    "important"
                  );
                }

                let posicaoMinima = 4;
                let posicaoMaxima = articles.length - 1;
                let posicaoAleatoria =
                  Math.floor(
                    Math.random() * (posicaoMaxima - posicaoMinima + 1)
                  ) + posicaoMinima;

                categoria.insertBefore(novoClone, articles[posicaoAleatoria]);

                console.log(
                  `Banner inserido na posição ${posicaoAleatoria + 1} de ${
                    articles.length + 1
                  } total na categoria ${index + 1}`
                );
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  }

  // Debounce para o resize (evita execuções excessivas)
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(verificarERecriarBanners, 250);
  }

  // Execução inicial
  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      dispositivoAtual = detectarDispositivo();
      criacaoCard();
    });
  } else {
    dispositivoAtual = detectarDispositivo();
    criacaoCard();
  }

  // Listener para resize
  window.addEventListener("resize", handleResize);
})();
