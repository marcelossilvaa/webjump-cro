(function () {
  // 1. Injeta os estilos
  const style = document.createElement("style");
  style.textContent = `
    .vantagens-background {
        width: 100%;
        position: absolute;
        left: 0;
        right: 0;
        height: 280px;
        z-index: -1;
    }
    .vantagens-container {
        margin: 0 auto;
        position: relative;
        max-width: 1280px;
    }
    .vantagens-titulo {
        color: #041e42;
        font-size: 56px;
        text-align: left;
        font-weight: 600;
        position: relative;
        z-index: 1;
        text-align: center;
    }
        .vantagens-subtitulo {
          color: #041e42;
        font-size: 16px;
        margin-bottom: 32px;
        text-align: left;
        font-weight: 400;
        position: relative;
        z-index: 1;
        text-align: center;
        margin-top: 16px;
        }
    .vantagens-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        position: relative;
        z-index: 1;
    }
    .vantagem-card {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
        text-decoration: none;
        transition: transform 0.3s ease;
    }
    .container-img {
        position: relative;
        
    }
    .container-img-span {
        position: absolute;
        bottom: 14px;
        right: 14px;
        background-color: white;
        padding: 5px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-family: Helvetica Neue, Arial !important;
        color: #041e41;
        font-weight: 600;
        font-size: 12px;
    }
    .vantagem-card:hover {
        transform: translateY(-5px);
    }
    .vantagem-imagem {
        width: 100%;
        height: 340px;
        object-fit: cover;
        border-radius: 10px 10px 0px 0px;
    }
    .img-desktop { display: block; }
    .img-mobile  { display: none; }
    .vantagem-conteudo {
        padding: 20px;
    }
    .vantagem-titulo {
        color: #353535;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
    }
    .vantagem-descricao {
        color: #666666;
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 15px;
    }
   .vantagem-link {
        color: #026CB6;
        font-size: 14px;
        text-decoration: underline;
        display: flex;
        align-items: center;
    }
  
    .eJJekz { display: none; }

    @media (max-width: 768px) {
        .vantagens-container { padding: 20px; }
        .vantagens-background {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: -1; height: 100%;
        }
        .vantagens-grid { grid-template-columns: 1fr; padding: 0 15px; }
        .vantagens-titulo {
            font-size: 24px;
            padding: 0 15px;
            font-family: Helvetica Neue, Arial !important;
            text-align: center;
        }
        .vantagem-card {
            display: flex; flex-direction: column; background: transparent;
        }
        .container-img { width: 100%; }
        .img-desktop { display: none; }
        .img-mobile  { display: block; }
        .vantagem-imagem {
            width: 100%; height: 180px; border-radius: 10px 10px 0px 0px;
        }
        .vantagem-conteudo {
            padding: 15px;
            background-color: #ffffffff;
            border-radius: 0px 0px 10px 10px;
        }
        .vantagem-titulo {
            font-size: 18px;
            margin-bottom: 5px;
            font-family: Helvetica Neue, Arial !important;
        }
    
        .vantagem-descricao {
            font-size: 14px;
            margin-bottom: 10px;
        }
        .container-img-span {
            font-size: 12px;
            padding: 4px 16px;
            bottom: 10px;
            right: 10px;
        }
    }
  `;
  document.head.appendChild(style);

  // 2. Cria o container do bloco
  const bloco = document.createElement("div");
  bloco.innerHTML = `
    <div class="vantagens-container">
      <div class="vantagens-background"></div>
      <h2 class="vantagens-titulo">Vantagens Azul para você</h2>
      <h3 class="vantagens-subtitulo">Transforme sua viagem com benefícios exclusivos da Azul</h2>
      <div class="vantagens-grid">
        <a href="https://passagens.voeazul.com.br/pt/buscador-de-precos" class="vantagem-card">
          <div class="container-img">
            <span class="container-img-span">Compare preços</span>
            <img src="https://i.imgur.com/SmG34ZH.png" alt="Buscador de Preços" class="vantagem-imagem img-desktop">
            <img src="https://i.imgur.com/SmG34ZH.png" alt="Buscador de Preços" class="vantagem-imagem img-mobile">
          </div>
          <div class="vantagem-conteudo">
            <h3 class="vantagem-titulo">Buscador de Preços</h3>
            <p class="vantagem-descricao">Planeje sua viagem com opções que cabem no bolso.</p>
            <span class="vantagem-link">Saiba mais</span>
          </div>
        </a>
        <a href="https://www.azulviagens.com.br/" class="vantagem-card">
          <div class="container-img">
            <span class="container-img-span">Conheça nossos pacotes</span>
            <img src="https://i.imgur.com/z8IWGzl.png" alt="Viagem Completa" class="vantagem-imagem img-desktop">
            <img src="https://i.imgur.com/z8IWGzl.png" alt="Viagem Completa" class="vantagem-imagem img-mobile">
          </div>
          <div class="vantagem-conteudo">
            <h3 class="vantagem-titulo">Viagem Completa</h3>
            <p class="vantagem-descricao">Descubra o mundo com uma experiência completa da Azul.</p>
            <span class="vantagem-link">Saiba mais</span>
          </div>
        </a>
        <a href="https://www.voeazul.com.br/br/pt/ofertas" class="vantagem-card">
        <div class="container-img">
        <span class="container-img-span">Ofertas Azul</span>
        <img src="https://i.imgur.com/CTkGKcW.png" alt="Ofertas Azul" class="vantagem-imagem img-desktop">
        <img src="https://i.imgur.com/CTkGKcW.png" alt="Ofertas Azul" class="vantagem-imagem img-mobile">
        </div>
        <div class="vantagem-conteudo">
        <h3 class="vantagem-titulo">Aproveite as ofertas</h3>
        <p class="vantagem-descricao">Confira as melhores ofertas para sua próxima viagem.</p>
        <span class="vantagem-link">Saiba mais</span>
        </div>
        </a>

        <a href="https://www.voeazul.com.br/br/pt/sua-viagem/experiencia-azul" class="vantagem-card">
          <div class="container-img">
            <span class="container-img-span">Viaje com conforto</span>
            <img src="https://i.imgur.com/MH73EUf.png" alt="Experiência Azul" class="vantagem-imagem img-desktop">
            <img src="https://i.imgur.com/MH73EUf.png" alt="Experiência Azul" class="vantagem-imagem img-mobile">
          </div>
          <div class="vantagem-conteudo">
            <h3 class="vantagem-titulo">Experiência Azul</h3>
            <p class="vantagem-descricao">Cuidado e conforto em cada detalhe da sua viagem.</p>
            <span class="vantagem-link">Saiba mais</span>
          </div>
        </a>
      </div>
    </div>
  `;

  // 3. Função para inserir o bloco acima do target
  let tentativas = 0;
  function inserirAcima() {
    const alvo = document.querySelector("#__next > section > div:nth-child(8)");
    if (alvo) {
      alvo.parentNode.insertBefore(bloco, alvo);
      bindAnalyticsEvents();
    } else if (tentativas < 20) {
      tentativas++;
      setTimeout(inserirAcima, 300);
    }
  }

  // 4. Função que faz o bind dos cliques nos cards
  function bindAnalyticsEvents() {
    bloco.querySelectorAll(".vantagem-card").forEach((card) => {
      const label = card.querySelector(".vantagem-titulo").textContent.trim();

      card.addEventListener("click", () => {
        var s =
          window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
        if (!s || typeof s.tl !== "function") return;

        // === Disparo Adobe Analytics ===
        s.linkTrackVars = "events,eVar82";
        s.linkTrackEvents = "event90";
        s.events = "event90";
        s.eVar82 = "AT_bloco_de_vantagens: " + label; // título do card
        s.tl(true, "o", "target_activity_action");
      });
    });
  }

  // 4. Dispara a inserção
  inserirAcima();
})();
