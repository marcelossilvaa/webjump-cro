// POPUP DIAMANTE TUDO AZUL - UNIQUE COOKIE

(function () {
  var POPUP_ID = 'diamante-unique-popup';
  var BUTTON_ID = 'diamante-unique-floating-btn';
  var MIN_QUALIFYING_POINTS = 26000;
  var MIN_FLIGHTS = 26;

  // Funcao de Analytics
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    
    // Padrao: AT_DiamanteUnique_[tipo] [label]
    var labelEvent = 'AT_DiamanteUnique_' + eventType + ' ' + eventLabel;

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_DiamanteUnique';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function injectPopupStyles() {
    if (document.getElementById('diamante-unique-popup-styles')) return;

    var styles = document.createElement('style');
    styles.id = 'diamante-unique-popup-styles';
    styles.textContent = '' +
      '@keyframes diamante-pulse {' +
      '  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(4, 30, 66, 0.4); }' +
      '  70% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(4, 30, 66, 0); }' +
      '  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(4, 30, 66, 0); }' +
      '}' +
      '#' + BUTTON_ID + ' {' +
      '  position: fixed;' +
      '  bottom: 24px;' +
      '  right: 22px;' +
      '  width: 55px;' +
      '  height: 55px;' +
      '  background: #041E42;' +
      '  border-radius: 50%;' +
      '  cursor: pointer;' +
      '  display: none;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));' +
      '  z-index: 999998;' +
      '  transition: all 0.3s ease;' +
      '  animation: diamante-pulse 2s infinite;' +
      '}' +
      '#' + BUTTON_ID + '.visible {' +
      '  display: flex;' +
      '}' +
      '#' + BUTTON_ID + ':hover {' +
      '  animation: none;' +
      '  transform: scale(1.05);' +
      '  filter: drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.3));' +
      '}' +
      '#' + BUTTON_ID + ' svg {' +
      '  width: 35px;' +
      '  height: 35px;' +
      '}' +
      '.diamante-popup-container {' +
      '  position: fixed;' +
      '  bottom: 24px;' +
      '  right: 100px;' +
      '  width: 325px;' +
      '  max-height: calc(100vh - 48px);' +
      '  display: flex;' +
      '  visibility: hidden;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  box-sizing: border-box;' +
      '  z-index: 999999;' +
      '  opacity: 0;' +
      '  transform: translateX(-10px) scale(0.95);' +
      '  pointer-events: none;' +
      '  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);' +
      '  overflow: visible;' +
      '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;' +
      '}' +
      '.diamante-popup-container.active {' +
      '  visibility: visible !important;' +
      '  opacity: 1 !important;' +
      '  transform: translateX(0) scale(1) !important;' +
      '  pointer-events: auto !important;' +
      '}' +
      '.diamante-popup-content-wrapper {' +
      '  width: 100%;' +
      '  height: 100%;' +
      '  background: linear-gradient(0deg, #041E42, #041E42);' +
      '  border-radius: 16px;' +
      '  padding: 24px 24px;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  gap: 16px;' +
      '  color: #FFFFFF;' +
      '  box-sizing: border-box;' +
      '  overflow-y: auto;' +
      '  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.5);' +
      '}' +
      /* Scrollbar customizada */
      '.diamante-popup-content-wrapper::-webkit-scrollbar {' +
      '  width: 4px;' +
      '}' +
      '.diamante-popup-content-wrapper::-webkit-scrollbar-track {' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '}' +
      '.diamante-popup-content-wrapper::-webkit-scrollbar-thumb {' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  border-radius: 4px;' +
      '}' +
      /* Header do Popup */
      '.diamante-popup-header {' +
      '  display: flex;' +
      '  justify-content: space-between;' +
      '  align-items: center;' +
      '  width: 100%;' +
      '}' +
      '.diamante-popup-header-left {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '}' +
      '.diamante-popup-badge {' +
      '  background: #CF527A;' +
      '  border-radius: 20px;' +
      '  padding: 6px 12px;' +
      '  font-size: 14px;' +
      '  font-weight: 700;' +
      '  letter-spacing: 0.3px;' +
      '}' +
      '.diamante-popup-close {' +
      '  background: transparent;' +
      '  border: none;' +
      '  color: #FFFFFF;' +
      '  font-size: 24px;' +
      '  cursor: pointer;' +
      '  padding: 4px;' +
      '  opacity: 0.7;' +
      '  transition: opacity 0.3s ease;' +
      '}' +
      '.diamante-popup-close:hover {' +
      '  opacity: 1;' +
      '  background: transparent;' +
      '}' +
      /* Títulos */
      '.diamante-popup-level {' +
      '  font-size: 16px;' +
      '  font-weight: 300;' +
      '  text-align: center;' +
      '}' +
      '.diamante-popup-title {' +
      '  font-size: 24px;' +
      '  font-weight: 300;' +
      '  text-transform: uppercase;' +
      '  text-align: center;' +
      '}' +
      '.diamante-popup-divider {' +
      '  width: 100%;' +
      '  height: 1px;' +
      '  background: rgba(255, 255, 255, 0.32);' +
      '}' +
      /* Intro */
      '.diamante-popup-intro {' +
      '  text-align: center;' +
      '}' +
      '.diamante-popup-intro h2 {' +
      '  font-size: 20px;' +
      '  font-weight: 300;' +
      '  margin: 0 0 8px 0;' +
      '}' +
      '.diamante-popup-intro p {' +
      '  font-size: 14px;' +
      '  font-weight: 300;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '  line-height: 1.4;' +
      '  margin: 0;' +
      '}' +
      /* Benefícios */
      '.diamante-popup-benefits-box {' +
      '  background: rgba(255, 255, 255, 0.05);' +
      '  border: 1px solid rgba(255, 255, 255, 0.1);' +
      '  border-radius: 14px;' +
      '  padding: 14px 18px;' +
      '  width: 100%;' +
      '  box-sizing: border-box;' +
      '}' +
      '.diamante-popup-benefits-title {' +
      '  font-size: 14px;' +
      '  font-weight: 700;' +
      '  margin-bottom: 16px;' +
      '}' +
      '.diamante-popup-benefit-item {' +
      '  display: flex;' +
      '  gap: 12px;' +
      '  margin-bottom: 12px;' +
      '}' +
      '.diamante-popup-benefit-icon {' +
      '  width: 32px;' +
      '  height: 32px;' +
      '  min-width: 32px;' +
      '  border-radius: 50%;' +
      '  border: 0.75px solid #FFFFFF;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  background: #041E42;' +
      '}' +
      '.diamante-popup-benefit-content {' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  gap: 4px;' +
      '}' +
      '.diamante-popup-benefit-name {' +
      '  font-size: 14px;' +
      '  font-weight: 500;' +
      '  line-height: 1.2;' +
      '}' +
      '.diamante-popup-benefit-desc {' +
      '  font-size: 12px;' +
      '  color: rgba(255, 255, 255, 0.5);' +
      '}' +
      /* Footer do Benefício */
      '.diamante-popup-benefits-footer {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 12px;' +
      '  margin-top: 8px;' +
      '}' +
      '.diamante-popup-line {' +
      '  flex: 1;' +
      '  height: 1px;' +
      '  background: rgba(255, 255, 255, 0.1);' +
      '}' +
      '.diamante-popup-badge-small {' +
      '  background: rgba(255, 255, 255, 0.2);' +
      '  border-radius: 20px;' +
      '  padding: 2px 10px;' +
      '  font-size: 10px;' +
      '  text-transform: uppercase;' +
      '}' +
      /* Botão Final */
      '.diamante-popup-btn {' +
      '  background: #008058;' +
      '  color: #FFFFFF;' +
      '  border-radius: 8px;' +
      '  padding: 13px 17px;' +
      '  text-decoration: none;' +
      '  font-size: 16px;' +
      '  text-align: center;' +
      '  width: 100%;' +
      '  box-sizing: border-box;' +
      '  margin-top: 8px;' +
      '  display: block;' +
      '  transition: background-color 0.3s ease, transform 0.2s ease;' +
      '}' +
      '.diamante-popup-btn:hover {' +
      '  background: #006646;' +
      '  transform: scale(1.02);' +
      '}' +
      /* Seta do Popup */
      '.diamante-popup-arrow {' +
      '  position: absolute;' +
      '  bottom: 17px;' +
      '  right: -6px;' +
      '  width: 20px;' +
      '  height: 20px;' +
      '  background: #041E42;' +
      '  transform: rotate(45deg);' +
      '  z-index: -1;' +
      '}' +
      '@media (max-width: 768px) {' +
      '  .diamante-popup-container {' +
      '    width: calc(100% - 32px);' +
      '    height: auto;' +
      '    max-height: 80vh;' +
      '    bottom: 100px;' +
      '    right: 16px;' +
      '    transform: translateY(20px) scale(0.95);' +
      '  }' +
      '  .diamante-popup-container.active {' +
      '    transform: translateY(0) scale(1) !important;' +
      '  }' +
      '  #' + BUTTON_ID + ' {' +
      '    width: 70px;' +
      '    height: 70px;' +
      '    bottom: 16px;' +
      '    right: 16px;' +
      '  }' +
      '  #' + BUTTON_ID + ' svg {' +
      '    width: 40px;' +
      '    height: 40px;' +
      '  }' +
      '  .diamante-popup-arrow {' +
      '    bottom: -6px;' +
      '    right: 26px;' +
      '    z-index: -1;' +
      '  }' +
      '}';
    document.head.appendChild(styles);
  }

  // --- HTML ---
  function createPopupHTML() {
    var diamondIcon = '<svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.0034 45.5032C35.4298 45.5032 45.5034 35.4296 45.5034 23.0032C45.5034 10.5768 35.4298 0.503174 23.0034 0.503174C10.577 0.503174 0.503418 10.5768 0.503418 23.0032C0.503418 35.4296 10.577 45.5032 23.0034 45.5032Z" stroke="white" stroke-width="1.00645"/><path d="M29.4346 5.00305C29.4346 9.97568 25.4043 14.006 20.4316 14.006C25.4043 14.006 29.4346 18.0363 29.4346 23.009C29.4346 18.0363 33.4649 14.006 38.4376 14.006C33.4649 14.006 29.4346 9.97568 29.4346 5.00305Z" fill="white"/><path d="M19.147 14.0032H16.2694L10.147 21.2889L23.0041 35.8603L35.8613 21.2889L34.5755 19.8317" stroke="white" stroke-width="2.0129" stroke-miterlimit="10"/></svg>';
    
    var seatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M16.4385 12.0725L21.3447 16.9787" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M17.9628 15.3665C17.9628 15.3665 17.9278 15.3665 17.9103 15.3665C17.8665 15.3665 17.8139 15.3665 17.7701 15.384C17.6825 15.3927 17.6036 15.419 17.5248 15.4453C17.3758 15.4979 17.2444 15.5767 17.1393 15.6643C16.9203 15.8483 15.8427 16.9259 15.7988 16.9697C15.6236 16.9172 15.2557 16.8033 14.8527 16.6719C14.9403 16.6193 15.0366 16.558 15.1067 16.4791C15.1418 16.4441 15.1768 16.4003 15.2031 16.3565C15.2294 16.3127 15.2557 16.2601 15.2732 16.1988L14.914 15.8396C14.8527 15.8571 14.8088 15.8834 14.7563 15.9096C14.7125 15.9359 14.6687 15.971 14.6336 16.006C14.5548 16.0761 14.5022 16.1725 14.4409 16.2601C14.3971 16.3389 14.3533 16.4178 14.3095 16.4966C13.8539 16.3565 13.4158 16.2338 13.1618 16.1637C13.1267 16.1637 13.1004 16.155 13.0654 16.155C12.9515 16.155 12.8639 16.2075 12.8288 16.2513C12.7675 16.3214 12.7062 16.4178 12.7062 16.4178L15.0717 17.6969C14.9578 17.8196 14.1518 18.6869 14.1518 18.6869C13.9415 18.8972 13.7312 19.2564 13.7137 19.2827C13.3808 19.1775 12.7938 19.0111 12.5134 18.9936C12.4959 18.9936 12.4696 18.9936 12.4433 18.9936C12.382 18.9936 12.3119 19.0023 12.2418 19.0724C12.163 19.1513 12.1279 19.2214 12.1279 19.2214L13.2844 19.9047L12.9953 20.334L13.0654 20.4041L13.1355 20.4742L13.5648 20.1763L14.2481 21.3328C14.2481 21.3328 14.3182 21.289 14.3971 21.2189C14.4935 21.1225 14.4759 21.0174 14.4759 20.9561C14.4584 20.6845 14.2919 20.0887 14.1868 19.7558C14.2131 19.7383 14.581 19.5192 14.7826 19.3177C14.7826 19.3177 15.6499 18.5117 15.7726 18.4066L17.0517 20.7721C17.0517 20.7721 17.1568 20.7107 17.2182 20.6494C17.2795 20.5968 17.3408 20.4654 17.3058 20.3165C17.2357 20.0624 17.113 19.6244 16.9728 19.1688C17.0604 19.1337 17.1393 19.0899 17.2094 19.0374C17.297 18.9848 17.3934 18.9235 17.4635 18.8446C17.4985 18.8096 17.5336 18.7658 17.5598 18.722C17.5861 18.6782 17.6124 18.6256 17.6299 18.5643L17.2707 18.2051C17.2094 18.2226 17.1656 18.2489 17.1218 18.2751C17.078 18.3014 17.0342 18.3365 16.9991 18.3715C16.9203 18.4416 16.8677 18.538 16.8064 18.6256C16.6837 18.2138 16.5698 17.8546 16.5085 17.6794C16.5523 17.6356 17.6299 16.558 17.8139 16.3389C17.9015 16.225 17.9804 16.1024 18.0329 15.9535C18.0592 15.8834 18.0768 15.7958 18.0943 15.7081C18.0943 15.6643 18.103 15.6205 18.1118 15.568C18.1118 15.5242 18.1118 15.4803 18.1118 15.4365C18.1118 15.419 18.1118 15.4103 18.0943 15.4015C18.0855 15.3927 18.068 15.384 18.0592 15.384C18.0329 15.384 18.0067 15.384 17.9804 15.384" fill="white"/><path d="M17.9887 9.28667L17.279 8.57701C16.8147 8.11267 16.07 8.11267 15.6056 8.57701L13.3453 10.8374C13.687 11.1791 13.687 11.731 13.3453 12.0727C13.0036 12.4144 12.4516 12.4144 12.11 12.0727L6.74816 17.4345C6.28382 17.8989 6.28382 18.6436 6.74816 19.1079L11.2689 23.6286C11.7332 24.093 12.4779 24.093 12.9423 23.6286L13.6519 22.919M13.3365 12.0727L14.2652 13.0014M18.6983 8.57701L16.438 10.8374C16.7796 11.1791 16.7796 11.731 16.438 12.0727C16.0963 12.4144 15.5443 12.4144 15.2026 12.0727L9.84083 17.4345C9.3765 17.8989 9.3765 18.6436 9.84083 19.1079L14.3616 23.6286C14.8259 24.093 15.5706 24.093 16.035 23.6286L21.4055 18.2581C21.4055 18.2581 21.3617 18.2318 21.3442 18.2143C21.0025 17.8726 21.0025 17.3206 21.3442 16.9789C21.6859 16.6373 22.2378 16.6373 22.5883 16.9789C22.6058 16.9965 22.6146 17.0227 22.6321 17.0403L24.9012 14.7711C25.3656 14.3068 25.3656 13.5621 24.9012 13.0978L20.3805 8.57701C19.9161 8.11267 19.1714 8.11267 18.7071 8.57701H18.6983Z" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/></svg>';
    var userIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M9.88574 22.0858C9.88574 22.4961 10.2187 22.8291 10.629 22.8291C11.0393 22.8291 11.3723 22.4961 11.3723 22.0858C11.3723 21.6755 11.0334 21.3425 10.629 21.3425C10.2187 21.3425 9.88574 21.6755 9.88574 22.0858Z" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M18.2226 12.6013L19.3464 15.069L21.4276 16.288L21.1303 16.8826L18.4545 15.6934L17.8599 14.5041" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M16.6707 18.3694C16.0761 19.2614 15.4814 20.4506 13.6976 21.9372L14.5895 22.2345V22.8292H12.5083V21.9372C14.4527 19.9333 15.1841 17.8402 15.2912 16.9958" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M16.5756 15.9432L18.7519 18.3753L19.6438 21.943L20.8331 22.2404V22.835H19.0492L17.5626 19.2731L15.5944 17.4476C14.6965 16.5022 15.5647 15.4437 15.5647 15.4437L16.0166 13.5647" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M17.8657 10.5143C17.8895 10.8295 18.0679 11.2576 18.4068 11.5371C18.6566 11.7393 18.9896 11.7274 19.2453 11.5133C19.4534 11.3408 19.6437 11.0614 19.7745 10.7641C20.161 9.86617 19.7328 9.3191 19.1561 9.18828C18.169 8.96827 17.836 10.0208 17.8717 10.5203L17.8657 10.5143Z" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M13.3999 16.3357L10.9263 21.3425" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M12.627 17.9472L10.6291 16.8828L8.54785 21.0452L9.94523 21.7945" stroke="white" stroke-width="0.5" stroke-linejoin="round"/><path d="M17.1286 16.5378L18.0325 13.8798C18.7163 12.1078 17.5568 11.8343 17.5568 11.8343C17.5568 11.8343 17.4914 11.8165 17.3843 11.7927C16.3913 11.6084 15.5707 12.0305 14.8928 13.1484L13.1387 16.1811L13.7511 16.4843C13.7511 16.4843 15.7848 13.6063 16.4626 13.1365" stroke="white" stroke-width="0.5" stroke-linejoin="round"/></svg>';
    var fastIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M16.0246 9.14307C14.4188 9.14307 13.4029 10.2245 13.4029 11.7648C13.4029 11.7648 13.3898 14.6749 12.4197 15.3696C12.4197 15.3696 13.0162 15.6974 14.7137 15.6974V16.6805L12.4001 17.5195C11.6201 17.8013 11.1089 18.5419 11.1089 19.3678V22.6318" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M13.0752 20.2854V23.2348" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M18.9741 20.2854V23.2348" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M16.0244 9.14307C17.6302 9.14307 18.6461 10.2245 18.6461 11.7648C18.6461 11.7648 18.6592 14.6749 19.6293 15.3696C19.6293 15.3696 19.0328 15.6974 17.3353 15.6974V16.6805L19.649 17.5195C20.4224 17.8013 20.9401 18.5419 20.9401 19.3678V22.6318" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M12.0922 14.3865C11.1877 14.3865 10.4536 13.6524 10.4536 12.7479V11.7648C10.4536 10.8603 11.1877 10.1262 12.0922 10.1262C12.6296 10.1262 13.1015 10.3818 13.403 10.7816C13.4358 10.8275 13.4686 10.8734 13.4948 10.9193" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M9.14258 19.3022V16.9688C9.14258 16.4052 9.50308 15.9005 10.0405 15.7235L10.8008 15.4679C10.9975 15.4024 11.1482 15.2516 11.2137 15.055L11.4366 14.3799" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M19.9573 14.3865C20.8618 14.3865 21.5959 13.6524 21.5959 12.7479V11.7648C21.5959 10.8603 20.8618 10.1262 19.9573 10.1262C19.4198 10.1262 18.9479 10.3818 18.6464 10.7816C18.6137 10.8275 18.5809 10.8734 18.5547 10.9193" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/><path d="M22.9068 19.3022V16.9688C22.9068 16.4052 22.5463 15.9005 22.0089 15.7235L21.2486 15.4679C21.0519 15.4024 20.9012 15.2516 20.8357 15.055L20.6128 14.3799" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/></svg>';
    var calendarIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.6256" fill="#041E42" stroke="white" stroke-width="0.74873"/><path d="M10.6675 20.4943V18.6195H12.4811M13.7339 20.4943V18.6195H15.5474M16.7915 20.4943V18.6195H18.6051M19.8316 20.4943V18.6195H21.6452M10.6675 16.8234V14.9485H12.4811M13.7339 16.8234V14.9485H15.5474M16.7915 16.8234V14.9485H18.6051M19.8316 16.8234V14.9485H21.6452M22.5826 13.1087H9.14307V10.6644H22.5826V13.1087ZM22.5914 21.975H9.15184V10.6644H22.5914V21.975ZM12.7089 10.6644H11.1494V8.99098C11.1494 8.57044 11.4911 8.22876 11.9116 8.22876H11.9466C12.3672 8.22876 12.7089 8.57044 12.7089 8.99098V10.6644ZM20.5851 10.6644H19.0256V8.99098C19.0256 8.57044 19.3673 8.22876 19.7878 8.22876H19.8229C20.2434 8.22876 20.5851 8.57044 20.5851 8.99098V10.6644Z" stroke="white" stroke-width="0.74873" stroke-linejoin="round"/></svg>';

    return '' +
      '<div id="' + BUTTON_ID + '">' +
      '  ' + diamondIcon +
      '</div>' +
      '<div class="diamante-popup-container" id="' + POPUP_ID + '">' +
      '  <div class="diamante-popup-content-wrapper">' +
      '      <div class="diamante-popup-header">' +
      '      <div class="diamante-popup-header-left">' +
      '          <div style="width: 40px; height: 40px;">' + diamondIcon + '</div>' +
      '          <span class="diamante-popup-badge">Novo</span>' +
      '      </div>' +
      '      <button class="diamante-popup-close">&times;</button>' +
      '      </div>' +
      '      <div>' +
      '        <div class="diamante-popup-level">Nível 5</div>' +
      '        <div class="diamante-popup-title">DIAMANTE UNIQUE</div>' +
      '      </div>' +
      '      <div class="diamante-popup-divider"></div>' +

      '      <div class="diamante-popup-intro">' +
      '      <h2>Novo nível Azul Fidelidade!</h2>' +
      '      <p>Conheça as novidades que chegam a partir de <strong>13 de janeiro de 2026</strong>.</p>' +
      '      </div>' +

      '      <div class="diamante-popup-divider"></div>' +

      '      <div class="diamante-popup-benefits-box">' +
      '      <div class="diamante-popup-benefits-title">Conheça alguns benefícios:</div>' +
      '      ' +
      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + seatIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Cortesias ilimitadas no Economy Xtra e Espaço Azul.</span>' +
      '          <span class="diamante-popup-benefit-desc">Mais conforto nas suas viagens nacionais e internacionais.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + fastIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Check-in e embarques prioritários.</span>' +
      '          <span class="diamante-popup-benefit-desc">Seja um dos primeiros a embarcar em seu voo.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + userIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Passagem Cortesia para acompanhante.</span>' +
      '          <span class="diamante-popup-benefit-desc">4 trechos disponíveis.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefit-item">' +
      '          <div class="diamante-popup-benefit-icon">' + calendarIcon + '</div>' +
      '          <div class="diamante-popup-benefit-content">' +
      '          <span class="diamante-popup-benefit-name">Pontos com validade de 10 anos.</span>' +
      '          <span class="diamante-popup-benefit-desc">Sem pressa para usar os seus pontos.</span>' +
      '          </div>' +
      '      </div>' +

      '      <div class="diamante-popup-benefits-footer">' +
      '          <div class="diamante-popup-line"></div>' +
      '          <span class="diamante-popup-badge-small">E MUITOS OUTROS</span>' +
      '          <div class="diamante-popup-line"></div>' +
      '      </div>' +
      '      </div>' +

      '      <a href="https://www.voeazul.com.br/br/pt/programa-fidelidade/comunicado-novo-nivel?msockid=2c47c86ae1fb6bc025f9dee6e0e26af0" class="diamante-popup-btn">Ver todos os benefícios</a>' +
      '  </div>' +
      '  <div class="diamante-popup-arrow"></div>' +
      '</div>';
  }

  // --- Funcoes Auxiliares ---

  function isHomepage() {
    return window.location.href.indexOf('voeazul.com.br/home/br/pt/home') !== -1 || 
           window.location.href.indexOf('debug-modal.html') !== -1;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // --- Controle de Estado (Regras de Exibicao) ---

  const STORAGE_KEYS = {
    INTERACTED: 'diamante_unique_popup_interacted_date',
    VIEWS: 'diamante_unique_popup_views_count',
    LAST_VIEW_DATE: 'diamante_unique_popup_last_view_date',
    SESSION_SHOWN: 'diamante_unique_popup_session_shown'
  };

  function hasInteractedToday() {
    const interactedDate = getStorage(STORAGE_KEYS.INTERACTED);
    return interactedDate === getTodayDateString();
  }

  function getViewsToday() {
    const lastViewDate = getStorage(STORAGE_KEYS.LAST_VIEW_DATE);
    const today = getTodayDateString();
    
    if (lastViewDate !== today) {
      return 0;
    }
    
    return getStorage(STORAGE_KEYS.VIEWS) || 0;
  }

  function incrementViews() {
    const views = getViewsToday();
    const today = getTodayDateString();
    
    setStorage(STORAGE_KEYS.VIEWS, views + 1);
    setStorage(STORAGE_KEYS.LAST_VIEW_DATE, today);
  }

  function markInteraction() {
    setStorage(STORAGE_KEYS.INTERACTED, getTodayDateString());
  }

  function wasPopupShownInSession() {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_SHOWN) === 'true';
  }

  function markPopupShownInSession() {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_SHOWN, 'true');
  }

  // --- Triggers ---

  let inactivityTimer;
  let triggersInitialized = false;

  function getRandomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    const minTime = isMobile() ? 30 : 45;
    const maxTime = isMobile() ? 60 : 90;
    const time = getRandomTime(minTime, maxTime);

    inactivityTimer = setTimeout(() => {
      triggerPopup();
    }, time);
  }

  function setupTriggers() {
    if (triggersInitialized) return;
    triggersInitialized = true;

    // 1. Inatividade
    const activityEvents = ['mousemove', 'scroll', 'click', 'keydown', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    // 2. Exit Intent (Desktop apenas)
    if (!isMobile()) {
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0) {
          triggerPopup();
        }
      });
    }

    // 3. Scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 100) { 
           triggerPopup();
        }
        scrollTimeout = null;
      }, 500);
    }, { passive: true });
  }

  function triggerPopup() {
    // Verifica se esta na home
    if (!isHomepage()) return;

    window.UniquePopup.show();
  }

  // --- Lógica ---
  function injectPopup() {
    if (document.getElementById(POPUP_ID)) return;

    injectPopupStyles();
    
    var container = document.createElement('div');
    container.id = 'diamante-unique-popup-wrapper';
    container.innerHTML = createPopupHTML();
    document.body.appendChild(container);

    var btn = document.getElementById(BUTTON_ID);
    var popup = document.getElementById(POPUP_ID);
    var closeBtn = popup.querySelector('.diamante-popup-close');
    var ctaBtn = popup.querySelector('.diamante-popup-btn');

    if (ctaBtn) {
      ctaBtn.addEventListener('click', function() {
        analyticsEvent('Ver Beneficios', 'clique');
      });
    }

    btn.onclick = function() {
      if (popup.classList.contains('active')) {
        popup.classList.remove('active');
        analyticsEvent('Floating Button Fechar', 'clique');
      } else {
        popup.classList.add('active');
        analyticsEvent('Floating Button Abrir', 'clique');
        analyticsEvent('Popup', 'visualizacao');
      }
    };

    closeBtn.onclick = function(e) {
      e.stopPropagation();
      popup.classList.remove('active');
      analyticsEvent('Fechar', 'clique');
      markInteraction(); // Marcar interacao ao fechar
    };

    document.addEventListener('click', function(e) {
      if (!popup.contains(e.target) && !btn.contains(e.target)) {
        if (popup.classList.contains('active')) {
            popup.classList.remove('active');
            analyticsEvent('Fechar Outside', 'clique');
            markInteraction(); // Marcar interacao ao clicar fora (fechar)
        }
      }
    });
  }

  function init(retries) {
    retries = retries || 0;
    injectPopup();

    var isEligible = false;
    if (window.TudoAzulCookie && typeof window.TudoAzulCookie.getTudoAzulData === 'function') {
      var data = window.TudoAzulCookie.getTudoAzulData();
      if (data) {
        // Regras de elegibilidade: Pontos ou Trechos
        isEligible = (data.qualifyingPoints >= MIN_QUALIFYING_POINTS || data.flights >= MIN_FLIGHTS);
      }
    } else if (retries < 10) {
      setTimeout(function() { init(retries + 1); }, 500);
      return;
    }

    if (isEligible && isHomepage()) {
      var btn = document.getElementById(BUTTON_ID);
      if (btn) btn.classList.add('visible');
      
      // Abertura automatica 1x por dia
      if (!hasInteractedToday()) {
        setTimeout(function() {
          window.UniquePopup.show();
          markInteraction();
        }, 2000);
      }
    }
  }

  // Expor métodos globais para debug
  window.UniquePopup = {
    show: function() {
      injectPopup(); // Garante que está no DOM
      var popup = document.getElementById(POPUP_ID);
      if (popup) {
        popup.classList.add('active');
        analyticsEvent('Popup', 'visualizacao');
      }
    },
    hide: function() {
      var popup = document.getElementById(POPUP_ID);
      if (popup) {
        popup.classList.remove('active');
      }
    },
    showButton: function() {
        injectPopup();
        var btn = document.getElementById(BUTTON_ID);
        if (btn) btn.classList.add('visible');
    },
    init: init
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', function() { init(); });
  }
})();
