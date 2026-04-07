// MODAL COPA DO MUNDO 2026 - HOME (AZUL LINHAS AEREAS)
(function () {
  'use strict';

  // === CONSTANTES ===
  var MODAL_ID = 'copa-modal';
  var BUTTON_ID = 'copa-floating-btn';
  var WRAPPER_ID = 'copa-modal-wrapper';
  var STYLE_ID = 'copa-modal-styles';
  var BACKDROP_ID = 'copa-modal-backdrop';

  var STORAGE_KEYS = {
    INTERACTED: 'copa_modal_interacted_date',
    SESSION_SHOWN: 'copa_modal_session_shown'
  };

  var CTA_LINK = 'https://www.voeazul.com.br/copa-do-mundo-2026';

  // === ANALYTICS ===
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = 'AT_CopaDoMundo2026_' + eventType + ' ' + eventLabel;
    console.log('[Copa2026] Analytics:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_CopaDoMundo2026';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // === UTILITARIOS (storage / cookie / tier) ===
  function getStorage(key) {
    try {
      var item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  function hasInteractedToday() {
    return getStorage(STORAGE_KEYS.INTERACTED) === getTodayDateString();
  }

  function markInteraction() {
    setStorage(STORAGE_KEYS.INTERACTED, getTodayDateString());
  }

  function wasShownThisSession() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.SESSION_SHOWN) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markShownThisSession() {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_SHOWN, 'true');
    } catch (e) {}
  }

  function readTudoAzulCookie() {
    try {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf('TudoAzul=') === 0) {
          var encodedValue = cookie.substring('TudoAzul='.length);
          return JSON.parse(decodeURIComponent(encodedValue));
        }
      }
    } catch (error) {
      console.log('[Copa2026] Erro ao ler cookie:', error);
    }
    return null;
  }

  function normalizeText(value) {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function resolveTierProfile(cookieData) {
    var levelCode = (cookieData && cookieData.program && cookieData.program.levelCode) || '';
    var levelName = (cookieData && cookieData.program && cookieData.program.name) || '';
    var normalized = (String(levelCode) + ' ' + String(levelName)).toUpperCase();
    var normalizedNoAccent = normalizeText(levelCode + ' ' + levelName);

    var tier = 'azul';
    if (normalized.indexOf('UNQ') !== -1 || normalizedNoAccent.indexOf('unique') !== -1) {
      tier = 'unique';
    } else if (normalized.indexOf('DIA') !== -1 || normalizedNoAccent.indexOf('diamante') !== -1) {
      tier = 'diamante';
    } else if (
      normalized.indexOf('SAF') !== -1 ||
      normalizedNoAccent.indexOf('safira') !== -1 ||
      normalized.indexOf('TA+') !== -1 ||
      normalizedNoAccent.indexOf('topazio') !== -1
    ) {
      tier = 'topazio_safira';
    }

    var esimVolume = '250MB';
    if (tier === 'diamante') esimVolume = '1GB';
    if (tier === 'unique') esimVolume = '2GB';

    return { tier: tier, esimVolume: esimVolume, isUnique: tier === 'unique' };
  }

  function getFirstName(cookieData) {
    if (!cookieData) return 'Cliente Azul';
    if (cookieData.name && typeof cookieData.name === 'object' && cookieData.name.first)
      return cookieData.name.first;
    if (cookieData.name && typeof cookieData.name === 'string')
      return cookieData.name.split(' ')[0];
    if (cookieData.Name) return String(cookieData.Name).split(' ')[0];
    return 'Cliente Azul';
  }

  // === SVG ASSETS ===

  // Icone do floating button (jato comercial Azul - perfil lateral)
  function floatingIconSVG() {
    return '' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 40 36" fill="none" aria-hidden="true">' +
      // Fuselagem principal
      '<path d="M2,18 C2,15.5 4,14.5 6,14.5 L30,14.5 Q34,14.5 37,18 Q34,21.5 30,21.5 L6,21.5 C4,21.5 2,20.5 2,18Z" fill="#003FA2"/>' +
      // Nariz afilado
      '<path d="M31,15.2 L39.5,18 L31,20.8Z" fill="#003FA2"/>' +
      // Asa principal com sweep-back (superior)
      '<path d="M15,14.5 L24,3 L28,4.8 L20,14.5Z" fill="#003FA2"/>' +
      // Asa principal com sweep-back (inferior)
      '<path d="M15,21.5 L24,33 L28,31.2 L20,21.5Z" fill="#003FA2"/>' +
      // Nacelle motor 1
      '<ellipse cx="21.5" cy="23.8" rx="3.2" ry="1.4" fill="#00298A"/>' +
      '<line x1="18.5" y1="21.5" x2="18.5" y2="23.8" stroke="#00298A" stroke-width="1"/>' +
      // Cauda vertical (deriva)
      '<path d="M4.5,14.5 L3,7" stroke="#003FA2" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M4.5,14.5 L3,7 L8,9 L7.5,14.5Z" fill="#003FA2"/>' +
      // Estabilizador horizontal esquerdo
      '<path d="M5.5,14.5 L0.5,10 L3,9.2 L7.5,13.5Z" fill="#003FA2"/>' +
      // Estabilizador horizontal direito
      '<path d="M5.5,21.5 L0.5,26 L3,26.8 L7.5,22.5Z" fill="#003FA2"/>' +
      // Faixa de janelas
      '<path d="M9,17 Q18,16.5 28,16.8" stroke="rgba(255,255,255,0.45)" stroke-width="1" stroke-linecap="round" stroke-dasharray="2.5,2"/>' +
      '</svg>';
  }

  // Globo terrestre com contornos geograficamente fieis do Brasil e EUA
  // Projecao ortografica centrada em lon0=-60deg, lat0=0deg
  // x = 160 + 110*cos(lat)*sin(lon+60deg); y = 140 - 110*sin(lat)
  function createGlobeSVG() {
    return '' +
      '<svg class="copa-globe" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280" fill="none" aria-hidden="true">' +
      '<defs>' +
      '  <radialGradient id="copa-globe-glow" cx="50%" cy="50%" r="50%">' +
      '    <stop offset="0%" stop-color="#003FA2" stop-opacity=".25"/>' +
      '    <stop offset="100%" stop-color="#030734" stop-opacity="0"/>' +
      '  </radialGradient>' +
      '  <radialGradient id="copa-ocean" cx="50%" cy="50%" r="50%">' +
      '    <stop offset="0%" stop-color="#0A2E6E"/>' +
      '    <stop offset="100%" stop-color="#041E42"/>' +
      '  </radialGradient>' +
      '  <clipPath id="copa-globe-clip">' +
      '    <circle cx="160" cy="140" r="109"/>' +
      '  </clipPath>' +
      '</defs>' +
      '<circle cx="160" cy="140" r="130" fill="url(#copa-globe-glow)"/>' +
      '<circle cx="160" cy="140" r="110" fill="url(#copa-ocean)" stroke="#1a4a8a" stroke-width="1.5"/>' +
      // Linhas de latitude/longitude
      '<g clip-path="url(#copa-globe-clip)">' +
      '<ellipse cx="160" cy="140" rx="110" ry="40" fill="none" stroke="#1a4a8a" stroke-width=".4" opacity=".5"/>' +
      '<ellipse cx="160" cy="140" rx="110" ry="68" fill="none" stroke="#1a4a8a" stroke-width=".3" opacity=".3"/>' +
      '<ellipse cx="160" cy="140" rx="80" ry="110" fill="none" stroke="#1a4a8a" stroke-width=".4" opacity=".4"/>' +
      '<ellipse cx="160" cy="140" rx="40" ry="110" fill="none" stroke="#1a4a8a" stroke-width=".3" opacity=".3"/>' +
      '<line x1="50" y1="140" x2="270" y2="140" stroke="#1a4a8a" stroke-width=".4" opacity=".4"/>' +
      // EUA continental - contorno fiel (projecao ortografica lon0=-60)
      // Pontos: Maine, costa leste, Florida, Golfo, Texas, NM/AZ, California, Oregon, Washington, fronteira Canada, volta
      '<path class="copa-country copa-usa" d="' +
      'M151,60 C149,62 147,64 146,66' +     // Maine → Cape Cod
      ' L140,68 L136,74 L137,77' +           // NY → Virginia → Hatteras
      ' L126,83 L127,88 L126,94' +           // Georgia coast → Florida east → Florida tip
      ' C123,91 121,89 117,85' +             // Florida west (curva baía Tampa)
      ' L113,87 L101,92' +                   // Alabama/MS → Texas sul
      ' L94,85 L88,82 L82,81' +             // Texas oeste → Novo Mexico → California sul
      ' C82,78 83,76 83,74' +               // California litoral
      ' L87,66 L94,58' +                    // Oregon → Washington
      ' C95,57 96,57 96,57' +              // canto noroeste
      ' L110,57 L117,57' +                 // Montana → Dakota Norte (fronteira Canada)
      ' C121,58 125,60 128,62' +           // Grandes Lagos (suave)
      ' L140,62 C143,61 147,60 151,60 Z' + // NY → Maine fecha
      '" fill="#2a7fff" fill-opacity=".65" stroke="#5ab0ff" stroke-width="1" stroke-linejoin="round"/>' +
      // Label EUA (centro aproximado do pais)
      '<text x="112" y="75" fill="#7dc3ff" font-size="9.5" font-weight="700" text-anchor="middle" font-family="sans-serif" opacity=".9">EUA</text>' +
      // Ponto destino Miami (25.8N, 80.2W → x≈126, y≈92)
      '<circle class="copa-dest-dot" cx="126" cy="92" r="4" fill="#FFD700"/>' +
      '<circle class="copa-dest-dot-pulse" cx="126" cy="92" r="4" fill="none" stroke="#FFD700" stroke-width="1.5"/>' +
      // Brasil - contorno fiel (projecao ortografica lon0=-60)
      // Sentido horario: NE (Ceara) → costa leste → sul → fronteira oeste → norte → fecha
      '<path class="copa-country copa-brazil" d="' +
      'M201,148 C204,152 206,155 207,158' +   // Ceara → Recife (ponta leste)
      ' L199,165' +                            // Salvador (BA)
      ' C195,171 192,177 189,183' +           // litoral ES/RJ (suave)
      ' L183,184' +                           // Sao Paulo/Parana
      ' C180,188 177,191 175,193' +           // Santa Catarina
      ' L170,201' +                           // Rio Grande do Sul / Chui (ponta sul)
      ' C167,198 166,196 165,195' +           // fronteira Uruguai
      ' L164,182' +                           // fronteira Argentina
      ' C162,177 161,173 161,170' +           // Bolivia sul
      ' L160,160' +                           // Bolivia norte
      ' C155,157 151,154 148,152' +           // Peru
      ' L142,145' +                           // Colombia/Peru noroeste
      ' C142,142 142,140 142,138' +           // fronteira Colombia
      ' C147,134 152,131 156,130' +           // Venezuela sul
      ' L161,130' +                           // Roraima norte
      ' C166,131 171,131 176,132' +           // Amapa/Guiana fronteira
      ' C178,136 180,139 181,142' +           // Foz do Amazonas
      ' C185,143 188,144 190,144' +           // Maranhao
      ' C194,145 197,147 201,148 Z' +         // Piaui → Ceara fecha
      '" fill="#009c3b" fill-opacity=".65" stroke="#00e65c" stroke-width="1" stroke-linejoin="round"/>' +
      // Label Brasil (centro geografico aprox)
      '<text x="174" y="165" fill="#00e65c" font-size="9" font-weight="700" text-anchor="middle" font-family="sans-serif" opacity=".9">BRASIL</text>' +
      // Ponto origem Sao Paulo (23.5S, 46.6W → x≈183, y≈184)
      '<circle class="copa-origin-dot" cx="183" cy="184" r="4" fill="#00e65c"/>' +
      // Rota de voo: Sao Paulo → Miami (curva sobre o Caribe)
      '<path class="copa-flight-path" d="M183,184 C175,142 155,112 126,92" ' +
      'fill="none" stroke="#FFD700" stroke-width="2" stroke-dasharray="6,4" stroke-linecap="round" opacity=".85"/>' +
      '</g>' +
      // Aviao que segue a rota (forma de aviao visto de cima)
      '<g class="copa-airplane-group">' +
      '  <path class="copa-airplane" d="' +
      'M0,-6 L4.5,-1 L2,4.5 L0,3.5 L-2,4.5 L-4.5,-1 Z' +
      '" fill="#ffffff" stroke="#003FA2" stroke-width=".6"/>' +
      '</g>' +
      '</svg>';
  }

  // Estrelas de fundo
  function createStarsHTML() {
    var stars = '';
    var positions = [
      { x: 8, y: 12, s: 1.5, d: 0 },
      { x: 22, y: 6, s: 2, d: 0.4 },
      { x: 45, y: 10, s: 1, d: 1.2 },
      { x: 68, y: 4, s: 1.8, d: 0.8 },
      { x: 85, y: 14, s: 1.2, d: 1.6 },
      { x: 14, y: 28, s: 1, d: 2 },
      { x: 76, y: 22, s: 1.5, d: 0.6 },
      { x: 92, y: 8, s: 1, d: 1.4 },
      { x: 36, y: 3, s: 2, d: 1 },
      { x: 55, y: 18, s: 1.3, d: 1.8 },
      { x: 4, y: 20, s: 0.8, d: 2.2 },
      { x: 60, y: 26, s: 1.1, d: 0.2 },
      { x: 30, y: 16, s: 1.6, d: 1.1 },
      { x: 82, y: 30, s: 0.9, d: 0.9 },
      { x: 48, y: 32, s: 1.4, d: 1.5 }
    ];
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      stars += '<span class="copa-star" style="' +
        'left:' + p.x + '%;' +
        'top:' + p.y + '%;' +
        'width:' + p.s + 'px;' +
        'height:' + p.s + 'px;' +
        'animation-delay:' + p.d + 's' +
        '"></span>';
    }
    return '<div class="copa-stars">' + stars + '</div>';
  }

  // === ESTILOS ===
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var css = [
      // -- Fonte --
      '@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap");',

      // -- Floating button --
      '@keyframes copaFloatPulse { 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }',
      '#' + BUTTON_ID + ' {' +
        'position:fixed; right:22px; bottom:39px; width:62px; height:62px; border-radius:50%;' +
        'display:none; align-items:center; justify-content:center; border:2px solid #003FA2;' +
        'cursor:pointer; background:linear-gradient(135deg,#DFF2FE,#b3d9f7); z-index:9999998;' +
        'filter:drop-shadow(0 4px 10px rgba(0,63,162,.35));' +
        'transition:transform .24s ease, filter .24s ease;' +
        'animation:copaFloatPulse 2.4s ease-in-out infinite;' +
      '}',
      '#' + BUTTON_ID + '.visible { display:flex; }',
      '#' + BUTTON_ID + ':hover {' +
        'transform:translateY(-3px) scale(1.1) rotate(-5deg);' +
        'filter:drop-shadow(0 8px 18px rgba(0,63,162,.4)); animation:none;' +
      '}',

      // -- Backdrop --
      '#' + BACKDROP_ID + ' {' +
        'position:fixed; top:0; left:0; width:100%; height:100%;' +
        'background:rgba(3,7,52,.82); z-index:9999998;' +
        'opacity:0; visibility:hidden; pointer-events:none;' +
        'transition:opacity .35s ease, visibility .35s ease;' +
      '}',
      '#' + BACKDROP_ID + '.active { opacity:1; visibility:visible; pointer-events:auto; }',

      // -- Modal --
      '#' + MODAL_ID + ' {' +
        'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(.92);' +
        'width:460px; max-width:calc(100vw - 32px); max-height:calc(100vh - 32px); overflow-y:auto;' +
        'background:linear-gradient(180deg,#030734 0%,#041E42 60%,#0A2E6E 100%);' +
        'border-radius:20px; color:#fff; z-index:9999999;' +
        'opacity:0; visibility:hidden; pointer-events:none;' +
        'transition:all .4s cubic-bezier(.22,1,.36,1);' +
        'font-family:"DM Sans",sans-serif; box-shadow:0 24px 80px rgba(0,0,0,.5);' +
        'display:flex; flex-direction:column;' +
      '}',
      '#' + MODAL_ID + '.active {' +
        'opacity:1; visibility:visible; pointer-events:auto;' +
        'transform:translate(-50%,-50%) scale(1);' +
      '}',

      // -- Header --
      '.copa-header {' +
        'display:flex; justify-content:space-between; align-items:center;' +
        'padding:18px 22px 0;' +
      '}',
      '.copa-logo { font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; }',
      '.copa-close {' +
        'border:none; background:rgba(255,255,255,.12); color:#fff;' +
        'width:34px; height:34px; border-radius:50%; font-size:20px; line-height:1;' +
        'cursor:pointer; display:flex; align-items:center; justify-content:center;' +
        'transition:background .2s ease, transform .2s ease;' +
      '}',
      '.copa-close:hover { background:rgba(255,255,255,.25); transform:rotate(90deg); }',

      // -- Animacao do globo --
      '.copa-scene {' +
        'position:relative; width:100%; height:260px; overflow:hidden;' +
        'display:flex; align-items:center; justify-content:center;' +
      '}',
      '.copa-globe { width:320px; height:280px; }',

      // Estrelas
      '.copa-stars { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }',
      '@keyframes copaTwinkle { 0%,100%{opacity:.2} 50%{opacity:1} }',
      '.copa-star {' +
        'position:absolute; border-radius:50%; background:#fff;' +
        'animation:copaTwinkle 2.5s ease-in-out infinite;' +
      '}',

      // Rota tracejada aparecendo
      '@keyframes copaDrawPath {' +
        '0% { stroke-dashoffset:200; }' +
        '100% { stroke-dashoffset:0; }' +
      '}',
      '.copa-flight-path {' +
        'stroke-dasharray:200; stroke-dashoffset:200;' +
      '}',
      '#' + MODAL_ID + '.active .copa-flight-path {' +
        'animation: copaDrawPath 2.5s ease-out .3s forwards;' +
      '}',

      // Aviao seguindo a rota
      '@keyframes copaFly {' +
        '0%   { offset-distance:0%;   opacity:0; }' +
        '5%   { opacity:1; }' +
        '90%  { opacity:1; }' +
        '100% { offset-distance:100%; opacity:1; }' +
      '}',
      '.copa-airplane-group {' +
        'offset-path: path("M183,184 C175,142 155,112 126,92");' +
        'offset-rotate: auto;' +
        'opacity:0;' +
      '}',
      '#' + MODAL_ID + '.active .copa-airplane-group {' +
        'animation: copaFly 3s ease-in-out .5s forwards;' +
      '}',

      // Ponto destino pulsando
      '@keyframes copaPulseDot { 0%{r:4;opacity:.8} 100%{r:14;opacity:0} }',
      '.copa-dest-dot-pulse {' +
        'animation: copaPulseDot 1.5s ease-out infinite;' +
      '}',

      // Paises surgem
      '@keyframes copaCountryIn { 0%{fill-opacity:0;stroke-opacity:0} 100%{fill-opacity:.6;stroke-opacity:1} }',
      '#' + MODAL_ID + '.active .copa-country {' +
        'animation: copaCountryIn .8s ease-out .2s both;' +
      '}',

      // -- Conteudo --
      '.copa-body { padding:0 22px 22px; display:flex; flex-direction:column; gap:16px; }',

      // Headline badge
      '.copa-headline {' +
        'background:#003FA2; border-radius:12px; padding:16px 18px;' +
        'text-align:center;' +
      '}',
      '.copa-headline h2 {' +
        'margin:0; font-size:18px; line-height:24px; font-weight:700; color:#fff;' +
      '}',
      '.copa-headline span { color:#FFD700; }',

      // Cidades
      '.copa-cities { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }',
      '.copa-city {' +
        'background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15);' +
        'border-radius:20px; padding:6px 14px; font-size:12px; font-weight:500;' +
        'color:rgba(255,255,255,.85); white-space:nowrap;' +
      '}',

      // Card de beneficios TudoAzul
      '.copa-benefits {' +
        'background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);' +
        'border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:14px;' +
      '}',
      '.copa-benefits-title {' +
        'margin:0; font-size:14px; font-weight:700; color:#FFD700;' +
      '}',
      '.copa-benefit-row { display:flex; gap:10px; align-items:flex-start; }',
      '.copa-benefit-icon {' +
        'width:28px; height:28px; flex-shrink:0; display:flex; align-items:center; justify-content:center;' +
      '}',
      '.copa-benefit-icon svg { width:20px; height:20px; }',
      '.copa-benefit-text { margin:0; font-size:13px; line-height:18px; color:rgba(255,255,255,.85); }',
      '.copa-benefit-text strong { color:#fff; }',

      // CTA
      '.copa-cta {' +
        'display:flex; align-items:center; justify-content:center;' +
        'height:50px; background:#008058; border-radius:10px; color:#fff;' +
        'text-decoration:none; font-size:15px; font-weight:700; letter-spacing:.5px;' +
        'text-transform:uppercase;' +
        'transition:background .2s ease, transform .2s ease, box-shadow .2s ease;' +
      '}',
      '.copa-cta:hover {' +
        'background:#006E4B; transform:translateY(-2px);' +
        'box-shadow:0 8px 24px rgba(0,128,88,.35);' +
      '}',

      // -- Responsivo mobile --
      '@media (max-width:520px) {' +
        '#' + BUTTON_ID + ' { right:16px; bottom:16px; width:56px; height:56px; }' +
        '#' + MODAL_ID + ' {' +
          'width:calc(100vw - 24px); max-height:calc(100vh - 24px);' +
          'border-radius:16px;' +
        '}' +
        '.copa-scene { height:200px; }' +
        '.copa-globe { width:240px; height:210px; }' +
        '.copa-headline h2 { font-size:16px; line-height:22px; }' +
      '}'
    ].join('\n');

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // === HTML DO MODAL ===
  function createModalHTML(profile) {
    var esimText = 'eSIM com ate ' + profile.esimVolume + ' gratis para usar nos EUA';

    return '' +
      // Floating button
      '<button id="' + BUTTON_ID + '" aria-label="Abrir modal Copa do Mundo 2026">' +
      floatingIconSVG() +
      '</button>' +

      // Backdrop
      '<div id="' + BACKDROP_ID + '"></div>' +

      // Modal
      '<div id="' + MODAL_ID + '" role="dialog" aria-modal="true" aria-label="Copa do Mundo 2026">' +

      // Header
      '  <div class="copa-header">' +
      '    <span class="copa-logo">AZUL</span>' +
      '    <button class="copa-close" aria-label="Fechar modal">&times;</button>' +
      '  </div>' +

      // Cena animada (globo + estrelas)
      '  <div class="copa-scene">' +
      createStarsHTML() +
      createGlobeSVG() +
      '  </div>' +

      // Conteudo
      '  <div class="copa-body">' +

      // Headline
      '    <div class="copa-headline">' +
      '      <h2>Azul te leva para assistir a <span>Selecao</span> na <span>Copa do Mundo 2026</span>!</h2>' +
      '    </div>' +

      // Cidades-sede
      '    <div class="copa-cities">' +
      '      <span class="copa-city">Miami</span>' +
      '      <span class="copa-city">Dallas</span>' +
      '      <span class="copa-city">Houston</span>' +
      '      <span class="copa-city">Los Angeles</span>' +
      '      <span class="copa-city">New York</span>' +
      '      <span class="copa-city">Atlanta</span>' +
      '    </div>' +

      // Beneficios TudoAzul
      '    <div class="copa-benefits">' +
      '      <h3 class="copa-benefits-title">Beneficios TudoAzul</h3>' +

      '      <div class="copa-benefit-row">' +
      '        <div class="copa-benefit-icon">' +
      '          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '        </div>' +
      '        <p class="copa-benefit-text">Acumule <strong>pontos TudoAzul</strong> na compra da sua passagem para a Copa</p>' +
      '      </div>' +

      '      <div class="copa-benefit-row">' +
      '        <div class="copa-benefit-icon">' +
      '          <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="#FFD700" stroke-width="1.5"/><path d="M6 12h4M14 12h4M6 16h12" stroke="#FFD700" stroke-width="1.2" stroke-linecap="round"/></svg>' +
      '        </div>' +
      '        <p class="copa-benefit-text">' + esimText + '</p>' +
      '      </div>' +

      '      <div class="copa-benefit-row">' +
      '        <div class="copa-benefit-icon">' +
      '          <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="#FFD700" stroke-width="1.5"/></svg>' +
      '        </div>' +
      '        <p class="copa-benefit-text">Passagem cortesia em <strong>Pontos e Pontos + Reais</strong></p>' +
      '      </div>' +
      '    </div>' +

      // CTA
      '    <a class="copa-cta" href="' + CTA_LINK + '">Garanta sua passagem</a>' +

      '  </div>' +
      '</div>';
  }

  // === LOGICA DO MODAL ===
  var previousFocusEl = null;

  function showModal() {
    var modal = document.getElementById(MODAL_ID);
    var backdrop = document.getElementById(BACKDROP_ID);
    if (!modal) return;
    previousFocusEl = document.activeElement;
    modal.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.setProperty('overflow', 'hidden', 'important');
    analyticsEvent('Modal', 'visualizacao');
    markShownThisSession();
    // Focus no primeiro elemento focavel
    var firstFocusable = modal.querySelector('button, a, [tabindex]');
    if (firstFocusable) firstFocusable.focus();
  }

  function hideModal() {
    var modal = document.getElementById(MODAL_ID);
    var backdrop = document.getElementById(BACKDROP_ID);
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.removeProperty('overflow');
    if (previousFocusEl && typeof previousFocusEl.focus === 'function') {
      previousFocusEl.focus();
    }
  }

  // Focus trap dentro do modal
  function handleFocusTrap(e) {
    var modal = document.getElementById(MODAL_ID);
    if (!modal || !modal.classList.contains('active')) return;
    var focusables = modal.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      var modal = document.getElementById(MODAL_ID);
      if (modal && modal.classList.contains('active')) {
        hideModal();
        analyticsEvent('Fechar ESC', 'clique');
        markInteraction();
      }
    }
    if (e.key === 'Tab' || e.keyCode === 9) {
      handleFocusTrap(e);
    }
  }

  function isCookieBannerClick(target) {
    if (!target || typeof target.closest !== 'function') return false;
    return !!target.closest(
      '#onetrust-consent-sdk, #onetrust-banner-sdk, #onetrust-pc-sdk, .ot-sdk-container, [id^="onetrust-"], [aria-label="Privacidade"]'
    );
  }

  // === INJECAO ===
  function injectModal() {
    if (document.getElementById(WRAPPER_ID)) return;

    var cookieData = readTudoAzulCookie();
    var profile = resolveTierProfile(cookieData || {});
    injectStyles();

    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.innerHTML = createModalHTML(profile);
    document.body.appendChild(wrapper);

    var btn = document.getElementById(BUTTON_ID);
    var modal = document.getElementById(MODAL_ID);
    var backdrop = document.getElementById(BACKDROP_ID);
    var closeBtn = modal ? modal.querySelector('.copa-close') : null;
    var cta = modal ? modal.querySelector('.copa-cta') : null;

    // Floating button
    if (btn) {
      btn.classList.add('visible');
      btn.addEventListener('click', function () {
        if (!modal) return;
        if (modal.classList.contains('active')) {
          hideModal();
          analyticsEvent('Floating Button Fechar', 'clique');
          markInteraction();
        } else {
          showModal();
          analyticsEvent('Floating Button Abrir', 'clique');
        }
      });
    }

    // Botao fechar
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        hideModal();
        analyticsEvent('Fechar', 'clique');
        markInteraction();
      });
    }

    // CTA
    if (cta) {
      cta.addEventListener('click', function () {
        analyticsEvent('CTA Copa Garanta Passagem', 'clique');
        markInteraction();
      });
    }

    // Click no backdrop
    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (isCookieBannerClick(e.target)) return;
        hideModal();
        analyticsEvent('Fechar Backdrop', 'clique');
        markInteraction();
      });
    }

    // ESC e focus trap
    document.addEventListener('keydown', handleKeydown);
  }

  // === GUARD DE PAGINA ===
  function isTargetHomePage() {
    var url = window.location.href.split('?')[0].split('#')[0];
    return url === 'https://www.voeazul.com.br/home/br/pt/home';
  }

  // === INIT ===
  function init() {
    if (!isTargetHomePage()) return;
    injectModal();
    if (!hasInteractedToday() && !wasShownThisSession()) {
      setTimeout(function () {
        showModal();
        markInteraction();
      }, 2000);
    }
  }

  window.CopaDoMundo2026Modal = { show: showModal, hide: hideModal, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
