(function () {
  'use strict';

  // ===========================================
  // Modal de Ofertas TIM - Mes do Consumidor
  // ===========================================

  var STYLE_ID = 'tim-modal-ofertas-style';
  var MODAL_ATTR = 'data-tim-modal-aplicado';

  // Evita duplicacao
  if (document.getElementById(STYLE_ID)) {
    console.log('[TIM Modal Ofertas] Estilo ja injetado, abortando.');
    return;
  }

  // ---- Injecao de estilos ----
  function injetarEstilos() {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Botao flutuante (modal fechado)
      '#tim-modal-trigger {',
      '  position: fixed;',
      '  bottom: 40px;',
      '  right: 40px;',
      '  z-index: 99999;',
      '  display: flex;',
      '  flex-direction: row;',
      '  justify-content: center;',
      '  align-items: center;',
      '  padding: 9px 17px;',
      '  gap: 10px;',
      '  width: 254px;',
      '  height: 42px;',
      '  background: #0027E2;',
      '  border-radius: 8px;',
      '  border: none;',
      '  cursor: pointer;',
      '  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));',
      '  font-family: Inter, Arial, sans-serif;',
      '  transition: opacity 0.3s ease;',
      '}',
      '#tim-modal-trigger:hover {',
      '  opacity: 0.92;',
      '}',
      '#tim-modal-trigger .tim-trigger-circle {',
      '  width: 24px;',
      '  height: 24px;',
      '  background: #FFFFFF;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '}',
      '#tim-modal-trigger .tim-trigger-circle svg {',
      '  width: 12px;',
      '  height: 12px;',
      '}',
      '#tim-modal-trigger .tim-trigger-text {',
      '  font-weight: 700;',
      '  font-size: 16px;',
      '  line-height: 20px;',
      '  text-align: center;',
      '  letter-spacing: -0.076px;',
      '  color: #FFFFFF;',
      '}',

      // Overlay
      '#tim-modal-overlay {',
      '  display: none;',
      '  position: fixed;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  background: rgba(0,0,0,0.35);',
      '  z-index: 100000;',
      '}',
      '#tim-modal-overlay.tim-modal-visivel {',
      '  display: block;',
      '}',

      // Container principal do modal
      '#tim-modal-container {',
      '  display: none;',
      '  position: fixed;',
      '  top: 50%;',
      '  right: 0;',
      '  transform: translateY(-50%) translateX(100%);',
      '  width: 392px;',
      '  max-height: 90vh;',
      '  background: #FFFFFF;',
      '  border: 1px solid #E3E3E3;',
      '  box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.16);',
      '  border-radius: 24px 0px 0px 24px;',
      '  z-index: 100001;',
      '  box-sizing: border-box;',
      '  flex-direction: column;',
      '  overflow: hidden;',
      '  transition: transform 0.35s ease;',
      '  font-family: Inter, Arial, sans-serif;',
      '}',
      '#tim-modal-container.tim-modal-visivel {',
      '  display: flex;',
      '  transform: translateY(-50%) translateX(0);',
      '}',

      // Header azul
      '.tim-modal-header {',
      '  position: relative;',
      '  width: 100%;',
      '  min-height: 135px;',
      '  background: #0026D9;',
      '  overflow: hidden;',
      '  flex-shrink: 0;',
      '}',
      '.tim-modal-header-content {',
      '  display: flex;',
      '  flex-direction: row;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  padding: 20px 20px 0;',
      '  position: relative;',
      '  z-index: 1;',
      '}',
      '.tim-modal-header-text {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 8px;',
      '}',
      '.tim-modal-header-subtitle {',
      '  font-weight: 500;',
      '  font-size: 12px;',
      '  line-height: 23px;',
      '  letter-spacing: -0.44px;',
      '  color: #FFFFFF;',
      '  margin: 0;',
      '}',
      '.tim-modal-header-title {',
      '  font-weight: 500;',
      '  font-size: 24px;',
      '  line-height: 23px;',
      '  letter-spacing: -0.44px;',
      '  color: #FFFFFF;',
      '  margin: 0;',
      '}',
      '.tim-modal-header-img {',
      '  position: absolute;',
      '  right: 0;',
      '  top: -9px;',
      '  width: 217px;',
      '  height: 144px;',
      '  object-fit: contain;',
      '  pointer-events: none;',
      '}',

      // Area scrollavel dos cards
      '.tim-modal-body {',
      '  display: flex;',
      '  flex-direction: column;',
      '  padding: 16px 16px 16px 16px;',
      '  gap: 12px;',
      '  overflow-y: auto;',
      '  flex: 1 1 auto;',
      '}',
      '.tim-modal-disclaimer-top {',
      '  font-weight: 400;',
      '  font-size: 11px;',
      '  line-height: 16px;',
      '  letter-spacing: 0.064px;',
      '  color: #888888;',
      '  margin: 0;',
      '}',

      // Card de plano
      '.tim-card {',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  flex-direction: column;',
      '  padding: 2px;',
      '  width: 100%;',
      '  background: rgba(255,255,255,0.00001);',
      '  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.08);',
      '  border-radius: 16px;',
      '  overflow: hidden;',
      '}',
      '.tim-card-top {',
      '  position: relative;',
      '  width: 100%;',
      '  height: 73px;',
      '  display: flex;',
      '  align-items: flex-start;',
      '  overflow: hidden;',
      '}',
      '.tim-card-top-info {',
      '  display: flex;',
      '  flex-direction: column;',
      '  padding: 7.5px 0 0 12px;',
      '  gap: 6px;',
      '  position: relative;',
      '  z-index: 1;',
      '}',
      '.tim-card-badge {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  padding: 2px 8px;',
      '  border-radius: 4px;',
      '  font-weight: 400;',
      '  font-size: 9px;',
      '  line-height: 14px;',
      '  letter-spacing: 0.707px;',
      '  color: #FFFFFF;',
      '}',
      '.tim-card-plan-name {',
      '  font-weight: 700;',
      '  font-size: 14px;',
      '  line-height: 21px;',
      '  letter-spacing: -0.15px;',
      '  color: #FFFFFF;',
      '  margin: 0;',
      '}',
      '.tim-card-top-right {',
      '  position: absolute;',
      '  right: 12px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  text-align: right;',
      '  z-index: 1;',
      '}',
      '.tim-card-data-amount {',
      '  font-weight: 900;',
      '  font-size: 22px;',
      '  line-height: 22px;',
      '  letter-spacing: -0.26px;',
      '  color: #FFFFFF;',
      '  margin: 0;',
      '}',
      '.tim-card-data-sub {',
      '  font-weight: 400;',
      '  font-size: 6px;',
      '  line-height: 14px;',
      '  letter-spacing: 0.167px;',
      '  color: rgba(255,255,255,0.8);',
      '  text-align: right;',
      '  margin: 0;',
      '}',

      // Parte inferior do card (preco + CTA)
      '.tim-card-bottom {',
      '  display: flex;',
      '  flex-direction: row;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  padding: 8px 12px;',
      '  background: #F9FAFB;',
      '}',
      '.tim-card-price-label {',
      '  font-weight: 400;',
      '  font-size: 10px;',
      '  line-height: 15px;',
      '  letter-spacing: 0.117px;',
      '  color: #555555;',
      '  margin: 0;',
      '}',
      '.tim-card-price {',
      '  font-weight: 900;',
      '  font-size: 18px;',
      '  line-height: 27px;',
      '  letter-spacing: -0.44px;',
      '  color: #003F88;',
      '  margin: 0;',
      '}',
      '.tim-card-cta {',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  padding: 6px 12px;',
      '  background: #E87722;',
      '  border-radius: 8px;',
      '  border: none;',
      '  cursor: pointer;',
      '  font-family: Inter, Arial, sans-serif;',
      '  font-weight: 700;',
      '  font-size: 11px;',
      '  line-height: 16px;',
      '  letter-spacing: 0.064px;',
      '  color: #FFFFFF;',
      '  text-decoration: none;',
      '}',
      '.tim-card-cta:hover {',
      '  opacity: 0.9;',
      '}',

      // Disclaimer inferior
      '.tim-modal-disclaimer-bottom {',
      '  font-weight: 400;',
      '  font-size: 9px;',
      '  line-height: 13px;',
      '  letter-spacing: 0.167px;',
      '  color: #AAAAAA;',
      '  margin: 0;',
      '}',

      // Footer
      '.tim-modal-footer {',
      '  display: flex;',
      '  flex-direction: row;',
      '  align-items: flex-start;',
      '  padding: 12px 16px 12px;',
      '  gap: 8px;',
      '  background: #FFFFFF;',
      '  border-top: 1px solid #EEEEEE;',
      '  flex-shrink: 0;',
      '}',
      '.tim-modal-btn-fechar {',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  padding: 8px 38px;',
      '  flex: 1;',
      '  height: 38px;',
      '  border: 1.5px solid #DDDDDD;',
      '  border-radius: 8px;',
      '  background: #FFFFFF;',
      '  cursor: pointer;',
      '  font-family: Inter, Arial, sans-serif;',
      '  font-weight: 500;',
      '  font-size: 13px;',
      '  line-height: 20px;',
      '  letter-spacing: -0.076px;',
      '  color: #555555;',
      '}',
      '.tim-modal-btn-fechar:hover {',
      '  background: #F5F5F5;',
      '}',
      '.tim-modal-btn-planos {',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  padding: 8px 16px;',
      '  flex: 1;',
      '  height: 38.5px;',
      '  border: 1px solid #0027E2;',
      '  border-radius: 8px;',
      '  background: #FFFFFF;',
      '  cursor: pointer;',
      '  font-family: Inter, Arial, sans-serif;',
      '  font-weight: 700;',
      '  font-size: 13px;',
      '  line-height: 20px;',
      '  letter-spacing: -0.076px;',
      '  color: #0027E2;',
      '  text-decoration: none;',
      '}',
      '.tim-modal-btn-planos:hover {',
      '  background: #F0F3FF;',
      '}',

      // Responsivo mobile
      '@media (max-width: 440px) {',
      '  #tim-modal-container {',
      '    width: 100%;',
      '    border-radius: 24px 24px 0 0;',
      '    top: auto;',
      '    bottom: 0;',
      '    right: 0;',
      '    transform: translateY(100%);',
      '    max-height: 85vh;',
      '  }',
      '  #tim-modal-container.tim-modal-visivel {',
      '    transform: translateY(0);',
      '  }',
      '  #tim-modal-trigger {',
      '    right: 16px;',
      '    bottom: 24px;',
      '    width: auto;',
      '    padding: 9px 14px;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---- Dados dos planos ----
  var planos = [
    {
      badge: 'MAIS VENDIDO',
      badgeColor: '#003F88',
      nome: 'TIM Controle',
      gradient: 'linear-gradient(180deg, #00B4D8 0%, #0077B6 100%)',
      amount: '39GB',
      sub: '+ WhatsApp Incluido',
      preco: 'R$ 64,99',
      periodo: '/mes'
    },
    {
      badge: 'CONDICAO ESPECIAL',
      badgeColor: '#E87722',
      nome: 'TIM Black',
      gradient: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
      amount: '60GB',
      sub: '+ Streaming incluido',
      preco: 'R$ 99,99',
      periodo: '/mes'
    },
    {
      badge: 'PATROCINADORA BBB 26',
      badgeColor: '#CC0000',
      nome: 'TIM Ultra Fibra',
      gradient: 'linear-gradient(180deg, #0036A3 0%, #001F6B 100%)',
      amount: '400 Mega',
      sub: 'No debito automatico',
      preco: 'R$ 59,99',
      periodo: '/mes'
    }
  ];

  // ---- Criacao de um card de plano ----
  function criarCard(plano) {
    var card = document.createElement('div');
    card.className = 'tim-card';

    // Topo do card (gradiente)
    var top = document.createElement('div');
    top.className = 'tim-card-top';
    top.style.setProperty('background', plano.gradient, 'important');

    var info = document.createElement('div');
    info.className = 'tim-card-top-info';

    var badge = document.createElement('span');
    badge.className = 'tim-card-badge';
    badge.style.setProperty('background', plano.badgeColor, 'important');
    badge.textContent = plano.badge;

    var nome = document.createElement('p');
    nome.className = 'tim-card-plan-name';
    nome.textContent = plano.nome;

    info.appendChild(badge);
    info.appendChild(nome);

    var direita = document.createElement('div');
    direita.className = 'tim-card-top-right';

    var amount = document.createElement('p');
    amount.className = 'tim-card-data-amount';
    amount.textContent = plano.amount;

    var sub = document.createElement('p');
    sub.className = 'tim-card-data-sub';
    sub.textContent = plano.sub;

    direita.appendChild(amount);
    direita.appendChild(sub);

    top.appendChild(info);
    top.appendChild(direita);

    // Parte inferior (preco + CTA)
    var bottom = document.createElement('div');
    bottom.className = 'tim-card-bottom';

    var precoWrapper = document.createElement('div');

    var precoLabel = document.createElement('p');
    precoLabel.className = 'tim-card-price-label';
    precoLabel.textContent = 'A partir de';

    var precoValor = document.createElement('p');
    precoValor.className = 'tim-card-price';
    precoValor.textContent = plano.preco + plano.periodo;

    precoWrapper.appendChild(precoLabel);
    precoWrapper.appendChild(precoValor);

    var cta = document.createElement('a');
    cta.className = 'tim-card-cta';
    cta.textContent = 'Contratar';
    cta.href = '#';
    cta.setAttribute('role', 'button');

    bottom.appendChild(precoWrapper);
    bottom.appendChild(cta);

    card.appendChild(top);
    card.appendChild(bottom);

    return card;
  }

  // ---- Criacao do botao flutuante (trigger) ----
  function criarTrigger() {
    var btn = document.createElement('button');
    btn.id = 'tim-modal-trigger';
    btn.setAttribute('aria-label', 'Abrir ofertas de planos');

    // Circulo branco com icone +
    var circle = document.createElement('span');
    circle.className = 'tim-trigger-circle';
    circle.innerHTML = '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M6 1V11M1 6H11" stroke="#0027E2" stroke-width="2" stroke-linecap="round"/>'
      + '</svg>';

    var texto = document.createElement('span');
    texto.className = 'tim-trigger-text';
    texto.textContent = 'Planos feitos para voce';

    btn.appendChild(circle);
    btn.appendChild(texto);

    return btn;
  }

  // ---- Criacao do modal completo ----
  function criarModal() {
    // Overlay
    var overlay = document.createElement('div');
    overlay.id = 'tim-modal-overlay';

    // Container principal
    var container = document.createElement('div');
    container.id = 'tim-modal-container';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-label', 'Ofertas especiais - Mes do consumidor');

    // -- Header --
    var header = document.createElement('div');
    header.className = 'tim-modal-header';

    var headerContent = document.createElement('div');
    headerContent.className = 'tim-modal-header-content';

    var headerTextWrap = document.createElement('div');
    headerTextWrap.className = 'tim-modal-header-text';

    var subtitulo = document.createElement('p');
    subtitulo.className = 'tim-modal-header-subtitle';
    subtitulo.textContent = 'Ofertas especiais';

    var titulo = document.createElement('h2');
    titulo.className = 'tim-modal-header-title';
    titulo.innerHTML = 'Mes do<br>consumidor';

    headerTextWrap.appendChild(subtitulo);
    headerTextWrap.appendChild(titulo);
    headerContent.appendChild(headerTextWrap);
    header.appendChild(headerContent);

    // Imagem do header (placeholder inline SVG representando a imagem promocional)
    var headerImg = document.createElement('img');
    headerImg.className = 'tim-modal-header-img';
    headerImg.alt = 'Promocao Mes do Consumidor';
    // Usando uma imagem placeholder. Substituir pelo URL real da imagem.
    headerImg.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="217" height="144" viewBox="0 0 217 144">'
      + '<rect width="217" height="144" fill="none"/>'
      + '<text x="108" y="72" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="14" font-family="Arial">Imagem Promo</text>'
      + '</svg>'
    );
    header.appendChild(headerImg);

    // -- Body (cards) --
    var body = document.createElement('div');
    body.className = 'tim-modal-body';

    var disclaimerTop = document.createElement('p');
    disclaimerTop.className = 'tim-modal-disclaimer-top';
    disclaimerTop.textContent = 'Ofertas exclusivas validas durante o mes de marco/2026 - Sujeito a disponibilidade de area';

    body.appendChild(disclaimerTop);

    // Gerar cards a partir dos dados
    for (var i = 0; i < planos.length; i++) {
      body.appendChild(criarCard(planos[i]));
    }

    var disclaimerBottom = document.createElement('p');
    disclaimerBottom.className = 'tim-modal-disclaimer-bottom';
    disclaimerBottom.textContent = '*Promocao valida de 01/03 a 31/03/2026. Condicoes sujeitas a alteracao sem aviso previo. Consulte disponibilidade em sua regiao. TIM S.A. CNPJ: 02.421.421/0001-11.';

    body.appendChild(disclaimerBottom);

    // -- Footer --
    var footer = document.createElement('div');
    footer.className = 'tim-modal-footer';

    var btnFechar = document.createElement('button');
    btnFechar.className = 'tim-modal-btn-fechar';
    btnFechar.textContent = 'Fechar';

    var btnPlanos = document.createElement('a');
    btnPlanos.className = 'tim-modal-btn-planos';
    btnPlanos.textContent = 'Ver todos os planos';
    btnPlanos.href = '#';

    footer.appendChild(btnFechar);
    footer.appendChild(btnPlanos);

    // Montar container
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    return { overlay: overlay, container: container, btnFechar: btnFechar };
  }

  // ---- Controle de abertura/fechamento ----
  function inicializar() {
    if (document.body.getAttribute(MODAL_ATTR)) {
      console.log('[TIM Modal Ofertas] Modal ja inicializado.');
      return;
    }
    document.body.setAttribute(MODAL_ATTR, 'true');

    injetarEstilos();

    var trigger = criarTrigger();
    var modal = criarModal();

    document.body.appendChild(trigger);
    document.body.appendChild(modal.overlay);
    document.body.appendChild(modal.container);

    var isAberto = false;

    function abrirModal() {
      if (isAberto) return;
      isAberto = true;
      trigger.style.setProperty('display', 'none', 'important');
      modal.overlay.classList.add('tim-modal-visivel');
      // Pequeno delay para garantir a animacao
      requestAnimationFrame(function () {
        modal.container.style.display = 'flex';
        requestAnimationFrame(function () {
          modal.container.classList.add('tim-modal-visivel');
        });
      });
      console.log('[TIM Modal Ofertas] Modal aberto.');
    }

    function fecharModal() {
      if (!isAberto) return;
      isAberto = false;
      modal.container.classList.remove('tim-modal-visivel');
      modal.overlay.classList.remove('tim-modal-visivel');
      // Esperar animacao antes de esconder
      setTimeout(function () {
        modal.container.style.display = 'none';
        trigger.style.setProperty('display', 'flex', 'important');
      }, 350);
      console.log('[TIM Modal Ofertas] Modal fechado.');
    }

    // Eventos
    trigger.addEventListener('click', abrirModal);
    modal.btnFechar.addEventListener('click', fecharModal);
    modal.overlay.addEventListener('click', fecharModal);

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isAberto) {
        fecharModal();
      }
    });

    console.log('[TIM Modal Ofertas] Componente inicializado com sucesso.');
  }

  // ---- Init com DOM ready ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();
