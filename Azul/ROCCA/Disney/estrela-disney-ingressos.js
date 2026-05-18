// =============================================================
// TESTE CONSOLE - Banner Disney Hoteis Resort
// Colar no DevTools (F12) do site voeazul.com.br
// =============================================================
(function () {
  var EXPERIMENT_NAME = 'AT_Disney_hoteis';
  var BANNER_LINK = 'https://www.voeazul.com.br/br/pt/home/tickets?ds=JPD036691&stdi=01/10/2026&stdo=31/10/2026&adt=2&chd=0';
  var STYLE_ID = 'at-disney-hoteis-style';
  var OVERLAY_ID = 'at-disney-hoteis-overlay';
  var BANNER_ID = 'at-disney-hoteis-banner';
  var EVAR84 = 'AT_Disney_campaign';

  // Limpa execucoes anteriores
  var oldStyle = document.getElementById(STYLE_ID);
  if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);
  var oldOverlay = document.getElementById(OVERLAY_ID);
  if (oldOverlay) oldOverlay.parentNode.removeChild(oldOverlay);
  var oldBanner = document.getElementById(BANNER_ID);
  if (oldBanner) oldBanner.parentNode.removeChild(oldBanner);

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = EXPERIMENT_NAME + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Disney Hoteis] Evento disparado: ' + labelEvent);
    try {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = EVAR84;
      s.tl(true, 'o', 'target_activity_action');
    } catch (e) {
      console.log('[Tracking Disney Hoteis] Erro no analytics: ' + e.message);
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      // ===== OVERLAY DA ANIMACAO =====
      + '#' + OVERLAY_ID + ' {'
      + '  position:fixed; top:0; left:0; width:100%; height:100%;'
      + '  background:rgba(0,10,40,0.92); z-index:999999;'
      + '  display:flex; align-items:center; justify-content:center;'
      + '  opacity:0; transition:opacity 0.5s ease; overflow:hidden;'
      + '}'
      + '#' + OVERLAY_ID + '.at-disney-visible { opacity:1; }'
      + '#' + OVERLAY_ID + '.at-disney-fade-out { opacity:0; pointer-events:none; }'
      + '.at-disney-star {'
      + '  position:absolute; width:12px; height:12px; background:#fff;'
      + '  border-radius:50%; z-index:3; opacity:0; filter:blur(0.5px);'
      + '  box-shadow:0 0 20px 8px rgba(255,255,255,0.9),0 0 60px 20px rgba(100,180,255,0.6),0 0 100px 40px rgba(80,150,255,0.3);'
      + '}'
      + '.at-disney-sparkle {'
      + '  position:absolute; width:4px; height:4px; background:#fff;'
      + '  border-radius:50%; opacity:0; pointer-events:none;'
      + '  box-shadow:0 0 6px 2px rgba(255,255,255,0.8),0 0 15px 5px rgba(100,180,255,0.4);'
      + '}'
      + '.at-disney-dust {'
      + '  position:absolute; width:3px; height:3px; background:rgba(255,255,255,0.9);'
      + '  border-radius:50%; opacity:0; box-shadow:0 0 8px 3px rgba(180,220,255,0.6);'
      + '}'
      + '.at-disney-dust.at-disney-animate-dust { animation:atDisneyDust 1.5s ease-out forwards; }'
      + '@keyframes atDisneyDust {'
      + '  0%{opacity:0;transform:scale(0) translateY(0)}'
      + '  20%{opacity:1;transform:scale(1.2) translateY(-5px)}'
      + '  100%{opacity:0;transform:scale(0.3) translateY(15px)}'
      + '}'
      + '.at-disney-flash {'
      + '  position:absolute; width:300px; height:300px; border-radius:50%;'
      + '  background:radial-gradient(circle,rgba(255,255,255,0.6) 0%,rgba(100,180,255,0.2) 40%,transparent 70%);'
      + '  opacity:0; z-index:2; pointer-events:none; transform:translate(-50%,-50%);'
      + '}'
      + '.at-disney-flash.at-disney-animate-flash { animation:atDisneyFlash 1s ease-out forwards; }'
      + '@keyframes atDisneyFlash {'
      + '  0%{opacity:0;transform:translate(-50%,-50%) scale(0.2)}'
      + '  30%{opacity:1;transform:translate(-50%,-50%) scale(1)}'
      + '  100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}'
      + '}'

      // ===== BANNER OVERLAY =====
      + '#' + BANNER_ID + ' {'
      + '  position:fixed; top:0; left:0; width:100%; height:100%;'
      + '  z-index:999998; display:flex; align-items:center; justify-content:center;'
      + '  background:rgba(0,0,0,0.7); opacity:0; transition:opacity 0.6s ease;'
      + '}'
      + '#' + BANNER_ID + '.at-disney-banner-visible { opacity:1; }'
      + '#' + BANNER_ID + '.at-disney-banner-fade-out { opacity:0; pointer-events:none; }'

      // ===== CONTAINER PRINCIPAL 720x386 =====
      + '.at-dh-container {'
      + '  position:relative; width:720px; height:386px;'
      + '  background:url("fundo disney.png"), #0150B5; border-radius:16px; overflow:hidden;'
      + '  box-shadow:0 20px 80px rgba(0,0,0,0.5);'
      + '  animation:atDhBannerIn 0.6s ease-out forwards;'
      + '}'
      + '@keyframes atDhBannerIn {'
      + '  0%{transform:scale(0.8) translateY(30px);opacity:0}'
      + '  100%{transform:scale(1) translateY(0);opacity:1}'
      + '}'

      // ===== CAMADAS DE BRILHO (Group 11785) =====
      + '.at-dh-glow-layer {'
      + '  position:absolute; pointer-events:none;'
      + '  background:radial-gradient(ellipse at center, rgba(100,180,255,0.18) 0%, rgba(50,130,255,0.08) 30%, transparent 70%);'
      + '  mix-blend-mode:plus-lighter;'
      + '}'
      + '.at-dh-glow-1 {'
      + '  width:548px; height:548px;'
      + '  left:23.93%; right:-72.69%; top:148.95px;'
      + '  transform:rotate(164.96deg);'
      + '}'
      + '.at-dh-glow-2 {'
      + '  width:548px; height:548px;'
      + '  left:-97.75%; right:48.99%; top:306.49px;'
      + '  transform:rotate(164.96deg);'
      + '}'

      // ===== BRILHOS PONTUAIS (BRILHO copy) =====
      + '.at-dh-lens-flare {'
      + '  position:absolute; pointer-events:none; mix-blend-mode:screen;'
      + '  background:radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, rgba(200,230,255,0.12) 30%, transparent 60%);'
      + '}'
      + '.at-dh-lens-1 {'
      + '  width:200px; height:180px;'
      + '  left:-34.23%; right:83.62%; top:-74.54%; bottom:100.64%;'
      + '  transform:rotate(103.19deg);'
      + '}'
      + '.at-dh-lens-2 {'
      + '  width:220px; height:200px;'
      + '  left:44.25%; right:5.14%; top:23.17%; bottom:2.93%;'
      + '  transform:rotate(131.48deg);'
      + '}'
      + '.at-dh-lens-3 {'
      + '  width:200px; height:180px;'
      + '  left:41.67%; right:7.72%; top:-41.25%; bottom:67.36%;'
      + '  transform:rotate(-121.02deg);'
      + '}'

      // ===== ESTRELINHAS PISCANDO =====
      + '.at-dh-sparkle-layer {'
      + '  position:absolute; top:0; left:0; width:100%; height:100%;'
      + '  pointer-events:none; overflow:hidden; z-index:2;'
      + '}'
      + '.at-dh-shine {'
      + '  position:absolute; width:3px; height:3px; background:#fff;'
      + '  border-radius:50%; opacity:0;'
      + '  box-shadow:0 0 6px 2px rgba(255,255,255,0.6);'
      + '  animation:atDhTwinkle 2s ease-in-out infinite;'
      + '}'
      + '@keyframes atDhTwinkle {'
      + '  0%,100%{opacity:0;transform:scale(0.5)}'
      + '  50%{opacity:1;transform:scale(1.2)}'
      + '}'

      // ===== TITULO (txt) =====
      + '.at-dh-txt {'
      + '  position:absolute; width:366px; height:99px;'
      + '  left:57px; top:26px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:300; font-size:20px; line-height:109%;'
      + '  display:flex; align-items:center; color:#FFFFFF; z-index:5;'
      + '  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;'
      + '  text-rendering:optimizeLegibility;'
      + '}'

      // ===== FRAME OFERTA (Rectangle 6) =====
      + '.at-dh-offer-frame {'
      + '  position:absolute; box-sizing:border-box;'
      + '  width:366px; height:121px;'
      + '  left:57px; top:153px;'
      + '  border:1px solid #FFFFFF; border-radius:13px;'
      + '  z-index:5;'
      + '}'

      // ===== FAIXA DE PARQUES (Frame 15065) =====
      + '.at-dh-park-strip {'
      + '  position:absolute; display:flex; flex-direction:row;'
      + '  align-items:center; justify-content:center; padding:0 4px;'
      + '  width:241px; height:25.56px;'
      + '  left:161px; top:140px;'
      + '  background:linear-gradient(180deg,#1B62AD 0%,#1D66B0 100%);'
      + '  z-index:6; box-sizing:border-box; overflow:hidden;'
      + '}'

      // ===== BULLET ROWS =====
      + '.at-dh-bullet-row {'
      + '  position:absolute; display:flex; flex-direction:row; align-items:center;'
      + '  padding:0; gap:12px; width:326px; height:28px; left:74px; z-index:6;'
      + '}'
      + '.at-dh-bullet-icon-wrap {'
      + '  display:flex; align-items:center; justify-content:center;'
      + '  width:28px; height:28px; flex:none;'
      + '  background:#5EDCFF; border-radius:50%;'
      + '}'
      + '.at-dh-bullet-icon-img {'
      + '  width:28px; height:28px; object-fit:contain; flex:none; display:block;'
      + '}'
      + '.at-dh-bullet-text {'
      + '  font-family:"Inter",Arial,sans-serif; font-weight:400; font-size:14px;'
      + '  line-height:16px; color:#FFFFFF; flex:1;'
      + '}'

      // ===== CTA PULSE =====
      + '@keyframes atDhCtaPulse {'
      + '  0%{transform:scale(1);box-shadow:0 0 0 0 rgba(94,220,255,0.25)}'
      + '  50%{transform:scale(1.02);box-shadow:0 0 10px 3px rgba(94,220,255,0.25)}'
      + '  100%{transform:scale(1);box-shadow:0 0 0 0 rgba(94,220,255,0)}'
      + '}'
      + '.at-dh-cta-pulse { animation:atDhCtaPulse 0.9s ease-out 2; }'

      // ===== CTA =====
      + '.at-dh-cta {'
      + '  position:absolute; width:206.95px; height:49.13px;'
      + '  left:56.95px; top:290.42px;'
      + '  background:#5EDCFF; border-radius:45.2779px; border:none;'
      + '  cursor:pointer; z-index:5;'
      + '  display:flex; align-items:center; justify-content:center;'
      + '  padding:0 30.2856px; gap:5.66px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:15px; line-height:20px; color:#00043E;'
      + '  transition:transform 0.2s ease, box-shadow 0.2s ease;'
      + '}'
      + '.at-dh-cta:hover {'
      + '  transform:translateY(-2px); box-shadow:0 4px 20px rgba(94,220,255,0.4);'
      + '}'

      + '.at-dh-cta-logo {'
      + '  position:absolute; left:272px; top:305px;'
      + '  height:20px; width:auto; object-fit:contain; z-index:5;'
      + '}'

      // ===== LOGOS =====
      + '.at-dh-logos { display:none; }'
      + '.at-dh-logos-divider { display:none; }'

      // ===== CONSULTE CONDICOES =====
      + '.at-dh-consult {'
      + '  position:absolute; width:115px; height:14px; left:102.47px; top:349.43px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:400; font-size:12px; line-height:120%; color:#FFFFFF; z-index:5;'
      + '}'

      // ===== FOTO PERSONAGEM (circulo grande) =====
      + '.at-dh-photo-wrapper {'
      + '  position:absolute; width:350.12px; height:350.12px;'
      + '  left:443.99px; top:14.59px; z-index:3;'
      + '  border-radius:50%; overflow:hidden; background:#0150B5;'
      + '}'
      + '.at-dh-photo-img {'
      + '  position:absolute; width:auto; height:100%; min-width:100%;'
      + '  left:50%; top:50%; transform:translate(-50%,-50%);'
      + '  object-fit:cover; object-position:center center;'
      + '}'
      + '.at-dh-photo-gradient {'
      + '  position:absolute; bottom:0; left:0; width:100%; height:40%;'
      + '  background:linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.35) 100%);'
      + '  border-radius:0 0 175px 175px; z-index:4;'
      + '}'

      // ===== COPYRIGHT =====
      + '.at-dh-copyright {'
      + '  position:absolute;'
      + '  left:calc(50% - 59px/2 + 259.05px); top:343.11px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:400; font-size:8.88603px; line-height:7px;'
      + '  color:#FFFFFF; z-index:5; text-align:center;'
      + '}'

      // ===== BOTAO FECHAR =====
      + '.at-dh-close {'
      + '  position:absolute; top:10px; right:10px; width:28px; height:28px;'
      + '  background:rgba(255,255,255,0.15); border:none; border-radius:50%;'
      + '  cursor:pointer; display:flex; align-items:center; justify-content:center;'
      + '  z-index:10; transition:background 0.2s ease;'
      + '}'
      + '.at-dh-close:hover { background:rgba(255,255,255,0.3); }'
      + '.at-dh-close svg { width:12px; height:12px; }'

      // ===== RESPONSIVO MOBILE =====
      + '@media (max-width: 768px) {'
      // Container mobile 360x433
      + '  .at-dh-container {'
      + '    width:360px; height:388px; border-radius:16px;'
      + '    background:url("fundo disney.png"), #0150B5;'
      + '    background-size:cover; background-position:center;'
      + '    transform:none;'
      + '  }'
      // Camadas de brilho mobile
      + '  .at-dh-glow-1 { height:273.87px; left:23.93%; right:-72.69%; top:148.95px; }'
      + '  .at-dh-glow-2 { height:273.87px; left:-97.75%; right:48.99%; top:306.49px; }'
      // Lens flares mobile
      + '  .at-dh-lens-1 { left:-34.23%; right:23.08%; top:-74.54%; bottom:138.31%; transform:matrix(-0.1,0.99,-0.89,-0.47,0,0); }'
      + '  .at-dh-lens-2 { left:44.25%; right:-35.68%; top:23.17%; bottom:22.01%; transform:matrix(-0.37,0.93,-0.45,-0.89,0,0); }'
      + '  .at-dh-lens-3 { left:41.67%; right:-42.42%; top:-41.25%; bottom:93.85%; transform:matrix(-0.26,-0.97,0.6,-0.8,0,0); }'
      // Logos mobile - topo
      + '  .at-dh-logos {'
      + '    width:125.65px; height:18.17px; left:16px; top:40px;'
      + '  }'
      // Titulo mobile
      + '  .at-dh-txt {'
      + '    width:328px; height:55px; left:16px; top:74.17px;'
      + '    font-size:22px; line-height:25px;'
      + '  }'
      // Frame oferta mobile
      + '  .at-dh-offer-frame {'
      + '    width:328px; height:121px; left:16px; top:153px;'
      + '    border-radius:13px;'
      + '  }'
      + '  .at-dh-park-strip {'
      + '    left:16px; width:328px; top:140px;'
      + '  }'
      + '  .at-dh-bullet-row { left:16px; width:324px; }'
      // CTA mobile
      + '  .at-dh-cta {'
      + '    width:206.95px; height:49.13px;'
      + '    left:calc(50% - 206.95px/2); top:290px;'
      + '  }'
      // Consulte mobile - centralizado
      + '  .at-dh-consult {'
      + '    width:328px; left:16px; top:349px;'
      + '    font-size:10px; text-align:center;'
      + '  }'
      // Foto oculta no mobile
      + '  .at-dh-photo-wrapper { display:none; }'
      + '  .at-dh-copyright { display:none; }'
      + '  .at-dh-cta-logo { display:none; }'
      + '}';

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
  }

  // === ANIMACAO ESTRELA CADENTE ===

  function getArcPoint(t, startX, startY, controlX, controlY, endX, endY) {
    var u = 1 - t;
    return {
      x: u * u * startX + 2 * u * t * controlX + t * t * endX,
      y: u * u * startY + 2 * u * t * controlY + t * t * endY
    };
  }

  function createShootingStarAnimation(callback) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    document.body.appendChild(overlay);

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var startX = vw * 0.1, startY = vh * 0.75;
    var controlX = vw * 0.5, controlY = vh * -0.15;
    var endX = vw * 0.9, endY = vh * 0.7;

    var star = document.createElement('div');
    star.className = 'at-disney-star';
    overlay.appendChild(star);

    var flashPoint = getArcPoint(0.5, startX, startY, controlX, controlY, endX, endY);
    var flash = document.createElement('div');
    flash.className = 'at-disney-flash';
    flash.style.cssText = 'left:' + flashPoint.x + 'px;top:' + flashPoint.y + 'px;';
    overlay.appendChild(flash);

    requestAnimationFrame(function () { overlay.classList.add('at-disney-visible'); });

    var startTime = null, duration = 2200, sCount = 0, maxS = 80;

    function animate(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var p = Math.min(elapsed / duration, 1);
      var ep = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var pt = getArcPoint(ep, startX, startY, controlX, controlY, endX, endY);

      var op = p < 0.05 ? (p / 0.05).toFixed(3) : p > 0.9 ? ((1 - p) / 0.1).toFixed(3) : '1';
      var sc = (0.5 + 0.5 * Math.sin(p * Math.PI)).toFixed(3);
      star.style.cssText = 'position:absolute;left:' + pt.x + 'px;top:' + pt.y + 'px;'
        + 'width:12px;height:12px;background:#fff;border-radius:50%;'
        + 'box-shadow:0 0 20px 8px rgba(255,255,255,0.9),0 0 60px 20px rgba(100,180,255,0.6),0 0 100px 40px rgba(80,150,255,0.3);'
        + 'z-index:3;filter:blur(0.5px);opacity:' + op + ';transform:translate(-50%,-50%) scale(' + sc + ');';

      if (sCount < maxS && p > 0.03 && p < 0.95) {
        if (Math.random() > 0.3) { createSparkle(overlay, pt.x, pt.y); sCount++; }
        if (Math.random() > 0.5) { createDust(overlay, pt.x, pt.y); }
      }

      if (p < 1) { requestAnimationFrame(animate); }
      else {
        flash.classList.add('at-disney-animate-flash');
        for (var k = 0; k < 25; k++) createDust(overlay, pt.x, pt.y);
        setTimeout(function () {
          overlay.classList.add('at-disney-fade-out');
          setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (typeof callback === 'function') callback();
          }, 600);
        }, 800);
      }
    }
    setTimeout(function () { requestAnimationFrame(animate); }, 400);
  }

  function createSparkle(c, x, y) {
    var el = document.createElement('div');
    el.className = 'at-disney-sparkle';
    var ox = (Math.random() - 0.5) * 30, oy = (Math.random() - 0.5) * 30;
    var sz = 2 + Math.random() * 4, dur = 300 + Math.random() * 500;
    el.style.cssText = 'position:absolute;left:' + (x + ox) + 'px;top:' + (y + oy) + 'px;'
      + 'width:' + sz + 'px;height:' + sz + 'px;background:#fff;border-radius:50%;'
      + 'box-shadow:0 0 6px 2px rgba(255,255,255,0.8),0 0 15px 5px rgba(100,180,255,0.4);'
      + 'pointer-events:none;opacity:1;transition:opacity ' + dur + 'ms ease-out;';
    c.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, dur + 50);
    }, 80);
  }

  function createDust(c, x, y) {
    var el = document.createElement('div');
    el.className = 'at-disney-dust';
    var ox = (Math.random() - 0.5) * 60, oy = (Math.random() - 0.5) * 60;
    var sz = 1 + Math.random() * 4, dl = Math.random() * 200;
    el.style.cssText = 'position:absolute;left:' + (x + ox) + 'px;top:' + (y + oy) + 'px;'
      + 'width:' + sz + 'px;height:' + sz + 'px;background:rgba(255,255,255,0.9);border-radius:50%;'
      + 'box-shadow:0 0 8px 3px rgba(180,220,255,0.6);opacity:0;'
      + 'animation:atDisneyDust 1.5s ease-out ' + dl + 'ms forwards;';
    c.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1800);
  }

  // === BANNER HOTEIS DISNEY ===

  function createBanner() {
    var existing = document.getElementById(BANNER_ID);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var bannerOverlay = document.createElement('div');
    bannerOverlay.id = BANNER_ID;

    // Container principal 720x386
    var container = document.createElement('div');
    container.className = 'at-dh-container';

    // --- Camadas de brilho (Group 11785) ---
    var g1 = document.createElement('div');
    g1.className = 'at-dh-glow-layer at-dh-glow-1';
    container.appendChild(g1);

    var g2 = document.createElement('div');
    g2.className = 'at-dh-glow-layer at-dh-glow-2';
    container.appendChild(g2);

    // --- Lens flares (BRILHO copy) ---
    var lf1 = document.createElement('div');
    lf1.className = 'at-dh-lens-flare at-dh-lens-1';
    container.appendChild(lf1);

    var lf2 = document.createElement('div');
    lf2.className = 'at-dh-lens-flare at-dh-lens-2';
    container.appendChild(lf2);

    var lf3 = document.createElement('div');
    lf3.className = 'at-dh-lens-flare at-dh-lens-3';
    container.appendChild(lf3);

    // --- Estrelinhas piscando ---
    var sparkleLayer = document.createElement('div');
    sparkleLayer.className = 'at-dh-sparkle-layer';
    for (var i = 0; i < 20; i++) {
      var sh = document.createElement('div');
      sh.className = 'at-dh-shine';
      sh.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;'
        + 'animation-delay:' + (Math.random() * 3) + 's;animation-duration:' + (1.5 + Math.random() * 2) + 's;';
      sparkleLayer.appendChild(sh);
    }
    container.appendChild(sparkleLayer);

    // --- Botao fechar ---
    var closeBtn = document.createElement('button');
    closeBtn.className = 'at-dh-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M1 1L13 13M13 1L1 13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    container.appendChild(closeBtn);

    // --- Titulo (txt) ---
    var txt = document.createElement('div');
    txt.className = 'at-dh-txt';
    txt.textContent = 'Complete sua experi\u00EAncia Disney! Garanta seus ingressos para Parques Tem\u00E1ticos Disney por condi\u00E7\u00F5es imperd\u00EDveis';
    container.appendChild(txt);

    // --- Frame oferta (Rectangle 6) ---
    var offerFrame = document.createElement('div');
    offerFrame.className = 'at-dh-offer-frame';
    container.appendChild(offerFrame);

    // --- Faixa de parques (Frame 15065) ---
    var parkStrip = document.createElement('div');
    parkStrip.className = 'at-dh-park-strip';
    var parkImg = document.createElement('img');
    parkImg.src = 'https://i.imgur.com/W3mUtjO.png';
    parkImg.alt = 'Parques Disney';
    parkImg.style.cssText = 'height:100%;width:auto;max-width:100%;object-fit:contain;display:block;';
    parkStrip.appendChild(parkImg);
    container.appendChild(parkStrip);

    // --- Bullet rows ---
    var bulletItems = [
      { type: 'check', text: '10% de desconto com cart\u00E3o Azul Ita\u00FA' },
      { type: 'check', text: 'Ganhe pontos com Cart\u00E3o Azul' },
      { type: 'check', text: 'Parcelamento em at\u00E9 10x sem juros' }
    ];
    var bulletTops = [166, 202, 238];
    bulletItems.forEach(function (item, index) {
      var row = document.createElement('div');
      row.className = 'at-dh-bullet-row';
      row.style.top = bulletTops[index] + 'px';

      var iconEl;
      if (item.type === 'img') {
        iconEl = document.createElement('img');
        iconEl.className = 'at-dh-bullet-icon-img';
        iconEl.src = item.src;
        iconEl.alt = '';
      } else {
        iconEl = document.createElement('div');
        iconEl.className = 'at-dh-bullet-icon-wrap';
        iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5L5.5 11L12 3.5" stroke="#00043E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      row.appendChild(iconEl);

      var bulletTxt = document.createElement('span');
      bulletTxt.className = 'at-dh-bullet-text';
      bulletTxt.textContent = item.text;
      row.appendChild(bulletTxt);

      container.appendChild(row);
    });

    // --- CTA ---
    var cta = document.createElement('button');
    cta.className = 'at-dh-cta';
    cta.textContent = 'Comprar Ingressos';
    container.appendChild(cta);

    // --- Logo Disney ao lado direito do CTA ---
    var ctaLogo = document.createElement('img');
    ctaLogo.className = 'at-dh-cta-logo';
    ctaLogo.src = 'https://i.imgur.com/1CwQhAX.png';
    ctaLogo.alt = 'Disney';
    container.appendChild(ctaLogo);

    // --- Consulte condicoes ---
    var consult = document.createElement('div');
    consult.className = 'at-dh-consult';
    consult.textContent = '*Consulte condi\u00E7\u00F5es.';
    container.appendChild(consult);

    // --- Foto personagem (circulo grande) ---
    var photoWrap = document.createElement('div');
    photoWrap.className = 'at-dh-photo-wrapper';

    var photoImg = document.createElement('img');
    photoImg.className = 'at-dh-photo-img';
    photoImg.src = 'https://i.imgur.com/NwAJ44j.jpeg';
    photoImg.alt = 'Disney';
    photoWrap.appendChild(photoImg);

    var photoGrad = document.createElement('div');
    photoGrad.className = 'at-dh-photo-gradient';
    photoWrap.appendChild(photoGrad);
    container.appendChild(photoWrap);

    // --- Copyright ---
    var copy = document.createElement('div');
    copy.className = 'at-dh-copyright';
    copy.textContent = '\u00A9 2026 Disney';
    container.appendChild(copy);

    // Monta tudo
    bannerOverlay.appendChild(container);
    document.body.appendChild(bannerOverlay);

    requestAnimationFrame(function () {
      bannerOverlay.classList.add('at-disney-banner-visible');
    });

    // Tracking
    analyticsEvent('banner_disney_hoteis', 'view');

    // Eventos
    cta.addEventListener('click', function (e) {
      e.stopPropagation();
      analyticsEvent('banner_disney_hoteis_cta', 'click');
      window.location.href = BANNER_LINK;
    });

    container.addEventListener('click', function (e) {
      if (e.target === closeBtn || closeBtn.contains(e.target)) return;
      if (e.target === cta) return;
      e.stopPropagation();
      analyticsEvent('banner_disney_hoteis_container', 'click');
      window.location.href = BANNER_LINK;
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      analyticsEvent('banner_disney_hoteis_fechar', 'click');
      closeBanner(bannerOverlay);
    });

    bannerOverlay.addEventListener('click', function (e) {
      if (e.target === bannerOverlay) {
        analyticsEvent('banner_disney_hoteis_overlay_fechar', 'click');
        closeBanner(bannerOverlay);
      }
    });

    var handleEsc = function (e) {
      if (e.key === 'Escape') {
        analyticsEvent('banner_disney_hoteis_esc_fechar', 'click');
        closeBanner(bannerOverlay);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  function closeBanner(el) {
    if (!el) return;
    el.classList.add('at-disney-banner-fade-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  }

  // Executa direto
  console.log('[Disney Hoteis] Iniciando animacao Disney (modo teste console).');
  injectStyles();
  createShootingStarAnimation(function () {
    createBanner();
  });
})();
