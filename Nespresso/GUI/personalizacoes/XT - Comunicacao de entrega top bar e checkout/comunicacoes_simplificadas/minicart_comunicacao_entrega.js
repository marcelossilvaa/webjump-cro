(function () {
  if (window.comunicacaoEntregaMinicart) {
    return;
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
  window.comunicacaoEntregaMinicart = "true";

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

  // Dados de entrega por UF
  const diasEntregasUF = {
    1: [
      { estado: "São Paulo", uf: "SP", capital: "São Paulo" },
      { estado: "Rio de Janeiro", uf: "RJ", capital: "Rio de Janeiro" },
      { estado: "Distrito Federal", uf: "DF", capital: "Brasília" },
      { estado: "Pernambuco", uf: "PE", capital: "Recife" },
    ],
    2: [
      { estado: "Espírito Santo", uf: "ES", capital: "Vitória" },
      { estado: "Goiás", uf: "GO", capital: "Goiânia" },
      { estado: "Minas Gerais", uf: "MG", capital: "Belo Horizonte" },
      { estado: "Mato Grosso do Sul", uf: "MS", capital: "Campo Grande" },
      { estado: "Paraná", uf: "PR", capital: "Curitiba" },
      { estado: "Santa Catarina", uf: "SC", capital: "Florianópolis" },
    ],
    3: [
      { estado: "Alagoas", uf: "AL", capital: "Maceió" },
      { estado: "Ceará", uf: "CE", capital: "Fortaleza" },
      { estado: "Bahia", uf: "BA", capital: "Salvador" },
      { estado: "Sergipe", uf: "SE", capital: "Aracaju" },
      { estado: "Paraíba", uf: "PB", capital: "João Pessoa" },
      { estado: "Rio Grande do Norte", uf: "RN", capital: "Natal" },
      { estado: "Rio Grande do Sul", uf: "RS", capital: "Porto Alegre" },
    ],
    5: [
      { estado: "Piauí", uf: "PI", capital: "Teresina" },
      { estado: "Maranhão", uf: "MA", capital: "São Luís" },
      { estado: "Tocantins", uf: "TO", capital: "Palmas" },
      { estado: "Mato Grosso", uf: "MT", capital: "Cuiabá" },
    ],
    7: [
      { estado: "Amazonas", uf: "AM", capital: "Manaus" },
      { estado: "Acre", uf: "AC", capital: "Rio Branco" },
      { estado: "Amapá", uf: "AP", capital: "Macapá" },
      { estado: "Pará", uf: "PA", capital: "Belém" },
      { estado: "Roraima", uf: "RR", capital: "Boa Vista" },
      { estado: "Rondônia", uf: "RO", capital: "Porto Velho" },
    ],
  };

  function obterDiasEntregaPorUF(ufBuscada) {
    for (let dias in diasEntregasUF) {
      if (diasEntregasUF.hasOwnProperty(dias)) {
        let estados = diasEntregasUF[dias];
        for (let estado of estados) {
          if (estado.uf.toUpperCase() === ufBuscada.toUpperCase()) {
            return parseInt(dias);
          }
        }
      }
    }
    return false;
  }

  function obterCapitalPorUF(ufBuscada) {
    for (let dias in diasEntregasUF) {
      let estados = diasEntregasUF[dias];
      for (let estado of estados) {
        if (estado.uf === ufBuscada) {
          return estado.capital;
        }
      }
    }
    return false;
  }

  function obterNomeEstadoPorUF(ufBuscada) {
    for (let dias in diasEntregasUF) {
      let estados = diasEntregasUF[dias];
      for (let estado of estados) {
        if (estado.uf === ufBuscada) {
          return estado.estado;
        }
      }
    }
    return false;
  }

  function getSessionStorageItem(key) {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  function setCookieLocalizacao(cidade, uf) {
    var expirationDate = new Date();
    expirationDate.setTime(
      expirationDate.getTime() + 365 * 24 * 60 * 60 * 1000,
    ); // 1 ano de validade

    document.cookie =
      "cidadeAB=" +
      encodeURIComponent(cidade) +
      "; path=/br/pt" +
      "; expires=" +
      expirationDate.toUTCString() +
      "; secure" +
      "; SameSite=Lax";

    document.cookie =
      "ufAB=" +
      encodeURIComponent(uf) +
      "; path=/br/pt" +
      "; expires=" +
      expirationDate.toUTCString() +
      "; secure" +
      "; SameSite=Lax";
  }

  function getCookieAB(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookiesArray = decodedCookie.split(";");
    for (let i = 0; i < cookiesArray.length; i++) {
      let cookie = cookiesArray[i].trim();
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return false;
  }

  function searchAddressAndSetCookie() {
    const adressDataFrete = getSessionStorageItem("address");
    const adressAccountLogged = getSessionStorageItem(
      "customerAddressesCache-br",
    );
    let cidadeAB = "";
    let ufAB = "";

    if (adressDataFrete) {
      let cidade = adressDataFrete.city;
      let uf = adressDataFrete.state;
      if (cidade && uf) {
        cidadeAB = cidade;
        ufAB = uf;
      }
    } else if (adressAccountLogged) {
      const firstEntry = adressAccountLogged.value[0];
      const city = firstEntry.city;
      const region = firstEntry.region.id;
      if (city && region) {
        cidadeAB = city;
        ufAB = region;
      }
    }
    let cookieCidade = getCookieAB("cidadeAB");
    let cookieUF = getCookieAB("ufAB");
    if (cookieCidade && cookieUF) {
      if (cidadeAB && ufAB) {
        if (cookieCidade !== cidadeAB || cookieUF !== ufAB) {
          setCookieLocalizacao(cidadeAB, ufAB);
        }
      }
    } else {
      if (cidadeAB && ufAB) {
        setCookieLocalizacao(cidadeAB, ufAB);
      }
    }
  }

  function adicionarDiasUteis(data, dias) {
    let diasAdicionados = 0;
    let novaData = new Date(data);
    while (diasAdicionados < dias) {
      novaData.setDate(novaData.getDate() + 1);
      let diaSemana = novaData.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        // 0 = Domingo, 6 = Sábado
        diasAdicionados++;
      }
    }
    return novaData;
  }

  function gerarMensagemEntrega() {
    let cookieCidade = getCookieAB("cidadeAB");
    let cookieUF = getCookieAB("ufAB");

    if (!cookieCidade || !cookieUF) {
      return null;
    }

    let nomeEstado = obterNomeEstadoPorUF(cookieUF);
    let diasEntrega = obterDiasEntregaPorUF(cookieUF);

    if (!diasEntrega || !nomeEstado) {
      return null;
    }

    // Sempre calcula baseado na capital, sem adicionar dias extras

    let dataAtual = new Date();
    let horaAtual = dataAtual.getHours();

    // Se for depois das 11h, adiciona 1 dia ao prazo de entrega
    if (horaAtual >= 11) {
      diasEntrega += 1;
    }

    let dataEntrega = adicionarDiasUteis(dataAtual, diasEntrega);
    let dia = dataEntrega.getDate();
    let mes = dataEntrega.getMonth() + 1; // getMonth() retorna 0-11, então adiciona 1

    // Formata dia e mês com zero à esquerda se necessário
    let diaFormatado = dia < 10 ? "0" + dia : dia.toString();
    let mesFormatado = mes < 10 ? "0" + mes : mes.toString();

    let mensagem =
      "Comprando hoje" +
      `, receba até o dia <strong>(` +
      diaFormatado +
      `/` +
      mesFormatado +
      `)</strong>*, no estado de <strong>` +
      nomeEstado +
      `</strong>`;

    return {
      mensagem: mensagem,
      uf: cookieUF,
    };
  }

  const addAnimationStyles = () => {
    if (document.getElementById("nespresso-delivery-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "nespresso-delivery-styles";
    styleEl.textContent = `
                    @keyframes fadeInScale {
                      0% { opacity: 0; transform: scale(0.8); }
                      100% { opacity: 1; transform: scale(1); }
                    }
                    
                    .nespresso-component-enter {
                      animation: fadeInScale 0.5s ease-out forwards;
                    }
                    .nespresso-delivery-minicart-message-icon{
                      width: 30px;
                      height: 30px;
                    }
                  `;
    document.head.appendChild(styleEl);
  };

  const createOffersComponent = () => {
    const existingComponent = document.getElementById(
      "nespresso-delivery-minicart-message",
    );
    if (existingComponent) {
      existingComponent.remove();
    }

    const container = document.createElement("div");
    container.id = "nespresso-delivery-minicart-message";
    container.style.cssText =
      "padding: 0px 8px 8px; border-radius: 8px; border-bottom:1px solid #efefef; font-family: NespressoLucas, sans-serif; opacity: 0;";
    container.classList.add("nespresso-component-enter");

    const targetElement = document.querySelector(".MiniBasketFooter");

    if (targetElement) {
      targetElement.insertAdjacentElement("afterbegin", container);
      setTimeout(() => {
        container.style.opacity = "1";
      }, 50);
    } else {
      console.warn("Target element for Nespresso delivery component not found");
    }

    return container;
  };

  const renderOffersComponent = (container) => {
    const dadosEntrega = gerarMensagemEntrega();

    if (dadosEntrega) {
      const communicationHTML =
        `<div style="padding:8px 0;text-align:center">
        <div style="display:flex;align-items:center;justify-content: center;gap: 8px;padding: 8px 12px;font-size: 14px;background-color:#f9fafb;border-left: 3px solid #257a57;color: #000;">
       <svg class="nespresso-delivery-minicart-message-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><path d="M18.5 1.94 6 8.2V13h1V9.3l11 5.5v13.9L7 23.2V22H6v1.8l12.5 6.26L31 23.8V8.19zM29.38 8.5l-4.88 2.44L13.62 5.5l4.88-2.44zM18.5 13.94 7.62 8.5l4.88-2.44 10.88 5.44zM19 28.7V14.81l5-2.5v3.44l1-.5v-3.44l5-2.5v13.88z"/><path d="M8 17H1v1h7zM11 20H4v1h7zM10 14H3v1h7z"/></svg>
        <div>` +
        dadosEntrega.mensagem +
        `
        </div></div>
        <div style="font-size: 12px;color: #666;margin-top: 4px;padding: 0 12px;">*Cidades do Interior acrescentar +3 dias úteis</div>
      </div>`;

      container.innerHTML = communicationHTML;
      container.style.display = "block";
      container.style.opacity = "1";

      // Oculta o componente de frete apenas quando a comunicação de entrega aparecer
      const freightComponent = document.getElementById(
        "minicart-freight-component",
      );
      if (freightComponent) {
        freightComponent.style.display = "none";
      }

      // Envia evento GA com a UF
      sendGAEvent("xt_adobe_target_mensagem_frete_minicart_" + dadosEntrega.uf);
    } else {
      container.style.display = "none";

      // Mostra o componente de frete novamente se a comunicação não aparecer
      const freightComponent = document.getElementById(
        "minicart-freight-component",
      );
      if (freightComponent) {
        freightComponent.style.display = "";
      }
    }
  };

  const handleCartUpdate = () => {
    const container = createOffersComponent();
    renderOffersComponent(container);
  };

  const watchForMinicartOpen = () => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const addedNodes = Array.from(mutation.addedNodes);

          for (const node of addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const isMiniCart =
                node.classList &&
                node.classList.contains("MiniBasketDropdown__wrapper");
              const containsMiniCart =
                node.querySelector &&
                node.querySelector(".MiniBasketDropdown__wrapper");

              if (isMiniCart || containsMiniCart) {
                setTimeout(() => {
                  handleCartUpdate();
                }, 100);
                break;
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  };

  const handleResize = () => {
    const existingComponent = document.getElementById(
      "nespresso-delivery-minicart-message",
    );
    if (existingComponent) {
      renderOffersComponent(existingComponent);
    }
  };

  const initOffersComponent = () => {
    // Busca e cria cookies de localização antes de inicializar o componente
    searchAddressAndSetCookie();

    addAnimationStyles();

    const observer = watchForMinicartOpen();

    if (window.napi && window.napi.data) {
      window.napi.data().on("cart.update", handleCartUpdate);
    }

    window.addEventListener("resize", handleResize);

    window.nespressoOffersObserver = observer;
  };

  // Busca e cria cookies de localização imediatamente
  searchAddressAndSetCookie();

  const waitForNapi = setInterval(() => {
    if (window.napi) {
      clearInterval(waitForNapi);
      initOffersComponent();
    }
  }, 500);

  setTimeout(() => {
    clearInterval(waitForNapi);
    if (!window.napi) {
      console.error("Nespresso API not available after 10 seconds");
    }
  }, 10000);
})();
