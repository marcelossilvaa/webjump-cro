// V1 Sem Comparativo- Pré Renderização de Tarifas -

(function AzulTariffInjector() {
  'use strict';

  let dadosCapturados = false;

  const DEBUG_MODE = false;

  // =========================================================================
  // SISTEMA DE PERSISTÊNCIA DE SELEÇÃO
  // =========================================================================
  // Armazena: { "cardId": "nomeTarifaSelecionada" }
  window.AZUL_SELECTION_STATE = window.AZUL_SELECTION_STATE || {};

  function salvarSelecao(cardId, fareName) {
    window.AZUL_SELECTION_STATE[cardId] = fareName;
  }

  function obterSelecaoSalva(cardId) {
    return window.AZUL_SELECTION_STATE[cardId] || null;
  }

  function limparSelecaoSalva(cardId) {
    delete window.AZUL_SELECTION_STATE[cardId];
  }

  function debugLog(titulo, dados) {
    if (!DEBUG_MODE) return;
    console.group('DEBUG: ' + titulo);
    console.log(dados);
    console.groupEnd();
  }

  // =========================================================================
  // 1. CSS (O visual "Clean" que definimos)
  // =========================================================================
  const styles = `
        /* Estilos aplicados APENAS em cards com a classe .tariff-injector-active (modo Reais) */
        .flight-card__info{
            max-width: 312px!important;
            padding: 0px!important;
        }

        .css-7ip4ly .details > svg{
            min-width: 20px;
        }

        .info-details{
            width: 160px !important;
            min-width: 160px !important;
            max-width: fit-content !important;
        }

        .flight-card__info .info{
            max-width: 370px!important;
        }

        .flight-card__container,
        .flight-card__container{
            justify-content: space-between !important;
            padding: 10px;
            gap: 4px!important;
        }

        .css-gtajxx{
            max-width: 312px!important;
        }

        /* Esconde os fare cards originais APENAS em cards customizados */
        .flight-card__fare,
        .flight-card__fare.right-container,
        .fareIndex-0,
        .fareIndex-1,
        .fareIndex-2,
        .fareIndex-3,
        .fareIndex-4,
        .btn-fare,
        .fare-container.right {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            max-height: 0 !important;
            max-width: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            pointer-events: none !important;
            z-index: -9999 !important;
        }

        .tariff-injector-active .css-7ip4ly{
            max-width: calc(80% - 136px)!important;
        }

        /* Remove box-shadow/z-index residual quando o card está fechado */
        .tariff-injector-active:not(.flight-card--opened) > div {
            box-shadow: none !important;
            z-index: auto !important;
        }

        .custom-tariff-container {
            display: flex;
            gap: 8px;
            background-color: #f4f6f8;
            box-sizing: border-box;
            justify-content: flex-end;
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .custom-tariff-card {
            background: #fff;
            border: 1px solid #cfcfcf;
            border-radius: 6px;
            padding: 12px;
            min-width: 140px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
c        }

        .custom-tariff-card::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #026CB6;
            border-radius: 0 0 6px 6px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .custom-tariff-card:hover {
            border-color: #026CB6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .custom-tariff-card:hover::after {
            opacity: 1;
        }

        .custom-tariff-card.selected {
            border: 2px solid #026CB6;
            box-shadow: 0 0 0 1px #026CB6;
        }

        .custom-tariff-card.selected .tariff-badge {
            display: flex;
        }

        /* Estilo especial para Business */
        .custom-tariff-card.business {
            background: linear-gradient(91.12deg, rgb(31, 81, 141) 0%, rgb(18, 56, 105) 53.65%, rgb(4, 30, 66) 100%);
            border-color: rgb(4, 30, 66);
            border-radius: 6px;
        }

        .custom-tariff-card.business::after {
            background: rgba(255, 255, 255, 0.8);
        }

        .custom-tariff-card.business .tariff-title {
            color: #fff;
            background: rgba(255, 255, 255, 0.10)!important;
        }

        .custom-tariff-card.business .tariff-subtitle,
        .custom-tariff-card.business .tariff-value {
            color: #fff;
        }

        .custom-tariff-card.business:hover {
            border-color: rgb(31, 81, 141);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(4, 30, 66, 0.4);
        }

        .custom-tariff-card.business:hover::after {
            opacity: 1;
        }

        .custom-tariff-card.business.selected {
            border: 2px solid #026CB6;
            box-shadow: 0 0 0 1px #026CB6;
            background: linear-gradient(91.12deg, rgb(31, 81, 141) 0%, rgb(18, 56, 105) 53.65%, rgb(4, 30, 66) 100%);
        }

        .custom-tariff-card.business.selected .tariff-title {
            color: #fff;
            background: rgba(255, 255, 255, 0.10)!important;
        }

        .custom-tariff-card.business.selected .tariff-subtitle,
        .custom-tariff-card.business.selected .tariff-value,
        .custom-tariff-card.business.selected .tariff-value .currency,
        .custom-tariff-card.business.selected .tariff-value .integer,
        .custom-tariff-card.business.selected .tariff-value .cents {
            color: #fff;
        }

        .custom-tariff-card.sold-out {
            background-color: rgb(235, 235, 235);
            color: rgb(96, 96, 96);
            cursor: not-allowed;
            outline: none;
            border-color: #d0d0d0;
        }

        .custom-tariff-card.sold-out::after {
            display: none;
        }

        .custom-tariff-card.sold-out:hover {
            transform: none;
            box-shadow: none;
            border-color: #d0d0d0;
        }

        /* Business esgotado deve sobrescrever os estilos de Business */
        .custom-tariff-card.business.sold-out {
            background: rgb(235, 235, 235)!important;
            color: rgb(96, 96, 96)!important;
            border-color: #d0d0d0!important;
        }

        .custom-tariff-card.business.sold-out .tariff-title {
            color: rgb(96, 96, 96)!important;
            background: transparent!important;
        }

        .custom-tariff-card.business.sold-out .tariff-subtitle,
        .custom-tariff-card.business.sold-out .tariff-value {
            color: rgb(96, 96, 96)!important;
        }

        .custom-tariff-card.business.sold-out:hover {
            transform: none;
            box-shadow: none;
            border-color: #d0d0d0!important;
        }

        .tariff-title {
            font-size: 14px;
            text-transform: capitalize;
            font-weight: 700;
            color: rgb(2, 108, 182);
            margin-bottom: 0;
            letter-spacing: 0px;
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(1, 78, 132, 0.08);
            width: max-content;
            padding: 2px 4px;
            border-radius: 4px;
        }
        
        .tariff-title svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .tariff-subtitle {
            font-size: 12px;
            font-weight: 400;
            color: #6A7282;
        }

        .tariff-value {
            color: #026CB6;
            letter-spacing: -0.5px;
            line-height: 1;
            display: flex;
            align-items: baseline;
            gap: 2px;
        }

        .tariff-value .currency {
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 20px;
        }

        .tariff-value .integer {
            font-size: 20px;
            font-style: normal;
            font-weight: 700;
            line-height: 28px;
        }

        .tariff-value .cents {
            font-size: 12px;
            font-style: normal;
            font-weight: 700;
            line-height: 16px;
        }
        
        .tariff-badge {
            display: none;
            align-items: center;
            gap: 4px;
            background: #026CB6;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            position: absolute;
            top: -10px;
            right: 32px;
            white-space: nowrap;
            line-height: 16px;
        }
        .custom-tariff-card.sold-out .tariff-title { 
            color: rgb(96, 96, 96); 
        }
        .custom-tariff-card.sold-out .tariff-subtitle {
            color: rgb(96, 96, 96);
        }        .custom-tariff-card.sold-out .tariff-value { 
            color: rgb(96, 96, 96); 
            font-size: 14px;
            font-weight: 600;
        }

        .tariff-original-price {
            font-size: 14px;
            text-decoration: line-through;
            color: #999;
            line-height: 1.2;
        }

        .custom-tariff-card.business .tariff-original-price {
            color: rgba(255, 255, 255, 0.6);
        }

        /* Oculta badge de promoção original quando o injector está ativo */
        .tariff-injector-active [class*="TagPromocodeContainer"] {
            display: none !important;
        }
    `;

  function aplicarEstilos() {
    if (!document.getElementById('azul-injector-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'azul-injector-styles';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
      debugLog('CSS aplicado');
    }
  }

  // =========================================================================
  // 2. INTERCEPTADOR DE DADOS (O "Sniffer")
  // =========================================================================
  // Armazena os dados aqui: { "JOURNEY_KEY": [Array de Tarifas] }
  window.AZUL_FLIGHT_CACHE = {};

  function processarPayload(data) {
    try {
      debugLog('Payload Completo Recebido', data);

      const trips = data.data?.trips || data.trips || [];
      debugLog('Trips Encontradas', { total: trips.length, trips });

      let foundData = false;
      trips.forEach((trip, tripIndex) => {
        const journeys = trip.journeys || [];
        debugLog('Trip ' + tripIndex + ' - Journeys', { total: journeys.length, journeys });

        journeys.forEach((journey, journeyIndex) => {
          debugLog('Journey ' + journeyIndex + ' - Dados Completos', {
            journeyKey: journey.journeyKey,
            fares: journey.fares,
            designator: journey.designator,
            segments: journey.segments,
          });

          if (journey.journeyKey && journey.fares) {
            window.AZUL_FLIGHT_CACHE[journey.journeyKey] = journey.fares;
            foundData = true;

            // Debug detalhado de cada tarifa
            journey.fares.forEach((fare, fareIndex) => {
              debugLog('Tarifa ' + fareIndex + ' - ' + journey.journeyKey, {
                nome: fare.productClass?.name,
                code: fare.productClass?.code,
                preco: fare.paxFares?.[0]?.totalAmount,
                fareKey: fare.fareKey,
                available: fare.isAvailable,
                dadosCompletos: fare,
              });
            });
          }
        });
      });

      if (foundData) {
        if (!dadosCapturados) {
          aplicarEstilos();
          dadosCapturados = true;
        }
        atualizarLayout();
      }
    } catch (error) {
      debugLog('Erro ao processar payload', error);
    }
  }

  // Hook no XHR (método mais comum nessa página)
  const originalXHR = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener('load', function () {
      if (url.includes('availability') || url.includes('bookings')) {
        debugLog('XHR Interceptado', { method, url, status: this.status });
        try {
          const response = JSON.parse(this.responseText);
          processarPayload(response);
        } catch (e) {
          debugLog('Erro ao parsear resposta XHR', e);
          debugLog('Resposta XHR Raw', this.responseText.substring(0, 500));
        }
      }
    });
    originalXHR.apply(this, arguments);
  };

  // Hook no Fetch (para garantir)
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    const url = args[0].toString();
    if (url.includes('availability') || url.includes('bookings')) {
      debugLog('Fetch Interceptado', { url, status: response.status });
      const clone = response.clone();
      clone
        .json()
        .then(processarPayload)
        .catch((e) => {
          debugLog('Erro ao processar fetch', e);
          debugLog('Erro no Fetch', e);
        });
    }
    return response;
  }; // =========================================================================
  // 3. RENDERIZADOR (O "Painter")
  // =========================================================================

  function formatMoney(val) {
    const formatted = val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Separa R$, parte inteira e centavos
    const parts = formatted.replace('R$', '').trim().split(',');
    const integerPart = parts[0];
    const centsPart = parts[1] || '00';

    return (
      '<span class="currency">R$</span><span class="integer">' +
      integerPart +
      '</span><span class="cents">,' +
      centsPart +
      '</span>'
    );
  }

  function formatMoneySimple(val) {
    return (
      'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }

  function atualizarLayout() {
    const flightCards = document.querySelectorAll('.flight-card');
    debugLog('Cards na Página', { total: flightCards.length });

    flightCards.forEach((card, cardIndex) => {
      // Verifica se o card está exibindo pontos ao invés de reais
      const cardContainer = card.querySelector('.flight-card__container');
      const cardText = cardContainer ? cardContainer.textContent || '' : card.textContent || '';
      const originalFare = card.querySelector('.flight-card__fare');

      if (cardText.toLowerCase().includes('pontos')) {
        card.classList.remove('tariff-injector-active');
        if (originalFare) originalFare.style.cssText = '';
        var infoDetailsPontos = card.querySelector('.info-details');
        if (infoDetailsPontos) infoDetailsPontos.style.cssText = '';
        const existingContainer = card.querySelector('.custom-tariff-container');
        if (existingContainer) {
          existingContainer.remove();
        }
        return;
      }

      // ADICIONA a classe que ativa os estilos CSS
      card.classList.add('tariff-injector-active');

      // Esconde o fare card original via JS
      if (originalFare) {
        originalFare.style.cssText = 'display:none!important;';
      }

      // Aplica estilos do info-details via JS (CSS-in-JS da Azul pode sobrescrever)
      var infoDetails = card.querySelector('.info-details');
      if (infoDetails) {
        infoDetails.style.cssText =
          'width:160px!important;min-width:160px!important;max-width:fit-content!important;';
      }

      // Verifica se precisa re-renderizar (container antigo foi removido pelo React)
      const existingContainer = card.querySelector('.custom-tariff-container');

      if (existingContainer) {
        // Container existe, verifica se precisa reaplicar seleção
        const cardId = card.id;
        const selecaoSalva = obterSelecaoSalva(cardId);

        if (selecaoSalva) {
          const customCards = existingContainer.querySelectorAll('.custom-tariff-card');
          let encontrou = false;

          customCards.forEach(function (customCard) {
            const cardFareName = customCard.dataset.fareName || '';
            customCard.classList.remove('selected');

            if (cardFareName === selecaoSalva) {
              customCard.classList.add('selected');
              encontrou = true;
            }
          });

          if (encontrou) {
            debugLog('Selecao reaplicada', selecaoSalva);
          }
        }
        return;
      }

      const cardId = card.id;
      debugLog('Card ' + cardIndex + ' - Analise', {
        id: cardId,
        classes: card.className,
        possuiDados: !!window.AZUL_FLIGHT_CACHE[cardId],
      });

      const faresData = window.AZUL_FLIGHT_CACHE[cardId];

      if (faresData && faresData.length > 0) {
        debugLog('Card ' + cardIndex + ' - Renderizando', {
          cardId,
          quantidadeTarifas: faresData.length,
          tarifas: faresData.map((f) => ({
            nome: f.productClass?.name,
            preco: f.paxFares?.[0]?.totalAmount,
          })),
        });
        renderizarTarifasNoCard(card, faresData);
      } else {
        debugLog('Card ' + cardIndex + ' - Sem Dados', { cardId });
      }
    });
  }
  function renderizarTarifasNoCard(card, fares) {
    debugLog('Renderizando Tarifas', { cardId: card.id, fares });

    const container = document.createElement('div');
    container.className = 'custom-tariff-container';

    // Verifica se TODAS as tarifas estão esgotadas
    const todasEsgotadas = fares.every((fare) => {
      const paxFares = fare.paxFares;
      return !paxFares || paxFares.length === 0;
    });

    // Se todas estão esgotadas, renderiza apenas um card único
    if (todasEsgotadas) {
      const boxEsgotado = document.createElement('div');
      boxEsgotado.className = 'custom-tariff-card sold-out';
      boxEsgotado.innerHTML =
        '<span class="tariff-title">Voo Esgotado</span><span class="tariff-value">Indisponível</span>';

      boxEsgotado.onclick = (e) => {
        e.stopPropagation();
        debugLog('Voo esgotado');
      };

      container.appendChild(boxEsgotado);

      // Adiciona ao card e retorna
      const cardInner = card.querySelector('.card');
      if (cardInner) {
        cardInner.appendChild(container);
        card.classList.add('has-custom-fares');
      }

      debugLog('Voo esgotado renderizado', card.id);
      return;
    }

    // Caso contrário, renderiza normalmente apenas as tarifas disponíveis
    fares.forEach((fare, index) => {
      const nome = fare.productClass?.name || 'Tarifa';
      const paxFares = fare.paxFares;
      const isSoldOut = !paxFares || paxFares.length === 0;
      const preco = isSoldOut ? 0 : paxFares[0]?.totalAmount || 0;
      const temDesconto = !isSoldOut && paxFares[0]?.discount?.promotionCodeApplied === true;
      const precoOriginal = temDesconto ? paxFares[0]?.originalAmount || preco : preco;

      const isBusiness = nome.toLowerCase().includes('business');
      const isAzulTariff = ['azul', 'mais azul', 'super azul'].some((t) =>
        nome.toLowerCase().includes(t.toLowerCase()),
      );
      debugLog('Tarifa ' + index + ' - ' + nome, {
        esgotada: isSoldOut,
        isBusiness,
        isAzulTariff,
        paxFares,
        preco,
      });

      // SVG para tarifas Azul
      const azulIconeSVG =
        isAzulTariff && !isBusiness
          ? '\n                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 17 20">\n                    <g filter="url(#filter0_d_' +
            card.id +
            '_' +
            index +
            ')">\n                        <rect width="6" height="6" x="8.5" y="4.5" fill="url(#paint0_linear_' +
            card.id +
            '_' +
            index +
            ')" rx="1.5" transform="rotate(45 8.5 4.5)"></rect>\n                    </g>\n                    <defs>\n                        <filter id="filter0_d_' +
            card.id +
            '_' +
            index +
            '" width="15.243" height="15.243" x="0.879" y="5.121" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">\n                            <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>\n                            <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>\n                            <feOffset dy="4"></feOffset>\n                            <feGaussianBlur stdDeviation="2"></feGaussianBlur>\n                            <feColorMatrix values="0 0 0 0 0.286275 0 0 0 0 0.501961 0 0 0 0 0.909804 0 0 0 0.2 0"></feColorMatrix>\n                            <feBlend in2="BackgroundImageFix" result="effect1_dropShadow"></feBlend>\n                            <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"></feBlend>\n                        </filter>\n                        <linearGradient id="paint0_linear_' +
            card.id +
            '_' +
            index +
            '" x1="11.5" x2="11.5" y1="4.5" y2="10.5" gradientUnits="userSpaceOnUse">\n                            <stop stop-color="#026CB6"></stop>\n                            <stop offset="1" stop-color="#6087F8"></stop>\n                        </linearGradient>\n                    </defs>\n                </svg>\n            '
          : '';

      // Ícone diamante para Business
      const businessIconeSVG = isBusiness
        ? '\n                <svg width="14" height="14" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <g filter="url(#dia' +
          card.id +
          '_' +
          index +
          ')">\n                        <rect x="8.5" y="4.5" width="6" height="6" rx="1.5" transform="rotate(45 8.5 4.5)" fill="url(#grad' +
          card.id +
          '_' +
          index +
          ')"/>\n                    </g>\n                    <defs>\n                        <filter id="dia' +
          card.id +
          '_' +
          index +
          '" x="0.878662" y="5.12109" width="15.2427" height="15.2432" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">\n                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>\n                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>\n                            <feOffset dy="4"/>\n                            <feGaussianBlur stdDeviation="2"/>\n                            <feColorMatrix type="matrix" values="0 0 0 0 0.0156863 0 0 0 0 0.117647 0 0 0 0 0.258824 0 0 0 0.12 0"/>\n                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>\n                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>\n                        </filter>\n                        <linearGradient id="grad' +
          card.id +
          '_' +
          index +
          '" x1="11.5" y1="4.5" x2="11.5" y2="10.5" gradientUnits="userSpaceOnUse">\n                            <stop stop-color="white"/>\n                            <stop offset="1" stop-color="#8D8D8D"/>\n                        </linearGradient>\n                    </defs>\n                </svg>\n            '
        : '';

      const iconeSVG = isBusiness ? businessIconeSVG : azulIconeSVG;
      const box = document.createElement('div');

      // NOVO: Obtém seleção salva para este card
      const selecaoSalva = obterSelecaoSalva(card.id);
      const isSelected = selecaoSalva && selecaoSalva === nome.toLowerCase();

      box.className =
        'custom-tariff-card ' +
        (isSoldOut ? 'sold-out' : '') +
        ' ' +
        (isBusiness ? 'business' : '') +
        (isSelected ? ' selected' : '');
      box.dataset.fareIndex = index;
      box.dataset.fareName = nome.toLowerCase();
      let conteudoPreco;
      if (isSoldOut) {
        conteudoPreco = '<span class="tariff-value">Esgotada</span>';
      } else {
        conteudoPreco = '<span class="tariff-subtitle">a partir de</span>';
        if (temDesconto && precoOriginal > preco) {
          conteudoPreco +=
            '<span class="tariff-original-price">' + formatMoneySimple(precoOriginal) + '</span>';
        }
        conteudoPreco += '<span class="tariff-value">' + formatMoney(preco) + '</span>';
      }

      box.innerHTML =
        '<span class="tariff-badge">Escolhida</span>' +
        '<span class="tariff-title">' +
        nome +
        iconeSVG +
        '</span>' +
        conteudoPreco; // --- Logica de Clique (Proxy) ---
      if (!isSoldOut) {
        box.onclick = async function (e) {
          e.stopPropagation();
          e.preventDefault();

          const fareName = box.dataset.fareName;

          // Visual Selection
          container.querySelectorAll('.custom-tariff-card').forEach(function (b) {
            b.classList.remove('selected');
          });
          box.classList.add('selected');

          salvarSelecao(card.id, fareName);

          if (container._bloquearSync) {
            container._bloquearSync();
          }

          // Expande card se fechado (travando altura para evitar flash visual)
          const isCardClosed = !card.classList.contains('flight-card--opened');

          if (isCardClosed) {
            var alturaAtual = card.offsetHeight;
            card.style.maxHeight = alturaAtual + 'px';
            card.style.overflow = 'hidden';
            card.style.transition = 'none';

            var cardClickArea = card.querySelector('.flight-card__info[role="button"]');
            if (cardClickArea) {
              cardClickArea.click();
              await new Promise(function (r) {
                setTimeout(r, 600);
              });
            }
          }

          await new Promise(function (r) {
            setTimeout(r, 200);
          });

          var fareItems = card.querySelectorAll('.fare-item');
          var targetItem = null;

          fareItems.forEach(function (item) {
            var itemText = (item.textContent || '').toLowerCase();

            if (
              (fareName === 'azul' &&
                itemText.includes('azul') &&
                !itemText.includes('mais azul') &&
                !itemText.includes('azul super')) ||
              (fareName === 'mais azul' && itemText.includes('mais azul')) ||
              (fareName === 'azul super' && itemText.includes('azul super')) ||
              (fareName === 'business' && itemText.includes('business'))
            ) {
              if (!itemText.includes('esgotada')) {
                targetItem = item;
              }
            }
          });

          if (targetItem) {
            var selectBtn =
              targetItem.querySelector("button[class*='select'], button[class*='btn']") ||
              targetItem.querySelector('button');

            if (selectBtn) {
              selectBtn.click();
            }
          }

          // Fecha o card (ainda com clipping) e depois restaura
          if (isCardClosed) {
            var botoesFechar = card.querySelectorAll('button');
            for (var i = 0; i < botoesFechar.length; i++) {
              var ariaLabel = botoesFechar[i].getAttribute('aria-label') || '';
              var texto = botoesFechar[i].textContent || '';
              if (
                ariaLabel.toLowerCase().includes('fechar') ||
                ariaLabel.toLowerCase().includes('recolher') ||
                texto.toLowerCase().includes('recolher')
              ) {
                botoesFechar[i].click();
                break;
              }
            }

            await new Promise(function (r) {
              setTimeout(r, 400);
            });
            card.style.maxHeight = '';
            card.style.overflow = '';
            card.style.transition = '';
          }
        };
      } else {
        box.onclick = function (e) {
          e.stopPropagation();
        };
      }

      container.appendChild(box);
    });

    // INJEÇÃO: Adiciona dentro do card principal
    const cardInner = card.querySelector('.card');
    if (cardInner) {
      cardInner.appendChild(container);
      card.classList.add('has-custom-fares');

      // Adiciona funcionalidade de fechar
      adicionarFuncaoFechar(card, cardInner);

      // Adiciona observador para sincronizar seleção interna
      observarSelecaoInterna(card, container);
    }
  }

  // =========================================================================
  // 4. FUNCIONALIDADE DE FECHAR/RECOLHER
  // =========================================================================
  function adicionarFuncaoFechar(flightCard, cardContainer) {
    // Remove listener anterior se existir
    if (cardContainer._closeHandler) {
      cardContainer.removeEventListener('click', cardContainer._closeHandler);
    }

    let isProcessing = false;
    let lastClickTime = 0;

    const closeHandler = (e) => {
      // Previne processamento múltiplo
      if (isProcessing) return;

      // Debounce de 300ms
      const now = Date.now();
      if (now - lastClickTime < 300) return;
      lastClickTime = now;

      // Verifica se o card está aberto
      const isOpen = flightCard.classList.contains('flight-card--opened');
      if (!isOpen) return;

      // Ignora cliques nas tarifas customizadas
      if (e.target.closest('.custom-tariff-card')) return;

      // Ignora cliques no container de tarifas
      if (e.target.closest('.custom-tariff-container')) return;

      // Ignora cliques em elementos interativos (exceto áreas informativas)
      if (
        e.target.closest('button:not(.btn-fare):not(.duration):not(.flight-select-see-details)') ||
        e.target.closest('a') ||
        e.target.closest('.fare-item')
      )
        return;

      // Verifica se clicou em uma área válida para fechar
      const clickedOnValidArea =
        e.target === cardContainer ||
        e.target.classList.contains('flight-card__info') ||
        e.target.classList.contains('info') ||
        e.target.classList.contains('info-container') ||
        e.target.closest('.info') ||
        e.target.closest('.flight-card__info') ||
        e.target.closest('.info-details') ||
        e.target.closest('.details') ||
        e.target.closest('.flight-leg-info');

      if (!clickedOnValidArea) return;

      // Para a propagação imediatamente
      e.stopPropagation();
      e.preventDefault(); // Ativa flag de processamento
      isProcessing = true;

      debugLog('Tentando fechar card');

      // Pequeno delay para garantir que não vai conflitar
      setTimeout(() => {
        // Tenta múltiplas estratégias para fechar

        // Estratégia 1: Procura botão "Recolher" ou "Fechar"
        const botoesFechar = flightCard.querySelectorAll('button');
        let botaoEncontrado = false;

        for (let btn of botoesFechar) {
          const ariaLabel = btn.getAttribute('aria-label') || '';
          const texto = btn.textContent || '';

          if (
            ariaLabel.toLowerCase().includes('fechar') ||
            ariaLabel.toLowerCase().includes('recolher') ||
            texto.toLowerCase().includes('recolher')
          ) {
            debugLog('Fechando via botao', ariaLabel || texto);
            btn.click();
            botaoEncontrado = true;
            break;
          }
        }

        // Estratégia 2: Se não encontrou botão, remove a classe de aberto
        if (!botaoEncontrado) {
          debugLog('Fechando via remocao de classe');
          flightCard.classList.remove('flight-card--opened');

          // Remove também o conteúdo expandido se existir
          const cardContent = flightCard.querySelector('.card-content');
          if (cardContent) {
            cardContent.style.display = 'none';
          }
        }

        // Libera após delay
        setTimeout(() => {
          isProcessing = false;
        }, 300);
      }, 50);
    };

    // Usa capture phase para pegar o evento antes
    cardContainer._closeHandler = closeHandler;
    cardContainer.addEventListener('click', closeHandler, true);

    debugLog('Funcionalidade Fechar Adicionada', { cardId: flightCard.id });
  } // =========================================================================
  // 4.1 OBSERVADOR DE SELECAO INTERNA - USANDO LOGICA DA VARIANT
  // =========================================================================
  function observarSelecaoInterna(flightCard, customContainer) {
    let isSyncing = false;
    let bloqueioManual = false;
    let lastExternalUpdate = 0;

    // Helper: encontra o nome da tarifa no texto baseado nos nomes dos custom cards
    const encontrarNomeTarifa = function (texto) {
      var textoLower = texto.toLowerCase();
      var customCards = customContainer.querySelectorAll('.custom-tariff-card');
      var nomes = [];
      customCards.forEach(function (cc) {
        if (cc.dataset.fareName) nomes.push(cc.dataset.fareName);
      });
      nomes.sort(function (a, b) { return b.length - a.length; });

      for (var i = 0; i < nomes.length; i++) {
        var palavras = nomes[i].split(' ');
        var invertido = palavras.slice().reverse().join(' ');
        if (textoLower.includes(nomes[i]) || textoLower.includes(invertido)) {
          return nomes[i];
        }
      }

      if (textoLower.includes('business')) return 'business';
      if (textoLower.includes('super') && textoLower.includes('azul')) {
        var found = null;
        customCards.forEach(function (cc) {
          var n = cc.dataset.fareName || '';
          if (n.includes('super') && n.includes('azul')) found = n;
        });
        return found;
      }
      if (textoLower.includes('mais azul')) return 'mais azul';
      if (textoLower.includes('azul')) return 'azul';
      return null;
    };

    // Helper: atualiza o card externo com a tarifa encontrada
    const atualizarSelecaoExterna = function (nomeTarifa, source) {
      if (!nomeTarifa) return;
      isSyncing = true;
      lastExternalUpdate = Date.now();
      salvarSelecao(flightCard.id, nomeTarifa);
      var customCards = customContainer.querySelectorAll('.custom-tariff-card');
      customCards.forEach(function (cc) {
        cc.classList.remove('selected');
        if (cc.dataset.fareName === nomeTarifa) {
          cc.classList.add('selected');
          debugLog('[SELECAO] Sincronizado externamente via ' + (source || 'desconhecido'), cc.dataset.fareName);
        }
      });
      setTimeout(function () { isSyncing = false; }, 100);
    };

    const sincronizarSelecao = function () {
      if (isSyncing) return;
      if (bloqueioManual) return;

      var fareItems = flightCard.querySelectorAll('.fare-item');
      var nomeTarifaSelecionada = null;

      fareItems.forEach(function (fareItem) {
        var textoCompleto = fareItem.textContent || '';
        if (textoCompleto.includes('Tarifa selecionada')) {
          nomeTarifaSelecionada = encontrarNomeTarifa(textoCompleto);
        }
      });

      if (nomeTarifaSelecionada) {
        atualizarSelecaoExterna(nomeTarifaSelecionada, 'sincronizarSelecao');
      }
    };

    customContainer._bloquearSync = function () {
      bloqueioManual = true;
      setTimeout(function () {
        bloqueioManual = false;
        setTimeout(sincronizarSelecao, 300);
      }, 1500);
    };

    const adicionarListenersBotoes = function () {
      var botoesSelecionar = flightCard.querySelectorAll(
        'button[aria-label*="Selecionar tarifa"], button[data-test-id="select-fare"]',
      );

      botoesSelecionar.forEach(function (botao) {
        if (!botao._syncListenerAdded) {
          botao._syncListenerAdded = true;
          debugLog('[Observador] Listener adicionado ao botao Selecionar tarifa');

          botao.addEventListener('click', function () {
            if (bloqueioManual) return;

            // Captura IMEDIATA: encontra o fare-item que contem este botao
            var fareItem = this.closest('.fare-item');
            if (fareItem) {
              var nomeTarifa = encontrarNomeTarifa(fareItem.textContent || '');
              if (nomeTarifa) {
                debugLog('[SELECAO] Captura direta no clique interno', nomeTarifa);
                atualizarSelecaoExterna(nomeTarifa, 'clique-direto');
                return;
              }
            }

            // Fallback: tenta sincronizar após delays
            setTimeout(sincronizarSelecao, 300);
            setTimeout(sincronizarSelecao, 600);
            setTimeout(sincronizarSelecao, 1000);
          });
        }
      });
    };

    var observer = new MutationObserver(function (mutations) {
      if (isSyncing) return;

      var shouldAddListeners = false;

      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              if (
                (node.classList && node.classList.contains('fare-item')) ||
                (node.querySelector && node.querySelector('.fare-item')) ||
                (node.querySelector && node.querySelector('[data-test-id="select-fare"]'))
              ) {
                shouldAddListeners = true;
              }

              // Captura IMEDIATA quando "Tarifa selecionada" aparece no DOM
              var nodeText = node.textContent || '';
              if (nodeText.includes('Tarifa selecionada') && !bloqueioManual) {
                // Guard: não sobrescrever se houve atualização recente (ex: clique direto)
                if (Date.now() - lastExternalUpdate < 2000) return;

                // Narrow down: busca no fare-item específico que contém "Tarifa selecionada"
                var fareItemsInNode = node.querySelectorAll ? node.querySelectorAll('.fare-item') : [];
                var found = false;

                fareItemsInNode.forEach(function (fi) {
                  if (!found && (fi.textContent || '').includes('Tarifa selecionada')) {
                    var nomeTarifa = encontrarNomeTarifa(fi.textContent);
                    if (nomeTarifa) {
                      debugLog('[SELECAO] Captura via Observer (fare-item)', nomeTarifa);
                      atualizarSelecaoExterna(nomeTarifa, 'observer-fareitem');
                      found = true;
                    }
                  }
                });

                // Se o nó é ele mesmo um fare-item
                if (!found && node.classList?.contains('fare-item')) {
                  var nomeTarifa = encontrarNomeTarifa(nodeText);
                  if (nomeTarifa) {
                    debugLog('[SELECAO] Captura via Observer (nó direto)', nomeTarifa);
                    atualizarSelecaoExterna(nomeTarifa, 'observer-direto');
                  }
                }
              }
            }
          });
        }
      });

      if (shouldAddListeners) {
        setTimeout(adicionarListenersBotoes, 100);
      }
    });

    observer.observe(flightCard, { childList: true, subtree: true });

    // Observa abertura do card para adicionar listeners nos botoes internos
    var classObserver = new MutationObserver(function () {
      if (flightCard.classList.contains('flight-card--opened')) {
        setTimeout(adicionarListenersBotoes, 200);
        setTimeout(adicionarListenersBotoes, 500);
      }
    });
    classObserver.observe(flightCard, { attributes: true, attributeFilter: ['class'] });

    setTimeout(function () {
      adicionarListenersBotoes();
      sincronizarSelecao();
    }, 500);

    debugLog('Observador de Selecao Interna Adicionado', { cardId: flightCard.id });
  }

  // =========================================================================
  // 5. OBSERVADOR DE NOVOS VOOS (Para botão "Ver mais voos")
  // =========================================================================
  function iniciarObservadorDeVoos() {
    // Procura o container onde os voos são renderizados
    const flightListContainer = document.querySelector(
      '.flight-list, [class*="flight"], main, #root',
    );

    if (!flightListContainer) {
      debugLog('Container de voos nao encontrado, retry em 1s');
      setTimeout(iniciarObservadorDeVoos, 1000);
      return;
    }
    const observer = new MutationObserver(function (mutations) {
      let novosVoosDetectados = false;

      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              if (node.classList?.contains('flight-card') || node.querySelector?.('.flight-card')) {
                novosVoosDetectados = true;
              }
            }
          });
        }
      });

      // Nao limpa automaticamente baseado em cards removidos
      // A limpeza agora so acontece via botao "Trocar voo"

      if (novosVoosDetectados) {
        debugLog('Novos voos detectados');
        setTimeout(function () {
          atualizarLayout();
        }, 300);
      }
    });

    // Observa mudanças no container
    observer.observe(flightListContainer, {
      childList: true,
      subtree: true,
    });

    debugLog('Observador de novos voos iniciado');
    debugLog('Container observado', flightListContainer);
  }

  // =========================================================================
  // 6. OBSERVADOR DO BOTÃO "VER MAIS VOOS"
  // =========================================================================
  function observarBotaoVerMais() {
    // Adiciona listener ao botão "Ver mais voos"
    const addListenerToBotao = function () {
      const botaoVerMais = document.querySelector('#load-more-button, button[id*="load-more"]');

      if (botaoVerMais && !botaoVerMais._listenerAdded) {
        botaoVerMais._listenerAdded = true;
        botaoVerMais.addEventListener('click', function () {});
      }
    };

    // Tenta adicionar o listener imediatamente
    addListenerToBotao();

    // Observa se o botão aparece depois (caso não exista no início)
    const buttonObserver = new MutationObserver(function () {
      addListenerToBotao();
    });

    buttonObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // =========================================================================
  // 7. FUNÇÃO PARA LIMPAR SELEÇÕES - ATUALIZADA POR TRECHO
  // =========================================================================

  // Limpa apenas visual para um trecho específico
  function limparSelecoesVisuaisPorTrecho(tripIndex) {
    const tripContainer = document.querySelector('.trip-index-' + tripIndex);

    if (tripContainer) {
      const selecoes = tripContainer.querySelectorAll('.custom-tariff-card.selected');

      selecoes.forEach(function (card) {
        card.classList.remove('selected');
      });

      debugLog('Selecoes visuais limpas no trecho ' + tripIndex, selecoes.length);
    }
  }

  // Limpa estado salvo apenas para cards de um trecho específico
  function limparEstadoSalvoPorTrecho(tripIndex) {
    const tripContainer = document.querySelector('.trip-index-' + tripIndex);

    if (tripContainer) {
      const flightCards = tripContainer.querySelectorAll('.flight-card');

      flightCards.forEach(function (card) {
        const cardId = card.id;
        if (cardId && window.AZUL_SELECTION_STATE[cardId]) {
          delete window.AZUL_SELECTION_STATE[cardId];
          debugLog('Estado limpo para cardId', cardId.substring(0, 30));
        }
      });
    }
  }

  // Limpa tudo de um trecho específico (visual + estado salvo)
  function limparSelecoesPorTrecho(tripIndex) {
    limparSelecoesVisuaisPorTrecho(tripIndex);
    limparEstadoSalvoPorTrecho(tripIndex);
    debugLog('Selecoes do trecho limpas', tripIndex);
  }

  // Limpa tudo (todos os trechos)
  function limparTodasSelecoes() {
    const todasAsSelecoes = document.querySelectorAll('.custom-tariff-card.selected');

    todasAsSelecoes.forEach(function (card) {
      card.classList.remove('selected');
    });

    window.AZUL_SELECTION_STATE = {};
    debugLog('Todas as selecoes limpas');
  }

  // =========================================================================
  // 8. OBSERVADOR DO BOTÃO "TROCAR VOO" - ATUALIZADO POR TRECHO
  // =========================================================================
  function observarBotaoTrocarVoo() {
    const addListenerToBotao = function () {
      const botoesTrocar = document.querySelectorAll(
        'button[aria-label*="TBD"], button[aria-label*="trocar"], button[aria-label*="Trocar"]',
      );

      botoesTrocar.forEach(function (botao) {
        if (botao._trocarVooListenerAdded) return;

        botao._trocarVooListenerAdded = true;

        botao.addEventListener('click', function () {
          const tripContainer = botao.closest(
            '.trip-index-0, .trip-index-1, [class*="trip-index"]',
          );

          let tripIndex = null;

          if (tripContainer) {
            const classes = tripContainer.className.split(' ');
            for (let i = 0; i < classes.length; i++) {
              const match = classes[i].match(/trip-index-(\d+)/);
              if (match) {
                tripIndex = match[1];
                break;
              }
            }
          }

          if (tripIndex !== null) {
            debugLog('Botao Trocar voo clicado no trecho', tripIndex);
            limparSelecoesPorTrecho(tripIndex);

            setTimeout(function () {
              limparSelecoesPorTrecho(tripIndex);
            }, 500);
          } else {
            debugLog('Trocar voo - trecho nao identificado, limpando tudo');
            limparTodasSelecoes();
          }
        });

        debugLog('Listener adicionado ao botao Trocar voo');
      });
    };

    addListenerToBotao();

    const buttonObserver = new MutationObserver(addListenerToBotao);
    buttonObserver.observe(document.body, { childList: true, subtree: true });
  } // Tenta rodar uma vez no início caso o cache já tenha algo (se recarregou script)
  if (Object.keys(window.AZUL_FLIGHT_CACHE).length > 0) {
    debugLog('Cache existente detectado');
    debugLog('Cache Inicial', window.AZUL_FLIGHT_CACHE);
    aplicarEstilos();
    dadosCapturados = true;
    atualizarLayout();
  }

  // Inicia os observadores
  iniciarObservadorDeVoos();
  observarBotaoVerMais();
  observarBotaoTrocarVoo();
})();
