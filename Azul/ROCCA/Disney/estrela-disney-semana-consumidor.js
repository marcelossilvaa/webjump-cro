// =============================================================
// TESTE CONSOLE - Colar no DevTools (F12) do site voeazul.com.br
// =============================================================
(function () {
  var EXPERIMENT_NAME = 'AT_Disney_shooting_star';
  var BANNER_LINK = 'https://www.voeazul.com.br/br/pt/disney/promocoes-disney-23-10';
  var STYLE_ID = 'at-disney-shooting-star-style';
  var OVERLAY_ID = 'at-disney-overlay';
  var BANNER_ID = 'at-disney-banner';
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
    console.log('[Tracking Disney] Evento disparado: ' + labelEvent);
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
      console.log('[Tracking Disney] Erro no analytics: ' + e.message);
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

      // ===== CONTAINER PRINCIPAL 720x467 =====
      + '.at-disney-banner-container {'
      + '  position:relative; width:720px; height:467px;'
      + '  background:#2D8AF0; border-radius:16px; overflow:hidden;'
      + '  box-shadow:0 20px 80px rgba(0,0,0,0.5);'
      + '  animation:atDisneyBannerIn 0.6s ease-out forwards;'
      + '}'
      + '@keyframes atDisneyBannerIn {'
      + '  0%{transform:scale(0.8) translateY(30px);opacity:0}'
      + '  100%{transform:scale(1) translateY(0);opacity:1}'
      + '}'

      // ===== CAMADAS DE BRILHO (simulando Group 11785) =====
      + '.at-disney-glow-layer {'
      + '  position:absolute; width:548px; height:548px; pointer-events:none;'
      + '  background:radial-gradient(ellipse at center, rgba(100,180,255,0.15) 0%, rgba(50,130,255,0.08) 30%, transparent 70%);'
      + '  mix-blend-mode:screen;'
      + '}'
      + '.at-disney-glow-1 {'
      + '  top:-300px; left:-200px; transform:rotate(164.96deg);'
      + '}'
      + '.at-disney-glow-2 {'
      + '  top:-100px; left:-150px; transform:rotate(-120deg);'
      + '}'
      + '.at-disney-glow-3 {'
      + '  top:-280px; right:-300px; transform:rotate(45deg);'
      + '}'

      // ===== BRILHOS PONTUAIS (simulando BRILHO copy) =====
      + '.at-disney-lens-flare {'
      + '  position:absolute; pointer-events:none; mix-blend-mode:screen;'
      + '  background:radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(200,230,255,0.15) 30%, transparent 60%);'
      + '}'
      + '.at-disney-lens-1 { width:160px; height:105px; left:390px; top:149px; }'
      + '.at-disney-lens-2 { width:150px; height:98px; right:-20px; bottom:80px; transform:rotate(-4.52deg); }'
      + '.at-disney-lens-3 { width:120px; height:80px; right:-50px; top:-20px; transform:rotate(90deg); }'
      + '.at-disney-lens-4 { width:100px; height:70px; left:-30px; bottom:10px; transform:rotate(-75deg); }'

      // ===== ESTRELINHAS PISCANDO =====
      + '.at-disney-banner-sparkle-layer {'
      + '  position:absolute; top:0; left:0; width:100%; height:100%;'
      + '  pointer-events:none; overflow:hidden; z-index:2;'
      + '}'
      + '.at-disney-banner-shine {'
      + '  position:absolute; width:3px; height:3px; background:#fff;'
      + '  border-radius:50%; opacity:0;'
      + '  box-shadow:0 0 6px 2px rgba(255,255,255,0.6);'
      + '  animation:atDisneyBannerTwinkle 2s ease-in-out infinite;'
      + '}'
      + '@keyframes atDisneyBannerTwinkle {'
      + '  0%,100%{opacity:0;transform:scale(0.5)}'
      + '  50%{opacity:1;transform:scale(1.2)}'
      + '}'

      // ===== TITULO (canto esquerdo topo) =====
      + '.at-disney-txt {'
      + '  position:absolute; width:285px; height:90px;'
      + '  left:calc(50% - 285px/2 - 138.5px); top:42px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:26px; line-height:30px;'
      + '  letter-spacing:-0.025em; color:#FFFFFF; z-index:5;'
      + '}'

      // ===== LOGOS (direita topo) =====
      + '.at-disney-logos {'
      + '  position:absolute; display:flex; align-items:center; gap:9px;'
      + '  width:200px; height:26px;'
      + '  left:calc(50% - 200px/2 + 168px); top:67px; z-index:5;'
      + '}'
      + '.at-disney-logos-divider {'
      + '  width:0; height:26px; border-left:0.6px solid #FFFFFF;'
      + '  flex:none;'
      + '}'

      // ===== FAIXA BRANCA =====
      + '.at-disney-strip {'
      + '  position:absolute; width:311px; height:32px;'
      + '  left:79px; top:152px;'
      + '  background:#FFFFFF; border-radius:20px;'
      + '  display:flex; align-items:center; justify-content:center;'
      + '  z-index:5;'
      + '}'
      + '.at-disney-strip span {'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:300; font-size:18px; line-height:100%;'
      + '  letter-spacing:-0.02em; color:#0061A0; text-align:center;'
      + '}'

      // ===== FRAME OFERTA (borda branca) =====
      + '.at-disney-offer-frame {'
      + '  position:absolute; box-sizing:border-box;'
      + '  width:311px; height:183px;'
      + '  left:calc(50% - 311px/2 - 125.5px); top:194px;'
      + '  border:1px solid #FFFFFF; border-radius:20px;'
      + '  z-index:5;'
      + '}'

      // ===== TEXTOS DENTRO DO FRAME =====
      + '.at-disney-offer-pacotes {'
      + '  position:absolute; left:20px; top:14px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:20px; line-height:120%; color:#FFFFFF;'
      + '  white-space:nowrap;'
      + '}'
      + '.at-disney-offer-aereo {'
      + '  position:absolute; left:116px; top:16px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:300; font-size:16px; line-height:120%; color:#FFFFFF;'
      + '  white-space:nowrap;'
      + '}'
      + '.at-disney-offer-20 {'
      + '  position:absolute; left:20px; top:62px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:90px; line-height:100%; color:#FFFFFF;'
      + '}'
      + '.at-disney-offer-percent {'
      + '  position:absolute; left:135px; top:62px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:45px; line-height:100%; color:#FFFFFF;'
      + '}'
      + '.at-disney-offer-off {'
      + '  position:absolute; left:135px; top:102px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:36px; line-height:100%; letter-spacing:-0.05em; color:#FFFFFF;'
      + '}'

      // ===== CONSULTE CONDICOES (lateral esquerda do frame) =====
      + '.at-disney-consult {'
      + '  position:absolute; white-space:nowrap;'
      + '  left:40px; top:300px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:400; font-size:10px; line-height:120%; color:#FFFFFF;'
      + '  transform:rotate(-90deg); transform-origin:left bottom;'
      + '  z-index:5;'
      + '}'

      // ===== FOTO PERSONAGEM (circulo) =====
      + '.at-disney-photo-wrapper {'
      + '  position:absolute; width:224px; height:224px;'
      + '  left:416px; top:141px; z-index:4;'
      + '}'
      + '.at-disney-photo-circle {'
      + '  width:224px; height:224px; border-radius:50%; overflow:hidden;'
      + '  background:linear-gradient(180deg, #1a6dd4 0%, #0a4da0 100%);'
      + '}'
      + '.at-disney-photo-circle img {'
      + '  width:100%; height:100%; object-fit:cover;'
      + '}'
      + '.at-disney-photo-gradient {'
      + '  position:absolute; bottom:0; left:0; width:100%; height:40%;'
      + '  background:linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%);'
      + '  border-radius:0 0 112px 112px;'
      + '}'

      // ===== COPYRIGHT =====
      + '.at-disney-copyright {'
      + '  position:absolute; left:505px; top:347px;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:400; font-size:7px; line-height:7px;'
      + '  color:#FFFFFF; z-index:5; text-align:center;'
      + '}'

      // ===== CUPOM =====
      + '.at-disney-coupon {'
      + '  position:absolute; width:309px; height:43px;'
      + '  left:81px; top:387px;'
      + '  background:#0061A0; border-radius:10px;'
      + '  display:flex; align-items:center; justify-content:center; gap:10px;'
      + '  z-index:5;'
      + '}'
      + '.at-disney-coupon-code {'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:22px; line-height:120%; color:#FFFFFF;'
      + '}'
      + '.at-disney-coupon { cursor:pointer; transition:background 0.2s ease; }'
      + '.at-disney-coupon:hover { background:#004F85; }'

      // ===== TOAST COPIADO =====
      + '.at-disney-toast {'
      + '  position:absolute; left:81px; top:360px;'
      + '  background:rgba(0,0,0,0.8); color:#5EDCFF; border-radius:8px;'
      + '  padding:4px 14px; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:600; font-size:13px; z-index:15; opacity:0;'
      + '  transition:opacity 0.3s ease; pointer-events:none; white-space:nowrap;'
      + '}'
      + '.at-disney-toast.at-disney-toast-show { opacity:1; }'

      // ===== CTA PULSE =====
      + '@keyframes atDisneyCTAPulse {'
      + '  0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0.25)}'
      + '  50%{transform:scale(1.02);box-shadow:0 0 10px 3px rgba(255,255,255,0.25)}'
      + '  100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0)}'
      + '}'
      + '.at-disney-cta-pulse { animation:atDisneyCTAPulse 0.9s ease-out 2; }'

      // ===== CTA =====
      + '.at-disney-cta {'
      + '  position:absolute; width:199px; height:43px;'
      + '  left:calc(50% - 199px/2 + 180.5px); top:387px;'
      + '  background:#FFFFFF; border-radius:27px; border:none;'
      + '  cursor:pointer; z-index:5;'
      + '  display:flex; align-items:center; justify-content:center;'
      + '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;'
      + '  font-weight:700; font-size:18px; color:#0061A0;'
      + '  transition:transform 0.2s ease, box-shadow 0.2s ease;'
      + '}'
      + '.at-disney-cta:hover {'
      + '  transform:translateY(-2px);'
      + '  box-shadow:0 4px 20px rgba(255,255,255,0.3);'
      + '}'

      // ===== BOTAO FECHAR =====
      + '.at-disney-banner-close {'
      + '  position:absolute; top:12px; right:12px; width:32px; height:32px;'
      + '  background:rgba(255,255,255,0.15); border:none; border-radius:50%;'
      + '  cursor:pointer; display:flex; align-items:center; justify-content:center;'
      + '  z-index:10; transition:background 0.2s ease;'
      + '}'
      + '.at-disney-banner-close:hover { background:rgba(255,255,255,0.3); }'
      + '.at-disney-banner-close svg { width:14px; height:14px; }'

      // ===== RESPONSIVO MOBILE =====
      + '@media (max-width: 768px) {'
      // Container principal mobile 360x532
      + '  .at-disney-banner-container {'
      + '    width:360px; height:532px; border-radius:16px;'
      + '    transform:none;'
      + '  }'
      // Camadas de brilho mobile
      + '  .at-disney-glow-1 { top:-962px; left:-195%; right:146%; }'
      + '  .at-disney-glow-2 { top:174px; left:-94%; right:45%; transform:rotate(-120deg); }'
      + '  .at-disney-glow-3 { top:-566px; left:46%; right:-95%; transform:rotate(45deg); }'
      // Lens flares mobile
      + '  .at-disney-lens-1 { width:159px; height:105px; left:390px; top:149px; }'
      + '  .at-disney-lens-2 { width:150px; height:98px; left:509px; top:267px; transform:rotate(-4.52deg); }'
      + '  .at-disney-lens-3 { width:auto; left:79%; right:-14%; top:-5%; bottom:80%; transform:rotate(90deg); }'
      + '  .at-disney-lens-4 { left:-26%; right:90%; top:79%; bottom:-5%; transform:matrix(0.35,-0.94,0.98,0.19,0,0); }'
      // Titulo mobile
      + '  .at-disney-txt {'
      + '    width:285px; height:90px; left:20px; top:43px;'
      + '    font-size:26px; line-height:30px;'
      + '  }'
      // Logos mobile - reposicionados abaixo do titulo
      + '  .at-disney-logos {'
      + '    width:200px; height:26px; left:20px; top:11px;'
      + '    gap:8.93px;'
      + '  }'
      // Faixa branca mobile
      + '  .at-disney-strip {'
      + '    width:319px; height:32px; left:20px; top:148px;'
      + '  }'
      + '  .at-disney-strip span { font-size:18px; }'
      // Frame oferta mobile
      + '  .at-disney-offer-frame {'
      + '    width:319px; height:183px; left:20px; top:196px;'
      + '    border-radius:20px;'
      + '  }'
      // Textos oferta mobile - centralizados no frame
      + '  .at-disney-offer-pacotes {'
      + '    left:31px; top:14px; font-size:20px;'
      + '  }'
      + '  .at-disney-offer-aereo {'
      + '    left:132px; top:16px; font-size:16px;'
      + '  }'
      + '  .at-disney-offer-20 {'
      + '    left:31px; top:55px; font-size:128px;'
      + '  }'
      + '  .at-disney-offer-percent {'
      + '    left:182px; top:55px; font-size:65px;'
      + '  }'
      + '  .at-disney-offer-off {'
      + '    left:182px; top:110px; font-size:42px;'
      + '  }'
      // Consulte condicoes mobile - alinhado a esquerda do 20, centralizado com o 2
      + '  .at-disney-consult {'
      + '    width:96px; height:12px; left:28px; top:330px;'
      + '    font-size:10px; transform:rotate(-90deg); transform-origin:left top;'
      + '  }'
      // Foto personagem mobile - oculta
      + '  .at-disney-photo-wrapper { display:none; }'
      // Copyright mobile
      + '  .at-disney-copyright {'
      + '    left:260px; top:347px; font-size:7px;'
      + '  }'
      // Cupom mobile - centralizado e menor
      + '  .at-disney-coupon {'
      + '    width:272px; height:43px; left:44px; top:395px;'
      + '    border-radius:10px;'
      + '  }'
      + '  .at-disney-coupon-code { font-size:21px; }'
      // Toast mobile
      + '  .at-disney-toast { left:44px; top:368px; }'
      // CTA mobile - largura total
      + '  .at-disney-cta {'
      + '    width:319px; height:43px; left:20px; top:454px;'
      + '    font-size:18px; border-radius:27px;'
      + '  }'
      + '}'
      // Extra small mobile
      + '@media (max-width: 374px) {'
      + '  .at-disney-banner-container { width:95vw; height:auto; min-height:500px; }'
      + '  .at-disney-txt { width:90%; left:5%; }'
      + '  .at-disney-strip { width:calc(100% - 20px); left:10px; }'
      + '  .at-disney-offer-frame { width:calc(100% - 20px); left:10px; }'
      + '  .at-disney-coupon { width:calc(100% - 40px); left:20px; }'
      + '  .at-disney-cta { width:calc(100% - 20px); left:10px; }'
      + '  .at-disney-photo-wrapper { left:auto; right:-40px; }'
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
    setTimeout(function () { requestAnimationFrame(animate); }, 600);
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

  // === BANNER CAMPANHA DISNEY ===

  function createBanner() {
    var existing = document.getElementById(BANNER_ID);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var bannerOverlay = document.createElement('div');
    bannerOverlay.id = BANNER_ID;

    // Container principal 720x467
    var container = document.createElement('div');
    container.className = 'at-disney-banner-container';

    // --- Camadas de brilho decorativas (Group 11785) ---
    var g1 = document.createElement('div');
    g1.className = 'at-disney-glow-layer at-disney-glow-1';
    container.appendChild(g1);

    var g2 = document.createElement('div');
    g2.className = 'at-disney-glow-layer at-disney-glow-2';
    container.appendChild(g2);

    var g3 = document.createElement('div');
    g3.className = 'at-disney-glow-layer at-disney-glow-3';
    container.appendChild(g3);

    // --- Lens flares / brilhos pontuais ---
    var lf1 = document.createElement('div');
    lf1.className = 'at-disney-lens-flare at-disney-lens-1';
    container.appendChild(lf1);

    var lf2 = document.createElement('div');
    lf2.className = 'at-disney-lens-flare at-disney-lens-2';
    container.appendChild(lf2);

    var lf3 = document.createElement('div');
    lf3.className = 'at-disney-lens-flare at-disney-lens-3';
    container.appendChild(lf3);

    var lf4 = document.createElement('div');
    lf4.className = 'at-disney-lens-flare at-disney-lens-4';
    container.appendChild(lf4);

    // --- Estrelinhas piscando ---
    var sparkleLayer = document.createElement('div');
    sparkleLayer.className = 'at-disney-banner-sparkle-layer';
    for (var i = 0; i < 20; i++) {
      var sh = document.createElement('div');
      sh.className = 'at-disney-banner-shine';
      sh.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;'
        + 'animation-delay:' + (Math.random() * 3) + 's;animation-duration:' + (1.5 + Math.random() * 2) + 's;';
      sparkleLayer.appendChild(sh);
    }
    container.appendChild(sparkleLayer);

    // --- Botao fechar ---
    var closeBtn = document.createElement('button');
    closeBtn.className = 'at-disney-banner-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M1 1L13 13M13 1L1 13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    container.appendChild(closeBtn);

    // --- Titulo (esquerda, topo) ---
    var txt = document.createElement('div');
    txt.className = 'at-disney-txt';
    txt.textContent = 'Realize o sonho de conhecer a Disney!';
    container.appendChild(txt);

    // --- Logos Azul Viagens | Disney Destinations (direita, topo) ---
    var logos = document.createElement('div');
    logos.className = 'at-disney-logos';

    var logoAzul = document.createElement('div');
    logoAzul.innerHTML = '<svg width="48" height="26" viewBox="0 0 48 26" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<text x="0" y="18" font-family="Helvetica Neue,Arial,sans-serif" font-weight="700" font-size="10" fill="#FFFFFF">Azul</text>'
      + '<text x="0" y="25" font-family="Helvetica Neue,Arial,sans-serif" font-weight="400" font-size="7" fill="#FFFFFF">Viagens</text>'
      + '</svg>';
    logos.appendChild(logoAzul);

    var logoDivider = document.createElement('div');
    logoDivider.className = 'at-disney-logos-divider';
    logos.appendChild(logoDivider);

    var logoDisney = document.createElement('div');
    logoDisney.innerHTML = '<img src="https://i.imgur.com/1CwQhAX.png" alt="Disney Destinations" style="display:block;width:118px;height:17px;object-fit:contain;"/>';
    logos.appendChild(logoDisney);
    container.appendChild(logos);

    // --- Faixa branca ---
    var strip = document.createElement('div');
    strip.className = 'at-disney-strip';
    var stripSpan = document.createElement('span');
    stripSpan.textContent = 'S\u00F3 na Semana do Consumidor:';
    strip.appendChild(stripSpan);
    container.appendChild(strip);

    // --- Frame oferta com borda ---
    var offerFrame = document.createElement('div');
    offerFrame.className = 'at-disney-offer-frame';

    var ofPacotes = document.createElement('div');
    ofPacotes.className = 'at-disney-offer-pacotes';
    ofPacotes.textContent = 'Pacotes';
    offerFrame.appendChild(ofPacotes);

    var ofAereo = document.createElement('div');
    ofAereo.className = 'at-disney-offer-aereo';
    ofAereo.textContent = '(a\u00E9reo + hotel) com';
    offerFrame.appendChild(ofAereo);

    var of20 = document.createElement('div');
    of20.className = 'at-disney-offer-20';
    of20.textContent = '20';
    offerFrame.appendChild(of20);

    var ofPercent = document.createElement('div');
    ofPercent.className = 'at-disney-offer-percent';
    ofPercent.textContent = '%';
    offerFrame.appendChild(ofPercent);

    var ofOff = document.createElement('div');
    ofOff.className = 'at-disney-offer-off';
    ofOff.textContent = 'OFF';
    offerFrame.appendChild(ofOff);

    container.appendChild(offerFrame);

    // --- Consulte condicoes (rotacionado) ---
    var consult = document.createElement('div');
    consult.className = 'at-disney-consult';
    consult.textContent = '*Consulte condi\u00E7\u00F5es.';
    container.appendChild(consult);

    // --- Foto personagem (circulo) ---
    var photoWrap = document.createElement('div');
    photoWrap.className = 'at-disney-photo-wrapper';

    var photoCircle = document.createElement('div');
    photoCircle.className = 'at-disney-photo-circle';
    var photoImg = document.createElement('img');
    photoImg.src = 'https://i.imgur.com/UlWopVx.png';
    photoImg.alt = 'Disney';
    photoCircle.appendChild(photoImg);
    photoWrap.appendChild(photoCircle);

    var photoGrad = document.createElement('div');
    photoGrad.className = 'at-disney-photo-gradient';
    photoWrap.appendChild(photoGrad);
    container.appendChild(photoWrap);

    // --- Copyright ---
    var copy = document.createElement('div');
    copy.className = 'at-disney-copyright';
    copy.textContent = '\u00A9 2026 Disney';
    container.appendChild(copy);

    // --- Cupom (esquerda, rodape) ---
    var coupon = document.createElement('div');
    coupon.className = 'at-disney-coupon';

    var couponIcon = document.createElement('div');
    couponIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1Z" fill="#FFFFFF"/>'
      + '<path d="M19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="#FFFFFF"/>'
      + '</svg>';
    coupon.appendChild(couponIcon);

    var couponCode = document.createElement('span');
    couponCode.className = 'at-disney-coupon-code';
    couponCode.textContent = 'CONSUMIDOR20';
    coupon.appendChild(couponCode);
    container.appendChild(coupon);

    // --- Toast "Cod copiado" ---
    var toast = document.createElement('div');
    toast.className = 'at-disney-toast';
    toast.textContent = 'C\u00F3d copiado!';
    container.appendChild(toast);

    // --- CTA (direita, rodape) ---
    var cta = document.createElement('button');
    cta.className = 'at-disney-cta';
    cta.textContent = 'Eu quero!';
    container.appendChild(cta);

    // Monta tudo
    bannerOverlay.appendChild(container);
    document.body.appendChild(bannerOverlay);

    requestAnimationFrame(function () {
      bannerOverlay.classList.add('at-disney-banner-visible');
    });

    // Tracking
    analyticsEvent('banner_disney_campanha', 'view');

    // Eventos
    cta.addEventListener('click', function (e) {
      e.stopPropagation();
      analyticsEvent('banner_disney_cta', 'click');
      window.location.href = BANNER_LINK;
    });

    coupon.addEventListener('click', function (e) {
      e.stopPropagation();
      var code = 'CONSUMIDOR20';
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
      toast.classList.add('at-disney-toast-show');
      setTimeout(function () { toast.classList.remove('at-disney-toast-show'); }, 2000);
      cta.classList.remove('at-disney-cta-pulse');
      void cta.offsetWidth;
      cta.classList.add('at-disney-cta-pulse');
      analyticsEvent('banner_disney_cupom_copiado', 'click');
    });

    container.addEventListener('click', function (e) {
      if (e.target === closeBtn || closeBtn.contains(e.target)) return;
      if (e.target === cta) return;
      if (coupon.contains(e.target)) return;
      e.stopPropagation();
      analyticsEvent('banner_disney_container', 'click');
      window.location.href = BANNER_LINK;
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      analyticsEvent('banner_disney_fechar', 'click');
      closeBanner(bannerOverlay);
    });

    bannerOverlay.addEventListener('click', function (e) {
      if (e.target === bannerOverlay) {
        analyticsEvent('banner_disney_overlay_fechar', 'click');
        closeBanner(bannerOverlay);
      }
    });

    var handleEsc = function (e) {
      if (e.key === 'Escape') {
        analyticsEvent('banner_disney_esc_fechar', 'click');
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
  console.log('[Disney] Iniciando animacao Disney (modo teste console).');
  injectStyles();
  createShootingStarAnimation(function () {
    createBanner();
  });
})();