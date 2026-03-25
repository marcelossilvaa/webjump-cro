(function () {
  "use strict";
  const selector = "#block-8831091004917";
  const maxAttempts = 50;
  const intervalTime = 100;

  let attempts = 0;

  const intervalId = setInterval(function () {
    attempts++;

    let cafes = {
      "Café Active - 80ml": "7192.70",
      "Café Vivida - 230ml": "146924",
    };
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(intervalId);
      element.insertAdjacentHTML(
        "beforebegin",
        `<!-- tag 1 -->
            <liveshop-ads-carousel-v2 height="500px" use-active-videos-from="nespresso"></liveshop-ads-carousel-v2>
        <!-- tag 2 -->
        <liveshop-ads-carousel height="auto" width="100%" stories-style="true" border-radius="25px" slugs-video="TQnXTkMR,bTM4ZMgs"></liveshop-ads-carousel>`
      );

      const activeProducts = document
        .querySelector("#main > liveshop-ads-carousel-v2")
        ?.shadowRoot.querySelector(
          "#swiper-wrapper > div.swiper-slide.swiper-slide-active > liveshop-ads-video"
        )
        ?.shadowRoot.querySelector(".lav-products");

      if (activeProducts) {
        const productName = activeProducts.querySelector(".lav-product-name");
        const productInfo = activeProducts.querySelector(".lav-product-info");
        const sku = productName ? cafes[productName.textContent.trim()] : null;

        if (sku && productInfo) {
          productInfo.insertAdjacentHTML(
            "beforeend",
            '<div class="add-to-bag-personalizado-video-commerce"><div class="add-to-bag" data-product-id="erp.br.b2c/prod/' +
              sku +
              '" data-button-size="small"></div></div>'
          );
          const addToBagDiv = activeProducts.querySelector(
            ".add-to-bag-personalizado-video-commerce"
          );
          mosaic.initializeAllFreeHTMLModules(addToBagDiv);

          // Previne que cliques dentro da div ativem outras funcionalidades
          addToBagDiv.addEventListener("click", function (event) {
            event.stopPropagation();
          });
        }
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId);
    }
  }, intervalTime);
})();
