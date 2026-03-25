(function () {
  "use strict";
  if (window.beneficiosAquisicao) return;
  window.beneficiosAquisicao = true;

  let tentativas = 0;
  const maxTentativas = 50; // Máximo de tentativas (5 segundos com intervalo de 100ms)

  let intervalo = setInterval(function () {
    tentativas++;

    let beneficioQuePrecisaSerAlterado = document.querySelector(
      ".dp-OAC-benefits .dp-OAC-benefits__item:has(source[srcset='/ecom/medias/sys_master/public/30732147195934/imagem.png'])"
    );

    if (tentativas >= maxTentativas) {
      clearInterval(intervalo);
      return;
    }

    if (beneficioQuePrecisaSerAlterado) {
      clearInterval(intervalo);

      // Seleciona os elementos dentro do item encontrado
      let h3Element = beneficioQuePrecisaSerAlterado.querySelector(
        "h3.dp-OAC-benefits__name"
      );
      let pElement = beneficioQuePrecisaSerAlterado.querySelector(
        "p.dp-OAC-benefits__text"
      );
      let sourceElement =
        beneficioQuePrecisaSerAlterado.querySelector("picture source");

      // Função para alterar os valores
      function alterarBeneficio(novoH3, novoP, novoSrcset) {
        if (h3Element && novoH3) {
          h3Element.textContent = novoH3;
        }
        if (pElement && novoP) {
          pElement.textContent = novoP;
        }
        if (sourceElement && novoSrcset) {
          sourceElement.setAttribute("srcset", novoSrcset);
        }
      }

      alterarBeneficio(
        "BLACK FRIDAY",
        "Fazendo a sua Assinatura, na Black Friday você garante o benefício de 15%OFF nas 3 primeiras entregas",
        "/ecom/medias/sys_master/public/46609950736414/Bloco-Beneficios-15-OFF.jpg?attachment=true&cimgnr=o5iHe"
      );
    }
  }, 100);
})();
