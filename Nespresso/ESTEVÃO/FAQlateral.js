(function () {
  'use strict';

  const STYLE_ID = 'wj-nespresso-faq-style';
  const MAX_ATTEMPTS = 50;
  const INTERVAL_MS = 200;

  const FAQ_ITEMS = [
    {
      label: 'O que é a Assinatura de Cafés?',
      answer:
        '<p>A Assinatura de Cafés é um serviço de <strong>entrega automática da Nespresso</strong> que permite programar seus cafés favoritos para recebê-los na frequência e endereço de sua preferência, sem precisar realizar novos pedidos manualmente.</p>' +
        '<p>A Assinatura pode ser criada <strong>gratuitamente</strong> pelo site, <strong>APP Nespresso</strong> ou pela <strong>Central de Atendimento</strong>. Basta selecionar os cafés desejados, definir a frequência de entrega e cadastrar um cartão válido para cobranças recorrentes.</p>' +
        '<p>Além da praticidade, Assinaturas a partir de <strong>30 cápsulas</strong> garantem <strong>10% de desconto</strong> e <strong>frete grátis</strong> nos pedidos automáticos. A assinatura também pode ser <strong>alterada ou cancelada a qualquer momento, sem taxas</strong>.</p>',
    },
    {
      label: 'Como modificar ou cancelar',
      answer:
        '<p>A atualização, modificação ou cancelamento da sua Assinatura pode ser realizada pelo <strong>site ou APP</strong>, acessando sua conta em <strong>Minhas Assinaturas de Café</strong>. Caso prefira, você também pode entrar em contato com a Nespresso pelo telefone <strong>0800 7777 737</strong>, disponível de segunda a sábado, das 6h às 22h.</p>' +
        '<p>Antes de cada envio, você receberá um <strong>e-mail com as informações da próxima entrega</strong>. Caso deseje alterar qualquer detalhe do próximo pedido (seleção de cafés, quantidade ou data de entrega) ou cancelar o envio, a solicitação poderá ser realizada em até <strong>2 dias antes do processamento do pedido</strong>, <strong>sem cobrança de taxas</strong>.</p>',
    },
    {
      label: 'Método de pagamento',
      answer:
        '<p>Caso identifiquemos algum problema no processamento do pagamento da sua assinatura, enviaremos um <strong>alerta solicitando a atualização dos dados</strong>. Essa alteração pode ser realizada pelo site ou APP, acessando sua conta em <strong>Minhas Assinaturas de Café</strong>, na seção <strong>Pagamento</strong>.</p>' +
        '<p>Para garantir que a atualização seja concluída com sucesso, verifique se o cartão está habilitado para <strong>compras online recorrentes</strong> (modelo de cobrança automática de assinatura), se o cartão virtual utilizado possui <strong>numeração fixa</strong> (sem alteração automática ao longo do tempo) e se sua instituição bancária autoriza esse tipo de transação recorrente.</p>',
    },
    {
      label: 'Cartão de crédito expirado',
      answer:
        '<p>Ao configurar sua Assinatura de Cafés, é necessário cadastrar um <strong>cartão de crédito válido</strong> para o processamento automático dos pedidos. Para garantir o funcionamento correto da assinatura, recomendamos utilizar um cartão habilitado para <strong>compras online recorrentes</strong> e, no caso de cartões virtuais, que possuam <strong>numeração fixa</strong>, sem alteração automática ao longo do tempo.</p>' +
        '<p>Caso o vencimento do cartão esteja próximo, você receberá um <strong>e-mail automático</strong> solicitando a atualização dos dados de pagamento. Se houver falha no processamento devido a cartão expirado ou recusado pela instituição financeira, seu pedido ficará <strong>temporariamente pendente</strong> até a atualização das informações. Após a regularização dos dados, uma <strong>nova tentativa de cobrança</strong> será realizada para seguir com o envio do pedido.</p>',
    },
    {
      label: 'Falhas no pagamento',
      answer:
        '<p>Caso ocorra alguma falha no pagamento da mensalidade da Assinatura de Café, serão realizadas <strong>novas tentativas de cobrança</strong> no cartão de crédito cadastrado.</p>' +
        '<p>Para evitar interrupções no serviço, é importante manter os dados de pagamento sempre atualizados e garantir que o cartão possua <strong>limite disponível</strong>, esteja <strong>dentro do prazo de validade</strong> e habilitado para compras online recorrentes. No caso de cartões virtuais, recomendamos a utilização de cartões com <strong>numeração fixa</strong>, que não exijam validações recorrentes ou alteração automática de dados.</p>' +
        '<p>Caso as tentativas de cobrança não sejam concluídas com sucesso, sua Assinatura poderá ficar <strong>temporariamente em espera</strong> até a regularização do pagamento. A reativação ocorrerá após a confirmação do pagamento pendente.</p>' +
        '<p>O cancelamento pode ser realizado pelo site Nespresso, em <strong>Minha Conta &gt; Minhas Assinaturas</strong>, pela Central de Atendimento no telefone <strong>0800 7777 737</strong> ou em uma de nossas Boutiques.</p>',
    },
    {
      label: 'Taxas de adesão ou cancelamento',
      answer:
        '<p><strong>Não.</strong> A criação, modificação ou cancelamento da sua Assinatura de Cafés pode ser realizada <strong>sem qualquer cobrança de taxa</strong>.</p>' +
        '<p>No momento da adesão, poderá ser realizada apenas uma <strong>cobrança simbólica</strong> no cartão de crédito, utilizada exclusivamente para validar se o cartão está ativo e apto para compras recorrentes.</p>',
    },
    {
      label: 'Vantagens da Assinatura',
      answer:
        '<p>Com a Assinatura de Cafés, você recebe automaticamente seus cafés favoritos na frequência escolhida, com mais <strong>praticidade</strong> e sem precisar realizar novos pedidos manualmente.</p>' +
        '<p>Além disso, Assinaturas a partir de <strong>30 cápsulas</strong> garantem <strong>10% de desconto</strong>, <strong>frete grátis</strong> nos pedidos automáticos e acesso ao status <strong>Ambassador</strong> do programa <strong>Nespresso Club</strong>.</p>',
    },
  ];

  function sendGAEvent(action, label) {
    var eventAction = action;
    var eventLabel = label;

    if (typeof eventLabel === 'undefined') {
      eventLabel = eventAction;
      eventAction = 'click';
    }

    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'user engagement',
      local_event_action: eventAction,
      local_event_label: eventLabel,
    });
  }

  function slugifyTrackingLabel(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function trackFaqView(placement) {
    var suffix = placement.prefix === 'wj-faq-sidebar' ? 'lateral' : 'mobile';

    if (placement.trackingViewSent) {
      return;
    }

    sendGAEvent('view', 'visualizou_faq_assinatura_' + suffix);
    placement.trackingViewSent = true;
  }

  const FAQ_HEADER = 'Principais dúvidas sobre assinatura';
  const FULL_FAQ_LINK_LABEL = 'Quer saber mais? Confira o conteúdo completo';

  let nativeFaqButton = null;
  let faqInsertAnchor = null;

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
      '__item { border-top: 1px solid #CFCFCF; margin: 0; padding: 10px 0; contain: layout style; }' +
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
      '__arrow-icon { display: block; transform: rotate(0deg); transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1); }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__arrow-icon { transform: rotate(90deg); }' +
      '.' +
      p +
      '__text { display: inline-block; flex: 1; }' +
      '.' +
      p +
      '__answer { display: grid; grid-template-rows: 0fr; margin: 0; padding: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1); }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__answer { grid-template-rows: 1fr; }' +
      '.' +
      p +
      '__item--opening .' +
      p +
      '__answer { will-change: grid-template-rows; }' +
      '.' +
      p +
      '__answer-inner { overflow: hidden; min-height: 0; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 18px; font-weight: 400; color: #555555; opacity: 0; padding-top: 0; transition: opacity 0.22s ease; content-visibility: hidden; }' +
      '.' +
      p +
      '__item--open .' +
      p +
      '__answer-inner { opacity: 1; padding-top: 10px; content-visibility: visible; transition-delay: 0.06s; }' +
      '.' +
      p +
      '__item--closing .' +
      p +
      '__answer-inner { transition-duration: 0.15s; transition-delay: 0s; }' +
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
      '__footer { margin-top: 8px; }' +
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
      '.wj-faq-sidebar__button { font-size: 16px; line-height: 22px; }' +
      '.wj-faq-sidebar__answer-inner { font-size: 14px; line-height: 20px; }' +
      '.wj-faq-sidebar__full-link, .wj-faq-mobile__full-link { align-items: center; appearance: none; -webkit-appearance: none; background: none; border: none; color: #876c43; cursor: pointer; display: inline-flex; flex-direction: row-reverse; font-family: inherit; font-size: 1rem; font-weight: 400; gap: .25rem; letter-spacing: .015625rem; line-height: 1.2; margin: 0; padding: 0; text-align: start; text-decoration-line: underline; transition: box-shadow .08s ease-in-out; }' +
      '.wj-faq-sidebar__full-link:hover, .wj-faq-mobile__full-link:hover { color: #876c43; }' +
      'button[data-wj-faq-native-trigger-hidden="true"] { position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; clip-path: inset(50%) !important; white-space: nowrap !important; border: 0 !important; padding: 0 !important; margin: -1px !important; opacity: 0 !important; pointer-events: none !important; }' +
      '@media (prefers-reduced-motion: reduce) { .wj-faq-sidebar__arrow, .wj-faq-sidebar__arrow-icon, .wj-faq-sidebar__answer, .wj-faq-sidebar__answer-inner, .wj-faq-sidebar__text, .wj-faq-sidebar__item, .wj-faq-mobile__arrow, .wj-faq-mobile__arrow-icon, .wj-faq-mobile__answer, .wj-faq-mobile__answer-inner, .wj-faq-mobile__text, .wj-faq-mobile__item { transition: none !important; } }';

    document.head.appendChild(style);
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function isActiveFaqMounted() {
    if (isMobileViewport()) {
      return !!document.getElementById(PLACEMENTS[1].wrapperId);
    }

    return !!document.getElementById(PLACEMENTS[0].wrapperId);
  }

  function isInsideOurFaq(node) {
    if (!node) {
      return false;
    }

    return !!(
      node.closest('#' + PLACEMENTS[0].wrapperId) || node.closest('#' + PLACEMENTS[1].wrapperId)
    );
  }

  function isOurProxyButton(node) {
    return !!(node && node.closest('[data-wj-faq-proxy-target="true"]'));
  }

  function restoreRelocatedNativeBlocks() {
    var relocated = document.querySelectorAll('[data-wj-faq-relocated="true"]');
    var i;
    var block;
    var anchor;

    for (i = 0; i < relocated.length; i += 1) {
      block = relocated[i];
      anchor = faqInsertAnchor;

      if (anchor && anchor.parent && anchor.parent.isConnected) {
        anchor.parent.insertBefore(block, anchor.next);
      } else if (document.body) {
        document.body.appendChild(block);
      }

      block.removeAttribute('data-wj-faq-relocated');
    }
  }

  function captureFaqInsertAnchor(block) {
    if (!block || !block.parentNode || faqInsertAnchor) {
      return;
    }

    faqInsertAnchor = {
      parent: block.parentNode,
      next: block.nextSibling,
    };
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
      if (!isInsideOurFaq(nodes[i]) && !nodes[i].hasAttribute('data-wj-faq-relocated')) {
        return nodes[i];
      }
    }

    for (i = 0; i < modalLinks.length; i += 1) {
      if (
        !isInsideOurFaq(modalLinks[i]) &&
        !isOurProxyButton(modalLinks[i]) &&
        modalLinks[i].querySelector('button[class*="_link_"]')
      ) {
        wrap = modalLinks[i].closest('[class*="_ListFooter__faq"]');
        return wrap || modalLinks[i];
      }
    }

    return null;
  }

  function buttonMatchesFaqLabel(btn) {
    var label;

    if (!btn) {
      return false;
    }

    label = btn.textContent ? btn.textContent.replace(/\s+/g, ' ').trim() : '';
    return (
      label.indexOf('perguntas frequentes') !== -1 || label.indexOf('Alguma pergunta') !== -1
    );
  }

  function findNativeFaqButton() {
    var buttons = document.querySelectorAll('button[class*="_link_"]');
    var modalButtons = document.querySelectorAll('[class*="_Modal__textLink"] button[class*="_link_"]');
    var i;
    var btn;

    if (nativeFaqButton && nativeFaqButton.isConnected && !isOurProxyButton(nativeFaqButton)) {
      return nativeFaqButton;
    }

    for (i = 0; i < modalButtons.length; i += 1) {
      btn = modalButtons[i];
      if (isOurProxyButton(btn)) {
        continue;
      }
      if (buttonMatchesFaqLabel(btn)) {
        nativeFaqButton = btn;
        return btn;
      }
    }

    for (i = 0; i < modalButtons.length; i += 1) {
      if (!isOurProxyButton(modalButtons[i])) {
        nativeFaqButton = modalButtons[i];
        return modalButtons[i];
      }
    }

    for (i = 0; i < buttons.length; i += 1) {
      btn = buttons[i];
      if (isOurProxyButton(btn) || isInsideOurFaq(btn)) {
        continue;
      }
      if (buttonMatchesFaqLabel(btn)) {
        nativeFaqButton = btn;
        return btn;
      }
    }

    return null;
  }

  function getReactOnClick(el) {
    var key;

    if (!el) {
      return null;
    }

    for (key in el) {
      if (
        Object.prototype.hasOwnProperty.call(el, key) &&
        key.indexOf('__reactProps$') === 0 &&
        el[key] &&
        typeof el[key].onClick === 'function'
      ) {
        return el[key].onClick;
      }
    }

    return null;
  }

  function getReactOnClickFromFiber(el) {
    var fiberKey;
    var fiber;
    var depth;

    if (!el) {
      return null;
    }

    for (fiberKey in el) {
      if (!Object.prototype.hasOwnProperty.call(el, fiberKey) || fiberKey.indexOf('__reactFiber$') !== 0) {
        continue;
      }

      fiber = el[fiberKey];
      depth = 0;

      while (fiber && depth < 16) {
        if (fiber.memoizedProps && typeof fiber.memoizedProps.onClick === 'function') {
          return fiber.memoizedProps.onClick;
        }
        if (fiber.pendingProps && typeof fiber.pendingProps.onClick === 'function') {
          return fiber.pendingProps.onClick;
        }
        fiber = fiber.return;
        depth += 1;
      }
    }

    return null;
  }

  function invokeReactClick(el) {
    var onClick;
    var syntheticEvent;
    var node;
    var depth;

    node = el;
    depth = 0;

    while (node && depth < 8) {
      onClick = getReactOnClick(node) || getReactOnClickFromFiber(node);

      if (onClick) {
        try {
          onClick();
          return true;
        } catch (errNoArg) {
          /* continua com evento sintetico */
        }

        syntheticEvent = {
          type: 'click',
          bubbles: true,
          cancelable: true,
          currentTarget: node,
          target: node,
          nativeEvent: new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
          preventDefault: function () {},
          stopPropagation: function () {},
        };

        try {
          onClick(syntheticEvent);
          return true;
        } catch (errSynthetic) {
          /* tenta proximo ancestral */
        }
      }

      node = node.parentElement;
      depth += 1;
    }

    return false;
  }

  function dispatchNativeClick(el) {
    if (!el) {
      return false;
    }

    el.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }),
    );
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  }

  function openNativeFaqModal() {
    var btn;
    var wrap;
    var opened;

    btn = findNativeFaqButton();
    if (!btn) {
      return false;
    }

    opened = invokeReactClick(btn);

    if (!opened) {
      wrap = btn.closest('[class*="_Modal__textLink"]');
      if (wrap) {
        opened = invokeReactClick(wrap);
      }
    }

    if (!opened) {
      dispatchNativeClick(btn);
    }

    return true;
  }

  function hideNativeFaqLink() {
    var btn;

    if (!isActiveFaqMounted()) {
      return;
    }

    btn = findNativeFaqButton();
    if (!btn) {
      return;
    }

    if (!btn.hasAttribute('data-wj-faq-native-trigger-hidden')) {
      btn.setAttribute('data-wj-faq-native-trigger-hidden', 'true');
    }
  }

  function isModalRelatedNode(node) {
    var cls;

    if (!node || node.nodeType !== 1) {
      return false;
    }

    if (node.closest('[role="dialog"], [aria-modal="true"]')) {
      return true;
    }

    cls = typeof node.className === 'string' ? node.className : '';
    return cls.indexOf('_Modal') !== -1 || cls.indexOf('Modal__') !== -1;
  }

  function cleanupLegacyNativeHiding() {
    var hiddenBlocks = document.querySelectorAll('[data-wj-faq-native-hidden="true"]');
    var modalFixNodes = document.querySelectorAll('[data-wj-faq-modal-fix="true"]');
    var overlayButtons = document.querySelectorAll('[data-wj-faq-overlay="true"]');
    var i;

    for (i = 0; i < hiddenBlocks.length; i += 1) {
      hiddenBlocks[i].removeAttribute('data-wj-faq-native-hidden');
    }

    for (i = 0; i < modalFixNodes.length; i += 1) {
      modalFixNodes[i].removeAttribute('data-wj-faq-modal-fix');
    }

    for (i = 0; i < overlayButtons.length; i += 1) {
      overlayButtons[i].removeAttribute('data-wj-faq-overlay');
      overlayButtons[i].style.cssText = '';
    }
  }

  function createFooterLinkHtml(prefix) {
    return (
      '<span class="' +
      prefix +
      '__full-link" data-wj-faq-proxy-target="true" role="button" tabindex="0">' +
      FULL_FAQ_LINK_LABEL +
      '</span>'
    );
  }

  function wireFooterProxy(faqElement, prefix) {
    var footer = faqElement.querySelector('.' + prefix + '__footer');
    var proxy;

    if (!footer || footer.getAttribute('data-wj-faq-proxy-bound') === 'true') {
      return;
    }

    footer.addEventListener(
      'click',
      function (event) {
        if (!event.target || !event.target.closest('[data-wj-faq-proxy-target="true"]')) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        sendGAEvent('clicou_link_conteudo_completo_faq_assinatura');
        openNativeFaqModal();
      },
      true,
    );

    proxy = footer.querySelector('[data-wj-faq-proxy-target="true"]');
    if (proxy) {
      proxy.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          sendGAEvent('clicou_link_conteudo_completo_faq_assinatura');
          openNativeFaqModal();
        }
      });
    }

    footer.setAttribute('data-wj-faq-proxy-bound', 'true');
  }

  function attachFooterLink(faqElement, prefix) {
    var footer = faqElement.querySelector('.' + prefix + '__footer');

    if (!footer) {
      return false;
    }

    if (!footer.querySelector('[data-wj-faq-proxy-target="true"]')) {
      footer.innerHTML = createFooterLinkHtml(prefix);
    }

    wireFooterProxy(faqElement, prefix);
    hideNativeFaqLink();
    return !!findNativeFaqButton();
  }

  function scheduleFooterLinkRetries(faqElement, prefix) {
    var attempts = 0;

    function retry() {
      if (attachFooterLink(faqElement, prefix)) {
        return;
      }

      attempts += 1;
      if (attempts < MAX_ATTEMPTS) {
        window.setTimeout(retry, INTERVAL_MS);
      }
    }

    window.setTimeout(retry, INTERVAL_MS);
  }

  function mountMissingPlacements() {
    var i;
    var placement;

    for (i = 0; i < PLACEMENTS.length; i += 1) {
      placement = PLACEMENTS[i];

      if (document.getElementById(placement.wrapperId)) {
        continue;
      }

      if (placement.attempts >= MAX_ATTEMPTS) {
        placement.attempts = 0;
      }

      mountPlacement(placement);
    }
  }

  function watchNativeFaqButton() {
    var timer;

    if (window._wjFaqNativeObserver) {
      return;
    }

    window._wjFaqNativeObserver = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (nativeFaqButton && !nativeFaqButton.isConnected) {
          nativeFaqButton = null;
        }

        mountMissingPlacements();
        findNativeFaqButton();
        hideNativeFaqLink();
      }, 250);
    });

    window._wjFaqNativeObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function captureFaqInsertAnchorFromBlock() {
    var block = findOriginalFaqBlock();

    if (block) {
      captureFaqInsertAnchor(block);
    }
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

  const ACCORDION_MS = 320;

  function setItemOpen(item, isOpen, prefix) {
    var button = item.querySelector('.' + prefix + '__button');
    var openClass = prefix + '__item--open';
    var openingClass = prefix + '__item--opening';
    var closingClass = prefix + '__item--closing';

    if (isOpen) {
      item.classList.remove(closingClass);
      item.classList.add(openingClass);
      item.classList.add(openClass);
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
      window.setTimeout(function () {
        item.classList.remove(openingClass);
      }, ACCORDION_MS);
      return;
    }

    if (!item.classList.contains(openClass)) {
      return;
    }

    item.classList.add(closingClass);
    item.classList.remove(openClass);
    item.classList.remove(openingClass);
    if (button) {
      button.setAttribute('aria-expanded', 'false');
    }

    window.setTimeout(function () {
      item.classList.remove(closingClass);
    }, ACCORDION_MS);
  }

  function closeOtherItems(wrapperId, prefix, currentItem) {
    var items = document.querySelectorAll('#' + wrapperId + ' .' + prefix + '__item--open');
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
    var questionLabel = button.querySelector('.' + prefix + '__text');
    var trackingSlug = slugifyTrackingLabel(
      questionLabel ? questionLabel.textContent : 'faq_assinatura',
    );

    if (!isOpen) {
      closeOtherItems(wrapperId, prefix, item);
      sendGAEvent('abriu_accordion_' + trackingSlug);
      window.requestAnimationFrame(function () {
        setItemOpen(item, true, prefix);
      });
      return;
    }

    sendGAEvent('fechou_accordion_' + trackingSlug);
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
      captureFaqInsertAnchorFromBlock();
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
      attachFooterLink(faqElement, placement.prefix);
      scheduleFooterLinkRetries(faqElement, placement.prefix);
      addEventListeners(placement);
      trackFaqView(placement);
      hideNativeFaqLink();
      return;
    }

    if (placement.mount === 'insertBeforeBlock') {
      var pageBlock = findOriginalFaqBlock();

      if (!pageBlock || !pageBlock.parentNode) {
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
      pageBlock.parentNode.insertBefore(faqElement, pageBlock);
      attachFooterLink(faqElement, placement.prefix);
      scheduleFooterLinkRetries(faqElement, placement.prefix);
      addEventListeners(placement);
      trackFaqView(placement);
      hideNativeFaqLink();
    }
  }

  function init() {
    var i;

    createStyle();
    removeLegacyStash();
    restoreRelocatedNativeBlocks();
    cleanupLegacyNativeHiding();

    for (i = 0; i < PLACEMENTS.length; i += 1) {
      mountPlacement(PLACEMENTS[i]);
    }

    findNativeFaqButton();
    hideNativeFaqLink();
    watchNativeFaqButton();

    window.addEventListener('resize', function () {
      mountMissingPlacements();
      hideNativeFaqLink();
    });
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
