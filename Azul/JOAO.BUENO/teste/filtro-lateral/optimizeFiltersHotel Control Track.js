(function () {
  "use strict";
  if (window.__atHotelFiltersControlExpand_v1) return;
  window.__atHotelFiltersControlExpand_v1 = true;

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

  // Debounce por botão (fallback quando aria-expanded não existe)
  var lastFire = new WeakMap();
  function shouldFireOnce(el, ms) {
    var now = Date.now(),
      last = lastFire.get(el) || 0;
    if (now - last < ms) return false;
    lastFire.set(el, now);
    return true;
  }

  function bind() {
    // wrapper da linha de filtros (horizontal nativo em hotéis)
    var row = document.querySelector(".styles__VisibleRow-sc-ulubtd-1");
    if (!row || row.__atExpandBound) return;
    row.__atExpandBound = true;

    row.addEventListener(
      "click",
      function (ev) {
        // botão do filtro
        var btn = ev.target.closest(".styles__DropdownFilter-sc-1h37srh-4");
        if (!btn || !row.contains(btn)) return;

        // nome do filtro
        var name =
          btn.getAttribute("data-text") || btn.textContent || "Sem rotulo";
        name = norm(name);

        // após o clique, alguns componentes atualizam aria-expanded
        setTimeout(function () {
          var expanded = btn.getAttribute("aria-expanded");
          if (expanded === "true") {
            sendAA("AT_filtros_horizontal_hoteis:expand " + name);
          } else if (expanded == null) {
            // fallback: dispara com leve debounce por botão
            if (shouldFireOnce(btn, 600)) {
              sendAA("AT_filtros_horizontal_hoteis:click " + name);
            }
          }
        }, 0);
      },
      true
    );
  }

  function ready() {
    // Mesma lógica de comparação (página + desktop) para consistência
    var isHotels = location.pathname.indexOf("/hotel") > -1;
    var isDesktop =
      (window.innerWidth || document.documentElement.clientWidth || 0) >= 1024;
    if (!isHotels || !isDesktop) return;

    // espera loading sumir para evitar bind em nós transitórios
    var loading = document.querySelector(".styles__LoadingWrapper-sc-oxmbkx-2");
    if (loading) {
      requestAnimationFrame(ready);
      return;
    }

    bind();

    // observar SPA e rebinder se trocar a linha de filtros
    if (!document.body.__atHotelCtrlExpandMO) {
      var mo = new MutationObserver(function () {
        bind();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      document.body.__atHotelCtrlExpandMO = mo;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
