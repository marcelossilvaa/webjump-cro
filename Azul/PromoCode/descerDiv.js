(function () {
  function onTargetPage() {
    const currentUrl = window.location.pathname;
    const targetTestUrl = '/payment';
    const stageTestUrl = '/stage';
    return currentUrl.includes(targetTestUrl) || currentUrl.includes(stageTestUrl);
  }

  if (window.campaignPromoCode || !onTargetPage()) {
    return;
  }

  window.campaignDescerDiv = true;

  const isMobile = window.innerWidth < 768;

  const togglePromo = document.querySelector('[data-test-id="fop-promocode-toggle-accordion"]');
  if (!togglePromo) {
    console.log('Accordeon não encontrado');
    return false;
  }

  const acordeaoOriginal = togglePromo.parentElement;
  const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

  // Usar o elemento sc-8bc246f-0 fbxbkv como referência para ambos mobile e desktop
  const elementoReferencia = document.querySelector('.sc-8bc246f-0.fbxbkv');
  if (!elementoReferencia) {
    console.error('Elemento de referência sc-8bc246f-0 fbxbkv não encontrado.');
    return false;
  }

  const containerDoBotao = elementoReferencia;

  // Posicionar o formulário abaixo do elemento de referência para ambos os dispositivos
  containerDoBotao.after(formularioParaMover);
  acordeaoOriginal.remove();

  // Ocultar o texto "Digite o seu código" antes de mover o formulário
  const textoParaOcultar = Array.from(formularioParaMover.querySelectorAll('p')).find((p) =>
    p.textContent.includes('Digite o seu código')
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
