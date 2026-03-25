let container = `<nb-container
  campaign_id="personalization-recomendacao-cart"
  campaign_name="personalization-recomendacao-cart"
  campaign_position="recommendation_cart_v1"
  campaign_creative="recommendation_cart_v1"
  >
  <div
    id="at-addtocart-modal-atc-btn"
    class="add-to-bag"
    data-product-id="erp.br.b2c/prod/7919.90"
    data-button-size="small"
    data-tracking-id="RECOMENDAÇÃO DO CARRINHO"
  ></div>
</nb-container>`;

(function () {
  "use strict";

  const MODAL_ID = "at-addtocart-modal";

  const styles = `
    #${MODAL_ID}-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    }
    #${MODAL_ID} {
      background: #fff;
      border-radius: 8px;
      padding: 32px;
      max-width: 480px;
      width: 90%;
      position: relative;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    #${MODAL_ID} .at-modal__close {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    #${MODAL_ID} .at-modal__title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
    }
  `;

  function injectStyles() {
    if (document.getElementById("at-addtocart-styles")) return;
    const styleTag = document.createElement("style");
    styleTag.id = "at-addtocart-styles";
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }

  function closeModal() {
    const overlay = document.getElementById(`${MODAL_ID}-overlay`);
    if (overlay) overlay.remove();
  }

  function openModal() {
    if (document.getElementById(`${MODAL_ID}-overlay`)) return;

    const overlay = document.createElement("div");
    overlay.id = `${MODAL_ID}-overlay`;

    overlay.innerHTML = `
      <div id="${MODAL_ID}">
        <button class="at-modal__close" aria-label="Fechar">&#x2715;</button>
        <p class="at-modal__title">Adicionar ao carrinho</p>
        ${container}
      </div>
    `;

    overlay
      .querySelector(".at-modal__close")
      .addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    document.body.appendChild(overlay);

    mosaic.initializeAllFreeHTMLModules(
      document.getElementById(`${MODAL_ID}-atc-btn`).parentElement,
    );
  }

  injectStyles();
  openModal();
})();
