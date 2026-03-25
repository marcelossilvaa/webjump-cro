(function () {
  // Marca os elementos criados para identificá-los
  const BANNER_CLASS = "banner-custom-inserido";

  const CONFIG = {
    ol: {
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45003693850654/imagem-2-.jpg?attachment=true&cimgnr=1R8kp",
      titulo: "OFERTA DE <span class='boldCrossSellCards'>BOAS VINDAS</span>",
      paragrafo: "Compre 70 cafés e ganhe 10 cápsulas de presente*",
      ctaText: "FAÇA LOGIN",
      ctaLink:
        "https://www.nespresso.com/br/pt/secure/login?destination-redirect=%2Fbr%2Fpt%2Forder%2Fcapsules%2Foriginal&status=bruteForce",
    },
    vl: {
      banner:
        "https://www.nespresso.com/ecom/medias/sys_master/public/45003693719582/imagem-1-.jpg?attachment=true&cimgnr=9mPoH",
      titulo: "OFERTA DE <span class='boldCrossSellCards'>BOAS VINDAS</span>",
      paragrafo: "Compre 70 cafés e ganhe 10 cápsulas de presente*",
      ctaText: "FAÇA LOGIN",
      ctaLink:
        "https://www.nespresso.com/br/pt/secure/login?destination-redirect=%2Fbr%2Fpt%2Forder%2Fcapsules%2Fvertuo&status=bruteForce",
    },
  };

  // Função para verificar se o usuário está logado
  function usuarioEstaLogado() {
    try {
      const isLoginTracked = sessionStorage.getItem("isLoginTracked");
      return isLoginTracked !== null;
    } catch (error) {
      console.warn("Erro ao acessar sessionStorage:", error);
      return false;
    }
  }

  function detectarDispositivo() {
    let screenWidth = window.innerWidth;
    if (screenWidth <= 767) return "mobile";
    if (screenWidth >= 768 && screenWidth <= 1024) return "tablet";
    return "desktop";
  }

  function criacaoCard() {
    let currentLocation = window.location.href;
    if (
      window.padl &&
      window.padl.page &&
      window.padl.page.pageInfo &&
      window.padl.page.pageInfo.pageName == "capsules pdp_plp"
    ) {
      if (currentLocation.includes("original")) {
        currentPLP = "ol";
      } else if (currentLocation.includes("vertuo")) {
        currentPLP = "vl";
      }
      if (currentPLP) {
        let categoriasPLP = document.querySelectorAll(".collection-grid");
        try {
          if (categoriasPLP.length > 1) {
            let reference = categoriasPLP[1].querySelector("article");
            if (reference) {
              categoriasPLP.forEach(function (categoria, index) {
                // Pula as últimas duas categorias
                if (index >= categoriasPLP.length - 2) {
                  return;
                }

                let articles = categoria.querySelectorAll("article");
                if (articles.length >= 5) {
                  // Detecta o tipo de dispositivo
                  let screenWidth = window.innerWidth;
                  let isTablet = screenWidth >= 768 && screenWidth <= 1024;
                  // Só executa para mobile ou desktop, pula tablets
                  if (!isTablet) {
                    let novoClone = reference.cloneNode(true);

                    // Marca o elemento como banner inserido
                    novoClone.classList.add(BANNER_CLASS);

                    let conteudo = novoClone.querySelector(
                      "div[class*='collectionDetails']"
                    );
                    if (conteudo) {
                      //Apaga todo conteudo dentro
                      conteudo
                        .querySelectorAll("*")
                        .forEach(function (element) {
                          element.remove();
                        });

                      // Verifica se o usuário está logado para decidir se mostra o CTA
                      const userLogado = usuarioEstaLogado();

                      let ctaHtml = "";
                      if (!userLogado) {
                        ctaHtml =
                          `<a href="` +
                          CONFIG[currentPLP].ctaLink +
                          `" class="linkCardCrossSell">` +
                          CONFIG[currentPLP].ctaText +
                          `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 50 50" fill="none"><path d="M32.7058 10.4167H29.7735L42.1484 22.9167H4.16663V25.0001H42.4081L29.7795 37.5001H32.7405L46.2646 24.113L32.7058 10.4167Z" fill="#876C43"></path></svg></a>`;
                      }

                      const novoConteudo =
                        `<h3 class="tituloCardCrossSell">` +
                        CONFIG[currentPLP].titulo +
                        `</h3>
                        <p class="paragrafoCardCrossSell">` +
                        CONFIG[currentPLP].paragrafo +
                        `</p><p class='termsCrossSell'>*Confira condições</p>` +
                        ctaHtml;

                      conteudo.insertAdjacentHTML("beforeend", novoConteudo);
                    }
                    let imageContainer = novoClone.querySelector("section");
                    if (imageContainer) {
                      imageContainer.style.setProperty(
                        "background-image",
                        "url('" + CONFIG[currentPLP].banner + "')",
                        "important"
                      );
                      imageContainer.style.setProperty(
                        "background-position",
                        "center center",
                        "important"
                      );
                      imageContainer.style.setProperty(
                        "background-repeat",
                        "no-repeat",
                        "important"
                      );

                      imageContainer.style.setProperty(
                        "background-size",
                        "cover",
                        "important"
                      );
                    }

                    // Posição fixa: sempre inserir na 5ª posição (índice 4)
                    const posicaoFixa = 4;

                    // Verifica se a posição existe, senão insere no final
                    if (articles.length > posicaoFixa) {
                      categoria.insertBefore(novoClone, articles[posicaoFixa]);
                    } else {
                      categoria.appendChild(novoClone);
                    }
                  }
                }
              });

              const STYLE = `<style>
                article.banner-custom-inserido div[class*='collectionDetails']{
                    height:100% !important;
                    text-align:center;
                    padding-bottom:0px;
                }
               
                .tituloCardCrossSell, .paragrafoCardCrossSell{
                    color: #FFF;
                    font-family: 'NespressoLucas', Arial;
                    font-size: 16px;
                    letter-spacing:1.1px;
                }
                .tituloCardCrossSell{
                  margin-bottom:14px;
                }
                .boldCrossSellCards{
                  font-weight: 600;
                }
                .termsCrossSell{
                  font-size:12px;
                  letter-spacing:1.1px;
                  color:#FFF;
                  margin-top: 16px;
                }
                a.linkCardCrossSell{
                  background: #fff;
                  color: #000;
                  align-items: center;
                  display: inline-flex;
                  padding: 0.5em 1.5em;
                  text-decoration: none;
                  border-radius: 30px;
                  font-weight: 300;
                  justify-content: center;
                  border: 1px solid #fff;
                  font-size:14px;
                  gap: 6px;
                  margin-bottom:16px;
                  margin-top: 8px;
                  z-index: 10;
                }

                article.banner-custom-inserido:not(:has(a.linkCardCrossSell)) .termsCrossSell{
                  margin-bottom:40px;
                }
                a.linkCardCrossSell:hover{
                  background: #000;
                  color: #FFF;
                  cursor:pointer !important; 
                }
                a.linkCardCrossSell:hover svg path{
                  fill:#FFF;
                }
                @media screen and (max-width: 480px){
                  .tituloCardCrossSell, .paragrafoCardCrossSell{
                    font-size:15px;
                  }
                }
              </style>`;

              document.head.insertAdjacentHTML("beforeend", STYLE);
            }
          }
        } catch (error) {
          console.error("Erro:", error);
        }
      }
    }
  }

  // Execução inicial
  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      criacaoCard();
    });
  } else {
    criacaoCard();
  }
})();
