(function() {
  'use strict';

  const STYLE_ID = 'at-seatmap-loading-style';
  const OVERLAY_ID = 'at-seatmap-loading-overlay';
  const PANEL_ID = 'at-seatmap-loading-panel';
  const TRACKING_ACTIVITY = 'AT_SeatMapLoading';
  const TARGET_PATH = '/home/review';
  const TARGET_QUERY = 'seatmap';
  const RESPONSAVEL_PATH = '/home/responsavel';
  const RESPONSAVEL_BUTTON_SELECTOR = '[data-testid="search-box-hotel-date-picker-primary-button"]';
  const LOADING_IMAGE_URL = 'https://i.imgur.com/IyKJVUb.png';
  const MODAL_IMAGE_URL = 'https://i.imgur.com/EwQJRvc.png';
  const CHANGE_SEGMENT_ID = 'change-segment';
  const CHANGE_SEGMENT_SELECTOR = '#change-segment';
  const CHANGE_SEGMENT_OVERLAY_CLASS = 'at-seatmap-native-change-segment';
  const DATA_INJECTED = 'data-seatmap-loading-injected';
  const LEFT_COLUMN_CARD_ID = 'at-seatmap-left-card';
  const LEFT_COLUMN_WRAPPER_ID = 'at-seatmap-left-card-wrapper';
  const LEFT_COLUMN_STYLE_ID = 'at-seatmap-left-card-style';
  const PASSENGER_PICKER_SELECTOR = 'div.airplane-passenger-picker';
  const LEFT_COLUMN_SELECTORS = ['.seatmap-sidebar', '.seat-map-sidebar', '.seatmap-left-column', '.checkout-sidebar', '.sidebar-left', '.seatmap-content-left', '[data-testid*="sidebar"]', '[class*="sidebar"]'];
  const SKIP_BUTTON_ID = 'at-seatmap-skip-button';
  const SKIP_MODAL_OVERLAY_ID = 'at-seatmap-skip-modal-overlay';
  const SKIP_MODAL_ID = 'at-seatmap-skip-modal';
  const SKIP_MODAL_STYLE_ID = 'at-seatmap-skip-modal-style';
  const SKIP_MODAL_TITLE_ID = 'at-seatmap-skip-modal-title';
  const SKIP_MODAL_CLOSE_ID = 'at-seatmap-skip-modal-close';
  const SKIP_MODAL_CHOOSE_ID = 'at-seatmap-skip-modal-choose';
  const SKIP_MODAL_SKIP_ID = 'at-seatmap-skip-modal-skip';
  const SKIP_MODAL_IMAGE_URL = 'https://i.imgur.com/xk1ZJTS.png';
  const CHECK_ICON_URL = 'https://i.imgur.com/W2Q5Evl.png';
  const PROCEED_BUTTON_SELECTOR = 'div.airplane-passenger-picker div.action button[data-testid="search-box-hotel-date-picker-primary-button"]';
  const AEM_COLUMN_SELECTOR = 'div.aem-GridColumn.aem-GridColumn--tablet--12.aem-GridColumn--offset--tablet--0.aem-GridColumn--tablet--none.aem-GridColumn--default--4.aem-GridColumn--phone--12.aem-GridColumn--offset--phone--0.aem-GridColumn--phone--none';
  const SEAT_BUTTON_SELECTOR = 'button.seat';
  const NATIVE_MODAL_SELECTOR = '.ReactModal__Overlay';
  const ASSIGN_LOADER_ID = 'assign-loader';
  const ASSIGN_CHECK_ID = 'assign-check';
  const ASSIGN_LOADER_OVERLAY_CLASS = 'at-seatmap-native-assign-loader';
  const NATIVE_MODAL_PAUSED_CLASS = 'at-seatmap-loading-overlay--paused';
  const PASSENGER_SEAT_SELECTOR = 'div.airplane-passenger-picker ul.passengers-list span.passenger-seat';
  const EMPTY_SEAT_LABEL = '--';
  const SEAT_CONFIRMATION_POLL_MS = 200;
  const LOADING_CLOSE_ID = 'at-seatmap-loading-close';
  const PROGRESS_TICK_MS = 200;
  const LOADER_POLL_MS = 100;
  const LOADER_HIDE_DEBOUNCE_MS = 300;

  let observer = null;
  let loaderObserver = null;
  let debounceTimer = null;
  let progressMonitorInterval = null;
  let loaderMonitorInterval = null;
  let hideDebounceTimeout = null;
  let lastUrl = window.location.href;
  let modalVisible = false;
  let viewTracked = false;
  let clickTracked = false;
  let leftColumnInjected = false;
  let skipButtonInserted = false;
  let skipModalKeydownHandler = null;
  let seatClickHandler = null;
  let seatSelectionActive = false;
  let seatConfirmationInterval = null;
  let nativeModalObserver = null;
  let initialLoadAutoClosed = false;
  let pendingLoaderActivation = false;
  let loadingSessionActive = false;
  let changeSegmentSeen = false;
  let originalLoader = null;
  let isSyncingNativeModals = false;
  let isProcessingLoader = false;
  let sessionSafetyTimeout = null;
  const SESSION_SAFETY_MS = 20000;

  function createStyles() {
      if (document.getElementById(STYLE_ID)) {
          return;
      }

      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
.at-seatmap-loading-overlay {
box-sizing: border-box;
position: fixed;
inset: 0;
z-index: 100000;
display: flex;
align-items: center;
justify-content: center;
padding: 24px;
background: rgba(4, 30, 66, 0.28);
pointer-events: none;
}
.at-seatmap-loading-overlay--drawer {
box-sizing: border-box;
position: fixed;
inset: 0;
z-index: 100000;
display: flex;
align-items: flex-start;
justify-content: flex-end;
padding: 0;
background: rgba(4, 30, 66, 0.18);
pointer-events: none;
}
.at-seatmap-loading-overlay.at-visible {
pointer-events: auto;
}
.at-seatmap-loading-overlay--drawer.at-visible {
pointer-events: auto;
}
.at-seatmap-loading-overlay--paused {
display: none;
}
.at-seatmap-native-assign-loader,
.at-seatmap-native-change-segment {
display: none !important;
}
.at-seatmap-loading-close {
box-sizing: border-box;
position: fixed;
top: 24px;
right: 24px;
z-index: 100002;
display: flex;
align-items: center;
justify-content: center;
width: 32px;
height: 32px;
padding: 0;
background: rgba(255, 255, 255, 0.9);
border: none;
border-radius: 4px;
cursor: pointer;
}
.at-seatmap-loading-close:focus-visible {
outline: 2px solid #026CB6;
outline-offset: 2px;
}
.at-seatmap-loading-panel {
box-sizing: border-box;
position: relative;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 40px;
width: 935px;
max-width: 100%;
height: 455px;
max-height: 100%;
padding: 60px 0 60px 60px;
overflow: hidden;
background: #FFFFFF;
box-shadow: -4px 0 20px rgba(0, 0, 0, 0.25);
border-radius: 16px;
}
.at-seatmap-loading-panel--drawer {
box-sizing: border-box;
position: absolute;
display: flex;
flex-direction: column;
align-items: flex-start;
padding: 60px 0 60px 60px;
gap: 40px;
right: 259px;
top: 362px;
width: min(935px, calc(100vw - 48px));
height: 455px;
max-height: calc(100vh - 48px);
overflow: hidden;
background: #FFFFFF;
box-shadow: -4px 0 20px rgba(0, 0, 0, 0.25);
border-radius: 16px;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-panel__content {
align-items: center;
gap: 24px;
width: 100%;
height: 263px;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-panel__details {
width: 336px;
gap: 24px;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-title {
font-size: 48px;
line-height: 48px;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-benefits {
gap: 16px;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-benefit {
min-height: 32px;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-visual {
width: 602px;
height: 163px;
align-self: center;
background: #F5F5F5;
border-radius: 8px;
overflow: hidden;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-visual__image {
top: 0;
left: 0;
width: 100%;
height: 100%;
background-size: contain;
background-position: center;
}
.at-seatmap-loading-panel--drawer .at-seatmap-loading-footer {
width: 833px;
gap: 8px;
}
.at-seatmap-loading-panel__content {
box-sizing: border-box;
display: flex;
flex-direction: row;
align-items: flex-start;
gap: 24px;
width: 100%;
height: 263px;
}
.at-seatmap-loading-panel__details {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 20px;
flex: none;
width: 336px;
}
.at-seatmap-loading-title {
width: 100%;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 700;
font-size: 48px;
line-height: 48px;
color: #041E42;
}
.at-seatmap-loading-subtitle {
width: 100%;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 16px;
line-height: 24px;
color: #606060;
}
.at-seatmap-loading-benefits {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 16px;
width: 100%;
}
.at-seatmap-loading-benefit {
box-sizing: border-box;
display: flex;
flex-direction: row;
align-items: center;
gap: 12px;
width: 100%;
}
.at-seatmap-loading-benefit-icon {
display: block;
flex: none;
width: 32px;
height: 32px;
background-image: url("` + CHECK_ICON_URL + `");
background-size: 24px 24px;
background-repeat: no-repeat;
background-position: center;
}
.at-seatmap-loading-benefit-text {
flex: 1 1 auto;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 14px;
line-height: 20px;
color: #041E42;
}
.at-seatmap-loading-visual {
position: relative;
flex: none;
align-self: center;
width: 515px;
height: 161px;
}
.at-seatmap-loading-visual__image {
position: absolute;
top: -30px;
left: 0;
width: 515px;
height: 287px;
background-image: url("` + MODAL_IMAGE_URL + `");
background-size: 515px 287px;
background-repeat: no-repeat;
background-position: left top;
}
.at-seatmap-loading-footer {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 8px;
width: 833px;
}
.at-seatmap-loading-progress {
width: 100%;
height: 12px;
overflow: hidden;
background: #F3F4F6;
border-radius: 99px;
}
.at-seatmap-progress-fill {
width: 0%;
height: 100%;
background: #026CB6;
border-radius: 99px;
transition: width 0.2s ease;
}
.at-seatmap-loading-text {
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 500;
font-size: 12px;
line-height: 12px;
color: #026CB6;
}
@media (max-width: 1024px) {
.at-seatmap-loading-panel {
width: 100%;
height: auto;
padding: 40px 24px;
}
.at-seatmap-loading-panel__content {
flex-direction: column;
height: auto;
}
.at-seatmap-loading-panel__details {
width: 100%;
}
.at-seatmap-loading-visual {
display: none;
}
.at-seatmap-loading-footer {
width: 100%;
}
}
@media (max-width: 720px) {
.at-seatmap-loading-panel {
border-radius: 12px;
padding: 28px 18px;
}
.at-seatmap-loading-title {
font-size: 32px;
line-height: 36px;
}
}
`;

      document.head.appendChild(style);
  }

  function createLeftColumnStyles() {
      if (document.getElementById(LEFT_COLUMN_STYLE_ID)) {
          return;
      }

      const style = document.createElement('style');
      style.id = LEFT_COLUMN_STYLE_ID;
      style.textContent = `
.at-seatmap-skip-button-row {
box-sizing: border-box;
display: flex;
align-items: center;
justify-content: center;
width: 100%;
margin: -7px 0 10px 0;
padding: 0;
}
.at-seatmap-skip-button-wrapper {
box-sizing: border-box;
display: flex;
align-items: center;
justify-content: center;
width: 100%;
height: auto;
padding: 0;
background: transparent;
border-radius: 0;
}
.at-seatmap-skip-button {
font-family: "Helvetica Neue", Arial, sans-serif;
font-style: normal;
font-weight: 500;
font-size: 13px;
line-height: 20px;
text-align: center;
text-decoration-line: underline;
color: #026CB6;
background: transparent;
border: none;
cursor: pointer;
margin: 0;
padding: 0;
}
.at-seatmap-skip-button:focus {
outline: 2px solid #026CB6;
outline-offset: 2px;
}
.at-seatmap-left-card-container {
box-sizing: border-box;
display: flex;
flex-direction: column;
width: auto;
margin: 32px 24px 0 0;
background: #FFFFFF;
border: 1px solid #C0C0C0;
border-radius: 4px;
overflow: hidden;
}
.at-seatmap-left-card {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: stretch;
width: 100%;
margin: 0;
padding: 0;
background: transparent;
}
.at-seatmap-left-card__hero {
display: block;
width: 100%;
height: 110px;
object-fit: cover;
border: none;
margin: 0;
padding: 0;
}
.at-seatmap-left-card__text {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 5px;
width: 100%;
padding: 16px;
}
.at-seatmap-left-card__title {
width: 100%;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 18px;
line-height: 22px;
color: #041E42;
}
.at-seatmap-left-card__list {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 10px;
width: 100%;
padding: 0;
}
.at-seatmap-left-card__item {
box-sizing: border-box;
display: flex;
flex-direction: row;
align-items: center;
gap: 8px;
width: 100%;
padding: 0;
}
.at-seatmap-left-card__item-icon {
display: block;
flex: none;
width: 20px;
height: 20px;
margin-top: 2px;
background-image: url("` + CHECK_ICON_URL + `");
background-size: 20px 20px;
background-repeat: no-repeat;
background-position: center;
}
.at-seatmap-left-card__item-text {
flex: 1 1 auto;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 12px;
line-height: 16px;
color: #606060;
}
@media (max-width: 767px) {
.at-seatmap-skip-button-row,
.at-seatmap-left-card-container {
margin-right: 0;
}
}

@media (max-width: 767px) {
.at-seatmap-left-card-container {
display: none;
}
}
`;

      document.head.appendChild(style);
  }

  function createSkipModalStyles() {
      if (document.getElementById(SKIP_MODAL_STYLE_ID)) {
          return;
      }

      const style = document.createElement('style');
      style.id = SKIP_MODAL_STYLE_ID;
      style.textContent = `
.at-seatmap-skip-overlay {
box-sizing: border-box;
position: fixed;
inset: 0;
z-index: 100001;
display: flex;
align-items: center;
justify-content: center;
padding: 24px;
background: rgba(4, 30, 66, 0.28);
pointer-events: auto;
}
.at-seatmap-skip-modal {
box-sizing: border-box;
position: relative;
display: flex;
flex-direction: column;
align-items: stretch;
width: 619px;
max-width: 100%;
max-height: 100%;
overflow: auto;
background: #FFFFFF;
box-shadow: 0 8px 32px rgba(4, 30, 66, 0.25);
border-radius: 16px;
}
.at-seatmap-skip-modal__header {
box-sizing: border-box;
display: flex;
flex-direction: row;
align-items: flex-start;
gap: 16px;
width: 100%;
height: 96px;
padding: 40px 16px 24px 16px;
background: #FFFFFF;
border-bottom: 1px solid #EAEAEA;
}
.at-seatmap-skip-modal__title {
flex: 1 1 auto;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 700;
font-size: 20px;
line-height: 28px;
color: #041E42;
}
.at-seatmap-skip-modal__close {
flex: none;
display: flex;
align-items: center;
justify-content: center;
width: 32px;
height: 32px;
padding: 0;
background: transparent;
border: none;
border-radius: 4px;
cursor: pointer;
}
.at-seatmap-skip-modal__body {
box-sizing: border-box;
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
gap: 24px;
width: 100%;
padding: 24px;
}
.at-seatmap-skip-modal__image-container {
box-sizing: border-box;
position: relative;
flex: none;
width: 297px;
height: 254px;
overflow: hidden;
background: #F5F5F5;
border-radius: 8px;
}
.at-seatmap-skip-modal__image {
position: absolute;
inset: 0;
background-image: url("` + SKIP_MODAL_IMAGE_URL + `");
background-size: cover;
background-position: center;
background-repeat: no-repeat;
}
.at-seatmap-skip-modal__details {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 24px;
flex: none;
width: 228px;
}
.at-seatmap-skip-modal__list {
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 16px;
width: 100%;
}
.at-seatmap-skip-modal__item {
box-sizing: border-box;
display: flex;
flex-direction: row;
align-items: flex-start;
gap: 12px;
width: 100%;
}
.at-seatmap-skip-modal__item-icon {
display: block;
flex: none;
width: 32px;
height: 32px;
background-image: url("` + CHECK_ICON_URL + `");
background-size: 24px 24px;
background-repeat: no-repeat;
background-position: center;
}
.at-seatmap-skip-modal__item-text {
flex: 1 1 auto;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 14px;
line-height: 20px;
color: #606060;
}
.at-seatmap-skip-modal__warning {
box-sizing: border-box;
display: flex;
flex-direction: row;
align-items: flex-start;
gap: 12px;
width: 100%;
padding: 10px 12px;
background: #FDF7EA;
border-radius: 4px;
}
.at-seatmap-skip-modal__warning-icon {
display: block;
flex: none;
width: 16px;
height: 16px;
margin-top: 4px;
}
.at-seatmap-skip-modal__warning-text {
flex: 1 1 auto;
margin: 0;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 14px;
line-height: 15px;
color: #6A4B0A;
}
.at-seatmap-skip-modal__footer {
box-sizing: border-box;
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
gap: 32px;
width: 100%;
height: 96px;
padding: 24px;
border-top: 1px solid #EAEAEA;
}
.at-seatmap-skip-modal__primary {
box-sizing: border-box;
flex: none;
min-width: 150px;
height: 48px;
padding: 12px 15px;
background: #026CB6;
border: none;
border-radius: 6px;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 16px;
line-height: 24px;
color: #FFFFFF;
cursor: pointer;
}
.at-seatmap-skip-modal__secondary {
box-sizing: border-box;
flex: none;
padding: 0;
background: transparent;
border: none;
font-family: "Helvetica Neue", Arial, sans-serif;
font-weight: 400;
font-size: 16px;
line-height: 24px;
color: #026CB6;
cursor: pointer;
}
.at-seatmap-skip-modal__close:focus-visible,
.at-seatmap-skip-modal__primary:focus-visible,
.at-seatmap-skip-modal__secondary:focus-visible {
outline: 2px solid #026CB6;
outline-offset: 2px;
}
@media (max-width: 720px) {
.at-seatmap-skip-modal__header {
height: auto;
padding: 24px 16px;
}
.at-seatmap-skip-modal__body {
flex-direction: column;
align-items: stretch;
}
.at-seatmap-skip-modal__image-container {
width: 100%;
height: 200px;
}
.at-seatmap-skip-modal__details {
width: 100%;
}
.at-seatmap-skip-modal__footer {
flex-direction: column;
height: auto;
gap: 16px;
}
.at-seatmap-skip-modal__primary {
width: 100%;
}
}
`;

      document.head.appendChild(style);
  }

  function buildLeftColumnWrapper() {
      return (
          '<div id="' + LEFT_COLUMN_WRAPPER_ID + '" class="at-seatmap-left-card-container">' +
          buildLeftColumnCard() +
          '</div>'
      );
  }

  function buildSkipButtonRow() {
      return (
          '<div class="at-seatmap-skip-button-row">' +
          '<div class="at-seatmap-skip-button-wrapper">' +
          '<button id="' + SKIP_BUTTON_ID + '" class="at-seatmap-skip-button" type="button">Pular escolha de assentos</button>' +
          '</div>' +
          '</div>'
      );
  }

  function attachSkipButtonListener() {
      var button = document.getElementById(SKIP_BUTTON_ID);
      if (!button || button.getAttribute('data-skip-listener') === 'true') {
          return;
      }
      button.addEventListener('click', function() {
          openSkipModal();
          trackAnalytics('click_skip_button');
      });
      button.setAttribute('data-skip-listener', 'true');
  }

  function buildSkipModalCloseIcon() {
      return `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
<path d="M1 1L17 17M17 1L1 17" stroke="#595959" stroke-width="1.5" stroke-linecap="round" />
</svg>`;
  }

  function buildSkipModalWarningIcon() {
      return `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
<circle cx="8" cy="8" r="7.25" stroke="#6A4B0A" stroke-width="1.2" />
<path d="M8 4.25V9" stroke="#6A4B0A" stroke-width="1.2" stroke-linecap="round" />
<circle cx="8" cy="11.35" r="0.75" fill="#6A4B0A" />
</svg>`;
  }

  function buildSkipModalBenefit(text) {
      return (
          '<div class="at-seatmap-skip-modal__item">' +
          '<span class="at-seatmap-skip-modal__item-icon" aria-hidden="true"></span>' +
          '<p class="at-seatmap-skip-modal__item-text">' + text + '</p>' +
          '</div>'
      );
  }

  function buildSkipModalMarkup() {
      return (
          '<div id="' + SKIP_MODAL_ID + '" class="at-seatmap-skip-modal" role="dialog" aria-modal="true" aria-labelledby="' + SKIP_MODAL_TITLE_ID + '">' +
          '<div class="at-seatmap-skip-modal__header">' +
          '<h2 id="' + SKIP_MODAL_TITLE_ID + '" class="at-seatmap-skip-modal__title">Por que escolher seu assento?</h2>' +
          '<button type="button" id="' + SKIP_MODAL_CLOSE_ID + '" class="at-seatmap-skip-modal__close" aria-label="Fechar modal">' + buildSkipModalCloseIcon() + '</button>' +
          '</div>' +
          '<div class="at-seatmap-skip-modal__body">' +
          '<div class="at-seatmap-skip-modal__image-container"><div class="at-seatmap-skip-modal__image"></div></div>' +
          '<div class="at-seatmap-skip-modal__details">' +
          '<div class="at-seatmap-skip-modal__list">' +
          buildSkipModalBenefit('Fique junto com seus acompanhantes') +
          buildSkipModalBenefit('Escolha janela, corredor ou saída de emergência') +
          buildSkipModalBenefit('Maior variedade de assentos disponíveis') +
          '</div>' +
          '<div class="at-seatmap-skip-modal__warning">' +
          '<span class="at-seatmap-skip-modal__warning-icon">' + buildSkipModalWarningIcon() + '</span>' +
          '<p class="at-seatmap-skip-modal__warning-text">Sem escolha, você pode ser separado de outros viajantes do grupo.</p>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '<div class="at-seatmap-skip-modal__footer">' +
          '<button type="button" id="' + SKIP_MODAL_CHOOSE_ID + '" class="at-seatmap-skip-modal__primary">Escolher assento</button>' +
          '<button type="button" id="' + SKIP_MODAL_SKIP_ID + '" class="at-seatmap-skip-modal__secondary">Pular mesmo assim</button>' +
          '</div>' +
          '</div>'
      );
  }

  function openSkipModal() {
      if (document.getElementById(SKIP_MODAL_OVERLAY_ID)) {
          return;
      }

      createSkipModalStyles();
      var overlay = document.createElement('div');
      overlay.id = SKIP_MODAL_OVERLAY_ID;
      overlay.className = 'at-seatmap-skip-overlay';
      overlay.setAttribute('aria-hidden', 'false');
      overlay.innerHTML = buildSkipModalMarkup();
      document.body.appendChild(overlay);

      attachSkipModalAction(SKIP_MODAL_CLOSE_ID, 'click_skip_modal_close');
      attachSkipModalAction(SKIP_MODAL_CHOOSE_ID, 'click_choose_seat');
      attachSkipModalAction(SKIP_MODAL_SKIP_ID, 'click_skip_anyway', proceedWithoutSeat);

      overlay.addEventListener('click', function(event) {
          if (event.target === overlay) {
              closeSkipModal();
              trackAnalytics('click_skip_modal_overlay');
          }
      });

      skipModalKeydownHandler = function(event) {
          if (event.key === 'Escape') {
              closeSkipModal();
              trackAnalytics('click_skip_modal_close');
          }
      };
      document.addEventListener('keydown', skipModalKeydownHandler);

      const primaryButton = document.getElementById(SKIP_MODAL_CHOOSE_ID);
      if (primaryButton) {
          primaryButton.focus();
      }

      trackAnalytics('view_skip_modal');
  }

  function attachSkipModalAction(buttonId, eventLabel, afterClose) {
      const button = document.getElementById(buttonId);
      if (!button) {
          return;
      }

      button.addEventListener('click', function() {
          closeSkipModal();
          trackAnalytics(eventLabel);
          if (typeof afterClose === 'function') {
              afterClose();
          }
      });
  }

  function proceedWithoutSeat() {
      const proceedButton = getVisibleProceedButton();
      if (!proceedButton) {
          console.warn('[AT] botao Prosseguir nao encontrado, fluxo nao avancou');
          return;
      }
      console.log('[AT] acionando o botao Prosseguir nativo');
      proceedButton.click();
  }

  function getVisibleProceedButton() {
      const buttons = document.querySelectorAll(PROCEED_BUTTON_SELECTOR);
      for (let i = 0; i < buttons.length; i += 1) {
          if (buttons[i].offsetParent !== null) {
              return buttons[i];
          }
      }
      return null;
  }

  function closeSkipModal() {
      if (skipModalKeydownHandler) {
          document.removeEventListener('keydown', skipModalKeydownHandler);
          skipModalKeydownHandler = null;
      }

      const overlay = document.getElementById(SKIP_MODAL_OVERLAY_ID);
      if (!overlay) {
          return;
      }
      overlay.parentNode.removeChild(overlay);

      const skipButton = document.getElementById(SKIP_BUTTON_ID);
      if (skipButton) {
          skipButton.focus();
      }
  }

  function getProceedActionContainer() {
      var proceedBtn = document.querySelector(PROCEED_BUTTON_SELECTOR);
      if (proceedBtn) {
          return proceedBtn.closest('div.action') || proceedBtn.parentNode;
      }
      return document.querySelector(PASSENGER_PICKER_SELECTOR + ' div.action');
  }

  function injectSkipButton() {
      if (document.getElementById(SKIP_BUTTON_ID)) {
          attachSkipButtonListener();
          skipButtonInserted = true;
          return;
      }

      var action = getProceedActionContainer();
      if (!action || !action.parentNode) {
          skipButtonInserted = false;
          return;
      }

      createLeftColumnStyles();
      var buttonRow = htmlToElement(buildSkipButtonRow());
      action.parentNode.insertBefore(buttonRow, action.nextSibling);
      attachSkipButtonListener();
      skipButtonInserted = true;
      trackAnalytics('inject_skip_button');
  }

  function insertSkipButton() {
      injectSkipButton();
  }

  function monitorSkipButtonInjection() {
      if (!document.getElementById(SKIP_BUTTON_ID)) {
          skipButtonInserted = false;
      }
      injectSkipButton();
  }

  function htmlToElement(html) {
      var template = document.createElement('template');
      html = html.trim();
      template.innerHTML = html;
      return template.content.firstChild;
  }

  function preloadImage(src) {
      if (!src) {
          return;
      }
      var image = new Image();
      image.src = src;
  }

  function getLeftColumnTarget() {
      var i;
      for (i = 0; i < LEFT_COLUMN_SELECTORS.length; i += 1) {
          var element = document.querySelector(LEFT_COLUMN_SELECTORS[i]);
          if (element && element.offsetParent !== null) {
              return element;
          }
      }

      var headings = document.querySelectorAll('h1, h2, h3, h4, p, span');
      for (i = 0; i < headings.length; i += 1) {
          var heading = headings[i];
          if (!heading.textContent) {
              continue;
          }
          var text = heading.textContent.trim();
          if (text.indexOf('Escolha os assentos') !== -1 || text.indexOf('Reserve seu lugar') !== -1 || text.indexOf('Pular escolha de assentos') !== -1) {
              var parent = heading.closest('div, aside, section');
              if (parent) {
                  return parent;
              }
          }
      }

      return null;
  }

  function buildLeftColumnCard() {
      return (
          '<div id="' + LEFT_COLUMN_CARD_ID + '" class="at-seatmap-left-card">' +
          '<img class="at-seatmap-left-card__hero" src="' + LOADING_IMAGE_URL + '" alt="Assentos da cabine da aeronave" />' +
          '<div class="at-seatmap-left-card__text">' +
          '<h2 class="at-seatmap-left-card__title">Quase lá</h2>' +
          '<div class="at-seatmap-left-card__list">' +
          buildLeftColumnBenefit('Fique junto com seus acompanhantes') +
          buildLeftColumnBenefit('Escolha janela, corredor ou saída de emergência') +
          buildLeftColumnBenefit('Maior variedade de assentos disponíveis') +
          '</div>' +
          '</div>' +
          '</div>'
      );
  }

  function buildLeftColumnBenefit(text) {
      return (
          '<div class="at-seatmap-left-card__item">' +
          '<span class="at-seatmap-left-card__item-icon" aria-hidden="true"></span>' +
          '<p class="at-seatmap-left-card__item-text">' + text + '</p>' +
          '</div>'
      );
  }

  function injectLeftColumnCard() {
      if (document.getElementById(LEFT_COLUMN_WRAPPER_ID)) {
          leftColumnInjected = true;
          return;
      }

      injectSkipButton();

      var picker = document.querySelector(PASSENGER_PICKER_SELECTOR);
      var anchor = picker || getLeftColumnTarget();
      if (!anchor || !anchor.parentNode) {
          return;
      }

      createLeftColumnStyles();
      var wrapper = htmlToElement(buildLeftColumnWrapper());
      anchor.parentNode.insertBefore(wrapper, anchor.nextSibling);

      leftColumnInjected = true;
      trackAnalytics('inject_left_column');
  }

  function monitorLeftColumnInjection() {
      if (document.getElementById(LEFT_COLUMN_WRAPPER_ID)) {
          leftColumnInjected = true;
          return;
      }
      leftColumnInjected = false;
      injectLeftColumnCard();
  }

  function isOwnOverlayNode(element) {
      return !!(element && element.closest && element.closest('#' + OVERLAY_ID));
  }

  function getChangeSegment() {
      return document.getElementById(CHANGE_SEGMENT_ID);
  }

  function findChangeSegmentInNode(node) {
      if (!node || node.nodeType !== 1) {
          return null;
      }
      if (node.id === CHANGE_SEGMENT_ID) {
          return node;
      }
      return node.querySelector ? node.querySelector(CHANGE_SEGMENT_SELECTOR) : null;
  }

  function getLoader(includeBound) {
      var segment = getChangeSegment();
      if (!segment || isOwnOverlayNode(segment)) {
          return null;
      }
      if (!includeBound && segment.getAttribute(DATA_INJECTED) === 'true') {
          return null;
      }
      return segment;
  }

  function isSeatmapReady() {
      return !!document.querySelector(SEAT_BUTTON_SELECTOR);
  }

  function isTargetPage() {
      var href = window.location.href.toLowerCase();
      return href.indexOf(TARGET_PATH) !== -1 && href.indexOf(TARGET_QUERY) !== -1;
  }

  function shouldKeepModalDuringTransition() {
      return loadingSessionActive || pendingLoaderActivation;
  }

  function endLoadingSession() {
      loadingSessionActive = false;
      pendingLoaderActivation = false;
      changeSegmentSeen = false;
      clearSessionSafetyTimeout();
  }

  function clearSessionSafetyTimeout() {
      if (sessionSafetyTimeout) {
          window.clearTimeout(sessionSafetyTimeout);
          sessionSafetyTimeout = null;
      }
  }

  function armSessionSafetyTimeout() {
      clearSessionSafetyTimeout();
      sessionSafetyTimeout = window.setTimeout(function() {
          sessionSafetyTimeout = null;
          if (modalVisible && !seatSelectionActive) {
              console.warn('[AT] safety timeout: fechando modal de loading');
              hidePanel();
          }
      }, SESSION_SAFETY_MS);
  }

  function hideOriginalLoader() {
      var loader = getChangeSegment();
      if (!loader) {
          return;
      }
      bindNativeLoader(loader);
  }

  function bindNativeLoader(loaderElement) {
      if (!loaderElement || isOwnOverlayNode(loaderElement)) {
          return;
      }

      if (hideDebounceTimeout) {
          window.clearTimeout(hideDebounceTimeout);
          hideDebounceTimeout = null;
      }

      var nativeOverlay = loaderElement.closest(NATIVE_MODAL_SELECTOR);
      var alreadyBound = loaderElement.getAttribute(DATA_INJECTED) === 'true' &&
          originalLoader === loaderElement &&
          (!nativeOverlay || nativeOverlay.classList.contains(CHANGE_SEGMENT_OVERLAY_CLASS));

      originalLoader = loaderElement;
      if (loaderElement.id === CHANGE_SEGMENT_ID) {
          changeSegmentSeen = true;
      }

      if (!alreadyBound) {
          if (loaderElement.getAttribute(DATA_INJECTED) !== 'true') {
              loaderElement.setAttribute(DATA_INJECTED, 'true');
          }
          if (nativeOverlay) {
              if (!nativeOverlay.classList.contains(CHANGE_SEGMENT_OVERLAY_CLASS)) {
                  nativeOverlay.classList.add(CHANGE_SEGMENT_OVERLAY_CLASS);
              }
          } else if (loaderElement.style.display !== 'none') {
              loaderElement.style.setProperty('display', 'none', 'important');
          }
      }

      startLoaderMonitoring();
  }

  function handleLoaderAppear(loaderElement) {
      if (!loaderElement || loaderElement.nodeType !== 1) {
          return;
      }

      if (!loadingSessionActive && !pendingLoaderActivation && !isTargetPage()) {
          return;
      }

      if (seatSelectionActive || initialLoadAutoClosed) {
          return;
      }

      if (modalVisible) {
          bindNativeLoader(loaderElement);
          pendingLoaderActivation = false;
          return;
      }

      loadingSessionActive = true;
      createPanel(false);
      showPanel(false);
      bindNativeLoader(loaderElement);
      pendingLoaderActivation = false;
      armSessionSafetyTimeout();
  }

  function clearLoaderMonitoring() {
      if (loaderMonitorInterval) {
          window.clearInterval(loaderMonitorInterval);
          loaderMonitorInterval = null;
      }
      if (hideDebounceTimeout) {
          window.clearTimeout(hideDebounceTimeout);
          hideDebounceTimeout = null;
      }
  }

  function startSmartHideDebounce() {
      if (seatSelectionActive) {
          return;
      }

      if (hideDebounceTimeout) {
          window.clearTimeout(hideDebounceTimeout);
      }

      hideDebounceTimeout = window.setTimeout(function() {
          hideDebounceTimeout = null;

          var segment = getChangeSegment();
          if (segment) {
              bindNativeLoader(segment);
              return;
          }

          // Ainda na transicao: change-segment ainda nao apareceu
          if (loadingSessionActive && !changeSegmentSeen && !isTargetPage()) {
              startLoaderMonitoring();
              return;
          }

          // change-segment saiu (ou seatmap ja pronto) = encerra
          if (!seatSelectionActive && modalVisible) {
              hidePanel();
          }
      }, LOADER_HIDE_DEBOUNCE_MS);
  }

  function startLoaderMonitoring() {
      if (loaderMonitorInterval || seatSelectionActive) {
          return;
      }

      loaderMonitorInterval = window.setInterval(function() {
          if (seatSelectionActive) {
              return;
          }

          var segment = getChangeSegment();

          if (segment) {
              if (segment !== originalLoader) {
                  bindNativeLoader(segment);
                  pendingLoaderActivation = false;
              }
              return;
          }

          // Aguardando change-segment apenas fora da pagina alvo
          if (!changeSegmentSeen && (pendingLoaderActivation || loadingSessionActive) && !isTargetPage()) {
              return;
          }

          // Sem change-segment na pagina alvo: fecha (com debounce curto)
          window.clearInterval(loaderMonitorInterval);
          loaderMonitorInterval = null;
          originalLoader = null;
          startSmartHideDebounce();
      }, LOADER_POLL_MS);
  }

  function setupLoaderObserver() {
      if (loaderObserver) {
          return;
      }

      var existingSegment = getChangeSegment();
      if (existingSegment) {
          handleLoaderAppear(existingSegment);
      }

      loaderObserver = new MutationObserver(function(mutations) {
          for (var i = 0; i < mutations.length; i += 1) {
              var mutation = mutations[i];
              if (mutation.type !== 'childList') {
                  continue;
              }

              var added = mutation.addedNodes;
              for (var j = 0; j < added.length; j += 1) {
                  var addedSegment = findChangeSegmentInNode(added[j]);
                  if (addedSegment) {
                      handleLoaderAppear(addedSegment);
                  }
              }

              var removed = mutation.removedNodes;
              for (var r = 0; r < removed.length; r += 1) {
                  var removedSegment = findChangeSegmentInNode(removed[r]);
                  if (removedSegment && !getChangeSegment()) {
                      originalLoader = null;
                      startSmartHideDebounce();
                  }
              }
          }
      });

      loaderObserver.observe(document.body, {
          childList: true,
          subtree: true,
      });
  }

  function buildPanelMarkup() {
      return (
          '<div class="at-seatmap-loading-panel__content">' +
          '<div class="at-seatmap-loading-panel__details">' +
          '<h1 class="at-seatmap-loading-title">Quase Lá</h1>' +
          '<p class="at-seatmap-loading-subtitle">Preparando os melhores assentos para você</p>' +
          '<div class="at-seatmap-loading-benefits">' +
          buildBenefit('Fique junto com seus acompanhantes') +
          buildBenefit('Escolha janela, corredor ou saída de emergência') +
          buildBenefit('Maior variedade de assentos disponíveis') +
          '</div>' +
          '</div>' +
          '<div class="at-seatmap-loading-visual">' +
          '<div class="at-seatmap-loading-visual__image"></div>' +
          '</div>' +
          '</div>' +
          '<div class="at-seatmap-loading-footer">' +
          '<div class="at-seatmap-loading-progress">' +
          '<div class="at-seatmap-progress-fill"></div>' +
          '</div>' +
          '<p class="at-seatmap-loading-text" id="at-seatmap-loading-text">Carregando... 0%</p>' +
          '</div>'
      );
  }

  function buildBenefit(text) {
      return (
          '<div class="at-seatmap-loading-benefit">' +
          '<span class="at-seatmap-loading-benefit-icon" aria-hidden="true"></span>' +
          '<p class="at-seatmap-loading-benefit-text">' + text + '</p>' +
          '</div>'
      );
  }

  function buildLoadingCloseIcon() {
      return `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
<path d="M1 1L17 17M17 1L1 17" stroke="#F0F0F0" stroke-width="1.5" stroke-linecap="round" />
</svg>`;
  }

  function buildCloseButton() {
      return (
          '<button type="button" id="' + LOADING_CLOSE_ID + '" class="at-seatmap-loading-close" aria-label="Fechar">' +
          buildLoadingCloseIcon() +
          '</button>'
      );
  }

  function attachCloseButtonListener() {
      var button = document.getElementById(LOADING_CLOSE_ID);
      if (!button) {
          return;
      }
      button.addEventListener('click', function() {
          trackAnalytics('click_close_button');
          hidePanel();
      });
  }

  function createPanel(useDrawerLayout) {
      var overlay = document.getElementById(OVERLAY_ID);
      if (overlay) {
          overlay.className = 'at-seatmap-loading-overlay' + (useDrawerLayout ? ' at-seatmap-loading-overlay--drawer' : '');
          overlay.setAttribute('aria-hidden', 'true');
          var panel = document.getElementById(PANEL_ID);
          if (panel) {
              panel.className = 'at-seatmap-loading-panel' + (useDrawerLayout ? ' at-seatmap-loading-panel--drawer' : '');
          }
          return;
      }

      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.className = 'at-seatmap-loading-overlay' + (useDrawerLayout ? ' at-seatmap-loading-overlay--drawer' : '');
      overlay.setAttribute('aria-hidden', 'true');

      var panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.className = 'at-seatmap-loading-panel' + (useDrawerLayout ? ' at-seatmap-loading-panel--drawer' : '');
      panel.innerHTML = buildPanelMarkup();
      overlay.appendChild(panel);
      overlay.appendChild(htmlToElement(buildCloseButton()));
      document.body.appendChild(overlay);
      attachCloseButtonListener();
  }

  function showPanel(useDrawerLayout) {
      var overlay = document.getElementById(OVERLAY_ID);
      if (!overlay) {
          createPanel(useDrawerLayout);
          overlay = document.getElementById(OVERLAY_ID);
      }

      if (!overlay) {
          return;
      }

      overlay.classList.toggle('at-seatmap-loading-overlay--drawer', !!useDrawerLayout);
      var panel = document.getElementById(PANEL_ID);
      if (panel) {
          panel.classList.toggle('at-seatmap-loading-panel--drawer', !!useDrawerLayout);
      }
      overlay.classList.add('at-visible');
      overlay.setAttribute('aria-hidden', 'false');
      modalVisible = true;
      hideOriginalLoader();
      setupModalInteractionListeners();
      startNativeModalObserver();
      startProgressMonitor();
      if (!seatSelectionActive) {
          startLoaderMonitoring();
      }
      if (!viewTracked) {
          trackAnalytics('view');
          viewTracked = true;
      }
  }

  function hidePanel() {
      const overlay = document.getElementById(OVERLAY_ID);
      if (!overlay) {
          return;
      }
      stopProgressMonitor();
      clearLoaderMonitoring();
      stopSeatConfirmationWatch();
      stopNativeModalObserver();
      seatSelectionActive = false;
      endLoadingSession();
      originalLoader = null;
      overlay.parentNode.removeChild(overlay);
      modalVisible = false;
      if (isTargetPage()) {
          initialLoadAutoClosed = true;
      }
  }

  function setupSeatSelectionListener() {
      if (seatClickHandler) {
          return;
      }

      seatClickHandler = function(event) {
          if (!isTargetPage() || !event.target || !event.target.closest) {
              return;
          }

          const seat = event.target.closest(SEAT_BUTTON_SELECTOR);
          if (!seat || seat.disabled || seat.getAttribute('data-seat-available') !== 'true') {
              return;
          }

          handleSeatSelection(seat.getAttribute('data-seat-designator'));
      };

      document.addEventListener('click', seatClickHandler, true);
  }

  function handleSeatSelection(designator) {
      console.log('[AT] assento selecionado: ' + (designator || 'sem designador'));

      if (hasBlockingNativeModal()) {
          console.log('[AT] painel nao aberto, ha um modal nativo em exibicao');
          return;
      }

      seatSelectionActive = true;

      if (!modalVisible) {
          createPanel(false);
          showPanel(false);
          trackAnalytics('click_seat');
      }

      startSeatConfirmationWatch(designator);
  }

  function syncNativeModalState() {
      if (isSyncingNativeModals) {
          return;
      }

      const loadingOverlay = document.getElementById(OVERLAY_ID);
      if (!loadingOverlay) {
          return;
      }

      isSyncingNativeModals = true;

      try {
          const modals = document.querySelectorAll(NATIVE_MODAL_SELECTOR);
          let hasBlockingModal = false;
          let hasAssignCheck = false;
          let changeSegmentNode = null;

          for (let i = 0; i < modals.length; i += 1) {
              const content = modals[i].querySelector('.ReactModal__Content');
              const isAssignLoader = !!(content && content.id === ASSIGN_LOADER_ID);
              const isChangeSegment = !!(content && content.id === CHANGE_SEGMENT_ID);

              if (isAssignLoader) {
                  if (!modals[i].classList.contains(ASSIGN_LOADER_OVERLAY_CLASS)) {
                      modals[i].classList.add(ASSIGN_LOADER_OVERLAY_CLASS);
                  }
              } else if (modals[i].classList.contains(ASSIGN_LOADER_OVERLAY_CLASS)) {
                  modals[i].classList.remove(ASSIGN_LOADER_OVERLAY_CLASS);
              }

              if (isChangeSegment) {
                  changeSegmentNode = content;
                  if (!modals[i].classList.contains(CHANGE_SEGMENT_OVERLAY_CLASS)) {
                      modals[i].classList.add(CHANGE_SEGMENT_OVERLAY_CLASS);
                  }
              }

              const rect = modals[i].getBoundingClientRect();
              if (content && content.id === ASSIGN_CHECK_ID && rect.width > 0 && rect.height > 0) {
                  hasAssignCheck = true;
                  continue;
              }
              if (!isAssignLoader && !isChangeSegment && rect.width > 0 && rect.height > 0) {
                  hasBlockingModal = true;
              }
          }

          if (changeSegmentNode && !seatSelectionActive && !initialLoadAutoClosed) {
              if (!modalVisible && (loadingSessionActive || pendingLoaderActivation || isTargetPage())) {
                  handleLoaderAppear(changeSegmentNode);
              } else if (modalVisible) {
                  bindNativeLoader(changeSegmentNode);
              }
          }

          if (hasAssignCheck) {
              console.log('[AT] confirmacao do assento aberta, fechando o painel');
              hidePanel();
              return;
          }

          var shouldPause = hasBlockingModal;
          if (shouldPause) {
              if (!loadingOverlay.classList.contains(NATIVE_MODAL_PAUSED_CLASS)) {
                  loadingOverlay.classList.add(NATIVE_MODAL_PAUSED_CLASS);
              }
          } else if (loadingOverlay.classList.contains(NATIVE_MODAL_PAUSED_CLASS)) {
              loadingOverlay.classList.remove(NATIVE_MODAL_PAUSED_CLASS);
          }

          var nextAriaHidden = shouldPause ? 'true' : 'false';
          if (loadingOverlay.getAttribute('aria-hidden') !== nextAriaHidden) {
              loadingOverlay.setAttribute('aria-hidden', nextAriaHidden);
          }
      } finally {
          isSyncingNativeModals = false;
      }
  }

  function hasBlockingNativeModal() {
      const modals = document.querySelectorAll(NATIVE_MODAL_SELECTOR);
      for (let i = 0; i < modals.length; i += 1) {
          const content = modals[i].querySelector('.ReactModal__Content');
          if (content && (content.id === ASSIGN_LOADER_ID || content.id === CHANGE_SEGMENT_ID)) {
              continue;
          }
          if (modals[i].classList.contains(CHANGE_SEGMENT_OVERLAY_CLASS) ||
              modals[i].classList.contains(ASSIGN_LOADER_OVERLAY_CLASS)) {
              continue;
          }

          const rect = modals[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
              return true;
          }
      }
      return false;
  }

  function startNativeModalObserver() {
      if (nativeModalObserver) {
          syncNativeModalState();
          return;
      }

      nativeModalObserver = new MutationObserver(function() {
          if (isSyncingNativeModals) {
              return;
          }
          syncNativeModalState();
      });
      nativeModalObserver.observe(document.body, {
          childList: true,
          subtree: true,
      });
      syncNativeModalState();
  }

  function stopNativeModalObserver() {
      if (!nativeModalObserver) {
          return;
      }
      nativeModalObserver.disconnect();
      nativeModalObserver = null;
  }

  function startSeatConfirmationWatch(designator) {
      stopSeatConfirmationWatch();

      seatConfirmationInterval = window.setInterval(function() {
          if (!isSeatConfirmed(designator)) {
              return;
          }
          console.log('[AT] assento confirmado no card do passageiro, fechando o painel');
          hidePanel();
      }, SEAT_CONFIRMATION_POLL_MS);
  }

  function stopSeatConfirmationWatch() {
      if (seatConfirmationInterval) {
          window.clearInterval(seatConfirmationInterval);
          seatConfirmationInterval = null;
      }
  }

  function isSeatConfirmed(designator) {
      const labels = document.querySelectorAll(PASSENGER_SEAT_SELECTOR);
      for (let i = 0; i < labels.length; i += 1) {
          if (labels[i].offsetParent === null) {
              continue;
          }

          const text = (labels[i].textContent || '').trim();
          if (!text || text === EMPTY_SEAT_LABEL) {
              continue;
          }
          if (!designator || text === designator) {
              return true;
          }
      }
      return false;
  }

  function getLoaderProgress(loader) {
      if (!loader) {
          return null;
      }

      var attrNames = [
          'aria-valuenow',
          'data-progress',
          'data-percentage',
          'value',
          'data-loaded',
          'data-loaded-percent',
          'aria-valuetext',
          'aria-valuemax'
      ];

      var i;
      for (i = 0; i < attrNames.length; i += 1) {
          var attr = loader.getAttribute(attrNames[i]);
          if (attr) {
              var raw = attr.replace(',', '.').trim();
              var value = parseFloat(raw);
              if (!Number.isNaN(value)) {
                  if (attrNames[i] === 'aria-valuetext') {
                      var percentMatch = raw.match(/(\d{1,3})(?:\.|,)?\d*\s*%/);
                      if (percentMatch) {
                          value = parseFloat(percentMatch[1].replace(',', '.'));
                      }
                  }
                  return Math.min(100, Math.max(0, value));
              }
          }
      }

      var text = loader.textContent || loader.innerText || '';
      var match = text.match(/(\d{1,3})(?:\.|,)?(\d{0,2})?\s*%/);
      if (match) {
          return Math.min(100, Math.max(0, parseFloat(match[1].replace(',', '.'))));
      }

      var progressFill = loader.querySelector('.progress-fill, .azul-progress-fill, .at-seatmap-progress-fill');
      if (progressFill && progressFill.parentElement) {
          var fillWidth = window.getComputedStyle(progressFill).width;
          var parentWidth = window.getComputedStyle(progressFill.parentElement).width;
          if (fillWidth && parentWidth && parentWidth !== '0px') {
              var numericFill = parseFloat(fillWidth);
              var numericParent = parseFloat(parentWidth);
              if (!Number.isNaN(numericFill) && !Number.isNaN(numericParent) && numericParent > 0) {
                  return Math.min(100, Math.max(0, (numericFill / numericParent) * 100));
              }
          }
      }

      return null;
  }

  function setProgressValue(value) {
      var fill = document.querySelector('.at-seatmap-progress-fill');
      var text = document.getElementById('at-seatmap-loading-text');
      if (!fill || !text) {
          return;
      }
      var normalized = Math.min(100, Math.max(0, Math.round(value)));
      fill.style.width = normalized + '%';
      text.textContent = 'Carregando... ' + normalized + '%';
  }

  function startProgressMonitor() {
      if (progressMonitorInterval) {
          return;
      }

      var baseValue = 30;
      setProgressValue(baseValue);

      progressMonitorInterval = window.setInterval(function() {
          var loader = getLoader(true) || (originalLoader && document.contains(originalLoader) ? originalLoader : null);
          var loaderProgress = getLoaderProgress(loader);

          if (loaderProgress !== null) {
              setProgressValue(Math.min(loaderProgress, loadingSessionActive ? 95 : 100));
              return;
          }

          if (loader || seatSelectionActive || loadingSessionActive) {
              var fillEl = document.querySelector('.at-seatmap-progress-fill');
              var current = (fillEl && parseInt(fillEl.style.width, 10)) || baseValue;
              var nextValue = Math.min(95, current + (seatSelectionActive ? 4 : 1));
              setProgressValue(nextValue);
              return;
          }

          var fillFinal = document.querySelector('.at-seatmap-progress-fill');
          var finalValue = (fillFinal && parseInt(fillFinal.style.width, 10)) || baseValue;
          finalValue = Math.min(100, finalValue + 8);
          setProgressValue(finalValue);

          // Nao fecha o modal aqui: o fechamento fica so no monitoramento do loader
          // (evita abrir/fechar duplo quando a SPA troca de .loader)
          if (finalValue >= 100) {
              stopProgressMonitor();
          }
      }, PROGRESS_TICK_MS);
  }

  function stopProgressMonitor() {
      if (progressMonitorInterval) {
          window.clearInterval(progressMonitorInterval);
          progressMonitorInterval = null;
      }
  }

  function startModalInteractionListeners() {
      const overlay = document.getElementById(OVERLAY_ID);
      if (!overlay || overlay.getAttribute('data-listeners-added') === 'true') {
          return;
      }

      overlay.addEventListener('click', function(event) {
          if (event.target === overlay) {
              trackAnalytics('click_overlay');
              hidePanel();
          }
      });

      overlay.setAttribute('data-listeners-added', 'true');
  }

  function setupModalInteractionListeners() {
      startModalInteractionListeners();
      if (!clickTracked) {
          var overlay = document.getElementById(OVERLAY_ID);
          if (overlay) {
              overlay.addEventListener('click', function() {
                  if (!clickTracked) {
                      trackAnalytics('click_any');
                      clickTracked = true;
                  }
              }, true);
          }
      }
  }

  function isResponsavelPage() {
      var href = window.location.href.toLowerCase();
      return href.indexOf(RESPONSAVEL_PATH) !== -1;
  }

  function activateForSeatmapTransition() {
      if (loadingSessionActive && modalVisible) {
          return;
      }

      loadingSessionActive = true;
      pendingLoaderActivation = true;
      initialLoadAutoClosed = false;
      createPanel(false);
      showPanel(false);
      startLoaderMonitoring();
      armSessionSafetyTimeout();
      trackAnalytics('click_responsavel_primary_button');
  }

  function attachResponsavelButtonListener() {
      if (!isResponsavelPage()) {
          return;
      }

      var button = document.querySelector(RESPONSAVEL_BUTTON_SELECTOR);
      if (!button || button.getAttribute('data-at-responsavel-listener') === 'true') {
          return;
      }

      button.addEventListener('click', activateForSeatmapTransition, true);
      button.addEventListener('mousedown', activateForSeatmapTransition, true);
      button.addEventListener('touchstart', activateForSeatmapTransition, true);
      button.setAttribute('data-at-responsavel-listener', 'true');
  }

  function trackAnalytics(eventLabel) {
      if (!eventLabel) {
          return;
      }

      const label = TRACKING_ACTIVITY + '_' + eventLabel;
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') {
          console.warn('[AT] evento descartado, Adobe Analytics indisponivel: ' + label);
          return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = label;
      s.eVar84 = 'seatmap_loading';
      s.tl(true, 'o', 'target_activity_action');
      console.log('[AT] evento enviado: ' + label);
  }

  function processLoader() {
      if (isProcessingLoader) {
          return;
      }
      isProcessingLoader = true;

      try {
          if (isResponsavelPage()) {
              attachResponsavelButtonListener();
              return;
          }

          if (!isTargetPage()) {
              if (modalVisible && !shouldKeepModalDuringTransition()) {
                  hidePanel();
              }
              if (!loadingSessionActive && !pendingLoaderActivation) {
                  initialLoadAutoClosed = false;
              }
              return;
          }

          var changeSegment = getChangeSegment();
          if (changeSegment && !initialLoadAutoClosed && !seatSelectionActive) {
              handleLoaderAppear(changeSegment);
          } else if ((pendingLoaderActivation || loadingSessionActive) && !modalVisible && !initialLoadAutoClosed) {
              // Mantem modal so se a sessao veio do clique; nao reabre sozinho
              createPanel(false);
              showPanel(false);
              startLoaderMonitoring();
          }

          monitorSkipButtonInjection();

          if (!leftColumnInjected) {
              monitorLeftColumnInjection();
          }
      } finally {
          isProcessingLoader = false;
      }
  }

  function scheduleProcessing() {
      if (debounceTimer) {
          window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(function() {
          debounceTimer = null;
          processLoader();
      }, 150);
  }

  function observeDOM() {
      if (observer) {
          return;
      }

      observer = new MutationObserver(function(mutations) {
          // Ignora mutacoes do nosso overlay para evitar loop
          for (var i = 0; i < mutations.length; i += 1) {
              var target = mutations[i].target;
              if (target && target.id === OVERLAY_ID) {
                  continue;
              }
              if (target && target.closest && target.closest('#' + OVERLAY_ID)) {
                  continue;
              }
              scheduleProcessing();
              return;
          }
      });

      // Nao observa attributes: class/style do proprio script geravam loop infinito
      observer.observe(document.body, {
          childList: true,
          subtree: true,
      });
  }

  function patchHistoryEvents() {
      var originalPush = history.pushState;
      var originalReplace = history.replaceState;

      history.pushState = function() {
          var result = originalPush.apply(this, arguments);
          window.dispatchEvent(new Event('historychange'));
          return result;
      };

      history.replaceState = function() {
          var result = originalReplace.apply(this, arguments);
          window.dispatchEvent(new Event('historychange'));
          return result;
      };
  }

  function init() {
      if (!document.body) {
          document.addEventListener('DOMContentLoaded', init);
          return;
      }

      createStyles();
      preloadImage(LOADING_IMAGE_URL);
      preloadImage(MODAL_IMAGE_URL);
      preloadImage(SKIP_MODAL_IMAGE_URL);
      preloadImage(CHECK_ICON_URL);
      setupSeatSelectionListener();
      setupLoaderObserver();
      observeDOM();
      patchHistoryEvents();

      if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
              processLoader();
          });
      } else {
          processLoader();
      }

      window.addEventListener('popstate', function() {
          window.setTimeout(processLoader, 200);
      });

      window.addEventListener('historychange', function() {
          window.setTimeout(processLoader, 200);
      });

      window.addEventListener('hashchange', function() {
          window.setTimeout(processLoader, 200);
      });
  }

  init();
})();