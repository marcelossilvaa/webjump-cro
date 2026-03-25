function createModal(cardId, modalContent) {
  const modalId = `nespresso-modal-` + cardId;
  if (modalsCreated.has(modalId)) return modalId;

  const modalElement = document.createElement("div");
  modalElement.id = modalId;
  modalElement.className = "nespresso-oferta-modal";
  modalElement.innerHTML =
    `
      <div class="nespresso-oferta-modal-overlay"></div>
      <div class="nespresso-oferta-modal-container">
        <div class="nespresso-oferta-modal-header">
          <button class="nespresso-oferta-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="nespresso-oferta-modal-content">
          <div class="nespresso-oferta-modal-termos">
            ` +
    modalContent +
    `
          </div>
        </div>
      </div>
    `;

  const fragment = document.createDocumentFragment();
  fragment.appendChild(modalElement);
  document.body.appendChild(fragment);

  modalElement.addEventListener("click", (event) => {
    if (
      event.target.closest(".nespresso-oferta-modal-overlay") ||
      event.target.closest(".nespresso-oferta-modal-close")
    ) {
      modalElement.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  modalsCreated.add(modalId);
  return modalId;
}
termsLink.addEventListener("click", (event) => {
  event.preventDefault();
  const modalId = termsLink.getAttribute("data-modal-id");
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
});

/* CSS Modal
      .nespresso-oferta-modal *{font-family:NespressoLucas,Helvetica,Arial,sans-serif}
      .nespresso-oferta-modal{position:fixed;top:0;left:0;width:100%;height:100%;display:none;z-index:2000}
      .nespresso-oferta-modal-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);cursor:pointer}
      .nespresso-oferta-modal-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:8px;max-width:90%;width:550px;max-height:90vh;box-shadow:0 5px 15px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;z-index:2001}
      .nespresso-oferta-modal-header{display:flex;justify-content:flex-end;padding:10px;background:#f8f8f8;border-bottom:1px solid #e5e5e5}
      .nespresso-oferta-modal-close{background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s ease}
      .nespresso-oferta-modal-close:hover{opacity:.7}
      .nespresso-oferta-modal-close svg{width:18px;height:18px;color:#666}
      .nespresso-oferta-modal-content{padding:20px;overflow-y:auto;max-height:calc(70vh - 60px);line-height:1.5;color:#333;font-size:14px}
      @media(max-width:480px){
        .nespresso-oferta-modal-container{width:85%}
        .nespresso-oferta-modal-content{padding:15px}
        .nespresso-oferta-modal-header{padding:8px 12px}
      }

*/
