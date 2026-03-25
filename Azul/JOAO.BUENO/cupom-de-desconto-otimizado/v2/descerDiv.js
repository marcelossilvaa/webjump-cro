(function () {
  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/payment';
    return currentUrl.includes(targetTestUrl);
  }

  if (window.campaignPromoCode || !onTargetPage()) {
    return;
  }
  window.campaignPromoCode = true;

  const isMobile = window.innerWidth < 768;

  const togglePromo = document.querySelector('[data-test-id="fop-promocode-toggle-accordion"]');
  if (!togglePromo) {
    console.log('Accordeon não encontrado');
    return false;
  }

  const acordeaoOriginal = togglePromo.parentElement;
  const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

  let anexoBotao;
  let containerDoBotao;

  if (isMobile) {
    // No mobile, usar o elemento "Outras formas de pagamento" como referência
    const outrasFormasPagamento = document
      .querySelector('[data-test-id="fops-others-checkbox"]')
      ?.closest('.sc-8bc246f-0');
    if (outrasFormasPagamento) {
      containerDoBotao = outrasFormasPagamento;
    } else {
      // Fallback para o botão de pagamento se não encontrar o elemento de outras formas
      anexoBotao = document.querySelector('[data-test-id="payment-next-step-btn"]');
      containerDoBotao = anexoBotao?.parentElement;
    }
  } else {
    // Desktop - usar o botão de pagamento como antes
    anexoBotao = document.querySelector('[data-test-id="payment-next-step-btn"]');
    containerDoBotao = anexoBotao?.parentElement;
  }

  if (!containerDoBotao) {
    console.error('Não encontrado o contêiner para anexar o formulário.');
    return false;
  }

  // Posicionar o formulário antes ou depois dependendo do dispositivo
  if (isMobile) {
    containerDoBotao.after(formularioParaMover);
  } else {
    containerDoBotao.before(formularioParaMover);
  }
  acordeaoOriginal.remove();

  const childrenOriginais = Array.from(formularioParaMover.children);
  const conteudoDoFormulario = document.createElement('div');
  childrenOriginais.forEach((child) => conteudoDoFormulario.appendChild(child));

  const textoParaRemover = Array.from(conteudoDoFormulario.querySelectorAll('p')).find((p) =>
    p.textContent.includes('Digite o seu código')
  );
  if (textoParaRemover) {
    const divParaRemover = textoParaRemover.closest('.sc-5d84be43-11');
    if (divParaRemover) {
      divParaRemover.remove();
    } else {
      textoParaRemover.parentElement.remove();
    }
  }

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

    const applyBtn = conteudoDoFormulario.querySelector('[data-test-id="fop-promocode-apply-btn"]');
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
})();
