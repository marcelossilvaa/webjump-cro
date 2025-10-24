function executeMoveCTA() {
  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/payment';
    const stageTestUrl = '/stage';
    return currentUrl.includes(targetTestUrl) || currentUrl.includes(stageTestUrl);
  }

  if (window.campaignMoveCTA || !onTargetPage()) {
    console.log('Script não executado - URL não corresponde ou já foi executado');
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
  const containerTotalPagar = totalPagar.closest('.sc-d781f9ae-14');
  if (!containerTotalPagar) {
    console.error('Não foi possível encontrar o contêiner do "Total a pagar".');
    return false;
  }

  // Encontrar o contêiner principal do accordion (dstOvo)
  const accordionContainer = containerTotalPagar.closest('.sc-d781f9ae-0');
  if (!accordionContainer) {
    console.error('Não foi possível encontrar o contêiner do accordion.');
    return false;
  }

  // Ajustar border-radius do accordion para ter bordas arredondadas apenas no topo
  accordionContainer.style.borderRadius = '10px 10px 0px 0px';

  // Ajustar border-radius do cabeçalho do accordion (quando fechado)
  const cabecalhoAccordion = accordionContainer.querySelector('.sc-d781f9ae-1');
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

  console.log('Botão "Prosseguir" movido com sucesso.');
  return true;
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', executeMoveCTA);
} else {
  executeMoveCTA();
}
