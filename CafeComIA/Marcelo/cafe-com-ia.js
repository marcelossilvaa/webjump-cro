(function () {
  'use strict';

  /* ===== CONFIGURACOES ===== */
  var STYLE_ID = 'hogwarts-promo-style';
  var MODAL_ID = 'hogwarts-promo-modal';
  var BACKDROP_ID = 'hogwarts-promo-backdrop';
  var SPELL_ID = 'hogwarts-spell-overlay';
  var FAB_ID = 'hogwarts-fab-button';
  var ACTIVITY_NAME = 'AT_HogwartsPromo';
  var CUPOM = 'CONSUMIDOR20';
  var CTA_LINK = 'https://www.voeazul.com.br/br/pt/viagem-completa/universal';
  var LOGO_AZUL = 'https://i.imgur.com/BdxFnun.png';
  var LOGO_UNIVERSAL = 'https://i.imgur.com/rF0NNXS.png';
  var LOGO_PARQUE = 'https://i.imgur.com/sgL9x6k.png';
  var IMG_CIRCULAR = 'https://i.imgur.com/gpsv57K.png';
  var FAB_IMG = 'https://i.imgur.com/KX4PM17.png';
  var SPELL_DURATION = 2800;
  var MAX_RETRIES = 20;
  var RETRY_INTERVAL = 250;

  /* ===== TRACKING ADOBE ===== */
  function analyticsEvent(eventLabel) {
    if (!eventLabel) return;
    var labelEvent = ACTIVITY_NAME + '_' + eventLabel;
    console.log('[Tracking Hogwarts] Analytics event triggered:', labelEvent);
    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_hogwarts_promo';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  /* ===== INJECAO DE CSS ===== */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      /* ----- Spell overlay ----- */
      '#' + SPELL_ID + ' {',
      '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
      '  z-index: 2147483646; background: #000; display: flex;',
      '  align-items: center; justify-content: center; overflow: hidden;',
      '}',

      /* Fumaca de fundo */
      '#' + SPELL_ID + ' .hp-smoke {',
      '  position: absolute; border-radius: 50%; filter: blur(60px);',
      '  opacity: 0; animation: hpSmokeFloat 3s ease-in-out infinite;',
      '}',
      '#' + SPELL_ID + ' .hp-smoke--1 {',
      '  width: 300px; height: 300px; background: rgba(20,60,120,0.25);',
      '  top: 30%; left: 20%; animation-delay: 0s;',
      '}',
      '#' + SPELL_ID + ' .hp-smoke--2 {',
      '  width: 400px; height: 400px; background: rgba(10,40,100,0.2);',
      '  top: 50%; left: 60%; animation-delay: 0.8s;',
      '}',
      '#' + SPELL_ID + ' .hp-smoke--3 {',
      '  width: 250px; height: 250px; background: rgba(30,70,140,0.18);',
      '  top: 10%; left: 70%; animation-delay: 1.5s;',
      '}',
      '@keyframes hpSmokeFloat {',
      '  0% { opacity: 0; transform: scale(0.8) translate(0,0); }',
      '  30% { opacity: 1; }',
      '  70% { opacity: 0.7; }',
      '  100% { opacity: 0; transform: scale(1.4) translate(30px,-20px); }',
      '}',

      /* Nucleo do feitico */
      '#' + SPELL_ID + ' .hp-core {',
      '  position: relative; width: 20px; height: 20px; border-radius: 50%;',
      '  background: radial-gradient(circle, #fff 0%, #a0c4ff 40%, #3a7bd5 70%, transparent 100%);',
      '  box-shadow: 0 0 30px 15px rgba(58,123,213,0.6), 0 0 80px 40px rgba(58,123,213,0.3);',
      '  animation: hpCorePulse 0.6s ease-in-out infinite alternate;',
      '}',
      '@keyframes hpCorePulse {',
      '  0% { transform: scale(1); box-shadow: 0 0 30px 15px rgba(58,123,213,0.6), 0 0 80px 40px rgba(58,123,213,0.3); }',
      '  100% { transform: scale(1.3); box-shadow: 0 0 50px 25px rgba(58,123,213,0.8), 0 0 120px 60px rgba(58,123,213,0.4); }',
      '}',

      /* Anel giratorio */
      '#' + SPELL_ID + ' .hp-ring {',
      '  position: absolute; top: 50%; left: 50%; width: 120px; height: 120px;',
      '  margin: -60px 0 0 -60px; border-radius: 50%;',
      '  border: 2px solid rgba(100,160,255,0.4);',
      '  box-shadow: 0 0 20px rgba(58,123,213,0.3), inset 0 0 20px rgba(58,123,213,0.15);',
      '  animation: hpRingSpin 2s linear infinite;',
      '}',
      '#' + SPELL_ID + ' .hp-ring--2 {',
      '  width: 180px; height: 180px; margin: -90px 0 0 -90px;',
      '  border-color: rgba(80,140,240,0.25);',
      '  animation-duration: 3s; animation-direction: reverse;',
      '}',
      '@keyframes hpRingSpin {',
      '  0% { transform: rotate(0deg); }',
      '  100% { transform: rotate(360deg); }',
      '}',

      /* Faiscas */
      '#' + SPELL_ID + ' .hp-sparks {',
      '  position: absolute; top: 50%; left: 50%; width: 0; height: 0;',
      '}',
      '#' + SPELL_ID + ' .hp-spark {',
      '  position: absolute; width: 3px; height: 3px; border-radius: 50%;',
      '  background: #a0c4ff;',
      '  box-shadow: 0 0 6px 2px rgba(160,196,255,0.8);',
      '  animation: hpSparkFly 1.2s ease-out infinite;',
      '}',
      '@keyframes hpSparkFly {',
      '  0% { opacity: 1; transform: translate(0,0) scale(1); }',
      '  100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }',
      '}',

      /* Particulas orbitais */
      '#' + SPELL_ID + ' .hp-particle {',
      '  position: absolute; width: 4px; height: 4px; border-radius: 50%;',
      '  background: rgba(180,210,255,0.7);',
      '  box-shadow: 0 0 8px rgba(120,170,255,0.5);',
      '}',

      /* Fade out do feitico */
      '#' + SPELL_ID + '.hp-spell-fadeout {',
      '  animation: hpFadeOut 0.6s ease-out forwards;',
      '}',
      '@keyframes hpFadeOut {',
      '  0% { opacity: 1; }',
      '  100% { opacity: 0; }',
      '}',

      /* ----- Backdrop ----- */
      '#' + BACKDROP_ID + ' {',
      '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
      '  z-index: 2147483645; background: rgba(0,0,0,0.75);',
      '  opacity: 0; transition: opacity 0.4s ease;',
      '}',
      '#' + BACKDROP_ID + '.hp-visible { opacity: 1; }',

      /* ----- Modal ----- */
      '#' + MODAL_ID + ' {',
      '  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9);',
      '  z-index: 2147483647; opacity: 0; transition: opacity 0.5s ease, transform 0.5s ease;',
      '  width: 700px; max-width: 96vw; box-sizing: border-box;',
      '  padding: 4px; background: #0E1215; border-radius: 6px;',
      '  font-family: Inter, Helvetica, Arial, sans-serif;',
      '}',
      '#' + MODAL_ID + '.hp-visible {',
      '  opacity: 1; transform: translate(-50%, -50%) scale(1);',
      '}',

      /* Frame dourado */
      '#' + MODAL_ID + ' .hp-frame-gold {',
      '  padding: 2px; background: #B9A17B; border-radius: 4px;',
      '}',

      /* Frame interno vinho */
      '#' + MODAL_ID + ' .hp-frame-inner {',
      '  padding: 24px; border-radius: 2px;',
      '  background: linear-gradient(250.66deg, #7A202D 0.48%, #721825 50.24%, #68111E 75.12%, #5E0C18 87.56%, #690F1C 93.78%);',
      '  position: relative; overflow: hidden;',
      '}',

      /* Textura sobre o fundo vinho */
      '#' + MODAL_ID + ' .hp-frame-inner::before {',
      '  content: ""; position: absolute; inset: 0;',
      '  background: url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E");',
      '  pointer-events: none; opacity: 0.4;',
      '}',

      /* Header logos */
      '#' + MODAL_ID + ' .hp-header {',
      '  display: flex; justify-content: space-between; align-items: center;',
      '  margin-bottom: 16px; position: relative; z-index: 1;',
      '}',
      '#' + MODAL_ID + ' .hp-logos {',
      '  display: flex; align-items: center; gap: 8px;',
      '}',
      '#' + MODAL_ID + ' .hp-logos img { height: 32px; width: auto; }',
      '#' + MODAL_ID + ' .hp-logos .hp-sep {',
      '  width: 1px; height: 26px; background: rgba(255,255,255,0.5);',
      '}',
      '#' + MODAL_ID + ' .hp-logos .hp-logo-universal { height: 45px; }',

      /* Botao fechar */
      '#' + MODAL_ID + ' .hp-close {',
      '  width: 32px; height: 32px; border-radius: 50%; border: none;',
      '  background: rgba(0,0,0,0.3); color: rgba(255,255,255,0.75);',
      '  font-size: 18px; cursor: pointer; display: flex;',
      '  align-items: center; justify-content: center; line-height: 1;',
      '  transition: background 0.2s;',
      '}',
      '#' + MODAL_ID + ' .hp-close:hover { background: rgba(0,0,0,0.6); }',

      /* Body do modal */
      '#' + MODAL_ID + ' .hp-body {',
      '  display: flex; gap: 44px; position: relative; z-index: 1;',
      '}',

      /* Coluna esquerda - textos */
      '#' + MODAL_ID + ' .hp-col-left {',
      '  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px;',
      '}',
      '#' + MODAL_ID + ' .hp-title {',
      '  font-family: "Noto Rashi Hebrew", Georgia, serif;',
      '  font-size: 32px; line-height: 38px; font-weight: 400;',
      '  color: #D4B976; margin: 0;',
      '}',
      '#' + MODAL_ID + ' .hp-desc {',
      '  font-size: 14px; line-height: 20px; font-weight: 300;',
      '  color: #F1E1C4; margin: 0;',
      '}',

      /* Bloco de oferta */
      '#' + MODAL_ID + ' .hp-offer {',
      '  position: relative; width: 100%; height: 183px;',
      '  border-radius: 20px; overflow: hidden;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-bg {',
      '  position: absolute; inset: 0;',
      '  background: linear-gradient(135deg, #1a0a0e 0%, #2a1015 100%);',
      '  border: 1px solid rgba(186,145,97,0.3); border-radius: 20px;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-content {',
      '  position: relative; z-index: 1; padding: 16px 20px;',
      '  display: flex; flex-direction: column; height: 100%; justify-content: center;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-label {',
      '  font-family: Helvetica, Arial, sans-serif; font-weight: 700;',
      '  font-size: 21px; color: #F1E1C4; line-height: 1.2;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-sub {',
      '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;',
      '  font-weight: 300; font-size: 18px; color: #F1E1C4; line-height: 1.2;',
      '  margin-top: 2px;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-big {',
      '  display: flex; align-items: baseline; gap: 0; margin-top: 4px;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-num {',
      '  font-family: Helvetica, Arial, sans-serif; font-weight: 700;',
      '  font-size: 100px; color: #F1E1C4; line-height: 1;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-pct-wrap {',
      '  display: flex; flex-direction: column; margin-left: 2px;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-pct {',
      '  font-family: Helvetica, Arial, sans-serif; font-weight: 700;',
      '  font-size: 48px; color: #F1E1C4; line-height: 1;',
      '}',
      '#' + MODAL_ID + ' .hp-offer-off {',
      '  font-family: Helvetica, Arial, sans-serif; font-weight: 700;',
      '  font-size: 36px; color: #F1E1C4; line-height: 1; letter-spacing: -0.05em;',
      '}',

      /* Cupom */
      '#' + MODAL_ID + ' .hp-coupon-btn {',
      '  width: 100%; height: 43px; border: none; border-radius: 10px;',
      '  background: #BA9161; cursor: pointer; display: flex;',
      '  align-items: center; justify-content: center; gap: 8px;',
      '  font-family: Helvetica, Arial, sans-serif; font-weight: 700;',
      '  font-size: 21px; color: #211D1D; transition: filter 0.2s;',
      '}',
      '#' + MODAL_ID + ' .hp-coupon-btn:hover { filter: brightness(1.08); }',
      '#' + MODAL_ID + ' .hp-coupon-btn .hp-coupon-icon {',
      '  width: 20px; height: 20px; opacity: 0.7;',
      '}',

      /* Coluna direita - imagem + ticket */
      '#' + MODAL_ID + ' .hp-col-right {',
      '  width: 308px; flex-shrink: 0; display: flex; flex-direction: column;',
      '  align-items: center; position: relative;',
      '}',

      /* Ticket container */
      '#' + MODAL_ID + ' .hp-ticket {',
      '  position: relative; width: 100%; background: #221C1D;',
      '  border-radius: 16px; overflow: visible; padding-bottom: 60px;',
      '}',
      '#' + MODAL_ID + ' .hp-ticket-img-wrap {',
      '  width: 100%; aspect-ratio: 308/248; overflow: hidden;',
      '  border-radius: 16px 16px 0 0; position: relative;',
      '}',
      '#' + MODAL_ID + ' .hp-ticket-img-wrap::before {',
      '  content: ""; position: absolute; inset: 0;',
      '  border: 2px solid #BA9161; border-radius: 16px 16px 0 0;',
      '  pointer-events: none; z-index: 1;',
      '}',
      '#' + MODAL_ID + ' .hp-ticket-img {',
      '  width: 100%; height: 100%; object-fit: cover;',
      '}',

      /* CTA */
      '#' + MODAL_ID + ' .hp-cta {',
      '  display: flex; align-items: center; justify-content: center;',
      '  width: 246px; height: 38px; border-radius: 27px; border: none;',
      '  background: #231D1E; color: #F1E1C4; cursor: pointer;',
      '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;',
      '  font-weight: 700; font-size: 18px; text-decoration: none;',
      '  margin: -19px auto 0; position: relative; z-index: 2;',
      '  transition: filter 0.2s;',
      '}',
      '#' + MODAL_ID + ' .hp-cta:hover { filter: brightness(1.3); }',

      /* Logo parque abaixo do CTA */
      '#' + MODAL_ID + ' .hp-park-logo {',
      '  width: 80px; height: auto; margin-top: 12px;',
      '}',

      /* ----- FAB (botao flutuante) ----- */
      '#' + FAB_ID + ' {',
      '  position: fixed; bottom: 24px; right: 24px; z-index: 2147483640;',
      '  width: 64px; height: 64px; border: none; border-radius: 50%;',
      '  background: none; cursor: pointer; padding: 0;',
      '  animation: hpFabPulse 2s ease-in-out infinite;',
      '  transition: transform 0.2s;',
      '}',
      '#' + FAB_ID + ':hover { transform: scale(1.1); }',
      '#' + FAB_ID + ' img {',
      '  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.4);',
      '}',
      '@keyframes hpFabPulse {',
      '  0%, 100% { box-shadow: 0 0 0 0 rgba(186,145,97,0.5); }',
      '  50% { box-shadow: 0 0 0 10px rgba(186,145,97,0); }',
      '}',

      /* ----- RESPONSIVO ----- */
      '@media (max-width: 740px) {',
      '  #' + MODAL_ID + ' { width: 96vw; }',
      '  #' + MODAL_ID + ' .hp-body { flex-direction: column; gap: 20px; }',
      '  #' + MODAL_ID + ' .hp-col-right { width: 100%; }',
      '  #' + MODAL_ID + ' .hp-title { font-size: 24px; line-height: 30px; }',
      '  #' + MODAL_ID + ' .hp-offer-num { font-size: 72px; }',
      '  #' + MODAL_ID + ' .hp-offer-pct { font-size: 36px; }',
      '  #' + MODAL_ID + ' .hp-offer-off { font-size: 28px; }',
      '  #' + MODAL_ID + ' .hp-frame-inner { padding: 16px; }',
      '}',

      /* Reduced motion */
      '@media (prefers-reduced-motion: reduce) {',
      '  #' + SPELL_ID + ' .hp-smoke,',
      '  #' + SPELL_ID + ' .hp-core,',
      '  #' + SPELL_ID + ' .hp-ring,',
      '  #' + SPELL_ID + ' .hp-spark,',
      '  #' + SPELL_ID + ' .hp-particle,',
      '  #' + FAB_ID + ' { animation: none !important; }',
      '  #' + MODAL_ID + ' { transition: opacity 0.2s ease !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ===== EFEITO DE FEITICO ===== */
  function createSpellEffect(onComplete) {
    if (document.getElementById(SPELL_ID)) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    var overlay = document.createElement('div');
    overlay.id = SPELL_ID;

    /* Fumacas */
    var smoke1 = document.createElement('div');
    smoke1.className = 'hp-smoke hp-smoke--1';
    var smoke2 = document.createElement('div');
    smoke2.className = 'hp-smoke hp-smoke--2';
    var smoke3 = document.createElement('div');
    smoke3.className = 'hp-smoke hp-smoke--3';
    overlay.appendChild(smoke1);
    overlay.appendChild(smoke2);
    overlay.appendChild(smoke3);

    /* Nucleo */
    var core = document.createElement('div');
    core.className = 'hp-core';
    overlay.appendChild(core);

    /* Aneis */
    var ring1 = document.createElement('div');
    ring1.className = 'hp-ring';
    overlay.appendChild(ring1);
    var ring2 = document.createElement('div');
    ring2.className = 'hp-ring hp-ring--2';
    overlay.appendChild(ring2);

    /* Faiscas */
    var sparksContainer = document.createElement('div');
    sparksContainer.className = 'hp-sparks';
    var sparkCount = 12;
    for (var i = 0; i < sparkCount; i++) {
      var spark = document.createElement('div');
      spark.className = 'hp-spark';
      var angle = (360 / sparkCount) * i;
      var dist = 60 + Math.random() * 80;
      var sx = Math.cos(angle * Math.PI / 180) * dist;
      var sy = Math.sin(angle * Math.PI / 180) * dist;
      spark.style.setProperty('--sx', sx + 'px');
      spark.style.setProperty('--sy', sy + 'px');
      spark.style.animationDelay = (Math.random() * 1) + 's';
      spark.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      sparksContainer.appendChild(spark);
    }
    overlay.appendChild(sparksContainer);

    /* Particulas orbitais animadas via JS */
    var particleCount = 8;
    var particles = [];
    for (var p = 0; p < particleCount; p++) {
      var particle = document.createElement('div');
      particle.className = 'hp-particle';
      particle.style.position = 'absolute';
      particle.style.top = '50%';
      particle.style.left = '50%';
      overlay.appendChild(particle);
      particles.push({
        el: particle,
        angle: (360 / particleCount) * p,
        radius: 40 + Math.random() * 60,
        speed: 0.8 + Math.random() * 1.2
      });
    }

    document.body.appendChild(overlay);

    /* Animacao de particulas */
    var startTime = Date.now();
    var animFrame;
    function animateParticles() {
      var elapsed = (Date.now() - startTime) / 1000;
      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        var currentAngle = pt.angle + elapsed * pt.speed * 120;
        var x = Math.cos(currentAngle * Math.PI / 180) * pt.radius;
        var y = Math.sin(currentAngle * Math.PI / 180) * pt.radius;
        pt.el.style.transform = 'translate(' + (x - 2) + 'px, ' + (y - 2) + 'px)';
        pt.el.style.opacity = String(0.4 + 0.6 * Math.abs(Math.sin(elapsed * 2 + j)));
      }
      animFrame = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* Encerrar feitico apos duracao */
    setTimeout(function () {
      cancelAnimationFrame(animFrame);
      overlay.classList.add('hp-spell-fadeout');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (typeof onComplete === 'function') onComplete();
      }, 600);
    }, SPELL_DURATION);
  }

  /* ===== CONSTRUCAO DO MODAL ===== */
  function buildModal() {
    if (document.getElementById(MODAL_ID)) return;

    /* Backdrop */
    var backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    document.body.appendChild(backdrop);

    /* Modal */
    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Promocao Hogwarts');

    /* Frame dourado */
    var frameGold = document.createElement('div');
    frameGold.className = 'hp-frame-gold';

    /* Frame interno */
    var frameInner = document.createElement('div');
    frameInner.className = 'hp-frame-inner';

    /* Header */
    var header = document.createElement('div');
    header.className = 'hp-header';

    var logos = document.createElement('div');
    logos.className = 'hp-logos';
    var logoAzul = document.createElement('img');
    logoAzul.src = LOGO_AZUL;
    logoAzul.alt = 'Azul Viagens';
    var sep = document.createElement('div');
    sep.className = 'hp-sep';
    var logoUniv = document.createElement('img');
    logoUniv.src = LOGO_UNIVERSAL;
    logoUniv.alt = 'Universal';
    logoUniv.className = 'hp-logo-universal';
    logos.appendChild(logoAzul);
    logos.appendChild(sep);
    logos.appendChild(logoUniv);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'hp-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '&#10005;';

    header.appendChild(logos);
    header.appendChild(closeBtn);

    /* Body */
    var body = document.createElement('div');
    body.className = 'hp-body';

    /* Coluna esquerda */
    var colLeft = document.createElement('div');
    colLeft.className = 'hp-col-left';

    var title = document.createElement('h2');
    title.className = 'hp-title';
    title.textContent = 'Embarque nessa viagem magica';

    var desc = document.createElement('p');
    desc.className = 'hp-desc';
    desc.textContent = 'Passagens para Orlando e Los Angeles. Seu sonho no Expresso de Hogwarts comeca aqui!';

    /* Bloco de oferta */
    var offer = document.createElement('div');
    offer.className = 'hp-offer';
    var offerBg = document.createElement('div');
    offerBg.className = 'hp-offer-bg';
    var offerContent = document.createElement('div');
    offerContent.className = 'hp-offer-content';

    var offerLabel = document.createElement('div');
    offerLabel.className = 'hp-offer-label';
    offerLabel.textContent = 'Pacotes';

    var offerSub = document.createElement('div');
    offerSub.className = 'hp-offer-sub';
    offerSub.textContent = '(aereo + hotel) com';

    var offerBig = document.createElement('div');
    offerBig.className = 'hp-offer-big';
    var offerNum = document.createElement('span');
    offerNum.className = 'hp-offer-num';
    offerNum.textContent = '20';
    var pctWrap = document.createElement('div');
    pctWrap.className = 'hp-offer-pct-wrap';
    var offerPct = document.createElement('span');
    offerPct.className = 'hp-offer-pct';
    offerPct.textContent = '%';
    var offerOff = document.createElement('span');
    offerOff.className = 'hp-offer-off';
    offerOff.textContent = 'OFF';
    pctWrap.appendChild(offerPct);
    pctWrap.appendChild(offerOff);
    offerBig.appendChild(offerNum);
    offerBig.appendChild(pctWrap);

    offerContent.appendChild(offerLabel);
    offerContent.appendChild(offerSub);
    offerContent.appendChild(offerBig);
    offer.appendChild(offerBg);
    offer.appendChild(offerContent);

    /* Cupom */
    var couponBtn = document.createElement('button');
    couponBtn.className = 'hp-coupon-btn';
    couponBtn.setAttribute('data-coupon', CUPOM);

    var couponIcon = document.createElement('span');
    couponIcon.className = 'hp-coupon-icon';
    couponIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#211D1D" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

    var couponText = document.createElement('span');
    couponText.className = 'hp-coupon-text';
    couponText.textContent = CUPOM;

    couponBtn.appendChild(couponIcon);
    couponBtn.appendChild(couponText);

    colLeft.appendChild(title);
    colLeft.appendChild(desc);
    colLeft.appendChild(offer);
    colLeft.appendChild(couponBtn);

    /* Coluna direita */
    var colRight = document.createElement('div');
    colRight.className = 'hp-col-right';

    var ticket = document.createElement('div');
    ticket.className = 'hp-ticket';
    var ticketImgWrap = document.createElement('div');
    ticketImgWrap.className = 'hp-ticket-img-wrap';
    var ticketImg = document.createElement('img');
    ticketImg.className = 'hp-ticket-img';
    ticketImg.src = IMG_CIRCULAR;
    ticketImg.alt = 'Hogwarts - Universal';
    ticketImgWrap.appendChild(ticketImg);
    ticket.appendChild(ticketImgWrap);

    var cta = document.createElement('a');
    cta.className = 'hp-cta';
    cta.href = CTA_LINK;
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.textContent = 'Eu quero';

    var parkLogo = document.createElement('img');
    parkLogo.className = 'hp-park-logo';
    parkLogo.src = LOGO_PARQUE;
    parkLogo.alt = 'Wizarding World';

    colRight.appendChild(ticket);
    colRight.appendChild(cta);
    colRight.appendChild(parkLogo);

    body.appendChild(colLeft);
    body.appendChild(colRight);

    frameInner.appendChild(header);
    frameInner.appendChild(body);
    frameGold.appendChild(frameInner);
    modal.appendChild(frameGold);

    document.body.appendChild(modal);

    /* Mostrar com animacao */
    requestAnimationFrame(function () {
      backdrop.classList.add('hp-visible');
      modal.classList.add('hp-visible');
    });

    /* Tracking: visualizacao */
    analyticsEvent('visualizacao_modal');

    /* ----- EVENTOS ----- */
    /* Fechar modal */
    function closeModal(trackLabel) {
      modal.classList.remove('hp-visible');
      backdrop.classList.remove('hp-visible');
      setTimeout(function () {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        showFab();
      }, 500);
      if (trackLabel) analyticsEvent(trackLabel);
    }

    closeBtn.addEventListener('click', function () {
      closeModal('clique_fechar');
    });

    backdrop.addEventListener('click', function () {
      closeModal('clique_fora_fechar');
    });

    /* CTA */
    if (!cta.hasAttribute('data-analytics-added')) {
      cta.setAttribute('data-analytics-added', 'true');
      cta.addEventListener('click', function () {
        analyticsEvent('clique_cta_eu_quero');
      });
    }

    /* Cupom: copiar */
    if (!couponBtn.hasAttribute('data-analytics-added')) {
      couponBtn.setAttribute('data-analytics-added', 'true');
      couponBtn.addEventListener('click', function () {
        var cupom = couponBtn.getAttribute('data-coupon');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(cupom).then(function () {
            showCopied(couponText);
          }).catch(function () {
            fallbackCopy(cupom, couponText);
          });
        } else {
          fallbackCopy(cupom, couponText);
        }
        analyticsEvent('copia_cupom');
      });
    }
  }

  /* Fallback para copiar cupom */
  function fallbackCopy(text, labelEl) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* silencioso */ }
    document.body.removeChild(ta);
    showCopied(labelEl);
  }

  function showCopied(labelEl) {
    var original = CUPOM;
    labelEl.textContent = 'Cod. Copiado';
    setTimeout(function () {
      labelEl.textContent = original;
    }, 2000);
  }

  /* ===== BOTAO FLUTUANTE (FAB) ===== */
  function showFab() {
    if (document.getElementById(FAB_ID)) return;
    var fab = document.createElement('button');
    fab.id = FAB_ID;
    fab.setAttribute('aria-label', 'Abrir promocao Hogwarts');
    var fabImg = document.createElement('img');
    fabImg.src = FAB_IMG;
    fabImg.alt = 'Hogwarts';
    fab.appendChild(fabImg);
    document.body.appendChild(fab);

    fab.addEventListener('click', function () {
      if (fab.parentNode) fab.parentNode.removeChild(fab);
      buildModal();
    });
  }

  /* ===== INICIALIZACAO ===== */
  var retryCount = 0;

  function init() {
    console.log('[Hogwarts Promo] Inicializando experiencia...');
    injectStyles();
    createSpellEffect(function () {
      buildModal();
    });
  }

  function safeInit() {
    if (document.body) {
      init();
    } else if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(safeInit, RETRY_INTERVAL);
    } else {
      console.log('[Hogwarts Promo] Limite de tentativas atingido. Abortando.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }

})();
