(function() {
    "use strict";

    const COLOR_MAP = {
        "vermelho-pimenta": "https://view.loft3di.com/nespresso/vertuo-pop-red",
        "amarelo-manga": "https://view.loft3di.com/nespresso/vertuo-pop-yellow",
        "verde-acqua": "https://view.loft3di.com/nespresso/vertuo-pop-aqua",
        "azul-pacifico": "https://view.loft3di.com/nespresso/vertuo-pop-blue",
        "branco-coco": "https://view.loft3di.com/nespresso/vertuo-pop-white",
        "preta": "https://view.loft3di.com/nespresso/vertuo-pop-black",
        "preto-classico": "https://view.loft3di.com/nespresso/vertuo-pop-black"
    };

    function getIframeUrlByColor() {
        const currentUrl = window.location.href.toLowerCase();
        for (const [colorKey, iframeUrl] of Object.entries(COLOR_MAP)) {
            if (currentUrl.includes(colorKey)) {
                return iframeUrl;
            }
        }
        return null;
    }

    const detectedIframeUrl = getIframeUrlByColor();
    if (!detectedIframeUrl) return;

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

    const CONFIG = {
        targetSelector: "nb-cta-3d",
        iframeUrl: detectedIframeUrl,
        modalId: "nespresso-modal",
        iframeId: "nespresso-iframe",
    };

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

    class ModalManager {
        constructor() {
            this.modal = null;
            this.iframe = null;
            this.targetElement = null;
            this.isOpen = false;
            this.init();
        }

        init() {
            this.injectStyles();
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
            this.targetElement = document.querySelector(CONFIG.targetSelector);
            if (!this.targetElement) {
                setTimeout(() => this.setup(), 1000);
                return;
            }
            this.overrideElementBehavior();
            this.createModal();
        }

        overrideElementBehavior() {
            const newElement = this.targetElement.cloneNode(true);
            this.targetElement.parentNode.replaceChild(newElement, this.targetElement);
            this.targetElement = newElement;

            this.targetElement.removeAttribute("href");
            this.targetElement.removeAttribute("onclick");
            this.targetElement.removeAttribute("onmousedown");
            this.targetElement.removeAttribute("onmouseup");

            const dataAttributes = [...this.targetElement.attributes].filter(
                (attr) => attr.name.startsWith("data-") &&
                    (attr.name.includes("link") || attr.name.includes("url") || attr.name.includes("action"))
            );
            dataAttributes.forEach((attr) => this.targetElement.removeAttribute(attr.name));

            this.targetElement.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                sendGAEvent("new_3d_modal_clicked");
                this.openModal();
                return false;
            }, { capture: true, passive: false });

            ["mousedown", "mouseup", "keydown", "keyup"].forEach((eventType) => {
                this.targetElement.addEventListener(eventType, (e) => {
                    if (eventType === "keydown" && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        sendGAEvent("new_3d_modal_keyboard_activated");
                        this.openModal();
                        return false;
                    }
                    if (eventType === "mousedown" || eventType === "mouseup") {
                        e.stopPropagation();
                    }
                }, { capture: true, passive: false });
            });

            this.targetElement.style.cursor = "pointer";
            if (!this.targetElement.getAttribute("role")) {
                this.targetElement.setAttribute("role", "button");
            }
        }

        createModal() {
            this.modal = document.createElement("div");
            this.modal.id = CONFIG.modalId;
            this.modal.className = "modal-overlay";

            const container = document.createElement("div");
            container.className = "modal-container";

            const closeButton = document.createElement("button");
            closeButton.className = "modal-close";
            closeButton.setAttribute("aria-label", "Fechar modal");

            const loading = document.createElement("div");
            loading.className = "modal-loading";
            loading.textContent = "Carregando...";

            this.iframe = document.createElement("iframe");
            this.iframe.id = CONFIG.iframeId;
            this.iframe.className = "modal-iframe";
            this.iframe.src = CONFIG.iframeUrl;
            this.iframe.setAttribute("allowfullscreen", "true");
            this.iframe.setAttribute("scrolling", "no");
            this.iframe.setAttribute("frameborder", "0");
            this.iframe.style.display = "none";

            container.appendChild(closeButton);
            container.appendChild(loading);
            container.appendChild(this.iframe);
            this.modal.appendChild(container);
            document.body.appendChild(this.modal);

            closeButton.addEventListener("click", () => this.closeModal());
            this.modal.addEventListener("click", (e) => {
                if (e.target === this.modal) this.closeModal();
            });

            this.iframe.addEventListener("load", () => {
                loading.style.display = "none";
                this.iframe.style.display = "block";
                this.preventIframeZoom();
                setTimeout(() => this.preventIframeZoom(), 500);
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && this.isOpen) this.closeModal();
            });
        }

        preventIframeZoom() {
            try {
                const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
                const viewport = iframeDoc.querySelector('meta[name="viewport"]');
                if (!viewport) {
                    const meta = iframeDoc.createElement("meta");
                    meta.name = "viewport";
                    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
                    iframeDoc.head.appendChild(meta);
                }
                const style = iframeDoc.createElement("style");
                style.textContent = `
                    * { -webkit-text-size-adjust: 100% !important; -moz-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; text-size-adjust: 100% !important; }
                    html, body { overflow-x: hidden !important; max-width: 100% !important; }
                `;
                iframeDoc.head.appendChild(style);
                if (iframeDoc.body) {
                    iframeDoc.body.style.zoom = "1";
                    iframeDoc.body.style.transform = "scale(1)";
                    iframeDoc.body.style.transformOrigin = "0 0";
                }
            } catch (e) {
                this.applyAlternativeZoomControl();
            }
        }

        applyAlternativeZoomControl() {
            this.iframe.style.width = "100%";
            this.iframe.style.height = "100%";
            const currentSrc = this.iframe.src;
            if (!currentSrc.includes("viewport=")) {
                const separator = currentSrc.includes("?") ? "&" : "?";
                this.iframe.src = currentSrc + separator + "viewport=width=device-width,initial-scale=1.0";
            }
            this.detectAndFixZoom();
        }

        detectAndFixZoom() {
            setTimeout(() => {
                const container = this.iframe.parentElement;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                if (this.iframe.scrollWidth > containerWidth || this.iframe.scrollHeight > containerHeight) {
                    const scaleX = containerWidth / this.iframe.scrollWidth;
                    const scaleY = containerHeight / this.iframe.scrollHeight;
                    const scale = Math.min(scaleX, scaleY);
                    if (scale < 1) {
                        this.iframe.style.transform = "scale(" + scale + ")";
                        this.iframe.style.width = 100 / scale + "%";
                        this.iframe.style.height = 100 / scale + "%";
                    }
                }
            }, 1000);
        }

        openModal() {
            if (this.isOpen) return;
            this.isOpen = true;
            this.modal.classList.add("active");
            document.body.style.overflow = "hidden";
            sendGAEvent("new_3d_modal_opened");
            void this.modal.offsetWidth;
            this.modal.classList.add("show");
            setTimeout(() => {
                this.iframe.style.width = "99.9%";
                setTimeout(() => { this.iframe.style.width = "100%"; }, 50);
            }, 350);
        }

        closeModal() {
            if (!this.isOpen) return;
            this.isOpen = false;
            this.modal.classList.remove("show");
            sendGAEvent("new_3d_modal_closed");
            setTimeout(() => {
                this.modal.classList.remove("active");
                document.body.style.overflow = "";
            }, 300);
        }
    }

    new ModalManager();
})();