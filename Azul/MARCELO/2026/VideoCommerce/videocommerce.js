(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const DEBUG = false;
  const LOG_PREFIX = '[WJ-VideoCommerce]';
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
  const INJECT_PROMISE_KEY = '__wjVideoCommerceInjectPromise';
  const INJECT_DONE_KEY = '__wjVideoCommerceInjectDone';
  const ERROR_HOOK_FLAG = '__wjVideoCommerceErrorHooked';
  const SDK_ERROR_FLAG = '__wjStreamshopSdkCarouselError';
  const SDK_ERROR_MSG_FRAGMENT = "Cannot read properties of null (reading 'addEventListener')";
  const OVERLAY_SDK_ID = 'liveshop-sdk';
  const OVERLAY_SDK_SRC = 'https://assets.streamshop.com.br/sdk/liveshop-sdk-overlay.min.js';
  const USE_CAROUSEL_V2 = true;
  const DUAL_LAYOUT_DEMO = true;
  const DEMO_STYLE_ID = 'wj-videocommerce-demo-style';

  const COMPONENT_WRAPPER_ATTR = 'data-wj-videocommerce';
  const COMPONENT_WRAPPER_VALUE = '1';
  const SDK_SCRIPT_ATTR = 'data-wj-streamshop-sdk';

  const STREAMSHOP_SDKS_V1_ONLY = [
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-video.min.js',
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel.min.js',
  ];
  const STREAMSHOP_SDKS = STREAMSHOP_SDKS_V1_ONLY.concat([
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel-v2.min.js',
  ]);

  function getAdsSdkSrcsToLoad() {
    if (DUAL_LAYOUT_DEMO) {
      return STREAMSHOP_SDKS_V1_ONLY;
    }
    return USE_CAROUSEL_V2 ? STREAMSHOP_SDKS : STREAMSHOP_SDKS_V1_ONLY;
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

  function isCarouselV2Defined() {
    try {
      return !!(
        window.customElements &&
        window.customElements.get &&
        window.customElements.get('liveshop-ads-carousel-v2')
      );
    } catch (e) {
      return false;
    }
  }

  function isAllNeededCarouselsDefined() {
    if (DUAL_LAYOUT_DEMO) {
      return isCarouselDefined();
    }
    return USE_CAROUSEL_V2 ? isCarouselV2Defined() : isCarouselDefined();
  }

  function loadSdkScriptsOnce() {
    if (isAllNeededCarouselsDefined()) {
      logDebug(LOG_PREFIX, 'custom element(s) necessário(s) já definido(s), pulando load de SDK.');
      return Promise.resolve(true);
    }

    let chain = loadOverlaySdkOnce();

    const sdkSrcs = getAdsSdkSrcsToLoad();
    for (let i = 0; i < sdkSrcs.length; i++) {
      (function (src) {
        chain = chain.then(function () {
          if (isAllNeededCarouselsDefined()) return true;

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
              logDebug(
                LOG_PREFIX,
                'custom element após load? v1:',
                isCarouselDefined(),
                'v2:',
                isCarouselV2Defined(),
              );
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
      })(sdkSrcs[i]);
    }

    return chain.then(function () {
      logDebug(
        LOG_PREFIX,
        'aguardando custom element(s)...',
        DUAL_LAYOUT_DEMO ? 'v1 (demo)' : USE_CAROUSEL_V2 ? 'v2' : 'v1',
        'customElements disponíveis?',
        !!(window.customElements && window.customElements.get),
      );
      return waitForCondition(isAllNeededCarouselsDefined, 5000, 100).then(function (ok) {
        logDebug(
          LOG_PREFIX,
          'custom element definido?',
          ok,
          'v1:',
          isCarouselDefined(),
          'v2:',
          isCarouselV2Defined(),
        );
        return ok;
      });
    });
  }

  function buildCarouselHorizontalV2() {
    const el = document.createElement('liveshop-ads-carousel-v2');
    el.setAttribute('height', '275px');
    el.setAttribute('width', '100%');
    el.setAttribute('videos-width', '400px');
    el.setAttribute('border-radius', '25px');
    el.setAttribute('use-active-videos-from', 'azullinhasaereas');
    el.setAttribute('opacity', '1');
    el.setAttribute('data-wj-videocommerce-variant', 'horizontal');
    return el;
  }

  function buildCarouselVerticalV1() {
    const el = document.createElement('liveshop-ads-carousel');
    el.setAttribute('height', '466px');
    el.setAttribute('width', '100%');
    el.setAttribute('videos-width', '257px');
    el.setAttribute('border-radius', '25px');
    el.setAttribute('use-active-videos-from', 'azullinhasaereas');
    el.setAttribute('data-wj-videocommerce-variant', 'vertical');
    return el;
  }

  function injectDemoStylesOnce() {
    if (document.getElementById(DEMO_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = DEMO_STYLE_ID;
    style.textContent = [
      '[data-wj-videocommerce-wrap]{display:block;width:100%;box-sizing:border-box;}',
      '[data-wj-videocommerce-slot]{margin-bottom:28px;}',
      '[data-wj-videocommerce-slot]:last-child{margin-bottom:0;}',
      '[data-wj-videocommerce-label]{font-size:13px;font-weight:600;margin:0 0 10px 0;color:#1a1a1a;font-family:inherit;line-height:1.3;}',
    ].join('');
    document.head.appendChild(style);
  }

  function isMobileViewport() {
    try {
      if (window.matchMedia) {
        return window.matchMedia('(max-width: 766px)').matches;
      }
    } catch (e) {}
    return typeof window.innerWidth === 'number' && window.innerWidth <= 766;
  }

  const PDF_ANCHOR_HREF_SUB = 'Guia-de-Experiencias-WaltDisneyWorld.pdf';
  const PARQUES_PATH_SEGMENT = '/disney/parques-disney';
  const DISNEY_PATH_SEGMENT = '/disney';
  const MICKEY_DESK_IMG_SUB = 'foto-mickey-desk';
  const MICKEY_GROUP_IMG_SUB = 'Group 10773';

  function isDisneySection() {
    try {
      return (window.location.pathname || '').toLowerCase().indexOf(DISNEY_PATH_SEGMENT) !== -1;
    } catch (e) {
      return false;
    }
  }

  function isParquesDisneyPage() {
    if (!isDisneySection()) return false;
    const path = (window.location.pathname || '').toLowerCase();
    return path.indexOf(PARQUES_PATH_SEGMENT) !== -1;
  }

  function removeInjectionIfNotParques() {
    if (isParquesDisneyPage()) return;

    const wrapper = document.querySelector(
      '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
    );
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
      logDebug(LOG_PREFIX, 'carrossel removido (fora da aba Parques).');
    }
    window[INJECT_DONE_KEY] = false;
    window[INJECT_PROMISE_KEY] = null;
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
      return typoCapsule;
    }

    const buttons = document.querySelectorAll('button.css-gvybwp');
    let b;
    for (b = 0; b < buttons.length; b++) {
      const btn = buttons[b];
      if (!btn.querySelector('.css-1n4qgef') && (btn.textContent || '').indexOf('Código copiado') === -1) {
        continue;
      }
      const fromBtn = btn.closest('.container-capsule');
      if (fromBtn) return fromBtn;
    }

    const capsules = document.querySelectorAll('.container-capsule.containerDefault, .container-capsule');
    if (!capsules || !capsules.length) return null;
    let i;
    for (i = 0; i < capsules.length; i++) {
      if (capsuleHasParquesMickeyAsset(capsules[i])) {
        return capsules[i];
      }
    }
    return null;
  }

  function getParquesMickeyCapsule() {
    return findParquesMickeyCapsuleInDom();
  }

  function getParquesTargetAnchor() {
    const capsule = getParquesMickeyCapsule();
    if (!capsule) return null;
    return (
      capsule.querySelector('button.css-gvybwp') ||
      capsule.querySelector('img[src*="' + MICKEY_DESK_IMG_SUB + '"]') ||
      capsule.querySelector('img[src*="' + MICKEY_GROUP_IMG_SUB + '"]') ||
      capsule
    );
  }

  function getParquesInsertionPlacement() {
    const capsule = getParquesMickeyCapsule();
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
      return { mode: 'before', parent: deskCap.parentNode, ref: deskCap };
    }
    const block = getInsertionBlockAboveAnchor(anchorEl);
    if (block && block.parentNode) {
      return { mode: 'before', parent: block.parentNode, ref: block };
    }
    return null;
  }

  function insertWrapperForPlacement(outer, placement) {
    placement.parent.insertBefore(outer, placement.ref);
  }

  function createOuterWrapper() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(COMPONENT_WRAPPER_ATTR, COMPONENT_WRAPPER_VALUE);
    if (DUAL_LAYOUT_DEMO) {
      wrapper.setAttribute('data-wj-videocommerce-wrap', '1');
    }
    if (!isMobileViewport()) {
      wrapper.style.setProperty('margin-bottom', '20px');
    }
    return wrapper;
  }

  function mountCarouselsIntoWrapper(outer) {
    if (DUAL_LAYOUT_DEMO) {
      injectDemoStylesOnce();

      const slotV = document.createElement('div');
      slotV.setAttribute('data-wj-videocommerce-slot', 'vertical');
      slotV.appendChild(buildCarouselVerticalV1());

      outer.appendChild(slotV);
    } else {
      outer.appendChild(buildCarouselHorizontalV2());
    }
  }

  function getTargetAnchor() {
    if (isParquesDisneyPage()) {
      return getParquesTargetAnchor();
    }
    const links = document.querySelectorAll('a[href*="' + PDF_ANCHOR_HREF_SUB + '"]');
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

  function getInsertionReferenceContainer(anchorEl) {
    if (!anchorEl) return null;

    const hideOnMobile = anchorEl.closest('.container-capsule.containerDefault.hide-on-mobile');
    if (hideOnMobile) return hideOnMobile;

    return anchorEl.closest('.container-capsule.containerDefault');
  }

  function getInsertionBlockAboveAnchor(anchorEl) {
    if (!anchorEl) return null;
    const putdhw = anchorEl.closest('.css-putdhw');
    if (putdhw && putdhw.parentNode) {
      return putdhw.parentNode;
    }
    return getInsertionReferenceContainer(anchorEl);
  }

  function injectAfter(anchorEl) {
    if (!anchorEl) return false;

    const placementStart = getInsertionPlacement(anchorEl);
    if (!placementStart || !placementStart.parent) {
      return false;
    }

    if (window[INJECT_DONE_KEY]) {
      logDebug(LOG_PREFIX, 'injeção já concluída anteriormente. Ignorando.');
      return true;
    }

    const prev = placementStart.ref.previousElementSibling;
    if (
      prev &&
      prev.getAttribute &&
      prev.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
    ) {
      logDebug(LOG_PREFIX, 'já existe wrapper imediatamente acima da cápsula alvo. Nada a fazer.');
      window[INJECT_DONE_KEY] = true;
      return true;
    }

    const existing = document.querySelector(
      '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
    );
    if (existing) {
      logDebug(LOG_PREFIX, 'wrapper já existe em algum lugar. Nada a fazer.');
      window[INJECT_DONE_KEY] = true;
      return true;
    }

    if (window[INJECT_PROMISE_KEY]) {
      logDebug(LOG_PREFIX, 'injeção já em andamento. Ignorando chamada duplicada.');
      return true;
    }

    logDebug(
      LOG_PREFIX,
      'iniciando load de SDKs...',
      'href:',
      window.location && window.location.href,
    );
    window[INJECT_PROMISE_KEY] = loadSdkScriptsOnce()
      .then(function (ok) {
        if (window[INJECT_DONE_KEY]) return;

        if (!ok) {
          warnDebug(
            LOG_PREFIX,
            'SDK não ficou pronto; não inserindo.',
            'v1:',
            isCarouselDefined(),
            'v2:',
            isCarouselV2Defined(),
          );
          return;
        }

        removeInjectionIfNotParques();
        if (!isParquesDisneyPage()) {
          warnDebug(LOG_PREFIX, 'saiu da aba Parques durante load do SDK; abortando inserção.');
          return;
        }

        const anchorNow = getTargetAnchor();
        if (!anchorNow) {
          warnDebug(LOG_PREFIX, 'cápsula Mickey não encontrada após SDK ok; abortando inserção.');
          return;
        }
        const placementNow = getInsertionPlacement(anchorNow);
        if (!placementNow || !placementNow.parent) {
          warnDebug(
            LOG_PREFIX,
            'ponto de inserção Parques não encontrado após SDK ok; abortando inserção.',
          );
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

        const prevNow = placementNow.ref.previousElementSibling;
        if (
          prevNow &&
          prevNow.getAttribute &&
          prevNow.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
        ) {
          window[INJECT_DONE_KEY] = true;
          return;
        }

        const outer = createOuterWrapper();
        mountCarouselsIntoWrapper(outer);
        insertWrapperForPlacement(outer, placementNow);
        window[INJECT_DONE_KEY] = true;
        logDebug(LOG_PREFIX, 'inserido. Wrapper:', outer, 'dual?', DUAL_LAYOUT_DEMO);
        window.setTimeout(function () {
          const hasSdkError = !!window[SDK_ERROR_FLAG];
          const nodes = outer.querySelectorAll('liveshop-ads-carousel, liveshop-ads-carousel-v2');
          let allShadow = true;
          for (let i = 0; i < nodes.length; i++) {
            if (!nodes[i].shadowRoot) allShadow = false;
          }
          logDebug(
            LOG_PREFIX,
            'check pós-injeção. erro SDK?',
            hasSdkError,
            'carrosséis:',
            nodes.length,
            'todos com shadow?',
            allShadow,
            'definidos? v1:',
            isCarouselDefined(),
            'v2:',
            isCarouselV2Defined(),
          );
        }, 1800);
      })
      .finally(function () {
        window[INJECT_PROMISE_KEY] = null;
      });

    return true;
  }

  function clearInjectDoneIfWrapperMissing() {
    if (!window[INJECT_DONE_KEY]) return;
    const wrapper = document.querySelector(
      '[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]',
    );
    const capsule = getParquesMickeyCapsule();
    if (!wrapper) {
      window[INJECT_DONE_KEY] = false;
      return;
    }
    if (capsule && capsule.previousElementSibling !== wrapper) {
      window[INJECT_DONE_KEY] = false;
    }
  }

  function run() {
    if (!isDisneySection()) return;

    removeInjectionIfNotParques();

    if (!isParquesDisneyPage()) {
      logDebug(LOG_PREFIX, 'fora da aba Parques; ignorando.');
      return;
    }

    clearInjectDoneIfWrapperMissing();

    if (window[INJECT_DONE_KEY]) return;
    if (isProcessing) return;
    isProcessing = true;

    try {
      logDebug(LOG_PREFIX, 'run() acionado. URL:', window.location && window.location.href);

      const anchor = getTargetAnchor();
      if (!anchor) {
        warnDebug(
          LOG_PREFIX,
          'cápsula Mickey (Parques) não encontrada ainda (foto-mickey-desk / Group 10773).',
        );
        return;
      }
      logDebug(LOG_PREFIX, 'âncora Parques encontrada:', anchor);

      const placement = getInsertionPlacement(anchor);
      if (!placement) {
        warnDebug(
          LOG_PREFIX,
          'ponto de inserção não encontrado na aba Parques (cápsula Mickey).',
        );
        return;
      }
      logDebug(LOG_PREFIX, 'inserção: acima da cápsula Mickey (aba Parques).');

      injectAfter(anchor);
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (!isDisneySection()) return;
    removeInjectionIfNotParques();
    if (!isParquesDisneyPage()) return;
    clearInjectDoneIfWrapperMissing();
    if (window[INJECT_DONE_KEY]) return;
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      run();
    }, 150);
  }

  function hookSpaNavigation() {
    if (window.__wjVideoCommerceSpaHooked) return;
    window.__wjVideoCommerceSpaHooked = true;

    const fire = function () {
      window[INJECT_DONE_KEY] = false;
      window.setTimeout(function () {
        removeInjectionIfNotParques();
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

    document.addEventListener('click', function (e) {
      const tab =
        e.target &&
        e.target.closest &&
        e.target.closest('.container-tabs a[aria-label], nav a[aria-label]');
      if (tab) {
        fire();
      }
    });
  }

  function initObserver() {
    if (window.__wjVideoCommerceObserverInitialized) return;
    window.__wjVideoCommerceObserverInitialized = true;

    const observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (!m.addedNodes || !m.addedNodes.length) continue;

        for (let j = 0; j < m.addedNodes.length; j++) {
          const node = m.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (
            node.getAttribute &&
            node.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
          ) {
            return;
          }
        }
      }

      scheduleRun();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    logDebug(LOG_PREFIX, 'init()', 'forceLogs?', FORCE_LOGS, 'debug?', DEBUG);

    if (!window[ERROR_HOOK_FLAG]) {
      window[ERROR_HOOK_FLAG] = true;

      window.addEventListener('error', function (evt) {
        try {
          const msg = (evt && evt.message) || '';
          const file = (evt && evt.filename) || '';
          if (file.indexOf('assets.streamshop.com.br') !== -1 || msg.indexOf('liveshop') !== -1) {
            warnDebug(
              LOG_PREFIX,
              'erro capturado do SDK:',
              msg,
              'arquivo:',
              file,
              'linha:',
              evt.lineno,
              'col:',
              evt.colno,
            );
          }
          if (msg && msg.indexOf(SDK_ERROR_MSG_FRAGMENT) !== -1) {
            window[SDK_ERROR_FLAG] = true;
          }
        } catch (e) {}
      });

      window.addEventListener('unhandledrejection', function (evt) {
        try {
          const reason = evt && evt.reason;
          warnDebug(LOG_PREFIX, 'unhandledrejection:', reason);
        } catch (e) {}
      });

      logDebug(LOG_PREFIX, 'listeners de erro do SDK ligados.');
    }

    hookSpaNavigation();
    run();
    initObserver();

    let pollCount = 0;
    const maxPolls = 120;
    const pollInterval = window.setInterval(function () {
      pollCount++;
      removeInjectionIfNotParques();
      if (!isParquesDisneyPage()) {
        return;
      }
      clearInjectDoneIfWrapperMissing();
      if (window[INJECT_DONE_KEY] || pollCount >= maxPolls) {
        window.clearInterval(pollInterval);
        if (pollCount >= maxPolls && !window[INJECT_DONE_KEY] && isParquesDisneyPage()) {
          warnDebug(
            LOG_PREFIX,
            'timeout 30s: carrossel não injetado. Cápsula Mickey?',
            !!getParquesMickeyCapsule(),
            'URL:',
            window.location.href,
          );
        }
        return;
      }
      run();
    }, 250);

    window.addEventListener('popstate', scheduleRun);
    window.addEventListener('hashchange', scheduleRun);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
