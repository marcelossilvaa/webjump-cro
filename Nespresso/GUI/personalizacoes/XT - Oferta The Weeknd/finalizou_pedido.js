(function () {
  if (window.ofertaTheWeekndModal) {
    return;
  }
  window.ofertaTheWeekndModal = true;
  // ============================================
  // CONFIGURAÇÃO - OFERTA THE WEEKND
  // ============================================
  var modalCreated = false;
  var BACKGROUND_IMAGE =
    "https://www.nespresso.com/ecom/medias/sys_master/public/49225306341406/520x644.jpg?";
  var CTA_URL = "https://euqueronestle.com.br/promo/promocaonespresso";

  // ============================================
  // GA4 ADOBE TARGET SCRIPT
  // ============================================
  function pushAdobeTargetEvent() {
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: "adobe_target",
        event_raised_by: "adobe target",
        experiment_id: "${campaign.id}",
        experiment_type: "XT",
        experiment_name: "${campaign.name}",
        experiment_variant_id: "${campaign.recipe.id}",
        experiment_variant: "${campaign.recipe.name}",
      });
    } catch (error) {
      console.error(
        "[Weeknd Modal] Erro ao enviar evento Adobe Target:",
        error,
      );
    }
  }

  // ============================================
  // BOTÃO DE FECHAR
  // ============================================
  function createCloseButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.style.cssText =
      "position: absolute; right: 15px; top: 15px; background: rgba(255,255,255,0.7); border: none; cursor: pointer; color: #000; font-size: 24px; line-height: 1; padding: 0; z-index: 10; opacity: 0.8; transition: opacity 0.3s, background 0.3s; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;";
    button.innerHTML = "&times;";
    button.addEventListener("mouseenter", function () {
      button.style.opacity = "1";
      button.style.background = "rgba(255,255,255,0.9)";
    });
    button.addEventListener("mouseleave", function () {
      button.style.opacity = "0.8";
      button.style.background = "rgba(255,255,255,0.7)";
    });
    button.addEventListener("click", function () {
      closeModal();
    });
    return button;
  }

  // ============================================
  // ESTILOS
  // ============================================
  function addStyles() {
    if (document.getElementById("weeknd-modal-styles")) return;

    var style = document.createElement("style");
    style.id = "weeknd-modal-styles";
    style.textContent = [
      "@font-face {",
      "    font-family: 'NespressoLucas';",
      "    src: url('https://www.nespresso.com/shared_res/fonts/NespressoLucas-Regular.woff2') format('woff2');",
      "    font-weight: 400;",
      "    font-style: normal;",
      "}",
      "@font-face {",
      "    font-family: 'NespressoLucas';",
      "    src: url('https://www.nespresso.com/shared_res/fonts/NespressoLucas-Bold.woff2') format('woff2');",
      "    font-weight: 700;",
      "    font-style: normal;",
      "}",
      "",
      "@keyframes weeknd-fade-in { from { opacity: 0; } to { opacity: 1; } }",
      "@keyframes weeknd-fade-out { from { opacity: 1; } to { opacity: 0; } }",
      "@keyframes weeknd-scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }",
      "@keyframes weeknd-scale-out { from { transform: scale(1); opacity: 1; } to { transform: scale(0.9); opacity: 0; } }",
      "",
      ".weeknd-modal-overlay {",
      "    position: fixed; top: 0; left: 0; width: 100%; height: 100%;",
      "    background: rgba(0, 0, 0, 0.85); z-index: 99999;",
      "    display: flex; justify-content: center; align-items: center;",
      "    animation: weeknd-fade-in 0.3s ease-out;",
      "    font-family: 'NespressoLucas', 'Montserrat', sans-serif;",
      "}",
      ".weeknd-modal-overlay.closing { animation: weeknd-fade-out 0.3s ease-in forwards; }",
      "",
      ".weeknd-modal {",
      "    position: relative;",
      "    width: 520px;",
      "    height: 763px;",
      "    max-width: 95vw;",
      "    max-height: 90vh;",
      "    background: url('" + BACKGROUND_IMAGE + "') no-repeat center top;",
      "    background-size: cover;",
      "    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);",
      "    display: flex; flex-direction: column;",
      "    animation: weeknd-scale-in 0.4s ease-out;",
      "    overflow: hidden;",
      "    border-radius: 45px;",
      "}",
      ".weeknd-modal.closing { animation: weeknd-scale-out 0.3s ease-in forwards; }",
      "",
      ".weeknd-modal-content {",
      "    flex: 1;",
      "    display: flex;",
      "    flex-direction: column;",
      "    justify-content: flex-end;",
      "    padding: 30px;",
      "    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, transparent 70%);",
      "}",
      "",
      ".weeknd-text-wrapper {",
      "    text-align: center;",
      "    color: #fff;",
      "    margin-bottom: 20px;",
      "}",
      "",
      ".weeknd-text-wrapper .weeknd-pretitle {",
      "    font-size: 14px;",
      "    font-weight: 400;",
      "    letter-spacing: 2px;",
      "    text-transform: uppercase;",
      "    margin: 0 0 4px 0;",
      "    color: #ccc;",
      "}",
      "",
      ".weeknd-text-wrapper .weeknd-title {",
      "    font-size: 20px;",
      "    font-weight: 700;",
      "    line-height: 1.3;",
      "    margin: 0 0 12px 0;",
      "    text-transform: uppercase;",
      "    letter-spacing: 0.5px;",
      "}",
      "",
      ".weeknd-text-wrapper .weeknd-description {",
      "    font-size: 14px;",
      "    font-weight: 400;",
      "    line-height: 1.5;",
      "    margin: 0;",
      "    color: #ddd;",
      "}",
      "",
      ".weeknd-cta-wrapper {",
      "    display: flex; flex-direction: column; gap: 10px; align-items: center;",
      "    margin-bottom: 10px;",
      "}",
      "",
      ".weeknd-cta {",
      "    display: inline-block;",
      "    background-color: #fff;",
      "    color: #1a1a1a;",
      "    text-decoration: none;",
      "    text-align: center;",
      "    padding: 12px 28px;",
      "    border-radius: 30px;",
      "    font-weight: 700;",
      "    text-transform: uppercase;",
      "    letter-spacing: 1px;",
      "    font-size: 14px;",
      "    transition: all 0.3s ease;",
      "    border: 2px solid #fff;",
      "    cursor: pointer;",
      "    min-width: 240px;",
      "}",
      ".weeknd-cta:hover {",
      "    background-color: transparent;",
      "    color: #fff;",
      "    transform: translateY(-2px);",
      "    box-shadow: 0 4px 12px rgba(255,255,255,0.2);",
      "}",
      ".weeknd-cta:active {",
      "    transform: translateY(0);",
      "}",
      "",
      ".weeknd-terms {",
      "    font-size: 10px;",
      "    color: #999;",
      "    text-align: center;",
      "    line-height: 1.4;",
      "    margin-top: 10px;",
      "    padding: 0 10px;",
      "}",
      "",
      "@media (max-width: 520px) {",
      "    .weeknd-modal {",
      "        width: 95%;",
      "        height: auto;",
      "        min-height: calc(95vw * 1.2385);",
      "        aspect-ratio: 520/644;",
      "        background-size: cover;",
      "        background-position: center top;",
      "    }",
      "    .weeknd-modal-content { padding: 20px; }",
      "    .weeknd-text-wrapper .weeknd-title { font-size: 17px; }",
      "    .weeknd-text-wrapper .weeknd-description { font-size: 12px; }",
      "    .weeknd-cta { padding: 10px 24px; font-size: 12px; min-width: 200px; }",
      "    .weeknd-terms { font-size: 7px; }",
      "}",
      "@media (max-width: 400px) {",
      "    .weeknd-cta { padding: 10px 20px; font-size: 14px; min-width: 180px; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);
  }

  // ============================================
  // CONSTRUÇÃO DO MODAL
  // ============================================
  function createModal() {
    if (modalCreated) return;
    addStyles();

    // Overlay
    var overlay = document.createElement("div");
    overlay.className = "weeknd-modal-overlay";
    overlay.setAttribute("data-weeknd-modal-overlay", "true");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    // Modal Container
    var modal = document.createElement("div");
    modal.className = "weeknd-modal";
    modal.setAttribute("data-weeknd-modal", "true");

    // Close Button
    var closeBtn = createCloseButton();
    modal.appendChild(closeBtn);

    // Content
    var content = document.createElement("div");
    content.className = "weeknd-modal-content";

    // Text Section
    var textWrapper = document.createElement("div");
    textWrapper.className = "weeknd-text-wrapper";

    var pretitle = document.createElement("p");
    pretitle.className = "weeknd-pretitle";
    pretitle.textContent = "CONCORRA A";

    var title = document.createElement("h2");
    title.className = "weeknd-title";
    title.innerHTML = "1 PAR DE INGRESSOS PARA A TOUR THE WEEKND";

    var description = document.createElement("p");
    description.className = "weeknd-description";
    description.innerHTML =
      "Sua compra pode te levar ao show.<br>Cadastre-se na promoção e concorra!";

    textWrapper.appendChild(pretitle);
    textWrapper.appendChild(title);
    textWrapper.appendChild(description);

    // CTA Section
    var ctaWrapper = document.createElement("div");
    ctaWrapper.className = "weeknd-cta-wrapper";

    var cta = document.createElement("a");
    cta.className = "weeknd-cta";
    cta.href = CTA_URL;
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    cta.textContent = "CADASTRE-SE AGORA";

    cta.addEventListener("click", function () {
      try {
        window.gtmDataObject = window.gtmDataObject || [];
        window.gtmDataObject.push({
          event: "local_event",
          event_raised_by: "br",
          local_event_category: "oferta_the_weeknd",
          local_event_action: "click",
          local_event_label: "xt_adobe_target_modal_weeknd_cta_click",
        });
      } catch (error) {
        console.error(
          "[Weeknd Modal] Erro ao enviar evento GTM (clique):",
          error,
        );
      }
    });

    ctaWrapper.appendChild(cta);

    // T&C
    var terms = document.createElement("p");
    terms.className = "weeknd-terms";
    terms.textContent =
      "Promoção válida para compras realizadas, exclusivamente, nos canais próprios da marca Nespresso. Período de Participação: 10/03/2026 até às 18h (horário de Brasília) do dia 30/03/2026. Consulte os produtos participantes, o regulamento completo e o Certificado de Autorização SPA/MF no site euqueronestle.com.br/promo/promocaonespresso antes de participar. Guarde todos os comprovantes fiscais originais cadastrados. Imagens meramente ilustrativas.";

    content.appendChild(textWrapper);
    content.appendChild(ctaWrapper);
    content.appendChild(terms);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modalCreated = true;

    // Evento de visualização do modal
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: "local_event",
        event_raised_by: "br",
        local_event_category: "oferta_the_weeknd",
        local_event_action: "view",
        local_event_label: "xt_adobe_target_modal_weeknd_view",
      });
    } catch (error) {
      console.error(
        "[Weeknd Modal] Erro ao enviar evento GTM (exibição):",
        error,
      );
    }
  }

  function closeModal() {
    var overlay = document.querySelector("[data-weeknd-modal-overlay]");
    var modal = document.querySelector("[data-weeknd-modal]");

    if (overlay && modal) {
      try {
        window.gtmDataObject = window.gtmDataObject || [];
        window.gtmDataObject.push({
          event: "local_event",
          event_raised_by: "br",
          local_event_category: "oferta_the_weeknd",
          local_event_action: "close",
          local_event_label: "xt_adobe_target_modal_weeknd_close",
        });
      } catch (error) {
        console.error(
          "[Weeknd Modal] Erro ao enviar evento GTM (fechamento):",
          error,
        );
      }

      overlay.classList.add("closing");
      modal.classList.add("closing");
      setTimeout(function () {
        overlay.remove();
        modalCreated = false;
      }, 300);
    }
  }

  // ============================================
  // VERIFICAÇÃO DE ELEGIBILIDADE POR SKU
  // ============================================
  var skusElegiveis = ["7921.90", "7077.80", "7082.80", "150331", "150343"];

  function checkEligibility() {
    return window.napi
      .checkout()
      .getMyOrders()
      .then(function (data) {
        var orders = data && data.orders;
        if (!orders || orders.length === 0) return false;

        var lastOrder = orders[0];
        var cartLines = lastOrder.quotation && lastOrder.quotation.cartLines;
        if (!cartLines || cartLines.length === 0) return false;

        return cartLines.some(function (line) {
          var item = line.item || "";
          return skusElegiveis.some(function (sku) {
            return item.indexOf(sku) !== -1;
          });
        });
      });
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  function init() {
    checkEligibility()
      .then(function (eligible) {
        if (eligible) {
          pushAdobeTargetEvent();
          createModal();
        }
      })
      .catch(function (error) {
        console.error("[Weeknd Modal] Erro ao verificar elegibilidade:", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
