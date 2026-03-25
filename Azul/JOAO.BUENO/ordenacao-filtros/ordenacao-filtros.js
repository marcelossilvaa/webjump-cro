(function () {
  // 1) CONFIGURAÇÃO
  const ALL_OPTIONS = [
    "Mais cedo",
    "Menor preço",
    "Maior preço",
    "Mais rápido",
    "Mais tarde",
    "Voo direto",
    "Duração",
  ];
  const PRIMARY = ["Menor preço", "Mais cedo", "Mais tarde", "Maior preço"];
  const SECONDARY = ALL_OPTIONS.filter((o) => !PRIMARY.includes(o));
  const WRAPPER_SEL = ".sort-filter";
  const LABEL_SEL = ".filter-label";
  const DROPDOWN_SEL = ".css-2b097c-container";
  const INPUT_SEL = "#sort-filter";

  // 2) SVG para o botão "Ver mais"
  const SVG_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">' +
    '<path d="M12 15l-3.464-4.5h6.928L12 15z"/>' +
    "</svg>";

  // 3) dispara keydown para o React-Select
  function simulateKey(el, key) {
    const code = key === "Enter" ? 13 : 40;
    const ev = new KeyboardEvent("keydown", {
      key,
      code: key,
      keyCode: code,
      which: code,
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(ev);
  }

  // 4) aplicar filtro calculando delta entre current e target
  function applyFilter(wrapper, label) {
    const input = wrapper.querySelector(INPUT_SEL);
    if (!input) return console.warn("Toggle não encontrado");
    const currentLabel = wrapper
      .querySelector(".css-pdoeiw-singleValue")
      ?.textContent.trim();
    const currentIdx = ALL_OPTIONS.indexOf(currentLabel);
    const targetIdx = ALL_OPTIONS.indexOf(label);
    if (targetIdx < 0) return console.warn("Filtro inválido:", label);

    // abre menu
    input.focus();
    simulateKey(input, "ArrowDown");

    // navega até a opção certa
    setTimeout(() => {
      const delta = targetIdx - (currentIdx >= 0 ? currentIdx : -1);
      const dir = delta > 0 ? "ArrowDown" : "ArrowUp";
      for (let i = 0; i < Math.abs(delta); i++) {
        simulateKey(input, dir);
      }
      simulateKey(input, "Enter");
    }, 150);
  }

  // 5) injeta botões + dropdown custom
  function inject() {
    document.querySelectorAll(WRAPPER_SEL).forEach((wrap) => {
      if (wrap.querySelector(".azul-sort-button-bar")) return;
      wrap.style.position = "relative";

      // oculta o dropdown nativo
      const nativeCtr = wrap.querySelector(DROPDOWN_SEL);
      if (nativeCtr) nativeCtr.style.display = "none";

      const bar = document.createElement("div");
      bar.className = "azul-sort-button-bar";

      // botões principais
      PRIMARY.forEach((txt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "azul-sort-btn";
        btn.textContent = txt;
        btn.addEventListener("click", () => {
          applyFilter(wrap, txt);
          bar
            .querySelectorAll(".azul-sort-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
        bar.appendChild(btn);
      });

      // botão Ver mais
      const more = document.createElement("button");
      more.type = "button";
      more.className = "azul-sort-btn ver-mais-btn";
      more.innerHTML = "Ver mais " + SVG_ICON;
      bar.appendChild(more);

      // dropdown custom
      const dd = document.createElement("div");
      dd.className = "azul-sort-custom-dropdown";
      dd.style.display = "none";
      let html = "<ul>";
      SECONDARY.forEach((o) => {
        html += '<li data-value="' + o + '">' + o + "</li>";
      });
      html += "</ul>";
      dd.innerHTML = html;
      wrap.appendChild(dd);

      // mostra/esconde Ver mais
      more.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = dd.style.display === "block";
        dd.style.left = more.offsetLeft + "px";
        dd.style.display = open ? "none" : "block";
        bar
          .querySelectorAll(".azul-sort-btn")
          .forEach((b) => b.classList.remove("active"));
        more.classList.add("active");
      });

      // clique nas opções secundárias
      dd.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", () => {
          const val = li.getAttribute("data-value");
          applyFilter(wrap, val);
          dd.style.display = "none";
          bar
            .querySelectorAll(".azul-sort-btn")
            .forEach((b) => b.classList.remove("active"));
          more.classList.add("active");
        });
      });

      // fecha ao clicar fora
      document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) {
          dd.style.display = "none";
          more.classList.remove("active");
        }
      });

      // insere após o label
      const labelEl = wrap.querySelector(LABEL_SEL);
      if (labelEl) labelEl.parentNode.insertBefore(bar, labelEl.nextSibling);

      // destaca inicial
      const init = wrap
        .querySelector(".css-pdoeiw-singleValue")
        ?.textContent.trim();
      const act = Array.from(bar.children).find((b) => b.textContent === init);
      if (act) act.classList.add("active");
    });
  }

  // 6) CSS: apenas wrapper e label por concatenação
  var style = document.createElement("style");
  var css =
    WRAPPER_SEL +
    " { display: inline-flex !important; align-items: center; flex-wrap: nowrap; }" +
    LABEL_SEL +
    " { margin-right: 8px; white-space: nowrap; }";
  // o restante do CSS pode permanecer em um único template literal
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
      color: rgb(2, 108, 182);
    }
    .azul-sort-custom-dropdown li:hover {
      background: rgba(17, 41, 76, 0.05);
    }
  `;
  style.textContent = css;
  document.head.appendChild(style);

  // 7) inicializa + observa re-renders
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
  new MutationObserver(inject).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
