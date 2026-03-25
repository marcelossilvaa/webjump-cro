(function () {
  "use strict";

  // Early returns para performance
  if (window.personalizacaoMaquinas || window.innerWidth >= 540) {
    return;
  }

  // Constants para melhore manutenibilidade
  const CONFIG = {
    SCROLL_OFFSET: 50,
    ALLOWED_DOMAINS: ["nespresso.com"],
    SELECTORS: {
      FILTER: ".plp-category--title",
      TARGET: "nb-text-chunk[heading]",
      STICKY: "#BR-Sticky-ofertamaquinas_35offaberto",
    },
  };

  const CARDS_DATA = [
    {
      tag: "OFERTA",
      title: "Novo na Nespresso?",
      description:
        'Até <span class="maquina-card__price">45% OFF</span> na compra da sua primeira máquina e ganhe <span class="maquina-card__price">R$150</span> de desconto em cafés ',
      buttontext: "Garanta seu desconto",
      href: "https://www.nespresso.com/br/pt/promocao-cafeteira-nespresso",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44962514599966/Bubble-ABTest-Maquinas.png",
      trackingLabel: "desconto",
    },
    {
      tag: "OFERTA",
      title: "Cliente Nespresso?",
      description:
        'Compre Essenza Mini ou Vertuo Pop com até <span class="maquina-card__price">45% OFF</span>',
      buttontext: "Confira",
      image:
        "https://www.nespresso.com/ecom/medias/sys_master/public/44080333717534/DescontoMaquinasExistentes.png",
      trackingLabel: "credito",
    },
  ];

  // CSS minificado e seguro
  const CSS_STYLES =
    `
    ` +
    CONFIG.SELECTORS.STICKY +
    `{display:none}
    .maquinas-cards{display:flex;flex-direction:row;gap:13px;max-width:800px;margin:0 auto 8px;font-family:"NespressoLucas",Arial,sans-serif;padding:0 15px}
    .maquina-card{border:1px solid #e4e4e4;border-radius:2px;padding:15px;text-decoration:none;position:relative;display:block;background:#fff;flex:1;min-width:0}
    .maquina-card__content{display:flex;align-items:center;gap:15px}
    .maquina-card__image{width:80px;height:auto;object-fit:contain}
    .maquina-card__text{flex:1;min-width:0}
    .maquina-card__tag{position:absolute;top:-10px;left:0;background:#000;color:#fff;padding:1px 8px;font-size:11px;font-weight:600;text-transform:uppercase;border-radius:4px}
    .maquina-card__title{font-size:14px;color:#000;margin:0 0 4px;font-weight:600}
    .maquina-card__description{margin:0;font-size:13px;color:#666;line-height:1.1}
    .maquina-card__price{color:#000;font-weight:700}
    .maquina-card__cta{background:#fff;color:#000;border:1px solid #000;padding:2px 12px;border-radius:16px;margin-top:6px;cursor:pointer;transition:all .3s ease}
    @media screen and (min-width:541px){
      .maquina-card__cta:hover{background:#000;color:#fff}
      .maquinas-cards{margin-bottom:70px;margin-top:-38px}
    }
    @media screen and (max-width:540px){
      .maquinas-cards{flex-direction:column;max-width:350px}
    }
  `;

  // Utility functions
  const utils = {
    // Validação de URL mais segura
    isValidURL(url) {
      try {
        const urlObj = new URL(url);
        return CONFIG.ALLOWED_DOMAINS.some((domain) =>
          urlObj.hostname.endsWith(domain)
        );
      } catch {
        return false;
      }
    },

    // Criação segura de CSS
    createStyleElement() {
      const style = document.createElement("style");
      style.textContent = CSS_STYLES;
      return style;
    },

    // Cache de elementos DOM
    getDOMElements() {
      return {
        target: document.querySelector(CONFIG.SELECTORS.TARGET),
        filter: document.querySelector(CONFIG.SELECTORS.FILTER),
      };
    },

    // GTM com validação
    pushGTMEvent(eventData) {
      if (!window.gtmDataObject) {
        window.gtmDataObject = [];
      }
      window.gtmDataObject.push(eventData);
    },
  };

  function scrollToFilter() {
    const elements = utils.getDOMElements();
    if (!elements.filter) return;

    const elementPosition = elements.filter.getBoundingClientRect().top;
    const offsetPosition =
      elementPosition + window.pageYOffset - CONFIG.SCROLL_OFFSET;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  function trackCardClick(label) {
    utils.pushGTMEvent({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: `maquina-card_` + label,
    });
  }

  function createCard(data) {
    // Validação de segurança
    if (data.href && !utils.isValidURL(data.href)) {
      console.warn("URL inválida detectada:", data.href);
      return null;
    }

    if (!utils.isValidURL(data.image)) {
      console.warn("URL de imagem inválida:", data.image);
      return null;
    }

    const card = document.createElement("a");
    card.className = "maquina-card";
    if (data.href) {
      card.href = data.href;
      card.rel = "noopener"; // Segurança adicional
    }

    // Tag
    const tag = document.createElement("span");
    tag.className = "maquina-card__tag";
    tag.textContent = data.tag;

    // Content container
    const contentDiv = document.createElement("div");
    contentDiv.className = "maquina-card__content";

    // Image
    const img = document.createElement("img");
    img.className = "maquina-card__image";
    img.src = data.image;
    img.alt = data.title;
    img.loading = "lazy"; // Performance

    // Text container
    const textDiv = document.createElement("div");
    textDiv.className = "maquina-card__text";

    // Title
    const title = document.createElement("h3");
    title.className = "maquina-card__title";
    title.textContent = data.title;

    // Description
    const description = document.createElement("p");
    description.className = "maquina-card__description";

    // Lógica de descrição otimizada
    description.innerHTML = data.description;

    // CTA Button
    const ctaButton = document.createElement("button");
    ctaButton.className = "maquina-card__cta";
    ctaButton.textContent = data.buttontext;
    ctaButton.type = "button";

    // Assembly
    textDiv.append(title, description, ctaButton);
    contentDiv.append(img, textDiv);
    card.append(tag, contentDiv);

    return card;
  }

  function createMaquinasCards() {
    const container = document.createElement("div");
    container.className = "maquinas-cards";

    // Event delegation para melhor performance
    container.addEventListener("click", (event) => {
      const card = event.target.closest(".maquina-card");
      if (!card) return;

      const index = Array.from(container.children).indexOf(card);
      const cardData = CARDS_DATA[index];

      if (cardData) {
        trackCardClick(cardData.trackingLabel);
        if (index === 1) {
          // Segunda carta
          scrollToFilter();
        }
      }
    });

    // Criar cards de forma mais eficiente
    const fragment = document.createDocumentFragment();
    CARDS_DATA.forEach((cardData) => {
      const card = createCard(cardData);
      if (card) {
        fragment.appendChild(card);
      }
    });

    container.appendChild(fragment);
    return container;
  }

  function init() {
    try {
      // Adicionar CSS de forma segura
      document.head.appendChild(utils.createStyleElement());

      const elements = utils.getDOMElements();
      if (!elements.target) {
        console.warn("Elemento target não encontrado");
        return;
      }

      const maquinasCards = createMaquinasCards();
      elements.target.insertAdjacentElement("afterend", maquinasCards);

      // Marcar como inicializado
      window.personalizacaoMaquinas = true;
    } catch (error) {
      console.error("Erro na inicialização:", error);
    }
  }

  // Inicialização otimizada
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    // Use setTimeout para não bloquear o thread principal
    setTimeout(init, 0);
  }
})();
