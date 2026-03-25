(function () {
  if (window.novaComunicacaoParaNovosUsuarios) {
    return;
  }
  window.novaComunicacaoParaNovosUsuarios = "true";

  // GTM tracking - executado de forma assíncrona para não bloquear
  setTimeout(function () {
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
  }, 0);

  // ========== CONFIGURAÇÕES ==========
  const CONFIG = {
    titulo: "OFERTA DE BOAS-VINDAS",
    subtitulo:
      "Comece sua jornada no mundo dos cafés com uma Oferta especial <span class='strongOfferNewUsers'>Nespresso</span>. Na compra de 70 cápsulas, ganhe <span class='strongOfferNewUsers'>+10 cafés de presente e Frete Grátis</span> por nossa conta!",
    elementoAlvo: "#block-8830310864373", // Elemento após o qual inserir o componente
    imagemCafes:
      "https://www.nespresso.com/ecom/medias/sys_master/public/44611284041758/Bloco-quiz-nespresso-1150x500.jpg",
    altImagem: "Diferentes tipos de café da Nespresso",
    // Configuração dos CTAs
    ctas: [
      {
        texto: "FAÇA LOGIN E COMPRE AGORA",
        link: "https://www.nespresso.com/br/pt/secure/login?destination-redirect=%2Fbr%2Fpt%2Forder%2Fcapsules%2Foriginal&status=bruteForce",
        estiloPrimario: true, // CTA principal
        tracking: "cta_faca_login_e_compre_agora",
      },
      {
        texto: "CONHEÇA NOSSOS CAFÉS",
        link: "https://www.nespresso.com/br/pt/order/capsules/original",
        estiloPrimario: false, // CTA secundário
        tracking: "cta_conheca_nossos_cafes",
      },
    ],
  };

  function sendGAEvent(label) {
    // Executa de forma assíncrona para não bloquear a UI
    setTimeout(function () {
      window.gtmDataObject = window.gtmDataObject || [];
      gtmDataObject.push({
        event: "local_event",
        event_raised_by: "br",
        local_event_category: "user engagement",
        local_event_action: "click",
        local_event_label: label,
      });
    }, 0);
  }

  // Pré-carrega a imagem para evitar delay no carregamento
  function preloadImage() {
    const img = new Image();
    img.src = CONFIG.imagemCafes;
  }

  function criarModal() {
    // Verifica se o modal já existe
    if (
      document.getElementById("nespresso-welcome-offer-modal-termos-condicoes")
    ) {
      return;
    }

    const modalElement = document.createElement("div");
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.id = "nespresso-welcome-offer-modal-termos-condicoes";
    modalElement.style.display = "none";

    // Estrutura HTML do modal
    modalElement.innerHTML = `
        <div class="nespresso-welcome-offer-modal-overlay"></div>
        <div class="nespresso-welcome-offer-modal-container">
          <div class="nespresso-welcome-offer-modal-header">
            <button class="nespresso-welcome-offer-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="nespresso-welcome-offer-modal-content">
            <div class="nespresso-welcome-offer-modal-termos">
              <strong>TERMOS E CONDIÇÕES</strong><br>
              <strong>OFERTA DE BOAS-VINDAS</strong><br>
              <br>
              Na compra acima de 70 a 99 cápsulas, da linha Original e/ou Vertuo, durante o período do dia 16/06 até 26/06 às 09h, o consumidor ganhará um sleeve de Caramello, concedido apenas para pedidos que contenham cápsulas da linha Original ou pedidos híbridos; ou um sleeve de Bianco Doppio, concedido apenas para pedidos que contenham cápsulas da linha Vertuo. <br><br>Oferta exclusiva para novos clientes, não cumulativa com outras ofertas em andamento, e limitada a um uso por CPF de registro na Nespresso. Para fins da presente Oferta, serão considerados “novos clientes” aqueles que nunca efetuaram compras de cápsulas na Nespresso através de cadastro por CPF antes da data do início da oferta. <br><br>Oferta válida, para pessoas físicas portadoras de CPF e clientes classificados na categoria B2C offices (pessoas jurídicas com consumo exclusivo de cápsulas da linha doméstica), não se aplicando para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ. Todos os produtos estão sujeitos à disponibilidade de estoque e as ofertas estão sujeitas alterações sem aviso prévio. Ao finalizar seu pedido, confirme se o sleeve está disponível em seu carrinho. Faça seu pedido através do site Nespresso.com, aplicativo Nespresso, telefone 0800 7777 737 (ligações gratuitas – Segunda a Sábado das 6h às 22h), WhatsApp (11) 95578-4670 ou nas Boutiques Nespresso. Confira os termos e condições referentes a esta oferta em www.nespresso.com/br/pt/termos-condicoes. Imagens meramente ilustrativas. <br><br>As ofertas estarão disponíveis no período mencionado nos canais de compra oficiais da marca: Boutiques Nespresso, telefone 0800 7777 737, WhatsApp (11) 95578-4670, site www.Nespresso.com ou aplicativos para iPhone, iPad e Android. <br><br>A Nespresso se reserva o direito, a seu critério exclusivo, de desqualificar qualquer indivíduo que interferir com o funcionamento das ofertas, seja ao criar várias contas, utilizar várias identidades ou agir de qualquer outra forma que seja considerada pela Nespresso como uma violação dos Termos e Condições, ou de alguma outra forma prejudicial.
            </div>
          </div>
        </div>
      `;

    document.body.appendChild(modalElement);
    return modalElement;
  }

  function configurarEventosModal() {
    const modal = document.getElementById(
      "nespresso-welcome-offer-modal-termos-condicoes"
    );
    const verCondicoesLink = document.getElementById(
      "nespresso-welcome-offer-ver-condicoes-link"
    );

    if (!modal || !verCondicoesLink) {
      return;
    }

    const closeModalBtn = modal.querySelector(
      ".nespresso-welcome-offer-modal-close"
    );
    const modalOverlay = modal.querySelector(
      ".nespresso-welcome-offer-modal-overlay"
    );

    function openModal(e) {
      e.preventDefault();
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
      sendGAEvent("ver_condicoes_oferta_boas_vindas");
    }

    function closeModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    // Remove event listeners existentes para evitar duplicação
    const newVerCondicoesLink = verCondicoesLink.cloneNode(true);
    verCondicoesLink.parentNode.replaceChild(
      newVerCondicoesLink,
      verCondicoesLink
    );

    // Adiciona os event listeners
    newVerCondicoesLink.addEventListener("click", openModal);

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", closeModal);
    }

    // Fechar modal com ESC - usando namespace específico
    document.addEventListener(
      "keydown",
      function nespressoWelcomeOfferModalKeyHandler(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
          closeModal();
        }
      }
    );
  }

  // Função otimizada para execução mais rápida
  function tentarCriarComunicacao() {
    // Verifica se o elemento alvo existe
    const targetElement = document.querySelector(CONFIG.elementoAlvo);
    if (!targetElement) {
      return false; // Retorna false se não conseguiu criar
    }

    // Verifica se o componente já foi criado
    if (document.getElementById("nespresso-welcome-offer")) {
      return true; // Já existe, retorna true
    }

    // Cria o HTML dos CTAs de forma mais eficiente
    const ctasHTML = CONFIG.ctas
      .map((cta) => {
        const classeEstilo = cta.estiloPrimario
          ? "cta-primary"
          : "cta-secondary";
        return (
          `<a href="` +
          cta.link +
          `" class="cta-btn ` +
          classeEstilo +
          `" id="` +
          cta.tracking +
          `">
                  ` +
          cta.texto +
          `
                  <span class="cta-arrow">→</span>
                </a>`
        );
      })
      .join("");

    // CSS inline otimizado para carregamento mais rápido
    const cssStyles = `<style>
      #nespresso-welcome-offer{width:100%;max-width:1200px;margin:40px auto;padding:0 20px;box-sizing:border-box}
      #nespresso-welcome-offer .offer-container{display:flex;align-items:center;border-radius:16px;gap:32px;overflow:hidden;border:1px solid #e7e7e7;background-color:#fff}
      #nespresso-welcome-offer .offer-image{flex:1;display:flex;justify-content:center;align-items:center}
      #nespresso-welcome-offer .offer-image img{max-width:100%;height:auto;border-radius:8px 0px 0px 8px}
      #nespresso-welcome-offer .offer-content{flex:1;display:flex;flex-direction:column;justify-content:center}
      #nespresso-welcome-offer .offer-title{font-family:"NespressoLucas",Helvetica,Arial,sans-serif;font-size:28px;font-weight:bold;color:#17171A;margin:0 0 16px 0;line-height:1.2;letter-spacing:1px}
      #nespresso-welcome-offer .offer-text{font-family:"NespressoLucas",Helvetica,Arial,sans-serif;font-size:16px;color:#17171A;margin:0 0 10px 0;line-height:1.5;max-width:400px}
      #nespresso-welcome-offer .cta-container{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px}
      #nespresso-welcome-offer .cta-btn{display:inline-flex;align-items:center;text-decoration:none;padding:16px;border-radius:50px;font-family:"NespressoLucas",Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1px;transition:all 0.3s ease;justify-content:center;min-width:180px}
      #nespresso-welcome-offer .cta-primary{background:#17171A;color:white}
      #nespresso-welcome-offer .cta-secondary{background:#fff;color:#17171A;border:1px solid #17171A}
      #nespresso-welcome-offer .cta-arrow{margin-left:8px;font-size:16px}
      #nespresso-welcome-offer .condicoesOferta{font-size:13px}
      #nespresso-welcome-offer .linkCondicoesOfertaMaes{color:#17171A;text-decoration:underline;cursor:pointer}
      #nespresso-welcome-offer .linkCondicoesOfertaMaes:hover{text-decoration:none}
      #nespresso-welcome-offer .strongOfferNewUsers{font-weight:700}
      #block-8831360456181,#block-8833590121973{display:none}
      @media (max-width:768px){
        #nespresso-welcome-offer{margin:30px auto;padding:0 16px}
        #nespresso-welcome-offer .offer-container{flex-direction:column;min-height:auto}
        #nespresso-welcome-offer .offer-content{text-align:center}
        #nespresso-welcome-offer .offer-title{font-size:24px}
        #nespresso-welcome-offer .offer-text{max-width:none}
        #nespresso-welcome-offer .offer-image img{border-radius:8px 8px 0px 0px}
        #nespresso-welcome-offer .cta-container{justify-content:center}
        #nespresso-welcome-offer .cta-btn{min-width:160px}
      }
      @media (max-width:480px){
        #nespresso-welcome-offer{margin:20px auto;padding:0 12px}
        #nespresso-welcome-offer .offer-container{border-radius:12px}
        #nespresso-welcome-offer .offer-content{padding:24px 16px 20px 16px}
        #nespresso-welcome-offer .offer-title{font-size:20px;margin-bottom:12px}
        #nespresso-welcome-offer .offer-text{font-size:14px;margin-bottom:24px}
        #nespresso-welcome-offer .cta-btn{padding:14px 28px;min-width:140px}
        #nespresso-welcome-offer .cta-container{flex-direction:column;align-items:center}
      }
      @media (min-width:820px) and (max-width:1129px){
        #nespresso-welcome-offer{display:none !important}
        #block-8831360456181{display:block}
      }
      .nespresso-welcome-offer-modal *{font-family:NespressoLucas,Helvetica,Arial,sans-serif}
      .nespresso-welcome-offer-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:2000;display:none}
      .nespresso-welcome-offer-modal-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);cursor:pointer}
      .nespresso-welcome-offer-modal-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background-color:#fff;border-radius:8px;max-width:90%;width:550px;max-height:90vh;box-shadow:0 5px 15px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden}
      .nespresso-welcome-offer-modal-header{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid #e5e5e5;background-color:#f8f8f8}
      .nespresso-welcome-offer-modal-header h3{font-size:18px;margin:0;color:#17171A;font-weight:bold}
      .nespresso-welcome-offer-modal-close{border:none;background:none;cursor:pointer;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;transition:opacity 0.2s ease}
      .nespresso-welcome-offer-modal-close:hover{opacity:0.7}
      .nespresso-welcome-offer-modal-close svg{width:18px;height:18px;color:#666}
      .nespresso-welcome-offer-modal-content{padding:20px;overflow-y:auto;max-height:calc(70vh - 60px);line-height:1.5}
      .nespresso-welcome-offer-modal-termos{font-size:14px;color:#333}
      @media (max-width:480px){
        .nespresso-welcome-offer-modal-container{width:95%}
        .nespresso-welcome-offer-modal-content{padding:15px}
        .nespresso-welcome-offer-modal-header{padding:12px 15px}
      }
    </style>`;

    // Cria o HTML do componente
    const componenteHTML =
      `
      <section id="nespresso-welcome-offer">
        <div class="offer-container">
          <div class="offer-image">
            <img src="` +
      CONFIG.imagemCafes +
      `" alt="` +
      CONFIG.altImagem +
      `" />
          </div>
          <div class="offer-content">
            <h2 class="offer-title">` +
      CONFIG.titulo +
      `</h2>
            <p class="offer-text">` +
      CONFIG.subtitulo +
      `<br><span class="condicoesOferta">*Oferta válida apenas para novos membros. <a href="#" class="linkCondicoesOfertaMaes" id="nespresso-welcome-offer-ver-condicoes-link">Consulte condições.</a></span></p>
            <div class="cta-container">` +
      ctasHTML +
      `</div>
          </div>
        </div>
      </section>
    `;

    // Insere o CSS e o componente após o elemento alvo
    targetElement.insertAdjacentHTML("afterend", cssStyles + componenteHTML);

    // Configura os eventos dos CTAs de forma otimizada
    requestAnimationFrame(() => {
      document
        .querySelectorAll("#nespresso-welcome-offer .cta-btn")
        .forEach(function (e) {
          e.addEventListener("click", function () {
            sendGAEvent(e.getAttribute("id"));
          });
        });

      // Cria o modal e configura eventos
      criarModal();
      configurarEventosModal();
    });

    return true; // Sucesso na criação
  }

  // Sistema de execução otimizada
  function executarComunicacao() {
    // Tenta criar imediatamente
    if (tentarCriarComunicacao()) {
      return; // Sucesso, para aqui
    }

    // Se não conseguiu, usa requestAnimationFrame para a próxima repintura
    function tentarNaProximaFrame() {
      if (tentarCriarComunicacao()) {
        return; // Sucesso
      }
      // Se ainda não conseguiu, tenta novamente após um frame
      requestAnimationFrame(tentarNaProximaFrame);
    }

    requestAnimationFrame(tentarNaProximaFrame);

    // Fallback de segurança - tenta a cada 50ms por até 5 segundos
    let tentativas = 0;
    const maxTentativas = 100; // 50ms * 100 = 5 segundos

    const interval = setInterval(() => {
      tentativas++;
      if (tentarCriarComunicacao() || tentativas >= maxTentativas) {
        clearInterval(interval);
      }
    }, 50);
  }

  // Inicia o pré-carregamento da imagem imediatamente
  preloadImage();

  // Execução otimizada baseada no estado atual do documento
  if (document.readyState === "loading") {
    // Se ainda está carregando, executa assim que o HTML básico for parseado
    document.addEventListener("DOMContentLoaded", executarComunicacao);
  } else if (document.readyState === "interactive") {
    // HTML foi carregado, mas recursos ainda podem estar carregando
    // Executa imediatamente mas de forma assíncrona
    setTimeout(executarComunicacao, 0);
  } else {
    // Documento já está completamente carregado
    executarComunicacao();
  }

  // Backup adicional para garantir execução
  setTimeout(executarComunicacao, 100);
})();
