(function () {
  "use strict";
  function buildCards() {
    const cardOfertasProgressivas = document.querySelector("#cardProducts");
    if (!cardOfertasProgressivas) return;

    // Limpa os componentes atuais
    cardOfertasProgressivas.innerHTML = "";

    // Altere esta lista para controlar os cards (apenas mudando o src)
    const cardImages = [
      "https://www.nespresso.com/ecom/medias/sys_master/public/46557751115806/30-50.jpg?attachment=true&cimgnr=kKBW3",
      // Adicione mais URLs de imagens aqui, se desejar
    ];

    cardImages.forEach((src) => {
      const item = document.createElement("div");
      item.className = "cardProducts_item";

      const link = document.createElement("a");
      link.className = "card-link-1";
      link.href = "https://www.nespresso.com/br/pt/order/capsules/original";
      link.style.color = "#000";

      const tag = document.createElement("span");
      tag.className = "offer-tag";
      tag.textContent = "OFERTA PROGRESSIVA";

      const img = document.createElement("img");
      img.className = "cardProducts_item__image";
      img.src = src;
      img.alt = "Imagem de tag de desconto de R$50 colorida";

      link.appendChild(tag);
      link.appendChild(img);
      item.appendChild(link);
      cardOfertasProgressivas.appendChild(item);
    });
  }

  function waitForContainerAndBuild() {
    let attempts = 0;
    const maxAttempts = 100; // ~20s com 200ms de intervalo
    const intervalId = setInterval(() => {
      const el = document.querySelector("#cardProducts");
      attempts += 1;
      if (el) {
        clearInterval(intervalId);
        buildCards();
      } else if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForContainerAndBuild);
  } else {
    waitForContainerAndBuild();
  }
})();
