(function () {
  'use strict';

  var _noop; // evita erro de lint em ambientes sem ESLint configurado para IIFE pura

  // --- Variaveis de controle ---
  let retryCount = 0;
  let observer = null;
  let debounceTimer = null;
  let isProcessing = false;
  let hasTrackedView = false;
  let isDismissed = false;
  let couponCopyTimer = null;

  // --- Constantes ---
  const EXPERIENCE_FLAG = 'AT_HOGWARTS_PROMO_MODAL_2026';
  const STYLE_ID = 'at-hpm-style';
  const FLASH_ID = 'at-hpm-flash';
  const MODAL_ID = 'at-hpm-modal';
  const COUPON_CODE = 'CONSUMIDOR20';
  const CTA_URL = 'https://www.voeazul.com.br/br/pt/viagem-completa/universal';
  const FLASH_DURATION = 1450;
  const MAX_RETRIES = 30;
  const RETRY_INTERVAL = 250;
  const OBSERVER_DEBOUNCE = 180;

  // URLs das imagens
  const IMG_BG = '';
  const IMG_AZUL_LOGO = 'https://i.imgur.com/BdxFnun.png';
  const IMG_PARTNER_LOGO = 'https://i.imgur.com/rF0NNXS.png';
  const IMG_UNIVERSAL_LOGO = 'https://i.imgur.com/sgL9x6k.png';
  const IMG_HOGWARTS = 'https://i.imgur.com/gpsv57K.png';

  // Guard de execucao unica
  if (window[EXPERIENCE_FLAG]) {
    return;
  }
  window[EXPERIENCE_FLAG] = true;

  // --- Tracking Adobe Analytics ---
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) {
      console.log('[Tracking HogwartsPromo] Parametros ausentes para evento de analytics.');
      return;
    }

    const labelEvent = 'AT_HogwartsPromo_' + eventType + ' ' + eventLabel;
    console.log('[Tracking HogwartsPromo] Evento de analytics disparado: ' + labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_home_hogwarts_promo';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  // --- Estilos da experiencia ---
  function getStyles() {
    return [
      // Feitico azul circular / flash
      '.at-hpm-flash {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 2147483640;',
      '  pointer-events: none;',
      '  overflow: hidden;',
      '  opacity: 0;',
      '}',
      '.at-hpm-flash.is-active {',
      '  animation: atHpmSpellOverlay 1450ms ease-out forwards;',
      '}',
      '.at-hpm-flash__beam {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 220px;',
      '  height: 220px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle, rgba(168, 220, 255, 0.68) 0%, rgba(80, 154, 235, 0.58) 18%, rgba(33, 86, 187, 0.42) 48%, rgba(9, 22, 66, 0) 74%);',
      '  box-shadow: 0 0 28px 10px rgba(64, 128, 220, 0.66), 0 0 92px 34px rgba(20, 62, 156, 0.46), inset 0 0 20px rgba(160, 210, 255, 0.34);',
      '  transform: translate(-50%, -50%) scale(0.08);',
      '  opacity: 0;',
      '  will-change: transform, opacity, filter;',
      '}',
      '.at-hpm-flash.is-active .at-hpm-flash__beam {',
      '  animation: atHpmSpellCore 1450ms cubic-bezier(0.2, 0.95, 0.25, 1) forwards;',
      '}',
      '.at-hpm-flash__ring {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 24px;',
      '  height: 24px;',
      '  border-radius: 50%;',
      '  border: 2px solid rgba(118, 182, 255, 0.78);',
      '  box-shadow: 0 0 12px rgba(76, 146, 232, 0.62), inset 0 0 8px rgba(132, 188, 255, 0.42);',
      '  transform: translate(-50%, -50%) scale(0.1);',
      '  opacity: 0;',
      '}',
      '.at-hpm-flash.is-active .at-hpm-flash__ring {',
      '  animation: atHpmSpellRing 1450ms ease-out forwards;',
      '}',
      '.at-hpm-flash__spark {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 5px;',
      '  height: 168px;',
      '  border-radius: 999px;',
      '  background: linear-gradient(180deg, rgba(158, 214, 255, 0.82) 0%, rgba(76, 154, 236, 0.56) 45%, rgba(18, 56, 160, 0) 100%);',
      '  transform-origin: 50% 0%;',
      '  opacity: 0;',
      '  mix-blend-mode: screen;',
      '}',
      '.at-hpm-flash__spark--1 { transform: translate(-50%, -50%) rotate(22deg); }',
      '.at-hpm-flash__spark--2 { transform: translate(-50%, -50%) rotate(-34deg); }',
      '.at-hpm-flash__spark--3 { transform: translate(-50%, -50%) rotate(68deg); }',
      '.at-hpm-flash__spark--4 { transform: translate(-50%, -50%) rotate(-84deg); }',
      '.at-hpm-flash.is-active .at-hpm-flash__spark {',
      '  animation: atHpmSpellSpark 980ms ease-out 110ms forwards;',
      '}',
      '.at-hpm-flash__smoke {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 120px;',
      '  height: 86px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle at 42% 45%, rgba(128, 180, 238, 0.38) 0%, rgba(70, 122, 201, 0.3) 34%, rgba(34, 72, 154, 0.24) 62%, rgba(13, 25, 69, 0) 100%);',
      '  filter: blur(9px);',
      '  opacity: 0;',
      '  transform: translate(-50%, -50%) scale(0.3);',
      '  mix-blend-mode: screen;',
      '  will-change: transform, opacity, filter;',
      '}',
      '.at-hpm-flash__smoke--1 { margin-left: -18px; margin-top: 6px; }',
      '.at-hpm-flash__smoke--2 { margin-left: 24px; margin-top: -8px; }',
      '.at-hpm-flash__smoke--3 { margin-left: -4px; margin-top: 20px; }',
      '.at-hpm-flash.is-active .at-hpm-flash__smoke--1 { animation: atHpmSpellSmokeA 1450ms ease-out forwards, atHpmSpellSmokeNoiseA 520ms ease-in-out 120ms 2; }',
      '.at-hpm-flash.is-active .at-hpm-flash__smoke--2 { animation: atHpmSpellSmokeB 1450ms ease-out forwards, atHpmSpellSmokeNoiseB 560ms ease-in-out 150ms 2; }',
      '.at-hpm-flash.is-active .at-hpm-flash__smoke--3 { animation: atHpmSpellSmokeC 1450ms ease-out forwards, atHpmSpellSmokeNoiseC 500ms ease-in-out 180ms 2; }',
      '.at-hpm-flash__dust {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 6px;',
      '  height: 6px;',
      '  border-radius: 50%;',
      '  background: rgba(166, 212, 255, 0.78);',
      '  box-shadow: 0 0 10px rgba(70, 138, 218, 0.72);',
      '  opacity: 0;',
      '  transform: translate(-50%, -50%) scale(0.2);',
      '  --d-x: 0px;',
      '  --d-y: 0px;',
      '}',
      '.at-hpm-flash__dust--1 { --d-x: 118px; --d-y: -92px; }',
      '.at-hpm-flash__dust--2 { --d-x: -136px; --d-y: -68px; }',
      '.at-hpm-flash__dust--3 { --d-x: 94px; --d-y: 74px; }',
      '.at-hpm-flash__dust--4 { --d-x: -104px; --d-y: 84px; }',
      '.at-hpm-flash.is-active .at-hpm-flash__dust {',
      '  animation: atHpmSpellDust 900ms ease-out 170ms forwards;',
      '}',
      '.at-hpm-flash__burst {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 40px;',
      '  height: 40px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle, rgba(162, 212, 255, 0.68) 0%, rgba(68, 136, 224, 0.48) 42%, rgba(18, 50, 133, 0) 78%);',
      '  transform: translate(-50%, -50%) scale(0.3);',
      '  opacity: 0;',
      '}',
      '.at-hpm-flash.is-active .at-hpm-flash__burst {',
      '  animation: atHpmSpellBurst 1450ms ease-out forwards;',
      '}',
      // Backdrop
      '.at-hpm-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 2147483600;',
      '  background: rgba(0, 0, 0, 0.86);',
      '  opacity: 0;',
      '  transition: opacity 0.4s ease;',
      '}',
      '.at-hpm-backdrop.is-visible { opacity: 1; }',
      '.at-hpm-backdrop.is-dismissed { opacity: 0; pointer-events: none; }',
      // Container do modal
      '.at-hpm-modal {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 2147483620;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  pointer-events: none;',
      '  opacity: 0;',
      '  transform: scale(0.94);',
      '  transition: opacity 0.4s ease, transform 0.4s ease;',
      '}',
      '.at-hpm-modal.is-visible {',
      '  opacity: 1;',
      '  transform: scale(1);',
      '  pointer-events: auto;',
      '}',
      '.at-hpm-modal.is-dismissed {',
      '  opacity: 0;',
      '  transform: scale(0.94);',
      '  pointer-events: none;',
      '}',
      // Borda dourada (frame externo)
      '.at-hpm-outer {',
      '  width: 692px;',
      '  max-width: calc(100vw - 24px);',
      '  background: #B9A17B;',
      '  padding: 2px;',
      '  box-sizing: border-box;',
      '  border-radius: 6px;',
      '}',
      // Frame interno com gradiente
      '.at-hpm-inner {',
      '  width: 100%;',
      '  min-height: 521px;',
      '  background: linear-gradient(250.66deg, #7A202D 0.48%, #721825 50.24%, #68111E 75.12%, #5E0C18 87.56%, #690F1C 93.78%);',
      '  background-size: cover;',
      '  background-position: center;',
      '  padding: 24px;',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 16px;',
      '  border-radius: 4px;',
      '}',
      // Cabecalho
      '.at-hpm-header {',
      '  display: flex;',
      '  flex-direction: row;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  height: 45px;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-logos {',
      '  display: flex;',
      '  flex-direction: row;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.at-hpm-logo-azul {',
      '  width: 60px;',
      '  height: 33px;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-divider {',
      '  width: 1px;',
      '  height: 26px;',
      '  background: rgba(255, 255, 255, 0.6);',
      '  display: block;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-logo-partner {',
      '  width: 80px;',
      '  height: 45px;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-close {',
      '  width: 32px;',
      '  height: 32px;',
      '  border-radius: 50%;',
      '  background: rgba(0, 0, 0, 0.3);',
      '  border: none;',
      '  cursor: pointer;',
      '  color: rgba(255, 255, 255, 0.75);',
      '  font-size: 20px;',
      '  line-height: 1;',
      '  padding: 0;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-close:hover { background: rgba(0, 0, 0, 0.55); color: #ffffff; }',
      // Area de conteudo
      '.at-hpm-content {',
      '  display: flex;',
      '  flex-direction: row;',
      '  align-items: center;',
      '  gap: 40px;',
      '  flex: 1;',
      '}',
      // Coluna esquerda
      '.at-hpm-col-left {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 16px;',
      '  width: 312px;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-title {',
      '  width: 100%;',
      '  margin: 0;',
      '  font-family: "Noto Rashi Hebrew", serif;',
      '  font-weight: 400;',
      '  font-size: 32px;',
      '  line-height: 38px;',
      '  color: #D4B976;',
      '}',
      '.at-hpm-desc {',
      '  width: 100%;',
      '  margin: 0;',
      '  font-family: "Inter", sans-serif;',
      '  font-weight: 300;',
      '  font-size: 14px;',
      '  line-height: 20px;',
      '  color: #F1E1C4;',
      '}',
      // Card de oferta 20% OFF
      '.at-hpm-card {',
      '  position: relative;',
      '  width: 311px;',
      '  height: 183px;',
      '  border: 1px solid #F1E1C4;',
      '  border-radius: 20px;',
      '  box-sizing: border-box;',
      '  overflow: hidden;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-card__label {',
      '  position: absolute;',
      '  top: 16px;',
      '  left: 16px;',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 21px;',
      '  line-height: 120%;',
      '  color: #F1E1C4;',
      '  white-space: nowrap;',
      '}',
      '.at-hpm-card__sub {',
      '  position: absolute;',
      '  top: 18px;',
      '  left: 16px;',
      '  font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;',
      '  font-weight: 300;',
      '  font-size: 19px;',
      '  line-height: 120%;',
      '  color: #F1E1C4;',
      '  white-space: nowrap;',
      '}',
      '.at-hpm-card__num-row {',
      '  position: absolute;',
      '  left: 16px;',
      '  bottom: 10px;',
      '  display: flex;',
      '  align-items: flex-end;',
      '}',
      '.at-hpm-card__num {',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 128px;',
      '  line-height: 1;',
      '  color: #F1E1C4;',
      '  letter-spacing: -0.02em;',
      '}',
      '.at-hpm-card__pct-col {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: flex-start;',
      '  padding-bottom: 12px;',
      '}',
      '.at-hpm-card__pct {',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 64px;',
      '  line-height: 1;',
      '  color: #F1E1C4;',
      '}',
      '.at-hpm-card__off {',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 42px;',
      '  line-height: 1;',
      '  letter-spacing: -0.05em;',
      '  color: #F1E1C4;',
      '}',
      '.at-hpm-card__badge {',
      '  position: absolute;',
      '  top: 11px;',
      '  right: 11px;',
      '  width: 75px;',
      '  height: 24px;',
      '  background: #F1E1C4;',
      '  border-radius: 83px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  overflow: hidden;',
      '}',
      '.at-hpm-card__badge-img {',
      '  width: 58px;',
      '  height: 18px;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center;',
      '}',
      // Botao de cupom
      '.at-hpm-coupon {',
      '  width: 309px;',
      '  height: 43px;',
      '  background: #BA9161;',
      '  border-radius: 10px;',
      '  border: none;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  flex-shrink: 0;',
      '  transition: background 0.2s ease;',
      '}',
      '.at-hpm-coupon:hover { background: #a87e52; }',
      '.at-hpm-coupon__code {',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 21px;',
      '  line-height: 120%;',
      '  color: #211D1D;',
      '}',
      // Coluna direita
      '.at-hpm-col-right {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 16px;',
      '  width: 283px;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-univ-logo {',
      '  width: 118px;',
      '  height: 80px;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-hogwarts-img {',
      '  width: 250px;',
      '  height: 250px;',
      '  border-radius: 50%;',
      '  background-size: cover;',
      '  background-position: center;',
      '  background-color: rgba(255, 255, 255, 0.06);',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-cta {',
      '  width: 246px;',
      '  height: 38px;',
      '  background: #231D1E;',
      '  border-radius: 27px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 4px;',
      '  text-decoration: none;',
      '  transition: background 0.2s ease;',
      '  flex-shrink: 0;',
      '}',
      '.at-hpm-cta:hover { background: #3d3334; }',
      '.at-hpm-cta__text {',
      '  font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 18px;',
      '  line-height: 18px;',
      '  color: #F1E1C4;',
      '}',
      // Keyframes
      '@keyframes atHpmSpellOverlay {',
      '  0%   { opacity: 0; background: rgba(0, 0, 0, 0); }',
      '  12%  { opacity: 0.34; background: radial-gradient(circle at 50% 50%, rgba(44, 92, 186, 0.24) 0%, rgba(8, 17, 50, 0.34) 46%, rgba(0, 0, 0, 0) 100%); }',
      '  44%  { opacity: 0.92; background: radial-gradient(circle at 50% 50%, rgba(52, 120, 214, 0.28) 0%, rgba(13, 34, 96, 0.34) 44%, rgba(0, 0, 0, 0) 100%); }',
      '  72%  { opacity: 0.48; background: radial-gradient(circle at 50% 50%, rgba(36, 94, 190, 0.2) 0%, rgba(7, 16, 46, 0.36) 50%, rgba(0, 0, 0, 0) 100%); }',
      '  100% { opacity: 0; background: rgba(0, 0, 0, 0); }',
      '}',
      '@keyframes atHpmSpellCore {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.04); }',
      '  14%  { opacity: 0.96; transform: translate(-50%, -50%) scale(0.5); filter: brightness(0.95); }',
      '  28%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1.24); filter: brightness(0.78); }',
      '  34%  { opacity: 0.92; transform: translate(-50%, -50%) scale(1.55); filter: brightness(0.98); }',
      '  46%  { opacity: 0.82; transform: translate(-50%, -50%) scale(1.96); filter: brightness(0.8); }',
      '  58%  { opacity: 0.72; transform: translate(-50%, -50%) scale(2.35); filter: brightness(0.9); }',
      '  80%  { opacity: 0.28; transform: translate(-50%, -50%) scale(2.95); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(3.3); }',
      '}',
      '@keyframes atHpmSpellRing {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }',
      '  16%  { opacity: 0.95; }',
      '  42%  { opacity: 0.9; transform: translate(-50%, -50%) scale(9); border-width: 2px; }',
      '  70%  { opacity: 0.38; transform: translate(-50%, -50%) scale(13); border-width: 1px; }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(16); border-width: 1px; }',
      '}',
      '@keyframes atHpmSpellSpark {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scaleY(0.1); }',
      '  20%  { opacity: 1; }',
      '  58%  { opacity: 0.78; transform: translate(-50%, -50%) scaleY(1.08); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scaleY(1.35); }',
      '}',
      '@keyframes atHpmSpellSmokeA {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.24); }',
      '  22%  { opacity: 0.6; }',
      '  48%  { opacity: 0.55; transform: translate(-68%, -72%) scale(1.28); }',
      '  76%  { opacity: 0.34; transform: translate(-82%, -98%) scale(1.8); }',
      '  100% { opacity: 0; transform: translate(-92%, -118%) scale(2.2); }',
      '}',
      '@keyframes atHpmSpellSmokeNoiseA {',
      '  0%   { filter: blur(6px) brightness(1); }',
      '  35%  { filter: blur(12px) brightness(0.98); }',
      '  65%  { filter: blur(8px) brightness(0.8); }',
      '  100% { filter: blur(13px) brightness(0.68); }',
      '}',
      '@keyframes atHpmSpellSmokeB {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }',
      '  26%  { opacity: 0.54; }',
      '  52%  { opacity: 0.48; transform: translate(-20%, -84%) scale(1.18); }',
      '  78%  { opacity: 0.3; transform: translate(0%, -112%) scale(1.72); }',
      '  100% { opacity: 0; transform: translate(16%, -136%) scale(2.12); }',
      '}',
      '@keyframes atHpmSpellSmokeNoiseB {',
      '  0%   { filter: blur(7px) brightness(1); }',
      '  30%  { filter: blur(12px) brightness(0.96); }',
      '  60%  { filter: blur(9px) brightness(0.78); }',
      '  100% { filter: blur(13px) brightness(0.66); }',
      '}',
      '@keyframes atHpmSpellSmokeC {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.26); }',
      '  24%  { opacity: 0.58; }',
      '  50%  { opacity: 0.5; transform: translate(-40%, -40%) scale(1.22); }',
      '  76%  { opacity: 0.3; transform: translate(-52%, -20%) scale(1.66); }',
      '  100% { opacity: 0; transform: translate(-64%, 2%) scale(2.06); }',
      '}',
      '@keyframes atHpmSpellSmokeNoiseC {',
      '  0%   { filter: blur(7px) brightness(1); }',
      '  34%  { filter: blur(12px) brightness(0.98); }',
      '  66%  { filter: blur(8px) brightness(0.8); }',
      '  100% { filter: blur(13px) brightness(0.64); }',
      '}',
      '@keyframes atHpmSpellDust {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }',
      '  18%  { opacity: 1; }',
      '  56%  { opacity: 0.7; }',
      '  100% { opacity: 0; transform: translate(calc(-50% + var(--d-x)), calc(-50% + var(--d-y))) scale(0.08); }',
      '}',
      '@keyframes atHpmSpellBurst {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }',
      '  38%  { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }',
      '  56%  { opacity: 0.92; transform: translate(-50%, -50%) scale(4.8); }',
      '  78%  { opacity: 0.46; transform: translate(-50%, -50%) scale(8.4); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(11.5); }',
      '}',
      // Responsivo — mobile
      '@media (max-width: 740px) {',
      '  .at-hpm-outer { width: calc(100vw - 24px); }',
      '  .at-hpm-inner { min-height: auto; overflow-y: auto; max-height: calc(100vh - 40px); }',
      '  .at-hpm-content { flex-direction: column; gap: 20px; }',
      '  .at-hpm-col-left { width: 100%; align-items: flex-start; }',
      '  .at-hpm-col-right { width: 100%; align-items: center; }',
      '  .at-hpm-card { width: 100%; height: 140px; }',
      '  .at-hpm-card__num { font-size: 88px; }',
      '  .at-hpm-card__pct { font-size: 44px; }',
      '  .at-hpm-card__off { font-size: 29px; }',
      '  .at-hpm-coupon { width: 100%; }',
      '  .at-hpm-univ-logo { width: 100px; height: 70px; }',
      '  .at-hpm-hogwarts-img { width: 180px; height: 180px; }',
      '  .at-hpm-cta { width: 100%; }',
      '  .at-hpm-title { font-size: 24px; line-height: 30px; }',
      '}',
      // Respeita preferencia de reducao de movimento
      '@media (prefers-reduced-motion: reduce) {',
      '  .at-hpm-flash.is-active,',
      '  .at-hpm-flash.is-active .at-hpm-flash__beam,',
      '  .at-hpm-flash.is-active .at-hpm-flash__ring,',
      '  .at-hpm-flash.is-active .at-hpm-flash__spark,',
      '  .at-hpm-flash.is-active .at-hpm-flash__smoke,',
      '  .at-hpm-flash.is-active .at-hpm-flash__dust,',
      '  .at-hpm-flash.is-active .at-hpm-flash__burst { animation: none; opacity: 0; }',
      '  .at-hpm-modal { transition: opacity 0.3s ease; }',
      '  .at-hpm-modal.is-visible { transform: none; }',
      '  .at-hpm-modal.is-dismissed { transform: none; }',
      '}'
    ].join('\n');
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(getStyles()));
    document.head.appendChild(style);
  }

  // --- Flash: feixe de luz tipo feitico ---
  function createFlashElement() {
    const flash = document.createElement('div');
    const beam = document.createElement('div');
    const ring = document.createElement('div');
    const spark1 = document.createElement('div');
    const spark2 = document.createElement('div');
    const spark3 = document.createElement('div');
    const spark4 = document.createElement('div');
    const smoke1 = document.createElement('div');
    const smoke2 = document.createElement('div');
    const smoke3 = document.createElement('div');
    const dust1 = document.createElement('div');
    const dust2 = document.createElement('div');
    const dust3 = document.createElement('div');
    const dust4 = document.createElement('div');
    const burst = document.createElement('div');

    flash.id = FLASH_ID;
    flash.className = 'at-hpm-flash';
    flash.setAttribute('aria-hidden', 'true');

    beam.className = 'at-hpm-flash__beam';
    ring.className = 'at-hpm-flash__ring';
    spark1.className = 'at-hpm-flash__spark at-hpm-flash__spark--1';
    spark2.className = 'at-hpm-flash__spark at-hpm-flash__spark--2';
    spark3.className = 'at-hpm-flash__spark at-hpm-flash__spark--3';
    spark4.className = 'at-hpm-flash__spark at-hpm-flash__spark--4';
    smoke1.className = 'at-hpm-flash__smoke at-hpm-flash__smoke--1';
    smoke2.className = 'at-hpm-flash__smoke at-hpm-flash__smoke--2';
    smoke3.className = 'at-hpm-flash__smoke at-hpm-flash__smoke--3';
    dust1.className = 'at-hpm-flash__dust at-hpm-flash__dust--1';
    dust2.className = 'at-hpm-flash__dust at-hpm-flash__dust--2';
    dust3.className = 'at-hpm-flash__dust at-hpm-flash__dust--3';
    dust4.className = 'at-hpm-flash__dust at-hpm-flash__dust--4';
    burst.className = 'at-hpm-flash__burst';

    flash.appendChild(beam);
    flash.appendChild(ring);
    flash.appendChild(spark1);
    flash.appendChild(spark2);
    flash.appendChild(spark3);
    flash.appendChild(spark4);
    flash.appendChild(smoke1);
    flash.appendChild(smoke2);
    flash.appendChild(smoke3);
    flash.appendChild(dust1);
    flash.appendChild(dust2);
    flash.appendChild(dust3);
    flash.appendChild(dust4);
    flash.appendChild(burst);

    return flash;
  }

  // Icone SVG de copiar para o botao de cupom
  function createCopyIconSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 18 18');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');

    rect1.setAttribute('x', '5');
    rect1.setAttribute('y', '1');
    rect1.setAttribute('width', '11');
    rect1.setAttribute('height', '13');
    rect1.setAttribute('rx', '2');
    rect1.setAttribute('stroke', '#211D1D');
    rect1.setAttribute('stroke-width', '1.5');

    rect2.setAttribute('x', '2');
    rect2.setAttribute('y', '4');
    rect2.setAttribute('width', '11');
    rect2.setAttribute('height', '13');
    rect2.setAttribute('rx', '2');
    rect2.setAttribute('stroke', '#211D1D');
    rect2.setAttribute('stroke-width', '1.5');

    svg.appendChild(rect1);
    svg.appendChild(rect2);

    return svg;
  }

  // Card de oferta: 20% OFF
  function createOfferCard() {
    const card = document.createElement('div');
    const label = document.createElement('span');
    const sub = document.createElement('span');
    const numRow = document.createElement('div');
    const num = document.createElement('span');
    const pctCol = document.createElement('div');
    const pct = document.createElement('span');
    const off = document.createElement('span');
    const badge = document.createElement('div');
    const badgeImg = document.createElement('div');

    card.className = 'at-hpm-card';

    label.className = 'at-hpm-card__label';
    label.textContent = 'Pacotes';

    sub.className = 'at-hpm-card__sub';
    sub.textContent = '(a\u00e9reo + hotel) com';

    numRow.className = 'at-hpm-card__num-row';

    num.className = 'at-hpm-card__num';
    num.textContent = '20';

    pctCol.className = 'at-hpm-card__pct-col';

    pct.className = 'at-hpm-card__pct';
    pct.textContent = '%';

    off.className = 'at-hpm-card__off';
    off.textContent = 'OFF';

    pctCol.appendChild(pct);
    pctCol.appendChild(off);

    numRow.appendChild(num);
    numRow.appendChild(pctCol);

    badge.className = 'at-hpm-card__badge';

    badgeImg.className = 'at-hpm-card__badge-img';

    if (IMG_AZUL_LOGO) {
      badgeImg.style.setProperty('background-image', 'url(' + IMG_AZUL_LOGO + ')');
    } else {
      // Fallback textual enquanto a URL da imagem nao for configurada
      badgeImg.style.setProperty('font-family', '"Helvetica", "Arial", sans-serif');
      badgeImg.style.setProperty('font-weight', '700');
      badgeImg.style.setProperty('font-size', '11px');
      badgeImg.style.setProperty('color', '#211D1D');
      badgeImg.style.setProperty('display', 'flex');
      badgeImg.style.setProperty('align-items', 'center');
      badgeImg.style.setProperty('justify-content', 'center');
      badgeImg.textContent = 'AZUL';
    }

    badge.appendChild(badgeImg);

    card.appendChild(label);
    card.appendChild(sub);
    card.appendChild(numRow);
    card.appendChild(badge);

    return card;
  }

  // Botao de cupom com icone de copiar
  function createCouponButton() {
    const btn = document.createElement('button');
    const code = document.createElement('span');

    btn.className = 'at-hpm-coupon';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copiar cupom ' + COUPON_CODE);

    code.className = 'at-hpm-coupon__code';
    code.textContent = COUPON_CODE;

    btn.appendChild(createCopyIconSvg());
    btn.appendChild(code);

    return btn;
  }

  // Backdrop semi-transparente
  function createBackdropElement() {
    const backdrop = document.createElement('div');
    backdrop.className = 'at-hpm-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    return backdrop;
  }

  // Elemento principal do modal
  function createModalElement() {
    const modal = document.createElement('div');
    const outer = document.createElement('div');
    const inner = document.createElement('div');

    // Cabecalho
    const header = document.createElement('div');
    const logos = document.createElement('div');
    const logoAzul = document.createElement('div');
    const divider = document.createElement('span');
    const logoPartner = document.createElement('div');
    const closeBtn = document.createElement('button');

    // Conteudo
    const content = document.createElement('div');

    // Coluna esquerda
    const colLeft = document.createElement('div');
    const title = document.createElement('h2');
    const desc = document.createElement('p');

    // Coluna direita
    const colRight = document.createElement('div');
    const univLogo = document.createElement('div');
    const hogwartsImg = document.createElement('div');
    const ctaLink = document.createElement('a');
    const ctaText = document.createElement('span');

    // --- Modal wrapper ---
    modal.id = MODAL_ID;
    modal.className = 'at-hpm-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Oferta Expresso de Hogwarts - 20% OFF em pacotes');

    outer.className = 'at-hpm-outer';
    inner.className = 'at-hpm-inner';

    if (IMG_BG) {
      inner.style.setProperty(
        'background',
        'url(' + IMG_BG + ') center/cover no-repeat, ' +
        'linear-gradient(250.66deg, #7A202D 0.48%, #721825 50.24%, #68111E 75.12%, #5E0C18 87.56%, #690F1C 93.78%)'
      );
    }

    // --- Cabecalho ---
    header.className = 'at-hpm-header';

    logos.className = 'at-hpm-logos';

    logoAzul.className = 'at-hpm-logo-azul';
    logoAzul.setAttribute('role', 'img');
    logoAzul.setAttribute('aria-label', 'Azul Viagens');

    if (IMG_AZUL_LOGO) {
      logoAzul.style.setProperty('background-image', 'url(' + IMG_AZUL_LOGO + ')');
    }

    divider.className = 'at-hpm-divider';
    divider.setAttribute('aria-hidden', 'true');

    logoPartner.className = 'at-hpm-logo-partner';
    logoPartner.setAttribute('role', 'img');
    logoPartner.setAttribute('aria-label', 'Parceiro');

    if (IMG_PARTNER_LOGO) {
      logoPartner.style.setProperty('background-image', 'url(' + IMG_PARTNER_LOGO + ')');
    }

    logos.appendChild(logoAzul);
    logos.appendChild(divider);
    logos.appendChild(logoPartner);

    closeBtn.className = 'at-hpm-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar modal');
    closeBtn.textContent = '\u00d7';

    header.appendChild(logos);
    header.appendChild(closeBtn);

    // --- Coluna esquerda ---
    colLeft.className = 'at-hpm-col-left';

    title.className = 'at-hpm-title';
    title.textContent = 'Embarque nessa viagem m\u00e1gica';

    desc.className = 'at-hpm-desc';
    desc.textContent = 'Passagens para Orlando e Los Angeles. Seu sonho no Expresso de Hogwarts come\u00e7a aqui!';

    colLeft.appendChild(title);
    colLeft.appendChild(desc);
    colLeft.appendChild(createOfferCard());
    colLeft.appendChild(createCouponButton());

    // --- Coluna direita ---
    colRight.className = 'at-hpm-col-right';

    univLogo.className = 'at-hpm-univ-logo';
    univLogo.setAttribute('role', 'img');
    univLogo.setAttribute('aria-label', 'The Wizarding World of Harry Potter - Universal Studios Hollywood');

    if (IMG_UNIVERSAL_LOGO) {
      univLogo.style.setProperty('background-image', 'url(' + IMG_UNIVERSAL_LOGO + ')');
    }

    hogwartsImg.className = 'at-hpm-hogwarts-img';
    hogwartsImg.setAttribute('role', 'img');
    hogwartsImg.setAttribute('aria-label', 'Expresso de Hogwarts');

    if (IMG_HOGWARTS) {
      hogwartsImg.style.setProperty('background-image', 'url(' + IMG_HOGWARTS + ')');
    }

    ctaLink.className = 'at-hpm-cta';
    ctaLink.href = CTA_URL;
    ctaLink.target = '_blank';
    ctaLink.rel = 'noopener noreferrer';
    ctaLink.setAttribute('aria-label', 'Eu quero - ver pacotes Hogwarts');

    ctaText.className = 'at-hpm-cta__text';
    ctaText.textContent = 'Eu quero';

    ctaLink.appendChild(ctaText);

    colRight.appendChild(univLogo);
    colRight.appendChild(hogwartsImg);
    colRight.appendChild(ctaLink);

    // --- Montar conteudo ---
    content.className = 'at-hpm-content';
    content.appendChild(colLeft);
    content.appendChild(colRight);

    // --- Montar hierarquia ---
    inner.appendChild(header);
    inner.appendChild(content);
    outer.appendChild(inner);
    modal.appendChild(outer);

    return modal;
  }

  // Fecha e remove o modal do DOM
  function dismissModal(trackLabel) {
    const modal = document.getElementById(MODAL_ID);
    const backdrop = document.querySelector('.at-hpm-backdrop');

    if (!modal) {
      return;
    }

    isDismissed = true;

    if (couponCopyTimer) {
      clearTimeout(couponCopyTimer);
      couponCopyTimer = null;
    }

    if (trackLabel) {
      analyticsEvent(trackLabel, 'click');
    }

    modal.classList.remove('is-visible');
    modal.classList.add('is-dismissed');

    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.classList.add('is-dismissed');
    }

    setTimeout(function () {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }

      if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    }, 450);
  }

  // Copia o codigo do cupom para a area de transferencia
  function handleCouponCopy(codeSpan) {
    if (couponCopyTimer) {
      return;
    }

    const originalText = codeSpan.textContent;

    function onSuccess() {
      codeSpan.textContent = 'Cód. Copiado';
      analyticsEvent('copiar_cupom_' + COUPON_CODE, 'click');

      couponCopyTimer = setTimeout(function () {
        codeSpan.textContent = originalText;
        couponCopyTimer = null;
      }, 2000);
    }

    function onError() {
      console.log('[HogwartsPromo] Nao foi possivel copiar o cupom.');
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(COUPON_CODE).then(onSuccess).catch(onError);
      return;
    }

    // Fallback para ambientes sem suporte a Clipboard API
    const input = document.createElement('input');
    input.value = COUPON_CODE;
    input.style.setProperty('position', 'absolute');
    input.style.setProperty('left', '-9999px');
    input.style.setProperty('top', '-9999px');
    input.setAttribute('aria-hidden', 'true');
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      onError();
    }

    document.body.removeChild(input);
  }

  // Adiciona listeners ao modal de forma idempotente via data-*
  function ensureListeners() {
    const modal = document.getElementById(MODAL_ID);

    if (!modal) {
      return;
    }

    // Botao fechar
    const closeBtn = modal.querySelector('.at-hpm-close');

    if (closeBtn && closeBtn.getAttribute('data-close-added') !== 'true') {
      closeBtn.setAttribute('data-close-added', 'true');
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        dismissModal('fechar_modal_hogwarts');
      });
    }

    // Clique fora do card (no container do modal)
    if (modal.getAttribute('data-outside-click-added') !== 'true') {
      modal.setAttribute('data-outside-click-added', 'true');
      modal.addEventListener('click', function (event) {
        const outer = modal.querySelector('.at-hpm-outer');

        if (outer && outer.contains(event.target)) {
          return;
        }

        dismissModal('fechar_fora_modal_hogwarts');
      });
    }

    // Botao cupom
    const couponBtn = modal.querySelector('.at-hpm-coupon');

    if (couponBtn && couponBtn.getAttribute('data-coupon-added') !== 'true') {
      couponBtn.setAttribute('data-coupon-added', 'true');
      const codeSpan = couponBtn.querySelector('.at-hpm-coupon__code');

      couponBtn.addEventListener('click', function () {
        if (codeSpan) {
          handleCouponCopy(codeSpan);
        }
      });
    }

    // Link CTA
    const ctaLink = modal.querySelector('.at-hpm-cta');

    if (ctaLink && ctaLink.getAttribute('data-cta-added') !== 'true') {
      ctaLink.setAttribute('data-cta-added', 'true');
      ctaLink.addEventListener('click', function () {
        analyticsEvent('clique_cta_eu_quero', 'click');
      });
    }
  }

  // Renderiza o modal (sem flash — uso interno apos o flash ou em re-render de SPA)
  function renderModal() {
    let modal = null;
    let backdrop = null;

    if (isDismissed) {
      return;
    }

    modal = document.getElementById(MODAL_ID);

    if (!modal) {
      backdrop = createBackdropElement();
      modal = createModalElement();

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);

      requestAnimationFrame(function () {
        backdrop.classList.add('is-visible');
        modal.classList.add('is-visible');
      });
    }

    ensureListeners();

    if (!hasTrackedView) {
      analyticsEvent('visualizacao_modal_hogwarts', 'view');
      hasTrackedView = true;
    }
  }

  // Exibe o feixe de luz e, em seguida, o modal
  function showWithFlash() {
    let flash = document.getElementById(FLASH_ID);

    if (!flash) {
      flash = createFlashElement();
      document.body.appendChild(flash);
    }

    requestAnimationFrame(function () {
      flash.classList.add('is-active');
    });

    setTimeout(function () {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }

      renderModal();
    }, FLASH_DURATION);
  }

  // Processa alteracoes no DOM vindas do MutationObserver
  function processDomChanges() {
    if (isProcessing || isDismissed) {
      return;
    }

    isProcessing = true;

    try {
      if (hasTrackedView && !document.getElementById(MODAL_ID)) {
        // Modal ja foi exibido mas foi removido externamente (ex: re-render de SPA)
        // Re-exibe sem repetir o flash
        renderModal();
      } else {
        ensureListeners();
      }
    } finally {
      isProcessing = false;
    }
  }

  function observeDom() {
    if (observer || isDismissed) {
      return;
    }

    observer = new MutationObserver(function (mutationList) {
      let index = 0;
      let shouldProcess = false;
      const modal = document.getElementById(MODAL_ID);

      for (index = 0; index < mutationList.length; index++) {
        const mutation = mutationList[index];

        if (mutation.type !== 'childList') {
          continue;
        }

        if (modal && modal.contains(mutation.target)) {
          continue;
        }

        shouldProcess = true;
        break;
      }

      if (!shouldProcess) {
        return;
      }

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(function () {
        processDomChanges();
      }, OBSERVER_DEBOUNCE);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function tryInit() {
    if (!document.body || !document.head) {
      if (retryCount >= MAX_RETRIES) {
        console.log('[AT HogwartsPromo] Limite de tentativas atingido para inicializacao.');
        return;
      }

      retryCount = retryCount + 1;
      setTimeout(tryInit, RETRY_INTERVAL);
      return;
    }

    injectStyle();
    showWithFlash();
    observeDom();
  }

  function initWhenReady() {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

    if (isReady) {
      tryInit();
      return;
    }

    document.addEventListener('DOMContentLoaded', function onDomReady() {
      document.removeEventListener('DOMContentLoaded', onDomReady);
      tryInit();
    });
  }

  initWhenReady();
})();
