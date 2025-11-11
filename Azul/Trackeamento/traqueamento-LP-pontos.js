//Traqueamento LP Azul Friday - Pontos - https://www.voeazul.com.br/br/pt/azul-friday/pontos

(function () {
  // Flag para evitar processamento múltiplo
  let listenersAdicionados = false;
  let intervaloPeriodicoAtivo = null;

  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[Tracking Pontos] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_banner_click_pontos ' + eventLabel;

    console.log('[Tracking Pontos] Analytics event triggered:', labelEvent);

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
      'header-fidelidade-prorrog-mobile': 'Banner Header Fidelidade',
      'header-fidelidade-prorrog-desktop': 'Banner Header Fidelidade',
      'bnr-multibancos-mobile': 'Banner Multibancos',
      'Group 11527 (1)': 'Banner Multibancos',
      'Group 11527': 'Banner C6',
      'bnr-c6-mobile': 'Banner C6',
      'bnr-adesao-mobile1': 'Banner Adesao',
      'bnr-upgrade-mobile1': 'Banner Upgrade',
      'banner-cadastro-mobile': 'Banner Cadastro',
      'header-cadastro-desktop-azf': 'Banner Cadastro',
      'bnr-facilidades-mobile': 'Banner Facilidades',
      'bnr-facilidades-desktop': 'Banner Facilidades',
      'bnr-principal': 'Banner Principal',
      'bnr-viagem-completa': 'Banner Viagem Completa',
      'bnr-geral-via_aereo-desktop': 'Banner Via Aereo',
      'MODULO FIDELIDADE': 'Banner Modulo Fidelidade',
      'MODULO VIAGENS': 'Banner Modulo Viagens',
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

    // Busca TODOS os containers com a classe css-oo7lgl (podem existir múltiplos)
    const containers = document.querySelectorAll('.container-capsule.css-oo7lgl');

    if (containers.length === 0) {
      return false;
    }

    console.log('[Tracking Pontos] Encontrados', containers.length, 'containers com css-oo7lgl');

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
      '[Tracking Pontos] Encontrados',
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
        console.log('[Tracking Pontos] Imagem encontrada:', imgSrc, '->', bannerName);
      } else {
        console.log('[Tracking Pontos] Nenhuma imagem encontrada no botão', index + 1);
      }

      botao.addEventListener('click', () => {
        analyticsEvent(bannerName);
      });

      console.log('[Tracking Pontos] Listener adicionado ao botão:', bannerName);
      botoesProcessados++;
    });

    // Se processou todos os botões, marca como completo
    if (botoesProcessados === botoes.length && botoes.length > 0) {
      listenersAdicionados = true;
      console.log('[Tracking Pontos] Todos os listeners foram adicionados com sucesso!');

      // Para a verificação periódica se estiver ativa
      if (intervaloPeriodicoAtivo) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking Pontos] Verificação periódica interrompida.');
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
        console.log('[Tracking Pontos] Listeners adicionados com sucesso na tentativa', tentativas);
        return; // Sucesso, para de tentar
      }

      if (tentativas < maxTentativas) {
        console.log(
          '[Tracking Pontos] Tentativa',
          tentativas,
          'de',
          maxTentativas,
          '- aguardando botões...'
        );
        setTimeout(tentarAdicionarListeners, 500);
      } else {
        console.log('[Tracking Pontos] Máximo de tentativas atingido. Continuando com observer...');
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
          console.log('[Tracking Pontos] Observer detectou mudanças, verificando botões...');
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
        console.log(
          '[Tracking Pontos] Verificação periódica encontrou os botões e foi interrompida.'
        );
        return;
      }

      if (verificacoesPeriodicas >= maxVerificacoesPeriodicas) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking Pontos] Verificações periódicas finalizadas.');
      }
    }, 2000);

    console.log('[Tracking Pontos] Script de rastreamento inicializado.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
