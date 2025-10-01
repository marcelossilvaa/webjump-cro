function reorganizarCodigoPromocional() {
  // --- 1. Encontrar os elementos do acordeão original ---
  const togglePromo = document.querySelector('[data-test-id="fop-promocode-toggle-accordion"]');
  if (!togglePromo) {
    console.log('ℹ️ Acordeão de código promocional não encontrado (provavelmente já foi movido).');
    return false;
  }

  // O acordeão a ser deletado é o pai do botão toggle
  const acordeaoOriginal = togglePromo.parentElement;

  // O formulário a ser movido está dentro do irmão seguinte do toggle
  const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

  if (!acordeaoOriginal || !formularioParaMover) {
    console.error('❌ Falha ao localizar os componentes do código promocional.');
    return false;
  }

  // --- 2. Encontrar a âncora final: o contêiner do botão "Prosseguir" ---
  const anexoBotao = document.querySelector('[data-test-id="payment-next-step-btn"]');
  if (!anexoBotao) {
    console.error('❌ Não foi possível encontrar o botão "Prosseguir" para usar como âncora.');
    return false;
  }
  // O alvo para a inserção é o contêiner que envolve o botão
  const containerDoBotao = anexoBotao.parentElement;
  if (!containerDoBotao) {
    console.error('❌ Não foi possível encontrar o contêiner do botão.');
    return false;
  }

  // --- 3. Ação Final e Definitiva ---
  // Insere o formulário ANTES do contêiner do botão.
  containerDoBotao.before(formularioParaMover);
  acordeaoOriginal.remove();

  // --- 4. Estilos ---
  formularioParaMover.style.cssText = `
      display: block !important;
      opacity: 1 !important;
      height: auto !important;
      margin: 24px 0; /* Margem em cima e embaixo */
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f8f9fa;
  `;

  console.log('✅ AGORA SIM! Formulário posicionado acima do botão "Prosseguir".');
  return true;
}

// Executa a função
reorganizarCodigoPromocional();
