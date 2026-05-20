(function () {
    'use strict';

    if (window._poaParaNordesteBanner) {
        return;
    }
    window._poaParaNordesteBanner = true;

    // Tracking Adobe Analytics
    function analyticsEvent(eventLabel, eventType) {
        if (!eventLabel) {
            console.log('[Tracking POA Nordeste] Missing parameters for analytics event.');
            return;
        }

        var labelEvent = 'AT_PoaParaNordeste_' + eventType + ' ' + eventLabel;
        console.log('[Tracking POA Nordeste] Analytics event triggered:', labelEvent);

        (function () {
            var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
            if (!s || typeof s.tl !== 'function') return;

            s.linkTrackVars = 'events,eVar82,eVar84';
            s.linkTrackEvents = 'event90';
            s.events = 'event90';
            s.eVar82 = labelEvent;
            s.eVar84 = 'AT_home_banner';

            s.tl(true, 'o', 'target_activity_action');
        })();
    }

    // Configuracao do banner personalizado
    var CONFIG = {
        tag: 'Passagens',
        title: 'Troque o frio de Porto Alegre pelo calor do Nordeste',
        description: 'Encante-se com as belezas do Nordeste Brasileiro e dos + 130 destinos da Azul.',
        cta: 'Ver voos para o Nordeste',
        ctaUrl: 'https://passagens.voeazul.com.br/pt/voos-de-porto-alegre',
        imgDesktop: 'https://i.imgur.com/D0jEf3L.png',
        imgMobile: 'https://i.imgur.com/SXjkXwm.png',
        imgPreview: 'https://i.imgur.com/VaDxJp8.png',
        altText: 'Troque o frio de Porto Alegre pelo calor do Nordeste'
    };

    function isMobile() {
        return window.innerWidth <= 767;
    }

    function getTitleHtml() {
        if (isMobile()) {
            return CONFIG.title;
        }
        return 'Troque o frio de Porto Alegre<br>pelo calor do Nordeste';
    }

    // Localiza o primeiro slide do carrossel de banners
    function findBannerSlides() {
        var slides = document.querySelectorAll('[data-active]');
        if (!slides || slides.length === 0) {
            return null;
        }
        // Filtrar apenas slides que contem imagem e h2 (banners reais)
        var bannerSlides = [];
        for (var i = 0; i < slides.length; i++) {
            var slide = slides[i];
            if (slide.querySelector('h2') && slide.querySelector('img')) {
                bannerSlides.push(slide);
            }
        }
        return bannerSlides.length > 0 ? bannerSlides : null;
    }

    function applyBanner() {
        var bannerSlides = findBannerSlides();
        if (!bannerSlides) {
            return false;
        }

        // Pegar o primeiro slide
        var firstSlide = bannerSlides[0];
        if (firstSlide.getAttribute('data-poa-nordeste-applied')) {
            return true;
        }

        // Atualizar imagem
        var img = firstSlide.querySelector('img');
        if (img) {
            var newSrc = isMobile() ? CONFIG.imgMobile : CONFIG.imgDesktop;
            img.setAttribute('src', newSrc);
            img.setAttribute('alt', CONFIG.altText);
        }

        // Atualizar tag/label
        var tagSpans = firstSlide.querySelectorAll('span');
        for (var t = 0; t < tagSpans.length; t++) {
            var span = tagSpans[t];
            // Encontrar o span que contem o texto da tag (esta dentro de divs aninhadas, acima do h2)
            var parentH2 = span.closest('[class]');
            if (parentH2 && !span.querySelector('*') && span.textContent.trim().length > 0 && span.textContent.trim().length < 50) {
                var h2Sibling = firstSlide.querySelector('h2');
                if (h2Sibling) {
                    // Verificar se o span esta antes do h2 na arvore DOM
                    var spanRect = span.getBoundingClientRect();
                    var h2Rect = h2Sibling.getBoundingClientRect();
                    if (spanRect.top <= h2Rect.top || span.closest('[class*="gHpGKH"]')) {
                        span.textContent = CONFIG.tag;
                        break;
                    }
                }
            }
        }

        // Atualizar titulo
        var h2 = firstSlide.querySelector('h2');
        if (h2) {
            h2.innerHTML = getTitleHtml();
        }

        // Atualizar descricao
        var p = firstSlide.querySelector('p');
        if (p) {
            p.textContent = CONFIG.description;
        }

        // Atualizar CTA
        var ctaLink = firstSlide.querySelector('a[type="button"]');
        if (ctaLink) {
            ctaLink.textContent = CONFIG.cta;
            ctaLink.setAttribute('href', CONFIG.ctaUrl);

            // Tracking no click do CTA
            if (!ctaLink.getAttribute('data-poa-track-added')) {
                ctaLink.setAttribute('data-poa-track-added', 'true');
                ctaLink.addEventListener('click', function () {
                    analyticsEvent('cta_banner', 'click');
                });
            }
        }

        // Garantir que o primeiro slide esteja ativo
        firstSlide.setAttribute('data-active', 'true');
        firstSlide.setAttribute('data-poa-nordeste-applied', 'true');

        // Marcar tambem a versao mini-banner (mesmo conteudo aparece duplicado no DOM)
        // Buscar novamente para pegar possiveis duplicatas
        var allSlides = findBannerSlides();
        if (allSlides) {
            for (var s = 0; s < allSlides.length; s++) {
                var slide = allSlides[s];
                if (slide === firstSlide) continue;
                if (slide.getAttribute('data-poa-nordeste-applied')) continue;

                var slideImg = slide.querySelector('img');
                if (!slideImg) continue;

                // Identificar se e o mesmo banner pelo alt original ou posicao correspondente
                var slideH2 = slide.querySelector('h2');
                if (slideH2 && slideH2.textContent === CONFIG.title) {
                    // Ja foi atualizado por outro mecanismo
                    slide.setAttribute('data-poa-nordeste-applied', 'true');
                    continue;
                }

                // Verificar se e o primeiro de outro container (mini-banner)
                var parentContainer = slide.parentElement;
                if (parentContainer) {
                    var siblings = parentContainer.querySelectorAll('[data-active]');
                    var isFirstInContainer = siblings[0] === slide;
                    if (isFirstInContainer && !slide.getAttribute('data-poa-nordeste-applied')) {
                        // Aplicar mesma alteracao no mini-banner
                        var miniImg = slide.querySelector('img');
                        if (miniImg) {
                            miniImg.setAttribute('src', isMobile() ? CONFIG.imgMobile : CONFIG.imgDesktop);
                            miniImg.setAttribute('alt', CONFIG.altText);
                        }

                        var miniTag = null;
                        var miniSpans = slide.querySelectorAll('span');
                        for (var ms = 0; ms < miniSpans.length; ms++) {
                            if (!miniSpans[ms].querySelector('*') && miniSpans[ms].textContent.trim().length > 0 && miniSpans[ms].textContent.trim().length < 50) {
                                miniTag = miniSpans[ms];
                                break;
                            }
                        }
                        if (miniTag) {
                            miniTag.textContent = CONFIG.tag;
                        }

                        var miniH2 = slide.querySelector('h2');
                        if (miniH2) {
                            miniH2.innerHTML = getTitleHtml();
                        }

                        var miniP = slide.querySelector('p');
                        if (miniP) {
                            miniP.textContent = CONFIG.description;
                        }

                        var miniCta = slide.querySelector('a[type="button"]');
                        if (miniCta) {
                            miniCta.textContent = CONFIG.cta;
                            miniCta.setAttribute('href', CONFIG.ctaUrl);
                            if (!miniCta.getAttribute('data-poa-track-added')) {
                                miniCta.setAttribute('data-poa-track-added', 'true');
                                miniCta.addEventListener('click', function () {
                                    analyticsEvent('cta_banner_mini', 'click');
                                });
                            }
                        }

                        slide.setAttribute('data-poa-nordeste-applied', 'true');
                    }
                }
            }
        }

        // Atualizar miniatura/preview do carrossel
        applyPreviewThumbnail();

        console.log('[POA Nordeste] Banner personalizado aplicado com sucesso');
        return true;
    }

    // Atualiza a miniatura/preview do primeiro banner no carrossel
    function applyPreviewThumbnail() {
        var previewButtons = document.querySelectorAll('button img[src*="preview"]');
        if (!previewButtons || previewButtons.length === 0) {
            // Tentar buscar pelo container de miniaturas
            previewButtons = document.querySelectorAll('button img[src*="bnr-rotas"]');
        }

        // Buscar o primeiro botao de preview dentro do container de miniaturas
        var previewContainers = document.querySelectorAll('[class*="sc-c20cd3f8"]');
        for (var i = 0; i < previewContainers.length; i++) {
            var container = previewContainers[i];
            var btn = container.querySelector('button');
            if (!btn) continue;

            var previewImg = btn.querySelector('img');
            if (!previewImg) continue;
            if (btn.getAttribute('data-poa-preview-applied')) continue;

            // Verificar se e o primeiro botao (primeiro slide)
            var parentDiv = container.parentElement;
            if (parentDiv) {
                var allSiblings = parentDiv.querySelectorAll('[class*="sc-c20cd3f8-0"]');
                if (allSiblings.length > 0 && allSiblings[0] !== container) continue;
            }

            previewImg.setAttribute('src', CONFIG.imgPreview);
            previewImg.setAttribute('alt', CONFIG.altText);

            // Atualizar texto da tag na miniatura
            var previewTag = btn.querySelector('span');
            if (previewTag) {
                previewTag.textContent = CONFIG.tag;
            }

            // Atualizar texto do titulo na miniatura
            var previewTitle = btn.querySelector('[class*="sc-c20cd3f8-5"]');
            if (previewTitle) {
                previewTitle.textContent = CONFIG.altText;
            }

            btn.setAttribute('data-poa-preview-applied', 'true');
            console.log('[POA Nordeste] Miniatura/preview atualizada');
            break;
        }
    }

    // Inicializacao com polling limitado
    var attempts = 0;
    var maxAttempts = 20;

    function tryApply() {
        attempts++;
        if (applyBanner()) {
            return;
        }
        if (attempts < maxAttempts) {
            setTimeout(tryApply, 500);
        } else {
            console.warn('[POA Nordeste] Nao foi possivel localizar o banner apos timeout');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryApply);
    } else {
        tryApply();
    }
})();
