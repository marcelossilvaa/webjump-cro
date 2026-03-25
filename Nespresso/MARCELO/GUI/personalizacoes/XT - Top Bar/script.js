let diasEntregasUF = {
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
  expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias de validade

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

function obterDataEntregaCompleta() {
  let cookieCidade = getCookieAB("cidadeAB");
  let cookieUF = getCookieAB("ufAB");
  let encontrouLocalizacao = cookieCidade && cookieUF ? true : false;

  if (encontrouLocalizacao) {
    let capitalUF = obterCapitalPorUF(cookieUF);
    let diasEntregaAtual = obterDiasEntregaPorUF(cookieUF);

    if (capitalUF.toLowerCase() != cookieCidade.toLowerCase()) {
      diasEntregaAtual += 3;
    }

    let dataAtual = new Date();
    let horaAtual = dataAtual.getHours();

    // Se for antes de onze da manhã, diminui 1 dia do prazo de entrega
    if (horaAtual < 11) {
      diasEntregaAtual -= 1;
      if (diasEntregaAtual <= 0) {
        diasEntregaAtual = 1;
      }
    } else {
      diasEntregaAtual += 1;
    }

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

    let dataEntrega = adicionarDiasUteis(dataAtual, diasEntregaAtual);

    let dia = dataEntrega.getDate();
    let mes = dataEntrega.getMonth();
    let ano = dataEntrega.getFullYear();
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

    let nomeDoMes = nomesDosMeses[mes];
    let nomeDiaSemana = diasDaSemana[diaSemanaNumero];

    // Lógica para o temporizador
    let minutosRestantes;
    let horasRestantes;
    let textoCronometro = "";

    if (horaAtual < 11) {
      horasRestantes = 10 - horaAtual;
      minutosRestantes = 59 - dataAtual.getMinutes();

      // Ajusta minutos e horas se necessário
      if (minutosRestantes < 0) {
        minutosRestantes += 60;
        horasRestantes -= 1;
      }

      horasRestantes =
        horasRestantes < 10 ? "0" + horasRestantes : horasRestantes;
      minutosRestantes =
        minutosRestantes < 10 ? "0" + minutosRestantes : minutosRestantes;

      textoCronometro =
        `<div class="cronometroContainer">se pedir dentro de 
              <span class="cronometroEntregaRapida">` +
        horasRestantes +
        `h ` +
        minutosRestantes +
        `min</span></div>`;
    }

    let dataEntregaFormatada =
      `<div>
          <span class="spanEntregaRapida">Receba até</span>
          <span class="dataEntregaRapida">` +
      nomeDiaSemana +
      `, ` +
      dia +
      ` de ` +
      nomeDoMes +
      `</span></div>` +
      textoCronometro +
      `<div class="cidadeEntrega">
                <nb-icon icon="32/delivery/boutique-location"></nb-icon>
                <span class="spanLocalizacao"> Entregando em ` +
      cookieCidade +
      ` - ` +
      cookieUF +
      `</span>
              </div>`;

    return dataEntregaFormatada;
  } else {
    return "";
  }
}

searchAddressAndSetCookie();
let regexPDPs = /.*\/br\/pt\/order\/.*\/.*\/.*/;
let pagePathAtual = window.location.pathname;
if (!pagePathAtual.includes("checkout")) {
  if (regexPDPs.test(pagePathAtual)) {
    let divFrete = document.querySelector("#pdp-freight-component");
    let divPreco = document.querySelector(".cb-price");
    let buscaDivPreco = setInterval(function () {
      if (divPreco && divFrete) {
        clearInterval(buscaDivPreco);
        addCountdownContainer(divPreco, divFrete);
      }
      divPreco = document.querySelector(".cb-price");
      divFrete = document.querySelector("#pdp-freight-component");
    }, 1000);
  }
}
