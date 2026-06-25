(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let retryCount = 0;
  let viewTracked = false;

  const STYLE_ID = 'wj-333-botao-flutuante-style';
  const ROOT_CLASS = 'wj-bf-whatsapp';
  const ROOT_ATTR = 'data-wj-bf-done';
  const TRACKING_ATTR = 'data-wj-bf-tracking-added';
  const OBSERVER_KEY = '_wj333BotaoFlutuanteObserver';
  const MAX_RETRIES = 30;
  const RETRY_DELAY = 250;
  const OBSERVER_DELAY = 200;
  const TRACKING_CATEGORY = 'botao_flutuante_333';
  const WHATSAPP_PHONE = '+551145724545';
  const MASCOT_SRC = 'https://i.imgur.com/PM4dYNf.png';
  const CHAT_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<defs>' +
    '<filter id="wj-bf-wa-glow" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="0.55" result="blur"/>' +
    '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>' +
    '</defs>' +
    '<g filter="url(#wj-bf-wa-glow)">' +
    '<path d="M12 4.4c-4.36 0-7.9 3.12-7.9 6.97 0 1.95.94 3.72 2.48 4.95l-.84 3.05 3.14-.96c1.02.52 2.17.82 3.12.82 4.36 0 7.9-3.12 7.9-6.97S16.36 4.4 12 4.4Z" stroke="#ffffff" stroke-width="1.45" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</g>' +
    '</svg>';

  function getStyles() {
    return [
      '#whatsapp-wrapper { display: none !important; }',
      '.' + ROOT_CLASS + ' {',
      '  position: fixed;',
      '  right: 18px;',
      '  bottom: 22px;',
      '  z-index: 2147483000;',
      '  width: auto;',
      '  pointer-events: none;',
      '}',
      '.' + ROOT_CLASS + ' * { box-sizing: border-box; }',
      '.' + ROOT_CLASS + '__link {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: flex-end;',
      '  gap: 14px;',
      '  color: inherit;',
      '  text-decoration: none;',
      '  cursor: pointer;',
      '  pointer-events: auto;',
      '}',
      '.' + ROOT_CLASS + '__avatar {',
      '  position: relative;',
      '  z-index: 2;',
      '  display: block;',
      '  width: 72px;',
      '  height: 72px;',
      '  margin: 0;',
      '  border: 4px solid #ffffff;',
      '  border-radius: 50%;',
      '  object-fit: cover;',
      '  background: #f6b26b;',
      '  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.2);',
      '  transition: transform 160ms ease, box-shadow 160ms ease;',
      '}',
      '.' + ROOT_CLASS + '__link:hover .' + ROOT_CLASS + '__avatar {',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.24);',
      '}',
      '.' + ROOT_CLASS + '__pill {',
      '  position: relative;',
      '  z-index: 1;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  min-height: 52px;',
      '  padding: 12px 18px 12px 14px;',
      '  border: none;',
      '  border-radius: 999px;',
      '  background: #24a944;',
      '  color: #ffffff;',
      '  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.24);',
      '  transition: transform 160ms ease, box-shadow 160ms ease;',
      '}',
      '.' + ROOT_CLASS + '__link:hover .' + ROOT_CLASS + '__pill {',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.28);',
      '}',
      '.' + ROOT_CLASS + '__icon {',
      '  flex: 0 0 auto;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 24px;',
      '  height: 24px;',
      '}',
      '.' + ROOT_CLASS + '__text {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 1px;',
      '  min-width: 0;',
      '  font-family: Ubuntu, Arial, Helvetica, sans-serif;',
      '  line-height: 1.15;',
      '}',
      '.' + ROOT_CLASS + '__title {',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  color: #ffffff;',
      '}',
      '.' + ROOT_CLASS + '__subtitle {',
      '  font-size: 12px;',
      '  font-weight: 400;',
      '  color: #ffffff;',
      '}',
      '@media (max-width: 480px) {',
      '  .' + ROOT_CLASS + ' {',
      '    right: 12px;',
      '    bottom: 16px;',
      '  }',
      '  .' + ROOT_CLASS + '__pill {',
      '    min-height: 48px;',
      '    padding: 10px 14px 10px 12px;',
      '  }',
      '  .' + ROOT_CLASS + '__title { font-size: 13px; }',
      '  .' + ROOT_CLASS + '__subtitle { font-size: 11px; }',
      '  .' + ROOT_CLASS + '__avatar {',
      '    width: 64px;',
      '    height: 64px;',
      '  }',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function sendTrackingEvent(label, action) {
    const payload = {
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action || 'click',
      local_event_label: label,
    };

    if (window.gtmDataObject && typeof window.gtmDataObject.push === 'function') {
      window.gtmDataObject.push(payload);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function trackViewOnce() {
    if (viewTracked) return;
    viewTracked = true;
    sendTrackingEvent('visualizou_botao_flutuante', 'view');
  }

  function hideNativeWrapper() {
    const wrapper = document.getElementById('whatsapp-wrapper');
    if (!wrapper) return;
    wrapper.style.setProperty('display', 'none', 'important');
  }

  function getDefaultWhatsAppText() {
    const categoryTitle = document.querySelector('.page-title .base, h1.page-title, h1');
    const categoryName = categoryTitle ? categoryTitle.textContent.replace(/\s+/g, ' ').trim() : '';
    if (categoryName) {
      return 'Olá 333obra, estou na página da categoria ' + categoryName + ' e gostaria de ajuda!';
    }
    return 'Olá 333obra, gostaria de ajuda!';
  }

  function getWhatsAppHref() {
    const nativeLink = document.getElementById('whatsapp-link');
    if (nativeLink && nativeLink.href) {
      return nativeLink.href;
    }

    const text = encodeURIComponent(getDefaultWhatsAppText());
    return 'https://web.whatsapp.com/send?l=pt&phone=' + WHATSAPP_PHONE + '&text=' + text;
  }

  function bindTracking(link) {
    if (!link || link.getAttribute(TRACKING_ATTR) === 'true') return;
    link.addEventListener('click', function () {
      sendTrackingEvent('clicou_botao_flutuante_whatsapp', 'click');
    });
    link.setAttribute(TRACKING_ATTR, 'true');
  }

  function buildFloatingButton() {
    const root = document.createElement('div');
    root.className = ROOT_CLASS;
    root.setAttribute(ROOT_ATTR, 'true');
    root.setAttribute('data-wj-bf-node', 'true');

    const link = document.createElement('a');
    link.className = ROOT_CLASS + '__link';
    link.id = 'wj-bf-whatsapp-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.href = getWhatsAppHref();
    link.setAttribute('aria-label', 'Precisa de ajuda? Fale com um especialista pelo WhatsApp');

    const avatar = document.createElement('img');
    avatar.className = ROOT_CLASS + '__avatar';
    avatar.src = MASCOT_SRC;
    avatar.alt = '';
    avatar.setAttribute('aria-hidden', 'true');

    const pill = document.createElement('span');
    pill.className = ROOT_CLASS + '__pill';

    const icon = document.createElement('span');
    icon.className = ROOT_CLASS + '__icon';
    icon.innerHTML = CHAT_ICON_SVG;

    const textWrap = document.createElement('span');
    textWrap.className = ROOT_CLASS + '__text';

    const title = document.createElement('strong');
    title.className = ROOT_CLASS + '__title';
    title.textContent = 'Precisa de ajuda?';

    const subtitle = document.createElement('span');
    subtitle.className = ROOT_CLASS + '__subtitle';
    subtitle.textContent = 'Fale com um especialista';

    textWrap.appendChild(title);
    textWrap.appendChild(subtitle);
    pill.appendChild(icon);
    pill.appendChild(textWrap);
    link.appendChild(avatar);
    link.appendChild(pill);
    root.appendChild(link);
    bindTracking(link);

    return root;
  }

  function migrateLegacyStructure(root) {
    const link = root.querySelector('.' + ROOT_CLASS + '__link');
    const avatar = root.querySelector('.' + ROOT_CLASS + '__avatar');
    if (!link || !avatar || link.contains(avatar)) return;

    const pill = document.createElement('span');
    pill.className = ROOT_CLASS + '__pill';

    while (link.firstChild) {
      pill.appendChild(link.firstChild);
    }

    link.appendChild(avatar);
    link.appendChild(pill);
  }

  function updateExistingButton(root) {
    migrateLegacyStructure(root);

    const link = root.querySelector('.' + ROOT_CLASS + '__link');
    if (!link) return;
    link.href = getWhatsAppHref();
    bindTracking(link);
  }

  function ensureFloatingButton() {
    hideNativeWrapper();

    let root = document.querySelector('.' + ROOT_CLASS + '[' + ROOT_ATTR + '="true"]');
    if (!root) {
      root = buildFloatingButton();
      document.body.appendChild(root);
      trackViewOnce();
      return true;
    }

    updateExistingButton(root);
    trackViewOnce();
    return true;
  }

  function run() {
    if (isProcessing) return false;
    isProcessing = true;

    let applied = false;

    try {
      applied = ensureFloatingButton();
    } finally {
      isProcessing = false;
    }

    return applied;
  }

  function startObserver() {
    if (window[OBSERVER_KEY]) return;

    const observer = new MutationObserver(function (mutations) {
      let hasRelevant = false;

      for (let i = 0; i < mutations.length; i++) {
        const target = mutations[i].target;
        if (!target || target.id === STYLE_ID) continue;
        if (target.closest && target.closest('.' + ROOT_CLASS)) continue;
        hasRelevant = true;
        break;
      }

      if (!hasRelevant) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, OBSERVER_DELAY);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window[OBSERVER_KEY] = observer;
  }

  function initWithRetry() {
    injectStyles();
    const applied = run();

    if (applied) {
      startObserver();
      return;
    }

    retryCount += 1;
    if (retryCount < MAX_RETRIES) {
      setTimeout(initWithRetry, RETRY_DELAY);
      return;
    }

    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithRetry);
  } else {
    initWithRetry();
  }
})();
