(function () {
  'use strict';

  if (window._cuiabaBanner) {
    return;
  }
  window._cuiabaBanner = true;

  const STYLE_ID = 'at-cuiaba-banner-style';
  const DATA_APPLIED = 'data-cuiaba-applied';
  const DATA_TRACK = 'data-cuiaba-track-added';
  const DATA_PREVIEW = 'data-cuiaba-preview-applied';

  const CONFIG = {
    tag: 'Passagens',
    title: 'Voe de Cuiabá para + de 130 destinos',
    description:
      'Conexões rápidas com o conforto, conectividade e pontualidade que só a Azul tem.',
    cta: 'Conferir ofertas',
    ctaUrl: 'https://passagens.voeazul.com.br/pt/voos-de-cuiab%C3%A1',
    imgDesktop: 'https://i.imgur.com/mOS8z5U.png',
    imgMobile: 'https://i.imgur.com/WGhzwPy.png',
    imgPreview: 'https://i.imgur.com/mOS8z5U.png',
    imgPlus: 'https://i.imgur.com/RZYugKd.png',
    altText: 'Voe de Cuiabá para + de 130 destinos',
  };

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking Cuiabá] Parametro ausente para evento analytics.');
      return;
    }

    const labelEvent = 'AT_CuiabaBanner_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Cuiabá] Analytics event disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_home_banner';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function isMobile() {
    return window.innerWidth <= 767;
  }

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent =
      '[' + DATA_APPLIED + '] .at-cba__title {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: flex-start;' +
      '  gap: 4px;' +
      '  color: #FFFFFF;' +
      '  font-family: "Helvetica Neue", Arial, sans-serif;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba__line1 {' +
      '  display: block;' +
      '  font-weight: 400;' +
      '  font-size: 37.213px;' +
      '  line-height: 42px;' +
      '  letter-spacing: -0.02em;' +
      '  color: #FFFFFF;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba__line2 {' +
      '  display: flex;' +
      '  flex-direction: row;' +
      '  align-items: center;' +
      '  gap: 8px;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba__plus {' +
      '  width: 36.05px;' +
      '  height: 36.05px;' +
      '  flex-shrink: 0;' +
      '  display: block;' +
      '  object-fit: contain;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba__de {' +
      '  font-weight: 400;' +
      '  font-size: 37.213px;' +
      '  line-height: 1;' +
      '  letter-spacing: -0.02em;' +
      '  color: #FFFFFF;' +
      '  display: flex;' +
      '  align-items: center;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba__destinos {' +
      '  font-weight: 700;' +
      '  font-size: 64.6653px;' +
      '  line-height: 1;' +
      '  letter-spacing: -0.02em;' +
      '  color: #FFFFFF;' +
      '  white-space: nowrap;' +
      '}' +

      '[' + DATA_APPLIED + '] p {' +
      '  font-family: "Helvetica Neue", Arial, sans-serif;' +
      '  font-weight: 400;' +
      '  font-size: 24px;' +
      '  line-height: 30px;' +
      '  letter-spacing: -0.015em;' +
      '  color: #FFFFFF;' +
      '}' +

      '[' + DATA_APPLIED + '] a.at-cba-cta,' +
      '[' + DATA_APPLIED + '] a[type="button"].at-cba-cta {' +
      '  display: inline-flex !important;' +
      '  flex-direction: row;' +
      '  align-items: center;' +
      '  box-sizing: border-box;' +
      '  width: 256px;' +
      '  height: 51.2px;' +
      '  padding: 0 18px 0 10.5px !important;' +
      '  gap: 16px;' +
      '  background: #FFFFFF !important;' +
      '  border-radius: 131.282px !important;' +
      '  border: none !important;' +
      '  text-decoration: none !important;' +
      '  box-shadow: none !important;' +
      '  color: #0061A0 !important;' +
      '  transition: transform 0.25s ease, box-shadow 0.25s ease;' +
      '}' +

      '[' + DATA_APPLIED + '] a.at-cba-cta:hover,' +
      '[' + DATA_APPLIED + '] a[type="button"].at-cba-cta:hover {' +
      '  transform: translateY(-1px);' +
      '  box-shadow: 0 4px 12px rgba(0, 97, 160, 0.2) !important;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba-cta__icon {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  flex-shrink: 0;' +
      '  width: 53.83px;' +
      '  height: 30.19px;' +
      '  background: #0061A0;' +
      '  border-radius: 131.282px;' +
      '  overflow: hidden;' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba-cta__icon svg {' +
      '  display: block;' +
      '  width: 19.69px;' +
      '  height: 12px;' +
      '  transition: transform 0.35s ease;' +
      '}' +

      '[' + DATA_APPLIED + '] a.at-cba-cta:hover .at-cba-cta__icon svg,' +
      '[' + DATA_APPLIED + '] a[type="button"].at-cba-cta:hover .at-cba-cta__icon svg {' +
      '  animation: at-cba-arrow-nudge 0.7s ease infinite;' +
      '}' +

      '@keyframes at-cba-arrow-nudge {' +
      '  0%, 100% { transform: translateX(0); }' +
      '  50% { transform: translateX(5px); }' +
      '}' +

      '[' + DATA_APPLIED + '] .at-cba-cta__label {' +
      '  font-family: "Helvetica Neue", Arial, sans-serif;' +
      '  font-weight: 500;' +
      '  font-size: 21.0051px;' +
      '  line-height: 120%;' +
      '  letter-spacing: -0.03em;' +
      '  color: #0061A0;' +
      '  white-space: nowrap;' +
      '}' +

      '@media (max-width: 767px) {' +
      '  [' + DATA_APPLIED + '] .at-cba-bg {' +
      '    object-fit: cover !important;' +
      '    object-position: center bottom !important;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba-content {' +
      '    position: relative !important;' +
      '    top: auto !important;' +
      '    left: auto !important;' +
      '    right: auto !important;' +
      '    bottom: auto !important;' +
      '    width: 100% !important;' +
      '    height: 100% !important;' +
      '    min-height: 0 !important;' +
      '    display: flex !important;' +
      '    flex-direction: column !important;' +
      '    align-items: center !important;' +
      '    justify-content: flex-start !important;' +
      '    gap: 10px !important;' +
      '    padding: 0 !important;' +
      '    margin: 0 !important;' +
      '    transform: none !important;' +
      '    box-sizing: border-box !important;' +
      '}' +

      '  [' + DATA_APPLIED + '] .at-cba-tag,' +
      '  [' + DATA_APPLIED + '] .at-cba-content > div:first-child,' +
      '  [' + DATA_APPLIED + '] .at-cba-content [class*="gHpGKH"] {' +
      '    align-self: flex-start !important;' +
      '    width: 100% !important;' +
      '    max-width: none !important;' +
      '    display: flex !important;' +
      '    justify-content: center !important;' +
      '    margin: 0 0 4px 0 !important;' +
      '}' +

      '  [' + DATA_APPLIED + '] .at-cba-content h2 {' +
      '    margin: 0 !important;' +
      '    padding: 0 !important;' +
      '    text-align: center !important;' +
      '    width: 100%;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba__title {' +
      '    align-items: center;' +
      '    width: 100%;' +
      '    gap: 4px;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba__line1 {' +
      '    font-size: 20.1304px;' +
      '    line-height: 23px;' +
      '    text-align: center;' +
      '    letter-spacing: -0.02em;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba__line2 {' +
      '    justify-content: center;' +
      '    gap: 5px;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba__plus {' +
      '    width: 19.5px;' +
      '    height: 19.5px;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba__de {' +
      '    font-size: 20.1304px;' +
      '    line-height: 1;' +
      '    letter-spacing: -0.02em;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba__destinos {' +
      '    font-size: 34.9807px;' +
      '    line-height: 1;' +
      '    letter-spacing: -0.02em;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba-content p {' +
      '    margin: 4px 0 0 !important;' +
      '    padding: 0 !important;' +
      '    max-width: 252px;' +
      '    font-size: 18px;' +
      '    line-height: 22px;' +
      '    text-align: center;' +
      '    letter-spacing: -0.015em;' +
      '  }' +

      '  [' + DATA_APPLIED + '] a.at-cba-cta,' +
      '  [' + DATA_APPLIED + '] a[type="button"].at-cba-cta {' +
      '    position: relative !important;' +
      '    top: auto !important;' +
      '    bottom: auto !important;' +
      '    left: auto !important;' +
      '    right: auto !important;' +
      '    margin: 8px auto 0 !important;' +
      '    align-self: center !important;' +
      '    width: 190px;' +
      '    height: 38px;' +
      '    padding: 0 12px 0 7.8px !important;' +
      '    gap: 12px;' +
      '    border-radius: 97.4359px !important;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba-cta__icon {' +
      '    width: 39.95px;' +
      '    height: 22.41px;' +
      '    border-radius: 97.4359px;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba-cta__icon svg {' +
      '    width: 14.62px;' +
      '    height: 9px;' +
      '  }' +

      '  [' + DATA_APPLIED + '] .at-cba-cta__label {' +
      '    font-size: 15.5897px;' +
      '  }' +
      '}';
  }

  function getTitleHtml() {
    return (
      '<span class="at-cba__title">' +
        '<span class="at-cba__line1">Voe de Cuiabá para</span>' +
        '<span class="at-cba__line2">' +
          '<img class="at-cba__plus" src="' + CONFIG.imgPlus + '" alt="" aria-hidden="true">' +
          '<span class="at-cba__de">de</span>' +
          '<span class="at-cba__destinos">130 destinos</span>' +
        '</span>' +
      '</span>'
    );
  }

  function getCtaHtml() {
    return (
      '<span class="at-cba-cta__icon" aria-hidden="true">' +
        '<svg viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M1 6H17.5" stroke="#FFFFFF" stroke-width="1.31282" stroke-linecap="round"/>' +
          '<path d="M13 1.5L18 6L13 10.5" stroke="#FFFFFF" stroke-width="1.31282" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</span>' +
      '<span class="at-cba-cta__label">' + CONFIG.cta + '</span>'
    );
  }

  function findBannerSlides() {
    const slides = document.querySelectorAll('[data-active]');
    if (!slides || slides.length === 0) {
      return null;
    }

    const bannerSlides = [];
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.querySelector('h2') && slide.querySelector('img')) {
        bannerSlides.push(slide);
      }
    }
    return bannerSlides.length > 0 ? bannerSlides : null;
  }

  function updateTag(slide) {
    const tagSpans = slide.querySelectorAll('span');
    const h2Sibling = slide.querySelector('h2');
    if (!h2Sibling) return;

    for (let t = 0; t < tagSpans.length; t++) {
      const span = tagSpans[t];
      if (span.closest('.at-cba__title') || span.closest('.at-cba-cta')) continue;
      if (span.querySelector('*')) continue;
      if (span.textContent.trim().length === 0 || span.textContent.trim().length >= 50) continue;

      const spanRect = span.getBoundingClientRect();
      const h2Rect = h2Sibling.getBoundingClientRect();
      if (spanRect.top <= h2Rect.top || span.closest('[class*="gHpGKH"]')) {
        span.textContent = CONFIG.tag;

        const tagWrap = span.closest('[class*="gHpGKH"]') || span.closest('.at-cba-content > div');
        if (tagWrap) {
          tagWrap.classList.add('at-cba-tag');
        }
        break;
      }
    }
  }

  function applyCta(ctaLink, trackLabel) {
    if (!ctaLink) return;

    ctaLink.classList.add('at-cba-cta');
    ctaLink.innerHTML = getCtaHtml();
    ctaLink.setAttribute('href', CONFIG.ctaUrl);

    if (!ctaLink.getAttribute(DATA_TRACK)) {
      ctaLink.setAttribute(DATA_TRACK, 'true');
      ctaLink.addEventListener('click', function () {
        analyticsEvent(trackLabel, 'click');
      });
    }
  }

  function getBannerImage(slide) {
    const imgs = slide.querySelectorAll('img');
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (img.classList.contains('at-cba__plus')) continue;
      if (img.closest('h2') || img.closest('.at-cba__title')) continue;
      return img;
    }
    return null;
  }

  function markContentWrapper(slide) {
    const h2 = slide.querySelector('h2');
    const cta = slide.querySelector('a.at-cba-cta, a[type="button"]');
    if (!h2) return;

    let candidate = h2.parentElement;
    let node = h2.parentElement;
    while (node && node !== slide) {
      if (cta && node.contains(h2) && node.contains(cta)) {
        candidate = node;
      }
      node = node.parentElement;
    }

    if (candidate) {
      candidate.classList.add('at-cba-content');
    }
  }

  function applyContentToSlide(slide, trackLabel) {
    const img = getBannerImage(slide);
    if (img) {
      img.classList.add('at-cba-bg');
      img.setAttribute('src', isMobile() ? CONFIG.imgMobile : CONFIG.imgDesktop);
      img.setAttribute('alt', CONFIG.altText);
    }

    updateTag(slide);

    const h2 = slide.querySelector('h2');
    if (h2) {
      h2.innerHTML = getTitleHtml();
    }

    const p = slide.querySelector('p');
    if (p) {
      p.textContent = CONFIG.description;
    }

    applyCta(slide.querySelector('a[type="button"]'), trackLabel);
    markContentWrapper(slide);
    slide.setAttribute(DATA_APPLIED, 'true');
  }

  function applyBanner() {
    const bannerSlides = findBannerSlides();
    if (!bannerSlides) {
      return false;
    }

    injectStyles();

    const firstSlide = bannerSlides[0];
    if (firstSlide.getAttribute(DATA_APPLIED)) {
      return true;
    }

    applyContentToSlide(firstSlide, 'cta_banner');
    firstSlide.setAttribute('data-active', 'true');

    const allSlides = findBannerSlides();
    if (allSlides) {
      for (let s = 0; s < allSlides.length; s++) {
        const slide = allSlides[s];
        if (slide === firstSlide) continue;
        if (slide.getAttribute(DATA_APPLIED)) continue;
        if (!slide.querySelector('img')) continue;

        const parentContainer = slide.parentElement;
        if (!parentContainer) continue;

        const siblings = parentContainer.querySelectorAll('[data-active]');
        const isFirstInContainer = siblings[0] === slide;
        if (isFirstInContainer) {
          applyContentToSlide(slide, 'cta_banner_mini');
        }
      }
    }

    applyPreviewThumbnail();

    console.log('[Cuiabá] Banner personalizado aplicado com sucesso');
    return true;
  }

  function applyPreviewThumbnail() {
    const previewContainers = document.querySelectorAll('[class*="sc-c20cd3f8"]');
    for (let i = 0; i < previewContainers.length; i++) {
      const container = previewContainers[i];
      const btn = container.querySelector('button');
      if (!btn) continue;

      const previewImg = btn.querySelector('img');
      if (!previewImg) continue;
      if (btn.getAttribute(DATA_PREVIEW)) continue;

      const parentDiv = container.parentElement;
      if (parentDiv) {
        const allSiblings = parentDiv.querySelectorAll('[class*="sc-c20cd3f8-0"]');
        if (allSiblings.length > 0 && allSiblings[0] !== container) continue;
      }

      previewImg.setAttribute('src', CONFIG.imgPreview);
      previewImg.setAttribute('alt', CONFIG.altText);

      const previewTag = btn.querySelector('span');
      if (previewTag) {
        previewTag.textContent = CONFIG.tag;
      }

      const previewTitle = btn.querySelector('[class*="sc-c20cd3f8-5"]');
      if (previewTitle) {
        previewTitle.textContent = CONFIG.altText;
      }

      btn.setAttribute(DATA_PREVIEW, 'true');
      console.log('[Cuiabá] Miniatura/preview atualizada');
      break;
    }
  }

  let attempts = 0;
  const maxAttempts = 20;

  function tryApply() {
    attempts++;
    if (applyBanner()) {
      return;
    }
    if (attempts < maxAttempts) {
      setTimeout(tryApply, 500);
    } else {
      console.warn('[Cuiabá] Nao foi possivel localizar o banner apos timeout');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryApply);
  } else {
    tryApply();
  }
})();
