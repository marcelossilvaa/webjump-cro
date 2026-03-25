(function () {
  "use strict";
  const crossSellCards = {
    // Cards para cápsulas Vertuo
    vl: [],
    ol: [
      {
        id: "GC_2025_Acquisition_OL",
        bgImage:
          "https://www.nespresso.com/ecom/medias/sys_master/public/44860220080158/etag-350x480-N3-N4-N5.png?attachment=true&cimgnr=zNgkK",
        tracking: "Machine PLP - Inspiration Card - GC_2025_Acquisition",
        link: "",
        title: "Primeira compra em Nespresso?",
        description:
          "Ganhe <br><span class='boldConditionsCardBetween'>10 cafés</span> <span class='boldConditionsCardBetween'>Arpeggio</span> ou <span class='boldConditionsCardBetween'>Altissio</span> + <span class='boldConditionsCardBetween'>Frete Grátis</span><br><span class='conditionsCardProsp'>em compras a partir de 70 cafés</span>",
        bgColor: "#fff", // Verde claro como no exemplo
        textColor: "#17171a", // Texto escuro como no exemplo
      },
    ],
  };

  let currentPLP = "";

  const currentLocation = window.location.href;

  if (
    window.padl &&
    window.padl.page &&
    window.padl.page.pageInfo &&
    window.padl.page.pageInfo.pageName == "capsules pdp_plp"
  ) {
    if (currentLocation.includes("original")) {
      currentPLP = "ol";
    } else if (currentLocation.includes("vertuo")) {
      currentPLP = "vl";
    }
    if (currentPLP) {
      createCrossSellCards();
    }
  }

  function createCrossSellCards() {
    // Get all category sections with the collection-grid class
    const categorySections = document.querySelectorAll(
      "section.collection-grid"
    );

    // Get card template for the current PLP
    const cardTemplate = crossSellCards[currentPLP][0];

    // Check if we have sections to work with
    if (categorySections.length === 0) {
      console.log("No category sections found");
      return;
    }

    // Add custom styling for cross-sell cards
    addCrossSellStyles();

    // Limitamos a inserção apenas para as duas primeiras categorias
    const maxCategories = Math.min(3, categorySections.length);

    // Loop apenas pelas duas primeiras categorias
    for (let sectionIndex = 0; sectionIndex < maxCategories; sectionIndex++) {
      const section = categorySections[sectionIndex];

      // Get all article elements in this section
      const articles = section.querySelectorAll("article");

      // Skip if section has no articles
      if (articles.length === 0) {
        continue;
      }

      // Verificamos se o card já foi adicionado a esta seção
      if (section.querySelector(".cross-sell-card-wrapper")) {
        console.log(`Card já existente na seção ${sectionIndex}, pulando.`);
        continue;
      }

      // Determine insertion position - escolhemos uma posição sensata para cada seção
      // Para primeira seção, inserimos após o terceiro item (se existir)
      // Para segunda seção, inserimos após o segundo item (se existir)
      let insertPosition;

      // Use modulo to alternate between insertion strategies
      if (sectionIndex % 2 === 0 && articles.length > 1) {
        // Even sections: Insert at penultimate position
        insertPosition = articles.length - 1;
      } else if (articles.length >= 3) {
        // Odd sections with 3+ articles: Insert at position 3
        insertPosition = 2; // 0-based index
      } else if (articles.length > 0) {
        // Odd sections with fewer than 3 articles: Insert at the end
        insertPosition = articles.length - 1;
      }

      // Create a unique ID for this instance of the card
      const uniqueCardId = `${cardTemplate.id}_section_${sectionIndex}`;

      // Create the card with this section's unique ID
      const cardData = {
        ...cardTemplate,
        id: uniqueCardId,
      };

      // Create the cross-sell card element
      const crossSellElement = createCrossSellElement(cardData);

      // Insert the card after the determined position
      if (
        insertPosition !== undefined &&
        insertPosition >= 0 &&
        articles[insertPosition]
      ) {
        articles[insertPosition].insertAdjacentElement(
          "afterend",
          crossSellElement
        );
        console.log(
          `Card inserido com sucesso na seção ${sectionIndex}, após o item ${insertPosition}`
        );
      }
    }
  }

  function createCrossSellElement(card) {
    // Create promotional card div that matches the Malaysia example
    const promoCard = document.createElement("div");
    promoCard.id = card.id;
    promoCard.className = "cross-sell-card-wrapper card-style-default";
    promoCard.setAttribute("data-track", card.tracking);

    // Create HTML structure matching the Malaysia example
    promoCard.innerHTML = `
      <div class="cross-sell-card-bg-holder js--datatrack" 
         data-evtaction="plp cross sell card" 
         data-evtlabel="${card.tracking}" 
         style="background-image: url('${card.bgImage}'); background-position: center 0px;background-size: cover;">
      </div>
      
      <div class="cross-sell-content js--datatrack" 
         theme="custom" 
         data-evtaction="plp cross sell card" 
         data-evtlabel="${card.tracking}" 
         style="background: ${card.bgColor}; color: ${card.textColor};">
        <div class="cross-sell-content-inner justify-content-center text-center">
          <h5>${card.title}</h5>
          <p>${card.description}</p>
        </div>
      </div>
    `;

    // Add event listener for tracking
    promoCard.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function (e) {
        console.log(`Clicked on cross-sell card: ${card.id}`);
      });
    });
    return promoCard;
  }

  function addCrossSellStyles() {
    // Check if styles are already added
    if (document.getElementById("cross-sell-styles")) {
      return;
    }

    // Create style element
    const styles = document.createElement("style");
    styles.id = "cross-sell-styles";

    // Add custom CSS matching the Malaysia example
    styles.textContent = `
      /* Main card container */
      .cross-sell-card-wrapper {
        border: 1px solid #e7e7e7;
        border-radius: 1rem;
        box-shadow: none;
        display: contents;
        position: relative;
      }
      
      .cross-sell-card-wrapper:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      /* Background image holder */
      .cross-sell-card-bg-holder {
        grid-row-end: span 4;
        border-radius: 1rem 1rem 0 0;
        border-width: 1px 1px 0 1px;
        border-style: solid;
        border-color: #e7e7e7;
        min-height: 230px;
      }
      
      /* Content area */
      .cross-sell-content {
        grid-row-start: span 3 !important;
        border-width: 0 1px 1px 1px;
        border-style: solid;
        border-color: #e7e7e7;
        border-radius: 0 0 1rem 1rem;
        position: relative;
      }
      
      /* Content inner container */
      .cross-sell-content-inner {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: .75rem 1rem;
        justify-content: center;
        text-align:center;
      }
      
      /* Typography */
      .cross-sell-content h5 {
        margin-bottom: 2px;
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: .25px;
      }
      
      .cross-sell-content p {
        font-size: .75rem;
        letter-spacing: .25px;
      }
      

      
      
      
      .nespresso-copy-icon{
        width:18px;
        height:18px;
        stroke:white;
      }
      
      .boldConditionsCardBetween{
        font-weight:600;
      }
      
      .btn.cross-sell-cta.copying .nespresso-copy-icon{
        stroke:#17171a;
      }
     
      .conditionsCardProsp{
        text-align:left;
      }
      
      /* Animação para o texto de confirmação */
      .cta-text {
        transition: opacity 0.2s ease-in-out;
      }
      
      .copying .cta-text {
        animation: fadeInOut 1.5s;
      }
      
      @keyframes fadeInOut {
        0% {
          opacity: 0;
        }
        20% {
          opacity: 1;
        }
        80% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
    `;

    // Add styles to document head
    document.head.appendChild(styles);
  }

  // Execute on DOMContentLoaded for testing if not already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (currentPLP) {
        createCrossSellCards();
      }
    });
  } else if (currentPLP) {
    // If DOM is already loaded, run immediately
    setTimeout(createCrossSellCards, 500);
  }
})();
