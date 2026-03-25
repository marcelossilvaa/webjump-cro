let regexPDPs = /.*\/br\/pt\/order\/capsules\/.*\/(capsula|cafe|capsulas).*/;
let pagePathAtual = window.location.pathname;
if (!pagePathAtual.includes("checkout")) {
  if (regexPDPs.test(pagePathAtual)) {
    if (regexPDPs.test(pagePathAtual)) {
      let conteudoCardCapsulas = document.querySelector(
        "nb-sku-coffee .cb-content"
      );
      let divFrete = document.querySelector("#pdp-freight-component");
      let divPreco = document.querySelector(".cb-price");
      let buscaDivPreco = setInterval(function () {
        if (buscaDivPreco) {
          clearInterval(buscaDivPreco);
          addCountdownContainer(divPreco);
        }
        divPreco = document.querySelector(".cb-price");
      }, 1000);
    }
  }
}

function addCountdownContainer(containerAppend) {
  let divCountdown = `
    <div class="container" id="countdown">
      <div>
      <p>
        Entrega mais rápida:
        <span class="dataEntregaRapida">Segunda-feira, 7 de Outubro</span> se pedir dentro de 
        <span class="cronometroEntregaRapida">23hrs 10mins</span>
      </p>
      <p>
          <span class="spanEntregaGratis">Entrega Grátis:</span>
          <span class="dataEntregaGratis">quarta-feira, 9 de Outubro</span>
      </p>
      </div>
    </div>
  `;
  containerAppend.insertAdjacentHTML("afterend", divCountdown);

  let css = `
    <style>
      #countdown, #countdown *{
        font-family: "NespressoLucas";
      }
      #countdown {
        background-color: #f8f8f8;
        padding: 12px;
        margin: 0 0 20px 0px;
      }
      #countdown > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 6px;
      }
      #countdown p {
        margin: 0;
        font-size: 14px;
        color: #333;
        text-align: left;
        width: 100%;
      }
      .spanEntregaGratis {
        font-weight: bold;
        color: #00a650;
      }
      
      .spanEntregaGratis, .dataEntregaGratis, .dataEntregaRapida{
        font-weight: bold;
      }
    </style>
  `;
  document.head.insertAdjacentHTML("beforeend", css);
}

function getSessionStorageItem(key) {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}
const adressAccountLogged = getSessionStorageItem("customerAddressesCache-br");

if (
  adressAccountLogged &&
  adressAccountLogged.value &&
  adressAccountLogged.value.length > 0
) {
  const firstEntry = adressAccountLogged.value[0];
  const country = firstEntry.country.label;
  const city = firstEntry.city;
  const region = firstEntry.region.id;

  alert(country + " - " + city + " - " + region);
} else {
  const adressDataFrete = getSessionStorageItem("address");
  if (adressDataFrete) {
    let cidade = adressDataFrete.localidade;
    let regiao = adressDataFrete.regiao;
    let uf = adressDataFrete.uf;
    if (cidade && regiao && uf) {
      // Calcula a data de expiração para 30 dias a partir de agora
      var expirationDate = new Date();
      expirationDate.setTime(
        expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000
      ); // 30 dias

      // Criando cookies para estado, cidade e uf
      document.cookie =
        "cidadeAB=" +
        cidade +
        "; path=/; secure; expires=" +
        expirationDate.toUTCString();
      document.cookie =
        "ufAB=" +
        uf +
        "; path=/; secure; expires=" +
        expirationDate.toUTCString();
    }
  }
}
