(function () {
  'use strict';

  const EXPERIMENT_NAME = 'AT_XT_PILARES_ESTRATEGICOS';
  const STYLE_ID = 'at-pilares-style';
  const COMPONENT_ID = 'at-pilares-azul';
  const CONTEXT = 'home_pilares_estrategicos';
  const DATA_LISTENER = 'data-at-pilares-listener';
  const TARGET_PATHS = ['/br/pt/home', '/br/pt/', '/'];
  const AUTOPLAY_MS = 7000;
  const TRANSICAO_MS = 1000;
  const MAX_TENTATIVAS = 40;
  const INTERVALO_TENTATIVA = 500;

  const ICONE_AVIAO =
    '<svg viewBox="0 0 1024 1024" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M636.6 374.6L764.5 333.8C854.1 305.4 983.6 415.1 811.4 469.8L254.7 645.8C254.3 645.9 253.9 646 253.4 646.1 225 654.2 170.8 669.6 155.9 613.4L141.7 559.9C125.7 504.6 107.9 429.4 188.3 479.8L228.7 504.7 454.8 432.6 290.1 297.1C241.5 253.9 269.4 162.6 336.4 201.3L636.6 374.6Z" fill="currentColor"></path>' +
    '<path d="M160 800H864V832H160V800Z" fill="currentColor"></path>' +
    '</svg>';

  const ICONE_SETA_ESQUERDA =
    '<svg viewBox="0 0 1024 1024" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M133.9 527.8C126 518.8 126 505.2 133.9 496.2L364.9 232.2C373.7 222.2 388.8 221.2 398.8 229.9 408.8 238.7 409.8 253.8 401.1 263.8L204.9 488 872 488C885.3 488 896 498.7 896 512 896 525.3 885.3 536 872 536L204.9 536 401.1 760.2C409.8 770.2 408.8 785.3 398.8 794.1 388.8 802.8 373.7 801.8 364.9 791.8L133.9 527.8Z" fill="currentColor"></path>' +
    '</svg>';

  const ICONE_SETA_DIREITA =
    '<svg viewBox="0 0 1024 1024" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M890.1 496.2C898 505.2 898 518.8 890.1 527.8L659.1 791.8C650.3 801.8 635.2 802.8 625.2 794.1 615.2 785.3 614.2 770.2 622.9 760.2L819.1 536 152 536C138.7 536 128 525.3 128 512 128 498.7 138.7 488 152 488L819.1 488 622.9 263.8C614.2 253.8 615.2 238.7 625.2 229.9 635.2 221.2 650.3 222.2 659.1 232.2L890.1 496.2Z" fill="currentColor"></path>' +
    '</svg>';

  // Imagens do DAM da Azul (todas validadas com resposta 200).
  // Assets ideais para o palco: 1600x900. Substituir por arte dedicada quando o time de design publicar.
  const PILARES = [
    {
      id: 'internacional',
      numero: '01',
      nome: 'Internacional',
      destaque: 'Europa e Estados Unidos',
      titulo: 'O mundo inteiro com o jeito Azul de voar',
      descricao:
        'São 10 destinos internacionais em 7 países, com mais capacidade widebody para Europa e Estados Unidos e a nova cabine Azul Comfort.',
      destinos: ['Lisboa (LIS)', 'Porto (OPO)', 'Madrid (MAD)', 'Orlando (MCO)', 'Fort Lauderdale (FLL)'],
      selo: 'Até 12x no Cartão Azul Itaú ou 5% off no Pix',
      ctaTexto: 'Ver voos internacionais',
      ctaLink: 'https://passagens.voeazul.com.br/pt',
      imagem: 'https://www.voeazul.com.br/content/dam/azul/folder/experiencia-azul/img_economyxtra.png',
    },
    {
      id: 'rotas-domesticas',
      numero: '02',
      nome: 'Rotas Domésticas',
      destaque: 'Norte, Nordeste e Centro-Oeste',
      titulo: '132 destinos no Brasil saindo de perto de você',
      descricao:
        'As rotas troncais de maior frequência da Azul conectando os polos turísticos mais buscados do país, do Norte ao Sul.',
      destinos: ['Recife (REC)', 'Salvador (SSA)', 'Brasília (BSB)', 'Cuiabá (CGB)', 'Porto Alegre (POA)'],
      selo: 'Malha com 300 rotas diretas',
      ctaTexto: 'Descobrir rotas',
      ctaLink: 'https://passagens.voeazul.com.br/pt',
      imagem: 'https://www.voeazul.com.br/content/dam/azul/promocoes/Bras%C3%ADlia.png',
    },
    {
      id: 'ecoturismo',
      numero: '03',
      nome: 'Ecoturismo',
      destaque: 'Natureza, cachoeiras e cultura',
      titulo: 'A natureza brasileira cresce 30% ao ano. Voe para ela',
      descricao:
        'Cachoeiras, pantanal, chapadas e praias preservadas nos aeroportos da malha Azul, com roteiros de natureza e cultura.',
      destinos: [
        'Bonito (BYO)',
        'Chapada dos Guimarães (CGB)',
        'Jalapão (PMW)',
        'Chapada dos Veadeiros (BSB)',
        'Ilha do Mel (CWB)',
      ],
      selo: 'Viajantes aceitam pagar +21% por experiências sustentáveis',
      ctaTexto: 'Explorar ecoturismo',
      ctaLink: 'https://www.azulviagens.com.br/',
      imagem: 'https://www.voeazul.com.br/content/dam/voe-azul/destinos/card-bonito.png',
    },
    {
      id: 'praias-ferias',
      numero: '04',
      nome: 'Praias e Férias',
      destaque: 'Verão, réveillon e alta temporada',
      titulo: 'O verão 2026/2027 começa na sua próxima reserva',
      descricao:
        'As praias mais procuradas por região com o aeroporto Azul mais próximo. Réveillon, férias de janeiro e alta temporada no mesmo lugar.',
      destinos: [
        'Porto de Galinhas (REC)',
        'Maragogi (MCZ)',
        'Fernando de Noronha (FEN)',
        'Florianópolis (FLN)',
        'Jericoacoara (JJD)',
      ],
      selo: 'Aéreo + hotel com Azul Viagens',
      ctaTexto: 'Ver pacotes de verão',
      ctaLink: 'https://www.azulviagens.com.br/',
      imagem: 'https://www.voeazul.com.br/content/dam/voe-azul/destinos/card-porto-de-galinhas.png',
    },
  ];

  let indiceAtivo = 0;
  let emTransicao = false;
  let autoplayTimer = null;
  let autoplayPausado = false;
  let tentativas = 0;
  let tentativaTimer = null;
  let arrastando = false;
  let arrasteInicioX = 0;
  const refs = {};

  // Nao aborta cedo: injetar() reposiciona se a secao estiver no lugar errado.
  window[EXPERIMENT_NAME] = true;

  function movimentoReduzido() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function naPaginaAlvo() {
    if (window.AT_PILARES_FORCE === true) return true;
    const caminho = window.location.pathname || '';
    for (let i = 0; i < TARGET_PATHS.length; i++) {
      if (caminho === TARGET_PATHS[i]) return true;
    }
    return caminho.indexOf('/home') !== -1;
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[AT Pilares] Parametro ausente para evento analytics.');
      return;
    }

    const tipo = eventType || 'click';
    const labelEvent = EXPERIMENT_NAME + '_' + tipo + ' ' + eventLabel;
    console.log('[AT Pilares] Analytics event disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = CONTEXT;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getCss() {
    return [
      '#' + COMPONENT_ID + ',#' + COMPONENT_ID + ' *{',
      '  font-family:"Helvetica Neue",Arial,sans-serif;',
      '  box-sizing:border-box;',
      '}',
      '#' + COMPONENT_ID + '{',
      '  display:block !important;',
      '  position:relative !important;',
      '  float:none !important;',
      '  clear:both !important;',
      '  inset:auto !important;',
      '  top:auto !important;',
      '  left:auto !important;',
      '  right:auto !important;',
      '  bottom:auto !important;',
      '  transform:none !important;',
      '  width:100% !important;',
      '  max-width:100% !important;',
      '  height:auto !important;',
      '  margin:0 !important;',
      '  padding:40px 0 !important;',
      '  overflow:visible !important;',
      '  z-index:2;',
      '  isolation:isolate;',
      '}',
      '#' + COMPONENT_ID + ' .atPilares__wrapper{',
      '  position:relative;',
      '  width:100%;',
      '  max-width:1280px;',
      '  margin:0 auto;',
      '  padding:0 24px;',
      '}',
      '#' + COMPONENT_ID + ' .atPilares__cabecalho{',
      '  position:relative;',
      '  margin:0 0 20px 0;',
      '}',
      '#' + COMPONENT_ID + ' .atPilares__cabecalho h2{',
      '  margin:0 0 6px 0;',
      '  font-size:28px;',
      '  line-height:1.2;',
      '  font-weight:700;',
      '  color:rgb(1,78,132);',
      '}',
      '#' + COMPONENT_ID + ' .atPilares__cabecalho p{',
      '  margin:0;',
      '  font-size:16px;',
      '  line-height:1.5;',
      '  color:rgba(1,78,132,0.75);',
      '}',
      '#' + COMPONENT_ID + ' .atPilares__palco{',
      '  position:relative;',
      '  height:clamp(560px,54vw,660px);',
      '  border-radius:24px;',
      '  overflow:hidden;',
      '  background:linear-gradient(63deg, rgb(0,19,32) 0%, rgb(0,29,70) 50%, rgb(1,43,105) 100%);',
      '  box-shadow:0 24px 60px rgba(0,19,32,0.18);',
      '}',
      '.atPilares__fundo{position:absolute;inset:0;overflow:hidden;}',
      '.atPilares__fundoItem{',
      '  position:absolute;',
      '  inset:0;',
      '  background-position:center;',
      '  background-size:cover;',
      '  background-repeat:no-repeat;',
      '  opacity:0;',
      '  transform:scale(1.04);',
      '  transition:opacity 700ms ease, transform 8000ms linear;',
      // Os assets do DAM sao pequenos (ate 400px de largura): o desfoque leve evita
      // que a ampliacao no palco fique pixelada.
      '  filter:blur(2px) saturate(1.05);',
      '}',
      '.atPilares__fundoItem.--ativo{opacity:1;transform:scale(1.1);}',
      '.atPilares__fundoItem.--semImagem{',
      '  background:linear-gradient(63deg, rgb(0,19,32) 0%, rgb(0,29,70) 50%, rgb(1,43,105) 100%);',
      '}',
      '.atPilares__veu{',
      '  position:absolute;',
      '  inset:0;',
      '  z-index:2;',
      '  background:linear-gradient(90deg, rgba(0,19,32,0.95) 0%, rgba(0,25,56,0.86) 32%, rgba(1,43,105,0.55) 62%, rgba(1,43,105,0.12) 100%),',
      '    linear-gradient(180deg, rgba(0,19,32,0.4) 0%, rgba(0,19,32,0) 42%, rgba(0,19,32,0.6) 100%);',
      '}',
      '.atPilares__grade{',
      '  position:relative;',
      '  z-index:3;',
      '  height:100%;',
      '  display:grid;',
      '  grid-template-columns:minmax(320px,44%) 1fr;',
      '}',
      '.atPilares__texto{',
      '  display:flex;',
      '  flex-direction:column;',
      '  justify-content:center;',
      '  gap:16px;',
      '  padding:56px 24px 130px 48px;',
      '}',
      '.atPilares__texto>*{opacity:1;transform:none;}',
      '.atPilares__texto.--trocando>*{opacity:0;transform:translateY(-12px);transition:opacity 200ms ease, transform 200ms ease;}',
      '.atPilares__texto.--anima>*{animation:atPilaresEntra 620ms cubic-bezier(0.22,1,0.36,1) both;}',
      '@keyframes atPilaresEntra{',
      '  0%{opacity:0;transform:translateY(28px);}',
      '  100%{opacity:1;transform:translateY(0);}',
      '}',
      '.atPilares__eyebrow{',
      '  display:flex;',
      '  align-items:center;',
      '  gap:12px;',
      '  font-size:13px;',
      '  letter-spacing:0.18em;',
      '  text-transform:uppercase;',
      '  color:rgba(255,255,255,0.85);',
      '}',
      '.atPilares__eyebrow::before{',
      '  content:"";',
      '  display:block;',
      '  width:28px;',
      '  height:2px;',
      '  background:rgb(255,255,255);',
      '}',
      '.atPilares__titulo{',
      '  margin:0;',
      '  font-size:clamp(30px,3.3vw,52px);',
      '  line-height:1.06;',
      '  font-weight:700;',
      '  color:rgb(255,255,255);',
      '  max-width:520px;',
      '}',
      '.atPilares__descricao{',
      '  margin:0;',
      '  font-size:16px;',
      '  line-height:1.55;',
      '  color:rgba(255,255,255,0.85);',
      '  max-width:460px;',
      '}',
      '.atPilares__chips{',
      '  display:flex;',
      '  flex-wrap:wrap;',
      '  gap:8px;',
      '  max-width:480px;',
      '}',
      '.atPilares__chip{',
      '  display:inline-flex;',
      '  align-items:center;',
      '  padding:6px 12px;',
      '  border:1px solid rgba(255,255,255,0.35);',
      '  border-radius:999px;',
      '  background:rgba(255,255,255,0.1);',
      '  font-size:12px;',
      '  line-height:1.2;',
      '  color:rgb(255,255,255);',
      '}',
      '.atPilares__selo{',
      '  display:flex;',
      '  align-items:center;',
      '  gap:10px;',
      '  font-size:13px;',
      '  color:rgba(255,255,255,0.9);',
      '}',
      '.atPilares__selo svg{width:22px;height:22px;flex:0 0 auto;color:rgb(255,255,255);}',
      '.atPilares__acoes{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:8px;}',
      '.atPilares__cta{',
      '  display:inline-flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  gap:8px;',
      '  height:48px;',
      '  padding:0 24px;',
      '  border-radius:8px;',
      '  border:1px solid rgb(255,255,255);',
      '  background:rgb(255,255,255);',
      '  color:rgb(2,108,182);',
      '  font-size:15px;',
      '  font-weight:700;',
      '  text-decoration:none;',
      '  cursor:pointer;',
      '  transition:background 250ms ease, transform 250ms ease;',
      '}',
      '.atPilares__cta:hover{background:rgba(255,255,255,0.86);transform:translateY(-2px);}',
      '.atPilares__ctaSecundario{',
      '  font-size:14px;',
      '  color:rgb(255,255,255);',
      '  text-decoration:underline;',
      '  cursor:pointer;',
      '}',
      '.atPilares__ctaSecundario:hover{color:rgba(255,255,255,0.8);}',
      '.atPilares__trilhoArea{',
      '  position:relative;',
      '  display:flex;',
      '  align-items:flex-end;',
      '  padding:0 0 130px 0;',
      '  overflow:hidden;',
      '}',
      '.atPilares__trilho{',
      '  display:flex;',
      '  gap:16px;',
      '  padding-right:24px;',
      '  will-change:transform;',
      '}',
      '.atPilares__card{',
      '  position:relative;',
      '  flex:0 0 auto;',
      '  width:176px;',
      '  height:244px;',
      '  padding:0;',
      '  border:none;',
      '  border-radius:16px;',
      '  overflow:hidden;',
      '  background:rgb(1,43,105);',
      '  box-shadow:0 18px 40px rgba(0,19,32,0.4);',
      '  cursor:pointer;',
      '  text-align:left;',
      '  transition:transform 300ms ease, box-shadow 300ms ease, opacity 300ms ease;',
      '}',
      '.atPilares__card:hover{transform:translateY(-8px);box-shadow:0 26px 52px rgba(0,19,32,0.5);}',
      '.atPilares__card:focus-visible{outline:2px solid rgb(255,255,255);outline-offset:3px;}',
      '.atPilares__card.--saindo{',
      '  opacity:0;',
      '  transform:translateY(12px) scale(0.96);',
      '  transition:opacity 480ms ease, transform 480ms ease;',
      '  pointer-events:none;',
      '}',
      '.atPilares__card.--entrando{',
      '  opacity:0;',
      '  transform:translateY(52px) scale(0.94);',
      '  pointer-events:none;',
      '}',
      '.atPilares__card.--entrando.--visivel{',
      '  opacity:1;',
      '  transform:translateY(0) scale(1);',
      '  transition:opacity 680ms cubic-bezier(0.22,1,0.36,1), transform 680ms cubic-bezier(0.22,1,0.36,1);',
      '  pointer-events:auto;',
      '}',
      '@keyframes atPilaresCardSobe{',
      '  0%{opacity:0;transform:translateY(52px) scale(0.94);}',
      '  100%{opacity:1;transform:translateY(0) scale(1);}',
      '}',
      '.atPilares__cardImagem{',
      '  position:absolute;',
      '  inset:0;',
      '  background-position:center;',
      '  background-size:cover;',
      '  background-repeat:no-repeat;',
      '}',
      '.atPilares__cardImagem.--semImagem{',
      '  background:linear-gradient(160deg, rgb(0,29,70) 0%, rgb(2,108,182) 100%);',
      '}',
      '.atPilares__cardVeu{',
      '  position:absolute;',
      '  inset:0;',
      '  background:linear-gradient(180deg, rgba(0,19,32,0) 30%, rgba(0,19,32,0.85) 100%);',
      '}',
      '.atPilares__cardTag{',
      '  position:absolute;',
      '  top:12px;',
      '  left:12px;',
      '  padding:4px 10px;',
      '  border-radius:999px;',
      '  background:rgba(255,255,255,0.92);',
      '  color:rgb(4,30,66);',
      '  font-size:11px;',
      '  font-weight:700;',
      '  letter-spacing:0.04em;',
      '}',
      '.atPilares__cardInfo{position:absolute;left:14px;right:14px;bottom:14px;}',
      '.atPilares__cardNumero{',
      '  display:block;',
      '  margin-bottom:2px;',
      '  font-size:11px;',
      '  letter-spacing:0.16em;',
      '  color:rgba(255,255,255,0.8);',
      '}',
      '.atPilares__cardTitulo{',
      '  display:block;',
      '  font-size:17px;',
      '  line-height:1.15;',
      '  font-weight:700;',
      '  color:rgb(255,255,255);',
      '}',
      '.atPilares__rodape{',
      '  position:absolute;',
      '  z-index:4;',
      '  left:48px;',
      '  right:48px;',
      '  bottom:32px;',
      '  display:flex;',
      '  align-items:center;',
      '  gap:24px;',
      '}',
      '.atPilares__navegacao{display:flex;gap:10px;flex:0 0 auto;}',
      '.atPilares__botao{',
      '  display:grid;',
      '  place-items:center;',
      '  width:44px;',
      '  height:44px;',
      '  padding:0;',
      '  border-radius:50%;',
      '  border:1px solid rgba(255,255,255,0.5);',
      '  background:rgba(255,255,255,0.12);',
      '  color:rgb(255,255,255);',
      '  cursor:pointer;',
      '  transition:background 250ms ease, color 250ms ease, border-color 250ms ease;',
      '}',
      '.atPilares__botao svg{width:20px;height:20px;}',
      '.atPilares__botao:hover{background:rgb(255,255,255);color:rgb(4,30,66);border-color:rgb(255,255,255);}',
      '.atPilares__botao:focus-visible{outline:2px solid rgb(255,255,255);outline-offset:3px;}',
      '.atPilares__progresso{',
      '  flex:1 1 auto;',
      '  max-width:520px;',
      '  height:3px;',
      '  border-radius:2px;',
      '  background:rgba(255,255,255,0.25);',
      '  overflow:hidden;',
      '}',
      '.atPilares__progressoBarra{',
      '  display:block;',
      '  width:0;',
      '  height:100%;',
      '  background:rgb(255,255,255);',
      '}',
      '.atPilares__contador{',
      '  flex:0 0 auto;',
      '  display:flex;',
      '  align-items:baseline;',
      '  gap:2px;',
      '  color:rgb(255,255,255);',
      '  margin-left:auto;',
      '}',
      '.atPilares__contadorAtual{font-size:34px;font-weight:700;line-height:1;}',
      '.atPilares__contadorTotal{font-size:15px;color:rgba(255,255,255,0.7);}',
      '@media (max-width:1024px){',
      '  #' + COMPONENT_ID + '{padding:24px 0;}',
      '  .atPilares__wrapper{padding:0 16px;}',
      '  .atPilares__palco{height:auto;border-radius:20px;}',
      '  .atPilares__grade{grid-template-columns:1fr;grid-template-rows:auto auto;}',
      '  .atPilares__texto{padding:32px 20px 20px 20px;gap:14px;}',
      '  .atPilares__titulo{max-width:none;}',
      '  .atPilares__descricao{max-width:none;font-size:15px;}',
      '  .atPilares__trilhoArea{padding:0 0 104px 20px;}',
      '  .atPilares__trilho{gap:12px;padding-right:20px;}',
      '  .atPilares__card{width:140px;height:196px;}',
      '  .atPilares__cardTitulo{font-size:15px;}',
      '  .atPilares__rodape{left:20px;right:20px;bottom:24px;gap:14px;}',
      '  .atPilares__botao{width:40px;height:40px;}',
      '  .atPilares__contadorAtual{font-size:26px;}',
      '  .atPilares__cta{width:100%;}',
      '  .atPilares__acoes{gap:14px;}',
      '}',
      '@media (prefers-reduced-motion: reduce){',
      '  .atPilares__fundoItem,.atPilares__card,.atPilares__cta{transition-duration:1ms;}',
      '  .atPilares__fundoItem.--ativo{transform:scale(1);}',
      '  .atPilares__texto.--anima>*{animation-duration:1ms;}',
      '  .atPilares__card.--entrando,.atPilares__card.--entrando.--visivel{',
      '    opacity:1;transform:none;transition-duration:1ms;',
      '  }',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);
  }

  function criarElemento(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto) el.textContent = texto;
    return el;
  }

  function aplicarImagem(elemento, url) {
    elemento.classList.add('--semImagem');
    if (!url) return;
    const imagem = new Image();
    imagem.onload = function () {
      elemento.style.backgroundImage = 'url("' + url + '")';
      elemento.classList.remove('--semImagem');
    };
    imagem.onerror = function () {
      console.log('[AT Pilares] Imagem indisponivel, aplicando fundo institucional:', url);
    };
    imagem.src = url;
  }

  function ordemTrilho(indice) {
    const ordem = [];
    for (let i = 1; i < PILARES.length; i++) {
      ordem.push((indice + i) % PILARES.length);
    }
    return ordem;
  }

  function criarCard(indice) {
    const pilar = PILARES[indice];
    const card = criarElemento('button', 'atPilares__card');
    card.type = 'button';
    card.setAttribute('data-indice', String(indice));
    card.setAttribute('aria-label', 'Ver pilar ' + pilar.numero + ' ' + pilar.nome);

    const imagem = criarElemento('span', 'atPilares__cardImagem');
    aplicarImagem(imagem, pilar.imagem);
    card.appendChild(imagem);
    card.appendChild(criarElemento('span', 'atPilares__cardVeu'));
    card.appendChild(criarElemento('span', 'atPilares__cardTag', 'Pilar ' + pilar.numero));

    const info = criarElemento('span', 'atPilares__cardInfo');
    info.appendChild(criarElemento('span', 'atPilares__cardNumero', pilar.destaque));
    info.appendChild(criarElemento('span', 'atPilares__cardTitulo', pilar.nome));
    card.appendChild(info);

    if (!card.getAttribute(DATA_LISTENER)) {
      card.setAttribute(DATA_LISTENER, 'true');
      card.addEventListener('click', function () {
        const alvo = parseInt(card.getAttribute('data-indice'), 10);
        if (isNaN(alvo) || alvo === indiceAtivo) return;
        analyticsEvent('card_' + PILARES[alvo].id, 'click');
        irPara(alvo);
      });
    }

    return card;
  }

  function renderTrilho() {
    const trilho = refs.trilho;
    trilho.style.transition = 'none';
    trilho.style.transform = 'translateX(0)';
    trilho.innerHTML = '';
    const ordem = ordemTrilho(indiceAtivo);
    for (let i = 0; i < ordem.length; i++) {
      trilho.appendChild(criarCard(ordem[i]));
    }
  }

  function medidaCard() {
    const card = refs.trilho.querySelector('.atPilares__card');
    if (!card) return 192;
    const espacamento = parseFloat(window.getComputedStyle(refs.trilho).columnGap) || 16;
    return card.getBoundingClientRect().width + espacamento;
  }

  function limparEstadoTrilho() {
    const trilho = refs.trilho;
    trilho.style.transition = 'none';
    trilho.style.transform = 'translateX(0)';
    void trilho.offsetWidth;
  }

  function animarEntradaCard(card) {
    if (!card) return;
    card.classList.add('--entrando');
    void card.offsetWidth;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        card.classList.add('--visivel');
      });
    });
    window.setTimeout(function () {
      card.classList.remove('--entrando');
      card.classList.remove('--visivel');
    }, 720);
  }

  // Atualiza o trilho sem zerar o DOM: o card que sai some, o novo sobe no final.
  function atualizarTrilhoSuave(destino, direcao, aoFinalizar) {
    const trilho = refs.trilho;
    const cards = trilho.querySelectorAll('.atPilares__card');
    const passo = medidaCard();
    const indiceAnterior = indiceAtivo;

    if (!cards.length || movimentoReduzido()) {
      indiceAtivo = destino;
      renderTrilho();
      if (typeof aoFinalizar === 'function') aoFinalizar();
      return;
    }

    if (direcao === 'proximo') {
      const cardSaindo = cards[0];
      const cardEntrante = criarCard(indiceAnterior);
      cardEntrante.classList.add('--entrando');
      trilho.appendChild(cardEntrante);

      if (cardSaindo) cardSaindo.classList.add('--saindo');

      void trilho.offsetWidth;
      trilho.style.transition = 'transform ' + TRANSICAO_MS + 'ms cubic-bezier(0.62,0.02,0.34,1)';
      trilho.style.transform = 'translateX(-' + passo + 'px)';

      window.setTimeout(function () {
        animarEntradaCard(cardEntrante);
      }, Math.max(180, TRANSICAO_MS - 360));

      window.setTimeout(function () {
        if (cardSaindo && cardSaindo.parentNode) cardSaindo.parentNode.removeChild(cardSaindo);
        limparEstadoTrilho();
        if (typeof aoFinalizar === 'function') aoFinalizar();
      }, TRANSICAO_MS);
      return;
    }

    // Anterior: o card ativo sobe no inicio e o ultimo (novo fundo) sai.
    const cardSaindo = cards[cards.length - 1];
    const cardEntrante = criarCard(indiceAnterior);
    cardEntrante.classList.add('--entrando');
    trilho.insertBefore(cardEntrante, trilho.firstChild);
    limparEstadoTrilho();
    trilho.style.transform = 'translateX(-' + passo + 'px)';
    void trilho.offsetWidth;

    if (cardSaindo) cardSaindo.classList.add('--saindo');

    trilho.style.transition = 'transform ' + TRANSICAO_MS + 'ms cubic-bezier(0.62,0.02,0.34,1)';
    trilho.style.transform = 'translateX(0)';

    window.setTimeout(function () {
      animarEntradaCard(cardEntrante);
    }, Math.max(180, TRANSICAO_MS - 360));

    window.setTimeout(function () {
      if (cardSaindo && cardSaindo.parentNode) cardSaindo.parentNode.removeChild(cardSaindo);
      limparEstadoTrilho();
      if (typeof aoFinalizar === 'function') aoFinalizar();
    }, TRANSICAO_MS);
  }

  function renderTexto(anima) {
    const pilar = PILARES[indiceAtivo];
    const texto = refs.texto;
    texto.innerHTML = '';

    texto.appendChild(criarElemento('span', 'atPilares__eyebrow', 'Pilar ' + pilar.numero + ' · ' + pilar.nome));
    texto.appendChild(criarElemento('h3', 'atPilares__titulo', pilar.titulo));
    texto.appendChild(criarElemento('p', 'atPilares__descricao', pilar.descricao));

    const chips = criarElemento('div', 'atPilares__chips');
    for (let i = 0; i < pilar.destinos.length; i++) {
      chips.appendChild(criarElemento('span', 'atPilares__chip', pilar.destinos[i]));
    }
    texto.appendChild(chips);

    if (pilar.selo) {
      const selo = criarElemento('div', 'atPilares__selo');
      const icone = criarElemento('span', 'atPilares__seloIcone');
      icone.innerHTML = ICONE_AVIAO;
      selo.appendChild(icone.firstChild);
      selo.appendChild(criarElemento('span', '', pilar.selo));
      texto.appendChild(selo);
    }

    const acoes = criarElemento('div', 'atPilares__acoes');
    const cta = criarElemento('a', 'atPilares__cta', pilar.ctaTexto);
    cta.href = pilar.ctaLink;
    cta.setAttribute('target', '_blank');
    cta.setAttribute('rel', 'noopener');
    cta.addEventListener('click', function () {
      analyticsEvent('cta_' + pilar.id, 'click');
    });
    acoes.appendChild(cta);

    const secundario = criarElemento('a', 'atPilares__ctaSecundario', 'Ver todos os destinos');
    secundario.href = 'https://www.voeazul.com.br/br/pt/sobreazul/mapa-de-rotas';
    secundario.setAttribute('target', '_blank');
    secundario.setAttribute('rel', 'noopener');
    secundario.addEventListener('click', function () {
      analyticsEvent('cta_secundario_' + pilar.id, 'click');
    });
    acoes.appendChild(secundario);
    texto.appendChild(acoes);

    const filhos = texto.children;
    for (let i = 0; i < filhos.length; i++) {
      filhos[i].style.animationDelay = i * 70 + 'ms';
    }

    if (anima) {
      texto.classList.remove('--anima');
      void texto.offsetWidth;
      texto.classList.add('--anima');
    }
  }

  function renderContador() {
    refs.contadorAtual.textContent = PILARES[indiceAtivo].numero;
    refs.contadorTotal.textContent = '/' + String(PILARES.length).padStart(2, '0');
  }

  // Quando a troca vem da animacao do card expandido, o fundo precisa aparecer sem
  // crossfade para nao piscar a imagem anterior por baixo do clone.
  function atualizarFundo(imediato) {
    const itens = refs.fundo.children;
    for (let i = 0; i < itens.length; i++) {
      if (imediato) {
        itens[i].style.transition = 'opacity 1ms linear, transform 8000ms linear';
      }
      if (i === indiceAtivo) {
        itens[i].classList.add('--ativo');
      } else {
        itens[i].classList.remove('--ativo');
      }
    }

    if (!imediato) return;
    window.setTimeout(function () {
      for (let i = 0; i < itens.length; i++) {
        itens[i].style.transition = '';
      }
    }, 120);
  }

  function reiniciarProgresso() {
    const barra = refs.progressoBarra;
    barra.style.transition = 'none';
    barra.style.width = '0';
    void barra.offsetWidth;
    if (autoplayPausado || movimentoReduzido()) return;
    barra.style.transition = 'width ' + AUTOPLAY_MS + 'ms linear';
    barra.style.width = '100%';
  }

  function pararAutoplay() {
    if (autoplayTimer) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function agendarAutoplay() {
    pararAutoplay();
    if (autoplayPausado || movimentoReduzido()) return;
    autoplayTimer = window.setTimeout(function () {
      irPara((indiceAtivo + 1) % PILARES.length);
    }, AUTOPLAY_MS);
  }

  function pausarAutoplay() {
    autoplayPausado = true;
    pararAutoplay();
    refs.progressoBarra.style.transition = 'none';
  }

  function retomarAutoplay() {
    autoplayPausado = false;
    reiniciarProgresso();
    agendarAutoplay();
  }

  function suportaRevelacao() {
    return !!(
      window.CSS &&
      typeof window.CSS.supports === 'function' &&
      window.CSS.supports('clip-path', 'inset(0px 0px 0px 50%)')
    );
  }

  // O fundo do novo pilar entra em cortina, pelo mesmo lado em que o trilho de cards
  // desliza. Nada se sobrepoe ao texto e nada cresce em direcao ao usuario.
  function revelarFundo(direcao, destino, aoFinalizar) {
    const item = refs.fundo.children[destino];
    const recorteInicial =
      direcao === 'anterior' ? 'inset(0px 100% 0px 0px)' : 'inset(0px 0px 0px 100%)';

    item.style.transition = 'opacity 1ms linear, transform 8000ms linear';
    item.style.zIndex = '1';
    item.style.clipPath = recorteInicial;
    item.classList.add('--ativo');
    void item.offsetWidth;

    const finalizar = function () {
      item.style.clipPath = '';
      item.style.zIndex = '';
      if (typeof aoFinalizar === 'function') aoFinalizar();
    };

    if (typeof item.animate !== 'function') {
      finalizar();
      return;
    }

    const animacao = item.animate(
      [
        { clipPath: recorteInicial, opacity: 0.35, offset: 0 },
        { clipPath: 'inset(0px 0px 0px 0px)', opacity: 1, offset: 1 },
      ],
      { duration: TRANSICAO_MS, easing: 'cubic-bezier(0.62,0.02,0.34,1)', fill: 'forwards' }
    );

    animacao.onfinish = finalizar;
    animacao.oncancel = finalizar;
  }

  function irPara(indiceDestino) {
    if (emTransicao || indiceDestino === indiceAtivo) return;
    const total = PILARES.length;
    const destino = ((indiceDestino % total) + total) % total;
    const cardOrigem = refs.trilho.querySelector('.atPilares__card[data-indice="' + destino + '"]');

    emTransicao = true;
    pararAutoplay();
    refs.progressoBarra.style.transition = 'none';
    refs.progressoBarra.style.width = '0';

    refs.texto.classList.remove('--anima');
    refs.texto.classList.add('--trocando');

    const ehAnterior = destino === (indiceAtivo - 1 + total) % total;
    const ehProximo = destino === (indiceAtivo + 1) % total;
    const direcaoTrilho = ehAnterior ? 'anterior' : 'proximo';

    const trocarConteudo = function () {
      indiceAtivo = destino;
      renderTexto(true);
      refs.texto.classList.remove('--trocando');
      renderContador();
    };

    const concluir = function () {
      if (indiceAtivo !== destino) trocarConteudo();
      atualizarFundo(true);
      // Garante ordem correta apos saltos (clique em card nao adjacente).
      if (!ehAnterior && !ehProximo) {
        renderTrilho();
        const cards = refs.trilho.querySelectorAll('.atPilares__card');
        if (cards.length) animarEntradaCard(cards[cards.length - 1]);
      }
      emTransicao = false;
      reiniciarProgresso();
      agendarAutoplay();
    };

    const semAnimacao = movimentoReduzido() || !suportaRevelacao();

    if (semAnimacao) {
      indiceAtivo = destino;
      renderTexto(false);
      refs.texto.classList.remove('--trocando');
      renderContador();
      atualizarFundo(true);
      renderTrilho();
      emTransicao = false;
      reiniciarProgresso();
      agendarAutoplay();
      return;
    }

    window.setTimeout(trocarConteudo, 260);
    revelarFundo(ehAnterior ? 'anterior' : 'proximo', destino, function () {
      // o trilho ja concluiu ou esta concluindo em paralelo
    });

    if (ehAnterior || ehProximo) {
      atualizarTrilhoSuave(destino, direcaoTrilho, concluir);
      return;
    }

    // Clique em card no meio do trilho: some o escolhido e sobe o novo no final.
    if (cardOrigem) cardOrigem.classList.add('--saindo');
    window.setTimeout(concluir, TRANSICAO_MS);
  }

  function criarSecao() {
    const secao = criarElemento('section', 'atPilares');
    secao.id = COMPONENT_ID;

    const wrapper = criarElemento('div', 'atPilares__wrapper');
    const cabecalho = criarElemento('div', 'atPilares__cabecalho');
    cabecalho.appendChild(criarElemento('h2', '', 'Quatro caminhos para a sua próxima viagem'));
    cabecalho.appendChild(
      criarElemento('p', '', 'Internacional, rotas domésticas, ecoturismo e praias: escolha por onde começar.')
    );
    wrapper.appendChild(cabecalho);

    const palco = criarElemento('div', 'atPilares__palco');
    palco.setAttribute('role', 'region');
    palco.setAttribute('aria-roledescription', 'carrossel');
    palco.setAttribute('aria-label', 'Pilares estratégicos Azul');
    palco.tabIndex = 0;

    const fundo = criarElemento('div', 'atPilares__fundo');
    for (let i = 0; i < PILARES.length; i++) {
      const item = criarElemento('div', 'atPilares__fundoItem');
      aplicarImagem(item, PILARES[i].imagem);
      fundo.appendChild(item);
    }
    palco.appendChild(fundo);
    palco.appendChild(criarElemento('div', 'atPilares__veu'));

    const grade = criarElemento('div', 'atPilares__grade');
    const texto = criarElemento('div', 'atPilares__texto');
    texto.setAttribute('aria-live', 'polite');
    const trilhoArea = criarElemento('div', 'atPilares__trilhoArea');
    const trilho = criarElemento('div', 'atPilares__trilho');
    trilhoArea.appendChild(trilho);
    grade.appendChild(texto);
    grade.appendChild(trilhoArea);
    palco.appendChild(grade);

    const rodape = criarElemento('div', 'atPilares__rodape');
    const navegacao = criarElemento('div', 'atPilares__navegacao');
    const anterior = criarElemento('button', 'atPilares__botao');
    anterior.type = 'button';
    anterior.setAttribute('aria-label', 'Pilar anterior');
    anterior.innerHTML = ICONE_SETA_ESQUERDA;
    const proximo = criarElemento('button', 'atPilares__botao');
    proximo.type = 'button';
    proximo.setAttribute('aria-label', 'Próximo pilar');
    proximo.innerHTML = ICONE_SETA_DIREITA;
    navegacao.appendChild(anterior);
    navegacao.appendChild(proximo);

    const progresso = criarElemento('div', 'atPilares__progresso');
    const progressoBarra = criarElemento('span', 'atPilares__progressoBarra');
    progresso.appendChild(progressoBarra);

    const contador = criarElemento('div', 'atPilares__contador');
    const contadorAtual = criarElemento('span', 'atPilares__contadorAtual');
    const contadorTotal = criarElemento('span', 'atPilares__contadorTotal');
    contador.appendChild(contadorAtual);
    contador.appendChild(contadorTotal);

    rodape.appendChild(navegacao);
    rodape.appendChild(progresso);
    rodape.appendChild(contador);
    palco.appendChild(rodape);

    wrapper.appendChild(palco);
    secao.appendChild(wrapper);

    refs.secao = secao;
    refs.palco = palco;
    refs.fundo = fundo;
    refs.texto = texto;
    refs.trilho = trilho;
    refs.anterior = anterior;
    refs.proximo = proximo;
    refs.progressoBarra = progressoBarra;
    refs.contadorAtual = contadorAtual;
    refs.contadorTotal = contadorTotal;

    return secao;
  }

  function registrarEventos() {
    refs.anterior.addEventListener('click', function () {
      const destino = (indiceAtivo - 1 + PILARES.length) % PILARES.length;
      analyticsEvent('seta_anterior_' + PILARES[destino].id, 'click');
      irPara(destino);
    });

    refs.proximo.addEventListener('click', function () {
      const destino = (indiceAtivo + 1) % PILARES.length;
      analyticsEvent('seta_proximo_' + PILARES[destino].id, 'click');
      irPara(destino);
    });

    refs.palco.addEventListener('mouseenter', pausarAutoplay);
    refs.palco.addEventListener('mouseleave', retomarAutoplay);
    refs.palco.addEventListener('focusin', pausarAutoplay);
    refs.palco.addEventListener('focusout', function (evento) {
      if (refs.palco.contains(evento.relatedTarget)) return;
      retomarAutoplay();
    });

    refs.palco.addEventListener('keydown', function (evento) {
      if (evento.key === 'ArrowRight') {
        evento.preventDefault();
        analyticsEvent('teclado_proximo', 'click');
        irPara((indiceAtivo + 1) % PILARES.length);
      }
      if (evento.key === 'ArrowLeft') {
        evento.preventDefault();
        analyticsEvent('teclado_anterior', 'click');
        irPara((indiceAtivo - 1 + PILARES.length) % PILARES.length);
      }
    });

    refs.palco.addEventListener(
      'touchstart',
      function (evento) {
        if (!evento.touches || !evento.touches.length) return;
        arrastando = true;
        arrasteInicioX = evento.touches[0].clientX;
        pausarAutoplay();
      },
      { passive: true }
    );

    refs.palco.addEventListener(
      'touchend',
      function (evento) {
        if (!arrastando) return;
        arrastando = false;
        const fim = evento.changedTouches && evento.changedTouches.length
          ? evento.changedTouches[0].clientX
          : arrasteInicioX;
        const delta = fim - arrasteInicioX;
        if (Math.abs(delta) > 50) {
          const passo = delta < 0 ? 1 : -1;
          const destino = (indiceAtivo + passo + PILARES.length) % PILARES.length;
          analyticsEvent('swipe_' + PILARES[destino].id, 'click');
          irPara(destino);
        }
        retomarAutoplay();
      },
      { passive: true }
    );

    if (typeof IntersectionObserver === 'function') {
      const observador = new IntersectionObserver(
        function (entradas) {
          for (let i = 0; i < entradas.length; i++) {
            if (entradas[i].isIntersecting) {
              if (!refs.secao.getAttribute('data-at-pilares-view')) {
                refs.secao.setAttribute('data-at-pilares-view', 'true');
                analyticsEvent('secao_pilares_estrategicos', 'view');
              }
              retomarAutoplay();
            } else {
              pausarAutoplay();
            }
          }
        },
        { threshold: 0.35 }
      );
      observador.observe(refs.secao);
    } else {
      analyticsEvent('secao_pilares_estrategicos', 'view');
      retomarAutoplay();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        pausarAutoplay();
      } else {
        retomarAutoplay();
      }
    });
  }

  function contemTexto(no, trecho) {
    if (!no) return false;
    const texto = (no.textContent || '').replace(/\s+/g, ' ');
    return texto.indexOf(trecho) !== -1;
  }

  function temBannerHome(no) {
    if (!no || !no.querySelector) return false;
    return !!no.querySelector(
      'img[src*="/content/dam/voe-azul/cross/banners-home/"], img[src*="bnr-passagens-"], img[src*="bnr-adesao-"]'
    );
  }

  // Bloco "Vamos viajar juntos" — irmao seguinte aos banners na home.
  function encontrarSecaoVamosViajar() {
    let noTitulo = null;
    const candidatos = document.querySelectorAll('h1, h2, h3, p');
    for (let i = 0; i < candidatos.length; i++) {
      const txt = (candidatos[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (txt.indexOf('Vamos viajar juntos') !== -1) {
        noTitulo = candidatos[i];
        break;
      }
    }
    if (!noTitulo) return null;

    let atual = noTitulo;
    while (atual.parentElement && atual.parentElement !== document.body) {
      const pai = atual.parentElement;
      if (pai.tagName === 'MAIN') break;

      const irmaos = pai.children;
      for (let i = 0; i < irmaos.length; i++) {
        if (irmaos[i] === atual) continue;
        if (temBannerHome(irmaos[i])) return atual;
      }

      if (temBannerHome(pai) && atual !== noTitulo) return atual;
      atual = pai;
    }
    return atual;
  }

  // Menor container do carrossel de banners (nao sobe ate o main).
  function encontrarBlocoBannersHome() {
    const ancora = document.querySelector(
      'img[src*="/content/dam/voe-azul/cross/banners-home/"], img[src*="bnr-passagens-preview"], img[src*="bnr-adesao-preview"]'
    );
    if (!ancora) return null;

    let atual = ancora.parentElement;
    while (atual && atual !== document.body && atual.tagName !== 'MAIN') {
      if (contemTexto(atual, 'Vamos viajar juntos')) break;

      const qtd = atual.querySelectorAll(
        'img[src*="/content/dam/voe-azul/cross/banners-home/"], img[src*="bnr-passagens-"], img[src*="bnr-adesao-"]'
      ).length;

      if (qtd >= 4) return atual;
      atual = atual.parentElement;
    }
    return null;
  }

  function encontrarAlvo() {
    // 1) Ideal: imediatamente antes de "Vamos viajar juntos" (= abaixo dos banners).
    const vamos = encontrarSecaoVamosViajar();
    if (vamos && vamos.parentElement) {
      return { tipo: 'antes', no: vamos };
    }

    // 2) Fallback: depois do menor bloco de banners.
    const banners = encontrarBlocoBannersHome();
    if (banners && banners.parentElement) {
      return { tipo: 'depois', no: banners };
    }

    // 3) Fallback preview local.
    const preview = document.querySelector('[data-preview-banners="true"]');
    if (preview) return { tipo: 'depois', no: preview };

    return null;
  }

  function injetarNoAlvo(secao, alvo) {
    if (!alvo || !alvo.no || !alvo.no.parentElement) return false;

    if (alvo.tipo === 'depois') {
      alvo.no.insertAdjacentElement('afterend', secao);
      return true;
    }

    if (alvo.tipo === 'antes') {
      alvo.no.insertAdjacentElement('beforebegin', secao);
      return true;
    }

    return false;
  }

  function estaNoLugarCerto(secao, alvo) {
    if (!secao || !alvo || !alvo.no) return false;
    if (alvo.tipo === 'antes') return secao.nextElementSibling === alvo.no;
    if (alvo.tipo === 'depois') return secao.previousElementSibling === alvo.no;
    return false;
  }

  function injetar() {
    const existente = document.getElementById(COMPONENT_ID);
    if (existente) {
      const alvoAtual = encontrarAlvo();
      if (alvoAtual && !estaNoLugarCerto(existente, alvoAtual)) {
        existente.parentNode.removeChild(existente);
      } else {
        return true;
      }
    }

    const alvo = encontrarAlvo();
    if (!alvo) return false;

    injectStyles();
    const secao = criarSecao();
    if (!injetarNoAlvo(secao, alvo)) return false;

    renderTexto(false);
    renderTrilho();
    renderContador();
    atualizarFundo(false);
    registrarEventos();
    console.log('[AT Pilares] Secao injetada no fluxo da home (abaixo dos banners).');
    return true;
  }

  function tentarInjetar() {
    if (injetar()) return;
    tentativas++;
    if (tentativas >= MAX_TENTATIVAS) {
      console.log('[AT Pilares] Alvo de injecao nao encontrado apos as tentativas.');
      return;
    }
    tentativaTimer = window.setTimeout(tentarInjetar, INTERVALO_TENTATIVA);
  }

  function init() {
    if (!naPaginaAlvo()) {
      console.log('[AT Pilares] Pagina fora do escopo do experimento.');
      return;
    }
    if (tentativaTimer) window.clearTimeout(tentativaTimer);
    tentarInjetar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
