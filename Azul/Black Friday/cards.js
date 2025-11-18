(function () {
  let targetContainer = null;
  let observer = null;

  // Função para encontrar o container que contém os cards com "x de"
  function findCardsContainer() {
    // Buscar todos os containers com essas classes
    const allContainers = document.querySelectorAll(
      '.container-capsule.containerDefault.hide-on-mobile'
    );

    console.log(`Encontrados ${allContainers.length} container(s) com as classes`);

    // Verificar qual container contém spans com "x de"
    for (let i = 0; i < allContainers.length; i++) {
      const container = allContainers[i];
      const spans = container.querySelectorAll('span');

      // Verificar se algum span contém "x de"
      for (let j = 0; j < spans.length; j++) {
        const text = spans[j].textContent || '';
        if (text.includes('x de')) {
          console.log(`Container ${i + 1} contém cards com "x de"`);
          return container;
        }
      }
    }

    return null;
  }

  // Função para aplicar personalizações nos cards
  function customizeCards() {
    // Se ainda não encontrou o container correto, tentar encontrar
    if (!targetContainer) {
      targetContainer = findCardsContainer();
    }

    // Se ainda não encontrou, retornar
    if (!targetContainer) {
      console.log('Container com cards não encontrado ainda');
      return;
    }

    // 1. Personalizar spans de preço (com "x de")
    const allSpans = targetContainer.querySelectorAll('span');
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
        // Aplicar font-size de 22px (forçar remoção de estilos inline anteriores)
        span.style.removeProperty('font-size');
        span.style.setProperty('font-size', '22px', 'important');

        // Remover &nbsp; do texto (substituir por espaço normal)
        const currentText = span.textContent || '';
        const cleanedText = currentText.replace(/\u00A0/g, ' ').trim();
        if (currentText !== cleanedText) {
          span.textContent = cleanedText;
        }
      });
      console.log(
        `✅ Font-size aplicado e &nbsp; removido em ${priceSpans.length} span(s) de preço`
      );
    }

    // 2. Modificar spans que contenham "Aéreo + Hotel" para manter apenas "Aéreo + Hotel"
    const allSpansForHotel = targetContainer.querySelectorAll('span');
    let hotelSpansModified = 0;
    allSpansForHotel.forEach((span) => {
      const text = span.textContent || '';
      // Verificar se contém "Aéreo + Hotel" e tem mais conteúdo
      if (text.includes('Aéreo') && text.includes('Hotel') && text.trim() !== 'Aéreo + Hotel') {
        // Extrair apenas "Aéreo + Hotel" do texto
        const match = text.match(/Aéreo\s*\+\s*Hotel/i);
        if (match) {
          span.textContent = 'Aéreo + Hotel';
          hotelSpansModified++;
        }
      }
    });
    if (hotelSpansModified > 0) {
      console.log(`✅ Texto de hotel modificado em ${hotelSpansModified} span(s)`);
    }

    // 2.1. Substituir nome do hotel por "Aéreo + Hotel"
    // Buscar divs que contêm apenas um span com texto que não é nenhum dos textos conhecidos
    // e que estão dentro de um card (que contém "A partir de" e "x de")
    const allDivsForHotel = targetContainer.querySelectorAll('div');
    let hotelDivsReplaced = 0;
    allDivsForHotel.forEach((div) => {
      // Verificar se a div tem apenas um span filho direto
      const directSpans = Array.from(div.children).filter((child) => child.tagName === 'SPAN');
      if (directSpans.length === 1) {
        const span = directSpans[0];
        const spanText = span.textContent || '';
        const trimmedText = spanText.trim();

        // Verificar se não é nenhum dos textos conhecidos
        const isKnownText =
          trimmedText.includes('x de') ||
          trimmedText.includes('A partir de') ||
          trimmedText.includes('Saindo') ||
          trimmedText.includes('dias') ||
          trimmedText.includes('noites') ||
          trimmedText.includes('por pessoa') ||
          trimmedText === 'Aéreo + Hotel' ||
          trimmedText.length === 0;

        if (!isKnownText) {
          // Verificar se está dentro de um card (buscar um ancestor que contenha "A partir de" e "x de")
          let ancestor = div.parentElement;
          let isInCard = false;
          while (ancestor && ancestor !== targetContainer) {
            const ancestorText = ancestor.textContent || '';
            if (ancestorText.includes('A partir de') && ancestorText.includes('x de')) {
              isInCard = true;
              break;
            }
            ancestor = ancestor.parentElement;
          }

          if (isInCard && trimmedText !== 'Aéreo + Hotel') {
            span.textContent = 'Aéreo + Hotel';
            hotelDivsReplaced++;
          }
        }
      }
    });
    if (hotelDivsReplaced > 0) {
      console.log(`✅ ${hotelDivsReplaced} nome(s) de hotel substituído(s) por "Aéreo + Hotel"`);
    }

    // 2.2. Substituir "Fernando de Noronha" por "Noronha" nos títulos
    // Buscar spans que contêm "Fernando de Noronha"
    const allSpansForTitle = targetContainer.querySelectorAll('span');
    let titlesModified = 0;
    allSpansForTitle.forEach((span) => {
      const text = span.textContent || '';
      if (text.includes('Fernando de Noronha')) {
        span.textContent = 'Noronha';
        titlesModified++;
      }
    });
    if (titlesModified > 0) {
      console.log(
        `✅ ${titlesModified} título(s) modificado(s): "Fernando de Noronha" → "Noronha"`
      );
    }

    // 3. Estilizar botões "Compre agora" (buscar por value, sem depender de classes)
    const allInputs = targetContainer.querySelectorAll('input[type="button"]');
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

    // 4. Remover spans com dias/noites (buscar por conteúdo, não por classe)
    const allSpansForDays = targetContainer.querySelectorAll('span');
    let daysSpansRemoved = 0;
    allSpansForDays.forEach((span) => {
      const text = span.textContent || '';
      // Verificar se contém "dias" ou "noites" (os números podem variar)
      if ((text.includes('dias') || text.includes('noites')) && /\d+/.test(text)) {
        span.remove();
        daysSpansRemoved++;
      }
    });
    if (daysSpansRemoved > 0) {
      console.log(`✅ Removidos ${daysSpansRemoved} span(s) de dias/noites`);
    }

    // 4.1. Remover spans com "por pessoa"
    const allSpansForPerson = targetContainer.querySelectorAll('span');
    let personSpansRemoved = 0;
    allSpansForPerson.forEach((span) => {
      const text = span.textContent || '';
      // Verificar se contém "por pessoa"
      if (text.includes('por pessoa')) {
        span.remove();
        personSpansRemoved++;
      }
    });
    if (personSpansRemoved > 0) {
      console.log(`✅ Removidos ${personSpansRemoved} span(s) "por pessoa"`);
    }

    // 4.2. Personalizar font-size de spans que contêm "Saindo"
    const allSpansForDeparture = targetContainer.querySelectorAll('span');
    let departureSpansStyled = 0;
    allSpansForDeparture.forEach((span) => {
      const text = span.textContent || '';
      // Verificar se contém "Saindo"
      if (text.includes('Saindo')) {
        span.style.setProperty('font-size', '16px', 'important');
        departureSpansStyled++;
      }
    });
    if (departureSpansStyled > 0) {
      console.log(`✅ Font-size aplicado em ${departureSpansStyled} span(s) "Saindo"`);
    }

    // 5. Aplicar min-height: initial !important em divs que contêm "A partir de:"
    const allDivsForPrice = targetContainer.querySelectorAll('div');
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

    // 5.1. Aplicar gap de 6px nos containers dos cards
    // Buscar divs que contêm "A partir de" e "x de" e que têm múltiplos filhos div
    const allDivsForGap = targetContainer.querySelectorAll('div');
    let gapApplied = 0;
    allDivsForGap.forEach((div) => {
      const text = div.textContent || '';
      // Verificar se contém "A partir de" e "x de" (estrutura de card)
      if (text.includes('A partir de') && text.includes('x de')) {
        // Verificar se tem múltiplos filhos div (estrutura: css-e92yew, css-385o3a, css-1ago99h)
        const childDivs = Array.from(div.children).filter((child) => child.tagName === 'DIV');
        if (childDivs.length >= 2) {
          // Aplicar gap de 6px
          div.style.setProperty('gap', '6px', 'important');
          // Garantir que seja flex ou grid para o gap funcionar
          const computedDisplay = window.getComputedStyle(div).display;
          if (computedDisplay !== 'flex' && computedDisplay !== 'grid') {
            div.style.setProperty('display', 'flex', 'important');
            div.style.setProperty('flex-direction', 'column', 'important');
          }
          gapApplied++;
        }
      }
    });
    if (gapApplied > 0) {
      console.log(`✅ Gap de 6px aplicado em ${gapApplied} container(s) de card`);
    }

    // 6. Adicionar badge "Mais Vendido" no primeiro card
    // Buscar cards pela estrutura: divs que contenham imagens (img) e preços ("x de")
    const allDivs = targetContainer.querySelectorAll('div');
    const cards = [];
    allDivs.forEach((div) => {
      const hasImage = div.querySelector('img');
      const hasPrice = Array.from(div.querySelectorAll('span')).some((span) =>
        span.textContent.includes('x de')
      );
      if (hasImage && hasPrice) {
        cards.push(div);
      }
    });

    if (cards.length > 0) {
      const firstCard = cards[0];

      // Verificar se o badge já existe no container do primeiro card
      const cardWrapper = firstCard.closest('div') || firstCard.parentElement;
      if (cardWrapper && !cardWrapper.querySelector('.badge-mais-vendido')) {
        // Criar o badge
        const badge = document.createElement('div');
        badge.className = 'badge-mais-vendido';
        badge.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
            <path d="M8 0L9.5 5.5L15 7L9.5 8.5L8 14L6.5 8.5L1 7L6.5 5.5L8 0Z" fill="#8B4513"/>
          </svg>
          <span>Mais Vendido</span>
        `;
        badge.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #FFD700;
          color: #8B4513;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 12px;
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;

        // Garantir que o container tenha position relative
        const computedStyle = window.getComputedStyle(cardWrapper);
        if (computedStyle.position === 'static') {
          cardWrapper.style.position = 'relative';
        }

        // Inserir o badge no início do container
        cardWrapper.insertBefore(badge, cardWrapper.firstChild);
        console.log('✅ Badge "Mais Vendido" adicionado no primeiro card');
      }
    }
  }

  // Função para inicializar
  function init() {
    // Tentar encontrar o container correto
    targetContainer = findCardsContainer();

    if (targetContainer) {
      console.log('Container com cards encontrado!');

      // Aplicar personalização imediatamente
      customizeCards();

      // Configurar MutationObserver apenas no container correto
      if (!observer) {
        observer = new MutationObserver(() => {
          customizeCards();
        });

        observer.observe(targetContainer, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        console.log('MutationObserver configurado no container correto');
      }
    } else {
      console.log('Container com cards não encontrado, tentando novamente...');
      // Tentar novamente após um delay
      setTimeout(() => {
        init();
      }, 500);
    }
  }

  // Inicializar
  init();
})();
