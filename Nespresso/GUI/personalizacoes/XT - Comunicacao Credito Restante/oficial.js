(function () {
  "use strict";

  function getSessionStorageItem(key) {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  function addBarCreditRemaining(elementoAppend, containerHTML) {
    let containerMensagem = document.getElementById(elementoAppend);
    let buscaElemento = setInterval(() => {
      if (containerMensagem) {
        clearInterval(buscaElemento);
        if (!document.querySelector(".containerCreditoTopo")) {
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
      }
      containerMensagem = document.getElementById(elementoAppend);
    }, 1000);
  }
  if (!document.querySelector(".containerCreditoTopo")) {
    let nomeUsuario = null;
    let creditos = null;
    let mensagemCustom = ``;
    let customerInfo = getSessionStorageItem("customerInfo-br");
    if (customerInfo) {
      nomeUsuario = customerInfo.firstName;
      creditos = customerInfo.clubCredit;
    }
    if ((nomeUsuario != null) & (creditos != null)) {
      if (creditos > 0) {
        creditos = " R$ " + creditos.toFixed(2).replace(".", ",");
        mensagemCustom =
          "<div>Olá " +
          nomeUsuario +
          "! Você tem" +
          creditos +
          " para utilizar. </div><div>Aproveite o saldo para <a href='https://www.nespresso.com/br/pt/order/capsules/original'>comprar seus cafés.</a></div>";
      }
    } else {
      mensagemCustom =
        "<div>Você tem créditos para utilizar.</div><div><span class='loginCredit'>Faça seu login</span> e descubra seu saldo.</div>";
    }

    if (mensagemCustom.length > 0) {
      let containerHTML =
        `<div class="containerCreditoTopo"><h1 class="mensagemCredito">` +
        mensagemCustom +
        `</h1></div>`;
      let regexHome = /^\/br\/pt(\/|\/home)?$/;
      let regexPLPs = /\/br\/pt\/order\/.*\/(original|vertuo)$/;
      let paginaAtual = window.location.pathname;

      if (regexHome.test(paginaAtual)) {
        addBarCreditRemaining("block-8820352046581", containerHTML);
      } else if (regexPLPs.test(paginaAtual)) {
        addBarCreditRemaining("block-8831367140853", containerHTML);
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
      .containerCreditoTopo .loginCredit, .containerCreditoTopo a{
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
    }
  }
})();
