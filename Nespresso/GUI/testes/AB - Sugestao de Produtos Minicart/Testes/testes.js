let produto = undefined;
napi
  .catalog()
  .getProduct("7019.10")
  .then(function (value) {
    produto = value;
  });
