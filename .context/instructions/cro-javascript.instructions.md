---
applyTo: "**/*.js"
---

# Scripts CRO (JavaScript)

Estas instruções complementam `.context/copilot-instructions.md` para **todos** os arquivos `*.js` do repositório.

## Autoridade

Regras detalhadas e exemplos: **`.context/rules/`** (começar por `01-estrutura.md` e `02-convencoes.md`). Padronização de experimentos: **`.context/skills/cro-script-padronizacao/SKILL.md`**.

## Obrigatório neste tipo de arquivo

- IIFE com `'use strict'`.
- `const` / `let` apenas; sem backticks; sem emojis em código/comentários/logs.
- CSS injetado via `document.createElement('style')` com `id` único e early return se já existir (ou padrão equivalente do projeto).
- Listeners e processamento DOM idempotentes (`data-*`).
- `MutationObserver` com debounce e proteção contra loop; um observer global por feature quando fizer sentido (`window._nomeObserver` ou guard).
- Inicialização com `DOMContentLoaded` ou `readyState`; retry/polling com teto de tentativas.
- Tracking quando alterar UI (ver `.context/rules/06-tracking.md`).

## Anti-padrões

- Template literals (crase).
- `var`.
- Depender só de classes CSS geradas tipo `.css-abc123` sem fallback por texto/atributos.
