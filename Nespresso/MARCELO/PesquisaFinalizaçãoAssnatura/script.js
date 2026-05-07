(function () {
  'use strict';

  if (window.wjPesquisaFinalizacaoAssinaturaPreview) return;
  window.wjPesquisaFinalizacaoAssinaturaPreview = true;

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'wj-pesquisa-finalizacao-assinatura-style';
  const COMPONENT_ATTR = 'data-wj-pesquisa-experiencia';
  const LISTENER_ATTR = 'data-wj-pesquisa-listeners';
  const QUALTRICS_URL = 'https://nestleglobalmktg.qualtrics.com/jfe/form/SV_3Eh4P5icsXekthA';
  const PREVIEW_WRAPPER_ID = 'wj-pesquisa-preview-wrapper';
  const TRACKING_CATEGORY = 'pesquisa_qualtrics';
  const ICON_WJ = 'https://i.imgur.com/wZbNSRL.png';
  const ICON_RUIM = 'https://i.imgur.com/B72gTvH.png';
  const ICON_OK = 'https://i.imgur.com/5bO7FFw.png';
  const ICON_BOA = 'https://i.imgur.com/fSIDHjT.png';
  const ICON_OTIMA = 'https://i.imgur.com/M2PxuzN.png';

  window.gtmDataObject = window.gtmDataObject || [];
  window.gtmDataObject.push({
    event: 'adobe_target',
    event_raised_by: 'adobe target',
    experiment_id: '${campaign.id}',
    experiment_type: 'AB',
    experiment_name: '${campaign.name}',
    experiment_variant_id: '${campaign.recipe.id}',
    experiment_variant: '${campaign.recipe.name}',
  });

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: TRACKING_CATEGORY,
      local_event_action: action,
      local_event_label: label,
    });
  }

  const MODAL_HTML =
    '<dialog aria-describedby="wj-preview-description" aria-labelledby="wj-preview-heading" aria-modal="true" class="_modal_adovu_7" id="wj-preview-modal" tabindex="-1" data-testid="ThankYouModal" open="">' +
    '<header class="_header_adovu_60">' +
    '<h5 id="wj-preview-heading" class="_heading_adovu_96">Sua Assinatura de Café foi criado com sucesso!</h5>' +
    '<div class="_dismiss_adovu_50"><button type="button" class="_buttonIcon_o8i2p_1 _small_o8i2p_51"><span aria-hidden="true" class="_mask_8z8h7_2" data-icon="24/symbol/close"></span></button></div>' +
    '</header>' +
    '<div class="_content_adovu_118">' +
    '<div class="_body_adovu_111">' +
    '<p id="wj-preview-description" class="_description_adovu_107">Obrigado por configurar sua Assinatura de Café. Verifique seu e-mail e tenha todas as informações relacionadas a seu pedido.</p>' +
    '<div class="_SubmitOrderConfirmation__sdks_t0x7u_613"><div class="DetailsBlockSection_1301"><span class="DetailsBlockSection__title_1301">Endereço de entrega</span><div class="DetailsBlockSection__content_1301"><div id="address-details-modal"><div><div class="AddressDetails_11222"><div class="AddressDetails_address_11222"><div class="DetailsBlock_11222" data-testid="DetailsBlock"><div class="DetailsBlock__container_11222"><div class="DetailsBlock__body_11222 DetailsBlock__body--container_11222 _addressSummary__selector_1c5kd_104"><div class="DetailsBlock__body_11222"><div><div>Senhor Marcelo Santana</div><div>Avenida Jonas Hortelio, 775, Recreio</div><div>45020330 Vitória Da Conquista</div></div></div></div></div></div></div></div></div></div></div></div></div>' +
    '<div class="_SubmitOrderConfirmation__sdks_t0x7u_613"><div class="DetailsBlockSection_1301"><span class="DetailsBlockSection__title_1301">Modo de Entrega</span><div class="DetailsBlockSection__content_1301"><div id="thankYouDeliveryDetails_525289"><div class="_DeliveryDetailsContainer_my5z7_96"><div class="_DeliveryDetails_my5z7_96"><div class="_DeliveryDetails__wrapper_my5z7_114"><h3 class="_DeliveryDetails__title_my5z7_120">Entrega Padrão</h3><div class="_DeliveryDetails__description_my5z7_129" data-testid="delivery-description"><span>Clique em SAIBA MAIS e confira os prazos de entrega.</span></div><div class="_DeliveryDetails__price_my5z7_139">R$ 10,90</div></div></div></div></div></div></div></div>' +
    '<div class="_SubmitOrderConfirmation__frequency_t0x7u_609"><div class="DetailsBlockSection_1301"><span class="DetailsBlockSection__title_1301">Próximo envio</span><div class="DetailsBlockSection__content_1301">14 de jan. de 2029</div></div></div>' +
    '</div>' +
    '<footer class="_footer_adovu_134"><button type="button" class="_button_1dvj5_1 _large_1dvj5_104 _outline_1dvj5_72">Verifique seu pedido</button><button type="button" class="_button_1dvj5_1 _large_1dvj5_104 _secondary_1dvj5_43">Continuar</button></footer>' +
    '</div>' +
    '</dialog>';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '[data-wj-pesquisa-experiencia] {' +
      ' box-sizing: border-box;' +
      ' width: 100%;' +
      ' border: 1px solid #A0BBAA;' +
      ' background: #F8FAF8;' +
      ' border-radius: 8px;' +
      ' padding: 12px 14px;' +
      ' margin-top: 12px;' +
      ' display: flex;' +
      ' gap: 12px;' +
      ' align-items: center;' +
      ' transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;' +
      '}' +
      '[data-wj-pesquisa-experiencia][data-wj-has-selection="1"] {' +
      ' border-color: #7FA38B;' +
      ' box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-icon {' +
      ' width: 36px;' +
      ' height: 36px;' +
      ' flex: 0 0 auto;' +
      ' display: block;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-main {' +
      ' display: flex;' +
      ' flex-direction: column;' +
      ' gap: 6px;' +
      ' flex: 1 1 auto;' +
      ' min-width: 0;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-title {' +
      ' font-size: 16px;' +
      ' line-height: 20px;' +
      ' font-weight: 700;' +
      ' color: #17171A;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-sub {' +
      ' font-size: 13px;' +
      ' line-height: 16px;' +
      ' color: #3D3D41;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-actions {' +
      ' display: flex;' +
      ' gap: 8px;' +
      ' flex-wrap: wrap;' +
      ' margin-top: 2px;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-btn {' +
      ' border: 1px solid #D9E4DB;' +
      ' background: #FFFFFF;' +
      ' color: #17171A;' +
      ' border-radius: 6px;' +
      ' padding: 8px 12px;' +
      ' font-size: 13px;' +
      ' line-height: 16px;' +
      ' cursor: pointer;' +
      ' display: inline-flex;' +
      ' align-items: center;' +
      ' gap: 8px;' +
      ' transition: transform 120ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-btn:hover {' +
      ' border-color: #BFD2C5;' +
      ' box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-btn:active {' +
      ' transform: scale(0.98);' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-btn.is-selected {' +
      ' border-color: #7FA38B;' +
      ' background: rgba(127, 163, 139, 0.12);' +
      ' box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-btn:focus-visible {' +
      ' outline: 2px solid rgba(127, 163, 139, 0.55);' +
      ' outline-offset: 2px;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-face {' +
      ' width: 18px;' +
      ' height: 18px;' +
      ' display: block;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-link {' +
      ' display: inline-flex;' +
      ' align-items: center;' +
      ' gap: 6px;' +
      ' color: #2B6B3F;' +
      ' text-decoration: underline;' +
      ' font-size: 14px;' +
      ' line-height: 18px;' +
      ' margin-top: 2px;' +
      '}' +
      '[data-wj-pesquisa-experiencia] .wj-followup {' +
      ' display: none;' +
      ' margin-top: 8px;' +
      ' padding: 10px 12px;' +
      ' border-radius: 8px;' +
      ' border: 1px solid rgba(127, 163, 139, 0.35);' +
      ' background: rgba(127, 163, 139, 0.10);' +
      ' font-size: 13px;' +
      ' line-height: 16px;' +
      ' color: #17171A;' +
      ' animation: wjFadeInUp 180ms ease both;' +
      '}' +
      '@keyframes wjFadeInUp {' +
      ' from { opacity: 0; transform: translateY(4px); }' +
      ' to { opacity: 1; transform: translateY(0); }' +
      '}' +
      '@media (max-width: 767px) {' +
      ' [data-wj-pesquisa-experiencia] .wj-actions { gap: 4px; }' +
      ' [data-wj-pesquisa-experiencia] .wj-btn { padding: 6px 8px; }' +
      '}' +
      '#' +
      PREVIEW_WRAPPER_ID +
      ' {' +
      ' position: fixed;' +
      ' inset: 0;' +
      ' z-index: 2147483647;' +
      '}' +
      '';

    document.head.appendChild(style);
  }

  function findFrequencyBlock(modal) {
    if (!modal) return null;
    return modal.querySelector('._SubmitOrderConfirmation__frequency_t0x7u_609');
  }

  function svgExternalIcon() {
    return (
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Z" fill="currentColor"></path>' +
      '<path d="M5 5h6v2H7v10h10v-4h2v6H5V5Z" fill="currentColor"></path>' +
      '</svg>'
    );
  }

  function buildComponent() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(COMPONENT_ATTR, '1');
    wrapper.setAttribute('data-wj-tracking', 'pesquisa_finalizacao_assinatura');

    const icon = document.createElement('img');
    icon.className = 'wj-icon';
    icon.alt = '';
    icon.src = ICON_WJ;

    const main = document.createElement('div');
    main.className = 'wj-main';

    const title = document.createElement('div');
    title.className = 'wj-title';
    title.textContent = 'Como foi criar sua assinatura de café?';

    const sub = document.createElement('div');
    sub.className = 'wj-sub';
    sub.textContent = 'Sua opinião nos ajuda a melhorar essa experiência. Leva menos de 1 minuto.';

    const actions = document.createElement('div');
    actions.className = 'wj-actions';

    const opts = [
      { key: 'ruim', label: 'Ruim', icon: ICON_RUIM },
      { key: 'ok', label: 'Ok', icon: ICON_OK },
      { key: 'boa', label: 'Boa', icon: ICON_BOA },
      { key: 'otima', label: 'Ótima', icon: ICON_OTIMA },
    ];

    for (let i = 0; i < opts.length; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wj-btn';
      btn.setAttribute('data-wj-opt', opts[i].key);
      btn.setAttribute('aria-pressed', 'false');

      const face = document.createElement('img');
      face.className = 'wj-face';
      face.alt = '';
      face.src = opts[i].icon;

      const tx = document.createElement('span');
      tx.textContent = opts[i].label;

      btn.appendChild(face);
      btn.appendChild(tx);
      actions.appendChild(btn);
    }

    const link = document.createElement('a');
    link.className = 'wj-link';
    link.href = QUALTRICS_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = 'Responder pesquisa completa ' + svgExternalIcon();
    link.setAttribute('data-wj-cta', 'responder_pesquisa_completa');
    link.addEventListener('click', function () {
      sendGAEvent('click', 'pesquisa_assinatura_clique_responder_pesquisa_completa');
    });

    const followup = document.createElement('div');
    followup.className = 'wj-followup';
    followup.setAttribute('data-wj-followup', '1');

    main.appendChild(title);
    main.appendChild(sub);
    main.appendChild(actions);
    main.appendChild(link);
    main.appendChild(followup);

    wrapper.appendChild(icon);
    wrapper.appendChild(main);

    return wrapper;
  }

  function getFollowupCopy(key) {
    if (key === 'ruim') {
      return 'Poxa. O que mais te atrapalhou? Conta na pesquisa completa que a gente prioriza os ajustes.';
    }
    if (key === 'ok') {
      return 'Entendi. O que faltou para ficar ótimo? Sua resposta na pesquisa completa ajuda muito.';
    }
    if (key === 'boa') {
      return 'Legal. O que funcionou bem pra você? Se puder, detalha na pesquisa completa.';
    }
    if (key === 'otima') {
      return 'Que ótimo. O que você mais gostou? Registra na pesquisa completa pra gente repetir o acerto.';
    }
    return 'Pode contar mais na pesquisa completa?';
  }

  function bindInteractions(component) {
    if (!component) return;
    if (component.getAttribute(LISTENER_ATTR) === '1') return;
    component.setAttribute(LISTENER_ATTR, '1');

    component.addEventListener('click', function (e) {
      const target = e.target;
      if (!target) return;

      const btn = target.closest ? target.closest('[data-wj-opt]') : null;
      if (!btn) return;

      const key = btn.getAttribute('data-wj-opt');
      const followup = component.querySelector('[data-wj-followup="1"]');
      if (!followup) return;

      const all = component.querySelectorAll('[data-wj-opt]');
      for (let i = 0; i < all.length; i++) {
        all[i].classList.remove('is-selected');
        all[i].setAttribute('aria-pressed', 'false');
      }
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
      component.setAttribute('data-wj-has-selection', '1');

      sendGAEvent('click', 'pesquisa_assinatura_selecionou_' + key);
      followup.textContent = getFollowupCopy(key);
      followup.style.display = 'block';
    });
  }

  function removeOldLink(modal) {
    if (!modal) return;
    const old = modal.querySelector('#pesquisa-finalizacao-assinatura');
    if (old) old.remove();
  }

  function upsertComponent(modal) {
    if (!modal) return;

    const existing = modal.querySelector('[' + COMPONENT_ATTR + '="1"]');
    if (existing) {
      bindInteractions(existing);
      return;
    }

    const anchor = findFrequencyBlock(modal);
    if (!anchor || !anchor.parentNode) return;

    const component = buildComponent();
    anchor.insertAdjacentElement('afterend', component);
    bindInteractions(component);
    sendGAEvent('display', 'pesquisa_assinatura_componente_visivel');
  }

  function bindPreviewClose(modal) {
    if (!modal) return;
    if (modal.getAttribute('data-wj-preview-close') === '1') return;
    modal.setAttribute('data-wj-preview-close', '1');

    const closeBtn = modal.querySelector('._dismiss_adovu_50 button');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', function () {
      try {
        modal.close();
      } catch (e) {
        modal.removeAttribute('open');
      }

      const wrapper = document.getElementById(PREVIEW_WRAPPER_ID);
      if (wrapper) wrapper.remove();
    });
  }

  function openPreviewModal() {
    injectStyles();

    if (document.getElementById(PREVIEW_WRAPPER_ID)) {
      const modal = document.querySelector('#' + PREVIEW_WRAPPER_ID + ' [data-testid="ThankYouModal"]');
      if (modal && modal.showModal) {
        try {
          modal.showModal();
        } catch (e) {
          modal.setAttribute('open', '');
        }
      } else if (modal) {
        modal.setAttribute('open', '');
      }
      run();
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.id = PREVIEW_WRAPPER_ID;
    wrapper.innerHTML = MODAL_HTML;
    document.body.appendChild(wrapper);

    const modal = wrapper.querySelector('[data-testid="ThankYouModal"]');
    if (modal && typeof modal.showModal === 'function') {
      try {
        modal.showModal();
      } catch (e) {
        modal.setAttribute('open', '');
      }
    } else if (modal) {
      modal.setAttribute('open', '');
    }

    bindPreviewClose(modal);
    run();
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      injectStyles();

      const modal = document.querySelector('[data-testid="ThankYouModal"]');
      if (!modal) return;

      removeOldLink(modal);
      upsertComponent(modal);
      bindPreviewClose(modal);
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      run();
    }, 150);
  }

  function initObserver() {
    if (window.__wjPesquisaFinalizacaoObserver) return;

    const observer = new MutationObserver(function (mutations) {
      if (!mutations || !mutations.length) return;

      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (!m) continue;
        if (m.addedNodes && m.addedNodes.length) {
          scheduleRun();
          return;
        }
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.__wjPesquisaFinalizacaoObserver = observer;
  }

  function init() {
    window.wjOpenPesquisaFinalizacaoPreview = openPreviewModal;
    run();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();