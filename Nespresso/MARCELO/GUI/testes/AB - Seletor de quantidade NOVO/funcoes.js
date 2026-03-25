//Executa uma função após update no carrinho
window.napi.data().on("cart.update", handleCartUpdate);

//Faz a captura de todos os produtos no carrinho
await window.napi.cart().read();

//Pega todas as informações de um produto específico
await window.napi.catalog().getProduct(SKU);

//Adicionar ao carrinho SKU específico
await window.CartManager.updateItem(
  productSku,
  capsulesQuantity,
  null,
  null,
  false
);

//HTML do botão de adicionar ao carrinho
let htmlAddCart =
  `'<div class="add-to-bag" data-product-id="erp.br.b2c/prod/` +
  pushSku +
  `" data-button-size="small"></div>'`;

//Inicializa botão de adicionar ao carrinho
function initializeMosaicModules() {
  if (
    typeof mosaic !== "undefined" &&
    document.getElementById("ID_DO_ELEMENTO")
  ) {
    setTimeout(function () {
      mosaic.initializeAllFreeHTMLModules(
        document.getElementById("ID_DO_ELEMENTO")
      );
    }, 2000);
  }
}
