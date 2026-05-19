(function () {
  'use strict';

  // ===================== GUARDS =====================
  // Somente desktop (largura minima 1024px)
  if (window.innerWidth < 1024) return;

  // Somente na pagina de hoteis
  if (window.location.href.indexOf('https://www.voeazul.com.br/br/pt/home/hotel?') === -1) return;

  // ===================== CONSTANTES =====================
  const STYLE_ID = 'at-mapa-lista-integrada-style';
  const MAP_ID = 'at-mapa-integrado';
  const DATA_APLICADO = 'data-at-mapa-lista-aplicado';
  const DATA_HOVER = 'data-at-card-hover';
  const MAX_TENTATIVAS = 60;
  const INTERVALO_POLLING = 1000;
  const LOG_PREFIX = '[Mapa+Lista Hoteis]';

  // ===================== ESTADO =====================
  let mapInstance = null;
  let marcadores = [];
  let infoWindowAtiva = null;
  let cardAtivoIdx = -1;
  let isProcessing = false;
  let debounceTimer = null;
  let observerRef = null;
  let observerGlobalRef = null;
  let dadosCache = [];
  let mapsAPICarregada = false;
  let aguardandoPaginacao = false;

  // ===================== CSS =====================
  function injetarEstilos() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Container do mapa
      '#' + MAP_ID + ' {',
      '  width: 100%; height: 380px;',
      '  border-radius: 12px;',
      '  overflow: hidden;',
      '  box-shadow: 0 2px 8px rgba(0,0,0,.12);',
      '  margin-bottom: 12px;',
      '}',

      // Desktop: split layout lado a lado (estilo Airbnb)
      '@media (min-width: 1024px) {',
      '  [' + DATA_APLICADO + '] {',
      '    display: flex !important;',
      '    flex-wrap: wrap !important;',
      '    align-items: flex-start !important;',
      '  }',
      '  [' + DATA_APLICADO + '] > [class*="FilterRow-sc"] {',
      '    width: 100% !important;',
      '    flex: 0 0 100% !important;',
      '  }',
      '  [' + DATA_APLICADO + '] > #' + MAP_ID + ' {',
      '    width: 50% !important;',
      '    height: calc(100vh - 220px) !important;',
      '    min-height: 500px;',
      '    flex: 0 0 50%;',
      '    order: 2;',
      '    position: sticky;',
      '    align-self: flex-start;',
      '    border-radius: 12px;',
      '    margin: 0 0 0 8px;',
      '  }',
      '  [' + DATA_APLICADO + '] > [data-testid="hotel-list-wrapper-contains-cards"] {',
      '    width: calc(50% - 16px) !important;',
      '    flex: 0 0 calc(50% - 16px);',
      '    order: 1;',
      '    overflow-y: auto !important;',
      '    max-height: calc(100vh - 220px);',
      '    padding-right: 8px;',
      '  }',
      '  [' + DATA_APLICADO + '] > [class*="PaginationWrapper"] {',
      '    width: calc(50% - 16px) !important;',
      '    flex: 0 0 calc(50% - 16px);',
      '    order: 3;',
      '  }',
      '}',

      // Card ativo (hover/click do mapa)
      '[class*="HotelCardWrapper-sc"].at-card-ativo > [class*="CardContainer-sc"] {',
      '  outline: 3px solid #026CB6 !important;',
      '  outline-offset: -3px;',
      '  border-radius: 10px;',
      '  transition: outline .2s ease;',
      '}',

      // Card reestruturado para o split 50/50
      '[' + DATA_APLICADO + '] [class*="HotelCardWrapper-sc"] {',
      '  margin-bottom: 12px;',
      '}',
      '[' + DATA_APLICADO + '] [class*="CardContainer-sc"] {',
      '  border-radius: 10px;',
      '  overflow: hidden;',
      '  box-shadow: 0 1px 4px rgba(0,0,0,.1);',
      '  background: #fff;',
      '}',

      // Wrapper interno: empilhar verticalmente
      '[' + DATA_APLICADO + '] [class*="WrapperSlidesDesktop-sc"] {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  height: auto !important;',
      '  min-height: unset !important;',
      '}',

      // Slider de imagem: largura total, altura controlada
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] {',
      '  width: 100% !important;',
      '  height: 160px !important;',
      '  max-height: 160px !important;',
      '  overflow: hidden;',
      '  flex-shrink: 0;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] .slick-slider,',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] .slick-list,',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] .slick-track,',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] .slick-slide,',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] .slick-slide > div {',
      '  height: 160px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] .slick-slide {',
      '  width: 100% !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Slider-sc-1ft5opc"] img {',
      '  width: 100% !important;',
      '  height: 160px !important;',
      '  object-fit: cover !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="StyledSlider-sc-o70g43"] {',
      '  height: 160px !important;',
      '}',

      // PromoTag: reposicionar dentro do slider
      '[' + DATA_APLICADO + '] [class*="PromoTagContainer-sc"] {',
      '  height: 160px !important;',
      '}',

      // Conteudo: padding e layout
      '[' + DATA_APLICADO + '] [class*="ContentWrapper-sc-1ft5opc"] {',
      '  width: 100% !important;',
      '  padding: 12px 14px !important;',
      '  box-sizing: border-box !important;',
      '}',

      // InfosWrapper: garantir que nao sobreponha
      '[' + DATA_APLICADO + '] [class*="InfosWrapper-sc-1ft5opc"] {',
      '  width: 100% !important;',
      '  overflow: hidden;',
      '}',

      // Nome do hotel
      '[' + DATA_APLICADO + '] [class*="HotelName-sc"] {',
      '  font-size: 15px !important;',
      '  font-weight: 700 !important;',
      '  color: rgb(1, 78, 132) !important;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  max-width: 100%;',
      '  font-family: "Helvetica Neue", Arial, sans-serif !important;',
      '}',

      // Wrapper do nome + estrelas
      '[' + DATA_APLICADO + '] [class*="HotelNameWrapper-sc"] {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  gap: 6px;',
      '  margin-bottom: 4px;',
      '  max-width: 100%;',
      '  overflow: hidden;',
      '}',

      // Localizacao
      '[' + DATA_APLICADO + '] [class*="NeighboorhoodDistance-sc"] {',
      '  font-size: 12px !important;',
      '  color: #555 !important;',
      '  display: block !important;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  margin-bottom: 8px;',
      '}',
      '[' + DATA_APLICADO + '] [class*="MapButton-sc"] {',
      '  display: none !important;',
      '}',

      // Carousel de tags (cancelamento, refeicao)
      '[' + DATA_APLICADO + '] [class*="InfosCarouselWrapper-sc"] {',
      '  overflow: hidden;',
      '  max-width: 100%;',
      '}',
      '[' + DATA_APLICADO + '] [class*="CarouselWrapper-sc-3qprdy"] {',
      '  overflow: hidden;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Carousel-sc-3qprdy"] {',
      '  display: flex !important;',
      '  flex-wrap: wrap !important;',
      '  gap: 4px;',
      '}',
      '[' + DATA_APLICADO + '] [class*="InfoTagContainer-sc"] {',
      '  flex-shrink: 0;',
      '}',
      '[' + DATA_APLICADO + '] [class*="InfoTagWrapper-sc"] span {',
      '  font-size: 11px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="ButtonWrapperBase-sc-3qprdy"] {',
      '  display: none !important;',
      '}',

      // Preco: layout compacto
      '[' + DATA_APLICADO + '] [class*="PriceWrapper-sc-10ygdxz"] {',
      '  width: 100% !important;',
      '  padding: 10px 14px 14px !important;',
      '  box-sizing: border-box !important;',
      '  border-top: 1px solid #eee;',
      '}',
      '[' + DATA_APLICADO + '] [class*="ContentPrice-sc"] {',
      '  width: 100% !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="BorderContainer-sc"] {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  width: 100% !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="BorderContentPrice-sc"] {',
      '  width: 100% !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="PriceContentWrapper-sc"] {',
      '  display: flex !important;',
      '  flex-wrap: wrap !important;',
      '  align-items: baseline !important;',
      '  gap: 4px 8px;',
      '}',
      '[' + DATA_APLICADO + '] [class*="ContainerDaily-sc"] {',
      '  font-size: 12px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="DailyText-sc"] {',
      '  font-size: 12px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Price-sc-10ygdxz"] {',
      '  white-space: nowrap;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Currency-sc"] {',
      '  font-size: 13px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Integer-sc"] {',
      '  font-size: 20px !important;',
      '  color: rgb(1, 78, 132) !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="Cents-sc"] {',
      '  font-size: 12px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="PriceInstallments-sc"] {',
      '  font-size: 11px !important;',
      '  width: 100%;',
      '}',

      // Acumule pontos: compacto
      '[' + DATA_APLICADO + '] [class*="AccrualWrapper-sc"] {',
      '  padding: 6px 0 !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="AccrualTitle-sc"] {',
      '  font-size: 11px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="AccrualText-sc"] {',
      '  font-size: 11px !important;',
      '}',
      '[' + DATA_APLICADO + '] [class*="BackgroundAccrual-sc"] {',
      '  display: none !important;',
      '}',

      // Botao Ver detalhes
      '[' + DATA_APLICADO + '] [class*="PriceWrapper-sc"] button[data-testid="search-box-hotel-date-picker-primary-button"] {',
      '  width: 100% !important;',
      '  margin-top: 8px;',
      '  padding: 8px 12px !important;',
      '  font-size: 13px !important;',
      '  border-radius: 6px;',
      '}',


      // InfoWindow estilizada
      '.at-iw-container {',
      '  padding: 10px 14px;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '  min-width: 180px;',
      '  max-width: 260px;',
      '}',
      '.at-iw-nome {',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  color: rgb(1, 78, 132);',
      '  margin: 0 0 4px 0;',
      '  line-height: 1.3;',
      '}',
      '.at-iw-endereco {',
      '  font-size: 12px;',
      '  color: #555;',
      '  margin: 0 0 8px 0;',
      '  line-height: 1.3;',
      '}',
      '.at-iw-preco {',
      '  font-size: 15px;',
      '  font-weight: 700;',
      '  color: rgb(1, 78, 132);',
      '  margin: 0;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ===================== CARREGAMENTO DO GOOGLE MAPS API =====================
  function garantirGoogleMapsAPI(callback) {
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log(LOG_PREFIX + ' Google Maps API ja disponivel.');
      callback();
      return;
    }

    console.log(LOG_PREFIX + ' Google Maps API nao encontrada. Iniciando carregamento...');

    // Estrategia 1: Encontrar a API key nos recursos da pagina e carregar por script
    const apiKey = encontrarApiKeyNaPagina();
    if (apiKey) {
      console.log(LOG_PREFIX + ' API key encontrada nos recursos da pagina.');
      carregarAPIPorScript(apiKey, callback);
      return;
    }

    // Estrategia 2: Forcar carregamento via toggle da pagina (clica "Ver no mapa" e volta)
    console.log(LOG_PREFIX + ' API key nao encontrada. Usando toggle para forcar carregamento...');
    carregarAPIViaToggle(callback);
  }

  function encontrarApiKeyNaPagina() {
    // Procurar em scripts do Google Maps ja carregados
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    for (let i = 0; i < scripts.length; i++) {
      const matchSrc = scripts[i].src.match(/key=([^&]+)/);
      if (matchSrc) return matchSrc[1];
    }

    // Procurar em tiles/imagens do Google Maps
    const imgs = document.querySelectorAll('img[src*="maps.googleapis.com"]');
    for (let j = 0; j < imgs.length; j++) {
      const matchImg = imgs[j].src.match(/key=([^&]+)/);
      if (matchImg) return matchImg[1];
    }

    // Procurar no __NEXT_DATA__ (acesso direto ao env para evitar stringify de objeto grande)
    try {
      const nd = window.__NEXT_DATA__;
      if (nd && nd.runtimeConfig && nd.runtimeConfig.googleMapsKey) {
        return nd.runtimeConfig.googleMapsKey;
      }
      if (nd && nd.props && nd.props.pageProps && nd.props.pageProps.googleMapsKey) {
        return nd.props.pageProps.googleMapsKey;
      }
      // Fallback: stringify limitado
      var ndStr = JSON.stringify(nd || {}).slice(0, 200000);
      var matchNd = ndStr.match(/AIzaSy[\w\-]{30,40}/);
      if (matchNd) return matchNd[0];
    } catch (e) {
      // silenciar erro
    }

    // Procurar em scripts inline do bundle Next.js
    const inlineScripts = document.querySelectorAll('script:not([src])');
    for (let k = 0; k < inlineScripts.length; k++) {
      const texto = inlineScripts[k].textContent || '';
      if (texto.length > 500000) continue;
      const matchInline = texto.match(/AIzaSy[\w\-]{30,40}/);
      if (matchInline) return matchInline[0];
    }

    // Procurar em scripts com src (bundles)
    const extScripts = document.querySelectorAll('script[src]');
    for (let m = 0; m < extScripts.length; m++) {
      const srcAttr = extScripts[m].src || '';
      const matchExt = srcAttr.match(/key=([^&]+)/);
      if (matchExt && srcAttr.indexOf('google') !== -1) return matchExt[1];
    }

    return '';
  }

  function carregarAPIPorScript(apiKey, callback) {
    // Se ja existe um script do Google Maps carregando, apenas aguardar
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      let tentativasEspera = 0;
      const pollingEspera = setInterval(function () {
        tentativasEspera++;
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(pollingEspera);
          console.log(LOG_PREFIX + ' Google Maps API carregou (script existente).');
          callback();
        } else if (tentativasEspera > 40) {
          clearInterval(pollingEspera);
          console.log(LOG_PREFIX + ' Timeout aguardando script existente do Google Maps.');
          carregarAPIViaToggle(callback);
        }
      }, 500);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey;
    script.onload = function () {
      console.log(LOG_PREFIX + ' Google Maps API carregada por script injetado.');
      callback();
    };
    script.onerror = function () {
      console.log(LOG_PREFIX + ' Erro ao carregar script do Google Maps. Tentando via toggle...');
      carregarAPIViaToggle(callback);
    };
    document.head.appendChild(script);
  }

  // ===================== LOADING NATIVO COMO CAMADA =====================
  function exibirLoadingNativo() {
    // Clonar o loading nativo existente na pagina para usar como overlay
    var loadingOriginal = document.querySelector('[class*="LoadingWrapper-sc"]');
    var searchWrapper = document.querySelector('[class*="SearchListWrapper-sc"]');
    if (!searchWrapper) return null;

    var overlay = document.createElement('div');
    overlay.id = 'at-loading-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:#fff;z-index:9999;display:flex;align-items:center;justify-content:center;';

    if (loadingOriginal) {
      // Clonar o loading nativo para manter a mesma aparencia
      var clone = loadingOriginal.cloneNode(true);
      clone.style.setProperty('display', 'block', 'important');
      overlay.appendChild(clone);
    } else {
      // Fallback minimo com texto caso o loading nativo nao exista
      var msg = document.createElement('span');
      msg.textContent = 'Carregando mapa interativo...';
      msg.style.cssText = 'font-size:14px;color:#026CB6;font-family:Helvetica Neue,sans-serif;';
      overlay.appendChild(msg);
    }

    // Garantir que o wrapper tem position relativa para o overlay absoluto funcionar
    var posAtual = window.getComputedStyle(searchWrapper).position;
    if (posAtual === 'static') {
      searchWrapper.style.setProperty('position', 'relative');
    }

    searchWrapper.appendChild(overlay);
    console.log(LOG_PREFIX + ' Loading nativo exibido como camada.');
    return overlay;
  }

  function removerLoadingNativo() {
    var overlay = document.getElementById('at-loading-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      console.log(LOG_PREFIX + ' Loading nativo removido.');
    }
  }

  function carregarAPIViaToggle(callback) {
    const toggleBtn = document.querySelector('[class*="AnimatedButton-sc-1oit4q5"]');
    if (!toggleBtn) {
      console.log(LOG_PREFIX + ' Botao de toggle mapa/lista nao encontrado. Abortando.');
      return;
    }

    // Exibir loading nativo como camada visual enquanto prepara o mapa
    exibirLoadingNativo();

    // Esconder o conteudo real por baixo para evitar flickering
    const searchWrapper = document.querySelector('[class*="SearchListWrapper-sc"]');
    var conteudoFilhos = searchWrapper ? searchWrapper.querySelectorAll(':scope > *:not(#at-loading-overlay)') : [];
    for (var i = 0; i < conteudoFilhos.length; i++) {
      conteudoFilhos[i].style.setProperty('visibility', 'hidden', 'important');
    }

    // Clicar para ativar a view de mapa (isso forca o carregamento do Google Maps API)
    toggleBtn.click();

    let tentativasAPI = 0;
    const pollingAPI = setInterval(function () {
      tentativasAPI++;

      if (window.google && window.google.maps && window.google.maps.Map) {
        clearInterval(pollingAPI);
        console.log(LOG_PREFIX + ' Google Maps API carregada via toggle.');

        // Voltar para a view de lista
        setTimeout(function () {
          const voltarBtn = document.querySelector('[class*="AnimatedButton-sc-1oit4q5"]');
          if (voltarBtn) {
            voltarBtn.click();
          }

          // Aguardar a lista re-renderizar
          let tentativasLista = 0;
          const pollingLista = setInterval(function () {
            tentativasLista++;
            const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');

            if (cards.length >= 2 || tentativasLista > 30) {
              clearInterval(pollingLista);

              // Restaurar visibilidade dos filhos
              var filhos = searchWrapper ? searchWrapper.querySelectorAll(':scope > *:not(#at-loading-overlay)') : [];
              for (var f = 0; f < filhos.length; f++) {
                filhos[f].style.removeProperty('visibility');
              }

              // Remover overlay de loading nativo
              removerLoadingNativo();

              if (cards.length >= 2) {
                console.log(LOG_PREFIX + ' Lista re-renderizada apos toggle.');
              }

              callback();
            }
          }, 500);
        }, 800);
      } else if (tentativasAPI > 40) {
        clearInterval(pollingAPI);

        // Restaurar visibilidade dos filhos
        var filhosFallback = searchWrapper ? searchWrapper.querySelectorAll(':scope > *:not(#at-loading-overlay)') : [];
        for (var fb = 0; fb < filhosFallback.length; fb++) {
          filhosFallback[fb].style.removeProperty('visibility');
        }

        // Remover overlay de loading nativo
        removerLoadingNativo();

        // Tentar voltar para lista
        const voltarBtnFallback = document.querySelector('[class*="AnimatedButton-sc-1oit4q5"]');
        if (voltarBtnFallback) {
          voltarBtnFallback.click();
        }

        console.log(LOG_PREFIX + ' Timeout ao carregar Google Maps API via toggle.');
      }
    }, 500);
  }

  // ===================== PIN CUSTOMIZADO =====================
  function criarPinSVG(texto, ativo) {
    // Calcula largura baseada no comprimento do texto
    var charWidth = 7;
    var padding = 24;
    var largura = Math.max(60, texto.length * charWidth + padding);
    var altura = 36;
    var alturaRect = 28;
    var raio = 14;
    var centroX = largura / 2;
    var corFundo = ativo ? '#003A6B' : '#014E84';
    var borda = ativo ? ' stroke="#fff" stroke-width="2"' : '';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + largura + '" height="' + altura + '">' +
      '<rect x="' + (ativo ? 1 : 0) + '" y="' + (ativo ? 1 : 0) + '" width="' + (largura - (ativo ? 2 : 0)) + '" height="' + alturaRect + '" rx="' + raio + '" fill="' + corFundo + '"' + borda + '/>' +
      '<polygon points="' + (centroX - 5) + ',' + alturaRect + ' ' + (centroX + 5) + ',' + alturaRect + ' ' + centroX + ',' + altura + '" fill="' + corFundo + '"/>' +
      '<text x="' + centroX + '" y="' + 18 + '" font-family="Helvetica Neue,Arial,sans-serif" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">' + texto + '</text>' +
      '</svg>';

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(largura, altura),
      anchor: new google.maps.Point(centroX, altura)
    };
  }

  function criarConteudoInfoWindow(hotel) {
    var html = '<div class="at-iw-container">';
    html += '<p class="at-iw-nome">' + hotel.nome + '</p>';
    if (hotel.localizacao) {
      html += '<p class="at-iw-endereco">' + hotel.localizacao + '</p>';
    }
    if (hotel.preco) {
      html += '<p class="at-iw-preco">' + hotel.preco + '</p>';
    }
    html += '</div>';
    return html;
  }

  // ===================== EXTRACAO DE DADOS DOS CARDS =====================
  function extrairDadosCards() {
    const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
    const dados = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      // Nome
      const h3 = card.querySelector('[class*="HotelName-sc"]');
      const nome = h3 ? h3.textContent.trim() : 'Hotel ' + (i + 1);

      // Estrelas
      const estrelas = card.querySelectorAll('[data-testid="StarIcon"]').length;

      // Imagem (tentar varias estrategias)
      const imgEl = card.querySelector('.slick-slide.slick-active img') ||
        card.querySelector('.slick-slide img') ||
        card.querySelector('[class*="WrapperSlides"] img') ||
        card.querySelector('img[alt]:not([width="1"])');
      const imagem = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';

      // Localizacao
      const locEl = card.querySelector('[class*="NeighboorhoodDistance-sc"]');
      let locTexto = '';
      if (locEl) {
        // Extrair texto sem o botao "Ver no mapa"
        const locClone = locEl.cloneNode(true);
        const btnsLoc = locClone.querySelectorAll('button');
        for (let bl = 0; bl < btnsLoc.length; bl++) {
          btnsLoc[bl].remove();
        }
        locTexto = locClone.textContent.trim().replace(/\.$/, '').trim();
      }

      // Preco
      const moedaEl = card.querySelector('[class*="Currency-sc"]');
      const inteiroEl = card.querySelector('[class*="Integer-sc"]');
      const centavosEl = card.querySelector('[class*="Cents-sc"]');
      let preco = '';
      if (moedaEl) preco += moedaEl.textContent.trim() + ' ';
      if (inteiroEl) preco += inteiroEl.textContent.trim();
      if (centavosEl) preco += centavosEl.textContent.trim();

      // Preco curto para pin do mapa
      let precoCurto = '';
      if (moedaEl && inteiroEl) {
        precoCurto = moedaEl.textContent.trim() + ' ' + inteiroEl.textContent.trim();
      }

      // Diarias
      const diariasEl = card.querySelector('[class*="DailyText-sc"]');
      const diarias = diariasEl ? diariasEl.textContent.trim() : '';

      // Comodidades
      const comodidades = [];
      const itensCom = card.querySelectorAll('[class*="Amenitie-sc"] [class*="TextWrapper-sc"] span');
      for (let j = 0; j < itensCom.length; j++) {
        const t = itensCom[j].textContent.trim();
        if (t && t.indexOf('+ ') !== 0) comodidades.push(t);
      }

      // Tags
      const tags = [];
      const tagEls = card.querySelectorAll('[class*="InfoTagWrapper-sc"] [class*="RightSideWrapper-sc"] span');
      for (let k = 0; k < tagEls.length; k++) {
        const tagTexto = tagEls[k].textContent.trim();
        if (tagTexto) tags.push(tagTexto);
      }

      // Botao de detalhes (dentro do PriceWrapper ou FooterCard, nao o toggle geral)
      const btnDetalhes = card.querySelector('[class*="PriceWrapper"] button[data-testid="search-box-hotel-date-picker-primary-button"]') ||
        card.querySelector('[class*="FooterCard"] button[data-testid="search-box-hotel-date-picker-primary-button"]') ||
        card.querySelector('[class*="StyledButton-sc"] ') ||
        card.querySelector('button[data-testid="search-box-hotel-date-picker-primary-button"]');

      dados.push({
        index: i,
        nome: nome,
        estrelas: estrelas,
        imagem: imagem,
        localizacao: locTexto,
        preco: preco,
        precoCurto: precoCurto || preco,
        diarias: diarias,
        comodidades: comodidades,
        tags: tags,
        elemento: card,
        btnDetalhes: btnDetalhes,
        coordenada: null
      });
    }

    console.log(LOG_PREFIX + ' Dados extraidos de ' + dados.length + ' hoteis.');
    return dados;
  }

  // ===================== RESOLUCAO DE COORDENADAS =====================
  function extrairCidadeDosCards(dados) {
    for (let i = 0; i < dados.length; i++) {
      const loc = dados[i].localizacao;
      if (loc) {
        // Formato: "Bairro, Cidade." ou "Cidade."
        const partes = loc.replace(/\.$/, '').split(',');
        const cidade = partes[partes.length - 1].trim();
        if (cidade) return cidade;
      }
    }
    return '';
  }

  function tentarExtrairCoordenadasDoNextData(dados) {
    try {
      const nd = window.__NEXT_DATA__;
      if (!nd || !nd.props || !nd.props.pageProps) return false;

      const pp = nd.props.pageProps;
      // Navegar estrutura de dados para encontrar hoteis com coordenadas
      const fontes = [pp.hotels, pp.hotelList, pp.searchResults, pp.data];
      for (let f = 0; f < fontes.length; f++) {
        if (!fontes[f]) continue;
        const lista = Array.isArray(fontes[f]) ? fontes[f] : (fontes[f].items || fontes[f].hotels || []);
        if (!Array.isArray(lista) || lista.length === 0) continue;

        // Verificar se tem lat/lng
        const primeiro = lista[0];
        if (primeiro && (primeiro.latitude || primeiro.lat || (primeiro.location && primeiro.location.lat))) {
          console.log(LOG_PREFIX + ' Coordenadas encontradas em __NEXT_DATA__.');
          for (let i = 0; i < dados.length; i++) {
            if (i < lista.length) {
              const h = lista[i];
              const lat = h.latitude || h.lat || (h.location && h.location.lat) || (h.geo && h.geo.lat);
              const lng = h.longitude || h.lng || h.lon || (h.location && h.location.lng) || (h.geo && h.geo.lng);
              if (lat && lng) {
                dados[i].coordenada = { lat: parseFloat(lat), lng: parseFloat(lng) };
              }
            }
          }
          return true;
        }
      }
    } catch (e) {
      console.log(LOG_PREFIX + ' Erro ao ler __NEXT_DATA__: ' + e.message);
    }
    return false;
  }

  function tentarExtrairCoordenadasDoReactFiber(dados) {
    try {
      const listWrapper = document.querySelector('[data-testid="hotel-list-wrapper-contains-cards"]');
      if (!listWrapper) return false;

      const fiberKey = Object.keys(listWrapper).find(function (k) {
        return k.indexOf('__reactFiber') === 0 || k.indexOf('__reactInternalInstance') === 0;
      });
      if (!fiberKey) return false;

      let fiber = listWrapper[fiberKey];
      let tentativas = 0;

      // Subir na arvore fiber para encontrar dados de hoteis
      while (fiber && tentativas < 30) {
        if (fiber.memoizedProps && fiber.memoizedProps.hotels) {
          const hoteis = fiber.memoizedProps.hotels;
          if (Array.isArray(hoteis)) {
            console.log(LOG_PREFIX + ' Coordenadas encontradas via React Fiber.');
            for (let i = 0; i < dados.length && i < hoteis.length; i++) {
              const h = hoteis[i];
              const lat = h.latitude || h.lat || (h.coordinates && h.coordinates.lat);
              const lng = h.longitude || h.lng || h.lon || (h.coordinates && h.coordinates.lng);
              if (lat && lng) {
                dados[i].coordenada = { lat: parseFloat(lat), lng: parseFloat(lng) };
              }
            }
            return true;
          }
        }
        fiber = fiber.return;
        tentativas++;
      }
    } catch (e) {
      console.log(LOG_PREFIX + ' Erro ao acessar React Fiber: ' + e.message);
    }
    return false;
  }

  function geocodificarHoteis(dados, cidade, callback) {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.log(LOG_PREFIX + ' Google Maps Geocoder nao disponivel. Usando fallback.');
      distribuirCoordenadasFallback(dados, cidade, callback);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    let processados = 0;

    function geocodificarProximo(indice) {
      if (indice >= dados.length) {
        distribuirCoordenadasFallback(dados, cidade, function () {
          console.log(LOG_PREFIX + ' Geocodificacao concluida.');
          callback();
        });
        return;
      }

      // Pular se ja tem coordenada
      if (dados[indice].coordenada) {
        processados++;
        geocodificarProximo(indice + 1);
        return;
      }

      const query = dados[indice].nome + ', ' + cidade;
      geocoder.geocode({ address: query }, function (results, status) {
        processados++;
        if (status === 'OK' && results[0]) {
          dados[indice].coordenada = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
        }
        // Pequeno atraso para evitar rate limiting
        setTimeout(function () {
          geocodificarProximo(indice + 1);
        }, 150);
      });
    }

    geocodificarProximo(0);
  }

  function distribuirCoordenadasFallback(dados, cidade, callback) {
    // Encontrar centro a partir das coordenadas ja resolvidas
    let centroLat = 0;
    let centroLng = 0;
    let comCoordenadas = 0;

    for (let i = 0; i < dados.length; i++) {
      if (dados[i].coordenada) {
        centroLat += dados[i].coordenada.lat;
        centroLng += dados[i].coordenada.lng;
        comCoordenadas++;
      }
    }

    if (comCoordenadas > 0) {
      centroLat /= comCoordenadas;
      centroLng /= comCoordenadas;
    } else {
      // Fallback: tentar extrair da URL do Google Maps no DOM
      const gmLink = document.querySelector('a[href*="maps.google.com"]');
      if (gmLink) {
        const matchGm = gmLink.href.match(/ll=([-\d.]+),([-\d.]+)/);
        if (matchGm) {
          centroLat = parseFloat(matchGm[1]);
          centroLng = parseFloat(matchGm[2]);
        }
      }

      // Fallback: tentar extrair da URL da pagina (parametros de busca)
      if (centroLat === 0 && centroLng === 0) {
        const urlParams = window.location.search || '';
        const matchLat = urlParams.match(/lat(?:itude)?=([-\d.]+)/);
        const matchLng = urlParams.match(/(?:lng|lon|longitude)=([-\d.]+)/);
        if (matchLat && matchLng) {
          centroLat = parseFloat(matchLat[1]);
          centroLng = parseFloat(matchLng[1]);
        }
      }

      // Fallback: geocodificar o nome da cidade se Google Maps API estiver disponivel
      if (centroLat === 0 && centroLng === 0 && cidade && window.google && window.google.maps) {
        const geocoderFallback = new google.maps.Geocoder();
        geocoderFallback.geocode({ address: cidade }, function (results, status) {
          if (status === 'OK' && results[0]) {
            const centroGeo = results[0].geometry.location;
            for (let idx = 0; idx < dados.length; idx++) {
              if (!dados[idx].coordenada) {
                const ang = (idx * 2 * Math.PI) / dados.length;
                const r = 0.008 + (Math.random() * 0.004);
                dados[idx].coordenada = {
                  lat: centroGeo.lat() + r * Math.sin(ang),
                  lng: centroGeo.lng() + r * Math.cos(ang)
                };
              }
            }
          }
          if (callback) callback();
        });
        return;
      }

      // Se ainda nao tem, usar um centro generico
      if (centroLat === 0 && centroLng === 0) {
        centroLat = -23.5505;
        centroLng = -46.6333;
      }
    }

    // Distribuir hoteis sem coordenada ao redor do centro
    for (let i = 0; i < dados.length; i++) {
      if (!dados[i].coordenada) {
        const angulo = (i * 2 * Math.PI) / dados.length;
        const raio = 0.008 + (Math.random() * 0.004);
        dados[i].coordenada = {
          lat: centroLat + raio * Math.sin(angulo),
          lng: centroLng + raio * Math.cos(angulo)
        };
      }
    }

    if (callback) callback();
  }

  function resolverCoordenadas(dados, callback) {
    // Estrategia 1: __NEXT_DATA__
    if (tentarExtrairCoordenadasDoNextData(dados)) {
      distribuirCoordenadasFallback(dados, '', function () { callback(); });
      return;
    }

    // Estrategia 2: React Fiber
    if (tentarExtrairCoordenadasDoReactFiber(dados)) {
      distribuirCoordenadasFallback(dados, '', function () { callback(); });
      return;
    }

    // Estrategia 3: Geocoder do Google Maps
    const cidade = extrairCidadeDosCards(dados);
    console.log(LOG_PREFIX + ' Geocodificando hoteis na cidade: ' + cidade);
    geocodificarHoteis(dados, cidade, callback);
  }

  // ===================== MAPA =====================
  function criarMapa(dados) {
    const mapDiv = document.getElementById(MAP_ID);
    if (!mapDiv || !window.google || !window.google.maps) {
      console.log(LOG_PREFIX + ' Erro: container do mapa ou Google Maps API nao disponivel.');
      return;
    }

    // Calcular centro e bounds
    const bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < dados.length; i++) {
      if (dados[i].coordenada) {
        bounds.extend(new google.maps.LatLng(dados[i].coordenada.lat, dados[i].coordenada.lng));
      }
    }

    const centro = bounds.getCenter();

    mapInstance = new google.maps.Map(mapDiv, {
      center: centro,
      zoom: 13,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Ajustar bounds
    if (dados.length > 1) {
      mapInstance.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
    }

    // Adicionar marcadores
    marcadores = [];
    for (let i = 0; i < dados.length; i++) {
      adicionarMarcador(dados[i], i);
    }

    console.log(LOG_PREFIX + ' Mapa criado com ' + marcadores.length + ' marcadores.');
  }

  function adicionarMarcador(hotel, indice) {
    if (!hotel.coordenada || !mapInstance) return;

    var textoPin = hotel.precoCurto || hotel.preco || hotel.nome;
    var icone = criarPinSVG(textoPin, false);

    const marker = new google.maps.Marker({
      position: hotel.coordenada,
      map: mapInstance,
      title: hotel.nome,
      icon: icone,
      zIndex: 1
    });

    marker.addListener('click', function () {
      abrirInfoWindow(marker, criarConteudoInfoWindow(hotel), indice);
      destacarCard(indice);
      rolarParaCard(indice);
      analyticsEvent(hotel.nome, 'mapa_pin_clique');
    });

    marker.addListener('mouseover', function () {
      destacarCard(indice);
    });

    marker.addListener('mouseout', function () {
      if (cardAtivoIdx !== indice) {
        resetarCard(indice);
      }
    });

    marcadores.push(marker);
  }

  function abrirInfoWindow(marker, conteudo, indice) {
    if (infoWindowAtiva) {
      infoWindowAtiva.close();
    }

    infoWindowAtiva = new google.maps.InfoWindow({
      content: conteudo
    });

    infoWindowAtiva.open(mapInstance, marker);
  }

  function destacarMarcador(indice) {
    for (var i = 0; i < marcadores.length; i++) {
      if (!marcadores[i] || !dadosCache[i]) continue;
      var textoPin = dadosCache[i].precoCurto || dadosCache[i].preco || dadosCache[i].nome;
      var ativo = (i === indice);
      marcadores[i].setIcon(criarPinSVG(textoPin, ativo));
      marcadores[i].setZIndex(ativo ? 999 : 1);
    }
  }

  // ===================== LAYOUT =====================
  function inserirMapaNoLayout(dados) {
    const listWrapper = document.querySelector('[class*="ListWrapper-sc-1oit4q5"]');
    if (!listWrapper || listWrapper.getAttribute(DATA_APLICADO)) return false;

    const cardList = listWrapper.querySelector('[data-testid="hotel-list-wrapper-contains-cards"]');
    if (!cardList) return false;

    // Criar container do mapa
    const mapDiv = document.createElement('div');
    mapDiv.id = MAP_ID;

    // Inserir mapa antes da lista de cards
    listWrapper.insertBefore(mapDiv, cardList);

    // Marcar como aplicado
    listWrapper.setAttribute(DATA_APLICADO, 'true');

    console.log(LOG_PREFIX + ' Layout integrado inserido.');
    return true;
  }

  // ===================== INTERACAO CARDS =====================
  function configurarInteracaoCards(dados) {
    for (let i = 0; i < dados.length; i++) {
      const card = dados[i].elemento;
      if (!card || card.getAttribute(DATA_HOVER)) continue;

      card.setAttribute(DATA_HOVER, 'true');
      const indice = i;

      card.addEventListener('mouseenter', function () {
        cardAtivoIdx = indice;
        destacarMarcador(indice);
        if (mapInstance && marcadores[indice]) {
          mapInstance.panTo(marcadores[indice].getPosition());
        }
      });

      card.addEventListener('mouseleave', function () {
        cardAtivoIdx = -1;
        destacarMarcador(-1);
      });

      card.addEventListener('click', function () {
        cardAtivoIdx = indice;
        destacarMarcador(indice);
        if (mapInstance && marcadores[indice]) {
          abrirInfoWindow(
            marcadores[indice],
            criarConteudoInfoWindow(dados[indice]),
            indice
          );
        }
        analyticsEvent(dados[indice].nome, 'lista_card_clique');
      });
    }
  }

  // ===================== INJECAO DE IMAGENS NOS CARDS =====================
  function injetarImagensCards(dados) {
    for (let i = 0; i < dados.length; i++) {
      const card = dados[i].elemento;
      if (!card || card.getAttribute('data-at-img-added')) continue;

      let imgUrl = dados[i].imagem;
      if (!imgUrl) {
        // Fallback: buscar qualquer imagem de hotel no card
        const anyImg = card.querySelector('.slick-slide img') ||
          card.querySelector('[class*="WrapperSlides"] img') ||
          card.querySelector('img[alt]:not([width="1"])');
        if (anyImg) imgUrl = anyImg.getAttribute('src') || anyImg.getAttribute('data-src') || '';
      }
      if (!imgUrl) continue;

      const container = card.querySelector('[class*="CardContainer-sc"]') || card;
      const thumb = document.createElement('img');
      thumb.className = 'at-card-thumb';
      thumb.src = imgUrl;
      thumb.alt = dados[i].nome;
      container.insertBefore(thumb, container.firstChild);
      card.setAttribute('data-at-img-added', 'true');
    }
  }

  function destacarCard(indice) {
    const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
    for (let i = 0; i < cards.length; i++) {
      if (i === indice) {
        cards[i].classList.add('at-card-ativo');
      } else {
        cards[i].classList.remove('at-card-ativo');
      }
    }
  }

  function resetarCard(indice) {
    const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
    if (cards[indice]) {
      cards[indice].classList.remove('at-card-ativo');
    }
  }

  function rolarParaCard(indice) {
    const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
    if (cards[indice]) {
      cards[indice].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ===================== TRACKING (Adobe Analytics - Azul) =====================
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;

    const labelEvent = 'AT_MapaListaIntegrada_' + eventType + ' ' + eventLabel;
    console.log(LOG_PREFIX + ' Evento de analytics: ' + labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_hotel_selecao_mapa_lista';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // ===================== OBSERVER =====================
  function monitorarMudancas() {
    const listWrapper = document.querySelector('[class*="ListWrapper-sc-1oit4q5"]');
    if (!listWrapper) return;

    if (observerRef) {
      observerRef.disconnect();
    }

    observerRef = new MutationObserver(function () {
      if (isProcessing) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        isProcessing = true;

        // Verificar se os cards mudaram (re-render do React)
        const mapDiv = document.getElementById(MAP_ID);
        if (!mapDiv) {
          // Layout foi removido pelo React, reaplicar
          console.log(LOG_PREFIX + ' Layout removido, reaplicando...');
          aplicar();
        } else {
          // Verificar novos cards sem hover listener
          const dados = extrairDadosCards();
          dadosCache = dados;
          configurarInteracaoCards(dados);
        }

        isProcessing = false;
      }, 500);
    });

    observerRef.observe(listWrapper, { childList: true, subtree: true });
  }

  // Observer global para detectar re-criacao do ListWrapper (paginacao SPA)
  function monitorarPaginacao() {
    if (observerGlobalRef) return;

    // Observar container pai ou body para detectar recriacao
    const alvo = document.querySelector('[class*="SearchListWrapper-sc"]') || document.body;

    observerGlobalRef = new MutationObserver(function () {
      if (aguardandoPaginacao) return;

      // Verificar se loading apareceu (paginacao em andamento)
      var loading = document.querySelector('[class*="LoadingContent-sc"]');
      if (loading) {
        aguardandoPaginacao = true;
        console.log(LOG_PREFIX + ' Paginacao detectada (loading visivel). Aguardando novos cards...');
        aguardarFimDoPaginacao();
        return;
      }

      // Verificar se ListWrapper perdeu o atributo (React recriou)
      var listWrapper = document.querySelector('[class*="ListWrapper-sc-1oit4q5"]');
      if (listWrapper && !listWrapper.getAttribute(DATA_APLICADO)) {
        var cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
        if (cards.length >= 2) {
          console.log(LOG_PREFIX + ' ListWrapper recriada sem mapa. Reaplicando...');
          limparMapaAntigo();
          aplicar();
        }
      }
    });

    observerGlobalRef.observe(alvo, { childList: true, subtree: true });
  }

  function aguardarFimDoPaginacao() {
    var tentativas = 0;
    var pollingPag = setInterval(function () {
      tentativas++;

      // Verificar se o loading sumiu e os cards apareceram
      var loading = document.querySelector('[class*="LoadingContent-sc"]');
      var cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');

      if (!loading && cards.length >= 2) {
        clearInterval(pollingPag);
        aguardandoPaginacao = false;
        console.log(LOG_PREFIX + ' Paginacao concluida. Reaplicando mapa com ' + cards.length + ' cards.');
        limparMapaAntigo();
        aplicar();
      } else if (tentativas > 40) {
        clearInterval(pollingPag);
        aguardandoPaginacao = false;
        console.log(LOG_PREFIX + ' Timeout aguardando paginacao.');
      }
    }, 500);
  }

  function limparMapaAntigo() {
    // Remover marcadores antigos
    for (var i = 0; i < marcadores.length; i++) {
      if (marcadores[i]) {
        marcadores[i].setMap(null);
      }
    }
    marcadores = [];

    // Fechar InfoWindow
    if (infoWindowAtiva) {
      infoWindowAtiva.close();
      infoWindowAtiva = null;
    }

    // Destruir instancia do mapa
    mapInstance = null;
    cardAtivoIdx = -1;

    // Remover container do mapa do DOM
    var mapDiv = document.getElementById(MAP_ID);
    if (mapDiv && mapDiv.parentNode) {
      mapDiv.parentNode.removeChild(mapDiv);
    }

    // Desconectar observer antigo do ListWrapper
    if (observerRef) {
      observerRef.disconnect();
      observerRef = null;
    }
  }

  // ===================== APLICACAO PRINCIPAL =====================
  function aplicar() {
    const dados = extrairDadosCards();
    if (dados.length === 0) {
      console.log(LOG_PREFIX + ' Nenhum card de hotel encontrado.');
      return false;
    }

    // Atualizar cache para uso em destacarMarcador e outros
    dadosCache = dados;

    // Inserir mapa no layout
    const layoutOk = inserirMapaNoLayout(dados);
    if (!layoutOk && !document.getElementById(MAP_ID)) {
      return false;
    }

    // Configurar interacao dos cards
    configurarInteracaoCards(dados);

    // Resolver coordenadas e criar mapa
    resolverCoordenadas(dados, function () {
      criarMapa(dados);
      // Re-configurar interacao apos mapa criado (marcadores agora existem)
      configurarInteracaoCards(dados);
    });

    // Tracking de visualizacao
    analyticsEvent('visualizacao', 'mapa_lista_exibido');

    // Monitorar mudancas
    monitorarMudancas();

    // Esconder o FilterRow pai do botao de toggle para liberar espaco vertical
    const botoesToggle = document.querySelectorAll('[class*="AnimatedButton-sc-1oit4q5"]');
    for (let bt = 0; bt < botoesToggle.length; bt++) {
      const filterRowPai = botoesToggle[bt].closest('[class*="FilterRow-sc"]');
      if (filterRowPai) {
        filterRowPai.style.setProperty('display', 'none', 'important');
      } else {
        botoesToggle[bt].style.setProperty('display', 'none', 'important');
      }
    }

    return true;
  }

  // ===================== INIT =====================
  function init() {
    injetarEstilos();

    // Iniciar observer global de paginacao desde o inicio
    monitorarPaginacao();

    let tentativas = 0;
    const polling = setInterval(function () {
      tentativas++;

      if (tentativas > MAX_TENTATIVAS) {
        clearInterval(polling);
        console.log(LOG_PREFIX + ' Cards de hotel nao encontrados apos ' + MAX_TENTATIVAS + ' tentativas.');
        return;
      }

      // Verificar se ainda esta em loading
      var loading = document.querySelector('[class*="LoadingContent-sc"]');
      if (loading) return;

      // Verificar se a lista de hoteis esta renderizada
      const cardList = document.querySelector('[data-testid="hotel-list-wrapper-contains-cards"]');
      const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');

      if (cardList && cards.length >= 2) {
        clearInterval(polling);
        console.log(LOG_PREFIX + ' Cards encontrados (' + cards.length + '). Garantindo Google Maps API...');

        // Garantir que a API do Google Maps esteja carregada
        if (mapsAPICarregada) {
          // API ja foi carregada antes (ex: segunda pagina)
          setTimeout(function () {
            let sucesso = aplicar();
            if (sucesso) {
              console.log(LOG_PREFIX + ' Inicializado com sucesso (API ja disponivel).');
            }
          }, 300);
          return;
        }

        garantirGoogleMapsAPI(function () {
          mapsAPICarregada = true;

          // Aguardar React estabilizar apos possiveis re-renders
          setTimeout(function () {
            // Re-verificar se os cards ainda existem
            const reCards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
            if (reCards.length < 2) {
              console.log(LOG_PREFIX + ' Cards sumiram durante carregamento da API. Aguardando re-render...');
              let tentativasReRender = 0;
              const pollingReRender = setInterval(function () {
                tentativasReRender++;
                const novosCards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
                if (novosCards.length >= 2) {
                  clearInterval(pollingReRender);
                  let sucesso = aplicar();
                  if (sucesso) {
                    console.log(LOG_PREFIX + ' Inicializado com sucesso (apos re-render).');
                  }
                } else if (tentativasReRender > 20) {
                  clearInterval(pollingReRender);
                  console.log(LOG_PREFIX + ' Cards nao reapareceram.');
                }
              }, 500);
              return;
            }

            let sucesso = aplicar();
            if (sucesso) {
              console.log(LOG_PREFIX + ' Inicializado com sucesso.');
            }
          }, 500);
        });
      }
    }, INTERVALO_POLLING);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
