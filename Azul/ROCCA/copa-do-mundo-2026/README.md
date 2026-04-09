# Animacao Aviao Azul - Copa do Mundo 2026

## Descricao

Animacao promocional da Azul Linhas Aereas para a Copa do Mundo 2026. Widget compacto com globo terrestre e aviao comercial voando do Brasil para os EUA.

## Elementos da Animacao

- **Widget compacto**: Card 320px no canto inferior esquerdo (nao sobrepoe a pagina)
- **Globo terrestre**: SVG com oceano azul, continentes verdes e linhas de latitude/longitude
- **Fundo espacial**: Escuro com estrelas
- **Pontos marcados**: Origem (Brasil - verde) e Destino (EUA - azul) no globo
- **Rota em arco**: Linha tracejada dourada conectando Brasil-EUA
- **Aviao comercial**: Icone SVG de aviao (vista de cima) com fuselagem, asas, cauda e motores
- **Animacao**: Aviao segue a rota curvada sobre o globo (offset-path)
- **Faixa promocional**: "Azul te leva para assistir a Selecao na Copa do Mundo 2026!"
- **CTA**: Botao verde "GARANTA SUA PASSAGEM"

## Arquivos

- `animacao-aviao-selecao.js` - Script principal da animacao
- `demo.html` - Pagina de demonstracao

## Como Usar

### Teste Local
Abra o arquivo `demo.html` no navegador.

### Integracao no Target
Copie o conteudo de `animacao-aviao-selecao.js` para o Adobe Target.

## Tracking

O script inclui tracking Adobe Analytics com:
- **eVar82**: Label do evento (ex: `AT_CopaDoMundo2026_click CTA_GarantaPassagem`)
- **eVar84**: Contexto da pagina (`AT_copa_do_mundo_2026`)
- **event90**: Evento de acao

## Personalizacao

### Alterar Duracao da Animacao
No objeto `CONFIG`, ajuste `animationDuration` (em milissegundos).

### Alterar Mensagem da Faixa
Localize `.azul-copa-faixa-texto` no HTML gerado.

### Alterar CTA
Localize a funcao `criarAnimacao()` e modifique o texto ou comportamento do botao.

## Responsividade

A animacao e responsiva e se adapta a telas menores (breakpoint: 768px).

## Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Sem dependencias externas
- JavaScript ES5 (sem template literals)

---

**Cliente**: Azul Linhas Aereas  
**Campanha**: Copa do Mundo 2026  
**Criado em**: Abril 2026
