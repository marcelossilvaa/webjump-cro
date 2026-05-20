<!-- mirror: .github/rules/05-inicializacao.md -->
## 5. Inicialização

### 5.1. DOM ready

```javascript
function init() {
  // Inicialização
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

### 5.2. Retry logic

Para elementos carregados dinamicamente:

```javascript
function init() {
  const container = findContainer();
  if (container) {
    customizeElements();
    return;
  }

  console.log('Container não encontrado, tentando novamente...');
  setTimeout(() => {
    init();
  }, 500);
}
```

### 5.3. Observadores e polling

Regra geral: configure observers/polling imediatamente, mesmo sem o alvo no DOM.

```javascript
let pollCount = 0;
const maxPolls = 40;

const pollInterval = setInterval(() => {
  pollCount++;
  const targetElement = document.querySelector('.elemento-alvo');
  if (targetElement || pollCount >= maxPolls) {
    clearInterval(pollInterval);
    if (targetElement) {
      processElements();
    }
  }
}, 50);
```

