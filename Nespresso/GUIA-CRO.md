# Nespresso — Guia CRO

Referência rápida para scripts CRO no site Nespresso BR.  
Documentação expandida da API: `.context/instructions/nespresso.md`  
Padrão de campanhas (régua/accordion): `MARCELO/Campanhas/PADRAO-ATUALIZACAO-CAMPANHAS.md`

---

## 1. API Nespresso (`window.napi`)

Sempre aguardar `window.napi` existir antes de usar (polling curto com timeout).

### Consulta (leitura)

| Função | Retorno | Caso de uso |
|--------|---------|-------------|
| `napi.cart().read()` | `Array` de itens: `productId`, `quantity`, `nonRemovable`, `unitPrice`, `subscriptionId`… | Réguas, seletor de qtd, recomendações, remoção de itens, sync PLP ↔ carrinho |
| `napi.catalog().getProduct(sku)` | Objeto do produto: `type`, `technologies`, `name`, `price`, `unitQuantity`, `bundled`, `salesMultiple`, imagens, `pdpURLs`… | Saber se é cápsula OL/VL, contar kits, montar cards, filtrar por tech |
| `napi.catalog().getStocks()` | Mapa `{ "erp.br.b2c/prod/SKU": true/false }` | Vitrines — só exibir SKUs com estoque |
| `napi.customer().read()` | Cliente logado: `firstName`, `memberNumber`, `clubCredit`, `preferredTechnology`, `userGroups`… | Crédito, personalização, checar login, assinatura |
| `napi.customer().getMachines()` | Máquinas **registradas** do clube | Payload **sem** `original`/`vertuo`: só `productId`, serial, `purchaseMethod`. Resolver a linha com `catalog().getProduct(productId).technologies`. Não usar sozinho se `preferredTechnology` já existir. |
| `napi.subscription().getSubscriptions()` | Assinaturas ativas | Saber se tem contrato OL/VL |
| `napi.promotion().getClubAction()` / `getIncentive()` | Ações/incentivos do clube | Possível atalho de campanha; formato ainda em mapeamento |
| `napi.checkout().getMyOrders()` | `{ orders: [...] }` com status, `quotation.cartLines`, totais | Vitrine “últimas compras” / cafés favoritos |
| `napi.standingOrders().getOrders('Responsive')` | Array de pedidos recorrentes (`recurringOrderStatus`, linhas…) | Erro de pagamento / cafés descontinuados na assinatura |
| `napi.priceFormat()` | Helper com `.short(currency, value)` | Formatador de preço em carrosséis/vitrines |

Módulos extras vistos no `window.napi` (ainda em mapeamento): `subscription`, `promotion`, `misc`, `ratings`, `stocks`, `identityProvider`, `oneTimeToken`, `cms`, `market`. O inspetor lista os métodos de cada um.

### Eventos

| Função | Retorno | Caso de uso |
|--------|---------|-------------|
| `napi.data().on('cart.update', callback)` | Listener (não é consulta) | Reagir a mudanças no carrinho e re-renderizar UI |

### Escrita (carrinho)

| Função | Uso |
|--------|-----|
| `napi.cart().addOrUpdateProducts([{ productId, quantity, subscriptionId? }])` | Atualizar/zerar vários itens (ex.: limpar minicart) |
| `CartManager.updateItem(sku, qty, …)` | Add/update de um SKU (padrão PLP / seletor) |
| `CartManager.removeSubscription()` | Remover item de assinatura do carrinho |

### Botão nativo add-to-cart

```html
<div class="add-to-bag" data-product-id="erp.br.b2c/prod/SKU" data-button-size="small"></div>
```

Depois de injetar o HTML:

```javascript
mosaic.initializeAllFreeHTMLModules(document.getElementById('CONTAINER_DO_NOVO_BOTAO'));
```

### Combo clássico (régua minicart)

```javascript
window.napi.data().on('cart.update', handleCartUpdate);

async function handleCartUpdate() {
  const cartItems = await window.napi.cart().read();
  for (const item of cartItems) {
    if (item.nonRemovable) continue;
    const product = await window.napi.catalog().getProduct(item.productId);
    // product.type === 'capsule'
    // product.technologies[0] → original | vertuo
    // product.bundled ? product.unitQuantity * item.quantity : item.quantity
  }
}
```

### Campos úteis do produto

