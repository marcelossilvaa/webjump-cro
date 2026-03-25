(function () {
  "use strict";
  if (window.sliderHorizontalBeneficios) return;
  window.sliderHorizontalBeneficios = true;
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
      local_event_category: "comunicacao-cards-plp-target", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  // Configurações
  const MAX_ATTEMPTS = 20; // Número máximo de tentativas
  const INTERVAL_TIME = 500; // Intervalo em milissegundos (500ms = 0.5s)
  const ELEMENT_SELECTOR = "#header"; // Seletor do elemento a ser buscado

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
        text: "COMPRE CAFÉS E <strong>GANHE PRESENTES</strong>",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M15.7 3H3v12.7l15.5 15.5 12.7-12.7zM4 15.3V4h11.3l14.5 14.5-11.3 11.3z"/><path d="m17.98 11-3 12h1.04l3-12zM12.5 12c-.93 0-2.5.39-2.5 3s1.57 3 2.5 3 2.5-.39 2.5-3-1.57-3-2.5-3m0 5c-.64 0-1.5-.2-1.5-2s.86-2 1.5-2 1.5.2 1.5 2-.86 2-1.5 2M21.5 16c-.93 0-2.5.39-2.5 3s1.57 3 2.5 3 2.5-.39 2.5-3-1.57-3-2.5-3m0 5c-.64 0-1.5-.2-1.5-2s.86-2 1.5-2 1.5.2 1.5 2-.86 2-1.5 2M6.5 7.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"/></svg>`,
      },
      {
        text: "COMPRE HOJE E <strong>RECEBA ATÉ O NATAL</strong>: SP, RJ, DF e PE*",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M18.5 1.94 6 8.2V13h1V9.3l11 5.5v13.9L7 23.2V22H6v1.8l12.5 6.26L31 23.8V8.19zM29.38 8.5l-4.88 2.44L13.62 5.5l4.88-2.44zM18.5 13.94 7.62 8.5l4.88-2.44 10.88 5.44zM19 28.7V14.81l5-2.5v3.44l1-.5v-3.44l5-2.5v13.88z"/><path d="M8 17H1v1h7zM11 20H4v1h7zM10 14H3v1h7z"/></svg>`,
      },
      {
        text: "*Confira regiões e prazos de entrega",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M21.23 22.25C23.25 20.01 25 18.08 25 13.5 25 6.73 21.81 3 16.02 3 10.2 3 7 6.73 7 13.5c0 4.59 1.75 6.52 3.79 8.76 1.6 1.78 3.43 3.8 4.76 7.63l.04.11h.87l.04-.12c1.3-3.84 3.13-5.85 4.73-7.63m-9.7-.66C9.56 19.42 8 17.7 8 13.5 8 7.29 10.77 4 16.02 4 21.24 4 24 7.29 24 13.5c0 4.2-1.55 5.9-3.51 8.08-1.49 1.65-3.15 3.49-4.47 6.72-1.33-3.22-3-5.07-4.5-6.71"/><path d="M16 8c-2.5 0-4 1.87-4 5s1.5 5 4 5 4-1.87 4-5-1.5-5-4-5m0 9c-2.61 0-3-2.5-3-4s.39-4 3-4 3 2.5 3 4-.39 4-3 4"/></svg>`,
        modal: {
          title: "Confira o prazo de entrega para sua região",
          text: `<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: NespressoLucas; font-size: 14px;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="text-align: left; padding: 8px 12px 8px 8px; font-weight: bold; border-bottom: 1px solid #ddd; width: 40%;">Região</th>
        <th style="text-align: left; padding: 8px 4px; font-weight: bold; border-bottom: 1px solid #ddd; width: 30%;">Capitais</th>
        <th style="text-align: left; padding: 8px 8px 8px 4px; font-weight: bold; border-bottom: 1px solid #ddd; width: 30%;">Interior**</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="text-align: left; padding: 8px 12px 8px 8px;">SP, RJ, DF e PE</td>
        <td style="text-align: left; padding: 8px 4px;">até 1 dia útil</td>
        <td style="text-align: left; padding: 8px 8px 8px 4px;">até 4 dias úteis</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee; background-color: #f9f9f9;">
        <td style="text-align: left; padding: 8px 12px 8px 8px;">ES, GO, MG, MS, PR e SC</td>
        <td style="text-align: left; padding: 8px 4px;">até 2 dias úteis</td>
        <td style="text-align: left; padding: 8px 8px 8px 4px;">até 5 dias úteis</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="text-align: left; padding: 8px 12px 8px 8px;">AL, CE, BA, SE, PB, RN e RS</td>
        <td style="text-align: left; padding: 8px 4px;">até 3 dias úteis</td>
        <td style="text-align: left; padding: 8px 8px 8px 4px;">até 6 dias úteis</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee; background-color: #f9f9f9;">
        <td style="text-align: left; padding: 8px 12px 8px 8px;">PI, MA, TO e MT</td>
        <td style="text-align: left; padding: 8px 4px;">até 5 dias úteis</td>
        <td style="text-align: left; padding: 8px 8px 8px 4px;">até 8 dias úteis</td>
      </tr>
      <tr>
        <td style="text-align: left; padding: 8px 12px 8px 8px;">AM, AC, AP, PA, RR e RO</td>
        <td style="text-align: left; padding: 8px 4px;">até 7 dias úteis</td>
        <td style="text-align: left; padding: 8px 8px 8px 4px;">até 10 dias úteis</td>
      </tr>
    </tbody>
  </table><br>Importante: os prazos abaixo são válidos para pedidos aprovados até às 12h (meio-dia). Acrescentar +1 dia útil para pedidos aprovados após às 12h (meio-dia) e para pedidos realizados aos finais de semana e feriados.`,
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
      nb-informative-stripe{
        display: none !important;
      }
        .benefits-slider-container {
          width: 100%;
          background-color: #47233a;
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
          font-size: 14px;
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
          text-decoration: underline;
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
  .nespresso-welcome-offer-modal-container { position:absolute; top:60%; left:50%; transform:translate(-50%,-50%); background-color:#fff; border-radius:8px; max-width:90%; width:550px; max-height:90vh; box-shadow:0 5px 15px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden; }
  .nespresso-welcome-offer-modal-header { display:flex; align-items:center; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #e5e5e5; background-color:#f8f8f8; }
  .nespresso-welcome-offer-modal-header h3 { font-size:18px; margin:0; color:#17171A; font-weight:bold; }
  .nespresso-welcome-offer-modal-close { border:none; background:none; cursor:pointer; width:24px; height:24px; padding:0; display:flex; align-items:center; justify-content:center; transition:opacity 0.2s ease; }
  .nespresso-welcome-offer-modal-close:hover { opacity:0.7; }
  .nespresso-welcome-offer-modal-close svg { width:18px; height:18px; color:#666; }
  .nespresso-welcome-offer-modal-content { padding:20px; overflow-y:auto; max-height:calc(70vh - 60px); line-height:1.5; }
    .nespresso-welcome-offer-modal-termos a { color:#007BFF; text-decoration: underline; }
  .nespresso-welcome-offer-modal-termos a:hover { color:#0056b3; }
  .nespresso-welcome-offer-modal-termos { font-size:14px; color:#333; }
  @media (max-width:480px){
    .nespresso-welcome-offer-modal-container { width:85%; }
    .nespresso-welcome-offer-modal-content { padding:15px; }
    .nespresso-welcome-offer-modal-header { padding:12px 15px; }
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
    element.insertAdjacentHTML("afterend", sliderHTML);

    // Adiciona event listeners para elementos com modal
    const modalItems = document.querySelectorAll(".benefits-slider-item-modal");
    modalItems.forEach((item) => {
      item.addEventListener("click", function () {
        const title = this.getAttribute("data-modal-title") || "";
        const text = this.getAttribute("data-modal-text") || "";
        // Dispara evento GA para capturar o clique no botão de abrir modal
        sendGAEvent("abrir-modal-entrega-slider-infinito");
        // Usa a função abrirModal que está dentro do escopo de createSlider
        // Precisamos expor essa função ou criar uma nova aqui
        abrirModalSlider(title, text);
      });
    });

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
      ".nespresso-welcome-offer-modal-close"
    );
    const modalOverlay = modalElement.querySelector(
      ".nespresso-welcome-offer-modal-overlay"
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
