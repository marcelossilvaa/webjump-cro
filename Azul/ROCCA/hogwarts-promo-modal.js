(function () {
  'use strict';

  // --- Controle da experiencia ---
  let retryCount = 0;
  let observer = null;
  let debounceTimer = null;
  let isProcessingObserver = false;
  let hasTrackedView = false;
  let isDismissed = false;
  let couponCopyTimer = null;
  let spellHasStarted = false;
  let internalMutationLock = false;

  // --- Constantes ---
  const EXPERIENCE_FLAG = 'AT_HOGWARTS_PROMO_MODAL_2026';
  const STYLE_ID = 'at-hpm-style';
  const FLASH_ID = 'at-hpm-flash';
  const BACKDROP_ID = 'at-hpm-backdrop';
  const MODAL_ID = 'at-hpm-modal';
  const BODY_DATA_KEYDOWN = 'data-hpm-keydown-added';
  const BODY_DATA_OUTSIDE = 'data-hpm-outside-added';
  const COUPON_CODE = 'CONSUMIDOR20';
  const CTA_URL = 'https://www.voeazul.com.br/br/pt/viagem-completa/universal';
  const FLASH_DURATION = 1450;
  const DISMISS_DURATION = 420;
  const MAX_RETRIES = 30;
  const RETRY_INTERVAL = 250;
  const OBSERVER_DEBOUNCE = 160;

  // --- URLs das imagens ---
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

  function getStyles() {
    return [
      // Flash de abertura estilo dark cinema
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
      '.at-hpm-flash__core {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 236px;',
      '  height: 236px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle, rgba(136, 180, 246, 0.46) 0%, rgba(60, 103, 186, 0.48) 28%, rgba(22, 46, 109, 0.54) 56%, rgba(8, 16, 44, 0) 82%);',
      '  box-shadow: 0 0 24px 8px rgba(38, 68, 132, 0.58), 0 0 84px 30px rgba(12, 30, 80, 0.56), inset 0 0 20px rgba(106, 150, 220, 0.22);',
      '  transform: translate(-50%, -50%) scale(0.07);',
      '  opacity: 0;',
      '  will-change: transform, opacity, filter;',
      '}',
      '.at-hpm-flash.is-active .at-hpm-flash__core {',
      '  animation: atHpmSpellCore 1450ms cubic-bezier(0.2, 0.95, 0.25, 1) forwards;',
      '}',
      '.at-hpm-flash__ring {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 24px;',
      '  height: 24px;',
      '  border-radius: 50%;',
      '  border: 2px solid rgba(118, 154, 222, 0.72);',
      '  box-shadow: 0 0 11px rgba(50, 84, 152, 0.7), inset 0 0 8px rgba(98, 140, 205, 0.38);',
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
      '  background: linear-gradient(180deg, rgba(146, 188, 246, 0.66) 0%, rgba(70, 118, 194, 0.44) 48%, rgba(14, 32, 86, 0) 100%);',
      '  transform-origin: 50% 0%;',
      '  opacity: 0;',
      '  mix-blend-mode: screen;',
      '}',
      '.at-hpm-flash__spark--1 { transform: translate(-50%, -50%) rotate(18deg); }',
      '.at-hpm-flash__spark--2 { transform: translate(-50%, -50%) rotate(-34deg); }',
      '.at-hpm-flash__spark--3 { transform: translate(-50%, -50%) rotate(72deg); }',
      '.at-hpm-flash__spark--4 { transform: translate(-50%, -50%) rotate(-80deg); }',
      '.at-hpm-flash.is-active .at-hpm-flash__spark {',
      '  animation: atHpmSpellSpark 980ms ease-out 110ms forwards;',
      '}',
      '.at-hpm-flash__smoke {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 128px;',
      '  height: 96px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle at 42% 45%, rgba(126, 154, 202, 0.34) 0%, rgba(70, 90, 140, 0.34) 36%, rgba(26, 37, 68, 0.38) 62%, rgba(8, 12, 26, 0) 100%);',
      '  filter: blur(11px);',
      '  opacity: 0;',
      '  transform: translate(-50%, -50%) scale(0.28);',
      '  mix-blend-mode: screen;',
      '  will-change: transform, opacity, filter;',
      '}',
      '.at-hpm-flash__smoke--1 { margin-left: -18px; margin-top: 8px; }',
      '.at-hpm-flash__smoke--2 { margin-left: 25px; margin-top: -6px; }',
      '.at-hpm-flash__smoke--3 { margin-left: -6px; margin-top: 22px; }',
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
      '  background: rgba(140, 178, 232, 0.74);',
      '  box-shadow: 0 0 9px rgba(46, 78, 136, 0.72);',
      '  opacity: 0;',
      '  transform: translate(-50%, -50%) scale(0.18);',
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
      '  background: radial-gradient(circle, rgba(134, 174, 232, 0.62) 0%, rgba(54, 92, 164, 0.44) 42%, rgba(16, 30, 72, 0) 78%);',
      '  transform: translate(-50%, -50%) scale(0.3);',
      '  opacity: 0;',
      '}',
      '.at-hpm-flash.is-active .at-hpm-flash__burst {',
      '  animation: atHpmSpellBurst 1450ms ease-out forwards;',
      '}',

      // Backdrop e modal
      '.at-hpm-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 2147483600;',
      '  background: radial-gradient(circle at 45% 35%, rgba(18, 26, 48, 0.42) 0%, rgba(8, 10, 18, 0.88) 52%, rgba(3, 4, 8, 0.94) 100%);',
      '  opacity: 0;',
      '  transition: opacity 0.35s ease;',
      '}',
      '.at-hpm-backdrop.is-visible { opacity: 1; }',
      '.at-hpm-backdrop.is-dismissed { opacity: 0; pointer-events: none; }',
      '.at-hpm-modal {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 2147483620;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  pointer-events: none;',
      '  opacity: 0;',
      '  transform: scale(0.95);',
      '  transition: opacity 0.35s ease, transform 0.35s ease;',
      '}',
      '.at-hpm-modal.is-visible {',
      '  opacity: 1;',
      '  transform: scale(1);',
      '  pointer-events: auto;',
      '}',
      '.at-hpm-modal.is-dismissed {',
      '  opacity: 0;',
      '  transform: scale(0.95);',
      '  pointer-events: none;',
      '}',
      '.at-hpm-outer {',
      '  width: 692px;',
      '  max-width: calc(100vw - 24px);',
      '  background: linear-gradient(180deg, #cbb892 0%, #a78f67 55%, #8f7650 100%);',
      '  padding: 2px;',
      '  box-sizing: border-box;',
      '  border-radius: 8px;',
      '  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.48), 0 3px 0 rgba(255, 242, 198, 0.12) inset;',
      '}',
      '.at-hpm-inner {',
      '  width: 100%;',
      '  min-height: 521px;',
      '  background: linear-gradient(250.66deg, #6e1a27 0.48%, #5f1320 50.24%, #55101b 75.12%, #430914 87.56%, #500b17 93.78%);',
      '  background-size: cover;',
      '  background-position: center;',
      '  padding: 24px;',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 16px;',
      '  border-radius: 6px;',
      '}',

      // Cabecalho
      '.at-hpm-header {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  min-height: 45px;',
      '}',
      '.at-hpm-logos {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '}',
      '.at-hpm-logo-azul {',
      '  width: 60px;',
      '  height: 33px;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center;',
      '}',
      '.at-hpm-divider {',
      '  width: 1px;',
      '  height: 26px;',
      '  background: rgba(255, 255, 255, 0.62);',
      '  display: block;',
      '}',
      '.at-hpm-logo-partner {',
      '  width: 80px;',
      '  height: 45px;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center;',
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
      '}',
      '.at-hpm-close:hover { background: rgba(0, 0, 0, 0.56); color: #ffffff; }',

      // Conteudo
      '.at-hpm-content {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 40px;',
      '  flex: 1;',
      '}',
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
      '  color: #d8be80;',
      '}',
      '.at-hpm-desc {',
      '  width: 100%;',
      '  margin: 0;',
      '  font-family: "Inter", sans-serif;',
      '  font-weight: 300;',
      '  font-size: 14px;',
      '  line-height: 20px;',
      '  color: #f1e1c4;',
      '}',

      // Card de oferta
      '.at-hpm-card {',
      '  position: relative;',
      '  width: 311px;',
      '  height: 183px;',
      '  border: 1px solid #f1e1c4;',
      '  border-radius: 20px;',
      '  box-sizing: border-box;',
      '  overflow: hidden;',
      '  padding: 16px 16px 12px;',
      '}',
      '.at-hpm-card__label {',
      '  position: absolute;',
      '  top: 12px;',
      '  left: 16px;',
      '  margin: 0;',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 21px;',
      '  line-height: 120%;',
      '  color: #f1e1c4;',
      '  white-space: nowrap;',
      '}',
      '.at-hpm-card__sub {',
      '  position: absolute;',
      '  top: 44px;',
      '  left: 16px;',
      '  margin: 0;',
      '  font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;',
      '  font-weight: 300;',
      '  font-size: 18px;',
      '  line-height: 120%;',
      '  color: #f1e1c4;',
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
      '  font-size: 124px;',
      '  line-height: 1;',
      '  color: #f1e1c4;',
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
      '  font-size: 62px;',
      '  line-height: 1;',
      '  color: #f1e1c4;',
      '}',
      '.at-hpm-card__off {',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 40px;',
      '  line-height: 1;',
      '  letter-spacing: -0.05em;',
      '  color: #f1e1c4;',
      '}',
      '.at-hpm-card__badge {',
      '  position: absolute;',
      '  top: 12px;',
      '  right: 12px;',
      '  width: 75px;',
      '  height: 24px;',
      '  background: #f1e1c4;',
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

      // Cupom
      '.at-hpm-coupon {',
      '  width: 309px;',
      '  height: 43px;',
      '  background: #ba9161;',
      '  border-radius: 10px;',
      '  border: none;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  transition: background 0.2s ease;',
      '}',
      '.at-hpm-coupon:hover { background: #a87e52; }',
      '.at-hpm-coupon__code {',
      '  font-family: "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 21px;',
      '  line-height: 120%;',
      '  color: #211d1d;',
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
      '}',
      '.at-hpm-hogwarts-img {',
      '  width: 250px;',
      '  height: 250px;',
      '  border-radius: 50%;',
      '  background-size: contain;',
      '  background-repeat: no-repeat;',
      '  background-position: center center;',
      '  background-color: rgba(255, 255, 255, 0.06);',
      '}',
      '.at-hpm-cta {',
      '  width: 246px;',
      '  height: 38px;',
      '  background: #231d1e;',
      '  border-radius: 27px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 4px;',
      '  text-decoration: none;',
      '  transition: background 0.2s ease;',
      '}',
      '.at-hpm-cta:hover { background: #3a3031; }',
      '.at-hpm-cta__text {',
      '  font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 18px;',
      '  line-height: 18px;',
      '  color: #f1e1c4;',
      '}',

      // Keyframes do feitiço
      '@keyframes atHpmSpellOverlay {',
      '  0%   { opacity: 0; background: rgba(0, 0, 0, 0); }',
      '  12%  { opacity: 0.34; background: radial-gradient(circle at 50% 50%, rgba(24, 44, 98, 0.24) 0%, rgba(8, 16, 44, 0.45) 46%, rgba(0, 0, 0, 0.1) 100%); }',
      '  42%  { opacity: 0.92; background: radial-gradient(circle at 50% 50%, rgba(30, 62, 132, 0.3) 0%, rgba(10, 24, 68, 0.5) 44%, rgba(0, 0, 0, 0.28) 100%); }',
      '  72%  { opacity: 0.46; background: radial-gradient(circle at 50% 50%, rgba(22, 46, 98, 0.22) 0%, rgba(8, 16, 44, 0.46) 50%, rgba(0, 0, 0, 0.3) 100%); }',
      '  100% { opacity: 0; background: rgba(0, 0, 0, 0); }',
      '}',
      '@keyframes atHpmSpellCore {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.04); }',
      '  14%  { opacity: 0.94; transform: translate(-50%, -50%) scale(0.56); filter: brightness(0.9); }',
      '  30%  { opacity: 0.82; transform: translate(-50%, -50%) scale(1.22); filter: brightness(0.74); }',
      '  42%  { opacity: 0.9; transform: translate(-50%, -50%) scale(1.6); filter: brightness(0.9); }',
      '  56%  { opacity: 0.72; transform: translate(-50%, -50%) scale(2.08); filter: brightness(0.78); }',
      '  78%  { opacity: 0.24; transform: translate(-50%, -50%) scale(2.84); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(3.28); }',
      '}',
      '@keyframes atHpmSpellRing {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }',
      '  16%  { opacity: 0.95; }',
      '  42%  { opacity: 0.84; transform: translate(-50%, -50%) scale(9); border-width: 2px; }',
      '  72%  { opacity: 0.34; transform: translate(-50%, -50%) scale(13); border-width: 1px; }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(16); border-width: 1px; }',
      '}',
      '@keyframes atHpmSpellSpark {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scaleY(0.1); }',
      '  20%  { opacity: 1; }',
      '  58%  { opacity: 0.72; transform: translate(-50%, -50%) scaleY(1.04); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scaleY(1.34); }',
      '}',
      '@keyframes atHpmSpellSmokeA {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.24); }',
      '  22%  { opacity: 0.6; }',
      '  50%  { opacity: 0.5; transform: translate(-68%, -72%) scale(1.3); }',
      '  76%  { opacity: 0.32; transform: translate(-82%, -98%) scale(1.82); }',
      '  100% { opacity: 0; transform: translate(-94%, -122%) scale(2.26); }',
      '}',
      '@keyframes atHpmSpellSmokeNoiseA {',
      '  0%   { filter: blur(7px) brightness(0.98); }',
      '  35%  { filter: blur(13px) brightness(0.92); }',
      '  65%  { filter: blur(9px) brightness(0.78); }',
      '  100% { filter: blur(14px) brightness(0.64); }',
      '}',
      '@keyframes atHpmSpellSmokeB {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }',
      '  26%  { opacity: 0.54; }',
      '  52%  { opacity: 0.46; transform: translate(-20%, -86%) scale(1.22); }',
      '  78%  { opacity: 0.28; transform: translate(0%, -114%) scale(1.74); }',
      '  100% { opacity: 0; transform: translate(16%, -136%) scale(2.14); }',
      '}',
      '@keyframes atHpmSpellSmokeNoiseB {',
      '  0%   { filter: blur(8px) brightness(0.98); }',
      '  30%  { filter: blur(13px) brightness(0.9); }',
      '  60%  { filter: blur(10px) brightness(0.74); }',
      '  100% { filter: blur(14px) brightness(0.62); }',
      '}',
      '@keyframes atHpmSpellSmokeC {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.26); }',
      '  24%  { opacity: 0.58; }',
      '  50%  { opacity: 0.48; transform: translate(-40%, -40%) scale(1.26); }',
      '  76%  { opacity: 0.28; transform: translate(-52%, -20%) scale(1.68); }',
      '  100% { opacity: 0; transform: translate(-64%, 2%) scale(2.06); }',
      '}',
      '@keyframes atHpmSpellSmokeNoiseC {',
      '  0%   { filter: blur(8px) brightness(0.98); }',
      '  34%  { filter: blur(13px) brightness(0.9); }',
      '  66%  { filter: blur(9px) brightness(0.76); }',
      '  100% { filter: blur(14px) brightness(0.6); }',
      '}',
      '@keyframes atHpmSpellDust {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.18); }',
      '  20%  { opacity: 0.92; }',
      '  56%  { opacity: 0.64; }',
      '  100% { opacity: 0; transform: translate(calc(-50% + var(--d-x)), calc(-50% + var(--d-y))) scale(0.08); }',
      '}',
      '@keyframes atHpmSpellBurst {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }',
      '  38%  { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }',
      '  56%  { opacity: 0.86; transform: translate(-50%, -50%) scale(4.6); }',
      '  78%  { opacity: 0.42; transform: translate(-50%, -50%) scale(8.2); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(11.3); }',
      '}',

      // Responsivo
      '@media (max-width: 740px) {',
      '  .at-hpm-outer { width: calc(100vw - 24px); }',
      '  .at-hpm-inner { min-height: auto; overflow-y: auto; max-height: calc(100vh - 40px); padding: 18px; }',
      '  .at-hpm-content { flex-direction: column; gap: 20px; }',
      '  .at-hpm-col-left { width: 100%; align-items: flex-start; }',
      '  .at-hpm-col-right { width: 100%; align-items: center; }',
      '  .at-hpm-title { font-size: 24px; line-height: 30px; }',
      '  .at-hpm-card { width: 100%; height: 152px; }',
      '  .at-hpm-card__label { font-size: 18px; top: 10px; }',
      '  .at-hpm-card__sub { top: 34px; font-size: 15px; }',
      '  .at-hpm-card__num-row { bottom: 8px; }',
      '  .at-hpm-card__num { font-size: 88px; }',
      '  .at-hpm-card__pct { font-size: 44px; }',
      '  .at-hpm-card__off { font-size: 29px; }',
      '  .at-hpm-coupon { width: 100%; }',
      '  .at-hpm-univ-logo { width: 100px; height: 70px; }',
      '  .at-hpm-hogwarts-img { width: 180px; height: 180px; }',
      '  .at-hpm-cta { width: 100%; }',
      '}',

      // Acessibilidade de movimento reduzido
      '@media (prefers-reduced-motion: reduce) {',
      '  .at-hpm-flash.is-active,',
      '  .at-hpm-flash.is-active .at-hpm-flash__core,',
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

  function createFlashElement() {
    const flash = document.createElement('div');
    const core = document.createElement('div');
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

    core.className = 'at-hpm-flash__core';
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

    flash.appendChild(core);
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
    sub.textContent = '(aéreo + hotel) com';

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

  function createBackdropElement() {
    const backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    backdrop.className = 'at-hpm-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    return backdrop;
  }

  function createModalElement() {
    const modal = document.createElement('div');
    const outer = document.createElement('div');
    const inner = document.createElement('div');

    const header = document.createElement('div');
    const logos = document.createElement('div');
    const logoAzul = document.createElement('div');
    const divider = document.createElement('span');
    const logoPartner = document.createElement('div');
    const closeBtn = document.createElement('button');

    const content = document.createElement('div');

    const colLeft = document.createElement('div');
    const title = document.createElement('h2');
    const desc = document.createElement('p');

    const colRight = document.createElement('div');
    const univLogo = document.createElement('div');
    const hogwartsImg = document.createElement('div');
    const ctaLink = document.createElement('a');
    const ctaText = document.createElement('span');

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
        'url(' + IMG_BG + ') center/cover no-repeat, linear-gradient(250.66deg, #6e1a27 0.48%, #5f1320 50.24%, #55101b 75.12%, #430914 87.56%, #500b17 93.78%)'
      );
    }

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
    closeBtn.textContent = '×';

    header.appendChild(logos);
    header.appendChild(closeBtn);

    colLeft.className = 'at-hpm-col-left';

    title.className = 'at-hpm-title';
    title.textContent = 'Embarque nessa viagem mágica';

    desc.className = 'at-hpm-desc';
    desc.textContent = 'Passagens para Orlando e Los Angeles. Seu sonho no Expresso de Hogwarts começa aqui!';

    colLeft.appendChild(title);
    colLeft.appendChild(desc);
    colLeft.appendChild(createOfferCard());
    colLeft.appendChild(createCouponButton());

    colRight.className = 'at-hpm-col-right';

    univLogo.className = 'at-hpm-univ-logo';
    univLogo.setAttribute('role', 'img');
    univLogo.setAttribute('aria-label', 'The Wizarding World of Harry Potter - Universal Studios');

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

    content.className = 'at-hpm-content';
    content.appendChild(colLeft);
    content.appendChild(colRight);

    inner.appendChild(header);
    inner.appendChild(content);
    outer.appendChild(inner);
    modal.appendChild(outer);

    return modal;
  }

  function dismissModal(trackLabel) {
    const modal = document.getElementById(MODAL_ID);
    const backdrop = document.getElementById(BACKDROP_ID);

    if (!modal && !backdrop) {
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

    if (modal) {
      modal.classList.remove('is-visible');
      modal.classList.add('is-dismissed');
    }

    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.classList.add('is-dismissed');
    }

    setTimeout(function () {
      const currentModal = document.getElementById(MODAL_ID);
      const currentBackdrop = document.getElementById(BACKDROP_ID);

      if (currentModal && currentModal.parentNode) {
        currentModal.parentNode.removeChild(currentModal);
      }

      if (currentBackdrop && currentBackdrop.parentNode) {
        currentBackdrop.parentNode.removeChild(currentBackdrop);
      }
    }, DISMISS_DURATION);
  }

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

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(COUPON_CODE).then(onSuccess).catch(onError);
      return;
    }

    // Fallback para contextos sem Clipboard API
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
    } catch (error) {
      onError();
    }

    document.body.removeChild(input);
  }

  function onModalClickOutside(event) {
    const modal = document.getElementById(MODAL_ID);

    if (!modal || isDismissed) {
      return;
    }

    const outer = modal.querySelector('.at-hpm-outer');

    if (outer && outer.contains(event.target)) {
      return;
    }

    dismissModal('fechar_fora_modal_hogwarts');
  }

  function onEscapeClose(event) {
    if (!event || event.key !== 'Escape') {
      return;
    }

    const modal = document.getElementById(MODAL_ID);

    if (!modal || isDismissed) {
      return;
    }

    dismissModal('fechar_modal_hogwarts');
  }

  function ensureGlobalListeners() {
    if (document.body.getAttribute(BODY_DATA_KEYDOWN) !== 'true') {
      document.body.setAttribute(BODY_DATA_KEYDOWN, 'true');
      document.addEventListener('keydown', onEscapeClose);
    }

    if (document.body.getAttribute(BODY_DATA_OUTSIDE) !== 'true') {
      document.body.setAttribute(BODY_DATA_OUTSIDE, 'true');
      document.addEventListener('click', onModalClickOutside, true);
    }
  }

  function ensureListeners() {
    const modal = document.getElementById(MODAL_ID);

    if (!modal) {
      return;
    }

    const closeBtn = modal.querySelector('.at-hpm-close');

    if (closeBtn && closeBtn.getAttribute('data-close-added') !== 'true') {
      closeBtn.setAttribute('data-close-added', 'true');
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        dismissModal('fechar_modal_hogwarts');
      });
    }

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

    const ctaLink = modal.querySelector('.at-hpm-cta');

    if (ctaLink && ctaLink.getAttribute('data-cta-added') !== 'true') {
      ctaLink.setAttribute('data-cta-added', 'true');
      ctaLink.addEventListener('click', function () {
        analyticsEvent('clique_cta_eu_quero', 'click');
      });
    }

    ensureGlobalListeners();
  }

  function renderModal() {
    let modal = document.getElementById(MODAL_ID);
    let backdrop = document.getElementById(BACKDROP_ID);

    if (isDismissed) {
      return;
    }

    internalMutationLock = true;

    if (!backdrop) {
      backdrop = createBackdropElement();
      document.body.appendChild(backdrop);
    }

    if (!modal) {
      modal = createModalElement();
      document.body.appendChild(modal);
    }

    requestAnimationFrame(function () {
      if (backdrop) {
        backdrop.classList.add('is-visible');
      }
      if (modal) {
        modal.classList.add('is-visible');
      }

      setTimeout(function () {
        internalMutationLock = false;
      }, 80);
    });

    ensureListeners();

    if (!hasTrackedView) {
      analyticsEvent('visualizacao_modal_hogwarts', 'view');
      hasTrackedView = true;
    }
  }

  function showWithFlash() {
    let flash = document.getElementById(FLASH_ID);

    if (!flash) {
      internalMutationLock = true;
      flash = createFlashElement();
      document.body.appendChild(flash);
      setTimeout(function () {
        internalMutationLock = false;
      }, 60);
    }

    requestAnimationFrame(function () {
      flash.classList.add('is-active');
    });

    setTimeout(function () {
      const currentFlash = document.getElementById(FLASH_ID);

      if (currentFlash && currentFlash.parentNode) {
        currentFlash.parentNode.removeChild(currentFlash);
      }

      renderModal();
    }, FLASH_DURATION);
  }

  function processDomChanges() {
    if (isProcessingObserver || isDismissed) {
      return;
    }

    isProcessingObserver = true;

    try {
      const modal = document.getElementById(MODAL_ID);
      const backdrop = document.getElementById(BACKDROP_ID);

      if (spellHasStarted && !modal && !isDismissed) {
        renderModal();
        return;
      }

      if (spellHasStarted && modal && !backdrop && !isDismissed) {
        renderModal();
        return;
      }

      if (modal) {
        ensureListeners();
      }
    } finally {
      isProcessingObserver = false;
    }
  }

  function observeDom() {
    if (observer || isDismissed) {
      return;
    }

    observer = new MutationObserver(function (mutationList) {
      let shouldProcess = false;
      let index = 0;

      if (internalMutationLock) {
        return;
      }

      for (index = 0; index < mutationList.length; index++) {
        const mutation = mutationList[index];

        if (mutation.type !== 'childList') {
          continue;
        }

        if (!mutation.target || mutation.target === document.body || mutation.target === document.documentElement) {
          shouldProcess = true;
          break;
        }

        if (mutation.target.nodeType === 1) {
          const targetElement = mutation.target;

          if (targetElement.closest && targetElement.closest('#' + MODAL_ID)) {
            continue;
          }

          if (targetElement.closest && targetElement.closest('#' + BACKDROP_ID)) {
            continue;
          }

          if (targetElement.closest && targetElement.closest('#' + FLASH_ID)) {
            continue;
          }
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
    spellHasStarted = true;
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