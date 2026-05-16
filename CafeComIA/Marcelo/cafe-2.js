(function () {
  'use strict';

  // ========== CONFIGURACOES ==========
  var STYLE_ID = 'hogwarts-cro-style';
  var MODAL_ID = 'hogwarts-modal-wrapper';
  var SPELL_ID = 'hogwarts-spell-overlay';
  var ACTIVITY_NAME = 'AT_Hogwarts_Promo';
  var PAGE_CONTEXT = 'AT_home_azul';
  var MAX_RETRIES = 20;
  var RETRY_INTERVAL = 300;
  var retryCount = 0;

  // ========== TRACKING ADOBE ==========
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = ACTIVITY_NAME + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Hogwarts] Analytics event triggered:', labelEvent);
    (function () {
      var sObj = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!sObj || typeof sObj.tl !== 'function') return;
      sObj.linkTrackVars = 'events,eVar82,eVar84';
      sObj.linkTrackEvents = 'event90';
      sObj.events = 'event90';
      sObj.eVar82 = labelEvent;
      sObj.eVar84 = PAGE_CONTEXT;
      sObj.tl(true, 'o', 'target_activity_action');
    })();
  }

  // ========== EARLY RETURN SE JA EXISTE ==========
  if (document.getElementById(STYLE_ID)) {
    console.log('[Hogwarts] Estilo ja injetado, abortando.');
    return;
  }

  // ========== INJETAR CSS ==========
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent =
      // Spell overlay
      '#' + SPELL_ID + ' {' +
        'position: fixed; top: 0; left: 0; width: 100%; height: 100%;' +
        'z-index: 999998; background: rgba(0,0,0,0.85);' +
        'display: flex; align-items: center; justify-content: center;' +
        'opacity: 1; transition: opacity 0.6s ease;' +
      '}' +
      '#' + SPELL_ID + '.hogwarts-spell-fade-out {' +
        'opacity: 0; pointer-events: none;' +
      '}' +

      // Spell canvas
      '.hogwarts-spell-canvas {' +
        'width: 400px; height: 400px; position: relative;' +
      '}' +

      // Spell core
      '.spell-core {' +
        'position: absolute; top: 50%; left: 50%; width: 30px; height: 30px;' +
        'margin: -15px 0 0 -15px; border-radius: 50%;' +
        'background: radial-gradient(circle, #fff 0%, #7db9e8 40%, #014e84 80%, transparent 100%);' +
        'box-shadow: 0 0 40px 15px rgba(1,78,132,0.7), 0 0 80px 30px rgba(1,78,132,0.4);' +
        'animation: spellCorePulse 0.8s ease-in-out infinite alternate;' +
      '}' +

      // Spell ring
      '.spell-ring {' +
        'position: absolute; top: 50%; left: 50%; width: 120px; height: 120px;' +
        'margin: -60px 0 0 -60px; border-radius: 50%;' +
        'border: 2px solid rgba(1,78,132,0.6);' +
        'box-shadow: 0 0 30px 8px rgba(1,78,132,0.3), inset 0 0 20px 5px rgba(1,78,132,0.2);' +
        'animation: spellRingSpin 2s linear infinite;' +
      '}' +
      '.spell-ring-2 {' +
        'position: absolute; top: 50%; left: 50%; width: 180px; height: 180px;' +
        'margin: -90px 0 0 -90px; border-radius: 50%;' +
        'border: 1px solid rgba(125,185,232,0.3);' +
        'box-shadow: 0 0 20px 5px rgba(1,78,132,0.15);' +
        'animation: spellRingSpin 3s linear infinite reverse;' +
      '}' +

      // Smoke layers
      '.spell-smoke {' +
        'position: absolute; top: 50%; left: 50%; width: 300px; height: 300px;' +
        'margin: -150px 0 0 -150px; border-radius: 50%;' +
        'background: radial-gradient(circle, rgba(1,78,132,0.15) 0%, rgba(0,30,60,0.08) 50%, transparent 70%);' +
        'filter: blur(20px);' +
        'animation: spellSmoke 3s ease-in-out infinite alternate;' +
      '}' +
      '.spell-smoke-2 {' +
        'position: absolute; top: 50%; left: 50%; width: 350px; height: 350px;' +
        'margin: -175px 0 0 -175px; border-radius: 50%;' +
        'background: radial-gradient(circle, rgba(30,60,100,0.1) 0%, transparent 60%);' +
        'filter: blur(30px);' +
        'animation: spellSmoke 4s ease-in-out infinite alternate-reverse;' +
      '}' +

      // Sparks container
      '.spell-sparks { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }' +
      '.spark {' +
        'position: absolute; width: 3px; height: 3px; border-radius: 50%;' +
        'background: #7db9e8;' +
        'box-shadow: 0 0 6px 2px rgba(125,185,232,0.8);' +
      '}' +

      // Keyframes
      '@keyframes spellCorePulse {' +
        '0% { transform: scale(1); box-shadow: 0 0 40px 15px rgba(1,78,132,0.7), 0 0 80px 30px rgba(1,78,132,0.4); }' +
        '100% { transform: scale(1.3); box-shadow: 0 0 60px 25px rgba(1,78,132,0.9), 0 0 120px 50px rgba(1,78,132,0.5); }' +
      '}' +
      '@keyframes spellRingSpin {' +
        '0% { transform: rotate(0deg) scale(1); }' +
        '50% { transform: rotate(180deg) scale(1.1); }' +
        '100% { transform: rotate(360deg) scale(1); }' +
      '}' +
      '@keyframes spellSmoke {' +
        '0% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }' +
        '100% { transform: scale(1.2) rotate(30deg); opacity: 0.8; }' +
      '}' +
      '@keyframes sparkFloat {' +
        '0% { transform: translate(0,0) scale(1); opacity: 1; }' +
        '100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }' +
      '}' +
      '@keyframes sparkOrbit {' +
        '0% { transform: rotate(var(--start-angle)) translateX(var(--orbit-r)); opacity: 0.8; }' +
        '50% { opacity: 1; }' +
        '100% { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(var(--orbit-r)); opacity: 0.3; }' +
      '}' +

      // Modal backdrop
      '#' + MODAL_ID + ' {' +
        'position: fixed; top: 0; left: 0; width: 100%; height: 100%;' +
        'z-index: 999999; background: rgba(0,0,0,0.75);' +
        'display: flex; align-items: center; justify-content: center;' +
        'opacity: 0; transition: opacity 0.5s ease;' +
        'pointer-events: none;' +
      '}' +
      '#' + MODAL_ID + '.hogwarts-modal-visible {' +
        'opacity: 1; pointer-events: auto;' +
      '}' +

      // Modal card
      '.hogwarts-card {' +
        'position: relative; width: 460px; max-width: 94vw;' +
        'border: 3px solid #c5a355; border-radius: 18px;' +
        'background: linear-gradient(160deg, #2a0a1e 0%, #4a1030 30%, #1a0520 100%);' +
        'box-shadow: 0 0 40px rgba(0,0,0,0.7), inset 0 0 30px rgba(100,30,60,0.15);' +
        'overflow: hidden; text-align: center; color: #fff;' +
        'transform: scale(0.85); transition: transform 0.4s ease;' +
        'padding: 0 0 28px 0;' +
      '}' +
      '.hogwarts-modal-visible .hogwarts-card { transform: scale(1); }' +

      // Close button
      '.hogwarts-close-btn {' +
        'position: absolute; top: 10px; right: 14px; z-index: 5;' +
        'background: none; border: none; color: #c5a355; font-size: 26px;' +
        'cursor: pointer; line-height: 1; padding: 4px;' +
      '}' +
      '.hogwarts-close-btn:hover { color: #fff; }' +

      // Top logos bar
      '.hogwarts-logos-bar {' +
        'display: flex; align-items: center; justify-content: center;' +
        'gap: 10px; padding: 16px 20px 10px;' +
      '}' +
      '.hogwarts-logos-bar img { height: 28px; object-fit: contain; }' +
      '.hogwarts-logos-bar .hogwarts-logo-sep {' +
        'color: #c5a355; font-size: 22px; opacity: 0.6;' +
      '}' +

      // Park logo
      '.hogwarts-park-logo {' +
        'display: block; margin: 4px auto 8px; height: 50px; object-fit: contain;' +
      '}' +

      // Circular image
      '.hogwarts-circle-img-wrap {' +
        'width: 160px; height: 160px; margin: 0 auto 14px;' +
        'border-radius: 50%; border: 3px solid #c5a355; overflow: hidden;' +
        'box-shadow: 0 0 20px rgba(197,163,85,0.3);' +
      '}' +
      '.hogwarts-circle-img-wrap img {' +
        'width: 100%; height: 100%; object-fit: cover;' +
      '}' +

      // Title + description
      '.hogwarts-title {' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-size: 22px; font-weight: 700; color: #c5a355;' +
        'margin: 0 20px 6px; line-height: 1.2;' +
      '}' +
      '.hogwarts-desc {' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-size: 14px; color: #e0d0c0; margin: 0 24px 16px; line-height: 1.4;' +
      '}' +

      // Offer block
      '.hogwarts-offer-block {' +
        'background: rgba(197,163,85,0.12); border: 1px solid rgba(197,163,85,0.3);' +
        'border-radius: 12px; margin: 0 24px 14px; padding: 14px 16px;' +
      '}' +
      '.hogwarts-offer-top { font-size: 13px; color: #e0d0c0; margin-bottom: 4px; }' +
      '.hogwarts-offer-percent {' +
        'font-size: 42px; font-weight: 800; color: #c5a355;' +
        'line-height: 1; margin-bottom: 2px;' +
      '}' +
      '.hogwarts-offer-sub { font-size: 12px; color: #cbb89a; }' +

      // Coupon button
      '.hogwarts-coupon-btn {' +
        'display: inline-block; margin: 0 auto 14px; padding: 10px 28px;' +
        'background: rgba(197,163,85,0.15); border: 2px dashed #c5a355;' +
        'border-radius: 8px; color: #c5a355; font-size: 16px; font-weight: 700;' +
        'cursor: pointer; letter-spacing: 1px; transition: background 0.3s;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
      '}' +
      '.hogwarts-coupon-btn:hover { background: rgba(197,163,85,0.25); }' +

      // CTA
      '.hogwarts-cta {' +
        'display: inline-block; padding: 12px 48px; margin-top: 4px;' +
        'background: linear-gradient(135deg, #c5a355, #a07c3a); color: #1a0520;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-size: 16px; font-weight: 700; border-radius: 30px; border: none;' +
        'cursor: pointer; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;' +
        'box-shadow: 0 4px 18px rgba(197,163,85,0.3);' +
      '}' +
      '.hogwarts-cta:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(197,163,85,0.5); }' +

      // Floating button
      '.hogwarts-float-btn {' +
        'position: fixed; bottom: 24px; right: 24px; z-index: 999997;' +
        'width: 60px; height: 60px; border-radius: 50%;' +
        'background: linear-gradient(135deg, #c5a355, #a07c3a);' +
        'border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.4);' +
        'display: flex; align-items: center; justify-content: center;' +
        'transition: transform 0.3s; animation: floatPulse 2s ease-in-out infinite;' +
      '}' +
      '.hogwarts-float-btn:hover { transform: scale(1.1); }' +
      '.hogwarts-float-btn img { width: 34px; height: 34px; object-fit: contain; }' +
      '@keyframes floatPulse {' +
        '0%, 100% { box-shadow: 0 4px 20px rgba(197,163,85,0.4); }' +
        '50% { box-shadow: 0 4px 30px rgba(197,163,85,0.7); }' +
      '}' +

      // Responsivo mobile
      '@media (max-width: 520px) {' +
        '.hogwarts-card { border-radius: 14px; padding-bottom: 22px; }' +
        '.hogwarts-title { font-size: 18px; }' +
        '.hogwarts-circle-img-wrap { width: 120px; height: 120px; }' +
        '.hogwarts-offer-percent { font-size: 34px; }' +
        '.hogwarts-cta { padding: 10px 36px; font-size: 14px; }' +
        '.hogwarts-spell-canvas { width: 280px; height: 280px; }' +
      '}' +

      // Reduced motion
      '@media (prefers-reduced-motion: reduce) {' +
        '.spell-core, .spell-ring, .spell-ring-2, .spell-smoke, .spell-smoke-2,' +
        '.spark, .hogwarts-float-btn { animation: none !important; }' +
        '#' + SPELL_ID + ', #' + MODAL_ID + ', .hogwarts-card { transition: none !important; }' +
      '}';

    document.head.appendChild(styleEl);
  }

  // ========== CRIAR SPARKS ==========
  function createSparks(container, count) {
    for (var i = 0; i < count; i++) {
      var spark = document.createElement('div');
      spark.className = 'spark';
      var angle = (360 / count) * i;
      var radius = 40 + Math.random() * 50;
      spark.style.setProperty('--start-angle', angle + 'deg', '');
      spark.style.setProperty('--orbit-r', radius + 'px', '');
      spark.style.setProperty('top', '50%', '');
      spark.style.setProperty('left', '50%', '');
      spark.style.setProperty('transform-origin', '0 0', '');
      spark.style.setProperty('animation', 'sparkOrbit ' + (1.5 + Math.random() * 2) + 's linear infinite', '');
      spark.style.setProperty('animation-delay', (Math.random() * 2) + 's', '');
      container.appendChild(spark);
    }
  }

  // ========== EFEITO FEITICO ==========
  function showSpellEffect(callback) {
    if (document.getElementById(SPELL_ID)) {
      if (callback) callback();
      return;
    }

    var overlay = document.createElement('div');
    overlay.id = SPELL_ID;

    var canvas = document.createElement('div');
    canvas.className = 'hogwarts-spell-canvas';

    // Fumaça
    var smoke1 = document.createElement('div');
    smoke1.className = 'spell-smoke';
    canvas.appendChild(smoke1);

    var smoke2 = document.createElement('div');
    smoke2.className = 'spell-smoke-2';
    canvas.appendChild(smoke2);

    // Aneis
    var ring2 = document.createElement('div');
    ring2.className = 'spell-ring-2';
    canvas.appendChild(ring2);

    var ring1 = document.createElement('div');
    ring1.className = 'spell-ring';
    canvas.appendChild(ring1);

    // Nucleo
    var core = document.createElement('div');
    core.className = 'spell-core';
    canvas.appendChild(core);

    // Sparks
    var sparksContainer = document.createElement('div');
    sparksContainer.className = 'spell-sparks';
    createSparks(sparksContainer, 16);
    canvas.appendChild(sparksContainer);

    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    // Fade out apos 2.5s
    setTimeout(function () {
      overlay.classList.add('hogwarts-spell-fade-out');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (callback) callback();
      }, 600);
    }, 2500);
  }

  // ========== CRIAR MODAL ==========
  function createModal() {
    if (document.getElementById(MODAL_ID)) return;

    var wrapper = document.createElement('div');
    wrapper.id = MODAL_ID;

    var card = document.createElement('div');
    card.className = 'hogwarts-card';

    // Botao fechar
    var closeBtn = document.createElement('button');
    closeBtn.className = 'hogwarts-close-btn';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.textContent = '\u00D7';
    card.appendChild(closeBtn);

    // Logos bar
    var logosBar = document.createElement('div');
    logosBar.className = 'hogwarts-logos-bar';

    var logo1 = document.createElement('img');
    logo1.src = 'https://i.imgur.com/BdxFnun.png';
    logo1.alt = 'Azul Viagens';
    logosBar.appendChild(logo1);

    var sep = document.createElement('span');
    sep.className = 'hogwarts-logo-sep';
    sep.textContent = '|';
    logosBar.appendChild(sep);

    var logo2 = document.createElement('img');
    logo2.src = 'https://i.imgur.com/rF0NNXS.png';
    logo2.alt = 'Universal';
    logosBar.appendChild(logo2);

    card.appendChild(logosBar);

    // Logo parque
    var parkLogo = document.createElement('img');
    parkLogo.className = 'hogwarts-park-logo';
    parkLogo.src = 'https://i.imgur.com/sgL9x6k.png';
    parkLogo.alt = 'Wizarding World of Harry Potter';
    card.appendChild(parkLogo);

    // Imagem circular
    var circleWrap = document.createElement('div');
    circleWrap.className = 'hogwarts-circle-img-wrap';
    var circleImg = document.createElement('img');
    circleImg.src = 'https://i.imgur.com/gpsv57K.png';
    circleImg.alt = 'Hogwarts Castle';
    circleWrap.appendChild(circleImg);
    card.appendChild(circleWrap);

    // Titulo
    var title = document.createElement('h2');
    title.className = 'hogwarts-title';
    title.textContent = 'Embarque nessa viagem m\u00E1gica';
    card.appendChild(title);

    // Descricao
    var desc = document.createElement('p');
    desc.className = 'hogwarts-desc';
    desc.textContent = 'Passagens para Orlando e Los Angeles. Seu sonho no Expresso de Hogwarts come\u00E7a aqui!';
    card.appendChild(desc);

    // Bloco de oferta
    var offerBlock = document.createElement('div');
    offerBlock.className = 'hogwarts-offer-block';

    var offerTop = document.createElement('div');
    offerTop.className = 'hogwarts-offer-top';
    offerTop.textContent = 'Pacotes';
    offerBlock.appendChild(offerTop);

    var offerPercent = document.createElement('div');
    offerPercent.className = 'hogwarts-offer-percent';
    offerPercent.textContent = '20% OFF';
    offerBlock.appendChild(offerPercent);

    var offerSub = document.createElement('div');
    offerSub.className = 'hogwarts-offer-sub';
    offerSub.textContent = '(a\u00E9reo + hotel) com 20% OFF';
    offerBlock.appendChild(offerSub);

    card.appendChild(offerBlock);

    // Cupom
    var couponBtn = document.createElement('button');
    couponBtn.className = 'hogwarts-coupon-btn';
    couponBtn.textContent = 'CONSUMIDOR20';
    couponBtn.setAttribute('data-coupon', 'CONSUMIDOR20');
    card.appendChild(couponBtn);

    // CTA
    var ctaWrap = document.createElement('div');
    var cta = document.createElement('a');
    cta.className = 'hogwarts-cta';
    cta.href = 'https://www.voeazul.com.br/br/pt/viagem-completa/universal';
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.textContent = 'Eu quero';
    ctaWrap.appendChild(cta);
    card.appendChild(ctaWrap);

    wrapper.appendChild(card);
    document.body.appendChild(wrapper);

    // ===== EVENTOS =====
    // Fechar
    function closeModal(source) {
      wrapper.classList.remove('hogwarts-modal-visible');
      setTimeout(function () {
        wrapper.style.setProperty('display', 'none', '');
        showFloatingButton();
      }, 500);
      analyticsEvent(source, 'click');
    }

    if (!closeBtn.getAttribute('data-analytics-added')) {
      closeBtn.setAttribute('data-analytics-added', 'true');
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeModal('fechar_modal');
      });
    }

    // Clique fora (backdrop)
    if (!wrapper.getAttribute('data-analytics-added')) {
      wrapper.setAttribute('data-analytics-added', 'true');
      wrapper.addEventListener('click', function (e) {
        if (e.target === wrapper) {
          closeModal('fechar_backdrop');
        }
      });
    }

    // Copiar cupom
    if (!couponBtn.getAttribute('data-analytics-added')) {
      couponBtn.setAttribute('data-analytics-added', 'true');
      couponBtn.addEventListener('click', function () {
        var cupom = couponBtn.getAttribute('data-coupon');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(cupom).then(function () {
            couponBtn.textContent = 'C\u00F3d. Copiado';
            setTimeout(function () {
              couponBtn.textContent = cupom;
            }, 2000);
          });
        } else {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = cupom;
          ta.style.setProperty('position', 'fixed', '');
          ta.style.setProperty('left', '-9999px', '');
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          couponBtn.textContent = 'C\u00F3d. Copiado';
          setTimeout(function () {
            couponBtn.textContent = cupom;
          }, 2000);
        }
        analyticsEvent('cupom_copiado', 'click');
      });
    }

    // CTA tracking
    if (!cta.getAttribute('data-analytics-added')) {
      cta.setAttribute('data-analytics-added', 'true');
      cta.addEventListener('click', function () {
        analyticsEvent('cta_eu_quero', 'click');
      });
    }

    // Mostrar com animacao
    setTimeout(function () {
      wrapper.classList.add('hogwarts-modal-visible');
      analyticsEvent('modal_visualizado', 'view');
    }, 50);
  }

  // ========== BOTAO FLUTUANTE ==========
  function showFloatingButton() {
    if (document.querySelector('.hogwarts-float-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'hogwarts-float-btn';
    btn.setAttribute('aria-label', 'Abrir promocao Hogwarts');

    var btnImg = document.createElement('img');
    btnImg.src = 'https://i.imgur.com/sgL9x6k.png';
    btnImg.alt = 'Hogwarts';
    btn.appendChild(btnImg);

    btn.addEventListener('click', function () {
      var existing = document.getElementById(MODAL_ID);
      if (existing) {
        existing.style.setProperty('display', 'flex', '');
        setTimeout(function () {
          existing.classList.add('hogwarts-modal-visible');
          analyticsEvent('modal_reaberto', 'view');
        }, 50);
      }
      btn.parentNode.removeChild(btn);
    });

    document.body.appendChild(btn);
  }

  // ========== INICIALIZACAO ==========
  function init() {
    if (document.querySelector('[data-hogwarts-init]')) return;

    var marker = document.createElement('div');
    marker.setAttribute('data-hogwarts-init', 'true');
    marker.style.setProperty('display', 'none', '');
    document.body.appendChild(marker);

    console.log('[Hogwarts] Iniciando experiencia.');
    injectStyles();
    showSpellEffect(function () {
      createModal();
    });
  }

  function tryInit() {
    if (document.body) {
      init();
    } else if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(tryInit, RETRY_INTERVAL);
    } else {
      console.log('[Hogwarts] Limite de tentativas atingido, abortando.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();