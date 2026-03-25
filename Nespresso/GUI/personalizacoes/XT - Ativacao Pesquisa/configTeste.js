if (!window.hasUserSessionJourney) {
  (function () {
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

    ("use strict");
    let tamanhoMaximoHistorico = 25;
    window.hasUserSessionJourney = true;
    let botaoAddCartVazio = document.querySelector(
      "button#ta-mini-basket__open:not(.MiniBasketButton--not-empty)"
    );
    let paginaAtual =
      window.padl &&
      window.padl.page &&
      window.padl.page.pageInfo &&
      window.padl.page.pageInfo.pageName
        ? window.padl.page.pageInfo.pageName
        : "";

    function getSessionStorageItem(key) {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }

    let paginasSessao = getSessionStorageItem("userSessionJourney") || [];

    paginasSessao.push(paginaAtual);

    if (paginasSessao.length > tamanhoMaximoHistorico) {
      paginasSessao.shift();
    }

    sessionStorage.setItem("userSessionJourney", JSON.stringify(paginasSessao));
    let paginasCapsulas = 0;
    let paginasMaquinas = 0;

    paginasSessao.forEach(function (pagina) {
      if (pagina === "capsules pdp_plp" || pagina === "capsules pdp") {
        paginasCapsulas++;
      } else if (pagina === "machine pdp_plp" || pagina === "machine pdp") {
        paginasMaquinas++;
      }
    });

    setTimeout(function () {
      botaoAddCartVazio = document.querySelector(
        "button#ta-mini-basket__open:not(.MiniBasketButton--not-empty)"
      );

      if (
        paginasCapsulas >= 3 &&
        !sessionStorage.getItem("capsulesSurvey") &&
        botaoAddCartVazio
      ) {
        verifyUsabillaEvent("pesquisaCapsulas_jornadaUsuario");
        sessionStorage.setItem("capsulesSurvey", "true");
      } else if (
        paginasMaquinas >= 3 &&
        !sessionStorage.getItem("machineSurvey") &&
        botaoAddCartVazio
      ) {
        verifyUsabillaEvent("pesquisaMaquinas_jornadaUsuario");
        sessionStorage.setItem("machineSurvey", "true");
      }
    }, 1000);

    function verifyUsabillaEvent(pesquisa) {
      window.localStorage.clear();
      window.usabilla_live("trigger", pesquisa);
      window.usabilla_live("virtualPageView");

      window.gtmDataObject = window.gtmDataObject || [];
      gtmDataObject.push({
        event: "local_event",
        event_raised_by: "br",
        local_event_category: "user engagement",
        local_event_action: "click",
        local_event_label: "visualizou_" + pesquisa,
      });
    }
  })();
}
