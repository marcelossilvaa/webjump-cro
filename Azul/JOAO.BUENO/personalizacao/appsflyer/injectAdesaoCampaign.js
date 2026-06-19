    (function() {
        'use strict';

        if (window.location.pathname.indexOf('br/pt/ofertas/adesao-clube') === -1) return;

        var INIT_ATTR = 'data-af-wj-smartbanner-fix-init';

        function adjustHeaderPosition() {
            var smartBanner = document.getElementById('smart-banner');
            var header = document.querySelector('div[elevation="9999"]');

            if (header) {
                var headerStyle = window.getComputedStyle(header);
                if (headerStyle.position !== 'fixed' && headerStyle.position !== 'sticky') {
                    header = header.parentElement;
                }
            } else {
                header = document.querySelector('header');
            }

            if (smartBanner && header) {
                // Trava dimensões do banner para evitar variação
                smartBanner.style.setProperty('height', '110px', 'important');
                smartBanner.style.setProperty('min-height', '110px', 'important');
                smartBanner.style.setProperty('max-height', '110px', 'important');
                smartBanner.style.setProperty('z-index', '10', 'important');

                // 1. Aplica o novo padding ajustado
                var bannerInner = smartBanner.firstElementChild;
                if (bannerInner) {
                    bannerInner.style.setProperty('padding', '1em 0.8em 1em 0em', 'important');
                }

                // 1.1. Padroniza font-size dos headings do banner
                var bannerHeadings = smartBanner.querySelectorAll('span[data-af-custom-fonts="af-creatives-text"][role="heading"][aria-level="2"]');
                for (var i = 0; i < bannerHeadings.length; i++) {
                    bannerHeadings[i].style.setProperty('font-size', '1em', 'important');
                }

                // 2. Garante que o "espaçador" tenha a MESMA altura do banner
                // e aplica o MESMO valor no top do header.
                var bannerHeight = Math.ceil(smartBanner.getBoundingClientRect().height);
                var bannerOffset = bannerHeight > 0 ? bannerHeight + 'px' : '0px';

                var spacerDiv = smartBanner.previousElementSibling;
                if (spacerDiv && spacerDiv.tagName === 'DIV' && !spacerDiv.id) {
                    spacerDiv.style.setProperty('height', bannerOffset, 'important');
                }

                header.style.setProperty('top', bannerOffset, 'important');
                header.style.setProperty('transition', 'top 0.3s ease-in-out', 'important');
                header.style.setProperty('z-index', '9999', 'important');
            }
        }

        function resetHeaderPosition() {
            var header = document.querySelector('div[elevation="9999"]');
            if (header) {
                var headerStyle = window.getComputedStyle(header);
                if (headerStyle.position !== 'fixed' && headerStyle.position !== 'sticky') {
                    header = header.parentElement;
                }
            }
            if (header) {
                header.style.setProperty('top', '0px', 'important');
            }

            var smartBanner = document.getElementById('smart-banner');
            if (smartBanner) {
                var spacerDiv = smartBanner.previousElementSibling;
                if (spacerDiv && spacerDiv.tagName === 'DIV' && !spacerDiv.id) {
                    spacerDiv.style.setProperty('height', '0px', 'important');
                }
            }
        }

        function initSmartBannerFix() {
            var smartBanner = document.getElementById('smart-banner');
            if (!smartBanner) return false;

            setTimeout(function() {
                adjustHeaderPosition();
            }, 100);

            if (!smartBanner.getAttribute(INIT_ATTR)) {
                smartBanner.setAttribute(INIT_ATTR, '1');
                var closeBtn = smartBanner.querySelector('[data-af-close-button="true"]');
                if (closeBtn) {
                    closeBtn.addEventListener('click', resetHeaderPosition);
                }
            }

            return true;
        }

        // Observa mudanças no DOM (ex.: aceite de cookies remontando componentes)
        // e reaplica o ajuste de forma segura (debounce).
        var scheduled = false;

        function scheduleInit() {
            if (scheduled) return;
            scheduled = true;
            setTimeout(function() {
                scheduled = false;
                initSmartBannerFix();
            }, 50);
        }

        // Tenta inicializar já; se o banner ainda não existe, o observer cuidará.
        initSmartBannerFix();

        var observer = new MutationObserver(function() {
            scheduleInit();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    })();