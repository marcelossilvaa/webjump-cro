let cafes = {
  "Café Active - 80ml": "7192.70",
  "Café Vivida - 230ml": "146924",
};
const activeProducts = document
  .querySelector("liveshop-ads-carousel-v2")
  .shadowRoot.querySelector(".swiper-horizontal .swiper-wrapper")
  .querySelectorAll("liveshop-ads-video");
activeProducts.forEach((product) => {
  const productName = product.shadowRoot.querySelector(".lav-product-name");
  const productInfo = product.shadowRoot.querySelector(".liveshop-ads-video");
  productInfo.style.position = "relative";
  const sku = "7192.70"; //productName ? cafes[productName.textContent.trim()] : null;
  if (sku && productInfo) {
    // Adiciona CSS dentro do shadowRoot se ainda não existir
    let styleElement = product.shadowRoot.querySelector(
      "style#add_cart_button_video_commerce_personalized"
    );
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "add_cart_button_video_commerce_personalized";
      styleElement.textContent = `
        .add-to-cart-button {
          background-color: #257a57;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: "NespressoLucas", sans-serif;
          transition: background-color 0.3s ease;
          width: fit-content;
          height: fit-content;
          padding: 0px 8px;
          font-size: 28px;
          font-weight: 400;

          position: absolute;
          bottom: 20px;
          right: 35px;
        }
      `;
      product.shadowRoot.appendChild(styleElement);
    }

    const quantity = 10;
    const button = document.createElement("button");
    button.className = "add-to-cart-button";
    button.textContent = "+";
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      window.CartManager.updateItem(sku, quantity, null, null, false);
      alert("clicou");
    });
    productInfo.appendChild(button);
  }
});
