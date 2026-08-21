(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_ComoParticiparCartaoItau';
  const STYLE_ID = 'at-itau-carousel-style';
  const COMPONENT_ID = 'at-itau-carousel';
  const DATA_INJECTED = 'data-at-itau-carousel';
  const DATA_SPLIT = 'data-at-itau-split';
  const DATA_IMAGE = 'data-at-itau-image';
  const DATA_VIEW = 'data-at-itau-carousel-view';
  const DATA_NEUTRALIZED = 'data-at-itau-carousel-neutralized';
  const DATA_LISTENER = 'data-at-itau-carousel-listener';
  const ACTIVITY = EXPERIMENT_NAME;
  const CONTEXT = 'lp_ofertas_itau';
  const IMG_FRAGMENT = 'bnr-azul-itauDireita';
  const TOTAL_STEPS = 3;

  const CONFIG = {
    ctaUrl: 'https://www.voeazul.com.br/br/pt/programa-fidelidade/azul-itau',
    regulamentoUrl: '',
    ctaTarget: '_blank',
    mobileImageUrl: 'https://i.imgur.com/0gVchUc.png',
    desktopStepImages: [
      '',
      'https://i.imgur.com/vHlsUp5.png',
      'https://i.imgur.com/Cc5wTVS.png',
    ],
    mobileStepImages: [
      'https://i.imgur.com/0gVchUc.png',
      'https://i.imgur.com/HW82mhn.png',
      'https://i.imgur.com/wlR9lJW.png',
    ],
  };

  const ICON_PREV =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M15 6.5L9 12l6 5.5" stroke="#041E42" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  const ICON_NEXT =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M9 6.5L15 12l-6 5.5" stroke="#041E42" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  const ICON_CTA =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6" stroke="#008BC4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  let isProcessing = false;
  let debounceTimer = null;
  let observerStarted = false;
  let resizeBound = false;
  let currentStep = 0;
  let touchStartX = 0;

  if (window[EXPERIMENT_NAME] && document.getElementById(COMPONENT_ID)) {
    return;
  }
  window[EXPERIMENT_NAME] = true;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking ComoParticiparItau] Parametro ausente para evento analytics.');
      return;
    }

    const labelEvent = ACTIVITY + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking ComoParticiparItau] Analytics event disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = CONTEXT + '|passo_' + (currentStep + 1);

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getCss() {
    return [
      '#' + COMPONENT_ID + '{',
      '  box-sizing:border-box;',
      '  display:flex;',
      '  flex-direction:column;',
      '  align-items:stretch;',
      '  width:100%;',
      '  max-width:100%;',
      '  margin:0;',
      '  padding:40px 48px;',
      '  gap:20px;',
      '  background:#FFFFFF;',
      '  font-family:"Helvetica Neue",Arial,sans-serif;',
      '  color:#041E42;',
      '  text-align:left;',
      '}',
      '#' + COMPONENT_ID + ' *,',
      '#' + COMPONENT_ID + ' *::before,',
      '#' + COMPONENT_ID + ' *::after{box-sizing:border-box;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__title{',
      '  margin:0;',
      '  font-size:30px;',
      '  line-height:48px;',
      '  font-weight:700;',
      '  color:#041E42;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__steps{',
      '  display:flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  gap:80px;',
      '  margin:0;',
      '  min-height:40px;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__step{',
      '  display:flex;',
      '  justify-content:center;',
      '  align-items:flex-end;',
      '  margin:0;',
      '  padding:4px 4px 0;',
      '  border:0;',
      '  background:transparent;',
      '  cursor:pointer;',
      '  font-family:inherit;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__step-label{',
      '  display:inline-block;',
      '  padding:0 0 9px;',
      '  border-bottom:2px solid transparent;',
      '  color:#595959;',
      '  font-size:16px;',
      '  line-height:20px;',
      '  font-weight:400;',
      '  text-align:center;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__step.is-active .at-itau-carousel__step-label{',
      '  color:#041E42;',
      '  font-weight:700;',
      '  border-bottom-color:#041E42;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__slides{',
      '  display:grid;',
      '  position:relative;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__slide{',
      '  grid-area:1 / 1;',
      '  opacity:0;',
      '  visibility:hidden;',
      '  pointer-events:none;',
      '  transform:translateX(18px);',
      '  transition:opacity 0.32s ease, transform 0.32s ease, visibility 0.32s ease;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__slide.is-active{',
      '  opacity:1;',
      '  visibility:visible;',
      '  pointer-events:auto;',
      '  transform:translateX(0);',
      '}',
      '#' + COMPONENT_ID + '[data-anim="prev"] .at-itau-carousel__slide{transform:translateX(-18px);}',
      '#' + COMPONENT_ID + '[data-anim="prev"] .at-itau-carousel__slide.is-active{transform:translateX(0);}',
      '@media (prefers-reduced-motion:reduce){',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__slide{',
      '    transition:none;',
      '    transform:none;',
      '  }',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__slide-title{',
      '  margin:0 0 12px;',
      '  font-size:22px;',
      '  line-height:28px;',
      '  font-weight:700;',
      '  color:#041E42;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__text{',
      '  margin:0 0 12px;',
      '  font-size:20px;',
      '  line-height:28px;',
      '  font-weight:400;',
      '  color:#595959;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__text:last-child{margin-bottom:0;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__text strong{',
      '  font-weight:700;',
      '  color:#041E42;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__mobi{display:none;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__desk{display:block;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__alert-copy{',
      '  min-width:0;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__alert-title{display:none;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__alert{',
      '  display:flex;',
      '  align-items:center;',
      '  gap:8px;',
      '  margin:0;',
      '  padding:16px;',
      '  border:1px solid #F5D695;',
      '  border-radius:8px;',
      '  background:#FDF7EA;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__alert-icon{',
      '  flex-shrink:0;',
      '  display:flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  width:32px;',
      '  height:32px;',
      '  border-radius:50%;',
      '  background:#F5A024;',
      '  color:#FFFFFF;',
      '  font-size:16px;',
      '  font-weight:700;',
      '  line-height:1;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__alert-text{',
      '  font-size:16px;',
      '  line-height:16px;',
      '  font-weight:400;',
      '  color:#6A4B0A;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__nav{',
      '  display:flex;',
      '  align-items:center;',
      '  gap:24px;',
      '  margin:0;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__arrow{',
      '  display:inline-flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  width:68px;',
      '  height:68px;',
      '  padding:0;',
      '  border:0;',
      '  border-radius:50%;',
      '  background:#EBEBEB;',
      '  cursor:pointer;',
      '  color:#041E42;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__arrow:hover{background:#E0E0E0;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__arrow:disabled{',
      '  opacity:0.4;',
      '  cursor:default;',
      '  pointer-events:none;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__arrow svg{display:block;width:22px;height:22px;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__footer{',
      '  display:flex;',
      '  flex-direction:column;',
      '  align-items:center;',
      '  gap:24px;',
      '  margin:0;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__rules{',
      '  color:#026CB6;',
      '  font-size:20px;',
      '  line-height:20px;',
      '  font-weight:400;',
      '  text-decoration:underline;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__cta{',
      '  display:inline-flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  gap:16px;',
      '  min-height:72px;',
      '  padding:10px 50px 10px 30px;',
      '  border-radius:999px;',
      '  background:#008BC4;',
      '  color:#FFFFFF;',
      '  font-size:24px;',
      '  font-weight:500;',
      '  line-height:28px;',
      '  letter-spacing:-0.02em;',
      '  text-decoration:none;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__cta:hover{background:#0078A8;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__cta-icon{',
      '  display:flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  width:50px;',
      '  height:50px;',
      '  border-radius:50%;',
      '  background:#FFFFFF;',
      '  flex-shrink:0;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__cta-icon svg{width:24px;height:24px;}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__media{',
      '  display:none;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__media button{',
      '  width:100% !important;',
      '  padding:0 !important;',
      '  border:0 !important;',
      '  background:transparent !important;',
      '  overflow:hidden !important;',
      '  border-radius:16px !important;',
      '}',
      '#' + COMPONENT_ID + ' .at-itau-carousel__media img{',
      '  width:100% !important;',
      '  max-width:100% !important;',
      '  height:auto !important;',
      '  border-radius:16px !important;',
      '}',
      '[' + DATA_INJECTED + '="true"]{position:relative;width:100%;}',
      '[' + DATA_INJECTED + '="true"] > button{display:none !important;}',
      '[' + DATA_INJECTED + '="true"] img[src*="' + IMG_FRAGMENT + '"]{display:none !important;}',
      '[' + DATA_SPLIT + '="true"]{',
      '  display:grid !important;',
      '  grid-template-columns:minmax(0, 1fr) minmax(0, 1fr) !important;',
      '  max-width:1300px !important;',
      '  margin:0 auto !important;',
      '  padding:0 20px 30px 20px !important;',
      '}',
      '[' + DATA_SPLIT + '="true"] > div{',
      '  width:100% !important;',
      '  max-width:100% !important;',
      '  min-width:0 !important;',
      '  box-sizing:border-box !important;',
      '}',
      '[' + DATA_SPLIT + '="true"] > div > button{',
      '  width:100% !important;',
      '  overflow:hidden !important;',
      '  border-radius:25px !important;',
      '}',
      '[' + DATA_IMAGE + '="true"] img{',
      '  width:100% !important;',
      '  max-width:100% !important;',
      '  height:auto !important;',
      '  border-radius:25px !important;',
      '}',
      '@media (min-width:768px){',
      '  #' + COMPONENT_ID + '{padding:0 0 20px 20px;gap:20px;}',
      '  [' + DATA_IMAGE + '="true"] img[data-at-itau-hero="mobile"]{display:none !important;}',
      '}',
      '@media (max-width:767px){',
      '  [' + DATA_SPLIT + '="true"]{',
      '    display:flex !important;',
      '    flex-direction:column !important;',
      '    grid-template-columns:none !important;',
      '    max-width:100% !important;',
      '    padding:32px 16px !important;',
      '    background:#F8FAFC !important;',
      '  }',
      '  [' + DATA_IMAGE + '="true"]{display:none !important;}',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__media img[data-at-itau-hero="desktop"]{display:none !important;}',
      '  [' + DATA_INJECTED + '="true"]{width:100% !important;max-width:100% !important;}',
      '  #' + COMPONENT_ID + '{',
      '    padding:0;',
      '    gap:20px;',
      '    background:transparent;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__title{',
      '    font-size:28px;',
      '    line-height:34px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__steps{gap:40px;}',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__media{',
      '    display:block;',
      '    margin:0;',
      '    border-radius:16px;',
      '    overflow:hidden;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__slide-title{',
      '    margin:0 0 16px;',
      '    font-size:20px;',
      '    line-height:20px;',
      '    color:#0F172A;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__text{',
      '    font-size:15px;',
      '    line-height:22px;',
      '    color:#475569;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__desk{display:none;}',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__mobi{display:block;}',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__alert{',
      '    align-items:flex-start;',
      '    padding:12px;',
      '    gap:8px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__alert-copy{',
      '    display:flex;',
      '    flex-direction:column;',
      '    gap:4px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__alert-title{',
      '    display:block;',
      '    font-size:12px;',
      '    line-height:12px;',
      '    font-weight:700;',
      '    color:#6A4B0A;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__alert-icon{width:24px;height:24px;font-size:14px;}',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__alert-text{',
      '    font-size:13px;',
      '    line-height:16px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__nav{justify-content:center;}',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__rules{',
      '    font-size:16px;',
      '    line-height:16px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__cta{',
      '    min-height:52px;',
      '    width:auto;',
      '    max-width:100%;',
      '    padding:12px 28px 12px 12px;',
      '    gap:10px;',
      '    font-size:14px;',
      '    line-height:18px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__cta-icon{',
      '    width:35px;',
      '    height:34px;',
      '  }',
      '  #' + COMPONENT_ID + ' .at-itau-carousel__cta-icon svg{width:18px;height:18px;}',
      '}',
    ].join('');
  }

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = getCss();
  }

  function findBannerImage() {
    const selector =
      'img[src*="' +
      IMG_FRAGMENT +
      '"],img[srcset*="' +
      IMG_FRAGMENT +
      '"],source[srcset*="' +
      IMG_FRAGMENT +
      '"]';
    return document.querySelector(selector);
  }

  function findBannerContext() {
    const media = findBannerImage();
    if (!media) return null;

    const img = media.tagName === 'SOURCE' ? media.parentElement.querySelector('img') || media : media;
    const button = img.closest ? img.closest('button') : null;
    const wrapper = button && button.parentElement ? button.parentElement : img.parentElement;
    if (!wrapper) return null;

    return { img: img, button: button, wrapper: wrapper };
  }

  function findCardsSection() {
    const headings = document.querySelectorAll('h1, h2');
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const text = (heading.textContent || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      if (text.indexOf('escolha o cart') === -1 || text.indexOf('ideal') === -1) continue;

      const capsule = heading.closest('.container-capsule');
      const target = capsule || heading;
      if (!target.id) target.id = 'at-itau-escolha-cartao';
      return target;
    }
    return document.getElementById('at-itau-escolha-cartao');
  }

  function findRegulamentoHeading() {
    const headings = document.querySelectorAll('h3, h2, h1');
    for (let i = 0; i < headings.length; i++) {
      const text = (headings[i].textContent || '').toLowerCase();
      if (text.indexOf('regulamento da campanha') !== -1) return headings[i];
    }
    return null;
  }

  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  }

  function findRegulamentoAccordionButton() {
    const marked = document.getElementById('at-itau-regulamento');
    if (marked) {
      const markedBtn = marked.querySelector('button.variant-color, button');
      if (markedBtn && isElementVisible(markedBtn)) return markedBtn;
    }

    const buttons = document.querySelectorAll('button.variant-color, button');
    let fallback = null;
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      if (btn.closest && btn.closest('#' + COMPONENT_ID)) continue;

      const span = btn.querySelector('span');
      const spanText = span ? (span.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() : '';
      if (spanText !== 'regulamento') continue;
      if (isElementVisible(btn)) return btn;
      if (!fallback) fallback = btn;
    }
    return fallback;
  }

  function findRegulamentoSection() {
    const btn = findRegulamentoAccordionButton();
    if (btn) {
      const wrap = btn.closest('.container-capsule') || btn.parentElement || btn;
      if (!wrap.id) wrap.id = 'at-itau-regulamento';
      return wrap;
    }

    const heading = findRegulamentoHeading();
    if (heading) {
      const capsule = heading.closest('.container-capsule');
      const target = capsule || heading;
      if (!target.id) target.id = 'at-itau-regulamento';
      return target;
    }

    return document.getElementById('at-itau-regulamento');
  }

  function isRegulamentoOpen(button) {
    return !!(button && button.classList.contains('accordion-active'));
  }

  function invokeReactClickOnNode(el) {
    if (!el) return false;
    const keys = Object.keys(el);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.indexOf('__reactProps$') === 0 || key.indexOf('__reactEventHandlers$') === 0) {
        const props = el[key];
        if (props && typeof props.onClick === 'function') {
          props.onClick({
            currentTarget: el,
            target: el,
            preventDefault: function () {},
            stopPropagation: function () {},
            nativeEvent: { target: el },
          });
          return true;
        }
      }

      if (key.indexOf('__reactFiber$') === 0 || key.indexOf('__reactInternalInstance$') === 0) {
        let fiber = el[key];
        let hops = 0;
        while (fiber && hops < 12) {
          const props = fiber.memoizedProps || fiber.pendingProps;
          if (props && typeof props.onClick === 'function') {
            props.onClick({
              currentTarget: el,
              target: el,
              preventDefault: function () {},
              stopPropagation: function () {},
              nativeEvent: { target: el },
            });
            return true;
          }
          fiber = fiber.return;
          hops++;
        }
      }
    }

    return false;
  }

  function invokeReactClick(el) {
    let node = el;
    let depth = 0;
    while (node && depth < 5) {
      if (invokeReactClickOnNode(node)) return true;
      node = node.parentElement;
      depth++;
    }
    return false;
  }

  function openRegulamentoAccordion(button) {
    if (!button || isRegulamentoOpen(button)) return;

    console.log('[AT] Abrindo accordion de regulamento.');
    if (invokeReactClick(button)) return;
    HTMLElement.prototype.click.call(button);
  }

  function scrollToRegulamento() {
    const target = findRegulamentoSection();
    const button = findRegulamentoAccordionButton();

    if (target) {
      const offset = 24;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth',
      });
    } else {
      console.log('[AT] Secao de regulamento nao encontrada.');
    }

    setTimeout(function () {
      const btn = findRegulamentoAccordionButton() || button;
      openRegulamentoAccordion(btn);
    }, 450);
  }

  function scrollToCards() {
    const target = findCardsSection();
    if (!target) {
      window.location.href = CONFIG.ctaUrl;
      return;
    }

    const offset = 24;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: top,
      behavior: 'smooth',
    });
  }

  function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  }

  function createCarousel() {
    const root = createEl('div', 'at-itau-carousel');
    root.id = COMPONENT_ID;
    root.setAttribute('data-at-experiment', EXPERIMENT_NAME);
    root.setAttribute('data-step', '0');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Como participar');

    const title = createEl('h2', 'at-itau-carousel__title');
    title.textContent = 'Como participar';
    root.appendChild(title);

    const steps = createEl('div', 'at-itau-carousel__steps');
    steps.setAttribute('role', 'tablist');
    steps.setAttribute('aria-label', 'Passos de como participar');

    const stepLabels = ['Passo 1', 'Passo 2', 'Passo 3'];
    for (let i = 0; i < stepLabels.length; i++) {
      const stepBtn = createEl('button', 'at-itau-carousel__step' + (i === 0 ? ' is-active' : ''));
      stepBtn.type = 'button';
      stepBtn.setAttribute('role', 'tab');
      stepBtn.setAttribute('data-step', String(i));
      stepBtn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      stepBtn.setAttribute('aria-controls', 'at-itau-slide-' + i);

      const label = createEl('span', 'at-itau-carousel__step-label');
      label.textContent = stepLabels[i];
      stepBtn.appendChild(label);
      steps.appendChild(stepBtn);
    }
    root.appendChild(steps);

    const media = createEl('div', 'at-itau-carousel__media');
    root.appendChild(media);

    const slides = createEl('div', 'at-itau-carousel__slides');

    const slide0 = createEl('div', 'at-itau-carousel__slide is-active');
    slide0.id = 'at-itau-slide-0';
    slide0.setAttribute('role', 'tabpanel');
    slide0.setAttribute('data-step', '0');
    slide0.appendChild(createEl('h3', 'at-itau-carousel__slide-title', 'Peça o cartão'));
    slide0.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__desk',
        'Escolha entre o Cartão Azul Itaú Platinum, Skyline ou Infinite até o dia 31/08.'
      )
    );
    slide0.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__mobi',
        'Peça o cartão entre 19 a 31/08 para participar da promoção e começar a acumular seus pontos bônus.'
      )
    );
    slides.appendChild(slide0);

    const slide1 = createEl('div', 'at-itau-carousel__slide');
    slide1.id = 'at-itau-slide-1';
    slide1.setAttribute('role', 'tabpanel');
    slide1.setAttribute('data-step', '1');
    slide1.setAttribute('aria-hidden', 'true');
    slide1.appendChild(
      createEl('h3', 'at-itau-carousel__slide-title', 'Atinja a meta e assine o Clube Azul')
    );
    slide1.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text',
        'Nas 3 primeiras faturas, atinja a meta de gastos média do seu cartão e faça uma assinatura ou upgrade no Clube Azul até o dia 20/09.'
      )
    );
    slide1.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__desk',
        '<strong>Skyline e Infinite:</strong> média de R$ 20 mil por fatura.'
      )
    );
    slide1.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__desk',
        '<strong>Platinum:</strong> média de R$ 4 mil por fatura.'
      )
    );
    slides.appendChild(slide1);

    const slide2 = createEl('div', 'at-itau-carousel__slide');
    slide2.id = 'at-itau-slide-2';
    slide2.setAttribute('role', 'tabpanel');
    slide2.setAttribute('data-step', '2');
    slide2.setAttribute('aria-hidden', 'true');
    slide2.appendChild(createEl('h3', 'at-itau-carousel__slide-title', 'Ganhe pontos bônus'));
    slide2.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__desk',
        '<strong>Azul Itaú Skyline ou Infinite:</strong> 40 mil pontos bônus ao atingir a meta de gastos + 40 mil pela ativação no Clube Azul, totalizando 80 mil pontos bônus.'
      )
    );
    slide2.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__desk',
        '<strong>Azul Itaú Platinum:</strong> 16 mil pontos bônus ao atingir a meta de gastos + 24 mil pela ativação no Clube Azul, totalizando 40 mil pontos bônus.'
      )
    );
    slide2.appendChild(
      createEl(
        'p',
        'at-itau-carousel__text at-itau-carousel__mobi',
        'Ganhe até 80 mil pontos bônus no Skyline ou Infinite e até 40 mil no Platinum. Confira as regras.'
      )
    );
    slides.appendChild(slide2);
    root.appendChild(slides);

    const alertBox = createEl('div', 'at-itau-carousel__alert');
    alertBox.setAttribute('role', 'note');
    const alertIcon = createEl('span', 'at-itau-carousel__alert-icon');
    alertIcon.setAttribute('aria-hidden', 'true');
    alertIcon.textContent = '!';
    const alertCopy = createEl('div', 'at-itau-carousel__alert-copy');
    const alertTitle = createEl('strong', 'at-itau-carousel__alert-title');
    alertTitle.textContent = 'Importante';
    const alertText = createEl('span', 'at-itau-carousel__alert-text');
    alertText.textContent = 'Aprovação do cartão sujeita à análise de crédito!';
    alertCopy.appendChild(alertTitle);
    alertCopy.appendChild(alertText);
    alertBox.appendChild(alertIcon);
    alertBox.appendChild(alertCopy);
    root.appendChild(alertBox);

    const nav = createEl('div', 'at-itau-carousel__nav');
    const prevBtn = createEl('button', 'at-itau-carousel__arrow');
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-dir', 'prev');
    prevBtn.setAttribute('aria-label', 'Passo anterior');
    prevBtn.innerHTML = ICON_PREV;
    const nextBtn = createEl('button', 'at-itau-carousel__arrow');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-dir', 'next');
    nextBtn.setAttribute('aria-label', 'Próximo passo');
    nextBtn.innerHTML = ICON_NEXT;
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    root.appendChild(nav);

    const footer = createEl('div', 'at-itau-carousel__footer');
    const rules = createEl('a', 'at-itau-carousel__rules');
    rules.href = '#at-itau-regulamento';
    rules.textContent = 'Confira o regulamento';
    footer.appendChild(rules);

    const cta = createEl('a', 'at-itau-carousel__cta');
    cta.href = '#at-itau-escolha-cartao';
    cta.setAttribute('data-at-cta', 'pedir-cartao');
    const ctaIcon = createEl('span', 'at-itau-carousel__cta-icon');
    ctaIcon.setAttribute('aria-hidden', 'true');
    ctaIcon.innerHTML = ICON_CTA;
    const ctaLabel = createEl('span', 'at-itau-carousel__cta-label');
    ctaLabel.textContent = 'Quero pedir meu cartão';
    cta.appendChild(ctaIcon);
    cta.appendChild(ctaLabel);
    footer.appendChild(cta);
    root.appendChild(footer);

    return root;
  }

  function clampStep(index) {
    if (index < 0) return 0;
    if (index > TOTAL_STEPS - 1) return TOTAL_STEPS - 1;
    return index;
  }

  function syncArrowState(root) {
    if (!root) return;
    const prevBtn = root.querySelector('.at-itau-carousel__arrow[data-dir="prev"]');
    const nextBtn = root.querySelector('.at-itau-carousel__arrow[data-dir="next"]');
    if (prevBtn) prevBtn.disabled = currentStep === 0;
    if (nextBtn) nextBtn.disabled = currentStep === TOTAL_STEPS - 1;
  }

  function goTo(index, origin) {
    const root = document.getElementById(COMPONENT_ID);
    if (!root) return;

    const next = clampStep(index);
    if (next === currentStep && origin !== 'init') return;

    let direction = 'next';
    if (origin === 'seta_anterior' || origin === 'swipe_anterior') {
      direction = 'prev';
    } else if (next < currentStep && origin !== 'seta_proxima' && origin !== 'swipe_proxima') {
      direction = 'prev';
    }
    root.setAttribute('data-anim', direction);

    currentStep = next;
    root.setAttribute('data-step', String(currentStep));

    const stepButtons = root.querySelectorAll('.at-itau-carousel__step');
    for (let i = 0; i < stepButtons.length; i++) {
      const isActive = i === currentStep;
      if (isActive) {
        stepButtons[i].classList.add('is-active');
      } else {
        stepButtons[i].classList.remove('is-active');
      }
      stepButtons[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
    }

    const slides = root.querySelectorAll('.at-itau-carousel__slide');
    for (let s = 0; s < slides.length; s++) {
      const isActive = s === currentStep;
      if (isActive) {
        slides[s].classList.add('is-active');
        slides[s].setAttribute('aria-hidden', 'false');
      } else {
        slides[s].classList.remove('is-active');
        slides[s].setAttribute('aria-hidden', 'true');
      }
    }

    syncArrowState(root);
    applyStepHeroImage();

    if (origin && origin !== 'init') {
      analyticsEvent(origin, 'click');
    }
  }

  function bindCarousel(root) {
    if (!root || root.getAttribute(DATA_LISTENER) === 'true') return;
    root.setAttribute(DATA_LISTENER, 'true');

    const stepButtons = root.querySelectorAll('.at-itau-carousel__step');
    for (let i = 0; i < stepButtons.length; i++) {
      stepButtons[i].addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const step = parseInt(event.currentTarget.getAttribute('data-step'), 10);
        goTo(step, 'passo_' + (step + 1));
      });
    }

    const prevBtn = root.querySelector('.at-itau-carousel__arrow[data-dir="prev"]');
    const nextBtn = root.querySelector('.at-itau-carousel__arrow[data-dir="next"]');

    if (prevBtn) {
      prevBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        goTo(currentStep - 1, 'seta_anterior');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        goTo(currentStep + 1, 'seta_proxima');
      });
    }

    const rules = root.querySelector('.at-itau-carousel__rules');
    if (rules) {
      rules.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        analyticsEvent('regulamento', 'click');
        scrollToRegulamento();
      });
    }

    const cta = root.querySelector('.at-itau-carousel__cta');
    if (cta) {
      cta.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        analyticsEvent('cta_pedir_cartao', 'click');
        scrollToCards();
      });
    }

    root.addEventListener(
      'touchstart',
      function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );

    root.addEventListener(
      'touchend',
      function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) < 48) return;
        if (dx < 0) {
          goTo(currentStep + 1, 'swipe_proxima');
        } else {
          goTo(currentStep - 1, 'swipe_anterior');
        }
      },
      { passive: true }
    );
  }

  function neutralizeOriginal(button) {
    if (!button || button.getAttribute(DATA_NEUTRALIZED) === 'true') return;
    button.setAttribute(DATA_NEUTRALIZED, 'true');
    button.addEventListener(
      'click',
      function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true
    );
  }

  function hideOriginalMedia(wrapper) {
    if (!wrapper) return;
    const nodes = wrapper.querySelectorAll(
      'img[src*="' + IMG_FRAGMENT + '"],img[srcset*="' + IMG_FRAGMENT + '"]'
    );
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].style.setProperty('display', 'none', 'important');
    }
  }

  function findImageColumn(section, carouselWrapper) {
    if (!section) return null;
    const marked = section.querySelector('[' + DATA_IMAGE + '="true"]');
    if (marked) return marked;

    const children = section.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child || child === carouselWrapper) continue;
      if (child.querySelector('img[src*="itauEsquerda"],img[data-at-itau-hero]')) return child;
    }
    return null;
  }

  function ensureMediaSlot(carousel) {
    if (!carousel) return null;
    let slot = carousel.querySelector('.at-itau-carousel__media');
    if (slot) return slot;

    slot = createEl('div', 'at-itau-carousel__media');
    const slides = carousel.querySelector('.at-itau-carousel__slides');
    if (slides) {
      carousel.insertBefore(slot, slides);
    } else {
      carousel.appendChild(slot);
    }
    return slot;
  }

  function syncImagePlacement(section, carouselWrapper) {
    const carousel = document.getElementById(COMPONENT_ID);
    const imageCol = findImageColumn(section, carouselWrapper);
    if (!carousel || !imageCol) return;

    imageCol.setAttribute(DATA_IMAGE, 'true');
    const slot = ensureMediaSlot(carousel);
    if (!slot) return;

    const btn = imageCol.querySelector('button') || slot.querySelector('button');
    if (!btn) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    applyStepHeroImage(btn);

    if (isMobile) {
      if (btn.parentElement !== slot) slot.appendChild(btn);
    } else if (btn.parentElement !== imageCol) {
      imageCol.insertBefore(btn, imageCol.firstChild);
    }
  }

  function findHeroButton() {
    const carousel = document.getElementById(COMPONENT_ID);
    const imageCol = document.querySelector('[' + DATA_IMAGE + '="true"]');
    return (
      (imageCol && imageCol.querySelector('button')) ||
      (carousel && carousel.querySelector('.at-itau-carousel__media button')) ||
      null
    );
  }

  function rememberHeroOrig(img) {
    if (!img || img.getAttribute('data-at-itau-orig-src')) return;
    const src = img.getAttribute('src') || '';
    if (!src) return;
    if (src.indexOf('imgur.com') !== -1) return;
    img.setAttribute('data-at-itau-orig-src', src);
  }

  function tagHeroImage(img) {
    if (!img || img.getAttribute('data-at-itau-hero')) return;
    const src = (img.getAttribute('src') || '') + ' ' + (img.getAttribute('data-at-itau-orig-src') || '');
    if (
      src.indexOf('Esquerda-mobile') !== -1 ||
      src.indexOf('0gVchUc') !== -1 ||
      src.indexOf('HW82mhn') !== -1 ||
      src.indexOf('wlR9lJW') !== -1
    ) {
      img.setAttribute('data-at-itau-hero', 'mobile');
    } else if (src.indexOf('Esquerda-desktop') !== -1) {
      img.setAttribute('data-at-itau-hero', 'desktop');
    }
  }

  function setHeroSrc(img, url) {
    if (!img || !url) return;
    if (img.getAttribute('src') === url) return;
    img.setAttribute('src', url);
    img.removeAttribute('srcset');
  }

  function getStepImageUrl(role) {
    const urls = role === 'mobile' ? CONFIG.mobileStepImages : CONFIG.desktopStepImages;
    if (!urls || !urls[currentStep]) {
      if (role === 'mobile') return CONFIG.mobileImageUrl || '';
      return '';
    }
    return urls[currentStep];
  }

  function applyStepHeroImage(btn) {
    const heroBtn = btn || findHeroButton();
    if (!heroBtn) return;

    const imgs = heroBtn.querySelectorAll('img');

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      rememberHeroOrig(img);
      tagHeroImage(img);

      const orig = img.getAttribute('data-at-itau-orig-src') || '';
      const role = img.getAttribute('data-at-itau-hero') || '';
      const stepUrl = getStepImageUrl(role);

      if (stepUrl) {
        setHeroSrc(img, stepUrl);
      } else if (orig) {
        setHeroSrc(img, orig);
      }
    }
  }

  function preloadStepImages() {
    const groups = [CONFIG.desktopStepImages, CONFIG.mobileStepImages];
    for (let g = 0; g < groups.length; g++) {
      const urls = groups[g];
      if (!urls) continue;
      for (let i = 0; i < urls.length; i++) {
        if (!urls[i]) continue;
        const preload = new Image();
        preload.src = urls[i];
      }
    }
  }

  function splitSectionColumns(wrapper) {
    if (!wrapper || !wrapper.parentElement) return;

    const section = wrapper.parentElement;
    section.setAttribute(DATA_SPLIT, 'true');

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      section.style.setProperty('display', 'flex', 'important');
      section.style.setProperty('flex-direction', 'column', 'important');
      section.style.setProperty('grid-template-columns', 'none', 'important');
    } else {
      section.style.setProperty('display', 'grid', 'important');
      section.style.setProperty('grid-template-columns', 'minmax(0, 1fr) minmax(0, 1fr)', 'important');
      section.style.removeProperty('flex-direction');
    }
    section.style.setProperty('max-width', isMobile ? '100%' : '1300px', 'important');
    section.style.setProperty('margin', '0 auto', 'important');
    section.style.setProperty('padding', isMobile ? '16px 20px 28px 20px' : '0 20px 30px 20px', 'important');

    const children = section.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child || child.nodeType !== 1) continue;
      child.style.removeProperty('flex');
      child.style.setProperty('width', '100%', 'important');
      child.style.setProperty('max-width', '100%', 'important');
      child.style.setProperty('min-width', '0', 'important');
      child.style.setProperty('box-sizing', 'border-box', 'important');
    }

    syncImagePlacement(section, wrapper);
  }

  function trackViewOnce(el) {
    if (!el || el.getAttribute(DATA_VIEW) === 'true') return;
    el.setAttribute(DATA_VIEW, 'true');
    analyticsEvent('carousel_visivel', 'view');
  }

  function injectCarousel() {
    const ctx = findBannerContext();
    if (!ctx || !ctx.wrapper) return false;

    const existing = document.getElementById(COMPONENT_ID);
    if (existing && document.body.contains(existing)) {
      injectStyles();
      preloadStepImages();
      hideOriginalMedia(ctx.wrapper);
      neutralizeOriginal(ctx.button);
      splitSectionColumns(ctx.wrapper);
      trackViewOnce(existing);
      return true;
    }

    injectStyles();
    preloadStepImages();

    currentStep = 0;
    const carousel = createCarousel();
    if (ctx.button && ctx.button.nextSibling) {
      ctx.wrapper.insertBefore(carousel, ctx.button.nextSibling);
    } else {
      ctx.wrapper.appendChild(carousel);
    }

    hideOriginalMedia(ctx.wrapper);
    neutralizeOriginal(ctx.button);
    ctx.wrapper.setAttribute(DATA_INJECTED, 'true');
    splitSectionColumns(ctx.wrapper);

    bindCarousel(carousel);
    goTo(0, 'init');
    trackViewOnce(carousel);
    console.log('[AT] Carrossel Como participar injetado no banner Itaú.');
    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      injectCarousel();
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      run();
    }, 300);
  }

  function isOwnMutation(mutations) {
    if (!mutations || !mutations.length) return false;
    for (let i = 0; i < mutations.length; i++) {
      const target = mutations[i].target;
      if (!target) return false;
      if (target.id === COMPONENT_ID) continue;
      if (target.closest && target.closest('#' + COMPONENT_ID)) continue;
      return false;
    }
    return true;
  }

  function startObserver() {
    if (observerStarted || window._atItauCarouselObserver) return;

    const observer = new MutationObserver(function (mutations) {
      if (isProcessing) return;
      if (isOwnMutation(mutations)) return;
      scheduleRun();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._atItauCarouselObserver = observer;
    observerStarted = true;
  }

  function init() {
    run();
    startObserver();
    if (!resizeBound) {
      resizeBound = true;
      window.addEventListener('resize', scheduleRun);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
