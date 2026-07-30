(function () {
  "use strict";

  if (window.ocultarTopMessageBannerMobBoostDiaDosPais) {
    return;
  }
  window.ocultarTopMessageBannerMobBoostDiaDosPais = "true";

  const STYLE_ID = "boost-dia-dos-pais-hide-top-message-banner-mob";
  const TARGET_SELECTOR = "#topMessageBannerMob";
  let isProcessing = false;
  let debounceTimer = null;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#topMessageBannerMob {",
      "  display: none !important;",
      "}",
    ].join("\n");
    document.head.appendChild(style);
  }

  function hideBanner() {
    const banner = document.querySelector(TARGET_SELECTOR);
    if (!banner) {
      return false;
    }

    banner.style.setProperty("display", "none", "important");
    return true;
  }

  function run() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      injectStyles();
      hideBanner();
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(run, 100);
  }

  function init() {
    run();

    if (window._ocultarTopMessageBannerMobObserver) {
      return;
    }

    const observer = new MutationObserver(function (mutations) {
      let shouldRun = false;

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type !== "childList") {
          continue;
        }

        const added = mutation.addedNodes;
        for (let j = 0; j < added.length; j++) {
          const node = added[j];
          if (node.nodeType !== 1) {
            continue;
          }
          if (
            node.id === "topMessageBannerMob" ||
            (node.querySelector && node.querySelector(TARGET_SELECTOR))
          ) {
            shouldRun = true;
            break;
          }
        }
        if (shouldRun) {
          break;
        }
      }

      if (shouldRun) {
        scheduleRun();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    window._ocultarTopMessageBannerMobObserver = observer;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
