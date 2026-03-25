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
  function scrollToFilter() {
    const filterElement = document.querySelector(".plp-category--title");
    if (!filterElement) {
      return;
    }
    const SCROLL_OFFSET = 50;
    const elementPosition = filterElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
  function createGTMEvent(cardClass) {
    if (!window.gtmDataObject) {
      window.gtmDataObject = [];
    }
    window.gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: cardClass,
    });
  }

  const styles = `<style>
      #BR-Sticky-ofertamaquinas_35offaberto{
          display:none;
      }
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
        }
        .cupom-card__text {
            flex: 1;
            min-width: 0;
        }
        .cupom-card__tag {
            position: absolute;
            top: -10px;
            left: 0;
            background: #000;
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
            padding: 2px 12px;
            border-radius: 16px;
            margin-top: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        @media screen and (min-width: 541px) {
            button.cupom-card__cta:hover {
                background: #000;
                color: #fff;
            }
            .cupom-cards{
              margin-bottom:70px;
              margin-top: -38px;
            }
        }
        @media screen and (max-width: 540px) {
            .cupom-cards {
                flex-direction: column;
                max-width: 350px;
            }
        }
    </style>`;
  function createMaquinasCards() {
    const container = document.createElement("div");
    container.className = "cupom-cards";
    const cards = [
      {
        tag: "OFERTA",
        title: "Cupom de desconto",
        description: "Ganhe ",
        price: "10% OFF",
        subtext: " na compra de 150 cápsulas",
        buttontext: "CAFEOFF10",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/44080333783070/DescontoNovosMembros.png?",
      },
      {
        tag: "OFERTA",
        title: "Cupom de desconto",
        description: "Ganhe ",
        price: "15% OFF",
        subtext: " na compra de 200 cápsulas",
        buttontext: "CAFEOFF15",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/44080333717534/DescontoMaquinasExistentes.png?",
      },
    ];
    cards.forEach(function (cardData) {
      container.appendChild(createCard(cardData));
    });
    return container;
  }
  function createCard(data) {
    const card = document.createElement("a");
    card.className = "cupom-card";
    if (data.href) {
      card.href = data.href;
    }
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
    const maquinasCards = createMaquinasCards();
    targetElement.insertAdjacentElement("afterend", maquinasCards);
    document.querySelectorAll("a.cupom-card").forEach(function (oferta, index) {
      oferta.addEventListener("click", function () {
        let cardAtual = index == 0 ? "desconto" : "credito";
        createGTMEvent(oferta.className + "_" + cardAtual);
        if (index != 0) {
          scrollToFilter();
        }
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
