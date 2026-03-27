(function () {
  const SCRIPT_FLAG = 'mesDoConsumidorClubeAnualModal';
  const MODAL_ATTR = 'data-mes-consumidor-clube-modal';
  const CTA_URL =
    'https://apps.voeazul.com.br/TudoAzulClub/ClubeTudoAzul/LinkDedicado?promo=322e3ea58f2842d6a43da8e39b96eecc';
  const ANIMATION_MS = 300;

  if (window[SCRIPT_FLAG]) {
    return;
  }
  window[SCRIPT_FLAG] = true;

  let stylesInjected = false;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    var labelEvent = 'AT_MesDoConsumidorLP_ModalClubeAnual_' + eventType + ' ' + eventLabel;

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_MesDoConsumidorLP_ModalClubeAnual';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  const PLAN_DATA = {
    '1k': {
      plano: 'Clube 1.000 Mensal',
      mensal: 'R$ 31,50/mês',
      desconto: '50% OFF',
      anualMensal: 'R$ 21,00/mês',
      economiaAnual: 'R$ 247,50',
      totalAno: 'R$ 252,00',
      pontos: '1.000 pontos',
      ctaLabel: 'ASSINAR CLUBE ANUAL — 50% OFF',
      ctaSecundario: 'Continuar com o plano mensal (R$ 31,50/mês)',
    },
    '2k': {
      plano: 'Clube 2.000 Mensal',
      mensal: 'R$ 56,00/mês',
      desconto: '50% OFF',
      anualMensal: 'R$ 37,00/mês',
      economiaAnual: 'R$ 444,00',
      totalAno: 'R$ 444,00',
      pontos: '2.000 pontos',
      ctaLabel: 'ASSINAR CLUBE ANUAL — 50% OFF',
      ctaSecundario: 'Continuar com o plano mensal (R$ 56,00/mês)',
    },
    '5k': {
      plano: 'Clube 5.000 Mensal',
      mensal: 'R$ 130,90/mês',
      desconto: '50% OFF',
      anualMensal: 'R$ 87,00/mês',
      economiaAnual: 'R$ 1.031,70',
      totalAno: 'R$ 1.044,00',
      pontos: '5.000 pontos',
      ctaLabel: 'ASSINAR CLUBE ANUAL — 50% OFF',
      ctaSecundario: 'Continuar com o plano mensal (R$ 130,90/mês)',
    },
    '10k': {
      plano: 'Clube 10.000 Mensal',
      mensal: 'R$ 259,00/mês',
      desconto: '30% OFF',
      anualMensal: 'R$ 240,80/mês',
      economiaAnual: 'R$ 1.217,40',
      totalAno: 'R$ 2.889,60',
      pontos: '10.000 pontos',
      ctaLabel: 'ASSINAR CLUBE ANUAL — 30% OFF',
      ctaSecundario: 'Continuar com o plano mensal (R$ 259,00/mês)',
    },
    '20k': {
      plano: 'Clube 20.000 Mensal',
      mensal: 'R$ 573,30/mês',
      desconto: '30% OFF',
      anualMensal: 'R$ 533,40/mês',
      economiaAnual: 'R$ 2.690,10',
      totalAno: 'R$ 6.400,80',
      pontos: '20.000 pontos',
      ctaLabel: 'ASSINAR CLUBE ANUAL — 30% OFF',
      ctaSecundario: 'Continuar com o plano mensal (R$ 573,30/mês)',
    },
  };

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement('style');
    style.textContent =
      '@keyframes mesConsumidorClubFadeIn {' +
      'from { opacity: 0; }' +
      'to { opacity: 1; }' +
      '}' +
      '@keyframes mesConsumidorClubFadeOut {' +
      'from { opacity: 1; }' +
      'to { opacity: 0; }' +
      '}' +
      '@keyframes mesConsumidorClubScaleIn {' +
      'from { opacity: 0; transform: translateY(8px) scale(0.98); }' +
      'to { opacity: 1; transform: translateY(0) scale(1); }' +
      '}' +
      '@keyframes mesConsumidorClubScaleOut {' +
      'from { opacity: 1; transform: translateY(0) scale(1); }' +
      'to { opacity: 0; transform: translateY(8px) scale(0.98); }' +
      '}' +
      '.mesConsumidorClubOverlay {' +
      'position: fixed;' +
      'inset: 0;' +
      'display: none;' +
      'justify-content: center;' +
      'align-items: center;' +
      'background: rgba(0, 0, 0, 0.45);' +
      'z-index: 10000;' +
      '}' +
      '.mesConsumidorClubOverlay.active {' +
      'display: flex;' +
      'animation: mesConsumidorClubFadeIn 0.3s ease-out;' +
      '}' +
      '.mesConsumidorClubOverlay.closing {' +
      'display: flex;' +
      'animation: mesConsumidorClubFadeOut 0.3s ease-in forwards;' +
      '}' +
      '.mesConsumidorClubModal {' +
      'width: 520px;' +
      'max-width: calc(100% - 24px);' +
      'background: linear-gradient(175deg, #0061A0 3.67%, #004A7C 96.33%);' +
      'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);' +
      'border-radius: 10px;' +
      'color: #FFFFFF;' +
      'font-family: "Helvetica Neue", Arial, sans-serif;' +
      'animation: mesConsumidorClubScaleIn 0.3s ease-out;' +
      '}' +
      '.mesConsumidorClubModal.closing {' +
      'animation: mesConsumidorClubScaleOut 0.3s ease-in forwards;' +
      '}' +
      '.mesConsumidorClubModal * { box-sizing: border-box; }' +
      '.mesConsumidorClubHeader {' +
      'padding: 24px 24px 0;' +
      'position: relative;' +
      '}' +
      '.mesConsumidorClubTag {' +
      'display: inline-flex;' +
      'align-items: center;' +
      'gap: 8px;' +
      'padding: 0 12px;' +
      'height: 25px;' +
      'border-radius: 9999px;' +
      'background: #041E42;' +
      'font-size: 11px;' +
      'line-height: 16px;' +
      '}' +
      '.mesConsumidorClubTag svg { width: 12px; height: 12px; }' +
      '.mesConsumidorClubTitle {' +
      'margin: 12px 0 0;' +
      'font-size: 30px;' +
      'font-weight: 700;' +
      'line-height: 31px;' +
      '}' +
      '.mesConsumidorClubTitleAccent { color: #3DB2E2; }' +
      '.mesConsumidorClubClose {' +
      'position: absolute;' +
      'right: 20px;' +
      'top: 20px;' +
      'width: 32px;' +
      'height: 32px;' +
      'border: none;' +
      'border-radius: 9999px;' +
      'background: rgba(255, 255, 255, 0.15);' +
      'color: #FFFFFF;' +
      'cursor: pointer;' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'font-size: 22px;' +
      'line-height: 1;' +
      'padding: 0;' +
      '}' +
      '.mesConsumidorClubSelected {' +
      'margin: 16px 24px 0;' +
      'height: 31px;' +
      'padding: 0 12px;' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 8px;' +
      'border-radius: 9999px;' +
      'background: rgba(255, 255, 255, 0.15);' +
      'font-size: 13px;' +
      'line-height: 20px;' +
      '}' +
      '.mesConsumidorClubSelected strong { font-weight: 700; }' +
      '.mesConsumidorClubSelectedMuted { color: rgba(255, 255, 255, 0.6); font-size: 12px; }' +
      '.mesConsumidorClubSelectedMuted::before { content: "· "; }' +
      '.mesConsumidorClubPricing {' +
      'margin: 16px 24px 0;' +
      'background: linear-gradient(160deg, #004F87 8.49%, #003660 91.51%);' +
      'border: 1px solid rgba(255, 255, 255, 0.1);' +
      'border-radius: 12px;' +
      'overflow: hidden;' +
      '}' +
      '.mesConsumidorClubTop {' +
      'display: flex;' +
      'justify-content: flex-end;' +
      'align-items: center;' +
      'gap: 16px;' +
      'padding: 0 24px;' +
      'height: 82px;' +
      'border-bottom: 1px solid rgba(255, 255, 255, 0.12);' +
      '}' +
      '.mesConsumidorClubDiscount {' +
      'min-width: 119px;' +
      'height: 42px;' +
      'padding: 0 20px;' +
      'border-radius: 9999px;' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'font-size: 20px;' +
      'font-weight: 700;' +
      'line-height: 30px;' +
      'white-space: nowrap;' +
      'color: #041E42;' +
      'background: #3DB2E2;' +
      '}' +
      '.mesConsumidorClubPriceGroup { text-align: right; min-width: 0; }' +
      '.mesConsumidorClubPriceLabel {' +
      'font-size: 11px;' +
      'line-height: 16px;' +
      'letter-spacing: 0.06em;' +
      'text-transform: uppercase;' +
      'color: rgba(255, 255, 255, 0.55);' +
      '}' +
      '.mesConsumidorClubPriceValue {' +
      'margin-top: 0;' +
      'font-size: 32px;' +
      'font-weight: 700;' +
      'line-height: 32px;' +
      'white-space: nowrap;' +
      'color: #FFFFFF;' +
      '}' +
      '.mesConsumidorClubPriceValue small {' +
      'font-size: 20px;' +
      'font-weight: 400;' +
      'color: rgba(255, 255, 255, 0.85);' +
      '}' +
      '.mesConsumidorClubRows { padding: 12px 20px; }' +
      '.mesConsumidorClubRow {' +
      'display: flex;' +
      'justify-content: space-between;' +
      'align-items: center;' +
      'min-height: 35px;' +
      '}' +
      '.mesConsumidorClubLabel {' +
      'font-size: 13px;' +
      'line-height: 20px;' +
      'color: rgba(255, 255, 255, 0.55);' +
      '}' +
      '.mesConsumidorClubValueEconomy {' +
      'font-size: 18px;' +
      'font-weight: 700;' +
      'line-height: 27px;' +
      'color: #3DB2E2;' +
      '}' +
      '.mesConsumidorClubValueTotal {' +
      'font-size: 18px;' +
      'font-weight: 700;' +
      'line-height: 27px;' +
      'color: #FFFFFF;' +
      '}' +
      '.mesConsumidorClubDivider {' +
      'margin: 8px 0;' +
      'height: 1px;' +
      'background: rgba(255, 255, 255, 0.08);' +
      '}' +
      '.mesConsumidorClubFoot {' +
      'display: flex;' +
      'align-items: center;' +
      'gap: 10px;' +
      'font-size: 13px;' +
      'line-height: 18px;' +
      'color: rgba(255, 255, 255, 0.7);' +
      '}' +
      '.mesConsumidorClubFoot strong { color: #FFFFFF; }' +
      '.mesConsumidorClubCalendar {' +
      'width: 24px;' +
      'height: 24px;' +
      'border-radius: 9999px;' +
      'background: rgba(255, 255, 255, 0.12);' +
      'display: inline-flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'flex-shrink: 0;' +
      '}' +
      '.mesConsumidorClubCalendar svg { width: 13px; height: 13px; }' +
      '.mesConsumidorClubActions {' +
      'padding: 16px 24px 20px;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 12px;' +
      '}' +
      '.mesConsumidorClubPrimary {' +
      'width: 100%;' +
      'height: 56px;' +
      'border: none;' +
      'border-radius: 24px;' +
      'background: #FFFFFF;' +
      'color: #041E42;' +
      'font-size: 16px;' +
      'font-weight: 700;' +
      'line-height: 24px;' +
      'letter-spacing: 0.05em;' +
      'text-transform: uppercase;' +
      'cursor: pointer;' +
      '}' +
      '.mesConsumidorClubSecondary {' +
      'width: 100%;' +
      'min-height: 45px;' +
      'border: none;' +
      'background: transparent;' +
      'color: rgba(255, 255, 255, 0.8);' +
      'font-size: 14px;' +
      'line-height: 21px;' +
      'cursor: pointer;' +
      'padding: 0 10px;' +
      '}' +
      '@media (max-width: 540px) {' +
      '.mesConsumidorClubModal { width: calc(100% - 16px); max-height: calc(100vh - 16px); overflow-y: auto; }' +
      '.mesConsumidorClubHeader { padding: 20px 16px 0; }' +
      '.mesConsumidorClubTitle { font-size: 20px; line-height: 31px; max-width: 270px; }' +
      '.mesConsumidorClubSelected,' +
      '.mesConsumidorClubPricing,' +
      '.mesConsumidorClubActions { margin-left: 16px; margin-right: 16px; padding-left: 0; padding-right: 0; }' +
      '.mesConsumidorClubSelected { height: auto; margin-top: 14px; padding: 6px 25px; gap: 2px; font-size: 12px; line-height: 18px; flex-wrap: wrap; }' +
      '.mesConsumidorClubSelectedMuted { width: 100%; font-size: 12px; line-height: 18px; }' +
      '.mesConsumidorClubSelectedMuted::before { content: ""; }' +
      '.mesConsumidorClubTop { padding: 10px 12px; height: auto; gap: 10px; justify-content: space-between; align-items: center; }' +
      '.mesConsumidorClubDiscount { min-width: 98px; height: 36px; padding: 0 12px; font-size: 16px; line-height: 24px; }' +
      '.mesConsumidorClubPriceLabel { font-size: 10px; line-height: 14px; }' +
      '.mesConsumidorClubPriceValue { font-size: 28px; line-height: 30px; }' +
      '.mesConsumidorClubPriceValue small { font-size: 18px; }' +
      '.mesConsumidorClubRows { padding: 10px 12px; }' +
      '.mesConsumidorClubRow { min-height: 30px; }' +
      '.mesConsumidorClubLabel { font-size: 12px; line-height: 18px; }' +
      '.mesConsumidorClubValueEconomy,' +
      '.mesConsumidorClubValueTotal { font-size: 16px; line-height: 24px; }' +
      '.mesConsumidorClubFoot { font-size: 12px; line-height: 17px; align-items: flex-start; }' +
      '.mesConsumidorClubActions { padding-top: 14px; padding-bottom: 16px; gap: 10px; }' +
      '.mesConsumidorClubPrimary { height: 54px; font-size: 14px; line-height: 22px; letter-spacing: 0.03em; }' +
      '.mesConsumidorClubSecondary { min-height: 40px; font-size: 13px; line-height: 19px; }' +
      '}';

    document.head.appendChild(style);
  }

  function getPlanFromEvent(event) {
    const target = event.target;
    if (!target || !target.closest) return null;

    const clickable = target.closest('button, a');
    if (!clickable) return null;

    const img = clickable.querySelector('img[src*="Clube"]');
    if (!img) return null;

    const src = img.getAttribute('src') || '';
    const match = src.match(/Clube30off(1k|2k|5k|10k|20k)\.png/i);
    if (!match) return null;

    return {
      discountCode: '30',
      planKey: match[1].toLowerCase(),
    };
  }

  function buildModalMarkup(plan) {
    return (
      '<div class="mesConsumidorClubModal" role="dialog" aria-modal="true" aria-label="Oferta especial">' +
      '<div class="mesConsumidorClubHeader">' +
      '<span class="mesConsumidorClubTag">' +
      '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M6.35 0.5H10.5C11.05 0.5 11.5 0.95 11.5 1.5V5.65C11.5 5.91 11.4 6.16 11.21 6.35L6.35 11.21C5.96 11.6 5.33 11.6 4.94 11.21L0.79 7.06C0.4 6.67 0.4 6.04 0.79 5.65L5.65 0.79C5.84 0.6 6.09 0.5 6.35 0.5Z" stroke="white" stroke-width="1"/>' +
      '<circle cx="8.5" cy="3.5" r="1" fill="white"/>' +
      '</svg>' +
      'OFERTA ESPECIAL' +
      '</span>' +
      '<button class="mesConsumidorClubClose" type="button" aria-label="Fechar modal">&times;</button>' +
      '<h2 class="mesConsumidorClubTitle">Economize muito mais com<br>o plano <span class="mesConsumidorClubTitleAccent">anual!</span></h2>' +
      '</div>' +
      '<div class="mesConsumidorClubSelected">' +
      '<span>Você selecionou:</span>' +
      '<strong>' +
      plan.plano +
      '</strong>' +
      '<span class="mesConsumidorClubSelectedMuted">' +
      plan.mensal +
      '</span>' +
      '</div>' +
      '<div class="mesConsumidorClubPricing">' +
      '<div class="mesConsumidorClubTop">' +
      '<span class="mesConsumidorClubDiscount">' +
      plan.desconto +
      '</span>' +
      '<div class="mesConsumidorClubPriceGroup">' +
      '<p class="mesConsumidorClubPriceLabel">PLANO ANUAL POR APENAS</p>' +
      '<p class="mesConsumidorClubPriceValue">' +
      plan.anualMensal.replace('/mês', '<small>/mês</small>') +
      '</p>' +
      '</div>' +
      '</div>' +
      '<div class="mesConsumidorClubRows">' +
      '<div class="mesConsumidorClubRow"><span class="mesConsumidorClubLabel">Economia anual</span><strong class="mesConsumidorClubValueEconomy">' +
      plan.economiaAnual +
      '</strong></div>' +
      '<div class="mesConsumidorClubRow"><span class="mesConsumidorClubLabel">Total cobrado no ano</span><strong class="mesConsumidorClubValueTotal">' +
      plan.totalAno +
      '</strong></div>' +
      '<div class="mesConsumidorClubDivider"></div>' +
      '<div class="mesConsumidorClubFoot">' +
      '<span class="mesConsumidorClubCalendar">' +
      '<svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M4.2 1.5V3M8.8 1.5V3M1.8 5.2H11.2M2.4 2.5H10.6C10.93 2.5 11.2 2.77 11.2 3.1V10.6C11.2 10.93 10.93 11.2 10.6 11.2H2.4C2.07 11.2 1.8 10.93 1.8 10.6V3.1C1.8 2.77 2.07 2.5 2.4 2.5Z" stroke="rgba(255,255,255,0.7)" stroke-width="1.08" stroke-linecap="round"/>' +
      '</svg>' +
      '</span>' +
      '<span>Acumule <strong>' +
      plan.pontos +
      '</strong> por mês durante 12 meses</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="mesConsumidorClubActions">' +
      '<button type="button" class="mesConsumidorClubPrimary">' +
      plan.ctaLabel +
      '</button>' +
      '<button type="button" class="mesConsumidorClubSecondary">' +
      plan.ctaSecundario +
      '</button>' +
      '</div>' +
      '</div>'
    );
  }

  function closeModal(onClosed) {
    const overlay = document.querySelector('[' + MODAL_ATTR + ']');
    if (!overlay) {
      if (typeof onClosed === 'function') onClosed();
      return;
    }
    if (overlay.classList.contains('closing')) return;

    const modal = overlay.querySelector('.mesConsumidorClubModal');
    overlay.classList.add('closing');
    if (modal) modal.classList.add('closing');

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof onClosed === 'function') onClosed();
    }, ANIMATION_MS);
  }

  function openModal(planSelection) {
    const planKey = planSelection && planSelection.planKey;
    const discountCode = planSelection && planSelection.discountCode;
    const plan = PLAN_DATA[planKey];
    if (!plan) return;
    const contextLabel = (discountCode || 'na') + '_' + planKey;

    injectStyles();
    closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'mesConsumidorClubOverlay';
    overlay.setAttribute(MODAL_ATTR, 'true');
    overlay.innerHTML = buildModalMarkup(plan);

    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add('active');
    });
    analyticsEvent(contextLabel, 'ModalOpen');

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        analyticsEvent(contextLabel, 'ModalCloseOverlay');
        closeModal();
      }
    });

    const closeBtn = overlay.querySelector('.mesConsumidorClubClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        analyticsEvent(contextLabel, 'ModalCloseX');
        closeModal();
      });
    }

    const secondaryBtn = overlay.querySelector('.mesConsumidorClubSecondary');
    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', function () {
        analyticsEvent(contextLabel, 'ModalContinueMensal');
        window.location.href = CTA_URL;
      });
    }

    const primaryBtn = overlay.querySelector('.mesConsumidorClubPrimary');
    if (primaryBtn) {
      primaryBtn.addEventListener('click', function () {
        analyticsEvent(contextLabel, 'ModalCTAAnual');
        closeModal(function () {
          window.location.href = CTA_URL;
        });
      });
    }
  }

  document.addEventListener(
    'click',
    function (event) {
      const planSelection = getPlanFromEvent(event);
      if (!planSelection) return;

      // Bloqueia o comportamento original do card (navegação/redirect).
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }

      analyticsEvent(planSelection.discountCode + '_' + planSelection.planKey, 'ClickCard');

      // Aguarda o fluxo atual do card (copy/efeitos) e abre o modal em seguida.
      setTimeout(function () {
        openModal(planSelection);
      }, 0);
    },
    true,
  );
})();
