let checkoutCTALabels = {
  totalLabel: "Total:",
  stepOneCTALabel: "Seguir com checkout",
  stepTwoCTALabel: "Seguir com pagamento",
  stepThreeCTALabel: "Faça seu pedido",
};

let aguardandoCarregamentoDOM = setInterval(function () {
  if (document.readyState == "complete") {
    clearInterval(aguardandoCarregamentoDOM);
    setFixedCheckoutButton();
  }
}, 500);

function setFixedCheckoutButton() {
  alert("executou código checkout");
  if (document.querySelector(".PageCheckout")) {
    document.head.insertAdjacentHTML(
      +-"beforeend",
      "<style>.responsive-shopping-bag__controls.isSticky,.stickey-container {visibility: hidden;}.delivery-footer {margin-bottom: 1px;}.responsive-shopping-bag__controls.isSticky + .stickey-container, .delivery-footer:has(> .isSticky) + .stickey-container {visibility: visible;}.responsive-shopping-bag__controls{padding: 24px}.stickey-container{z-index: 120;font-family: NespressoLucas;padding: 25px;position: fixed;left: 0;bottom: 0;background: #fff;width: 100%;border-top: 1px solid #C5C5C5;-webkit-box-shadow: 0px -2px 6px 1px rgba(212,212,212,1);-moz-box-shadow: 0px -2px 6px 1px rgba(212,212,212,1);box-shadow: 0px -2px 6px 1px rgba(212,212,212,1)}.centering-section{width: 996px;margin: 0 auto;display: flex;flex-direction: row;justify-content: flex-end;align-items: center}.total-container{display: flex;flex-direction: column;color: #000;margin-right: 24px}.total-text,.total-value{font-size: 16px;font-style: normal;font-weight: 700;line-height: 120%;letter-spacing: 0.25px}.total-text{color: #000}.total-value{color: #876c43}.loading{width: 30px;padding: 8px 0 0 0}@media screen and (max-width: 765px){.centering-section{width: 100%}.total-container{min-width:27%}}</style>"
    );
    let etapaCarrinho = document.querySelector("#shoppingbag-form"),
      etapaEntrega = document.querySelector("#shippingInfoDTO"),
      etapaPagamento = document.querySelector("#paymentInfoDTO"),
      etapaFinal = document.querySelector(".delivery-footer");
    if (etapaCarrinho) {
      setTimeout(function () {
        alert("adicionou CTA FIXO");
        addFixedCTA(
          ".responsive-shopping-bag__controls",
          "#ta-checkout-bottom",
          "stepOneCTALabel"
        );
      }, 3000);
    }
  }
}

function addFixedCTA(elementAppend, originalCTA, textoCTA) {
  let fixedCTAHTML =
    `<div class="stickey-container"><div class="centering-section"><div class="total-container"><span class="loading"><svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" height="30px" viewBox="-2.63 -2.63 31.61 31.61" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.158094"/><g id="SVGRepo_iconCarrier"><g><g><circle cx="13.792" cy="3.082" r="3.082"/><circle cx="13.792" cy="24.501" r="1.849"/><circle cx="6.219" cy="6.218" r="2.774"/><circle cx="21.365" cy="21.363" r="1.541"/><circle cx="3.082" cy="13.792" r="2.465"/><circle cx="24.501" cy="13.791" r="1.232"/><path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05 C6.902,18.996,5.537,18.988,4.694,19.84z"/><circle cx="21.364" cy="6.218" r="0.924"/></g></g></g></svg></span></div><button type="submit" id="CTA-dummy" class="btn-container btn button-primary button-right-icon responsive-shopping-bag__proceed--bottom"><span class="button__content">` +
    checkoutCTALabels[textoCTA] +
    `</span><i class="responsive-icon Glyph Glyph--arrow-right" aria-hidden="true"></i></button></div></div>`;
  document
    .querySelector(elementAppend)
    .insertAdjacentHTML("afterend", fixedCTAHTML),
    document.querySelector("#CTA-dummy").addEventListener("click", function () {
      window.gtmDataObject.push({
        event: "customEvent",
        eventCategory: "AB Test Events",
        eventAction: "Click",
        eventLabel: "Sticky proceed to checkout",
        eventRaisedBy: "HQ AB Test Team",
      });
      let e = new Event("click");
      document.querySelector(originalCTA).dispatchEvent(e);
    }),
    setTimeout(() => {
      let e,
        t = document.querySelectorAll(".shopping-bag-total tfoot tr"),
        n = document.querySelector("#ta-payment-total"),
        i = document.querySelector(".total-container");
      t.length > 0
        ? (e = t[1].childNodes[3].innerText)
        : n && (e = n.innerText),
        e &&
          (document.querySelector(".loading").remove(),
          i.insertAdjacentHTML(
            "afterbegin",
            `<span class="total-text">` +
              checkoutCTALabels.totalLabel +
              `</span><span class="total-value">` +
              e +
              `</span>`
          ));
    }, 500);
}

function r(e, t, o) {
  0 === e[0].intersectionRatio
    ? document.querySelector(t).classList.add(o)
    : 1 === e[0].intersectionRatio &&
      document.querySelector(t).classList.remove(o);
}

function e() {
  let t = document.querySelector("#ta-continue-bottom");
  if (t) {
    n.observe(t, { attributes: !0, childList: !0, subtree: !0 });
  } else window.setTimeout(e, 500);
}
