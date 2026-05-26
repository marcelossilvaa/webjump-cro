(function () {
  'use strict';

  const STYLE_ID = 'wj-nespresso-faq-style';
  const MAX_ATTEMPTS = 20;
  const INTERVAL_MS = 200;

  const FAQ_ITEMS = [
    {
      label: 'O que é a Assinatura?',
      answer:
        '<p>Assinatura de Cafés é uma maneira simples e fácil de garantir que você <strong>nunca fique sem seus cafés Nespresso favoritos</strong>. É um serviço de <strong>entrega ou reabastecimento automático</strong>. Você só precisa programar uma vez a sua Assinatura de Cafés com os seus cafés selecionados e pronto. Todos os cafés <strong>Original e Vertuo</strong> estão disponíveis para pedido neste serviço.</p>' +
        '<p>É fácil de configurar a sua Assinatura de Cafés através do <strong>Site, Aplicativo Nespresso ou nas Boutiques</strong> – você pode fazer um pedido do zero ou com base em um pedido anterior. Basta selecionar seus cafés favoritos, a frequência de entrega (<strong>semanal, quinzenal, mensal, bimestral</strong>), o endereço de entrega e fornecer os dados do seu cartão de crédito. Você pode <strong>modificar ou cancelar a qualquer momento, sem taxas e sem compromisso</strong>.</p>' +
        '<p>E não se esqueça: só com a Assinatura de Cafés você garante <strong>10% de desconto nos seus cafés todo mês</strong>.</p>' +
        '<p>Exclusivamente aos clientes com status <strong>‘Ambassador’</strong> no programa Nespresso & YOU, ao realizarem uma Assinatura a partir de <strong>100 cápsulas</strong> receberão automaticamente <strong>15% de desconto</strong> nas entregas automáticas. O desconto <strong>não será aplicado para compras fora da Assinatura</strong>.</p>' +
        '<p>Clientes com assinatura na modalidade antiga (10% de crédito extra mensal), ao manterem a assinatura ativa e aderirem à nova, serão elegíveis a <strong>5% de desconto nas entregas automáticas a partir de 30 cápsulas</strong>.</p>',
    },
    {
      label: 'Vantagens de fazer uma Assinatura',
      answer:
        '<p>Ao configurar uma Assinatura de Cafés, você garante que <strong>nunca ficará sem seus cafés favoritos</strong> e terá desconto em todos os pedidos da assinatura. Para pedidos a partir de <strong>30 cápsulas</strong>, você garante <strong>10% de desconto</strong> e <strong>frete grátis</strong> nos pedidos programados.</p>' +
        '<p>Clientes <strong>‘Ambassador’</strong> (Nespresso & YOU) com Assinatura a partir de <strong>100 cápsulas</strong> recebem <strong>15% de desconto</strong> nas entregas automáticas. Esse desconto <strong>não vale para compras fora da Assinatura</strong>.</p>' +
        '<p>Quem mantém a assinatura antiga ativa e adere à nova modalidade pode ter <strong>5% de desconto a partir de 30 cápsulas</strong>.</p>' +
        '<p><strong>O desconto vale apenas nos cafés da Assinatura de Cafés</strong>, não em pedidos avulsos.</p>',
    },
    {
      label: 'Como alterar ou cancelar',
      answer:
        '<p>Antes de cada envio, você receberá um <strong>e-mail sobre a próxima entrega</strong>. Para cancelar ou modificar o próximo envio (cafés, data etc.), você tem até <strong>2 dias antes do envio</strong>, <strong>sem taxas</strong>. Acesse <strong>Nespresso.com</strong>, o <strong>Aplicativo Nespresso</strong>, uma <strong>Boutique</strong> ou ligue <strong>0800 7777 737</strong>.</p>' +
        '<p><strong>Não há taxa</strong> para criar, modificar ou cancelar sua Assinatura de Cafés. Há apenas uma <strong>cobrança simbólica</strong> no cartão para validar o meio de pagamento.</p>' +
        '<p>Após o envio, você pode <strong>recusar a entrega</strong> ou <strong>devolver os produtos</strong> conforme a Política de Venda, pelo Atendimento <strong>0800 7777 737</strong>.</p>',
    },
    {
      label: 'Formas de pagamento aceitas',
      answer:
        '<p>Pagamento com <strong>cartão de crédito recorrente</strong>, na frequência escolhida (semanal, quinzenal, mensal ou bimestral), enquanto a assinatura estiver ativa. A cobrança ocorre <strong>pouco antes do envio de cada pedido</strong>.</p>' +
        '<p>É necessário um <strong>cartão de crédito válido</strong>. Você receberá <strong>e-mail automático</strong> quando o cartão estiver perto do vencimento. Se o pagamento falhar por cartão expirado, aguardamos a <strong>atualização dos dados</strong> para uma <strong>segunda tentativa de cobrança e envio</strong>.</p>',
    },
    {
      label: 'E se um café esgotar?',
      answer:
        '<p>Se um item ficar sem estoque, <strong>o restante do pedido ainda será enviado</strong> e você será cobrado <strong>apenas pelos itens enviados</strong>. Você receberá um <strong>e-mail antecipado</strong> informando o que ficará de fora e o que será enviado.</p>' +
        '<p><strong>Cafés de edição limitada não estão disponíveis</strong> na Assinatura de Cafés.</p>',
    },
    {
      label: 'Quantidade mínima de cápsulas',
      answer:
        '<p><strong>Não há quantidade mínima</strong> para criar uma Assinatura de Cafés. Pedidos de <strong>30 cápsulas ou mais</strong>: <strong>frete grátis</strong> e <strong>10% de desconto</strong>. Abaixo de 30 cápsulas, há <strong>taxa de frete padrão</strong>.</p>' +
        '<p>Você receberá um <strong>e-mail antes do envio</strong> e pode alterar ou cancelar até <strong>2 dias antes do envio</strong>.</p>',
    },
    {
      label: 'Posso ter várias Assinatura de Cafés?',
      answer:
        '<p><strong>Sim.</strong> Você pode ter <strong>vários Pedidos Automáticos ativos</strong> e dar um <strong>nome diferente a cada um</strong> (ex.: Pedido da tia Mary, Pedido Casa).</p>',
    },
  ];

  const FAQ_HEADER = 'Principais dúvidas sobre assinatura';
  const FULL_FAQ_LINK_LABEL = 'Alguma pergunta? Leia as perguntas frequentes';

  let modalTriggerButton = null;
  let originalFaqBlock = null;

  const PLACEMENTS = [
    {
      wrapperId: 'wj-nespresso-faq-lateral',
      prefix: 'wj-faq-sidebar',
      targetSelector: 'div._sidebar__list_i70mm_676[role="menu"]',
      mount: 'insertAfter',
      attempts: 0,
    },
    {
      wrapperId: 'wj-nespresso-faq-mobile',
      prefix: 'wj-faq-mobile',
      mount: 'insertBeforeBlock',
      attempts: 0,
    },
  ];

  function getArrowSvg(prefix) {
    return (
      '<svg class="' +
      prefix +
      '__arrow-icon" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M3.25 1.75L6.75 5L3.25 8.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }

  function getBlockCss(p, rootExtra, hideOnMinWidth) {
    var hideRule = hideOnMinWidth
      ? '@media screen and (min-width: ' +
        hideOnMinWidth +
        'px) { .' +
        p +
        ' { display: none !important; } }'
      : '@media screen and (max-width: 1024px) { .' + p + ' { display: none !important; } }';

    return (
      '.' +
      p +
      ' { background: #EBEBEB; border-radius: 20px; padding: 20px 18px; max-width: 100%; box-sizing: border-box; ' +
      rootExtra +
      ' }' +
      '.' +
      p +
      '__header { color: #1A1A1A; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 18px; line-height: 24px; font-weight: 700; margin: 0 0 16px; }' +
      '.' +
      p +
      '__list { list-style: none; margin: 0; padding: 0; }' +
      '.' +
      p +
      '__item { border-top: 1px solid #CFCFCF; margin: 0; padding: 10px 0; transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1); }' +
      '.' +
      p +
      '__item:first-child { border-top: 0; }' +
      '.' +
      p +
      '__button { width: 100%; display: flex; align-items: flex-start; gap: 10px; border: 0; background: none; padding: 0; margin: 0; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 20px; font-weight: 400; color: #1A1A1A; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color 0.25s ease; }' +
      '.' +
      p +
      '__button:hover { color: #000000; }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__button { font-weight: 500; }' +
      '.' +
      p +
      '__arrow { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 16px; height: 20px; color: #1A1A1A; }' +
      '.' +
      p +
      '__arrow-icon { display: block; transform: rotate(0deg); transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1); }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__arrow-icon { transform: rotate(90deg); }' +
      '.' +
      p +
      '__text { display: inline-block; flex: 1; transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__text { transform: translateX(2px); }' +
      '.' +
      p +
      '__answer { display: grid; grid-template-rows: 0fr; margin: 0; padding: 0; transition: grid-template-rows 0.45s cubic-bezier(0.4, 0, 0.2, 1); }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__answer { grid-template-rows: 1fr; }' +
      '.' +
      p +
      '__answer-inner { overflow: hidden; min-height: 0; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 18px; font-weight: 400; color: #555555; opacity: 0; transform: translateY(-8px); padding-top: 0; transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1); }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__answer-inner { opacity: 1; transform: translateY(0); padding-top: 10px; transition-delay: 0.08s; }' +
      '.' +
      p +
      '__item--closing .' +
      p +
      '__answer-inner { transition-delay: 0s; transition-duration: 0.25s; }' +
      '.' +
      p +
      '__answer-inner p { margin: 0 0 10px; }' +
      '.' +
      p +
      '__answer-inner p:last-child { margin-bottom: 0; }' +
      '.' +
      p +
      '__answer-inner strong { color: #1A1A1A; font-weight: 600; }' +
      '.' +
      p +
      '__footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #CFCFCF; }' +
      hideRule
    );
  }

  function createStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      getBlockCss('wj-faq-sidebar', 'margin-top: 24px;', null) +
      getBlockCss('wj-faq-mobile', 'margin: 16px 0 0; width: 100%;', 1025) +
      '[data-wj-faq-preserved="true"] { position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important;opacity:0.01!important;pointer-events:none!important; }' +
      '[data-wj-faq-preserved="true"] button[class*="_link_"] { pointer-events:auto!important;position:fixed!important;left:0!important;top:0!important;width:1px!important;height:1px!important;opacity:0.01!important; }' +
      '@media (prefers-reduced-motion: reduce) { .wj-faq-sidebar__arrow, .wj-faq-sidebar__arrow-icon, .wj-faq-sidebar__answer, .wj-faq-sidebar__answer-inner, .wj-faq-sidebar__text, .wj-faq-sidebar__item, .wj-faq-mobile__arrow, .wj-faq-mobile__arrow-icon, .wj-faq-mobile__answer, .wj-faq-mobile__answer-inner, .wj-faq-mobile__text, .wj-faq-mobile__item { transition: none !important; } }';

    document.head.appendChild(style);
  }

  function isInsideOurFaq(node) {
    if (!node) {
      return false;
    }

    return !!(node.closest('#' + PLACEMENTS[0].wrapperId) || node.closest('#' + PLACEMENTS[1].wrapperId));
  }

  function removeLegacyStash() {
    var stash =
      document.getElementById('wj-nespresso-faq-modal-stash') ||
      document.getElementById('wj-nespresso-faq-modal-stub');
    var block;

    if (!stash) {
      return;
    }

    block = stash.querySelector('[class*="_ListFooter__faq"]');
    if (block) {
      document.body.appendChild(block);
    }

    stash.parentNode.removeChild(stash);
  }

  function findOriginalFaqBlock() {
    var nodes = document.querySelectorAll('div[class*="_ListFooter__faq"]');
    var modalLinks = document.querySelectorAll('[class*="_Modal__textLink"]');
    var i;
    var wrap;

    for (i = 0; i < nodes.length; i += 1) {
      if (!isInsideOurFaq(nodes[i])) {
        return nodes[i];
      }
    }

    for (i = 0; i < modalLinks.length; i += 1) {
      if (!isInsideOurFaq(modalLinks[i]) && modalLinks[i].querySelector('button[class*="_link_"]')) {
        wrap = modalLinks[i].closest('[class*="_ListFooter__faq"]');
        return wrap || modalLinks[i].parentNode;
      }
    }

    return null;
  }

  function registerOriginalFaqLink() {
    var block;

    if (modalTriggerButton && modalTriggerButton.isConnected) {
      return modalTriggerButton;
    }

    if (originalFaqBlock && originalFaqBlock.isConnected) {
      modalTriggerButton = originalFaqBlock.querySelector('button[class*="_link_"]');
      return modalTriggerButton;
    }

    block = findOriginalFaqBlock();
    if (!block) {
      return null;
    }

    originalFaqBlock = block;
    modalTriggerButton = block.querySelector('button[class*="_link_"]');
    if (!modalTriggerButton) {
      return null;
    }

    block.setAttribute('data-wj-faq-preserved', 'true');
    return modalTriggerButton;
  }

  function createFaqLinkMarkupHtml() {
    return (
      '<div class="_ListFooter__faq_12zdz_653">' +
      '<div class="_Modal__textLink_pxqa6_627">' +
      '<button type="button" class="_link_341ep_1">' +
      '<span class="_label_341ep_29">' +
      FULL_FAQ_LINK_LABEL +
      '</span>' +
      '</button>' +
      '</div>' +
      '</div>'
    );
  }

  function footerHasLink(footer) {
    return !!(footer && footer.querySelector('button[class*="_link_"]'));
  }

  function triggerOriginalModal() {
    var btn;
    var opts;

    registerOriginalFaqLink();
    btn = modalTriggerButton;

    if (!btn || !btn.isConnected) {
      return false;
    }

    opts = { bubbles: true, cancelable: true, view: window };
    btn.dispatchEvent(new PointerEvent('pointerdown', opts));
    btn.dispatchEvent(new PointerEvent('pointerup', opts));
    btn.dispatchEvent(new MouseEvent('click', opts));
    btn.click();

    return true;
  }

  function wireFooterModalProxy(faqElement) {
    var prefix = faqElement.className.indexOf('wj-faq-mobile') !== -1 ? 'wj-faq-mobile' : 'wj-faq-sidebar';
    var footerButtons = faqElement.querySelectorAll('.' + prefix + '__footer button[class*="_link_"]');
    var i;
    var btn;

    for (i = 0; i < footerButtons.length; i += 1) {
      btn = footerButtons[i];
      if (btn.getAttribute('data-wj-modal-proxy') === 'true') {
        continue;
      }

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        triggerOriginalModal();
      });
      btn.setAttribute('data-wj-modal-proxy', 'true');
    }
  }

  function moveOriginalBlockToFooter(footer) {
    if (!originalFaqBlock || footer.contains(originalFaqBlock)) {
      return !!modalTriggerButton;
    }

    originalFaqBlock.removeAttribute('data-wj-faq-preserved');
    originalFaqBlock.style.cssText = '';
    footer.appendChild(originalFaqBlock);
    return true;
  }

  function attachFooterLink(faqElement, prefix, preferOriginalBlock) {
    var footer = faqElement.querySelector('.' + prefix + '__footer');

    if (!footer) {
      return false;
    }

    registerOriginalFaqLink();

    if (preferOriginalBlock && moveOriginalBlockToFooter(footer)) {
      return true;
    }

    if (!footerHasLink(footer)) {
      footer.innerHTML = createFaqLinkMarkupHtml();
      wireFooterModalProxy(faqElement);
    }

    return footerHasLink(footer) && !!modalTriggerButton;
  }

  function scheduleFooterLinkRetries(faqElement, prefix, preferOriginalBlock) {
    var attempts = 0;

    function retry() {
      if (attachFooterLink(faqElement, prefix, preferOriginalBlock)) {
        return;
      }

      attempts += 1;
      if (attempts < MAX_ATTEMPTS) {
        window.setTimeout(retry, INTERVAL_MS);
      }
    }

    window.setTimeout(retry, INTERVAL_MS);
  }

  function appendFullFaqLink(faqElement, prefix) {
    var footer = document.createElement('div');
    footer.className = prefix + '__footer';
    faqElement.appendChild(footer);
  }

  function createFaqItem(prefix, label, answer) {
    return (
      '<li class="' +
      prefix +
      '__item" role="none">' +
      '<button type="button" class="' +
      prefix +
      '__button" role="menuitem" aria-expanded="false">' +
      '<span class="' +
      prefix +
      '__arrow">' +
      getArrowSvg(prefix) +
      '</span>' +
      '<span class="' +
      prefix +
      '__text">' +
      label +
      '</span>' +
      '</button>' +
      '<div class="' +
      prefix +
      '__answer"><div class="' +
      prefix +
      '__answer-inner">' +
      answer +
      '</div></div>' +
      '</li>'
    );
  }

  function createFaqMarkup(placement) {
    var itemsHtml = '';
    var i;
    var prefix = placement.prefix;
    var wrapperId = placement.wrapperId;

    for (i = 0; i < FAQ_ITEMS.length; i++) {
      itemsHtml += createFaqItem(prefix, FAQ_ITEMS[i].label, FAQ_ITEMS[i].answer);
    }

    return (
      '<div id="' +
      wrapperId +
      '" class="' +
      prefix +
      '" aria-label="' +
      FAQ_HEADER +
      '">' +
      '<div class="' +
      prefix +
      '__header">' +
      FAQ_HEADER +
      '</div>' +
      '<ul class="' +
      prefix +
      '__list" role="menu" aria-label="' +
      FAQ_HEADER +
      '">' +
      itemsHtml +
      '</ul>' +
      '</div>'
    );
  }

  function setItemOpen(item, isOpen, prefix) {
    var button = item.querySelector('.' + prefix + '__button');
    var openClass = prefix + '__item--open';
    var closingClass = prefix + '__item--closing';

    if (isOpen) {
      item.classList.remove(closingClass);
      item.classList.add(openClass);
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    if (!item.classList.contains(openClass)) {
      return;
    }

    item.classList.add(closingClass);
    item.classList.remove(openClass);
    if (button) {
      button.setAttribute('aria-expanded', 'false');
    }

    window.setTimeout(function () {
      item.classList.remove(closingClass);
    }, 450);
  }

  function closeOtherItems(wrapperId, prefix, currentItem) {
    var items = document.querySelectorAll('#' + wrapperId + ' .' + prefix + '__item');
    var i;

    for (i = 0; i < items.length; i++) {
      if (items[i] !== currentItem) {
        setItemOpen(items[i], false, prefix);
      }
    }
  }

  function toggleAnswer(event) {
    var button = event.currentTarget;
    var wrapperId = button.getAttribute('data-faq-wrapper');
    var prefix = button.getAttribute('data-faq-prefix');
    var item = button.parentNode;
    var openClass = prefix + '__item--open';
    var isOpen = item.classList.contains(openClass);

    if (!isOpen) {
      closeOtherItems(wrapperId, prefix, item);
      setItemOpen(item, true, prefix);
      return;
    }

    setItemOpen(item, false, prefix);
  }

  function addEventListeners(placement) {
    var buttons = document.querySelectorAll(
      '#' + placement.wrapperId + ' .' + placement.prefix + '__button',
    );
    var i;

    for (i = 0; i < buttons.length; i++) {
      if (!buttons[i].hasAttribute('data-listener-added')) {
        buttons[i].setAttribute('data-faq-wrapper', placement.wrapperId);
        buttons[i].setAttribute('data-faq-prefix', placement.prefix);
        buttons[i].addEventListener('click', toggleAnswer);
        buttons[i].setAttribute('data-listener-added', 'true');
      }
    }
  }

  function mountPlacement(placement) {
    var target;
    var faqContainer;
    var faqElement;
    var i;

    if (document.getElementById(placement.wrapperId)) {
      return;
    }

    if (placement.mount === 'insertAfter') {
      target = document.querySelector(placement.targetSelector);
      if (!target) {
        placement.attempts += 1;
        if (placement.attempts < MAX_ATTEMPTS) {
          window.setTimeout(function () {
            mountPlacement(placement);
          }, INTERVAL_MS);
        }
        return;
      }

      faqContainer = document.createElement('div');
      faqContainer.innerHTML = createFaqMarkup(placement);
      faqElement = faqContainer.firstChild;
      appendFullFaqLink(faqElement, placement.prefix);
      target.parentNode.insertBefore(faqElement, target.nextSibling);
      attachFooterLink(faqElement, placement.prefix, true);
      scheduleFooterLinkRetries(faqElement, placement.prefix, true);
      addEventListeners(placement);
      return;
    }

    if (placement.mount === 'insertBeforeBlock') {
      var pageBlock = findOriginalFaqBlock();

      if (!pageBlock) {
        placement.attempts += 1;
        if (placement.attempts < MAX_ATTEMPTS) {
          window.setTimeout(function () {
            mountPlacement(placement);
          }, INTERVAL_MS);
        }
        return;
      }

      registerOriginalFaqLink();
      faqContainer = document.createElement('div');
      faqContainer.innerHTML = createFaqMarkup(placement);
      faqElement = faqContainer.firstChild;
      appendFullFaqLink(faqElement, placement.prefix);
      pageBlock.parentNode.insertBefore(faqElement, pageBlock);
      attachFooterLink(faqElement, placement.prefix, false);
      scheduleFooterLinkRetries(faqElement, placement.prefix, false);
      addEventListeners(placement);
    }
  }

  function init() {
    var i;

    createStyle();
    removeLegacyStash();

    for (i = 0; i < PLACEMENTS.length; i += 1) {
      mountPlacement(PLACEMENTS[i]);
    }
  }

  function readyHandler() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  readyHandler();
})();
