(function () {
  'use strict';

  if (window.recomendacoesBuscaXT) return;
  window.recomendacoesBuscaXT = true;

  let debounceTimer = null;

  const STYLE_ID = 'at-recomendacoes-busca-style';
  const MOBILE_BREAKPOINT = 1024;

  const SEARCH_INPUT_ID = 'search-input';
  const CLOSE_BTN_SELECTOR = '[aria-label="Fechar"]';

  const SUGESTOES_TEXTO = [
    { href: 'https://www.nespresso.com/br/pt/busca?action=searchboxSubmitStandalone&q=Vertuo', texto: 'Vertuo', hasFlag: false },
    { href: 'https://www.nespresso.com/br/pt/busca?q=aeroccino&tab=Products&p=1', texto: 'Aeroccino', hasFlag: false },
    { href: 'https://www.nespresso.com/br/pt/busca?q=ristretto&tab=Products&p=1', texto: 'Ristretto', hasFlag: true },
    { href: 'https://www.nespresso.com/br/pt/busca?q=Volluto&tab=Products&p=1', texto: 'Volluto', hasFlag: false },
    { href: 'https://www.nespresso.com/br/pt/busca?q=Voltesso&tab=Products&p=1', texto: 'Voltesso', hasFlag: false },
  ];

  const SUGESTOES_IMAGENS = [
    {
      href: 'https://www.nespresso.com/br/pt/order/machines/vertuo/cafeteira-vertuo-pop-vermelho-pimenta-110v',
      produto: 'Vertuo Pop',
      tecnologia: 'Vertuo',
      imagemProduto: 'https://www.nespresso.com/shared_res/agility/global/machines/vl/sku-main-info-product/vertuo-pop-c_liquorice-black_front-coffee-nespresso_2x.png?impolicy=small&imwidth=600&imdensity=1',
      hasFlag: true,
    },
    {
      href: 'https://www.nespresso.com/br/pt/order/machines/original/maquina-cafe-comprar-essenza-mini-preta-110v',
      produto: 'Essenza Mini',
      tecnologia: 'Original',
      imagemProduto: 'https://www.nespresso.com/ecom/medias/sys_master/public/46921759784990/EssenzaMiniPreta-2000x2000-110v.png?impolicy=small&imwidth=284&imdensity=1',
      hasFlag: true,
    },
    {
      href: 'https://www.nespresso.com/br/pt/order/machines/original/comprar-maquina-cafe-pixie-redesign-prata-110v',
      produto: 'Pixie Redesign',
      tecnologia: 'Original',
      imagemProduto: 'https://www.nespresso.com/ecom/medias/sys_master/public/45990015270942/PixiePrata-2000x2000-110v-TQ.png?impolicy=small&imwidth=284&imdensity=1',
      hasFlag: false,
    },
  ];

  const ICONE_LUPA =
    '<svg viewBox="0 0 16 16" width="24" height="24" stroke="#17171a" stroke-width="1.2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="m6.4 0c3.5 0 6.4 2.9 6.4 6.4 0 1.4-.4 2.7-1.2 3.7l4 4c.4.4.4 1 .1 1.5l-.1.1c-.2.2-.5.3-.8.3s-.6-.1-.8-.3l-4-4c-1 .7-2.3 1.2-3.7 1.2-3.4-.1-6.3-3-6.3-6.5s2.9-6.4 6.4-6.4zm0 2.1c-2.3 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3z"></path>'
    + '</svg>';

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'recomendacoes_busca_target',
      local_event_action: 'click',
      local_event_label: label,
    });
  }

  function getSharedStyles() {
    return [
      '.at-recomendacoes-busca, .at-recomendacoes-busca * {',
      '  font-family: NespressoLucas, Helvetica, sans-serif;',
      '  box-sizing: border-box;',
      '}',
      '.at-recomendacoes-busca {',
      '  display: none;',
      '  position: fixed;',
      '  z-index: 999999;',
      '  background-color: #FFFFFF;',
      '  padding: 16px;',
      '}',
      '.at-recomendacoes-busca.ativo {',
      '  display: flex;',
      '}',
      '.at-recomendacoes-busca .linhaSugestao {',
      '  align-items: center;',
      '  color: #17171a;',
      '  display: flex;',
      '  gap: 0.75rem;',
      '  padding: 10px 0;',
      '  text-decoration: none;',
      '  width: 100%;',
      '}',
      '.at-recomendacoes-busca .linhaSugestao svg {',
      '  flex-shrink: 0;',
      '  height: 18px;',
      '  width: 18px;',
      '}',
      '.at-recomendacoes-busca .linhaSugestao svg path {',
      '  stroke: #17171a;',
      '  fill: #17171a;',
      '}',
      '.at-recomendacoes-busca .linhaSugestao:hover {',
      '  background-color: #f6f7f9;',
      '}',
      '.at-recomendacoes-busca .flag {',
      '  background: #19171c !important;',
      '  border-radius: 4px;',
      '  color: #fff;',
      '  font-size: 12px;',
      '  font-weight: 600;',
      '  padding: 2px 6px;',
      '}',
      '.at-recomendacoes-busca .imagemSugestaoResultado {',
      '  align-items: center;',
      '  color: #17171a;',
      '  display: flex;',
      '  flex: 1;',
      '  flex-direction: column;',
      '  gap: 6px;',
      '  min-width: 0;',
      '  padding: 8px;',
      '  text-align: center;',
      '  text-decoration: none;',
      '}',
      '.at-recomendacoes-busca .imagemSugestaoResultado:hover {',
      '  background-color: #f6f7f9;',
      '}',
      '.at-recomendacoes-busca .imagemSugestaoResultado img {',
      '  border: 0.5px solid #d6d6d6;',
      '  height: auto;',
      '  width: 64px;',
      '}',
      '.at-recomendacoes-busca .imagemSugestaoResultado strong {',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '}',
      '.at-recomendacoes-busca .imagemSugestaoResultado .tecnologia {',
      '  color: #6f6f70;',
      '  font-size: 12px;',
      '}',
    ].join('\n');
  }

  function getDesktopStyles() {
    return [
      '.at-recomendacoes-busca--desktop {',
      '  gap: 32px;',
      '  width: 100%;',
      '}',
      '.at-recomendacoes-busca--desktop .colunaTexto {',
      '  display: flex;',
      '  flex-direction: column;',
      '  width: 50%;',
      '}',
      '.at-recomendacoes-busca--desktop .colunaImagens {',
      '  display: flex;',
      '  flex-direction: row;',
      '  gap: 12px;',
      '  width: 50%;',
      '}',
    ].join('\n');
  }

  function getMobileStyles() {
    return [
      '.at-recomendacoes-busca--mobile {',
      '  flex-direction: column;',
      '  width: 100%;',
      '}',
      '.at-recomendacoes-busca--mobile .colunaTexto {',
      '  display: flex;',
      '  flex-direction: column;',
      '  width: 100%;',
      '}',
      '.at-recomendacoes-busca--mobile .colunaImagens {',
      '  border-top: 1px solid #e5e8e8;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 4px;',
      '  margin-top: 8px;',
      '  padding-top: 8px;',
      '  width: 100%;',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getSharedStyles() + '\n' + (isMobile() ? getMobileStyles() : getDesktopStyles());
    document.head.appendChild(style);
  }

  function trackCliqueSugestao(event, prefixo) {
    const titulo = event.currentTarget.getAttribute('title');
    if (!titulo) return;
    sendGAEvent(prefixo + titulo.toLowerCase().replaceAll(' ', '_'));
  }

  function buildLinhaSugestao(item) {
    const flag = item.hasFlag ? '<div class="flag">Mais vendido</div>' : '';
    const link = document.createElement('a');
    link.className = 'linhaSugestao';
    link.title = item.texto;
    link.href = item.href;
    link.innerHTML = ICONE_LUPA + '<span>' + item.texto + '</span>' + flag;
    link.addEventListener('click', function (event) {
      trackCliqueSugestao(event, 'busca_click_termos_');
    });
    return link;
  }

  function buildImagemSugestao(item) {
    const flag = item.hasFlag ? '<div class="flag">Mais vendido em ' + item.tecnologia + '</div>' : '';
    const link = document.createElement('a');
    link.className = 'imagemSugestaoResultado';
    link.title = item.produto;
    link.href = item.href;
    link.innerHTML =
      '<img alt="' + item.produto + '" src="' + item.imagemProduto + '">'
      + '<div><div><strong>' + item.produto + '</strong></div>'
      + '<div class="tecnologia">em ' + item.tecnologia + '</div></div>'
      + flag;
    link.addEventListener('click', function (event) {
      trackCliqueSugestao(event, 'busca_click_imagens_');
    });
    return link;
  }

  function buildBox(modifierClass) {
    const box = document.createElement('div');
    box.className = 'at-recomendacoes-busca ' + modifierClass;

    const colunaTexto = document.createElement('div');
    colunaTexto.className = 'colunaTexto';
    SUGESTOES_TEXTO.forEach(function (item) {
      colunaTexto.appendChild(buildLinhaSugestao(item));
    });

    const colunaImagens = document.createElement('div');
    colunaImagens.className = 'colunaImagens';
    SUGESTOES_IMAGENS.forEach(function (item) {
      colunaImagens.appendChild(buildImagemSugestao(item));
    });

    box.appendChild(colunaTexto);
    box.appendChild(colunaImagens);
    return box;
  }

  function buildBoxDesktop() {
    return buildBox('at-recomendacoes-busca--desktop');
  }

  function buildBoxMobile() {
    return buildBox('at-recomendacoes-busca--mobile');
  }

  function findContainer(inputEl) {
    let el = inputEl.parentElement;
    let depth = 0;
    while (el && depth < 8) {
      if (el.querySelector(CLOSE_BTN_SELECTOR)) {
        return el;
      }
      el = el.parentElement;
      depth++;
    }
    return null;
  }

  function watchNativeResults(input, box) {
    const nativeResultsId = input.getAttribute('aria-controls');
    if (!nativeResultsId) return;

    const nativeResults = document.getElementById(nativeResultsId);
    if (!nativeResults) return;

    function sync() {
      const temResultadoNativo = nativeResults.children.length > 0;
      if (temResultadoNativo) {
        box.classList.remove('ativo');
        nativeResults.style.removeProperty('border');
      } else {
        nativeResults.style.setProperty('border', 'none', 'important');
        if (document.activeElement === input) {
          box.classList.add('ativo');
        }
      }
    }

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(nativeResults, { childList: true });
  }

  function positionBox(container, input, box) {
    const containerRect = container.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    box.style.top = inputRect.bottom + 'px';
    box.style.left = containerRect.left + 'px';
    box.style.width = containerRect.width + 'px';

    if (isMobile()) return;

    const colunaTexto = box.querySelector('.colunaTexto');
    const colunaImagens = box.querySelector('.colunaImagens');
    if (colunaTexto) {
      colunaTexto.style.marginLeft = (inputRect.left - containerRect.left) + 'px';
      colunaTexto.style.width = inputRect.width + 'px';
      colunaTexto.style.flex = '0 0 auto';
    }
    if (colunaImagens) {
      colunaImagens.style.width = 'auto';
      colunaImagens.style.flex = '1';
    }
  }

  function enhanceSearch(input) {
    if (document.querySelector('.at-recomendacoes-busca')) return true;

    const container = findContainer(input);
    if (!container) return false;

    const box = isMobile() ? buildBoxMobile() : buildBoxDesktop();
    document.body.appendChild(box);
    positionBox(container, input, box);
    box.classList.add('ativo');

    window.addEventListener('resize', function () {
      positionBox(container, input, box);
    });

    input.addEventListener('focus', function () {
      positionBox(container, input, box);
      box.classList.add('ativo');
    });

    input.addEventListener('input', function () {
      if (input.value.trim().length > 0) {
        box.classList.remove('ativo');
      } else {
        box.classList.add('ativo');
      }
    });

    box.addEventListener('mouseenter', function () {
      box.classList.add('ativo');
    });

    document.addEventListener('click', function (event) {
      const dentroInput = input.contains(event.target);
      const dentroBox = box.contains(event.target);
      if (!dentroInput && !dentroBox) {
        box.classList.remove('ativo');
      }
    });

    watchNativeResults(input, box);

    return true;
  }

  function tryEnhance() {
    const input = document.getElementById(SEARCH_INPUT_ID);
    const box = document.querySelector('.at-recomendacoes-busca');

    if (!input) {
      if (box) box.remove();
      return;
    }

    enhanceSearch(input);
  }

  function setupObserver() {
    if (window._recomendacoesBuscaObserver) return;

    const observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(tryEnhance, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window._recomendacoesBuscaObserver = observer;
  }

  function init() {
    injectStyles();
    tryEnhance();
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
