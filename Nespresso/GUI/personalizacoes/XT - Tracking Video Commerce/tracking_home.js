(function () {
  "use strict";
  if (window.__videoCommerceTrackingInit) return;
  window.__videoCommerceTrackingInit = true;

  const TOUCH_DRAG_THRESHOLD_PX = 10;
  let lastProductName = null;
  let isVideoOpen = false;
  let pendingInnerViewTimeout = null;
  let hasSeenInitialInnerVideo = false;

  function sendGAEvent(label, action) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "video_commerce_home", //free to fill field, please use lower case
      local_event_action: action || "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  function normalizeProductName(name) {
    return name.toLowerCase().replaceAll(" ", "_");
  }

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
      if (isVideoOpen) {
        if (!hasSeenInitialInnerVideo) {
          hasSeenInitialInnerVideo = true;
        } else {
          scheduleInnerVideoView(lastProductName);
        }
      }
    } else if (data.action === "liveshopAdsOpened") {
      isVideoOpen = true;
      hasSeenInitialInnerVideo = false;
    } else if (data.action === "liveshopAdsClosed") {
      isVideoOpen = false;
      hasSeenInitialInnerVideo = false;
      if (pendingInnerViewTimeout) {
        clearTimeout(pendingInnerViewTimeout);
        pendingInnerViewTimeout = null;
      }
      sendGAEvent("video_commerce_home_fechar");
      if (lastProductName) {
        sendGAEvent(
          "video_commerce_home_fechar_" + normalizeProductName(lastProductName),
        );
      }
    } else if (data.action === "openProductUrl" && data.data && data.data.name) {
      sendGAEvent("video_commerce_home_pdp");
      sendGAEvent(
        "video_commerce_home_pdp_" + normalizeProductName(data.data.name),
      );
    }
  });

  function attachExpandListener() {
    let buttons = document.querySelectorAll(
      "#liveshop-sdk-close-btn:not([data-close-tracked])",
    );
    if (!buttons.length) return false;

    let attached = false;
    buttons.forEach(function (btn) {
      btn.setAttribute("data-close-tracked", "true");

      let isExpandBtn = !!btn.querySelector("svg");
      if (!isExpandBtn) return;

      attached = true;
      let lastExpandTrackedAt = 0;
      ["click", "touchend"].forEach(function (eventType) {
        btn.addEventListener(eventType, function () {
          let now = Date.now();
          if (now - lastExpandTrackedAt < 500) return;
          lastExpandTrackedAt = now;

          sendGAEvent("video_commerce_home_expandir");
          if (lastProductName) {
            sendGAEvent(
              "video_commerce_home_expandir_" +
                normalizeProductName(lastProductName),
            );
          }
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

  const VIEW_FEATURED_MS = 2000;
  const VIEW_CHECK_INTERVAL_MS = 250;

  let viewedProducts = {};
  let viewedWithoutProduct = false;
  let viewedProductsInner = {};

  function isFeaturedVideo(video) {
    let slide = video.closest(".swiper-slide");
    return !!slide && slide.classList.contains("swiper-slide-active");
  }

  function isSubstantiallyVisible(el) {
    let rect = el.getBoundingClientRect();
    let viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    let viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;

    let visibleHeight =
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    let visibleWidth =
      Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
    if (visibleHeight <= 0 || visibleWidth <= 0) return false;

    let totalArea = rect.width * rect.height;
    if (totalArea <= 0) return false;

    return (visibleHeight * visibleWidth) / totalArea >= 0.5;
  }

  function trackVideoView(video) {
    let productVideo = video.shadowRoot.querySelector(".lav-product-name");
    let productKey = productVideo
      ? normalizeProductName(productVideo.textContent.trim())
      : null;

    if (productKey && !viewedProducts[productKey]) {
      viewedProducts[productKey] = true;
      sendGAEvent("video_commerce_home_visualizado", "view");
      sendGAEvent("video_commerce_home_visualizado_" + productKey, "view");
    } else if (!productKey && !viewedWithoutProduct) {
      viewedWithoutProduct = true;
      sendGAEvent("video_commerce_home_visualizado", "view");
    }
  }

  function scheduleInnerVideoView(productName) {
    if (pendingInnerViewTimeout) {
      clearTimeout(pendingInnerViewTimeout);
    }
    pendingInnerViewTimeout = setTimeout(function () {
      pendingInnerViewTimeout = null;
      if (!isVideoOpen || lastProductName !== productName) return;

      let productKey = normalizeProductName(productName);
      if (!viewedProductsInner[productKey]) {
        viewedProductsInner[productKey] = true;
        sendGAEvent("video_commerce_home_visualizado_interno", "view");
        sendGAEvent(
          "video_commerce_home_visualizado_interno_" + productKey,
          "view",
        );
      }
    }, VIEW_FEATURED_MS);
  }

  function watchFeaturedVideo(carouselEl, videos) {
    let visibleMs = new Map();
    let triggeredWhileFeatured = new Set();

    let interval = setInterval(function () {
      if (!carouselEl.isConnected) {
        clearInterval(interval);
        return;
      }

      let carouselVisible = isSubstantiallyVisible(carouselEl);

      videos.forEach(function (video) {
        if (carouselVisible && !isVideoOpen && isFeaturedVideo(video)) {
          let elapsed = (visibleMs.get(video) || 0) + VIEW_CHECK_INTERVAL_MS;
          visibleMs.set(video, elapsed);
          if (elapsed >= VIEW_FEATURED_MS && !triggeredWhileFeatured.has(video)) {
            triggeredWhileFeatured.add(video);
            trackVideoView(video);
          }
        } else {
          visibleMs.set(video, 0);
          triggeredWhileFeatured.delete(video);
        }
      });
    }, VIEW_CHECK_INTERVAL_MS);
  }

  function attachListeners() {
    let videoCommerceContainer = document.querySelector(
      "liveshop-ads-carousel-v2",
    );
    if (!videoCommerceContainer) return false;

    let videos =
      videoCommerceContainer.shadowRoot.querySelectorAll("liveshop-ads-video");
    if (videos.length > 0) {
      watchFeaturedVideo(videoCommerceContainer, videos);
    }

    videos.forEach((video) => {
      let lastOpenTrackedAt = 0;
      let touchStartPos = null;

      video.addEventListener("touchstart", function (e) {
        if (e.touches && e.touches[0]) {
          touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      });

      function handleOpen(e) {
        if (e.type === "touchend" && touchStartPos && e.changedTouches && e.changedTouches[0]) {
          let dx = e.changedTouches[0].clientX - touchStartPos.x;
          let dy = e.changedTouches[0].clientY - touchStartPos.y;
          touchStartPos = null;
          if (Math.sqrt(dx * dx + dy * dy) > TOUCH_DRAG_THRESHOLD_PX) return;
        }

        let now = Date.now();
        if (now - lastOpenTrackedAt < 500) return;
        lastOpenTrackedAt = now;

        let productVideo = video.shadowRoot.querySelector(".lav-product-name");
        if (productVideo) {
          let productName = productVideo.textContent.trim();
          sendGAEvent("video_commerce_" + normalizeProductName(productName));
        } else {
          sendGAEvent("video_commerce_video_sem_produto");
        }
        waitForExpandButton();
      }

      ["click", "touchend"].forEach(function (eventType) {
        video.addEventListener(eventType, handleOpen);
      });
    });
    return videos.length > 0;
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
