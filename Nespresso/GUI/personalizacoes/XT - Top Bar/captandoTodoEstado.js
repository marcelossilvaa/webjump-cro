if (!window.location.pathname.includes("checkout") && !window.topBarMessage) {
  (function () {
    "use strict";
    window.topBarMessage = "true";
    gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "adobe_target",
      event_raised_by: "adobe target",
      experiment_id: "${campaign.id}",
      experiment_type: "AB",
      experiment_name: "${campaign.name}",
      experiment_variant_id: "${campaign.recipe.id}",
      experiment_variant: "${campaign.recipe.name}",
    });

    let diasEntregasUF = {
      1: [
        { estado: "São Paulo", uf: "SP", capital: "São Paulo" },
        { estado: "Rio de Janeiro", uf: "RJ", capital: "Rio de Janeiro" },
        { estado: "Minas Gerais", uf: "MG", capital: "Belo Horizonte" },
        { estado: "Paraná", uf: "PR", capital: "Curitiba" },
        { estado: "Pernambuco", uf: "PE", capital: "Recife" },
        { estado: "Bahia", uf: "BA", capital: "Salvador" },
      ],
    };

    function obterCapitalPorUF(ufBuscada) {
      for (let dias in diasEntregasUF) {
        let estados = diasEntregasUF[dias];
        for (let estado of estados) {
          if (estado.uf === ufBuscada) {
            return estado.capital;
          }
        }
      }
      return false;
    }

    function verificarUFPermitido(ufBuscada) {
      for (let dias in diasEntregasUF) {
        let estados = diasEntregasUF[dias];
        for (let estado of estados) {
          if (estado.uf === ufBuscada) {
            return true; // UF encontrado na lista
          }
        }
      }
      return false; // UF não encontrado na lista
    }

    function getSessionStorageItem(key) {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }

    function setCookieLocalizacao(cidade, uf) {
      var expirationDate = new Date();
      expirationDate.setTime(
        expirationDate.getTime() + 365 * 24 * 60 * 60 * 1000
      ); // 1 ano de validade

      document.cookie =
        "cidadeAB=" +
        encodeURIComponent(cidade) +
        "; path=/br/pt" +
        "; expires=" +
        expirationDate.toUTCString() +
        "; secure" +
        "; SameSite=Lax";

      document.cookie =
        "ufAB=" +
        encodeURIComponent(uf) +
        "; path=/br/pt" +
        "; expires=" +
        expirationDate.toUTCString() +
        "; secure" +
        "; SameSite=Lax";
    }

    function getCookieAB(cookieName) {
      const name = cookieName + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookiesArray = decodedCookie.split(";");
      for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.startsWith(name)) {
          return cookie.substring(name.length);
        }
      }
      return false;
    }

    function searchAddressAndSetCookie() {
      const adressDataFrete = getSessionStorageItem("address");
      const adressAccountLogged = getSessionStorageItem(
        "customerAddressesCache-br"
      );
      let cidadeAB = "";
      let ufAB = "";

      if (adressDataFrete) {
        let cidade = adressDataFrete.localidade;
        let uf = adressDataFrete.uf;
        if (cidade && uf) {
          cidadeAB = cidade;
          ufAB = uf;
        }
      } else if (adressAccountLogged) {
        const firstEntry = adressAccountLogged.value[0];
        const city = firstEntry.city;
        const region = firstEntry.region.id;
        if (city && region) {
          cidadeAB = city;
          ufAB = region;
        }
      }
      let cookieCidade = getCookieAB("cidadeAB");
      let cookieUF = getCookieAB("ufAB");
      if (cookieCidade && cookieUF) {
        if (cidadeAB && ufAB) {
          if (cookieCidade !== cidadeAB || cookieUF !== ufAB) {
            setCookieLocalizacao(cidadeAB, ufAB);
          }
        }
      } else {
        if (cidadeAB && ufAB) {
          setCookieLocalizacao(cidadeAB, ufAB);
        }
      }
    }

    function setMessagesTopBar() {
      if (!document.querySelector(".mensagemEntregaTopBar")) {
        let cookieCidade = getCookieAB("cidadeAB");
        let cookieUF = getCookieAB("ufAB");
        if (cookieCidade && cookieUF) {
          if (verificarUFPermitido(cookieUF)) {
            let mensagem =
              "<span class='messageMothersDayTopBar'>Compre hoje e <strong>receba até o dia das mães</strong></span> <span class='conditionsMothersDayTopBar'>*válido para opção de 'Entrega em 2hrs' ou 'Entrega hoje'</span>";

            let slickSlide =
              `<div class="slide-message mensagemEntregaTopBar track-promotion-impression track-promotion-click slick-slide" data-promotion-creative="site-stickymessage" data-promotion-position="site-stickymessage" data-link-creative="site-stickymessage" data-link-position="site-stickymessage" data-promotion-item-id="parcelamento10x_header" data-promotion-name="parcelamento10x_header" data-link-item-id="parcelamento10x_header" data-link-name="parcelamento10x_header" data-slick-index="4" aria-hidden="true" style="width: 1124px;" tabindex="-1"><p class="message-content" style="font-size:14px;line-height: 1.2 !important;"><a href="https://www.nespresso.com/br/pt/order/capsules/original">` +
              mensagem +
              `</a></p></div>`;

            $(document).ready(function () {
              $("div[id*='topMessageBanner'] .top-message-slider").slick(
                "slickAdd",
                slickSlide,
                0
              );
              document.head.insertAdjacentHTML(
                "beforeend",
                `<style>#topMessageBanner, #topMessageBannerMob{background-color:#6D4287 !important;}
                .conditionsMothersDayTopBar{
                    font-size:11px !important;
                  }
                @media only screen and (min-width: 768px) {
                  .messageMothersDayTopBar{
                   font-size:15px !important;
                  }
                }
                </style>`
              );
              window.gtmDataObject = window.gtmDataObject || [];
              gtmDataObject.push({
                event: "local_event", //as is, do not change!!
                event_raised_by: "br", //please put the country code ex: us, ch, it
                local_event_category: "user engagement", //free to fill field, please use lower case
                local_event_action: "click", //free to fill field, please use lower case
                local_event_label: "xt_adobe_target_mensagem_frete_" + cookieUF, //free to fill field, please use lower case
              });
            });
          }
        }
      }
    }
    searchAddressAndSetCookie();
    setMessagesTopBar();
  })();
}
