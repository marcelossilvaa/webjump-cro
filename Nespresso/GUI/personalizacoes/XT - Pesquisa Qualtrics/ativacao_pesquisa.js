function activateIntercept() {
  if (typeof QSI !== "undefined" && QSI.API) {
    QSI.API.unload();
    QSI.API.load().then(function () {
      QSI.API.run();
    });
  } else {
    setTimeout(activateIntercept, 500);
  }
}

activateIntercept();
