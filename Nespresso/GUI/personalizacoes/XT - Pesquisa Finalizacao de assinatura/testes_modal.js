(function () {
  "use strict";

  const STYLE = `
    .pesquisa-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: "NespressoLucas", Helvetica, sans-serif;
    }

    .pesquisa-modal {
      background: #fff;
      border-radius: 8px;
      max-width: 560px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      position: relative;
    }

    .pesquisa-modal__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 24px 24px 16px;
    }

    .pesquisa-modal__title {
      font-size: 20px;
      font-weight: 700;
      color: #17171a;
      margin: 0;
      line-height: 1.3;
      padding-right: 16px;
    }

    .pesquisa-modal__close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .pesquisa-modal__close svg {
      width: 24px;
      height: 24px;
    }

    .pesquisa-modal__body {
      padding: 0 24px;
    }

    .pesquisa-modal__description {
      font-size: 14px;
      color: #17171a;
      line-height: 1.5;
      margin: 0 0 24px;
    }

    .pesquisa-modal__section {
      margin-bottom: 20px;
    }

    .pesquisa-modal__section-title {
      font-size: 14px;
      font-weight: 700;
      color: #17171a;
      display: block;
      margin-bottom: 4px;
    }

    .pesquisa-modal__section-content {
      font-size: 14px;
      color: #17171a;
      line-height: 1.5;
    }

    .pesquisa-modal__delivery-title {
      font-size: 14px;
      font-weight: 700;
      color: #17171a;
      margin: 0 0 4px;
    }

    .pesquisa-modal__delivery-description {
      font-size: 14px;
      color: #17171a;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
    }

    .pesquisa-modal__delivery-description button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      display: inline-flex;
      align-items: center;
    }

    .pesquisa-modal__delivery-price {
      font-size: 14px;
      color: #006a4e;
      font-weight: 600;
    }

    .pesquisa-modal__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 24px;
      gap: 12px;
    }

    .pesquisa-modal__link {
      display: block;
      color: #17171a;
      font-size: 14px;
      text-decoration: underline;
      text-align: left;
      white-space: nowrap;
    }

    .pesquisa-modal__link:hover {
      color: #006a4e;
    }

    .pesquisa-modal__btn {
      font-size: 14px;
      font-weight: 600;
      padding: 12px 20px;
      border-radius: 24px;
      cursor: pointer;
      white-space: nowrap;
    }

    .pesquisa-modal__btn--outline {
      background: #fff;
      border: 2px solid #17171a;
      color: #17171a;
    }

    .pesquisa-modal__btn--outline:hover {
      background: #f5f5f5;
    }

    .pesquisa-modal__btn--filled {
      background: #17171a;
      border: 2px solid #17171a;
      color: #fff;
    }

    .pesquisa-modal__btn--filled:hover {
      background: #333;
    }
  `;

  function createModal() {
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    const overlay = document.createElement("div");
    overlay.className = "pesquisa-modal-overlay";
    overlay.innerHTML = `
      <div class="pesquisa-modal" role="dialog" aria-modal="true" aria-labelledby="pesquisa-modal-heading">
        <header class="pesquisa-modal__header">
          <h5 id="pesquisa-modal-heading" class="pesquisa-modal__title">Sua Assinatura de Café foi criado com sucesso!</h5>
          <button type="button" class="pesquisa-modal__close" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71a1 1 0 1 0-1.42 1.42L10.59 12l-4.89 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41Z"/>
            </svg>
          </button>
        </header>
        <div class="pesquisa-modal__body">
          <p class="pesquisa-modal__description">Obrigado por configurar sua Assinatura de Café. Verifique seu e-mail e tenha todas as informações relacionadas a seu pedido.</p>

          <div class="pesquisa-modal__section">
            <span class="pesquisa-modal__section-title">Endereço de entrega</span>
            <div class="pesquisa-modal__section-content">
              <div>Senhor Guilherme Souza</div>
              <div>R Iracema Pereira Resende, Castolira</div>
              <div>12405480 São Paulo</div>
            </div>
          </div>

          <div class="pesquisa-modal__section">
            <span class="pesquisa-modal__section-title">Modo de Entrega</span>
            <div class="pesquisa-modal__section-content">
              <h3 class="pesquisa-modal__delivery-title">Entrega Padrão</h3>
              <div class="pesquisa-modal__delivery-description">
                <span>Clique em SAIBA MAIS e confira os prazos de entrega.</span>
                <button aria-label="Saiba mais">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C5.74 2 2 5.74 2 12s3.74 10 10 10 10-3.74 10-10S18.26 2 12 2Zm0 19c-5.72 0-9-3.28-9-9 0-5.72 3.28-9 9-9 5.72 0 9 3.28 9 9 0 5.72-3.28 9-9 9Z"></path>
                    <path d="M12.5 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM13 9h-3v1h2v5h-2v1h5v-1h-2V9Z"></path>
                  </svg>
                </button>
              </div>
              <div class="pesquisa-modal__delivery-price">R$ 10,90</div>
            </div>
          </div>

          <div class="pesquisa-modal__section">
            <span class="pesquisa-modal__section-title">Próximo envio</span>
            <div class="pesquisa-modal__section-content">30 de dez. de 2029</div>
          </div>
        </div>
        <footer class="pesquisa-modal__footer">
          <a id="pesquisa-finalizacao-assinatura" class="pesquisa-modal__link" href="https://nestleglobalmktg.qualtrics.com/jfe/form/SV_3Eh4P5icsXekthA" target="_blank" rel="noopener noreferrer">Como foi sua experiência?</a>
          <button type="button" class="pesquisa-modal__btn pesquisa-modal__btn--outline">Verifique seu pedido</button>
          <button type="button" class="pesquisa-modal__btn pesquisa-modal__btn--filled">Continuar</button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close modal handlers
    const closeBtn = overlay.querySelector(".pesquisa-modal__close");
    const continueBtn = overlay.querySelector(".pesquisa-modal__btn--filled");

    function closeModal() {
      overlay.remove();
      styleEl.remove();
    }

    closeBtn.addEventListener("click", closeModal);
    continueBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  createModal();
})();
