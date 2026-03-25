//Não logados: Você tem créditos que expiram em 31/10/2024. Faça seu login e descubra seu saldo
// deixar o botão com underline e em negrito.
//Deixar um clique no botão de login para abrir o dropdown de login: $("#ta-login-dropdown--not-logged").trigger("click");
//Salvar nome e valor de crédito
//Caso não tenha informação de nome, crédito será colocado uma mensagem genérica: Você tem créditos que expiram em 31/10/2024. Aproveite o saldo para comprar seus cafés.
function getCustomerValueCredit() {
  const customerObj = window.napi
    .customer()
    .read()
    .then(function (value) {
      var componenteComInformacoes = `
        <style>
          #br-nespressoAndYou-seeQuantityCredits {
          display: flex; 
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: "NespressoLucas";
          font-size: 17px;
          width: 100%;
          height: auto;
          position: relative;
          line-height: 1.4rem;
          padding: 5px 0px;
        }

        .icon-nespresso-logo{
          width: 20px;
          height: 20px;
        }

        #first-line-text{
          margin-top: 10px; 
        }

        #third-line-price-credit{
          font-weight: 700;
          font-size: 20px;
          color: #116619;
          margin-top: 4px;

        }

        .btn-redirect-plp{
          border-radius: 48px;
          background-color: #FFF;
          width: auto;
          height: 37px;
          color: #000;
          padding: 0.5rem 1rem;
          text-align: center;
          margin-top: 10px;
          text-decoration: underline;
          text-transform: inherit;
          font-size: 14px;
        }
        
        #first-line-text-mobile{
          display: none; 
        }

        @media screen and (max-width: 540px) {
          #first-line-text, #second-line-text{
            display: none; 
          }
          
          #first-line-text-mobile{
            display: block;
          }

          .btn-redirect-plp{
            display: none;
          }

          .icon-nespresso-logo{
            width: 20px;
            position: absolute;
            height: 20px;
            bottom: 35%;
            left: 90%;
          }

          #br-nespressoAndYou-seeQuantityCredits {
            padding: 5px 0;
          }
        }

        </style>

        <div id="br-nespressoAndYou-seeQuantityCredits">
          <img class="icon-nespresso-logo"src="/ecom/medias/sys_master/public/27818513235998/nespresso-monogramnespressoLogo.png
          " alt="Nespresso Logo" />
          <span id="first-line-text"
            >Olá ${
              value.firstName
            }, aproveite para comprar seus cafés e viver um momento Nespresso único.</span
          >
          <span id="first-line-text-mobile"
            >Olá ${value.firstName}, seu saldo de créditos é de</span
          >
          <span id="second-line-text">Seu saldo de créditos é </span>
          <span id="third-line-price-credit">${
            value.clubCredit >= 0 ? "R$" : ""
          }${
        value.clubCredit >= 0
          ? value.clubCredit.toFixed(2).replace(".", ",")
          : ""
      }</span>
          <a href="https://www.nespresso.com/br/pt/order/capsules/original" class="btn-redirect-plp">Ir para a página de cafés</a>
        </div>
        `;
      document.getElementById(
        "br-nespressoAndYou-seeQuantityCredits"
      ).innerHTML = componenteComInformacoes;

      $(".btn-redirect-plp").on("click", function () {});
    });
}
getCustomerValueCredit();
