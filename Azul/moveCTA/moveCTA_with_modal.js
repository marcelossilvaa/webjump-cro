(function () {
  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/payment';
    return currentUrl.includes(targetTestUrl);
  }

  if (window.campaignMoveCTA || !onTargetPage()) {
    return;
  }
  window.campaignMoveCTA = true;

  // Localizar o botão "Prosseguir"
  const botaoProsseguir = document.querySelector('[data-test-id="payment-next-step-btn"]');
  if (!botaoProsseguir) {
    console.log('Botão "Prosseguir" não encontrado.');
    return false;
  }

  // Localizar o elemento "Total a pagar" como âncora
  const totalPagar = Array.from(document.querySelectorAll('p')).find(
    (p) => p.textContent.trim() === 'Total a pagar'
  );

  if (!totalPagar) {
    console.error('Não foi possível encontrar a seção "Total a pagar" para usar como âncora.');
    return false;
  }

  // Encontrar o contêiner pai do "Total a pagar"
  const containerTotalPagar = totalPagar.closest('.sc-b533a5a3-14');
  if (!containerTotalPagar) {
    console.error('Não foi possível encontrar o contêiner do "Total a pagar".');
    return false;
  }

  // Encontrar o contêiner principal do accordion (dstOvo)
  const accordionContainer = containerTotalPagar.closest('.sc-b533a5a3-0');
  if (!accordionContainer) {
    console.error('Não foi possível encontrar o contêiner do accordion.');
    return false;
  }

  // Ajustar border-radius do accordion para ter bordas arredondadas apenas no topo
  accordionContainer.style.borderRadius = '10px 10px 0px 0px';

  // Ajustar border-radius do cabeçalho do accordion (quando fechado)
  const cabecalhoAccordion = accordionContainer.querySelector('.sc-b533a5a3-1');
  if (cabecalhoAccordion) {
    cabecalhoAccordion.style.setProperty('border-radius', '10px 10px 0px 0px', 'important');
  }

  // Remover border-radius do elemento "Total a pagar"
  containerTotalPagar.style.borderRadius = '0';

  // Criar uma nova div para envolver o botão
  const novaDivBotao = document.createElement('div');
  novaDivBotao.style.cssText = `
    background-color: #f8f9fa;
    border: 1px solid rgb(192, 192, 192);
    border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 15px;
    margin-top: 0;
  `;

  // Clonar o botão original
  const botaoClonado = botaoProsseguir.cloneNode(true);
  botaoClonado.style.cssText = `
    width: 100%;
    margin: 0;
    border-radius: 6px;
  `;

  // Adicionar o botão clonado à nova div
  novaDivBotao.appendChild(botaoClonado);

  // Inserir a nova div logo após o contêiner do accordion (próximo ao Total a pagar)
  accordionContainer.insertAdjacentElement('afterend', novaDivBotao);

  // Remover o botão original
  botaoProsseguir.remove();

  // Função para aplicar botão no modal
  function aplicarBotaoNoModal() {
    const modal = document.querySelector('.sc-fifgRP.iwIahJ.sc-94d8ba36-0.bwDWcv');
    if (!modal) return false;

    // Verificar se o botão já foi aplicado no modal
    if (modal.querySelector('[data-test-id="payment-next-step-btn"]')) {
      return true;
    }

    // Localizar o container do "Total a pagar" no modal
    const totalPagarModal = modal.querySelector('.sc-94d8ba36-20.dtvURq');
    if (!totalPagarModal) {
      console.log('Container "Total a pagar" não encontrado no modal.');
      return false;
    }

    // Clonar o botão original para o modal
    const botaoClonadoModal = botaoProsseguir.cloneNode(true);
    botaoClonadoModal.style.cssText = `
      margin: 10px;
      width: 90%;
      border-radius: 6px;
    `;

    // Inserir o botão diretamente após o container do "Total a pagar" no modal
    totalPagarModal.parentElement.appendChild(botaoClonadoModal);

    console.log('Botão "Prosseguir" aplicado no modal com sucesso.');
    return true;
  }

  // Configurar MutationObserver para detectar quando o modal é montado
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Verificar se o modal foi adicionado
          if (node.classList && node.classList.contains('sc-fifgRP')) {
            setTimeout(() => {
              aplicarBotaoNoModal();
            }, 100); // Pequeno delay para garantir que o modal esteja totalmente montado
          }
          // Verificar se algum elemento filho contém o modal
          const modal =
            node.querySelector && node.querySelector('.sc-fifgRP.iwIahJ.sc-94d8ba36-0.bwDWcv');
          if (modal) {
            setTimeout(() => {
              aplicarBotaoNoModal();
            }, 100);
          }
        }
      });
    });
  });

  // Iniciar observação das mudanças no DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('Botão "Prosseguir" movido com sucesso.');
  console.log('Observer configurado para detectar modal.');
  return true;
})();
