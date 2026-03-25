(function () {
  "use strict";

  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "comunicacao-credito", //free to fill field, please use lower case
      local_event_action: "click", //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }

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

  function addBarCreditRemaining(elementoAppend, containerHTML) {
    let containerMensagem = document.getElementById(elementoAppend);
    let buscaElemento = setInterval(() => {
      if (containerMensagem) {
        clearInterval(buscaElemento);
        containerMensagem.innerHTML = containerHTML;
        if (document.querySelector("span.loginCredit")) {
          document
            .querySelector("span.loginCredit")
            .addEventListener("click", function () {
              sendGAEvent("click-faca-login");
              setTimeout(function () {
                $("#ta-login-dropdown--not-logged").trigger("click");
              }, 250);
            });
        }
        if (document.querySelector(".containerCreditoTopo a")) {
          document
            .querySelector(".containerCreditoTopo a")
            .addEventListener("click", function () {
              sendGAEvent("click-comprar-cafes");
            });
        }
      }
      containerMensagem = document.getElementById(elementoAppend);
    }, 1000);
  }

  let regexHome = /^\/br\/pt(\/|\/home)?$/;
  let paginaAtual = window.location.pathname;

  async function initCreditCommunication() {
    let nomeUsuario = null;
    let creditos = null;

    try {
      const customerInfo = await napi.customer().read();
      if (customerInfo) {
        nomeUsuario = customerInfo.firstName;
        creditos = customerInfo.clubCredit;
      }
    } catch (error) {
      console.error("Erro ao buscar informações do cliente:", error);
    }

    // Se os créditos foram encontrados mas estão zerados, não exibe comunicação
    if (creditos !== null && creditos === 0) {
      return;
    }

    let mensagemCustom = ``;
    if (nomeUsuario != null && creditos != null) {
      creditos = "(R$ " + creditos.toFixed(2).replace(".", ",") + ") ";

      mensagemCustom =
        "<div>Olá " +
        nomeUsuario +
        "! Você tem <strong>" +
        creditos +
        "</strong> para utilizar. </div><div>Aproveite o saldo para <a href='https://www.nespresso.com/br/pt/order/capsules/original'>comprar seus cafés na Black Friday.</a></div>";
    } else {
      mensagemCustom =
        "<div>Você tem créditos para utilizar.</div><div><span class='loginCredit'>Faça seu login</span> e descubra seu saldo.</div>";
    }

    let containerHTML =
      `<div class="containerCreditoTopo"><h1 class="mensagemCredito">` +
      mensagemCustom +
      `</h1></div>`;

    if (regexHome.test(paginaAtual)) {
      addBarCreditRemaining("block-8834742998517", containerHTML);
    }
  }

  function initStyles() {
    if (regexHome.test(paginaAtual)) {
      let css = `<style>
      #block-8820352046581 section{
            display:none;
      }
      .containerCreditoTopo, .containerCreditoTopo * {
        font-family: "NespressoLucas";
      }
      .containerCreditoTopo{
        background-color: #c17a81;
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

  function init() {
    initStyles();
    initCreditCommunication();
  }

  // Verifica se o DOM já está carregado ou aguarda o evento
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM já está carregado
    init();
  }
})();
