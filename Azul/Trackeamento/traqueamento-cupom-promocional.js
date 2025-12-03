//Traqueamento Cupom Promocional - Campo de aplicação de cupons de desconto

(function () {
  // Flag para evitar processamento múltiplo
  let listenersAdicionados = false;
  let intervaloPeriodicoAtivo = null;
  let observerAtivo = null;
  let isProcessingError = false;
  let debounceTimerError = null;

  function analyticsEvent(eventAction, couponValue = '') {
    if (!eventAction) {
      console.log('[Tracking Cupom] Missing parameters for analytics event.');
      return;
    }

    // Mapeamento de ações
    const actionMap = {
      aplicar_clique: 'cupom_aplicar_clique',
      sucesso: 'cupom_aplicado_sucesso',
      erro: 'cupom_aplicado_erro',
    };

    const eventType = actionMap[eventAction] || eventAction;
    const labelEvent = 'AT_cupom_' + eventType;

    console.log('[Tracking Cupom] Analytics event triggered:', labelEvent, 'Value:', couponValue);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent; // Informação principal da ação
      s.eVar84 = 'AT_cupom_value ' + (couponValue || 'sem_valor'); // Valor do cupom

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getInputValue() {
    // Busca o input do cupom
    const input = document.querySelector('input[data-test-id="fop-promocode-input"]');
    return input ? input.value.trim() : '';
  }

  function observarMensagemErro() {
    // Observer para detectar mensagens de erro
    const containerCupom = document.querySelector('.sc-5d84be43-12.eBvBuG');
    if (!containerCupom) return;

    // Cria um observer para detectar mudanças no DOM relacionadas ao cupom
    const errorObserver = new MutationObserver((mutations) => {
      // Proteção contra loops infinitos
      if (isProcessingError) {
        return;
      }

      // Debounce para evitar processamento excessivo
      if (debounceTimerError) {
        clearTimeout(debounceTimerError);
      }

      debounceTimerError = setTimeout(() => {
        isProcessingError = true;

        mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verifica se é uma mensagem de erro
            const textoNode = node.textContent || '';

            if (
              textoNode.includes('Código promocional Inválido') ||
              textoNode.includes('inválido') ||
              textoNode.includes('Inválido')
            ) {
              console.log('[Tracking Cupom] Erro detectado: Cupom inválido');
              const cupomValue = getInputValue();
              analyticsEvent('erro', cupomValue);
            }
            // Verifica mensagens de sucesso (pode variar dependendo da implementação)
            else if (
              textoNode.includes('aplicado com sucesso') ||
              textoNode.includes('Cupom aplicado') ||
              node.classList.contains('success') ||
              node.classList.contains('sucesso')
            ) {
              console.log('[Tracking Cupom] Sucesso detectado: Cupom aplicado');
              const cupomValue = getInputValue();
              analyticsEvent('sucesso', cupomValue);
            }
          }
        });

        // Verifica mudanças de atributos que possam indicar sucesso/erro
        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          const target = mutation.target;

          // Verifica classes que indicam erro
          if (
            target.classList.contains('error') ||
            target.classList.contains('invalid') ||
            target.classList.contains('erro')
          ) {
            console.log('[Tracking Cupom] Erro detectado por classe CSS');
            const cupomValue = getInputValue();
            analyticsEvent('erro', cupomValue);
          }

          // Verifica classes que indicam sucesso
          if (
            target.classList.contains('success') ||
            target.classList.contains('valid') ||
            target.classList.contains('sucesso')
          ) {
            console.log('[Tracking Cupom] Sucesso detectado por classe CSS');
            const cupomValue = getInputValue();
            analyticsEvent('sucesso', cupomValue);
          }
        }
      });

        isProcessingError = false;
      }, 100); // Aguarda 100ms antes de processar
    });

    // Observa o container do cupom e seus pais
    errorObserver.observe(containerCupom.parentElement || containerCupom, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    console.log('[Tracking Cupom] Observer de mensagens de erro/sucesso ativado');
    return errorObserver;
  }

  function addClickListeners() {
    // Se já adicionou os listeners corretos, não processa novamente
    if (listenersAdicionados) {
      return true;
    }

    // Busca o botão "Aplicar" do cupom
    const botaoAplicar = document.querySelector('div[data-test-id="fop-promocode-apply-btn"]');

    if (!botaoAplicar) {
      return false; // Ainda não apareceu o botão
    }

    // Verifica se o listener já foi adicionado
    if (botaoAplicar.hasAttribute('data-analytics-added')) {
      listenersAdicionados = true;
      return true;
    }

    console.log('[Tracking Cupom] Botão "Aplicar" encontrado');

    // Adiciona o listener de clique
    botaoAplicar.setAttribute('data-analytics-added', 'true');

    botaoAplicar.addEventListener('click', () => {
      const cupomValue = getInputValue();
      console.log('[Tracking Cupom] Botão "Aplicar" clicado. Valor:', cupomValue);
      analyticsEvent('aplicar_clique', cupomValue);

      // Aguarda um pouco e tenta detectar sucesso/erro
      setTimeout(() => {
        verificarResultadoAplicacao();
      }, 1000);
    });

    console.log('[Tracking Cupom] Listener adicionado ao botão "Aplicar"');

    // Inicia o observer de mensagens de erro/sucesso
    observerAtivo = observarMensagemErro();

    listenersAdicionados = true;

    // Para a verificação periódica se estiver ativa
    if (intervaloPeriodicoAtivo) {
      clearInterval(intervaloPeriodicoAtivo);
      intervaloPeriodicoAtivo = null;
      console.log('[Tracking Cupom] Verificação periódica interrompida.');
    }

    return true;
  }

  function verificarResultadoAplicacao() {
    // Verifica se há mensagem de erro visível
    const mensagensErro = document.body.textContent || '';
    const cupomValue = getInputValue();

    if (
      mensagensErro.includes('Código promocional Inválido') ||
      mensagensErro.includes('inválido')
    ) {
      console.log('[Tracking Cupom] Verificação: Erro detectado');
      // Não dispara evento aqui pois o observer já detectou
      return 'erro';
    }

    // Verifica se há indicação de sucesso
    const containerCupom = document.querySelector('.sc-5d84be43-12.eBvBuG');
    if (containerCupom) {
      const textoContainer = containerCupom.textContent || '';
      if (textoContainer.includes('aplicado') || textoContainer.includes('sucesso')) {
        console.log('[Tracking Cupom] Verificação: Sucesso detectado');
        // Não dispara evento aqui pois o observer já detectou
        return 'sucesso';
      }
    }

    console.log('[Tracking Cupom] Verificação: Aguardando resposta...');
    return 'pendente';
  }

  function init() {
    let tentativas = 0;
    const maxTentativas = 10;

    function tentarAdicionarListeners() {
      if (listenersAdicionados) {
        return;
      }

      tentativas++;

      const sucesso = addClickListeners();

      if (sucesso) {
        console.log('[Tracking Cupom] Listeners adicionados com sucesso na tentativa', tentativas);
        return;
      }

      if (tentativas < maxTentativas) {
        console.log(
          '[Tracking Cupom] Tentativa',
          tentativas,
          'de',
          maxTentativas,
          '- aguardando botão...'
        );
        setTimeout(tentarAdicionarListeners, 500);
      } else {
        console.log('[Tracking Cupom] Máximo de tentativas atingido. Continuando com observer...');
      }
    }

    // Tenta adicionar os listeners imediatamente
    tentarAdicionarListeners();

    // Observer para detectar quando o campo de cupom é adicionado ao DOM
    const observer = new MutationObserver((mutations) => {
      let deveVerificar = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verifica se o botão "Aplicar" foi adicionado
            if (
              node.getAttribute &&
              node.getAttribute('data-test-id') === 'fop-promocode-apply-btn'
            ) {
              deveVerificar = true;
            }

            // Verifica se o container do cupom foi adicionado
            if (
              node.classList &&
              (node.classList.contains('sc-5d84be43-12') || node.classList.contains('eBvBuG'))
            ) {
              deveVerificar = true;
            }

            // Verifica se há elementos dentro do node adicionado
            if (node.querySelector) {
              if (node.querySelector('div[data-test-id="fop-promocode-apply-btn"]')) {
                deveVerificar = true;
              }
            }
          }
        });
      });

      if (deveVerificar && !listenersAdicionados) {
        setTimeout(() => {
          console.log('[Tracking Cupom] Observer detectou mudanças, verificando botão...');
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
        console.log('[Tracking Cupom] Verificação periódica encontrou o botão e foi interrompida.');
        return;
      }

      if (verificacoesPeriodicas >= maxVerificacoesPeriodicas) {
        clearInterval(intervaloPeriodicoAtivo);
        intervaloPeriodicoAtivo = null;
        console.log('[Tracking Cupom] Verificações periódicas finalizadas.');
      }
    }, 2000);

    console.log('[Tracking Cupom] Script de rastreamento inicializado.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
