(function () {
  'use strict';

  if (window.webjumpNespressoAudiencia) {
    return;
  }

  const NAPI_POLL_MS = 250;
  const NAPI_TIMEOUT_MS = 10000;
  const STATUS_PEDIDO_VALIDO = ['DELIVERED'];
  const TECH_ORIGINAL = 'original';
  const TECH_VERTUO = 'vertuo';

  const CONFIG = {
    limiares: {
      OL: { n1: 120, n2: 170 },
      VL: { n1: 120, n2: 170 }
    }
  };

  function waitForNapi() {
    return new Promise(function (resolve, reject) {
      if (window.napi) {
        resolve(window.napi);
        return;
      }
      const started = Date.now();
      const timer = setInterval(function () {
        if (window.napi) {
          clearInterval(timer);
          resolve(window.napi);
          return;
        }
        if (Date.now() - started >= NAPI_TIMEOUT_MS) {
          clearInterval(timer);
          reject(new Error('window.napi nao disponivel'));
        }
      }, NAPI_POLL_MS);
    });
  }

  function toArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function detectTechFromString(value) {
    if (!value || typeof value !== 'string') return null;
    const lower = value.toLowerCase();
    if (lower.indexOf(TECH_VERTUO) !== -1) return 'VL';
    if (lower.indexOf(TECH_ORIGINAL) !== -1) return 'OL';
    return null;
  }

  function unique(list) {
    const seen = {};
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!item || seen[item]) continue;
      seen[item] = true;
      out.push(item);
    }
    return out;
  }

  function collectStrings(value, acc, depth) {
    if (depth > 5 || value == null || acc.length > 80) return;
    if (typeof value === 'string') {
      acc.push(value);
      return;
    }
    if (typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length && i < 40; i++) {
        collectStrings(value[i], acc, depth + 1);
      }
      return;
    }
    for (const k in value) {
      acc.push(k);
      collectStrings(value[k], acc, depth + 1);
    }
  }

  async function getLinhaFromMachines(machines) {
    const lista = Array.isArray(machines)
      ? machines
      : machines && Array.isArray(machines.machines)
        ? machines.machines
        : [];
    if (!lista.length) {
      return { linha: null, linhas: [], origem: 'getMachines-vazio', detalhes: [] };
    }

    const linhas = [];
    const detalhes = [];
    for (let i = 0; i < lista.length; i++) {
      const item = lista[i] || {};
      const sku = item.productId || '';
      const product = sku ? await getProductSafe(sku) : null;
      const linha = detectTechFromProduct(product) || detectTechFromString(sku);
      if (linha) linhas.push(linha);
      detalhes.push({
        productId: sku,
        linha: linha,
        tipo: product && product.type ? product.type : null
      });
    }

    const linhasUnicas = unique(linhas);
    if (linhasUnicas.length === 1) {
      return {
        linha: linhasUnicas[0],
        linhas: linhasUnicas,
        origem: 'getMachines',
        detalhes: detalhes
      };
    }
    if (linhasUnicas.length > 1) {
      return {
        linha: linhasUnicas[0],
        linhas: linhasUnicas,
        origem: 'getMachines-hibrido',
        detalhes: detalhes
      };
    }
    return {
      linha: null,
      linhas: [],
      origem: 'getMachines-sem-tech',
      detalhes: detalhes
    };
  }

  function getLinhaFromCustomer(customer) {
    if (!customer) {
      return { linha: null, linhas: [], origem: 'sem-cliente' };
    }

    const techs = toArray(customer.enabledTechnologies);
    if (customer.preferredTechnology) {
      techs.push(customer.preferredTechnology);
    }

    const linhas = [];
    for (let i = 0; i < techs.length; i++) {
      const linha = detectTechFromString(techs[i]);
      if (linha) linhas.push(linha);
    }
    const linhasUnicas = unique(linhas);

    if (linhasUnicas.length === 1) {
      return {
        linha: linhasUnicas[0],
        linhas: linhasUnicas,
        origem: 'enabledTechnologies'
      };
    }

    if (linhasUnicas.length > 1) {
      const preferida = detectTechFromString(customer.preferredTechnology);
      return {
        linha: preferida || linhasUnicas[0],
        linhas: linhasUnicas,
        origem: 'preferredTechnology'
      };
    }

    return { linha: null, linhas: [], origem: 'sem-maquina' };
  }

  function isPedidoValido(order) {
    if (!order || !order.status) return false;
    return STATUS_PEDIDO_VALIDO.indexOf(order.status) !== -1;
  }

  function getSubtotalPedido(order) {
    if (!order || !order.totals) return 0;
    const semFrete = order.totals.withoutShippingCost;
    const comFrete = order.totals.withShippingCost;
    if (semFrete && typeof semFrete.subTotal === 'number') {
      return semFrete.subTotal;
    }
    if (comFrete && typeof comFrete.subTotal === 'number') {
      return comFrete.subTotal;
    }
    return 0;
  }

  function media(valores) {
    if (!valores || !valores.length) return 0;
    let soma = 0;
    for (let i = 0; i < valores.length; i++) {
      soma += valores[i];
    }
    return soma / valores.length;
  }

  function classificarNivel(linha, ticketMedio) {
    if (!linha) return 'All Visitors';
    const limiar = CONFIG.limiares[linha];
    if (!limiar) return 'All Visitors';
    if (ticketMedio >= limiar.n2) return linha + ' - N2';
    if (ticketMedio >= limiar.n1) return linha + ' - N1';
    return 'All Visitors';
  }

  function codigoAudiencia(label) {
    if (label === 'All Visitors') return 'ALL';
    return label.replace(' - ', '-').replace(' ', '');
  }

  async function getProductSafe(sku) {
    try {
      if (!window.napi || !window.napi.catalog) return null;
      return await window.napi.catalog().getProduct(sku);
    } catch (err) {
      return null;
    }
  }

  function detectTechFromProduct(product) {
    if (!product) return null;
    const techs = toArray(product.technologies);
    for (let i = 0; i < techs.length; i++) {
      const linha = detectTechFromString(techs[i]);
      if (linha) return linha;
    }
    if (product.rootCategory) {
      const fromCategory = detectTechFromString(product.rootCategory);
      if (fromCategory) return fromCategory;
    }
    return null;
  }

  async function analisarPedidos(orders, linhaCliente) {
    const lista = orders && orders.orders ? orders.orders : [];
    const validos = [];
    const statusUnicos = [];
    const ticketsValidos = [];
    const ticketsCapsula = [];
    let qtdLinhasOl = 0;
    let qtdLinhasVl = 0;
    let qtdMaquinas = 0;

    for (let i = 0; i < lista.length; i++) {
      const order = lista[i];
      if (order && order.status && statusUnicos.indexOf(order.status) === -1) {
        statusUnicos.push(order.status);
      }
      if (!isPedidoValido(order)) continue;
      const subtotal = getSubtotalPedido(order);
      if (!(subtotal > 0)) continue;

      const lines =
        order.quotation && order.quotation.cartLines
          ? order.quotation.cartLines
          : [];
      let subtotalCapsula = 0;
      let soMaquina = lines.length > 0;

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        if (!line || !line.item) continue;
        const product = await getProductSafe(line.item);
        if (!product) {
          soMaquina = false;
          continue;
        }
        if (product.type === 'machine') {
          qtdMaquinas += 1;
        } else {
          soMaquina = false;
        }
        if (product.type === 'capsule') {
          subtotalCapsula += typeof line.totalPrice === 'number' ? line.totalPrice : 0;
          const tech = detectTechFromProduct(product);
          if (tech === 'OL') qtdLinhasOl += 1;
          if (tech === 'VL') qtdLinhasVl += 1;
        }
      }

      if (!soMaquina) {
        validos.push(order);
        ticketsValidos.push(subtotal);
      }
      if (subtotalCapsula > 0) {
        ticketsCapsula.push(subtotalCapsula);
      }
    }

    let linhaPedidos = null;
    if (qtdLinhasOl || qtdLinhasVl) {
      linhaPedidos = qtdLinhasOl >= qtdLinhasVl ? 'OL' : 'VL';
    }

    return {
      totalPedidosApi: lista.length,
      totalPedidosValidos: validos.length,
      statusUnicos: statusUnicos,
      ticketMedioSubtotal: media(ticketsValidos),
      ticketMedioCapsulas: media(ticketsCapsula),
      linhaPedidos: linhaPedidos,
      qtdLinhasOl: qtdLinhasOl,
      qtdLinhasVl: qtdLinhasVl,
      qtdMaquinas: qtdMaquinas,
      linhaUsada: linhaCliente || linhaPedidos
    };
  }

  async function classificar() {
    await waitForNapi();

    let customer = null;
    let orders = { orders: [] };
    let machines = null;

    try {
      customer = await window.napi.customer().read();
    } catch (err) {
      customer = null;
    }

    try {
      if (
        window.napi.customer &&
        typeof window.napi.customer().getMachines === 'function'
      ) {
        machines = await window.napi.customer().getMachines();
      }
    } catch (err) {
      machines = null;
    }

    try {
      if (window.napi.checkout && typeof window.napi.checkout().getMyOrders === 'function') {
        orders = await window.napi.checkout().getMyOrders();
      }
    } catch (err) {
      orders = { orders: [] };
    }

    const maquinaCadastro = getLinhaFromCustomer(customer);
    const maquinaRegistrada = await getLinhaFromMachines(machines);
    const maquina = maquinaCadastro.linha ? maquinaCadastro : maquinaRegistrada;
    const analise = await analisarPedidos(orders, maquina.linha);
    const linhaFinal = maquina.linha || analise.linhaPedidos;
    const ticket =
      analise.ticketMedioCapsulas > 0
        ? analise.ticketMedioCapsulas
        : analise.ticketMedioSubtotal;
    const audiencia = classificarNivel(linhaFinal, ticket);

    const resultado = {
      logado: !!(customer && customer.memberNumber),
      memberNumber: customer && customer.memberNumber ? customer.memberNumber : null,
      audiencia: audiencia,
      codigo: codigoAudiencia(audiencia),
      linha: linhaFinal,
      ticketMedio: ticket,
      limiares: linhaFinal ? CONFIG.limiares[linhaFinal] : null,
      maquina: maquina,
      maquinaCadastro: maquinaCadastro,
      machines: machines,
      analisePedidos: analise,
      customerResumo: customer
        ? {
            preferredTechnology: customer.preferredTechnology || null,
            enabledTechnologies: customer.enabledTechnologies || [],
            userGroups:
              customer.userGroups && customer.userGroups.userGroups
                ? customer.userGroups.userGroups
                : [],
            selectionIDs: customer.selectionIDs || [],
            productSelections: customer.productSelections || [],
            orderHistorySize: customer.orderHistorySize || 0,
            lastOrderDate: customer.lastOrderDate || null,
            clubMemberStatus: customer.clubMemberStatus,
            status: customer.status || null
          }
        : null
    };

    window._webjumpAudienciaAtual = resultado;
    return resultado;
  }

  window.webjumpNespressoAudiencia = {
    config: CONFIG,
    get: classificar
  };
})();
