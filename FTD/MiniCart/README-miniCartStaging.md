# 📦 Sistema de Recomendação de Produtos no Mini-Cart FTD

> **Documentação Técnica v1.0**  
> Sistema de Cross-Sell Dinâmico Baseado em Nível Escolar

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
| **Linhas**     | ~1.956                  |
| **Ambiente**   | Staging FTD Lumisfera   |
| **Plataforma** | Magento 2 + Knockout.js |
| **Versão**     | 1.0.0                   |

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
1. Usuário adiciona Kit ao carrinho
   ↓
2. Sistema detecta o kit e extrai nível escolar
   ↓
3. Busca produto complementar para aquele nível
   ↓
4. Exibe recomendação no mini-cart
   ↓
5. Usuário clica "Adicionar"
   ↓
6. Card desaparece com animação
```

### **1. Detecção de Kit**

O sistema monitora o carrinho e detecta kits através de **regex patterns** no nome do produto:

```javascript
// Padrões de detecção
/conjunto|kit|faça|faca|lista\s*de\s*materiais/i
/\d+[º°]\s*(ano|série)/i
```

**Exemplos detectados:**

- ✅ "Kit 5º ano - Anos iniciais"
- ✅ "Conjunto Didático 3º ano"
- ✅ "Lista de materiais - Ensino Médio 2"

### **2. Extração do Nível Escolar**

Sistema extrai o nível usando regex patterns específicos:

| Padrão                 | Exemplo                  | gradeNumber |
| ---------------------- | ------------------------ | ----------- |
| Educação Infantil X    | "Educação Infantil 4"    | 1-2         |
| Pré Escola X           | "Pré Escola 5"           | 3-4         |
| Xº ano - Anos iniciais | "3º ano - Anos iniciais" | 5-9         |
| Xº ano - Anos finais   | "7º ano - Anos finais"   | 10-14       |
| Ensino Médio X         | "Ensino Médio 2"         | 15-17       |

### **3. Seleção do Produto**

**Lógica:**

1. Recomenda primeiro **produto primário** que não está no carrinho
2. Se todos primários estão no carrinho → recomenda **produto secundário**
3. Se todos estão no carrinho → não exibe recomendação

### **4. Regras Especiais**

#### **Persistência da Recomendação Inicial**

- Produto recomendado permanece mesmo se usuário adicioná-lo
- Exceção: se já estava no carrinho antes, exibe o próximo

#### **Múltiplos Kits**

- Se há 2+ kits no carrinho → usa apenas o **primeiro** para recomendação

#### **Ocultação Permanente**

- Após adicionar o produto recomendado → card desaparece com animação fade-out

---

## 🎓 Regras de Recomendação

### **Mapeamento de Produtos por Nível**

| Nível                    | Produtos Primários                                  | Produtos Secundários                                |
| ------------------------ | --------------------------------------------------- | --------------------------------------------------- |
| **Pré Escola (3-4)**     | Numeródromo (52150)<br>Bichodário (52144)           | -                                                   |
| **1º-2º ano (5-6)**      | Numeródromo (52150)<br>Bichodário (52144)           | -                                                   |
| **3º ano (7)**           | Numeródromo (52150)<br>Bichodário (52144)           | Tabuada A (54595)                                   |
| **4º ano (8)**           | Numeródromo (52150)<br>Bichodário (52144)           | Tabuada A (54595)<br>Tabuada B (54598)              |
| **5º-9º ano (9-14)**     | Minidicionário (56551)<br>Dicionário Inglês (53959) | Tabuada A-D (54595-54604)                           |
| **Ensino Médio (15-17)** | Estuda com Anual (1213247)                          | Minidicionário (56551)<br>Dicionário Inglês (53959) |

### **Cenários de Exemplo**

**Cenário 1: 5º ano, carrinho vazio**

```
→ Recomenda: Minidicionário (56551)
```

**Cenário 2: 5º ano, Minidicionário já no carrinho**

```
→ Recomenda: Dicionário Inglês (53959)
```

**Cenário 3: 5º ano, todos primários no carrinho**

```
→ Recomenda: Tabuada A (54595)
```

**Cenário 4: Todos produtos já no carrinho**

```
→ Não exibe recomendação
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

| Componente                  | Função                    | Complexidade |
| --------------------------- | ------------------------- | ------------ |
| `run()`                     | Orquestração principal    | ⭐⭐⭐⭐⭐   |
| `detectSchoolKitAndGrade()` | Detecta kits e nível      | ⭐⭐⭐       |
| `getRecommendedProductId()` | Seleciona produto         | ⭐⭐⭐       |
| `loadRecommendedProduct()`  | Carrega dados (cache/PDP) | ⭐⭐⭐⭐     |
| `render()`                  | Renderiza UI              | ⭐⭐⭐⭐⭐   |
| `addToCart()`               | Adiciona ao carrinho      | ⭐⭐⭐⭐⭐   |

### **Sistema de Monitoramento**

**3 métodos para detectar mudanças no carrinho:**

1. **MutationObserver** - Monitora DOM (debounce 300ms)
2. **customerData.subscribe** - Escuta atualizações Magento (debounce 1000ms)
3. **State Hash** - Evita re-processamento (`productId:qty`)

### **Sistema de Cache (3 Camadas)**

```
L1: sessionStorage (TTL 10min)
     ↓ (miss)
L2: customerData (runtime)
     ↓ (miss)
L3: Product PDP (fetch + parse)
```

### **Prevenção de Loops**

1. `isRunning` flag
2. `lastCheckedState` hash comparison
3. `mutationObserverPaused` durante modificações DOM
4. `lastCartSubscriptionState` para cart.subscribe

### **Adicionar ao Carrinho**

**Método:** AJAX (fetch) com headers Magento

```javascript
POST /checkout/cart/add/uenc/{uenc}/product/{productId}
Headers: X-Requested-With: XMLHttpRequest
Body: product={id}&qty=1&form_key={key}
```

**Verificação pós-adição:** Aguarda 1s e verifica via `customerData`

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
2. PDP parse funcionando?
3. `pdpData.id` definido?

**Soluções:**

- Limpar: `sessionStorage.clear()`
- Forçar reload: `forceReload = true`
- Verificar seletores DOM

---

## 📋 Logs de Debug

### **Inicialização**

```
[MiniCart] Script inicializado - versão com detecção aprimorada de kits
[MiniCart] Aguardando anchor: .actions-info
```

### **Detecção**

```
[MiniCart] Verificando X itens no carrinho para detectar kits...
[MiniCart] Kit detectado: Kit 5º ano...
[MiniCart] Nível escolar extraído: 5º ano - Anos iniciais
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

### **Teste 5: Múltiplos Kits**

- ✅ Kit 5º + Kit 3º → recomenda baseado no 1º (5º ano)

### **Teste 6: Performance**

- ✅ Não cria loops
- ✅ Debounce funciona
- ✅ Cache respeitado

---

## 📞 Suporte

**Desenvolvedor:** Marcelo Silva  
**Empresa:** Webjump CRO  
**Projeto:** FTD Lumisfera  
**Data:** Novembro 2025

---

## 📝 Changelog

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
