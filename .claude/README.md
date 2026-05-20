# `.claude` — Instruções para o Claude Code

Esta pasta configura o comportamento do **Claude Code** neste repositório.

## Estrutura

| Arquivo / Pasta | Função |
|-----------------|--------|
| `regras.md` | Índice das regras modulares |
| `rules/*.md` | Regras por tema (carregadas automaticamente pelo Claude Code) |
| `instructions/*.md` | Contexto adicional por cliente/tipo de arquivo |
| `copilot-instructions.md` | Resumo das regras (também carregado pelo Claude Code) |
| `settings.json` | Permissões, hooks e variáveis de ambiente do Claude Code |

## Como o Claude Code carrega estas instruções

O Claude Code lê todos os arquivos `.md` dentro de `.claude/` como instruções de projeto. Não é necessário importar ou referenciar manualmente — todos os arquivos desta pasta são aplicados automaticamente.

## Manutenção

Editar os arquivos em `.claude/rules/` é a fonte da verdade para este repositório. O arquivo `regras.md` serve como índice para localização rápida.
