// Função auto-executável para evitar conflitos de variáveis globais
(function () {
  'use strict';

  // Função para criar a seção de benefícios no dropdown de login
  function createBenefitsSection() {
    // Busca os elementos a cada execução
    let dropdownFath = document.querySelector('.LoginDropdown__dropdown');
    let dropdownContainer = document.querySelector('.LoginDropdown__container');

    console.log('Tentando criar seção de benefícios...');
    console.log('Dropdown encontrado:', !!dropdownFath);
    console.log('Container encontrado:', !!dropdownContainer);

    if (!dropdownFath || !dropdownContainer) {
      console.log('Elementos não encontrados, aguardando...');
      let tentativas = 0;
      let maxTentativas = 20;

      let interval = setInterval(() => {
        // Busca os elementos novamente
        let currentDropdownFath = document.querySelector('.LoginDropdown__dropdown');
        let currentDropdownContainer = document.querySelector('.LoginDropdown__container');

        // Depois verifica se existem
        if (currentDropdownFath && currentDropdownContainer) {
          clearInterval(interval);
          console.log('Elementos encontrados após', tentativas, 'tentativas');
          newFunction(currentDropdownFath, currentDropdownContainer);
        }

        tentativas++;
        if (tentativas >= maxTentativas) {
          clearInterval(interval);
          console.log('Timeout: dropdown não encontrado após', maxTentativas, 'tentativas');
        }
      }, 200);
    } else {
      // Se já existem, executa diretamente
      console.log('Elementos já existem, executando diretamente');
      newFunction(dropdownFath, dropdownContainer);
    }
  }

  function newFunction(dropdownFath, dropdownContainer) {
    // Aplica estilo apenas se o elemento existir
    if (dropdownFath) {
      dropdownFath.style.borderRadius = '10px';
    }

    if (!dropdownContainer) {
      console.log('Container do dropdown não encontrado');
      return;
    }

    // Verifica se a seção já existe dentro do container específico para evitar duplicação
    const existingBenefits = dropdownContainer.querySelector('.LoginDropdown__benefits');
    if (existingBenefits) {
      console.log('Seção de benefícios já existe neste container');
      return;
    }

    // Cria a seção de benefícios
    const benefitsSection = document.createElement('div');
    benefitsSection.className = 'LoginDropdown__benefits';
    benefitsSection.style.cssText = `
        background-color: #f5f5f0;
        border-radius: 0px 0px 8px 8px;
        padding: 20px;
        margin: 14px -14px -14px;
        font-family: Arial, sans-serif;
    `;

    let dropdownRegister = document.querySelector('.LoginDropdown__register-description');

    dropdownRegister.style.cssText = `
      margin: -10px 0 5px !important;
    `;

    // Título da seção
    const title = document.createElement('h3');
    title.textContent = 'Benefícios ao criar uma conta';
    title.style.cssText = `
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 700;
        color: #333;
    `;

    // Lista de benefícios
    const benefitsList = document.createElement('div');
    benefitsList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 17px;
    `;

    // Array com os benefícios
    const benefits = [
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18.002 9.22321H5.99756V19.7699H18.002V9.22321Z" stroke="#997A5D" stroke-width="0.999583" stroke-miterlimit="10" stroke-linejoin="round"/><path d="M12 19.6708V9.32227" stroke="#997A5D" stroke-width="0.999583" stroke-miterlimit="10"/><path d="M5.99756 14.4966H18.002" stroke="#997A5D" stroke-width="0.999583" stroke-miterlimit="10"/><path d="M12.0002 9.32296C12.0002 9.32296 7.81229 8.43805 7.81934 5.88953C7.81934 3.90734 9.89567 3.9498 10.7291 4.6011C11.6683 5.34442 12.0497 6.88061 12.0002 9.32296Z" stroke="#997A5D" stroke-width="0.999583" stroke-miterlimit="10"/><path d="M12.014 9.32296C12.014 9.32296 16.2019 8.43805 16.1949 5.88953C16.1949 3.90734 14.1186 3.9498 13.2852 4.6011C12.3459 5.34442 11.9645 6.88061 12.014 9.32296Z" stroke="#997A5D" stroke-width="0.999583" stroke-miterlimit="10"/></svg>',
        text: 'Benefícios e ofertas exclusivas',
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17.1728 18.8621L16.3931 21.1911L13.7142 15.8434C14.9737 15.6135 16.0333 15.1137 16.8629 14.384L19.4918 19.6518L17.1628 18.8721L17.1728 18.8621ZM11.9949 14.9937C8.12654 14.9937 5.99743 12.8646 5.99743 8.99623C5.99743 5.12784 8.12654 2.99873 11.9949 2.99873C15.8633 2.99873 17.9924 5.12784 17.9924 8.99623C17.9924 12.8646 15.8633 14.9937 11.9949 14.9937ZM7.58677 21.1911L6.80709 18.8621L4.47807 19.6418L7.10697 14.374C7.93662 15.1037 8.99618 15.6035 10.2557 15.8334L7.57677 21.1812L7.58677 21.1911ZM17.6026 13.6043C18.5022 12.4448 18.992 10.8854 18.992 8.99623C18.992 4.61805 16.3731 1.99915 11.9949 1.99915C7.61676 1.99915 4.99785 4.61805 4.99785 8.99623C4.99785 10.8854 5.48764 12.4348 6.38727 13.6043L2.92871 20.5214L3.68839 20.9612L6.18735 20.1316L7.11697 22.9204L7.68673 23.2503L11.3252 15.9833C11.5451 15.9933 11.775 16.0133 12.0049 16.0133C12.2348 16.0133 12.4647 16.0033 12.6847 15.9833L16.3231 23.2503L16.8929 22.9204L17.8225 20.1316L20.3215 20.9612L21.0812 20.5214L17.6226 13.6043H17.6026Z" fill="#8F7247"/><path d="M11.4557 10.746L9.34629 8.64667L8.64648 9.34647L11.5356 12.2456L15.8844 6.8072L15.1046 6.18738L11.4557 10.746Z" fill="#8F7247"/></svg>',
        text: 'Tornar-se membro do Nespresso Club*',
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" viewBox="0 0 24 27" fill="none"><path d="M14.2439 5.38446V6.16321C18.1276 6.92466 20.2408 9.77247 20.2408 14.3869C20.2408 19.8276 17.3126 22.8243 11.9952 22.8243C6.67786 22.8243 3.74974 19.8281 3.74974 14.3869C3.74974 9.94539 5.70276 7.13497 9.31257 6.25135L8.29394 8.12738L9.34101 7.77817L10.4952 5.65223L8.21138 4.35468L7.23962 4.67934L8.84564 5.59198C5.0947 6.64463 3 9.7178 3 14.3875C3 20.2365 6.279 23.5919 11.9952 23.5919C17.7115 23.5919 20.9905 20.2365 20.9905 14.3875C20.9905 9.35631 18.5594 6.17827 14.2439 5.38446Z" fill="#8F7247"/><path d="M10.055 9.38761C9.86862 9.77809 9.74646 10.2802 9.74646 10.9607V11.3189H6.74805V18.9892H17.2233V11.3189H14.2444V10.9613C14.2444 10.2796 14.1216 9.77809 13.9353 9.38761C13.5091 8.4945 12.7086 8.25128 11.9951 8.25128C11.2816 8.25128 10.4812 8.4945 10.055 9.38761ZM16.4735 18.2228H7.49779V17.4557H16.4735V18.2228ZM10.4962 10.9607C10.4962 9.24145 11.2939 9.01832 11.9913 9.01776H11.999C12.6964 9.01832 13.4941 9.24145 13.4941 10.9607V11.3189H10.4956L10.4962 10.9607ZM10.4962 12.0859H13.4947V13.62H14.2438V12.0859H16.4735V16.6881H7.49779V12.0859H9.7459V13.62H10.4962V12.0859Z" fill="#8F7247"/></svg>',
        text: '10% OFF na Assinatura de cafés',
      },
    ];

    // Cria cada item de benefício
    benefits.forEach((benefit) => {
      const benefitItem = document.createElement('div');
      benefitItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

      // Ícone do benefício
      const icon = document.createElement('div');
      icon.innerHTML = benefit.icon;
      icon.style.cssText = `
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        `;

      // Ajusta o estilo do SVG dentro do ícone
      const svg = icon.querySelector('svg');
      if (svg) {
        svg.style.cssText = `
        width: 24px;
        height: 24px;
      `;
      }

      // Texto do benefício
      const text = document.createElement('span');
      text.textContent = benefit.text;
      text.style.cssText = `
            color: #000000;
            font-size: 14px;
            line-height: 1;
        `;

      benefitItem.appendChild(icon);
      benefitItem.appendChild(text);
      benefitsList.appendChild(benefitItem);
    });

    // Monta a seção completa
    benefitsSection.appendChild(title);
    benefitsSection.appendChild(benefitsList);

    // Insere a seção antes do botão de registro
    const registerButton = dropdownContainer.querySelector('#ta-login-dropdown-register');
    if (registerButton && registerButton.parentNode === dropdownContainer) {
      dropdownContainer.insertBefore(benefitsSection, registerButton);
    } else {
      // Procura por outros elementos para inserir antes
      const spacer = dropdownContainer.querySelector('.LoginDropdown__spacer--horizontal');
      if (spacer && spacer.parentNode === dropdownContainer) {
        dropdownContainer.insertBefore(benefitsSection, spacer);
      } else {
        // Se não encontrar elementos adequados, adiciona no final do container
        dropdownContainer.appendChild(benefitsSection);
      }
    }

    console.log('Seção de benefícios criada com sucesso!');
  }

  // Função para inicializar quando a página carregar
  function initBenefitsSection() {
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBenefitsSection);
    } else {
      createBenefitsSection();
    }
  }

  // Executa a função
  initBenefitsSection();

  // Observer para detectar quando o dropdown é aberto
  const benefitsObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      // Detecta mudanças no aria-expanded do botão
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
        const button = mutation.target;
        if (
          button.id === 'ta-login-dropdown--not-logged' &&
          button.getAttribute('aria-expanded') === 'true'
        ) {
          console.log('Dropdown aberto detectado!');
          createBenefitsSection();
        }
      }

      // Detecta quando o dropdown é adicionado ao DOM
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasDropdown = addedNodes.some(
          (node) =>
            node.nodeType === 1 &&
            (node.classList?.contains('LoginDropdown__dropdown') ||
              node.querySelector?.('.LoginDropdown__dropdown'))
        );

        if (hasDropdown) {
          console.log('Dropdown adicionado ao DOM!');
          createBenefitsSection();
        }
      }
    });
  });

  // Observa o botão de login para detectar mudanças no aria-expanded
  const loginButton = document.querySelector('#ta-login-dropdown--not-logged');
  if (loginButton) {
    benefitsObserver.observe(loginButton, {
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });
  }

  // Observa mudanças no container LoginDropdown para detectar quando o dropdown aparece
  const loginDropdownContainer = document.querySelector('.LoginDropdown');
  if (loginDropdownContainer) {
    benefitsObserver.observe(loginDropdownContainer, {
      childList: true,
      subtree: true,
    });
  }
})(); // Fecha a função auto-executável
