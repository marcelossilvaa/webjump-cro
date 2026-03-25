(function () {
  // === Configurações ===
  var REQUIRED_PATH          = "/selecao-voo";
  var FLOATING_CLASS         = "azul-floating-header";
  var INFO_SELECTOR          = ".transactional-navigation .css-1dsa855";
  var SUBTOTAL_SELECTOR      = ".transactional-navigation .ContainerPrice";
  var OVERVIEW_SELECTOR      = ".transactional-navigation .ContainerPrice__overview";
  var FARE_PRICE_SELECTOR    = "h4.current.css-2db79l[data-test-id=\"fare-price\"]";
  var NAV_SELECTOR           = ".transactional-navigation";
  var SELECT_FARE_SELECTOR   = "button[data-test-id=\"select-fare\"]";
  var SWITCH_FLIGHT_SELECTOR = "button.css-dddokp"; // botão “Trocar esse voo”

  var floatingWrap = null;

  // — Hook SPA de rota —
  function hookHistory() {
    var oPush    = history.pushState;
    var oReplace = history.replaceState;
    history.pushState = function () { oPush.apply(this, arguments); onUrlChange(); };
    history.replaceState = function () { oReplace.apply(this, arguments); onUrlChange(); };
    window.addEventListener("popstate", onUrlChange);
  }

  function onUrlChange() {
    if (window.location.pathname.indexOf(REQUIRED_PATH) !== -1) {
      setupFloating();
    } else {
      teardownFloating();
    }
  }

  // — Atualiza o subtotal nativo a partir do preço da tarifa selecionada ou zera —
  function updateNativeSubtotalFromFare() {
    var overviewH4 = document.querySelector(OVERVIEW_SELECTOR + " h4");
    if (!overviewH4) return;

    // verifica se existe um cartão de voo selecionado
    var selectedCard = document.querySelector(".flight-card.flight-card--selected");
    if (!selectedCard) {
      // nenhum voo selecionado → zera subtotal
      overviewH4.textContent = "R$ 0,00";
      overviewH4.setAttribute("aria-label", "Valor de R$ 0,00.");
      return;
    }

    // dentro do cartão selecionado, pega o elemento de preço
    var fareEl = selectedCard.querySelector(FARE_PRICE_SELECTOR);
    if (fareEl) {
      var price = fareEl.textContent.trim();
      overviewH4.textContent = price;
      overviewH4.setAttribute("aria-label", "Valor de " + price + ".");
    } else {
      // se algo falhar, zera como fallback
      overviewH4.textContent = "R$ 0,00";
      overviewH4.setAttribute("aria-label", "Valor de R$ 0,00.");
    }
  }

  function setupFloating() {
    if (floatingWrap) return;

    var infoEl     = document.querySelector(INFO_SELECTOR);
    var subtotalEl = document.querySelector(SUBTOTAL_SELECTOR);
    var navEl      = document.querySelector(NAV_SELECTOR);
    if (!infoEl || !subtotalEl || !navEl) return;

    floatingWrap = buildFloatingHeader(infoEl, subtotalEl);
    window.addEventListener("scroll", onScroll);

    // dispara atualização ao selecionar tarifa ou trocar voo
    document.body.addEventListener("click", function(e) {
      if (e.target.closest(SELECT_FARE_SELECTOR) ||
          e.target.closest(SWITCH_FLIGHT_SELECTOR)) {
        // espera o DOM refletir a mudança
        setTimeout(updateNativeSubtotalFromFare, 200);
      }
    });

    // primeira atualização rápida
    setTimeout(updateNativeSubtotalFromFare, 200);

    bindNativeInformar();
  }

  function teardownFloating() {
    if (floatingWrap) {
      floatingWrap.remove();
      floatingWrap = null;
    }
    window.removeEventListener("scroll", onScroll);
  }

  function onScroll() {
    var navEl = document.querySelector(NAV_SELECTOR);
    if (floatingWrap && navEl) {
      floatingWrap.style.display =
        navEl.getBoundingClientRect().bottom <= 0 ? "flex" : "none";
    }
  }

  function buildFloatingHeader(infoEl, subtotalEl) {
    var wrap = document.createElement("div");
    wrap.classList.add(FLOATING_CLASS);
    Object.assign(wrap.style, {
      position:       "fixed",
      top:            "0",
      left:           "0",
      right:          "0",
      zIndex:         "9999",
      backgroundColor:"#01416e",
      height:         "110px",
      padding:        "0 20px",
      boxShadow:      "0 2px 6px rgba(0,0,0,0.15)",
      display:        "none",
      alignItems:     "center",
      justifyContent: "center"
    });

    var inner = document.createElement("div");
    Object.assign(inner.style, {
      maxWidth:       "976px",
      width:          "100%",
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      height:         "100%",
      margin:         "0 auto"
    });

    var infoClone     = infoEl.cloneNode(true);
    var subtotalClone = subtotalEl.cloneNode(true);
    infoClone.style.margin     = "0";
    subtotalClone.style.margin = "0";

    // remove “Ver detalhes” do clone
    var cloneOverview = subtotalClone.querySelector(".ContainerPrice__overview");
    if (cloneOverview) {
      var btnVer = cloneOverview.querySelector("button[aria-label^=\"Ver detalhes\"]");
      if (btnVer) btnVer.remove();
    }

    inner.appendChild(infoClone);
    inner.appendChild(subtotalClone);
    wrap.appendChild(inner);
    document.body.appendChild(wrap);

    // sincroniza info
    new MutationObserver(function() {
      infoClone.innerHTML = infoEl.innerHTML;
    }).observe(infoEl, { childList:true, subtree:true, characterData:true });

    // sincroniza subtotal
    var origOverview = subtotalEl.querySelector(".ContainerPrice__overview");
    if (origOverview && cloneOverview) {
      new MutationObserver(function() {
        cloneOverview.innerHTML = origOverview.innerHTML;
        var btn = cloneOverview.querySelector("button[aria-label^=\"Ver detalhes\"]");
        if (btn) btn.remove();
      }).observe(origOverview, { childList:true, subtree:true, characterData:true });
    }

    // delega cliques clonados
    wrap.addEventListener("click", function(e) {
      var btnAlt = e.target.closest("button[aria-label^=\"Alterar busca\"]");
      if (btnAlt) {
        window.scrollTo({ top: 0, behavior: "instant" });
        setTimeout(function() {
          var modal = document.querySelector(".css-1wl1vzt");
          if (modal) modal.style.marginTop = "10px";
        }, 50);
        document.querySelector("button[aria-label^=\"Alterar busca\"]")?.click();
      }
      var btnInf = e.target.closest("button[aria-label=\"Informar viajantes\"]");
      if (btnInf) {
        var url = new URL(window.location.href);
        url.searchParams.set("utm_ci", "subtotal-informar-viajantes-novo");
        history.replaceState(null, "", url);
        document
          .querySelector(".transactional-navigation .ContainerPrice__overview button[aria-label=\"Informar viajantes\"]")
          ?.click();
      }
    });

    return wrap;
  }

  // utm no nativo Informar viajantes
  function bindNativeInformar() {
    var orig = document.querySelector(
      ".transactional-navigation .ContainerPrice__overview button[aria-label=\"Informar viajantes\"]"
    );
    if (orig && !orig.hasAttribute("data-utm-bound")) {
      orig.setAttribute("data-utm-bound", "true");
      orig.addEventListener("click", function() {
        var url = new URL(window.location.href);
        url.searchParams.set("utm_ci", "subtotal-informar-viajantes-nativo");
        history.replaceState(null, "", url);
      });
    }
  }

  // Inicializa SPA hook e primeira checagem
  hookHistory();
  onUrlChange();
})();
