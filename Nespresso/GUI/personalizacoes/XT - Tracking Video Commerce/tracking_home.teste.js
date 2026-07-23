// versao para colar no console e testar sem enviar nada pro GTM/GA4 real.
// unica diferenca do arquivo de producao: sendGAEvent grava em
// window.__testeGtmDataObject em vez de window.gtmDataObject, entao o
// container de GTM real (que so escuta gtmDataObject) nunca ve esses eventos.
// pra conferir os eventos gerados, digite no console: window.__testeGtmDataObject
(function () {
  "use strict";
  if (window.__videoCommerceTrackingInitTeste) return;
  window.__videoCommerceTrackingInitTeste = true;

  let lastProductName = null;

  function sendGAEvent(label, action) {
    window.__testeGtmDataObject = window.__testeGtmDataObject || [];
    __testeGtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_home", //free to fill field, please use lower case
      local_event_action: action || "click", //free to fill field, please use lower case
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
      sendGAEvent("video_commerce_home_fechar");
      if (lastProductName) {
        sendGAEvent(
          "video_commerce_home_fechar_" + normalizeProductName(lastProductName),
        );
      }
    } else if (data.action === "openProductUrl" && data.data && data.data.name) {
      sendGAEvent("video_commerce_home_pdp");
      sendGAEvent(
        "video_commerce_home_pdp_" + normalizeProductName(data.data.name),
      );
    }
  });

  function attachExpandListener() {
    let buttons = document.querySelectorAll(
      "#liveshop-sdk-close-btn:not([data-close-tracked-teste])",
    );
    if (!buttons.length) return false;

    let attached = false;
    buttons.forEach(function (btn) {
      btn.setAttribute("data-close-tracked-teste", "true");

      // o botao de tela cheia tem um svg interno; o de fechar nao (os dois
      // compartilham o mesmo id, e o fechar ja e trackeado via postMessage)
      let isExpandBtn = !!btn.querySelector("svg");
      if (!isExpandBtn) return;

      attached = true;
      ["click", "touchend"].forEach(function (eventType) {
        btn.addEventListener(eventType, function () {
          sendGAEvent("video_commerce_home_expandir");
          if (lastProductName) {
            sendGAEvent(
              "video_commerce_home_expandir_" +
                normalizeProductName(lastProductName),
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

  // no carrossel da home, varios cards ficam visiveis ao mesmo tempo mas so
  // um fica "em destaque" (maior, colorido) por vez - os demais ficam ao lado,
  // ofuscados. So contamos "visualizado" o que esta em destaque, e exigimos
  // que fique assim por pelo menos 2s seguidos antes de confirmar a view
  const VIEW_FEATURED_MS = 2000;
  const VIEW_CHECK_INTERVAL_MS = 250;

  // o carrossel duplica os videos no DOM pra fazer a rolagem parecer infinita,
  // entao controlamos "ja visualizado" por nome de produto, nao por elemento
  // (senao cada copia duplicada do mesmo video contaria como uma view nova)
  let viewedProducts = {};
  let viewedWithoutProduct = false;

  // o carrossel e feito com Swiper.js, que ja marca o slide em destaque com
  // a classe "swiper-slide-active" - usamos isso em vez de calcular posicao
  function isFeaturedVideo(video) {
    let slide = video.closest(".swiper-slide");
    return !!slide && slide.classList.contains("swiper-slide-active");
  }

  // o swiper continua trocando o slide ativo mesmo com o carrossel fora da
  // tela (usuario ainda nao rolou ate ele), entao checamos visibilidade real
  function isSubstantiallyVisible(el) {
    let rect = el.getBoundingClientRect();
    let viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    let viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;

    let visibleHeight =
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    let visibleWidth =
      Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
    if (visibleHeight <= 0 || visibleWidth <= 0) return false;

    let totalArea = rect.width * rect.height;
    if (totalArea <= 0) return false;

    return (visibleHeight * visibleWidth) / totalArea >= 0.5;
  }

  function trackVideoView(video) {
    let productVideo = video.shadowRoot.querySelector(".lav-product-name");
    let productKey = productVideo
      ? normalizeProductName(productVideo.textContent.trim())
      : null;

    if (productKey && !viewedProducts[productKey]) {
      viewedProducts[productKey] = true;
      sendGAEvent("video_commerce_home_visualizado", "view");
      sendGAEvent("video_commerce_home_visualizado_" + productKey, "view");
    } else if (!productKey && !viewedWithoutProduct) {
      viewedWithoutProduct = true;
      sendGAEvent("video_commerce_home_visualizado", "view");
    }
  }

  function watchFeaturedVideo(carouselEl, videos) {
    let visibleMs = new Map();

    let interval = setInterval(function () {
      let pending = false;
      let carouselVisible = isSubstantiallyVisible(carouselEl);

      videos.forEach(function (video) {
        if (video.hasAttribute("data-view-counted")) return;
        pending = true;

        if (carouselVisible && isFeaturedVideo(video)) {
          let elapsed = (visibleMs.get(video) || 0) + VIEW_CHECK_INTERVAL_MS;
          visibleMs.set(video, elapsed);
          if (elapsed >= VIEW_FEATURED_MS) {
            video.setAttribute("data-view-counted", "true");
            trackVideoView(video);
          }
        } else {
          visibleMs.set(video, 0);
        }
      });

      if (!pending) clearInterval(interval);
    }, VIEW_CHECK_INTERVAL_MS);
  }

  function attachListeners() {
    let videoCommerceContainer = document.querySelector(
      "liveshop-ads-carousel-v2",
    );
    if (!videoCommerceContainer) return false;

    let videos =
      videoCommerceContainer.shadowRoot.querySelectorAll("liveshop-ads-video");
    if (videos.length > 0) {
      watchFeaturedVideo(videoCommerceContainer, videos);
    }

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
    return videos.length > 0;
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
