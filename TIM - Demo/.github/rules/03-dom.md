<!-- source: .cursor/rules/03-dom.md -->
## 3. Manipulação do DOM

### 3.1. Seletores

**Prefira** seletores por conteúdo/texto (mais resilientes) ao invés de classes voláteis.

```javascript
const spans = container.querySelectorAll('span');
spans.forEach((span) => {
  const text = span.textContent || '';
  if (text.includes('A partir de:')) {
    // Processar
  }
});
```

### 3.2. Aplicação de estilos

Use `setProperty` com `'important'` quando precisar garantir precedência.

```javascript
element.style.setProperty('background-color', '#CF527A', 'important');
element.style.setProperty('border-radius', '65px', 'important');
```

Para remover:

```javascript
element.style.removeProperty('transform');
```

### 3.3. `data-*` para evitar reprocessamento

Use `data-*` para marcar elementos já processados e evitar duplicações.

**Padrão**: `data-[funcionalidade]-applied` / `data-[funcionalidade]-added`

```javascript
if (!element.hasAttribute('data-styled-applied')) {
  element.style.setProperty('max-width', '266px', 'important');
  element.setAttribute('data-styled-applied', 'true');
}
```

