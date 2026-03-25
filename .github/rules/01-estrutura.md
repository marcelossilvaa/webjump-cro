<!-- source: .cursor/rules/01-estrutura.md -->
## 1. Estrutura básica

### 1.1. Função encapsulada (IIFE)

**Obrigatório**: todo script deve ser encapsulado em IIFE para evitar poluição do escopo global.

```javascript
(function () {
  // Seu código aqui
})();
```

### 1.2. Variáveis no escopo

Declare variáveis no início da IIFE, antes das funções auxiliares.

```javascript
(function () {
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;
  let targetContainer = null;

  // Funções auxiliares aqui
})();
```

### 1.3. Organização sugerida

- Variáveis
- Constantes
- Funções utilitárias
- Funções de feature (DOM, listeners, observers)
- `init()`
- Bootstrap (`DOMContentLoaded`)

