---
name: cro-script-padronizacao
description: >-
  Padroniza scripts CRO (IIFE, CSS injetado no JS, data-*, observers com debounce
  e anti-loop, DOM ready, tracking Adobe quando aplicável). Use ao criar ou refatorar
  experimentos Webjump, ao unificar variantes, ao remover backticks/var, ou quando o
  usuário pedir conformidade com .context/rules.
---

# CRO — Padronização de scripts

## Quando aplicar

- Novo script de teste CRO ou refatoração de snippet legado.
- Unificar várias variantes num único arquivo.
- Garantir alinhamento com `.context/rules/` (ver módulos em `01-` a `99-`).

## Regras obrigatórias (resumo)

| Tema | Regra |
|------|--------|
| Escopo | IIFE `(function () { ... })();` — sem vazar globais desnecessários |
| Variáveis | No topo da IIFE: `let`/`const` apenas — **nunca** `var` |
| Strings | **Sem** template literals (backticks); usar `+` |
| Logs/comentários | Português; **sem emojis** |
| Estilos inline | Preferir `element.style.setProperty('prop', 'val', 'important')` quando precisar vencer CSS |
| CSS em bloco | Injetar via `<style id="...">` + `textContent` (sem backticks no arquivo) |
| Marcação | `data-*` para “já processado” / “listener já adicionado” |
| Observers | `isProcessing` + debounce; filtrar mutations do próprio script |
| Init | `document.readyState` + `DOMContentLoaded`; retry/polling com limite |
| Tracking | Se houver UI nova: view + ações; ver `rules/06-tracking.md` |

## Fluxo de trabalho

1. Ler o script alvo e identificar escopo (página alvo, guards existentes).
2. Envolver em IIFE se ainda não estiver; mover variáveis para o topo.
3. Substituir backticks por concatenação; remover `var`.
4. Centralizar CSS: função `getXxxCss()` retornando array de regras `.join('\n')` ou string concatenada; `injectStyles()` com `id` único e early return se já existir.
5. Listeners: checar `data-*-added` antes de `addEventListener`.
6. `MutationObserver`: debounce (ex.: 100–300 ms); ignorar nós injetados pelo próprio teste quando necessário.
7. Adicionar `window._nomeObserver` ou flag global para não duplicar observer.
8. Se componente visual novo: `analyticsSend` / padrão Adobe do projeto (eVar82/eVar84).
9. Rodar checklist final (abaixo).

## Esqueleto mínimo

```javascript
(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const STYLE_ID = 'at-exemplo-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '.selector { color: #000; }';
    document.head.appendChild(style);
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      // DOM + lógica
    } finally {
      isProcessing = false;
    }
  }

  function init() {
    injectStyles();
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

## Checklist de entrega

- [ ] IIFE e variáveis no topo
- [ ] Sem backticks; sem `var`; sem emojis
- [ ] CSS com id único; sem duplicar `<style>`
- [ ] `data-*` em listeners e processamento idempotente
- [ ] Observer com debounce e/ou filtro anti-loop
- [ ] DOM ready + retry/polling se DOM dinâmico
- [ ] Tracking (se UI nova)
- [ ] Guard de página (pathname/query) se o teste for específico
- [ ] **Azul SPA / checkout**: Target em etapas anteriores; UI só na página alvo; ver `.context/rules/03-dom.md` §3.5

## Referência no repositório

- `.context/rules/` — regras por tema
- `.context/regras.md` — índice
