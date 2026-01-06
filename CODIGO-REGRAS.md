# Regras de Código - Webjump CRO

Este documento define as regras básicas e padrões de código que devem ser seguidos em todos os scripts do projeto. Use este documento como referência para manter a consistência e qualidade do código.

## 1. Estrutura Básica

### 1.1. Função Encapsulada (IIFE)

**OBRIGATÓRIO**: Todo script deve ser encapsulado em uma IIFE (Immediately Invoked Function Expression) para evitar poluição do escopo global.

```javascript
(function () {
  // Seu código aqui
})();
```

### 1.2. Variáveis no Escopo

Declare todas as variáveis no início da função encapsulada, antes das funções auxiliares.

```javascript
(function () {
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;
  let targetContainer = null;

  // Funções aqui
})();
```

## 2. Convenções de Código

### 2.1. Template Literals

**PROIBIDO**: Não use template literals (backticks). Use concatenação de strings com o operador `+`.

❌ **ERRADO**:

```javascript
console.log(`Encontrados ${count} elementos`);
const message = `Container ${i + 1} contém cards`;
```

✅ **CORRETO**:

```javascript
console.log('Encontrados ' + count + ' elementos');
const message = 'Container ' + (i + 1) + ' contém cards';
```

### 2.2. Emojis

**PROIBIDO**: Não use emojis em comentários, console.log ou qualquer parte do código.

❌ **ERRADO**:

```javascript
console.log('✅ Botões estilizados: ' + buttonsStyled);
// ✅ Função executada com sucesso
```

✅ **CORRETO**:

```javascript
console.log('Botões estilizados: ' + buttonsStyled);
// Função executada com sucesso
```

### 2.3. Comentários

- Use comentários em **português**
- Comentários devem ser claros e objetivos
- Use comentários para explicar a lógica complexa, não o óbvio

```javascript
// Função para encontrar o container que contém os cards com "x de"
function findCardsContainer() {
  // Buscar todos os containers com essas classes
  const allContainers = document.querySelectorAll('.container-capsule');

  // Verificar qual container contém spans com "x de"
  for (let i = 0; i < allContainers.length; i++) {
    // Lógica aqui
  }
}
```

### 2.4. Declaração de Variáveis

- Use `const` para valores que não serão reatribuídos
- Use `let` para valores que serão reatribuídos
- **NUNCA** use `var`

```javascript
const containers = document.querySelectorAll('.container');
let styledCount = 0;
let isProcessing = false;
```

## 3. Manipulação do DOM

### 3.1. Seletores

**PREFIRA** seletores por conteúdo/texto ao invés de classes CSS voláteis:

✅ **PREFERIDO**:

```javascript
const spans = container.querySelectorAll('span');
spans.forEach((span) => {
  const text = span.textContent || '';
  if (text.includes('A partir de:')) {
    // Processar
  }
});
```

❌ **EVITAR** (classes CSS podem mudar):

```javascript
const priceDiv = container.querySelector('.css-1rdnbft');
```

### 3.2. Aplicação de Estilos

Use `setProperty` com a flag `'important'` para garantir que os estilos sejam aplicados:

```javascript
element.style.setProperty('background-color', '#CF527A', 'important');
element.style.setProperty('border-radius', '65px', 'important');
element.style.setProperty('font-weight', '700', 'important');
```

Para remover propriedades:

```javascript
element.style.removeProperty('transform');
element.style.removeProperty('box-shadow');
```

### 3.3. Atributos Data-\*

Use atributos `data-*` para marcar elementos já processados e evitar re-processamento:

```javascript
if (!element.hasAttribute('data-styled-applied')) {
  element.style.setProperty('max-width', '266px', 'important');
  element.setAttribute('data-styled-applied', 'true');
}
```

**Padrão de nomenclatura**: `data-[funcionalidade]-applied`

- `data-max-width-applied`
- `data-min-height-applied`
- `data-hover-listener-added`
- `data-card-width-applied`

## 4. Event Listeners

### 4.1. Adicionar Event Listeners

Sempre verifique se o listener já foi adicionado antes de adicionar novamente:

```javascript
if (!button.hasAttribute('data-hover-listener-added')) {
  button.addEventListener('mouseenter', () => {
    button.style.setProperty('transform', 'translateY(-2px)', 'important');
  });

  button.addEventListener('mouseleave', () => {
    button.style.removeProperty('transform');
  });

  button.setAttribute('data-hover-listener-added', 'true');
}
```

### 4.2. Arrow Functions

Use arrow functions para callbacks simples:

```javascript
elements.forEach((element) => {
  // Processar elemento
});
```

