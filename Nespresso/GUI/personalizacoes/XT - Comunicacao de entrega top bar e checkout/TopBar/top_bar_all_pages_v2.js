(function () {
  "use strict";

  if (!window.location.pathname.includes("/br/pt")) {
    return;
  }

  // Site B2B / Professional
  if (window.location.href.includes("/pro/")) {
    return;
  }

  if (window.location.pathname.includes("checkout")) {
    return;
  }

  if (window.topBarMessageV2) {
    return;
  }

  const STYLE_ID = "at-mensagem-entrega-topbar-v2-style";
  const SLIDE_ATTR = "data-at-frete-topbar-v2";
  const BANNER_MOVED_ATTR = "data-at-frete-banner-moved";
  const SLIDER_SELECTOR = ".top-message-slider";
  const BANNER_SELECTORS = [
    "#topMessageBannerMob",
    "#topMessageBanner",
    "div[id*='topMessageBanner']",
  ];
  // Header novo fica em <main> antes do #topMessageBanner.
  // Sempre inserir imediatamente ANTES de header.cb-header-navigation.
  const HEADER_SELECTORS = [
    "header.cb-header-navigation",
    "nb-header-navigation",
    "header#header",
  ];
  const MAX_RETRIES = 40;
  const RETRY_MS = 250;
  const GUARD_MS = 250;
  const GUARD_TICKS = 60; // ~15s cobrindo hidratação do header
  let retryCount = 0;
  let retryTimer = null;
  let positionObserver = null;
  let guardTimer = null;
  let repositioning = false;
  let guardRaf = null;

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

  if (window.topBarMessageV2Running) {
    return;
  }
  window.topBarMessageV2Running = true;

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
      cuiaba: "Cuiabá",
      goiania: "Goiânia",
      vitoria: "Vitória",
      "vitoria da conquista": "Vitória da Conquista",
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

  function getSessionStorageItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      return null;
    }
  }

  function setCookieLocalizacao(cidade, uf) {
    let expirationDate = new Date();
    expirationDate.setTime(
      expirationDate.getTime() + 365 * 24 * 60 * 60 * 1000
    );

    document.cookie =
      "cidadeAB=" +
      encodeURIComponent(cidade) +
      "; path=/br/pt" +
      "; expires=" +
      expirationDate.toUTCString() +
      "; secure; SameSite=Lax";

    document.cookie =
      "ufAB=" +
      encodeURIComponent(uf) +
      "; path=/br/pt" +
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

  function normalizarUf(valor) {
    if (!valor) return "";
    let texto = String(valor).trim();
    if (texto.length === 2) {
      return texto.toUpperCase();
    }
    let ufPorNome = mapaEstadoParaUF[normalizarTexto(texto)];
    return ufPorNome || "";
  }

  // Regra antiga: address -> conta value[0] -> cookies
  function searchAddressAndSetCookie() {
    const adressDataFrete = getSessionStorageItem("address");
    const adressAccountLogged = getSessionStorageItem(
      "customerAddressesCache-br"
    );
    let cidadeAB = "";
    let ufAB = "";

    if (adressDataFrete) {
      let cidade =
        adressDataFrete.city ||
        adressDataFrete.localidade ||
        adressDataFrete.cidade ||
        "";
      let ufRaw =
        adressDataFrete.state ||
        adressDataFrete.uf ||
        adressDataFrete.region ||
        "";
      let uf = normalizarUf(ufRaw);
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
        ufAB = String(region).toUpperCase();
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
      "Receba em até <strong>1 dia útil</strong> " +
      "nas capitais de <strong>SP, RJ e PE</strong>*. " +
      '<span class="at-frete-underline">Confira os prazos para sua região</span>'
    );
  }

  function montarMensagemPersonalizada(cidade, uf) {
    let capitalUF = obterCapitalPorUF(uf);
    let diasEntrega = obterDiasEntregaPorUF(uf);

    if (!cidade || !capitalUF || !diasEntrega) {
      return null;
    }

    if (normalizarTexto(capitalUF) !== normalizarTexto(cidade)) {
      diasEntrega += 3;
    }

    let dataAtual = new Date();
    let horaAtual = dataAtual.getHours();
    let diaSemanaAtual = dataAtual.getDay();

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
    searchAddressAndSetCookie();

    let cookieCidade = getCookieAB("cidadeAB");
    let cookieUF = getCookieAB("ufAB");

    if (cookieCidade && cookieUF) {
      let cidadeFormatada = formatarNomeCidade(cookieCidade);
      let personalizada = montarMensagemPersonalizada(
        cidadeFormatada,
        cookieUF
      );
      if (personalizada) {
        return {
          html: personalizada,
          tipo: "personalizada",
          cidade: cidadeFormatada,
          uf: cookieUF,
        };
      }
    }

    return {
      html: montarMensagemGenerica(),
      tipo: "generica",
      cidade: "",
      uf: "",
    };
  }

  function getStyles() {
    return [
      "/* Banner unificado no topo - desktop + mobile */",
      "#topMessageBanner.at-frete-banner-unified,",
      "#topMessageBannerMob.at-frete-banner-unified,",
      "div[id*='topMessageBanner'].at-frete-banner-unified {",
      "  display: block !important;",
      "  visibility: visible !important;",
      "  opacity: 1 !important;",
      "  width: 100% !important;",
      "  max-width: 100% !important;",
      "  background-color: #590100 !important;",
      "  color: #fff !important;",
      "  z-index: 10002 !important;",
      "  position: relative !important;",
      "  order: -1 !important;",
      "  margin: 0 !important;",
      "  height: auto !important;",
      "  overflow: visible !important;",
      "}",
      "@media (min-width: 768px) {",
      "  #topMessageBanner.at-frete-banner-unified,",
      "  #topMessageBannerMob.at-frete-banner-unified,",
      "  div[id*='topMessageBanner'].at-frete-banner-unified,",
      "  #topMessageBanner.at-frete-banner-unified .top-message-slider,",
      "  #topMessageBannerMob.at-frete-banner-unified .top-message-slider {",
      "    display: block !important;",
      "    visibility: visible !important;",
      "    opacity: 1 !important;",
      "  }",
      "}",
      ".at-frete-banner-unified *,",
      ".at-frete-banner-unified .message-content,",
      ".at-frete-banner-unified .message-content a {",
      "  color: #fff !important;",
      "}",
      ".at-frete-banner-unified .top-message-slider {",
      "  display: block !important;",
      "  visibility: visible !important;",
      "  background-color: #590100 !important;",
      "}",
      ".at-frete-banner-unified .message-content,",
      ".at-frete-banner-unified .message-content a {",
      "  color: #fff !important;",
      "  text-decoration: none !important;",
      "  font-size: 14px !important;",
      "  line-height: 1.2 !important;",
      "}",
      ".at-frete-banner-unified .message-content strong {",
      "  color: #fff !important;",
      "  font-weight: 700 !important;",
      "}",
      ".at-frete-banner-unified .at-frete-underline {",
      "  text-decoration: underline !important;",
      "}",
      ".at-frete-banner-unified .slick-arrow,",
      ".at-frete-banner-unified .slick-message-prev,",
      ".at-frete-banner-unified .slick-message-next,",
      ".at-frete-banner-unified .Glyph {",
      "  display: block !important;",
      "  color: #fff !important;",
      "}",
      "div[id*='topMessageBanner'][data-at-frete-banner-hidden='true'] {",
      "  display: none !important;",
      "}",
      "/* Remove barra standalone da v1, se existir */",
      ".mensagemEntregaTopBar[data-at-frete-topbar='true'] {",
      "  display: none !important;",
      "}",
    ].join("\n");
  }

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = getStyles();
  }

  function getDeliveryLink() {
    return "https://www.nespresso.com/br/pt/servicos#/delivery/delivery-standard";
  }

  function sendImpressionEvent(tipo, uf) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "view",
      local_event_label:
        "xt_adobe_target_mensagem_frete_topbar_v2_" +
        tipo +
        (uf ? "_" + uf : ""),
    });
  }

  function getAllBannerContainers() {
    const found = [];
    const seen = [];

    function pushUnique(el) {
      if (!el) return;
      if (seen.indexOf(el) !== -1) return;
      seen.push(el);
      found.push(el);
    }

    for (let i = 0; i < BANNER_SELECTORS.length; i++) {
      const nodes = document.querySelectorAll(BANNER_SELECTORS[i]);
      for (let j = 0; j < nodes.length; j++) {
        pushUnique(nodes[j]);
      }
    }

    if (!found.length) {
      const slider = document.querySelector(SLIDER_SELECTOR);
      if (slider) {
        pushUnique(
          slider.closest("div[id*='topMessageBanner']") || slider.parentElement
        );
      }
    }

    return found;
  }

  function pickPrimaryBanner(banners) {
    if (!banners.length) return null;

    // Prioriza o que ja tem slick inicializado
    for (let i = 0; i < banners.length; i++) {
      if (banners[i].querySelector(SLIDER_SELECTOR + ".slick-initialized")) {
        return banners[i];
      }
    }

    for (let i = 0; i < banners.length; i++) {
      if (banners[i].querySelector(SLIDER_SELECTOR)) {
        return banners[i];
      }
    }

    return banners[0];
  }

  function getHeaderEl() {
    for (let i = 0; i < HEADER_SELECTORS.length; i++) {
      const el = document.querySelector(HEADER_SELECTORS[i]);
      if (el) return el;
    }
    return null;
  }

  function hideSecondaryBanners(primary, banners) {
    for (let i = 0; i < banners.length; i++) {
      if (banners[i] !== primary) {
        banners[i].style.setProperty("display", "none", "important");
        banners[i].setAttribute("data-at-frete-banner-hidden", "true");
      }
    }
  }

  function isBannerAboveHeader(banner, header) {
    return !!banner && !!header && banner.nextElementSibling === header;
  }

  function getPrimaryVisibleBanner() {
    const banners = getAllBannerContainers();
    if (!banners.length) return null;

    const visible = banners.filter(function (banner) {
      return banner.getAttribute("data-at-frete-banner-hidden") !== "true";
    });

    const primary = pickPrimaryBanner(visible.length ? visible : banners);
    if (primary) {
      hideSecondaryBanners(primary, banners);
    }
    return primary;
  }

  function ensureBannerAboveHeader() {
    if (repositioning) return false;

    const banner = getPrimaryVisibleBanner();
    const header = getHeaderEl();
    if (!banner || !header) return false;

    banner.classList.add("at-frete-banner-unified");
    banner.setAttribute(BANNER_MOVED_ATTR, "true");

    if (isBannerAboveHeader(banner, header)) {
      return true;
    }

    // Site remonta o header e joga o banner para baixo — recoloca acima
    repositioning = true;
    try {
      header.insertAdjacentElement("beforebegin", banner);
    } finally {
      repositioning = false;
    }

    return isBannerAboveHeader(banner, header);
  }

  function moveBannerToTop() {
    return ensureBannerAboveHeader();
  }

  function schedulePositionCheck() {
    if (guardRaf) return;
    guardRaf = window.requestAnimationFrame(function () {
      guardRaf = null;
      ensureBannerAboveHeader();
    });
  }

  function startPositionGuard() {
    if (!positionObserver) {
      positionObserver = new MutationObserver(function () {
        if (repositioning) return;
        schedulePositionCheck();
      });
      positionObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    if (guardTimer) return;

    let ticks = 0;
    guardTimer = setInterval(function () {
      ensureBannerAboveHeader();
      ticks += 1;
      if (ticks >= GUARD_TICKS) {
        clearInterval(guardTimer);
        guardTimer = null;
      }
    }, GUARD_MS);
  }

  function buildFreteSlideHtml(mensagemHtml) {
    return (
      '<div class="slide-message mensagemEntregaTopBar track-promotion-impression track-promotion-click" ' +
      SLIDE_ATTR +
      '="true" data-promotion-creative="site-stickymessage" data-promotion-position="site-stickymessage" data-link-creative="site-stickymessage" data-link-position="site-stickymessage" data-promotion-item-id="mensagem_frete_header" data-promotion-name="mensagem_frete_header" data-link-item-id="mensagem_frete_header" data-link-name="mensagem_frete_header">' +
      '<p class="message-content"><a href="' +
      getDeliveryLink() +
      '" style="text-decoration: none;">' +
      mensagemHtml +
      "</a></p></div>"
    );
  }

  function getSliderEl() {
    const unified = document.querySelector(
      "div[id*='topMessageBanner'].at-frete-banner-unified " + SLIDER_SELECTOR
    );
    if (unified) return unified;

    const banners = getAllBannerContainers().filter(function (banner) {
      return banner.getAttribute("data-at-frete-banner-hidden") !== "true";
    });
    const primary = pickPrimaryBanner(banners);
    if (primary) {
      const nested = primary.querySelector(SLIDER_SELECTOR);
      if (nested) return nested;
    }
    return document.querySelector(SLIDER_SELECTOR);
  }

  function initSlickIfNeeded($slider) {
    if (!$slider || !$slider.length) return false;
    if ($slider.hasClass("slick-initialized")) {
      return true;
    }

    try {
      $slider.slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        dots: false,
        centerMode: true,
        centerPadding: "0px",
        prevArrow:
          '<div class="slick-message-prev slick-arrow"><span class="Glyph Glyph--arrow-left"></span></div>',
        nextArrow:
          '<div class="slick-message-next slick-arrow"><span class="Glyph Glyph--arrow-right"></span></div>',
      });
      return $slider.hasClass("slick-initialized");
    } catch (err) {
      return false;
    }
  }

  function addFreteSlideAsFirst(mensagemHtml) {
    if (
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.slick
    ) {
      return false;
    }

    const $ = window.jQuery;
    const sliderEl = getSliderEl();
    if (!sliderEl) return false;

    const $slider = $(sliderEl);
    if (!initSlickIfNeeded($slider)) {
      return false;
    }

    // Evita duplicar o slide de frete
    if ($slider.find("[" + SLIDE_ATTR + '="true"]').length) {
      try {
        $slider.slick("setPosition");
        $slider.slick("slickGoTo", 0, true);
      } catch (err) {
        // ignore
      }
      return true;
    }

    try {
      $slider.slick("slickAdd", buildFreteSlideHtml(mensagemHtml), 0);
      $slider.slick("slickGoTo", 0, true);
      $slider.slick("setPosition");
      return true;
    } catch (err) {
      return false;
    }
  }

  function scheduleRetry() {
    if (retryCount >= MAX_RETRIES) {
      window.topBarMessageV2Running = false;
      return;
    }
    if (retryTimer) return;

    retryTimer = setTimeout(function () {
      retryTimer = null;
      retryCount += 1;
      runV2();
    }, RETRY_MS);
  }

  function runV2() {
    injectStyles();

    const moved = moveBannerToTop();
    if (!moved) {
      scheduleRetry();
      return;
    }

    const dadosMensagem = montarMensagem();
    const slideOk = addFreteSlideAsFirst(dadosMensagem.html);

    if (!slideOk) {
      scheduleRetry();
      return;
    }

    startPositionGuard();
    window.topBarMessageV2 = "true";
    window.topBarMessageV2Running = false;
    sendImpressionEvent(dadosMensagem.tipo, dadosMensagem.uf);
  }

  runV2();
})();
