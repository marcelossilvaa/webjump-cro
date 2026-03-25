(function () {
    //LÓGICA PARA FLAG UTM CI

    const targetUrl = "/home/review";
    function appendUtmToUrl(urlString) {
      try {
        var urlObj = new URL(urlString, window.location.origin);
        if (urlObj.pathname.indexOf(targetUrl) !== -1 && !urlObj.searchParams.has("utm_ci")) {
          const flagUtm = "avancou_seguro_seguro_nativo";
          urlObj.searchParams.set("utm_ci", flagUtm);
        }
        return urlObj.pathname + urlObj.search + urlObj.hash;
      } catch (e) {
        return urlString;
      }
    }
  
    // Monkey patching de history.pushState e history.replaceState
    (function () {
      var origPush = history.pushState;
      history.pushState = function (state, title, url) {
        if (typeof url === "string" && url.indexOf(targetUrl) !== -1) {
          arguments[2] = appendUtmToUrl(url);
        }
        return origPush.apply(this, arguments);
      };
  
      var origReplace = history.replaceState;
      history.replaceState = function (state, title, url) {
        if (typeof url === "string" && url.indexOf(targetUrl) !== -1) {
          arguments[2] = appendUtmToUrl(url);
        }
        return origReplace.apply(this, arguments);
      };
    })();
  
    // Listener para popstate (casos em que a URL muda sem pushState/replaceState)
    window.addEventListener("popstate", function () {
      var href = window.location.href;
      if (href.indexOf(targetUrl) !== -1 && href.indexOf("utm_ci=") === -1) {
        history.replaceState(null, "", appendUtmToUrl(href));
      }
    });
  })();