// CRONOMETRO MES DO CONSUMIDOR
(function () {
  // Formato: YYYY-MM-DD HH:MM:SS (horario de Brasilia)
  var START_AT = "2026-03-02 00:00:00";
  var END_AT = "2026-03-06 23:59:00";

  var STYLE_ID = "mdc-cronometro-styles";
  var OVERLAY_ID = "mdc-cronometro-overlay";
  var HOURS_ID = "mdc-cronometro-hours";
  var MINUTES_ID = "mdc-cronometro-minutes";
  var SECONDS_ID = "mdc-cronometro-seconds";
  var MESSAGE_ID = "mdc-cronometro-message";

  var timerRef = null;

  // Converte string no formato YYYY-MM-DD HH:MM:SS em Date UTC equivalente a Brasilia (UTC-3).
  function createBrasiliaDate(dateString) {
    var dateAndTime = dateString.split(" ");
    var ymd = dateAndTime[0].split("-").map(Number);
    var hms = dateAndTime[1].split(":").map(Number);

    return new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2], hms[0] + 3, hms[1], hms[2] || 0));
  }

  function getNow() {
    return new Date();
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function findTargetButton() {
    var buttons = document.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var images = btn.querySelectorAll("img");
      var hasTargetImage = false;
      for (var j = 0; j < images.length; j++) {
        var src = images[j].getAttribute("src") || "";
        if (src.indexOf("cronometro-mobile.png") !== -1 || src.indexOf("cronometro-desktop.png") !== -1) {
          hasTargetImage = true;
          break;
        }
      }
      if (hasTargetImage) return btn;
    }
    return null;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".mdc-cronometro-btn{position:relative;overflow:hidden;}" +
      ".mdc-cronometro-overlay{position:absolute;inset:0;background:#0061A0;color:#fff;padding:0 24px;box-sizing:border-box;pointer-events:none;display:flex;align-items:center;}" +
      ".mdc-cronometro-content{width:100%;max-width:1300px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;}" +
      ".mdc-cronometro-copy{max-width:520px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-style:normal;font-weight:700;font-size:48px;line-height:52px;color:#fff;}" +
      ".mdc-cronometro-time{display:flex;align-items:flex-start;gap:18px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:105.429px;line-height:114px;color:#fff;white-space:nowrap;}" +
      ".mdc-cronometro-value{min-width:123px;text-align:right;}" +
      ".mdc-cronometro-sep{width:26px;text-align:center;}" +
      ".mdc-cronometro-badge{width:99.93px;height:103.64px;flex:0 0 99.93px;pointer-events:none;opacity:.95;}" +
      ".mdc-cronometro-badge img{width:100%;height:100%;display:block;object-fit:contain;}" +
      "@media (max-width:1024px){" +
      ".mdc-cronometro-overlay{padding:12px 18px;}" +
      ".mdc-cronometro-content{justify-content:center;gap:12px;}" +
      ".mdc-cronometro-copy{max-width:340px;font-size:24px;line-height:28px;text-align:left;}" +
      ".mdc-cronometro-time{font-size:64px;line-height:68px;gap:10px;}" +
      ".mdc-cronometro-value{min-width:74px;}" +
      ".mdc-cronometro-sep{width:18px;}" +
      ".mdc-cronometro-badge{width:72px;height:74px;flex-basis:72px;}" +
      "}" +
      "@media (max-width:640px){" +
      ".mdc-cronometro-overlay{padding:10px 12px;}" +
      ".mdc-cronometro-content{max-width:375px;display:grid;grid-template-columns:49.48px 1fr;grid-template-areas:'badge copy' 'time time';column-gap:12px;row-gap:10px;align-items:center;justify-items:center;}" +
      ".mdc-cronometro-badge{grid-area:badge;width:49.48px;height:51.32px;flex-basis:49.48px;}" +
      ".mdc-cronometro-copy{grid-area:copy;max-width:212px;font-size:19.177px;line-height:22px;color:#3DB1E2;text-align:left;justify-self:start;}" +
      ".mdc-cronometro-time{grid-area:time;justify-content:center;font-size:60.3599px;line-height:65px;gap:8px;}" +
      ".mdc-cronometro-value{min-width:70.42px;}" +
      ".mdc-cronometro-sep{width:14.89px;}" +
      "}";

    document.head.appendChild(style);
  }

  function createBadgeIconHTML() {
    return '<img src="https://i.imgur.com/TZVf9Tj.png" alt="Icone de relogio" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'https://i.imgur.com/TZVf9Tj.jpg\';}else if(this.dataset.fallback==1){this.dataset.fallback=2;this.src=\'https://i.imgur.com/TZVf9Tj.jpeg\';}">';
  }

  function createOverlay() {
    return (
      '<div class="mdc-cronometro-overlay" id="' + OVERLAY_ID + '">' +
      '  <div class="mdc-cronometro-content">' +
      '    <div class="mdc-cronometro-badge">' + createBadgeIconHTML() + "</div>" +
      '    <div class="mdc-cronometro-copy" id="' + MESSAGE_ID + '">Mas, atenção: a oferta é por tempo limitado!</div>' +
      '    <div class="mdc-cronometro-time">' +
      '      <span class="mdc-cronometro-value" id="' + HOURS_ID + '">00</span>' +
      '      <span class="mdc-cronometro-sep">:</span>' +
      '      <span class="mdc-cronometro-value" id="' + MINUTES_ID + '">00</span>' +
      '      <span class="mdc-cronometro-sep">:</span>' +
      '      <span class="mdc-cronometro-value" id="' + SECONDS_ID + '">00</span>' +
      "    </div>" +
      "  </div>" +
      "</div>"
    );
  }

  function ensureOverlay() {
    var button = findTargetButton();
    if (!button) return null;

    if (!button.classList.contains("mdc-cronometro-btn")) {
      button.classList.add("mdc-cronometro-btn");
    }

    var overlay = button.querySelector("#" + OVERLAY_ID);
    if (!overlay) {
      var holder = document.createElement("div");
      holder.innerHTML = createOverlay();
      button.appendChild(holder.firstElementChild);
      overlay = button.querySelector("#" + OVERLAY_ID);
    }

    return overlay;
  }

  function computeCountdownState() {
    var now = getNow();
    var start = createBrasiliaDate(START_AT);
    var end = createBrasiliaDate(END_AT);

    if (now < start) {
      return { phase: "before", target: start };
    }
    if (now <= end) {
      return { phase: "running", target: end };
    }
    return { phase: "ended", target: end };
  }

  function updateCountdown() {
    var overlay = ensureOverlay();
    if (!overlay) return;

    var hoursEl = document.getElementById(HOURS_ID);
    var minutesEl = document.getElementById(MINUTES_ID);
    var secondsEl = document.getElementById(SECONDS_ID);
    var messageEl = document.getElementById(MESSAGE_ID);
    if (!hoursEl || !minutesEl || !secondsEl || !messageEl) return;

    var state = computeCountdownState();
    var now = getNow();

    if (state.phase === "ended") {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      messageEl.textContent = "Oferta encerrada";
      return;
    }

    if (state.phase === "before") {
      messageEl.textContent = "Mas, atenção: a oferta é por tempo limitado!";
    } else {
      messageEl.textContent = "Mas, atenção: a oferta é por tempo limitado!";
    }

    var diff = state.target.getTime() - now.getTime();
    if (diff < 0) diff = 0;

    var totalHours = Math.floor(diff / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = pad(totalHours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  function startLoop() {
    if (timerRef) return;
    updateCountdown();
    timerRef = setInterval(updateCountdown, 1000);
  }

  function init() {
    injectStyles();

    var tries = 0;
    var maxTries = 60;
    var bootstrap = setInterval(function () {
      var overlay = ensureOverlay();
      tries += 1;
      if (overlay || tries >= maxTries) {
        clearInterval(bootstrap);
        if (overlay) startLoop();
      }
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
