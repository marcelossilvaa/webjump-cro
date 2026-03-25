(function () {
  "use strict";

  if (window.couponFlashSalesXT) {
    return;
  }
  window.couponFlashSalesXT = true;

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

  // Configuração principal do componente
  const NespressoBanner = {
    // Set para controlar modais criados
    modalsCreated: new Set(),

    // Configurações padrão
    defaultConfig: {
      targetSelector: "nb-informative-stripe", // Seletor onde inserir o componente
      insertPosition: "after", // "replace", "prepend", "append", "before", "after"
      autoInit: true, // Inicializar automaticamente quando DOM estiver pronto
      maxRetries: 10, // Número máximo de tentativas para encontrar o elemento
      retryInterval: 500, // Intervalo em ms entre tentativas
      coupons: [
        {
          label:
            "<span class='bold-text-offer'>Ganhe 10% OFF</span><br>na compra de 120 Cápsulas",
          code: "CAFEOFF10",
        },
        {
          label:
            "<span class='bold-text-offer'>Ganhe 15% OFF</span><br>na compra de 170 Cápsulas",
          code: "CAFEOFF15",
        },
      ],
      texts: {
        offerLabel: "FLASH SALES",
        detailsText: "Termos e condições",
        tooltipCopy: "Clique para copiar",
        tooltipCopied: "Copiado!",
      },
      // Conteúdo do modal
      modalContent: `
      <h3 style=" margin-bottom: 15px; font-size: 18px;">Termos e Condições da Oferta</h3>
        <div style="space-y: 10px;">
        <strong>FLASH SALES – 18/09/2025 a 24/09/2025</strong><br>
        <br>
      As ofertas referentes a Flash Sales Nespresso, especificadas nos itens
abaixo, são válidas de 18/09/2025 às 09h até 24/09/2025, apenas para
pessoas físicas portadoras de CPF e clientes classificados na categoria B2C
Offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha
doméstica), não se aplicando para pessoas jurídicas com histórico de compras
de cápsulas da linha profissional, bem como para outros clientes portadores de
CNPJ, não cumulativas com outras ofertas em andamento e limitadas a um uso
por CPF de registro na Nespresso. Todos os produtos estão sujeitos à
disponibilidade de estoque e as ofertas estão sujeitas alterações sem aviso
prévio.<br>
As ofertas estarão disponíveis no período mencionado nos canais de
compra oficiais da marca: Boutiques Nespresso, telefone 0800 7777 737,
WhatsApp (11) 95578-4670, site www.Nespresso.com ou aplicativos para
iPhone, iPad e Android. <br>
Todos os pedidos realizados durante o período da Campanha de Flash
Sales, de 18/09/2025 às 09h até 24/09/2025, poderão ser parcelados em até
10x sem juros, desde que contenham parcelas mínimas de R$100,00 (cem
reais) e terão entrega gratuita (frete grátis) para o modo de entrega padrão ou
‘standard’, para compras com no mínimo 70 cápsulas. Verifique o prazo de
entrega para sua localidade ao escolher o modo de entrega antes da
finalização de seu pedido. <br>
O modo de entrega Boutique Clique &amp; Retire (retirada em loja em todas
as Boutiques Nespresso), será válido na compra de cápsulas, máquinas e
acessórios. O prazo para retirada é de 1 (um) dia, ou seja, no dia seguinte da
compra, de acordo com a disponibilidade de estoque da Boutique Nespresso
selecionada. <br>
A Nespresso se reserva o direito, a seu critério exclusivo, de
desqualificar qualquer indivíduo que interferir com o funcionamento das ofertas,
seja ao criar várias contas, utilizar várias identidades ou agir de qualquer outra
forma que seja considerada pela Nespresso como uma violação dos Termos e
Condições, ou de alguma outra forma prejudicial. 
Se você tiver consentido, no momento do cadastro, com o uso dos seus
dados de contato e interações para receber comunicações de marketing da
Nespresso, saiba que seu consentimento para este fim é voluntário e você é
livre para retirá-lo a qualquer momento. Mais informações disponíveis na
Política de Privacidade da Nespresso. <br>

Em caso de dúvidas ou necessidade de informações adicionais, entre
em contato com um de nossos Especialistas de Café pelo telefone gratuito
0800 7777 737 (segunda a sábado, das 6h às 22h).<br><br> 
a. Na compra a partir de 120 cápsulas, durante o período
supramencionado, o consumidor ganhará 10% de desconto, concedido
em pedidos que contenham cápsulas da linha Vertuo e/ou Original. Para
ativar o desconto, o cliente deve inserir o código CAFEOFF10 no campo
Código Promocional disponível na etapa carrinho, ou solicitar o desconto
nas Boutiques. Essa oferta é exclusiva para clientes selecionados
Nespresso e estará disponível em todos os canais oficiais Nespresso:
Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-
4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e
Android. <br><br>
b. Na compra a partir de 170 cápsulas, durante o período
supramencionado, o consumidor ganhará 15% de desconto, concedido
em pedidos que contenham cápsulas da linha Vertuo e/ou Original. Para
ativar o desconto, o cliente deve inserir o código CAFEOFF15 no campo
Código Promocional disponível na etapa carrinho, ou solicitar o desconto
nas Boutiques. Essa oferta é exclusiva para clientes selecionados
Nespresso e estará disponível em todos os canais oficiais Nespresso:
Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-
4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e
Android.
        </div>
      `,
    },

    // Função para aguardar elemento aparecer com tentativas
    waitForElement: function (selector, maxRetries = 10, interval = 500) {
      return new Promise((resolve, reject) => {
        let attempts = 0;

        const checkElement = () => {
          const element = document.querySelector(selector);

          if (element) {
            resolve(element);
            return;
          }

          attempts++;

          if (attempts >= maxRetries) {
            reject(new Error(`Elemento não encontrado`));
            return;
          }

          setTimeout(checkElement, interval);
        };

        checkElement();
      });
    },

    // CSS do componente (incluindo estilos do modal)
    getStyles: function () {
      return `
        <style id="nespresso-banner-styles">
          .nb-informative-stripe {
            display:none;
          }
          .nespresso-offer-banner {
            font-family: "NespressoLucas";
            background-color: #faf9f8;
            color: #655032;
            padding: 24px 20px;
            position: relative;
            overflow: hidden;
          }

          .nespresso-offer-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction:column;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .nespresso-offer-label {
            background-color: #6b6a3e;
            color: #fff;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .nespresso-offer-content {
            display: flex;
            align-items: center;
            gap: 20px;
            flex: 1;
          }

          .nespresso-offer-text {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
          }

          .nespresso-offer-coupons {
            display: flex;
            gap: 40px;
            align-items: center;
          }

          .nespresso-coupon-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .nespresso-coupon-label {
            font-size: 13px;
            white-space: nowrap;
            color:#17171a;
            font-weight: 500;
            line-height: 120%;
            letter-spacing: .01563rem;
            text-align: end;
          }
          .nespresso-coupon-label .bold-text-offer{
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 1.1px;
          }

          .nespresso-coupon-code {
            background-color: #fff;
            color: #000;
            padding: 5px 4px;
            border-radius: 7px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            border: 1px solid #000;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .nespresso-coupon-code:hover {
            background-color: #6B6A3E;
            border: 1px solid #6B6A3E;
            color:#FFF;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          .nespresso-coupon-code:active {
            transform: translateY(0);
          }

          .nespresso-coupon-code.copied {
            background-color: #257A57;
            color: #fff;
            border-color: #257A57;
          }

          .nespresso-copy-icon {
            width: 14px;
            height: 14px;
            opacity: 0.7;
          }

          .nespresso-offer-details {
            color: #876c43;
            letter-spacing: .015625rem;
            text-decoration: underline;
            cursor: pointer;
            font-size: 16px;
            transition: opacity 0.3s ease;
            white-space: nowrap;
          }

          .nespresso-offer-details:hover {
            opacity: 0.8;
          }

          .nespresso-offer-coupon-tooltip {
            position: absolute;
            background-color: #333;
            color: #fff;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
          }

          .nespresso-offer-coupon-tooltip.show {
            opacity: 1;
          }

          .nespresso-offer-coupon-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #333 transparent transparent transparent;
          }

          /* CSS Modal */
          .nespresso-oferta-modal * {
            font-family: NespressoLucas, Helvetica, Arial, sans-serif;
          }
          
          .nespresso-oferta-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            z-index: 2000;
          }
          
          .nespresso-oferta-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            cursor: pointer;
          }
          
          .nespresso-oferta-modal-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            border-radius: 8px;
            max-width: 90%;
            width: 550px;
            max-height: 90vh;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 2001;
          }
          
          .nespresso-oferta-modal-header {
            display: flex;
            justify-content: flex-end;
            padding: 10px;
            background: #f8f8f8;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .nespresso-oferta-modal-close {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease;
          }
          
          .nespresso-oferta-modal-close:hover {
            opacity: 0.7;
          }
          
          .nespresso-oferta-modal-close svg {
            width: 18px;
            height: 18px;
            color: #666;
          }
          
          .nespresso-oferta-modal-content {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(70vh - 60px);
            line-height: 1.5;
            color: #333;
            font-size: 14px;
          }
        
          /* Desktop Styles */
          @media (min-width: 768px) {
            .nespresso-offer-coupons .nespresso-coupon-wrapper:only-child {
              flex-direction:row;
              gap:15px;
            }
            .nespresso-offer-coupons .nespresso-coupon-wrapper:only-child .bold-text-offer{
              font-size: 21px;
            }
        }
          /* Mobile Styles */
          @media (max-width: 768px) {
            .nespresso-offer-banner {
              padding: 12px 15px 0px;
            }
            .nespresso-offer-container .wrapper-mobile{
              display: flex;
              justify-content:space-between;
            }
            .nespresso-offer-container {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }

            .nespresso-offer-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }

            .nespresso-offer-text {
              font-size: 18px;
            }

            .nespresso-offer-coupons {
              flex-direction: row;
              align-items: center;
              justify-content: space-around;
              gap: 10px;
              width: 100%;
            }

            .nespresso-coupon-wrapper {
              justify-content: space-between;
              display: flex;
              flex-direction: column;         
              align-items: center;     
            }
            .nespresso-offer-coupons .nespresso-coupon-wrapper:only-child {
              flex-direction:row;
              gap:20px;
            }

            .nespresso-coupon-label {
              font-size: 13px;
            }

            .nespresso-coupon-code {
              font-size: 13px;
              padding: 8px 10px;
            }

            .nespresso-offer-details {
              align-self: center;
              margin-top: 5px;
            }

            .nespresso-offer-label {
              align-self: center;
            }

            /* Modal Mobile */
            .nespresso-oferta-modal-container {
              width: 85%;
            }
            
            .nespresso-oferta-modal-content {
              padding: 15px;
            }
            
            .nespresso-oferta-modal-header {
              padding: 8px 12px;
            }
          }

          @media (max-width: 480px) {
            .nespresso-coupon-code {
              font-size: 13px;
              padding: 6px 8px;
            }

            .nespresso-coupon-label {
              font-size: 12px;
            }
          }

          /* Animação de entrada */
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .nespresso-offer-banner {
            animation: slideDown 0.5s ease-out;
          }
        </style>
      `;
    },

    // Gerar HTML do componente
    generateHTML: function (config) {
      const couponsHTML = config.coupons
        .map(
          (coupon) =>
            `
        <div class="nespresso-coupon-wrapper">
          <span class="nespresso-coupon-label">` +
            coupon.label +
            `</span>
          <div class="nespresso-coupon-code" data-coupon="` +
            coupon.code +
            `">
            <span>` +
            coupon.code +
            `</span>
            <svg class="nespresso-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <div class="nespresso-offer-coupon-tooltip">` +
            config.texts.tooltipCopy +
            `</div>
          </div>
        </div>
      `
        )
        .join("");

      return (
        `
        <div class="nespresso-offer-banner">
          <div class="nespresso-offer-container">
          <span class="nespresso-offer-label">` +
        config.texts.offerLabel +
        `</span>
            <div class="nespresso-offer-content">
              <div class="nespresso-offer-coupons">
                ` +
        couponsHTML +
        `
              </div>
              <a class="nespresso-offer-details" href="#details">` +
        config.texts.detailsText +
        `</a>
            </div>
            
            
          </div>
        </div>
      `
      );
    },

    // Função para criar modal
    createModal: function (modalContent) {
      const modalId = `nespresso-modal-banner`;
      if (this.modalsCreated.has(modalId)) return modalId;

      const modalElement = document.createElement("div");
      modalElement.id = modalId;
      modalElement.className = "nespresso-oferta-modal";
      modalElement.innerHTML =
        `
        <div class="nespresso-oferta-modal-overlay"></div>
        <div class="nespresso-oferta-modal-container">
          <div class="nespresso-oferta-modal-header">
            <button class="nespresso-oferta-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="nespresso-oferta-modal-content">
            <div class="nespresso-oferta-modal-termos">
              ` +
        modalContent +
        `
            </div>
          </div>
        </div>
      `;

      const fragment = document.createDocumentFragment();
      fragment.appendChild(modalElement);
      document.body.appendChild(fragment);

      modalElement.addEventListener("click", (event) => {
        if (
          event.target.closest(".nespresso-oferta-modal-overlay") ||
          event.target.closest(".nespresso-oferta-modal-close")
        ) {
          modalElement.style.display = "none";
          document.body.style.overflow = "";
        }
      });

      this.modalsCreated.add(modalId);
      return modalId;
    },

    // Função para copiar cupom
    copyToClipboard: function (text, element, config) {
      const tempInput = document.createElement("input");
      tempInput.style.position = "absolute";
      tempInput.style.left = "-9999px";
      tempInput.value = text;
      document.body.appendChild(tempInput);

      tempInput.select();
      tempInput.setSelectionRange(0, 99999);

      try {
        document.execCommand("copy");

        element.classList.add("copied");
        const tooltip = element.querySelector(
          ".nespresso-offer-coupon-tooltip"
        );
        const originalText = tooltip.textContent;
        tooltip.textContent = config.texts.tooltipCopied;
        tooltip.classList.add("show");

        setTimeout(() => {
          element.classList.remove("copied");
          tooltip.classList.remove("show");
          tooltip.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error("Erro ao copiar:", err);
        alert("Cupom: " + text);
      }

      document.body.removeChild(tempInput);
    },

    // Adicionar eventos
    addEventListeners: function (config) {
      const couponElements = document.querySelectorAll(
        ".nespresso-coupon-code"
      );
      couponElements.forEach((element) => {
        element.addEventListener("click", () => {
          const couponCode = element.getAttribute("data-coupon");
          sendGAEvent("copiou_cupom_" + couponCode.toLocaleLowerCase());
          this.copyToClipboard(couponCode, element, config);
        });

        element.addEventListener("mouseenter", function () {
          if (!this.classList.contains("copied")) {
            const tooltip = this.querySelector(
              ".nespresso-offer-coupon-tooltip"
            );
            tooltip.classList.add("show");
          }
        });

        element.addEventListener("mouseleave", function () {
          if (!this.classList.contains("copied")) {
            const tooltip = this.querySelector(
              ".nespresso-offer-coupon-tooltip"
            );
            tooltip.classList.remove("show");
          }
        });
      });

      // Criar modal e adicionar evento ao botão detalhes
      const modalId = this.createModal(config.modalContent);

      const detailsLinks = document.querySelectorAll(
        ".nespresso-offer-details"
      );
      detailsLinks.forEach((detailsLink) => {
        detailsLink.addEventListener("click", (event) => {
          event.preventDefault();
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = "block";
            document.body.style.overflow = "hidden";
          }
        });
      });
    },

    // Inserir componente no DOM (versão assíncrona com retry)
    insertComponent: async function (config) {
      try {
        // Aguarda o elemento aparecer com sistema de retry
        const targetElement = await this.waitForElement(
          config.targetSelector,
          config.maxRetries,
          config.retryInterval
        );

        // Remover banner existente se houver
        this.remove();

        // Criar container
        const container = document.createElement("div");
        container.innerHTML = this.getStyles() + this.generateHTML(config);

        const styleElement = container.querySelector("style");
        const bannerElement = container.querySelector(
          ".nespresso-offer-banner"
        );

        // Inserir estilos no head
        if (!document.getElementById("nespresso-banner-styles")) {
          document.head.appendChild(styleElement);
        }

        // Inserir banner conforme posição especificada
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
            targetElement.parentNode.insertBefore(
              bannerElement,
              targetElement.nextSibling
            );
            break;
          default:
            targetElement.appendChild(bannerElement);
        }

        this.addEventListeners(config);
        console.log("Componente inserido com sucesso!");
        return true;
      } catch (error) {
        console.error("Falha ao inserir componente:", error.message);
        return false;
      }
    },

    // Remover componente
    remove: function () {
      const existingBanner = document.querySelector(".nespresso-offer-banner");
      const existingStyles = document.getElementById("nespresso-banner-styles");
      const existingModals = document.querySelectorAll(
        ".nespresso-oferta-modal"
      );

      if (existingBanner) {
        existingBanner.remove();
      }
      if (existingStyles) {
        existingStyles.remove();
      }
      existingModals.forEach((modal) => modal.remove());

      // Limpar set de modais criados
      this.modalsCreated.clear();
    },

    // Função principal de inicialização
    init: function (userConfig = {}) {
      const config = { ...this.defaultConfig, ...userConfig };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.insertComponent(config);
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
