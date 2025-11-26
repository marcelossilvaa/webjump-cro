//Traqueamento LP Facilidades - https://www.voeazul.com.br/br/pt/ofertas/facilidades

(function () {
  // Flag para evitar processamento múltiplo
  let listenersAdicionados = false;
  let intervaloPeriodicoAtivo = null;

  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[Tracking Facilidades] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_BF_banner_click_facilidades ' + eventLabel;

    console.log('[Tracking Facilidades] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      let pathname = window.location.pathname;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_BF_lp_' + pathname;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getBannerName(imgSrc) {
    if (!imgSrc) return 'unknown';

    // Extrai o nome do arquivo da imagem
    let fileName = imgSrc.split('/').pop();

    // Decodifica URL (remove %20, %28, etc)
    try {
      fileName = decodeURIComponent(fileName);
    } catch (e) {
      // Se falhar na decodificação, usa o nome original
    }

    // Remove a extensão e retorna o nome base
    const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

    // Mapeia nomes conhecidos para labels mais legíveis
    const nameMap = {
      // Banners Header
      'banner-header-mobile-buy': 'Banner Header Compre Pontos',
      'banner-header-desk-buy': 'Banner Header Compre Pontos',
      'bnr-header-buy-mobile': 'Banner Header Compre Pontos',
      'bnr-header-buy-desktop': 'Banner Header Compre Pontos',

      // Banners de Pontos (valores específicos)
      'bnr-points-5k': 'Banner 5 mil Pontos',
      'bnr-points-10k': 'Banner 10 mil Pontos',
      'bnr-points-25k': 'Banner 25 mil Pontos',

      // Banners de Faixas
      'bnr-faixa5k': 'Banner Faixa 5 mil',
      'bnr-faixa20k': 'Banner Faixa 20 mil',
      'bnr-faixa100k': 'Banner Faixa 100 mil',

      // Banner Pontos Viagens
      'bnr-points-viagens': 'Banner Pontos Viagens',

      // Banner Regras
      'banner-regra-mobile-buy': 'Banner Regras Compra',
      'banner-regra-desk-buy': 'Banner Regras Compra',

      // Banner Fidelidade
      'bnr-points-fidelidade': 'Banner Pontos Fidelidade',

      // Banners antigos (mantidos para compatibilidade)
      'bnr-bonus-mobile': 'Banner Bonus Pontos',
      'bnr-bonus-desktop': 'Banner Bonus Pontos',
      'clube-generico-mobile': 'Banner Clube Azul',
      'clube-generico-desktop': 'Banner Clube Azul',
    };

    // Tenta encontrar um match parcial (case insensitive)
    const nameLower = nameWithoutExt.toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (nameLower.includes(key.toLowerCase()) || nameWithoutExt.includes(key)) {
        return value;
      }
    }

    // Se não encontrar, retorna o nome do arquivo sem extensão (limpo)
    return nameWithoutExt.replace(/%20/g, ' ').replace(/%28/g, '(').replace(/%29/g, ')');
  }

  function addClickListeners() {
    // Se já adicionou os listeners corretos, não processa novamente
    if (listenersAdicionados) {
      return true;
    }

    // Busca TODOS os containers com as classes css-oo7lgl ou css-pbbmh8 (podem existir múltiplos)
    const containersOo7lgl = document.querySelectorAll('.container-capsule.css-oo7lgl');
    const containersPbbmh8 = document.querySelectorAll('.container-capsule.css-pbbmh8');
    const containers = Array.from(containersOo7lgl).concat(Array.from(containersPbbmh8));

    if (containers.length === 0) {
      return false;
    }

    console.log(
      '[Tracking Facilidades] Encontrados',
      containers.length,
      'containers (css-oo7lgl:',
      containersOo7lgl.length,
      ', css-pbbmh8:',
      containersPbbmh8.length,
      ')'
    );

    // Busca TODOS os botões css-3uz0rz dentro de TODOS os containers
    let botoes = [];
    containers.forEach((container) => {
      const botoesContainer = container.querySelectorAll('button.css-3uz0rz');
      botoes = botoes.concat(Array.from(botoesContainer));
    });

    // Remove duplicatas (caso algum botão apareça em múltiplos containers)
    botoes = Array.from(new Set(botoes));

    if (botoes.length === 0) {
      return false; // Ainda não apareceram os botões corretos
    }

    console.log(
      '[Tracking Facilidades] Encontrados',
      botoes.length,
      'botões corretos (css-3uz0rz) em',
      containers.length,
      'containers'
    );

    let botoesProcessados = 0;

    botoes.forEach((botao, index) => {
      // Verifica se o listener já foi adicionado
      if (botao.hasAttribute('data-analytics-added')) {
        botoesProcessados++;
        return;
      }

      botao.setAttribute('data-analytics-added', 'true');

      // Tenta encontrar a imagem dentro do botão
      const img = botao.querySelector('img');
      let bannerName = 'Banner ' + (index + 1);

      if (img) {
        // Prioriza a imagem desktop, se não encontrar usa a mobile
        const imgDesktop = botao.querySelector('img.css-bq6zc0');
        const imgSrc = imgDesktop ? imgDesktop.src : img.src;
        bannerName = getBannerName(imgSrc);
        console.log('[Tracking Facilidades] Imagem encontrada:', imgSrc, '->', bannerName);
      } else {
        console.log('[Tracking Facilidades] Nenhuma imagem encontrada no botão', index + 1);
      }

      botao.addEventListener('click', () => {
        analyticsEvent(bannerName);
      });

      console.log('[Tracking Facilidades] Listener adicionado ao botão:', bannerName);
      botoesProcessados++;
    });

    // Se processou todos os botões, marca como completo
    if (botoesProcessados === botoes.length && botoes.length > 0) {
      listenersAdicionados = true;
      console.log('[Tracking Facilidades] Todos os listeners foram adicionados com sucesso!');

      // Para a verificação periódica se estiver ativa
      if (intervaloPeriodicoAtivo) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking Facilidades] Verificação periódica interrompida.');
      }

      return true;
    }

    return false;
  }

  function init() {
    let tentativas = 0;
    const maxTentativas = 10; // Limite de tentativas para evitar loops infinitos

    function tentarAdicionarListeners() {
      if (listenersAdicionados) {
        return; // Já completou, não tenta mais
      }

      tentativas++;

      // Tenta adicionar os listeners
      const sucesso = addClickListeners();

      if (sucesso) {
        console.log(
          '[Tracking Facilidades] Listeners adicionados com sucesso na tentativa',
          tentativas
        );
        return;
      }

      // Se não conseguiu e ainda tem tentativas, tenta novamente
      if (tentativas < maxTentativas) {
        console.log(
          '[Tracking Facilidades] Tentativa',
          tentativas,
          'de',
          maxTentativas,
          '- aguardando botões...'
        );
        setTimeout(tentarAdicionarListeners, 500);
      } else {
        console.log(
          '[Tracking Facilidades] Máximo de tentativas atingido. Continuando com observer...'
        );
      }
    }

    // Tenta adicionar os listeners imediatamente
    tentarAdicionarListeners();

    // Observer para detectar quando os elementos são adicionados ao DOM
    const observer = new MutationObserver((mutations) => {
      let deveVerificar = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const containerOo7lgl = document.querySelector('.container-capsule.css-oo7lgl');
            const containerPbbmh8 = document.querySelector('.container-capsule.css-pbbmh8');
            const containerCorreto = containerOo7lgl || containerPbbmh8;

            // Verifica se o container correto (css-oo7lgl ou css-pbbmh8) foi adicionado
            if (
              node.classList &&
              (node.classList.contains('css-oo7lgl') ||
                node.classList.contains('css-pbbmh8') ||
                (node.classList.contains('container-capsule') &&
                  (node.classList.contains('css-oo7lgl') ||
                    node.classList.contains('css-pbbmh8'))) ||
                node.querySelector('.container-capsule.css-oo7lgl') ||
                node.querySelector('.container-capsule.css-pbbmh8'))
            ) {
              deveVerificar = true;
            }

            // Verifica se é um botão com a classe específica
            if (
              node.nodeName === 'BUTTON' &&
              node.classList &&
              node.classList.contains('css-3uz0rz')
            ) {
              if (containerCorreto && containerCorreto.contains(node)) {
                deveVerificar = true;
              }
            }

            // Verifica se botões foram adicionados dentro do container correto
            if (node.querySelector && node.querySelector('button.css-3uz0rz')) {
              if (containerCorreto && containerCorreto.contains(node)) {
                deveVerificar = true;
              }
            }

            // Verifica se qualquer elemento foi adicionado dentro do container correto
            if (containerCorreto && containerCorreto.contains(node)) {
              // Verifica se há botões dentro do node adicionado
              if (node.querySelector && node.querySelector('button')) {
                deveVerificar = true;
              }
            }
          }
        });
      });

      if (deveVerificar && !listenersAdicionados) {
        setTimeout(() => {
          console.log('[Tracking Facilidades] Observer detectou mudanças, verificando botões...');
          addClickListeners();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Verificação periódica adicional (fallback)
    intervaloPeriodicoAtivo = setInterval(() => {
      if (!listenersAdicionados) {
        console.log('[Tracking Facilidades] Verificação periódica...');
        addClickListeners();
      }
    }, 2000);

    console.log('[Tracking Facilidades] Script de rastreamento inicializado.');
  }

  // Aguarda o DOM estar pronto antes de inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
