(function () {
  'use strict';

  const STYLE_ID = 'at-modal-homepage-styles';
  const OVERLAY_ID = 'atModalHomepageOverlay';

  // Remove modal anterior se ja existir (facilita testar no console)
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) {
    existing.remove();
  }

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '#' + OVERLAY_ID + ' {' +
      '  position: fixed; inset: 0; z-index: 99999;' +
      '  display: flex; align-items: center; justify-content: center;' +
      '  background: rgba(0, 0, 0, 0.75); padding: 16px;' +
      "  font-family: 'NespressoLucas', 'Helvetica Neue', Arial, sans-serif;" +
      '}' +
      '.at-modal-homepage {' +
      '  position: relative; width: 420px; max-width: 100%;' +
      '  background: #1a1a1a; border-radius: 24px; padding: 40px 28px 28px;' +
      '  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45); text-align: center;' +
      '  color: #fff;' +
      '}' +
      '.at-modal-homepage-close {' +
      '  position: absolute; top: 12px; right: 12px;' +
      '  width: 32px; height: 32px; border: none; border-radius: 50%;' +
      '  background: rgba(255,255,255,0.85); color: #1a1a1a;' +
      '  font-size: 22px; line-height: 1; cursor: pointer;' +
      '}' +
      '.at-modal-homepage-pretitle {' +
      '  margin: 0 0 8px; font-size: 12px; letter-spacing: 2px;' +
      '  text-transform: uppercase; color: #c9c9c9;' +
      '}' +
      '.at-modal-homepage-title {' +
      '  margin: 0 0 12px; font-size: 22px; font-weight: 700;' +
      '  text-transform: uppercase; line-height: 1.25;' +
      '}' +
      '.at-modal-homepage-description {' +
      '  margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #ddd;' +
      '}' +
      '.at-modal-homepage-cta {' +
      '  display: inline-flex; align-items: center; justify-content: center;' +
      '  min-width: 200px; padding: 12px 28px; border-radius: 30px;' +
      '  border: 2px solid #fff; background: #fff; color: #1a1a1a;' +
      '  text-decoration: none; text-transform: uppercase;' +
      '  font-size: 13px; font-weight: 700; letter-spacing: 1px;' +
      '}';
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.innerHTML =
    '<div class="at-modal-homepage">' +
    '  <button type="button" class="at-modal-homepage-close" aria-label="Fechar">&times;</button>' +
    '  <p class="at-modal-homepage-pretitle">OFERTA ESPECIAL</p>' +
    '  <h2 class="at-modal-homepage-title">Descubra o melhor do cafe Nespresso</h2>' +
    '  <p class="at-modal-homepage-description">Aproveite as ofertas exclusivas e leve sua experiencia de cafe para o proximo nivel.</p>' +
    '  <a class="at-modal-homepage-cta" href="https://www.nespresso.com/br/pt/order/capsules/original">CONFERIR OFERTAS</a>' +
    '</div>';

  document.body.appendChild(overlay);

  function closeModal() {
    overlay.remove();
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeModal();
    }
  });

  overlay.querySelector('.at-modal-homepage-close').addEventListener('click', closeModal);
})();
