(() => {
  "use strict";

  // ===== Config =====
  const TARGET_LABELS = ["Diversão e Ingressos", "Ingressos e Passeios"]; // rótulos nativos
  const TRACK_ONLY_TARGET = true; // true = só o botão nativo; false = todos os cards

  const norm = (t) => (t || "").replace(/\s+/g, " ").trim();

  function fireAA(ctaName) {
    try {
      var s =
        window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
      if (!s || typeof s.tl !== "function") return;
      s.linkTrackVars = "events,eVar82";
      s.linkTrackEvents = "event90";
      s.events = "event90";
      s.eVar82 = "AT_rotulagem_click: " + ctaName || "Desconhecido";
      s.tl(true, "o", "target_activity_action");
    } catch (e) {
      /* no-op */
    }
  }

  // P preferencial (título do card)
  function findLabelNode(btnEl) {
    const ps = Array.from(btnEl.querySelectorAll("p"));
    if (!ps.length) return null;

    // 1) palavras-chave do bloco
    const byKeyword = ps.find((p) =>
      /Ingressos|Passeios|Divers[aã]o|Tickets|Tours/i.test(norm(p.textContent))
    );
    if (byKeyword) return byKeyword;

    // 2) fallback: último <p> (geralmente o rótulo)
    return ps[ps.length - 1];
  }

  function shouldTrack(label) {
    if (!TRACK_ONLY_TARGET) return true;
    return TARGET_LABELS.map(norm).includes(norm(label));
  }

  function bindTracking(root = document) {
    const btns = root.querySelectorAll('div[role="button"]');
    btns.forEach((btn) => {
      if (btn.dataset.azAaBound) return;

      const p = findLabelNode(btn);
      if (!p) return;

      const label = norm(p.textContent);
      if (!shouldTrack(label)) return;

      btn.dataset.azAaBound = "1";
      btn.dataset.azCtaLabel = label;

      btn.addEventListener(
        "click",
        () => {
          const pNow = findLabelNode(btn);
          const labelNow = norm(
            (pNow && pNow.textContent) || btn.dataset.azCtaLabel || ""
          );
          fireAA(labelNow);
        },
        true
      );
    });
  }

  // ===== Reaplicação automática (SPA + modal) =====
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      bindTracking(document);
    });
  };

  const obs = new MutationObserver(schedule);
  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  (function hookHistory() {
    const P = history.pushState,
      R = history.replaceState;
    history.pushState = function () {
      const r = P.apply(this, arguments);
      schedule();
      return r;
    };
    history.replaceState = function () {
      const r = R.apply(this, arguments);
      schedule();
      return r;
    };
    window.addEventListener("popstate", schedule);
  })();

  // Primeira execução
  schedule();
})();
