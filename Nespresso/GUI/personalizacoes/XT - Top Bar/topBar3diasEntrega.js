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
      4: [
        { estado: "São Paulo", uf: "SP", capital: "São Paulo" },
        { estado: "Rio de Janeiro", uf: "RJ", capital: "Rio de Janeiro" },
      ],
      5: [
        { estado: "Distrito Federal", uf: "DF", capital: "Brasília" },
        { estado: "Minas Gerais", uf: "MG", capital: "Belo Horizonte" },
        { estado: "Paraná", uf: "PR", capital: "Curitiba" },
        { estado: "Santa Catarina", uf: "SC", capital: "Florianópolis" },
        { estado: "Paraíba", uf: "PB", capital: "João Pessoa" },
      ],
      6: [
        { estado: "Goiás", uf: "GO", capital: "Goiânia" },
        { estado: "Bahia", uf: "BA", capital: "Salvador" },
        { estado: "Sergipe", uf: "SE", capital: "Aracaju" },
        { estado: "Espírito Santo", uf: "ES", capital: "Vitória" },
        { estado: "Mato Grosso do Sul", uf: "MS", capital: "Campo Grande" },
        { estado: "Alagoas", uf: "AL", capital: "Maceió" },
        { estado: "Tocantins", uf: "TO", capital: "Palmas" },
      ],
      7: [
        { estado: "Pernambuco", uf: "PE", capital: "Recife" },
        { estado: "Ceará", uf: "CE", capital: "Fortaleza" },
        { estado: "Amazonas", uf: "AM", capital: "Manaus" },
      ],
      8: [
        { estado: "Rio Grande do Sul", uf: "RS", capital: "Porto Alegre" },
        { estado: "Mato Grosso", uf: "MT", capital: "Cuiabá" },
        { estado: "Rio Grande do Norte", uf: "RN", capital: "Natal" },
        { estado: "Piauí", uf: "PI", capital: "Teresina" },
        { estado: "Maranhão", uf: "MA", capital: "São Luís" },
        { estado: "Pará", uf: "PA", capital: "Belém" },
        { estado: "Roraima", uf: "RR", capital: "Boa Vista" },
      ],
      10: [
        { estado: "Amapá", uf: "AP", capital: "Macapá" },
        { estado: "Acre", uf: "AC", capital: "Rio Branco" },
        { estado: "Rondônia", uf: "RO", capital: "Porto Velho" },
      ],
    };

    function obterDiasEntregaPorUF(ufBuscada) {
      for (let dias in diasEntregasUF) {
        if (diasEntregasUF.hasOwnProperty(dias)) {
          let estados = diasEntregasUF[dias];
          for (let estado of estados) {
            if (estado.uf.toUpperCase() === ufBuscada.toUpperCase()) {
              return parseInt(dias);
            }
          }
        }
      }
      return false;
    }

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
          let capitalUF = obterCapitalPorUF(cookieUF);
          let diasEntrega = obterDiasEntregaPorUF(cookieUF);

          if (capitalUF.toLowerCase() != cookieCidade.toLowerCase()) {
            diasEntrega += 3;
          }

          let dataAtual = new Date();
          let horaAtual = dataAtual.getHours();

          function adicionarDiasUteis(data, dias) {
            let diasAdicionados = 0;
            let novaData = new Date(data);
            while (diasAdicionados < dias) {
              novaData.setDate(novaData.getDate() + 1);
              let diaSemana = novaData.getDay();
              if (diaSemana !== 0 && diaSemana !== 6) {
                // 0 = Domingo, 6 = Sábado
                diasAdicionados++;
              }
            }
            return novaData;
          }
          // Se for antes de onze da manhã, diminui 1 dia do prazo de entrega
          if (horaAtual >= 11) {
            diasEntrega += 1;
          }

          let dataEntrega = adicionarDiasUteis(dataAtual, diasEntrega);
          let dia = dataEntrega.getDate();
          let mes = dataEntrega.getMonth();
          let diaSemanaNumero = dataEntrega.getDay();

          let nomesDosMeses = [
            "janeiro",
            "fevereiro",
            "março",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro",
          ];

          let diasDaSemana = [
            "domingo",
            "segunda-feira",
            "terça-feira",
            "quarta-feira",
            "quinta-feira",
            "sexta-feira",
            "sábado",
          ];

          let nomeDiaSemana = diasDaSemana[diaSemanaNumero];
          let nomeDoMes = nomesDosMeses[mes];

          let mensagem =
            horaAtual < 11
              ? "Comprando até as 11h da manhã" +
                `, receba até <strong>` +
                nomeDiaSemana +
                `, ` +
                dia +
                ` de ` +
                nomeDoMes +
                `</strong>, em <strong>` +
                cookieCidade +
                `</strong>`
              : "Comprando hoje" +
                `, receba até <strong>` +
                nomeDiaSemana +
                `, ` +
                dia +
                ` de ` +
                nomeDoMes +
                `</strong>, em <strong>` +
                cookieCidade +
                `</strong>`;

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
            window.gtmDataObject = window.gtmDataObject || [];
            gtmDataObject.push({
              event: "local_event", //as is, do not change!!
              event_raised_by: "br", //please put the country code ex: us, ch, it
              local_event_category: "user engagement", //free to fill field, please use lower case
              local_event_action: "click", //free to fill field, please use lower case
              local_event_label: "xt_adobe_target_mensagem_frete", //free to fill field, please use lower case
            });
          });
        }
      }
    }
    searchAddressAndSetCookie();
    setMessagesTopBar();
  })();
}
