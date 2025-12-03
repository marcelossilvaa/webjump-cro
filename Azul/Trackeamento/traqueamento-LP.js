//Traqueamento LP Azul Friday - https://www.voeazul.com.br/br/pt/azul-friday

(function () {
  // Flag para evitar processamento múltiplo
  let listenersAdicionados = false;
  let intervaloPeriodicoAtivo = null;

  function analyticsEvent(eventLabel, bannerType = 'banner') {
    // bannerType pode ser: 'banner' ou 'mini_banner'
    if (eventLabel === undefined || !eventLabel) {
      console.log('[Tracking] Missing parameters for analytics event.');
      return;
    }

    const eventType = bannerType === 'mini_banner' ? 'mini_banner_click' : 'banner_click';
    const labelEvent = 'AT_BF_' + eventType + '_lp ' + eventLabel;

    console.log('[Tracking] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_BF_lp_Principal';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function isMiniBanner(imgSrc, buttonElement) {
    if (!imgSrc) return false;

    // Lista de imagens que são mini_banners
    const miniBannerPatterns = [
      'inter-35-desk',
      'inter-20-desk',
      'pacotes-20-desk',
      'pacotes-15-desk',
      'bnr-principal',
      'brn-areo',
      'bnr-pontos',
      'bnr-ofertas-1',
      'bnr-ofertas-2',
      'bnr-ofertas-3',
      'bnr-nordeste-desktop',
      'bnr-nordeste-mobile',
      'bnr-pacotes',
      'banner-fidelidade-mobile',
    ];

    // Verifica se a imagem corresponde a algum dos padrões
    for (const pattern of miniBannerPatterns) {
      if (imgSrc.includes(pattern)) {
        return true;
      }
    }

    // Verifica se o botão está dentro de containers específicos de mini_banner
    if (buttonElement) {
      const parent = buttonElement.closest('.css-1e8rjdr, .css-1391tka, .css-1ngnp0i, .css-615bn6');
      if (parent) {
        return true;
      }
    }

    return false;
  }

  function getBannerName(imgSrc) {
    if (!imgSrc) return 'unknown';

    // Extrai o nome do arquivo da imagem
    const fileName = imgSrc.split('/').pop();

    // Remove a extensão e retorna o nome base
    const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

    // Mapeia nomes conhecidos para labels mais legíveis
    const nameMap = {
      'bnr-passagens20-desk': 'Banner Passagens',
      'bnr-passagens20-mob': 'Banner Passagens',
      'botao-aereo': 'Banner Passagens',
      'botao-aereo-deskv2': 'Banner Passagens',
      'banner-viagemcompleta1': 'Banner Pacotes',
      'banner-viagemcompleta2': 'Banner Pacotes',
      'bnr-pacotes': 'Mini Banner Pacotes',
      'banner-fidelidade-mobile': 'Mini Banner Fidelidade',
      'livelo-prorrog': 'Banner Livelo',
      'bnr-livelo-prorrog-desktop': 'Banner Livelo',
      'bnr-engajamento-livelo': 'Banner Livelo',
      'bnr-engajamento-livelo-mobile': 'Banner Livelo',
      'bnr-engajamento-livelo-desktop': 'Banner Livelo',
      // Mini banners específicos
      'bnr-nordeste-desktop': 'Mini Banner Nordeste',
      'bnr-nordeste-mobile': 'Mini Banner Nordeste',
      'bnr-engajamento': 'Mini Banner Fidelidade',
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

  function isBannerButton(button) {
    // Verifica se é um botão que contém imagens de banner
    // Critérios: button[type="button"] que contém img com src contendo /content/dam/voe-azul/
    if (button.nodeName !== 'BUTTON' || button.type !== 'button') {
      return false;
    }

    const imgs = button.querySelectorAll('img');
    if (imgs.length === 0) {
      return false;
    }

    // Verifica se pelo menos uma imagem tem o path de banner
    for (let img of imgs) {
      if (img.src && img.src.includes('/content/dam/voe-azul/')) {
        return true;
      }
    }

    return false;
  }

  function addClickListeners() {
    // Se já adicionou os listeners corretos, não processa novamente
    if (listenersAdicionados) {
      return true;
    }

    // Estratégia 1: Busca por container-capsule (classe mais estável)
    let containers = document.querySelectorAll('.container-capsule');

    // Estratégia 2: Se não encontrar containers, busca diretamente os botões
    let botoes = [];

    if (containers.length > 0) {
      console.log('[Tracking] Encontrados', containers.length, 'containers (container-capsule)');

      // Busca botões dentro dos containers que são banners
      containers.forEach((container) => {
        const todosBotoes = container.querySelectorAll('button[type="button"]');
        todosBotoes.forEach((botao) => {
          if (isBannerButton(botao)) {
            botoes.push(botao);
          }
        });
      });
    } else {
      // Fallback: busca todos os botões no documento e filtra
      console.log('[Tracking] Containers não encontrados, buscando botões diretamente...');
      const todosBotoes = document.querySelectorAll('button[type="button"]');
      todosBotoes.forEach((botao) => {
        if (isBannerButton(botao)) {
          botoes.push(botao);
        }
      });
    }

    // Remove duplicatas
    botoes = Array.from(new Set(botoes));

    if (botoes.length === 0) {
      return false; // Ainda não apareceram os botões corretos
    }

    console.log('[Tracking] Encontrados', botoes.length, 'botões de banner');

    let botoesProcessados = 0;

    botoes.forEach((botao, index) => {
      // Verifica se o listener já foi adicionado
      if (botao.hasAttribute('data-analytics-added')) {
        botoesProcessados++;
        return;
      }

      botao.setAttribute('data-analytics-added', 'true');

      // Tenta encontrar a imagem dentro do botão
      const imgs = botao.querySelectorAll('img');
      let bannerName = 'Banner ' + (index + 1);
      let isMini = false;

      if (imgs.length > 0) {
        // Busca a imagem com path de banner (prioriza desktop se houver múltiplas)
        let imgSrc = null;
        for (let img of imgs) {
          if (img.src && img.src.includes('/content/dam/voe-azul/')) {
            // Prioriza imagens que não sejam mobile (geralmente desktop tem paths mais completos)
            if (!img.src.includes('-mobile') && !imgSrc) {
              imgSrc = img.src;
            } else if (!imgSrc) {
              imgSrc = img.src;
            }
          }
        }

        if (imgSrc) {
          bannerName = getBannerName(imgSrc);
          isMini = isMiniBanner(imgSrc, botao);
          console.log(
            '[Tracking] Imagem encontrada:',
            imgSrc,
            '->',
            bannerName,
            isMini ? '(mini_banner)' : ''
          );
        } else {
          console.log('[Tracking] Nenhuma imagem de banner encontrada no botão', index + 1);
        }
      } else {
        console.log('[Tracking] Nenhuma imagem encontrada no botão', index + 1);
      }

      const bannerType = isMini ? 'mini_banner' : 'banner';

      botao.addEventListener('click', () => {
        analyticsEvent(bannerName, bannerType);
      });

      console.log('[Tracking] Listener adicionado ao botão:', bannerName, '(' + bannerType + ')');
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
            // Verifica se é um container-capsule (classe estável)
            if (node.classList && node.classList.contains('container-capsule')) {
              deveVerificar = true;
            }

            // Verifica se é um botão de banner
            if (node.nodeName === 'BUTTON' && isBannerButton(node)) {
              deveVerificar = true;
            }

            // Verifica se há containers dentro do node adicionado
            if (node.querySelector && node.querySelector('.container-capsule')) {
              deveVerificar = true;
            }

            // Verifica se há botões de banner dentro do node adicionado
            if (node.querySelector) {
              const botoes = node.querySelectorAll('button[type="button"]');
              for (let botao of botoes) {
                if (isBannerButton(botao)) {
                  deveVerificar = true;
                  break;
                }
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
