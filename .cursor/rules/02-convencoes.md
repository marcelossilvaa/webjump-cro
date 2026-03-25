<!-- mirror: .github/rules/02-convencoes.md -->
## 2. Convenções de código

### 2.1. Template literals (backticks)

**Proibido**: não use template literals (crase/backticks). Use concatenação com `+`.

```javascript
// Correto
console.log('Encontrados ' + count + ' elementos');
const message = 'Container ' + (i + 1) + ' contém cards';
```

### 2.2. Emojis

**Proibido**: não use emojis em comentários, `console.log` ou qualquer parte do código.

### 2.3. Comentários

- Comentários em **português**
- Claros e objetivos
- Explicar lógica não óbvia (evite comentar o óbvio)

### 2.4. Declaração de variáveis

- Use `const` quando não houver reatribuição
- Use `let` quando houver reatribuição
- **Nunca** use `var`

```javascript
const containers = document.querySelectorAll('.container');
let styledCount = 0;
```

