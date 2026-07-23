# 333 — Guia de scripts CRO para Insider

Regras práticas para criar, minificar e colar JS no **Insider** (campanhas / A/B / variation JS).  
Complementa a padronização geral do repo (`.context/skills/cro-script-padronizacao`), com foco no que o **validador do Insider** aceita ou rejeita.

---

## 1. Limite de caracteres

| Item | Valor |
|------|--------|
| Limite do campo **Edit JS** | **65.535** caracteres |
| Contagem | O Insider costuma contar com quebras de linha (em Windows pode aparecer um pouco acima do `length` do arquivo só com LF) |
| Recomendação | Manter o `.min.js` com folga (ex.: abaixo de 60k) para caber `dataLayer` + IIFE |

Se passar do limite: reduzir CSS duplicado, encurtar strings, extrair assets para URL, ou dividir lógica entre variations (evitar se possível).

---

## 2. Dois arquivos: fonte x Insider

| Arquivo | Uso |
|---------|-----|
| `*.js` (fonte) | Desenvolvimento no repo — pode usar `let`/`const`, IIFE clara, comentarios |
| `*.min.js` | **Unico** que deve ir no campo JS do Insider |

**Fluxo**

1. Editar o `.js` fonte.
2. Gerar o `.min.js` (Babel ES5 + Terser no formato Insider-safe — ver secao 5).
3. Validar JSHint / parse ES5.
4. No Insider: apagar o campo inteiro → colar o `.min.js` → salvar.

Nunca colar o fonte com `let`/`const` direto no Insider.

---

## 3. O que o Insider rejeita (sintaxe / JSHint)

O modal **Edit JS** usa um validador fraco (estilo **JSHint**). Ele mostra *"Syntax error encountered in code"* mesmo quando o Chrome aceita o codigo.

### Erros que ja quebraram pasta neste projeto

| Codigo | Problema | Como evitar |
|--------|----------|-------------|
| **W014** | Linha comecando com `,` ou `+` ("Misleading line break…") | **Nunca** quebrar linha *antes* de `,` ou `+`. Se precisar quebrar concatenacao, deixe o `+` no **fim** da linha anterior, ou use `_c.push(...)` por regra CSS (uma por linha) |
| **W002** | `catch (t)` sombreando parametro `t` da funcao (IE8) | Usar `catch (_wjErr)` e reservar o nome no mangle, ou pos-processar `catch(...)` → `catch(_wjErr)` |
| — | `const` / `let` | Colar so ES5 (`var`) |
| — | Arrow `=>`, template literals, optional chaining | Nao usar no minificado Insider |
| — | `try { } finally { }` sem `catch` | Preferir sem `finally`, ou `try/catch` + limpeza no fim |
| — | IIFE unida ao `dataLayer` com virgula (`}),(function…`) | Manter **statements separados**: `dataLayer.push({...});` depois `!(function(){...})();` |

### Formato de IIFE que funciona

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "insider_ab_test",
  // ...
});

!(function () {
  "use strict";
  // ...
})();
```

Aceitavel tambem: `(function () { ... })();`  
Evitar formatos que o minifier una com virgula ao push anterior.

---

## 4. Checklist antes de colar no Insider

- [ ] Caracteres ≤ **65.535**
- [ ] Sem `const` / `let` / `=>` / backticks no arquivo colado
- [ ] Nenhuma linha comeca com `,` ou `+`
- [ ] Nenhum `catch (t)` (ou outro nome que colida com parametro da funcao)
- [ ] `dataLayer` e IIFE em statements separados
- [ ] JSHint: **0** erros relevantes (W014 / W002)
- [ ] Parse OK (`new Function(codigo)` ou Esprima)
- [ ] Campo do Insider limpo antes de colar (sem resto de versao antiga)

---

## 5. Minificacao recomendada (Insider-safe)

Pipeline que tem funcionado neste repo:

1. **Babel** `@babel/preset-env` com target IE11 → ES5
2. **Terser** com:
   - `compress.sequences: false`, `join_vars: false` (evita juntar statements)
   - `format.beautify: true`, `semicolons: true`, `ascii_only: true`
   - `wrap_iife: true` → saida `!(function(){...})();`
3. **CSS**: expandir `return [ regra1, regra2, ... ].join("\n")` em varios `_c.push(regra);` (evita linha monstro e W014)
4. **catch**: forcar `catch(_wjErr)` pos-mangle
5. Conferir: sem linhas com leading `,`/`+`; JSHint limpo; chars abaixo de 65535

---

## 6. Regras de codigo (fonte + runtime)

Alinhado a padronizacao Webjump, com cuidado Magento/Insider:

### Estrutura

- IIFE `(function () { 'use strict'; ... })();`
- Constantes / timers / caches no topo
- CSS injetado via `<style id="...">` + `textContent` (sem backticks)
- `data-*` para nos ja processados / listeners ja ligados
- `MutationObserver` com debounce + `isProcessing` + filtrar nos do proprio script
- Init com `document.readyState` / `DOMContentLoaded` + retry com limite

### DOM Magento (cuidados reais deste cliente)

| Situacao | Regra |
|----------|--------|
| Knockout / frete | Nao remover filhos de um no com `data-bind="scope: '...'". Preferir mover o **wrapper inteiro** ou so CSS/`order` |
| Timing Insider | Esperar UI pronta (ex.: `.shipping-method`) antes de mover frete; retry curto se necessario |
| Validacao qty | O **input** tambem recebe classe `.mage-error`. Ao mover aviso, selecionar so `div.mage-error`, nunca `.mage-error` generico |
| Observer + input | Nao fazer `insertBefore` no input enquanto o usuario digita; mover so o que precisa (ex.: div de erro) |

### Tracking

- Manter bloco `insider_ab_test` no `dataLayer` no topo do arquivo colado (ids reais da variation)
- Eventos de UI: padrao `local_event` / categoria do teste, sem duplicar listeners (`data-*-tracking-added`)

---

## 7. Pasta `333` — organizacao sugerida

```
333/
  guia-insider.md            ← este arquivo
  RemodelagemPDP/
    remodelagemPDPV2.js      ← fonte
    remodelagemPDPV2.min.js  ← Insider
  BotaoFlutuante/
    ...
```

- Uma atividade = uma pasta
- Fonte + min lado a lado
- Nao rodar duas variations que injetam o mesmo FAB / mesmo observer

---

## 8. Troubleshooting rapido

| Sintoma no Insider | Causa provavel | Acao |
|--------------------|----------------|------|
| "Syntax error… check lines" + linha vermelha em `,` ou `+` | W014 | Regenerar min sem quebra antes de `,`/`+`; preferir `_c.push` |
| Mesmo toast + `catch (t)` | W002 | `catch(_wjErr)` |
| Contador acima de 65.535 | Arquivo grande demais | Cortar CSS / logica |
| Colou e salvou, mas UI some / KO quebra | Timing ou move de scope | Aguardar DOM; mover wrapper com scope |
| Qty some / vira texto vermelho | Moveu `input.mage-error` | Mover so `div.mage-error` |
| Funciona no console, falha no Insider | Validador != browser | Seguir secoes 3–5; nao colar o fonte |

---

## 9. Referencias no repositorio

- Padronizacao geral CRO: `.context/skills/cro-script-padronizacao/SKILL.md`
- Regras por tema: `.context/rules/`
- Exemplo recente Insider-safe: `333/RemodelagemPDP/remodelagemPDPV2.min.js`
