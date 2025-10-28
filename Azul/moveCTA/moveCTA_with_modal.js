(function () {
  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/payment';
    return currentUrl.includes(targetTestUrl);
  }

  function reverterBotaoFinalizar() {
    if (!window.botaoFinalizarMovido) return false;

    window.botaoFinalizarMovido = false;

    const botaoFinalizar = document.querySelector('[data-test-id="payment-finish"]');
    if (botaoFinalizar) {
      let divFinalizar = botaoFinalizar.parentElement;
      while (divFinalizar && divFinalizar.style.backgroundColor !== 'rgb(248, 249, 250)') {
        divFinalizar = divFinalizar.parentElement;
      }
      if (divFinalizar) {
        divFinalizar.remove();
      }
    }

    console.log('Botão "Finalizar pagamento" revertido.');

    setTimeout(() => {
      const botaoProsseguir = document.querySelector('[data-test-id="payment-next-step-btn"]');
      if (botaoProsseguir) {
        moverBotaoProsseguir();
      }
    }, 200);

    return true;
  }

  function moverBotaoProsseguir() {
    const botaoProsseguir = document.querySelector('[data-test-id="payment-next-step-btn"]');
    if (!botaoProsseguir) return false;

    const totalPagar = Array.from(document.querySelectorAll('p')).find(
      (p) => p.textContent.trim() === 'Total a pagar'
    );

    if (!totalPagar) return false;

    const containerTotalPagar = totalPagar.closest('.sc-d781f9ae-14');
    if (!containerTotalPagar) return false;

    const accordionContainer = containerTotalPagar.closest('.sc-d781f9ae-0');
    if (!accordionContainer) return false;

    accordionContainer.style.borderRadius = '10px 10px 0px 0px';
    const cabecalhoAccordion = accordionContainer.querySelector('.sc-d781f9ae-1');
    if (cabecalhoAccordion) {
      cabecalhoAccordion.style.setProperty('border-radius', '10px 10px 0px 0px', 'important');
    }

    containerTotalPagar.style.borderRadius = '0';

    const novaDivBotao = document.createElement('div');
    novaDivBotao.style.cssText = `
      background-color: #f8f9fa;
      border: 1px solid rgb(192, 192, 192);
      border-top: none;
      border-radius: 0 0 8px 8px;
      padding: 15px;
      margin-top: 0;
    `;

    botaoProsseguir.style.cssText = `
      width: 100%;
      margin: 0;
      border-radius: 6px;
    `;

    novaDivBotao.appendChild(botaoProsseguir);
    accordionContainer.insertAdjacentElement('afterend', novaDivBotao);

    console.log('Botão "Prosseguir" movido com sucesso.');
    return true;
  }

  function moverBotaoFinalizar() {
    if (window.botaoFinalizarMovido) return false;

    const botaoFinalizar = document.querySelector('[data-test-id="payment-finish"]');
    if (!botaoFinalizar) return false;

    window.botaoFinalizarMovido = true;

    const botaoProsseguirMovido = document.querySelector('[data-test-id="payment-next-step-btn"]');
    if (botaoProsseguirMovido) {
      let divProsseguir = botaoProsseguirMovido.parentElement;
      while (divProsseguir && divProsseguir.style.backgroundColor !== 'rgb(248, 249, 250)') {
        divProsseguir = divProsseguir.parentElement;
      }
      if (divProsseguir) {
        divProsseguir.style.display = 'none';
      }
    }

    const totalPagar = Array.from(document.querySelectorAll('p')).find(
      (p) => p.textContent.trim() === 'Total a pagar'
    );

    if (totalPagar) {
      const containerTotalPagar = totalPagar.closest('.sc-d781f9ae-14');
      if (containerTotalPagar) {
        const accordionContainer = containerTotalPagar.closest('.sc-d781f9ae-0');
        if (accordionContainer) {
          accordionContainer.style.borderRadius = '10px 10px 0px 0px';
          const cabecalhoAccordion = accordionContainer.querySelector('.sc-d781f9ae-1');
          if (cabecalhoAccordion) {
            cabecalhoAccordion.style.setProperty('border-radius', '10px 10px 0px 0px', 'important');
          }
          containerTotalPagar.style.borderRadius = '0';

          const novaDivBotao = document.createElement('div');
          novaDivBotao.style.cssText = `
            background-color: #f8f9fa;
            border: 1px solid rgb(192, 192, 192);
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 15px;
            margin-top: 0;
          `;

          const containerBotaoFinalizar = botaoFinalizar.closest('div');
          if (containerBotaoFinalizar) {
            const botao = containerBotaoFinalizar.querySelector('button');
            if (botao) {
              botao.style.cssText = 'width: 100%; margin: 0; border-radius: 6px;';
              novaDivBotao.appendChild(containerBotaoFinalizar);
              accordionContainer.insertAdjacentElement('afterend', novaDivBotao);
              console.log('Botão "Finalizar pagamento" movido com sucesso.');
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function executeMoveCTAWithModal() {
    if (window.campaignMoveCTA || !onTargetPage()) {
      return;
    }

    if (moverBotaoFinalizar()) {
      return;
    }

    window.campaignMoveCTA = true;
    moverBotaoProsseguir();

    function aplicarBotaoNoModal() {
      const modal = document.querySelector('.sc-fifgRP.iwIahJ.sc-1e818174-0.beINZX');
      if (!modal) return false;

      if (modal.querySelector('[data-test-id="payment-next-step-btn"]')) {
        return true;
      }

      const totalPagarModal = modal.querySelector('.sc-1e818174-21.fsASBr');
      if (!totalPagarModal) {
        console.log('Container "Total a pagar" não encontrado no modal.');
        return false;
      }

      const botaoMovido = document.querySelector('[data-test-id="payment-next-step-btn"]');

      if (!botaoMovido) {
        console.log('Botão movido não encontrado para clonar no modal.');
        return false;
      }

      const botaoClonadoModal = botaoMovido.cloneNode(true);
      botaoClonadoModal.style.cssText = `
        margin: 10px;
        width: 90%;
        border-radius: 6px;
      `;

      botaoClonadoModal.addEventListener('click', () => {
        if (botaoMovido) {
          botaoMovido.click();
        }

        setTimeout(() => {
          const botaoFecharModal = modal.querySelector('[data-test-id="breakdown-close-details"]');
          if (botaoFecharModal) botaoFecharModal.click();
        }, 100);
      });

      totalPagarModal.parentElement.appendChild(botaoClonadoModal);

      console.log('Botão "Prosseguir" aplicado no modal com sucesso.');
      return true;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.querySelector && node.querySelector('[data-test-id="payment-finish"]')) {
              setTimeout(() => moverBotaoFinalizar(), 100);
            }

            if (
              node.querySelector &&
              node.querySelector('[data-test-id="payment-next-step-btn"]')
            ) {
              const botaoProsseguir = node.querySelector('[data-test-id="payment-next-step-btn"]');
              if (botaoProsseguir && !botaoProsseguir.closest('[data-test-id="payment-finish"]')) {
                setTimeout(() => reverterBotaoFinalizar(), 100);
              }
            }

            if (node.classList && node.classList.contains('sc-fifgRP')) {
              setTimeout(() => aplicarBotaoNoModal(), 10);
            }

            const modal =
              node.querySelector && node.querySelector('.sc-fifgRP.iwIahJ.sc-1e818174-0.beINZX');
            if (modal) {
              setTimeout(() => aplicarBotaoNoModal(), 10);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('Botão "Prosseguir" movido com sucesso.');
    console.log('Observer configurado para detectar modal e botão Finalizar.');
    return true;
  }

  function init() {
    executeMoveCTAWithModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
