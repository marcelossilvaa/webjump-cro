(function () {
  "use strict";
  if (window.cardProgressivoLPBF) return;
  window.cardProgressivoLPBF = true;
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
  function buildCards() {
    const cardOfertasProgressivas = document.querySelector("#cardProducts");
    if (!cardOfertasProgressivas) return;

    // Limpa os componentes atuais
    cardOfertasProgressivas.innerHTML = "";

    // Altere esta lista para controlar os cards (apenas mudando o src)
    const cardImages = [
      "https://www.nespresso.com/ecom/medias/sys_master/public/46557754523678/100-150.jpg?attachment=true&cimgnr=p1lh1",
      "https://www.nespresso.com/ecom/medias/sys_master/public/46557755899934/170-250.jpg?attachment=true&cimgnr=V7kq3",
      "https://www.nespresso.com/ecom/medias/sys_master/public/46557756325918/250-350.jpg?attachment=true&cimgnr=sxvZg",
      "https://www.nespresso.com/ecom/medias/sys_master/public/46557756489758/400-500.jpg?attachment=true&cimgnr=s30SI",
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
