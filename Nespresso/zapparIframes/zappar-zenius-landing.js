(function () {
  'use strict';

  const currentUrl = window.location.href.toLowerCase();
  if (!currentUrl.includes('maquina-de-cafe-profissional-zenius')) return;

  const IFRAME_URL = 'https://nest-mv.zap.works/?key=nespresso/zenius_b2b';

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: 'local_event',
      event_raised_by: 'br',
      local_event_category: 'user engagement',
      local_event_action: 'click',
      local_event_label: label,
    });
  }

  gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: 'adobe_target',
    event_raised_by: 'adobe target',
    experiment_id: '${campaign.id}',
    experiment_type: 'AB',
    experiment_name: '${campaign.name}',
    experiment_variant_id: '${campaign.recipe.id}',
    experiment_variant: '${campaign.recipe.name}',
  });

  const ICON_360_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.56 7.44C15.8 3.61 14.06 1 12 1 9.94 1 8.21 3.61 7.44 7.44 3.6 8.22 1 9.94 1 12c0 2.06 2.61 3.78 6.44 4.56C8.2 20.39 9.94 23 12 23c2.06 0 3.79-2.61 4.56-6.44C20.4 15.78 23 14.06 23 12c0-2.06-2.61-3.78-6.44-4.56ZM12 22c-1.36 0-2.78-2-3.5-5.26a23.98 23.98 0 0 0 7.02 0C14.77 20 13.35 22 11.99 22Zm3.7-6.3a23.64 23.64 0 0 1-6.7.1c-.9-.1-1.74-.27-2.5-.48C3.69 14.55 2 13.25 2 12c0-1.36 2-2.78 5.25-3.5C7.1 9.6 7 10.76 7 12v.3l-2-2v1.4l2.5 2.51 2.5-2.5V10.3l-2 1.99V12c0-.88.05-1.71.13-2.5.12-1.1.3-2.1.55-3C9.45 3.7 10.75 2 12 2c1.36 0 2.78 2 3.5 5.26C14.42 7.09 13.24 7 12 7l-.3.01 2-2H12.3l-2.5 2.5 2.5 2.5h1.42l-2-2H12c1.35 0 2.58.1 3.7.29a22.91 22.91 0 0 1 0 7.4Zm1.05-.2a23.94 23.94 0 0 0 0-7C20 9.21 22 10.63 22 12c0 1.36-2 2.78-5.25 3.5Z"></path></svg>';

  const STYLES =
    '.cta-3d-zenius {' +
    '  display: inline-flex !important;' +
    '  align-items: center !important;' +
    '  justify-content: center !important;' +
    '  gap: 8px !important;' +
    '  min-height: 3rem !important;' +
    '  height: min-content !important;' +
    '  padding: .75rem 1.5rem !important;' +
    '  border: solid 1px #17171a !important;' +
    '  border-radius: 62.4375rem !important;' +
    '  margin: auto 0 !important;' +
    '  color: #fff !important;' +
    '  background: #17171a !important;' +
    '  white-space: normal !important;' +
    '  overflow: hidden !important;' +
    '  text-decoration: none !important;' +
    '  position: relative !important;' +
    '  vertical-align: top !important;' +
    '  font-family: inherit !important;' +
    '  font-size: 16px !important;' +
    '  font-weight: 500 !important;' +
    '  letter-spacing: 0.5px !important;' +
    '  cursor: pointer !important;' +
    '  line-height: normal !important;' +
    '  text-transform: none !important;' +
    '  box-sizing: border-box !important;' +
    '  outline: none !important;' +
    '  -webkit-appearance: none !important;' +
    '  appearance: none !important;' +
    '  transition: .3s ease-in-out !important;' +
    '  transition-property: background-color, color, border, box-shadow, text-shadow !important;' +
    '}' +
    '.cta-3d-zenius:hover {' +
    '  color: #17171a !important;' +
    '  background: #fff !important;' +
    '  border-color: #17171a !important;' +
    '}' +
    '.cta-3d-zenius:hover svg {' +
    '  fill: #17171a !important;' +
    '}' +
    '.cta-3d-zenius svg {' +
    '  width: 20px !important;' +
    '  height: 20px !important;' +
    '  fill: currentColor !important;' +
    '  transition: fill .3s ease-in-out !important;' +
    '}' +
    '.modal-overlay {' +
    '  display: none;' +
    '  position: fixed;' +
    '  top: 0;' +
    '  left: 0;' +
    '  width: 100%;' +
    '  height: 100%;' +
    '  background-color: rgba(0, 0, 0, 0.8);' +
    '  z-index: 9999;' +
    '  opacity: 0;' +
    '  transition: opacity 0.3s ease;' +
    '}' +
    '.modal-overlay.active {' +
    '  display: flex;' +
    '  justify-content: center;' +
    '  align-items: center;' +
    '}' +
    '.modal-overlay.show {' +
    '  opacity: 1;' +
    '}' +
    '.modal-container {' +
    '  position: relative;' +
    '  width: 90%;' +
    '  height: 90%;' +
    '  max-width: 1200px;' +
    '  max-height: 800px;' +
    '  background-color: #fff;' +
    '  border-radius: 8px;' +
    '  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);' +
    '  transform: scale(0.9);' +
    '  transition: transform 0.3s ease;' +
    '}' +
    '.modal-overlay.show .modal-container {' +
    '  transform: scale(1);' +
    '}' +
    '.modal-close {' +
    '  position: absolute;' +
    '  top: -40px;' +
    '  right: 0;' +
    '  width: 32px;' +
    '  height: 32px;' +
    '  background-color: #fff;' +
    '  border: none;' +
    '  border-radius: 50%;' +
    '  cursor: pointer;' +
    '  display: flex;' +
    '  justify-content: center;' +
    '  align-items: center;' +
    '  transition: transform 0.2s ease, background-color 0.2s ease;' +
    '  z-index: 10;' +
    '}' +
    '.modal-close:hover {' +
    '  transform: scale(1.1);' +
    '  background-color: #f0f0f0;' +
    '}' +
    '.modal-close:before,' +
    '.modal-close:after {' +
    "  content: '';" +
    '  position: absolute;' +
    '  width: 16px;' +
    '  height: 2px;' +
    '  background-color: #333;' +
    '  transition: background-color 0.2s ease;' +
    '}' +
    '.modal-close:before {' +
    '  transform: rotate(45deg);' +
    '}' +
    '.modal-close:after {' +
    '  transform: rotate(-45deg);' +
    '}' +
    '.modal-iframe {' +
    '  width: 100%;' +
    '  height: 100%;' +
    '  border: none;' +
    '  border-radius: 8px;' +
    '  transform-origin: 0 0;' +
    '  overflow: hidden;' +
    '  -webkit-overflow-scrolling: touch;' +
    '}' +
    '.modal-loading {' +
    '  position: absolute;' +
    '  top: 50%;' +
    '  left: 50%;' +
    '  transform: translate(-50%, -50%);' +
    '  font-family: Arial, sans-serif;' +
    '  color: #666;' +
    '  font-size: 16px;' +
    '}' +
    '@media (max-width: 768px) {' +
    '  .modal-container {' +
    '    width: 90%;' +
    '    height: 90%;' +
    '    max-width: 100%;' +
    '    max-height: 100%;' +
    '    border-radius: 0;' +
    '  }' +
    '  .modal-close {' +
    '    top: -38px;' +
    '    right: 0px;' +
    '    background-color: rgba(255, 255, 255, 0.9);' +
    '  }' +
    '  .modal-iframe {' +
    '    border-radius: 0;' +
    '  }' +
    '  .cta-3d-zenius {' +
    '    font-size: 22px !important;' +
    '    margin-top: 10px !important;' +
    '  }' +
    '}';

  class ZeniusLandingModal {
    constructor() {
      this.modal = null;
      this.iframe = null;
      this.isOpen = false;
      this.init();
    }

    init() {
      this.injectStyles();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    injectStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = STYLES;
      document.head.appendChild(styleElement);
    }

    setup() {
      const target = this.findZeniusPanel();
      if (!target) {
        setTimeout(() => this.setup(), 1000);
        return;
      }
      this.createButton(target.panel, target.ctas);
      this.createModal();
    }

    findZeniusPanel() {
      const panels = document.querySelectorAll('.panel');
      for (const panel of panels) {
        const title = panel.querySelector('.title');
        if (title && title.textContent.trim().toLowerCase().includes('zenius')) {
          const ctas = panel.querySelector('.ctas');
          if (ctas) return { panel, ctas };
        }
      }
      return null;
    }

    createButton(panel, ctasEl) {
      const btn = document.createElement('button');
      btn.className = 'cta-3d-zenius';
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', 'Veja em 3D');
      btn.innerHTML = '<span>Veja em 3D</span>' + ICON_360_SVG;

      btn.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          sendGAEvent('new_3d_modal_clicked');
          this.openModal();
        },
        { capture: true, passive: false },
      );

      btn.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sendGAEvent('new_3d_modal_keyboard_activated');
            this.openModal();
          }
        },
        { capture: true, passive: false },
      );

      panel.insertBefore(btn, ctasEl);
    }

    createModal() {
      this.modal = document.createElement('div');
      this.modal.id = 'nespresso-modal';
      this.modal.className = 'modal-overlay';

      const container = document.createElement('div');
      container.className = 'modal-container';

      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      closeButton.setAttribute('aria-label', 'Fechar modal');

      const loading = document.createElement('div');
      loading.className = 'modal-loading';
      loading.textContent = 'Carregando...';

      this.iframe = document.createElement('iframe');
      this.iframe.id = 'nespresso-iframe';
      this.iframe.className = 'modal-iframe';
      this.iframe.src = IFRAME_URL;
      this.iframe.setAttribute('allowfullscreen', 'true');
      this.iframe.setAttribute('scrolling', 'no');
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.style.display = 'none';

      container.appendChild(closeButton);
      container.appendChild(loading);
      container.appendChild(this.iframe);
      this.modal.appendChild(container);
      document.body.appendChild(this.modal);

      closeButton.addEventListener('click', () => this.closeModal());
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });

      this.iframe.addEventListener('load', () => {
        loading.style.display = 'none';
        this.iframe.style.display = 'block';
        this.preventIframeZoom();
        setTimeout(() => this.preventIframeZoom(), 500);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.closeModal();
      });
    }

    preventIframeZoom() {
      try {
        const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        const viewport = iframeDoc.querySelector('meta[name="viewport"]');
        if (!viewport) {
          const meta = iframeDoc.createElement('meta');
          meta.name = 'viewport';
          meta.content =
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          iframeDoc.head.appendChild(meta);
        }
        const style = iframeDoc.createElement('style');
        style.textContent =
          '* { -webkit-text-size-adjust: 100% !important; -moz-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; text-size-adjust: 100% !important; }' +
          'html, body { overflow-x: hidden !important; max-width: 100% !important; }';
        iframeDoc.head.appendChild(style);
        if (iframeDoc.body) {
          iframeDoc.body.style.zoom = '1';
          iframeDoc.body.style.transform = 'scale(1)';
          iframeDoc.body.style.transformOrigin = '0 0';
        }
      } catch (e) {
        this.applyAlternativeZoomControl();
      }
    }

    applyAlternativeZoomControl() {
      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
      const currentSrc = this.iframe.src;
      if (!currentSrc.includes('viewport=')) {
        const separator = currentSrc.includes('?') ? '&' : '?';
        this.iframe.src = currentSrc + separator + 'viewport=width=device-width,initial-scale=1.0';
      }
      this.detectAndFixZoom();
    }

    detectAndFixZoom() {
      setTimeout(() => {
        const container = this.iframe.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        if (
          this.iframe.scrollWidth > containerWidth ||
          this.iframe.scrollHeight > containerHeight
        ) {
          const scaleX = containerWidth / this.iframe.scrollWidth;
          const scaleY = containerHeight / this.iframe.scrollHeight;
          const scale = Math.min(scaleX, scaleY);
          if (scale < 1) {
            this.iframe.style.transform = 'scale(' + scale + ')';
            this.iframe.style.width = 100 / scale + '%';
            this.iframe.style.height = 100 / scale + '%';
          }
        }
      }, 1000);
    }

    openModal() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      sendGAEvent('new_3d_modal_opened');
      void this.modal.offsetWidth;
      this.modal.classList.add('show');
      setTimeout(() => {
        this.iframe.style.width = '99.9%';
        setTimeout(() => {
          this.iframe.style.width = '100%';
        }, 50);
      }, 350);
    }

    closeModal() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.modal.classList.remove('show');
      sendGAEvent('new_3d_modal_closed');
      setTimeout(() => {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  new ZeniusLandingModal();
})();
