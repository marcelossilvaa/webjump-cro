(function () {
  "use strict";

  // —————————— 1) CONFIGURAÇÃO ——————————
  const ALL_OPTIONS = [
    "Mais cedo",
    "Menor preço",
    "Maior preço",
    "Mais rápido",
    "Mais tarde",
    "Voo direto",
    "Duração",
  ];
  const KEY_STEPS = {
    "Mais cedo": 0,
    "Menor preço": 1,
    "Maior preço": 2,
    "Mais rápido": 3,
    "Mais tarde": 4,
    "Voo direto": 5,
    Duração: 6,
  };
  const PRIMARY = ["Menor preço", "Mais cedo", "Mais tarde", "Maior preço"];
  const SECONDARY = ALL_OPTIONS.filter((o) => !PRIMARY.includes(o));

  const SELECTORS = {
    wrapper: ".sort-filter",
    label: ".filter-label",
    nativeDropdown: ".css-2b097c-container",
    nativeInput: "#sort-filter",
  };

  const SVG_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">' +
    '<path d="M12 15l-3.464-4.5h6.928L12 15z"/>' +
    "</svg>";

  // —————————— 2) UTILITÁRIOS ——————————

  function simulateKey(el, key) {
    const code = key === "Enter" ? 13 : 40;
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        code: key,
        keyCode: code,
        which: code,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  // Aplica filtro: useSteps = true para usar KEY_STEPS, false para delta normal
  function applyFilter(wrapper, label, useSteps = false) {
    const input = wrapper.querySelector(SELECTORS.nativeInput);
    if (!input) return;
    input.focus();
    simulateKey(input, "ArrowDown");

    setTimeout(() => {
      if (useSteps) {
        const steps = KEY_STEPS[label] || 0;
        for (let i = 0; i < steps; i++) simulateKey(input, "ArrowDown");
      } else {
        const current = wrapper
          .querySelector(".css-pdoeiw-singleValue")
          ?.textContent.trim();
        const curIdx = ALL_OPTIONS.indexOf(current);
        const tgtIdx = ALL_OPTIONS.indexOf(label);
        const delta = tgtIdx - (curIdx >= 0 ? curIdx : -1);
        const dir = delta > 0 ? "ArrowDown" : "ArrowUp";
        for (let i = 0; i < Math.abs(delta); i++) simulateKey(input, dir);
      }
      simulateKey(input, "Enter");

      const bar = wrapper.querySelector(".azul-sort-button-bar");
      if (bar) {
        bar
          .querySelectorAll(".azul-sort-btn")
          .forEach((b) => b.classList.remove("active"));
        const btn = Array.from(bar.children).find(
          (b) => b.textContent === label
        );
        if (btn) btn.classList.add("active");
      }
    }, 150);
  }

  // —————————— 3) INJEÇÃO DE CSS ——————————

  function injectCSS() {
    const style = document.createElement("style");
    let css =
      SELECTORS.wrapper +
      " { display:inline-flex!important; align-items:center; flex-wrap:nowrap; }" +
      SELECTORS.label +
      " { margin-right:8px; white-space:nowrap; }";
    css += `
    .azul-sort-button-bar {
      display: inline-flex;
      flex-wrap: nowrap;
      gap: 6px;
      vertical-align: middle;
      width: max-content;
    }
    .azul-sort-btn {
      -webkit-box-align: center;
      align-items: center;
      background-color: #fff;
      border-color: rgb(204, 204, 204);
      border-radius: 32px;
      border-style: solid;
      border-width: 1px;
      font-weight: bolder;
      box-shadow: rgba(31, 41, 61, 0.16) -1px 2px 4px;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      min-height: 32px;
      outline: none;
      transition: 100ms;
      box-sizing: border-box;
      padding: 0 16px;
      white-space: nowrap;
      font-size: 13px;
      color: rgb(2, 108, 182);
    }
    .azul-sort-btn.active {
      background-color: rgb(2, 108, 182);
      color: #fff;
    }
    .ver-mais-btn {
      padding-right: 12px;
      border-color: rgb(204, 204, 204);
    }
    .ver-mais-btn svg path {
      fill: rgb(2, 108, 182);
    }
    .ver-mais-btn svg {
      margin-left: 4px;
      transition: transform 0.2s ease;
    }
    .ver-mais-btn.active svg {
      transform: rotate(180deg);
    }
    .ver-mais-btn.active svg path {
      fill: rgb(255, 255, 255);
    }
    .azul-sort-custom-dropdown {
      position: absolute;
      top: 100%;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      border-radius: 4px;
      z-index: 1000;
    }
    .azul-sort-custom-dropdown ul {
      list-style: none;
      margin: 0;
      padding: 4px 0;
    }
    .azul-sort-custom-dropdown li {
      padding: 8px 12px;
      cursor: pointer;
      white-space: nowrap;
      color: #606060;
    }
    .azul-sort-custom-dropdown li:hover {
      background: rgba(17, 41, 76, 0.05);
    }
  `;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // —————————— 4) INJEÇÃO DO COMPONENTE ——————————

  function injectComponent() {
    document.querySelectorAll(SELECTORS.wrapper).forEach((wrapper) => {
      if (wrapper.dataset.azulDone) return;
      wrapper.dataset.azulDone = "1";
      wrapper.style.position = "relative";

      // esconde dropdown nativo
      const ddNative = wrapper.querySelector(SELECTORS.nativeDropdown);
      if (ddNative) ddNative.style.display = "none";

      // cria barra
      const bar = document.createElement("div");
      bar.className = "azul-sort-button-bar";

      PRIMARY.forEach((txt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "azul-sort-btn";
        btn.textContent = txt;
        btn.addEventListener("click", () => applyFilter(wrapper, txt, false));
        bar.appendChild(btn);
      });

      // Ver mais
      const more = document.createElement("button");
      more.type = "button";
      more.className = "azul-sort-btn ver-mais-btn";
      more.innerHTML = "Ver mais " + SVG_ICON;
      bar.appendChild(more);

      // ** dropdown custom secundário **
      const dd = document.createElement("div");
      dd.className = "azul-sort-custom-dropdown";
      dd.style.display = "none";
      const ul = document.createElement("ul");
      for (const opt of SECONDARY) {
        const li = document.createElement("li");
        li.dataset.value = opt;
        li.textContent = opt;
        ul.appendChild(li);
      }
      dd.appendChild(ul);
      wrapper.appendChild(dd);

      // handlers do Ver mais
      more.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dd.style.display === "block";
        if (isOpen) {
          dd.style.display = "none";
          more.classList.remove("active");
        } else {
          dd.style.left = more.offsetLeft + "px";
          dd.style.display = "block";
          bar
            .querySelectorAll(".azul-sort-btn")
            .forEach((b) => b.classList.remove("active"));
          more.classList.add("active");
        }
      });

      ul.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
          const val = e.target.dataset.value;
          applyFilter(wrapper, val, false);
          dd.style.display = "none";
          bar
            .querySelectorAll(".azul-sort-btn")
            .forEach((b) => b.classList.remove("active"));
          more.classList.add("active");
        }
      });

      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          dd.style.display = "none";
          more.classList.remove("active");
        }
      });

      // insere após label
      const labelEl = wrapper.querySelector(SELECTORS.label);
      if (labelEl) labelEl.parentNode.insertBefore(bar, labelEl.nextSibling);

      // aplicação automática: Menor preço com KEY_STEPS
      applyFilter(wrapper, "Menor preço", true);
    });
  }

  // —————————— 5) STARTUP ——————————
  injectCSS();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectComponent);
  } else {
    injectComponent();
  }
  new MutationObserver(injectComponent).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
