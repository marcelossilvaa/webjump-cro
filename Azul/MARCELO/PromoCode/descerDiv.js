//Experience C - PromoCode - Descer Div

(function () {
  function isMobileViewport() {
    return window.innerWidth < 768;
  }

  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/wallet';
    return currentUrl.includes(targetTestUrl);
  }

  if (window.campaignPromoCode || !onTargetPage() || isMobileViewport()) {
    return;
  }

  window.campaignDescerDiv = true;

  const isMobile = isMobileViewport();

  // Função para aguardar elemento estar disponível no DOM
  function waitForElement(selector, maxAttempts = 50, interval = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkElement, interval);
        } else {
          reject(new Error(`Elemento ${selector} não encontrado após ${maxAttempts} tentativas`));
        }
      };
      checkElement();
    });
  }

  // Aguardar DOM estar pronto e elementos disponíveis
  function initPromoCode() {
    waitForElement('[data-test-id="fop-promocode-toggle-accordion"]')
      .then((togglePromo) => {
        if (!togglePromo) {
          console.log('Accordeon não encontrado');
          return false;
        }

        const acordeaoOriginal = togglePromo.parentElement;
        const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

        if (!acordeaoOriginal || !formularioParaMover) {
          console.error('Falha ao localizar os componentes do código promocional.');
          return false;
        }

        // Usar o elemento sc-8bc246f-0 fbxbkv como referência para ambos mobile e desktop
        // Aguardar elemento de referência estar disponível
        waitForElement('.sc-8bc246f-0.fbxbkv')
          .then((elementoReferencia) => {
            executePromoCode(
              togglePromo,
              acordeaoOriginal,
              formularioParaMover,
              elementoReferencia,
              isMobile,
            );
          })
          .catch((error) => {
            console.error('Elemento de referência sc-8bc246f-0 fbxbkv não encontrado:', error);
            // Tentar novamente após um delay
            setTimeout(() => {
              const elementoReferenciaRetry = document.querySelector('.sc-8bc246f-0.fbxbkv');
              if (elementoReferenciaRetry) {
                executePromoCode(
                  togglePromo,
                  acordeaoOriginal,
                  formularioParaMover,
                  elementoReferenciaRetry,
                  isMobile,
                );
              } else {
                console.error('Falha ao encontrar elemento de referência após retry');
              }
            }, 500);
          });
      })
      .catch((error) => {
        console.error('Erro ao inicializar código promocional:', error);
      });
  }

  function executePromoCode(
    togglePromo,
    acordeaoOriginal,
    formularioParaMover,
    elementoReferencia,
    isMobile,
  ) {
    if (!elementoReferencia) {
      console.error('Elemento de referência sc-8bc246f-0 fbxbkv não encontrado.');
      return false;
    }

    const containerDoBotao = elementoReferencia;

    // Posicionar o formulário abaixo do elemento de referência para ambos os dispositivos
    containerDoBotao.after(formularioParaMover);

    // Ocultar o container original ao invés de removê-lo para evitar quebrar event listeners
    acordeaoOriginal.style.display = 'none';

    // Ocultar o texto "Digite o seu código" antes de mover o formulário
    const textoParaOcultar = Array.from(formularioParaMover.querySelectorAll('p')).find((p) =>
      p.textContent.includes('Digite o seu código'),
    );
    if (textoParaOcultar) {
      const divParaOcultar = textoParaOcultar.closest('.sc-5d84be43-11');
      if (divParaOcultar) {
        divParaOcultar.style.display = 'none';
      } else {
        textoParaOcultar.parentElement.style.display = 'none';
      }
    }

    const childrenOriginais = Array.from(formularioParaMover.children);
    const conteudoDoFormulario = document.createElement('div');
    childrenOriginais.forEach((child) => conteudoDoFormulario.appendChild(child));

    conteudoDoFormulario.style.display = 'none';
    conteudoDoFormulario.style.padding = '0 16px 4px';

    const textoPergunta = document.createElement('p');
    textoPergunta.textContent = 'Possui cupom de desconto?';
    textoPergunta.style.cssText = 'margin: 0; padding: 4px 16px 0 16px;';

    const triggerCupom = document.createElement('div');
    triggerCupom.style.cssText =
      'display: flex; align-items: center; cursor: pointer; color: #026cb6; padding: 4px 16px;';
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
        '[data-test-id="fop-promocode-apply-btn"]',
      );
      if (applyBtn && applyBtn.parentElement) {
        applyBtn.parentElement.style.margin = '0';
      }
    });

    // Estilos diferentes para mobile e desktop
    if (isMobile) {
      formularioParaMover.style.cssText = `
        display: block !important;
        margin-top: 16px;
        margin-bottom: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
    `;
    } else {
      formularioParaMover.style.cssText = `
        display: block !important;
        margin-top: 24px;
        border-radius: 8px;
        background-color: #ffffff;
        border: 1px solid rgb(192, 192, 192);
        box-shadow: rgba(4, 30, 66, 0.16) 0px 1px 4px 0px;
    `;
    }

    console.log(`Succes Adobe Target - ${isMobile ? 'Mobile' : 'Desktop'}`);
    return true;
  }

  // Aguardar DOM estar completamente carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPromoCode);
  } else {
    // DOM já está pronto, mas aguardar um pouco para garantir que elementos dinâmicos sejam renderizados
    setTimeout(initPromoCode, 100);
  }
})();
