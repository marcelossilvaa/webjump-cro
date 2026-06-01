(function () {
  'use strict';

  const LOG_PREFIX = '[WJ-VideoCommerce-Widget]';
  const SDK_SCRIPT_ATTR = 'data-wj-streamshop-widget-sdk';
  const SDK_SRC = 'https://assets.streamshop.com.br/sdk/liveshop-sdk-widget-btn.min.js';
  const TRACKING_ATTR = 'data-wj-widget-tracking';
  const STYLE_ID = 'wj-videocommerce-widget-style';
  const STORE_SLUG = 'azullinhasaereas';
  const UTM_SESSION_KEY = 'wj_azv_videocommerce_widget_session';
  const UTM_STORAGE_KEY = 'wj_azv_videocommerce_widget_storage';
  const UTM_COOKIE_NAME = 'wj_azv_videocommerce_widget';
  const UTM_COOKIE_MAX_AGE_SEC = 86400;
  const UTM_COOKIE_DOMAIN = '.voeazul.com.br';
  const MOUNTED_KEY = '__wjVideoCommerceWidgetMounted';
  const MOUNTING_KEY = '__wjVideoCommerceWidgetMounting';
  const UTM_SOURCE_FULL =
    'pmweb_azv_e-mail_banner_lf_azv_202603-azv-b2c-emm-168h-viagem-hospedagemdisney-d20_hotel';
  const UTM_SOURCE_PARTIAL = 'hospedagemdisney-d20_hotel';

  let debounceTimer = null;
  let waitIntervalId = null;

  const VERIFY_LOGS = (function () {
    try {
      return (
        (window.location &&
          window.location.search &&
          (window.location.search.indexOf('wjvcdebug=1') !== -1 ||
            window.location.search.indexOf('wjwidgetdebug=1') !== -1)) ||
        window.__WJ_VC_DEBUG === true ||
        window.__WJ_VC_WIDGET_DEBUG === true
      );
    } catch (e) {
      return false;
    }
  })();

  const WIDGET_OPTIONS = {
    height: 200,
    width: 110,
    positionX: 'right',
    spacingPositionX: 30,
    positionY: 'bottom',
    spacingPositionY: 30,
    borderRadius: 16,
    animation: true,
    hml: false,
    type: 3,
    useActiveVideosFrom: STORE_SLUG,
  };

  function logVerify() {
    if (!VERIFY_LOGS) return;
    try {
      console.info.apply(console, arguments);
    } catch (e) {}
  }

  function warnVerify() {
    if (!VERIFY_LOGS) return;
    try {
      console.warn.apply(console, arguments);
    } catch (e) {}
  }

  function setWidgetSessionActive() {
    try {
      sessionStorage.setItem(UTM_SESSION_KEY, '1');
    } catch (e) {}
    try {
      localStorage.setItem(UTM_STORAGE_KEY, '1');
    } catch (e) {}
    try {
      document.cookie =
        UTM_COOKIE_NAME +
        '=1; path=/; domain=' +
        UTM_COOKIE_DOMAIN +
        '; max-age=' +
        String(UTM_COOKIE_MAX_AGE_SEC) +
        '; SameSite=Lax';
    } catch (e) {
      try {
        document.cookie =
          UTM_COOKIE_NAME +
          '=1; path=/; max-age=' +
          String(UTM_COOKIE_MAX_AGE_SEC) +
          '; SameSite=Lax';
      } catch (e2) {}
    }
    logVerify(LOG_PREFIX, 'sessão UTM gravada (session, localStorage, cookie).');
  }

  function isWidgetSessionActive() {
    try {
      if (window.location && window.location.search.indexOf('wjwidgetforce=1') !== -1) {
        return true;
      }
      if (sessionStorage.getItem(UTM_SESSION_KEY) === '1') {
        return true;
      }
      if (localStorage.getItem(UTM_STORAGE_KEY) === '1') {
        return true;
      }
      return document.cookie.indexOf(UTM_COOKIE_NAME + '=1') !== -1;
    } catch (e) {
      return false;
    }
  }

  function utmSourceMatches(source) {
    if (!source) return false;
    if (source === UTM_SOURCE_FULL) return true;
    if (source.indexOf(UTM_SOURCE_PARTIAL) !== -1) return true;
    if (source.indexOf(UTM_SOURCE_FULL) !== -1) return true;
    return false;
  }

  function captureUtmFromCurrentUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('utm_source') || '';
      if (utmSourceMatches(source)) {
        setWidgetSessionActive();
        return true;
      }
    } catch (e) {}
    return false;
  }

  function shouldRunWidget() {
    if (captureUtmFromCurrentUrl()) {
      return true;
    }
    return isWidgetSessionActive();
  }

  function injectWidgetLayoutStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#streamshop-widget {' +
      'z-index: 2147483000 !important;' +
      'bottom: 75px !important;' +
      '}';
    document.head.appendChild(style);
  }

  function publishWidgetOptions() {
    window.liveshopSdkWidgetButtonOptions = WIDGET_OPTIONS;
  }

  function getStreamshopWidgets() {
    return document.querySelectorAll('#streamshop-widget, button.ss-button-widget');
  }

  function removeAllStreamshopWidgets() {
    const nodes = getStreamshopWidgets();
    let i;
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode) {
        nodes[i].parentNode.removeChild(nodes[i]);
      }
    }
    window[MOUNTED_KEY] = false;
  }

  function isWidgetHealthy() {
    const widgets = getStreamshopWidgets();
    if (!widgets.length) return false;
    if (widgets.length > 1) return false;

    const el = widgets[0];
    if (!document.body.contains(el)) return false;

    const videos = el.querySelectorAll('video');
    const closes = el.querySelectorAll('.close-button');
    if (videos.length !== 1 || closes.length !== 1) {
      return false;
    }
    return true;
  }

  function clearWaitInterval() {
    if (waitIntervalId) {
      window.clearInterval(waitIntervalId);
      waitIntervalId = null;
    }
  }

  function waitForWidgetButton(onFound) {
    clearWaitInterval();
    let tentativas = 0;
    const maxTentativas = 50;

    waitIntervalId = window.setInterval(function () {
      if (isWidgetHealthy()) {
        clearWaitInterval();
        injectWidgetLayoutStyles();
        const widgetBtn = document.getElementById('streamshop-widget');
        window[MOUNTED_KEY] = true;
        window[MOUNTING_KEY] = false;
        if (typeof onFound === 'function' && widgetBtn) {
          onFound(widgetBtn);
        }
        logVerify(LOG_PREFIX, 'botão montado (único).');
        return;
      }

      tentativas += 1;
      if (tentativas >= maxTentativas) {
        clearWaitInterval();
        window[MOUNTING_KEY] = false;
        warnVerify(LOG_PREFIX, 'timeout aguardando #streamshop-widget saudável.');
      }
    }, 100);
  }

  function mountWidgetButton() {
    if (!shouldRunWidget()) return;

    if (window[MOUNTING_KEY]) {
      logVerify(LOG_PREFIX, 'montagem já em andamento; ignorando.');
      return;
    }

    if (isWidgetHealthy()) {
      attachWidgetTracking(document.getElementById('streamshop-widget'));
      window[MOUNTED_KEY] = true;
      return;
    }

    if (getStreamshopWidgets().length > 0) {
      logVerify(LOG_PREFIX, 'widget duplicado ou corrompido; removendo antes de remontar.');
      removeAllStreamshopWidgets();
    }

    if (typeof window.ss_widget_btn !== 'function') {
      return;
    }

    window[MOUNTING_KEY] = true;
    publishWidgetOptions();

    try {
      window.ss_widget_btn(window.liveshopSdkWidgetButtonOptions);
      logVerify(LOG_PREFIX, 'ss_widget_btn chamado (uma vez).');
    } catch (err) {
      window[MOUNTING_KEY] = false;
      warnVerify(LOG_PREFIX, 'erro em ss_widget_btn:', err);
      return;
    }

    waitForWidgetButton(attachWidgetTracking);
  }

  function loadWidgetSdk() {
    if (document.querySelector('script[' + SDK_SCRIPT_ATTR + ']')) {
      mountWidgetButton();
      return;
    }

    publishWidgetOptions();
    logVerify(LOG_PREFIX, 'carregando SDK:', SDK_SRC);

    const script = document.createElement('script');
    script.setAttribute(SDK_SCRIPT_ATTR, '1');
    script.async = true;
    script.src = SDK_SRC;
    script.onload = function () {
      mountWidgetButton();
    };
    script.onerror = function () {
      warnVerify(LOG_PREFIX, 'falha ao carregar SDK:', SDK_SRC);
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  function pushWidgetEvent(btn) {
    window.gtmDataObject = window.gtmDataObject || [];

    const videoElement = btn.querySelector('video');
    const fullVideoPath = videoElement
      ? videoElement.currentSrc || videoElement.src
      : 'url-nao-encontrada';

    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'streamshop-widget-disney',
      local_event_action: 'click:floating-widget',
      local_event_label: fullVideoPath,
    });

    logVerify(LOG_PREFIX, 'tracking:', fullVideoPath);
  }

  function attachWidgetTracking(widgetBtn) {
    if (!widgetBtn || widgetBtn.getAttribute(TRACKING_ATTR) === '1') {
      return false;
    }

    widgetBtn.setAttribute(TRACKING_ATTR, '1');
    widgetBtn.addEventListener('click', function (e) {
      if (e.target.closest('.close-button')) {
        return;
      }
      pushWidgetEvent(this);
    });

    logVerify(LOG_PREFIX, 'tracking anexado.');
    return true;
  }

  function ensureWidget() {
    if (!shouldRunWidget()) {
      return;
    }

    injectWidgetLayoutStyles();

    if (isWidgetHealthy()) {
      attachWidgetTracking(document.getElementById('streamshop-widget'));
      return;
    }

    if (window[MOUNTED_KEY] && !isWidgetHealthy()) {
      removeAllStreamshopWidgets();
    }

    loadWidgetSdk();
  }

  function scheduleEnsureWidget() {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(ensureWidget, 200);
  }

  function hookSpaNavigation() {
    if (window.__wjVideoCommerceWidgetSpaHooked) return;
    window.__wjVideoCommerceWidgetSpaHooked = true;

    const fire = function () {
      captureUtmFromCurrentUrl();
      if (!shouldRunWidget()) return;
      window.setTimeout(function () {
        if (!shouldRunWidget()) return;
        if (isWidgetHealthy()) {
          attachWidgetTracking(document.getElementById('streamshop-widget'));
          return;
        }
        window[MOUNTED_KEY] = false;
        scheduleEnsureWidget();
      }, 500);
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
  }

  function initObserver() {
    if (window.__wjVideoCommerceWidgetObserverInitialized) return;
    if (!shouldRunWidget()) return;
    window.__wjVideoCommerceWidgetObserverInitialized = true;

    const observer = new MutationObserver(function () {
      if (!shouldRunWidget()) return;
      if (window[MOUNTING_KEY] || isWidgetHealthy()) return;
      const widgets = getStreamshopWidgets();
      if (widgets.length > 1) {
        removeAllStreamshopWidgets();
        scheduleEnsureWidget();
      }
    });

    observer.observe(document.body, { childList: true, subtree: false });
  }

  function init() {
    captureUtmFromCurrentUrl();
    if (!shouldRunWidget()) {
      logVerify(LOG_PREFIX, 'sessão UTM inativa nesta página.');
      return;
    }
    hookSpaNavigation();
    ensureWidget();
    initObserver();
  }

  window.__wjVideoCommerceWidgetRefresh = function () {
    window[MOUNTED_KEY] = false;
    window[MOUNTING_KEY] = false;
    init();
  };

  if (window.__wjVideoCommerceWidgetBootstrapped) {
    init();
  } else {
    window.__wjVideoCommerceWidgetBootstrapped = true;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
