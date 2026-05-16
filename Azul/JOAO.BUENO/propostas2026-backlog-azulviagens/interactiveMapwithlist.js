(function () {
  'use strict';

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
      '    top: 120px;',
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

      // InfoWindow customizada
      '.at-iw-container { max-width: 260px; font-family: inherit; }',
      '.at-iw-img { width: 100%; height: 100px; object-fit: cover; border-radius: 6px 6px 0 0; }',
      '.at-iw-body { padding: 10px; }',
      '.at-iw-title { font-size: 13px; font-weight: 700; color: #041E42; margin: 0 0 4px; }',
      '.at-iw-loc { font-size: 11px; color: #666; margin: 0 0 6px; }',
      '.at-iw-price { font-size: 16px; font-weight: 700; color: #026CB6; margin: 0 0 6px; }',
      '.at-iw-stars { display: flex; gap: 1px; margin-bottom: 6px; }',
      '.at-iw-stars svg { width: 12px; height: 12px; fill: #F5A623; }',
      '.at-iw-btn {',
      '  display: block; width: 100%; padding: 8px;',
      '  background: #026CB6; color: #fff; border: none;',
      '  border-radius: 6px; font-size: 12px; font-weight: 600;',
      '  cursor: pointer; text-align: center;',
      '}',
      '.at-iw-btn:hover { background: #01588f; }',

      // Thumbnail de imagem no card
      '.at-card-thumb {',
      '  width: 100%; height: 160px; object-fit: cover;',
      '  display: block; border-radius: 10px 10px 0 0;',
      '}',
      '[class*="HotelCardWrapper-sc-16a2dz4"] [class*="CardContainer-sc"] {',
      '  display: flex !important; flex-direction: column !important;',
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

    // Procurar no __NEXT_DATA__
    try {
      const ndStr = JSON.stringify(window.__NEXT_DATA__ || {});
      const matchNd = ndStr.match(/AIzaSy[\w\-]{30,40}/);
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

  function carregarAPIViaToggle(callback) {
    const toggleBtn = document.querySelector('[class*="AnimatedButton-sc-1oit4q5"]');
    if (!toggleBtn) {
      console.log(LOG_PREFIX + ' Botao de toggle mapa/lista nao encontrado. Abortando.');
      return;
    }

    // Esconder a area de conteudo temporariamente para evitar flickering visual
    const searchWrapper = document.querySelector('[class*="SearchListWrapper-sc"]');
    if (searchWrapper) {
      searchWrapper.style.setProperty('opacity', '0', 'important');
      searchWrapper.style.setProperty('pointer-events', 'none', 'important');
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

              // Restaurar visibilidade
              if (searchWrapper) {
                searchWrapper.style.removeProperty('opacity');
                searchWrapper.style.removeProperty('pointer-events');
              }

              if (cards.length >= 2) {
                console.log(LOG_PREFIX + ' Lista re-renderizada apos toggle.');
              }

              callback();
            }
          }, 500);
        }, 800);
      } else if (tentativasAPI > 40) {
        clearInterval(pollingAPI);

        // Restaurar visibilidade
        if (searchWrapper) {
          searchWrapper.style.removeProperty('opacity');
          searchWrapper.style.removeProperty('pointer-events');
        }

        // Tentar voltar para lista
        const voltarBtnFallback = document.querySelector('[class*="AnimatedButton-sc-1oit4q5"]');
        if (voltarBtnFallback) {
          voltarBtnFallback.click();
        }

        console.log(LOG_PREFIX + ' Timeout ao carregar Google Maps API via toggle.');
      }
    }, 500);
  }

  // ===================== ICONE SVG PARA MARCADORES DO MAPA =====================
  function criarIconePin(textoPreco, ativo) {
    const largura = Math.max(80, textoPreco.length * 8 + 24);
    const bg = ativo ? '#026CB6' : '#ffffff';
    const cor = ativo ? '#ffffff' : '#026CB6';
    const borda = '#026CB6';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + largura + '" height="42">' +
      '<rect x="1" y="1" width="' + (largura - 2) + '" height="32" rx="16" ' +
      'fill="' + bg + '" stroke="' + borda + '" stroke-width="2"/>' +
      '<text x="' + (largura / 2) + '" y="22" font-family="Arial,sans-serif" ' +
      'font-size="12" font-weight="bold" fill="' + cor + '" text-anchor="middle">' +
      textoPreco + '</text>' +
      '<polygon points="' + (largura / 2 - 6) + ',33 ' + (largura / 2) + ',41 ' +
      (largura / 2 + 6) + ',33" fill="' + borda + '"/>' +
      '</svg>';
    return {
      url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(largura, 42),
      anchor: new google.maps.Point(largura / 2, 41)
    };
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
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] }
      ]
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

    const marker = new google.maps.Marker({
      position: hotel.coordenada,
      map: mapInstance,
      icon: criarIconePin(hotel.precoCurto || 'Hotel', false),
      title: hotel.nome,
      zIndex: 1,
      optimized: false
    });

    // InfoWindow com detalhes do hotel
    const iwConteudo = criarConteudoInfoWindow(hotel);

    marker.addListener('click', function () {
      abrirInfoWindow(marker, iwConteudo, indice);
      destacarCard(indice);
      rolarParaCard(indice);
      analyticsEvent(hotel.nome, 'mapa_pin_clique');
    });

    marker.addListener('mouseover', function () {
      marker.setIcon(criarIconePin(hotel.precoCurto || 'Hotel', true));
      marker.setZIndex(100);
      destacarCard(indice);
    });

    marker.addListener('mouseout', function () {
      if (cardAtivoIdx !== indice) {
        marker.setIcon(criarIconePin(hotel.precoCurto || 'Hotel', false));
        marker.setZIndex(1);
        resetarCard(indice);
      }
    });

    marcadores.push(marker);
  }

  function criarConteudoInfoWindow(hotel) {
    let html = '<div class="at-iw-container">';
    if (hotel.imagem) {
      html += '<img class="at-iw-img" src="' + hotel.imagem + '" alt="' + hotel.nome + '"/>';
    }
    html += '<div class="at-iw-body">';
    html += '<p class="at-iw-title">' + hotel.nome + '</p>';

    // Estrelas
    if (hotel.estrelas > 0) {
      html += '<div class="at-iw-stars">';
      for (let s = 0; s < hotel.estrelas; s++) {
        html += '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
      }
      html += '</div>';
    }

    if (hotel.localizacao) {
      html += '<p class="at-iw-loc">' + hotel.localizacao + '</p>';
    }
    if (hotel.preco) {
      html += '<p class="at-iw-price">' + hotel.preco + '</p>';
    }
    html += '<button class="at-iw-btn" data-at-iw-index="' + hotel.index + '">Ver detalhes do hotel</button>';
    html += '</div></div>';
    return html;
  }

  function abrirInfoWindow(marker, conteudo, indice) {
    if (infoWindowAtiva) {
      infoWindowAtiva.close();
    }

    infoWindowAtiva = new google.maps.InfoWindow({
      content: conteudo,
      maxWidth: 280
    });

    infoWindowAtiva.open(mapInstance, marker);

    // Listener para o botao dentro da InfoWindow
    google.maps.event.addListenerOnce(infoWindowAtiva, 'domready', function () {
      const btn = document.querySelector('[data-at-iw-index="' + indice + '"]');
      if (btn) {
        btn.addEventListener('click', function () {
          const dados = extrairDadosCards();
          if (dados[indice] && dados[indice].btnDetalhes) {
            dados[indice].btnDetalhes.click();
            analyticsEvent(dados[indice].nome, 'mapa_ver_detalhes');
          }
        });
      }
    });
  }

  function destacarMarcador(indice) {
    if (!marcadores[indice]) return;
    // Resetar todos
    for (let i = 0; i < marcadores.length; i++) {
      const dados = extrairDadosCards();
      const precoCurto = (dados[i] && dados[i].precoCurto) ? dados[i].precoCurto : 'Hotel';
      marcadores[i].setIcon(criarIconePin(precoCurto, i === indice));
      marcadores[i].setZIndex(i === indice ? 100 : 1);
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
          // Verificar novos cards sem hover listener e sem imagem
          const dados = extrairDadosCards();
          configurarInteracaoCards(dados);
          injetarImagensCards(dados);
        }

        isProcessing = false;
      }, 500);
    });

    observerRef.observe(listWrapper, { childList: true, subtree: true });
  }

  // ===================== APLICACAO PRINCIPAL =====================
  function aplicar() {
    const dados = extrairDadosCards();
    if (dados.length === 0) {
      console.log(LOG_PREFIX + ' Nenhum card de hotel encontrado.');
      return false;
    }

    // Inserir mapa no layout
    const layoutOk = inserirMapaNoLayout(dados);
    if (!layoutOk && !document.getElementById(MAP_ID)) {
      return false;
    }

    // Configurar interacao dos cards e injetar imagens
    configurarInteracaoCards(dados);
    injetarImagensCards(dados);

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

    let tentativas = 0;
    const polling = setInterval(function () {
      tentativas++;

      if (tentativas > MAX_TENTATIVAS) {
        clearInterval(polling);
        console.log(LOG_PREFIX + ' Cards de hotel nao encontrados apos ' + MAX_TENTATIVAS + ' tentativas.');
        return;
      }

      // Verificar se a lista de hoteis esta renderizada
      const cardList = document.querySelector('[data-testid="hotel-list-wrapper-contains-cards"]');
      const cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');

      if (cardList && cards.length >= 2) {
        clearInterval(polling);
        console.log(LOG_PREFIX + ' Cards encontrados (' + cards.length + '). Garantindo Google Maps API...');

        // Garantir que a API do Google Maps esteja carregada
        garantirGoogleMapsAPI(function () {
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
