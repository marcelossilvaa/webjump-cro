(function () {
  "use strict";
  let css = `<style>
    .containerRecomendacoesBusca, .containerRecomendacoesBusca *{
      font-family: NespressoLucas, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;
    }
  
    cv-search-bar:not(:has(div[role='dialog'][class*='dropdown'])) .containerRecomendacoesBusca.ativo{
        display:flex;
  }
    .containerRecomendacoesBusca{
        display:none;
        --row-height: 45px;
        --row-gap: 2px;
        background: #fff;
        border: 1px solid #e5e8e8;
        border-radius: 3px;
        box-sizing: content-box;
        height: calc(var(--row-height)* 6 + var(--row-gap)* 5);
        overflow: hidden;
        position: absolute;
        top: calc(100% + 1px);
        width: 200%;
      }
      .sugestoesRecomendacao{
        background: #f6f7f9;
        border-right: 1px solid #e5e8e8;
        display: grid;
        grid-template-rows: repeat(6, var(--row-height));
        overflow: hidden;
        row-gap: var(--row-gap);
        width: 50%;
      }
      .sugestoesRecomendacao:after{
        background: #fff;
        content: "";
        grid-row: span 6;
      }
      .sugestoesResultadosImagens{
        background: #f6f7f9;
        color: #17171a;
        display: grid;
        grid-template-rows: repeat(3, calc(var(--row-height)* 2 + var(--row-gap)));
        overflow: hidden;
        position: relative;
        row-gap: var(--row-gap);
        width: 50%;
      }
      .linhaSugestao{
        align-items: center;
        background: #fff;
        color: #17171a;
        display: flex;
        font-size: 16px;
        gap: 1rem;
        height: 100%;
        padding: 0 2rem;
        width: 100%;
      }
      </style>`;
  document.head.insertAdjacentHTML("beforeend", css);

  let sugestoesRecomendacoes = [
    {
      href: "https://www.nespresso.com/br/pt/busca?q=Pixie+Redesign+Dark+Blue+110v&tab=Products&p=1",
      texto: "Pixie Redesign Dark Blue 110v",
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=Vertuo+Pop+Red+110V&tab=Products&p=1",
      texto: "Vertuo Pop Red 110V",
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=BSO+50+Caps+Variedades+2020&tab=Products&p=1",
      texto: "BSO 50 Caps Variedades 2020",
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=Travel+Mug+S+Terracotta&tab=Products&p=1",
      texto: "Travel Mug S Terracotta",
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=CitiZ+Platinum+Titan+C140+110v&tab=Products&p=1",
      texto: "CitiZ Platinum Titan C140 110v",
    },
  ];
  let svgLupa = `<svg viewBox="0 0 16 16" stroke="white" stroke-width="1.2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="_icon_1v3wd_216"><path d="m6.4 0c3.5 0 6.4 2.9 6.4 6.4 0 1.4-.4 2.7-1.2 3.7l4 4c.4.4.4 1 .1 1.5l-.1.1c-.2.2-.5.3-.8.3s-.6-.1-.8-.3l-4-4c-1 .7-2.3 1.2-3.7 1.2-3.4-.1-6.3-3-6.3-6.5s2.9-6.4 6.4-6.4zm0 2.1c-2.3 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3z"></path></svg>`;

  let recomendacoesHTML = `<div role="dialog" class="containerRecomendacoesBusca ativo">
    <div role="listbox" class="sugestoesRecomendacao">
    </div>
    <div class="sugestoesResultadosImagens">
    </div>
  </div>`;

  let containerBusca = document.querySelector("cv-search-bar");

  let inputBusca = document.querySelector(
    "cv-search-bar input[class*='searchbox']"
  );
  let dropDownRecomendacoes = document.querySelector(
    "cv-search-bar div[class*='dropdown']"
  );

  let buscaContainerBusca = setInterval(function () {
    if (containerBusca) {
      clearInterval(buscaContainerBusca);
      inputBusca = document.querySelector(
        "cv-search-bar input[class*='searchbox']"
      );
      if (!inputBusca) {
        alert("achei a barra de busca mas não o input");
        let botaoAtivarBusca = document.querySelector(
          "cv-search-bar #search-bar-button"
        );
        if (botaoAtivarBusca) {
          botaoAtivarBusca.addEventListener("click", function () {
            inputBusca = document.querySelector(
              "cv-search-bar input[class*='searchbox']"
            );
            if (inputBusca) {
              setTimeout(ativarSugestoesBusca, 500);
            }
          });
        }
      }
    }
    containerBusca = document.querySelector("cv-search-bar");
  }, 1000);

  function ativarSugestoesBusca() {
    let containerAppendRecomendacoes = containerBusca.querySelector(
      "div[class*='container']"
    );
    if (containerAppendRecomendacoes) {
      containerAppendRecomendacoes.insertAdjacentHTML(
        "beforeend",
        recomendacoesHTML
      );
      let containerSugestoes = containerBusca.querySelector(
        ".sugestoesRecomendacao"
      );
      sugestoesRecomendacoes.forEach(function (sugestao) {
        let sugestaoHTML =
          "<a class='linhaSugestao' href='" +
          sugestao.href +
          "'>" +
          svgLupa +
          "<span>" +
          sugestao.texto +
          "</span></a>";
        containerSugestoes.insertAdjacentHTML("beforeend", sugestaoHTML);
      });
    }
  }
})();
