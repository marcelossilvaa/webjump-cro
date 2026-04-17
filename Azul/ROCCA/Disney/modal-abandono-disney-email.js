(function () {
	'use strict';

	const SCRIPT_KEY = 'disneyAbandonmentEmailModalInjected';
	const STYLE_ID = 'disney-abandonment-email-modal-style';
	const MODAL_ID = 'disney-abandonment-email-modal';
	const LOGO_LISTENER_FLAG = 'data-disney-email-modal-logo-listener';
	const MAX_RETRIES = 20;
	const RETRY_INTERVAL_MS = 500;
	const STORAGE_KEY = 'at_disney_abandonment_email_modal_state';
	const OVERLAY_OPACITY = 'rgba(0, 0, 0, 0.62)';
	const TARGET_PATH = '/home/br/pt/home';
	const LOGO_SELECTORS = [
		'a.azul-logo',
		'a[href="/home/br/pt/home"]',
		'a[href*="/home/br/pt/home"]',
		'a[title*="Azul"]',
		'a[aria-label*="Azul"]',
		'header a[href="/"]',
		'header a[href*="voeazul.com.br"]'
	];
	const CTA_URL = 'https://www.voeazul.com.br/br/pt/disney/promocoes-disney';
	const ASSET_BG = 'fundo disney.png';
	const ASSET_GLOW = 'Group 11785.png';
	const ASSET_SHINE_1 = 'BRILHO copy';
	const ASSET_SHINE_2 = 'BRILHO copy 2';
	const ASSET_HERO = '0228ZM_0270SD_R2_xak (1)';
	const ASSET_HERO_URL = 'https://i.imgur.com/wVOIihy.png';

	let retryCount = 0;
	let retryTimer = null;
	let isProcessing = false;
	let observer = null;
	let observerDebounce = null;
	let exitIntentBound = false;

	function init() {
		if (window[SCRIPT_KEY]) {
			return;
		}

		if (!isTargetPage()) {
			return;
		}

		window[SCRIPT_KEY] = true;
		injectStyles();
		bindExitIntent();
		bindLogoClickWithRetry();
		observeDomForDynamicLogo();
		analyticsEvent('modal_ready', 'AT_disney_email_abandono');
	}

	function isTargetPage() {
		const isAzulDomain = window.location.hostname.indexOf('voeazul.com.br') >= 0;
		const isHomePath = window.location.pathname.toLowerCase().indexOf(TARGET_PATH) === 0;
		return isAzulDomain && isHomePath;
	}

	function bindExitIntent() {
		if (exitIntentBound) {
			return;
		}

		document.addEventListener('mouseout', function (event) {
			if (event.relatedTarget || event.toElement) {
				return;
			}

			if (event.clientY > 8) {
				return;
			}

			openModal('exit_intent', null);
		});

		exitIntentBound = true;
	}

	function bindLogoClickWithRetry() {
		bindLogoClick();

		if (retryTimer) {
			clearInterval(retryTimer);
			retryTimer = null;
		}

		retryTimer = setInterval(function () {
			retryCount = retryCount + 1;
			bindLogoClick();

			if (retryCount >= MAX_RETRIES) {
				clearInterval(retryTimer);
				retryTimer = null;
			}
		}, RETRY_INTERVAL_MS);
	}

	function bindLogoClick() {
		const logos = getLogoElements();
		if (!logos.length) {
			return;
		}

		logos.forEach(function (logo) {
			if (logo.getAttribute(LOGO_LISTENER_FLAG) === 'true') {
				return;
			}

			logo.setAttribute(LOGO_LISTENER_FLAG, 'true');
			logo.addEventListener('click', function (event) {
				if (event._disneyAbandonmentModalConfirmed) {
					return;
				}

				event.preventDefault();
				const leaveUrl = logo.getAttribute('href') || '/';
				const opened = openModal('logo_click', leaveUrl);
				if (!opened) {
					redirectTo(leaveUrl);
				}
			});
		});
	}

	function getLogoElements() {
		let elements = [];

		LOGO_SELECTORS.forEach(function (selector) {
			const selected = document.querySelectorAll(selector);
			if (!selected || !selected.length) {
				return;
			}

			elements = elements.concat(Array.prototype.slice.call(selected));
		});

		return uniqueElements(elements);
	}

	function uniqueElements(list) {
		const map = new Map();
		list.forEach(function (el) {
			map.set(el, true);
		});

		return Array.from(map.keys());
	}

	function observeDomForDynamicLogo() {
		if (observer) {
			return;
		}

		observer = new MutationObserver(function () {
			if (isProcessing) {
				return;
			}

			if (observerDebounce) {
				clearTimeout(observerDebounce);
			}

			observerDebounce = setTimeout(function () {
				isProcessing = true;
				bindLogoClick();
				isProcessing = false;
			}, 120);
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}

	function openModal(triggerType, leaveUrl) {
		if (document.getElementById(MODAL_ID)) {
			return false;
		}

		if (wasShownInSession()) {
			return false;
		}

		const overlay = buildModalNode(triggerType, leaveUrl);
		document.body.appendChild(overlay);
		markShownInSession(triggerType);
		analyticsEvent('modal_view ' + triggerType, 'AT_disney_email_abandono_modal');
		return true;
	}

	function buildModalNode(triggerType, leaveUrl) {
		const overlay = document.createElement('div');
		overlay.id = MODAL_ID;
		overlay.className = 'disneyAbandonmentModal';
		overlay.innerHTML = buildModalMarkup();

		const closeButton = overlay.querySelector('.disneyAbandonmentModal__close');
		const continueButton = overlay.querySelector('.disneyAbandonmentModal__ctaSecondary');
		const primaryButton = overlay.querySelector('.disneyAbandonmentModal__ctaPrimary');
		const couponWrap = overlay.querySelector('.disneyAbandonmentModal__couponWrap');
		const couponCode = overlay.querySelector('.disneyAbandonmentModal__coupon');
		const copyFeedback = overlay.querySelector('.disneyAbandonmentModal__copyFeedback');
		let hasCopiedCoupon = false;

		if (closeButton) {
			closeButton.addEventListener('click', function () {
				analyticsEvent('modal_click fechar', 'AT_disney_email_abandono_modal');
				removeModal();
				if (triggerType === 'logo_click') {
					redirectTo(leaveUrl || '/');
				}
			});
		}

		if (continueButton) {
			continueButton.addEventListener('click', function () {
				analyticsEvent('modal_click continuar', 'AT_disney_email_abandono_modal');
				removeModal();
			});
		}

		if (primaryButton) {
			primaryButton.addEventListener('click', function () {
				analyticsEvent('modal_click quero_oferta', 'AT_disney_email_abandono_modal');
				window.location.href = CTA_URL;
			});
		}

		if (couponWrap && couponCode) {
			couponWrap.addEventListener('mouseenter', function () {
				tryCopyCoupon('hover');
			});

			couponWrap.addEventListener('click', function () {
				tryCopyCoupon('click');
			});
		}

		function tryCopyCoupon(triggerName) {
			if (hasCopiedCoupon) {
				return;
			}

			const couponText = (couponCode.textContent || '').trim();
			if (!couponText) {
				return;
			}

			copyToClipboard(couponText, function (success) {
				if (!success) {
					return;
				}

				hasCopiedCoupon = true;
				analyticsEvent('modal_click cupom_copiado_' + triggerName, 'AT_disney_email_abandono_modal');
				showCopyFeedback(copyFeedback);
				pulsePrimaryButton(primaryButton);
			});
		}

		overlay.addEventListener('click', function (event) {
			if (event.target !== overlay) {
				return;
			}

			analyticsEvent('modal_click fundo', 'AT_disney_email_abandono_modal');
			removeModal();
		});

		return overlay;
	}

	function copyToClipboard(text, callback) {
		if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
			navigator.clipboard.writeText(text).then(function () {
				callback(true);
			}).catch(function () {
				fallbackCopy(text, callback);
			});
			return;
		}

		fallbackCopy(text, callback);
	}

	function fallbackCopy(text, callback) {
		const input = document.createElement('textarea');
		input.value = text;
		input.setAttribute('readonly', 'readonly');
		input.style.position = 'absolute';
		input.style.left = '-9999px';
		document.body.appendChild(input);
		input.select();

		let copied = false;
		try {
			copied = document.execCommand('copy');
		} catch (error) {
			copied = false;
		}

		input.remove();
		callback(copied);
	}

	function showCopyFeedback(feedbackElement) {
		if (!feedbackElement) {
			return;
		}

		feedbackElement.textContent = 'Cód. Copiado!';
		feedbackElement.classList.add('is-visible');

		setTimeout(function () {
			feedbackElement.classList.remove('is-visible');
		}, 2200);
	}

	function pulsePrimaryButton(buttonElement) {
		if (!buttonElement) {
			return;
		}

		buttonElement.classList.remove('is-pulsing');
		void buttonElement.offsetWidth;
		buttonElement.classList.add('is-pulsing');
	}

	function buildModalMarkup() {
		const parts = [];
		parts.push('<div class="disneyAbandonmentModal__card">');
		parts.push('<button type="button" class="disneyAbandonmentModal__close" aria-label="Fechar modal">x</button>');
		parts.push('<div class="disneyAbandonmentModal__bgGradient"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgStars"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgLayer disneyAbandonmentModal__bgLayer--g1"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgLayer disneyAbandonmentModal__bgLayer--g2"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgLayer disneyAbandonmentModal__bgLayer--g3"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgBlur"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgStar"></div>');
		parts.push('<div class="disneyAbandonmentModal__brandRow">');
		parts.push('<span class="disneyAbandonmentModal__brand">Azul Viagens</span>');
		parts.push('<span class="disneyAbandonmentModal__divider"></span>');
		parts.push('<img class="disneyAbandonmentModal__brandLogo" src="https://i.imgur.com/1CwQhAX.png" alt="Disney" />');
		parts.push('</div>');
		parts.push('<h3 class="disneyAbandonmentModal__title">Nao Saia ainda! <br><span class="disneyAbandonmentModal__titleSub">Seu sonho Disney <br class="disneyAbandonmentModal__br--desktop">pode <br class="disneyAbandonmentModal__br--mobile">ficar ainda <br class="disneyAbandonmentModal__br--desktop">melhor</span></h3>');
		parts.push('<p class="disneyAbandonmentModal__description">Conheca <br class="disneyAbandonmentModal__br--desktop">nossas ofertas <br class="disneyAbandonmentModal__br--desktop">e aproveite!</p>');
		parts.push('<div class="disneyAbandonmentModal__offerCard">');
		parts.push('<img class="disneyAbandonmentModal__offerBadge" src="https://i.imgur.com/vrNMXpn.png" alt="" />');
		parts.push('<p class="disneyAbandonmentModal__offerTitle">Pacotes <span class="disneyAbandonmentModal__offerKicker">(aereo + hotel) com</span></p>');
		parts.push('<div class="disneyAbandonmentModal__offerValue">');
		parts.push('<span class="disneyAbandonmentModal__offerNumber">20</span>');
		parts.push('<div class="disneyAbandonmentModal__offerRight">');
		parts.push('<span class="disneyAbandonmentModal__offerPercent">%</span>');
		parts.push('<span class="disneyAbandonmentModal__offerOff">OFF</span>');
		parts.push('</div>');
		parts.push('</div>');
		parts.push('</div>');
		parts.push('<div class="disneyAbandonmentModal__couponWrap">');
		parts.push('<span class="disneyAbandonmentModal__couponIcon"></span>');
		parts.push('<strong class="disneyAbandonmentModal__coupon">HOTELENCANTADO20</strong>');
		parts.push('</div>');
		parts.push('<span class="disneyAbandonmentModal__copyFeedback" aria-live="polite"></span>');
		parts.push('<button type="button" class="disneyAbandonmentModal__ctaPrimary">Eu quero</button>');
		parts.push('<button type="button" class="disneyAbandonmentModal__ctaSecondary">Continuar navegando</button>');
		parts.push('<span class="disneyAbandonmentModal__legal">*Consulte condicoes.</span>');
		parts.push('<div class="disneyAbandonmentModal__heroMask">');
		parts.push('<div class="disneyAbandonmentModal__heroImage"></div>');
		parts.push('<span class="disneyAbandonmentModal__copyright">© 2026 Disney</span>');
		parts.push('</div>');
		parts.push('<div class="disneyAbandonmentModal__heroDot"></div>');
		parts.push('</div>');
		return parts.join('');
	}

	function removeModal() {
		const modal = document.getElementById(MODAL_ID);
		if (modal) {
			modal.remove();
		}
	}

	function redirectTo(url) {
		if (!url) {
			return;
		}

		window.location.href = url;
	}

	function wasShownInSession() {
		try {
			const state = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
			return !!state.shown;
		} catch (error) {
			return false;
		}
	}

	function markShownInSession(triggerType) {
		try {
			const state = { shown: true, trigger: triggerType, timestamp: new Date().getTime() };
			window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.log('[Modal Disney] Falha ao persistir estado.');
		}
	}

	function analyticsEvent(eventLabel, eventContext) {
		if (!eventLabel) {
			return;
		}

		const labelEvent = 'AT_disney_abandono_email ' + eventLabel;
		console.log('[Modal Disney] Evento de analytics disparado:', labelEvent);

		(function () {
			const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
			if (!s || typeof s.tl !== 'function') {
				return;
			}

			s.linkTrackVars = 'events,eVar82,eVar84';
			s.linkTrackEvents = 'event90';
			s.events = 'event90';
			s.eVar82 = labelEvent;
			s.eVar84 = eventContext || 'AT_disney_email_abandono';
			s.tl(true, 'o', 'target_activity_action');
		})();
	}

	function injectStyles() {
		if (document.getElementById(STYLE_ID)) {
			return;
		}

		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.type = 'text/css';
		style.appendChild(document.createTextNode(getModalCss()));
		document.head.appendChild(style);
	}

	function getModalCss() {
		return [
			'.disneyAbandonmentModal { position: fixed; inset: 0; background: ' + OVERLAY_OPACITY + '; z-index: 99999; display: flex; justify-content: center; align-items: center; padding: 16px; box-sizing: border-box; }',
			'.disneyAbandonmentModal__card { position: relative; width: 720px; height: 467px; max-width: 100%; border-radius: 20px; overflow: hidden; background: url("' + ASSET_BG + '"), #0150B5; background-size: cover; background-position: center; box-shadow: 0 16px 48px rgba(0,0,0,0.36); }',
			'.disneyAbandonmentModal__close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 999px; border: none; background: rgba(255,255,255,0.15); color: #FFFFFF; font-size: 20px; line-height: 32px; text-align: center; cursor: pointer; z-index: 10; }',
			'.disneyAbandonmentModal__bgGradient { position: absolute; inset: 0; background: linear-gradient(61.4deg, #124C86 16.38%, rgba(12,69,129,0) 82.26%); pointer-events: none; z-index: 1; }',
			'.disneyAbandonmentModal__bgStars { position: absolute; inset: 0; opacity: 0.5; pointer-events: none; z-index: 1; overflow: hidden; }',
			'.disneyAbandonmentModal__bgStars::before { content: ""; position: absolute; left: 0; top: 0; width: 1px; height: 1px; background: transparent; box-shadow: 105px 222px 0 0.5px rgba(255,255,255,0.46), 174px 136px 0 0.5px rgba(255,255,255,0.25), 527px 299px 0 0.5px rgba(255,255,255,0.37), 278px 222px 0 0.5px rgba(255,255,255,0.29), 576px 90px 0 0.5px rgba(255,255,255,0.32), 295px 333px 0 0.5px rgba(255,255,255,0.21), 350px 91px 0 0.5px rgba(255,255,255,0.31), 510px 15px 0 0.5px rgba(255,255,255,0.48), 30px 323px 0 0.5px rgba(255,255,255,0.36), 176px 413px 0 0.5px rgba(255,255,255,0.34), 507px 135px 0 0.5px rgba(255,255,255,0.42), 61px 57px 0 0.5px rgba(255,255,255,0.48), 147px 275px 0 0.5px rgba(255,255,255,0.34), 294px 199px 0 0.5px rgba(255,255,255,0.38), 333px 249px 0 0.5px rgba(255,255,255,0.29), 329px 374px 0 0.5px rgba(255,255,255,0.33), 106px 284px 0 0.5px rgba(255,255,255,0.45), 109px 119px 0 0.5px rgba(255,255,255,0.44), 391px 363px 0 0.5px rgba(255,255,255,0.36), 221px 132px 0 0.5px rgba(255,255,255,0.49), 358px 140px 0 0.5px rgba(255,255,255,0.25), 517px 97px 0 0.5px rgba(255,255,255,0.37), 138px 32px 0 0.5px rgba(255,255,255,0.50), 400px 346px 0 0.5px rgba(255,255,255,0.25), 56px 229px 0 0.5px rgba(255,255,255,0.48), 30px 78px 0 0.5px rgba(255,255,255,0.49), 494px 326px 0 0.5px rgba(255,255,255,0.34), 691px 97px 0 0.5px rgba(255,255,255,0.24), 273px 354px 0 0.5px rgba(255,255,255,0.26), 546px 308px 0 0.5px rgba(255,255,255,0.35), 610px 176px 0 0.5px rgba(255,255,255,0.43), 599px 259px 0 0.5px rgba(255,255,255,0.32), 604px 452px 0 0.5px rgba(255,255,255,0.35), 350px 460px 0 0.5px rgba(255,255,255,0.30), 122px 20px 2px 3px rgba(255,255,255,0.15), 122px 20px 0 1px rgba(255,255,255,0.9), 262px 30px 2px 3px rgba(255,255,255,0.14), 262px 30px 0 1px rgba(255,255,255,0.85), 463px 41px 2px 3px rgba(255,255,255,0.12), 463px 41px 0 1px rgba(255,255,255,0.75), 543px 16px 2px 3px rgba(255,255,255,0.12), 543px 16px 0 1px rgba(255,255,255,0.7), 623px 26px 2px 3px rgba(255,255,255,0.14), 623px 26px 0 1px rgba(255,255,255,0.8), 33px 111px 2px 3px rgba(255,255,255,0.12), 33px 111px 0 1px rgba(255,255,255,0.75), 104px 132px 2px 3px rgba(255,255,255,0.10), 104px 132px 0 1px rgba(255,255,255,0.65), 504px 122px 2px 3px rgba(255,255,255,0.12), 504px 122px 0 1px rgba(255,255,255,0.7), 573px 141px 2px 3px rgba(255,255,255,0.14), 573px 141px 0 1px rgba(255,255,255,0.8), 654px 112px 2px 3px rgba(255,255,255,0.10), 654px 112px 0 1px rgba(255,255,255,0.6); }',
			'.disneyAbandonmentModal__bgStars::after { content: ""; position: absolute; inset: 0; background: radial-gradient(40% 45% at 20% 35%, rgba(75,0,130,0.15) 0%, rgba(138,43,226,0.08) 40%, rgba(72,61,139,0.04) 70%, transparent 100%), radial-gradient(35% 40% at 75% 55%, rgba(25,25,112,0.12) 0%, rgba(65,105,225,0.06) 50%, transparent 100%); opacity: 0.6; }',
			'.disneyAbandonmentModal__bgLayer { position: absolute; background-image: url("' + ASSET_GLOW + '"); background-repeat: no-repeat; background-size: contain; mix-blend-mode: plus-lighter; pointer-events: none; z-index: 1; }',
			'.disneyAbandonmentModal__bgLayer--g1 { width: 548px; height: 548px; left: -136px; top: -180px; transform: rotate(164.96deg); opacity: 0.2; }',
			'.disneyAbandonmentModal__bgLayer--g2 { width: 548px; height: 548px; left: -195px; top: -96px; transform: rotate(45deg); opacity: 0.2; }',
			'.disneyAbandonmentModal__bgLayer--g3 { width: 449px; height: 98px; left: -63px; top: 294px; background-image: none; background: linear-gradient(90deg, #043871 0%, rgba(12,69,129,0) 70.09%); mix-blend-mode: normal; opacity: 0.5; border-radius: 100px; }',
			'.disneyAbandonmentModal__bgBlur { position: absolute; width: 188px; height: 163px; left: 443px; top: 301px; background: #1158A3; filter: blur(40px); pointer-events: none; z-index: 2; }',
			'.disneyAbandonmentModal__bgStar { position: absolute; left: 409px; top: 35px; width: 34px; height: 34px; opacity: 0.95; transform: rotate(-17deg); pointer-events: none; z-index: 3; display: none; }',
			'.disneyAbandonmentModal__bgStar::before { content: ""; position: absolute; inset: -2px; background: linear-gradient(135deg, #FFD700 0%, #FFFACD 50%, #FFD700 100%); border: 0.5px solid rgba(255,255,255,0.8); border-radius: 50%; filter: blur(5px); }',
			'.disneyAbandonmentModal__bgStar::after { content: ""; position: absolute; left: 25%; top: 25%; width: 50%; height: 50%; background: radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(232,244,255,0.6) 50%, rgba(168,200,232,0.2) 100%); border-radius: 50%; opacity: 0.3; }',
			'.disneyAbandonmentModal__brandRow { position: absolute; left: 58px; top: 45px; display: flex; align-items: center; gap: 12px; z-index: 5; }',
			'.disneyAbandonmentModal__brand { color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }',
			'.disneyAbandonmentModal__divider { width: 1px; height: 26px; background: #FFFFFF; opacity: 0.75; }',
			'.disneyAbandonmentModal__brandLogo { height: 20px; width: auto; display: block; }',
			'.disneyAbandonmentModal__title { position: absolute; left: 58px; top: 93px; width: 298px; margin: 0; color: #F0DE00; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 36px; line-height: 42px; letter-spacing: -0.025em; font-weight: 700; z-index: 5; }',
			'.disneyAbandonmentModal__titleSub { color: #FFFFFF; }',
			'.disneyAbandonmentModal__br--mobile { display: none; }',
			'.disneyAbandonmentModal__description { position: absolute; left: 58px; top: 308px; width: 150px; margin: 0; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 18px; line-height: 120%; letter-spacing: -0.02em; font-weight: 400; z-index: 5; }',
			'.disneyAbandonmentModal__offerCard { position: absolute; left: 376px; top: 86px; width: 274px; height: 195px; border: 1px solid #FFFFFF; border-radius: 20px; box-sizing: border-box; overflow: hidden; z-index: 5; }',
			'.disneyAbandonmentModal__offerCard::before { content: ""; position: absolute; inset: 0; background-image: url("' + ASSET_SHINE_1 + '"); background-repeat: no-repeat; background-size: 140px auto; background-position: 108% -10%; mix-blend-mode: screen; opacity: 0.55; pointer-events: none; }',
			'.disneyAbandonmentModal__offerCard::after { content: ""; position: absolute; width: 160px; height: 105px; right: -8px; top: 8px; background-image: url("' + ASSET_SHINE_2 + '"); background-repeat: no-repeat; background-size: contain; mix-blend-mode: screen; opacity: 0.7; pointer-events: none; }',
			'.disneyAbandonmentModal__offerTitle { position: absolute; left: 24px; top: 20px; margin: 0; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 24px; line-height: 28px; font-weight: 700; z-index: 2; }',
			'.disneyAbandonmentModal__offerKicker { display: block; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 20px; font-weight: 300; }',
			'.disneyAbandonmentModal__offerBadge { position: absolute; right: 8px; top: 8px; width: 75px; height: auto; z-index: 3; pointer-events: none; }',
			'.disneyAbandonmentModal__offerValue { position: absolute; left: 14px; top: 66px; display: flex; align-items: flex-start; gap: 2px; z-index: 2; }',
			'.disneyAbandonmentModal__offerNumber { color: #F0DE00; font-family: Helvetica, Arial, sans-serif; font-size: 128px; line-height: 94px; font-weight: 700; margin-top: 10px; }',
			'.disneyAbandonmentModal__offerRight { display: flex; flex-direction: column; align-items: flex-start; padding-top: 6px; }',
			'.disneyAbandonmentModal__offerPercent { color: #F0DE00; font-family: Helvetica, Arial, sans-serif; font-size: 65px; line-height: 78px; font-weight: 700; }',
			'.disneyAbandonmentModal__offerOff { color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 42px; line-height: 48px; font-weight: 700; letter-spacing: -0.05em; }',
			'.disneyAbandonmentModal__couponWrap { position: absolute; left: 404px; top: 288px; width: 261px; height: 43px; background: #004F8B; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: copy; z-index: 5; }',
			'.disneyAbandonmentModal__couponWrap:hover { box-shadow: 0 0 0 2px rgba(240,222,0,0.32) inset; }',
			'.disneyAbandonmentModal__couponIcon { display: inline-block; width: 16px; height: 18px; position: relative; flex-shrink: 0; }',
			'.disneyAbandonmentModal__couponIcon::before { content: ""; position: absolute; width: 11px; height: 13px; left: 0; top: 5px; background: #FFFFFF; border-radius: 1.5px; box-shadow: 0 2px 2px rgba(0,0,0,0.1); }',
			'.disneyAbandonmentModal__couponIcon::after { content: ""; position: absolute; width: 11px; height: 13px; left: 5px; top: 0; border: 1.3px solid rgba(255,255,255,0.6); border-radius: 1.5px; box-sizing: border-box; }',
			'.disneyAbandonmentModal__coupon { color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 18px; line-height: 120%; font-weight: 400; letter-spacing: 0.04em; }',
			'.disneyAbandonmentModal__copyFeedback { position: absolute; left: 404px; top: 335px; min-height: 16px; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 12px; line-height: 120%; font-weight: 700; opacity: 0; transform: translateY(4px); transition: opacity 0.2s ease, transform 0.2s ease; z-index: 5; }',
			'.disneyAbandonmentModal__copyFeedback.is-visible { opacity: 1; transform: translateY(0); }',
			'.disneyAbandonmentModal__ctaPrimary { position: absolute; left: 404px; top: 348px; width: 246px; height: 38px; border: none; border-radius: 27px; background: #F0DE00; color: #0B437C; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 38px; font-weight: 700; cursor: pointer; z-index: 5; display: flex; align-items: center; justify-content: center; }',
			'.disneyAbandonmentModal__ctaPrimary.is-pulsing { animation: disney-modal-cta-pulse 0.4s ease-in-out 4; }',
			'.disneyAbandonmentModal__ctaSecondary { position: absolute; left: 448px; top: 400px; width: auto; height: auto; min-height: auto; border: none; border-radius: 0; background: transparent; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 16px; font-weight: 500; cursor: pointer; padding: 0; z-index: 5; }',
			'.disneyAbandonmentModal__ctaSecondary:hover { text-decoration: underline; }',
			'.disneyAbandonmentModal__legal { position: absolute; left: 656px; top: 150px; width: 96px; height: 12px; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 10px; line-height: 120%; opacity: 0.9; transform: rotate(-90deg); z-index: 5; }',
			'.disneyAbandonmentModal__heroMask { position: absolute; left: 194px; top: 221px; width: 198px; height: 198px; border-radius: 50%; overflow: hidden; z-index: 4; background: rgba(217,217,217,0.18); box-shadow: 0 0 0 6px rgba(255,255,255,0.08); pointer-events: none; }',
			'.disneyAbandonmentModal__heroImage { position: absolute; width: 321px; height: 206px; left: -55px; top: -4px; background-image: linear-gradient(179.61deg, rgba(0,0,0,0) 86.46%, rgba(0,0,0,0.6) 99.66%), url("' + ASSET_HERO_URL + '"); background-size: cover; background-position: center; }',
			'.disneyAbandonmentModal__copyright { position: absolute; left: 76px; top: 182px; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 7px; line-height: 7px; font-weight: 700; text-align: center; }',
			'.disneyAbandonmentModal__heroDot { position: absolute; left: 242px; top: 318px; width: 58px; height: 90px; background: #F0DE00; border-radius: 50%; pointer-events: none; z-index: 3; }',
			'@keyframes disney-modal-cta-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }',
			'@media screen and (max-width: 768px) {',
			'  .disneyAbandonmentModal { padding: 8px; }',
			'  .disneyAbandonmentModal__card { width: 360px; height: 532px; max-width: 100%; }',
			'  .disneyAbandonmentModal__bgGradient { display: none; }',
			'  .disneyAbandonmentModal__bgLayer--g1 { width: 274px; height: 274px; left: -195px; top: -96px; transform: rotate(164.96deg); opacity: 0.2; }',
			'  .disneyAbandonmentModal__bgLayer--g2 { width: 274px; height: 274px; left: 46%; top: -566px; transform: rotate(45deg); opacity: 0.1; }',
			'  .disneyAbandonmentModal__bgLayer--g3 { display: none; }',
			'  .disneyAbandonmentModal__bgBlur { width: 200px; height: 200px; left: 58%; top: 53%; filter: blur(48px); }',
			'  .disneyAbandonmentModal__bgStar { display: none; }',
			'  .disneyAbandonmentModal__brandRow { left: 20px; top: 20px; }',
			'  .disneyAbandonmentModal__title { left: 20px; top: 52px; width: 285px; font-size: 26px; line-height: 30px; }',
			'  .disneyAbandonmentModal__br--desktop { display: none; }',
			'  .disneyAbandonmentModal__br--mobile { display: inline; }',
			'  .disneyAbandonmentModal__description { position: absolute; left: 20px; top: 164px; width: 294px; transform: none; text-align: left; font-size: 18px; }',
			'  .disneyAbandonmentModal__offerCard { left: 20px; top: 204px; width: 319px; height: 196px; border-radius: 20px; }',
			'  .disneyAbandonmentModal__offerTitle { left: 20px; top: 16px; font-size: 22px; line-height: 26px; }',
			'  .disneyAbandonmentModal__offerKicker { font-size: 19px; line-height: 120%; }',
			'  .disneyAbandonmentModal__offerValue { left: 35px; top: 42px; }',
			'  .disneyAbandonmentModal__offerNumber { font-size: 128px; line-height: 154px; margin-top: 0; }',
			'  .disneyAbandonmentModal__offerPercent { font-size: 65px; line-height: 78px; }',
			'  .disneyAbandonmentModal__offerOff { font-size: 42px; line-height: 51px; }',
			'  .disneyAbandonmentModal__couponWrap { left: 43px; top: 379px; width: 273px; height: 43px; }',
			'  .disneyAbandonmentModal__copyFeedback { left: 43px; top: 426px; }',
			'  .disneyAbandonmentModal__ctaPrimary { left: 50%; top: 438px; width: 319px; height: 40px; transform: translateX(-50%); font-size: 16px; line-height: 40px; border-radius: 26px; }',
			'  .disneyAbandonmentModal__ctaPrimary.is-pulsing { animation: disney-modal-cta-pulse 0.4s ease-in-out 4; }',
			'  .disneyAbandonmentModal__ctaSecondary { left: 50%; top: 494px; transform: translateX(-50%); font-size: 16px; line-height: 16px; white-space: nowrap; }',
			'  .disneyAbandonmentModal__legal { left: 24px; right: auto; top: 375px; transform: rotate(-90deg); transform-origin: top left; }',
			'  .disneyAbandonmentModal__heroMask { display: none; }',
			'  .disneyAbandonmentModal__heroDot { display: none; }',
			'}'
		].join('\n');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
