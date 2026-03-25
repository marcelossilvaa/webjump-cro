if (!window.hasUserSessionJourney) {
  (function () {
    //Caso o usuário tenha visualizado 4 páginas de cápsula/máquina mostrar pesquisa.
    //capsules pdp_plp - PLP Capsulas
    //machine pdp_plp - PLP Maquinas
    //capsules pdp - PDP Capsulas
    //machine pdp - PDP Maquinas
    "use strict";
    window.hasUserSessionJourney = true;
    let paginaAtual = window.padl.page.pageInfo.pageName
      ? window.padl.page.pageInfo.pageName
      : "";
    let paginasSessao = getSessionStorageItem("userSessionJourney");

    if (!paginasSessao) {
      sessionStorage.setItem(
        "userSessionJourney",
        JSON.stringify([paginaAtual])
      );
    } else {
      paginasSessao.push(paginaAtual);
      sessionStorage.setItem(
        "userSessionJourney",
        JSON.stringify(paginasSessao)
      );
      let paginasCapsulas = 0;
      let paginasMaquinas = 0;
      paginasSessao.forEach(function (pagina) {
        if (pagina == "capsules pdp_plp" || pagina == "capsules pdp") {
          ++paginasCapsulas;
        } else if (pagina == "machine pdp_plp" || pagina == "machine pdp") {
          ++paginasMaquinas;
        }
      });
      if (paginasCapsulas >= 4 && !getSessionStorageItem("capsulesSurvey")) {
        alert("Pesquisa de cápsulas ativa");
        sessionStorage.setItem("capsulesSurvey", "true");
      } else if (
        paginasMaquinas >= 4 &&
        !getSessionStorageItem("machineSurvey")
      ) {
        alert("Pesquisa de máquinas ativa");
        sessionStorage.setItem("machineSurvey", "true");
      }
    }
    function getSessionStorageItem(key) {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  })();
}
