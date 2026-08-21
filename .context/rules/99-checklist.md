<!-- canonical: .context/rules/99-checklist.md -->
## Checklist de finalização

- [ ] Script encapsulado em IIFE
- [ ] Variáveis declaradas no topo do escopo
- [ ] Sem template literals (usar concatenação com `+`)
- [ ] Sem emojis no código/logs
- [ ] Sem `var` (apenas `const`/`let`)
- [ ] Comentários em português e objetivos
- [ ] Estilos via `setProperty(..., 'important')` quando necessário
- [ ] `data-*` para evitar reprocessamento e duplicação de listeners
- [ ] MutationObserver com proteção anti-loop (flag + debounce e/ou filtro)
- [ ] DOM ready + retry/polling quando o DOM é dinâmico
- [ ] Tracking implementado quando aplicável (view + actions)
- [ ] **Azul SPA / checkout**: Target em etapas anteriores; UI só na página alvo (`isTargetPage`); cleanup ao sair

