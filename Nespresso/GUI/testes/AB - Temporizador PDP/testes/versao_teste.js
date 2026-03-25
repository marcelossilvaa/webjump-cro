const diasEntregasUF = {
  1: [
    { estado: "São Paulo", uf: "SP", capital: "São Paulo" },
    { estado: "Rio de Janeiro", uf: "RJ", capital: "Rio de Janeiro" },
  ],
  2: [
    { estado: "Distrito Federal", uf: "DF", capital: "Brasília" },
    { estado: "Minas Gerais", uf: "MG", capital: "Belo Horizonte" },
    { estado: "Paraná", uf: "PR", capital: "Curitiba" },
    { estado: "Santa Catarina", uf: "SC", capital: "Florianópolis" },
    { estado: "Paraíba", uf: "PB", capital: "João Pessoa" },
  ],
  3: [
    { estado: "Goiás", uf: "GO", capital: "Goiânia" },
    { estado: "Bahia", uf: "BA", capital: "Salvador" },
    { estado: "Sergipe", uf: "SE", capital: "Aracaju" },
    { estado: "Espírito Santo", uf: "ES", capital: "Vitória" },
    { estado: "Mato Grosso do Sul", uf: "MS", capital: "Campo Grande" },
    { estado: "Alagoas", uf: "AL", capital: "Maceió" },
    { estado: "Tocantins", uf: "TO", capital: "Palmas" },
  ],
  4: [
    { estado: "Pernambuco", uf: "PE", capital: "Recife" },
    { estado: "Ceará", uf: "CE", capital: "Fortaleza" },
    { estado: "Amazonas", uf: "AM", capital: "Manaus" },
  ],
  5: [
    { estado: "Rio Grande do Sul", uf: "RS", capital: "Porto Alegre" },
    { estado: "Mato Grosso", uf: "MT", capital: "Cuiabá" },
    { estado: "Rio Grande do Norte", uf: "RN", capital: "Natal" },
    { estado: "Piauí", uf: "PI", capital: "Teresina" },
    { estado: "Maranhão", uf: "MA", capital: "São Luís" },
    { estado: "Pará", uf: "PA", capital: "Belém" },
    { estado: "Roraima", uf: "RR", capital: "Boa Vista" },
  ],
  7: [
    { estado: "Amapá", uf: "AP", capital: "Macapá" },
    { estado: "Acre", uf: "AC", capital: "Rio Branco" },
    { estado: "Rondônia", uf: "RO", capital: "Porto Velho" },
  ],
};

function obterDiasEntregaPorUF(ufBuscada) {
  for (const dias in diasEntregasUF) {
    const estados = diasEntregasUF[dias];
    const estado = estados.find(
      (estado) => estado.uf.toUpperCase() === ufBuscada.toUpperCase()
    );
    if (estado) {
      return parseInt(dias);
    }
  }
  return false;
}

function obterCapitalPorUF(ufBuscada) {
  for (const dias in diasEntregasUF) {
    const estados = diasEntregasUF[dias];
    const estado = estados.find((estado) => estado.uf === ufBuscada);
    if (estado) {
      return estado.capital;
    }
  }
  return false;
}

function getSessionStorageItem(key) {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function setCookieLocalizacao(cidade, uf) {
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
  document.cookie = `cidadeAB=${cidade}; path=/; secure; expires=${expirationDate.toUTCString()}`;
  document.cookie = `ufAB=${uf}; path=/; secure; expires=${expirationDate.toUTCString()}`;
}

function getCookieAB(cookieName) {
  const cookiesArray = document.cookie.split(";");
  const cookieValue = cookiesArray.find((cookie) =>
    cookie.includes(cookieName)
  );
  return cookieValue ? cookieValue.trim().replace(`${cookieName}=`, "") : false;
}

function searchAddressAndSetCookie() {
  const adressDataFrete = getSessionStorageItem("address");
  const adressAccountLogged = getSessionStorageItem(
    "customerAddressesCache-br"
  );
  let cidadeAB = "";
  let ufAB = "";

  if (adressDataFrete) {
    const { localidade: cidade, uf } = adressDataFrete;
    if (cidade && uf) {
      cidadeAB = cidade;
      ufAB = uf;
    }
  } else if (adressAccountLogged) {
    const {
      city,
      region: { id: region },
    } = adressAccountLogged.value[0];
    if (city && region) {
      cidadeAB = city;
      ufAB = region;
    }
  }
  if (cidadeAB && ufAB) {
    setCookieLocalizacao(cidadeAB, ufAB);
  }
}

function adicionarDiasUteis(data, dias) {
  let diasAdicionados = 0;
  const novaData = new Date(data);
  while (diasAdicionados < dias) {
    novaData.setDate(novaData.getDate() + 1);
    const diaSemana = novaData.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      // 0 = Domingo, 6 = Sábado
      diasAdicionados++;
    }
  }
  return novaData;
}

