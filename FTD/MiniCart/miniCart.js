(function () {
  'use strict';

  var TARGET_ID = 450506;
  var ANCHOR_SELECTOR = '.actions-info';
  var SHELF_ID = 'wj-mini-shelf';
  var STYLE_ID = 'wj-mini-shelf-style';
  var CACHE_KEY = 'WJ_SHELF_CACHE_' + TARGET_ID;
  var CACHE_TTL_MS = 15 * 60 * 1000;

  var CSS =
    '\
#' +
    SHELF_ID +
    '{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;padding:12px;margin:12px 0;border:1px solid rgba(0,0,0,.08);border-radius:8px;background:#fff}\
#' +
    SHELF_ID +
    ' img{width:64px;height:64px;object-fit:contain;background:#fafafa;border-radius:6px;transition:opacity .15s ease}\
#' +
    SHELF_ID +
    ' .wj-title{font-size:14px;line-height:1.3;margin:0 0 6px 0;color:#222}\
#' +
    SHELF_ID +
    ' .wj-price{font-size:14px;font-weight:600;color:#111}\
#' +
    SHELF_ID +
    ' .wj-cta{display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 12px;border-radius:6px;border:1px solid #0a53be;background:#0d6efd;color:#fff;cursor:pointer;white-space:nowrap}\
#' +
    SHELF_ID +
    ' .wj-cta[disabled]{opacity:.6;cursor:default}\
';
  if (!document.getElementById(STYLE_ID)) {
    var sty = document.createElement('style');
    sty.id = STYLE_ID;
    sty.appendChild(document.createTextNode(CSS));
    document.head.appendChild(sty);
  }

  function fmtBRL(n) {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
    } catch (e) {
      return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
    }
  }
  function getCookie(name) {
    return document.cookie.split('; ').reduce(function (acc, cur) {
      var i = cur.indexOf('='),
        k = cur.substring(0, i),
        v = cur.substring(i + 1);
      if (k === name) acc = decodeURIComponent(v);
      return acc;
    }, '');
  }
  function getFormKey() {
    var ck = getCookie('form_key');
    if (ck) return ck;
    var el = document.querySelector('input[name="form_key"]');
    return el ? el.value : '';
  }
  function addToCart(productId, qty, extraParams) {
    var formKey = getFormKey();
    if (!formKey) {
      console.warn('form_key não encontrado, tentando buscar...');
      // Tenta buscar form_key novamente
      formKey = getFormKey();
    }

    var params = new URLSearchParams();
    if (formKey) params.set('form_key', formKey);
    params.set('product', String(productId));
    params.set('qty', String(qty || 1));

    if (extraParams && typeof extraParams === 'object') {
      Object.keys(extraParams).forEach(function (k) {
        var v = extraParams[k];
        if (Array.isArray(v))
          v.forEach(function (val) {
            params.append(k + '[]', val);
          });
        else if (v != null) params.set(k, v);
      });
    }

    return fetch('/checkout/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      credentials: 'same-origin',
      body: params.toString(),
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error('HTTP ' + res.status + ': ' + text.substring(0, 200));
        });
      }
      return res;
    });
  }
  function magentoCustomerData(cb) {
    if (!window.require) return cb(null);
    try {
      window.require(['Magento_Customer/js/customer-data'], function (cd) {
        cb(cd);
      });
    } catch (e) {
      cb(null);
    }
  }
  function reloadCartSection() {
    magentoCustomerData(function (cd) {
      if (cd) {
        try {
          cd.reload(['cart'], true);
        } catch (e) {}
      }
      fetch('/customer/section/load/?sections=cart').catch(function () {});
    });
  }

  function analyticsEvent(eventLabel, productId, productName) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[MiniCart] Missing parameters for analytics event.');
      return;
    }

    var labelEvent = 'AT_mini_cart ' + eventLabel;
    if (productId) {
      labelEvent += ' | Product ID: ' + productId;
    }
    if (productName) {
      labelEvent += ' | Product: ' + productName;
    }

    console.log('[MiniCart] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar7 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function fetchCartData() {
    return fetch('/customer/section/load/?sections=cart', { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('Cart fetch ' + res.status);
        return res.json();
      })
      .then(function (data) {
        return data && data.cart ? data.cart : null;
      })
      .catch(function (err) {
        console.warn('Erro ao buscar dados do carrinho:', err);
        return null;
      });
  }

  function getCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.t || Date.now() - obj.t > CACHE_TTL_MS) return null;
      return obj.v;
    } catch (e) {
      return null;
    }
  }
  function setCache(v) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: v }));
    } catch (e) {}
  }

  function fromCartByProductId(cartJson, productId) {
    if (!cartJson) return null;

    // Tenta primeiro em cart.items (formato padrão do Magento)
    if (Array.isArray(cartJson.items)) {
      var it = cartJson.items.find(function (i) {
        return Number(i.product_id) === Number(productId);
      });
      if (it) {
        return {
          id: Number(it.product_id),
          sku: it.product_sku || null,
          name: it.product_name || 'Produto',
          image: it.product_image && it.product_image.src ? it.product_image.src : '',
          priceNumber: Number(it.product_price_value || 0),
          priceFormatted: it.product_price_value ? fmtBRL(Number(it.product_price_value)) : '',
          url: it.product_url || null,
          qty: Number(it.qty || 1),
          item_id: it.item_id || null,
        };
      }
    }

    // Tenta em cart.ftd.data.miniCart.miniCartCommonItems (formato FTD)
    // Primeiro tenta encontrar o produto em cart.items para pegar o product_id
    var matchingCartItem = null;
    if (Array.isArray(cartJson.items)) {
      matchingCartItem = cartJson.items.find(function (i) {
        return Number(i.product_id) === Number(productId);
      });
    }

    if (
      cartJson.ftd &&
      cartJson.ftd.data &&
      cartJson.ftd.data.miniCart &&
      Array.isArray(cartJson.ftd.data.miniCart.miniCartCommonItems)
    ) {
      // Se encontrou o produto em cart.items, busca o miniCartItem correspondente
      var miniItem = null;
      if (matchingCartItem) {
        miniItem = cartJson.ftd.data.miniCart.miniCartCommonItems.find(function (i) {
          return (
            i.sku === matchingCartItem.product_sku ||
            Number(i.item_id) === Number(matchingCartItem.item_id)
          );
        });
      }

      // Se não encontrou, tenta buscar diretamente (caso o productId seja um item_id)
      if (!miniItem) {
        miniItem = cartJson.ftd.data.miniCart.miniCartCommonItems.find(function (i) {
          return Number(i.item_id) === Number(productId);
        });
      }

      if (miniItem) {
        // Usa o matchingCartItem se disponível, senão busca em cart.items
        var cartItem = matchingCartItem;
        if (!cartItem && Array.isArray(cartJson.items)) {
          cartItem = cartJson.items.find(function (i) {
            return i.product_sku === miniItem.sku || Number(i.item_id) === Number(miniItem.item_id);
          });
        }

        var priceNum = parseFloat(miniItem.price || 0);
        // Se o preço não estiver disponível no miniItem, tenta pegar do cartItem
        if (priceNum === 0 && cartItem && cartItem.product_price_value) {
          priceNum = Number(cartItem.product_price_value);
        }

        return {
          id: cartItem ? Number(cartItem.product_id) : Number(productId),
          sku: miniItem.sku || (cartItem ? cartItem.product_sku : null),
          name: miniItem.name || (cartItem ? cartItem.product_name : 'Produto'),
          image:
            miniItem.imageUrl ||
            (cartItem && cartItem.product_image && cartItem.product_image.src
              ? cartItem.product_image.src
              : ''),
          priceNumber: priceNum,
          priceFormatted: priceNum > 0 ? fmtBRL(priceNum) : '',
          url: miniItem.product_url || (cartItem ? cartItem.product_url : null),
          qty: Number(miniItem.qty || (cartItem ? cartItem.qty : 1)),
          item_id: miniItem.item_id || (cartItem ? cartItem.item_id : null),
        };
      }
    }

    return null;
  }

  function fetchPdpHtmlByIdOnce(id) {
    if (window.__WJ_PDP_PROMISE__) return window.__WJ_PDP_PROMISE__;
    window.__WJ_PDP_PROMISE__ = fetch(
      '/catalog/product/view/id/' + encodeURIComponent(String(id)),
      { credentials: 'same-origin' }
    )
      .then(function (r) {
        if (!r.ok) throw new Error('PDP HTML ' + r.status);
        return r.text();
      })
      .catch(function (err) {
        window.__WJ_PDP_PROMISE__ = null;
        throw err;
      });
    return window.__WJ_PDP_PROMISE__;
  }
  function parsePdp(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var data = { name: 'Produto', image: '', priceNumber: 0, priceFormatted: '' };

    var scripts = Array.prototype.slice.call(
      doc.querySelectorAll('script[type="application/ld+json"]')
    );
    for (var i = 0; i < scripts.length; i++) {
      try {
        var json = JSON.parse(scripts[i].textContent.trim());
        var list = Array.isArray(json) ? json : [json];
        for (var j = 0; j < list.length; j++) {
          var obj = list[j];
          var prod = null;
          if (obj && obj['@type'] === 'Product') prod = obj;
          if (!prod && obj && obj['@graph'] && Array.isArray(obj['@graph'])) {
            prod = obj['@graph'].find(function (n) {
              return n && n['@type'] === 'Product';
            });
          }
          if (prod) {
            if (prod.name) data.name = prod.name;
            if (prod.image) data.image = Array.isArray(prod.image) ? prod.image[0] : prod.image;
            var offers = prod.offers || null;
            if (offers) {
              if (Array.isArray(offers)) offers = offers[0];
              if (offers && offers.price) {
                var pn = parseFloat(String(offers.price).replace(',', '.'));
                if (Number.isFinite(pn)) {
                  data.priceNumber = pn;
                  data.priceFormatted = fmtBRL(pn);
                }
              }
            }
          }
        }
      } catch (e) {}
    }
    if (!data.image) {
      var og = doc.querySelector('meta[property="og:image"], meta[name="twitter:image"]');
      if (og && og.content) data.image = og.content;
    }
    if (!data.name || data.name === 'Produto') {
      var ogt = doc.querySelector('meta[property="og:title"]');
      if (ogt && ogt.content) data.name = ogt.content;
    }
    if (!data.priceNumber) {
      var metaPrice = doc.querySelector('[itemprop="price"]');
      if (metaPrice && metaPrice.getAttribute('content')) {
        var pn2 = parseFloat(metaPrice.getAttribute('content').replace(',', '.'));
        if (Number.isFinite(pn2)) {
          data.priceNumber = pn2;
          data.priceFormatted = fmtBRL(pn2);
        }
      } else {
        var priceEl = doc.querySelector('.price, .price-wrapper');
        if (priceEl) {
          var txt = priceEl.textContent.replace(/\s+/g, ' ').trim();
          var m = txt.match(/(\d{1,3}(\.\d{3})*|\d+)[,\.]\d{2}/);
          if (m) {
            var raw = m[0].replace(/\./g, '').replace(',', '.');
            var pn3 = parseFloat(raw);
            if (Number.isFinite(pn3)) {
              data.priceNumber = pn3;
              data.priceFormatted = fmtBRL(pn3);
            }
          }
        }
      }
    }
    return data;
  }

  function render(anchor, data) {
    if (!anchor) return;

    var wrap = document.getElementById(SHELF_ID);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = SHELF_ID;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Sugestão');

      var img = document.createElement('img');
      img.alt = data.name || 'Produto';
      img.style.opacity = '0';
      img.style.cursor = data.url ? 'pointer' : 'default';
      if (data.url) {
        img.addEventListener('click', function () {
          if (data.url) window.location.href = data.url;
        });
        img.title = 'Ver produto: ' + (data.name || 'Produto');
      }

      var info = document.createElement('div');
      var t = document.createElement(data.url ? 'a' : 'p');
      t.className = 'wj-title';
      if (data.url) {
        t.href = data.url;
        t.style.textDecoration = 'none';
        t.style.color = 'inherit';
        t.style.cursor = 'pointer';
      }
      t.textContent = data.name || 'Produto';
      var p = document.createElement('div');
      p.className = 'wj-price';
      p.textContent = data.priceFormatted || '';

      info.appendChild(t);
      info.appendChild(p);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wj-cta';
      btn.textContent = 'Adicionar';
      btn.dataset.productId = String(data.id || TARGET_ID);
      btn.addEventListener('click', function () {
        var productId = Number(btn.dataset.productId || TARGET_ID);
        var productName = data.name || 'Produto';

        // Tracking: clique no botão
        analyticsEvent('add_to_cart_click', productId, productName);

        btn.setAttribute('disabled', 'disabled');
        btn.textContent = 'Adicionando...';

        addToCart(productId, 1)
          .then(function (res) {
            reloadCartSection();
            btn.textContent = 'Adicionado!';

            // Tracking: sucesso ao adicionar
            analyticsEvent('add_to_cart_success', productId, productName);

            setTimeout(function () {
              btn.textContent = 'Adicionar';
              btn.removeAttribute('disabled');
            }, 1500);
          })
          .catch(function (err) {
            console.warn('Falha ao adicionar ao carrinho:', err);
            btn.textContent = 'Erro - Tentar novamente';

            // Tracking: erro ao adicionar
            analyticsEvent('add_to_cart_error', productId, productName);

            setTimeout(function () {
              btn.textContent = 'Adicionar';
              btn.removeAttribute('disabled');
            }, 2000);
          });
      });

      wrap.appendChild(img);
      wrap.appendChild(info);
      wrap.appendChild(btn);

      anchor.parentElement.insertBefore(wrap, anchor);

      img.addEventListener('load', function () {
        img.style.opacity = '1';
        img.dataset.locked = '1';
      });
    }

    // Atualiza textos apenas se vazio
    var titleEl = wrap.querySelector('.wj-title');
    var priceEl = wrap.querySelector('.wj-price');
    var btnEl = wrap.querySelector('.wj-cta');

    if (data.name && (!titleEl.textContent || titleEl.textContent === 'Produto')) {
      titleEl.textContent = data.name;
    }
    if (data.url && titleEl.tagName === 'A' && titleEl.href !== data.url) {
      titleEl.href = data.url;
    }
    if (data.priceFormatted && (!priceEl.textContent || priceEl.textContent.trim() === '')) {
      priceEl.textContent = data.priceFormatted;
    }
    if (btnEl && data.id) {
      btnEl.dataset.productId = String(data.id);
    }

    // Trava de imagem, define apenas uma vez
    var imgEl = wrap.querySelector('img');
    if (imgEl && data.image && !imgEl.dataset.locked) {
      // usa preload para evitar piscar
      var pre = new Image();
      pre.onload = function () {
        if (!imgEl.dataset.locked) {
          imgEl.src = data.image;
        }
      };
      pre.src = data.image;
    }
  }

  function mountOnceWithData(data) {
    var anchor = document.querySelector(ANCHOR_SELECTOR);
    if (!anchor) return;
    render(anchor, data);
  }

  var debounceTimer = null;
  function debounced(fn, wait) {
    return function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fn, wait);
    };
  }

  var run = debounced(function () {
    var anchor = document.querySelector(ANCHOR_SELECTOR);
    if (!anchor) return;

    // 1, tenta cache
    var cached = getCache();
    if (cached) {
      mountOnceWithData(cached);
      return;
    }

    // 2, tenta customer data
    magentoCustomerData(function (cd) {
      var cart = cd && cd.get ? cd.get('cart')() : null;
      var fromCart = fromCartByProductId(cart, TARGET_ID);
      if (fromCart) {
        setCache(fromCart);
        mountOnceWithData(fromCart);
        return;
      }

      // 3, busca diretamente do endpoint /customer/section/load/?sections=cart
      fetchCartData()
        .then(function (cartData) {
          if (cartData) {
            var fromCartApi = fromCartByProductId(cartData, TARGET_ID);
            if (fromCartApi) {
              setCache(fromCartApi);
              mountOnceWithData(fromCartApi);
              return;
            }
          }
          // 4, se não encontrou no carrinho, busca PDP
          return fetchPdpHtmlByIdOnce(TARGET_ID)
            .then(parsePdp)
            .then(function (pdpData) {
              setCache(pdpData);
              mountOnceWithData(pdpData);
            });
        })
        .catch(function (err) {
          console.warn('Erro ao buscar dados:', err);
          // Fallback para PDP mesmo em caso de erro
          fetchPdpHtmlByIdOnce(TARGET_ID)
            .then(parsePdp)
            .then(function (pdpData) {
              setCache(pdpData);
              mountOnceWithData(pdpData);
            })
            .catch(function () {
              mountOnceWithData({ name: 'Produto', image: '', priceFormatted: '' });
            });
        });
    });
  }, 150);

  var mo = new MutationObserver(run);
  mo.observe(document.body, { childList: true, subtree: true });

  run();
})();
