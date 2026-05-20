(function () {
    'use strict';

    // Guard contra execucao duplicada
    if (window.modalFlashSaleVertuo) {
        return;
    }
    window.modalFlashSaleVertuo = true;

    // Tracking GA
    function sendGAEvent(label) {
        window.gtmDataObject = window.gtmDataObject || [];
        window.gtmDataObject.push({
            event: 'local_event',
            event_raised_by: 'br',
            local_event_category: 'user engagement',
            local_event_action: 'click',
            local_event_label: label
        });
    }

    // Tracking Adobe Target
    window.gtmDataObject = window.gtmDataObject || [];
    window.gtmDataObject.push({
        event: 'adobe_target',
        event_raised_by: 'adobe target',
        experiment_id: '${campaign.id}',
        experiment_type: 'XT',
        experiment_name: '${campaign.name}',
        experiment_variant_id: '${campaign.recipe.id}',
        experiment_variant: '${campaign.recipe.name}'
    });

    // Carregar fonte DM Sans
    function loadFont() {
        if (document.getElementById('flash-modal-dm-sans-font')) {
            return;
        }
        var link = document.createElement('link');
        link.id = 'flash-modal-dm-sans-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;0,800;1,400;1,700&display=swap';
        document.head.appendChild(link);
    }

    // Injetar estilos
    function injectStyles() {
        if (document.getElementById('flash-modal-vertuo-styles')) {
            return;
        }
        var style = document.createElement('style');
        style.id = 'flash-modal-vertuo-styles';
        style.textContent =
            '.flash-modal-overlay {' +
            '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;' +
            '  background: rgba(0, 0, 0, 0.6); display: flex;' +
            '  align-items: center; justify-content: center; z-index: 9999;' +
            '  font-family: "NespressoLucas", "Helvetica Neue", Arial, sans-serif;' +
            '}' +
            '.flash-modal {' +
            '  background-color: #971B2F; border-radius: 20px;' +
            '  padding: 50px 40px 40px; max-width: 500px; width: 90%;' +
            '  text-align: center; position: relative;' +
            '  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);' +
            '}' +
            '.flash-modal-close {' +
            '  position: absolute; top: 16px; right: 16px;' +
            '  background: none; border: none; cursor: pointer;' +
            '  color: #ffffff; font-size: 24px; line-height: 1;' +
            '  opacity: 0.7; transition: opacity 0.2s ease;' +
            '}' +
            '.flash-modal-close:hover { opacity: 1; }' +
            '.flash-modal-logo {' +
            '  width: 56px; height: 56px; margin: 0 auto 30px;' +
            '  display: flex; align-items: center; justify-content: center;' +
            '}' +
            '.flash-modal-logo svg { width: 56px; height: 56px; }' +
            '.flash-modal-title {' +
            '  font-size: 28px; font-weight: 700; color: #ffffff;' +
            '  margin-bottom: 16px; letter-spacing: 1px;' +
            '}' +
            '.flash-modal-subtitle {' +
            '  font-size: 18px; color: #ffffff;' +
            '  margin-bottom: 36px; line-height: 1.4;' +
            '}' +
            '.flash-modal-subtitle strong { font-weight: 700; }' +
            '.flash-modal-cards {' +
            '  display: flex; flex-direction: column; gap: 10px;' +
            '}' +
            '.flash-coupon-card {' +
            '  border-radius: 50px; padding: 24px 34px;' +
            '  display: flex; align-items: center;' +
            '  justify-content: space-between; gap: 30px;' +
            '}' +
            '.flash-coupon-card--primary { background-color: #CC9479; }' +
            '.flash-coupon-card--secondary { background-color: #CC9479; }' +
            '.flash-coupon-info { text-align: left; }' +
            '.flash-coupon-discount {' +
            '  font-size: 32px; font-weight: 800;' +
            '  color: #ffffff; line-height: 1.1;' +
            '}' +
            '.flash-coupon-description {' +
            '  font-size: 12px; color: #ffffff;' +
            '  margin-top: 4px; text-transform: uppercase; white-space: nowrap;' +
            '}' +
            '.flash-coupon-badge {' +
            '  background-color: #971B2F; color: #ffffff;' +
            '  padding: 8px 14px; border-radius: 12px 12px 0 0;' +
            '  font-size: 12px; font-weight: 700;' +
            '  letter-spacing: 0.5px; white-space: nowrap;' +
            '}' +
            '.flash-coupon-badge span { font-weight: 400; }' +
            '.flash-coupon-badge strong { font-weight: 800; }' +
            '.flash-coupon-copy-btn {' +
            '  display: inline-flex; align-items: center;' +
            '  justify-content: center; gap: 6px;' +
            '  background-color: #ffffff; color: #971B2F;' +
            '  border: 1px solid #971B2F; padding: 8px 14px;' +
            '  border-radius: 0 0 12px 12px; font-size: 12px;' +
            '  font-weight: 700; cursor: pointer;' +
            '  transition: all 0.3s ease; position: relative;' +
            '  margin-top: 0; width: 100%;' +
            '}' +
            '.flash-coupon-copy-btn:hover {' +
            '  background-color: #971B2F; border-color: #971B2F;' +
            '  color: #ffffff; transform: translateY(-2px);' +
            '  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);' +
            '}' +
            '.flash-coupon-copy-btn:active { transform: translateY(0); }' +
            '.flash-coupon-copy-btn.copied {' +
            '  background-color: #257A57; color: #ffffff; border-color: #257A57;' +
            '}' +
            '.flash-coupon-copy-icon { width: 14px; height: 14px; opacity: 0.7; }' +
            '.flash-coupon-copy-tooltip {' +
            '  position: absolute; background-color: #333; color: #fff;' +
            '  padding: 6px 10px; border-radius: 4px; font-size: 12px;' +
            '  white-space: nowrap; pointer-events: none; opacity: 0;' +
            '  transition: opacity 0.3s ease; z-index: 1000;' +
            '  top: -35px; left: 50%; transform: translateX(-50%);' +
            '}' +
            '.flash-coupon-copy-tooltip.show { opacity: 1; }' +
            '.flash-coupon-copy-tooltip::after {' +
            '  content: ""; position: absolute; top: 100%; left: 50%;' +
            '  margin-left: -5px; border-width: 5px; border-style: solid;' +
            '  border-color: #333 transparent transparent transparent;' +
            '}' +
            '.flash-coupon-action {' +
            '  display: flex; flex-direction: column; align-items: stretch; gap: 0;' +
            '}' +
            '@media (max-width: 480px) {' +
            '  .flash-modal { padding: 40px 24px 32px; border-radius: 16px; }' +
            '  .flash-modal-title { font-size: 24px; }' +
            '  .flash-modal-subtitle { font-size: 16px; margin-bottom: 28px; }' +
            '  .flash-coupon-card { flex-direction: column; align-items: center; gap: 12px; padding: 20px 22px; }' +
            '  .flash-coupon-info { text-align: center; }' +
            '  .flash-coupon-action { align-items: center; }' +
            '  .flash-coupon-discount { font-size: 26px; }' +
            '}';
        document.head.appendChild(style);
    }

    // Gerar HTML do modal
    function generateModalHTML() {
        return '<div class="flash-modal-overlay" id="flashModalOverlay">' +
            '<div class="flash-modal">' +
            '  <button class="flash-modal-close" id="flashModalClose" aria-label="Fechar modal">&times;</button>' +
            '  <div class="flash-modal-logo">' +
            '    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '      <path d="M24 0H0V24H24V0Z" fill="white"/>' +
            '      <path d="M20.4541 18.4407V18.5304C17.8929 19.4245 14.8245 18.6939 13.1523 17.0631C12.8941 16.8456 11.9822 15.8575 11.6283 15.435C10.8265 14.4935 9.75545 13.0033 8.84104 11.8374V16.5949H7.54138V7.16884C8.99683 8.35673 10.4667 10.7139 11.5665 12.1321C11.5665 12.1321 13.7027 15.0083 14.5959 16.0277C15.286 16.876 16.484 17.804 17.3197 18.1147C18.4382 18.5601 19.5736 18.6287 20.4541 18.4407Z" fill="black"/>' +
            '      <path d="M3.54674 5.4704C6.10795 4.57631 9.17632 5.30699 10.8485 6.9377C11.1068 7.1553 12.0186 8.14337 12.3725 8.56586C13.1743 9.50737 14.2454 10.9975 15.1598 12.1634V7.40507H16.4595V16.832C15.004 15.6441 13.5342 13.287 12.4343 11.8688C12.4343 11.8688 10.2973 8.99259 9.40493 7.97319C8.71488 7.12481 7.51683 6.19685 6.68115 5.88612C5.56269 5.44077 4.42729 5.37219 3.54759 5.56015V5.4704H3.54674Z" fill="black"/>' +
            '    </svg>' +
            '  </div>' +
            '  <h2 class="flash-modal-title">ANTES DE IR...</h2>' +
            '  <p class="flash-modal-subtitle">' +
            '    Ainda d\u00e1 tempo de garantir<br>' +
            '    a nossa oferta de <strong>Flash Sale</strong>' +
            '  </p>' +
            '  <div class="flash-modal-cards">' +
            '    <div class="flash-coupon-card flash-coupon-card--primary">' +
            '      <div class="flash-coupon-info">' +
            '        <div class="flash-coupon-discount">15% OFF</div>' +
            '        <div class="flash-coupon-description">Na compra de 170 caf\u00e9s</div>' +
            '      </div>' +
            '      <div class="flash-coupon-action">' +
            '        <div class="flash-coupon-badge">' +
            '          <span>CUPOM:</span> <strong>CAFEOFF15</strong>' +
            '        </div>' +
            '        <button class="flash-coupon-copy-btn" data-coupon="CAFEOFF15">' +
            '          <span>Copiar c\u00f3digo</span>' +
            '          <svg class="flash-coupon-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
            '            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
            '          </svg>' +
            '          <div class="flash-coupon-copy-tooltip">Clique para copiar</div>' +
            '        </button>' +
            '      </div>' +
            '    </div>' +
            '    <div class="flash-coupon-card flash-coupon-card--secondary">' +
            '      <div class="flash-coupon-info">' +
            '        <div class="flash-coupon-discount">10% OFF</div>' +
            '        <div class="flash-coupon-description">Na compra de 70 caf\u00e9s Vertuo</div>' +
            '      </div>' +
            '      <div class="flash-coupon-action">' +
            '        <div class="flash-coupon-badge">' +
            '          <span>CUPOM:</span> <strong>VERTUO10</strong>' +
            '        </div>' +
            '        <button class="flash-coupon-copy-btn" data-coupon="VERTUO10">' +
            '          <span>Copiar c\u00f3digo</span>' +
            '          <svg class="flash-coupon-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
            '            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
            '          </svg>' +
            '          <div class="flash-coupon-copy-tooltip">Clique para copiar</div>' +
            '        </button>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>' +
            '</div>';
    }

    // Copiar cupom para a area de transferencia
    function copyToClipboard(text, btnElement) {
        var tempInput = document.createElement('input');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            btnElement.classList.add('copied');
            var tooltip = btnElement.querySelector('.flash-coupon-copy-tooltip');
            var spanText = btnElement.querySelector('span');
            var originalText = spanText.textContent;
            spanText.textContent = 'Copiado!';
            tooltip.textContent = 'Copiado!';
            tooltip.classList.add('show');

            setTimeout(function () {
                btnElement.classList.remove('copied');
                spanText.textContent = originalText;
                tooltip.textContent = 'Clique para copiar';
                tooltip.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.log('[Flash Modal Vertuo] Erro ao copiar cupom:', err);
        }

        document.body.removeChild(tempInput);
    }

    // Adicionar eventos do modal
    function addEventListeners() {
        var overlay = document.getElementById('flashModalOverlay');
        var closeBtn = document.getElementById('flashModalClose');
        var copyBtns = document.querySelectorAll('.flash-coupon-copy-btn');

        if (!overlay || !closeBtn) {
            return;
        }

        // Fechar ao clicar no overlay
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                sendGAEvent('flash_sale_modal_fechou_overlay');
            }
        });

        // Fechar ao clicar no X
        closeBtn.addEventListener('click', function () {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            sendGAEvent('flash_sale_modal_fechou_x');
        });

        // Copiar cupom ao clicar no botao
        copyBtns.forEach(function (btn) {
            if (btn.getAttribute('data-listener-added')) {
                return;
            }
            btn.setAttribute('data-listener-added', 'true');

            btn.addEventListener('click', function () {
                var coupon = btn.getAttribute('data-coupon');
                sendGAEvent('flash_sale_copiou_cupom_' + coupon.toLowerCase());
                copyToClipboard(coupon, btn);
            });

            btn.addEventListener('mouseenter', function () {
                if (!btn.classList.contains('copied')) {
                    var tooltip = btn.querySelector('.flash-coupon-copy-tooltip');
                    tooltip.classList.add('show');
                }
            });

            btn.addEventListener('mouseleave', function () {
                if (!btn.classList.contains('copied')) {
                    var tooltip = btn.querySelector('.flash-coupon-copy-tooltip');
                    tooltip.classList.remove('show');
                }
            });
        });
    }

    // Controle de exibicao: maximo 3 vezes por dia (sessionStorage)
    var STORAGE_KEY = 'flash_modal_vertuo_views';
    var MAX_VIEWS_PER_DAY = 3;

    function getTodayKey() {
        var now = new Date();
        return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    }

    function getViewCount() {
        try {
            var data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
            var today = getTodayKey();
            return data[today] || 0;
        } catch (e) {
            return 0;
        }
    }

    function incrementViewCount() {
        try {
            var today = getTodayKey();
            var data = {};
            data[today] = getViewCount() + 1;
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // silencioso
        }
    }

    function canShowModal() {
        return getViewCount() < MAX_VIEWS_PER_DAY;
    }

    function isMobileDevice() {
        return window.innerWidth <= 767;
    }

    // Inserir modal no DOM
    function insertModal() {
        if (document.getElementById('flashModalOverlay')) {
            return;
        }

        var container = document.createElement('div');
        container.innerHTML = generateModalHTML();
        var modalElement = container.firstChild;
        document.body.appendChild(modalElement);
        document.body.style.overflow = 'hidden';

        addEventListeners();
        incrementViewCount();
        sendGAEvent('flash_sale_modal_exibido');
        console.log('[Flash Modal Vertuo] Modal inserido com sucesso');
    }

    // Inicializacao com delay baseado no dispositivo + exit intent
    function init() {
        if (!canShowModal()) {
            return;
        }

        loadFont();
        injectStyles();

        var modalTriggered = false;

        function triggerModal() {
            if (modalTriggered) return;
            if (!canShowModal()) return;
            modalTriggered = true;
            insertModal();
        }

        // Trigger por tempo
        var delay = isMobileDevice() ? 20000 : 30000;
        setTimeout(function () {
            triggerModal();
        }, delay);

        // Trigger por exit intent (desktop apenas)
        if (!isMobileDevice()) {
            document.addEventListener('mouseout', function (e) {
                if (e.clientY <= 0 && !modalTriggered) {
                    triggerModal();
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
