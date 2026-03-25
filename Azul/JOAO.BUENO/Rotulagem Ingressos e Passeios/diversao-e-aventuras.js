(() => {
  "use strict";

  // ===== Config =====
  const FROM_LABELS = ["Diversão e Ingressos", "Ingressos e Passeios"];
  const TO_LABEL = "Diversão e Aventuras";
  const KNOWN_LABELS = [
    "Voos",
    "Hotéis",
    "Carros",
    "Voos + Hotel",
    "Cruzeiro",
    ...FROM_LABELS,
    TO_LABEL,
  ];

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
    } catch (e) {}
  }

  // Localiza o P que é o rótulo do CTA dentro do card
  function findLabelNode(btnEl) {
    const ps = Array.from(btnEl.querySelectorAll("p"));
    if (!ps.length) return null;

    // 1) preferir P cujo texto bata com rótulos conhecidos
    for (const p of ps) {
      const txt = norm(p.textContent);
      if (KNOWN_LABELS.some((k) => norm(k) === txt)) return p;
    }
    // 2) fallback: P com palavras-chave do bloco
    for (const p of ps) {
      const txt = norm(p.textContent);
      if (/Ingressos|Passeios|Divers[aã]o|Tickets|Tours/i.test(txt)) return p;
    }
    // 3) último recurso: o último P (geralmente título)
    return ps[ps.length - 1];
  }

  function updateAriaLabel(btn, fromList, toText) {
    const aria = btn.getAttribute("aria-label");
    if (!aria) return;
    let updated = aria;
    fromList.forEach((old) => {
      updated = updated.replace(old, toText);
    });
    if (updated !== aria) btn.setAttribute("aria-label", updated);
  }

  function processTiles(root = document) {
    let changes = 0;
    const btns = root.querySelectorAll('div[role="button"]');
    btns.forEach((btn) => {
      const labelNode = findLabelNode(btn);
      if (!labelNode) return;

      const current = norm(labelNode.textContent);

      // Troca de copy (cobre as duas versões)
      if (FROM_LABELS.map(norm).includes(current)) {
        labelNode.textContent = TO_LABEL;
        updateAriaLabel(btn, FROM_LABELS, TO_LABEL);
        btn.dataset.azCtaLabel = TO_LABEL;
        changes++;
      } else {
        // Mesmo quando não troca, garantimos o dataset com o rótulo atual
        btn.dataset.azCtaLabel = current;
      }

      // Bind AA apenas uma vez
      if (!btn.dataset.azAaBound) {
        btn.dataset.azAaBound = "1";
        btn.addEventListener(
          "click",
          () => {
            // Prioriza o que já foi salvo após a troca
            let label = norm(btn.dataset.azCtaLabel || "");
            if (!label) {
              const p = findLabelNode(btn);
              label = norm(p && p.textContent);
            }
            fireAA(label);
          },
          true
        );
      }
    });
    return changes;
  }

  // Reaplicação automática (SPA + modal)
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      processTiles(document);
    });
  };

  // Observer para abertura de modal e mudanças de DOM
  const obs = new MutationObserver(schedule);
  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  // Hook de navegação SPA
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
