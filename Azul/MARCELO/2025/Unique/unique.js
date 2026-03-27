/**
 * Script para interceptar e manipular dados da API de Customer da Azul
 * Especificamente para manipular o array requiredPoints
 * Inclui fallback para leitura do cookie TudoAzul
 */

(function () {
  'use strict';

  // Armazenar os dados originais e manipulados
  let customerData = null;
  let originalRequiredPoints = null;
  let dataSource = null; // 'api' ou 'cookie'

  /**
   * Função para ler e parsear o cookie TudoAzul
   */
  function getCookieData(cookieName) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName && value) {
        try {
          const decodedValue = decodeURIComponent(value);
          return JSON.parse(decodedValue);
        } catch (err) {
          console.error('[Azul Unique] Erro ao parsear cookie:', err);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Função para normalizar dados do cookie para o formato da API
   */
  function normalizeFromCookie(cookieData) {
    if (!cookieData) return null;

    return {
      customerNumber: cookieData.customerNumber || cookieData.Id,
      customerKey: cookieData.customerKey || cookieData.CustomerKey,
      customerName: cookieData.name || {
        first: cookieData.Name,
        last: cookieData.LastName,
      },
      email: cookieData.email || cookieData.Email,
      gender: cookieData.gender || cookieData.Gender,
      programInfo: {
        name: cookieData.program?.name || 'TudoAzul',
        levelCode: cookieData.program?.levelCode || cookieData.LoyaltyLevel,
        qualifyingPoints: cookieData.program?.qualifyingPoints || cookieData.QualifyingPoints,
        redeemable: cookieData.program?.redeemable || {
          points: cookieData.RedeemablePoints,
        },
        requiredPoints: cookieData.program?.requiredPoints || [
          { name: 'Azul Topázio', levelCode: 'TA+', amount: cookieData.PointsToTopaz },
          { name: 'Azul Safira', levelCode: 'SAF', amount: cookieData.PointsToSapphire },
          { name: 'Azul Diamante', levelCode: 'DIA', amount: cookieData.PointsToDiamond },
        ],
        goal: cookieData.program?.goal,
        flights: cookieData.program?.flights,
        hasNextProgram: cookieData.program?.hasNextProgram,
        isMaxTier: cookieData.program?.isMaxTier,
      },
      benefitInfo: cookieData.benefit || {
        domesticJourneys: cookieData.benefit?.domesticJourneys,
        internationalJourneys: cookieData.benefit?.internationalJourneys,
        businessUpgrade: cookieData.benefit?.businessUpgrade,
        monthsRemaining: cookieData.benefit?.monthsRemaining,
      },
      // Dados extras do cookie
      _raw: cookieData,
    };
  }

  /**
   * Inicializa dados a partir do cookie (fallback)
   */
  function initFromCookie() {
    const cookieData = getCookieData('TudoAzul');
    if (cookieData) {
      customerData = normalizeFromCookie(cookieData);
      originalRequiredPoints = customerData.programInfo?.requiredPoints
        ? JSON.parse(JSON.stringify(customerData.programInfo.requiredPoints))
        : null;

      dataSource = 'cookie';

      // Expor dados globalmente
      window.azulCustomerData = customerData;
      window.azulRequiredPoints = originalRequiredPoints;

      console.log('[Azul Unique] Dados carregados do cookie TudoAzul:', customerData);
      console.log('[Azul Unique] requiredPoints (do cookie):', originalRequiredPoints);

      return true;
    }
    return false;
  }

  /**
   * Intercepta requisições fetch
   */
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];

    // Verificar se é a requisição da API de customer
    if (typeof url === 'string' && url.includes('/sales/b2c/customer/api/v1/customers/')) {
      return originalFetch.apply(this, args).then((response) => {
        // Clonar a resposta para poder ler o body múltiplas vezes
        const clonedResponse = response.clone();

        // Ler o JSON da resposta
        clonedResponse
          .json()
          .then((data) => {
            if (data && data.data) {
              customerData = data.data;
              originalRequiredPoints = data.data.programInfo?.requiredPoints
                ? JSON.parse(JSON.stringify(data.data.programInfo.requiredPoints))
                : null;

              dataSource = 'api';

              console.log('[Azul Unique] Dados do customer capturados (API):', customerData);
              console.log('[Azul Unique] requiredPoints original:', originalRequiredPoints);

              // Expor dados globalmente para manipulação
              window.azulCustomerData = customerData;
              window.azulRequiredPoints = originalRequiredPoints;

              // Disparar evento customizado para notificar que dados foram carregados
              window.dispatchEvent(
                new CustomEvent('azulCustomerDataLoaded', {
                  detail: { customerData, requiredPoints: originalRequiredPoints },
                })
              );

              // Chamar função de manipulação se existir
              if (typeof window.onAzulDataLoaded === 'function') {
                window.onAzulDataLoaded(customerData, originalRequiredPoints);
              }
            }
          })
          .catch((err) => {
            console.error('[Azul Unique] Erro ao processar resposta:', err);
          });

        return response;
      });
    }

    return originalFetch.apply(this, args);
  };

  /**
   * Intercepta requisições XMLHttpRequest
   */
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._url = url;
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (
      this._url &&
      typeof this._url === 'string' &&
      this._url.includes('/sales/b2c/customer/api/v1/customers/')
    ) {
      this.addEventListener('load', function () {
        if (this.status === 200) {
          try {
            const data = JSON.parse(this.responseText);
            if (data && data.data) {
              customerData = data.data;
              originalRequiredPoints = data.data.programInfo?.requiredPoints
                ? JSON.parse(JSON.stringify(data.data.programInfo.requiredPoints))
                : null;

              dataSource = 'api';

              console.log('[Azul Unique] Dados do customer capturados (XHR):', customerData);
              console.log('[Azul Unique] requiredPoints original:', originalRequiredPoints);

              // Expor dados globalmente
              window.azulCustomerData = customerData;
              window.azulRequiredPoints = originalRequiredPoints;

              // Disparar evento customizado
              window.dispatchEvent(
                new CustomEvent('azulCustomerDataLoaded', {
                  detail: { customerData, requiredPoints: originalRequiredPoints },
                })
              );

              // Chamar função de callback se existir
              if (typeof window.onAzulDataLoaded === 'function') {
                window.onAzulDataLoaded(customerData, originalRequiredPoints);
              }
            }
          } catch (err) {
            console.error('[Azul Unique] Erro ao processar resposta XHR:', err);
          }
        }
      });
    }

    return originalXHRSend.apply(this, args);
  };

  /**
   * Função auxiliar para manipular requiredPoints
   */
  window.manipulateRequiredPointsData = function (callback) {
    if (!originalRequiredPoints) {
      console.warn(
        '[Azul Unique] requiredPoints ainda não foi capturado. Tentando carregar do cookie...'
      );
      if (!initFromCookie()) {
        console.error('[Azul Unique] Não foi possível obter dados do cookie.');
        return null;
      }
    }

    if (typeof callback !== 'function') {
      console.error('[Azul Unique] É necessário fornecer uma função como callback.');
      return null;
    }

    try {
      const manipulated = callback(JSON.parse(JSON.stringify(originalRequiredPoints)));
      console.log('[Azul Unique] requiredPoints manipulado:', manipulated);
      window.azulRequiredPoints = manipulated;
      return manipulated;
    } catch (err) {
      console.error('[Azul Unique] Erro ao manipular dados:', err);
      return null;
    }
  };

  /**
   * Função para obter os dados do customer
   */
  window.getAzulCustomerData = function () {
    if (!customerData) {
      initFromCookie();
    }
    return customerData;
  };

  /**
   * Função para obter requiredPoints
   */
  window.getAzulRequiredPoints = function () {
    if (!originalRequiredPoints && !window.azulRequiredPoints) {
      initFromCookie();
    }
    return window.azulRequiredPoints || originalRequiredPoints;
  };

  /**
   * Função para obter informações do programa
   */
  window.getAzulProgramInfo = function () {
    const data = window.getAzulCustomerData();
    return data?.programInfo || null;
  };

  /**
   * Função para obter a fonte dos dados
   */
  window.getAzulDataSource = function () {
    return dataSource;
  };

  /**
   * Função para resetar aos dados originais
   */
  window.resetAzulRequiredPoints = function () {
    window.azulRequiredPoints = originalRequiredPoints
      ? JSON.parse(JSON.stringify(originalRequiredPoints))
      : null;
    console.log('[Azul Unique] requiredPoints resetado para original:', window.azulRequiredPoints);
    return window.azulRequiredPoints;
  };

  /**
   * Função para forçar recarga dos dados do cookie
   */
  window.reloadAzulDataFromCookie = function () {
    if (initFromCookie()) {
      console.log('[Azul Unique] Dados recarregados do cookie com sucesso.');
      return customerData;
    }
    console.error('[Azul Unique] Falha ao recarregar dados do cookie.');
    return null;
  };

  // Tentar carregar dados do cookie imediatamente (fallback)
  const cookieLoaded = initFromCookie();

  console.log('[Azul Unique] Script carregado.');
  if (cookieLoaded) {
    console.log('[Azul Unique] ✓ Dados carregados do cookie TudoAzul');
  } else {
    console.log('[Azul Unique] Aguardando requisição da API...');
  }
  console.log('[Azul Unique] Funções disponíveis:');
  console.log('  - window.getAzulCustomerData() → dados completos do customer');
  console.log('  - window.getAzulRequiredPoints() → array requiredPoints');
  console.log('  - window.getAzulProgramInfo() → informações do programa');
  console.log('  - window.getAzulDataSource() → fonte dos dados ("api" ou "cookie")');
  console.log('  - window.manipulateRequiredPointsData(callback) → manipular requiredPoints');
  console.log('  - window.reloadAzulDataFromCookie() → forçar recarga do cookie');
})();
