(function () {
  if (window.personalizacaoCupom) {
    return;
  }
  if (window.innerWidth >= 540) {
    return;
  }
  window.personalizacaoCupom = true;

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
  function createGTMEvent(cardClass, action = "click") {
    if (!window.gtmDataObject) {
      window.gtmDataObject = [];
    }
    window.gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: action,
      local_event_label: cardClass,
    });
  }

  function copyToClipboard(text, button) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalText = button.textContent;
        button.textContent = "COPIADO!";
        button.style.backgroundColor = "#151515";
        button.style.color = "#ffffff";
        button.style.borderColor = "#FFF";

        setTimeout(() => {
          button.textContent = originalText;
          button.insertAdjacentHTML(
            "beforeend",
            '<nb-icon icon="32/symbol/copy"></nb-icon>'
          );
          button.style.backgroundColor = "#ffffff";
          button.style.color = "#000";
          button.style.borderColor = "#000";
        }, 2000);
      })
      .catch((err) => {});
  }

  const styles = `<style>
          .cupom-cards {
              display: flex;
              flex-direction: row;
              gap: 13px;
              max-width: 800px;
              margin: 0 auto;
              font-family: "NespressoLucas", Arial, sans-serif;
              margin-top: 16px;
              padding: 0 15px;
          }
          .cupom-card {
              border: 1px solid #e4e4e4;
              border-radius: 2px;
              padding: 15px;
              text-decoration: none;
              position: relative;
              display: block;
              background: #fff;
              flex: 1;
              min-width: 0;
          }
          .cupom-card__content {
              display: flex;
              align-items: center;
              gap: 15px;
          }
          .cupom-card__image {
              width: 80px;
              height: auto;
              object-fit: contain;
              border-radius:999px;
          }
          .cupom-card__text {
              flex: 1;
              min-width: 0;
          }
          .cupom-card__tag {
              position: absolute;
              top: -10px;
              left: 0;
              background: #e85625;
              color: #fff;
              padding: 1px 8px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              border-radius: 4px;
          }
          .cupom-card__title {
              font-size: 14px;
              color: #000;
              margin: 0 0 4px;
              font-weight: 600;
          }
          .cupom-card__description {
              margin: 0;
              font-size: 13px;
              color: #666;
              line-height: 1.1;
          }
          .cupom-card__price {
              color: #000;
              font-weight: 700;
          }
          button.cupom-card__cta {
              background: #ffffff;
              color: #000;
              border: 1px solid #000;
              padding: 4px 12px;
              border-radius: 16px;
              margin-top: 6px;
              cursor: pointer;
              transition: all 0.3s ease;
              display:flex;
              gap:6px;
              align-items:center;
          }
          button.cupom-card__cta nb-icon svg{
              width:16px;
              height:16px;
          }
          @media screen and (min-width: 541px) {
              button.cupom-card__cta:hover {
                  background: #000;
                  color: #fff;
              }
              .cupom-cards{
                margin-bottom:70px;
                margin-top: -38px;
                display:none !important;
              }
          }
          @media screen and (max-width: 540px) {
              .cupom-cards {
                  flex-direction: column;
                  max-width: 350px;
              }
          }
      </style>`;
  function createCupomCards() {
    const container = document.createElement("div");
    container.className = "cupom-cards";
    const cards = [
      {
        tag: "OFERTA",
        title: "Flash Sales",
        description: "Ganhe ",
        price: "10% OFF",
        subtext: " na compra de 150 cápsulas",
        buttontext: "CAFEOFF10",
        icon: '<nb-icon icon="32/symbol/copy"></nb-icon>',
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/44452513480734/Main-Banner-PLP-400x400-Flash-Sales-Abril-1.jpg",
      },
      {
        tag: "OFERTA",
        title: "Flash Sales",
        description: "Ganhe ",
        price: "15% OFF",
        subtext: " na compra de 200 cápsulas",
        buttontext: "CAFEOFF15",
        icon: '<nb-icon icon="32/symbol/copy"></nb-icon>',
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/44452513677342/Main-Banner-PLP-400x400-Flash-Sales-Abril-2.jpg",
      },
    ];
    cards.forEach(function (cardData) {
      container.appendChild(createCard(cardData));
    });
    return container;
  }
  function createCard(data) {
    const card = document.createElement("div"); // Alterado de 'a' para 'div'
    card.className = "cupom-card";

    const tag = document.createElement("span");
    tag.className = "cupom-card__tag";
    tag.textContent = data.tag;
    card.appendChild(tag);

    const contentDiv = document.createElement("div");
    contentDiv.className = "cupom-card__content";

    const img = document.createElement("img");
    img.className = "cupom-card__image";
    img.src = data.image;
    img.alt = data.title;

    const textDiv = document.createElement("div");
    textDiv.className = "cupom-card__text";

    const title = document.createElement("h3");
    title.className = "cupom-card__title";
    title.textContent = data.title;

    const description = document.createElement("p");
    description.className = "cupom-card__description";

    const ctaOferta = document.createElement("button");
    ctaOferta.className = "cupom-card__cta";
    ctaOferta.textContent = data.buttontext;
    ctaOferta.insertAdjacentHTML("beforeend", data.icon);

    // Adicionar evento de clique para copiar o código do cupom
    ctaOferta.addEventListener("click", function (e) {
      e.preventDefault();
      copyToClipboard(data.buttontext, ctaOferta);

      let cardType =
        data.buttontext === "CAFEOFF10" ? "desconto10" : "desconto15";
      createGTMEvent("cupom-card_" + cardType);
    });

    if (data.price) {
      description.appendChild(document.createTextNode(data.description));
      const priceSpan = document.createElement("span");
      priceSpan.className = "cupom-card__price";
      priceSpan.textContent = data.price;
      description.appendChild(priceSpan);
      description.appendChild(document.createTextNode(data.subtext));
    } else {
      description.textContent = data.description;
    }

    textDiv.appendChild(title);
    textDiv.appendChild(description);
    textDiv.appendChild(ctaOferta);
    contentDiv.appendChild(img);
    contentDiv.appendChild(textDiv);
    card.appendChild(contentDiv);

    return card;
  }

  function init() {
    document.head.insertAdjacentHTML("beforeend", styles);
    const targetElement = document.querySelector("nb-informative-stripe");
    if (!targetElement) {
      return;
    }
    const cupomCards = createCupomCards();
    targetElement.insertAdjacentElement("afterend", cupomCards);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
