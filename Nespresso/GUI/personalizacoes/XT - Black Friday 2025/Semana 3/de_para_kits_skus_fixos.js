(function () {
  "use strict";

  let tentativas = 0;
  const maxTentativas = 50; // Número máximo de tentativas
  const intervalo = 100; // Intervalo em milissegundos (100ms = 5 segundos total)

  const buscarComponentes = setInterval(function () {
    tentativas++;

    let kitOriginal = document.querySelector(
      '.dp-CPD__caps-item:has(div[data-product-id="161615"])'
    );
    let kitVertuo = document.querySelector(
      '.dp-CPD__caps-item:has(div[data-product-id="161616"])'
    );

    // Se ambos os componentes foram encontrados
    if (kitOriginal && kitVertuo) {
      clearInterval(buscarComponentes);

      // Configuração de preços para cada kit
      const precosKits = {
        original: {
          precoAntigo: "R$1446,00",
          precoNovo: "R$1080,00",
        },
        vertuo: {
          precoAntigo: "R$829,00",
          precoNovo: "R$621,75",
        },
      };

      // Função para atualizar o preço de um componente
      function atualizarPreco(componente, precos) {
        // Remove o elemento de preço antigo
        const precoAntigo = componente.querySelector(
          ".dp-CPD__caps-item-price"
        );
        if (precoAntigo) {
          precoAntigo.remove();
        }

        // Busca o elemento bottom onde vamos inserir o novo preço
        const bottomElement = componente.querySelector(
          ".dp-CPD__caps-item-bottom"
        );
        if (bottomElement) {
          // Remove qualquer estrutura de preço existente dentro do bottom
          const precoExistente = bottomElement.querySelector(
            ".dp-CPD__caps-item-price"
          );
          if (precoExistente) {
            precoExistente.remove();
          }

          // Cria a nova estrutura de preço
          const containerPreco = document.createElement("div");
          containerPreco.style.cssText =
            "display: flex;flex-direction: column;align-items: center;margin-bottom: 12px;gap: 4px;";

          // Preço original (riscado, vermelho)
          const precoOriginal = document.createElement("div");
          precoOriginal.textContent = precos.precoAntigo;
          precoOriginal.style.cssText =
            "color: #e02525;text-decoration: line-through;font-size: 16px;font-weight: 700;";

          // Preço novo (verde)
          const precoNovo = document.createElement("div");
          precoNovo.textContent = precos.precoNovo;
          precoNovo.style.cssText =
            "color: #257a57;font-size: 18px;font-weight: 700;letter-spacing: 0.0625rem;";

          containerPreco.appendChild(precoOriginal);
          containerPreco.appendChild(precoNovo);
          bottomElement.insertAdjacentElement("afterbegin", containerPreco);
        }
      }

      // Atualiza o preço para ambos os componentes com seus respectivos preços
      atualizarPreco(kitOriginal, precosKits.original);
      atualizarPreco(kitVertuo, precosKits.vertuo);
    } else if (tentativas >= maxTentativas) {
      // Se excedeu o limite de tentativas, para o intervalo
      clearInterval(buscarComponentes);
    }
  }, intervalo);
})();
