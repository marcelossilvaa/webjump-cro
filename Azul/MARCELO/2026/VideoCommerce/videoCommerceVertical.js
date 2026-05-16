(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const DEBUG = false;
  const LOG_PREFIX = '[WJ-VideoCommerce-Vertical]';
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

  const STREAMSHOP_SDKS = [
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-video.min.js',
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel.min.js',
    'https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel-v2.min.js'
  ];

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
      return !!(window.customElements && window.customElements.get && window.customElements.get('liveshop-ads-carousel'));
    } catch (e) {
      return false;
    }
  }

  function loadOverlaySdkOnce() {
    const existingById = document.getElementById(OVERLAY_SDK_ID);
    const existingBySrc = document.querySelector('script[src="' + OVERLAY_SDK_SRC + '"]');

    if (existingById || existingBySrc) {
      if (DEBUG) console.log(LOG_PREFIX, 'overlay SDK já existe.');
      return Promise.resolve(true);
    }

    return new Promise(function (resolve) {
      const script = document.createElement('script');
      script.async = false;
      script.src = OVERLAY_SDK_SRC;
      script.id = OVERLAY_SDK_ID;
      script.setAttribute('overlay-position', 'right');
      script.onload = function () {
        if (DEBUG) console.log(LOG_PREFIX, 'overlay SDK carregado:', OVERLAY_SDK_SRC);
        resolve(true);
      };
      script.onerror = function () {
        if (DEBUG) console.warn(LOG_PREFIX, 'falha ao carregar overlay SDK:', OVERLAY_SDK_SRC);
        resolve(false);
      };
      if (DEBUG) console.log(LOG_PREFIX, 'injetando overlay SDK:', OVERLAY_SDK_SRC);
      document.head.appendChild(script);
    });
  }

  function isCarouselV2Defined() {
    try {
      return !!(window.customElements && window.customElements.get && window.customElements.get('liveshop-ads-carousel-v2'));
    } catch (e) {
      return false;
    }
  }

  function loadSdkScriptsOnce() {
    if (isCarouselV2Defined()) {
      if (DEBUG) console.log(LOG_PREFIX, 'custom element v2 já definido, pulando load de SDK.');
      return Promise.resolve(true);
    }

    // Overlay primeiro (dependência observada no teste local).
    let chain = loadOverlaySdkOnce();

    for (let i = 0; i < STREAMSHOP_SDKS.length; i++) {
      (function (src) {
        chain = chain.then(function () {
          if (isCarouselV2Defined()) return true;

          const already = document.querySelector('script[src="' + src + '"]');
          if (already) {
            if (DEBUG) console.log(LOG_PREFIX, 'script já existe:', src);
            return true;
          }

          return new Promise(function (resolve) {
            const script = document.createElement('script');
            script.async = false;
            script.src = src;
            script.setAttribute(SDK_SCRIPT_ATTR, COMPONENT_WRAPPER_VALUE);
            script.onload = function () {
              if (DEBUG) console.log(LOG_PREFIX, 'script carregado:', src);
              if (DEBUG) console.log(LOG_PREFIX, 'custom element após load? v2:', isCarouselV2Defined());
              resolve(true);
            };
            script.onerror = function () {
              if (DEBUG) console.warn(LOG_PREFIX, 'falha ao carregar script:', src);
              resolve(false);
            };
            if (DEBUG) console.log(LOG_PREFIX, 'injetando script:', src);
            document.head.appendChild(script);
          });
        });
      })(STREAMSHOP_SDKS[i]);
    }

    return chain.then(function () {
      if (DEBUG) console.log(LOG_PREFIX, 'aguardando custom element liveshop-ads-carousel-v2...');
      return waitForCondition(isCarouselV2Defined, 5000, 100).then(function (ok) {
        if (DEBUG) console.log(LOG_PREFIX, 'custom element v2 definido?', ok);
        return ok;
      });
    });
  }

  function buildLiveshopCarouselVerticalElement() {
    // Para vertical usamos o v2 (atributo use-active-videos-from é do v2).
    const el = document.createElement('liveshop-ads-carousel-v2');
    el.setAttribute('height', '412px');
    el.setAttribute('width', '100%');
    el.setAttribute('videos-width', '263px');
    el.setAttribute('border-radius', '25px');
    el.setAttribute('use-active-videos-from', 'azullinhasaereas');
    el.setAttribute('opacity', '1');
    return el;
  }

  function createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(COMPONENT_WRAPPER_ATTR, COMPONENT_WRAPPER_VALUE);
    return wrapper;
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
      if (DEBUG) console.log(LOG_PREFIX, 'injeção já concluída anteriormente. Ignorando.');
      return true;
    }

    const next = referenceEl.nextElementSibling;
    if (next && next.getAttribute && next.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE) {
      if (DEBUG) console.log(LOG_PREFIX, 'já existe wrapper logo após o bloco alvo. Nada a fazer.');
      window[INJECT_DONE_KEY] = true;
      return true;
    }

    const existing = document.querySelector('[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]');
    if (existing) {
      if (DEBUG) console.log(LOG_PREFIX, 'wrapper já existe em algum lugar. Nada a fazer.');
      window[INJECT_DONE_KEY] = true;
      return true;
    }

    if (window[INJECT_PROMISE_KEY]) {
      if (DEBUG) console.log(LOG_PREFIX, 'injeção já em andamento. Ignorando chamada duplicada.');
      return true;
    }

    if (DEBUG) console.log(LOG_PREFIX, 'iniciando load de SDKs...');
    window[INJECT_PROMISE_KEY] = loadSdkScriptsOnce()
      .then(function (ok) {
        if (window[INJECT_DONE_KEY]) return;

        if (!ok) {
          if (DEBUG) console.warn(LOG_PREFIX, 'SDK não ficou pronto; não inserindo.');
          return;
        }

        const anchorNow = getTargetAnchor();
        if (!anchorNow) return;
        const refNow = getInsertionReferenceContainer(anchorNow);
        if (!refNow || !refNow.parentNode) return;

        if (document.querySelector('[' + COMPONENT_WRAPPER_ATTR + '="' + COMPONENT_WRAPPER_VALUE + '"]')) {
          window[INJECT_DONE_KEY] = true;
          return;
        }

        const nextNow = refNow.nextElementSibling;
        if (nextNow && nextNow.getAttribute && nextNow.getAttribute(COMPONENT_WRAPPER_ATTR) === COMPONENT_WRAPPER_VALUE) {
          window[INJECT_DONE_KEY] = true;
          return;
        }

        const wrapper2 = createWrapper();
        const carousel = buildLiveshopCarouselVerticalElement();
        wrapper2.appendChild(carousel);
        refNow.parentNode.insertBefore(wrapper2, refNow.nextSibling);
        window[INJECT_DONE_KEY] = true;
        if (DEBUG) console.log(LOG_PREFIX, 'inserido. Wrapper:', wrapper2, 'Carousel:', carousel);

        if (DEBUG) {
          window.setTimeout(function () {
            const hasSdkError = !!window[SDK_ERROR_FLAG];
            const hasShadow = !!(carousel && carousel.shadowRoot);
            if (!hasSdkError && hasShadow) {
              console.log(LOG_PREFIX, 'carousel v2 com shadowRoot detectado.');
              return;
            }
            console.warn(LOG_PREFIX, 'carousel v2 pode não ter renderizado (erro SDK?', hasSdkError, 'shadowRoot?', hasShadow, ').');
          }, 1200);
        }
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
      if (DEBUG) console.log(LOG_PREFIX, 'run() acionado. URL:', window.location && window.location.href);
      const anchor = getTargetAnchor();
      if (!anchor) {
        if (DEBUG) console.warn(LOG_PREFIX, 'âncora do PDF não encontrada ainda.');
        return;
      }
      if (DEBUG) console.log(LOG_PREFIX, 'âncora encontrada:', anchor);

      const reference = getInsertionReferenceContainer(anchor);
      if (!reference) {
        if (DEBUG) console.warn(LOG_PREFIX, 'container de referência não encontrado a partir da âncora.');
        return;
      }
      if (DEBUG) console.log(LOG_PREFIX, 'container de referência encontrado:', reference);

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
  }

  function init() {
    if (DEBUG) console.log(LOG_PREFIX, 'init()');

    if (!window[ERROR_HOOK_FLAG]) {
      window[ERROR_HOOK_FLAG] = true;

      window.addEventListener('error', function (evt) {
        try {
          const msg = (evt && evt.message) || '';
          const file = (evt && evt.filename) || '';
          if (file.indexOf('assets.streamshop.com.br') !== -1 || msg.indexOf('liveshop') !== -1) {
            console.warn(LOG_PREFIX, 'erro capturado do SDK:', msg, 'arquivo:', file, 'linha:', evt.lineno, 'col:', evt.colno);
          }
          if (msg && msg.indexOf(SDK_ERROR_MSG_FRAGMENT) !== -1) {
            window[SDK_ERROR_FLAG] = true;
          }
        } catch (e) {
          // noop
        }
      });

      window.addEventListener('unhandledrejection', function (evt) {
        try {
          const reason = evt && evt.reason;
          console.warn(LOG_PREFIX, 'unhandledrejection:', reason);
        } catch (e) {
          // noop
        }
      });

      if (DEBUG) console.log(LOG_PREFIX, 'listeners de erro do SDK ligados.');
    }

    run();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
