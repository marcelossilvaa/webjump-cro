(function () {
  const cutoff = new Date("2025-11-30T00:00:00"); // Data limite
  let popinShown = false; // Evita múltiplas exibições
  const STORAGE_KEY = "customPopinClosedAt"; // chave para localStorage
  const DAYS_TO_HIDE = 4;
  let stylesInserted = false; // Flag para evitar duplicação de CSS
  let redirecionamentoInicializado = false; // Flag para evitar múltiplos listeners

  function sendGAEvent(action, label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event", //as is, do not change!!
      event_raised_by: "br", //please put the country code ex: us, ch, it
      local_event_category: "pop-in-app-day", //free to fill field, please use lower case
      local_event_action: action, //free to fill field, please use lower case
      local_event_label: label, //free to fill field, please use lower case
    });
  }
  // Insere o HTML do pop-in no final do body
  function createPopinHTML() {
    // Evita duplicação
    if (document.getElementById("custom-popin")) {
      return true; // Já existe, retorna true
    }

    // Verifica se o body está disponível
    if (!document.body) {
      return false;
    }

    // Insere o HTML no final do body (melhor posição para elementos fixed)
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="custom-popin" style="display:none;">
        <div class="close">×</div>
        <div class="content" id="container_redirecionamento">
            <div class="title">APP DAY</div>
            <div class="desc">
                GANHE UM ADICIONAL DE <span style="font-weight: 700;"> 5% OFF</span> NAS OFERTAS DE CAFÉS. <span style="font-weight: 700;">BAIXE O APP AGORA!</span>
            </div>
        </div>
        <div class="image">
            <img src="https://www.nespresso.com/ecom/medias/sys_master/public/46585220038686/Pop-In.jpg?attachment=true" alt="Imagem 5% OFF adicional no APP">
        </div>
      </div>`
    );

    return true;
  }

  // Insere o CSS apenas uma vez
  function insertStyles() {
    if (stylesInserted) return; // Já foi inserido
    if (!document.head) return; // Head não está disponível

    // Verifica se o style já existe
    if (document.getElementById("custom-popin-styles")) {
      stylesInserted = true;
      return;
    }

    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="custom-popin-styles">
    #custom-popin {
        cursor: pointer;
        position: fixed;
        bottom: 20px;
        right: 25px;
        background: #bc6a9f;
        border-radius: 60px;
        display: flex;
        align-items: center;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        padding: 15px 20px;
        z-index: 1001;
        transition: all 0.3s ease;
        max-width: 530px;
        font-family: 'NespressoLucas', 'Nespresso Lucas', 'Lucas', 'Trebuchet MS';
    }

    #custom-popin .image {
        width: 85px;
        height: 85px;
        background: white;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 15px;
        flex-shrink: 0;
    }

    #custom-popin .image img {
        width: 85px;
        height: 85px;
    }

    #custom-popin .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
        padding-right: 15px;
    }

    #custom-popin .title {
        font-weight: bold;
        font-size: 24px;
        text-transform: uppercase;
        margin-bottom: 10px;
        color: #fff;
    }

    #custom-popin .desc {
        font-size: 14px;
        line-height: 1.3;
        color: #fff;
        text-align: center;
        font-weight: 400;
    }

    #custom-popin .close {
        position: absolute;
        top: -10px;
        right: -10px;
        background: black;
        color: white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        text-align: center;
        line-height: 28px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
    }

    /* ---------- MOBILE STYLES ---------- */
    @media screen and (max-width: 768px) {
        #custom-popin {
            left: 10px;
            right: 10px;
            bottom: 90px !important;
            padding: 12px 16px;
            border-radius: 24px;
        }

        #custom-popin .image {
            width: 70px;
            height: 70px;
            margin-left: 10px;
        }

        #custom-popin .image img {
            width: 76px;
            height: 76px;
        }

        #custom-popin .title {
            font-size: 20px;
        }

        #custom-popin .desc {
            font-size: 12px;
        }

        #custom-popin .close {
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            font-size: 16px;
            line-height: 24px;
        }
    }

    @media screen and (max-width: 480px) {
        #custom-popin {
            flex-direction: row;
            /* mantém layout horizontal */
            align-items: center;
            padding: 12px;
        }

        #custom-popin .image {
            width: 60px;
            height: 60px;
            margin-left: 10px;
        }

        #custom-popin .image img {
            width: 76px;
            height: 76px;
        }

        #custom-popin .title {
            font-size: 20px;
        }

        #custom-popin .desc {
            font-size: 12px;
        }
    }
</style>`
    );
    stylesInserted = true;
  }

  // Função para verificar se o popin foi fechado recentemente
  function wasRecentlyClosed() {
    try {
      const closedAt = localStorage.getItem(STORAGE_KEY);
      if (!closedAt) return false;
      const closedDate = new Date(closedAt);
      const now = new Date();
      const diffTime = now - closedDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays < DAYS_TO_HIDE;
    } catch (e) {
      // Se localStorage não estiver disponível, retorna false
      return false;
    }
  }

  function isMobileDevice() {
    const mobileKeywords =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileKeywords.test(navigator.userAgent);
  }

  function inicializarRedirecionamento() {
    // Evita múltiplos listeners
    if (redirecionamentoInicializado) return;

    const urlDesktop = "https://www.nespresso.com/br/pt/baixar-app";
    const urlMobile = "https://nespresso.go.link?adj_t=1nca0syu";
    const elemento = document.getElementById("container_redirecionamento");
    if (!elemento) {
      return;
    }

    elemento.addEventListener("click", function () {
      let urlDestino = isMobileDevice() ? urlMobile : urlDesktop;
      console.log("Redirecionando para: " + urlDestino);
      sendGAEvent("click", "click_pop_in_app_day");
      window.location.href = urlDestino;
    });

    redirecionamentoInicializado = true;
  }

  function fecharPopin() {
    sendGAEvent("click", "close_pop_in_app_day");
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch (e) {
      console.warn("Não foi possível salvar no localStorage:", e);
    }
    const popin = document.getElementById("custom-popin");
    if (popin) {
      popin.style.display = "none";
    }
  }

  function checkAndShowPopin() {
    const now = new Date(); // Verifica data a cada execução

    if (now < cutoff && !popinShown && !wasRecentlyClosed()) {
      const popin = document.getElementById("custom-popin");
      if (popin) {
        popin.style.display = "flex";
        popinShown = true;

        // Ajuste de bottom para mobile
        if (window.innerWidth <= 768) {
          popin.style.bottom = "50px";
        }

        // Adiciona evento de fechar para salvar no localStorage
        const closeBtn = popin.querySelector(".close");
        if (closeBtn) {
          // Remove listeners anteriores para evitar duplicação
          closeBtn.replaceWith(closeBtn.cloneNode(true));
          const newCloseBtn = popin.querySelector(".close");
          newCloseBtn.addEventListener("click", fecharPopin);
        }
      }
    }
  }

  // Função de inicialização que garante que o DOM está pronto
  let initInterval = null; // Guarda o intervalo para evitar múltiplos
  function init() {
    // Verifica se o body existe antes de criar o pop-in
    if (!document.body) {
      setTimeout(init, 100);
      return;
    }

    // Insere os estilos CSS primeiro
    insertStyles();

    // Cria o HTML do pop-in se não existir
    const htmlCreated = createPopinHTML();
    if (!htmlCreated) {
      // Se não conseguiu criar (body não disponível), tenta novamente
      setTimeout(init, 100);
      return;
    }

    // Verifica se o elemento foi criado
    const popin = document.getElementById("custom-popin");
    if (!popin) {
      // Se não existe após criar, tenta novamente após um pequeno delay
      setTimeout(init, 100);
      return;
    }

    // Inicializa redirecionamento (só uma vez)
    inicializarRedirecionamento();

    // Verifica a URL imediatamente
    checkAndShowPopin();

    // Observa mudanças na URL em SPAs usando polling (apenas uma vez)
    if (!initInterval) {
      let lastUrl = window.location.href;
      initInterval = setInterval(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          popinShown = false; // Reseta para permitir nova exibição em nova rota
          checkAndShowPopin();
        }
      }, 300);
    }
  }

  // Tenta inicializar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM já está pronto ou script carregou depois
    init();
  }
})();
