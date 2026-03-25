(function () {
  if (window.personalizacaoNamorados) {
    return;
  }

  window.personalizacaoNamorados = true;

  const DESKTOP_BREAKPOINT = 825;
  const MOBILE_BREAKPOINT = 540;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
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
       #namorados2025{
        display:none;
       }
        #cardProducts .spanGanheNamorados {
          font-weight: 800;
          font-size: 13px;
        }
      @media screen and (max-width: 540px) {
        #cardProducts .cardProducts_item {
          width: 95% !important;
          height: auto !important;
          padding: 6px !important;
        }
        #cardProducts .imageAndTextNamorados {
          display: flex;
          justify-content: space-evenly;
          align-items: center;
        }
        
        #cardProducts .produtoNamorados {
          font-size: 15px !important;
        }
        .containerOfertasNamorados__title {
          padding: 0 20px !important;
        }
      }
      #containerOfertasNamorados {
        font-family: NespressoLucas;
        background-color: #fff;
        text-align: center;
        padding: 0px 0;
      }
      .containerOfertasNamorados__title {
        font-size: 24px;
        text-transform: uppercase;
        font-weight: 600;
        line-height: 1.3em;
        padding: 0 45px;
      }
      #cardProducts {
        display: flex;
        width: 100%;
        height: auto;
        gap: 60px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
      }
  
      @media screen and (max-width: 767px) {
        #cardProducts {
          gap: 15px;
        }
      }
  
      #cardProducts .cardProducts_item {
        border: 1px solid #00000015;
        box-shadow: 0px 1px 20px 0px #00000015;
        width: auto;
        height: 250px;
        padding: 6px;
        border-radius: 10px;
        position: relative;
      }
  
      #cardProducts .cardProducts_item .cardProducts_item__image {
        width: auto;
        height: 100px;
        margin: 10px;
      }
      #cardProducts .cardProducts_item .cardProducts_item__info {
        width: 100%;
        height: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        inline-size: fit-content;
      }
      #cardProducts .cardProducts_item .cardProducts_item__info_title {
        font-size: 18px;
        font-weight: 700;
        width: 160px;
      }
      #cardProducts .cardProducts_item .cardProducts_item__info_offer {
        text-transform: uppercase;
        color: #257a57;
        font-weight: 600;
      }
  
      #cardProducts .offer-tag {
        font-size: 10px;
        background-color: #e27b6c;
        width: 60px;
        color: #fae5dd;
        font-weight: 600;
        position: absolute;
        padding: 2px;
        top: 0px;
        border-radius: 0px 10px;
        right: 0;
      }
      #cardProducts .produtoNamorados {
        color: #e27b6c;
        font-size: 12px;
        line-height: 1;
      }
      #cardProducts .maisCard {
        font-size: 16px;
        color: black;
        font-weight:400;
      }
    </style>`;
  document.head.insertAdjacentHTML("beforeend", styles);

  function createNamoradosSection() {
    const section = document.createElement("section");
    section.id = "containerOfertasNamorados";

    const title = document.createElement("p");
    title.className = "containerOfertasNamorados__title";
    title.textContent = "";

    const disclaimer = document.createElement("span");
    disclaimer.style.fontSize = "1px";
    disclaimer.style.fontWeight = "500";
    disclaimer.style.color = "#eb7047";
    disclaimer.textContent = "";

    function createProductCard(product) {
      const cardDiv = document.createElement("div");
      cardDiv.className = "cardProducts_item";

      const link = document.createElement("a");
      link.className = product.id;
      link.style.color = "#000";
      link.setAttribute(
        "href",
        "https://www.nespresso.com/br/pt/order/capsules/original"
      );
      const offerTag = document.createElement("span");
      offerTag.className = "offer-tag";
      offerTag.textContent = "❤";

      const imageTextDiv = document.createElement("div");
      imageTextDiv.className = "imageAndTextNamorados";

      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.alt;
      img.className = "cardProducts_item__image";

      const infoDiv = document.createElement("div");
      infoDiv.className = "cardProducts_item__info";

      const titleDiv = document.createElement("div");
      titleDiv.className = "cardProducts_item__info_title";

      const ganheSpan = document.createElement("span");
      ganheSpan.className = "spanGanheNamorados";
      ganheSpan.textContent = product.oferta;

      const products = product.title.split("+");

      titleDiv.appendChild(ganheSpan);
      titleDiv.appendChild(document.createElement("br"));

      products.forEach((prod, index) => {
        const productSpan = document.createElement("span");
        productSpan.className = "produtoNamorados";
        productSpan.textContent = prod.trim();

        if (index < products.length - 1) {
          const plusSpan = document.createElement("span");
          plusSpan.className = "maisCard";
          plusSpan.textContent = " +";

          titleDiv.appendChild(productSpan);
          titleDiv.appendChild(plusSpan);
          titleDiv.appendChild(document.createElement("br"));
        } else {
          titleDiv.appendChild(productSpan);
        }
      });

      infoDiv.appendChild(titleDiv);
      imageTextDiv.appendChild(img);
      imageTextDiv.appendChild(infoDiv);
      link.appendChild(offerTag);
      link.appendChild(imageTextDiv);
      cardDiv.appendChild(link);

      return cardDiv;
    }

    const cardProducts = document.createElement("div");
    cardProducts.id = "cardProducts";

    const productsData = [
      {
        id: "card_n1",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45003699159070/Arte-LP-400x400-N1.jpg?attachment=true&cimgnr=Miw9i",
        alt: "Na compra de 70 cafés E GANHE 10 CAFÉS NESPRESSO",
        title: "10 CAFÉS NESPRESSO",
        oferta: "Compre 70 cafés* e ganhe",
      },
      {
        id: "card_n2",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45003699552286/Arte-LP-400x400-N2.jpg?attachment=true&cimgnr=gNDqL",
        alt: "Na compra de 100 cafés gelados um chocolate ao leite",
        title: "1 CHOCOLATE AO LEITE",
        oferta: "Compre 100 cafés* e ganhe",
      },
      {
        id: "card_n3",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45000261697566/Arte-LP-400x400-N3.jpg?attachment=true&cimgnr=a3Qj2",
        alt: "Na compra de 150 cafés gelados ganhe um chocolate e uma xícara",
        title: "1 CHOCOLATE AO LEITE + 1 PIXIE STOCKHOLM",
        oferta: "Compre 150 cafés* e ganhe",
      },
      {
        id: "card_n4",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45000262156318/Arte-LP-400x400-N4.jpg?attachment=true&cimgnr=Okm3F",
        alt: "Na compra de 200 cafés duas xícaras",
        title: "1 PIXIE ESPRESSO PARIS + 1 PIXIE ESPRESSO ISTANBUL ",
        oferta: "Compre 200 cafés* e ganhe",
      },
      {
        id: "card_n5",
        image:
          "https://www.nespresso.com/ecom/medias/sys_master/public/45000262549534/Arte-LP-400x400-N5.jpg?attachment=true&cimgnr=8yCB2",
        alt: "Na compra de 250 cafés ganhe par de taças",
        title: "1 PAR DE TAÇAS PARA DRINKS",
        oferta: "Compre 250 cafés* e ganhe",
      },
    ];

    productsData.forEach((product) => {
      const card = createProductCard(product);
      cardProducts.appendChild(card);
    });

    section.appendChild(title);
    section.appendChild(disclaimer);
    section.appendChild(cardProducts);
    return section;
  }

  function init() {
    const targetElement = document.querySelector("#btn-termos-condicoes");
    if (!targetElement) {
      return;
    }

    const namoradosSection = createNamoradosSection();
    targetElement.insertAdjacentElement("afterend", namoradosSection);

    const cards = document.querySelectorAll("#containerOfertasNamorados a");
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        createGTMEvent(card.className);
      });
    });
  }

  if (!isDesktop()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
