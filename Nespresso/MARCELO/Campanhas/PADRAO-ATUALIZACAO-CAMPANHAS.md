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
3. [ ] **Cores** — paleta **desta** campanha no playbook/KV (os 4 papéis são fixos; os hex mudam — não reusar da campanha anterior)
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

> **Padrão = até 3 níveis em Ofertas abertas (N3–N5).** Quatro brindes / “oferta surpresa” (ex.: nível 300) **não é o comum** — só aplicar quando o cliente pedir explicitamente e, em geral, **só na pasta Ofertas abertas** (não espalhar para N1–N5 / N2–N5 sem briefing). Tratar como **exceção de campanha**, não como regra do template.

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

> **Importante:** os **papéis** (principal, secundária, terciária, quaternária) são fixos neste padrão. Os **hexadecimais mudam a cada campanha** — sempre pegar do playbook / KV / branding da campanha atual. Nunca reutilizar a paleta da campanha anterior só porque “já estava no código”.

Definir as 4 cores da campanha e aplicar em accordion e régua:

| Papel | O que é | Uso sugerido |
|-------|---------|--------------|
| **Principal** | Cor dominante da marca na campanha | Cabeçalho accordion, textos de destaque, bordas/linhas de níveis atingidos na régua |
| **Secundária** | Contraste no header / destaque leve | Título/ícones no header, badge, highlights de cápsulas, fundo dos tiers atingidos |
| **Terciária** | Fundo de conteúdo | Fundo do conteúdo expandido do accordion |
| **Quaternária** | Detalhe / divisor | Divisores entre ofertas no accordion |

Exemplos (só referência — **não copiar sem conferir o material da campanha**):

| Campanha | Principal | Secundária | Terciária | Quaternária |
|----------|-----------|------------|-----------|-------------|
| Boost Vertuo World | `#3d441e` | `#fbeaa0` | `#f8ecdf` | `#b3ca9a` |
| Boost Dia dos Pais | `#ab2418` | `#ffffff` | `#ffffff` | `#000000` |

### Accordion — composição recomendada

- **Header:** fundo **principal**, título e ícones na **secundária**
- **Subtítulo:** **terciária** (ou secundária, se o playbook tiver só 2–3 cores)
- **Badge:** fundo secundária + texto principal
- **Conteúdo expandido:** fundo terciária
- **Itens de oferta:** borda superior quaternária, título na cor principal

### Régua — composição recomendada (estados binários)

A régua usa **apenas dois estados visuais** — atingido ou não atingido. Não misturar várias cores de destaque no mesmo nó.

| Estado | Círculo do brinde | Borda do círculo | Linha entre nós | Label (ex.: "70 cafés") |
|--------|-------------------|------------------|-----------------|-------------------------|
| **Nível atingido** | Fundo **secundária** | **Principal** | **Principal** | **Principal** |
| **Nível não atingido** | Cinza claro (`#f5f5f5`) | Cinza (`#cccccc`) | Cinza (`#cccccc`) | Cinza médio (`#999999`) |

Demais elementos:

- Highlight de cápsulas no texto: fundo **secundária** (se secundária for branco/claro e o fundo também for claro, usar **principal** + texto branco para contraste)
- Tooltip: fundo **principal**
- **Não usar** efeito shimmer (`nespresso-shimmer-effect`) no tier atual — todos os níveis atingidos seguem o mesmo visual (secundária + borda principal)

### Cores antigas a substituir

Ao migrar de uma campanha para outra, substituir **todos** os hex da paleta anterior pelos da nova — não deixar resíduos.

| Exemplo de hex antigo | Substituir por |
|-----------------------|----------------|
| Hex da campanha anterior no papel principal | Nova cor **principal** |
| Hex da campanha anterior no papel secundário / terciário | Novas cores **secundária** / **terciária** |
| Hex da campanha anterior em divisores | Nova cor **quaternária** (ou principal, se o playbook não tiver 4ª cor) |

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
- Regras gerais (CPF, B2C, canais, parcelamento, frete, substituição de brindes, etc.)
- Regras por faixa de cápsulas — **OL e VL em blocos separados**, do maior para o menor nível

> Se o texto ainda não foi enviado, manter placeholder mas **não** deixar nome da campanha anterior nos identificadores de código.

### Texto oficial — Coffee Boost Nespresso World

Aplicado em todos os `accordion-*.js` da campanha Boost Vertuo World:

- **Campanha:** Coffee Boost Nespresso World
- **Período:** 01/07/2026 às 09h a 22/07/2026
- **Parcelamento:** até 10x sem juros em pedidos a partir de R$100,00 (mín. R$50,00/parcela)
- **Frete grátis:** modo standard, mínimo 70 cápsulas
- **Canais:** Boutiques, 0800 7777 737, WhatsApp (11) 95578-4670, site e apps

