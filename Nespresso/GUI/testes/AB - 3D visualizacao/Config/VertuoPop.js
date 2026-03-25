(function () {
  function initNewVisualization() {
    const iframeURL =
      "https://view.ocavu.com/nespresso/vertuo-color-configurator?configurator_Descriptions=cup";
    const modalHTML =
      `
    <div id="iframe-modal-new-nespresso" class="iframe-modal-new-nespresso">
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="iframe-container">
          <iframe id="a8e1c993-58e5-4b82-b36a-0e1380c88f8b"
            frameborder="0"
            title="Ocavu Experience"
            src="` +
      iframeURL +
      `"
            allowtransparency="true"
            allow="xr-spatial-tracking; fullscreen"
            allowfullscreen="true">
          </iframe>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style>
     iframe:not(#iframe-modal-new-nespresso iframe){
      display:none !important;
     }
      .iframe-modal-new-nespresso {
        display: none;
        position: fixed;
        z-index: 2147483647;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
      }
      .modal-content {
        position: relative;
        background-color: white;
        margin: 5% auto;
        width: 90%;
        height: 90%;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .close-modal {
        position: absolute;
        top: 10px;
        right: 20px;
        color: #333;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        z-index: 2147483648;
      }
      .iframe-container {
        width: 100%;
        height: 100%;
      }
      .iframe-container iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>`
    );
    function openModal() {
      document.getElementById("iframe-modal-new-nespresso").style.display =
        "block";
    }
    function closeModal() {
      document.getElementById("iframe-modal-new-nespresso").style.display =
        "none";
    }
    ctaElement = document.querySelector("nb-cta-3d");
    if (ctaElement) {
      ctaElement.addEventListener("click", openModal);
    }
    const closeButton = document.querySelector(".close-modal");
    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }
    const modal = document.getElementById("iframe-modal-new-nespresso");
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === this) {
          closeModal();
        }
      });
    }
  }
  let ctaElement = document.querySelector("nb-cta-3d");
  let search3DCTA = setInterval(function () {
    if (ctaElement) {
      clearInterval(search3DCTA);
      initNewVisualization();
    }
    ctaElement = document.querySelector("nb-cta-3d");
  }, 200);
})();
