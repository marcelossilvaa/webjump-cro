(function () {
  'use strict';

  // IDs dos produtos disponíveis
  var PRODUCT_IDS = {
    MINIDICIONARIO: 56551,
    DICIONARIO_INGLES: 53959,
    ESTUDA_COM_ANUAL: 1213247,
    NUMERODROMO: 52150,
    BICHODARIO: 52144,
    TABUADA_A: 54595,
    TABUADA_B: 54598,
    TABUADA_C: 54601,
    TABUADA_D: 54604,
  };

  // Mapeamento de nível escolar para produtos recomendados
  // Formato: { gradeLevel: { primary: [id1, id2], secondary: [id3, id4] } }
  // Baseado na tabela: Nível -> Série -> Idade -> Literatura 1 -> Literatura 2
  var GRADE_RECOMMENDATIONS = {
    // Educação Infantil - 1 ano
    1: {
      primary: [],
      secondary: null,
    },
    // Educação Infantil - 2 anos
    2: {
      primary: [],
      secondary: null,
    },
    // Educação Infantil - 3 anos / Pré Escola 4 anos
    3: {
      primary: [PRODUCT_IDS.NUMERODROMO, PRODUCT_IDS.BICHODARIO],
      secondary: null,
    },
    // Pré Escola - 4 anos
    4: {
      primary: [PRODUCT_IDS.NUMERODROMO, PRODUCT_IDS.BICHODARIO],
      secondary: null,
    },
    // Pré Escola - 5 anos
    5: {
      primary: [PRODUCT_IDS.NUMERODROMO, PRODUCT_IDS.BICHODARIO],
      secondary: null,
    },
    // 1º Série / 1º ano - Anos iniciais (6 anos)
    6: {
      primary: [PRODUCT_IDS.MINIDICIONARIO],
      secondary: [PRODUCT_IDS.TABUADA_A], // No capricho A + Que vergonha que dá!
    },
    // 2º Série / 2º ano - Anos iniciais (7 anos)
    7: {
      primary: [PRODUCT_IDS.MINIDICIONARIO],
      secondary: [PRODUCT_IDS.TABUADA_A, PRODUCT_IDS.TABUADA_B], // Nós e a tabuada 1 + No capricho B
    },
    // 3º Série / 3º ano - Anos iniciais (8 anos)
    8: {
      primary: [PRODUCT_IDS.MINIDICIONARIO],
      secondary: [PRODUCT_IDS.TABUADA_B, PRODUCT_IDS.TABUADA_C], // Nós e a tabuada 2 + No capricho C
    },
    // 4º Série / 4º ano - Anos iniciais (9 anos)
    9: {
      primary: [PRODUCT_IDS.MINIDICIONARIO],
      secondary: [PRODUCT_IDS.TABUADA_C, PRODUCT_IDS.TABUADA_D], // Nós e a tabuada 3 + No capricho D
    },
    // 5º Série / 5º ano - Anos iniciais (10 anos)
    10: {
      primary: [PRODUCT_IDS.MINIDICIONARIO],
      secondary: [PRODUCT_IDS.TABUADA_D], // Nós e a tabuada 4 + No capricho E
    },
    // 6º Série / 6º ano - Anos finais (11 anos)
    11: {
      primary: [PRODUCT_IDS.MINIDICIONARIO],
      secondary: null, // Peter Pan + Mágico de Oz (não temos IDs)
    },
    // 7º Série / 7º ano - Anos finais (12 anos)
    12: {
      primary: [PRODUCT_IDS.DICIONARIO_INGLES],
      secondary: null, // Peter Pan + Mágico de Oz (não temos IDs)
    },
    // 8º Série / 8º ano - Anos finais (13 anos)
    13: {
      primary: [PRODUCT_IDS.DICIONARIO_INGLES],
      secondary: null, // Peter Pan + Mágico de Oz (não temos IDs)
    },
    // 9º Série / 9º ano - Anos finais (14 anos)
    14: {
      primary: [PRODUCT_IDS.DICIONARIO_INGLES],
      secondary: null, // Peter Pan + Mágico de Oz (não temos IDs)
    },
    // Ensino Médio 1 / 1º Colegial (15 anos)
    15: {
      primary: [PRODUCT_IDS.ESTUDA_COM_ANUAL],
      secondary: null, // Estuda.com Semestral (não temos ID)
    },
    // Ensino Médio 2 / 2º Colegial (16 anos)
    16: {
      primary: [PRODUCT_IDS.ESTUDA_COM_ANUAL],
      secondary: null, // Estuda.com Semestral (não temos ID)
    },
    // Ensino Médio 3 / 3º Colegial (17 anos)
    17: {
      primary: [PRODUCT_IDS.ESTUDA_COM_ANUAL],
      secondary: null, // Estuda.com Semestral (não temos ID)
    },
  };

  var TARGET_ID = 52582; // Valor padrão, será atualizado dinamicamente
  var ANCHOR_SELECTOR = '.actions-info';
  var SHELF_ID = 'wj-mini-shelf';
  var STYLE_ID = 'wj-mini-shelf-style';
  var CACHE_KEY = 'WJ_SHELF_CACHE_' + TARGET_ID;
  var CACHE_TTL_MS = 15 * 60 * 1000;

  // Variável global para armazenar o nível escolar detectado
  var DETECTED_GRADE_LEVEL = null;
  // Variável global para armazenar o último produto recomendado
  var LAST_RECOMMENDED_PRODUCT_ID = null;
  // Variável para armazenar o produto recomendado inicialmente (não muda quando o produto é adicionado)
  var INITIAL_RECOMMENDED_PRODUCT_ID = null;
  // Hash do estado do carrinho quando a recomendação inicial foi feita
  var INITIAL_RECOMMENDATION_CART_STATE = null;

  // Mapa de studentId → gradeLevel (dados da API /rest/V1/students/mine)
  var STUDENT_GRADE_MAP = {};
  var STUDENTS_DATA_LOADED = false;
  var STUDENTS_DATA_LOADING = false;

  var CSS =
    '\
#' +
    SHELF_ID +
    '{display:flex; flex-direction: column; gap:12px;padding:12px 0;border-top:var(--border-width-hairline) solid var(--color-neutral-300);background:#fff;font-family:var(--font-source-poppins);font-size:16px;max-width: calc(100% - 48px);margin: 0 auto; margin-top: 15px; width: 100%;}\
#' +
    SHELF_ID +
    ' .wj-copy-header{margin:0;padding:2px;color: var(--color-brand-secondary);font-family: var(--font-source-poppins);font-size: var(--font-action-md);font-weight: 500;}\
#' +
    SHELF_ID +
    ' .wj-product-content{display:flex;gap:18px;align-items:center;justify-content:space-between;width:100%;}\
#' +
    SHELF_ID +
    ' img{width:72px;height:72px;object-fit:contain;background:#fafafa;border-radius:6px;transition:opacity .15s ease}\
#' +
    SHELF_ID +
    ' .wj-title{font-size:14px;line-height:1.3;margin:0 0 6px 0;color:var(--color-brand-primary-700)!important;font-weight:600!important;}\
#' +
    SHELF_ID +
    ' .wj-price{font-size:16px;font-weight:600;color:var(--color-neutral-800)!important;}\
#' +
    SHELF_ID +
    ' .wj-cta{display:inline-flex;align-items:center;justify-content:center;height:48px;min-width:48px;border-radius:6px;border:1px solid #0a53be;background:var(--color-brand-primary-500);color:#fff;cursor:pointer;white-space:nowrap;} .wj-cta:hover{background:var(--color-brand-primary-600);}\
#' +
    SHELF_ID +
    ' .wj-cta[disabled]{opacity:.6;cursor:default}\
#' +
    SHELF_ID +
    ' .wj-cta .action-label{display:inline-flex;align-items:center;justify-content:center}\
#' +
    SHELF_ID +
    ' .wj-cta{position:relative}\
#' +
    SHELF_ID +
    ' .wj-cta .plus-icon{position:absolute;right:11px;bottom:10px;background:url(https://mcstaging.lumisfera.com.br/static/version1762519331/frontend/FTD/lumi/pt_BR/images/svg/icon-add-cart-plus.svg) no-repeat center;width:11px;height:16px;display:inline-block}\
#' +
    SHELF_ID +
    ' .wj-cta .cart-icon{background:url(https://mcstaging.lumisfera.com.br/static/version1762519331/frontend/FTD/lumi/pt_BR/images/svg/icon-add-cart-empty.svg) no-repeat center;width:24px;height:24px;display:inline-block}\
@keyframes wj-fadeout{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-10px)}}\
#' +
    SHELF_ID +
    '.wj-hiding{animation:wj-fadeout 0.5s ease-out forwards}\
';
  if (!document.getElementById(STYLE_ID)) {
    var sty = document.createElement('style');
    sty.id = STYLE_ID;
    sty.appendChild(document.createTextNode(CSS));
    document.head.appendChild(sty);
  }

  // Função auxiliar para criar os ícones do botão
  function createButtonIcons() {
    var actionLabel = document.createElement('span');
    actionLabel.className = 'action-label';

    var plusIcon = document.createElement('span');
    plusIcon.className = 'plus-icon';
    actionLabel.appendChild(plusIcon);

    var cartIcon = document.createElement('span');
    cartIcon.className = 'cart-icon';

    return { actionLabel: actionLabel, cartIcon: cartIcon };
  }

  // Função auxiliar para atualizar o conteúdo do botão
  function updateButtonContent(btn, state) {
    // Limpa o conteúdo anterior
    btn.innerHTML = '';

    if (state === 'default' || state === 'add') {
      // Estado padrão: mostra os ícones
      var icons = createButtonIcons();
      btn.appendChild(icons.actionLabel);
      btn.appendChild(icons.cartIcon);
    } else if (state === 'adding') {
      // Estado de carregamento: mostra apenas os ícones (pode adicionar animação depois)
      var icons = createButtonIcons();
      btn.appendChild(icons.actionLabel);
      btn.appendChild(icons.cartIcon);
    } else if (state === 'added') {
      // Estado de sucesso: mostra os ícones
      var icons = createButtonIcons();
      btn.appendChild(icons.actionLabel);
      btn.appendChild(icons.cartIcon);
    } else if (state === 'error') {
      // Estado de erro: mostra os ícones (ou pode manter texto de erro)
      var icons = createButtonIcons();
      btn.appendChild(icons.actionLabel);
      btn.appendChild(icons.cartIcon);
    }
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
    // Tenta múltiplas fontes para obter o form_key mais recente

    // 1. Tenta buscar de inputs hidden na página
    var inputs = document.querySelectorAll('input[name="form_key"]');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].value && inputs[i].value.trim()) {
        return inputs[i].value.trim();
      }
    }

    // 2. Tenta buscar de formulários
    var forms = document.querySelectorAll('form');
    for (var j = 0; j < forms.length; j++) {
      var formInput = forms[j].querySelector('input[name="form_key"]');
      if (formInput && formInput.value && formInput.value.trim()) {
        return formInput.value.trim();
      }
    }

    // 3. Tenta buscar do cookie
    var ck = getCookie('form_key');
    if (ck && ck.trim()) {
      return ck.trim();
    }

    // 4. Tenta buscar de meta tags ou scripts (alguns sites colocam aqui)
    var metaFormKey = document.querySelector('meta[name="form_key"]');
    if (metaFormKey && metaFormKey.content) {
      return metaFormKey.content.trim();
    }

    return '';
  }

  // Função para buscar um novo form_key do servidor
  function fetchNewFormKey() {
    return fetch(window.location.href, {
      method: 'GET',
      credentials: 'same-origin',
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        // Tenta extrair form_key do HTML
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        // Busca em inputs
        var inputs = doc.querySelectorAll('input[name="form_key"]');
        for (var i = 0; i < inputs.length; i++) {
          if (inputs[i].value && inputs[i].value.trim()) {
            return inputs[i].value.trim();
          }
        }

        // Busca em scripts (alguns sites injetam via JS)
        var scripts = doc.querySelectorAll('script');
        for (var j = 0; j < scripts.length; j++) {
          var scriptText = scripts[j].textContent || '';
          var match = scriptText.match(/form[_-]?key['":\s]*[:=]\s*['"]([^'"]+)['"]/i);
          if (match && match[1]) {
            return match[1].trim();
          }
        }

        return null;
      })
      .catch(function (err) {
        console.warn('[MiniCart] Erro ao buscar novo form_key:', err);
        return null;
      });
  }

  // Função para buscar dados dos estudantes e mapear studentId → gradeLevel
  function fetchStudentsData() {
    if (STUDENTS_DATA_LOADED || STUDENTS_DATA_LOADING) {
      console.log('[MiniCart] Dados dos estudantes já carregados ou em carregamento');
      return Promise.resolve(STUDENT_GRADE_MAP);
    }

    STUDENTS_DATA_LOADING = true;
    console.log('[MiniCart] Buscando dados dos estudantes da API...');

    var timestamp = Date.now();
    // API retorna apenas estudantes do usuário logado (via sessão/cookie)
    // pageSize=100 é mais que suficiente (maioria dos usuários tem < 10 estudantes)
    var url = '/rest/V1/students/mine?searchCriteria[pageSize]=100&_=' + timestamp;

    return fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        console.log('[MiniCart] Dados dos estudantes recebidos:', {
          totalStudents: data.items ? data.items.length : 0,
        });

        if (!data.items || !Array.isArray(data.items)) {
          console.warn('[MiniCart] Resposta da API de estudantes sem items válidos');
          STUDENTS_DATA_LOADED = true;
          STUDENTS_DATA_LOADING = false;
          return STUDENT_GRADE_MAP;
        }

        // Mapeia studentId → gradeLevel
        data.items.forEach(function (student) {
          var studentId = student.entity_id;
          var adoptionLists = student.extension_attributes
            ? student.extension_attributes.adoption_lists
            : null;

          if (!adoptionLists || !Array.isArray(adoptionLists) || adoptionLists.length === 0) {
            console.log('[MiniCart] Estudante sem adoption_lists:', {
              id: studentId,
              name: student.name,
            });
            return;
          }

          // Pega a primeira adoption_list (a mais recente)
          var adoptionList = adoptionLists[0];
          var schoolGrade = adoptionList.extension_attributes
            ? adoptionList.extension_attributes.school_grade
            : null;

          if (!schoolGrade || !schoolGrade.title) {
            console.log('[MiniCart] Estudante sem school_grade:', {
              id: studentId,
              name: student.name,
            });
            return;
          }

          // Armazena o mapeamento
          STUDENT_GRADE_MAP[studentId] = schoolGrade.title;
          console.log('[MiniCart] Mapeado estudante:', {
            id: studentId,
            name: student.name,
            gradeLevel: schoolGrade.title,
            level: schoolGrade.level,
          });
        });

        console.log('[MiniCart] Mapa de estudantes criado:', {
          totalMapped: Object.keys(STUDENT_GRADE_MAP).length,
          map: STUDENT_GRADE_MAP,
        });

        STUDENTS_DATA_LOADED = true;
        STUDENTS_DATA_LOADING = false;
        return STUDENT_GRADE_MAP;
      })
      .catch(function (error) {
        console.error('[MiniCart] Erro ao buscar dados dos estudantes:', error);
        STUDENTS_DATA_LOADING = false;
        // Não marca como loaded para permitir retry
        return STUDENT_GRADE_MAP;
      });
  }

  // Função para adicionar ao carrinho via AJAX (sem redirecionar)
  function addToCartViaAjax(productId, qty, uenc, formKey) {
    // Se form_key não foi passado, tenta buscar
    if (!formKey) {
      // Prioriza formulários de "adicionar ao carrinho" existentes
      var addToCartForms = document.querySelectorAll(
        'form[action*="cart/add"], form[data-role="tocart-form"]'
      );
      for (var i = 0; i < addToCartForms.length; i++) {
        var formInput = addToCartForms[i].querySelector('input[name="form_key"]');
        if (formInput && formInput.value && formInput.value.trim()) {
          formKey = formInput.value.trim();
          break;
        }
      }

      // Se não encontrou, usa getFormKey()
      if (!formKey) {
        formKey = getFormKey();
      }
    }

    if (!formKey) {
      console.error('[MiniCart] form_key não encontrado para requisição AJAX');
      return Promise.reject(new Error('form_key não encontrado'));
    }

    // Monta a URL no formato do Magento
    var url =
      '/checkout/cart/add/uenc/' + encodeURIComponent(uenc) + '/product/' + String(productId);

    // Monta os parâmetros
    var params = new URLSearchParams();
    params.set('form_key', formKey);
    params.set('product', String(productId));
    params.set('qty', String(qty || 1));
    params.set('uenc', uenc);

    // Adiciona suggestion_code se existir na página
    var existingSuggestionCode = document.querySelector('input[name="suggestion_code"]');
    if (existingSuggestionCode && existingSuggestionCode.value) {
      params.set('suggestion_code', existingSuggestionCode.value);
    }

    console.log('[MiniCart] Enviando requisição AJAX:', {
      url: url,
      params: params.toString(),
    });

    // Faz a requisição via fetch (sem redirecionar)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
      body: params.toString(),
      redirect: 'manual', // Não segue redirecionamentos automaticamente
    }).then(function (res) {
      // Se for redirecionamento (3xx), considera sucesso (produto foi adicionado)
      if (res.status >= 300 && res.status < 400) {
        console.log('[MiniCart] Produto adicionado (redirecionamento detectado)');
        return { success: true, redirected: true };
      }

      // Tenta ler como JSON
      var contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return res.json().then(function (json) {
          console.log('[MiniCart] Resposta JSON:', json);
          return { success: true, data: json };
        });
      }

      // Lê como texto
      return res.text().then(function (text) {
        console.log('[MiniCart] Resposta texto:', text.substring(0, 200));

        // Se a resposta contém indicadores de sucesso ou é HTML de redirecionamento
        if (res.ok || res.status === 200 || text.includes('success') || text.includes('carrinho')) {
          return { success: true, data: text };
        }

        // Se não for sucesso, verifica se há erros
        if (text.includes('error') || text.includes('erro') || text.includes('inválida')) {
          throw new Error('Erro ao adicionar produto ao carrinho');
        }

        return { success: true, data: text };
      });
    });
  }

  function addToCart(productId, qty, extraParams) {
    // Busca form_key de múltiplas fontes, priorizando formulários de "adicionar ao carrinho"
    var formKey = null;

    // 1. Tenta buscar de formulários de "adicionar ao carrinho" existentes (mais confiável)
    var addToCartForms = document.querySelectorAll(
      'form[action*="cart/add"], form[data-role="tocart-form"]'
    );
    for (var i = 0; i < addToCartForms.length; i++) {
      var formInput = addToCartForms[i].querySelector('input[name="form_key"]');
      if (formInput && formInput.value && formInput.value.trim()) {
        formKey = formInput.value.trim();
        console.log('[MiniCart] form_key obtido de formulário existente');
        break;
      }
    }

    // 2. Se não encontrou, usa a função getFormKey() padrão
    if (!formKey) {
      formKey = getFormKey();
    }

    // 3. Se ainda não encontrou, tenta buscar um novo do servidor
    if (!formKey) {
      console.warn('[MiniCart] form_key não encontrado na página, tentando buscar do servidor...');
      // Nota: fetchNewFormKey é assíncrono, então vamos tentar sem ele primeiro
      // e só usar se realmente necessário
    }

    if (!formKey) {
      console.error('[MiniCart] form_key não encontrado! Não é possível adicionar ao carrinho.');
      return Promise.reject(
        new Error('form_key não encontrado. Por favor, atualize a página e tente novamente.')
      );
    }

    // Tenta encontrar uenc existente na página (de outros formulários)
    var existingUenc = null;
    var existingUencInput = document.querySelector('input[name="uenc"]');
    if (existingUencInput && existingUencInput.value) {
      existingUenc = existingUencInput.value;
    }

    // Gera o uenc (URL encoded) - aponta para a página do carrinho após adicionar
    var redirectUrl = window.location.origin + '/checkout/cart/';
    var uenc;
    if (existingUenc) {
      uenc = existingUenc;
    } else {
      // Gera base64 da URL
      try {
        uenc = btoa(unescape(encodeURIComponent(redirectUrl)));
      } catch (e) {
        // Fallback: usa URL simples
        uenc = btoa(redirectUrl);
      }
    }

    console.log('[MiniCart] Adicionando produto ao carrinho via AJAX:', {
      productId: productId,
      qty: qty || 1,
      formKey: formKey ? 'presente' : 'ausente',
      uenc: uenc,
    });

    // Usa AJAX para adicionar sem redirecionar a página
    return addToCartViaAjax(productId, qty || 1, uenc, formKey).then(function (result) {
      // Recarrega os dados do carrinho
      reloadCartSection();

      // Verifica se o produto foi realmente adicionado usando magentoCustomerData
      // (evita erro 400 do fetchCartData)
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          // Usa magentoCustomerData em vez de fetchCartData para evitar erro 400
          magentoCustomerData(function (customerData) {
            if (!customerData || !customerData.get) {
              console.warn('[MiniCart] CustomerData não disponível, assumindo sucesso');
              if (result.success) {
                resolve(result);
              } else {
                reject(new Error('Falha ao adicionar ao carrinho'));
              }
              return;
            }

            var cart = customerData.get('cart')();
            if (!cart || !cart.items) {
              console.warn('[MiniCart] Dados do carrinho não disponíveis, assumindo sucesso');
              if (result.success) {
                resolve(result);
              } else {
                reject(new Error('Falha ao adicionar ao carrinho'));
              }
              return;
            }

            var productInCart = fromCartByProductId(cart, productId);
            if (productInCart) {
              console.log('[MiniCart] Produto confirmado no carrinho:', productInCart);
              resolve(result);
            } else {
              // Tenta mais uma vez após um delay maior
              setTimeout(function () {
                var cart2 = customerData.get('cart')();
                if (cart2 && cart2.items) {
                  var productInCart2 = fromCartByProductId(cart2, productId);
                  if (productInCart2) {
                    console.log(
                      '[MiniCart] Produto confirmado no carrinho (segunda tentativa):',
                      productInCart2
                    );
                    resolve(result);
                    return;
                  }
                }

                // Mesmo sem confirmação, se a resposta foi sucesso, considera OK
                if (result.success) {
                  console.warn(
                    '[MiniCart] Produto adicionado com sucesso (verificação não confirmou, mas API retornou sucesso)'
                  );
                  resolve(result);
                } else {
                  reject(
                    new Error(
                      'Produto não foi adicionado ao carrinho. Verifique se o produto está disponível.'
                    )
                  );
                }
              }, 1000);
            }
          });
        }, 500);
      });
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

  function analyticsEvent(eventLabel, productId, productName, priceNumber, quantity, category) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[MiniCart] Missing parameters for analytics event.');
      return;
    }

    var productNameFormatted = productName || 'Produto';
    var quantityValue = quantity || 1;
    var priceValue = priceNumber || 0;

    // Formato: :productName;quantity;price;;
    var productsString =
      ':' + productNameFormatted + ';' + quantityValue + ';' + priceValue.toFixed(2) + ';;';

    var eVar7Value = 'target_mini_cart_' + eventLabel;

    console.log('[MiniCart] Analytics event triggered:', {
      event: 'scAdd',
      products: productsString,
      eVar7: eVar7Value,
      productId: productId,
      productName: productNameFormatted,
    });

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'products,events,eVar7';
      s.linkTrackEvents = 'scAdd';
      s.products = productsString;
      s.events = 'scAdd';
      s.eVar7 = eVar7Value;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function fetchCartData() {
    // Adiciona parâmetros necessários para evitar erro 400
    var timestamp = Date.now();
    var url =
      '/customer/section/load/?sections=cart&force_new_section_timestamp=true&_=' + timestamp;

    return fetch(url, { credentials: 'same-origin' })
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

  // Função para extrair o nível escolar de um nome de produto
  function extractGradeLevel(productName) {
    if (!productName) return null;

    var lowerName = productName.toLowerCase();

    // Padrões específicos para Educação Infantil (EI ou Educação Infantil)
    if (/educação\s+infantil|infantil|\bEI\b/i.test(lowerName)) {
      // Educação Infantil 1 ano
      if (/\b1\s*anos?\b|level\s*1/i.test(lowerName)) return '1 ano - Educação Infantil';
      // Educação Infantil 2 anos
      if (/\b2\s*anos?\b|level\s*2/i.test(lowerName)) return '2 anos - Educação Infantil';
      // Educação Infantil 3 anos
      if (/\b3\s*anos?\b|level\s*3/i.test(lowerName)) return '3 anos - Educação Infantil';
      // Pré Escola 4 anos
      if (/\b4\s*anos?\b|level\s*4/i.test(lowerName) || /pré.*escola.*4/i.test(lowerName))
        return '4 anos - Pré Escola';
      // Pré Escola 5 anos
      if (/\b5\s*anos?\b|level\s*5/i.test(lowerName) || /pré.*escola.*5/i.test(lowerName))
        return '5 anos - Pré Escola';
    }

    // Padrões específicos para Ensino Médio / Colegial
    if (/ensino\s+médio|colegial/i.test(lowerName)) {
      if (/1[º°]\s*(série|ano|colegial)/i.test(lowerName)) return '1º Colegial';
      if (/2[º°]\s*(série|ano|colegial)/i.test(lowerName)) return '2º Colegial';
      if (/3[º°]\s*(série|ano|colegial)/i.test(lowerName)) return '3º Colegial';
    }

    // Padrões para identificar o nível escolar do Ensino Fundamental
    // Exemplo: "5º ano - Aluno" -> "5º ano - Anos iniciais"
    var patterns = [
      {
        pattern: /(\d+)[º°]\s*ano\s*-\s*Aluno/i,
        grade: function (match) {
          var ano = parseInt(match[1]);
          if (ano >= 1 && ano <= 5) return ano + 'º ano - Anos iniciais';
          if (ano >= 6 && ano <= 9) return ano + 'º ano - Anos finais';
          return null;
        },
      },
      {
        pattern: /(\d+)[º°]\s*ano/i,
        grade: function (match) {
          var ano = parseInt(match[1]);
          if (ano >= 1 && ano <= 5) return ano + 'º ano - Anos iniciais';
          if (ano >= 6 && ano <= 9) return ano + 'º ano - Anos finais';
          return null;
        },
      },
      {
        pattern: /(\d+)[º°]\s*(série)/i,
        grade: function (match) {
          var serie = parseInt(match[1]);
          if (serie >= 1 && serie <= 5) return serie + 'º ano - Anos iniciais';
          if (serie >= 6 && serie <= 9) return serie + 'º ano - Anos finais';
          return null;
        },
      },
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = productName.match(patterns[i].pattern);
      if (match) {
        var grade = patterns[i].grade(match);
        if (grade) return grade;
      }
    }

    return null;
  }

  // Função para converter nível escolar detectado para número do nível
  // Exemplo: "5º ano - Anos iniciais" -> 10 (5º Série)
  // Versão robusta: normaliza strings e usa regex flexíveis
  function convertGradeLevelToNumber(gradeLevel) {
    if (!gradeLevel) return null;

    // Normaliza a string: lowercase, remove espaços extras, remove hífens/traços
    var normalized = gradeLevel
      .toLowerCase()
      .replace(/\s+/g, ' ') // Múltiplos espaços -> 1 espaço
      .replace(/\s*-\s*/g, ' ') // Remove hífens e espaços ao redor
      .trim();

    console.log('[MiniCart] Normalizando gradeLevel:', {
      original: gradeLevel,
      normalized: normalized,
    });

    // 1. EDUCAÇÃO INFANTIL (1-5 anos)
    // Padrões: "1 ano educacao infantil", "2 anos ensino infantil", "3 anos pre escola"
    if (
      /educacao\s*infantil|ensino\s*infantil|pre\s*escola/i.test(normalized) ||
      /\d+\s*anos?\s*(educacao|ensino|infantil|pre)/i.test(normalized)
    ) {
      // Extrai o número (1, 2, 3, 4, ou 5)
      var infantilMatch = normalized.match(/(\d+)\s*anos?/);
      if (infantilMatch) {
        var anos = parseInt(infantilMatch[1]);
        if (anos >= 1 && anos <= 5) {
          console.log('[MiniCart] Detectado Educação Infantil:', anos, 'anos -> nível', anos);
          return anos; // 1 ano -> 1, 2 anos -> 2, ..., 5 anos -> 5
        }
      }
    }

    // 2. ENSINO MÉDIO / COLEGIAL (15, 16, 17)
    // Padrões: "1º ano ensino medio", "2ª serie ensino medio", "3º colegial"
    if (/ensino\s*medio|colegial/i.test(normalized)) {
      // Extrai o número (1, 2, ou 3)
      var medioMatch = normalized.match(/(\d+)[º°ª]?\s*(ano|serie|colegial)/);
      if (medioMatch) {
        var serie = parseInt(medioMatch[1]);
        if (serie >= 1 && serie <= 3) {
          var nivel = 14 + serie; // 1 -> 15, 2 -> 16, 3 -> 17
          console.log('[MiniCart] Detectado Ensino Médio:', serie, 'º ano/série -> nível', nivel);
          return nivel;
        }
      }
    }

    // 3. ENSINO FUNDAMENTAL - ANOS INICIAIS (1º ao 5º ano -> 6 a 10)
    if (/anos?\s*iniciais|ef\s*1|efai/i.test(normalized)) {
      var iniciaisMatch = normalized.match(/(\d+)[º°ª]?\s*ano/);
      if (iniciaisMatch) {
        var ano = parseInt(iniciaisMatch[1]);
        if (ano >= 1 && ano <= 5) {
          var nivel = ano + 5; // 1º -> 6, 2º -> 7, ..., 5º -> 10
          console.log('[MiniCart] Detectado Anos Iniciais:', ano, 'º ano -> nível', nivel);
          return nivel;
        }
      }
    }

    // 4. ENSINO FUNDAMENTAL - ANOS FINAIS (6º ao 9º ano -> 11 a 14)
    if (/anos?\s*finais|ef\s*2/i.test(normalized)) {
      var finaisMatch = normalized.match(/(\d+)[º°ª]?\s*ano/);
      if (finaisMatch) {
        var ano = parseInt(finaisMatch[1]);
        if (ano >= 6 && ano <= 9) {
          var nivel = ano + 5; // 6º -> 11, 7º -> 12, 8º -> 13, 9º -> 14
          console.log('[MiniCart] Detectado Anos Finais:', ano, 'º ano -> nível', nivel);
          return nivel;
        }
      }
    }

    // 5. FALLBACK: Tenta extrair apenas o número e adivinhar pelo contexto
    // Se tem "ano" ou "série" e um número de 1-9, assume ensino fundamental
    var fallbackMatch = normalized.match(/(\d+)[º°ª]?\s*(ano|serie)/);
    if (fallbackMatch) {
      var num = parseInt(fallbackMatch[1]);
      // Anos 1-5: provavelmente anos iniciais
      if (num >= 1 && num <= 5) {
        console.log('[MiniCart] FALLBACK: Assumindo Anos Iniciais para', num, 'º ano');
        return num + 5;
      }
      // Anos 6-9: provavelmente anos finais
      if (num >= 6 && num <= 9) {
        console.log('[MiniCart] FALLBACK: Assumindo Anos Finais para', num, 'º ano');
        return num + 5;
      }
    }

    console.warn('[MiniCart] Não foi possível converter gradeLevel:', gradeLevel);
    return null;
  }

  // Função para verificar se um produto está no carrinho
  function isProductInCart(cartData, productId) {
    if (!cartData || !cartData.items || !Array.isArray(cartData.items)) {
      console.log('[MiniCart] isProductInCart: dados do carrinho inválidos', {
        hasCartData: !!cartData,
        hasItems: cartData && !!cartData.items,
        isArray: cartData && cartData.items && Array.isArray(cartData.items),
      });
      return false;
    }

    var found = cartData.items.some(function (item) {
      var itemProductId = Number(item.product_id);
      var searchProductId = Number(productId);
      var match = itemProductId === searchProductId;

      if (match) {
        console.log('[MiniCart] Produto encontrado no carrinho:', {
          searchId: searchProductId,
          itemId: itemProductId,
          itemName: item.product_name,
        });
      }

      return match;
    });

    return found;
  }

  // Função para determinar qual produto recomendar baseado no nível escolar
  function getRecommendedProductId(gradeNumber, cartData) {
    if (!gradeNumber || !GRADE_RECOMMENDATIONS[gradeNumber]) {
      console.warn('[MiniCart] Nível escolar não encontrado nas recomendações:', gradeNumber);
      return null;
    }

    var recommendation = GRADE_RECOMMENDATIONS[gradeNumber];

    console.log('[MiniCart] Verificando recomendações para nível', gradeNumber, {
      primary: recommendation.primary,
      secondary: recommendation.secondary,
      cartItemsCount: cartData && cartData.items ? cartData.items.length : 0,
    });

    // Verifica se algum produto primário já está no carrinho
    var primaryInCart = [];
    var primaryNotInCart = [];

    if (recommendation.primary && Array.isArray(recommendation.primary)) {
      recommendation.primary.forEach(function (productId) {
        var inCart = isProductInCart(cartData, productId);
        console.log('[MiniCart] Verificando produto primário', productId, 'no carrinho:', inCart);
        if (inCart) {
          primaryInCart.push(productId);
        } else {
          primaryNotInCart.push(productId);
        }
      });
    }

    console.log('[MiniCart] Produtos primários no carrinho:', primaryInCart);
    console.log('[MiniCart] Produtos primários não no carrinho:', primaryNotInCart);

    // Se algum produto primário está no carrinho e há produto secundário, recomenda o secundário
    if (
      primaryInCart.length > 0 &&
      recommendation.secondary &&
      Array.isArray(recommendation.secondary)
    ) {
      // Retorna o primeiro produto secundário disponível que não está no carrinho
      for (var i = 0; i < recommendation.secondary.length; i++) {
        var secondaryId = recommendation.secondary[i];
        if (!isProductInCart(cartData, secondaryId)) {
          console.log(
            '[MiniCart] Produto primário já está no carrinho, recomendando secundário:',
            secondaryId
          );
          return secondaryId;
        }
      }
      // Se todos os secundários estão no carrinho, retorna null (não há mais o que recomendar)
      console.log('[MiniCart] Todos os produtos (primários e secundários) já estão no carrinho');
      return null;
    }

    // Se há produtos primários que não estão no carrinho, recomenda o primeiro disponível
    if (primaryNotInCart.length > 0) {
      console.log('[MiniCart] Recomendando produto primário:', primaryNotInCart[0]);
      return primaryNotInCart[0];
    }

    // Se todos os primários estão no carrinho e não há secundário, retorna null
    if (
      primaryInCart.length > 0 &&
      (!recommendation.secondary || recommendation.secondary.length === 0)
    ) {
      console.log(
        '[MiniCart] Todos os produtos primários já estão no carrinho e não há produto secundário'
      );
      return null;
    }

    return null;
  }

  // Função para verificar se há kit escolar no carrinho e extrair o nível
  function detectSchoolKitAndGrade(cartData) {
    if (!cartData || !cartData.items || !Array.isArray(cartData.items)) {
      console.warn('[MiniCart] detectSchoolKitAndGrade: dados inválidos', {
        hasCartData: !!cartData,
        hasItems: cartData && !!cartData.items,
        isArray: cartData && cartData.items && Array.isArray(cartData.items),
      });
      return { hasKit: false, gradeLevel: null, kitProducts: [] };
    }

    var gradeLevel = null;
    var kitProducts = [];
    var hasAdoptionList = false;

    console.log(
      '[MiniCart] Verificando ' + cartData.items.length + ' itens no carrinho para detectar kits...'
    );

    // PRIORIDADE 1: Verifica se existe adoption list (indica que há kit escolar)
    // Acessa: cart.ftd.data.miniCart.miniCartAdoptionLists
    if (
      cartData.ftd &&
      cartData.ftd.data &&
      cartData.ftd.data.miniCart &&
      cartData.ftd.data.miniCart.miniCartAdoptionLists
    ) {
      var adoptionLists = cartData.ftd.data.miniCart.miniCartAdoptionLists;
      var adoptionListKeys = Object.keys(adoptionLists);

      console.log('[MiniCart] Detectadas adoption lists no carrinho:', {
        count: adoptionListKeys.length,
        lists: adoptionListKeys,
      });

      // Se existe pelo menos uma adoption list, há kit no carrinho
      if (adoptionListKeys.length > 0) {
        hasAdoptionList = true;
        console.log('[MiniCart] Kit detectado via adoption list');

        // Pega o primeiro studentId encontrado
        var firstAdoptionListId = adoptionListKeys[0];
        var firstAdoptionList = adoptionLists[firstAdoptionListId];
        var studentId = firstAdoptionList.studentId;

        console.log('[MiniCart] Primeiro studentId do carrinho:', studentId);

        // Busca o gradeLevel no mapa (se já foi carregado)
        if (STUDENTS_DATA_LOADED && STUDENT_GRADE_MAP[studentId]) {
          gradeLevel = STUDENT_GRADE_MAP[studentId];
          console.log('[MiniCart] Nivel escolar obtido via API de estudantes:', {
            studentId: studentId,
            gradeLevel: gradeLevel,
          });
        } else {
          console.log(
            '[MiniCart] AVISO: Mapa de estudantes nao carregado ou studentId nao encontrado:',
            {
              dataLoaded: STUDENTS_DATA_LOADED,
              hasStudentId: !!STUDENT_GRADE_MAP[studentId],
              studentId: studentId,
            }
          );
        }
      }
    }

    // Verifica cada item do carrinho para detectar kits (necessário mesmo se já temos gradeLevel)
    for (var i = 0; i < cartData.items.length; i++) {
      var item = cartData.items[i];
      var productName = item.product_name || '';

      console.log('[MiniCart] Verificando item ' + (i + 1) + ':', {
        name: productName,
        id: item.product_id,
      });

      // Verifica se é um produto de kit escolar (padrão: "Conjunto", "Kit", ou produtos com ano)
      var isKitProduct =
        /conjunto|kit|faça|faca|lista\s*de\s*materiais|\bCJ\b|\bEI\b/i.test(productName) ||
        /\d+[º°]\s*(ano|série)/i.test(productName) ||
        /\d+\s+ANOS/i.test(productName) ||
        /LEVEL\s+\d+/i.test(productName);

      if (isKitProduct) {
        console.log('[MiniCart] Kit detectado:', productName);
        kitProducts.push(item);

        // PRIORIDADE 2: Tenta extrair o nivel escolar do nome do produto (fallback)
        // Só tenta se ainda não temos gradeLevel
        if (!gradeLevel) {
          var extractedGrade = extractGradeLevel(productName);
          if (extractedGrade) {
            gradeLevel = extractedGrade;
            console.log(
              '[MiniCart] INFO: Nivel escolar extraido do nome do produto (fallback):',
              gradeLevel
            );
          } else {
            console.warn('[MiniCart] Não foi possível extrair nível do kit:', productName);
          }
        }
      }
    }

    // Determina se há kit: se existe adoption list OU se detectou produtos por regex
    var hasKit = hasAdoptionList || kitProducts.length > 0;

    console.log('[MiniCart] Resultado da detecção:', {
      hasKit: hasKit,
      hasAdoptionList: hasAdoptionList,
      gradeLevel: gradeLevel,
      gradeLevelSource: gradeLevel
        ? STUDENTS_DATA_LOADED && STUDENT_GRADE_MAP[Object.keys(STUDENT_GRADE_MAP)[0]]
          ? 'API'
          : 'regex'
        : 'none',
      kitsFound: kitProducts.length,
    });

    return {
      hasKit: hasKit,
      gradeLevel: gradeLevel,
      kitProducts: kitProducts,
    };
  }

  // Função para buscar dados do carrinho (usa apenas o endpoint que funciona)
  function fetchFullCartData() {
    // Usa apenas fetchCartData que já está funcionando
    return fetchCartData()
      .then(function (cartData) {
        // Retorna no formato esperado: { cart: ... }
        return cartData ? { cart: cartData } : null;
      })
      .catch(function (err) {
        console.warn('[MiniCart] Erro ao buscar dados do carrinho:', err);
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

  function fetchPdpHtmlByIdOnce(id, forceRefresh) {
    // Se forçado, limpa o cache da promise
    if (forceRefresh) {
      window.__WJ_PDP_PROMISE__ = null;
    }

    // Se já existe uma promise em andamento e não foi forçado, retorna ela
    if (window.__WJ_PDP_PROMISE__) {
      // Verifica se a promise é para o mesmo produto
      var currentId = window.__WJ_PDP_PRODUCT_ID__;
      if (currentId === id) {
        return window.__WJ_PDP_PROMISE__;
      }
      // Se for produto diferente, limpa e busca novo
      window.__WJ_PDP_PROMISE__ = null;
    }

    window.__WJ_PDP_PRODUCT_ID__ = id;
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
        window.__WJ_PDP_PRODUCT_ID__ = null;
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

      // Adiciona a copy "Leve mais, com o mesmo frete!"
      var copyHeader = document.createElement('p');
      copyHeader.className = 'wj-copy-header';
      copyHeader.textContent = 'Leve mais, com o mesmo frete!';
      wrap.appendChild(copyHeader);

      // Cria um wrapper para o conteúdo do produto (imagem, info e botão)
      var productContent = document.createElement('div');
      productContent.className = 'wj-product-content';

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

      // Cria uma div wrapper para imagem e info
      var imageInfoWrapper = document.createElement('div');
      imageInfoWrapper.style.display = 'flex';
      imageInfoWrapper.style.gap = '4px';
      imageInfoWrapper.appendChild(img);
      imageInfoWrapper.appendChild(info);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wj-cta';
      // Sempre usa data.id se disponível, nunca usa TARGET_ID como fallback
      btn.dataset.productId = String(data.id || '0');

      // Inicializa o botão com os ícones
      updateButtonContent(btn, 'default');

      btn.addEventListener('click', function (e) {
        // Previne o comportamento padrão e a propagação do evento
        // para evitar que o carrinho feche ao clicar no botão
        e.preventDefault();
        e.stopPropagation();

        var productId = Number(btn.dataset.productId || TARGET_ID);
        var productName = data.name || 'Produto';
        var productPrice = data.priceNumber || 0;
        var quantity = 1;
        var category = data.category || data.product_category || '';

        // Tracking: clique no botão
        analyticsEvent(
          'add_to_cart_click',
          productId,
          productName,
          productPrice,
          quantity,
          category
        );

        btn.setAttribute('disabled', 'disabled');
        updateButtonContent(btn, 'adding');

        addToCart(productId, 1)
          .then(function (res) {
            // Produto adicionado com sucesso via AJAX (sem recarregar página)
            console.log('[MiniCart] Produto adicionado com sucesso:', res);

            // Atualiza o botão para indicar sucesso
            updateButtonContent(btn, 'added');

            // Tracking: sucesso ao adicionar
            analyticsEvent(
              'add_to_cart_success',
              productId,
              productName,
              productPrice,
              quantity,
              category
            );

            // Reabilita o botão após um tempo
            setTimeout(function () {
              updateButtonContent(btn, 'default');
              btn.removeAttribute('disabled');
            }, 2000);
          })
          .catch(function (err) {
            console.error('[MiniCart] Falha ao adicionar ao carrinho:', err);
            var errorMessage = err && err.message ? err.message : 'Erro desconhecido';
            console.error('[MiniCart] Mensagem de erro:', errorMessage);

            updateButtonContent(btn, 'error');
            btn.title = errorMessage; // Mostra o erro ao passar o mouse

            // Tracking: erro ao adicionar
            analyticsEvent(
              'add_to_cart_error',
              productId,
              productName,
              productPrice,
              quantity,
              category
            );

            setTimeout(function () {
              updateButtonContent(btn, 'default');
              btn.removeAttribute('disabled');
              btn.removeAttribute('title');
            }, 2000);
          });
      });

      productContent.appendChild(imageInfoWrapper);
      productContent.appendChild(btn);

      wrap.appendChild(productContent);

      anchor.parentElement.insertBefore(wrap, anchor);

      img.addEventListener('load', function () {
        img.style.opacity = '1';
        img.dataset.locked = '1';
      });
    }

    // Atualiza textos e imagem
    var titleEl = wrap.querySelector('.wj-title');
    var priceEl = wrap.querySelector('.wj-price');
    var btnEl = wrap.querySelector('.wj-cta');
    var imgEl = wrap.querySelector('img');

    // Verifica se o produto mudou comparando o ID atual com o novo
    var currentProductId = btnEl ? Number(btnEl.dataset.productId) : null;
    var newProductId = data.id ? Number(data.id) : null;
    var productChanged =
      currentProductId !== null && newProductId !== null && currentProductId !== newProductId;

    if (productChanged) {
      console.log('[MiniCart] Produto mudou na interface:', {
        currentId: currentProductId,
        newId: newProductId,
        newName: data.name,
        newPrice: data.priceFormatted,
      });
    }

    // Se o produto mudou, força a atualização de tudo
    if (productChanged && imgEl) {
      imgEl.dataset.locked = ''; // Remove o lock para permitir atualização
    }

    // Atualiza título - sempre atualiza se o produto mudou
    if (data.name && titleEl) {
      if (productChanged || !titleEl.textContent || titleEl.textContent === 'Produto') {
        titleEl.textContent = data.name;
      }
    }

    // Atualiza URL do título - sempre atualiza se o produto mudou
    if (data.url && titleEl && titleEl.tagName === 'A') {
      if (productChanged || titleEl.href !== data.url) {
        titleEl.href = data.url;
      }
    }

    // Atualiza preço - sempre atualiza se o produto mudou
    if (data.priceFormatted && priceEl) {
      if (productChanged || !priceEl.textContent || priceEl.textContent.trim() === '') {
        priceEl.textContent = data.priceFormatted;
      }
    }

    // Atualiza ID do botão - sempre atualiza se o produto mudou
    if (btnEl && data.id) {
      if (productChanged || btnEl.dataset.productId !== String(data.id)) {
        btnEl.dataset.productId = String(data.id);
      }
    }

    // Atualiza imagem
    if (imgEl && data.image) {
      if (productChanged || !imgEl.dataset.locked) {
        // Atualiza alt text
        if (data.name) {
          imgEl.alt = data.name;
        }
        // usa preload para evitar piscar
        var pre = new Image();
        pre.onload = function () {
          if (productChanged || !imgEl.dataset.locked) {
            imgEl.src = data.image;
            if (!productChanged) {
              imgEl.dataset.locked = '1';
            }
          }
        };
        pre.src = data.image;
      }
    }
  }

  function mountOnceWithData(data) {
    var anchor = document.querySelector(ANCHOR_SELECTOR);
    if (!anchor) return;
    render(anchor, data);
    // Garante que o elemento seja mostrado quando montado
    showRecommendation();
  }

  // Função para esconder o elemento quando não há kit
  function hideRecommendation() {
    var wrap = document.getElementById(SHELF_ID);
    if (wrap) {
      wrap.style.display = 'none';
      console.log('[MiniCart] Recomendação escondida (kit removido)');
    }
  }

  // Função para mostrar o elemento quando há kit
  function showRecommendation() {
    var wrap = document.getElementById(SHELF_ID);
    if (wrap) {
      wrap.style.display = '';
      wrap.classList.remove('wj-hiding'); // Remove a classe de animação se existir
      console.log('[MiniCart] Recomendação mostrada (kit detectado)');
    }
  }

  // Função para ocultar o elemento com animação quando o produto for adicionado
  function hideRecommendationWithAnimation() {
    var wrap = document.getElementById(SHELF_ID);
    if (wrap) {
      // Adiciona a classe que dispara a animação
      wrap.classList.add('wj-hiding');
      console.log('[MiniCart] Iniciando animação de ocultação...');

      // Após a animação, oculta completamente o elemento
      setTimeout(function () {
        wrap.style.display = 'none';
        wrap.classList.remove('wj-hiding');
        console.log('[MiniCart] Recomendação ocultada (produto adicionado ao carrinho)');
      }, 500); // Duração da animação
    }
  }

  // Variáveis para evitar loops infinitos
  var isRunning = false;
  var lastCheckedState = null;
  var debounceTimer = null;
  var mutationObserverPaused = false;

  function debounced(fn, wait) {
    return function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fn, wait);
    };
  }

  // Função para criar um hash do estado do carrinho
  function getCartStateHash(cartData) {
    if (!cartData || !cartData.items) return '';
    var items = cartData.items
      .map(function (item) {
        return item.product_id + ':' + (item.qty || 1);
      })
      .sort()
      .join(',');
    return items;
  }

  var run = debounced(function () {
    console.log('[MiniCart] run() chamado');

    // Evita execuções simultâneas
    if (isRunning) {
      console.log('[MiniCart] Execução já em andamento, ignorando...');
      return;
    }

    var anchor = document.querySelector(ANCHOR_SELECTOR);
    if (!anchor) {
      console.warn('[MiniCart] Anchor não encontrado:', ANCHOR_SELECTOR);
      return;
    }

    console.log('[MiniCart] Anchor encontrado, iniciando verificação do carrinho...');

    // Marca como em execução
    isRunning = true;

    // Primeiro, verifica se há kit escolar no carrinho usando customer data
    magentoCustomerData(function (cd) {
      console.log('[MiniCart] magentoCustomerData callback executado', {
        hasCustomerData: !!cd,
        hasGet: cd && !!cd.get,
      });

      var cart = cd && cd.get ? cd.get('cart')() : null;

      console.log('[MiniCart] Dados do carrinho obtidos:', {
        hasCart: !!cart,
        hasItems: cart && !!cart.items,
        itemsCount: cart && cart.items ? cart.items.length : 0,
      });

      if (!cart) {
        console.warn('[MiniCart] Cart não disponível via customerData, tentando fetch...');
        // Se não tiver customer data, tenta fetch como fallback
        fetchFullCartData()
          .then(function (fullData) {
            if (!fullData || !fullData.cart) {
              console.log(
                '[MiniCart] Nenhum dado do carrinho encontrado. Aguardando kit escolar...'
              );
              isRunning = false;
              return;
            }
            var stateHash = getCartStateHash(fullData.cart);
            if (stateHash && stateHash === lastCheckedState) {
              isRunning = false;
              return;
            }
            if (stateHash) {
              lastCheckedState = stateHash;
            }
            checkKitAndShowRecommendation(fullData.cart);
          })
          .catch(function (err) {
            console.warn('[MiniCart] Erro ao verificar kit escolar:', err);
            isRunning = false;
          });
        return;
      }

      // Usa os dados do customer data (formato pode ser diferente)
      var cartData = null;

      // Tenta converter o formato do customer data para o formato esperado
      if (cart && typeof cart === 'object') {
        // Se já está no formato correto
        if (cart.items && Array.isArray(cart.items)) {
          cartData = cart;
        } else if (cart.cart && cart.cart.items) {
          cartData = cart.cart;
        } else {
          // Tenta buscar dados completos via fetch
          fetchFullCartData()
            .then(function (fullData) {
              if (fullData && fullData.cart) {
                var stateHash = getCartStateHash(fullData.cart);
                if (stateHash && stateHash === lastCheckedState) {
                  isRunning = false;
                  return;
                }
                if (stateHash) {
                  lastCheckedState = stateHash;
                }
                checkKitAndShowRecommendation(fullData.cart);
              } else {
                isRunning = false;
              }
            })
            .catch(function () {
              // Se falhar, tenta detectar com os dados disponíveis
              if (cart && Object.keys(cart).length > 0) {
                var stateHash = getCartStateHash(cart);
                if (stateHash && stateHash === lastCheckedState) {
                  isRunning = false;
                  return;
                }
                if (stateHash) {
                  lastCheckedState = stateHash;
                }
                checkKitAndShowRecommendation(cart);
              } else {
                isRunning = false;
              }
            });
          return;
        }
      }

      if (cartData) {
        // Verifica se o estado do carrinho mudou
        var stateHash = getCartStateHash(cartData);
        if (stateHash && stateHash === lastCheckedState) {
          // Estado não mudou, apenas reseta a flag
          isRunning = false;
          return;
        }
        if (stateHash) {
          lastCheckedState = stateHash;
        }
        checkKitAndShowRecommendation(cartData);
      } else {
        isRunning = false;
      }
    });
  }, 300);

  // Função auxiliar para verificar kit e mostrar recomendação
  function checkKitAndShowRecommendation(cartData) {
    // Se a API ainda esta carregando, aguarda um pouco e tenta novamente
    if (STUDENTS_DATA_LOADING && !STUDENTS_DATA_LOADED) {
      console.log('[MiniCart] Aguardando carregamento dos dados da API de estudantes...');
      setTimeout(function () {
        console.log('[MiniCart] Tentando novamente após carregamento da API...');
        // Reseta o lastCheckedState para forçar nova verificação com dados da API
        lastCheckedState = null;
        isRunning = false;
        run();
      }, 500);
      return;
    }

    // Detecta se há kit e qual o nível escolar
    var kitInfo = detectSchoolKitAndGrade(cartData);

    if (!kitInfo.hasKit) {
      console.log(
        '[MiniCart] Nenhum kit escolar detectado no carrinho. Escondendo recomendação...'
      );
      DETECTED_GRADE_LEVEL = null;
      LAST_RECOMMENDED_PRODUCT_ID = null;
      INITIAL_RECOMMENDED_PRODUCT_ID = null;
      INITIAL_RECOMMENDATION_CART_STATE = null;
      mutationObserverPaused = true;
      hideRecommendation(); // Esconde o elemento quando não há kit
      setTimeout(function () {
        mutationObserverPaused = false;
        isRunning = false;
      }, 100);
      return;
    }

    // Armazena o nível escolar detectado globalmente
    DETECTED_GRADE_LEVEL = kitInfo.gradeLevel;

    // Converte o nível escolar para número (ex: "5º ano - Anos iniciais" -> 10)
    var gradeNumber = convertGradeLevelToNumber(kitInfo.gradeLevel);

    if (!gradeNumber) {
      console.warn(
        '[MiniCart] Não foi possível converter o nível escolar para número:',
        kitInfo.gradeLevel
      );
      mutationObserverPaused = true;
      hideRecommendation();
      setTimeout(function () {
        mutationObserverPaused = false;
        isRunning = false;
      }, 100);
      return;
    }

    // Log dos dados do carrinho para debug
    console.log('[MiniCart] Dados do carrinho antes de verificar recomendações:', {
      cartDataExists: !!cartData,
      itemsCount: cartData && cartData.items ? cartData.items.length : 0,
      items:
        cartData && cartData.items
          ? cartData.items.map(function (item) {
              return { id: item.product_id, name: item.product_name };
            })
          : [],
    });

    // Cria um hash simplificado dos IDs dos produtos no carrinho (excluindo kits)
    var currentCartState = cartData.items
      ? cartData.items
          .filter(function (item) {
            // Filtra itens que NÃO são kits escolares
            // Um kit escolar contém "kit" E tem padrão de ano/série no nome
            var name = (item.product_name || '').toLowerCase();
            var hasKitWord = /conjunto|kit|faça|faca/i.test(name);
            var hasGradePattern = /\d+[º°]\s*(ano|série)/i.test(name);
            var isKit = hasKitWord || hasGradePattern;
            return !isKit; // Retorna true se NÃO for kit
          })
          .map(function (item) {
            return item.product_id;
          })
          .sort()
          .join(',')
      : '';

    // Verifica se é a primeira recomendação ou se o kit/nível mudou
    var isFirstRecommendation =
      !INITIAL_RECOMMENDED_PRODUCT_ID || DETECTED_GRADE_LEVEL !== kitInfo.gradeLevel;

    var recommendedProductId;

    if (isFirstRecommendation) {
      // Primeira recomendação ou kit mudou: determina produto com base no estado atual do carrinho
      console.log('[MiniCart] Determinando recomendação inicial para nível:', gradeNumber);
      recommendedProductId = getRecommendedProductId(gradeNumber, cartData);

      if (recommendedProductId) {
        INITIAL_RECOMMENDED_PRODUCT_ID = recommendedProductId;
        INITIAL_RECOMMENDATION_CART_STATE = currentCartState;
        console.log('[MiniCart] Recomendação inicial definida:', {
          productId: recommendedProductId,
          cartState: currentCartState,
        });
      }
    } else {
      // Não é a primeira recomendação: mantém o produto inicial, mesmo que tenha sido adicionado
      recommendedProductId = INITIAL_RECOMMENDED_PRODUCT_ID;
      console.log('[MiniCart] Mantendo recomendação inicial:', recommendedProductId);

      // Verifica se o produto recomendado ainda faz sentido
      // Se o produto já estava no carrinho na recomendação inicial e ainda está, está OK
      // Se foi adicionado agora (não estava no initial state), mantém a recomendação
      var wasInInitialCart = INITIAL_RECOMMENDATION_CART_STATE
        ? INITIAL_RECOMMENDATION_CART_STATE.split(',').indexOf(String(recommendedProductId)) !== -1
        : false;
      var isInCurrentCart = isProductInCart(cartData, recommendedProductId);

      console.log('[MiniCart] Status do produto recomendado:', {
        productId: recommendedProductId,
        wasInInitialCart: wasInInitialCart,
        isInCurrentCart: isInCurrentCart,
      });

      // Se o produto foi adicionado pelo usuário (não estava no initial mas está agora),
      // ainda assim mantém a recomendação
    }

    if (!recommendedProductId) {
      console.warn('[MiniCart] Nenhum produto recomendado encontrado para o nível:', gradeNumber);
      LAST_RECOMMENDED_PRODUCT_ID = null;
      INITIAL_RECOMMENDED_PRODUCT_ID = null;
      INITIAL_RECOMMENDATION_CART_STATE = null;
      mutationObserverPaused = true;
      hideRecommendation();
      setTimeout(function () {
        mutationObserverPaused = false;
        isRunning = false;
      }, 100);
      return;
    }

    // Verifica se o produto recomendado mudou
    var productChanged = LAST_RECOMMENDED_PRODUCT_ID !== recommendedProductId;
    LAST_RECOMMENDED_PRODUCT_ID = recommendedProductId;

    // Atualiza o TARGET_ID dinamicamente
    var currentTargetId = recommendedProductId;

    // Atualiza a chave do cache baseada no produto recomendado
    var currentCacheKey = 'WJ_SHELF_CACHE_' + currentTargetId;

    console.log('[MiniCart] Kit escolar detectado!', {
      hasKit: kitInfo.hasKit,
      gradeLevel: kitInfo.gradeLevel,
      gradeNumber: gradeNumber,
      recommendedProductId: recommendedProductId,
      kitProducts: kitInfo.kitProducts.length,
      productChanged: productChanged,
    });

    // Verifica se o produto recomendado foi adicionado ao carrinho
    // Se sim, oculta o card com animação
    var recommendedProductInCart = isProductInCart(cartData, recommendedProductId);

    if (recommendedProductInCart && !isFirstRecommendation) {
      console.log('[MiniCart] Produto recomendado já está no carrinho, ocultando com animação...');
      hideRecommendationWithAnimation();
      setTimeout(function () {
        mutationObserverPaused = false;
        isRunning = false;
      }, 600); // Aguarda a animação completar (500ms) + pequeno buffer
      return;
    }

    // Mostra o elemento quando há kit e o produto ainda não foi adicionado
    showRecommendation();

    // Função auxiliar para buscar dados do produto recomendado
    function loadRecommendedProduct(productId, forceReload) {
      // Se o produto mudou, sempre busca do PDP para garantir dados atualizados
      if (forceReload) {
        console.log(
          '[MiniCart] Produto recomendado mudou, buscando dados do novo produto:',
          productId
        );
        // Limpa o cache do produto anterior se necessário
        // Busca diretamente do PDP com forceRefresh
        fetchPdpHtmlByIdOnce(productId, true)
          .then(parsePdp)
          .then(function (pdpData) {
            // Garante que o ID do produto está presente nos dados
            if (!pdpData.id) {
              pdpData.id = productId;
            }
            console.log('[MiniCart] Dados do novo produto carregados:', {
              id: pdpData.id,
              name: pdpData.name,
              price: pdpData.priceFormatted,
              image: pdpData.image ? 'presente' : 'ausente',
            });
            setCacheForProduct(productId, pdpData);
            mutationObserverPaused = true;
            mountOnceWithData(pdpData);
            setTimeout(function () {
              mutationObserverPaused = false;
              isRunning = false;
            }, 100);
          })
          .catch(function (err) {
            console.warn('[MiniCart] Erro ao buscar dados do produto:', err);
            mutationObserverPaused = true;
            // Garante que o ID do produto está presente mesmo em caso de erro
            mountOnceWithData({ id: productId, name: 'Produto', image: '', priceFormatted: '' });
            setTimeout(function () {
              mutationObserverPaused = false;
              isRunning = false;
            }, 100);
          });
        return;
      }

      // Se não for forçado, tenta cache primeiro
      // 1, tenta cache específico do produto
      var cached = getCacheForProduct(productId);
      if (cached) {
        // Garante que o ID do produto está presente nos dados do cache
        if (!cached.id) {
          cached.id = productId;
        }
        mutationObserverPaused = true;
        mountOnceWithData(cached);
        setTimeout(function () {
          mutationObserverPaused = false;
          isRunning = false;
        }, 100);
        return;
      }

      // 2, tenta customer data
      magentoCustomerData(function (cd) {
        var cart = cd && cd.get ? cd.get('cart')() : null;
        var fromCart = fromCartByProductId(cart, productId);
        if (fromCart) {
          // Garante que o ID do produto está presente nos dados do carrinho
          if (!fromCart.id) {
            fromCart.id = productId;
          }
          setCacheForProduct(productId, fromCart);
          mutationObserverPaused = true;
          mountOnceWithData(fromCart);
          setTimeout(function () {
            mutationObserverPaused = false;
            isRunning = false;
          }, 100);
          return;
        }

        // 3, busca PDP diretamente
        fetchPdpHtmlByIdOnce(productId)
          .then(parsePdp)
          .then(function (pdpData) {
            // Garante que o ID do produto está presente nos dados
            if (!pdpData.id) {
              pdpData.id = productId;
            }
            setCacheForProduct(productId, pdpData);
            mutationObserverPaused = true;
            mountOnceWithData(pdpData);
            setTimeout(function () {
              mutationObserverPaused = false;
              isRunning = false;
            }, 100);
          })
          .catch(function (err) {
            console.warn('[MiniCart] Erro ao buscar dados do produto:', err);
            mutationObserverPaused = true;
            // Garante que o ID do produto está presente mesmo em caso de erro
            mountOnceWithData({ id: productId, name: 'Produto', image: '', priceFormatted: '' });
            setTimeout(function () {
              mutationObserverPaused = false;
              isRunning = false;
            }, 100);
          });
      });
    }

    // Carrega o produto recomendado
    // Se o produto mudou, força o reload para atualizar a interface
    loadRecommendedProduct(currentTargetId, productChanged);
  }

  // Funções auxiliares para cache específico por produto
  function getCacheForProduct(productId) {
    var cacheKey = 'WJ_SHELF_CACHE_' + productId;
    try {
      var raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.t || Date.now() - obj.t > CACHE_TTL_MS) return null;
      return obj.v;
    } catch (e) {
      return null;
    }
  }

  function setCacheForProduct(productId, v) {
    var cacheKey = 'WJ_SHELF_CACHE_' + productId;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: v }));
    } catch (e) {}
  }

  console.log(
    '[MiniCart] Script inicializado - versão com detecção aprimorada de kits + API de estudantes'
  );
  console.log('[MiniCart] Aguardando anchor:', ANCHOR_SELECTOR);

  // Busca dados dos estudantes no início (em background)
  fetchStudentsData().catch(function (err) {
    console.warn(
      '[MiniCart] Erro ao carregar dados dos estudantes (continuará com fallback):',
      err
    );
  });

  var mo = new MutationObserver(function () {
    // Ignora mutações quando estamos pausados ou em execução
    if (mutationObserverPaused || isRunning) {
      return;
    }
    run();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Observa mudanças no customer data (quando o carrinho é atualizado)
  var cartSubscriptionActive = false;
  var cartSubscriptionTimer = null;
  var lastCartSubscriptionState = null;

  magentoCustomerData(function (cd) {
    if (cd && cd.get) {
      var cart = cd.get('cart');
      if (cart && typeof cart.subscribe === 'function' && !cartSubscriptionActive) {
        cartSubscriptionActive = true;
        cart.subscribe(function (updatedCart) {
          // Ignora se já está em execução
          if (isRunning) {
            return;
          }

          // Cria um hash do estado atual do carrinho
          var currentState = null;
          if (updatedCart && updatedCart.items && Array.isArray(updatedCart.items)) {
            currentState = updatedCart.items
              .map(function (item) {
                return (item.product_id || item.id) + ':' + (item.qty || 1);
              })
              .sort()
              .join(',');
          }

          // Se o estado não mudou, ignora
          if (currentState === lastCartSubscriptionState) {
            return;
          }

          lastCartSubscriptionState = currentState;

          // Limpa o timer anterior
          clearTimeout(cartSubscriptionTimer);

          // Debounce agressivo para evitar múltiplas chamadas
          cartSubscriptionTimer = setTimeout(function () {
            if (isRunning) {
              return;
            }

            console.log('[MiniCart] Carrinho atualizado, verificando kit escolar...');

            // Recarrega os dados do carrinho antes de verificar
            if (cd && typeof cd.reload === 'function') {
              cd.reload(['cart'], true);
            }

            // Aguarda um pouco para garantir que os dados estão atualizados
            setTimeout(function () {
              if (!isRunning) {
                run();
              }
            }, 500);
          }, 1000); // Debounce de 1 segundo
        });
      }
    }
  });

  // Executa a verificação inicial após um pequeno delay para garantir que o DOM está pronto
  setTimeout(function () {
    console.log('[MiniCart] Executando verificação inicial...');
    run();
  }, 1000);

  // Executa também imediatamente caso o DOM já esteja pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(run, 100);
  } else {
    window.addEventListener('load', function () {
      setTimeout(run, 100);
    });
  }
})();
