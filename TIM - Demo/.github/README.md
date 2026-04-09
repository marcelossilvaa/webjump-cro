# `.github` — Copilot e automação

## GitHub Copilot

| Arquivo | Função |
|---------|--------|
| `copilot-instructions.md` | Instruções **do repositório inteiro** para o Copilot (Chat, fluxos que leem este arquivo). |
| `instructions/cro-javascript.instructions.md` | Instruções **só para `**/*.js`** (`applyTo` no frontmatter). |

Documentação oficial: [Adding repository custom instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot).

## Espelho com Cursor

As regras modulares existem em **dois lugares idênticos** (sincronizar via automação):

| Local | Conteúdo |
|-------|----------|
| `.cursor/rules/*.md` | Regras por tema (Cursor) |
| `.github/rules/*.md` | Cópia espelhada (Copilot / leitura no GitHub) |

Índices: `.cursor/regras.md` e `.github/regras.md`.

Outros em **`.cursor/`** apenas:

- `.cursor/docs/skills.md` — uso de Skills
- `.cursor/skills/*/SKILL.md` — playbooks (ex.: `cro-script-padronizacao`)

**Manutenção:** editar um lado das regras e rodar o sync para o outro (ou atualizar os dois até a automação existir). O resumo em `copilot-instructions.md` pode ser ajustado à parte se necessário.

## Agent / outros

Opcionalmente o time pode usar `AGENTS.md` na raiz (agentes de IA). Este repo prioriza `.cursor/` + `.github/copilot-instructions.md`.
