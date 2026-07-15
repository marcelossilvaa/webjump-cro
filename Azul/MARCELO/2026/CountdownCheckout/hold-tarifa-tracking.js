(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_CountdownCheckout';
  const HOLD_CHECKBOX_TEST_ID = 'booking-hold-checkbox';
  const SUMMARY_TOTAL_TEST_ID = 'summary-header-total';
  const HOLD_BLOCK_CLASS = 'sc-d781f9ae-2';
  const HOLD_COPY_CLASS = 'sc-d781f9ae-7';
  const ATTR_LISTENER = 'data-at-hold-tracking-added';
  const LOG_PREFIX = '[AT HoldTarifa]';

  let bootstrapTimer = null;
  let copyDebounceTimer = null;
  let domDebounceTimer = null;
  let isProcessing = false;
  let hasTrackedInitialStatus = false;
  let lastTrackedState = null;
  let lastKnownCopy = '';
  let holdBlockObserver = null;

  function debug() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift(LOG_PREFIX);
    console.log.apply(console, args);
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;

    const labelEvent = EXPERIMENT_NAME + '_' + eventType + ' ' + eventLabel;
    debug('analytics', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        debug('analytics indisponivel');
        return;
      }

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function isTargetPage() {
    return !!document.querySelector('[data-test-id="' + SUMMARY_TOTAL_TEST_ID + '"]');
  }

  function getHoldCheckbox() {
    return document.querySelector('[data-test-id="' + HOLD_CHECKBOX_TEST_ID + '"]');
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getHoldBlock(checkbox) {
    if (!checkbox || typeof checkbox.closest !== 'function') return null;

    const byClass = checkbox.closest('.' + HOLD_BLOCK_CLASS);
    if (byClass) return byClass;

    let el = checkbox.parentElement;
    let depth = 0;

    while (el && el !== document.body && depth < 6) {
      const text = normalizeText(el.textContent);
      if (
        text.indexOf('congelada ate') !== -1 ||
        text.indexOf('precisa de mais tempo') !== -1 ||
        text.indexOf('congele o valor') !== -1
      ) {
        return el;
      }
      el = el.parentElement;
      depth += 1;
    }

    return null;
  }

  function getHoldCopy(checkbox) {
    const holdBlock = getHoldBlock(checkbox);
    if (!holdBlock) return '';

    const copyEl = holdBlock.querySelector('.' + HOLD_COPY_CLASS);
    if (copyEl) return normalizeText(copyEl.textContent);

    return normalizeText(holdBlock.textContent);
  }

  function getStateFromCopy(copy) {
    if (!copy) return null;

    if (copy.indexOf('congelada ate') !== -1) {
      return 'ativado';
    }

    if (
      copy.indexOf('precisa de mais tempo') !== -1 ||
      copy.indexOf('congele o valor da tarifa') !== -1 ||
      copy.indexOf('congele o valor') !== -1
    ) {
      return 'desativado';
    }

    return null;
  }

  function trackState(state, eventType) {
    if (!state) return;
    analyticsEvent('congelamento_tarifa_' + state, eventType);
  }

  function evaluateCopyChange(checkbox, source) {
    const copy = getHoldCopy(checkbox);
    const state = getStateFromCopy(copy);

    debug('avaliacao', {
      source: source,
      copy: copy,
      state: state,
      lastKnownCopy: lastKnownCopy,
      lastTrackedState: lastTrackedState,
      hasTrackedInitialStatus: hasTrackedInitialStatus,
    });

    if (!state) {
      debug('estado indefinido, aguardando copy valida');
      return false;
    }

    if (!hasTrackedInitialStatus) {
      hasTrackedInitialStatus = true;
      lastTrackedState = state;
      lastKnownCopy = copy;
      trackState(state, 'status');
      debug('status inicial', state);
      return true;
    }

    if (state !== lastTrackedState) {
      lastTrackedState = state;
      lastKnownCopy = copy;
      trackState(state, 'click');
      debug('mudanca detectada', state);
      return true;
    }

    if (copy !== lastKnownCopy) {
      lastKnownCopy = copy;
      debug('copy alterada sem mudanca de estado');
    }

    return true;
  }

  function pollCopyAfterInteraction(checkbox, source) {
    let tries = 0;

    function attempt() {
      const resolved = evaluateCopyChange(checkbox, source + '_poll_' + tries);
      tries += 1;

      if (resolved && lastTrackedState === getStateFromCopy(getHoldCopy(checkbox))) {
        return;
      }

      if (tries >= 30) {
        debug('poll encerrado sem mudanca confirmada', {
          tries: tries,
          copy: getHoldCopy(checkbox),
          state: getStateFromCopy(getHoldCopy(checkbox)),
        });
        return;
      }

      setTimeout(attempt, 200);
    }

    attempt();
  }

  function bindHoldListener(checkbox) {
    if (!checkbox || checkbox.getAttribute(ATTR_LISTENER) === 'true') return;

    checkbox.setAttribute(ATTR_LISTENER, 'true');
    debug('listener adicionado no checkbox');

    checkbox.addEventListener('change', function () {
      debug('evento change no checkbox', { checked: checkbox.checked });
      pollCopyAfterInteraction(checkbox, 'change');
    });
  }

  function disconnectHoldObserver() {
    if (holdBlockObserver) {
      holdBlockObserver.disconnect();
      holdBlockObserver = null;
    }
  }

  function bindHoldBlockObserver(checkbox) {
    const holdBlock = getHoldBlock(checkbox);
    if (!holdBlock) {
      debug('bloco do hold nao encontrado para observer');
      return;
    }

    if (holdBlock.getAttribute('data-at-hold-observer') === 'true' && holdBlockObserver) {
      return;
    }

    disconnectHoldObserver();
    holdBlock.setAttribute('data-at-hold-observer', 'true');
    debug('observer adicionado no bloco do hold');

    holdBlockObserver = new MutationObserver(function () {
      clearTimeout(copyDebounceTimer);
      copyDebounceTimer = setTimeout(function () {
        evaluateCopyChange(checkbox, 'mutation');
      }, 120);
    });

    holdBlockObserver.observe(holdBlock, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function ensureBootstrap(checkbox, attempt) {
    if (!checkbox) return;

    const holdBlock = getHoldBlock(checkbox);
    const copy = getHoldCopy(checkbox);
    const state = getStateFromCopy(copy);

    debug('bootstrap', {
      attempt: attempt,
      holdBlock: !!holdBlock,
      copy: copy,
      state: state,
    });

    if (holdBlock) {
      bindHoldListener(checkbox);
      bindHoldBlockObserver(checkbox);

      if (!hasTrackedInitialStatus && state) {
        evaluateCopyChange(checkbox, 'bootstrap');
        return;
      }

      if (hasTrackedInitialStatus) return;
    }

    if (attempt >= 40) {
      debug('bootstrap encerrado sem status inicial');
      return;
    }

    bootstrapTimer = setTimeout(function () {
      ensureBootstrap(getHoldCheckbox(), attempt + 1);
    }, 250);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if (!isTargetPage()) {
        debug('pagina fora do alvo');
        return;
      }

      const checkbox = getHoldCheckbox();
      if (!checkbox) {
        debug('checkbox nao encontrado');
        return;
      }

      bindHoldListener(checkbox);
      bindHoldBlockObserver(checkbox);

      if (!hasTrackedInitialStatus) {
        evaluateCopyChange(checkbox, 'run');
      }
    } finally {
      isProcessing = false;
    }
  }

  function debouncedRun() {
    clearTimeout(domDebounceTimer);
    domDebounceTimer = setTimeout(run, 200);
  }

  function observeDom() {
    if (window._atHoldTarifaTrackingObserver) return;

    const observer = new MutationObserver(function (mutations) {
      let shouldRun = false;

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type !== 'childList' && mutation.type !== 'characterData') continue;
        shouldRun = true;
        break;
      }

      if (shouldRun) debouncedRun();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window._atHoldTarifaTrackingObserver = observer;
    debug('observer global iniciado');
  }

  function init() {
    debug('init');
    observeDom();
    ensureBootstrap(getHoldCheckbox(), 0);
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
