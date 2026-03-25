(function () {
  let observer = null;
  let isProcessing = false;

  // Função para criar o container do H1 e texto de apoio
  function createHeadingContainer() {
    const container = document.createElement('div');
    container.className = 'azul-friday-hero-heading';
    container.setAttribute('data-hero-heading-inserted', 'true');

    // Criar o H1
    const h1 = document.createElement('h1');
    h1.innerHTML =
      '<span style="color: #00b4e2;">Azul Friday</span>: a melhor época para turbinar seus pontos';
    h1.style.cssText =
      'font-size: 32px; font-weight: 700; line-height: 1.2; margin: 0 0 16px 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Criar o texto de apoio
    const supportText = document.createElement('p');
    supportText.innerHTML =
      'Aproveite <span style="color: #00b4e2;">bônus exclusivos</span> em compra de pontos, parceiros de varejo e resgates promocionais.';
    supportText.style.cssText =
      'font-size: 18px; font-weight: 400; line-height: 1.5; margin: 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Adicionar elementos ao container
    container.appendChild(h1);
    container.appendChild(supportText);

    // Estilos do container
    container.style.cssText =
      'padding: 30px 16px 20px; max-width: 1200px; margin: 0 auto; box-sizing: border-box; width: 100%;';

    return container;
  }

  // Função para inserir o H1 e texto dentro do container do banner
  function insertHeading() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi inserido
    if (document.querySelector('[data-hero-heading-inserted]')) {
      return;
    }

    // Buscar o container específico: container-capsule.containerDefaultNoPadding.css-pbbmh8
    const bannerContainer = document.querySelector(
      '.container-capsule.containerDefaultNoPadding.css-pbbmh8'
    );

    if (!bannerContainer) {
      return;
    }

    // Buscar o primeiro div filho que contém o botão
    const firstDiv = bannerContainer.querySelector('div:first-child');
    if (!firstDiv) {
      return;
    }

    isProcessing = true;

    try {
      // Criar o container com H1 e texto
      const headingContainer = createHeadingContainer();

      // Inserir antes do primeiro div (que contém o botão do banner)
      bannerContainer.insertBefore(headingContainer, firstDiv);

      console.log('H1 e texto de apoio inseridos com sucesso dentro do container do banner');
    } catch (error) {
      console.error('Erro ao inserir H1 e texto de apoio:', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função para remover o H2 "Junte ainda mais pontos"
  function removeJuntePontosH2() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi removido
    if (document.querySelector('[data-junte-pontos-removed]')) {
      return;
    }

    // Buscar o H2 com o texto específico
    const h2Elements = document.querySelectorAll('h2');
    let targetH2 = null;

    for (let i = 0; i < h2Elements.length; i++) {
      const h2 = h2Elements[i];
      if (
        h2.textContent.includes('Junte ainda mais pontos para aproveitar a melhor época do ano')
      ) {
        targetH2 = h2;
        break;
      }
    }

    if (targetH2) {
      // Buscar o container pai com classe css-putdhw
      const parentContainer = targetH2.closest('.css-putdhw');
      if (parentContainer) {
        parentContainer.remove();
        console.log('H2 "Junte ainda mais pontos" removido com sucesso');
      } else {
        targetH2.remove();
        console.log('H2 "Junte ainda mais pontos" removido com sucesso');
      }
      document.body.setAttribute('data-junte-pontos-removed', 'true');
    }
  }

  // Função para criar o container do H2 e texto de apoio (Acúmulo Turbo)
  function createAcumuloTurboContainer() {
    const container = document.createElement('div');
    container.className = 'azul-friday-acumulo-turbo';
    container.setAttribute('data-acumulo-turbo-inserted', 'true');

    // Criar o H2
    const h2 = document.createElement('h2');
    h2.innerHTML = '<span style="color: #00b4e2;">Multiplique</span> seu saldo rapidamente';
    h2.style.cssText =
      'font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 12px 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Criar o texto de apoio
    const supportText = document.createElement('p');
    supportText.innerHTML =
      'Faltam pontos para viajar? Aproveite <span style="color: #00b4e2;">descontos</span> na compra de pontos ou ganhe <span style="color: #00b4e2;">turbinado</span> com a Casas Bahia.';
    supportText.style.cssText =
      'font-size: 16px; font-weight: 400; line-height: 1.5; margin: 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Adicionar elementos ao container
    container.appendChild(h2);
    container.appendChild(supportText);

    // Estilos do container
    container.style.cssText =
      'padding: 0 16px 20px; max-width: 1200px; margin: 0 auto; box-sizing: border-box;';

    return container;
  }

  // Função para inserir o H2 e texto antes do banner das Casas Bahia
  function insertAcumuloTurbo() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi inserido
    if (document.querySelector('[data-acumulo-turbo-inserted]')) {
      return;
    }

    // Buscar o banner das Casas Bahia
    const casasBahiaImages = document.querySelectorAll(
      'img[src*="bnr-casas-bahia"], img[src*="casas-bahia"]'
    );

    if (casasBahiaImages.length === 0) {
      return;
    }

    // Encontrar o container pai do banner
    let targetContainer = null;

    for (let i = 0; i < casasBahiaImages.length; i++) {
      const img = casasBahiaImages[i];
      // Buscar o container-capsule mais próximo que contém o banner
      let parent = img.parentElement;

      while (parent && parent !== document.body) {
        if (
          parent.classList.contains('container-capsule') &&
          parent.classList.contains('containerDefault')
        ) {
          targetContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (targetContainer) {
        break;
      }
    }

    if (!targetContainer) {
      return;
    }

    isProcessing = true;

    try {
      // Criar o container com H2 e texto
      const acumuloTurboContainer = createAcumuloTurboContainer();

      // Inserir antes do container do banner
      targetContainer.parentNode.insertBefore(acumuloTurboContainer, targetContainer);

      console.log(
        'H2 e texto de apoio (Acúmulo Turbo) inseridos com sucesso antes do banner das Casas Bahia'
      );
    } catch (error) {
      console.error('Erro ao inserir H2 e texto de apoio (Acúmulo Turbo):', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função para criar o container do H2 e texto de apoio (Novos Clientes)
  function createNovosClientesContainer() {
    const container = document.createElement('div');
    container.className = 'azul-friday-novos-clientes';
    container.setAttribute('data-novos-clientes-inserted', 'true');

    // Criar o H2
    const h2 = document.createElement('h2');
    h2.innerHTML =
      'Não faz parte do Azul Fidelidade? <span style="color: #00b4e2;">Comece ganhando</span>';
    h2.style.cssText =
      'font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 12px 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Criar o texto de apoio
    const supportText = document.createElement('p');
    supportText.innerHTML =
      'Cadastre-se agora com o cupom da <span style="color: #00b4e2;">Azul Friday</span> e garanta pontos bônus na largada.';
    supportText.style.cssText =
      'font-size: 16px; font-weight: 400; line-height: 1.5; margin: 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Adicionar elementos ao container
    container.appendChild(h2);
    container.appendChild(supportText);

    // Estilos do container
    container.style.cssText =
      'padding: 10px 16px 20px; max-width: 1200px; margin: 0 auto; box-sizing: border-box;';

    return container;
  }

  // Função para inserir o H2 e texto antes do banner de cadastro
  function insertNovosClientes() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi inserido
    if (document.querySelector('[data-novos-clientes-inserted]')) {
      return;
    }

    // Buscar o banner de cadastro
    const cadastroImages = document.querySelectorAll(
      'img[src*="bnr-clube_cadastrar"], img[src*="clube_cadastrar"]'
    );

    if (cadastroImages.length === 0) {
      return;
    }

    // Encontrar o container pai do banner
    let targetContainer = null;

    for (let i = 0; i < cadastroImages.length; i++) {
      const img = cadastroImages[i];
      let parent = img.parentElement;

      while (parent && parent !== document.body) {
        if (
          parent.classList.contains('container-capsule') &&
          parent.classList.contains('containerDefault')
        ) {
          targetContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (targetContainer) {
        break;
      }
    }

    if (!targetContainer) {
      return;
    }

    isProcessing = true;

    try {
      const novosClientesContainer = createNovosClientesContainer();
      targetContainer.parentNode.insertBefore(novosClientesContainer, targetContainer);

      console.log(
        'H2 e texto de apoio (Novos Clientes) inseridos com sucesso antes do banner de cadastro'
      );
    } catch (error) {
      console.error('Erro ao inserir H2 e texto de apoio (Novos Clientes):', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função para criar o container do H2 e texto de apoio (Parceiros)
  function createParceirosContainer() {
    const container = document.createElement('div');
    container.className = 'azul-friday-parceiros';
    container.setAttribute('data-parceiros-inserted', 'true');

    // Criar o H2
    const h2 = document.createElement('h2');
    h2.innerHTML = 'Junte pontos no seu <span style="color: #00b4e2;">dia a dia</span>';
    h2.style.cssText =
      'font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 12px 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Criar o texto de apoio
    const supportText = document.createElement('p');
    supportText.innerHTML =
      'Seguro, malas, estacionamento e cosméticos. Tudo vira <span style="color: #00b4e2;">pontos Azul</span>.';
    supportText.style.cssText =
      'font-size: 16px; font-weight: 400; line-height: 1.5; margin: 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Adicionar elementos ao container
    container.appendChild(h2);
    container.appendChild(supportText);

    // Estilos do container
    container.style.cssText =
      'padding: 0 16px 20px; max-width: 1200px; margin: 0 auto; box-sizing: border-box;';

    return container;
  }

  // Função para inserir o H2 e texto antes do carrossel de parceiros
  function insertParceiros() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi inserido
    if (document.querySelector('[data-parceiros-inserted]')) {
      return;
    }

    // Buscar o carrossel de parceiros (Assist Card, Portal das Malas, Natura, Airport Park)
    const parceirosImages = document.querySelectorAll(
      'img[src*="logo-assist-card"], img[src*="logo-portal"], img[src*="logo-natura"], img[src*="logo-airport-park"]'
    );

    if (parceirosImages.length === 0) {
      return;
    }

    // Encontrar o container pai do carrossel
    let targetContainer = null;

    for (let i = 0; i < parceirosImages.length; i++) {
      const img = parceirosImages[i];
      let parent = img.parentElement;

      while (parent && parent !== document.body) {
        if (
          parent.classList.contains('container-capsule') &&
          parent.classList.contains('containerDefault')
        ) {
          targetContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (targetContainer) {
        break;
      }
    }

    if (!targetContainer) {
      return;
    }

    isProcessing = true;

    try {
      const parceirosContainer = createParceirosContainer();
      targetContainer.parentNode.insertBefore(parceirosContainer, targetContainer);

      console.log(
        'H2 e texto de apoio (Parceiros) inseridos com sucesso antes do carrossel de parceiros'
      );
    } catch (error) {
      console.error('Erro ao inserir H2 e texto de apoio (Parceiros):', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função para criar o container do H2 e texto de apoio (Resgate)
  function createResgateContainer() {
    const container = document.createElement('div');
    container.className = 'azul-friday-resgate';
    container.setAttribute('data-resgate-inserted', 'true');

    // Criar o H2
    const h2 = document.createElement('h2');
    h2.innerHTML =
      'Use seus pontos: voos a partir de <span style="color: #00b4e2;">3.000 pontos</span>';
    h2.style.cssText =
      'font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 12px 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Criar o texto de apoio
    const supportText = document.createElement('p');
    supportText.innerHTML =
      'O <span style="color: #00b4e2;">menor resgate do ano</span> para destinos incríveis pelo Brasil.';
    supportText.style.cssText =
      'font-size: 16px; font-weight: 400; line-height: 1.5; margin: 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

    // Adicionar elementos ao container
    container.appendChild(h2);
    container.appendChild(supportText);

    // Estilos do container
    container.style.cssText =
      'padding: 30px 16px 0; max-width: 1200px; margin: 0 auto; box-sizing: border-box;';

    return container;
  }

  // Função para inserir o H2 e texto antes dos cards de voos e substituir o H2 existente
  function insertResgate() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi inserido
    if (document.querySelector('[data-resgate-inserted]')) {
      return;
    }

    // Buscar os cards de voos (Curitiba, São Paulo, Rio, etc)
    const voosImages = document.querySelectorAll(
      'img[alt="Curitiba"], img[alt="São Paulo"], img[alt="Rio de Janeiro"], img[alt="Brasília"]'
    );

    if (voosImages.length === 0) {
      return;
    }

    // Encontrar o container pai dos cards
    let targetContainer = null;

    for (let i = 0; i < voosImages.length; i++) {
      const img = voosImages[i];
      let parent = img.parentElement;

      while (parent && parent !== document.body) {
        if (
          parent.classList.contains('container-capsule') &&
          parent.classList.contains('containerDefault')
        ) {
          targetContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (targetContainer) {
        break;
      }
    }

    if (!targetContainer) {
      return;
    }

    // Buscar e substituir o H2 existente dentro do container
    const existingH2 = targetContainer.querySelector('h2');
    if (existingH2) {
      existingH2.remove();
    }

    isProcessing = true;

    try {
      const resgateContainer = createResgateContainer();
      targetContainer.parentNode.insertBefore(resgateContainer, targetContainer);

      console.log('H2 e texto de apoio (Resgate) inseridos com sucesso antes dos cards de voos');
    } catch (error) {
      console.error('Erro ao inserir H2 e texto de apoio (Resgate):', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função auxiliar para processar um botão de card
  function processCardButton(button) {
    // Verificar se já tem overlay
    if (button.querySelector('[data-card-overlay]')) {
      return;
    }

    // Detectar se é mobile ou desktop
    const isMobile = window.innerWidth <= 768;

    // Mapeamento dos cards
    const cardsData = {
      desktop: [
        {
          title: 'Principais ofertas',
          buttonText: 'Ver destaques',
          altText: 'Mulher dirigindo um buggy em dunas de areia',
          imageSrc: ['MODULO FIDELIDADE', 'MODULO%20FIDELIDADE'],
        },
        {
          title: 'Passagens aéreas',
          buttonText: 'Ver ofertas',
          altText: 'Avião Azul voando',
          imageSrc: ['MODULO VIAGENS', 'MODULO%20VIAGENS'],
        },
        {
          title: 'Pacotes, hotéis e ingressos',
          buttonText: 'Ver pacotes',
          altText: 'Guarda-sol e cadeira em uma praia',
          imageSrc: ['bnr-viagem-completa'],
        },
      ],
      mobile: [
        {
          title: 'Principais ofertas',
          buttonText: 'Ver destaques',
          altText: 'Mulher dirigindo um buggy em dunas de areia',
          imageSrc: ['bnr-principal'],
        },
        {
          title: 'Pacotes, hotéis e ingressos',
          buttonText: 'Ver pacotes',
          altText: 'Guarda-sol e cadeira em uma praia',
          imageSrc: ['bnr-viagem-completa'],
        },
        {
          title: 'Passagens aéreas',
          buttonText: 'Ver ofertas',
          altText: 'Avião Azul voando',
          imageSrc: ['bnr-geral-via_aereo-desktop', 'bnr-geral-via_aereo'],
        },
      ],
    };

    // Encontrar qual card é baseado na imagem
    let cardData = null;
    const images = button.querySelectorAll('img');
    const currentCardsData = isMobile ? cardsData.mobile : cardsData.desktop;

    for (let i = 0; i < images.length; i++) {
      const imgSrc = images[i].src;
      const decodedSrc = decodeURIComponent(imgSrc);

      // Identificar card pela imagem
      if (isMobile) {
        // Mobile: bnr-principal → Principais ofertas
        if (imgSrc.includes('bnr-principal') || decodedSrc.includes('bnr-principal')) {
          cardData = currentCardsData[0]; // Principais ofertas
          break;
        }
        // Mobile: bnr-viagem-completa → Pacotes, hotéis e ingressos
        else if (
          imgSrc.includes('bnr-viagem-completa') ||
          decodedSrc.includes('bnr-viagem-completa')
        ) {
          cardData = currentCardsData[1]; // Pacotes, hotéis e ingressos
          break;
        }
        // Mobile: bnr-geral-via_aereo-desktop → Passagens aéreas
        else if (
          imgSrc.includes('bnr-geral-via_aereo-desktop') ||
          decodedSrc.includes('bnr-geral-via_aereo-desktop') ||
          imgSrc.includes('bnr-geral-via_aereo') ||
          decodedSrc.includes('bnr-geral-via_aereo')
        ) {
          cardData = currentCardsData[2]; // Passagens aéreas
          break;
        }
      } else {
        // Desktop: MODULO FIDELIDADE → Principais ofertas
        if (
          imgSrc.includes('MODULO FIDELIDADE') ||
          decodedSrc.includes('MODULO FIDELIDADE') ||
          imgSrc.includes('MODULO%20FIDELIDADE')
        ) {
          cardData = currentCardsData[0]; // Principais ofertas
          break;
        }
        // Desktop: MODULO VIAGENS → Passagens aéreas
        else if (
          imgSrc.includes('MODULO VIAGENS') ||
          decodedSrc.includes('MODULO VIAGENS') ||
          imgSrc.includes('MODULO%20VIAGENS')
        ) {
          cardData = currentCardsData[1]; // Passagens aéreas
          break;
        }
        // Desktop: bnr-viagem-completa → Pacotes, hotéis e ingressos
        else if (
          imgSrc.includes('bnr-viagem-completa') ||
          decodedSrc.includes('bnr-viagem-completa')
        ) {
          cardData = currentCardsData[2]; // Pacotes, hotéis e ingressos
          break;
        }
      }
    }

    if (!cardData) {
      return;
    }

    // Adicionar alt text nas imagens
    images.forEach(function (img) {
      if (!img.alt || img.alt === '') {
        img.alt = cardData.altText;
      }
    });

    // Criar container do botão com position relative se não tiver
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }

    // Criar overlay na parte inferior
    const overlay = document.createElement('div');
    overlay.setAttribute('data-card-overlay', 'true');
    overlay.className = 'azul-friday-card-overlay';
    overlay.style.cssText =
      'position: absolute; bottom: 0; left: 0; right: 0; height: 42%; background: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 16px; box-sizing: border-box; z-index: 10;';

    // Criar título
    const title = document.createElement('h3');
    title.textContent = cardData.title;
    title.style.cssText =
      'color: #0061a0; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; font-family: "Helvetica Neue", Arial; text-align: left;';

    // Criar botão CTA
    const ctaButton = document.createElement('button');
    ctaButton.textContent = cardData.buttonText;
    ctaButton.type = 'button';
    ctaButton.style.cssText =
      'background-color: rgb(207, 82, 122); color: rgb(255, 255, 255); border: none; border-radius: 65px; padding: 12px 24px; font-size: 18px; font-weight: 700; font-family: "Helvetica Neue", Arial; cursor: pointer; width: 236px;';

    // Adicionar hover effect
    ctaButton.addEventListener('mouseenter', function () {
      ctaButton.style.opacity = '0.9';
    });
    ctaButton.addEventListener('mouseleave', function () {
      ctaButton.style.opacity = '1';
    });

    // Adicionar elementos ao overlay
    overlay.appendChild(title);
    overlay.appendChild(ctaButton);

    // Adicionar overlay ao botão
    button.appendChild(overlay);

    console.log('Overlay adicionado ao card: ' + cardData.title);
  }

  // Função para adicionar overlays nos cards "Quer mais?"
  function addCardsOverlay() {
    if (isProcessing) {
      return;
    }

    isProcessing = true;

    try {
      // Processar cards desktop
      const cardsContainerDesktop = document.querySelector('.css-1ngnp0i');
      if (cardsContainerDesktop) {
        const cardButtonsDesktop = cardsContainerDesktop.querySelectorAll('button.css-3uz0rz');
        cardButtonsDesktop.forEach(function (button) {
          processCardButton(button);
        });
      }

      // Processar cards mobile
      const cardsContainerMobile = document.querySelector('.css-13yzhr');
      if (cardsContainerMobile) {
        const cardButtonsMobile = cardsContainerMobile.querySelectorAll('button.css-3uz0rz');
        cardButtonsMobile.forEach(function (button) {
          processCardButton(button);
        });
      }

      console.log('Overlays dos cards "Quer mais?" processados (desktop e mobile)');
    } catch (error) {
      console.error('Erro ao adicionar overlays nos cards:', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função para substituir o H1 "Quer mais?" por H2
  function replaceQuerMais() {
    if (isProcessing) {
      return;
    }

    // Verificar se já foi substituído
    if (document.querySelector('[data-quer-mais-replaced]')) {
      return;
    }

    // Buscar o H1 com o texto "Quer mais?"
    const querMaisH1 = Array.from(document.querySelectorAll('h1')).find(function (h1) {
      return h1.textContent.includes('Quer mais?');
    });

    if (!querMaisH1) {
      return;
    }

    isProcessing = true;

    try {
      // Criar novo H2
      const h2 = document.createElement('h2');
      h2.innerHTML =
        'Quer mais? Temos <span style="color: #00b4e2;">descontos incríveis</span> pra você:';
      h2.style.cssText =
        'font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0; color: rgb(255, 255, 255); text-align: center; font-family: "Helvetica Neue", Arial;';

      // Substituir o H1 pelo H2
      querMaisH1.replaceWith(h2);
      h2.setAttribute('data-quer-mais-replaced', 'true');

      console.log('H1 "Quer mais?" substituído por H2 com sucesso');
    } catch (error) {
      console.error('Erro ao substituir H1 "Quer mais?":', error);
    } finally {
      isProcessing = false;
    }
  }

  // Função para aplicar estilos responsivos
  function applyResponsiveStyles() {
    // Verificar se os estilos já foram aplicados
    if (document.getElementById('azul-friday-hero-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'azul-friday-hero-styles';
    style.textContent =
      '@media (max-width: 768px) {' +
      '.azul-friday-hero-heading h1 {' +
      'font-size: 24px !important;' +
      '}' +
      '.azul-friday-hero-heading p {' +
      'font-size: 16px !important;' +
      '}' +
      '.azul-friday-hero-heading {' +
      'padding: 30px 16px 20px !important;' +
      '}' +
      '.azul-friday-acumulo-turbo h2 {' +
      'font-size: 22px !important;' +
      '}' +
      '.azul-friday-acumulo-turbo p {' +
      'font-size: 14px !important;' +
      '}' +
      '.azul-friday-acumulo-turbo {' +
      'padding: 0 16px 20px !important;' +
      '}' +
      '.azul-friday-novos-clientes h2 {' +
      'font-size: 22px !important;' +
      '}' +
      '.azul-friday-novos-clientes p {' +
      'font-size: 14px !important;' +
      '}' +
      '.azul-friday-novos-clientes {' +
      'padding: 10px 16px 20px !important;' +
      '}' +
      '.azul-friday-parceiros h2 {' +
      'font-size: 22px !important;' +
      '}' +
      '.azul-friday-parceiros p {' +
      'font-size: 14px !important;' +
      '}' +
      '.azul-friday-parceiros {' +
      'padding: 0 16px 20px !important;' +
      '}' +
      '.azul-friday-resgate h2 {' +
      'font-size: 22px !important;' +
      '}' +
      '.azul-friday-resgate p {' +
      'font-size: 14px !important;' +
      '}' +
      '.azul-friday-resgate {' +
      'padding: 30px 16px 0 !important;' +
      '}' +
      '.azul-friday-card-overlay {' +
      'height: 42% !important;' +
      'padding: 12px !important;' +
      '}' +
      '.azul-friday-card-overlay h3 {' +
      'font-size: 18px !important;' +
      'margin-bottom: 8px !important;' +
      '}' +
      '.azul-friday-card-overlay button {' +
      'padding: 10px 20px !important;' +
      'font-size: 16px !important;' +
      'width: 200px !important;' +
      '}' +
      '}' +
      '@media (min-width: 769px) and (max-width: 1024px) {' +
      '.azul-friday-hero-heading h1 {' +
      'font-size: 28px !important;' +
      '}' +
      '.azul-friday-acumulo-turbo h2 {' +
      'font-size: 26px !important;' +
      '}' +
      '.azul-friday-novos-clientes h2 {' +
      'font-size: 26px !important;' +
      '}' +
      '.azul-friday-parceiros h2 {' +
      'font-size: 26px !important;' +
      '}' +
      '.azul-friday-resgate h2 {' +
      'font-size: 26px !important;' +
      '}' +
      '}' +
      '@media (max-width: 478px) {' +
      '.azul-friday-card-overlay {' +
      'height: 42% !important;' +
      'padding: 12px !important;' +
      '}' +
      '.azul-friday-card-overlay h3 {' +
      'font-size: 16px !important;' +
      'margin-bottom: 4px !important;' +
      '}' +
      '.azul-friday-card-overlay button {' +
      'padding: 4px 15px !important;' +
      'font-size: 14px !important;' +
      'width: 160px !important;' +
      '}' +
      '}';

    document.head.appendChild(style);
  }

  // Função para inicializar
  function init() {
    // Aplicar estilos responsivos
    applyResponsiveStyles();

    // Executar imediatamente
    insertHeading();
    removeJuntePontosH2();
    insertAcumuloTurbo();
    insertNovosClientes();
    insertParceiros();
    insertResgate();
    replaceQuerMais();
    addCardsOverlay();

    // Executar novamente após um pequeno delay para garantir que os cards sejam processados
    setTimeout(function () {
      addCardsOverlay();
      removeJuntePontosH2();
    }, 500);

    // Usar MutationObserver para detectar quando os banners são adicionados
    observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];

        // Verificar se houve adição de nós
        if (mutation.addedNodes.length > 0) {
          insertHeading();
          removeJuntePontosH2();
          insertAcumuloTurbo();
          insertNovosClientes();
          insertParceiros();
          insertResgate();
          replaceQuerMais();
          addCardsOverlay();
        }
      }
    });

    // Observar mudanças no body
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
