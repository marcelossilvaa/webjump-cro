if (!window.topBarMessage) {
  (function () {
    "use strict";

    // Validação inicial com tentativas
    function waitForElements(callback, maxAttempts = 10, interval = 500) {
      let attempts = 0;

      function checkElements() {
        const containerInsert = document.querySelector(
          "#block-8831586620917,#block-8831586260469",
        );

        if (containerInsert) {
          // Elementos encontrados, executar o código principal
          callback();
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkElements, interval);
        }
      }

      checkElements();
    }

    // Função principal que será executada apenas se os elementos forem encontrados
    function executeMainCode() {
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
          { estado: "Distrito Federal", uf: "DF", capital: "Brasília" },
          { estado: "Pernambuco", uf: "PE", capital: "Recife" },
        ],
        2: [
          { estado: "Espírito Santo", uf: "ES", capital: "Vitória" },
          { estado: "Goiás", uf: "GO", capital: "Goiânia" },
          { estado: "Minas Gerais", uf: "MG", capital: "Belo Horizonte" },
          { estado: "Mato Grosso do Sul", uf: "MS", capital: "Campo Grande" },
          { estado: "Paraná", uf: "PR", capital: "Curitiba" },
          { estado: "Santa Catarina", uf: "SC", capital: "Florianópolis" },
        ],
        3: [
          { estado: "Alagoas", uf: "AL", capital: "Maceió" },
          { estado: "Ceará", uf: "CE", capital: "Fortaleza" },
          { estado: "Bahia", uf: "BA", capital: "Salvador" },
          { estado: "Sergipe", uf: "SE", capital: "Aracaju" },
          { estado: "Paraíba", uf: "PB", capital: "João Pessoa" },
          { estado: "Rio Grande do Norte", uf: "RN", capital: "Natal" },
          { estado: "Rio Grande do Sul", uf: "RS", capital: "Porto Alegre" },
        ],
        5: [
          { estado: "Piauí", uf: "PI", capital: "Teresina" },
          { estado: "Maranhão", uf: "MA", capital: "São Luís" },
          { estado: "Tocantins", uf: "TO", capital: "Palmas" },
          { estado: "Mato Grosso", uf: "MT", capital: "Cuiabá" },
        ],
        7: [
          { estado: "Amazonas", uf: "AM", capital: "Manaus" },
          { estado: "Acre", uf: "AC", capital: "Rio Branco" },
          { estado: "Amapá", uf: "AP", capital: "Macapá" },
          { estado: "Pará", uf: "PA", capital: "Belém" },
          { estado: "Roraima", uf: "RR", capital: "Boa Vista" },
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
          expirationDate.getTime() + 365 * 24 * 60 * 60 * 1000,
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
          "customerAddressesCache-br",
        );
        let cidadeAB = "";
        let ufAB = "";

        if (adressDataFrete) {
          let cidade = adressDataFrete.city;
          let uf = adressDataFrete.state;
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

            // Sempre calcula para a capital
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

            // Encontra o nome do estado
            let nomeEstado = "";
            for (let dias in diasEntregasUF) {
              let estados = diasEntregasUF[dias];
              for (let estado of estados) {
                if (estado.uf === cookieUF) {
                  nomeEstado = estado.estado;
                  break;
                }
              }
              if (nomeEstado) break;
            }

            let mensagem =
              `Compre hoje e receba até <strong>` +
              dia +
              `/` +
              String(mes + 1).padStart(2, "0") +
              `*</strong> em <strong>` +
              nomeEstado +
              `</strong> <span style="font-size:12px;">(*Cidades do Interior acrescentar +3 dias úteis)</span>`;

            let containerMensagemFrete =
              `<div class="mensagemEntregaTopBar"><p class="message-content" style="font-size:14px;line-height: 1.2 !important;">` +
              mensagem +
              `</p></div>`;

            $(document).ready(function () {
              let containerInsert = document.querySelector(
                "#block-8831586620917,#block-8831586260469",
              );
              if (containerInsert) {
                let CSS = `<style>
                #block-8831586260469, #block-8831586620917{
                  display: none;
                }
                  .mensagemEntregaTopBar {
                    background-color:  #F3F0EB;
                    padding: 12px 0px;
                    border-radius: 4px 4px 0px 0px;
                  }
                  .mensagemEntregaTopBar .message-content {
                    font-size: 16px;
                    line-height: 1.2 !important;
                    text-align: center;
                    color: #000;
                    padding: 0px 6px;
                    font-family: 'NespressoLucas', Arial, sans-serif;
                  }
                </style>`;
                document.head.insertAdjacentHTML("beforeend", CSS);
                containerInsert.insertAdjacentHTML(
                  "afterend",
                  containerMensagemFrete,
                );
              }
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
      searchAddressAndSetCookie();
      setMessagesTopBar();
    }

    // Iniciar validação e execução do código
    waitForElements(executeMainCode);
  })();
}
