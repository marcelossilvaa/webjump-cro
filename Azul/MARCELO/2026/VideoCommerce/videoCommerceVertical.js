(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const DEBUG = false;
  const LOG_PREFIX = '[WJ-VideoCommerce-Vertical]';
  const FORCE_LOGS = (function () {
    try {
      return (
        (window.location &&
          window.location.search &&
          window.location.search.indexOf('wjvcdebug=1') !== -1) ||
        window.__WJ_VC_DEBUG === true
      );
    } catch (e) {
      return false;
    }
  })();
  const INJECT_PROMISE_KEY = '__wjVideoCommerceVerticalInjectPromise';
  const INJECT_DONE_KEY = '__wjVideoCommerceVerticalInjectDone';
  const ERROR_HOOK_FLAG = '__wjVideoCommerceVerticalErrorHooked';
  const SDK_ERROR_FLAG = '__wjStreamshopSdkCarouselError';
  const SDK_ERROR_MSG_FRAGMENT = "Cannot read properties of null (reading 'addEventListener')";
  const OVERLAY_SDK_ID = 'liveshop-sdk';
  const OVERLAY_SDK_SRC = 'https://assets.streamshop.com.br/sdk/liveshop-sdk-overlay.min.js';

  const COMPONENT_WRAPPER_ATTR = 'data-wj-videocommerce-vertical';
  const COMPONENT_WRAPPER_VALUE = '1';
  const SDK_SCRIPT_ATTR = 'data-wj-streamshop-sdk';
  const ANALYTICS_VIEW_ATTR = 'data-wj-carousel-analytics-view';
  const ANALYTICS_TRACKING_ATTR = 'data-wj-carousel-analytics-tracking';
  const EXPERIMENT_NAME = 'AT_VideoCommerce_CarouselVertical';
  const EVAR84 = 'AT_VideoCommerce_Disney';

  const STORE_SLUG = 'azullinhasaereas';
  const PDF_ANCHOR_HREF_SUB = 'Guia-de-Experiencias-WaltDisneyWorld.pdf';
  const PARQUES_PATH_SEGMENT = '/disney/parques-disney';
  const DISNEY_PATH_SEGMENT = '/disney';
  const MICKEY_DESK_IMG_SUB = 'foto-mickey-desk';
  const MICKEY_GROUP_IMG_SUB = 'Group 10773';

  const STREAMSHOP_SDKS = [
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-video.min.js',
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel.min.js'
  ];

  const UTM_SESSION_KEY = '__wjVideoCommerceDisneyUtm';
  const UTM_SOURCE_ALLOWED = [
    '202512-AZV-B2C-EMM-168H-VIAGEM-INGRESSOSDISNEY-D16',
    '202604-azv-b2c-psh-168h-Inter-previagemhospedagemdisney-d0_tickets',
    '202603-AZV-B2C-EMM-168H-VIAGEM-INCENTIVOINGRESSOSDISNEY-D5',
    'pmweb_azv_e-mail_banner_mf_azv_202510-azv-b2c-emm-168h-viagem-produtosdisneya-d2_n',
    'pmweb_azv_e-mail_banner_mf_azv_202510-azv-b2c-emm-168h-viagem-produtosdisneyb-d2_n',
    '202603-AZV-B2C-EMM-168H-VIAGEM-ABANDONOCARRINHODISNEY-D0',
    '202603-azv-b2c-psh-168h-Inter-abandonocarrinhoingressosdisney-d2_pac',
    'pmweb_azv_e-mail_banner_lf_azv_202603-azv-b2c-emm-168h-viagem-incentivohospedagemdisney-d7_hotel',
    '202603-AZV-B2C-EMM-168H-VIAGEM-ABANDONOPESQUISAINGRESSOSDISNEY-D0',
    '202604-azv-b2c-emm-168h-viagem-abandonopesquisaingressosdisneyAZ-d2_tickets',
  ];

  function utmSourceMatches(source) {
    if (!source) return false;
    const s = String(source).toLowerCase();
    let i;
    for (i = 0; i < UTM_SOURCE_ALLOWED.length; i++) {
      const allowed = String(UTM_SOURCE_ALLOWED[i] || '').toLowerCase();
      if (!allowed) continue;
      if (s === allowed) return true;
      if (s.indexOf(allowed) !== -1) return true;
    }
    return false;
  }

  function readUtmSourceFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('utm_source') || '';
    } catch (e) {
      return '';
    }
  }

  function persistUtmSessionIfValid() {
    if (!utmSourceMatches(readUtmSourceFromUrl())) return false;
    try {
      sessionStorage.setItem(UTM_SESSION_KEY, '1');
    } catch (e) {}
    return true;
  }

  function hasRequiredUtm() {
    if (FORCE_LOGS) return true;
    if (persistUtmSessionIfValid()) return true;
    try {
      return sessionStorage.getItem(UTM_SESSION_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    const labelEvent = EXPERIMENT_NAME + '_' + eventType + ' ' + eventLabel;
    if (FORCE_LOGS) {
      console.log('[Tracking VideoCommerce Carousel Vertical]', labelEvent);
    }
    try {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = EVAR84;
      s.tl(true, 'o', 'target_activity_action');
    } catch (e) {}
  }

  function getComposedEventPath(evt) {
    if (evt && typeof evt.composedPath === 'function') {
      return evt.composedPath();
    }
    return evt && evt.target ? [evt.target] : [];
  }

  function pathIncludesNode(path, node) {
    let i;
    for (i = 0; i < path.length; i++) {
      if (path[i] === node) return true;
    }
    return false;
  }

  function findVideoInPath(path) {
    let i;
    for (i = 0; i < path.length; i++) {
      const node = path[i];
      if (node && node.tagName === 'VIDEO') {
        return node.currentSrc || node.src || 'video-sem-url';
      }
    }
    return '';
  }

  function getCarouselClickHit(evt, carouselEl) {
    const path = getComposedEventPath(evt);
    if (!pathIncludesNode(path, carouselEl)) return null;

    const videoSrc = findVideoInPath(path);
    if (videoSrc) {
      return { eventType: 'clique-video', eventLabel: videoSrc };
    }

    let i;
    for (i = 0; i < path.length; i++) {
      const node = path[i];
      if (!node || node.nodeType !== 1) continue;

      if (node.classList && node.classList.contains('close-button')) {
        return { eventType: 'clique-fechar-overlay', eventLabel: 'overlay-streamshop' };
      }

      const cls = String(node.className || '').toLowerCase();
      const aria = String((node.getAttribute && node.getAttribute('aria-label')) || '').toLowerCase();

      if (
        cls.indexOf('prev') !== -1 ||
        cls.indexOf('anterior') !== -1 ||
        aria.indexOf('anterior') !== -1 ||
        aria.indexOf('previous') !== -1
      ) {
        return { eventType: 'clique-navegacao', eventLabel: 'anterior' };
      }

      if (
        cls.indexOf('next') !== -1 ||
        cls.indexOf('proxim') !== -1 ||
        aria.indexOf('proxim') !== -1 ||
        aria.indexOf('next') !== -1
      ) {
        return { eventType: 'clique-navegacao', eventLabel: 'proximo' };
      }
    }

    return { eventType: 'clique-carousel', eventLabel: 'area-carousel' };
  }

  function attachCarouselTracking(wrapper) {
    if (!wrapper || wrapper.getAttribute(ANALYTICS_TRACKING_ATTR) === '1') return;

    const carouselEl = wrapper.querySelector('liveshop-ads-carousel');
    if (!carouselEl) return;

    wrapper.setAttribute(ANALYTICS_TRACKING_ATTR, '1');
    wrapper.addEventListener(
      'click',
      function (evt) {
        const hit = getCarouselClickHit(evt, carouselEl);
        if (!hit) return;
        analyticsEvent(hit.eventLabel, hit.eventType);
      },
      true,
    );
    logDebug(LOG_PREFIX, 'tracking do carousel anexado.');
  }

  function trackCarouselView(wrapper) {
    if (!wrapper || wrapper.getAttribute(ANALYTICS_VIEW_ATTR) === '1') return;
    wrapper.setAttribute(ANALYTICS_VIEW_ATTR, '1');
    analyticsEvent('carousel-vertical-parques', 'visualizacao');
  }

  function ensureCarouselAnalytics(wrapper) {
    if (!wrapper) return;
    attachCarouselTracking(wrapper);
    trackCarouselView(wrapper);
  }

  function hookOverlayAnalytics() {
    if (window.__wjVideoCommerceVerticalOverlayAnalytics) return;
    window.__wjVideoCommerceVerticalOverlayAnalytics = true;

    document.addEventListener(
      'click',
      function (evt) {
        const path = getComposedEventPath(evt);
        let overlayNode = null;
        let i;

        for (i = 0; i < path.length; i++) {
          const node = path[i];
          if (!node || node.nodeType !== 1) continue;
          if (node.id === OVERLAY_SDK_ID) {
            overlayNode = node;
            break;
          }
        }

        if (!overlayNode) return;

        const videoSrc = findVideoInPath(path);
        if (videoSrc) {
          analyticsEvent(videoSrc, 'clique-video-overlay');
          return;
        }

        for (i = 0; i < path.length; i++) {
          const node = path[i];
          if (!node || node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('close-button')) {
            analyticsEvent('overlay-streamshop', 'clique-fechar-overlay');
            return;
          }
        }

        analyticsEvent('overlay-streamshop', 'clique-overlay');
      },
      true,
    );
    logDebug(LOG_PREFIX, 'tracking do overlay ligado.');
  }

  function logDebug() {
    if (!DEBUG && !FORCE_LOGS) return;
    try {
      console.log.apply(console, arguments);
    } catch (e) {}
  }

  function warnDebug() {
    if (!DEBUG && !FORCE_LOGS) return;
    try {
      console.warn.apply(console, arguments);
    } catch (e) {}
  }

  function waitForCondition(checkFn, timeoutMs, intervalMs) {
    const start = Date.now();
    return new Promise(function (resolve) {
      (function tick() {
        if (checkFn()) return resolve(true);
        if (Date.now() - start >= timeoutMs) return resolve(false);
        window.setTimeout(tick, intervalMs);
      })();
    });
  }

  function isCarouselDefined() {
    try {
      return !!(
        window.customElements &&
        window.customElements.get &&
        window.customElements.get('liveshop-ads-carousel')
      );
    } catch (e) {
      return false;
    }
  }

  function isMobileViewport() {
    try {
      if (window.matchMedia) {
        return window.matchMedia('(max-width: 766px)').matches;
      }
    } catch (e) {}
    return typeof window.innerWidth === 'number' && window.innerWidth <= 766;
  }

  function isDisneySection() {
    try {
      return (window.location.pathname || '').toLowerCase().indexOf(DISNEY_PATH_SEGMENT) !== -1;
    } catch (e) {
      return false;
    }
  }

  function isParquesTabActiveInNav() {
    const parquesTab = document.querySelector(
      '.container-tabs a[aria-label="Parques"], a[aria-label="Parques"]',
    );
    if (!parquesTab) return false;
    return (parquesTab.className || '').indexOf('bxyvc') !== -1;
  }

  function isParquesDisneyPage() {
    if (!isDisneySection()) return false;
    const path = (window.location.pathname || '').toLowerCase();
    if (path.indexOf(PARQUES_PATH_SEGMENT) !== -1) {
      return true;
    }
    return isParquesTabActiveInNav();
  }

  function capsuleHasParquesMickeyAsset(capsule) {
    if (!capsule) return false;
    if (
      capsule.querySelector('img[src*="' + MICKEY_DESK_IMG_SUB + '"]') ||
      capsule.querySelector('img[src*="' + MICKEY_GROUP_IMG_SUB + '"]') ||
      capsule.querySelector('img[src*="Group%2010773"]')
    ) {
      return true;
    }
    const btn = capsule.querySelector('button.css-gvybwp');
    if (btn) {
      if (btn.querySelector('.css-1n4qgef')) return true;
      if ((btn.textContent || '').indexOf('Código copiado') !== -1) return true;
    }
    return false;
  }

  function findParquesMickeyCapsuleInDom() {
    const typoCapsule = document.querySelector(
      '.container-capsule.containerDefault.hide-on-mobil, .container-capsule.hide-on-mobil',
    );
    if (typoCapsule && capsuleHasParquesMickeyAsset(typoCapsule)) {
      logDebug(LOG_PREFIX, 'cápsula Mickey (hide-on-mobil):', typoCapsule);
      return typoCapsule;
    }

    const buttons = document.querySelectorAll('button.css-gvybwp');
    let b;
    for (b = 0; b < buttons.length; b++) {
      const btn = buttons[b];
      if (
        !btn.querySelector('.css-1n4qgef') &&
        (btn.textContent || '').indexOf('Código copiado') === -1
      ) {
        continue;
      }
      const fromBtn = btn.closest('.container-capsule');
      if (fromBtn) {
        logDebug(LOG_PREFIX, 'cápsula Mickey via botão:', fromBtn);
        return fromBtn;
      }
    }

    const capsules = document.querySelectorAll(
      '.container-capsule.containerDefault, .container-capsule',
    );
    if (!capsules || !capsules.length) return null;
    let i;
    for (i = 0; i < capsules.length; i++) {
      if (capsuleHasParquesMickeyAsset(capsules[i])) {
        logDebug(LOG_PREFIX, 'cápsula Mickey via asset:', capsules[i]);
        return capsules[i];
      }
    }
    return null;
  }

  function getParquesContentCapsule() {
    const mickey = findParquesMickeyCapsuleInDom();
    if (mickey) return mickey;

    const headings = document.querySelectorAll('h1, h2, h3, h4');
    let i;
    for (i = 0; i < headings.length; i++) {
      const text = (headings[i].textContent || '').toLowerCase();
      if (
        text.indexOf('guia mágico') !== -1 ||
        text.indexOf('guia magico') !== -1 ||
        text.indexOf('walt disney world') !== -1
      ) {
        const fromHeading = headings[i].closest('.container-capsule');
        if (fromHeading) {
          logDebug(LOG_PREFIX, 'cápsula via heading guia mágico:', fromHeading);
          return fromHeading;
        }
        const section = headings[i].closest('[class*="css-"]');
        if (section && section.parentNode) {
          logDebug(LOG_PREFIX, 'seção via heading guia mágico:', section);
          return section;
        }
      }
    }

    const capsules = document.querySelectorAll('.container-capsule.containerDefault');
    if (capsules.length) {
      logDebug(LOG_PREFIX, 'fallback: primeira container-capsule:', capsules[0]);
      return capsules[0];
    }

    return null;
  }

  function getParquesTargetAnchor() {
    const capsule = getParquesContentCapsule();
    if (!capsule) return null;
    return (
      capsule.querySelector('button.css-gvybwp') ||
      capsule.querySelector('img[src*="' + MICKEY_DESK_IMG_SUB + '"]') ||
      capsule.querySelector('img[src*="' + MICKEY_GROUP_IMG_SUB + '"]') ||
      capsule
    );
  }

  function getParquesInsertionPlacement() {
    const capsule = getParquesContentCapsule();
    if (capsule && capsule.parentNode) {
      return { mode: 'before', parent: capsule.parentNode, ref: capsule };
    }
    return null;
  }

  function getMobileDisneyHeroCapsule() {
    const capsules = document.querySelectorAll(
      '.container-capsule.containerDefault.hide-on-desktop',
    );
    if (!capsules || !capsules.length) return null;
    const pdfSel = 'a[href*="' + PDF_ANCHOR_HREF_SUB + '"]';
    let i;
    for (i = 0; i < capsules.length; i++) {
      const c = capsules[i];
      if (!c.querySelector(pdfSel)) continue;
      if (
        c.querySelector('source[srcset*="kv-personagens-mobile"]') ||
        c.querySelector('img[src*="kv-personagens-mobile"]')
      ) {
        return c;
      }
    }
    for (i = 0; i < capsules.length; i++) {
      const c = capsules[i];
      if (!c.querySelector(pdfSel)) continue;
      if (c.querySelector('.BannerContainer.variation1')) {
        return c;
      }
    }
    return null;
  }

  function getInsertionPlacement(anchorEl) {
    if (isParquesDisneyPage()) {
      return getParquesInsertionPlacement();
    }
    if (isMobileViewport()) {
      let capsule = null;
      if (anchorEl) {
        capsule = anchorEl.closest('.container-capsule.containerDefault.hide-on-desktop');
      }
      if (!capsule) {
        capsule = getMobileDisneyHeroCapsule();
      }
      if (capsule && capsule.parentNode) {
        return { mode: 'before', parent: capsule.parentNode, ref: capsule };
      }
      return null;
    }
    if (!anchorEl) return null;
    const deskCap = anchorEl.closest('.container-capsule.containerDefault.hide-on-mobile');
    if (deskCap && deskCap.parentNode) {
      return { mode: 'after', parent: deskCap.parentNode, ref: deskCap };
    }
    const putdhw = anchorEl.closest('.css-putdhw');
    if (putdhw && putdhw.parentNode && putdhw.parentNode.parentNode) {
      return { mode: 'after', parent: putdhw.parentNode.parentNode, ref: putdhw.parentNode };
    }
    const cap = anchorEl.closest('.container-capsule.containerDefault');
    if (cap && cap.parentNode) {
      return { mode: 'after', parent: cap.parentNode, ref: cap };
    }
    return null;
  }

  function getTargetAnchor() {
    if (isParquesDisneyPage()) {
      return getParquesTargetAnchor();
    }
    const links = document.querySelectorAll('a[href*="' + PDF_ANCHOR_HREF_SUB + '"]');
    logDebug(LOG_PREFIX, 'links PDF encontrados:', links ? links.length : 0);
    if (!links || !links.length) return null;
    let i;
    if (isMobileViewport()) {
      const heroCap = getMobileDisneyHeroCapsule();
      if (heroCap) {
        const inner = heroCap.querySelector('a[href*="' + PDF_ANCHOR_HREF_SUB + '"]');
        if (inner) return inner;
      }
      for (i = 0; i < links.length; i++) {
        if (links[i].closest('.container-capsule.containerDefault.hide-on-desktop')) {
          return links[i];
        }
      }
    } else {
      for (i = 0; i < links.length; i++) {
        if (links[i].closest('.container-capsule.containerDefault.hide-on-mobile')) {
          return links[i];
        }
      }
      for (i = 0; i < links.length; i++) {
        if (!links[i].closest('.container-capsule.containerDefault.hide-on-desktop')) {
          return links[i];
        }
      }
    }
    return links[0];
  }

  function loadOverlaySdkOnce() {
    const existingById = document.getElementById(OVERLAY_SDK_ID);
    const existingBySrc = document.querySelector('script[src="' + OVERLAY_SDK_SRC + '"]');

    if (existingById || existingBySrc) {
      logDebug(LOG_PREFIX, 'overlay SDK já existe.');
      return Promise.resolve(true);
    }

    return new Promise(function (resolve) {
      const script = document.createElement('script');
      script.async = false;
      script.src = OVERLAY_SDK_SRC;
      script.id = OVERLAY_SDK_ID;
      script.setAttribute('overlay-position', 'right');
      script.onload = function () {
        logDebug(LOG_PREFIX, 'overlay SDK carregado:', OVERLAY_SDK_SRC);
        resolve(true);
      };
      script.onerror = function () {
        warnDebug(LOG_PREFIX, 'falha ao carregar overlay SDK:', OVERLAY_SDK_SRC);
        resolve(false);
      };
      logDebug(LOG_PREFIX, 'injetando overlay SDK:', OVERLAY_SDK_SRC);
      document.head.appendChild(script);
    });
  }

  function loadSdkScriptsOnce() {
    if (isCarouselDefined()) {
      logDebug(LOG_PREFIX, 'custom element v1 já definido, pulando load de SDK.');
      return Promise.resolve(true);
    }

    let chain = loadOverlaySdkOnce();

    for (let i = 0; i < STREAMSHOP_SDKS.length; i++) {
      (function (src) {
        chain = chain.then(function () {
          if (isCarouselDefined()) return true;

          const already = document.querySelector('script[src="' + src + '"]');
          if (already) {
            logDebug(LOG_PREFIX, 'script já existe:', src);
            return true;
          }

          return new Promise(function (resolve) {
            const script = document.createElement('script');
            script.async = false;
            script.src = src;
            script.setAttribute(SDK_SCRIPT_ATTR, COMPONENT_WRAPPER_VALUE);
            script.onload = function () {
              logDebug(LOG_PREFIX, 'script carregado:', src);
              logDebug(LOG_PREFIX, 'custom element após load? v1:', isCarouselDefined());
              resolve(true);
            };
            script.onerror = function () {
              warnDebug(LOG_PREFIX, 'falha ao carregar script:', src);
              resolve(false);
            };
            logDebug(LOG_PREFIX, 'injetando script:', src);
            document.head.appendChild(script);
          });
        });
      })(STREAMSHOP_SDKS[i]);
    }

    return chain.then(function () {
      logDebug(LOG_PREFIX, 'aguardando custom element liveshop-ads-carousel...');
      return waitForCondition(isCarouselDefined, 15000, 100).then(function (ok) {
        logDebug(LOG_PREFIX, 'custom element v1 definido?', ok);
        return ok;
      });
    });
  }

  function buildLiveshopCarouselVerticalElement() {
    const el = document.createElement('liveshop-ads-carousel');
    el.setAttribute('height', '412px');
    el.setAttribute('width', '100%');
    el.setAttribute('videos-width', '263px');
    el.setAttribute('border-radius', '25px');
    el.setAttribute('use-active-videos-from', STORE_SLUG);
    return el;
  }

  function createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(COMPONENT_WRAPPER_ATTR, COMPONENT_WRAPPER_VALUE);
    return wrapper;
  }

  function insertWrapperForPlacement(outer, placement) {
    if (placement.mode === 'before') {
      placement.parent.insertBefore(outer, placement.ref);
      return;
    }
    placement.parent.insertBefore(outer, placement.ref.nextSibling);
  }

  function wrapperAlreadyAdjacent(placement) {
    if (placement.mode === 'before') {
      const prev = placement.ref.previousElementSibling;
      return !!(
        prev &&
        prev.getAttribute &&
        prev.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
      );
    }
    const next = placement.ref.nextElementSibling;
    return !!(
      next &&
      next.getAttribute &&
      next.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
    );
  }

  function clearInjectDoneIfWrapperMissing() {
    if (!window[INJECT_DONE_KEY]) return;
    const wrapper = document.querySelector(
      '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
    );
    const capsule = getParquesContentCapsule();
    if (!wrapper) {
      window[INJECT_DONE_KEY] = false;
      logDebug(LOG_PREFIX, 'INJECT_DONE resetado: wrapper sumiu do DOM.');
      return;
    }
    if (capsule && capsule.previousElementSibling !== wrapper) {
      window[INJECT_DONE_KEY] = false;
      logDebug(LOG_PREFIX, 'INJECT_DONE resetado: wrapper não está acima da cápsula alvo.');
    }
  }

  function injectAfter(anchorEl) {
    if (!anchorEl) return false;

    const placementStart = getInsertionPlacement(anchorEl);
    if (!placementStart || !placementStart.parent) {
      warnDebug(LOG_PREFIX, 'ponto de inserção inválido para âncora:', anchorEl);
      return false;
    }

    logDebug(
      LOG_PREFIX,
      'placement:',
      placementStart.mode,
      'ref:',
      placementStart.ref,
      'parent:',
      placementStart.parent,
    );

    if (window[INJECT_DONE_KEY]) {
      logDebug(LOG_PREFIX, 'injeção já concluída anteriormente. Ignorando.');
      return true;
    }

    if (wrapperAlreadyAdjacent(placementStart)) {
      logDebug(LOG_PREFIX, 'wrapper já existe adjacente ao alvo. Nada a fazer.');
      const adjacentWrapper = document.querySelector(
        '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
      );
      ensureCarouselAnalytics(adjacentWrapper);
      window[INJECT_DONE_KEY] = true;
      return true;
    }

    const existing = document.querySelector(
      '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
    );
    if (existing) {
      logDebug(LOG_PREFIX, 'wrapper já existe em algum lugar:', existing);
      ensureCarouselAnalytics(existing);
      window[INJECT_DONE_KEY] = true;
      return true;
    }

    if (window[INJECT_PROMISE_KEY]) {
      logDebug(LOG_PREFIX, 'injeção já em andamento. Ignorando chamada duplicada.');
      return true;
    }

    logDebug(LOG_PREFIX, 'iniciando load de SDKs...', 'href:', window.location && window.location.href);
    window[INJECT_PROMISE_KEY] = loadSdkScriptsOnce()
      .then(function (ok) {
        if (window[INJECT_DONE_KEY]) return;

        if (!ok) {
          warnDebug(
            LOG_PREFIX,
            'SDK não ficou pronto; não inserindo. v1 definido?',
            isCarouselDefined(),
          );
          return;
        }

        const anchorNow = getTargetAnchor();
        if (!anchorNow) {
          warnDebug(
            LOG_PREFIX,
            'âncora não encontrada após SDK ok. Parques?',
            isParquesDisneyPage(),
            'URL:',
            window.location.href,
          );
          return;
        }

        const placementNow = getInsertionPlacement(anchorNow);
        if (!placementNow || !placementNow.parent) {
          warnDebug(LOG_PREFIX, 'ponto de inserção não encontrado após SDK ok.');
          return;
        }

        if (
          document.querySelector(
            '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
          )
        ) {
          window[INJECT_DONE_KEY] = true;
          return;
        }

        if (wrapperAlreadyAdjacent(placementNow)) {
          window[INJECT_DONE_KEY] = true;
          return;
        }

        const wrapper2 = createWrapper();
        const carousel = buildLiveshopCarouselVerticalElement();
        wrapper2.appendChild(carousel);
        insertWrapperForPlacement(wrapper2, placementNow);
        ensureCarouselAnalytics(wrapper2);
        window[INJECT_DONE_KEY] = true;
        logDebug(LOG_PREFIX, 'inserido. Wrapper:', wrapper2, 'Carousel:', carousel);
      })
      .finally(function () {
        window[INJECT_PROMISE_KEY] = null;
      });

    return true;
  }

  function run() {
    if (!hasRequiredUtm()) {
      logDebug(LOG_PREFIX, 'UTM invalida ou ausente. Carousel vertical nao sera exibido.');
      return;
    }

    clearInjectDoneIfWrapperMissing();

    if (window[INJECT_DONE_KEY]) return;
    if (isProcessing) return;
    isProcessing = true;

    try {
      logDebug(
        LOG_PREFIX,
        'run() acionado.',
        'URL:',
        window.location && window.location.href,
        'mobile?',
        isMobileViewport(),
        'parques?',
        isParquesDisneyPage(),
        'parquesTabNav?',
        isParquesTabActiveInNav(),
      );

      const anchor = getTargetAnchor();
      if (!anchor) {
        warnDebug(
          LOG_PREFIX,
          'âncora não encontrada.',
          'Parques?',
          isParquesDisneyPage(),
          'PDF links:',
          document.querySelectorAll('a[href*="' + PDF_ANCHOR_HREF_SUB + '"]').length,
          'mickey capsule?',
          !!findParquesMickeyCapsuleInDom(),
          'guia heading?',
          !!getParquesContentCapsule(),
        );
        return;
      }
      logDebug(LOG_PREFIX, 'âncora encontrada:', anchor);

      const placement = getInsertionPlacement(anchor);
      if (!placement) {
        warnDebug(LOG_PREFIX, 'ponto de inserção não encontrado a partir da âncora.');
        return;
      }
      logDebug(LOG_PREFIX, 'placement resolvido:', placement.mode);

      injectAfter(anchor);
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    clearInjectDoneIfWrapperMissing();
    if (window[INJECT_DONE_KEY]) return;
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      run();
    }, 150);
  }

  function hookSpaNavigation() {
    if (window.__wjVideoCommerceVerticalSpaHooked) return;
    window.__wjVideoCommerceVerticalSpaHooked = true;

    const fire = function () {
      window[INJECT_DONE_KEY] = false;
      window.setTimeout(function () {
        scheduleRun();
      }, 400);
    };

    const pushState = history.pushState;
    history.pushState = function () {
      pushState.apply(history, arguments);
      fire();
    };

    const replaceState = history.replaceState;
    history.replaceState = function () {
      replaceState.apply(history, arguments);
      fire();
    };

    window.addEventListener('popstate', fire);
    window.addEventListener('hashchange', fire);
    logDebug(LOG_PREFIX, 'SPA hooks ligados.');
  }

  function initObserver() {
    if (window.__wjVideoCommerceVerticalObserverInitialized) return;
    window.__wjVideoCommerceVerticalObserverInitialized = true;

    const observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (!m.addedNodes || !m.addedNodes.length) continue;

        for (let j = 0; j < m.addedNodes.length; j++) {
          const node = m.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (node.getAttribute && node.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE) {
            return;
          }
        }
      }

      scheduleRun();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    logDebug(LOG_PREFIX, 'MutationObserver ligado.');
  }

  function init() {
    if (!hasRequiredUtm()) {
      logDebug(LOG_PREFIX, 'UTM invalida ou ausente. Script nao iniciado.');
      return;
    }

    if (!window[ERROR_HOOK_FLAG]) {
      window[ERROR_HOOK_FLAG] = true;

      window.addEventListener('error', function (evt) {
        try {
          const msg = (evt && evt.message) || '';
          if (msg && msg.indexOf(SDK_ERROR_MSG_FRAGMENT) !== -1) {
            window[SDK_ERROR_FLAG] = true;
          }
        } catch (e) {
          // noop
        }
      });
    }

    hookSpaNavigation();
    hookOverlayAnalytics();
    run();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
