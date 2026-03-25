(function () {
  "use strict";

    function getSessionStorageItem(key) {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
  function addBarCreditRemaining(elementoAppend) {
    let containerMensagem = document.getElementById(elementoAppend);
    let buscaElemento = setInterval(() => {
      if (containerMensagem) {
        clearInterval(buscaElemento);
        containerMensagem.innerHTML = containerHTML;
        if (document.querySelector("span.loginCredit")) {
          document
            .querySelector("span.loginCredit")
            .addEventListener("click", function () {
              setTimeout(function () {
                $("#ta-login-dropdown--not-logged").trigger("click");
              }, 250);
            });
        }
      }
      containerMensagem = document.getElementById(elementoAppend);
    }, 1000);
  }
  let nomeUsuario = null;
  let creditos = null;
  let customerInfo = getSessionStorageItem("customerInfo-br");
  if (customerInfo) {
    nomeUsuario = customerInfo.firstName;
    creditos = customerInfo.clubCredit;
  }
  let mensagemCustom = ``;
  if (nomeUsuario != null && creditos != null) {
    creditos =
      creditos > 0 ? " (R$ " + creditos.toFixed(2).replace(".", ",") + ") " : " ";
    mensagemCustom =
      "<div>Olá " +
      nomeUsuario +
      "! Seus créditos" +
      creditos +
      "expiram em <span class='expirationDataCredito'> 31/10/2024</span>. </div><div>Aproveite o saldo para comprar seus cafés.</div>";
  } else {
    mensagemCustom =
      "<div>Você tem créditos que expiram em <span class='expirationDataCredito'>31/10/2024</span>.</div><div><span class='loginCredit'>Faça seu login</span> e descubra seu saldo.</div>";
  }

  let containerHTML =
    `<div class="containerCreditoTopo"><h1 class="mensagemCredito">` +
    mensagemCustom +
    `</h1></div>`;
  let regexHome = /^\/br\/pt(\/|\/home)?$/;
  let regexPLPs = /\/br\/pt\/order\/.*\/(original|vertuo)$/;
  let paginaAtual = window.location.pathname;

  if (regexHome.test(paginaAtual)) {
    addBarCreditRemaining("block-8820352046581");
  } else if (regexPLPs.test(paginaAtual)) {
    addBarCreditRemaining("block-8831367140853");
  }

  if (regexHome.test(paginaAtual) || regexPLPs.test(paginaAtual)) {
    let css = `<style>
    #block-8820352046581 section, #block-8831367140853 section{
          display:none;
    }
    .containerCreditoTopo, .containerCreditoTopo * {
      font-family: "NespressoLucas";
    }
    .containerCreditoTopo{
      background-color: rgb(153, 34, 26);
      color:#FFF;
      text-align: center;
    }
     .containerCreditoTopo .mensagemCredito{
      font-size: 20px;
      margin: 0;
      padding: 12px 0;
      display:flex;
      gap:3px;
      flex-direction: row;
      justify-content: center;
     }
     .containerCreditoTopo .loginCredit{
      cursor: pointer;
      text-decoration: underline; 
      }
    .expirationDataCredito{
      font-weight: 700;
    }
  
    @media screen and (max-width: 767px) {
      .containerCreditoTopo .mensagemCredito{
          font-size: 14px;
          display:flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap:0px;
          padding: 10px 6px;
      }
    }
    </style>`;
    document.head.insertAdjacentHTML("beforeend", css);
  }
})();
