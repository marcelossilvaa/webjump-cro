/**
 * Azul Diamond Loading Banner
 * Banner fullscreen exclusivo para usuários Diamante durante loading
 * Detecta tier via cookie e personaliza com nome do usuário
 */

(function () {
  'use strict';

  const CONFIG = {
    // 🔧 MODO DE OPERAÇÃO - Altere aqui para trocar entre teste e produção
    // 'test' = Ativo para TODOS os usuários (não valida tier)
    // 'production' = Ativo APENAS para usuários Diamante (valida tier)
    mode: 'test', // ✅ Altere para 'production' quando for para produção
    
    targetTier: 'DIA', // Tier Diamante (usado apenas em modo 'production')
    loadingMessages: [
      'Olá, {name}! Estamos preparando sua experiência Diamante.',
      'Priorizando os melhores benefícios e tarifas para você, {name}.',
      'Quase lá, {name}. Finalizando sua jornada premium.',
    ],
    messageRotationInterval: 3000, // ✅ NOVO: Intervalo de rotação das mensagens (3 segundos)
    backgroundImage: 'https://i.imgur.com/SS3msM7.png',
    diamondIcon: `<svg width="60" height="60" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.0034 45.5032C35.4298 45.5032 45.5034 35.4296 45.5034 23.0032C45.5034 10.5768 35.4298 0.503174 23.0034 0.503174C10.577 0.503174 0.503418 10.5768 0.503418 23.0032C0.503418 35.4296 10.577 45.5032 23.0034 45.5032Z" stroke="white" stroke-width="1.00645"/>
      <path d="M29.4346 5.00305C29.4346 9.97568 25.4043 14.006 20.4316 14.006C25.4043 14.006 29.4346 18.0363 29.4346 23.009C29.4346 18.0363 33.4649 14.006 38.4376 14.006C33.4649 14.006 29.4346 9.97568 29.4346 5.00305Z" fill="white"/>
      <path d="M19.147 14.0032H16.2694L10.147 21.2889L23.0041 35.8603L35.8613 21.2889L34.5755 19.8317" stroke="white" stroke-width="2.0129" stroke-miterlimit="10"/>
    </svg>`,
    brandColors: {
      primary: '#041E42',
      gold: '#D4AF37',
      white: '#FFFFFF',
    },
  };

  class DiamondLoadingBanner {
    constructor() {
      this.isVisible = false;
      this.userName = null;
      this.userTier = null;
      this.currentMessageIndex = 0;
      this.messageInterval = null;
      this.observer = null;
      this.activeLoaders = new Set();
      this.bannerElement = null;
      this.progressValue = 0; // ✅ Novo: controle da barra de progresso
      this.progressInterval = null; // ✅ Novo: intervalo da animação de progresso
      this.init();
    }

    init() {
      // Verifica o modo de operação
      if (CONFIG.mode === 'production') {
        // Modo Produção: Verifica se é Diamante
        if (!this.checkDiamondTier()) {
          console.log('[DiamondLoading] MODO PRODUÇÃO - Usuário não é Diamante');
          return; // Não é Diamante, não faz nada
        }
        console.log('[DiamondLoading] MODO PRODUÇÃO - Usuário Diamante detectado:', {
          userName: this.userName,
          userTier: this.userTier
        });
      } else {
        // Modo Teste: Busca dados mas não valida tier
        this.getUserData();
        console.log('[DiamondLoading] MODO TESTE - Ativo para todos os usuários:', {
          userName: this.userName,
          userTier: this.userTier
        });
      }

      // Inicia observador global de loadings
      this.setupGlobalLoaderObserver();
    }

    getUserData() {
      try {
        const cookies = document.cookie.split(';');
        let tudoAzulCookie = null;

        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'TudoAzul') {
            tudoAzulCookie = value;
            break;
          }
        }

        if (tudoAzulCookie) {
          const decodedCookie = decodeURIComponent(tudoAzulCookie);
          const tudoAzulData = JSON.parse(decodedCookie);

          // Captura tier
          this.userTier = tudoAzulData?.program?.levelCode || 'N/A';
          
          // ✅ CORRIGIDO: Busca nome nos campos corretos
          // Primeiro tenta "name" (objeto com first/last/middle)
          const nameObj = tudoAzulData?.name;
          if (nameObj && typeof nameObj === 'object' && nameObj.first) {
            this.userName = this.capitalizeName(nameObj.first);
          } 
          // Senão, tenta "Name" (string direto na raiz)
          else if (tudoAzulData?.Name && typeof tudoAzulData.Name === 'string') {
            this.userName = this.capitalizeName(tudoAzulData.Name);
          }
          // Fallback para outros campos possíveis
          else if (tudoAzulData?.firstName) {
            this.userName = this.capitalizeName(tudoAzulData.firstName);
          }
          else {
            this.userName = 'Viajante';
          }
        } else {
          // Sem cookie: usa valores padrão
          this.userTier = 'N/A';
          this.userName = 'Viajante';
        }

        console.log('[DiamondLoading] MODO TESTE - Dados extraídos:', {
          userName: this.userName,
          userTier: this.userTier,
          mensagemExemplo: this.getFormattedMessage()
        });

      } catch (error) {
        console.error('[DiamondLoading] Erro ao buscar dados do usuário:', error);
        this.userTier = 'N/A';
        this.userName = 'Viajante';
      }
    }

    // ✅ NOVO: Método auxiliar para capitalizar nome
    capitalizeName(name) {
      if (!name || typeof name !== 'string') return 'Viajante';
      
      // Converte para lowercase e capitaliza primeira letra
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    checkDiamondTier() {
      try {
        const cookies = document.cookie.split(';');
        let tudoAzulCookie = null;

        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'TudoAzul') {
            tudoAzulCookie = value;
            break;
          }
        }

        if (!tudoAzulCookie) {
          return false;
        }

        const decodedCookie = decodeURIComponent(tudoAzulCookie);
        const tudoAzulData = JSON.parse(decodedCookie);

        // Captura tier
        this.userTier = tudoAzulData?.program?.levelCode;
        
        // ✅ CORRIGIDO: Busca nome nos campos corretos
        const nameObj = tudoAzulData?.name;
        if (nameObj && typeof nameObj === 'object' && nameObj.first) {
          this.userName = this.capitalizeName(nameObj.first);
        } 
        else if (tudoAzulData?.Name && typeof tudoAzulData.Name === 'string') {
          this.userName = this.capitalizeName(tudoAzulData.Name);
        }
        else if (tudoAzulData?.firstName) {
          this.userName = this.capitalizeName(tudoAzulData.firstName);
        }
        else {
          this.userName = 'Viajante';
        }

        // Verifica se é Diamante
        return this.userTier === CONFIG.targetTier;
      } catch (error) {
        console.error('[DiamondLoading] Erro ao verificar tier:', error);
        return false;
      }
    }

    setupGlobalLoaderObserver() {
      // Verifica loaders existentes
      this.checkForExistingLoaders();

      // Observa novos loaders
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // Loaders adicionados
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('loader')) {
                  this.handleLoaderAppear(node);
                }
                const loaderElements = node.querySelectorAll ? node.querySelectorAll('.loader') : [];
                loaderElements.forEach((loader) => this.handleLoaderAppear(loader));
              }
            });

            // Loaders removidos
            mutation.removedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('loader')) {
                  this.handleLoaderDisappear(node);
                }
                const loaderElements = node.querySelectorAll ? node.querySelectorAll('.loader') : [];
                loaderElements.forEach((loader) => this.handleLoaderDisappear(loader));
              }
            });
          }
        });
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    checkForExistingLoaders() {
      const existingLoaders = document.querySelectorAll('.loader');
      existingLoaders.forEach((loader) => this.handleLoaderAppear(loader));
    }

    handleLoaderAppear(loaderElement) {
      // Adiciona loader ao set de ativos
      this.activeLoaders.add(loaderElement);

      // Esconde o loader original
      loaderElement.style.display = 'none';

      // Mostra banner se não estiver visível
      if (!this.isVisible) {
        this.showBanner();
      }
    }

    handleLoaderDisappear(loaderElement) {
      // Remove loader do set
      this.activeLoaders.delete(loaderElement);

      // Se não há mais loaders ativos, esconde banner
      setTimeout(() => {
        if (this.activeLoaders.size === 0) {
          this.hideBanner();
        }
      }, 300);
    }

    showBanner() {
      if (this.isVisible) return;

      this.createBannerHTML();
      this.addStyles();
      this.isVisible = true;
      this.startMessageRotation();
      this.startProgressAnimation(); // ✅ NOVO: Inicia animação da barra de progresso

      // Analytics
      this.trackEvent('show');
    }

    hideBanner() {
      if (!this.isVisible) return;

      const banner = document.getElementById('diamond-loading-banner');
      if (banner) {
        banner.classList.remove('show');

        setTimeout(() => {
          if (banner && banner.parentNode) {
            banner.remove();
          }
          this.isVisible = false;
          this.stopMessageRotation();
          this.stopProgressAnimation(); // ✅ NOVO: Para animação da barra
          this.bannerElement = null;

          // Restaura loaders originais
          this.activeLoaders.forEach((loader) => {
            loader.style.display = '';
          });
          this.activeLoaders.clear();
        }, 300);
      }

      // Analytics
      this.trackEvent('hide');
    }

    createBannerHTML() {
      const existing = document.getElementById('diamond-loading-banner');
      if (existing) existing.remove();

      // SVG da logo Azul (TudoAzul completo)
      const azulLogo = '<svg width="373" height="52" viewBox="0 0 373 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M227.866 15.9484C223.803 15.9484 220.514 19.2371 220.514 23.3004C220.514 27.3636 223.803 30.6523 227.866 30.6523C231.929 30.6523 235.218 27.3636 235.218 23.3004C235.218 19.2371 231.929 15.9484 227.866 15.9484Z" fill="#041E42"/><path d="M244.055 4.73047C244.055 7.35881 246.184 9.48781 248.813 9.48781C251.441 9.48781 253.57 7.35881 253.570 4.73047C253.570 2.10214 251.441 -0.0268555 248.813 -0.0268555C246.184 -0.0268555 244.055 2.10214 244.055 4.73047Z" fill="#54599E"/></svg>';

      // Ícones dos benefícios
      const iconCortesia = '<svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="26.5" cy="26.5" r="25.66" stroke="white" stroke-width="0.75"/><path d="M26.21 20.47c-2.19 0-3.97 1.78-3.97 3.97s1.78 3.97 3.97 3.97 3.97-1.78 3.97-3.97-1.78-3.97-3.97-3.97z" fill="white"/></svg>';
      
      const iconPrioridade = '<svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="26.5" cy="26.5" r="25.66" fill="#041E42" stroke="white" stroke-width="2"/><path d="M19.5 26.5l4 4 8-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      
      const iconAcompanhante = '<svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="26.5" cy="26.5" r="25.66" stroke="rgba(255,255,255,0.4)" stroke-width="0.75"/><path d="M20 28c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/></svg>';

      const bannerHTML =
        '<div id="diamond-loading-banner" class="diamond-loading-overlay">' +
        '<div class="diamond-loading-background"></div>' +
        '<div class="diamond-loading-container">' +
        // Logo Azul no topo direito
        '<div class="diamond-loading-logo">' + azulLogo + '</div>' +
        
        // ✅ ALTERADO: Container de texto com 3 mensagens para rotação
        '<div class="diamond-loading-text-container">' +
        '<h2 class="diamond-loading-title diamond-loading-title--active">' + this.getFormattedMessage(0) + '</h2>' +
        '<h2 class="diamond-loading-title diamond-loading-title--next">' + this.getFormattedMessage(1) + '</h2>' +
        '<h2 class="diamond-loading-title diamond-loading-title--prev">' + this.getFormattedMessage(2) + '</h2>' +
        '</div>' +
        
        // Benefícios
        '<div class="diamond-loading-benefits">' +
        '<div class="diamond-benefit-item">' +
        '<div class="diamond-benefit-icon">' + iconCortesia + '</div>' +
        '<p class="diamond-benefit-text diamond-benefit-text--highlight">Cortesias ilimitadas</p>' +
        '</div>' +
        '<div class="diamond-benefit-item">' +
        '<div class="diamond-benefit-icon">' + iconPrioridade + '</div>' +
        '<p class="diamond-benefit-text">Check-in e Embarque prioritário</p>' +
        '</div>' +
        '<div class="diamond-benefit-item">' +
        '<div class="diamond-benefit-icon">' + iconAcompanhante + '</div>' +
        '<p class="diamond-benefit-text">Passagem cortesia para acompanhante</p>' +
        '</div>' +
        '</div>' +
        
        // Barra de progresso
        '<div class="diamond-loading-progress-container">' +
        '<div class="diamond-loading-progress-bar">' +
        '<div class="diamond-loading-progress-fill"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      document.body.insertAdjacentHTML('beforeend', bannerHTML);
      this.bannerElement = document.getElementById('diamond-loading-banner');

      // Força reflow para animação
      void this.bannerElement.offsetWidth;
      this.bannerElement.classList.add('show');
    }

    addStyles() {
      const styleId = 'diamond-loading-styles';
      if (document.getElementById(styleId)) return;

      const styles =
        '<style id="' +
        styleId +
        '">' +
        '.diamond-loading-overlay {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'z-index: 999999;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'opacity: 0;' +
        'visibility: hidden;' +
        'transition: all 0.4s ease;' +
        '}' +
        '.diamond-loading-overlay.show {' +
        'opacity: 1;' +
        'visibility: visible;' +
        '}' +
        // Background com gradiente + imagem
        '.diamond-loading-background {' +
        'position: absolute;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: linear-gradient(177.66deg, rgba(4, 30, 66, 0) 34.43%, #041E42 81.34%), url(' + CONFIG.backgroundImage + ');' +
        'background-size: cover;' +
        'background-position: center;' +
        'background-repeat: no-repeat;' +
        'z-index: 1;' +
        '}' +
        // Container principal
        '.diamond-loading-container {' +
        'position: relative;' +
        'z-index: 2;' +
        'width: 100%;' +
        'height: 100%;' +
        'display: flex;' +
        'flex-direction: column;' +
        'padding: 40px 45px;' +
        'box-sizing: border-box;' +
        '}' +
        // Logo Azul
        '.diamond-loading-logo {' +
        'position: absolute;' +
        'top: 40px;' +
        'right: 40px;' +
        'animation: diamondFadeIn 0.6s ease-out;' +
        '}' +
        '.diamond-loading-logo svg {' +
        'width: auto;' +
        'height: 52px;' +
        '}' +
        // Texto principal
        '.diamond-loading-text-container {' +
        'margin-top: 84px;' +
        'margin-left: auto;' +
        'max-width: 920px;' +
        'position: relative;' +
        'min-height: 88px;' + // Altura mínima para 2 linhas de texto
        'animation: diamondFadeInUp 0.6s ease-out 0.2s both;' +
        '}' +
        '.diamond-loading-title {' +
        'font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;' +
        'font-style: normal;' +
        'font-weight: 500;' +
        'font-size: clamp(24px, 3vw, 36px);' +
        'line-height: 1.22;' +
        'text-align: right;' +
        'color: #041E42;' +
        'margin: 0;' +
        'position: absolute;' + // ✅ NOVO: Posicionamento absoluto para sobreposição
        'top: 0;' +
        'right: 0;' +
        'width: 100%;' +
        'opacity: 0;' +
        'transform: translateY(20px);' +
        'transition: opacity 0.5s ease, transform 0.5s ease;' +
        '}' +
        // ✅ NOVO: Estados de animação das mensagens
        '.diamond-loading-title--active {' +
        'opacity: 1 !important;' +
        'transform: translateY(0) !important;' +
        'z-index: 3;' +
        '}' +
        '.diamond-loading-title--next {' +
        'opacity: 0;' +
        'transform: translateY(20px);' +
        'z-index: 2;' +
        '}' +
        '.diamond-loading-title--prev {' +
        'opacity: 0;' +
        'transform: translateY(-20px);' +
        'z-index: 1;' +
        '}' +
        // Benefícios
        '.diamond-loading-benefits {' +
        'position: absolute;' +
        'bottom: 140px;' +
        'right: 45px;' +
        'display: flex;' +
        'flex-direction: column;' +
        'gap: 32px;' +
        'align-items: flex-end;' +
        'max-width: 740px;' +
        'animation: diamondFadeInUp 0.6s ease-out 0.4s both;' +
        '}' +
        '.diamond-benefit-item {' +
        'display: flex;' +
        'flex-direction: row;' +
        'justify-content: flex-end;' +
        'align-items: center;' +
        'gap: 16px;' +
        '}' +
        '.diamond-benefit-icon {' +
        'flex-shrink: 0;' +
        '}' +
        '.diamond-benefit-icon svg {' +
        'width: 52px;' +
        'height: 52px;' +
        'display: block;' +
        '}' +
        '.diamond-benefit-text {' +
        'font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;' +
        'font-style: normal;' +
        'font-weight: 400;' +
        'font-size: clamp(24px, 2.5vw, 36px);' +
        'line-height: 1.22;' +
        'color: rgba(255, 255, 255, 0.4);' +
        'margin: 0;' +
        '}' +
        '.diamond-benefit-text--highlight {' +
        'font-size: clamp(32px, 3.3vw, 48px);' +
        'line-height: 1.21;' +
        'color: #FFFFFF;' +
        '}' +
        // Barra de progresso
        '.diamond-loading-progress-container {' +
        'position: absolute;' +
        'bottom: 45px;' +
        'left: 45px;' +
        'right: 45px;' +
        'animation: diamondFadeIn 0.6s ease-out 0.6s both;' +
        '}' +
        '.diamond-loading-progress-bar {' +
        'width: 100%;' +
        'max-width: 1355px;' +
        'height: 16px;' +
        'background: rgba(217, 217, 217, 0.5);' +
        'border-radius: 24px;' +
        'overflow: hidden;' +
        '}' +
        '.diamond-loading-progress-fill {' +
        'height: 100%;' +
        'width: 0%;' +
        'background: #FFFFFF;' +
        'border-radius: 24px;' +
        'transition: width 0.3s ease;' +
        '}' +
        // Animações
        '@keyframes diamondFadeIn {' +
        'from { opacity: 0; }' +
        'to { opacity: 1; }' +
        '}' +
        '@keyframes diamondFadeInUp {' +
        'from {' +
        'opacity: 0;' +
        'transform: translateY(30px);' +
        '}' +
        'to {' +
        'opacity: 1;' +
        'transform: translateY(0);' +
        '}' +
        '}' +
        // Mobile
        '@media (max-width: 768px) {' +
        '.diamond-loading-container {' +
        'padding: 24px 20px;' +
        '}' +
        '.diamond-loading-logo {' +
        'top: 24px;' +
        'right: 20px;' +
        '}' +
        '.diamond-loading-logo svg {' +
        'height: 32px;' +
        '}' +
        '.diamond-loading-text-container {' +
        'margin-top: 60px;' +
        'max-width: 100%;' +
        'min-height: 72px;' + // Altura mínima menor em mobile
        '}' +
        '.diamond-loading-title {' +
        'text-align: center;' +
        '}' +
        '.diamond-loading-benefits {' +
        'position: static;' +
        'margin-top: auto;' +
        'margin-bottom: 80px;' +
        'align-items: center;' +
        'gap: 20px;' +
        '}' +
        '.diamond-benefit-item {' +
        'flex-direction: column;' +
        'text-align: center;' +
        '}' +
        '.diamond-benefit-icon svg {' +
        'width: 44px;' +
        'height: 44px;' +
        '}' +
        '.diamond-loading-progress-container {' +
        'left: 20px;' +
        'right: 20px;' +
        'bottom: 24px;' +
        '}' +
        '.diamond-loading-progress-bar {' +
        'height: 12px;' +
        '}' +
        '}' +
        '</style>';

      document.head.insertAdjacentHTML('beforeend', styles);
    }

    // ✅ NOVO: Método auxiliar para formatar mensagem por índice
    getFormattedMessage(index) {
      if (index === undefined || index === null) {
        index = this.currentMessageIndex;
      }
      const message = CONFIG.loadingMessages[index];
      return message.replace('{name}', this.userName);
    }

    startMessageRotation() {
      this.currentMessageIndex = 0;

      // ✅ ALTERADO: Rotação com animação suave
      this.messageInterval = setInterval(() => {
        this.rotateMessages();
      }, CONFIG.messageRotationInterval);
    }

    // ✅ NOVO: Método para rotacionar mensagens com animação
    rotateMessages() {
      const titles = document.querySelectorAll('.diamond-loading-title');
      if (titles.length !== 3) return;

      // Avança para a próxima mensagem
      this.currentMessageIndex = (this.currentMessageIndex + 1) % CONFIG.loadingMessages.length;
      
      // Calcula índices das 3 mensagens
      const activeIndex = this.currentMessageIndex;
      const nextIndex = (this.currentMessageIndex + 1) % CONFIG.loadingMessages.length;
      const prevIndex = (this.currentMessageIndex + 2) % CONFIG.loadingMessages.length;

      // Remove todas as classes de estado
      titles.forEach(title => {
        title.classList.remove('diamond-loading-title--active', 'diamond-loading-title--next', 'diamond-loading-title--prev');
      });

      // Atualiza o conteúdo de cada título
      titles[0].textContent = this.getFormattedMessage(activeIndex);
      titles[1].textContent = this.getFormattedMessage(nextIndex);
      titles[2].textContent = this.getFormattedMessage(prevIndex);

      // Aplica as novas classes após um pequeno delay para garantir a animação
      setTimeout(() => {
        titles[0].classList.add('diamond-loading-title--active');
        titles[1].classList.add('diamond-loading-title--next');
        titles[2].classList.add('diamond-loading-title--prev');
      }, 50);
    }

    // ✅ REMOVIDO: updateMessage() - não é mais necessário
    // O método rotateMessages() substitui updateMessage()

    trackEvent(action) {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'diamond_loading_' + action, {
          event_category: 'premium_experience',
          event_label: 'diamond_tier',
          user_tier: this.userTier,
          user_name: this.userName,
        });
      }
    }

    destroy() {
      this.hideBanner();
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.stopMessageRotation();
      this.activeLoaders.clear();
    }
  }

  // Inicialização
  function initDiamondLoading() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new DiamondLoadingBanner();
      });
    } else {
      new DiamondLoadingBanner();
    }
  }

  initDiamondLoading();
  window.DiamondLoadingBanner = DiamondLoadingBanner;

  // ------- NOVA API: controle manual do Diamond Loading (para debug) -------
  (function () {
	// Garante ou cria uma instância reutilizável
	function ensureInstance() {
		if (window._diamondLoadingInstance && window._diamondLoadingInstance instanceof DiamondLoadingBanner) {
			return window._diamondLoadingInstance;
		}
		// Cria instância (vai executar init() da classe)
		window._diamondLoadingInstance = new DiamondLoadingBanner();
		return window._diamondLoadingInstance;
	}

	// API pública para debug / controle manual
	window.DiamondLoadingControl = {
		// Mostra o banner; opcionalmente passa um nome para sobrescrever o cookie
		show: function (name) {
			const inst = ensureInstance();
			if (name) inst.userName = inst.capitalizeName ? inst.capitalizeName(name) : name;
			// garante styles e HTML
			inst.addStyles();
			inst.createBannerHTML();
			inst.showBanner();
			return inst;
		},

		// Esconde o banner
		hide: function () {
			const inst = window._diamondLoadingInstance;
			if (inst) inst.hideBanner();
		},

		// Alterna visibilidade; opcionalmente sobrescreve nome
		toggle: function (name) {
			const inst = ensureInstance();
			if (inst.isVisible) {
				inst.hideBanner();
			} else {
				if (name) inst.userName = inst.capitalizeName ? inst.capitalizeName(name) : name;
				inst.addStyles();
				inst.createBannerHTML();
				inst.showBanner();
			}
		},

		// Mostra por X ms (padrão 5000ms) e esconde automaticamente
		showFor: function (ms, name) {
			const inst = ensureInstance();
			if (name) inst.userName = inst.capitalizeName ? inst.capitalizeName(name) : name;
			inst.addStyles();
			inst.createBannerHTML();
			inst.showBanner();
			const duration = typeof ms === 'number' ? ms : 5000;
			setTimeout(() => {
				inst.hideBanner();
			}, duration);
		},

		// Remove / destroi a instância e observers
		destroy: function () {
			if (window._diamondLoadingInstance) {
				try { window._diamondLoadingInstance.destroy(); } catch (e) {}
				window._diamondLoadingInstance = null;
			}
		},

		// Retorna instância (se existir)
		instance: function () {
			return window._diamondLoadingInstance || null;
		},

		// Helper: cria um elemento .loader invisível para testar o observador
		// retorna o elemento criado (id opcional)
		createFakeLoader: function (id) {
			const elId = id || '__diamond_fake_loader';
			let el = document.getElementById(elId);
			if (!el) {
				el = document.createElement('div');
				el.id = elId;
				el.className = 'loader';
				// estilo mínimo para não interferir visualmente
				el.style.position = 'fixed';
				el.style.width = '1px';
				el.style.height = '1px';
				el.style.left = '0';
				el.style.top = '0';
				el.style.opacity = '0';
				document.body.appendChild(el);
			}
			return el;
		},

		// Helper: remove um fake loader criado por createFakeLoader
		removeFakeLoader: function (id) {
			const elId = id || '__diamond_fake_loader';
			const el = document.getElementById(elId);
			if (el && el.parentNode) el.parentNode.removeChild(el);
		}
	};

	// Atalho em console: DiamondLoadingControl.show('Nome') / .hide() / .toggle() / .showFor(3000)
})();
})();
