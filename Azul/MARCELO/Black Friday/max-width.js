(function () {
  // Função para aplicar max-width nos containers
  function applyMaxWidth() {
    // Buscar todos os elementos com a classe css-oo7lgl
    const containers = document.querySelectorAll('.css-oo7lgl');

    if (containers.length === 0) {
      return;
    }

    let styledCount = 0;
    containers.forEach((container) => {
      // Verificar se já foi estilizado
      if (!container.hasAttribute('data-max-width-applied')) {
        container.style.setProperty('max-width', '1200px', 'important');
        container.setAttribute('data-max-width-applied', 'true');
        styledCount++;
      }
    });

    if (styledCount > 0) {
      console.log(`✅ Max-width de 1200px aplicado em ${styledCount} container(s)`);
    }
  }

  // Função para aplicar estilos na classe css-n5cxq4
  function applyCssN5cxq4Styles() {
    // Buscar todos os elementos com a classe css-n5cxq4
    const elements = document.querySelectorAll('.css-n5cxq4');

    if (elements.length === 0) {
      return;
    }

    let styledCount = 0;
    elements.forEach((element) => {
      // Verificar se já foi estilizado
      if (!element.hasAttribute('data-css-n5cxq4-styled')) {
        element.style.setProperty('max-width', '1200px', 'important');
        element.style.setProperty('width', '100%', 'important');
        element.setAttribute('data-css-n5cxq4-styled', 'true');
        styledCount++;
      }
    });

    if (styledCount > 0) {
      console.log(`✅ Estilos aplicados em ${styledCount} elemento(s) .css-n5cxq4`);
    }
  }

  // Função para inicializar
  function init() {
    // Executar imediatamente
    applyMaxWidth();
    applyCssN5cxq4Styles();

    // Usar MutationObserver para detectar quando novos elementos são adicionados
    const observer = new MutationObserver(() => {
      applyMaxWidth();
      applyCssN5cxq4Styles();
    });

    // Observar mudanças no body
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
