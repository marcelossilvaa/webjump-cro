// =============================================================
// TESTE CONSOLE - Banner Disney Hoteis Resort
// Colar no DevTools (F12) do site voeazul.com.br
// =============================================================
(function () {
  var EXPERIMENT_NAME = 'AT_Disney_hoteis';
  var BANNER_LINK = 'https://www.voeazul.com.br/br/pt/home/hotel?ds=JPD036691&stdi=01/07/2026&stdo=31/07/2026&r[0].adt=2&r[0].chd=0#hotelList';
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
      + '  position:absolute; width:275px; height:55px;'
      + '  left:calc(50% - 275px/2 - 165.5px); top:30.06px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:300; font-size:22px; line-height:25px;'
      + '  letter-spacing:-0.025em; color:#FFFFFF; z-index:5;'
      + '}'

      // ===== FRAME OFERTA (Rectangle 6) =====
      + '.at-dh-offer-frame {'
      + '  position:absolute; box-sizing:border-box;'
      + '  width:365.61px; height:112.66px;'
      + '  left:57px; top:98.06px;'
      + '  border:1px solid #FFFFFF; border-radius:13px;'
      + '  z-index:5;'
      + '}'

      // ===== TEXTOS DO FRAME - DESCONTO =====
      + '.at-dh-desconto {'
      + '  position:absolute;'
      + '  left:calc(50% - 153.61px/2 - 211.44px); top:calc(50% - 39px/2 - 60.61px);'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:32.8671px; line-height:120%; color:#FFFFFF; z-index:5;'
      + '}'
      + '.at-dh-de {'
      + '  position:absolute;'
      + '  left:calc(50% - 26.67px/2 - 272.8px); top:calc(50% - 27px/2 - 33.14px);'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:300; font-size:22.1565px; line-height:120%; color:#FFFFFF; z-index:5;'
      + '}'
      + '.at-dh-rs {'
      + '  position:absolute;'
      + '  left:calc(50% - 28.57px/2 - 271.85px); top:calc(50% - 24px/2 - 14.35px);'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:20.2706px; line-height:120%; color:#FFFFFF; z-index:5;'
      + '}'
      + '.at-dh-preco {'
      + '  position:absolute;'
      + '  left:calc(50% - 121.16px/2 - 195.21px); top:calc(50% - 57px/2 - 24.2px);'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:47.3685px; line-height:120%; color:#FFFFFF; z-index:5;'
      + '}'
      + '.at-dh-asterisco {'
      + '  position:absolute; left:223.34px; top:149.12px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:20.9438px; line-height:120%; color:#FFFFFF; z-index:5;'
      + '}'
      + '.at-dh-hoteis-txt {'
      + '  position:absolute;'
      + '  left:calc(50% - 159.28px/2 - 32.1px); top:calc(50% - 66px/2 - 40.47px);'
      + '  width:159px; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:300; font-size:19.7997px; line-height:109%; color:#FFFFFF; z-index:5;'
      + '}'

      // ===== CUPOM (Frame 9212) =====
      + '.at-dh-coupon {'
      + '  position:absolute; width:309px; height:33.97px;'
      + '  left:calc(50% - 309px/2 - 144.5px); top:230.06px;'
      + '  background:#FFFFFF; border-radius:7.90323px;'
      + '  display:flex; align-items:center; justify-content:center; gap:8px;'
      + '  cursor:pointer; z-index:5; transition:background 0.2s ease;'
      + '}'
      + '.at-dh-coupon:hover { background:#f0f0f0; }'
      + '.at-dh-coupon-code {'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:21.5467px; line-height:120%; color:#216FB7;'
      + '}'
      + '.at-dh-coupon-icon { display:flex; align-items:center; }'

      // ===== TOAST COPIADO =====
      + '.at-dh-toast {'
      + '  position:absolute; left:calc(50% - 309px/2 - 144.5px); top:205px;'
      + '  background:rgba(0,0,0,0.8); color:#5EDCFF; border-radius:8px;'
      + '  padding:4px 14px; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:600; font-size:13px; z-index:15; opacity:0;'
      + '  transition:opacity 0.3s ease; pointer-events:none; white-space:nowrap;'
      + '}'
      + '.at-dh-toast.at-dh-toast-show { opacity:1; }'

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
      + '  font-weight:700; font-size:18.9285px; line-height:20px; color:#00043E;'
      + '  transition:transform 0.2s ease, box-shadow 0.2s ease;'
      + '}'
      + '.at-dh-cta:hover {'
      + '  transform:translateY(-2px); box-shadow:0 4px 20px rgba(94,220,255,0.4);'
      + '}'

      // ===== LOGOS =====
      + '.at-dh-logos {'
      + '  position:absolute; display:flex; align-items:center; gap:9px;'
      + '  width:125.65px; height:18.17px;'
      + '  left:calc(50% - 125.65px/2 - 13.09px); top:308.4px; z-index:5;'
      + '}'
      + '.at-dh-logos-divider {'
      + '  width:0; height:18px; border-left:0.6px solid #FFFFFF; flex:none;'
      + '}'

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
      + '    width:360px; height:433px; border-radius:16px;'
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
      + '    width:328px; height:113px; left:16px; top:145.17px;'
      + '    border-radius:13px;'
      + '  }'
      // Textos oferta mobile
      + '  .at-dh-desconto {'
      + '    left:27px; top:154px; font-size:28px;'
      + '  }'
      + '  .at-dh-de {'
      + '    left:27px; top:188px; font-size:22px;'
      + '  }'
      + '  .at-dh-rs {'
      + '    left:27px; top:209px; font-size:20px;'
      + '  }'
      + '  .at-dh-preco {'
      + '    left:53px; top:197px; font-size:40px;'
      + '  }'
      + '  .at-dh-asterisco {'
      + '    left:150px; top:197px; font-size:21px;'
      + '  }'
      + '  .at-dh-hoteis-txt {'
      + '    left:185px; top:163px; width:149px; font-size:18px;'
      + '  }'
      // Cupom mobile
      + '  .at-dh-coupon {'
      + '    width:309px; height:33.97px; left:calc(50% - 309px/2); top:274.17px;'
      + '  }'
      + '  .at-dh-toast { left:calc(50% - 100px); top:249px; }'
      // CTA mobile
      + '  .at-dh-cta {'
      + '    width:206.95px; height:49.13px;'
      + '    left:calc(50% - 206.95px/2); top:324.17px;'
      + '  }'
      // Consulte mobile - centralizado
      + '  .at-dh-consult {'
      + '    width:328px; left:16px; top:389.17px;'
      + '    font-size:10px; text-align:center;'
      + '  }'
      // Foto oculta no mobile
      + '  .at-dh-photo-wrapper { display:none; }'
      + '  .at-dh-copyright { display:none; }'
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
    txt.textContent = 'Conhe\u00E7a os Hot\u00E9is Resort Disney';
    container.appendChild(txt);

    // --- Frame oferta (Rectangle 6) ---
    var offerFrame = document.createElement('div');
    offerFrame.className = 'at-dh-offer-frame';
    container.appendChild(offerFrame);

    // --- Textos de preco ---
    var desconto = document.createElement('div');
    desconto.className = 'at-dh-desconto';
    desconto.textContent = 'Desconto';
    container.appendChild(desconto);

    var de = document.createElement('div');
    de.className = 'at-dh-de';
    de.textContent = 'de';
    container.appendChild(de);

    var rs = document.createElement('div');
    rs.className = 'at-dh-rs';
    rs.textContent = 'R$';
    container.appendChild(rs);

    var preco = document.createElement('div');
    preco.className = 'at-dh-preco';
    preco.textContent = '2.300';
    container.appendChild(preco);

    var asterisco = document.createElement('div');
    asterisco.className = 'at-dh-asterisco';
    asterisco.textContent = '*';
    container.appendChild(asterisco);

    var hoteisTxt = document.createElement('div');
    hoteisTxt.className = 'at-dh-hoteis-txt';
    hoteisTxt.textContent = 'em Hot\u00E9is Resort Disney a partir de 4 noites';
    container.appendChild(hoteisTxt);

    // --- Cupom (Frame 9212) ---
    var coupon = document.createElement('div');
    coupon.className = 'at-dh-coupon';

    var couponIcon = document.createElement('div');
    couponIcon.className = 'at-dh-coupon-icon';
    couponIcon.innerHTML = '<svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<rect x="0.5" y="0.5" width="19" height="12" rx="2" stroke="#216FB7"/>'
      + '<path d="M7 0.5V12.5" stroke="#216FB7" stroke-dasharray="2 2"/>'
      + '<circle cx="13" cy="6.5" r="2" stroke="#216FB7"/></svg>';
    coupon.appendChild(couponIcon);

    var couponCode = document.createElement('span');
    couponCode.className = 'at-dh-coupon-code';
    couponCode.textContent = 'HOTELENCANTADO2026';
    coupon.appendChild(couponCode);
    container.appendChild(coupon);

    // --- Toast "Cod copiado" ---
    var toast = document.createElement('div');
    toast.className = 'at-dh-toast';
    toast.textContent = 'C\u00F3d. Copiado';
    container.appendChild(toast);

    // --- CTA ---
    var cta = document.createElement('button');
    cta.className = 'at-dh-cta';
    cta.textContent = 'Eu quero';
    container.appendChild(cta);

    // --- Logos Azul Viagens | Disney Destinations ---
    var logos = document.createElement('div');
    logos.className = 'at-dh-logos';

    var logoAzul = document.createElement('div');
    logoAzul.innerHTML = '<svg width="40" height="18" viewBox="0 0 40 18" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<text x="0" y="12" font-family="Helvetica Neue,Arial,sans-serif" font-weight="700" font-size="8" fill="#FFFFFF">Azul</text>'
      + '<text x="0" y="18" font-family="Helvetica Neue,Arial,sans-serif" font-weight="400" font-size="6" fill="#FFFFFF">Viagens</text>'
      + '</svg>';
    logos.appendChild(logoAzul);

    var logoDivider = document.createElement('div');
    logoDivider.className = 'at-dh-logos-divider';
    logos.appendChild(logoDivider);

    var logoDisney = document.createElement('div');
    logoDisney.innerHTML = '<svg width="70" height="12" viewBox="0 0 70 12" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<text x="0" y="10" font-family="Helvetica Neue,Arial,sans-serif" font-weight="400" font-size="8" fill="#FFFFFF" letter-spacing="0.5">Disney Destinations</text>'
      + '</svg>';
    logos.appendChild(logoDisney);
    container.appendChild(logos);

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
    photoImg.src = 'https://i.imgur.com/ztjVK2f.png';
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

    coupon.addEventListener('click', function (e) {
      e.stopPropagation();
      var code = 'HOTELENCANTADO2026';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(function () {});
      } else {
        var tmp = document.createElement('textarea');
        tmp.value = code;
        tmp.style.cssText = 'position:fixed;left:-9999px;';
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(tmp);
      }
      toast.classList.add('at-dh-toast-show');
      setTimeout(function () { toast.classList.remove('at-dh-toast-show'); }, 2000);
      cta.classList.remove('at-dh-cta-pulse');
      void cta.offsetWidth;
      cta.classList.add('at-dh-cta-pulse');
      analyticsEvent('banner_disney_hoteis_cupom_copiado', 'click');
    });

    container.addEventListener('click', function (e) {
      if (e.target === closeBtn || closeBtn.contains(e.target)) return;
      if (e.target === cta) return;
      if (coupon.contains(e.target)) return;
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
