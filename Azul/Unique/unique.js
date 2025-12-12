/**
 * Script para interceptar e manipular dados da API de Customer da Azul
 * Especificamente para manipular o array requiredPoints
 */

(function () {
  'use strict';

  // Armazenar os dados originais e manipulados
  let customerData = null;
  let originalRequiredPoints = null;

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

              console.log('[Azul Unique] Dados do customer capturados:', customerData);
              console.log('[Azul Unique] requiredPoints original:', originalRequiredPoints);

              // Expor dados globalmente para manipulação
              window.azulCustomerData = customerData;
              window.azulRequiredPoints = originalRequiredPoints;

              // Chamar função de manipulação se existir
              if (window.manipulateRequiredPoints) {
                window.manipulateRequiredPoints(originalRequiredPoints);
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

              console.log('[Azul Unique] Dados do customer capturados (XHR):', customerData);
              console.log('[Azul Unique] requiredPoints original:', originalRequiredPoints);

              // Expor dados globalmente
              window.azulCustomerData = customerData;
              window.azulRequiredPoints = originalRequiredPoints;

              // Chamar função de manipulação se existir
              if (window.manipulateRequiredPoints) {
                window.azulRequiredPoints(originalRequiredPoints);
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
   * Exemplo de uso no console:
   * manipulateRequiredPointsData((points) => {
   *   return points.map(p => ({ ...p, amount: p.amount * 2 }));
   * });
   */
  window.manipulateRequiredPointsData = function (callback) {
    if (!originalRequiredPoints) {
      console.warn(
        '[Azul Unique] requiredPoints ainda não foi capturado. Aguarde a requisição da API.'
      );
      return;
    }

    if (typeof callback !== 'function') {
      console.error('[Azul Unique] É necessário fornecer uma função como callback.');
      return;
    }

    try {
      const manipulated = callback(originalRequiredPoints);
      console.log('[Azul Unique] requiredPoints manipulado:', manipulated);
      window.azulRequiredPoints = manipulated;
      return manipulated;
    } catch (err) {
      console.error('[Azul Unique] Erro ao manipular dados:', err);
    }
  };

  /**
   * Função para obter os dados atuais
   */
  window.getAzulCustomerData = function () {
    return customerData;
  };

  window.getAzulRequiredPoints = function () {
    return window.azulRequiredPoints || originalRequiredPoints;
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

  console.log('[Azul Unique] Script carregado. Aguardando requisição da API...');
  console.log('[Azul Unique] Use window.getAzulRequiredPoints() para obter os dados');
  console.log('[Azul Unique] Use window.manipulateRequiredPointsData(callback) para manipular');
})();
