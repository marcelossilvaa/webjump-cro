(function () {
  'use strict';

  // =========================================================
  // Nespresso — ABC Assinatura Prime PDP — Variant C
  // Reestrutura o bloco ".primePDP" (pill + "Zero mensalidade" + benefícios compactos)
  // =========================================================

  if (window.atNespressoPrimePdpVariantCInitialized) {
    return;
  }
  window.atNespressoPrimePdpVariantCInitialized = true;

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'at-nespresso-prime-pdp-abc-c-style';
  const ROOT_SELECTOR = '.primePDP';
  const APPLIED_ATTR = 'data-at-prime-pdp-abc';
  const APPLIED_VALUE = 'C';

  function debounce(fn, waitMs) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(fn, waitMs);
  }

  function safeText(el) {
    return el && el.textContent ? el.textContent.trim() : '';
  }

  function pushTargetMetadata() {
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: 'adobe_target',
        event_raised_by: 'adobe target',
        experiment_id: '${campaign.id}',
        experiment_type: 'ABC',
        experiment_name: '${campaign.name}',
        experiment_variant_id: '${campaign.recipe.id}',
        experiment_variant: '${campaign.recipe.name}',
      });
    } catch (e) {
      // Silencioso
    }
  }

  function track(label, action) {
    if (!label) return;
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: 'local_event',
        event_raised_by: 'br',
        local_event_category: 'user engagement',
        local_event_action: action || 'click',
        local_event_label: label,
      });
    } catch (e) {
      // Silencioso
    }
  }

  function trackViewOnce(root) {
    if (!root || root.hasAttribute('data-at-prime-view-tracked')) return;
    root.setAttribute('data-at-prime-view-tracked', '1');
    track('view_assinatura_prime_pdp_variant_c', 'view');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var F = 'font-family: NespressoLucas, Helvetica, Arial, sans-serif !important;';
    var S = 'box-shadow: initial !important;';
    var R = ROOT_SELECTOR + '[data-at-prime-pdp-abc="C"]';

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      R + ' { position: relative !important; }' +
      R + ' .primeDescontoProdutoContainer { margin-bottom: 10px !important; }' +
      R + ' .primeDescontoProdutoContainer > a[href]:not(.at-prime-pill) { display: none !important; }' +
      R + ' .at-prime-pill { position: relative !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important; width: 100% !important; height: 76px !important; background: #FFFFFF !important; border: 1px solid #000000 !important; border-radius: 60px !important; padding: 0 18px !important; margin-bottom: 14px !important; text-decoration: none !important; color: inherit !important; ' + F + ' ' + S + ' }' +
      R + ' .at-prime-pill-main { display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; gap: 10px !important; ' + F + ' }' +
      R + ' .at-prime-cta { box-sizing: border-box !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 166px !important; height: 48px !important; background: #000000 !important; border: 1px solid #000000 !important; border-radius: 60px !important; flex: 0 0 auto !important; ' + F + ' ' + S + ' }' +
      R + ' .at-prime-cta span { ' + F + ' font-weight: 400 !important; font-size: 18px !important; line-height: 18px !important; color: #FFFFFF !important; }' +
      R + ' .at-prime-price { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; flex: 1 1 auto !important; min-width: 0 !important; ' + F + ' }' +
      R + ' .at-prime-price-amount { ' + F + ' font-weight: 700 !important; font-size: 22px !important; line-height: 18px !important; color: #313030 !important; white-space: nowrap !important; }' +
      R + ' .at-prime-price-caption { ' + F + ' font-weight: 700 !important; font-size: 10px !important; line-height: 18px !important; color: #313030 !important; white-space: nowrap !important; }' +
      R + ' .at-prime-flag { box-sizing: border-box !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 22px !important; background: #257A57 !important; border-radius: 20px !important; flex: 0 0 auto !important; ' + F + ' ' + S + ' }' +
      R + ' .at-prime-flag span { ' + F + ' font-weight: 800 !important; font-size: 10px !important; line-height: 18px !important; color: #FFFFFF !important; }' +
      R + ' .at-prime-zero-inline { position: absolute !important; left: 40px !important; bottom: -9px !important; display: inline-flex !important; align-items: center !important; background: #FFFFFF !important; border-radius: 6px !important; padding: 0 6px !important; ' + F + ' font-weight: 700 !important; font-size: 10.5px !important; line-height: 17px !important; color: #17171A !important; ' + S + ' }' +
      R + ' .at-prime-sub { ' + F + ' font-weight: 400 !important; font-size: 10px !important; line-height: 18px !important; color: #17171A !important; text-align: center !important; margin-top: 6px !important; ' + S + ' }' +
      R + ' .beneficiosPrime { display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; gap: 16px !important; margin-top: -5px !important; padding: 0px !important; ' + S + ' ' + F + ' }' +
      R + ' .beneficiosPrime .containerBeneficioPrime { display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; gap: 6px !important; ' + F + ' ' + S + ' }' +
      R + ' .beneficiosPrime .containerBeneficioPrime:last-child { display: none !important; }' +
      R + ' .beneficiosPrime nb-icon { width: 20px !important; height: 20px !important; flex: 0 0 20px !important; }' +
      R + ' .beneficiosPrime svg { width: 20px !important; height: 20px !important; min-width: 20px !important; min-height: 20px !important; color: #17171A !important; ' + S + ' }' +
      R + ' .beneficiosPrime p { ' + F + ' font-weight: 700 !important; font-size: 11px !important; line-height: 18px !important; color: #17171A !important; text-align: left !important; margin: 0 !important; white-space: nowrap !important; }' +
      R + ' .beneficiosPrime .containerBeneficioPrime span { display: none !important; }' +
      R + ' .signUpPrime { display: none !important; }' +
      R + ' .observacaoPrime { display: none !important; }' +
      '@media (max-width: 360px) {' +
      R + ' .at-prime-cta { width: 140px !important; }' +
      R + ' .at-prime-cta span { font-size: 16px !important; }' +
      '}';

    document.head.appendChild(style);
  }

  function readPrimeData(root) {
    const data = {
      href: '',
      title: '',
      price: '',
      flag: '',
      knowBenefitsLink: null,
    };

    if (!root) return data;

    const linkOld = root.querySelector('.primeDescontoProdutoContainer > a[href]');
    if (linkOld) {
      data.href = linkOld.getAttribute('href') || '';
      data.title = linkOld.getAttribute('title') || '';
    }

    const priceEl = root.querySelector('.precoCaixaPrime');
    data.price = safeText(priceEl);

    const flagEl = root.querySelector('.flagDescontoPDP');
    data.flag = safeText(flagEl);

    data.knowBenefitsLink = root.querySelector('.primeDescontoProdutoContainer h3 a[href]');

    return data;
  }

  function buildHTML(data) {
    const href = data && data.href ? data.href : '#';
    const title = data && data.title ? data.title : '';
    const price = data && data.price ? data.price : 'R$ 0,00';
    const flag = data && data.flag ? data.flag : '-10%';

    return (
      '<a class="at-prime-pill" href="' +
      href +
      '" title="' +
      title +
      '">' +
      '<span class="at-prime-pill-main">' +
      '<span class="at-prime-cta" role="button" aria-label="Assine agora"><span>ASSINE AGORA</span></span>' +
      '<span class="at-prime-price" aria-label="Preço com assinatura">' +
      '<span class="at-prime-price-amount">' +
      price +
      '</span>' +
      '<span class="at-prime-price-caption">por caixa com Assinatura</span>' +
      '</span>' +
      '<span class="at-prime-flag" aria-label="Desconto"><span>' +
      flag +
      '</span></span>' +
      '</span>' +
      '<span class="at-prime-zero-inline"><span class="at-prime-zero-badge">Zero mensalidade</span></span>' +
      '</a>' +
      '<div class="at-prime-sub">A partir de 30 cápsulas, garanta</div>'
    );
  }

  function getOldPrimeLink(container) {
    if (!container) return null;

    const children = container.children ? Array.from(container.children) : [];
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      if (!el || el.nodeType !== 1) continue;
      if (el.tagName === 'A' && el.querySelector && el.querySelector('.descontoPDP')) {
        return el;
      }
    }

    return null;
  }

  function applyVariantC() {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return;

    if (root.getAttribute(APPLIED_ATTR) === APPLIED_VALUE) {
      trackViewOnce(root);
      return;
    }

    const data = readPrimeData(root);
    if (!data || !data.href) return;
    if (!data.price) return;

    root.setAttribute(APPLIED_ATTR, APPLIED_VALUE);
    injectStyles();

    const container = root.querySelector('.primeDescontoProdutoContainer');
    if (!container) return;

    const oldLink = getOldPrimeLink(container);
    if (oldLink && oldLink.parentNode) {
      oldLink.parentNode.removeChild(oldLink);
    }

    if (!container.querySelector('.at-prime-pill')) {
      container.insertAdjacentHTML('beforeend', buildHTML(data));
    }

    const pill = container.querySelector('.at-prime-pill');
    if (pill && !pill.hasAttribute('data-at-prime-pill-listener')) {
      pill.setAttribute('data-at-prime-pill-listener', '1');
      pill.addEventListener('click', function () {
        track('click_assine_agora_prime_pdp_variant_c', 'click');
      });
    }

    if (data.knowBenefitsLink && !data.knowBenefitsLink.hasAttribute('data-at-prime-know-added')) {
      data.knowBenefitsLink.setAttribute('data-at-prime-know-added', '1');
      data.knowBenefitsLink.addEventListener('click', function () {
        track('click_conheca_beneficios_prime_pdp_variant_c', 'click');
      });
    }

    trackViewOnce(root);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      applyVariantC();
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    pushTargetMetadata();
    debounce(run, 0);

    if (!window._atNespressoPrimePdpObserverC) {
      let localTimer = null;
      const observer = new MutationObserver(function () {
        if (localTimer) clearTimeout(localTimer);
        localTimer = setTimeout(function () {
          debounce(run, 0);
        }, 150);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window._atNespressoPrimePdpObserverC = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

