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
    tag: 'Nova rota',
    title: 'Voe de Cuiabá para onde quiser',
    description: 'As melhores condições de pagamento para você viajar.',
    cta: 'Comprar agora',
    ctaUrl: 'https://passagens.voeazul.com.br/pt/voos-de-cuiab%C3%A1',
    imgDesktop: 'https://i.imgur.com/c8TLgow.png',
    imgMobile: 'https://i.imgur.com/KqpyOpK.png',
    imgPreview: 'https://i.imgur.com/c8TLgow.png',
    altText: 'Voe de Cuiabá para onde quiser',
    tagBg: '#9a4e9e',
  };

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent =
      '.at-cba-tag-pill {' +
      '  background-color: ' + CONFIG.tagBg + ' !important;' +
      '}' +

      '@media (min-width: 1024px) and (max-width: 1200px) {' +
      '  [' + DATA_APPLIED + '="true"] img,' +
      '  [' + DATA_APPLIED + '="true"] img[class] {' +
      '    object-position: 50% 50% !important;' +
      '  }' +
      '}';
  }

  function isObjectPositionBreakpoint() {
    const width = window.innerWidth;
    return width >= 1024 && width <= 1200;
  }

  function syncCuiabaObjectPosition() {
    const slides = document.querySelectorAll('[' + DATA_APPLIED + '="true"]');
    for (let i = 0; i < slides.length; i++) {
      const img = slides[i].querySelector('img');
      if (!img) continue;

      if (isObjectPositionBreakpoint()) {
        img.style.setProperty('object-position', '50% 50%', 'important');
      } else {
        img.style.removeProperty('object-position');
      }
    }
  }

  function markTagPill(span) {
    if (!span) return;

    let node = span.parentElement;
    while (node && node !== document.body) {
      const bg = window.getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        node.classList.add('at-cba-tag-pill');
        return;
      }
      node = node.parentElement;
    }

    if (span.parentElement) {
      span.parentElement.classList.add('at-cba-tag-pill');
    }
  }

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

  function getTitleHtml() {
    if (isMobile()) {
      return CONFIG.title;
    }
    return 'Voe de Cuiabá<br>para onde quiser';
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
      if (span.querySelector('*')) continue;
      if (span.textContent.trim().length === 0 || span.textContent.trim().length >= 50) {
        continue;
      }

      const spanRect = span.getBoundingClientRect();
      const h2Rect = h2Sibling.getBoundingClientRect();
      if (spanRect.top <= h2Rect.top || span.closest('[class*="gHpGKH"]')) {
        span.textContent = CONFIG.tag;
        markTagPill(span);
        break;
      }
    }
  }

  function applyCta(ctaLink, trackLabel) {
    if (!ctaLink) return;

    ctaLink.textContent = CONFIG.cta;
    ctaLink.setAttribute('href', CONFIG.ctaUrl);

    if (!ctaLink.getAttribute(DATA_TRACK)) {
      ctaLink.setAttribute(DATA_TRACK, 'true');
      ctaLink.addEventListener('click', function () {
        analyticsEvent(trackLabel, 'click');
      });
    }
  }

  function applyContentToSlide(slide, trackLabel) {
    const img = slide.querySelector('img');
    if (img) {
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
    slide.setAttribute(DATA_APPLIED, 'true');
    syncCuiabaObjectPosition();
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
    paintAllNovaRotaTags();

    console.log('[Cuiabá] Banner personalizado aplicado com sucesso');
    return true;
  }

  function paintAllNovaRotaTags() {
    const spans = document.querySelectorAll('span');
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      if (span.querySelector('*')) continue;
      if (span.textContent.trim() !== CONFIG.tag) continue;
      markTagPill(span);
    }
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
        markTagPill(previewTag);
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
  let resizeTimer = null;

  function tryApply() {
    attempts++;
    if (applyBanner()) {
      syncCuiabaObjectPosition();
      return;
    }
    if (attempts < maxAttempts) {
      setTimeout(tryApply, 500);
    } else {
      console.warn('[Cuiabá] Nao foi possivel localizar o banner apos timeout');
    }
  }

  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncCuiabaObjectPosition, 100);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryApply);
  } else {
    tryApply();
  }
})();
