(function () {
  var variationText = "Experiências e Ingressos";

  function renameMenu() {
    document.querySelectorAll('div[role="button"] p').forEach(function (p) {
      var txt = p.textContent.trim();
      if (txt === "Ingressos e Passeios" || txt === "Ingressos") {
        p.textContent = variationText;
      }
    });
  }
  renameMenu();
  var attempts = 0;
  var intervalId = setInterval(function () {
    attempts++;
    renameMenu();

    var stillHasOldText = Array.from(
      document.querySelectorAll('div[role="button"] p')
    ).some(function (p) {
      return p.textContent.trim() === "Ingressos e Passeios";
    });

    if (!stillHasOldText || attempts > 20) {
      clearInterval(intervalId);
    }
  }, 200);
})();
