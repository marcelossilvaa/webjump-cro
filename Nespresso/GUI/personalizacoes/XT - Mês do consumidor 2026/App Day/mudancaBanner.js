(function () {
  "use strict";
  const banner = {
    desktop:
      "https://www.nespresso.com/ecom/medias/sys_master/public/48903140999198/Media-Text-Desk.jpg?attachment=true&cimgnr=MKP5V",
    mobile:
      "https://www.nespresso.com/ecom/medias/sys_master/public/48903141130270/Media-Text-Mobile.jpg?attachment=true&cimgnr=apOJW",
  };
  const isMobile = window.innerWidth < 768;
  const newSrc = isMobile ? banner.mobile : banner.desktop;

  let attempts = 0;
  const maxAttempts = 20;

  const interval = setInterval(() => {
    const bannerElement = document.querySelector(
      "nb-container[campaign_id='br-b2c-imagetext-novoapp-10ff'] img",
    );

    attempts++;

    if (bannerElement) {
      clearInterval(interval);
      bannerElement.src = newSrc;
      bannerElement.style.borderRadius = "12px";
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 500);
})();
