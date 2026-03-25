(function () {
    "use strict";
    const configKits = [
      //Original
      {
        sku: "161424",
        precoAntigo: "R$894,00",
        precoNovo: "R$536,40",
        precoPorCapsula: "*Cada cápsula por R$2,68",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161425",
        precoAntigo: "R$884,00",
        precoNovo: "R$530,40",
        precoPorCapsula: "*Cada cápsula por R$2,65",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161426",
      precoAntigo: "R$884,00",
        precoNovo: "R$530,40",
        precoPorCapsula: "*Cada cápsula por R$2,65",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161427",
       precoAntigo: "R$874,00",
        precoNovo: "R$524,40",
        precoPorCapsula: "*Cada cápsula por R$2,62",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161508",
        precoAntigo: "R$799,00",
        precoNovo: "R$479,40",
        precoPorCapsula: "*Cada cápsula por R$2,40",
        tagMelhorDoAno: "Melhor preço do ano"
      },
       {
        sku: "161517",
        precoAntigo: "R$804,00",
        precoNovo: "R$482,40",
        precoPorCapsula: "*Cada cápsula por R$2,41",
        tagMelhorDoAno: "Melhor preço do ano"
      },
     
      {
        sku: "161503",
       precoAntigo: "R$804,00",
        precoNovo: "R$482,40",
        precoPorCapsula: "*Cada cápsula por R$2,41",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      //Vertuo
      {
        sku: "161429",
        precoAntigo: "R$1063,00",
        precoNovo: "R$637,80",
        precoPorCapsula: "*Cada cápsula por R$3,19",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161432",
        precoAntigo: "R$1053,00",
        precoNovo: "R$631,80",
        precoPorCapsula: "*Cada cápsula por R$3,16",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161433",
        precoAntigo: "R$1053,00",
        precoNovo: "R$631,80",
        precoPorCapsula: "*Cada cápsula por R$3,16",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161434",
        precoAntigo: "R$1043,00",
        precoNovo: "R$625,80",
        precoPorCapsula: "*Cada cápsula por R$3,13",
        tagMelhorDoAno: "Melhor preço do ano"
      },
        {
        sku: "161514",
        precoAntigo: "R$968,00",
        precoNovo: "R$580,80",
        precoPorCapsula: "*Cada cápsula por R$2,90",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      
       {
        sku: "161520",
        precoAntigo: "R$973,00",
        precoNovo: "R$583,80",
        precoPorCapsula: "*Cada cápsula por R$2,92",
        tagMelhorDoAno: "Melhor preço do ano"
      },
      {
        sku: "161504",
        precoAntigo: "R$973,00",
        precoNovo: "R$583,80",
        precoPorCapsula: "*Cada cápsula por R$2,91",
        tagMelhorDoAno: "Melhor preço do ano"
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
  
        // Preço por cápsula (azul/teal, menor)
        const precoPorCapsula = document.createElement("div");
        precoPorCapsula.textContent = precos.precoPorCapsula;
        precoPorCapsula.style.cssText =
          "color: #2c5f7c;font-size: 14px;font-weight: 400;";
  
          //tag melhor do ano
        const tagMelhorDoAno = document.createElement("div");
        tagMelhorDoAno.textContent = precos.tagMelhorDoAno;
        tagMelhorDoAno.style.cssText =
          "color: #2c5f7c;font-size: 14px;font-weight: 400;";
  
        containerPreco.appendChild(precoOriginal);
        containerPreco.appendChild(precoNovo);
        containerPreco.appendChild(precoPorCapsula);
        containerPreco.appendChild(tagMelhorDoAno);
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
            precoPorCapsula: kit.config.precoPorCapsula,
            tagMelhorDoAno: kit.config.tagMelhorDoAno,
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