| Campo | Uso |
|-------|-----|
| `type` | `"capsule"`, `"machine"`, `"accessory"`… |
| `technologies[0]` | Contém `"original"` ou `"vertuo"` |
| `bundled` + `unitQuantity` | Kits: multiplicar pela qtd no carrinho |
| `salesMultiple` | Pack padrão (ex.: 10 cápsulas) |
| `price` / `unitPrice` | Preço unitário |
| `responsiveImages` / `images` / `slides` | Imagens |
| `pdpURLs.desktop` | Link PDP |
| `nonRemovable` (no item do cart) | Brinde/oferta — geralmente **não contar** na régua |

### Prefixos de SKU

- Carrinho / botão: `erp.br.b2c/prod/7890.90`
- `getProduct` aceita SKU curto (`7890.90`) ou ID completo

---

## 2. Paleta de cores

### Papéis fixos (hex muda por campanha)

| Papel | Função visual |
|-------|----------------|
| **Principal** | Cor dominante — cabeçalho accordion, textos de destaque, níveis atingidos na régua |
| **Secundária** | Contraste / highlight (fundo de nível atingido, badges) |
| **Terciária** | Fundo de conteúdo expandido |
| **Quaternária** | Divisores / detalhes |

> Sempre pegar hex do playbook/KV da campanha atual. **Não** reusar paleta da campanha anterior.

### Exemplos recentes

| Campanha | Principal | Secundária | Terciária | Quaternária |
|----------|-----------|------------|-----------|-------------|
| Boost Dia dos Pais | `#ab2418` | `#ffffff` | `#ffffff` | `#000000` |
| Boost Vertuo World | `#3d441e` | `#fbeaa0` | `#f8ecdf` | `#b3ca9a` |

### Neutros da régua (fixos)

| Estado | Fundo | Borda / linha | Texto |
|--------|-------|---------------|-------|
| Nível **não atingido** | `#f5f5f5` | `#cccccc` | `#999999` |
| Nível **atingido** | Secundária (ou branco + principal) | Principal | Principal |

### Tipografia

- Fonte: `NespressoLucas, sans-serif`
- Separadores comuns: `#efefef`

---

## 3. Regras básicas de script

| Tema | Regra |
|------|--------|
| Escopo | IIFE `(function () { ... })();` |
| Variáveis | `let` / `const` no topo — sem `var` |
| Strings | Preferir concatenação com `+` (padrão Target legado; evitar backticks se o pipeline exigir) |
| Logs / comentários | Português, sem emojis |
| CSS | Injetar `<style id="...">` uma vez; early return se já existir |
| DOM | `data-*` para “já processado” / listener já adicionado |
| Observers | Debounce + flag `isProcessing`; não reagir às próprias mutations |
| Init | Checar `document.readyState`; polling de `napi` com limite |
| Página | Guard de pathname quando o teste for específico |
| Identificadores | Nome da campanha em flags/IDs (`window.acordeaoBoostDiaDosPais`, etc.) — sem resíduo de campanha anterior |

### Tracking GA4 (obrigatório se houver interação)

```javascript
function sendGAEvent(label) {
  window.gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: 'local_event',
    event_raised_by: 'br',
    local_event_category: 'user engagement',
    local_event_action: 'click',
    local_event_label: label,
  });
}
```

- Labels em **lowercase** com `_` (ex.: `abriu_accordion`, `clicou_comunicacao_oferta`)
- Identificação do experimento Adobe Target (`adobe_target`) fica em atividade **separada** — não misturar nos scripts de UI

### Campanhas (régua / accordion)

Estrutura típica em `MARCELO/Campanhas/<Nome>/`:

| Pasta | Escopo |
|-------|--------|
| `N1-N5/` | Ofertas N1–N5 |
| `N2-N5/` | Ofertas N2–N5 |
| `Ofertas abertas/` | Níveis abertos (ex.: N3–N5) |

Arquivos: `regua_minicart_*.js`, `accordion-*.js`, banners PLP.  
Checklist completo: `MARCELO/Campanhas/PADRAO-ATUALIZACAO-CAMPANHAS.md`

---

## 4. Checklist rápido

- [ ] `window.napi` disponível antes de chamar API
- [ ] Itens `nonRemovable` tratados (não contar na régua / não remover)
- [ ] Kits: `bundled` × `unitQuantity`
- [ ] Tech OL/VL via `technologies[0]`
- [ ] Listener `cart.update` + re-leitura do carrinho
- [ ] Paleta da campanha atual (4 papéis)
- [ ] `sendGAEvent` nas interações
- [ ] IDs/flags sem nome de campanha antiga
- [ ] Debug: **não** usar `console.log` (saída não aparece no site Nespresso)

