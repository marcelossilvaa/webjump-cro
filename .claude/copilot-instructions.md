# Webjump CRO — Instruções de Repositório

Este arquivo resume as regras obrigatórias. Os detalhes e exemplos estão nos módulos em `.claude/rules/`.

## O que é este repositório

- Scripts de **CRO** (A/B e personalização) em **JavaScript** injetado em vitrines/e-commerces.
- Pastas por cliente (ex.: `Azul/`, `Nestle/`). Não há build único obrigatório: valide no browser e pelo padrão do projeto.

## Fonte da verdade

| O quê | Onde |
|-------|------|
| Índice das regras | `.claude/regras.md` |
| Regras por tema | `.claude/rules/` (arquivos `00-index`, `01-` ... `99-`) |
| Instruções por cliente | `.claude/instructions/` |

**Ao gerar ou refatorar código**, siga os módulos em `.claude/rules/`. Se algo conflitar com este resumo, prevalece o módulo em `rules/`.

## Cliente Azul (`Azul/`)

Para qualquer script sob **`Azul/`**, além das regras gerais, use o guia visual em **`.claude/rules/azul-design-system.md`**: tipografia `"Helvetica Neue", Arial`, texto escuro `rgb(1, 78, 132)` em fundo branco, texto branco sobre o gradiente azul do header, gradiente só na parte superior e botão outline conforme o módulo.

## Regras obrigatórias (resumo)

1. **IIFE**: encapsular em `(function () { 'use strict'; ... })();`
2. **Variáveis**: no topo da IIFE; só `const` / `let` — **nunca** `var`
3. **Strings**: **sem** template literals (backticks); usar concatenação com `+`
4. **Comentários e logs**: português; **sem emojis**
5. **DOM**: preferir texto/conteúdo a classes `css-xxxxx` frágeis; checar nós antes de usar
6. **Estilos**: `element.style.setProperty('prop', 'val', 'important')` quando precisar vencer CSS herdado
7. **Idempotência**: `data-*` para "já estilizado" / "listener já adicionado" (ex.: `data-styled-applied`, `data-hover-listener-added`)
8. **MutationObserver**: flag `isProcessing` + debounce; ignorar mutations causadas pelo próprio script quando necessário
9. **Init**: `document.readyState` + `DOMContentLoaded`; retry ou polling com **limite** de tentativas
10. **Tracking (Adobe)**: ao criar/alterar UI, ver `.claude/rules/06-tracking.md` — eVar82/eVar84, evitar listeners duplicados (`data-analytics-added`)

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

## Instruções por tipo de arquivo

Para padrões específicos de arquivos `.js`:

- `.claude/instructions/cro-javascript.instructions.md`

---

**Última atualização**: 2026-05-20
