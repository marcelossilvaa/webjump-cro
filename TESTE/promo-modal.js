(function () {
  'use strict';

  var PM_CONFIG = {
    ROOT_ID: 'pm-promo-modal-root',
    STYLE_ID: 'pm-promo-modal-style',
    STORAGE_KEY: 'pm_promo_modal_seen',
    INACTIVITY_MS: 10000,
    PROMO_URL: '/promocoes',
    IMAGE_URL:
      'https://www.nestlenutre.com.br/media/wysiwyg/NHS_-_E-com_NAV_-_Nestl_Nutre_-_Subcategoria_-_Promo_es_-_Desktop_V1.png',
    COUPON: 'NUTRICAO10',
  };

  var PM_state = {
    isOpen: false,
    hasShown: false,
    inactivityTimer: null,
    lastScrollY: window.scrollY || 0,
    listenersBound: false,
  };

  function PM_q(selector, root) {
    try {
      return (root || document).querySelector(selector);
    } catch (e) {
      return null;
    }
  }

  function PM_injectStyles() {
    if (document.getElementById(PM_CONFIG.STYLE_ID)) return;

    var R = '#' + PM_CONFIG.ROOT_ID;
    var css = [
      R + '{position:fixed;inset:0;z-index:100000;display:none}',
      R + '.pm-open{display:block}',
      R + ' *{box-sizing:border-box;font-family:"Lato",Arial,sans-serif}',
      R + ' .pm-overlay{position:absolute;inset:0;background:rgba(0,0,0,.55);border:0;cursor:default}',
      R + ' .pm-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(920px,calc(100vw - 32px));background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.3);display:grid;grid-template-columns:1.15fr 1fr}',
      R + ' .pm-image-wrap{min-height:340px;background:#f4f4f4}',
      R + ' .pm-image{display:block;width:100%;height:100%;object-fit:cover}',
      R + ' .pm-content{position:relative;padding:28px 28px 24px;display:flex;flex-direction:column;justify-content:center}',
      R + ' .pm-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:0;border-radius:999px;background:#f5f7f9;color:#173C56;font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}',
      R + ' .pm-tag{display:inline-flex;align-self:flex-start;padding:6px 10px;border-radius:999px;background:#FFE9F3;color:#C22A78;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-bottom:14px}',
      R + ' .pm-title{font-size:30px;line-height:1.1;font-weight:700;color:#173C56;margin:0 0 12px}',
      R + ' .pm-text{font-size:16px;line-height:1.45;color:#173C56;margin:0 0 18px}',
      R + ' .pm-coupon-wrap{background:#F5F7F9;border:1px dashed #173C56;border-radius:12px;padding:12px 14px;margin-bottom:16px}',
      R + ' .pm-coupon-label{display:block;font-size:12px;color:#173C56;opacity:.8;margin-bottom:4px}',
      R + ' .pm-coupon-code{display:block;font-size:28px;line-height:1;font-weight:700;color:#173C56;letter-spacing:.03em}',
      R + ' .pm-coupon-help{font-size:12px;color:#173C56;opacity:.8;margin-top:4px}',
      R + ' .pm-actions{display:flex;gap:10px;flex-wrap:wrap}',
      R + ' .pm-btn{height:44px;padding:0 20px;border-radius:999px;border:0;cursor:pointer;font-size:15px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}',
      R + ' .pm-btn-primary{background:#173C56;color:#fff}',
      R + ' .pm-btn-secondary{background:transparent;border:1px solid #173C56;color:#173C56}',
      R + ' .pm-footnote{margin-top:14px;font-size:11px;line-height:1.4;color:#173C56;opacity:.75}',
      '@media (max-width: 900px){' +
        R + ' .pm-modal{grid-template-columns:1fr;max-height:calc(100vh - 24px);overflow:auto}' +
        R + ' .pm-image-wrap{min-height:200px;height:34vh}' +
        R + ' .pm-content{padding:22px 18px 20px}' +
        R + ' .pm-title{font-size:26px}' +
        R + ' .pm-coupon-code{font-size:24px}' +
      '}',
      '@media (max-width: 480px){' +
        R + ' .pm-modal{width:calc(100vw - 16px);border-radius:14px}' +
        R + ' .pm-image-wrap{height:28vh;min-height:160px}' +
        R + ' .pm-title{font-size:22px}' +
        R + ' .pm-text{font-size:14px}' +
        R + ' .pm-btn{width:100%}' +
      '}',
    ].join('\n');

    var style = document.createElement('style');
    style.id = PM_CONFIG.STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  function PM_buildDOM() {
    var existing = document.getElementById(PM_CONFIG.ROOT_ID);
    if (existing) return existing;

    var root = document.createElement('div');
    root.id = PM_CONFIG.ROOT_ID;

    var overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'pm-overlay';
    overlay.setAttribute('aria-label', 'Fechar modal de promoções');

    var modal = document.createElement('aside');
    modal.className = 'pm-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'pm-title');

    var imageWrap = document.createElement('div');
    imageWrap.className = 'pm-image-wrap';
    var image = document.createElement('img');
    image.className = 'pm-image';
    image.src = PM_CONFIG.IMAGE_URL;
    image.alt = 'Promoções Nestlé Nutre';
    image.loading = 'lazy';
    imageWrap.appendChild(image);

    var content = document.createElement('div');
    content.className = 'pm-content';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'pm-close';
    close.setAttribute('aria-label', 'Fechar');
    close.textContent = '×';

    var tag = document.createElement('span');
    tag.className = 'pm-tag';
    tag.textContent = 'Oferta especial';

    var title = document.createElement('h3');
    title.id = 'pm-title';
    title.className = 'pm-title';
    title.textContent = 'Descontos imperdíveis em Promoções';

    var text = document.createElement('p');
    text.className = 'pm-text';
    text.textContent =
      'Aproveite agora os melhores produtos com condições especiais e ganhe desconto extra no seu pedido.';

    var couponWrap = document.createElement('div');
    couponWrap.className = 'pm-coupon-wrap';
    couponWrap.innerHTML =
      '<span class="pm-coupon-label">Use o cupom</span>' +
      '<strong class="pm-coupon-code">' +
      PM_CONFIG.COUPON +
      '</strong>' +
      '<span class="pm-coupon-help">Copie e aplique no checkout.</span>';

    var actions = document.createElement('div');
    actions.className = 'pm-actions';

    var cta = document.createElement('a');
    cta.className = 'pm-btn pm-btn-primary';
    cta.href = PM_CONFIG.PROMO_URL;
    cta.textContent = 'Ver promoções';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'pm-btn pm-btn-secondary';
    copyBtn.setAttribute('data-pm-copy', '1');
    copyBtn.textContent = 'Copiar cupom';

    var footnote = document.createElement('p');
    footnote.className = 'pm-footnote';
    footnote.textContent = 'Cupom válido conforme regras da campanha.';

    actions.appendChild(cta);
    actions.appendChild(copyBtn);

    content.appendChild(close);
    content.appendChild(tag);
    content.appendChild(title);
    content.appendChild(text);
    content.appendChild(couponWrap);
    content.appendChild(actions);
    content.appendChild(footnote);

    modal.appendChild(imageWrap);
    modal.appendChild(content);

    root.appendChild(overlay);
    root.appendChild(modal);
    document.body.appendChild(root);

    return root;
  }

  function PM_copyCoupon(button) {
    var code = PM_CONFIG.COUPON;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(function () {
          if (button) button.textContent = 'Cupom copiado!';
          setTimeout(function () {
            if (button) button.textContent = 'Copiar cupom';
          }, 1800);
        })
        .catch(function () {
          PM_fallbackCopy(code, button);
        });
      return;
    }
    PM_fallbackCopy(code, button);
  }

  function PM_fallbackCopy(text, button) {
    var input = document.createElement('input');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'absolute';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      if (button) button.textContent = 'Cupom copiado!';
    } catch (e) {
      if (button) button.textContent = text;
    }
    document.body.removeChild(input);
    setTimeout(function () {
      if (button) button.textContent = 'Copiar cupom';
    }, 1800);
  }

  function PM_open(reason) {
    if (PM_state.isOpen || PM_state.hasShown) return;
    var root = PM_buildDOM();
    root.classList.add('pm-open');
    document.body.style.overflow = 'hidden';
    PM_state.isOpen = true;
    PM_state.hasShown = true;
    try {
      sessionStorage.setItem(PM_CONFIG.STORAGE_KEY, '1');
    } catch (e) {}
  }

  function PM_close() {
    var root = document.getElementById(PM_CONFIG.ROOT_ID);
    if (!root) return;
    root.classList.remove('pm-open');
    PM_state.isOpen = false;
    document.body.style.overflow = '';
  }

  function PM_resetInactivityTimer() {
    if (PM_state.hasShown) return;
    if (PM_state.inactivityTimer) clearTimeout(PM_state.inactivityTimer);
    PM_state.inactivityTimer = setTimeout(function () {
      PM_open('inactivity_10s');
    }, PM_CONFIG.INACTIVITY_MS);
  }

  function PM_onScrollExitIntent() {
    if (PM_state.hasShown) return;
    var y = window.scrollY || 0;
    var prev = PM_state.lastScrollY;
    var delta = prev - y;

    // Exit scroll: usuário estava mais abaixo e sobe rápido para o topo.
    if (prev > 260 && y < 80 && delta > 80) {
      PM_open('exit_scroll');
    }

    PM_state.lastScrollY = y;
  }

  function PM_bindEvents() {
    if (PM_state.listenersBound) return;
    PM_state.listenersBound = true;

    document.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        if (!target) return;

        var root = document.getElementById(PM_CONFIG.ROOT_ID);
        if (!root) return;

        if (
          target.classList.contains('pm-overlay') ||
          target.classList.contains('pm-close') ||
          (target.closest && target.closest('.pm-close'))
        ) {
          PM_close();
          return;
        }

        var copyBtn = target.getAttribute('data-pm-copy') ? target : target.closest('[data-pm-copy]');
        if (copyBtn) {
          PM_copyCoupon(copyBtn);
        }
      },
      true
    );

    // inatividade
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
      window.addEventListener(evt, PM_resetInactivityTimer, { passive: true });
    });

    // scroll de saída
    window.addEventListener('scroll', PM_onScrollExitIntent, { passive: true });
  }

  function PM_bootstrap() {
    try {
      PM_state.hasShown = sessionStorage.getItem(PM_CONFIG.STORAGE_KEY) === '1';
    } catch (e) {}

    PM_injectStyles();
    PM_buildDOM();
    PM_bindEvents();
    PM_resetInactivityTimer();

    // Hook opcional para QA/debug
    window.PM_openPromoModal = function () {
      PM_open('manual');
    };
    window.PM_closePromoModal = PM_close;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PM_bootstrap);
  } else {
    PM_bootstrap();
  }
})();
