(function () {
  "use strict";
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_plp_pdp", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  function attachListeners() {
    let widget = document.querySelector("#streamshop-widget");
    if (!widget) return false;

    let closeButton = widget.querySelector(".close-button");
    if (closeButton) {
      closeButton.addEventListener("click", function (e) {
        e.stopPropagation();
        sendGAEvent("video_commerce_plp_pdp_fechou");
      });
    }

    widget.addEventListener("click", function () {
      sendGAEvent("video_commerce_plp_pdp_abriu");
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
