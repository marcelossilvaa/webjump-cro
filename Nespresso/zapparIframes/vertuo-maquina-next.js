(function() {
        "use strict";

        function sendGAEvent(label) {
            window.gtmDataObject = window.gtmDataObject || [];
            gtmDataObject.push({
                event: "local_event", //as is, do not change!!
                event_raised_by: "br", //please put the country code ex: us, ch, it
                local_event_category: "user engagement", //free to fill field, please use lower case
                local_event_action: "click", //free to fill field, please use lower case
                local_event_label: label, //free to fill field, please use lower case
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
        // Configurações
        const CONFIG = {
            targetSelector: "nb-cta-3d",
            iframeUrl: "https://view.loft3di.com/nespresso/next-br-color-configurator",
            modalId: "nespresso-modal",
            iframeId: "nespresso-iframe",
        };

        // Estilos CSS
        const STYLES = `
            iframe[title="Ocavu Experience"]{
          display:none !important;
        }
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .modal-overlay.active {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .modal-overlay.show {
            opacity: 1;
        }

        .modal-container {
            position: relative;
            width: 90%;
            height: 90%;
            max-width: 1200px;
            max-height: 800px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        .modal-overlay.show .modal-container {
            transform: scale(1);
        }

        .modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            width: 32px;
            height: 32px;
            background-color: #fff;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.2s ease, background-color 0.2s ease;
            z-index: 10;
        }

        .modal-close:hover {
            transform: scale(1.1);
            background-color: #f0f0f0;
        }

        .modal-close:before,
        .modal-close:after {
            content: '';
            position: absolute;
            width: 16px;
            height: 2px;
            background-color: #333;
            transition: background-color 0.2s ease;
        }

        .modal-close:before {
            transform: rotate(45deg);
        }

        .modal-close:after {
            transform: rotate(-45deg);
        }

        .modal-iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 8px;
            transform-origin: 0 0;
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
        }

        .modal-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: Arial, sans-serif;
            color: #666;
            font-size: 16px;
        }

        /* Responsividade */
        @media (max-width: 768px) {
            .modal-container {
                width: 90%;
                height: 90%;
                max-width: 100%;
                max-height: 100%;
                border-radius: 0;
            }

            .modal-close {
                top: -38px;
                right: 0px;
                background-color: rgba(255, 255, 255, 0.9);
            }

            .modal-iframe {
                border-radius: 0;
            }
        }
    `;

        // Classe para gerenciar o modal
        class ModalManager {
            constructor() {
                this.modal = null;
                this.iframe = null;
                this.targetElement = null;
                this.isOpen = false;
                this.originalEventListeners = [];
                this.init();
            }

            init() {
                // Injeta os estilos CSS
                this.injectStyles();

                // Aguarda o DOM carregar completamente
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", () => this.setup());
                } else {
                    this.setup();
                }
            }

            injectStyles() {
                const styleElement = document.createElement("style");
                styleElement.textContent = STYLES;
                document.head.appendChild(styleElement);
            }

            setup() {
                // Procura o elemento alvo
                this.targetElement = document.querySelector(CONFIG.targetSelector);

                if (!this.targetElement) {
                    // Tenta novamente após um delay (útil para SPAs)
                    setTimeout(() => this.setup(), 1000);
                    return;
                }

                // Remove todos os event listeners existentes e adiciona o nosso
                this.overrideElementBehavior();

                // Cria o modal
                this.createModal();
            }

            overrideElementBehavior() {
                // Clona o elemento para remover todos os event listeners
                const newElement = this.targetElement.cloneNode(true);
                this.targetElement.parentNode.replaceChild(
                    newElement,
                    this.targetElement
                );
                this.targetElement = newElement;

                // Remove atributos que podem causar navegação
                this.targetElement.removeAttribute("href");
                this.targetElement.removeAttribute("onclick");
                this.targetElement.removeAttribute("onmousedown");
                this.targetElement.removeAttribute("onmouseup");

                // Remove data attributes que podem ser usados por outros scripts
                const dataAttributes = [...this.targetElement.attributes].filter(
                    (attr) =>
                    attr.name.startsWith("data-") &&
                    (attr.name.includes("link") ||
                        attr.name.includes("url") ||
                        attr.name.includes("action"))
                );

                dataAttributes.forEach((attr) => {
                    this.targetElement.removeAttribute(attr.name);
                });

                // Adiciona nosso event listener com captura e alta prioridade
                this.targetElement.addEventListener(
                    "click",
                    (e) => {
                        // Para TODOS os tipos de propagação
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        sendGAEvent("new_3d_modal_clicked");

                        // Previne o comportamento padrão novamente (garantia extra)
                        if (e.defaultPrevented === false) {
                            e.preventDefault();
                        }

                        this.openModal();

                        // Retorna false como garantia adicional
                        return false;
                    }, {
                        capture: true, // Captura o evento antes de outros listeners
                        passive: false, // Permite usar preventDefault
                    }
                );

                // Adiciona listeners para outros eventos que podem causar navegação
                ["mousedown", "mouseup", "keydown", "keyup"].forEach((eventType) => {
                    this.targetElement.addEventListener(
                        eventType,
                        (e) => {
                            // Se for Enter ou Space em keydown, previne também
                            if (
                                eventType === "keydown" &&
                                (e.key === "Enter" || e.key === " ")
                            ) {
                                e.preventDefault();
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                sendGAEvent("new_3d_modal_keyboard_activated");
                                this.openModal();
                                return false;
                            }
                            // Para outros eventos, apenas previne se podem causar navegação
                            if (eventType === "mousedown" || eventType === "mouseup") {
                                e.stopPropagation();
                            }
                        }, {
                            capture: true,
                            passive: false
                        }
                    );
                });

                // Muda o cursor para pointer para manter a aparência de clicável
                this.targetElement.style.cursor = "pointer";

                // Adiciona role para acessibilidade
                if (!this.targetElement.getAttribute("role")) {
                    this.targetElement.setAttribute("role", "button");
                }
            }

            createModal() {
                // Cria o overlay do modal
                this.modal = document.createElement("div");
                this.modal.id = CONFIG.modalId;
                this.modal.className = "modal-overlay";

                // Container do modal
                const container = document.createElement("div");
                container.className = "modal-container";

                // Botão de fechar
                const closeButton = document.createElement("button");
                closeButton.className = "modal-close";
                closeButton.setAttribute("aria-label", "Fechar modal");

                // Indicador de carregamento
                const loading = document.createElement("div");
                loading.className = "modal-loading";
                loading.textContent = "Carregando...";

                // Iframe
                this.iframe = document.createElement("iframe");
                this.iframe.id = CONFIG.iframeId;
                this.iframe.className = "modal-iframe";
                this.iframe.src = CONFIG.iframeUrl;
                this.iframe.setAttribute("allowfullscreen", "true");
                this.iframe.setAttribute("scrolling", "no");
                this.iframe.setAttribute("frameborder", "0");
                this.iframe.style.display = "none";

                // Monta a estrutura
                container.appendChild(closeButton);
                container.appendChild(loading);
                container.appendChild(this.iframe);
                this.modal.appendChild(container);

                // Adiciona ao body
                document.body.appendChild(this.modal);

                // Event listeners
                closeButton.addEventListener("click", () => this.closeModal());
                this.modal.addEventListener("click", (e) => {
                    if (e.target === this.modal) {
                        this.closeModal();
                    }
                });

                // Evento de carregamento do iframe
                this.iframe.addEventListener("load", () => {
                    loading.style.display = "none";
                    this.iframe.style.display = "block";
                    this.preventIframeZoom();

                    // Reaplica prevenção após um delay
                    setTimeout(() => this.preventIframeZoom(), 500);
                });

                // Listener para tecla ESC
                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape" && this.isOpen) {
                        this.closeModal();
                    }
                });
            }

            preventIframeZoom() {
                try {
                    // Tenta injetar meta viewport no iframe
                    const iframeDoc =
                        this.iframe.contentDocument || this.iframe.contentWindow.document;
                    const viewport = iframeDoc.querySelector('meta[name="viewport"]');

                    if (!viewport) {
                        const meta = iframeDoc.createElement("meta");
                        meta.name = "viewport";
                        meta.content =
                            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
                        iframeDoc.head.appendChild(meta);
                    }

                    // Injeta CSS para prevenir zoom
                    const style = iframeDoc.createElement("style");
                    style.textContent = `
                    * {
                        -webkit-text-size-adjust: 100% !important;
                        -moz-text-size-adjust: 100% !important;
                        -ms-text-size-adjust: 100% !important;
                        text-size-adjust: 100% !important;
                    }
                    html, body {
                        overflow-x: hidden !important;
                        max-width: 100% !important;
                    }
                `;
                    iframeDoc.head.appendChild(style);

                    // Reseta o zoom via JavaScript
                    if (iframeDoc.body) {
                        iframeDoc.body.style.zoom = "1";
                        iframeDoc.body.style.transform = "scale(1)";
                        iframeDoc.body.style.transformOrigin = "0 0";
                    }
                } catch (e) {
                    // Cross-origin: tenta métodos alternativos
                    console.info("Aplicando métodos alternativos para controle de zoom...");
                    this.applyAlternativeZoomControl();
                }
            }

            applyAlternativeZoomControl() {
                // Método 1: Força redimensionamento
                this.iframe.style.width = "100%";
                this.iframe.style.height = "100%";

                // Método 2: Adiciona parâmetros à URL se possível
                const currentSrc = this.iframe.src;
                if (!currentSrc.includes("viewport=")) {
                    const separator = currentSrc.includes("?") ? "&" : "?";
                    this.iframe.src =
                        currentSrc +
                        separator +
                        `viewport=width=device-width,initial-scale=1.0`;
                }

                // Método 3: Aplica transform scale se detectar zoom
                this.detectAndFixZoom();
            }

            detectAndFixZoom() {
                // Tenta detectar e corrigir zoom após carregamento
                setTimeout(() => {
                    const container = this.iframe.parentElement;
                    const containerWidth = container.clientWidth;
                    const containerHeight = container.clientHeight;

                    // Se o iframe parecer maior que o container, aplica scale
                    if (
                        this.iframe.scrollWidth > containerWidth ||
                        this.iframe.scrollHeight > containerHeight
                    ) {
                        const scaleX = containerWidth / this.iframe.scrollWidth;
                        const scaleY = containerHeight / this.iframe.scrollHeight;
                        const scale = Math.min(scaleX, scaleY);

                        if (scale < 1) {
                            this.iframe.style.transform = `scale(` + scale + `)`;
                            this.iframe.style.width = 100 / scale + `%`;
                            this.iframe.style.height = 100 / scale + `%`;
                        }
                    }
                }, 1000);
            }

            openModal() {
                if (this.isOpen) return;

                this.isOpen = true;
                this.modal.classList.add("active");
                document.body.style.overflow = "hidden";

                // Envia evento GA4 para abertura do modal
                sendGAEvent("new_3d_modal_opened");

                // Força reflow para animação
                void this.modal.offsetWidth;
                this.modal.classList.add("show");

                // Força recálculo do iframe após abrir
                setTimeout(() => {
                    this.iframe.style.width = "99.9%";
                    setTimeout(() => {
                        this.iframe.style.width = "100%";
                    }, 50);
                }, 350);
            }

            closeModal() {
                if (!this.isOpen) return;

                this.isOpen = false;
                this.modal.classList.remove("show");

                // Envia evento GA4 para fechamento do modal
                sendGAEvent("new_3d_modal_closed");

                setTimeout(() => {
                    this.modal.classList.remove("active");
                    document.body.style.overflow = "";
                }, 300);
            }
        }

        // Inicializa o gerenciador do modal
        const modalManager = new ModalManager();
    })();