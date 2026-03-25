if (!window.hasUserSessionJourney) {
  (function () {
    //Caso o usuário tenha visualizado 4 páginas de cápsula/máquina mostrar pesquisa.
    "use strict";
    window.hasUserSessionJourney = true;
    let paginaAtual = window.padl.page.pageInfo.pageName;
    //capsules pdp_plp - PLP Capsulas
    //machine pdp_plp - PLP Maquinas
    //capsules pdp - PDP Capsulas
    //machine pdp - PDP Maquinas

    let paginasSessao = getSessionStorageItem("userSessionJourney");

    if (!paginasSessao) {
      sessionStorage.setItem(
        "userSessionJourney",
        JSON.stringify([paginaAtual])
      );
    } else {
      if (!(paginasSessao[paginasSessao.length - 1] == paginaAtual)) {
        paginasSessao.push(paginaAtual);
        sessionStorage.setItem(
          "userSessionJourney",
          JSON.stringify(paginasSessao)
        );
        if (paginasSessao.length == 4) {
          alert("pesquisa apareceu");
        }
      }
    }
    function getSessionStorageItem(key) {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  })();
}
