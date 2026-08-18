(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_CompararCartoes';
  const STYLE_ID = 'at-comparar-cartoes-style';
  const OVERLAY_ID = 'at-comparar-cartoes-overlay';
  const MODAL_ID = 'at-comparar-cartoes-modal';
  const DATA_VIEW = 'data-at-comparar-cartoes-view';
  const DATA_CTA = 'data-at-comparar-cartoes-cta';
  const CTA_IMG_FRAGMENT = 'cta-comparar-todos-beneficios';
  const TERMS_URL = 'https://www.voeazul.com.br/br/pt/programa-fidelidade/azul-itau';
  const CONTEXT = 'lp_ofertas';

  let isProcessing = false;
  let debounceTimer = null;
  let accordionTimer = null;
  let observerStarted = false;
  let lastFocused = null;
  let viewTracked = false;

  if (window[EXPERIMENT_NAME]) {
    return;
  }
  window[EXPERIMENT_NAME] = true;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking CompararCartoes] Parametro ausente para evento analytics.');
      return;
    }

    const labelEvent = EXPERIMENT_NAME + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking CompararCartoes] Evento disparado:', labelEvent);

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
      '#' + OVERLAY_ID + '{',
      'position:fixed;inset:0;z-index:99999;',
      'display:flex;align-items:center;justify-content:center;',
      'padding:24px 16px;',
      'background:rgba(4,30,66,0.55);',
      'opacity:0;visibility:hidden;pointer-events:none;',
      'transition:opacity .25s ease,visibility .25s ease;',
      '}',
      '#' + OVERLAY_ID + '.at-cc-visible{',
      'opacity:1;visibility:visible;pointer-events:auto;',
      '}',
      '#' + MODAL_ID + '{',
      'box-sizing:border-box;',
      'display:flex;flex-direction:column;align-items:stretch;',
      'width:978px;max-width:100%;',
      'max-height:calc(100vh - 48px);',
      'max-height:calc(100dvh - 48px);',
      'background:#FFFFFF;',
      'border:1px solid #E5E7EB;',
      'box-shadow:0 16px 40px -12px rgba(0,0,0,0.149),0 1px 2px -1px rgba(0,0,0,0.102);',
      'border-radius:16px;',
      'overflow:hidden;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      '-webkit-text-size-adjust:100%;',
      'text-size-adjust:100%;',
      'transform:translateY(8px);',
      'transition:transform .25s ease;',
      '}',
      '#' + OVERLAY_ID + '.at-cc-visible #' + MODAL_ID + '{',
      'transform:translateY(0);',
      '}',
      '.at-cc-header{',
      'box-sizing:border-box;',
      'display:flex;flex-direction:row;justify-content:space-between;align-items:center;',
      'padding:20px 16px 20px 24px;',
      'min-height:72px;',
      'border-bottom:1px solid #E5E7EB;',
      'background:#FFFFFF;',
      'flex:none;',
      '}',
      '.at-cc-header h2{',
      'margin:0;',
      'padding-right:8px;',
      'flex:1;min-width:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-style:normal;font-weight:700;',
      'font-size:30px;line-height:36px;',
      'color:#041E42;',
      '}',
      '.at-cc-close{',
      'box-sizing:border-box;',
      'width:32px;height:32px;padding:0;',
      'display:inline-flex;align-items:center;justify-content:center;',
      'background:transparent;border:none;border-radius:8px;',
      'cursor:pointer;flex:none;',
      '}',
      '.at-cc-close:hover{background:#F3F4F6;}',
      '.at-cc-content{',
      'position:relative;',
      'box-sizing:border-box;',
      'display:flex;flex-direction:column;align-items:stretch;',
      'padding:24px;',
      'overflow:auto;',
      'flex:1 1 auto;',
      '-webkit-overflow-scrolling:touch;',
      'overscroll-behavior:contain;',
      '}',
      '.at-cc-content::-webkit-scrollbar{width:4px;}',
      '.at-cc-content::-webkit-scrollbar-track{',
      'background:#E5E7EB;border-radius:2px;',
      '}',
      '.at-cc-content::-webkit-scrollbar-thumb{',
      'background:#9CA3AF;border-radius:2px;',
      '}',
      '.at-cc-table-wrap{',
      'box-sizing:border-box;',
      'width:100%;max-width:1240px;',
      'padding-top:16px;',
      '}',
      '.at-cc-table{',
      'box-sizing:border-box;',
      'display:flex;flex-direction:column;align-items:stretch;',
      'width:100%;min-width:0;',
      'background:#FFFFFF;',
      'border:1px solid #E5E7EB;',
      'box-shadow:0 1px 3px rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1);',
      'border-radius:16px;',
      'overflow:hidden;',
      '}',
      '.at-cc-row{',
      'box-sizing:border-box;',
      'display:grid;',
      'grid-template-columns:230px minmax(0,1fr) minmax(0,1fr);',
      'align-items:stretch;',
      'border-top:1px solid #F3F4F6;',
      '}',
      '.at-cc-row:first-child{border-top:none;}',
      '.at-cc-row--head{',
      'background:linear-gradient(135deg,#041E42 0%,#0061A0 100%);',
      'min-height:107px;',
      'position:sticky;top:0;z-index:2;',
      '}',
      '.at-cc-acc-body{display:contents;}',
      '.at-cc-acc-icon{display:none;}',
      'button.at-cc-cell--label{',
      'appearance:none;-webkit-appearance:none;',
      'width:100%;margin:0;border:0;',
      'font:inherit;color:inherit;text-align:left;',
      'cursor:default;',
      '}',
      '.at-cc-cell{',
      'box-sizing:border-box;',
      'display:flex;flex-direction:row;align-items:flex-start;',
      'padding:16px 24px;',
      'border-left:1px solid #F3F4F6;',
      'min-width:0;',
      'overflow-wrap:break-word;',
      'word-wrap:break-word;',
      '}',
      '.at-cc-cell:first-child{border-left:none;}',
      '.at-cc-cell--label{',
      'position:sticky;left:0;z-index:1;',
      'background:#F3F8FC;',
      '}',
      '.at-cc-row--head .at-cc-cell--label{',
      'background:#041E42;z-index:3;',
      '}',
      '.at-cc-row--head .at-cc-cell{',
      'align-items:center;',
      'border-left:1px solid rgba(255,255,255,0.15);',
      '}',
      '.at-cc-row--head .at-cc-cell:first-child{border-left:none;}',
      '.at-cc-cell--featured{background:#E8F4FC;}',
      '.at-cc-row--head .at-cc-cell--featured{background:rgba(0,139,196,0.25);}',
      '.at-cc-label{',
      'margin:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-style:normal;font-weight:700;',
      'font-size:16px;line-height:19px;',
      'color:#041E42;',
      '}',
      '.at-cc-row--head .at-cc-label{',
      'font-weight:700;font-size:20px;line-height:20px;',
      'letter-spacing:0.7px;',
      'color:rgba(255,255,255,0.85);',
      '}',
      '.at-cc-value{',
      'margin:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-style:normal;font-weight:400;',
      'font-size:16px;line-height:20px;',
      'color:#364153;',
      '}',
      '.at-cc-value--strong{',
      'font-weight:500;color:#041E42;',
      '}',
      '.at-cc-free,.at-cc-yes{',
      'margin:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:500;font-size:16px;line-height:20px;',
      'color:#008058;',
      '}',
      '.at-cc-dash{',
      'margin:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:400;font-size:14px;line-height:20px;',
      'color:#9CA3AF;',
      '}',
      '.at-cc-kicker{',
      'margin:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-style:normal;font-weight:500;',
      'font-size:16px;line-height:16px;',
      'letter-spacing:0.3px;text-transform:uppercase;',
      'color:#6A7282;',
      '}',
      '.at-cc-kicker + .at-cc-list,.at-cc-list + .at-cc-kicker{margin-top:8px;}',
      '.at-cc-list{',
      'margin:8px 0 0;padding:0;list-style:none;',
      '}',
      '.at-cc-list li{',
      'position:relative;',
      'padding-left:12px;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:400;font-size:16px;line-height:20px;',
      'color:#364153;',
      '}',
      '.at-cc-list li + li{margin-top:4px;}',
      '.at-cc-list li:before{',
      'content:"•";',
      'position:absolute;left:0;top:0;',
      'color:#364153;',
      '}',
      '.at-cc-card-head{',
      'display:flex;flex-direction:row;align-items:center;justify-content:center;',
      'gap:12px;width:100%;',
      '}',
      '.at-cc-card-art{',
      'flex:none;width:85px;height:75px;',
      'object-fit:contain;display:block;',
      '}',
      '.at-cc-card-copy{',
      'display:flex;flex-direction:column;align-items:center;',
      'min-width:0;',
      '}',
      '.at-cc-card-name{',
      'margin:0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:700;font-size:20px;line-height:24px;',
      'text-align:center;letter-spacing:0.4px;',
      'color:#FFFFFF;',
      '}',
      '.at-cc-card-brand{',
      'margin:2px 0 0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:400;font-size:16px;line-height:16px;',
      'text-align:center;',
      'color:rgba(255,255,255,0.6);',
      '}',
      '.at-cc-footnote{',
      'box-sizing:border-box;',
      'display:flex;justify-content:center;',
      'margin:0;padding:24px 0 0;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:400;font-size:16px;line-height:16px;',
      'text-align:center;color:#9CA3AF;',
      '}',
      '.at-cc-footnote a{color:#9CA3AF;text-decoration:underline;}',
      'img[src*="' + CTA_IMG_FRAGMENT + '"],img[srcset*="' + CTA_IMG_FRAGMENT + '"]{cursor:pointer;}',
      'body.at-cc-locked{overflow:hidden;}',
      '@media (max-width:1024px){',
      '#' + OVERLAY_ID + '{padding:16px;}',
      '.at-cc-header{padding:16px 16px 16px 20px;min-height:64px;}',
      '.at-cc-header h2{font-size:24px;line-height:28px;}',
      '.at-cc-content{padding:16px;}',
      '.at-cc-table-wrap{padding-top:8px;}',
      '.at-cc-row{grid-template-columns:minmax(140px,0.7fr) minmax(0,1fr) minmax(0,1fr);}',
      '.at-cc-cell{padding:14px 16px;}',
      '.at-cc-card-name{font-size:16px;line-height:20px;}',
      '.at-cc-card-brand{font-size:13px;}',
      '}',
      '@media (max-width:767px){',
      '#' + OVERLAY_ID + '{padding:0;align-items:stretch;justify-content:flex-end;}',
      '#' + MODAL_ID + '{',
      'width:100%;',
      'max-width:100%;',
      'height:100%;',
      'max-height:100vh;',
      'max-height:100dvh;',
      'border-radius:16px 16px 0 0;',
      '}',
      '.at-cc-header{',
      'padding:12px;',
      'min-height:56px;',
      'padding-top:max(12px, env(safe-area-inset-top));',
      '}',
      '.at-cc-header h2{font-size:20px;line-height:20px;}',
      '.at-cc-close{width:32px;height:32px;}',
      '.at-cc-content{',
      'padding:12px 12px max(16px, env(safe-area-inset-bottom));',
      '}',
      '.at-cc-table-wrap{padding-top:0;}',
      '.at-cc-table{',
      'display:flex;flex-direction:column;gap:8px;',
      'padding:8px 0;',
      'border:0;box-shadow:none;background:transparent;border-radius:0;overflow:visible;',
      '}',
      '.at-cc-row{',
      'display:flex;flex-direction:column;',
      'width:100%;',
      'border:1px solid #E5E7EB;',
      'border-radius:8px;',
      'overflow:hidden;',
      'background:#FFFFFF;',
      '}',
      '.at-cc-row:first-child{border-top:1px solid #E5E7EB;}',
      '.at-cc-row--head{display:none;}',
      '.at-cc-cell--label{',
      'position:static;',
      'width:100%;',
      'padding:10px 12px;',
      'background:#041E42;',
      'border-left:none;',
      'border-bottom:1px solid #F3F4F6;',
      '}',
      '.at-cc-cell.at-cc-cell--label{background:#041E42;}',
      '.at-cc-label{',
      'color:#FFFFFF;font-weight:500;font-size:12px;line-height:16px;',
      '}',
      '.at-cc-acc-icon{',
      'display:block;flex:none;',
      'width:8px;height:8px;',
      'border-right:2px solid #FFFFFF;',
      'border-bottom:2px solid #FFFFFF;',
      'transform:rotate(45deg);',
      'transition:transform .2s ease;',
      '}',
      '.at-cc-row.is-open .at-cc-acc-icon{transform:rotate(-135deg);}',
      '.at-cc-acc-body{display:none;}',
      '.at-cc-row.is-open .at-cc-acc-body{',
      'display:flex;flex-direction:column;width:100%;',
      '}',
      '.at-cc-cell{',
      'flex-direction:column;align-items:flex-start;',
      'width:100%;padding:12px;gap:4px;',
      'border-left:none;',
      '}',
      'button.at-cc-cell--label{',
      'display:flex;',
      'flex-direction:row;',
      'align-items:center;',
      'justify-content:space-between;',
      'gap:8px;',
      'width:100%;',
      'cursor:pointer;',
      '}',
      '.at-cc-cell--platinum{',
      'background:#FFFFFF;',
      'border-bottom:1px solid #F3F4F6;',
      '}',
      '.at-cc-cell--featured{',
      'background:#F0F9FF;',
      'border-left:none;',
      '}',
      '.at-cc-cell--platinum::before,',
      '.at-cc-cell--featured::before{',
      'display:block;',
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;',
      'font-weight:500;font-size:10px;line-height:16px;',
      'text-transform:uppercase;color:#6A7282;',
      '}',
      '.at-cc-cell--platinum::before{content:"Platinum";}',
      '.at-cc-cell--featured::before{content:"Skyline / Infinite";}',
      '.at-cc-row--head .at-cc-cell--platinum::before,',
      '.at-cc-row--head .at-cc-cell--featured::before{content:none;display:none;}',
      '.at-cc-value,.at-cc-free,.at-cc-yes{font-size:12px;line-height:20px;}',
      '.at-cc-dash{font-size:12px;line-height:20px;}',
      '.at-cc-kicker{font-size:10px;line-height:16px;}',
      '.at-cc-list{margin-top:4px;}',
      '.at-cc-list li{font-size:12px;line-height:20px;}',
      '.at-cc-footnote{',
      'padding:16px 4px 4px;',
      'font-size:12px;line-height:16px;',
      '}',
      '}',
      '@media (max-width:380px){',
      '.at-cc-header h2{font-size:16px;line-height:20px;}',
      '.at-cc-cell{padding:8px 10px;}',
      '.at-cc-card-art{width:60px;height:52px;}',
      '.at-cc-value,.at-cc-free,.at-cc-yes,.at-cc-list li{font-size:12px;line-height:16px;}',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);
  }

  function getCardImage(src, alt) {
    return (
      '<img class="at-cc-card-art" src="' +
      src +
      '" width="85" height="75" alt="' +
      alt +
      '" loading="lazy">'
    );
  }

  function cell(html, extraClass) {
    const cls = extraClass ? 'at-cc-cell ' + extraClass : 'at-cc-cell';
    return '<div class="' + cls + '">' + html + '</div>';
  }

  function row(labelHtml, platinumHtml, featuredHtml, extraClass) {
    const platinum = cell(platinumHtml, 'at-cc-cell--platinum');
    const featured = cell(featuredHtml, 'at-cc-cell--featured');
    const isHead = extraClass && extraClass.indexOf('head') !== -1;

    if (isHead) {
      return (
        '<div class="at-cc-row at-cc-row--head">' +
        cell(labelHtml, 'at-cc-cell--label') +
        '<div class="at-cc-acc-body">' +
        platinum +
        featured +
        '</div>' +
        '</div>'
      );
    }

    return (
      '<div class="at-cc-row" data-at-accordion="true">' +
      '<button type="button" class="at-cc-cell at-cc-cell--label" aria-expanded="false">' +
      labelHtml +
      '<span class="at-cc-acc-icon" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="at-cc-acc-body">' +
      platinum +
      featured +
      '</div>' +
      '</div>'
    );
  }

  function pointsHtml(groups) {
    let html = '<div>';
    for (let i = 0; i < groups.length; i++) {
      html += '<p class="at-cc-kicker">' + groups[i].title + '</p>';
      html += '<ul class="at-cc-list">';
      for (let j = 0; j < groups[i].items.length; j++) {
        html += '<li>' + groups[i].items[j] + '</li>';
      }
      html += '</ul>';
    }
    html += '</div>';
    return html;
  }

  function getModalHtml() {
    const platinumCard =
      '<div class="at-cc-card-head">' +
      getCardImage('https://i.imgur.com/Lcr8r5G.png', 'Cartão Azul Itaú Platinum') +
      '<div class="at-cc-card-copy">' +
      '<p class="at-cc-card-name">Platinum</p>' +
      '<p class="at-cc-card-brand">Mastercard/ Visa</p>' +
      '</div>' +
      '</div>';

    const skylineCard =
      '<div class="at-cc-card-head">' +
      getCardImage('https://i.imgur.com/CifprPH.png', 'Cartão Azul Itaú Mastercard Skyline e Visa Infinite') +
      '<div class="at-cc-card-copy">' +
      '<p class="at-cc-card-name">Mastercard Skyline/<br>Visa Infinite</p>' +
      '</div>' +
      '</div>';

    const discountText =
      '<p class="at-cc-value">Compra de passagem aérea, Azul Viagens (hotel, aluguel de carro, pacotes, passeios, ingressos), Clube Azul, Shopping Azul, Azul Cargo, compra/renovação/transferência de pontos.</p>';

    const clubText =
      '<p class="at-cc-value">Ganha 50% a mais de pontos na fatura (já inclui a pontuação diferenciada acima).</p>';

    return (
      '<div class="at-cc-header">' +
      '<h2 id="at-cc-title">Compare os cartões</h2>' +
      '<button type="button" class="at-cc-close" aria-label="Fechar">' +
      '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M10 10L22 22M22 10L10 22" stroke="#595959" stroke-width="1.75" stroke-linecap="round"/>' +
      '</svg>' +
      '</button>' +
      '</div>' +
      '<div class="at-cc-content">' +
      '<div class="at-cc-table-wrap">' +
      '<div class="at-cc-table">' +
      row('<p class="at-cc-label">Benefícios</p>', platinumCard, skylineCard, 'at-cc-row--head') +
      row(
        '<p class="at-cc-label">Pontos por dólar gasto</p>',
        pointsHtml([
          {
            title: 'Sem clube',
            items: [
              'Nacionais e Internacionais: 2,2 ptos/dólar',
              'Compras na Azul: 2,6 ptos/dólar',
            ],
          },
          {
            title: 'Assinantes Clube Azul',
            items: [
              'Nacionais e Internacionais: 3,3 ptos/dólar',
              'Compras na Azul: 3,9 ptos/dólar',
            ],
          },
        ]),
        pointsHtml([
          {
            title: 'Sem clube',
            items: ['Nacionais: 3,0 ptos/dólar', 'Internacionais: 3,5 ptos/dólar'],
          },
          {
            title: 'Assinantes Clube Azul',
            items: ['Nacionais: 4,5 ptos/dólar', 'Internacionais: 5,25 ptos/dólar'],
          },
        ])
      ) +
      row('<p class="at-cc-label">10% de Desconto na Azul</p>', discountText, discountText) +
      row(
        '<p class="at-cc-label">Nível Fidelidade (automático)</p>',
        '<p class="at-cc-value at-cc-value--strong">Safira</p>',
        '<p class="at-cc-value at-cc-value--strong">Diamante</p>'
      ) +
      row(
        '<p class="at-cc-label">Bagagem (Nacional / EUA / Europa)</p>',
        '<p class="at-cc-value">2 bagagens de até 23 kg</p>',
        '<p class="at-cc-value">3 bagagens de até 23 kg</p>'
      ) +
      row(
        '<p class="at-cc-label">Bagagem (América do Sul)</p>',
        '<p class="at-cc-value">1 bagagem de até 23 kg</p>',
        '<p class="at-cc-value">2 bagagens de até 23 kg</p>'
      ) +
      row('<p class="at-cc-label">Assinantes Clube Azul</p>', clubText, clubText) +
      row(
        '<p class="at-cc-label">Pontos Bônus na Aquisição</p>',
        '<p class="at-cc-value">Ganhe 16 mil pontos bônus mantendo o gasto médio de R$ 4 mil nas 3 primeiras faturas.</p>',
        '<p class="at-cc-value">Ganhe 40 mil pontos bônus mantendo o gasto médio de R$ 20 mil nas 3 primeiras faturas.</p>'
      ) +
      row(
        '<p class="at-cc-label">Companion Pass</p>',
        '<p class="at-cc-dash">—</p>',
        '<p class="at-cc-value">Ao atingir 50 mil pontos no ciclo, o cliente recebe 4 trechos: 2 trechos domésticos + 2 trechos flex (domésticos ou internacionais).</p>'
      ) +
      row(
        '<p class="at-cc-label">Upgrade de Cabine</p>',
        '<p class="at-cc-dash">—</p>',
        '<p class="at-cc-value">Ao atingir 100 mil pontos no ciclo, o cliente recebe 2 trechos (vouchers).</p>'
      ) +
      row(
        '<p class="at-cc-label">Antecipação de voo nacional</p>',
        '<p class="at-cc-free">Grátis</p>',
        '<p class="at-cc-free">Grátis</p>'
      ) +
      row(
        '<p class="at-cc-label">Antecipação de voo internacional</p>',
        '<p class="at-cc-value">Desconto</p>',
        '<p class="at-cc-free">Grátis</p>'
      ) +
      row(
        '<p class="at-cc-label">Assento antecipado</p>',
        '<p class="at-cc-value">Nacional grátis</p>',
        '<p class="at-cc-value">Nacional grátis</p>'
      ) +
      row(
        '<p class="at-cc-label">Espaço Azul (cortesia/ano)</p>',
        '<p class="at-cc-value at-cc-value--strong">2</p>',
        '<p class="at-cc-value at-cc-value--strong">Ilimitado</p>'
      ) +
      row(
        '<p class="at-cc-label">Check-in prioritário</p>',
        '<p class="at-cc-dash">—</p>',
        '<p class="at-cc-yes">Sim</p>'
      ) +
      row(
        '<p class="at-cc-label">Embarque prioritário</p>',
        '<p class="at-cc-dash">—</p>',
        '<p class="at-cc-yes">Sim</p>'
      ) +
      row(
        '<p class="at-cc-label">20% de desconto na Unidas</p>',
        '<p class="at-cc-value">20% no hotsite pagando com AIC</p>',
        '<p class="at-cc-value">20% no hotsite pagando com AIC</p>'
      ) +
      row(
        '<p class="at-cc-label">Diárias na Unidas</p>',
        '<p class="at-cc-dash">—</p>',
        '<p class="at-cc-value">Até 2 diárias gratuitas/ano. Reserve 3 diárias no mesmo contrato e ganhe 1 diária. Reserve no mínimo 7 diárias no mesmo contrato e ganhe 2 diárias.</p>'
      ) +
      '</div>' +
      '</div>' +
      '<p class="at-cc-footnote">* Consulte os termos e condições completos em <a href="' +
      TERMS_URL +
      '" target="_blank" rel="noopener noreferrer">voeazul.com.br</a></p>' +
      '</div>'
    );
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      closeModal('esc');
    }
  }

  function isMobileLayout() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function syncAccordions(root) {
    if (!root) return;
    const rows = root.querySelectorAll('.at-cc-row[data-at-accordion="true"]');
    const mobile = isMobileLayout();

    if (!mobile) {
      for (let i = 0; i < rows.length; i++) {
        const btn = rows[i].querySelector('.at-cc-cell--label');
        rows[i].classList.add('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
      root.removeAttribute('data-at-acc-ready');
      return;
    }

    const alreadyReady = root.getAttribute('data-at-acc-ready') === 'true';
    for (let j = 0; j < rows.length; j++) {
      const rowEl = rows[j];
      const btn = rowEl.querySelector('.at-cc-cell--label');
      if (!btn) continue;

      if (!alreadyReady) {
        if (j === 0) {
          rowEl.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          rowEl.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      }
    }

    root.setAttribute('data-at-acc-ready', 'true');
  }

  function bindAccordions(root) {
    if (!root) return;
    const rows = root.querySelectorAll('.at-cc-row[data-at-accordion="true"]');

    for (let i = 0; i < rows.length; i++) {
      const rowEl = rows[i];
      const btn = rowEl.querySelector('.at-cc-cell--label');
      if (!btn || btn.getAttribute('data-at-acc') === 'true') continue;

      btn.setAttribute('data-at-acc', 'true');
      btn.addEventListener('click', function () {
        if (!isMobileLayout()) return;

        const willOpen = !rowEl.classList.contains('is-open');
        if (willOpen) {
          rowEl.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          analyticsEvent('accordion_abrir', 'click');
        } else {
          rowEl.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          analyticsEvent('accordion_fechar', 'click');
        }
      });
    }

    syncAccordions(root);
  }

  function trackViewOnce() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay || overlay.getAttribute(DATA_VIEW) === 'true') return;
    overlay.setAttribute(DATA_VIEW, 'true');
    if (viewTracked) return;
    viewTracked = true;
    analyticsEvent('modal_visivel', 'view');
  }

  function openModal(origin) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    lastFocused = document.activeElement;
    overlay.classList.add('at-cc-visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('at-cc-locked');

    const closeBtn = overlay.querySelector('.at-cc-close');
    if (closeBtn) closeBtn.focus();

    document.addEventListener('keydown', onKeydown);
    trackViewOnce();
    analyticsEvent(origin || 'abrir_modal', 'click');
  }

  function closeModal(origin) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay || !overlay.classList.contains('at-cc-visible')) return;

    overlay.classList.remove('at-cc-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('at-cc-locked');
    document.removeEventListener('keydown', onKeydown);

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }

    analyticsEvent(origin || 'fechar_modal', 'click');
  }

  function bindModalEvents(overlay) {
    if (overlay.getAttribute('data-at-listeners') === 'true') return;
    overlay.setAttribute('data-at-listeners', 'true');

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeModal('overlay');
      }
    });

    const closeBtn = overlay.querySelector('.at-cc-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal('botao_fechar');
      });
    }

    const termsLink = overlay.querySelector('.at-cc-footnote a');
    if (termsLink && termsLink.getAttribute('data-analytics-added') !== 'true') {
      termsLink.setAttribute('data-analytics-added', 'true');
      termsLink.addEventListener('click', function () {
        analyticsEvent('termos_link', 'click');
      });
    }

    bindAccordions(overlay);

    window.addEventListener('resize', function () {
      clearTimeout(accordionTimer);
      accordionTimer = setTimeout(function () {
        syncAccordions(overlay);
      }, 200);
    });
  }

  function createModal() {
    if (document.getElementById(OVERLAY_ID)) return document.getElementById(OVERLAY_ID);

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'at-cc-title');
    modal.setAttribute('data-at-experiment', EXPERIMENT_NAME);
    modal.innerHTML = getModalHtml();

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    bindModalEvents(overlay);
    return overlay;
  }

  function getCtaImgSelector() {
    return 'img[src*="' + CTA_IMG_FRAGMENT + '"],img[srcset*="' + CTA_IMG_FRAGMENT + '"]';
  }

  function getCompareCtaButton(target) {
    if (!target || !target.closest) return null;
    if (target.closest('#' + OVERLAY_ID)) return null;
    if (target.closest('#at-itau-carousel, .at-itau-carousel')) return null;

    const imgSelector = getCtaImgSelector();
    const img = target.closest(imgSelector);
    if (img) {
      return img.closest('button') || null;
    }

    const button = target.closest('button');
    if (!button) return null;
    if (button.closest('#at-itau-carousel, .at-itau-carousel')) return null;
    if (!button.querySelector(imgSelector)) return null;
    return button;
  }

  function isCompareCtaTarget(target) {
    return !!getCompareCtaButton(target);
  }

  function onCtaClick(event) {
    if (!isCompareCtaTarget(event.target)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    injectStyles();
    createModal();
    openModal('cta_comparar_beneficios');
  }

  function bindDocumentCta() {
    if (document.documentElement.getAttribute(DATA_CTA) === 'true') return;
    document.documentElement.setAttribute(DATA_CTA, 'true');
    document.addEventListener('click', onCtaClick, true);
  }

  function findCompareButtons() {
    const images = document.querySelectorAll(getCtaImgSelector());
    const buttons = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const button = img.closest ? img.closest('button') : null;
      if (!button) continue;
      if (button.closest('#at-itau-carousel, .at-itau-carousel')) continue;
      if (buttons.indexOf(button) === -1) buttons.push(button);
    }

    return buttons;
  }

  function bindCompareCtas() {
    const buttons = findCompareButtons();
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      if (btn.getAttribute(DATA_CTA) === 'true') continue;
      btn.setAttribute(DATA_CTA, 'true');
      btn.addEventListener('click', onCtaClick, true);
    }
  }

  function run() {
    if (isProcessing) return;

    isProcessing = true;
    try {
      injectStyles();
      createModal();
      bindDocumentCta();
      bindCompareCtas();
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
    if (observerStarted || window._atCompararCartoesObserver) return;

    const observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (!mutation.addedNodes || !mutation.addedNodes.length) continue;
        let skip = false;
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (node.id === OVERLAY_ID || (node.closest && node.closest('#' + OVERLAY_ID))) {
            skip = true;
            break;
          }
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

    window._atCompararCartoesObserver = observer;
    observerStarted = true;
  }

  function init() {
    run();
    startObserver();
  }

  window.AT_CompararCartoes = {
    open: function () {
      injectStyles();
      createModal();
      openModal('api');
    },
    close: function () {
      closeModal('api');
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
