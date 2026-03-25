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
    // Cada mensagem pode ter um objeto com 'text' e 'link' (opcional)
    // Se tiver link, o texto terá underline automaticamente
    const messages = [
      { text: "Receba seu pedido em até 2 horas*" },
      {
        text: "Confira regiões de entrega",
        link: "https://www.nespresso.com/br/pt/servicos#/entrega/prazos-padrao",
      },
      { text: "Conheça nosso programa de lealdade" },
      {
        text: "Faça parte agora do Nespresso Club!",
        link: "https://www.nespresso.com/br/pt/beneficios",
      },
    ];

    // Duplica as mensagens para criar efeito infinito
    const duplicatedMessages = [...messages, ...messages];

    // Cria o HTML do slider
    const sliderHTML =
      `
      <div class="benefits-slider-container">
        <div class="benefits-slider-track">
          ` +
      duplicatedMessages
        .map((msg, index) => {
          if (msg.link) {
            // Se tiver link, renderiza como <a> com underline
            return (
              `<a href="` +
              msg.link +
              `" class="benefits-slider-item underlined" target="_blank" rel="noopener noreferrer">` +
              msg.text +
              `</a>`
            );
          } else {
            // Se não tiver link, renderiza como <span> sem underline
            return `<span class="benefits-slider-item">` + msg.text + `</span>`;
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
          animation: slideInfinite 25s linear infinite;
          gap: 80px;
          will-change: transform;
        }
        
        .benefits-slider-container:hover .benefits-slider-track {
          animation-play-state: paused;
        }
        
        .benefits-slider-item {
          color: #fff;
          font-size: 14px;
          font-family: 'NespressoLucas', Arial, sans-serif;
          flex-shrink: 0;
          padding: 0 30px;
          cursor: default;
          text-decoration: none;
        }
        
        .benefits-slider-item.underlined {
          text-decoration: underline;
          cursor: pointer;
        }
        
        .benefits-slider-item.underlined:hover {
          opacity: 0.8;
        }
        
        @keyframes slideInfinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
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
