// Ícone SVG do carrinho de compras
const cartIcon = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.1 16.4H17M17 13V17A2 2 0 0 1 15 19H9A2 2 0 0 1 7 17V13M9 19V21M15 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// Função para adicionar ícone aos botões
function addCartIconToButtons() {
  // Seleciona todos os botões com a classe .add-product-to-cart
  const buttons = document.querySelectorAll("button.add-product-to-cart");

  // Itera sobre cada botão encontrado
  buttons.forEach((button) => {
    // Verifica se o botão já não tem o ícone para evitar duplicação
    if (!button.querySelector("svg")) {
      // Cria um elemento temporário para converter a string SVG
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = cartIcon;
      const svgElement = tempDiv.firstElementChild;

      // Adiciona o ícone no início do botão
      button.insertBefore(svgElement, button.firstChild);

      // Adiciona um pequeno espaço entre o ícone e o texto (opcional)
      if (button.textContent.trim()) {
        button.insertBefore(
          document.createTextNode(" "),
          svgElement.nextSibling
        );
      }
    }
  });

  console.log(`Ícone de carrinho adicionado a ${buttons.length} botões`);
}

// Executa a função quando o DOM estiver carregado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addCartIconToButtons);
} else {
  // DOM já carregou, executa imediatamente
  addCartIconToButtons();
}

// Opcional: Função para remover os ícones (útil para testes)
function removeCartIconFromButtons() {
  const buttons = document.querySelectorAll(".add-product-to-cart");
  buttons.forEach((button) => {
    const svg = button.querySelector("svg");
    if (svg) {
      svg.remove();
      // Remove o espaço em branco extra se existir
      if (button.firstChild && button.firstChild.nodeType === Node.TEXT_NODE) {
        button.firstChild.remove();
      }
    }
  });
}
