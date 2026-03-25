(function () {
  if (window.novaComunicacaoParaNovosUsuarios) {
    return;
  }
  window.novaComunicacaoParaNovosUsuarios = "true";
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
  // ========== CONFIGURAÇÕES ==========
  const CONFIG = {
    titulo: "OFERTA DE BOAS-VINDAS",
    subtitulo:
      "Comece sua jornada no mundo dos cafés com uma Oferta especial <span class='strongOfferNewUsers'>Nespresso</span>. Na compra de 70 cápsulas, ganhe <span class='strongOfferNewUsers'>+10 cafés de presente e Frete Grátis</span> por nossa conta!",
    elementoAlvo: "#block-8830310864373", // Elemento após o qual inserir o componente
    imagemCafes:
      "https://www.nespresso.com/ecom/medias/sys_master/public/44611284041758/Bloco-quiz-nespresso-1150x500.jpg",
    altImagem: "Diferentes tipos de café da Nespresso",
    // Configuração dos CTAs
    ctas: [
      {
        texto: "FAÇA LOGIN E COMPRE AGORA",
        link: "https://www.nespresso.com/br/pt/secure/login?destination-redirect=%2Fbr%2Fpt%2Forder%2Fcapsules%2Foriginal&status=bruteForce",
        estiloPrimario: true, // CTA principal
        tracking: "cta_faca_login_e_compre_agora",
      },
      {
        texto: "CONHEÇA NOSSOS CAFÉS",
        link: "https://www.nespresso.com/br/pt/order/capsules/original",
        estiloPrimario: false, // CTA secundário
        tracking: "cta_conheca_nossos_cafes",
      },
    ],
  };
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "user engagement", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  function criarComunicacao() {
    // Verifica se o elemento alvo existe
    const targetElement = document.querySelector(CONFIG.elementoAlvo);
    if (!targetElement) {
      setTimeout(criarComunicacao, 2000);
      return;
    }

    // Verifica se o componente já foi criado
    if (document.getElementById("nespresso-welcome-offer")) {
      return;
    }

    // Cria o HTML dos CTAs
    let ctasHTML = "";
    for (let i = 0; i < CONFIG.ctas.length; i++) {
      const cta = CONFIG.ctas[i];
      const classeEstilo = cta.estiloPrimario ? "cta-primary" : "cta-secondary";
      ctasHTML +=
        `<a href="` +
        cta.link +
        `" class="cta-btn ` +
        classeEstilo +
        `" id="` +
        cta.tracking +
        `">
                    ` +
        cta.texto +
        `
                    <span class="cta-arrow">→</span>
                  </a>`;
    }

    // Cria o HTML do componente
    const componenteHTML =
      `
        <section id="nespresso-welcome-offer">
          <div class="offer-container">
            
            <!-- Imagem dos cafés -->
            <div class="offer-image">
              <img 
                src="` +
      CONFIG.imagemCafes +
      `" 
                alt="` +
      CONFIG.altImagem +
      `"
              />
            </div>
  
            <!-- Conteúdo de texto -->
            <div class="offer-content">
              
              <h2 class="offer-title">` +
      CONFIG.titulo +
      `</h2>
              
              <p class="offer-text">` +
      CONFIG.subtitulo +
      `</p>
              
              <!-- Container dos CTAs -->
              <div class="cta-container">
                ` +
      ctasHTML +
      `
              </div>
            </div>
          </div>
        </section>
      `;

    // Adiciona o CSS
    const cssStyles = `
        <style>
        
          #nespresso-welcome-offer {
            width: 100%;
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            box-sizing: border-box;
          }
  
          #nespresso-welcome-offer .offer-container {
            display: flex;
            align-items: center;
            border-radius: 16px;
            gap:32px;
            overflow: hidden;
            border: 1px solid #e7e7e7;
            background-color:#fff;
          }
  
          #nespresso-welcome-offer .offer-image {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
          }
  
          #nespresso-welcome-offer .offer-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px 0px 0px 8px;
          }
  
          #nespresso-welcome-offer .offer-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
  
          #nespresso-welcome-offer .offer-title {
            font-family: "NespressoLucas",Helvetica,Arial,sans-serif;
            font-size: 28px;
            font-weight: bold;
            color: #17171A;
            margin: 0 0 16px 0;
            line-height: 1.2;
            letter-spacing: 1px;
          }
  
          #nespresso-welcome-offer .offer-text {
            font-family: "NespressoLucas",Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #17171A;
            margin: 0 0 32px 0;
            line-height: 1.5;
            max-width: 400px;
          }
  
          #nespresso-welcome-offer .cta-container {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom:8px;
          }
  
          #nespresso-welcome-offer .cta-btn {
            display: inline-flex;
            align-items: center;
            text-decoration: none;
            padding: 16px;
            border-radius: 50px;
            font-family: "NespressoLucas",Helvetica,Arial,sans-serif;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            justify-content: center;
            min-width: 180px;
          }
  
          #nespresso-welcome-offer .cta-primary {
            background: #17171A;
            color: white;
          }
  
          #nespresso-welcome-offer .cta-secondary {
            background: #fff;
            color: #17171A;
            border: 1px solid #17171A;
          }
  
          #nespresso-welcome-offer .cta-arrow {
            margin-left: 8px;
            font-size: 16px;
          }
  
          /* Responsividade para tablets */
          @media (max-width: 768px) {
            #nespresso-welcome-offer {
              margin: 30px auto;
              padding: 0 16px;
            }
            
            #nespresso-welcome-offer .offer-container {
              flex-direction: column;
              min-height: auto;
            }
            
            
            #nespresso-welcome-offer .offer-content {
              text-align: center;
            }
            
            #nespresso-welcome-offer .offer-title {
              font-size: 24px;
            }
            
            #nespresso-welcome-offer .offer-text {
              max-width: none;
            }
            #nespresso-welcome-offer .offer-image img {
              border-radius: 8px 8px 0px 0px;
            }
            #nespresso-welcome-offer .cta-container {
              justify-content: center;
            }
            
            #nespresso-welcome-offer .cta-btn {
              min-width: 160px;
            }
          }
          #nespresso-welcome-offer .strongOfferNewUsers{
              font-weight: 700;
          }
          /* Responsividade para mobile */
          @media (max-width: 480px) {
            #nespresso-welcome-offer {
              margin: 20px auto;
              padding: 0 12px;
            }
            
            #nespresso-welcome-offer .offer-container {
              border-radius: 12px;
            }
            
            #nespresso-welcome-offer .offer-content {
              padding: 24px 16px 20px 16px;
            }
            
            #nespresso-welcome-offer .offer-title {
              font-size: 20px;
              margin-bottom: 12px;
            }
            
            #nespresso-welcome-offer .offer-text {
              font-size: 14px;
              margin-bottom: 24px;
            }
            
            #nespresso-welcome-offer .cta-btn {
              padding: 14px 28px;
              min-width: 140px;
            }
            
            #nespresso-welcome-offer .cta-container {
              flex-direction: column;
              align-items: center;
            }
          }
        
        #block-8831360456181,#block-8833590121973{
          display:none;
        }
        @media (min-width: 820px) and (max-width: 1129px) {
            #nespresso-welcome-offer {
              display: none !important;
            }
            #block-8831360456181{
            display:block;
        }
          }
          
        </style>
      `;

    // Insere o CSS e o componente após o elemento alvo
    targetElement.insertAdjacentHTML("afterend", cssStyles + componenteHTML);

    document
      .querySelectorAll("#nespresso-welcome-offer .cta-btn")
      .forEach(function (e) {
        e.addEventListener("click", function () {
          sendGAEvent(e.getAttribute("id"));
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", criarComunicacao);
  } else {
    criarComunicacao();
  }

  const html = `<div class="dp-CPD">
    <!---------------->
    <!-- MAIN BLOCK -->
    <h2 class="dp-CPD__title h-3xl-300"></h2>
    <ul class="dp-CPD__nav">
      <li>
        <button
          class="dp-CPD__nav-item-button dp-CPD-nav-button"
          data-techno="original"
          aria-label="Original"
          aria-pressed="true"
        >
          <img
            src="/ecom/medias/sys_master/public/35118775631902/picto-original.svg"
            alt=""
          />
          <span>Original</span>
        </button>
      </li>
      <li>
        <button
          class="dp-CPD__nav-item-button dp-CPD-nav-button"
          data-techno="vertuo"
          aria-label="Vertuo"
        >
          <img
            src="/ecom/medias/sys_master/public/35118775959582/picto-vertuo.svg"
            alt=""
          />
          <span>Vertuo</span>
        </button>
      </li>
    </ul>
    <div class="dp-CPD__caps-container">
      <div
        class="dp-CPD__caps-container-techno dp-CPD-nav-block-techno"
        data-techno="original"
      ></div>
      <div
        class="dp-CPD__caps-container-techno dp-CPD-nav-block-techno"
        data-techno="vertuo"
        hidden
      ></div>
    </div>
  
    <!------------------->
    <!-- CAPS TEMPLATE -->
    <template id="dp-CPD__caps-item-template">
      <div class="dp-CPD__carousel-slide">
        <div class="dp-CPD__caps-item">
          <div class="dp-CPD__caps-item-labels-container">{{LABELS}}</div>
          <img class="dp-CPD__caps-item-visual" alt="" loading="lazy" />
          <div class="dp-CPD__caps-item-body">
            <h3 class="dp-CPD__caps-item-name">{{NAME}}</h3>
            <p class="dp-CPD__caps-item-aroma">{{AROMA}}</p>
            <p class="dp-CPD__caps-item-intensity">{{INTENSITY}}</p>
            <div class="dp-CPD__caps-item-bottom">
              <p class="dp-CPD__caps-item-price">{{PRICE}}</p>
              <div
                class="dp-CPD__caps-item-add-to-bag cb-AddToCart"
                data-product-id="{{SKU}}"
                data-button-size="large"
                data-sales="1"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  
    <!------------------------>
    <!-- CARROUSEL TEMPLATE -->
    <template id="dp-CPD-carrousel-template">
      <div class="dp-CPD__carousel">
        <div class="dp-CPD__carousel-inner">
          <div class="dp-CPD__carousel-arrows-container">
            <div class="dp-CPD__carousel-arrows-container-inner">
              <button class="dp-CPD__carousel-arrow prev">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-label="{{ARROW_LABEL_PREV}}"
                  >
                    <path d="M15.2 5h-1.4l-7 7 7 7h1.4l-7-7 7-7Z"></path>
                  </svg>
                </span>
              </button>
              <button class="dp-CPD__carousel-arrow next">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-label="{{ARROW_LABEL_NEXT}}"
                  >
                    <path
                      d="M9.21 5H7.8l6.99 7-6.99 7h1.41l6.99-7-6.99-7Z"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <div class="dp-CPD__carousel-slides" is-hided="true">
            <div class="dp-CPD__carousel-slide dp-CPD__carousel-spacer">
              <div class="dp-CPD__visual-item">
                <img alt="" loading="lazy" />
              </div>
            </div>
            {{SLIDES}}
          </div>
  
          <div class="dp-CPD__carousel-dots"></div>
        </div>
      </div>
    </template>
  </div>`;
  const style = `<style>
    .dp-CPD {
      color: #17171a;
      font-family: "NespressoLucas", "Lucas", Helvetica, Arial, sans-serif;
      font-weight: 400;
      width: 100%;
      padding-top: 60px;
      padding-bottom: 20px;
    }
  
    .dp-CPD * {
      box-sizing: border-box;
    }
  
    .dp-CPD__title {
      text-align: center;
      font-weight: 300;
      font-size: 3rem;
      letter-spacing: 0.0625rem;
      line-height: 1.2;
      margin-bottom: 0.5rem;
      padding-inline: 1.5rem;
    }
  
    .dp-CPD__nav {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 1.5rem;
    }
  
    .dp-CPD__nav li {
      max-width: 326px;
      width: 100%;
    }
  
    .dp-CPD__nav-item-button {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
  
    .dp-CPD-nav-button {
      position: relative;
      flex-grow: 1;
      width: 100%;
      padding-bottom: 25px;
      border-bottom: solid 1px #000;
    }
  
    .dp-CPD-nav-button::before,
    .dp-CPD-nav-button::after {
      content: "";
      display: block;
      position: absolute;
      bottom: -1px;
      width: 0;
      height: 0;
    }
  
    .dp-CPD-nav-button::before {
      left: 0;
      border-bottom: 3px solid #ae8c4a;
      transition: 0.3s width;
    }
  
    .dp-CPD-nav-button[data-techno="vertuo"]::before {
      left: auto;
      right: 0;
    }
  
    .dp-CPD-nav-button::after {
      left: calc(50% + 30px);
      transform: translateX(-50%);
      border-right: 0 solid transparent;
      border-bottom: 0 solid #ae8c4a;
      border-left: 0 solid transparent;
      border-radius: 1px;
      transition: 0.3s;
    }
  
    .dp-CPD-nav-button:hover,
    .dp-CPD-nav-button[aria-pressed="true"]::before {
      width: 100%;
    }
  
    .dp-CPD-nav-button[aria-pressed="true"] span,
    .dp-CPD-nav-button:hover span {
      font-weight: 700;
    }
  
    .dp-CPD-nav-button[aria-pressed="true"]::after {
      border-right: 10px solid transparent;
      border-bottom: 20px solid #ae8c4a;
      border-left: 10px solid transparent;
      left: 50%;
    }
  
    .dp-CPD-nav-button[data-techno="original"]::after {
      left: calc(50% - 30px);
    }
  
    .dark-overlay {
      opacity: 0.5;
    }
  
    .dp-CPD-nav-button[aria-pressed="true"][data-techno="original"]::after {
      left: 50%;
    }
  
    .dp-CPD__nav-item-button img {
      height: 52px;
    }
  
    .dp-CPD__nav-item-button[data-techno="vertuo"] img {
      width: 61px;
    }
  
    .dp-CPD__nav-item-button[data-techno="original"] img {
      width: 42px;
    }
  
    .dp-CPD__nav-item-button span {
      font-weight: 500;
      font-size: 16px;
      line-height: 100%;
      text-align: center;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #000000;
      margin-top: 15px;
      transition: font-weight 0.3s;
    }
  
    .dp-CPD__caps-item {
      width: 248px;
      text-align: center;
      position: relative;
      background: #ffffff;
      box-shadow: 0 0 8px #17171a0d, 0 2px 8px #17171a14;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      text-align: center;
      color: #17171a;
      padding-top: 0.5rem;
      border-radius: 16px;
    }
  
    .dp-CPD__visual-item {
      width: 288px;
      padding-inline: 20px;
    }
  
    .dp-CPD__visual-item img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
    }
  
    .dp-CPD__caps-item-body {
      padding: 8px 32px 32px;
      width: 100%;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  
    .dp-CPD__caps-item-name {
      font-weight: 700;
      font-size: 24px;
      line-height: 120%;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
  
    .dp-CPD__caps-item-aroma {
      font-size: 16px;
      line-height: 120%;
      letter-spacing: 0.25px;
      margin-bottom: 8px;
    }
  
    .dp-CPD__caps-item-intensity {
      font-size: 14px;
      line-height: 120%;
      letter-spacing: 0.25px;
      margin-block: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2px;
      font-weight: 700;
      color: #876c43;
    }
  
    .dp-CPD__caps-item-intensity span[label] {
      font-weight: 400;
    }
  
    .dp-CPD__caps-item-intensity span[dp-caps-intensity] {
      width: 2px;
      height: 10px;
      background-color: #876c43;
      opacity: 0.25;
    }
  
    .dp-CPD__caps-item-intensity span[dp-caps-intensity][active] {
      opacity: 1;
    }
  
    .dp-CPD__caps-item-price {
      color: #257a57;
      margin-bottom: 16px;
      font-size: 20px;
      line-height: 120%;
      font-weight: 700;
      margin-top: 12px;
    }
  
    .dp-CPD__caps-item-bottom {
      margin-top: auto;
    }
  
    .dp-CPD__caps-container-techno {
      display: flex;
      justify-content: center;
      gap: 50px;
      flex-wrap: wrap;
    }
  
    .dp-CPD__caps-container-techno[hidden] {
      display: none;
    }
  
    .dp-CPD__caps-item-visual {
      display: block;
      object-fit: contain;
      aspect-ratio: 16 / 9;
      width: 100%;
    }
  
    .dp-CPD__caps-container {
      margin-top: 40px;
    }
  
    .dp-CPD__caps-item-add-to-bag {
      margin-top: auto;
    }
  
    @media screen and (max-width: 767px) {
      .dp-CPD {
        padding-block: 50px;
      }
  
      .dp-CPD__title {
        font-size: 2.25rem;
      }
    }
  
    /***************/
    /** CARROUSEL **/
    /***************/
  
    .dp-CPD__carousel {
      position: relative;
      width: 100%;
      margin: 0 auto;
      overflow: visible;
      display: flex;
      justify-content: center;
    }
  
    .dp-CPD__carousel-inner {
      position: relative;
      width: 100%;
    }
  
    .dp-CPD__carousel-inner::before,
    .dp-CPD__carousel-inner::after {
      content: "";
      display: block;
      height: 100%;
      pointer-events: none;
      width: calc((100vw - 1180px) / 2);
      position: absolute;
      top: 0;
      z-index: 1;
      transition: opacity 0.3s;
    }
  
    .dp-CPD__carousel-inner[hided-overlay]::before,
    .dp-CPD__carousel-inner[hided-overlay]::after {
      opacity: 0;
    }
  
    .dp-CPD__carousel-inner::before {
      left: 0;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.5) 80%,
        rgba(255, 255, 255, 0)
      );
    }
  
    .dp-CPD__carousel-inner::after {
      right: 0;
      background: linear-gradient(
        to left,
        rgba(255, 255, 255, 0.5) 80%,
        rgba(255, 255, 255, 0)
      );
    }
  
    .dp-CPD__carousel-arrow {
      background: #17171a;
      color: #fff;
      border: none;
      cursor: pointer;
      pointer-events: all;
      display: none;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
    }
  
    .dp-CPD__carousel-arrow > span {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .dp-CPD__carousel-arrows-container {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      pointer-events: none;
      width: 100%;
    }
  
    .dp-CPD__carousel-arrows-container-inner {
      max-width: 1160px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .dp-CPD__carousel-arrow.prev {
      margin-right: auto;
    }
  
    .dp-CPD__carousel-arrow.next {
      margin-left: auto;
    }
  
    .dp-CPD__carousel-slides {
      display: flex;
      overflow-x: auto;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      width: 100%;
      scrollbar-width: none;
      -ms-overflow-style: none;
      transition: opacity 0.3s;
      padding-block: 20px;
    }
  
    .dp-CPD__carousel-slides[is-hided="true"] {
      opacity: 0;
    }
  
    .dp-CPD__carousel-slides::-webkit-scrollbar {
      display: none;
    }
  
    .dp-CPD__carousel-slide {
      flex: 0 0 auto;
      scroll-snap-align: start;
      transition: opacity 0.3s;
      display: inline-flex;
      padding-inline: 20px;
    }
  
    .dp-CPD__nav {
      padding-top: 1rem;
    }
  
    .dp-CPD__carousel-dots {
      text-align: center;
      padding: 15px 0;
    }
  
    .dp-CPD__carousel-dot[is-active="true"] {
      opacity: 1;
    }
  
    .dp-CPD__carousel-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: #17171a;
      border-radius: 50%;
      margin: 0 5px;
      cursor: pointer;
      transition: opacity 0.3s;
      opacity: 0.5;
    }
  
    .dp-CPD__caps-item-labels-container {
      display: flex;
      flex-direction: column;
      top: 0.5rem;
      left: 0;
      position: absolute;
      justify-content: flex-start;
      gap: 0.125rem;
    }
  
    .dp-CPD__caps-item-labels-container > span {
      font-weight: 500;
      font-size: 0.625rem;
      letter-spacing: 0.0625rem;
      line-height: 1.2;
      text-transform: uppercase;
      display: table;
      min-height: 1rem;
      padding: 0.125rem 0.5rem 0;
    }
  
    @media (min-width: 768px) {
      .dp-CPD__carousel-slides {
        scroll-padding: calc((100vw - 1180px) / 2);
        padding-inline: calc((100vw - 1180px) / 2);
      }
    }
  
    @media (max-width: 767px) {
      .dp-CPD__carousel-slide {
        padding-inline: 10px;
      }
  
      .dp-CPD__carousel-slides {
        scroll-padding: calc((100vw - 268px) / 2);
        padding-inline: calc((100vw - 268px) / 2);
      }
    }
  </style>`;

  if (!document.querySelector("#nespresso-welcome-offer")) {
    return;
  }
  document
    .querySelector("#nespresso-welcome-offer")
    .insertAdjacentHTML("afterend", style + html);
  const DP_CARROUSEL_DATA = {
    title: {
      en: "Nothing tastes like Nespresso coffee",
      pt: "Nada é igual ao Café Nespresso",
      nl: "Niets smaakt zoals een Nespresso koffie",
    },
    arrowLabel: {
      prev: {
        en: "Previous product",
        pt: "Produto anterior",
        nl: "Vorig product",
      },
      next: {
        en: "Next product",
        pt: "Próximo produto",
        nl: "Volgende product",
      },
    },
    intensity: { en: "Intensity", pt: "Intensidade", nl: "Intensiteit" },
    caps: {
      original: [
        "7866.90",
        "7861.90",
        "7855.90",
        "7860.90",
        "7889.90",
        "7893.90",
      ],
      vertuo: [
        "7288.10",
        "7048.80",
        "7047.80",
        "7044.80",
        "7292.80",
        "7069.80",
        "7039.80",
        "7043.80",
        "7038.80",
      ],
    },
    visual: {
      original: {
        en: "/ecom/medias/sys_master/public/34732473319454/NES-13750-Card-Desktop-2-624x890.jpg",
        pt: "/ecom/medias/sys_master/public/34732473319454/NES-13750-Card-Desktop-2-624x890.jpg",
        nl: "/ecom/medias/sys_master/public/34732473319454/NES-13750-Card-Desktop-2-624x890.jpg",
      },
      vertuo: {
        en: "/ecom/medias/sys_master/public/34732473319454/NES-13750-Card-Desktop-2-624x890.jpg",
        pt: "/ecom/medias/sys_master/public/34732473319454/NES-13750-Card-Desktop-2-624x890.jpg",
        nl: "/ecom/medias/sys_master/public/34732473319454/NES-13750-Card-Desktop-2-624x890.jpg",
      },
    },
  };

  const DP_CARROUSEL_PRODUCTS = {
    previousWidth: null,
    injectTitle: function () {
      const lang = padl.page.pageInfo.language;
      const title = DP_CARROUSEL_DATA.title[lang];
      $(".dp-CPD__title").html(title);
    },
    getCapsIntensityHTML: function (intensity) {
      const intensityMax = 12;
      const intensityFilled = new Array(intensity).fill(
        "<span dp-caps-intensity active></span>"
      );
      const intensityNb = "<span dp-caps-intensity-nb>" + intensity + "</span>";
      const intensityUnfilled = new Array(intensityMax - intensity).fill(
        "<span dp-caps-intensity></span>"
      );
      return [...intensityFilled, intensityNb, ...intensityUnfilled];
    },
    getFormattedPrice: async function (totalPrice) {
      const price = await window.napi.priceFormat();
      const currency = window[config.padl.namespace].dataLayer.app.app.currency;
      const formattedPrice = price.short(currency, totalPrice);
      return formattedPrice;
    },
    getCapsHTML: async function (capsData) {
      if (!capsData) return "";
      const lang = padl.page.pageInfo.language;
      const intensity = capsData?.capsuleProperties?.intensity;
      const intensityLabel = DP_CARROUSEL_DATA.intensity[lang];
      const intensityHtml = intensity
        ? this.getCapsIntensityHTML(intensity)
        : [];
      const formattedPrice = await this.getFormattedPrice(capsData.price);
      const image = capsData.responsiveImages.standard;

      let template = $("#dp-CPD__caps-item-template").html();
      template = template.replace("{{NAME}}", capsData.name);
      template = template.replace("{{AROMA}}", capsData.headline || "");
      template = template.replace(
        "{{INTENSITY}}",
        `<span label>${intensityLabel}</span> ${intensityHtml.join("")}`
      );
      template = template.replace("{{PRICE}}", formattedPrice);
      template = template.replace("{{SKU}}", capsData.internationalId);

      if (capsData.highlightLabels?.length) {
        const labelsListHTML = capsData.highlightLabels.map(
          ({ backgroundColor, text, textColor }) =>
            `<span style="background-color: ${backgroundColor}; color: ${textColor}">${text}</span>`
        );
        template = template.replace("{{LABELS}}", labelsListHTML.join(""));
      }

      const $template = $(template);

      $template.find(".dp-CPD__caps-item-visual").attr("src", image);

      if (!intensity) {
        $template.find(".dp-CPD__caps-item-intensity").remove();
      }

      if (!capsData.headline) {
        $template.find(".dp-CPD__caps-item-headline").remove();
      }

      if (!capsData.highlightLabels?.length) {
        $template.find(".dp-CPD__caps-item-labels-container").remove();
      }

      return $template[0].outerHTML;
    },
    getProductData: async function (sku) {
      try {
        return await napi.catalog().getProduct(sku);
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    injectCaps: async function () {
      const _this = this;
      const promises = [];
      const lang = padl.page.pageInfo.language;

      $(".dp-CPD__caps-container-techno").each(function () {
        const promise = (async () => {
          const $this = $(this);
          const dataTechno = $this.attr("data-techno");
          const capsList = DP_CARROUSEL_DATA.caps[dataTechno];

          if (!capsList?.length) return;

          const capsDataList = await Promise.all(
            capsList.map(async function (sku) {
              const fetchedProductData = await _this.getProductData(sku);
              return _this.getCapsHTML(fetchedProductData);
            })
          );

          let carrouselTemplate = $("#dp-CPD-carrousel-template").html();
          carrouselTemplate = carrouselTemplate.replace(
            "{{SLIDES}}",
            capsDataList.join("")
          );
          carrouselTemplate = carrouselTemplate.replace(
            "{{ARROW_LABEL_PREV}}",
            DP_CARROUSEL_DATA.arrowLabel.prev[lang]
          );
          carrouselTemplate = carrouselTemplate.replace(
            "{{ARROW_LABEL_NEXT}}",
            DP_CARROUSEL_DATA.arrowLabel.next[lang]
          );
          $this.append(carrouselTemplate);

          $this.find(".dp-CPD__caps-item-add-to-bag").each(function () {
            _this.createAddToBagBtn($(this));
          });

          $(this)
            .find(".dp-CPD__visual-item img")
            .attr("src", DP_CARROUSEL_DATA.visual[dataTechno][lang]);
        })();

        promises.push(promise);
      });

      await Promise.all(promises);

      this.onSliderScrollAction();
      this.initSliderDots();
      this.onClickArrow();

      $(".dp-CPD__carousel-slides").removeAttr("is-hided");
    },
    onClickArrow: function () {
      $(".dp-CPD__carousel-arrow").on("click", function () {
        const $container = $(this).closest(".dp-CPD__carousel");
        const $slidesContainer = $container.find(".dp-CPD__carousel-slides");
        const $slides = $container.find(".dp-CPD__carousel-slide");
        const currentScrollLeft = $slidesContainer.scrollLeft();
        const isRight = $(this).hasClass("next");
        const slideWidth = $slides.first().outerWidth();
        const currentIndex = Math.round(currentScrollLeft / slideWidth);

        let targetIndex = isRight ? currentIndex + 1 : currentIndex - 1;
        targetIndex = Math.max(0, targetIndex);
        targetIndex = Math.min($slides.length - 1, targetIndex);

        const targetScroll = targetIndex * slideWidth;
        $slidesContainer.scrollLeft(targetScroll);
      });
    },
    debounce: function (func, wait, immediate) {
      let timeout;
      return function (...args) {
        const context = this;
        const later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    throttle: function (func, limit) {
      let lastFunc;
      let lastRan;
      return function (...args) {
        const context = this;
        if (!lastRan) {
          func.apply(context, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function () {
            if (Date.now() - lastRan >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    },
    onSliderScrollAction: function () {
      const offset = 20;
      $(".dp-CPD__carousel-slides").on(
        "scroll",
        this.throttle(function () {
          const $container = $(this).closest(".dp-CPD__carousel");
          const scrollLeft = $(this).scrollLeft();
          const scrollWidth = $(this)[0].scrollWidth;
          const containerWidth = $(this).innerWidth();
          const $arrowPrev = $container.find(".dp-CPD__carousel-arrow.prev");
          const $arrowNext = $container.find(".dp-CPD__carousel-arrow.next");

          const computedStyle = window.getComputedStyle(this);
          const scrollPaddingRight =
            parseFloat(
              computedStyle.getPropertyValue("scroll-padding-right")
            ) || 0;

          const stops = $container.data("carouselStops") || [];
          let currentDotIndex = 0;
          let minDiff = Infinity;
          stops.forEach((stop, index) => {
            const diff = Math.abs(scrollLeft - stop);
            if (diff < minDiff) {
              minDiff = diff;
              currentDotIndex = index;
            }
          });

          if (
            scrollLeft + containerWidth + scrollPaddingRight >=
            scrollWidth - offset
          ) {
            currentDotIndex = stops.length - 1;

            $(".dp-CPD__carousel-inner").attr("hided-overlay", true);
          } else {
            $(".dp-CPD__carousel-inner").removeAttr("hided-overlay");
          }

          $container.find(".dp-CPD__carousel-dot").removeAttr("is-active");
          $container
            .find(
              `.dp-CPD__carousel-dot[data-slide-index="${currentDotIndex}"]`
            )
            .attr("is-active", true);

          if (scrollLeft < offset) {
            $arrowPrev.hide();
          } else {
            $arrowPrev.show();
          }
          if (
            scrollLeft + containerWidth + scrollPaddingRight >=
            scrollWidth - offset
          ) {
            $arrowNext.hide();
          } else {
            $arrowNext.show();
          }
        }, 200)
      );
    },

    initDots: function ($container) {
      const $scrollContainer = $container.find(".dp-CPD__carousel-slides");
      const $slides = $container.find(".dp-CPD__carousel-slide");

      const slideWidth = $slides.first().outerWidth();
      const totalWidth = slideWidth * $slides.length;
      const containerWidth = $scrollContainer[0].clientWidth;

      let stops = [];

      for (let i = 0; i < $slides.length; i++) {
        let offset = i * slideWidth;
        if (totalWidth > containerWidth) {
          offset = Math.min(offset, totalWidth - containerWidth);
        }
        stops.push(offset);
      }

      const dots = stops.map(
        (stop, index) =>
          `<button class="dp-CPD__carousel-dot" data-slide-index="${index}"></button>`
      );
      $container.find(".dp-CPD__carousel-dots").html(dots.join(""));
      $container.data("carouselStops", stops);

      setTimeout(() => $scrollContainer.trigger("scroll"), 500);
    },
    initDots: function ($container) {
      const $scrollContainer = $container.find(".dp-CPD__carousel-slides");
      const $slides = $container.find(".dp-CPD__carousel-slide");

      const slideWidth = $slides.first().outerWidth();
      const totalWidth = slideWidth * $slides.length;
      const containerWidth = $scrollContainer[0].clientWidth;

      let stops = [];

      if (totalWidth <= containerWidth) {
        stops = [0];
      } else {
        for (let i = 0; i < $slides.length; i++) {
          let offset = i * slideWidth;
          let capped = Math.min(offset, totalWidth - containerWidth);
          stops.push(capped);
          if (capped === totalWidth - containerWidth) {
            break;
          }
        }
      }

      const dots = stops.map(
        (stop, index) =>
          `<button class="dp-CPD__carousel-dot" data-slide-index="${index}"></button>`
      );
      $container.find(".dp-CPD__carousel-dots").html(dots.join(""));
      $container.data("carouselStops", stops);

      setTimeout(() => $scrollContainer.trigger("scroll"), 500);
    },

    handleFirstSlideDisplay: function ($container) {
      const isMobile = window.innerWidth < 768;
      const $slidesContainer = $container.find(".dp-CPD__carousel-slides");

      if (isMobile) {
        if (!$container.data("detachedFirstSlide")) {
          const $firstSlide = $container
            .find(".dp-CPD__carousel-spacer")
            .first()
            .detach();
          $container.data("detachedFirstSlide", $firstSlide);
        }
      } else {
        const $detachedFirstSlide = $container.data("detachedFirstSlide");
        if (
          $detachedFirstSlide &&
          !$container.find(".dp-CPD__carousel-spacer").length
        ) {
          $slidesContainer.prepend($detachedFirstSlide);
          $container.removeData("detachedFirstSlide");
        }
      }
    },
    initSliderDots: function () {
      const _this = this;

      $(".dp-CPD__carousel").each(function () {
        const $container = $(this);
        _this.handleFirstSlideDisplay($container);
        _this.initDots($container);
        _this.onClickDotsSlider($container);
      });

      this.previousWidth = window.innerWidth;

      function handleResize() {
        const currentWidth = window.innerWidth;

        if (currentWidth !== _this.previousWidth) {
          _this.previousWidth = currentWidth;

          $(".dp-CPD__carousel").each(function () {
            const $container = $(this);
            _this.handleFirstSlideDisplay($container);
            _this.initDots($container);
          });
        }
      }

      window.addEventListener("resize", this.debounce(handleResize, 250));
    },
    onClickDotsSlider: function ($container) {
      $container.on("click", ".dp-CPD__carousel-dot", function () {
        const dotIndex = +$(this).attr("data-slide-index");
        const $slidesContainer = $container.find(".dp-CPD__carousel-slides");
        const $slides = $container.find(".dp-CPD__carousel-slide");

        let offsets = [];
        let sum = 0;
        $slides.each(function (index, slide) {
          offsets.push(sum);
          sum += $(slide).outerWidth();
        });

        const isLastDot = !$(this).next(".dp-CPD__carousel-dot")?.length;

        let targetScroll = offsets[dotIndex];

        if (isLastDot) {
          targetScroll = offsets[dotIndex + 1] || offsets[dotIndex];
        }

        $slidesContainer.scrollLeft(targetScroll);
      });
    },
    setSelectedTechno: function (dataTechno) {
      const _this = this;
      $(".dp-CPD-nav-button[data-techno='" + dataTechno + "']").attr(
        "aria-pressed",
        true
      );
      $(".dp-CPD-nav-button:not([data-techno='" + dataTechno + "'])").attr(
        "aria-pressed",
        false
      );
      $(
        ".dp-CPD-nav-block-techno:not([data-techno='" + dataTechno + "'])"
      ).fadeOut(200, function () {
        $(this).attr("hidden", "hidden");
        $(".dp-CPD-nav-block-techno[data-techno='" + dataTechno + "']").fadeIn(
          200,
          function () {
            $(this).removeAttr("hidden");

            const $displayedContainer = $(this).find(".dp-CPD__carousel");
            _this.initDots($displayedContainer);
          }
        );
      });
    },
    createAddToBagBtn: function ($addToBag) {
      const sku = $addToBag.attr("data-product-id");
      const buttonSize = $addToBag.attr("data-button-size");
      const buttonId = "dp_caps_BTN_" + sku;
      const dataSales = +$addToBag.attr("data-sales") || 0;

      $addToBag.attr("id", buttonId);

      window.napi
        .getConfig()
        .then(function () {
          window.ui = window.ui || [];
          window.ui.push({
            id: buttonId,
            module: "AddToBagButton",
            configuration: {
              props: {
                productId: sku,
                buttonSize,
                dataSales,
              },
            },
            ecommerceData: {
              activated: true,
            },
          });
        })
        .catch(function (e) {
          console.log(e);
        });
    },
    onClickTechnoButton: function () {
      const _this = this;
      $(".dp-CPD-nav-button").on("click", function () {
        const dataTechno = $(this).attr("data-techno");
        _this.setSelectedTechno(dataTechno);
      });
    },
    init: function () {
      this.injectTitle();
      this.injectCaps();
      this.onClickTechnoButton();
    },
  };

  $(document).ready(function () {
    DP_CARROUSEL_PRODUCTS.init();
  });
})();
