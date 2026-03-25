(function () {
  "use strict";
  if (window.__atCarsFiltersControlExpand) return;
  window.__atCarsFiltersControlExpand = true;

  // --- Helpers AA (event90 + eVar82) ---
  function sendAA(label) {
    if (!label) return;
    var s =
      window.s ||
      (typeof window.s_gi === "function" && window.s_gi("azul-novo-prod"));
    if (!s || typeof s.tl !== "function") return;
    s.linkTrackVars = "events,eVar82";
    s.linkTrackEvents = "event90";
    s.events = "event90";
    s.eVar82 = label;
    s.tl(true, "o", "target_activity_action");
  }
  function norm(t) {
    return (t || "")
      .toString()
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // --- Bind expand (controle/horizontal nativo) ---
  function bind() {
    var wrapper = document.querySelector(
      ".styles__DropdownFiltersWrapper-sc-s2m4a9-0"
    );
    if (!wrapper || wrapper.__atExpandBound) return;
    wrapper.__atExpandBound = true;

    wrapper.addEventListener(
      "click",
      function (ev) {
        var header = ev.target.closest(
          '.styles__SelectWrapper-sc-1jfkjjc-0[role="button"]'
        );
        if (!header || !wrapper.contains(header)) return;

        var container = header.closest(
          ".styles__DropdownContainer-sc-1jfkjjc-5"
        );
        var nameEl =
          container &&
          container.querySelector(".styles__FilterName-sc-1jfkjjc-4");
        var filterName = norm(nameEl ? nameEl.textContent : "Sem rotulo");

        sendAA("AT_filtros_horizontal:click " + filterName);
      },
      true
    );
  }

  // --- Boot / Resiliência SPA (mesma rota /cars) ---
  function ready() {
    var isCars = location.pathname.indexOf("/cars") > -1;
    // Se quiser comparar só com desktop, descomente a linha abaixo:
    // var isDesktop = (window.innerWidth || document.documentElement.clientWidth || 0) >= 1024;
    if (!isCars) return;

    // Espera loading sumir para evitar rebind em nós transitórios
    var loading = document.querySelector(".styles__LoadingWrapper-sc-fdgbpv-4");
    if (loading) {
      requestAnimationFrame(ready);
      return;
    }

    bind();

    // Observa mudanças de SPA e re-binda se necessário
    if (!document.body.__atExpandMO) {
      var mo = new MutationObserver(function () {
        bind();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      document.body.__atExpandMO = mo;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
