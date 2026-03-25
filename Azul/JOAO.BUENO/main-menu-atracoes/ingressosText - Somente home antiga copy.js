(function () {
  var variationText = "Experiências e Ingressos";
  // Ingressos e Passeios (Controle)
  // Experiência e Ingressos
  // Diversão e aventuras
  //Tours e Tickets

  // Renomear o botão do menu
  var imgAnchor = document.querySelector(
    'img[src="/content/dam/azul/voe-azul/business-unit-tab/ticket.svg"]'
  );
  if (imgAnchor) {
    var menuButton = imgAnchor.closest("button");
    if (menuButton) {
      var newAria = variationText + ", Selecionar";
      menuButton.setAttribute("aria-label", newAria);
      imgAnchor.alt = newAria;
      menuButton.querySelectorAll("h4").forEach(function (h4) {
        h4.textContent = variationText;
      });
    }
  }

  // Função para anexar utm_ci a URLs /home/tickets
  function appendUtmToUrl(urlString) {
    try {
      var urlObj = new URL(urlString, window.location.origin);
      if (
        urlObj.pathname.indexOf("/home/tickets") !== -1 &&
        !urlObj.searchParams.has("utm_ci")
      ) {
        urlObj.searchParams.set("utm_ci", "ah_busca_tickets_" + variationText);
      }
      return urlObj.pathname + urlObj.search + urlObj.hash;
    } catch (e) {
      return urlString;
    }
  }

  // Override de history.pushState e history.replaceState
  // cogitar trocar por mutation
  (function () {
    var origPush = history.pushState;
    history.pushState = function (state, title, url) {
      if (typeof url === "string" && url.indexOf("/home/tickets") !== -1) {
        arguments[2] = appendUtmToUrl(url);
      }
      return origPush.apply(this, arguments);
    };

    var origReplace = history.replaceState;
    history.replaceState = function (state, title, url) {
      if (typeof url === "string" && url.indexOf("/home/tickets") !== -1) {
        arguments[2] = appendUtmToUrl(url);
      }
      return origReplace.apply(this, arguments);
    };
  })();

  // Listener para popstate (casos em que a URL muda sem pushState/replaceState)
  window.addEventListener("popstate", function () {
    var href = window.location.href;
    if (
      href.indexOf("/home/tickets") !== -1 &&
      href.indexOf("utm_ci=") === -1
    ) {
      history.replaceState(null, "", appendUtmToUrl(href));
    }
  });

  // Delegation para “Buscar ingressos” (antigo)
  var BUTTON_SELECTOR =
    'button[data-testid="search-box-hotel-date-picker-primary-button"]';
  document.addEventListener("click", function (e) {
    var targetButton = e.target.closest(BUTTON_SELECTOR);
    if (!targetButton) return;
    // Deixa a aplicação tratar a navegação; o overrideHistory injetará a UTM
  });
})();
