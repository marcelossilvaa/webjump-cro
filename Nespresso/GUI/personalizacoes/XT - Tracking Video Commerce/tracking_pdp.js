(function () {
  "use strict";
  if (window.__videoCommercePdpTrackingInit) return;
  window.__videoCommercePdpTrackingInit = true;

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_pdp", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  window.addEventListener("message", function (event) {
    let data = event.data;
    if (!data || data.from !== "STREAMSHOP") return;

    if (data.action === "liveshopAdsClosed") {
      sendGAEvent("video_commerce_pdp_fechou");
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
          sendGAEvent("video_commerce_pdp_expandiu");
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
          sendGAEvent("video_commerce_pdp_descartou");
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

  function attachListeners() {
    let widget = document.querySelector("#streamshop-widget");
    if (!widget) return false;

    waitForDismissButton();

    widget.addEventListener("click", function () {
      sendGAEvent("video_commerce_pdp_abriu");
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
})();