**Original (OL) — faixas de cápsulas:**

| Faixa | Brinde |
|-------|--------|
| 70 a 99 | Tote Bag |
| 100 a 149 | Copo de Drinks |
| 150 a 199 | Porta Cápsula Médio |
| 200 a 269 | Porta Cápsula Grande |
| 270+ | Par de Xícara Barista Grande |

Válido para pedidos com cápsulas exclusivamente Original **ou** Original + Vertuo combinadas.

**Vertuo (VL) — faixas de cápsulas:**

| Faixa | Brinde |
|-------|--------|
| 50 a 69 | Tote Bag |
| 70 a 119 | Copo de Drinks |
| 120 a 179 | Porta Cápsula Médio |
| 180 a 209 | Porta Cápsula Grande |
| 210+ | Par de Xícara Barista Grande |

Válido apenas para pedidos com cápsulas **exclusivamente** Vertuo.

> O texto completo (parágrafos legais + regras por faixa) está em `modal.conteudo` nos arquivos `accordion-*.js` — copiar de lá ao replicar a campanha.

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

## Cores (do playbook desta campanha — NÃO reusar hex de campanha anterior)
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

## Referência: Boost Dia dos Pais

Campanha configurada em `BoostDiaDosPais/` (a partir do KV / Playbook 2026).

### Ofertas aplicadas

| Nível | OL | Brinde | VL | Brinde |
|-------|-----|--------|-----|--------|
| N1 | 70 | 10 Cápsulas de Café | 50 | 10 Cápsulas de Café |
| N2 | 100 | Porta-Cápsulas Pequeno | 70 | Porta-Cápsulas Pequeno |
| N3 | 150 | Porta-Cápsulas Grande | 120 | Porta-Cápsulas Grande |
| N4 | 200 | Caneca Térmica Média | 180 | Caneca Térmica Média |
| N5 | 270 | Caneca Térmica Grande | 210 | Caneca Térmica Grande |
| Surpresa (N6) | 300 | Par de Origin Espresso + Porta Cápsulas Médio | 300 | Par de Origin Espresso + Porta Cápsulas Médio |

### Oferta Surpresa (N6) — N1–N5, N2–N5 e Ofertas abertas

| Nível | Threshold OL / VL | Brinde |
|-------|-------------------|--------|
| Surpresa | 300 / 300 | Par de Origin Espresso + Porta Cápsulas Médio |

- Label no accordion: `OFERTA SURPRESA`
- Ícone surpresa: `https://i.imgur.com/CVOp6bj.png` (provisório até URL DAM)
- Ícone N3 (Porta Grande): `https://www.nespresso.com/ecom/medias/sys_master/public/51829506736158/Dinamic-Banner-N3-3.jpg`

### Cores desta campanha (Playbook — Passion Red / Branco / Preto)

> Hex específicos desta campanha. Próxima campanha = novo playbook = nova paleta.

- Principal: `#ab2418` (Passion Red)
- Secundária: `#ffffff` (Branco)
- Terciária: `#ffffff` (Branco — conteúdo expandido)
- Quaternária: `#000000` (Preto)

> Highlight de cápsulas na régua: fundo Passion Red (`#ab2418`) + texto branco (secundária branca não contrastava no fundo claro).

### Identificadores

- `window.acordeaoBoostDiaDosPais`
- `window.boostDiaDosPaisProgressBar`
- `linkCondicoesOfertaBoostDiaDosPais`
- `modalTermosECondicoesBoostDiaDosPais`
- `nespresso-boost-dia-dos-pais-offers`

### Termos e Condições

- Campanha: **Boost Dia dos Pais**
- Período: **27/07/2026 às 09h a 13/08/2026**
- Texto das faixas OL/VL já aplicado

### Ícones e banners

- Ícones accordion/régua N1–N5 + N3 Porta Grande (DAM) + surpresa 300 (Imgur provisório)
- Banners PLP N1–N5 / N2–N5 com Oferta Surpresa (`…-N1-…-N6-…` / `…-N2-…-N6-…`)
- Ofertas abertas: banners atualizados manualmente no Target

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

### Cores desta campanha

> Hex específicos desta campanha. Próxima campanha = novo playbook = nova paleta.

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
- Texto oficial aplicado em todos os `accordion-*.js` (ver seção 5)

### Régua — ajuste visual (feedback cliente)

- Níveis **não atingidos:** cinza (`#f5f5f5` / `#cccccc` / `#999999`)
- Níveis **atingidos:** fundo amarelo (`#fbeaa0`) + borda e linhas verdes (`#3d441e`)
- Removido efeito shimmer no tier atual
- Aplicado nos 7 arquivos `regua_minicart*.js`
