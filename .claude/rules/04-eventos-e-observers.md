<!-- mirror: .github/rules/04-eventos-e-observers.md -->
## 4. Event listeners e observers

### 4.1. Event listeners

Evite duplicação: sempre marque quando um listener foi adicionado.

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

### 4.2. Arrow functions

Use arrow functions em callbacks simples.

### 4.3. MutationObserver (anti-loop + debounce)

**Obrigatório**: tenha proteção contra loop infinito.

```javascript
let isProcessing = false;
let debounceTimer = null;

function customizeElements() {
  if (isProcessing) return;
  isProcessing = true;

  // Seu código aqui

  isProcessing = false;
}

const observer = new MutationObserver(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    customizeElements();
  }, 300);
});
```

### 4.4. Filtrar mudanças causadas pelo próprio script

Quando o script injeta DOM, filtre mutations que ele mesmo provoca.

