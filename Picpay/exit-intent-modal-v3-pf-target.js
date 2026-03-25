/**
 * ============================================
 * EXIT INTENT MODAL V3 - ADOBE TARGET COMPATIBLE
 * ============================================
 * 
 * Componente para Teste A/B - PicPay
 * Versão 3.0 - Sem Template Literals (ES5 Compatible)
 * 
 * ============================================
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  
  var CONFIG = {
    modal: {
      id: 'picpay-exit-modal',
      showOnce: false,
      delayBeforeEnable: 3000,
      cookieName: 'picpay_exit_shown_v3',
      cookieExpiry: 1
    },
    
    geoApis: [
      {
        name: 'ipapi',
        url: 'https://ipapi.co/json/',
        cityField: 'city',
        stateField: 'region',
        countryField: 'country_code'
      },
      {
        name: 'ip-api',
        url: 'http://ip-api.com/json/?fields=status,city,regionName,countryCode',
        cityField: 'city',
        stateField: 'regionName',
        countryField: 'countryCode'
      }
    ],
    
    tracking: {
      mboxName: 'exit-intent-prova-social-v3',
      eventPrefix: 'picpay_exit_modal_v3'
    }
  };

  // ============================================
  // TEMPLATE DO MODAL V3 - DUAS COLUNAS
  // ============================================
  
  var MODAL_TEMPLATE = [
    '<div id="picpay-exit-modal" class="pem-overlay" role="dialog" aria-modal="true" aria-labelledby="pem-title">',
      '<div class="pem-backdrop"></div>',
      '<div class="pem-container">',
        
        '<!-- COLUNA ESQUERDA - Imagem de Capa -->',
        '<div class="pem-col-image">',
          '<img src="https://cdn.picpay.com/docs/picpay/portais/bgHero.webp" alt="PicPay" class="pem-cover-image" />',
          '<div class="pem-image-overlay"></div>',
          '<div class="pem-image-badge">',
            '<img src="https://cdn.worldvectorlogo.com/logos/picpay-1.svg" alt="PicPay" />',
          '</div>',
        '</div>',
        
        '<!-- COLUNA DIREITA - Conteúdo -->',
        '<div class="pem-col-content">',
          
          '<!-- Header com Ícone + Título -->',
          '<div class="pem-header">',
            '<div class="pem-header-title">',
              '<div class="pem-card-icon">',
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                  '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>',
                  '<line x1="1" y1="10" x2="23" y2="10"></line>',
                '</svg>',
              '</div>',
              '<h2 class="pem-title" id="pem-title">Espera aí! ✋</h2>',
            '</div>',
            '<button class="pem-close" aria-label="Fechar modal" id="pem-close-btn">',
              '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                '<line x1="18" y1="6" x2="6" y2="18"></line>',
                '<line x1="6" y1="6" x2="18" y2="18"></line>',
              '</svg>',
            '</button>',
          '</div>',
          
          '<!-- Subtítulo com Localização -->',
          '<p class="pem-subtitle" id="pem-subtitle"></p>',
          
          '<!-- Lista de Diferenciais -->',
          '<ul class="pem-features">',
            
            '<!-- Rendimento 102% CDI -->',
            '<li class="pem-feature">',
              '<div class="pem-feature-icon pem-icon-chart">',
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                  '<line x1="12" y1="20" x2="12" y2="10"></line>',
                  '<line x1="18" y1="20" x2="18" y2="4"></line>',
                  '<line x1="6" y1="20" x2="6" y2="16"></line>',
                '</svg>',
              '</div>',
              '<div class="pem-feature-text">',
                '<span>Rende <strong>102% do CDI</strong> todo dia útil</span>',
                '<span class="pem-feature-sub">(mais que a poupança)</span>',
              '</div>',
            '</li>',
            
            '<!-- Parcele Pix e Boletos -->',
            '<li class="pem-feature">',
              '<div class="pem-feature-icon pem-icon-card">',
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                  '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>',
                  '<line x1="1" y1="10" x2="23" y2="10"></line>',
                  '<line x1="6" y1="15" x2="10" y2="15"></line>',
                '</svg>',
              '</div>',
              '<div class="pem-feature-text">',
                '<span>Parcele Pix e boletos em até <strong>12x</strong></span>',
                '<span class="pem-feature-sub">no cartão de crédito</span>',
              '</div>',
            '</li>',
            
            '<!-- Conta Gratuita e Segura -->',
            '<li class="pem-feature">',
              '<div class="pem-feature-icon pem-icon-shield">',
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
                  '<path d="M9 12l2 2 4-4"></path>',
                '</svg>',
              '</div>',
              '<div class="pem-feature-text">',
                '<span>Cartão <strong>sem anuidade</strong> e conta</span>',
                '<span class="pem-feature-sub">100% segura e gratuita</span>',
              '</div>',
            '</li>',
            
          '</ul>',
          
          '<!-- CTA -->',
          '<div class="pem-cta-wrapper">',
            '<a href="/pt-br/pj/baixe-o-app" class="pem-cta-primary" id="pem-cta-primary">',
              'Abrir minha conta grátis',
            '</a>',
            '<button class="pem-cta-secondary" id="pem-cta-secondary">',
              'Agora não, obrigado',
            '</button>',
          '</div>',
          
          '<!-- Badge de Segurança -->',
          '<div class="pem-security">',
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
              '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>',
              '<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
            '</svg>',
            '<span>Seus dados estão protegidos com criptografia</span>',
          '</div>',
          
        '</div>',
        
      '</div>',
    '</div>'
  ].join('');

  // ============================================
  // ESTILOS CSS V3 - DUAS COLUNAS
  // ============================================
  
  var MODAL_STYLES = [
    '/* RESET E VARIÁVEIS - PICPAY BRAND */',
    '#picpay-exit-modal.pem-overlay {',
      '--pem-primary: #11C76F;',
      '--pem-primary-dark: #0EAD5F;',
      '--pem-primary-light: #E6F9EF;',
      '--pem-dark: #1D1D1D;',
      '--pem-gray-dark: #374151;',
      '--pem-gray: #6B7280;',
      '--pem-gray-light: #9CA3AF;',
      '--pem-background: #FFFFFF;',
      '--pem-surface: #F9FAFB;',
      '--pem-border: #E5E7EB;',
      '--pem-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);',
      '--pem-radius: 16px;',
      '--pem-radius-full: 50px;',
      "--pem-font: 'aeonik', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
      'position: fixed;',
      'top: 0;',
      'left: 0;',
      'right: 0;',
      'bottom: 0;',
      'z-index: 999999;',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'padding: 20px;',
      'opacity: 0;',
      'visibility: hidden;',
      'transition: opacity 0.35s ease, visibility 0.35s ease;',
      'font-family: var(--pem-font);',
      'box-sizing: border-box;',
    '}',
    
    '#picpay-exit-modal.pem-overlay.pem-active {',
      'opacity: 1;',
      'visibility: visible;',
    '}',
    
    '#picpay-exit-modal.pem-overlay *,',
    '#picpay-exit-modal.pem-overlay *::before,',
    '#picpay-exit-modal.pem-overlay *::after {',
      'box-sizing: border-box;',
      'margin: 0;',
      'padding: 0;',
    '}',
    
    '/* BACKDROP */',
    '#picpay-exit-modal .pem-backdrop {',
      'position: absolute;',
      'top: 0;',
      'left: 0;',
      'right: 0;',
      'bottom: 0;',
      'background: rgba(0, 0, 0, 0.7);',
      'backdrop-filter: blur(8px);',
      '-webkit-backdrop-filter: blur(8px);',
    '}',
    
    '/* CONTAINER - DUAS COLUNAS */',
    '#picpay-exit-modal .pem-container {',
      'position: relative;',
      'background: var(--pem-background);',
      'border-radius: var(--pem-radius);',
      'box-shadow: var(--pem-shadow);',
      'max-width: 850px;',
      'width: 100%;',
      'max-height: 90vh;',
      'overflow: hidden;',
      'transform: scale(0.92) translateY(30px);',
      'transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);',
      'display: grid;',
      'grid-template-columns: 1fr 1fr;',
    '}',
    
    '#picpay-exit-modal.pem-active .pem-container {',
      'transform: scale(1) translateY(0);',
    '}',
    
    '/* COLUNA ESQUERDA - IMAGEM */',
    '#picpay-exit-modal .pem-col-image {',
      'position: relative;',
      'overflow: hidden;',
      'min-height: 500px;',
    '}',
    
    '#picpay-exit-modal .pem-cover-image {',
      'width: 100%;',
      'height: 100%;',
      'object-fit: cover;',
      'object-position: center;',
    '}',
    
    '#picpay-exit-modal .pem-image-overlay {',
      'position: absolute;',
      'top: 0;',
      'left: 0;',
      'right: 0;',
      'bottom: 0;',
      'background: linear-gradient(135deg, rgba(17, 199, 111, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);',
    '}',
    
    '#picpay-exit-modal .pem-image-badge {',
      'position: absolute;',
      'bottom: 24px;',
      'left: 24px;',
      'background: rgba(255, 255, 255, 0.95);',
      'padding: 12px 20px;',
      'border-radius: 12px;',
      'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);',
    '}',
    
    '#picpay-exit-modal .pem-image-badge img {',
      'height: 24px;',
      'width: auto;',
    '}',
    
    '/* COLUNA DIREITA - CONTEÚDO */',
    '#picpay-exit-modal .pem-col-content {',
      'padding: 36px 40px;',
      'display: flex;',
      'flex-direction: column;',
      'justify-content: center;',
      'overflow-y: auto;',
    '}',
    
    '/* HEADER */',
    '#picpay-exit-modal .pem-header {',
      'display: flex;',
      'align-items: center;',
      'justify-content: space-between;',
      'margin-bottom: 16px;',
    '}',
    
    '#picpay-exit-modal .pem-header-title {',
      'display: flex;',
      'align-items: center;',
      'gap: 14px;',
    '}',
    
    '#picpay-exit-modal .pem-card-icon {',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'width: 44px;',
      'height: 44px;',
      'background: var(--pem-primary);',
      'border-radius: 12px;',
      'flex-shrink: 0;',
    '}',
    
    '#picpay-exit-modal .pem-card-icon svg {',
      'width: 22px;',
      'height: 22px;',
      'color: white;',
    '}',
    
    '#picpay-exit-modal .pem-title {',
      'font-size: 26px;',
      'font-weight: 700;',
      'color: var(--pem-dark);',
      'line-height: 1.2;',
      'letter-spacing: -0.5px;',
    '}',
    
    '#picpay-exit-modal .pem-close {',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'width: 36px;',
      'height: 36px;',
      'border: none;',
      'background: var(--pem-surface);',
      'border-radius: 50%;',
      'cursor: pointer;',
      'color: var(--pem-gray);',
      'transition: all 0.2s ease;',
      'flex-shrink: 0;',
    '}',
    
    '#picpay-exit-modal .pem-close:hover {',
      'background: var(--pem-border);',
      'color: var(--pem-dark);',
      'transform: rotate(90deg);',
    '}',
    
    '/* SUBTÍTULO */',
    '#picpay-exit-modal .pem-subtitle {',
      'font-size: 15px;',
      'line-height: 1.5;',
      'color: var(--pem-gray-dark);',
      'margin-bottom: 28px;',
    '}',
    
    '#picpay-exit-modal .pem-subtitle .pem-city {',
      'font-weight: 700;',
      'color: var(--pem-primary);',
    '}',
    
    '/* LISTA DE DIFERENCIAIS */',
    '#picpay-exit-modal .pem-features {',
      'list-style: none;',
      'margin: 0 0 28px 0;',
      'padding: 0;',
    '}',
    
    '#picpay-exit-modal .pem-feature {',
      'display: flex;',
      'align-items: flex-start;',
      'gap: 16px;',
      'padding: 16px 0;',
      'border-bottom: 1px solid var(--pem-border);',
    '}',
    
    '#picpay-exit-modal .pem-feature:last-child {',
      'border-bottom: none;',
      'padding-bottom: 0;',
    '}',
    
    '#picpay-exit-modal .pem-feature:first-child {',
      'padding-top: 0;',
    '}',
    
    '#picpay-exit-modal .pem-feature-icon {',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'width: 44px;',
      'height: 44px;',
      'border-radius: 12px;',
      'flex-shrink: 0;',
    '}',
    
    '#picpay-exit-modal .pem-feature-icon svg {',
      'width: 22px;',
      'height: 22px;',
    '}',
    
    '#picpay-exit-modal .pem-icon-chart {',
      'background: linear-gradient(135deg, #E6F9EF 0%, #D1F5E0 100%);',
    '}',
    
    '#picpay-exit-modal .pem-icon-chart svg {',
      'color: var(--pem-primary);',
    '}',
    
    '#picpay-exit-modal .pem-icon-card {',
      'background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);',
    '}',
    
    '#picpay-exit-modal .pem-icon-card svg {',
      'color: #6366F1;',
    '}',
    
    '#picpay-exit-modal .pem-icon-shield {',
      'background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);',
    '}',
    
    '#picpay-exit-modal .pem-icon-shield svg {',
      'color: #D97706;',
    '}',
    
    '#picpay-exit-modal .pem-feature-text {',
      'display: flex;',
      'flex-direction: column;',
      'gap: 2px;',
      'padding-top: 2px;',
    '}',
    
    '#picpay-exit-modal .pem-feature-text span {',
      'font-size: 15px;',
      'color: var(--pem-dark);',
      'line-height: 1.4;',
    '}',
    
    '#picpay-exit-modal .pem-feature-text strong {',
      'font-weight: 700;',
      'color: var(--pem-dark);',
    '}',
    
    '#picpay-exit-modal .pem-feature-sub {',
      'font-size: 13px !important;',
      'color: var(--pem-gray) !important;',
    '}',
    
    '/* CTA */',
    '#picpay-exit-modal .pem-cta-wrapper {',
      'display: flex;',
      'flex-direction: column;',
      'gap: 10px;',
      'margin-bottom: 20px;',
    '}',
    
    '#picpay-exit-modal .pem-cta-primary {',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'width: 100%;',
      'padding: 16px 28px;',
      'background: var(--pem-primary);',
      'color: white;',
      'font-size: 16px;',
      'font-weight: 600;',
      'text-decoration: none;',
      'border: none;',
      'border-radius: var(--pem-radius-full);',
      'cursor: pointer;',
      'transition: all 0.25s ease;',
      'box-shadow: 0 4px 15px rgba(17, 199, 111, 0.4), 0 2px 6px rgba(17, 199, 111, 0.2);',
      'letter-spacing: 0.2px;',
    '}',
    
    '#picpay-exit-modal .pem-cta-primary:hover {',
      'background: var(--pem-primary-dark);',
      'transform: translateY(-3px);',
      'box-shadow: 0 8px 25px rgba(17, 199, 111, 0.45), 0 4px 10px rgba(17, 199, 111, 0.25);',
    '}',
    
    '#picpay-exit-modal .pem-cta-primary:active {',
      'transform: translateY(-1px);',
    '}',
    
    '#picpay-exit-modal .pem-cta-secondary {',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'width: 100%;',
      'padding: 10px 24px;',
      'background: transparent;',
      'color: var(--pem-gray);',
      'font-size: 13px;',
      'font-weight: 500;',
      'text-decoration: none;',
      'border: none;',
      'cursor: pointer;',
      'transition: color 0.2s ease;',
    '}',
    
    '#picpay-exit-modal .pem-cta-secondary:hover {',
      'color: var(--pem-dark);',
    '}',
    
    '/* BADGE DE SEGURANÇA */',
    '#picpay-exit-modal .pem-security {',
      'display: flex;',
      'align-items: center;',
      'justify-content: center;',
      'gap: 6px;',
      'font-size: 11px;',
      'color: var(--pem-gray-light);',
    '}',
    
    '#picpay-exit-modal .pem-security svg {',
      'color: var(--pem-gray-light);',
    '}',
    
    '/* ANIMAÇÕES */',
    '@keyframes pem-shake {',
      '0%, 100% { transform: translateX(0); }',
      '10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }',
      '20%, 40%, 60%, 80% { transform: translateX(3px); }',
    '}',
    
    '#picpay-exit-modal .pem-cta-primary.pem-shake {',
      'animation: pem-shake 0.5s ease-in-out;',
    '}',
    
    '@keyframes pem-pulse {',
      '0% { box-shadow: 0 4px 15px rgba(17, 199, 111, 0.4), 0 2px 6px rgba(17, 199, 111, 0.2); }',
      '50% { box-shadow: 0 4px 25px rgba(17, 199, 111, 0.6), 0 2px 12px rgba(17, 199, 111, 0.35); }',
      '100% { box-shadow: 0 4px 15px rgba(17, 199, 111, 0.4), 0 2px 6px rgba(17, 199, 111, 0.2); }',
    '}',
    
    '#picpay-exit-modal .pem-cta-primary.pem-pulse {',
      'animation: pem-pulse 2s ease-in-out infinite;',
    '}',
    
    '/* RESPONSIVO - TABLET */',
    '@media (max-width: 900px) {',
      '#picpay-exit-modal .pem-container { max-width: 720px; }',
      '#picpay-exit-modal .pem-col-content { padding: 28px 32px; }',
      '#picpay-exit-modal .pem-col-image { min-height: 400px; }',
    '}',
    
    '/* RESPONSIVO - MOBILE */',
    '@media (max-width: 680px) {',
      '#picpay-exit-modal .pem-container {',
        'grid-template-columns: 1fr;',
        'max-width: 100%;',
        'max-height: 95vh;',
        'border-radius: var(--pem-radius) var(--pem-radius) 0 0;',
        'position: fixed;',
        'bottom: 0;',
        'left: 0;',
        'right: 0;',
        'transform: translateY(100%);',
      '}',
      '#picpay-exit-modal.pem-active .pem-container { transform: translateY(0); }',
      '#picpay-exit-modal .pem-col-image { min-height: 140px; max-height: 140px; order: -1; }',
      '#picpay-exit-modal .pem-image-badge { bottom: 12px; left: 16px; padding: 8px 14px; }',
      '#picpay-exit-modal .pem-image-badge img { height: 18px; }',
      '#picpay-exit-modal .pem-col-content { padding: 24px 20px; overflow-y: auto; max-height: calc(95vh - 140px); }',
      '#picpay-exit-modal .pem-header { margin-bottom: 12px; }',
      '#picpay-exit-modal .pem-card-icon { width: 38px; height: 38px; border-radius: 10px; }',
      '#picpay-exit-modal .pem-card-icon svg { width: 18px; height: 18px; }',
      '#picpay-exit-modal .pem-title { font-size: 22px; }',
      '#picpay-exit-modal .pem-subtitle { font-size: 14px; margin-bottom: 20px; }',
      '#picpay-exit-modal .pem-feature { padding: 12px 0; gap: 12px; }',
      '#picpay-exit-modal .pem-feature-icon { width: 38px; height: 38px; border-radius: 10px; }',
      '#picpay-exit-modal .pem-feature-icon svg { width: 18px; height: 18px; }',
      '#picpay-exit-modal .pem-feature-text span { font-size: 14px; }',
      '#picpay-exit-modal .pem-feature-sub { font-size: 12px !important; }',
      '#picpay-exit-modal .pem-features { margin-bottom: 20px; }',
      '#picpay-exit-modal .pem-cta-primary { padding: 14px 24px; font-size: 15px; }',
      '#picpay-exit-modal .pem-cta-wrapper { margin-bottom: 16px; }',
    '}',
    
    '/* Mobile pequeno */',
    '@media (max-width: 380px) {',
      '#picpay-exit-modal .pem-col-image { min-height: 100px; max-height: 100px; }',
      '#picpay-exit-modal .pem-col-content { padding: 20px 16px; max-height: calc(95vh - 100px); }',
      '#picpay-exit-modal .pem-header-title { gap: 10px; }',
      '#picpay-exit-modal .pem-title { font-size: 20px; }',
    '}'
  ].join(' ');

  // ============================================
  // MENSAGENS V3
  // ============================================
  
  var MESSAGES = {
    subtitle: {
      withCity: 'Milhares de pessoas em <span class="pem-city">{CITY}</span> já abriram suas contas e estão aproveitando todos esses benefícios:',
      withState: 'Milhares de pessoas em <span class="pem-city">{STATE}</span> já abriram suas contas e estão aproveitando todos esses benefícios:',
      fallback: 'Milhões de brasileiros já abriram suas contas e estão aproveitando todos esses benefícios:'
    }
  };

  // ============================================
  // CLASSE PRINCIPAL V3
  // ============================================
  
  function PicPayExitModal() {
    this.isEnabled = false;
    this.isShown = false;
    this.geoData = null;
    this.modal = null;
    this._showOnReturn = false;
  }
  
  PicPayExitModal.prototype.init = function() {
    var self = this;
    
    if (this.hasBeenShown()) {
      console.log('[PicPay Exit Modal V3] Modal já foi exibido nesta sessão');
      return;
    }
    
    this.injectStyles();
    this.injectModal();
    this.fetchGeolocation();
    
    setTimeout(function() {
      self.enableDetection();
    }, CONFIG.modal.delayBeforeEnable);
  };
  
  PicPayExitModal.prototype.injectStyles = function() {
    var style = document.createElement('style');
    style.id = 'picpay-exit-modal-styles-v3';
    style.textContent = MODAL_STYLES;
    document.head.appendChild(style);
  };
  
  PicPayExitModal.prototype.injectModal = function() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = MODAL_TEMPLATE;
    this.modal = wrapper.firstChild;
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  };
  
  PicPayExitModal.prototype.setupEventListeners = function() {
    var self = this;
    
    var closeBtn = document.getElementById('pem-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        self.hideModal('close_button');
      });
    }
    
    var backdrop = this.modal.querySelector('.pem-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', function() {
        self.hideModal('backdrop_click');
      });
    }
    
    var secondaryBtn = document.getElementById('pem-cta-secondary');
    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', function() {
        self.hideModal('secondary_cta');
      });
    }
    
    var primaryBtn = document.getElementById('pem-cta-primary');
    if (primaryBtn) {
      primaryBtn.addEventListener('click', function() {
        var location = (self.geoData && self.geoData.city) || (self.geoData && self.geoData.state) || 'fallback';
        self.trackEvent('cta_click', { location: location });
      });
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self.isShown) {
        self.hideModal('escape_key');
      }
    });
  };
  
  PicPayExitModal.prototype.fetchGeolocation = function() {
    var self = this;
    var apiIndex = 0;
    
    function tryNextApi() {
      if (apiIndex >= CONFIG.geoApis.length) {
        return;
      }
      
      var api = CONFIG.geoApis[apiIndex];
      apiIndex++;
      
      var xhr = new XMLHttpRequest();
      xhr.open('GET', api.url, true);
      xhr.timeout = 3000;
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            
            var countryCode = data[api.countryField];
            if (countryCode && countryCode.toUpperCase() !== 'BR') {
              tryNextApi();
              return;
            }
            
            var city = data[api.cityField];
            var state = data[api.stateField];
            
            if (city || state) {
              self.geoData = {
                city: self.sanitizeLocation(city),
                state: self.sanitizeLocation(state),
                source: api.name
              };
              
              console.log('[PicPay Exit Modal V3] Geo detectado:', self.geoData);
              return;
            }
          } catch (e) {
            console.warn('[PicPay Exit Modal V3] Erro parsing JSON:', e);
          }
        }
        tryNextApi();
      };
      
      xhr.onerror = function() {
        console.warn('[PicPay Exit Modal V3] Falha na API ' + api.name);
        tryNextApi();
      };
      
      xhr.ontimeout = function() {
        console.warn('[PicPay Exit Modal V3] Timeout na API ' + api.name);
        tryNextApi();
      };
      
      xhr.send();
    }
    
    tryNextApi();
  };
  
  PicPayExitModal.prototype.sanitizeLocation = function(location) {
    if (!location || typeof location !== 'string') return null;
    
    location = location.trim().replace(/[<>"'&]/g, '');
    
    var lowerWords = ['de', 'da', 'do', 'das', 'dos', 'e'];
    var words = location.toLowerCase().split(' ');
    var result = [];
    
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      if (i > 0 && lowerWords.indexOf(word) !== -1) {
        result.push(word);
      } else {
        result.push(word.charAt(0).toUpperCase() + word.slice(1));
      }
    }
    
    location = result.join(' ');
    return location.length >= 2 ? location : null;
  };
  
  PicPayExitModal.prototype.truncateLocation = function(location, maxLength) {
    maxLength = maxLength || 20;
    if (!location) return '';
    return location.length > maxLength 
      ? location.substring(0, maxLength - 3) + '...' 
      : location;
  };
  
  PicPayExitModal.prototype.enableDetection = function() {
    var self = this;
    this.isEnabled = true;
    
    // Mouse leave
    document.addEventListener('mouseout', function(e) {
      if (!self.isEnabled || self.isShown) return;
      if (e.clientY <= 0 && e.relatedTarget === null) {
        self.showModal('mouse_leave');
      }
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', function() {
      if (!self.isEnabled || self.isShown) return;
      
      if (document.visibilityState === 'hidden') {
        setTimeout(function() {
          if (document.visibilityState === 'hidden') {
            self._showOnReturn = true;
          }
        }, 500);
      } else if (self._showOnReturn) {
        self._showOnReturn = false;
        self.showModal('tab_return');
      }
    });
    
    // Back button
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function() {
      if (!self.isEnabled || self.isShown) return;
      window.history.pushState(null, '', window.location.href);
      self.showModal('back_button');
    });
    
    console.log('[PicPay Exit Modal V3] Detecção ativada');
  };
  
  PicPayExitModal.prototype.showModal = function(trigger) {
    var self = this;
    trigger = trigger || 'unknown';
    
    if (this.isShown || !this.isEnabled) return;
    
    this.isShown = true;
    this.isEnabled = false;
    
    this.updateModalText();
    
    this.modal.classList.add('pem-active');
    document.body.style.overflow = 'hidden';
    
    this.setShownCookie();
    
    var location = (this.geoData && this.geoData.city) || (this.geoData && this.geoData.state) || 'fallback';
    var geoSource = (this.geoData && this.geoData.source) || 'none';
    
    this.trackEvent('modal_show', {
      trigger: trigger,
      location: location,
      geo_source: geoSource
    });
    
    // Pulse animation
    setTimeout(function() {
      var cta = document.getElementById('pem-cta-primary');
      if (cta) cta.classList.add('pem-pulse');
    }, 1000);
    
    // Shake
    setTimeout(function() {
      var cta = document.getElementById('pem-cta-primary');
      if (cta) {
        cta.classList.remove('pem-pulse');
        cta.classList.add('pem-shake');
        setTimeout(function() {
          cta.classList.remove('pem-shake');
        }, 500);
      }
    }, 4000);
    
    console.log('[PicPay Exit Modal V3] Modal exibido:', trigger);
  };
  
  PicPayExitModal.prototype.updateModalText = function() {
    var subtitleElement = document.getElementById('pem-subtitle');
    
    if (subtitleElement) {
      var subtitle;
      if (this.geoData && this.geoData.city) {
        subtitle = MESSAGES.subtitle.withCity.replace(/{CITY}/g, this.truncateLocation(this.geoData.city));
      } else if (this.geoData && this.geoData.state) {
        subtitle = MESSAGES.subtitle.withState.replace(/{STATE}/g, this.truncateLocation(this.geoData.state));
      } else {
        subtitle = MESSAGES.subtitle.fallback;
      }
      subtitleElement.innerHTML = subtitle;
    }
  };
  
  PicPayExitModal.prototype.hideModal = function(reason) {
    reason = reason || 'unknown';
    
    if (!this.isShown) return;
    
    this.modal.classList.remove('pem-active');
    document.body.style.overflow = '';
    
    var cta = document.getElementById('pem-cta-primary');
    if (cta) {
      cta.classList.remove('pem-pulse');
      cta.classList.remove('pem-shake');
    }
    
    this.trackEvent('modal_close', { reason: reason });
    
    console.log('[PicPay Exit Modal V3] Modal fechado:', reason);
  };
  
  PicPayExitModal.prototype.hasBeenShown = function() {
    if (!CONFIG.modal.showOnce) return false;
    return document.cookie.indexOf(CONFIG.modal.cookieName + '=true') !== -1 ||
           sessionStorage.getItem(CONFIG.modal.cookieName) === 'true';
  };
  
  PicPayExitModal.prototype.setShownCookie = function() {
    sessionStorage.setItem(CONFIG.modal.cookieName, 'true');
    var expires = new Date();
    expires.setDate(expires.getDate() + CONFIG.modal.cookieExpiry);
    document.cookie = CONFIG.modal.cookieName + '=true;expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
  };
  
  PicPayExitModal.prototype.trackEvent = function(eventName, data) {
    data = data || {};
    
    try {
      if (window.adobe && window.adobe.target && window.adobe.target.trackEvent) {
        var params = { event: eventName };
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            params[key] = data[key];
          }
        }
        window.adobe.target.trackEvent({
          mbox: CONFIG.tracking.mboxName,
          params: params
        });
      }
      
      if (window.dataLayer) {
        window.dataLayer.push({
          event: CONFIG.tracking.eventPrefix + '_' + eventName,
          eventData: data
        });
      }
      
      console.log('[PicPay Exit Modal V3] Track:', eventName, data);
    } catch (error) {
      console.warn('[PicPay Exit Modal V3] Erro tracking:', error);
    }
  };

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  
  function initModal() {
    var modal = new PicPayExitModal();
    modal.init();
    window.PicPayExitModal = modal;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
  } else {
    initModal();
  }

})();
