(function () {
  const togglePromo = document.querySelector('[data-test-id="fop-promocode-toggle-accordion"]');
  if (!togglePromo) {
    console.log('ℹ️ Acordeão de código promocional não encontrado (provavelmente já foi movido).');
    return false;
  }
  const acordeaoOriginal = togglePromo.parentElement;
  const formularioParaMover = togglePromo.nextElementSibling?.firstElementChild;

  if (!acordeaoOriginal || !formularioParaMover) {
    console.error('❌ Falha ao localizar os componentes do código promocional.');
    return false;
  }

  const pTaxas = Array.from(document.querySelectorAll('p')).find(
    (p) => p.textContent.trim() === 'Taxa e impostos'
  );

  if (!pTaxas) {
    console.error(
      '❌ Não foi possível encontrar a seção "Taxa e impostos" no resumo da compra para usar como âncora.'
    );
    return false;
  }

  const anexoDiv = pTaxas.parentElement.parentElement;
  if (!anexoDiv) {
    console.error('❌ Não foi possível encontrar o contêiner da âncora "Taxa e impostos".');
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
            <path d="M19.5 12.5C19.5 11.95 19.05 11.5 18.5 11.5H13.81C13.4 11.5 13.06 11.16 13.06 10.75C13.06 10.34 13.4 10 13.81 10H18.5C19.05 10 19.5 9.55 19.5 9C19.5 8.45 19.05 8 18.5 8H13.81C13.4 8 13.06 7.66 13.06 7.25C13.06 6.84 13.4 6.5 13.81 6.5H18.5C19.05 6.5 19.5 6.05 19.5 5.5C19.5 4.67 18.83 4 18 4H6C5.17 4 4.5 4.67 4.5 5.5C4.5 6.05 4.95 6.5 5.5 6.5H10.19C10.6 6.5 10.94 6.84 10.94 7.25C10.94 7.66 10.6 8 10.19 8H5.5C4.95 8 4.5 8.45 4.5 9C4.5 9.55 4.95 10 5.5 10H10.19C10.6 10 10.94 10.34 10.94 10.75C10.94 11.16 10.6 11.5 10.19 11.5H5.5C4.95 11.5 4.5 11.95 4.5 12.5C4.5 13.33 5.17 14 6 14H18C18.83 14 19.5 13.33 19.5 12.5ZM6 20C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4V2H8V4H16V2H18V4C18.07 4 18.13 4.01 18.2 4.01C19.2 4.01 20 4.81 20 5.81V18.19C20 19.19 19.2 20 18.19 20H6Z" />
        </svg>
        
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

  console.log('✅ Adobe Target');
  return true;
})();
