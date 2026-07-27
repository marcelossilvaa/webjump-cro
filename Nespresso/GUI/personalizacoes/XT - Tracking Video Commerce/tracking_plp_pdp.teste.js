// versao para colar no console e testar sem enviar nada pro GTM/GA4 real.
// unica diferenca do arquivo de producao: sendGAEvent grava em
// window.__testeGtmDataObject em vez de window.gtmDataObject, entao o
// container de GTM real (que so escuta gtmDataObject) nunca ve esses eventos.
// pra conferir os eventos gerados, digite no console: window.__testeGtmDataObject
(function () {
  "use strict";
  if (window.__videoCommercePdpTrackingInitTeste) return;
  window.__videoCommercePdpTrackingInitTeste = true;

  // o mesmo local de injecao do Target roda em PLP (categoria) e em PDP
  // (produto) - o widget, os botoes e o video sao os mesmos nos dois casos,
  // so muda o prefixo dos eventos (video_commerce_pdp vs video_commerce_plp).
  // o dataLayer ja tem um evento page_view com page_name "pdp"/"plp" - usamos
  // isso pra saber em qual das duas paginas estamos. o valor pode ainda nao
  // ter sido empurrado no instante em que o script carrega, entao esperamos
  // um pouco (checando a cada 250ms, por ate uns 5s) antes de desistir
  function getPageName() {
    if (!Array.isArray(window.dataLayer)) return null;
    for (let i = window.dataLayer.length - 1; i >= 0; i--) {
      let entry = window.dataLayer[i];
      if (entry && entry.page_name) return entry.page_name;
    }
    return null;
  }

  function waitForPageConfirmation(onConfirmed) {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(function () {
      attempts++;
      let pageName = getPageName();
      if (pageName !== null || attempts >= maxAttempts) {
        clearInterval(interval);
        if (pageName === "pdp") onConfirmed("video_commerce_pdp", true);
        else if (pageName === "plp") onConfirmed("video_commerce_plp", false);
      }
    }, 250);
  }

  // prefix define o nome usado na categoria e no inicio de cada label
  // (video_commerce_pdp ou video_commerce_plp). isPdp controla se faz sentido
  // usar a URL como fallback de nome de produto (so faz sentido em PDP, que e
  // sobre um unico produto - em PLP a URL e so uma categoria/subcategoria)
  function init(prefix, isPdp) {
    let lastProductName = null;

    function sendGAEvent(label) {
      window.__testeGtmDataObject = window.__testeGtmDataObject || [];
      __testeGtmDataObject.push({
        event: "local_event", //as is, do not change!!
        event_raised_by: "br", //please put the country code ex: us, ch, it
        local_event_category: prefix, //free to fill field, please use lower case
        local_event_action: "click", //free to fill field, please use lower case
        local_event_label: label, //free to fill field, please use lower case
      });
    }

    function normalizeProductName(name) {
      return name.toLowerCase().replaceAll(" ", "_");
    }

    // o "descartou" nunca tem lastProductName (o video nunca chega a carregar
    // nessa jornada), entao usamos o ultimo trecho da URL como fallback - mas
    // isso so faz sentido em PDP (ja estamos na pagina do produto). em PLP a
    // URL e so a categoria/subcategoria, entao nao usamos como nome de produto
    function getUrlProductSlug() {
      let segments = window.location.pathname.split("/").filter(Boolean);
      let lastSegment = segments[segments.length - 1];
      return lastSegment ? lastSegment.replace(/-/g, "_") : null;
    }

    // dispara o evento geral e, se soubermos o produto (via videoLoaded, ou
    // via URL da PDP como fallback), dispara tambem o especifico
    function sendGAEventWithProduct(label) {
      sendGAEvent(label);
      let productKey = lastProductName
        ? normalizeProductName(lastProductName)
        : isPdp
          ? getUrlProductSlug()
          : null;
      if (productKey) {
        sendGAEvent(label + "_" + productKey);
      }
    }

    // ao abrir, o widget vira o mesmo modal/iframe cross-origin da home
    // (lite.streamshop.com.br), entao o fechamento e trackeado via postMessage
    // (igual ao tracking_home.js), nao por clique direto no botao. a mesma
    // mensagem videoLoaded ja traz o nome do produto vinculado ao video
    let pendingOpenName = false;

    window.addEventListener("message", function (event) {
      let data = event.data;
      if (!data || data.from !== "STREAMSHOP") return;

      if (
        data.action === "videoLoaded" &&
        data.data &&
        data.data.scheduledProducts &&
        data.data.scheduledProducts[0]
      ) {
        lastProductName = data.data.scheduledProducts[0].name;
        // o teaser pequeno usa uma tag <video> comum, sem iframe - so sabemos
        // o produto quando o videoLoaded chega, um instante apos o clique de
        // abrir. por isso disparamos o especifico de "abriu" retroativamente
        // aqui, em vez de no momento do clique
        if (pendingOpenName) {
          pendingOpenName = false;
          sendGAEvent(
            prefix + "_abriu_" + normalizeProductName(lastProductName),
          );
        }
      } else if (data.action === "liveshopAdsClosed") {
        sendGAEventWithProduct(prefix + "_fechou");
      } else if (data.action === "openProductUrl" && data.data && data.data.name) {
        // clique num produto do carrossel/video que leva o usuario ate a PDP
        // dele - igual ao tracking_home.js, mas usando o prefixo dinamico
        // (video_commerce_plp_pdp em PLP, video_commerce_pdp_pdp em PDP)
        sendGAEvent(prefix + "_pdp");
        sendGAEvent(prefix + "_pdp_" + normalizeProductName(data.data.name));
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
            sendGAEventWithProduct(prefix + "_expandiu");
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
            sendGAEventWithProduct(prefix + "_descartou");
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

    // em desktop, o teaser pode ser arrastado pela tela (mousedown -> move ->
    // mouseup), e o navegador ainda dispara um "click" nativo ao soltar sobre o
    // mesmo elemento, mesmo sem intencao de clicar. por isso comparamos a
    // posicao do mouse entre o mousedown e o click - se moveu mais que alguns
    // pixels, foi arraste, nao clique, e ignoramos o "abriu". o "descartou"
    // nao precisa dessa checagem, pois so depende do mousedown mesmo
    const DRAG_THRESHOLD_PX = 5;
    let widgetMouseDownPos = null;

    function attachListeners() {
      let widget = document.querySelector("#streamshop-widget");
      if (!widget) return false;

      // o "x" de dispensar pode renderizar um pouco depois do botao principal,
      // entao esperamos ele separadamente em vez de depender do mesmo retry
      waitForDismissButton();

      widget.addEventListener("mousedown", function (e) {
        widgetMouseDownPos = { x: e.clientX, y: e.clientY };
      });

      widget.addEventListener("click", function (e) {
        let start = widgetMouseDownPos;
        widgetMouseDownPos = null;
        if (start) {
          let dx = e.clientX - start.x;
          let dy = e.clientY - start.y;
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;
        }

        sendGAEvent(prefix + "_abriu");
        pendingOpenName = true;
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
  }

  waitForPageConfirmation(init);
})();
