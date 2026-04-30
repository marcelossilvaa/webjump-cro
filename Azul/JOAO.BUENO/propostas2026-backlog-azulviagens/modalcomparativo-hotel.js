(function () {
  'use strict';

  var STYLE_ID = 'at-modal-comparativo-hotel-style';
  var BTN_ID = 'at-btn-comparar-hoteis';
  var MODAL_ID = 'at-modal-comparar-hoteis';
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
      '  background: #fff; border-radius: 12px; max-width: 1060px;',
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
      '  width: 100%; height: 150px; object-fit: cover;',
      '  background: #f5f5f5;',
      '}',
      '.at-comp-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }',
      '.at-comp-card-title {',
      '  font-size: 15px; font-weight: 700; color: #041E42;',
      '  margin: 0 0 4px; line-height: 1.3;',
      '}',
      '.at-comp-stars {',
      '  display: flex; gap: 2px; margin-bottom: 10px;',
      '}',
      '.at-comp-stars svg { width: 14px; height: 14px; fill: #F5A623; }',

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

      // Tags
      '.at-comp-tags {',
      '  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;',
      '}',
      '.at-comp-tag {',
      '  display: inline-block; padding: 3px 8px; border-radius: 4px;',
      '  font-size: 11px; font-weight: 600;',
      '}',
      '.at-comp-tag--blue { background: #E8F4FD; color: #014E84; }',
      '.at-comp-tag--red { background: #FDE8E8; color: #B82C25; }',
      '.at-comp-tag--green { background: #E8F8F0; color: #006450; }',

      // Botao ver hotel
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
      '@media (min-width: 700px) {',
      '  .at-comp-grid { grid-template-columns: repeat(2, 1fr); }',
      '}',
      '@media (min-width: 1000px) {',
      '  .at-comp-grid { grid-template-columns: repeat(3, 1fr); }',
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

  function obterNomesHoteisAbertos() {
    var tabList = document.querySelector('[data-testid="hotel-select-tab-list"]');
    if (!tabList) tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return [];

    var tabs = tabList.querySelectorAll('li.react-tabs__tab');
    var nomes = [];

    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var span = tab.querySelector('span[role="banner"]');
      if (!span) {
        // Pular aba "Todos os hoteis" (nao tem role="banner")
        var textoAba = tab.textContent.trim();
        if (textoAba.indexOf('Todos os') > -1) continue;
        // Se nao tem banner mas tem texto, pode ser aba simples
        continue;
      }
      var nome = span.textContent.trim()
        .replace(/^Aba atual\s*/i, '')
        .replace(/\.\s*Selecionar$/i, '')
        .replace(/^Aba\s*/i, '');
      if (nome) {
        nomes.push({ nome: nome, indiceTab: i });
      }
    }
    return nomes;
  }

  function encontrarCardPorNome(nome) {
    var cards = document.querySelectorAll('[class*="HotelCardWrapper-sc-16a2dz4"]');
    for (var i = 0; i < cards.length; i++) {
      var h3 = cards[i].querySelector('[class*="HotelName-sc-1ft5opc"]');
      if (h3 && h3.textContent.trim() === nome) {
        return cards[i];
      }
    }
    // Fallback: busca parcial
    for (var j = 0; j < cards.length; j++) {
      var h3b = cards[j].querySelector('[class*="HotelName-sc-1ft5opc"]');
      if (h3b && h3b.textContent.trim().indexOf(nome) > -1) {
        return cards[j];
      }
    }
    return null;
  }

  function contarEstrelas(card) {
    var stars = card.querySelectorAll('[data-testid="StarIcon"]');
    return stars.length;
  }

  function extrairImagem(card) {
    var img = card.querySelector('[class*="HotelCardSliderstyles__StyledSlider"] img');
    if (!img) {
      img = card.querySelector('.slick-slide img');
    }
    return img ? img.getAttribute('src') : '';
  }

  function extrairLocalizacao(card) {
    var loc = card.querySelector('[class*="NeighboorhoodDistance-sc-1ft5opc"]');
    if (!loc) return '';
    return loc.textContent.trim().replace(/Ver no mapa$/i, '').trim();
  }

  function extrairPreco(card) {
    var moeda = card.querySelector('[class*="Currency-sc-10ygdxz"]');
    var inteiro = card.querySelector('[class*="Integer-sc-10ygdxz"]');
    var centavos = card.querySelector('[class*="Cents-sc-10ygdxz"]');
    if (!inteiro) return '';
    var texto = '';
    if (moeda) texto += moeda.textContent.trim() + ' ';
    texto += inteiro.textContent.trim();
    if (centavos) texto += centavos.textContent.trim();
    return texto;
  }

  function extrairDiarias(card) {
    var el = card.querySelector('[class*="DailyText-sc-10ygdxz"]');
    return el ? el.textContent.trim() : '';
  }

  function extrairParcelamento(card) {
    var el = card.querySelector('[class*="PriceInstallments-sc-10ygdxz"]');
    if (!el) return '';
    var spans = el.querySelectorAll('span');
    var textos = [];
    for (var i = 0; i < spans.length; i++) {
      var t = spans[i].textContent.trim();
      if (t) textos.push(t);
    }
    return textos.join(' - ');
  }

  function extrairComodidades(card) {
    var itens = card.querySelectorAll('[class*="Amenitie-sc-sd58gz"] [class*="TextWrapper-sc-sd58gz"] span');
    var lista = [];
    for (var i = 0; i < itens.length; i++) {
      var t = itens[i].textContent.trim();
      if (t && t.indexOf('+ ') !== 0) lista.push(t);
    }
    return lista;
  }

  function extrairTags(card) {
    var tags = [];
    // Carrossel de info tags
    var infoTags = card.querySelectorAll('[class*="InfoTagWrapper-sc-b1bkke"] [class*="RightSideWrapper"] span');
    for (var i = 0; i < infoTags.length; i++) {
      var t = infoTags[i].textContent.trim();
      if (t) tags.push(t);
    }
    // Tag "Ultimos quartos" (cor vermelha)
    var urgency = card.querySelectorAll('[color="#B82C25"]');
    for (var j = 0; j < urgency.length; j++) {
      var u = urgency[j].textContent.trim();
      if (u && tags.indexOf(u) === -1) tags.push(u);
    }
    return tags;
  }

  function extrairPontos(card) {
    var el = card.querySelector('[class*="AccrualText-sc-10ygdxz"]');
    if (!el) return '';
    return el.textContent.trim().replace(/\s+/g, ' ');
  }

  function coletarDadosHoteis() {
    var abasAbertas = obterNomesHoteisAbertos();
    var dados = [];

    console.log('[Modal Comparativo Hotel] Abas de hoteis abertas: ' + abasAbertas.length);

    for (var i = 0; i < abasAbertas.length; i++) {
      var info = abasAbertas[i];
      var card = encontrarCardPorNome(info.nome);

      if (!card) {
        console.log('[Modal Comparativo Hotel] Card nao encontrado para: ' + info.nome);
        continue;
      }

      dados.push({
        indiceTab: info.indiceTab,
        nome: info.nome,
        estrelas: contarEstrelas(card),
        imagem: extrairImagem(card),
        localizacao: extrairLocalizacao(card),
        preco: extrairPreco(card),
        diarias: extrairDiarias(card),
        parcelamento: extrairParcelamento(card),
        comodidades: extrairComodidades(card),
        tags: extrairTags(card),
        pontos: extrairPontos(card)
      });
    }

    console.log('[Modal Comparativo Hotel] Dados coletados: ' + dados.length + ' hoteis');
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
    var tabList = document.querySelector('[data-testid="hotel-select-tab-list"]');
    if (!tabList) tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    var tabs = tabList.querySelectorAll('li.react-tabs__tab');
    if (tabs[indice]) {
      tabs[indice].click();
      fecharModal();
      setTimeout(function () {
        var detalhe = document.querySelector('[class*="HotelDetailWrapper"]');
        if (detalhe) {
          detalhe.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  function criarEstrelas(qtd) {
    var container = document.createElement('div');
    container.className = 'at-comp-stars';
    for (var i = 0; i < qtd; i++) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '14');
      svg.setAttribute('height', '14');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z');
      svg.appendChild(path);
      container.appendChild(svg);
    }
    return container;
  }

  function classificarTag(texto) {
    var lower = texto.toLowerCase();
    if (lower.indexOf('ltimos') > -1 || lower.indexOf('restam') > -1) return 'red';
    if (lower.indexOf('oferta') > -1) return 'green';
    return 'blue';
  }

  function abrirModal() {
    // Remove modal anterior se existir
    var existente = document.getElementById(MODAL_ID + '-overlay');
    if (existente && existente.parentNode) {
      existente.parentNode.removeChild(existente);
    }

    var dados = coletarDadosHoteis();
    if (dados.length < 2) {
      console.log('[Modal Comparativo Hotel] Menos de 2 hoteis abertos, nao ha o que comparar.');
      return;
    }

    // Criar overlay
    var overlay = document.createElement('div');
    overlay.id = MODAL_ID + '-overlay';

    // Criar modal
    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Comparar hoteis');

    // Header
    var header = document.createElement('div');
    header.className = 'at-comp-header';

    var h2 = document.createElement('h2');
    h2.textContent = 'Comparar Hoteis (' + dados.length + ')';
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
        img.alt = d.nome;
        img.loading = 'lazy';
        card.appendChild(img);
      }

      var body = document.createElement('div');
      body.className = 'at-comp-card-body';

      // Titulo
      var titulo = document.createElement('h3');
      titulo.className = 'at-comp-card-title';
      titulo.textContent = d.nome;
      body.appendChild(titulo);

      // Estrelas
      if (d.estrelas > 0) {
        body.appendChild(criarEstrelas(d.estrelas));
      }

      // Localizacao
      if (d.localizacao) {
        var rowLoc = document.createElement('div');
        rowLoc.className = 'at-comp-info-row';
        var labelLoc = document.createElement('span');
        labelLoc.className = 'at-comp-info-label';
        labelLoc.textContent = 'Localizacao';
        rowLoc.appendChild(labelLoc);
        var valorLoc = document.createElement('span');
        valorLoc.className = 'at-comp-info-value';
        valorLoc.textContent = d.localizacao;
        rowLoc.appendChild(valorLoc);
        body.appendChild(rowLoc);
      }

      // Preco
      var rowPreco = document.createElement('div');
      rowPreco.className = 'at-comp-info-row';
      var labelPreco = document.createElement('span');
      labelPreco.className = 'at-comp-info-label';
      labelPreco.textContent = d.diarias ? d.diarias + ' por' : 'Preco total';
      rowPreco.appendChild(labelPreco);
      var valorPreco = document.createElement('span');
      valorPreco.className = 'at-comp-price';
      valorPreco.textContent = d.preco || 'Consulte';
      rowPreco.appendChild(valorPreco);
      if (d.parcelamento) {
        var parcSpan = document.createElement('span');
        parcSpan.className = 'at-comp-info-value';
        parcSpan.textContent = d.parcelamento;
        rowPreco.appendChild(parcSpan);
      }
      body.appendChild(rowPreco);

      // Comodidades
      if (d.comodidades.length > 0) {
        var rowCom = document.createElement('div');
        rowCom.className = 'at-comp-info-row';
        var labelCom = document.createElement('span');
        labelCom.className = 'at-comp-info-label';
        labelCom.textContent = 'Comodidades';
        rowCom.appendChild(labelCom);
        var valorCom = document.createElement('span');
        valorCom.className = 'at-comp-info-value';
        valorCom.textContent = d.comodidades.join(', ');
        rowCom.appendChild(valorCom);
        body.appendChild(rowCom);
      }

      // Pontos
      if (d.pontos) {
        var rowPts = document.createElement('div');
        rowPts.className = 'at-comp-info-row';
        var labelPts = document.createElement('span');
        labelPts.className = 'at-comp-info-label';
        labelPts.textContent = 'Pontos Azul';
        rowPts.appendChild(labelPts);
        var valorPts = document.createElement('span');
        valorPts.className = 'at-comp-info-value';
        valorPts.textContent = d.pontos;
        rowPts.appendChild(valorPts);
        body.appendChild(rowPts);
      }

      // Tags
      if (d.tags.length > 0) {
        var tagsContainer = document.createElement('div');
        tagsContainer.className = 'at-comp-tags';
        for (var t = 0; t < d.tags.length; t++) {
          var tag = document.createElement('span');
          tag.className = 'at-comp-tag at-comp-tag--' + classificarTag(d.tags[t]);
          tag.textContent = d.tags[t];
          tagsContainer.appendChild(tag);
        }
        body.appendChild(tagsContainer);
      }

      // Botao ver hotel
      var verBtn = document.createElement('button');
      verBtn.className = 'at-comp-ver-btn';
      verBtn.textContent = 'Ver detalhes do hotel';
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
    footer.textContent = 'Precos referentes ao periodo selecionado. Valores podem variar conforme as datas escolhidas.';
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

    console.log('[Modal Comparativo Hotel] Modal aberto com ' + dados.length + ' hoteis.');
  }

  // ===================== BOTAO =====================

  function contarAbasHoteis() {
    var tabList = document.querySelector('[data-testid="hotel-select-tab-list"]');
    if (!tabList) tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return 0;

    var tabs = tabList.querySelectorAll('li.react-tabs__tab');
    var count = 0;
    for (var i = 0; i < tabs.length; i++) {
      var banner = tabs[i].querySelector('span[role="banner"]');
      if (banner) count++;
    }
    return count;
  }

  function criarBotaoComparar() {
    if (document.getElementById(BTN_ID)) return true;

    var tabList = document.querySelector('[data-testid="hotel-select-tab-list"]');
    if (!tabList) tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return false;

    // Precisa de pelo menos 2 hoteis abertos (nao conta "Todos os hoteis")
    if (contarAbasHoteis() < 2) return false;

    var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM9 9H5V5h4v4zM20 3h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm-1 6h-4V5h4v4zM10 13H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-1 6H5v-4h4v4zM20 13h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-1 6h-4v-4h4v4z" fill="#fff"/></svg> Comparar hoteis';
    btn.addEventListener('click', abrirModal);

    // Inserir apos o wrapper da tab list
    var wrapper = tabList.closest('[class*="TabListWrapper"]');
    var insertAfter = wrapper || tabList;
    insertAfter.parentNode.insertBefore(btn, insertAfter.nextSibling);

    console.log('[Modal Comparativo Hotel] Botao de comparar inserido.');
    return true;
  }

  // ===================== OBSERVER =====================

  function monitorarAbas() {
    var tabList = document.querySelector('[data-testid="hotel-select-tab-list"]');
    if (!tabList) tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    var debounceTimer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        var btn = document.getElementById(BTN_ID);
        var qtdAbas = contarAbasHoteis();
        if (qtdAbas < 2 && btn) {
          btn.style.display = 'none';
        } else if (qtdAbas >= 2 && btn) {
          btn.style.display = '';
        } else if (qtdAbas >= 2 && !btn) {
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
        console.log('[Modal Comparativo Hotel] Abas nao encontradas apos ' + MAX_TENTATIVAS + ' tentativas.');
        return;
      }

      var sucesso = criarBotaoComparar();
      if (sucesso) {
        clearInterval(polling);
        monitorarAbas();
        console.log('[Modal Comparativo Hotel] Inicializado com sucesso.');
      }
    }, INTERVALO_POLLING);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();