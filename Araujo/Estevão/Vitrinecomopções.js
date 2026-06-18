(function () {
  'use strict';

  // ============================================
  // Vitrine Unificada com Categorias - Araujo
  // Agrupa todas as vitrines em tabs por categoria
  // ============================================

  const STYLE_ID = 'araujo-vitrine-tabs-style';
  const CONTAINER_ID = 'araujo-vitrine-tabs-container';
  let isProcessing = false;
  let debounceTimer = null;
  let observerInitialized = false;
  const maxRetries = 30;
  let retryCount = 0;

  // Mapeamento de palavras-chave para categorias
  const categoryMapping = {
    'infantil': 'Infantil',
    'bebe': 'Infantil',
    'crianca': 'Infantil',
    'dermatologico': 'Dermatologicos',
    'dermatol': 'Dermatologicos',
    'pele': 'Dermatologicos',
    'higiene': 'Higiene Pessoal',
    'pessoal': 'Higiene Pessoal',
    'beleza': 'Beleza',
    'cosmetico': 'Beleza',
    'maquiagem': 'Beleza',
    'cabelo': 'Beleza',
    'medicamento': 'Medicamentos',
    'remedio': 'Medicamentos',
    'farmacia': 'Medicamentos',
    'dor': 'Medicamentos',
    'gripe': 'Medicamentos',
    'mercado': 'Mercado',
    'alimento': 'Mercado',
    'bebida': 'Mercado',
    'saude': 'Saude',
    'bem estar': 'Saude',
    'vitamina': 'Nutricao',
    'suplemento': 'Nutricao',
    'nutricao': 'Nutricao',
    'pet': 'Pet Shop',
    'animal': 'Pet Shop',
    'cachorro': 'Pet Shop',
    'gato': 'Pet Shop',
    'leve': 'Leve + Por -',
    'pague': 'Leve + Por -',
    'promocao': 'Leve + Por -',
    'oferta': 'Ofertas',
    'desconto': 'Ofertas',
    'vistos': 'Vistos',
    'visualizado': 'Vistos',
    'recente': 'Vistos'
  };

  // Ordem desejada das categorias
  const categoryOrder = [
    'Todos',
    'Vistos',
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
    const rules = [
      '#' + CONTAINER_ID + ' {',
      '  background: #fff;',
      '  padding: 20px 0;',
      '  margin: 20px 0;',
      '}',
      '',
      '.araujo-tabs-wrapper {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: flex-start;',
      '  gap: 8px;',
      '  padding: 10px 15px;',
      '  overflow-x: auto;',
      '  scrollbar-width: none;',
      '  -ms-overflow-style: none;',
      '  margin-bottom: 15px;',
      '}',
      '',
      '.araujo-tabs-wrapper::-webkit-scrollbar {',
      '  display: none;',
      '}',
      '',
      '.araujo-tab-btn {',
      '  flex-shrink: 0;',
      '  padding: 10px 20px;',
      '  border: 1px solid #004380;',
      '  border-radius: 25px;',
      '  background: #fff;',
      '  color: #004380;',
      '  font-size: 14px;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  white-space: nowrap;',
      '}',
      '',
      '.araujo-tab-btn:hover {',
      '  background: #e6f0f8;',
      '}',
      '',
      '.araujo-tab-btn.active {',
      '  background: #004380;',
      '  color: #fff;',
      '}',
      '',
      '.araujo-tab-scroll-btn {',
      '  flex-shrink: 0;',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 50%;',
      '  border: 1px solid #ddd;',
      '  background: #fff;',
      '  color: #004380;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 18px;',
      '}',
      '',
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
      '.araujo-original-section {',
      '  display: none !important;',
      '}',
      '',
      '@media (max-width: 768px) {',
      '  .araujo-tab-btn {',
      '    padding: 8px 16px;',
      '    font-size: 13px;',
      '  }',
      '  .araujo-tabs-wrapper {',
      '    padding: 8px 10px;',
      '  }',
      '}'
    ];
    return rules.join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function extractCategoryFromTitle(title) {
    if (!title) return null;
    var lowerTitle = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    var keys = Object.keys(categoryMapping);
    for (var i = 0; i < keys.length; i++) {
      var keyword = keys[i];
      if (lowerTitle.indexOf(keyword) !== -1) {
        return categoryMapping[keyword];
      }
    }
    return null;
  }

  function getVitrines() {
    // Buscar todas as secoes de vitrine (Einstein Carousel)
    var sections = document.querySelectorAll('.experience-einstein-einsteinCarousel');
    var vitrines = [];

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var titleEl = section.querySelector('.carousel-title');
      var carousel = section.querySelector('.einstein-carousel');
      
      if (!carousel) continue;
      
      var title = titleEl ? titleEl.textContent.trim() : 'Produtos';
      var category = extractCategoryFromTitle(title) || 'Outros';
      
      // Encontrar o elemento pai <section>
      var parentSection = section.closest('section');
      
      vitrines.push({
        element: section,
        parentSection: parentSection,
        title: title,
        category: category,
        carousel: carousel
      });
    }

    return vitrines;
  }

  function createTabsContainer(vitrines) {
    // Agrupar por categoria
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

    // Ordenar categorias conforme ordem desejada
    var orderedCategories = [];
    for (var j = 0; j < categoryOrder.length; j++) {
      var cat = categoryOrder[j];
      if (cat === 'Todos' || categoriesFound.indexOf(cat) !== -1) {
        orderedCategories.push(cat);
      }
    }
    // Adicionar categorias nao mapeadas
    for (var k = 0; k < categoriesFound.length; k++) {
      if (orderedCategories.indexOf(categoriesFound[k]) === -1) {
        orderedCategories.push(categoriesFound[k]);
      }
    }

    // Container principal
    var container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.setAttribute('data-vitrine-tabs', 'true');

    // Wrapper das tabs
    var tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'araujo-tabs-wrapper container';

    // Botao scroll esquerda
    var scrollLeftBtn = document.createElement('button');
    scrollLeftBtn.className = 'araujo-tab-scroll-btn';
    scrollLeftBtn.innerHTML = '&#8249;';
    scrollLeftBtn.setAttribute('aria-label', 'Scroll esquerda');
    scrollLeftBtn.style.display = 'none';

    // Container interno das tabs (para scroll)
    var tabsInner = document.createElement('div');
    tabsInner.style.cssText = 'display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;';

    // Criar botoes de categoria
    for (var m = 0; m < orderedCategories.length; m++) {
      var catName = orderedCategories[m];
      var btn = document.createElement('button');
      btn.className = 'araujo-tab-btn' + (m === 0 ? ' active' : '');
      btn.setAttribute('data-category', catName);
      btn.textContent = catName;
      btn.setAttribute('aria-label', 'Ver categoria ' + catName);
      tabsInner.appendChild(btn);
    }

    // Botao scroll direita
    var scrollRightBtn = document.createElement('button');
    scrollRightBtn.className = 'araujo-tab-scroll-btn';
    scrollRightBtn.innerHTML = '&#8250;';
    scrollRightBtn.setAttribute('aria-label', 'Scroll direita');

    tabsWrapper.appendChild(scrollLeftBtn);
    tabsWrapper.appendChild(tabsInner);
    tabsWrapper.appendChild(scrollRightBtn);
    container.appendChild(tabsWrapper);

    // Conteudo das vitrines
    var content = document.createElement('div');
    content.className = 'araujo-tabs-content';

    // Painel "Todos" - primeira vitrine visivel ou todas
    var allPanel = document.createElement('div');
    allPanel.className = 'araujo-vitrine-panel active';
    allPanel.setAttribute('data-panel', 'Todos');

    // Clonar a primeira vitrine para "Todos" ou mostrar um carrossel combinado
    if (vitrines.length > 0) {
      var firstVitrineClone = vitrines[0].element.cloneNode(true);
      allPanel.appendChild(firstVitrineClone);
    }
    content.appendChild(allPanel);

    // Paineis por categoria
    var catKeys = Object.keys(categoriesMap);
    for (var n = 0; n < catKeys.length; n++) {
      var catKey = catKeys[n];
      var panel = document.createElement('div');
      panel.className = 'araujo-vitrine-panel';
      panel.setAttribute('data-panel', catKey);

      var catVitrines = categoriesMap[catKey];
      for (var p = 0; p < catVitrines.length; p++) {
        var clonedVitrine = catVitrines[p].element.cloneNode(true);
        panel.appendChild(clonedVitrine);
      }

      content.appendChild(panel);
    }

    container.appendChild(content);

    // Event listeners para tabs
    var allBtns = tabsInner.querySelectorAll('.araujo-tab-btn');
    for (var q = 0; q < allBtns.length; q++) {
      allBtns[q].addEventListener('click', function (e) {
        var clickedBtn = e.currentTarget;
        var targetCat = clickedBtn.getAttribute('data-category');

        // Remover active de todos os botoes
        var btns = tabsInner.querySelectorAll('.araujo-tab-btn');
        for (var r = 0; r < btns.length; r++) {
          btns[r].classList.remove('active');
        }
        clickedBtn.classList.add('active');

        // Esconder todos os paineis e mostrar o selecionado
        var panels = content.querySelectorAll('.araujo-vitrine-panel');
        for (var s = 0; s < panels.length; s++) {
          panels[s].classList.remove('active');
        }
        var targetPanel = content.querySelector('[data-panel="' + targetCat + '"]');
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        // Reinicializar lazy load (lozad) se existir
        if (window.lozad) {
          var observer = window.lozad('.lozad');
          observer.observe();
        }

        // Tracking (se houver)
        console.log('[Vitrine Tabs] Categoria selecionada: ' + targetCat);
      });
    }

    // Scroll buttons
    scrollRightBtn.addEventListener('click', function () {
      tabsInner.scrollBy({ left: 150, behavior: 'smooth' });
    });
    scrollLeftBtn.addEventListener('click', function () {
      tabsInner.scrollBy({ left: -150, behavior: 'smooth' });
    });

    // Mostrar/esconder botoes de scroll
    function updateScrollButtons() {
      scrollLeftBtn.style.display = tabsInner.scrollLeft > 0 ? 'flex' : 'none';
      scrollRightBtn.style.display = 
        (tabsInner.scrollLeft + tabsInner.clientWidth) < tabsInner.scrollWidth ? 'flex' : 'none';
    }
    tabsInner.addEventListener('scroll', updateScrollButtons);
    setTimeout(updateScrollButtons, 100);

    return container;
  }

  function run() {
    if (isProcessing) return;
    if (document.getElementById(CONTAINER_ID)) return;
    
    isProcessing = true;

    try {
      var vitrines = getVitrines();
      
      if (vitrines.length < 2) {
        console.log('[Vitrine Tabs] Menos de 2 vitrines encontradas, aguardando...');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(run, 500);
        }
        return;
      }

      console.log('[Vitrine Tabs] Encontradas ' + vitrines.length + ' vitrines');

      // Criar container de tabs
      var tabsContainer = createTabsContainer(vitrines);

      // Inserir antes da primeira vitrine
      var firstSection = vitrines[0].parentSection || vitrines[0].element.parentElement;
      if (firstSection && firstSection.parentElement) {
        firstSection.parentElement.insertBefore(tabsContainer, firstSection);
      }

      // Esconder vitrines originais
      for (var i = 0; i < vitrines.length; i++) {
        var originalSection = vitrines[i].parentSection;
        if (originalSection) {
          originalSection.classList.add('araujo-original-section');
        }
      }

      console.log('[Vitrine Tabs] Vitrine com tabs criada com sucesso');

    } finally {
      isProcessing = false;
    }
  }

  function initObserver() {
    if (observerInitialized) return;
    if (window._araujoVitrineTabs) return;
    
    window._araujoVitrineTabs = true;
    observerInitialized = true;

    var observer = new MutationObserver(function (mutations) {
      // Ignorar mutacoes do proprio script
      var shouldProcess = false;
      for (var i = 0; i < mutations.length; i++) {
        var target = mutations[i].target;
        if (target.id === CONTAINER_ID) continue;
        if (target.closest && target.closest('#' + CONTAINER_ID)) continue;
        
        // Verificar se ha novas vitrines
        if (mutations[i].addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }

      if (!shouldProcess) return;
      if (document.getElementById(CONTAINER_ID)) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        run();
      }, 300);
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

    injectStyles();
    run();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
