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
		parts.push('<div class="disneyAbandonmentModal__bgLayer disneyAbandonmentModal__bgLayer--g1"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgLayer disneyAbandonmentModal__bgLayer--g2"></div>');
		parts.push('<div class="disneyAbandonmentModal__bgLayer disneyAbandonmentModal__bgLayer--g3"></div>');
		parts.push('<div class="disneyAbandonmentModal__frame">');
		parts.push('<div class="disneyAbandonmentModal__brandRow">');
		parts.push('<span class="disneyAbandonmentModal__brand">Azul Viagens</span>');
		parts.push('<span class="disneyAbandonmentModal__divider"></span>');
		parts.push('<span class="disneyAbandonmentModal__brand">Disney</span>');
		parts.push('</div>');
		parts.push('<h3 class="disneyAbandonmentModal__title">Seu sonho Disney pode ficar ainda melhor</h3>');
		parts.push('<div class="disneyAbandonmentModal__tag">Conheça nossas ofertas e aproveite</div>');
		parts.push('<div class="disneyAbandonmentModal__offerCard">');
		parts.push('<p class="disneyAbandonmentModal__offerKicker">Pacotes (aereo + hotel) com</p>');
		parts.push('<div class="disneyAbandonmentModal__offerValue"><span class="disneyAbandonmentModal__offerNumber">20</span><span class="disneyAbandonmentModal__offerPercent">%</span><span class="disneyAbandonmentModal__offerOff">OFF</span></div>');
		parts.push('<div class="disneyAbandonmentModal__couponWrap">');
		parts.push('<span class="disneyAbandonmentModal__couponLabel">Cupom:</span>');
		parts.push('<strong class="disneyAbandonmentModal__coupon">HOTELENCANTADO20</strong>');
		parts.push('</div>');
		parts.push('<span class="disneyAbandonmentModal__copyFeedback" aria-live="polite"></span>');
		parts.push('</div>');
		parts.push('<button type="button" class="disneyAbandonmentModal__ctaPrimary">Eu quero</button>');
		parts.push('<button type="button" class="disneyAbandonmentModal__ctaSecondary">Continuar navegando</button>');
		parts.push('<span class="disneyAbandonmentModal__legal">*Consulte condicoes.</span>');
		parts.push('</div>');
		parts.push('<div class="disneyAbandonmentModal__heroMask">');
		parts.push('<div class="disneyAbandonmentModal__heroImage"></div>');
		parts.push('<span class="disneyAbandonmentModal__copyright">© 2026 Disney</span>');
		parts.push('</div>');
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
			'.disneyAbandonmentModal { position: fixed; inset: 0px; background: ' + OVERLAY_OPACITY + '; z-index: 99999; display: flex; justify-content: center; align-items: center; padding: 16px; box-sizing: border-box; }',
			'.disneyAbandonmentModal__card { position: relative; width: 360px; max-width: 100%; min-height: 532px; border-radius: 20px; overflow: hidden; background: #0150B5; background-image: linear-gradient(180deg, rgba(1,80,181,0.95) 0%, rgba(0,97,160,0.98) 100%), url("' + ASSET_BG + '"); background-size: cover; background-position: center; box-shadow: 0px 16px 48px rgba(0, 0, 0, 0.36); }',
			'.disneyAbandonmentModal__close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 999px; border: none; background: rgba(255,255,255,0.2); color: #FFFFFF; font-size: 20px; cursor: pointer; z-index: 6; }',
			'.disneyAbandonmentModal__bgLayer { position: absolute; background-image: url("' + ASSET_GLOW + '"); background-repeat: no-repeat; background-size: contain; mix-blend-mode: plus-lighter; opacity: 0.7; pointer-events: none; }',
			'.disneyAbandonmentModal__bgLayer--g1 { width: 290px; height: 274px; left: -188px; top: -112px; transform: rotate(164.96deg); }',
			'.disneyAbandonmentModal__bgLayer--g2 { width: 290px; height: 274px; left: -94px; top: 170px; transform: rotate(-120deg); }',
			'.disneyAbandonmentModal__bgLayer--g3 { width: 548px; height: 548px; left: -48px; top: -288px; transform: rotate(45deg); opacity: 0.35; }',
			'.disneyAbandonmentModal__frame { position: relative; z-index: 4; display: flex; flex-direction: column; gap: 16px; width: 319px; margin: 32px auto 16px; }',
			'.disneyAbandonmentModal__brandRow { display: flex; align-items: center; gap: 12px; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }',
			'.disneyAbandonmentModal__divider { width: 1px; height: 18px; background: #FFFFFF; opacity: 0.75; }',
			'.disneyAbandonmentModal__title { margin: 0px; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 26px; line-height: 30px; letter-spacing: -0.025em; font-weight: 700; }',
			'.disneyAbandonmentModal__tag { width: 100%; min-height: 32px; border-radius: 20px; background: #FFFFFF; color: #0061A0; display: flex; align-items: center; justify-content: center; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 100%; font-weight: 300; text-align: center; }',
			'.disneyAbandonmentModal__offerCard { position: relative; width: 100%; min-height: 183px; border: 1px solid rgba(255,255,255,0.9); border-radius: 20px; padding: 18px 14px 12px; box-sizing: border-box; overflow: hidden; }',
			'.disneyAbandonmentModal__offerCard:before { content: ""; position: absolute; inset: 0px; background-image: url("' + ASSET_SHINE_1 + '"); background-repeat: no-repeat; background-size: 140px auto; background-position: 108% -10%; mix-blend-mode: screen; opacity: 0.55; pointer-events: none; }',
			'.disneyAbandonmentModal__offerCard:after { content: ""; position: absolute; width: 160px; height: 105px; right: -8px; top: 8px; background-image: url("' + ASSET_SHINE_2 + '"); background-repeat: no-repeat; background-size: contain; mix-blend-mode: screen; opacity: 0.7; pointer-events: none; }',
			'.disneyAbandonmentModal__offerKicker { margin: 0px; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 120%; font-weight: 300; position: relative; z-index: 2; }',
			'.disneyAbandonmentModal__offerValue { display: flex; align-items: baseline; gap: 4px; margin-top: 2px; position: relative; z-index: 2; }',
			'.disneyAbandonmentModal__offerNumber { color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 106px; line-height: 100%; font-weight: 700; letter-spacing: -0.03em; }',
			'.disneyAbandonmentModal__offerPercent { color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 56px; line-height: 100%; font-weight: 700; }',
			'.disneyAbandonmentModal__offerOff { color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 36px; line-height: 100%; font-weight: 700; letter-spacing: -0.05em; }',
			'.disneyAbandonmentModal__couponWrap { margin-top: -8px; width: 100%; min-height: 34px; border-radius: 7.9px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 2; }',
			'.disneyAbandonmentModal__couponWrap:hover { cursor: copy; box-shadow: 0px 0px 0px 2px rgba(33, 111, 183, 0.32) inset; }',
			'.disneyAbandonmentModal__couponLabel { color: #216FB7; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 13px; line-height: 16px; font-weight: 500; }',
			'.disneyAbandonmentModal__coupon { color: #216FB7; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 21.55px; line-height: 120%; font-weight: 700; }',
			'.disneyAbandonmentModal__copyFeedback { min-height: 16px; margin-top: -8px; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 12px; line-height: 120%; font-weight: 700; opacity: 0; transform: translateY(4px); transition: opacity 0.2s ease, transform 0.2s ease; }',
			'.disneyAbandonmentModal__copyFeedback.is-visible { opacity: 1; transform: translateY(0px); }',
			'.disneyAbandonmentModal__ctaPrimary { width: 100%; min-height: 43px; border: none; border-radius: 27px; background: #FFFFFF; color: #0061A0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; cursor: pointer; }',
			'.disneyAbandonmentModal__ctaPrimary.is-pulsing { animation: disney-modal-cta-pulse 0.4s ease-in-out 4; }',
			'.disneyAbandonmentModal__ctaSecondary { width: 100%; min-height: 43px; border: 1px solid rgba(255,255,255,0.75); border-radius: 27px; background: transparent; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; }',
			'.disneyAbandonmentModal__legal { display: inline-block; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 10px; line-height: 120%; opacity: 0.9; }',
			'.disneyAbandonmentModal__heroMask { position: absolute; width: 224px; height: 224px; right: -84px; top: 138px; border-radius: 50%; overflow: hidden; z-index: 3; background: rgba(217, 217, 217, 0.18); box-shadow: 0px 0px 0px 8px rgba(255,255,255,0.08); pointer-events: none; }',
			'.disneyAbandonmentModal__heroImage { position: absolute; width: 363px; height: 233px; left: -66px; top: -4px; background-image: linear-gradient(179.61deg, rgba(0,0,0,0) 86.46%, rgba(0,0,0,0.6) 99.66%), url("' + ASSET_HERO + '"); background-size: cover; background-position: center; }',
			'.disneyAbandonmentModal__copyright { position: absolute; left: 88px; bottom: 10px; color: #FFFFFF; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 7px; line-height: 100%; }',
			'@keyframes disney-modal-cta-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }',
			'@media screen and (max-width: 420px) { .disneyAbandonmentModal { padding: 8px; } .disneyAbandonmentModal__card { width: 100%; min-height: 520px; border-radius: 16px; } .disneyAbandonmentModal__frame { width: calc(100% - 24px); margin-top: 24px; } .disneyAbandonmentModal__heroMask { right: -102px; top: 144px; transform: scale(0.92); } .disneyAbandonmentModal__title { font-size: 22px; line-height: 26px; } .disneyAbandonmentModal__offerNumber { font-size: 90px; } .disneyAbandonmentModal__offerPercent { font-size: 48px; } .disneyAbandonmentModal__offerOff { font-size: 30px; } }'
		].join('\n');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
