(function () {
  // 1. Texto da variação — altere aqui para cada variante do seu teste A/B/N
  var variationText = "Ingressos";

  // ===== Componente 1 (Menu “Ingressos e Passeios” com <img> âncora) =====
  var img = document.querySelector(
    'img[src="/content/dam/azul/voe-azul/business-unit-tab/ticket.svg"]'
  );
  if (img) {
    var button = img.closest("button");
    if (button) {
      // atualiza aria-label e alt
      var newAria = variationText + ", Selecionar";
      button.setAttribute("aria-label", newAria);
      img.alt = newAria;
      // substitui todos os <h4> dentro do botão
      button.querySelectorAll("h4").forEach(function (h4) {
        h4.textContent = variationText;
      });
    }
  }

  // ===== Componente 2 (Outro layout com SVG inline + <p> texto) =====
  document.querySelectorAll("p").forEach(function (p) {
    // só altera <p> cujo texto original seja “Ingressos e Passeios”
    if (p.textContent.trim() === "Ingressos e Passeios") {
      p.textContent = variationText;
    }
  });
})();
