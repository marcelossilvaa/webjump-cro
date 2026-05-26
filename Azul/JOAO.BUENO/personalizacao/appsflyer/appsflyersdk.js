<script>
(function () {
  'use strict';

  let ajusteAplicado = false;
  let isProcessing = false;
  let debounceTimer = null;
  let tentativas = 0;

  const MAX_TENTATIVAS = 40;
  const INTERVAL_MS = 250;

  // Inicializa o SDK da AppsFlyer
  !function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){(t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,o.src='https://websdk.appsflyersdk.com?'+(c.length>0?'st='+c.split(',').sort().join(',')+'&':'')+(i.length>0?'af_id='+i:''),p.parentNode.insertBefore(o,p)}(window,document,'script',0,'AF','banners',{banners:{key:'6ded0e2a-b4b7-4df7-9c7e-c957f46f9194'}});

  AF('banners', 'showBanner');

  function encontrarBanner() {
    // Tenta pelos seletores conhecidos do SDK AppsFlyer
    const seletores = [
      '#af-smart-banner',
      '#af-smart-banner-container',
      '#AF_SMART_BANNER',
      '[id^="af-smart"]',
      '[id^="AF_SMART"]',
      '[id^="af-banner"]',
      '[class*="af-smart-banner"]',
      '[class*="af-banner"]'
    ];

    for (let i = 0; i < seletores.length; i++) {
      const el = document.querySelector(seletores[i]);
      if (el && el.offsetHeight > 0) return el;
    }

    // Fallback: qualquer filho direto do body (exceto #__next) com position fixed/absolute no topo
    const filhos = Array.prototype.slice.call(document.body.children);
    for (let i = 0; i < filhos.length; i++) {
      const el = filhos[i];
      if (el.id === '__next') continue;
      if (el.offsetHeight === 0) continue;
      const st = window.getComputedStyle(el);
      if ((st.position === 'fixed' || st.position === 'absolute') && parseFloat(st.top) <= 0) {
        return el;
      }
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
      if (alturaBanner === 0) return;

      // Empurra o wrapper principal (#__next) para abaixo do banner
      const wrapperPagina = document.getElementById('__next');
      if (wrapperPagina) {
        const marginAtual = parseInt(window.getComputedStyle(wrapperPagina).marginTop) || 0;
        wrapperPagina.style.setProperty('margin-top', (marginAtual + alturaBanner) + 'px', 'important');
      }

      // Se o header for fixed ou sticky, ajusta o top dele tambem
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
</script>
