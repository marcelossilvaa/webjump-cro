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

  const STREAMSHOP_SDKS = [
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-video.min.js',
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel.min.js',
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel-v2.min.js',
  ];

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
      return isCarouselDefined() && isCarouselV2Defined();
    }
    return USE_CAROUSEL_V2 ? isCarouselV2Defined() : isCarouselDefined();
  }

  function loadSdkScriptsOnce() {
    if (isAllNeededCarouselsDefined()) {
      logDebug(LOG_PREFIX, 'custom element(s) necessário(s) já definido(s), pulando load de SDK.');
      return Promise.resolve(true);
    }

    let chain = loadOverlaySdkOnce();

    for (let i = 0; i < STREAMSHOP_SDKS.length; i++) {
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
      })(STREAMSHOP_SDKS[i]);
    }

    return chain.then(function () {
      logDebug(
        LOG_PREFIX,
        'aguardando custom element(s)...',
        DUAL_LAYOUT_DEMO ? 'v1+v2 (demo)' : USE_CAROUSEL_V2 ? 'v2' : 'v1',
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

  function buildCarouselHorizontalV1() {
    const el = document.createElement('liveshop-ads-carousel');
    el.setAttribute('height', '275px');
    el.setAttribute('width', '100%');
    el.setAttribute('videos-width', '400px');
    el.setAttribute('border-radius', '25px');
    el.setAttribute('use-active-videos-from', 'azullinhasaereas');
    el.setAttribute('data-wj-videocommerce-variant', 'horizontal');
    return el;
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

  function buildCarouselVerticalV2() {
    const el = document.createElement('liveshop-ads-carousel-v2');
    el.setAttribute('height', '412px');
    el.setAttribute('width', '100%');
    el.setAttribute('videos-width', '263px');
    el.setAttribute('border-radius', '25px');
    el.setAttribute('use-active-videos-from', 'azullinhasaereas');
    el.setAttribute('opacity', '1');
    el.setAttribute('data-wj-videocommerce-variant', 'vertical');
    return el;
  }

  function buildCarouselV2Demo326() {
    const el = document.createElement('liveshop-ads-carousel-v2');
    el.setAttribute('height', '326px');
    el.setAttribute('use-active-videos-from', 'azullinhasaereas');
    el.setAttribute('data-wj-videocommerce-variant', 'v2-326');
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

  function createOuterWrapper() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(COMPONENT_WRAPPER_ATTR, COMPONENT_WRAPPER_VALUE);
    if (DUAL_LAYOUT_DEMO) {
      wrapper.setAttribute('data-wj-videocommerce-wrap', '1');
    }
    return wrapper;
  }

  function mountCarouselsIntoWrapper(outer) {
    if (DUAL_LAYOUT_DEMO) {
      injectDemoStylesOnce();

      const slotV = document.createElement('div');
      slotV.setAttribute('data-wj-videocommerce-slot', 'vertical');
      slotV.appendChild(buildCarouselVerticalV1());

      const slotH = document.createElement('div');
      slotH.setAttribute('data-wj-videocommerce-slot', 'horizontal');
      slotH.appendChild(buildCarouselHorizontalV1());

      const slotV2 = document.createElement('div');
      slotV2.setAttribute('data-wj-videocommerce-slot', 'carousel-v2');
      slotV2.appendChild(buildCarouselV2Demo326());

      outer.appendChild(slotV);
      outer.appendChild(slotH);
      outer.appendChild(slotV2);
    } else {
      outer.appendChild(buildCarouselHorizontalV2());
    }
  }

  function getTargetAnchor() {
    return document.querySelector('a[href*="Guia-de-Experiencias-WaltDisneyWorld.pdf"]');
  }

  function getInsertionReferenceContainer(anchorEl) {
    if (!anchorEl) return null;

    const hideOnMobile = anchorEl.closest('.container-capsule.containerDefault.hide-on-mobile');
    if (hideOnMobile) return hideOnMobile;

    return anchorEl.closest('.container-capsule.containerDefault');
  }

  function injectAfter(referenceEl) {
    if (!referenceEl || !referenceEl.parentNode) return false;

    if (window[INJECT_DONE_KEY]) {
      logDebug(LOG_PREFIX, 'injeção já concluída anteriormente. Ignorando.');
      return true;
    }

    const next = referenceEl.nextElementSibling;
    if (
      next &&
      next.getAttribute &&
      next.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
    ) {
      logDebug(LOG_PREFIX, 'já existe wrapper logo após o bloco alvo. Nada a fazer.');
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

        const anchorNow = getTargetAnchor();
        if (!anchorNow) {
          warnDebug(LOG_PREFIX, 'âncora não encontrada após SDK ok; abortando inserção.');
          return;
        }
        const refNow = getInsertionReferenceContainer(anchorNow);
        if (!refNow || !refNow.parentNode) {
          warnDebug(
            LOG_PREFIX,
            'container de referência não encontrado após SDK ok; abortando inserção.',
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

        const nextNow = refNow.nextElementSibling;
        if (
          nextNow &&
          nextNow.getAttribute &&
          nextNow.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE
        ) {
          window[INJECT_DONE_KEY] = true;
          return;
        }

        const outer = createOuterWrapper();
        mountCarouselsIntoWrapper(outer);
        refNow.parentNode.insertBefore(outer, refNow.nextSibling);
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

  function run() {
    if (window[INJECT_DONE_KEY]) return;
    if (isProcessing) return;
    isProcessing = true;

    try {
      logDebug(LOG_PREFIX, 'run() acionado. URL:', window.location && window.location.href);
      const anchor = getTargetAnchor();
      if (!anchor) {
        warnDebug(LOG_PREFIX, 'âncora do PDF não encontrada ainda.');
        return;
      }
      logDebug(LOG_PREFIX, 'âncora encontrada:', anchor);

      const reference = getInsertionReferenceContainer(anchor);
      if (!reference) {
        warnDebug(LOG_PREFIX, 'container de referência não encontrado a partir da âncora.');
        return;
      }
      logDebug(LOG_PREFIX, 'container de referência encontrado:', reference);

      injectAfter(reference);
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (window[INJECT_DONE_KEY]) return;
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      run();
    }, 150);
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

    run();
    initObserver();

    let pollCount = 0;
    const maxPolls = 40;
    const pollInterval = window.setInterval(function () {
      pollCount++;
      if (window[INJECT_DONE_KEY] || pollCount >= maxPolls) {
        window.clearInterval(pollInterval);
        return;
      }
      run();
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
