(function () {
  function trackIncentive(action, linkName) {
    var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
    if (!s || typeof s.tl !== "function") return;
    s.linkTrackVars = "events,eVar82";
    s.linkTrackEvents = "event90";
    s.events = "event90";
    s.eVar82 = "AT_incentivo_cadastro_" + action;
    s.tl(true, "o", linkName);
  }

  function attachNativeListener() {
    // procura o span com texto exato
    var span = Array.from(document.querySelectorAll(".rte-small")).find(
      (el) => el.textContent.trim() === "Realizar cadastro"
    );
    if (!span) return false;

    // sobe até o container clicável
    var container = span.closest(".sc-eqhNQH.bYCANP");
    if (!container) return false;

    container.addEventListener("click", function () {
      trackIncentive("native", "cta_cadastro_nativo");
    });
    return true;
  }

  // tenta logo no DOMContentLoaded…
  document.addEventListener("DOMContentLoaded", attachNativeListener);
  // …e faz polling por até 20 vezes a cada 500ms
  var tries = 0,
    max = 20,
    iv = setInterval(function () {
      if (attachNativeListener() || ++tries >= max) clearInterval(iv);
    }, 500);
})();
