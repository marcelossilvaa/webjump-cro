(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_CountdownCheckout';
  const STYLE_ID = 'at-countdown-checkout-style';
  const COMPONENT_ID = 'at-countdown-checkout';
  const TIMER_ID = 'at-countdown-checkout-timer';
  const TIMER_COL_ID = 'at-countdown-checkout-timer-col';
  const TITLE_ID = 'at-countdown-checkout-title';
  const SUBTITLE_ID = 'at-countdown-checkout-subtitle';
  const LABEL_ID = 'at-countdown-checkout-label';
  const ANCHOR_CLASS = 'sc-d781f9ae-0';
  const SUMMARY_TOTAL_TEST_ID = 'summary-header-total';

  const ACTIVITY = EXPERIMENT_NAME;
  const CONTEXT = 'tela_pagamento';

  const COUNTDOWN_SECONDS = 10 * 60;
  const MESSAGE_TITLE = 'Aproveite antes que seja tarde!';
  const MESSAGE_SUBTITLE = 'Os preços podem mudar.';
  const MESSAGE_ENDED_TITLE = 'Aproveite antes que seja tarde.';
  const MESSAGE_ENDED_SUBTITLE = 'Os preços e a disponibilidade podem mudar.';
  const CLOCK_ICON_URL = 'https://i.imgur.com/hGLQQck.png';

  let countdownInterval = null;
  let countdownSecondsLeft = COUNTDOWN_SECONDS;
  let debounceTimer = null;
  let isProcessing = false;
  let preloadedClockIcon = null;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' +
      COMPONENT_ID +
      '{' +
      'box-sizing:border-box;' +
      'width:100%;' +
      'margin-bottom:12px;' +
      'padding:16px 12px;' +
      'background:#001A3D;' +
      'border-radius:8px;' +
      'display:flex;' +
      'align-items:center;' +
      'gap:8px;' +
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-timer-col{' +
      'flex:0 0 auto;' +
      'display:flex;' +
      'flex-direction:column;' +
      'align-items:center;' +
      'justify-content:center;' +
      'min-width:72px;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-clock-icon{' +
      'width:40px;' +
      'height:40px;' +
      'display:block;' +
      'object-fit:contain;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-time{' +
      'font-size:26px;' +
      'font-weight:700;' +
      'line-height:1.1;' +
      'color:#FFFFFF;' +
      'letter-spacing:0.02em;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-label{' +
      'margin-top:4px;' +
      'font-size:10px;' +
      'font-weight:400;' +
      'line-height:1.2;' +
      'letter-spacing:0.08em;' +
      'text-transform:uppercase;' +
      'color:rgba(255,255,255,0.72);' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-divider{' +
      'flex:0 0 1px;' +
      'align-self:stretch;' +
      'width:1px;' +
      'margin:4px 0;' +
      'background:rgba(255,255,255,0.35);' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-message{' +
      'flex:1 1 auto;' +
      'min-width:0;' +
      'display:flex;' +
      'flex-direction:column;' +
      'gap:2px;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-message-title{' +
      'font-size:14px;' +
      'font-weight:700;' +
      'line-height:1.35;' +
      'color:#FFFFFF;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-message-subtitle{' +
      'font-size:12px;' +
      'font-weight:400;' +
      'line-height:1.35;' +
      'color:#FFFFFF;' +
      '}' +
      '#' +
      COMPONENT_ID +
      '[data-at-state="ended"] .at-cc-timer-col{' +
      'min-width:42px;' +
      '}' +
      '@media (max-width:640px){' +
      '#' +
      COMPONENT_ID +
      '{' +
      'padding:14px 16px;' +
      'gap:12px;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-time{' +
      'font-size:24px;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-message-title{' +
      'font-size:13px;' +
      '}' +
      '#' +
      COMPONENT_ID +
      ' .at-cc-message-subtitle{' +
      'font-size:11px;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatTimer(seconds) {
    const total = Math.max(0, seconds);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return pad(minutes) + ':' + pad(secs);
  }

  function preloadClockIcon(callback) {
    if (preloadedClockIcon && preloadedClockIcon.complete) {
      if (typeof callback === 'function') callback();
      return;
    }

    const img = new Image();
    img.onload = function () {
      preloadedClockIcon = img;
      if (typeof callback === 'function') callback();
    };
    img.onerror = function () {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = 'https://i.imgur.com/hGLQQck.jpg';
        return;
      }
      if (img.dataset.fallback === '1') {
        img.dataset.fallback = '2';
        img.src = 'https://i.imgur.com/hGLQQck.jpeg';
        return;
      }
      if (typeof callback === 'function') callback();
    };
    img.src = CLOCK_ICON_URL;
  }

  function createClockIcon() {
    const img = document.createElement('img');
    img.className = 'at-cc-clock-icon';
    img.src =
      preloadedClockIcon && preloadedClockIcon.src ? preloadedClockIcon.src : CLOCK_ICON_URL;
    img.alt = 'Icone de relogio';
    img.onerror = function () {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = 'https://i.imgur.com/hGLQQck.jpg';
      } else if (img.dataset.fallback === '1') {
        img.dataset.fallback = '2';
        img.src = 'https://i.imgur.com/hGLQQck.jpeg';
      }
    };

    return img;
  }

  function createComponent() {
    const wrapper = document.createElement('div');
    wrapper.id = COMPONENT_ID;
    wrapper.setAttribute('data-at-experiment', EXPERIMENT_NAME);
    wrapper.setAttribute('data-at-state', 'running');

    const timerCol = document.createElement('div');
    timerCol.className = 'at-cc-timer-col';
    timerCol.id = TIMER_COL_ID;

    const timeEl = document.createElement('span');
    timeEl.className = 'at-cc-time';
    timeEl.id = TIMER_ID;
    timeEl.textContent = formatTimer(countdownSecondsLeft);

    const labelEl = document.createElement('span');
    labelEl.className = 'at-cc-label';
    labelEl.id = LABEL_ID;
    labelEl.textContent = 'Restantes';

    timerCol.appendChild(timeEl);
    timerCol.appendChild(labelEl);

    const divider = document.createElement('div');
    divider.className = 'at-cc-divider';
    divider.setAttribute('aria-hidden', 'true');

    const message = document.createElement('div');
    message.className = 'at-cc-message';

    const title = document.createElement('p');
    title.className = 'at-cc-message-title';
    title.id = TITLE_ID;
    title.textContent = MESSAGE_TITLE;

    const subtitle = document.createElement('p');
    subtitle.className = 'at-cc-message-subtitle';
    subtitle.id = SUBTITLE_ID;
    subtitle.textContent = MESSAGE_SUBTITLE;

    message.appendChild(title);
    message.appendChild(subtitle);

    wrapper.appendChild(timerCol);
    wrapper.appendChild(divider);
    wrapper.appendChild(message);

    return wrapper;
  }

  function updateTimerDisplay() {
    const timeEl = document.getElementById(TIMER_ID);
    if (!timeEl) return;
    timeEl.textContent = formatTimer(countdownSecondsLeft);
  }

  function setState(state) {
    const el = document.getElementById(COMPONENT_ID);
    if (!el) return;
    el.setAttribute('data-at-state', state);
  }

  function setMessage(title, subtitle) {
    const titleEl = document.getElementById(TITLE_ID);
    const subtitleEl = document.getElementById(SUBTITLE_ID);
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  }

  function showEndedState() {
    setState('ended');
    setMessage(MESSAGE_ENDED_TITLE, MESSAGE_ENDED_SUBTITLE);

    const timerCol = document.getElementById(TIMER_COL_ID);
    if (!timerCol) return;

    timerCol.innerHTML = '';
    timerCol.appendChild(createClockIcon());
  }

  function setLabel(text) {
    const el = document.getElementById(LABEL_ID);
    if (el) el.textContent = text;
  }

  function analyticsEvent(eventType) {
    const labelEvent = ACTIVITY + '_' + eventType;

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = CONTEXT;

      s.tl(true, 'o', 'target_activity_view');
    })();
  }

  function trackViewOnce() {
    const el = document.getElementById(COMPONENT_ID);
    if (!el) return;
    if (el.getAttribute('data-at-view-tracked') === 'true') return;

    el.setAttribute('data-at-view-tracked', 'true');
    analyticsEvent('view');
  }

  function startCountdown() {
    if (countdownInterval) return;

    updateTimerDisplay();
    setState('running');
    setLabel('Restantes');
    setMessage(MESSAGE_TITLE, MESSAGE_SUBTITLE);

    countdownInterval = setInterval(function () {
      countdownSecondsLeft -= 1;

      if (countdownSecondsLeft <= 0) {
        countdownSecondsLeft = 0;
        showEndedState();
        clearInterval(countdownInterval);
        countdownInterval = null;
        return;
      }

      updateTimerDisplay();
    }, 1000);
  }

  function isTargetPage() {
    return !!document.querySelector('[data-test-id="' + SUMMARY_TOTAL_TEST_ID + '"]');
  }

  function findAnchor() {
    const summaryTotal = document.querySelector('[data-test-id="' + SUMMARY_TOTAL_TEST_ID + '"]');
    if (summaryTotal && typeof summaryTotal.closest === 'function') {
      const anchorByTestId = summaryTotal.closest('.' + ANCHOR_CLASS);
      if (anchorByTestId) return anchorByTestId;
    }

    return document.querySelector('.' + ANCHOR_CLASS);
  }

  function insertComponent() {
    if (document.getElementById(COMPONENT_ID)) return true;

    const anchor = findAnchor();
    if (!anchor || !anchor.parentNode) return false;

    const component = createComponent();
    anchor.insertAdjacentElement('beforebegin', component);
    trackViewOnce();
    startCountdown();
    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if (!isTargetPage()) return;
      insertComponent();
    } finally {
      isProcessing = false;
    }
  }

  function debouncedRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 200);
  }

  function observeDom() {
    if (window._atCountdownCheckoutObserver) return;

    const observer = new MutationObserver(function (mutations) {
      let shouldRun = false;

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type !== 'childList') continue;

        const added = mutation.addedNodes;
        for (let j = 0; j < added.length; j++) {
          const node = added[j];
          if (node.nodeType !== 1) continue;
          if (
            node.id === COMPONENT_ID ||
            (node.querySelector && node.querySelector('#' + COMPONENT_ID))
          ) {
            continue;
          }
          shouldRun = true;
          break;
        }

        if (shouldRun) break;
      }

      if (shouldRun) debouncedRun();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window._atCountdownCheckoutObserver = observer;
  }

  function init() {
    injectStyles();
    preloadClockIcon();
    run();
    observeDom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
