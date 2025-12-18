// MODAL DIAMANTE TUDO AZUL - UNIQUE COOKIE

(function () {
  // Chave para armazenar dados no localStorage
  const STORAGE_KEY = 'tudoazul_users_data';

  // Armazena os dados extraidos de usuarios
  let usuariosData = [];

  // Funcao para obter o valor de um cookie pelo nome
  function getCookieValue(cookieName) {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Verifica se o cookie comeca com o nome desejado
      if (cookie.indexOf(cookieName + '=') === 0) {
        const cookieValue = cookie.substring(cookieName.length + 1);
        return cookieValue;
      }
    }

    return null;
  }

  // Funcao para decodificar e parsear o valor do cookie
  function parseCookieData(encodedValue) {
    if (!encodedValue) {
      return null;
    }

    try {
      // Decodifica o valor do cookie (URL encoded)
      const decodedValue = decodeURIComponent(encodedValue);
      // Parseia o JSON
      const parsedData = JSON.parse(decodedValue);
      return parsedData;
    } catch (error) {
      console.log('[Cookie TudoAzul] Erro ao parsear cookie:', error);
      return null;
    }
  }

  // Funcao para extrair os dados especificos do usuario
  function extractUserData(cookieData) {
    if (!cookieData) {
      return null;
    }

    const userData = {
      id: cookieData.Id || cookieData.customerNumber || null,
      flights: 0,
      qualifyingPoints: 0,
      lastUpdated: new Date().toISOString()
    };

    // Extrai dados do programa de fidelidade
    if (cookieData.program) {
      userData.flights = cookieData.program.flights || 0;
      userData.qualifyingPoints = cookieData.program.qualifyingPoints || 0;
    }

    return userData;
  }

  // Funcao para salvar dados no localStorage
  function saveToLocalStorage() {
    try {
      const dataToSave = JSON.stringify(usuariosData);
      localStorage.setItem(STORAGE_KEY, dataToSave);
      console.log('[Cookie TudoAzul] Dados salvos no localStorage');
    } catch (error) {
      console.log('[Cookie TudoAzul] Erro ao salvar no localStorage:', error);
    }
  }

  // Funcao para carregar dados do localStorage
  function loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        usuariosData = JSON.parse(savedData);
        console.log('[Cookie TudoAzul] Dados carregados do localStorage:', usuariosData.length + ' usuario(s)');
        return true;
      }
    } catch (error) {
      console.log('[Cookie TudoAzul] Erro ao carregar do localStorage:', error);
    }

    return false;
  }

  // Funcao principal para obter dados do cookie TudoAzul
  function getTudoAzulData() {
    const cookieValue = getCookieValue('TudoAzul');

    if (!cookieValue) {
      console.log('[Cookie TudoAzul] Cookie nao encontrado');
      // Retorna o ultimo usuario salvo no localStorage se existir
      if (usuariosData.length > 0) {
        console.log('[Cookie TudoAzul] Usando dados do localStorage');
        return usuariosData[usuariosData.length - 1];
      }
      return null;
    }

    const parsedData = parseCookieData(cookieValue);

    if (!parsedData) {
      console.log('[Cookie TudoAzul] Nao foi possivel parsear os dados do cookie');
      return null;
    }

    const userData = extractUserData(parsedData);

    if (userData && userData.id) {
      // Verifica se o usuario ja existe no array
      const usuarioIndex = usuariosData.findIndex(function (user) {
        return user.id === userData.id;
      });

      if (usuarioIndex === -1) {
        // Novo usuario
        usuariosData.push(userData);
        console.log('[Cookie TudoAzul] Novo usuario adicionado:', userData);
      } else {
        // Atualiza os dados do usuario existente
        usuariosData[usuarioIndex].flights = userData.flights;
        usuariosData[usuarioIndex].qualifyingPoints = userData.qualifyingPoints;
        usuariosData[usuarioIndex].lastUpdated = userData.lastUpdated;
        console.log('[Cookie TudoAzul] Usuario atualizado:', usuariosData[usuarioIndex]);
      }

      // Salva no localStorage apos qualquer alteracao
      saveToLocalStorage();
    }

    return userData;
  }

  // Funcao para obter todos os usuarios armazenados
  function getAllUsers() {
    return usuariosData;
  }

  // Funcao para obter um usuario especifico pelo ID
  function getUserById(userId) {
    return usuariosData.find(function (user) {
      return user.id === userId;
    }) || null;
  }

  // Funcao para limpar os dados armazenados
  function clearUsersData() {
    usuariosData = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[Cookie TudoAzul] Dados de usuarios limpos (memoria e localStorage)');
    } catch (error) {
      console.log('[Cookie TudoAzul] Erro ao limpar localStorage:', error);
    }
  }

  // Funcao para forcar sincronizacao com o cookie
  function syncWithCookie() {
    console.log('[Cookie TudoAzul] Sincronizando com cookie...');
    return getTudoAzulData();
  }

  // ========================================
  // MODAL DIAMANTE UNIQUE
  // ========================================

  // Chave para controlar exibicao do modal (evitar mostrar multiplas vezes)
  const MODAL_SHOWN_KEY = 'diamante_unique_modal_shown';
  const MIN_QUALIFYING_POINTS = 0;
  const MIN_FLIGHTS = 0; // Definido como 0 para testes
  //23000 trechos: 26

  // Funcao para verificar se o modal ja foi exibido nesta sessao
  function wasModalShown() {
    try {
      return sessionStorage.getItem(MODAL_SHOWN_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  // Funcao para marcar o modal como exibido
  function markModalAsShown() {
    try {
      sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
    } catch (error) {
      console.log('[Modal Diamante] Erro ao salvar estado do modal:', error);
    }
  }

  // Funcao de Analytics
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    
    // Padrao: AT_DiamanteUnique_[tipo] [label]
    var labelEvent = 'AT_DiamanteUnique_' + eventType + ' ' + eventLabel;
    console.log('[Tracking Modal] ' + labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_DiamanteUnique';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // Funcao para injetar estilos CSS do modal
  function injectModalStyles() {
    if (document.getElementById('diamante-unique-modal-styles')) {
      return; // Estilos ja injetados
    }

    const styles = document.createElement('style');
    styles.id = 'diamante-unique-modal-styles';
    styles.textContent = '' +
      '.diamante-modal-overlay {' +
      '  position: fixed;' +
      '  top: 0;' +
      '  left: 0;' +
      '  width: 100%;' +
      '  height: 100%;' +
      '  background-color: rgba(0, 0, 0, 0.7);' +
      '  display: flex;' +
      '  justify-content: center;' +
      '  align-items: center;' +
      '  z-index: 999999;' +
      '  opacity: 0;' +
      '  transition: opacity 0.3s ease;' +
      '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;' +
      '}' +
      '.diamante-modal-overlay.active {' +
      '  opacity: 1;' +
      '}' +
      '.diamante-modal-container {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  padding: 24px;' +
      '  gap: 12px;' +
      '  width: 566px;' +
      '  max-width: 95%;' +
      '  height: auto;' +
      '  max-height: 90vh;' +
      '  background-color: #041E42;' +
      '  background-image: linear-gradient(0deg, #041E42, #041E42);' +
      '  border-radius: 16px;' +
      '  box-sizing: border-box;' +
      '  color: #FFFFFF;' +
      '  position: relative;' +
      '  overflow-y: auto;' +
      '  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);' +
      '  transform: scale(0.9);' +
      '  transition: transform 0.3s ease;' +
      '}' +
      '.diamante-modal-overlay.active .diamante-modal-container {' +
      '  transform: scale(1);' +
      '}' +
      '.diamante-modal-close {' +
      '  position: absolute;' +
      '  top: 16px;' +
      '  right: 16px;' +
      '  background: transparent;' +
      '  border: none;' +
      '  color: #ffffff;' +
      '  font-size: 28px;' +
      '  cursor: pointer;' +
      '  opacity: 0.7;' +
      '  transition: opacity 0.2s ease;' +
      '  line-height: 1;' +
      '  padding: 4px;' +
      '  z-index: 10;' +
      '}' +
      '.diamante-modal-close:hover {' +
      '  opacity: 1;' +
      '}' +
      /* Header */
      '.diamante-modal-header {' +
      '  display: flex;' +
      '  flex-direction: row;' +
      '  justify-content: center;' +
      '  align-items: center;' +
      '  padding: 0px;' +
      '  gap: 16px;' +
      '  width: 100%;' +
      '  height: 36px;' +
      '}' +
      '.diamante-modal-icon-wrapper {' +
      '  width: 45px;' +
      '  height: 45px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '}' +
      '.diamante-modal-badge {' +
      '  display: flex;' +
      '  flex-direction: row;' +
      '  align-items: center;' +
      '  padding: 12px;' +
      '  gap: 10px;' +
      '  height: 28px;' +
      '  background: #CF527A;' +
      '  border-radius: 33px;' +
      '  font-family: "Helvetica Neue";' +
      '  font-weight: 700;' +
      '  font-size: 16px;' +
      '  line-height: 16px;' +
      '  text-align: center;' +
      '  letter-spacing: 0.3px;' +
      '  color: #FFFFFF;' +
      '  box-sizing: border-box;' +
      '}' +
      '.diamante-modal-level {' +
      '  width: 100%;' +
      '  height: 16px;' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 16px;' +
      '  line-height: 16px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '  margin-top: 4px;' +
      '}' +
      '.diamante-modal-title {' +
      '  width: 100%;' +
      '  height: 36px;' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 36px;' +
      '  line-height: 36px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  text-transform: uppercase;' +
      '  color: #FFFFFF;' +
      '}' +
      '.diamante-modal-divider {' +
      '  width: 100%;' +
      '  height: 1px;' +
      '  background: rgba(255, 255, 255, 0.32);' +
      '}' +
      /* Intro Text */
      '.diamante-modal-intro {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  justify-content: center;' +
      '  align-items: center;' +
      '  padding: 0px;' +
      '  gap: 8px;' +
      '  width: 100%;' +
      '}' +

      '.diamante-modal-intro-desc {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 14px;' +
      '  line-height: 16px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '  margin: 5px 0;' +
      '}' +
      '.diamante-modal-intro-desc strong {' +
      '  font-weight: 700;' +
      '}' +
      '.diamante-modal-intro-desc span {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 14px;' +
      '  line-height: 16px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '  opacity: 50%;' +
      '}' +
      '.diamante-modal-intro h2 {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 700;' +
      '  font-size: 24px;' +
      '  line-height: 24px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '  margin: 0;' +
      '}' +
      '.diamante-modal-intro p {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 14px;' +
      '  line-height: 24px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  text-align: center;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '  margin: 0;' +
      '}' +
      '.diamante-modal-deadline {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 12px;' +
      '  line-height: 16px;' +
      '  text-align: center;' +
      '  letter-spacing: 1.2px;' +
      '  text-transform: uppercase;' +
      '  color: #FFFFFF;' +
      '  width: 100%;' +
      '}' +
      '.diamante-modal-deadline strong {' +
      '  font-weight: 700;' +
      '}' +
      /* Requirements Card */
      '.diamante-modal-req-card {' +
      '  box-sizing: border-box;' +
      '  border-radius: 14px;' +
      '  display: flex;' +
      '  justify-content: space-between;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '}' +
      '.diamante-modal-req-item {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  position: relative;' +
      '}' +
      '.diamante-modal-req-value {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 300;' +
      '  font-size: 24px;' +
      '  line-height: 36px;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '  margin-bottom: 0;' +
      '}' +
      '.diamante-modal-req-label {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 400;' +
      '  font-size: 10px;' +
      '  line-height: 16px;' +
      '  text-align: center;' +
      '  color: rgba(255, 255, 255, 0.6);' +
      '}' +
      '.diamante-modal-req-separator {' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  color: #FFFFFF;' +
      '  font-size: 10px;' +
      '  text-transform: uppercase;' +
      '  padding: 2px 8px;' +
      '  border-radius: 10px;' +
      '  position: relative;' +
      '  z-index: 1;' +
      '  min-width: 26px;' +
      '  text-align: center;' +
      '}' +
      '.diamante-modal-req-separator::before {' +
      '  content: "";' +
      '  position: absolute;' +
      '  top: -18px;' +
      '  left: 50%;' +
      '  transform: translateX(-50%);' +
      '  width: 1px;' +
      '  height: 18px;' +
      '  background: rgba(255, 255, 255, 0.1);' +
      '}' +
      '.diamante-modal-req-separator::after {' +
      '  content: "";' +
      '  position: absolute;' +
      '  bottom: -18px;' +
      '  left: 50%;' +
      '  transform: translateX(-50%);' +
      '  width: 1px;' +
      '  height: 18px;' +
      '  background: rgba(255, 255, 255, 0.1);' +
      '}' +
      /* Tips Section */
      '.diamante-modal-tips-title {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 700;' +
      '  font-size: 12px;' +
      '  line-height: 16px;' +
      '  text-align: center;' +
      '  letter-spacing: 1.2px;' +
      '  text-transform: uppercase;' +
      '  color: #FFFFFF;' +
      '}' +
      '.diamante-modal-tips-title span {' +
      '  font-weight: 300;' +
      '  font-size: 14px;' +
      '  line-height: 16px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '  opacity: 50%;' +
      '}' +
      '.diamante-modal-tips-container {' +
      '  display: flex;' +
      '  justify-content: center;' +
      '  width: 99%;' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '  border: 1px solid rgba(255, 255, 255, 0.1);' +
      '  padding: 20px 0px;' +
      '  border-radius: 14px;' +
      '  margin-bottom: 20px;' +
      '}' +
      '.diamante-modal-tip {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  gap: 8px;' +
      '  width: 50%;' +
      '}' +
      '.diamante-modal-tip:nth-of-type(1) {' +
      '  border-right: 1px solid rgba(255, 255, 255, 0.1);' +
      '}' +
      '.diamante-modal-req-separator:nth-of-type(2)::before, .diamante-modal-req-separator:nth-of-type(2)::after {' +
      '    display: none;' +
      '  }' +
      '.diamante-modal-tip-icon {' +
      '  width: 48px;' +
      '  height: 48px;' +
      '  border-radius: 50%;' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '  border: 1px solid rgba(255, 255, 255, 0.1);' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '}' +
      '.diamante-modal-tip-badge {' +
      '  background: #0BB8E7;' +
      '  border-radius: 8px;' +
      '  padding: 8px 16px;' +
      '  color: #FFFFFF;' +
      '  font-family: "Helvetica Neue";' +
      '  font-weight: 700;' +
      '  font-size: 14px;' +
      '  line-height: 14px;' +
      '  text-align: center;' +
      '  box-sizing: border-box;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  min-height: 48px;' +
      '  width: 70%;' +
      '}' +
      /* Benefits Box */
      '.diamante-modal-benefits-box {' +
      '  box-sizing: border-box;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: flex-start;' +
      '  padding: 16px 21px 16px 20px;' +
      '  gap: 12px;' +
      '  width: 100%;' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '  border: 1px solid rgba(255, 255, 255, 0.1);' +
      '  border-radius: 14px;' +
      '}' +
      '.diamante-modal-benefits-title {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 700;' +
      '  font-size: 14px;' +
      '  line-height: 21px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  color: #FFFFFF;' +
      'text-align: center;' +
      '}' +
      '.diamante-modal-benefits-grid {' +
      '  display: grid;' +
      '  grid-template-columns: 1fr 1fr;' +
      '  gap: 20px 12px;' +
      '  width: 100%;' +
      '  margin-bottom: 12px;' +
      '}' +
      '.diamante-modal-benefit-highlight {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '}' +
      '.diamante-modal-benefit-icon {' +
      '  width: 32px;' +
      '  height: 32px;' +
      '  min-width: 32px;' +
      '  border-radius: 50%;' +
      '  background: #041E42;' +
      '  border: 0.75px solid #FFFFFF;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '}' +
      '.diamante-modal-benefit-content {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  gap: 4px;' +
      '}' +
      '.diamante-modal-benefit-title {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 500;' +
      '  font-size: 14px;' +
      '  line-height: 14px;' +
      '  color: #FFFFFF;' +
      '}' +
      '.diamante-modal-benefit-desc {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 400;' +
      '  font-size: 12px;' +
      '  line-height: 12px;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '}' +
      '.diamante-modal-benefits-footer {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  gap: 12px;' +
      '  width: 100%;' +
      '}' +
      '.diamante-modal-benefits-line {' +
      '  flex: 1;' +
      '  height: 1px;' +
      '  background: rgba(255, 255, 255, 0.1);' +
      '}' +
      '.diamante-modal-benefits-badge {' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  border-radius: 33px;' +
      '  padding: 2px 12px;' +
      '  font-family: Arial;' +
      '  font-style: normal;' +
      '  font-weight: 400;' +
      '  font-size: 10px;' +
      '  line-height: 15px;' +
      '  text-transform: uppercase;' +
      '  color: #FFFFFF;' +
      '}' +
      /* Footer */
      '.diamante-modal-footer-text {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 400;' +
      '  font-size: 14px;' +
      '  line-height: 17px;' +
      '  display: flow;' +
      '  align-items: center;' +
      '  text-align: center;' +
      '  color: #FFFFFF;' +
      '}' +
      '.diamante-modal-footer-text span {' +
      '  font-weight: 300;' +
      '  color: #FFFFFF;' +
      '  opacity: 50%;' +
      '}' +
      '.diamante-modal-actions {' +
      '  display: flex;' +
      '  gap: 16px;' +
      '  width: 100%;' +
      '  justify-content: center;' +
      '}' +
      '.diamante-modal-btn {' +
      '  box-sizing: border-box;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  padding: 13px 17px;' +
      '  height: 45px;' +
      '  border-radius: 8px;' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 400;' +
      '  font-size: 16px;' +
      '  line-height: 19px;' +
      '  text-align: center;' +
      '  text-decoration: none;' +
      '  cursor: pointer;' +
      '  transition: all 0.3s ease;' +
      '}' +
      '.diamante-modal-btn:hover {' +
      '  opacity: 0.9;' +
      '  transform: scale(1.02);' +
      '}' +
      '.diamante-modal-btn-primary {' +
      '  background: #008058;' +
      '  color: #FFFFFF;' +
      '  border: none;' +
      '}' +
      '.diamante-modal-btn-secondary {' +
      '  background: transparent;' +
      '  color: #FFFFFF;' +
      '  border: 1px solid #FFFFFF;' +
      '}' +
      '.diamante-modal-disclaimer {' +
      '  font-family: "Helvetica Neue";' +
      '  font-style: normal;' +
      '  font-weight: 400;' +
      '  font-size: 10px;' +
      '  line-height: 10px;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '}' +
      '@media (max-width: 768px) {' +
      '  .diamante-modal-container {' +
      '    width: calc(100% - 32px);' +
      '    padding: 24px 16px;' +
      '    max-height: 85vh;' +
      '    gap: 5px;' +
      '  }' +
      '  .diamante-modal-title {' +
      '    font-size: 24px;' +
      '    height: auto;' +
      '  }' +
      '  .diamante-modal-level {' +
      '    font-size: 14px;' +
      '  }' +
      '  .diamante-modal-intro h2 {' +
      '    font-size: 18px;' +
      '  }' +
      '  .diamante-modal-req-card {' +
      '    flex-direction: row;' +
      '    justify-content: center;' +
      '    gap: 12px 4px;' +
      '    padding: 0px;' +
      '  }' +
      '  .diamante-modal-req-item {' +
      '    width: 40%;' +
      '  }' +
      '  .diamante-modal-req-item:last-child {' +
      '    width: 100%;' +
      '    margin-top: 8px;' +
      '  }' +
      '  .diamante-modal-req-separator:nth-of-type(2) {' +
      '    margin: 8px 0;' +
      '    background: transparent;' +
      '    color: #415470;' +
      '  }' +

      '.diamante-modal-footer-text{' +
      '   text-align: start;' +
      ' }' +
      '  .diamante-modal-tips-container {' +
      '    margin-bottom: 0px;' +
      '    padding: 14px 0px;' +
      '  }' +
      '  .diamante-modal-req-value {' +
      '    font-size: 24px;' +
      '    line-height: 1;' +
      '  }' +
      '  .diamante-modal-tip-badge {' +
      '    width: 90%;' +
      '  }' +
      '  .diamante-modal-benefits-grid {' +
      '    grid-template-columns: 1fr;' +
      '    gap: 6px;' +
      '  }' +
      '  .diamante-modal-actions {' +
      '    flex-direction: column;' +
      '    gap: 12px;' +
      '  }' +
      '  .diamante-modal-btn {' +
      '    width: 100%;' +
      '  }' +
      '}';

    document.head.appendChild(styles);
  }

  // Funcao para criar o HTML do modal
  function createModalHTML() {
    // SVGs
    const diamondIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none" style=""><path d="M23.0034 45.5032C35.4298 45.5032 45.5034 35.4296 45.5034 23.0032C45.5034 10.5768 35.4298 0.503174 23.0034 0.503174C10.577 0.503174 0.503418 10.5768 0.503418 23.0032C0.503418 35.4296 10.577 45.5032 23.0034 45.5032Z" stroke="white" stroke-width="1.00645"/><path d="M29.4346 5.00305C29.4346 9.97568 25.4043 14.006 20.4316 14.006C25.4043 14.006 29.4346 18.0363 29.4346 23.009C29.4346 18.0363 33.4649 14.006 38.4376 14.006C33.4649 14.006 29.4346 9.97568 29.4346 5.00305Z" fill="white"/><path d="M19.147 14.0032H16.2694L10.147 21.2889L23.0041 35.8603L35.8613 21.2889L34.5755 19.8317" stroke="white" stroke-width="2.0129" stroke-miterlimit="10"/></svg>';
    const planeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M23.6875 4.71562C24.1469 4.25312 24.7656 4 25.425 4C26.1094 4 26.7531 4.26875 27.2437 4.75625C28.2375 5.75 28.2563 7.34688 27.2875 8.31563L22.45 13.15L25.3875 24.7906L25.5531 25.4406L25.075 25.9188L24.1156 26.875L22.9937 28L22.2375 26.6031L17.5938 18.0063L13.2406 22.3625L13.6844 25.0656L13.7844 25.6656L13.3531 26.0969L12.8125 26.6344L11.7156 27.7313L10.9469 26.3844L9.00937 22.9906L5.61562 21.0531L4.26875 20.2844L5.36562 19.1875L5.90625 18.6469L6.33437 18.2188L6.9375 18.3156L9.64062 18.7625L13.9937 14.4062L5.4 9.76562L4 9.00937L5.125 7.88438L6.08437 6.925L6.55937 6.45L7.2125 6.61562L18.85 9.55L23.6875 4.71562ZM26.4062 5.59375C26.1344 5.32187 25.775 5.18437 25.425 5.18437C25.0969 5.18437 24.7719 5.30625 24.525 5.55312L19.2156 10.8625L6.92188 7.7625L5.9625 8.72188L15.9563 14.1219L10.0469 20.0312L6.74375 19.4844L6.20312 20.025L9.87813 22.125L11.9781 25.7969L12.5156 25.2563L11.9719 21.9531L17.8813 16.0438L23.2781 26.0375L24.2375 25.0781L21.1375 12.7875L26.45 7.47813C26.9563 6.96875 26.9375 6.125 26.4062 5.59375Z" fill="white"/></svg>';
    const starIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 5.1C10.025 5.1 5.14375 9.95937 5.14375 16C5.14375 22.0406 10.025 26.9 16 26.9C21.975 26.9 26.8563 22.0406 26.8563 16C26.8563 9.95937 21.975 5.1 16 5.1ZM4 16C4 9.39375 9.35 4 16 4C22.65 4 28 9.39375 28 16C28 22.6063 22.65 28 16 28C9.35 28 4 22.6063 4 16Z" fill="white"/><path d="M18.2594 16.7812L22 14.2188H17.4031L16 10L14.5969 14.2188H10L13.7406 16.7812L12.3375 21L16 18.4375L19.6625 21L18.2594 16.7812Z" fill="white"/></svg>';
    
    // Benefit Icons (Simplified)
    const seatIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M7 13v-3a5 5 0 0 1 10 0v3"/><rect x="4" y="13" width="16" height="8" rx="2"/></svg>';
    const userIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>';
    const fastIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
    const calendarIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

    const modalHTML = '' +
      '<div class="diamante-modal-overlay" id="diamante-unique-modal">' +
      '  <div class="diamante-modal-container">' +
      '    <button class="diamante-modal-close" id="diamante-modal-close" aria-label="Fechar">&times;</button>' +
      '    ' +
      '    <div class="diamante-modal-header">' +
      '      <div class="diamante-modal-icon-wrapper">' + diamondIcon + '</div>' +
      '      <span class="diamante-modal-badge">Novo</span>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-level">Nível 5</div>' +
      '    <div class="diamante-modal-title">DIAMANTE UNIQUE</div>' +
      '    ' +
      '    <div class="diamante-modal-divider"></div>' +
      '    ' +
      '    <div class="diamante-modal-intro">' +
      '      <h2>Falta pouco para você chegar lá!</h2>' +
      '      <div class="diamante-modal-deadline">VOCÊ TEM ATÉ DIA <strong>31 DE DEZEMBRO</strong> PARA ALCANÇAR O NOVO NÍVEL</div>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-intro-desc"><span>O novo nível Azul Fidelidade chega em </span><strong>&nbsp;13 de janeiro de 2026</strong>.</div>' +
      '    ' +
      '    <div class="diamante-modal-tips-title"><strong>AINDA DÁ TEMPO!</strong> <br> <span>O QUE PODE AJUDAR AUMENTAR SUAS CHANCES:</span></div>' +
      '    ' +
      '    <div class="diamante-modal-tips-container">' +
      '      <div class="diamante-modal-tip">' +
      '        <div class="diamante-modal-tip-icon">' + planeIcon + '</div>' +
      '        <div class="diamante-modal-tip-badge">Voando <br>com a Azul</div>' +
      '      </div>' +
      '      <div class="diamante-modal-tip">' +
      '        <div class="diamante-modal-tip-icon">' + starIcon + '</div>' +
      '        <div class="diamante-modal-tip-badge">Assinando o Clube<br>10mil ou 20mil¹</div>' +
      '      </div>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-benefits-box">' +
      '      <div class="diamante-modal-benefits-title">O novo nível Diamante Unique chega dia 13 de Janeiro de 2026, confira os benefícios e como alcança-los:</div>' +
      '      <div class="diamante-modal-req-card">' +
      '        <div class="diamante-modal-req-item">' +
      '          <span class="diamante-modal-req-value">26</span>' +
      '          <span class="diamante-modal-req-label">trechos²</span>' +
      '        </div>' +
      '        <div class="diamante-modal-req-separator">E</div>' +
      '        <div class="diamante-modal-req-item">' +
      '          <span class="diamante-modal-req-value">26 mil</span>' +
      '          <span class="diamante-modal-req-label">pontos qualificáveis²</span>' +
      '        </div>' +
      '        <div class="diamante-modal-req-separator">OU</div>' +
      '        <div class="diamante-modal-req-item">' +
      '          <span class="diamante-modal-req-value">R$50 mil</span>' +
      '          <span class="diamante-modal-req-label">em gasto aéreo²</span>' +
      '        </div>' +
      '      </div>' +
      '      <div class="diamante-modal-benefits-grid">' +
      '        <div class="diamante-modal-benefit-highlight">' +
      '          <div class="diamante-modal-benefit-icon">' + seatIcon + '</div>' +
      '          <div class="diamante-modal-benefit-content">' +
      '            <span class="diamante-modal-benefit-title">Cortesias ilimitadas no Economy Xtra e Espaço Azul.</span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="diamante-modal-benefit-highlight">' +
      '          <div class="diamante-modal-benefit-icon">' + userIcon + '</div>' +
      '          <div class="diamante-modal-benefit-content">' +
      '            <span class="diamante-modal-benefit-title">4 passagens cortesia para acompanhante</span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="diamante-modal-benefit-highlight">' +
      '          <div class="diamante-modal-benefit-icon">' + fastIcon + '</div>' +
      '          <div class="diamante-modal-benefit-content">' +
      '            <span class="diamante-modal-benefit-title">Check-in e embarques prioritários.</span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="diamante-modal-benefit-highlight">' +
      '          <div class="diamante-modal-benefit-icon">' + calendarIcon + '</div>' +
      '          <div class="diamante-modal-benefit-content">' +
      '            <span class="diamante-modal-benefit-title">Pontos com validade de 10 anos.</span>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '      <div class="diamante-modal-benefits-footer">' +
      '        <div class="diamante-modal-benefits-line"></div>' +
      '        <span class="diamante-modal-benefits-badge">E MUITOS OUTROS</span>' +
      '        <div class="diamante-modal-benefits-line"></div>' +
      '      </div>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-footer-text">' +
      '      Possui trechos ou pontos qualificáveis para serem solicitados? <span>Acesse sua conta Azul Fidelidades e fique próximo do nível DIAMANTE UNIQUE.</span>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-actions">' +
      '      <a href="https://www.voeazul.com.br/content/azul/voe-azul/br/pt/programa-fidelidade/acumulo-de-pontos/aereo.html" class="diamante-modal-btn diamante-modal-btn-secondary">Solicitar trechos ou pontos</a>' +
      '      <a href="https://passagens.voeazul.com.br/pt/melhores-ofertas" class="diamante-modal-btn diamante-modal-btn-primary">Voar com a Azul</a>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-disclaimer">' +
      '      ¹Assinando o clube 10mi ou 20mil você ganha pontos qualificáveis para te ajudar a subir de nível. ²Trechos, pontos qualificáveis ou gastos com voos, upgrades e serviços adicionais acumulados em 2025. ³Sendo 2 trechos nacionais e 2 nacionais ou internacionais.' +
      '    </div>' +
      '  </div>' +
      '</div>';

    return modalHTML;
  }

  // --- Funcoes Auxiliares de Controle de Exibicao ---

  function isHomepage() {
    return window.location.href.indexOf('voeazul.com.br/home/br/pt/home') !== -1 || 
           window.location.href.indexOf('debug-modal.html') !== -1;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // --- Controle de Estado do Modal ---

  const STORAGE_KEYS = {
    INTERACTED: 'diamante_unique_interacted_date',
    VIEWS: 'diamante_unique_views_count',
    LAST_VIEW_DATE: 'diamante_unique_last_view_date'
  };

  function hasInteractedToday() {
    const interactedDate = getStorage(STORAGE_KEYS.INTERACTED);
    return interactedDate === getTodayDateString();
  }

  function getViewsToday() {
    const lastViewDate = getStorage(STORAGE_KEYS.LAST_VIEW_DATE);
    const today = getTodayDateString();
    
    if (lastViewDate !== today) {
      return 0;
    }
    
    return getStorage(STORAGE_KEYS.VIEWS) || 0;
  }

  function incrementViews() {
    const views = getViewsToday();
    const today = getTodayDateString();
    
    setStorage(STORAGE_KEYS.VIEWS, views + 1);
    setStorage(STORAGE_KEYS.LAST_VIEW_DATE, today);
  }

  function markInteraction() {
    console.log('[Modal Diamante] Interacao registrada. Modal nao sera exibido novamente hoje.');
    setStorage(STORAGE_KEYS.INTERACTED, getTodayDateString());
  }

  // --- Funcao para exibir o modal ---
  function showDiamanteModal() {
    if (document.getElementById('diamante-unique-modal')) {
      const modal = document.getElementById('diamante-unique-modal');
      modal.classList.add('active');
      return;
    }

    injectModalStyles();

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = createModalHTML();
    document.body.appendChild(modalContainer.firstElementChild);

    const modal = document.getElementById('diamante-unique-modal');
    const closeBtn = document.getElementById('diamante-modal-close');
    const primaryBtn = modal.querySelector('.diamante-modal-btn-primary');
    const secondaryBtn = modal.querySelector('.diamante-modal-btn-secondary');

    // Eventos de Interacao
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        analyticsEvent('Fechar', 'clique');
        markInteraction();
        closeDiamanteModal();
      });
    }

    if (primaryBtn) {
      primaryBtn.addEventListener('click', function () {
        analyticsEvent('Botao Voar', 'clique');
        markInteraction();
        // Logica adicional de clique se necessario
      });
    }

    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', function () {
        analyticsEvent('Botao Solicitar', 'clique');
        markInteraction();
        // Logica adicional de clique se necessario
      });
    }

    // Fecha ao clicar fora
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          analyticsEvent('Fechar Overlay', 'clique');
          markInteraction(); // Clicar fora tambem conta como interacao (fechar)
          closeDiamanteModal();
        }
      });
    }

    // Anima a entrada
    setTimeout(function () {
      if (modal) {
        modal.classList.add('active');
        analyticsEvent('Modal', 'visualizacao');
      }
    }, 50);

    console.log('[Modal Diamante] Modal exibido');
  }

  function closeDiamanteModal() {
    const modal = document.getElementById('diamante-unique-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(function () {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
    console.log('[Modal Diamante] Modal fechado');
  }

  // --- Triggers ---

  let inactivityTimer;
  let triggersInitialized = false;

  function getRandomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    // Se ja exibiu nesta sessao, ou ja interagiu hoje, ou limite de views atingido, nao agendar
    if (wasModalShown() || hasInteractedToday() || getViewsToday() >= 3) return;

    const minTime = isMobile() ? 30 : 45;
    const maxTime = isMobile() ? 60 : 90;
    const time = getRandomTime(minTime, maxTime);

    inactivityTimer = setTimeout(() => {
      console.log('[Modal Diamante] Trigger: Inatividade (' + (time/1000) + 's)');
      triggerModal();
    }, time);
  }

  function setupTriggers() {
    if (triggersInitialized) return;
    triggersInitialized = true;

    // 1. Inatividade
    const activityEvents = ['mousemove', 'scroll', 'click', 'keydown', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    // 2. Exit Intent (Desktop apenas)
    if (!isMobile()) {
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0) {
          // console.log('[Modal Diamante] Trigger: Exit Intent');
          triggerModal();
        }
      });
    }

    // 3. Scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 100) { 
           // console.log('[Modal Diamante] Trigger: Scroll');
           triggerModal();
        }
        scrollTimeout = null;
      }, 500);
    }, { passive: true });
  }

  function triggerModal() {
    const userData = getTudoAzulData();
    if (!userData || userData.qualifyingPoints === undefined || userData.qualifyingPoints === null) return;

    if (checkEligibility(userData)) {
      console.log('[Modal Diamante] Disparando modal via trigger...');
      showDiamanteModal();
      markModalAsShown(); // Marca na sessao
      incrementViews();   // Incrementa contador diario
    }
  }

  function checkEligibility(userData) {
    // 1. Verifica pontos ou trechos
    const hasEnoughPoints = userData.qualifyingPoints >= MIN_QUALIFYING_POINTS;
    const hasEnoughFlights = userData.flights >= MIN_FLIGHTS;

    if (!hasEnoughPoints && !hasEnoughFlights) return false;

    // 2. Verifica se esta na homepage
    if (!isHomepage()) return false;

    // 3. Verifica se ja foi exibido nesta sessao (sessionStorage)
    if (wasModalShown()) return false;

    // 4. Verifica se ja interagiu hoje
    if (hasInteractedToday()) {
      // console.log('[Modal Diamante] Usuario ja interagiu hoje.');
      return false;
    }

    // 5. Verifica limite de visualizacoes diarias (Max 3)
    if (getViewsToday() >= 3) {
      // console.log('[Modal Diamante] Limite diario atingido.');
      return false;
    }

    return true;
  }

  // --- Inicializacao ---

  function init() {
    console.log('TudoAzul Cookie Script Loaded');
    
    syncWithCookie();
    const userData = getTudoAzulData();
    
    if (userData) {
      // Se o usuario tem pontos suficientes e esta na home, configura os triggers
      // A verificacao final de limites ocorre no momento do disparo
      const hasEnoughPoints = userData.qualifyingPoints >= MIN_QUALIFYING_POINTS;
      const hasEnoughFlights = userData.flights >= MIN_FLIGHTS;

      if ((hasEnoughPoints || hasEnoughFlights) && isHomepage()) {
        console.log('[Modal Diamante] Inicializando triggers...');
        setupTriggers();
      }
    }
  }

  // Expor funcoes globais
  window.TudoAzulCookie = {
    getTudoAzulData: getTudoAzulData,
    getAllUsers: getAllUsers,
    getUserById: getUserById,
    clearUsers: clearUsersData,
    sync: syncWithCookie,
    showModal: showDiamanteModal,
    closeModal: closeDiamanteModal,
    checkModal: function(userData) {
        if (userData && checkEligibility(userData)) {
            setupTriggers();
        }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
