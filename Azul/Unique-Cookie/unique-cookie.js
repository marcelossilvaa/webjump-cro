// Script para extrair dados do cookie TudoAzul com persistencia em localStorage

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
  const MIN_QUALIFYING_POINTS = 23000;

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
      '}' +
      '.diamante-modal-overlay.active {' +
      '  opacity: 1;' +
      '}' +
      '.diamante-modal-container {' +
      '  background: linear-gradient(180deg, #1a3a5c 0%, #0d2240 100%);' +
      '  border-radius: 16px;' +
      '  padding: 24px 28px;' +
      '  max-width: 320px;' +
      '  width: 90%;' +
      '  position: relative;' +
      '  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);' +
      '  transform: scale(0.9);' +
      '  transition: transform 0.3s ease;' +
      '}' +
      '.diamante-modal-overlay.active .diamante-modal-container {' +
      '  transform: scale(1);' +
      '}' +
      '.diamante-modal-close {' +
      '  position: absolute;' +
      '  top: 12px;' +
      '  right: 12px;' +
      '  background: transparent;' +
      '  border: none;' +
      '  color: #ffffff;' +
      '  font-size: 24px;' +
      '  cursor: pointer;' +
      '  opacity: 0.7;' +
      '  transition: opacity 0.2s ease;' +
      '  line-height: 1;' +
      '  padding: 4px;' +
      '}' +
      '.diamante-modal-close:hover {' +
      '  opacity: 1;' +
      '}' +
      '.diamante-modal-header {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: space-between;' +
      '  margin-bottom: 8px;' +
      '}' +
      '.diamante-modal-icon {' +
      '  width: 40px;' +
      '  height: 40px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '}' +
      '.diamante-modal-icon svg {' +
      '  width: 36px;' +
      '  height: 36px;' +
      '}' +
      '.diamante-modal-badge {' +
      '  background-color: #e91e63;' +
      '  color: #ffffff;' +
      '  padding: 6px 16px;' +
      '  border-radius: 20px;' +
      '  font-size: 14px;' +
      '  font-weight: 600;' +
      '  font-family: Arial, sans-serif;' +
      '}' +
      '.diamante-modal-level {' +
      '  color: #8fa8c8;' +
      '  font-size: 13px;' +
      '  font-weight: 400;' +
      '  margin-bottom: 4px;' +
      '  font-family: Arial, sans-serif;' +
      '}' +
      '.diamante-modal-title {' +
      '  color: #ffffff;' +
      '  font-size: 22px;' +
      '  font-weight: 700;' +
      '  margin-bottom: 20px;' +
      '  font-family: Arial, sans-serif;' +
      '  letter-spacing: 1px;' +
      '}' +
      '.diamante-modal-content {' +
      '  background-color: rgba(255, 255, 255, 0.95);' +
      '  border-radius: 12px;' +
      '  padding: 20px;' +
      '}' +
      '.diamante-modal-subtitle {' +
      '  color: #1a3a5c;' +
      '  font-size: 16px;' +
      '  font-weight: 600;' +
      '  margin-bottom: 16px;' +
      '  font-family: Arial, sans-serif;' +
      '}' +
      '.diamante-modal-requirement {' +
      '  display: flex;' +
      '  align-items: baseline;' +
      '  margin-bottom: 4px;' +
      '}' +
      '.diamante-modal-number {' +
      '  color: #00bcd4;' +
      '  font-size: 32px;' +
      '  font-weight: 700;' +
      '  font-family: Arial, sans-serif;' +
      '  margin-right: 8px;' +
      '}' +
      '.diamante-modal-label {' +
      '  color: #1a3a5c;' +
      '  font-size: 14px;' +
      '  font-weight: 400;' +
      '  font-family: Arial, sans-serif;' +
      '}' +
      '.diamante-modal-connector {' +
      '  color: #8fa8c8;' +
      '  font-size: 12px;' +
      '  font-weight: 400;' +
      '  margin: 4px 0;' +
      '  font-family: Arial, sans-serif;' +
      '  background-color: #e8eef4;' +
      '  padding: 2px 12px;' +
      '  border-radius: 10px;' +
      '  display: inline-block;' +
      '}' +
      '.diamante-modal-divider {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  margin: 16px 0;' +
      '}' +
      '.diamante-modal-divider-line {' +
      '  flex: 1;' +
      '  height: 1px;' +
      '  background-color: #d0d8e0;' +
      '}' +
      '.diamante-modal-divider-text {' +
      '  color: #1a3a5c;' +
      '  font-size: 14px;' +
      '  font-weight: 600;' +
      '  padding: 0 12px;' +
      '  font-family: Arial, sans-serif;' +
      '}' +
      '.diamante-modal-price {' +
      '  display: flex;' +
      '  align-items: baseline;' +
      '}' +
      '.diamante-modal-price-value {' +
      '  color: #e91e63;' +
      '  font-size: 28px;' +
      '  font-weight: 700;' +
      '  font-family: Arial, sans-serif;' +
      '  margin-right: 8px;' +
      '}' +
      '.diamante-modal-price-label {' +
      '  color: #1a3a5c;' +
      '  font-size: 13px;' +
      '  font-weight: 400;' +
      '  font-family: Arial, sans-serif;' +
      '}';

    document.head.appendChild(styles);
  }

  // Funcao para criar o HTML do modal
  function createModalHTML() {
    const modalHTML = '' +
      '<div class="diamante-modal-overlay" id="diamante-unique-modal">' +
      '  <div class="diamante-modal-container">' +
      '    <button class="diamante-modal-close" id="diamante-modal-close" aria-label="Fechar">&times;</button>' +
      '    <div class="diamante-modal-header">' +
      '      <div class="diamante-modal-icon">' +
      '        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '          <path d="M12 2L2 9L12 22L22 9L12 2Z" stroke="#ffffff" stroke-width="1.5" fill="none"/>' +
      '          <path d="M2 9H22" stroke="#ffffff" stroke-width="1.5"/>' +
      '          <path d="M12 2L8 9L12 22L16 9L12 2Z" stroke="#ffffff" stroke-width="1.5" fill="none"/>' +
      '        </svg>' +
      '      </div>' +
      '      <span class="diamante-modal-badge">Novo</span>' +
      '    </div>' +
      '    <div class="diamante-modal-level">Nivel 5</div>' +
      '    <div class="diamante-modal-title">DIAMANTE UNIQUE</div>' +
      '    <div class="diamante-modal-content">' +
      '      <div class="diamante-modal-subtitle">Como conquistar:</div>' +
      '      <div class="diamante-modal-requirement">' +
      '        <span class="diamante-modal-number">26</span>' +
      '        <span class="diamante-modal-label">trechos</span>' +
      '      </div>' +
      '      <span class="diamante-modal-connector">e</span>' +
      '      <div class="diamante-modal-requirement">' +
      '        <span class="diamante-modal-number">26 mil</span>' +
      '        <span class="diamante-modal-label">pontos qualificaveis</span>' +
      '      </div>' +
      '      <div class="diamante-modal-divider">' +
      '        <div class="diamante-modal-divider-line"></div>' +
      '        <span class="diamante-modal-divider-text">ou</span>' +
      '        <div class="diamante-modal-divider-line"></div>' +
      '      </div>' +
      '      <div class="diamante-modal-price">' +
      '        <span class="diamante-modal-price-value">R$50 mil</span>' +
      '      </div>' +
      '      <span class="diamante-modal-price-label">em gasto aereo*</span>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    return modalHTML;
  }

  // Funcao para exibir o modal
  function showDiamanteModal() {
    // Verifica se o modal ja existe no DOM
    if (document.getElementById('diamante-unique-modal')) {
      const modal = document.getElementById('diamante-unique-modal');
      modal.classList.add('active');
      return;
    }

    // Injeta estilos
    injectModalStyles();

    // Cria e adiciona o modal ao DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = createModalHTML();
    document.body.appendChild(modalContainer.firstElementChild);

    // Adiciona evento de fechar
    const closeBtn = document.getElementById('diamante-modal-close');
    const modal = document.getElementById('diamante-unique-modal');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeDiamanteModal();
      });
    }

    // Fecha ao clicar fora do modal
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeDiamanteModal();
        }
      });
    }

    // Anima a entrada do modal
    setTimeout(function () {
      if (modal) {
        modal.classList.add('active');
      }
    }, 50);

    console.log('[Modal Diamante] Modal exibido');
  }

  // Funcao para fechar o modal
  function closeDiamanteModal() {
    const modal = document.getElementById('diamante-unique-modal');

    if (modal) {
      modal.classList.remove('active');

      // Remove o modal do DOM apos a animacao
      setTimeout(function () {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }

    console.log('[Modal Diamante] Modal fechado');
  }

  // Funcao para verificar e exibir o modal baseado nos qualifying points
  function checkAndShowModal(userData) {
    if (!userData) {
      console.log('[Modal Diamante] Sem dados de usuario para verificar');
      return false;
    }

    // Verifica se o modal ja foi exibido nesta sessao
    if (wasModalShown()) {
      console.log('[Modal Diamante] Modal ja foi exibido nesta sessao');
      return false;
    }

    // Verifica se o usuario tem mais de 23 mil qualifying points
    if (userData.qualifyingPoints >= MIN_QUALIFYING_POINTS) {
      console.log('[Modal Diamante] Usuario elegivel! QualifyingPoints: ' + userData.qualifyingPoints);
      showDiamanteModal();
      markModalAsShown();
      return true;
    }

    console.log('[Modal Diamante] Usuario nao elegivel. QualifyingPoints: ' + userData.qualifyingPoints + ' (minimo: ' + MIN_QUALIFYING_POINTS + ')');
    return false;
  }

  // Expoe as funcoes no escopo global para uso externo
  window.TudoAzulCookie = {
    getData: getTudoAzulData,
    getAllUsers: getAllUsers,
    getUserById: getUserById,
    clearUsers: clearUsersData,
    sync: syncWithCookie,
    showModal: showDiamanteModal,
    closeModal: closeDiamanteModal,
    checkModal: checkAndShowModal
  };

  // Inicializa e extrai os dados automaticamente
  function init() {
    // Primeiro carrega dados salvos do localStorage
    loadFromLocalStorage();

    // Depois sincroniza com o cookie atual
    const userData = getTudoAzulData();

    if (userData) {
      console.log('[Cookie TudoAzul] Dados extraidos com sucesso:');
      console.log('  - ID do usuario: ' + userData.id);
      console.log('  - Flights: ' + userData.flights);
      console.log('  - Qualifying Points: ' + userData.qualifyingPoints);
      console.log('  - Ultima atualizacao: ' + userData.lastUpdated);

      // Verifica e exibe o modal se o usuario for elegivel
      checkAndShowModal(userData);
    }

    console.log('[Cookie TudoAzul] Total de usuarios armazenados: ' + usuariosData.length);
  }

  // Aguarda o DOM estar pronto antes de inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
