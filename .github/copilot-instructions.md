# GitHub Copilot — Webjump CRO

Instruções de repositório para o **GitHub Copilot** (Chat, PR, coding agent quando aplicável). As regras modulares estão duplicadas em **`.cursor/rules/`** e **`.github/rules/`** (manter idênticas via automação). Este arquivo resume o obrigatório; detalhes nos módulos `*.md`.

## O que é este repositório

- Scripts de **CRO** (A/B e personalização) em **JavaScript** injetado em vitrines/e-commerces.
- Pastas por cliente (ex.: `Azul/`, `Nestle/`). Não há build único obrigatório: valide no browser e pelo padrão do projeto.

## Fonte da verdade (regras duplicadas + Skills só no Cursor)

| O quê | Onde |
|-------|------|
| Índice das regras | `.cursor/regras.md` e `.github/regras.md` |
| Regras por tema | `.cursor/rules/` e `.github/rules/` (mesmos arquivos `00-index`, `01-` … `99-`) |
| Guia de Skills | `.cursor/docs/skills.md` |
| Skill de padronização de script | `.cursor/skills/cro-script-padronizacao/SKILL.md` |

**Ao gerar ou refatorar código**, siga os módulos em `.github/rules/` (ou `.cursor/rules/` — conteúdo igual). Se algo conflitar com este resumo, prevalece o módulo em `rules/`.

## Cliente Azul (`Azul/`)

Para qualquer script sob **`Azul/`**, além das regras gerais, use o guia visual em **`azul-design-system.md`** (espelho em `.cursor/rules/` e `.github/rules/`): tipografia `"Helvetica Neue", Arial`, texto escuro `rgb(1, 78, 132)` em fundo branco, texto branco sobre o gradiente azul do header, gradiente só na parte superior e botão outline conforme o módulo.

## Regras obrigatórias (resumo)

1. **IIFE**: encapsular em `(function () { 'use strict'; ... })();`
2. **Variáveis**: no topo da IIFE; só `const` / `let` — **nunca** `var`
3. **Strings**: **sem** template literals (backticks); usar concatenação com `+`
4. **Comentários e logs**: português; **sem emojis**
5. **DOM**: preferir texto/conteúdo a classes `css-xxxxx` frágeis; checar nós antes de usar
6. **Estilos**: `element.style.setProperty('prop', 'val', 'important')` quando precisar vencer CSS herdado
7. **Idempotência**: `data-*` para “já estilizado” / “listener já adicionado” (ex.: `data-styled-applied`, `data-hover-listener-added`)
8. **MutationObserver**: flag `isProcessing` + debounce; ignorar mutations causadas pelo próprio script quando necessário
9. **Init**: `document.readyState` + `DOMContentLoaded`; retry ou polling com **limite** de tentativas
10. **Tracking (Adobe)**: ao criar/alterar UI, ver `.github/rules/06-tracking.md` (espelho em `.cursor/rules/`) — eVar82/eVar84, evitar listeners duplicados (`data-analytics-added`)

## Tracking (modelo curto)

Use `const` dentro da IIFE ao acessar `s` (não usar `var`).

```javascript
(function () {
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    const labelEvent = 'AT_NomeAtividade_' + eventType + ' ' + eventLabel;
    console.log('[Tracking NomeComponente] Analytics event triggered:', labelEvent);
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

## Checklist rápido antes de considerar pronto

- [ ] IIFE + variáveis no topo
- [ ] Sem backticks, sem `var`, sem emojis
- [ ] `data-*` onde evita duplicação
- [ ] Observer com debounce / anti-loop
- [ ] DOM ready + retry/polling limitado se necessário
- [ ] Tracking se houver componente visual novo

## Instruções por caminho

Para reforço automático em arquivos `.js`, existe também:

- `.github/instructions/cro-javascript.instructions.md` (`applyTo: "**/*.js"`)

---

**Última atualização**: 2026-03-25
