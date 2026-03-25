(function () {
  "use strict";
  if (window.abBarraBusca) {
    return;
  }
  window.abBarraBusca = "true";
  var isDesktop = window.innerWidth >= 996;
  gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });
  var sugestoesRecomendacoes = [
    {
      href: "https://www.nespresso.com/br/pt/busca?action=searchboxSubmitStandalone&q=Vertuo",
      texto: "Vertuo",
      hasFlag: false,
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=aeroccino&tab=Products&p=1",
      texto: "Aeroccino",
      hasFlag: false,
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=ristretto&tab=Products&p=1",
      texto: "Ristretto",
      hasFlag: true,
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=Volluto&tab=Products&p=1",
      texto: "Volluto",
      hasFlag: false,
    },
    {
      href: "https://www.nespresso.com/br/pt/busca?q=essenza&tab=Products&p=1",
      texto: "Essenza",
      hasFlag: false,
    },
  ];

  var sugestoesImagens = [
    {
      href: "https://www.nespresso.com/br/pt/order/machines/vertuo/cafeteira-vertuo-pop-vermelho-pimenta-110v",
      produto: "Vertuo Pop",
      tecnologia: "Vertuo",
      imagemProduto:
        "https://www.nespresso.com/shared_res/agility/global/machines/vl/sku-main-info-product/vertuo-pop-c_liquorice-black_front-coffee-nespresso_2x.png?impolicy=small&imwidth=600&imdensity=1",
      hasFlag: true,
    },
    {
      href: "https://www.nespresso.com/br/pt/order/machines/original/maquina-cafe-comprar-essenza-mini-preta-110v",
      produto: "Essenza Mini",
      tecnologia: "Original",
      imagemProduto:
        "https://www.nespresso.com/ecom/medias/sys_master/public/34444944179230/EssenzaMiniBlack-2000x2000-Desktop.png?impolicy=small&imwidth=284&imdensity=1",
      hasFlag: true,
    },
    {
      href: "https://www.nespresso.com/br/pt/order/machines/original/comprar-maquina-cafe-pixie-redesign-prata-110v",
      produto: "Pixie Redesign",
      tecnologia: "Original",
      imagemProduto:
        "https://www.nespresso.com/ecom/medias/sys_master/public/34448705880094/pixie-silver-front-coffee-nespresso-320.png?impolicy=small&imwidth=284&imdensity=1",
      hasFlag: false,
    },
  ];

  var svgLupa =
    '<svg viewBox="0 0 16 16" stroke="white" stroke-width="1.2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="_icon_1v3wd_216">' +
    '<path d="m6.4 0c3.5 0 6.4 2.9 6.4 6.4 0 1.4-.4 2.7-1.2 3.7l4 4c.4.4.4 1 .1 1.5l-.1.1c-.2.2-.5.3-.8.3s-.6-.1-.8-.3l-4-4c-1 .7-2.3 1.2-3.7 1.2-3.4-.1-6.3-3-6.3-6.5s2.9-6.4 6.4-6.4zm0 2.1c-2.3 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3-1.9-4.3-4.3-4.3z"></path>' +
    "</svg>";

  function inserirCSS(css) {
    document.head.insertAdjacentHTML("beforeend", "<style>" + css + "</style>");
  }

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "user engagement", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  function esperarElemento(selector, callback) {
    var intervalo = setInterval(function () {
      var elemento = document.querySelector(selector);
      if (elemento) {
        clearInterval(intervalo);
        callback(elemento);
      }
    }, 1000);
  }

  if (isDesktop) {
    var cssDesktop = `  
          .containerRecomendacoesBusca, .containerRecomendacoesBusca * {
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
    
          .imagemSugestaoResultado {
            align-items: center;
            background: #fff;
            color: #17171a;
            display: flex;
            padding: 0 2rem;
          }
    
          .colunaResultadosRecomendacao {
            display: flex;
            justify-content: center;
            padding: 3px;
          }
    
          .linhaImagensResultados {
            display: flex;
            padding: 3px;
          }
    
          .colunaResultadosRecomendacao img {
            height: auto;
            max-width: none;
            width: 48px;
          }
    
          .colunaResultadosRecomendacao strong {
            font-size: 16px;
            font-weight: 700;
          }
    
          .colunaResultadosRecomendacao .linhaImagensResultados.tecnologia {
            color: #6f6f70;
            font-size: 14px;
            font-weight: 500;
          }
    
          .linhaSugestao:hover,.imagemSugestaoResultado:hover {
            background-color:#F6F7F9;
          }
          .containerRecomendacoesBusca .flag{
            background: #19171C !important;
            color: #fff;
            font-weight: 600;
            padding: 2px 4px;
            border-radius: 4px;
            font-size:16px;
          }
          .imagemSugestaoResultado .flag{
            margin-left:6px;
            font-size:16px;
            align-self:flex-start;
          }
          .imagemSugestaoResultado .flag.Vertuo{
            background-color:#54301A !important;
          }
          .imagemSugestaoResultado .flag.Original{
            background-color:#876C43 !important;
          }
          .imagemSugestaoResultado .firstColumnRecomendacoes{
            display:flex;
            flex-direction:column;
          }
        `;
    inserirCSS(cssDesktop);

    var recomendacoesHTMLDesktop = `<div role='dialog' class='containerRecomendacoesBusca ativo'>
          <div role='listbox' class='sugestoesRecomendacao'></div>
          <div class='sugestoesResultadosImagens'></div>
        </div>`;

    function ativarSugestoesBusca(inputBusca, containerAppendRecomendacoes) {
      if (
        !containerAppendRecomendacoes.querySelector(
          ".containerRecomendacoesBusca"
        )
      ) {
        containerAppendRecomendacoes.insertAdjacentHTML(
          "beforeend",
          recomendacoesHTMLDesktop
        );

        var containerSugestoes = containerAppendRecomendacoes.querySelector(
          ".sugestoesRecomendacao"
        );
        sugestoesRecomendacoes.forEach(function (sugestao) {
          let flag = sugestao.hasFlag
            ? "<div class='flag'>Mais vendido</div>"
            : "";
          var sugestaoHTML =
            "<a class='linhaSugestao' title='" +
            sugestao.texto +
            "' href='" +
            sugestao.href +
            "'>" +
            svgLupa +
            "<span>" +
            sugestao.texto +
            "</span>" +
            flag +
            "</a>";
          containerSugestoes.insertAdjacentHTML("beforeend", sugestaoHTML);
        });

        var containerImagensSugestoes =
          containerAppendRecomendacoes.querySelector(
            ".sugestoesResultadosImagens"
          );
        sugestoesImagens.forEach(function (sugestao) {
          let flag = sugestao.hasFlag
            ? "<div class='flag " +
              sugestao.tecnologia +
              "'>Mais vendido em " +
              sugestao.tecnologia +
              "</div>"
            : "";
          var sugestaoHTML =
            "<a class='imagemSugestaoResultado' title='" +
            sugestao.produto +
            "' href='" +
            sugestao.href +
            "'>" +
            "<div class='colunaResultadosRecomendacao'><img alt='" +
            sugestao.produto +
            "' src='" +
            sugestao.imagemProduto +
            "'></div>" +
            "<div class='colunaResultadosRecomendacao'><div class='firstColumnRecomendacoes'>" +
            "<div class='linhaImagensResultados'><strong>" +
            sugestao.produto +
            "</strong></div>" +
            "<div class='linhaImagensResultados tecnologia'>em " +
            sugestao.tecnologia +
            "</div></div>" +
            flag +
            "</div></a>";
          containerImagensSugestoes.insertAdjacentHTML(
            "beforeend",
            sugestaoHTML
          );
        });

        var containerRecomendacoes = containerAppendRecomendacoes.querySelector(
          ".containerRecomendacoesBusca"
        );

        inputBusca.addEventListener("focus", function () {
          containerRecomendacoes.classList.add("ativo");
        });

        containerRecomendacoes.addEventListener("mouseenter", function () {
          containerRecomendacoes.classList.add("ativo");
        });

        document.addEventListener("click", function (event) {
          var isClickInsideInput = inputBusca.contains(event.target);
          var isClickInsideContainer = containerRecomendacoes.contains(
            event.target
          );
          if (!isClickInsideInput && !isClickInsideContainer) {
            containerRecomendacoes.classList.remove("ativo");
          }
        });
      }
      document
        .querySelectorAll(".sugestoesRecomendacao a")
        .forEach(function (a) {
          a.addEventListener("click", function (e) {
            let label = e.currentTarget.getAttribute("title");
            if (label) {
              label = label.toLowerCase().replaceAll(" ", "_");
              sendGAEvent("busca_click_termos_" + label);
            }
          });
        });
      document
        .querySelectorAll(".sugestoesResultadosImagens a")
        .forEach(function (a) {
          a.addEventListener("click", function (e) {
            let label = e.currentTarget.getAttribute("title");
            if (label) {
              label = label.toLowerCase().replaceAll(" ", "_");
              sendGAEvent("busca_click_imagens_" + label);
            }
          });
        });
    }

    esperarElemento("cv-search-bar", function (containerBusca) {
      var inputBusca = containerBusca.querySelector(
        "input[class*='searchbox']"
      );
      if (inputBusca) {
        var containerAppendRecomendacoes = containerBusca.querySelector(
          "div[class*='container']"
        );
        ativarSugestoesBusca(inputBusca, containerAppendRecomendacoes);
      } else {
        var botaoAtivarBusca =
          containerBusca.querySelector("#search-bar-button");
        if (botaoAtivarBusca) {
          botaoAtivarBusca.addEventListener("click", function () {
            setTimeout(function () {
              inputBusca = containerBusca.querySelector(
                "input[class*='searchbox']"
              );
              if (inputBusca) {
                var containerAppend = containerBusca.querySelector(
                  "div[class*='container']"
                );
                ativarSugestoesBusca(inputBusca, containerAppend);
              }
            }, 500);
          });
        }
      }
    });
  } else {
    var cssMobile = `@media only screen and (min-width: 997px){
          .mobileRecomendacoes {
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
        .recomendacoesMobile .flag{
          background: #19171C !important;
          color: #fff;
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: nowrap;
        }`;

    inserirCSS(cssMobile);

    var htmlSugestoesMobile = `<div role='dialog' class='mobileRecomendacoes'>
          <div role='listbox' class='recomendacoesMobile'></div>
        </div>`;

    esperarElemento("cv-search-bar", function (containerBusca) {
      var botaoMenuBusca = containerBusca.querySelector("#search-bar-button");
      if (botaoMenuBusca) {
        botaoMenuBusca.addEventListener("click", function () {
          setTimeout(function () {
            var divAppendSugestoes = containerBusca.querySelector(
              "div[class*='container']"
            );
            if (
              divAppendSugestoes &&
              !divAppendSugestoes.querySelector(".mobileRecomendacoes")
            ) {
              divAppendSugestoes.insertAdjacentHTML(
                "beforeend",
                htmlSugestoesMobile
              );
              var containerRecomendacoesMobile =
                divAppendSugestoes.querySelector(".recomendacoesMobile");
              sugestoesRecomendacoes.forEach(function (sugestao) {
                let flag = sugestao.hasFlag
                  ? "<div class='flag'>Mais vendido</div>"
                  : "";
                var sugestaoHTML =
                  "<a class='linhaSugestao' title='" +
                  sugestao.texto +
                  "' href='" +
                  sugestao.href +
                  "'>" +
                  svgLupa +
                  "<span>" +
                  sugestao.texto +
                  "</span>" +
                  flag +
                  "</a>";
                containerRecomendacoesMobile.insertAdjacentHTML(
                  "beforeend",
                  sugestaoHTML
                );
              });
            }
            document
              .querySelectorAll(".recomendacoesMobile a")
              .forEach(function (a) {
                a.addEventListener("click", function (e) {
                  let label = e.currentTarget.getAttribute("title");
                  if (label) {
                    label = label.toLowerCase().replaceAll(" ", "_");
                    sendGAEvent("busca_click_termos_" + label);
                  }
                });
              });
          }, 500);
        });
      }
    });
  }
})();
