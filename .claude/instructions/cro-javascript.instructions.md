# Scripts CRO (JavaScript)

Estas instruções complementam `copilot-instructions.md` para arquivos `*.js` do repositório.

## Autoridade

Regras detalhadas e exemplos: **`.claude/rules/`** — começar por `01-estrutura.md` e `02-convencoes.md`.

## Obrigatório neste tipo de arquivo

- IIFE com `'use strict'`.
- `const` / `let` apenas; sem backticks; sem emojis em código/comentários/logs.
- CSS injetado via `document.createElement('style')` com `id` único e early return se já existir (ou padrão equivalente do projeto).
- Listeners e processamento DOM idempotentes (`data-*`).
- `MutationObserver` com debounce e proteção contra loop; um observer global por feature quando fizer sentido (`window._nomeObserver` ou guard).
- Inicialização com `DOMContentLoaded` ou `readyState`; retry/polling com teto de tentativas.
- Tracking Adobe quando alterar UI (ver `.github/rules/06-tracking.md`).

## Anti-padrões

- Template literals (crase).
- `var`.
- Depender só de classes CSS geradas tipo `.css-abc123` sem fallback por texto/atributos.
