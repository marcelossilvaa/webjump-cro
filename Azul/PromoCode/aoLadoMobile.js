(function () {
  if (window.campaignProgressBar) {
    return;
  }
  window.campaignProgressBar = true;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function handleDesktop() {
    const togglePromo = document.querySelector('[data-test-id="fop-promocode-toggle-accordion"]');
    if (!togglePromo) {
      console.log('Acordeão de código promocional não encontrado (provavelmente já foi movido).');
      return false;
    }
    const acordeaoOriginal = togglePromo.parentElement;
    const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

    if (!acordeaoOriginal || !formularioParaMover) {
      console.error('Falha ao localizar os componentes do código promocional.');
      return false;
    }

    const pTaxas = Array.from(document.querySelectorAll('p')).find(
      (p) => p.textContent.trim() === 'Taxa e impostos'
    );

    if (!pTaxas) {
      console.error(
        'Não foi possível encontrar a seção "Taxa e impostos" no resumo da compra para usar como âncora.'
      );
      return false;
    }

    const anexoDiv = pTaxas.parentElement.parentElement;
    if (!anexoDiv) {
      console.error('Não foi possível encontrar o contêiner da âncora "Taxa e impostos".');
      return false;
    }

    anexoDiv.after(formularioParaMover);
    acordeaoOriginal.remove();

    const childrenOriginais = Array.from(formularioParaMover.children);
    const conteudoDoFormulario = document.createElement('div');
    childrenOriginais.forEach((child) => conteudoDoFormulario.appendChild(child));

    const textoParaRemover = Array.from(conteudoDoFormulario.querySelectorAll('p')).find((p) =>
      p.textContent.includes('Digite o seu código')
    );
    if (textoParaRemover) {
      textoParaRemover.parentElement.remove();
    }

    conteudoDoFormulario.style.display = 'none';
    conteudoDoFormulario.style.padding = '4px 0 0 0';

    const textoPergunta = document.createElement('p');
    textoPergunta.textContent = 'Possui cupom de desconto?';
    textoPergunta.style.cssText = 'margin: 0; padding: 0; font-size: 14px;';

    const triggerCupom = document.createElement('div');
    triggerCupom.style.cssText =
      'display: flex; align-items: center; cursor: pointer; color: #026cb6; padding-top: 8px;';
    triggerCupom.innerHTML = `
          <img src="https://www.voeazul.com.br//content/dam/azul-airlines/wallet/payment/Promocode.svg" alt="PromoceContainer" style="margin-right: 4px;">
          
          <span>Adicionar cupom</span>
      `;

    formularioParaMover.innerHTML = '';
    formularioParaMover.appendChild(textoPergunta);
    formularioParaMover.appendChild(triggerCupom);
    formularioParaMover.appendChild(conteudoDoFormulario);

    triggerCupom.addEventListener('click', () => {
      triggerCupom.style.display = 'none';
      conteudoDoFormulario.style.display = 'block';
      const applyBtn = conteudoDoFormulario.querySelector(
        '[data-test-id="fop-promocode-apply-btn"]'
      );
      if (applyBtn && applyBtn.parentElement) {
        applyBtn.parentElement.style.margin = '0';
      }
    });

    formularioParaMover.style.cssText = `
          display: block !important;
          padding: 12px 22px;
          border-top: 1px solid #e0e0e0;
      `;

    return true;
  }

  function handleMobile() {
    const togglePromo = document.querySelector('[data-test-id="fop-promocode-toggle-accordion"]');
    if (!togglePromo) {
      console.log(
        'Acordeão de código promocional não encontrado no mobile (provavelmente já foi movido).'
      );
      return false;
    }
    const acordeaoOriginal = togglePromo.parentElement;
    const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

    if (!acordeaoOriginal || !formularioParaMover) {
      console.error('Falha ao localizar os componentes do código promocional no mobile.');
      return false;
    }

    // Busca universal pela seção "Taxas e impostos" - não depende de classes específicas

    let taxasImpostosDiv = null;

    // Busca 1: Procurar por qualquer elemento h4 que contenha "Taxas e impostos"
    const todosH4 = Array.from(document.querySelectorAll('h4'));

    const h4Taxas = todosH4.find((h4) => h4.textContent.trim() === 'Taxas e impostos');

    if (h4Taxas) {
      taxasImpostosDiv = h4Taxas.closest('div');
    } else {
      const h4Flexivel = todosH4.find((h4) =>
        h4.textContent.trim().toLowerCase().includes('taxas')
      );

      if (h4Flexivel) {
        taxasImpostosDiv = h4Flexivel.closest('div');
      } else {
        // Busca por palavras relacionadas
        const palavrasRelacionadas = ['impostos', 'taxa', 'fee', 'charge'];
        let h4Encontrado = null;

        for (const palavra of palavrasRelacionadas) {
          h4Encontrado = todosH4.find((h4) =>
            h4.textContent.trim().toLowerCase().includes(palavra)
          );
          if (h4Encontrado) {
            break;
          }
        }

        if (h4Encontrado) {
          taxasImpostosDiv = h4Encontrado.closest('div');
        } else {
          console.error('Não foi possível encontrar nenhuma seção relacionada a taxas.');
          return false;
        }
      }
    }

    // Confirmar que encontramos o elemento
    if (!taxasImpostosDiv) {
      console.error('Não foi possível encontrar nenhum elemento de referência.');
      return false;
    }

    // Remover o acordeão original
    acordeaoOriginal.remove();

    // Criar o novo container - usar classes genéricas para garantir compatibilidade
    const novoContainer = document.createElement('div');
    novoContainer.className = 'promo-cupom-container';

    novoContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
      background-color: #fff;
    `;

    // Criar o conteúdo do formulário
    const childrenOriginais = Array.from(formularioParaMover.children);
    const conteudoDoFormulario = document.createElement('div');
    childrenOriginais.forEach((child) => conteudoDoFormulario.appendChild(child));

    const textoParaRemover = Array.from(conteudoDoFormulario.querySelectorAll('p')).find((p) =>
      p.textContent.includes('Digite o seu código')
    );
    if (textoParaRemover) {
      textoParaRemover.parentElement.remove();
    }

    conteudoDoFormulario.style.display = 'none';
    conteudoDoFormulario.style.padding = '8px 0 0 0';

    // Criar o trigger para mobile
    const triggerCupom = document.createElement('div');
    triggerCupom.style.cssText = `
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #026cb6;
      font-size: 14px;
    `;
    triggerCupom.innerHTML = `
      <img src="https://www.voeazul.com.br//content/dam/azul-airlines/wallet/payment/Promocode.svg" alt="PromoceContainer" style="margin-right: 6px; width: 16px; height: 16px;">
      <span>Adicionar cupom</span>
    `;

    // Criar o container interno
    const containerInterno = document.createElement('div');
    containerInterno.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
    `;

    containerInterno.appendChild(triggerCupom);
    containerInterno.appendChild(conteudoDoFormulario);

    novoContainer.appendChild(containerInterno);

    // Adicionar após a seção de taxas e impostos
    taxasImpostosDiv.parentElement.insertBefore(novoContainer, taxasImpostosDiv.nextSibling);

    // Event listener para o trigger
    triggerCupom.addEventListener('click', () => {
      triggerCupom.style.display = 'none';
      conteudoDoFormulario.style.display = 'block';
      const applyBtn = conteudoDoFormulario.querySelector(
        '[data-test-id="fop-promocode-apply-btn"]'
      );
      if (applyBtn && applyBtn.parentElement) {
        applyBtn.parentElement.style.margin = '0';
      }
    });

    return true;
  }

  // Executar a função apropriada baseada no tamanho da tela
  if (isMobile()) {
    // No mobile, aguardar o clique no botão "Ver detalhes" para executar
    const botaoVerDetalhes = document.querySelector('[data-test-id="breakdown-see-details"]');

    if (botaoVerDetalhes) {
      // Flag para evitar execução múltipla
      let mobileExecutado = false;

      botaoVerDetalhes.addEventListener('click', () => {
        if (mobileExecutado) {
          return;
        }

        // Aguardar um pouco para o modal ser montado
        setTimeout(() => {
          mobileExecutado = true;
          handleMobile();
        }, 500); // 500ms para o modal carregar
      });
    } else {
      handleMobile();
    }
  } else {
    handleDesktop();
  }

  // Adicionar listener para mudanças de tamanho de tela
  window.addEventListener('resize', () => {
    // Evitar execução múltipla durante o resize
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
      if (window.campaignProgressBar) {
        window.campaignProgressBar = false;
        // Recarregar a função quando mudar de desktop para mobile ou vice-versa
        setTimeout(() => {
          if (
            window.location.pathname.includes('payment') ||
            window.location.pathname.includes('checkout')
          ) {
            window.location.reload();
          }
        }, 100);
      }
    }, 250);
  });

  console.log('Success Adobe Target');
  return true;
})();
