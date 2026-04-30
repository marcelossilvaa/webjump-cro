(function () {
  'use strict';

  var STYLE_ID = 'at-modal-comparativo-ingressos-style';
  var BTN_ID = 'at-btn-comparar-ingressos';
  var MODAL_ID = 'at-modal-comparar-ingressos';
  var MAX_TENTATIVAS = 30;
  var INTERVALO_POLLING = 800;

  // ===================== CSS =====================
  function injetarEstilos() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      // Botao comparar
      '#' + BTN_ID + ' {',
      '  display: inline-flex; align-items: center; gap: 8px;',
      '  padding: 10px 20px; margin: 12px 0 4px 0;',
      '  background: #026CB6; color: #fff; border: none; border-radius: 6px;',
      '  font-size: 14px; font-weight: 600; cursor: pointer;',
      '  transition: background .2s;',
      '}',
      '#' + BTN_ID + ':hover { background: #01588f; }',
      '#' + BTN_ID + ' svg { flex-shrink: 0; }',

      // Overlay
      '#' + MODAL_ID + '-overlay {',
      '  position: fixed; inset: 0; z-index: 99999;',
      '  background: rgba(0,0,0,.55); display: flex;',
      '  align-items: center; justify-content: center;',
      '  padding: 16px; opacity: 0; transition: opacity .25s;',
      '}',
      '#' + MODAL_ID + '-overlay.at-comp-visible { opacity: 1; }',

      // Modal container
      '#' + MODAL_ID + ' {',
      '  background: #fff; border-radius: 12px; max-width: 960px;',
      '  width: 100%; max-height: 90vh; overflow-y: auto;',
      '  box-shadow: 0 8px 32px rgba(0,0,0,.25);',
      '  position: relative;',
      '}',

      // Header
      '.at-comp-header {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  padding: 20px 24px 16px; border-bottom: 1px solid #e5e5e5;',
      '  position: sticky; top: 0; background: #fff; z-index: 2;',
      '  border-radius: 12px 12px 0 0;',
      '}',
      '.at-comp-header h2 {',
      '  margin: 0; font-size: 18px; color: #041E42; font-weight: 700;',
      '}',
      '.at-comp-close {',
      '  background: none; border: none; cursor: pointer;',
      '  width: 32px; height: 32px; display: flex;',
      '  align-items: center; justify-content: center;',
      '  border-radius: 50%; transition: background .2s;',
      '}',
      '.at-comp-close:hover { background: #f0f0f0; }',

      // Grid de cards
      '.at-comp-grid {',
      '  display: grid; gap: 16px; padding: 20px 24px 24px;',
      '}',

      // Card individual
      '.at-comp-card {',
      '  border: 1px solid #e0e0e0; border-radius: 10px;',
      '  overflow: hidden; display: flex; flex-direction: column;',
      '}',
      '.at-comp-card-img {',
      '  width: 100%; height: 140px; object-fit: cover;',
      '  background: #f5f5f5;',
      '}',
      '.at-comp-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }',
      '.at-comp-card-title {',
      '  font-size: 15px; font-weight: 700; color: #041E42;',
      '  margin: 0 0 12px; line-height: 1.3;',
      '}',

      // Linha de info
      '.at-comp-info-row {',
      '  display: flex; flex-direction: column; gap: 2px;',
      '  padding: 8px 0; border-top: 1px solid #f0f0f0;',
      '}',
      '.at-comp-info-label {',
      '  font-size: 11px; text-transform: uppercase; color: #888;',
      '  font-weight: 600; letter-spacing: .3px;',
      '}',
      '.at-comp-info-value {',
      '  font-size: 13px; color: #333; line-height: 1.4;',
      '}',

      // Preco destaque
      '.at-comp-price {',
      '  font-size: 22px; font-weight: 700; color: #026CB6;',
      '}',
      '.at-comp-price-label {',
      '  font-size: 11px; color: #888; font-weight: 400;',
      '}',

      // Botao ver ingresso
      '.at-comp-ver-btn {',
      '  display: block; width: 100%; margin-top: auto; padding: 12px;',
      '  background: #026CB6; color: #fff; border: none;',
      '  border-radius: 6px; font-size: 14px; font-weight: 600;',
      '  cursor: pointer; text-align: center; transition: background .2s;',
      '}',
      '.at-comp-ver-btn:hover { background: #01588f; }',

      // Rodape aviso
      '.at-comp-footer {',
      '  padding: 0 24px 16px; font-size: 11px; color: #999;',
      '  text-align: center;',
      '}',

      // Responsivo
      '@media (min-width: 600px) {',
      '  .at-comp-grid { grid-template-columns: repeat(2, 1fr); }',
      '}',
      '@media (max-width: 599px) {',
      '  .at-comp-grid { grid-template-columns: 1fr; }',
      '  #' + MODAL_ID + ' { max-height: 95vh; }',
      '  .at-comp-header { padding: 16px; }',
      '  .at-comp-grid { padding: 16px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ===================== EXTRACAO DE DADOS =====================

  function extrairTexto(el, seletor) {
    var found = el.querySelector(seletor);
    return found ? found.textContent.trim() : '';
  }

  function extrairPrecoSelecionado(painel) {
    // Pega o preco do botao de data selecionado (classe que contem "hccGwI" = preco ativo)
    // Fallback: primeiro preco visivel no carrossel
    var precoAtivo = painel.querySelector('[class*="hccGwI"]');
    if (!precoAtivo) {
      precoAtivo = painel.querySelector('[class*="sc-jESRZN"]');
    }
    if (precoAtivo) {
      return precoAtivo.textContent.trim().replace(/\s+/g, ' ');
    }
    return '';
  }

  function extrairMenorPrecoIngressos(painel) {
    var precos = painel.querySelectorAll('[class*="styles__PriceText-sc-z69zeo"]');
    var menor = Infinity;
    var menorTexto = '';
    for (var i = 0; i < precos.length; i++) {
      var texto = precos[i].textContent.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.');
      var valor = parseFloat(texto);
      if (!isNaN(valor) && valor < menor) {
        menor = valor;
        menorTexto = precos[i].textContent.trim().replace(/\s+/g, ' ');
      }
    }
    return menorTexto || extrairPrecoSelecionado(painel);
  }

  function contarIngressos(painel) {
    var cards = painel.querySelectorAll('[class*="styles__Container-sc-z69zeo-0"]');
    return cards.length;
  }

  function extrairDescricaoResumida(painel) {
    var descricoes = painel.querySelectorAll('[class*="DescriptionText-sc-stoyvr-3"]');
    var textos = [];
    for (var i = 0; i < descricoes.length && i < 2; i++) {
      var t = descricoes[i].textContent.trim();
      if (t.length > 120) {
        t = t.substring(0, 120) + '...';
      }
      if (t) textos.push(t);
    }
    return textos.join(' - ') || 'Sem descricao disponivel.';
  }

  function extrairCancelamento(painel) {
    var spans = painel.querySelectorAll('[class*="CancellationPolicyDescription"]');
    var textos = [];
    for (var i = 0; i < spans.length; i++) {
      var t = spans[i].textContent.trim();
      if (t) textos.push(t);
    }
    return textos.join(' ') || 'Nao informado';
  }

  function encontrarPainel(tab, indice) {
    var panelId = tab.getAttribute('aria-controls');

    // Estrategia 1: ID do aria-controls
    if (panelId) {
      var porId = document.getElementById(panelId);
      if (porId) return porId;
    }

    // Estrategia 2: classe react-tabs__tab-panel por indice
    var paineisCls = document.querySelectorAll('.react-tabs__tab-panel');
    if (paineisCls.length > indice) return paineisCls[indice];

    // Estrategia 3: role="tabpanel" por indice
    var tabpanels = document.querySelectorAll('[role="tabpanel"]');
    if (tabpanels.length > indice) return tabpanels[indice];

    // Estrategia 4: wrappers do componente de ingresso por indice (nao hidden)
    var wrappers = document.querySelectorAll('[class*="styles__Wrapper-sc-1cbeuqm-0"]:not([hidden])');
    if (wrappers.length > indice) return wrappers[indice];

    // Estrategia 5: todos os wrappers (incluindo hidden) por indice
    var todosWrappers = document.querySelectorAll('[class*="styles__Wrapper-sc-1cbeuqm-0"]');
    if (todosWrappers.length > indice) return todosWrappers[indice];

    return null;
  }

  function coletarDadosAbas() {
    var tabs = document.querySelectorAll('li.react-tabs__tab');
    var dados = [];

    console.log('[Modal Comparativo] Abas encontradas: ' + tabs.length);

    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var painel = encontrarPainel(tab, i);

      if (!painel) {
        console.log('[Modal Comparativo] Painel nao encontrado para aba ' + i);
        continue;
      }

      var banner = tab.querySelector('span[role="banner"]');
      var titulo = banner
        ? banner.textContent.trim()
            .replace(/^Aba atual\s*/i, '')
            .replace(/\.\s*Selecionar$/i, '')
            .replace(/^Aba\s*/i, '')
        : 'Ingresso ' + (i + 1);

      var imagem = painel.querySelector('img[class*="TicketBanner"]');
      var imgSrc = imagem ? imagem.getAttribute('src') : '';

      dados.push({
        indiceTab: i,
        titulo: titulo,
        imagem: imgSrc,
        cancelamento: extrairCancelamento(painel),
        descricao: extrairDescricaoResumida(painel),
        menorPreco: extrairMenorPrecoIngressos(painel),
        qtdIngressos: contarIngressos(painel)
      });
    }

    console.log('[Modal Comparativo] Dados coletados: ' + dados.length + ' ingressos');
    return dados;
  }

  // ===================== MODAL =====================

  function fecharModal() {
    var overlay = document.getElementById(MODAL_ID + '-overlay');
    if (!overlay) return;
    overlay.classList.remove('at-comp-visible');
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
    document.body.style.overflow = '';
  }

  function navegarParaAba(indice) {
    var tabs = document.querySelectorAll('li.react-tabs__tab');
    if (tabs[indice]) {
      tabs[indice].click();
      fecharModal();
      var painel = document.querySelector('[class*="styles__Wrapper-sc-1cbeuqm-0"]:not([hidden])');
      if (painel) {
        painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function escaparHtml(texto) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
  }

  function abrirModal() {
    // Remove modal anterior se existir
    var existente = document.getElementById(MODAL_ID + '-overlay');
    if (existente && existente.parentNode) {
      existente.parentNode.removeChild(existente);
    }

    var dados = coletarDadosAbas();
    if (dados.length < 2) {
      console.log('[Modal Comparativo] Menos de 2 abas abertas, nao ha o que comparar.');
      return;
    }

    // Criar overlay
    var overlay = document.createElement('div');
    overlay.id = MODAL_ID + '-overlay';

    // Criar modal
    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Comparar ingressos');

    // Header
    var header = document.createElement('div');
    header.className = 'at-comp-header';

    var h2 = document.createElement('h2');
    h2.textContent = 'Comparar Ingressos';
    header.appendChild(h2);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'at-comp-close';
    closeBtn.setAttribute('aria-label', 'Fechar comparativo');
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3.922 21L12 12.923 20.076 21l.923-.923L12.922 12 21 3.923 20.076 3l-8.077 8.077L3.922 3 3 3.923 11.076 12l-8.077 8.077.923.923z" fill="#041E42"/></svg>';
    closeBtn.addEventListener('click', fecharModal);
    header.appendChild(closeBtn);

    modal.appendChild(header);

    // Grid de cards
    var grid = document.createElement('div');
    grid.className = 'at-comp-grid';

    for (var i = 0; i < dados.length; i++) {
      var d = dados[i];
      var card = document.createElement('div');
      card.className = 'at-comp-card';

      // Imagem
      if (d.imagem) {
        var img = document.createElement('img');
        img.className = 'at-comp-card-img';
        img.src = d.imagem;
        img.alt = escaparHtml(d.titulo);
        img.loading = 'lazy';
        card.appendChild(img);
      }

      var body = document.createElement('div');
      body.className = 'at-comp-card-body';

      // Titulo
      var titulo = document.createElement('h3');
      titulo.className = 'at-comp-card-title';
      titulo.textContent = d.titulo;
      body.appendChild(titulo);

      // Preco
      var rowPreco = document.createElement('div');
      rowPreco.className = 'at-comp-info-row';
      var labelPreco = document.createElement('span');
      labelPreco.className = 'at-comp-info-label';
      labelPreco.textContent = 'A partir de';
      rowPreco.appendChild(labelPreco);
      var valorPreco = document.createElement('span');
      valorPreco.className = 'at-comp-price';
      valorPreco.textContent = d.menorPreco || 'Consulte';
      rowPreco.appendChild(valorPreco);
      body.appendChild(rowPreco);

      // Cancelamento
      var rowCancel = document.createElement('div');
      rowCancel.className = 'at-comp-info-row';
      var labelCancel = document.createElement('span');
      labelCancel.className = 'at-comp-info-label';
      labelCancel.textContent = 'Cancelamento';
      rowCancel.appendChild(labelCancel);
      var valorCancel = document.createElement('span');
      valorCancel.className = 'at-comp-info-value';
      valorCancel.textContent = d.cancelamento;
      rowCancel.appendChild(valorCancel);
      body.appendChild(rowCancel);

      // Descricao
      var rowDesc = document.createElement('div');
      rowDesc.className = 'at-comp-info-row';
      var labelDesc = document.createElement('span');
      labelDesc.className = 'at-comp-info-label';
      labelDesc.textContent = 'Descricao';
      rowDesc.appendChild(labelDesc);
      var valorDesc = document.createElement('span');
      valorDesc.className = 'at-comp-info-value';
      valorDesc.textContent = d.descricao;
      rowDesc.appendChild(valorDesc);
      body.appendChild(rowDesc);

      // Qtd opcoes
      if (d.qtdIngressos > 0) {
        var rowQtd = document.createElement('div');
        rowQtd.className = 'at-comp-info-row';
        var labelQtd = document.createElement('span');
        labelQtd.className = 'at-comp-info-label';
        labelQtd.textContent = 'Opcoes disponiveis';
        rowQtd.appendChild(labelQtd);
        var valorQtd = document.createElement('span');
        valorQtd.className = 'at-comp-info-value';
        valorQtd.textContent = d.qtdIngressos + (d.qtdIngressos === 1 ? ' tipo de ingresso' : ' tipos de ingresso');
        rowQtd.appendChild(valorQtd);
        body.appendChild(rowQtd);
      }

      // Botao ver ingresso
      var verBtn = document.createElement('button');
      verBtn.className = 'at-comp-ver-btn';
      verBtn.textContent = 'Ver este ingresso';
      verBtn.setAttribute('data-aba-index', String(d.indiceTab));
      verBtn.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-aba-index'), 10);
        navegarParaAba(idx);
      });
      body.appendChild(verBtn);

      card.appendChild(body);
      grid.appendChild(card);
    }

    modal.appendChild(grid);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'at-comp-footer';
    footer.textContent = 'Precos referentes a data selecionada. Valores podem variar conforme a data escolhida.';
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Fechar ao clicar fora
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fecharModal();
    });

    // Fechar com ESC
    var onEsc = function (e) {
      if (e.key === 'Escape') {
        fecharModal();
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);

    // Animacao de entrada
    requestAnimationFrame(function () {
      overlay.classList.add('at-comp-visible');
    });

    console.log('[Modal Comparativo] Modal aberto com ' + dados.length + ' ingressos.');
  }

  // ===================== BOTAO =====================

  function criarBotaoComparar() {
    if (document.getElementById(BTN_ID)) return true;

    // Posicionar proximo a lista de abas
    var tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return false;

    // Verificar se ha pelo menos 2 abas
    var tabs = tabList.querySelectorAll('li.react-tabs__tab');
    if (tabs.length < 2) return false;

    var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM9 9H5V5h4v4zM20 3h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm-1 6h-4V5h4v4zM10 13H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-1 6H5v-4h4v4zM20 13h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-1 6h-4v-4h4v4z" fill="#fff"/></svg> Comparar ingressos';
    btn.addEventListener('click', abrirModal);

    tabList.parentNode.insertBefore(btn, tabList.nextSibling);
    console.log('[Modal Comparativo] Botao de comparar inserido.');
    return true;
  }

  // ===================== OBSERVER =====================

  function monitorarAbas() {
    var tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    var debounceTimer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        var btn = document.getElementById(BTN_ID);
        var tabs = document.querySelectorAll('li.react-tabs__tab');
        if (tabs.length < 2 && btn) {
          btn.style.display = 'none';
        } else if (tabs.length >= 2 && btn) {
          btn.style.display = '';
        } else if (tabs.length >= 2 && !btn) {
          criarBotaoComparar();
        }
      }, 300);
    });

    observer.observe(tabList, { childList: true, subtree: true });
  }

  // ===================== INIT =====================

  function init() {
    injetarEstilos();
    var tentativas = 0;

    var polling = setInterval(function () {
      tentativas++;
      if (tentativas > MAX_TENTATIVAS) {
        clearInterval(polling);
        console.log('[Modal Comparativo] Abas nao encontradas apos ' + MAX_TENTATIVAS + ' tentativas.');
        return;
      }

      var sucesso = criarBotaoComparar();
      if (sucesso) {
        clearInterval(polling);
        monitorarAbas();
        console.log('[Modal Comparativo] Inicializado com sucesso.');
      }
    }, INTERVALO_POLLING);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();