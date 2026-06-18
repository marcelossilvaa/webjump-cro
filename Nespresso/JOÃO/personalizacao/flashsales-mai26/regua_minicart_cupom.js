(function () {
    'use strict';

    if (window.campaignProgressBarCupomFlash) {
        return;
    }
    window.campaignProgressBarCupomFlash = true;

    var gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
        event: 'adobe_target',
        event_raised_by: 'adobe target',
        experiment_id: '${campaign.id}',
        experiment_type: 'AB',
        experiment_name: '${campaign.name}',
        experiment_variant_id: '${campaign.recipe.id}',
        experiment_variant: '${campaign.recipe.name}'
    });

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

    // Campanha Vertuo Exclusive: niveis para capsulas Vertuo
    var couponTiersVL = [
        {
            threshold: 70,
            couponCode: 'VERTUO10',
            discount: '10% OFF',
            description: 'na sua compra'
        },
        {
            threshold: 170,
            couponCode: 'CAFEOFF15',
            discount: '15% OFF',
            description: 'na sua compra'
        }
    ];

    // Campanha Aberto: niveis para capsulas Original (ou misto)
    var couponTiersOL = [
        {
            threshold: 120,
            couponCode: 'CAFEOFF10',
            discount: '10% OFF',
            description: 'na sua compra'
        },
        {
            threshold: 170,
            couponCode: 'CAFEOFF15',
            discount: '15% OFF',
            description: 'na sua compra'
        }
    ];

    var previousCapsuleCount = 0;

    function storeCapsuleCount(count) {
        localStorage.setItem('nespresso-cupom-capsule-count', count.toString());
    }

    function getStoredCapsuleCount() {
        var stored = localStorage.getItem('nespresso-cupom-capsule-count');
        return stored ? parseInt(stored, 10) : 0;
    }

    function isMobileDevice() {
        return window.innerWidth <= 767;
    }

    function copyCouponToClipboard(code, buttonEl) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(function () {
                showCopiedFeedback(buttonEl);
            });
        } else {
            var textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopiedFeedback(buttonEl);
        }
        sendGAEvent('cupom_copiado_' + code);
    }

    function showCopiedFeedback(buttonEl) {
        buttonEl.setAttribute('data-copied', 'true');
        var originalHTML = buttonEl.innerHTML;
        buttonEl.innerHTML = 'Copiado!';
        buttonEl.style.backgroundColor = '#257A57';
        buttonEl.style.color = '#fff';
        buttonEl.style.borderColor = '#257A57';
        setTimeout(function () {
            buttonEl.innerHTML = originalHTML;
            buttonEl.style.backgroundColor = '';
            buttonEl.style.color = '';
            buttonEl.style.borderColor = '';
            buttonEl.removeAttribute('data-copied');
        }, 2000);
    }

    function addAnimationStyles() {
        if (document.getElementById('nespresso-cupom-regua-styles')) return;

        var styleEl = document.createElement('style');
        styleEl.id = 'nespresso-cupom-regua-styles';
        styleEl.textContent =
            '.MiniBasketDropdown__wrapper .BenefitMessage,' +
            '.MiniBasketDropdown__wrapper #minicart-freight-component,' +
            '#MiniBasketPush { display: none !important; }' +

            '@keyframes nCupomFadeIn {' +
            '  0% { opacity: 0; transform: scale(0.95); }' +
            '  100% { opacity: 1; transform: scale(1); }' +
            '}' +

            '.nespresso-cupom-enter {' +
            '  animation: nCupomFadeIn 0.4s ease-out forwards;' +
            '}' +

            '.nespresso-cupom-tier-achieved {' +
            '  background-color: #971B2F !important;' +
            '  border-color: #971B2F  !important;' +
            '  color: #fff !important;' +
            '}' +

            '.nespresso-cupom-tier-pending {' +
            '  background-color: #f5f5f5;' +
            '  border: 2px dashed #ccc;' +
            '  color: #999;' +
            '}' +

            '.nespresso-cupom-code-btn {' +
            '  background-color: #fff;' +
            '  color: #971B2F;' +
            '  border: 1.5px solid #971B2F;' +
            '  border-radius: 6px;' +
            '  padding: 4px 10px;' +
            '  font-weight: 700;' +
            '  font-size: 13px;' +
            '  cursor: pointer;' +
            '  transition: all 0.2s ease;' +
            '  font-family: NespressoLucas, sans-serif;' +
            '}' +

            '.nespresso-cupom-code-btn:hover {' +
            '  background-color: #971B2F;' +
            '  color: #fff;' +
            '  transform: translateY(-1px);' +
            '  box-shadow: 0 2px 6px rgba(0,0,0,0.15);' +
            '}' +

            '.nespresso-cupom-code-btn .flash-coupon-copy-icon {' +
            '  width: 14px;' +
            '  height: 14px;' +
            '  vertical-align: middle;' +
            '  margin-left: 4px;' +
            '}';

        document.head.appendChild(styleEl);
    }

    function createOffersComponent() {
        var existingComponent = document.getElementById('nespresso-cupom-regua');
        if (existingComponent) {
            existingComponent.remove();
        }

        var container = document.createElement('div');
        container.id = 'nespresso-cupom-regua';
        container.style.cssText =
            'padding: 8px 12px; border-radius: 8px; border-bottom: 1px solid #efefef;' +
            ' font-family: NespressoLucas, sans-serif; opacity: 0;';
        container.classList.add('nespresso-cupom-enter');
        container.innerHTML =
            '<div style="text-align: center; padding: 8px; font-size: 12px; color: #999;">Carregando...</div>';

        var targetElement = document.querySelector('.MiniBasketDropdown__header');

        if (targetElement) {
            targetElement.insertAdjacentElement('afterend', container);
            sendGAEvent('ativou_regua_cupom_flash');
            setTimeout(function () {
                container.style.opacity = '1';
            }, 50);
        } else {
            console.warn('[Regua Cupom] Elemento alvo nao encontrado');
        }

        return container;
    }

    function isCapsule(product) {
        return product && product.type === 'capsule';
    }

    function getTechnology(product) {
        if (!product || !product.technologies || !Array.isArray(product.technologies)) {
            return null;
        }
        var techString = product.technologies[0] || '';
        if (techString.toLowerCase().indexOf('original') !== -1) {
            return 'OL';
        } else if (techString.toLowerCase().indexOf('vertuo') !== -1) {
            return 'VL';
        }
        return null;
    }

    // Regra: so Vertuo no carrinho = tiers Vertuo Exclusive
    // Original ou misto (OL + VL) = tiers Aberto
    function determineCouponTiers(hasOL, hasVL) {
        if (hasVL && !hasOL) {
            return couponTiersVL;
        }
        return couponTiersOL;
    }

    function getTierInfo(totalCapsules, activeTiers) {
        if (totalCapsules === 0) {
            return {
                currentTier: null,
                nextTier: activeTiers[0],
                progress: 0,
                capsulesToNextTier: activeTiers[0].threshold
            };
        }

        var currentTierIndex = -1;
        for (var i = activeTiers.length - 1; i >= 0; i--) {
            if (totalCapsules >= activeTiers[i].threshold) {
                currentTierIndex = i;
                break;
            }
        }

        if (currentTierIndex >= 0) {
            if (currentTierIndex < activeTiers.length - 1) {
                var nextTier = activeTiers[currentTierIndex + 1];
                return {
                    currentTier: activeTiers[currentTierIndex],
                    nextTier: nextTier,
                    progress: (totalCapsules / nextTier.threshold) * 100,
                    capsulesToNextTier: nextTier.threshold - totalCapsules
                };
            }
            return {
                currentTier: activeTiers[currentTierIndex],
                nextTier: null,
                progress: 100,
                capsulesToNextTier: 0
            };
        }

        return {
            currentTier: null,
            nextTier: activeTiers[0],
            progress: (totalCapsules / activeTiers[0].threshold) * 100,
            capsulesToNextTier: activeTiers[0].threshold - totalCapsules
        };
    }

    function renderOffersComponent(container, totalCapsules, activeTiers) {
        if (totalCapsules === 0) {
            container.style.display = 'none';
            previousCapsuleCount = 0;
            storeCapsuleCount(0);
            return;
        }

        container.style.display = 'block';
        var tierInfo = getTierInfo(totalCapsules, activeTiers);
        previousCapsuleCount = totalCapsules;
        storeCapsuleCount(totalCapsules);

        var isMobile = isMobileDevice();
        var html = '';

        if (isMobile) {
            html = renderMobileLayout(tierInfo, activeTiers);
        } else {
            html = renderDesktopLayout(tierInfo, totalCapsules, activeTiers);
        }

        container.innerHTML = html;
        container.style.opacity = '1';

        // Adicionar listeners nos botoes de copiar
        var couponButtons = container.querySelectorAll('[data-coupon-code]');
        couponButtons.forEach(function (btn) {
            if (btn.getAttribute('data-cupom-listener')) return;
            btn.setAttribute('data-cupom-listener', 'true');
            btn.addEventListener('click', function () {
                var code = this.getAttribute('data-coupon-code');
                copyCouponToClipboard(code, this);
            });
        });
    }

    function renderMobileLayout(tierInfo, activeTiers) {
        var html = '';
        var copyIcon = '<svg class="flash-coupon-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
            '</svg>';

        if (tierInfo.nextTier) {
            // Mensagem de incentivo
            html =
                '<div style="text-align: center; padding: 4px 8px 6px;">' +
                '<p style="font-size: 12px; color: #161616; margin: 0 0 4px 0; font-weight: 600;">' +
                'Adicione mais <span style="background-color: #971B2F; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 700;">' +
                tierInfo.capsulesToNextTier + ' c\u00e1psulas</span>' +
                ' e ganhe cupom de <span style="color: #971B2F; font-weight: 700;">' + tierInfo.nextTier.discount + '</span>' +
                '</p>' +
                '</div>';

            // Mostrar os dois cupons juntos no mobile
            html += '<div style="display: flex; justify-content: center; gap: 8px; padding: 6px 8px; flex-wrap: wrap;">';
            for (var i = 0; i < activeTiers.length; i++) {
                var tier = activeTiers[i];
                var achieved = tierInfo.currentTier && tierInfo.currentTier.threshold >= tier.threshold;
                html +=
                    '<div style="text-align: center; flex: 1; min-width: 100px;">' +
                    '<div style="padding: 6px 10px; border-radius: 6px; margin: 0 auto 4px;' +
                    (achieved
                        ? ' background-color: #971B2F; border: 2px solid #971B2F;'
                        : ' background-color: #f5f5f5; border: 2px dashed #ccc;') +
                    '">' +
                    '<span style="font-size: 10px; font-weight: 700; color: ' +
                    (achieved ? '#fff' : '#999') + ';">' +
                    tier.discount +
                    '</span>' +
                    '</div>' +
                    '<p style="font-size: 9px; color: #666; margin: 0 0 2px 0;">' +
                    tier.threshold + ' c\u00e1psulas' +
                    '</p>' +
                    (achieved
                        ? '<button class="nespresso-cupom-code-btn" data-coupon-code="' + tier.couponCode + '" style="font-size: 10px; padding: 3px 6px;">' +
                        tier.couponCode + copyIcon +
                        '</button>'
                        : '<span style="font-size: 9px; color: #ccc;">bloqueado</span>') +
                    '</div>';
            }
            html += '</div>';
        } else {
            // Nivel maximo alcancado
            html =
                '<div style="text-align: center; padding: 8px;">' +
                '<p style="font-size: 13px; color: #161616; margin: 0 0 6px 0; font-weight: 700;">' +
                'Parab\u00e9ns! Voc\u00ea desbloqueou o cupom m\u00e1ximo! <span style="color: #971B2F;">' + tierInfo.currentTier.discount + '</span>' +
                '</p>' +
                '<button class="nespresso-cupom-code-btn" style="font-size: 15px; padding: 6px 16px;"' +
                ' data-coupon-code="' + tierInfo.currentTier.couponCode + '">' +
                tierInfo.currentTier.couponCode + copyIcon +
                '</button>' +
                '<p style="font-size: 10px; color: #999; margin: 6px 0 0 0;">Clique para copiar</p>' +
                '</div>';
        }

        return html;
    }

    function renderDesktopLayout(tierInfo, totalCapsules, activeTiers) {
        var html = '';
        var copyIcon = '<svg class="flash-coupon-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
            '</svg>';

        // Mensagem de incentivo acima dos cupons
        if (tierInfo.nextTier) {
            html +=
                '<div style="text-align: center; padding: 4px 8px 8px; background-color: #faf9f8; border-radius: 4px; margin-bottom: 8px;">' +
                '<p style="font-size: 12px; color: #161616; margin: 0;">' +
                '<strong>Adicione mais <span style="background-color: #971B2F; color: #fff; padding: 1px 5px; border-radius: 3px;">' +
                tierInfo.capsulesToNextTier + ' c\u00e1psulas</span></strong>' +
                ' e ganhe <span style="color: #971B2F; font-weight: 700;">' + tierInfo.nextTier.discount + ' ' + tierInfo.nextTier.description + '</span>' +
                '</p>' +
                '</div>';
        } else {
            // Nivel maximo - exibir somente o cupom maximo (mesmo layout do mobile)
            html +=
                '<div style="text-align: center; padding: 8px;">' +
                '<p style="font-size: 13px; color: #161616; margin: 0 0 6px 0; font-weight: 700;">' +
                'Parab\u00e9ns! Voc\u00ea desbloqueou o cupom m\u00e1ximo! <span style="color: #971B2F;">' + tierInfo.currentTier.discount + '</span>' +
                '</p>' +
                '<button class="nespresso-cupom-code-btn" style="font-size: 15px; padding: 6px 16px;"' +
                ' data-coupon-code="' + tierInfo.currentTier.couponCode + '">' +
                tierInfo.currentTier.couponCode + copyIcon +
                '</button>' +
                '<p style="font-size: 10px; color: #999; margin: 6px 0 0 0;">Clique para copiar</p>' +
                '</div>';
            return html;
        }

        // Indicadores dos niveis em retangulo
        html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 0 4px;">';

        for (var i = 0; i < activeTiers.length; i++) {
            var tier = activeTiers[i];
            var achieved = totalCapsules >= tier.threshold;

            html +=
                '<div style="text-align: center; flex: 1;">' +
                '<div style="padding: 8px 12px; border-radius: 6px; margin: 0 auto 4px;' +
                ' display: flex; align-items: center; justify-content: center; max-width: 80px;' +
                (achieved
                    ? ' background-color: #971B2F; border: 2px solid #971B2F;'
                    : ' background-color: #f5f5f5; border: 2px dashed #ccc;') +
                '">' +
                '<span style="font-size: 10px; font-weight: 700; color: ' +
                (achieved ? '#fff' : '#999') + '; text-align: center; line-height: 1.2;">' +
                tier.discount +
                '</span>' +
                '</div>' +
                '<p style="font-size: 10px; color: #666; margin: 0 0 2px 0;">' +
                tier.threshold + ' c\u00e1psulas' +
                '</p>' +
                (achieved
                    ? '<button class="nespresso-cupom-code-btn" data-coupon-code="' + tier.couponCode + '" style="font-size: 11px; padding: 3px 8px;">' +
                    tier.couponCode + copyIcon +
                    '</button>'
                    : '<span style="font-size: 10px; color: #ccc;">bloqueado</span>') +
                '</div>';
        }

        html += '</div>';

        return html;
    }

    function countCapsules(cartItems, container) {
        var capsuleCount = 0;
        var hasOL = false;
        var hasVL = false;
        var processed = 0;
        var total = cartItems.length;

        if (total === 0) {
            renderOffersComponent(container, 0, couponTiersOL);
            return;
        }

        cartItems.forEach(function (item) {
            if (item.nonRemovable !== false) {
                processed++;
                if (processed === total) {
                    var activeTiers = determineCouponTiers(hasOL, hasVL);
                    renderOffersComponent(container, capsuleCount, activeTiers);
                }
                return;
            }

            window.napi.catalog().getProduct(item.productId).then(function (product) {
                if (isCapsule(product)) {
                    var technology = getTechnology(product);
                    if (technology === 'OL') {
                        hasOL = true;
                    } else if (technology === 'VL') {
                        hasVL = true;
                    }

                    if (product.bundled) {
                        capsuleCount += product.unitQuantity * item.quantity;
                    } else {
                        capsuleCount += item.quantity;
                    }
                }
                processed++;
                if (processed === total) {
                    var activeTiers = determineCouponTiers(hasOL, hasVL);
                    renderOffersComponent(container, capsuleCount, activeTiers);
                }
            }).catch(function (err) {
                console.error('[Regua Cupom] Erro ao buscar produto:', err);
                processed++;
                if (processed === total) {
                    var activeTiers = determineCouponTiers(hasOL, hasVL);
                    renderOffersComponent(container, capsuleCount, activeTiers);
                }
            });
        });
    }

    function handleCartUpdate() {
        var container = createOffersComponent();

        window.napi.cart().read().then(function (data) {
            if (data.length === 0) {
                container.style.display = 'none';
                var storedCount = getStoredCapsuleCount();
                if (storedCount > 0) {
                    previousCapsuleCount = storedCount;
                } else {
                    previousCapsuleCount = 0;
                    storeCapsuleCount(0);
                }
            } else {
                countCapsules(data, container);
            }
        }).catch(function (err) {
            console.error('[Regua Cupom] Erro ao ler carrinho:', err);
            container.style.display = 'none';
        });
    }

    function watchForMinicartOpen() {
        var isProcessing = false;
        var debounceTimer = null;

        var observer = new MutationObserver(function (mutations) {
            if (isProcessing) return;

            for (var m = 0; m < mutations.length; m++) {
                var mutation = mutations[m];
                if (mutation.type !== 'childList') continue;

                var addedNodes = Array.from(mutation.addedNodes);
                for (var n = 0; n < addedNodes.length; n++) {
                    var node = addedNodes[n];
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;

                    var isMiniCart = node.classList && node.classList.contains('MiniBasketDropdown__wrapper');
                    var containsMiniCart = node.querySelector && node.querySelector('.MiniBasketDropdown__wrapper');

                    if (isMiniCart || containsMiniCart) {
                        isProcessing = true;
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(function () {
                            handleCartUpdate();
                            isProcessing = false;
                        }, 150);
                        return;
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    function handleResize() {
        var existingComponent = document.getElementById('nespresso-cupom-regua');
        if (existingComponent) {
            handleCartUpdate();
        }
    }

    function initComponent() {
        addAnimationStyles();
        watchForMinicartOpen();

        if (window.napi && window.napi.data) {
            window.napi.data().on('cart.update', handleCartUpdate);
        }

        window.addEventListener('resize', handleResize);
    }

    // Inicializacao com polling limitado
    var attempts = 0;
    var maxAttempts = 20;
    var waitForNapi = setInterval(function () {
        attempts++;
        if (window.napi) {
            clearInterval(waitForNapi);
            initComponent();
        } else if (attempts >= maxAttempts) {
            clearInterval(waitForNapi);
            console.error('[Regua Cupom] Nespresso API nao disponivel apos timeout');
        }
    }, 500);
})();
