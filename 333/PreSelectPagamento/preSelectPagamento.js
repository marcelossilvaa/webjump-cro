  (function () {
    'use strict';

    let isProcessing = false;
    let debounceTimer = null;
    let retryCount = 0;
    let viewTracked = false;
    let userChangedPayment = false;
    let preSelectDone = false;
    let skipNextPlaceOrderTrack = false;

    const STYLE_ID = 'wj-333-preselect-pagamento-style';
    const ROOT_SELECTOR = '.items.payment-methods';
    const ROOT_ATTR = 'data-wj-pay-redesign';
    const METHOD_ATTR = 'data-wj-pay-method';
    const UI_ATTR = 'data-wj-pay-ui';
    const SOCIAL_ATTR = 'data-wj-pay-social';
    const LIST_ATTR = 'data-wj-pay-list';
    const PLACE_ORDER_ATTR = 'data-wj-pay-place-order';
    const PLACE_ORDER_TRACKING_ATTR = 'data-wj-pay-place-order-tracking';
    const TRACKING_ATTR = 'data-wj-pay-tracking';
    const INFO_ATTR = 'data-wj-pay-info';
    const NOTES_ATTR = 'data-wj-pay-notes';
    const OBSERVER_KEY = '_wj333PreSelectPagamentoObserver';
    const MAX_RETRIES = 40;
    const RETRY_DELAY = 250;
    const OBSERVER_DELAY = 200;
    const PRESELECT_CODE = 'braspag_pagador_pix';
    const TRACKING_CATEGORY = 'preselect_pagamento_333';

    const COLOR_ORANGE = '#ff5a14';
    const COLOR_ORANGE_BG = '#fff5f0';
    const COLOR_BORDER = '#e1e5ea';
    const COLOR_BORDER_OUTER = '#E5E7EB';
    const COLOR_TEXT = '#202938';
    const COLOR_MUTED = '#8b8f98';
    const COLOR_GREEN = '#13a538';
    const COLOR_SOCIAL = '#1f2a44';
    const FONT_FAMILY = 'Ubuntu, Arial, Helvetica, sans-serif';

    const ICON_PIX_SRC =
      'https://www.333obra.com.br/media/payments/logo//default/Vector.png';

    const ICON_CARD =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5" stroke="#202938" stroke-width="1.6"/><path stroke="#202938" stroke-width="1.6" d="M2 10h20"/><path stroke="#202938" stroke-width="1.6" stroke-linecap="round" d="M6 15h4"/></svg>';

    const ICON_INFO =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#8b8f98" stroke-width="1.7"/><path stroke="#8b8f98" stroke-width="1.7" stroke-linecap="round" d="M12 11v5"/><circle cx="12" cy="8" r="1.1" fill="#8b8f98"/></svg>';

    const ICON_SHIELD =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path stroke="#3b82f6" stroke-width="1.7" stroke-linejoin="round" d="M12 3l7 3v5.5c0 4.2-2.8 7.9-7 9-4.2-1.1-7-4.8-7-9V6l7-3z"/><path stroke="#3b82f6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M9.2 12.1l1.8 1.8 3.8-3.8"/></svg>';

    const ICON_STAR =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path stroke="#3b82f6" stroke-width="1.7" stroke-linejoin="round" d="M12 3.4l2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.2 7 18.8l.9-5.6-4-3.9 5.6-.8L12 3.4z"/></svg>';

    const PIX_INFO_FALLBACK =
      'Ao finalizar o pedido, você visualizará os dados para realizar o pagamento via Pix.\n' +
      '1. Entre no aplicativo de sua instituição financeira e acesse o ambiente PIX\n' +
      '2. Escolha a opção de QR Code e digitalize a imagem. Se preferir você pode copiar e colar o código\n' +
      '3. Confirme o pagamento que será realizado para a STELO S/A\n' +
      'Caso o Pix não seja pago, o pedido será cancelado.';

    const SCHEDULE_INFO_FALLBACK =
      'Pagamento combinado diretamente com a loja via PIX no momento do agendamento da entrega.\n' +
      'O prazo de entrega passa a contar a partir da confirmação do pagamento.\n' +
      'A loja entrará em contato para combinar os detalhes.';

    const METHOD_CONFIG = {
      braspag_pagador_pix: {
        title: 'PIX Copia e Cola',
        subtitle: 'Aprovação imediata',
        icon: 'pix',
        badge: 'Mais rápido',
        brands: false,
        info: true,
        infoType: 'pix',
        order: 1
      },
      braspag_pagador_creditcard: {
        title: 'Cartão de crédito',
        subtitle: 'À vista ou em até 12x',
        icon: 'card',
        badge: null,
        brands: true,
        info: false,
        order: 2
      },
      cashondelivery: {
        title: 'PIX no agendamento da entrega',
        subtitle: 'Aprovação direto com a loja no agendamento',
        activeSubtitle:
          'Pagamento combinado diretamente com a loja via PIX no momento do agendamento da entrega. O prazo de entrega passa a contar a partir da confirmação do pagamento. A loja entrará em contato para combinar os detalhes.',
        icon: 'pix',
        badge: null,
        brands: false,
        info: true,
        infoType: 'schedule',
        order: 3
      }
    };

    function isCheckoutPage() {
      const path = (window.location.pathname || '').toLowerCase();
      return path.indexOf('/checkout') !== -1;
    }

    function sendGAEvent(label, action) {
      if (!label) return;

      const payload = {
        event: 'local_event',
        event_raised_by: 'br',
        local_event_category: TRACKING_CATEGORY,
        local_event_action: action || 'click',
        local_event_label: label
      };

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
    }

    function getStyles() {
      const cc =
        ROOT_SELECTOR +
        '[' +
        ROOT_ATTR +
        '="true"] .payment-method:has(#braspag_pagador_creditcard)';

      return [
        'aside.modal-custom.opc-sidebar.opc-summary-wrapper.custom-slide {',
        '  margin-top: 0px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] {',
        '  box-sizing: border-box !important;',
        '  font-family: ' + FONT_FAMILY + ' !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-group {',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '  gap: 12px !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '  background: transparent !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-list {',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '  gap: 10px !important;',
        '  margin: 0 !important;',
        '  padding: 12px !important;',
        '  border: 1px solid ' + COLOR_BORDER_OUTER + ' !important;',
        '  border-radius: 12px !important;',
        '  background: #ffffff !important;',
        '  box-sizing: border-box !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .step-title {',
        '  order: 0 !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-size: 18px !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1.3 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method {',
        '  display: block !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '  background: transparent !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method:has(#braspag_pagador_pix) { order: 1 !important; }',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method:has(#braspag_pagador_creditcard) { order: 2 !important; }',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method:has(#cashondelivery) { order: 3 !important; }',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title {',
        '  display: flex !important;',
        '  flex-wrap: wrap !important;',
        '  align-items: center !important;',
        '  gap: 12px !important;',
        '  margin: 0 !important;',
        '  padding: 14px 16px !important;',
        '  border: 1px solid ' + COLOR_BORDER + ' !important;',
        '  border-radius: 10px !important;',
        '  background: #ffffff !important;',
        '  cursor: pointer !important;',
        '  box-sizing: border-box !important;',
        '  transition: border-color 0.15s ease, background 0.15s ease !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method._active .payment-method-title {',
        '  border-color: ' + COLOR_ORANGE + ' !important;',
        '  background: ' + COLOR_ORANGE_BG + ' !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title > input.radio {',
        '  flex: 0 0 18px !important;',
        '  align-self: center !important;',
        '  width: 18px !important;',
        '  height: 18px !important;',
        '  min-width: 18px !important;',
        '  min-height: 18px !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '  border-radius: 50% !important;',
        '  box-shadow: none !important;',
        '  outline: none !important;',
        '  accent-color: ' + COLOR_ORANGE + ' !important;',
        '  cursor: pointer !important;',
        '  appearance: auto !important;',
        '  -webkit-appearance: radio !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title > input.radio:focus,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title > input.radio:focus-visible,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title > input.radio:checked:focus {',
        '  outline: none !important;',
        '  box-shadow: none !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title > label {',
        '  flex: 1 1 0 !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  min-width: 0 !important;',
        '  cursor: pointer !important;',
        '  max-width: 100% !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title > label > span:not([' + UI_ATTR + ']) {',
        '  display: none !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-notes {',
        '  display: none !important;',
        '  flex: 0 0 100% !important;',
        '  width: 100% !important;',
        '  margin: 2px 0 0 !important;',
        '  padding: 0 0 0 30px !important;',
        '  box-sizing: border-box !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method._active .wj-pay-notes {',
        '  display: block !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-notes .name-info {',
        '  display: block !important;',
        '  width: 100% !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui {',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  gap: 12px !important;',
        '  width: 100% !important;',
        '  max-width: 100% !important;',
        '  min-width: 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__icon {',
        '  flex: 0 0 22px !important;',
        '  width: 22px !important;',
        '  height: 22px !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__icon svg,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__icon img {',
        '  display: block !important;',
        '  width: 22px !important;',
        '  height: 22px !important;',
        '  object-fit: contain !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__text {',
        '  flex: 1 1 auto !important;',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '  gap: 2px !important;',
        '  min-width: 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__title-row {',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  flex-wrap: wrap !important;',
        '  gap: 8px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__title {',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-size: 15px !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1.25 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__subtitle {',
        '  color: ' + COLOR_MUTED + ' !important;',
        '  font-size: 13px !important;',
        '  font-weight: 400 !important;',
        '  line-height: 1.3 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__detail {',
        '  display: none !important;',
        '  color: ' + COLOR_MUTED + ' !important;',
        '  font-size: 13px !important;',
        '  font-weight: 400 !important;',
        '  line-height: 1.4 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method._active .wj-pay-ui__detail {',
        '  display: block !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method._active .wj-pay-ui__text:has(.wj-pay-ui__detail) .wj-pay-ui__subtitle {',
        '  display: none !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__badge {',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  flex: 0 0 auto !important;',
        '  margin-left: auto !important;',
        '  padding: 2px 8px !important;',
        '  border-radius: 4px !important;',
        '  background: ' + COLOR_GREEN + ' !important;',
        '  color: #ffffff !important;',
        '  font-size: 11px !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1.3 !important;',
        '  white-space: nowrap !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__brands {',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  gap: 6px !important;',
        '  flex: 0 0 auto !important;',
        '  margin-left: auto !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__brands img {',
        '  width: 30px !important;',
        '  height: 20px !important;',
        '  object-fit: contain !important;',
        '  display: block !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__badge + .wj-pay-ui__info,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__brands + .wj-pay-ui__info {',
        '  margin-left: 8px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__text + .wj-pay-ui__info {',
        '  margin-left: auto !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-icons,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-logo {',
        '  display: none !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .braspag-pix-demonstrative,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method .additional-info {',
        '  display: none !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] #cashondelivery-form {',
        '  display: none !important;',
        '  margin: 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] #cashondelivery-form .fieldset {',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-notes #cashondelivery_info,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] #cashondelivery_info {',
        '  width: 100% !important;',
        '  box-sizing: border-box !important;',
        '  margin: 0 !important;',
        '  padding: 12px 14px !important;',
        '  border: 1px solid ' + COLOR_BORDER + ' !important;',
        '  border-radius: 10px !important;',
        '  background: #ffffff !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-family: ' + FONT_FAMILY + ' !important;',
        '  font-size: 14px !important;',
        '  line-height: 1.3 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-notes #cashondelivery_info::placeholder,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] #cashondelivery_info::placeholder {',
        '  color: ' + COLOR_MUTED + ' !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-list--bullets {',
        '  list-style: disc !important;',
        '  padding-left: 18px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-list--bullets li {',
        '  margin: 0 0 8px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-list--bullets li:last-child {',
        '  margin-bottom: 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info {',
        '  position: relative !important;',
        '  flex: 0 0 auto !important;',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info-btn {',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  width: 22px !important;',
        '  height: 22px !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '  border-radius: 50% !important;',
        '  background: transparent !important;',
        '  cursor: pointer !important;',
        '  line-height: 1 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info-btn:hover,',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info.is-open .wj-pay-ui__info-btn {',
        '  background: rgba(255, 90, 20, 0.1) !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info-btn svg {',
        '  display: block !important;',
        '  width: 16px !important;',
        '  height: 16px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip {',
        '  display: none !important;',
        '  position: absolute !important;',
        '  top: calc(100% + 8px) !important;',
        '  right: 0 !important;',
        '  z-index: 40 !important;',
        '  width: min(320px, 78vw) !important;',
        '  padding: 12px 14px !important;',
        '  border: 1px solid ' + COLOR_BORDER + ' !important;',
        '  border-radius: 10px !important;',
        '  background: #ffffff !important;',
        '  box-shadow: 0 8px 24px rgba(32, 41, 56, 0.14) !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-size: 12px !important;',
        '  font-weight: 400 !important;',
        '  line-height: 1.45 !important;',
        '  text-align: left !important;',
        '  white-space: normal !important;',
        '  box-sizing: border-box !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip::before {',
        '  content: "" !important;',
        '  position: absolute !important;',
        '  top: -6px !important;',
        '  right: 8px !important;',
        '  width: 10px !important;',
        '  height: 10px !important;',
        '  border-top: 1px solid ' + COLOR_BORDER + ' !important;',
        '  border-left: 1px solid ' + COLOR_BORDER + ' !important;',
        '  background: #ffffff !important;',
        '  transform: rotate(45deg) !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info.is-open .wj-pay-ui__tooltip {',
        '  display: block !important;',
        '}',
        '@media (hover: hover) and (pointer: fine) {',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__info:hover .wj-pay-ui__tooltip {',
        '    display: block !important;',
        '  }',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-title {',
        '  display: block !important;',
        '  margin: 0 0 8px !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-size: 13px !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1.3 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-list {',
        '  margin: 0 !important;',
        '  padding: 0 0 0 16px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-list li {',
        '  margin: 0 0 6px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-list li:last-child {',
        '  margin-bottom: 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__tooltip-note {',
        '  display: block !important;',
        '  margin: 8px 0 0 !important;',
        '  color: ' + COLOR_MUTED + ' !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-content {',
        '  margin-top: 10px !important;',
        '  padding: 0 2px !important;',
        '}',
        cc + '._active .payment-method-title {',
        '  border-radius: 10px 10px 0 0 !important;',
        '  border-bottom-color: transparent !important;',
        '}',
        cc + '._active .payment-method-content {',
        '  margin-top: 0 !important;',
        '  padding: 14px 16px !important;',
        '  border: 1px solid ' + COLOR_ORANGE + ' !important;',
        '  border-top: 0 !important;',
        '  border-radius: 0 0 10px 10px !important;',
        '  background: ' + COLOR_ORANGE_BG + ' !important;',
        '  box-sizing: border-box !important;',
        '}',
        cc + ' .bp-card-container {',
        '  display: flex !important;',
        '  flex-direction: row !important;',
        '  flex-wrap: wrap !important;',
        '  align-items: center !important;',
        '  justify-content: space-between !important;',
        '  gap: 20px !important;',
        '  width: 100% !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  box-sizing: border-box !important;',
        '}',
        cc + ' .bp-card-container .form-container {',
        '  flex: 1 1 280px !important;',
        '  max-width: 480px !important;',
        '  min-width: 0 !important;',
        '  float: none !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        cc + ' .bp-card-container .card-wrapper {',
        '  flex: 0 0 auto !important;',
        '  float: none !important;',
        '  margin: 0 auto !important;',
        '}',
        cc + ' .form.braspag-card {',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  box-sizing: border-box !important;',
        '}',
        cc + ' .fieldset.payment.items.ccard {',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  border: 0 !important;',
        '}',
        cc + ' .payment-method-content .form.braspag-card > .field,',
        cc + ' .payment-method-content .fieldset.ccard > .field {',
        '  margin: 0 0 14px !important;',
        '  padding: 0 !important;',
        '}',
        cc + ' .payment-method-content .form.braspag-card > .field:last-child,',
        cc + ' .payment-method-content .fieldset.ccard > .field:last-child {',
        '  margin-bottom: 0 !important;',
        '}',
        cc + ' .payment-method-content .field.no-label {',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        cc + ' .payment-method-content .field > .label {',
        '  display: block !important;',
        '  margin: 0 0 6px !important;',
        '  padding: 0 !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-family: ' + FONT_FAMILY + ' !important;',
        '  font-size: 13px !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1.3 !important;',
        '}',
        cc + ' .payment-method-content .field > .label span {',
        '  color: inherit !important;',
        '  font-size: inherit !important;',
        '  font-weight: inherit !important;',
        '}',
        cc + ' .payment-method-content .control {',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        cc + ' .payment-method-content .input-text:not(.cvv),',
        cc + ' .payment-method-content .select {',
        '  width: 100% !important;',
        '  max-width: 100% !important;',
        '  height: 44px !important;',
        '  margin: 0 !important;',
        '  padding: 10px 12px !important;',
        '  border: 1px solid ' + COLOR_BORDER + ' !important;',
        '  border-radius: 10px !important;',
        '  background-color: #ffffff !important;',
        '  box-shadow: none !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-family: ' + FONT_FAMILY + ' !important;',
        '  font-size: 14px !important;',
        '  line-height: 1.3 !important;',
        '  box-sizing: border-box !important;',
        '}',
        cc + ' .payment-method-content .select {',
        '  padding-right: 36px !important;',
        '  appearance: none !important;',
        '  -webkit-appearance: none !important;',
        '  -moz-appearance: none !important;',
        '  background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%238b8f98\' stroke-width=\'1.6\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") !important;',
        '  background-repeat: no-repeat !important;',
        '  background-position: right 14px center !important;',
        '  background-size: 12px 8px !important;',
        '  cursor: pointer !important;',
        '}',
        cc + ' .payment-method-content .input-text:not(.cvv):focus,',
        cc + ' .payment-method-content .select:focus {',
        '  outline: none !important;',
        '  border-color: ' + COLOR_ORANGE + ' !important;',
        '}',
        cc + ' .payment-method-content .fields.group.group-2 {',
        '  display: flex !important;',
        '  flex-direction: row !important;',
        '  flex-wrap: nowrap !important;',
        '  gap: 10px !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        cc + ' .payment-method-content .fields.group.group-2 .field {',
        '  flex: 1 1 0 !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  min-width: 0 !important;',
        '}',
        cc + ' .payment-method-content .field.cvv .control._with-tooltip {',
        '  display: flex !important;',
        '  flex-direction: row !important;',
        '  flex-wrap: nowrap !important;',
        '  align-items: center !important;',
        '  gap: 8px !important;',
        '  width: auto !important;',
        '}',
        cc + ' .payment-method-content .field.cvv .input-text.cvv {',
        '  float: none !important;',
        '  display: block !important;',
        '  flex: 0 0 80px !important;',
        '  width: 80px !important;',
        '  max-width: 80px !important;',
        '  height: 44px !important;',
        '  margin: 0 !important;',
        '  padding: 10px 8px !important;',
        '  border: 1px solid ' + COLOR_BORDER + ' !important;',
        '  border-radius: 10px !important;',
        '  background: #ffffff !important;',
        '  box-shadow: none !important;',
        '  color: ' + COLOR_TEXT + ' !important;',
        '  font-family: ' + FONT_FAMILY + ' !important;',
        '  font-size: 14px !important;',
        '  line-height: 1.3 !important;',
        '  box-sizing: border-box !important;',
        '}',
        cc + ' .payment-method-content .field.cvv .input-text.cvv:focus {',
        '  outline: none !important;',
        '  border-color: ' + COLOR_ORANGE + ' !important;',
        '}',
        cc + ' .payment-method-content .field.cvv .field-tooltip {',
        '  position: static !important;',
        '  display: inline-block !important;',
        '  width: auto !important;',
        '  margin: 0 !important;',
        '  float: none !important;',
        '}',
        cc + ' .payment-method-billing-address {',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        cc + ' .checkout-agreements-block {',
        '  margin: 0 !important;',
        '}',
        cc + ' .payment-method-content > .actions-toolbar {',
        '  margin: 14px 0 0 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social {',
        '  display: flex !important;',
        '  flex-direction: row !important;',
        '  flex-wrap: wrap !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  gap: 10px 20px !important;',
        '  margin: 0px !important;',
        '  padding: 5px 16px !important;',
        '  border-radius: 10px !important;',
        '  box-sizing: border-box !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__item {',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  gap: 8px !important;',
        '  color: ' + COLOR_SOCIAL + ' !important;',
        '  font-size: 13px !important;',
        '  line-height: 1.3 !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__icon {',
        '  flex: 0 0 18px !important;',
        '  width: 18px !important;',
        '  height: 18px !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__icon svg {',
        '  display: block !important;',
        '  width: 18px !important;',
        '  height: 18px !important;',
        '}',
        ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__text strong {',
        '  font-weight: 700 !important;',
        '}',
        '@media (max-width: 768px) {',
        '  ' + cc + '._active .payment-method-content {',
        '    padding: 14px 16px !important;',
        '  }',
        '  ' + cc + ' .bp-card-container {',
        '    flex-direction: column !important;',
        '  }',
        '  ' + cc + ' .bp-card-container .form-container {',
        '    width: 100% !important;',
        '    max-width: 100% !important;',
        '    flex: 1 1 100% !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-list {',
        '    margin: 12px !important;',
        '    padding: 10px !important;',
        '    gap: 8px !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-title {',
        '    padding: 12px 14px !important;',
        '    gap: 10px !important;',
        '  }',
      '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method.pix,',
      '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method:has(#braspag_pagador_pix) {',
      '    height: 60.7px !important;',
      '    box-sizing: border-box !important;',
      '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-notes {',
        '    padding-left: 0 !important;',
        '  }',
        '  ' + cc + ' .payment-method-content .fields.group.group-2 {',
        '    flex-direction: row !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui {',
        '    gap: 10px !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__title {',
        '    font-size: 14px !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__subtitle,',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__detail {',
        '    font-size: 12px !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__badge {',
        '    padding: 3px 8px !important;',
        '    font-size: 10px !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-ui__brands img {',
        '    width: 30px !important;',
        '    height: 20px !important;',
        '  }',
      '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social {',
      '    flex-direction: row !important;',
      '    flex-wrap: nowrap !important;',
      '    align-items: flex-start !important;',
      '    justify-content: center !important;',
      '    gap: 12px !important;',
      '    margin: 0px !important;',
      '    padding: 0 12px !important;',
      '    box-sizing: border-box !important;',
      '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__item {',
        '    min-width: 0 !important;',
        '    font-size: 12px !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__text {',
        '    display: block !important;',
        '    line-height: 1.35 !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .wj-pay-social__text strong {',
        '    display: block !important;',
        '  }',
        '  ' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"] .payment-method-content > .actions-toolbar {',
        '    display: none !important;',
        '  }',
        '  body:has(' + ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"]) .summary-action-button {',
        '    display: none !important;',
        '  }',
        '  .wj-pay-place-order {',
        '    display: flex !important;',
        '    align-items: center !important;',
        '    justify-content: center !important;',
        '    max-width: 100% !important;',
        '    box-sizing: border-box !important;',
        '    margin: 0 !important;',
        '    padding: 16px 20px !important;',
        '    border: 0 !important;',
        '    border-radius: 10px !important;',
        '    background: ' + COLOR_ORANGE + ' !important;',
        '    color: #ffffff !important;',
        '    font-family: ' + FONT_FAMILY + ' !important;',
        '    font-size: 16px !important;',
        '    font-weight: 700 !important;',
        '    line-height: 1.2 !important;',
        '    text-align: center !important;',
        '    cursor: pointer !important;',
        '    appearance: none !important;',
        '    -webkit-appearance: none !important;',
        '  }',
        '  .wj-pay-place-order span {',
        '    color: #ffffff !important;',
        '    font-size: inherit !important;',
        '    font-weight: inherit !important;',
        '  }',
        '  .wj-pay-place-order:disabled,',
        '  .wj-pay-place-order.disabled {',
        '    opacity: 0.55 !important;',
        '    cursor: not-allowed !important;',
        '  }',
        '}',
        '@media (min-width: 769px) {',
        '  .wj-pay-place-order {',
        '    display: none !important;',
        '  }',
        '}'
      ].join('\n');
    }

    function injectStyles() {
      if (document.getElementById(STYLE_ID)) return;

      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = getStyles();
      document.head.appendChild(style);
    }

    function appendMethodIcon(iconWrap, type) {
      if (type === 'card') {
        iconWrap.innerHTML = ICON_CARD;
        return;
      }

      const img = document.createElement('img');
      img.className = 'payment-icon';
      img.src = ICON_PIX_SRC;
      img.alt = 'PIX';
      img.width = 22;
      img.height = 22;
      iconWrap.appendChild(img);
    }

    function getMethodInfoText(methodEl, infoType) {
      if (infoType === 'schedule') {
        return SCHEDULE_INFO_FALLBACK;
      }

      const paragraph = methodEl.querySelector('.braspag-pix-demonstrative p');
      if (paragraph) {
        const text = (paragraph.innerText || paragraph.textContent || '')
          .replace(/\r\n/g, '\n')
          .replace(/[ \t]+\n/g, '\n')
          .replace(/\n[ \t]+/g, '\n')
          .trim();
        if (text) return text;
      }

      return PIX_INFO_FALLBACK;
    }

    function fillTooltipContent(tooltip, rawText, infoType) {
      const isSchedule = infoType === 'schedule';
      const title = document.createElement('span');
      title.className = 'wj-pay-ui__tooltip-title';
      title.textContent = isSchedule ? 'Como funciona este PIX' : 'Como pagar com PIX';
      tooltip.appendChild(title);

      if (isSchedule) {
        const lines = String(rawText || '')
          .split(/\n+/)
          .map(function (line) {
            return line.replace(/\s+/g, ' ').trim();
          })
          .filter(Boolean);

        if (!lines.length) {
          const fallback = document.createElement('span');
          fallback.textContent = rawText || SCHEDULE_INFO_FALLBACK;
          tooltip.appendChild(fallback);
          return;
        }

        const list = document.createElement('ul');
        list.className = 'wj-pay-ui__tooltip-list wj-pay-ui__tooltip-list--bullets';

        for (let i = 0; i < lines.length; i++) {
          const li = document.createElement('li');
          li.textContent = lines[i];
          list.appendChild(li);
        }

        tooltip.appendChild(list);
        return;
      }

      const normalized = String(rawText || '')
        .replace(/\r\n/g, '\n')
        .replace(/\s+(\d+)\.\s+/g, '\n$1. ')
        .replace(/\s*\n\s*/g, '\n')
        .trim();

      const parts = normalized.split(/\n(?=\d+\.)/);
      let intro = '';
      const steps = [];
      let note = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        if (/^\d+\./.test(part)) {
          steps.push(part.replace(/^\d+\.\s*/, ''));
        } else if (/caso o pix não seja pago/i.test(part)) {
          note = part;
        } else if (!intro) {
          intro = part;
        } else {
          note = part;
        }
      }

      if (intro && /caso o pix não seja pago/i.test(intro) && !note) {
        const splitNote = intro.split(/(?=Caso o Pix não seja pago)/i);
        intro = (splitNote[0] || '').trim();
        note = (splitNote[1] || '').trim();
      }

      if (intro) {
        const introEl = document.createElement('span');
        introEl.textContent = intro;
        tooltip.appendChild(introEl);
      }

      if (steps.length) {
        const list = document.createElement('ol');
        list.className = 'wj-pay-ui__tooltip-list';

        for (let s = 0; s < steps.length; s++) {
          let stepText = steps[s];
          if (/caso o pix não seja pago/i.test(stepText) && !note) {
            const splitStep = stepText.split(/(?=Caso o Pix não seja pago)/i);
            stepText = (splitStep[0] || '').trim();
            note = (splitStep[1] || '').trim();
          }

          const li = document.createElement('li');
          li.textContent = stepText;
          list.appendChild(li);
        }

        tooltip.appendChild(list);
      }

      if (note) {
        const noteEl = document.createElement('span');
        noteEl.className = 'wj-pay-ui__tooltip-note';
        noteEl.textContent = note;
        tooltip.appendChild(noteEl);
      }

      if (!intro && !steps.length && !note) {
        const fallback = document.createElement('span');
        fallback.textContent = rawText;
        tooltip.appendChild(fallback);
      }
    }

    function closeAllInfoTooltips(exceptWrap) {
      const openItems = document.querySelectorAll('.wj-pay-ui__info.is-open');
      for (let i = 0; i < openItems.length; i++) {
        if (exceptWrap && openItems[i] === exceptWrap) continue;
        openItems[i].classList.remove('is-open');
      }
    }

    function bindInfoTooltip(infoWrap, trackingLabel) {
      if (infoWrap.getAttribute(INFO_ATTR) === 'true') return;

      const button = infoWrap.querySelector('.wj-pay-ui__info-btn');
      if (!button) return;

      function stop(event) {
        event.preventDefault();
        event.stopPropagation();
      }

      function toggleOpen(event) {
        stop(event);

        const isOpen = infoWrap.classList.contains('is-open');
        closeAllInfoTooltips();

        if (!isOpen) {
          infoWrap.classList.add('is-open');
          sendGAEvent(trackingLabel || 'payment_info_tooltip', 'click');
        }
      }

      button.addEventListener('mousedown', stop);
      button.addEventListener('click', toggleOpen);
      button.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          toggleOpen(event);
        }
      });

      infoWrap.setAttribute(INFO_ATTR, 'true');
    }

    function bindDocumentInfoClose() {
      if (window._wj333PayInfoCloseBound) return;
      window._wj333PayInfoCloseBound = true;

      document.addEventListener('click', function (event) {
        const target = event.target;
        if (target && target.closest && target.closest('.wj-pay-ui__info')) return;
        closeAllInfoTooltips();
      });
    }

    function buildInfoTooltip(infoText, infoType) {
      const isSchedule = infoType === 'schedule';
      const infoWrap = document.createElement('span');
      infoWrap.className = 'wj-pay-ui__info';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wj-pay-ui__info-btn';
      button.setAttribute(
        'aria-label',
        isSchedule ? 'Como funciona o PIX no agendamento' : 'Como funciona o pagamento via PIX'
      );
      button.innerHTML = ICON_INFO;
      infoWrap.appendChild(button);

      const tooltip = document.createElement('span');
      tooltip.className = 'wj-pay-ui__tooltip';
      tooltip.setAttribute('role', 'tooltip');
      fillTooltipContent(
        tooltip,
        infoText || (isSchedule ? SCHEDULE_INFO_FALLBACK : PIX_INFO_FALLBACK),
        infoType
      );
      infoWrap.appendChild(tooltip);

      bindInfoTooltip(infoWrap, isSchedule ? 'schedule_info_tooltip' : 'pix_info_tooltip');
      return infoWrap;
    }

    function buildMethodUi(config, brandImgs, infoText) {
      const wrap = document.createElement('span');
      wrap.className = 'wj-pay-ui';
      wrap.setAttribute(UI_ATTR, 'true');

      const icon = document.createElement('span');
      icon.className = 'wj-pay-ui__icon';
      appendMethodIcon(icon, config.icon);
      wrap.appendChild(icon);

      const text = document.createElement('span');
      text.className = 'wj-pay-ui__text';

      const titleRow = document.createElement('span');
      titleRow.className = 'wj-pay-ui__title-row';

      const title = document.createElement('span');
      title.className = 'wj-pay-ui__title';
      title.textContent = config.title;
      titleRow.appendChild(title);
      text.appendChild(titleRow);

      const subtitle = document.createElement('span');
      subtitle.className = 'wj-pay-ui__subtitle';
      subtitle.textContent = config.subtitle;
      text.appendChild(subtitle);

      if (config.activeSubtitle) {
        const detail = document.createElement('span');
        detail.className = 'wj-pay-ui__detail';
        detail.textContent = config.activeSubtitle;
        text.appendChild(detail);
      }

      wrap.appendChild(text);

      if (config.badge) {
        const badge = document.createElement('span');
        badge.className = 'wj-pay-ui__badge';
        badge.textContent = config.badge;
        wrap.appendChild(badge);
      }

      if (config.brands && brandImgs && brandImgs.length) {
        const brands = document.createElement('span');
        brands.className = 'wj-pay-ui__brands';

        for (let i = 0; i < brandImgs.length; i++) {
          const src = brandImgs[i].getAttribute('src');
          const alt = brandImgs[i].getAttribute('alt') || '';
          if (!src) continue;

          const img = document.createElement('img');
          img.src = src;
          img.alt = alt;
          img.width = 30;
          img.height = 20;
          brands.appendChild(img);
        }

        wrap.appendChild(brands);
      }

      if (config.info) {
        wrap.appendChild(
          buildInfoTooltip(
            infoText || (config.infoType === 'schedule' ? SCHEDULE_INFO_FALLBACK : PIX_INFO_FALLBACK),
            config.infoType
          )
        );
      }

      return wrap;
    }

    function relocateCashondeliveryNotes(methodEl) {
      if (!methodEl.querySelector('#cashondelivery')) return false;

      const title = methodEl.querySelector('.payment-method-title');
      if (!title) return false;

      let notes = title.querySelector('.wj-pay-notes');
      const inputInTitle = notes && notes.querySelector('#cashondelivery_info');

      if (inputInTitle) {
        const formDup = methodEl.querySelector('#cashondelivery-form #cashondelivery_info');
        if (formDup && formDup !== inputInTitle) {
          if (formDup.value && !inputInTitle.value) {
            inputInTitle.value = formDup.value;
          }
          const dupWrap = formDup.closest('.name-info') || formDup;
          if (dupWrap.parentNode) {
            dupWrap.parentNode.removeChild(dupWrap);
          }
        }
        return false;
      }

      const input = methodEl.querySelector('#cashondelivery_info');
      if (!input) return false;

      const nameInfo = input.closest('.name-info') || input;

      notes = document.createElement('div');
      notes.className = 'wj-pay-notes';
      notes.setAttribute(NOTES_ATTR, 'true');
      notes.appendChild(nameInfo);
      title.appendChild(notes);

      if (input.getAttribute('data-wj-pay-notes-bound') !== 'true') {
        input.setAttribute('data-wj-pay-notes-bound', 'true');
        input.addEventListener('click', function (event) {
          event.stopPropagation();
        });
        input.addEventListener('mousedown', function (event) {
          event.stopPropagation();
        });
      }

      return true;
    }

    function enhanceMethod(methodEl) {
      const radio = methodEl.querySelector('input[name="payment[method]"]');
      if (!radio) return false;

      const code = radio.id || radio.value;
      const config = METHOD_CONFIG[code];
      if (!config) return false;

      if (methodEl.getAttribute(METHOD_ATTR) === code) {
        if (!methodEl.querySelector('.wj-pay-ui')) {
          methodEl.removeAttribute(METHOD_ATTR);
        } else {
          if (code === 'cashondelivery') {
            return relocateCashondeliveryNotes(methodEl);
          }
          return false;
        }
      }

      const label = methodEl.querySelector('.payment-method-title > label');
      if (!label) return false;

      const existingUi = label.querySelector('.wj-pay-ui');
      if (existingUi) {
        existingUi.parentNode.removeChild(existingUi);
      }

      const brandImgs = methodEl.querySelectorAll('.payment-icons img');
      const infoText = config.info ? getMethodInfoText(methodEl, config.infoType) : '';
      const ui = buildMethodUi(config, brandImgs, infoText);
      label.appendChild(ui);

      methodEl.setAttribute(METHOD_ATTR, code);
      methodEl.style.setProperty('order', String(config.order), 'important');

      let changed = true;
      if (code === 'cashondelivery' && relocateCashondeliveryNotes(methodEl)) {
        changed = true;
      }

      return changed;
    }

    function buildSocialProof() {
      const social = document.createElement('div');
      social.className = 'wj-pay-social';
      social.setAttribute(SOCIAL_ATTR, 'true');

      const item1 = document.createElement('div');
      item1.className = 'wj-pay-social__item';

      const icon1 = document.createElement('span');
      icon1.className = 'wj-pay-social__icon';
      icon1.innerHTML = ICON_SHIELD;
      item1.appendChild(icon1);

      const text1 = document.createElement('span');
      text1.className = 'wj-pay-social__text';
      text1.innerHTML = '<strong>Entrega Garantida</strong> ou seu dinheiro de volta';
      item1.appendChild(text1);

      const item2 = document.createElement('div');
      item2.className = 'wj-pay-social__item';

      const icon2 = document.createElement('span');
      icon2.className = 'wj-pay-social__icon';
      icon2.innerHTML = ICON_STAR;
      item2.appendChild(icon2);

      const text2 = document.createElement('span');
      text2.className = 'wj-pay-social__text';
      text2.innerHTML = '<strong>9.4/10 de Avaliação</strong> no Reclame aqui';
      item2.appendChild(text2);

      social.appendChild(item1);
      social.appendChild(item2);

      return social;
    }

    function injectSocialProof(root) {
      if (root.querySelector('.wj-pay-social')) return false;

      const social = buildSocialProof();
      root.appendChild(social);
      return true;
    }

    function getActivePlaceOrderButton() {
      return document.querySelector(
        ROOT_SELECTOR +
          '[' +
          ROOT_ATTR +
          '="true"] .payment-method._active .payment-method-content > .actions-toolbar .action.primary.checkout'
      );
    }

    function getSelectedPaymentCode() {
      const checked = document.querySelector(
        ROOT_SELECTOR +
          '[' +
          ROOT_ATTR +
          '="true"] input[name="payment[method]"]:checked'
      );
      if (!checked) return '';
      return checked.id || checked.value || '';
    }

    function trackPlaceOrderClick() {
      if (skipNextPlaceOrderTrack) {
        skipNextPlaceOrderTrack = false;
        return;
      }

      const code = getSelectedPaymentCode();
      sendGAEvent(
        code ? 'finalizar_pedido_' + code : 'finalizar_pedido',
        'click'
      );
    }

    function bindNativePlaceOrderTracking() {
      const buttons = document.querySelectorAll(
        ROOT_SELECTOR +
          '[' +
          ROOT_ATTR +
          '="true"] .payment-method-content > .actions-toolbar .action.primary.checkout, .summary-action-button'
      );

      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        if (btn.getAttribute(PLACE_ORDER_TRACKING_ATTR) === 'true') continue;
        btn.setAttribute(PLACE_ORDER_TRACKING_ATTR, 'true');
        btn.addEventListener('click', trackPlaceOrderClick);
      }
    }

    function syncMobilePlaceOrder() {
      const proxy = document.querySelector('.wj-pay-place-order');
      if (!proxy) return;

      const activeBtn = getActivePlaceOrderButton();
      const summaryBtn = document.querySelector('.summary-action-button');
      const disabled = activeBtn
        ? activeBtn.disabled || activeBtn.classList.contains('disabled')
        : !summaryBtn;

      proxy.disabled = !!disabled;
      if (disabled) {
        proxy.classList.add('disabled');
      } else {
        proxy.classList.remove('disabled');
      }
    }

    function injectMobilePlaceOrder() {
      if (!document.querySelector(ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"]')) {
        return false;
      }

      let proxy = document.querySelector('.wj-pay-place-order');
      if (!proxy) {
        proxy = document.createElement('button');
        proxy.type = 'button';
        proxy.className = 'wj-pay-place-order';
        proxy.setAttribute(PLACE_ORDER_ATTR, 'true');
        proxy.innerHTML = '<span>Finalizar Pedido</span>';
        proxy.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          if (proxy.disabled || proxy.classList.contains('disabled')) return;

          trackPlaceOrderClick();

          const activeBtn = getActivePlaceOrderButton();
          if (activeBtn && !activeBtn.disabled && !activeBtn.classList.contains('disabled')) {
            skipNextPlaceOrderTrack = true;
            activeBtn.click();
            setTimeout(function () {
              skipNextPlaceOrderTrack = false;
            }, 0);
            return;
          }

          const summaryBtn = document.querySelector('.summary-action-button');
          if (summaryBtn) {
            skipNextPlaceOrderTrack = true;
            summaryBtn.click();
            setTimeout(function () {
              skipNextPlaceOrderTrack = false;
            }, 0);
          }
        });

        const aside = document.querySelector(
          'aside.opc-sidebar.opc-summary-wrapper, aside.opc-summary-wrapper'
        );
        const opcWrapper = document.querySelector('.opc-wrapper');
        const checkout = document.querySelector('.checkout-container');

        if (aside && aside.parentNode) {
          aside.parentNode.insertBefore(proxy, aside.nextSibling);
        } else if (opcWrapper && opcWrapper.parentNode) {
          opcWrapper.parentNode.insertBefore(proxy, opcWrapper.nextSibling);
        } else if (checkout) {
          checkout.appendChild(proxy);
        } else {
          return false;
        }
      }

      syncMobilePlaceOrder();
      return true;
    }

    function preSelectPayment(root) {
      if (userChangedPayment) return false;

      const radio = root.querySelector('#' + PRESELECT_CODE);
      if (!radio || radio.checked) {
        if (radio && radio.checked) {
          preSelectDone = true;
        }
        return false;
      }

      radio.click();

      if (!preSelectDone) {
        preSelectDone = true;
        sendGAEvent('preselect_pix_copia_cola', 'view');
      }

      return true;
    }

    function onPaymentMethodChange(event) {
      const target = event.target;
      const code = target && (target.id || target.value);
      if (!code) return;

      if (preSelectDone && code !== PRESELECT_CODE) {
        userChangedPayment = true;
      }

      sendGAEvent('select_' + code, 'click');
      syncMobilePlaceOrder();
    }

    function bindTracking(root) {
      if (root.getAttribute(TRACKING_ATTR) === 'true') return;

      const radios = root.querySelectorAll('input[name="payment[method]"]');
      for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', onPaymentMethodChange);
      }

      root.setAttribute(TRACKING_ATTR, 'true');
    }

    function ensureMethodsList(root) {
      const group = root.querySelector('.payment-group');
      if (!group) return false;

      let changed = false;
      let list = group.querySelector('.wj-pay-list');

      if (!list) {
        list = document.createElement('div');
        list.className = 'wj-pay-list';
        list.setAttribute(LIST_ATTR, 'true');

        const stepTitle = group.querySelector('.step-title');
        if (stepTitle && stepTitle.nextSibling) {
          group.insertBefore(list, stepTitle.nextSibling);
        } else if (stepTitle) {
          group.appendChild(list);
        } else {
          group.insertBefore(list, group.firstChild);
        }
        changed = true;
      }

      const toMove = [];
      for (let i = 0; i < group.children.length; i++) {
        const child = group.children[i];
        if (child.classList && child.classList.contains('payment-method')) {
          toMove.push(child);
        }
      }

      for (let j = 0; j < toMove.length; j++) {
        list.appendChild(toMove[j]);
        changed = true;
      }

      return changed;
    }

    function enhanceRoot(root) {
      let changed = false;

      if (root.getAttribute(ROOT_ATTR) !== 'true') {
        root.setAttribute(ROOT_ATTR, 'true');
        changed = true;
      }

      if (ensureMethodsList(root)) {
        changed = true;
      }

      const methods = root.querySelectorAll('.payment-method');
      for (let i = 0; i < methods.length; i++) {
        if (enhanceMethod(methods[i])) {
          changed = true;
        }
      }

      if (injectSocialProof(root)) {
        changed = true;
      }

      if (injectMobilePlaceOrder()) {
        changed = true;
      }

      bindTracking(root);
      bindNativePlaceOrderTracking();
      bindDocumentInfoClose();
      preSelectPayment(root);

      if (!viewTracked && root.querySelector('.wj-pay-ui')) {
        viewTracked = true;
        sendGAEvent('payment_methods_view', 'view');
      }

      return changed;
    }

    function run() {
      if (!isCheckoutPage()) return false;
      if (isProcessing) return false;

      isProcessing = true;
      let applied = false;

      try {
        const roots = document.querySelectorAll(ROOT_SELECTOR);
        for (let i = 0; i < roots.length; i++) {
          if (enhanceRoot(roots[i])) {
            applied = true;
          }
        }
      } finally {
        isProcessing = false;
      }

      return applied || document.querySelector(ROOT_SELECTOR + '[' + ROOT_ATTR + '="true"]') !== null;
    }

    function isOwnNode(node) {
      if (!node || node.nodeType !== 1) return false;
      if (node.id === STYLE_ID) return true;
      if (node.classList && (node.classList.contains('wj-pay-ui') || node.classList.contains('wj-pay-social') || node.classList.contains('wj-pay-list') || node.classList.contains('wj-pay-place-order') || node.classList.contains('wj-pay-ui__info') || node.classList.contains('wj-pay-ui__tooltip') || node.classList.contains('wj-pay-notes'))) {
        return true;
      }
      if (node.closest && (node.closest('.wj-pay-ui') || node.closest('.wj-pay-social') || node.closest('#' + STYLE_ID))) {
        return true;
      }
      return false;
    }

    function startObserver() {
      if (window[OBSERVER_KEY]) return;

      const observer = new MutationObserver(function (mutations) {
        let hasRelevant = false;

        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i];
          if (isOwnNode(mutation.target)) continue;

          if (mutation.type === 'childList') {
            for (let a = 0; a < mutation.addedNodes.length; a++) {
              const node = mutation.addedNodes[a];
              if (isOwnNode(node)) continue;
              if (node.nodeType !== 1) continue;
              if (
                (node.classList &&
                  (node.classList.contains('payment-method') ||
                    node.classList.contains('payment-methods') ||
                    node.classList.contains('payment-group'))) ||
                (node.querySelector && node.querySelector('.payment-method, .payment-methods'))
              ) {
                hasRelevant = true;
                break;
              }
            }
            if (hasRelevant) break;
          }

          if (
            mutation.target.classList &&
            (mutation.target.classList.contains('payment-method') ||
              mutation.target.classList.contains('payment-methods') ||
              mutation.target.classList.contains('payment-group') ||
              mutation.target.classList.contains('payment-method-title'))
          ) {
            hasRelevant = true;
            break;
          }
        }

        if (!hasRelevant) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          run();
        }, OBSERVER_DELAY);
      });

      observer.observe(document.body, { childList: true, subtree: true });
      window[OBSERVER_KEY] = observer;
    }

    function initWithRetry() {
      if (!isCheckoutPage()) return;

      injectStyles();
      const applied = run();

      if (applied) {
        startObserver();
        return;
      }

      retryCount += 1;
      if (retryCount < MAX_RETRIES) {
        setTimeout(initWithRetry, RETRY_DELAY);
        return;
      }

      startObserver();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWithRetry);
    } else {
      initWithRetry();
    }
  })();
