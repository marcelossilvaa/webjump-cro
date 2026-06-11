(function () {
  'use strict';

  const STYLE_ID = 'at-nubank-style';
  const MODAL_ID = 'at-nubank-modal';
  const ACTIVITY = 'AT_NubankIndisponivel';
  const CONTEXT = 'tela_pagamento';

  let debounceTimer = null;
  let isProcessing = false;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;

    const labelEvent = ACTIVITY + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking NubankIndisponivel] Evento disparado:', labelEvent);

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

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#at-nubank-modal {' +
        'display: none;' +
        'position: fixed;' +
        'inset: 0;' +
        'z-index: 99999;' +
        'align-items: center;' +
        'justify-content: center;' +
        'padding: 16px;' +
        'box-sizing: border-box;' +
      '}' +

      '#at-nubank-modal[data-aberto="true"] {' +
        'display: flex;' +
      '}' +

      '#at-nubank-modal .at-modal-overlay {' +
        'position: absolute;' +
        'inset: 0;' +
        'background: rgba(0, 0, 0, 0.55);' +
      '}' +

      '#at-nubank-modal .at-modal-box {' +
        'position: relative;' +
        'z-index: 1;' +
        'width: 100%;' +
        'max-width: 420px;' +
        'border-radius: 12px;' +
        'overflow: hidden;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);' +
      '}' +

      '#at-nubank-modal .at-modal-header {' +
        'padding: 20px 20px 16px;' +
        'background: linear-gradient(63deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%);' +
        'display: flex;' +
        'align-items: flex-start;' +
        'justify-content: space-between;' +
        'gap: 12px;' +
      '}' +

      '#at-nubank-modal .at-modal-titulo {' +
        'color: #fff;' +
        'font-size: 16px;' +
        'font-weight: 700;' +
        'line-height: 1.3;' +
        'margin: 0;' +
      '}' +

      '#at-nubank-modal .at-modal-fechar {' +
        'flex-shrink: 0;' +
        'background: transparent;' +
        'border: none;' +
        'cursor: pointer;' +
        'padding: 0;' +
        'line-height: 1;' +
        'color: rgba(255, 255, 255, 0.7);' +
        'font-size: 22px;' +
        'font-weight: 300;' +
        'transition: color 0.15s;' +
      '}' +

      '#at-nubank-modal .at-modal-fechar:hover {' +
        'color: #fff;' +
      '}' +

      '#at-nubank-modal .at-modal-corpo {' +
        'padding: 20px;' +
        'background: rgb(255, 255, 255);' +
      '}' +

      '#at-nubank-modal .at-modal-intro {' +
        'font-size: 13px;' +
        'color: rgb(1, 78, 132);' +
        'font-weight: 600;' +
        'line-height: 1.5;' +
        'margin: 0 0 14px;' +
      '}' +

      '#at-nubank-modal .at-modal-lista {' +
        'list-style: none;' +
        'margin: 0;' +
        'padding: 0;' +
        'display: flex;' +
        'flex-direction: column;' +
        'gap: 10px;' +
      '}' +

      '#at-nubank-modal .at-modal-lista li {' +
        'display: flex;' +
        'align-items: flex-start;' +
        'gap: 10px;' +
        'font-size: 13px;' +
        'color: rgba(1, 78, 132, 0.85);' +
        'line-height: 1.5;' +
      '}' +

      '#at-nubank-modal .at-modal-lista li::before {' +
        'content: "";' +
        'flex-shrink: 0;' +
        'margin-top: 5px;' +
        'width: 7px;' +
        'height: 7px;' +
        'border-radius: 50%;' +
        'background: rgb(2, 108, 182);' +
      '}' +

      '#at-nubank-modal .at-modal-rodape {' +
        'margin-top: 18px;' +
        'padding-top: 14px;' +
        'border-top: 1px solid rgba(1, 78, 132, 0.1);' +
        'font-size: 12px;' +
        'color: rgba(1, 78, 132, 0.5);' +
        'line-height: 1.5;' +
      '}' +

      '#at-nubank-modal .at-modal-btn-ok {' +
        'display: flex;' +
        'width: 100%;' +
        'height: 44px;' +
        'align-items: center;' +
        'justify-content: center;' +
        'margin-top: 18px;' +
        'border-radius: 8px;' +
        'border: 1px solid rgb(2, 108, 182);' +
        'background: rgb(255, 255, 255);' +
        'cursor: pointer;' +
        'color: rgb(2, 108, 182);' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-size: 14px;' +
        'font-weight: 700;' +
        'transition: background 0.15s ease;' +
      '}' +

      '#at-nubank-modal .at-modal-btn-ok:hover {' +
        'background: rgba(2, 108, 182, 0.08);' +
      '}';

    document.head.appendChild(style);
  }

  function criarModal() {
    if (document.getElementById(MODAL_ID)) return;

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'at-modal-titulo-id');
    modal.setAttribute('data-aberto', 'false');

    const overlay = document.createElement('div');
    overlay.className = 'at-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const box = document.createElement('div');
    box.className = 'at-modal-box';

    const header = document.createElement('div');
    header.className = 'at-modal-header';

    const titulo = document.createElement('p');
    titulo.className = 'at-modal-titulo';
    titulo.id = 'at-modal-titulo-id';
    titulo.textContent = 'Por que o Nubank nao esta disponivel?';

    const btnFechar = document.createElement('button');
    btnFechar.className = 'at-modal-fechar';
    btnFechar.setAttribute('type', 'button');
    btnFechar.setAttribute('aria-label', 'Fechar');
    btnFechar.textContent = '\u00D7';

    header.appendChild(titulo);
    header.appendChild(btnFechar);

    const corpo = document.createElement('div');
    corpo.className = 'at-modal-corpo';

    const intro = document.createElement('p');
    intro.className = 'at-modal-intro';
    intro.textContent = 'O pagamento via NuPay pode estar indisponivel por um dos seguintes motivos:';
    corpo.appendChild(intro);

    const motivos = [
      'Compras internacionais ou com trechos fora do Brasil nao sao suportadas pelo NuPay.',
      'Tarifas promocionais especificas podem ter restricoes de forma de pagamento.',
      'O valor total da compra pode estar fora dos limites aceitos pelo NuPay para compras aereas.',
      'A combinacao de produtos selecionados (ex.: upgrades, seguros) pode bloquear a opcao.',
      'Restricoes temporarias da operadora do NuPay para a categoria de comercio aereo.'
    ];

    const lista = document.createElement('ul');
    lista.className = 'at-modal-lista';

    motivos.forEach(function (motivo) {
      const li = document.createElement('li');
      li.textContent = motivo;
      lista.appendChild(li);
    });

    corpo.appendChild(lista);

    const rodape = document.createElement('p');
    rodape.className = 'at-modal-rodape';
    rodape.textContent = 'Para mais informacoes, acesse o suporte da Azul ou entre em contato com o Nubank.';
    corpo.appendChild(rodape);

    const btnOk = document.createElement('button');
    btnOk.className = 'at-modal-btn-ok';
    btnOk.setAttribute('type', 'button');
    btnOk.textContent = 'Entendi';
    corpo.appendChild(btnOk);

    box.appendChild(header);
    box.appendChild(corpo);
    modal.appendChild(overlay);
    modal.appendChild(box);
    document.body.appendChild(modal);

    function fecharModal() {
      modal.setAttribute('data-aberto', 'false');
      analyticsEvent('modal fechado', 'clique');
    }

    btnFechar.addEventListener('click', fecharModal);
    btnOk.addEventListener('click', fecharModal);
    overlay.addEventListener('click', fecharModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.getAttribute('data-aberto') === 'true') {
        fecharModal();
      }
    });
  }

  function abrirModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.setAttribute('data-aberto', 'true');
    analyticsEvent('modal aberto', 'clique');
  }

  function alterarTextoIndisponivel(container) {
    const statusEl = container.querySelector('.sc-545d9e37-8');
    if (!statusEl || statusEl.getAttribute('data-texto-alterado')) return;

    statusEl.textContent = 'Essa opcao de pagamento nao esta disponivel para essa compra';
    statusEl.setAttribute('data-texto-alterado', 'true');
  }

  function alterarBotaoDuvidas(container) {
    const linkEl = container.querySelector('.sc-545d9e37-14');
    if (!linkEl || linkEl.getAttribute('data-listener-added')) return;

    const textoEl = linkEl.querySelector('.sc-545d9e37-16 p');
    if (textoEl) {
      textoEl.textContent = 'Entenda o motivo';
    }

    linkEl.setAttribute('data-listener-added', 'true');
    linkEl.addEventListener('click', function (e) {
      e.preventDefault();
      abrirModal();
    });
  }

  function run() {
    const nubankContainer = document.querySelector('.sc-545d9e37-0');
    if (!nubankContainer) return;
    if (nubankContainer.getAttribute('data-at-processado')) return;

    nubankContainer.setAttribute('data-at-processado', 'true');

    alterarTextoIndisponivel(nubankContainer);
    alterarBotaoDuvidas(nubankContainer);

    criarModal();

    analyticsEvent('Nubank indisponivel exibido', 'view');
    console.log('[NubankIndisponivel] Modificacoes aplicadas com sucesso.');
  }

  function agendarRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      if (isProcessing) return;
      isProcessing = true;
      try {
        run();
      } finally {
        isProcessing = false;
      }
    }, 200);
  }

  function init() {
    injectStyles();
    agendarRun();

    if (!window._nubankObserver) {
      const observer = new MutationObserver(function (mutations) {
        const relevante = mutations.some(function (m) {
          return Array.from(m.addedNodes).some(function (n) {
            return n.nodeType === 1 && !n.closest('#' + MODAL_ID);
          });
        });
        if (relevante) {
          agendarRun();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      window._nubankObserver = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();