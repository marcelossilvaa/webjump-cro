(function () {
  let observer = null;

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
      const buttons = container.querySelectorAll('input[type="button"][value="Compre agora"]');
      const spans = container.querySelectorAll('span');
      const divs = container.querySelectorAll('div');

      let hasPrice = false;
      let hasApartirDe = false;
      let hasCompreAgoraButton = buttons.length > 0;

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
      if (hasCompreAgoraButton && (hasPrice || hasApartirDe || container.querySelector('img'))) {
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

    // 2. Aplicar min-height: initial !important em divs que contêm "A partir de:"
    const allDivsForPrice = container.querySelectorAll('div');
    let priceDivsFixed = 0;
    allDivsForPrice.forEach((div) => {
      const text = div.textContent || '';
      // Verificar se contém "A partir de:" (usando a copy fixa como referência)
      if (text.includes('A partir de:')) {
        div.style.setProperty('min-height', 'initial', 'important');
        priceDivsFixed++;
      }
    });
    if (priceDivsFixed > 0) {
      console.log(`✅ Min-height aplicado em ${priceDivsFixed} div(s) com "A partir de:"`);
    }

    // 3. Estilizar botões "Compre agora" (buscar por value, sem depender de classes)
    const allInputs = container.querySelectorAll('input[type="button"]');
    let buttonsStyled = 0;
    allInputs.forEach((button) => {
      if (button.value === 'Compre agora') {
        button.style.setProperty('background-color', '#CF527A', 'important');
        button.style.setProperty('border-radius', '65px', 'important');
        button.style.setProperty('font-weight', '700', 'important');
        buttonsStyled++;
      }
    });
    if (buttonsStyled > 0) {
      console.log(`✅ Botões estilizados: ${buttonsStyled}`);
    }
  }

  // Função para aplicar personalizações em todos os containers de passagens
  function customizeCards() {
    // Buscar todos os containers relevantes
    const containers = findCardsContainers();

    if (containers.length === 0) {
      console.log('Containers com cards de passagens não encontrados ainda');
      return;
    }

    // Aplicar personalizações em cada container
    containers.forEach((container) => {
      customizeCardsInContainer(container);
    });
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
          // Reaplicar personalizações (isso também vai encontrar novos containers)
          customizeCards();
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
