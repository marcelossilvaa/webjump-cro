
    (function() {
        // ——————————————————————————————————————————————————————————————————————————————
        // 1) Injeta CSS (banner + modal) de uma só vez
        // ——————————————————————————————————————————————————————————————————————————————
        if (!document.getElementById("nespresso-aeroccinoStyles")) {
            const style = document.createElement("style");
            style.id = "nespresso-aeroccinoStyles";
            style.innerHTML = `
       article.banner-custom-inserido div[class*='collectionDetails']{
          height:100% !important;
          text-align:center;
          padding-bottom:0px;
      }
     
      .tituloCardCrossSell, .paragrafoCardCrossSell{
          color: #FFF;
          font-family: 'NespressoLucas', Arial;
          font-size: 16px;
          letter-spacing:1.1px;
      }
      .tituloCardCrossSell{
        margin-bottom:14px;
      }
      .boldCrossSellCards{
        font-weight: 600;
      }
      .termsCrossSell{
        font-size:10px;
        letter-spacing:1.1px;
        color:#000;
        margin-top: 16px;
      }
      a.linkCardCrossSell{
        background: #fff;
        color: #000;
        align-items: center;
        display: inline-flex;
        padding: 0.5em 1.5em;
        text-decoration: none;
        border-radius: 30px;
        font-weight: 300;
        justify-content: center;
        border: 1px solid #fff;
        font-size:14px;
        gap: 6px;
        margin-bottom:16px;
        margin-top: 8px;
        z-index: 10;
      }

      article.banner-custom-inserido:not(:has(a.linkCardCrossSell)) .termsCrossSell{
        margin-bottom:40px;
      }
      a.linkCardCrossSell:hover{
        background: #000;
        color: #FFF;
        cursor:pointer !important; 
      }
      a.linkCardCrossSell:hover svg path{
        fill:#FFF;
      }
      @media screen and (max-width: 480px){
        .tituloCardCrossSell, .paragrafoCardCrossSell{
          font-size:15px;
        }
      }

      /* ==================== Modal “Termos e Condições” ==================== */
      .nespresso-welcome-offer-modal *{font-family:NespressoLucas,Helvetica,Arial,sans-serif}
      .nespresso-welcome-offer-modal{position:fixed;top:0;left:0;width:100%;height:100%;display:none;z-index:2000}
      .nespresso-welcome-offer-modal-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);cursor:pointer}
      .nespresso-welcome-offer-modal-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:8px;max-width:90%;width:550px;max-height:90vh;box-shadow:0 5px 15px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;z-index:2001}
      .nespresso-welcome-offer-modal-header{display:flex;justify-content:flex-end;padding:10px;background:#f8f8f8;border-bottom:1px solid #e5e5e5}
      .nespresso-welcome-offer-modal-close{background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s ease}
      .nespresso-welcome-offer-modal-close:hover{opacity:.7}
      .nespresso-welcome-offer-modal-close svg{width:18px;height:18px;color:#666}
      .nespresso-welcome-offer-modal-content{padding:20px;overflow-y:auto;max-height:calc(70vh - 60px);line-height:1.5;color:#333;font-size:14px}
      .nespresso-welcome-offer-modal-termos{/* ajuste de texto se necessário */}
      @media(max-width:480px){
        .nespresso-welcome-offer-modal-container{width:95%}
        .nespresso-welcome-offer-modal-content{padding:15px}
        .nespresso-welcome-offer-modal-header{padding:8px 12px}
      }

      /* ==================== Garantir clicabilidade do link ==================== */
      .banner-custom-inserido div[class*="collectionDetails"]{position:relative;z-index:1}
      .termsCrossSell{position:relative;z-index:2;pointer-events:auto}
      .linkTermsAeroccino{position:relative;z-index:3;pointer-events:auto;color:#17171A;text-decoration:underline;cursor:pointer}
      .linkTermsAeroccino:hover{text-decoration:none}
    `;
            document.head.appendChild(style);
        }

        // ——————————————————————————————————————————————————————————————————————————————
        // 2) Modal: criação e controle de eventos
        // ——————————————————————————————————————————————————————————————————————————————
        const MODAL_ID = "nespresso-welcome-offer-modal-termos-condicoes";

        function criarModal() {
            if (document.getElementById(MODAL_ID)) return;
            const m = document.createElement("div");
            m.id = MODAL_ID;
            m.className = "nespresso-welcome-offer-modal";
            m.innerHTML = `
      <div class="nespresso-welcome-offer-modal-overlay"></div>
      <div class="nespresso-welcome-offer-modal-container">
        <div class="nespresso-welcome-offer-modal-header">
          <button class="nespresso-welcome-offer-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="nespresso-welcome-offer-modal-content">
          <div class="nespresso-welcome-offer-modal-termos">
            <strong>TERMOS E CONDIÇÕES</strong><br>
            <strong>OFERTA AEROCCINO 3 VERMELHO</strong><br><br>
            *Oferta válida por tempo limitado de 04/07/2025 até 31/07/2025, sujeita a alterações sem aviso prévio. Ganhe 15% de desconto na compra do acessório Aeroccino 3 na cor vermelha. A oferta não é cumulativa com as demais ofertas vigentes, é válida para pessoas físicas portadoras de CPF e clientes classificados na categoria B2C Offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha doméstica), limitadas a 1 (um) uso por CPF de registro na Nespresso. A oferta não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento. Antes de finalizar seu pedido, confirme se você inseriu o acessório Aeroccino 3 na cor vermelha e o desconto foi aplicado.
          </div>
        </div>
      </div>
    `;
            document.body.appendChild(m);
        }

        function configurarModal() {
            const m = document.getElementById(MODAL_ID);
            if (!m) return;
            const o = m.querySelector(".nespresso-welcome-offer-modal-overlay");
            const btn = m.querySelector(".nespresso-welcome-offer-modal-close");

            function open(e) {
                e.preventDefault();
                m.style.display = "block";
                document.body.style.overflow = "hidden";
            }

            function close() {
                m.style.display = "none";
                document.body.style.overflow = "";
            }
            o.addEventListener("click", close);
            btn.addEventListener("click", close);
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && m.style.display === "block") close();
            });
        }
        criarModal();
        configurarModal();

        // ——————————————————————————————————————————————————————————————————————————————
        // 3) Aeroccino Card + “Confira condições” que abre o modal
        // ——————————————————————————————————————————————————————————————————————————————
        if (!window.novaComunicacaoCardPLP) {
            window.novaComunicacaoCardPLP = true;
            window.gtmDataObject = window.gtmDataObject || [];
            gtmDataObject.push({
                event: "adobe_target",
                event_raised_by: "adobe target",
                experiment_id: "${campaign.id}",
                experiment_type: "AB",
                experiment_name: "${campaign.name}",
                experiment_variant_id: "${campaign.recipe.id}",
                experiment_variant: "${campaign.recipe.name}",
            });
        }
        const FLAG = "banner-custom-inserido";
        let observer,
            lastFilter = null,
            variantKey = null;
        const CFG = {
            ol: {
                banner: "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
                titulo: "",
                paragrafo: "",
                ctaText: "COMPRE AGORA",
                ctaLink: "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
            },
            vl: {
                banner: "https://www.nespresso.com/ecom/medias/sys_master/public/45314443149342/CADS-DA-PLP-432x692.jpg",
                titulo: "",
                paragrafo: "",
                ctaText: "COMPRE AGORA",
                ctaLink: "https://www.nespresso.com/br/pt/order/accessories/original/comprar-espumador-de-leite-aeroccino3-vermelho-110v",
            },
        };

        function injectCard(grid, template) {
            if (grid.querySelector("." + FLAG)) return;
            const arts = grid.querySelectorAll("article");
            if (arts.length < 5) return;
            const w = window.innerWidth;
            if (w <= 767 || (w > 767 && w <= 1024)) return;
            const clone = template.cloneNode(true);
            clone.classList.add(FLAG);
            const dt = clone.querySelector("div[class*='collectionDetails']");

            // Ajustar H3 e P caso precisar adicionar os textos do card ↓

            dt.innerHTML =
                `
      <h3 class="tituloCardCrossSell"></h3>
      <p class="paragrafoCardCrossSell"></p>
      <p class="termsCrossSell"><a href="#" class="linkTermsAeroccino">*Confira condições</a></p>
      <a href="` +
                CFG[variantKey].ctaLink +
                `" class="linkCardCrossSell">
        ` +
                CFG[variantKey].ctaText +
                `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none"><path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"/></svg>
      </a>`;
            const l = dt.querySelector(".linkTermsAeroccino");
            l.addEventListener("click", (e) => {
                e.preventDefault();
                const m = document.getElementById(MODAL_ID);
                m.style.display = "block";
                document.body.style.overflow = "hidden";
            });
            const sec = clone.querySelector("section");
            sec &&
                sec.style.setProperty(
                    "background-image",
                    `url("` + CFG[variantKey].banner + `")`,
                    "important"
                );
            if (arts.length > 4) grid.insertBefore(clone, arts[4]);
            else grid.appendChild(clone);
        }

        function initCard() {
            if (window.padl?.page?.pageInfo?.pageName !== "capsules pdp_plp") return;
            variantKey = location.href.includes("original") ? "ol" : "vl";
            const fc =
                document
                .querySelector("plp-explicit-filter")
                ?.getAttribute("data-filter-counter") || "0";
            if (fc !== lastFilter) {
                lastFilter = fc;
                document.querySelectorAll("." + FLAG).forEach((e) => e.remove());
            }
            if (fc === "0") {
                const gs = document.querySelectorAll(
                    '.collection-grid[data-id*="barista-creation"], .collection-grid[data-id*="capsule-range-limited-edition-vertuo"]'
                );
                if (!gs.length) return;
                const tmp = document.querySelector(".collection-grid article");
                gs.forEach((g) => injectCard(g, tmp));
            }
        }

        function observePLP() {
            if (observer) observer.disconnect();
            const tgt = document.querySelector("plp-cards-grid") || document.body;
            observer = new MutationObserver(() => {
                clearTimeout(window.nespressoUpdateTimeout);
                window.nespressoUpdateTimeout = setTimeout(initCard, 100);
            });
            observer.observe(tgt, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["data-filter-counter"],
            });
        }
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                initCard();
                observePLP();
            });
        } else {
            initCard();
            observePLP();
        }
        window.addEventListener("beforeunload", () => {
            observer && observer.disconnect();
            clearTimeout(window.nespressoUpdateTimeout);
        });
    })();
