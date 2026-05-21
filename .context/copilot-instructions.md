# Webjump CRO — Instruções de Repositório

Resumo para **GitHub Copilot**, **Cursor** e **Claude Code**. Detalhes e exemplos nos módulos em **`.context/rules/`**.

## Fonte da verdade

| O quê | Onde |
|-------|------|
| Índice das regras | `.context/regras.md` |
| Regras por tema | `.context/rules/` (`00-index`, `01-` … `99-`) |
| Instruções por cliente | `.context/instructions/` |
| Guia de Skills | `.context/docs/skills.md` |
| Skill de padronização | `.context/skills/cro-script-padronizacao/SKILL.md` |

**Ao gerar ou refatorar código**, siga os módulos em `.context/rules/`. Se algo conflitar com este resumo, prevalece o módulo em `rules/`.

## Cliente Azul (`Azul/`)

Para scripts sob **`Azul/`**, use também **`.context/rules/azul-design-system.md`**: tipografia `"Helvetica Neue", Arial`, texto escuro `rgb(1, 78, 132)` em fundo branco, texto branco sobre gradiente azul do header, botão outline conforme o módulo.

## Cliente Nespresso (`Nespresso/`)

Para scripts Nespresso, siga **`.context/instructions/nespresso.md`**:

- **Não** incluir push `adobe_target` nos scripts de funcionalidade (aplicado separadamente via Adobe Target).
- **Obrigatório** incluir `sendGAEvent` com evento `local_event` via `gtmDataObject` para cliques e interações.

## Regras obrigatórias (resumo)

1. **IIFE**: `(function () { 'use strict'; ... })();`
2. **Variáveis**: no topo da IIFE; só `const` / `let` — **nunca** `var`
3. **Strings**: **sem** template literals (backticks); concatenação com `+`
4. **Comentários e logs**: português; **sem emojis**
5. **DOM**: preferir texto/atributos a classes `css-xxxxx` frágeis; checar nós antes de usar
6. **Estilos**: `element.style.setProperty('prop', 'val', 'important')` quando precisar vencer CSS herdado
7. **Idempotência**: `data-*` para evitar duplicação (ex.: `data-styled-applied`, `data-analytics-added`)
8. **MutationObserver**: flag `isProcessing` + debounce; ignorar mutations do próprio script
9. **Init**: `document.readyState` + `DOMContentLoaded`; retry/polling com **limite**
10. **Tracking**: ver `.context/rules/06-tracking.md` (Adobe para Azul; `local_event` para Nespresso)

## Tracking Azul (modelo curto)

```javascript
(function () {
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    const labelEvent = 'AT_NomeAtividade_' + eventType + ' ' + eventLabel;
    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_contexto_pagina';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }
})();
```

## Checklist rápido

- [ ] IIFE + variáveis no topo
- [ ] Sem backticks, sem `var`, sem emojis
- [ ] `data-*` onde evita duplicação
- [ ] Observer com debounce / anti-loop
- [ ] DOM ready + retry/polling limitado se necessário
- [ ] Tracking se houver componente visual novo

## Instruções por caminho

- `.context/instructions/cro-javascript.instructions.md` — reforço para `**/*.js`

---

**Última atualização:** 2026-05-21
