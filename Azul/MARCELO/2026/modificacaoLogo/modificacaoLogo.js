(function () {
  'use strict';
  const SCRIPT_ID = 'cro-modificacao-logo';
  const STYLE_ID = 'cro-modificacao-logo-style';
  const TARGET_URL = 'https://www.voeazul.com.br/br/pt/home';
  const LOGO_HREF_NOVO = 'https://www.voeazul.com.br/br/pt/azul-cbf';

  function isTargetPage() {
    const currentUrl = window.location.origin + window.location.pathname;
    return currentUrl === TARGET_URL;
  }

  if (!isTargetPage()) {
    return;
  }

  function injetarEstilos() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '.dAtTeF:hover { outline: none !important; }';
    document.head.appendChild(style);
  }

  function substituirLogo() {
    const logoContainer = document.querySelector('div[title="Logo Azul"]');
    if (!logoContainer) {
      return false;
    }

    const logoLink = logoContainer.closest('a');
    if (logoLink && logoLink.getAttribute('href') !== LOGO_HREF_NOVO) {
      logoLink.setAttribute('href', LOGO_HREF_NOVO);
      logoLink.setAttribute('data-logo-href-modified', 'true');
      console.log('[' + SCRIPT_ID + '] Link da logo atualizado com sucesso.');
    }

    if (logoContainer.getAttribute('data-logo-modified')) {
      return true;
    }

    const svgAntigo = logoContainer.querySelector('svg');
    if (!svgAntigo) {
      return false;
    }

    const novaImg = document.createElement('img');
    novaImg.src = 'https://www.voeazul.com.br/content/dam/voe-azul/AzulCBF.svg';
    novaImg.alt = 'Logo Azul CBF';
    novaImg.width = 138;
    novaImg.height = 31;
    novaImg.style.setProperty('display', 'block', 'important');

    svgAntigo.parentNode.replaceChild(novaImg, svgAntigo);
    logoContainer.setAttribute('data-logo-modified', 'true');

    console.log('[' + SCRIPT_ID + '] Logo substituida com sucesso.');
    return true;
  }
  function init() {
    injetarEstilos();
    if (substituirLogo()) {
      return;
    }

    let isProcessing = false;
    const observer = new MutationObserver(function () {
      if (isProcessing) {
        return;
      }
      isProcessing = true;
      if (substituirLogo()) {
        observer.disconnect();
      }
      isProcessing = false;
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
