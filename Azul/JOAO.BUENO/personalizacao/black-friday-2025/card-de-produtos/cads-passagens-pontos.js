(function () {
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;

  // Função para encontrar todos os containers que contém cards de passagens
  function findCardsContainers() {
    // Buscar todos os containers possíveis
    // Para passagens, pode não ter a classe hide-on-mobile, então vamos buscar de forma mais ampla
    const allContainers = document.querySelectorAll('.container-capsule.containerDefault');
    const relevantContainers = [];

    console.log(`Encontrados ${allContainers.length} container(s) com as classes`);

    // Verificar quais containers contém cards de passagens
    for (let i = 0; i < allContainers.length; i++) {
      const container = allContainers[i];
      const buttonsCompreAgora = container.querySelectorAll(
        'input[type="button"][value="Compre agora"]'
      );
      const buttonsVerPromocao = container.querySelectorAll(
        'input[type="button"][value="Ver promoção"]'
      );
      const spans = container.querySelectorAll('span');
      const divs = container.querySelectorAll('div');

      let hasPrice = false;
      let hasApartirDe = false;
      let hasCompreAgoraButton = buttonsCompreAgora.length > 0;
      let hasVerPromocaoButton = buttonsVerPromocao.length > 0;

      // Verificar se algum span contém "x de"
      for (let j = 0; j < spans.length; j++) {
        const text = spans[j].textContent || '';
        if (text.includes('x de')) {
          hasPrice = true;
          break;
        }
      }

      // Verificar se alguma div contém "A partir de:"
      for (let k = 0; k < divs.length; k++) {
        const text = divs[k].textContent || '';
        if (text.includes('A partir de:')) {
          hasApartirDe = true;
          break;
        }
      }

      // Se tem botão "Compre agora" E (tem preço OU tem "A partir de:"), é um container de passagens
      // Ou se tem botão "Compre agora" e parece ser um card (tem imagem)
      // Ou se tem botão "Ver promoção" e parece ser um card (tem imagem)
      if (
        (hasCompreAgoraButton && (hasPrice || hasApartirDe || container.querySelector('img'))) ||
        (hasVerPromocaoButton && container.querySelector('img'))
      ) {
        console.log(`Container ${i + 1} contém cards de passagens`);
        relevantContainers.push(container);
      }
    }

    return relevantContainers;
  }

  // Função para aplicar personalizações em um container específico
  function customizeCardsInContainer(container) {
    if (!container) return;

    // 1. Personalizar spans de preço (com "x de")
    const allSpans = container.querySelectorAll('span');
    let priceSpans = [];

    allSpans.forEach((span) => {
      const text = span.textContent || '';
      if (text.includes('x de')) {
        priceSpans.push(span);
      }
    });

    priceSpans = Array.from(new Set(priceSpans));

    if (priceSpans.length > 0) {
      priceSpans.forEach((span) => {
        span.style.setProperty('font-size', '24px', 'important');
      });
      console.log(`✅ Font-size aplicado em ${priceSpans.length} span(s) de preço`);
    }

    // 2. Aplicar min-height: initial !important APENAS na div que contém diretamente o span "A partir de:"
    // Buscar spans com "A partir de:" e aplicar na div pai direta
    const allSpansForApartirDe = container.querySelectorAll('span');
    let priceDivsFixed = 0;
    allSpansForApartirDe.forEach((span) => {
      const text = span.textContent || '';
      // Verificar se o span contém "A partir de:"
      if (text.includes('A partir de:')) {
        // Aplicar na div pai direta deste span
        const parentDiv = span.parentElement;
        if (parentDiv && parentDiv.tagName === 'DIV') {
          // Verificar se já foi aplicado para evitar reaplicação
          if (!parentDiv.hasAttribute('data-min-height-applied')) {
            parentDiv.style.setProperty('min-height', 'initial', 'important');
            parentDiv.setAttribute('data-min-height-applied', 'true');
            priceDivsFixed++;
          }
        }
      }
    });
    if (priceDivsFixed > 0) {
      console.log(`✅ Min-height aplicado em ${priceDivsFixed} div(s) com "A partir de:"`);
    }

    // 3. Estilizar botões "Compre agora" e "Ver promoção" (buscar por value, sem depender de classes)
    const allInputs = container.querySelectorAll('input[type="button"]');
    let buttonsStyled = 0;
    allInputs.forEach((button) => {
      if (button.value === 'Compre agora' || button.value === 'Ver promoção') {
        button.style.setProperty('background-color', '#CF527A', 'important');
        button.style.setProperty('border-radius', '65px', 'important');
        button.style.setProperty('font-weight', '700', 'important');
        buttonsStyled++;
      }
    });
    if (buttonsStyled > 0) {
      console.log(`✅ Botões estilizados: ${buttonsStyled}`);
    }

    // 4. Aplicar max-width e min-width: 266px APENAS na div css-b7xk (card individual)
    // Buscar especificamente divs com classe css-b7xk que têm imagem como filho direto
    const allDivs = container.querySelectorAll('div.css-b7xk');
    let cardsStyled = 0;
    allDivs.forEach((div) => {
      // Verificar se tem imagem como filho direto (não em filhos aninhados)
      const hasDirectImage = Array.from(div.children).some((child) => child.tagName === 'IMG');

      // Verificar se tem preço ou botão (para confirmar que é um card válido)
      const hasPrice = Array.from(div.querySelectorAll('span')).some((span) =>
        span.textContent.includes('A partir de:')
      );
      const hasButtonCompreAgora = div.querySelector('input[type="button"][value="Compre agora"]');
      const hasButtonVerPromocao = div.querySelector('input[type="button"][value="Ver promoção"]');

      // Aplicar apenas se for css-b7xk com imagem direta e (preço ou botão)
      if (hasDirectImage && (hasPrice || hasButtonCompreAgora || hasButtonVerPromocao)) {
        // Verificar se já foi estilizado
        if (!div.hasAttribute('data-card-width-applied')) {
          div.style.setProperty('max-width', '266px', 'important');
          div.style.setProperty('min-width', '266px', 'important');
          div.setAttribute('data-card-width-applied', 'true');
          cardsStyled++;
        }
      }
    });
    if (cardsStyled > 0) {
      console.log(`✅ Max-width e min-width de 266px aplicado em ${cardsStyled} card(s) css-b7xk`);
    }
  }

  // Função para aplicar personalizações em todos os containers de passagens
  function customizeCards() {
    // Evitar execução simultânea
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    // Buscar todos os containers relevantes
    const containers = findCardsContainers();

    if (containers.length === 0) {
      console.log('Containers com cards de passagens não encontrados ainda');
      isProcessing = false;
      return;
    }

    // Aplicar personalizações em cada container
    containers.forEach((container) => {
      customizeCardsInContainer(container);
    });

    // Resetar flag de processamento
    isProcessing = false;
  }

  // Função para inicializar
  function init() {
    // Buscar todos os containers relevantes
    const containers = findCardsContainers();

    if (containers.length > 0) {
      console.log(`${containers.length} container(s) com cards de passagens encontrado(s)!`);

      // Aplicar personalização imediatamente
      customizeCards();

      // Configurar MutationObserver para detectar mudanças e novos containers
      if (!observer) {
        observer = new MutationObserver(() => {
          // Debounce para evitar loops
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(() => {
            customizeCards();
          }, 300);
        });

        // Observar o document.body para capturar mudanças em qualquer lugar
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        console.log('MutationObserver configurado');
      }
    } else {
      console.log('Containers com cards de passagens não encontrados, tentando novamente...');
      // Tentar novamente após um delay
      setTimeout(() => {
        init();
      }, 500);
    }
  }

  // Inicializar
  init();
})();
