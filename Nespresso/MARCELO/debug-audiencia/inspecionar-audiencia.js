(function () {
  'use strict';

  const STYLE_ID = 'wj-debug-audiencia-style';
  const OVERLAY_ID = 'wjDebugAudienciaOverlay';
  const BTN_ID = 'wjDebugAudienciaBtn';
  const NAPI_POLL_MS = 250;
  const NAPI_TIMEOUT_MS = 12000;

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
          reject(new Error('window.napi nao disponivel apos timeout'));
        }
      }, NAPI_POLL_MS);
    });
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const CHAVES_SENSIVEIS = {
    email: true,
    taxId: true,
    serialNumber: true,
    pairingKey: true,
    macAddress: true,
    userToken: true,
    name: true,
    surname: true,
    firstName: true,
    lastName: true,
    key: true,
    recaptchaKey: true,
    googleTagManagerKey: true
  };

  function sanitizar(value, depth) {
    if (depth > 8 || value == null) return value;
    if (Array.isArray(value)) {
      const out = [];
      const limite = Math.min(value.length, 30);
      for (let i = 0; i < limite; i++) {
        out.push(sanitizar(value[i], depth + 1));
      }
      return out;
    }
    if (typeof value === 'object') {
      const out = {};
      for (const k in value) {
        if (CHAVES_SENSIVEIS[k]) {
          out[k] = '[redacted]';
        } else {
          out[k] = sanitizar(value[k], depth + 1);
        }
      }
      return out;
    }
    return value;
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(sanitizar(value, 0), null, 2);
    } catch (err) {
      return '{"erro":"nao foi possivel serializar"}';
    }
  }

  function listFunctionKeys(obj) {
    const keys = [];
    if (!obj) return keys;
    try {
      for (const k in obj) {
        if (typeof obj[k] === 'function') keys.push(k);
      }
    } catch (err) {
      keys.push('erro-ao-listar');
    }
    return keys;
  }

  function resumirValor(value) {
    if (value == null) return value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (Array.isArray(value)) {
      return {
        tipo: 'array',
        tamanho: value.length,
        amostra: value.slice(0, 5)
      };
    }
    if (typeof value === 'object') {
      const keys = [];
      try {
        for (const k in value) keys.push(k);
      } catch (err) {
        return { tipo: 'object', erro: 'nao listou chaves' };
      }
      return {
        tipo: 'object',
        chaves: keys.slice(0, 40),
        preview: keys.length <= 20 ? value : null
      };
    }
    return String(typeof value);
  }

  const MODULOS_SONDAR = [
    'customer',
    'subscription',
    'checkout',
    'standingOrders'
  ];
  const METODOS_SONDAR = [
    'read',
    'readLoginInfo',
    'readCustomerInfo',
    'getMachines',
    'getPreferences',
    'getSubscriptions',
    'getMyOrders',
    'getMyLastOrder',
    'getOrders',
    'checkCountry'
  ];
  const ARGUMENTOS_METODO = {
    getOrders: 'Responsive'
  };

  function descobrirNapi() {
    const resultado = { existe: !!window.napi, modulos: [], metodos: {} };
    if (!window.napi) return resultado;
    try {
      resultado.modulos = Object.keys(window.napi);
    } catch (err) {
      resultado.modulos = [];
    }
    for (let i = 0; i < resultado.modulos.length; i++) {
      const nome = resultado.modulos[i];
      try {
        const instancia = window.napi[nome]();
        resultado.metodos[nome] = listFunctionKeys(instancia);
      } catch (err) {
        resultado.metodos[nome] = ['erro: ' + (err && err.message ? err.message : String(err))];
      }
    }
    return resultado;
  }

  async function sondarModulos(napiInfo) {
    const sondagem = {};
    for (let i = 0; i < MODULOS_SONDAR.length; i++) {
      const nome = MODULOS_SONDAR[i];
      if (!window.napi || typeof window.napi[nome] !== 'function') continue;
      const item = { metodos: [], chamadas: {} };
      try {
        const instancia = window.napi[nome]();
        item.metodos =
          napiInfo.metodos && napiInfo.metodos[nome]
            ? napiInfo.metodos[nome]
            : listFunctionKeys(instancia);
        for (let j = 0; j < item.metodos.length; j++) {
          const metodo = item.metodos[j];
          if (METODOS_SONDAR.indexOf(metodo) === -1) continue;
          try {
            const bruto =
              ARGUMENTOS_METODO[metodo] != null
                ? instancia[metodo](ARGUMENTOS_METODO[metodo])
                : instancia[metodo]();
            const resolved =
              bruto && typeof bruto.then === 'function' ? await bruto : bruto;
            item.chamadas[metodo] = resumirValor(resolved);
          } catch (errChamada) {
            item.chamadas[metodo] =
              'erro: ' + (errChamada && errChamada.message ? errChamada.message : String(errChamada));
          }
        }
      } catch (errModulo) {
        item.erro = errModulo && errModulo.message ? errModulo.message : String(errModulo);
      }
      sondagem[nome] = item;
    }
    return sondagem;
  }

  function money(value) {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function detectLinha(value) {
    if (!value || typeof value !== 'string') return null;
    const lower = value.toLowerCase();
    if (lower.indexOf('vertuo') !== -1) return 'VL';
    if (lower.indexOf('original') !== -1) return 'OL';
    return null;
  }

  function classificarFallback(customer, orders) {
    const limiares = { OL: { n1: 120, n2: 170 }, VL: { n1: 120, n2: 170 } };
    const techs = [];
    if (customer && customer.preferredTechnology) techs.push(customer.preferredTechnology);
    if (customer && customer.enabledTechnologies) {
      for (let i = 0; i < customer.enabledTechnologies.length; i++) {
        techs.push(customer.enabledTechnologies[i]);
      }
    }
    const linhas = [];
    for (let i = 0; i < techs.length; i++) {
      const linha = detectLinha(techs[i]);
      if (linha && linhas.indexOf(linha) === -1) linhas.push(linha);
    }
    const linha = detectLinha(customer && customer.preferredTechnology) || linhas[0] || null;
    const pedidos = orders && orders.orders ? orders.orders : [];
    const tickets = [];
    for (let i = 0; i < pedidos.length; i++) {
      const order = pedidos[i];
      if (!order || order.status !== 'DELIVERED') continue;
      const semFrete = order.totals && order.totals.withoutShippingCost;
      const subtotal = semFrete && typeof semFrete.subTotal === 'number' ? semFrete.subTotal : 0;
      if (subtotal > 0) tickets.push(subtotal);
    }
    let ticketMedio = 0;
    if (tickets.length) {
      let soma = 0;
      for (let i = 0; i < tickets.length; i++) soma += tickets[i];
      ticketMedio = soma / tickets.length;
    }
    let audiencia = 'All Visitors';
    if (linha && limiares[linha]) {
      if (ticketMedio >= limiares[linha].n2) audiencia = linha + ' - N2';
      else if (ticketMedio >= limiares[linha].n1) audiencia = linha + ' - N1';
    }
    return {
      audiencia: audiencia,
      linha: linha,
      ticketMedio: ticketMedio,
      maquina: { origem: linha ? 'preferredTechnology/enabledTechnologies' : 'sem-maquina' },
      analisePedidos: { totalPedidosValidos: tickets.length }
    };
  }

  function joinList(list) {
    if (!list || !list.length) return '(vazio)';
    return list.join(', ');
  }

  function metodosNapiResumo(napiInfo) {
    if (!napiInfo || !napiInfo.metodos) return '(vazio)';
    const partes = [];
    const nomes = ['customer', 'subscription', 'promotion', 'misc', 'checkout', 'standingOrders'];
    for (let i = 0; i < nomes.length; i++) {
      const nome = nomes[i];
      const metodos = napiInfo.metodos[nome];
      if (!metodos || !metodos.length) continue;
      partes.push(nome + ': ' + metodos.join('/'));
    }
    return partes.length ? partes.join(' | ') : '(vazio)';
  }

  function resumoMaquinas(machines, machinesError) {
    if (machinesError) return 'erro: ' + machinesError;
    if (machines == null) return '(vazio)';
    if (Array.isArray(machines)) {
      return 'array(' + machines.length + ')';
    }
    if (typeof machines === 'object') {
      const keys = [];
      for (const k in machines) keys.push(k);
      const tamanho = Array.isArray(machines.machines)
        ? machines.machines.length
        : Array.isArray(machines.items)
          ? machines.items.length
          : null;
      return tamanho != null
        ? 'object keys=' + keys.join(',') + ' qtd=' + tamanho
        : 'object keys=' + keys.join(',');
    }
    return String(machines);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          window.alert('Copiado. Cole no chat da Webjump.');
        },
        function () {
          window.alert(text);
        }
      );
      return;
    }
    window.alert(text);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '#' + OVERLAY_ID + ' {',
      '  position: fixed; inset: 0; z-index: 2147483646;',
      '  display: flex; align-items: flex-start; justify-content: center;',
      '  background: rgba(0,0,0,.72); padding: 16px; overflow: auto;',
      "  font-family: NespressoLucas, Helvetica Neue, Arial, sans-serif;",
      '}',
      '.wj-debug-box {',
      '  width: 720px; max-width: 100%; margin: 24px 0; background: #111;',
      '  color: #f5f5f5; border-radius: 16px; padding: 20px 20px 16px;',
      '  box-shadow: 0 18px 48px rgba(0,0,0,.4);',
      '}',
      '.wj-debug-box h2 { margin: 0 0 8px; font-size: 18px; color: #fff; }',
      '.wj-debug-box p { margin: 0 0 12px; font-size: 13px; line-height: 1.45; color: #ddd; }',
      '.wj-debug-badge {',
      '  display: inline-block; margin: 0 0 12px; padding: 6px 12px;',
      '  border-radius: 999px; background: #ab2418; color: #fff;',
      '  font-size: 13px; font-weight: 700; letter-spacing: .4px;',
      '}',
      '.wj-debug-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin-bottom: 12px; }',
      '.wj-debug-item { background: #1c1c1c; border-radius: 8px; padding: 8px 10px; }',
      '.wj-debug-item strong { display: block; font-size: 11px; color: #aaa; text-transform: uppercase; }',
      '.wj-debug-item span { font-size: 13px; word-break: break-word; }',
      '.wj-debug-pre {',
      '  max-height: 280px; overflow: auto; background: #000; color: #c8f7c5;',
      '  font: 11px/1.4 Consolas, Monaco, monospace; padding: 10px;',
      '  border-radius: 8px; white-space: pre-wrap; word-break: break-word;',
      '}',
      '.wj-debug-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }',
      '.wj-debug-actions button {',
      '  border: 0; border-radius: 20px; padding: 8px 14px; cursor: pointer;',
      '  font-size: 12px; font-weight: 700; text-transform: uppercase;',
      '}',
      '.wj-debug-primary { background: #fff; color: #111; }',
      '.wj-debug-secondary { background: #333; color: #fff; }',
      '#' + BTN_ID + ' {',
      '  position: fixed; right: 12px; bottom: 12px; z-index: 2147483645;',
      '  border: 0; border-radius: 20px; padding: 10px 14px; cursor: pointer;',
      '  background: #ab2418; color: #fff; font-weight: 700; font-size: 12px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureOpenButton(onClick) {
    let btn = document.getElementById(BTN_ID);
    if (btn) return btn;
    btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.textContent = 'Webjump audiencia';
    btn.addEventListener('click', onClick);
    document.body.appendChild(btn);
    return btn;
  }

  function closeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
  }

  function renderModal(payload, resumoTexto, jsonTexto) {
    closeOverlay();
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML =
      '<div class="wj-debug-box">' +
      '  <h2>Inspecao de audiencia Nespresso</h2>' +
      '  <p>console.log nao aparece neste site. Use este modal, Copiar ou window.alert.</p>' +
      '  <div class="wj-debug-badge">' +
      escapeHtml(payload.audiencia || 'All Visitors') +
      '  </div>' +
      '  <div class="wj-debug-grid">' +
      '    <div class="wj-debug-item"><strong>Logado</strong><span>' +
      escapeHtml(payload.logado ? 'sim' : 'nao') +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>Linha</strong><span>' +
      escapeHtml(payload.linha || 'indefinida') +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>Ticket medio</strong><span>' +
      escapeHtml(money(payload.ticketMedio)) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>Origem da linha</strong><span>' +
      escapeHtml(payload.origemLinha || '-') +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>Pedidos validos</strong><span>' +
      escapeHtml(String(payload.pedidosValidos)) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>Status pedidos</strong><span>' +
      escapeHtml(payload.statusPedidos) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>preferredTechnology</strong><span>' +
      escapeHtml(payload.preferredTechnology) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>enabledTechnologies</strong><span>' +
      escapeHtml(payload.enabledTechnologies) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>userGroups</strong><span>' +
      escapeHtml(payload.userGroups) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>selectionIDs</strong><span>' +
      escapeHtml(payload.selectionIDs) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>orderHistorySize</strong><span>' +
      escapeHtml(payload.orderHistorySize) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>lastOrderDate</strong><span>' +
      escapeHtml(payload.lastOrderDate) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>productSelections</strong><span>' +
      escapeHtml(payload.productSelections) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>metodos napi</strong><span>' +
      escapeHtml(payload.metodosNapi) +
      '</span></div>' +
      '    <div class="wj-debug-item"><strong>getMachines</strong><span>' +
      escapeHtml(payload.maquinasResumo) +
      '</span></div>' +
      '  </div>' +
      '  <pre class="wj-debug-pre">' +
      escapeHtml(jsonTexto) +
      '</pre>' +
      '  <div class="wj-debug-actions">' +
      '    <button type="button" class="wj-debug-primary" data-wj-act="copy-resumo">Copiar resumo</button>' +
      '    <button type="button" class="wj-debug-primary" data-wj-act="copy-json">Copiar JSON</button>' +
      '    <button type="button" class="wj-debug-secondary" data-wj-act="alert">Alert resumo</button>' +
      '    <button type="button" class="wj-debug-secondary" data-wj-act="close">Fechar</button>' +
      '  </div>' +
      '</div>';

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });

    overlay.addEventListener('click', function (e) {
      const act = e.target && e.target.getAttribute && e.target.getAttribute('data-wj-act');
      if (act === 'copy-resumo') copyText(resumoTexto);
      if (act === 'copy-json') copyText(jsonTexto);
      if (act === 'alert') window.alert(resumoTexto);
      if (act === 'close') closeOverlay();
    });

    document.body.appendChild(overlay);
  }

  async function coletar() {
    const napiInfo = descobrirNapi();
    const sondagem = await sondarModulos(napiInfo);
    let customer = null;
    let customerError = null;
    let orders = null;
    let ordersError = null;
    let standing = null;
    let standingError = null;
    let machines = null;
    let machinesError = null;
    let audienciaApi = null;

    try {
      customer = await window.napi.customer().read();
    } catch (err) {
      customerError = err && err.message ? err.message : String(err);
    }

    try {
      orders = await window.napi.checkout().getMyOrders();
    } catch (err) {
      ordersError = err && err.message ? err.message : String(err);
    }

    try {
      if (window.napi.standingOrders) {
        standing = await window.napi.standingOrders().getOrders('Responsive');
      }
    } catch (err) {
      standingError = err && err.message ? err.message : String(err);
    }

    try {
      if (
        window.napi.customer &&
        typeof window.napi.customer().getMachines === 'function'
      ) {
        machines = await window.napi.customer().getMachines();
      }
    } catch (err) {
      machinesError = err && err.message ? err.message : String(err);
    }

    if (window.webjumpNespressoAudiencia && typeof window.webjumpNespressoAudiencia.get === 'function') {
      try {
        audienciaApi = await window.webjumpNespressoAudiencia.get();
      } catch (err) {
        audienciaApi = { erro: err && err.message ? err.message : String(err) };
      }
    } else {
      audienciaApi = classificarFallback(customer, orders);
    }

    const grupos =
      customer && customer.userGroups && customer.userGroups.userGroups
        ? customer.userGroups.userGroups
        : [];
    const selectionIDs = customer && customer.selectionIDs ? customer.selectionIDs : [];
    const enabled = customer && customer.enabledTechnologies ? customer.enabledTechnologies : [];
    const pedidos = orders && orders.orders ? orders.orders : [];
    const statusPedidos = [];
    for (let i = 0; i < pedidos.length; i++) {
      const st = pedidos[i] && pedidos[i].status;
      if (st && statusPedidos.indexOf(st) === -1) statusPedidos.push(st);
    }

    const dump = {
      url: window.location.href,
      napi: napiInfo,
      sondagemModulos: sondagem,
      audienciaCalculada: audienciaApi,
      customerError: customerError,
      ordersError: ordersError,
      standingError: standingError,
      machinesError: machinesError,
      machines: machines,
      customer: customer,
      pedidosResumo: pedidos.map(function (order) {
        const semFrete =
          order && order.totals && order.totals.withoutShippingCost
            ? order.totals.withoutShippingCost.subTotal
            : null;
        return {
          orderId: order && order.orderId,
          status: order && order.status,
          creationDate: order && order.creationDate,
          subTotal: semFrete,
          linhas:
            order && order.quotation && order.quotation.cartLines
              ? order.quotation.cartLines
              : []
        };
      }),
      standingOrdersResumo: standing
        ? {
            tipo: Array.isArray(standing) ? 'array' : typeof standing,
            tamanho: Array.isArray(standing)
              ? standing.length
              : standing && standing.orders
                ? standing.orders.length
                : null
          }
        : null
    };

    window._webjumpDebugAudiencia = dump;

    const payload = {
      audiencia:
        audienciaApi && audienciaApi.audiencia ? audienciaApi.audiencia : 'sem classificador',
      logado: !!(customer && customer.memberNumber),
      linha: audienciaApi && audienciaApi.linha ? audienciaApi.linha : '-',
      ticketMedio: audienciaApi && typeof audienciaApi.ticketMedio === 'number' ? audienciaApi.ticketMedio : null,
      origemLinha:
        audienciaApi && audienciaApi.maquina && audienciaApi.maquina.origem
          ? audienciaApi.maquina.origem
          : '-',
      pedidosValidos:
        audienciaApi && audienciaApi.analisePedidos
          ? audienciaApi.analisePedidos.totalPedidosValidos
          : pedidos.length,
      statusPedidos: joinList(statusPedidos),
      preferredTechnology: (customer && customer.preferredTechnology) || '(vazio)',
      enabledTechnologies: joinList(enabled),
      userGroups: joinList(grupos),
      selectionIDs: joinList(selectionIDs),
      orderHistorySize:
        customer && typeof customer.orderHistorySize === 'number'
          ? String(customer.orderHistorySize)
          : '(vazio)',
      lastOrderDate: (customer && customer.lastOrderDate) || '(vazio)',
      productSelections: joinList(
        customer && customer.productSelections ? customer.productSelections : []
      ),
      metodosNapi: metodosNapiResumo(napiInfo),
      maquinasResumo: resumoMaquinas(machines, machinesError)
    };

    const resumoTexto = [
      'AUDIENCIA: ' + payload.audiencia,
      'LOGADO: ' + (payload.logado ? 'sim' : 'nao'),
      'LINHA: ' + payload.linha,
      'TICKET MEDIO: ' + money(payload.ticketMedio),
      'ORIGEM LINHA: ' + payload.origemLinha,
      'PREFERRED: ' + payload.preferredTechnology,
      'ENABLED: ' + payload.enabledTechnologies,
      'USERGROUPS: ' + payload.userGroups,
      'SELECTIONIDS: ' + payload.selectionIDs,
      'ORDERHISTORYSIZE: ' + payload.orderHistorySize,
      'LASTORDERDATE: ' + payload.lastOrderDate,
      'PRODUCTSELECTIONS: ' + payload.productSelections,
      'STATUS PEDIDOS: ' + payload.statusPedidos,
      'NAPI MODULOS: ' + joinList(napiInfo.modulos),
      'NAPI METODOS: ' + payload.metodosNapi,
      'GETMACHINES: ' + payload.maquinasResumo
    ].join('\n');

    return {
      payload: payload,
      resumoTexto: resumoTexto,
      jsonTexto: safeStringify(dump)
    };
  }

  async function abrir() {
    injectStyles();
    try {
      await waitForNapi();
      const data = await coletar();
      renderModal(data.payload, data.resumoTexto, data.jsonTexto);
    } catch (err) {
      const msg = 'Falha ao inspecionar audiencia: ' + (err && err.message ? err.message : String(err));
      window.alert(msg);
    }
  }

  function init() {
    injectStyles();
    ensureOpenButton(abrir);
    abrir();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
