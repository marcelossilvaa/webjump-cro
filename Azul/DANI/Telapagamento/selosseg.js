(function () {
  'use strict';

  const STYLE_ID = 'at-faq-pagamento-style';
  const FAQ_ID = 'at-faq-pagamento';
  const SELOS_ID = 'at-selos-seguranca';
  const COUNTDOWN_ID = 'at-countdown-pagamento';
  const COUNTDOWN_SEGUNDOS = 10 * 60;
  const ATTR_OCULTO = 'data-faq-nativo-oculto';
  const ACTIVITY = 'AT_FAQTelaPagamento';
  const CONTEXT = 'tela_pagamento';

  let debounceTimer = null;
  let isProcessing = false;
  let countdownInterval = null;
  let countdownSecondsLeft = COUNTDOWN_SEGUNDOS;

  const faqItems = [
    {
      pergunta: 'É seguro inserir meus dados de pagamento aqui?',
      resposta: 'Sim. O ambiente de pagamento da Azul utiliza criptografia SSL e está em conformidade com os padrões PCI DSS. Seus dados são transmitidos de forma segura e não são armazenados no dispositivo.'
    },
    {
      pergunta: 'Quais formas de pagamento são aceitas?',
      resposta: 'São aceitos cartões de crédito das bandeiras Visa, Mastercard, American Express, Elo e Hipercard, além de cartões de débito e o parcelamento via Pix em algumas modalidades.'
    },
    {
      pergunta: 'Posso parcelar minha compra?',
      resposta: 'Sim, dependendo do valor da passagem e da bandeira do cartão, é possível parcelar em até 12x. O número de parcelas disponíveis é exibido na tela conforme o produto selecionado.'
    },
    {
      pergunta: 'Quanto tempo leva para confirmar meu pagamento?',
      resposta: 'Para cartão de crédito, a aprovação é imediata na maioria dos casos. Após a confirmação, você receberá um e-mail de reserva em até 30 minutos com todos os detalhes do seu voo.'
    },
    {
      pergunta: 'O que acontece se meu pagamento não for aprovado?',
      resposta: 'Caso a transação não seja aprovada, você poderá tentar novamente com outro cartão ou entrar em contato com a sua operadora de crédito. A reserva fica pendente até a confirmação do pagamento.'
    }
  ];

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking FAQPagamento] Parametros ausentes para o evento de analytics.');
      return;
    }

    const labelEvent = ACTIVITY + '_' + eventType + ' ' + eventLabel;
    console.log('[Tracking FAQPagamento] Evento disparado:', labelEvent);

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
      '[' + ATTR_OCULTO + '] { display: none !important; }' +

      '#at-faq-pagamento {' +
        'margin-top: 24px;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'border-radius: 8px;' +
        'overflow: hidden;' +
        'border: 1px solid rgba(1, 78, 132, 0.15);' +
      '}' +

      '#at-faq-pagamento .at-faq-titulo {' +
        'padding: 16px 20px;' +
        'background: linear-gradient(63deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%);' +
        'color: #fff;' +
        'font-size: 15px;' +
        'font-weight: 700;' +
        'letter-spacing: 0.2px;' +
        'margin: 0;' +
      '}' +

      '#at-faq-pagamento .at-faq-item {' +
        'border-bottom: 1px solid rgba(1, 78, 132, 0.12);' +
        'background: rgb(255, 255, 255);' +
      '}' +

      '#at-faq-pagamento .at-faq-item:last-child {' +
        'border-bottom: none;' +
      '}' +

      '#at-faq-pagamento .at-faq-pergunta {' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: space-between;' +
        'gap: 12px;' +
        'width: 100%;' +
        'padding: 16px 20px;' +
        'background: transparent;' +
        'border: none;' +
        'cursor: pointer;' +
        'text-align: left;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-size: 14px;' +
        'font-weight: 600;' +
        'color: rgb(1, 78, 132);' +
        'line-height: 1.4;' +
        'transition: background 0.15s ease;' +
      '}' +

      '#at-faq-pagamento .at-faq-pergunta:hover {' +
        'background: rgba(1, 78, 132, 0.04);' +
      '}' +

      '#at-faq-pagamento .at-faq-icone {' +
        'flex-shrink: 0;' +
        'width: 20px;' +
        'height: 20px;' +
        'border-radius: 50%;' +
        'border: 1.5px solid rgb(2, 108, 182);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'color: rgb(2, 108, 182);' +
        'font-size: 16px;' +
        'font-weight: 400;' +
        'line-height: 1;' +
        'transition: transform 0.25s ease;' +
        'user-select: none;' +
      '}' +

      '#at-faq-pagamento .at-faq-item[data-aberto="true"] .at-faq-icone {' +
        'transform: rotate(45deg);' +
      '}' +

      '#at-faq-pagamento .at-faq-resposta {' +
        'max-height: 0;' +
        'overflow: hidden;' +
        'transition: max-height 0.3s ease, padding 0.3s ease;' +
        'padding: 0 20px;' +
        'font-size: 13px;' +
        'color: rgba(1, 78, 132, 0.8);' +
        'line-height: 1.6;' +
        'background: rgb(255, 255, 255);' +
      '}' +

      '#at-faq-pagamento .at-faq-resposta p {' +
        'margin: 0;' +
      '}' +

      '#at-faq-pagamento .at-faq-item[data-aberto="true"] .at-faq-resposta {' +
        'max-height: 200px;' +
        'padding: 0 20px 16px;' +
      '}' +

      '#at-selos-seguranca {' +
        'margin-top: 20px;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
      '}' +

      '#at-selos-seguranca .at-selos-grid {' +
        'display: flex;' +
        'flex-wrap: wrap;' +
        'gap: 14px 8px;' +
        'justify-content: center;' +
      '}' +

      '#at-selos-seguranca .at-selo-item {' +
        'display: flex;' +
        'flex-direction: column;' +
        'align-items: center;' +
        'gap: 6px;' +
        'flex: 1 1 calc(25% - 6px);' +
        'min-width: 64px;' +
        'max-width: 96px;' +
      '}' +

      '#at-selos-seguranca .at-selo-icone {' +
        'flex-shrink: 0;' +
        'width: 44px;' +
        'height: 44px;' +
        'border-radius: 50%;' +
        'background: rgba(2, 108, 182, 0.08);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
      '}' +

      '#at-selos-seguranca .at-selo-icone svg {' +
        'width: 22px;' +
        'height: 22px;' +
        'fill: rgb(2, 108, 182);' +
      '}' +

      '#at-selos-seguranca .at-selo-texto {' +
        'display: flex;' +
        'flex-direction: column;' +
        'align-items: center;' +
        'gap: 2px;' +
        'text-align: center;' +
      '}' +

      '#at-selos-seguranca .at-selo-label {' +
        'font-size: 11px;' +
        'font-weight: 700;' +
        'color: rgb(1, 78, 132);' +
        'line-height: 1.3;' +
      '}' +

      '#at-selos-seguranca .at-selo-sub {' +
        'font-size: 10px;' +
        'font-weight: 400;' +
        'color: rgba(1, 78, 132, 0.55);' +
        'line-height: 1.3;' +
      '}' +

      '#at-selos-seguranca .at-selos-rodape {' +
        'margin-top: 14px;' +
        'font-size: 11px;' +
        'color: rgba(1, 78, 132, 0.45);' +
        'text-align: center;' +
        'line-height: 1.5;' +
      '}' +

      '#at-countdown-pagamento {' +
        'margin-top: 12px;' +
        'margin-bottom: 4px;' +
        'background: linear-gradient(135deg, rgb(0, 29, 70) 0%, rgb(1, 78, 132) 100%);' +
        'border-radius: 8px;' +
        'padding: 14px 16px;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'gap: 8px;' +
        'flex-wrap: wrap;' +
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
      '}' +

      '#at-countdown-pagamento .at-countdown-icon svg {' +
        'width: 18px;' +
        'height: 18px;' +
        'fill: rgba(255, 255, 255, 0.85);' +
        'display: block;' +
      '}' +

      '#at-countdown-pagamento .at-countdown-texto {' +
        'font-size: 13px;' +
        'font-weight: 500;' +
        'color: rgba(255, 255, 255, 0.9);' +
      '}' +

      '#at-countdown-pagamento .at-countdown-timer {' +
        'display: inline-flex;' +
        'align-items: center;' +
        'background: rgba(255, 255, 255, 0.15);' +
        'border-radius: 6px;' +
        'padding: 3px 10px;' +
        'gap: 2px;' +
        'border: 1px solid rgba(255, 255, 255, 0.2);' +
      '}' +

      '#at-countdown-pagamento .at-countdown-digito {' +
        'font-family: "Courier New", Courier, monospace;' +
        'font-size: 20px;' +
        'font-weight: 700;' +
        'color: #fff;' +
        'min-width: 26px;' +
        'text-align: center;' +
        'line-height: 1;' +
      '}' +

      '#at-countdown-pagamento .at-countdown-sep {' +
        'font-size: 20px;' +
        'font-weight: 700;' +
        'color: rgba(255, 255, 255, 0.6);' +
        'line-height: 1;' +
      '}';

    document.head.appendChild(style);
  }

  const selosData = [
    {
      label: 'Ambiente Seguro',
      sub: 'Criptografia SSL 256 bits',
      path: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'
    },
    {
      label: 'PCI DSS',
      sub: 'Padrao internacional de seguranca',
      path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'
    },
    {
      label: 'Dados Protegidos',
      sub: 'Nao armazenamos dados do cartao',
      path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
    },
    {
      label: 'Compra Protegida',
      sub: 'Garantia de reembolso',
      path: 'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'
    }
  ];

  function criarSVG(pathD, viewBox) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox || '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);
    return svg;
  }

  function criarSelosSeguranca() {
    const wrapper = document.createElement('div');
    wrapper.id = SELOS_ID;

    const grid = document.createElement('div');
    grid.className = 'at-selos-grid';

    selosData.forEach(function (selo) {
      const item = document.createElement('div');
      item.className = 'at-selo-item';

      const iconeWrap = document.createElement('div');
      iconeWrap.className = 'at-selo-icone';
      iconeWrap.appendChild(criarSVG(selo.path));

      const textoWrap = document.createElement('div');
      textoWrap.className = 'at-selo-texto';

      const label = document.createElement('span');
      label.className = 'at-selo-label';
      label.textContent = selo.label;

      const sub = document.createElement('span');
      sub.className = 'at-selo-sub';
      sub.textContent = selo.sub;

      textoWrap.appendChild(label);
      textoWrap.appendChild(sub);
      item.appendChild(iconeWrap);
      item.appendChild(textoWrap);
      grid.appendChild(item);
    });

    wrapper.appendChild(grid);

    const rodape = document.createElement('p');
    rodape.className = 'at-selos-rodape';
    rodape.textContent = 'Seus dados sao protegidos e nunca compartilhados com terceiros.';
    wrapper.appendChild(rodape);

    return wrapper;
  }

  function criarCountdown() {
    const wrapper = document.createElement('div');
    wrapper.id = COUNTDOWN_ID;

    const iconeWrap = document.createElement('span');
    iconeWrap.className = 'at-countdown-icon';
    iconeWrap.appendChild(criarSVG('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z'));

    const textoPre = document.createElement('span');
    textoPre.className = 'at-countdown-texto';
    textoPre.textContent = 'Finalize sua compra em';

    const timer = document.createElement('div');
    timer.className = 'at-countdown-timer';

    const minEl = document.createElement('span');
    minEl.className = 'at-countdown-digito at-countdown-min';
    minEl.textContent = '10';

    const sep = document.createElement('span');
    sep.className = 'at-countdown-sep';
    sep.textContent = ':';

    const secEl = document.createElement('span');
    secEl.className = 'at-countdown-digito at-countdown-sec';
    secEl.textContent = '00';

    timer.appendChild(minEl);
    timer.appendChild(sep);
    timer.appendChild(secEl);

    const textoPos = document.createElement('span');
    textoPos.className = 'at-countdown-texto';
    textoPos.textContent = 'e garanta o melhor preço';

    wrapper.appendChild(iconeWrap);
    wrapper.appendChild(textoPre);
    wrapper.appendChild(timer);
    wrapper.appendChild(textoPos);

    return wrapper;
  }

  function iniciarCountdown() {
    if (countdownInterval) return;

    countdownInterval = setInterval(function () {
      countdownSecondsLeft--;

      if (countdownSecondsLeft <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        const el = document.getElementById(COUNTDOWN_ID);
        if (el) {
          const timerEl = el.querySelector('.at-countdown-timer');
          if (timerEl) timerEl.textContent = '00:00';
        }
        return;
      }

      const m = Math.floor(countdownSecondsLeft / 60);
      const s = countdownSecondsLeft % 60;
      const el = document.getElementById(COUNTDOWN_ID);
      if (!el) return;

      const mEl = el.querySelector('.at-countdown-min');
      const sEl = el.querySelector('.at-countdown-sec');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }

  function ocultarHoldEInserirCountdown(containerBotao) {
    const checkbox = document.querySelector('[data-test-id="booking-hold-checkbox"]');
    if (checkbox) {
      const holdEl = checkbox.closest('.sc-d781f9ae-2') || checkbox.parentElement.parentElement;
      if (holdEl && !holdEl.getAttribute('data-hold-oculto')) {
        holdEl.setAttribute('data-hold-oculto', 'true');
        holdEl.style.display = 'none';
        console.log('[FAQPagamento] Elemento "Precisa de mais tempo?" ocultado.');
      }
    }

    if (document.getElementById(COUNTDOWN_ID)) return;

    const countdownEl = criarCountdown();

    const summaryHeader = document.querySelector('[data-test-id="summary-header-total"]');
    const summaryEl = summaryHeader ? summaryHeader.closest('.sc-d781f9ae-1') : null;

    if (summaryEl) {
      summaryEl.insertAdjacentElement('beforebegin', countdownEl);
    } else {
      containerBotao.insertAdjacentElement('beforebegin', countdownEl);
    }

    iniciarCountdown();
    console.log('[FAQPagamento] Countdown inserido.');
  }

  function ocultarFaqNativo() {
    const faqNativo = document.querySelector('.sc-72e45cb6-0');
    if (!faqNativo) return null;
    if (faqNativo.getAttribute(ATTR_OCULTO)) return faqNativo;

    faqNativo.setAttribute(ATTR_OCULTO, 'true');
    console.log('[FAQPagamento] FAQ nativo ocultado.');
    return faqNativo;
  }

  function criarFAQ() {
    const wrapper = document.createElement('div');
    wrapper.id = FAQ_ID;

    const titulo = document.createElement('p');
    titulo.className = 'at-faq-titulo';
    titulo.textContent = 'Duvidas Frequentes';
    wrapper.appendChild(titulo);

    faqItems.forEach(function (item, index) {
      const itemEl = document.createElement('div');
      itemEl.className = 'at-faq-item';
      itemEl.setAttribute('data-aberto', 'false');
      itemEl.setAttribute('data-faq-index', String(index));

      const btn = document.createElement('button');
      btn.className = 'at-faq-pergunta';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-expanded', 'false');

      const textoPergunta = document.createElement('span');
      textoPergunta.textContent = item.pergunta;

      const icone = document.createElement('span');
      icone.className = 'at-faq-icone';
      icone.setAttribute('aria-hidden', 'true');
      icone.textContent = '+';

      btn.appendChild(textoPergunta);
      btn.appendChild(icone);

      const resposta = document.createElement('div');
      resposta.className = 'at-faq-resposta';
      resposta.setAttribute('role', 'region');

      const textoResposta = document.createElement('p');
      textoResposta.textContent = item.resposta;
      resposta.appendChild(textoResposta);

      itemEl.appendChild(btn);
      itemEl.appendChild(resposta);
      wrapper.appendChild(itemEl);
    });

    return wrapper;
  }

  function adicionarListeners(faqEl) {
    const itens = faqEl.querySelectorAll('.at-faq-item');

    itens.forEach(function (item) {
      const btn = item.querySelector('.at-faq-pergunta');
      if (!btn || btn.getAttribute('data-listener-added')) return;

      btn.setAttribute('data-listener-added', 'true');

      btn.addEventListener('click', function () {
        const estaAberto = item.getAttribute('data-aberto') === 'true';
        const perguntaTexto = btn.querySelector('span') ? btn.querySelector('span').textContent : '';

        itens.forEach(function (outro) {
          outro.setAttribute('data-aberto', 'false');
          const outroBtn = outro.querySelector('.at-faq-pergunta');
          if (outroBtn) outroBtn.setAttribute('aria-expanded', 'false');
        });

        if (!estaAberto) {
          item.setAttribute('data-aberto', 'true');
          btn.setAttribute('aria-expanded', 'true');
          analyticsEvent(perguntaTexto, 'clique');
        }
      });
    });
  }

  function run() {
    const faqNativo = ocultarFaqNativo();

    if (document.getElementById(FAQ_ID)) return;

    const btnProsseguir = document.querySelector('[data-test-id="payment-next-step-btn"]');
    if (!btnProsseguir) return;

    const containerBotao = btnProsseguir.closest('.sc-f054280d-2') || btnProsseguir.parentElement;
    if (!containerBotao) return;

    const faqEl = criarFAQ();

    if (faqNativo) {
      faqNativo.insertAdjacentElement('beforebegin', faqEl);
    } else {
      containerBotao.insertAdjacentElement('afterend', faqEl);
    }

    adicionarListeners(faqEl);

    const selosEl = criarSelosSeguranca();
    faqEl.insertAdjacentElement('afterend', selosEl);

    ocultarHoldEInserirCountdown(containerBotao);

    analyticsEvent('FAQ exibido', 'view');
    console.log('[FAQPagamento] FAQ e selos de seguranca inseridos com sucesso.');
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

    if (!window._faqPagamentoObserver) {
      const observer = new MutationObserver(function (mutations) {
        const relevante = mutations.some(function (m) {
          return Array.from(m.addedNodes).some(function (n) {
            return n.nodeType === 1 && !n.closest('#' + FAQ_ID);
          });
        });
        if (relevante) {
          agendarRun();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      window._faqPagamentoObserver = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
