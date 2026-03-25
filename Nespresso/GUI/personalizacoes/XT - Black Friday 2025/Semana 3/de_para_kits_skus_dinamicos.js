(function () {
  "use strict";
  const configKits = [
    //Original
    {
      sku: "161615",
      precoAntigo: "R$1446,00",
      precoNovo: "R$1080,00",
    },
    {
      sku: "161503",
      precoAntigo: "R$804,00",
      precoNovo: "R$482,40",
    },
    {
      sku: "161505",
      precoAntigo: "R$824,00",
      precoNovo: "R$494,40",
    },
    //Vertuo
    {
      sku: "161616",
      precoAntigo: "R$829,00",
      precoNovo: "R$621,75",
    },
    {
      sku: "161504",
      precoAntigo: "R$973,00",
      precoNovo: "R$583,80",
    },
    {
      sku: "161506",
      precoAntigo: "R$993,00",
      precoNovo: "R$595,80",
    },
  ];

  let tentativas = 0;
  const maxTentativas = 50; // Número máximo de tentativas
  const intervalo = 100; // Intervalo em milissegundos (100ms = 5 segundos total)

  // Função para atualizar o preço de um componente
  function atualizarPreco(componente, precos) {
    // Remove o elemento de preço antigo
    const precoAntigo = componente.querySelector(".dp-CPD__caps-item-price");
    if (precoAntigo) {
      precoAntigo.remove();
    }

    // Busca o elemento bottom onde vamos inserir o novo preço
    const bottomElement = componente.querySelector(".dp-CPD__caps-item-bottom");
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

  // Rastreia quais SKUs já foram atualizados para evitar atualizações duplicadas
  const skusAtualizados = new Set();

  const buscarComponentes = setInterval(function () {
    tentativas++;

    // Busca todos os kits configurados
    const kitsEncontrados = configKits
      .map((kitConfig) => {
        const elemento = document.querySelector(
          `.dp-CPD__caps-item:has(div[data-product-id="${kitConfig.sku}"])`
        );
        return {
          elemento: elemento,
          config: kitConfig,
        };
      })
      .filter(
        (kit) => kit.elemento !== null && !skusAtualizados.has(kit.config.sku)
      ); // Filtra apenas os encontrados e não atualizados

    // Se encontrou algum kit novo, atualiza
    if (kitsEncontrados.length > 0) {
      kitsEncontrados.forEach((kit) => {
        atualizarPreco(kit.elemento, {
          precoAntigo: kit.config.precoAntigo,
          precoNovo: kit.config.precoNovo,
        });
        skusAtualizados.add(kit.config.sku); // Marca como atualizado
      });
    }

    // Para o intervalo se todos os SKUs configurados foram encontrados e atualizados
    // ou se excedeu o limite de tentativas
    if (
      skusAtualizados.size === configKits.length ||
      tentativas >= maxTentativas
    ) {
      clearInterval(buscarComponentes);
    }
  }, intervalo);
})();
