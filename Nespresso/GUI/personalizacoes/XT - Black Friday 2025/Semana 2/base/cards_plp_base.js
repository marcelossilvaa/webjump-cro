!(function () {
  if (!window.plpCardsOfertas) {
    const f = [
        {
          id: "dia-do-cliente-cafes-boost",
          enabled: (window.plpCardsOfertas = !0),
          position: 5,
          targetCollections: [
            "nesclub2.br.b2c/cat/capsule-range-ispirazione-italiana",
            "nesclub2.br.b2c/cat/capsule-range-gran-lungo-vertuo",
            "nesclub2.br.b2c/cat/capsule-range-craft-brew-vertuo",
          ],
          filterCondition: "0",
          hasBackground: !0,
          variants: {
            ol: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45777693769758/Card-PLP-432x692-Brazil-Organic-V2.jpg?attachment=true&cimgnr=FR3NB",
              paragrafo:
                "Experimente a linha Master Origins <br>Brazil Organic",
              ctaText: "ADICIONAR AO CARRINHO",
              ctaAction: "addToCart",
              ctaSKU: "7894.90",
              ctaQuantity: 10,
            },
            vl: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45777692950558/Card-PLP-432x692-Colombia-VL-V2.jpg?attachment=true&cimgnr=TF8DQ",
              paragrafo: "Experimente a linha Master Origins Colombia",
              ctaText: "ADICIONAR AO CARRINHO",
              ctaAction: "addToCart",
              ctaSKU: "7028.80",
              ctaQuantity: 10,
            },
          },
        },
        {
          id: "incentivo_assinatura_simplifique",
          enabled: !0,
          position: 5,
          targetCollections: [
            "nesclub2.br.b2c/cat/capsule-range-world-explorations",
            "nesclub2.br.b2c/cat/capsule-range-limited-edition-vertuo",
          ],
          filterCondition: "0",
          hasBackground: !1,
          variants: {
            ol: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45906413518878/Card-PLP-Assinatura-432x692.jpg?attachment=true&cimgnr=SGucV",
              ctaText: "ASSINE AGORA",
              ctaLink:
                "https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list",
            },
            vl: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45906413518878/Card-PLP-Assinatura-432x692.jpg?attachment=true&cimgnr=SGucV",
              ctaText: "ASSINE AGORA",
              ctaLink:
                "https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list",
            },
          },
        },
        {
          id: "incentivo_beneficios_nespresso_club",
          enabled: !0,
          position: 5,
          targetCollections: [
            "nesclub2.br.b2c/cat/capsules-range-barista-creations",
            "nesclub2.br.b2c/cat/capsule-range-espressos-vertuo-ristretto-sub",
          ],
          filterCondition: "0",
          hasBackground: !1,
          variants: {
            ol: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45906413649950/Card-PLP-Nespresso-Club-432x692-2.jpg?attachment=true&cimgnr=xrJma",
              ctaText: "CONHEÇA O CLUB",
              ctaLink: "https://www.nespresso.com/br/pt/beneficios",
            },
            vl: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45906413649950/Card-PLP-Nespresso-Club-432x692-2.jpg?attachment=true&cimgnr=xrJma",
              ctaText: "CONHEÇA O CLUB",
              ctaLink: "https://www.nespresso.com/br/pt/beneficios",
            },
          },
        },
        {
          id: "incentivo_reciclagem_capsulas",
          enabled: !0,
          position: 5,
          targetCollections: [
            "nesclub2.br.b2c/cat/capsule-suggestions",
            "nesclub2.br.b2c/cat/capsule-range-Mug-vertuo",
          ],
          filterCondition: "0",
          hasBackground: !1,
          variants: {
            ol: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45906413813790/Card-PLP-Reciclagem-432x692-1.jpg?attachment=true&cimgnr=5e6dC",
            },
            vl: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/45906413813790/Card-PLP-Reciclagem-432x692-1.jpg?attachment=true&cimgnr=5e6dC",
            },
          },
        },
        {
          id: "comunicacao_zeta",
          enabled: !0,
          position: 5,
          targetCollections: [
            "nesclub2.br.b2c/cat/capsule-range-MasterOrigin",
            "nesclub2.br.b2c/cat/capsule-range-MasterOrigin-vertuo",
          ],
          filterCondition: "0",
          hasBackground: !1,
          variants: {
            ol: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/46082864480286/Card-PLP-2-.jpg?attachment=true&cimgnr=GgLK5",
              ctaText: "COMPRE AGORA",
              ctaLink: "https://www.nespresso.com/br/pt/tenis-zeta-nespresso",
            },
            vl: {
              banner:
                "https://www.nespresso.com/ecom/medias/sys_master/public/46082864480286/Card-PLP-2-.jpg?attachment=true&cimgnr=GgLK5",
              ctaText: "COMPRE AGORA",
              ctaLink: "https://www.nespresso.com/br/pt/tenis-zeta-nespresso",
            },
          },
        },
      ],
      g = {
        initialized: !1,
        currentFilterCount: null,
        productVariantKey: null,
        activeCards: new Map(),
        cachedSelectors: new Map(),
        templateCache: null,
        lastObservedElement: null,
        sentLoadEvents: new Set(),
      },
      C = {
        buttonsBySKU: new Map(),
        listenerBound: !1,
        napiCheckTimer: null,
      },
      h = new Set();
    let t, r;

    function l(e, t) {
      (window.gtmDataObject = window.gtmDataObject || []),
        gtmDataObject.push({
          event: "local_event",
          event_raised_by: "br",
          local_event_category: "comunicacao-cards-plp-target",
          local_event_action: e,
          local_event_label: t,
        });
    }

    function o() {
      var e = location.href.toLowerCase();
      return e.includes("original")
        ? "ol"
        : e.includes("vertuo")
        ? "vl"
        : (e = document
            .querySelector("plp-cards-grid")
            ?.getAttribute?.("data-coffee-system")
            ?.toLowerCase())?.includes("original")
        ? "ol"
        : e?.includes("vertuo")
        ? "vl"
        : g.productVariantKey || "ol";
    }

    function a(e) {
      e &&
        e
          .querySelectorAll(".btnCardCrossSell.addCart[data-sku]")
          .forEach((e) => {
            var t = e.getAttribute("data-sku"),
              a = C.buttonsBySKU.get(t);
            a && (a.delete(e), 0 === a.size) && C.buttonsBySKU.delete(t);
          });
    }

    function d(e, t) {
      e &&
        (e.classList.remove("loading"),
        t
          ? ((e.textContent = "ADICIONADO"),
            e.setAttribute("aria-pressed", "true"),
            (e.dataset.added = "true"),
            e.classList.add("added"),
            (e.disabled = !0))
          : ((t = e.dataset.originalText || "ADICIONAR AO CARRINHO"),
            (e.textContent = t),
            e.removeAttribute("aria-pressed"),
            delete e.dataset.added,
            e.classList.remove("added"),
            (e.disabled = !1)));
    }
    async function n() {
      var e = await (async function () {
        try {
          var e,
            t = window.napi?.cart?.();
          return t && "function" == typeof t.read
            ? (e = t.read()) && "function" == typeof e.then
              ? await e
              : Array.isArray(e)
              ? e
              : []
            : [];
        } catch (e) {
          return [];
        }
      })();
      const r = new Set(
        e
          .map((e) => {
            return (
              ((e = e?.productId) &&
                "string" == typeof e &&
                (e = e.split("/"))[e.length - 1]) ||
              null
            );
          })
          .filter(Boolean)
      );
      C.buttonsBySKU.forEach((e, t) => {
        const a = r.has(t);
        e.forEach((e) => d(e, a));
      });
    }

    function s() {
      if (!C.listenerBound) {
        var e = window.napi?.data?.();
        if (!e || "function" != typeof e.on) return !1;
        e.on("cart.update", function () {
          n();
        }),
          (C.listenerBound = !0);
      }
      return !0;
    }

    function i() {
      if (s()) n();
      else if (!C.napiCheckTimer) {
        let e = 0;
        C.napiCheckTimer = setInterval(() => {
          e++,
            s()
              ? (clearInterval(C.napiCheckTimer),
                (C.napiCheckTimer = null),
                n())
              : 33 < e &&
                (clearInterval(C.napiCheckTimer), (C.napiCheckTimer = null));
        }, 300);
      }
    }

    function c(e, t) {
      var a,
        r = "banner-custom-" + e.id,
        t = t.cloneNode(!0),
        r =
          (t.classList.add("banner-custom-inserido", r),
          t.setAttribute("data-variant", g.productVariantKey),
          t.querySelector("div[class*='collectionDetails']")),
        o = e.variants[g.productVariantKey],
        n = [];
      o.titulo &&
        n.push('<h3 class="tituloCardCrossSell">' + o.titulo + "</h3>"),
        o.paragrafo &&
          n.push(
            '<p class="paragrafoCardCrossSell' +
              ((o.ctaLink && o.ctaText) ||
              ("addToCart" === o.ctaAction && o.ctaText)
                ? '" style="margin-bottom:0px;'
                : "") +
              '">' +
              o.paragrafo +
              "</p>"
          ),
        o.termsText &&
          o.modalContent &&
          ((a = (function (e, t) {
            if (((e = "nespresso-modal-" + e), !h.has(e))) {
              const a = document.createElement("div");
              (a.id = e),
                (a.className = "nespresso-welcome-offer-modal"),
                (a.innerHTML =
                  `
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
              ` +
                  t +
                  `
            </div>
          </div>
        </div>
      `);
              t = document.createDocumentFragment();
              t.appendChild(a),
                document.body.appendChild(t),
                a.addEventListener("click", (e) => {
                  (e.target.closest(".nespresso-welcome-offer-modal-overlay") ||
                    e.target.closest(".nespresso-welcome-offer-modal-close")) &&
                    ((a.style.display = "none"),
                    (document.body.style.overflow = ""));
                }),
                h.add(e);
            }
            return e;
          })(e.id, o.modalContent)),
          n.push(
            '<p class="termsCrossSell"><a href="#" class="linkTermsCustomCard" data-modal-id="' +
              a +
              '">' +
              o.termsText +
              "</a></p>"
          )),
        "addToCart" === o.ctaAction && o.ctaSKU && o.ctaQuantity && o.ctaText
          ? n.push(
              `
          <button type="button" class="btnCardCrossSell addCart" 
            data-card-id="` +
                e.id +
                `"
            data-sku="` +
                o.ctaSKU +
                `"
            data-quantity="` +
                o.ctaQuantity +
                `"
            data-cta-text="` +
                o.ctaText +
                `">
            ` +
                o.ctaText +
                `
          </button>`
            )
          : o.ctaLink &&
            o.ctaText &&
            n.push(
              `
          <a href="` +
                o.ctaLink +
                `" class="linkCardCrossSell" 
            data-card-id="` +
                e.id +
                `"
            data-cta-text="` +
                o.ctaText +
                `">
            ` +
                o.ctaText +
                `
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none">
              <path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"/>
            </svg>
          </a>`
            ),
        (r.innerHTML = n.join(""));
      const s = r.querySelector(".linkTermsCustomCard"),
        i =
          (s &&
            s.addEventListener("click", (e) => {
              e.preventDefault();
              (e = s.getAttribute("data-modal-id")),
                (e = document.getElementById(e));
              e &&
                ((e.style.display = "block"),
                (document.body.style.overflow = "hidden"));
            }),
          r.querySelector(".linkCardCrossSell")),
        c =
          (i &&
            i.addEventListener("click", (e) => {
              l(
                "click-cta",
                i.getAttribute("data-card-id") +
                  "-" +
                  i.getAttribute("data-cta-text")
              );
            }),
          r.querySelector(".btnCardCrossSell.addCart"));
      c &&
        ((a = c),
        (n = a?.getAttribute("data-sku")) &&
          (C.buttonsBySKU.has(n) || C.buttonsBySKU.set(n, new Set()),
          (a.dataset.originalText =
            a.getAttribute("data-cta-text") || a.textContent.trim()),
          C.buttonsBySKU.get(n).add(a)),
        c.addEventListener("click", (e) => {
          if ((e.preventDefault(), !c.disabled && "true" !== c.dataset.added)) {
            var e = c.getAttribute("data-card-id"),
              t = c.getAttribute("data-sku"),
              a = parseInt(c.getAttribute("data-quantity"), 10),
              r = c;
            if (r && !r.disabled && "true" !== r.dataset.added) {
              r.classList.add("loading");
              try {
                window.CartManager &&
                "function" == typeof window.CartManager.updateItem
                  ? (window.CartManager.updateItem(t, a, null, null, !1),
                    l("add-to-cart", e + "-sku:" + t + "-qty:" + a),
                    r.classList.remove("loading"),
                    d(r, !0))
                  : (console.error(
                      "CartManager não encontrado ou updateItem não disponível"
                    ),
                    r.classList.remove("loading"));
              } catch (e) {
                console.error("Erro ao adicionar ao carrinho:", e),
                  r.classList.remove("loading");
                const o = r.dataset.originalText || "ADICIONAR AO CARRINHO";
                (r.textContent = "Erro ao adicionar"),
                  setTimeout(() => {
                    r.textContent = o;
                  }, 2e3);
              }
            }
          }
        }));
      r = t.querySelector("section");
      return (
        r &&
          o.banner &&
          ((n = e.hasBackground
            ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.7) 100%), url("' +
              o.banner +
              '")'
            : 'url("' + o.banner + '")'),
          r.style.setProperty("background-image", n, "important")),
        t
      );
    }

    function p(n) {
      const t = n.id;
      var e = (function (e) {
        var t = e.join(",");
        if (g.cachedSelectors.has(t)) {
          var a = g.cachedSelectors.get(t);
          if (a.every((e) => document.contains(e))) return a;
          g.cachedSelectors.delete(t);
        }
        return (
          (a = e
            .map((e) => '.collection-grid[data-id="' + e + '"]')
            .join(", ")),
          (e = Array.from(document.querySelectorAll(a))),
          g.cachedSelectors.set(t, e),
          e
        );
      })(n.targetCollections);
      if (e.length) {
        (g.templateCache && document.contains(g.templateCache)) ||
          (g.templateCache = document.querySelector(
            ".collection-grid article"
          ));
        const s = g.templateCache;
        if (s) {
          var a = e.map((e) => e.querySelector(".banner-custom-" + t)),
            r = a.every((e) => null !== e),
            o = a.some(
              (e) => e && e.getAttribute("data-variant") !== g.productVariantKey
            );
          if (r && !o)
            g.activeCards.set(t, {
              gridElements: a.filter(Boolean),
              config: n,
            });
          else {
            u(t);
            const i = [];
            e.forEach((e) => {
              var t,
                a,
                r,
                o = c(n, s);
              (e = e),
                (t = o),
                (a = n.position),
                (r = e.querySelectorAll(
                  "article:not(.banner-custom-inserido)"
                )),
                (a -= 1),
                r.length >= a ? e.insertBefore(t, r[a]) : e.appendChild(t),
                i.push(o);
            }),
              g.activeCards.set(t, {
                gridElements: i,
                config: n,
              }),
              (r = t),
              g.sentLoadEvents.has(r) ||
                (g.sentLoadEvents.add(r), l("card-loaded", r));
          }
        }
      } else g.activeCards.has(t) && u(t);
    }

    function u(e) {
      var t = g.activeCards.get(e);
      t &&
        t.gridElements.forEach((e) => {
          e && (a(e), e.parentNode) && e.parentNode.removeChild(e);
        }),
        g.activeCards.delete(e),
        document.querySelectorAll(".banner-custom-" + e).forEach((e) => {
          a(e), e.remove();
        }),
        g.sentLoadEvents.delete(e);
    }

    function m() {
      if ("capsules pdp_plp" === window.padl?.page?.pageInfo?.pageName) {
        const r =
          document
            .querySelector("plp-explicit-filter")
            ?.getAttribute("data-filter-counter") || "0";
        var e = r !== g.currentFilterCount,
          t = o(),
          a = t !== g.productVariantKey;
        (e || a) &&
          ((g.currentFilterCount = r),
          (g.productVariantKey = t),
          g.cachedSelectors.clear(),
          Array.from(g.activeCards.keys()).forEach(u),
          g.sentLoadEvents.clear()),
          f.forEach((e) => {
            var t, a;
            (t = e),
              (a = r),
              !t.enabled ||
              (null !== t.filterCondition && a !== t.filterCondition)
                ? u(e.id)
                : p(e);
          }),
          i();
      }
    }

    function b() {
      var e;
      g.initialized ||
        ((g.productVariantKey = o()),
        document.getElementById("nespresso-flexibleCardsStyles") ||
          (((e = document.createElement("style")).id =
            "nespresso-flexibleCardsStyles"),
          (e.innerHTML = `
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
          padding: 0px 4px;
        }
        .tituloCardCrossSell{
          margin-bottom:14px;
          font-weight:600;
        }
        .paragrafoCardCrossSell{
          margin-bottom:24px;
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
        a.linkCardCrossSell, button.btnCardCrossSell{
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
          cursor: pointer;
        }
        
        button.btnCardCrossSell{
          font-family: 'NespressoLucas', Arial;
        }
  
        article.banner-custom-inserido:not(:has(a.linkCardCrossSell)):not(:has(button.btnCardCrossSell)) .termsCrossSell{
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
        .btnCardCrossSell.addCart{
          font-size:11px;
          font-weight:600;
          background:#257a57;
          color:#fff;
          border:none;
          padding: 0.8em 1.5em;
        }
        button.btnCardCrossSell.addCart:hover{
          background:#4e9173;
        }
        /* Estado de loading para botão de adicionar ao carrinho */
        button.btnCardCrossSell.loading{
          opacity: 0.7;
          pointer-events: none;
        }
        button.btnCardCrossSell.loading::after{
          content: '...';
          animation: dots 1.5s steps(4, end) infinite;
        }
  
        /* NOVO: aparência do botão quando já adicionado/disabled */
        button.btnCardCrossSell.addCart.added,
        button.btnCardCrossSell.addCart[disabled]{
          opacity: 0.85;
          cursor: default;
        }
  
        @keyframes dots{
          0%, 20%{ content: ''; }
          40%{ content: '.'; }
          60%{ content: '..'; }
          80%, 100%{ content: '...'; }
        }
        
        @media screen and (max-width: 480px){
          .tituloCardCrossSell, .paragrafoCardCrossSell{
            font-size:15px;
          }
        }
  
        /* Modal */
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
  
        /* Garantir clicabilidade */
        .banner-custom-inserido div[class*="collectionDetails"]{position:relative;z-index:1}
        .termsCrossSell{position:relative;z-index:2;pointer-events:auto}
        .linkTermsCustomCard{position:relative;z-index:3;pointer-events:auto;color:#17171A;text-decoration:underline;cursor:pointer}
        .linkTermsCustomCard:hover{text-decoration:none}
      `),
          document.head.appendChild(e)),
        m(),
        t && t.disconnect(),
        (e = document.querySelector("plp-cards-grid")) &&
          (t = new MutationObserver((e) => {
            let t = !1;
            for (const a of e) {
              if (
                "attributes" === a.type &&
                "data-filter-counter" === a.attributeName
              ) {
                t = !0;
                break;
              }
              if ("childList" === a.type)
                if (
                  Array.from(a.addedNodes)
                    .concat(Array.from(a.removedNodes))
                    .some(
                      (e) =>
                        e.nodeType === Node.ELEMENT_NODE &&
                        (e.classList?.contains("collection-grid") ||
                          e.querySelector?.(".collection-grid"))
                    )
                ) {
                  t = !0;
                  break;
                }
            }
            t && (clearTimeout(r), (r = setTimeout(m, 150)));
          })).observe(e, {
            childList: !0,
            subtree: !0,
            attributes: !0,
            attributeFilter: ["data-filter-counter"],
          }),
        i(),
        (g.initialized = !0));
    }

    function e() {
      const e = () => {
        document.querySelector("plp-cards-grid") ? b() : setTimeout(e, 100);
      };
      e();
    }
    window.flexibleCardsPLPInitialized ||
      ((window.flexibleCardsPLPInitialized = !0),
      (window.gtmDataObject = window.gtmDataObject || []),
      gtmDataObject.push({
        event: "adobe_target",
        event_raised_by: "adobe target",
        experiment_id: "${campaign.id}",
        experiment_type: "AB",
        experiment_variant_id: "${campaign.recipe.id}",
        experiment_variant: "${campaign.recipe.name}",
      })),
      document.addEventListener("keydown", (e) => {
        "Escape" === e.key &&
          document
            .querySelectorAll(".nespresso-welcome-offer-modal[style*='block']")
            .forEach((e) => {
              (e.style.display = "none"), (document.body.style.overflow = "");
            });
      }),
      window.addEventListener("beforeunload", () => {
        t && (t.disconnect(), (t = null)),
          clearTimeout(r),
          g.cachedSelectors.clear(),
          g.activeCards.clear(),
          g.sentLoadEvents.clear(),
          C.napiCheckTimer &&
            (clearInterval(C.napiCheckTimer), (C.napiCheckTimer = null));
      }),
      "loading" === document.readyState
        ? document.addEventListener("DOMContentLoaded", e)
        : e();
  }
})();
