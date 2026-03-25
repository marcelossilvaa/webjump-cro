(function () {
  if (window.ofertasCompolauMaes) {
    return;
  }
  window.ofertasCompolauMaes = "true";
  const niveisOfertasMaes = [
    {
      titulo: "GANHE 1 PORTA CÁPSULAS",
      text: "Na compra de 100 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44635732541470/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n1.png?",
      alt: "1 PORTA CÁPSULAS",
    },
    {
      titulo: "GANHE 1 BISCOITO LEMON + 1 XÍCARA CAPPUCCINO",
      text: "Na compra de 150 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44598853894174/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n3.png?",
      alt: "1 BISCOITO LEMON + 1 XÍCARA CAPPUCCINO",
    },
    {
      titulo: "GANHE 1 KIT PARA SERVIR + 1 XÍCARA CAPPUCCINO",
      text: "Na compra de 200 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44598854385694/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n4.png?",
      alt: "1 KIT PARA SERVIR + 1 XÍCARA CAPPUCCINO",
    },
    {
      titulo: "GANHE 1 PAR DE CANECAS LUME",
      text: "Na compra de 250 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44598854975518/ARTE-LANDING-PAGE-DIA-DAS-M-ES-n5.png?",
      alt: "1 PAR DE CANECAS LUME",
    },
  ];
  function changeCompolau() {
    let targetElement = document.querySelector(
      "#maes2025.dp-OAC-benefits .dp-OAC-benefits__wrapper"
    );
    let buscaElemento = setInterval(function () {
      targetElement = document.querySelector(
        "#maes2025.dp-OAC-benefits .dp-OAC-benefits__wrapper"
      );
      if (targetElement) {
        clearInterval(buscaElemento);
        createCards(targetElement);
      }
    }, 500);
  }
  function createCards(containerOfertas) {
    containerOfertas.querySelectorAll("a").forEach(function (element) {
      element.remove();
    });
    niveisOfertasMaes.forEach(function (oferta) {
      let newHTML =
        `<a href="https://www.nespresso.com/br/pt/order/capsules/original?">
      <div class="dp-OAC-benefits__item">
        <picture class="dp-OAC-benefits__visual">
          <source
            width="254"
            height="254"
            srcset="
              ` +
        oferta.src +
        `
            "
            type="image/webp"
          />
          <!-- <source width="254" height="254" srcset="./images/photo-2-desktop.jpg?$staticlink$ 1x, ./images/photo-2-desktop-@2x.jpg?$staticlink$ 2x" type="image/jpeg" /> -->
          <img loading="lazy" alt="` +
        oferta.alt +
        `" />
        </picture>
        <h3 class="dp-OAC-benefits__name">
          ` +
        oferta.titulo +
        `
        </h3>
        <p class="dp-OAC-benefits__text">` +
        oferta.text +
        `</p>
      </div>
    </a>`;

      containerOfertas.insertAdjacentHTML("beforeend", newHTML);
    });
  }
  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", changeCompolau);
  } else {
    changeCompolau();
  }
})();
