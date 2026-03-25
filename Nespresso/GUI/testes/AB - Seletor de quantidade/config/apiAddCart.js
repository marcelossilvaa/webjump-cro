const buttonSize = "large"; // small const containerId = 'the-id-of-my-div-i-want-to-inject-add-to-cart' // it will do document.getElementById('') and create the button inside const productId= 'erp.us.b2c/prod/133485' window.napi .getConfig() .then(() => { window.ui = window.ui || [] window.ui.push({ id: containerId, module: 'AddToBagButton', configuration: { props: { productId, buttonSize } }, ecommerceData: { activated: true } }) }) .catch(e => console.error(e))
const onAddToCart = (e) => {
  e.preventDefault();
  const btn = e.target.closest("button");
  const skus = btn.getAttribute("data-skus");
  const promises = skus
    .split(",")
    .map((sku) => window.CartManager.updateItem(sku, 10, null, null, true));
  // Promise.all(promises).then(payload => ())
};
const createButton = (skus) => {
  const btn = window.document.createElement("button");
  btn.setAttribute("data-skus", skus);
  btn.innerText = `Hello world`;
  const container = window.document.getElementById("main");
  container.insertBefore(btn, container.firstChild);
  btn.addEventListener("click", onAddToCart);
};
createButton(["7742.30", "7743.30"]);

window.CartManager.updateItem("7866.90", 20, null, null, false);