## 5. MutationObserver

### 5.1. Proteção contra Loops Infinitos

Sempre implemente proteção contra loops infinitos ao usar MutationObserver:

```javascript
let isProcessing = false;
let debounceTimer = null;

function customizeElements() {
  // Evitar execução simultânea
  if (isProcessing) {
    return;
  }
  isProcessing = true;

  // Seu código aqui

  // Resetar flag de processamento
  isProcessing = false;
}

const observer = new MutationObserver(() => {
  // Debounce para evitar loops
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    customizeElements();
  }, 300);
});
```

### 5.2. Filtrar Mudanças

Filtre mudanças causadas pelo próprio script para evitar loops:

```javascript
const observer = new MutationObserver((mutations) => {
  // Ignorar mudanças causadas por badges (evitar loop)
  const hasBadgeChanges = mutations.some((mutation) => {
    const addedNodes = Array.from(mutation.addedNodes);
    return addedNodes.some(
      (node) =>
        node.nodeType === 1 &&
        (node.classList?.contains('badge-mais-barato') ||
          node.querySelector?.('.badge-mais-barato'))
    );
  });

  if (hasBadgeChanges) {
    return; // Ignorar mudanças de badges
  }

  // Processar outras mudanças
  customizeElements();
});
```

## 6. Inicialização

### 6.1. Verificação de DOM Ready

Sempre verifique se o DOM está pronto antes de inicializar:

```javascript
function init() {
  // Seu código de inicialização
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

### 6.2. Retry Logic

Para elementos que podem ser carregados dinamicamente, implemente lógica de retry:

```javascript
function init() {
  const container = findContainer();

  if (container) {
    // Inicializar
    customizeElements();
  } else {
    console.log('Container não encontrado, tentando novamente...');
    setTimeout(() => {
      init();
    }, 500);
  }
}
```

### 6.3. Observadores e Polling

**Regra Geral**: Sempre configure os `MutationObserver` e/ou lógica de polling imediatamente, mesmo que os elementos-alvo ainda não estejam presentes no DOM. Isso garante que o script funcione corretamente em páginas com carregamento dinâmico.

#### Exemplo de Configuração de Observadores

```javascript
function setupObserver() {
  if (window._exampleObserver) return;

  const observer = new MutationObserver(() => {
    // Lógica para processar mudanças no DOM
    processElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  window._exampleObserver = observer;
}
```

#### Exemplo de Polling com Limite de Tentativas

```javascript
let pollCount = 0;
const maxPolls = 40; // Tenta por 2 segundos (40 * 50ms)

const pollInterval = setInterval(() => {
  pollCount++;
  const targetElement = document.querySelector('.elemento-alvo');

  if (targetElement || pollCount >= maxPolls) {
    clearInterval(pollInterval);

    if (targetElement) {
      // Elemento encontrado, inicializar lógica
      processElements();
    }
  }
}, 50);
```

**Checklist para Observadores e Polling**:

- [ ] Sempre configure o `MutationObserver` no início do script.
- [ ] Use polling com limite de tentativas para garantir inicialização em páginas com carregamento dinâmico.
- [ ] Combine observadores e polling para maior robustez.
- [ ] Evite loops infinitos com proteção de contadores (`pollCount`) ou debounce.

## 7. Console.log

### 7.1. Mensagens de Debug

Use `console.log` para feedback durante o desenvolvimento, mas mantenha mensagens claras e informativas:

```javascript
console.log('Container com cards encontrado!');
console.log('Botões estilizados: ' + buttonsStyled);
console.log('Max-width de 266px aplicado em ' + cardsStyled + ' card(s)');
```

### 7.2. Formato

- Use português
- Seja descritivo
- Inclua contadores quando relevante
- Não use emojis

## 8. Funções Auxiliares

### 8.1. Organização

Organize funções auxiliares antes da função principal:

```javascript
(function () {
  // Variáveis
  let observer = null;

  // Função auxiliar 1
  function findContainer() {
    // ...
  }

  // Função auxiliar 2
  function customizeElements() {
    // ...
  }

  // Função de inicialização
  function init() {
    // ...
  }

  // Inicializar
  init();
})();
```

### 8.2. Nomenclatura

- Use camelCase para nomes de funções
- Use nomes descritivos em português ou inglês (seja consistente)
- Prefixe funções auxiliares com verbos: `find`, `apply`, `customize`, `init`

## 9. Tratamento de Erros

### 9.1. Verificações de Segurança

Sempre verifique se elementos existem antes de manipulá-los:

```javascript
const container = document.querySelector('.container');
if (!container) {
  return;
}

// Processar container
```

### 9.2. Fallbacks

Use fallbacks para valores que podem ser null/undefined:

```javascript
const text = span.textContent || '';
const parent = element.parentElement;
if (parent && parent.tagName === 'DIV') {
  // Processar
}
```

## 10. Performance

### 10.1. Debounce

Use debounce para funções que podem ser chamadas frequentemente:

```javascript
let debounceTimer = null;

function handleResize() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    applyResponsiveStyles();
  }, 300);
}

