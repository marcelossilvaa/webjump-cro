(function () {
  const MODAL_ID = 'abc-lead-modal';
  const OVERLAY_ID = 'abc-lead-modal-overlay';
  const STYLE_ID = 'abc-lead-modal-style';
  const PROGRESS_BAR_ID = 'formProgressBar';
  const PROGRESS_TEXT_ID = 'formProgressText';
  const FORM_ID = 'myForm';
  const OUTROS_INPUT_ID = 'outrosInput';
  const PRODUTO_SELECT_ID = 'produto_de_interesse';
  const SUCCESS_OVERLAY_ID = 'abcSuccessOverlay';
  const DATA_BIND_LISTENERS = 'data-form-listeners-added';
  const DATA_BUTTON_LISTENER = 'data-modal-click-listener-added';
  const DATA_DOC_ESC_LISTENER = 'data-modal-esc-listener-added';

  function getStylesText() {
    return [
      '#' + OVERLAY_ID + '{position:fixed;inset:0;background:rgba(0,0,0,0.7);display:none;align-items:center;justify-content:center;z-index:9999;padding:16px;}',
      '#' + OVERLAY_ID + '.is-open{display:flex;}',
      '#' + MODAL_ID + '{width:min(720px,100%);max-height:90vh;overflow-y:auto;background:#15161a;border:1px solid #2b2d33;border-radius:14px;color:#f7f7f7;box-shadow:0 24px 60px rgba(0,0,0,0.45);padding:28px;position:relative;font-family:Inter,Arial,sans-serif;}',
      '.abc-modal-title{font-size:28px;line-height:1.1;margin-bottom:8px;}',
      '.abc-modal-subtitle{color:#d4d6dc;margin-bottom:18px;}',
      '.abc-close{position:absolute;top:14px;right:14px;border:none;background:transparent;color:#f7f7f7;cursor:pointer;font-size:24px;line-height:1;}',
      '.abc-progress-wrapper{margin-bottom:18px;}',
      '.abc-progress-info{display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:8px;color:#c6c8ce;}',
      '.abc-progress-track{width:100%;height:9px;border-radius:999px;background:#2a2c34;overflow:hidden;}',
      '.abc-progress-bar{width:0;height:100%;border-radius:999px;background:linear-gradient(90deg,#8a6a2f,#c8ad6d);transition:width 0.25s ease;}',
      '#' + FORM_ID + '{display:grid;gap:12px;}',
      '#' + FORM_ID + '>div{display:grid;gap:6px;}',
      '.bold_label{font-weight:600;color:#e8e9ed;}',
      '.input-style{width:100%;border:1px solid #3b3e48;border-radius:8px;background:#111218;color:#ffffff;padding:11px 12px;outline:none;}',
      '.input-style:focus{border-color:#c8ad6d;box-shadow:0 0 0 3px rgba(200,173,109,0.2);}',
      '.abc-submit{margin-top:8px;border:1px solid #c8ad6d;background:#c8ad6d;color:#111111;border-radius:8px;padding:12px 14px;font-weight:700;cursor:pointer;transition:0.2s ease;}',
      '.abc-submit:hover{filter:brightness(0.94);}',
      '.abc-success-overlay{position:absolute;inset:0;z-index:20;background:#14161b;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;}',
      '.abc-success-overlay.is-visible{display:flex;animation:abcFadeIn 0.25s ease;}',
      '.abc-success-content{display:grid;gap:14px;place-items:center;}',
      '.abc-success-ring{width:84px;height:84px;border-radius:50%;border:5px solid rgba(200,173,109,0.25);border-top-color:#c8ad6d;animation:abcSpin 0.9s linear infinite;}',
      '.abc-success-overlay.is-done .abc-success-ring{animation:none;border-color:#c8ad6d;}',
      '.abc-success-check{width:24px;height:42px;border-right:5px solid #c8ad6d;border-bottom:5px solid #c8ad6d;transform:rotate(45deg) scale(0);opacity:0;margin-top:-120px;transition:transform 0.2s ease,opacity 0.2s ease;}',
      '.abc-success-overlay.is-done .abc-success-check{transform:rotate(45deg) scale(1);opacity:1;}',
      '.abc-success-title{font-size:25px;font-weight:700;color:#f4f4f4;}',
      '.abc-success-text{color:#d4d8df;}',
      '.abc-success-close{margin-top:8px;border:1px solid #c8ad6d;background:#c8ad6d;color:#121212;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;}',
      '.abc-form-hidden{visibility:hidden;}',
      '@keyframes abcSpin{to{transform:rotate(360deg);}}',
      '@keyframes abcFadeIn{from{opacity:0;}to{opacity:1;}}',
    ].join('');
  }

  function getModalHtml() {
    return (
      '<div id="' +
      MODAL_ID +
      '" role="dialog" aria-modal="true" aria-labelledby="abcModalTitle">' +
      '<button class="abc-close" id="abcCloseModal" type="button" aria-label="Fechar modal">&times;</button>' +
      '<h2 id="abcModalTitle" class="abc-modal-title">Aceleramos o sucesso do seu negocio</h2>' +
      '<p class="abc-modal-subtitle">Preencha os dados abaixo e acompanhe seu progresso em tempo real.</p>' +
      '<div class="abc-progress-wrapper"><div class="abc-progress-info"><span>Progresso do formulario</span><span id="' +
      PROGRESS_TEXT_ID +
      '">0%</span></div><div class="abc-progress-track"><div id="' +
      PROGRESS_BAR_ID +
      '" class="abc-progress-bar"></div></div></div>' +
      '<form method="post" name="formulario" id="' +
      FORM_ID +
      '">' +
      '<div><label for="cnpj" class="bold_label">CNPJ:</label><input type="text" id="cnpj" name="cnpj" placeholder="Insira seu CNPJ" class="input-style" required maxlength="18"></div>' +
      '<div><label for="faturamento" class="bold_label">Faturamento anual:</label><select id="faturamento" name="faturamento" class="input-style" required><option disabled selected value="">Selecione uma opcao</option><option value="Abaixo de R$ 30 milhoes">Abaixo de R$ 30 milhoes</option><option value="R$ 30 milhoes a R$100 milhoes">R$ 30 milhoes a R$100 milhoes</option><option value="R$ 100 milhoes a R$ 300 milhoes">R$ 100 milhoes a R$ 300 milhoes</option><option value="Acima de R$ 300 milhoes">Acima de R$ 300 milhoes</option></select></div>' +
      '<div><label for="email" class="bold_label">Email:</label><input type="email" id="email" name="email" placeholder="Insira seu email" class="input-style" required></div>' +
      '<div><label for="telefone" class="bold_label">Telefone:</label><input type="text" id="telefone" name="telefone" placeholder="Insira o Telefone" class="input-style" required></div>' +
      '<div><label for="seu_nome" class="bold_label">Seu nome:</label><input type="text" id="seu_nome" name="seu_nome" placeholder="Insira seu nome" class="input-style" required></div>' +
      '<div><label for="cargo" class="bold_label">Cargo:</label><input type="text" id="cargo" name="cargo" placeholder="Insira seu Cargo" class="input-style" required></div>' +
      '<div><label for="' +
      PRODUTO_SELECT_ID +
      '" class="bold_label">Produto de interesse:</label><select id="' +
      PRODUTO_SELECT_ID +
      '" name="produto_de_interesse" class="input-style" required><option disabled selected value="">Selecione uma opcao</option><option value="ativos">Ativos</option><option value="cambio">Cambio</option><option value="derivativos">Derivativos</option><option value="trade_finance">Trade Finance</option><option value="captacao">Captacao</option><option value="convenio_cartoes">Convenio Cartoes</option><option value="abertura_conta_corrente">Abertura de Conta Corrente</option><option value="compromissada">Compromissada</option><option value="pagamento_cobranca">Pagamento e Cobranca</option><option value="convenio_fornecedor">Convenio Fornecedor</option><option value="energia">Energia</option><option value="seguros">Seguros</option><option value="gestao_de_credito">Gestao de credito</option><option value="outros">Outros</option></select><input type="text" id="' +
      OUTROS_INPUT_ID +
      '" style="display:none;margin-top:8px;" class="input-style" placeholder="Por favor, especifique"></div>' +
      '<button type="button" id="enviar" class="abc-submit">Enviar solicitacao</button>' +
      '</form>' +
      '<div id="' +
      SUCCESS_OVERLAY_ID +
      '" class="abc-success-overlay" aria-hidden="true"><div class="abc-success-content"><div class="abc-success-ring"></div><div class="abc-success-check"></div><h3 class="abc-success-title">Solicitacao registrada</h3><p class="abc-success-text">Recebemos seus dados para analise.</p><button type="button" id="abcSuccessClose" class="abc-success-close">Fechar</button></div></div>' +
      '</div>'
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStylesText();
    document.head.appendChild(style);
  }

  function openModal() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    scheduleProgressRefreshes();
  }

  function closeModal() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    hideSuccessOverlay();
  }

  function normalizeCnpj(value) {
    return value.replace(/\D/g, '').slice(0, 14);
  }

  function formatCnpj(value) {
    const digits = normalizeCnpj(value);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + '.' + digits.slice(2);
    if (digits.length <= 8) return digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5);
    if (digits.length <= 12)
      return digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5, 8) + '/' + digits.slice(8);
    return (
      digits.slice(0, 2) +
      '.' +
      digits.slice(2, 5) +
      '.' +
      digits.slice(5, 8) +
      '/' +
      digits.slice(8, 12) +
      '-' +
      digits.slice(12, 14)
    );
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    if (digits.length <= 10)
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  }

  function toggleOutrosField() {
    const select = document.getElementById(PRODUTO_SELECT_ID);
    const outrosInput = document.getElementById(OUTROS_INPUT_ID);
    if (!select || !outrosInput) {
      return;
    }
    const shouldShow = select.value === 'outros';
    outrosInput.style.display = shouldShow ? 'block' : 'none';
    outrosInput.required = shouldShow;
    if (!shouldShow) {
      outrosInput.value = '';
    }
    updateProgress();
  }

  function isFieldCompleted(field) {
    if (!field) return false;
    const value = field.value.trim();
    if (!value) return false;
    if (field.tagName === 'SELECT') return value !== '';
    return true;
  }

  function getTrackableFields() {
    const ids = ['cnpj', 'faturamento', 'email', 'telefone', 'seu_nome', 'cargo', PRODUTO_SELECT_ID];
    const fields = ids.map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);
    const select = document.getElementById(PRODUTO_SELECT_ID);
    const outrosInput = document.getElementById(OUTROS_INPUT_ID);
    if (select && outrosInput && select.value === 'outros') {
      fields.push(outrosInput);
    }
    return fields;
  }

  function updateProgress() {
    const fields = getTrackableFields();
    if (!fields.length) return;
    const completed = fields.filter(isFieldCompleted).length;
    const percent = Math.round((completed / fields.length) * 100);
    const progressBar = document.getElementById(PROGRESS_BAR_ID);
    const progressText = document.getElementById(PROGRESS_TEXT_ID);
    if (progressBar) progressBar.style.width = String(percent) + '%';
    if (progressText) progressText.textContent = String(percent) + '%';
  }

  function scheduleProgressRefreshes() {
    updateProgress();
    [100, 350, 800, 1500].forEach(function (delay) {
      window.setTimeout(updateProgress, delay);
    });
  }

  function showSuccessOverlay() {
    const successOverlay = document.getElementById(SUCCESS_OVERLAY_ID);
    const form = document.getElementById(FORM_ID);
    if (!successOverlay) return;
    if (form) form.classList.add('abc-form-hidden');
    successOverlay.classList.add('is-visible');
    successOverlay.classList.remove('is-done');
    successOverlay.setAttribute('aria-hidden', 'false');
    window.setTimeout(function () {
      successOverlay.classList.add('is-done');
    }, 900);
  }

  function hideSuccessOverlay() {
    const successOverlay = document.getElementById(SUCCESS_OVERLAY_ID);
    const form = document.getElementById(FORM_ID);
    if (!successOverlay) return;
    successOverlay.classList.remove('is-visible', 'is-done');
    successOverlay.setAttribute('aria-hidden', 'true');
    if (form) form.classList.remove('abc-form-hidden');
  }

  function processLocalSubmission(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
    const form = document.getElementById(FORM_ID);
    const outrosInput = document.getElementById(OUTROS_INPUT_ID);
    if (!form) return false;
    if (!form.reportValidity()) {
      return false;
    }
    showSuccessOverlay();
    form.reset();
    if (outrosInput) {
      outrosInput.style.display = 'none';
      outrosInput.required = false;
    }
    updateProgress();
    return false;
  }

  function attachProgressListeners() {
    const form = document.getElementById(FORM_ID);
    const submitButton = document.getElementById('enviar');
    const cnpjInput = document.getElementById('cnpj');
    const phoneInput = document.getElementById('telefone');
    const productSelect = document.getElementById(PRODUTO_SELECT_ID);

    if (!form) return;
    if (form.getAttribute(DATA_BIND_LISTENERS) === 'true') return;
    form.setAttribute(DATA_BIND_LISTENERS, 'true');

    // Bloqueio defensivo para impedir submit nativo.
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      return false;
    }, true);

    form.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', updateProgress);
      field.addEventListener('change', updateProgress);
      field.addEventListener('blur', updateProgress);
    });

    if (submitButton && submitButton.getAttribute('data-submit-listener-added') !== 'true') {
      submitButton.setAttribute('data-submit-listener-added', 'true');
      submitButton.addEventListener('click', processLocalSubmission);
    }

    if (productSelect && productSelect.getAttribute('data-outros-listener-added') !== 'true') {
      productSelect.setAttribute('data-outros-listener-added', 'true');
      productSelect.addEventListener('change', toggleOutrosField);
    }

    if (cnpjInput && cnpjInput.getAttribute('data-cnpj-mask-listener-added') !== 'true') {
      cnpjInput.setAttribute('data-cnpj-mask-listener-added', 'true');
      cnpjInput.addEventListener('input', function () {
        cnpjInput.value = formatCnpj(cnpjInput.value);
      });
    }

    if (phoneInput && phoneInput.getAttribute('data-phone-mask-listener-added') !== 'true') {
      phoneInput.setAttribute('data-phone-mask-listener-added', 'true');
      phoneInput.addEventListener('input', function () {
        phoneInput.value = formatPhone(phoneInput.value);
      });
    }
  }

  function buildModal() {
    if (document.getElementById(OVERLAY_ID)) {
      return;
    }
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = getModalHtml();
    document.body.appendChild(overlay);

    const closeButton = document.getElementById('abcCloseModal');
    const successCloseButton = document.getElementById('abcSuccessClose');

    if (closeButton && closeButton.getAttribute('data-close-listener-added') !== 'true') {
      closeButton.setAttribute('data-close-listener-added', 'true');
      closeButton.addEventListener('click', closeModal);
    }

    if (successCloseButton && successCloseButton.getAttribute('data-close-listener-added') !== 'true') {
      successCloseButton.setAttribute('data-close-listener-added', 'true');
      successCloseButton.addEventListener('click', function () {
        hideSuccessOverlay();
        closeModal();
      });
    }

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeModal();
      }
    });

    if (document.body.getAttribute(DATA_DOC_ESC_LISTENER) !== 'true') {
      document.body.setAttribute(DATA_DOC_ESC_LISTENER, 'true');
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
          closeModal();
        }
      });
    }

    attachProgressListeners();
  }

  function connectButtonToModal() {
    const buttonByOnclick = document.querySelector(
      'button.buttonPrimaryNegative[onclick*="abcbrasil.com.br/institucional"]'
    );
    const buttonByText = Array.from(document.querySelectorAll('button.buttonPrimaryNegative')).find(function (btn) {
      return (btn.textContent || '').trim().toLowerCase() === 'saiba mais';
    });
    const button = buttonByOnclick || buttonByText;

    if (!button) {
      return;
    }

    if (button.getAttribute(DATA_BUTTON_LISTENER) === 'true') {
      return;
    }

    button.removeAttribute('onclick');
    button.setAttribute('type', 'button');
    button.setAttribute(DATA_BUTTON_LISTENER, 'true');
    button.addEventListener('click', openModal);
  }

  function init() {
    injectStyles();
    buildModal();
    connectButtonToModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