function obterDataEntregaCompleta() {
  const cookieCidade = getCookieAB("cidadeAB");
  const cookieUF = getCookieAB("ufAB");
  const encontrouLocalizacao = cookieCidade && cookieUF;
  const capitalUF = obterCapitalPorUF(cookieUF);
  let diasEntregaAtual = obterDiasEntregaPorUF(cookieUF);

  if (encontrouLocalizacao) {
    if (capitalUF.toLowerCase() !== cookieCidade.toLowerCase()) {
      diasEntregaAtual += 3;
    }

    const dataAtual = new Date();
    const horaAtual = dataAtual.getHours();

    // Se for antes de meio-dia, diminui 1 dia do prazo de entrega
    if (horaAtual < 12) {
      diasEntregaAtual = Math.max(diasEntregaAtual - 1, 1);
    }

    const dataEntrega = adicionarDiasUteis(dataAtual, diasEntregaAtual);

    const dia = dataEntrega.getDate();
    const mes = dataEntrega.getMonth();
    const ano = dataEntrega.getFullYear();
    const diaSemanaNumero = dataEntrega.getDay();

    const nomesDosMeses = [
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

    const diasDaSemana = [
      "domingo",
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado",
    ];

    const nomeDoMes = nomesDosMeses[mes];
    const nomeDiaSemana = diasDaSemana[diaSemanaNumero];

    // Lógica para o temporizador
    let textoCronometro = "";

    if (horaAtual < 12) {
      const horasRestantes = String(11 - horaAtual).padStart(2, "0");
      const minutosRestantes = String(59 - dataAtual.getMinutes()).padStart(
        2,
        "0"
      );

      textoCronometro = `se pedir dentro de 
          <span class="cronometroEntregaRapida">${horasRestantes}h ${minutosRestantes}min</span><br><br>`;
    }

    return `
        <p>
          <span class="spanEntregaRapida">Receba até</span>
          <span class="dataEntregaRapida">${nomeDiaSemana}, ${dia} de ${nomeDoMes}</span><br>
          ${textoCronometro}
          <div class="cidadeEntrega">
            <nb-icon icon="32/delivery/boutique-location"></nb-icon>
            <span class="spanLocalizacao"> Entregando em ${cookieCidade} - ${cookieUF}</span>
          </div>
        </p>`;
  } else {
    return "";
  }
}

function addCountdownContainer(containerAppend) {
  const css = `
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
          text-align: center;
          width: 100%;
        }
        .freteGratisContainer{
          color: #008c44;
        }
        .spanEntregaRapida, .dataEntregaRapida{
          color: #008c44;
          font-size: 16px;
        }
        .spanEntregaGratis, .dataEntregaGratis, .dataEntregaRapida, .cronometroEntregaRapida,.spanEntregaRapida, .freteGratisContainer{
          font-weight: bold;
        }
        div.cidadeEntrega{
          display: flex;
          align-items: center;
        }
        div.cidadeEntrega nb-icon svg{
          width:20px;
          height:20px;
        }
      </style>
    `;
  document.head.insertAdjacentHTML("beforeend", css);
  const divGeo = obterDataEntregaCompleta();
  const divCountdown = `
      <div class="container" id="countdown">
        <div>
          <p class="freteGratisContainer">
            —  Frete GRÁTIS e RÁPIDO para compras acima de 50 cápsulas  —
          </p>
          ${divGeo}
        </div>
      </div>
    `;
  containerAppend.insertAdjacentHTML("afterend", divCountdown);
}

searchAddressAndSetCookie();
const regexPDPs = /.*\/br\/pt\/order\/capsules\/.*\/(capsula|cafe).*/;
const pagePathAtual = window.location.pathname;
if (!pagePathAtual.includes("checkout") && regexPDPs.test(pagePathAtual)) {
  const conteudoCardCapsulas = document.querySelector(
    "nb-sku-coffee .cb-content"
  );
  let divFrete = document.querySelector("#pdp-freight-component");
  let divPreco = document.querySelector(".cb-price");
  const buscaDivPreco = setInterval(() => {
    if (divPreco && divFrete) {
      clearInterval(buscaDivPreco);
      addCountdownContainer(divPreco);
    }
    divPreco = document.querySelector(".cb-price");
    divFrete = document.querySelector("#pdp-freight-component");
  }, 1000);
}
