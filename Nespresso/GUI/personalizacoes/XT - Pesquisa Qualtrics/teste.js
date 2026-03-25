(function () {
  // ================================================
  // QUALTRICS INTERCEPT - Ativação via Adobe Target
  // ================================================

  var QUALTRICS_URL =
    "https://znwdpprluvg4ylpzv-nestleglobalmktg.siteintercept.qualtrics.com/SIE/?Q_ZID=ZN_WDPpRlUvg4YLpZv";
  var ZONE_ID = "ZN_WDPpRlUvg4YLpZv";

  // 1. Injeta o snippet base do Qualtrics (se ainda não estiver na página)
  function loadQualtricsSnippet() {
    if (document.getElementById(ZONE_ID)) return; // já existe, não duplica

    // Cria a div obrigatória do Qualtrics
    var div = document.createElement("div");
    div.id = ZONE_ID;
    document.body.appendChild(div);

    // Carrega o script principal do Qualtrics
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = QUALTRICS_URL;
    document.body.appendChild(script);
  }

  // 2. Dispara o intercept via QSI.API
  function activateIntercept() {
    if (typeof QSI !== "undefined" && QSI.API) {
      QSI.API.unload();
      QSI.API.load().then(function () {
        QSI.API.run();
      });
    } else {
      // QSI ainda não carregou, tenta novamente em 500ms
      setTimeout(activateIntercept, 500);
    }
  }

  // 3. Execução: garante que o body existe antes de injetar
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    loadQualtricsSnippet();
    activateIntercept();
  } else {
    window.addEventListener("DOMContentLoaded", function () {
      loadQualtricsSnippet();
      activateIntercept();
    });
  }
})();
