(function () {
  'use strict';

  let ajusteAplicado = false;
  let isProcessing = false;
  let debounceTimer = null;
  let tentativas = 0;

  const MAX_TENTATIVAS = 40;
  const INTERVAL_MS = 250;

  // Seletores conhecidos do SDK AppsFlyer Web Banners
  const SELETORES_BANNER = [
    '#af-smart-banner',
    '#af-smart-banner-container',
    '#AF_SMART_BANNER',
    'af-smart-banner',
    '[id^="af-smart"]',
    '[id^="AF_SMART"]'
  ];

  // Inicializa o SDK da AppsFlyer
  !function (t, e, n, s, a, c, i, o, p) { t.AppsFlyerSdkObject = a, t.AF = t.AF || function () { (t.AF.q = t.AF.q || []).push([Date.now()].concat(Array.prototype.slice.call(arguments))) }, t.AF.id = t.AF.id || i, t.AF.plugins = {}, o = e.createElement(n), p = e.getElementsByTagName(n)[0], o.async = 1, o.src = 'https://websdk.appsflyersdk.com?' + (c.length > 0 ? 'st=' + c.split(',').sort().join(',') + '&' : '') + (i.length > 0 ? 'af_id=' + i : ''), p.parentNode.insertBefore(o, p) }(window, document, 'script', 0, 'AF', 'banners', { banners: { key: '6ded0e2a-b4b7-4df7-9c7e-c957f46f9194' } });

  AF('banners', 'showBanner');

  function encontrarBanner() {
    for (let i = 0; i < SELETORES_BANNER.length; i++) {
      const el = document.querySelector(SELETORES_BANNER[i]);
      if (!el) continue;
      const h = el.offsetHeight;
      // Sanidade: banner real tem entre 40px e 250px de altura
      if (h >= 40 && h <= 250) return el;
    }
    return null;
  }

  function aplicarAjuste() {
    if (ajusteAplicado || isProcessing) return;
    isProcessing = true;

    try {
      const banner = encontrarBanner();
      if (!banner) return;

      const alturaBanner = banner.offsetHeight;

      // Adiciona padding-top ao body para o conteudo scrollavel nao ficar atras do banner
      const paddingAtual = parseInt(window.getComputedStyle(document.body).paddingTop) || 0;
      document.body.style.setProperty('padding-top', (paddingAtual + alturaBanner) + 'px', 'important');

      // Empurra o header para baixo do banner se for fixed ou sticky
      const header = document.querySelector('header');
      if (header) {
        const posicao = window.getComputedStyle(header).position;
        if (posicao === 'fixed' || posicao === 'sticky') {
          const topAtual = parseFloat(window.getComputedStyle(header).top) || 0;
          header.style.setProperty('top', (topAtual + alturaBanner) + 'px', 'important');
        }
      }

      ajusteAplicado = true;
    } finally {
      isProcessing = false;
    }
  }

  function debouncedAjuste() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(aplicarAjuste, 150);
  }

  function init() {
    if (window._appsFlyerLayoutObserver) return;

    const observer = new MutationObserver(function (mutations) {
      const temNovoNo = mutations.some(function (m) { return m.addedNodes.length > 0; });
      if (temNovoNo) debouncedAjuste();
    });
    observer.observe(document.body, { childList: true, subtree: false });
    window._appsFlyerLayoutObserver = observer;

    const timer = setInterval(function () {
      tentativas++;
      aplicarAjuste();
      if (ajusteAplicado || tentativas >= MAX_TENTATIVAS) {
        clearInterval(timer);
        if (ajusteAplicado) {
          observer.disconnect();
          window._appsFlyerLayoutObserver = null;
        }
      }
    }, INTERVAL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
