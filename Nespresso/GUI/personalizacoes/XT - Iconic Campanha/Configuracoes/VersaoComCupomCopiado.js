(function () {
  "use strict";
  const crossSellCards = {
    // Cards para cápsulas Vertuo
    vl: [],
    ol: [
      {
        id: "GC_2025_Acquisition_OL",
        bgImage:
          "https://www.nespresso.com/ecom/medias/sys_master/public/32808468938782/subplus-lifestyle-card-v2.jpg",
        tracking: "Machine PLP - Inspiration Card - GC_2025_Acquisition",
        link: `/iconic-coffee`,
        title: "O prazer Nespresso com 10% OFF",
        description: "Comece sua jornada de café com este presente",
        svg: `<svg class="nespresso-copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>`,
        ctaText: "CAFE10OFF",
        copiedText: "COPIADO!", // Novo texto para quando o cupom for copiado
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
      <a href="${card.link}" class="cross-sell-card-bg-holder js--datatrack" 
         data-evtaction="plp cross sell card" 
         data-evtlabel="${card.tracking}" 
         style="background-image: url('${card.bgImage}'); background-position: center -120px;background-size: cover;">
      </a>
      
      <a href="${card.link}" class="cross-sell-content js--datatrack" 
         theme="custom" 
         data-evtaction="plp cross sell card" 
         data-evtlabel="${card.tracking}" 
         style="background: ${card.bgColor}; color: ${card.textColor};">
        <div class="cross-sell-content-inner justify-content-center text-center">
          <h5>${card.title}</h5>
          <p>${card.description}</p>
          
          <div class="cross-sell-cta-wrapper">
            <button class="btn btn--small btn--secondary cross-sell-cta" data-coupon="${card.ctaText}">${card.svg}<span class="cta-text">${card.ctaText}</span></button>
          </div>
        </div>
      </a>
    `;

    // Add event listener for tracking
    promoCard.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function (e) {
        console.log(`Clicked on cross-sell card: ${card.id}`);
      });
    });

    // Adicionar manipulador de eventos para o botão de cupom
    const couponButton = promoCard.querySelector(".cross-sell-cta");
    if (couponButton) {
      couponButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Obter o código do cupom
        const couponCode = this.getAttribute("data-coupon");

        // Copiar para a área de transferência
        copyToClipboard(couponCode);

        // Alterar o texto para feedback
        const textSpan = this.querySelector(".cta-text");
        if (textSpan) {
          // Salvar o texto original
          const originalText = textSpan.textContent;

          // Aplicar classe de animação e mudar o texto
          this.classList.add("copying");
          textSpan.textContent = card.copiedText;

          // Restaurar o texto original após um delay
          setTimeout(() => {
            textSpan.textContent = originalText;
            this.classList.remove("copying");
          }, 1500);
        }
      });
    }

    return promoCard;
  }

  // Função para copiar texto para a área de transferência
  function copyToClipboard(text) {
    // Criamos um elemento de textarea temporário
    const textarea = document.createElement("textarea");
    textarea.value = text;

    // Escondemos o elemento visualmente
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";

    // Adicionamos à página, selecionamos, copiamos e removemos
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      console.log("Cupom copiado com sucesso: " + text);
    } catch (err) {
      console.error("Falha ao copiar o cupom: ", err);
    }

    document.body.removeChild(textarea);
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
        font-weight: 500;
        font-size: .75rem;
        letter-spacing: .25px;
      }
      
      /* CTA Button */
      .cross-sell-cta-wrapper {
        padding-top: .5rem;
      }
      
      .btn.cross-sell-cta {
        font-weight: 500;
        font-size: .875rem;
        letter-spacing: .015625rem;
        line-height: 1.2;
        min-block-size: 2rem;
        padding: .5rem 1rem;
        color: #fff;
        background-color: #17171a;
        border-color: #17171a;
        align-items: center;
        border-radius: 62.4375rem;
        border: .0625rem solid transparent;
        box-sizing: border-box;
        cursor: pointer;
        display: inline-flex;
        flex-direction: row;
        font-family: inherit;
        gap: .5rem;
        justify-content: center;
        min-inline-size: 7.1875rem;
        text-decoration: none;
        transition-duration: .08s;
        transition-property: background-color, border-color, box-shadow, color;
        transition-timing-function: ease-in-out;
      }
      
      .nespresso-copy-icon{
        width:18px;
        height:18px;
        stroke:white;
      }
      
      .btn.cross-sell-cta:hover {
        background: #333;
      }
      
      /* Animação para o botão quando copiado */
      .btn.cross-sell-cta.copying {
        background-color:#FFF;
        border: 1px solid #17171a;
        color: #17171a;
      }
      .btn.cross-sell-cta.copying .nespresso-copy-icon{
        stroke:#17171a;
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
