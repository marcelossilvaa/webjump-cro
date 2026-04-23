(function () {
  const experienceName = 'AT_EXPERIENCE_HOLIDAYS_BANNER';
  const experienceTargetUrl = 'home/br/pt/home';
  const experienceAlreadyExecuted = globalThis[experienceName] || false;

  let observer = null;

  const bannerId = 'at-holidays-modal-banner';
  const stylesId = 'at-holidays-modal-styles';
  const minViewportWidth = 0;
  const holidaysBaseUrl = 'https://passagens.voeazul.com.br/pt/feriados';
  const holidayItems = [
    {
      label: 'Trabalho',
      svg: '<svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.3156 4.33481V0.544947C16.3156 0.397023 16.2634 0.257228 16.1735 0.155791C16.0839 0.0547184 15.9645 0 15.8422 0H8.15779C8.03547 0 7.9161 0.0547184 7.82651 0.155791C7.7366 0.257228 7.68443 0.397023 7.68443 0.544947V4.33481H1.2418C0.915686 4.33481 0.600857 4.48086 0.367159 4.74452C0.133138 5.00855 0 5.36886 0 5.74671V20.5881C0 20.9659 0.133138 21.3263 0.367159 21.5903C0.600857 21.8539 0.915687 22 1.2418 22H22.7582C23.0843 22 23.3991 21.8539 23.6328 21.5903C23.8669 21.3263 24 20.9659 24 20.5881V5.74671C24 5.36886 23.8669 5.00855 23.6328 4.74452C23.3991 4.48086 23.0843 4.33481 22.7582 4.33481H16.3156ZM8.63115 1.08989H15.3689V4.33481H8.63115V1.08989ZM0.946721 5.4247H23.0533V9.64804C23.0533 10.6498 22.7006 11.6126 22.07 12.3241C21.439 13.0359 20.5811 13.4379 19.6844 13.4379H14.0102V12.2489C14.0102 11.8711 13.8771 11.5108 13.6431 11.2467C13.4094 10.9831 13.0946 10.837 12.7684 10.837H11.2316C10.9054 10.837 10.5906 10.9831 10.3569 11.2467C10.1229 11.5108 9.98975 11.8711 9.98975 12.2489V13.4379H4.31557C3.41887 13.4379 2.56096 13.0359 1.92999 12.3241C1.29935 11.6126 0.946721 10.6498 0.946721 9.64804V5.4247ZM13.0635 16.0388H10.9365V11.9269H13.0635V16.0388ZM0.946721 20.9101V12.7753L1.4428 13.2789C2.23314 14.0813 3.25626 14.525 4.31587 14.5278H9.98975V15.7168C9.98975 16.0946 10.1229 16.4549 10.3569 16.719C10.5906 16.9826 10.9054 17.1287 11.2316 17.1287H12.7684C13.0946 17.1287 13.4094 16.9826 13.6431 16.719C13.8771 16.4549 14.0102 16.0946 14.0102 15.7168V14.5278H19.6844C20.7442 14.5285 21.7682 14.0847 22.5566 13.2796L23.0533 12.7723V20.9101H0.946721Z" fill="white"/></svg>',
    },
    {
      label: 'Cospus Christi',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 9H14" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7V12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 22V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 22V5.61799C17.9999 5.43232 17.9481 5.25036 17.8504 5.09246C17.7528 4.93456 17.6131 4.80698 17.447 4.72399L12.894 2.44699C12.6164 2.30827 12.3103 2.23605 12 2.23605C11.6897 2.23605 11.3836 2.30827 11.106 2.44699L6.553 4.72399C6.38692 4.80698 6.24722 4.93456 6.14955 5.09246C6.05188 5.25036 6.0001 5.43232 6 5.61799V22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7L21.447 8.724C21.6131 8.80699 21.7528 8.93458 21.8504 9.09247C21.9481 9.25037 21.9999 9.43234 22 9.618V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V9.618C2.0001 9.43234 2.05188 9.25037 2.14955 9.09247C2.24722 8.93458 2.38692 8.80699 2.553 8.724L6 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Independência',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 22V15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'N. Sra. Aparecida',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 9H14" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7V12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 22V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 22V5.61799C17.9999 5.43232 17.9481 5.25036 17.8504 5.09246C17.7528 4.93456 17.6131 4.80698 17.447 4.72399L12.894 2.44699C12.6164 2.30827 12.3103 2.23605 12 2.23605C11.6897 2.23605 11.3836 2.30827 11.106 2.44699L6.553 4.72399C6.38692 4.80698 6.24722 4.93456 6.14955 5.09246C6.05188 5.25036 6.0001 5.43232 6 5.61799V22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7L21.447 8.724C21.6131 8.80699 21.7528 8.93458 21.8504 9.09247C21.9481 9.25037 21.9999 9.43234 22 9.618V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V9.618C2.0001 9.43234 2.05188 9.25037 2.14955 9.09247C2.24722 8.93458 2.38692 8.80699 2.553 8.724L6 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Finados',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5C12 4.40666 12.1759 3.82664 12.5056 3.33329C12.8352 2.83994 13.3038 2.45543 13.852 2.22836C14.4001 2.0013 15.0033 1.94189 15.5853 2.05765C16.1672 2.1734 16.7018 2.45912 17.1213 2.87868C17.5409 3.29824 17.8266 3.83279 17.9424 4.41473C18.0581 4.99667 17.9987 5.59987 17.7716 6.14805C17.5446 6.69623 17.1601 7.16477 16.6667 7.49441C16.1734 7.82405 15.5933 8 15 8M12 5C12 4.40666 11.8241 3.82664 11.4944 3.33329C11.1648 2.83994 10.6962 2.45543 10.1481 2.22836C9.59987 2.0013 8.99667 1.94189 8.41473 2.05765C7.83279 2.1734 7.29824 2.45912 6.87868 2.87868C6.45912 3.29824 6.1734 3.83279 6.05765 4.41473C5.94189 4.99667 6.0013 5.59987 6.22836 6.14805C6.45543 6.69623 6.83994 7.16477 7.33329 7.49441C7.82664 7.82405 8.40666 8 9 8M12 5V6M15 8C15.5933 8 16.1734 8.17595 16.6667 8.50559C17.1601 8.83524 17.5446 9.30377 17.7716 9.85195C17.9987 10.4001 18.0581 11.0033 17.9424 11.5853C17.8266 12.1672 17.5409 12.7018 17.1213 13.1213C16.7018 13.5409 16.1672 13.8266 15.5853 13.9424C15.0033 14.0581 14.4001 13.9987 13.852 13.7716C13.3038 13.5446 12.8352 13.1601 12.5056 12.6667C12.1759 12.1734 12 11.5933 12 11M15 8H14M9 8C8.40666 8 7.82664 8.17595 7.33329 8.50559C6.83994 8.83524 6.45543 9.30377 6.22836 9.85195C6.0013 10.4001 5.94189 11.0033 6.05765 11.5853C6.1734 12.1672 6.45912 12.7018 6.87868 13.1213C7.29824 13.5409 7.83279 13.8266 8.41473 13.9424C8.99667 14.0581 9.59987 13.9987 10.1481 13.7716C10.6962 13.5446 11.1648 13.1601 11.4944 12.6667C11.8241 12.1734 12 11.5933 12 11M9 8H10M12 11V10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 10V22" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22C16.2 22 19 20.333 19 17C14.8 17 12 18.667 12 22Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22C7.8 22 5 20.333 5 17C9.2 17 12 18.667 12 22Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Consciência Negra',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 22V15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Natal',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5307 17.5H5.63475C5.27308 17.5 5.0035 17.341 4.826 17.023C4.6485 16.705 4.66358 16.3954 4.87125 16.0943L7.9425 11.5H7.704C7.34233 11.5 7.07375 11.3384 6.89825 11.0153C6.72258 10.6923 6.74175 10.3801 6.95575 10.0788L11.252 3.92501C11.3455 3.79818 11.4592 3.70201 11.5932 3.63651C11.7272 3.57118 11.8628 3.53851 12 3.53851C12.1372 3.53851 12.2727 3.57118 12.4067 3.63651C12.5407 3.70201 12.6545 3.79818 12.748 3.92501L17.0442 10.0788C17.2582 10.3801 17.2774 10.6923 17.1017 11.0153C16.9262 11.3384 16.6577 11.5 16.296 11.5H16.0575L19.1287 16.0943C19.3364 16.3954 19.3515 16.705 19.174 17.023C18.9965 17.341 18.7269 17.5 18.3652 17.5H13.4692V20.6345C13.4692 20.8795 13.3862 21.085 13.2202 21.251C13.0541 21.417 12.8486 21.5 12.6037 21.5H11.4347C11.1769 21.5 10.9618 21.4138 10.7895 21.2413C10.617 21.0689 10.5307 20.8538 10.5307 20.596V17.5ZM6.75 16H10.75H8.85H15.15H13.25H17.25H6.75ZM6.75 16H17.25L13.25 10H15.15L12 5.50001L8.85 10H10.75L6.75 16Z" fill="white"/></svg>',
    },
    {
      label: 'Ano Novo',
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.937 15.5C9.84772 15.1539 9.66734 14.8381 9.41462 14.5854C9.1619 14.3327 8.84607 14.1523 8.5 14.063L2.365 12.481C2.26033 12.4513 2.16821 12.3883 2.10261 12.3014C2.03702 12.2146 2.00153 12.1088 2.00153 12C2.00153 11.8912 2.03702 11.7854 2.10261 11.6986C2.16821 11.6118 2.26033 11.5487 2.365 11.519L8.5 9.93601C8.84595 9.84681 9.16169 9.66658 9.4144 9.41404C9.66711 9.16151 9.84757 8.84589 9.937 8.50001L11.519 2.36501C11.5484 2.25992 11.6114 2.16735 11.6983 2.1014C11.7853 2.03545 11.8914 1.99976 12.0005 1.99976C12.1096 1.99976 12.2157 2.03545 12.3027 2.1014C12.3896 2.16735 12.4526 2.25992 12.482 2.36501L14.063 8.50001C14.1523 8.84608 14.3327 9.1619 14.5854 9.41462C14.8381 9.66734 15.1539 9.84773 15.5 9.93701L21.635 11.518C21.7405 11.5471 21.8335 11.61 21.8998 11.6971C21.9661 11.7841 22.0021 11.8906 22.0021 12C22.0021 12.1094 21.9661 12.2159 21.8998 12.3029C21.8335 12.39 21.7405 12.4529 21.635 12.482L15.5 14.063C15.1539 14.1523 14.8381 14.3327 14.5854 14.5854C14.3327 14.8381 14.1523 15.1539 14.063 15.5L12.481 21.635C12.4516 21.7401 12.3886 21.8327 12.3017 21.8986C12.2147 21.9646 12.1086 22.0003 11.9995 22.0003C11.8904 22.0003 11.7843 21.9646 11.6973 21.8986C11.6104 21.8327 11.5474 21.7401 11.518 21.635L9.937 15.5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 3V7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 5H18" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17V19" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 18H3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
  ];

  function onExperienceTargetPage() {
    const currentUrl = globalThis.location.pathname || '';
    return currentUrl.includes(experienceTargetUrl);
  }

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel || !eventType) {
      console.log('[Tracking HolidaysBanner] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_HOLIDAYS_BANNER_' + eventType + ' ' + eventLabel;
    console.log('[Tracking HolidaysBanner] Analytics event triggered:', labelEvent);

    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = globalThis.location?.pathname || '';

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function initExperienceWhenReady() {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

    if (isReady) {
      experienceSetup();
    } else {
      document.addEventListener('DOMContentLoaded', experienceSetup);
    }
  }

  function isEligibleViewport() {
    return globalThis.innerWidth >= minViewportWidth;
  }

  function removeBannerIfExists() {
    const existingBanner = document.getElementById(bannerId);
    if (existingBanner) {
      existingBanner.remove();
    }
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function findHeaderElement() {
    return document.querySelector('header');
  }

  function getHolidayHash(label) {
    const hashMap = {
      Trabalho: 'trabalho',
      'Cospus Christi': 'corpus',
      Independência: 'independencia',
      'N. Sra. Aparecida': 'criancas',
      Finados: 'novembro',
      'Consciência Negra': 'novembro',
      Natal: 'decembro',
      'Ano Novo': 'decembro',
    };

    return hashMap[label] || '';
  }

  function getOrCreateBanner() {
    let banner = document.getElementById(bannerId);

    if (!banner) {
      banner = document.createElement('div');
      banner.id = bannerId;
      banner.className = 'at-holidays-modal-banner';
      banner.setAttribute('aria-label', 'Faixa promocional holidays banner');
    }

    ensureHolidayLinks(banner);

    return banner;
  }

  function ensureHolidayLinks(banner) {
    if (!banner) {
      return;
    }

    if (banner.dataset.linksBuilt === 'true') {
      return;
    }

    const linksWrapper = document.createElement('div');
    linksWrapper.className = 'at-holidays-modal-links-wrapper';

    holidayItems.forEach(function (item) {
      const linkElement = document.createElement('a');
      linkElement.className = 'at-holidays-modal-link';
      const holidayHash = getHolidayHash(item.label);
      linkElement.href = holidayHash ? holidaysBaseUrl + '#' + holidayHash : holidaysBaseUrl;
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';
      linkElement.dataset.analyticsLabel = item.label;

      const iconWrapper = document.createElement('span');
      iconWrapper.className = 'at-holidays-modal-icon';
      iconWrapper.insertAdjacentHTML('beforeend', item.svg);

      const textWrapper = document.createElement('span');
      textWrapper.textContent = item.label;

      linkElement.textContent = '';
      linkElement.appendChild(iconWrapper);
      linkElement.appendChild(textWrapper);

      if (linkElement.dataset.analyticsAdded !== 'true') {
        linkElement.addEventListener('click', function () {
          analyticsEvent(item.label, 'click');
        });
        linkElement.dataset.analyticsAdded = 'true';
      }

      linksWrapper.appendChild(linkElement);
    });

    banner.appendChild(linksWrapper);
    banner.dataset.linksBuilt = 'true';
  }

  function injectCSS() {
    if (document.getElementById(stylesId)) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = stylesId;
    styles.innerHTML = `
			.at-holidays-modal-banner {
				background: linear-gradient(63deg, rgb(0, 19, 32) 0%, rgb(0, 29, 70) 50%, rgb(1, 43, 105) 100%) !important;
				border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
				height: 110px !important;
				width: 100% !important;
				display: flex !important;
				align-items: center !important;
				justify-content: center !important;
				cursor: pointer !important;
				overflow-x: auto !important;
				padding: 0 16px !important;
				white-space: nowrap !important;
				-webkit-overflow-scrolling: touch !important;
			}

			.at-holidays-modal-links-wrapper {
				display: inline-flex !important;
				flex-direction: row !important;
				align-items: center !important;
				justify-content: flex-start !important;
				gap: 18px !important;
				width: max-content !important;
			}

			.at-holidays-modal-link {
				color: #ffffff !important;
				text-decoration: none !important;
				font-family: Inter, sans-serif !important;
				font-size: 14px !important;
				font-weight: 400 !important;
				display: inline-flex !important;
				flex-direction: column !important;
				gap: 8px !important;
				justify-content: center !important;
				line-height: 1 !important;
				align-items: center !important;
				text-align: center !important;
				min-width: 90px !important;
				padding: 4px 0 !important;
			}

			.at-holidays-modal-icon {
				display: inline-flex !important;
				align-items: center !important;
				justify-content: center !important;
			}

			@media (max-width: 767px) {
				.at-holidays-modal-banner {
					height: auto !important;
					padding: 12px 16px !important;
					justify-content: flex-start !important;
				}

				.at-holidays-modal-links-wrapper {
					justify-content: flex-start !important;
				}
			}
		`;

    document.head.appendChild(styles);
  }

  function insertBannerBelowHeader() {
    const headerElement = findHeaderElement();

    if (!headerElement?.parentNode) {
      return false;
    }

    const banner = getOrCreateBanner();

    const expectedPreviousSibling = banner.previousElementSibling;
    const isAlreadyBelowHeader = expectedPreviousSibling === headerElement;

    if (!isAlreadyBelowHeader) {
      headerElement.parentNode.insertBefore(banner, headerElement.nextSibling);
      console.log('[AT] Holidays banner inserted below header.');
      analyticsEvent('banner', 'view');
      return true;
    }

    return false;
  }

  function customizeBanner() {
    if (!isEligibleViewport()) {
      removeBannerIfExists();
      return;
    }

    if (!onExperienceTargetPage()) {
      return;
    }

    const inserted = insertBannerBelowHeader();
    if (inserted) {
      stopObserver();
    }
  }

  function setupObserver() {
    if (observer || !document.body) {
      return;
    }

    observer = new MutationObserver(bodyObserverCallback);

    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });

    console.log('[AT] MutationObserver configured.');
  }

  function bodyObserverCallback(mutations) {
    let hasRelevantMutation = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        hasRelevantMutation = true;
        break;
      }
    }

    if (!hasRelevantMutation) {
      return;
    }

    if (!onExperienceTargetPage()) {
      stopObserver();
      console.log('[AT] User left the target page, observer disconnected.');
      return;
    }

    customizeBanner();
  }

  function experienceSetup() {
    console.log('[AT] Experience started:', experienceName);

    if (!onExperienceTargetPage()) {
      console.log('[AT] Page is not a correct page, experience will not run.');
      return;
    }

    if (!isEligibleViewport()) {
      removeBannerIfExists();
      console.log('[AT] Viewport below 768px, experience will not run.');
      return;
    }

    injectCSS();
    setupObserver();
    customizeBanner();
  }

  if (experienceAlreadyExecuted || !onExperienceTargetPage()) {
    console.log('[AT] Page is not a correct page OR script already executed.');
    return;
  }

  globalThis[experienceName] = true;
  initExperienceWhenReady();
})();
