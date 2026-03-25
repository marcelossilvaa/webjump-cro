/**
 * Script para substituir banners hero desktop e mobile
 * Usa media queries para detectar dispositivo e substituir imagens apropriadas
 * Aguarda o Adobe Target aplicar a imagem antes de substituir
 */

(function () {
  "use strict";

  // URLs das novas imagens
  const novaImagemDesktop =
    "https://www.nespresso.com/ecom/medias/sys_master/public/46588624699422/Main-Banner-Desk-v2-1-.jpg?attachment=true&cimgnr=HYGiy";
  const novaImagemMobile =
    "https://www.nespresso.com/ecom/medias/sys_master/public/46588624535582/Main-Banner-Mobile-v2.jpg?attachment=true&cimgnr=oMuaJ";

  // URL original desktop para verificação
  const urlOriginalDesktop = "soft-launch_d_2x.jpg";

  // Flag para controlar se já substituiu
  let substituidoDesktop = false;
  let substituidoMobile = false;

  // ID único para o style tag
  const styleTagId = "nespresso-banner-replacement-style";

  /**
   * Cria ou atualiza um style tag com a URL da imagem
   */
  function criarStyleTagDinamico(url) {
    let styleTag = document.getElementById(styleTagId);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleTagId;
      document.head.appendChild(styleTag);
    }

    // Cria uma classe CSS com a imagem
    const css =
      ".cb-bg-img {\n" +
      '    background-image: url("' +
      url +
      '") !important;\n' +
      "}";

    styleTag.textContent = css;
  }

  /**
   * Verifica se é desktop usando media query
   */
  function isDesktop() {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  /**
   * Extrai URL do background-image de uma string de estilo
   */
  function extrairUrlBackgroundImage(styleString) {
    if (!styleString) return null;
    const match = styleString.match(
      /background-image:\s*url\(["']?([^"')]+)["']?\)/i
    );
    return match ? match[1] : null;
  }

  /**
   * Aplica background-image usando múltiplas abordagens para garantir compatibilidade
   * Usa diferentes formatos de URL para garantir que funcione no Adobe Target
   */
  function aplicarBackgroundImage(elemento, url) {
    // Garante que a URL está correta (sem problemas de encoding)
    const urlEscapada = url.replace(/"/g, "&quot;");
    const urlFormatada1 = 'url("' + url + '")';
    const urlFormatada2 = "url('" + url + "')";
    const urlFormatada3 = "url(" + url + ")";

    // Método 1: Usar setProperty com !important (mais confiável)
    try {
      elemento.style.setProperty(
        "background-image",
        urlFormatada1,
        "important"
      );
    } catch (e) {
      try {
        elemento.style.setProperty(
          "background-image",
          urlFormatada2,
          "important"
        );
      } catch (e2) {
        elemento.style.setProperty(
          "background-image",
          urlFormatada3,
          "important"
        );
      }
    }

    // Método 2: Usar style.backgroundImage diretamente (com aspas na URL)
    elemento.style.backgroundImage = urlFormatada1;

    // Método 3: Usar setAttribute no style completo (força atualização)
    // Primeiro, limpa o style atual removendo background-image existente
    const styleAtual = elemento.getAttribute("style") || "";
    const styleLimpo = styleAtual
      .replace(/background-image\s*:\s*[^;]+;?/gi, "")
      .replace(/backgroundImage\s*:\s*[^;]+;?/gi, "")
      .trim();

    // Adiciona o novo background-image com !important
    const novoStyle = styleLimpo
      ? styleLimpo + "; background-image: " + urlFormatada1 + " !important;"
      : "background-image: " + urlFormatada1 + " !important;";

    elemento.setAttribute("style", novoStyle);

    // Método 4: Forçar reflow para garantir que o navegador aplique
    void elemento.offsetHeight;

    // Método 5: Verificar se foi aplicado e tentar novamente se necessário
    setTimeout(function () {
      const computed = window.getComputedStyle(elemento).backgroundImage;
      if (
        !computed ||
        computed === "none" ||
        computed === 'url("")' ||
        computed === "url('')" ||
        computed === "url()"
      ) {
        // Se não foi aplicado, tenta novamente com setAttribute direto
        elemento.style.cssText =
          (elemento.style.cssText || "") +
          "; background-image: " +
          urlFormatada1 +
          " !important;";
      }
    }, 100);
  }

  /**
   * Função para substituir banner desktop
   * Verifica tanto o style inline quanto o computed style
   */
  function substituirBannerDesktop() {
    // Se já substituiu, não faz nada
    if (substituidoDesktop) {
      return true;
    }

    const bannerDesktop = document.querySelector(".cb-bg-img");

    if (!bannerDesktop) {
      return false;
    }

    // Verifica o style inline (atributo style)
    const inlineStyle = bannerDesktop.getAttribute("style") || "";
    const urlInline = extrairUrlBackgroundImage(inlineStyle);

    // Verifica o computed style
    const computedStyle = window.getComputedStyle(bannerDesktop);
    const bgImageComputed = computedStyle.backgroundImage || "";

    // Extrai URL do computed style
    let urlComputed = null;
    if (
      bgImageComputed &&
      bgImageComputed !== "none" &&
      bgImageComputed !== 'url("")' &&
      bgImageComputed !== "url('')" &&
      bgImageComputed !== "url()"
    ) {
      const match = bgImageComputed.match(/url\(["']?([^"')]+)["']?\)/i);
      urlComputed = match ? match[1] : null;
    }

    // Usa a URL do style inline se existir, senão usa a do computed
    const urlAtual = urlInline || urlComputed;

    // Se não tem URL ainda, aguarda o Adobe Target aplicar
    if (!urlAtual) {
      return false;
    }

    // Se tem a imagem original, substitui usando método robusto
    if (urlAtual.includes(urlOriginalDesktop)) {
      // Método 1: Aplica diretamente no elemento
      aplicarBackgroundImage(bannerDesktop, novaImagemDesktop);

      // Método 2: Cria um style tag dinâmico (mais confiável com Adobe Target)
      criarStyleTagDinamico(novaImagemDesktop);

      substituidoDesktop = true;
      return true;
    }

    // Se já tem a nova imagem, marca como substituído
    if (urlAtual.includes(novaImagemDesktop)) {
      substituidoDesktop = true;
      return true;
    }

    return false;
  }

  /**
   * Função para substituir banner mobile
   */
  function substituirBannerMobile() {
    // Se já substituiu, não faz nada
    if (substituidoMobile) {
      return true;
    }

    const bannerMobile = document.querySelector(".nb-hero-banner__image");

    if (!bannerMobile || bannerMobile.tagName !== "IMG") {
      return false;
    }

    // Verifica se o src contém a URL original
    if (bannerMobile.src && bannerMobile.src.includes("soft-launch_m_2x.jpg")) {
      bannerMobile.src = novaImagemMobile;
      substituidoMobile = true;
      return true;
    }

    // Se já tem a nova imagem, marca como substituído
    if (bannerMobile.src && bannerMobile.src.includes(novaImagemMobile)) {
      substituidoMobile = true;
      return true;
    }

    return false;
  }

  /**
   * Função principal para substituir banners baseado no dispositivo
   */
  function substituirBanners() {
    if (isDesktop()) {
      substituirBannerDesktop();
    } else {
      substituirBannerMobile();
    }
  }

  /**
   * Observa especificamente o elemento .cb-bg-img
   * Cria um observer dedicado para este elemento
   */
  function criarObserverBannerDesktop() {
    const bannerDesktop = document.querySelector(".cb-bg-img");

    if (!bannerDesktop) {
      return null;
    }

    // Cria um observer que monitora mudanças no atributo style
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          // Quando o style mudar, aguarda um pouco e tenta substituir
          setTimeout(function () {
            if (!substituidoDesktop) {
              substituirBannerDesktop();
            }
          }, 200);
        }
      });
    });

    // Observa mudanças no atributo style
    observer.observe(bannerDesktop, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return observer;
  }

  /**
   * Observa o elemento mobile
   */
  function criarObserverBannerMobile() {
    const bannerMobile = document.querySelector(".nb-hero-banner__image");

    if (!bannerMobile) {
      return null;
    }

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "src"
        ) {
          setTimeout(function () {
            if (!substituidoMobile) {
              substituirBannerMobile();
            }
          }, 100);
        }
      });
    });

    observer.observe(bannerMobile, {
      attributes: true,
      attributeFilter: ["src"],
    });

    return observer;
  }

  /**
   * Verifica periodicamente até encontrar e substituir os banners
   */
  function verificarPeriodicamente() {
    if (!substituidoDesktop && isDesktop()) {
      substituirBannerDesktop();
    }

    if (!substituidoMobile && !isDesktop()) {
      substituirBannerMobile();
    }
  }

  /**
   * Inicializa observers para os elementos quando forem encontrados
   */
  function inicializarObservers() {
    // Tenta criar observers periodicamente até encontrar os elementos
    let tentativas = 0;
    const maxTentativas = 30;

    const tentarCriarObservers = setInterval(function () {
      tentativas++;

      // Desktop
      if (!substituidoDesktop && isDesktop()) {
        const observerDesktop = criarObserverBannerDesktop();
        if (observerDesktop) {
          // Tenta substituir imediatamente
          setTimeout(function () {
            substituirBannerDesktop();
          }, 100);
        }
      }

      // Mobile
      if (!substituidoMobile && !isDesktop()) {
        const observerMobile = criarObserverBannerMobile();
        if (observerMobile) {
          setTimeout(function () {
            substituirBannerMobile();
          }, 100);
        }
      }

      // Para após max tentativas ou quando ambos foram substituídos
      if (
        tentativas >= maxTentativas ||
        (substituidoDesktop && substituidoMobile)
      ) {
        clearInterval(tentarCriarObservers);
      }
    }, 300);

    // Tenta criar observers imediatamente
    if (isDesktop()) {
      criarObserverBannerDesktop();
    } else {
      criarObserverBannerMobile();
    }
  }

  /**
   * Inicializa o script
   */
  function init() {
    // Inicia verificação periódica (a cada 300ms)
    const intervaloVerificacao = setInterval(function () {
      verificarPeriodicamente();

      // Para quando ambos foram substituídos
      if (substituidoDesktop && substituidoMobile) {
        clearInterval(intervaloVerificacao);
      }
    }, 300);

    // Inicializa observers
    inicializarObservers();

    // Tenta substituir imediatamente
    verificarPeriodicamente();

    // Tenta com delays maiores para dar tempo ao Adobe Target
    setTimeout(verificarPeriodicamente, 500);
    setTimeout(verificarPeriodicamente, 1000);
    setTimeout(verificarPeriodicamente, 1500);
    setTimeout(verificarPeriodicamente, 2000);
    setTimeout(verificarPeriodicamente, 3000);
    setTimeout(verificarPeriodicamente, 4000);
    setTimeout(verificarPeriodicamente, 5000);

    // Observa mudanças de tamanho de tela
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    mediaQuery.addEventListener("change", function () {
      // Reseta flags quando muda de desktop para mobile ou vice-versa
      substituidoDesktop = false;
      substituidoMobile = false;
      verificarPeriodicamente();
      inicializarObservers();
    });

    // Observa mudanças no DOM para novos elementos
    const domObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              if (node.classList && node.classList.contains("cb-bg-img")) {
                criarObserverBannerDesktop();
                setTimeout(function () {
                  substituirBannerDesktop();
                }, 200);
              }
              if (
                node.classList &&
                node.classList.contains("nb-hero-banner__image")
              ) {
                criarObserverBannerMobile();
                setTimeout(function () {
                  substituirBannerMobile();
                }, 200);
              }
            }
          });
        }
      });
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Executa quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM já está pronto
    init();
  }

  // Também executa quando a página terminar de carregar
  window.addEventListener("load", function () {
    setTimeout(verificarPeriodicamente, 500);
    setTimeout(verificarPeriodicamente, 1000);
    setTimeout(verificarPeriodicamente, 2000);
  });
})();
