  // Script para injetar modal via console do navegador
  // Cole este código no console quando estiver na URL:
  // https://qa.gab.egerdau.com.br/purchase/commerce/steel-type-choose/steel-type-choose

  (function() {
    // Verifica se o modal já existe para evitar duplicação
    if (document.getElementById('gerdau-welcome-modal')) {
      document.getElementById('gerdau-welcome-modal')?.remove();
      document.getElementById('gerdau-modal-overlay')?.remove();
    }

    // Cria o overlay
    const overlay = document.createElement('div');
    overlay.id = 'gerdau-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
    `;

    // Cria o container principal do modal
    const modal = document.createElement('div');
    modal.id = 'gerdau-welcome-modal';
    modal.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        
        #gerdau-welcome-modal * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }
        
        #gerdau-welcome-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 1153px;
          max-width: 95vw;
          max-height: 90vh;
          background: #FFFFFF;
          box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .gerdau-modal-header {
          position: relative;
          width: 100%;
          min-height: 128px;
          background: #003366;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 24px 40px;
          overflow: hidden;
        }
        
        .gerdau-modal-header::before {
          content: '';
          position: absolute;
          width: 256px;
          height: 256px;
          right: -50px;
          top: -128px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .gerdau-modal-header::after {
          content: '';
          position: absolute;
          width: 192px;
          height: 192px;
          left: -96px;
          top: -38px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .gerdau-header-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1;
        }
        
        .gerdau-header-title {
          font-weight: 600;
          font-size: 32px;
          line-height: 36px;
          letter-spacing: 0.38px;
          color: #FFFFFF;
          margin: 0;
        }
        
        .gerdau-header-subtitle {
          font-weight: 400;
          font-size: 16px;
          line-height: 26px;
          letter-spacing: -0.31px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        
        .gerdau-logo {
          z-index: 1;
          height: 30px;
        }
        
        .gerdau-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          border-radius: 50%;
          transition: background 0.2s;
        }
        
        .gerdau-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .gerdau-close-btn svg {
          width: 24px;
          height: 24px;
          stroke: #FFFFFF;
          stroke-width: 2;
        }
        
        .gerdau-modal-body {
          display: flex;
          flex-direction: column;
          padding: 24px 40px;
          gap: 16px;
          background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
          overflow-y: auto;
          max-height: calc(90vh - 128px);
        }
        
        .gerdau-body-description {
          font-weight: 400;
          font-size: 16px;
          line-height: 26px;
          letter-spacing: -0.31px;
          color: #666666;
          margin: 0;
        }
        
        .gerdau-emissor-card {
          display: flex;
          flex-direction: column;
          padding: 16px 24px;
          gap: 16px;
          background: #FFFFFF;
          box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        .gerdau-emissor-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 16px;
        }
        
        .gerdau-emissor-icon {
          width: 24px;
          height: 24px;
          color: #2C2C2C;
        }
        
        .gerdau-emissor-label {
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: -0.15px;
          color: #2C2C2C;
        }
        
        .gerdau-emissor-controls {
          display: flex;
          flex-direction: row;
          gap: 16px;
          align-items: center;
        }
        
        .gerdau-dropdown {
          position: relative;
          width: 320px;
          height: 40px;
        }
        
        .gerdau-dropdown select {
          width: 100%;
          height: 100%;
          padding: 0 40px 0 12px;
          background: #FFFFFF;
          border: 1px solid #CCCCCC;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #666666;
          appearance: none;
          cursor: pointer;
        }
        
        .gerdau-dropdown::after {
          content: '';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #666666;
          pointer-events: none;
        }
        
        .gerdau-search-btn {
          width: 102px;
          height: 40px;
          background: #7FB8E8;
          opacity: 0.5;
          border-radius: 4px;
          border: none;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          text-align: center;
          letter-spacing: -0.31px;
          color: #FFFFFF;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .gerdau-search-btn:hover {
          opacity: 0.7;
        }
        
        .gerdau-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 24px;
        }
        
        .gerdau-section-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
        }
        
        .gerdau-section-bar {
          width: 48px;
          height: 4px;
          background: linear-gradient(180deg, #7FB8E8 0%, #164573 100%);
          border-radius: 9999px;
        }
        
        .gerdau-section-title {
          font-weight: 600;
          font-size: 20px;
          line-height: 28px;
          letter-spacing: -0.45px;
          color: #2C2C2C;
          margin: 0;
        }
        
        .gerdau-options-container {
          display: flex;
          flex-direction: row;
          gap: 32px;
        }
        
        .gerdau-options-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }
        
        .gerdau-column-title {
          font-weight: 600;
          font-size: 16px;
          line-height: 24px;
          letter-spacing: -0.31px;
          color: #2C2C2C;
          margin: 0;
          padding-bottom: 8px;
        }
        
        .gerdau-option-btn {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        
        .gerdau-option-btn:hover {
          background: rgba(0, 51, 102, 0.05);
        }
        
        .gerdau-option-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          background: rgba(0, 51, 102, 0.05);
          border-radius: 10px;
        }
        
        .gerdau-option-icon-container svg {
          width: 20px;
          height: 20px;
          stroke: #2C2C2C;
          stroke-width: 1.67;
          fill: none;
        }
        
        .gerdau-option-text {
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: -0.15px;
          color: #2C2C2C;
        }
        
        .gerdau-menu-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .gerdau-menu-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 8px 16px;
          gap: 16px;
          width: calc(33.33% - 11px);
          min-width: 300px;
          background: #FFFFFF;
          box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          border: none;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        
        .gerdau-menu-card:hover {
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .gerdau-menu-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 56px;
          height: 40px;
          background: #003366;
          box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
        }
        
        .gerdau-menu-icon-container svg {
          width: 28px;
          height: 28px;
          stroke: #FFFFFF;
          stroke-width: 2.33;
          fill: none;
        }
        
        .gerdau-menu-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .gerdau-menu-title {
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          letter-spacing: -0.31px;
          color: #2C2C2C;
          margin: 0;
          text-align: left;
        }
        
        .gerdau-menu-description {
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          color: #666666;
          margin: 0;
          text-align: left;
        }
      </style>
      
      <div class="gerdau-modal-header">
        <div class="gerdau-header-content">
          <h1 class="gerdau-header-title">O que você quer fazer hoje?</h1>
          <p class="gerdau-header-subtitle">Escolha uma opção abaixo para começar</p>
        </div>
        <svg viewBox="0 0 213 24" class="gerdau-logo" width="213" height="24" aria-hidden="true" focusable="false">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M17.6241 23.6842H22.8299V10.6301H11.6037V15.1206L17.4254 15.1404C16.2929 17.1671 14.8027 19.0944 12.1203 19.0745C9.17963 19.2136 6.27871 16.7498 6.19923 12.6568C6.08001 8.22589 9.15976 5.86144 11.9216 5.96079C13.6105 6.04027 15.657 6.93439 16.273 8.80211L21.598 6.2787C19.3329 2.5234 15.657 0.615937 12.1203 0.755022C5.46407 0.695414 0.218563 4.84811 0 12.3985C0 19.6309 5.72237 23.6842 10.65 23.9823C13.7496 24.1611 16.2333 22.9689 17.644 21.1807V23.6842H17.6241ZM26.7044 23.7041H42.1429V18.8162H32.8241V14.4251H40.6725V9.69623H32.844V5.84157H42.1429V0.89411H26.7044V23.7041ZM110.136 0.89411L110.156 15.1802C110.156 20.7038 113.514 23.8432 119.733 23.724C125.753 23.6048 128.733 20.9621 129.25 15.2398V0.91398H123.21V14.5443C123.349 16.8492 122.177 18.2996 119.733 18.3791C117.448 18.4189 115.938 17.2267 116.136 14.5443V0.91398H110.136V0.89411ZM54.1439 11.6235C56.0514 11.4447 56.8859 10.491 56.9256 8.70276C56.9654 7.03374 56.1905 5.92105 54.1439 5.72236C53.7068 5.66275 53.2101 5.70249 52.6537 5.72236H51.3622V11.5639L53.2697 11.6037C53.5876 11.6434 53.8856 11.6434 54.1439 11.6235ZM54.1439 0.933845C56.5084 1.01332 58.4158 1.29149 59.9855 2.44392C61.7539 3.83477 62.6679 5.72236 62.6679 8.12655C62.6679 11.6832 60.82 13.8489 57.4423 14.6437L64.0389 23.724H56.6673L54.1439 19.7898L51.3821 15.4385V23.724H45.4014V0.89411H52.455C53.0313 0.89411 53.6075 0.933845 54.1439 0.933845ZM76.0201 0.993456C77.9871 1.19215 79.6164 1.76836 81.047 2.74196C83.7294 4.76863 85.7561 7.88811 85.8951 12.319C85.7759 17.5247 83.173 20.8032 80.3317 22.3927C79.1197 22.9888 77.7288 23.3862 76.0201 23.5849C75.1856 23.6842 74.2915 23.7041 73.298 23.7041H66.5027V0.89411H74.4504C74.9869 0.933848 75.5035 0.953718 76.0201 0.993456ZM76.0201 18.1804C78.166 17.6638 79.5767 15.9551 79.4773 12.1799C79.378 8.62328 78.0865 6.97412 76.0201 6.41778C75.5432 6.29857 75.0266 6.21909 74.51 6.19922H72.5628V18.3195H74.4305C74.9869 18.3394 75.5233 18.2798 76.0201 18.1804ZM100.857 0.933845L109.222 23.724H102.685L101.453 19.5315H93.3064L92.1739 23.724H85.7163L93.6243 0.933845H100.857ZM97.3995 14.8026H100.062L97.3995 6.75556L97.2207 6.21909L94.7171 14.8225H97.3995V14.8026Z" fill="white"/>
          <path d="M163.127 12.2991V23.4855H161.438V12.3786C161.438 9.61675 160.147 8.06694 157.723 8.06694C155.239 8.06694 153.65 9.95453 153.65 12.6766V23.4855H151.961V12.4978C151.961 9.73596 150.769 8.04707 148.205 8.04707C145.642 8.04707 144.152 10.1333 144.152 13.3124V23.4657H142.463V6.65621H143.894L144.053 9.27897C144.887 7.53047 146.437 6.45752 148.563 6.45752C150.749 6.45752 152.378 7.60994 153.034 9.53727C153.888 7.68942 155.617 6.45752 157.941 6.45752C161.18 6.47739 163.127 8.58354 163.127 12.2991Z" fill="white"/>
          <path d="M182.778 21.9357V23.4855H181.745C179.758 23.4855 178.963 22.6312 178.983 20.6244V19.9885C177.99 22.1146 175.963 23.6644 172.545 23.6644C168.969 23.6644 166.604 21.8364 166.604 18.856C166.604 15.6968 168.889 13.8489 173.241 13.8489H178.903V12.3985C178.903 9.61675 177.155 7.94772 173.956 7.94772C171.135 7.94772 169.307 9.29884 168.909 11.3652H167.22C167.657 8.30537 170.201 6.45752 174.055 6.45752C178.228 6.45752 180.592 8.62328 180.592 12.4581V20.2866C180.592 21.5781 181.129 21.9159 182.083 21.9159H182.778V21.9357ZM178.923 15.3192H173.082C169.962 15.3192 168.313 16.5511 168.313 18.7765C168.313 20.8628 170.002 22.2338 172.665 22.2338C176.638 22.2338 178.923 19.9091 178.923 16.6902V15.3192Z" fill="white"/>
          <path d="M196.945 21.9357V23.4855H185.103V21.9357H190.169V8.2259H185.103V6.6761H191.878V21.9357H196.945ZM189.613 1.39085C189.613 0.59608 190.249 0 191.044 0C191.838 0 192.474 0.59608 192.474 1.39085C192.474 2.24523 191.838 2.84131 191.044 2.84131C190.249 2.86118 189.613 2.2651 189.613 1.39085Z" fill="white"/>
          <path d="M198.673 18.3195H200.402C200.541 20.7436 202.627 22.2338 205.846 22.2338C208.608 22.2338 210.694 20.982 210.694 18.9752C210.694 16.4916 208.409 16.114 205.588 15.7167C202.131 15.2597 199.011 14.6238 199.011 11.2461C199.011 8.365 201.674 6.47742 205.409 6.47742C209.085 6.47742 211.787 8.12656 212.085 11.4249H210.357C210.059 9.23925 208.131 7.94774 205.409 7.94774C202.588 7.94774 200.7 9.19951 200.7 11.1268C200.7 13.4913 202.985 13.7893 205.648 14.147C209.264 14.6437 212.383 15.3391 212.383 18.8958C212.383 21.8762 209.463 23.7041 205.846 23.7041C201.634 23.6843 198.813 21.7967 198.673 18.3195Z" fill="white"/>
          <path d="M163.127 12.3389V23.5253H161.438V12.3985C161.438 9.63664 160.147 8.08683 157.723 8.08683C155.239 8.08683 153.65 9.97442 153.65 12.6965V23.5054H151.961V12.5177C151.961 9.75585 150.769 8.06696 148.205 8.06696C145.642 8.06696 144.152 10.1532 144.152 13.3323V23.4856H142.463V6.67611H143.894L144.053 9.29886C144.887 7.55036 146.437 6.47742 148.563 6.47742C150.749 6.47742 152.378 7.62984 153.034 9.55716C153.888 7.70932 155.617 6.47742 157.941 6.47742C161.18 6.49729 163.127 8.6233 163.127 12.3389Z" fill="white"/>
          <path d="M182.778 21.9556V23.5054H181.745C179.758 23.5054 178.963 22.6511 178.983 20.6442V20.0084C177.99 22.1344 175.963 23.6843 172.545 23.6843C168.969 23.6843 166.604 21.8563 166.604 18.8759C166.604 15.7167 168.889 13.8688 173.241 13.8688H178.903V12.4183C178.903 9.63663 177.155 7.96762 173.956 7.96762C171.135 7.96762 169.307 9.31873 168.909 11.3851H167.22C167.657 8.32527 170.201 6.47742 174.055 6.47742C178.228 6.47742 180.592 8.64318 180.592 12.478V20.3065C180.592 21.598 181.129 21.9358 182.083 21.9358H182.778V21.9556ZM178.923 15.359H173.082C169.962 15.359 168.313 16.5909 168.313 18.8163C168.313 20.9025 170.002 22.2735 172.665 22.2735C176.638 22.2735 178.923 19.9488 178.923 16.73V15.359Z" fill="white"/>
          <path d="M196.945 21.9556V23.5054H185.103V21.9556H190.169V8.26564H185.103V6.71584H191.878V21.9755H196.945V21.9556ZM189.613 1.43059C189.613 0.635814 190.249 0.0397339 191.044 0.0397339C191.838 0.0397339 192.474 0.635814 192.474 1.43059C192.474 2.28497 191.838 2.88105 191.044 2.88105C190.249 2.88105 189.613 2.28497 189.613 1.43059Z" fill="white"/>
          <path d="M198.673 18.3394H200.402C200.541 20.7634 202.627 22.2536 205.846 22.2536C208.608 22.2536 210.694 21.0019 210.694 18.9951C210.694 16.5114 208.409 16.1339 205.588 15.7365C202.131 15.2795 199.011 14.6437 199.011 11.2659C199.011 8.38484 201.674 6.49725 205.409 6.49725C209.085 6.49725 211.787 8.14641 212.085 11.4447H210.357C210.059 9.2591 208.131 7.96759 205.409 7.96759C202.588 7.96759 200.7 9.21936 200.7 11.1467C200.7 13.5111 202.985 13.8092 205.648 14.1668C209.264 14.6636 212.383 15.359 212.383 18.9156C212.383 21.896 209.463 23.724 205.846 23.724C201.634 23.7041 198.813 21.8165 198.673 18.3394Z" fill="white"/>
        </svg>
        <button class="gerdau-close-btn" id="gerdau-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="gerdau-modal-body">
        <p class="gerdau-body-description">Selecione um emissor e acompanhe dados de volume e de pagamentos de pedidos.</p>
        
        <div class="gerdau-emissor-card">
          <div class="gerdau-emissor-header">
            <svg class="gerdau-emissor-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="gerdau-emissor-label">Emissor/ Filial</span>
          </div>
          <div class="gerdau-emissor-controls">
            <div class="gerdau-dropdown">
              <select>
                <option value="">Selecionar emissor</option>
              </select>
            </div>
            <button class="gerdau-search-btn">Buscar</button>
          </div>
        </div>
        
        <div class="gerdau-section">
          <div class="gerdau-section-header">
            <div class="gerdau-section-bar"></div>
            <h2 class="gerdau-section-title">Opções de Compra Rápida</h2>
          </div>
          
          <div class="gerdau-options-container">
            <div class="gerdau-options-column">
              <h3 class="gerdau-column-title">Aços longos</h3>
              <button class="gerdau-option-btn" data-action="Comprar por vitrine">
                <div class="gerdau-option-icon-container">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 12.5V15M7.5 5V10M12.5 10H17.5M2.5 10H7.5M7.5 5H12.5V10H7.5V5Z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="gerdau-option-text">Comprar por vitrine</span>
              </button>
              <button class="gerdau-option-btn" data-action="Comprar selecionando itens">
                <div class="gerdau-option-icon-container">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M11 4H17M11 10H17M11 16H17M5 16V12M5 8V4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="gerdau-option-text">Comprar selecionando itens</span>
              </button>
              <button class="gerdau-option-btn" data-action="Comprar por planilha">
                <div class="gerdau-option-icon-container">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M3.33 3.33H16.67V16.67H3.33V3.33ZM12 3.33V7M6.67 11H8.33M11.67 11H13.33M6.67 14H8.33M11.67 14H13.33" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="gerdau-option-text">Comprar por planilha</span>
              </button>
              <button class="gerdau-option-btn" data-action="Comprar por histórico">
                <div class="gerdau-option-icon-container">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 2.5H17.5V17.5H2.5V2.5ZM2.5 2.5V6.67M10 6V12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="gerdau-option-text">Comprar por histórico</span>
              </button>
            </div>
            
            <div class="gerdau-options-column">
              <h3 class="gerdau-column-title">Corte e dobra</h3>
              <button class="gerdau-option-btn">
                <div class="gerdau-option-icon-container">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 2.5V7.5H7.5M7 7L12.5 12.5M2.5 12.5V17.5H7.5M12.5 12.5L17.5 17.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="gerdau-option-text">Solicitar novo pedido</span>
              </button>
              <button class="gerdau-option-btn">
                <div class="gerdau-option-icon-container">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M6.67 2H13.33V5M3.33 5H16.67V17.5H3.33V5ZM10 9H13.33M10 13H13.33M6.67 9H6.67V9M6.67 13H6.67V13" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="gerdau-option-text">Revisar pedido por histórico</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="gerdau-section">
          <div class="gerdau-section-header">
            <div class="gerdau-section-bar"></div>
            <h2 class="gerdau-section-title">Menu Principal</h2>
          </div>
          
          <div class="gerdau-menu-grid">
            <button class="gerdau-menu-card">
              <div class="gerdau-menu-icon-container">
                <svg viewBox="0 0 28 28" fill="none">
                  <path d="M3.5 3.5H12V14H3.5V3.5ZM16 3.5H24.5V9H16V3.5ZM16 14H24.5V24.5H16V14ZM3.5 19H12V24.5H3.5V19Z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="gerdau-menu-content">
                <p class="gerdau-menu-title">Painel de gestão</p>
                <p class="gerdau-menu-description">Visualize dados e métricas</p>
              </div>
            </button>
            
            <button class="gerdau-menu-card">
              <div class="gerdau-menu-icon-container">
                <svg viewBox="0 0 28 28" fill="none">
                  <path d="M3.5 3.5H24.5V24.5H3.5V3.5ZM14 14V24.5M4 8H24M9 5V8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="gerdau-menu-content">
                <p class="gerdau-menu-title">Pedidos</p>
                <p class="gerdau-menu-description">Gerencie seus pedidos</p>
              </div>
            </button>
            
            <button class="gerdau-menu-card">
              <div class="gerdau-menu-icon-container">
                <svg viewBox="0 0 28 28" fill="none">
                  <path d="M14 2.5V25.5M7 6H21M7 22H21" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="gerdau-menu-content">
                <p class="gerdau-menu-title">Finanças</p>
                <p class="gerdau-menu-description">Consulte informações financeiras</p>
              </div>
            </button>
            
            <button class="gerdau-menu-card">
              <div class="gerdau-menu-icon-container">
                <svg viewBox="0 0 28 28" fill="none">
                  <path d="M9 2.5H19V7H9V2.5ZM2.5 7H25.5V23.5H2.5V7Z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="gerdau-menu-content">
                <p class="gerdau-menu-title">Maquetas e Projetos</p>
                <p class="gerdau-menu-description">Acesse maquetas e projetos</p>
              </div>
            </button>
            
            <button class="gerdau-menu-card">
              <div class="gerdau-menu-icon-container">
                <svg viewBox="0 0 28 28" fill="none">
                  <path d="M5 2.5H23V25.5H5V2.5ZM9 7H9V7M14 7H14V7M19 7H19V7M9 12H9V12M14 12H14V12M19 12H19V12M9 17H9V17M14 17H14V17M19 17H19V17M10 21H18" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="gerdau-menu-content">
                <p class="gerdau-menu-title">Contratos e obras</p>
                <p class="gerdau-menu-description">Consulte contratos e obras</p>
              </div>
            </button>
            
            <button class="gerdau-menu-card">
              <div class="gerdau-menu-icon-container">
                <svg viewBox="0 0 28 28" fill="none">
                  <path d="M4.67 2.33H23.33V25.67H4.67V2.33ZM16.33 2.33V7M10.5 14H12.17M15.58 19L12.17 15.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="gerdau-menu-content">
                <p class="gerdau-menu-title">Buscar documentos</p>
                <p class="gerdau-menu-description">Encontre documentos</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Função para fechar o modal
    const closeModal = () => {
      modal.remove();
      overlay.remove();
    };

    // Função para clicar nos botões existentes na página
    const clickPageButton = (buttonName) => {
      // Fecha o modal primeiro
      closeModal();
      
      // Encontra o botão na página pelo atributo name
      const pageButton = document.querySelector(`button.hefesto-button[name="${buttonName}"]`);
      
      if (pageButton) {
        // Simula o clique no botão da página
        pageButton.click();
        console.log(`Botão "${buttonName}" clicado com sucesso!`);
      } else {
        console.warn(`Botão "${buttonName}" não encontrado na página.`);
      }
    };

    // Event listeners para os botões de Aços longos
    const optionButtons = modal.querySelectorAll('.gerdau-option-btn[data-action]');
    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action) {
          clickPageButton(action);
        }
      });
    });

    // Event listeners
    document.getElementById('gerdau-close-btn')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Fecha com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    console.log('Modal Gerdau carregado com sucesso!');
  })();
