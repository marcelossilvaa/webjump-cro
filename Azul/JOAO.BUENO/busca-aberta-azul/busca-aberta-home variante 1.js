(() => {
  // 1) Aguarda DOM pronto
  const onReady = (fn) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  onReady(() => {
    // —————————————
    // (a) Esconde o botão original "Para onde vamos viajar?"
    // —————————————
    const triggerInput = document.querySelector('input[aria-label="Para onde vamos viajar?"]');
    if (triggerInput) {
      const label = triggerInput.closest('label');
      if (label) label.style.display = 'none';
    }

    // —————————————
    // (b) Localiza o nó de busca do modal e seu container para esconder depois
    // —————————————
    const searchNode = document.querySelector('.sc-45c99f99-0.kOAKak');
    if (!searchNode) {
      console.warn('[AT] nó de busca não encontrado: .sc-45c99f99-0.kOAKak');
      return;
    }
    // Encontra o wrapper completo do modal (aquele que contém <header> para o “X”)
    const findModalContainer = (el) => {
      let cur = el.parentElement;
      while (cur) {
        if (cur.querySelector('header')) return cur;
        cur = cur.parentElement;
      }
      return null;
    };
    const fullModalContainer = findModalContainer(searchNode);
    if (fullModalContainer) {
      fullModalContainer.style.display = 'none';
    }

    // Remove atributos que reabririam o modal original
    if (triggerInput) {
      triggerInput.removeAttribute('onclick');
      triggerInput.removeAttribute('data-toggle');
      triggerInput.removeAttribute('data-target');
    }

    // —————————————
    // (c) Cria wrappers para mover searchNode sem perder event listeners
    // —————————————
    const outerWrapper = document.createElement('div');
    outerWrapper.className = 'injected-search-outer';
    Object.assign(outerWrapper.style, {
      width: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      position: 'relative',
      marginTop: '1rem',
      paddingLeft: '0',
      paddingRight: '0',
    });

    const innerWrapper = document.createElement('div');
    innerWrapper.className = 'injected-search-inner';
    Object.assign(innerWrapper.style, {
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'visible',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
    });

    innerWrapper.appendChild(searchNode);
    outerWrapper.appendChild(innerWrapper);

    // —————————————
    // (d) LOCALIZAR O “homeWrapper” USANDO XPATH NO TEXTO FIXO
    // —————————————
    // Em vez de document.querySelector('.sc-kpDqfm.qehAq.sc-13e37337-2.kQkHjY'),
    // vamos achar o <p> pelo texto “Reserve suas passagens aéreas…” e subir para o pai.
    const xpath = "//p[contains(., 'Reserve suas passagens aéreas')]";
    const titlePara = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    const homeWrapper = titlePara ? titlePara.parentElement : null;
    if (!homeWrapper) {
      console.warn('[AT] não encontrou o container da home via XPath');
      return;
    }
    homeWrapper.insertAdjacentElement('afterend', outerWrapper);

    // —————————————
    // (e) Injeta o CSS para corrigir o overflow e comportamento das abas
    // —————————————
    const css = `
      .injected-search-outer { overflow-x: hidden !important; }

      /* garante full-width e layout flex na coluna */
      .injected-search-inner {
        width: 100% !important;
        overflow-x: visible !important;
        display: flex !important;
        flex-direction: column !important;
        flex-wrap: nowrap !important;
      }

      .injected-search-inner .sc-b46dc710-5.gycHfo,
      .injected-search-inner .sc-13e37337-5.jWLomW {
        display: flex !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        white-space: nowrap !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 0 1rem !important;
        margin-bottom: 0.5rem !important;
        gap: 0px;
      }
      .injected-search-inner .sc-b46dc710-5.gycHfo > *,
      .injected-search-inner .sc-13e37337-5.jWLomW > * {
        flex: 0 0 auto !important;
        margin-right: 0.5rem !important;
      }

      /* Inputs Origem/Destino/ Datas full width */
      .injected-search-inner .sc-b46dc710-6.jtdBYG {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
      }
      .injected-search-inner .sc-b46dc710-6.jtdBYG .sc-b46dc710-8.cMlFVy {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
      }
      .injected-search-inner input.sc-WbMKh {
        width: 100% !important;
        box-sizing: border-box !important;
      }

      /* Ajustes adicionais */
      .injected-search-inner .sc-hBeSQo.koiaoR {
        width: 100% !important;
        overflow-x: hidden !important;
      }
      .injected-search-inner .sc-hBeSQo.koiaoR .sc-dKaeOA.kqKWim {
        display: flex !important;
        flex-wrap: wrap !important;
        overflow-x: visible !important;
      }
      .injected-search-inner * {
        overflow: visible !important;
        max-width: none !important;
        max-height: none !important;
        box-sizing: border-box !important;
      }
      .injected-search-inner .sc-cQXCZA.dTbBzN {
        overflow: visible !important;
      }
      .eBjMoV { display: none !important; }
    `;
    const styleTag = document.createElement('style');
    styleTag.appendChild(document.createTextNode(css));
    document.head.appendChild(styleTag);
  });
})();
