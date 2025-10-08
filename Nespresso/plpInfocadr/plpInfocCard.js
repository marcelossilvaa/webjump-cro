// Função auto-executável para modificar os cards de produto
(function () {
  'use strict';

  // Função para criar os ícones de benefícios
  function createBenefitsIcons() {
    // Primeiro tenta encontrar elementos com a caixa de desconto
    let elements = Array.from(document.querySelectorAll('p')).filter((p) =>
      p.textContent.includes('Ganhe até R$150 de desconto em cafés')
    );

    // Se não encontrar, busca elementos com texto de parcelamento
    if (elements.length === 0) {
      elements = Array.from(document.querySelectorAll('p')).filter(
        (p) => p.textContent.includes('Em até') && p.textContent.includes('sem juros')
      );
      console.log('Caixa de desconto não encontrada, usando elementos de parcelamento');
    }

    console.log('Elementos encontrados:', elements.length);

    elements.forEach((element, index) => {
      // Verifica se já foi modificado para evitar duplicação
      if (element.querySelector('.benefits-icons-container')) {
        console.log(`Card ${index + 1} já foi modificado`);
        return;
      }

      // Cria o container dos ícones
      const iconsContainer = document.createElement('div');
      iconsContainer.className = 'benefits-icons-container';
      iconsContainer.style.cssText = `
         display: flex;
         justify-content: space-between;
         align-items: flex-start;
         margin-top: 12px;
         gap: 0;
         padding: 15px 0;
         border-top: 1px solid #eeeeee;
         border-bottom: 1px solid #eeeeee;
         position: relative;
       `;

      // Array com os benefícios em português
      const benefits = [
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 32 32"><path d="M16 2.446 4 8.186v15.63l12 5.739 12-5.74V8.185l-12-5.74Zm0 1.108L26.341 8.5l-4.204 2.01-10.342-4.945L16 3.555ZM10.636 6.12l10.341 4.945L16 13.445 5.659 8.5l4.977-2.38ZM27 23.185l-10.5 5.021V25h-1v3.206L5 23.185V9.294l10.5 5.021V17h1v-2.685l5-2.391v3.326l1-.5v-3.304L27 9.294v13.89Z"></path><path d="M8.815 18.462V23h.96v-1.821h1.337v-.784H9.774v-1.142h1.87v-.791h-2.83Zm7.022 1.484c0-1.274-.987-1.484-1.897-1.484h-1.387V23h.96v-1.555h.468L14.948 23h1.162l-1.155-1.702c.47-.168.882-.588.882-1.352Zm-2.017.729h-.308v-1.443h.308c.49 0 1.03.077 1.03.714 0 .623-.483.729-1.03.729Zm4.095.406h1.303v-.792h-1.303v-1.036h1.85v-.791h-2.809V23h2.893v-.799h-1.934v-1.12Zm3.856-1.828h1.85v-.791h-2.808V23h2.892v-.799h-1.933v-1.12h1.302v-.792h-1.303v-1.036Z"></path></svg>',
          text: 'Entrega Grátis',
          description: '',
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 32 32"><path d="M26.996 24.438 24.964 8.183 19.123 5h-6.254L7.036 8.184l-2.03 16.233c-.26 1.55-1.937 1.582-2.008 1.583L3 27h26l.002-1c-.073-.001-1.788-.032-2.006-1.563ZM7.964 8.816 13.124 6h5.745l5.167 2.816 1.969 15.754c.088.617.342 1.075.665 1.43H5.304c.326-.357.588-.817.692-1.438L7.964 8.816Z"></path></svg>',
          text: 'Kit Degustação',
          description: '',
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="32" viewBox="0 0 32 32" width="32"><path d="m25 19.5396v-7.9981h4v-3.5c0-2.28955-1.21-3.5-3.5-3.5h-.5v-.5c0-.82715-.6728-1.5-1.5-1.5h-14c-.82715 0-1.5.67285-1.5 1.5v1.5h-7v18.9981h2.81689l.5-1h-2.31689v-16.9981h6v7.2723c.31866-.0881.64923-.1577 1-.2v-9.5723c0-.27588.22412-.5.5-.5h14c.2754 0 .5.22412.5.5v19.5h-8.3159l.5 1 9.4341-.0019 5.3818-2.6885v-2.3115zm0-13.9981h.5c1.7285 0 2.5.771 2.5 2.5v2.5h-3zm5 15.6904-4.6182 2.3077h-.3818v-3h5z"></path><path d="m14.9046 19.5386c0-3.1319-1.8511-5.002-4.95165-5.002-3.10157 0-4.95313 1.8701-4.95313 5.002 0 1.2652.31525 2.312.87964 3.1255l-2.33893 4.6778 1.04614.5812 1.34772-.2996.49646 1.3241.91956.5109 2.46344-4.9269c.04822.0009.09021.0109.1391.0109.08055 0 .15045-.0155.22935-.018l2.3703 4.7406 1.1041-.552.4086-1.0896 1.2256.2724 1.1562-.578-2.3638-4.7277c.5299-.8027.8213-1.8267.8213-3.0516zm-7.83935 8.2539-.5-1.333-1.64844.3662 1.68805-3.3762c.57721.4832 1.28973.8228 2.14203.9797zm2.88769-4.25c-2.54931 0-3.95312-1.4219-3.95312-4.0039 0-2.5811 1.40381-4.002 3.95312-4.002 2.54836 0 3.95166 1.4209 3.95166 4.002 0 2.582-1.4033 4.0039-3.95166 4.0039zm5.12986 3.2832-1.6484-.3662-.5 1.333-1.6925-3.385c.8466-.1693 1.5576-.5152 2.1257-1.0122z"></path><path d="m9.46631 20.3013-1.11279-1.1133-.70704.707 1.88721 1.8867 2.85061-3.4199-.7686-.6406z"></path></svg>',
          text: '1 Ano de Garantia',
          description: '',
        },
      ];

      // Cria cada ícone de benefício
      benefits.forEach((benefit) => {
        const benefitItem = document.createElement('div');
        benefitItem.style.cssText = `
           display: flex;
           flex-direction: column;
           align-items: center;
           text-align: center;
           flex: 1;
           padding: 0 10px;
           position: relative;
         `;

        // Adiciona borda vertical entre os itens (exceto o último)
        if (benefits.indexOf(benefit) < benefits.length - 1) {
          benefitItem.style.borderRight = '1px solid #eeeeee';
        }

        // Ícone
        const iconElement = document.createElement('div');
        iconElement.innerHTML = benefit.icon;
        iconElement.style.cssText = `
           font-size: 28px;
           margin-bottom: 8px;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #878887;
         `;

        // Texto principal
        const textElement = document.createElement('div');
        textElement.textContent = benefit.text;
        textElement.style.cssText = `
           font-size: 11px;
           font-weight: 500;
           color: #878887;
           line-height: 1.3;
           text-align: center;
         `;

        // Monta o item
        benefitItem.appendChild(iconElement);
        benefitItem.appendChild(textElement);
        iconsContainer.appendChild(benefitItem);
      });

      // Verifica se é um elemento com caixa de desconto ou apenas parcelamento
      const hasDiscountBox = element.textContent.includes('Ganhe até R$150 de desconto em cafés');

      if (hasDiscountBox) {
        // Substitui o conteúdo do elemento (caixa de desconto)
        element.innerHTML = '';
        element.appendChild(iconsContainer);
        console.log(`Card ${index + 1} - Caixa de desconto substituída!`);
      } else {
        // Adiciona abaixo do elemento de parcelamento
        element.parentNode.insertBefore(iconsContainer, element.nextSibling);
        console.log(`Card ${index + 1} - Componente adicionado abaixo do parcelamento!`);
      }
    });
  }

  // Função para inicializar quando a página carregar
  function initBenefitsIcons() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBenefitsIcons);
    } else {
      createBenefitsIcons();
    }
  }

  // Executa a função
  initBenefitsIcons();

  // Observer para detectar quando novos cards são adicionados
  const cardsObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasNewCards = addedNodes.some(
          (node) =>
            node.nodeType === 1 &&
            (node.querySelector?.('p') ||
              node.textContent?.includes('Ganhe até R$150') ||
              (node.textContent?.includes('Em até') && node.textContent?.includes('sem juros')))
        );

        if (hasNewCards) {
          console.log('Novos cards detectados!');
          setTimeout(() => {
            createBenefitsIcons();
          }, 200);
        }
      }
    });
  });

  // Observa mudanças no body para detectar novos cards
  cardsObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('Script de modificação dos cards carregado!');
})(); // Fecha a função auto-executável
