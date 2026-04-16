(function () {
  'use strict';

  // =========================================================
  // Nespresso — ABC Assinatura Prime PDP — Variant B
  // Reestrutura o bloco ".primePDP" (CTA + preço + benefícios)
  // =========================================================

  if (window.atNespressoPrimePdpVariantBInitialized) {
    return;
  }
  window.atNespressoPrimePdpVariantBInitialized = true;

  let isProcessing = false;
  let debounceTimer = null;

  const STYLE_ID = 'at-nespresso-prime-pdp-abc-b-style';
  const ROOT_SELECTOR = '.primePDP';
  const APPLIED_ATTR = 'data-at-prime-pdp-abc';
  const APPLIED_VALUE = 'B';

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

  function track(label) {
    if (!label) return;
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: 'local_event',
        event_raised_by: 'br',
        local_event_category: 'user engagement',
        local_event_action: 'click',
        local_event_label: label,
      });
    } catch (e) {
      // Silencioso
    }
  }

  function trackViewOnce(root) {
    if (!root || root.hasAttribute('data-at-prime-view-tracked')) return;
    root.setAttribute('data-at-prime-view-tracked', '1');
    try {
      window.gtmDataObject = window.gtmDataObject || [];
      window.gtmDataObject.push({
        event: 'local_event',
        event_raised_by: 'br',
        local_event_category: 'user engagement',
        local_event_action: 'view',
        local_event_label: 'view_assinatura_prime_pdp_variant_b',
      });
    } catch (e) {
      // Silencioso
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] { position: relative; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .primeDescontoProdutoContainer { margin-bottom: 12px !important; }' +
      // Esconde o link antigo (barra marrom) sem afetar "Conheça os benefícios"
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .primeDescontoProdutoContainer > a[href]:not(.at-prime-pill) { display: none !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-pill { box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 12px !important; width: 100% !important; height: 76px !important; background: #FFFFFF !important; border: 1px solid #86724E !important; border-radius: 60px !important; padding: 0 18px !important; text-decoration: none !important; color: inherit !important; font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; box-shadow: initial !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-cta { box-sizing: border-box !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 166px !important; height: 48px !important; background: #000000 !important; border: 1px solid #86724E !important; border-radius: 60px !important; flex: 0 0 auto !important; font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; box-shadow: initial !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-cta span { font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; font-weight: 400 !important; font-size: 18px !important; line-height: 18px !important; color: #FFFFFF !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-price { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; flex: 1 1 auto !important; min-width: 0 !important; font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-price-amount { font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; font-weight: 700 !important; font-size: 22px !important; line-height: 18px !important; color: #313030 !important; white-space: nowrap !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-price-caption { font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; font-weight: 700 !important; font-size: 10px !important; line-height: 18px !important; color: #313030 !important; white-space: nowrap !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-flag { box-sizing: border-box !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 22px !important; background: #257A57 !important; border-radius: 20px !important; flex: 0 0 auto !important; font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; box-shadow: initial !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-flag span { font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; font-weight: 800 !important; font-size: 10px !important; line-height: 18px !important; color: #FFFFFF !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .beneficiosPrime { display: flex !important; justify-content: center !important; gap: 25px !important; margin-top: -5px !important; box-shadow: initial !important; font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .beneficiosPrime .containerBeneficioPrime { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: flex-start !important; gap: 6px !important; font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; box-shadow: initial !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .beneficiosPrime nb-icon, ' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .beneficiosPrime svg { color: #17171A !important; box-shadow: initial !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .beneficiosPrime p { font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; font-weight: 700 !important; font-size: 11px !important; line-height: 18px !important; color: #17171A !important; text-align: center !important; margin: 0 !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .signUpPrime { display: none !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .observacaoPrime { font-family: NespressoLucas, Helvetica, Arial, sans-serif !important; font-weight: 400 !important; font-size: 10px !important; line-height: 18px !important; color: #17171A !important; text-align: center !important; margin-top: -18px !important; box-shadow: initial !important; }' +
      '@media (max-width: 420px) {' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-pill { padding: 0 12px !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-pill-main { gap: 8px !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-cta { width: 42% !important; padding: 0 10px !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-cta span { font-size: 15px !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-price-amount { font-size: 20px !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-price-caption { font-size: 9px !important; }' +
      ROOT_SELECTOR +
      '[data-at-prime-pdp-abc="B"] .at-prime-flag { width: 34px !important; }' +
      '}';

    document.head.appendChild(style);
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

  function buildPillHTML(data) {
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
      '</a>'
    );
  }

  function readPrimeData(root) {
    const data = {
      href: '',
      title: '',
      price: '',
      flag: '',
      benefits: null,
      knowBenefitsLink: null,
      observation: null,
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

    data.benefits = root.querySelector('section.beneficiosPrime');
    data.knowBenefitsLink = root.querySelector('.primeDescontoProdutoContainer h3 a[href]');
    data.observation = root.querySelector('.observacaoPrime');

    return data;
  }

  function applyVariantB() {
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

    const existingPill = container.querySelector('.at-prime-pill');
    if (!existingPill) {
      container.insertAdjacentHTML('beforeend', buildPillHTML(data));
    }

    const pill = container.querySelector('.at-prime-pill');
    if (pill && !pill.hasAttribute('data-at-prime-pill-listener')) {
      pill.setAttribute('data-at-prime-pill-listener', '1');
      pill.addEventListener('click', function () {
        track('click_assine_agora_prime_pdp_variant_b');
      });
    }

    if (data.knowBenefitsLink && !data.knowBenefitsLink.hasAttribute('data-at-prime-know-added')) {
      data.knowBenefitsLink.setAttribute('data-at-prime-know-added', '1');
      data.knowBenefitsLink.addEventListener('click', function () {
        track('click_conheca_beneficios_prime_pdp_variant_b');
      });
    }

    trackViewOnce(root);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      applyVariantB();
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    pushTargetMetadata();
    debounce(run, 0);

    if (!window._atNespressoPrimePdpObserverB) {
      let localTimer = null;
      const observer = new MutationObserver(function (mutations) {
        const shouldIgnore = mutations.some(function (m) {
          const target = m && m.target ? m.target : null;
          if (target && target.nodeType === 1) {
            if (target.id === STYLE_ID) return true;
            if (target.closest && target.closest(ROOT_SELECTOR + '[' + APPLIED_ATTR + '="' + APPLIED_VALUE + '"]')) {
              return false;
            }
          }
          return false;
        });
        if (shouldIgnore) return;

        if (localTimer) clearTimeout(localTimer);
        localTimer = setTimeout(function () {
          debounce(run, 0);
        }, 150);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window._atNespressoPrimePdpObserverB = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

