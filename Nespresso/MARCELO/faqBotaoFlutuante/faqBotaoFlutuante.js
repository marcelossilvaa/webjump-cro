(function () {
  'use strict';

  /**
   * Botao flutuante + modal FAQ (Nespresso / MARCELO).
   *
   * CONFIG.FAB_VARIANT: escolha 1 a 4 para o botao principal (apresentacao de estilos).
   * Modo vitrine de exemplos: adicione o hash na URL: #at-faq-fab-exemplos
   * (barra fixa com 4 botoes de amostra que abrem o mesmo FAQ).
   *
   * Opcional: restrinja paginas em shouldRunOnPage().
   */

  const CONFIG = {
    FAB_VARIANT: 1,
    Z_INDEX_OVERLAY: 2147483000,
    Z_INDEX_FAB: 2147483010,
    Z_INDEX_DEMO_BAR: 2147483020,
  };

  const STYLE_ID = 'at-nesp-marcelo-faq-fab-style';
  const ROOT_ID = 'at-nesp-faq-fab-root';
  const MODAL_ID = 'at-nesp-faq-modal';
  const DEMO_BAR_ID = 'at-nesp-faq-fab-demo-bar';

  const FAQ_ITEMS = [
    {
      q: 'Quais formas de pagamento estao disponiveis?',
      a:
        'Cartoes de credito em ate 12x sem juros (conforme condicoes do site), ' +
        'Pix e boleto bancario quando disponiveis para o seu pedido.',
    },
    {
      q: 'Como rastreio minha entrega?',
      a:
        'Apos a confirmacao do pagamento voce recebe e-mails com atualizacoes. ' +
        'Tambem e possivel acompanhar o status em Minha Conta, area de pedidos.',
    },
    {
      q: 'Posso alterar ou cancelar um pedido?',
      a:
        'Pedidos em preparacao podem ter restricoes de alteracao. ' +
        'Entre em contato com o atendimento o quanto antes pelo canal oficial da loja.',
    },
    {
      q: 'Como funciona a reciclagem das capsulas?',
      a:
        'A Nespresso oferece pontos de coleta para capsulas de aluminio usadas. ' +
        'Consulte a pagina de sustentabilidade para localizar o ponto mais proximo.',
    },
    {
      q: 'O que e o programa de fidelidade?',
      a:
        'Programas de beneficios podem variar por periodo e segmento. ' +
        'Verifique as regras vigentes no site na area do programa antes de finalizar a compra.',
    },
  ];

  const ICON_HELP =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M12 17h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
    '</svg>';

  const ICON_CHAT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
    '</svg>';

  const ICON_CLOSE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';

  function shouldRunOnPage() {
    return true;
  }

  function sendTracking(localEventLabel) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'user engagement',
      local_event_action: 'click',
      local_event_label: localEventLabel,
    });
  }

  function getCss() {
    const zFab = String(CONFIG.Z_INDEX_FAB);
    const zOver = String(CONFIG.Z_INDEX_OVERLAY);
    const zDemo = String(CONFIG.Z_INDEX_DEMO_BAR);

    return (
      '#' +
      ROOT_ID +
      ' { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }' +
      '#' +
      ROOT_ID +
      ' * { box-sizing: border-box; }' +
      '.at-nesp-fab {' +
      '  position: fixed;' +
      '  right: 20px;' +
      '  bottom: 24px;' +
      '  z-index: ' +
      zFab +
      ';' +
      '  display: inline-flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  gap: 10px;' +
      '  border: 0;' +
      '  cursor: pointer;' +
      '  box-shadow: 0 10px 30px rgba(0,0,0,.25);' +
      '  transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease, color .2s ease;' +
      '}' +
      '.at-nesp-fab:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(0,0,0,.3); }' +
      '.at-nesp-fab:focus-visible { outline: 3px solid #c6a157; outline-offset: 3px; }' +
      '.at-nesp-fab svg { display: block; }' +
      '.at-nesp-fab--1 {' +
      '  width: 56px;' +
      '  height: 56px;' +
      '  border-radius: 999px;' +
      '  background: #17171a;' +
      '  color: #fff;' +
      '}' +
      '.at-nesp-fab--2 {' +
      '  height: 48px;' +
      '  padding: 0 18px;' +
      '  border-radius: 999px;' +
      '  background: linear-gradient(135deg, #17171a, #2a2a2f);' +
      '  color: #fff;' +
      '  font-size: 14px;' +
      '  font-weight: 600;' +
      '  letter-spacing: .04em;' +
      '  text-transform: uppercase;' +
      '}' +
      '.at-nesp-fab--3 {' +
      '  width: 56px;' +
      '  height: 56px;' +
      '  border-radius: 14px;' +
      '  background: #fff;' +
      '  color: #17171a;' +
      '  border: 2px solid #17171a;' +
      '}' +
      '.at-nesp-fab--4 {' +
      '  width: 56px;' +
      '  height: 56px;' +
      '  border-radius: 999px;' +
      '  background: rgba(255,255,255,.92);' +
      '  color: #17171a;' +
      '  border: 2px solid rgba(23,23,26,.35);' +
      '  backdrop-filter: blur(6px);' +
      '}' +
      '.at-nesp-fab--demo {' +
      '  position: relative;' +
      '  right: auto;' +
      '  bottom: auto;' +
      '  transform: none;' +
      '  box-shadow: 0 6px 18px rgba(0,0,0,.18);' +
      '}' +
      '.at-nesp-fab--demo:hover { transform: translateY(-1px); }' +
      '#' +
      MODAL_ID +
      '.at-nesp-faq-overlay {' +
      '  position: fixed;' +
      '  inset: 0;' +
      '  z-index: ' +
      zOver +
      ';' +
      '  display: none;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  padding: 16px;' +
      '  background: rgba(0,0,0,.55);' +
      '}' +
      '#' +
      MODAL_ID +
      '.at-nesp-faq-overlay[aria-hidden="false"] { display: flex; }' +
      '.at-nesp-faq-dialog {' +
      '  width: min(720px, 100%);' +
      '  max-height: min(80vh, 760px);' +
      '  overflow: auto;' +
      '  background: #fff;' +
      '  color: #17171a;' +
      '  border-radius: 12px;' +
      '  box-shadow: 0 24px 80px rgba(0,0,0,.35);' +
      '}' +
      '.at-nesp-faq-header {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: space-between;' +
      '  gap: 12px;' +
      '  padding: 16px 16px 12px;' +
      '  border-bottom: 1px solid #ececec;' +
      '  position: sticky;' +
      '  top: 0;' +
      '  background: #fff;' +
      '  z-index: 1;' +
      '}' +
      '.at-nesp-faq-title { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: .02em; }' +
      '.at-nesp-faq-close {' +
      '  width: 40px;' +
      '  height: 40px;' +
      '  border-radius: 10px;' +
      '  border: 1px solid #e3e3e3;' +
      '  background: #fff;' +
      '  cursor: pointer;' +
      '  display: inline-flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  color: #17171a;' +
      '}' +
      '.at-nesp-faq-close:hover { background: #f7f7f7; }' +
      '.at-nesp-faq-body { padding: 8px 8px 16px; }' +
      '.at-nesp-faq-item { border-bottom: 1px solid #f0f0f0; }' +
      '.at-nesp-faq-q {' +
      '  width: 100%;' +
      '  text-align: left;' +
      '  padding: 14px 12px;' +
      '  border: 0;' +
      '  background: transparent;' +
      '  cursor: pointer;' +
      '  font-size: 15px;' +
      '  font-weight: 600;' +
      '  color: #17171a;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: space-between;' +
      '  gap: 12px;' +
      '}' +
      '.at-nesp-faq-q:hover { background: #fafafa; }' +
      '.at-nesp-faq-chevron { flex: 0 0 auto; transition: transform .2s ease; opacity: .65; }' +
      '.at-nesp-faq-item[data-open="true"] .at-nesp-faq-chevron { transform: rotate(180deg); }' +
      '.at-nesp-faq-a {' +
      '  display: none;' +
      '  padding: 0 12px 14px;' +
      '  font-size: 14px;' +
      '  line-height: 1.55;' +
      '  color: #3a3a3a;' +
      '}' +
      '.at-nesp-faq-item[data-open="true"] .at-nesp-faq-a { display: block; }' +
      '#' +
      DEMO_BAR_ID +
      ' {' +
      '  position: fixed;' +
      '  left: 50%;' +
      '  bottom: 14px;' +
      '  transform: translateX(-50%);' +
      '  z-index: ' +
      zDemo +
      ';' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 10px;' +
      '  padding: 10px 12px;' +
      '  border-radius: 14px;' +
      '  background: rgba(255,255,255,.92);' +
      '  border: 1px solid rgba(23,23,26,.12);' +
      '  box-shadow: 0 10px 30px rgba(0,0,0,.18);' +
      '  backdrop-filter: blur(8px);' +
      '  max-width: calc(100vw - 24px);' +
      '  flex-wrap: wrap;' +
      '  justify-content: center;' +
      '}' +
      '#' +
      DEMO_BAR_ID +
      ' .at-nesp-fab-demo-label {' +
      '  width: 100%;' +
      '  text-align: center;' +
      '  font-size: 12px;' +
      '  font-weight: 700;' +
      '  letter-spacing: .06em;' +
      '  text-transform: uppercase;' +
      '  color: #17171a;' +
      '  opacity: .75;' +
      '}' +
      '@media (max-width: 520px) {' +
      '  .at-nesp-fab--2 { font-size: 12px; padding: 0 14px; }' +
      '}'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);
  }

  function clampVariant(n) {
    const x = Number(n);
    if (x === 2) return 2;
    if (x === 3) return 3;
    if (x === 4) return 4;
    return 1;
  }

  function buildFaqAccordionHtml() {
    let html = '';
    for (let i = 0; i < FAQ_ITEMS.length; i++) {
      const item = FAQ_ITEMS[i];
      const q = item.q;
      const a = item.a;
      html +=
        '<div class="at-nesp-faq-item" data-open="false" data-at-nesp-faq-idx="' +
        String(i) +
        '">' +
        '<button type="button" class="at-nesp-faq-q" aria-expanded="false">' +
        '<span>' +
        q +
        '</span>' +
        '<span class="at-nesp-faq-chevron" aria-hidden="true">v</span>' +
        '</button>' +
        '<div class="at-nesp-faq-a">' +
        a +
        '</div>' +
        '</div>';
    }
    return html;
  }

  function ensureModal() {
    let el = document.getElementById(MODAL_ID);
    if (el) return el;

    el = document.createElement('div');
    el.id = MODAL_ID;
    el.className = 'at-nesp-faq-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('aria-labelledby', 'at-nesp-faq-title');
    el.innerHTML =
      '<div class="at-nesp-faq-dialog" data-at-nesp-faq-dialog="1">' +
      '<div class="at-nesp-faq-header">' +
      '<h2 class="at-nesp-faq-title" id="at-nesp-faq-title">Perguntas frequentes</h2>' +
      '<button type="button" class="at-nesp-faq-close" aria-label="Fechar">' +
      ICON_CLOSE +
      '</button>' +
      '</div>' +
      '<div class="at-nesp-faq-body">' +
      buildFaqAccordionHtml() +
      '</div>' +
      '</div>';

    document.body.appendChild(el);

    const closeBtn = el.querySelector('.at-nesp-faq-close');
    if (closeBtn && !closeBtn.getAttribute('data-at-nesp-faq-close-added')) {
      closeBtn.setAttribute('data-at-nesp-faq-close-added', '1');
      closeBtn.addEventListener('click', function () {
        closeModal();
      });
    }

    el.addEventListener('click', function (ev) {
      if (ev.target === el) closeModal();
    });

    const body = el.querySelector('.at-nesp-faq-body');
    if (body && !body.getAttribute('data-at-nesp-faq-acc-added')) {
      body.setAttribute('data-at-nesp-faq-acc-added', '1');
      body.addEventListener('click', function (ev) {
        const btn = ev.target && ev.target.closest ? ev.target.closest('.at-nesp-faq-q') : null;
        if (!btn) return;
        const item = btn.closest('.at-nesp-faq-item');
        if (!item) return;
        const open = item.getAttribute('data-open') === 'true';
        const next = !open;
        item.setAttribute('data-open', next ? 'true' : 'false');
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
      });
    }

    return el;
  }

  function openModal(sourceLabel) {
    const modal = ensureModal();
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    sendTracking('AT_Nespresso_FAQModal_open ' + sourceLabel);
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    sendTracking('AT_Nespresso_FAQModal_close');
  }

  function onKeydown(ev) {
    if (ev.key === 'Escape') closeModal();
  }

  function bindGlobalEscOnce() {
    if (document.documentElement.getAttribute('data-at-nesp-faq-esc')) return;
    document.documentElement.setAttribute('data-at-nesp-faq-esc', '1');
    document.addEventListener('keydown', onKeydown);
  }

  function createFabButton(opts) {
    const variant = clampVariant(opts && opts.variant ? opts.variant : CONFIG.FAB_VARIANT);
    const isDemo = Boolean(opts && opts.demo);
    const label = opts && opts.label ? opts.label : 'Abrir perguntas frequentes';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'at-nesp-fab at-nesp-fab--' + String(variant) + (isDemo ? ' at-nesp-fab--demo' : '');
    btn.setAttribute('aria-label', label);

    if (variant === 2) {
      btn.innerHTML = ICON_HELP + '<span>Duvidas</span>';
    } else if (variant === 3) {
      btn.innerHTML = ICON_CHAT;
    } else {
      btn.innerHTML = ICON_HELP;
    }

    return btn;
  }

  function mountMainFab(root) {
    const existing = root.querySelector('[data-at-nesp-fab-main="1"]');
    if (existing) return;

    const btn = createFabButton({ variant: CONFIG.FAB_VARIANT, demo: false });
    btn.setAttribute('data-at-nesp-fab-main', '1');
    if (!btn.getAttribute('data-at-nesp-fab-listener')) {
      btn.setAttribute('data-at-nesp-fab-listener', '1');
      btn.addEventListener('click', function () {
        openModal('fab_principal_v' + String(clampVariant(CONFIG.FAB_VARIANT)));
      });
    }
    root.appendChild(btn);
  }

  function mountDemoBar() {
    if (!window.location.hash || window.location.hash.indexOf('at-faq-fab-exemplos') === -1) return;
    if (document.getElementById(DEMO_BAR_ID)) return;

    const bar = document.createElement('div');
    bar.id = DEMO_BAR_ID;

    const label = document.createElement('div');
    label.className = 'at-nesp-fab-demo-label';
    label.textContent = 'Exemplos de botoes (apresentacao)';
    bar.appendChild(label);

    for (let v = 1; v <= 4; v++) {
      const b = createFabButton({ variant: v, demo: true, label: 'Abrir FAQ (exemplo estilo ' + String(v) + ')' });
      b.setAttribute('data-at-nesp-fab-demo', String(v));
      if (!b.getAttribute('data-at-nesp-fab-listener')) {
        b.setAttribute('data-at-nesp-fab-listener', '1');
        b.addEventListener('click', function () {
          openModal('fab_demo_v' + String(v));
        });
      }
      bar.appendChild(b);
    }

    document.body.appendChild(bar);
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);
    return root;
  }

  function init() {
    if (!shouldRunOnPage()) return;

    injectStyles();
    bindGlobalEscOnce();

    const root = ensureRoot();
    mountMainFab(root);
    mountDemoBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
