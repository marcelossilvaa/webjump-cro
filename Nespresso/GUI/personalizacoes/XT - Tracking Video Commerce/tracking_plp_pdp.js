(function () {
  "use strict";
  if (window.__videoCommercePdpTrackingInit) return;
  window.__videoCommercePdpTrackingInit = true;

  function getPageName() {
    if (!Array.isArray(window.dataLayer)) return null;
    for (let i = window.dataLayer.length - 1; i >= 0; i--) {
      let entry = window.dataLayer[i];
      if (entry && entry.page_name) return entry.page_name;
    }
    return null;
  }

  function waitForPageConfirmation(onConfirmed) {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(function () {
      attempts++;
      let pageName = getPageName();
      if (pageName !== null || attempts >= maxAttempts) {
        clearInterval(interval);
        if (pageName === "pdp") onConfirmed("video_commerce_pdp", true);
        else if (pageName === "plp") onConfirmed("video_commerce_plp", false);
      }
    }, 250);
  }

  function init(prefix, isPdp) {
    let lastProductName = null;

    function sendGAEvent(label) {
      window.gtmDataObject = window.gtmDataObject || [];
      gtmDataObject.push({
        event: "local_event", //as is, do not change!!
        event_raised_by: "br", //please put the country code ex: us, ch, it
        local_event_category: prefix, //free to fill field, please use lower case
        local_event_action: "click", //free to fill field, please use lower case
        local_event_label: label, //free to fill field, please use lower case
      });
    }

    function normalizeProductName(name) {
      return name.toLowerCase().replaceAll(" ", "_");
    }

    function getUrlProductSlug() {
      let segments = window.location.pathname.split("/").filter(Boolean);
      let lastSegment = segments[segments.length - 1];
      return lastSegment ? lastSegment.replace(/-/g, "_") : null;
    }

    function sendGAEventWithProduct(label) {
      sendGAEvent(label);
      let productKey = lastProductName
        ? normalizeProductName(lastProductName)
        : isPdp
          ? getUrlProductSlug()
          : null;
      if (productKey) {
        sendGAEvent(label + "_" + productKey);
      }
    }

    let pendingOpenName = false;

    window.addEventListener("message", function (event) {
      let data = event.data;
      if (!data || data.from !== "STREAMSHOP") return;

      if (
        data.action === "videoLoaded" &&
        data.data &&
        data.data.scheduledProducts &&
        data.data.scheduledProducts[0]
      ) {
        lastProductName = data.data.scheduledProducts[0].name;
        if (pendingOpenName) {
          pendingOpenName = false;
          sendGAEvent(
            prefix + "_abriu_" + normalizeProductName(lastProductName),
          );
        }
      } else if (data.action === "liveshopAdsClosed") {
        sendGAEventWithProduct(prefix + "_fechou");
      } else if (data.action === "openProductUrl" && data.data && data.data.name) {
        sendGAEvent(prefix + "_pdp");
        sendGAEvent(prefix + "_pdp_" + normalizeProductName(data.data.name));
      }
    });

    function attachExpandListener() {
      let buttons = document.querySelectorAll(
        "#liveshop-sdk-close-btn:not([data-expand-tracked])",
      );
      if (!buttons.length) return false;

      let attached = false;
      buttons.forEach(function (btn) {
        btn.setAttribute("data-expand-tracked", "true");

        let isExpandBtn = !!btn.querySelector("svg");
        if (!isExpandBtn) return;

        attached = true;
        ["click", "touchend"].forEach(function (eventType) {
          btn.addEventListener(eventType, function () {
            sendGAEventWithProduct(prefix + "_expandiu");
          });
        });
      });
      return attached;
    }

    function waitForExpandButton() {
      if (attachExpandListener()) return;
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(function () {
        attempts++;
        if (attachExpandListener() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 300);
    }

    function attachDismissListener() {
      let widget = document.querySelector("#streamshop-widget");
      if (!widget) return false;

      let closeButton = widget.querySelector(
        ".close-button:not([data-dismiss-tracked])",
      );
      if (!closeButton) return false;

      closeButton.setAttribute("data-dismiss-tracked", "true");

      ["mousedown", "touchstart"].forEach(function (eventType) {
        closeButton.addEventListener(
          eventType,
          function (e) {
            e.stopPropagation();
            sendGAEventWithProduct(prefix + "_descartou");
          },
          true,
        );
      });
      return true;
    }

    function waitForDismissButton() {
      if (attachDismissListener()) return;
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(function () {
        attempts++;
        if (attachDismissListener() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 500);
    }

    const DRAG_THRESHOLD_PX = 5;
    let widgetMouseDownPos = null;

    function attachListeners() {
      let widget = document.querySelector("#streamshop-widget");
      if (!widget) return false;

      waitForDismissButton();

      widget.addEventListener("mousedown", function (e) {
        widgetMouseDownPos = { x: e.clientX, y: e.clientY };
      });

      widget.addEventListener("click", function (e) {
        let start = widgetMouseDownPos;
        widgetMouseDownPos = null;
        if (start) {
          let dx = e.clientX - start.x;
          let dy = e.clientY - start.y;
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;
        }

        sendGAEvent(prefix + "_abriu");
        pendingOpenName = true;
        waitForExpandButton();
      });

      return true;
    }

    if (!attachListeners()) {
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(function () {
        attempts++;
        if (attachListeners() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 500);
    }
  }

  waitForPageConfirmation(init);
})();
