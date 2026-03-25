(function () {
  if (window.ofertasCompolauIconic) {
    return;
  }
  window.ofertasCompolauIconic = "true";
  const niveisOfertasMaes = [
    {
      titulo: "GANHE 10 CAFÉS ARPEGGIO OU ALTISSIO",
      text: "Na compra de 70 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44813086359582/Arte-LP-400x400-N1.jpg?attachment=true&cimgnr=LdhSe",
      alt: "10 CAFÉS ARPEGGIO OU ALTISSIO",
    },
    {
      titulo: "Ganhe 1 Chocolate Amargo",
      text: "Na compra de 100 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44813086425118/Arte-LP-400x400-N2.jpg?attachment=true&cimgnr=aTLzq",
      alt: "1 Chocolate Amargo",
    },
    {
      titulo: "Ganhe 1 Chocolate Amargo + 1 Xícara Pixie Arpeggio",
      text: "Na compra de 150 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44813086490654/Arte-LP-400x400-N3.jpg?attachment=true&cimgnr=a3Qj2",
      alt: "1 Chocolate Amargo + 1 Xícara Pixie Arpeggio",
    },
    {
      titulo: "Ganhe 2 Xícaras Pixie + 10 Cafés",
      text: "Na compra de 200 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44813086556190/Arte-LP-400x400-N4.jpg?attachment=true&cimgnr=Okm3F",
      alt: "2 Xícaras Pixie + 10 Cafés",
    },
    {
      titulo: "Ganhe 1 Caneca Térmica + 1 Chocolate Amargo",
      text: "Na compra de 250 cápsulas de café",
      src: "https://www.nespresso.com/ecom/medias/sys_master/public/44813086621726/Arte-LP-400x400-N5.jpg?attachment=true&cimgnr=8yCB2",
      alt: "1 Caneca Térmica + 1 Chocolate Amargo",
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
