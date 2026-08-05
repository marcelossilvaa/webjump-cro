(function () {
  "use strict";

  if (window.location.pathname.includes("checkout")) {
    return;
  }

  const STYLE_ID = "at-mensagem-entrega-topbar-style";
  const BAR_CLASS = "mensagemEntregaTopBar";
  const BAR_SELECTOR = "." + BAR_CLASS;
  // Ancora fora do nb-header-navigation (ele move/esconde ribbons internos)
  const ANCHOR_SELECTORS = [
    "#top",
    "header#header",
    "nb-header-navigation",
    "#main-container",
  ];
  const LEGACY_SLIDER_SELECTOR = "div[id*='topMessageBanner'] .top-message-slider";
  const MAX_RETRIES = 40;
  const RETRY_MS = 250;
  let retryCount = 0;
  let retryTimer = null;

  // Prazos oficiais (dias uteis) — valor da chave = capital; interior = capital + 3
  // 1/4: PE, RJ, SP
  // 2/5: DF, ES, MG, MS, PR, SC
  // 3/6: AL, CE, PB, GO, BA, RN, SE, RS
  // 5/8: PI, MA, TO, MT
  // 7/10: AM, AC, AP, PA, RR, RO
  // Pedidos apos 12h, fins de semana ou feriados: +1 dia util
  const diasEntregasUF = {
    1: [
      { estado: "Pernambuco", uf: "PE", capital: "Recife" },
      { estado: "Rio de Janeiro", uf: "RJ", capital: "Rio de Janeiro" },
      { estado: "São Paulo", uf: "SP", capital: "São Paulo" },
    ],
    2: [
      { estado: "Distrito Federal", uf: "DF", capital: "Brasília" },
      { estado: "Espírito Santo", uf: "ES", capital: "Vitória" },
      { estado: "Minas Gerais", uf: "MG", capital: "Belo Horizonte" },
      { estado: "Mato Grosso do Sul", uf: "MS", capital: "Campo Grande" },
      { estado: "Paraná", uf: "PR", capital: "Curitiba" },
      { estado: "Santa Catarina", uf: "SC", capital: "Florianópolis" },
    ],
    3: [
      { estado: "Alagoas", uf: "AL", capital: "Maceió" },
      { estado: "Ceará", uf: "CE", capital: "Fortaleza" },
      { estado: "Paraíba", uf: "PB", capital: "João Pessoa" },
      { estado: "Goiás", uf: "GO", capital: "Goiânia" },
      { estado: "Bahia", uf: "BA", capital: "Salvador" },
      { estado: "Rio Grande do Norte", uf: "RN", capital: "Natal" },
      { estado: "Sergipe", uf: "SE", capital: "Aracaju" },
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

  function isBarVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getOurVisibleBar() {
    const bars = document.querySelectorAll(
      BAR_SELECTOR + '[data-at-frete-topbar="true"]'
    );
    for (let i = 0; i < bars.length; i++) {
      if (isBarVisible(bars[i])) {
        return bars[i];
      }
    }
    return null;
  }

  function removeHiddenBars() {
    const bars = document.querySelectorAll(
      BAR_SELECTOR + '[data-at-frete-topbar="true"]'
    );
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      if (!isBarVisible(bar) && bar.parentNode) {
        bar.parentNode.removeChild(bar);
      }
    }
  }

  // Se a barra ja esta visivel, nao duplica
  if (getOurVisibleBar()) {
    return;
  }

  // Limpa flag presa de execucao anterior que falhou
  if (window.topBarMessageRunning && !getOurVisibleBar()) {
    window.topBarMessageRunning = false;
  }

  if (window.topBarMessageRunning) {
    return;
  }

  window.topBarMessageRunning = true;

  window.gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });

  const mapaEstadoParaUF = {
    acre: "AC",
    alagoas: "AL",
    amapa: "AP",
    amazonas: "AM",
    bahia: "BA",
    ceara: "CE",
    "distrito federal": "DF",
    "espirito santo": "ES",
    goias: "GO",
    maranhao: "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    para: "PA",
    paraiba: "PB",
    parana: "PR",
    pernambuco: "PE",
    piaui: "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    rondonia: "RO",
    roraima: "RR",
    "santa catarina": "SC",
    "sao paulo": "SP",
    sergipe: "SE",
    tocantins: "TO",
  };

  function normalizarTexto(valor) {
    return String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function formatarNomeCidade(cidade) {
    let normalizada = normalizarTexto(cidade);
    if (!normalizada) return "";

    // Prioriza nomes oficiais das capitais (com acento)
    for (let dias in diasEntregasUF) {
      if (Object.prototype.hasOwnProperty.call(diasEntregasUF, dias)) {
        let estados = diasEntregasUF[dias];
        for (let i = 0; i < estados.length; i++) {
          if (normalizarTexto(estados[i].capital) === normalizada) {
            return estados[i].capital;
          }
        }
      }
    }

    // Cidades comuns que o geo costuma devolver sem acento
    let mapaCidades = {
      "sao paulo": "São Paulo",
      "sao luis": "São Luís",
      "sao jose dos campos": "São José dos Campos",
      "sao bernardo do campo": "São Bernardo do Campo",
      "sao goncalo": "São Gonçalo",
      "ribeirao preto": "Ribeirão Preto",
      "feira de santana": "Feira de Santana",
      "juiz de fora": "Juiz de Fora",
      "porto alegre": "Porto Alegre",
      "belo horizonte": "Belo Horizonte",
      "campo grande": "Campo Grande",
      "joao pessoa": "João Pessoa",
      "macapa": "Macapá",
      "belem": "Belém",
      "cuiaba": "Cuiabá",
      "goiania": "Goiânia",
      "vitoria": "Vitória",
      brasilia: "Brasília",
      maceio: "Maceió",
      florianopolis: "Florianópolis",
    };

    if (mapaCidades[normalizada]) {
      return mapaCidades[normalizada];
    }

    return String(cidade || "")
      .trim()
      .split(/\s+/)
      .map(function (parte) {
        if (!parte) return "";
        return parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function tokenResolvido(valor) {
    let texto = String(valor || "").trim();
    if (!texto) return false;
    if (texto.indexOf("${") !== -1) return false;
    let lower = texto.toLowerCase();
    if (lower === "undefined" || lower === "null" || lower === "unknown") {
      return false;
    }
    return true;
  }

  function obterDiasEntregaPorUF(ufBuscada) {
    for (let dias in diasEntregasUF) {
      if (Object.prototype.hasOwnProperty.call(diasEntregasUF, dias)) {
        let estados = diasEntregasUF[dias];
        for (let i = 0; i < estados.length; i++) {
          if (estados[i].uf.toUpperCase() === ufBuscada.toUpperCase()) {
            return parseInt(dias, 10);
          }
        }
      }
    }
    return false;
  }

  function obterCapitalPorUF(ufBuscada) {
    for (let dias in diasEntregasUF) {
      if (Object.prototype.hasOwnProperty.call(diasEntregasUF, dias)) {
        let estados = diasEntregasUF[dias];
        for (let i = 0; i < estados.length; i++) {
          if (estados[i].uf.toUpperCase() === ufBuscada.toUpperCase()) {
            return estados[i].capital;
          }
        }
      }
    }
    return false;
  }

  // Backup: tokens substituidos pelo Target na entrega da oferta
  function getTargetGeolocation() {
    let cidadeRaw = "${profile.geolocation.city}";
    let estadoRaw = "${profile.geolocation.state}";
    let paisRaw = "${profile.geolocation.country}";

    if (!tokenResolvido(cidadeRaw) || !tokenResolvido(estadoRaw)) {
      return null;
    }

    if (tokenResolvido(paisRaw)) {
      let paisNorm = normalizarTexto(paisRaw);
      if (paisNorm !== "brazil" && paisNorm !== "brasil" && paisNorm !== "br") {
        return null;
      }
    }

    let uf = mapaEstadoParaUF[normalizarTexto(estadoRaw)];
    if (!uf) {
      let estadoUpper = String(estadoRaw).trim().toUpperCase();
      if (estadoUpper.length === 2 && obterDiasEntregaPorUF(estadoUpper)) {
        uf = estadoUpper;
      } else {
        return null;
      }
    }

    return {
      cidade: formatarNomeCidade(cidadeRaw),
      uf: uf,
    };
  }

  function getSessionStorageItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      return null;
    }
  }

  function getCookiePath() {
    const match = window.location.pathname.match(/^\/br\/(pt|en)/i);
    return match ? "/br/" + match[1].toLowerCase() : "/";
  }

  function getLocaleBasePath() {
    const match = window.location.pathname.match(/^\/br\/(pt|en)/i);
    return match ? "/br/" + match[1].toLowerCase() : "/br/pt";
  }

  function setCookieLocalizacao(cidade, uf) {
    let expirationDate = new Date();
    expirationDate.setTime(
      expirationDate.getTime() + 365 * 24 * 60 * 60 * 1000
    );
    let cookiePath = getCookiePath();

    document.cookie =
      "cidadeAB=" +
      encodeURIComponent(cidade) +
      "; path=" +
      cookiePath +
      "; expires=" +
      expirationDate.toUTCString() +
      "; secure; SameSite=Lax";

    document.cookie =
      "ufAB=" +
      encodeURIComponent(uf) +
      "; path=" +
      cookiePath +
      "; expires=" +
      expirationDate.toUTCString() +
      "; secure; SameSite=Lax";
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
    } else if (
      adressAccountLogged &&
      adressAccountLogged.value &&
      adressAccountLogged.value[0]
    ) {
      const firstEntry = adressAccountLogged.value[0];
      const city = firstEntry.city;
      const region = firstEntry.region && firstEntry.region.id;
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
    } else if (cidadeAB && ufAB) {
      setCookieLocalizacao(cidadeAB, ufAB);
    }
  }

  function adicionarDiasUteis(data, dias) {
    let diasAdicionados = 0;
    let novaData = new Date(data);
    while (diasAdicionados < dias) {
      novaData.setDate(novaData.getDate() + 1);
      let diaSemana = novaData.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasAdicionados++;
      }
    }
    return novaData;
  }

  function montarMensagemGenerica() {
    return (
      "Receba onde quiser. Entrega em até <strong>1 dia útil</strong> " +
      "nas capitais de <strong>SP, RJ e PE</strong>*. " +
      "Confira os prazos para sua região"
    );
  }

  function montarMensagemPersonalizada(cidade, uf) {
    let capitalUF = obterCapitalPorUF(uf);
    let diasEntrega = obterDiasEntregaPorUF(uf);

    if (!cidade || !capitalUF || !diasEntrega) {
      return null;
    }

    // Interior: capital + 3 dias uteis
    if (normalizarTexto(capitalUF) !== normalizarTexto(cidade)) {
      diasEntrega += 3;
    }

    let dataAtual = new Date();
    let horaAtual = dataAtual.getHours();
    let diaSemanaAtual = dataAtual.getDay();

    // Apos 12h, fim de semana: +1 dia util
    if (horaAtual >= 12 || diaSemanaAtual === 0 || diaSemanaAtual === 6) {
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

    return (
      "Comprando hoje, receba até <strong>" +
      diasDaSemana[diaSemanaNumero] +
      ", " +
      dia +
      " de " +
      nomesDosMeses[mes] +
      "</strong>, em <strong>" +
      cidade +
      "</strong>"
    );
  }

  function montarMensagem() {
    // 1) sessionStorage / conta logada -> cookies
    searchAddressAndSetCookie();

    let cookieCidade = getCookieAB("cidadeAB");
    let cookieUF = getCookieAB("ufAB");

    if (cookieCidade && cookieUF) {
      let personalizada = montarMensagemPersonalizada(cookieCidade, cookieUF);
      if (personalizada) {
        return {
          html: personalizada,
          tipo: "personalizada",
          cidade: cookieCidade,
          uf: cookieUF,
          fonte: "session_cookie",
        };
      }
    }

    // 2) Backup: geo do Adobe Target (IP)
    let geoTarget = getTargetGeolocation();
    if (geoTarget) {
      setCookieLocalizacao(geoTarget.cidade, geoTarget.uf);
      let personalizadaGeo = montarMensagemPersonalizada(
        geoTarget.cidade,
        geoTarget.uf
      );
      if (personalizadaGeo) {
        return {
          html: personalizadaGeo,
          tipo: "personalizada_geo",
          cidade: geoTarget.cidade,
          uf: geoTarget.uf,
          fonte: "target_geo",
        };
      }
    }

    // 3) Fallback generico
    return {
      html: montarMensagemGenerica(),
      tipo: "generica",
      cidade: cookieCidade || "",
      uf: cookieUF || "",
      fonte: "generica",
    };
  }

  function getStyles() {
    return [
      "." + BAR_CLASS + " {",
      "  display: block !important;",
      "  visibility: visible !important;",
      "  opacity: 1 !important;",
      "  position: relative !important;",
      "  background-color: #590100 !important;",
      "  color: #fff !important;",
      "  width: 100% !important;",
      "  max-width: 100% !important;",
      "  box-sizing: border-box !important;",
      "  padding: 10px 16px !important;",
      "  text-align: center !important;",
      "  font-family: NespressoLucas, Arial, sans-serif !important;",
      "  z-index: 10001 !important;",
      "  margin: 0 !important;",
      "  height: auto !important;",
      "  min-height: 40px !important;",
      "}",
      "." + BAR_CLASS + " .message-content {",
      "  margin: 0 !important;",
      "  font-size: 14px !important;",
      "  line-height: 1.2 !important;",
      "  color: #fff !important;",
      "}",
      "." + BAR_CLASS + " .message-content a {",
      "  color: #fff !important;",
      "  text-decoration: none !important;",
      "}",
      "." + BAR_CLASS + " .message-content strong {",
      "  color: #fff !important;",
      "  font-weight: 700 !important;",
      "}",
    ].join("\n");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function getDeliveryLink() {
    return (
      "https://www.nespresso.com" +
      getLocaleBasePath() +
      "/servicos#/delivery/delivery-standard"
    );
  }

  function sendImpressionEvent(tipo, uf) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "view",
      local_event_label:
        "xt_adobe_target_mensagem_frete_topbar_" +
        tipo +
        (uf ? "_" + uf : ""),
    });
  }

  function getAnchor() {
    for (let i = 0; i < ANCHOR_SELECTORS.length; i++) {
      const el = document.querySelector(ANCHOR_SELECTORS[i]);
      if (el) {
        return { el: el, selector: ANCHOR_SELECTORS[i] };
      }
    }
    return null;
  }

  function createBar(mensagemHtml) {
    const bar = document.createElement("div");
    bar.className =
      BAR_CLASS + " track-promotion-impression track-promotion-click";
    bar.setAttribute("data-at-frete-topbar", "true");
    bar.setAttribute("data-promotion-creative", "site-stickymessage");
    bar.setAttribute("data-promotion-position", "site-stickymessage");
    bar.setAttribute("data-link-creative", "site-stickymessage");
    bar.setAttribute("data-link-position", "site-stickymessage");
    bar.setAttribute("data-promotion-item-id", "mensagem_frete_header");
    bar.setAttribute("data-promotion-name", "mensagem_frete_header");
    bar.setAttribute("data-link-item-id", "mensagem_frete_header");
    bar.setAttribute("data-link-name", "mensagem_frete_header");

    bar.innerHTML =
      '<p class="message-content"><a href="' +
      getDeliveryLink() +
      '">' +
      mensagemHtml +
      "</a></p>";

    return bar;
  }

  function insertIntoNewHeader(mensagemHtml) {
    const anchor = getAnchor();
    if (!anchor) {
      return false;
    }

    injectStyles();
    const bar = createBar(mensagemHtml);

    if (anchor.selector === "#main-container") {
      anchor.el.insertAdjacentElement("afterbegin", bar);
    } else {
      anchor.el.insertAdjacentElement("beforebegin", bar);
    }

    return true;
  }

  function insertIntoLegacySlider(mensagemHtml) {
    if (
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.slick
    ) {
      return false;
    }

    const $ = window.jQuery;
    const $slider = $(LEGACY_SLIDER_SELECTOR);
    if (!$slider.length) return false;

    injectStyles();

    let slickSlide =
      '<div class="slide-message ' +
      BAR_CLASS +
      ' track-promotion-impression track-promotion-click slick-slide" data-at-frete-topbar="true" data-promotion-creative="site-stickymessage" data-promotion-position="site-stickymessage" data-link-creative="site-stickymessage" data-link-position="site-stickymessage" data-promotion-item-id="mensagem_frete_header" data-promotion-name="mensagem_frete_header" data-link-item-id="mensagem_frete_header" data-link-name="mensagem_frete_header" data-slick-index="4" aria-hidden="true" tabindex="-1"><p class="message-content"><a href="' +
      getDeliveryLink() +
      '">' +
      mensagemHtml +
      "</a></p></div>";

    try {
      $slider.slick("slickAdd", slickSlide, 0);
      return true;
    } catch (err) {
      return false;
    }
  }

  function scheduleRetry() {
    if (retryCount >= MAX_RETRIES) {
      window.topBarMessageRunning = false;
      return;
    }
    if (retryTimer) return;

    retryTimer = setTimeout(function () {
      retryTimer = null;
      retryCount += 1;
      setMessagesTopBar();
    }, RETRY_MS);
  }

  function setMessagesTopBar() {
    removeHiddenBars();

    const visibleBar = document.querySelector(BAR_SELECTOR);
    if (visibleBar && isBarVisible(visibleBar)) {
      window.topBarMessageRunning = false;
      return;
    }

    let dadosMensagem = montarMensagem();

    let inserted =
      insertIntoNewHeader(dadosMensagem.html) ||
      insertIntoLegacySlider(dadosMensagem.html);

    if (inserted) {
      window.topBarMessage = "true";
      window.topBarMessageRunning = false;
      sendImpressionEvent(dadosMensagem.tipo, dadosMensagem.uf);
      return;
    }

    scheduleRetry();
  }

  setMessagesTopBar();
})();
