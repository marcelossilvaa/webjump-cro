(function () {
  "use strict";
  if (window.comunicacao2hrsPLP) return;
  window.comunicacao2hrsPLP = true;

  // Configurações
  const MAX_ATTEMPTS = 20; // Número máximo de tentativas
  const INTERVAL_TIME = 500; // Intervalo em milissegundos (500ms = 0.5s)
  const ELEMENT_SELECTOR = "nb-informative-stripe"; // Seletor do elemento a ser buscado

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
        text: "Receba seu pedido em até 2 horas*",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 64 64" stroke-width="3" stroke="#000000" fill="none"><path d="M21.68,42.22H37.17a1.68,1.68,0,0,0,1.68-1.68L44.7,19.12A1.68,1.68,0,0,0,43,17.44H17.61a1.69,1.69,0,0,0-1.69,1.68l-5,21.42a1.68,1.68,0,0,0,1.68,1.68h2.18"/><path d="M41.66,42.22H38.19l5-17.29h8.22a.85.85,0,0,1,.65.3l3.58,6.3a.81.81,0,0,1,.2.53L52.51,42.22h-3.6"/><ellipse cx="18.31" cy="43.31" rx="3.71" ry="3.76"/><ellipse cx="45.35" cy="43.31" rx="3.71" ry="3.76"/><line x1="23.25" y1="22.36" x2="6.87" y2="22.36" stroke-linecap="round"/><line x1="20.02" y1="27.6" x2="8.45" y2="27.6" stroke-linecap="round"/><line x1="21.19" y1="33.5" x2="3.21" y2="33.5" stroke-linecap="round"/></svg>`,
      },
      {
        text: "Confira regiões de entrega",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
        modal: {
          title: "Receba seu pedido de café em até 2 horas!",
          text: "As entregas têm início a partir das 12h e todos os pedidos realizados até as 18h serão entregues no mesmo dia.<br><br>Este modo de entrega é válido para compra de cápsulas e acessórios.<br><br>*Serviço disponível de segunda à sexta-feira para determinadas localidades das cidade de São Paulo, Rio do Janeiro, Belo Horizonte, Curitiba, Recife e Salvador. Caso o serviço esteja disponível em sua região, a modalidade de entrega será proposta durante a finalização do seu pedido. Verifique na etapa carrinho o custo de entrega para sua região.",
        },
      },
      {
        text: "Conheça nosso programa de lealdade",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
      },
      {
        text: "Faça parte agora do Nespresso Club!",
        link: "https://www.nespresso.com/br/pt/beneficios",
        icon: ``,
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
        


        /* Modal */
  .nespresso-welcome-offer-modal * { font-family: NespressoLucas, Helvetica, Arial, sans-serif; }
  .nespresso-welcome-offer-modal { position: fixed; top:0; left:0; width:100%; height:100%; z-index:2000; display:none; }
  .nespresso-welcome-offer-modal-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); cursor:pointer; }
  .nespresso-welcome-offer-modal-container { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background-color:#fff; border-radius:8px; max-width:90%; width:550px; max-height:90vh; box-shadow:0 5px 15px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden; }
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

    return { sliderHTML, sliderCSS };
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
        // Usa a função abrirModal que está dentro do escopo de createSlider
        // Precisamos expor essa função ou criar uma nova aqui
        abrirModalSlider(title, text);
      });
    });

    // Inicia a animação infinita do slider
    initInfiniteSlider();
  }

  function initInfiniteSlider() {
    const track = document.querySelector(".benefits-slider-track");
    if (!track) return;

    let position = 0;
    let isPaused = false;
    const speed = 0.5; // pixels por frame (ajuste conforme necessário)
    let animationId = null;
    let segmentWidth = 0;

    // Calcula a largura de um conjunto de mensagens (1/4 do total, já que duplicamos 4 vezes)
    // Precisamos calcular a largura total de um quarto do track
    const messagesCount = 4; // número de mensagens originais

    // Aguarda um frame para garantir que os elementos estão renderizados
    requestAnimationFrame(() => {
      const allItems = track.querySelectorAll(".benefits-slider-item");
      if (allItems.length === 0) return;

      // Calcula a largura total de um conjunto (primeiras 4 mensagens)
      for (let i = 0; i < messagesCount; i++) {
        if (allItems[i]) {
          segmentWidth += allItems[i].offsetWidth + 150; // largura + gap
        }
      }

      function animate() {
        if (!isPaused) {
          position -= speed;

          // Quando chegamos ao final de um segmento, resetamos para 0
          // Como temos 4 cópias idênticas, quando chegamos a -segmentWidth,
          // resetamos para 0, criando um loop infinito sem reset brusco visível
          if (position <= -segmentWidth) {
            position = 0;
          }

          track.style.transform = `translateX(` + position + `px)`;
        }

        animationId = requestAnimationFrame(animate);
      }

      // Pausa quando o mouse está sobre o container
      const container = document.querySelector(".benefits-slider-container");
      if (container) {
        container.addEventListener("mouseenter", () => {
          isPaused = true;
        });

        container.addEventListener("mouseleave", () => {
          isPaused = false;
        });
      }

      // Inicia a animação
      animate();
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
