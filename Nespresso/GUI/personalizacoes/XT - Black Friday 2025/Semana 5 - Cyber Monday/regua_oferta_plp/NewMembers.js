(function () {
  // Evita múltiplas execuções
  if (window.nespressoFixedBanner) return;
  window.nespressoFixedBanner = true;

  const MOBILE_TEXT = "OFERTA PROGRESSIVA <strong>CYBER MONDAY</strong>";

  // Push para GTM
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

  // Função para enviar eventos GA
  function sendGAEvent(label) {
    window.gtmDataObject = window.gtmDataObject || [];
    gtmDataObject.push({
      event: "local_event",
      event_raised_by: "br",
      local_event_category: "user engagement",
      local_event_action: "click",
      local_event_label: label,
    });
  }

  // Configuração dos níveis de presente
  const giftTiers = [
    {
      threshold: 50,
      gift: "R$ 60 OFF",
      shortName: "R$ 60 OFF",
      displayName: "GANHE R$60",
    },
    {
      threshold: 150,
      gift: "R$ 100 OFF",
      shortName: "R$ 100 OFF",
      displayName: "GANHE R$100",
    },
    {
      threshold: 250,
      gift: "R$ 170 OFF",
      shortName: "R$ 170 OFF",
      displayName: "GANHE R$170",
    },
    {
      threshold: 350,
      gift: "R$ 250 OFF",
      shortName: "R$ 250 OFF",
      displayName: "GANHE R$250",
    },
  ];

  let currentCapsuleCount = 0;
  let isMinimized = false;

  function criarModal() {
    if (
      document.getElementById("nespresso-welcome-offer-modal-termos-condicoes")
    )
      return;

    const modalElement = document.createElement("div");
    modalElement.className = "nespresso-welcome-offer-modal";
    modalElement.id = "nespresso-welcome-offer-modal-termos-condicoes";
    modalElement.style.display = "none";

    modalElement.innerHTML =
      '\
      <div class="nespresso-welcome-offer-modal-overlay"></div>\
      <div class="nespresso-welcome-offer-modal-container">\
        <div class="nespresso-welcome-offer-modal-header">\
          <button class="nespresso-welcome-offer-modal-close">\
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
              <line x1="18" y1="6" x2="6" y2="18"></line>\
              <line x1="6" y1="6" x2="18" y2="18"></line>\
            </svg>\
          </button>\
        </div>\
        <div class="nespresso-welcome-offer-modal-content">\
          <div class="nespresso-welcome-offer-modal-termos">\
            <strong>TERMOS E CONDIÇÕES</strong><br>\
            <strong>OFERTA DE BLACK FRIDAY</strong><br><br>\
            <p><strong>a.</strong><br>*Oferta exclusiva e válida por tempo limitado de 31/10/2025 às 09h a 01/12/2025, sujeita a alterações sem aviso prévio. Compre a partir de 60 cápsulas da linha Original e/ou Vertuo e ganhe um desconto fixo de R$50,00. Essa oferta é intransferível e não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitada a um uso por CPF de registro na <strong>Nespresso</strong>.<br>Ao finalizar seu pedido, confirme se o desconto foi aplicado em seu pedido. Faça seu pedido através do site <a href="https://www.nespresso.com" target="_blank">Nespresso.com</a>, aplicativo <strong>Nespresso</strong>, telefone <strong>0800 7777 737</strong> (ligações gratuitas – segunda a sábado, das 6h às 22h), WhatsApp <a href="https://t.br.nespresso.com/r/?id=h175d9c2,5978dd61,584facd2" target="_blank">(11) 95578-4670</a> ou nas Boutiques <strong>Nespresso</strong>.<br>Confira os termos e condições referentes a esta oferta em <a href="https://www.nespresso.com/br/pt/termos-condicoes" target="_blank">www.nespresso.com/br/pt/termos-condicoes</a>. Imagens meramente ilustrativas.<br>Você recebeu esse e-mail por ser um Cliente <strong>Nespresso</strong>. Para cancelar o recebimento das novidades da <strong>Nespresso</strong> via e-mail, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7e&p1=unsubscribe.nespresso.com/br/pt/signout.html?cmp=BR18426_b2c_emkt_offer_festive_december26_27_28_29_nnaraujoke&t=425224312431383139393824504224323032322D31322D3238&c=313738393733&p2=1472453625&p3=1472453625" target="_blank">envie aqui sua solicitação</a>. Caso tenha dúvidas, por favor, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7f&p1=1472453625&p2=1472453625" target="_blank">consulte aqui</a> as perguntas mais frequentes ou entre em contato com um de nossos Especialistas, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d80&p1=1472453625&p2=1472453625" target="_blank">enviando um e-mail por esse link</a>.</p>\
            <p><strong>b.</strong><br>*Oferta exclusiva e válida por tempo limitado de 31/10/2025 às 09h a 01/12/2025, sujeita a alterações sem aviso prévio. Compre a partir de 150 cápsulas da linha Original e/ou Vertuo e ganhe um desconto fixo de R$100,00. Essa oferta é intransferível e não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitada a um uso por CPF de registro na <strong>Nespresso</strong>.<br>Ao finalizar seu pedido, confirme se o desconto foi aplicado em seu pedido. Faça seu pedido através do site <a href="https://www.nespresso.com" target="_blank">Nespresso.com</a>, aplicativo <strong>Nespresso</strong>, telefone <strong>0800 7777 737</strong> (ligações gratuitas – segunda a sábado, das 6h às 22h), WhatsApp <a href="https://t.br.nespresso.com/r/?id=h175d9c2,5978dd61,584facd2" target="_blank">(11) 95578-4670</a> ou nas Boutiques <strong>Nespresso</strong>.<br>Confira os termos e condições referentes a esta oferta em <a href="https://www.nespresso.com/br/pt/termos-condicoes" target="_blank">www.nespresso.com/br/pt/termos-condicoes</a>. Imagens meramente ilustrativas.<br>Você recebeu esse e-mail por ser um Cliente <strong>Nespresso</strong>. Para cancelar o recebimento das novidades da <strong>Nespresso</strong> via e-mail, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7e&p1=unsubscribe.nespresso.com/br/pt/signout.html?cmp=BR18426_b2c_emkt_offer_festive_december26_27_28_29_nnaraujoke&t=425224312431383139393824504224323032322D31322D3238&c=313738393733&p2=1472453625&p3=1472453625" target="_blank">envie aqui sua solicitação</a>. Caso tenha dúvidas, por favor, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7f&p1=1472453625&p2=1472453625" target="_blank">consulte aqui</a> as perguntas mais frequentes ou entre em contato com um de nossos Especialistas, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d80&p1=1472453625&p2=1472453625" target="_blank">enviando um e-mail por esse link</a>.</p>\
            <p><strong>c.</strong><br>*Oferta exclusiva e válida por tempo limitado de 31/10/2025 às 09h a 01/12/2025, sujeita a alterações sem aviso prévio. Compre a partir de 250 cápsulas da linha Original e/ou Vertuo e ganhe um desconto fixo de R$170,00. Essa oferta é intransferível e não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitada a um uso por CPF de registro na <strong>Nespresso</strong>.<br>Ao finalizar seu pedido, confirme se o desconto foi aplicado em seu pedido. Faça seu pedido através do site <a href="https://www.nespresso.com" target="_blank">Nespresso.com</a>, aplicativo <strong>Nespresso</strong>, telefone <strong>0800 7777 737</strong> (ligações gratuitas – segunda a sábado, das 6h às 22h), WhatsApp <a href="https://t.br.nespresso.com/r/?id=h175d9c2,5978dd61,584facd2" target="_blank">(11) 95578-4670</a> ou nas Boutiques <strong>Nespresso</strong>.<br>Confira os termos e condições referentes a esta oferta em <a href="https://www.nespresso.com/br/pt/termos-condicoes" target="_blank">www.nespresso.com/br/pt/termos-condicoes</a>. Imagens meramente ilustrativas.<br>Você recebeu esse e-mail por ser um Cliente <strong>Nespresso</strong>. Para cancelar o recebimento das novidades da <strong>Nespresso</strong> via e-mail, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7e&p1=unsubscribe.nespresso.com/br/pt/signout.html?cmp=BR18426_b2c_emkt_offer_festive_december26_27_28_29_nnaraujoke&t=425224312431383139393824504224323032322D31322D3238&c=313738393733&p2=1472453625&p3=1472453625" target="_blank">envie aqui sua solicitação</a>. Caso tenha dúvidas, por favor, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7f&p1=1472453625&p2=1472453625" target="_blank">consulte aqui</a> as perguntas mais frequentes ou entre em contato com um de nossos Especialistas, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d80&p1=1472453625&p2=1472453625" target="_blank">enviando um e-mail por esse link</a>.</p>\
            <p><strong>d.</strong><br>*Oferta exclusiva e válida por tempo limitado de 31/10/2025 às 09h a 01/12/2025, sujeita a alterações sem aviso prévio. Compre a partir de 350 cápsulas da linha Original e/ou Vertuo e ganhe um desconto fixo de R$250,00. Essa oferta é intransferível e não se aplica para pessoas jurídicas com histórico de compras de cápsulas da linha profissional, bem como para outros clientes portadores de CNPJ, não cumulativas com outras ofertas em andamento e limitada a um uso por CPF de registro na <strong>Nespresso</strong>.<br>Ao finalizar seu pedido, confirme se o desconto foi aplicado em seu pedido. Faça seu pedido através do site <a href="https://www.nespresso.com" target="_blank">Nespresso.com</a>, aplicativo <strong>Nespresso</strong>, telefone <strong>0800 7777 737</strong> (ligações gratuitas – segunda a sábado, das 6h às 22h), WhatsApp <a href="https://t.br.nespresso.com/r/?id=h175d9c2,5978dd61,584facd2" target="_blank">(11) 95578-4670</a> ou nas Boutiques <strong>Nespresso</strong>.<br>Confira os termos e condições referentes a esta oferta em <a href="https://www.nespresso.com/br/pt/termos-condicoes" target="_blank">www.nespresso.com/br/pt/termos-condicoes</a>. Imagens meramente ilustrativas.<br>Você recebeu esse e-mail por ser um Cliente <strong>Nespresso</strong>. Para cancelar o recebimento das novidades da <strong>Nespresso</strong> via e-mail, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7e&p1=unsubscribe.nespresso.com/br/pt/signout.html?cmp=BR18426_b2c_emkt_offer_festive_december26_27_28_29_nnaraujoke&t=425224312431383139393824504224323032322D31322D3238&c=313738393733&p2=1472453625&p3=1472453625" target="_blank">envie aqui sua solicitação</a>. Caso tenha dúvidas, por favor, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d7f&p1=1472453625&p2=1472453625" target="_blank">consulte aqui</a> as perguntas mais frequentes ou entre em contato com um de nossos Especialistas, <a href="http://www.emailing.nespresso.com/r/?id=h2f4a8216,57c3dbf9,55f64d80&p1=1472453625&p2=1472453625" target="_blank">enviando um e-mail por esse link</a>.</p>\
            </div>\
        </div>\
      </div>';

    document.body.appendChild(modalElement);
    return modalElement;
  }

  function configurarEventosModal() {
    const modal = document.getElementById(
      "nespresso-welcome-offer-modal-termos-condicoes"
    );
    const verCondicoesLink = document.querySelector(
      "#nespresso-fixed-banner .nespresso-termos-condicoes-regua-flutuante"
    );
    if (!modal || !verCondicoesLink) return;

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

    const newVerCondicoesLink = verCondicoesLink.cloneNode(true);
    verCondicoesLink.parentNode.replaceChild(
      newVerCondicoesLink,
      verCondicoesLink
    );

    newVerCondicoesLink.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    document.addEventListener(
      "keydown",
      function nespressoWelcomeOfferModalKeyHandler(e) {
        if (e.key === "Escape" && modal.style.display === "block") closeModal();
      }
    );
  }

  // Adiciona estilos
  const addStyles = () => {
    if (document.getElementById("nespresso-fixed-banner-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "nespresso-fixed-banner-styles";
    styleEl.textContent =
      "\
  #nespresso-fixed-banner {\
    position: fixed; bottom: 0; left: 0; right: 0;\
    background: #cbc9c1;\
    box-shadow: 0 -2px 10px rgba(0,0,0,0.15);\
    z-index: 999; font-family: NespressoLucas, sans-serif;\
    transition: transform 0.3s ease-in-out;\
  }\
  #nespresso-fixed-banner.minimized {\
    transform: translateY(calc(100% - 50px)); background-color: transparent; bottom: 0; box-shadow: none;\
  }\
  .nespresso-banner-content { max-width: 1200px; margin: 0 auto; padding: 15px 20px 20px; display: flex; align-items: center; justify-content: center; gap: 40px; }\
  .nespresso-banner-left { display: flex; align-items: center; }\
  .nespresso-banner-text { display: flex; flex-direction: column; gap: 2px; max-width: 400px; text-align: end; }\
  .nespresso-banner-title { font-size: 14px; color: #17171a; margin: 0; font-weight: 500; line-height: 1.3; letter-spacing: .0625rem; }\
  .nespresso-banner-title strong { color: #000000; }\
  .nespresso-banner-main { font-size: 16px; color: #17171a; margin: 0; font-weight: 600; text-align: center; }\
  .nespresso-banner-main strong { color: #514A31; }\
  .nespresso-banner-subtitle { font-size: 10px; color: #17171a; margin: 0; }\
  .nespresso-banner-progress { display: flex; align-items: center; gap: 8px; flex-direction: column; }\
  .nespresso-progress-container { display: flex; align-items: center; gap: 8px; position: relative; }\
  .nespresso-progress-line { width: 80px; height: 4px; background: #fff; border-radius: 2px; position: relative; overflow: hidden; }\
  .nespresso-progress-fill { position: absolute; left: 0; top: 0; height: 100%; background: #514A31; border-radius: 2px; transition: width 0.5s ease-out; }\
  .nespresso-progress-item { display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative; }\
  .nespresso-progress-dot { border-radius: 10px; border: 4px solid #FFF; background: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #000; position: relative; transition: all 0.3s ease; }\
  .nespresso-progress-dot.completed { border-color: #514A31; color: #FFF; background-color: #514A31; }\
  .nespresso-progress-dot.completed p{color: #FFF;}\
  .nespresso-progress-dot img { width: 50px; height: 50px; object-fit: cover; border-radius: 60px; }\
  .nespresso-progress-dot p { text-align: center; font-weight: 700; font-size: 16px; width: 100px; height: 40px; display: flex; justify-content: center; align-items: center; flex-direction: column; color: #000; }\
  .nespresso-progress-dot p span { font-size: 12px; font-weight: 500; }\
  .nespresso-progress-label { font-size: 11px; color: #17171a; font-weight: 500; position: absolute; bottom: -18px; }\
  .nespresso-banner-close { background: none; border: none; font-size: 20px; color: #666; cursor: pointer; padding: 5px; display: flex; align-items: center; justify-content: center; transition: color 0.2s ease; }\
  .nespresso-banner-close:hover { color: #333; }\
  .nespresso-minimized-tab { position: absolute; top: 0; left: 50%; transform: translateX(-50%); color: #fff; padding: 8px 20px; border-radius: 8px 8px 0 0; font-size: 18px; font-weight: 500; cursor: pointer; display: none; transition: all 0.2s ease; background-color: #514A31; text-align: center; }\
  .nespresso-minimized-tab strong { color: #FFF; }\
  #nespresso-fixed-banner.minimized .nespresso-minimized-tab { display: flex; align-items: flex-start; justify-content: center; height: 70px; }\
  #nespresso-fixed-banner.minimized .nespresso-banner-content { opacity: 0; pointer-events: none; }\
  #nespresso-fixed-banner .nespresso-termos-condicoes-regua-flutuante { font-size: 11px; color: #17171a; text-decoration: underline; text-align: right; background: transparent; border: none; }\
  /* Texto apenas para mobile */\
  .only-mobile { display: none; }\
  .only-desktop { display: block; }\
  .nespresso-mobile-text { font-size: 12px; line-height: 1.35; margin: 4px 0 0; color: #17171a; }\
  .nespresso-mobile-text strong { color: #000000; }\
  @media (max-width: 768px) {\
    .only-mobile { display: block; font-weight: 500; }\
    .only-desktop { display: none; }\
    .nespresso-banner-content { flex-direction: column; padding: 12px 15px; gap: 6px; }\
    .nespresso-progress-dot p { font-size: 12px; line-height: 1.1; }\
    .nespresso-progress-dot p span { font-size: 8px; }\
    .nespresso-banner-left { flex-direction: column; width: 100%; gap: 12px; }\
    .nespresso-banner-text { text-align: center; width: 100%; }\
    .nespresso-banner-title { font-size: 12px; }\
    .nespresso-banner-main { display: none; font-size: 14px; }\
    .nespresso-progress-container { justify-content: center; gap: 4px; }\
    .nespresso-progress-line { width: 12px; }\
    .nespresso-progress-dot { width: 70px; height: 40px; font-size: 9px; }\
    .nespresso-progress-dot img { width: 28px; height: 28px; }\
    .nespresso-banner-close { position: absolute; top: 10px; right: 10px; }\
    #nespresso-fixed-banner.minimized { transform: translateY(calc(100% - 40px)); bottom: 5px !important; }\
    .nespresso-minimized-tab { padding: 6px 16px; font-size: 13px; width: 350px; }\
    .nespresso-banner-progress { margin-bottom: 12px; }\
  }\
  @keyframes slideUp { from { transform: translateY(100%);} to { transform: translateY(0);} }\
  #nespresso-fixed-banner.entering { animation: slideUp 0.5s ease-out; }\
  body.checkout #nespresso-fixed-banner, body.cart #nespresso-fixed-banner { display: none; }\
  /* Modal (padrão) */\
  .nespresso-welcome-offer-modal * { font-family: NespressoLucas, Helvetica, Arial, sans-serif; }\
  .nespresso-welcome-offer-modal { position: fixed; top:0; left:0; width:100%; height:100%; z-index:2000; display:none; }\
  .nespresso-welcome-offer-modal-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); cursor:pointer; }\
  .nespresso-welcome-offer-modal-container { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background-color:#fff; border-radius:8px; max-width:90%; width:550px; max-height:90vh; box-shadow:0 5px 15px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden; }\
  .nespresso-welcome-offer-modal-header { display:flex; align-items:center; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #e5e5e5; background-color:#f8f8f8; }\
  .nespresso-welcome-offer-modal-header h3 { font-size:18px; margin:0; color:#17171A; font-weight:bold; }\
  .nespresso-welcome-offer-modal-close { border:none; background:none; cursor:pointer; width:24px; height:24px; padding:0; display:flex; align-items:center; justify-content:center; transition:opacity 0.2s ease; }\
  .nespresso-welcome-offer-modal-close:hover { opacity:0.7; }\
  .nespresso-welcome-offer-modal-close svg { width:18px; height:18px; color:#666; }\
  .nespresso-welcome-offer-modal-content { padding:20px; overflow-y:auto; max-height:calc(70vh - 60px); line-height:1.5; }\
    .nespresso-welcome-offer-modal-termos a { color:#007BFF; text-decoration: underline; }\
  .nespresso-welcome-offer-modal-termos a:hover { color:#0056b3; }\
  .nespresso-welcome-offer-modal-termos { font-size:14px; color:#333; }\
  @media (max-width:480px){\
    .nespresso-welcome-offer-modal-container { width:85%; }\
    .nespresso-welcome-offer-modal-content { padding:15px; }\
    .nespresso-welcome-offer-modal-header { padding:12px 15px; }\
  }";

    document.head.appendChild(styleEl);
  };

  // Verifica se é uma cápsula
  const isCapsule = (product) => {
    return product && product.type === "capsule";
  };

  // Obtém informações do tier atual
  const getTierInfo = (totalCapsules) => {
    if (totalCapsules === 0) {
      return {
        currentTier: null,
        nextTier: giftTiers[0],
        progress: 0,
        capsulesToNextTier: giftTiers[0].threshold,
      };
    }

    let currentTierIndex = -1;
    for (let i = giftTiers.length - 1; i >= 0; i--) {
      if (totalCapsules >= giftTiers[i].threshold) {
        currentTierIndex = i;
        break;
      }
    }

    if (currentTierIndex >= 0) {
      if (currentTierIndex < giftTiers.length - 1) {
        const nextTier = giftTiers[currentTierIndex + 1];
        return {
          currentTier: giftTiers[currentTierIndex],
          nextTier: nextTier,
          progress:
            ((totalCapsules - giftTiers[currentTierIndex].threshold) /
              (nextTier.threshold - giftTiers[currentTierIndex].threshold)) *
            100,
          capsulesToNextTier: nextTier.threshold - totalCapsules,
        };
      } else {
        return {
          currentTier: giftTiers[currentTierIndex],
          nextTier: null,
          progress: 100,
          capsulesToNextTier: 0,
        };
      }
    } else {
      return {
        currentTier: null,
        nextTier: giftTiers[0],
        progress: (totalCapsules / giftTiers[0].threshold) * 100,
        capsulesToNextTier: giftTiers[0].threshold - totalCapsules,
      };
    }
  };

  // Função para gerar HTML dinâmico dos tiers
  const generateProgressHTML = () => {
    let progressHTML = '<span style="font-size: 13px; color: #666;">0</span>';

    giftTiers.forEach((tier, index) => {
      progressHTML +=
        '\
        <div class="nespresso-progress-line">\
          <div class="nespresso-progress-fill" style="width: 0%;"></div>\
        </div>\
        <div class="nespresso-progress-item">\
          <div class="nespresso-progress-dot" data-tier="' +
        index +
        '">\
            <p>' +
        tier.shortName +
        '</p>\
          </div>\
          <span class="nespresso-progress-label">' +
        tier.threshold +
        " cafés</span>\
        </div>";
    });

    return progressHTML;
  };

  // Texto do tab minimizado
  const generateMinimizedTabText = () => {
    const firstTier = giftTiers[0];
    return (
      "Adicione <strong>" +
      firstTier.threshold +
      " cápsulas</strong> para ganhar <strong>" +
      firstTier.shortName +
      "</strong>"
    );
  };

  // Texto do banner principal
  const generateMainBannerText = () => {
    const firstTier = giftTiers[0];
    return (
      "Adicione <strong>" +
      firstTier.threshold +
      " cápsulas</strong> para ganhar: <strong>" +
      firstTier.gift +
      "</strong>"
    );
  };

  // Cria o componente do banner
  const createBanner = () => {
    const existingBanner = document.getElementById("nespresso-fixed-banner");
    if (existingBanner) return existingBanner;

    const banner = document.createElement("div");
    banner.id = "nespresso-fixed-banner";
    banner.className = "entering";

    // Monta bloco de texto mobile somente se houver conteúdo
    var mobileTextBlock = "";
    if (
      MOBILE_TEXT &&
      typeof MOBILE_TEXT === "string" &&
      MOBILE_TEXT.trim() !== ""
    ) {
      mobileTextBlock =
        '<p class="nespresso-mobile-text only-mobile">' + MOBILE_TEXT + "</p>";
    }

    banner.innerHTML =
      '\
        <div class="nespresso-minimized-tab">\
          <p>' +
      generateMinimizedTabText() +
      '</p>\
          <nb-icon icon="24/symbol/chevron-up" aria-hidden="true" class="nb-svg nb-icon lazy-loaded">\
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m12 7.3-8 8v1.4l8-8 8 8v-1.4l-8-8Z"></path></svg>\
          </nb-icon>\
        </div>\
        <div class="nespresso-banner-content">\
          <div class="nespresso-banner-left">\
            <div class="nespresso-banner-text">\
              <p class="nespresso-banner-title only-desktop">\
                OFERTA PROGRESSIVA <br><strong>CYBER MONDAY</strong><br>\
              </p>' +
      mobileTextBlock +
      (window.innerWidth > 768
        ? '<button class="nespresso-termos-condicoes-regua-flutuante">*Confira condições</button>'
        : "") +
      '\
            </div>\
          </div>\
          <div class="nespresso-banner-progress">\
            <p class="nespresso-banner-main">' +
      generateMainBannerText() +
      '</p>\
            <div class="nespresso-progress-container">' +
      generateProgressHTML() +
      '</div>\
          </div>\
          <button class="nespresso-banner-close" aria-label="Minimizar banner">\
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">\
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\
            </svg>\
          </button>' +
      (window.innerWidth <= 768
        ? '<button class="nespresso-termos-condicoes-regua-flutuante" style="align-self: flex-start;">*Confira condições</button>'
        : "") +
      "\
        </div>";

    document.body.appendChild(banner);

    // Event listeners
    const closeBtn = banner.querySelector(".nespresso-banner-close");
    const minimizedTab = banner.querySelector(".nespresso-minimized-tab");

    closeBtn.addEventListener("click", () => {
      isMinimized = true;
      banner.classList.add("minimized");
      sendGAEvent("minimizou_banner_cashback");
    });

    minimizedTab.addEventListener("click", () => {
      isMinimized = false;
      banner.classList.remove("minimized");
      sendGAEvent("expandiu_banner_cashback");
    });

    setTimeout(() => {
      banner.classList.remove("entering");
    }, 500);
    sendGAEvent("exibiu_banner_cashback");

    return banner;
  };

  // Atualiza o banner com as informações do carrinho
  const updateBanner = (totalCapsules) => {
    const banner = document.getElementById("nespresso-fixed-banner");
    if (!banner) return;

    const tierInfo = getTierInfo(totalCapsules);

    // Atualiza o texto principal
    const mainText = banner.querySelector(".nespresso-banner-main");
    if (tierInfo.nextTier) {
      if (totalCapsules !== 0) {
        mainText.innerHTML = "";
        if (tierInfo.currentTier) {
          mainText.innerHTML +=
            "Parabéns, você já garantiu <strong>" +
            tierInfo.currentTier.shortName +
            "</strong>.<br>";
        }
        mainText.innerHTML +=
          "Adicione mais <strong>" +
          tierInfo.capsulesToNextTier +
          " cápsulas</strong> para ganhar: <strong>" +
          tierInfo.nextTier.gift +
          "</strong>";
      } else {
        mainText.innerHTML =
          "Adicione <strong>" +
          tierInfo.nextTier.threshold +
          " cápsulas</strong> para ganhar: <strong>" +
          tierInfo.nextTier.gift +
          "*</strong>";
      }
    } else {
      mainText.innerHTML =
        "<strong>Parabéns!</strong> Você alcançou a oferta máxima!";
    }

    // Atualiza as barras de progresso
    const progressFills = banner.querySelectorAll(".nespresso-progress-fill");

    if (totalCapsules >= giftTiers[0].threshold) {
      progressFills[0].style.width = "100%";
    } else {
      progressFills[0].style.width =
        (totalCapsules / giftTiers[0].threshold) * 100 + "%";
    }

    for (let i = 1; i < giftTiers.length; i++) {
      const currentTier = giftTiers[i];
      const previousTier = giftTiers[i - 1];

      if (totalCapsules >= currentTier.threshold) {
        progressFills[i].style.width = "100%";
      } else if (totalCapsules > previousTier.threshold) {
        const progress =
          ((totalCapsules - previousTier.threshold) /
            (currentTier.threshold - previousTier.threshold)) *
          100;
        progressFills[i].style.width = progress + "%";
      } else {
        progressFills[i].style.width = "0%";
      }
    }

    // Atualiza os dots
    const dots = banner.querySelectorAll(".nespresso-progress-dot");
    dots.forEach((dot, index) => {
      dot.classList.remove("active", "completed");
      if (totalCapsules >= giftTiers[index].threshold) {
        dot.classList.add("completed");
      } else if (index === 0 && totalCapsules < giftTiers[0].threshold) {
        dot.classList.add("active");
      } else if (
        index > 0 &&
        totalCapsules >= giftTiers[index - 1].threshold &&
        totalCapsules < giftTiers[index].threshold
      ) {
        dot.classList.add("active");
      }
    });

    // Atualiza o tab minimizado
    const minimizedTab = banner.querySelector(".nespresso-minimized-tab p");
    if (tierInfo.nextTier) {
      if (totalCapsules !== 0) {
        minimizedTab.innerHTML = "";
        if (tierInfo.currentTier) {
          minimizedTab.innerHTML +=
            "Parabéns, você já garantiu <strong>" +
            tierInfo.currentTier.shortName +
            "</strong>.<br> ";
        }
        minimizedTab.innerHTML +=
          "Faltam <strong>" +
          tierInfo.capsulesToNextTier +
          " cápsulas</strong> para ganhar <strong>" +
          tierInfo.nextTier.shortName +
          "</strong>.";
      } else {
        minimizedTab.innerHTML =
          "Adicione <strong>" +
          tierInfo.nextTier.threshold +
          " cápsulas</strong> para ganhar <strong>" +
          tierInfo.nextTier.shortName +
          "</strong>";
      }
    } else {
      minimizedTab.innerHTML = "Oferta máxima alcançada!";
    }
  };

  // Conta as cápsulas no carrinho
  const countCapsules = async (cartItems) => {
    let capsuleCount = 0;
    try {
      for (const item of cartItems) {
        try {
          const product = await window.napi
            .catalog()
            .getProduct(item.productId);
          if (isCapsule(product)) {
            if (!product.bundled) {
              capsuleCount += item.quantity;
            }
          }
        } catch (productError) {
          console.error("Error fetching product details:", productError);
        }
      }
      currentCapsuleCount = capsuleCount;
      updateBanner(capsuleCount);
    } catch (error) {
      console.error("Error counting capsules:", error);
    }
  };

  // Monitora mudanças no carrinho
  const handleCartUpdate = () => {
    window.napi
      .cart()
      .read()
      .then((data) => {
        if (data.length === 0) {
          currentCapsuleCount = 0;
          updateBanner(0);
        } else {
          countCapsules(data);
        }
      })
      .catch((err) => {
        console.error("Error reading cart:", err);
      });
  };

  // Verifica se está em página de checkout
  const isCheckoutPage = () => {
    const path = window.location.pathname;
    return (
      path.includes("/checkout") ||
      path.includes("/cart") ||
      path.includes("/carrinho")
    );
  };

  // Inicializa o componente
  const init = () => {
    if (isCheckoutPage()) return;

    addStyles();
    createBanner();
    handleCartUpdate();
    criarModal();
    configurarEventosModal();

    // Monitora mudanças no carrinho
    if (window.napi && window.napi.data) {
      window.napi.data().on("cart.update", handleCartUpdate);
    }

    // Monitora mudanças de URL (SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        if (isCheckoutPage()) {
          const banner = document.getElementById("nespresso-fixed-banner");
          if (banner) banner.style.display = "none";
        } else {
          const banner = document.getElementById("nespresso-fixed-banner");
          if (banner && currentCapsuleCount > 0) {
            banner.style.display = "block";
          }
        }
      }
    }).observe(document, { subtree: true, childList: true });
  };

  // Aguarda o carregamento da API Nespresso
  const waitForNapi = setInterval(() => {
    if (window.napi) {
      clearInterval(waitForNapi);
      init();
    }
  }, 500);

  // Timeout de segurança
  setTimeout(() => {
    clearInterval(waitForNapi);
    if (!window.napi) {
      console.error("Nespresso API not available after 10 seconds");
    }
  }, 10000);
})();
