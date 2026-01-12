# 🎯 Sistema de Popup Lateral de Recomendação - FTD

> **Documentação Técnica v1.0**  
> Sistema de Cross-Sell Inteligente com Controle de Frequência e Persistência

---

## 🎯 Resumo Executivo

**Características principais:**

- 🎯 **Recomendação Contextual** - Baseada no nível escolar detectado no carrinho
- ⏱️ **Controle de Frequência** - Máximo 2x/dia com cooldown de 30min
- 🔒 **Persistência Inteligente** - Lembra rejeições e sucessos
- 🎨 **Design Não-Intrusivo** - Slide-in suave, fácil de dispensar
- 📱 **Responsivo** - Adapta-se perfeitamente a mobile
- 📊 **Tracking Completo** - Adobe Analytics integrado

**Benefícios:**

- ✅ Aumenta exposição de produtos complementares
- ✅ Não interrompe navegação (aparece após delay)
- ✅ Respeita preferências do usuário
- ✅ Rastreamento detalhado por nível escolar
- ✅ 2 produtos recomendados por nível (priorização)

---

## 📑 Índice

1. [Visão Geral](#-visão-geral)
2. [Como Funciona](#-como-funciona)
3. [Regras de Exibição](#-regras-de-exibição)
4. [Regras de Recomendação](#-regras-de-recomendação)
5. [Implementação Técnica](#-implementação-técnica)
6. [Interface e UX](#-interface-e-ux)
7. [Sistema de Tracking](#-sistema-de-tracking)
8. [Troubleshooting](#-troubleshooting)

---

## 📝 Visão Geral

### **O que é?**

Popup lateral que aparece automaticamente recomendando produtos complementares baseados no nível escolar detectado no carrinho do usuário.

### **Metadados**

| Item           | Valor                  |
| -------------- | ---------------------- |
| **Arquivo**    | `popup-lateral.js`     |
| **Linhas**     | ~1.100                 |
| **Ambiente**   | Produção FTD Lumisfera |
| **Plataforma** | Magento 2 + Vanilla JS |
| **Versão**     | 1.0.0                  |

### **Objetivo**

Maximizar conversão de produtos complementares através de recomendações oportunas e contextuais, sem prejudicar a experiência do usuário.

### **Proposta de Valor**

| Para        | Benefício                                              |
| ----------- | ------------------------------------------------------ |
| **Cliente** | Descobre produtos essenciais para o nível escolar      |
| **Negócio** | Aumenta ticket médio através de cross-sell inteligente |
| **UX**      | Não-intrusivo, respeitoso, com controle de frequência  |

### **Diferencial vs Mini-Cart**

| Característica             | Mini-Cart      | Popup Lateral              |
| -------------------------- | -------------- | -------------------------- |
| **Momento**                | Durante compra | Após adicionar ao carrinho |
| **Visibilidade**           | Média          | Alta                       |
| **Controle de Frequência** | Não            | Sim (2x/dia, cooldown)     |
| **Persistência**           | Sessão         | localStorage (dias)        |
| **Rejeição**               | Não rastreia   | Rastreia e respeita        |

---

## ⚙️ Como Funciona

### **Fluxo Geral**

```
0. Script busca dados dos estudantes da API em background
   ↓
1. Usuário adiciona Kit ao carrinho
   ↓
2. Sistema aguarda 3 segundos (delay inicial obrigatório)
   ↓
3. Verifica regras de exibição (frequência, cooldown, rejeições)
   ↓
4. Detecta nível escolar (API → fallback regex)
   ↓
5. Verifica se há lista de adoção no carrinho (obrigatório)
   ↓
6. Seleciona produto recomendado (não está no carrinho)
   ↓
7. Popup aparece com slide-in suave (canto inferior esquerdo)
   ↓
8. Usuário pode:
   → Adicionar produto (sucesso → limpa rejeições)
   → Clicar "X" (rejeita produto para hoje)
   → Clicar "Depois" (rejeita produto para hoje)
   → Ignorar (permanece visível)
```

### **Detecção Inteligente (Idêntica ao Mini-Cart)**

**1. Prioridade: API de Estudantes**

- Busca `/rest/V1/students/mine` no carregamento da página
- Cria mapeamentos:
  - `STUDENT_GRADE_MAP`: `studentId → gradeLevel`
  - `ADOPTION_LIST_GRADE_MAP`: `adoptionListId → gradeLevel`
- Identifica `adoptionListId` específico no carrinho
- Retorna nível escolar preciso da lista específica

**2. Fallback: Extração via Regex**

- Analisa nomes de produtos no carrinho
- Patterns robustos para detectar níveis escolares
- Normalização: remove acentos, aceita variações

**3. Normalização**

- Remove acentos: `é→e`, `ª→a`, `º→o`
- Remove hífens e espaços extras
- Case-insensitive
- Aceita: "2ª série", "2º ano", "2°colegial"

---

## 🚦 Regras de Exibição

### **Regra 1: Delay Inicial Obrigatório (3 segundos)**

```javascript
INITIAL_DELAY_MS: 3000;
```

**Objetivo:** Evitar interrupção imediata da navegação

**Comportamento:**

- Popup só pode aparecer 3s após carregamento da página
- Se tentativa ocorrer antes → agenda para depois
- Garante que usuário viu o conteúdo principal primeiro

### **Regra 2: Limite por Sessão (1 vez)**

```javascript
MAX_DISPLAYS_PER_SESSION: 1;
```

**Objetivo:** Não saturar o usuário na mesma visita

**Comportamento:**

- Popup aparece no máximo 1 vez por sessão de navegação
- Flag `SESSION_POPUP_SHOWN` controla
- Reset apenas ao fechar/reabrir navegador

### **Regra 3: Limite Diário (2 vezes)**

```javascript
MAX_DISPLAYS_PER_DAY: 2;
```

**Objetivo:** Respeitar usuários que voltam múltiplas vezes

**Armazenamento:**

```javascript
localStorage['ftd_popup_daily_Mon Dec 16 2024'] = {
  count: 2,
  lastProduct: 56551,
  lastGrade: '5º ano - Anos iniciais',
};
```

**Comportamento:**

- Conta exibições por dia (não por sessão)
- Limite de 2 aparições por dia
- Reset automático à meia-noite

### **Regra 4: Cooldown entre Exibições (30 minutos)**

```javascript
COOLDOWN_MINUTES: 30;
```

**Objetivo:** Evitar spam se usuário abre/fecha carrinho

**Armazenamento:**

```javascript
localStorage['ftd_popup_last_shown'] = 1702742400000; // timestamp
```

**Comportamento:**

- Após exibir popup → aguarda 30min para próxima exibição
- Válido mesmo em sessões diferentes
- Previne múltiplas exibições em curto período

### **Regra 5: Rejeição por Produto (até meia-noite)**

**Objetivo:** Respeitar desinteresse explícito do usuário

**Armazenamento:**

```javascript
localStorage['ftd_popup_rejected_Mon Dec 16 2024'] = {
  56551: { action: 'close_x_click', timestamp: 1702742400000 },
  53959: { action: 'close_depois_click', timestamp: 1702746000000 },
};
```

**Comportamento:**

- Usuário clicou "X" ou "Depois" → produto marcado como rejeitado
- Produto não será recomendado novamente hoje
- Reset automático à meia-noite
- Permite recomendar OUTROS produtos do mesmo nível

**Exemplo:**

```
10:00 - Popup recomenda Minidicionário (56551)
10:05 - Usuário clica "Depois" → rejeitado
11:00 - Usuário adiciona outro kit 5º ano
11:05 - Popup recomenda Tijolo por Tijolo (697682) ✅
        (não recomenda Minidicionário novamente ❌)
```

### **Regra 6: Lista de Adoção Obrigatória**

**Objetivo:** Garantir que há contexto escolar válido

**Comportamento:**

- Popup só aparece se há `adoptionList` no carrinho
- Verifica `cart.ftd.data.miniCart.miniCartAdoptionLists`
- Se não houver lista → não exibe popup
- Garante relevância da recomendação

### **Regra 7: Produto Já no Carrinho**

**Objetivo:** Não recomendar produtos duplicados

**Comportamento:**

- Verifica se produto recomendado já está no carrinho
- Se está → tenta próximo produto da lista
- Se todos estão → não exibe popup

### **Fluxo de Decisão**

```
┌─────────────────────────────────────────┐
│ Usuário adiciona kit ao carrinho        │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ ⏱️ Passou 3s desde o carregamento?       │
│ ❌ NÃO → Aguarda                        │
│ ✅ SIM → Continua                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 🔒 Já exibiu nesta sessão?               │
│ ✅ SIM → Bloqueia                       │
│ ❌ NÃO → Continua                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 📅 Já exibiu 2x hoje?                    │
│ ✅ SIM → Bloqueia                       │
│ ❌ NÃO → Continua                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ ⏰ Passou 30min desde última exibição?   │
│ ❌ NÃO → Bloqueia                       │
│ ✅ SIM → Continua                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 🎓 Há lista de adoção no carrinho?       │
│ ❌ NÃO → Bloqueia                       │
│ ✅ SIM → Continua                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 🚫 Produto foi rejeitado hoje?           │
│ ✅ SIM → Tenta próximo produto          │
│ ❌ NÃO → Continua                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 🛒 Produto já está no carrinho?          │
│ ✅ SIM → Tenta próximo produto          │
│ ❌ NÃO → EXIBE POPUP! 🎉               │
└─────────────────────────────────────────┘
```

---

## 🎓 Regras de Recomendação

### **Mapeamento de Produtos por Nível (Simplificado - 2 produtos)**

| gradeNumber | Nível Escolar             | Produto 1 (Primário)   | Produto 2 (Secundário)     |
| ----------- | ------------------------- | ---------------------- | -------------------------- |
| **1**       | Ed. Infantil 1 ano        | Enquanto mamãe dormia  | É hora!                    |
| **2**       | Ed. Infantil 2 anos       | Enquanto mamãe dormia  | É hora!                    |
| **3**       | Ed. Infantil 3 anos       | Enquanto mamãe dormia  | É hora!                    |
| **4**       | Ed. Infantil Pré Escola 4 | Enquanto mamãe dormia  | É hora!                    |
| **5**       | Ed. Infantil Pré Escola 5 | Enquanto mamãe dormia  | É hora!                    |
| **6**       | 1ª Série / 1º ano         | Minidicionário (56551) | Tijolo por Tijolo (697682) |
| **7**       | 2ª Série / 2º ano         | Minidicionário (56551) | Tijolo por Tijolo (697682) |
| **8**       | 3ª Série / 3º ano         | Minidicionário (56551) | Tijolo por Tijolo (697682) |
| **9**       | 4ª Série / 4º ano         | Minidicionário (56551) | Tijolo por Tijolo (697682) |
| **10**      | 5ª Série / 5º ano         | Minidicionário (56551) | Tijolo por Tijolo (697682) |
| **11**      | 6ª Série / 6º ano         | Minidicionário (56551) | Tijolo por Tijolo (697682) |
| **12**      | 7ª Série / 7º ano         | Minidicionário (56551) | Dicionário Inglês (53959)  |
| **13**      | 8ª Série / 8º ano         | Minidicionário (56551) | Dicionário Inglês (53959)  |
| **14**      | 9ª Série / 9º ano         | Minidicionário (56551) | Dicionário Inglês (53959)  |
| **15**      | Ensino Médio 1º Colegial  | Minidicionário (56551) | Dicionário Inglês (53959)  |
| **16**      | Ensino Médio 2º Colegial  | Minidicionário (56551) | Dicionário Inglês (53959)  |
| **17**      | Ensino Médio 3º Colegial  | Minidicionário (56551) | Dicionário Inglês (53959)  |

**Nota:** Diferente do mini-cart, o popup recomenda apenas **2 produtos** por nível para manter foco e simplicidade.

### **Lógica de Seleção**

```javascript
// Percorre produtos em ordem de prioridade
for (var i = 0; i < recommendations.length; i++) {
  var productId = recommendations[i];

  // Pula produtos null/undefined
  if (!productId) continue;

  // Verifica se está no carrinho
  if (!isProductInCart(cartData, productId)) {
    return productId; // ✅ Retorna primeiro disponível
  }
}

// ❌ Todos produtos estão no carrinho
return null; // Não exibe popup
```

### **Cenários de Exemplo**

**Cenário 1: Educação Infantil 3 anos, carrinho vazio**

```
→ Recomenda: Enquanto mamãe dormia (697535) ✅
→ Se usuário clicar "Depois" → rejeitado para hoje
→ Próxima vez (amanhã ou outro kit): É hora! (697547) ✅
```

**Cenário 2: 5º ano, carrinho vazio**

```
→ Recomenda: Minidicionário (56551) ✅
```

**Cenário 3: 5º ano, Minidicionário já no carrinho**

```
→ Recomenda: Tijolo por Tijolo (697682) ✅
```

**Cenário 4: 5º ano, ambos produtos no carrinho**

```
→ Não exibe popup ❌
```

**Cenário 5: Usuário rejeitou Minidicionário hoje**

```
10:00 - Popup recomenda Minidicionário
10:05 - Usuário clica "Depois" → localStorage marca rejeição
15:00 - Usuário adiciona outro kit 5º ano
15:05 - Popup recomenda Tijolo por Tijolo ✅
        (pula Minidicionário pois foi rejeitado)
```

**Cenário 6: Ensino Médio, primeira visita do dia**

```
→ Recomenda: Minidicionário (56551) ✅
→ Se no carrinho: Dicionário Inglês (53959) ✅
```

---

## 💻 Implementação Técnica

### **Arquitetura**

```
┌────────────────────────────────────────┐
│     Página FTD (qualquer)              │
│  ┌──────────────────────────────────┐  │
│  │  popup-lateral.js                │  │
│  │  ┌────────────┐  ┌────────────┐  │  │
│  │  │ Controle   │→ │Recomendação│  │  │
│  │  │ Frequência │  │            │  │  │
│  │  └────────────┘  └────────────┘  │  │
│  │        ↓              ↓           │  │
│  │  ┌──────────────────────────┐    │  │
│  │  │ localStorage (regras)    │    │  │
│  │  └──────────────────────────┘    │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### **Componentes Principais**

| Componente                  | Função                                   | Complexidade |
| --------------------------- | ---------------------------------------- | ------------ |
| `init()`                    | Inicializa sistema e busca carrinho      | ⭐⭐⭐       |
| `fetchStudentsData()`       | Busca API e popula mapas                 | ⭐⭐⭐⭐     |
| `detectGradeFromCart()`     | Detecta nível escolar no carrinho        | ⭐⭐⭐⭐     |
| `canShowPopup()`            | Valida todas as regras de exibição       | ⭐⭐⭐⭐⭐   |
| `recordPopupShown()`        | Registra exibição (contador + timestamp) | ⭐⭐⭐       |
| `recordPopupRejected()`     | Registra rejeição por produto            | ⭐⭐⭐       |
| `recordPopupSuccess()`      | Limpa rejeições após sucesso             | ⭐⭐         |
| `cleanupOldData()`          | Remove dados antigos do localStorage     | ⭐⭐         |
| `getRecommendedProductId()` | Seleciona produto (2 opções)             | ⭐⭐⭐       |
| `fetchProductData()`        | Scraping de dados do PDP                 | ⭐⭐⭐⭐     |
| `createSidePopup()`         | Renderiza popup com eventos              | ⭐⭐⭐⭐⭐   |
| `addToCartViaAjax()`        | Adiciona produto via AJAX                | ⭐⭐⭐⭐     |

### **Variáveis Globais Principais**

```javascript
// IDs de Produtos (simplificado - 5 produtos)
const PRODUCT_IDS = {
  MINIDICIONARIO: 56551,
  DICIONARIO_INGLES: 53959,
  ENQUANTO_MAMAE_DORMIA: 697535,
  E_HORA: 697547,
  TIJOLO_POR_TIJOLO: 697682,
};

// Recomendações (2 produtos por nível)
const GRADE_RECOMMENDATIONS = {
  1: [PRODUCT_IDS.ENQUANTO_MAMAE_DORMIA, PRODUCT_IDS.E_HORA],
  // ... 17 níveis
};

// Configurações de Controle
const POPUP_RULES = {
  MAX_DISPLAYS_PER_DAY: 2,
  COOLDOWN_MINUTES: 30,
  MAX_DISPLAYS_PER_SESSION: 1,
  INITIAL_DELAY_MS: 3000,
  STORAGE_KEY_PREFIX: 'ftd_popup_',
};

// Controle de Sessão
let SESSION_POPUP_SHOWN = false;
let PAGE_LOAD_TIME = Date.now();
let initialDelayScheduled = false;

// Mapas de API
let STUDENT_GRADE_MAP = {};
let ADOPTION_LIST_GRADE_MAP = {};
let STUDENTS_DATA_LOADED = false;
```

### **Sistema de Armazenamento (localStorage)**

**Estrutura:**

```javascript
// Contador diário
localStorage['ftd_popup_daily_Mon Dec 16 2024'] = {
  count: 2, // Quantas vezes exibiu hoje
  lastProduct: 56551, // Último produto recomendado
  lastGrade: '5º ano', // Último nível detectado
};

// Timestamp última exibição
localStorage['ftd_popup_last_shown'] = 1702742400000;

// Rejeições do dia
localStorage['ftd_popup_rejected_Mon Dec 16 2024'] = {
  56551: { action: 'close_x_click', timestamp: 1702742400000 },
  53959: { action: 'close_depois_click', timestamp: 1702746000000 },
};
```

**Limpeza Automática:**

```javascript
function cleanupOldData() {
  // Remove entradas de dias anteriores
  // Executa na inicialização
  // Mantém apenas dados do dia atual
}
```

### **Scraping de Dados do Produto (PDP)**

**Método:** Fetch HTML + parsing de JSON-LD

```javascript
function fetchProductData(productId) {
  return fetch('/catalog/product/view/id/' + productId)
    .then((res) => res.text())
    .then((html) => parsePdp(html, productId));
}

function parsePdp(html, id) {
  // 1. Busca script[type="application/ld+json"]
  // 2. Extrai: name, image, price, url, description
  // 3. Fallback: meta tags og:* e twitter:*
  // 4. Limita descrição a 80 caracteres
  return { id, name, img, price, url, description };
}
```

### **Adicionar ao Carrinho**

**Método:** AJAX (sem bundle options no popup)

```javascript
POST /checkout/cart/add/uenc/{uenc}/product/{productId}
Headers: X-Requested-With: XMLHttpRequest
Body: product={id}&qty=1&form_key={key}
```

**Diferente do mini-cart:** Popup não adiciona produtos bundle (foco em produtos simples)

---

## 🎨 Interface e UX

### **Estrutura do Popup**

```html
<div id="recommendation-popup">
  <div style="background: white; border-radius: 8px; padding: 16px 22px;">
    <!-- Cabeçalho -->
    <div style="display: flex; justify-content: space-between;">
      <h3>LIVRO ESSENCIAL PARA 5º ANO - ANOS INICIAIS</h3>
      <button id="close-rec-popup">&times;</button>
    </div>

    <!-- Produto -->
    <div style="display: flex; gap: 16px;">
      <img src="..." alt="Produto" />
      <div>
        <h4>Minidicionário Ilustrado</h4>
        <p>Confira este produto incrível...</p>
      </div>
    </div>

    <!-- Ações -->
    <div style="display: flex; justify-content: space-between;">
      <button id="btn-add-rec-popup">ADICIONAR</button>
      <button id="close-rec-popup-text">Depois</button>
    </div>
  </div>
</div>
```

### **Posicionamento**

```
┌─────────────────────────────────────┐
│                                     │
│         Conteúdo da Página          │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────┐
│  📦 LIVRO ESSENCIAL │  ← Popup (fixo)
│     PARA 5º ANO     │     bottom: 20px
│                     │     left: 20px
│  [IMG]  Nome        │     z-index: 999
│         Descrição   │
│                     │
│  [ADICIONAR] Depois │
└─────────────────────┘
```

**Mobile (max-width: 768px):**

```
→ max-width: 90%
→ left: 5%, right: 5%
→ bottom: 25px
→ Font-sizes reduzidos
→ Padding menor
```

### **Animações**

**Entrada (slide-in):**

```css
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

#recommendation-popup {
  animation: slideInLeft 0.3s ease-out;
}
```

**Saída (slide-out):**

```css
@keyframes slideOutLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

#recommendation-popup.closing {
  animation: slideOutLeft 0.3s ease-in forwards;
  pointer-events: none;
}
```

### **Estados do Botão**

| Estado     | Texto           | Cor  | Disabled |
| ---------- | --------------- | ---- | -------- |
| Default    | ADICIONAR       | Azul | Não      |
| Carregando | ADICIONANDO...  | Azul | Sim      |
| Sucesso    | ADICIONADO!     | Azul | Sim      |
| Erro       | TENTE NOVAMENTE | Azul | Não      |

### **Título Dinâmico**

```javascript
if (gradeLevel) {
  // Exemplo: "LIVRO ESSENCIAL PARA 5º ANO - ANOS INICIAIS"
  titleHTML = 'LIVRO ESSENCIAL PARA ' + gradeLevel.toUpperCase();
} else {
  // Fallback genérico
  titleHTML = 'RECOMENDAÇÃO ESPECIAL PARA VOCÊ';
}
```

---

## 📊 Sistema de Tracking

### **Eventos Rastreados (Adobe Analytics)**

| Evento             | eVar25                                 | Produto | Preço | Qty |
| ------------------ | -------------------------------------- | ------- | ----- | --- |
| Popup exibido      | `AT_popup_lateral_popup_view`          | ✅      | ✅    | ✅  |
| Clique "Adicionar" | `AT_popup_lateral_add_to_cart_click`   | ✅      | ✅    | ✅  |
| Produto adicionado | `AT_popup_lateral_add_to_cart_success` | ✅      | ✅    | ✅  |
| Erro ao adicionar  | `AT_popup_lateral_add_to_cart_error`   | ✅      | ✅    | ✅  |
| Clique "X"         | `AT_popup_lateral_close_x_click`       | ❌      | ❌    | ❌  |
| Clique "Depois"    | `AT_popup_lateral_close_depois_click`  | ❌      | ❌    | ❌  |

### **Formato do Tracking**

```javascript
// Com produto
s.linkTrackVars = 'products,events,eVar25';
s.linkTrackEvents = 'scAdd';
s.products = ':Minidicionário;1;59.90;;';
s.events = 'scAdd';
s.eVar25 = 'AT_popup_lateral_popup_view 5º ano - Anos iniciais';
s.tl(true, 'o', 'target_activity_action');

// Sem produto (ações de fechar)
s.linkTrackVars = 'events,eVar25';
s.linkTrackEvents = 'scAdd';
s.events = 'scAdd';
s.eVar25 = 'AT_popup_lateral_close_x_click 5º ano - Anos iniciais';
s.tl(true, 'o', 'target_activity_action');
```

### **Informação do Nível Escolar**

Todos os eventos incluem o nível escolar detectado no final do `eVar25`:

```
AT_popup_lateral_popup_view 5º ano - Anos iniciais
AT_popup_lateral_add_to_cart_success 3 anos - Educação Infantil
AT_popup_lateral_close_depois_click Ensino Médio 2º Colegial
```

**Benefícios:**

- ✅ Análise de performance por nível escolar
- ✅ Identifica quais níveis convertem melhor
- ✅ Otimiza recomendações futuras

---

## 🛠️ Troubleshooting

### **Problema: Popup não aparece**

**Verificar:**

1. Console mostra `[Popup Rules]` logs?
2. Há lista de adoção no carrinho?
3. Já exibiu 2x hoje?
4. Está em cooldown?
5. Passou 3s desde carregamento?

**Soluções:**

```javascript
// Limpar localStorage
localStorage.clear();

// Verificar regras
console.log('[Debug] SESSION_POPUP_SHOWN:', SESSION_POPUP_SHOWN);
console.log('[Debug] Tempo desde carregamento:', Date.now() - PAGE_LOAD_TIME);

// Verificar contador diário
var today = new Date().toDateString();
var dailyData = JSON.parse(localStorage.getItem('ftd_popup_daily_' + today) || '{}');
console.log('[Debug] Exibições hoje:', dailyData.count);
```

### **Problema: Popup aparece múltiplas vezes**

**Causa:** Regras de frequência não funcionando

**Verificar:**

1. `recordPopupShown()` sendo chamado?
2. localStorage acessível?
3. `SESSION_POPUP_SHOWN` resetando?

**Solução:**

```javascript
// Forçar reset
SESSION_POPUP_SHOWN = false;
localStorage.removeItem('ftd_popup_last_shown');
```

### **Problema: Produto errado recomendado**

**Causa:** Nível escolar mal detectado

**Verificar:**

1. API retornou dados?
2. `adoptionListId` encontrado?
3. Regex detectou corretamente?

**Solução:**

```javascript
// Debug nível escolar
console.log('[Debug] Cart Data:', cartData);
console.log('[Debug] Detected Grade:', gradeLevel);
console.log('[Debug] Grade Number:', convertGradeLevelToNumber(gradeLevel));
```

### **Problema: Produto rejeitado volta a aparecer**

**Causa:** localStorage não persistindo ou dia mudou

**Verificar:**

1. localStorage funciona no navegador?
2. Data/hora do sistema correta?

**Solução:**

```javascript
// Verificar rejeições
var today = new Date().toDateString();
var rejected = JSON.parse(localStorage.getItem('ftd_popup_rejected_' + today) || '{}');
console.log('[Debug] Produtos rejeitados hoje:', rejected);
```

### **Problema: Popup não fecha**

**Causa:** Event listeners não anexados

**Verificar:**

1. Elementos `#close-rec-popup` e `#close-rec-popup-text` existem?
2. Listeners anexados após renderização?

**Solução:**

```javascript
// Forçar fechamento
var popup = document.getElementById('recommendation-popup');
if (popup) popup.remove();
```

### **Problema: Tracking não dispara**

**Causa:** Adobe Analytics não carregado

**Verificar:**

1. `window.s` existe?
2. `s.tl` é função?

**Solução:**

```javascript
// Debug tracking
console.log('[Debug] Adobe Analytics:', typeof window.s);
console.log('[Debug] s.tl exists:', typeof window.s?.tl);
```

---

## 🧪 Cenários de Teste

### **Teste 1: Regras de Frequência**

**Teste 1.1: Delay Inicial**

- ✅ Carregar página → aguardar 2s → popup NÃO aparece
- ✅ Carregar página → aguardar 4s → popup aparece

**Teste 1.2: Limite por Sessão**

- ✅ Popup aparece → fechar → adicionar outro kit → popup NÃO aparece
- ✅ Fechar navegador → reabrir → popup aparece novamente

**Teste 1.3: Limite Diário**

- ✅ Exibir popup 2x (em sessões diferentes) → 3ª tentativa bloqueada
- ✅ Aguardar até meia-noite → contador reseta

**Teste 1.4: Cooldown**

- ✅ Popup aparece → fechar → aguardar 25min → adicionar kit → bloqueado
- ✅ Aguardar 35min → adicionar kit → popup aparece

### **Teste 2: Rejeições**

**Teste 2.1: Rejeição via "X"**

- ✅ Popup recomenda Minidicionário → clicar "X" → produto marcado como rejeitado
- ✅ Adicionar outro kit mesmo nível → recomenda próximo produto (Tijolo por Tijolo)

**Teste 2.2: Rejeição via "Depois"**

- ✅ Popup recomenda Enquanto mamãe → clicar "Depois" → produto marcado
- ✅ Próxima recomendação → É hora! (segundo produto)

**Teste 2.3: Limpeza após Sucesso**

- ✅ Produto rejeitado → usuário adiciona manualmente → rejeição removida
- ✅ Próximo dia → produto pode ser recomendado novamente

### **Teste 3: Detecção de Nível**

**Teste 3.1: Via API**

- ✅ Kit 5º ano no carrinho → detecta "5º ano - Anos iniciais" via API
- ✅ Kit Ensino Médio → detecta "2º Colegial" via API

**Teste 3.2: Via Regex (Fallback)**

- ✅ API falha → regex detecta nível pelo nome do produto
- ✅ Aceita variações: "2ª série", "2º ano", "2°colegial"

**Teste 3.3: Lista de Adoção Obrigatória**

- ✅ Carrinho sem lista → popup NÃO aparece
- ✅ Carrinho com lista → popup aparece

### **Teste 4: Recomendações**

**Teste 4.1: Produto Primário**

- ✅ Kit 5º ano, carrinho vazio → recomenda Minidicionário

**Teste 4.2: Produto Secundário**

- ✅ Kit 5º ano, Minidicionário no carrinho → recomenda Tijolo por Tijolo

**Teste 4.3: Todos no Carrinho**

- ✅ Ambos produtos no carrinho → popup NÃO aparece

**Teste 4.4: Produto Rejeitado**

- ✅ Minidicionário rejeitado → pula para Tijolo por Tijolo

### **Teste 5: Adição ao Carrinho**

**Teste 5.1: Sucesso**

- ✅ Clicar "Adicionar" → botão muda para "ADICIONANDO..."
- ✅ Produto adicionado → botão muda para "ADICIONADO!"
- ✅ Popup fecha após 1.5s

**Teste 5.2: Erro**

- ✅ Erro na adição → botão muda para "TENTE NOVAMENTE"
- ✅ Reabilita botão após 2s

### **Teste 6: Interface**

**Teste 6.1: Animações**

- ✅ Popup entra com slide-in suave (0.3s)
- ✅ Popup sai com slide-out suave (0.3s)

**Teste 6.2: Responsivo**

- ✅ Desktop: posição fixa inferior esquerdo
- ✅ Mobile: largura 90%, centralizado horizontalmente

**Teste 6.3: Título Dinâmico**

- ✅ Nível detectado → "LIVRO ESSENCIAL PARA 5º ANO"
- ✅ Nível não detectado → "RECOMENDAÇÃO ESPECIAL PARA VOCÊ"

### **Teste 7: Tracking**

**Teste 7.1: Eventos Básicos**

- ✅ Popup exibido → dispara `popup_view` com produto e nível
- ✅ Clique adicionar → dispara `add_to_cart_click`
- ✅ Sucesso → dispara `add_to_cart_success`

**Teste 7.2: Eventos de Fechar**

- ✅ Clique "X" → dispara `close_x_click` (sem produto)
- ✅ Clique "Depois" → dispara `close_depois_click` (sem produto)

**Teste 7.3: Nível Escolar**

- ✅ Todos eventos incluem nível no eVar25
- ✅ Formato: `AT_popup_lateral_{event} {gradeLevel}`

---

## 📞 Suporte

**Desenvolvedor:** Marcelo Silva  
**Empresa:** Webjump CRO  
**Projeto:** FTD Lumisfera  
**Data:** Dezembro 2024

---

## 📝 Changelog

### **v1.0 - Dezembro 2024 (Atual)**

**🎯 Implementação Inicial:**

- ✅ Sistema de controle de frequência (2x/dia, cooldown 30min, 1x/sessão)
- ✅ Sistema de rejeições por produto (localStorage)
- ✅ Detecção via API + fallback regex
- ✅ Recomendação de 2 produtos por nível
- ✅ Interface responsiva com animações
- ✅ Tracking completo Adobe Analytics
- ✅ Limpeza automática de dados antigos
- ✅ Lista de adoção obrigatória
- ✅ Delay inicial de 3s
- ✅ 17 níveis escolares mapeados

**📦 Produtos Suportados:**

- ✅ 5 produtos principais
- ✅ Foco em produtos simples (sem bundles)
- ✅ Priorização por relevância pedagógica

**🎨 Interface:**

- ✅ Popup lateral (canto inferior esquerdo)
- ✅ Slide-in/slide-out suave
- ✅ Título dinâmico por nível escolar
- ✅ Botões de ação claros
- ✅ Responsivo (desktop + mobile)

**📊 Analytics:**

- ✅ 6 eventos rastreados
- ✅ Nível escolar em todos eventos
- ✅ Detalhes de produto (nome, preço, qty)
- ✅ Ações de rejeição rastreadas

---

**🎓 Documentação focada em regras de negócio, controle de frequência e experiência do usuário**
