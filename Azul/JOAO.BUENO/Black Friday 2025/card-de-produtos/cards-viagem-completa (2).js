(function () {
  let targetContainer = null;
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;

  // Função para encontrar o container que contém os cards com "x de"
  function findCardsContainer() {
    // Buscar todos os containers com essas classes
    const allContainers = document.querySelectorAll(
      '.container-capsule.containerDefault.hide-on-mobile'
    );

    console.log('Encontrados ' + allContainers.length + ' container(s) com as classes');

    // Verificar qual container contém spans com "x de"
    for (let i = 0; i < allContainers.length; i++) {
      const container = allContainers[i];
      const spans = container.querySelectorAll('span');

      // Verificar se algum span contém "x de"
      for (let j = 0; j < spans.length; j++) {
        const text = spans[j].textContent || '';
        if (text.includes('x de')) {
          console.log('Container ' + (i + 1) + ' contém cards com "x de"');
          return container;
        }
      }
    }

    return null;
  }

  // Função para aplicar personalizações nos cards
  function customizeCards() {
    // Evitar execução simultânea
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    // Se ainda não encontrou o container correto, tentar encontrar
    if (!targetContainer) {
      targetContainer = findCardsContainer();
    }

    // Se ainda não encontrou, retornar
    if (!targetContainer) {
      console.log('Container com cards não encontrado ainda');
      isProcessing = false;
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
        'Font-size aplicado e &nbsp; removido em ' + priceSpans.length + ' span(s) de preço'
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
      console.log('Texto de hotel modificado em ' + hotelSpansModified + ' span(s)');
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
      console.log(hotelDivsReplaced + ' nome(s) de hotel substituído(s) por "Aéreo + Hotel"');
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
      console.log(titlesModified + ' título(s) modificado(s): "Fernando de Noronha" → "Noronha"');
    }

    // 3. Estilizar botões "Compre agora" (buscar por value, sem depender de classes)
    const allInputs = targetContainer.querySelectorAll('input[type="button"]');
    let buttonsStyled = 0;
    allInputs.forEach((button) => {
      if (button.value === 'Compre agora') {
        button.style.setProperty('background-color', '#CF527A', 'important');
        button.style.setProperty('border-radius', '65px', 'important');
        button.style.setProperty('font-weight', '700', 'important');

        // Adicionar estilos de hover
        if (!button.hasAttribute('data-hover-listener-added')) {
          button.addEventListener('mouseenter', () => {
            button.style.setProperty('transform', 'translateY(-2px)', 'important');
            button.style.setProperty(
              'box-shadow',
              '0 6px 16px rgba(255, 79, 154, 0.35)',
              'important'
            );
          });

          button.addEventListener('mouseleave', () => {
            button.style.removeProperty('transform');
            button.style.removeProperty('box-shadow');
          });

          button.setAttribute('data-hover-listener-added', 'true');
        }

        buttonsStyled++;
      }
    });
    if (buttonsStyled > 0) {
      console.log('Botões estilizados: ' + buttonsStyled);
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
      console.log('Removidos ' + daysSpansRemoved + ' span(s) de dias/noites');
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
      console.log('Removidos ' + personSpansRemoved + ' span(s) "por pessoa"');
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
      console.log('Font-size aplicado em ' + departureSpansStyled + ' span(s) "Saindo"');
    }

    // 5. Aplicar min-height: initial !important APENAS na div específica css-1rdnbft
    // que contém "A partir de:" E o preço ("x de") como filhos diretos span
    const allDivsForPrice = targetContainer.querySelectorAll('div');
    let priceDivsFixed = 0;
    allDivsForPrice.forEach((div) => {
      // Verificar se tem filhos span diretos
      const childSpans = Array.from(div.children).filter((child) => child.tagName === 'SPAN');

      // Verificar se tem pelo menos 2 spans
      if (childSpans.length >= 2) {
        // Verificar se um span contém "A partir de:" e outro contém "x de"
        const hasApartirDe = childSpans.some((span) => span.textContent.includes('A partir de:'));
        const hasPrice = childSpans.some((span) => span.textContent.includes('x de'));

        // Aplicar min-height apenas se tiver a estrutura correta (css-1rdnbft)
        if (hasApartirDe && hasPrice && !div.hasAttribute('data-min-height-applied')) {
          div.style.setProperty('min-height', 'initial', 'important');
          div.setAttribute('data-min-height-applied', 'true');
          priceDivsFixed++;
        }
      }
    });
    if (priceDivsFixed > 0) {
      console.log('Min-height aplicado em ' + priceDivsFixed + ' div(s) css-1rdnbft');
    }

    // 5.1. Aplicar gap de 6px na div específica css-d8o86p do card
    // Buscar divs que têm exatamente 3 filhos div (css-e92yew, css-385o3a, css-1ago99h)
    // e que contêm "Saindo", "Aéreo + Hotel" e "A partir de"
    const allDivsForGap = targetContainer.querySelectorAll('div');
    let gapApplied = 0;
    allDivsForGap.forEach((div) => {
      // Verificar se tem exatamente 3 filhos div
      const childDivs = Array.from(div.children).filter((child) => child.tagName === 'DIV');
      if (childDivs.length === 3) {
        // Verificar se NÃO tem imagem como filho direto
        const hasDirectImage = Array.from(div.children).some((child) => child.tagName === 'IMG');
        if (!hasDirectImage) {
          // Verificar se o parent direto tem uma imagem como irmão (estrutura css-b7xk)
          const parent = div.parentElement;
          if (parent) {
            const parentHasImage = Array.from(parent.children).some(
              (child) => child.tagName === 'IMG'
            );

            if (parentHasImage) {
              const text = div.textContent || '';
              // Verificar se contém "Saindo", "Aéreo + Hotel" e "A partir de" (estrutura css-d8o86p)
              if (
                text.includes('Saindo') &&
                text.includes('Aéreo + Hotel') &&
                text.includes('A partir de')
              ) {
                // Verificar se já tem gap aplicado para evitar reaplicação
                if (!div.hasAttribute('data-gap-applied')) {
                  // Aplicar gap de 6px
                  div.style.setProperty('gap', '6px', 'important');
                  // Garantir que seja flex para o gap funcionar
                  const computedDisplay = window.getComputedStyle(div).display;
                  if (computedDisplay !== 'flex' && computedDisplay !== 'grid') {
                    div.style.setProperty('display', 'flex', 'important');
                    div.style.setProperty('flex-direction', 'column', 'important');
                  }
                  div.setAttribute('data-gap-applied', 'true');
                  gapApplied++;
                }
              }
            }
          }
        }
      }
    });
    if (gapApplied > 0) {
      console.log('Gap de 6px aplicado em ' + gapApplied + ' div(s) css-d8o86p');
    }

    // 5.2. Aplicar max-width: 266px na div css-b7xk (que contém img + css-d8o86p)
    // Buscar divs que contêm imagem como filho direto E um css-d8o86p
    const allDivsForMaxWidth = targetContainer.querySelectorAll('div');
    let maxWidthApplied = 0;
    allDivsForMaxWidth.forEach((div) => {
      // Verificar se tem imagem como filho direto
      const hasDirectImage = Array.from(div.children).some((child) => child.tagName === 'IMG');
      if (hasDirectImage) {
        // Verificar se tem um filho css-d8o86p (que tem gap aplicado ou estrutura correta)
        const hasD8o86p = Array.from(div.children).some((child) => {
          if (child.tagName === 'DIV') {
            const text = child.textContent || '';
            return (
              text.includes('Saindo') &&
              text.includes('Aéreo + Hotel') &&
              text.includes('A partir de')
            );
          }
          return false;
        });

        if (hasD8o86p && !div.hasAttribute('data-max-width-applied')) {
          // Aplicar max-width de 266px
          div.style.setProperty('max-width', '266px', 'important');
          div.setAttribute('data-max-width-applied', 'true');
          maxWidthApplied++;
        }
      }
    });
    if (maxWidthApplied > 0) {
      console.log('Max-width de 266px aplicado em ' + maxWidthApplied + ' div(s) css-b7xk');
    }

    // 6. Adicionar margin-top: 10px em todos os cards com imagem
    // Buscar cards individuais: divs que contêm exatamente 1 filho div (css-b7xk)
    // que por sua vez contém uma imagem
    const allDivs = targetContainer.querySelectorAll('div');
    let marginTopApplied = 0;

    allDivs.forEach((div) => {
      // Verificar se tem exatamente 1 filho div (estrutura css-117ubr)
      const childDivs = Array.from(div.children).filter((child) => child.tagName === 'DIV');
      if (childDivs.length === 1) {
        const childDiv = childDivs[0];
        // Verificar se o filho tem uma imagem como filho direto (estrutura css-b7xk)
        const hasDirectImage = Array.from(childDiv.children).some(
          (child) => child.tagName === 'IMG'
        );
        // Verificar se o filho tem o atributo data-max-width-applied (confirmação de css-b7xk)
        const hasMaxWidthApplied = childDiv.hasAttribute('data-max-width-applied');

        if (hasDirectImage && hasMaxWidthApplied) {
          // Aplicar margin-top: 10px no card (css-117ubr)
          if (!div.hasAttribute('data-margin-top-applied')) {
            div.style.setProperty('margin-top', '10px', 'important');
            div.setAttribute('data-margin-top-applied', 'true');
            marginTopApplied++;
          }
        }
      }
    });
    if (marginTopApplied > 0) {
      console.log('Margin-top de 10px aplicado em ' + marginTopApplied + ' card(s) com imagem');
    }

    // 6.1. Adicionar badge "Mais Barato" no card com menor valor
    // Buscar cards individuais: divs que contêm exatamente 1 filho div (css-b7xk)
    // que por sua vez contém uma imagem e um css-d8o86p
    const cardsWithPrices = [];

    allDivs.forEach((div) => {
      // Verificar se tem exatamente 1 filho div (estrutura css-117ubr)
      const childDivs = Array.from(div.children).filter((child) => child.tagName === 'DIV');
      if (childDivs.length === 1) {
        const childDiv = childDivs[0];
        // Verificar se o filho tem uma imagem como filho direto (estrutura css-b7xk)
        const hasDirectImage = Array.from(childDiv.children).some(
          (child) => child.tagName === 'IMG'
        );
        // Verificar se o filho tem o atributo data-max-width-applied (confirmação de css-b7xk)
        const hasMaxWidthApplied = childDiv.hasAttribute('data-max-width-applied');

        if (hasDirectImage && hasMaxWidthApplied) {
          const text = childDiv.textContent || '';
          const hasPrice = text.includes('x de');
          const hasApartirDe = text.includes('A partir de');

          if (hasPrice && hasApartirDe) {
            // Buscar o span que contém o preço (formato: "15x de R$ 92,29")
            const priceSpans = childDiv.querySelectorAll('span');
            let priceValue = null;

            for (let k = 0; k < priceSpans.length; k++) {
              const spanText = priceSpans[k].textContent || '';
              if (spanText.includes('x de') && spanText.includes('R$')) {
                // Extrair o preço (formato: "15x de R$ 92,29" ou "15x de R$92,29")
                const priceMatch = spanText.match(/R\$\s*(\d+(?:,\d+)?)/);
                if (priceMatch && priceMatch[1]) {
                  // Converter para número (substituir vírgula por ponto)
                  priceValue = parseFloat(priceMatch[1].replace(',', '.'));
                  break;
                }
              }
            }

            if (priceValue !== null && !isNaN(priceValue)) {
              cardsWithPrices.push({
                element: div,
                price: priceValue,
              });
            }
          }
        }
      }
    });

    console.log('Encontrados ' + cardsWithPrices.length + ' cards com preços para análise');

    if (cardsWithPrices.length > 0) {
      // Remover TODAS as badges antigas no container inteiro
      const allOldBadges = targetContainer.querySelectorAll('.badge-mais-barato');
      allOldBadges.forEach((oldBadge) => {
        oldBadge.remove();
      });
      console.log('Removidas ' + allOldBadges.length + ' badge(s) antiga(s)');

      // Encontrar o card com menor preço
      const cheapestCard = cardsWithPrices.reduce((min, card) =>
        card.price < min.price ? card : min
      );

      console.log(
        'Card mais barato encontrado: R$ ' + cheapestCard.price + ', elemento:',
        cheapestCard.element
      );

      // Aplicar badge no card mais barato
      if (!cheapestCard.element.querySelector('.badge-mais-barato')) {
        // Criar o badge
        const badge = document.createElement('div');
        badge.className = 'badge-mais-barato';
        badge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-right: 4px;">
            <g clip-path="url(#clip0_2048_33528)">
              <path d="M2.00024 7.00008C1.90562 7.0004 1.81286 6.97387 1.73272 6.92357C1.65258 6.87327 1.58836 6.80126 1.54752 6.71591C1.50667 6.63056 1.49089 6.53537 1.50199 6.44141C1.51309 6.34745 1.55063 6.25856 1.61024 6.18508L6.56024 1.08508C6.59737 1.04222 6.64797 1.01326 6.70373 1.00295C6.75949 0.992636 6.8171 1.00159 6.86711 1.02833C6.91711 1.05508 6.95653 1.09803 6.97891 1.15014C7.00128 1.20224 7.00528 1.26041 6.99024 1.31508L6.03024 4.32508C6.00193 4.40084 5.99243 4.48234 6.00254 4.56258C6.01265 4.64283 6.04207 4.71942 6.08829 4.78579C6.1345 4.85217 6.19613 4.90634 6.26788 4.94366C6.33963 4.98098 6.41936 5.00034 6.50024 5.00008H10.0002C10.0949 4.99976 10.1876 5.02629 10.2678 5.07659C10.3479 5.12689 10.4121 5.1989 10.453 5.28425C10.4938 5.3696 10.5096 5.46479 10.4985 5.55875C10.4874 5.65272 10.4499 5.7416 10.3902 5.81508L5.44024 10.9151C5.40311 10.9579 5.35251 10.9869 5.29675 10.9972C5.24099 11.0075 5.18338 10.9986 5.13338 10.9718C5.08337 10.9451 5.04395 10.9021 5.02157 10.85C4.9992 10.7979 4.9952 10.7398 5.01024 10.6851L5.97024 7.67508C5.99855 7.59932 6.00805 7.51782 5.99794 7.43758C5.98783 7.35734 5.95841 7.28074 5.9122 7.21437C5.86598 7.148 5.80435 7.09382 5.7326 7.0565C5.66085 7.01918 5.58112 6.99982 5.50024 7.00008H2.00024Z" fill="#733E0A" stroke="#733E0A" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_2048_33528">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span>Mais Barato</span>
        `;
        badge.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #FFD700;
          color: #733E0A;
          padding: 5px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 12px;
          line-height: 1;
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          pointer-events: none;
        `;

        // Garantir que o card tenha position relative e overflow visível
        const computedStyle = window.getComputedStyle(cheapestCard.element);
        if (computedStyle.position === 'static') {
          cheapestCard.element.style.position = 'relative';
        }

        // Garantir que o card tenha z-index menor que a badge
        const cardZIndex = computedStyle.zIndex;
        if (cardZIndex === 'auto' || parseInt(cardZIndex) < 9999) {
          cheapestCard.element.style.setProperty('z-index', '1', 'important');
        }

        // Garantir que o overflow não corte a badge
        const overflow = computedStyle.overflow;
        if (overflow === 'hidden' || overflow === 'clip') {
          cheapestCard.element.style.setProperty('overflow', 'visible', 'important');
        }

        // Verificar também o parent do card (css-b7xk) para garantir que não corte
        const cardChild = cheapestCard.element.querySelector('div[data-max-width-applied]');
        if (cardChild) {
          const childComputedStyle = window.getComputedStyle(cardChild);
          const childOverflow = childComputedStyle.overflow;
          if (childOverflow === 'hidden' || childOverflow === 'clip') {
            cardChild.style.setProperty('overflow', 'visible', 'important');
          }
          // Garantir que o parent também tenha z-index menor
          const childZIndex = childComputedStyle.zIndex;
          if (childZIndex === 'auto' || parseInt(childZIndex) < 9999) {
            cardChild.style.setProperty('z-index', '1', 'important');
          }
        }

        // Verificar o parent do card (css-117ubr) para garantir overflow visível
        const cardParent = cheapestCard.element.parentElement;
        if (cardParent) {
          const parentComputedStyle = window.getComputedStyle(cardParent);
          const parentOverflow = parentComputedStyle.overflow;
          if (parentOverflow === 'hidden' || parentOverflow === 'clip') {
            cardParent.style.setProperty('overflow', 'visible', 'important');
          }
        }

        // Inserir o badge no início do card (dentro dele, no topo)
        cheapestCard.element.insertBefore(badge, cheapestCard.element.firstChild);
        console.log(
          'Badge "Mais Barato" adicionado no card com menor valor (R$ ' + cheapestCard.price + ')'
        );
      }
    }

    // Resetar flag de processamento
    isProcessing = false;
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
        observer = new MutationObserver((mutations) => {
          // Ignorar mudanças causadas por badges (evitar loop)
          const hasBadgeChanges = mutations.some((mutation) => {
            const addedNodes = Array.from(mutation.addedNodes);
            const removedNodes = Array.from(mutation.removedNodes);
            return (
              addedNodes.some(
                (node) =>
                  node.nodeType === 1 &&
                  (node.classList?.contains('badge-mais-barato') ||
                    node.querySelector?.('.badge-mais-barato'))
              ) ||
              removedNodes.some(
                (node) =>
                  node.nodeType === 1 &&
                  (node.classList?.contains('badge-mais-barato') ||
                    node.querySelector?.('.badge-mais-barato'))
              )
            );
          });

          if (hasBadgeChanges) {
            return; // Ignorar mudanças de badges
          }

          // Debounce para evitar loops
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(() => {
            customizeCards();
          }, 300);
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
