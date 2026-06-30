# Padrão de atualização de campanhas Nespresso (CRO)

Guia de referência para migrar ou configurar uma nova campanha a partir de uma campanha anterior. Use este arquivo em prompts futuros apontando para `@Nespresso/MARCELO/Campanhas/PADRAO-ATUALIZACAO-CAMPANHAS.md`.

---

## Estrutura de pastas

Cada campanha fica em `Nespresso/MARCELO/Campanhas/<NomeDaCampanha>/` com segmentações por nível de oferta:

| Pasta | Escopo de ofertas |
|-------|-------------------|
| `N1-N5/` | Ofertas do N1 ao N5 (segmentadas + abertas) |
| `N2-N5/` | Ofertas do N2 ao N5 |
| `Ofertas abertas/` | Ofertas do N3 ao N5 (apenas níveis abertos) |

### Arquivos por pasta

**Accordions (mobile, `innerWidth <= 600`):**

| Arquivo | Uso |
|---------|-----|
| `accordion-dinamico.js` | Detecta linha pela URL (`/original` ou `/vertuo`) |
| `accordion-ol.js` | Somente linha Original |
| `accordion-vl.js` | Somente linha Vertuo |

**Régua do minicart:**

| Arquivo | Uso |
|---------|-----|
| `regua_minicart_dinamico.js` | OL + VL no mesmo script |
| `regua_minicart_ol.js` | Somente Original |
| `regua_minicart_vl.js` | Somente Vertuo |

**Banners PLP (desktop):**

| Arquivo | Uso |
|---------|-----|
| `banner-plp-ol.html` | Banner da PLP Original |
| `banner-plp-vl.html` | Banner da PLP Vertuo |

---

## Checklist de atualização

Ao receber uma nova campanha, atualizar **nesta ordem**:

1. [ ] **Ofertas** — quantidades, títulos, `alt`, `gift`, `shortName`, `displayName`
2. [ ] **Ícones / imagens** — URLs dos brindes por nível (N1 a N5)
3. [ ] **Cores** — paleta da campanha (accordion + régua do minicart)
4. [ ] **Identificadores técnicos** — flags `window`, classes CSS, IDs de container
5. [ ] **Termos e Condições** — texto completo do modal (`modal.conteudo`)
6. [ ] **Banners PLP** — URLs das imagens de cabeçalho (se houver novas)

> **Importante:** não deixar referências da campanha anterior (ex.: `Namorados`, `Summer`, `Maes`) em identificadores de código.

---

## 1. Ofertas

### Segmentos e quantidades

Sempre existem dois segmentos com quantidades diferentes:

| Nível | OL (Original) | VL (Vertuo) |
|-------|---------------|-------------|
| N1 | _informar_ | _informar_ |
| N2 | _informar_ | _informar_ |
| N3 | _informar_ | _informar_ |
| N4 | _informar_ | _informar_ |
| N5 | _informar_ | _informar_ |

### Campos a atualizar

**Accordion** (`CAMPANHA_CONFIG.ofertas`):

```js
{
  quantidadeCafes: 70,
  imagem: "https://...",
  titulo: "Ganhe 1 Tote Bag",
  alt: "Tote Bag",
}
```

**Régua** (`giftTiers`):

```js
{
  threshold: 70,
  gift: "1 Tote Bag",
  shortName: "1 Tote Bag",
  displayName: "GANHE 1 TOTE BAG",
  imageUrl: "https://...",
}
```

### Escopo por pasta

- **N1-N5:** incluir N1, N2, N3, N4 e N5
- **N2-N5:** incluir apenas N2, N3, N4 e N5
- **Ofertas abertas:** incluir apenas N3, N4 e N5

---

## 2. Ícones / imagens dos brindes

Uma URL por nível (N1 a N5), aplicada em **accordion** (`imagem`) e **régua** (`imageUrl`).

Exemplo de formato:

```
N1: https://www.nespresso.com/ecom/medias/sys_master/public/.../Dinamic-Banner-N1-1.jpg?attachment=true&cimgnr=...
N2: ...
N3: ...
N4: ...
N5: ...
```

- N1 OL e N1 VL usam a **mesma imagem** quando só há um asset de N1.
- Banners PLP (`banner-plp-*.html`) são peças de cabeçalho da página — **não** confundir com ícones de oferta.

---

## 3. Cores da campanha

Definir 4 cores e aplicar em accordion e régua:

| Papel | Exemplo (Boost Vertuo World) | Uso sugerido |
|-------|------------------------------|--------------|
| **Principal** | `#3d441e` | Cabeçalho accordion, textos de destaque, bordas ativas, progresso conquistado |
| **Secundária** | `#fbeaa0` | Título/ícones no header escuro, badge, highlights de cápsulas, borda shimmer |
| **Terciária** | `#f8ecdf` | Fundo do conteúdo expandido, tiers não conquistados, caixa de brinde atual |
| **Quaternária** | `#b3ca9a` | Divisores entre ofertas, bordas/progresso pendente |

### Accordion — composição recomendada

- **Header:** fundo principal (`#3d441e`), título e ícones na secundária (`#fbeaa0`)
- **Subtítulo:** terciária (`#f8ecdf`)
- **Badge:** fundo secundária + texto principal
- **Conteúdo expandido:** fundo terciária
- **Itens de oferta:** borda superior quaternária, título na cor principal

