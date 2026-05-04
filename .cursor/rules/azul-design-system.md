<!-- mirror: .github/rules/azul-design-system.md -->

## Azul — guia visual (pasta `Azul/`)

Válido **apenas** para scripts e experimentos sob **`Azul/`**. Não aplicar a outros clientes do repositório.

### Tipografia

- Padrão: `font-family: "Helvetica Neue", Arial, sans-serif;`

### Texto e fundo

- **Texto em fundo branco ou áreas claras**: `color: rgb(1, 78, 132);` (títulos e corpo; usar `rgba(1, 78, 132, …)` quando precisar de hierarquia).
- **Sobre o gradiente azul** (ver abaixo): manter texto **branco** (`#fff` ou `rgba(255, 255, 255, 0.85)` para texto secundário).

### Gradiente (somente região superior)

- Usar o gradiente **apenas no topo** do componente (ex.: header de modal/drawer), não em toda a altura do painel.
- Valor: `linear-gradient(63deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%)`.
- **Parte inferior / corpo**: fundo **branco** `rgb(255, 255, 255)`.

### Botão outline (padrão Azul)

```css
display: flex;
width: 100%;
height: 48px;
-webkit-box-align: center;
align-items: center;
gap: 8px;
-webkit-box-pack: center;
justify-content: center;
border-radius: 8px;
border: 1px solid rgb(2, 108, 182);
background: rgb(255, 255, 255);
cursor: pointer;
color: rgb(2, 108, 182);
```

- Hover sugerido: `background: rgba(2, 108, 182, 0.08);` mantendo `border-color: rgb(2, 108, 182);`.

### Referência no repositório

- Exemplo com CSS injetado: `Azul/MARCELO/2026/cross-sell-minhas-viagens/crossSell-minhasViagens.js`.
