(function () {
  var EXPERIMENT_NAME = 'AT_Disney_ingressos_saida';
  var BANNER_LINK = 'https://www.voeazul.com.br/br/pt/disney/promocoes-disney';
  var STYLE_ID = 'at-disney-ingressos-saida-style';
  var OVERLAY_ID = 'at-disney-ingressos-saida-overlay';
  var BANNER_ID = 'at-disney-ingressos-saida-banner';
  var EVAR84 = 'AT_Disney_campaign';
  var UTM_CAMPAIGN_ALLOWED = [
    '202603-AZV-B2C-EMM-168H-VIAGEM-ABANDONOPESQUISAINGRESSOSDISNEY-D0',
    '202604-azv-b2c-emm-168h-viagem-abandonopesquisaingressosdisneyAZ-d2_tickets',
    '202603-AZV-B2C-EMM-168H-VIAGEM-ABANDONOCARRINHODISNEY-D0',
    '202603-azv-b2c-psh-168h-inter-abandonocarrinhoingressosdisney-d2_pac',
    'pmweb_azv_e-mail_banner_lf_azv_202603-azv-b2c-emm-168h-viagem-incentivohospedagemdisney-d7_hotel',
    'pmweb_azv_e-mail_banner_lf_azv_202603-azv-b2c-emm-168h-viagem-abandonopesquisaingressosdisney-02_tickets',
    'pmweb_azv_e-mail_banner_lf_azv_202604-azv-b2c-emm-168h-viagem-abandonopesquisaingressosdisneyAZ-d2_tickets',
    'pmweb_azv_e-mail_banner_lf_azv_202603-azv-b2c-emm-168h-viagem-abandonocarrinhoingressosdisney-d0_tickets',
  ];
  var COUPON_CODE = 'ALEGRIA12';
  var COUPON_ICON_TICKET = 'https://i.imgur.com/B1wX3xt.png';
  var COUPON_ICON_COPY = 'https://i.imgur.com/4GwUwV6.png';
  var BANNER_ASSET_URLS = [
    'https://i.imgur.com/7dXE65l.png',
    'https://i.imgur.com/XXIXMQA.png',
    'https://i.imgur.com/12lQ5lp.png',
    'https://i.imgur.com/nLG5yvC.png',
    'https://i.imgur.com/PhHNRqr.png',
    'https://i.imgur.com/ZPcL8R3.png',
    'https://i.imgur.com/jSNMMjB.png',
    'https://i.imgur.com/noLA829.png',
    COUPON_ICON_TICKET,
    COUPON_ICON_COPY,
  ];

  // ============================================
  // REGRAS DE EXIBIÇÃO DO MODAL
  // ============================================
  // 1. Apenas 1 exibição por sessão (usa sessionStorage)
  // 2. Máximo de 3 sessões por dia com exibição (usa localStorage)
  // 3. Gatilhos: exit intent (sair da página) ou inatividade (30s)
  // 4. Uma vez exibido na sessão, não exibe mais
  var SESSION_KEY_SHOWN = 'at_disney_ingressos_saida_shown_session';
  var DAILY_KEY = 'at_disney_ingressos_saida_shown_daily';
  var INACTIVITY_MS = 30000;
  // Flag para automação na LP de promoções
  var PROMO_AUTOCLOCK_KEY = 'at_disney_promocoes_autoclick_ingressos';
  var HOME_BLOCKED_URL = 'https://www.voeazul.com.br/br/pt/home';

  // Limpa execucoes anteriores
  var oldStyle = document.getElementById(STYLE_ID);
  if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);
  var oldOverlay = document.getElementById(OVERLAY_ID);
  if (oldOverlay) oldOverlay.parentNode.removeChild(oldOverlay);
  var oldBanner = document.getElementById(BANNER_ID);
  if (oldBanner) oldBanner.parentNode.removeChild(oldBanner);

  function utmCampaignMatches(campaign) {
    if (!campaign) return false;
    var c = String(campaign).toLowerCase();
    for (var i = 0; i < UTM_CAMPAIGN_ALLOWED.length; i++) {
      var allowed = String(UTM_CAMPAIGN_ALLOWED[i] || '').toLowerCase();
      if (!allowed) continue;
      if (c === allowed) return true;
      if (c.indexOf(allowed) !== -1) return true;
    }
    return false;
  }

  function hasRequiredUtm() {
    try {
      var search = window.location.search || '';
      if (search.indexOf('utm_campaign=') === -1 && search.indexOf('utm_campaing=') === -1) {
        return false;
      }
      var params = new URLSearchParams(search);
      var campaign = params.get('utm_campaign') || params.get('utm_campaing') || '';
      return utmCampaignMatches(campaign);
    } catch (e) {
      return false;
    }
  }

  function isBlockedHomePage() {
    try {
      var url = String(window.location.href || '')
        .split('?')[0]
        .split('#')[0];
      if (url.charAt(url.length - 1) === '/') {
        url = url.slice(0, -1);
      }
      return url === HOME_BLOCKED_URL;
    } catch (e) {
      return false;
    }
  }

  function preloadBannerAssets(callback) {
    var urls = BANNER_ASSET_URLS;
    var loaded = 0;
    var total = urls.length;

    if (!total) {
      if (typeof callback === 'function') callback();
      return;
    }

    function onAssetDone() {
      loaded++;
      if (loaded >= total && typeof callback === 'function') callback();
    }

    urls.forEach(function (url) {
      var img = new Image();
      img.onload = onAssetDone;
      img.onerror = onAssetDone;
      img.src = url;
    });
  }

  function getTodayKey() {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch (e) {
      return '';
    }
  }

  function getDailyData() {
    var today = getTodayKey();
    var data = null;
    try {
      data = JSON.parse(localStorage.getItem(DAILY_KEY));
    } catch (e) {
      data = null;
    }

    if (!data || data.date !== today) {
      return { date: today, count: 0 };
    }
    if (typeof data.count !== 'number') data.count = 0;
    return data;
  }

  function isShownThisSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY_SHOWN) === '1';
    } catch (e) {
      return false;
    }
  }

  function canShowByRules() {
    if (isShownThisSession()) return false;
    var daily = getDailyData();
    return daily.count < 3;
  }

  function markShown() {
    if (isShownThisSession()) return;
    try {
      sessionStorage.setItem(SESSION_KEY_SHOWN, '1');
    } catch (e) {}

    var daily = getDailyData();
    daily.count += 1;
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
    } catch (e) {}
  }

  function copyCouponCode(couponBtn) {
    if (!couponBtn || couponBtn.classList.contains('at-dh-coupon-box--copied')) return;

    var codeEl = couponBtn.querySelector('.at-dh-coupon-code');
    if (!codeEl) return;

    function onSuccess() {
      var originalText = codeEl.textContent;
      codeEl.textContent = 'Copiado!';
      couponBtn.classList.add('at-dh-coupon-box--copied');
      analyticsEvent('banner_disney_ingressos_copiar_cupom', 'click');
      setTimeout(function () {
        codeEl.textContent = originalText;
        couponBtn.classList.remove('at-dh-coupon-box--copied');
      }, 2000);
    }

    function onError() {
      console.log('[Disney Ingressos Saida] Nao foi possivel copiar o cupom.');
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(COUPON_CODE).then(onSuccess).catch(onError);
      return;
    }

    var input = document.createElement('input');
    input.value = COUPON_CODE;
    input.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
    input.setAttribute('aria-hidden', 'true');
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      onError();
    }

    document.body.removeChild(input);
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = EXPERIMENT_NAME + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Disney Ingressos Saida] Evento disparado: ' + labelEvent);
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
      console.log('[Tracking Disney Ingressos Saida] Erro no analytics: ' + e.message);
    }
  }

  function injectStyles() {
    var existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle);
    }
    var css =
      '' +
      // ===== OVERLAY DA ANIMACAO =====
      '#' +
      OVERLAY_ID +
      ' {' +
      '  position:fixed; top:0; left:0; width:100%; height:100%;' +
      '  background:rgba(0,10,40,0.92); z-index:999999;' +
      '  display:flex; align-items:center; justify-content:center;' +
      '  opacity:0; transition:opacity 0.5s ease; overflow:hidden;' +
      '}' +
      '#' +
      OVERLAY_ID +
      '.at-disney-visible { opacity:1; }' +
      '#' +
      OVERLAY_ID +
      '.at-disney-fade-out { opacity:0; pointer-events:none; }' +
      '.at-disney-star {' +
      '  position:absolute; width:12px; height:12px; background:#fff;' +
      '  border-radius:50%; z-index:3; opacity:0; filter:blur(0.5px);' +
      '  box-shadow:0 0 20px 8px rgba(255,255,255,0.9),0 0 60px 20px rgba(100,180,255,0.6),0 0 100px 40px rgba(80,150,255,0.3);' +
      '}' +
      '.at-disney-sparkle {' +
      '  position:absolute; width:4px; height:4px; background:#fff;' +
      '  border-radius:50%; opacity:0; pointer-events:none;' +
      '  box-shadow:0 0 6px 2px rgba(255,255,255,0.8),0 0 15px 5px rgba(100,180,255,0.4);' +
      '}' +
      '.at-disney-dust {' +
      '  position:absolute; width:3px; height:3px; background:rgba(255,255,255,0.9);' +
      '  border-radius:50%; opacity:0; box-shadow:0 0 8px 3px rgba(180,220,255,0.6);' +
      '}' +
      '.at-disney-dust.at-disney-animate-dust { animation:atDisneyDust 1.5s ease-out forwards; }' +
      '@keyframes atDisneyDust {' +
      '  0%{opacity:0;transform:scale(0) translateY(0)}' +
      '  20%{opacity:1;transform:scale(1.2) translateY(-5px)}' +
      '  100%{opacity:0;transform:scale(0.3) translateY(15px)}' +
      '}' +
      '.at-disney-flash {' +
      '  position:absolute; width:300px; height:300px; border-radius:50%;' +
      '  background:radial-gradient(circle,rgba(255,255,255,0.6) 0%,rgba(100,180,255,0.2) 40%,transparent 70%);' +
      '  opacity:0; z-index:2; pointer-events:none; transform:translate(-50%,-50%);' +
      '}' +
      '.at-disney-flash.at-disney-animate-flash { animation:atDisneyFlash 1s ease-out forwards; }' +
      '@keyframes atDisneyFlash {' +
      '  0%{opacity:0;transform:translate(-50%,-50%) scale(0.2)}' +
      '  30%{opacity:1;transform:translate(-50%,-50%) scale(1)}' +
      '  100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}' +
      '}' +
      // ===== BANNER OVERLAY =====
      '#' +
      BANNER_ID +
      ' {' +
      '  position:fixed; top:0; left:0; width:100%; height:100%;' +
      '  z-index:999998; display:flex; align-items:center; justify-content:center;' +
      '  background:rgba(0,0,0,0.7); opacity:0; transition:opacity 0.6s ease;' +
      '}' +
      '#' +
      BANNER_ID +
      '.at-disney-banner-visible { opacity:1; }' +
      '#' +
      BANNER_ID +
      '.at-disney-banner-fade-out { opacity:0; pointer-events:none; }' +
      // ===== CONTAINER PRINCIPAL 720x500 =====
      '.at-dh-container {' +
      '  position:relative; width:720px; height:486px;' +
      '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  background:url("fundo disney.png"), #0150B5; border-radius:8px; overflow:hidden;' +
      '  box-shadow:0 20px 80px rgba(0,0,0,0.5);' +
      '  animation:atDhBannerIn 0.6s ease-out forwards;' +
      '}' +
      '@keyframes atDhBannerIn {' +
      '  0%{transform:scale(0.8) translateY(30px);opacity:0}' +
      '  100%{transform:scale(1) translateY(0);opacity:1}' +
      '}' +
      // ===== CAMADAS DE BRILHO (Group 11785) =====
      '.at-dh-glow-layer {' +
      '  position:absolute; pointer-events:none;' +
      '  background:radial-gradient(ellipse at center, rgba(100,180,255,0.18) 0%, rgba(50,130,255,0.08) 30%, transparent 70%);' +
      '  mix-blend-mode:plus-lighter;' +
      '}' +
      '.at-dh-glow-1 {' +
      '  width:548px; height:548px;' +
      '  left:23.93%; right:-72.69%; top:148.95px;' +
      '  transform:rotate(164.96deg);' +
      '}' +
      '.at-dh-glow-2 {' +
      '  width:548px; height:548px;' +
      '  left:-97.75%; right:48.99%; top:306.49px;' +
      '  transform:rotate(164.96deg);' +
      '}' +
      // ===== BRILHOS PONTUAIS (BRILHO copy) =====
      '.at-dh-lens-flare {' +
      '  position:absolute; pointer-events:none; mix-blend-mode:screen;' +
      '  background:radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, rgba(200,230,255,0.12) 30%, transparent 60%);' +
      '}' +
      '.at-dh-lens-1 {' +
      '  width:200px; height:180px;' +
      '  left:-34.23%; right:83.62%; top:-74.54%; bottom:100.64%;' +
      '  transform:rotate(103.19deg);' +
      '}' +
      '.at-dh-lens-3 {' +
      '  width:200px; height:180px;' +
      '  left:41.67%; right:7.72%; top:-41.25%; bottom:67.36%;' +
      '  transform:rotate(-121.02deg);' +
      '}' +
      // ===== ESTRELINHAS PISCANDO =====
      '.at-dh-sparkle-layer {' +
      '  position:absolute; top:0; left:0; width:100%; height:100%;' +
      '  pointer-events:none; overflow:hidden; z-index:2;' +
      '}' +
      '.at-dh-shine {' +
      '  position:absolute; width:3px; height:3px; background:#fff;' +
      '  border-radius:50%; opacity:0;' +
      '  box-shadow:0 0 6px 2px rgba(255,255,255,0.6);' +
      '  animation:atDhTwinkle 2s ease-in-out infinite;' +
      '}' +
      '@keyframes atDhTwinkle {' +
      '  0%,100%{opacity:0;transform:scale(0.5)}' +
      '  50%{opacity:1;transform:scale(1.2)}' +
      '}' +
      // ===== LAYOUT FLEX PRINCIPAL =====
      '.at-dh-layout {' +
      '  position:relative; z-index:5;' +
      '  display:flex; flex-direction:row; align-items:flex-start;' +
      '  gap:24px; padding:24px 40px; box-sizing:border-box;' +
      '  width:100%; height:100%;' +
      '}' +
      '.at-dh-col-left {' +
      '  display:flex; flex-direction:column; align-items:flex-start;' +
      '  gap:16px; width:367px; flex:none;' +
      '}' +
      '.at-dh-col-right {' +
      '  display:flex; flex-direction:column; align-items:flex-end;' +
      '  gap:40px; width:250px; flex:none; margin-left:auto;' +
      '}' +
      // ===== LOGO TOPO =====
      '.at-dh-logo {' +
      '  display:flex; align-items:center; flex:none;' +
      '}' +
      '.at-dh-logo img { height:29px; width:auto; object-fit:contain; display:block; }' +
      // ===== TITULO =====
      '.at-dh-txt {' +
      '  display:flex; flex-direction:column; gap:8px;' +
      '  width:100%; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  font-weight:300; color:#FFFFFF;' +
      '  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;' +
      '}' +
      '.at-dh-txt strong { font-weight:700; }' +
      '.at-dh-highlight {' +
      '  font-weight:700;' +
      '  padding:0 3px; border-radius:2px;' +
      '}' +
      '.at-dh-txt-line1 { font-size:20px; line-height:109%; }' +
      '.at-dh-txt-body { font-size:14px; line-height:104%; letter-spacing:-0.025em; }' +
      // ===== BLOCO OFERTA =====
      '.at-dh-offer-block {' +
      '  position:relative; width:100%; padding-top:10px;' +
      '}' +
      '.at-dh-offer-frame {' +
      '  box-sizing:border-box; width:100%;' +
      '  border:1px solid #FFFFFF; border-radius:13px;' +
      '  padding:28px 12px 55px;' +
      '  display:flex; flex-direction:column;' +
      '}' +
      '.at-dh-park-strip {' +
      '  position:absolute; top:0; left:50%; transform:translateX(-50%);' +
      '  display:flex; flex-direction:row; flex-wrap:nowrap;' +
      '  align-items:center; justify-content:center;' +
      '  padding:0 8px; gap:8px;' +
      '  background:#0150B5; z-index:2; box-sizing:border-box;' +
      '}' +
      '.at-dh-park-icon {' +
      '  height:18px; width:auto; object-fit:contain; flex:none; display:block;' +
      '}' +
      '.at-dh-bullets {' +
      '  display:flex; flex-direction:column; gap:0; width:100%;' +
      '}' +
      '.at-dh-bullet-row {' +
      '  display:flex; flex-direction:row; align-items:flex-start;' +
      '  gap:12px; width:100%; min-height:33px; padding:0;' +
      '}' +
      '.at-dh-bullet-text strong { font-weight:700; }' +
      '.at-dh-bullet-icon-wrap {' +
      '  display:flex; align-items:center; justify-content:center;' +
      '  width:24px; height:24px; flex:none; margin-top:0;' +
      '  background:#5EDCFF; border-radius:50%;' +
      '}' +
      '.at-dh-bullet-icon-img {' +
      '  width:24px; height:24px; object-fit:contain; flex:none; display:block;' +
      '}' +
      '.at-dh-bullet-text {' +
      '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; font-weight:400; font-size:14px;' +
      '  line-height:16px; color:#FFFFFF; flex:1; padding-top:4px;' +
      '}' +
      // ===== CUPOM (sobre a linha inferior do frame — Figma) =====
      '.at-dh-coupon-wrap {' +
      '  display:flex; flex-direction:column; align-items:center; gap:6px;' +
      '  width:100%; margin-top:-40px; position:relative; z-index:3;' +
      '}' +
      '.at-dh-coupon-label {' +
      '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  font-weight:400; font-size:12px; line-height:120%;' +
      '  text-align:center; color:#FFFFFF;' +
      '}' +
      '.at-dh-coupon-box {' +
      '  max-width:100%; height:44px;' +
      '  background:#004F8B; border:none; border-radius:10px;' +
      '  display:flex; align-items:center; justify-content:center;' +
      '  padding:10px 16px; gap:10px; box-sizing:border-box;' +
      '  cursor:pointer;' +
      '  transition:background 0.2s ease, transform 0.2s ease;' +
      '}' +
      '.at-dh-coupon-box:hover { transform:translateY(-1px); background:#003D6E; }' +
      '.at-dh-coupon-box--copied { background:#0150B5 !important; transform:none !important; }' +
      '.at-dh-coupon-percent {' +
      '  display:flex; align-items:center; justify-content:center;' +
      '  width:20px; height:20px; flex:none;' +
      '}' +
      '.at-dh-coupon-percent img, .at-dh-coupon-copy img {' +
      '  width:100%; height:100%; object-fit:contain; display:block;' +
      '}' +
      '.at-dh-coupon-code {' +
      '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  font-weight:700; font-size:18px; line-height:18px;' +
      '  color:#FFFFFF; flex:1; text-align:center; letter-spacing:0.02em;' +
      '  white-space:nowrap; overflow:hidden;' +
      '}' +
      '.at-dh-coupon-box--copied .at-dh-coupon-code { font-size:16px; letter-spacing:0; }' +
      '.at-dh-coupon-copy {' +
      '  display:flex; align-items:center; justify-content:center;' +
      '  width:20px; height:20px; flex:none;' +
      '}' +
      // ===== RODAPE ESQUERDA (CTA) =====
      '.at-dh-footer {' +
      '  display:flex; flex-direction:column; align-items:stretch; gap:4px;' +
      '  width:100%;' +
      '}' +
      // ===== CTA PULSE =====
      '@keyframes atDhCtaPulse {' +
      '  0%{transform:scale(1);box-shadow:0 0 0 0 rgba(94,220,255,0.25)}' +
      '  50%{transform:scale(1.02);box-shadow:0 0 10px 3px rgba(94,220,255,0.25)}' +
      '  100%{transform:scale(1);box-shadow:0 0 0 0 rgba(94,220,255,0)}' +
      '}' +
      '.at-dh-cta-pulse { animation:atDhCtaPulse 0.9s ease-out 2; }' +
      // ===== CTA =====
      '.at-dh-cta {' +
      '  width:100%; height:51px;' +
      '  background:#5EDCFF; border-radius:45px; border:none;' +
      '  text-decoration:none; box-sizing:border-box;' +
      '  cursor:pointer;' +
      '  display:flex; align-items:center; justify-content:center;' +
      '  padding:0 30px; gap:6px;' +
      '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  font-weight:700; font-size:19px; line-height:20px; color:#00043E;' +
      '  transition:transform 0.2s ease, box-shadow 0.2s ease;' +
      '}' +
      '.at-dh-cta:hover {' +
      '  transform:translateY(-2px); box-shadow:0 4px 20px rgba(94,220,255,0.4);' +
      '}' +
      // ===== CONSULTE CONDICOES =====
      '.at-dh-consult {' +
      '  width:100%; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  font-weight:400; font-size:12px; line-height:120%; color:#FFFFFF;' +
      '  text-align:center;' +
      '}' +
      // ===== COLUNA DIREITA - FOTO =====
      '.at-dh-photo-col {' +
      '  display:flex; flex-direction:column; align-items:flex-end; gap:4px;' +
      '  width:100%;' +
      '}' +
      '.at-dh-photo-wrapper {' +
      '  width:250px; height:250px; border-radius:50%;' +
      '  overflow:hidden; background:#0150B5; flex:none;' +
      '}' +
      '.at-dh-photo-img {' +
      '  width:100%; height:100%; object-fit:cover; object-position:68% center;' +
      '  display:block;' +
      '}' +
      '.at-dh-photo-gradient {' +
      '  display:none;' +
      '}' +
      // ===== COPYRIGHT =====
      '.at-dh-copyright {' +
      '  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '  font-weight:400; font-size:9px; line-height:7px;' +
      '  color:#FFFFFF; text-align:center; padding:10px;' +
      '}' +
      // ===== BOTAO FECHAR =====
      '.at-dh-close {' +
      '  width:24px; height:24px; padding:0;' +
      '  background:transparent; border:none;' +
      '  cursor:pointer; display:flex; align-items:center; justify-content:center;' +
      '  flex:none; transition:opacity 0.2s ease;' +
      '}' +
      '.at-dh-close:hover { opacity:0.75; }' +
      '.at-dh-close svg { width:14px; height:14px; }' +
      // ===== RESPONSIVO MOBILE =====
      '@media (max-width: 768px) {' +
      '  .at-dh-container {' +
      '    width:360px; height:auto; min-height:500px; border-radius:8px;' +
      '    background:url("fundo disney.png"), #0150B5;' +
      '    background-size:cover; background-position:center;' +
      '  }' +
      '  .at-dh-glow-layer, .at-dh-lens-flare { display:none; }' +
      '  .at-dh-layout {' +
      '    flex-direction:column; padding:20px 16px; gap:16px;' +
      '  }' +
      '  .at-dh-col-left, .at-dh-col-right { width:100%; margin-left:0; }' +
      '  .at-dh-col-right {' +
      '    position:absolute; top:0; right:0; width:auto; height:auto;' +
      '    pointer-events:none; gap:0;' +
      '  }' +
      '  .at-dh-close { position:absolute; top:16px; right:16px; z-index:10; pointer-events:auto; }' +
      '  .at-dh-txt-line1 { font-size:16px; }' +
      '  .at-dh-txt-body { font-size:14px; line-height:140%; }' +
      '  .at-dh-park-icon { height:16px; }' +
      '  .at-dh-offer-block { padding-bottom:22px; }' +
      '  .at-dh-coupon-wrap { margin-top:-36px; }' +
      '  .at-dh-coupon-box { width:100%; max-width:280px; }' +
      '  .at-dh-photo-col, .at-dh-photo-wrapper, .at-dh-copyright { display:none; }' +
      '}';

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
      y: u * u * startY + 2 * u * t * controlY + t * t * endY,
    };
  }

  function createShootingStarAnimation(callback) {
    injectStyles();

    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,10,40,0.92);z-index:999999;display:flex;align-items:center;' +
      'justify-content:center;opacity:0;transition:opacity 0.5s ease;overflow:hidden;';
    document.body.appendChild(overlay);

    var finished = false;
    function finishAnimation() {
      if (finished) return;
      finished = true;
      if (typeof callback === 'function') callback();
    }

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var startX = vw * 0.1,
      startY = vh * 0.75;
    var controlX = vw * 0.5,
      controlY = vh * -0.15;
    var endX = vw * 0.9,
      endY = vh * 0.7;

    var star = document.createElement('div');
    star.className = 'at-disney-star';
    overlay.appendChild(star);

    var flashPoint = getArcPoint(0.5, startX, startY, controlX, controlY, endX, endY);
    var flash = document.createElement('div');
    flash.className = 'at-disney-flash';
    flash.style.cssText = 'left:' + flashPoint.x + 'px;top:' + flashPoint.y + 'px;';
    overlay.appendChild(flash);

    requestAnimationFrame(function () {
      overlay.classList.add('at-disney-visible');
      overlay.style.opacity = '1';
    });

    var startTime = null,
      duration = 2200,
      sCount = 0,
      maxS = 80;

    function removeOverlayAndFinish() {
      overlay.classList.add('at-disney-fade-out');
      overlay.style.opacity = '0';
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        finishAnimation();
      }, 600);
    }

    setTimeout(function () {
      if (!finished) removeOverlayAndFinish();
    }, 6000);

    function animate(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var p = Math.min(elapsed / duration, 1);
      var ep = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var pt = getArcPoint(ep, startX, startY, controlX, controlY, endX, endY);

      var op = p < 0.05 ? (p / 0.05).toFixed(3) : p > 0.9 ? ((1 - p) / 0.1).toFixed(3) : '1';
      var sc = (0.5 + 0.5 * Math.sin(p * Math.PI)).toFixed(3);
      star.style.cssText =
        'position:absolute;left:' +
        pt.x +
        'px;top:' +
        pt.y +
        'px;' +
        'width:12px;height:12px;background:#fff;border-radius:50%;' +
        'box-shadow:0 0 20px 8px rgba(255,255,255,0.9),0 0 60px 20px rgba(100,180,255,0.6),0 0 100px 40px rgba(80,150,255,0.3);' +
        'z-index:3;filter:blur(0.5px);opacity:' +
        op +
        ';transform:translate(-50%,-50%) scale(' +
        sc +
        ');';

      if (sCount < maxS && p > 0.03 && p < 0.95) {
        if (Math.random() > 0.3) {
          createSparkle(overlay, pt.x, pt.y);
          sCount++;
        }
        if (Math.random() > 0.5) {
          createDust(overlay, pt.x, pt.y);
        }
      }

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        flash.classList.add('at-disney-animate-flash');
        for (var k = 0; k < 25; k++) createDust(overlay, pt.x, pt.y);
        setTimeout(function () {
          removeOverlayAndFinish();
        }, 800);
      }
    }
    setTimeout(function () {
      requestAnimationFrame(animate);
    }, 400);
  }

  function createSparkle(c, x, y) {
    var el = document.createElement('div');
    el.className = 'at-disney-sparkle';
    var ox = (Math.random() - 0.5) * 30,
      oy = (Math.random() - 0.5) * 30;
    var sz = 2 + Math.random() * 4,
      dur = 300 + Math.random() * 500;
    el.style.cssText =
      'position:absolute;left:' +
      (x + ox) +
      'px;top:' +
      (y + oy) +
      'px;' +
      'width:' +
      sz +
      'px;height:' +
      sz +
      'px;background:#fff;border-radius:50%;' +
      'box-shadow:0 0 6px 2px rgba(255,255,255,0.8),0 0 15px 5px rgba(100,180,255,0.4);' +
      'pointer-events:none;opacity:1;transition:opacity ' +
      dur +
      'ms ease-out;';
    c.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, dur + 50);
    }, 80);
  }

  function createDust(c, x, y) {
    var el = document.createElement('div');
    el.className = 'at-disney-dust';
    var ox = (Math.random() - 0.5) * 60,
      oy = (Math.random() - 0.5) * 60;
    var sz = 1 + Math.random() * 4,
      dl = Math.random() * 200;
    el.style.cssText =
      'position:absolute;left:' +
      (x + ox) +
      'px;top:' +
      (y + oy) +
      'px;' +
      'width:' +
      sz +
      'px;height:' +
      sz +
      'px;background:rgba(255,255,255,0.9);border-radius:50%;' +
      'box-shadow:0 0 8px 3px rgba(180,220,255,0.6);opacity:0;' +
      'animation:atDisneyDust 1.5s ease-out ' +
      dl +
      'ms forwards;';
    c.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1800);
  }

  // === BANNER HOTEIS DISNEY ===

  function createBanner() {
    injectStyles();

    // Marca exibicao antes de qualquer tracking para garantir regra de 1x/sessao
    markShown();

    var existing = document.getElementById(BANNER_ID);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var bannerOverlay = document.createElement('div');
    bannerOverlay.id = BANNER_ID;
    bannerOverlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999998;' +
      'display:flex;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,0.7);opacity:0;transition:opacity 0.6s ease;';

    // Container principal 720x500
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

    var lf3 = document.createElement('div');
    lf3.className = 'at-dh-lens-flare at-dh-lens-3';
    container.appendChild(lf3);

    // --- Estrelinhas piscando ---
    var sparkleLayer = document.createElement('div');
    sparkleLayer.className = 'at-dh-sparkle-layer';
    for (var i = 0; i < 20; i++) {
      var sh = document.createElement('div');
      sh.className = 'at-dh-shine';
      sh.style.cssText =
        'left:' +
        Math.random() * 100 +
        '%;top:' +
        Math.random() * 100 +
        '%;' +
        'animation-delay:' +
        Math.random() * 3 +
        's;animation-duration:' +
        (1.5 + Math.random() * 2) +
        's;';
      sparkleLayer.appendChild(sh);
    }
    container.appendChild(sparkleLayer);

    // --- Layout principal (flex) ---
    var layout = document.createElement('div');
    layout.className = 'at-dh-layout';

    // --- Coluna esquerda ---
    var colLeft = document.createElement('div');
    colLeft.className = 'at-dh-col-left';

    // Logo topo
    var logoWrap = document.createElement('div');
    logoWrap.className = 'at-dh-logo';
    var logoImg = document.createElement('img');
    logoImg.src = 'https://i.imgur.com/XXIXMQA.png';
    logoImg.alt = 'Walt Disney World';
    logoWrap.appendChild(logoImg);
    colLeft.appendChild(logoWrap);

    // Titulo
    var txt = document.createElement('div');
    txt.className = 'at-dh-txt';
    txt.innerHTML =
      '<span class="at-dh-txt-line1">Complete sua experi\u00EAncia m\u00E1gica!</span>' +
      '<span class="at-dh-txt-body">Garanta seus <strong>Ingressos <span class="at-dh-highlight">Disney</span></strong> com 12%OFF com o cupom exclusivo. Por tempo e disponibilidade limitada.</span>';
    colLeft.appendChild(txt);

    // Bloco oferta
    var offerBlock = document.createElement('div');
    offerBlock.className = 'at-dh-offer-block';

    var parkIcons = [
      { src: 'https://i.imgur.com/12lQ5lp.png', alt: 'Magic Kingdom' },
      { src: 'https://i.imgur.com/nLG5yvC.png', alt: 'Animal Kingdom' },
      { src: 'https://i.imgur.com/PhHNRqr.png', alt: 'Epcot' },
      { src: 'https://i.imgur.com/ZPcL8R3.png', alt: 'Hollywood Studios' },
      { src: 'https://i.imgur.com/jSNMMjB.png', alt: 'Blizzard Beach' },
      { src: 'https://i.imgur.com/noLA829.png', alt: 'Typhoon Lagoon' },
    ];
    var parkStrip = document.createElement('div');
    parkStrip.className = 'at-dh-park-strip';
    parkIcons.forEach(function (park) {
      var parkImg = document.createElement('img');
      parkImg.className = 'at-dh-park-icon';
      parkImg.src = park.src;
      parkImg.alt = park.alt;
      parkStrip.appendChild(parkImg);
    });
    offerBlock.appendChild(parkStrip);

    var offerFrame = document.createElement('div');
    offerFrame.className = 'at-dh-offer-frame';

    var bulletsWrap = document.createElement('div');
    bulletsWrap.className = 'at-dh-bullets';

    var bulletItems = [
      {
        type: 'check',
        html: '12%OFF em ingressos para todos os <strong>Parques Tem\u00E1ticos <span class="at-dh-highlight">Disney</span></strong> aplicando o cupom',
      },
      {
        type: 'check',
        html: 'V\u00E1lido de <strong>18/06/2026</strong> a <strong>30/06/2026</strong>',
      },
      {
        type: 'check',
        html: 'Apenas para viagens a serem realizadas entre <strong>18/05/2026</strong> a <strong>31/12/2027</strong>',
      },
    ];
    bulletItems.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'at-dh-bullet-row';

      var iconEl = document.createElement('div');
      iconEl.className = 'at-dh-bullet-icon-wrap';
      iconEl.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5L5.5 11L12 3.5" stroke="#00043E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      row.appendChild(iconEl);

      var bulletTxt = document.createElement('span');
      bulletTxt.className = 'at-dh-bullet-text';
      bulletTxt.innerHTML = item.html;
      row.appendChild(bulletTxt);

      bulletsWrap.appendChild(row);
    });
    offerFrame.appendChild(bulletsWrap);

    var couponWrap = document.createElement('div');
    couponWrap.className = 'at-dh-coupon-wrap';

    var couponLabel = document.createElement('div');
    couponLabel.className = 'at-dh-coupon-label';
    couponLabel.textContent = 'Aproveite o cupom';
    couponWrap.appendChild(couponLabel);

    var couponBtn = document.createElement('button');
    couponBtn.type = 'button';
    couponBtn.className = 'at-dh-coupon-box';
    couponBtn.setAttribute('aria-label', 'Copiar cupom ' + COUPON_CODE);
    couponBtn.innerHTML =
      '<span class="at-dh-coupon-percent" aria-hidden="true">' +
      '<img src="' +
      COUPON_ICON_TICKET +
      '" alt="" width="20" height="20" />' +
      '</span>' +
      '<span class="at-dh-coupon-code">' +
      COUPON_CODE +
      '</span>' +
      '<span class="at-dh-coupon-copy" aria-hidden="true">' +
      '<img src="' +
      COUPON_ICON_COPY +
      '" alt="" width="20" height="20" />' +
      '</span>';
    couponWrap.appendChild(couponBtn);

    offerBlock.appendChild(offerFrame);
    offerBlock.appendChild(couponWrap);
    colLeft.appendChild(offerBlock);

    // Rodape (CTA + consulte)
    var footer = document.createElement('div');
    footer.className = 'at-dh-footer';

    var cta = document.createElement('a');
    cta.className = 'at-dh-cta';
    cta.href = BANNER_LINK;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.textContent = 'Comprar ingressos';
    footer.appendChild(cta);

    var consult = document.createElement('div');
    consult.className = 'at-dh-consult';
    consult.textContent = '*Consulte condi\u00E7\u00F5es.';
    footer.appendChild(consult);

    colLeft.appendChild(footer);
    layout.appendChild(colLeft);

    // --- Coluna direita ---
    var colRight = document.createElement('div');
    colRight.className = 'at-dh-col-right';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'at-dh-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 1L13 13M13 1L1 13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    colRight.appendChild(closeBtn);

    var photoCol = document.createElement('div');
    photoCol.className = 'at-dh-photo-col';

    var photoWrap = document.createElement('div');
    photoWrap.className = 'at-dh-photo-wrapper';

    var photoImg = document.createElement('img');
    photoImg.className = 'at-dh-photo-img';
    photoImg.src = 'https://i.imgur.com/7dXE65l.png';
    photoImg.alt = 'Disney';
    photoWrap.appendChild(photoImg);
    photoCol.appendChild(photoWrap);

    var copy = document.createElement('div');
    copy.className = 'at-dh-copyright';
    copy.innerHTML = '\u00A9 2026 <span class="at-dh-highlight">Disney</span>';
    photoCol.appendChild(copy);

    colRight.appendChild(photoCol);
    layout.appendChild(colRight);

    container.appendChild(layout);

    // Monta tudo
    bannerOverlay.appendChild(container);
    document.body.appendChild(bannerOverlay);

    requestAnimationFrame(function () {
      bannerOverlay.classList.add('at-disney-banner-visible');
      bannerOverlay.style.opacity = '1';
    });

    // Tracking
    analyticsEvent('banner_disney_ingressos', 'view');

    // Eventos
    cta.addEventListener('click', function (e) {
      e.stopPropagation();
      try {
        localStorage.setItem(PROMO_AUTOCLOCK_KEY, String(Date.now()));
      } catch (err) {}
      analyticsEvent('banner_disney_ingressos_cta', 'click');
    });

    couponBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      copyCouponCode(couponBtn);
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      analyticsEvent('banner_disney_ingressos_fechar', 'click');
      closeBanner(bannerOverlay);
    });

    bannerOverlay.addEventListener('click', function (e) {
      if (e.target === bannerOverlay) {
        analyticsEvent('banner_disney_ingressos_overlay_fechar', 'click');
        closeBanner(bannerOverlay);
      }
    });

    var handleEsc = function (e) {
      if (e.key === 'Escape') {
        analyticsEvent('banner_disney_ingressos_esc_fechar', 'click');
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

  function setupExitIntentTrigger(onTrigger) {
    var done = false;
    function handler(e) {
      if (done) return;
      if (!e) return;
      // Exit intent: cursor sai pelo topo
      if (e.clientY > 0) return;
      done = true;
      document.removeEventListener('mouseout', handler);
      onTrigger('exit_intent');
    }
    document.addEventListener('mouseout', handler);
    return function cleanup() {
      document.removeEventListener('mouseout', handler);
    };
  }

  function setupInactivityTrigger(onTrigger) {
    var done = false;
    var timer = null;

    function arm() {
      if (done) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (done) return;
        done = true;
        cleanup();
        onTrigger('inactivity');
      }, INACTIVITY_MS);
    }

    function cleanup() {
      clearTimeout(timer);
      document.removeEventListener('mousemove', arm);
      document.removeEventListener('keydown', arm);
      document.removeEventListener('scroll', arm);
      document.removeEventListener('click', arm);
      document.removeEventListener('touchstart', arm);
    }

    document.addEventListener('mousemove', arm);
    document.addEventListener('keydown', arm);
    document.addEventListener('scroll', arm);
    document.addEventListener('click', arm);
    document.addEventListener('touchstart', arm);

    arm();
    return cleanup;
  }

  function init() {
    if (isBlockedHomePage()) {
      console.log('[Disney Hoteis Saida] Pagina home bloqueada. Modal nao sera exibido.');
      return;
    }

    if (!hasRequiredUtm()) {
      console.log('[Disney Hoteis Saida] UTM invalida ou ausente. Modal nao sera exibido.');
      return;
    }

    if (!canShowByRules()) {
      console.log(
        '[Disney Hoteis Saida] Regra de exibicao bloqueou (sessao/dia). Modal nao sera exibido.',
      );
      return;
    }

    injectStyles();
    // Preload comecando ja no inicio, antes do gatilho disparar
    preloadBannerAssets(function () {});

    var cleanups = [];
    var triggered = false;

    function fire(triggerSource) {
      if (triggered) return;
      triggered = true;
      cleanups.forEach(function (fn) {
        try {
          fn();
        } catch (e) {}
      });
      cleanups = [];

      console.log('[Disney Hoteis Saida] Gatilho disparado: ' + triggerSource);
      injectStyles();
      createShootingStarAnimation(function () {
        createBanner();
      });
    }

    cleanups.push(setupExitIntentTrigger(fire));
    cleanups.push(setupInactivityTrigger(fire));
  }

  init();
})();
