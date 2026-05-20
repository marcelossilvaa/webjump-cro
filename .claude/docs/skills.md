## Espelho para GitHub Copilot

O mesmo contexto de regras para o **GitHub Copilot** está em:

- `/.github/copilot-instructions.md` — instruções do repositório
- `/.github/instructions/cro-javascript.instructions.md` — reforço para `**/*.js`
- `/.github/README.md` — como isso se relaciona com `/.cursor/`
- `/.github/rules/*.md` — cópia espelhada de `/.cursor/rules/*.md` (manter idênticos via automação)

Os módulos de regra existem em **dois lugares iguais** (`/.cursor/rules/` e `/.github/rules/`). Cada arquivo tem comentário `<!-- mirror:` / `<!-- source:` para scripts de sync.

## Como usar Skills no nosso fluxo

### O que é um Skill

Um Skill é um “playbook” reutilizável para tarefas recorrentes (ex: padronizar scripts CRO, criar regras, migrar padrões).
Ele define:

- O objetivo
- O passo a passo recomendado
- Checklists
- Exemplos

### Quando faz sentido usar

- Padronizações recorrentes (ex: sempre encapsular IIFE + CSS dentro do JS + anti-loop de observer)
- Refactors repetitivos (ex: remover template literals, trocar `var` por `let/const`)
- Criação de novos testes/variantes com o mesmo esqueleto
- Rotinas de tracking (ex: labels, eVars, listener guard)

### Como “chamar” um Skill na prática

No chat, peça explicitamente algo como:

- “Use o Skill X para fazer Y”
- “Crie um Skill para o nosso padrão de script Azul”
- “Atualize o Skill X com as regras da `/.cursor/regras.md`”

O assistente lê o arquivo do Skill e segue as instruções dele.

### Skill criado no repositório

- `/.cursor/skills/cro-script-padronizacao/SKILL.md` — padronização de scripts CRO (IIFE, CSS, observers, tracking).

No chat, use por exemplo: *“Aplica o skill cro-script-padronizacao neste arquivo”* ou *“Refatora seguindo cro-script-padronizacao”*.

### Outras sugestões (ainda não criadas)

1) **Skill: `cro-tracking-adobe`**
- Objetivo: garantir tracking consistente (view + click + api result).
- Conteúdo: função padrão, nomenclatura, eVar82/eVar84, guard `data-analytics-added`.

2) **Skill: `cro-unificar-variantes`**
- Objetivo: compilar múltiplas variantes em um único script sem conflitos.
- Conteúdo: merge de observers, merge de CSS IDs, guards, checagem de page target.

### Como manter Skills úteis (boas práticas)

- Manter Skills curtos e “copiáveis”
- Ter checklists objetivos
- Ter exemplos de antes/depois
- Incluir anti-loop e guards como padrão

