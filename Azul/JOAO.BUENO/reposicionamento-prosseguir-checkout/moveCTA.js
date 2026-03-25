(function () {
  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/payment';
    const stageTestUrl = '/stage';
    return currentUrl.includes(targetTestUrl) || currentUrl.includes(stageTestUrl);
  }

  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[MoveCTA] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_move_cta ' + eventLabel;

    console.log('[MoveCTA] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function addClickListeners() {
    const botaoProsseguir = document.querySelector('.move-cta-main-button');
    const botaoFinalizar = document.querySelector('[data-test-id="payment-finish"]');

    if (botaoProsseguir && !botaoProsseguir.hasAttribute('data-analytics-added')) {
      botaoProsseguir.setAttribute('data-analytics-added', 'true');
      botaoProsseguir.addEventListener('click', () => {
        analyticsEvent('Prosseguir');
      });
    }

    if (botaoFinalizar && !botaoFinalizar.hasAttribute('data-analytics-added')) {
      botaoFinalizar.setAttribute('data-analytics-added', 'true');
      botaoFinalizar.addEventListener('click', () => {
        analyticsEvent('Finalizar pagamento');
      });
    }
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

    botaoProsseguir.classList.add('move-cta-main-button');
    botaoProsseguir.style.cssText = `
width: 100%;
margin: 0;
border-radius: 6px;
`;

    novaDivBotao.appendChild(botaoProsseguir);
    accordionContainer.insertAdjacentElement('afterend', novaDivBotao);

    console.log('Botão "Prosseguir" movido com sucesso.');

    setTimeout(() => addClickListeners(), 100);

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

              setTimeout(() => addClickListeners(), 100);

              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function executeMoveCTA() {
    if (window.campaignMoveCTA || !onTargetPage()) {
      console.log('Script não executado - URL não corresponde ou já foi executado');
      return;
    }

    if (moverBotaoFinalizar()) {
      return;
    }

    window.campaignMoveCTA = true;
    moverBotaoProsseguir();
  }

  function init() {
    executeMoveCTA();

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
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
