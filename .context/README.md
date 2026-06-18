# `.context` — fonte canônica do repositório

Todo o contexto compartilhado entre **Cursor**, **GitHub Copilot** e **Claude Code** vive aqui. **Edite somente esta pasta.**

## Estrutura

| Caminho | Conteúdo |
|---------|----------|
| `regras.md` | Índice geral |
| `copilot-instructions.md` | Resumo para agentes / Copilot |
| `rules/*.md` | Regras modulares por tema |
| `instructions/*.md` | Instruções por cliente ou tipo de arquivo |
| `docs/skills.md` | Guia de Skills |
| `skills/*/SKILL.md` | Playbooks reutilizáveis |

## Ponteiros nas ferramentas (não duplicar conteúdo)

| Ferramenta | O que permanece | Função |
|------------|-----------------|--------|
| **Cursor** | `.cursor/regras.md`, `.cursor/rules/00-context.md`, skill ponteiro | Entrada exigida pelo Cursor |
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/instructions/` | Entrada exigida pelo Copilot |
| **Claude Code** | `.claude/regras.md`, `.claude/copilot-instructions.md`, skill ponteiro | Entrada exigida pelo Claude |

Nenhuma dessas pastas contém cópias das regras — apenas redirecionam para `.context/`.

## Manutenção

1. Altere o arquivo em **`.context/`**.
2. Pronto — não há sync para rodar.

---

**Última atualização:** 2026-05-21
