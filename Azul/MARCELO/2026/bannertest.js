/**
 * AT - Modal Hotel Pos-Compra
 * Exibe modal de oferta de hotel apos a compra de passagem na Azul.
 * Apresenta progresso de reserva com imagem do hotel e botao de fechar.
 */

(function () {
  'use strict';

  // ─── Configuracao ────────────────────────────────────────────────────────────

  const CONFIG = {
    styleId: 'at-modal-hotel-style',
    modalId: 'at-modal-hotel',
    overlayId: 'at-modal-hotel-overlay',
    selectorAlvo: 'body',
    progressoInicial: 63.36,
    progressoTotal: 356,
    imagemHotel: 'https://i.imgur.com/8kb2vCw.jpg',
    titulo: 'A um passo da viagem dos sonhos.',
    descricao:
      'Sua experiencia Azul fica ainda melhor. Ao comprar sua passagem, voce ganha 15% OFF em hoteis para escolher sua hospedagem com calma, quando quiser.',
    textoProgresso: 'Estamos iniciando sua reserva...',
    maxTentativas: 20,
    intervaloMs: 300,
    nomeAtividade: 'AT_ModalHotelPosCompra',
  };

  // ─── Tracking Adobe ──────────────────────────────────────────────────────────

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[ModalHotel] Parametro de tracking ausente.');
      return;
    }

    const labelEvent = CONFIG.nomeAtividade + '_' + eventType + ' ' + eventLabel;
    console.log('[ModalHotel] Analytics event disparado:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        console.log('[ModalHotel] Objeto analytics nao disponivel.');
        return;
      }
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_poscompra_passagem';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // ─── CSS ─────────────────────────────────────────────────────────────────────

  function injetarEstilos() {
    if (document.getElementById(CONFIG.styleId)) return;

    const style = document.createElement('style');
    style.id = CONFIG.styleId;
    style.textContent =
      /* Overlay */
      '#at-modal-hotel-overlay {' +
      '  position: fixed;' +
      '  inset: 0;' +
      '  background: rgba(0, 0, 0, 0.55);' +
      '  z-index: 99998;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '}' +

      /* Container do modal */
      '#at-modal-hotel {' +
      '  position: relative;' +
      '  width: 805px;' +
      '  height: 254px;' +
      '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;' +
      '  box-sizing: border-box;' +
      '  border-radius: 8px;' +
      '  overflow: hidden;' +
      '  box-shadow: 0 8px 32px rgba(0,0,0,0.22);' +
      '}' +

      /* Imagem esquerda */
      '#at-modal-hotel .at-mh__imagem {' +
      '  position: absolute;' +
      '  width: 369px;' +
      '  height: 254px;' +
      '  left: 0;' +
      '  top: 0;' +
      '  background: url(' + CONFIG.imagemHotel + ') center center / cover no-repeat;' +
      '  border-radius: 8px 0 0 8px;' +
      '}' +

      /* Painel branco direito */
      '#at-modal-hotel .at-mh__conteudo {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  justify-content: space-between;' +
      '  align-items: flex-start;' +
      '  padding: 24px 40px;' +
      '  gap: 40px;' +
      '  position: absolute;' +
      '  width: 436px;' +
      '  height: 254px;' +
      '  right: 0;' +
      '  top: 0;' +
      '  background: #FFFFFF;' +
      '  border-radius: 0 8px 8px 0;' +
      '  box-sizing: border-box;' +
      '}' +

      /* Agrupamento de textos */
      '#at-modal-hotel .at-mh__textos {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: flex-start;' +
      '  gap: 16px;' +
      '  width: 100%;' +
      '}' +

      '#at-modal-hotel .at-mh__titulo {' +
      '  font-weight: 400;' +
      '  font-size: 32px;' +
      '  line-height: 32px;' +
      '  color: #026CB6;' +
      '  margin: 0;' +
      '}' +

      '#at-modal-hotel .at-mh__descricao {' +
      '  font-weight: 300;' +
      '  font-size: 12px;' +
      '  line-height: 15px;' +
      '  color: #4B4B4B;' +
      '  margin: 0;' +
      '}' +

      /* Barra de progresso */
      '#at-modal-hotel .at-mh__progresso-wrapper {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: flex-start;' +
      '  gap: 8px;' +
      '  width: 100%;' +
      '}' +

      '#at-modal-hotel .at-mh__barra-fundo {' +
      '  position: relative;' +
      '  width: 100%;' +
      '  height: 8px;' +
      '  background: #EBEBEB;' +
      '  border-radius: 16px;' +
      '  overflow: hidden;' +
      '}' +

      '#at-modal-hotel .at-mh__barra-preenchimento {' +
      '  position: absolute;' +
      '  left: 0;' +
      '  top: 0;' +
      '  height: 8px;' +
      '  background: #026CB6;' +
      '  border-radius: 16px;' +
      '  transition: width 0.6s ease;' +
      '}' +

      '#at-modal-hotel .at-mh__texto-progresso {' +
      '  font-weight: 400;' +
      '  font-size: 12px;' +
      '  line-height: 14px;' +
      '  color: #026CB6;' +
      '  margin: 0;' +
      '}' +

      /* Botao fechar */
      '#at-modal-hotel .at-mh__fechar {' +
      '  position: absolute;' +
      '  top: 10px;' +
      '  right: 12px;' +
      '  width: 24px;' +
      '  height: 24px;' +
      '  background: none;' +
      '  border: none;' +
      '  cursor: pointer;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  padding: 0;' +
      '  color: #4B4B4B;' +
      '  font-size: 18px;' +
      '  line-height: 1;' +
      '}' +

      '#at-modal-hotel .at-mh__fechar:hover {' +
      '  color: #026CB6;' +
      '}';

    document.head.appendChild(style);
  }

  // ─── HTML ─────────────────────────────────────────────────────────────────────

  function criarModal() {
    const porcentagem = ((CONFIG.progressoInicial / CONFIG.progressoTotal) * 100).toFixed(2);

    const overlay = document.createElement('div');
    overlay.id = CONFIG.overlayId;
    overlay.setAttribute('data-at-modal-hotel', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', CONFIG.titulo);

    const modal = document.createElement('div');
    modal.id = CONFIG.modalId;

    modal.innerHTML =
      '<div class="at-mh__imagem" aria-hidden="true"></div>' +
      '<button class="at-mh__fechar" aria-label="Fechar modal" data-at-mh-fechar="true">&#x2715;</button>' +
      '<div class="at-mh__conteudo">' +
        '<div class="at-mh__textos">' +
          '<p class="at-mh__titulo">' + CONFIG.titulo + '</p>' +
          '<p class="at-mh__descricao">' + CONFIG.descricao + '</p>' +
        '</div>' +
        '<div class="at-mh__progresso-wrapper">' +
          '<div class="at-mh__barra-fundo">' +
            '<div class="at-mh__barra-preenchimento" style="width:' + porcentagem + '%"></div>' +
          '</div>' +
          '<p class="at-mh__texto-progresso">' + CONFIG.textoProgresso + '</p>' +
        '</div>' +
      '</div>';

    overlay.appendChild(modal);
    return overlay;
  }

  // ─── Fechar modal ────────────────────────────────────────────────────────────

  function fecharModal() {
    const overlay = document.getElementById(CONFIG.overlayId);
    if (overlay) {
      overlay.remove();
      console.log('[ModalHotel] Modal fechado.');
      analyticsEvent('fechar', 'clique');
    }
  }

  function adicionarListenerFechar(overlay) {
    const btnFechar = overlay.querySelector('[data-at-mh-fechar]');
    if (btnFechar && !btnFechar.getAttribute('data-at-listener-added')) {
      btnFechar.setAttribute('data-at-listener-added', 'true');
      btnFechar.addEventListener('click', function () {
        fecharModal();
      });
    }

    // Fechar ao clicar no overlay fora do modal
    if (!overlay.getAttribute('data-at-overlay-listener')) {
      overlay.setAttribute('data-at-overlay-listener', 'true');
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          fecharModal();
        }
      });
    }
  }

  // ─── Injecao ─────────────────────────────────────────────────────────────────

  function injetarModal() {
    if (document.getElementById(CONFIG.overlayId)) return;

    const alvo = document.querySelector(CONFIG.selectorAlvo);
    if (!alvo) {
      console.log('[ModalHotel] Elemento alvo nao encontrado:', CONFIG.selectorAlvo);
      return;
    }

    injetarEstilos();

    const overlay = criarModal();
    alvo.appendChild(overlay);

    adicionarListenerFechar(overlay);

    console.log('[ModalHotel] Modal injetado com sucesso.');
    analyticsEvent('exibicao', 'visualizacao');
  }

  // ─── Polling / Inicializacao ──────────────────────────────────────────────────

  function iniciar() {
    let tentativas = 0;

    const intervalo = setInterval(function () {
      tentativas++;

      const alvo = document.querySelector(CONFIG.selectorAlvo);

      if (alvo) {
        clearInterval(intervalo);
        injetarModal();
        return;
      }

      if (tentativas >= CONFIG.maxTentativas) {
        clearInterval(intervalo);
        console.log('[ModalHotel] Limite de tentativas atingido. Elemento nao encontrado.');
      }
    }, CONFIG.intervaloMs);
  }

  // ─── DOM Ready ───────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
