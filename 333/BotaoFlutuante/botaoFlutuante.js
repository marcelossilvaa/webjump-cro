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
  const NATIVE_WRAPPER_IDS = ['whatsapp-wrapper', 'whatsapp-wrapper-2'];
  const MASCOT_SRC = 'https://i.imgur.com/PM4dYNf.png';
  const CHAT_ICON_SRC = 'https://i.imgur.com/WU7xgtM.png';

  function getStyles() {
    return [
      '#whatsapp-wrapper, #whatsapp-wrapper-2, .whatsapp-wrapper-2 {',
      '  display: none !important;',
      '  visibility: hidden !important;',
      '  opacity: 0 !important;',
      '  pointer-events: none !important;',
      '}',
      '.' + ROOT_CLASS + ' {',
      '  position: fixed;',
      '  right: 18px;',
      '  bottom: 22px;',
      '  z-index: 2147483000;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: flex-end;',
      '  gap: 14px;',
      '  width: auto;',
      '  pointer-events: none;',
      '}',
      '.' + ROOT_CLASS + ' * { box-sizing: border-box; }',
      '.' + ROOT_CLASS + '__avatar-link,',
      '.' + ROOT_CLASS + '__pill-link {',
      '  color: inherit;',
      '  text-decoration: none;',
      '  cursor: pointer;',
      '  pointer-events: auto;',
      '}',
      '.' + ROOT_CLASS + '__avatar-link {',
      '  display: block;',
      '  line-height: 0;',
      '  border-radius: 50%;',
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
      '.' + ROOT_CLASS + '__avatar-link:hover .' + ROOT_CLASS + '__avatar {',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.24);',
      '}',
      '.' + ROOT_CLASS + '__pill-link {',
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
      '.' + ROOT_CLASS + '__pill-link:hover {',
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
      '.' + ROOT_CLASS + '__icon-img {',
      '  display: block;',
      '  width: 24px;',
      '  height: 24px;',
      '  object-fit: contain;',
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
      '  .' + ROOT_CLASS + '__pill-link {',
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
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = getStyles();
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

  function isMobileViewport() {
    return window.matchMedia('(max-width: 480px)').matches;
  }

  function hideNativeWrapper() {
    for (let i = 0; i < NATIVE_WRAPPER_IDS.length; i++) {
      const wrapper = document.getElementById(NATIVE_WRAPPER_IDS[i]);
      if (!wrapper) continue;
      wrapper.style.setProperty('display', 'none', 'important');
      wrapper.style.setProperty('visibility', 'hidden', 'important');
      wrapper.style.setProperty('opacity', '0', 'important');
      wrapper.style.setProperty('pointer-events', 'none', 'important');
    }
  }

  function getNativeWhatsAppLink() {
    const mobileLink = document.getElementById('whatsapp-link-2');
    const desktopLink = document.getElementById('whatsapp-link');

    if (isMobileViewport()) {
      if (mobileLink && mobileLink.href) return mobileLink;
      if (desktopLink && desktopLink.href) return desktopLink;
      return null;
    }

    if (desktopLink && desktopLink.href) return desktopLink;
    if (mobileLink && mobileLink.href) return mobileLink;
    return null;
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
    const nativeLink = getNativeWhatsAppLink();
    if (nativeLink && nativeLink.href) {
      return nativeLink.href;
    }

    const text = encodeURIComponent(getDefaultWhatsAppText());
    if (isMobileViewport()) {
      return 'https://wa.me/' + WHATSAPP_PHONE + '/?text=' + text;
    }
    return 'https://web.whatsapp.com/send?l=pt&phone=' + WHATSAPP_PHONE + '&text=' + text;
  }

  function createChatIcon() {
    const icon = document.createElement('span');
    icon.className = ROOT_CLASS + '__icon';

    const iconImg = document.createElement('img');
    iconImg.className = ROOT_CLASS + '__icon-img';
    iconImg.src = CHAT_ICON_SRC;
    iconImg.alt = '';
    iconImg.setAttribute('aria-hidden', 'true');
    iconImg.width = 24;
    iconImg.height = 24;
    icon.appendChild(iconImg);

    return icon;
  }

  function ensureChatIcon(pillLink) {
    if (!pillLink) return;

    let icon = pillLink.querySelector('.' + ROOT_CLASS + '__icon');
    const iconImg = pillLink.querySelector('.' + ROOT_CLASS + '__icon-img');

    if (!icon) {
      pillLink.insertBefore(createChatIcon(), pillLink.firstChild);
      return;
    }

    if (!iconImg) {
      icon.innerHTML = '';
      const newImg = document.createElement('img');
      newImg.className = ROOT_CLASS + '__icon-img';
      newImg.src = CHAT_ICON_SRC;
      newImg.alt = '';
      newImg.setAttribute('aria-hidden', 'true');
      newImg.width = 24;
      newImg.height = 24;
      icon.appendChild(newImg);
      return;
    }

    if (iconImg.src.indexOf('WU7xgtM') === -1) {
      iconImg.src = CHAT_ICON_SRC;
    }
  }

  function bindTracking(link, label) {
    if (!link || link.getAttribute(TRACKING_ATTR) === 'true') return;
    link.addEventListener('click', function () {
      sendTrackingEvent(label || 'clicou_botao_flutuante_whatsapp', 'click');
    });
    link.setAttribute(TRACKING_ATTR, 'true');
  }

  function createWhatsAppLink(className, id, ariaLabel) {
    const link = document.createElement('a');
    link.className = className;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.href = getWhatsAppHref();
    if (id) link.id = id;
    if (ariaLabel) link.setAttribute('aria-label', ariaLabel);
    return link;
  }

  function buildFloatingButton() {
    const root = document.createElement('div');
    root.className = ROOT_CLASS;
    root.setAttribute(ROOT_ATTR, 'true');
    root.setAttribute('data-wj-bf-node', 'true');

    const href = getWhatsAppHref();
    const avatarLink = createWhatsAppLink(
      ROOT_CLASS + '__avatar-link',
      '',
      'Fale com um especialista pelo WhatsApp',
    );
    avatarLink.href = href;

    const avatar = document.createElement('img');
    avatar.className = ROOT_CLASS + '__avatar';
    avatar.src = MASCOT_SRC;
    avatar.alt = '';
    avatar.setAttribute('aria-hidden', 'true');
    avatarLink.appendChild(avatar);

    const pillLink = createWhatsAppLink(
      ROOT_CLASS + '__pill-link',
      'wj-bf-whatsapp-link',
      'Precisa de ajuda? Fale com um especialista pelo WhatsApp',
    );
    pillLink.href = href;

    const icon = createChatIcon();

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
    pillLink.appendChild(icon);
    pillLink.appendChild(textWrap);

    root.appendChild(avatarLink);
    root.appendChild(pillLink);
    bindTracking(avatarLink, 'clicou_botao_flutuante_avatar');
    bindTracking(pillLink, 'clicou_botao_flutuante_whatsapp');

    return root;
  }

  function migrateLegacyStructure(root) {
    if (root.querySelector('.' + ROOT_CLASS + '__pill-link')) return;

    const legacyLink = root.querySelector('.' + ROOT_CLASS + '__link');
    if (!legacyLink) return;

    const href = legacyLink.href || getWhatsAppHref();
    const avatar = legacyLink.querySelector('.' + ROOT_CLASS + '__avatar');
    const pill = legacyLink.querySelector('.' + ROOT_CLASS + '__pill');

    const avatarLink = createWhatsAppLink(
      ROOT_CLASS + '__avatar-link',
      '',
      'Fale com um especialista pelo WhatsApp',
    );
    avatarLink.href = href;

    const pillLink = createWhatsAppLink(
      ROOT_CLASS + '__pill-link',
      'wj-bf-whatsapp-link',
      'Precisa de ajuda? Fale com um especialista pelo WhatsApp',
    );
    pillLink.href = href;

    if (avatar) {
      avatarLink.appendChild(avatar);
      root.insertBefore(avatarLink, legacyLink);
    }

    if (pill) {
      while (pill.firstChild) {
        pillLink.appendChild(pill.firstChild);
      }
      root.insertBefore(pillLink, legacyLink);
    } else {
      while (legacyLink.firstChild) {
        const child = legacyLink.firstChild;
        if (child.classList && child.classList.contains(ROOT_CLASS + '__avatar')) continue;
        pillLink.appendChild(child);
      }
      if (pillLink.childNodes.length) {
        root.insertBefore(pillLink, legacyLink);
      }
    }

    legacyLink.parentNode.removeChild(legacyLink);
    bindTracking(avatarLink, 'clicou_botao_flutuante_avatar');
    bindTracking(pillLink, 'clicou_botao_flutuante_whatsapp');
  }

  function updateExistingButton(root) {
    migrateLegacyStructure(root);

    const href = getWhatsAppHref();
    const links = root.querySelectorAll(
      '.' + ROOT_CLASS + '__avatar-link, .' + ROOT_CLASS + '__pill-link',
    );

    for (let i = 0; i < links.length; i++) {
      links[i].href = href;
    }

    const avatarLink = root.querySelector('.' + ROOT_CLASS + '__avatar-link');
    const pillLink = root.querySelector('.' + ROOT_CLASS + '__pill-link');
    bindTracking(avatarLink, 'clicou_botao_flutuante_avatar');
    bindTracking(pillLink, 'clicou_botao_flutuante_whatsapp');
    ensureChatIcon(pillLink);
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

    window.addEventListener('resize', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, OBSERVER_DELAY);
    });
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
