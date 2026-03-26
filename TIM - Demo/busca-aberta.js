(function () {
  'use strict';

  // ==============================================
  // Busca Sugestiva - Secao "Recomendado para voce"
  // ==============================================

  const STYLE_ID = 'at-tim-busca-sugestiva-style';
  const RECOMENDADO_ATTR = 'data-at-recomendado';
  const ANALYTICS_ATTR = 'data-analytics-added';
  const DEBOUNCE_MS = 200;
  const MAX_RETRIES = 30;
  const RETRY_INTERVAL = 500;

  let isProcessing = false;
  let debounceTimer = null;
  let retryCount = 0;
  let viewTracked = false;

  function getSearchComponent() {
    return document.querySelector('tim-search-input[input-id="search-menu-desktop"]');
  }

  function queryWithin(root, selector) {
    if (!root) return null;
    if (root.querySelector) return root.querySelector(selector);
    return null;
  }

  function getDropdown() {
    const selector = '.tim-search-input-dropdown-items[data-ic-section="sec-busca-sugestoes"]';

    // 1) Prioriza o dropdown associado ao input visivel (#search-menu-desktop)
    const input = document.getElementById('search-menu-desktop');
    if (input) {
      const container = input.closest('.tim-search-input-container') || input.parentElement;
      const scoped = queryWithin(container, selector);
      if (scoped) return scoped;
    }

    // 2) Light DOM (fallback global)
    const lightDom = document.querySelector(selector);
    if (lightDom) return lightDom;

    // 3) Shadow DOM (tim-search-input)
    const comp = getSearchComponent();
    const shadow = comp && comp.shadowRoot;
    const inShadow = queryWithin(shadow, selector);
    if (inShadow) return inShadow;

    return null;
  }

  // Itens da secao "Recomendado para voce"
  const itensRecomendados = [
    {
      texto: 'TIM Controle',
      url: 'https://tim.com.br/para-voce/planos/tim-controle'
    },
    {
      texto: 'TIM Black',
      url: 'https://tim.com.br/para-voce/planos/tim-black'
    },
    {
      texto: 'TIM Ultrafibra',
      url: 'https://tim.com.br/para-voce/ultrafibra'
    }
  ];

  // ---- Injecao de estilos (apenas ajustes finos se necessario) ----
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Garante que a label do recomendado siga o padrao visual
      '.tim-search-input-dropdown-items-div[' + RECOMENDADO_ATTR + '] .tim-search-input-dropdown-items-label {',
      '  font-family: Inter, Arial, sans-serif;',
      '  font-weight: 400;',
      '  font-size: 12px;',
      '  line-height: 16px;',
      '  color: #888888;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
    console.log('[Busca Sugestiva] Estilos injetados.');
  }

  // ---- Tracking Adobe ----
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking BuscaSugestiva] Parametro ausente para analytics.');
      return;
    }

    const labelEvent = 'AT_BuscaSugestiva_' + eventType + ' ' + eventLabel;
    console.log('[Tracking BuscaSugestiva] Evento disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('tim-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_busca_sugestiva';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // ---- Criacao da secao "Recomendado para voce" (mesma estrutura nativa) ----
  function criarSecaoRecomendado() {
    const div = document.createElement('div');
    div.className = 'tim-search-input-dropdown-items-div';
    div.setAttribute(RECOMENDADO_ATTR, 'true');

    const label = document.createElement('p');
    label.className = 'tim-search-input-dropdown-items-label';
    label.textContent = 'Recomendado para voc\u00ea';
    div.appendChild(label);

    const ul = document.createElement('ul');

    for (let i = 0; i < itensRecomendados.length; i++) {
      const item = itensRecomendados[i];
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'tim-search-input-dropdown-items-link';
      link.href = item.url;
      link.setAttribute('data-ic-item', 'sec-busca-recomendado');
      link.setAttribute('tabindex', '0');
      link.textContent = item.texto;
      li.appendChild(link);
      ul.appendChild(li);
    }

    div.appendChild(ul);

    const hr = document.createElement('hr');
    div.appendChild(hr);

    return div;
  }

  // ---- Adiciona listeners de tracking nos links ----
  function adicionarTrackingLinks(secao) {
    const links = secao.querySelectorAll('.tim-search-input-dropdown-items-link');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (link.getAttribute(ANALYTICS_ATTR)) continue;
      link.setAttribute(ANALYTICS_ATTR, 'true');
      (function (el) {
        el.addEventListener('click', function () {
          analyticsEvent(el.textContent, 'clique');
        });
      })(link);
    }
  }

  // ---- Dispara tracking de view quando dropdown abre ----
  function setupViewTracking() {
    const searchComponent = getSearchComponent();
    if (!searchComponent || searchComponent.getAttribute('data-view-tracking-added')) return;
    searchComponent.setAttribute('data-view-tracking-added', 'true');

    const viewObserver = new MutationObserver(function () {
      const revelado = searchComponent.hasAttribute('revealed');
      if (revelado && !viewTracked) {
        viewTracked = true;
        analyticsEvent('Recomendado para voce', 'view');
      } else if (!revelado) {
        viewTracked = false;
      }
    });

    viewObserver.observe(searchComponent, { attributes: true, attributeFilter: ['revealed'] });
    console.log('[Busca Sugestiva] View tracking configurado.');
  }

  // ---- Logica principal ----
  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const dropdown = getDropdown();
      if (!dropdown) {
        console.log('[Busca Sugestiva] Dropdown nao encontrado.');
        return;
      }

      // Verifica se a secao ja existe no DOM
      if (dropdown.querySelector('[' + RECOMENDADO_ATTR + ']')) {
        return;
      }

      const secaoRecomendado = criarSecaoRecomendado();

      // Insere antes do primeiro filho (antes de "Mais buscados")
      const primeiraSecao = dropdown.querySelector('.tim-search-input-dropdown-items-div');
      if (primeiraSecao) {
        dropdown.insertBefore(secaoRecomendado, primeiraSecao);
      } else {
        dropdown.appendChild(secaoRecomendado);
      }

      // Tracking de cliques nos links da nova secao
      adicionarTrackingLinks(secaoRecomendado);

      // Tracking de cliques nas secoes existentes (se ainda nao adicionado)
      const secoesExistentes = dropdown.querySelectorAll('.tim-search-input-dropdown-items-div');
      for (let j = 0; j < secoesExistentes.length; j++) {
        adicionarTrackingLinks(secoesExistentes[j]);
      }

      // Configura tracking de view ao abrir dropdown
      setupViewTracking();

      console.log('[Busca Sugestiva] Secao "Recomendado para voce" inserida com sucesso.');
    } finally {
      isProcessing = false;
    }
  }

  // ---- Observer para DOM dinamico ----
  function setupObserver() {
    if (window._timBuscaSugestivaObserver) return;

    const observer = new MutationObserver(function () {
      if (isProcessing) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, DEBOUNCE_MS);
    });

    // Observa o body (criacoes em light DOM) e, se existir, o shadowRoot do componente
    observer.observe(document.body, { childList: true, subtree: true });

    const comp = getSearchComponent();
    const shadow = comp && comp.shadowRoot;
    if (shadow) {
      observer.observe(shadow, { childList: true, subtree: true });
    }

    window._timBuscaSugestivaObserver = observer;
    console.log('[Busca Sugestiva] MutationObserver configurado.');
  }

  // ---- Inicializacao com retry ----
  function init() {
    injectStyles();

    const dropdown = getDropdown();

    if (dropdown) {
      run();
      setupObserver();
      return;
    }

    // Retry com polling limitado
    const interval = setInterval(function () {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        clearInterval(interval);
        console.log('[Busca Sugestiva] Dropdown nao encontrado apos ' + MAX_RETRIES + ' tentativas. Ativando observer como fallback.');
        setupObserver();
        return;
      }

      const el = getDropdown();
      if (el) {
        clearInterval(interval);
        run();
        setupObserver();
      }
    }, RETRY_INTERVAL);
  }

  // ---- DOM Ready ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