---

## 5. Debug no site Nespresso (obrigatório)

No front da Nespresso **não dá para ver o retorno de `console.log`**. A saída é engolida / não aparece no DevTools. Para inspecionar dados em QA ou no Target, use uma destas opções:

| Método | Quando usar |
|--------|-------------|
| `window.alert(texto)` | Resumo curto (audiência, ticket, linha, erro). Sempre visível. |
| Modal / componente criado pelo script | Dump completo (JSON, `userGroups`, pedidos). Preferível para coleta. |
| `navigator.clipboard.writeText` + botão Copiar | Enviar o dump para o chat / doc. Fallback: `window.alert`. |

**Não use `console.log` como forma de debug em scripts Nespresso.** Mesmo em desenvolvimento, o valor não aparece.

Exemplo mínimo:

```javascript
window.alert('audiencia=' + codigo + ' ticket=' + ticketMedio);
```

Script de inspeção (modal + copiar + alert): `MARCELO/debug-audiencia/inspecionar-audiencia.js`.

---

## 6. Audiências de campanha sem Adobe Target (OL/VL × N1/N2)

No Target as campanhas (ex.: Boost Dia dos Pais) usam 5 experiências:

| Audiência Target | Significado |
|------------------|-------------|
| `VL - N1` | Máquina/cápsulas Vertuo + ticket médio faixa N1 |
| `VL - N2` | Máquina/cápsulas Vertuo + ticket médio faixa N2 |
| `OL - N1` | Máquina/cápsulas Original + ticket médio faixa N1 |
| `OL - N2` | Máquina/cápsulas Original + ticket médio faixa N2 |
| `All Visitors` / Ofertas abertas | Não logado, sem máquina, ou ticket abaixo de N1 |

João (CRM): a audiência é **ticket médio do comprador** + **máquina registrada ou comprada**. Os valores mudam por campanha (faixa típica OL: N1 ~ R$ 120, N2 ~ R$ 170).

### O que a API do front consegue hoje

| Dado | Fonte | Observação |
|------|--------|------------|
| Linha OL / VL | `napi.customer().read()` → `preferredTechnology`, `enabledTechnologies` | **Prioridade 1.** Híbrido (OL+VL habilitados) segue `preferredTechnology`. |
| Fallback de linha | `getMachines()` + `catalog().getProduct(productId)` | Só se o cadastro não tiver tech. O SKU da máquina (ex. `MC1-BR3-BK-NE`) não traz a linha no payload. |
| Ticket médio aproximado | `napi.checkout().getMyOrders()` → média dos `DELIVERED` com `subTotal > 0`, **só linhas de cápsula**, excluindo pedido só-máquina | **Não é o ticket CRM oficial.** Pedido R$ 0, máquina e acessório distorcem o N1/N2. |
| Grupos / SELID | `userGroups.userGroups`, `selectionIDs`, `productSelections` | Grupos de campanha (`br_b2c_campanhaaquisicao2025_compedidos`) **não** carregam N1/N2. |

Classificador reutilizável: `MARCELO/debug-audiencia/classificar-audiencia.js`  
Expõe `window.webjumpNespressoAudiencia.get()` → `{ audiencia, codigo, linha, ticketMedio, ... }`.

Limiares padrão (ajustáveis em `config.limiares`):

```javascript
OL: { n1: 120, n2: 170 }
VL: { n1: 120, n2: 170 }
```

N2 se `ticket >= n2`; N1 se `n1 <= ticket < n2`; senão All Visitors.

### Limitações (não copiar o Target 1:1 sem validar)

- Ticket CRM costuma ser janela/regra de negócio (ex.: 12 meses, só cápsulas). O front calcula na amostra de `getMyOrders`.
- Limiar VL e valores exatos da campanha atual **não estão na API** — precisam vir do João / briefing.
- Cliente híbrido (OL + VL): usamos `preferredTechnology`.
- Não logado → sempre All Visitors.

### Como usar nas personalizações

1. Injetar `classificar-audiencia.js` (ou o `get()` no próprio script).
2. `const perfil = await window.webjumpNespressoAudiencia.get();`
3. Trocar a experiência com `perfil.codigo` (`OL-N1`, `OL-N2`, `VL-N1`, `VL-N2`, `ALL`) em vez de 5 atividades Target.

Antes de ir para produção, validar com o inspector em contas conhecidas de cada audiência Target.
