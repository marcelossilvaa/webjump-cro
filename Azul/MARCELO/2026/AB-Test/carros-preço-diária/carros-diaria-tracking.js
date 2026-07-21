(function() {
  const experienceName = "AT_EXPERIENCE_CARS_DAILYPRICES";
  const experienceTargetUrl = "br/pt/home/cars";
  const TRACKING_ATTR = "data-at-select-car-tracking-added";
  const BUTTON_SELECTOR = "button[data-testid='search-box-hotel-date-picker-primary-button']";

  if (window.__atCarsDailyPricesSelectCarTracking) {
      return;
  }

  if (window.location.pathname.indexOf(experienceTargetUrl) === -1) {
      console.log("[AT] Page is not a correct page for select car tracking.");
      return;
  }

  window.__atCarsDailyPricesSelectCarTracking = true;

  /**
   * Function to trigger an Adobe Analytics event.
   * Uses to track user interactions within the experience.
   * @param {string} eventLabel - Label of the event to be triggered.
   *
   * Example usage:
   * analyticsEvent("click_selecionar_carro");
   */
  function analyticsEvent(eventLabel) {
      if (!eventLabel) return;

      const labelEvent = experienceName + " " + eventLabel;
      console.log("[AT] ANALYTICS_TRIGGERED:", labelEvent);

      (function() {
          const s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
          if (!s || typeof s.tl !== "function") return;

          s.linkTrackVars = "events,eVar82";
          s.linkTrackEvents = "event90";
          s.events = "event90";
          s.eVar82 = labelEvent;

          s.tl(true, "o", "target_activity_action");
      })();
  }

  function bindSelectCarButtons() {
      const buttons = document.querySelectorAll(BUTTON_SELECTOR);
      if (buttons.length === 0) return;

      let bound = 0;
      buttons.forEach(function(button) {
          if (button.getAttribute(TRACKING_ATTR)) return;

          button.setAttribute(TRACKING_ATTR, "true");
          button.addEventListener("click", function() {
              analyticsEvent("click_selecionar_carro");
          });
          bound++;
      });

      if (bound > 0) {
          console.log("[AT] Bound select car tracking on " + bound + " button(s).");
      }
  }

  function setupReactivity() {
      let scheduled = false;

      const schedule = function() {
          if (scheduled) return;
          scheduled = true;
          requestAnimationFrame(function() {
              scheduled = false;
              bindSelectCarButtons();
          });
      };

      const observer = new MutationObserver(schedule);
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  }

  function init() {
      console.log("[AT] Select car tracking started:", experienceName);
      setupReactivity();
      bindSelectCarButtons();
  }

  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
  } else {
      init();
  }
})();
