(function () {
  "use strict";
  let lastProductName = null;

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_home", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  function normalizeProductName(name) {
    return name.toLowerCase().replaceAll(" ", "_");
  }

  // o carrossel de video/produtos roda dentro de um iframe de outra origem
  // (lite.streamshop.com.br), entao nao da pra ler o DOM dele. o proprio
  // widget avisa a pagina via postMessage quando o video muda e quando o
  // modal fecha, entao usamos isso em vez de tentar acessar o iframe
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
    } else if (data.action === "liveshopAdsClosed") {
      sendGAEvent("video_commerce_fechar");
      if (lastProductName) {
        sendGAEvent(
          "video_commerce_fechar_" + normalizeProductName(lastProductName),
        );
      }
    }
  });

  function attachExpandListener() {
    let buttons = document.querySelectorAll(
      "#liveshop-sdk-close-btn:not([data-close-tracked])",
    );
    if (!buttons.length) return false;

    let attached = false;
    buttons.forEach(function (btn) {
      btn.setAttribute("data-close-tracked", "true");

      // o botao de tela cheia tem um svg interno; o de fechar nao (os dois
      // compartilham o mesmo id, e o fechar ja e trackeado via postMessage)
      let isExpandBtn = !!btn.querySelector("svg");
      if (!isExpandBtn) return;

      attached = true;
      ["click", "touchend"].forEach(function (eventType) {
        btn.addEventListener(eventType, function () {
          sendGAEvent("video_commerce_expandir");
          if (lastProductName) {
            sendGAEvent(
              "video_commerce_expandir_" + normalizeProductName(lastProductName),
            );
          }
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

  function attachListeners() {
    let videoCommerceContainer = document.querySelector(
      "liveshop-ads-carousel-v2",
    );
    if (!videoCommerceContainer) return false;

    let videos =
      videoCommerceContainer.shadowRoot.querySelectorAll("liveshop-ads-video");
    videos.forEach((video) => {
      ["click", "touchend"].forEach(function (eventType) {
        video.addEventListener(eventType, function () {
          let productVideo =
            video.shadowRoot.querySelector(".lav-product-name");
          if (productVideo) {
            let productName = productVideo.textContent.trim();
            sendGAEvent(
              "video_commerce_" + normalizeProductName(productName),
            );
          } else {
            sendGAEvent("video_commerce_video_sem_produto");
          }
          waitForExpandButton();
        });
      });
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
