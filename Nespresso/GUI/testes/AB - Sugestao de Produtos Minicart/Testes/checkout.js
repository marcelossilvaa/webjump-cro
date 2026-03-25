//Captar informações do cliente como por exemplo, Tecnologia de preferência
let customerData = undefined;
window.napi
  .customer()
  .read()
  .then(function (data) {
    customerData = data;
  });

//Pedidos Checkout
let pedidosPassadosCheckout = undefined;
window.napi
  .checkout()
  .getMyOrders()
  .then(function (pedidos) {
    pedidosPassadosCheckout = pedidos;
  });

//Captar produto do catalogo
let produtoCatalogo = undefined;
window.napi
  .catalog()
  .getProduct("7748.10")
  .then(function (value) {
    produtoCatalogo = value;
  });

if (customerData) {
  let preferenceTech =
    customerData && customerData.preferredTechnology.includes("original")
      ? "ol"
      : "vl";
}