### Régua — composição recomendada

- Highlight de cápsulas: fundo secundária
- Tier conquistado: borda principal, fundo branco
- Tier pendente: fundo terciária, borda quaternária
- Barra de progresso: principal (conquistado) / quaternária (pendente)
- Shimmer no tier atual: borda secundária (contraste no minicart escuro)
- Tooltip: fundo principal

### Cores antigas a substituir (campanhas vermelhas/rosa)

| Antiga | Substituir por |
|--------|----------------|
| `#660e06`, `#ab2417` | Cor **principal** |
| `#ffa29a`, `#ffa29a33` | Cor **secundária** / **terciária** |
| `#f9f3e6`, `#f5f5f5` | Cor **terciária** |
| `#8d3577`, `#8d8d8d`, `#e2e2e2` | Cor **quaternária** ou **principal** |

---

## 4. Identificadores técnicos

Renomear **todos** os identificadores para o nome da campanha atual (camelCase, sem espaços).

### Padrão de nomenclatura

Para uma campanha chamada **Boost Vertuo World**, usar o slug `BoostVertuoWorld`:

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Flag accordion | `window.acordeao<NomeCampanha>` | `window.acordeaoBoostVertuoWorld` |
| Flag régua | `window.<nomeCampanha>ProgressBar` | `window.boostVertuoWorldProgressBar` |
| Classe link T&C | `linkCondicoesOferta<NomeCampanha>` | `linkCondicoesOfertaBoostVertuoWorld` |
| Classe modal T&C | `modalTermosECondicoes<NomeCampanha>` | `modalTermosECondicoesBoostVertuoWorld` |
| ID container régua | `nespresso-<slug-kebab>-offers` | `nespresso-boost-vertuo-world-offers` |

### Nunca reutilizar de campanhas anteriores

- `acordeaoNamorados`
- `linkCondicoesOfertaMaes`
- `modalTermosECondicoesCampanhaMaes`
- `nespresso-summer-offers`
- `window.campaignProgressBar` (genérico demais — usar nome da campanha)

---

## 5. Termos e Condições

Sempre atualizar quando o texto oficial estiver disponível.

### Onde alterar

Bloco `modal.conteudo` dentro de `CAMPANHA_CONFIG` nos arquivos:

- `accordion-dinamico.js` (todas as pastas que existirem)
- `accordion-ol.js`
- `accordion-vl.js`

### O que incluir no texto

- Nome da campanha no `<strong>` do cabeçalho
- Período de validade (datas e horários)
- Regras por faixa de cápsulas (OL e VL separados)
- Canais de compra, parcelamento, frete, substituição de brindes, etc.

> Se o texto ainda não foi enviado, manter placeholder mas **não** deixar nome da campanha anterior nos identificadores de código.

---

## 6. Banners PLP

Arquivos `banner-plp-ol.html` e `banner-plp-vl.html` — apenas `background-image` com URL do banner desktop.

Atualizar somente quando houver novas URLs de banner (são independentes dos ícones N1–N5).

---

## Template de prompt para nova campanha

Copie e preencha:

```markdown
Atualize a campanha em @Nespresso/MARCELO/Campanhas/<NomeDaCampanha>
Seguir o padrão em @Nespresso/MARCELO/Campanhas/PADRAO-ATUALIZACAO-CAMPANHAS.md

## Ofertas
- N1-N5: [descrever ou anexar print]
- N2-N5: [se aplicável]
- Ofertas abertas (N3-N5): [se aplicável]

## Cores
- Principal: #______
- Secundária: #______
- Terciária: #______
- Quaternária: #______

## Ícones (N1 a N5)
- N1: [URL]
- N2: [URL]
- N3: [URL]
- N4: [URL]
- N5: [URL]

## Identificadores
- Nome da campanha (slug): [ex: BoostVertuoWorld]

## Termos e Condições
[texto completo ou "pendente"]

## Banners PLP (opcional)
- OL: [URL]
- VL: [URL]
```

---

## Referência: Boost Vertuo World

Campanha configurada em `BoostVertuoWorld/` como exemplo vivo deste padrão.

### Ofertas aplicadas

| Nível | OL | Brinde | VL | Brinde |
|-------|-----|--------|-----|--------|
| N1 | 70 | Tote Bag | 50 | Tote Bag |
| N2 | 100 | Copo de Drinks | 70 | Copo de Drinks |
| N3 | 150 | Porta Cápsula Médio | 120 | Porta Cápsula Médio |
| N4 | 200 | Porta Cápsula Grande | 180 | Porta Cápsula Grande |
| N5 | 270 | Par de Xícara Barista Grande | 210 | Par de Xícara Barista Grande |

### Cores

- Principal: `#3d441e`
- Secundária: `#fbeaa0`
- Terciária: `#f8ecdf`
- Quaternária: `#b3ca9a`

### Identificadores

- `window.acordeaoBoostVertuoWorld`
- `window.boostVertuoWorldProgressBar`
- `linkCondicoesOfertaBoostVertuoWorld`
- `modalTermosECondicoesBoostVertuoWorld`
- `nespresso-boost-vertuo-world-offers`

### Termos e Condições

- Campanha: **Coffee Boost Nespresso World**
- Período: **01/07/2026 às 09h a 22/07/2026**
- Texto aplicado em todos os `accordion-*.js`
