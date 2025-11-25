# 📦 Sistema de Recomendação de Produtos no Mini-Cart FTD

> **Documentação Técnica v2.0**  
> Sistema de Cross-Sell Dinâmico Baseado em Nível Escolar com Multi-Lista e Bundle Products

---

## 🎯 Resumo Executivo v2.0

**Novidades da v2.0:**

- 🚀 **50% mais rápido** - Otimização completa de timeouts e debounce
- 🎯 **Multi-Lista** - Detecta qual lista de adoção específica está no carrinho
- 🔧 **Normalização Robusta** - Aceita "2ª série", "2º ano", "2°colegial" sem acentos
- 📦 **Bundle Products** - Adiciona produtos combo (Numeródromo + Bichodário, Peter Pan + Mágico de Oz)
- 📚 **17 níveis mapeados** - Até 5 produtos por nível escolar
- 🔍 **API de Estudantes** - Busca nível escolar preciso por `adoptionListId`

**Benefícios:**

- ✅ Recomendação correta mesmo quando estudante tem múltiplas listas
- ✅ Performance superior em dispositivos móveis
- ✅ Suporte completo para produtos combo
- ✅ Maior tolerância a variações de formato

---

## 📑 Índice

1. [Visão Geral](#-visão-geral)
2. [Como Funciona](#-como-funciona)
3. [Regras de Recomendação](#-regras-de-recomendação)
4. [Implementação Técnica](#-implementação-técnica)
5. [Interface e UX](#-interface-e-ux)
6. [Métricas](#-métricas)
7. [Troubleshooting](#-troubleshooting)

---

## 📝 Visão Geral

### **O que é?**

Sistema que recomenda produtos complementares no mini-cart baseado no nível escolar do estudante, detectado automaticamente através do kit adicionado ao carrinho.

### **Metadados**

| Item           | Valor                   |
| -------------- | ----------------------- |
| **Arquivo**    | `miniCartStaging.js`    |
| **Linhas**     | ~2.349                  |
| **Ambiente**   | Staging FTD Lumisfera   |
| **Plataforma** | Magento 2 + Knockout.js |
| **Versão**     | 2.0.0                   |

### **Objetivo**

Aumentar ticket médio e itens por pedido através de recomendações contextuais, aproveitando o momento de alta intenção de compra.

### **Proposta de Valor**

| Para        | Benefício                                               |
| ----------- | ------------------------------------------------------- |
| **Cliente** | Descobre produtos relevantes para o nível escolar       |
| **Negócio** | Aumenta ticket médio e cross-sell                       |
| **UX**      | Não-intrusivo, frete unificado, 1 clique para adicionar |

### **Por que no Mini-Cart?**

✅ Alta intenção de compra  
✅ Visibilidade garantida (abre após adicionar produto)  
✅ Contexto preservado (não interrompe navegação)  
✅ Argumento de frete genuíno  
✅ Menos atrito que pop-ups

---

## ⚙️ Como Funciona

### **Fluxo Geral**

```
0. Script busca dados dos estudantes da API em background
   ↓
1. Usuário adiciona Kit ao carrinho
   ↓
2. Sistema detecta o kit e extrai nível escolar
   → Método 1: Via API /rest/V1/students/mine (studentId → school_grade)
   → Método 2: Fallback via regex no nome do produto
   ↓
3. Busca produto complementar para aquele nível
   ↓
4. Exibe recomendação no mini-cart
   ↓
5. Usuário clica "Adicionar"
   ↓
6. Card desaparece com animação
```

### **✨ Detecção Inteligente via API (Multi-Lista)**

O sistema usa uma abordagem híbrida e multi-camada para detectar o nível escolar:

**1. Prioridade: API de Estudantes (por Lista de Adoção)**

- Busca `/rest/V1/students/mine` no início da sessão em background
- Cria **dois mapas**:
  - `STUDENT_GRADE_MAP`: `studentId → gradeLevel` (primeira lista do estudante)
  - `ADOPTION_LIST_GRADE_MAP`: `adoptionListId → gradeLevel` (todas as listas)
- Identifica o `adoptionListId` específico no carrinho via `cart.ftd.data.miniCart.miniCartAdoptionLists`
- Busca o `gradeLevel` da lista específica (não apenas do estudante)
- **Benefício**: Estudantes com múltiplas listas obtêm recomendação correta para cada kit

**2. Fallback: Extração via Regex**

- Se a API falhar ou dados não estiverem disponíveis
- Analisa o nome do produto para extrair o nível escolar
- Mantém compatibilidade com sistemas antigos

**3. Normalização Robusta**

- Remove acentos (é → e, ª → a, º → o)
- Remove hífens e espaços extras
- Aceita variações: "2ª série", "2º ano", "2 serie", "2°ano"

### **1. Detecção de Kit**

O sistema monitora o carrinho e detecta kits através de **regex patterns** no nome do produto:

```javascript
// Padrões de detecção
/conjunto|kit|faça|faca|lista\s*de\s*materiais|\bCJ\b|\bEI\b/i
/\d+[º°]\s*(ano|série)/i
/\d+\s+ANOS/i
/LEVEL\s+\d+/i
```

**Exemplos detectados:**

- ✅ "Kit 5º ano - Anos iniciais"
- ✅ "Conjunto Didático 3º ano"
- ✅ "Lista de materiais - Ensino Médio 2"
- ✅ "CJ TRILHAS EI 3 ANOS" (CJ = Conjunto, EI = Educação Infantil)
- ✅ "CJ EVOLUTION EI - LEVEL 1" (LEVEL 1 = 1 ano)

### **2. Extração do Nível Escolar**

**Prioridade 1: API de Estudantes por Lista Específica** (método principal)

O sistema busca o nível escolar da lista de adoção específica presente no carrinho:

1. Identifica o `adoptionListId` no carrinho via `cart.ftd.data.miniCart.miniCartAdoptionLists`
2. Busca no `ADOPTION_LIST_GRADE_MAP[adoptionListId]` o nível escolar da lista específica
3. **Fallback**: Se não encontrar, busca no `STUDENT_GRADE_MAP[studentId]` (primeira lista do estudante)
4. Obtém o nível escolar preciso (ex: "3 anos - Ensino Infantil", "2ª série - Ensino Médio")

**Prioridade 2: Extração via Regex** (fallback final)

Se a API falhar ou os dados não estiverem disponíveis, usa regex patterns com normalização robusta:

| Padrão                 | Exemplo                   | gradeNumber | Variações Aceitas                   |
| ---------------------- | ------------------------- | ----------- | ----------------------------------- |
| Educação Infantil X    | "Educação Infantil 4"     | 4           | "Ed Infantil 4", "EI 4 anos"        |
| Pré Escola X           | "Pré Escola 5"            | 5           | "Pre escola 5", "5 anos pre"        |
| Xº ano - Anos iniciais | "3º ano - Anos iniciais"  | 8           | "3 ano anos iniciais", "3°ano-AI"   |
| Xº ano - Anos finais   | "7º ano - Anos finais"    | 12          | "7 ano anos finais", "7°ano-AF"     |
| Ensino Médio X         | "2ª série - Ensino Médio" | 16          | "2º ano ensino medio", "2°colegial" |

**Normalização Robusta:**

- Remove acentos: `é→e`, `ª→a`, `º→o`
- Remove hífens e espaços extras
- Case-insensitive
- Aceita feminino (ª) e masculino (º)

### **3. Seleção do Produto**

**Lógica:**

1. Recomenda primeiro **produto primário** que não está no carrinho
2. Se todos primários estão no carrinho → recomenda **produto secundário**
3. Se todos estão no carrinho → não exibe recomendação

### **4. Regras Especiais**

#### **Persistência da Recomendação Inicial**

- Produto recomendado permanece mesmo se usuário adicioná-lo
- Exceção: se já estava no carrinho antes, exibe o próximo

#### **Múltiplas Listas de Adoção**

- Se há 2+ listas de adoção no carrinho → usa a **primeira** `adoptionListId` encontrada
- Se o estudante tem múltiplas listas na API → identifica qual está no carrinho e usa o nível escolar específico dessa lista
- **Benefício**: Recomendação correta mesmo quando estudante tem kits de diferentes séries

#### **Ocultação Permanente**

- Após adicionar o produto recomendado → card desaparece com animação fade-out

---

## 🎓 Regras de Recomendação

### **Mapeamento de Produtos por Nível**

| gradeNumber | Nível Escolar             | Produto Primário          | Produtos Secundários (até 4)                                                |
| ----------- | ------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| **1**       | Ed. Infantil 1 ano        | Numeródromo (699322)      | Bichodário, Enquanto mamãe dormia, Mamãe gata e seus pintinhos              |
| **2**       | Ed. Infantil 2 anos       | Numeródromo (699322)      | Bichodário, Enquanto mamãe dormia, Mamãe gata e seus pintinhos              |
| **3**       | Ed. Infantil 3 anos       | Numeródromo (699322)      | Bichodário, Enquanto mamãe dormia, Mamãe gata e seus pintinhos              |
| **4**       | Ed. Infantil Pré Escola 4 | Numeródromo (699322)      | Bichodário, Enquanto mamãe dormia, O túnel                                  |
| **5**       | Ed. Infantil Pré Escola 5 | Numeródromo (699322)      | Bichodário, Enquanto mamãe dormia, O túnel                                  |
| **6**       | 1ª Série / 1º ano         | Minidicionário (56551)    | No capricho A + Que vergonha (695573), Cadê o livro, Benny, Isca Faísca     |
| **7**       | 2ª Série / 2º ano         | Minidicionário (56551)    | Tabuada 1 + No capricho B (695576), Cadê o livro, Benny, Isca Faísca        |
| **8**       | 3ª Série / 3º ano         | Minidicionário (56551)    | Tabuada 2 + No capricho C (695786), O museu da emília, Benny, Olho vivo     |
| **9**       | 4ª Série / 4º ano         | Minidicionário (56551)    | Tabuada 3 + No capricho D (695816), O museu da emília, Sete corvos, Olho    |
| **10**      | 5ª Série / 5º ano         | Minidicionário (56551)    | Tabuada 4 + No capricho E (695888), Alice, Sete corvos, Livro pássaros      |
| **11**      | 6ª Série / 6º ano         | Minidicionário (56551)    | Peter Pan + Mágico de Oz (578096), Alice, Anjos, Livro pássaros             |
| **12**      | 7ª Série / 7º ano         | Dicionário Inglês (53959) | Peter Pan + Mágico de Oz (578096), O pequeno príncipe, Anjos, É de morte    |
| **13**      | 8ª Série / 8º ano         | Dicionário Inglês (53959) | Peter Pan + Mágico de Oz (578096), O pequeno príncipe, Anjos, É de morte    |
| **14**      | 9ª Série / 9º ano         | Dicionário Inglês (53959) | Peter Pan + Mágico de Oz (578096), O pequeno príncipe, Anjos, É de morte    |
| **15**      | Ensino Médio 1º Colegial  | Estuda.com Anual (696545) | Estuda.com Semestral (696542), Reforça Anual (453782), Reforça Sem (453779) |
| **16**      | Ensino Médio 2º Colegial  | Estuda.com Anual (696545) | Estuda.com Semestral (696542), Reforça Anual (453782), Reforça Sem (453779) |
| **17**      | Ensino Médio 3º Colegial  | Estuda.com Anual (696545) | Estuda.com Semestral (696542), Reforça Anual (453782), Reforça Sem (453779) |

### **Cenários de Exemplo**

**Cenário 1: Educação Infantil 3 anos (gradeNumber 3), carrinho vazio**

```
→ Recomenda: Numeródromo + Bichodário (699322) ✅
→ Bundle product com 2 itens
```

**Cenário 2: 1º ano (gradeNumber 6), carrinho vazio**

```
→ Recomenda: Minidicionário (56551) ✅
```

**Cenário 3: 3º ano (gradeNumber 8), Minidicionário já no carrinho**

```
→ Recomenda: Tabuada 2 + No capricho C (695786) ✅ (secundário bundle)
```

**Cenário 4: 6º ano (gradeNumber 11), carrinho vazio**

```
→ Recomenda: Minidicionário (56551) ✅
→ Se já tiver: Peter Pan + Mágico de Oz (578096) ✅
```

**Cenário 5: Ensino Médio 2ª série (gradeNumber 16), carrinho vazio**

```
→ Recomenda: Estuda.com Anual (696545) ✅
→ Se já tiver: Estuda.com Semestral (696542) ✅
→ Se já tiver: Reforça Anual (453782) ✅
```

**Cenário 6: Estudante com múltiplas listas**

```
API retorna:
- Lista 4524803 (Savio): 3º ano - Anos iniciais
- Lista 4529735 (Savio): 3 anos - Ensino Infantil

Carrinho tem:
- Produto da lista 4529735

→ Sistema identifica lista 4529735 especificamente
→ Recomenda: Numeródromo (699322) para EI 3 anos ✅
→ Não recomenda produtos de 3º ano ✅
```

---

## 💻 Implementação Técnica

### **Arquitetura**

```
┌─────────────────────────────────────┐
│     Magento 2 Mini-Cart             │
│  ┌──────────────────────────────┐   │
│  │  miniCartStaging.js          │   │
│  │  ┌────────┐  ┌────────────┐  │   │
│  │  │Detecção│→ │Recomendação│  │   │
│  │  └────────┘  └────────────┘  │   │
│  │       ↓             ↓         │   │
│  │  ┌────────────────────────┐  │   │
│  │  │ Cache (sessionStorage) │  │   │
│  │  └────────────────────────┘  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **Componentes Principais**

| Componente                    | Função                                 | Complexidade |
| ----------------------------- | -------------------------------------- | ------------ |
| `run()`                       | Orquestração principal                 | ⭐⭐⭐⭐⭐   |
| `fetchStudentsData()`         | Busca API e popula mapas de listas     | ⭐⭐⭐⭐     |
| `detectSchoolKitAndGrade()`   | Detecta kits e nível (multi-lista)     | ⭐⭐⭐⭐⭐   |
| `convertGradeLevelToNumber()` | Normaliza e converte nível para número | ⭐⭐⭐⭐     |
| `getRecommendedProductId()`   | Seleciona produto (até 5 opções)       | ⭐⭐⭐⭐     |
| `loadRecommendedProduct()`    | Carrega dados (cache + sessionStorage) | ⭐⭐⭐⭐     |
| `render()`                    | Renderiza UI                           | ⭐⭐⭐⭐⭐   |
| `addToCart()`                 | Adiciona ao carrinho (bundle support)  | ⭐⭐⭐⭐⭐   |
| `addToCartViaAjax()`          | AJAX com bundle options                | ⭐⭐⭐⭐     |

### **Sistema de Monitoramento (Otimizado)**

**3 métodos para detectar mudanças no carrinho:**

1. **MutationObserver** - Monitora DOM (debounce 100ms - otimizado)
2. **customerData.subscribe** - Escuta atualizações Magento (debounce 400ms - otimizado)
3. **State Hash** - Evita re-processamento (`productId:qty`)
4. **API Wait** - Aguarda carregamento da API de estudantes (150ms retry - otimizado)

**Performance:** Até 50% mais rápido que a versão anterior

### **Sistema de Cache (2 Camadas)**

```
L1: sessionStorage (TTL 10min)
     ↓ (miss)
L2: customerData (runtime)
```

### **Otimizações de Performance v2.0**

| Operação                 | v1.0   | v2.0   | Melhoria |
| ------------------------ | ------ | ------ | -------- |
| Debounce `run()`         | 300ms  | 100ms  | 66% ⚡   |
| Verificação inicial      | 1000ms | 250ms  | 75% ⚡   |
| API wait retry           | 500ms  | 150ms  | 70% ⚡   |
| DOM ready timeout        | 100ms  | 25ms   | 75% ⚡   |
| MutationObserver pause   | 100ms  | 25ms   | 75% ⚡   |
| customerData debounce    | 1000ms | 400ms  | 60% ⚡   |
| Post cd.reload wait      | 500ms  | 150ms  | 70% ⚡   |
| **Tempo total estimado** | ~1.5s  | ~0.75s | **50%**  |

### **Variáveis Globais Principais**

```javascript
// Mapas de API
var STUDENT_GRADE_MAP = {};        // studentId → gradeLevel (fallback)
var ADOPTION_LIST_GRADE_MAP = {};  // adoptionListId → gradeLevel (principal)
var STUDENTS_DATA_LOADED = false;
var STUDENTS_DATA_LOADING = false;

// Bundle Products
var BUNDLE_OPTIONS_MAP = {
  695786: { 'bundle_option[254]': '320', ... },
  578096: { 'bundle_option[212]': '272', ... },
  // ... 7 produtos bundle
};

// Recomendações
var GRADE_RECOMMENDATIONS = {
  1: { primary: [699322], secondary: [52144, 697535, 56572] },
  // ... 17 níveis mapeados
};

// Persistência
var INITIAL_RECOMMENDED_PRODUCT_ID = null;
var INITIAL_RECOMMENDATION_CART_STATE = null;
```

### **Prevenção de Loops**

1. `isRunning` flag
2. `lastCheckedState` hash comparison
3. `mutationObserverPaused` durante modificações DOM
4. `lastCartSubscriptionState` para cart.subscribe
5. API wait com retry limitado (150ms)

### **Adicionar ao Carrinho**

**Método:** AJAX (fetch) com headers Magento

```javascript
POST /checkout/cart/add/uenc/{uenc}/product/{productId}
Headers: X-Requested-With: XMLHttpRequest
Body: product={id}&qty=1&form_key={key}&bundle_option[X]=Y...
```

**Suporte para Bundle Products:**

O sistema detecta automaticamente produtos combo via `BUNDLE_OPTIONS_MAP`:

```javascript
var BUNDLE_OPTIONS_MAP = {
  695786: { 'bundle_option[254]': '320', 'bundle_option[257]': '323' }, // Tabuada 2 + No capricho C
  578096: { 'bundle_option[212]': '272', 'bundle_option[215]': '275' }, // Peter Pan + Mágico de Oz
  699322: { 'bundle_option[313]': '382', 'bundle_option[316]': '385' }, // Numeródromo + Bichodário
  // ... mais produtos
};
```

**Verificação pós-adição:** Aguarda via `customerData` e confirma sucesso

---

## 🎨 Interface e UX

### **Estrutura do Card**

```html
<div id="wj-mini-shelf">
  <p class="wj-copy-header">Leve mais, com o mesmo frete!</p>

  <div class="wj-product-content">
    <img src="..." alt="Produto" />
    <div>
      <a class="wj-title">Nome do Produto</a>
      <div class="wj-price">R$ 99,00</div>
    </div>
  </div>

  <button class="wj-cta" data-product-id="12345">
    <span class="action-label">
      <span class="plus-icon"></span>
    </span>
    <span class="cart-icon"></span>
  </button>
</div>
```

### **Estilos CSS Principais**

```css
#wj-mini-shelf {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 0;
  font-family: var(--font-source-poppins);
  max-width: calc(100% - 48px);
  margin: 15px auto 0;
}

.wj-copy-header {
  background-color: #cacdd2;
  border-radius: 5px;
  text-align: center;
  padding: 2px;
}

.wj-product-content {
  display: flex;
  gap: 12px;
  align-items: center;
}
```

### **Animação Fade-Out**

```css
@keyframes wj-fadeout {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

#wj-mini-shelf.wj-hiding {
  animation: wj-fadeout 0.5s ease-out forwards;
}
```

### **Posicionamento**

```
┌─────────────────────────┐
│ Lista de Materiais      │
│ - Estudante 1           │
├─────────────────────────┤
│ ⬆️ RECOMENDAÇÃO (aqui)  │ ← #wj-mini-shelf
├─────────────────────────┤
│ Subtotal: R$ 1.768,40   │ ← .actions-info
│ [Ir para o carrinho]    │
└─────────────────────────┘
```

---

## 📊 Métricas

### **Métricas Coletadas**

**Grupo Controle:**

- Taxa de conversão
- Ticket médio
- Itens por pedido

**Grupo Teste:**

- Taxa de conversão
- Ticket médio
- Itens por pedido
- Taxa de cliques na recomendação (CTR)
- Taxa de adição (Add-to-Cart Rate)
- Distribuição de produtos recomendados

### **Eventos Analytics**

```javascript
// Formato do evento
s.events = 'event90';
s.eVar82 = 'miniCartRecommendation_click';
s.eVar84 = 'productId_' + productId;
```

**Disparos:**

- Produto recomendado exibido
- Clique no botão "Adicionar"
- Produto adicionado com sucesso

---

## 🛠️ Troubleshooting

### **Problema: Recomendação não aparece**

**Verificar:**

1. Console mostra `[MiniCart] Script inicializado`?
2. Anchor `.actions-info` existe no DOM?
3. Kit foi detectado? → log `[MiniCart] Kit detectado`
4. Nível escolar extraído? → log `[MiniCart] Nível escolar extraído`

**Soluções:**

- Anchor não existe → ajustar `ANCHOR_SELECTOR`
- Kit não detectado → adicionar padrão ao regex
- Nível não extraído → verificar `extractGradeLevel()`

### **Problema: Loop infinito**

**Verificar:**

1. `isRunning` está sendo resetado?
2. `lastCheckedState` está sendo atualizado?
3. `mutationObserverPaused` funciona?

**Soluções:**

- Aumentar debounce time
- Revisar `getCartStateHash()`

### **Problema: Produto não adiciona**

**Verificar:**

1. `form_key` válido? → ver log de `getFormKey()`
2. API retornou sucesso? → ver response
3. CORS? → verificar redirecionamentos

**Soluções:**

- Atualizar `form_key` (busca em inputs/forms/cookies)
- Verificar headers da requisição

### **Problema: Dados incorretos**

**Verificar:**

1. Cache desatualizado?
2. `pdpData.id` definido?
3. Bundle options configuradas?

**Soluções:**

- Limpar: `sessionStorage.clear()`
- Forçar reload: `forceReload = true`
- Verificar `BUNDLE_OPTIONS_MAP` para produtos combo

### **Problema: Nível escolar incorreto**

**Verificar:**

1. API retornou dados? → ver log `[MiniCart] Dados dos estudantes recebidos`
2. `adoptionListId` encontrado no carrinho?
3. Normalização funcionou? → ver log `[MiniCart] Normalizando gradeLevel`

**Soluções:**

- Verificar se `ADOPTION_LIST_GRADE_MAP` tem o `adoptionListId`
- Confirmar que `convertGradeLevelToNumber()` está retornando valor
- Testar com diferentes formatos: "2ª série", "2º ano", etc.

### **Problema: Bundle product não adiciona**

**Verificar:**

1. Produto está no `BUNDLE_OPTIONS_MAP`?
2. Bundle options corretas?
3. API retornou sucesso mas item não aparece no carrinho?

**Soluções:**

- Adicionar produto no `BUNDLE_OPTIONS_MAP` com suas opções
- Verificar no form do PDP quais são os `bundle_option[X]` corretos
- Confirmar que todas as opções obrigatórias estão presentes

---

## 📋 Logs de Debug

### **Inicialização**

```
[MiniCart] Script inicializado - versão com detecção aprimorada de kits + API de estudantes
[MiniCart] Aguardando anchor: .actions-info
[MiniCart] Buscando dados dos estudantes da API...
```

### **API de Estudantes**

```
[MiniCart] Dados dos estudantes recebidos: {totalStudents: 3}
[MiniCart] Mapeada lista de adoção: {adoptionListId: '4524194', studentId: 3807197, gradeLevel: '5 anos - Ensino Infantil'}
[MiniCart] Mapas criados: {totalStudents: 3, totalAdoptionLists: 6}
```

### **Detecção**

```
[MiniCart] Verificando X itens no carrinho para detectar kits...
[MiniCart] Detectadas adoption lists no carrinho: {count: 1, lists: Array(1)}
[MiniCart] Nivel escolar obtido via adoptionListId da API: {adoptionListId: '4530167', gradeLevel: '2ª série - Ensino Médio'}
[MiniCart] Normalizando gradeLevel: {original: '2ª série - Ensino Médio', normalized: '2a serie ensino medio'}
```

### **Recomendação**

```
[MiniCart] Produtos primários: [56551, 53959]
[MiniCart] Produto recomendado: 56551
```

### **Adição**

```
[MiniCart] Adicionando produto ao carrinho: {productId: 56551}
[MiniCart] Produto adicionado com sucesso via AJAX
```

---

## 🧪 Cenários de Teste

### **Teste 1: Detecção de Kit**

- ✅ Kit 5º ano → detecta
- ✅ Kit Ensino Médio → detecta
- ✅ Produto regular → não detecta

### **Teste 2: Recomendação Correta**

- ✅ Kit 5º ano → Minidicionário
- ✅ Kit Pré Escola → Numeródromo
- ✅ Kit Ensino Médio → Estuda com Anual

### **Teste 3: Produtos no Carrinho**

- ✅ Minidicionário no carrinho → recomenda Dicionário Inglês
- ✅ Todos primários no carrinho → recomenda secundário
- ✅ Todos no carrinho → não exibe

### **Teste 4: Persistência**

- ✅ Recomenda produto → usuário adiciona → mantém visível
- ✅ Após adicionar → oculta com animação

### **Teste 5: Múltiplas Listas de Adoção**

- ✅ Estudante com 2+ listas → identifica lista específica do carrinho
- ✅ Lista 1 (5º ano) + Lista 2 (3º ano) → recomenda corretamente para cada
- ✅ Fallback para primeira lista se não encontrar adoptionListId

### **Teste 6: Normalização Robusta**

- ✅ "2ª série - Ensino Médio" → nível 16
- ✅ "2º ano-Ensino Medio" → nível 16 (sem espaço, sem acento)
- ✅ "5 anos Educação Infantil" → nível 5
- ✅ Aceita feminino (ª) e masculino (º)

### **Teste 7: Bundle Products**

- ✅ Adiciona produtos combo corretamente (com bundle_option)
- ✅ Numeródromo + Bichodário → adiciona ambos ao carrinho
- ✅ Peter Pan + Mágico de Oz → adiciona combo completo

### **Teste 8: Performance**

- ✅ Não cria loops
- ✅ Debounce otimizado (100-400ms)
- ✅ Cache respeitado
- ✅ Exibição 50% mais rápida

---

## 📞 Suporte

**Desenvolvedor:** Marcelo Silva  
**Empresa:** Webjump CRO  
**Projeto:** FTD Lumisfera  
**Data:** Novembro 2025

---

## 📝 Changelog

### **v2.0 - Novembro 2025 (Atual)**

**🚀 Melhorias de Performance:**

- ✅ Otimização de timeouts (50% mais rápido)
- ✅ Debounce reduzido: 300ms → 100ms
- ✅ API wait: 500ms → 150ms
- ✅ Verificação inicial: 1000ms → 250ms

**🎯 Detecção Multi-Lista:**

- ✅ Sistema de mapeamento por `adoptionListId` específico
- ✅ Suporte para estudantes com múltiplas listas
- ✅ `ADOPTION_LIST_GRADE_MAP` + `STUDENT_GRADE_MAP`
- ✅ Recomendação correta por lista do carrinho

**🔧 Normalização Robusta:**

- ✅ Remoção de acentos (é→e, ª→a, º→o)
- ✅ Aceita variações: "2ª série", "2º ano", "2°colegial"
- ✅ Remove hífens e espaços extras
- ✅ Case-insensitive

**📦 Bundle Products:**

- ✅ Sistema `BUNDLE_OPTIONS_MAP`
- ✅ Adiciona produtos combo corretamente
- ✅ Suporte para até 7 produtos bundle

**📚 Produtos Expandidos:**

- ✅ Até 5 recomendações por nível
- ✅ 17 níveis escolares mapeados
- ✅ Novos produtos: Numeródromo combo, Tabuadas, Peter Pan, Reforça

---

### **v1.0 - Novembro 2025**

- ✅ Implementação inicial
- ✅ Detecção de kits escolares
- ✅ Sistema de recomendação por nível escolar
- ✅ Suporte para múltiplos kits
- ✅ Persistência da recomendação inicial
- ✅ Animação fade-out
- ✅ Sistema de logs
- ✅ Cache com sessionStorage
- ✅ Prevenção de loops

---

**🎓 Documentação focada em funcionalidade técnica e regras de negócio**
