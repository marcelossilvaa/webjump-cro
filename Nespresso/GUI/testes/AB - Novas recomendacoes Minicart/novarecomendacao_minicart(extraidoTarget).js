    ! function() {
        if (!window.minicartRecomendationAB) {
            window.minicartRecomendationAB = !0, (gtmDataObject = window.gtmDataObject || []).push({
                event: "adobe_target",
                event_raised_by: "adobe target",
                experiment_id: "${campaign.id}",
                experiment_type: "AB",
                experiment_name: "${campaign.name}",
                experiment_variant_id: "${campaign.recipe.id}",
                experiment_variant: "${campaign.recipe.name}"
            });
            const n = ["7990.90", "7884.90", "7874.90"],
                h = ["7077.80", "7017.80", "7028.80"],
                u = "minicart-reco-panel";
            let i = null,
                c = null;
            const g = () => window.innerWidth < 768,
                t = `
    .MiniBasketDropdown__wrapper {
      position: relative !important;
    }
    #` + u + " .QuantitySelector__popin--bottom, #" + u + ` .QuantitySelector__popin--top {
      right: 246% !important;
    }
    #` + u + ` {
      position: absolute;
      right: 100%;
      top: 0;
      width: 250px;
      height: 100%;
      background: #F3F0EB;
      font-family: NespressoLucas, sans-serif;
      overflow-y: auto;
      z-index: 10;
      transition: width 0.35s ease, opacity 0.5s ease-in-out, max-height 0.6s ease-in-out, transform 0.5s ease-in-out;
    }

    #` + u + `.reco-panel--hiding {
      opacity: 0;
      max-height: 0 !important;
      transform: scale(0.97);
      overflow: hidden;
      pointer-events: none;
    }

    #` + u + `.reco-panel--collapsed {
      width: 36px;
      overflow: hidden;
    }

    #` + u + `::-webkit-scrollbar {
      width: 4px;
    }
    #` + u + `::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }

    #` + u + ` .reco-header {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      cursor: pointer;
      border-bottom: 1px solid #ededed;
      user-select: none;
      gap: 8px;
      background-color:#BA9C89;
    }

    #` + u + `.reco-panel--collapsed .reco-header {
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 0;
      height: 100%;
      width: 36px;
      box-sizing: border-box;
      border-bottom: none;
      gap: 0;
    }

    #` + u + ` .reco-header__arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }
    #` + u + ` .reco-header__arrow svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #` + u + ` .reco-header__arrow--open {
      transform: rotate(180deg);
    }

    #` + u + `.reco-panel--collapsed .reco-header__arrow {
      transform: rotate(0deg);
    }

    @keyframes recoPulseLeft {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-4px); }
    }

    #` + u + ` .reco-header__title {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    #` + u + `.reco-panel--collapsed .reco-header__title {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }

    #` + u + ` .reco-list {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 50px;
      margin-top:25px;
    }
    #` + u + `.reco-panel--collapsed .reco-list {
      display: none;
    }

    @media (max-width: 767px) {
      #` + u + ` .reco-list {
        max-height: 500px;
        opacity: 1;
        transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.4s ease;
      }
      #` + u + `.reco-panel--collapsed .reco-list {
        display: flex !important;
        max-height: 0;
        opacity: 0;
        padding-top: 0;
        padding-bottom: 0;
        overflow: hidden;
      }
    }

    #` + u + ` .reco-card {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      padding: 14px 12px 12px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: box-shadow 0.2s;
    }
    #` + u + ` .reco-card:hover {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    #` + u + ` .reco-card__image {
      width: 60px;
      height: auto;
      object-fit: contain;
      margin-bottom: 8px;
      align-self: center;
    }

    #` + u + ` .reco-card__name {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
      line-height: 1.3;
    }

    #` + u + ` .reco-card__headline {
      font-size: 11px;
      color: #666;
      line-height: 1.3;
      margin-bottom: 2px;
    }

    #` + u + ` .reco-card__capsules {
      font-size: 11px;
      color: #888;
      margin-bottom: 8px;
    }

    #` + u + ` .reco-card__footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      width: 100%;
    }

    #` + u + ` .reco-card__price {
      font-size: 14px;
      font-weight: 700;
      color: #986F38;
      line-height: 1.2;
    }

    #` + u + ` .reco-card__unit-price {
      font-size: 11px;
      color: #986F38;
      display: block;
    }

    #` + u + ` .reco-card__footer .add-to-bag {
      flex-shrink: 0;
    }
    @media screen and (min-width: 768px){
      #` + u + `.reco-panel--collapsed .reco-header{
        gap: 25px !important;
        background-color: #f3f0eb;
      }
      #` + u + `.reco-panel--collapsed .reco-header__arrow{
        background-color: #ba9c89;
        width: 100%;
        padding: 10px 0;
        justify-content: center;
      }
      #` + u + `.reco-panel--collapsed .reco-header__arrow svg{
        animation: recoPulseLeft 1.4s ease-in-out infinite;
      }
      #` + u + `.reco-panel--collapsed .reco-header__title{
        font-size:16px !important;
        letter-spacing: 1.1px !important;
        color: #796a5e;
        padding-top: 12px;
      }
    }
    @media screen and (min-width: 768px) and (max-height: 820px) {
      #` + u + ` .reco-list{
        gap: 10px;
        margin-top: 0px;
      }
    #` + u + ` .reco-card{
        padding:0px 12px 2px;
    }
     #` + u + ` .reco-card__name{
        font-size: 12px;
    }
    #` + u + ` .reco-card__image{
        width: 50px;
        margin-bottom: 0px;
        margin-top:8px;
    }
      
    }

    /* ===== MOBILE ===== */
    @media (max-width: 767px) {
      .MiniBasketDropdown__wrapper {
        position: static !important;
      }
    #` + u + `{
      background-color: #FFF;
    }
      #` + u + ` .QuantitySelector__popin--bottom,
      #` + u + ` .QuantitySelector__popin--top {
        right: auto !important;
      }
      #` + u + ` .reco-card .reco-card__image {
        width:30px;
        height:auto;
      }
      #` + u + ` .reco-card .reco-card__headline{
        display:none;
      }
      #` + u + ` {
        position: static !important;
        width: 100% !important;
        height: auto !important;
        right: auto;
        top: auto;
        overflow-y: visible;
        box-sizing: border-box;
        margin-bottom:4px;
      }

      #` + u + `.reco-panel--collapsed {
        width: 100% !important;
        overflow: hidden;
      }

      #` + u + ` .reco-header {
        flex-direction: row-reverse;
        justify-content: center;
        transition: background 0.35s ease, border-radius 0.35s ease, margin 0.35s ease, width 0.35s ease;
      }

      #` + u + `.reco-panel--collapsed .reco-header {
        flex-direction: row-reverse;
        align-items: center;
        justify-content: center;
        height: auto;
        width: 100%;
        padding: 6px 16px;
        border-bottom: none;
        gap: 8px;
        background: #f5f1e6;
        width: fit-content;
        margin: 8px auto;
        border-radius: 20px;
      }

      #` + u + `.reco-panel--collapsed .reco-header__title {
        writing-mode: horizontal-tb !important;
        transform: none !important;
      }

      #` + u + ` .reco-header__arrow--open {
        transform: rotate(-90deg);
      }

      #` + u + `.reco-panel--collapsed .reco-header__arrow {
        transform: rotate(90deg) !important;
        transition: transform 0.35s ease;
        animation: none !important;
      }

      #` + u + ` .reco-list {
        flex-direction: row;
        overflow-x: auto;
        overflow-y: visible;
        gap: 10px;
        margin-top: 0;
        padding: 10px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        justify-content: center;
      }

      #` + u + ` .reco-list::-webkit-scrollbar {
        display: none;
      }

      #` + u + ` .reco-card {
        min-width: 100px;
        max-width: 110px;
        flex-shrink: 0;
        background-color:#F9F9F9;
        align-items: center;
        text-align: center;
        padding: 0px 12px 2px;
      }
      #` + u + ` .reco-card__capsules {
        display: none;
      }
      #` + u + ` .reco-card__unit-price {
        display: none;
      }
      #` + u + ` .add-to-bag .AddToBagButton {
        border-radius:4px;
        width:23px;
        height:18px;
      }
          #` + u + ` .add-to-bag {
      position: static;
      display: flex;
      justify-content: center;
    }
      #` + u + ` .add-to-bag .AddToBagButtonSmall__quantity{
        top: 0px !important;
      }
      #` + u + ` .add-to-bag .AddToBagButtonSmall__quantity i.AddToBagButtonSmall__icon-sign{
        font-size: 18px !important;
      }
        #` + u + ` .add-to-bag .AddToBagButtonSmall__quantity{
        font-size:10px !important;
    }
      #` + u + ` .reco-card__footer{
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      #` + u + ` .reco-card__name{
        font-size: 12px;
      }
      #` + u + ` .reco-card__capsules{
        font-size: 11px;
      }
      #` + u + ` .reco-card__price{
        font-size: 12px;
      }
      #` + u + ` .reco-card__unit-price{
        font-size: 8px;
      }
      #` + u + ` .reco-header{
        padding: 6px 16px;
        background: #f5f1e6;
        justify-content: center;
        width: fit-content;
        margin: 8px auto;
        border-radius: 20px;
        border-bottom: none;
      }
      #` + u + ` .reco-header__title{
        color: #746b61;
      }
      #` + u + ` .reco-header__arrow svg{
        stroke: #746b61;
      }
    }
    @media screen and (max-width: 375px) {
      #` + u + ` .reco-list .reco-card:nth-child(n+3) {
        display: none;
      }
    }

    #` + u + ` .reco-card__check-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      background: #E8E8E8;
      border: none;
      cursor: default;
      pointer-events: none;
      flex-shrink: 0;
    }
    #` + u + ` .reco-card__check-btn svg {
      width: 18px;
      height: 18px;
      stroke: #888;
      stroke-width: 2.5;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #` + u + ` .reco-card__check-btn--hidden {
      display: none;
    }
    #` + u + ` .add-to-bag--hidden {
      display: none !important;
    }

    @media (max-width: 767px) {
      #` + u + ` .reco-card__check-btn {
        width: 23px;
        height: 18px;
        border-radius: 4px;
      }
      #` + u + ` .reco-card__check-btn svg {
        width: 13px;
        height: 13px;
      }
    }
  `,
                _ = e => "R$ " + e.toFixed(2).replace(".", ","),
                f = async e => {
                    var t = "VL" === e ? h : n;
                    if (i && c === e) return i;
                    var o = [];
                    for (const r of t) try {
                        var a = await window.napi.catalog().getProduct(r);
                        a && a.inStock && o.push(a)
                    } catch (e) {
                        console.warn("[MinicartReco] Falha ao buscar SKU " + r, e)
                    }
                    return i = o, c = e, o
                }, x = e => {
                    var t = e.salesMultiple || 10,
                        o = e.price * t,
                        a = e.responsiveImages?.plp || e.images?.icon || "",
                        a = a.startsWith("http") ? a : "https://www.nespresso.com" + a,
                        r = e.id?.split("/").pop() || e.id,
                        n = document.createElement("div");
                    return n.className = "reco-card", n.setAttribute("data-sku", r), n.innerHTML = '<img class="reco-card__image" src="' + a + '" alt="' + e.name + '" loading="lazy" /><div class="reco-card__name">' + e.name + '</div><div class="reco-card__headline">' + (e.headline || "") + '</div><div class="reco-card__capsules">' + t + ' cápsulas</div><div class="reco-card__footer"><div><span class="reco-card__price">' + _(o) + '</span><span class="reco-card__unit-price">(' + t + " × " + _(e.price) + ')</span></div><div class="add-to-bag" data-product-id="' + e.id + '" data-button-size="small"></div><button class="reco-card__check-btn reco-card__check-btn--hidden" aria-label="Já no carrinho"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg></button></div>', n
                }, w = async () => {
                    var e = await async function() {
                        var e = (await s()).filter(function(e) {
                            return !e.nonRemovable
                        });
                        if (!e.length) return null;
                        for (var t = !1, o = !1, a = !1, r = 0; r < e.length; r++) try {
                            var n, i, c = l(e[r].productId);
                            c && (n = await window.napi.catalog().getProduct(c)) && "capsule" === n.type && (a = !0, (i = n.technologies && n.technologies[0] || "").includes("original") ? t = !0 : i.includes("vertuo") && (o = !0))
                        } catch (e) {}
                        return a ? o && !t ? "VL" : "OL" : null
                    }(), t = document.getElementById(u);
                    if (null === e) t && t.remove();
                    else {
                        if (t) {
                            if (c === e) return;
                            t.remove(), i = null
                        }
                        t = await f(e);
                        if (t.length) {
                            const o = await p();
                            e = t.every(function(e) {
                                e = e.id?.split("/").pop() || e.id;
                                return o.has(e)
                            });
                            if (!e) {
                                const a = document.createElement("div"),
                                    r = (a.id = u, document.createElement("div"));
                                r.className = "reco-header";
                                r.innerHTML = '<span class="reco-header__arrow reco-header__arrow--open"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6"></polyline></svg></span><span class="reco-header__title">Complete sua experiência</span>';
                                const n = document.createElement("div");
                                if (n.className = "reco-list", t.forEach(e => n.appendChild(x(e))), r.addEventListener("click", () => {
                                        var e = !a.classList.contains("reco-panel--collapsed");
                                        a.classList.toggle("reco-panel--collapsed", e), r.querySelector(".reco-header__arrow").classList.toggle("reco-header__arrow--open", !e), d(e ? "fechou_reco_minicart" : "abriu_reco_minicart")
                                    }), a.appendChild(r), a.appendChild(n), g()) {
                                    e = document.querySelector(".MiniBasketFooter");
                                    if (!e || !e.parentNode) return;
                                    e.parentNode.insertBefore(a, e)
                                } else {
                                    t = document.querySelector(".MiniBasketDropdown__wrapper");
                                    if (!t) return;
                                    t.appendChild(a)
                                }
                                setTimeout(() => {
                                    window.mosaic && window.mosaic.initializeAllFreeHTMLModules && mosaic.initializeAllFreeHTMLModules(a), a.querySelectorAll(".add-to-bag").forEach(function(t) {
                                        t.addEventListener("click", function() {
                                            var e = t.closest(".reco-card");
                                            d("add_to_cart_reco_minicart_" + (e ? e.getAttribute("data-sku") : ""))
                                        })
                                    }), m()
                                }, 150), d("ativou_reco_lateral_minicart")
                            }
                        }
                    }
                }, e = () => {
                    var e;
                    document.getElementById("minicart-reco-styles") || ((e = document.createElement("style")).id = "minicart-reco-styles", e.textContent = t, document.head.appendChild(e)), new MutationObserver(e => {
                        for (const a of e)
                            if ("childList" === a.type)
                                for (const r of a.addedNodes)
                                    if (r.nodeType === Node.ELEMENT_NODE) {
                                        var t = r.classList?.contains("MiniBasketDropdown__wrapper"),
                                            o = r.querySelector?.(".MiniBasketDropdown__wrapper");
                                        if (t || o) {
                                            setTimeout(() => w(), 200);
                                            break
                                        }
                                    }
                    }).observe(document.body, {
                        childList: !0,
                        subtree: !0
                    }), window.napi?.data && window.napi.data().on("cart.update", () => {
                        document.querySelector(".MiniBasketDropdown__wrapper") && setTimeout(() => w(), 200), setTimeout(() => m(), 400)
                    })
                }, o = setInterval(() => {
                    window.napi && (clearInterval(o), e())
                }, 500);

            function d(e) {
                window.gtmDataObject = window.gtmDataObject || [], gtmDataObject.push({
                    event: "local_event",
                    event_raised_by: "br",
                    local_event_category: "nova_recomendacao_minicart",
                    local_event_action: "click",
                    local_event_label: e
                })
            }
            async function s() {
                try {
                    var e, t = window.napi?.cart?.();
                    return t && "function" == typeof t.read ? (e = t.read()) && "function" == typeof e.then ? await e : Array.isArray(e) ? e : [] : []
                } catch (e) {
                    return []
                }
            }

            function l(e) {
                return e && "string" == typeof e && (e = e.split("/"))[e.length - 1] || null
            }
            async function p() {
                var e = await s();
                return new Set(e.map(function(e) {
                    return l(e?.productId)
                }).filter(Boolean))
            }
            async function m() {
                const o = document.getElementById(u);
                if (o) {
                    const r = await p();
                    var e = o.querySelectorAll(".reco-card"),
                        a = 0 < e.length;
                    e.forEach(function(e) {
                        var t = e.getAttribute("data-sku"),
                            o = e.querySelector(".add-to-bag"),
                            e = e.querySelector(".reco-card__check-btn");
                        o && e && (r.has(t) ? (e.classList.contains("reco-card__check-btn--hidden") && d("cafe_ja_adicionado_reco_minicart_" + t), o.classList.add("add-to-bag--hidden"), e.classList.remove("reco-card__check-btn--hidden")) : (a = !1, o.classList.remove("add-to-bag--hidden"), e.classList.add("reco-card__check-btn--hidden")))
                    }), a ? o.classList.contains("reco-panel--hiding") || (o.style.maxHeight = o.scrollHeight + "px", o.offsetHeight, o.classList.add("reco-panel--hiding"), o.addEventListener("transitionend", function e(t) {
                        "opacity" === t.propertyName && (o.style.display = "none", o.removeEventListener("transitionend", e))
                    }), setTimeout(function() {
                        o.classList.contains("reco-panel--hiding") && (o.style.display = "none")
                    }, 700)) : (o.classList.remove("reco-panel--hiding"), o.style.display = "", o.style.maxHeight = "")
                }
            }
            setTimeout(() => {
                clearInterval(o), window.napi || console.error("[MinicartReco] Nespresso API indisponível após 10s")
            }, 1e4)
        }
    }();