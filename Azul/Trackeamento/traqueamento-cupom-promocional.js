//Traqueamento Cupom Promocional - Campo de aplicação de cupons de desconto

(function () {
  // Flag para evitar processamento múltiplo
  let listenersAdicionados = false;
  let intervaloPeriodicoAtivo = null;

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
    const labelEvent = 'AT_cupom ' + eventType;

    // Diferencia o eVar84 baseado no tipo de evento
    let eVar84Value = '';
    if (eventAction === 'aplicar_clique') {
      // No clique, envia o valor do cupom
      eVar84Value = 'AT_cupom_value ' + (couponValue || 'sem_valor');
    } else if (eventAction === 'sucesso') {
      // No sucesso, envia apenas o status
      eVar84Value = 'AT_cupom_status_sucesso';
    } else if (eventAction === 'erro') {
      // No erro, envia apenas o status
      eVar84Value = 'AT_cupom_status_erro';
    } else {
      // Fallback para outros casos
      eVar84Value = 'AT_cupom_value ' + (couponValue || 'sem_valor');
    }

    console.log('[Tracking Cupom] Analytics event triggered:', labelEvent, 'eVar84:', eVar84Value);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent; // Informação principal da ação
      s.eVar84 = eVar84Value; // Diferenciado por tipo de evento

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getInputValue() {
    // Busca o input do cupom
    const input = document.querySelector('input[data-test-id="fop-promocode-input"]');
    return input ? input.value.trim() : '';
  }

  function interceptarRequisicoes() {
    // Intercepta XMLHttpRequest
    const originalXHROpen = window.XMLHttpRequest.prototype.open;
    const originalXHRSend = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.open = function (method, url) {
      this._trackingUrl = url;
      this._trackingMethod = method;
      return originalXHROpen.apply(this, arguments);
    };

    window.XMLHttpRequest.prototype.send = function (body) {
      const xhr = this;
      const url = xhr._trackingUrl || '';

      // Verifica se é a API de cupom promocional
      if (url.includes('/promotioncode') || url.includes('promocode')) {
        console.log('[Tracking Cupom] Requisição de cupom detectada:', url);

        xhr.addEventListener('load', function () {
          const cupomValue = getInputValue();
          console.log('[Tracking Cupom] Status da resposta:', xhr.status);

          // Sucesso (200-299)
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[Tracking Cupom] API retornou SUCESSO (status ' + xhr.status + ')');
            analyticsEvent('sucesso', cupomValue);
          }
          // Erro (400, 404, etc)
          else if (xhr.status >= 400) {
            console.log('[Tracking Cupom] API retornou ERRO (status ' + xhr.status + ')');
            analyticsEvent('erro', cupomValue);
          }
        });

        xhr.addEventListener('error', function () {
          const cupomValue = getInputValue();
          console.log('[Tracking Cupom] Erro de rede na requisição');
          analyticsEvent('erro', cupomValue);
        });
      }

      return originalXHRSend.apply(this, arguments);
    };

    // Intercepta Fetch API
    const originalFetch = window.fetch;
    window.fetch = function (url, options) {
      const urlString = typeof url === 'string' ? url : url.url || '';

      // Verifica se é a API de cupom promocional
      if (urlString.includes('/promotioncode') || urlString.includes('promocode')) {
        console.log('[Tracking Cupom] Fetch de cupom detectado:', urlString);

        return originalFetch.apply(this, arguments).then(function (response) {
          const cupomValue = getInputValue();
          console.log('[Tracking Cupom] Status da resposta (Fetch):', response.status);

          // Clona a resposta para não interferir no fluxo original
          const responseClone = response.clone();

          // Sucesso (200-299)
          if (response.status >= 200 && response.status < 300) {
            console.log('[Tracking Cupom] API retornou SUCESSO (status ' + response.status + ')');
            analyticsEvent('sucesso', cupomValue);
          }
          // Erro (400, 404, etc)
          else if (response.status >= 400) {
            console.log('[Tracking Cupom] API retornou ERRO (status ' + response.status + ')');
            analyticsEvent('erro', cupomValue);
          }

          return response;
        }).catch(function (error) {
          const cupomValue = getInputValue();
          console.log('[Tracking Cupom] Erro de rede na requisição (Fetch):', error);
          analyticsEvent('erro', cupomValue);
          throw error;
        });
      }

      return originalFetch.apply(this, arguments);
    };

    console.log('[Tracking Cupom] Interceptação de requisições ativada');
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
    });

    console.log('[Tracking Cupom] Listener adicionado ao botão "Aplicar"');

    listenersAdicionados = true;

    // Para a verificação periódica se estiver ativa
    if (intervaloPeriodicoAtivo) {
      clearInterval(intervaloPeriodicoAtivo);
      intervaloPeriodicoAtivo = null;
      console.log('[Tracking Cupom] Verificação periódica interrompida.');
    }

    return true;
  }



  function init() {
    // Intercepta as requisições para capturar status da API
    interceptarRequisicoes();

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
