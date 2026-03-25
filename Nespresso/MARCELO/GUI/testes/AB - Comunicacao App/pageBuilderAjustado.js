(function () {
  // Flag para garantir que o código será executado apenas uma vez
  if (window.pageBuilderExecuted_fa2efb73) {
    return; // Se já foi executado, retorna imediatamente
  }

  // Define o flag indicando que o código foi executado
  window.pageBuilderExecuted_fa2efb73 = true;

  // Função para adicionar elementos ao DOM de forma segura
  function appendToDOM() {
    // 1. Criar a div principal
    const divElement = document.createElement("div");
    divElement.id = "page-builder-fa2efb73-80d2-e449-904c-6d8319bdbe77";
    divElement.className = "page-builder-fa2efb73-80d2-e449-904c-6d8319bdbe77";
    document.body.appendChild(divElement);

    // 2. Adicionar o estilo CSS
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent =
      ".page-builder-fa2efb73-80d2-e449-904c-6d8319bdbe77:not(:empty) {min-height: 64px} @media(min-width:768px){.page-builder-fa2efb73-80d2-e449-904c-6d8319bdbe77:not(:empty){min-height: 64px}}";
    document.head.appendChild(styleElement);

    // 3. Adicionar o script com dados JSON
    const jsonData = {
      id: "page-builder-fa2efb73-80d2-e449-904c-6d8319bdbe77",
      version: "latest",
      created: "",
      name: "appversao1 (Copy) (Copy)",
      preload: {
        "nb-app-banner": {
          style:
            "/shared_res/agility/next-components/app-banner/v1.1/css/app-banner.css?1.1.2",
          modern:
            "/shared_res/agility/next-components/app-banner/v1.1/index.es.min.js?1.1.2",
          deps: ["nb-foundations"],
        },
        "nb-foundations": {
          style:
            "/shared_res/agility/next-components/foundations/v1.1/css/foundations.css?1.1.1",
          modern:
            "/shared_res/agility/next-components/foundations/v1.1/index.es.min.js?1.1.1",
        },
      },
      options: {
        onlyOriginal: false,
        onlyVertuo: false,
        onlyPro: false,
        onlyXFCards: false,
        excludeIE: false,
        advanceMode: false,
        advanceModeAT: false,
        advanceUnMinifyMode: false,
        exportId: "ProductDetails",
        exportIdVL: "next-v1-vertuo",
        exportIdOL: "next-v1-original",
        exportIdPro: "next-v1-pro",
        exportIdXFCards: "next-v1-xf",
      },
      components: [
        {
          uuid: "nb-app-banner-5f7d0635-2473-c06c-6c62-f1ccf9754333",
          module: "nb-app-banner",
          tag: "nb-app-banner",
          folder: "/shared_res/agility/next-components/app-banner/",
          version: "1.1.2",
          minHeight: "64",
          minHeightMobile: "64",
          variations: [
            {
              index: 0,
              properties: {
                copywriting: {
                  banner_a11y: "App Nespresso",
                  heading:
                    "<SMALL>Garanta 10% OFF na Primeira compra no APP com o cupom BOASVINDASAPP*</small>",
                  first_line: "",
                  second_line_apple:
                    " <SMALL>BAIXE AGORA! (*Confira condições) </SMALL>",
                  second_line_android:
                    "<SMALL>BAIXE AGORA! (*Confira condições) </SMALL>",
                  second_line_huawei:
                    "<SMALL>BAIXE AGORA! (*Confira condições) </SMALL>",
                  label_close: "Fechar",
                  label_link: "Download Nespresso App",
                },
                campaign: {
                  id: "br-b2c-downloadapp-2025",
                  name: "br-b2c-downloadapp-2025",
                  creative: "br-b2c-downloadapp-2025",
                  position: "before_app_banner",
                },
              },
              personalisation: null,
            },
          ],
        },
      ],
    };

    const scriptJsonElement = document.createElement("script");
    scriptJsonElement.id =
      "page-builder-data-fa2efb73-80d2-e449-904c-6d8319bdbe77";
    scriptJsonElement.type = "application/json";
    scriptJsonElement.textContent = JSON.stringify(jsonData);
    document.body.appendChild(scriptJsonElement);

    // 4. Inicializar o objeto nwc e adicionar projeto
    window.nwc = window.nwc || {};
    window.nwc.projects = window.nwc.projects || [];
    window.nwc.projects.push(jsonData);

    // 5. Carregar o script nwc.min.js
    const nwcScript = document.createElement("script");
    nwcScript.src = "/shared_res/agility/page-builder/assets/js/nwc.min.js";
    nwcScript.onload = function () {
      if (window.nwc && typeof window.nwc.ready === "function") {
        window.nwc.ready();
      }
    };
    document.body.appendChild(nwcScript);
  }

  // Verificar se o DOM já está carregado
  if (document.readyState === "loading") {
    // Se o DOM ainda está carregando, esperar pelo evento DOMContentLoaded
    document.addEventListener("DOMContentLoaded", appendToDOM);
  } else {
    // Se o DOM já está carregado, executar imediatamente
    appendToDOM();
  }
})();
