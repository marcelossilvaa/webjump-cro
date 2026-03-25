<script>
(function () {
	const SCRIPT_KEY = 'bookingFlowAbandonmentModalConclusaoInjected';
	const STORAGE_KEY = 'at_bf_abandonment_modal_conclusao_state';
	const STYLE_ID = 'at-bf-abandonment-modal-conclusao-style';
	const MODAL_WRAPPER_CLASS = 'abandonmentModalInject';
	const EXPERIMENT_NAME = 'BF_abandono_modal_conclusao';
	const TARGET_STEPS = ['Pagamento', 'Conclusao', 'Conclusão'];
	const NEXT_STEPS = ['Conclusao', 'Conclusão'];
	const MAXIMUM_MINUTES_OF_INACTIVITY = 5;
	const MINUTES_TO_MILLISECONDS = 60 * 1000;
	const MAXIMUM_INACTIVITY_TIME = MAXIMUM_MINUTES_OF_INACTIVITY * MINUTES_TO_MILLISECONDS;
	const SELECTORS = {
		buttonGoHome: 'header a.azul-logo',
		activeBreadcrumb: '#hotel-recommendation .css-r1ir45',
		main: 'main',
	};
	const MODAL_CONFIG = {
		identifier: 'conclusao',
		variant: 'ultima_etapa',
		title: 'Voce esta na ultima etapa!',
		description: 'Escolha um metodo de pagamento e garanta sua passagem.',
		continueButtonText: 'Continuar e finalizar pagamento',
		giveUpButtonText: 'Desistir mesmo assim',
	};
	const LISTENERS_TO_RESET = ['keydown', 'click', 'scroll'];
	const BUTTON_GO_HOME_FLAG = 'data-abandonment-go-home-listener';
	const TRACKING_LISTENER_FLAG = 'data-analytics-added';
	let inactivityTimeout = null;
	let headerObserver = null;
	let stepObserver = null;
	let debounceTimer = null;
	const iconPayment = '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="54" fill="#E8F6FB"/><rect x="20" y="33" width="80" height="54" rx="8" fill="white" stroke="#026CB6" stroke-width="4"/><rect x="20" y="43" width="80" height="12" fill="#B2DEF0"/><rect x="30" y="66" width="22" height="10" rx="4" fill="#15B7EC"/><path d="M69 71H88" stroke="#026CB6" stroke-width="4" stroke-linecap="round"/></svg>';

	function init() {
		if (window[SCRIPT_KEY]) {
			return;
		}

		window[SCRIPT_KEY] = true;
		injectCustomStyle();
		addListenerToGoHomeButtons();
		addListenersToResetInactivityTimer();
		observeHeaderChanges();
		observeStepChanges();
		resetInactivityTimer();
		clearExpiredRetention();
	}

	function addListenerToGoHomeButtons() {
		const goHomeButtons = document.querySelectorAll(SELECTORS.buttonGoHome);
		goHomeButtons.forEach(function (button) {
			if (button.getAttribute(BUTTON_GO_HOME_FLAG) === 'true') {
				return;
			}

			button.setAttribute(BUTTON_GO_HOME_FLAG, 'true');
			button.addEventListener('click', function (event) {
				if (event._atAbandonmentModalTriggered) {
					return;
				}

				event.preventDefault();
				showModalAbandonment(false);
			});
		});
	}

	function addListenersToResetInactivityTimer() {
		LISTENERS_TO_RESET.forEach(function (listenerName) {
			document.addEventListener(listenerName, function () {
				resetInactivityTimer();
			});
		});
	}

	function resetInactivityTimer() {
		clearTimeout(inactivityTimeout);
		inactivityTimeout = setTimeout(function () {
			showModalAbandonment(true);
		}, MAXIMUM_INACTIVITY_TIME);
	}

	function showModalAbandonment(isTriggeredByInactivity) {
		const currentStep = getCurrentStep();
		const state = getState();

		if (TARGET_STEPS.indexOf(currentStep) < 0) {
			if (!isTriggeredByInactivity) {
				redirectToHome();
			}
			return;
		}

		if (checkIfModalIsOpen() || shouldThrottle(state, isTriggeredByInactivity)) {
			return;
		}

		appendDefaultModal(isTriggeredByInactivity);
		persistLastExposure(getTriggerName(isTriggeredByInactivity));
	}

	function appendDefaultModal(isTriggeredByInactivity) {
		const modalNode = createBaseModalNode();
		const modalContext = { trigger: getTriggerName(isTriggeredByInactivity) };
		const giveUpText = isTriggeredByInactivity ? 'Voltar' : MODAL_CONFIG.giveUpButtonText;

		removeModal();
		modalNode.innerHTML = buildDefaultModalMarkup(iconPayment, MODAL_CONFIG.title, MODAL_CONFIG.description, MODAL_CONFIG.continueButtonText, giveUpText);
		trackModalView(modalContext);

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__button--continue'), function () {
			trackModalAction(modalContext, 'continuar_pagamento');
			persistRetentionIntent('continuar_pagamento');
			removeModal();
		});

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__button--giveup'), function () {
			trackModalAction(modalContext, 'desistir');
			clearRetentionIntent();
			if (!isTriggeredByInactivity) {
				redirectToHome();
				return;
			}
			removeModal();
		});

		document.body.appendChild(modalNode);
	}

	function observeHeaderChanges() {
		const mainElement = document.querySelector(SELECTORS.main);
		if (!mainElement || headerObserver) {
			return;
		}

		headerObserver = new MutationObserver(function () {
			addListenerToGoHomeButtons();
		});
		headerObserver.observe(mainElement, { childList: true, subtree: true });
	}

	function observeStepChanges() {
		if (stepObserver) {
			return;
		}

		stepObserver = new MutationObserver(function () {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(function () {
				evaluateRetentionAdvance();
			}, 150);
		});

		stepObserver.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
	}

	function evaluateRetentionAdvance() {
		const state = getState();
		const currentStep = getCurrentStep();
		if (!state.pendingRetention || NEXT_STEPS.indexOf(currentStep) < 0) {
			return;
		}

		analyticsEvent(buildTrackingLabel('retencao_sucesso', 'conclusao|to:' + currentStep + '|decision:' + state.pendingRetention.decision), 'AT_BF_reached_' + sanitizeForTracking(currentStep));
		clearRetentionIntent();
	}

	function persistLastExposure(trigger) {
		const state = getState();
		state.lastExposure = { trigger: trigger, timestamp: new Date().getTime() };
		saveState(state);
	}

	function persistRetentionIntent(decision) {
		const state = getState();
		state.pendingRetention = { decision: decision, timestamp: new Date().getTime() };
		saveState(state);
	}

	function clearRetentionIntent() {
		const state = getState();
		state.pendingRetention = null;
		saveState(state);
	}

	function clearExpiredRetention() {
		const state = getState();
		if (!state.pendingRetention) {
			return;
		}

		if ((new Date().getTime() - state.pendingRetention.timestamp) > 30 * MINUTES_TO_MILLISECONDS) {
			clearRetentionIntent();
		}
	}

	function shouldThrottle(state, isTriggeredByInactivity) {
		if (!state.lastExposure || state.lastExposure.trigger !== getTriggerName(isTriggeredByInactivity)) {
			return false;
		}

		return (new Date().getTime() - state.lastExposure.timestamp) < 30000;
	}

	function trackModalView(modalContext) {
		analyticsEvent(buildTrackingLabel('modal_view', 'conclusao|trigger:' + modalContext.trigger), 'AT_BF_step_conclusao');
	}

	function trackModalAction(modalContext, actionName) {
		analyticsEvent(buildTrackingLabel('modal_click', 'conclusao|trigger:' + modalContext.trigger + '|action:' + actionName), 'AT_BF_step_conclusao');
	}

	function buildTrackingLabel(eventType, detail) {
		return 'AT_' + EXPERIMENT_NAME + '_' + eventType + ' ' + sanitizeForTracking(detail);
	}

	function sanitizeForTracking(value) {
		return String(value || 'na').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_|:]/g, '');
	}

	function getTriggerName(isTriggeredByInactivity) {
		return isTriggeredByInactivity ? 'inatividade' : 'redirecionamento';
	}

	function getCurrentStep() {
		const activeBreadcrumb = document.querySelector(SELECTORS.activeBreadcrumb);
		return activeBreadcrumb ? (activeBreadcrumb.getAttribute('aria-label') || activeBreadcrumb.textContent || '') : '';
	}

	function getState() {
		try {
			return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
		} catch (error) {
			return {};
		}
	}

	function saveState(state) {
		try {
			window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.log('[Tracking Modal Conclusao] Falha ao salvar estado.');
		}
	}

	function analyticsEvent(eventLabel, eventContext) {
		if (!eventLabel) {
			return;
		}

		(function () {
			var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
			if (!s || typeof s.tl !== 'function') {
				return;
			}

			s.linkTrackVars = 'events,eVar82,eVar84';
			s.linkTrackEvents = 'event90';
			s.events = 'event90';
			s.eVar82 = eventLabel;
			s.eVar84 = eventContext || 'AT_BF_step_conclusao';
			s.tl(true, 'o', 'target_activity_action');
		})();
	}

	function createBaseModalNode() {
		const modalNode = document.createElement('div');
		modalNode.className = MODAL_WRAPPER_CLASS;
		return modalNode;
	}

	function bindTrackedClick(element, callback) {
		if (!element || element.getAttribute(TRACKING_LISTENER_FLAG) === 'true') {
			return;
		}

		element.setAttribute(TRACKING_LISTENER_FLAG, 'true');
		element.addEventListener('click', callback);
	}

	function checkIfModalIsOpen() {
		return !!document.querySelector('.' + MODAL_WRAPPER_CLASS);
	}

	function removeModal() {
		const abandonmentModal = document.querySelector('.' + MODAL_WRAPPER_CLASS);
		if (abandonmentModal) {
			abandonmentModal.remove();
		}
	}

	function redirectToHome() {
		const buttonGoHome = document.querySelectorAll(SELECTORS.buttonGoHome);
		const targetButton = buttonGoHome[1] || buttonGoHome[0];
		if (!targetButton) {
			return;
		}

		const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
		clickEvent._atAbandonmentModalTriggered = true;
		targetButton.dispatchEvent(clickEvent);
	}

	function buildDefaultModalMarkup(icon, title, description, continueButtonText, giveUpButtonText) {
		return '<div class="abandonmentModal__modal"><div class="abandonmentModal__icon">' + icon + '</div><h3 class="abandonmentModal__title">' + title + '</h3><p class="abandonmentModal__subtitle">' + description + '</p><div class="abandonmentModal__buttons"><button class="abandonmentModal__button abandonmentModal__button--continue">' + continueButtonText + '</button><button class="abandonmentModal__button abandonmentModal__button--giveup">' + giveUpButtonText + '</button></div></div>';
	}

	function injectCustomStyle() {
		if (document.getElementById(STYLE_ID)) {
			return;
		}

		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.innerHTML = '.abandonmentModalInject{align-items:center;background:rgba(0,0,0,.58);display:flex;justify-content:center;inset:0;position:fixed;z-index:1089;padding:16px;box-sizing:border-box}.abandonmentModal__modal{background:linear-gradient(180deg,#FFFFFF 0%,#F6FBFE 100%);border-radius:16px;box-shadow:0 16px 48px rgba(4,30,66,.18);width:384px;max-width:100%;padding:24px;display:flex;flex-direction:column;gap:20px;align-items:center;box-sizing:border-box}.abandonmentModal__icon{width:120px;height:120px;display:flex;align-items:center;justify-content:center}.abandonmentModal__title{font-family:Arial,sans-serif;font-size:24px;line-height:1.2;font-weight:700;text-align:center;color:#026CB6;margin:0}.abandonmentModal__subtitle{font-family:Arial,sans-serif;font-size:16px;line-height:1.45;font-weight:400;text-align:center;color:#425466;margin:0}.abandonmentModal__buttons{width:100%;display:flex;flex-direction:column;gap:8px}.abandonmentModal__button{width:100%;min-height:48px;border-radius:10px;border:none;padding:12px 16px;font-family:Arial,sans-serif;font-size:16px;line-height:1.3;cursor:pointer}.abandonmentModal__button--continue{background:#026CB6;color:#FFFFFF;font-weight:700}.abandonmentModal__button--giveup{background:transparent;color:#026CB6;font-weight:600}@media (max-width:768px){.abandonmentModal__modal{width:100%;padding:20px}}';
		document.head.appendChild(style);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
</script>