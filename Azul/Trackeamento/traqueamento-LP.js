//Traqueamento LP Azul Friday - https://www.voeazul.com.br/br/pt/azul-friday

(function () {
  // Flag para evitar processamento múltiplo
  let listenersAdicionados = false;
  let intervaloPeriodicoAtivo = null;

  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[Tracking] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_BF_banner_click ' + eventLabel;

    console.log('[Tracking] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getBannerName(imgSrc) {
    if (!imgSrc) return 'unknown';

    // Extrai o nome do arquivo da imagem
    const fileName = imgSrc.split('/').pop();

    // Remove a extensão e retorna o nome base
    const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

    // Mapeia nomes conhecidos para labels mais legíveis
    const nameMap = {
      'botao-aereo': 'Banner Passagens',
      'botao-aereo-mobilev2': 'Banner Passagens Mobile',
      'botao-aereo-deskv2': 'Banner Aereo',
      'banner-viagemcompleta1': 'Banner Viagem Completa',
      'banner-fidelidade-mobile': 'Banner Fidelidade',
      'livelo-prorrog': 'Banner Livelo',
      'bnr-livelo-prorrog-desktop': 'Banner Livelo',
      'bnr-pacotes': 'Banner Pacotes',
      'bnr-engajamento-livelo-mobile': 'Banner Engajamento Livelo',
      'bnr-engajamento-livelo-desktop': 'Banner Engajamento Livelo',
    };

    // Tenta encontrar um match parcial
    for (const [key, value] of Object.entries(nameMap)) {
      if (nameWithoutExt.includes(key)) {
        return value;
      }
    }

    // Se não encontrar, retorna o nome do arquivo sem extensão
    return nameWithoutExt;
  }

  function addClickListeners() {
    // Se já adicionou os listeners corretos, não processa novamente
    if (listenersAdicionados) {
      return true;
    }

    // Busca TODOS os containers com a classe css-oo7lgl (podem existir múltiplos)
    const containers = document.querySelectorAll('.container-capsule.css-oo7lgl');

    if (containers.length === 0) {
      return false;
    }

    console.log('[Tracking] Encontrados', containers.length, 'containers com css-oo7lgl');

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
      '[Tracking] Encontrados',
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
        console.log('[Tracking] Imagem encontrada:', imgSrc, '->', bannerName);
      } else {
        console.log('[Tracking] Nenhuma imagem encontrada no botão', index + 1);
      }

      botao.addEventListener('click', () => {
        analyticsEvent(bannerName);
      });

      console.log('[Tracking] Listener adicionado ao botão:', bannerName);
      botoesProcessados++;
    });

    // Se processou todos os botões, marca como completo
    if (botoesProcessados === botoes.length && botoes.length > 0) {
      listenersAdicionados = true;
      console.log('[Tracking] Todos os listeners foram adicionados com sucesso!');

      // Para a verificação periódica se estiver ativa
      if (intervaloPeriodicoAtivo) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking] Verificação periódica interrompida.');
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
        console.log('[Tracking] Listeners adicionados com sucesso na tentativa', tentativas);
        return; // Sucesso, para de tentar
      }

      if (tentativas < maxTentativas) {
        console.log(
          '[Tracking] Tentativa',
          tentativas,
          'de',
          maxTentativas,
          '- aguardando botões...'
        );
        setTimeout(tentarAdicionarListeners, 500);
      } else {
        console.log('[Tracking] Máximo de tentativas atingido. Continuando com observer...');
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
            const containerCorreto = document.querySelector('.container-capsule.css-oo7lgl');

            // Verifica se o container correto (css-oo7lgl) foi adicionado
            if (
              node.classList &&
              (node.classList.contains('css-oo7lgl') ||
                (node.classList.contains('container-capsule') &&
                  node.classList.contains('css-oo7lgl')) ||
                node.querySelector('.container-capsule.css-oo7lgl'))
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
          console.log('[Tracking] Observer detectou mudanças, verificando botões...');
          addClickListeners();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Verificação periódica como fallback (a cada 2 segundos, por 30 segundos)
    let verificacoesPeriodicas = 0;
    const maxVerificacoesPeriodicas = 15;
    intervaloPeriodicoAtivo = setInterval(() => {
      // Se já completou, para a verificação
      if (listenersAdicionados) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        return;
      }

      verificacoesPeriodicas++;
      const sucesso = addClickListeners();

      if (sucesso) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking] Verificação periódica encontrou os botões e foi interrompida.');
        return;
      }

      if (verificacoesPeriodicas >= maxVerificacoesPeriodicas) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking] Verificações periódicas finalizadas.');
      }
    }, 2000);

    console.log('[Tracking] Script de rastreamento inicializado.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
