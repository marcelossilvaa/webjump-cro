(function () {
  'use strict';

  // ============================================
  // Vitrine Unificada com Categorias - Araujo
  // Agrupa todas as vitrines em tabs por categoria
  // VWO Test
  // ============================================

  var STYLE_ID = 'araujo-vitrine-tabs-style';
  var CONTAINER_ID = 'araujo-vitrine-tabs-container';
  var isProcessing = false;
  var debounceTimer = null;
  var observerInitialized = false;
  var maxRetries = 50;
  var retryCount = 0;
  var minVitrines = 3;

  // Mapeamento de palavras-chave para categorias
  var categoryMapping = {
    // Infantil
    'infantil': 'Infantil',
    'bebe': 'Infantil',
    'crianca': 'Infantil',
    'fralda': 'Infantil',
    'mamadeira': 'Infantil',
    // Dermatologicos
    'dermatologico': 'Dermatologicos',
    'dermatol': 'Dermatologicos',
    'pele': 'Dermatologicos',
    'protetor solar': 'Dermatologicos',
    'hidratante': 'Dermatologicos',
    // Higiene Pessoal
    'higiene': 'Higiene Pessoal',
    'pessoal': 'Higiene Pessoal',
    'sabonete': 'Higiene Pessoal',
    'shampoo': 'Higiene Pessoal',
    'desodorante': 'Higiene Pessoal',
    'oral': 'Higiene Pessoal',
    'dental': 'Higiene Pessoal',
    // Beleza
    'beleza': 'Beleza',
    'cosmetico': 'Beleza',
    'maquiagem': 'Beleza',
    'cabelo': 'Beleza',
    'perfume': 'Beleza',
    'unha': 'Beleza',
    // Medicamentos
    'medicamento': 'Medicamentos',
    'remedio': 'Medicamentos',
    'farmacia': 'Medicamentos',
    'dor': 'Medicamentos',
    'gripe': 'Medicamentos',
    'febre': 'Medicamentos',
    'alergia': 'Medicamentos',
    // Mercado
    'mercado': 'Mercado',
    'alimento': 'Mercado',
    'bebida': 'Mercado',
    'limpeza': 'Mercado',
    // Saude
    'saude': 'Saude',
    'bem estar': 'Saude',
    'fitness': 'Saude',
    // Nutricao
    'vitamina': 'Nutricao',
    'suplemento': 'Nutricao',
    'nutricao': 'Nutricao',
    'proteina': 'Nutricao',
    // Pet Shop
    'pet': 'Pet Shop',
    'animal': 'Pet Shop',
    'cachorro': 'Pet Shop',
    'gato': 'Pet Shop',
    'racao': 'Pet Shop',
    // Promocoes
    'leve': 'Leve + Por -',
    'pague': 'Leve + Por -',
    'promocao': 'Ofertas',
    'oferta': 'Ofertas',
    'desconto': 'Ofertas',
    'quinzena': 'Ofertas',
    // Vistos
    'vistos': 'Vistos',
    'visualizado': 'Vistos',
    'recente': 'Vistos',
    'continue': 'Vistos'
  };

  // Ordem desejada das categorias
  var categoryOrder = [
    'Todos',
    'Infantil',
    'Dermatologicos',
    'Higiene Pessoal',
    'Beleza',
    'Medicamentos',
    'Mercado',
    'Saude',
    'Nutricao',
    'Pet Shop',
    'Ofertas',
    'Leve + Por -'
  ];

  function getStyles() {
    return [
      '/* Container principal */',
      '#' + CONTAINER_ID + ' {',
      '  background: #fff;',
      '  padding: 0;',
      '  margin: 0;',
      '}',
      '',
      '/* Wrapper das tabs */',
      '.araujo-tabs-wrapper {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding: 15px;',
      '  background: #fff;',
      '  position: relative;',
      '}',
      '',
      '.araujo-tabs-inner {',
      '  display: flex;',
      '  gap: 10px;',
      '  overflow-x: auto;',
      '  scrollbar-width: none;',
      '  -ms-overflow-style: none;',
      '  flex: 1;',
      '  scroll-behavior: smooth;',
      '}',
      '',
      '.araujo-tabs-inner::-webkit-scrollbar {',
      '  display: none;',
      '}',
      '',
      '/* Botoes de categoria */',
      '.araujo-tab-btn {',
      '  flex-shrink: 0;',
      '  padding: 10px 22px;',
      '  border: 2px solid #004380;',
      '  border-radius: 50px;',
      '  background: #fff;',
      '  color: #004380;',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  transition: all 0.25s ease;',
      '  white-space: nowrap;',
      '  font-family: inherit;',
      '}',
      '',
      '.araujo-tab-btn:hover {',
      '  background: #e8f4fc;',
      '}',
      '',
      '.araujo-tab-btn.active {',
      '  background: #004380;',
      '  color: #fff;',
      '}',
      '',
      '/* Botoes de scroll */',
      '.araujo-tab-scroll {',
      '  flex-shrink: 0;',
      '  width: 40px;',
      '  height: 40px;',
      '  border-radius: 50%;',
      '  border: 1px solid #e0e0e0;',
      '  background: #fff;',
      '  color: #004380;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 20px;',
      '  box-shadow: 0 2px 6px rgba(0,0,0,0.1);',
      '  transition: all 0.2s ease;',
      '}',
      '',
      '.araujo-tab-scroll:hover {',
      '  background: #f5f5f5;',
      '  box-shadow: 0 3px 8px rgba(0,0,0,0.15);',
      '}',
      '',
      '.araujo-tab-scroll:disabled {',
      '  opacity: 0.3;',
      '  cursor: default;',
      '}',
      '',
      '/* Conteudo das vitrines */',
      '.araujo-tabs-content {',
      '  position: relative;',
      '}',
      '',
      '.araujo-vitrine-panel {',
      '  display: none;',
      '}',
      '',
      '.araujo-vitrine-panel.active {',
      '  display: block;',
      '}',
      '',
      '/* Esconder vitrines originais */',
      '.araujo-hidden-original {',
      '  display: none !important;',
      '}',
      '',
      '/* Responsivo */',
      '@media (max-width: 768px) {',
      '  .araujo-tab-btn {',
      '    padding: 8px 16px;',
      '    font-size: 13px;',
      '  }',
      '  .araujo-tabs-wrapper {',
      '    padding: 10px;',
      '  }',
      '  .araujo-tab-scroll {',
      '    width: 32px;',
      '    height: 32px;',
      '    font-size: 16px;',
      '  }',
      '}'
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function normalizeText(text) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function extractCategoryFromTitle(title) {
    if (!title) return null;
    var normalized = normalizeText(title);
    
    var keys = Object.keys(categoryMapping);
    for (var i = 0; i < keys.length; i++) {
      var keyword = keys[i];
      if (normalized.indexOf(keyword) !== -1) {
        return categoryMapping[keyword];
      }
    }
    return null;
  }

  function getVitrines() {
    // Buscar todas as secoes de vitrine Einstein na homepage
    var carouselContainers = document.querySelectorAll('.experience-einstein-einsteinCarousel');
    var vitrines = [];

    for (var i = 0; i < carouselContainers.length; i++) {
      var container = carouselContainers[i];
      var titleEl = container.querySelector('.carousel-title');
      var carousel = container.querySelector('.einstein-carousel');
      
      if (!carousel) continue;
      
      var title = titleEl ? titleEl.textContent.trim() : 'Produtos ' + (i + 1);
      var category = extractCategoryFromTitle(title) || 'Outros';
      
      // Encontrar o elemento section pai
      var parentSection = container.closest('section');
      
      vitrines.push({
        element: container,
        parentSection: parentSection,
        title: title,
        category: category,
        index: i
      });
    }

    return vitrines;
  }

  function buildTabsUI(categories, defaultCategory) {
    var wrapper = document.createElement('div');
    wrapper.className = 'araujo-tabs-wrapper container';

    // Botao scroll esquerda
    var scrollLeft = document.createElement('button');
    scrollLeft.className = 'araujo-tab-scroll';
    scrollLeft.innerHTML = '&#10094;';
    scrollLeft.setAttribute('aria-label', 'Anterior');
    scrollLeft.setAttribute('data-direction', 'left');

    // Container das tabs
    var tabsInner = document.createElement('div');
    tabsInner.className = 'araujo-tabs-inner';

    // Criar botao para cada categoria
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var btn = document.createElement('button');
      btn.className = 'araujo-tab-btn';
      if (cat === defaultCategory) {
        btn.classList.add('active');
      }
      btn.setAttribute('data-category', cat);
      btn.textContent = cat;
      btn.setAttribute('type', 'button');
      tabsInner.appendChild(btn);
    }

    // Botao scroll direita
    var scrollRight = document.createElement('button');
    scrollRight.className = 'araujo-tab-scroll';
    scrollRight.innerHTML = '&#10095;';
    scrollRight.setAttribute('aria-label', 'Proximo');
    scrollRight.setAttribute('data-direction', 'right');

    wrapper.appendChild(scrollLeft);
    wrapper.appendChild(tabsInner);
    wrapper.appendChild(scrollRight);

    return {
      wrapper: wrapper,
      tabsInner: tabsInner,
      scrollLeft: scrollLeft,
      scrollRight: scrollRight
    };
  }

  function createVitrineContainer(vitrines) {
    // Agrupar vitrines por categoria
    var categoriesMap = {};
    var categoriesFound = [];

    for (var i = 0; i < vitrines.length; i++) {
      var v = vitrines[i];
      if (!categoriesMap[v.category]) {
        categoriesMap[v.category] = [];
        categoriesFound.push(v.category);
      }
      categoriesMap[v.category].push(v);
    }

    // Ordenar categorias
    var orderedCategories = ['Todos'];
    for (var j = 0; j < categoryOrder.length; j++) {
      var cat = categoryOrder[j];
      if (cat !== 'Todos' && categoriesFound.indexOf(cat) !== -1) {
        orderedCategories.push(cat);
      }
    }
    // Adicionar categorias nao mapeadas
    for (var k = 0; k < categoriesFound.length; k++) {
      var foundCat = categoriesFound[k];
      if (orderedCategories.indexOf(foundCat) === -1) {
        orderedCategories.push(foundCat);
      }
    }

    console.log('[Vitrine Tabs] Categorias encontradas: ' + orderedCategories.join(', '));

    // Container principal
    var container = document.createElement('div');
    container.id = CONTAINER_ID;

    // Criar tabs UI
    var tabsUI = buildTabsUI(orderedCategories, 'Todos');
    container.appendChild(tabsUI.wrapper);

    // Container de conteudo
    var content = document.createElement('div');
    content.className = 'araujo-tabs-content';

    // Painel "Todos" - mostra a primeira vitrine
    var allPanel = document.createElement('div');
    allPanel.className = 'araujo-vitrine-panel active';
    allPanel.setAttribute('data-panel', 'Todos');
    if (vitrines.length > 0) {
      allPanel.appendChild(vitrines[0].element.cloneNode(true));
    }
    content.appendChild(allPanel);

    // Paineis por categoria (movendo elementos originais)
    var catKeys = Object.keys(categoriesMap);
    for (var m = 0; m < catKeys.length; m++) {
      var catKey = catKeys[m];
      var panel = document.createElement('div');
      panel.className = 'araujo-vitrine-panel';
      panel.setAttribute('data-panel', catKey);

      var catVitrines = categoriesMap[catKey];
      for (var n = 0; n < catVitrines.length; n++) {
        // Clonar para nao perder o original
        var cloned = catVitrines[n].element.cloneNode(true);
        panel.appendChild(cloned);
      }
      content.appendChild(panel);
    }

    container.appendChild(content);

    // Configurar eventos
    setupTabEvents(tabsUI, content);

    return container;
  }

  function setupTabEvents(tabsUI, content) {
    var tabsInner = tabsUI.tabsInner;
    var scrollLeft = tabsUI.scrollLeft;
    var scrollRight = tabsUI.scrollRight;

    // Evento de clique nas tabs
    tabsInner.addEventListener('click', function (e) {
      var btn = e.target.closest('.araujo-tab-btn');
      if (!btn) return;

      var targetCat = btn.getAttribute('data-category');

      // Atualizar estado ativo dos botoes
      var allBtns = tabsInner.querySelectorAll('.araujo-tab-btn');
      for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.remove('active');
      }
      btn.classList.add('active');

      // Mostrar painel correspondente
      var panels = content.querySelectorAll('.araujo-vitrine-panel');
      for (var j = 0; j < panels.length; j++) {
        panels[j].classList.remove('active');
      }

      var targetPanel = content.querySelector('[data-panel="' + targetCat + '"]');
      if (targetPanel) {
        targetPanel.classList.add('active');
        
        // Reinicializar lazy load
        triggerLazyLoad(targetPanel);
      }

      // Tracking
      trackCategoryClick(targetCat);
    });

    // Scroll das tabs
    scrollLeft.addEventListener('click', function () {
      tabsInner.scrollBy({ left: -200, behavior: 'smooth' });
    });

    scrollRight.addEventListener('click', function () {
      tabsInner.scrollBy({ left: 200, behavior: 'smooth' });
    });

    // Atualizar visibilidade dos botoes de scroll
    function updateScrollVisibility() {
      var maxScroll = tabsInner.scrollWidth - tabsInner.clientWidth;
      scrollLeft.disabled = tabsInner.scrollLeft <= 0;
      scrollRight.disabled = tabsInner.scrollLeft >= maxScroll - 1;
    }

    tabsInner.addEventListener('scroll', updateScrollVisibility);
    window.addEventListener('resize', updateScrollVisibility);
    setTimeout(updateScrollVisibility, 200);
  }

  function triggerLazyLoad(panel) {
    // Forcar carregamento de imagens lazy
    var lazyImages = panel.querySelectorAll('.lozad, [data-src]');
    for (var i = 0; i < lazyImages.length; i++) {
      var img = lazyImages[i];
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
    }

    // Se lozad estiver disponivel globalmente
    if (window.lozad) {
      var observer = window.lozad('.lozad');
      observer.observe();
    }
  }

  function trackCategoryClick(category) {
    console.log('[Vitrine Tabs] Categoria selecionada: ' + category);
    
    // Tracking Adobe Target / Analytics se disponivel
    try {
      if (window.adobe && window.adobe.target) {
        window.adobe.target.trackEvent({
          mbox: 'vitrine-tabs-click',
          params: {
            category: category
          }
        });
      }

      // Data Layer push
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'vitrine_tab_click',
          vitrine_category: category
        });
      }
    } catch (err) {
      console.log('[Vitrine Tabs] Erro no tracking: ' + err.message);
    }
  }

  function run() {
    if (isProcessing) return;
    if (document.getElementById(CONTAINER_ID)) return;
    
    isProcessing = true;

    try {
      var vitrines = getVitrines();
      
      if (vitrines.length < minVitrines) {
        console.log('[Vitrine Tabs] Aguardando vitrines... (' + vitrines.length + '/' + minVitrines + ')');
        if (retryCount < maxRetries) {
          retryCount++;
          isProcessing = false;
          setTimeout(run, 300);
        }
        return;
      }

      console.log('[Vitrine Tabs] ' + vitrines.length + ' vitrines encontradas');

      // Criar container com tabs
      var container = createVitrineContainer(vitrines);

      // Inserir antes da primeira vitrine
      var insertionPoint = vitrines[0].parentSection || vitrines[0].element.parentElement;
      if (insertionPoint && insertionPoint.parentElement) {
        insertionPoint.parentElement.insertBefore(container, insertionPoint);
      }

      // Esconder vitrines originais
      for (var i = 0; i < vitrines.length; i++) {
        var section = vitrines[i].parentSection;
        if (section) {
          section.classList.add('araujo-hidden-original');
        }
      }

      // Trigger lazy load no painel ativo
      var activePanel = container.querySelector('.araujo-vitrine-panel.active');
      if (activePanel) {
        triggerLazyLoad(activePanel);
      }

      console.log('[Vitrine Tabs] Implementacao concluida com sucesso');

    } catch (err) {
      console.log('[Vitrine Tabs] Erro: ' + err.message);
    } finally {
      isProcessing = false;
    }
  }

  function initObserver() {
    if (observerInitialized) return;
    if (window._araujoVitrineTabsObserver) return;
    
    window._araujoVitrineTabsObserver = true;
    observerInitialized = true;

    var observer = new MutationObserver(function (mutations) {
      // Ignorar se ja existe container
      if (document.getElementById(CONTAINER_ID)) return;

      // Verificar se ha novas vitrines adicionadas
      var hasNewVitrines = false;
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        // Ignorar mutacoes do proprio script
        if (mutation.target.id === CONTAINER_ID) continue;
        if (mutation.target.closest && mutation.target.closest('#' + CONTAINER_ID)) continue;
        
        if (mutation.addedNodes.length > 0) {
          for (var j = 0; j < mutation.addedNodes.length; j++) {
            var node = mutation.addedNodes[j];
            if (node.nodeType === 1) {
              if (node.classList && (
                node.classList.contains('experience-einstein-einsteinCarousel') ||
                node.querySelector && node.querySelector('.experience-einstein-einsteinCarousel')
              )) {
                hasNewVitrines = true;
                break;
              }
            }
          }
        }
        if (hasNewVitrines) break;
      }

      if (!hasNewVitrines) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, 400);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    // Guard: apenas homepage
    if (window.location.pathname !== '/') {
      console.log('[Vitrine Tabs] Nao e homepage, script nao executado');
      return;
    }

    console.log('[Vitrine Tabs] Iniciando...');
    
    injectStyles();
    run();
    initObserver();
  }

  // Inicializacao
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
