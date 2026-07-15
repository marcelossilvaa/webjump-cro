(function () {
  'use strict';

  if (window.wjPaymentIssuePopover && window.wjPaymentIssuePopover.booted) {
    return;
  }
  window.wjPaymentIssuePopover = { booted: true };

  const STYLE_ID = 'wj-payment-issue-popover-style';
  const POPOVER_ID = 'wj-payment-issue-popover';
  const LISTENER_ATTR = 'data-wj-payment-issue-listener';
  const ANCHOR_LISTENER_ATTR = 'data-wj-payment-issue-anchor-listener';
  const TRACKING_CATEGORY = 'erro_pagamento_assinatura';
  const DISMISS_STORAGE_KEY = 'wj-payment-issue-popover-dismissed-at';
  const SESSION_SHOWN_KEY = 'wj-payment-issue-popover-shown';
  const DISMISS_DAYS = 7;
  const VIEWPORT_MARGIN_LEFT = 16;
  const VIEWPORT_MARGIN_RIGHT = 24;

  const STANDING_ORDERS_URL =
    'https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list';

  const SELECTORS = {
    header: '.cb-header-navigation',
    anchor:
      'button.cb-header-navigation__action-btn[data-ref="accountBtn"], button.cb-header-navigation__action-btn[data-action="account"]',
  };

  let isProcessing = false;
  let debounceTimer = null;
  let popoverVisible = false;
  let paymentIssueCache = null;
  let paymentIssuePromise = null;
  let cachedFirstName = '';
  let viewTrackingSent = false;
  let autoShowDone = false;

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action,
      local_event_label: label,
    });
  }

  function getSessionStorageItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  function wasShownThisSession() {
    try {
      return sessionStorage.getItem(SESSION_SHOWN_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function markShownThisSession() {
    try {
      sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
    } catch (error) {}
  }

  function wasDismissedRecently() {
    try {
      const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (!dismissedAt) {
        return false;
      }

      const dismissedDate = new Date(dismissedAt);
      const diffDays =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays < DISMISS_DAYS;
    } catch (error) {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, new Date().toISOString());
    } catch (error) {}
  }

  function canAutoShow() {
    return !wasDismissedRecently() && !wasShownThisSession();
  }

  async function waitForStandingOrdersAPI(maxAttempts, delay) {
    const attempts = maxAttempts || 12;
    const waitMs = delay || 400;

    for (let i = 0; i < attempts; i++) {
      if (
        window.napi &&
        window.napi.standingOrders &&
        typeof window.napi.standingOrders().getOrders === 'function'
      ) {
        return true;
      }
      await new Promise(function (resolve) {
        setTimeout(resolve, waitMs);
      });
    }
    return false;
  }

  async function waitForCustomerAPI(maxAttempts, delay) {
    const attempts = maxAttempts || 12;
    const waitMs = delay || 400;

    for (let i = 0; i < attempts; i++) {
      if (
        window.napi &&
        window.napi.customer &&
        typeof window.napi.customer().read === 'function'
      ) {
        return true;
      }
      await new Promise(function (resolve) {
        setTimeout(resolve, waitMs);
      });
    }
    return false;
  }

  function isUserLoggedIn() {
    const cached = getSessionStorageItem('customerInfo-br');
    if (cached && (cached.firstName || cached.memberNumber)) {
      return true;
    }

    return !!document.getElementById('ta-login-dropdown--logged');
  }

  async function isUserLoggedInAsync() {
    if (isUserLoggedIn()) {
      return true;
    }

    try {
      const apiReady = await waitForCustomerAPI();
      if (apiReady) {
        const customerInfo = await window.napi.customer().read();
        return !!(
          customerInfo &&
          (customerInfo.firstName || customerInfo.memberNumber)
        );
      }
    } catch (error) {}

    return false;
  }

  async function getUserFirstName() {
    const cached = getSessionStorageItem('customerInfo-br');
    if (cached && cached.firstName) {
      return cached.firstName;
    }

    try {
      const apiReady = await waitForCustomerAPI();
      if (apiReady) {
        const customerInfo = await window.napi.customer().read();
        if (customerInfo && customerInfo.firstName) {
          return customerInfo.firstName;
        }
      }
    } catch (error) {}

    return '';
  }

  function hasPaymentIssue(order) {
    const status = order && order.recurringOrderStatus;
    if (!status) {
      return false;
    }

    return (
      status.reason === 'PAYMENT_ISSUE' ||
      (status.type === 'ON_HOLD' && status.reason === 'PAYMENT_ISSUE')
    );
  }

  async function userHasPaymentIssue() {
    if (paymentIssueCache !== null) {
      return paymentIssueCache;
    }

    if (!paymentIssuePromise) {
      paymentIssuePromise = (async function () {
        const loggedIn = await isUserLoggedInAsync();
        if (!loggedIn) {
          paymentIssueCache = false;
          return false;
        }

        const apiReady = await waitForStandingOrdersAPI();
        if (!apiReady) {
          paymentIssueCache = false;
          return false;
        }

        try {
          const orders = await window.napi.standingOrders().getOrders(
            'Responsive'
          );
          if (!orders || !orders.length) {
            paymentIssueCache = false;
            return false;
          }

          let i = 0;
          while (i < orders.length) {
            if (hasPaymentIssue(orders[i])) {
              paymentIssueCache = true;
              return true;
            }
            i++;
          }

          paymentIssueCache = false;
          return false;
        } catch (error) {
          paymentIssueCache = false;
          return false;
        }
      })();
    }

    return paymentIssuePromise;
  }

  function getAnchor() {
    return document.querySelector(SELECTORS.anchor);
  }

  function getGreetingHtml() {
    if (cachedFirstName) {
      return 'Atenção, ' + cachedFirstName + '!';
    }
    return 'Atenção!';
  }

  function buildPopoverHtml() {
    return (
      '<div class="wj-payment-issue-popover__inner" role="dialog" aria-modal="false" aria-labelledby="wj-payment-issue-title">' +
      '<button type="button" class="wj-payment-issue-popover__close" aria-label="Fechar" data-action="close">' +
      '<span aria-hidden="true">&times;</span>' +
      '</button>' +
      '<div class="wj-payment-issue-popover__arrow" aria-hidden="true"></div>' +
      '<div class="wj-payment-issue-popover__icon" aria-hidden="true">!</div>' +
      '<h2 class="wj-payment-issue-popover__title" id="wj-payment-issue-title">' +
      getGreetingHtml() +
      '</h2>' +
      '<p class="wj-payment-issue-popover__text">Identificamos um problema no pagamento da sua assinatura de cafés.</p>' +
      '<p class="wj-payment-issue-popover__text">Para evitar a suspensão do seu plano e garantir o envio das próximas entregas, atualize seu método de pagamento.</p>' +
      '<a href="' +
      STANDING_ORDERS_URL +
      '" class="wj-payment-issue-popover__cta" data-action="cta">Atualizar pagamento</a>' +
      '</div>'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' +
      POPOVER_ID +
      ' {' +
      'position: fixed;' +
      'z-index: 10050;' +
      'display: none;' +
      'width: 320px;' +
      'max-width: calc(100vw - 24px);' +
      'pointer-events: auto;' +
      '}' +
      '#' +
      POPOVER_ID +
      '.is-visible {' +
      'display: block;' +
      '}' +
      '.wj-payment-issue-popover__inner {' +
      'position: relative;' +
      'background: #fff;' +
      'border-radius: 8px;' +
      'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);' +
      'padding: 28px 20px 20px;' +
      'text-align: center;' +
      'font-family: NespressoLucas, Trebuchet MS, sans-serif;' +
      '}' +
      '.wj-payment-issue-popover__arrow {' +
      'position: absolute;' +
      'top: -8px;' +
      'width: 16px;' +
      'height: 16px;' +
      'background: #fff;' +
      'transform: translateX(-50%) rotate(45deg);' +
      'box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.06);' +
      '}' +
      '.wj-payment-issue-popover__close {' +
      'position: absolute;' +
      'top: 10px;' +
      'right: 10px;' +
      'width: 28px;' +
      'height: 28px;' +
      'border: 0;' +
      'background: transparent;' +
      'color: #17171A;' +
      'font-size: 22px;' +
      'line-height: 1;' +
      'cursor: pointer;' +
      'padding: 0;' +
      '}' +
      '.wj-payment-issue-popover__icon {' +
      'width: 48px;' +
      'height: 48px;' +
      'margin: 0 auto 14px;' +
      'border-radius: 50%;' +
      'background: #C0392B;' +
      'color: #fff;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'font-size: 24px;' +
      'font-weight: 700;' +
      '}' +
      '.wj-payment-issue-popover__title {' +
      'margin: 0 0 12px;' +
      'font-size: 20px;' +
      'font-weight: 700;' +
      'color: #17171A;' +
      'line-height: 1.3;' +
      '}' +
      '.wj-payment-issue-popover__text {' +
      'margin: 0 0 10px;' +
      'font-size: 14px;' +
      'line-height: 1.5;' +
      'color: #3D3D41;' +
      '}' +
      '.wj-payment-issue-popover__cta {' +
      'display: inline-block;' +
      'width: 100%;' +
      'margin-top: 8px;' +
      'padding: 14px 16px;' +
      'border-radius: 50px;' +
      'background: #257A57;' +
      'color: #fff;' +
      'font-size: 13px;' +
      'font-weight: 600;' +
      'letter-spacing: 0.5px;' +
      'text-transform: uppercase;' +
      'text-decoration: none;' +
      'box-sizing: border-box;' +
      '}' +
      '.wj-payment-issue-popover__cta:hover {' +
      'background: #1f6849;' +
      'color: #fff;' +
      '}' +
      '@media (max-width: 768px) {' +
      '#' +
      POPOVER_ID +
      ' {' +
      'width: min(320px, calc(100vw - 24px));' +
      '}' +
      '}';
    document.head.appendChild(style);
  }

  function ensurePopover() {
    let popover = document.getElementById(POPOVER_ID);
    if (popover) {
      return popover;
    }

    popover = document.createElement('div');
    popover.id = POPOVER_ID;
    popover.setAttribute('data-wj-payment-issue', '1');
    popover.innerHTML = buildPopoverHtml();
    document.body.appendChild(popover);
    bindPopoverEvents(popover);
    return popover;
  }

  function positionPopover() {
    const popover = document.getElementById(POPOVER_ID);
    const anchor = getAnchor();
    if (!popover || !anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth || 320;
    const gap = 12;
    const anchorCenterX = rect.left + rect.width / 2;
    const isRightSideAnchor = anchorCenterX > window.innerWidth * 0.55;
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    const top = rect.bottom + gap;
    const minLeft = VIEWPORT_MARGIN_LEFT;
    const maxLeft = window.innerWidth - popoverWidth - VIEWPORT_MARGIN_RIGHT;

    if (isRightSideAnchor) {
      left = maxLeft;
    }

    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < minLeft) {
      left = minLeft;
    }

    popover.style.top = top + 'px';
    popover.style.left = left + 'px';

    const arrow = popover.querySelector('.wj-payment-issue-popover__arrow');
    if (arrow) {
      let arrowLeft = rect.left + rect.width / 2 - left;
      const arrowPadding = 20;
      if (arrowLeft < arrowPadding) {
        arrowLeft = arrowPadding;
      }
      if (arrowLeft > popoverWidth - arrowPadding) {
        arrowLeft = popoverWidth - arrowPadding;
      }
      arrow.style.left = arrowLeft + 'px';
      arrow.style.transform = 'translateX(-50%) rotate(45deg)';
    }
  }

  function hidePopover() {
    const popover = document.getElementById(POPOVER_ID);
    if (!popover) {
      popoverVisible = false;
      return;
    }

    popover.classList.remove('is-visible');
    popoverVisible = false;
  }

  function showPopover(source) {
    const anchor = getAnchor();
    if (!anchor) {
      return;
    }

    const popover = ensurePopover();
    const title = popover.querySelector('.wj-payment-issue-popover__title');
    if (title) {
      title.textContent = getGreetingHtml();
    }

    positionPopover();
    popover.classList.add('is-visible');
    popoverVisible = true;
    markShownThisSession();

    if (!viewTrackingSent) {
      viewTrackingSent = true;
      sendGAEvent('view', source || 'popover_exibido');
    }
  }

  function bindPopoverEvents(popover) {
    if (popover.getAttribute(LISTENER_ATTR) === '1') {
      return;
    }
    popover.setAttribute(LISTENER_ATTR, '1');

    popover.addEventListener('click', function (event) {
      const target = event.target;
      const closeBtn =
        target.closest && target.closest('[data-action="close"]');
      const ctaBtn = target.closest && target.closest('[data-action="cta"]');

      if (closeBtn) {
        event.preventDefault();
        markDismissed();
        hidePopover();
        sendGAEvent('click', 'fechar');
        return;
      }

      if (ctaBtn) {
        sendGAEvent('click', 'atualizar_pagamento');
      }
    });
  }

  function bindAnchorCloseOnClick() {
    const anchor = getAnchor();
    if (!anchor || anchor.getAttribute(ANCHOR_LISTENER_ATTR) === '1') {
      return;
    }

    anchor.setAttribute(ANCHOR_LISTENER_ATTR, '1');
    anchor.addEventListener('click', function () {
      if (!popoverVisible) {
        return;
      }

      hidePopover();
      sendGAEvent('click', 'fechar_perfil');
    });
  }

  function bindDocumentDismiss() {
    if (window.wjPaymentIssuePopoverDocBound) {
      return;
    }
    window.wjPaymentIssuePopoverDocBound = true;

    document.addEventListener('click', function (event) {
      const popover = document.getElementById(POPOVER_ID);
      if (!popover || !popoverVisible) {
        return;
      }

      const target = event.target;
      if (popover.contains(target)) {
        return;
      }

      hidePopover();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && popoverVisible) {
        hidePopover();
      }
    });

    window.addEventListener('resize', function () {
      if (popoverVisible) {
        positionPopover();
      }
    });

    window.addEventListener(
      'scroll',
      function () {
        if (popoverVisible) {
          positionPopover();
        }
      },
      true
    );
  }

  function setupHeaderObserver() {
    if (window.wjPaymentIssuePopoverHeaderObserver) {
      return;
    }

    window.wjPaymentIssuePopoverHeaderObserver = new MutationObserver(
      function () {
        debouncedRun();
      }
    );

    const header = document.querySelector(SELECTORS.header);
    if (header) {
      window.wjPaymentIssuePopoverHeaderObserver.observe(header, {
        childList: true,
        subtree: true,
      });
    }
  }

  async function tryAutoShow() {
    if (autoShowDone || !canAutoShow() || !paymentIssueCache) {
      return;
    }

    if (!getAnchor()) {
      return;
    }

    autoShowDone = true;
    showPopover('auto_load');
  }

  async function run() {
    if (isProcessing) {
      return;
    }

    isProcessing = true;
    try {
      injectStyles();
      bindDocumentDismiss();

      const loggedIn = await isUserLoggedInAsync();
      if (!loggedIn) {
        hidePopover();
        return;
      }

      cachedFirstName = await getUserFirstName();
      const hasIssue = await userHasPaymentIssue();
      if (!hasIssue) {
        hidePopover();
        return;
      }

      setupHeaderObserver();
      bindAnchorCloseOnClick();
      await tryAutoShow();
    } finally {
      isProcessing = false;
    }
  }

  function debouncedRun() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(run, 200);
  }

  function boot() {
    run();

    let attempts = 0;
    const pollTimer = setInterval(function () {
      attempts++;
      run();
      if (attempts >= 80 || (getAnchor() && paymentIssueCache !== null)) {
        clearInterval(pollTimer);
      }
    }, 300);

    if (!window.wjPaymentIssuePopoverMountObserver) {
      window.wjPaymentIssuePopoverMountObserver = new MutationObserver(
        function (mutations) {
          let shouldRun = false;
          let i = 0;

          while (i < mutations.length) {
            const mutation = mutations[i];
            let j = 0;
            while (j < mutation.addedNodes.length) {
              const node = mutation.addedNodes[j];
              if (
                node.nodeType === 1 &&
                ((node.matches && node.matches(SELECTORS.header)) ||
                  (node.querySelector &&
                    (node.querySelector(SELECTORS.header) ||
                      node.querySelector(SELECTORS.anchor))))
              ) {
                shouldRun = true;
                break;
              }
              j++;
            }
            if (shouldRun) {
              break;
            }
            i++;
          }

          if (shouldRun) {
            debouncedRun();
          }
        }
      );

      window.wjPaymentIssuePopoverMountObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
