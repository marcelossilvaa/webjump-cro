(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_EXPERIENCE_AIC_CARTAO_PERFIL';
  const STYLE_ID = 'at-aic-cartao-perfil-style';
  const COMPONENT_ID = 'at-cartao-perfil';
  const DATA_HIDDEN = 'data-at-aic-hidden';
  const DATA_VIEW = 'data-at-aic-view';
  const DATA_LISTENER = 'data-at-aic-listener';
  const DATA_NEUTRALIZED = 'data-at-aic-neutralized';
  const CONTEXT = 'lp_ofertas_itau';
  const IMG_SKYLINE = 'cartao-skyline';
  const IMG_PLATINUM = 'carta-platinum';
  const IMG_BANDEIRA = 'lp-de-ofertas/2026/17-08/botao.png';
  const CARD_CTA = {
    skyline:
      'https://www.itau.com.br/cartoes/escolha/g/azul-mastercard-skyline?s_afili=afiliados_az_af_click-site_banner_lf_niverfaic_aic_n_ctr_bnr_lp_sky&utm_source=azul&utm_medium=ctr&utm_campaign=az_af_click-site_banner_lf_niverfaic_aic&utm_term=niverfaic_sky',
    mastercardPlatinum:
      'https://www.itau.com.br/cartoes/escolha/g/azul-mastercard-platinum?s_afili=afiliados_az_af_click-site_banner_lf_niverfaic_aic_n_ctr_bnr_lp_mp&utm_source=azul&utm_medium=ctr&utm_campaign=az_af_click-site_banner_lf_niverfaic_aic&utm_term=niverfaic_mp',
    visaInfinite:
      'https://www.itau.com.br/cartoes/escolha/g/azul-visa-infinite?s_afili=afiliados_az_af_click-site_banner_lf_niverfaic_aic_n_ctr_bnr_lp_inf&utm_source=azul&utm_medium=ctr&utm_campaign=az_af_click-site_banner_lf_niverfaic_aic&utm_term=niverfaic_inf',
    visaPlatinum:
      'https://www.itau.com.br/cartoes/escolha/g/azul-visa-platinum?s_afili=afiliados_az_af_click-site_banner_lf_niverfaic_aic_n_ctr_bnr_lp_vplat&utm_source=azul&utm_medium=ctr&utm_campaign=az_af_click-site_banner_lf_niverfaic_aic&utm_term=niverfaic_vplat',
  };

  const TARGET_URLS = ['ofertas/azul-itau-teste', 'ofertas/azul-itau'];

  let isProcessing = false;
  let debounceTimer = null;
  let observerStarted = false;

  if (window[EXPERIMENT_NAME] && document.getElementById(COMPONENT_ID)) {
    return;
  }
  window[EXPERIMENT_NAME] = true;

  function onTargetPage() {
    const path = window.location.pathname || '';
    for (let i = 0; i < TARGET_URLS.length; i++) {
      if (path.indexOf(TARGET_URLS[i]) !== -1) return true;
    }
    return false;
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[AT AIC] Parametro ausente para evento analytics.');
      return;
    }

    const type = eventType || 'click';
    const labelEvent = EXPERIMENT_NAME + '_' + type + ' ' + eventLabel;
    console.log('[AT AIC] Analytics event disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = CONTEXT;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getCss() {
    return [
      '.atCartaoPerfil,.atCartaoPerfil *{',
      '  font-family:"Helvetica Neue",Arial,sans-serif;',
      '  box-sizing:border-box;',
      '  line-height:normal;',
      '}',
      '.atCartaoPerfil img{width:unset;}',
      '.atCartaoPerfil{',
      '  margin-left:30px;',
      '  margin-right:30px;',
      '}',
      '.atCartaoPerfil__controlador{',
      '  background:#F3F4F6;',
      '  border-radius:14px;',
      '  display:flex;',
      '  gap:8px;',
      '  padding:6px;',
      '  max-width:500px;',
      '  margin:0 auto;',
      '}',
      '.atCartaoPerfil__controlador__button{',
      '  padding:9px 14px;',
      '  border-radius:10px;',
      '  flex:1;',
      '  border:none;',
      '  background-color:transparent;',
      '  cursor:pointer;',
      '  transition:background-color ease-in-out .3s;',
      '}',
      '.atCartaoPerfil__controlador__button.--ativo{background-color:#FFFFFF !important;}',
      '.atCartaoPerfil__controlador__button:hover{background-color:rgba(249,249,249,0.722);}',
      '.atCartaoPerfil__opcoes{margin-top:24px;}',
      '.atCartaoPerfil__opcao{display:none;}',
      '.atCartaoPerfil__opcao.--ativo{',
      '  display:flex;',
      '  gap:24px;',
      '  flex-wrap:wrap;',
      '  justify-content:center;',
      '}',
      '.atCartaoPerfil__cartao{',
      '  width:100%;',
      '  max-width:397px;',
      '  background:linear-gradient(15.03deg, #041E42 2.45%, #131F3D 98.85%);',
      '  padding:50px 24px 12px 24px;',
      '  border-radius:16px;',
      '  display:flex;',
      '  flex-direction:column;',
      '  box-sizing:border-box;',
      '}',
      '.atCartaoPerfil__cartao:last-child{',
      '  background:#FFFFFF;',
      '  border:1px solid #0B1E40;',
      '}',
      '.atCartaoPerfil__cartao img{',
      '  margin-bottom:42px;',
      '  margin-left:auto;',
      '  margin-right:auto;',
      '}',
      '.atCartaoPerfil__cartao__titulo{',
      '  font-weight:700;',
      '  font-size:24px;',
      '  color:#FFFFFF;',
      '  margin-bottom:16px;',
      '  margin-top:0;',
      '}',
      '.atCartaoPerfil__cartao:last-child .atCartaoPerfil__cartao__titulo{color:#041E42;}',
      '.atCartaoPerfil__cartao__enfase{',
      '  font-weight:400;',
      '  font-size:16px;',
      '  color:#FFFFFFCC;',
      '  margin:0;',
      '}',
      '.atCartaoPerfil__cartao:last-child .atCartaoPerfil__cartao__enfase{color:#6A7282;}',
      '.atCartaoPerfil__cartao__lista{',
      '  list-style-type:none;',
      '  margin:16px 0 0;',
      '  padding:0;',
      '}',
      '.atCartaoPerfil__cartao__lista li{',
      '  display:flex;',
      '  align-items:center;',
      '  margin-bottom:16px;',
      '  font-size:16px;',
      '  color:#FFFFFF;',
      '  gap:16px;',
      '}',
      ".atCartaoPerfil__cartao__lista li::before{content:url('data:image/svg+xml,<svg width=\"14\" height=\"10\" viewBox=\"0 0 14 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.6947 0.292787C13.8822 0.480314 13.9875 0.734622 13.9875 0.999786C13.9875 1.26495 13.8822 1.51926 13.6947 1.70679L5.69471 9.70679C5.50718 9.89426 5.25288 9.99957 4.98771 9.99957C4.72255 9.99957 4.46824 9.89426 4.28071 9.70679L0.280712 5.70679C0.0985537 5.51818 -0.00224062 5.26558 3.78026e-05 5.00339C0.00231622 4.74119 0.107485 4.49038 0.292893 4.30497C0.478301 4.11956 0.729114 4.01439 0.99131 4.01211C1.25351 4.00983 1.50611 4.11063 1.69471 4.29279L4.98771 7.58579L12.2807 0.292787C12.4682 0.105316 12.7225 0 12.9877 0C13.2529 0 13.5072 0.105316 13.6947 0.292787Z\" fill=\"%23026CB6\"/></svg>');}",
      ".atCartaoPerfil__cartao:last-child li::before{content:url('data:image/svg+xml,<svg width=\"14\" height=\"10\" viewBox=\"0 0 14 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.6947 0.292787C13.8822 0.480314 13.9875 0.734622 13.9875 0.999786C13.9875 1.26495 13.8822 1.51926 13.6947 1.70679L5.69471 9.70679C5.50718 9.89426 5.25288 9.99957 4.98771 9.99957C4.72255 9.99957 4.46824 9.89426 4.28071 9.70679L0.280712 5.70679C0.0985537 5.51818 -0.00224062 5.26558 3.78026e-05 5.00339C0.00231622 4.74119 0.107485 4.49038 0.292893 4.30497C0.478301 4.11956 0.729114 4.01439 0.99131 4.01211C1.25351 4.00983 1.50611 4.11063 1.69471 4.29279L4.98771 7.58579L12.2807 0.292787C12.4682 0.105316 12.7225 0 12.9877 0C13.2529 0 13.5072 0.105316 13.6947 0.292787Z\" fill=\"%2300C950\"/></svg>');}",
      '.atCartaoPerfil__cartao:last-child .atCartaoPerfil__cartao__lista li{color:#041E42;}',
      '.atCartaoPerfil__cartao:last-child .atCartaoPerfil__cartao__ctaPedir{background:#041E42;color:#FFFFFF;}',
      '.atCartaoPerfil__cartao:last-child .atCartaoPerfil__cartao__ctaDetalhes{border:2px solid #041E42;}',
      '.atCartaoPerfil__cartao__ctaPedir,.atCartaoPerfil__cartao__ctaDetalhes{',
      '  background-color:#FFFFFF;',
      '  cursor:pointer;',
      '  min-height:48px;',
      '  width:100%;',
      '  display:flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  padding:10px 16px;',
      '  color:#041E42;',
      '  font-weight:700;',
      '  font-size:20px;',
      '  margin-bottom:16px;',
      '  box-sizing:border-box;',
      '  text-align:center;',
      '  text-decoration:none;',
      '  border-radius:8px;',
      '}',
      '[' + DATA_HIDDEN + '="true"]{display:none !important;}',
      'img[src*="' + IMG_BANDEIRA + '"],img[srcset*="' + IMG_BANDEIRA + '"]{display:none !important;}',
      'button:has(img[src*="' + IMG_BANDEIRA + '"]),button:has(img[srcset*="' + IMG_BANDEIRA + '"]){display:none !important;}',
    ].join('');
  }

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = getCss();
  }

  function findByFragment(fragment) {
    return document.querySelector(
      'img[src*="' +
        fragment +
        '"],img[srcset*="' +
        fragment +
        '"],source[srcset*="' +
        fragment +
        '"]'
    );
  }

  function findCardsWrapper() {
    const skyline = findByFragment(IMG_SKYLINE);
    const platinum = findByFragment(IMG_PLATINUM);
    if (!skyline || !platinum) return null;

    let node = skyline.parentElement;
    let hops = 0;
    while (node && hops < 20) {
      if (node === document.body || node === document.documentElement) break;
      if (node.contains(platinum)) return node;
      node = node.parentElement;
      hops++;
    }
    return null;
  }

  function hideOriginal(wrapper) {
    if (!wrapper) return;
    wrapper.setAttribute(DATA_HIDDEN, 'true');
    wrapper.style.setProperty('display', 'none', 'important');
  }

  function neutralizeButton(button) {
    if (!button || button.getAttribute(DATA_NEUTRALIZED) === 'true') return;
    button.setAttribute(DATA_NEUTRALIZED, 'true');
    button.addEventListener(
      'click',
      function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true
    );
  }

  function hideBandeiraImage() {
    const nodes = document.querySelectorAll(
      'img[src*="' +
        IMG_BANDEIRA +
        '"],img[srcset*="' +
        IMG_BANDEIRA +
        '"],source[srcset*="' +
        IMG_BANDEIRA +
        '"]'
    );
    if (!nodes.length) return false;

    for (let i = 0; i < nodes.length; i++) {
      const img = nodes[i];
      const button = img.closest ? img.closest('button') : img.parentElement;
      if (button) neutralizeButton(button);
      const wrap = button && button.parentElement ? button.parentElement : img.parentElement;
      hideOriginal(wrap || button || img);
    }
    return true;
  }

  function getSectionHtml() {
    return (
      '<div class="atCartaoPerfil__controlador">' +
      '<button type="button" class="atCartaoPerfil__controlador__button --ativo" aria-label="Bandeira Mastercard" data-ativacao="opcao-cartao-mastercard">' +
      '<img src="https://i.imgur.com/S5PsTSn.png" alt="" width="37" height="21">' +
      '</button>' +
      '<button type="button" class="atCartaoPerfil__controlador__button" aria-label="Bandeira Visa" data-ativacao="opcao-cartao-visa">' +
      '<img src="https://i.imgur.com/R8nhAm7.png" alt="" width="37" height="12">' +
      '</button>' +
      '</div>' +
      '<div class="atCartaoPerfil__opcoes">' +
      '<div class="atCartaoPerfil__opcao --ativo" id="opcao-cartao-mastercard">' +
      '<article class="atCartaoPerfil__cartao" aria-label="Cartao Azul Itau Mastercard Skyline">' +
      '<img src="https://i.imgur.com/XK2kqoX.png" alt="" width="154" height="241">' +
      '<h3 class="atCartaoPerfil__cartao__titulo">Azul Itaú Mastercard Skyline</h3>' +
      '<p class="atCartaoPerfil__cartao__enfase">Tenha os mesmos benefícios de um <b>cartão Black.</b></p>' +
      '<ul class="atCartaoPerfil__cartao__lista">' +
      '<li>Até 3,5 pontos por US$ 1 gasto</li>' +
      '<li>Acompanhante grátis e Salas VIP</li>' +
      '<li>Bagagens despachadas grátis</li>' +
      '</ul>' +
      '<a href="' +
      CARD_CTA.skyline +
      '" target="_blank" rel="noopener noreferrer" class="atCartaoPerfil__cartao__ctaPedir" data-cartao="mastercard-skyline">Pedir cartão</a>' +
      '<a href="#" class="atCartaoPerfil__cartao__ctaDetalhes" data-cartao="mastercard-skyline">Conferir detalhes</a>' +
      '</article>' +
      '<article class="atCartaoPerfil__cartao" aria-label="Cartao Azul Itau Mastercard Platinum">' +
      '<img src="https://i.imgur.com/pQDzTeV.png" alt="" width="154" height="242">' +
      '<h3 class="atCartaoPerfil__cartao__titulo">Azul Itaú Mastercard Platinum</h3>' +
      '<p class="atCartaoPerfil__cartao__enfase">O equilíbrio perfeito entre custo e benefícios em viagens.</p>' +
      '<ul class="atCartaoPerfil__cartao__lista">' +
      '<li>Até 2,6 pontos por US$ 1 gasto</li>' +
      '<li>2 bagagens gratuitas</li>' +
      '<li>Nível Safira no Azul Fidelidade</li>' +
      '</ul>' +
      '<a href="' +
      CARD_CTA.mastercardPlatinum +
      '" target="_blank" rel="noopener noreferrer" class="atCartaoPerfil__cartao__ctaPedir" data-cartao="mastercard-platinum">Pedir cartão</a>' +
      '<a href="#" class="atCartaoPerfil__cartao__ctaDetalhes" data-cartao="mastercard-platinum">Conferir detalhes</a>' +
      '</article>' +
      '</div>' +
      '<div class="atCartaoPerfil__opcao" id="opcao-cartao-visa">' +
      '<article class="atCartaoPerfil__cartao" aria-label="Cartao Azul Itau Visa Infinite">' +
      '<img src="https://i.imgur.com/2rHjaYf.png" alt="" width="154" height="241">' +
      '<h3 class="atCartaoPerfil__cartao__titulo">Azul Itaú Visa Infinite</h3>' +
      '<p class="atCartaoPerfil__cartao__enfase">A experiência premium completa para quem viaja o mundo.</p>' +
      '<ul class="atCartaoPerfil__cartao__lista">' +
      '<li>Até 3,5 pontos por US$ 1 gasto</li>' +
      '<li>Acompanhante grátis e Salas VIP</li>' +
      '<li>Bagagens despachadas grátis</li>' +
      '</ul>' +
      '<a href="' +
      CARD_CTA.visaInfinite +
      '" target="_blank" rel="noopener noreferrer" class="atCartaoPerfil__cartao__ctaPedir" data-cartao="visa-infinite">Pedir cartão</a>' +
      '<a href="#" class="atCartaoPerfil__cartao__ctaDetalhes" data-cartao="visa-infinite">Conferir detalhes</a>' +
      '</article>' +
      '<article class="atCartaoPerfil__cartao" aria-label="Cartao Azul Itau Visa Platinum">' +
      '<img src="https://i.imgur.com/5y3NJtN.png" alt="" width="154" height="242">' +
      '<h3 class="atCartaoPerfil__cartao__titulo">Azul Itaú Visa Platinum</h3>' +
      '<p class="atCartaoPerfil__cartao__enfase">O equilíbrio perfeito entre custo e benefícios em viagens.</p>' +
      '<ul class="atCartaoPerfil__cartao__lista">' +
      '<li>Até 2,6 pontos por US$ 1 gasto</li>' +
      '<li>2 bagagens gratuitas</li>' +
      '<li>Nível Safira no Azul Fidelidade</li>' +
      '</ul>' +
      '<a href="' +
      CARD_CTA.visaPlatinum +
      '" target="_blank" rel="noopener noreferrer" class="atCartaoPerfil__cartao__ctaPedir" data-cartao="visa-platinum">Pedir cartão</a>' +
      '<a href="#" class="atCartaoPerfil__cartao__ctaDetalhes" data-cartao="visa-platinum">Conferir detalhes</a>' +
      '</article>' +
      '</div>' +
      '</div>'
    );
  }

  function createSection() {
    const section = document.createElement('section');
    section.id = COMPONENT_ID;
    section.className = 'atCartaoPerfil';
    section.setAttribute('aria-label', 'Escolha o cartao ideal para o seu perfil');
    section.innerHTML = getSectionHtml();
    return section;
  }

  function scrollToDetalhesSection() {
    const headings = document.querySelectorAll('h1,h2');
    for (let i = 0; i < headings.length; i++) {
      const text = (headings[i].textContent || '').toLowerCase();
      if (text.indexOf('conheça todos os detalhes') !== -1 || text.indexOf('conheca todos os detalhes') !== -1) {
        headings[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    console.log('[AT AIC] Titulo de detalhes nao encontrado para scroll.');
  }

  function bindBandeira(section) {
    const buttons = section.querySelectorAll('.atCartaoPerfil__controlador__button');
    const opcoes = section.querySelectorAll('.atCartaoPerfil__opcao');

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (button.getAttribute(DATA_LISTENER) === 'true') continue;
      button.setAttribute(DATA_LISTENER, 'true');
      button.addEventListener('click', function (event) {
        event.preventDefault();
        if (button.classList.contains('--ativo')) return;

        analyticsEvent('bandeira_' + (button.getAttribute('data-ativacao') || ''), 'click');

        for (let b = 0; b < buttons.length; b++) {
          buttons[b].classList.remove('--ativo');
        }
        for (let o = 0; o < opcoes.length; o++) {
          opcoes[o].classList.remove('--ativo');
        }

        button.classList.add('--ativo');
        const targetId = button.getAttribute('data-ativacao');
        const targetOpcao = targetId ? document.getElementById(targetId) : null;
        if (targetOpcao) targetOpcao.classList.add('--ativo');
      });
    }
  }

  function bindCtas(section) {
    const ctasPedir = section.querySelectorAll('.atCartaoPerfil__cartao__ctaPedir');
    const ctasDetalhes = section.querySelectorAll('.atCartaoPerfil__cartao__ctaDetalhes');

    for (let i = 0; i < ctasPedir.length; i++) {
      const cta = ctasPedir[i];
      if (cta.getAttribute(DATA_LISTENER) === 'true') continue;
      cta.setAttribute(DATA_LISTENER, 'true');
      cta.addEventListener('click', function () {
        analyticsEvent('pedir_cartao_' + (cta.getAttribute('data-cartao') || ''), 'click');
      });
    }

    for (let d = 0; d < ctasDetalhes.length; d++) {
      const cta = ctasDetalhes[d];
      if (cta.getAttribute(DATA_LISTENER) === 'true') continue;
      cta.setAttribute(DATA_LISTENER, 'true');
      cta.addEventListener('click', function (event) {
        event.preventDefault();
        analyticsEvent('detalhes_cartao_' + (cta.getAttribute('data-cartao') || ''), 'click');
        scrollToDetalhesSection();
      });
    }
  }

  function trackViewOnce(section) {
    if (!section || section.getAttribute(DATA_VIEW) === 'true') return;
    section.setAttribute(DATA_VIEW, 'true');
    analyticsEvent('componente_visivel', 'view');
  }

  function injectExperience() {
    hideBandeiraImage();

    const existing = document.getElementById(COMPONENT_ID);
    const wrapper = findCardsWrapper();

    if (existing && document.body.contains(existing)) {
      if (wrapper) hideOriginal(wrapper);
      bindBandeira(existing);
      bindCtas(existing);
      trackViewOnce(existing);
      return true;
    }

    if (!wrapper || !wrapper.parentNode) return false;

    injectStyles();
    hideOriginal(wrapper);
    hideBandeiraImage();

    const section = createSection();
    wrapper.insertAdjacentElement('afterend', section);
    bindBandeira(section);
    bindCtas(section);
    trackViewOnce(section);
    console.log('[AT AIC] Componente injetado no lugar dos cards Skyline/Platinum.');
    return true;
  }

  function run() {
    if (isProcessing) return;
    if (!onTargetPage()) return;

    isProcessing = true;
    try {
      injectExperience();
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      run();
    }, 300);
  }

  function startObserver() {
    if (observerStarted || window._atAicCartaoObserver) return;
    if (!document.body) return;

    const observer = new MutationObserver(function (mutations) {
      if (isProcessing) return;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (!mutation.addedNodes || !mutation.addedNodes.length) continue;
        let skip = true;
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (node.id === COMPONENT_ID || (node.closest && node.closest('#' + COMPONENT_ID))) {
            continue;
          }
          skip = false;
          break;
        }
        if (skip) continue;
        scheduleRun();
        return;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._atAicCartaoObserver = observer;
    observerStarted = true;
  }

  function init() {
    if (!onTargetPage()) {
      console.log('[AT AIC] Fora da LP de ofertas Itaú.');
      return;
    }
    injectStyles();
    run();
    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
