(function () {
  'use strict';

  var STYLE_ID = 'at-cross-sell-viagens-styles';
  var MODAL_ID = 'at-cross-sell-viagens-modal';
  var OVERLAY_ID = 'at-cross-sell-viagens-overlay';
  var CUPOM = 'CLIENTEAZUL';
  var AUTOCLICK_FLAG_KEY = 'at_cross_sell_minhas_viagens_autoclick_alterar_busca';
  var URL_PATH_FRAGMENT = 'br/pt/home/minhas-viagens';
  var SESSION_SHOWN_KEY = 'at_cross_sell_minhas_viagens_modal_session';
  var DAILY_SHOWN_KEY = 'at_cross_sell_minhas_viagens_modal_daily';
  var DISMISSED_KEY = 'at_cross_sell_minhas_viagens_modal_dismissed';
  var AZUL_ORIGIN = 'https://www.voeazul.com.br';
  var UTM_HOTEL =
    'utm_source=click-site&s_afili=afiliados_az_azv_click-site_null_uf_minhas-viagens_hotel_interna_cpc_bnr_hp_dinamico';
  var UTM_CARRO =
    'utm_source=click-site&s_afili=afiliados_az_azv_click-site_null_uf_minhas-viagens_carro_interna_cpc_bnr_hp_dinamico';
  var HOTEL_IMG = 'https://i.imgur.com/lIZNlje.png';
  var CARRO_IMG = 'https://i.imgur.com/ZJdga0p.png';
  var COPY_REDIRECT_DELAY_MS = 2000;
  var COPY_CHECK_SVG =
    '<svg class="at-cs-copy-check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
    '<path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function getTodayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1) + '-' + String(d.getDate());
  }

  function isTargetPage() {
    try {
      var href = ((window.location && window.location.href) || '').toLowerCase();
      var path = ((window.location && window.location.pathname) || '').toLowerCase();
      var fragment = URL_PATH_FRAGMENT.toLowerCase();

      return href.indexOf(fragment) !== -1 || path.indexOf(fragment) !== -1;
    } catch (e) {
      return false;
    }
  }

  function canShowModal() {
    try {
      if (sessionStorage.getItem(SESSION_SHOWN_KEY) === '1') {
        return false;
      }

      var today = getTodayKey();

      if (localStorage.getItem(DAILY_SHOWN_KEY) === today) {
        return false;
      }

      if (localStorage.getItem(DISMISSED_KEY) === today) {
        return false;
      }

      return true;
    } catch (e) {
      return true;
    }
  }

  function markModalShown() {
    try {
      var today = getTodayKey();
      sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
      localStorage.setItem(DAILY_SHOWN_KEY, today);
    } catch (e) {}
  }

  function markModalDismissed() {
    try {
      var today = getTodayKey();
      sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
      localStorage.setItem(DAILY_SHOWN_KEY, today);
      localStorage.setItem(DISMISSED_KEY, today);
    } catch (e) {}
  }

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';

    var css = [
      '#' + OVERLAY_ID + ' {',
      '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
      '  background: rgba(0,0,0,0.6); z-index: 99998;',
      '  opacity: 0; transition: opacity 0.3s ease;',
      '}',
      '#' + OVERLAY_ID + '.at-cs-visible { opacity: 1; }',

      '#' + MODAL_ID + ' {',
      '  position: fixed; top: 0; right: -420px; width: 380px;',
      '  height: 100vh; height: 100dvh; max-height: 100dvh;',
      '  z-index: 99999; overflow: hidden;',
      '  background: #FFFFFF;',
      '  box-shadow: -4px 0px 16px rgba(0, 0, 0, 0.25);',
      '  transition: right 0.4s cubic-bezier(0.22, 1, 0.36, 1);',
      '  display: grid; grid-template-rows: auto minmax(0, 1fr);',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '  box-sizing: border-box; min-height: 0;',
      '}',
      '#' + MODAL_ID + '.at-cs-open { right: 0; }',
      '#' + MODAL_ID + ', #' + MODAL_ID + ' * {',
      '  font-family: "Helvetica Neue", Arial, sans-serif !important;',
      '}',

      '.at-cs-header {',
      '  padding: 24px; flex-shrink: 0;',
      '  display: flex; flex-direction: column; align-items: flex-start; gap: 16px;',
      '  background: url("https://i.imgur.com/YD7f56X.png") center / cover no-repeat;',
      '}',
      '.at-cs-header-top {',
      '  display: flex; flex-direction: row; justify-content: space-between;',
      '  width: 100%;',
      '}',
      '.at-cs-badge {',
      '  display: inline-flex; align-items: center;',
      '  background: #026CB6; color: #FFFFFF;',
      '  font-size: 14px; font-weight: 700; padding: 4px 8px;',
      '  border-radius: 4px;',
      '}',
      '.at-cs-title {',
      '  font-size: 24px; font-weight: 700; color: #FFFFFF;',
      '  margin: 0; line-height: 1;',
      '}',
      '.at-cs-subtitle {',
      '  font-size: 12px; color: #F4F4F4;',
      '  margin: 0; line-height: 16px;',
      '}',
      '.at-cs-close {',
      '  background: none; border: none;',
      '  color: #F4F4F4; width: 24px; height: 24px;',
      '  cursor: pointer; display: flex;',
      '  align-items: center; justify-content: center; padding: 0; flex-shrink: 0;',
      '}',

      '.at-cs-body {',
      '  min-height: 0; height: 100%;',
      '  overflow-y: scroll; overflow-x: hidden;',
      '  -webkit-overflow-scrolling: touch;',
      '  overscroll-behavior: contain;',
      '  scrollbar-width: thin;',
      '  scrollbar-color: rgba(2, 108, 182, 0.45) transparent;',
      '  padding-bottom: env(safe-area-inset-bottom, 0px);',
      '}',
      '.at-cs-body::-webkit-scrollbar { width: 5px; }',
      '.at-cs-body::-webkit-scrollbar-thumb {',
      '  background: rgba(2, 108, 182, 0.45); border-radius: 4px;',
      '}',

      '.at-cs-cards {',
      '  padding: 16px 0 24px;',
      '  display: flex; flex-direction: column; align-items: center; gap: 16px;',
      '  flex-shrink: 0;',
      '}',
      '.at-cs-card {',
      '  box-sizing: border-box;',
      '  background: #FFFFFF; border-radius: 8px; overflow: hidden;',
      '  border: 1px solid #C0C0C0;',
      '  width: 318px; flex-shrink: 0;',
      '}',
      '.at-cs-card-img-wrapper {',
      '  position: relative; width: 100%; overflow: hidden;',
      '}',
      '.at-cs-card-img {',
      '  width: 100%; height: 178px; object-fit: cover; display: block;',
      '}',
      '.at-cs-card-label {',
      '  position: absolute; right: 8px; top: 8px;',
      '  background: #F6A124; color: #041E42;',
      '  font-size: 12px; font-weight: 700;',
      '  padding: 4px 8px; border-radius: 4px;',
      '  height: 24px; display: flex; align-items: center; justify-content: center;',
      '  box-sizing: border-box;',
      '}',
      '.at-cs-card-body { padding: 16px 16px 0px; background: #FFFFFF; }',
      '.at-cs-card-inner {',
      '  display: flex; flex-direction: column; align-items: flex-start;',
      '  padding: 0px 0px 16px; gap: 14px;',
      '}',
      '.at-cs-card-title {',
      '  font-size: 16px; font-weight: 700; color: #041E42;',
      '  margin: 0;',
      '}',
      '.at-cs-card-desc {',
      '  font-size: 14px; color: #606060; line-height: 18px; margin: 0;',
      '}',
      '.at-cs-card-actions {',
      '  display: flex; flex-direction: column; align-items: stretch; gap: 8px; width: 100%;',
      '}',
      '.at-cs-copy-btn {',
      '  display: flex; width: 100%; min-height: 32px; height: auto;',
      '  -webkit-box-align: center; align-items: center; gap: 8px;',
      '  -webkit-box-pack: justify; justify-content: center;',
      '  border-radius: 4px;',
      '  border: 1px solid #026CB6;',
      '  background: #FFFFFF;',
      '  cursor: pointer;',
      '  color: #026CB6;',
      '  font-size: 14px; font-weight: 400; line-height: 1.2; text-align: center;',
      '  transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease;',
      '  box-sizing: border-box; padding: 6px 8px;',
      '  position: relative; overflow: hidden;',
      '}',
      '.at-cs-copy-btn:hover {',
      '  background: rgba(2, 108, 182, 0.08);',
      '}',
      '.at-cs-copy-btn:disabled { cursor: default; }',
      '.at-cs-copy-btn img { width: 24px; height: 24px; flex-shrink: 0; transition: opacity 0.25s ease, transform 0.25s ease; }',
      '.at-cs-copy-btn-label { transition: opacity 0.25s ease, transform 0.25s ease; }',
      '.at-cs-copy-check {',
      '  display: none; align-items: center; justify-content: center;',
      '  width: 24px; height: 24px; flex-shrink: 0;',
      '}',
      '.at-cs-copy-check-icon { display: block; }',
      '.at-cs-copy-btn.at-cs-copied {',
      '  background: #026CB6; color: #FFFFFF; border-color: #026CB6;',
      '  animation: at-cs-copy-pulse 0.5s ease;',
      '  box-shadow: 0 0 0 0 rgba(2, 108, 182, 0.4);',
      '}',
      '.at-cs-copy-btn.at-cs-copied.at-cs-copied-glow {',
      '  animation: at-cs-copy-glow 1.2s ease-out 0.5s;',
      '}',
      '.at-cs-copy-btn.at-cs-copied img { opacity: 0; transform: scale(0.5); width: 0; margin: 0; }',
      '.at-cs-copy-btn.at-cs-copied .at-cs-copy-check { display: flex; animation: at-cs-check-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1); }',
      '.at-cs-copy-btn.at-cs-copied .at-cs-copy-btn-label { animation: at-cs-label-in 0.35s ease; font-weight: 600; }',
      '.at-cs-copy-btn.at-cs-copied::after {',
      '  content: ""; position: absolute; left: 0; bottom: 0; height: 3px;',
      '  background: rgba(255, 255, 255, 0.85); border-radius: 0 0 3px 3px;',
      '  animation: at-cs-redirect-bar ' + (COPY_REDIRECT_DELAY_MS / 1000) + 's linear forwards;',
      '}',
      '@keyframes at-cs-redirect-bar {',
      '  from { width: 0; }',
      '  to { width: 100%; }',
      '}',
      '@keyframes at-cs-copy-pulse {',
      '  0% { transform: scale(1); }',
      '  35% { transform: scale(1.05); }',
      '  100% { transform: scale(1); }',
      '}',
      '@keyframes at-cs-copy-glow {',
      '  0% { box-shadow: 0 0 0 0 rgba(2, 108, 182, 0.35); }',
      '  70% { box-shadow: 0 0 0 8px rgba(2, 108, 182, 0); }',
      '  100% { box-shadow: 0 0 0 0 rgba(2, 108, 182, 0); }',
      '}',
      '@keyframes at-cs-check-pop {',
      '  0% { transform: scale(0) rotate(-20deg); opacity: 0; }',
      '  65% { transform: scale(1.2) rotate(0deg); opacity: 1; }',
      '  100% { transform: scale(1) rotate(0deg); opacity: 1; }',
      '}',
      '@keyframes at-cs-label-in {',
      '  0% { opacity: 0.4; transform: translateY(4px); }',
      '  100% { opacity: 1; transform: translateY(0); }',
      '}',
      '.at-cs-points-text {',
      '  font-size: 12px; font-weight: 400; color: #041E42;',
      '  line-height: 18px; margin: 0;',
      '}',

      '.at-cs-footer {',
      '  padding: 16px 28px 24px; flex-shrink: 0; text-align: center;',
      '  background: #FFFFFF;',
      '  border-top: 1px solid rgba(0, 0, 0, 0.08);',
      '}',
      '.at-cs-dismiss {',
      '  background: none; border: none; color: #026CB6;',
      '  font-size: 14px; font-weight: 400; cursor: pointer;',
      '  padding: 8px 16px; transition: color 0.2s;',
      '}',
      '.at-cs-dismiss:hover { text-decoration: underline; }',

      '@media screen and (max-height: 860px) {',
      '  .at-cs-header { padding: 18px 20px; gap: 12px; }',
      '  .at-cs-title { font-size: 21px; line-height: 1.1; }',
      '  .at-cs-subtitle { font-size: 11px; line-height: 15px; }',
      '  .at-cs-cards { padding: 12px 0 20px; gap: 12px; }',
      '  .at-cs-card-img { height: 140px; }',
      '  .at-cs-card-inner { gap: 10px; padding-bottom: 12px; }',
      '  .at-cs-footer { padding: 12px 20px 18px; }',
      '}',

      '@media screen and (max-height: 720px) {',
      '  .at-cs-header { padding: 14px 16px; gap: 8px; }',
      '  .at-cs-badge { font-size: 12px; padding: 3px 6px; }',
      '  .at-cs-title { font-size: 18px; }',
      '  .at-cs-subtitle { font-size: 10px; line-height: 14px; }',
      '  .at-cs-cards { padding: 10px 0 16px; gap: 10px; }',
      '  .at-cs-card-img { height: 112px; }',
      '  .at-cs-card-body { padding: 12px 12px 0; }',
      '  .at-cs-card-inner { gap: 8px; padding-bottom: 10px; }',
      '  .at-cs-card-title { font-size: 15px; }',
      '  .at-cs-card-desc { font-size: 12px; line-height: 16px; }',
      '  .at-cs-copy-btn { font-size: 13px; padding: 7px 8px; }',
      '  .at-cs-points-text { font-size: 11px; line-height: 14px; }',
      '  .at-cs-footer { padding: 10px 16px 14px; }',
      '}',

      '@media screen and (max-height: 580px) {',
      '  .at-cs-header { padding: 12px 14px; gap: 6px; }',
      '  .at-cs-title { font-size: 16px; }',
      '  .at-cs-subtitle { font-size: 10px; line-height: 13px; }',
      '  .at-cs-card-img { height: 88px; }',
      '  .at-cs-footer { padding: 8px 16px 12px; }',
      '}',

      '@media screen and (max-width: 580px) {',
      '  #' + MODAL_ID + ' {',
      '    width: calc(100vw - 24px); max-width: 380px;',
      '    top: 0; height: 100vh; height: 100dvh; max-height: 100dvh;',
      '    right: calc(24px - 100vw);',
      '    border-radius: 8px 0 0 8px;',
      '    min-height: 0;',
      '  }',
      '  #' + MODAL_ID + '.at-cs-open { right: 0; }',
      '  .at-cs-header { padding: 14px 16px; gap: 8px; flex-shrink: 0; }',
      '  .at-cs-header-top { justify-content: space-between; }',
      '  .at-cs-badge { font-size: 12px; padding: 3px 6px; }',
      '  .at-cs-title { font-size: 17px; line-height: 1.15; }',
      '  .at-cs-subtitle { font-size: 11px; line-height: 14px; }',
      '  .at-cs-cards { padding: 10px 0 16px; gap: 10px; }',
      '  .at-cs-card { width: calc(100% - 24px); }',
      '  .at-cs-card-img { height: 108px; }',
      '  .at-cs-card-body { padding: 10px 10px 0px; }',
      '  .at-cs-card-inner { gap: 8px; padding-bottom: 10px; }',
      '  .at-cs-card-title { font-size: 14px; }',
      '  .at-cs-card-desc { font-size: 11px; line-height: 15px; }',
      '  .at-cs-copy-btn { font-size: 12px; padding: 7px 6px; }',
      '  .at-cs-points-text { font-size: 10px; line-height: 14px; }',
      '  .at-cs-footer { padding: 12px 16px 16px; }',
      '}',
    ].join('\n');

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function normalizeAzulUrl(href) {
    if (!href) {
      return '';
    }

    href = href.trim();

    if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) {
      return href;
    }

    if (href.indexOf('//') === 0) {
      return 'https:' + href;
    }

    if (href.indexOf('/') === 0) {
      return AZUL_ORIGIN + href;
    }

    return AZUL_ORIGIN + '/' + href;
  }

  function isOfferUrlForType(url, type) {
    var lower = (url || '').toLowerCase();

    if (type === 'hotel') {
      return lower.indexOf('/home/hotel') !== -1;
    }

    return lower.indexOf('/home/cars') !== -1;
  }

  function scoreOfferUrl(url) {
    var score = 0;

    if (url.indexOf('ds=') !== -1) {
      score += 10;
    }
    if (url.indexOf('stdi=') !== -1) {
      score += 5;
    }
    if (url.indexOf('stdo=') !== -1) {
      score += 5;
    }
    if (url.indexOf('r[0].adt=') !== -1) {
      score += 3;
    }

    return score;
  }

  function cardMatchesType(node, type) {
    if (!node) {
      return false;
    }

    var imgs = node.querySelectorAll('img');

    for (var j = 0; j < imgs.length; j++) {
      var imgAlt = (imgs[j].getAttribute('alt') || '').toLowerCase();
      var imgSrc = (imgs[j].getAttribute('src') || '').toLowerCase();

      if (type === 'hotel' && (imgAlt === 'hotel' || imgSrc.indexOf('hotel') !== -1)) {
        return true;
      }

      if (
        type === 'carro' &&
        (imgAlt === 'carro' || imgSrc.indexOf('cars') !== -1 || imgSrc.indexOf('carro') !== -1)
      ) {
        return true;
      }
    }

    return false;
  }

  function appendQueryParam(url, param) {
    if (!url || url.indexOf(param.split('=')[0] + '=') !== -1) {
      return url;
    }

    var hash = '';
    var hashIndex = url.indexOf('#');

    if (hashIndex !== -1) {
      hash = url.substring(hashIndex);
      url = url.substring(0, hashIndex);
    }

    url = url + (url.indexOf('?') !== -1 ? '&' : '?') + param;

    return url + hash;
  }

  function ensureOfferUrlMeta(url, type) {
    var result = url || '';
    var utm = type === 'hotel' ? UTM_HOTEL : UTM_CARRO;

    if (result.indexOf('utm_source=') === -1) {
      result = appendQueryParam(result, utm);
    }

    if (type === 'hotel' && result.indexOf('#') === -1) {
      result = result + '#hotelList';
    }

    return result;
  }

  function findNativeOfferUrl(type) {
    var best = '';
    var bestScore = -1;
    var i;
    var href;
    var score;

    try {
      var anchors = document.querySelectorAll('a[href]');

      for (i = 0; i < anchors.length; i++) {
        href = normalizeAzulUrl(anchors[i].getAttribute('href') || '');

        if (!isOfferUrlForType(href, type)) {
          continue;
        }

        score = scoreOfferUrl(href);

        if (score > bestScore) {
          bestScore = score;
          best = href;
        }
      }

      var buttons = document.querySelectorAll('button');

      for (i = 0; i < buttons.length; i++) {
        var btn = buttons[i];

        if (btn.textContent.indexOf('CLIENTEAZUL') === -1) {
          continue;
        }

        var node = btn.parentElement;

        while (node && node !== document.body) {
          if (cardMatchesType(node, type)) {
            var link = node.querySelector('a[href]');

            if (link) {
              href = normalizeAzulUrl(link.getAttribute('href') || '');

              if (isOfferUrlForType(href, type)) {
                score = scoreOfferUrl(href) + 2;

                if (score > bestScore) {
                  bestScore = score;
                  best = href;
                }
              }
            }

            break;
          }

          node = node.parentElement;
        }
      }
    } catch (e) {}

    if (best) {
      return ensureOfferUrlMeta(best, type);
    }

    var fallbackPath = type === 'hotel' ? '/br/pt/home/hotel' : '/br/pt/home/cars';
    return ensureOfferUrlMeta(AZUL_ORIGIN + fallbackPath, type);
  }

  function resolveOfferUrl(type) {
    return findNativeOfferUrl(type);
  }

  function buildCardHtml(type, labelText, title, desc, imgSrc, redirectUrl, actionLabel) {
    return (
      '<div class="at-cs-card">' +
      '<div class="at-cs-card-img-wrapper">' +
      '<img class="at-cs-card-img" src="' +
      imgSrc +
      '" alt="' +
      title +
      '">' +
      '<span class="at-cs-card-label">' +
      labelText +
      '</span>' +
      '</div>' +
      '<div class="at-cs-card-body">' +
      '<div class="at-cs-card-inner">' +
      '<h3 class="at-cs-card-title">' +
      title +
      '</h3>' +
      '<p class="at-cs-card-desc">' +
      desc +
      '</p>' +
      '<div class="at-cs-card-actions">' +
      '<button class="at-cs-copy-btn" data-at-redirect="' +
      redirectUrl +
      '" data-at-type="' +
      type +
      '">' +
      '<span class="at-cs-copy-btn-label">' +
      actionLabel +
      '</span>' +
      '<span class="at-cs-copy-check">' +
      COPY_CHECK_SVG +
      '</span>' +
      '<img src="/content/dam/azul/voe-azul/copy.svg" alt="Copiar cupom">' +
      '</button>' +
      '<p class="at-cs-points-text">Acumule até 4.100 pontos com Cartão Azul Itaú</p>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function setAutoclickFlag(cardType) {
    if (cardType !== 'hotel' && cardType !== 'carro') {
      return;
    }

    try {
      localStorage.setItem(AUTOCLICK_FLAG_KEY, cardType + ':' + String(Date.now()));
    } catch (e) {}
  }

  function copyCupomToClipboard(callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(CUPOM)
        .then(function () {
          callback(true);
        })
        .catch(function () {
          callback(copyCupomFallback());
        });
      return;
    }

    callback(copyCupomFallback());
  }

  function copyCupomFallback() {
    var textarea = document.createElement('textarea');
    textarea.value = CUPOM;
    textarea.style.setProperty('position', 'fixed', 'important');
    textarea.style.setProperty('left', '-9999px', 'important');
    document.body.appendChild(textarea);
    textarea.select();

    var copied = false;

    try {
      copied = document.execCommand('copy');
    } catch (e) {
      copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
  }

  function showCopySuccessOnButton(btn) {
    if (!btn) {
      return;
    }

    btn.disabled = true;
    btn.setAttribute('data-at-copied', 'true');

    var label = btn.querySelector('.at-cs-copy-btn-label');
    if (label) {
      label.textContent = 'Cupom copiado! Redirecionando...';
    }

    btn.classList.add('at-cs-copied');

    setTimeout(function () {
      btn.classList.add('at-cs-copied-glow');
    }, 50);
  }

  function redirectToOffer(type, targetUrl) {
    var url = targetUrl || resolveOfferUrl(type);
    window.open(url, '_blank');
  }

  function handleCopyClick(btn) {
    if (!btn || btn.getAttribute('data-at-copied') === 'true') {
      return;
    }

    var targetUrl = btn.getAttribute('data-at-redirect') || '';
    var cardType = btn.getAttribute('data-at-type') || '';

    copyCupomToClipboard(function () {
      showCopySuccessOnButton(btn);
      setAutoclickFlag(cardType);
      analyticsEvent('cupom_copiado_' + cardType, 'clique');

      setTimeout(function () {
        redirectToOffer(cardType, targetUrl);
      }, COPY_REDIRECT_DELAY_MS);
    });
  }

  function closeModal(source) {
    var modal = document.getElementById(MODAL_ID);
    var overlay = document.getElementById(OVERLAY_ID);
    var closeSource = source || 'desconhecido';

    if (modal) {
      modal.classList.remove('at-cs-open');
    }
    if (overlay) {
      overlay.classList.remove('at-cs-visible');
      setTimeout(function () {
        if (overlay && overlay.parentNode) {
          overlay.remove();
        }
        if (modal && modal.parentNode) {
          modal.remove();
        }
      }, 400);
    }

    markModalDismissed();
    analyticsEvent('modal_fechado_' + closeSource, 'clique');
  }

  function addListeners() {
    var closeBtn = document.querySelector('#' + MODAL_ID + ' .at-cs-close');
    if (closeBtn && closeBtn.getAttribute('data-at-listener-added') !== 'true') {
      closeBtn.setAttribute('data-at-listener-added', 'true');
      closeBtn.addEventListener('click', function () {
        closeModal('fechar');
      });
    }

    var dismissBtn = document.querySelector('#' + MODAL_ID + ' .at-cs-dismiss');
    if (dismissBtn && dismissBtn.getAttribute('data-at-listener-added') !== 'true') {
      dismissBtn.setAttribute('data-at-listener-added', 'true');
      dismissBtn.addEventListener('click', function () {
        closeModal('agora_nao');
      });
    }

    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.getAttribute('data-at-listener-added') !== 'true') {
      overlay.setAttribute('data-at-listener-added', 'true');
      overlay.addEventListener('click', function () {
        closeModal('overlay');
      });
    }

    var copyBtns = document.querySelectorAll('#' + MODAL_ID + ' .at-cs-copy-btn');
    for (var i = 0; i < copyBtns.length; i++) {
      (function (btn) {
        if (btn.getAttribute('data-at-listener-added') === 'true') {
          return;
        }
        btn.setAttribute('data-at-listener-added', 'true');
        btn.addEventListener('click', function () {
          handleCopyClick(btn);
        });
      })(copyBtns[i]);
    }
  }

  function buildModal() {
    if (document.getElementById(MODAL_ID)) {
      return;
    }

    var overlayEl = document.createElement('div');
    overlayEl.id = OVERLAY_ID;
    document.body.appendChild(overlayEl);

    var modalEl = document.createElement('div');
    modalEl.id = MODAL_ID;

    var hotelUrl = resolveOfferUrl('hotel');
    var carroUrl = resolveOfferUrl('carro');

    var html =
      '<div class="at-cs-header">' +
      '<div class="at-cs-header-top">' +
      '<span class="at-cs-badge">15% OFF exclusivo</span>' +
      '<button class="at-cs-close" aria-label="Fechar">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12.5 4.21L11.79 3.5L8 7.29L4.21 3.5L3.5 4.21L7.29 8L3.5 11.79L4.21 12.5L8 8.71L11.79 12.5L12.5 11.79L8.71 8L12.5 4.21Z" fill="#F4F4F4"/></svg>' +
      '</button>' +
      '</div>' +
      '<h2 class="at-cs-title">Complete sua viagem com desconto!</h2>' +
      '<p class="at-cs-subtitle">Clientes Azul tem cupom de 15% de desconto para hot&eacute;is e aluguel de ve&iacute;culos. Ao copiar, voc&ecirc; ser&aacute; direcionado para continuar a busca.</p>' +
      '</div>' +
      '<div class="at-cs-body">' +
      '<div class="at-cs-cards">' +
      buildCardHtml(
        'hotel',
        'Desconto exclusivo',
        'Hotéis com 15% OFF',
        'Hospedagens perfeitas para transformar sua viagem em uma experiência inesquecível.',
        HOTEL_IMG,
        hotelUrl,
        'Copiar cupom e buscar hotéis',
      ) +
      buildCardHtml(
        'carro',
        'Desconto exclusivo',
        'Carro com 15% OFF',
        'Encontre o carro ideal para deixar sua experiência de viagem ainda mais completa.',
        CARRO_IMG,
        carroUrl,
        'Copiar cupom e buscar carros',
      ) +
      '</div>' +
      '<div class="at-cs-footer">' +
      '<button class="at-cs-dismiss">Agora não, obrigado(a)</button>' +
      '</div>' +
      '</div>';

    modalEl.innerHTML = html;
    document.body.appendChild(modalEl);

    addListeners();

    markModalShown();

    setTimeout(function () {
      overlayEl.classList.add('at-cs-visible');
      modalEl.classList.add('at-cs-open');
      analyticsEvent('modal_exibido', 'impressao');
    }, 100);
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      return;
    }

    var labelEvent = 'AT_CrossSell_MinhasViagens_' + eventType + ' ' + eventLabel;
    console.log('[Tracking CrossSell MinhasViagens] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_cross_sell_minhas_viagens';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function init() {
    if (!isTargetPage()) {
      return;
    }

    if (!canShowModal()) {
      return;
    }

    injectCSS();
    buildModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
