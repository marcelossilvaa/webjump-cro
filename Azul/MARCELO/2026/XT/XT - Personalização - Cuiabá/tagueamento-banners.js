(function () {
  'use strict';

  if (window._homeBannersCompareTracking) {
    return;
  }
  window._homeBannersCompareTracking = true;

  const ACTIVITY = 'AT_HomeBannersCompare';
  const DATA_TAGGED = 'data-banner-compare-tagged';
  const DATA_TRACK = 'data-banner-compare-track';
  const DATA_VIEWED = 'data-banner-compare-viewed';
  const DATA_PREVIEW = 'data-banner-compare-preview';
  const DATA_INDEX = 'data-banner-compare-index';
  const DATA_NAME = 'data-banner-compare-name';
  const DATA_SLUG = 'data-banner-compare-slug';

  let isProcessing = false;
  let debounceTimer = null;
  let attempts = 0;
  const maxAttempts = 25;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[HomeBannersCompare] Parametro ausente para evento analytics.');
      return;
    }

    const labelEvent = ACTIVITY + '_' + eventType + ' ' + eventLabel;
    console.log('[HomeBannersCompare] Analytics event:', labelEvent);

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

  function normalizeText(value) {
    return (value || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slugify(value) {
    return normalizeText(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60);
  }

  function getSlideTitle(slide) {
    const h2 = slide.querySelector('h2');
    if (h2 && normalizeText(h2.textContent)) {
      return normalizeText(h2.textContent);
    }

    const img = slide.querySelector('img');
    if (img && normalizeText(img.getAttribute('alt'))) {
      return normalizeText(img.getAttribute('alt'));
    }

    const tag = slide.querySelector('[class*="gHpGKH"] span, [class*="sc-c20cd3f8-3"] span');
    if (tag && normalizeText(tag.textContent)) {
      return normalizeText(tag.textContent);
    }

    return 'banner_sem_nome';
  }

  function getPreviewTitle(btn) {
    const titleEl = btn.querySelector('[class*="sc-c20cd3f8-5"]');
    if (titleEl && normalizeText(titleEl.textContent)) {
      return normalizeText(titleEl.textContent);
    }

    const img = btn.querySelector('img');
    if (img && normalizeText(img.getAttribute('alt'))) {
      return normalizeText(img.getAttribute('alt'));
    }

    const tag = btn.querySelector('span');
    if (tag && normalizeText(tag.textContent)) {
      return normalizeText(tag.textContent);
    }

    return 'banner_sem_nome';
  }

  function buildEventLabel(index, name) {
    const slug = slugify(name) || 'sem_nome';
    return 'banner_' + index + '|' + slug;
  }

  function isBannerSlide(node) {
    return !!(node && node.querySelector && node.querySelector('h2') && node.querySelector('img'));
  }

  function findSlideContainers() {
    const slides = document.querySelectorAll('[data-active]');
    const parents = [];
    const seen = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!isBannerSlide(slide)) continue;

      const parent = slide.parentElement;
      if (!parent) continue;
      if (seen.indexOf(parent) !== -1) continue;
      seen.push(parent);
      parents.push(parent);
    }

    return parents;
  }

  function getOrderedSlides(container) {
    const children = container.children;
    const ordered = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (isBannerSlide(child)) {
        ordered.push(child);
      }
    }

    return ordered;
  }

  function bindCtaClick(slide, index, name) {
    const cta = slide.querySelector('a[type="button"], a.at-cba-cta');
    if (!cta || cta.getAttribute(DATA_TRACK)) return;

    cta.setAttribute(DATA_TRACK, 'true');
    cta.setAttribute(DATA_INDEX, String(index));
    cta.setAttribute(DATA_NAME, name);

    cta.addEventListener('click', function () {
      // Ex: banner_1|voe_de_cuiaba_para_onde_quiser
      analyticsEvent(buildEventLabel(index, name), 'click_cta');
    });
  }

  function trackView(slide, index, name, force) {
    if (slide.getAttribute('data-active') !== 'true') return;
    if (!force && slide.getAttribute(DATA_VIEWED) === 'true') return;

    slide.setAttribute(DATA_VIEWED, 'true');
    // Ex: banner_1|voe_de_cuiaba_para_onde_quiser
    analyticsEvent(buildEventLabel(index, name), 'view');
  }

  function tagSlide(slide, index) {
    const name = getSlideTitle(slide);
    const slug = slugify(name);
    const alreadyTagged = slide.getAttribute(DATA_TAGGED) === 'true';
    const previousIndex = slide.getAttribute(DATA_INDEX);
    const previousName = slide.getAttribute(DATA_NAME);

    slide.setAttribute(DATA_TAGGED, 'true');
    slide.setAttribute(DATA_INDEX, String(index));
    slide.setAttribute(DATA_NAME, name);
    slide.setAttribute(DATA_SLUG, slug);

    // Se o conteudo do banner mudou no mesmo index, libera nova view
    if (alreadyTagged && previousName && previousName !== name) {
      slide.removeAttribute(DATA_VIEWED);
    }

    if (!alreadyTagged || previousIndex !== String(index)) {
      console.log(
        '[HomeBannersCompare] Banner tagueado: index=' +
          index +
          ' nome="' +
          name +
          '"'
      );
    }

    bindCtaClick(slide, index, name);
    trackView(slide, index, name, false);
  }

  function findPreviewContainers() {
    const buttons = document.querySelectorAll(
      '[class*="sc-c20cd3f8"] button, button[class*="sc-c20cd3f8"]'
    );
    const parents = [];
    const seen = [];

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const parent = btn.closest('[class*="sc-e438c263-1"]') || btn.parentElement;
      if (!parent) continue;
      if (seen.indexOf(parent) !== -1) continue;

      // So considera containers que tenham varios botoes de preview
      const btnsInParent = parent.querySelectorAll('button');
      if (btnsInParent.length < 2) continue;

      seen.push(parent);
      parents.push(parent);
    }

    // Fallback: agrupa pelo parent comum dos botoes sc-c20cd3f8
    if (parents.length === 0 && buttons.length > 0) {
      const map = [];
      for (let b = 0; b < buttons.length; b++) {
        const p = buttons[b].parentElement && buttons[b].parentElement.parentElement;
        if (!p) continue;
        if (map.indexOf(p) === -1) map.push(p);
      }
      return map;
    }

    return parents;
  }

  function getOrderedPreviewButtons(container) {
    const buttons = container.querySelectorAll('button');
    const ordered = [];

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      if (btn.querySelector('img')) {
        ordered.push(btn);
      }
    }

    return ordered;
  }

  function tagPreviewButton(btn, index) {
    const name = getPreviewTitle(btn);
    const slug = slugify(name);

    btn.setAttribute(DATA_PREVIEW, 'true');
    btn.setAttribute(DATA_INDEX, String(index));
    btn.setAttribute(DATA_NAME, name);
    btn.setAttribute(DATA_SLUG, slug);

    if (btn.getAttribute(DATA_TRACK)) return;
    btn.setAttribute(DATA_TRACK, 'true');

    btn.addEventListener('click', function () {
      // Ex: banner_2|ate_20_off
      analyticsEvent(buildEventLabel(index, name), 'click_minibanner');
    });
  }

  function tagAll() {
    const slideContainers = findSlideContainers();
    let tagged = 0;

    for (let c = 0; c < slideContainers.length; c++) {
      const ordered = getOrderedSlides(slideContainers[c]);
      for (let i = 0; i < ordered.length; i++) {
        const index = i + 1;
        tagSlide(ordered[i], index);
        tagged++;
      }
    }

    const previewContainers = findPreviewContainers();
    for (let p = 0; p < previewContainers.length; p++) {
      const orderedBtns = getOrderedPreviewButtons(previewContainers[p]);
      for (let i = 0; i < orderedBtns.length; i++) {
        tagPreviewButton(orderedBtns[i], i + 1);
      }
    }

    return tagged > 0;
  }

  function observeCarousel() {
    if (window._homeBannersCompareObserver) return;

    const observer = new MutationObserver(function (mutations) {
      let shouldRetag = false;

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];

        if (mutation.type === 'attributes' && mutation.attributeName === 'data-active') {
          const slide = mutation.target;
          if (!slide || !slide.getAttribute) continue;
          if (slide.getAttribute(DATA_TAGGED) !== 'true') {
            shouldRetag = true;
            continue;
          }

          if (slide.getAttribute('data-active') === 'true') {
            const index = Number(slide.getAttribute(DATA_INDEX) || 0);
            const name = slide.getAttribute(DATA_NAME) || getSlideTitle(slide);
            if (index > 0) {
              slide.removeAttribute(DATA_VIEWED);
              trackView(slide, index, name, true);
            }
          }
        }

        if (mutation.type === 'childList') {
          shouldRetag = true;
        }
      }

      if (shouldRetag) {
        scheduleRun();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-active'],
      childList: true,
      subtree: true,
    });

    window._homeBannersCompareObserver = observer;
  }

  function run() {
    if (isProcessing) return false;
    isProcessing = true;
    try {
      const ok = tagAll();
      if (ok) {
        observeCarousel();
      }
      return ok;
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      run();
    }, 250);
  }

  function tryApply() {
    attempts++;
    if (run()) {
      console.log('[HomeBannersCompare] Tagueamento dinamico aplicado');
      return;
    }
    if (attempts < maxAttempts) {
      setTimeout(tryApply, 500);
    } else {
      console.warn('[HomeBannersCompare] Banners nao encontrados apos timeout');
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) scheduleRun();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryApply);
  } else {
    tryApply();
  }
})();
