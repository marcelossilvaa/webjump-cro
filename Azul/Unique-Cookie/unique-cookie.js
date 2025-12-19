// MODAL DIAMANTE TUDO AZUL - UNIQUE COOKIE

(function () {
  const MIN_QUALIFYING_POINTS = 23000;
  const MIN_FLIGHTS = 23;
  const MAX_QUALIFYING_POINTS = 26000;
  const MAX_FLIGHTS = 26;

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
      } else {
        // Atualiza os dados do usuario existente
        usuariosData[usuarioIndex].flights = userData.flights;
        usuariosData[usuarioIndex].qualifyingPoints = userData.qualifyingPoints;
        usuariosData[usuarioIndex].lastUpdated = userData.lastUpdated;
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
      '  background: transparent;' +
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
    const seatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M16.4385 12.0725L21.3447 16.9787" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M17.9628 15.3665C17.9628 15.3665 17.9278 15.3665 17.9103 15.3665C17.8665 15.3665 17.8139 15.3665 17.7701 15.384C17.6825 15.3927 17.6036 15.419 17.5248 15.4453C17.3758 15.4979 17.2444 15.5767 17.1393 15.6643C16.9203 15.8483 15.8427 16.9259 15.7988 16.9697C15.6236 16.9172 15.2557 16.8033 14.8527 16.6719C14.9403 16.6193 15.0366 16.558 15.1067 16.4791C15.1418 16.4441 15.1768 16.4003 15.2031 16.3565C15.2294 16.3127 15.2557 16.2601 15.2732 16.1988L14.914 15.8396C14.8527 15.8571 14.8088 15.8834 14.7563 15.9096C14.7125 15.9359 14.6687 15.971 14.6336 16.006C14.5548 16.0761 14.5022 16.1725 14.4409 16.2601C14.3971 16.3389 14.3533 16.4178 14.3095 16.4966C13.8539 16.3565 13.4158 16.2338 13.1618 16.1637C13.1267 16.1637 13.1004 16.155 13.0654 16.155C12.9515 16.155 12.8639 16.2075 12.8288 16.2513C12.7675 16.3214 12.7062 16.4178 12.7062 16.4178L15.0717 17.6969C14.9578 17.8196 14.1518 18.6869 14.1518 18.6869C13.9415 18.8972 13.7312 19.2564 13.7137 19.2827C13.3808 19.1775 12.7938 19.0111 12.5134 18.9936C12.4959 18.9936 12.4696 18.9936 12.4433 18.9936C12.382 18.9936 12.3119 19.0023 12.2418 19.0724C12.163 19.1513 12.1279 19.2214 12.1279 19.2214L13.2844 19.9047L12.9953 20.334L13.0654 20.4041L13.1355 20.4742L13.5648 20.1763L14.2481 21.3328C14.2481 21.3328 14.3182 21.289 14.3971 21.2189C14.4935 21.1225 14.4759 21.0174 14.4759 20.9561C14.4584 20.6845 14.2919 20.0887 14.1868 19.7558C14.2131 19.7383 14.581 19.5192 14.7826 19.3177C14.7826 19.3177 15.6499 18.5117 15.7726 18.4066L17.0517 20.7721C17.0517 20.7721 17.1568 20.7107 17.2182 20.6494C17.2795 20.5968 17.3408 20.4654 17.3058 20.3165C17.2357 20.0624 17.113 19.6244 16.9728 19.1688C17.0604 19.1337 17.1393 19.0899 17.2094 19.0374C17.297 18.9848 17.3934 18.9235 17.4635 18.8446C17.4985 18.8096 17.5336 18.7658 17.5598 18.722C17.5861 18.6782 17.6124 18.6256 17.6299 18.5643L17.2707 18.2051C17.2094 18.2226 17.1656 18.2489 17.1218 18.2751C17.078 18.3014 17.0342 18.3365 16.9991 18.3715C16.9203 18.4416 16.8677 18.538 16.8064 18.6256C16.6837 18.2138 16.5698 17.8546 16.5085 17.6794C16.5523 17.6356 17.6299 16.558 17.8139 16.3389C17.9015 16.225 17.9804 16.1024 18.0329 15.9535C18.0592 15.8834 18.0768 15.7958 18.0943 15.7081C18.0943 15.6643 18.103 15.6205 18.1118 15.568C18.1118 15.5242 18.1118 15.4803 18.1118 15.4365C18.1118 15.419 18.1118 15.4103 18.0943 15.4015C18.0855 15.3927 18.068 15.384 18.0592 15.384C18.0329 15.384 18.0067 15.384 17.9804 15.384" fill="white"/><path d="M17.9887 9.28667L17.279 8.57701C16.8147 8.11267 16.07 8.11267 15.6056 8.57701L13.3453 10.8374C13.687 11.1791 13.687 11.731 13.3453 12.0727C13.0036 12.4144 12.4516 12.4144 12.11 12.0727L6.74816 17.4345C6.28382 17.8989 6.28382 18.6436 6.74816 19.1079L11.2689 23.6286C11.7332 24.093 12.4779 24.093 12.9423 23.6286L13.6519 22.919M13.3365 12.0727L14.2652 13.0014M18.6983 8.57701L16.438 10.8374C16.7796 11.1791 16.7796 11.731 16.438 12.0727C16.0963 12.4144 15.5443 12.4144 15.2026 12.0727L9.84083 17.4345C9.3765 17.8989 9.3765 18.6436 9.84083 19.1079L14.3616 23.6286C14.8259 24.093 15.5706 24.093 16.035 23.6286L21.4055 18.2581C21.4055 18.2581 21.3617 18.2318 21.3442 18.2143C21.0025 17.8726 21.0025 17.3206 21.3442 16.9789C21.6859 16.6373 22.2378 16.6373 22.5883 16.9789C22.6058 16.9965 22.6146 17.0227 22.6321 17.0403L24.9012 14.7711C25.3656 14.3068 25.3656 13.5621 24.9012 13.0978L20.3805 8.57701C19.9161 8.11267 19.1714 8.11267 18.7071 8.57701H18.6983Z" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/></svg>';
    const userIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M9.88574 22.0858C9.88574 22.4961 10.2187 22.8291 10.629 22.8291C11.0393 22.8291 11.3723 22.4961 11.3723 22.0858C11.3723 21.6755 11.0334 21.3425 10.629 21.3425C10.2187 21.3425 9.88574 21.6755 9.88574 22.0858Z" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M18.2226 12.6013L19.3464 15.069L21.4276 16.288L21.1303 16.8826L18.4545 15.6934L17.8599 14.5041" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M16.6707 18.3694C16.0761 19.2614 15.4814 20.4506 13.6976 21.9372L14.5895 22.2345V22.8292H12.5083V21.9372C14.4527 19.9333 15.1841 17.8402 15.2912 16.9958" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M16.5756 15.9432L18.7519 18.3753L19.6438 21.943L20.8331 22.2404V22.835H19.0492L17.5626 19.2731L15.5944 17.4476C14.6965 16.5022 15.5647 15.4437 15.5647 15.4437L16.0166 13.5647" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M17.8657 10.5143C17.8895 10.8295 18.0679 11.2576 18.4068 11.5371C18.6566 11.7393 18.9896 11.7274 19.2453 11.5133C19.4534 11.3408 19.6437 11.0614 19.7745 10.7641C20.161 9.86617 19.7328 9.3191 19.1561 9.18828C18.169 8.96827 17.836 10.0208 17.8717 10.5203L17.8657 10.5143Z" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M13.3999 16.3357L10.9263 21.3425" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M12.627 17.9472L10.6291 16.8828L8.54785 21.0452L9.94523 21.7945" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M17.1286 16.5378L18.0325 13.8798C18.7163 12.1078 17.5568 11.8343 17.5568 11.8343C17.5568 11.8343 17.4914 11.8165 17.3843 11.7927C16.3913 11.6084 15.5707 12.0305 14.8928 13.1484L13.1387 16.1811L13.7511 16.4843C13.7511 16.4843 15.7848 13.6063 16.4626 13.1365" stroke="white" stroke-width="0.5" stroke-linejoin="round"/></svg>';
    const fastIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M16.0246 9.14307C14.4188 9.14307 13.4029 10.2245 13.4029 11.7648C13.4029 11.7648 13.3898 14.6749 12.4197 15.3696C12.4197 15.3696 13.0162 15.6974 14.7137 15.6974V16.6805L12.4001 17.5195C11.6201 17.8013 11.1089 18.5419 11.1089 19.3678V22.6318" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M13.0752 20.2854V23.2348" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M18.9741 20.2854V23.2348" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M16.0244 9.14307C17.6302 9.14307 18.6461 10.2245 18.6461 11.7648C18.6461 11.7648 18.6592 14.6749 19.6293 15.3696C19.6293 15.3696 19.0328 15.6974 17.3353 15.6974V16.6805L19.649 17.5195C20.4224 17.8013 20.9401 18.5419 20.9401 19.3678V22.6318" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M12.0922 14.3865C11.1877 14.3865 10.4536 13.6524 10.4536 12.7479V11.7648C10.4536 10.8603 11.1877 10.1262 12.0922 10.1262C12.6296 10.1262 13.1015 10.3818 13.403 10.7816C13.4358 10.8275 13.4686 10.8734 13.4948 10.9193" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M9.14258 19.3022V16.9688C9.14258 16.4052 9.50308 15.9005 10.0405 15.7235L10.8008 15.4679C10.9975 15.4024 11.1482 15.2516 11.2137 15.055L11.4366 14.3799" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M19.9573 14.3865C20.8618 14.3865 21.5959 13.6524 21.5959 12.7479V11.7648C21.5959 10.8603 20.8618 10.1262 19.9573 10.1262C19.4198 10.1262 18.9479 10.3818 18.6464 10.7816C18.6137 10.8275 18.5809 10.8734 18.5547 10.9193" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M22.9068 19.3022V16.9688C22.9068 16.4052 22.5463 15.9005 22.0089 15.7235L21.2486 15.4679C21.0519 15.4024 20.9012 15.2516 20.8357 15.055L20.6128 14.3799" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/></svg>';
    const calendarIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M10.6675 20.4943V18.6195H12.4811M13.7339 20.4943V18.6195H15.5474M16.7915 20.4943V18.6195H18.6051M19.8316 20.4943V18.6195H21.6452M10.6675 16.8234V14.9485H12.4811M13.7339 16.8234V14.9485H15.5474M16.7915 16.8234V14.9485H18.6051M19.8316 16.8234V14.9485H21.6452M22.5826 13.1087H9.14307V10.6644H22.5826V13.1087ZM22.5914 21.975H9.15184V10.6644H22.5914V21.975ZM12.7089 10.6644H11.1494V8.99098C11.1494 8.57044 11.4911 8.22876 11.9116 8.22876H11.9466C12.3672 8.22876 12.7089 8.57044 12.7089 8.99098V10.6644ZM20.5851 10.6644H19.0256V8.99098C19.0256 8.57044 19.3673 8.22876 19.7878 8.22876H19.8229C20.2434 8.22876 20.5851 8.57044 20.5851 8.99098V10.6644Z" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/></svg>';

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
      '      <div class="diamante-modal-benefits-title">O novo nível DIAMANTE UNIQUE chega dia 13 de Janeiro de 2026, confira os benefícios e como alcançá-los:</div>' +
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
      '          <div class="diamante-modal-benefit-icon">' + fastIcon + '</div>' +
      '          <div class="diamante-modal-benefit-content">' +
      '            <span class="diamante-modal-benefit-title">4 passagens cortesia para acompanhante³</span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="diamante-modal-benefit-highlight">' +
      '          <div class="diamante-modal-benefit-icon">' + userIcon + '</div>' +
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
      '      Possui trechos ou pontos qualificáveis para serem solicitados? <span>Acesse sua conta Azul Fidelidade e fique próximo do nível DIAMANTE UNIQUE.</span>' +
      '    </div>' +
      '    ' +
      '    <div class="diamante-modal-actions">' +
      '      <a href="https://www.voeazul.com.br/br/pt/programa-fidelidade/comunicado-novo-nivel?msockid=2c47c86ae1fb6bc025f9dee6e0e26af0" class="diamante-modal-btn diamante-modal-btn-secondary">Solicitar trechos ou pontos</a>' +
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
      showDiamanteModal();
      markModalAsShown(); // Marca na sessao
      incrementViews();   // Incrementa contador diario
    }
  }

  function checkEligibility(userData) {
    // 1. Verifica pontos ou trechos (Faixa de elegibilidade: >= Minimo E < Maximo)
    const points = userData.qualifyingPoints || 0;
    const flights = userData.flights || 0;

    const isPointsEligible = points >= MIN_QUALIFYING_POINTS && points < MAX_QUALIFYING_POINTS;
    const isFlightsEligible = flights >= MIN_FLIGHTS && flights < MAX_FLIGHTS;

    if (!isPointsEligible && !isFlightsEligible) return false;

    // 2. Verifica se esta na homepage
    if (!isHomepage()) return false;

    // 3. Verifica se ja foi exibido nesta sessao (sessionStorage)
    if (wasModalShown()) return false;

    // 4. Verifica se ja interagiu hoje
    if (hasInteractedToday()) {
      return false;
    }

    // 5. Verifica limite de visualizacoes diarias (Max 3)
    if (getViewsToday() >= 3) {
      return false;
    }

    return true;
  }

  // --- Inicializacao ---

  function init() {
    syncWithCookie();
    const userData = getTudoAzulData();
    
    if (userData) {
      // Se o usuario tem pontos suficientes e esta na home, configura os triggers
      const points = userData.qualifyingPoints || 0;
      const flights = userData.flights || 0;

      const isPointsEligible = points >= MIN_QUALIFYING_POINTS && points < MAX_QUALIFYING_POINTS;
      const isFlightsEligible = flights >= MIN_FLIGHTS && flights < MAX_FLIGHTS;

      if ((isPointsEligible || isFlightsEligible) && isHomepage()) {
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
