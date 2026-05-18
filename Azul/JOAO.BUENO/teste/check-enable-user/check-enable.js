(function () {
  "use strict";

  // ===== CONFIG =====
  var CONFIG = {
    labelNeedle: "utilizar os dados do passageiro principal",
    aaReportSuite: "azul-novo-prod",
    aaEvent: "event90",
    aaEvar: "eVar82",
    aaValuePrefix: "AT_dadosPassageiros ",
    aaLinkNamePrefix: "target_activity_action - ",
    requireArming: false,
    // Suppress user_enable for this many ms right after auto-enable:
    suppressUserMs: 1500,
    // Dispatch framework events on auto? Options: '', 'input', 'change', 'input,change'
    autoDispatch: "input,change",
  };

  var VERSION = "1.3.2";
  var ARMED_KEY = "wj_auto_mainPassenger";
  var urlKey = null,
    autoFiredThisView = false,
    mo = null,
    deb = null;

  function isPassengers() {
    return location.pathname.indexOf("/passageiros") > -1;
  }
  function isResponsavel() {
    return location.pathname.indexOf("/responsavel") > -1;
  }
  function urlK() {
    return location.pathname + location.search + location.hash;
  }
  function schedule(fn, t) {
    clearTimeout(deb);
    deb = setTimeout(fn, t || 50);
  }
  function resetOnRoute() {
    var k = urlK();
    if (k !== urlKey) {
      urlKey = k;
      autoFiredThisView = false;
    }
  }

  // ---- Adobe Analytics
  function fireAA(action) {
    try {
      var s =
        window.s ||
        (typeof window.s_gi === "function" &&
          window.s_gi(CONFIG.aaReportSuite));
      if (!s || typeof s.tl !== "function") return;
      s.linkTrackVars = "events," + CONFIG.aaEvar;
      s.linkTrackEvents = CONFIG.aaEvent;
      s.events = CONFIG.aaEvent;
      s[CONFIG.aaEvar] = CONFIG.aaValuePrefix + action;
      s.tl(true, "o", CONFIG.aaLinkNamePrefix + action);
    } catch (_) {}
  }

  // ---- Normalize label (lowercase, remove accents)
  function norm(str) {
    try {
      return (str || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    } catch (_) {
      return (str || "").toString().toLowerCase().trim();
    }
  }
  var NEEDLE = norm(CONFIG.labelNeedle);

  // ---- Find the correct checkbox by label/aria-label
  function findCheckbox() {
    var nodes = document.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < nodes.length; i++) {
      var cb = nodes[i];
      var aria = norm(cb.getAttribute("aria-label"));
      var lab = cb.closest("label");
      var forLab = null;
      if (!lab && cb.id)
        forLab = document.querySelector('label[for="' + cb.id + '"]');
      var labText = norm(
        (lab && lab.getAttribute("aria-label")) ||
          (lab && lab.textContent) ||
          (forLab && forLab.textContent)
      );
      if (aria.indexOf(NEEDLE) > -1 || labText.indexOf(NEEDLE) > -1) return cb;
    }
    var labels = document.querySelectorAll("label");
    for (var j = 0; j < labels.length; j++) {
      var L = labels[j];
      var txt = norm(L.getAttribute("aria-label") || L.textContent);
      if (txt.indexOf(NEEDLE) > -1) {
        var guess =
          L.querySelector('input[type="checkbox"]') ||
          (L.getAttribute("for") &&
            document.getElementById(L.getAttribute("for")));
        if (guess) return guess;
      }
    }
    return null;
  }

  // ---- Track user toggles (with auto-guard)
  function attachUserTracking(cb) {
    if (cb._wjAttached) return;
    cb.addEventListener("change", function (ev) {
      // Only real user actions + outside the suppression window
      var trusted = ev && ev.isTrusted === true;
      var now = Date.now();
      var withinGuard = cb._wjAutoGuardUntil && now < cb._wjAutoGuardUntil;

      if (trusted && !withinGuard) {
        cb._wjUserTouched = true;
        fireAA(cb.checked ? "user_enable" : "user_disable");
      }
    });
    cb._wjAttached = true;
  }

  // ---- Mark a short suppression window for user_enable after auto
  function markAutoGuard(cb) {
    cb._wjAutoGuardUntil = Date.now() + Math.max(0, CONFIG.suppressUserMs | 0);
  }

  // ---- Auto-check: try native click/label/icon; optionally dispatch events
  function autoEnable(cb) {
    // Guard any immediate user_enable coming from framework chains
    markAutoGuard(cb);

    try {
      cb.click();
    } catch (_) {}

    if (!cb.checked) {
      var label = cb.closest("label");
      var icon = label && label.querySelector(".checkbox-icon");
      try {
        if (label) label.click();
      } catch (_) {}
      if (!cb.checked && icon) {
        try {
          icon.click();
        } catch (_) {}
      }
    }

    if (!cb.checked) {
      cb.checked = true;
      // Only dispatch if configured
      if (CONFIG.autoDispatch) {
        var parts = CONFIG.autoDispatch.split(",");
        for (var i = 0; i < parts.length; i++) {
          var t = parts[i].trim();
          if (!t) continue;
          try {
            cb.dispatchEvent(new Event(t, { bubbles: true }));
          } catch (_) {}
        }
      }
    }

    fireAA("auto_enable");
    autoFiredThisView = true;
  }

  function tick() {
    resetOnRoute();

    var armed = null;
    try {
      armed = sessionStorage.getItem(ARMED_KEY) === "1";
    } catch (_) {}

    if (isPassengers()) {
      try {
        sessionStorage.setItem(ARMED_KEY, "1");
      } catch (_) {}
    }

    if (isResponsavel()) {
      var cb = findCheckbox();
      if (!cb) return;

      attachUserTracking(cb);

      var canAuto =
        !autoFiredThisView &&
        !cb._wjUserTouched &&
        (!CONFIG.requireArming || armed === true);
      if (canAuto) {
        autoEnable(cb);
        try {
          sessionStorage.removeItem(ARMED_KEY);
        } catch (_) {}
      }
    }
  }

  // Observe SPA re-renders
  function startObserver() {
    if (mo) return;
    mo = new MutationObserver(function () {
      schedule(tick, 50);
    });
    var target = document.documentElement || document.body;
    mo.observe(target, { childList: true, subtree: true });
  }

  // Hook SPA navigation
  (function hookHistory() {
    function hook(n) {
      var o = history[n];
      if (typeof o !== "function") return;
      history[n] = function () {
        var r = o.apply(this, arguments);
        schedule(tick, 50);
        return r;
      };
    }
    hook("pushState");
    hook("replaceState");
    window.addEventListener("popstate", function () {
      schedule(tick, 50);
    });
  })();

  function start() {
    startObserver();
    tick();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
