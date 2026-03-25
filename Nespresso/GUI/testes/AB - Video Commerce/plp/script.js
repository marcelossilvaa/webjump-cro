(function () {
  function pushWidgetEvent(btn) {
    window.gtmDataObject = window.gtmDataObject || [];

    var videoElement = btn.querySelector("video");

    // Pega o Path Completo (URL inteira do vídeo)
    // Ex: https://videos-gcp.streamshop.com.br/vod/.../video.mp4
    var fullVideoPath = videoElement
      ? videoElement.currentSrc || videoElement.src
      : "url-nao-encontrada";

    window.gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "streamshop-widget-PLP",
      local_event_action: "click:floating-widget", // Ex: click:floating-widget
      local_event_label: fullVideoPath, // Apenas a URL completa do vídeo
    });
  }

  // Listener com proteção contra o botão "Fechar"
  var tentativas = 0;
  var maxTentativas = 50; // Máximo de tentativas (50 x 100ms = 5 segundos)

  var intervalo = setInterval(function () {
    var widgetBtn = document.getElementById("streamshop-widget");

    if (widgetBtn) {
      clearInterval(intervalo);
      widgetBtn.addEventListener("click", function (e) {
        // Se clicar no X (fechar), não dispara o evento
        if (e.target.closest(".close-button")) {
          return;
        }
        pushWidgetEvent(this);
      });
    } else {
      tentativas++;

      if (tentativas >= maxTentativas) {
        clearInterval(intervalo);
      }
    }
  }, 100); // Verifica a cada 100ms
})();
