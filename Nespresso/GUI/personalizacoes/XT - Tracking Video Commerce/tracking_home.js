(function () {
  "use strict";
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_home", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  function attachListeners() {
    let videoCommerceContainer = document.querySelector(
      "liveshop-ads-carousel-v2",
    );
    if (!videoCommerceContainer) return false;

    let videos =
      videoCommerceContainer.shadowRoot.querySelectorAll("liveshop-ads-video");
    videos.forEach((video) => {
      ["click", "touchend"].forEach(function (eventType) {
        video.addEventListener(eventType, function () {
          let productVideo =
            video.shadowRoot.querySelector(".lav-product-name");
          if (productVideo) {
            let productName = productVideo.textContent.trim();
            sendGAEvent(
              "video_commerce_" +
                productName.toLowerCase().replaceAll(" ", "_"),
            );
          } else {
            sendGAEvent("video_commerce_video_sem_produto");
          }
        });
      });
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
