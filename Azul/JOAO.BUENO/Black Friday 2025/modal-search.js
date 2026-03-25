(() => {
  'use strict';

  const MODAL_HTML = `
<div class="business-tab__container"><div class="tabs"><div class=""><div class="css-1wl1vzt"><div class="css-ke7iqf"><h2 class="css-1tctgnu"><span class="screen-reader">Para onde vamos?</span><span aria-hidden="true">Para onde vamos?</span><button type="button" class="css-11lzv1o"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.26923 19.5L12 12.7692L18.7308 19.5L19.5 18.7308L12.7692 12L19.5 5.26923L18.7308 4.5L12 11.2308L5.26923 4.5L4.5 5.26923L11.2308 12L4.5 18.7308L5.26923 19.5Z" fill="#041E42"></path></svg></button></h2><p class="css-1bayuga">Mais de 150 destinos para você escolher!</p><ul class="form-stations"><li class="form-stations-item"><div class=""><div class="form-stations-wrapper css-187knvu"><button type="button" class="form-stations-drag css-1w8fe7z"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="#606060"><path d="M7.59097 6.14799C8.36609 6.14799 8.99445 5.54123 8.99445 4.79275C8.99445 4.04426 8.36609 3.4375 7.59097 3.4375C6.81586 3.4375 6.1875 4.04426 6.1875 4.79275C6.1875 5.54123 6.81586 6.14799 7.59097 6.14799Z"></path><path d="M14.4091 6.14799C15.1842 6.14799 15.8126 5.54123 15.8126 4.79275C15.8126 4.04426 15.1842 3.4375 14.4091 3.4375C13.634 3.4375 13.0056 4.04426 13.0056 4.79275C13.0056 5.54123 13.634 6.14799 14.4091 6.14799Z"></path><path d="M7.59097 12.699C8.36609 12.699 8.99445 12.0923 8.99445 11.3438C8.99445 10.5953 8.36609 9.98853 7.59097 9.98853C6.81586 9.98853 6.1875 10.5953 6.1875 11.3438C6.1875 12.0923 6.81586 12.699 7.59097 12.699Z"></path><path d="M14.4091 12.699C15.1842 12.699 15.8126 12.0923 15.8126 11.3438C15.8126 10.5953 15.1842 9.98853 14.4091 9.98853C13.634 9.98853 13.0056 10.5953 13.0056 11.3438C13.0056 12.0923 13.634 12.699 14.4091 12.699Z"></path><path d="M7.59097 19.25C8.36609 19.25 8.99445 18.6433 8.99445 17.8948C8.99445 17.1463 8.36609 16.5396 7.59097 16.5396C6.81586 16.5396 6.1875 17.1463 6.1875 17.8948C6.1875 18.6433 6.81586 19.25 7.59097 19.25Z"></path><path d="M14.4091 19.25C15.1842 19.25 15.8126 18.6433 15.8126 17.8948C15.8126 17.1463 15.1842 16.5396 14.4091 16.5396C13.634 16.5396 13.0056 17.1463 13.0056 17.8948C13.0056 18.6433 13.634 19.25 14.4091 19.25Z"></path></g></svg></button><div class="css-1370rvh"><div data-id="1" class="form-stations-row css-s77aop"><div class="form-stations-row__content"><div class="css-7rxd72"><div class="focus-within css-1kx1v6j" aria-haspopup="listbox" aria-expanded="false"><div class="station-picker css-13eiqkn" aria-label="Selecione a origem do seu voo."><label class="field__label" for="Origem1">Origem</label><div class="css-lny3l"><i class="input__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="#014E84" stroke-width="2"></path></svg></i><input type="text" autocomplete="off" placeholder="Digite a sua origem" id="Origem1" name="Origem1" class="css-1u6ex07" value=""></div></div></div></div><div class="css-7rxd72"><div class="focus-within css-1kx1v6j" aria-haspopup="listbox" aria-expanded="false"><div class="station-picker css-13eiqkn" aria-label="Selecione o destino do seu voo."><label class="field__label" for="Destino1">Destino</label><div class="css-lny3l"><i class="input__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.75C8.68274 3.75 6 6.33263 6 9.52534C6 13.8565 12 20.25 12 20.25C12 20.25 18 13.8565 18 9.52534C18 6.33263 15.3173 3.75 12 3.75ZM12 12.6969C13.6245 12.6969 14.9463 11.3752 14.9463 9.75061C14.9463 8.12605 13.6245 6.80365 12 6.80365C10.3754 6.80365 9.05365 8.12605 9.05365 9.75061C9.05365 11.3752 10.3754 12.6969 12 12.6969Z" fill="#041E42"></path></svg></i><input type="text" autocomplete="off" placeholder="Digite o seu destino" id="Destino1" name="Destino1" class="css-1u6ex07" value=""></div></div></div></div></div></div><div class="css-nzp9bm"><label aria-label="Datas (ida e volta)" for="datepicker_temp1" class="css-ykw7zn"><small class="input__label">Datas (ida e volta)</small><input class="input__field" type="text" readonly="" placeholder="Selecione" id="datepicker_temp1" value=""></label></div></div></div><div></div></div></li></ul></div><div class="css-1agepgd"><div class=""><div class="text-container css-193go2i" data-rte-editelement="true"><p data-sider-select-id="8fa86117-69de-47de-8ca4-152d57ae3e72"><a title="clique para fazer o login" data-modal="FORM_LOGIN" href="#">Faça o login</a>&nbsp;e aproveite as vantagens de ser Azul!</p>

</div><div></div></div></div><form method="post" action="/br/pt/home/selecao-voo" target="_blank" autocomplete="off" class="css-38lglc"><input type="text" readonly="" name="origin1" value=""><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$TextBoxMarketOrigin1" value=""><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$CheckBoxUseMacOrigin1" value=""><input type="text" readonly="" name="hdfSearchCodeDeparture1" value="false"><input type="text" readonly="" name="originIata1" value=""><input type="text" readonly="" name="destination1" value=""><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$TextBoxMarketDestination1" value=""><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$CheckBoxUseMacDestination1" value=""><input type="text" readonly="" name="hdfSearchCodeArrival1" value="false"><input type="text" readonly="" name="destinationIata1" value=""><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$DropDownListPassengerType_ADT" value="1"><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$DropDownListPassengerType_CHD" value="0"><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$DropDownListPassengerType_INFANT" value="0"><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$RadioButtonMarketStructure" value="OneWay"><input type="text" readonly="" name="_authkey_" value="106352422A4DEB0810953636A6FBE2079955529786098DE8B0D32416202E380E34C245FA99C431C7C7A75560FDE65150"><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$DropDownListSearchBy" value="columnView"><input type="text" readonly="" name="culture" value="pt-br"><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$TextBoxPromoCode" value="CALLCENT"><input type="text" readonly="" name="__EVENTTARGET" value="ControlGroupSearch$LinkButtonSubmit"><input type="text" readonly="" name="ControlGroupSearch$SearchMainSearchView$DropDownListFareTypes" value="R"></form></div><div></div></div><div class=""><div></div></div><div class=""><div></div></div></div></div>
  `;

  const MODAL_CONTAINER_ID = 'landing-page-modal-search';
  const COUNTDOWN_ID = 'azul-friday-countdown';
  const BANNER_CONTAINER_SELECTOR = '.container-capsule.containerDefault.css-oo7lgl';

  /**
   * Aguarda um elemento específico estar disponível no DOM
   */
  const waitForElement = (selector, { timeout = 10000, silent = false } = {}) =>
    new Promise((resolve, reject) => {
      // Tenta encontrar por ID primeiro
      let element = typeof selector === 'string' && selector.startsWith('#')
        ? document.getElementById(selector.substring(1))
        : document.querySelector(selector);

      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        element = typeof selector === 'string' && selector.startsWith('#')
          ? document.getElementById(selector.substring(1))
          : document.querySelector(selector);

        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        if (!element) {
          const error = new Error(`Element "${selector}" not found within timeout`);
          if (!silent) {
            console.warn('[Modal Search]', error.message);
          }
          reject(error);
        }
      }, timeout);
    });

  /**
   * Encontra o container do banner que contém o countdown
   */
  const findBannerContainer = () => {
    // Primeiro tenta encontrar pelo countdown ID
    const countdownElement = document.getElementById(COUNTDOWN_ID);
    if (countdownElement) {
      // Sobe na árvore DOM até encontrar o container com a classe css-oo7lgl
      let parent = countdownElement.parentElement;
      while (parent && parent !== document.body) {
        if (parent.classList.contains('css-oo7lgl') && 
            parent.classList.contains('container-capsule') && 
            parent.classList.contains('containerDefault')) {
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // Se não encontrou pelo countdown, tenta pelo seletor direto
    const container = document.querySelector(BANNER_CONTAINER_SELECTOR);
    if (container) {
      return container;
    }

    return null;
  };

  /**
   * Verifica se o modal já foi inserido para evitar duplicação
   */
  const isModalAlreadyInserted = () => {
    return document.getElementById(MODAL_CONTAINER_ID) !== null;
  };

  /**
   * Insere o modal abaixo do banner do countdown
   */
  const insertModal = (bannerContainer) => {
    // Verifica se já foi inserido
    if (isModalAlreadyInserted()) {
      console.warn('[Modal Search] Modal já foi inserido anteriormente');
      return;
    }

    // Cria o container do modal
    const modalContainer = document.createElement('div');
    modalContainer.id = MODAL_CONTAINER_ID;
    modalContainer.innerHTML = MODAL_HTML;

    // Insere logo após o container do banner
    if (bannerContainer && bannerContainer.parentNode) {
      bannerContainer.parentNode.insertBefore(modalContainer, bannerContainer.nextSibling);
      console.log('[Modal Search] Modal inserido com sucesso abaixo do banner do countdown');
    } else {
      // Fallback: insere no body se não encontrar o container
      document.body.appendChild(modalContainer);
      console.warn('[Modal Search] Banner container não encontrado, modal inserido no body');
    }
  };

  /**
   * Inicializa a inserção do modal
   */
  const init = () => {
    // Primeiro tenta encontrar o countdown, depois o container
    Promise.race([
      waitForElement(`#${COUNTDOWN_ID}`, { timeout: 10000 }),
      waitForElement(BANNER_CONTAINER_SELECTOR, { timeout: 10000 })
    ])
      .then(() => {
        // Aguarda um pouco para garantir que o DOM está totalmente renderizado
        setTimeout(() => {
          const bannerContainer = findBannerContainer();
          if (bannerContainer) {
            insertModal(bannerContainer);
          } else {
            console.warn('[Modal Search] Container do banner não encontrado após timeout');
          }
        }, 100);
      })
      .catch((error) => {
        console.warn('[Modal Search]', error.message);
      });
  };

  // Executa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM já está pronto
    init();
  }
})();

