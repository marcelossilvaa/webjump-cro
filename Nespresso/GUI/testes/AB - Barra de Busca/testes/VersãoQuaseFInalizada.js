(function () {
  "use strict";

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

  let isDesktop = window.innerWidth >= 996 ? true : false;
  if (isDesktop) {
    let css = `<style>
      .containerRecomendacoesBusca, .containerRecomendacoesBusca *{
        font-family: NespressoLucas, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;
      }
      cv-search-bar:not(:has(div[role='dialog'][class*='dropdown'])) .containerRecomendacoesBusca.ativo {
        display: flex;
      }
  
      .containerRecomendacoesBusca {
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
  
      .sugestoesRecomendacao {
        background: #f6f7f9;
        border-right: 1px solid #e5e8e8;
        display: grid;
        grid-template-rows: repeat(6, var(--row-height));
        overflow: hidden;
        row-gap: var(--row-gap);
        width: 50%;
      }
  
      .sugestoesRecomendacao:after {
        background: #fff;
        content: "";
        grid-row: span 6;
      }
  
      .sugestoesResultadosImagens {
        background: #f6f7f9;
        color: #17171a;
        display: grid;
        grid-template-rows: repeat(3, calc(var(--row-height)* 2 + var(--row-gap)));
        overflow: hidden;
        position: relative;
        row-gap: var(--row-gap);
        width: 50%;
      }
  
      .linhaSugestao {
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
      .imagemSugestaoResultado{
        align-items: center;
        background: #fff;
        color: #17171a;
        display: flex;
        padding: 0 2rem;
      }
      .colunaResultadosRecomendacao{
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 3px;
      }
      .linhaImagensResultados{
        display: flex;
        padding: 3px;
      }
      .colunaResultadosRecomendacao img{
        height: auto;
        max-width: none;
        width: 48px;
      }
      .colunaResultadosRecomendacao strong
      {
        font-size: 16px;
        font-weight: 700;
      }
      .colunaResultadosRecomendacao .linhaImagensResultados.tecnologia
      {
        color: #6f6f70;
        font-size: 14px;
        font-weight: 500;
      }
     .linhaSugestao:hover,.imagemSugestaoResultado:hover{
        background-color:#F6F7F9;
     }
    </style>`;
    document.head.insertAdjacentHTML("beforeend", css);

    let sugestoesImagens = [
      {
        href: "https://www.nespresso.com/br/pt/order/capsules/original/capsulas-cafe-ispirazione-ristretto-italiano?q=ristretto&search_category=Products&selected_term=ristretto&searchProductResults=32&searchArticlesResults=37&searchFaqResults=1",
        produto: "Ristretto Italiano",
        tecnologia: "Original",
        imagemProduto:
          "https://www.nespresso.com/ecom/medias/sys_master/public/12807617347614/Desktop-Standard-2000x2000.png",
      },
      {
        href: "https://www.nespresso.com/br/pt/order/capsules/vertuo/capsula-cafe-ristretto-classico?q=ristretto&search_category=Products&selected_term=ristretto&searchProductResults=32&searchArticlesResults=37&searchFaqResults=1",
        produto: "Ristretto Clássico",
        tecnologia: "Vertuo",
        imagemProduto:
          "https://www.nespresso.com/ecom/medias/sys_master/public/27750724042782/C-1131-ResponsiveStandard.png",
      },
      {
        href: "https://www.nespresso.com/br/pt/order/capsules/original/capsulas-cafe-ispirazione-ristretto-italiano-decaffeinato?q=ristretto&search_category=Products&selected_term=ristretto&searchProductResults=32&searchArticlesResults=37&searchFaqResults=1",
        produto: "Ristretto Italiano Decaffeinato",
        tecnologia: "Original",
        imagemProduto:
          "https://www.nespresso.com/ecom/medias/sys_master/public/32925718216734/Ristretto-decaf-2000x2000.png",
      },
    ];

    let recomendacoesHTMLDesktop = `<div role="dialog" class="containerRecomendacoesBusca ativo">
      <div role="listbox" class="sugestoesRecomendacao"></div>
      <div class="sugestoesResultadosImagens"></div>
    </div>`;

    let containerBusca = document.querySelector("cv-search-bar");

    let inputBusca;
    let buscaContainerBusca = setInterval(function () {
      if (containerBusca) {
        clearInterval(buscaContainerBusca);
        inputBusca = containerBusca.querySelector("input[class*='searchbox']");
        if (!inputBusca) {
          let botaoAtivarBusca =
            containerBusca.querySelector("#search-bar-button");
          if (botaoAtivarBusca) {
            botaoAtivarBusca.addEventListener("click", function () {
              setTimeout(() => {
                inputBusca = containerBusca.querySelector(
                  "input[class*='searchbox']"
                );
                if (inputBusca) {
                  ativarSugestoesBusca();
                }
              }, 500);
            });
          }
        } else {
          ativarSugestoesBusca();
        }
      }
      containerBusca = document.querySelector("cv-search-bar");
    }, 1000);

    function ativarSugestoesBusca() {
      let containerAppendRecomendacoes = containerBusca.querySelector(
        "div[class*='container']"
      );
      if (
        containerAppendRecomendacoes &&
        !containerAppendRecomendacoes.querySelector(
          ".containerRecomendacoesBusca"
        )
      ) {
        containerAppendRecomendacoes.insertAdjacentHTML(
          "beforeend",
          recomendacoesHTMLDesktop
        );
        let containerSugestoes = containerAppendRecomendacoes.querySelector(
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

        let containerImagensSugestoes =
          containerAppendRecomendacoes.querySelector(
            ".sugestoesResultadosImagens"
          );
        sugestoesImagens.forEach(function (sugestao) {
          let sugestaoHTML =
            "<a class='imagemSugestaoResultado' href='" +
            sugestao.href +
            "'><div class='colunaResultadosRecomendacao'><img alt='" +
            sugestao.produto +
            "' src='" +
            sugestao.imagemProduto +
            "'></div><div class='colunaResultadosRecomendacao'><div class='linhaImagensResultados'><strong>" +
            sugestao.produto +
            "</strong></div><div class='linhaImagensResultados tecnologia'>em " +
            sugestao.tecnologia +
            "</div></div></a>";
          containerImagensSugestoes.insertAdjacentHTML(
            "beforeend",
            sugestaoHTML
          );
        });
        let containerRecomendacoes = containerAppendRecomendacoes.querySelector(
          ".containerRecomendacoesBusca"
        );

        inputBusca.addEventListener("focus", function () {
          containerRecomendacoes.classList.add("ativo");
        });

        containerRecomendacoes.addEventListener("mouseenter", function () {
          containerRecomendacoes.classList.add("ativo");
        });

        document.addEventListener("click", function (event) {
          const isClickInsideInput = inputBusca.contains(event.target);
          const isClickInsideContainer = containerRecomendacoes.contains(
            event.target
          );
          if (!isClickInsideInput && !isClickInsideContainer) {
            containerRecomendacoes.classList.remove("ativo");
          }
        });
      }
    }
  } else {
    let cssMobile = `<style>
        @media only screen and (min-width: 997px){
          .mobileRecomendacoes{
            display:none !important;
          }
        }
        .mobileRecomendacoes{
          display:none;
        }
        cv-search-bar:not(:has(div[role='dialog'][class*='dropdown'])) .mobileRecomendacoes {
         display: flex;
        }
        .mobileRecomendacoes{
          --row-height: 45px;
          --row-gap: 2px;
          background: #fff;
          border: 0;
          border-radius: 3px;
          box-sizing: border-box;
          height: calc(var(--row-height)* 6 + var(--row-gap)* 5);
          overflow: hidden;
          position: unset;
          top: calc(100% + 1px);
          width: 100%;
          
        }
        .recomendacoesMobile{
          background-color: #fff !important;
          border-right: 0;
          display: grid;
          grid-template-rows: repeat(6, var(--row-height));
          overflow: hidden;
          row-gap: var(--row-gap);
          width: 100%;
        }
        .linhaSugestao{
          gap: .5rem;
          padding: 0;
          align-items: center;
          background: #fff;
          color: #17171a;
          display: flex;
          font-size: 16px;
          height: 100%;
          width: 100%;
          }
        .linhaSugestao svg{
          aspect-ratio: 1 / 1;
          display: inline-block;
          height: 1.25rem;
          margin: 0 .25rem;
        }
        .linhaSugestao:after{
          background: #fff;
          content: "";
          grid-row: span 6;
        }
    </style>`;
    let htmlSugestoesMobile = `<div role="dialog" class="mobileRecomendacoes"><div role="listbox" class="recomendacoesMobile"></div></div>`;
    let containerBusca = document.querySelector("cv-search-bar");
    document.head.insertAdjacentHTML("beforeend", cssMobile);
    let buscaContainerBusca = setInterval(function () {
      if (containerBusca) {
        if (buscaContainerBusca) {
          clearInterval(buscaContainerBusca);
          let botaoMenuBusca =
            containerBusca.querySelector("#search-bar-button");
          if (botaoMenuBusca) {
            botaoMenuBusca.addEventListener("click", function () {
              setTimeout(function () {
                let divAppendSugestoes = document.querySelector(
                  "cv-search-bar div[class*='container']"
                );
                if (divAppendSugestoes) {
                  divAppendSugestoes.insertAdjacentHTML(
                    "beforeend",
                    htmlSugestoesMobile
                  );
                  let containerRecomendacoesMobile = document.querySelector(
                    ".recomendacoesMobile"
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
                    containerRecomendacoesMobile.insertAdjacentHTML(
                      "beforeend",
                      sugestaoHTML
                    );
                  });
                }
              }, 500);
            });
          }
        }
        containerBusca = document.querySelector("cv-search-bar");
      }
    }, 1000);
  }
})();
