(function () {
  'use strict';

  // === Variaveis ===
  var STYLE_ID = 'cro-filtro-consorcio-style';
  var DATA_ATTR = 'data-filtro-consorcio-applied';
  var CONSORCIO_URL = 'https://broto.com.br/loja/tratores.html?financing_pool_type=0';
  var MAX_RETRIES = 50;
  var RETRY_INTERVAL = 200;
  var retryCount = 0;

  // === Estilos ===
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.cro-consorcio-wrapper {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  margin-left: 16px;',
      '}',

      '.cro-consorcio-label {',
      '  font-size: 14px;',
      '  color: #333;',
      '  font-weight: 700;',
      '  white-space: nowrap;',
      '}',

      '.cro-consorcio-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  padding: 8px 16px;',
      '  border: 1.5px solid #4D5BF9;',
      '  border-radius: 8px;',
      '  background-color: #FFFFFF;',
      '  color: #4D5BF9;',
      '  font-family: inherit;',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  transition: background-color 0.2s ease, color 0.2s ease;',
      '  text-decoration: none;',
      '  white-space: nowrap;',
      '  line-height: 1.2;',
      '}',

      '.cro-consorcio-btn:hover {',
      '  background-color: #4D5BF9;',
      '  color: #FFFFFF;',
      '}',

      '.cro-consorcio-btn .cro-consorcio-plus {',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '}',

      // Mobile (botao menor, abaixo do filtrar)
      '@media (max-width: 767px) {',
      '  .cro-consorcio-wrapper {',
      '    display: flex;',
      '    flex-direction: column;',
      '    align-items: center;',
      '    margin-left: 0;',
      '    margin-top: 12px;',
      '    width: 100%;',
      '    gap: 6px;',
      '  }',
      '  .cro-consorcio-label {',
      '    font-size: 13px;',
      '  }',
      '  .cro-consorcio-btn {',
      '    padding: 10px 20px;',
      '    font-size: 14px;',
      '    width: 100%;',
      '    justify-content: center;',
      '    box-sizing: border-box;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  // === Criacao do botao ===
  function createConsorcioButton() {
    var wrapper = document.createElement('div');
    wrapper.className = 'cro-consorcio-wrapper';

    var label = document.createElement('span');
    label.className = 'cro-consorcio-label';
    label.textContent = 'Sugest\u00f5es de filtros:';

    var btn = document.createElement('a');
    btn.className = 'cro-consorcio-btn';
    btn.href = CONSORCIO_URL;
    btn.setAttribute('role', 'button');
    btn.innerHTML = '<span class="cro-consorcio-plus">+</span>'
      + '<span>Cons\u00f3rcio</span>';

    btn.addEventListener('click', function () {
      console.log('[CRO Filtro Consorcio] Clique no botao de consorcio');
    });

    wrapper.appendChild(label);
    wrapper.appendChild(btn);

    return wrapper;
  }

  // === Insercao no DOM ===
  function insertButton() {
    var filterHeader = document.querySelector('.filter-header');
    var filterContent = document.querySelector('.filter-header__content');

    if (!filterHeader || !filterContent) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(insertButton, RETRY_INTERVAL);
      } else {
        console.log('[CRO Filtro Consorcio] Elementos de filtro nao encontrados apos ' + MAX_RETRIES + ' tentativas');
      }
      return;
    }

    if (filterHeader.getAttribute(DATA_ATTR) || filterContent.getAttribute(DATA_ATTR)) return;

    injectStyles();

    var consorcioBtn = createConsorcioButton();
    var mobileView = filterContent.querySelector('.filter-header__mobile-view');

    if (mobileView) {
      // Mobile: insere apos o .filter-header como irmao
      filterHeader.parentNode.insertBefore(consorcioBtn, filterHeader.nextSibling);
      filterHeader.setAttribute(DATA_ATTR, 'true');
    } else {
      // Desktop: insere apos o botao Filtrar dentro do .filter-header__content
      var filterBtn = filterContent.querySelector('.bt-c-main-button');
      if (filterBtn) {
        filterBtn.parentNode.insertBefore(consorcioBtn, filterBtn.nextSibling);
      } else {
        filterContent.appendChild(consorcioBtn);
      }
      filterContent.setAttribute(DATA_ATTR, 'true');
    }

    console.log('[CRO Filtro Consorcio] Botao de consorcio inserido com sucesso');
  }

  // === Inicializacao ===
  function init() {
    // Verifica se estamos em uma pagina de categoria relevante
    var path = window.location.pathname;
    if (path.indexOf('/loja/') === -1) {
      console.log('[CRO Filtro Consorcio] Pagina nao e de categoria, script ignorado');
      return;
    }

    insertButton();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
