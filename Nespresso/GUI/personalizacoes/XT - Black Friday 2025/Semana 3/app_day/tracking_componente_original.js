(function () {
  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "baixe-nosso-app", //free to fill field, please use lower case
      local_event_action: action, //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

  function initTracking() {
    let ctaAndroid = document.querySelector(
      'nb-container[campaign_id="br-b2c-imagetext-novoapp-10ff"] li#android-app a'
    );
    let ctaIOS = document.querySelector(
      'nb-container[campaign_id="br-b2c-imagetext-novoapp-10ff"] li#ios-app a'
    );

    if (ctaAndroid && ctaIOS) {
      ctaAndroid.addEventListener("click", function () {
        sendGAEvent("click", "click-android-app");
      });
      ctaIOS.addEventListener("click", function () {
        sendGAEvent("click", "click-ios-app");
      });
      return true; // Elementos encontrados e listeners adicionados
    }
    return false; // Elementos ainda não encontrados
  }

  // Tenta encontrar os elementos imediatamente
  if (initTracking()) {
    return; // Se encontrou, não precisa do setInterval
  }

  // Se não encontrou, tenta periodicamente
  let attempts = 0;
  const maxAttempts = 20; // Máximo de 20 tentativas
  const intervalTime = 500; // 500ms entre tentativas

  const intervalId = setInterval(function () {
    attempts++;
    if (initTracking()) {
      clearInterval(intervalId); // Elementos encontrados, para o intervalo
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId); // Limite de tentativas atingido, para o intervalo
    }
  }, intervalTime);
})();
