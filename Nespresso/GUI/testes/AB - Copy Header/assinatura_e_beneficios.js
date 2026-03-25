(function () {
  "use strict";
  if (window.copyHeaderAB) {
    return;
  }
  window.copyHeaderAB = true;

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

  const CONFIG = {
    selector: '[data-qa="menu_subscription"] .HeaderNavigationBarItem__title',
    hamburgerSelector: ".HeaderNavigationBar__switch",
    newText: "Assinatura e Beneficios",
    checkInterval: 500, // ms
    maxAttempts: 40, // 20 segundos no máximo
  };

  function isMobile() {
    return window.innerWidth <= 768;
  }
  function bindGA() {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: "xt_ab_test_beneficios",
    });
  }
  if (isMobile()) {
    // Mobile
    let attempts = 0;
    let buscaBtnHamburguer = setInterval(function () {
      let btnHamburguer = document.querySelector(CONFIG.hamburgerSelector);

      if (btnHamburguer) {
        btnHamburguer.addEventListener("click", function () {
          // Aguarda um pouco para o menu aparecer após o clique
          setTimeout(function () {
            let menuAssinatura = document.querySelector(CONFIG.selector);
            if (menuAssinatura) {
              menuAssinatura.textContent = CONFIG.newText;
              document
                .querySelector('[data-qa="menu_subscription"]')
                .addEventListener("click", bindGA);
            }
          }, 1000);
        });

        clearInterval(buscaBtnHamburguer);
      } else {
        attempts++;
        if (attempts >= CONFIG.maxAttempts) {
          clearInterval(buscaBtnHamburguer);
        }
      }
    }, CONFIG.checkInterval);
  } else {
    // Desktop
    let attempts = 0;
    let buscaMenuAssinatura = setInterval(function () {
      let menuAssinatura = document.querySelector(CONFIG.selector);

      if (menuAssinatura) {
        menuAssinatura.textContent = CONFIG.newText;
        document
          .querySelector('[data-qa="menu_subscription"]')
          .addEventListener("click", bindGA);
        clearInterval(buscaMenuAssinatura);
      } else {
        attempts++;
        if (attempts >= CONFIG.maxAttempts) {
          console.warn(
            "Menu de assinatura não encontrado após",
            CONFIG.maxAttempts,
            "tentativas"
          );
          clearInterval(buscaMenuAssinatura);
        }
      }
    }, CONFIG.checkInterval);
  }
})();
