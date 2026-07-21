(function () {
  'use strict';

  var STYLE_ID = 'at-cross-sell-viagens-styles';
  var MODAL_ID = 'at-cross-sell-viagens-modal';
  var OVERLAY_ID = 'at-cross-sell-viagens-overlay';
  var CUPOM = 'CLIENTEAZUL';
  var HOTEL_URL = 'https://www.voeazul.com.br/hoteis';
  var CARRO_URL = 'https://www.voeazul.com.br/carros';
  var HOTEL_IMG = 'https://www.voeazul.com.br/content/dam/azul/voe-azul/banners_my_trips/hotel.png';
  var CARRO_IMG = 'https://www.voeazul.com.br/content/dam/azul/voe-azul/banners_my_trips/cars.jpg';

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
      '  position: fixed; top: 0; right: -480px; width: 440px; height: 100%;',
      '  z-index: 99999; overflow-y: auto; overflow-x: hidden;',
      '  background: rgb(255, 255, 255);',
      '  box-shadow: -4px 0 24px rgba(0,0,0,0.4);',
      '  transition: right 0.4s cubic-bezier(0.22, 1, 0.36, 1);',
      '  display: flex; flex-direction: column;',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',
      '#' + MODAL_ID + '.at-cs-open { right: 0; }',
      '#' + MODAL_ID + ', #' + MODAL_ID + ' * {',
      '  font-family: "Helvetica Neue", Arial, sans-serif !important;',
      '}',

      '.at-cs-header {',
      '  padding: 32px 28px 20px; flex-shrink: 0;',
      '  background: linear-gradient(63deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%);',
      '}',
      '.at-cs-badge {',
      '  display: inline-block; background: #F37021; color: #fff;',
      '  font-size: 13px; font-weight: 700; padding: 6px 16px;',
      '  border-radius: 100px; margin-bottom: 16px;',
      '}',
      '.at-cs-title {',
      '  font-size: 26px; font-weight: 800; color: #fff;',
      '  margin: 0 0 8px; line-height: 1.2;',
      '}',
      '.at-cs-subtitle {',
      '  font-size: 15px; color: rgba(255,255,255,0.85);',
      '  margin: 0; line-height: 1.5;',
      '}',
      '.at-cs-close {',
      '  position: absolute; top: 24px; right: 24px;',
      '  background: rgba(255,255,255,0.15); border: none;',
      '  color: #fff; width: 36px; height: 36px; border-radius: 50%;',
      '  font-size: 20px; cursor: pointer; display: flex;',
      '  align-items: center; justify-content: center;',
      '  transition: background 0.2s;',
      '}',
      '.at-cs-close:hover { background: rgba(255,255,255,0.3); }',

      '.at-cs-cards {',
      '  flex: 1; padding: 0 28px 12px;',
      '  display: flex; flex-direction: column; gap: 20px;',
      '  margin-top: 20px;',
      '}',
      '.at-cs-card {',
      '  background: #fff; border-radius: 16px; overflow: hidden;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.15);',
      '}',
      '.at-cs-card-img {',
      '  width: 100%; height: 160px; object-fit: cover; display: block;',
      '}',
      '.at-cs-card-body { padding: 20px; }',
      '.at-cs-card-type {',
      '  font-size: 11px; font-weight: 700; text-transform: uppercase;',
      '  color: #F37021; letter-spacing: 1px; margin: 0 0 6px;',
      '}',
      '.at-cs-card-title {',
      '  font-size: 18px; font-weight: 800; color: rgb(1, 78, 132);',
      '  margin: 0 0 8px;',
      '}',
      '.at-cs-card-desc {',
      '  font-size: 14px; color: rgba(1, 78, 132, 0.88); line-height: 1.5; margin: 0 0 16px;',
      '}',
      '.at-cs-card-actions {',
      '  display: flex; flex-direction: column; align-items: stretch; gap: 10px;',
      '}',
      '.at-cs-copy-btn {',
      '  display: flex; width: 100%; height: 48px;',
      '  -webkit-box-align: center; align-items: center; gap: 8px;',
      '  -webkit-box-pack: center; justify-content: center;',
      '  border-radius: 8px;',
      '  border: 1px solid rgb(2, 108, 182);',
      '  background: rgb(255, 255, 255);',
      '  cursor: pointer;',
      '  color: rgb(2, 108, 182);',
      '  font-size: 14px; font-weight: 700;',
      '  transition: background 0.2s, border-color 0.2s;',
      '  box-sizing: border-box;',
      '}',
      '.at-cs-copy-btn:hover {',
      '  background: rgba(2, 108, 182, 0.08);',
      '  border-color: rgb(2, 108, 182);',
      '}',
      '.at-cs-copy-btn svg { width: 16px; height: 16px; flex-shrink: 0; }',
      '.at-cs-points-badge {',
      '  display: inline-flex; align-items: center; gap: 4px;',
      '  align-self: center;',
      '  background: #E8F5E9; color: #2E7D32; font-size: 12px;',
      '  font-weight: 700; padding: 6px 12px; border-radius: 100px;',
      '}',
      '.at-cs-points-badge svg { width: 14px; height: 14px; }',

      '.at-cs-footer {',
      '  padding: 16px 28px 28px; flex-shrink: 0; text-align: center;',
      '  background: rgb(255, 255, 255);',
      '  border-top: 1px solid rgba(0, 0, 0, 0.08);',
      '}',
      '.at-cs-dismiss {',
      '  background: none; border: none; color: rgb(1, 78, 132);',
      '  font-size: 15px; font-weight: 600; cursor: pointer;',
      '  padding: 8px 16px; transition: color 0.2s;',
      '}',
      '.at-cs-dismiss:hover { color: rgb(2, 108, 182); text-decoration: underline; }',

      '.at-cs-toast {',
      '  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);',
      '  background: rgb(4, 30, 66); color: #fff; padding: 12px 24px;',
      '  border-radius: 100px; font-size: 14px; font-weight: 600;',
      '  font-family: "Helvetica Neue", Arial, sans-serif !important;',
      '  z-index: 100000; opacity: 0; transition: opacity 0.3s;',
      '  pointer-events: none; white-space: nowrap;',
      '}',
      '.at-cs-toast.at-cs-visible { opacity: 1; }',

      '@media screen and (max-width: 580px) {',
      '  #' + MODAL_ID + ' {',
      '    width: 100%; right: -105%;',
      '    height: 100%; border-radius: 0;',
      '  }',
      '  #' + MODAL_ID + '.at-cs-open { right: 0; }',
      '  .at-cs-header { padding: 24px 20px 16px; }',
      '  .at-cs-title { font-size: 22px; }',
      '  .at-cs-subtitle { font-size: 14px; }',
      '  .at-cs-cards { padding: 0 20px 12px; gap: 16px; margin-top: 20px; }',
      '  .at-cs-card-img { height: 130px; }',
      '  .at-cs-card-body { padding: 16px; }',
      '  .at-cs-card-title { font-size: 16px; }',
      '  .at-cs-card-desc { font-size: 13px; margin-bottom: 12px; }',
      '  .at-cs-card-actions { gap: 8px; }',
      '  .at-cs-footer { padding: 12px 20px 20px; }',
      '  .at-cs-close { top: 16px; right: 16px; }',
      '}'
    ].join('\n');

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function copySvgIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>' +
      '</svg>';
  }

  function pointsSvgIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>' +
      '</svg>';
  }

  function buildCardHtml(type, title, desc, imgSrc, redirectUrl) {
    return '<div class="at-cs-card">' +
      '<img class="at-cs-card-img" src="' + imgSrc + '" alt="' + title + '">' +
      '<div class="at-cs-card-body">' +
      '<p class="at-cs-card-type">' + type + '</p>' +
      '<h3 class="at-cs-card-title">' + title + '</h3>' +
      '<p class="at-cs-card-desc">' + desc + '</p>' +
      '<div class="at-cs-card-actions">' +
      '<button class="at-cs-copy-btn" data-at-redirect="' + redirectUrl + '">' +
      copySvgIcon() +
      '<span>Copiar cupom e reservar</span>' +
      '</button>' +
      '<span class="at-cs-points-badge">' + pointsSvgIcon() + ' ACUMULE PONTOS</span>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function showToast(message) {
    var existingToast = document.querySelector('.at-cs-toast');
    if (existingToast) {
      existingToast.remove();
    }

    var toast = document.createElement('div');
    toast.className = 'at-cs-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('at-cs-visible');
    }, 50);

    setTimeout(function () {
      toast.classList.remove('at-cs-visible');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 2000);
  }

  function copyAndRedirect(redirectUrl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CUPOM).then(function () {
        showToast('Cupom ' + CUPOM + ' copiado!');
        setTimeout(function () {
          window.open(redirectUrl, '_blank');
        }, 800);
      }).catch(function () {
        fallbackCopy(redirectUrl);
      });
      return;
    }

    fallbackCopy(redirectUrl);
  }

  function fallbackCopy(redirectUrl) {
    var textarea = document.createElement('textarea');
    textarea.value = CUPOM;
    textarea.style.setProperty('position', 'fixed', 'important');
    textarea.style.setProperty('left', '-9999px', 'important');
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      showToast('Cupom ' + CUPOM + ' copiado!');
    } catch (e) {
      showToast('Cupom: ' + CUPOM);
    }

    document.body.removeChild(textarea);

    setTimeout(function () {
      window.open(redirectUrl, '_blank');
    }, 800);
  }

  function closeModal() {
    var modal = document.getElementById(MODAL_ID);
    var overlay = document.getElementById(OVERLAY_ID);

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

    analyticsEvent('modal_fechado', 'dismiss');
  }

  function addListeners() {
    var closeBtn = document.querySelector('#' + MODAL_ID + ' .at-cs-close');
    if (closeBtn && closeBtn.getAttribute('data-at-listener-added') !== 'true') {
      closeBtn.setAttribute('data-at-listener-added', 'true');
      closeBtn.addEventListener('click', closeModal);
    }

    var dismissBtn = document.querySelector('#' + MODAL_ID + ' .at-cs-dismiss');
    if (dismissBtn && dismissBtn.getAttribute('data-at-listener-added') !== 'true') {
      dismissBtn.setAttribute('data-at-listener-added', 'true');
      dismissBtn.addEventListener('click', closeModal);
    }

    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.getAttribute('data-at-listener-added') !== 'true') {
      overlay.setAttribute('data-at-listener-added', 'true');
      overlay.addEventListener('click', closeModal);
    }

    var copyBtns = document.querySelectorAll('#' + MODAL_ID + ' .at-cs-copy-btn');
    for (var i = 0; i < copyBtns.length; i++) {
      (function (btn) {
        if (btn.getAttribute('data-at-listener-added') === 'true') {
          return;
        }
        btn.setAttribute('data-at-listener-added', 'true');
        btn.addEventListener('click', function () {
          var targetUrl = btn.getAttribute('data-at-redirect') || '';
          analyticsEvent('cupom_copiado_' + targetUrl, 'clique');
          copyAndRedirect(targetUrl);
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

    var html = '<div class="at-cs-header">' +
      '<span class="at-cs-badge">15% OFF exclusivo</span>' +
      '<button class="at-cs-close" aria-label="Fechar">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12.5 4.21L11.79 3.5L8 7.29L4.21 3.5L3.5 4.21L7.29 8L3.5 11.79L4.21 12.5L8 8.71L11.79 12.5L12.5 11.79L8.71 8L12.5 4.21Z" fill="white"/></svg>' +
      '</button>' +
      '<h2 class="at-cs-title">Complete sua viagem com desconto!</h2>' +
      '<p class="at-cs-subtitle">Clientes Azul tem cupom exclusivo de 15% para Hotel e Carro. Copie e aproveite!</p>' +
      '</div>' +
      '<div class="at-cs-cards">' +
      buildCardHtml(
        'Hotel',
        'Hotel com 15% OFF',
        'Sua viagem com conforto e desconto! Clientes que compram passagem aerea com a Azul ganham 15% Off no Hotel.',
        HOTEL_IMG,
        HOTEL_URL
      ) +
      buildCardHtml(
        'Carro',
        'Carro com 15% OFF',
        'Novidade: Mais uma comodidade para sua viagem ser inesquecivel! Alugue um carro com desconto exclusivo.',
        CARRO_IMG,
        CARRO_URL
      ) +
      '</div>' +
      '<div class="at-cs-footer">' +
      '<button class="at-cs-dismiss">Agora nao, obrigado</button>' +
      '</div>';

    modalEl.innerHTML = html;
    document.body.appendChild(modalEl);

    addListeners();

    setTimeout(function () {
      overlayEl.classList.add('at-cs-visible');
      modalEl.classList.add('at-cs-open');
    }, 100);

    analyticsEvent('modal_exibido', 'impressao');
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
    injectCSS();
    buildModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
