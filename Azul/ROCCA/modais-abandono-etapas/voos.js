<script>
(function () {
	const SCRIPT_KEY = 'bookingFlowAbandonmentModalVoosInjected';
	const STORAGE_KEY = 'at_bf_abandonment_modal_voos_state';
	const STYLE_ID = 'at-bf-abandonment-modal-voos-style';
	const MODAL_WRAPPER_CLASS = 'abandonmentModalInject';
	const EXPERIMENT_NAME = 'BF_abandono_modal_voos';
	const TARGET_STEP = 'Voos';
	const NEXT_STEP = 'Viajantes';
	const MAXIMUM_MINUTES_OF_INACTIVITY = 5;
	const MINUTES_TO_MILLISECONDS = 60 * 1000;
	const MAXIMUM_INACTIVITY_TIME = MAXIMUM_MINUTES_OF_INACTIVITY * MINUTES_TO_MILLISECONDS;
	const SELECTORS = {
		buttonGoHome: 'header a.azul-logo',
		activeBreadcrumb: '#hotel-recommendation .css-r1ir45',
		freezeTariffButton: '.fare-hold button.css-1uzd50e',
		labelOrderTariffsOnFlightsStep: '.css-tntsk8',
		inputOrderTariffsOnFlightsStep: '#sort-filter',
		wrapperOrderTariffsOnFlightsStep: '.sort-filter',
		main: 'main',
	};
	const MODAL_CONFIG = {
		identifier: 'voos',
		variant: 'beneficio_pontos',
		title: 'Voce sabia? Comprando uma passagem voce acumula Pontos Azul!',
		description: 'Cada compra rende pontos para voce usar em proximas viagens. Nao perca essa chance de viajar mais e ganhar mais.',
		continueButtonText: 'Continuar e garantir pontos',
		giveUpButtonText: 'Desistir mesmo assim',
	};
	const LISTENERS_TO_RESET = ['keydown', 'click', 'scroll'];
	const BUTTON_GO_HOME_FLAG = 'data-abandonment-go-home-listener';
	const TRACKING_LISTENER_FLAG = 'data-analytics-added';
	let inactivityTimeout = null;
	let headerObserver = null;
	let stepObserver = null;
	let debounceTimer = null;
	const iconCoin = '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">'
		+ '<circle cx="60" cy="60" r="54" fill="#E8F6FB"/>'
		+ '<circle cx="60" cy="60" r="38" fill="#15B7EC"/>'
		+ '<circle cx="60" cy="60" r="26" fill="#B2DEF0"/>'
		+ '<path d="M53 43H66.5C72.299 43 77 47.701 77 53.5C77 59.299 72.299 64 66.5 64H53.5C49.91 64 47 66.91 47 70.5C47 74.09 49.91 77 53.5 77H68" stroke="#026CB6" stroke-width="6" stroke-linecap="round"/>'
		+ '<path d="M60 34V86" stroke="#026CB6" stroke-width="6" stroke-linecap="round"/>'
		+ '</svg>';

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

		if (checkWhichModalShowOnFlightsPage() === 'orderModal') {
			appendLargeModal(isTriggeredByInactivity);
			persistLastExposure(getTriggerName(isTriggeredByInactivity), 'order_modal');
			return;
		}

		appendDefaultModal(isTriggeredByInactivity);
		persistLastExposure(getTriggerName(isTriggeredByInactivity), 'default_modal');
	}

	function appendDefaultModal(isTriggeredByInactivity) {
		const modalNode = createBaseModalNode();
		const modalContext = buildModalContext(getTriggerName(isTriggeredByInactivity), 'default_modal');
		const giveUpText = isTriggeredByInactivity ? 'Voltar' : MODAL_CONFIG.giveUpButtonText;
		const showFreezeWrapper = !!document.querySelector(SELECTORS.freezeTariffButton);

		removeModal();
		modalNode.innerHTML = buildDefaultModalMarkup(iconCoin, MODAL_CONFIG.title, MODAL_CONFIG.description, MODAL_CONFIG.continueButtonText, giveUpText, showFreezeWrapper);
		trackModalView(modalContext);

		if (showFreezeWrapper) {
			bindTrackedClick(modalNode.querySelector('.abandonmentModal__freezeTariff__button'), function () {
				const freezeTariffButton = document.querySelector(SELECTORS.freezeTariffButton);
				trackModalAction(modalContext, 'congelar_tarifa');
				persistRetentionIntent('congelar_tarifa');
				if (freezeTariffButton) {
					freezeTariffButton.click();
				}
				removeModal();
			});
		}

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__button--continue'), function () {
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

	function appendLargeModal(isTriggeredByInactivity) {
		const modalNode = createBaseModalNode();
		const modalContext = buildModalContext(getTriggerName(isTriggeredByInactivity), 'order_modal');
		const giveUpText = isTriggeredByInactivity ? 'Voltar' : MODAL_CONFIG.giveUpButtonText;

		removeModal();
		modalNode.innerHTML = buildLargeModalMarkup(giveUpText);
		trackModalView(modalContext);

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__actionButtons__button--primary'), function () {
			trackModalAction(modalContext, 'mais_barato');
			persistRetentionIntent('mais_barato');
			orderFlights('Menor preco');
			removeModal();
		});

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__actionButtons__button--secondary'), function () {
			trackModalAction(modalContext, 'mais_rapido');
			persistRetentionIntent('mais_rapido');
			orderFlights('Mais rapido');
			removeModal();
		});

		bindTrackedClick(modalNode.querySelector('.abandonmentModal__button--continue'), function () {
			trackModalAction(modalContext, 'ver_sugestoes');
			persistRetentionIntent('mais_barato');
			orderFlights('Menor preco');
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

	function checkWhichModalShowOnFlightsPage() {
		const orderedLabels = document.querySelectorAll(SELECTORS.labelOrderTariffsOnFlightsStep);
		const orderedLabelsArray = Array.from(orderedLabels).map(function (label) {
			return label.textContent || '';
		});

		return orderedLabelsArray.indexOf('Selecione') >= 0 ? 'orderModal' : 'defaultModal';
	}

	function orderFlights(label) {
		const allOptions = ['Mais cedo', 'Menor preco', 'Maior preco', 'Mais rapido', 'Mais tarde', 'Voo direto', 'Duracao'];
		const keySteps = { 'Mais cedo': 0, 'Menor preco': 1, 'Maior preco': 2, 'Mais rapido': 3, 'Mais tarde': 4, 'Voo direto': 5, Duracao: 6 };
		const wrapper = document.querySelector(SELECTORS.wrapperOrderTariffsOnFlightsStep);
		const input = wrapper ? wrapper.querySelector(SELECTORS.inputOrderTariffsOnFlightsStep) : null;
		const labelNode = wrapper ? wrapper.querySelector(SELECTORS.labelOrderTariffsOnFlightsStep) : null;
		const currentLabel = labelNode ? (labelNode.textContent || '').trim() : '';

		if (!wrapper || !input) {
			return;
		}

		input.focus();
		simulateKey(input, 'ArrowDown');

		setTimeout(function () {
			if (currentLabel === 'Selecione') {
				for (let i = 0; i < (keySteps[label] || 0); i = i + 1) {
					simulateKey(input, 'ArrowDown');
				}
			} else {
				const currentSelection = wrapper.querySelector('.css-pdoeiw-singleValue');
				const currentSelectionText = currentSelection ? (currentSelection.textContent || '').trim() : '';
				const currentIndex = allOptions.indexOf(currentSelectionText);
				const targetIndex = allOptions.indexOf(label);
				const delta = targetIndex - (currentIndex >= 0 ? currentIndex : -1);
				const direction = delta > 0 ? 'ArrowDown' : 'ArrowUp';

				for (let i = 0; i < Math.abs(delta); i = i + 1) {
					simulateKey(input, direction);
				}
			}

			simulateKey(input, 'Enter');
		}, 150);
	}

	function simulateKey(element, key) {
		const code = key === 'Enter' ? 13 : key === 'ArrowUp' ? 38 : 40;
		element.dispatchEvent(new KeyboardEvent('keydown', { key: key, code: key, keyCode: code, which: code, bubbles: true, cancelable: true }));
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

		if (!state.pendingRetention || currentStep !== NEXT_STEP) {
			return;
		}

		trackRetentionSuccess(state.pendingRetention);
		clearRetentionIntent();
	}

	function persistLastExposure(trigger, format) {
		const state = getState();
		state.lastExposure = { trigger: trigger, format: format, timestamp: new Date().getTime() };
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
		if (!state.lastExposure) {
			return false;
		}

		if (state.lastExposure.trigger !== getTriggerName(isTriggeredByInactivity)) {
			return false;
		}

		return (new Date().getTime() - state.lastExposure.timestamp) < 30000;
	}

	function trackModalView(modalContext) {
		analyticsEvent(buildTrackingLabel('modal_view', 'voos|trigger:' + modalContext.trigger + '|format:' + modalContext.format), buildTrackingContext(modalContext));
	}

	function trackModalAction(modalContext, actionName) {
		analyticsEvent(buildTrackingLabel('modal_click', 'voos|trigger:' + modalContext.trigger + '|action:' + actionName), buildTrackingContext(modalContext));
	}

	function trackRetentionSuccess(pendingRetention) {
		analyticsEvent(buildTrackingLabel('retencao_sucesso', 'voos|to:viajantes|decision:' + pendingRetention.decision), 'AT_BF_reached_viajantes');
	}

	function buildModalContext(trigger, format) {
		return { trigger: trigger, format: format };
	}

	function buildTrackingLabel(eventType, detail) {
		return 'AT_' + EXPERIMENT_NAME + '_' + eventType + ' ' + sanitizeForTracking(detail);
	}

	function buildTrackingContext(modalContext) {
		return 'AT_BF_step_voos|trigger:' + sanitizeForTracking(modalContext.trigger) + '|format:' + sanitizeForTracking(modalContext.format);
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
			console.log('[Tracking Modal Voos] Falha ao salvar estado.');
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
			s.eVar84 = eventContext || 'AT_BF_step_voos';
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

	function buildDefaultModalMarkup(icon, title, description, continueButtonText, giveUpButtonText, showFreezeWrapper) {
		const htmlParts = [];
		htmlParts.push('<div class="abandonmentModal__modal">');
		htmlParts.push('<div class="abandonmentModal__icon">' + icon + '</div>');
		htmlParts.push('<h3 class="abandonmentModal__title">' + title + '</h3>');
		htmlParts.push('<p class="abandonmentModal__subtitle">' + description + '</p>');
		htmlParts.push('<div class="abandonmentModal__buttons">');
		htmlParts.push('<button class="abandonmentModal__button abandonmentModal__button--continue">' + continueButtonText + '</button>');
		htmlParts.push('<button class="abandonmentModal__button abandonmentModal__button--giveup">' + giveUpButtonText + '</button>');
		htmlParts.push('</div>');
		if (showFreezeWrapper) {
			htmlParts.push('<div class="abandonmentModal__freezeTariffWrapper"><div class="abandonmentModal__freezeTariff__text"><span class="abandonmentModal__freezeTariff__clock"></span><span>Precisa de mais tempo?</span></div><button class="abandonmentModal__freezeTariff__button">Congelar tarifa</button></div>');
		}
		htmlParts.push('</div>');
		return htmlParts.join('');
	}

	function buildLargeModalMarkup(giveUpButtonText) {
		return '<div class="abandonmentModal__modal abandonmentModal__modal--large">'
			+ '<h3 class="abandonmentModal__title">Em duvida sobre o voo ideal?</h3>'
			+ '<p class="abandonmentModal__subtitle">Criamos duas ordenacoes para ajudar sua escolha. Veja a opcao que mais faz sentido para voce.</p>'
			+ '<div class="abandonmentModal__actionButtons">'
			+ '<button class="abandonmentModal__actionButtons__button abandonmentModal__actionButtons__button--primary"><span class="abandonmentModal__actionButtons__button__badge">Mais barato</span><span class="abandonmentModal__actionButtons__button__title">Voos com menor preco</span><span class="abandonmentModal__actionButtons__button__description">Lista priorizando economia para reter o usuario no fluxo.</span></button>'
			+ '<button class="abandonmentModal__actionButtons__button abandonmentModal__actionButtons__button--secondary"><span class="abandonmentModal__actionButtons__button__badge">Mais rapido</span><span class="abandonmentModal__actionButtons__button__title">Voos com menor duracao</span><span class="abandonmentModal__actionButtons__button__description">Lista priorizando chegada mais rapida ao destino.</span></button>'
			+ '</div>'
			+ '<div class="abandonmentModal__buttons"><button class="abandonmentModal__button abandonmentModal__button--continue">Ver sugestoes</button><button class="abandonmentModal__button abandonmentModal__button--giveup">' + giveUpButtonText + '</button></div>'
			+ '</div>';
	}

	function injectCustomStyle() {
		if (document.getElementById(STYLE_ID)) {
			return;
		}

		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.innerHTML = '.abandonmentModalInject{align-items:center;background:rgba(0,0,0,.58);display:flex;justify-content:center;inset:0;position:fixed;z-index:1089;padding:16px;box-sizing:border-box}.abandonmentModal__modal{background:linear-gradient(180deg,#FFFFFF 0%,#F6FBFE 100%);border-radius:16px;box-shadow:0 16px 48px rgba(4,30,66,.18);width:384px;max-width:100%;padding:24px;display:flex;flex-direction:column;gap:20px;align-items:center;box-sizing:border-box}.abandonmentModal__modal--large{width:560px}.abandonmentModal__icon{width:120px;height:120px;display:flex;align-items:center;justify-content:center}.abandonmentModal__title{font-family:Arial,sans-serif;font-size:24px;line-height:1.2;font-weight:700;text-align:center;color:#026CB6;margin:0}.abandonmentModal__subtitle{font-family:Arial,sans-serif;font-size:16px;line-height:1.45;font-weight:400;text-align:center;color:#425466;margin:0}.abandonmentModal__buttons{width:100%;display:flex;flex-direction:column;gap:8px}.abandonmentModal__button{width:100%;min-height:48px;border-radius:10px;border:none;padding:12px 16px;font-family:Arial,sans-serif;font-size:16px;line-height:1.3;cursor:pointer}.abandonmentModal__button--continue{background:#026CB6;color:#FFFFFF;font-weight:700}.abandonmentModal__button--giveup{background:transparent;color:#026CB6;font-weight:600}.abandonmentModal__freezeTariffWrapper{display:flex;justify-content:space-between;align-items:center;width:100%;gap:12px;padding:12px 14px;border-radius:12px;background:#E8F6FB;box-sizing:border-box}.abandonmentModal__freezeTariff__text{display:flex;align-items:center;gap:8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#026CB6}.abandonmentModal__freezeTariff__clock{width:18px;height:18px;border:2px solid #026CB6;border-radius:50%;position:relative;display:inline-block;box-sizing:border-box}.abandonmentModal__freezeTariff__clock:before{content:"";position:absolute;width:2px;height:5px;background:#026CB6;top:2px;left:7px}.abandonmentModal__freezeTariff__clock:after{content:"";position:absolute;width:5px;height:2px;background:#026CB6;top:8px;left:7px}.abandonmentModal__freezeTariff__button{background:white;border:1px solid #026CB6;border-radius:8px;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#026CB6;cursor:pointer}.abandonmentModal__actionButtons{display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%}.abandonmentModal__actionButtons__button{display:flex;flex-direction:column;gap:12px;padding:20px;border-radius:14px;border:2px solid transparent;cursor:pointer;text-align:left;font-family:Arial,sans-serif}.abandonmentModal__actionButtons__button--primary{background:linear-gradient(135deg,#026CB6 0%,#15B7EC 100%);color:#FFFFFF}.abandonmentModal__actionButtons__button--secondary{background:#F6FBFE;border-color:#B2DEF0;color:#026CB6}.abandonmentModal__actionButtons__button__badge{display:inline-flex;width:fit-content;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.18);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.abandonmentModal__actionButtons__button--secondary .abandonmentModal__actionButtons__button__badge{background:#DDF1FA}.abandonmentModal__actionButtons__button__title{font-size:22px;line-height:1.15;font-weight:700}.abandonmentModal__actionButtons__button__description{font-size:13px;line-height:1.4}@media (max-width:768px){.abandonmentModal__modal{width:100%;padding:20px}.abandonmentModal__modal--large{width:100%}.abandonmentModal__actionButtons{grid-template-columns:1fr}.abandonmentModal__freezeTariffWrapper{flex-direction:column;align-items:stretch}}';
		document.head.appendChild(style);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
</script>