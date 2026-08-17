// versao para colar no console e testar sem enviar nada pro GTM/GA4 real.
// unica diferenca do arquivo de producao: sendGAEvent grava em
// window.__testeGtmDataObject em vez de window.gtmDataObject, entao o
// container de GTM real (que so escuta gtmDataObject) nunca ve esses eventos.
// pra conferir os eventos gerados, digite no console: window.__testeGtmDataObject
(function () {
  "use strict";
  if (window.__videoCommerceTrackingInitTeste) return;
  window.__videoCommerceTrackingInitTeste = true;

  // o Swiper (biblioteca do carrossel) monitora touchstart/touchmove e chama
  // preventDefault() pra controlar o gesto de arrastar - isso as vezes
  // cancela a sintetizacao do "click" pelo navegador, por isso precisamos do
  // "touchend" tambem. mas o touchend dispara em QUALQUER toque que termina
  // ali, incluindo quando a pessoa estava arrastando o carrossel pra ver o
  // proximo video - por isso comparamos a posicao do dedo entre o inicio e o
  // fim do toque, e ignoramos se moveu mais que alguns pixels (foi arraste)
  const TOUCH_DRAG_THRESHOLD_PX = 10;
  let lastProductName = null;
  // quando o usuario clica num video, ele "pula" pro canto da tela (e depois,
  // se expandir, pro centro) - nos dois casos o carrossel de fundo continua
  // tecnicamente visivel/ativo, mas a atencao do usuario nao esta mais nele.
  // liveshopAdsOpened dispara ja na primeira transicao (canto) e continua
  // "aberto" durante o modal expandido tambem, entao usamos essa flag pra
  // pausar a contagem de visualizacao do carrossel enquanto isso acontece
  let isVideoOpen = false;
  // enquanto o video esta aberto (canto ou expandido), o usuario pode rolar
  // verticalmente pra ver OUTROS produtos ali dentro (tipo um feed de
  // stories) - cada rolagem dispara um novo "videoLoaded". agendamos um
  // timer de 2s pro produto atual; se um novo videoLoaded chegar antes disso
  // (rolou rapido, nao ficou olhando), cancelamos e comecamos de novo pro
  // produto seguinte - mesma regra dos 2s que usamos no carrossel da home
  let pendingInnerViewTimeout = null;
  // o primeiro videoLoaded que chega depois de abrir e so a confirmacao do
  // video que a pessoa acabou de clicar - nao conta como "navegou pra outro
  // video la dentro". so a partir do segundo videoLoaded em diante e que
  // consideramos visualizacao interna de verdade
  let hasSeenInitialInnerVideo = false;

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
      // so agenda a visualizacao "interna" se o video ja estiver aberto, E
      // ja tivermos visto o videoLoaded inicial (o do video que a pessoa
      // acabou de clicar - esse nao conta, ja e coberto pelo abriu/pelo
      // watchFeaturedVideo). do segundo videoLoaded em diante e que
      // representa navegacao de verdade pra outro video la dentro
      if (isVideoOpen) {
        if (!hasSeenInitialInnerVideo) {
          hasSeenInitialInnerVideo = true;
        } else {
          scheduleInnerVideoView(lastProductName);
        }
      }
    } else if (data.action === "liveshopAdsOpened") {
      isVideoOpen = true;
      hasSeenInitialInnerVideo = false;
    } else if (data.action === "liveshopAdsClosed") {
      isVideoOpen = false;
      hasSeenInitialInnerVideo = false;
      if (pendingInnerViewTimeout) {
        clearTimeout(pendingInnerViewTimeout);
        pendingInnerViewTimeout = null;
      }
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
      // mantemos "click" e "touchend" (o clique sozinho nao disparou de forma
      // confiavel em teste real) - mas com um debounce de 500ms, pra contar
      // so uma vez quando os dois disparam pro mesmo toque no mobile
      let lastExpandTrackedAt = 0;
      ["click", "touchend"].forEach(function (eventType) {
        btn.addEventListener(eventType, function () {
          let now = Date.now();
          if (now - lastExpandTrackedAt < 500) return;
          lastExpandTrackedAt = now;

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

  // o carrossel duplica os videos no DOM pra fazer a rolagem parecer infinita
  // (o swiper cria copias extras dos slides pra rolagem nunca "acabar"), entao
  // controlamos "ja visualizado" por nome de produto, nao por elemento (senao
  // cada copia duplicada do mesmo video contaria como uma view nova)
  let viewedProducts = {};
  let viewedWithoutProduct = false;
  // dicionario separado do viewedProducts (do carrossel) - visualizacao
  // "interna" e uma pergunta de negocio diferente (profundidade de
  // engajamento pos-clique, nao exposicao pre-clique), entao um produto ja
  // visto no carrossel ainda pode disparar aqui dentro, e vice-versa
  let viewedProductsInner = {};

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

  // versao do trackVideoView pra visualizacoes dentro do video ja aberto -
  // nao temos acesso ao DOM interno (conteudo de outra origem), so o nome do
  // produto via postMessage, entao a deduplicacao usa o mesmo viewedProducts
  function scheduleInnerVideoView(productName) {
    if (pendingInnerViewTimeout) {
      clearTimeout(pendingInnerViewTimeout);
    }
    pendingInnerViewTimeout = setTimeout(function () {
      pendingInnerViewTimeout = null;
      // se o video fechou ou o usuario ja rolou pra outro produto nesse
      // meio tempo, lastProductName mudou e esse "view" fica invalido
      if (!isVideoOpen || lastProductName !== productName) return;

      let productKey = normalizeProductName(productName);
      if (!viewedProductsInner[productKey]) {
        viewedProductsInner[productKey] = true;
        // label diferente de proposito ("interno"), pra nao entrar na mesma
        // metrica de "visualizado" do carrossel - essa acontece so depois
        // de um "abriu" ja ter ocorrido, entao misturar com a outra
        // inflaria o denominador do CTR sem contrapartida no numerador
        sendGAEvent("video_commerce_home_visualizado_interno", "view");
        sendGAEvent(
          "video_commerce_home_visualizado_interno_" + productKey,
          "view",
        );
      }
    }, VIEW_FEATURED_MS);
  }

  function watchFeaturedVideo(carouselEl, videos) {
    let visibleMs = new Map();
    let triggeredWhileFeatured = new Set();

    let interval = setInterval(function () {
      // o carrossel duplica elementos pra rolagem infinita, e o swiper vai
      // reciclando esses mesmos elementos pra mostrar produtos diferentes com
      // o tempo - entao nao existe um "ja verifiquei todo mundo, terminei"
      // valido aqui. so paramos quando o carrossel de fato sai da pagina
      // (isConnected fica false, ex: usuario navegou pra outra rota da SPA)
      if (!carouselEl.isConnected) {
        clearInterval(interval);
        return;
      }

      let carouselVisible = isSubstantiallyVisible(carouselEl);

      videos.forEach(function (video) {
        // isVideoOpen pausa a contagem enquanto o card esta no canto ou
        // expandido (ver comentario no topo do arquivo)
        if (carouselVisible && !isVideoOpen && isFeaturedVideo(video)) {
          let elapsed = (visibleMs.get(video) || 0) + VIEW_CHECK_INTERVAL_MS;
          visibleMs.set(video, elapsed);
          // triggeredWhileFeatured evita reenviar o evento repetidamente
          // enquanto o mesmo elemento continua em destaque por muito tempo -
          // mas reseta assim que ele deixa de estar em destaque, entao se o
          // swiper reciclar esse elemento pra um produto novo depois, ele
          // ganha uma chance nova de ser contado (a deduplicacao real, por
          // produto e nao por elemento, continua sendo o viewedProducts)
          if (elapsed >= VIEW_FEATURED_MS && !triggeredWhileFeatured.has(video)) {
            triggeredWhileFeatured.add(video);
            trackVideoView(video);
          }
        } else {
          visibleMs.set(video, 0);
          triggeredWhileFeatured.delete(video);
        }
      });
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

    // mantemos "click" e "touchend" (o click sozinho nao disparou de forma
    // confiavel nesse elemento em teste real, culpa do Swiper interceptando
    // o touch - ver comentario no topo do arquivo). o debounce de 500ms evita
    // contar o mesmo toque 2x, e o touchstart guarda a posicao inicial do
    // dedo pra comparar com o touchend e descartar arrastos de carrossel
    videos.forEach((video) => {
      let lastOpenTrackedAt = 0;
      let touchStartPos = null;

      video.addEventListener("touchstart", function (e) {
        if (e.touches && e.touches[0]) {
          touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      });

      function handleOpen(e) {
        // se foi touchend e o dedo se moveu mais que o limite, foi arraste
        // do carrossel pra ver o proximo video, nao um toque pra abrir
        if (
          e.type === "touchend" &&
          touchStartPos &&
          e.changedTouches &&
          e.changedTouches[0]
        ) {
          let dx = e.changedTouches[0].clientX - touchStartPos.x;
          let dy = e.changedTouches[0].clientY - touchStartPos.y;
          touchStartPos = null;
          if (Math.sqrt(dx * dx + dy * dy) > TOUCH_DRAG_THRESHOLD_PX) return;
        }

        let now = Date.now();
        if (now - lastOpenTrackedAt < 500) return;
        lastOpenTrackedAt = now;

        let productVideo = video.shadowRoot.querySelector(".lav-product-name");
        if (productVideo) {
          let productName = productVideo.textContent.trim();
          sendGAEvent("video_commerce_" + normalizeProductName(productName));
        } else {
          sendGAEvent("video_commerce_video_sem_produto");
        }
        waitForExpandButton();
      }

      ["click", "touchend"].forEach(function (eventType) {
        video.addEventListener(eventType, handleOpen);
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
