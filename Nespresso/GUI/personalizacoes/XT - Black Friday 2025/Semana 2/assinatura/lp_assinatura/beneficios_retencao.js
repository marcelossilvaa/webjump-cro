(function () {
  "use strict";
  if (window.beneficiosAquisicao) return;
  window.beneficiosAquisicao = true;

  let tentativas = 0;
  const maxTentativas = 50; // Máximo de tentativas (5 segundos com intervalo de 100ms)

  let intervalo = setInterval(function () {
    tentativas++;

    let sectionBeneficios = document.querySelector(
      ".dp-OAC-benefits .dp-OAC-benefits__wrapper"
    );

    if (tentativas >= maxTentativas) {
      clearInterval(intervalo);
      return;
    }

    if (sectionBeneficios) {
      clearInterval(intervalo);

      // Cria o novo item de benefício
      const novoItem = document.createElement("div");
      novoItem.className = "dp-OAC-benefits__item";

      novoItem.innerHTML = `
        <picture class="dp-OAC-benefits__visual">
          <source width="254" height="254" srcset="/ecom/medias/sys_master/public/46609952768030/Bloco-Beneficios-ACESSORIOS.jpg?attachment=true&cimgnr=8gCIl" type="image/webp">
          <img loading="lazy" alt="Black Friday">
        </picture>
        <h3 class="dp-OAC-benefits__name">
          BLACK FRIDAY
        </h3>
        <p class="dp-OAC-benefits__text">
          Cliente Assinante tem benefício exclusivo para comprar acessórios com até 45%OFF*<br><span style="font-size: 11px;">*Válido para acessórios selecionados</span>
        </p>
      `;

      // Adiciona o novo item à seção de benefícios
      sectionBeneficios.appendChild(novoItem);
    }
  }, 100);
})();
