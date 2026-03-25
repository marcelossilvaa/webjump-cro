(function () {
  if (window.ofertasCompolauNamorados) {
    return;
  }
  window.ofertasCompolauNamorados = "true";

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "user engagement", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  function isDesktop() {
    return window.innerWidth > 768 ? true : false;
  }
  const nivelOfertasNamorados = [
    {
      desktop: {
        nivel: "card_n2",
        titulo: "1 Chocolate ao leite",
        text: "Na compra de 100 cafés",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45029321867294/Triple-banner-1120x630-N2.jpg?attachment=true&cimgnr=BYyr1",
        alt: "1 CHOCOLATE AO LEITE",
      },
      mobile: {
        nivel: "card_n2",
        titulo: "<span class='produtoNamorados'>1 CHOCOLATE AO LEITE</span>",
        text: "Compre 100 cafés* e ganhe",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45003699552286/Arte-LP-400x400-N2.jpg?attachment=true&cimgnr=gNDqL",
        alt: "1 CHOCOLATE AO LEITE",
      },
    },
    {
      desktop: {
        nivel: "card_n3",
        titulo: "1 Chocolate ao leite + 1 Xícara Pixie",
        text: "Na compra de 150 cafés",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45000273035294/Triple-banner-1120x630-N3.jpg?impolicy=small&imwidth=360&imdensity=1",
        alt: "1 CHOCOLATE AO LEITE + 1 XÍCARA PIXIE",
      },
      mobile: {
        nivel: "card_n3",
        titulo:
          "<span class='produtoNamorados'>1 CHOCOLATE AO LEITE</span><span class='maisCard'> +</span><br> <span class='produtoNamorados'>1 PIXIE STOCKHOLM</span>",
        text: "Compre 150 cafés* e ganhe",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45000261697566/Arte-LP-400x400-N3.jpg?attachment=true&cimgnr=a3Qj2",
        alt: "1 CHOCOLATE AO LEITE + 1 PIXIE STOCKHOLM",
      },
    },
    {
      desktop: {
        nivel: "card_n4",
        titulo: "2 Xícaras Pixie",
        text: "Na compra de 200 cafés",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45000273166366/Triple-banner-1120x630-N4.jpg?impolicy=small&imwidth=360&imdensity=1",
        alt: "2 XÍCARAS PIXIE",
      },
      mobile: {
        nivel: "card_n4",
        titulo:
          "<span class='produtoNamorados'>1 PIXIE ESPRESSO PARIS</span><span class='maisCard'> +</span><br><span class='produtoNamorados'>1 PIXIE ESPRESSO ISTANBUL</span>",
        text: "Compre 200 cafés* e ganhe",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45000262156318/Arte-LP-400x400-N4.jpg?attachment=true&cimgnr=Okm3F",
        alt: "1 PIXIE ESPRESSO PARIS + 1 PIXIE ESPRESSO ISTANBUL",
      },
    },
    {
      mobile: {
        nivel: "card_n5",
        titulo:
          "<span class='produtoNamorados'>1 PAR DE TAÇAS PARA DRINKS</span>",
        text: "Compre 250 cafés* e ganhe",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45000262549534/Arte-LP-400x400-N5.jpg?attachment=true&cimgnr=8yCB2",
        alt: "1 PIXIE ESPRESSO PARIS + 1 PIXIE ESPRESSO ISTANBUL",
      },
    },
    {
      desktop: {
        nivel: "card_n6",
        titulo: "2 Xícaras Pixie Lungo",
        text: "Na compra de 270 cafés",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45072438034462/Triple-banner-1120x630-N3.jpg?attachment=true&cimgnr=V9dqD",
        alt: "2 Xícaras Pixie Lungo",
        labelExclusive:
          '<br><span style="font-size: 18px;color: #c46859;">OFERTA SURPRESA</span>',
      },
      mobile: {
        nivel: "card_n6",
        titulo:
          "<span class='produtoNamorados'>1 PIXIE LUNGO VIENNA<br></span><span class='maisCard'> +</span><br><span class='produtoNamorados'>1 PIXIE LUNGO SHANGAI</span>",
        text: "Compre 270 cafés* e ganhe",
        src: "https://www.nespresso.com/ecom/medias/sys_master/public/45071273132062/Arte-LP-400x400-N6-sem-selo.jpg",
        alt: "1 PIXIE ESPRESSO PARIS + 1 PIXIE ESPRESSO ISTANBUL",
        selo: "https://www.nespresso.com/ecom/medias/sys_master/public/45071274016798/Somente-Selo.png",
        labelExclusive: '<span style="color: #c46859;">OFERTA SURPRESA</span>',
      },
    },
  ];

  function changeCompolau() {
    let targetElementDesktop = document.querySelector(
      "nb-card-highlighted-lifestyle .nb-layout-cards-inner"
    );
    let targetElementMobile = document.querySelector(
      "#containerOfertasNamorados #cardProducts"
    );
    if (isDesktop()) {
      let buscaElemento = setInterval(function () {
        targetElementDesktop = document.querySelector(
          "nb-card-highlighted-lifestyle .nb-layout-cards-inner"
        );
        if (targetElementDesktop) {
          clearInterval(buscaElemento);
          createDesktopCards(targetElementDesktop);
        }
      }, 500);
    } else {
      let buscaElemento = setInterval(function () {
        targetElementMobile = document.querySelector(
          "#containerOfertasNamorados #cardProducts"
        );
        if (targetElementMobile) {
          clearInterval(buscaElemento);
          createMobileCards(targetElementMobile);
        }
      }, 500);
    }
  }

  function createDesktopCards(containerOfertas) {
    containerOfertas
      .querySelectorAll("nb-card-lifestyle")
      .forEach(function (element) {
        element.remove();
      });
    nivelOfertasNamorados.forEach(function (oferta) {
      if (!oferta.desktop) {
        return;
      }
      let labelExclusive = "";
      if (oferta.desktop.labelExclusive) {
        labelExclusive = oferta.desktop.labelExclusive;
      }
      let newHTML =
        `<nb-card-lifestyle
  class="nb-card-lifestyle nb-card-lifestyle--parchment nb-card-lifestyle-reverse"
  contrast="light"
  ><div class="nb-card nb-card--light desktop" id="` +
        oferta.desktop.nivel +
        `">
    <div class="nb-card-lifestyle--content">
      <h2 class="nb-card__heading h-xl-300">
        <strong>GANHE</strong><br />` +
        oferta.desktop.titulo.toUpperCase() +
        `
      </h2>
      <p class="nb-card__body t-sm-400">` +
        oferta.desktop.text.toUpperCase() +
        labelExclusive +
        `</p>
      <div class="nb-card__overlay"></div>
      <div class="nb-card__actions">
        <nb-cta
          class="nb-card__cta"
          data='{"contrast":"dark","variation":"tertiary","link":"https://www.nespresso.com/br/pt/order/capsules/original","label":"COMPRE AGORA","seo_label":"` +
        oferta.desktop.text +
        " ganhe " +
        oferta.desktop.titulo +
        `","show_popin":false,"campaign_position":"before_card","campaign_instance_index":"0"}'
          slot="COMPRE AGORA"
          ><a
            href="https://www.nespresso.com/br/pt/order/capsules/original"
            title=""
            class="button--cta button--tertiary button--dark size--48 t-md-400-sl" >
            <span>COMPRE AGORA</span>
          </a></nb-cta
        >
      </div>
      <nb-popin
        id="promo-dynamicBanner"
        heading=""
        subheading=""
        variation="next"
        bgcolor="highlight"
        label_close="Fechar"
        style="display: inherit"
        slot='
                <div class="popin-header-img"><img loading="lazy" src="https://www.nespresso.com/shared_res/agility/n-components/festive-bf/plp-dynamic-banner/gift.png" alt="" title="" width="300" height="225"></div>
                
                
                
            '
        aria-modal="false"
        size="M"
        role="dialog"
        aria-hidden="true"
      >
        <nb-cta
          variation="navigation"
          contrast="light"
          icon_right="24/symbol/close"
          label="Fechar"
          slot=""
          ><button
            class="button--navigation button--light size--48 t-md-400-sl"
          >
            <span>Fechar</span>

            <nb-icon
              icon="24/symbol/close"
              aria-hidden="true"
              class="nb-svg nb-icon lazy-loaded"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.54 12 3 4.46 4.46 3 12 10.54 19.54 3 21 4.46 13.46 12 21 19.54 19.54 21 12 13.46 4.46 21 3 19.54 10.54 12Z"
                  clip-rule="evenodd"
                ></path></svg
            ></nb-icon></button
        ></nb-cta>
        <div class="wrapper">
          <div class="content t-sm-400" tabindex="-1">
            <div class="popin-header-img">
              <img
                loading="lazy"
                src="https://www.nespresso.com/shared_res/agility/n-components/festive-bf/plp-dynamic-banner/gift.png"
                alt=""
                title=""
                width="300"
                height="225"
              />
            </div>
          </div>
        </div>
      </nb-popin>
    </div>
    <nb-img
      class="nb-card__visual nb-img"
      file="` +
        oferta.desktop.src +
        `"
      description="` +
        oferta.desktop.alt +
        `"
      aspect_ratio="16/9"
      force_width=""
      style="--image-aspect-ratio: 16/9"
    >
      <img
        src="` +
        oferta.desktop.src +
        `"
        alt="` +
        oferta.desktop.alt +
        `"
        class="loading nb-card__visual-content lazy-load lazy-loaded"
    /></nb-img></div
></nb-card-lifestyle>
`;
      containerOfertas.insertAdjacentHTML("beforeend", newHTML);
      containerOfertas
        .querySelector("#" + oferta.desktop.nivel + " a.button--cta")
        .setAttribute("id", oferta.desktop.nivel);
    });
    document
      .querySelectorAll("nb-card-lifestyle a")
      .forEach(function (button, index) {
        button.addEventListener("click", function () {
          sendGAEvent("desktop_" + button.getAttribute("id"));
        });
      });
  }
  function createMobileCards(containerOfertas) {
    containerOfertas
      .querySelectorAll("div.cardProducts_item")
      .forEach(function (element) {
        element.remove();
      });
    nivelOfertasNamorados.forEach(function (oferta, index) {
      if (!oferta.mobile) {
        return;
      }
      let seloOferta = "";
      if (oferta.mobile.selo) {
        seloOferta =
          "<img src=" +
          oferta.mobile.selo +
          " style='position:absolute;width:200px;left:55px;top:-14px;'>";
      }
      let labelExclusive = "";
      if (oferta.mobile.labelExclusive) {
        labelExclusive = oferta.mobile.labelExclusive;
      }
      let newHTML =
        `<div class="cardProducts_item"><a class="` +
        oferta.mobile.nivel +
        `" href="https://www.nespresso.com/br/pt/order/capsules/original" style="color: rgb(0, 0, 0);"><span class="offer-tag">❤</span><div class="imageAndTextNamorados" style="position:relative;"><img src="` +
        oferta.mobile.src +
        `" alt="` +
        oferta.mobile.alt +
        `" class="cardProducts_item__image">` +
        seloOferta +
        `<div class="cardProducts_item__info"><div class="cardProducts_item__info_title"><span class="spanGanheNamorados">` +
        labelExclusive +
        "<br>" +
        oferta.mobile.text +
        `</span><br>` +
        oferta.mobile.titulo +
        `</div></div></div></a></div>`;
      containerOfertas.insertAdjacentHTML("beforeend", newHTML);
    });
    document
      .querySelectorAll("#containerOfertasNamorados .cardProducts_item a")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          sendGAEvent(button.getAttribute("class"));
        });
      });
  }
  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", changeCompolau);
  } else {
    changeCompolau();
  }
})();
