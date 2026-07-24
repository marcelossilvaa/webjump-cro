// versao para colar no console e testar sem enviar nada pro GTM/GA4 real.
// unica diferenca do arquivo de producao: sendGAEvent grava em
// window.__testeGtmDataObject em vez de window.gtmDataObject, entao o
// container de GTM real (que so escuta gtmDataObject) nunca ve esses eventos.
// pra conferir os eventos gerados, digite no console: window.__testeGtmDataObject
(function () {
  "use strict";
  if (window.__videoCommercePdpTrackingInitTeste) return;
  window.__videoCommercePdpTrackingInitTeste = true;

  function sendGAEvent(label) {
    window.__testeGtmDataObject = window.__testeGtmDataObject || [];
    __testeGtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_pdp", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  // ao abrir, o widget vira o mesmo modal/iframe cross-origin da home
  // (lite.streamshop.com.br), entao o fechamento e trackeado via postMessage
  // (igual ao tracking_home.js), nao por clique direto no botao
  window.addEventListener("message", function (event) {
    let data = event.data;
    if (!data || data.from !== "STREAMSHOP") return;

    if (data.action === "liveshopAdsClosed") {
      sendGAEvent("video_commerce_pdp_fechou");
    }
  });

  function attachExpandListener() {
    let buttons = document.querySelectorAll(
      "#liveshop-sdk-close-btn:not([data-expand-tracked-teste])",
    );
    if (!buttons.length) return false;

    let attached = false;
    buttons.forEach(function (btn) {
      btn.setAttribute("data-expand-tracked-teste", "true");

      // o botao de tela cheia tem um svg interno; o de fechar nao (os dois
      // compartilham o mesmo id, e o fechar ja e trackeado via postMessage)
      let isExpandBtn = !!btn.querySelector("svg");
      if (!isExpandBtn) return;

      attached = true;
      ["click", "touchend"].forEach(function (eventType) {
        btn.addEventListener(eventType, function () {
          sendGAEvent("video_commerce_pdp_expandiu");
        });
      });
    });
    return attached;
  }

  function waitForExpandButton() {
    if (attachExpandListener()) return;
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(function () {
      attempts++;
      if (attachExpandListener() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 300);
  }

  function attachDismissListener() {
    let widget = document.querySelector("#streamshop-widget");
    if (!widget) return false;

    let closeButton = widget.querySelector(
      ".close-button:not([data-dismiss-tracked-teste])",
    );
    if (!closeButton) return false;

    closeButton.setAttribute("data-dismiss-tracked-teste", "true");

    // dispensar o teaser pequeno (sem chegar a abrir o video) e uma acao
    // diferente de fechar o modal expandido, por isso tem label proprio.
    // o proprio widget remove/esconde o elemento no mousedown, antes do
    // "click" completar - por isso escutamos mousedown/touchstart em fase
    // de captura, que roda antes de qualquer handler do widget
    ["mousedown", "touchstart"].forEach(function (eventType) {
      closeButton.addEventListener(
        eventType,
        function (e) {
          e.stopPropagation();
          sendGAEvent("video_commerce_pdp_descartou");
        },
        true,
      );
    });
    return true;
  }

  function waitForDismissButton() {
    if (attachDismissListener()) return;
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(function () {
      attempts++;
      if (attachDismissListener() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);
  }

  function attachListeners() {
    let widget = document.querySelector("#streamshop-widget");
    if (!widget) return false;

    // o "x" de dispensar pode renderizar um pouco depois do botao principal,
    // entao esperamos ele separadamente em vez de depender do mesmo retry
    waitForDismissButton();

    widget.addEventListener("click", function () {
      sendGAEvent("video_commerce_pdp_abriu");
      waitForExpandButton();
    });

    return true;
  }

  if (!attachListeners()) {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(function () {
      attempts++;
      if (attachListeners() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);
  }
})();
