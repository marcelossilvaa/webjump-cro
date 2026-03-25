let teste = "";
window.napi.data().on("cart.update", function () {
  window.napi
    .cart()
    .read()
    .then(function (data) {
      if (data.length == 0) {
      } else {
        
      }
    });
});
