(function () {
  'use strict';

  const LOG_PREFIX = '[WJ-VideoCommerce-Widget]';
  const SDK_SCRIPT_ATTR = 'data-wj-streamshop-widget-sdk';
  const SDK_SRC = 'https://assets.streamshop.com.br/sdk/liveshop-sdk-widget-btn.min.js';
  const TRACKING_ATTR = 'data-wj-widget-tracking';
  const ANALYTICS_VIEW_ATTR = 'data-wj-widget-analytics-view';
  const STYLE_ID = 'wj-videocommerce-widget-style';
  const EXPERIMENT_NAME = 'AT_VideoCommerce_Widget';
  const EVAR84 = 'AT_VideoCommerce_Disney';
  const STORE_SLUG = 'azullinhasaereas';
  const MOUNTED_KEY = '__wjVideoCommerceWidgetMounted';
  const MOUNTING_KEY = '__wjVideoCommerceWidgetMounting';
  const WIDGET_BTN_INVOKED_KEY = '__wjVideoCommerceWidgetBtnInvoked';

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
    if (VERIFY_LOGS) return true;
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
    if (VERIFY_LOGS) {
      console.info('[Tracking VideoCommerce Widget]', labelEvent);
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

  function getWidgetVideoLabel(btn) {
    if (!btn) return 'video-nao-encontrado';
    const videoElement = btn.querySelector('video');
    if (!videoElement) return 'video-nao-encontrado';
    return videoElement.currentSrc || videoElement.src || 'video-sem-url';
  }

  function trackWidgetView(widgetBtn) {
    if (!widgetBtn || widgetBtn.getAttribute(ANALYTICS_VIEW_ATTR) === '1') return;
    widgetBtn.setAttribute(ANALYTICS_VIEW_ATTR, '1');
    analyticsEvent('floating-widget', 'visualizacao');
  }

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

  function dedupeStreamshopWidgets() {
    const nodes = getStreamshopWidgets();
    if (nodes.length <= 1) return;
    let i;
    for (i = 1; i < nodes.length; i++) {
      if (nodes[i].parentNode) {
        nodes[i].parentNode.removeChild(nodes[i]);
      }
    }
    logVerify(LOG_PREFIX, 'widgets duplicados removidos; mantido o primeiro.');
  }

  function isWidgetPresent() {
    const widgets = getStreamshopWidgets();
    if (!widgets.length) return false;
    return document.body.contains(widgets[0]);
  }

  function isWidgetHealthy() {
    const widgets = getStreamshopWidgets();
    if (!widgets.length) return false;
    if (widgets.length > 1) return false;

    const el = widgets[0];
    if (!document.body.contains(el)) return false;

    const videos = el.querySelectorAll('video');
    const closes = el.querySelectorAll('.close-button');
    return videos.length === 1 && closes.length === 1;
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
    const maxTentativas = 80;

    waitIntervalId = window.setInterval(function () {
      dedupeStreamshopWidgets();

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

      if (isWidgetPresent()) {
        injectWidgetLayoutStyles();
        const widgetBtn = document.getElementById('streamshop-widget');
        if (widgetBtn) {
          attachWidgetTracking(widgetBtn);
        }
      }

      tentativas += 1;
      if (tentativas >= maxTentativas) {
        clearWaitInterval();
        window[MOUNTING_KEY] = false;
        if (isWidgetPresent()) {
          window[MOUNTED_KEY] = true;
          const widgetBtn = document.getElementById('streamshop-widget');
          if (widgetBtn) {
            attachWidgetTracking(widgetBtn);
          }
          logVerify(LOG_PREFIX, 'widget presente; tracking anexado após timeout de vídeo.');
          return;
        }
        warnVerify(LOG_PREFIX, 'timeout aguardando #streamshop-widget.');
      }
    }, 100);
  }

  function invokeWidgetButtonOnce() {
    if (window[WIDGET_BTN_INVOKED_KEY]) {
      logVerify(LOG_PREFIX, 'ss_widget_btn já invocado nesta sessão; ignorando nova chamada.');
      return false;
    }
    if (typeof window.ss_widget_btn !== 'function') {
      return false;
    }

    window[WIDGET_BTN_INVOKED_KEY] = true;
    publishWidgetOptions();

    try {
      window.ss_widget_btn(window.liveshopSdkWidgetButtonOptions);
      logVerify(LOG_PREFIX, 'ss_widget_btn chamado (uma vez).');
      return true;
    } catch (err) {
      window[WIDGET_BTN_INVOKED_KEY] = false;
      window[MOUNTING_KEY] = false;
      warnVerify(LOG_PREFIX, 'erro em ss_widget_btn:', err);
      return false;
    }
  }

  function mountWidgetButton() {
    if (window[MOUNTING_KEY]) {
      logVerify(LOG_PREFIX, 'montagem já em andamento; ignorando.');
      return;
    }

    dedupeStreamshopWidgets();

    if (isWidgetHealthy()) {
      attachWidgetTracking(document.getElementById('streamshop-widget'));
      window[MOUNTED_KEY] = true;
      return;
    }

    if (isWidgetPresent()) {
      window[MOUNTING_KEY] = true;
      waitForWidgetButton(attachWidgetTracking);
      return;
    }

    if (window[WIDGET_BTN_INVOKED_KEY]) {
      warnVerify(
        LOG_PREFIX,
        'ss_widget_btn já foi chamado e o widget sumiu do DOM; recarregue a página para remontar.',
      );
      return;
    }

    if (typeof window.ss_widget_btn !== 'function') {
      return;
    }

    window[MOUNTING_KEY] = true;
    if (!invokeWidgetButtonOnce()) {
      return;
    }

    waitForWidgetButton(attachWidgetTracking);
  }

  function loadWidgetSdk() {
    publishWidgetOptions();

    if (document.querySelector('script[' + SDK_SCRIPT_ATTR + ']')) {
      mountWidgetButton();
      return;
    }

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

  function attachWidgetTracking(widgetBtn) {
    if (!widgetBtn || widgetBtn.getAttribute(TRACKING_ATTR) === '1') {
      return false;
    }

    widgetBtn.setAttribute(TRACKING_ATTR, '1');
    widgetBtn.addEventListener('click', function (e) {
      if (e.target.closest('.close-button')) {
        analyticsEvent('floating-widget', 'clique-fechar');
        return;
      }
      analyticsEvent(getWidgetVideoLabel(this), 'clique-widget');
    });

    trackWidgetView(widgetBtn);
    logVerify(LOG_PREFIX, 'tracking anexado.');
    return true;
  }

  function ensureWidget() {
    if (!hasRequiredUtm()) {
      logVerify(LOG_PREFIX, 'UTM invalida ou ausente. Widget nao sera exibido.');
      return;
    }

    injectWidgetLayoutStyles();
    dedupeStreamshopWidgets();

    if (isWidgetHealthy()) {
      attachWidgetTracking(document.getElementById('streamshop-widget'));
      window[MOUNTED_KEY] = true;
      return;
    }

    if (isWidgetPresent()) {
      if (!window[MOUNTING_KEY]) {
        waitForWidgetButton(attachWidgetTracking);
      }
      return;
    }

    if (window[MOUNTED_KEY] && !isWidgetPresent()) {
      window[MOUNTED_KEY] = false;
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
      window.setTimeout(function () {
        dedupeStreamshopWidgets();
        if (isWidgetHealthy()) {
          attachWidgetTracking(document.getElementById('streamshop-widget'));
          window[MOUNTED_KEY] = true;
          return;
        }
        if (isWidgetPresent()) {
          window[MOUNTED_KEY] = true;
          if (!window[MOUNTING_KEY]) {
            waitForWidgetButton(attachWidgetTracking);
          }
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
    window.__wjVideoCommerceWidgetObserverInitialized = true;

    const observer = new MutationObserver(function () {
      if (window[MOUNTING_KEY] || isWidgetHealthy()) return;
      if (getStreamshopWidgets().length > 1) {
        dedupeStreamshopWidgets();
      }
      if (!isWidgetPresent() && !window[WIDGET_BTN_INVOKED_KEY]) {
        scheduleEnsureWidget();
      }
    });

    observer.observe(document.body, { childList: true, subtree: false });
  }

  function init() {
    if (!hasRequiredUtm()) {
      logVerify(LOG_PREFIX, 'UTM invalida ou ausente. Script nao iniciado.');
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
