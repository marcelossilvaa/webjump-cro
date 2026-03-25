// filepath: exit-intent-modal-v3-pj.js
/**
 * ============================================
 * PICPAY EXIT INTENT - VERSÃO EMPRESARIAL (PJ)
 * Modal de Retenção para Pessoa Jurídica
 * ============================================
 */

(function() {
  'use strict';

  // Namespace para evitar conflitos
  var PicPayPJ = PicPayPJ || {};

  // ============================================
  // CONFIGURAÇÃO DO MÓDULO EMPRESARIAL
  // ============================================
  
  PicPayPJ.settings = {
    elementId: 'picpay-exit-modal',
    sessionKey: 'ppay_pj_modal_displayed',
    activationDelay: 3000,
    storageExpiry: 86400000, // 24h em ms
    showOnce: false, // Desabilitado - modal aparece a cada reload
    geoEndpoints: [
      { provider: 'ipapi', endpoint: 'https://ipapi.co/json/', fields: { city: 'city', state: 'region' } },
      { provider: 'ip-api', endpoint: 'http://ip-api.com/json/?fields=city,regionName', fields: { city: 'city', state: 'regionName' } }
    ]
  };

  // ============================================
  // ESTRUTURA HTML - LAYOUT EMPRESARIAL
  // ============================================
  
  PicPayPJ.buildTemplate = function() {
    var html = [];
    
    // Container principal
    html.push('<div id="' + PicPayPJ.settings.elementId + '" class="pem-overlay" role="dialog" aria-modal="true">');
    html.push('<div class="pem-backdrop"></div>');
    html.push('<div class="pem-container pem-business">');
    
    // Seção Visual - Imagem Lado Esquerdo
    html.push('<aside class="pem-visual-section">');
    html.push('<img src="https://picpay.com/pt-br/pj/media_179c6c5f31891b91112261d00c610e8de8dedf7bb.webp?width=2000&format=webply&optimize=medium" alt="Soluções PicPay para Empresas" class="pem-hero-visual" loading="lazy" />');
    html.push('<div class="pem-gradient-layer"></div>');
    html.push('<figure class="pem-brand-tag"><img src="https://cdn.worldvectorlogo.com/logos/picpay-1.svg" alt="PicPay" /></figure>');
    html.push('</aside>');
    
    // Seção de Conteúdo - Lado Direito
    html.push('<article class="pem-info-section">');
    
    // Cabeçalho com ícone de empresa
    html.push('<header class="pem-top-bar">');
    html.push('<div class="pem-title-group">');
    html.push('<span class="pem-icon-wrapper pem-storefront-icon">');
    html.push('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>');
    html.push('</span>');
    html.push('<h2 class="pem-heading" id="pem-title">Espera aí! ✋</h2>');
    html.push('</div>');
    html.push('<button class="pem-dismiss-btn" aria-label="Fechar" id="pem-close-btn">');
    html.push('<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>');
    html.push('</button>');
    html.push('</header>');
    
    // Subtítulo dinâmico com localização
    html.push('<p class="pem-lead-text" id="pem-subtitle"></p>');
    
    // Lista de benefícios empresariais
    html.push('<ul class="pem-advantages-list">');
    
    // Benefício 1: Vendas multicanal
    html.push('<li class="pem-advantage-item">');
    html.push('<div class="pem-adv-icon pem-icon-sales">');
    html.push('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>');
    html.push('</div>');
    html.push('<div class="pem-adv-content">');
    html.push('<span class="pem-adv-title">Venda presencial ou online</span>');
    html.push('<span class="pem-adv-desc">Maquininha, Link de Pagamento e Tap no Celular para vender de qualquer lugar.</span>');
    html.push('</div>');
    html.push('</li>');
    
    // Benefício 2: Recebimento instantâneo
    html.push('<li class="pem-advantage-item">');
    html.push('<div class="pem-adv-icon pem-icon-instant">');
    html.push('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>');
    html.push('</div>');
    html.push('<div class="pem-adv-content">');
    html.push('<span class="pem-adv-title">Receba o dinheiro na hora</span>');
    html.push('<span class="pem-adv-desc">Antecipe suas vendas das maquininhas com as melhores taxas do mercado.</span>');
    html.push('</div>');
    html.push('</li>');
    
    // Benefício 3: Pix gratuito
    html.push('<li class="pem-advantage-item">');
    html.push('<div class="pem-adv-icon pem-icon-pix">');
    html.push('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>');
    html.push('</div>');
    html.push('<div class="pem-adv-content">');
    html.push('<span class="pem-adv-title">Pix Gratuito e Ilimitado</span>');
    html.push('<span class="pem-adv-desc">Receba e envie Pix sem taxas e com conta 100% gratuita para sua empresa.</span>');
    html.push('</div>');
    html.push('</li>');
    
    html.push('</ul>');
    
    // Área de ações
    html.push('<div class="pem-actions-area">');
    html.push('<a href="/pt-br/pj/abrir-conta" class="pem-primary-action" id="pem-cta-primary">Abrir conta PJ grátis</a>');
    html.push('<button class="pem-secondary-action" id="pem-cta-secondary">Agora não, obrigado</button>');
    html.push('</div>');
    
    // Selo de segurança
    html.push('<footer class="pem-trust-badge">');
    html.push('<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>');
    html.push('<span>Dados protegidos com criptografia bancária</span>');
    html.push('</footer>');
    
    html.push('</article>');
    html.push('</div>');
    html.push('</div>');
    
    return html.join('');
  };

  // ============================================
  // ESTILOS CSS - TEMA EMPRESARIAL
  // ============================================
  
  PicPayPJ.generateStyles = function() {
    var css = [];
    
    // Variáveis de design
    css.push('#picpay-exit-modal.pem-overlay {');
    css.push('--ppj-brand-green: #11C76F;');
    css.push('--ppj-brand-green-hover: #0EAD5F;');
    css.push('--ppj-text-primary: #1D1D1D;');
    css.push('--ppj-text-secondary: #374151;');
    css.push('--ppj-text-muted: #6B7280;');
    css.push('--ppj-surface-light: #F9FAFB;');
    css.push('--ppj-border-color: #E5E7EB;');
    css.push('--ppj-card-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);');
    css.push('--ppj-corner-radius: 16px;');
    css.push('--ppj-btn-radius: 50px;');
    css.push('--ppj-font-stack: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;');
    css.push('position: fixed; inset: 0; z-index: 999999;');
    css.push('display: flex; align-items: center; justify-content: center;');
    css.push('padding: 20px; opacity: 0; visibility: hidden;');
    css.push('transition: opacity 0.35s ease, visibility 0.35s ease;');
    css.push('font-family: var(--ppj-font-stack); box-sizing: border-box;');
    css.push('}');
    
    css.push('#picpay-exit-modal.pem-overlay.pem-active { opacity: 1; visibility: visible; }');
    css.push('#picpay-exit-modal.pem-overlay *, #picpay-exit-modal.pem-overlay *::before, #picpay-exit-modal.pem-overlay *::after { box-sizing: border-box; margin: 0; padding: 0; }');
    
    // Fundo escurecido
    css.push('#picpay-exit-modal .pem-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }');
    
    // Container principal - Grid duas colunas
    css.push('#picpay-exit-modal .pem-container.pem-business {');
    css.push('position: relative; background: #fff; border-radius: var(--ppj-corner-radius);');
    css.push('box-shadow: var(--ppj-card-shadow); max-width: 850px; width: 100%;');
    css.push('max-height: 90vh; overflow: hidden;');
    css.push('display: grid; grid-template-columns: 1fr 1fr;');
    css.push('transform: scale(0.92) translateY(30px);');
    css.push('transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);');
    css.push('}');
    css.push('#picpay-exit-modal.pem-active .pem-container.pem-business { transform: scale(1) translateY(0); }');
    
    // Seção visual (imagem)
    css.push('#picpay-exit-modal .pem-visual-section { position: relative; overflow: hidden; min-height: 500px; }');
    css.push('#picpay-exit-modal .pem-hero-visual { width: 100%; height: 100%; object-fit: cover; object-position: center; }');
    css.push('#picpay-exit-modal .pem-gradient-layer { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(17,199,111,0.15) 0%, rgba(0,0,0,0.35) 100%); }');
    css.push('#picpay-exit-modal .pem-brand-tag { position: absolute; bottom: 24px; left: 24px; background: rgba(255,255,255,0.95); padding: 12px 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }');
    css.push('#picpay-exit-modal .pem-brand-tag img { height: 24px; width: auto; }');
    
    // Seção de informações
    css.push('#picpay-exit-modal .pem-info-section { padding: 36px 40px; display: flex; flex-direction: column; justify-content: center; overflow-y: auto; }');
    
    // Cabeçalho
    css.push('#picpay-exit-modal .pem-top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }');
    css.push('#picpay-exit-modal .pem-title-group { display: flex; align-items: center; gap: 14px; }');
    css.push('#picpay-exit-modal .pem-icon-wrapper { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }');
    css.push('#picpay-exit-modal .pem-storefront-icon { background: var(--ppj-brand-green); }');
    css.push('#picpay-exit-modal .pem-storefront-icon svg { width: 22px; height: 22px; color: white; }');
    css.push('#picpay-exit-modal .pem-heading { font-size: 26px; font-weight: 700; color: var(--ppj-text-primary); line-height: 1.2; letter-spacing: -0.5px; }');
    
    // Botão fechar
    css.push('#picpay-exit-modal .pem-dismiss-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; background: var(--ppj-surface-light); border-radius: 50%; cursor: pointer; color: var(--ppj-text-muted); transition: all 0.2s ease; flex-shrink: 0; }');
    css.push('#picpay-exit-modal .pem-dismiss-btn:hover { background: var(--ppj-border-color); color: var(--ppj-text-primary); transform: rotate(90deg); }');
    css.push('#picpay-exit-modal .pem-dismiss-btn svg { width: 20px; height: 20px; fill: none; }');
    
    // Texto introdutório
    css.push('#picpay-exit-modal .pem-lead-text { font-size: 15px; line-height: 1.5; color: var(--ppj-text-secondary); margin-bottom: 28px; }');
    css.push('#picpay-exit-modal .pem-lead-text .pem-location-highlight { font-weight: 700; color: var(--ppj-brand-green); }');
    
    // Lista de vantagens
    css.push('#picpay-exit-modal .pem-advantages-list { list-style: none; margin: 0 0 28px 0; padding: 0; }');
    css.push('#picpay-exit-modal .pem-advantage-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--ppj-border-color); }');
    css.push('#picpay-exit-modal .pem-advantage-item:last-child { border-bottom: none; padding-bottom: 0; }');
    css.push('#picpay-exit-modal .pem-advantage-item:first-child { padding-top: 0; }');
    
    // Ícones das vantagens
    css.push('#picpay-exit-modal .pem-adv-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }');
    css.push('#picpay-exit-modal .pem-adv-icon svg { width: 22px; height: 22px; }');
    css.push('#picpay-exit-modal .pem-icon-sales { background: linear-gradient(135deg, #E6F9EF 0%, #D1F5E0 100%); }');
    css.push('#picpay-exit-modal .pem-icon-sales svg { color: var(--ppj-brand-green); }');
    css.push('#picpay-exit-modal .pem-icon-instant { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); }');
    css.push('#picpay-exit-modal .pem-icon-instant svg { color: #D97706; }');
    css.push('#picpay-exit-modal .pem-icon-pix { background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); }');
    css.push('#picpay-exit-modal .pem-icon-pix svg { color: #6366F1; }');
    
    // Conteúdo das vantagens
    css.push('#picpay-exit-modal .pem-adv-content { display: flex; flex-direction: column; gap: 4px; padding-top: 2px; }');
    css.push('#picpay-exit-modal .pem-adv-title { font-size: 15px; font-weight: 700; color: var(--ppj-text-primary); line-height: 1.4; }');
    css.push('#picpay-exit-modal .pem-adv-desc { font-size: 13px; color: var(--ppj-text-muted); line-height: 1.4; }');
    
    // Área de ações
    css.push('#picpay-exit-modal .pem-actions-area { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }');
    css.push('#picpay-exit-modal .pem-primary-action { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px 28px; background: var(--ppj-brand-green); color: white; font-size: 16px; font-weight: 600; text-decoration: none; border: none; border-radius: var(--ppj-btn-radius); cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(17,199,111,0.4), 0 2px 6px rgba(17,199,111,0.2); letter-spacing: 0.2px; }');
    css.push('#picpay-exit-modal .pem-primary-action:hover { background: var(--ppj-brand-green-hover); transform: translateY(-3px); box-shadow: 0 8px 25px rgba(17,199,111,0.45), 0 4px 10px rgba(17,199,111,0.25); }');
    css.push('#picpay-exit-modal .pem-primary-action:active { transform: translateY(-1px); }');
    css.push('#picpay-exit-modal .pem-secondary-action { display: flex; align-items: center; justify-content: center; width: 100%; padding: 10px 24px; background: transparent; color: var(--ppj-text-muted); font-size: 13px; font-weight: 500; text-decoration: none; border: none; cursor: pointer; transition: color 0.2s ease; }');
    css.push('#picpay-exit-modal .pem-secondary-action:hover { color: var(--ppj-text-primary); }');
    
    // Badge de confiança
    css.push('#picpay-exit-modal .pem-trust-badge { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; color: var(--ppj-text-muted); background-color: white;}');
    css.push('#picpay-exit-modal .pem-trust-badge svg { width: 14px; height: 14px; fill: none; color: var(--ppj-text-muted); }');
    
    // Animações
    css.push('@keyframes ppj-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); } 20%, 40%, 60%, 80% { transform: translateX(3px); } }');
    css.push('#picpay-exit-modal .pem-primary-action.ppj-shake { animation: ppj-shake 0.5s ease-in-out; }');
    css.push('@keyframes ppj-pulse { 0% { box-shadow: 0 4px 15px rgba(17,199,111,0.4), 0 2px 6px rgba(17,199,111,0.2); } 50% { box-shadow: 0 4px 25px rgba(17,199,111,0.6), 0 2px 12px rgba(17,199,111,0.35); } 100% { box-shadow: 0 4px 15px rgba(17,199,111,0.4), 0 2px 6px rgba(17,199,111,0.2); } }');
    css.push('#picpay-exit-modal .pem-primary-action.ppj-pulse { animation: ppj-pulse 2s ease-in-out infinite; }');
    
    // Responsivo - Tablet
    css.push('@media (max-width: 900px) {');
    css.push('#picpay-exit-modal .pem-container.pem-business { max-width: 720px; }');
    css.push('#picpay-exit-modal .pem-info-section { padding: 28px 32px; }');
    css.push('#picpay-exit-modal .pem-visual-section { min-height: 400px; }');
    css.push('}');
    
    // Responsivo - Mobile
    css.push('@media (max-width: 680px) {');
    css.push('#picpay-exit-modal .pem-container.pem-business { grid-template-columns: 1fr; max-width: 100%; max-height: 95vh; border-radius: var(--ppj-corner-radius) var(--ppj-corner-radius) 0 0; position: fixed; bottom: 0; left: 0; right: 0; transform: translateY(100%); }');
    css.push('#picpay-exit-modal.pem-active .pem-container.pem-business { transform: translateY(0); }');
    css.push('#picpay-exit-modal .pem-visual-section { min-height: 140px; max-height: 140px; order: -1; }');
    css.push('#picpay-exit-modal .pem-brand-tag { bottom: 12px; left: 16px; padding: 8px 14px; }');
    css.push('#picpay-exit-modal .pem-brand-tag img { height: 18px; }');
    css.push('#picpay-exit-modal .pem-info-section { padding: 24px 20px; overflow-y: auto; max-height: calc(95vh - 140px); }');
    css.push('#picpay-exit-modal .pem-top-bar { margin-bottom: 12px; }');
    css.push('#picpay-exit-modal .pem-icon-wrapper { width: 38px; height: 38px; border-radius: 10px; }');
    css.push('#picpay-exit-modal .pem-icon-wrapper svg { width: 18px; height: 18px; }');
    css.push('#picpay-exit-modal .pem-heading { font-size: 22px; }');
    css.push('#picpay-exit-modal .pem-lead-text { font-size: 14px; margin-bottom: 20px; }');
    css.push('#picpay-exit-modal .pem-advantage-item { padding: 12px 0; gap: 12px; }');
    css.push('#picpay-exit-modal .pem-adv-icon { width: 38px; height: 38px; border-radius: 10px; }');
    css.push('#picpay-exit-modal .pem-adv-icon svg { width: 18px; height: 18px; }');
    css.push('#picpay-exit-modal .pem-adv-title { font-size: 14px; }');
    css.push('#picpay-exit-modal .pem-adv-desc { font-size: 12px; }');
    css.push('#picpay-exit-modal .pem-advantages-list { margin-bottom: 20px; }');
    css.push('#picpay-exit-modal .pem-primary-action { padding: 14px 24px; font-size: 15px; }');
    css.push('#picpay-exit-modal .pem-actions-area { margin-bottom: 16px; }');
    css.push('}');
    
    // Mobile pequeno
    css.push('@media (max-width: 380px) {');
    css.push('#picpay-exit-modal .pem-visual-section { min-height: 100px; max-height: 100px; }');
    css.push('#picpay-exit-modal .pem-info-section { padding: 20px 16px; max-height: calc(95vh - 100px); }');
    css.push('#picpay-exit-modal .pem-title-group { gap: 10px; }');
    css.push('#picpay-exit-modal .pem-heading { font-size: 20px; }');
    css.push('}');
    
    return css.join(' ');
  };

  // ============================================
  // MENSAGENS DINÂMICAS - VERSÃO B2B
  // ============================================
  
  PicPayPJ.messages = {
    withCity: 'Empreendedores de <span class="pem-location-highlight">{CITY}</span> já simplificaram suas vendas. Veja o que sua empresa ganha:',
    withState: 'Empreendedores de <span class="pem-location-highlight">{STATE}</span> já simplificaram suas vendas. Veja o que sua empresa ganha:',
    fallback: 'Milhares de empresas já simplificaram suas vendas. Veja o que seu negócio ganha:'
  };

  // ============================================
  // CONTROLADOR DO MODAL
  // ============================================
  
  PicPayPJ.ModalController = function() {
    this.isActive = false;
    this.wasDisplayed = false;
    this.locationData = null;
    this.modalElement = null;
  };

  PicPayPJ.ModalController.prototype.bootstrap = function() {
    var self = this;
    
    if (this.checkPreviousDisplay()) {
      console.log('[PicPay PJ Modal] Modal já exibido anteriormente');
      return;
    }
    
    this.injectStylesheet();
    this.renderModal();
    this.resolveLocation();
    
    setTimeout(function() {
      self.activateDetection();
    }, PicPayPJ.settings.activationDelay);
  };

  PicPayPJ.ModalController.prototype.injectStylesheet = function() {
    var styleTag = document.createElement('style');
    styleTag.id = 'picpay-pj-modal-styles';
    styleTag.textContent = PicPayPJ.generateStyles();
    document.head.appendChild(styleTag);
  };

  PicPayPJ.ModalController.prototype.renderModal = function() {
    var container = document.createElement('div');
    container.innerHTML = PicPayPJ.buildTemplate();
    this.modalElement = container.firstChild;
    document.body.appendChild(this.modalElement);
    this.bindEvents();
  };

  PicPayPJ.ModalController.prototype.bindEvents = function() {
    var self = this;
    
    var dismissBtn = document.getElementById('pem-close-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function() { self.conceal('dismiss_button'); });
    }
    
    var backdrop = this.modalElement.querySelector('.pem-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', function() { self.conceal('backdrop_tap'); });
    }
    
    var secondaryAction = document.getElementById('pem-cta-secondary');
    if (secondaryAction) {
      secondaryAction.addEventListener('click', function() { self.conceal('secondary_action'); });
    }
    
    var primaryAction = document.getElementById('pem-cta-primary');
    if (primaryAction) {
      primaryAction.addEventListener('click', function() {
        self.logEvent('cta_conversion', { location: self.locationData?.city || self.locationData?.state || 'generic' });
      });
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self.wasDisplayed) {
        self.conceal('escape_key');
      }
    });
  };

  PicPayPJ.ModalController.prototype.resolveLocation = function() {
    var self = this;
    var endpoints = PicPayPJ.settings.geoEndpoints;
    
    function attemptFetch(index) {
      if (index >= endpoints.length) {
        self.refreshContent();
        return;
      }
      
      var config = endpoints[index];
      
      fetch(config.endpoint)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          var cityValue = data[config.fields.city];
          var stateValue = data[config.fields.state];
          
          if (cityValue || stateValue) {
            self.locationData = {
              city: self.sanitizeText(cityValue),
              state: self.sanitizeText(stateValue),
              source: config.provider
            };
            self.refreshContent();
          } else {
            attemptFetch(index + 1);
          }
        })
        .catch(function() {
          attemptFetch(index + 1);
        });
    }
    
    attemptFetch(0);
  };

  PicPayPJ.ModalController.prototype.sanitizeText = function(text) {
    if (!text) return null;
    return text.toString().replace(/[<>\"'&]/g, '').substring(0, 30);
  };

  PicPayPJ.ModalController.prototype.refreshContent = function() {
    var subtitleEl = document.getElementById('pem-subtitle');
    
    if (subtitleEl) {
      var message;
      if (this.locationData?.city) {
        message = PicPayPJ.messages.withCity.replace(/{CITY}/g, this.locationData.city);
      } else if (this.locationData?.state) {
        message = PicPayPJ.messages.withState.replace(/{STATE}/g, this.locationData.state);
      } else {
        message = PicPayPJ.messages.fallback;
      }
      subtitleEl.innerHTML = message;
    }
  };

  PicPayPJ.ModalController.prototype.activateDetection = function() {
    var self = this;
    this.isActive = true;
    
    document.addEventListener('mouseout', function(e) {
      if (self.isActive && !self.wasDisplayed && e.clientY < 10 && e.relatedTarget === null) {
        self.reveal('exit_intent');
      }
    });
    
    document.addEventListener('visibilitychange', function() {
      if (self.isActive && !self.wasDisplayed && document.visibilityState === 'hidden') {
        setTimeout(function() {
          if (document.visibilityState === 'visible') {
            self.reveal('tab_return');
          }
        }, 100);
      }
    });
    
    console.log('[PicPay PJ Modal] Detecção ativada');
  };

  PicPayPJ.ModalController.prototype.reveal = function(trigger) {
    if (this.wasDisplayed) return;
    
    this.wasDisplayed = true;
    this.isActive = false;
    this.modalElement.classList.add('pem-active');
    this.persistDisplay();
    
    var primaryBtn = document.getElementById('pem-cta-primary');
    if (primaryBtn) {
      primaryBtn.classList.add('ppj-pulse');
      
      setTimeout(function() {
        primaryBtn.classList.remove('ppj-pulse');
        primaryBtn.classList.add('ppj-shake');
        setTimeout(function() { primaryBtn.classList.remove('ppj-shake'); }, 500);
      }, 3500);
    }
    
    this.logEvent('modal_displayed', { trigger: trigger });
    console.log('[PicPay PJ Modal] Exibido, gatilho:', trigger);
  };

  PicPayPJ.ModalController.prototype.conceal = function(reason) {
    this.modalElement.classList.remove('pem-active');
    this.logEvent('modal_dismissed', { reason: reason });
    console.log('[PicPay PJ Modal] Fechado, motivo:', reason);
  };

  PicPayPJ.ModalController.prototype.checkPreviousDisplay = function() {
    // Desabilitado - modal aparece a cada reload
    if (!PicPayPJ.settings.showOnce) return false;
    return sessionStorage.getItem(PicPayPJ.settings.sessionKey) === 'true' ||
           document.cookie.indexOf(PicPayPJ.settings.sessionKey + '=true') !== -1;
  };

  PicPayPJ.ModalController.prototype.persistDisplay = function() {
    sessionStorage.setItem(PicPayPJ.settings.sessionKey, 'true');
    var expiryDate = new Date(Date.now() + PicPayPJ.settings.storageExpiry);
    document.cookie = PicPayPJ.settings.sessionKey + '=true; expires=' + expiryDate.toUTCString() + '; path=/; SameSite=Lax';
  };

  PicPayPJ.ModalController.prototype.logEvent = function(eventName, data) {
    if (typeof window.adobe !== 'undefined' && window.adobe.target) {
      window.adobe.target.trackEvent({
        mbox: PicPayPJ.settings.tracking.mboxName,
        params: Object.assign({ event: PicPayPJ.settings.tracking.eventPrefix + '_' + eventName }, data)
      });
    }
    
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: PicPayPJ.settings.tracking.eventPrefix + '_' + eventName,
        eventData: data
      });
    }
  };

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  
  function initPJModal() {
    var controller = new PicPayPJ.ModalController();
    controller.bootstrap();
    window.PicPayExitModalPJ = controller;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPJModal);
  } else {
    initPJModal();
  }

})();