<script>
(function () {
	const SCRIPT_KEY = 'bookingFlowAbandonmentModalResponsavelInjected';
	const STORAGE_KEY = 'at_bf_abandonment_modal_responsavel_state';
	const STYLE_ID = 'at-bf-abandonment-modal-responsavel-style';
	const MODAL_WRAPPER_CLASS = 'abandonmentModalInject';
	const EXPERIMENT_NAME = 'BF_abandono_modal_responsavel';
	const TARGET_STEP = 'Responsável';
	const NEXT_STEP = 'Resumo';
	const MAXIMUM_MINUTES_OF_INACTIVITY = 5;
	const MINUTES_TO_MILLISECONDS = 60 * 1000;
	const MAXIMUM_INACTIVITY_TIME = MAXIMUM_MINUTES_OF_INACTIVITY * MINUTES_TO_MILLISECONDS;
	const SELECTORS = {
		buttonGoHome: 'header a.azul-logo',
		activeBreadcrumb: '#hotel-recommendation .css-r1ir45',
		checkboxFillPrincipalPassenger: "input[aria-label='Utilizar os dados do passageiro principal']",
		main: 'main',
	};
	const MODAL_CONFIG = {
		identifier: 'responsavel',
		variant: 'assistencia_preenchimento',
		loggedIn: {
			title: 'Nao perca sua tarifa!',
			description: 'Os voos selecionados podem mudar de preco a qualquer momento. Finalize adicionando os passageiros e garanta o valor atual.',
			continueButtonText: 'Continuar e garantir tarifa',
			giveUpButtonText: 'Desistir mesmo assim',
			icon: 'travel',
		},
		loggedOutWithCheckbox: {
			title: 'Finalize sua compra com mais rapidez',
			description: 'Preencha automaticamente os dados do passageiro principal e avance para a proxima etapa mais rapido.',
			continueButtonText: 'Voltar ao fluxo',
			giveUpButtonText: 'Desistir mesmo assim',
			icon: 'credential',
		},
		loggedOutWithoutCheckbox: {
			title: 'Voce pode perder essa oferta!',
			description: 'Os voos selecionados podem mudar de preco a qualquer momento. Finalize adicionando os passageiros e garanta o valor atual.',
			continueButtonText: 'Continuar e garantir tarifa',
			giveUpButtonText: 'Desistir mesmo assim',
			icon: 'travel',
		},
	};
	const LISTENERS_TO_RESET = ['keydown', 'click', 'scroll'];
	const BUTTON_GO_HOME_FLAG = 'data-abandonment-go-home-listener';
	const TRACKING_LISTENER_FLAG = 'data-analytics-added';
	let inactivityTimeout = null;
	let headerObserver = null;
	let stepObserver = null;
	let debounceTimer = null;
	const iconTravel = '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="54" fill="#E8F6FB"/><path d="M87 34L72 88L60 78L45 86L33 79L48 67L33 58L39 48L57 53L70 33L87 34Z" fill="#026CB6"/><path d="M57 53L60 78" stroke="#B2DEF0" stroke-width="4" stroke-linecap="round"/></svg>';
	const iconCredential = '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="54" fill="#E8F6FB"/><rect x="26" y="34" width="68" height="52" rx="8" fill="#B2DEF0" stroke="#026CB6" stroke-width="4"/><circle cx="46" cy="57" r="10" fill="white" stroke="#026CB6" stroke-width="4"/><path d="M34 78C36.5 70.5 42 67 46 67C50 67 55.5 70.5 58 78" stroke="#026CB6" stroke-width="4" stroke-linecap="round"/><path d="M66 50H84" stroke="white" stroke-width="5" stroke-linecap="round"/><path d="M66 62H84" stroke="white" stroke-width="5" stroke-linecap="round"/><path d="M66 74H84" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>';

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

		if (currentStep !== TARGET_STEP) {
			if (!isTriggeredByInactivity) {
				redirectToHome();
			}
			return;
		}

		if (checkIfModalIsOpen() || shouldThrottle(state, isTriggeredByInactivity)) {
			return;
		}

		appendResponsibleModal(isTriggeredByInactivity);
		persistLastExposure(getTriggerName(isTriggeredByInactivity));
	}

	function appendResponsibleModal(isTriggeredByInactivity) {
		const checkboxFillPrincipalPassenger = document.querySelector(SELECTORS.checkboxFillPrincipalPassenger);
		const responsibleModalVariant = getResponsibleModalVariant(checkboxFillPrincipalPassenger);
		const responsibleContent = MODAL_CONFIG[responsibleModalVariant];
		const modalContext = { trigger: getTriggerName(isTriggeredByInactivity), variant: responsibleModalVariant };
		const giveUpText = isTriggeredByInactivity ? 'Voltar' : responsibleContent.giveUpButtonText;
		const modalNode = createBaseModalNode();

		removeModal();
		modalNode.innerHTML = buildDefaultModalMarkup(getIcon(responsibleContent.icon), responsibleContent.title, responsibleContent.description, responsibleContent.continueButtonText, giveUpText);
		trackModalView(modalContext);

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__button--continue'), function () {
			if (responsibleModalVariant === 'loggedOutWithCheckbox' && checkboxFillPrincipalPassenger && !checkboxFillPrincipalPassenger.checked) {
				checkboxFillPrincipalPassenger.click();
			}

			trackModalAction(modalContext, 'continuar');
			persistRetentionIntent('continuar');
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

	function getResponsibleModalVariant(checkboxFillPrincipalPassenger) {
		if (!checkboxFillPrincipalPassenger) {
			return 'loggedIn';
		}

		return checkboxFillPrincipalPassenger.checked ? 'loggedOutWithoutCheckbox' : 'loggedOutWithCheckbox';
	}

	function getIcon(iconName) {
		return iconName === 'credential' ? iconCredential : iconTravel;
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
		if (!state.pendingRetention || getCurrentStep() !== NEXT_STEP) {
			return;
		}

		analyticsEvent(buildTrackingLabel('retencao_sucesso', 'responsavel|to:resumo|decision:' + state.pendingRetention.decision), 'AT_BF_reached_resumo');
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
		analyticsEvent(buildTrackingLabel('modal_view', 'responsavel|trigger:' + modalContext.trigger + '|variant:' + modalContext.variant), 'AT_BF_step_responsavel');
	}

	function trackModalAction(modalContext, actionName) {
		analyticsEvent(buildTrackingLabel('modal_click', 'responsavel|trigger:' + modalContext.trigger + '|variant:' + modalContext.variant + '|action:' + actionName), 'AT_BF_step_responsavel');
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
			console.log('[Tracking Modal Responsavel] Falha ao salvar estado.');
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
			s.eVar84 = eventContext || 'AT_BF_step_responsavel';
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