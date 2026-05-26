(function () {
  'use strict';

  function adjustHeaderPosition() {
    var smartBanner = document.getElementById('smart-banner');
    var header = document.querySelector('div[elevation="9999"]');

    if (header) {
      var headerStyle = window.getComputedStyle(header);
      if (headerStyle.position !== 'fixed' && headerStyle.position !== 'sticky') {
        header = header.parentElement;
      }
    } else {
      header = document.querySelector('header');
    }

    if (smartBanner && header) {
      // 1. Aplica o novo padding ajustado
      var bannerInner = smartBanner.firstElementChild;
      if (bannerInner) {
        bannerInner.style.setProperty('padding', '1em 0.8em 1em 0em', 'important');
      }

      // 2. Garante que o "espaçador" tenha a MESMA altura do banner
      // e aplica o MESMO valor no top do header.
      var bannerHeight = Math.ceil(smartBanner.getBoundingClientRect().height);
      var bannerOffset = bannerHeight > 0 ? bannerHeight + 'px' : '0px';

      var spacerDiv = smartBanner.previousElementSibling;
      if (spacerDiv && spacerDiv.tagName === 'DIV' && !spacerDiv.id) {
        spacerDiv.style.setProperty('height', bannerOffset, 'important');
      }

      header.style.setProperty('top', bannerOffset, 'important');
      header.style.setProperty('transition', 'top 0.3s ease-in-out', 'important');
      header.style.setProperty('z-index', '9999', 'important');
    }
  }

  function resetHeaderPosition() {
    var header = document.querySelector('div[elevation="9999"]');
    if (header) {
      var headerStyle = window.getComputedStyle(header);
      if (headerStyle.position !== 'fixed' && headerStyle.position !== 'sticky') {
        header = header.parentElement;
      }
    }
    if (header) {
      header.style.setProperty('top', '0px', 'important');
    }

    var smartBanner = document.getElementById('smart-banner');
    if (smartBanner) {
      var spacerDiv = smartBanner.previousElementSibling;
      if (spacerDiv && spacerDiv.tagName === 'DIV' && !spacerDiv.id) {
        spacerDiv.style.setProperty('height', '0px', 'important');
      }
    }
  }

  function initSmartBannerFix() {
    var smartBanner = document.getElementById('smart-banner');
    if (!smartBanner) return false;

    setTimeout(function () {
      adjustHeaderPosition();
    }, 100);

    var closeBtn = smartBanner.querySelector('[data-af-close-button="true"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', resetHeaderPosition);
    }

    return true;
  }

  var observer = new MutationObserver(function (mutations, obs) {
    if (document.getElementById('smart-banner')) {
      initSmartBannerFix();
      obs.disconnect();
    }
  });

  if (!initSmartBannerFix()) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
