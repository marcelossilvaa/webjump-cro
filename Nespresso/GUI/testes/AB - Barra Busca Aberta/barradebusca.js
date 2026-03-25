(function () {
  if (window.innerWidth > 768) {
    return;
  }

  var styles = `
          cv-search-bar button#search-bar-button{
            display:none !important;
          }
          body:has(.nespresso-search-container) nb-app-banner[style="display: block;"]{
            margin-top: 48px !important;
          }
          body:has(.nespresso-search-container) #topMessageBannerMob{
            margin-top: 50px !important;
          }
          body:has(.nespresso-search-container) #filtersPLP{
            top:95px !important;
          }
              .nespresso-search-container {
                  display: flex;
                  width: 100%;
                  height: 48px;
                  background-color: white;
                  padding: 8px 16px;
                  box-sizing: border-box;
                  font-family: 'NespressoLucas', sans-serif;
                  position: absolute;
                  left: 0;
                  bottom: -48px;
                  z-index: 100;
              }
              .nespresso-search-input {
                  flex: 1;
                  padding: 8px 10px 8px 36px;
                  font-size: 14px;
                  border: 1px solid #cdcdcd;
                  border-radius: 4px;
                  outline: none;
                  background-color: white;
                  min-width: 0;
                  color: #333;
                  cursor: pointer;
                  position: relative;
              }
              .nespresso-search-container {
                  position: relative;
              }
              .nespresso-search-icon-left {
                  position: absolute;
                  left: 18px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 16px;
                  height: 16px;
                  z-index: 101;
                  pointer-events: none;
              }
              .nespresso-search-input:focus {
                  border-color: #3c2a1e;
                  box-shadow: 0 0 3px #6e5544;
              }
    
              /* Mobile: barra fica fixa no topo para o teste A/B */
              @media screen and (max-width: 768px) {
                  .nespresso-search-container {
                      position: fixed;
                      top: 50px;
                      left: 0;
                      width: 100%;
                      padding: 8px;
                      z-index: 1000;
                      animation: nespresso-search-slide-down 0.3s ease;
                  }
                  @keyframes nespresso-search-slide-down {
                      0% { transform: translateY(-20px); opacity: 0; }
                      100% { transform: translateY(0); opacity: 1; }
                  }
                  .nespresso-search-input {
                      font-size: 16px;
                  }
              }
                  @media screen and (min-width: 769px) {
                    .nespresso-search-container{
                      display:none !important;
                    }
                  }
            `;

  // Sistema de retry para encontrar elementos
  function findElementWithRetry(selector, maxAttempts = 10, delay = 500) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      function tryFind() {
        attempts++;
        const element = document.querySelector(selector);

        if (element) {
          resolve(element);
        } else if (attempts >= maxAttempts) {
          reject(
            new Error(`Elemento não encontrado após ${maxAttempts} tentativas`)
          );
        } else {
          setTimeout(tryFind, delay);
        }
      }

      tryFind();
    });
  }

  function createNespressoSearch(config) {
    // Configurações padrão
    var defaultConfig = {
      targetSelector: ".Header__customer",
      insertPosition: "afterend",
      placeholder: "Encontre seu café favorito",
      maxSearchLength: 100,
    };

    config = Object.assign({}, defaultConfig, config || {});

    function createSearchComponent() {
      var container = document.createElement("div");
      var input = document.createElement("input");
      var leftIcon = document.createElement("div");

      container.className = "nespresso-search-container";
      input.className = "nespresso-search-input";
      leftIcon.className = "nespresso-search-icon-left";

      input.type = "text";
      input.placeholder = config.placeholder;
      input.setAttribute("aria-label", "Campo de pesquisa Nespresso");
      input.setAttribute("maxlength", config.maxSearchLength.toString());
      input.setAttribute("autocomplete", "off");
      input.setAttribute("readonly", "readonly"); // Adiciona readonly para evitar digitação

      var leftSearchIcon =
        '<svg viewBox="0 0 16 16" stroke="white" stroke-width="1.1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m6.4 0c3.5 0 6.4 2.9 6.4 6.4 0 1.4-.4 2.7-1.2 3.7l4 4c.4.4.4 1 .1 1.5l-.1.1c-.2.2-.5.3-.8.3s-.6-.1-.8-.3l-4-4c-1 .7-2.3 1.2-3.7 1.2-3.4-.1-6.3-3-6.3-6.5s2.9-6.4 6.4-6.4zm0 2.1c-2.3 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3z"></path></svg>';

      // Função para clicar no botão de busca original com retry
      function triggerOriginalSearch() {
        try {
          // Registra o evento de GTM
          window.gtmDataObject = window.gtmDataObject || [];
          gtmDataObject.push({
            event: "local_event",
            event_raised_by: "br",
            local_event_category: "user engagement",
            local_event_action: "busca_aberta",
            local_event_label: "click_search",
          });

          // Usa o sistema de retry para encontrar o botão de busca original
          findElementWithRetry(
            "cv-search-bar button#search-bar-button",
            10,
            300
          )
            .then(function (originalButton) {
              originalButton.click();
            })
            .catch(function (error) {
              console.error(
                "Erro: Botão de busca original não encontrado após múltiplas tentativas:",
                error
              );
            });
        } catch (e) {
          console.error("Erro ao acionar busca original:", e);
        }
      }

      // Adiciona evento de clique no input
      input.addEventListener("click", function (e) {
        e.preventDefault();
        triggerOriginalSearch();
      });

      leftIcon.innerHTML = leftSearchIcon;

      container.appendChild(leftIcon);
      container.appendChild(input);

      return container;
    }

    if (!document.querySelector("#nespresso-search-styles")) {
      var styleElement = document.createElement("style");
      styleElement.id = "nespresso-search-styles";
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }
    if (
      document.location.pathname == "/br/pt" ||
      document.location.pathname == "/br/pt/home"
    ) {
      document.head.insertAdjacentHTML(
        "beforeend",
        `<style>#topMessageBannerMob{margin-bottom:15px !important}</style>`
      );
    }
    // Usa o sistema de retry para encontrar o elemento alvo
    findElementWithRetry(config.targetSelector, 10, 500)
      .then(function (targetElement) {
        var searchComponent = createSearchComponent();
        targetElement.insertAdjacentElement(
          config.insertPosition,
          searchComponent
        );
        return searchComponent;
      })
      .catch(function (error) {
        return null;
      });
  }

  function init() {
    createNespressoSearch();
  }

  if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
