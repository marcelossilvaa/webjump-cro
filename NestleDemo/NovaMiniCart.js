(function () {
  "use strict";

  // ===================== CSS =====================
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

    .nmc-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 9998;
      opacity: 0;
      visibility: hidden;
      transition: opacity .3s, visibility .3s;
    }
    .nmc-overlay.nmc-open {
      opacity: 1;
      visibility: visible;
    }

    .nmc-cart {
      position: fixed;
      top: 0;
      right: -472px;
      width: 472px;
      height: 100vh;
      z-index: 9999;
      background: #FFFFFF;
      box-shadow: 0px 0px 16px rgba(0,0,0,0.55);
      border-radius: 20px 0px 0px 20px;
      display: flex;
      flex-direction: column;
      font-family: 'Lato', sans-serif;
      transition: right .35s ease;
      overflow: hidden;
    }
    .nmc-cart.nmc-open {
      right: 0;
    }

    /* ---- HEADER ---- */
    .nmc-header {
      background: #F5F7F9;
      border-radius: 20px 0px 0px 0px;
      padding: 24px 40px 32px;
      flex-shrink: 0;
      position: relative;
    }
    .nmc-header__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nmc-header__title {
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
      color: #173C56;
    }
    .nmc-header__close {
      width: 24px;
      height: 24px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .nmc-header__close svg {
      width: 12px;
      height: 12px;
      fill: #173C56;
    }
    .nmc-progress {
      margin-top: 24px;
    }
    .nmc-progress__bar {
      width: 100%;
      height: 12px;
      background: #E9EBF8;
      border-radius: 88px;
      overflow: hidden;
    }
    .nmc-progress__fill {
      height: 100%;
      background: #004E99;
      border-radius: 88px;
      transition: width .4s ease;
    }
    .nmc-progress__label {
      margin-top: 12px;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      color: #173C56;
    }
    .nmc-progress__label strong {
      font-weight: 700;
    }

    /* ---- ITEMS AREA ---- */
    .nmc-items {
      flex: 1;
      overflow-y: auto;
      padding: 24px 40px;
    }
    .nmc-item {
      display: flex;
      gap: 16px;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(148,165,177,0.5);
    }
    .nmc-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .nmc-item__img-wrap {
      width: 97px;
      height: 97px;
      flex-shrink: 0;
      border: 1px solid #E9EBF8;
      border-radius: 8px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .nmc-item__img-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .nmc-item__info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }
    .nmc-item__top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .nmc-item__name {
      font-weight: 400;
      font-size: 16px;
      line-height: 18px;
      color: #173C56;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 223px;
    }
    .nmc-item__delete {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nmc-item__delete svg {
      width: 14px;
      height: 18px;
      fill: #173C56;
    }
    .nmc-item__price {
      font-weight: 700;
      font-size: 18px;
      line-height: 18px;
      color: #173C56;
    }
    .nmc-item__qty-row {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .nmc-qty-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #E9EBF8;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
    }
    .nmc-qty-btn svg {
      fill: #173C56;
    }
    .nmc-qty-input {
      width: 96px;
      height: 32px;
      background: #FFFFFF;
      border: 1px solid #173C56;
      border-radius: 8px;
      text-align: center;
      font-family: 'Lato', sans-serif;
      font-weight: 400;
      font-size: 16px;
      line-height: 20px;
      color: #173C56;
      margin: 0 10px;
      outline: none;
    }
    .nmc-item__subscription {
      width: 100%;
      height: 30px;
      background: #F5F7F9;
      border: 1px solid #004E99;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      cursor: pointer;
      box-sizing: border-box;
    }
    .nmc-item__subscription span {
      font-weight: 400;
      font-size: 13px;
      line-height: 16px;
      color: #004E99;
    }
    .nmc-item__subscription svg {
      width: 8px;
      height: 5px;
      fill: none;
      stroke: #004E99;
      stroke-width: 2;
    }

    /* ---- RECOMMENDATIONS ---- */
    .nmc-recs {
      background: #F5F7F9;
      flex-shrink: 0;
      padding: 22px 0 24px;
    }
    .nmc-recs__title {
      font-weight: 400;
      font-size: 16px;
      line-height: 18px;
      color: #173C56;
      padding: 0 40px;
      margin-bottom: 12px;
    }
    .nmc-recs__list {
      display: flex;
      gap: 12px;
      padding: 0 40px;
      overflow-x: auto;
    }
    .nmc-recs__list::-webkit-scrollbar { height: 4px; }
    .nmc-recs__list::-webkit-scrollbar-thumb { background: #94A5B1; border-radius: 4px; }

    .nmc-rec-card {
      width: 140px;
      min-width: 140px;
      background: #FFFFFF;
      border: 1px solid #E9EBF8;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      padding: 12px;
      box-sizing: border-box;
    }
    .nmc-rec-card__img {
      width: 100%;
      height: 97px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .nmc-rec-card__img img {
      max-width: 68px;
      max-height: 96px;
      object-fit: contain;
    }
    .nmc-rec-card__name {
      font-weight: 400;
      font-size: 11px;
      line-height: 13px;
      color: #173C56;
      height: 26px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .nmc-rec-card__prices {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .nmc-rec-card__old-price {
      font-weight: 400;
      font-size: 10px;
      line-height: 12px;
      color: #173C56;
      text-decoration: line-through;
    }
    .nmc-rec-card__price {
      font-weight: 700;
      font-size: 13px;
      line-height: 16px;
      color: #173C56;
    }
    .nmc-rec-card__cta {
      width: 100%;
      height: 32px;
      background: #173C56;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: auto;
    }
    .nmc-rec-card__cta svg {
      width: 14px;
      height: 14px;
      fill: #FFFFFF;
    }
    .nmc-rec-card__cta span {
      font-family: 'Lato', sans-serif;
      font-weight: 700;
      font-size: 13px;
      line-height: 20px;
      color: #FFFFFF;
    }

    /* ---- FOOTER ---- */
    .nmc-footer {
      background: #FFFFFF;
      box-shadow: 0px -4px 22.9px rgba(0,0,0,0.15);
      border-radius: 0px 0px 0px 20px;
      padding: 24px 40px;
      flex-shrink: 0;
    }
    .nmc-footer__subtotal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .nmc-footer__subtotal-label {
      font-weight: 400;
      font-size: 24px;
      line-height: 29px;
      color: #173C56;
    }
    .nmc-footer__subtotal-value {
      font-weight: 700;
      font-size: 24px;
      line-height: 29px;
      color: #173C56;
    }
    .nmc-footer__checkout {
      width: 100%;
      height: 48px;
      background: #173C56;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      font-family: 'Lato', sans-serif;
      font-weight: 700;
      font-size: 18px;
      line-height: 20px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .nmc-footer__view-cart {
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Lato', sans-serif;
      font-weight: 700;
      font-size: 18px;
      line-height: 20px;
      color: #173C56;
      text-align: center;
      padding: 0;
    }
  `;

  // ===================== SVG ICONS =====================
  const iconClose = `<svg viewBox="0 0 12 12"><path d="M11.4 .6a.7.7 0 0 0-1 0L6 5 1.6.6a.7.7 0 1 0-1 1L5 6 .6 10.4a.7.7 0 1 0 1 1L6 7l4.4 4.4a.7.7 0 1 0 1-1L7 6l4.4-4.4a.7.7 0 0 0 0-1z"/></svg>`;
  const iconTrash = `<svg viewBox="0 0 14 18"><path d="M1 16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4H1v12zM3 6h8v10H3V6zM10.5 1l-1-1h-5l-1 1H0v2h14V1h-3.5z"/></svg>`;
  const iconMinus = `<svg width="13" height="2" viewBox="0 0 13 2"><rect width="13" height="1.5" rx=".75"/></svg>`;
  const iconPlus = `<svg width="13" height="13" viewBox="0 0 13 13"><path d="M5.75 0v5.75H0v1.5h5.75V13h1.5V7.25H13v-1.5H7.25V0z"/></svg>`;
  const iconCart = `<svg viewBox="0 0 14 14"><path d="M4.33 11.67a1.17 1.17 0 1 0 0 2.33 1.17 1.17 0 0 0 0-2.33zm7 0a1.17 1.17 0 1 0 0 2.33 1.17 1.17 0 0 0 0-2.33zm-7-1.17l.01-.06.52-1.04h5.74a1.16 1.16 0 0 0 1.02-.6l2.62-4.75a.58.58 0 0 0-.51-.85H3.29l-.69-1.46H0v1.17h1.17l2.1 4.43-0.79 1.43a1.16 1.16 0 0 0 1.02 1.73h8.17V9.33H4.72a.15.15 0 0 1-.13-.08l-.01-.03.75-1.39z"/></svg>`;
  const iconChevron = `<svg viewBox="0 0 8 5"><polyline points="1,1 4,4 7,1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // ===================== SAMPLE DATA =====================
  const cartItems = [
    {
      name: "Composto Lácteo NINHO Fases Zero Lactose 700g",
      price: "R$ 68,00",
      priceNum: 68.0,
      qty: 2,
      img: "https://www.nestlenutre.com.br/media/catalog/product/cache/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/n/i/ninho_fases_zero_lactose_700g.png",
      subscription: "Assine e economize 10%",
    },
    {
      name: "Fórmula Infantil de primeira infância Nanlac® Comfor 800g",
      price: "R$ 69,49",
      priceNum: 69.49,
      qty: 1,
      img: "https://www.nestlenutre.com.br/media/catalog/product/cache/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/n/a/nanlac_comfor_800g.png",
      subscription: "Assine e economize 10%",
    },
  ];

  const recommendations = [
    {
      name: "Composto Lácteo Neslac Supreme 800g",
      price: "R$ 76,29",
      oldPrice: "R$ 84,77",
      img: "https://www.nestlenutre.com.br/media/catalog/product/cache/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/n/e/neslac_supreme_800g.png",
    },
    {
      name: "Composto Lácteo Neslac Supreme 800g",
      price: "R$ 76,29",
      oldPrice: null,
      img: "https://www.nestlenutre.com.br/media/catalog/product/cache/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/n/e/neslac_supreme_800g.png",
    },
    {
      name: "Composto Lácteo Neslac Supreme 800g",
      price: "R$ 76,29",
      oldPrice: null,
      img: "https://www.nestlenutre.com.br/media/catalog/product/cache/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/n/e/neslac_supreme_800g.png",
    },
  ];

  const freeShippingThreshold = 300;

  // ===================== HELPERS =====================
  function calcSubtotal() {
    return cartItems.reduce((sum, item) => sum + item.priceNum * item.qty, 0);
  }

  function calcProgress() {
    const sub = calcSubtotal();
    const remaining = Math.max(freeShippingThreshold - sub, 0);
    const pct = Math.min((sub / freeShippingThreshold) * 100, 100);
    return { remaining, pct };
  }

  function formatBRL(value) {
    return (
      "R$ " +
      value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }

  // ===================== BUILD HTML =====================
  function buildItemHTML(item, idx) {
    return `
      <div class="nmc-item" data-idx="${idx}">
        <div class="nmc-item__img-wrap">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="nmc-item__info">
          <div class="nmc-item__top-row">
            <div class="nmc-item__name">${item.name}</div>
            <button class="nmc-item__delete" data-idx="${idx}" title="Remover">${iconTrash}</button>
          </div>
          <div class="nmc-item__price">${item.price}</div>
          <div class="nmc-item__qty-row">
            <button class="nmc-qty-btn nmc-qty-minus" data-idx="${idx}">${iconMinus}</button>
            <input class="nmc-qty-input" type="text" value="${item.qty}" readonly data-idx="${idx}">
            <button class="nmc-qty-btn nmc-qty-plus" data-idx="${idx}">${iconPlus}</button>
          </div>
          <div class="nmc-item__subscription">
            <span>${item.subscription}</span>
            ${iconChevron}
          </div>
        </div>
      </div>
    `;
  }

  function buildRecHTML(rec) {
    return `
      <div class="nmc-rec-card">
        <div class="nmc-rec-card__img"><img src="${rec.img}" alt="${rec.name}"></div>
        <div class="nmc-rec-card__name">${rec.name}</div>
        <div class="nmc-rec-card__prices">
          ${rec.oldPrice ? `<span class="nmc-rec-card__old-price">${rec.oldPrice}</span>` : ""}
          <span class="nmc-rec-card__price">${rec.price}</span>
        </div>
        <button class="nmc-rec-card__cta">${iconCart}<span>Adicionar</span></button>
      </div>
    `;
  }

  function getCartCount() {
    return cartItems.reduce((s, i) => s + i.qty, 0);
  }

  function renderCart() {
    const { remaining, pct } = calcProgress();
    const subtotal = calcSubtotal();

    return `
      <div class="nmc-header">
        <div class="nmc-header__top">
          <span class="nmc-header__title">Seu carrinho (${getCartCount()})</span>
          <button class="nmc-header__close" id="nmcClose">${iconClose}</button>
        </div>
        <div class="nmc-progress">
          <div class="nmc-progress__bar">
            <div class="nmc-progress__fill" style="width:${pct}%"></div>
          </div>
          <div class="nmc-progress__label">
            ${remaining > 0 ? `Faltam <strong>${formatBRL(remaining)}</strong> para Frete Grátis` : `<strong>Parabéns!</strong> Você ganhou Frete Grátis`}
          </div>
        </div>
      </div>

      <div class="nmc-items" id="nmcItems">
        ${cartItems.map((item, i) => buildItemHTML(item, i)).join("")}
      </div>

      <div class="nmc-recs">
        <div class="nmc-recs__title">Aproveite e leve também</div>
        <div class="nmc-recs__list">
          ${recommendations.map(buildRecHTML).join("")}
        </div>
      </div>

      <div class="nmc-footer">
        <div class="nmc-footer__subtotal">
          <span class="nmc-footer__subtotal-label">Subtotal</span>
          <span class="nmc-footer__subtotal-value">${formatBRL(subtotal)}</span>
        </div>
        <button class="nmc-footer__checkout" id="nmcCheckout">Fechar pedido</button>
        <button class="nmc-footer__view-cart" id="nmcViewCart">Ver carrinho</button>
      </div>
    `;
  }

  // ===================== INIT =====================
  function init() {
    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "nmc-overlay";
    overlay.id = "nmcOverlay";
    document.body.appendChild(overlay);

    // Create cart container
    const cart = document.createElement("div");
    cart.className = "nmc-cart";
    cart.id = "nmcCart";
    cart.innerHTML = renderCart();
    document.body.appendChild(cart);

    // ---- OPEN / CLOSE ----
    function openCart() {
      overlay.classList.add("nmc-open");
      cart.classList.add("nmc-open");
      document.body.style.overflow = "hidden";
    }

    function closeCart() {
      overlay.classList.remove("nmc-open");
      cart.classList.remove("nmc-open");
      document.body.style.overflow = "";
    }

    function refreshCart() {
      cart.innerHTML = renderCart();
      bindEvents();
    }

    // ---- EVENTS ----
    function bindEvents() {
      // Close button
      const closeBtn = document.getElementById("nmcClose");
      if (closeBtn) closeBtn.addEventListener("click", closeCart);

      // Delete buttons
      cart.querySelectorAll(".nmc-item__delete").forEach((btn) => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.dataset.idx);
          cartItems.splice(idx, 1);
          refreshCart();
        });
      });

      // Minus buttons
      cart.querySelectorAll(".nmc-qty-minus").forEach((btn) => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.dataset.idx);
          if (cartItems[idx].qty > 1) {
            cartItems[idx].qty--;
            refreshCart();
          }
        });
      });

      // Plus buttons
      cart.querySelectorAll(".nmc-qty-plus").forEach((btn) => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.dataset.idx);
          cartItems[idx].qty++;
          refreshCart();
        });
      });

      // Checkout
      const checkoutBtn = document.getElementById("nmcCheckout");
      if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function () {
          window.location.href = "https://www.nestlenutre.com.br/checkout/";
        });
      }

      // View cart
      const viewCartBtn = document.getElementById("nmcViewCart");
      if (viewCartBtn) {
        viewCartBtn.addEventListener("click", function () {
          window.location.href = "https://www.nestlenutre.com.br/checkout/cart/";
        });
      }
    }

    bindEvents();

    // Overlay click closes cart
    overlay.addEventListener("click", closeCart);

    // Intercept minicart link click
    const minicartLink = document.querySelector(".minicart-link .action.showcart");
    if (minicartLink) {
      minicartLink.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openCart();
      });
    }
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
