(function () {
  "use strict";
  if (window.__at_review_controle_tag_v1) return;
  window.__at_review_controle_tag_v1 = true;

  // --- AA (event90 + eVar82), padronizado ---
  function analyticsEvent(eventLabel) {
    if (!eventLabel) return;
    var labelEvent = "AT_review_controle " + eventLabel;

    (function () {
      var s = window.s || (typeof window.s_gi === "function" && window.s_gi("azul-novo-prod"));
      if (!s || typeof s.tl !== "function") return;

      s.linkTrackVars   = "events,eVar82";
      s.linkTrackEvents = "event90";
      s.events          = "event90";
      s.eVar82          = labelEvent;

      s.tl(true, "o", "target_activity_action");
    })();
  }

  // --- SELECTORS (nativos do review) ---
  var SELECTORS = {
    servicesButtons: ".passenger-card__content button", // [0]=Assentos, [1]=Bagagens
    insuranceContainer: ".styles__InsuranceButtonContainer-sc-12knqgp-0", // container do "Adicionar seguro"
  };

  // --- Guard: somente na etapa de review ---
  function isReviewStep() {
    return location.pathname.indexOf("/review") > -1;
  }

  // --- Binding resiliente (SPA) ---
  function bindHandlers() {
    if (!isReviewStep()) return;

    // Assentos / Bagagens (botões do card de serviços)
    var btns = document.querySelectorAll(SELECTORS.servicesButtons);
    if (btns && btns.length >= 2) {
      var seatsBtn = btns[0];
      var luggageBtn = btns[1];

      if (!seatsBtn.__atBound) {
        seatsBtn.__atBound = true;
        seatsBtn.addEventListener("click", function () {
          analyticsEvent("Etapa review - Acesso a gerenciamento de assentos");
        });
      }

      if (!luggageBtn.__atBound) {
        luggageBtn.__atBound = true;
        luggageBtn.addEventListener("click", function () {
          analyticsEvent("Etapa review - Acesso a gerenciamento de bagagens");
        });
      }
    }

    // Adicionar Seguro (ouve o container inteiro para cobrir variações de botão interno)
    var insurance = document.querySelector(SELECTORS.insuranceContainer);
    if (insurance && !insurance.__atBound) {
      insurance.__atBound = true;
      insurance.addEventListener("click", function () {
        analyticsEvent("Etapa review - Adicionar seguro");
      });
    }
  }

  function start() {
    if (!isReviewStep()) return;

    // primeira tentativa
    bindHandlers();

    // observar mudanças de DOM (SPA / carregamentos dinâmicos)
    if (!document.body.__atReviewControleMO) {
      var mo = new MutationObserver(function () { bindHandlers(); });
      mo.observe(document.body, { childList: true, subtree: true });
      document.body.__atReviewControleMO = mo;
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }
})();
