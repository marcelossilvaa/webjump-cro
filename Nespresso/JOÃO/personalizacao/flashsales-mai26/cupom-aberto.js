(function () {
    "use strict";

    if (window.cupomFlashSalesAberto) {
        return;
    }
    window.cupomFlashSalesAberto = true;

    function sendGAEvent(label) {
        window.gtmDataObject = window.gtmDataObject || [];
        gtmDataObject.push({
            event: "local_event",
            event_raised_by: "br",
            local_event_category: "user engagement",
            local_event_action: "click",
            local_event_label: label,
        });
    }
    gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
        event: "adobe_target",
        event_raised_by: "adobe target",
        experiment_id: "${campaign.id}",
        experiment_type: "AB",
        experiment_name: "${campaign.name}",
        experiment_variant_id: "${campaign.recipe.id}",
        experiment_variant: "${campaign.recipe.name}",
    });

    // Configuracao principal do componente
    const NespressoBanner = {
        // Set para controlar modais criados
        modalsCreated: new Set(),

        // Configuracoes padrao
        defaultConfig: {
            targetSelector: "nb-plp-coffee-xf-cards",
            insertPosition: "before",
            autoInit: true,
            maxRetries: 10,
            retryInterval: 500,
            coupons: [
                {
                    label: "<span class='bold-text-offer'>GANHE +10% OFF</span><br>na compra de 120 Capsulas",
                    code: "CAFEOFF10",
                },
                {
                    label: "<span class='bold-text-offer'>GANHE +15% OFF</span><br>na compra de 170 Capsulas",
                    code: "CAFEOFF15",
                },
            ],
            texts: {
                offerLabel: "CUPOM EXCLUSIVO",
                tooltipCopy: "Clique para copiar",
                tooltipCopied: "Copiado!",
            },
        },

        // Funcao para aguardar elemento aparecer com tentativas
        waitForElement: function (selector, maxRetries, interval) {
            if (!maxRetries) maxRetries = 10;
            if (!interval) interval = 500;
            return new Promise(function (resolve, reject) {
                var attempts = 0;

                var checkElement = function () {
                    var element = document.querySelector(selector);

                    if (element) {
                        resolve(element);
                        return;
                    }

                    attempts++;

                    if (attempts >= maxRetries) {
                        reject(new Error("Elemento nao encontrado"));
                        return;
                    }

                    setTimeout(checkElement, interval);
                };

                checkElement();
            });
        },

        // CSS do componente
        getStyles: function () {
            return '<style id="nespresso-banner-styles-aberto">' +
                '.nb-informative-stripe { display:none; }' +
                '.nespresso-offer-banner {' +
                '  font-family: "NespressoLucas";' +
                '  background-color: #faf9f8;' +
                '  color: #655032;' +
                '  padding: 24px 20px 10px;' +
                '  position: relative;' +
                '  overflow: hidden;' +
                '}' +
                '.nespresso-offer-container {' +
                '  max-width: 1200px;' +
                '  margin: 0 auto;' +
                '  display: flex;' +
                '  flex-direction: column;' +
                '  align-items: center;' +
                '  justify-content: space-between;' +
                '  gap: 20px;' +
                '}' +
                '.nespresso-offer-label {' +
                '  background-color: #971B2F;' +
                '  color: #fff;' +
                '  padding: 4px 10px;' +
                '  border-radius: 4px;' +
                '  font-size: 18px;' +
                '  font-weight: 600;' +
                '  text-transform: uppercase;' +
                '  letter-spacing: 0.5px;' +
                '  white-space: nowrap;' +
                '}' +
                '.nespresso-offer-content {' +
                '  display: flex;' +
                '  align-items: center;' +
                '  gap: 20px;' +
                '  flex: 1;' +
                '}' +
                '.nespresso-offer-text {' +
                '  font-size: 20px;' +
                '  font-weight: 700;' +
                '  margin: 0;' +
                '}' +
                '.nespresso-offer-coupons {' +
                '  display: flex;' +
                '  gap: 40px;' +
                '  align-items: center;' +
                '}' +
                '.nespresso-coupon-wrapper {' +
                '  display: flex;' +
                '  align-items: center;' +
                '  gap: 8px;' +
                '}' +
                '.nespresso-coupon-label {' +
                '  font-size: 13px;' +
                '  white-space: nowrap;' +
                '  color: #17171a;' +
                '  font-weight: 500;' +
                '  line-height: 120%;' +
                '  letter-spacing: .01563rem;' +
                '  text-align: end;' +
                '}' +
                '.nespresso-coupon-label .bold-text-offer {' +
                '  font-weight: 700;' +
                '  font-size: 18px;' +
                '  letter-spacing: 1.1px;' +
                '}' +
                '.nespresso-coupon-code {' +
                '  background-color: #fff;' +
                '  color: #000;' +
                '  padding: 5px 4px;' +
                '  border-radius: 7px;' +
                '  font-weight: 600;' +
                '  font-size: 16px;' +
                '  cursor: pointer;' +
                '  transition: all 0.3s ease;' +
                '  position: relative;' +
                '  border: 1px solid #8c8181;' +
                '  display: inline-flex;' +
                '  align-items: center;' +
                '  gap: 6px;' +
                '}' +
                '.small-text-nao-acumulativo { font-size: 11px; }' +
                '.nespresso-coupon-code:hover {' +
                '  background-color: #000;' +
                '  border: 1px solid #000;' +
                '  color: #FFF;' +
                '  transform: translateY(-2px);' +
                '  box-shadow: 0 4px 8px rgba(0,0,0,0.15);' +
                '}' +
                '.nespresso-coupon-code:active { transform: translateY(0); }' +
                '.nespresso-coupon-code.copied {' +
                '  background-color: #257A57;' +
                '  color: #fff;' +
                '  border-color: #257A57;' +
                '}' +
                '.nespresso-copy-icon { width: 14px; height: 14px; opacity: 0.7; }' +
                '.nespresso-offer-details {' +
                '  color: #876c43;' +
                '  letter-spacing: .015625rem;' +
                '  text-decoration: underline;' +
                '  cursor: pointer;' +
                '  font-size: 16px;' +
                '  transition: opacity 0.3s ease;' +
                '  white-space: nowrap;' +
                '}' +
                '.nespresso-offer-details:hover { opacity: 0.8; }' +
                '.nespresso-offer-coupon-tooltip {' +
                '  position: absolute;' +
                '  background-color: #333;' +
                '  color: #fff;' +
                '  padding: 6px 10px;' +
                '  border-radius: 4px;' +
                '  font-size: 12px;' +
                '  white-space: nowrap;' +
                '  pointer-events: none;' +
                '  opacity: 0;' +
                '  transition: opacity 0.3s ease;' +
                '  z-index: 1000;' +
                '  top: -35px;' +
                '  left: 50%;' +
                '  transform: translateX(-50%);' +
                '}' +
                '.nespresso-offer-coupon-tooltip.show { opacity: 1; }' +
                '.nespresso-offer-coupon-tooltip::after {' +
                '  content: "";' +
                '  position: absolute;' +
                '  top: 100%;' +
                '  left: 50%;' +
                '  margin-left: -5px;' +
                '  border-width: 5px;' +
                '  border-style: solid;' +
                '  border-color: #333 transparent transparent transparent;' +
                '}' +
                '.nespresso-oferta-modal * { font-family: NespressoLucas, Helvetica, Arial, sans-serif; }' +
                '.nespresso-oferta-modal {' +
                '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;' +
                '  display: none; z-index: 2000;' +
                '}' +
                '.nespresso-oferta-modal-overlay {' +
                '  position: absolute; top: 0; left: 0; width: 100%; height: 100%;' +
                '  background: rgba(0, 0, 0, 0.5); cursor: pointer;' +
                '}' +
                '.nespresso-oferta-modal-container {' +
                '  position: absolute; top: 50%; left: 50%;' +
                '  transform: translate(-50%, -50%); background: #fff;' +
                '  border-radius: 8px; max-width: 90%; width: 550px;' +
                '  max-height: 90vh; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);' +
                '  display: flex; flex-direction: column; overflow: hidden; z-index: 2001;' +
                '}' +
                '.nespresso-oferta-modal-header {' +
                '  display: flex; justify-content: flex-end; padding: 10px;' +
                '  background: #f8f8f8; border-bottom: 1px solid #e5e5e5;' +
                '}' +
                '.nespresso-oferta-modal-close {' +
                '  background: none; border: none; cursor: pointer;' +
                '  display: flex; align-items: center; justify-content: center;' +
                '  transition: opacity 0.2s ease;' +
                '}' +
                '.nespresso-oferta-modal-close:hover { opacity: 0.7; }' +
                '.nespresso-oferta-modal-close svg { width: 18px; height: 18px; color: #666; }' +
                '.nespresso-oferta-modal-content {' +
                '  padding: 20px; overflow-y: auto; max-height: calc(70vh - 60px);' +
                '  line-height: 1.5; color: #333; font-size: 14px;' +
                '}' +
                '@media (min-width: 768px) {' +
                '  .nespresso-offer-coupons .nespresso-coupon-wrapper:only-child { flex-direction: row; gap: 15px; }' +
                '  .nespresso-offer-coupons .nespresso-coupon-wrapper:only-child .bold-text-offer { font-size: 21px; }' +
                '}' +
                '@media (max-width: 768px) {' +
                '  .nespresso-offer-banner { padding: 12px 15px 0px; }' +
                '  .nespresso-offer-container .wrapper-mobile { display: flex; justify-content: space-between; }' +
                '  .nespresso-offer-container { flex-direction: column; gap: 12px; align-items: stretch; }' +
                '  .nespresso-offer-content { flex-direction: column; align-items: flex-start; gap: 10px; }' +
                '  .nespresso-offer-text { font-size: 18px; }' +
                '  .nespresso-offer-coupons { flex-direction: row; align-items: center; justify-content: space-around; gap: 10px; width: 100%; }' +
                '  .nespresso-coupon-wrapper { justify-content: space-between; display: flex; flex-direction: column; align-items: center; }' +
                '  .nespresso-offer-coupons .nespresso-coupon-wrapper:only-child { flex-direction: row; gap: 20px; }' +
                '  .nespresso-coupon-label { font-size: 13px; }' +
                '  .nespresso-coupon-code { font-size: 13px; padding: 8px 10px; }' +
                '  .nespresso-offer-details { align-self: center; margin-top: 5px; }' +
                '  .nespresso-offer-label { align-self: center; }' +
                '  .nespresso-oferta-modal-container { width: 85%; }' +
                '  .nespresso-oferta-modal-content { padding: 15px; }' +
                '  .nespresso-oferta-modal-header { padding: 8px 12px; }' +
                '}' +
                '@media (max-width: 480px) {' +
                '  .nespresso-coupon-code { font-size: 13px; padding: 6px 8px; }' +
                '  .nespresso-coupon-label { font-size: 12px; }' +
                '}' +
                '@keyframes slideDown {' +
                '  from { transform: translateY(-100%); opacity: 0; }' +
                '  to { transform: translateY(0); opacity: 1; }' +
                '}' +
                '.nespresso-offer-banner { animation: slideDown 0.5s ease-out; }' +
                '</style>';
        },

        // Gerar HTML do componente
        generateHTML: function (config) {
            var couponsHTML = '';
            config.coupons.forEach(function (coupon) {
                couponsHTML +=
                    '<div class="nespresso-coupon-wrapper">' +
                    '  <span class="nespresso-coupon-label">' + coupon.label + '</span>' +
                    '  <div class="nespresso-coupon-code" data-coupon="' + coupon.code + '">' +
                    '    <span>' + coupon.code + '</span>' +
                    '    <svg class="nespresso-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
                    '      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
                    '    </svg>' +
                    '    <div class="nespresso-offer-coupon-tooltip">' + config.texts.tooltipCopy + '</div>' +
                    '  </div>' +
                    '</div>';
            });

            return '<div class="nespresso-offer-banner">' +
                '  <div class="nespresso-offer-container">' +
                '    <span class="nespresso-offer-label">' + config.texts.offerLabel + '</span>' +
                '    <div class="nespresso-offer-content">' +
                '      <div class="nespresso-offer-coupons">' +
                couponsHTML +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        },

        // Funcao para copiar cupom
        copyToClipboard: function (text, element, config) {
            var tempInput = document.createElement("input");
            tempInput.style.position = "absolute";
            tempInput.style.left = "-9999px";
            tempInput.value = text;
            document.body.appendChild(tempInput);

            tempInput.select();
            tempInput.setSelectionRange(0, 99999);

            try {
                document.execCommand("copy");

                element.classList.add("copied");
                var tooltip = element.querySelector(".nespresso-offer-coupon-tooltip");
                var originalText = tooltip.textContent;
                tooltip.textContent = config.texts.tooltipCopied;
                tooltip.classList.add("show");

                setTimeout(function () {
                    element.classList.remove("copied");
                    tooltip.classList.remove("show");
                    tooltip.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.error("Erro ao copiar:", err);
            }

            document.body.removeChild(tempInput);
        },

        // Adicionar eventos
        addEventListeners: function (config) {
            var self = this;
            var couponElements = document.querySelectorAll(".nespresso-coupon-code");
            couponElements.forEach(function (element) {
                element.addEventListener("click", function () {
                    var couponCode = element.getAttribute("data-coupon");
                    sendGAEvent("copiou_cupom_" + couponCode.toLowerCase());
                    self.copyToClipboard(couponCode, element, config);
                });

                element.addEventListener("mouseenter", function () {
                    if (!this.classList.contains("copied")) {
                        var tooltip = this.querySelector(".nespresso-offer-coupon-tooltip");
                        tooltip.classList.add("show");
                    }
                });

                element.addEventListener("mouseleave", function () {
                    if (!this.classList.contains("copied")) {
                        var tooltip = this.querySelector(".nespresso-offer-coupon-tooltip");
                        tooltip.classList.remove("show");
                    }
                });
            });
        },

        // Inserir componente no DOM com retry
        insertComponent: function (config) {
            var self = this;
            this.waitForElement(
                config.targetSelector,
                config.maxRetries,
                config.retryInterval
            ).then(function (targetElement) {
                // Remover banner existente se houver
                self.remove();

                // Criar container
                var container = document.createElement("div");
                container.innerHTML = self.getStyles() + self.generateHTML(config);

                var styleElement = container.querySelector("style");
                var bannerElement = container.querySelector(".nespresso-offer-banner");

                // Inserir estilos no head
                if (!document.getElementById("nespresso-banner-styles-aberto")) {
                    document.head.appendChild(styleElement);
                }

                // Inserir banner conforme posicao especificada
                switch (config.insertPosition) {
                    case "replace":
                        targetElement.innerHTML = "";
                        targetElement.appendChild(bannerElement);
                        break;
                    case "prepend":
                        targetElement.insertBefore(bannerElement, targetElement.firstChild);
                        break;
                    case "append":
                        targetElement.appendChild(bannerElement);
                        break;
                    case "before":
                        targetElement.parentNode.insertBefore(bannerElement, targetElement);
                        break;
                    case "after":
                        targetElement.parentNode.insertBefore(bannerElement, targetElement.nextSibling);
                        break;
                    default:
                        targetElement.appendChild(bannerElement);
                }

                self.addEventListeners(config);
                console.log("[Cupom Aberto] Componente inserido com sucesso");
            }).catch(function (error) {
                console.error("[Cupom Aberto] Falha ao inserir componente:", error.message);
            });
        },

        // Remover componente
        remove: function () {
            var existingBanner = document.querySelector(".nespresso-offer-banner");
            var existingStyles = document.getElementById("nespresso-banner-styles-aberto");
            var existingModals = document.querySelectorAll(".nespresso-oferta-modal");

            if (existingBanner) {
                existingBanner.remove();
            }
            if (existingStyles) {
                existingStyles.remove();
            }
            existingModals.forEach(function (modal) { modal.remove(); });

            // Limpar set de modais criados
            this.modalsCreated.clear();
        },

        // Funcao principal de inicializacao
        init: function (userConfig) {
            if (!userConfig) userConfig = {};
            var config = Object.assign({}, this.defaultConfig, userConfig);

            if (document.readyState === "loading") {
                var self = this;
                document.addEventListener("DOMContentLoaded", function () {
                    self.insertComponent(config);
                });
            } else {
                this.insertComponent(config);
            }
        },
    };

    // Auto-inicializar se habilitado
    if (NespressoBanner.defaultConfig.autoInit) {
        NespressoBanner.init();
    }
})();