window.addEventListener('resize', handleResize);
```

### 10.2. Evitar Re-processamento

Sempre use atributos `data-*` para evitar processar o mesmo elemento múltiplas vezes:

```javascript
elements.forEach((element) => {
  if (!element.hasAttribute('data-processed')) {
    // Processar elemento
    element.setAttribute('data-processed', 'true');
  }
});
```

## 11. Exemplo Completo

```javascript
(function () {
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;
  let targetContainer = null;

  // Função para encontrar o container
  function findContainer() {
    const containers = document.querySelectorAll('.container-capsule');

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const spans = container.querySelectorAll('span');

      for (let j = 0; j < spans.length; j++) {
        const text = spans[j].textContent || '';
        if (text.includes('x de')) {
          return container;
        }
      }
    }

    return null;
  }

  // Função para aplicar estilos
  function customizeElements() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;

    if (!targetContainer) {
      targetContainer = findContainer();
    }

    if (!targetContainer) {
      isProcessing = false;
      return;
    }

    const buttons = targetContainer.querySelectorAll('input[type="button"]');
    let buttonsStyled = 0;

    buttons.forEach((button) => {
      if (button.value === 'Compre agora') {
        if (!button.hasAttribute('data-styled-applied')) {
          button.style.setProperty('background-color', '#CF527A', 'important');
          button.style.setProperty('border-radius', '65px', 'important');
          button.setAttribute('data-styled-applied', 'true');
          buttonsStyled++;
        }
      }
    });

    if (buttonsStyled > 0) {
      console.log('Botões estilizados: ' + buttonsStyled);
    }

    isProcessing = false;
  }

  // Função de inicialização
  function init() {
    targetContainer = findContainer();

    if (targetContainer) {
      console.log('Container encontrado!');
      customizeElements();

      if (!observer) {
        observer = new MutationObserver(() => {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(() => {
            customizeElements();
          }, 300);
        });

        observer.observe(targetContainer, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    } else {
      console.log('Container não encontrado, tentando novamente...');
      setTimeout(() => {
        init();
      }, 500);
    }
  }

  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

## 12. Checklist

Antes de finalizar um script, verifique:

- [ ] Script está encapsulado em IIFE
- [ ] Não há template literals (usar concatenação com `+`)
- [ ] Não há emojis no código
- [ ] Comentários estão em português
- [ ] Variáveis declaradas com `let` ou `const` (nunca `var`)
- [ ] Estilos aplicados com `setProperty` e flag `'important'`
- [ ] Atributos `data-*` usados para evitar re-processamento
- [ ] Event listeners verificam se já foram adicionados
- [ ] MutationObserver tem proteção contra loops (flag `isProcessing` + debounce)
- [ ] Verificação de DOM ready antes de inicializar
- [ ] Verificações de segurança (elementos existem antes de manipular)
- [ ] Console.log sem emojis e em português
- [ ] Trackeamento de visualização e ações implementado (quando aplicável)

## 13. Trackeamento de Componentes e Ações

### 13.1. Quando Aplicar

**OBRIGATÓRIO**: Sempre que criar ou modificar um componente visual, implemente trackeamento para:

- **Visualização**: Quando o componente é exibido na tela
- **Ações**: Cliques em botões, banners, cards e elementos interativos

### 13.2. Estrutura da Função de Analytics

Use a seguinte estrutura padrão para enviar eventos ao Adobe Analytics:

```javascript
function analyticsEvent(eventLabel, eventType) {
  if (!eventLabel) {
    console.log('[Tracking NomeComponente] Missing parameters for analytics event.');
    return;
  }

  // Monta o label do evento
  const labelEvent = 'AT_NomeAtividade_' + eventType + ' ' + eventLabel;

  console.log('[Tracking NomeComponente] Analytics event triggered:', labelEvent);

  (function () {
    var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
    if (!s || typeof s.tl !== 'function') return;

    s.linkTrackVars = 'events,eVar82,eVar84';
    s.linkTrackEvents = 'event90';
    s.events = 'event90';
    s.eVar82 = labelEvent; // Informação principal da ação
    s.eVar84 = 'AT_contexto_pagina'; // Contexto adicional

    s.tl(true, 'o', 'target_activity_action');
  })();
}
```

### 13.3. Uso das eVars

- **eVar82**: Informação principal da ação (ex: `AT_cupom cupom_aplicar_clique`, `AT_BF_banner_click_passagens Banner Nordeste`)
- **eVar84**: Contexto adicional (ex: valor do input, nome da página, status da ação)

#### Exemplos de Uso:

```javascript
// Trackeamento de clique em banner
s.eVar82 = 'AT_BF_banner_click_passagens Banner Nordeste';
s.eVar84 = 'AT_BF_lp_Passagens';

// Trackeamento de ação com valor de input
s.eVar82 = 'AT_cupom cupom_aplicar_clique';
s.eVar84 = 'AT_cupom_value DESCONTO10';

// Trackeamento de sucesso/erro
s.eVar82 = 'AT_cupom cupom_aplicado_sucesso';
s.eVar84 = 'AT_cupom_status_sucesso';
```

### 13.4. Tipos de Eventos

Defina tipos de eventos claros para facilitar a análise:

```javascript
// Mapeamento de ações
const actionMap = {
  visualizacao: 'component_view',
  clique: 'component_click',
  sucesso: 'action_success',
  erro: 'action_error',
};

// Tipos de componentes
const componentTypes = {
  banner: 'banner_click',
  card: 'card_click',
  mini_banner: 'mini_banner_click',
  button: 'button_click',
};
```

### 13.5. Estrutura de Listeners para Cliques

Sempre use o padrão de verificação `data-analytics-added` antes de adicionar listeners:

```javascript
function addClickListeners() {
  const botoes = document.querySelectorAll('button.meu-botao');

  botoes.forEach((botao, index) => {
    // Verifica se o listener já foi adicionado
    if (botao.hasAttribute('data-analytics-added')) {
      return;
    }

    botao.setAttribute('data-analytics-added', 'true');

    // Extrai informações para o tracking
    const bannerName = getBannerName(botao);

    botao.addEventListener('click', () => {
      analyticsEvent(bannerName, 'clique');
    });

    console.log('[Tracking] Listener adicionado ao botão:', bannerName);
  });
}
```

### 13.6. Trackeamento de Respostas de API

Para ações que envolvem chamadas de API (ex: aplicar cupom), intercepte as requisições:

```javascript
// Intercepta Fetch API
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const urlString = typeof url === 'string' ? url : url.url || '';

  // Verifica se é a API desejada
  if (urlString.includes('/minha-api')) {
    return originalFetch.apply(this, arguments).then(function (response) {
      // Sucesso (200-299)
      if (response.status >= 200 && response.status < 300) {
        analyticsEvent('sucesso', 'api_response');
      }
      // Erro (400, 404, etc)
      else if (response.status >= 400) {
        analyticsEvent('erro', 'api_response');
      }
      return response;
    });
  }

  return originalFetch.apply(this, arguments);
};
```

### 13.7. Nomenclatura de Labels

Siga o padrão de nomenclatura para facilitar a análise:

```
AT_[NomeAtividade]_[tipo_evento]_[contexto] [detalhe]
```

#### Exemplos:

- `AT_BF_banner_click_passagens Banner Nordeste` → Clique no banner Nordeste da LP Passagens
- `AT_cupom cupom_aplicar_clique` → Clique no botão aplicar cupom
- `AT_cupom cupom_aplicado_sucesso` → Cupom aplicado com sucesso

### 13.8. Console.log para Debug

Use console.log com prefixo identificador para facilitar debug:

```javascript
console.log('[Tracking NomeComponente] Analytics event triggered:', labelEvent);
console.log('[Tracking NomeComponente] Listener adicionado ao botão:', bannerName);
console.log('[Tracking NomeComponente] API retornou SUCESSO (status ' + response.status + ')');
```

### 13.9 Checklist de Trackeamento

Antes de finalizar um script com trackeamento, verifique:

- [ ] Função `analyticsEvent` implementada com eVar82 e eVar84
- [ ] Verificação de `data-analytics-added` para evitar duplicação de listeners
- [ ] Labels seguem o padrão de nomenclatura `AT_[nome]_[tipo]`
- [ ] Console.log com prefixo `[Tracking NomeComponente]`
- [ ] MutationObserver para elementos carregados dinamicamente (se necessário)
- [ ] Interceptação de API para trackeamento de sucesso/erro (se aplicável)

---

**Última atualização**: 2025-12-16
