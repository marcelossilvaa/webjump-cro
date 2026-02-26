// POPUP MES DO CONSUMIDOR - HOME
(function () {
  var POPUP_ID = "mdc-home-popup";
  var BUTTON_ID = "mdc-home-floating-btn";
  var WRAPPER_ID = "mdc-home-popup-wrapper";
  var STYLE_ID = "mdc-home-popup-styles";

  var STORAGE_KEYS = {
    INTERACTED: "mdc_home_popup_interacted_date",
    LAST_VIEW_DATE: "mdc_home_popup_last_view_date",
    SESSION_SHOWN: "mdc_home_popup_session_shown"
  };

  var CTA_LINK = "https://www.voeazul.com.br/br/pt/programa-fidelidade/comunicado-novo-nivel";

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = "AT_MesDoConsumidorHome_" + eventType + " " + eventLabel;

    (function () {
      var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
      if (!s || typeof s.tl !== "function") return;

      s.linkTrackVars = "events,eVar82,eVar84";
      s.linkTrackEvents = "event90";
      s.events = "event90";
      s.eVar82 = labelEvent;
      s.eVar84 = "AT_MesDoConsumidorHome";
      s.tl(true, "o", "target_activity_action");
    })();
  }

  function readTudoAzulCookie() {
    try {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf("TudoAzul=") === 0) {
          var encodedValue = cookie.substring("TudoAzul=".length);
          return JSON.parse(decodeURIComponent(encodedValue));
        }
      }
    } catch (error) {
      console.log("[MesDoConsumidor Home] Erro ao ler cookie:", error);
    }
    return null;
  }

  function normalizeText(value) {
    if (!value) return "";
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function resolveTierProfile(cookieData) {
    var levelCode = (cookieData && cookieData.program && cookieData.program.levelCode) || "";
    var levelName = (cookieData && cookieData.program && cookieData.program.name) || "";
    var normalized = (String(levelCode) + " " + String(levelName)).toUpperCase();
    var normalizedNoAccent = normalizeText(levelCode + " " + levelName);

    var tier = "azul";
    if (normalized.indexOf("UNQ") !== -1 || normalizedNoAccent.indexOf("unique") !== -1) {
      tier = "unique";
    } else if (normalized.indexOf("DIA") !== -1 || normalizedNoAccent.indexOf("diamante") !== -1) {
      tier = "diamante";
    } else if (
      normalized.indexOf("SAF") !== -1 ||
      normalizedNoAccent.indexOf("safira") !== -1 ||
      normalized.indexOf("TA+") !== -1 ||
      normalizedNoAccent.indexOf("topazio") !== -1
    ) {
      tier = "topazio_safira";
    }

    var esimVolume = "250MB";
    if (tier === "diamante") esimVolume = "1GB";
    if (tier === "unique") esimVolume = "2GB";

    return {
      tier: tier,
      esimVolume: esimVolume
    };
  }

  function getFirstName(cookieData) {
    var firstName = "";
    if (cookieData) {
      if (cookieData.name && typeof cookieData.name === "object" && cookieData.name.first) {
        firstName = cookieData.name.first;
      } else if (cookieData.name && typeof cookieData.name === "string") {
        firstName = cookieData.name.split(" ")[0];
      } else if (cookieData.Name) {
        firstName = String(cookieData.Name).split(" ")[0];
      }
    }
    return firstName || "Cliente Azul";
  }

  function getTodayDateString() {
    return new Date().toISOString().split("T")[0];
  }

  function getStorage(key) {
    try {
      var item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.log("[MesDoConsumidor Home] Erro no localStorage:", e);
    }
  }

  function hasInteractedToday() {
    return getStorage(STORAGE_KEYS.INTERACTED) === getTodayDateString();
  }

  function markInteraction() {
    setStorage(STORAGE_KEYS.INTERACTED, getTodayDateString());
  }

  function markViewToday() {
    setStorage(STORAGE_KEYS.LAST_VIEW_DATE, getTodayDateString());
  }

  function wasShownThisSession() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.SESSION_SHOWN) === "true";
    } catch (e) {
      return false;
    }
  }

  function markShownThisSession() {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_SHOWN, "true");
    } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var styles = document.createElement("style");
    styles.id = STYLE_ID;
    styles.textContent =
      "#" + BUTTON_ID + "{" +
      "position:fixed;right:22px;bottom:24px;width:72px;height:72px;border-radius:50%;background:#008BC4;color:#fff;" +
      "display:none;align-items:center;justify-content:center;z-index:999998;border:none;cursor:pointer;" +
      "box-shadow:0 8px 24px rgba(0,0,0,.28);font:700 16px/1 'Helvetica Neue',Arial,sans-serif;}" +
      "#" + BUTTON_ID + ".visible{display:flex;}" +
      ".mdc-home-popup{position:fixed;right:100px;bottom:24px;width:303px;height:508px;max-width:calc(100vw - 24px);" +
      "background:#008BC4;border-radius:16px;color:#fff;display:flex;flex-direction:column;gap:16px;padding:24px 24px 40px;" +
      "box-sizing:border-box;z-index:999999;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(10px) scale(.96);" +
      "transition:all .28s ease;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}" +
      ".mdc-home-popup.active{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1);}" +
      ".mdc-home-arrow{position:absolute;right:-8px;bottom:24px;width:22px;height:22px;background:#008BC4;transform:rotate(45deg);}" +
      ".mdc-home-header{display:flex;justify-content:space-between;align-items:center;}" +
      ".mdc-home-badge{background:#CF527A;border-radius:20px;padding:6px 12px;font-weight:700;font-size:14px;letter-spacing:.3px;}" +
      ".mdc-home-close{border:none;background:transparent;color:#fff;font-size:24px;cursor:pointer;line-height:1;padding:2px 4px;}" +
      ".mdc-home-title{text-align:center;}" +
      ".mdc-home-title h2{margin:0;font-size:28px;line-height:28px;font-weight:700;text-transform:capitalize;}" +
      ".mdc-home-sub{margin:0;text-align:center;font-size:14px;line-height:16px;font-weight:300;}" +
      ".mdc-home-divider{height:1px;background:rgba(255,255,255,.32);}" +
      ".mdc-home-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:16px;" +
      "display:flex;flex-direction:column;gap:8px;}" +
      ".mdc-home-card h3{margin:0;font-size:16px;line-height:18px;color:#041E42;}" +
      ".mdc-home-card p{margin:0;font-size:14px;line-height:18px;}" +
      ".mdc-home-cta{margin-top:auto;width:113px;height:45px;border-radius:8px;background:#008058;color:#fff;text-decoration:none;" +
      "display:flex;align-items:center;justify-content:center;font-size:16px;line-height:19px;}" +
      "@media (max-width:768px){" +
      "#" + BUTTON_ID + "{right:16px;bottom:16px;width:64px;height:64px;}" +
      ".mdc-home-popup{left:16px;right:16px;bottom:92px;width:auto;height:auto;min-height:430px;}" +
      ".mdc-home-arrow{right:28px;bottom:-8px;}" +
      "}";

    document.head.appendChild(styles);
  }

  function createPopupHTML(firstName, esimVolume) {
    return (
      '<button id="' + BUTTON_ID + '" aria-label="Abrir popup Mes do Consumidor">AZ</button>' +
      '<div class="mdc-home-popup" id="' + POPUP_ID + '">' +
      '  <div class="mdc-home-arrow"></div>' +
      '  <div class="mdc-home-header">' +
      '    <span class="mdc-home-badge">NOVIDADE</span>' +
      '    <button class="mdc-home-close" aria-label="Fechar popup">&times;</button>' +
      "  </div>" +
      '  <div class="mdc-home-title">' +
      "    <h2>novos beneficios</h2>" +
      "  </div>" +
      '  <div class="mdc-home-divider"></div>' +
      '  <p class="mdc-home-sub">Confira os novos beneficios do seu nivel</p>' +
      '  <div class="mdc-home-divider"></div>' +
      '  <div class="mdc-home-card">' +
      "    <h3>Pode comemorar, " + firstName + "</h3>" +
      "    <p>A noticia mais aguardada chegou:</p>" +
      "    <p>Agora voce pode emitir Passagem Cortesia com pontos ou pontos + reais, alem de aproveitar um eSIM internacional com " +
      "<strong>" + esimVolume + "</strong> gratuitos. Emita agora e aproveite!</p>" +
      "  </div>" +
      '  <a class="mdc-home-cta" href="' + CTA_LINK + '">Saiba mais</a>' +
      "</div>"
    );
  }

  function showPopup() {
    var popup = document.getElementById(POPUP_ID);
    if (!popup) return;
    popup.classList.add("active");
    analyticsEvent("Popup", "visualizacao");
    markShownThisSession();
    markViewToday();
  }

  function hidePopup() {
    var popup = document.getElementById(POPUP_ID);
    if (popup) popup.classList.remove("active");
  }

  function injectPopup() {
    if (document.getElementById(WRAPPER_ID)) return;

    var cookieData = readTudoAzulCookie();
    var profile = resolveTierProfile(cookieData || {});
    var firstName = getFirstName(cookieData || {});

    injectStyles();

    var wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;
    wrapper.innerHTML = createPopupHTML(firstName, profile.esimVolume);
    document.body.appendChild(wrapper);

    var btn = document.getElementById(BUTTON_ID);
    var popup = document.getElementById(POPUP_ID);
    var closeBtn = popup ? popup.querySelector(".mdc-home-close") : null;
    var cta = popup ? popup.querySelector(".mdc-home-cta") : null;

    if (btn) {
      btn.classList.add("visible");
      btn.onclick = function () {
        if (!popup) return;
        if (popup.classList.contains("active")) {
          hidePopup();
          analyticsEvent("Floating Button Fechar", "clique");
          markInteraction();
        } else {
          showPopup();
          analyticsEvent("Floating Button Abrir", "clique");
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = function (e) {
        e.stopPropagation();
        hidePopup();
        analyticsEvent("Fechar", "clique");
        markInteraction();
      };
    }

    if (cta) {
      cta.addEventListener("click", function () {
        analyticsEvent("Saiba Mais", "clique");
        markInteraction();
      });
    }

    document.addEventListener("click", function (e) {
      if (!popup || !btn) return;
      if (!popup.contains(e.target) && !btn.contains(e.target) && popup.classList.contains("active")) {
        hidePopup();
        analyticsEvent("Fechar Outside", "clique");
        markInteraction();
      }
    });
  }

  function init() {
    injectPopup();
    if (!hasInteractedToday() && !wasShownThisSession()) {
      setTimeout(function () {
        showPopup();
        markInteraction();
      }, 2000);
    }
  }

  window.MesDoConsumidorHomePopup = {
    show: showPopup,
    hide: hidePopup,
    init: init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
