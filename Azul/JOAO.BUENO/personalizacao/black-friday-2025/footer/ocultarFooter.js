(function () {
  // Função para ocultar as tabs do footer
  function hideFooterTabs() {
    // Buscar o footer
    const footer = document.querySelector('footer.footer');

    if (!footer) {
      return;
    }

    // Subir até encontrar a div pai que tem a classe aem-GridColumn--default--12
    let parentDiv = footer.parentElement;
    while (parentDiv && !parentDiv.classList.contains('aem-GridColumn--default--12')) {
      parentDiv = parentDiv.parentElement;
    }

    if (!parentDiv) {
      return;
    }

    // Verificar se já foi processado
    if (parentDiv.hasAttribute('data-footer-processed')) {
      return;
    }

    // Ocultar todos os filhos exceto o footer
    const children = Array.from(parentDiv.children);
    let hiddenCount = 0;

    children.forEach((child) => {
      // Se não for o footer, ocultar
      if (child.tagName !== 'FOOTER') {
        child.style.setProperty('display', 'none', 'important');
        hiddenCount++;
      }
    });

    // Marcar como processado
    parentDiv.setAttribute('data-footer-processed', 'true');

    if (hiddenCount > 0) {
      console.log(
        ` ${hiddenCount} elemento(s) do footer ocultado(s), mantendo apenas o footer final`
      );
    }
  }

  // Função para aplicar a ocultação
  function applyFooterHiding() {
    hideFooterTabs();
  }

  // Função para inicializar
  function init() {
    // Executar imediatamente
    applyFooterHiding();

    // Usar MutationObserver para detectar quando o footer é adicionado/modificado
    const observer = new MutationObserver(() => {
      applyFooterHiding();
    });

    // Observar mudanças no body para quando o footer for adicionado
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
