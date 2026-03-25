(function () {
  "use strict";
  if (window.comunicacaoSliderHorizontal) return;
  window.comunicacaoSliderHorizontal = true;
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

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "comunicacao-app-day", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  // Configurações
  const MAX_ATTEMPTS = 20; // Número máximo de tentativas
  const INTERVAL_TIME = 500; // Intervalo em milissegundos (500ms = 0.5s)
  const ELEMENT_SELECTOR = "main"; // Seletor do elemento a ser buscado
  const APP_DEEPLINK_URL = "https://nespresso.go.link?adj_t=1nca0syu";

  let attempts = 0;
  let intervalId = null;

  function createSlider() {
    // Mensagens de benefícios
    // Cada mensagem pode ter um objeto com 'text', 'link' (opcional), 'icon' (opcional) e 'modal' (opcional)
    // Se tiver link, o texto terá underline automaticamente
    // Se tiver icon, será exibido antes do texto (pode ser emoji, HTML, SVG, etc.)
    // Se tiver modal, deve conter 'title' e 'text' - ao clicar na mensagem, abrirá o modal
    const messages = [
      {
        text: "<strong>APP DAY:</strong> Ganhe <span style='font-size:20px; font-weight:bold'>+5% OFF ADICIONAL* </span>às ofertas de café.",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M15.7 3H3v12.7l15.5 15.5 12.7-12.7zM4 15.3V4h11.3l14.5 14.5-11.3 11.3z"/><path d="m17.98 11-3 12h1.04l3-12zM12.5 12c-.93 0-2.5.39-2.5 3s1.57 3 2.5 3 2.5-.39 2.5-3-1.57-3-2.5-3m0 5c-.64 0-1.5-.2-1.5-2s.86-2 1.5-2 1.5.2 1.5 2-.86 2-1.5 2M21.5 16c-.93 0-2.5.39-2.5 3s1.57 3 2.5 3 2.5-.39 2.5-3-1.57-3-2.5-3m0 5c-.64 0-1.5-.2-1.5-2s.86-2 1.5-2 1.5.2 1.5 2-.86 2-1.5 2M6.5 7.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"/></svg>`,
      },
      {
        text: "<strong>CLIQUE AQUI E <span style='text-decoration:underline'>BAIXE AGORA!</span></strong>",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M22.5 2h-13C8.9 2 7 2 7 4v24c0 2 1.9 2 2.5 2h13c.6 0 2.5 0 2.5-2V4c0-2-1.9-2-2.5-2M24 28c0 .5 0 1-1.5 1h-13C8 29 8 28.5 8 28V4c0-.5 0-1 1.5-1h13C24 3 24 3.5 24 4z"/><path d="M18 4h-4v1h4zM16.5 27h-1v1h1z"/></svg>`,
        modal: {
          title: "Baixe nosso App",
          text: `<div class="app-install-modal-content"><div class="app-install-modal-banner"></div><div class="app-install-modal-grid"><div class="app-install-modal-item"><img src="https://www.nespresso.com/ecom/medias/sys_master/public/44610527035422/Printed-global-ios-320x320.png" alt="QR Code App Store iOS" class="app-install-modal-qr"><p class="app-install-modal-title">App Store para iPhone</p></div><div class="app-install-modal-item"><img src="https://www.nespresso.com/ecom/medias/sys_master/public/44610526806046/Printed-global-android-320x320.png" alt="QR Code Play Store Android" class="app-install-modal-qr"><p class="app-install-modal-title">Play Store para Android</p></div></div></div>`,
        },
      },
    ];

    // Duplica as mensagens várias vezes para criar efeito infinito suave
    // Quanto mais duplicações, mais suave será a transição
    const duplicatedMessages = [
      ...messages,
      ...messages,
      ...messages,
      ...messages,
    ];

    // Cria o HTML do slider
    const sliderHTML =
      `
      <div class="benefits-slider-container">
        <div class="benefits-slider-track">
          ` +
      duplicatedMessages
        .map((msg, index) => {
          // Prepara o ícone (se existir)
          const iconHTML = msg.icon
            ? `<span class="benefits-slider-icon">` + msg.icon + `</span>`
            : "";

          // Prepara o texto, envolvendo em span com underline se tiver link ou modal
          const textHTML =
            msg.link || msg.modal
              ? `<span class="benefits-slider-text underlined">` +
                msg.text +
                `</span>`
              : `<span class="benefits-slider-text">` + msg.text + `</span>`;

          // Se tiver modal, renderiza como elemento clicável com data attributes
          if (msg.modal) {
            const modalTitle = msg.modal.title || "";
            const modalText = msg.modal.text || "";
            return (
              `<span class="benefits-slider-item benefits-slider-item-modal" data-modal-title="` +
              modalTitle.replace(/"/g, "&quot;") +
              `" data-modal-text="` +
              modalText.replace(/"/g, "&quot;") +
              `" style="cursor: pointer;">` +
              iconHTML +
              textHTML +
              `</span>`
            );
          } else if (msg.link) {
            // Se tiver link, renderiza como <a> sem underline no elemento principal
            return (
              `<a href="` +
              msg.link +
              `" class="benefits-slider-item" target="_blank" rel="noopener noreferrer">` +
              iconHTML +
              textHTML +
              `</a>`
            );
          } else {
            // Se não tiver link nem modal, renderiza como <span> sem underline
            return (
              `<span class="benefits-slider-item">` +
              iconHTML +
              textHTML +
              `</span>`
            );
          }
        })
        .join("") +
      `
        </div>
      </div>
    `;

    // Cria o CSS do slider
    const sliderCSS = `
      <style>
      nb-informative-stripe, #visible_h3{
        display: none !important;
      }
        .benefits-slider-container {
          width: 100%;
          background-color: #000;
          overflow: hidden;
          position: relative;
          padding: 12px 0;
        }
        
        .benefits-slider-track {
          display: flex;
          white-space: nowrap;
          gap: 150px;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          animation: slideInfinite 30s linear infinite;
        }
        
        .benefits-slider-container:hover .benefits-slider-track {
          animation-play-state: paused;
        }
        
        @keyframes slideInfinite {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(var(--segment-width, -25%), 0, 0);
          }
        }
        
        
        .benefits-slider-item {
          color: #fff;
          font-size: 18px;
          font-family: 'NespressoLucas', Arial, sans-serif;
          flex-shrink: 0;
          padding: 0 30px;
          cursor: default;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .benefits-slider-icon {
          display: inline-flex;
          align-items: center;
          font-size: 16px;
          line-height: 1;
          text-decoration: none;
        }
        
        .benefits-slider-text {
          display: inline;
        }
        .benefits-slider-icon svg {
          width: 24px;
          height: 24px;
          fill: #fff;
        }
        .benefits-slider-text.underlined {
          text-decoration: none;
        }
        
        a.benefits-slider-item {
          cursor: pointer;
        }
        
        a.benefits-slider-item:hover {
          opacity: 0.8;
        }
        
        .benefits-slider-item-modal {
          cursor: pointer;
        }
        
        .benefits-slider-item-modal:hover {
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .benefits-slider-track{
            gap:30px;
          }
        }

        /* Modal */
  .nespresso-welcome-offer-modal * { font-family: NespressoLucas, Helvetica, Arial, sans-serif; }
  .nespresso-welcome-offer-modal { position: fixed; top:0; left:0; width:100%; height:100%; z-index:2000; display:none; }
  .nespresso-welcome-offer-modal-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); cursor:pointer; }
  .nespresso-welcome-offer-modal-container { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background-color:#fff; border-radius:8px; max-width:90%; width:680px; max-height:90vh; box-shadow:0 5px 15px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden; }
  .nespresso-welcome-offer-modal-header { display:flex; align-items:center; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #e5e5e5; background-color:#f8f8f8; }
  .nespresso-welcome-offer-modal-header h3 { font-size:18px; margin:0; color:#17171A; font-weight:bold; }
  .nespresso-welcome-offer-modal-close { border:none; background:none; cursor:pointer; width:24px; height:24px; padding:0; display:flex; align-items:center; justify-content:center; transition:opacity 0.2s ease; }
  .nespresso-welcome-offer-modal-close:hover { opacity:0.7; }
  .nespresso-welcome-offer-modal-close svg { width:18px; height:18px; color:#666; }
  .nespresso-welcome-offer-modal-content { padding:10px; overflow-y:auto; max-height:calc(70vh - 60px); line-height:1.5; }
    .nespresso-welcome-offer-modal-termos a { color:#007BFF; text-decoration: underline; }
  .nespresso-welcome-offer-modal-termos a:hover { color:#0056b3; }
  .nespresso-welcome-offer-modal-termos { font-size:14px; color:#333; }
    .app-install-modal-banner { width:100%; height:300px;margin-bottom:8px; border-radius:6px; background-image:url('https://www.nespresso.com/ecom/medias/sys_master/public/48836953341982/Main-Banner-Desk-2-.jpg?attachment=true&cimgnr=qIgRF'); background-size:cover; background-position:center center; background-repeat:no-repeat; }
    .app-install-modal-grid { display:flex; gap:40px; align-items:flex-start; justify-content:center;}
    .app-install-modal-item { flex:1; text-align:center; max-width:240px; }
    .app-install-modal-qr { width:112px; max-width:180px; height:auto; margin:0 auto 8px; display:block; }
    .app-install-modal-title { margin:0 0 10px; font-size:17px; color:#17171A; font-weight:700; }
    .app-install-modal-description { margin:0; font-size:13px; color:#666; line-height:1.5; }
  @media (max-width:480px){
    .nespresso-welcome-offer-modal-container { width:85%; }
    .nespresso-welcome-offer-modal-content { padding:15px; }
    .nespresso-welcome-offer-modal-header { padding:12px 15px; }
      .app-install-modal-grid { flex-direction:column; gap:30px; align-items:center; }
      .app-install-modal-qr { max-width:160px; }
      .app-install-modal-item { max-width:280px; }
  }";
      </style>
    `;

    return {
      sliderHTML,
      sliderCSS,
    };
  }

  function insertSlider(element) {
    // Verifica se o slider já foi inserido
    if (document.querySelector(".benefits-slider-container")) {
      return;
    }

    const { sliderHTML, sliderCSS } = createSlider();

    // Insere o CSS no head
    document.head.insertAdjacentHTML("beforeend", sliderCSS);

    // Insere o slider após o elemento
    element.insertAdjacentHTML("afterbegin", sliderHTML);

    // Adiciona event listeners para elementos com modal
    const modalItems = document.querySelectorAll(".benefits-slider-item-modal");
    modalItems.forEach((item) => {
      item.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          sendGAEvent("clique-link-app-mobile-slider-infinito");
          window.location.href = APP_DEEPLINK_URL;
          return;
        }

        const title = this.getAttribute("data-modal-title") || "";
        const text = this.getAttribute("data-modal-text") || "";
        // Dispara evento GA para capturar o clique no botão de abrir modal
        sendGAEvent("abrir-modal-entrega-slider-infinito");
        // Usa a função abrirModal que está dentro do escopo de createSlider
        // Precisamos expor essa função ou criar uma nova aqui
        abrirModalSlider(title, text);
      });
    });

    // Touch events para mobile - pausar ao segurar, retomar ao soltar
    const sliderContainer = document.querySelector(
      ".benefits-slider-container",
    );
    if (sliderContainer) {
      sliderContainer.addEventListener(
        "touchstart",
        function (e) {
          // Se tocar em item modal, não pausar (deixar o click handler cuidar do redirecionamento)
          if (e.target.closest(".benefits-slider-item-modal")) return;
          const track = sliderContainer.querySelector(".benefits-slider-track");
          if (track) track.style.animationPlayState = "paused";
        },
        {
          passive: true,
        },
      );

      sliderContainer.addEventListener(
        "touchend",
        function (e) {
          if (e.target.closest(".benefits-slider-item-modal")) return;
          const track = sliderContainer.querySelector(".benefits-slider-track");
          if (track) track.style.animationPlayState = "running";
        },
        {
          passive: true,
        },
      );

      sliderContainer.addEventListener(
        "touchcancel",
        function () {
          const track = sliderContainer.querySelector(".benefits-slider-track");
          if (track) track.style.animationPlayState = "running";
        },
        {
          passive: true,
        },
      );
    }

    // Calcula a largura de um segmento e define como variável CSS
    // Aguarda um frame para garantir que os elementos estão renderizados
    requestAnimationFrame(() => {
      const track = document.querySelector(".benefits-slider-track");
      if (track) {
        const allItems = track.querySelectorAll(".benefits-slider-item");
        const messagesCount = 4; // número de mensagens originais
        let segmentWidth = 0;

        for (let i = 0; i < messagesCount; i++) {
          if (allItems[i]) {
            segmentWidth += allItems[i].offsetWidth;
            // Adiciona gap apenas se não for o último item
            if (i < messagesCount - 1) {
              segmentWidth += 150; // gap
            }
          }
        }

        // Garante que temos uma largura válida
        if (segmentWidth > 0) {
          // Define a largura como variável CSS (valor negativo para mover para a esquerda)
          track.style.setProperty("--segment-width", `-` + segmentWidth + `px`);
        }
      }
    });
  }

  // Função global para abrir modal do slider
  function abrirModalSlider(title, text) {
    // Remove modal existente se houver
    const existingModal = document.getElementById("benefits-slider-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modalElement = document.createElement("div");
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.id = "benefits-slider-modal";
    modalElement.style.display = "block";

    modalElement.innerHTML =
      '\
      <div class="nespresso-welcome-offer-modal-overlay"></div>\
      <div class="nespresso-welcome-offer-modal-container">\
        <div class="nespresso-welcome-offer-modal-header">\
          <h3>' +
      (title || "") +
      '</h3>\
          <button class="nespresso-welcome-offer-modal-close">\
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
              <line x1="18" y1="6" x2="6" y2="18"></line>\
              <line x1="6" y1="6" x2="18" y2="18"></line>\
            </svg>\
          </button>\
        </div>\
        <div class="nespresso-welcome-offer-modal-content">\
          <div class="nespresso-welcome-offer-modal-termos">' +
      (text || "") +
      "</div>\
        </div>\
      </div>";

    document.body.appendChild(modalElement);
    document.body.style.overflow = "hidden";

    const closeModalBtn = modalElement.querySelector(
      ".nespresso-welcome-offer-modal-close",
    );
    const modalOverlay = modalElement.querySelector(
      ".nespresso-welcome-offer-modal-overlay",
    );

    function closeModal() {
      modalElement.style.display = "none";
      document.body.style.overflow = "";
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    // Fechar com ESC
    const keyHandler = function (e) {
      if (e.key === "Escape" && modalElement.style.display === "block") {
        closeModal();
        document.removeEventListener("keydown", keyHandler);
      }
    };
    document.addEventListener("keydown", keyHandler);
  }

  function searchElement() {
    attempts++;

    const element = document.querySelector(ELEMENT_SELECTOR);

    if (element) {
      // Elemento encontrado
      clearInterval(intervalId);
      // Insere o slider após o elemento
      insertSlider(element);
      return;
    }

    // Se atingiu o número máximo de tentativas, limpa o intervalo
    if (attempts >= MAX_ATTEMPTS) {
      clearInterval(intervalId);
      return;
    }
  }

  // Inicia o setInterval
  intervalId = setInterval(searchElement, INTERVAL_TIME);
})();
