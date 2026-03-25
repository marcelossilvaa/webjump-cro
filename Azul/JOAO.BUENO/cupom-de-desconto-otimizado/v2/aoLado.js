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
    const divParaRemover = textoParaRemover.closest('.sc-5d84be43-11');
    if (divParaRemover) {
      divParaRemover.remove();
    } else {
      textoParaRemover.parentElement.remove();
    }
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
    const applyBtn = conteudoDoFormulario.querySelector('[data-test-id="fop-promocode-apply-btn"]');
    if (applyBtn && applyBtn.parentElement) {
      applyBtn.parentElement.style.margin = '0';
    }
  });

  formularioParaMover.style.cssText = `
        display: block !important;
        padding: 12px 22px;
        border-top: 1px solid #e0e0e0;
    `;

  console.log('Adobe Target');
  return true;
})();
